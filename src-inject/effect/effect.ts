import config from "../config.json" with { type: "json" };
import { isKeyInObject } from "../utils";
import fgtSheet from "../vscode-frosted-glass-theme.css" with { type: "css" };
import { applyFlipEffect } from "./flipEffect";
import { applyRevealEffect } from "./revealEffect";

const {
  effect: { enabled, disableForDisabledItem },
} = config;

const selectorMap = {
  menu: `.monaco-menu-container ${
    disableForDisabledItem
      ? " li.action-item:not(.disabled)"
      : " li.action-item:not(:has(> a.separator))"
  }`,
  button: ".monaco-button",
  tab: ".tabs-container > .tab",
  list: ".monaco-list-row",
  statusbar: ".statusbar-item-label",
  activitybar:
    ":is(.activitybar, .sidebar.pane-composite-part .composite-bar)  li.action-item",
};

const effectMap = {
  "fgt-revealEffect": applyRevealEffect,
  "fgt-flipEffect": applyFlipEffect,
} satisfies Record<string, (e: Element) => void>;

for (const key in effectMap) {
  fgtSheet.insertRule(`@keyframes ${key} {}`);
}

for (const key in enabled) {
  const effectList = enabled[key as keyof typeof enabled];
  if (isKeyInObject(key, selectorMap))
    fgtSheet.insertRule(
      `${selectorMap[key]} {
        animation: ${effectList};
      }`
    );
}

export function applyEffect(element: HTMLElement) {
  element.addEventListener("animationstart", e => {
    if (!(e.target instanceof Element)) return;
    if (isKeyInObject(e.animationName, effectMap))
      effectMap[e.animationName](e.target);
  });
}
