
import matches from '../../../../fn/modules/matches.js';

export const selection = [];

export function clear(object, point) {
    selection.length = 0;
}

export function select(object, position) {
    // Check if selected
    if (selection.find(matches({ object, position }))) { return; }

    // Push new selection object
    selection.push({
        type: 'point',
        object,
        position
    });
}

export function deselect(object, data) {
    // Find index of selected
    const i = selection.findIndex(matches({ object, data })) ;

    // Check if selected
    if (i < 0) { return; }

    // Remove it
    selection.splice(i, 1);
}
