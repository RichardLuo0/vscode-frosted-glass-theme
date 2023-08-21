import sudoPrompt from "@vscode/sudo-prompt";
import { IFile } from "./File";
import { InjectionImpl } from "./Injection";
import { showChoiceMessage } from "./ShowMessage";
import { msg } from "./msg";

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

export default class InjectionAdmin implements InjectionImpl {
  constructor(
    private files: IFile[],
    private base: string,
    private htmlFile: string
  ) {}

  async inject(): Promise<void> {
    return this.runAsAdmin("inject");
  }

  async restore(): Promise<void> {
    return this.runAsAdmin("restore");
  }

  private async runAsAdmin(funcName: string): Promise<void> {
    return new Promise(async (resolve, reject) => {
      if (!(await showChoiceMessage(msg.tryAdmin, msg.tryAsAdmin))) {
        reject("user cancelled");
        return;
      }
      const env = {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        ELECTRON_RUN_AS_NODE: "1",
      };
      sudoPrompt.exec(
        `${expandEnv(env)} "${
          process.execPath
        }" --ms-enable-electron-run-as-node "${__dirname}/InjectionAdminMain.js" --no-sandbox ${funcName} "${escape(
          JSON.stringify(this.files)
        )}" "${this.base}" "${this.htmlFile}"`,
        { name: "Frosted Glass Theme", env },
        (error) => {
          if (error) reject(error);
          else resolve(undefined);
        }
      );
    });
  }
}
