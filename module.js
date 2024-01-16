
import '../../../bolt/classes/device.js';
import '../../../bolt/classes/switch.js';
import { Data } from '../../../literal/module.js';


// SCENE

import Stream               from '../../../fn/modules/stream.js';
import toCartesian          from '../../../fn/modules/vector/to-cartesian-3d.js';
import toPolar              from '../../../fn/modules/vector/to-polar-3d.js';
import mag                  from '../../../fn/modules/vector/mag.js';
import { transformFromTranslation, transformFromRotation, multiplyMM, multiplyMP, invertMatrix, idTransform, transformFromPerspective, transformFromRotationY, normaliseW, flipZTransform, logVector } from './modules/matrix.js';
import ReadoutRenderer      from './renderers/readout-renderer.js';
import SVGSceneRenderer     from './renderers/svg-scene-renderer.js';
import SVGSelectionRenderer from './renderers/svg-selection-renderer.js';
import Scene                from './tree/scene.js';

const data = window.location.hash ?
    JSON.parse(localStorage.getItem(window.location.hash.replace(/^#/, ''))) :
    [
        /* xz */
        { type: "camera", projection: 'orthographic', transform: transformFromRotation([-Math.PI / 2, 0, 0]) },
        /* xy */
        { type: "camera", projection: 'orthographic', transform: transformFromRotation([0, Math.PI / 2, 0]) },
        /* zy */
        {
            // Cruncher logo, data has been cleaned, duplicate points removed
            // TODO: Make points shared between objects match exactly, round to 32bit
            type: "group",
            0: { type: "camera", projection: 'perspective', fov: Math.PI / 4, aspect: 1, transform: multiplyMM(transformFromTranslation(18, 2.8, -34), transformFromRotation([-0.09, Math.PI / 6, 0])) }
        },
        /* Perspective */
        { type: "camera", projection: 'perspective', fov: Math.PI / 6, aspect: 1, transform: multiplyMM(transformFromTranslation(0, 0, -50), transformFromRotation([0, 0, 0])) },

        { type: "path", data: { class: "p2" },                  0: { type: "vertex", position: [7.136997070097569,7.13894706929705,-1.029613973716792]}, 1: { type: "vertex", position: [9.750003337538867,2.6130008944604164,-1.0295021340038844]}, 2: { type: "vertex", position: [9.7335794456011,5.620168771890075,-1.279664059536259]}, id: "3"},
        { type: "path", data: { class: "p8" },                  0: { type: "vertex", position: [2.620817981815323,7.160309426437237,-0.5848071740697591]}, 1: { type: "vertex", position: [4.87724854780997,8.449345384225994,-0.9610256104295729]}, 2: { type: "vertex", position: [7.136997070097569,7.13894706929705,-1.029613973716792]}, 3: { type: "vertex", position: [5.620168771890076,9.733579445601098,-1.279664059536259]}, 4: { type: "vertex", position: [0,9.754516100806413,-0.9607359798384749]}, 5: { type: "vertex", position: [0,7.163619591602073,-0.5158353172773573]}, id: "9"},
        { type: "path", data: { class: "p10" },                 0: { type: "vertex", position: [-9.733579445601098,5.620168771890076,-1.279664059536259]}, 1: { type: "vertex", position: [-9.750003337538867,2.6130008944604177,-1.0295021340038844]}, 2: { type: "vertex", position: [-7.13699707009757,7.138947069297049,-1.029613973716792]}, id: "11"},
        { type: "path", data: { class: "p4" },                  0: { type: "vertex", position: [5.620168771890076,-9.733579445601098,-1.279664059536259]}, 1: { type: "vertex", position: [7.137010536583838,-7.13701053658384,-1.029333665944641]}, 2: { type: "vertex", position: [4.877259432873719,-8.447413337737284,-0.9606938433478405]}, id: "5"},
        { type: "path", data: { class: "p5" },                  0: { type: "vertex", position: [2.613000894460417,-9.750003337538866,-1.0295021340038844]}, 1: { type: "vertex", position: [5.620168771890076,-9.733579445601098,-1.279664059536259]}, 2: { type: "vertex", position: [4.877259432873719,-8.447413337737284,-0.9606938433478405]}, id: "6"},
        { type: "path", data: { class: "p3" },                  0: { type: "vertex", position: [4.900843383645713,0.20387508475966146,-0.24117998707374966]}, 1: { type: "vertex", position: [4.87724854780997,8.449345384225994,-0.9610256104295729]}, 2: { type: "vertex", position: [1.314934463449323,2.27856554039502,-0.0692571011109635]}, id: "4"},
        { type: "path", data: { class: "p6" },                  0: { type: "vertex", position: [4.87724854780997,8.449345384225994,-0.9610256104295729]}, 1: { type: "vertex", position: [4.900843383645713,0.20387508475966146,-0.24117998707374966]}, 2: { type: "vertex", position: [9.750010069561364,-2.611052696628532,-1.0293995599514716]}, 3: { type: "vertex", position: [9.750003337538867,2.6130008944604164,-1.0295021340038844]}, 4: { type: "vertex", position: [7.136997070097569,7.13894706929705,-1.029613973716792]}, id: "7"},
        { type: "path", data: { class: "p7" },                  0: { type: "vertex", position: [9.733593937856288,-5.618230420930648,-1.2794433940840833]}, 1: { type: "vertex", position: [9.750010069561364,-2.611052696628532,-1.0293995599514716]}, 2: { type: "vertex", position: [4.877259432873719,-8.447413337737284,-0.9606938433478405]}, id: "8"},
        { type: "path", data: { class: "p1" },                  0: { type: "vertex", position: [4.877270315438436,-8.445481278213196,-0.9603621521376482]}, 1: { type: "vertex", position: [9.750010069561364,-2.611052696628532,-1.0293995599514716]}, 2: { type: "vertex", position: [7.161085868815149,-1.1074247545763312,-0.5278617847135365]}, id: "2"},
        { type: "path", data: { class: "purple-fg purple-bg" }, 0: { type: "vertex", position: [4.87724854780997,8.449345384225994,-0.9610256104295729]}, 1: { type: "vertex", position: [2.620817981815323,7.160309426437237,-0.5848071740697591]}, 2: { type: "vertex", position: [0,7.163619591602073,-0.5158353172773573]}, 3: { type: "vertex", position: [0,3.035659343866362,-0.09223735381441855]}, 4: { type: "vertex", position: [1.314934463449323,2.27856554039502,-0.0692571011109635]}, id: "10"},
        { type: "path", data: { class: "p13" },                 0: { type: "vertex", position: [-5.648640369709159,4.541217283718378,-0.5280866798569264]}, 1: { type: "vertex", position: [-7.13699707009757,7.138947069297049,-1.029613973716792]}, 2: { type: "vertex", position: [-9.750003337538867,2.6130008944604177,-1.0295021340038844]}, 3: { type: "vertex", position: [-9.754516100806413,0,-0.9607359798384749]}, 4: { type: "vertex", position: [-6.714442887901684,0,-0.45288851300101385]}, id: "14"},
        { type: "path", data: { class: "teal-fg teal-bg" },     0: { type: "vertex", position: [-5.641456980759946,6.280444314569611,-0.7178533102927318]}, 1: { type: "vertex", position: [-5.620168771890075,9.733579445601098,-1.279664059536259]}, 2: { type: "vertex", position: [-7.13699707009757,7.138947069297049,-1.029613973716792]}, 3: { type: "vertex", position: [-6.642269955033281,6.275207417835674,-0.8420706120812866]}, id: "12"},
        { type: "path", data: { class: "p14" },                 0: { type: "vertex", position: [0,3.035659343866362,-0.09223735381441855]}, 1: { type: "vertex", position: [0,7.163619591602073,-0.5158353172773573]}, 2: { type: "vertex", position: [-5.620168771890075,9.733579445601098,-1.279664059536259]}, 3: { type: "vertex", position: [-5.641456980759946,6.280444314569611,-0.7178533102927318]}, id: "15"},
        { type: "path", data: { class: "p15" },                 0: { type: "vertex", position: [0,11.240325057998835,-1.2798286888220858]}, 1: { type: "vertex", position: [-5.620168771890075,9.733579445601098,-1.279664059536259]}, 2: { type: "vertex", position: [0,7.163619591602073,-0.5158353172773573]}, id: "16"},
        { type: "path", data: { class: "p16" },                 0: { type: "vertex", position: [0,-11.238411812678919,-1.2793873198556867]}, 1: { type: "vertex", position: [2.613000894460417,-9.750003337538866,-1.0295021340038844]}, 2: { type: "vertex", position: [-7.13701053658384,-7.1370105365838405,-1.029333665944641]}, id: "17"},
        { type: "path", data: { class: "p17" },                 0: { type: "vertex", position: [-8.010055811118278,-5.624206259974178,-0.9672832707789141]}, 1: { type: "vertex", position: [-6.716388593242105,0,-0.45315222676050837]}, 2: { type: "vertex", position: [-9.754516100806413,0,-0.9607359798384749]}, 3: { type: "vertex", position: [-9.750010069561364,-2.6110526966285317,-1.0293995599514716]}, id: "18"},
        { type: "path", data: { class: "lime-fg lime-bg" },     0: { type: "vertex", position: [-5.648640369709159,4.541217283718378,-0.5280866798569264]}, 1: { type: "vertex", position: [-6.714442887901684,0,-0.45288851300101385]}, 2: { type: "vertex", position: [-3.1478790662798226,-2.620290612180587,-0.16803300599307391]}, 3: { type: "vertex", position: [-1.816962180675965,-2.621448675359707,-0.1018371552975097]}, 4: { type: "vertex", position: [-1.7112321598119182,-2.294071553692813,-0.08197800191034332]}, id: "19"},
        { type: "path", data: { class: "p12" },                 0: { type: "vertex", position: [0,3.035659343866362,-0.09223735381441855]}, 1: { type: "vertex", position: [-5.641456980759946,6.280444314569611,-0.7178533102927318]}, 2: { type: "vertex", position: [-6.642269955033281,6.275207417835674,-0.8420706120812866]}, 3: { type: "vertex", position: [-1.7112321598119182,-2.294071553692813,-0.08197800191034332]}, id: "13"},
        { type: "path", data: { class: "p21" },                 0: { type: "vertex", position: [-8.013923520206658,-5.624182451011633,-0.9679125309760934]}, 1: { type: "vertex", position: [-3.1478790662798226,-2.620290612180587,-0.16803300599307391]}, 2: { type: "vertex", position: [-6.716388593242105,0,-0.45315222676050837]}, id: "22"},
        { type: "path", data: { class: "p22" },                 0: { type: "vertex", position: [-3.1478790662798226,-2.620290612180587,-0.16803300599307391]}, 1: { type: "vertex", position: [-8.010055811118278,-5.624206259974178,-0.9672832707789141]}, 2: { type: "vertex", position: [-7.13701053658384,-7.1370105365838405,-1.029333665944641]}, 3: { type: "vertex", position: [-2.20607373539662,-3.8081735059024275,-0.19406608422109173]}, 4: { type: "vertex", position: [-1.816962180675965,-2.621448675359707,-0.1018371552975097]}, id: "23" },
        { type: "path", data: { class: "p19" },                 0: { type: "vertex", position: [-2.188438681104458,-3.8062360932112487,-0.19314000118274777]}, 1: { type: "vertex", position: [-7.13701053658384,-7.1370105365838405,-1.029333665944641]}, 2: { type: "vertex", position: [2.613000894460417,-9.750003337538866,-1.0295021340038844]}, 3: { type: "vertex", position: [4.877259432873719,-8.447413337737284,-0.9606938433478405]}, id: "20"},
        { type: "path", data: { class: "sun-fg sun-bg" },       0: { type: "vertex", position: [0,3.035659343866362,-0.09223735381441855]}, 1: { type: "vertex", position: [-2.1943243638024854,-3.800358013448806,-0.1929501018576829]}, 2: { type: "vertex", position: [4.877259432873719,-8.447413337737284,-0.9606938433478405]}, 3: { type: "vertex", position: [7.161085868815149,-1.1074247545763312,-0.5278617847135365]}, id: "21"},
    ] ;

const scene = new Scene(data);
const [camera1, camera2, camera3, camera4] = scene.findAll(matches({ type: 'camera' }));
const selections = Stream.of();
const selection  = new FlaggedSet('selected', () => {
    scene.push('render');
    selections.push(selection);
});

const scope = Data({
    SVGSceneRenderer:     (element) => new SVGSceneRenderer(element),
    SVGSelectionRenderer: (element) => new SVGSelectionRenderer(element),
    scene,
    cameras: [Data(camera1), Data(camera2), Data(camera3), Data(camera4)],
    camera: camera1,
    selections
});

// USER INPUT

import get      from '../../../../fn/modules/get.js';
import matches  from '../../../../fn/modules/matches.js';
import noop     from '../../../../fn/modules/noop.js';
import overload from '../../../../fn/modules/overload.js';
import add      from '../../../../fn/modules/vector/add.js';
import multiply from '../../../../fn/modules/vector/multiply.js';
import delegate from '../../../../dom/modules/delegate.js';
import events   from '../../../../dom/modules/events.js';
import gestures from '../../../../dom/modules/gestures.js';
import FlaggedSet from './modules/flagged-set.js';

const undos     = [];


function clientToSVGXY(svg, [x, y]) {
    // TODO: SVGPoint deprecated, use DOMPoint (see MDN)
    const point = svg.createSVGPoint();
    point.x = x;
    point.y = y;
    const svgXY = point.matrixTransform(svg.getScreenCTM().inverse());
    return Float64Array.of(svgXY.x, svgXY.y);
}

function svgToClientXY(svg, [x, y]) {
    // TODO: SVGPoint deprecated, use DOMPoint (see MDN)
    const point = svg.createSVGPoint();
    point.x = x;
    point.y = y;
    const pageXY = point.matrixTransform(svg.getScreenCTM());
    return Float64Array.of(pageXY.x, pageXY.y);
}

export function getProperty(name, element) {
    return element[name].baseVal.value;
}

export function setProperty(name, element, value) {
    return element[name].baseVal.value = value;
}

gestures({ select: 'circle', threshold: 1 }, document.body)
.each((gesture) => gesture
    .scan(overload((d, e) => e.type, {
        pointerdown: (d, e) => {
            const element    = e.target;
            const svg        = element.closest('svg');
            const view       = element.closest('[data-camera-index]');
            const camera     = scope.cameras[view.dataset.cameraIndex];
            const p0         = clientToSVGXY(svg, [e.clientX, e.clientY]);

            return {
                svg,
                camera,
                p0,
                p1: p0
            };
        },

        pointermove: (data, e) => {
            data.p2 = clientToSVGXY(data.svg, [e.clientX, e.clientY]);
            return data;
        },

        default: function(data, e) {
            delete data.p2;
            return data;
        }
    }), null)
    .filter(get('p2'))
    .each((data) => {
        const { p1, p2, camera } = data;
        // updateSelection takes diff translate dx, dy, dz
        updateSelection(camera, [p2[0] - p1[0], -(p2[1] - p1[1]), 0]);
        // Sneaky.
        data.p1 = data.p2;
    })
);

events('click', document.body)
.each(delegate({
    '[data-vertex-index]': (element, e) => {
        if (!e.shiftKey) {
            // Clear selection of vertices
            for (let object of selection) {
                if (object.type === 'vertex') {
                    selection.delete(object);
                }
            }
        }

        const id     = element.dataset.objectId;
        const i      = element.dataset.vertexIndex;
        const object = scene.find((object) => object.id === id);
        // TODO: gonna make this .vertices[i]
        const vertex = object[i];
        selection.add(vertex);
    },

    '[data-object-id]': function(path, e) {
        // Find object
        const id     = path.dataset.objectId;
        const object = scene.find((object) => object.id === id);

        // If selection contains just this object this is a second click, so
        // select all vertices... if there are any
        if (selection.size === 1 && selection.has(object)) {
            let n = -1;
            while (object[++n]) selection.add(object[n]);
            return;
        }

        if (!e.shiftKey) {
            // Clear selection
            selection.clear();
        }

        // Push points to selection
        selection.add(object);
    },

    '*': () => {
        // Clear selection
        selection.clear();
    }
}));





// KEYBOARD


import Privates    from '../../../../fn/modules/privates.js';
import keyboard    from '../../../../dom/modules/keyboard.js';
import toFrameRate from './modules/to-frame-rate.js';
import { log } from './modules/log.js';
import { link, unlink, purgeLinks } from './tree/vertex.js';

const assign = Object.assign;
const linkProximity = 0.1;

function deleteSelection() {
    // Find and delete vertices
    let vertFlag = false;
    for (let object of selection) {
        if (object.type === 'vertex') {
            object.stop();
            selection.delete(object);
            vertFlag = true;
        }
    }

    // If vertices were found and deleted, do no more
    if (vertFlag) { return; }

    // Delete all objects
    for (let object of selection) {
        object.stop();
        selection.delete(object);
    }
}

function orderSelectionDown() {
    // Don't order vertices
    let vertFlag = false;
    for (let object of selection) {
        if (object.type === 'vertex') {
            return;
        }
    }

    // Bump all objects up in order
    for (let object of selection) {
        let i = -1;
        while (object.input[++i] !== object);
        // Already in first place
        if (i === 0) { continue; }
        // Swap with previous output
        object.input[i] = object.input[i - 1];
        object.input[i - 1] = object;
    }
}

function orderSelectionUp() {
    // Don't order vertices
    let vertFlag = false;
    for (let object of selection) {
        if (object.type === 'vertex') {
            return;
        }
    }

    // Bump all object down in order
    for (let object of selection) {
        let i = -1;
        while (object.input[++i] && object.input[i] !== object);
        // Already in last place
        if (!object.input[i + 1]) { continue; }
        // Swap with previous output
        object.input[i] = object.input[i + 1];
        object.input[i + 1] = object;
    }
}

function linkSelection() {
    const verts = [];

    // Populate verts from vertices
    for (let object of selection) {
        if (object.type === 'vertex') {
            verts.push(object);
        }
    }

    // If no vertices found
    if (!verts.length) {
        // Populate verts from objects
        for (let object of selection) {
            let n = -1, vert;
            while (vert = object[++n]) (vert.type === 'vertex' && verts.push(vert));
        }
    }

    let n = -1, vert1, vert2, pos1, pos2;
    while (vert1 = verts[++n]) {
        let m = n;
        pos1 = vert1.position;
        while (vert2 = verts[++m]) {
            pos2 = vert2.position;
            if (mag([pos2[0] - pos1[0], pos2[1] - pos1[1], pos2[2] - pos1[2]]) < linkProximity) {
                // Create link
                link(vert1, vert2);
                verts.splice(m, 1);
                --m;
            }
        }
    };

    // TODO: trigger .changed() on verts
    scene.push('render');
}

function unlinkSelection() {
    const verts = [];

    // Populate verts from vertices
    for (let object of selection) {
        if (object.type === 'vertex') {
            verts.push(object);
        }
    }

    // If no vertices found
    if (!verts.length) {
        // Populate verts from objects
        for (let object of selection) {
            let n = -1, vert;
            while (vert = object[++n]) (vert.type === 'vertex' && verts.push(vert));
        }
    }

    let n = -1, vert;
    while (vert = verts[++n]) {
        let m = n;
        unlink(vert);
        vert.changed();
    };

    purgeLinks(scene);
}

function updateSelection(view, translation) {
    const viewTransform = view.getSceneTransform();
    const viewInversion = invertMatrix(viewTransform);

    // Move vertices
    let vertFlag = false;
    for (let object of selection) {
        if (object.type === 'vertex') {
            const objectTransform = object.getSceneTransform();
            const objectInversion = invertMatrix(objectTransform);
            const positionW = multiplyMP(viewInversion, multiplyMP(objectTransform, object.position));
            const position  = new Float32Array(positionW.buffer, 0, 3);

            if (!view.projection || view.projection === 'orthographic') {
                // XYZ translation
                add(translation, position, position);
            }
            else {
                // Ray-space translation
                position[0] += translation[0];
                position[1] += translation[1];

                // Change meaning of z to distance-from-source
                //logVector('translation', translation);
                if (translation[2]) {
                    // Let's try some easy maths, no trig
                    const d     = mag(position);
                    const dt    = d + translation[2];

                    if (dt > 0.001) {
                        const scale = dt / d ;
                        position[0] *= scale;
                        position[1] *= scale;
                        position[2] *= scale;
                    }
                }
            }

            // Apply the translation
            object.position = multiplyMP(objectInversion, multiplyMP(viewTransform, position));
            vertFlag = true;
        }
    }

    // If vertices were found, do no more
    if (vertFlag) { return; }

    const lensTransform = view.projection === 'perspective' ?
        transformFromPerspective(view.fov, view.aspect, view.near, view.far) :
        idTransform ;
    const lensInversion = view.projection === 'perspective' ?
        invertMatrix(lensTransform) :
        idTransform ;

    // Move all objects
    for (let object of selection) {
        const objectTransform = object.input.getSceneTransform();
        const objectInversion = invertMatrix(objectTransform);
        const position = normaliseW(multiplyMP(lensTransform, multiplyMP(flipZTransform, multiplyMP(viewInversion, multiplyMP(objectInversion, object.position)))));
        add(translation, position, position);
        object.position = multiplyMP(objectTransform, multiplyMP(viewTransform, multiplyMP(flipZTransform, normaliseW(multiplyMP(lensInversion, position)))));
    }
}

function createPathFromSelection() {
    // Find and delete vertices
    let verts = [];
    for (let object of selection) {
        if (object.type === 'vertex') {
            verts.push(object);
        }
    }

    // If vertices were not found, do no more
    if (!verts.length) { return; }

    const path = scene.create(assign({
        type: 'path',
        data: { class: 'slate-bg' }
    }, verts));

    let v = -1, vert;
    while (vert = verts[++v]) {
        if (!vert.link) {
            link(vert, path[v]);
        }
    }

    path.changed();
}

function updateAngleY(object, n) {
    const transform = Privates(object).transform;
    const t = transformFromRotationY(n);
    multiplyMM(t, transform, transform);
    object.push('invalidate');
    object.changed();
}
/*
events('keydown', document.body)
.each(overload(toModifiedKey, {
    // object order
    'shift-+-down':     orderSelectionUp,
    'shift-_-down':     orderSelectionDown,
    // create path
    'p-down':           createPathFromSelection,
    // Save
    'cmd-s-down': (e) => {
        let n = 0;
        while(localStorage.getItem('scene-' + (++n)));
        localStorage.setItem('scene-' + n, JSON.stringify(scene));
        console.log('Saved to local storage "scene-' + n + '"');
        window.location.hash = 'scene-' + n;
        e.preventDefault();
    },
    // Cut
    'Backspace-down':   deleteSelection,
    'cmd-x-down':       deleteSelection,
    // Copy
    'cmd-c-down': () => console.log('TODO: COPY'),
    // Undo
    'cmd-z-down': () => console.log('TODO: UNDO'),
    // Redo
    'shift-cmd-z-down': () => console.log('TODO: REDO'),
    // Link vertices
    'shift-L-down':     linkSelection,
    'shift-cmd-l-down': unlinkSelection,
    // Ignore
    default: noop
}));
*/
const keys = keyboard({
    // object order
    'shift-underscaore-down': orderSelectionDown,
    'shift-equals-down':      orderSelectionUp,

    // create path
    'P-down':           createPathFromSelection,

    // Save
    'cmd-S-down': (e) => {
        let n = 0;
        while(localStorage.getItem('scene-' + (++n)));
        localStorage.setItem('scene-' + n, JSON.stringify(scene));
        console.log('Saved to local storage "scene-' + n + '"');
        window.location.hash = 'scene-' + n;
        e.preventDefault();
    },

    // Cut
    'Backspace-down':   deleteSelection,
    'cmd-X-down':       deleteSelection,

    // Copy
    'cmd-C-down': () => console.log('TODO: COPY'),

    // Undo
    'cmd-Z-down': () => console.log('TODO: UNDO'),

    // Redo
    'shift-cmd-Z-down': () => console.log('TODO: REDO'),

    // Link vertices
    'shift-L-down':     linkSelection,
    'shift-cmd-L-down': unlinkSelection,

    // X
    'left':        (keys) => updateSelection(scope.camera, [toFrameRate(-6), 0, 0]),
    'right':       (keys) => updateSelection(scope.camera, [toFrameRate(6), 0, 0]),
    'shift-left':  (keys) => updateSelection(scope.camera, [toFrameRate(-36), 0, 0]),
    'shift-right': (keys) => updateSelection(scope.camera, [toFrameRate(36), 0, 0]),
    'opt-left':    (keys) => updateSelection(scope.camera, [toFrameRate(-1), 0, 0]),
    'opt-right':   (keys) => updateSelection(scope.camera, [toFrameRate(1), 0, 0]),

    // Y
    'down':        (keys) => updateSelection(scope.camera, [0, toFrameRate(-6), 0]),
    'up':          (keys) => updateSelection(scope.camera, [0, toFrameRate(6), 0]),
    'shift-down':  (keys) => updateSelection(scope.camera, [0, toFrameRate(-36), 0]),
    'shift-up':    (keys) => updateSelection(scope.camera, [0, toFrameRate(36), 0]),
    'opt-down':    (keys) => updateSelection(scope.camera, [0, toFrameRate(-1), 0]),
    'opt-up':      (keys) => updateSelection(scope.camera, [0, toFrameRate(1), 0]),

    // Z
    "slash":       (keys) => updateSelection(scope.camera, [0, 0, toFrameRate(-6)]),
    "quote":       (keys) => updateSelection(scope.camera, [0, 0, toFrameRate(6)]),
    "shift-slash": (keys) => updateSelection(scope.camera, [0, 0, toFrameRate(-36)]),
    "shift-quote": (keys) => updateSelection(scope.camera, [0, 0, toFrameRate(36)]),
    "opt-slash":   (keys) => updateSelection(scope.camera, [0, 0, toFrameRate(-1)]),
    "opt-quote":   (keys) => updateSelection(scope.camera, [0, 0, toFrameRate(1)]),

    // View position
    "comma":       (keys) => updateAngleY(camera3, toFrameRate(-Math.PI / 3)),
    "period":      (keys) => updateAngleY(camera3, toFrameRate(Math.PI / 3)),
    "opt-comma":   (keys) => updateAngleY(camera3, toFrameRate(-Math.PI / 0.5)),
    "opt-period":  (keys) => updateAngleY(camera3, toFrameRate(Math.PI / 0.5)),

    // Rotate

    ',': (keys) => {
        const rot = camera.rotation;
        rot[1] -= Math.PI / 360;
        // TODO: position must be set back on object due to implementation detail, fix it?
        scope.camera.rotation = rot;
    },

    '.': (keys) => {
        const rot = camera.rotation;
        rot[1] += Math.PI / 360;
        // TODO: position must be set back on object due to implementation detail, fix it
        scope.camera.rotation = rot;
    },

    default: (e, code) => console.log(code, 'no response')
}, document.body);

export default scope;


// DEBUG

window.scene  = scene;
window.camera = scene[0];
