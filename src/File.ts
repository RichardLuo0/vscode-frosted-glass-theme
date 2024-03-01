import fs from "fs";
import { resolve } from "path";

export default class File {
  static editor = class {
    private content: string | null = null;

    constructor(private file: File) {}

    loadContent() {
      if (this.content === null)
        this.content = fs.readFileSync(this.file._path, "utf-8");
      return this;
    }

    replace(
      searchValue: {
        [Symbol.replace](string: string, replaceValue: string): string;
      },
      replaceValue: string
    ) {
      this.loadContent();
      this.content = this.content!.replace(searchValue, replaceValue);
      return this;
    }

    replaceAll(content: string) {
      this.content = content;
      return this;
    }

    apply() {
      if (this.content !== null)
        fs.writeFileSync(this.file._path, this.content, "utf-8");
      this.content = null;
    }
  };

  private _path: string;

  constructor(path: string) {
    this._path = resolve(path);
  }

  editor() {
    return new File.editor(this);
  }

  public get path(): string {
    return "file:///" + this._path;
  }
}
