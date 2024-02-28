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
