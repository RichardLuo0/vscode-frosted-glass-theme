## vscode 毛玻璃主题
为你的vscode带来类似Mac OS或是Windows的acrylic material效果的菜单！
## 预览图
![CodeHover](image/CodeHover.jpg)
![ContextMenu](image/ContextMenu.jpg)
![MenuBar](image/MenuBar.jpg)
![SearchBar](image/SearchBar.jpg)
![CommandPanel](image/CommandPanel.jpg)
## 直接安装
* 从vscode插件商店搜索Frosted Glass Theme安装
* 打开命令面板，输入“Enable Frosted Glass Theme”，回车
* **你可以在vscode中改变部分设置，每次更改设置，请执行“Update Frosted Glass Theme”来应用**
* **每次vscode更新，你都必须重新启用Frosted Glass Theme**
### 对于linux用户
在linux下大部分菜单由系统托管，我没法修改这部分菜单。但是你还是能看到在由vscode生成的菜单上的效果
## 通过Custom CSS and JS Loader拓展安装
* 安装"Custom CSS and JS Loader"拓展
* 下载本仓库inject文件夹下的文件
* 在设置中添加
    ```
    "vscode_custom_css.imports":[ 
        "file:///your/path/to/vscode-frosted-glass-theme.css",
        "file:///your/path/to/vscode-frosted-glass-theme.js"
    ]
    ```
* shift + ctrl + p 呼出命令面板
* 输入reload custom css and js, 回车，根据提示重启vscode
* 应该已经生效，应该可以看到菜单变成毛玻璃的效果
* 你可以根据自己的主题修改vscode-frosted-glass-theme.css文件中--background-color来修改菜单的颜色
## 已知问题
* 部分子菜单无法显示
* 有时候界面可能会发生错位，如果发生请注释掉css中--transition
## 感谢
[be5invis/vscode-custom-css](https://github.com/be5invis/vscode-custom-css)