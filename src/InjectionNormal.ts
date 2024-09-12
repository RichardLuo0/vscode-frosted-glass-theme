import fs from "fs";
import path from "path";
import { v4 } from "uuid";
import File from "./File";
import { InjectionImpl } from "./Injection";

export default class InjectionNormal implements InjectionImpl {
  private base: string;

  constructor(
    private files: File[],
    private htmlFile: string
  ) {
    this.base = path.dirname(htmlFile);
  }

  public async inject() {
    const uuidSession = v4();
    await this.createBackup(uuidSession);
    await this.performPatch(uuidSession);
  }

  public async restore() {
    const backupUuid = await this.getBackupUuid();
    if (!backupUuid) return;
    const backupPath = this.backupFilePath(backupUuid);
    await this.restoreBackup(backupPath);
    await this.deleteBackupFiles();
  }

  protected async getBackupUuid() {
    if (fs.existsSync(this.htmlFile)) {
      const htmlContent = await fs.promises.readFile(this.htmlFile, "utf-8");
      const m = htmlContent.match(
        /<!-- !! VSCODE-FROSTED-GLASS-THEME-SESSION-ID ([0-9a-fA-F-]+) !! -->/
      );
      if (!m) return null;
      else return m[1];
    }
  }

  protected async createBackup(uuidSession: string) {
    const backupUuid = await this.getBackupUuid();
    if (!backupUuid)
      await fs.promises.copyFile(
        this.htmlFile,
        this.backupFilePath(uuidSession)
      );
    else {
      await fs.promises.rename(
        this.backupFilePath(backupUuid),
        this.backupFilePath(uuidSession)
      );
    }
  }

  protected async performPatch(uuidSession: string) {
    let html = fs.readFileSync(this.htmlFile, "utf-8");
    html = this.clearExistingPatches(html);

    let injectHTML = this.computeInjectedHTML();

    // Remove csp
    html = html.replace(
      /<meta\s+http-equiv="Content-Security-Policy"[\s\S]*?\/>/,
      ""
    );

    html = html.replace(
      /(<\/html>)/,
      `<!-- !! VSCODE-FROSTED-GLASS-THEME-SESSION-ID ${uuidSession} !! -->\n` +
        "<!-- !! VSCODE-FROSTED-GLASS-THEME-START !! -->\n" +
        injectHTML +
        "<!-- !! VSCODE-FROSTED-GLASS-THEME-END !! -->\n</html>"
    );
    await fs.promises.writeFile(this.htmlFile, html, "utf-8");
  }

  protected clearExistingPatches(html: string) {
    html = html.replace(
      /<!-- !! VSCODE-FROSTED-GLASS-THEME-START !! -->[\s\S]*?<!-- !! VSCODE-FROSTED-GLASS-THEME-END !! -->\n*/,
      ""
    );
    html = html.replace(
      /<!-- !! VSCODE-FROSTED-GLASS-THEME-SESSION-ID [\w-]+ !! -->\n*/g,
      ""
    );
    return html;
  }

  protected computeInjectedHTML() {
    let res = "";
    for (const item of this.files) {
      const imp = this.computeInjectedHTMLItem(item);
      if (imp) res += imp;
    }
    return res;
  }

  protected computeInjectedHTMLItem(f: File) {
    if (!f) return "";
    let url = f.path;
    const ext = path.extname(url);

    url = url
      .replace(
        "file:///",
        process.platform === "win32"
          ? "vscode-file://vscode-app/"
          : "vscode-file://vscode-app"
      )
      .replace(/\\/g, "/");

    switch (ext) {
      case ".js":
        return `<script type="module" src="${url}"></script>\n`;
      case ".css":
        return `<link rel="stylesheet" href="${url}"/>\n`;
      default:
        throw new Error("unknown extension: " + ext);
    }
  }

  protected async restoreBackup(backupFilePath: string) {
    if (fs.existsSync(backupFilePath)) {
      await fs.promises.unlink(this.htmlFile);
      await fs.promises.copyFile(backupFilePath, this.htmlFile);
    }
  }

  protected async deleteBackupFiles() {
    const htmlDirItems = fs.readdirSync(this.base);
    for (const item of htmlDirItems) {
      if (item.endsWith(".bak-frosted-glass"))
        await fs.promises.unlink(path.join(this.base, item));
    }
  }

  protected backupFilePath(uuid: string) {
    return path.join(this.base, `workbench.${uuid}.bak-frosted-glass`);
  }
}
