
import call from '../../fn/modules/call.js';

const actions   = [];
const maxLength = 12;
let n = 0;
let action;

export function recordStart() {
    action = [];
}

export function recordAction(undo, redo) {
    if (!action) {
        throw new Error('UndoRedo: cannot record to action before calling recordStart()')
    }
    action.push(arguments);
    redo();
}

export function recordStop() {
    actions.push(action);

    if (actions.length > maxLength) {
        actions.shift();
    }
    else {
        ++n;
    }

    action = undefined;
}

export function undo() {
    // Are there undos?
    if (n === 0) { return; }
    // Decrement n, get undos from this action and call them
    actions[--n].map(get(0)).forEach(call);
}

export function redo() {
    // Are there redos?
    if (!actions[n]) { return; }
    // Get redos from this action and call them, increment n
    actions[n++].map(get(1)).forEach(call);
}

export function invalidate() {
    actions.length = n;
}
