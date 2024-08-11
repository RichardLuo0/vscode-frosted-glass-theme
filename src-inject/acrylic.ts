import config from "./config.json" with { type: "json" };
import { loadSvgs } from "./loadSvg";
import fgtSheet from "./vscode-frosted-glass-theme.css" with { type: "css" };

const { filter, tintSvg, disableBackgroundColor } = config;

const mountSvgTo = loadSvgs(tintSvg);

const colorVarList: [string, string, string][] = [
  [
    "editor",
    "--vscode-editor-background",
    ".monaco-component.multiDiffEditor .header",
  ],
  [
    "editorHoverWidget",
    "--vscode-editorHoverWidget-background",
    ".debug-hover-widget, .monaco-editor-overlaymessage .message",
  ],
  [
    "editorSuggestWidget",
    "--vscode-editorSuggestWidget-background",
    ".monaco-editor .suggest-details",
  ],
  [
    "peekViewResult",
    "--vscode-peekViewResult-background",
    ".monaco-tree-type-filter",
  ],
  ["quickInput", "--vscode-quickInput-background", ".quick-input-widget"],
  [
    "menu",
    "--vscode-menu-background",
    ".monaco-menu-container .monaco-scrollable-element",
  ],
  [
    "notifications",
    "--vscode-notifications-background",
    ".notifications-list-container",
  ],
  [
    "notificationCenterHeader",
    "--vscode-notificationCenterHeader-background",
    ".notifications-center-header",
  ],
  ["hover", "--vscode-editorHoverWidget-statusBarBackground", ".monaco-hover"],
  [
    "editorStickyScroll",
    "--vscode-editorStickyScroll-background",
    ".sticky-widget",
  ],
  [
    "listFilterWidget",
    "--vscode-listFilterWidget-background",
    ".editor-widget.find-widget",
  ],
  [
    "editorWidget",
    "--vscode-editorWidget-background",
    ".editor-widget, .simple-find-part, .monaco-dialog-box, .action-widget, .rename-box, .defineKeybindingWidget",
  ],
  [
    "breadcrumbPicker",
    "--vscode-breadcrumbPicker-background",
    ".monaco-breadcrumbs-picker > :not(.arrow)",
  ],
  ["debugToolBar", "--vscode-debugToolBar-background", ".debug-toolbar"],
  [
    "treeStickyContainer",
    "--fgt-treeStickyContainer-background",
    ".monaco-tree-sticky-container",
  ],
  [
    "cellTitleToolbar",
    "--fgt-cellTitleToolbar-background",
    ".cell-title-toolbar",
  ],
  ["slider", "--vscode-scrollbarSlider-background", ".slider"],
  [
    "sideBarSectionHeader",
    "--vscode-sideBarSectionHeader-background",
    ".pane-header.expanded",
  ],
  // Background color is embedded into canvas so can not remove
  ["minimap", "--fgt-transparent", ".minimap"],
  [
    "decorationsOverviewRuler",
    "--fgt-transparent",
    ".monaco-editor .decorationsOverviewRuler",
  ],
  ["terminalOverlay", "--fgt-transparent", ".hover-overlay"],
];

fgtSheet.insertRule(`[role="application"] {
    --fgt-transparent: transparent;
  }`);

colorVarList.forEach((entry) => {
  const _filter = filter as { [key: string]: string | undefined };
  const filterStr = (_filter[entry[0]] ?? filter.default).replaceAll(
    "{key}",
    entry[0]
  );
  fgtSheet.insertRule(
    `${entry[2]} {
      backdrop-filter: ${filterStr} !important;
      background: ${disableBackgroundColor ? "transparent" : `var(${entry[1]})`} !important;
    }`
  );
});

export async function applyAcrylic(element: HTMLElement) {
  for (const entry of colorVarList) {
    const wrapper = document.createElement("div");
    wrapper.style.setProperty("--fgt-current-background", `var(${entry[1]})`);
    await mountSvgTo(wrapper, true);
    wrapper
      .querySelectorAll("filter")
      .forEach((f) => (f.id = f.id + "-" + entry[0]));
    element.appendChild(wrapper);
  }
}

export function applyAcrylicOnMenu(element: Node & ParentNode) {
  const wrapper = document.createElement("div");
  wrapper.style.setProperty(
    "--fgt-current-background",
    "var(--vscode-menu-background)"
  );
  mountSvgTo(wrapper, true);
  wrapper.querySelectorAll("filter").forEach((f) => (f.id = f.id + "-menu"));
  element.appendChild(wrapper);
}
