import config from "../config.json" with { type: "json" };
import { isKeyInObject } from "../utils";
import fgtSheet from "../vscode-frosted-glass-theme.css" with { type: "css" };
import { applyFlipEffect } from "./flipEffect";
import { applyRevealEffect } from "./revealEffect";

const {
  effect: { enabled, disableMenuFocusBackground, disableForDisabledItem },
} = config;

const actionItemSelector = disableForDisabledItem
  ? " li.action-item:not(.disabled)"
  : " li.action-item:not(:has(> a.separator))";

const selectorMap = {
  menuItem: ".monaco-menu-container " + actionItemSelector,
  button: ".monaco-button",
  tab: ".tabs-container > .tab",
  listItem: ".monaco-list-row",
  statusbarItem: ".statusbar-item-label",
  activitybar:
    ":is(.activitybar, .sidebar.pane-composite-part .composite-bar) " +
    actionItemSelector,
  commandCenter: ".command-center-center",
  titlebarButton: ".titlebar-container " + actionItemSelector,
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
  else
    fgtSheet.insertRule(
      `${key} {
        animation: ${effectList};
      }`
    );
}

if (disableMenuFocusBackground)
  fgtSheet.insertRule(
    `.monaco-menu-container ul.actions-container > li > a.action-menu-item {
      background-color: transparent !important;
      outline: none !important;
    }`
  );

export function applyEffect(element: HTMLElement | ShadowRoot) {
  element.addEventListener("animationstart", (e: Event | AnimationEvent) => {
    if (!("animationName" in e)) return;
    if (!(e.target instanceof Element)) return;
    if (isKeyInObject(e.animationName, effectMap))
      effectMap[e.animationName](e.target);
  });
}
