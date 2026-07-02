import { commands, window, workspace } from "vscode";
import { isCursor } from "./host";
import { localize } from "./localization";
import { resolveActiveThemeColors } from "./themeColors";

const cursorColorIds = [
  "activityBar.foreground",
  "activityBar.inactiveForeground",
  "activityBar.activeBorder",
  "activityBar.border",
  "commandCenter.foreground",
  "commandCenter.border",
  "commandCenter.activeBorder",
  "editor.lineHighlightBorder",
  "editorGroup.border",
  "menu.selectionForeground",
  "menu.border",
  "sideBar.foreground",
  "sideBar.border",
  "sideBarSectionHeader.foreground",
  "list.focusBackground",
  "statusBar.border",
  "statusBarItem.remoteForeground",
  "tree.tableOddRowsBackground",
];

const cursorOpacityColorIds = [
  "titleBar.activeBackground",
  "titleBar.inactiveBackground",
  "commandCenter.background",
  "commandCenter.activeBackground",
  "menubar.selectionBackground",
  "quickInputList.focusBackground",
  "statusBarItem.hoverBackground",
  "scrollbarSlider.background",
  "scrollbarSlider.hoverBackground",
];

async function getActiveColorTheme() {
  if (isCursor()) {
    const colors = await resolveActiveThemeColors();
    if (!colors) {
      window.showErrorMessage(localize("generateThemeMod.themeNotFound"));
      return;
    }
    return { colors };
  }

  await commands.executeCommand("workbench.action.generateColorTheme");

  const editor = window.activeTextEditor;
  if (!editor) return;

  const themeText = editor.document.getText().replace(/\/\//g, "");

  return JSON.parse(themeText) as {
    colors: Record<string, string | undefined>;
  };
}

async function modifyTheme(colors: Record<string, string | undefined>) {
  const colorIds = [
    "activityBar.background",
    "button.background",
    "dropdown.background",
    "dropdown.border",
    "editor.background",
    "editor.selectionBackground",
    "editor.inactiveSelectionBackground",
    "editor.lineHighlightBackground",
    "editorGroupHeader.tabsBackground",
    "input.background",
    "list.activeSelectionBackground",
    "list.hoverBackground",
    "list.inactiveSelectionBackground",
    "menu.background",
    "panel.background",
    "quickInput.background",
    "sideBar.background",
    "sideBarSectionHeader.background",
    "sideBarStickyScroll.background",
    "statusBar.background",
    "statusBar.noFolderBackground",
    "tab.activeBackground",
    "tab.activeBorder",
    "welcomePage.tileBackground",
    "welcomePage.tileHoverBackground",
    "peekViewTitle.background",
    "peekViewResult.background",
    // They are for canvas background color
    "editorOverviewRuler.background",
    "minimap.background",
  ];

  const transparentColorIds = [
    "breadcrumb.background",
    "editorGutter.background",
    "editorPane.background",
    "editorStickyScroll.background",
    "editorStickyScroll.border",
    "multiDiffEditor.background",
    "multiDiffEditor.headerBackground",
    "notebook.cellEditorBackground",
    "settings.focusedRowBackground",
    "sideBarTitle.background",
    "tab.border",
    "tab.inactiveBackground",
    "terminal.background",
    "terminalStickyScroll.background",
    "terminalStickyScroll.border",
    "list.hoverBackground",
  ];

  const fixedLowAlphaColors: Record<string, string> = {
    "editorStickyScrollHover.background": "#0000002c",
    "terminalStickyScrollHover.background": "#0000002c",
    "statusBarItem.remoteHoverBackground": "#5c5c5c00",
  };

  const opacity = parseFloat(
    (await window.showInputBox({
      title: localize("generateThemeMod.opacity"),
      value: "0.6",
    })) ?? "1"
  );
  const alpha = Math.round(opacity * 255).toString(16);

  const colorIdList = isCursor()
    ? [...colorIds, ...cursorOpacityColorIds, ...cursorColorIds]
    : colorIds;

  const newColors: Record<string, string> = {};
  for (const id of colorIdList) {
    const color = colors[id];
    if (!color) continue;
    newColors[id] = color.length === 7 ? color + alpha : color;
  }
  for (const id of transparentColorIds) newColors[id] = "#00000000";
  Object.assign(newColors, fixedLowAlphaColors);

  return newColors;
}

export async function generateThemeMod() {
  const theme = await getActiveColorTheme();
  if (!theme) return;

  const colors = await modifyTheme(theme.colors);

  if (isCursor()) {
    const doc = await workspace.openTextDocument({
      content: JSON.stringify(
        { "workbench.colorCustomizations": colors },
        null,
        2
      ),
      language: "json",
    });
    await window.showTextDocument(doc);
    return;
  }

  workspace
    .openTextDocument({
      content: JSON.stringify(colors, null, 2),
      language: "json",
    })
    .then(window.showTextDocument);
}
