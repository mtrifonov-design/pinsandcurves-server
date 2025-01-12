
// Generates an SVG path string for the FlexiShape
function generateSuperRectPath({
    stretch = 0.5, // stretch factor (< 0.5 = horizontal, > 0.5 = vertical)
    rounding = 0 // Corner rounding factor (0 = sharp, 1 = ellipse)
} = {}) {
    // Ensure area preservation by adjusting radiusY inversely to radiusX

    let sx = 1;
    const horizontal = stretch < 0.5;
    if (horizontal) {
        sx = 1 - 2 * stretch;
        // convert to a number between 1 and infinity, where 0 should be mapped to 1 and 1 to infinity
        sx = 1 / (1 - sx);
    } else {
        sx = 2 * stretch - 1;
        // convert to a number between 1 and infinity, where 0 should be mapped to 1 and 1 to infinity
        sx = 1 / (1 - sx);
        sx = 1 / sx;
    }


    const sy = 1 / sx;
    const radiusX = 100 * sx;
    const radiusY = 100 * sy;

    // Calculate control points for the rounded corners
    const rx = radiusX * (rounding); // Adjusted corner radius X
    const ry = radiusY * (rounding); // Adjusted corner radius Y

    // Start building the SVG path
    return [
        `M ${-radiusX + rx},${-radiusY}`, // Start at top-left corner
        `h ${2 * radiusX - 2 * rx}`, // Top edge
        `a ${rx},${ry} 0 0 1 ${rx},${ry}`, // Top-right corner
        `v ${2 * radiusY - 2 * ry}`, // Right edge
        `a ${rx},${ry} 0 0 1 -${rx},${ry}`, // Bottom-right corner
        `h ${-2 * radiusX + 2 * rx}`, // Bottom edge
        `a ${rx},${ry} 0 0 1 -${rx},-${ry}`, // Bottom-left corner
        `v ${-2 * radiusY + 2 * ry}`, // Left edge
        `a ${rx},${ry} 0 0 1 ${rx},-${ry}`, // Top-left corner
        "Z" // Close the path
    ].join(" ");
}

export default generateSuperRectPath;