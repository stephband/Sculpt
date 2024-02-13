
import isDefined     from '../../../../../fn/modules/is-defined.js';
import noop          from '../../../../../fn/modules/noop.js';
import overload      from '../../../../../fn/modules/overload.js';
import create        from '../../../../../dom/modules/create.js';
import parsePathData from './parse-path-data.js';
import parsePoints   from './parse-points.js';
import toPathData    from './to-path-data.js';
import toPoints      from './to-points.js';

let id = 0;

const createElement = overload((item) => item.object.type, {
    path: (item) => create('path', {
        d:     toPathData(4, item.data),
        class: item.object.class, /*(item.object.node
            && item.object.node.getAttribute('class')
            || 'lime-bg'),*/
        data:  {
            objectId: item.object.id
        }
    }),

    camera: (item) => create('circle', {
        // Invert Y
        cx:    item.data[0],
        cy:    -item.data[1],
        r:     1,
        class: 'blue-bg',
        data:  {
            objectId: item.object.id
        }
    }),

    default: (item) => console.log('Unhandled renderable', item)
});

export function renderSVG(svg, shot) {
    // Create SVG DOM
    shot
    .map(createElement)
    .filter(isDefined)
    .forEach((element) => svg.appendChild(element));
}

export function updateSVG(svg, shot) {
    // Update <path> elements
    const paths = svg.querySelectorAll('path');
    shot
    .filter((item) => item.object.type === 'path')
    .forEach((item, i) => paths[i].setAttribute('d', toPathData(3, item.data)));

    // Update <circle> elements
    const circles = svg.querySelectorAll('circle');
    shot
    .filter((item) => item.object.type === 'camera')
    .forEach((item, i) => {
        // Invert Y
        circles[i].setAttribute('cx', item.data[0]);
        circles[i].setAttribute('cy', -item.data[1]);
    });
}


export function fromPath(path) {
    return parsePathData(path.getAttribute('d'));
}

export function fromPolygon(polygon) {
    return parsePoints(polygon.getAttribute('points'));
}


export function getProperty(name, element) {
    return element[name].baseVal.value;
}

export function setProperty(name, element, value) {
    return element[name].baseVal.value = value;
}

export function updateSelection(group, selection) {
    group.innerHTML = '';
    selection.map((item, i) => create('circle', {
        // Invert Y
        cx:    item.position[0],
        cy:    -item.position[1],
        r:     1,
        class: 'teal-bg handle' + (item.object.targeted ? ' yellow-fg' : ''),
        data:  {
            objectId:   item.object.object.id,
            pointIndex: item.object.object.data.findIndex((command) => command.data === item.object.position)
        }
    }))
    .forEach((circle) => group.appendChild(circle));
}
