const id = "applySignals";

const global = {};
const tagNames = ["scene"];

function init(ctx) {
    const { getProject, globalState, getSignalValue } = ctx;
    global.getProject = getProject;
    global.state = globalState;
    global.getSignalValue = getSignalValue;
}

function updater(virtualElement) {
    const frame = global.state.frame;
    applySignals(virtualElement,frame);
}

function applySignals(virtualElement, frame) {
    const project = global.getProject();
    const signalIds = project.orgData.signalIds;
    const currentFrame = project.timelineData.playheadPosition;

    for (const signalId of signalIds) {
        const signalName = project.orgData.signalNames[signalId];
        const isExportSignal = signalName.startsWith('@') || signalName.startsWith('#');
        if (!isExportSignal) {
            continue;
        }
        const type = signalName.startsWith('@') ? 'idSelector' : 'classSelector';
        // now, assume the signal is structured as follows @ | #[name].[property]
        // extract the name and property
        const parts = signalName.split('.');
        if (parts.length < 2) {
            continue;
        };
        const name = parts[0].slice(1, parts[0].length);
        const property = parts.slice(1).join('.');
        
        const value = global.getSignalValue(signalName, frame || currentFrame);
        let elements = [];
        if (type === 'idSelector') {
            const element = virtualElement.querySelector(`#${name}`);
            if (element) elements.push(element);
        } else {
            elements = Array.from(virtualElement.querySelectorAll(`.${name}`));
        }
        elements.forEach((element) => {
            element.setAttribute(property, String(value));
        });
    }
}

export { init, updater, tagNames, id }