// import react dom
import React from 'react';
import { createRoot } from 'react-dom/client';
import CommonUIBox from './CommonUIBox';
import ActiveStore from '../../UIToolBox/ActiveStore';
import PropertyManager, { createProperty} from '../../UIToolBox/PropertyManager';
import ObjectManager from '../../UIToolBox/ObjectManager';
import generateSuperRectPath from './generateSuperRectPath';
import { getUniqueSelectorPath } from '../../UIToolBox/utils';

const id = "mtrif.superrect";
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

    virtualElement.addEventListener('select', () => {
        activateObject(uniqueId);
    })
    virtualElement.addEventListener('deselect', () => {
        deactivateObject();
    })


    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const uniqueId = getUniqueSelectorPath(virtualElement);
    objects[uniqueId] = path;
    const pm = new PropertyManager(initContext);
    propertyManagers[uniqueId] = pm;
    const stretch = createProperty('stretch','stretch', 'numeric', 0.5);
    pm.registerProperty(stretch);
    const rounding = createProperty('rounding','rounding', 'numeric', 0);
    pm.registerProperty(rounding);
    initContext.rootElement.addEventListener('click', () => {deactivateObject()});
    return path;
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
    const pm = propertyManagers[uniqueId];
    //// console.log("pm",pm);
    const stretch = pm.remapValue('stretch', [0.001,0.999]);
    const rounding = pm.remapValue('rounding', [0,1]);

    
    const path = generateSuperRectPath({ stretch, rounding });
    objects[uniqueId].setAttribute('d', path);
    objects[uniqueId].setAttribute('fill', "white");
    objects[uniqueId].setAttribute('stroke', "black");
    objects[uniqueId].setAttribute('stroke-width', 1);
}
const tagNames = ['super-rect'];
export { builder, updater, tagNames, id, init, commonUIBuilder };