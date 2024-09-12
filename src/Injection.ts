import fs, { constants } from "fs";
import path from "path";
import { env, window } from "vscode";
import File from "./File";
import InjectionAdmin from "./InjectionAdmin";
import InjectionNormal from "./InjectionNormal";
import { localize } from "./localization";

export interface InjectionImpl {
  inject(): Promise<void>;
  restore(): Promise<void>;
}

const htmlFileCandidates = [
  path.join(
    "out",
    "vs",
    "code",
    "electron-sandbox",
    "workbench",
    "workbench.html"
  ), // 1.70.0
  path.join(
    "out",
    "vs",
    "code",
    "electron-sandbox",
    "workbench",
    "workbench.esm.html"
  ), // 1.94.0
  path.join(
    "out",
    "vs",
    "code",
    "electron-browser",
    "workbench",
    "workbench.html"
  ), // prior
];

export default class Injection implements InjectionImpl {
  constructor(private files: File[]) {}

  private _injectionImpl?: InjectionImpl;

  private prepare() {
    if (this._injectionImpl) return this._injectionImpl;
    const appRoot = env.appRoot;
    if (!appRoot) throw new Error("appRoot is not found");
    const htmlFileRelative = htmlFileCandidates.find(c =>
      fs.existsSync(path.join(appRoot, c))
    );
    if (htmlFileRelative === undefined)
      throw new Error("htmlFile is not found");
    const htmlFile = path.join(appRoot, htmlFileRelative);
    try {
      fs.accessSync(htmlFile, constants.R_OK | constants.W_OK);
      this._injectionImpl = new InjectionNormal(this.files, htmlFile);
    } catch (e) {
      this._injectionImpl = new InjectionAdmin(this.files, htmlFile);
    }
    return this._injectionImpl;
  }

  async inject(): Promise<void> {
    try {
      await this.prepare().inject();
    } catch (e) {
      window.showErrorMessage(localize("admin"));
      throw e;
    }
  }

  async restore(): Promise<void> {
    try {
      await this.prepare().restore();
    } catch (e) {
      window.showErrorMessage(localize("admin"));
      throw e;
    }
  }
}
