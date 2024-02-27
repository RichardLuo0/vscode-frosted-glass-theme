export function isHTMLElement(a?: any): a is HTMLElement {
  return a && a instanceof HTMLElement;
}
