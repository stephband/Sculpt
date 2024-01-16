
import { ORIGIN3D } from '../../fn/modules/vector/consts.js';

const { cos, sin, tan } = Math;



function multiplyMPN(m0, m1, m2, m3, m4, m5, m6, m7, m8, m9, m10, m11, m12, m13, m14, m15, px, py, pz, pw = 1, buffer = new Float32Array(4), n = 0) {
    //if (window.DEBUG && pw !== 1) {
    //    throw new Error('pw should be 1: ' + pw);
    //}

    // Multiply the point against each part of the 1st column, then add together
    buffer[n + 0] = px * m0 + py * m4 + pz * m8  + pw * m12;
    // Multiply the point against each part of the 2nd column, then add together
    buffer[n + 1] = px * m1 + py * m5 + pz * m9  + pw * m13;
    // Multiply the point against each part of the 3rd column, then add together
    buffer[n + 2] = px * m2 + py * m6 + pz * m10 + pw * m14;
    // Multiply the point against each part of the 4th column, then add together
    buffer[n + 3] = px * m3 + py * m7 + pz * m11 + pw * m15;

    return buffer;
}

export function multiplyMP(matrix, point, buffer, n) {
    return point.length === 3 ?
        multiplyMPN(...matrix, ...point, 1, buffer, n) :
        multiplyMPN(...matrix, ...point, buffer, n) ;
}

export function multiplyMM(matrixA, matrixB, buffer = new Float32Array(matrixB.length), n = 0) {
    // Adapted from
    // https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Matrix_math_for_the_web

    if (window.DEBUG && matrixA === buffer) {
        throw new Error('matrixA may not be the same object as buffer (matrixB may be).');
    }

    // Multiply each row in matrixB by matrixA, storing results in buffer n + 0-15
    multiplyMPN(...matrixA, matrixB[0],  matrixB[1],  matrixB[2],  matrixB[3],  buffer, n + 0);
    multiplyMPN(...matrixA, matrixB[4],  matrixB[5],  matrixB[6],  matrixB[7],  buffer, n + 4);
    multiplyMPN(...matrixA, matrixB[8],  matrixB[9],  matrixB[10], matrixB[11], buffer, n + 8);
    multiplyMPN(...matrixA, matrixB[12], matrixB[13], matrixB[14], matrixB[15], buffer, n + 12);

    return buffer;
}

function invertMatrixN(m0, m1, m2, m3, m4, m5, m6, m7, m8, m9, m10, m11, m12, m13, m14, m15, buffer = new Float32Array(16), n = 0) {
    const a = m9 * m14 * m7  - m13 * m10 * m7 + m13 * m6 * m11 - m5 * m14 * m11 - m9 * m6 * m15 + m5 * m10 * m15;
    const b = m12 * m10 * m7 - m8 * m14 * m7  - m12 * m6 * m11 + m4 * m14 * m11 + m8 * m6 * m15 - m4 * m10 * m15;
    const c = m8 * m13 * m7  - m12 * m9 * m7  + m12 * m5 * m11 - m4 * m13 * m11 - m8 * m5 * m15 + m4 * m9 * m15;
    const d = m12 * m9 * m6  - m8 * m13 * m6  - m12 * m5 * m10 + m4 * m13 * m10 + m8 * m5 * m14 - m4 * m9 * m14;

    var determinant = m0 * a + m1 * b + m2 * c + m3 * d;
    if (determinant === 0) {
        throw new Error("Can't invert matrix, determinant is 0");
    }

    // Write values to buffer
    buffer[n + 0]  = a / determinant;
    buffer[n + 4]  = b / determinant;
    buffer[n + 8]  = c / determinant;
    buffer[n + 12] = d / determinant;
    buffer[n + 1]  = (m13 * m10 * m3 - m9 * m14 * m3  - m13 * m2 * m11 + m1 * m14 * m11 + m9 * m2 * m15 - m1 * m10 * m15) / determinant;
    buffer[n + 5]  = (m8 * m14 * m3  - m12 * m10 * m3 + m12 * m2 * m11 - m0 * m14 * m11 - m8 * m2 * m15 + m0 * m10 * m15) / determinant;
    buffer[n + 9]  = (m12 * m9 * m3  - m8 * m13 * m3  - m12 * m1 * m11 + m0 * m13 * m11 + m8 * m1 * m15 - m0 * m9 * m15)  / determinant;
    buffer[n + 13] = (m8 * m13 * m2  - m12 * m9 * m2  + m12 * m1 * m10 - m0 * m13 * m10 - m8 * m1 * m14 + m0 * m9 * m14)  / determinant;
    buffer[n + 2]  = (m5 * m14 * m3  - m13 * m6 * m3  + m13 * m2 * m7  - m1 * m14 * m7  - m5 * m2 * m15 + m1 * m6 * m15)  / determinant;
    buffer[n + 6]  = (m12 * m6 * m3  - m4 * m14 * m3  - m12 * m2 * m7  + m0 * m14 * m7  + m4 * m2 * m15 - m0 * m6 * m15)  / determinant;
    buffer[n + 10] = (m4 * m13 * m3  - m12 * m5 * m3  + m12 * m1 * m7  - m0 * m13 * m7  - m4 * m1 * m15 + m0 * m5 * m15)  / determinant;
    buffer[n + 14] = (m12 * m5 * m2  - m4 * m13 * m2  - m12 * m1 * m6  + m0 * m13 * m6  + m4 * m1 * m14 - m0 * m5 * m14)  / determinant;
    buffer[n + 3]  = (m9 * m6 * m3   - m5 * m10 * m3  - m9 * m2 * m7   + m1 * m10 * m7  + m5 * m2 * m11 - m1 * m6 * m11)  / determinant;
    buffer[n + 7]  = (m4 * m10 * m3  - m8 * m6 * m3   + m8 * m2 * m7   - m0 * m10 * m7  - m4 * m2 * m11 + m0 * m6 * m11)  / determinant;
    buffer[n + 11] = (m8 * m5 * m3   - m4 * m9 * m3   - m8 * m1 * m7   + m0 * m9 * m7   + m4 * m1 * m11 - m0 * m5 * m11)  / determinant;
    buffer[n + 15] = (m4 * m9 * m2   - m8 * m5 * m2   + m8 * m1 * m6   - m0 * m9 * m6   - m4 * m1 * m10 + m0 * m5 * m10)  / determinant;

    // Return buffer
    return buffer;
}

