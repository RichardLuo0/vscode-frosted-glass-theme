## vscode-frosted-glass-theme
Bring frosted glass menu (like windows acrylic or mac os) to your vscode!
## Preview
![CodeHover](image/CodeHover.jpg) \
![ContextMenu](image/ContextMenu.jpg) \
![MenuBar](image/MenuBar.jpg) \
![SearchBar](image/SearchBar.jpg) \
![CommandPanel](image/CommandPanel.jpg)
## Direct Install
* In microsoft vscode marketplace, search for "Frosted Glass Theme", install
* Open command panel, type in "Frosted Glass Theme: Enable", press enter
* **You can change menu background color in vscode settings, every time you change something in settings, please execute "Frosted Glass Theme: Apply Configuration" to apply change**
* **Every time vscode update itself, you have to re-enable Frosted Glass Theme**
### For linux user
In linux, most menus are managed by system, which I can not access. However, you can still enjoy many small menus which is managed by vscode
## Or install via Custom CSS and JS Loader extension
* Install "Custom CSS and JS Loader" extension
* Download files in inject/ folder in this repo
* In settings, add
    ```
    "vscode_custom_css.imports":[ 
        "file:///your/path/to/vscode-frosted-glass-theme.css",
        "file:///your/path/to/vscode-frosted-glass-theme.js"
    ]
    ```
* shift + ctrl + p to open command panel
* Type in "reload custom css and js", press enter, then restart according to instruction
* It should be working. You should have seen translucent effect on menu
* You can change menu color by modifying "--background-color" in vscode-frosted-glass-theme.css file
## Known issues
* Some sub menu may not display normally.
* Sometimes UI interface may be dislocation, try comment out "--transition" in css 
## Thanks
[be5invis/vscode-custom-css](https://github.com/be5invis/vscode-custom-css)