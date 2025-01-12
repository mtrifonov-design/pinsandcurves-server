/**
 * Finds the closest geometry element (e.g., <circle>, <path>, etc.) in the subtree of an SVG <g> element.
 * @param gElement - The SVG <g> element to search within.
 * @returns The closest geometry element, or null if none is found.
 */
function findClosestGeometryElement(gElement: SVGGElement): SVGGeometryElement | null {
    const geometryTags = new Set(['circle', 'rect', 'path', 'polygon', 'line', 'ellipse']);
    
    // Helper function to recursively find geometry elements
    const findGeometryElement = (element: Element): SVGGeometryElement | null => {
      if (geometryTags.has(element.tagName)) {
        return element as SVGGeometryElement;
      }
      for (const child of Array.from(element.children)) {
        const result = findGeometryElement(child);
        if (result) {
          return result;
        }
      }
      return null;
    };
  
    return findGeometryElement(gElement);
  }
  
  export { findClosestGeometryElement };