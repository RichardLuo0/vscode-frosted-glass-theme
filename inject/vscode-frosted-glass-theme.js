/* eslint-disable @typescript-eslint/naming-convention */
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
      "--vscode-editorStickyScroll-background",
      "--vscode-tab-unfocusedInactiveBackground",
      "--vscode-tab-inactiveBackground",
      "--vscode-breadcrumb-background",
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
        scrollableElement.style.margin = "-1px";
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

  function isClass(value) {
    return (
      typeof value === "function" &&
      !Object.getOwnPropertyDescriptor(value, "prototype")?.writable
    );
  }

  function findPropertyWith(object, condition) {
    for (const key in object) {
      const value = object[key];
      if (condition(value)) {
        return { key, value };
      }
    }
  }

  function moveDown(element) {
    if (element) {
      element.style.marginTop = "57px";
    }
  }

  function createBackdropCodeEditorWidget(CodeEditorWidget) {
    return class extends CodeEditorWidget {
      constructor(domElement) {
        super(...arguments);
        domElement.style.position = "absolute";
        domElement.style.top = "0px";
        proxy(domElement, "appendChild", (monacoEditor) => {
          moveDown(monacoEditor.querySelector("div.overlayWidgets"));
          moveDown(monacoEditor.querySelector("div.minimap"));
          moveDown(monacoEditor.querySelector(".scrollbar.vertical"));
        });
      }

      setModel() {
        super.setModel(...arguments);
        this.changeViewZones((accessor) => {
          const domNode = document.createElement("div");
          this._viewZoneId = accessor.addZone({
            heightInPx: 57,
            afterLineNumber: 0,
            domNode,
          });
          this.setScrollTop(-57);
        });
      }

      getScrollTop() {
        return super.getScrollTop() + 57;
      }
    };
  }

  function replaceCodeEditorWidget(arguments) {
    let codeEditorWidgetPair;
    const codeEditorWidgetIndex = Array.prototype.findLastIndex.call(
      arguments,
      (exports) => {
        codeEditorWidgetPair = findPropertyWith(
          exports,
          (c) => c.prototype?.changeViewZones
        );
        return codeEditorWidgetPair;
      }
    );
    if (codeEditorWidgetIndex >= 0 && codeEditorWidgetPair !== undefined) {
      const { key, value } = codeEditorWidgetPair;
      const newCodeEditorWidgetExport = Object.create(
        arguments[codeEditorWidgetIndex]
      );
      newCodeEditorWidgetExport[key] = createBackdropCodeEditorWidget(value);
      arguments[codeEditorWidgetIndex] = newCodeEditorWidgetExport;
    }
  }

  function createNewDimension(dimension) {
    if (dimension.height > 0) dimension.height += 57;
    return dimension;
  }

  function useBackdropCodeEditor(factory, domFunction) {
    return function (require, exports, ...modules) {
      replaceCodeEditorWidget(modules);
      factory.call(this, require, exports, ...modules);
      const { key, value: SomeClass } = findPropertyWith(exports, isClass);
      exports[key] = class extends SomeClass {
        constructor(domElement) {
          super(...arguments);
          domFunction?.call(this, domElement);
        }

        layout(dimension) {
          return super.layout(createNewDimension(dimension));
        }
      };
    };
  }

  function makeNewDiffEditorWidget(factory) {
    return useBackdropCodeEditor(factory, (domElement) => {
      domElement.style.position = "absolute";
      domElement.style.top = "0px";
      domElement.querySelector(".diffOverview").style.marginTop = "57px";
    });
  }

  let newTextCodeEditorExport, textCodeEditorExport;

  Object.defineProperty(globalThis, "define", {
    get() {
      return this._define;
    },
    set(oldDefine) {
      this._define = new Proxy(oldDefine, {
        apply: function (target, thisArg, argumentsList) {
          const factory = argumentsList[2];
          switch (argumentsList[0]) {
            case "vs/editor/common/config/editorOptions":
              argumentsList[2] = function (require, exports, ...modules) {
                factory.call(this, require, exports, ...modules);
                proxy(
                  exports.EditorLayoutInfoComputer,
                  "computeLayout",
                  undefined,
                  (layout) => {
                    layout.minimap.minimapHeightIsEditorHeight = false;
                    layout.minimap.minimapCanvasInnerHeight -= 57;
                    layout.minimap.minimapCanvasOuterHeight -= 57;
                    layout.overviewRuler.height -= 57;
                    layout.overviewRuler.top += 57;
                    return layout;
                  }
                );
              };
              break;
            case "vs/workbench/browser/parts/editor/textCodeEditor":
              argumentsList[2] = function (require, exports, ...modules) {
                factory.call(this, ...arguments);
                textCodeEditorExport = exports;

                const newExports = {};
                useBackdropCodeEditor(factory)(require, newExports, ...modules);
                newTextCodeEditorExport = newExports;
              };
              break;
            case "vs/workbench/contrib/files/browser/editors/textFileEditor":
              argumentsList[2] = function (require, exports, ...modules) {
                const textCodeEditorIndex = Array.prototype.findIndex.call(
                  modules,
                  (exports) => exports === textCodeEditorExport
                );
                if (textCodeEditorIndex >= 0) {
                  modules[textCodeEditorIndex] = newTextCodeEditorExport;
                }
                factory.call(this, require, exports, ...modules);
              };
              break;
            case "vs/editor/browser/widget/diffEditorWidget":
              argumentsList[2] = makeNewDiffEditorWidget(factory);
              break;
            case "vs/editor/browser/widget/diffEditorWidget2/diffEditorWidget2":
              argumentsList[2] = makeNewDiffEditorWidget(factory);
              break;
          }
          return Reflect.apply(target, thisArg, argumentsList);
        },
      });
    },
  });
})();
