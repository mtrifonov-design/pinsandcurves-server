// import react dom
import React from 'react';
import { createRoot } from 'react-dom/client';
import CommonUIBox from './CommonUIBox';
import ActiveStore from '../UIToolBox/ActiveStore';
import PropertyManager, { createProperty} from '../UIToolBox/PropertyManager';
import ObjectManager from '../UIToolBox/ObjectManager';
import { getUniqueSelectorPath } from '../UIToolBox/utils';

const id = "mtrif.polartransform";
let initContext;
const activeStore = new ActiveStore(false);
const objectManager = new ObjectManager();
const propertyManagers = {};
function init(ext) {
    initContext = ext;
}
const objects = {};

let activeObject = null;
function activateObject(id) {
    activeObject = id;
    activeStore.setActive(true);
    const obj = objects[id];
    obj.style.outline = '2px solid red';
    objectManager.setActiveObject({id, pm:propertyManagers[id]});

}
function deactivateObject() {
    if (activeObject) {
        const obj = objects[activeObject];
        obj.style.outline = '';
    }
    activeObject = null;
    activeStore.setActive(false);
}

function builder(virtualElement, renderedChildren) {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    const innerg = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    renderedChildren.forEach(child => {
        innerg.appendChild(child);
    });
    g.appendChild(innerg);
    const uniqueId = getUniqueSelectorPath(virtualElement);
    objects[uniqueId] = g;
    const pm = new PropertyManager(initContext, uniqueId);
    propertyManagers[uniqueId] = pm;
    const angle = createProperty('angle','angle', 'numeric', 0);
    const magnitude = createProperty('magnitude','magnitude', 'numeric', 0);
    pm.registerProperty(angle);
    pm.registerProperty(magnitude);

    virtualElement.addEventListener('select', () => {
        activateObject(uniqueId);
    })
    virtualElement.addEventListener('deselect', () => {
        deactivateObject();
    })

    initContext.rootElement.addEventListener('click', () => {deactivateObject()});
    return g;
}

let commonUIBox;
function initCommonUI() {
    const box = document.createElement('div');
    createRoot(box).render(CommonUIBox({ctx: initContext, activeStore, objectManager}));
    return box;
}
function commonUIBuilder() {
    commonUIBox = initCommonUI();
    return commonUIBox;
}
function updater(virtualElement) {
    const uniqueId = getUniqueSelectorPath(virtualElement);
    const obj = objects[uniqueId];
    const width = initContext.globalConstants['sceneWidth'] ? parseInt(initContext.globalConstants['sceneWidth']) : 800;
    const height = initContext.globalConstants['sceneHeight'] ? parseInt(initContext.globalConstants['sceneHeight']) : 600;

    const pm = propertyManagers[uniqueId];
    // x, y, anchorX, anchorY, rotation, scaleX, scaleY, skewX, skewY
    const angle = pm.remapValueIf01('angle', [0,360]);
    const magnitude = pm.remapValueIf01('magnitude', [0,Math.sqrt(width*width + height*height)]);

    const innerg = objects[uniqueId].firstChild;
    // const boundingbox = innerg.getBBox();

    // convert angle and magnitude to x and y
    const x = magnitude * Math.cos(angle * Math.PI / 180);
    const y = magnitude * Math.sin(angle * Math.PI / 180);

    // // first translate to center of bounding box
    // const centerX = boundingbox.width / 2;
    // const centerY = boundingbox.height / 2;

    obj.setAttribute('transform', `
    translate(${x} ${y})
    `);
}

// Allow all native SVG element tag names
const tagNames = [
    'polar-transform'
];





export { builder, updater, tagNames, id, init, commonUIBuilder };