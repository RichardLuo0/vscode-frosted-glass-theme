import { proxy, proxyOrDefine, useArgs, useRet } from "../common/proxy";
import config from "../config/config.json" with { type: "json" };
import {
  applyBackdropFilterOnEntry,
  applyBackdropFilterOnSheet,
  Entry,
} from "./backdropFilter";
import { MountSvgTo } from "./utils/loadSvg";
import { css } from "./utils/utils";
import { insertVariables } from "./variables";

const hookMap: {
  [k: string]: (doc: Document, mountTintSvgTo: MountSvgTo) => void;
} = {};

function insertVariablesOnDoc(sheet: CSSStyleSheet) {
  insertVariables(sheet, '[role="document"]', config.variable);
  insertVariables(
    sheet,
    '[role="document"].vs-dark, [role="document"].hc-black',
    config.variableDark
  );
}

config.extensionWebviewPatch.forEach(extensionId => {
  switch (extensionId) {
    case "GitHub.vscode-pull-request-github":
      hookMap[extensionId] = async (doc, mountTintSvgTo) => {
        const win = doc.defaultView;
        if (!win) return;

        const sheet = new win.CSSStyleSheet();
        insertVariablesOnDoc(sheet);
        const entryList: Entry[] = [
          ["stickyHeader", "--vscode-editor-background", ".sticky-header"],
        ];
        entryList.forEach(entry => {
          entry[0] = extensionId + "-" + entry[0];
          applyBackdropFilterOnSheet(sheet, entry);
          applyBackdropFilterOnEntry(doc.body, entry, mountTintSvgTo);
        });
        doc.adoptedStyleSheets.push(sheet);
      };
      break;
    case "mhutchie.git-graph":
      hookMap[extensionId] = async (doc, mountTintSvgTo) => {
        const win = doc.defaultView;
        if (!win) return;

        const sheet = new win.CSSStyleSheet();
        insertVariablesOnDoc(sheet);
        const entryList: Entry[] = [
          ["dropdownMenu", "--vscode-menu-background", ".dropdownMenu"],
          ["contextMenu", "--vscode-menu-background", ".contextMenu"],
        ];
        entryList.forEach(entry => {
          entry[0] = extensionId + "-" + entry[0];
          applyBackdropFilterOnSheet(sheet, entry);
          applyBackdropFilterOnEntry(doc.body, entry, mountTintSvgTo);
        });
        doc.adoptedStyleSheets.push(sheet);
      };
      break;
    case "eamodio.gitlens":
      hookMap[extensionId] = async (doc, mountTintSvgTo) => {
        const win = doc.defaultView;
        if (!win) return;

        const sheet = new win.CSSStyleSheet();
        insertVariablesOnDoc(sheet);
        sheet.insertRule(css`
          .commit-detail-panel {
            background-color: transparent !important;
          }
        `);
        sheet.insertRule(css`
          menu-item {
            background-color: transparent !important;
          }
        `);

        // TODO
        // const entryList: Entry[] = [
        //   ["popover", "--wa-tooltip-background-color", "#popover"],
        // ];
        // entryList.forEach(entry => {
        //   entry[0] = extensionId + "-" + entry[0];
        //   applyBackdropFilterOnSheet(sheet, entry);
        //   applyBackdropFilterOnEntry(doc.body, entry, mountTintSvgTo);
        // });
        doc.adoptedStyleSheets.push(sheet);

        // const onShadowDomRendered = (shadowDom: ShadowRoot) => {
        //   shadowDom.adoptedStyleSheets.push(sheet);
        //   entryList.forEach(entry => {
        //     applyBackdropFilterOnEntry(shadowDom, entry, mountTintSvgTo);
        //   });
        // };

        // proxy(
        //   win.Element.prototype,
        //   "attachShadow",
        //   useRet(shadowDom => {
        //     console.log("queueMicrotask");
        //     onShadowDomRendered(shadowDom);
        //     return shadowDom;
        //   })
        // );
      };
      break;
    default:
      break;
  }
});

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
        const topWin = topDocument.defaultView;
        if (!topWin) return;
        if (!(innerFrame instanceof topWin.HTMLIFrameElement)) return;

        innerFrame.addEventListener("load", () => {
          if (!innerFrame.contentDocument) {
            console.error(
              `fgt(${extensionId}): innerIframe contentDocument can not be accessed`
            );
            return;
          }
          if (innerFrame.contentDocument.URL.includes("/fake.html")) return;

          hookMap[extensionId](innerFrame.contentDocument, mountTintSvgTo);
        });
      })
    );
  });

  element._hooked = true;
}
