
import * as circle from "./circle";
import * as scene from "./scene";
import * as applySignals from "./applySignals";
import * as exportAsFrames from "./exportAsFrames";
import * as superRect from './defaultSVGShapes/SuperRect/SuperRect';

let extensions = [
    applySignals,
    circle,
    scene,
    exportAsFrames,
    superRect
]




export { extensions };