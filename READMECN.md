## vscode 毛玻璃主题
为你的vscode带来类似Mac OS或是Windows的acrylic material效果的菜单！

[英文版](README.md)
## 这本身不是一个主题，可以与其他主题一起安装
## 预览图
![CodeHover](image/CodeHover.jpg) \
![ContextMenu](image/ContextMenu.jpg) \
![MenuBar](image/MenuBar.jpg) \
![SearchBar](image/SearchBar.jpg) \
![CommandPanel](image/CommandPanel.jpg)
## 直接安装
* 从vscode插件商店搜索Frosted Glass Theme安装
* 打开命令面板，输入“Frosted Glass Theme: Enable”，回车
* **你可以在vscode设置中改变菜单颜色等等，每次更改设置，请执行“Frosted Glass Theme: Apply Configuration”应用**
* **每次vscode更新，你都必须重新启用Frosted Glass Theme**
### 对于linux用户
在linux下大部分菜单由系统托管，我没法修改这部分菜单。但是你还是能看到在由vscode生成的菜单上的效果
## 或者通过Custom CSS and JS Loader拓展安装
* 下载本仓库 `inject/` 文件夹下的文件
* 根据"Custom CSS and JS Loader"拓展页面上的指示安装
* 你可以根据自己的主题修改vscode-frosted-glass-theme.css文件中--background-color来修改菜单的颜色
## 已知问题
* 部分子菜单无法显示
* 有时候界面可能会发生错位，如果发生请注释掉css中--transition
## 感谢
* [be5invis/vscode-custom-css](https://github.com/be5invis/vscode-custom-css)