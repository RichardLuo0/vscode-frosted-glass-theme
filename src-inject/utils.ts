export function isHTMLElement(a: any): a is HTMLElement {
  return a && a instanceof HTMLElement;
}

export function isHTMLElementWithClass(
  a: any,
  className: string
): a is HTMLElement {
  return isHTMLElement(a) && a.classList.contains(className);
}
