const id = "mtrif.background";

let initContext;
function init(ext) {
    initContext = ext;
}


function builder(virtualElement, renderedChild) {
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    const sceneWidth = initContext.globalConstants['sceneWidth'] || 800;
    const sceneHeight = initContext.globalConstants['sceneHeight'] || 600;
    const color = virtualElement.getAttribute('color') || 'white';
    rect.setAttribute('x', -sceneWidth / 2);
    rect.setAttribute('y', -sceneHeight / 2);
    rect.setAttribute('width', sceneWidth);
    rect.setAttribute('height', sceneHeight);
    rect.setAttribute('fill', color);
    rect.setAttribute('stroke', 'transparent');
    return rect;
}


const tagNames = ['background'];
export { builder,  tagNames, id, init };