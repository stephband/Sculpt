import capture      from '../../../../../fn/modules/capture.js';
import id           from '../../../../../fn/modules/id.js';

const parseNumbers = capture(/^(-?[\d.]+)\s*(?:([,\s]\s*)|$)/, {
    1: (numbers, captures) => {
        numbers.push(parseFloat(captures[1]));
        return numbers;
    },

    2: (numbers, captures) => parseNumbers(numbers, captures),

    catch: id
});

export default parseNumbers;
