import sudoPrompt from "@vscode/sudo-prompt";
import { IFile } from "./File";
import { InjectionImpl } from "./Injection";
import { showChoiceMessage } from "./ShowMessage";
import { msg } from "./msg";

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

  async runAsAdmin(funcName: string): Promise<void> {
    return new Promise(async (resolve, reject) => {
      if (!(await showChoiceMessage(msg.tryAdmin, msg.tryAsAdmin))) {
        reject("user cancelled");
        return;
      }
      sudoPrompt.exec(
        `ELECTRON_RUN_AS_NODE=1 ${
          process.execPath
        } --ms-enable-electron-run-as-node ${__dirname}/InjectionAdminMain.js --no-sandbox ${funcName} \"${JSON.stringify(
          this.files
        ).replace(/"/g, '\\\\"')}\" \"${this.base}\" \"${this.htmlFile}\"`,
        { name: "Frosted Glass Theme" },
        (error) => {
          if (error) reject(error);
          else resolve(undefined);
        }
      );
    });
  }
}
