
import get              from '../../fn/modules/get.js';
import isDefined        from '../../fn/modules/is-defined.js';
import overload         from '../../fn/modules/overload.js';
import { ORIGIN3D }     from '../../fn/modules/vector/consts.js';
import add              from '../../fn/modules/vector/add.js';
import mag              from '../../fn/modules/vector/mag.js';
import multiply         from '../../fn/modules/vector/multiply.js';
import subtract         from '../../fn/modules/vector/subtract.js';
import assignAttributes from '../../dom/modules/assign.js';
import create           from '../../dom/modules/create.js';
import { translateFromTransform, multiplyMP, multiplyMM, normaliseW } from '../modules/matrix.js';
import getScale         from './svg/get-scale.js';

const assign = Object.assign;

const tags = {
    path:   'path',
    camera: 'circle',
    point:  'circle'
};

function formatNumber(n, number) {
    return n ?
        number.toFixed(n).replace(/\.?0+$/, '') :
        number.toFixed(0) ;
}

function toPathData(vertices, transform, string = '') {
    let n = -1, vertex, pos;
    while (vertex = vertices[++n]) {
        pos = normaliseW(multiplyMP(transform, vertex.position));
        string += (string ? ' L' : 'M') + formatNumber(4, pos[0]) + ' ' + formatNumber(4, -pos[1]);
    }

    return string + ' Z';
}

const updateElement = overload(get('type'), {
    path: (object, transform, child) => assignAttributes(child, {
        // TODO: We should not be transforming vertices here, this should be
        // done in the .getRenderables() or .capture() steps, no?
        d:     toPathData(object, transform),
        class: object.data ? object.data.class : '',
        data: {
            objectId: object.id
        }
    }),

    camera: (object, transform, child, scale) => {
        // Don't draw orthographic cameras
        if (object.projection === 'orthographic') {
            return;
        }

        const position = translateFromTransform(transform);

        return assignAttributes(child, {
            // Invert Y
            cx:    position[0],
            cy:    -position[1],
            // Scale radius to 3.5px - DOM to SVG scaling
            r:     scale[0] * 8,
            class: 'slate-bg',
            data:  {
                objectId: object.id
            }
        });
    },

    point: (object, transform, child) => {
        const position = translateFromTransform(transform);
        return assignAttributes(child, {
            // Invert Y
            cx:    position[0],
            cy:    -position[1],
            r:     1,
            class: 'blue-bg',
            data:  {
                objectId: object.id
            }
        });
    },

    default: (object) => console.log('Unhandled renderable', object)
});


// Renderable z-sorting

function getZ({ object, transform }) {
    let zmin = 1;
    let v = -1, vert, pos;
    while (vert = object[++v]) {
        if (vert.type !== 'vertex') { continue; }
        pos = normaliseW(multiplyMP(transform, vert.position));
        zmin = pos[2] < zmin ? pos[2] : zmin ;
    }
    return zmin;
}

function getCentre(object) {
    // If there are no vertices
    if (!object[0] || object[0].type !== 'vertex') {
        return ORIGIN3D;
    }

    // If there is only one vertex
    if (!object[1]) {
        return object[0].position;
    }

    const buffer = Float32Array.from(ORIGIN3D);
    const weights = [];
    let total = 0;
    let v = -1, vert1, vert2, diff, mid, length;
    while (vert1 = object[++v]) {
        vert2  = object[v + 1] || object[0];
        diff   =  subtract(vert1, vert2);
        length =  mag(diff);
        mid    =  add(vert1, multiply(0.5, diff));
        total += length;
        add(multiply(mag, mid, mid), buffer, buffer);
    }
    return multiply(1 / total, buffer, buffer);
}

function byCentre(a, b) {
    const axyz = normaliseW(multiplyMP(a.transform, getCentre(a.object)));
    const bxyz = normaliseW(multiplyMP(b.transform, getCentre(b.object)));
    const az = axyz[2];
    const bz = bxyz[2];
    return az === bz ? 0 :
        az < bz ? 1 :
        -1 ;
}

function byZ(a, b) {
    const az = getZ(a);
    const bz = getZ(b);
    return az === bz ? byCentre(a, b) :
        az < bz ? 1 :
        -1 ;
}


/* SVGSceneRenderer */

export default function SVGSceneRenderer(element) {
    this.element = element;
}

assign(SVGSceneRenderer, {
    of: function() {
        return new SVGSceneRenderer(arguments);
    },

    from: function(data) {
        return new SVGSceneRenderer(data);
    }
});

assign(SVGSceneRenderer.prototype, {
    push: function(renderables) {
        const element  = this.element;
        const children = element.children;
        const scale    = getScale(this.element);

        // Sort renderables into z order
        renderables.sort(byZ);

        // Loop through renderables, creating and inserting children as necessary
        let n = -1, m = -1, renderable, child, tag;
        while (renderable = renderables[++n]) {
            // If object is orthographic camera dont render it
            if (renderable.object.type === 'camera' && renderable.object.projection === 'orthographic') { continue; }

            tag = tags[renderable.object.type];

            // If no tag for this object, ignore
            if (!tag) { continue; }

            child = children[++m];

            // There are no more children, make one
            if (!child) {
                child = create(tag);
                element.appendChild(child);
            }
            // The next child is not the correct tag, make one and insert it
            else if (child.tagName.toLowerCase() !== tag) {
                child = create(tag);
                children[m].before(child);
            }

            // Update child from renderable
            updateElement(renderable.object, renderable.transform, child, scale);
        }

        // Remove unused children
        ++m;
        while (children[m]) {
            children[m].remove();
        }

        return this;
    }
});

