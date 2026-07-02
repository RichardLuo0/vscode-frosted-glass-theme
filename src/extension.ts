import fs from "fs";
import { readFile } from "fs/promises";
import { resolve } from "path";
import { commands, ExtensionContext, Uri, window, workspace } from "vscode";
import { resolveFakeMicaUrlForInject } from "./fakeMicaUrl";
import { generateThemeMod as generateThemeModFunc } from "./generateThemeMod";
import { applyCursorInjectDefaults, getHostId, isCursor } from "./host";
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

  function restartHost() {
    if (isCursor()) commands.executeCommand("workbench.action.quit");
    else commands.executeCommand("workbench.action.reloadWindow");
  }

  function restartPromptMessage() {
    return isCursor() ? localize("restartIdeCursor") : localize("restartIde");
  }

  function enabledMessage() {
    return isCursor() ? localize("enabledCursor") : localize("enabled");
  }

  function appliedMessage() {
    return isCursor() ? localize("appliedCursor") : localize("applied");
  }

  async function updateConfiguration() {
    const configPath = context.asAbsolutePath("inject/config.json");
    const fgtConfig = workspace.getConfiguration("frosted-glass-theme");
    const fgtSettings = JSON.parse(
      JSON.stringify(
        workspace
          .getConfiguration()
          .get<Record<string, unknown>>("frosted-glass-theme") ?? {}
      )
    ) as Record<string, any>;

    const fakeMica = fgtSettings.fakeMica as
      | { enabled?: boolean; url?: string }
      | undefined;
    if (fakeMica?.enabled && fakeMica.url) {
      fakeMica.url = await resolveFakeMicaUrlForInject(
        fakeMica.url,
        context.asAbsolutePath("inject")
      );
    }
    applyCursorInjectDefaults(fgtSettings, fgtConfig);

    let schema = "./config.schema.json";
    try {
      const existing = JSON.parse(await readFile(configPath, "utf-8")) as {
        $schema?: string;
      };
      if (existing.$schema) schema = existing.$schema;
    } catch {
      // use default schema path
    }

    new File(configPath)
      .editor()
      .replaceAll(
        JSON.stringify(
          {
            $schema: schema,
            ...fgtSettings,
            runtime: { host: getHostId() },
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
        } else await updateConfiguration();
        await injection.inject();
        context.globalState.update("injected", true);
        if (await showChoiceMessage(enabledMessage(), restartPromptMessage()))
          restartHost();
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
          await showChoiceMessage(localize("disabled"), restartPromptMessage())
        )
          restartHost();
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
        await updateConfiguration();
        if (
          await showChoiceMessage(appliedMessage(), restartPromptMessage())
        )
          restartHost();
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
      if (await setupFunc(context)) await updateConfiguration();
      blockConfigChangedMsg = false;
    }
  );

  const openCSS = commands.registerCommand("frosted-glass-theme.openCSS", async () => {
    const cssPath = isCursor()
      ? (
          await window.showQuickPick(
            [
              {
                label: "Cursor targeted overrides",
                description: "Panel backgrounds, chat menus, quit dialog",
                path: "inject/cursor-targeted-overrides.css",
              },
              {
                label: "Shared inject styles",
                description: "Notifications, menus, and shared frosted surfaces",
                path: "src-inject/vscode-frosted-glass-theme.css",
              },
            ],
            { title: "Frosted Glass Theme: Open CSS" }
          )
        )?.path ?? "inject/cursor-targeted-overrides.css"
      : "inject/vscode-frosted-glass-theme.css";
    return workspace
      .openTextDocument(Uri.joinPath(context.extensionUri, cssPath))
      .then(window.showTextDocument);
  });

  const openConfig = commands.registerCommand(
    "frosted-glass-theme.openConfig",
    async () =>
      workspace
        .openTextDocument({
          content: await readFile(
            context.asAbsolutePath("inject/config.json"),
            "utf-8"
          ),
          language: "json",
        })
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
