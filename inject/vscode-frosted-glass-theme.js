import fgtSheet from "./vscode-frosted-glass-theme.css" assert { type: "css" };

(function () {
  const config = {
    backdropFilter: "blur(30px)",
    backgroundColor: "",
    transition: "300ms",
    opacity: {
      menu: 0.4,
      selection: 1,
      panelHeader: 0.4,
    },
    animation: {
      menu: "300ms cubic-bezier(0, 0.8, 0.2, 1) 0s 1 forwards fgtDropdown",
      dialog: "300ms cubic-bezier(0, 0.8, 0.2, 1) 0s 1 forwards fgtZoomIn",
    },
  };

  const opacity = config.opacity;
  const useThemeColor = config.backgroundColor.length === 0;

  fgtSheet.insertRule(
    `:root { 
  --fgt-backdrop-filter: ${config.backdropFilter};
  --fgt-background-color: ${config.backgroundColor};
  --fgt-transition: ${config.transition};
  --fgt-animation-menu: ${config.animation.menu};
  --fgt-animation-dialog: ${config.animation.dialog};
  --fgt-menu-opacity: ${opacity.menu * 100}%;
  --fgt-panel-header-opacity: ${opacity.panelHeader * 100}%;
}`
  );
  document.adoptedStyleSheets.push(fgtSheet);
  proxy(
    document.body,
    "appendChild",
    useArgs((monacoWorkbench) => {
      if (monacoWorkbench.classList.contains("monaco-workbench")) {
        observeThemeColorChange(monacoWorkbench);
        proxy(
          monacoWorkbench,
          "prepend",
          useArgs((gridView) => {
            if (gridView.classList.contains("monaco-grid-view"))
              fixMenuBar(gridView);
          })
        );
        proxy(
          monacoWorkbench,
          "appendChild",
          useArgs((contextView) => {
            if (contextView.classList.contains("context-view"))
              fixContextMenu(contextView);
          })
        );
      }
    })
  );

  // Fix menu which is wrapped into shadow dom
  proxy(
    Element.prototype,
    "attachShadow",
    useOldRet((shadowDom) => {
      shadowDom.adoptedStyleSheets.push(
        ...shadowDom.ownerDocument.adoptedStyleSheets
      );
      proxy(
        shadowDom,
        "appendChild",
        useArgs((menuContainer) => {
          if (menuContainer.classList.contains("monaco-menu-container")) {
            fixMenu(menuContainer);
          }
        })
      );
      return shadowDom;
    })
  );

  // Fix floating window
  proxy(
    window,
    "open",
    useOldRet((newWindow) => {
      const document = newWindow.document;
      const sheet = new newWindow.CSSStyleSheet();
      for (let i = 0; i < fgtSheet.cssRules.length; i++) {
        sheet.insertRule(fgtSheet.cssRules[i].cssText);
      }
      document.adoptedStyleSheets.push(sheet);
      proxy(
        document.body,
        "append",
        useArgs((container) => {
          observeThemeColorChange(container);
        })
      );
      return newWindow;
    })
  );

  /**
   * Proxy function of src
   * @param  {object} src
   * @param  {string} functionName
   * @param  {(oldFunc, ...args) => any?} newFunc
   */
  function proxy(src, functionName, newFunc) {
    if (!src || !src[functionName] || src[functionName]._hiddenTag) return;
    const oldFunc = src[functionName];
    src[functionName] = function (...args) {
      return newFunc.call(this, oldFunc.bind(this), ...args);
    };
    src[functionName]._hiddenTag = true;
  }

  function useOldRet(f) {
    return function (oldFunc, ...args) {
      return f.call(this, oldFunc(...args), ...args);
    };
  }

  function useArgs(f) {
    return function (oldFunc, ...args) {
      f.call(this, ...args);
      return oldFunc(...args);
    };
  }

  const observeThemeColorChange = (monacoWorkbench) => {
    const document = monacoWorkbench.ownerDocument;

    const backgroundVarList = [
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
      "--vscode-editorWidget-background"
    ];
    const selectionVarList = [
      "--vscode-menu-selectionBackground",
      "--vscode-quickInputList-focusBackground",
      "--vscode-editorSuggestWidget-selectedBackground",
    ];

    const contributedColorTheme = document.querySelector(
      "head > style.contributedColorTheme"
    );

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

    function applyOpacity(color, opacity) {
      const alpha = Math.round(opacity * 255).toString(16);
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

    function setupColor() {
      const monacoWorkbenchCSSRule = findStyleSheetList(
        contributedColorTheme
      ).cssRules;
      const cssVariablesStyle =
        monacoWorkbenchCSSRule[monacoWorkbenchCSSRule.length - 1].style;

      const applyOpToVar = (opacity) => (colorVar) => {
        monacoWorkbench.style.setProperty(
          colorVar,
          applyOpacity(cssVariablesStyle.getPropertyValue(colorVar), opacity)
        );
      };

      if (useThemeColor) {
        backgroundVarList.forEach(applyOpToVar(opacity.menu));
      } else {
        colorList.forEach((color) => {
          monacoWorkbench.style.setProperty(
            color,
            "var(--fgt-background-color)"
          );
        });
      }
      // Menu selection background opacity
      selectionVarList.forEach(applyOpToVar(opacity.selection));
    }
  };

  // `position: fixed` will be invalid if `backdrop-filter` or `transform` is set on ancestor.
  // 1. Clone and replace the `div.monaco-action-bar` to keep the layout and style things.
  // 2. Move the original `div.monaco-action-bar` with event listeners to top level and remove any styles.
  // 2. Move sub menu below `div.monaco-action-bar` to avoid those properties being present on the ancestors.
  function fixMenu(menuContainer) {
    // If `scrollable-element` has existed, fix it now, otherwise, wait for `appendChild`
    if (menuContainer.childElementCount <= 0)
      proxy(menuContainer, "appendChild", (oldFunc, e) => oldFunc(fix(e)));
    else fix(menuContainer.querySelector("div.monaco-scrollable-element"));

    function moveSubMenu(src, parent) {
      function fixSubMenu(monacoSubMenu) {
        if (!monacoSubMenu || monacoSubMenu._hiddenTag) return monacoSubMenu;

        // https://github.com/microsoft/vscode/blob/5cd507ba17ec7a0d8a822c35bfcde8eca33de861/src/vs/base/browser/dom.ts#L581
        // Fake parent, thus `dom.isAncestor` will always return `true`
        Object.defineProperty(monacoSubMenu, "parentNode", {
          get() {
            return src;
          },
        });
        // https://github.com/microsoft/vscode/blob/3e452bfef11522d0151fd2e884bb8bf869d7d2fa/src/vs/base/browser/dom.ts#L632
        // Changes since vscode 1.84.0
        src._currentSubMenu = monacoSubMenu;
        proxy(
          src,
          "contains",
          useOldRet(
            (ret, e) =>
              ret ||
              src._currentSubMenu === e ||
              src._currentSubMenu.contains(e)
          )
        );
        // If submenu loses focus, dispatch to `<li>`
        monacoSubMenu.addEventListener("focusout", (e) =>
          setTimeout(() =>
            src.dispatchEvent(new Event(e.type, { bubbles: false, ...e }))
          )
        );
        // Recursively fix new menu
        fixMenu(monacoSubMenu);

        monacoSubMenu._hiddenTag = true;
        return monacoSubMenu;
      }

      src.append = (e) => parent.append(fixSubMenu(e));
      src.removeChild = (e) => parent.removeChild(e);
      src.replaceChild = (e) => parent.replaceChild(fixSubMenu(e));
    }

    function fix(scrollableElement) {
      if (
        !scrollableElement ||
        !scrollableElement.classList.contains("monaco-scrollable-element")
      )
        return scrollableElement;

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
      actionBar.appendChild(scrollableElement);
      actionBar
        .querySelectorAll("ul.actions-container > li")
        .forEach((menuItem) => moveSubMenu(menuItem, actionBar));

      return actionBar;
    }
  }

  // Fix top bar menu
  const fixMenuBar = (gridView) => {
    function fixMenuBotton(menu) {
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
  };

  const fixContextMenu = fixMenu;
})();
