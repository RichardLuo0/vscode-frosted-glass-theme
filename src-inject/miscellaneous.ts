import config from "./config.json" with { type: "json" };
import fgtSheet from "./vscode-frosted-glass-theme.css" with { type: "css" };

const { miscellaneous } = config;

if (miscellaneous.progressBarBehindSectionHeader) {
  fgtSheet.insertRule(`
    .pane > .monaco-progress-container {
      height: 22px !important;
      top: 0px !important;
    }`);
  // `left: 1px` because of a weird flash
  fgtSheet.insertRule(`
    .pane > .monaco-progress-container > .progress-bit {
      height: 22px !important;
      left: 1px !important;
    }`);
} else {
  fgtSheet.insertRule(`
    .pane > .monaco-progress-container {
      z-index: 20;
    }`);
}
