import config from "./config.json" with { type: "json" };

const { opacity } = config;

const colorVarList: [string, number, string?][] = [
  ["--vscode-menu-selectionBackground", opacity.selection],
  ["--vscode-quickInputList-focusBackground", opacity.selection],
  ["--vscode-editorSuggestWidget-selectedBackground", opacity.selection],
  ["--vscode-menu-border", opacity.border],
  ["--vscode-widget-border", opacity.border],
  ["--vscode-editorWidget-border", opacity.border],
  ["--vscode-editorHoverWidget-border", opacity.border],
  ["--vscode-editorSuggestWidget-border", opacity.border],
  ["--vscode-menu-separatorBackground", opacity.separator],
];

export function registerColorVar(
  colorVar: string,
  opacity: number,
  newColorVar?: string
) {
  colorVarList.push([colorVar, opacity, newColorVar]);
}

export function observeThemeColorChange(monacoWorkbench: HTMLElement) {
  const document = monacoWorkbench.ownerDocument;

  const contributedColorTheme = document.querySelector(
    "head > style.contributedColorTheme"
  );
  if (!contributedColorTheme) return;

  setupColor(monacoWorkbench, contributedColorTheme);
  const observer = new MutationObserver(
    setupColor.bind(globalThis, monacoWorkbench, contributedColorTheme)
  );
  observer.observe(contributedColorTheme, {
    characterData: false,
    attributes: false,
    childList: true,
    subtree: false,
  });
}

function applyOpacity(color: string, opacity: number) {
  color = color.trim();
  if (color.startsWith("#")) {
    const alpha = Math.round(opacity * 255).toString(16);
    return color.length === 7 ? color + alpha : color;
  }
  const data = color.slice(color.indexOf("(") + 1, -1);
  if (color.startsWith("rgb")) {
    const splits = data.split(",");
    if (splits.length >= 4) return color;
    const [red, green, blue] = splits.map(Number);
    return `rgba(${red}, ${green}, ${blue}, ${opacity})`;
  }
  if (color.startsWith("hsl")) {
    const splits = data.split(",");
    if (splits.length >= 4) return color;
    const [hue, saturation, lightness] = splits.map(parseFloat);
    return `hsla(${hue}, ${saturation}%, ${lightness}%, ${opacity})`;
  }
  return color;
}

function findStyleSheetList(ownerNode: Element | null) {
  return Array.from(document.styleSheets).find(
    styleSheetList => styleSheetList.ownerNode === ownerNode
  );
}

function setupColor(monacoWorkbench: HTMLElement, ownerNode: Element) {
  const monacoWorkbenchCSSRule = findStyleSheetList(ownerNode)?.cssRules;
  if (!monacoWorkbenchCSSRule) return;

  const cssRule = monacoWorkbenchCSSRule[monacoWorkbenchCSSRule.length - 1];
  if (!(cssRule instanceof CSSStyleRule)) return;
  const cssStyle = cssRule.style;

  colorVarList.forEach(entry => {
    monacoWorkbench.style.setProperty(
      entry[2] ?? entry[0],
      applyOpacity(cssStyle.getPropertyValue(entry[0]), entry[1])
    );
  });
}
