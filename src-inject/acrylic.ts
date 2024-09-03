import config from "./config.json" with { type: "json" };
import { loadSvgs } from "./loadSvg";
import { registerColorVar } from "./observeThemeColor";
import fgtSheet from "./vscode-frosted-glass-theme.css" with { type: "css" };

const { filter, tintSvg } = config;

const mountSvgTo = loadSvgs(tintSvg);

// the item type is of [key, colorVar, cssSelector, newColorVar?]
const colorVarList: [string, string, string, string?][] = [
  [
    "multiDiffEditorHeader",
    "--vscode-editor-background",
    ".monaco-component.multiDiffEditor .header",
    "--fgt-multiDiffEditorHeader-background",
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
    "--vscode-sideBarStickyScroll-background",
    ".monaco-tree-sticky-container",
    "--fgt-treeStickyContainer-background",
  ],
  [
    "cellTitleToolbar",
    "--vscode-editorStickyScroll-background",
    ".cell-title-toolbar",
    "--fgt-cellTitleToolbar-background",
  ],
  [
    "slider",
    "--vscode-scrollbarSlider-background",
    ".editor-scrollable > .scrollbar.horizontal > .slider, .monaco-scrollable-element:not(.editor-scrollable) > .scrollbar > .slider",
  ],
  [
    "sideBarSectionHeader",
    "--vscode-sideBarSectionHeader-background",
    ".pane-header.expanded",
  ],
  [
    "dropdown",
    "--vscode-dropdown-background",
    ".select-box-dropdown-list-container, .select-box-details-pane",
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

fgtSheet.insertRule(
  `[role="application"] {
    --fgt-transparent: transparent;
  }`
);

type Filter = {
  filter: string;
  disableBackgroundColor: boolean;
  opacity: number;
};
type FilterOp = Partial<Filter>;
let filterMap: {
  default: Filter;
  [key: string]: Filter | undefined;
} = {
  default: {
    filter: "",
    disableBackgroundColor: false,
    opacity: 1,
  },
};
{
  const _filter = filter as {
    [key: string]: string | FilterOp | undefined;
  };
  const _defaultFilter: FilterOp =
    typeof _filter.default == "string"
      ? {
          filter: _filter.default,
        }
      : (_filter.default ?? {});
  const defaultFilter = Object.assign(filterMap.default, _defaultFilter);
  for (const key in _filter) {
    if (key == "default") continue;
    if (typeof _filter[key] == "string") {
      filterMap[key] = {
        ...defaultFilter,
        filter: _filter[key],
      };
    } else filterMap[key] = { ...defaultFilter, ..._filter[key] };
  }
}

colorVarList.forEach(entry => {
  const filter = filterMap[entry[0]] ?? filterMap.default;
  registerColorVar(entry[1], filter.opacity, entry[3]);
  const filterStr = filter.filter.replaceAll("{key}", entry[0]);
  fgtSheet.insertRule(
    `${entry[2]} {
      backdrop-filter: ${filterStr};
      background: ${filter.disableBackgroundColor ? "transparent" : `var(${entry[1]})`} !important;
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
      .forEach(f => (f.id = f.id + "-" + entry[0]));
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
  wrapper.querySelectorAll("filter").forEach(f => (f.id = f.id + "-menu"));
  element.appendChild(wrapper);
}
