import React from 'react'
import { createRoot } from 'react-dom/client';
import SceneNavigator from './SceneNavigator';
const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
svg.id = 'pac-scene-root'
const previewRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
let vElement;
let initContext;
function init(ext) {
    initContext = ext;
}

function builder(virtualElement, renderedChildren) {
    renderedChildren.forEach(renderedChild => svg.appendChild(renderedChild))
    svg.appendChild(previewRect);
    vElement = virtualElement;
    return svg;
}


function updater(virtualElement) {
    const width = initContext.globalConstants['sceneWidth'] ? parseInt(initContext.globalConstants['sceneWidth']) : 800;
    const height = initContext.globalConstants['sceneHeight'] ? parseInt(initContext.globalConstants['sceneHeight']) : 600;

    const viewBox = `${-width / 2} ${-height / 2} ${width} ${height}`;
    svg.setAttribute('viewBox', viewBox);   
    svg.setAttribute('preserveAspectRatio', "xMidYMid meet");
    previewRect.setAttribute('width', width);
    previewRect.setAttribute('height', height);
    previewRect.setAttribute('stroke', '#59646E');
    previewRect.setAttribute('stroke-width', 1);
    previewRect.setAttribute('fill', 'none');
    previewRect.setAttribute('x', -width / 2);
    previewRect.setAttribute('y', -height / 2);
}

function customUIBuilder() {
    const box = document.createElement('div');
    createRoot(box).render(SceneNavigator({rootElement: vElement, initCtx: initContext}));
    return box;
}


// function uiBuilder() {
//     const h1 = document.createElement('h1');
//     h1.innerHTML = 'p5brush extension';
//     return h1;
// }

const tagNames = ['scene'];

export { builder, updater, customUIBuilder, tagNames, init };

