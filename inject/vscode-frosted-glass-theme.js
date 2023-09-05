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
    return {};
  }

  function moveElementDown(element) {
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
          moveElementDown(monacoEditor.querySelector("div.overlayWidgets"));
          moveElementDown(monacoEditor.querySelector("div.minimap"));
          moveElementDown(monacoEditor.querySelector("div.scrollbar.vertical"));
          moveElementDown(
            monacoEditor.querySelector("canvas.decorationsOverviewRuler")
          );

          monacoEditor.querySelector(".overflow-guard").style.overflow =
            "visible";
          monacoEditor.querySelector(".lines-content").style.overflow =
            "visible";
          const scrollableElement = monacoEditor.querySelector(
            ".monaco-scrollable-element"
          );
          scrollableElement.style.overflow = "visible";
          scrollableElement.style.paddingBottom = "57px";
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

  function makeNewDiffEditorWidget(factory) {
    return function (require, exports, ...modules) {
      factory.call(this, require, exports, ...modules);
      const { key, value: SomeClass } = findPropertyWith(exports, isClass);
      exports[key] = class extends SomeClass {
        constructor(domElement) {
          super(...arguments);
          domElement.style.position = "absolute";
          domElement.style.top = "0px";
          domElement.querySelector(".diffOverview").style.marginTop = "57px";
        }
      };
    };
  }

  class ExportsHook {
    constructor(originalExports, hookExports) {
      this._originalExports = originalExports;
      this._hookExports = hookExports;
    }

    use(factory) {
      const that = this;
      return function (require, exports, ...modules) {
        that._hijackModule(modules);
        factory.call(this, require, exports, ...modules);
      };
    }

    _hijackModule(modules) {
      if (this._originalExports && this._hookExports) {
        const index = Array.prototype.findIndex.call(
          modules,
          (module) => module === this._originalExports
        );
        if (index >= 0) {
          modules[index] = this._hookExports;
        }
      }
    }
  }

  class DependencyHook extends ExportsHook {
    constructor(dependencies, hookFun) {
      super(undefined, undefined);
      this._dependencies = dependencies;
      this._hookFun = hookFun;
      this._moduleIndex = 0;
    }

    hook(moduleName, factory) {
      if (!this.isFinished() && moduleName === this._getCurrentDependency()) {
        const moduleIndex = this._moduleIndex;
        this._moduleIndex++;
        const that = this;
        return function (require, exports, ...modules) {
          factory.call(this, require, exports, ...modules);
          that._hijackModule(modules);
          const newExports = {};
          (that._hookFun
            ? that._hookFun(moduleIndex, factory, that._dependencies)
            : factory
          ).call(this, require, newExports, ...modules);
          that._originalExports = exports;
          that._hookExports = newExports;
        };
      } else return factory;
    }

    use(factory) {
      return this.isFinished() ? super.use(factory) : factory;
    }

    dump() {
      return new ExportsHook(this._originalExports, this._hookExports);
    }

    isFinished() {
      return this._moduleIndex >= this._dependencies.length;
    }

    _getCurrentDependency() {
      return this._dependencies[this._moduleIndex];
    }
  }

  const viewLayoutHook = new DependencyHook(
    [
      "vs/editor/common/viewLayout/viewLayout",
      "vs/editor/common/viewModel/viewModelImpl",
      "vs/editor/browser/widget/codeEditorWidget",
      "vs/workbench/browser/parts/editor/textCodeEditor",
    ],
    (moduleIndex, factory, dependencies) => {
      switch (moduleIndex) {
        case 0:
          return function (require, exports, ...modules) {
            factory.call(this, require, exports, ...modules);
            const { key, value: ViewLayout } = findPropertyWith(
              exports,
              isClass
            );
            if (key !== undefined && ViewLayout !== undefined)
              exports[key] = class extends ViewLayout {
                getCurrentViewport() {
                  const viewport = super.getCurrentViewport();
                  viewport.height += 57;
                  return viewport;
                }
              };
          };
        case dependencies.length - 2:
          return function (require, exports, ...modules) {
            factory.call(this, require, exports, ...modules);
            const { key, value: CodeEditorWidget } = findPropertyWith(
              exports,
              (value) => isClass(value) && value.prototype?.changeViewZones
            );
            if (key !== undefined && CodeEditorWidget !== undefined)
              exports[key] = createBackdropCodeEditorWidget(CodeEditorWidget);
          };
        default:
          return factory;
      }
    }
  );

  let codeEditorWidgetHook;

  Object.defineProperty(globalThis, "define", {
    get() {
      return this._define;
    },
    set(oldDefine) {
      this._define = new Proxy(oldDefine, {
        apply: function (target, thisArg, argumentsList) {
          if (argumentsList.length >= 3) {
            let factory = argumentsList[2];
            factory = viewLayoutHook.hook(argumentsList[0], factory);
            switch (argumentsList[0]) {
              case "vs/workbench/contrib/files/browser/editors/textFileEditor":
                factory = viewLayoutHook.use(factory);
                break;
              case "vs/editor/browser/widget/codeEditorWidget":
                const hookedFactory = factory;
                factory = function () {
                  hookedFactory.call(this, ...arguments);
                  codeEditorWidgetHook = viewLayoutHook.dump();
                };
                break;
              case "vs/editor/browser/widget/diffEditorWidget":
              case "vs/editor/browser/widget/diffEditorWidget2/diffEditorWidget2":
                factory = codeEditorWidgetHook
                  ? codeEditorWidgetHook?.use(makeNewDiffEditorWidget(factory))
                  : factory;
                break;
            }
            argumentsList[2] = factory;
          }
          return Reflect.apply(target, thisArg, argumentsList);
        },
      });
    },
  });
})();
