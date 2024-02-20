/**
<sculpt-scene">

A `sculpt-scene` template may be placed anywhere in your HTML. It is designed to
make it easy to mix islands of dynamically rendered content into static content.
**/


import equals           from '../../fn/modules/equals.js';
import noop             from '../../fn/modules/noop.js';
import matches          from '../../fn/modules/matches.js';
import Stream           from '../../fn/modules/stream.js';
import element, { getInternals as Internals } from '../../dom/modules/element.js';
import events           from '../../dom/modules/events.js';
import style            from '../../dom/modules/style.js';
import requestData      from '../../literal/modules/request-data.js';
import TemplateRenderer from '../../literal/modules/renderer-template.js';
import print            from '../../literal/modules/scope/print.js';
import Data             from '../../literal/modules/data.js';
import Scene            from '../tree/scene.js';
import SVGSceneRenderer from '../renderers/svg-scene-renderer.js';

const $scene  = Symbol('scene');
const onerror = window.DEBUG ?
    (e, element) => element.replaceWith(print(e)) :
    noop ;

// tag, lifecycle, properties, log
export default element('sculpt-scene', {
    mode: 'closed',

    construct: function(shadow, internals) {
        // 16:9 viewbox
        internals.camera  = Stream.of(0);
        internals.viewbox = Stream.of([-1.777777778, -1, 3.555555556, 2]);
        internals.data    = Stream.of();

        // Create shadow renderer
        const template = document.getElementById('sculpt-scene');
        const renderer = new TemplateRenderer(template, this, {}, { noscript: true });
        shadow.appendChild(renderer.content);
        internals.renderer = renderer;

        // Create Sculpt SVG renderer
        const partScene = shadow.querySelector('[part="scene"]');
        internals.sceneRenderer = new SVGSceneRenderer(partScene);

        // Combine streams to make render data
        internals.datastream = Stream.combine({
            cameraIndex: internals.camera,
            scene:       internals.data,
            viewbox:     internals.viewbox
        }, { mutable: true });
    },

    connect: function(shadow, internals) {
        const { datastream, renderer, sceneRenderer } = internals;
console.log('CONNECT', this);
        if (!internals.status) {
            // Wait for render data, start rendering
            internals.datastream.each((data) => {
                internals.status = 'active';

                let viewbox = getComputedStyle(this).getPropertyValue('--viewbox');
                if (viewbox) {
                    viewbox = viewbox.split(/\s+/).map(Number);
//console.log('VIEWBOX', viewbox, data.viewbox);
                    if (!equals(data.viewbox, viewbox)) {
//console.log('VB', viewbox);
                        Data(data).viewbox = viewbox;
                    }
                }

                events('resize', window).each(() => {
                    let viewbox = getComputedStyle(this).getPropertyValue('--viewbox');
                    if (viewbox) {
                        viewbox = viewbox.split(/\s+/).map(Number);
                        if (!equals(data.viewbox, viewbox)) {
//console.log('VB', viewbox);
                            Data(data).viewbox = viewbox;
                        }
                    }
                });

                // Add camera to data
                const camera = data.scene.findAll(matches({ type: 'camera'}))[data.cameraIndex];

                if (!camera) {
                    throw new Error('<sculpt-scene> scene has no camera ' + data.cameraIndex);
                }

                Data(data).camera = camera;

                // Start the literal shadow renderer
console.log('START RENDERER');
                renderer.push(data);

                // Start the SVG scene renderer from camera
                camera.output.pipe(sceneRenderer);
                camera.changed();
            });
        }
    }
}, {
    /**
    camera=""
    Watch out. This sets and gets two different things.
    **/

    camera: {
        attribute: function(n) {
            this.camera = n;
        },

        get: function() {
            const internals = Internals(this);
            return internals.status ?
                internals.renderer.data.camera :
                null ;
        },

        set: function(n) {
            Internals(this).camera.push(parseInt(n));
        }
    },

    /** viewbox="" **/

    viewbox: {
        attribute: function(string) {
            this.viewbox = string.split(/\s+/).map(Number);
        },

        get: function() {
            return Internals(this).renderer.data.viewbox;
        },

        set: function(array) {
            Internals(this).viewbox.push(array);
        }
    },

    /**
    src=""
    A path to a JSON file or JS module exporting data to be rendered.

    ```html
    <sculpt-scene" src="./data.json">...</sculpt-scene>
    <sculpt-scene" src="./module.js">...</sculpt-scene>
    <sculpt-scene" src="./module.js#namedExport">...</sculpt-scene>
    ```
    **/

    src: {
        attribute: function(url) {
            this.src = url;
        },

        get: function() {
            return Internals(this).src;
        },

        set: function(url) {
            const internals = Internals(this);
            internals.src = url;

            // Cancel existing promise of data
            if (internals.promise) {
                internals.promise.cancelled = true;
                internals.promise = undefined;
            }

            // Set internals.promise
            const p = internals.promise = requestData(url)
            .then((data) => {
                if (p.cancelled) { return; }
                this.data = data;
            })
            .catch((e) => onerror(e, this));
        }
    },

    /**
    .data

    Getting the `data` property returns the object currently being rendered.
    Sort of. The returned data object is actually a _proxy_ of the set object.
    This data proxy monitors mutations which the Literal template is already
    observing, so changes to this data are reflected in the DOM immediately
    (well, not quite immediately – literal renders changes on the next frame).

    The `data` property may be set with a JS object or array.
    **/

    data: {
        get: function() {
            const internals = Internals(this);
            return internals.renderer.data.scene || null ;
        },

        set: function(data) {
            const internals = Internals(this);
            internals.data.push(data ?
                // Cache scene on data so that multiple viewers of same data see
                // the same scene ... hmmmmm
                (data[$scene] || (data[$scene] = new Scene(data))) :
                null
            );
        }
    }
}, null, 'stephen.band/literal/');
