
import add        from '../../fn/modules/vector/add.js';
import multiply   from '../../fn/modules/vector/multiply.js';
import FlaggedSet from './flagged-set.js';
import { link, unlink, purgeLinks } from '../tree/vertex.js';
import { transformFromTranslation, transformFromRotation, multiplyMM, multiplyMP, invertMatrix, idTransform, transformFromPerspective, transformFromRotationY, normaliseW, flipZTransform, logVector } from './matrix.js';
import { log } from './log.js';


const assign = Object.assign;
const linkProximity = 0.1;
const selection = new FlaggedSet('selected');


export default selection;

export function deleteSelection() {
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

export function orderSelectionDown() {
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

export function orderSelectionUp() {
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

export function linkSelection() {
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
    // Loop through verts
    while (vert1 = verts[++n]) {
        let m = n;
        pos1 = vert1.position;
        // Scan through following verts
        while (vert2 = verts[++m]) {
            pos2 = vert2.position;
            // Are verts within linkProximity?
            if (mag([pos2[0] - pos1[0], pos2[1] - pos1[1], pos2[2] - pos1[2]]) < linkProximity) {
                // Create link
                link(vert1, vert2);
                verts.splice(m, 1);
                --m;
            }
        }
    };

    // TODO: trigger .changed() on verts
    //scene.push('render');
}

export function unlinkSelection() {
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

export function updateSelection(view, translation) {
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

export function createPathFromSelection() {
    // Find and delete vertices
    let verts = [];
    for (let object of selection) {
        if (object.type === 'vertex') {
            verts.push(object);
        }
    }

    // If vertices were not found, do no more
    if (!verts.length) { return; }

    const path = verts[0].getRoot().create(assign({
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
