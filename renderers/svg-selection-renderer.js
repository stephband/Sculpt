
import get              from '../../fn/modules/get.js';
import isDefined        from '../../fn/modules/is-defined.js';
import overload         from '../../fn/modules/overload.js';
import assignAttributes from '../../dom/modules/assign.js';
import create           from '../../dom/modules/create.js';
import { multiplyMP, multiplyMM, normaliseW } from '../modules/matrix.js';
import { ORIGIN3D }     from '../../fn/modules/vector/consts.js';
import getScale         from './svg/get-scale.js';

const assign = Object.assign;

const tags = {
    path:   'path',
    camera: 'circle',
    point:  'circle'
};

function updateCircle(element, i, circle, object, v, position, scale, selected, linked) {
    // There are no more children, make one
    if (!circle) {
        circle = create('circle');
        element.appendChild(circle);
    }
    // The next child is not the correct tag, make one and insert it
    else if (circle.tagName.toLowerCase() !== 'circle') {
        circle = create('circle');
        element.children[i].before(circle);
    }

    assignAttributes(circle, {
        // Invert Y
        cx:    position[0],
        cy:   -position[1],
        // Scale radius to 3.5px - DOM to SVG scaling
        r:     scale[0] * (v === undefined ? 8 : 3.5),
        class: (
            selected ?
                linked ? 'white-fg transparent-bg ' :
                'white-fg transparent-bg' :
            linked ? 'slate-fg shockmagenta-bg' :
            'slate-fg shockblue-bg'
        ),
        // dataset
        data: { objectId: object.id, vertexIndex: v }
    });

    return circle;
}

/* SVGSelectionRenderer */

export default function SVGSelectionRenderer(element) {
    this.element = element;
}

assign(SVGSelectionRenderer.prototype, {
    push: function(renderables) {
        const element  = this.element;
        const children = element.children;
        const scale    = getScale(this.element);

        // Loop through renderables, creating and inserting children as necessary
        let n = -1, m = -1, renderable, object, child, tag;
        while (renderable = renderables[++n]) {
            object = renderable.object;

            // Render only selected objects
            if (!object.selected) { continue; }

            // If object is orthographic camera don't render it
            if (object.type === 'camera' && object.projection === 'orthographic') { continue; }

            // If no tag for this object, ignore (this simply echoes SVGSceneRenderer)
            tag = tags[object.type];
            if (!tag) { continue; }

            if(object.type === 'camera') {
                child = children[++m];
                child = updateCircle(element, m, child, object, undefined, normaliseW(multiplyMP(renderable.transform, ORIGIN3D)), scale, object.selected);
                continue;
            }

            // Loop through vertices and render them
            // TODO: object.vertices
            let v = -1, vertex;
            while (vertex = object[++v]) {
                child = children[++m];
                child = updateCircle(element, m, child, object, v, normaliseW(multiplyMP(renderable.transform, vertex.position)), scale, vertex.selected, vertex.link);
            }
        }

        // Remove unused children
        ++m;
        while (children[m]) {
            children[m].remove();
        }

        return this;
    }
});

