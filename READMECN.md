# vscode 毛玻璃主题
为你的vscode带来类似Mac OS或是Windows的acrylic material效果的菜单！

[English](README.md)

<span style="font-size: 24px;font-weight: bold">
这本身不是一个主题，它可以与其他主题一起安装
<br>
安装前请阅读此文档
</span>

## 预览图
![Animation](image/Animation.gif) \
![FakeMica](image/FakeMica.jpg)\
![CodeHover](image/CodeHover.jpg) \
![ContextMenu](image/ContextMenu.jpg) \
![MenuBar](image/MenuBar.jpg) \
![SearchBar](image/SearchBar.jpg) \
![CommandPanel](image/CommandPanel.jpg) \
![PanelHeader](image/PanelHeader.jpg)
## 安装
* 安装本扩展
* 打开命令面板，输入`Frosted Glass Theme: Enable`，回车
* **你可以在vscode设置中自定义本主题。**
* **每次vscode更新，你都必须重新运行`Frosted Glass Theme: Enable`。**
* 菜单颜色由`menu.background`控制。Reveal effect 颜色由`menu.selectionBackground`控制（我建议使用 #000000 或者 #ffffff）。在设置中的透明度选项会被直接应用在主题颜色上，除非他们已经有透明度了。如果有需要改变颜色，我建议使用类似以下的格式：
  ```json
  "workbench.colorCustomizations": {
    "[Default Dark Modern]": {
      "menu.selectionBackground": "#ffffff",
      "menu.background": "#000000"
    },
  }
  ```
* 如果你想要用其他扩展加载本主题，或者你更喜欢自己维护`workbench.html`，你只需要引入`inject\vscode-frosted-glass-theme.js` (设定为`type="module"`)。另外，`inject\vscode-frosted-glass-theme.css`必须放在js文件旁边。
* `Fake mica` 默认关闭。开启 `frosted-glass-theme.fakeMica.enabled` 设置以开启此功能。另外因为本扩展不会自动给你的主题添加透明度，你需要同时改变主题颜色，以下是一个示例:
  ```jsonc
  "workbench.colorCustomizations": {
    "[One Dark Pro]": {
      "menu.selectionBackground": "#ffffff",
      // Title bar opacity not work because: https://github.com/microsoft/vscode/blob/444d7a4b35745ed7733c700a8008f55cd659eb1d/src/vs/workbench/browser/parts/titlebar/titlebarPart.ts#L682
      // "titleBar.activeBackground": "#00000000",  
      "editor.background": "#282c3499",
      "editorGutter.background": "#00000000",
      "editor.lineHighlightBackground": "#2c313c4d",
      "editorPane.background": "#00000000",
      "tab.inactiveBackground": "#00000000",
      "editorGroupHeader.tabsBackground": "#282c34cc",
      "breadcrumb.background": "#00000000",
      "panel.background": "#282c34cc",
      "terminal.background": "#00000000",
      "sideBar.background": "#21252bcc",
      "sideBarTitle.background": "#00000000",
      "statusBar.background": "#21252bcc",
      "statusBar.noFolderBackground": "#21252bcc",
      "input.background": "#1d1f234d",
      "dropdown.background": "#21252bcc",
      "dropdown.border": "#21252b4d",
    },
  }
  ```
### 对于Linux和MacOS用户
你需要把 `window.titleBarStyle` 设置为 `custom` 。否则效果很有限。
## 卸载
* 打开命令面板，输入“Frosted Glass Theme: Disable”，回车
* 用扩展面板正常卸载
## 已知问题
* 如果动画闪烁，尝试设置 `frosted-glass-theme.animation` 为 `none`
## 感谢
* [be5invis/vscode-custom-css](https://github.com/be5invis/vscode-custom-css)
## 免责声明
本扩展修改了 `vs\code\electron-sandbox\workbench\workbench.html` 来注入文件。风险自负。\
本扩展在 `vs\code\workbench.*.bak-frosted-glass` 中保留备份，以防出现问题。
