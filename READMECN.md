# vscode 毛玻璃主题
为你的vscode带来类似Mac OS或是Windows的acrylic material效果的菜单！

[English](README.md)
## 这本身不是一个主题，它可以与其他主题一起安装
## 安装前请阅读此文档
## 预览图
![Animation](image/Animation.gif) \
![CodeHover](image/CodeHover.jpg) \
![ContextMenu](image/ContextMenu.jpg) \
![MenuBar](image/MenuBar.jpg) \
![SearchBar](image/SearchBar.jpg) \
![CommandPanel](image/CommandPanel.jpg) \
![PanelHeader](image/PanelHeader.jpg)
## 安装
* 从vscode拓展商店搜索Frosted Glass Theme安装
* 打开命令面板，输入“Frosted Glass Theme: Enable”，回车
* **你可以在vscode设置中自定义主题，每次更改设置，请执行“Frosted Glass Theme: Apply Configuration”应用**
* **每次vscode更新，你都必须重新启用**
### 对于Linux和MacOS用户
你需要把 `window.titleBarStyle` 设置为 `custom` 。否则效果很有限。
## 卸载
* 打开命令面板，输入“Frosted Glass Theme: Disable”，回车
* 用拓展面板正常卸载
## 已知问题
* 如果动画闪烁，尝试设置 `frosted-glass-theme.animation` 为 `none`
## 感谢
* [be5invis/vscode-custom-css](https://github.com/be5invis/vscode-custom-css)
## 免责声明
本拓展修改了 `vs\code\electron-sandbox\workbench\workbench.html` 来注入文件。风险自负。
本拓展在 `vs\code\workbench.*.bak-frosted-glass` 中保留备份，以防出现问题。
