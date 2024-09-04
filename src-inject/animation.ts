import config from "./config.json" with { type: "json" };
import { isKeyInObject } from "./utils";
import fgtSheet from "./vscode-frosted-glass-theme.css" with { type: "css" };

const { animation } = config;

const selectorMap = {
  menu: ".monaco-menu-container .monaco-scrollable-element, .action-widget, .monaco-breadcrumbs-picker, .quick-input-widget",
  dialog: ".dialog-shadow",
  dropdown: ".monaco-select-box-dropdown-container",
  hover: ".monaco-hover",
  notificationCenter: ".notifications-center, .notification-toast",
  notificationCenterHeader: ".notifications-center-header",
  notification: ".notifications-list-container .monaco-list-row",
  menuItem: ".monaco-menu-container li.action-item:not(:has(> a.separator))",
  button: ".monaco-button",
  tab: ".tabs-container > .tab",
  listItem:
    ":not(.settings-tree-container, .notifications-list-container) > .monaco-list .monaco-list-row",
  statusbarItem: ".statusbar-item-label",
  activitybarItem:
    ":is(.activitybar, .sidebar.pane-composite-part .composite-bar) li.action-item:not(:has(> a.separator))",
  commandCenter: ".command-center-center",
  titlebarButton: `.titlebar-container .menu-entry`,
  settingsTreeItem: ".settings-tree-container .settings-row-inner-container",
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
