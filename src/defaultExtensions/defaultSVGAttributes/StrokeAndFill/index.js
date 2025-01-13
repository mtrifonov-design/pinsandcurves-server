// import react dom
import React from 'react';
import { createRoot } from 'react-dom/client';
import CommonUIBox from './CommonUIBox';
import ActiveStore from '../../UIToolBox/ActiveStore';
import PropertyManager, { createProperty} from '../../UIToolBox/PropertyManager';
import ObjectManager from '../../UIToolBox/ObjectManager';
import { getUniqueSelectorPath } from '../../UIToolBox/utils';
import { findClosestGeometryElement } from './findClosestGeometryElement';

const id = "mtrif.strokeandfill";
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
    objectManager.setActiveObject({id, pm:propertyManagers[id]});
}

function deactivateObject() {
    activeObject = null;
    activeStore.setActive(false);
}

function builder(virtualElement, renderedChild) {
    console.log("VVVV",virtualElement)
    console.log(renderedChild)

    const uniqueId = getUniqueSelectorPath(virtualElement);
    const closestGeometryElement = findClosestGeometryElement(renderedChild);
    if (!closestGeometryElement) {
        return renderedChild;
    }
    objects[uniqueId] = closestGeometryElement;
    const pm = new PropertyManager(initContext, uniqueId+"_strokeandfill");
    propertyManagers[uniqueId] = pm;
    const stroke = createProperty('stroke','stroke', 'string', "blue");
    const strokeWidth = createProperty('strokeWidth','strokeWidth', 'numeric', 1);
    const fill = createProperty('fill','fill', 'string', "pink");
    pm.registerProperty(stroke);
    pm.registerProperty(strokeWidth);
    pm.registerProperty(fill);

    virtualElement.addEventListener('select', () => {
        activateObject(uniqueId);
    })
    virtualElement.addEventListener('deselect', () => {
        deactivateObject();
    })

    initContext.rootElement.addEventListener('click', () => {deactivateObject()});
    return renderedChild;
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
    if (!obj) {
        return;
    }

    const pm = propertyManagers[uniqueId];

    const stroke = pm.getValue('stroke');
    const strokeWidth = pm.remapValueIf01('strokeWidth', [0,10]);
    const fill = pm.getValue('fill');


    obj.setAttribute('stroke', stroke);
    obj.setAttribute('stroke-width', strokeWidth);
    obj.setAttribute('fill', fill);

}
// Elements that can receive fill and stroke (basic shapes and paths)
const tagNames = [
    'super-rect', 'circle', 'ellipse', 'line', 'path', 'polygon', 'polyline', 'rect', 'text'
];

export { builder, updater, tagNames, id, init, commonUIBuilder };