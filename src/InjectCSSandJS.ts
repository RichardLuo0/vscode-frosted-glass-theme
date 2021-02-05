import path = require("path");
import fs = require("fs");
import { v4 } from "uuid";
import { window } from "vscode";
import { msg } from "./msg";
import File from "./File";

const appDir = require.main ? path.dirname(require.main.filename) : undefined;
if (appDir === undefined) throw new Error("appDir is not found");
const base = path.join(appDir, "vs", "code");
const htmlFile = path.join(
    base,
    "electron-browser",
    "workbench",
    "workbench.html"
);
const backupFilePath = (uuid: any) =>
    path.join(
        base,
        "electron-browser",
        "workbench",
        `workbench.${uuid}.bak-custom-css`
    );

export default class InjectCSSandJS {
    private imports: File[];

    constructor(imports: File[]) {
        this.imports = imports;
    }

    public inject() {
        this.deleteBackupFiles();
        const uuidSession = v4();
        const c = fs
            .createReadStream(htmlFile)
            .pipe(fs.createWriteStream(backupFilePath(uuidSession)));
        c.on("finish", () => this.performPatch(uuidSession));
    }

    public restore() {
        fs.stat(htmlFile, (errHtml, statsHtml) => {
            if (errHtml)
                return window.showInformationMessage(
                    msg.somethingWrong + errHtml
                );
            const backupUuid = this.getBackupUuid(htmlFile);
            if (!backupUuid) return this.uninstallComplete(true, false);

            const backupPath = backupFilePath(backupUuid);
            fs.stat(backupPath, (errBak, statsBak) => {
                if (errBak) {
                    this.uninstallComplete(true, false);
                } else {
                    this.restoreBak(backupPath, false);
                }
            });
        });
    }

    protected getBackupUuid(htmlFile: string) {
        const htmlContent = fs.readFileSync(htmlFile, "utf-8");
        const m = htmlContent.match(
            /<!-- !! VSCODE-FROSTED-GLASS-THEME-SESSION-ID ([0-9a-fA-F-]+) !! -->/
        );
        if (!m) return null;
        else return m[1];
    }

    protected performPatch(uuidSession: string) {
        let html = fs.readFileSync(htmlFile, "utf-8");
        html = this.clearExistingPatches(html);

        const injectHTML = this.computeInjectedHTML();

        html = html.replace(
            /(<\/html>)/,
            `<!-- !! VSCODE-FROSTED-GLASS-THEME-SESSION-ID ${uuidSession} !! -->\n` +
                "<!-- !! VSCODE-FROSTED-GLASS-THEME-START !! -->\n" +
                injectHTML +
                "<!-- !! VSCODE-FROSTED-GLASS-THEME-END !! -->\n</html>"
        );
        fs.writeFileSync(htmlFile, html, "utf-8");
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
        return this.imports.map(this.computeInjectedHTMLItem).join("");
    }

    protected computeInjectedHTMLItem(f: File) {
        if (!f) return "";
        let x = f.path;

        if (/^((file:.*\.js)|(data:.*javascript|js.*))$/.test(x))
            return '<script src="' + x + '"></script>\n';

        if (/^((file:.*\.css)|(data:.*css.*))$/.test(x))
            return '<link rel="stylesheet" href="' + x + '"/>\n';
    }

    protected uninstallComplete(succeeded: boolean, willReinstall: boolean) {
        if (!succeeded) return;
        if (willReinstall) {
            this.inject();
        } else {
            this.deleteBackupFiles();
        }
    }

    protected restoreBak(backupFilePath: string, willReinstall: boolean) {
        fs.unlink(htmlFile, (err) => {
            if (err) {
                window.showInformationMessage(msg.admin);
                return;
            }
            const c = fs
                .createReadStream(backupFilePath)
                .pipe(fs.createWriteStream(htmlFile));
            c.on("finish", () => {
                this.uninstallComplete(true, willReinstall);
            });
        });
    }

    protected deleteBackupFiles() {
        const htmlDir = path.dirname(htmlFile);
        const htmlDirItems = fs.readdirSync(htmlDir);
        for (const item of htmlDirItems) {
            if (item.endsWith(".bak-custom-css"))
                fs.unlinkSync(path.join(htmlDir, item));
        }
    }
}
