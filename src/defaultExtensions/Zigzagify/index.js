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

const id = "mtrif.zigzagify";
let initContext;
const activeStore = new ActiveStore(false);
const objectManager = new ObjectManager();
const propertyManagers = {};
const uiPropManagers = {};
function init(ext) {
    initContext = ext;
}
const objects = {};

let hasCapturedClick = false;

let activeObject = null;
function activateObject(id) {
    activeObject = id;
    activeStore.setActive(true);
    const obj = objects[id];
    obj.style.outline = '2px solid red';
    objectManager.setActiveObject({id, pm:propertyManagers[id], uipm: uiPropManagers[id]});
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
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    let closestGeometryElement = findClosestGeometryElement(renderedChild);
    const uniqueId = getUniqueSelectorPath(virtualElement);
    objects[uniqueId] = closestGeometryElement;

    virtualElement.addEventListener('select', (e) => {
        activateObject(uniqueId);
    });

    virtualElement.addEventListener('deselect', (e) => {
        deactivateObject();
    });

    if (closestGeometryElement === null) {
        return;
    }

    const pm = new PropertyManager(initContext, uniqueId);
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

    const uipm = new UIPropManager(initContext, uniqueId);
    uiPropManagers[uniqueId] = uipm;
    const enable = uiCreateProperty('enable', 'Enable', 'numeric', 1);
    uipm.registerProperty(enable);

    return renderedChild;
    // const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    // const g2 = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    // g2.setAttribute('visibility', 'hidden');
    // g.appendChild(g2);
    // g.appendChild(path);
    // g2.appendChild(renderedChild);
    // return g;
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

let cachedPath;

function getZigzagifyPathNode(node, { phase, frequency, samplePoints, amplitude, rounding }) {
    cachedPath = zigzagifyPathNode(node, { phase, frequency, samplePoints, amplitude, rounding });
}
const debouncedZigZagifyPathNode = debounce(getZigzagifyPathNode, 20);


function updater(virtualElement) {
    const uniqueId = getUniqueSelectorPath(virtualElement);
    const obj = objects[uniqueId];
    if (!obj) {
        return;
    }



    const pm = propertyManagers[uniqueId];

    const rounding = pm.remapValue('rounding', [0,1]);
    const phase = pm.remapValue('phase', [0,2 * Math.PI]);
    const frequency = Math.floor(pm.remapValue('frequency', [1,100]));
    const samplePoints = Math.floor(Math.max(pm.getValue('samplePoints'),0));
    const amplitude = pm.getValue('amplitude');

    const enabled = uiPropManagers[uniqueId].getValue('enable');
    if (enabled) {
    const d = zigzagifyPathNode(obj, { phase, frequency, samplePoints, amplitude, rounding });
    // debouncedZigZagifyPathNode(closestGeometryElement, { phase, frequency, samplePoints, amplitude, rounding });


    obj.setAttribute('d', d);
    }

}




const tagNames = ['zigzagify'];

export { builder, updater, tagNames, id, init, commonUIBuilder };