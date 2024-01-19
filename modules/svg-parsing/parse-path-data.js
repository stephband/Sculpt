import capture      from '../../../../../fn/modules/capture.js';
import id           from '../../../../../fn/modules/id.js';
import nothing      from '../../../../../fn/modules/nothing.js';
import multiply     from '../../../../../fn/modules/vector/multiply.js';
import parseNumbers from './parse-numbers.js';

const yInverter = [1, -1];

const parseData = capture(/^([ACLMZ])\s*(?:([,\s]\s*)|$)/, {
    1: (data, captures) => {
        data.push({
            command: captures[1],
            data:    captures[1] === 'Z' ?
                nothing :
                multiply(yInverter, parseNumbers([], captures))
        });

        return data;
    },

    2: (data, captures) => parseData(data, captures),

    catch: id
});

export default function parsePathData(string) {
    return parseData([], string);
}
