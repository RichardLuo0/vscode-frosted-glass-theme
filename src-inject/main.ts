import config from "./config.json" assert { type: "json" };
import { fixContextMenu, fixMenu, fixMenuBar } from "./fix";
import { observeThemeColorChange } from "./observeThemeColor";
import { proxy, useHTMLElement, useRet } from "./proxy";
import fgtSheet from "./vscode-frosted-glass-theme.css" assert { type: "css" };

const { opacity, revealEffect } = config;

fgtSheet.insertRule(
  `:root { 
    --fgt-backdrop-filter: ${config.backdropFilter};
    --fgt-background-color: ${config.backgroundColor};
    --fgt-transition: ${config.transition};
    --fgt-animation-menu: ${config.animation.menu};
    --fgt-animation-dialog: ${config.animation.dialog};
    --fgt-menu-opacity: ${opacity.menu * 100}%;
    --fgt-panel-header-opacity: ${opacity.panelHeader * 100}%;
    --fgt-minimap-opacity: ${opacity.minimap * 100}%;
  }`
);

if (revealEffect.enabled) {
  fgtSheet.insertRule(
    `.monaco-menu-container ul.actions-container > li > a.action-menu-item {
      background-color: transparent !important;
      outline: none !important;
    }`
  );
}

document.adoptedStyleSheets.push(fgtSheet);

proxy(
  document.body,
  "appendChild",
  useHTMLElement("monaco-workbench", (monacoWorkbench) => {
    observeThemeColorChange(monacoWorkbench);
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
  useRet((shadowDom) => {
    shadowDom.adoptedStyleSheets.push(
      ...shadowDom.ownerDocument.adoptedStyleSheets
    );
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
  useRet((newWindow) => {
    if (!newWindow) return newWindow;
    const global = newWindow as Window & typeof globalThis;
    const document = newWindow.document;
    const sheet = new global.CSSStyleSheet();
    for (let i = 0; i < fgtSheet.cssRules.length; i++) {
      sheet.insertRule(fgtSheet.cssRules[i].cssText);
    }
    document.adoptedStyleSheets.push(sheet);
    proxy(
      document.body,
      "append",
      useHTMLElement(null, observeThemeColorChange)
    );
    return newWindow;
  })
);
