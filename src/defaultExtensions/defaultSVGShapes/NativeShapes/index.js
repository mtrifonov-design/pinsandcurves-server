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


/**
 * Builds an SVG element based on the virtual element tag name and attributes.
 * @param {Element} virtualElement - The virtual element to convert.
 * @param {Element} renderedChild - Child elements to be appended to the SVG element.
 * @returns {Element} - The constructed SVG element.
 */
function builder(virtualElement, renderedChild) {
    const tagName = virtualElement.tagName.toLowerCase();
    const svgElement = document.createElementNS('http://www.w3.org/2000/svg', tagName);

    // Parse and apply attributes
    parseAndApplyAttributes(virtualElement, svgElement);

    // Append rendered children if provided
    if (renderedChild) {
        svgElement.appendChild(renderedChild);
    }

    return svgElement;
}

// Allow all native SVG element tag names
const tagNames = [
    'circle', 'ellipse', 'line', 'path', 'polygon', 'polyline', 'rect', 'text', 'g', 'svg', 'defs', 'clipPath',
    'mask', 'pattern', 'image', 'marker', 'use', 'symbol', 'filter', 'feGaussianBlur', 'feOffset', 'feBlend',
    'feFlood', 'feColorMatrix', 'feComponentTransfer', 'feFuncR', 'feFuncG', 'feFuncB', 'feFuncA', 'feMerge',
    'feMergeNode', 'feSpecularLighting', 'feDiffuseLighting', 'feDistantLight', 'fePointLight', 'feSpotLight',
    'feTurbulence', 'feDisplacementMap', 'feMorphology', 'feTile', 'feConvolveMatrix', 'feDropShadow',
    'feImage', 'feComposite',

];

export { builder, tagNames, id, init };
