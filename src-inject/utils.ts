export function isHTMLElement<T>(a: T): a is HTMLElement & T {
  return a && a instanceof HTMLElement;
}

export function isHTMLElementWithClass<T>(
  a: T,
  className: string
): a is HTMLElement & T {
  return isHTMLElement(a) && a.classList.contains(className);
}

export function isKeyInObject<T extends Object>(
  key: PropertyKey,
  obj: T
): key is keyof T {
  return obj.hasOwnProperty(key);
}

let scriptFolder: string | undefined = undefined;
export function getScriptFolder() {
  if (scriptFolder) return scriptFolder;
  const scriptPath = import.meta.url;
  return (scriptFolder = scriptPath.substring(
    0,
    scriptPath.lastIndexOf("/") + 1
  ));
}

export function makeAbsolutePath(url: string) {
  return url.startsWith(".") || url.startsWith("..")
    ? getScriptFolder() + url
    : `vscode-file://vscode-app/${url}`;
}

export function getRelativePos(element: HTMLElement, e: MouseEvent) {
  const offset = element.getBoundingClientRect();
  const x = e.pageX - offset.left - window.scrollX;
  const y = e.pageY - offset.top - window.scrollY;
  return [x, y];
}
