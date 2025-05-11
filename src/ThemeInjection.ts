import path from "path";
import { IInjection } from "./IInjection";
import Injection from "./Injection";

export default class ThemeInjection implements IInjection {
  private rendererInjection: Injection;
  private mainInjection: Injection;

  constructor(rendererInjectFiles: string[], mainInjectFiles: string[]) {
    this.rendererInjection = new Injection(rendererInjectFiles, [
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
    ]);
    this.mainInjection = new Injection(mainInjectFiles, [
      path.join("out", "main.js"),
    ]);
  }

  async inject() {
    await Promise.all([
      this.rendererInjection.inject(),
      this.mainInjection.inject(),
    ]);
  }

  async restore() {
    await Promise.all([
      this.rendererInjection.restore(),
      this.mainInjection.restore(),
    ]);
  }
}
