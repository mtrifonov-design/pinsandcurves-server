// import react dom

import React from 'react';
import { createRoot } from 'react-dom/client';
import CommonUIBox from './CommonUIBox';
import ActiveStore from '../UIToolBox/ActiveStore';
import PropertyManager, { createProperty} from '../UIToolBox/PropertyManager';
import ObjectManager from '../UIToolBox/ObjectManager';
import { getUniqueSelectorPath } from '../UIToolBox/utils';
import "https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.11.1/p5.js"

const id = "mtrif.p5canvas";
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

const canvases = {};
const sketches = {};
const signals = {};

async function parseScript(src, id, width=800, height=600) {

    const getSignal = (name) => {
        if (!signals[name]) {
            return 0;
        }
        return signals[name];
    }

    try {
        const script = await import(src);
        const setup = script.setup ? script.setup : () => {};
        const draw = script.draw ? script.draw : () => {};
        let sketch = function (p) {
            p.setup = function () {
                const c = p.createCanvas(width,height);
                canvases[id] = c.canvas;
                c.canvas.style.display = 'none';  
                p.noLoop();
                setup(p);
            };
            p.draw = function () {

                // clear
                p.clear();
                draw(p,getSignal);
            };
        };
        sketches[id] = new p5(sketch);

    } catch (e) {
        console.warn(e);
    }
}



function builder(virtualElement, renderedChildren) {

    virtualElement.addEventListener('select', () => {
        activateObject(uniqueId);
    })
    virtualElement.addEventListener('deselect', () => {
        deactivateObject();
    })

    const image = document.createElementNS('http://www.w3.org/2000/svg', 'image');

    const width = initContext.globalConstants["sceneWidth"] ? parseInt(initContext.globalConstants["sceneWidth"]) : 800;
    const height = initContext.globalConstants["sceneHeight"] ? parseInt(initContext.globalConstants["sceneHeight"]) : 600;

    image.setAttribute('width', width);
    image.setAttribute('height', height);
    image.setAttribute('x', 0);
    image.setAttribute('y', 0);
    image.setAttribute('transform', `translate(${-width/2},${-height/2})`);
    image.setAttribute('preserveAspectRatio', 'none');

    const uniqueId = getUniqueSelectorPath(virtualElement);
    objects[uniqueId] = image;

    const pm = new PropertyManager(initContext, uniqueId);
    propertyManagers[uniqueId] = pm;

    let propertiesToRegister = virtualElement.getAttribute('signals');
    if (propertiesToRegister) {
        propertiesToRegister = JSON.parse(propertiesToRegister);
        // console.log(propertiesToRegister);
        propertiesToRegister.forEach(prop => {
            const property = createProperty(prop, prop, "numeric", 0);
            pm.registerProperty(property);
        });
    }

    // parse the attached script
    let src = virtualElement.getAttribute('src');
    if (src && src.startsWith('.')) {
        src = `${window.location.origin}${window.location.pathname}${src}`;
    }
    if (src) {
        parseScript(src,uniqueId,width,height);
    }

    return image;
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

    Object.values(pm.properties).forEach(prop => {
        const id = prop.propertyId;
        const type = prop.type;
        if (type === 'numeric') {
            const value = pm.remapValue(id, [0,1]);
            signals[id] = value;
        } else {
            const value = pm.getValue(id);
            signals[id] = value;
        }
    });

    const sketch = sketches[uniqueId];
    const canvas = canvases[uniqueId];
    if (sketch) {
        sketch.redraw();
    }
    if (canvas) {
        const dataUrl = canvas.toDataURL();
        objects[uniqueId].setAttribute('href', dataUrl);
    }
}
const tagNames = ['p5canvas'];
export { builder, updater, tagNames, id, init, commonUIBuilder };