
import * as circle from "./circle";
import * as scene from "./Scene";
import * as applySignals from "./applySignals";
import * as exportAsFrames from "./ExportAsFrames/exportAsFrames";
import * as superRect from './defaultSVGShapes/SuperRect';
import * as transform from './defaultSVGAttributes/Transform';
import * as zigzagify from './Zigzagify';
import * as background from './defaultSVGShapes/Background';
import * as image from './defaultSVGShapes/Image';
import * as strokeandfill from './defaultSVGAttributes/StrokeAndFill';
let extensions = [
    applySignals,
    circle,
    scene,
    exportAsFrames,
    image,
    superRect,
    transform,
    strokeandfill,
    zigzagify,
    background,

]




export { extensions };