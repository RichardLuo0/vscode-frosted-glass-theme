import path from "path";
import {
  commands,
  ConfigurationTarget,
  env,
  ExtensionContext,
  Uri,
  window,
  workspace,
} from "vscode";
import { generateThemeMod as generateThemeModFunc } from "./generateThemeMod";
import { localize } from "./localization";
import { setup as setupFunc } from "./setup";
import ThemeInjection from "./ThemeInjection";
import { File, showChoiceMessage } from "./utils";

export function activate(context: ExtensionContext) {
  const injection = new ThemeInjection(
    [context.asAbsolutePath("inject/vscode-frosted-glass-theme.js")],
    [context.asAbsolutePath("inject/vscode-frosted-glass-theme-main.mjs")]
  );

  const currentVersion: string =
    context.extension.packageJSON.version ?? "0.0.0";
  const lastVersion = context.globalState.get("extensionVersion");
  if (currentVersion !== lastVersion) {
    context.globalState.update("extensionVersion", currentVersion);
    if (context.globalState.get<boolean>("injected")) {
      window.showInformationMessage(localize("extension.reenableAfterUpdated"));
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
          {
            $schema: "./config.schema.json",
            ...workspace.getConfiguration().get("frosted-glass-theme"),
          },
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
        if (context.globalState.get<boolean>("firstTimeSetup", true)) {
          await commands.executeCommand("frosted-glass-theme.setup");
          context.globalState.update("firstTimeSetup", false);
        } else updateConfiguration();
        await injection.inject();
        context.globalState.update("injected", true);
        if (
          await showChoiceMessage(
            localize("extension.enabled"),
            localize("extension.action.restartIde")
          )
        )
          reloadWindow();
      } catch (e: any) {
        console.error(e);
        window.showErrorMessage(localize("extension.somethingWrong", e));
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
          await showChoiceMessage(
            localize("extension.disabled"),
            localize("extension.action.restartIde")
          )
        )
          reloadWindow();
      } catch (e: any) {
        console.error(e);
        window.showErrorMessage(localize("extension.somethingWrong", e));
      }
    }
  );

  const applyConfig = commands.registerCommand(
    "frosted-glass-theme.applyConfig",
    async () => {
      try {
        updateConfiguration();
        if (
          await showChoiceMessage(
            localize("extension.applied"),
            localize("extension.action.restartIde")
          )
        )
          reloadWindow();
      } catch (e: any) {
        console.error(e);
        window.showErrorMessage(localize("extension.somethingWrong", e));
      }
    }
  );

  const setup = commands.registerCommand(
    "frosted-glass-theme.setup",
    async () => {
      try {
        blockConfigChangedMsg = true;
        if (await setupFunc()) updateConfiguration();
      } finally {
        blockConfigChangedMsg = false;
      }
    }
  );

  const openCSS = commands.registerCommand("frosted-glass-theme.openCSS", () =>
    workspace
      .openTextDocument(
        Uri.joinPath(
          context.extensionUri,
          "inject/vscode-frosted-glass-theme.css"
        )
      )
      .then(window.showTextDocument)
  );

  const openConfig = commands.registerCommand(
    "frosted-glass-theme.openConfig",
    async () =>
      workspace
        .openTextDocument(
          Uri.joinPath(context.extensionUri, "inject/config.json")
        )
        .then(window.showTextDocument)
  );

  const generateThemeMod = commands.registerCommand(
    "frosted-glass-theme.generateThemeMod",
    generateThemeModFunc
  );

  const enableExtensionWebviewPatch = commands.registerCommand(
    "frosted-glass-theme.enableExtensionWebviewPatch",
    async () => {
      if (
        await showChoiceMessage(
          localize("extensionWebviewPatch.warning"),
          localize("common.yes")
        )
      ) {
        new File(path.join(env.appRoot, "out", "main.js"))
          .editor()
          .replace(
            /(webPreferences\s*:\s*\{)(?!\s*webSecurity)/,
            `$1webSecurity: false,`
          )
          .apply();

        try {
          blockConfigChangedMsg = true;
          const fgtConf = workspace.getConfiguration();
          const currentPatches = fgtConf.inspect(
            "frosted-glass-theme.extensionWebviewPatch"
          )?.globalValue as string[] | undefined;
          if (!currentPatches || currentPatches.length === 0)
            await fgtConf.update(
              "frosted-glass-theme.extensionWebviewPatch",
              [
                "GitHub.vscode-pull-request-github",
                "mhutchie.git-graph",
                "eamodio.gitlens",
              ],
              ConfigurationTarget.Global
            );
          commands.executeCommand("frosted-glass-theme.applyConfig");
        } finally {
          blockConfigChangedMsg = true;
        }
      }
    }
  );

  let blockConfigChangedMsg = false;
  const onConfigureChanged = workspace.onDidChangeConfiguration(async e => {
    if (
      !blockConfigChangedMsg &&
      e.affectsConfiguration("frosted-glass-theme")
    ) {
      try {
        blockConfigChangedMsg = true;
        if (
          await showChoiceMessage(
            localize("extension.configChanged"),
            localize("extension.action.applyChanges")
          )
        ) {
          commands.executeCommand("frosted-glass-theme.applyConfig");
        }
      } finally {
        blockConfigChangedMsg = false;
      }
    }
  });

  context.subscriptions.push(
    enableTheme,
    disableTheme,
    applyConfig,
    setup,
    openCSS,
    openConfig,
    generateThemeMod,
    enableExtensionWebviewPatch,
    onConfigureChanged
  );
}

export function deactivate() {}
