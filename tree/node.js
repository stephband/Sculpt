
import Stream, { stop, unpipe } from '../../fn/modules/stream/stream.js';
import nothing       from '../../fn/modules/nothing.js';
import overload      from '../../fn/modules/overload.js';
import Privates      from '../../fn/modules/privates.js';
import remove        from '../../fn/modules/remove.js';
import { ORIGIN3D }  from '../../fn/modules/vector/consts.js';
import { translateFromTransform } from '../modules/matrix.js';


/**
Node()
A base class for scene tree nodes - objects and vertices –, providing id,
position properties and tree methods.
**/

const assign  = Object.assign;
const define  = Object.defineProperties;
const properties = {
    status: {
        value:      undefined,
        enumerable: false,
        writable:   true
    }
};

let n = 0;

function createId() {
    return (++n) + '';
}

export default function Node() {
    this.id = createId();
    define(this, properties);
}

define(Node.prototype, {
    position: {
        get: function() {
            return Privates(this).position;
        },

        set: function(vector) {
            if (vector.length > 3 && vector[3] !== 1) {
                throw new Error('Attempting to set non w-normalised vector as position. No no no. ' + vector.join(', '));
            }

            const position = Privates(this).position;
            let n = vector.length;
            while (n--) position[n] = vector[n];
            this.push('invalidate');
            this.changed();
        },

        enumerable: true
    }
});

assign(Node.prototype, {
    create: overload(function toTypeCheck(object) {
        const t = typeof object;

        if (window.DEBUG) {
            // Debug unsupported types
            const type = t === 'object' ? object.type : object ;
            if (!(this.constructor.nodes && this.constructor.nodes[type])) {
                throw new Error(this.constructor.name + ': cannot .create() type "' + type
                    + '", supported types: '
                    + (this.constructor.nodes ?
                        '"' + Object.keys(this.constructor.nodes).join('", "') + '"' :
                        'none'
                    )
                );
            }
        }

        return t;
    }, {
        object: function(data) {
            return this.pipe(this.constructor.nodes[data.type].from(data));
        },

        string: function(type, ...params) {
            // Create object
            return this.pipe(new this.constructor.nodes[type](...params));
        }
    }),

    find: function(fn) {
        let n = -1, node;
        while (node = this[++n]) {
            if (fn(node)) { return node; }
            const object = node.find(fn);
            if (object) { return object; }
        }
    },

    findAll: function(fn) {
        const nodes = [];
        let n = -1, node;
        while (node = this[++n]) {
            if (fn(node)) {
                nodes.push(node);
            }

            const objs = node.findAll(fn);
            if (objs.length) {
                nodes.push.apply(nodes, objs);
            }
        }
        return nodes;
    },

    push: function(value) {
        // Reject undefined
        if (value === undefined) { return; }
        let n = -1;
        while (this[++n]) {
            // TODO: To enable feedback, we need to flatten responses into an
            // array and return it
            this[n].push(value);
        }
    },

    pipe: function(output) {
        if (window.DEBUG) {
            let m = -1;
            while (this[++m]) {
                if (this[m] === output) {
                    throw new Error('Node: cannot .pipe() to the same object twice');
                }
            }
        }

        // Find lowest available output slot
        let n = -1;
        while (this[++n]);

        // Pipe
        if (output.stop) { output.input = this; }
        this[n] = output;

        // If not a memory stream and this is the first output start the pipeline
        //if (this.input && /*!this.memory && */n === 0) {
            //this.input.pipe(this);
        //}

        return output;
    },

    remove: function() {
        // Does input have more than 1 output? ie, is it a multicast or
        // broadcast stream? Don't stop it, unpipe() this from it, and
        // stop `this`.
        if (this.input) {
            unpipe(this.input, this);
        }

        return this;
    },

    stop: function() {
        // Check status
        if (this.status === 'done') { return this; }

        this.remove();
        return stop(this);
    },

    done: Stream.prototype.done,

    changed: function() {
        if (this.input) {
            // Propagate changes up the parent chain,
            this.input.changed();
        }

        return this;
    },

    getRoot: function() {
        // Root is closest object without a parent
        let root = this;
        while (root.input && root.input !== nothing) {
            root = root.input;
        }

        return root;
    },

    toJSON: function() {
        const json = {
            id:   this.id,
            type: this.type
        };

        // Add children [0]-[n]
        let n = -1;
        while(this[++n]) {
            json[n] = this[n];
        }

        return json;
    }
});
