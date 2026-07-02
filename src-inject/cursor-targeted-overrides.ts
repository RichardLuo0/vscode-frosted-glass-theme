import { css } from "./utils/utils";
import fgtSheet from "./vscode-frosted-glass-theme.css" with { type: "css" };

const COMPOSER_UI_MENU_ROW_HOVER = css`
  .ui-menu.ui-slash-menu__content[role="menu"] .ui-menu__row[data-focused="true"],
  [data-testid="model-picker-menu"] .ui-menu__row[data-focused="true"],
  [data-testid="model-picker-menu"] .ui-menu__toggle-row[data-focused="true"] {
    background-color: var(--vscode-list-hoverBackground) !important;
  }
`;

const COMPOSER_UNIFIED_MENU_ROW_HOVER = css`
  div[tabindex="0"]:has(.composer-unified-context-menu-item)
    .composer-unified-context-menu-item[data-is-selected="true"],
  .typeahead-popover.mentions-menu
    .composer-unified-context-menu-item[data-is-selected="true"] {
    background-color: var(--vscode-list-hoverBackground) !important;
  }
`;

const COMPOSER_MENU_REVEAL_ROWS = css`
  .ui-menu.ui-slash-menu__content[role="menu"] .ui-menu__row[data-focused="true"],
  [data-testid="model-picker-menu"] .ui-menu__row[data-focused="true"],
  [data-testid="model-picker-menu"] .ui-menu__toggle-row[data-focused="true"],
  div[tabindex="0"]:has(.composer-unified-context-menu-item)
    .composer-unified-context-menu-item[data-is-selected="true"],
  .typeahead-popover.mentions-menu
    .composer-unified-context-menu-item[data-is-selected="true"]
`;

/** Slash menu + flyout (portaled; link CSS may load late). */
export function applySlashMenuBlur() {
  fgtSheet.insertRule(css`
    .ui-menu.ui-slash-menu__content[role="menu"],
    .ui-menu__tooltip[role="tooltip"] {
      backdrop-filter: blur(var(--fgt-cursor-slash-menu-blur, 12px));
      -webkit-backdrop-filter: blur(var(--fgt-cursor-slash-menu-blur, 12px));
    }
  `);
  fgtSheet.insertRule(COMPOSER_UI_MENU_ROW_HOVER);
  fgtSheet.insertRule(COMPOSER_UNIFIED_MENU_ROW_HOVER);
  fgtSheet.insertRule(css`
    ${COMPOSER_MENU_REVEAL_ROWS} {
      animation: fgt-revealEffect, fgt-flipEffect;
    }
  `);
}

/** Unique first-pass menu item labels per agent-chat right-click variant (dev-tools). */
const CHAT_RC_MENU_ITEM_LABELS = [
  "Copy Message", // message bubble RC
  "Search with Google", // highlighted text in agent message RC
  "Add to Chat", // file mention in agent message RC
] as const;

function chatRcMenuHasSelector(label: string) {
  return `.context-view.monaco-menu-container:has(.action-label[aria-label="${label}"])`;
}

/** Padding/gap below agent message text — Copy + Select All, not Copy Message. */
const CHAT_RC_MESSAGE_GAP_SELECTOR = css`
  .context-view.monaco-menu-container:has(
      .action-label[aria-label="Copy"]
    ):has(.action-label[aria-label="Select All"]):not(
      :has(.action-label[aria-label="Cut"])
    ):not(:has(.action-label[aria-label="Copy Message"])):not(
      :has(.action-label[aria-label="Search with Google"])
    ):not(:has(.action-label[aria-label="Add to Chat"]))
`;

const CHAT_RIGHTCLICK_MENU_SELECTOR = [
  ...CHAT_RC_MENU_ITEM_LABELS.map(chatRcMenuHasSelector),
  CHAT_RC_MESSAGE_GAP_SELECTOR,
].join(",\n");

/**
 * Portaled chat right-click blur — rules in adoptedStyleSheet (like slash menu).
 * Link CSS alone is not reliable for body-portaled context-view menus.
 */
export function applyChatRightClickMenuBlur() {
  fgtSheet.insertRule(css`
    ${CHAT_RIGHTCLICK_MENU_SELECTOR} {
      contain: none !important;
      isolation: auto !important;
    }
  `);
  fgtSheet.insertRule(css`
    ${CHAT_RIGHTCLICK_MENU_SELECTOR} .monaco-action-bar,
    ${CHAT_RIGHTCLICK_MENU_SELECTOR} .monaco-menu > div {
      contain: none !important;
      isolation: auto !important;
      backdrop-filter: blur(
        var(--fgt-cursor-chat-rightclick-menu-blur, 12px)
      ) !important;
      -webkit-backdrop-filter: blur(
        var(--fgt-cursor-chat-rightclick-menu-blur, 12px)
      ) !important;
      background-color: var(--vscode-menu-background) !important;
    }
  `);
  fgtSheet.insertRule(css`
    ${CHAT_RIGHTCLICK_MENU_SELECTOR} .monaco-scrollable-element {
      backdrop-filter: none !important;
      -webkit-backdrop-filter: none !important;
      background-color: transparent !important;
    }
  `);
}

