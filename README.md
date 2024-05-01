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
* Open command panel, type in "Frosted Glass Theme: Enable", press enter
* **You can customize theme in vscode settings, every time you change something in settings, please execute "Frosted Glass Theme: Apply Configuration" to apply change**
* **Every time vscode updates, you have to re-enable**
* Menu color is controlled by `menu.background`. Reveal effect color is controlled by `menu.selectionBackground` (I suggest using #000000 or #ffffff). The opacity in this extension's settings will be applied directly on these color. I suggest using the following format if you need to change color.
  ```json
  "workbench.colorCustomizations": {
    "[Default Dark Modern]": {
        "menu.selectionBackground": "#ffffff",
        "menu.background": "#000000"
    },
  }
  ```
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
