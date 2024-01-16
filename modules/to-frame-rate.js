
import events from '../../../../dom/modules/events.js';


/**
toFrameRate(n)
Takes value `n` in units _per second_ and returns value in units _per animation
frame_.
**/

// Assume initial frame rate of 60 per second
let duration = 1 / 60;
let testCount = 0;

const numberOfFrames = 60;

function testFrameDuration(t1) {
    let count = numberOfFrames;
    let total = 0;

    const track = (t2) => {
        total += (t2 - t1) / numberOfFrames;
        ++testCount;
        if (--count) {
            t1 = t2;
            requestAnimationFrame(track);
        }
        else {
            duration = total / 1000;
            if (window.DEBUG) {
                console.log('Frame duration tested:', duration, testCount);
            }
        }
    };

    requestAnimationFrame(track);
}

export default function toFrameRate(n) {
    // Takes n per second and turns it into perFrame
    return n * duration;
}

// Wait until frame rate stabilises after load to launch frame rate test
events('DOMContentLoaded', window)
.each(() => setTimeout(() => requestAnimationFrame(testFrameDuration), 250));
