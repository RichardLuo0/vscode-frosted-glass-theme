import { css, getChromeMainVersion } from "./utils";
import fgtSheet from "../vscode-frosted-glass-theme.css" with { type: "css" };

export function clipPath(
  selector: string,
  clipPath: string,
  overflowClipMargin: string
) {
  if (getChromeMainVersion() >= 128)
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
