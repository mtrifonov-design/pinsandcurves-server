function getUniqueSelectorPath(element : Element) {
    const elementId = element.getAttribute('id');
    if (elementId) {
      return `#${elementId}`;
    }

    let path = [];
    while (element.parentElement) {
      let index = Array.from(element.parentElement.children).indexOf(element);
      path.unshift(`${element.tagName}:nth-child(${index + 1})`);
      element = element.parentElement;
    }
    return path.join(' > ');
  }

  export { getUniqueSelectorPath };