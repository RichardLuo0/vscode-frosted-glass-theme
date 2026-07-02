import {
  applyBackdropFilter,
  applyBackdropFilterOnShadowDOM,
} from "./backdropFilter";
import config from "../config/config.json" with { type: "json" };
import { applyEffect } from "./effect/effect";
import { applyFakeMica } from "./fakeMica";
import { fixContextMenu, fixMenu, fixMenuBar } from "./fixMenu";
import { loadSvgs } from "./utils/loadSvg";
import { observeThemeColorChange } from "./utils/observeThemeColor";
import { proxy, useRet } from "../common/proxy";
import { css, makeAbsolutePath } from "./utils/utils";
import fgtSheet from "./vscode-frosted-glass-theme.css" with { type: "css" };

import "./opacity";
import "./animation";
import "./borderRadius";
import "./miscellaneous";
import {
  applyChatRightClickMenuBlur,
  applySlashMenuBlur,
  hideCorruptNotifications,
  startModelPickerBlur,
} from "./cursor-targeted-overrides";
import { useHTMLElement } from "./utils/proxy";

/** Fixed quit-dialog look — not in frosted-glass-theme.cursor.targetted.overrides settings. */
const QUIT_CONFIRMATION_LOOK = {
  "fgt-cursor-quit-confirmation-blur": "8px",
  "fgt-cursor-quit-confirmation-overlay-dim": "0.35",
} as const;

fgtSheet.insertRule(css`
  [role="application"] {
    --fgt-transition: ${config.transition};
  }
`);

function readNotificationsBlurPx(): string {
  const filters = config.filter as Record<
    string,
    { acrylicBlur?: number } | undefined
  >;
  const px =
    filters.notificationToast?.acrylicBlur ??
    filters.notifications?.acrylicBlur ??
    4;
  return `${px}px`;
}

for (const style of config.additionalStyle as string[]) {
  const styleElement = document.createElement("link");
  styleElement.setAttribute("rel", "stylesheet");
  styleElement.setAttribute("type", "text/css");
  styleElement.setAttribute("href", makeAbsolutePath(style));
  document.head.append(styleElement);
}

function insertVariables(cssSelector: string, variables: object) {
  fgtSheet.insertRule(css`
    ${cssSelector} {
      ${Object.entries(variables).reduce((total, pair) => {
        const [key, value] = pair;
        return total + `--${key}: ${value};`;
      }, "")}
    }
  `);
}

insertVariables('[role="application"]', config.variable);
insertVariables(
  '[role="application"].vs-dark, [role="application"].hc-black',
  config.variableDark
);

document.adoptedStyleSheets.push(fgtSheet);

type CursorPanelConfig = {
  chatPaneBackground?: string;
  agentSidebarBackground?: string;
  sidebarIconBarBackground?: string;
  sentMessageBubbleBackground?: string;
  sentMessageBubbleBlur?: string;
  slashMenuBlur?: string;
  mentionMenuBlur?: string;
  modePickerMenuBlur?: string;
  composerModeMenuBlur?: string;
  modelPickerMenuBlur?: string;
  chatRightClickMenuBlur?: string;
  chatContextMenuBlur?: string;
};