function readCssVar(name: string, fallback: string): string {
  const v = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  return v || fallback;
}

/** Model picker — inline re-apply when Cursor strips backdrop-filter. */
const watched = new WeakSet<HTMLElement>();
let pollId: ReturnType<typeof setInterval> | undefined;

function applyToModelPickerMenu(menu: HTMLElement) {
  const blur = readCssVar("--fgt-cursor-model-picker-menu-blur", "12px");
  const bg = readCssVar(
    "--vscode-dropdown-background",
    "var(--vscode-dropdown-background)"
  );

  menu.style.setProperty("contain", "none", "important");
  menu.style.setProperty("isolation", "auto", "important");
  menu.style.setProperty("backdrop-filter", `blur(${blur})`, "important");
  menu.style.setProperty("-webkit-backdrop-filter", `blur(${blur})`, "important");
  menu.style.setProperty("background-color", bg, "important");

  menu.querySelectorAll(".ui-scroll-area__content").forEach(node => {
    if (!(node instanceof HTMLElement)) return;
    node.style.removeProperty("backdrop-filter");
    node.style.removeProperty("-webkit-backdrop-filter");
    node.style.setProperty("background-color", "transparent", "important");
  });

  if (!watched.has(menu)) {
    watched.add(menu);
    new MutationObserver(() => applyToModelPickerMenu(menu)).observe(menu, {
      attributes: true,
      attributeFilter: ["style", "class"],
    });
  }
}

function scanModelPicker(root: ParentNode) {
  root.querySelectorAll('[data-testid="model-picker-menu"]').forEach(node => {
    if (node instanceof HTMLElement) applyToModelPickerMenu(node);
  });
}

function scanAllModelPickerRoots() {
  scanModelPicker(document);
  document.querySelectorAll("*").forEach(el => {
    if (el.shadowRoot) scanModelPicker(el.shadowRoot);
  });

  const open = document.querySelector('[data-testid="model-picker-menu"]');
  if (open && pollId === undefined) {
    pollId = setInterval(scanAllModelPickerRoots, 150);
  } else if (!open && pollId !== undefined) {
    clearInterval(pollId);
    pollId = undefined;
  }
}

export function startModelPickerBlur() {
  scanAllModelPickerRoots();
  new MutationObserver(scanAllModelPickerRoots).observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
}

/** Hide Cursor "installation appears to be corrupt" toast (DOM removal; CSS alone is not enough). */
const CORRUPT_NEEDLE = "appears to be corrupt";

function mentionsCorrupt(el: Element): boolean {
  const label = el.getAttribute("aria-label") ?? "";
  if (label.includes(CORRUPT_NEEDLE)) return true;
  const message = el.querySelector(
    ".notification-list-item-message span"
  )?.textContent;
  if (message?.includes(CORRUPT_NEEDLE)) return true;
  return (el.textContent ?? "").includes(CORRUPT_NEEDLE);
}

function isCorruptToastContainer(container: Element): boolean {
  if (mentionsCorrupt(container)) return true;

  const list = container.querySelector(".monaco-list");
  if (list && mentionsCorrupt(list)) return true;

  const rows = container.querySelectorAll(".monaco-list-row");
  if (!rows.length) return false;

  return [...rows].every(row => mentionsCorrupt(row));
}

function hasOtherNotifications(container: Element): boolean {
  for (const row of container.querySelectorAll(".monaco-list-row")) {
    if (!mentionsCorrupt(row)) {
      const message = row
        .querySelector(".notification-list-item-message span")
        ?.textContent?.trim();
      if (message) return true;
    }
  }
  return false;
}

function removeCorruptToasts(root: ParentNode = document): void {
  for (const container of root.querySelectorAll(
    ".notifications-toasts .notification-toast-container, .notification-toast-container"
  )) {
    if (!isCorruptToastContainer(container)) continue;
    if (hasOtherNotifications(container)) continue;
    container.remove();
  }
}

let sweepScheduled = false;

function scheduleCorruptSweep(): void {
  if (sweepScheduled) return;
  sweepScheduled = true;
  requestAnimationFrame(() => {
    sweepScheduled = false;
    removeCorruptToasts();
  });
}

export function hideCorruptNotifications(): void {
  removeCorruptToasts();

  new MutationObserver(scheduleCorruptSweep).observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["aria-label", "class", "style"],
  });

  for (const ms of [0, 50, 200, 500, 1000, 2000, 5000, 10000]) {
    setTimeout(removeCorruptToasts, ms);
  }
}
