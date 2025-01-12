// import react dom
import React from 'react';
import { createRoot } from 'react-dom/client';
import CommonUIBox from './CommonUIBox';
import ActiveStore from '../UIToolBox/ActiveStore';
import PropertyManager, { createProperty} from '../UIToolBox/PropertyManager';
import ObjectManager from '../UIToolBox/ObjectManager';
import { zigzagifyPathNode } from './zigzagify';
import { getUniqueSelectorPath } from '../UIToolBox/utils';
import { findClosestGeometryElement } from './findClosestGeometryElement';
import { debounce } from './utils';

const id = "mtrif.zigzagify";
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

let closestGeometryElement = null;
function builder(virtualElement, renderedChild) {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const uniqueId = getUniqueSelectorPath(virtualElement);
    objects[uniqueId] = path;

    virtualElement.addEventListener('select', (e) => {
        activateObject(uniqueId);
    });

    virtualElement.addEventListener('deselect', (e) => {
        console.log('deselect received');
        deactivateObject();
    });

    closestGeometryElement = findClosestGeometryElement(renderedChild);
    if (closestGeometryElement === null) {
        return;
    }


    const pm = new PropertyManager(initContext);
    propertyManagers[uniqueId] = pm;
    const stretch = createProperty('phase','phase', 'numeric', 0.0);
    const rounding = createProperty('rounding','rounding', 'numeric', 0);
    const frequency = createProperty('frequency','frequency', 'numeric', 20);
    const samplePoints = createProperty('samplePoints','samplePoints', 'numeric', 100);
    const amplitude = createProperty('amplitude','amplitude', 'numeric', 10);

    pm.registerProperty(stretch);
    pm.registerProperty(rounding);
    pm.registerProperty(frequency);
    pm.registerProperty(samplePoints);
    pm.registerProperty(amplitude);


    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    const g2 = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g2.setAttribute('visibility', 'hidden');
    g.appendChild(g2);
    g.appendChild(path);
    g2.appendChild(renderedChild);
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
function updaterRaw(virtualElement) {
    if (closestGeometryElement === null) {
        return;
    }


    const uniqueId = getUniqueSelectorPath(virtualElement);
    const pm = propertyManagers[uniqueId];

    const rounding = pm.remapValue('rounding', [0,1]);
    const phase = pm.remapValue('phase', [0,1]);
    const frequency = Math.floor(pm.remapValue('frequency', [1,100]));
    const samplePoints = Math.floor(Math.max(pm.getValue('samplePoints'),0));
    const amplitude = pm.getValue('amplitude');
    const path = zigzagifyPathNode(closestGeometryElement, { phase, frequency, samplePoints, amplitude, rounding });
    objects[uniqueId].setAttribute('d', path);
    objects[uniqueId].setAttribute('fill', "white");
    objects[uniqueId].setAttribute('stroke', "black");
    objects[uniqueId].setAttribute('stroke-width', 1);
}
const tagNames = ['zigzagify'];

const updater = debounce(updaterRaw, 20);

export { builder, updater, tagNames, id, init, commonUIBuilder };