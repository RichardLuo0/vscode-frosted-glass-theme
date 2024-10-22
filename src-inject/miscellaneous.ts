import config from "./config.json" with { type: "json" };
import { css } from "./utils";
import fgtSheet from "./vscode-frosted-glass-theme.css" with { type: "css" };

const { miscellaneous } = config;

if (miscellaneous.progressBarBehindSectionHeader) {
  fgtSheet.insertRule(css`
    .pane > .monaco-progress-container {
      height: 22px !important;
      top: 0px !important;
    }
  `);
  // `left: 1px` because of a weird flash
  fgtSheet.insertRule(css`
    .pane > .monaco-progress-container > .progress-bit {
      height: 22px !important;
      left: 1px !important;
    }
  `);
} else {
  fgtSheet.insertRule(css`
    .pane > .monaco-progress-container {
      z-index: 20;
    }
  `);
}

if (miscellaneous.disableFocusOutline)
  fgtSheet.insertRule(css`
    .monaco-workbench [tabindex="-1"]:focus,
    .monaco-workbench [tabindex="0"]:focus,
    .monaco-workbench button:focus,
    .monaco-workbench input[type="button"]:focus,
    .monaco-workbench input[type="checkbox"]:focus,
    .monaco-workbench input[type="search"]:focus,
    .monaco-workbench input[type="text"]:focus,
    .monaco-workbench select:focus,
    .monaco-workbench textarea:focus,
    .monaco-list::before {
      outline: none !important;
    }
  `);
