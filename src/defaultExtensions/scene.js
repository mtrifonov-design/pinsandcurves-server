import { parseDefaultTransform,parseNumberAttribute } from "./parseDefaultTransform";
const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

let initContext;
function init(ext) {
    initContext = ext;
}

function builder(virtualElement, renderedChild) {
    svg.appendChild(renderedChild);
    return svg;
}


function updater(virtualElement) {
    const width = initContext.globalConstants['sceneWidth'] ? parseInt(initContext.globalConstants['sceneWidth']) : 800;
    const height = initContext.globalConstants['sceneHeight'] ? parseInt(initContext.globalConstants['sceneHeight']) : 600;

    const viewBox = `${-width / 2} ${-height / 2} ${width} ${height}`;
    svg.setAttribute('viewBox', viewBox);   
    svg.setAttribute('preserveAspectRatio', "xMidYMid meet");

    const previewRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    previewRect.setAttribute('width', width);
    previewRect.setAttribute('height', height);
    previewRect.setAttribute('stroke', '#59646E');
    previewRect.setAttribute('stroke-width', 1);
    previewRect.setAttribute('fill', 'none');
    previewRect.setAttribute('x', -width / 2);
    previewRect.setAttribute('y', -height / 2);
    svg.appendChild(previewRect);
}

// function uiBuilder() {
//     const h1 = document.createElement('h1');
//     h1.innerHTML = 'p5brush extension';
//     return h1;
// }

const tagNames = ['scene'];

export { builder, updater, tagNames, init };

