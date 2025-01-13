/**
 * Interpolates a transform value for a point on an SVG path based on progress.
 * @param {SVGPathElement} path - The SVG path element.
 * @param {number} progress - A value between 0 and 1 indicating progress along the path.
 * @returns {string} The transform value as a string (e.g., "translate(x, y)").
 */
function interpolatePathTransform(path : SVGPathElement, progress : number) {
    if (!(path instanceof SVGPathElement)) {
        throw new Error("The provided element is not an SVGPathElement.");
    }

    if (progress < 0 || progress > 1) {
        throw new Error("Progress must be a value between 0 and 1.");
    }

    // Get the total length of the path
    const totalLength = path.getTotalLength();

    // Get the starting point of the path
    const startPoint = path.getPointAtLength(0);

    // Get the point at the specified progress
    const targetLength = totalLength * progress;
    const targetPoint = path.getPointAtLength(targetLength);

    // Calculate the transform values relative to the start point
    const deltaX = targetPoint.x - startPoint.x;
    const deltaY = targetPoint.y - startPoint.y;

    // Return the transform string
    return `translate(${deltaX}, ${deltaY})`;
}

// // Example usage:
// const svgPath = document.querySelector("path"); // Select your SVG path element
// const progress = 0.5; // 50% along the path
// const transformValue = interpolatePathTransform(svgPath, progress);
// console.log(transformValue); // Output: "translate(x, y)"

export default interpolatePathTransform;