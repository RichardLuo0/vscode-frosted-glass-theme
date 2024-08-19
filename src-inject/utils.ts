export function isHTMLElement<T>(a: T): a is HTMLElement & T {
  return a && a instanceof HTMLElement;
}

export function isHTMLElementWithClass<T>(
  a: T,
  className: string
): a is HTMLElement & T {
  return isHTMLElement(a) && a.classList.contains(className);
}

const path = import.meta.url;
const scriptPath = path.substring(0, path.lastIndexOf("/") + 1);
export function getScriptPath() {
  return scriptPath;
}

export function makeAbsolutePath(url: string) {
  return url.startsWith(".") || url.startsWith("..")
    ? getScriptPath() + url
    : `vscode-file://vscode-app/${url}`;
}
