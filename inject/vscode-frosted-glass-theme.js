(function () {
  const useThemeColor = true;
  const opacity = 0.4;

  /**
   * Proxy function of src
   * @param  {object} src
   * @param  {string} functionName
   * @param  {(...arguments) => any?} before
   * @param  {(retType) => retType | boolean} after: `false` indicates to use the return value of `before`
   */
  function proxy(src, functionName, before, after = true) {
    if (!src) return;
    if (src[functionName]._hiddenTag) return;
    const oldFunction = src[functionName];
    src[functionName] = function () {
      const beforeRet = before && before.call(this, ...arguments);
      if (after === false) {
        return beforeRet;
      } else {
        const retVal = oldFunction.call(this, ...arguments);
        return after !== true ? after(retVal) : retVal;
      }
    };
    src[functionName]._hiddenTag = true;
  }

  const observeThemeColorChange = (monacoWorkbench) => {
    function applyAlpha(color, alpha) {
      color = color.trim();
      if (color.length < 7) throw new Error("incorrect color format");
      return color.length === 7 ? color + alpha : color.substring(0, 7) + alpha;
    }

    function getStyleSheetList(ownerNode) {
      for (const styleSheetList of document.styleSheets) {
        if (styleSheetList.ownerNode === ownerNode) {
          return styleSheetList;
        }
      }
    }

    const colorList = [
      "--vscode-editorHoverWidget-background",
      "--vscode-editorSuggestWidget-background",
      "--vscode-peekViewResult-background",
      "--vscode-quickInput-background",
      "--vscode-menu-background",
      "--vscode-editorWidget-background",
      "--vscode-notifications-background",
      "--vscode-debugToolBar-background",
      "--vscode-editorHoverWidget-statusBarBackground",
    ];
    const alpha = Math.round(opacity * 255).toString(16);
    const contributedColorTheme = document.querySelector(
      "head > style.contributedColorTheme"
    );

    function setupColor() {
      if (useThemeColor) {
        const monacoWorkbenchCSSRule = getStyleSheetList(
          contributedColorTheme
        ).cssRules;
        const cssVariablesStyle =
          monacoWorkbenchCSSRule[monacoWorkbenchCSSRule.length - 1].style;
        for (const color of colorList) {
          monacoWorkbench.style.setProperty(
            color,
            applyAlpha(cssVariablesStyle.getPropertyValue(color), alpha)
          );
        }
      } else {
        for (const color of colorList) {
          monacoWorkbench.style.setProperty(color, "var(--background-color)");
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

  function fixSubMenu(src, parent) {
    // `position:absolute` will be invalid if drop-filter is set on menu.
    // So I just move sub menu below `.monaco-menu-container` instead of `<ul>`.
    src.append = (e) => {
      // `DOM.isAncestor` will always return true
      Object.defineProperty(e, "parentNode", {
        get() {
          return src;
        },
      });
      // Fix new sub menu
      fixMenu(e);
      parent.append(e);
    };
    src.removeChild = (e) => parent.removeChild(e);
    src.replaceChild = (e) => parent.replaceChild(e);
  }

  function fixMenu(menuContainer) {
    function fix(scrollableElement) {
      if (!scrollableElement) return;
      // Replace `outline` with `border`
      if (scrollableElement.style.outline.length !== 0) {
        scrollableElement.style.border = scrollableElement.style.outline;
        scrollableElement.style.outline = "";
      }
      // Fix sub menu
      scrollableElement
        .querySelectorAll("ul.actions-container li")
        .forEach((menuItem) => fixSubMenu(menuItem, menuContainer));
    }
    // If `scrollable-element` has existed, fix it now, otherwise, wait for appendChild
    if (menuContainer.childElementCount <= 0)
      proxy(menuContainer, "appendChild", (e) => {
        if (e.classList.contains("monaco-scrollable-element")) fix(e);
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

  const fixContextMenu = (contextView) => {
    // Fix side bar menu
    fixMenu(contextView);
  };

  // Fix context menu which is wrapped into shadow dom
  proxy(
    Element.prototype,
    "attachShadow",
    function () {
      // I don't see any point of using shadow dom here other than making troubles
      const div = document.createElement("div");
      proxy(div, "appendChild", (menuContainer) => {
        if (
          menuContainer.tagName === "DIV" &&
          menuContainer.classList.contains("monaco-menu-container")
        ) {
          fixMenu(menuContainer);
        }
      });
      this.appendChild(div);
      return div;
    },
    false
  );

  proxy(document.body, "appendChild", (monacoWorkbench) => {
    if (monacoWorkbench.classList.contains("monaco-workbench")) {
      observeThemeColorChange(monacoWorkbench);
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
