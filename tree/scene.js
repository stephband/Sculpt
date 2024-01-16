
import nothing  from '../../../../fn/modules/nothing.js';
import mix      from '../../../../fn/modules/mix.js';
import Camera   from './camera.js';
import Group    from './group.js';
import Object3D from './object.js';
import Path     from './path.js';
import { group, groupEnd, log } from '../modules/log.js';

const assign = Object.assign;
const create = Object.create;
const define = Object.defineProperties;

/** Scene() **/

export default function Scene(objects = []) {
    Object3D.call(this);

    if (window.DEBUG) { group('create', 'Scene', this.position); }

    // Create children
    let n = -1;
    while (objects[++n]) this.create(objects[n]);

    if (window.DEBUG) { groupEnd(); }
}

assign(Scene, {
    from: (object) => new Scene(object),
    nodes: Group.nodes
});

mix(Scene.prototype, Object3D.prototype);

assign(Scene.prototype, {
    changed: function() {
        // Notify change up the tree to renderers
        this.push('render');
    }
});
