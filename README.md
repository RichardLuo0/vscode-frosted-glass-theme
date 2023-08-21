## vscode-frosted-glass-theme
Bring frosted glass menu (like windows acrylic or mac os) to your vscode!

[中文版](READMECN.md)
## This is not a theme by itself. It can work with any other themes
## Preview
![CodeHover](image/CodeHover.jpg) \
![ContextMenu](image/ContextMenu.jpg) \
![MenuBar](image/MenuBar.jpg) \
![SearchBar](image/SearchBar.jpg) \
![CommandPanel](image/CommandPanel.jpg)
## Direct Install
* From microsoft vscode marketplace, search for "Frosted Glass Theme", install
* Open command panel, type in "Frosted Glass Theme: Enable", press enter
* **You can change menu background color in vscode settings, every time you change something in settings, please execute "Frosted Glass Theme: Apply Configuration" to apply change**
* **Every time vscode or this extension updates, you have to re-enable**
### For Linux and perhaps MacOS user
You need to set `window.titleBarStyle` to `custom` to see the effect. Otherwise the effect is very limited.
## Or install via Custom CSS and JS Loader extension
* Download files in `inject/` folder from this repo
* Follow the instruction on "Custom CSS and JS Loader" extension to complete setup
* You can change menu color by modifying "--background-color" in vscode-frosted-glass-theme.css file
## Known issues
* Sometimes UI interface may be dislocation, try comment out "--transition" in css 
## Thanks
* [be5invis/vscode-custom-css](https://github.com/be5invis/vscode-custom-css)