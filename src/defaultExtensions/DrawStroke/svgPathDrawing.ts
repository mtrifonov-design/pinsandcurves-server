type SvgGeometryElement = SVGPathElement | SVGRectElement | SVGEllipseElement | SVGLineElement | SVGPolygonElement | SVGPolylineElement;

type GeometryProgress = {
  element: SvgGeometryElement;
  strokeLength: number;
  strokeProgress: number;
};

/**
 * Updates the stroke-dasharray and stroke-dashoffset of geometry elements to simulate a "drawing effect."
 *
 * @param elements - A list of SVG elements to process.
 * @param progress - A number between 0 and 1 representing the drawing progress.
 * @returns An array of objects describing the stroke progress for each geometry element.
 */
function updateDrawingProgress(elements: SVGElement[], progress: number): GeometryProgress[] {
  // Filter for geometry elements that can have a stroke
  const geometryElements = elements.filter(
    (el): el is SvgGeometryElement =>
      el instanceof SVGPathElement ||
      el instanceof SVGRectElement ||
      el instanceof SVGEllipseElement ||
      el instanceof SVGLineElement ||
      el instanceof SVGPolygonElement ||
      el instanceof SVGPolylineElement
  );

  // Calculate total path lengths and prepare results
  const lengths = geometryElements.map(el => {
    const length = (el as SVGGeometryElement).getTotalLength?.() || 0;
    return { element: el, strokeLength: length };
  });

  const totalPathLength = lengths.reduce((sum, item) => sum + item.strokeLength, 0);
  const targetLength = totalPathLength * progress;

  let accumulatedLength = 0;
  const progressData: GeometryProgress[] = [];

  for (const { element, strokeLength } of lengths) {
    const remainingLength = targetLength - accumulatedLength;

    if (remainingLength > 0) {
      const currentProgress = Math.min(remainingLength / strokeLength, 1);
      progressData.push({ element, strokeLength, strokeProgress: currentProgress });

      // Update element stroke-dasharray and stroke-dashoffset
      element.style.strokeDasharray = `${strokeLength}`;
      element.style.strokeDashoffset = `${strokeLength * (1 - currentProgress)}`;

      accumulatedLength += strokeLength;
    } else {
      progressData.push({ element, strokeLength, strokeProgress: 0 });

      // Ensure the element stroke is hidden
      element.style.strokeDasharray = `${strokeLength}`;
      element.style.strokeDashoffset = `${strokeLength}`;
    }
  }

  return progressData;
}

export default updateDrawingProgress;