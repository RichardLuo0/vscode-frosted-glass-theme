import config from "./config";

const { opacity } = config;
const useThemeColor = config.backgroundColor.length === 0;

const colorVarMap = new Map([
  ["--vscode-menu-selectionBackground", opacity.selection],
  ["--vscode-quickInputList-focusBackground", opacity.selection],
  ["--vscode-editorSuggestWidget-selectedBackground", opacity.selection],
  ["--vscode-menu-border", opacity.border],
  ["--vscode-widget-border", opacity.border],
  ["--vscode-editorWidget-border", opacity.border],
  ["--vscode-editorHoverWidget-border", opacity.border],
  ["--vscode-editorSuggestWidget-border", opacity.border],
  ["--vscode-menu-separatorBackground", opacity.separator],
]);

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
  if (useThemeColor) {
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
}

function applyOpacity(color: string, opacity: number) {
  const alpha = Math.round(opacity * 255).toString(16);
  color = color.trim();
  // Hexadecimal format
  if (color.startsWith("#"))
    return color.length === 7 ? color + alpha : color.substring(0, 7) + alpha;
  // RGB format
  if (color.startsWith("rgb(")) {
    // Remove the 'rgb(' and ')' symbols
    color = color.slice(4, -1);
    const [red, green, blue] = color.split(",").map(Number);
    return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
  }
  // Check if the color is in HSL format
  if (color.startsWith("hsl(")) {
    // Remove the 'hsl(' and ')' symbols
    color = color.slice(4, -1);
    const [hue, saturation, lightness] = color.split(",").map(parseFloat);
    return `hsla(${hue}, ${saturation}%, ${lightness}%, ${alpha})`;
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

  if (useThemeColor) {
    colorVarMap.forEach((opacity, colorVar) => {
      monacoWorkbench.style.setProperty(
        colorVar,
        applyOpacity(cssStyle.getPropertyValue(colorVar), opacity)
      );
    });
  } else {
    colorVarMap.forEach((_, colorVar) => {
      monacoWorkbench.style.setProperty(
        colorVar,
        "var(--fgt-background-color)"
      );
    });
  }
}