const cursorPanels = (config as { cursor?: CursorPanelConfig }).cursor;
const runtime = (config as { runtime?: { host?: string } }).runtime;
if (runtime?.host === "cursor") {
  insertVariables('[role="application"]', {
    "fgt-notifications-blur": readNotificationsBlurPx(),
  });
}
if (runtime?.host === "cursor" && cursorPanels) {
  const cursorVariables = {
    "fgt-cursor-chat-pane-background":
      cursorPanels.chatPaneBackground ?? "#11111133",
    "fgt-cursor-agent-sidebar-background":
      cursorPanels.agentSidebarBackground ?? "#1f1f1f0D",
    "fgt-cursor-sidebar-iconbar-background":
      cursorPanels.sidebarIconBarBackground ?? "#1f1f1f4d",
    "fgt-cursor-sent-message-bubble-background":
      cursorPanels.sentMessageBubbleBackground ?? "#00000000",
    "fgt-cursor-sent-message-bubble-blur":
      cursorPanels.sentMessageBubbleBlur ?? "8px",
    "fgt-cursor-slash-menu-blur": cursorPanels.slashMenuBlur ?? "8px",
    "fgt-cursor-mention-menu-blur": cursorPanels.mentionMenuBlur ?? "8px",
    "fgt-cursor-mode-picker-menu-blur":
      cursorPanels.modePickerMenuBlur ??
      cursorPanels.composerModeMenuBlur ??
      "6px",
    "fgt-cursor-model-picker-menu-blur":
      cursorPanels.modelPickerMenuBlur ?? "6px",
    ...QUIT_CONFIRMATION_LOOK,
    "fgt-cursor-chat-rightclick-menu-blur":
      cursorPanels.chatRightClickMenuBlur ??
      cursorPanels.chatContextMenuBlur ??
      "4px",
  };
  // Portaled chat menus render outside [role="application"]; :root keeps vars visible.
  insertVariables(":root", cursorVariables);
  insertVariables('[role="application"]', cursorVariables);
  try {
    hideCorruptNotifications();
  } catch (e) {
    console.error("Frosted Glass Theme: hide corrupt notification failed", e);
  }
  try {
    applySlashMenuBlur();
  } catch (e) {
    console.error("Frosted Glass Theme: slash menu blur CSS failed", e);
  }
  try {
    applyChatRightClickMenuBlur();
  } catch (e) {
    console.error("Frosted Glass Theme: chat right-click menu blur failed", e);
  }
}

if (runtime?.host === "cursor") {
  try {
    startModelPickerBlur();
  } catch (e) {
    console.error("Frosted Glass Theme: model picker blur failed", e);
  }
  try {
    applyEffect(document.body);
  } catch (e) {
    console.error("Frosted Glass Theme: body reveal effects failed", e);
  }
}

const mountSvgTo = loadSvgs(config.svg);
const mountTintSvgTo = loadSvgs(config.tintSvg);

proxy(
  document.body,
  "appendChild",
  useHTMLElement("monaco-workbench", monacoWorkbench => {
    const svgMounted = mountSvgTo(monacoWorkbench);
    applyFakeMica(monacoWorkbench, svgMounted);
    applyBackdropFilter(monacoWorkbench, mountTintSvgTo);
    applyEffect(monacoWorkbench);
    observeThemeColorChange(monacoWorkbench);
    proxy(
      monacoWorkbench,
      "prepend",
      useHTMLElement("monaco-grid-view", fixMenuBar)
    );
    proxy(
      monacoWorkbench,
      "appendChild",
      useHTMLElement("context-view", fixContextMenu)
    );
  })
);

// Fix menu which is wrapped into shadow dom
proxy(
  Element.prototype,
  "attachShadow",
  useRet(shadowDom => {
    shadowDom.adoptedStyleSheets.push(
      ...shadowDom.ownerDocument.adoptedStyleSheets
    );
    applyBackdropFilterOnShadowDOM(shadowDom, mountTintSvgTo);
    applyEffect(shadowDom);
    proxy(
      shadowDom,
      "appendChild",
      useHTMLElement("monaco-menu-container", fixMenu)
    );
    return shadowDom;
  })
);

// Fix floating window
proxy(
  window,
  "open",
  useRet(ownWindow => {
    if (!ownWindow) return ownWindow;
    const global = ownWindow as Window & typeof globalThis;
    const newDocument = ownWindow.document;
    const sheet = new global.CSSStyleSheet();
    for (let i = 0; i < fgtSheet.cssRules.length; i++) {
      sheet.insertRule(fgtSheet.cssRules[i].cssText);
    }
    newDocument.adoptedStyleSheets.push(sheet);
    proxy(
      newDocument.body,
      "append",
      useHTMLElement(null, monacoWorkbench => {
        const svgMounted = mountSvgTo(monacoWorkbench, true);
        applyFakeMica(monacoWorkbench, svgMounted);
        applyBackdropFilter(monacoWorkbench, mountTintSvgTo);
        applyEffect(monacoWorkbench);
        observeThemeColorChange(monacoWorkbench);
      })
    );
    return ownWindow;
  })
);
