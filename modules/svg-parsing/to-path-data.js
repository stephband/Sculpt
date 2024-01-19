
function formatNumber(n, number) {
    return n ?
        number.toFixed(n).replace(/\.?0+$/, '') :
        number.toFixed(0) ;
}

export default function toPathData(n, data) {
    return data
    .reduce((string, point) => {
        return (string ? string + ' ' : string)
            + point.command
            + (point.command === 'Z' ? '' :
                formatNumber(n, point.data[0])
                + ' '
                // Invert y
                + formatNumber(n, -point.data[1])
            );
    }, '');
}
