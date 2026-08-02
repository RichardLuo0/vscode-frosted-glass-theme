import { readdir } from "fs/promises";
import path from "path";
import fs from "fs";
import { window } from "vscode";

export async function showChoiceMessage(
  message: string,
  yesOption: string
): Promise<boolean> {
  const selection = await window.showInformationMessage(message, {
    title: yesOption,
  });
  return selection != undefined && selection.title === yesOption;
}

export type AbsolutePath = {
  name: string;
  absPath: string;
};

export async function listFilesInDir(p: string, recursive?: boolean) {
  const pathList = await readdir(p, {
    recursive: recursive,
    withFileTypes: true,
  });
  return pathList
    .filter(p => p.isFile())
    .map(
      p =>
        <AbsolutePath>{
          name: p.name,
          absPath: path.join(p.parentPath, p.name).replaceAll("\\", "/"),
        }
    );
}

class FileEditor {
  private content: string | null = null;

  constructor(private file: File) {}

  private loadContent() {
    if (this.content === null)
      this.content = fs.readFileSync(this.file.path, "utf-8");
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
      fs.writeFileSync(this.file.path, this.content, "utf-8");
    this.content = null;
  }
}

export class File {
  public readonly path: string;

  constructor(pathname: string) {
    this.path = path.resolve(pathname);
  }

  editor() {
    return new FileEditor(this);
  }
}
