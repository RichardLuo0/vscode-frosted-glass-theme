import sudoPrompt from "@vscode/sudo-prompt";
import { localize } from "./localization";
import { showChoiceMessage } from "./utils";
import { IInjection } from "./IInjection";

function escape(src: string) {
  return process.platform === "win32"
    ? src.replace(/"/g, '\\"')
    : src.replace(/"/g, '\\\\"');
}

function expandEnv(env: { [key: string]: string }): string {
  if (process.platform === "win32") return "";
  let res = "";
  for (const variable in env) {
    res += variable + "=" + env[variable] + " ";
  }
  return res;
}

export default class InjectionAdmin implements IInjection {
  constructor(
    private files: string[],
    private baseFile: string
  ) {}

  async inject(): Promise<void> {
    return this.runAsAdmin("inject");
  }

  async restore(): Promise<void> {
    return this.runAsAdmin("restore");
  }

  private async runAsAdmin(funcName: string): Promise<void> {
    return new Promise(async (resolve, reject) => {
      if (
        !(await showChoiceMessage(
          localize("tryAdminMsg"),
          localize("tryAsAdmin")
        ))
      ) {
        reject("user cancelled");
        return;
      }
      const env = {
        ELECTRON_RUN_AS_NODE: "1",
      };
      sudoPrompt.exec(
        `${expandEnv(env)} "${
          process.execPath
        }" "${__dirname}/InjectionAdminMain.js" --no-sandbox ${funcName} "${escape(
          JSON.stringify(this.files)
        )}" "${this.baseFile}"`,
        { name: "Frosted Glass Theme", env },
        error => {
          if (error) reject(error);
          else resolve(undefined);
        }
      );
    });
  }
}
