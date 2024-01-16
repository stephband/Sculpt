
import get      from '../../fn/modules/get.js';
import add      from '../../fn/modules/vector/add.js';
import mix      from '../../fn/modules/mix.js';
import { idTransform } from '../modules/matrix.js';
import Object3D from './object.js';
import Vertex   from './vertex.js';
import { group, groupEnd, log } from '../modules/log.js';

const assign = Object.assign;

/** Path() **/

export default function Path(transform = idTransform, verts = [], data) {
    Object3D.apply(this, arguments);

    if (window.DEBUG) { group('create', 'Path', this.position); }

    // Create children
    let n = -1;
    while (verts[++n]) this.create(verts[n]);

    // Data carries misc. data like HTML class n stuff, it's a user side
    // bag of whatever you put in it.
    this.data = data;

    if (window.DEBUG) { groupEnd(); }
}

assign(Path, {
    from: (data) => new Path(data.transform, data, data.data),

    nodes: {
        'vertex': Vertex
    }
});

mix(Path.prototype, Object3D.prototype);

assign(Path.prototype, {
    getRenderables: function() {
        // Don't let path type collapse to vertex renderables, add them to
        // renderables directly
        this.renderables = this.renderables || [];
        this.renderables.length = 0;

        // Create renderable instruction – make sure we give it a fresh
        // transform array that may be mutated.
        this.renderables.push({
            object:    this,
            transform: Float32Array.from(this.transform)
        });

        return this.renderables;
    }

    /*getSnappableVectors: function() {
        return this.data.map((vertex) => add(this.xyz, vertex.xyz));
    }*/
});
