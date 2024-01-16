
export function log(label, name, position = []) {
    console.log(
        '%c' + label + ' %c' + name + ' %c' + position.join(', '),
        'color:#A48988;font-weight:400;',
        'color:#FE267E;font-weight:600;',
        'color:#836FCD;font-weight:400;'
    );
}

export function group(label, name, position) {
    console.groupCollapsed(
        '%c' + label + ' %c' + name + ' %c' + position.join(', '),
        'color:#A48988;font-weight:400;',
        'color:#FE267E;font-weight:600;',
        'color:#836FCD;font-weight:400;'
    );
}

export function groupEnd() {
    console.groupEnd();
}
