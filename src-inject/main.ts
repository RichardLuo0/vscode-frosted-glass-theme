import { applyAcrylic, applyAcrylicOnMenu } from "./acrylic";
import config from "./config.json" with { type: "json" };
import { applyFakeMica } from "./fakeMica";
import { fixContextMenu, fixMenu, fixMenuBar } from "./fix";
import { loadSvgs } from "./loadSvg";
import "./miscellaneous";
import { observeThemeColorChange } from "./observeThemeColor";
import { proxy, useHTMLElement, useRet } from "./proxy";
import fgtSheet from "./vscode-frosted-glass-theme.css" with { type: "css" };

const { opacity, borderRadius } = config;

fgtSheet.insertRule(
  `[role="application"] {
    --fgt-transition: ${config.transition};
    --fgt-animation-menu: ${config.animation.menu};
    --fgt-animation-dialog: ${config.animation.dialog};
    --fgt-minimap-opacity: ${opacity.minimap * 100}%;
  }`
);

function insertVariables(cssSelector: string, variables: object) {
  fgtSheet.insertRule(
    `${cssSelector} {
    ${Object.entries(variables).reduce((total, pair) => {
      const [key, value] = pair;
      return total + `--${key}: ${value};`;
    }, "")}
  }`
  );
}

insertVariables('[role="application"]', config.variable);
insertVariables(
  '[role="application"].vs-dark, [role="application"].hc-black',
  config.variableDark
);

if (config.revealEffect.enabled) {
  fgtSheet.insertRule(
    `.monaco-menu-container ul.actions-container > li > a.action-menu-item {
      background-color: transparent !important;
      outline: none !important;
    }`
  );
} else if (borderRadius.menuItem) {
  fgtSheet.insertRule(
    `.monaco-menu-container ul.actions-container > li > a.action-menu-item {
      border-radius: ${borderRadius.menuItem} !important;
    }`
  );
}

if (borderRadius.menu) {
  fgtSheet.insertRule(
    `.monaco-menu-container .monaco-scrollable-element {
      border-radius: ${borderRadius.menu} !important;
    }`
  );
}

if (borderRadius.suggestWidget) {
  fgtSheet.insertRule(
    `.editor-widget.suggest-widget {
      border-radius: ${borderRadius.suggestWidget} !important;
      overflow: hidden;
    }`
  );
}

document.adoptedStyleSheets.push(fgtSheet);

const mountSvgTo = loadSvgs(config.svg);

proxy(
  document.body,
  "appendChild",
  useHTMLElement("monaco-workbench", monacoWorkbench => {
    observeThemeColorChange(monacoWorkbench);
    const svgMounted = mountSvgTo(monacoWorkbench);
    applyFakeMica(monacoWorkbench, svgMounted);
    applyAcrylic(monacoWorkbench);
    proxy(
      monacoWorkbench,
      "prepend",
      useHTMLElement("monaco-grid-view", fixMenuBar)
    );
    proxy(
      monacoWorkbench,
      "appendChild",
      useHTMLElement("context-view", fixContextMenu)
    );
  })
);

// Fix menu which is wrapped into shadow dom
proxy(
  Element.prototype,
  "attachShadow",
  useRet(shadowDom => {
    shadowDom.adoptedStyleSheets.push(
      ...shadowDom.ownerDocument.adoptedStyleSheets
    );
    applyAcrylicOnMenu(shadowDom);
    proxy(
      shadowDom,
      "appendChild",
      useHTMLElement("monaco-menu-container", fixMenu)
    );
    return shadowDom;
  })
);

// Fix floating window
proxy(
  window,
  "open",
  useRet(newWindow => {
    if (!newWindow) return newWindow;
    const global = newWindow as Window & typeof globalThis;
    const newDocument = newWindow.document;
    const sheet = new global.CSSStyleSheet();
    for (let i = 0; i < fgtSheet.cssRules.length; i++) {
      sheet.insertRule(fgtSheet.cssRules[i].cssText);
    }
    newDocument.adoptedStyleSheets.push(sheet);
    proxy(
      newDocument.body,
      "append",
      useHTMLElement(null, monacoWorkbench => {
        observeThemeColorChange(monacoWorkbench);
        const svgMounted = mountSvgTo(monacoWorkbench);
        applyFakeMica(monacoWorkbench, svgMounted);
        applyAcrylic(monacoWorkbench);
      })
    );
    return newWindow;
  })
);
