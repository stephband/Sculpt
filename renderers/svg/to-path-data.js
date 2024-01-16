
function formatNumber(n, number) {
    return n ?
        number.toFixed(n).replace(/\.?0+$/, '') :
        number.toFixed(0) ;
}

export default function toPathData(n, data) {
    return data
    .reduce((string, vertex) => {
        //console.log(string, vertex.position[3]);
        return (string ? string + ' ' : string)
            + vertex.command
            + (vertex.command === 'Z' ? '' :
                formatNumber(n, vertex.position[0])
                + ' '
                // Invert y
                + formatNumber(n, -vertex.position[1])
            );
    }, '');
}
