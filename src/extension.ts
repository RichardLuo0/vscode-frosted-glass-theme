import {
  commands,
  ExtensionContext,
  window,
  workspace,
  WorkspaceConfiguration,
} from "vscode";
import InjectCSSandJS from "./InjectCSSandJS";
import { msg } from "./msg";
import path = require("path");
import File from "./File";

export function activate(context: ExtensionContext) {
  const cssFile = new File(
    path.resolve(`${__dirname}/../inject/vscode-frosted-glass-theme.css`)
  );
  const jsFile = new File(
    path.resolve(`${__dirname}/../inject/vscode-frosted-glass-theme.js`)
  );
  const injection = new InjectCSSandJS([cssFile, jsFile]);

  function reloadWindow() {
    commands.executeCommand("workbench.action.reloadWindow");
  }

  function generateBackgroundColor(
    configuration: WorkspaceConfiguration
  ): string {
    const backgroundColor = configuration.get<string>(
      "frosted-glass-theme.backgroundColor",
      ""
    );
    const backgroundOpacity = configuration.get<number>(
      "frosted-glass-theme.backgroundOpacity",
      0.4
    );
    jsFile
      .editor()
      .replace(
        /(const useThemeColor = ).*?;/,
        "$1" + (backgroundColor.length === 0) + ";"
      )
      .replace(/(const opacity = ).*?;/, "$1" + backgroundOpacity + ";")
      .apply();
    return backgroundColor;
  }

  function updateConfiguration() {
    const configuration = workspace.getConfiguration();
    cssFile
      .editor()
      .replace(
        /(--backdrop-filter: ).*?;/,
        "$1" + configuration.get("frosted-glass-theme.backdropFilter", "") + ";"
      )
      .replace(
        /(--transition: ).*?;/,
        "$1" + configuration.get("frosted-glass-theme.transition", "") + ";"
      )
      .replace(
        /(--background-color: ).*?;/,
        "$1" + generateBackgroundColor(configuration) + ";"
      )
      .apply();
  }

  const enableTheme = commands.registerCommand(
    "frosted-glass-theme.enableTheme",
    async () => {
      try {
        updateConfiguration();
        await injection.inject();
        const selection = await window.showInformationMessage(msg.enabled, {
          title: msg.restartIde,
        });
        if (selection != undefined && selection.title === msg.restartIde)
          reloadWindow();
      } catch (e) {
        console.error(e);
        window.showErrorMessage(msg.somethingWrong + e);
      }
    }
  );

  const disableTheme = commands.registerCommand(
    "frosted-glass-theme.disableTheme",
    async () => {
      try {
        await injection.restore();
        const selection = await window.showInformationMessage(msg.disabled, {
          title: msg.restartIde,
        });
        if (selection != undefined && selection.title === msg.restartIde)
          reloadWindow();
      } catch (e) {
        console.error(e);
        window.showErrorMessage(msg.somethingWrong + e);
      }
    }
  );

  const applyConfig = commands.registerCommand(
    "frosted-glass-theme.applyConfig",
    () => {
      try {
        updateConfiguration();
        window.showInformationMessage(msg.applied);
      } catch (e) {
        console.error(e);
        window.showErrorMessage(msg.somethingWrong + e);
      }
    }
  );

  const openCSS = commands.registerCommand("frosted-glass-theme.openCSS", () =>
    cssFile.openInVSCode()
  );

  let isConfigChangedShowing = false;
  const onConfigureChanged = workspace.onDidChangeConfiguration(async (e) => {
    if (
      !isConfigChangedShowing &&
      e.affectsConfiguration("frosted-glass-theme")
    ) {
      isConfigChangedShowing = true;
      const selection = await window.showInformationMessage(msg.configChanged, {
        title: msg.applyChanges,
      });
      isConfigChangedShowing = false;
      if (selection != undefined && selection.title === msg.applyChanges) {
        try {
          updateConfiguration();
          window.showInformationMessage(msg.applied);
        } catch (e) {
          console.error(e);
          window.showErrorMessage(msg.somethingWrong + e);
        }
      }
    }
  });

  context.subscriptions.push(
    enableTheme,
    disableTheme,
    applyConfig,
    openCSS,
    onConfigureChanged
  );
}

export function deactivate() {}
