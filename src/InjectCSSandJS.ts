import path = require("path");
import fs = require("fs");
import Url = require("url");
import { v4 } from "uuid";
import { window } from "vscode";
import { msg } from "./msg";
import File from "./File";

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
let backupFilePath = (uuid: string) =>
    path.join(base, `workbench.${uuid}.bak-frosted-glass`);

export default class InjectCSSandJS {
    private imports: File[];

    constructor(imports: File[]) {
        this.imports = imports;
    }

    public async inject() {
        const uuidSession = v4();
        await this.createBackup(uuidSession);
        await this.performPatch(uuidSession);
    }

    public async restore() {
        const backupUuid = await this.getBackupUuid();
        if (!backupUuid) return;
        const backupPath = backupFilePath(backupUuid);
        await this.restoreBackup(backupPath);
        await this.deleteBackupFiles();
    }

    protected async getBackupUuid() {
        if (fs.existsSync(htmlFile)) {
            const htmlContent = await fs.promises.readFile(htmlFile, "utf-8");
            const m = htmlContent.match(
                /<!-- !! VSCODE-FROSTED-GLASS-THEME-SESSION-ID ([0-9a-fA-F-]+) !! -->/
            );
            if (!m) return null;
            else return m[1];
        }
    }

    protected async createBackup(uuidSession: string) {
        try {
            const backupUuid = await this.getBackupUuid();
            if (!backupUuid)
                await fs.promises.copyFile(
                    htmlFile,
                    backupFilePath(uuidSession)
                );
            else {
                fs.promises.rename(
                    backupFilePath(backupUuid),
                    backupFilePath(uuidSession)
                );
            }
        } catch (e) {
            window.showInformationMessage(msg.admin);
            throw e;
        }
    }

    protected async performPatch(uuidSession: string) {
        let html = fs.readFileSync(htmlFile, "utf-8");
        html = this.clearExistingPatches(html);

        let injectHTML;
        try {
            injectHTML = await this.computeInjectedHTML();
        } catch (e) {
            window.showWarningMessage(msg.somethingWrong + e);
            throw e;
        }

        html = html.replace(
            /(<\/html>)/,
            `<!-- !! VSCODE-FROSTED-GLASS-THEME-SESSION-ID ${uuidSession} !! -->\n` +
                "<!-- !! VSCODE-FROSTED-GLASS-THEME-START !! -->\n" +
                injectHTML +
                "<!-- !! VSCODE-FROSTED-GLASS-THEME-END !! -->\n</html>"
        );
        try {
            await fs.promises.writeFile(htmlFile, html, "utf-8");
        } catch (e) {
            window.showInformationMessage(msg.admin);
            throw e;
        }
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

    protected async computeInjectedHTML() {
        let res = "";
        for (const item of this.imports) {
            const imp = await this.computeInjectedHTMLItem(item);
            if (imp) res += imp;
        }
        return res;
    }

    protected async computeInjectedHTMLItem(f: File) {
        if (!f) return "";
        let url = f.path;

        let parsed = new Url.URL(url);
        const ext = path.extname(parsed.pathname);

        url = url
            .replace("file:///", "vscode-file://vscode-app/")
            .replace(/\\/g, "/");

        switch (ext) {
            case ".js":
                return `<script src="${url}"></script>\n`;
            case ".css":
                return `<link rel="stylesheet" href="${url}"/>\n`;
            default:
                break;
        }
    }

    protected async restoreBackup(backupFilePath: string) {
        if (fs.existsSync(backupFilePath)) {
            await fs.promises.unlink(htmlFile);
            await fs.promises.copyFile(backupFilePath, htmlFile);
        }
    }

    protected async deleteBackupFiles() {
        const htmlDir = path.dirname(htmlFile);
        const htmlDirItems = fs.readdirSync(htmlDir);
        for (const item of htmlDirItems) {
            if (item.endsWith(".bak-frosted-glass"))
                await fs.promises.unlink(path.join(htmlDir, item));
        }
    }
}
