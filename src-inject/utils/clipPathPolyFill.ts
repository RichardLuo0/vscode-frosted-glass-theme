import { css, getChromeMainVersion } from "./utils";
import fgtSheet from "../vscode-frosted-glass-theme.css" with { type: "css" };

export function clipPath(
  selector: string,
  clipPath: string,
  overflowClipMargin: string
) {
  const chromeMainVersion = getChromeMainVersion();
  // 142 or greater, the `backdrop-filter` won't work if clip-path is set on the parent.
  // `clip-path` is not available below 128.
  if (chromeMainVersion < 142 && chromeMainVersion >= 128)
    fgtSheet.insertRule(css`
      ${selector} {
        clip-path: ${clipPath} !important;
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

export function inset(top: number, unbound: boolean = false) {
  return `inset(${top}px ${unbound ? "calc(-infinity * 1px) calc(-infinity * 1px)" : "0px 0px"})`;
}
