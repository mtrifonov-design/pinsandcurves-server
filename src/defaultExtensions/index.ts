
import * as circle from "./circle";
import * as scene from "./Scene";
import * as applySignals from "./applySignals";
import * as exportAsFrames from "./exportAsFrames";
import * as superRect from './defaultSVGShapes/SuperRect';
import * as transform from './defaultSVGAttributes/Transform';
import * as zigzagify from './Zigzagify';


let extensions = [

    
    applySignals,
    circle,
    scene,
    exportAsFrames,
    superRect,
    transform,
    zigzagify,

]




export { extensions };