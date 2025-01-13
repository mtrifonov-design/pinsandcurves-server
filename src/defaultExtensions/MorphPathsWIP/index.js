// import react dom
import React from 'react';
import { createRoot } from 'react-dom/client';
import CommonUIBox from './CommonUIBox';
import ActiveStore from '../UIToolBox/ActiveStore';
import UIPropManager, { createProperty as uiCreateProperty} from '../UIToolBox/UIPropManager';
import PropertyManager, { createProperty} from '../UIToolBox/PropertyManager';
import ObjectManager from '../UIToolBox/ObjectManager';
import { zigzagifyPathNode } from './zigzagify';
import { getUniqueSelectorPath } from '../UIToolBox/utils';
import { findClosestGeometryElement } from './findClosestGeometryElement';
import { debounce } from './utils';
import updateDrawingProgress from './svgPathDrawing';

const id = "mtrif.drawstroke";
let initContext;
const activeStore = new ActiveStore(false);
const objectManager = new ObjectManager();
const propertyManagers = {};
const uiPropManagers = {};
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
    objectManager.setActiveObject({id, pm:propertyManagers[id], uipm: uiPropManagers[id]});
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
    const uniqueId = getUniqueSelectorPath(virtualElement);
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    renderedChildren.forEach(child => {
        g.appendChild(child);
    });
    objects[uniqueId] = g;

    virtualElement.addEventListener('select', (e) => {
        activateObject(uniqueId);
    });

    virtualElement.addEventListener('deselect', (e) => {
        deactivateObject();
    });

    const pm = new PropertyManager(initContext, uniqueId);
    propertyManagers[uniqueId] = pm;
    const progress = createProperty('progress','progress', 'numeric', 0.5);

    pm.registerProperty(progress);


    const uipm = new UIPropManager(initContext, uniqueId);
    uiPropManagers[uniqueId] = uipm;
    const enable = uiCreateProperty('enable', 'Enable', 'numeric', 1);
    uipm.registerProperty(enable);

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
    const pm = propertyManagers[uniqueId];
    const progress = pm.remapValue('progress', [0,1]);
    const enabled = uiPropManagers[uniqueId].getValue('enable');
    const geometryElements = obj.querySelectorAll('path, circle, ellipse, rect, polygon, polyline');
    if (enabled) {
        updateDrawingProgress(Array.from(geometryElements), progress);
    }

}




const tagNames = ['draw-stroke'];

export { builder, updater, tagNames, id, init, commonUIBuilder };