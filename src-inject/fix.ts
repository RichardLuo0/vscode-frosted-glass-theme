import { applyElementsEffect } from "fluent-reveal-effect";
import config from "./config.json" assert { type: "json" };
import { proxy, useArgs, useRet } from "./proxy";
import { isHTMLElement } from "./utils";

const { revealEffect } = config;

// `position: fixed` will be invalid if `backdrop-filter` or `transform` is set on ancestor.
// 1. Clone and replace the `div.monaco-action-bar` to keep the layout and style things.
// 2. Move the original `div.monaco-action-bar` with event listeners to top level and remove any styles.
// 3. Move sub menu below `div.monaco-action-bar` to avoid those properties being present on the ancestors.
export function fixMenu(menuContainer: string | Node) {
  if (!isHTMLElement(menuContainer)) return;

  // If `scrollable-element` exists, fix it now, otherwise, wait for `appendChild`
  if (menuContainer.childElementCount <= 0)
    proxy(menuContainer, "appendChild", (oldFunc, e) => oldFunc(fix(e)));
  else fix(menuContainer.querySelector("div.monaco-scrollable-element"));

  function moveSubMenu(src: Element, parent: Element) {
    const _src = src as Element & { _currentSubMenu: Node };
    function fixSubMenu<NodeType extends string | Node>(subMenu: NodeType) {
      if (!isHTMLElement(subMenu)) return subMenu;
      const _subMenu = subMenu as HTMLElement & { _hiddenTag: boolean };
      if (_subMenu._hiddenTag) return subMenu;

      // https://github.com/microsoft/vscode/blob/5cd507ba17ec7a0d8a822c35bfcde8eca33de861/src/vs/base/browser/dom.ts#L581
      // Fake parent, thus `dom.isAncestor` will always return `true`
      Object.defineProperty(subMenu, "parentNode", {
        get() {
          return src;
        },
      });
      // https://github.com/microsoft/vscode/blob/3e452bfef11522d0151fd2e884bb8bf869d7d2fa/src/vs/base/browser/dom.ts#L632
      // Changes since vscode 1.84.0
      _src._currentSubMenu = subMenu;
      proxy(
        src,
        "contains",
        useRet(
          (ret, e) =>
            ret ||
            _src._currentSubMenu === e ||
            _src._currentSubMenu.contains(e)
        )
      );
      // If submenu loses focus, dispatch to `<li>`
      subMenu.addEventListener("focusout", (e) =>
        setTimeout(() =>
          src.dispatchEvent(new Event(e.type, { ...e, bubbles: false }))
        )
      );
      // Recursively fix new menu
      fixMenu(subMenu);

      _subMenu._hiddenTag = true;
      return subMenu;
    }

    src.append = (e) => parent.append(fixSubMenu(e));
    src.removeChild = (e) => parent.removeChild(e);
    src.replaceChild = (e, e2) => parent.replaceChild(fixSubMenu(e), e2);
  }

  function fix<NodeType extends Node | null>(scrollableElement: NodeType) {
    if (
      !isHTMLElement(scrollableElement) ||
      !scrollableElement.classList.contains("monaco-scrollable-element")
    )
      return scrollableElement;

    // Replace `outline` with `border` to fix the bug which causes white halo
    if (scrollableElement.style.outline.length !== 0) {
      scrollableElement.style.border = scrollableElement.style.outline;
      scrollableElement.style.margin = "-1px";
      scrollableElement.style.outline = "";
    }

    const actionBar = scrollableElement.querySelector("div.monaco-action-bar");
    if (!actionBar) return scrollableElement;

    const clone = actionBar.cloneNode();
    for (const child of Array.from(actionBar.children)) {
      clone.appendChild(child);
    }
    actionBar.parentNode?.replaceChild(clone, actionBar);

    actionBar.className = "";
    actionBar.appendChild(scrollableElement);
    const menuItemList = actionBar.querySelectorAll<HTMLElement>(
      "ul.actions-container > li:not(:has(a.separator))"
    );
    menuItemList.forEach((menuItem) => {
      moveSubMenu(menuItem, actionBar);
    });

    if (revealEffect.enabled) {
      applyElementsEffect(menuItemList, {
        lightColor: `color-mix(in srgb, var(--vscode-menu-selectionBackground) ${
          revealEffect.opacity * 100
        }%, transparent )`,
        gradientSize: revealEffect.gradientSize,
        clickEffect: revealEffect.clickEffect,
      });
    }

    return actionBar;
  }
}

// Fix top bar menu
export function fixMenuBar(gridView: HTMLElement) {
  function fixMenuBotton(menu: string | Node) {
    if (!isHTMLElement(menu)) return;
    proxy(menu, "append", useArgs(fixMenu));
    proxy(menu, "appendChild", useArgs(fixMenu));
  }
  const menuBar = gridView.querySelector(
    "#workbench\\.parts\\.titlebar > div > div.titlebar-left > div.menubar"
  );
  if (!menuBar) return;
  const menus = menuBar.querySelectorAll("div.menubar-menu-button");
  menus.forEach(fixMenuBotton);
  proxy(menuBar, "append", useArgs(fixMenuBotton));
  proxy(menuBar, "appendChild", useArgs(fixMenuBotton));
  proxy(menuBar, "insertBefore", useArgs(fixMenuBotton));
}

export const fixContextMenu = fixMenu;
