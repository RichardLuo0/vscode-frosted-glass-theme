import { readFile } from "fs/promises";
import { commands, ExtensionContext, Uri, window, workspace } from "vscode";
import File from "./File";
import Injection from "./Injection";
import { localize } from "./localization";
import { showChoiceMessage } from "./utils";

export function activate(context: ExtensionContext) {
  const jsFile = new File(
    context.asAbsolutePath("inject/vscode-frosted-glass-theme.js")
  );
  const injection = new Injection([jsFile]);

  const currentVersion: string =
    context.extension.packageJSON.version ?? "0.0.0";
  const lastVersion = context.globalState.get("extensionVersion");
  if (currentVersion !== lastVersion) {
    context.globalState.update("extensionVersion", currentVersion);
    if (context.globalState.get<boolean>("injected")) {
      window.showInformationMessage(localize("reenableAfterUpdated"));
      commands.executeCommand("frosted-glass-theme.enableTheme");
    }
  }

  function reloadWindow() {
    commands.executeCommand("workbench.action.reloadWindow");
  }

  function updateConfiguration() {
    new File(context.asAbsolutePath("inject/config.json"))
      .editor()
      .replaceAll(
        JSON.stringify(
          workspace.getConfiguration().get("frosted-glass-theme"),
          null,
          2
        )
      )
      .apply();
  }

  const enableTheme = commands.registerCommand(
    "frosted-glass-theme.enableTheme",
    async () => {
      try {
        updateConfiguration();
        await injection.inject();
        context.globalState.update("injected", true);
        if (
          await showChoiceMessage(localize("enabled"), localize("restartIde"))
        )
          reloadWindow();
      } catch (e: any) {
        console.error(e);
        window.showErrorMessage(localize("somethingWrong", e));
      }
    }
  );

  const disableTheme = commands.registerCommand(
    "frosted-glass-theme.disableTheme",
    async () => {
      try {
        await injection.restore();
        context.globalState.update("injected", false);
        if (
          await showChoiceMessage(localize("disabled"), localize("restartIde"))
        )
          reloadWindow();
      } catch (e: any) {
        console.error(e);
        window.showErrorMessage(localize("somethingWrong", e));
      }
    }
  );

  const applyConfig = commands.registerCommand(
    "frosted-glass-theme.applyConfig",
    async () => {
      try {
        updateConfiguration();
        if (
          await showChoiceMessage(localize("applied"), localize("restartIde"))
        )
          reloadWindow();
      } catch (e: any) {
        console.error(e);
        window.showErrorMessage(localize("somethingWrong", e));
      }
    }
  );

  const openCSS = commands.registerCommand("frosted-glass-theme.openCSS", () =>
    workspace
      .openTextDocument(
        Uri.parse(
          new File(`${__dirname}/../inject/vscode-frosted-glass-theme.css`).path
        )
      )
      .then(window.showTextDocument)
  );

  const openJS = commands.registerCommand("frosted-glass-theme.openJS", () =>
    workspace
      .openTextDocument(Uri.parse(jsFile.path))
      .then(window.showTextDocument)
  );

  const openConfig = commands.registerCommand(
    "frosted-glass-theme.openConfig",
    async () =>
      workspace
        .openTextDocument({
          content: await readFile(
            `${__dirname}/../inject/config.json`,
            "utf-8"
          ),
          language: "json",
        })
        .then(window.showTextDocument)
  );

  let isConfigChangedShowing = false;
  const onConfigureChanged = workspace.onDidChangeConfiguration(async (e) => {
    if (
      !isConfigChangedShowing &&
      e.affectsConfiguration("frosted-glass-theme")
    ) {
      isConfigChangedShowing = true;
      if (
        await showChoiceMessage(
          localize("configChanged"),
          localize("applyChanges")
        )
      ) {
        commands.executeCommand("frosted-glass-theme.applyConfig");
      }
      isConfigChangedShowing = false;
    }
  });

  context.subscriptions.push(
    enableTheme,
    disableTheme,
    applyConfig,
    openCSS,
    openJS,
    openConfig,
    onConfigureChanged
  );
}

export function deactivate() {}
