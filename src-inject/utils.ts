export function isHTMLElement<T>(a: T): a is HTMLElement & T {
  return a && a instanceof HTMLElement;
}

export function isHTMLElementWithClass<T>(
  a: T,
  className: string
): a is HTMLElement & T {
  return isHTMLElement(a) && a.classList.contains(className);
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
