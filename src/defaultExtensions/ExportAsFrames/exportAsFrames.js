
import { createRoot } from "react-dom/client";
import CommonUIBox from "./CommonUIBox";
import renderAsImageSequence from "./RenderAsImageSequence";
import ActiveStore from "../UIToolBox/ActiveStore";
const id = "exportAsFrames";
const global = {};

function init(ctx) {
    const { getProject,projectTools,projectController, setFrame } = ctx;
    global.getProject = getProject;
    global.setFrame = setFrame;
    global.projectTools = projectTools;
}


const activeStore = new ActiveStore(false);
function builder(virtualElement, renderedChild) {
    console.log('virtualElement', virtualElement);
    virtualElement.addEventListener('select', () => {
        activeStore.setActive(true);
    })
    virtualElement.addEventListener('deselect', () => {
        activeStore.setActive(false);
    })
    return renderedChild;
}

function commonUIBuilder() {
    const box = document.createElement('div');
    createRoot(box).render(CommonUIBox({ exportAsFrames , activeStore}));
    return box;
}

function exportAsFrames() {
    const focusRange = global.getProject().timelineData.focusRange;
    const [startFrame, endFrame] = focusRange;
    const fps = global.getProject().timelineData.framesPerSecond;

    const projectTools = global.projectTools;
    const applySignals = (frame) => projectTools.updatePlayheadPosition(frame,true);
    renderAsImageSequence({
        applySignals: applySignals,
        startFrame,
        endFrame,
        framesPerSecond: fps,
    })
}

const tagNames = ['scene']

export { init, commonUIBuilder, builder, tagNames, id }