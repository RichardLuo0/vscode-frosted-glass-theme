import fs, { constants } from "fs";
import path from "path";
import { window } from "vscode";
import { IFile } from "./File";
import InjectionAdmin from "./InjectionAdmin";
import InjectionNormal from "./InjectionNormal";
import { msg } from "./msg";

export interface InjectionImpl {
  inject(): Promise<void>;
  restore(): Promise<void>;
}

const appDir = require.main ? path.dirname(require.main.filename) : undefined;
if (appDir === undefined) throw new Error("appDir is not found");
const base = path.join(appDir, "vs", "code");
let baseDir = path.join(base, "electron-sandbox", "workbench");
let htmlFile = path.join(baseDir, "workbench.html");
// Since VS Code 1.70.0, the file is in electron-sandbox/workbench/workbench.html
if (!fs.existsSync(htmlFile)) {
  baseDir = path.join(base, "electron-browser", "workbench");
  htmlFile = path.join(baseDir, "workbench.html");
}

export default class Injection implements InjectionImpl {
  private injectionImpl: InjectionImpl;

  constructor(files: IFile[]) {
    try {
      fs.accessSync(htmlFile, constants.R_OK | constants.W_OK);
      this.injectionImpl = new InjectionNormal(files, base, htmlFile);
    } catch (e) {
      this.injectionImpl = new InjectionAdmin(files, base, htmlFile);
    }
  }

  async inject(): Promise<void> {
    try {
      await this.injectionImpl.inject();
    } catch (e) {
      window.showErrorMessage(msg.admin);
      throw e;
    }
  }

  async restore(): Promise<void> {
    try {
      await this.injectionImpl.restore();
    } catch (e) {
      window.showErrorMessage(msg.admin);
      throw e;
    }
  }
}
