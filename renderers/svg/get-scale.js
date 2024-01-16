export default function getScale(element) {
    const svg = element.viewportElement || element;

    const pt1 = svg.createSVGPoint();
    pt1.x = 0;
    pt1.y = 0;

    const pt2 = svg.createSVGPoint();
    pt2.x = 1;
    pt2.y = 1;

    const CTM1  = svg.getScreenCTM().inverse();
    const svgP1 = pt1.matrixTransform(CTM1);
    const svgP2 = pt2.matrixTransform(CTM1);

    return Float32Array.of(
        svgP2.x - svgP1.x,
        svgP2.y - svgP1.y
    );
}
