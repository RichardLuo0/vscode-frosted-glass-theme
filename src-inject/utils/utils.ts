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

export const css = (sa: TemplateStringsArray, ...args: any[]) =>
  sa.reduce((acc, cur, i) => {
    const arg = args[i];
    return arg ? acc + cur + arg : acc + cur;
  }, "");

let chromeMainVersion: number | undefined = undefined;
export function getChromeMainVersion() {
  if (chromeMainVersion) return chromeMainVersion;
  const mainVerStr = vscode.process.versions.chrome.match(/^\d+/)?.[0];
  return (chromeMainVersion = mainVerStr ? parseInt(mainVerStr, 10) : 0);
}

export function applyOpacity(color: string, opacity: number) {
  color = color.trim();
  if (color.startsWith("#")) {
    const alpha = Math.round(opacity * 255).toString(16);
    return color.length === 7 ? color + alpha : color;
  }

  const data = color.slice(color.indexOf("(") + 1, -1).split(",");
  if (data.length < 4) {
    let prefix: string | undefined = undefined;
    if (color.startsWith("rgb")) prefix = "rgba";
    else if (color.startsWith("hsl")) prefix = "hsla";
    if (prefix !== undefined)
      return `${prefix}(${data[0]}, ${data[1]}, ${data[2]}, ${opacity})`;
  }

  return color;
}

export function extractOpacity(
  color: string,
  opacity: number | undefined
): [string, number] {
  const fallback = opacity ?? 1;
  color = color.trim();
  if (color.startsWith("#"))
    if (color.length === 9)
      return [color.substring(0, 7), parseInt(color.substring(7, 9), 16) / 255];
    else return [color, fallback];

  const data = color.slice(color.indexOf("(") + 1, -1).split(",");
  if (data.length === 4) {
    let prefix: string | undefined = undefined;
    if (color.startsWith("rgba")) prefix = "rgb";
    else if (color.startsWith("hsla")) prefix = "hsl";
    if (prefix !== undefined)
      return [
        `${prefix}(${data[0]}, ${data[1]}, ${data[2]})`,
        parseFloat(data[3].trim()),
      ];
  }

  return [color, fallback];
}
