
import get           from '../../../../fn/modules/get.js';
import overload      from '../../../../fn/modules/overload.js';
import Privates      from '../../../../fn/modules/privates.js';
import mix           from '../../../../fn/modules/mix.js';
import { idTransform, translateFromTransform, multiplyMM, transformFromTranslation, transformFromScale, transformFromRotation, transformFromRotationX, transformFromRotationY, transformFromRotationZ, rotateFromTransform } from '../modules/matrix.js';
import Node          from './node.js';


const assign = Object.assign;
const define = Object.defineProperties;

const invalidateEvent = { type: 'invalidate' };

/**
Object3D()
A base class for 3D objects, not directly accessible.
**/

const translationBuffer = Float32Array.from(idTransform);

function decomposeTranslation(transform) {
    translationBuffer[12] = transform[12];
    translationBuffer[13] = transform[13];
    translationBuffer[14] = transform[14];

    transform[12] = 0;
    transform[13] = 0;
    transform[14] = 0;

    return translationBuffer;
}

export default function Object3D(transform = idTransform) {
    Node.apply(this, arguments);

    const privates = Privates(this);

    // Transform.
    if (window.DEBUG && transform.length !== 16) {
        throw new Error('new Object3D(transform) requires a `transform` array of length 16');
    }
    privates.transform = Float32Array.from(transform);

    // Position array is a buffer view for transform[12, 13, 14]
    privates.position  = new Float32Array(
        privates.transform.buffer,
        12 * privates.transform.BYTES_PER_ELEMENT,
        3
    );
}

assign(Object3D, {
    from: (data) => new Object3D(data.transform)
});

mix(Object3D.prototype, Node.prototype);

define(Object3D.prototype, {
    transform: {
        get: function() {
            return Privates(this).transform;
        },

        set: function(vector) {
            const transform = Privates(this).transform;
            let n = vector.length;
            while (n--) transform[n] = vector[n];
            //this.invalidate();
            this.push(invalidateEvent)
            this.changed();
        },

        enumerable: true
    },

    rotation: {
        get: function() {
            const transform = Privates(this).transform;
            //const translation = decomposeTranslation(Float32Array.from(this.transform));
            console.log('HELLO', transform);
            return rotateFromTransform(transform);
        },

        set: function(vector) {
            const transform   = Privates(this).transform;
            const translation = decomposeTranslation(transform);
            const mx          = transformFromRotationX(vector[0]);
            const my          = transformFromRotationY(vector[1]);
            const mz          = transformFromRotationZ(vector[2]);
            const rotation    = multiplyMM(mz, multiplyMM(my, mx));

            multiplyMM(translation, rotation, transform);
            //this.invalidate();
            this.push(invalidateEvent);
            this.changed();
        }
    },

    /*
    // Scaling not implemented. Do we really need worry about scaling??
    scale: {
        get: function() {
            return scaleFromTransform(this.transform);
        },

        set: function(vector) {
            /*
            const scale     = transformFromScale(vector);
            const rotate    = transformFromRotation([0,0,0]);
            const translate = transformFromTranslation([0,0,0]);

            // Pass transform in as buffer to overwrite existing values
            multiplyMM(rotate,    scale,          this.transform);
            multiplyMM(translate, this.transform, this.transform);

            invalidate(this);
            this.changed();
        }
    }*/
});

assign(Object3D.prototype, Node.prototpye, {
    push: overload((type) => typeof type === 'string' ? type : type.type, {
        invalidate: function() {
            const privates = Privates(this);
            // If we are already invalid, don't propagate
            if (privates.sceneTransform === null) { return 0; }
            privates.sceneTransform = null;
            console.log('Invalidated', this);
            return Node.prototype.push.apply(this, arguments);
        },

        default: Node.prototype.push
    }),

    getSceneTransform: function() {
        const privates  = Privates(this);

        if (privates.sceneTransform) {
            return privates.sceneTransform;
        }

        const transform = Float32Array.from(this.transform);

        // Walk up the tree collecting transforms, using transform as the
        // output buffer
        let object = this;
        while (object = object.input) {
            multiplyMM(object.transform, transform, transform);
        }

        return privates.sceneTransform = transform;
    },

    getRenderables: function() {
        this.renderables = this.renderables || [];
        this.renderables.length = 0;

        // No child objects?
        if (!this[0]) {
            // Create renderable instruction – make sure we give it a fresh
            // transform array that may be mutated.
            this.renderables.push({
                object:    this,
                transform: Float32Array.from(this.transform)
            });
        }

        // Child objects!
        else {
            // Iterate through objects project them into renderables
            let n = -1;
            let object, renderables, renderable;
            while (object = this[++n]) {
                // Get child renderables
                renderables = object.getRenderables();

                // Transform them to this coordinate space
                for(renderable of renderables) {
                    multiplyMM(this.transform, renderable.transform, renderable.transform);
                }

                // Push them to this.renderables
                this.renderables.push.apply(this.renderables, renderables);
            }
        }

        return this.renderables;
    },

    toJSON: function() {
        const json = Node.prototype.toJSON.apply(this);
        json.transform = Array.from(this.transform);
        json.data      = this.data;
        return json;
    }
});
