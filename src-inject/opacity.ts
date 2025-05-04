import config from "./config.json" with { type: "json" };
import { registerColorChangeListener } from "./observeThemeColor";
import { applyOpacity, css } from "./utils";
import fgtSheet from "./vscode-frosted-glass-theme.css" with { type: "css" };

const { opacity } = config;

fgtSheet.insertRule(css`
  [role="application"] {
    --fgt-minimap-opacity: ${opacity.minimap * 100}%;
  }
`);

const entryList: [string, number][] = [
  ["--vscode-menu-selectionBackground", opacity.selection],
  ["--vscode-quickInputList-focusBackground", opacity.selection],
  ["--vscode-editorSuggestWidget-selectedBackground", opacity.selection],
  ["--vscode-menu-border", opacity.border],
  ["--vscode-widget-border", opacity.border],
  ["--vscode-editorWidget-border", opacity.border],
  ["--vscode-editorHoverWidget-border", opacity.border],
  ["--vscode-editorSuggestWidget-border", opacity.border],
  ["--vscode-menu-separatorBackground", opacity.separator],
];

entryList.forEach(entry =>
  registerColorChangeListener(entry[0], (color, style) =>
    style.setProperty(entry[0], applyOpacity(color, entry[1]))
  )
);
