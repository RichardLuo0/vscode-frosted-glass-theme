import config from "./config";
import { fixContextMenu, fixMenu, fixMenuBar } from "./fix";
import { observeThemeColorChange } from "./observeThemeColor";
import { proxy, useArgs, useOldRet } from "./proxy";
import { isHTMLElement } from "./utils";
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
    }`
  );
}

document.adoptedStyleSheets.push(fgtSheet);
proxy(
  document.body,
  "appendChild",
  useArgs((monacoWorkbench: Node) => {
    if (!isHTMLElement(monacoWorkbench)) return;
    if (monacoWorkbench.classList.contains("monaco-workbench")) {
      observeThemeColorChange(monacoWorkbench);
      proxy(
        monacoWorkbench,
        "prepend",
        useArgs((gridView: string | Node) => {
          if (!isHTMLElement(gridView)) return;
          if (gridView.classList.contains("monaco-grid-view"))
            fixMenuBar(gridView);
        })
      );
      proxy(
        monacoWorkbench,
        "appendChild",
        useArgs((contextView: Node) => {
          if (!isHTMLElement(contextView)) return;
          if (contextView.classList.contains("context-view"))
            fixContextMenu(contextView);
        })
      );
    }
  })
);

// Fix menu which is wrapped into shadow dom
proxy(
  Element.prototype,
  "attachShadow",
  useOldRet((shadowDom: ShadowRoot) => {
    shadowDom.adoptedStyleSheets.push(
      ...shadowDom.ownerDocument.adoptedStyleSheets
    );
    proxy(
      shadowDom,
      "appendChild",
      useArgs((menuContainer) => {
        if (!isHTMLElement(menuContainer)) return;
        if (menuContainer.classList.contains("monaco-menu-container")) {
          fixMenu(menuContainer);
        }
      })
    );
    return shadowDom;
  })
);

// Fix floating window
proxy(
  window,
  "open",
  useOldRet((newWindow: Window | null) => {
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
      useArgs((container: string | Node) => {
        if (!isHTMLElement(container)) return;
        observeThemeColorChange(container);
      })
    );
    return newWindow;
  })
);
