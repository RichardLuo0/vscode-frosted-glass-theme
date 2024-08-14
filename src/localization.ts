import { readFileSync } from "fs";
import path from "path";

let dictionary: { [key: string]: string };
const config = JSON.parse(process.env.VSCODE_NLS_CONFIG as string);
const i18nPath = path.join(__dirname, "../i18n");
try {
  dictionary = JSON.parse(
    readFileSync(
      path.join(i18nPath, `bundle.i18n.${config.locale}.json`),
      "utf-8"
    )
  );
} catch (error) {
  dictionary = JSON.parse(
    readFileSync(path.join(i18nPath, `bundle.i18n.en.json`), "utf-8")
  );
}

export function localize(key: string, ...args: string[]) {
  const translated = dictionary[key];
  for (let i = 0; i < args.length; i++) {
    translated.replaceAll(`{${i}}`, args[i]);
  }
  return translated.length == 0 ? key : translated;
}
