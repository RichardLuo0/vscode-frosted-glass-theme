import fs = require("fs");
import { Uri, window, workspace } from "vscode";

export default class File {
    private _path;

    constructor(path: string) {
        this._path = path;
    }

    modify(
        searchValue: {
            [Symbol.replace](string: string, replaceValue: string): string;
        },
        replaceValue: string
    ) {
        let content = fs.readFileSync(this._path, "utf-8");
        fs.writeFileSync(
            this._path,
            content.replace(searchValue, replaceValue),
            "utf-8"
        );
    }

    openInVSCode() {
        workspace.openTextDocument(Uri.parse(this.path)).then(doc => {
            window.showTextDocument(doc);
        });
    }

    public get path(): string {
        return "file:///" + this._path;
    }
}
