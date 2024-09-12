import config from "./config.json" with { type: "json" };
import { css, isKeyInObject } from "./utils";
import fgtSheet from "./vscode-frosted-glass-theme.css" with { type: "css" };

const { borderRadius } = config;

const selectorMap = {
  menuItem:
    ".monaco-menu-container ul.actions-container > li > a.action-menu-item",
  menu: ".monaco-menu-container .monaco-scrollable-element",
  suggestWidget: ".editor-widget.suggest-widget",
  tab: ".tab",
};

for (const key in borderRadius) {
  const value = borderRadius[key as keyof typeof borderRadius];
  if (value.length != 0)
    fgtSheet.insertRule(css`
      ${isKeyInObject(key, selectorMap) ? selectorMap[key] : key} {
        border-radius: ${value} !important;
        overflow: hidden;
      }
    `);
}
