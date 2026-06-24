import config from "../config/config.json" with { type: "json" };
import { resolveFakeMicaBackgroundUrl } from "./utils/fakeMicaUrl";
import { css } from "./utils/utils";
import fgtSheet from "./vscode-frosted-glass-theme.css" with { type: "css" };

const { fakeMica } = config;
const MICA_LAYER_CLASS = "fgt-mica-layer";

if (fakeMica.enabled) {
  fgtSheet.insertRule(css`
    .fgt-mica-svg-loaded {
      position: relative;
      --fgt-mica-x: center;
      --fgt-mica-y: center;
    }
  `);

  fgtSheet.insertRule(css`
    .${MICA_LAYER_CLASS} {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 0;
    }
  `);

  fgtSheet.insertRule(css`
    .monaco-list-rows {
      background-color: transparent !important;
    }
  `);

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

async function loadMicaBackgroundUrl(url: string): Promise<string> {
  const resolved = resolveFakeMicaBackgroundUrl(url);
  if (resolved.startsWith("data:")) return resolved;
  try {
    const response = await fetch(resolved);
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
    return URL.createObjectURL(await response.blob());
  } catch {
    return resolved;
  }
}

export async function applyFakeMica(
  element: HTMLElement,
  svgMounted: Promise<void>
) {
  if (!fakeMica.enabled) return;

  await svgMounted;

  let layer = element.querySelector<HTMLElement>(`.${MICA_LAYER_CLASS}`);
  if (!layer) {
    layer = document.createElement("div");
    layer.className = MICA_LAYER_CLASS;
    element.prepend(layer);
  }

  const backgroundUrl = await loadMicaBackgroundUrl(fakeMica.url);
  layer.style.filter = fakeMica.filter;
  layer.style.backgroundImage = `url("${backgroundUrl}")`;
  layer.style.backgroundSize = `${screen.width}px ${screen.height}px`;
  layer.style.backgroundRepeat = "no-repeat";
  layer.style.backgroundPosition = `var(--fgt-mica-x) var(--fgt-mica-y)`;

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
