type ColorChangeListener = (color: string, style: CSSStyleDeclaration) => void;
const colorChangeListeners: [string, ColorChangeListener][] = [];

let foundCssStyle:
  | {
      readStyle: CSSStyleDeclaration;
      writeStyle: CSSStyleDeclaration;
    }
  | undefined = undefined;

export function registerColorChangeListener(
  variable: string,
  listener: ColorChangeListener
) {
  colorChangeListeners.push([variable, listener]);
  if (foundCssStyle !== undefined)
    listener(
      foundCssStyle.readStyle.getPropertyValue(variable),
      foundCssStyle.writeStyle
    );
}

export function observeThemeColorChange(monacoWorkbench: HTMLElement) {
  const document = monacoWorkbench.ownerDocument;

  const contributedColorTheme = document.querySelector(
    "head > style.contributedColorTheme"
  );
  if (!contributedColorTheme) return;

  const callListenersBound = callListeners.bind(
    globalThis,
    contributedColorTheme,
    monacoWorkbench
  );
  callListenersBound();
  const observer = new MutationObserver(callListenersBound);
  observer.observe(contributedColorTheme, {
    characterData: false,
    attributes: false,
    childList: true,
    subtree: false,
  });
}

function findStyleSheetList(ownerNode: Element | null) {
  return Array.from(document.styleSheets).find(
    styleSheetList => styleSheetList.ownerNode === ownerNode
  );
}

function callListeners(ownerNode: Element, monacoWorkbench: HTMLElement) {
  if (foundCssStyle === undefined) {
    const monacoWorkbenchCSSRule = findStyleSheetList(ownerNode)?.cssRules;
    if (!monacoWorkbenchCSSRule) return;

    const cssRule = monacoWorkbenchCSSRule[monacoWorkbenchCSSRule.length - 1];
    if (!(cssRule instanceof CSSStyleRule)) return;
    const cssStyle = cssRule.style;

    foundCssStyle = { readStyle: cssStyle, writeStyle: monacoWorkbench.style };
  }

  if (foundCssStyle !== undefined) {
    const _foundCssStyle = foundCssStyle;
    colorChangeListeners.forEach(entry =>
      entry[1](
        _foundCssStyle.readStyle.getPropertyValue(entry[0]),
        _foundCssStyle.writeStyle
      )
    );
  }
}
