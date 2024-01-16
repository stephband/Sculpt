
import deg from '../../fn/modules/to-deg.js';

const assign = Object.assign;


function capitalise(s) {
    return s[0].toUpperCase() + s.slice(1);
}

function updateReadoutL(readout, object) {
    readout.innerHTML = capitalise(object.projection);
}

function updateReadoutC(readout, object) {
    const projection = object.projection;
    readout.innerHTML = projection === 'perspective' ?
        Math.round(deg(object.fov)) + '°' :
        '' ;
}

function updateReadoutR(readout, object) {
    const pos = object.position;
    readout.innerHTML = pos[0].toFixed(0) + ', '
        + pos[1].toFixed(0) + ', '
        + pos[2].toFixed(0) ;
}


/* ReadoutRenderer */

export default function ReadoutRenderer(readoutL, readoutC, readoutR) {
    this.readoutL = readoutL;
    this.readoutC = readoutC;
    this.readoutR = readoutR;
}

assign(ReadoutRenderer.prototype, {
    render: function(camera) {
        updateReadoutL(this.readoutL, camera);
        updateReadoutC(this.readoutC, camera);
        updateReadoutR(this.readoutR, camera);
    }
});
