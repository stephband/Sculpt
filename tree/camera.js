
import Privates      from '../../fn/modules/privates.js';
import Stream        from '../../fn/modules/stream.js';
import get           from '../../fn/modules/get.js';
import mix           from '../../fn/modules/mix.js';
import noop          from '../../fn/modules/noop.js';
import nothing       from '../../fn/modules/nothing.js';
import overload      from '../../fn/modules/overload.js';
import parseAngle    from '../../fn/modules/parse-angle.js';
import { invertMatrix, multiplyMM, transformFromPerspective, idTransform, flipZTransform } from '../modules/matrix.js';
import { group, groupEnd, log } from '../modules/log.js';
import Node          from './node.js';
import Object3D      from './object.js';

const assign = Object.assign;
const defaults = {
    projection: 'perspective',
    // Default 60˚ FOV (vertical)
    fov:    Math.PI / 3,
    // Aspect ratio
    aspect: 1.777777778,
    near:   4,
    far:    1024,
    // Depth of field... TODO: This number will act on the perspective
    // transformed objects in the z range 0-1... but how does this correspond to
    // aperture, like f4 or f8 or f22?
    dof:    1/8
};


/** Camera() **/

export default function Camera(transform, options) {
    const privates = Privates(this);
    Object3D.apply(this, arguments);

    if (window.DEBUG) { log('create', 'Camera', this.position); }

    // The new way
    this.projection = options.projection || defaults.projection;
    this.fov        = parseAngle(options.fov || defaults.fov);
    this.aspect     = options.aspect || defaults.aspect;
    this.near       = options.near   || defaults.near;
    this.far        = options.far    || defaults.far;
    this.dof        = options.dof    || defaults.dof;

    // When a throttled update signal is received, capture renderables and
    // broadcast them at .feed
    const throttle = privates.throttle = Stream.of().throttle('frame');
    this.output = throttle.map(() => this.capture()).broadcast({ hot: true });
}

assign(Camera, {
    from: (data) => new Camera(data.transform, data)
});

mix(Camera.prototype, Object3D.prototype);

assign(Camera.prototype, {
    push: overload((type) => typeof type === 'string' ? type : type.type, {
        invalidate: function(event) {
            // Don't propagate - the output of this camera stream is renderables
            Privates(this).sceneTransform = null;
            return this;
        },

        render: function(type) {
            Privates(this).throttle.push(type);
            return this;
        },

        // Don't propagate - the output of this camera stream is renderables
        default: noop
    }),

    capture: function() {
        const projection  = this.projection;
        const renderables = this.getRoot().getRenderables().filter((renderable) => {
            // In perspective mode, reject cameras from being rendered
            return projection !== 'perspective' || renderable.object.type !== 'camera';
        });

        const cameraTransform = invertMatrix(this.getSceneTransform());
        const lensTransform   = this.projection === 'perspective' ?
            multiplyMM(transformFromPerspective(this.fov, this.aspect, this.near, this.far), flipZTransform) :
            idTransform ;

        // Create a new array of renderables
        return renderables.map((renderable) => ({
            object:    renderable.object,
            transform: multiplyMM(lensTransform, multiplyMM(cameraTransform, renderable.transform))
        }))
    },

    toJSON: function() {
        const json = Object3D.prototype.toJSON(this);
        return assign(json, {
            projection: this.projection,
            fov:        this.fov,
            aspect:     this.aspect,
            near:       this.near ,
            far:        this.far,
            dof:        this.dof,
        });
    }
});
