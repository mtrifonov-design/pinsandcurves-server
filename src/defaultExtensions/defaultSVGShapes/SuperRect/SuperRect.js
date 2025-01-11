// import react dom
import React from 'react';
import { createRoot } from 'react-dom/client';
import Example from './ReactTest';
import ActiveStore from '../../UIToolBox/ActiveStore';
import PropertyManager from '../../UIToolBox/PropertyManager';
import ObjectManager from '../../UIToolBox/ObjectManager';

// Generates an SVG path string for the FlexiShape
function generateSuperRectPath({
    stretch = 0.5, // stretch factor (< 0.5 = horizontal, > 0.5 = vertical)
    rounding = 0 // Corner rounding factor (0 = sharp, 1 = ellipse)
} = {}) {
    // Ensure area preservation by adjusting radiusY inversely to radiusX

    let sx = 1;
    const horizontal = stretch < 0.5;
    if (horizontal) {
        sx = 1 - 2 * stretch;
        // convert to a number between 1 and infinity, where 0 should be mapped to 1 and 1 to infinity
        sx = 1 / (1 - sx);
    } else {
        sx = 2 * stretch - 1;
        // convert to a number between 1 and infinity, where 0 should be mapped to 1 and 1 to infinity
        sx = 1 / (1 - sx);
        sx = 1 / sx;
    }


    const sy = 1 / sx;
    const radiusX = 100 * sx;
    const radiusY = 100 * sy;

    // Calculate control points for the rounded corners
    const rx = radiusX * (rounding); // Adjusted corner radius X
    const ry = radiusY * (rounding); // Adjusted corner radius Y

    // Start building the SVG path
    return [
        `M ${-radiusX + rx},${-radiusY}`, // Start at top-left corner
        `h ${2 * radiusX - 2 * rx}`, // Top edge
        `a ${rx},${ry} 0 0 1 ${rx},${ry}`, // Top-right corner
        `v ${2 * radiusY - 2 * ry}`, // Right edge
        `a ${rx},${ry} 0 0 1 -${rx},${ry}`, // Bottom-right corner
        `h ${-2 * radiusX + 2 * rx}`, // Bottom edge
        `a ${rx},${ry} 0 0 1 -${rx},-${ry}`, // Bottom-left corner
        `v ${-2 * radiusY + 2 * ry}`, // Left edge
        `a ${rx},${ry} 0 0 1 ${rx},-${ry}`, // Top-left corner
        "Z" // Close the path
    ].join(" ");
}

function getUniqueSelectorPath(element) {
    let path = [];
    while (element.parentElement) {
      let index = Array.from(element.parentElement.children).indexOf(element);
      path.unshift(`${element.tagName}:nth-child(${index + 1})`);
      element = element.parentElement;
    }
    return path.join(' > ');
  }

  

const id = "mtrif.superrect";

let initContext;
const activeStore = new ActiveStore(false);
const objectManager = new ObjectManager();
const propertyManagers = {};

function init(ext) {
    initContext = ext;

}


const objects = {};

let activeObject = null;

function onMouseOver(id) {
    const obj = objects[id];
    obj.style.outline = '2px solid red';
};

function onMouseOut(id) {
    const obj = objects[id];
    obj.style.outline = '';
};



let hasCapturedClick = false;
function activateObject(id) {
    activeObject = id;
    activeStore.setActive(true);
    console.log('active object:', id);
    // disable the deactivate object function until the click event is handled
    objectManager.setActiveObject(propertyManagers[id]);
    hasCapturedClick = true;
    setTimeout(() => {
        hasCapturedClick = false;
    }, 0);
}

function deactivateObject() {
    if (hasCapturedClick) {
        return;
    }
    activeObject = null;
    activeStore.setActive(false);
}

function builder(virtualElement, renderedChild) {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const uniqueId = getUniqueSelectorPath(virtualElement);
    const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
    title.innerHTML = uniqueId;
    path.appendChild(title);
    objects[uniqueId] = path;
    propertyManagers[uniqueId] = new PropertyManager(initContext);

    // add a listener for hover events
    path.addEventListener('mouseover', () => {onMouseOver(uniqueId)});
    path.addEventListener('mouseout', () => {onMouseOut(uniqueId)});
    path.addEventListener('click', () => {activateObject(uniqueId);});
    initContext.rootElement.addEventListener('click', () => {deactivateObject()});

    return path;
}

const commonUIBox = initCommonUI();
function initCommonUI() {
    const box = document.createElement('div');
    createRoot(box).render(Example({ctx: initContext, activeStore}));
    return box;
}

function commonUIBuilder() {
    return commonUIBox;
}

function updater(virtualElement) {
    const stretchAttribute = virtualElement.getAttribute("stretch");
    const stretch = stretchAttribute === '0' ? 0 : parseFloat(stretchAttribute) || 0.5;
    const rounding = parseFloat(virtualElement.getAttribute("rounding")) || 0;
    const path = generateSuperRectPath({ stretch, rounding });
    const uniqueId = getUniqueSelectorPath(virtualElement);
    objects[uniqueId].setAttribute('d', path);
    objects[uniqueId].setAttribute('fill', "white");
    objects[uniqueId].setAttribute('stroke', "black");
    objects[uniqueId].setAttribute('stroke-width', 1);
}



const tagNames = ['super-rect'];

export { builder, updater, tagNames, id, init, commonUIBuilder };