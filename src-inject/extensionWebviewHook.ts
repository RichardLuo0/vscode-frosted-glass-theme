import { proxy, useArgs } from "../common/proxy";
import config from "../config/config.json" with { type: "json" };
import { applyBackdropFilterOnEntry, getFilterWithKey } from "./backdropFilter";
import { MountSvgTo } from "./utils/loadSvg";
import { css } from "./utils/utils";
import { insertVariables } from "./variables";

const hookMap: {
  [k: string]: (doc: Document, mountTintSvgTo: MountSvgTo) => void;
} = {};

if (config.extensionWebviewHook["GitHub.vscode-pull-request-github"]) {
  hookMap["GitHub.vscode-pull-request-github"] = async (
    doc,
    mountTintSvgTo
  ) => {
    const win = doc.defaultView;
    if (!win) return;

    const sheet = new win.CSSStyleSheet();

    insertVariables(sheet, '[role="document"]', config.variable);
    insertVariables(
      sheet,
      '[role="document"].vs-dark, [role="document"].hc-black',
      config.variableDark
    );

    await applyBackdropFilterOnEntry(
      doc.body,
      ["stickyHeader", "--vscode-editor-background", ".sticky-header"],
      mountTintSvgTo
    );
    const filter = getFilterWithKey("stickyHeader");
    if (filter === undefined) return;
    sheet.insertRule(css`
      .sticky-header {
        backdrop-filter: ${filter.filter};
      }
    `);
    doc.adoptedStyleSheets.push(sheet);
  };
}

export function hookExtensionWebView(
  element: HTMLIFrameElement & { _hooked?: boolean },
  extensionId: string,
  mountTintSvgTo: MountSvgTo
) {
  if (element._hooked) return;
  if (!hookMap[extensionId]) return;

  element.addEventListener("load", () => {
    const topDocument = element.contentDocument;
    if (!topDocument) {
      console.error(`fgt(${extensionId}): contentDocument can not be accessed`);
      return;
    }

    proxy(
      topDocument.body,
      "appendChild",
      useArgs(innerFrame => {
        const win = innerFrame.ownerDocument?.defaultView;
        if (!win) return;
        if (!(innerFrame instanceof win.HTMLIFrameElement)) return;

        innerFrame.addEventListener("load", () => {
          if (!innerFrame.contentDocument) {
            console.error(
              `fgt(${extensionId}): innerIframe contentDocument can not be accessed`
            );
            return;
          }

          hookMap[extensionId](innerFrame.contentDocument, mountTintSvgTo);
        });
      })
    );
  });

  element._hooked = true;
}
