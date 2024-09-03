import config from "./config.json" with { type: "json" };
import { isKeyInObject } from "./utils";
import fgtSheet from "./vscode-frosted-glass-theme.css" with { type: "css" };

const { animation } = config;

const selectorMap = {
  menu: ".monaco-menu-container .monaco-scrollable-element, .action-widget, .monaco-breadcrumbs-picker, .quick-input-widget",
  dialog: ".dialog-shadow",
  dropdown: ".monaco-select-box-dropdown-container",
  hover: ".monaco-hover",
  notificationCenter: ".notifications-center",
};

for (const key in animation) {
  const value = animation[key as keyof typeof animation];
  if (value.length != 0)
    if (isKeyInObject(key, selectorMap))
      fgtSheet.insertRule(
        `${selectorMap[key]} {
          animation: ${value};
        }`
      );
    else
      fgtSheet.insertRule(
        `${key} {
          animation: ${value};
        }`
      );
}
