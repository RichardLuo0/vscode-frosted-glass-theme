import config from "../config/config.json" with { type: "json" };
import { MountSvgTo } from "./utils/loadSvg";
import { registerColorChangeListener } from "./utils/observeThemeColor";
import { applyOpacity, css, extractOpacity } from "./utils/utils";
import fgtSheet from "./vscode-frosted-glass-theme.css" with { type: "css" };

const { filter } = config;

// [key, colorVar, cssSelector]
type Entry = [string, string | undefined, string];

const menuEntry: Entry = [
  "menu",
  "--vscode-menu-background",
  ".monaco-menu-container .monaco-scrollable-element",
];
const entryList: Entry[] = [
  menuEntry,
  [
    "multiDiffEditorHeader",
    "--vscode-editor-background",
    ".monaco-component.multiDiffEditor .header",
  ],
  [
    "hover",
    "--vscode-editorHoverWidget-background",
    ".debug-hover-widget, .monaco-editor-overlaymessage .message, .monaco-hover",
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
    "notifications",
    "--vscode-notifications-background",
    ".notifications-list-container",
  ],
  [
    "notificationCenterHeader",
    "--vscode-notificationCenterHeader-background",
    ".notifications-center-header",
  ],
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
  ],
  [
    "cellTitleToolbar",
    "--vscode-editorStickyScroll-background",
    ".cell-title-toolbar",
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
  ["modalEditorPart", "--vscode-editor-background", ".modal-editor-part"],
  // For below items, background color is embedded into canvas so can not remove
  ["minimap", undefined, ".minimap"],
  [
    "decorationsOverviewRuler",
    undefined,
    ".monaco-editor .decorationsOverviewRuler",
  ],
  ["terminalOverlay", undefined, ".hover-overlay"],
];

type Filter = {
  filter: string;
  disableBackgroundColor: boolean;
  opacity: number;
  customAttrs?: { [selector: string]: { [key: string]: any } };
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
    return typeof filterPart === "string"
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
    if (key === "default") continue;
    filterMap[key] = generateFilter(
      _filter[key],
      filterMap.default ?? fallbackFilter
    );
  }
}

function getFilter(key: string) {
  return filterMap[key] ?? filterMap.default;
}

export function getFilterWithKey(key: string) {
  const filter = getFilter(key);
  if (!filter) return undefined;
  const filterCopy = { ...filter };
  filterCopy.filter = filterCopy.filter.replaceAll("{key}", key);
  return filterCopy;
}

entryList.forEach(entry => {
  const filter = getFilterWithKey(entry[0]);
  if (filter === undefined) return;
  fgtSheet.insertRule(css`
    ${entry[2]} {
      backdrop-filter: ${filter.filter};
      background-color: ${filter.disableBackgroundColor
        ? "transparent"
        : `var(--fgt-${entry[0]}-background)`} !important;
    }
  `);
});

export async function applyBackdropFilterOnEntry(
  element: Node & ParentNode,
  entry: Entry,
  mountTintSvgTo: MountSvgTo
) {
  const wrapper = document.createElement("div");
  const colorVar = entry[1];
  if (colorVar)
    registerColorChangeListener(foundStyles => {
      const color = foundStyles.readStyle.getPropertyValue(colorVar);
      const filterOpacity = getFilter(entry[0])?.opacity;
      if (filterOpacity !== undefined)
        foundStyles.writeStyle.setProperty(
          `--fgt-${entry[0]}-background`,
          applyOpacity(color, filterOpacity)
        );
      // Bind color to svg
      const [solid, opacity] = extractOpacity(color, filterOpacity);
      wrapper.style.setProperty("--fgt-current-background", solid);
      wrapper.style.setProperty("--fgt-current-opacity", `${opacity * 100}%`);
    });
  await mountTintSvgTo(wrapper, true);

  // Replace id
  wrapper
    .querySelectorAll("filter")
    .forEach(f => (f.id = f.id + "-" + entry[0]));

  // Replace custom attrs
  const filter = getFilter(entry[0]);
  const customAttrs = filter?.customAttrs;
  if (customAttrs) {
    for (const selector in customAttrs) {
      const attrMap = customAttrs[selector];
      wrapper.querySelectorAll(selector).forEach(e => {
        for (const name in attrMap) e.setAttribute(name, attrMap[name]);
      });
    }
  }

  element.appendChild(wrapper);
}

export function applyBackdropFilter(
  element: HTMLElement,
  mountTintSvgTo: MountSvgTo
) {
  const wrapper = document.createElement("div");
  entryList.forEach(entry =>
    applyBackdropFilterOnEntry(wrapper, entry, mountTintSvgTo)
  );
  element.appendChild(wrapper);
}

export function applyBackdropFilterOnShadowDOM(
  element: Node & ParentNode,
  mountTintSvgTo: MountSvgTo
) {
  applyBackdropFilterOnEntry(element, menuEntry, mountTintSvgTo);
}
