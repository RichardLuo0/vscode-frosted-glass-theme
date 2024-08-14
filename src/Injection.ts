import fs, { constants } from "fs";
import path from "path";
import { window } from "vscode";
import File from "./File";
import InjectionAdmin from "./InjectionAdmin";
import InjectionNormal from "./InjectionNormal";
import { localize } from "./localization";

export interface InjectionImpl {
  inject(): Promise<void>;
  restore(): Promise<void>;
}

export default class Injection implements InjectionImpl {
  private injectionImpl?: InjectionImpl;

  constructor(private files: File[]) {}

  private prepare() {
    if (this.injectionImpl) return;
    const appDir = require.main
      ? path.dirname(require.main.filename)
      : undefined;
    if (appDir === undefined) throw new Error("appDir is not found");
    const base = path.join(appDir, "vs", "code");
    let baseDir = path.join(base, "electron-sandbox", "workbench");
    let htmlFile = path.join(baseDir, "workbench.html");
    // Since VS Code 1.70.0, the file is in electron-sandbox/workbench/workbench.html
    if (!fs.existsSync(htmlFile)) {
      baseDir = path.join(base, "electron-browser", "workbench");
      htmlFile = path.join(baseDir, "workbench.html");
    }
    try {
      fs.accessSync(htmlFile, constants.R_OK | constants.W_OK);
      this.injectionImpl = new InjectionNormal(this.files, base, htmlFile);
    } catch (e) {
      this.injectionImpl = new InjectionAdmin(this.files, base, htmlFile);
    }
  }

  async inject(): Promise<void> {
    this.prepare();
    try {
      await this.injectionImpl!.inject();
    } catch (e) {
      window.showErrorMessage(localize("admin"));
      throw e;
    }
  }

  async restore(): Promise<void> {
    this.prepare();
    try {
      await this.injectionImpl!.restore();
    } catch (e) {
      window.showErrorMessage(localize("admin"));
      throw e;
    }
  }
}
