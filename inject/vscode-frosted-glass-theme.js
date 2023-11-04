(function () {
  const useThemeColor = true;
  const opacity = 0.4;

  /**
   * Proxy function of src
   * @param  {object} src
   * @param  {string} functionName
   * @param  {(...) => any?} before
   * @param  {(retType, ...) => retType | boolean} after: `false` indicates to use the return value of `before`
   */
  function proxy(src, functionName, before, after = true) {
    if (!src || src[functionName]._hiddenTag) return;
    const oldFunction = src[functionName];
    src[functionName] = function () {
      const beforeRet = before && before.call(this, ...arguments);
      if (after === false) {
        return beforeRet;
      } else {
        const retVal = oldFunction.call(this, ...arguments);
        return after !== true ? after(retVal, ...arguments) : retVal;
      }
    };
    src[functionName]._hiddenTag = true;
  }

  const observeThemeColorChange = (monacoWorkbench) => {
    function applyAlpha(color, alpha) {
      color = color.trim();
      // Hexadecimal format
      if (color.startsWith("#"))
        return color.length === 7
          ? color + alpha
          : color.substring(0, 7) + alpha;
      // RGB format
      if (color.startsWith("rgb(")) {
        // Remove the 'rgb(' and ')' symbols
        color = color.slice(4, -1);
        const [red, green, blue] = color.split(",").map(Number);
        return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
      }
      // Check if the color is in HSL format
      if (color.startsWith("hsl(")) {
        // Remove the 'hsl(' and ')' symbols
        color = color.slice(4, -1);
        const [hue, saturation, lightness] = color.split(",").map(parseFloat);
        return `hsla(${hue}, ${saturation}%, ${lightness}%, ${alpha})`;
      }
      return color;
    }

    function findStyleSheetList(ownerNode) {
      return Array.from(document.styleSheets).find(
        (styleSheetList) => styleSheetList.ownerNode === ownerNode
      );
    }

    const colorList = [
      "--vscode-editorHoverWidget-background",
      "--vscode-editorSuggestWidget-background",
      "--vscode-peekViewResult-background",
      "--vscode-quickInput-background",
      "--vscode-menu-background",
      "--vscode-notifications-background",
      "--vscode-debugToolBar-background",
      "--vscode-editorHoverWidget-statusBarBackground",
      "--vscode-editorStickyScroll-background",
      "--vscode-listFilterWidget-background",
    ];
    const alpha = Math.round(opacity * 255).toString(16);
    const contributedColorTheme = document.querySelector(
      "head > style.contributedColorTheme"
    );

    function setupColor() {
      if (useThemeColor) {
        const monacoWorkbenchCSSRule = findStyleSheetList(
          contributedColorTheme
        ).cssRules;
        const cssVariablesStyle =
          monacoWorkbenchCSSRule[monacoWorkbenchCSSRule.length - 1].style;
        colorList.forEach((color) => {
          monacoWorkbench.style.setProperty(
            color,
            applyAlpha(cssVariablesStyle.getPropertyValue(color), alpha)
          );
        });
      } else {
        for (const color of colorList) {
          monacoWorkbench.style.setProperty(
            color,
            "var(--fgt-background-color)"
          );
        }
      }
    }

    setupColor();
    if (useThemeColor) {
      const observer = new MutationObserver(setupColor);
      observer.observe(contributedColorTheme, {
        characterData: false,
        attributes: false,
        childList: true,
        subtree: false,
      });
    }
  };

  // `position: fixed` will be invalid if `backdrop-filter` or `transform` is set on ancestor.
  // 1. Clone and replace the `div.monaco-action-bar` to keep the layout and style things.
  // 2. Move the original `div.monaco-action-bar` with event listeners to top level and remove any styles.
  // 2. Move sub menu below `div.monaco-action-bar` to avoid those properties being present on the ancestors.
  function fixMenu(menuContainer) {
    function moveSubMenu(src, parent) {
      src.append = (monacoSubMenu) => {
        // https://github.com/microsoft/vscode/blob/5cd507ba17ec7a0d8a822c35bfcde8eca33de861/src/vs/base/browser/dom.ts#L581
        // Fake parent, thus `dom.isAncestor` will always return `true`
        Object.defineProperty(monacoSubMenu, "parentNode", {
          get() {
            return src;
          },
        });
        // https://github.com/microsoft/vscode/blob/3e452bfef11522d0151fd2e884bb8bf869d7d2fa/src/vs/base/browser/dom.ts#L632
        // Changes since vscode 1.84.0
        proxy(
          src,
          "contains",
          undefined,
          (ret, e) => ret || monacoSubMenu === e || monacoSubMenu.contains(e)
        );
        // Is submenu loses focus, dispatch to `<li>`
        monacoSubMenu.addEventListener("focusout", (e) =>
          setTimeout(() =>
            src.dispatchEvent(new Event(e.type, { bubbles: false, ...e }))
          )
        );
        // Recursively fix new menu
        fixMenu(monacoSubMenu);
        parent.append(monacoSubMenu);
      };
      src.removeChild = (e) => parent.removeChild(e);
      src.replaceChild = (e) => parent.replaceChild(e);
    }

    function fix(scrollableElement) {
      if (!scrollableElement) return;
      // Replace `outline` with `border` to fix the bug which causes white halo
      if (scrollableElement.style.outline.length !== 0) {
        scrollableElement.style.border = scrollableElement.style.outline;
        scrollableElement.style.margin = "-1px";
        scrollableElement.style.outline = "";
      }

      const actionBar = scrollableElement.querySelector(
        "div.monaco-action-bar"
      );

      const clone = actionBar.cloneNode();
      for (const child of actionBar.children) {
        clone.appendChild(child);
      }
      actionBar.parentNode.replaceChild(clone, actionBar);

      actionBar.className = "";
      menuContainer.replaceChild(actionBar, scrollableElement);
      actionBar.appendChild(scrollableElement);

      actionBar
        .querySelectorAll("ul.actions-container > li")
        .forEach((menuItem) => moveSubMenu(menuItem, actionBar));
    }

    // If `scrollable-element` has existed, fix it now, otherwise, wait for `appendChild`
    if (menuContainer.childElementCount <= 0)
      proxy(menuContainer, "appendChild", undefined, (e) => {
        if (e.classList.contains("monaco-scrollable-element")) fix(e);
        return e;
      });
    else fix(menuContainer.querySelector("div.monaco-scrollable-element"));
  }

  const fixMenuBar = (gridView) => {
    // Fix top bar menu
    function fixMenuBotton(menu) {
      proxy(menu, "append", fixMenu);
      proxy(menu, "appendChild", fixMenu);
    }
    const menuBar = gridView.querySelector(
      "#workbench\\.parts\\.titlebar > div > div.titlebar-left > div.menubar"
    );
    if (!menuBar) return;
    const menus = menuBar.querySelectorAll("div.menubar-menu-button");
    menus.forEach(fixMenuBotton);
    proxy(menuBar, "append", fixMenuBotton);
    proxy(menuBar, "appendChild", fixMenuBotton);
    proxy(menuBar, "insertBefore", fixMenuBotton);
  };

  const fixContextMenu = fixMenu;

  // Fix context menu which is wrapped into shadow dom
  const fixShadowDom = () => {
    const fgtCSSRules = Array.from(document.styleSheets).find(
      (styleSheetList) =>
        styleSheetList.cssRules[1]?.selectorText === ".fgt-do-not-remove"
    ).cssRules;
    const sheet = new CSSStyleSheet();
    for (let i = 0; i < fgtCSSRules?.length; i++) {
      sheet.insertRule(fgtCSSRules[i].cssText);
    }
    proxy(Element.prototype, "attachShadow", undefined, function (shadowDom) {
      shadowDom.adoptedStyleSheets = [sheet];
      proxy(shadowDom, "appendChild", (menuContainer) => {
        if (
          menuContainer.tagName === "DIV" &&
          menuContainer.classList.contains("monaco-menu-container")
        ) {
          fixMenu(menuContainer);
        }
      });
      return shadowDom;
    });
  };

  proxy(document.body, "appendChild", (monacoWorkbench) => {
    if (monacoWorkbench.classList.contains("monaco-workbench")) {
      observeThemeColorChange(monacoWorkbench);
      fixShadowDom();
      proxy(monacoWorkbench, "prepend", (gridView) =>
        gridView.className === "monaco-grid-view"
          ? fixMenuBar(gridView)
          : undefined
      );
      proxy(monacoWorkbench, "appendChild", (contextView) =>
        contextView.className === "context-view"
          ? fixContextMenu(contextView)
          : undefined
      );
    }
  });
})();
