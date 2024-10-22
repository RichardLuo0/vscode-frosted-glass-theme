import { css, getChromeMainVersion } from "./utils";
import fgtSheet from "./vscode-frosted-glass-theme.css" with { type: "css" };

function polyfillClipPath(
  selector: string,
  clipPath: string,
  overflowClipMargin: string
) {
  if (getChromeMainVersion() >= 128)
    fgtSheet.insertRule(css`
      ${selector} {
        clip-path: ${clipPath};
      }
    `);
  else
    fgtSheet.insertRule(css`
      ${selector} {
        overflow: clip !important;
        overflow-clip-margin: ${overflowClipMargin} !important;
      }
    `);
}

function inset(top: number, unbound: boolean = false) {
  return `inset(${top}px ${unbound ? "calc(-infinity * 1px) calc(-infinity * 1px))" : ""}`;
}

// Menu Animation
polyfillClipPath(
  css`.monaco-menu-container,
  .context-view`,
  inset(-1, true),
  "10px"
);

// Dropdown Animation
polyfillClipPath(css`.select-container > .context-view`, inset(0, true), "0px");

// Panel Header
polyfillClipPath(
  css`.pane-body,
  .pane-body .monaco-list > .monaco-scrollable-element`,
  inset(-22),
  "22px"
);
