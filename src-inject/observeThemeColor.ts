import config from "./config.json" assert { type: "json" };

const { opacity } = config;

const colorVarMap = new Map([
  ["--vscode-quickInputList-focusBackground", opacity.selection],
  ["--vscode-editorSuggestWidget-selectedBackground", opacity.selection],
  ["--vscode-menu-border", opacity.border],
  ["--vscode-widget-border", opacity.border],
  ["--vscode-editorWidget-border", opacity.border],
  ["--vscode-editorHoverWidget-border", opacity.border],
  ["--vscode-editorSuggestWidget-border", opacity.border],
  ["--vscode-menu-separatorBackground", opacity.separator],
]);

if (!config.revealEffect.enabled)
  colorVarMap.set("--vscode-menu-selectionBackground", opacity.selection);

const backgroundVarList = [
  "--vscode-editorHoverWidget-background",
  "--vscode-editorSuggestWidget-background",
  "--vscode-peekViewResult-background",
  "--vscode-quickInput-background",
  "--vscode-menu-background",
  "--vscode-notifications-background",
  "--vscode-editorHoverWidget-statusBarBackground",
  "--vscode-editorStickyScroll-background",
  "--vscode-listFilterWidget-background",
  "--vscode-editorWidget-background",
  "--vscode-notificationCenterHeader-background",
];
backgroundVarList.forEach((colorVar) => {
  colorVarMap.set(colorVar, opacity.menu);
});

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
  // Hexadecimal format
  if (color.startsWith("#")) {
    const alpha = Math.round(opacity * 255).toString(16);
    return color.length === 7 ? color + alpha : color.substring(0, 7) + alpha;
  }
  const data = color.slice(color.indexOf("(") + 1, -1);
  if (color.startsWith("rgb")) {
    const [red, green, blue] = data.split(",").map(Number);
    return `rgba(${red}, ${green}, ${blue}, ${opacity})`;
  }
  if (color.startsWith("hsl")) {
    const [hue, saturation, lightness] = data.split(",").map(parseFloat);
    return `hsla(${hue}, ${saturation}%, ${lightness}%, ${opacity})`;
  }
  return color;
}

function findStyleSheetList(ownerNode: Element | null) {
  return Array.from(document.styleSheets).find(
    (styleSheetList) => styleSheetList.ownerNode === ownerNode
  );
}

function setupColor(monacoWorkbench: HTMLElement, ownerNode: Element) {
  const monacoWorkbenchCSSRule = findStyleSheetList(ownerNode)?.cssRules;
  if (!monacoWorkbenchCSSRule) return;

  const cssRule = monacoWorkbenchCSSRule[monacoWorkbenchCSSRule.length - 1];
  if (!(cssRule instanceof CSSStyleRule)) return;
  const cssStyle = cssRule.style;

  colorVarMap.forEach((opacity, colorVar) => {
    monacoWorkbench.style.setProperty(
      colorVar,
      applyOpacity(cssStyle.getPropertyValue(colorVar), opacity)
    );
  });
}
