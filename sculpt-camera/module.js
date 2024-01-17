/**
<sculpt-player">

A `sculpt-player` template may be placed anywhere in your HTML. It is designed to
make it easy to mix islands of dynamically rendered content into static content.
**/


import noop             from '../../fn/modules/noop.js';
import element, { getInternals as Internals } from '../../dom/modules/element.js';
import requestData      from '../../literal/modules/request-data.js';
import TemplateRenderer from '../../literal/modules/renderer-template.js';
import print            from '../../literal/modules/scope/print.js';

const onerror = window.DEBUG ?
    (e, element) => element.replaceWith(print(e)) :
    noop ;

// tag, lifecycle, properties, log
export default element('sculpt-player', {
    construct: function(shadow) {
        const internals = Internals(this);
        internals.renderer = new TemplateRenderer(document.getElementById('#sculpt-player'), this);
        shadow.appendChlld(internals.renderer.content);
    }
}, {
    /**
    src=""
    A path to a JSON file or JS module exporting data to be rendered.

    ```html
    <sculpt-player" src="./data.json">...</sculpt-player>
    <sculpt-player" src="./module.js">...</sculpt-player>
    <sculpt-player" src="./module.js#namedExport">...</sculpt-player>
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

    /** camera="" **/

    camera: {
        attribute: function(n) {
            this.camera = n;
        },

        get: function() {
            return Internals(this).camera;
        },

        set: function(n) {
            const internals = Internals(this);
            internals.camera = parseInt(n);
        }
    },


    /**
    data-*=""
    If there is no `src` or `data` attribute literal populates `data` object
    from the dataset properties. So `data-count="3"` may be used in the template
    with `${ data.count }`.

    (If the template _does_ have a `src` attribute, the dataset proper can still
    be accessed in (the usual way)[https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/dataset],
    with `${ element.dataset.count }`.)
    **/

    /**
    .data

    The `data` property may be set with a JS object or array.

    Getting the `data` property returns the object currently being rendered.
    Sort of. The returned data object is actually a _proxy_ of the set object.
    This data proxy monitors mutations which the Literal template is already
    observing, so changes to this data are reflected in the DOM immediately
    (well, not quite immediately – literal renders changes on the next frame).
    **/

    data: {
        attribute: function(json) {
            try {
                this.data = JSON.parse(json);
            }
            catch(e) {
                throw new Error('Invalid JSON in <literal-template"> data attribute: "' + json + '"');
            }
        },

        get: function() {
            const internals = Internals(this);
            return internals.renderer.data || null ;
        },

        set: function(object) {
            const internals = Internals(this);
            internals.renderer.push(object || null);
        }
    }
}, null, 'stephen.band/literal/');
