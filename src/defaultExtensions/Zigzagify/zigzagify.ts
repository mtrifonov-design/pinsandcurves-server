type ZigzagParams = {
    phase: number; // Phase shift for the zigzag pattern
    frequency: number; // Frequency of zigzags along the path
    rounding: number; // Between 0 (linear zigzag) and 1 (smooth sine wave)
    samplePoints: number; // Number of points to sample along the path
    amplitude: number; // Magnitude of the zigzag distortion
};

/**
 * Transforms an SVG path node into a zigzagified version.
 * @param pathNode - The SVG path element.
 * @param params - Parameters for the zigzag transformation.
 * @returns A new SVG path string representing the zigzagified path.
 */
function zigzagifyPathNode(pathNode: SVGPathElement, params: ZigzagParams): string {
    const { phase, frequency, rounding, samplePoints, amplitude } = params;

    // Compute total length of the path
    const totalLength = pathNode.getTotalLength();

    // Helper: Compute a normal vector at a point along the path
    const getNormalAtPoint = (t: number): { x: number; y: number } => {
        const delta = 0.01;
        const point1 = pathNode.getPointAtLength(Math.max(0, t - delta));
        const point2 = pathNode.getPointAtLength(Math.min(totalLength, t + delta));

        const dx = point2.x - point1.x;
        const dy = point2.y - point1.y;
        const length = Math.sqrt(dx * dx + dy * dy);

        return { x: -dy / length, y: dx / length }; // Perpendicular vector normalized
    };

    // Sample points along the path and apply zigzag transformation
    const points: { x: number; y: number }[] = [];
    for (let i = 0; i <= samplePoints; i++) {
        const t = (i / samplePoints) * totalLength;
        const point = pathNode.getPointAtLength(t);
        const normal = getNormalAtPoint(t);

        // Zigzag displacement
        const offset =
            Math.sin((t / totalLength) * frequency * Math.PI * 2 + phase) *
            amplitude *
            (1 - rounding + rounding * Math.sin((t / totalLength) * Math.PI));

        const displacedPoint = {
            x: point.x + offset * normal.x,
            y: point.y + offset * normal.y,
        };

        points.push(displacedPoint);
    }

    // Reconstruct the path string
    const zigzagPath = points
        .map((p, i) => (i === 0 ? `M${p.x},${p.y}` : `L${p.x},${p.y}`))
        .join(' ');

    return zigzagPath + ' Z'; // Close the path
}



export type { ZigzagParams };
export { zigzagifyPathNode };