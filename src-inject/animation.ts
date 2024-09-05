import config from "./config.json" with { type: "json" };
import { css, isKeyInObject } from "./utils";
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
    ":not(.settings-tree-container, .notifications-list-container, .profile-tree) > .monaco-list .monaco-list-row",
  statusbarItem:
    ".statusbar-item:not(.has-background-color) > .statusbar-item-label, .statusbar-item.has-background-color",
  activitybarItem:
    ":is(.activitybar, .sidebar.pane-composite-part .composite-bar) li.action-item:not(:has(> a.separator))",
  commandCenter: ".command-center-center",
  titlebarButton: `.titlebar-container .menu-entry`,
  settingsTreeItem:
    ".settings-tree-container .monaco-list-rows .settings-row-inner-container",
};

for (const key in animation) {
  const value = animation[key as keyof typeof animation];
  if (value.length != 0)
    fgtSheet.insertRule(css`
      ${isKeyInObject(key, selectorMap) ? selectorMap[key] : key} {
        animation: ${value};
      }
    `);
}
