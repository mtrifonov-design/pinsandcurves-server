// import react dom
import React from 'react';
import { createRoot } from 'react-dom/client';
import CommonUIBox from './CommonUIBox';
import ActiveStore from '../UIToolBox/ActiveStore';
import PropertyManager, { createProperty} from '../UIToolBox/PropertyManager';
import ObjectManager from '../UIToolBox/ObjectManager';
import { getUniqueSelectorPath } from '../UIToolBox/utils';
import interpolatePathTransform from './transformAlongPath';

const id = "mtrif.pathtransform";
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

    if (renderedChildren.length < 2) {
        return g;
    }


    renderedChildren.forEach(child => {
        g.appendChild(child);
    });
    const uniqueId = getUniqueSelectorPath(virtualElement);
    objects[uniqueId] = g;
    const pm = new PropertyManager(initContext, uniqueId);
    propertyManagers[uniqueId] = pm;
    const progress = createProperty('progress','progress', 'numeric', 0);
    pm.registerProperty(progress);

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

    const pm = propertyManagers[uniqueId];
    const progress = pm.remapValue('progress', [0,1]);

    const path = obj.querySelector('path');
    if (!path) {
        return;
    }
    const secondChild = obj.children[1];
    if (!secondChild) {
        return;
    }
    const transformString = interpolatePathTransform(path, progress);
    secondChild.setAttribute('transform', transformString);
}

// Allow all native SVG element tag names
const tagNames = [
    'polar-transform'
];





export { builder, updater, tagNames, id, init, commonUIBuilder };