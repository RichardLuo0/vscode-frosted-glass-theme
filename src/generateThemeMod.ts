import { commands, window, workspace } from "vscode";
import { localize } from "./localization";

async function getActiveColorTheme() {
  await commands.executeCommand("workbench.action.generateColorTheme");

  const editor = window.activeTextEditor;
  if (!editor) return;

  // Uncomment lines that are commented so that if we are missing values, we will get the
  // defaults instead
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
    "editor.lineHighlightBackground",
    "editorGroupHeader.tabsBackground",
    "input.background",
    "list.activeSelectionBackground",
    "list.hoverBackground",
    "list.inactiveSelectionBackground",
    "menu.background",
    "panel.background",
    "sideBar.background",
    "sideBarSectionHeader.background",
    "sideBarStickyScroll.background",
    "statusBar.background",
    "statusBar.noFolderBackground",
    "tab.activeBackground",
    "tab.activeBorder",
    "welcomePage.tileBackground",
    "welcomePage.tileHoverBackground",
  ];

  const transparentColorIds = [
    "breadcrumb.background",
    "editorGutter.background",
    "editorPane.background",
    "multiDiffEditor.headerBackground",
    "notebook.cellEditorBackground",
    "settings.focusedRowBackground",
    "sideBarTitle.background",
    "tab.border",
    "tab.inactiveBackground",
    "terminal.background",
  ];

  const opacity = parseFloat(
    (await window.showInputBox({
      title: localize("generateThemeMod.opacity"),
      value: "0.6",
    })) ?? "1"
  );
  const alpha = Math.round(opacity * 255).toString(16);

  const newColors: Record<string, string> = {};
  for (const colorId of colorIds) {
    const color = colors[colorId] ?? "#ffffffff";
    newColors[colorId] = color.length === 7 ? color + alpha : color;
  }
  for (const colorId of transparentColorIds) {
    newColors[colorId] = "#00000000";
  }
  return newColors;
}

export async function generateThemeMod() {
  const theme = await getActiveColorTheme();
  if (!theme) return;

  workspace
    .openTextDocument({
      content: JSON.stringify(await modifyTheme(theme.colors), null, 2),
      language: "json",
    })
    .then(window.showTextDocument);
}
