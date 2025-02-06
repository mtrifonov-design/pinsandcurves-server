import React from 'react';
import { createRoot } from 'react-dom/client';
import CommonUIBox from './TagCommonUIBox';
import ActiveStore from '../defaultExtensions/UIToolBox/ActiveStore';
import ObjectManager from '../defaultExtensions/UIToolBox/ObjectManager';
import { getUniqueSelectorPath } from '../defaultExtensions/UIToolBox/utils';
import UIPropManager, { createProperty as uiCreateProperty} from '../defaultExtensions/UIToolBox/UIPropManager';


const id = "mtrif.mouseclick.mousepathtags";
let initContext;
const activeStore = new ActiveStore(false);
const objectManager = new ObjectManager();
const uiPropManagers = {};
function init(ext) {
    initContext = ext;
}
const objects = {};

let activeObject = null;
function activateObject(id) {
    activeObject = id;
    activeStore.setActive(true);
    objectManager.setActiveObject({id, uipm:uiPropManagers[id]});
}

function deactivateObject() {
    activeObject = null;
    activeStore.setActive(false);
}

function builder(virtualElement, renderedChildren) {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    // renderedChildren.forEach(child => {
    //     g.appendChild(child);
    // });
    const uniqueId = getUniqueSelectorPath(virtualElement);
    objects[uniqueId] = renderedChildren ? renderedChildren[0] : g;

    virtualElement.addEventListener('select', () => {
        activateObject(uniqueId);
    })
    virtualElement.addEventListener('deselect', () => {
        deactivateObject();
    })

    const uipm = new UIPropManager(initContext, uniqueId);
    uiPropManagers[uniqueId] = uipm;
    const enable = uiCreateProperty('enable', 'Enable', 'numeric', 0);
    uipm.registerProperty(enable);

    initContext.rootElement.addEventListener('click', () => {deactivateObject()});
    return objects[uniqueId];
}

let commonUIBox;
function initCommonUI() {
    const box = document.createElement('div');
    createRoot(box).render(CommonUIBox({ctx: initContext, activeStore, objectManager, tagTitle: 'Mark as Mouse Path'}));
    return box;
}
function commonUIBuilder() {
    commonUIBox = initCommonUI();
    return commonUIBox;
}
function updater(virtualElement) {
    const uniqueId = getUniqueSelectorPath(virtualElement);
    const obj = objects[uniqueId];
    const enabled = uiPropManagers[uniqueId].getValue('enable');
    if (enabled) {
        obj.classList.add('__markedAsMousePath');
        //obj.setAttribute('visibility', 'hidden');
    } else {
        obj.classList.remove('__markedAsMousePath');
        // obj.setAttribute('visibility', 'visible');
    }
}

// Allow all native SVG element tag names
const tagNames = [
   'path', 'polyline'
];





export { builder, updater, tagNames, id, init, commonUIBuilder };