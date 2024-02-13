function formatNumber(n, number) {
    return n ?
        number.toFixed(n).replace(/\.?0+$/, '') :
        number.toFixed(0) ;
}

export default function toPoints(data) {
    return data
    .map((point) => point.data ?
        // Invert y
        formatNumber(6, point.data[0]) + ' ' + formatNumber(6, -point.data[1]) :
        ''
    )
    .join(' ');
}
