
import parseNumbers from './parse-numbers.js';

export default function parsePoints(points) {
    const output  = [];
    const numbers = parseNumbers([], points);

    for (let i = 0; i < numbers.length; i += 2) {
        output.push({
            command: i === 0 ? 'M' : 'L',
            // Invert y
            data: Float32Array.of(numbers[i], -numbers[i + 1])
        });
    }

    output.push({
        command: 'Z'
    });

    return output;
}
