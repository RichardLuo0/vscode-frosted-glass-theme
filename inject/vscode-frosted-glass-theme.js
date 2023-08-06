(function () {
	const useThemeColor = true;
	const opacity = 0.4;

	function setupColor() {
		const colorList = [
			"--vscode-editorHoverWidget-background",
			"--vscode-editorSuggestWidget-background",
			"--vscode-peekViewResult-background",
			"--vscode-quickInput-background",
			"--vscode-menu-background",
			"--vscode-editorWidget-background",
			"--vscode-notifications-background",
			"--vscode-debugToolBar-background",
			"--vscode-editorHoverWidget-statusBarBackground"
		];
		const monacoWorkbench = document.body.querySelector(".monaco-workbench");
		if (useThemeColor) {
			const alpha = Math.round(opacity * 255).toString(16);
			const monacoWorkbenchStyle = window.getComputedStyle(monacoWorkbench);
			for (const color of colorList) {
				monacoWorkbench.style
					.setProperty(color, monacoWorkbenchStyle.getPropertyValue(color)
						+ alpha);
			}
		} else {
			for (const color of colorList) {
				monacoWorkbench.style.setProperty(color, "var(--background-color)");
			}
		}
	}

	// proxy function of src
	function proxy(src, functionName, before, after) {
		if (!src) return;
		if (src[functionName]._hiddenTag) return;
		let oldFunction = src.__proto__[functionName];
		src[functionName] = function () {
			if (!(before && before.call(this, ...arguments))) {
				let temp = oldFunction.call(this, ...arguments);
				return after ? after(temp) : temp;
			}
		};
		src[functionName]._hiddenTag = true;
	}

	fixEverything = () => {
		// proxy dom operation on src element
		function proxyDOM(src, parent) {
			src.append = e => {
				parent.appendChild(e);
				// DOM.isAncestor will always return true
				Object.defineProperty(e, "parentNode", {
					get() {
						return src;
					}
				});
				// fix new sub menu
				fixMenu(e);
			};
			src.removeChild = e => parent.removeChild(e);
			src.replaceChild = e => parent.replaceChild(e);
		}

		function fixMenu(menuContainer) {
			function fix(e) {
				let parent = e.querySelector(".monaco-menu");
				if (!parent) return;
				e.querySelectorAll(".actions-container li").forEach(menuItem => {
					// position:absolute will be invalid if drop-filter is set on menu
					// so I just move sub menu below .monaco-menu instead of <ul>	
					proxyDOM(menuItem, parent);
				});
			}
			// if menu has existed, fix it now, otherwise, wait for appendChild
			if (menuContainer.childElementCount <= 0)
				proxy(menuContainer, "appendChild", fix);
			else fix(menuContainer);
		}

		function hasChildWithTagName(e, tagName) {
			for (const child of e.children) {
				if (child.tagName === tagName)
					return true;
			}
			return false;
		}

		// fix top bar menu
		function fixMenuBotton(menu) {
			proxy(menu, "append", fixMenu);
			proxy(menu, "appendChild", fixMenu);
		}
		let menuBar = document.querySelector(".menubar");
		let menus = menuBar.querySelectorAll(".menubar-menu-button");
		menus.forEach(fixMenuBotton);
		proxy(menuBar, "append", fixMenuBotton);
		proxy(menuBar, "appendChild", fixMenuBotton);
		proxy(menuBar, "insertBefore", fixMenuBotton);

		// fix context menu which is wrapped into shadow dom
		let oldAttachShadow = Element.prototype.attachShadow;
		Element.prototype.attachShadow = function () {
			let e = oldAttachShadow.call(this, ...arguments);
			proxy(e, "appendChild", (menuContainer) => {
				if (menuContainer.tagName !== "SLOT") {
					if (!hasChildWithTagName(e, "LINK")) {
						// copy style from document into shadowDOM
						for (const child of document.body.children)
							if (child.tagName === "LINK")
								HTMLElement.prototype.appendChild.call(e, child.cloneNode());
					}
					fixMenu(menuContainer);
				}
			});
			return e;
		};

		// fix side bar menu
		let contextView = document.querySelector(".context-view");
		proxy(contextView, "appendChild", (e) => {
			if (e.classList.contains("monaco-scrollable-element"))
				fixMenu(e);
		});
	};

	let isFixed = false;
	proxy(document.body, "appendChild", (e) => {
		function onAppended() {
			if (!isFixed
				&& e.firstChild?.className === "monaco-grid-view"
				&& e.lastChild?.className === "context-view") {
				setupColor();
				fixEverything();
				isFixed = true;
			}
			return e;
		}
		proxy(e, "prepend", undefined, onAppended);
		proxy(e, "appendChild", undefined, onAppended);
	});
})();
