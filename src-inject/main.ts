import config from "./config.json" assert { type: "json" };
import { fixContextMenu, fixMenu, fixMenuBar } from "./fix";
import { observeThemeColorChange } from "./observeThemeColor";
import { proxy, useHTMLElement, useRet } from "./proxy";
import fgtSheet from "./vscode-frosted-glass-theme.css" assert { type: "css" };

const { opacity, revealEffect, borderRadius, fakeMica } = config;

fgtSheet.insertRule(
  `:root { 
    --fgt-backdrop-filter: ${config.backdropFilter};
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

if (fakeMica.enabled) {
  fgtSheet.insertRule(
    `.monaco-workbench > .fgt-fake-mica-filter {
      width: 100%;
      height: 100%;
      position: absolute;
      top: 0px;
      z-index: -1000;
      backdrop-filter: ${fakeMica.filter}
    }`
  );
  fgtSheet.insertRule(
    `.monaco-workbench.vs-dark > .fgt-fake-mica-filter,
    .monaco-workbench.hc-black > .fgt-fake-mica-filter {
      backdrop-filter: ${fakeMica.filterDark}
    }`
  );

  if (fakeMica.titlebarFix) {
    fgtSheet.insertRule(
      `#workbench\\.parts\\.titlebar {
      background-color: color-mix(
        in srgb,
        var(--vscode-titleBar-activeBackground) ${
          fakeMica.titlebarOpacity * 100
        }%,
        transparent
      ) !important;
    }`
    );
  }

  if (fakeMica.listBackgroundFix) {
    fgtSheet.insertRule(
      `.monaco-list-rows {
      background-color: transparent !important;
    }`
    );
  }

  if (fakeMica.editorBackgroundFix) {
    fgtSheet.insertRule(
      `.content:not(.empty), .monaco-editor, .monaco-editor-background {
      background-color: transparent !important;
    }`
    );
  }
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
    if (fakeMica.enabled) {
      monacoWorkbench.style.background = `url("vscode-file://vscode-app/${fakeMica.url}") center center / cover no-repeat`;
      const fakeMicaLayer = document.createElement("div");
      fakeMicaLayer.classList.add("fgt-fake-mica-filter");
      monacoWorkbench.appendChild(fakeMicaLayer);
    }
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
