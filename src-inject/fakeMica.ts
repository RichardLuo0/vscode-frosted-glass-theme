import config from "./config.json" with { type: "json" };
import fgtSheet from "./vscode-frosted-glass-theme.css" with { type: "css" };

const { fakeMica } = config;

if (fakeMica.enabled) {
  fgtSheet.insertRule(
    `[role="application"]::before {
      content: "";
      display: block;
      position: absolute;
      top: 0px;
      left: 0px;
      width: 100%;
      height: 100%;
    }`
  );

  fgtSheet.insertRule(
    `.fgt-mica-svg-loaded::before {
      filter: ${fakeMica.filter};
      background: url("vscode-file://vscode-app/${fakeMica.url}") center center / cover no-repeat
    }`
  );

  if (fakeMica.titlebarFix) {
    fgtSheet.insertRule(
      `.part.titlebar {
      background-color: color-mix(
        in srgb,
        var(--vscode-titleBar-activeBackground) ${
          fakeMica.titlebarOpacity * 100
        }%, transparent) !important;
    }`
    );
  }

  if (fakeMica.listBackgroundFix) {
    fgtSheet.insertRule(
      `.monaco-list-rows {
      background-color: transparent !important;
    }`
    );
  }

  if (fakeMica.editorBackgroundFix) {
    fgtSheet.insertRule(
      `.content,
      .monaco-editor,
      .monaco-editor-background,
      .view-overlays .selected-text:has(+ .monaco-editor-background) {
        background-color: transparent !important;
      }`
    );
    fgtSheet.insertRule(
      `.editor-group-container.empty {
      background-color: var(--vscode-editor-background);
    }`
    );
  }
}

export async function applyFakeMica(
  element: HTMLElement,
  svgMounted: Promise<void>
) {
  if (fakeMica.enabled) {
    await svgMounted;
    element.classList.add("fgt-mica-svg-loaded");
  }
}
