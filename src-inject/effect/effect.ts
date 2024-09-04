import config from "../config.json" with { type: "json" };
import { isKeyInObject } from "../utils";
import fgtSheet from "../vscode-frosted-glass-theme.css" with { type: "css" };
import { applyFlipEffect } from "./flipEffect";
import { applyRevealEffect } from "./revealEffect";

const {
  effect: { disableMenuFocusBackground, disableForDisabledItem },
} = config;

const effectMap = {
  "fgt-revealEffect": applyRevealEffect,
  "fgt-flipEffect": applyFlipEffect,
} satisfies Record<string, (e: Element) => void>;

for (const key in effectMap) {
  fgtSheet.insertRule(`@keyframes ${key} {}`);
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
    if (disableForDisabledItem && e.target.classList.contains("disabled"))
      return;
    if (isKeyInObject(e.animationName, effectMap))
      effectMap[e.animationName](e.target);
  });
}
