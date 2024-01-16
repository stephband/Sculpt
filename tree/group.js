
import mix      from '../../../../fn/modules/mix.js';
import Object3D from './object.js';
import Camera   from './camera.js';
import Path     from './path.js';
import { group, groupEnd, log } from '../modules/log.js';

const assign = Object.assign;
const create = Object.create;
const define = Object.defineProperties;

/** Group() **/

export default function Group(objects = []) {
    Object3D.call(this);

    if (window.DEBUG) { group('create', 'Group', this.position); }

    // Create children
    let n = -1;
    while (objects[++n]) this.create(objects[n]);

    if (window.DEBUG) { groupEnd(); }
}

assign(Group, {
    from: (object) => new Group(object),

    nodes: {
        'camera': Camera,
        'path':   Path,
        'group':  Group
    }
});

mix(Group.prototype, Object3D.prototype);

assign(Group.prototype, {});