export function invertMatrix(matrix, buffer, n) {
    return invertMatrixN(...matrix, buffer, n);
}

export function transformFromPerspective(fov, aspect, n, f) {
    // Field of view - the angle in radians of what's in view along the Y axis
    // aspect - Aspect ratio of render cube
    // n - Near - Anything before this point in the Z direction gets clipped (resultside of the clip space)
    // f - Far - Anything after this point in the Z direction gets clipped (outside of the clip space)
    var s = 1 / tan(fov / 2);
    return Float32Array.of(
        s / aspect, 0, 0,                   0,
        0,          s, 0,                   0,
        0,          0, (n + f) / (n - f),  -1,
        0,          0, 2 * n * f / (n - f), 0
    );
}

export function normaliseW(vector, buffer = new Float32Array(4), n = 0) {
    const w = vector[3];
    buffer[n + 0] = vector[0] / w;
    buffer[n + 1] = vector[1] / w;
    buffer[n + 2] = vector[2] / w;
    // Should be vector[3]/w, which is w/w, which is 1. Lets just make it 1.
    buffer[n + 3] = 1;
    return buffer;
}


// ---------------------------------------

export const idTransform = Float32Array.of(
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1
);

export const flipZTransform = Float32Array.of(
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0,-1, 0,
    0, 0, 0, 1
);

export function transformFromRotationX(rx) {
    return Float32Array.of(
        1, 0,       0,        0,
        0, cos(rx), -sin(rx), 0,
        0, sin(rx), cos(rx),  0,
        0, 0,       0,        1
    );
}

export function transformFromRotationY(ry) {
    return Float32Array.of(
        cos(ry),  0, sin(ry), 0,
        0,        1, 0,       0,
        -sin(ry), 0, cos(ry), 0,
        0,        0, 0,       1
    );
}

export function transformFromRotationZ(rz) {
    return Float32Array.of(
        cos(rz), -sin(rz), 0, 0,
        sin(rz), cos(rz),  0, 0,
        0,      0,       1, 0,
        0,      0,       0, 1
    );
}

export function transformFromRotation([rx, ry, rz]) {
    const mx = transformFromRotationX(rx);
    const my = transformFromRotationY(ry);
    const mz = transformFromRotationZ(rz);
    return multiplyMM(multiplyMM(mx, my), mz);
}

export function transformFromScale([w, h, d]) {
    return Float32Array.of(
        w, 0, 0, 0,
        0, h, 0, 0,
        0, 0, d, 0,
        0, 0, 0, 1
    );
}

export function transformFromTranslation(x, y, z) {
    return Float32Array.of(
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        x, y, z, 1
    );
}

export function rotateFromTransform(transform) {
    // TODO
    //return multiplyMP(transform, ORIGIN3D);
}

export function scaleFromTransform(transform) {
    // TODO
    //return multiplyMP(transform, ORIGIN3D);
}

export function translateFromTransform(transform) {
    return multiplyMP(transform, ORIGIN3D);
}

// -------------------


// LOGGING

import postpad from '../../fn/modules/postpad.js';
const labelColor  = '#A423A9';
const numberColor = '#ff4d86';

function toNumber(number) {
    return Math.abs(number) < 0.000000001 ?
        ' 0    ' :
    number < 0 ?
        postpad(' ', 6, number.toPrecision(3)) :
    ' ' + postpad(' ', 5, number.toPrecision(3)) ;
}

export function logVector(label, vector) {
    console.log(
        '%c' + label + '%c ' + vector.map(toNumber).join(' '),
        'color:' + labelColor + ';font-weight:400;', 'color:' + numberColor + ';font-weight:400;'
    );
}

export function logMatrix(label, matrix) {
    console.log('%c' + label + '%c\n'
        + toNumber(matrix[0])  + '  ' + toNumber(matrix[1])  + '  ' + toNumber(matrix[2])  + '  ' + toNumber(matrix[3])  + '\n'
        + toNumber(matrix[4])  + '  ' + toNumber(matrix[5])  + '  ' + toNumber(matrix[6])  + '  ' + toNumber(matrix[7])  + '\n'
        + toNumber(matrix[8])  + '  ' + toNumber(matrix[9])  + '  ' + toNumber(matrix[10]) + '  ' + toNumber(matrix[11]) + '\n'
        + toNumber(matrix[12]) + '  ' + toNumber(matrix[13]) + '  ' + toNumber(matrix[14]) + '  ' + toNumber(matrix[15]),
        'color:' + labelColor + ';font-weight:400;', 'color:' + numberColor + ';font-weight:400;'
    );
}
