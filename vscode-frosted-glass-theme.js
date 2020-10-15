onloadComplete = () => {
	// proxy function of src
	function proxy(src, functionName, newFunction, modifyFunction) {
		let oldFunction = src[functionName];
		src[functionName] = function () {
			if (!(newFunction && newFunction.call(this, ...arguments))) {
				let temp = oldFunction.call(this, ...arguments);
				return modifyFunction ? modifyFunction(temp) : temp;
			}
		}
	}

	// proxy dom operation on src element
	function proxyAll(src, parent) {
		src.appendChild = e => {
			parent.appendChild(e);
			// DOM.isAncestor will always return true
			Object.defineProperty(e, "parentNode", {
				get() {
					return src;
				}
			})
		}
		src.removeChild = e => parent.removeChild(e);
		src.replaceChild = e => parent.replaceChild(e);
	}

	function fixMenu(menuContainer) {
		proxy(menuContainer, "appendChild", (e) => {
			let parent = e.querySelector(".monaco-menu");
			e.querySelectorAll(".actions-container li").forEach(menuItem => {
				// position:absolute will be invalid if drop-filter is set on menu
				// so I just move sub menu below .monaco-menu instead of <ul>
				proxyAll(menuItem, parent);
			});
		})
	}

	function hasChildWithTagName(e, tagName) {
		for (const child of e.children) {
			if (child.tagName === tagName)
				return true;
		}
		return false;
	}

	// fix menu bar sub menu
	let menus = document.querySelectorAll(".menubar-menu-button");
	menus.forEach(menu => {
		proxy(menu, "appendChild", menuContainer => {
			fixMenu(menuContainer);
		})
	})

	// fix context menu which is wrapped into shadow dom
	let oldAttachShadow = Element.prototype.attachShadow;
	Element.prototype.attachShadow = function () {
		let e = oldAttachShadow.call(this, ...arguments);
		let oldAppendChild = e.appendChild;
		e.appendChild = function (menuContainer) {
			if (!hasChildWithTagName(e, "LINK")) {
				// copy style from document into shadowDOM
				for (const child of document.body.children) {
					if (child.tagName === "LINK")
						oldAppendChild.call(this, child.cloneNode());
				}
			}
			fixMenu(menuContainer);
			oldAppendChild.call(this, ...arguments);
		}
		return e;
	};
}

window.onload = () => {
	// I have no idea when will vscode loaded completely
	// So I just make a 3 seconds delay
	setTimeout(onloadComplete, 3000);
}
