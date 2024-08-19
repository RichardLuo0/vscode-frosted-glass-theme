import { applyElementsEffect } from "fluent-reveal-effect";
import config from "./config.json" with { type: "json" };
import fgtSheet from "./vscode-frosted-glass-theme.css" with { type: "css" };

const { revealEffect } = config;

if (revealEffect.enabled && revealEffect.focusBackground)
  fgtSheet.insertRule(
    `ul.actions-container .action-item.focused { 
      background-color: color-mix(in srgb, var(--vscode-menu-selectionBackground) ${
        revealEffect.opacity * 100
      }%, transparent) 
    }`
  );

export function applyRevealEffect(actionBar: Element) {
  if (revealEffect.enabled) {
    const menuItemList = actionBar.querySelectorAll<HTMLElement>(
      revealEffect.disableForDisabledItem
        ? "ul.actions-container > li:not(.disabled)"
        : "ul.actions-container > li:not(:has(> a.separator))"
    );
    applyElementsEffect(menuItemList, {
      lightColor: `color-mix(in srgb, var(--vscode-menu-selectionBackground) ${
        revealEffect.opacity * 100
      }%, transparent)`,
      gradientSize: revealEffect.gradientSize,
      clickEffect: revealEffect.clickEffect,
    });
  }
}
