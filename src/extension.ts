import fs from "fs";
import { readFile } from "fs/promises";
import { resolve } from "path";
import { commands, ExtensionContext, Uri, window, workspace } from "vscode";
import { generateThemeMod as generateThemeModFunc } from "./generateThemeMod";
import { localize } from "./localization";
import { setup as setupFunc } from "./setup";
import ThemeInjection from "./ThemeInjection";
import { showChoiceMessage } from "./utils";

class File {
  static editor = class {
    private content: string | null = null;

    constructor(private file: File) {}

    loadContent() {
      if (this.content === null)
        this.content = fs.readFileSync(this.file.path, "utf-8");
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
        fs.writeFileSync(this.file.path, this.content, "utf-8");
      this.content = null;
    }
  };

  public readonly path: string;

  constructor(path: string) {
    this.path = resolve(path);
  }

  editor() {
    return new File.editor(this);
  }
}

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

  const setup = commands.registerCommand(
    "frosted-glass-theme.setup",
    async () => {
      blockConfigChangedMsg = true;
      if (await setupFunc()) updateConfiguration();
      blockConfigChangedMsg = false;
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

  let blockConfigChangedMsg = false;
  const onConfigureChanged = workspace.onDidChangeConfiguration(async e => {
    if (
      !blockConfigChangedMsg &&
      e.affectsConfiguration("frosted-glass-theme")
    ) {
      blockConfigChangedMsg = true;
      if (
        await showChoiceMessage(
          localize("configChanged"),
          localize("applyChanges")
        )
      ) {
        commands.executeCommand("frosted-glass-theme.applyConfig");
      }
      blockConfigChangedMsg = false;
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
    onConfigureChanged
  );
}

export function deactivate() {}
