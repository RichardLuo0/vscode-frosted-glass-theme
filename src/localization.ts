import { readFileSync } from "fs";
import path from "path";

const acceptLang = new Set(["en", "zh-cn"]);
const config = JSON.parse(process.env.VSCODE_NLS_CONFIG as string);
const i18nPath = path.join(__dirname, "../i18n");
const dictionary: { [key: string]: string | undefined } = JSON.parse(
  readFileSync(
    path.join(
      i18nPath,
      `bundle.i18n.${acceptLang.has(config.locale) ? config.locale : "en"}.json`
    ),
    "utf-8"
  )
);

export function localize(key: string, ...args: string[]) {
  const translated = dictionary[key];
  for (let i = 0; i < args.length; i++) {
    translated?.replaceAll(`{${i}}`, args[i]);
  }
  return translated && translated.length != 0 ? translated : key;
}
