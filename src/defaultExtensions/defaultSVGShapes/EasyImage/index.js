const id = "mtrif.image";

let initContext;
function init(ext) {
    initContext = ext;
}


function builder(virtualElement, renderedChildren) {
    const image = document.createElementNS('http://www.w3.org/2000/svg', 'image');
    const href = virtualElement.getAttribute('src');
    image.setAttribute('href', href);

    // Temporary placeholder width and height
    image.setAttribute('x', 0);
    image.setAttribute('y', 0);

    // Create a standard HTML Image to load the intrinsic dimensions
    const tempImg = new Image();
    tempImg.src = href;
    tempImg.onload = () => {
        const intrinsicWidth = tempImg.naturalWidth;
        const intrinsicHeight = tempImg.naturalHeight;

        // Center the image based on intrinsic dimensions
        image.setAttribute('x', -0.5 * intrinsicWidth);
        image.setAttribute('y', -0.5 * intrinsicHeight);
        image.setAttribute('width', intrinsicWidth);
        image.setAttribute('height', intrinsicHeight);
    };

    // Optionally handle loading errors
    tempImg.onerror = () => {
        console.error(`Failed to load image: ${href}`);
    };

    return image;
}


const tagNames = ['easy-image'];
export { builder,  tagNames, id, init };