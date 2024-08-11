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
      backdrop-filter: ${fakeMica.filter}
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
      `.content:not(.empty), .monaco-editor, .monaco-editor-background {
      background-color: transparent !important;
    }`
    );
  }
}

export async function applyFakeMica(
  element: HTMLElement,
  svgMounted: Promise<void>
) {
  if (fakeMica.enabled) {
    element.style.background = `url("vscode-file://vscode-app/${fakeMica.url}") center center / cover no-repeat`;
    await svgMounted;
    element.classList.add("fgt-mica-svg-loaded");
  }
}
