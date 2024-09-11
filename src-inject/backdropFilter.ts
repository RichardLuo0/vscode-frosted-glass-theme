import config from "./config.json" with { type: "json" };
import { loadSvgs } from "./loadSvg";
import { registerColorVar } from "./observeThemeColor";
import { css } from "./utils";
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

fgtSheet.insertRule(css`
  [role="application"] {
    --fgt-transparent: transparent;
  }
`);

type Filter = {
  filter: string;
  disableBackgroundColor: boolean;
  opacity: number;
};
type FilterPart = Partial<Filter>;

const filterMap: {
  [key: string]: Filter | undefined;
} = {};
{
  const fallbackFilter: Filter = {
    filter: "",
    disableBackgroundColor: false,
    opacity: 1,
  };

  function generateFilter(
    filterPart?: string | FilterPart,
    defaultFallbackFilter = fallbackFilter
  ): Filter | undefined {
    if (filterPart === undefined) return undefined;
    return typeof filterPart == "string"
      ? {
          ...defaultFallbackFilter,
          filter: filterPart,
        }
      : {
          ...defaultFallbackFilter,
          ...filterPart,
        };
  }

  const _filter = filter as {
    [key: string]: string | FilterPart | undefined;
  };
  filterMap.default = generateFilter(_filter.default);
  for (const key in _filter) {
    if (key == "default") continue;
    filterMap[key] = generateFilter(
      _filter[key],
      filterMap.default ?? fallbackFilter
    );
  }
}

colorVarList.forEach(entry => {
  const filter = filterMap[entry[0]] ?? filterMap.default;
  if (filter === undefined) return;
  registerColorVar(entry[1], filter.opacity, entry[3]);
  const filterStr = filter.filter.replaceAll("{key}", entry[0]);
  fgtSheet.insertRule(css`
    ${entry[2]} {
      backdrop-filter: ${filterStr};
      background-color: ${filter.disableBackgroundColor
        ? "transparent"
        : `var(${entry[1]})`} !important;
    }
  `);
});

export async function applyBackdropFilter(element: HTMLElement) {
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

export function applyBackdropFilterOnMenu(element: Node & ParentNode) {
  const wrapper = document.createElement("div");
  wrapper.style.setProperty(
    "--fgt-current-background",
    "var(--vscode-menu-background)"
  );
  mountSvgTo(wrapper, true);
  wrapper.querySelectorAll("filter").forEach(f => (f.id = f.id + "-menu"));
  element.appendChild(wrapper);
}
