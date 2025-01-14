// import react dom
import React from 'react';
import { createRoot } from 'react-dom/client';
import CommonUIBox from './CommonUIBox';
import ActiveStore from '../defaultExtensions/UIToolBox/ActiveStore';
import PropertyManager, { createProperty} from '../defaultExtensions/UIToolBox/PropertyManager';
import ObjectManager from '../defaultExtensions/UIToolBox/ObjectManager';
import { getUniqueSelectorPath } from '../defaultExtensions/UIToolBox/utils';

const id = "mtrif.mouseclick.main";
let initContext;
const activeStore = new ActiveStore(false);
const objectManager = new ObjectManager();
const propertyManagers = {};
function init(ext) {
    initContext = ext;
}
const objects = {};

function createGaussianFalloffFunction(times, sigma = 1) {
    // Gaussian function with specified sigma
    const gaussian = (x) => Math.exp(-(x * x) / (2 * sigma * sigma));
  
    return function(time,offset) {
      let result = 0;
  
      for (const t of times) {
        // Calculate Gaussian falloff for the current time
        const falloff = gaussian(time - t - (3*sigma) - offset);
  
        // Combine using an "OR"-like logic (capping at 1)
        result = Math.min(1, result + falloff - result * falloff);
      }
  
      return result;
    };
  }

//   function createGaussianFalloffFunction(times, sigma = 1, offset = 0) {
//     // Gaussian function with specified sigma
//     const gaussian = (x) => Math.exp(-(x * x) / (2 * sigma * sigma));
  
//     return function(time) {
//       let result = 0;
  
//       for (const t of times) {
//         // Adjust the time with the offset so the falloff begins just as the event happens
//         const adjustedTime = t + offset;
  
//         // Calculate Gaussian falloff for the current time
//         const falloff = gaussian(time - adjustedTime);
  
//         // Combine using an "OR"-like logic (capping at 1)
//         result = Math.min(1, result + falloff - result * falloff);
//       }
  
//       return result;
//     };
//   }


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

function builder(virtualElement, renderedChildren) {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    renderedChildren.forEach(child => {
        g.appendChild(child);
    });
    const uniqueId = getUniqueSelectorPath(virtualElement);
    objects[uniqueId] = g;
    const pm = new PropertyManager(initContext, uniqueId);
    propertyManagers[uniqueId] = pm;
    const x = createProperty('clicks','clicks', 'string');
    const y = createProperty('mouseprogress','mouse progress', 'numeric', 0.5);
    pm.registerProperty(x);
    pm.registerProperty(y);

    virtualElement.addEventListener('select', () => {
        activateObject(uniqueId);
    })
    virtualElement.addEventListener('deselect', () => {
        deactivateObject();
    })
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
    const pm = propertyManagers[uniqueId];
    const mouseprogress = pm.remapValue('mouseprogress', [0,1]);

    const obj = objects[uniqueId];

    const clickableElements = Array.from(obj.getElementsByClassName('__markedAsClickable'));
    const mouseCursors = Array.from(obj.getElementsByClassName('__markedAsMouseCursor'));
    let mouseCursor = mouseCursors.length > 0 ? mouseCursors[0] : undefined;

    
    
    const mousePaths = Array.from(obj.getElementsByClassName('__markedAsMousePath'));
    let mousePath = mousePaths.length > 0 ? mousePaths[0] : undefined;
    if (mousePath && mousePath.tagName !== 'path') {
        const paths = Array.from(mousePath.getElementsByTagName('path'));
        mousePath = paths.length > 0 ? paths[0] : undefined;
    }

    const mousePosition = {x: 0, y: 0};
    if (mouseCursor && mousePath) {
        const totalLength = mousePath.getTotalLength();
        let point = mousePath.getPointAtLength(mouseprogress * totalLength);
        mousePosition.x = point.x;
        mousePosition.y = point.y;
    }

    
    const clicksSignalName = pm.properties['clicks'].signalName;
    const clicksSignalConnected = pm.properties['clicks'].signalConnected;
    if (clicksSignalConnected) {
        const project = initContext.getProject();
        const signalId = project.orgData.signalIds.find(id => project.orgData.signalNames[id] === clicksSignalName);
        const signal = project.signalData[signalId];
        // console.log(pm,signalId, signal, project, clicksSignalName);
        const clickTimes = Object.values(signal.pinTimes)
        const falloffFunction = createGaussianFalloffFunction(clickTimes,1.5);
        const currentFrame = project.timelineData.playheadPosition;
        const scaleValue = 0.9 + (1 - falloffFunction(currentFrame,1)) * 0.1;

        for (const clickable of clickableElements) {
            const bbox = clickable.getBBox();
            // check if mouse is within clickable element
            if (mousePosition.x > bbox.x && mousePosition.x < bbox.x + bbox.width && mousePosition.y > bbox.y && mousePosition.y < bbox.y + bbox.height) {
                clickable.setAttribute('fill', 'red');
                
            } else {
                clickable.setAttribute('fill', 'blue');
            }
            const centerX = bbox.x + bbox.width / 2;
            const centerY = bbox.y + bbox.height / 2;
            clickable.setAttribute('transform', `
                translate(${centerX},${centerY})
                scale(${scaleValue})
                translate(-${centerX},-${centerY})
            `);
        }

        if (mouseCursor && mousePath) {
            const startingPoint = mousePath.getPointAtLength(0);
            const point = {x: mousePosition.x, y: mousePosition.y};
            point.x -= startingPoint.x;
            point.y -= startingPoint.y;
            const mouseScaleValue = 0.8 + (1 - falloffFunction(currentFrame,0)) * 0.3;
            // Get the bounding box of the SVG element
            const bbox = mouseCursor.getBBox();

            // Calculate the center coordinates of the bounding box
            const centerX = bbox.x + bbox.width / 2;
            const centerY = bbox.y + bbox.height / 2;

            // Set the transformation attribute to scale around the center
            mouseCursor.setAttribute('transform', `
                translate(${point.x},${point.y})
                translate(${centerX}, ${centerY}) 
                scale(${mouseScaleValue}) 
                translate(${-centerX}, ${-centerY})
            `);

        }

    }


}

// Allow all native SVG element tag names
const tagNames = [
    'scene'
];





export { builder, updater, tagNames, id, init, commonUIBuilder };