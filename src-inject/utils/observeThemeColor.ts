type FoundStyles = {
  readStyle: CSSStyleDeclaration;
  writeStyle: CSSStyleDeclaration;
};
let foundStyles: FoundStyles | undefined = undefined;

type ColorChangeListener = (foundCssStyle: FoundStyles) => void;
const colorChangeListeners: ColorChangeListener[] = [];

export function registerColorChangeListener(listener: ColorChangeListener) {
  colorChangeListeners.push(listener);
  if (foundStyles !== undefined) listener(foundStyles);
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
  const monacoWorkbenchCSSRule = findStyleSheetList(ownerNode)?.cssRules;
  if (!monacoWorkbenchCSSRule) return;
  const cssRule = monacoWorkbenchCSSRule[monacoWorkbenchCSSRule.length - 1];
  if (!(cssRule instanceof CSSStyleRule)) return;

  foundStyles = {
    readStyle: cssRule.style,
    writeStyle: monacoWorkbench.style,
  };

  const _foundCssStyle = foundStyles;
  colorChangeListeners.forEach(listener => listener(_foundCssStyle));
}
