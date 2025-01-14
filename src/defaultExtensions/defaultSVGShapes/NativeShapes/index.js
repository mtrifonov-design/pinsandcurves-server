const id = "mtrif.nativesvg";

let initContext;
function init(ext) {
    initContext = ext;
}

/**
 * Parses attributes from a virtual element and applies them to an SVG element.
 * @param {Element} virtualElement - The source virtual element.
 * @param {Element} svgElement - The target SVG element.
 */
function parseAndApplyAttributes(virtualElement, svgElement) {
    const attributes = virtualElement.attributes;
    for (let i = 0; i < attributes.length; i++) {
        const attr = attributes[i];
        svgElement.setAttribute(attr.name, attr.value);
    }
}

function handleSpecialElements(virtualElement, svgElement) {

    // if svg or image, transform by -50%, -50%
    const tagName = virtualElement.tagName;
    if (tagName === 'svg') {
        // get width and height
        const width = parseInt(svgElement.getAttribute('width') || "0");
        const height = parseInt(svgElement.getAttribute('height') || "0");
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.appendChild(svgElement);
        const innerg = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        innerg.setAttribute('transform', `translate(${-width / 2} ${-height / 2})`);
        g.appendChild(innerg);
        innerg.appendChild(svgElement);
        return g;
    }

}


/**
 * Builds an SVG element based on the virtual element tag name and attributes.
 * @param {Element} virtualElement - The virtual element to convert.
 * @param {Element} renderedChild - Child elements to be appended to the SVG element.
 * @returns {Element} - The constructed SVG element.
 */
function builder(virtualElement, renderedChildren) {
    const tagName = virtualElement.tagName;
    let svgElement = document.createElementNS('http://www.w3.org/2000/svg', tagName);

    // Parse and apply attributes
    parseAndApplyAttributes(virtualElement, svgElement);




    // Append rendered children if provided
    if (renderedChildren) {
        renderedChildren.forEach(renderedChild => svgElement.appendChild(renderedChild));
    }

    // get text content
    const textContent = virtualElement.textContent;
    const children = virtualElement.children;
    if (textContent && children.length === 0) {
        svgElement.textContent = textContent;
    }

    const el = handleSpecialElements(virtualElement, svgElement);
    if (el) {
        svgElement = el;
    }



    return svgElement;
}

// Allow all native SVG element tag names
const tagNames = [
    'circle', 'tspan', 'ellipse', 'line', 'path', 'polygon', 'polyline', 'rect', 'text', 'g', 'svg', 'defs', 'clipPath',
    'mask', 'pattern', 'image', 'marker', 'use', 'symbol', 'filter', 'feGaussianBlur', 'feOffset', 'feBlend',
    'feFlood', 'feColorMatrix', 'feComponentTransfer', 'feFuncR', 'feFuncG', 'feFuncB', 'feFuncA', 'feMerge',
    'feMergeNode', 'feSpecularLighting', 'feDiffuseLighting', 'feDistantLight', 'fePointLight', 'feSpotLight',
    'feTurbulence', 'feDisplacementMap', 'feMorphology', 'feTile', 'feConvolveMatrix', 'feDropShadow',
    'feImage', 'feComposite', "stop", "linearGradient", "radialGradient",

];

export { builder, tagNames, id, init };
