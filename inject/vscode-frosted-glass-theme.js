let delay = 3000;

onloadComplete = () => {
	// proxy function of src
	function proxy(src, functionName, newFunction, modifyFunction) {
		if (!src) return;
		let oldFunction = src.__proto__[functionName];
		src[functionName] = function () {
			if (!(newFunction && newFunction.call(this, ...arguments))) {
				let temp = oldFunction.call(this, ...arguments);
				return modifyFunction ? modifyFunction(temp) : temp;
			}
		};
	}

	// proxy dom operation on src element
	function proxyAll(src, parent) {
		src.append = e => {
			parent.appendChild(e);
			// DOM.isAncestor will always return true
			Object.defineProperty(e, "parentNode", {
				get() {
					return src;
				}
			});
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
				proxyAll(menuItem, parent);
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
	let menus = document.querySelectorAll(".menubar-menu-button");
	menus.forEach(menu => {
		proxy(menu, "appendChild", menuContainer => {
			fixMenu(menuContainer);
		});
	});

	// fix context menu which is wrapped into shadow dom
	let oldAttachShadow = Element.prototype.attachShadow;
	Element.prototype.attachShadow = function () {
		let e = oldAttachShadow.call(this, ...arguments);
		let oldAppendChild = e.__proto__.appendChild;
		e.appendChild = function (menuContainer) {
			if (menuContainer.tagName !== "SLOT") {
				if (!hasChildWithTagName(e, "LINK")) {
					// copy style from document into shadowDOM
					for (const child of document.body.children)
						if (child.tagName === "LINK")
							oldAppendChild.call(this, child.cloneNode());
				}
				fixMenu(menuContainer);
			}
			return oldAppendChild.call(this, ...arguments);
		};
		return e;
	};

	// fix side bar menu
	let contextView = document.querySelector(".context-view");
	proxy(contextView, "appendChild", (e) => {
		if (e.classList.contains("monaco-scrollable-element"))
			fixMenu(e);
	});
};

window.onload = () => {
	// I have no idea when will vscode loaded completely
	// So I just make a 3 seconds delay
	setTimeout(onloadComplete, delay);
};
