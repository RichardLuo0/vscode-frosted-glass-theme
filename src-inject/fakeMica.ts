import config from "../config/config.json" with { type: "json" };
import { css } from "./utils/utils";
import fgtSheet from "./vscode-frosted-glass-theme.css" with { type: "css" };

const { fakeMica } = config;

if (fakeMica.enabled) {
  fgtSheet.insertRule(css`
    .fgt-mica-svg-loaded {
      --fgt-mica-x: center;
      --fgt-mica-y: center;
    }
  `);

  fgtSheet.insertRule(css`
    .fgt-mica-svg-loaded::before {
      content: "";
      display: block;
      position: absolute;
      top: 0px;
      left: 0px;
      width: 100%;
      height: 100%;
      filter: ${fakeMica.filter};
      background-image: url("vscode-file://vscode-app/${fakeMica.url}");
      background-size: ${screen.width}px ${screen.height}px;
      background-repeat: no-repeat;
      background-position: var(--fgt-mica-x) var(--fgt-mica-y);
    }
  `);

  // Fix list background
  fgtSheet.insertRule(css`
    .monaco-list-rows {
      background-color: transparent !important;
    }
  `);

  // Fix settings row background
  fgtSheet.insertRule(css`
    .settings-body .monaco-list-row {
      background-color: transparent !important;
    }
  `);

  if (fakeMica.titlebarFix) {
    fgtSheet.insertRule(css`
      .part.titlebar {
        background-color: color-mix(
          in srgb,
          var(--vscode-titleBar-activeBackground) ${fakeMica.titlebarFix * 100}%,
          transparent
        ) !important;
      }
    `);
  }

  if (fakeMica.editorBackgroundFix) {
    fgtSheet.insertRule(css`
      .content,
      .monaco-editor,
      .monaco-editor-background,
      .view-overlays .selected-text:has(+ .monaco-editor-background) {
        background-color: transparent !important;
      }
    `);
    fgtSheet.insertRule(css`
      .editor-group-container.empty {
        background-color: var(--vscode-editor-background);
      }
    `);
    // VSCode puts a top margin so that there will be a gap on the top.
    // Fix it by replacing with padding.
    fgtSheet.insertRule(css`
      .profiles-editor {
        margin: 0 auto 0 !important;
        padding-top: 20px;
      }
    `);
  }
}

function getMicaX(win: Window) {
  return win.screenX >= -win.outerWidth && win.screenX <= screen.width
    ? `${-win.screenX}px`
    : "center";
}

function getMicaY(win: Window) {
  return win.screenY >= -win.outerHeight && win.screenY <= screen.height
    ? `${-win.screenY}px`
    : "center";
}

export async function applyFakeMica(
  element: HTMLElement,
  svgMounted: Promise<void>
) {
  if (fakeMica.enabled) {
    await svgMounted;
    element.classList.add("fgt-mica-svg-loaded");
    if (fakeMica.moveWithWindow) {
      const win = element.ownerDocument.defaultView;
      if (win) {
        const updateMica = () => {
          element.style.setProperty("--fgt-mica-x", getMicaX(win));
          element.style.setProperty("--fgt-mica-y", getMicaY(win));
        };
        updateMica();
        win.vscode.ipcRenderer.on("vscode:update-mica", updateMica);
      }
    }
  }
}
