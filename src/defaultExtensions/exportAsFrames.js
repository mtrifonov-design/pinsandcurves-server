
import renderAsImageSequence from "./RenderAsImageSequence";
const id = "exportAsFrames";
const global = {};

function init(ctx) {
    const { getProject, projectController, setFrame } = ctx;
    global.getProject = getProject;
    global.setFrame = setFrame;
}

function commonUIBuilder() {
    const button = document.createElement('button');
    button.innerHTML = 'Export as Frames';
    button.onclick = exportAsFrames;
    return button;
}

function exportAsFrames() {
    const focusRange = global.getProject().timelineData.focusRange;
    const [startFrame, endFrame] = focusRange;
    const fps = global.getProject().timelineData.framesPerSecond;
    renderAsImageSequence({
        applySignals: global.setFrame,
        startFrame,
        endFrame,
        framesPerSecond: fps,
    })
}

export { init, commonUIBuilder, id }