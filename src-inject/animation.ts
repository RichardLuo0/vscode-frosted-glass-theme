import config from "../config/config.json" with { type: "json" };
import { inset, clipPath } from "./utils/clipPathPolyFill";
import { css, isKeyInObject } from "./utils/utils";
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
  menuItem:
    ".monaco-menu-container ul > li.action-item:not(:has(> a.separator))",
  actionMenuItem:
    ".monaco-menu-container ul > li > a.action-menu-item:not(.separator)",
  button: ".monaco-button",
  iconActionLabel:
    ":not(.activitybar, .composite-bar) > .monaco-action-bar .action-label.codicon",
  tab: ".tabs-container > .tab",
  listItem:
    ":not(.settings-tree-container, .notifications-list-container, .profile-tree) > .monaco-list .monaco-list-row",
  statusbarItem:
    ".statusbar-item:not(.has-background-color) > .statusbar-item-label, .statusbar-item.has-background-color",
  activitybarItem: ".activitybar li.action-item:not(:has(> a.separator))",
  compositeBarItem:
    ".pane-composite-part .composite-bar li.action-item:not(:has(> a.separator))",
  commandCenter: ".command-center-center",
  menubarTitle: ".menubar-menu-title",
  settingsTreeItem:
    ".settings-tree-container .monaco-list-rows .settings-row-inner-container",
  paneHeader: ".pane-header",
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

// Menu Animation
if (animation["menu"].includes("fgtDropdown"))
  clipPath(
    css`.monaco-menu-container,
  .context-view`,
    inset(-1, true),
    "10px"
  );

// Dropdown Animation
if (animation["dropdown"].includes("fgtDropdown"))
  clipPath(css`.select-container > .context-view`, inset(0, true), "0px");
