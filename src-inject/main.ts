import { proxy, useArgs, useRet } from "../common/proxy";
import config from "../config/config.json" with { type: "json" };
import {
  applyBackdropFilter,
  applyBackdropFilterOnEntry,
  menuEntry,
} from "./backdropFilter";
import { applyEffect } from "./effect/effect";
import { hookExtensionWebView } from "./extensionWebviewHook";
import { applyFakeMica } from "./fakeMica";
import { fixContextMenu, fixMenu, fixMenuBar } from "./fixMenu";
import { loadSvgs } from "./utils/loadSvg";
import { observeThemeColorChange } from "./utils/observeThemeColor";
import { useHTMLElement } from "./utils/proxy";
import { css, makeAbsolutePath } from "./utils/utils";
import fgtSheet from "./vscode-frosted-glass-theme.css" with { type: "css" };
import { insertVariables } from "./variables";

import "./animation";
import "./borderRadius";
import "./miscellaneous";
import "./opacity";

fgtSheet.insertRule(css`
  [role="application"] {
    --fgt-transition: ${config.transition};
  }
`);

for (const style of config.additionalStyle as string[]) {
  const styleElement = document.createElement("link");
  styleElement.setAttribute("rel", "stylesheet");
  styleElement.setAttribute("type", "text/css");
  styleElement.setAttribute("href", makeAbsolutePath(style));
  document.head.append(styleElement);
}

insertVariables(fgtSheet, '[role="application"]', config.variable);
insertVariables(
  fgtSheet,
  '[role="application"].vs-dark, [role="application"].hc-black',
  config.variableDark
);

document.adoptedStyleSheets.push(fgtSheet);

const mountSvgTo = loadSvgs(config.svg);
const mountTintSvgTo = loadSvgs(config.tintSvg);

proxy(
  document.body,
  "appendChild",
  useHTMLElement("monaco-workbench", monacoWorkbench => {
    const svgMounted = mountSvgTo(monacoWorkbench);
    applyFakeMica(monacoWorkbench, svgMounted);
    applyBackdropFilter(monacoWorkbench, mountTintSvgTo);
    applyEffect(monacoWorkbench);
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
  useRet(shadowDom => {
    shadowDom.adoptedStyleSheets.push(fgtSheet);
    applyBackdropFilterOnEntry(shadowDom, menuEntry, mountTintSvgTo);
    applyEffect(shadowDom);
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
  useRet(ownWindow => {
    if (!ownWindow) return ownWindow;
    const global = ownWindow as Window & typeof globalThis;
    const newDocument = ownWindow.document;
    const sheet = new global.CSSStyleSheet();
    for (let i = 0; i < fgtSheet.cssRules.length; i++) {
      sheet.insertRule(fgtSheet.cssRules[i].cssText);
    }
    newDocument.adoptedStyleSheets.push(sheet);
    proxy(
      newDocument.body,
      "append",
      useHTMLElement(null, monacoWorkbench => {
        const svgMounted = mountSvgTo(monacoWorkbench, true);
        applyFakeMica(monacoWorkbench, svgMounted);
        applyBackdropFilter(monacoWorkbench, mountTintSvgTo);
        applyEffect(monacoWorkbench);
        observeThemeColorChange(monacoWorkbench);
      })
    );
    return ownWindow;
  })
);

proxy(
  HTMLIFrameElement.prototype,
  "setAttribute",
  useArgs(function (qualifiedName: string, value: string) {
    if (qualifiedName !== "src") return;
    const extensionId = value.match(/[?&]extensionId=([^&]+)/)?.[1];
    if (!extensionId) return;
    hookExtensionWebView(this, extensionId, mountTintSvgTo);
  })
);
