import config from "./config.json" with { type: "json" };
import fgtSheet from "./vscode-frosted-glass-theme.css" with { type: "css" };

const { animation } = config;

const animSelectorMap = {
  menu: ".monaco-menu-container .monaco-scrollable-element, .action-widget, .monaco-breadcrumbs-picker, .quick-input-widget",
  dialog: ".dialog-shadow",
  dropdown: ".monaco-select-box-dropdown-container",
  hover: ".monaco-hover",
};

for (const key in animation) {
  const _key = key as keyof typeof animation;
  const value = animation[_key];
  if (value.length != 0) {
    fgtSheet.insertRule(
      `${animSelectorMap[_key]} {
        animation: ${value};
      }`
    );
  }
}
