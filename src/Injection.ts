import fs, { constants } from "fs";
import path from "path";
import { env, window } from "vscode";
import InjectionAdmin from "./InjectionAdmin";
import InjectionNormal from "./InjectionNormal";
import { localize } from "./localization";
import { lazy } from "../common/utils";
import { IInjection } from "./IInjection";

export default class Injection implements IInjection {
  constructor(
    private files: string[],
    private baseFileCandidates: string[]
  ) {}

  private getInjectionImpl = lazy(() => {
    const appRoot = env.appRoot;
    if (!appRoot) throw new Error("appRoot is not found");
    const baseFileRelative = this.baseFileCandidates.find(c =>
      fs.existsSync(path.join(appRoot, c))
    );
    if (baseFileRelative === undefined)
      throw new Error("baseFile is not found in: " + this.baseFileCandidates);
    const baseFile = path.join(appRoot, baseFileRelative);
    try {
      fs.accessSync(baseFile, constants.R_OK | constants.W_OK);
      return new InjectionNormal(this.files, baseFile);
    } catch (e) {
      return new InjectionAdmin(this.files, baseFile);
    }
  });

  async inject(): Promise<void> {
    try {
      await this.getInjectionImpl().inject();
    } catch (e) {
      window.showErrorMessage(localize("admin"));
      throw e;
    }
  }

  async restore(): Promise<void> {
    try {
      await this.getInjectionImpl().restore();
    } catch (e) {
      window.showErrorMessage(localize("admin"));
      throw e;
    }
  }
}
