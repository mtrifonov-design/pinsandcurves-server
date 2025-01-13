// import react dom
import React from 'react';
import { createRoot } from 'react-dom/client';
import CommonUIBox from './CommonUIBox';
import ActiveStore from '../../UIToolBox/ActiveStore';
import PropertyManager, { createProperty} from '../../UIToolBox/PropertyManager';
import ObjectManager from '../../UIToolBox/ObjectManager';
import { getUniqueSelectorPath } from '../../UIToolBox/utils';

const id = "mtrif.transform";
let initContext;
const activeStore = new ActiveStore(false);
const objectManager = new ObjectManager();
const propertyManagers = {};
function init(ext) {
    initContext = ext;
}
const objects = {};

function onMouseOver(id) {
    const obj = objects[id];
    obj.style.outline = '2px solid red';
};
function onMouseOut(id) {
    const obj = objects[id];
    if (activeObject !== id) {
        obj.style.outline = '';
    }
};
let hasCapturedClick = false;

let activeObject = null;
function activateObject(id) {
    activeObject = id;
    activeStore.setActive(true);
    const obj = objects[id];
    obj.style.outline = '2px solid red';
    objectManager.setActiveObject({id, pm:propertyManagers[id]});
    hasCapturedClick = true;
    setTimeout(() => {
        hasCapturedClick = false;
    }, 0);
}

function deactivateObject() {
    if (hasCapturedClick) {
        return;
    }
    if (activeObject) {
        const obj = objects[activeObject];
        obj.style.outline = '';
    }
    activeObject = null;
    activeStore.setActive(false);
}

function builder(virtualElement, renderedChild) {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.appendChild(renderedChild);
    const uniqueId = getUniqueSelectorPath(virtualElement);
    objects[uniqueId] = g;
    const pm = new PropertyManager(initContext, uniqueId+"_transform");
    propertyManagers[uniqueId] = pm;
    const x = createProperty('x','x', 'numeric', 0);
    const y = createProperty('y','y', 'numeric', 0);
    const anchorX = createProperty('anchorX','anchorX', 'numeric', 0);
    const anchorY = createProperty('anchorY','anchorY', 'numeric', 0);
    const rotation = createProperty('rotation','rotation', 'numeric', 0);
    const scaleX = createProperty('scaleX','scaleX', 'numeric', 1);
    const scaleY = createProperty('scaleY','scaleY', 'numeric', 1);
    const skewX = createProperty('skewX','skewX', 'numeric', 0);
    const skewY = createProperty('skewY','skewY', 'numeric', 0);
    pm.registerProperty(x);
    pm.registerProperty(y);
    pm.registerProperty(anchorX);
    pm.registerProperty(anchorY);
    pm.registerProperty(rotation);
    pm.registerProperty(scaleX);
    pm.registerProperty(scaleY);
    pm.registerProperty(skewX);
    pm.registerProperty(skewY);

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

    const width = initContext.globalConstants['sceneWidth'] ? parseInt(initContext.globalConstants['sceneWidth']) : 800;
    const height = initContext.globalConstants['sceneHeight'] ? parseInt(initContext.globalConstants['sceneHeight']) : 600;

    const pm = propertyManagers[uniqueId];
    // x, y, anchorX, anchorY, rotation, scaleX, scaleY, skewX, skewY
    const x = pm.remapValueIf01('x', [-width,width]);
    const y = pm.remapValueIf01('y', [-height,height]);
    const anchorX = pm.remapValueIf01('anchorX', [-width,width]);
    const anchorY = pm.remapValueIf01('anchorY', [-height,height]);
    const rotation = pm.remapValueIf01('rotation', [0,360]);
    const scaleX = pm.remapValueIf01('scaleX', [0.000,10]);
    const scaleY = pm.remapValueIf01('scaleY', [0.000,10]);
    const skewX = pm.remapValueIf01('skewX', [-1,1]);
    const skewY = pm.remapValueIf01('skewY', [-1,1]);

    const matrix = `matrix(${scaleX}, ${skewX}, ${skewY}, ${scaleY}, ${0}, ${0})`;
    const obj = objects[uniqueId];
    obj.setAttribute('transform', `
    translate(${x} ${y})
    translate(${anchorX} ${anchorY})
    ${matrix}
    rotate(${rotation})
    translate(${-anchorX} ${-anchorY})
    `);
}

// Allow all native SVG element tag names
const tagNames = [
    'super-rect','circle', 'ellipse', 'line', 'path', 'polygon', 'polyline', 'rect', 'text', 'g', 'svg', 'use', 'image', 'marker', 'symbol'
];





export { builder, updater, tagNames, id, init, commonUIBuilder };