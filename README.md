# vscode-frosted-glass-theme
Bring frosted glass menu (like windows acrylic or mac os) to your vscode!

[中文版](READMECN.md)
## This is not a theme by itself. It can work with any other theme
## Plz read this document before installation
## Preview
![Animation](image/Animation.gif) \
![CodeHover](image/CodeHover.jpg) \
![ContextMenu](image/ContextMenu.jpg) \
![MenuBar](image/MenuBar.jpg) \
![SearchBar](image/SearchBar.jpg) \
![CommandPanel](image/CommandPanel.jpg) \
![PanelHeader](image/PanelHeader.jpg)
## Install
* From microsoft vscode marketplace, search for "Frosted Glass Theme", install
* Open command panel, type in `Frosted Glass Theme: Enable`, press enter
* **You can customize this theme in vscode settings.**
* **Every time vscode updates, you have to re-run `Frosted Glass Theme: Enable`.**
* Menu color is controlled by `menu.background`. Reveal effect color is controlled by `menu.selectionBackground` (I suggest using #000000 or #ffffff). The opacity in this extension's settings will be applied directly on these color. I suggest using the following format if you need to change color.
  ```json
  "workbench.colorCustomizations": {
    "[Default Dark Modern]": {
        "menu.selectionBackground": "#ffffff",
        "menu.background": "#000000"
    },
  }
  ```
* If you want to load this theme by another extension or you prefer to maintain the `workbench.html` yourself, you may just import only the `inject\vscode-frosted-glass-theme.js` (with `type="module"`). In addition, the `inject\vscode-frosted-glass-theme.css` must be put alongside the js file.
### For Linux and perhaps MacOS user
You need to set `window.titleBarStyle` to `custom` to see the effect. Otherwise the effect is very limited.
## Uninstall
* Open command panel, type in "Frosted Glass Theme: Disable", press enter
* Uninstall from the extension panel as usual
## Known issues
* If the animation is flickering, try turn it off by setting `frosted-glass-theme.animation` to `none`
## Thanks
* [be5invis/vscode-custom-css](https://github.com/be5invis/vscode-custom-css)
## Disclaimer
This extension modifies `vs\code\electron-sandbox\workbench\workbench.html` to inject files. So use at your own risk. \
This extension keep a backup in `vs\code\workbench.*.bak-frosted-glass` in case something goes wrong.
