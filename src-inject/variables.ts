import { css } from "./utils/utils";

export function insertVariables(
  stylesheet: CSSStyleSheet,
  cssSelector: string,
  variables: object
) {
  stylesheet.insertRule(css`
    ${cssSelector} {
      ${Object.entries(variables).reduce((total, pair) => {
        const [key, value] = pair;
        return total + `--${key}: ${value};`;
      }, "")}
    }
  `);
}
