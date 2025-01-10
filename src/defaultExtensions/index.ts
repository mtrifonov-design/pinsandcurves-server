import type { Extension } from "../types";
import * as circle from "./circle";
import * as scene from "./scene";
import * as applySignals from "./applySignals";
import * as exportAsFrames from "./exportAsFrames";

let extensions : Extension[] = [
    applySignals as unknown as Extension,
    circle as unknown as Extension,
    scene as unknown as Extension,
    exportAsFrames as unknown as Extension,
]




export { extensions };