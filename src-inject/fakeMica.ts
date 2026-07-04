import config from "../config/config.json" with { type: "json" };
import { css } from "./utils/utils";
import fgtSheet from "./vscode-frosted-glass-theme.css" with { type: "css" };

const { fakeMica } = config;

if (fakeMica.enabled) {
  fgtSheet.insertRule(css`
    .fgt-mica-svg-loaded {
      --fgt-mica-width: ${screen.width}px;
      --fgt-mica-height: ${screen.height}px;
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
      background-size: var(--fgt-mica-width) var(--fgt-mica-height);
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
  const relScreenX = win.screenX - (win.screen.availLeft ?? 0);
  return relScreenX >= -win.outerWidth && relScreenX <= win.screen.width
    ? `${-relScreenX}px`
    : "center";
}

function getMicaY(win: Window) {
  const relScreenY = win.screenY - (win.screen.availTop ?? 0);
  return relScreenY >= -win.outerHeight && relScreenY <= win.screen.height
    ? `${-relScreenY}px`
    : "center";
}

function throttle<T extends (...args: any[]) => void>(fn: T, intervalMs = 30) {
  let intervalId: number = 0;
  let scheduled = false;
  let latestArgs: Parameters<T> | null = null;

  const onTick = () => {
    if (scheduled === false) {
      clearInterval(intervalId);
      intervalId = 0;
      return;
    }
    scheduled = false;
    const callArgs = latestArgs;
    latestArgs = null;
    if (callArgs) fn(...callArgs);
  };

  return (...args: Parameters<T>) => {
    latestArgs = args;
    if (scheduled) return;
    scheduled = true;

    if (intervalId == 0) {
      onTick();
      intervalId = setInterval(onTick, intervalMs);
    }
  };
}

export async function applyFakeMica(
  element: HTMLElement,
  svgMounted: Promise<void>
) {
  if (!fakeMica.enabled) return;

  await svgMounted;
  element.classList.add("fgt-mica-svg-loaded");

  const win = element.ownerDocument.defaultView;
  if (win) {
    const updateMica = () => {
      element.style.setProperty("--fgt-mica-width", `${screen.width}px`);
      element.style.setProperty("--fgt-mica-height", `${screen.height}px`);
      if (fakeMica.moveWithWindow) {
        element.style.setProperty("--fgt-mica-x", getMicaX(win));
        element.style.setProperty("--fgt-mica-y", getMicaY(win));
      }
    };
    updateMica();
    win.vscode.ipcRenderer.on("vscode:update-mica", throttle(updateMica));
  }
}
