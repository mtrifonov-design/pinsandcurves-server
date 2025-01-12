function getUniqueSelectorPath(element : Element) {
    let path = [];
    while (element.parentElement) {
      let index = Array.from(element.parentElement.children).indexOf(element);
      path.unshift(`${element.tagName}:nth-child(${index + 1})`);
      element = element.parentElement;
    }
    return path.join(' > ');
  }

  export { getUniqueSelectorPath };