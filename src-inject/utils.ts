export function isHTMLElement<T>(a: T): a is HTMLElement & T {
  return a && a instanceof HTMLElement;
}

export function isHTMLElementWithClass<T>(
  a: T,
  className: string
): a is HTMLElement & T {
  return isHTMLElement(a) && a.classList.contains(className);
}
