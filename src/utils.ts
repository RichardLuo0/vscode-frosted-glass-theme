import { readdir } from "fs/promises";
import path from "path";
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
