import * as scene from "./Scene";
import * as applySignals from "./applySignals";
import * as exportAsFrames from "./ExportAsFrames/exportAsFrames";
import * as superRect from './defaultSVGShapes/SuperRect';
import * as transform from './defaultSVGAttributes/Transform';
import * as background from './defaultSVGShapes/Background';
import * as strokeandfill from './defaultSVGAttributes/StrokeAndFill';
import * as nativeSVGElements from './defaultSVGShapes/NativeShapes';
import * as drawStroke from './DrawStroke'
import * as polarTransform from './PolarTransform'
import * as p5canvas from './p5canvas'

let extensions = [
    applySignals,
    nativeSVGElements,
    scene,
    exportAsFrames,
    superRect,
    transform,
    polarTransform,
    strokeandfill,
    drawStroke,
    background,
    p5canvas,
]




export { extensions };