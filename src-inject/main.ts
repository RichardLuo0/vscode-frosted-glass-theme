import { applyBackdropFilter, applyBackdropFilterOnMenu } from "./backdropFilter";
import config from "./config.json" with { type: "json" };
import { applyEffect } from "./effect/effect";
import { applyFakeMica } from "./fakeMica";
import { fixContextMenu, fixMenu, fixMenuBar } from "./fix";
import { loadSvgs } from "./loadSvg";
import { observeThemeColorChange } from "./observeThemeColor";
import { proxy, useHTMLElement, useRet } from "./proxy";
import { css, makeAbsolutePath } from "./utils";
import fgtSheet from "./vscode-frosted-glass-theme.css" with { type: "css" };

import "./animation";
import "./borderRadius";
import "./miscellaneous";

const { opacity } = config;

fgtSheet.insertRule(css`
  [role="application"] {
    --fgt-transition: ${config.transition};
    --fgt-minimap-opacity: ${opacity.minimap * 100}%;
  }
`);

for (const style of config.additionalStyle as string[]) {
  const styleElement = document.createElement("link");
  styleElement.setAttribute("rel", "stylesheet");
  styleElement.setAttribute("type", "text/css");
  styleElement.setAttribute("href", makeAbsolutePath(style));
  document.head.append(styleElement);
}

function insertVariables(cssSelector: string, variables: object) {
  fgtSheet.insertRule(css`
    ${cssSelector} {
      ${Object.entries(variables).reduce((total, pair) => {
        const [key, value] = pair;
        return total + `--${key}: ${value};`;
      }, "")}
    }
  `);
}

insertVariables('[role="application"]', config.variable);
insertVariables(
  '[role="application"].vs-dark, [role="application"].hc-black',
  config.variableDark
);

document.adoptedStyleSheets.push(fgtSheet);

const mountSvgTo = loadSvgs(config.svg);

proxy(
  document.body,
  "appendChild",
  useHTMLElement("monaco-workbench", monacoWorkbench => {
    observeThemeColorChange(monacoWorkbench);
    const svgMounted = mountSvgTo(monacoWorkbench);
    applyFakeMica(monacoWorkbench, svgMounted);
    applyBackdropFilter(monacoWorkbench);
    applyEffect(monacoWorkbench);
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
    applyBackdropFilterOnMenu(shadowDom);
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
        applyBackdropFilter(monacoWorkbench);
        applyEffect(monacoWorkbench);
      })
    );
    return newWindow;
  })
);
