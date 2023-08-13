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

  const observeThemeColorChange = monacoWorkbench => {
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
      "--vscode-editorGroupHeader-tabsBackground",
      "--vscode-tab-unfocusedInactiveBackground",
      "--vscode-breadcrumb-background",
      "--vscode-breadcrumbPicker-background",
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

  // Proxy dom operation on src element
  function proxyDOM(src, parent) {
    src.append = e => {
      parent.appendChild(e);
      // `DOM.isAncestor` will always return true
      Object.defineProperty(e, "parentNode", {
        get() {
          return src;
        },
      });
      // Fix new sub menu
      fixMenu(e);
    };
    src.removeChild = e => parent.removeChild(e);
    src.replaceChild = e => parent.replaceChild(e);
  }

  function fixMenu(menuContainer) {
    function fix(e) {
      const parent = e.querySelector("div.monaco-menu");
      if (!parent) return;
      e.querySelectorAll("ul.actions-container li").forEach(menuItem => {
        // `position:absolute` will be invalid if drop-filter is set on menu.
        // So I just move sub menu below `.monaco-menu` instead of `<ul>`.
        proxyDOM(menuItem, parent);
      });
    }
    // If menu has existed, fix it now, otherwise, wait for appendChild
    if (menuContainer.childElementCount <= 0)
      proxy(menuContainer, "appendChild", fix);
    else fix(menuContainer);
  }

  const fixMenuBar = gridView => {
    // Fix top bar menu
    function fixMenuBotton(menu) {
      proxy(menu, "append", fixMenu);
      proxy(menu, "appendChild", fixMenu);
    }
    const menuBar = gridView.querySelector(
      "#workbench\\.parts\\.titlebar > div > div.titlebar-left > div.menubar"
    );
    const menus = menuBar.querySelectorAll("div.menubar-menu-button");
    menus.forEach(fixMenuBotton);
    proxy(menuBar, "append", fixMenuBotton);
    proxy(menuBar, "appendChild", fixMenuBotton);
    proxy(menuBar, "insertBefore", fixMenuBotton);
  };

  const fixContextMenu = contextView => {
    // Fix side bar menu
    proxy(contextView, "appendChild", e => {
      if (e.classList.contains("monaco-scrollable-element")) fixMenu(e);
    });
  };

  const fixTabsAndEditor = gridView => {
    const animationDuration = 115;
    const editorContainer = gridView.querySelector("div.editor-container");
    const titleTabs = gridView.querySelector("div.title.tabs");
    const tabsAndActionsContainer = titleTabs.querySelector(
      "div.tabs-and-actions-container"
    );
    const breadcrumbsControl = titleTabs.querySelector(
      "div.tabs-breadcrumbs > div.breadcrumbs-control"
    );

    proxy(
      tabsAndActionsContainer.classList,
      "contains",
      className => {
        if (className === "wrapping") return true;
      },
      false
    );
    Object.defineProperty(tabsAndActionsContainer, "offsetHeight", {
      value: 0,
    });
    proxy(
      breadcrumbsControl.classList,
      "contains",
      className => {
        if (className === "hidden") return true;
      },
      false
    );

    function scrollTo(editor, to) {
      const startTime = performance.now() - 10000;
      const from = editor.offsetTop;
      const delta = Math.abs(from - to);
      function tick() {
        requestAnimationFrame(now => {
          const completion = (now - startTime) / duration;
          if (completion > 1) {
            editor.style.top = to;
            return;
          }
          editor.style.top =
            from + delta * (1 - Math.pow(1 - completion, 3)) + "px";
          tick();
        });
      }
      tick();
    }

    function onEditorAppended(editorInstance) {
      let monacoEditorProxy;
      proxy(
        editorInstance,
        "appendChild",
        monacoEditor => {
          if (monacoEditor.classList.contains("monaco-editor")) {
            const titleTabsHeight = titleTabs.offsetHeight;
            const lineContent = monacoEditor.querySelector(
              "div.monaco-editor > div.overflow-guard > div.monaco-scrollable-element > div.lines-content"
            );

            let isMyAnimationRunning = false;
            const lineContentProxy = new Proxy(e.style, {
              set(_target, prop, newValue, _receiver) {
                if (prop === "top") {
                  if (isMyAnimationRunning) return;
                  if (parseInt(newValue) > 0) monacoEditor.style.top = newValue;
                  else monacoEditor.style.top = "0px";
                }
                return Reflect.set(...arguments);
              },
              get() {
                return Reflect.get(...arguments);
              },
            });
            Object.defineProperty(lineContent, "style", {
              value: lineContentProxy,
            });

            monacoEditor.style.top = titleTabsHeight + "px";
            monacoEditorProxy = document.createElement("div");
            HTMLElement.prototype.appendChild.call(
              editorInstance,
              monacoEditorProxy
            );
            monacoEditorProxy.appendChild(monacoEditor);
            monacoEditorProxy.addEventListener(
              "wheel",
              e => {
                if (e._isProxy) return;
                e.preventDefault();
                e.stopPropagation();
                if (
                  monacoEditor.offsetTop > 0 ||
                  (e.deltaY < 0 && lineContent.offsetTop === 0)
                ) {
                  scrollTo(
                    monacoEditor,
                    Math.max(
                      Math.min(
                        monacoEditor.offsetTop - (e.deltaY / 120) * 50,
                        titleTabsHeight
                      ),
                      0
                    )
                  );
                  return;
                }
                const event = new WheelEvent("wheel", e);
                event._isProxy = true;
                monacoEditor.dispatchEvent(event);
              },
              true
            );
          }
        },
        false
      );
      proxy(
        editorInstance,
        "removeChild",
        monacoEditor => {
          if (monacoEditor.classList.contains("monaco-editor")) {
            HTMLElement.prototype.removeChild.call(
              editorInstance,
              monacoEditorProxy
            );
          }
        },
        false
      );
    }

    const editorInstance = editorContainer.querySelector("div.editor-instance");
    if (editorInstance) {
      onEditorAppended(editorInstance);
    }
    proxy(editorContainer, "appendChild", onEditorAppended);
  };

  function hasChildWithTagName(e, tagName) {
    for (const child of e.children) {
      if (child.tagName === tagName) return true;
    }
    return false;
  }

  // Fix context menu which is wrapped into shadow dom
  proxy(Element.prototype, "attachShadow", undefined, e => {
    proxy(e, "appendChild", menuContainer => {
      if (menuContainer.tagName !== "SLOT") {
        if (!hasChildWithTagName(e, "LINK")) {
          // Copy style from document into shadowDOM
          for (const child of document.body.children)
            if (child.tagName === "LINK")
              HTMLElement.prototype.appendChild.call(e, child.cloneNode());
        }
        fixMenu(menuContainer);
      }
    });
    return e;
  });

  proxy(document.body, "appendChild", monacoWorkbench => {
    observeThemeColorChange(monacoWorkbench);
    proxy(monacoWorkbench, "prepend", gridView =>
      gridView.className === "monaco-grid-view"
        ? (fixMenuBar(gridView), fixTabsAndEditor(gridView))
        : undefined
    );
    proxy(monacoWorkbench, "appendChild", contextView =>
      contextView.className === "context-view"
        ? fixContextMenu(contextView)
        : undefined
    );
  });
})();
