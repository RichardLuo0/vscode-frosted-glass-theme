import fs from "fs";
import path from "path";
import { v4 } from "uuid";
import { IInjection } from "./IInjection";

interface Patcher {
  patch(uuid: string, files: string[]): Promise<void>;
  getId(): Promise<string | undefined>;
}

class HtmlPatcher implements Patcher {
  constructor(private file: string) {}

  async patch(uuid: string, files: string[]) {
    const injection = this.computeInjectedHTML(files);

    let content = fs.readFileSync(this.file, "utf-8");
    content = this.clearExistingPatches(content);

    content = content
      // Remove csp
      .replace(/<meta\s+http-equiv="Content-Security-Policy"[\s\S]*?\/>/, "")
      // Replace content
      .replace(
        /(<\/html>)/,
        `<!-- !! VSCODE-FROSTED-GLASS-THEME-SESSION-ID ${uuid} !! -->\n` +
          `<!-- !! VSCODE-FROSTED-GLASS-THEME-START !! -->\n${injection}\n<!-- !! VSCODE-FROSTED-GLASS-THEME-END !! -->\n</html>`
      );

    await fs.promises.writeFile(this.file, content, "utf-8");
  }

  async getId() {
    if (fs.existsSync(this.file)) {
      const content = await fs.promises.readFile(this.file, "utf-8");
      const m = content.match(
        /<!-- !! VSCODE-FROSTED-GLASS-THEME-SESSION-ID ([0-9a-fA-F-]+) !! -->/
      );
      if (m) return m[1];
    }
    return undefined;
  }

  protected clearExistingPatches(content: string) {
    return content
      .replace(
        /<!-- !! VSCODE-FROSTED-GLASS-THEME-START !! -->[\s\S]*?<!-- !! VSCODE-FROSTED-GLASS-THEME-END !! -->\n*/,
        ""
      )
      .replace(
        /<!-- !! VSCODE-FROSTED-GLASS-THEME-SESSION-ID [\w-]+ !! -->\n*/g,
        ""
      );
  }

  protected computeInjectedHTML(files: string[]) {
    let res = "";
    for (const item of files) {
      const imp = this.computeInjectedHTMLItem(item);
      if (imp) res += imp;
    }
    return res;
  }

  protected computeInjectedHTMLItem(url: string) {
    const ext = path.extname(url);

    url =
      "vscode-file://vscode-app" +
      (process.platform === "win32" ? "/" + url : url).replace(/\\/g, "/");

    switch (ext) {
      case ".js":
        return `<script type="module" src="${url}"></script>`;
      case ".css":
        return `<link rel="stylesheet" href="${url}"/>`;
      default:
        throw new Error("unknown extension: " + ext);
    }
  }
}

class JsPatcher implements Patcher {
  constructor(private file: string) {}

  async patch(uuid: string, files: string[]) {
    const injection = this.computeInjectedHTML(files);

    let content = fs.readFileSync(this.file, "utf-8");
    content = this.clearExistingPatches(content);

    content =
      `//VSCODE-FROSTED-GLASS-THEME-SESSION-ID ${uuid}\n//VSCODE-FROSTED-GLASS-THEME-START\n${injection}\n//VSCODE-FROSTED-GLASS-THEME-END\n` +
      content;

    await fs.promises.writeFile(this.file, content, "utf-8");
  }

  async getId() {
    if (fs.existsSync(this.file)) {
      const content = await fs.promises.readFile(this.file, "utf-8");
      const m = content.match(
        /\/\/VSCODE-FROSTED-GLASS-THEME-SESSION-ID ([0-9a-fA-F-]+)\n/
      );
      if (!m) return undefined;
      else return m[1];
    }
    return undefined;
  }

  protected clearExistingPatches(content: string) {
    return content
      .replace(
        /\/\/VSCODE-FROSTED-GLASS-THEME-START\n[\s\S]*?\/\/VSCODE-FROSTED-GLASS-THEME-END\n/,
        ""
      )
      .replace(/\/\/VSCODE-FROSTED-GLASS-THEME-SESSION-ID [\w-]+\n/g, "");
  }

  protected computeInjectedHTML(files: string[]) {
    let res = "";
    for (const item of files) {
      const imp = this.computeInjectedHTMLItem(item);
      if (imp) res += imp;
    }
    return res;
  }

  protected computeInjectedHTMLItem(url: string) {
    url =
      "file://" +
      (process.platform === "win32" ? "/" + url : url).replace(/\\/g, "/");
    return `import "${url}";`;
  }
}

export default class InjectionNormal implements IInjection {
  private baseDir: string;
  private patcher: Patcher;

  constructor(
    private files: string[],
    private baseFile: string
  ) {
    this.baseDir = path.dirname(baseFile);
    switch (path.extname(baseFile)) {
      case ".html":
        this.patcher = new HtmlPatcher(baseFile);
        break;
      case ".js":
        this.patcher = new JsPatcher(baseFile);
        break;
      default:
        throw new Error("Unknown type of file to patch: " + baseFile);
    }
  }

  public async inject() {
    const uuid = v4();
    await this.createBackup(uuid);
    await this.performPatch(uuid);
  }

  public async restore() {
    const backupUuid = await this.patcher.getId();
    if (!backupUuid) return;
    const backupPath = this.backupFilePath(backupUuid);
    await this.restoreBackup(backupPath);
    await this.deleteBackupFiles();
  }

  protected async createBackup(uuid: string) {
    const backupUuid = await this.patcher.getId();
    if (!backupUuid)
      await fs.promises.copyFile(this.baseFile, this.backupFilePath(uuid));
    else {
      await fs.promises.rename(
        this.backupFilePath(backupUuid),
        this.backupFilePath(uuid)
      );
    }
  }

  protected async performPatch(uuid: string) {
    this.patcher.patch(uuid, this.files);
  }

  protected async restoreBackup(backupFilePath: string) {
    if (fs.existsSync(backupFilePath)) {
      await fs.promises.unlink(this.baseFile);
      await fs.promises.copyFile(backupFilePath, this.baseFile);
    }
  }

  protected async deleteBackupFiles() {
    const htmlDirItems = fs.readdirSync(this.baseDir);
    for (const item of htmlDirItems) {
      if (item.endsWith(".bak-frosted-glass"))
        await fs.promises.unlink(path.join(this.baseDir, item));
    }
  }

  protected backupFilePath(uuid: string) {
    const ext = path.extname(this.baseFile);
    return path.join(
      this.baseDir,
      `${path.basename(this.baseFile, ext)}.${uuid}.bak-frosted-glass`
    );
  }
}
