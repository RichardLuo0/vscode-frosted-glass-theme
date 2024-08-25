# Change Log

## [0.8.6]
- bd2bb66: feat: add Default Dark Modern theme mod
- 799d6bc: feat: setup will load theme mod from github
- c10472b: fix: no need to reserve space for dropdown
- 0444142: i18n: improve translation

## [0.8.5]
- 47bbda1: fix: use vscode default animation if not presented

## [0.8.4]
- 87f8c51: feat: add validation to settings
- 9d52f4f: feat: separate dropdown animation
- a8e4bea: feat: add hover animation (defaults to `none`)

## [0.8.2]
- 059f3db: fix: extra space before selected text

## [0.8.1]
- 6f4f2bb: feat: add `dropdown` acrylic
- bc29941: feat: add animation to dropdown
- 1941ddc: feat: focusBackground and disableForDisabledItem
- f16eef7: feat: add `additionalStyle`

## [0.8.0]
- 2caf410: feat: add open config in readonly mode
- fd96bcd: feat: add localization
- 6783a1e: feat: first time setup
- 84a93aa: feat: modify light theme

## [0.7.13]
- eac5f7b: perf: use `filter` for mica so it should be better
- ef1ccdd: feat: opacity and disableBackgroundColor can be controlled per key
- 5eea2e5: feat: add `progressBarBehindSectionHeader`
- 7433e57: feat: add and fix some svgs

## [0.7.12]
- f3b2b33: chore: default value changes
- 29d36e5: feat: support svg filter

## [0.7.11]
- f82f2e0: fix: ignore original transparency
- 368c3c6: fix: `.codicon` transition should only react to color change
- 262f04b: feat: fake mica now supports floating window

## [0.7.10]
- be29ed6: fix: option order
- 4a030e6: fix: remove `brightness(30%)` from default mica filter
- 6d1b10a: fix: mica fix is only enabled when fake mica is enabled
- 99bcdaf: feat: add filter in dark mode for fake mica

## [0.7.8]
- 13e9e9a: feat: fakeMica effect
- 8006990: feat: add hover-overlay

## [0.7.7]
- bb468cf: feat: `backgroundColor` is deprecated
- a08d55f: fix: not work for compact menu bar

## [0.7.6]
- defc794: fix: some theme has a outline to `action-menu-item`
- e082dd3: feat: add `borderRadius` settings

## [0.7.5]
- 3be3076: fix: run as admin does not work
- b71e6e6: perf: save a bit memory storing css file path

## [0.7.4]
- 61f306b: feat: make separator color a separate setting
- 584d965: feat: add `--vscode-menu-separatorBackground`
- acc3295: feat: add open injected js file
- 7d9b00d: build: use esbuild
- 879a490: fix: set backgroundColor will only affect `backgroundVarList`
- 6e8d332: fix: selectionBackground will not be affected by opacity settings if reveal effects is enabled

## [0.7.3]
- c23783b: fix: avatar overflow in git commit window
- e579f50: fix: `debug-hover-widget .monaco-list-rows` has background
- 826c15c: fix: the content inside `pane-body` could be overflow

## [0.7.2]
- d498804: fix: light effects color now follow `vscode-menu-selectionBackground`

## [0.7.1]
- da3b6bc: fix: search view result is overlapped by content
- 5437c61: chore: change the default gradientSize to 200
- c16c2c5: feat: an option to change minimap opacity
- ab9f5ec: feat: add effect to `decorationsOverviewRuler`. In vanilla vscode, it seems missing background color
- a407386: feat: add `cell-title-toolbar` to the notebook

## [0.7.0]
- faee842: feat: add reveal effect
- 7c4ebc8: feat: change border opacity
- 5eea4d0: fix: incorrect background color

## [0.6.18]
- 0d5ff15: fix: `.monaco-list-rows` not transparent
- 4c8f6ea: fix: mistaken double backdrop-filter
- 9539a11: fix: `reload window` now will be shown after apply config
- d35bb86: fix: fix wrong color
- 0928179: fix: dialog becomes transparent
- de69760: fix: dropdown menu inside panel header disappears

## [0.6.17]
- 0326c76: chore: new icons
- 67752b5: feat: now `pane-header` has the backdrop effect
- 1341c76: fix: the highlighted line in sticky widget is not visible
- 57e7d2d: fix: add support for `editorSuggestWidget` selected background color.
- 8c1d771: feat: auto re-enable after updated

## [0.6.16]
- 2f3166b: fix: remove `outline:none` on `.quick-input-widget`
- 753e7b9: refactor: configuration handling …

## [0.6.14]
- e031a2e: feat: support floating window (since vscode 1.85.0)

## [0.6.13]
- 934b1de: fix: if sub menu is opened twice, it disappears shortly after

## [0.6.12]
- fdf412e: feat: add `.action-widget` animation
- 1cf2a71: fix: `dom.isAncestor` changes after vscode 1.84.0 …
- 060603d: fix: submenu does not close if it is out of focus

## [0.6.9]
- bug fix
- 9e92cbc: feat: support color-mix() since vscode 1.82.0 (Chrome 114)
- ab1a7af: feat: add .sticky-widget and .monaco-tree-type-filter

## [0.6.7]
- 5559f4c: feat: add `monaco-editor-overlaymessage`
- 09af6aa: feat: add `monaco-breadcrumbs-picker` animation
- 33a1686: feat: add animation for dialog
- 4b4fd95: feat: add animation for menus
- 3fb3f57: feat: make `.rename-box > input` transparent

## [0.6.6]
- e33a689: feat: try with admin privileges (or sudo)
- 45109e7: feat: add `custom dialog`

## [0.6.0]
- fadee5f: chore: change msg text: "Developer: Reload Window" sometimes does not work
- 52ee849: feat: allow extracting color from current theme
- 508612a: refactor: move to editor() pattern
- 81f6131: perf: no longer rely on timeout

## [0.5.13]
- c082642: fix: depth 2 menu not displaying
- 84b8d74: chore: rename command to "Frosted Glass Theme: xxx"
- c461e1e: build: remove .github folder in final product
- 9679e55: docs: fix: images in README may be misplaced
- 21d0606: fix: misleading text saying its enabled

## [0.5.12]
- 682a9cc: feat: add code action widget
- 24ac65b: chore: change extensionKind; change README.md …

## [0.5.11]
- 452e4ee: fix: incorrect menu scrollbar visibility
- ca1f370: fix: change backdrop filter for better visual

## [0.5.10]
- Add debug-hover-widget
- Change "Update Frosted Glass Theme" to "Apply Frosted Glass Theme Configuration"

## [0.5.9]
- Close message box will no longer trigger window reload

## [0.5.8]
- Since VS Code 1.70.0, the HTML file is in electron-sandbox/workbench/workbench.html

## [0.5.7]
- Set scrollable-element to transparent

## [0.5.6]
- Proxy menu bar children change to avoid menu bar update

## [0.5.5]
- Minor change on sub menu problem

## [0.5.4]
- Add debug tool & slider transparency

## [0.5.3]
- fix vscode 1.58 cors

## [0.5.0]
- fix sub menu display problem after vscode new update

## [0.4.0]
- Add "transition" option