# 毛玻璃主题
对 vscode 外观的全面增强。主要功能包括亚克力效果，云母背景，reveal效果，翻转效果，动画以及更多功能！完全可定制。设计为与其他颜色主题兼容。

![Visual Studio Marketplace Last Updated](https://img.shields.io/visual-studio-marketplace/last-updated/RichardLuo.frosted-glass-theme?style=for-the-badge&color=%234CAF50)
![Visual Studio Marketplace Installs](https://img.shields.io/visual-studio-marketplace/i/RichardLuo.frosted-glass-theme?style=for-the-badge&color=%232196F3)
![GitHub Repo stars](https://img.shields.io/github/stars/RichardLuo0/vscode-frosted-glass-theme?style=for-the-badge&link=https%3A%2F%2Fgithub.com%2FRichardLuo0%2Fvscode-frosted-glass-theme&color=%23FF9800)
![Visual Studio Marketplace Rating](https://img.shields.io/visual-studio-marketplace/r/RichardLuo.frosted-glass-theme?style=for-the-badge&link=https%3A%2F%2Fmarketplace.visualstudio.com%2Fitems%3FitemName%3DRichardLuo.frosted-glass-theme%26ssr%3Dfalse%23review-details&color=%239C27B0)

[English](README.md)

<span style="font-size: 24px;font-weight: bold">
这是一个侵入式主题，它可以与其他颜色主题一起安装。
<br>
安装前请阅读此文档。
<br>
支持自定义SVG。
</span>

## 预览图
![Animation](image/Animation.gif) \
![FakeMica](image/FakeMica.jpg) \
![CodeHover](image/CodeHover.jpg) \
![ContextMenu](image/ContextMenu.jpg) \
![MenuBar](image/MenuBar.jpg) \
![SearchBar](image/SearchBar.jpg) \
![CommandPanel](image/CommandPanel.jpg) \
![PanelHeader](image/PanelHeader.jpg)
## 安装
1. 安装本扩展。
1. 打开命令面板，输入`Frosted Glass Theme: Enable`，回车。
1. **你可以在vscode设置中自定义本主题。**
1. **每次vscode更新，你都必须重新运行`Frosted Glass Theme: Enable`。**

如果你想要用其他扩展加载本主题，或者你更喜欢自己维护`workbench.html`，下载整个`inject` 文件夹，然后引入`inject\vscode-frosted-glass-theme.js` (使用`type="module"`)。然后移除 `workbench.html` 中的 `<meta http-equiv="Content-Security-Policy" ... />` (它会阻止SVG加载)。
### 对于Linux和MacOS用户
你需要把 `window.titleBarStyle` 设置为 `custom` 。否则效果很有限。
## 自定义
* 设置中的透明度选项会与主题颜色混合，除非他们已经有透明度了。
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
    在 `theme` 文件夹中有更多示例，我欢迎大家来发pull request。
* `frosted-glass-theme.svg` 从url中加载一张svg。产生的svg元素是静态的并且只能使用从 `monaco-workbench` 继承的css变量。你可以在 `resource` 文件夹下找到更多svg。
* `frosted-glass-theme.tintSvg` 为 `frosted-glass-theme.filter` 中定义的每一个key产生不同的svg，并且 `<filter>` 上的id被改成了 `id-key`。在svg里，你可以使用一个特殊的css变量 `--fgt-current-background`，代表元素的背景颜色。
* `frosted-glass-theme.filter` 设置是一个代表每个元素使用的filter的对象。它的key定义在 `src-inject/acrylic.ts` 的 `colorVarList` 中。值类型定义如下：
    ```typescript
    type Filter = {
        filter: string;
        disableBackgroundColor: boolean;
        opacity: number;
    };
    type FilterOp = Partial<Filter>;
    const value = string | FilterOp | undefined;
    ```
    `frosted-glass-theme.disableBackgroundColor` 会关闭元素的背景颜色（filter 应该提供一个颜色）。然而 `minimap` 、`decorationsOverviewRuler` 以及 `terminalOverlay` 基于canvas绘制并且自己提供背景色，因此你必须为他们指定一个无背景色的filter。\
    有一个特殊的key `default`, 相当于一个默认值。你可以使用一个特殊的关键字 `{key}` 来表示当前的key。和 `tintSvg` 一起用，你就可以为每个元素创建不同颜色的svg。\
    比如，你创建了一张svg，其中包含一个 `<filter>` 的 `id` 为 `fgt-acrylic`，并且你把它添加到了 `tintSvg` 中。然后你就可以设置一个值 `url(#fgt-acrylic-{key})`，那么它就会自动使用元素的背景颜色。
* The `frosted-glass-theme.animation` 的key定义在 `src-inject/animation.ts` 的 `selectorMap` 中，或者也可以是css选择器。值可以是定义在 `src-inject/vscode-frosted-glass-theme.css` 的 `Animation` 中的css动画或者定义在 `src-inject/effect/effect.ts` 的 `effectMap` 中的effect。然而，effect不会被css timing function影响，他们只是被 `animationstart` 事件触发。
* 你可以通过调用 `window._fgtTheme.registerEffect(key: string, func: (e: Element) => void)` 添加自己的effect。
* 默认的设定在 `inject/config.json` 中。
## 卸载
* 打开命令面板，输入“Frosted Glass Theme: Disable”，回车。
* 用扩展面板正常卸载。
## 感谢
* [be5invis/vscode-custom-css](https://github.com/be5invis/vscode-custom-css)
## 免责声明
本扩展修改了 `vs\code\electron-sandbox\workbench\workbench.html` 来注入文件。风险自负。\
本扩展在 `vs\code\workbench.*.bak-frosted-glass` 中保留备份，以防出现问题。
