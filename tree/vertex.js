
import { ORIGIN3D } from '../../fn/modules/vector/consts.js';
import matches      from '../../fn/modules/matches.js';
import Privates     from '../../fn/modules/privates.js';
import mix          from '../../fn/modules/mix.js';
import Node         from './node.js';
import { group, groupEnd, log } from '../modules/log.js';

const assign = Object.assign;
const define = Object.defineProperties;


/* link(), unlink() */

export const linked = {};

function createLinkId() {
    let n = 0;
    while (linked[++n]);
    return n + '';
}

export function link(vert1, vert2) {
    // Vert1 is linked
    if (vert1.link) {
        const link1 = vert1.link;
        const pos   = linked[vert1.link];
        if (window.DEBUG) { log('link', 'Vertex', pos); }

        // So is vert2
        if (vert2.link) {
            // Already linked? Do nothing.
            if (vert1.link === vert2.link) {
                return;
            }

            // Merge second link into first
            const link2 = vert2.link;
            const scene = vert2.getRoot();
            scene.findAll({ link }).forEach((vert) => {
                vert.link = link1;
                Privates(vert).position = pos;
            });

            // Remove dud link
            linked[link2] = undefined;
            return;
        }

        // Link vert2 to vert1
        vert2.link = link1;
        Privates(vert2).position = pos;
        return;
    }

    // Vert2 is linked
    if (vert2.link) {
        const link2 = vert2.link;
        const pos   = linked[vert2.link];
        if (window.DEBUG) { log('link', 'Vertex', pos); }

        // Link vert1 to vert2
        vert1.link = link2;
        Privates(vert1).position = pos;
        return;
    }

    // Create a new link
    const id  = createLinkId();
    const pos = vert1.position;
    if (window.DEBUG) { log('link', 'Vertex', pos); }

    linked[id] = Privates(vert2).position = pos;
    vert1.link = id;
    vert2.link = id;
}

export function unlink(vert) {
    if (window.DEBUG) { log('unlink', 'Vertex', vert.position); }
    Privates(vert).position = Float32Array.from(linked[vert.link]);
    vert.link = undefined;
}

export function purgeLinks(scene) {
    let link, verts;
    for (link in linked) {
        verts = scene.findAll(matches({ link }));
        if (verts.length < 2) {
            if (verts[0]) {
                verts[0].link = undefined;
                verts[0].changed();
                if (window.DEBUG) { log('unlink', 'Vertex', verts[0].position); }
            }
            linked[link] = undefined;
        }
    }
}


/* Vertex(position, command) */

export default function Vertex(position = ORIGIN3D, link) {
    if (window.DEBUG && position.length > 4) {
        throw new Error('Vertex: position vector too long, length ' + position.length + '. Is it a transform by mistake?');
    }

    if (window.DEBUG && position.length < 3) {
        throw new Error('new Vertex(position) requires a `position` array of min length 3');
    }

    if (window.DEBUG) { log('create', 'Vertex', position, link); }

    Node.apply(this, arguments);
    const privates = Privates(this);

    this.link = link;
    privates.position = link ?
        // Get pos from link
        linked[link] ? linked[link] :
        // Create linked pos
        (linked[link] = Float32Array.from(position)) :
        // Make unlinked pos
        Float32Array.from(position) ;
}

assign(Vertex, {
    from: (object) => new Vertex(object.position, object.link)
});

mix(Vertex.prototype, Node.prototype);

assign(Vertex.prototype, Node.prototpye, {
    getSceneTransform: function() {
        return this.input.getSceneTransform();
    },

    toJSON: function() {
        return {
            id:       this.id,
            type:     this.type,
            link:     this.link,
            position: Array.from(this.position)
        }
    }
});
