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
    let cssFile = new File(
        path.resolve(`${__dirname}/../inject/vscode-frosted-glass-theme.css`)
    );
    let jsFile = new File(
        path.resolve(`${__dirname}/../inject/vscode-frosted-glass-theme.js`)
    );
    let injection = new InjectCSSandJS([cssFile, jsFile]);

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
        let configuration = workspace.getConfiguration();
        cssFile
            .editor()
            .replace(
                /(--backdrop-filter: ).*?;/,
                "$1" +
                    configuration.get(
                        "frosted-glass-theme.backdropFilter",
                        ""
                    ) +
                    ";"
            )
            .replace(
                /(--transition: ).*?;/,
                "$1" +
                    configuration.get("frosted-glass-theme.transition", "") +
                    ";"
            )
            .replace(
                /(--background-color: ).*?;/,
                "$1" + generateBackgroundColor(configuration) + ";"
            )
            .apply();
    }

    let enableTheme = commands.registerCommand(
        "frosted-glass-theme.enableTheme",
        async () => {
            try {
                updateConfiguration();
                await injection.inject();
                window
                    .showInformationMessage(msg.enabled, {
                        title: msg.restartIde,
                    })
                    .then((selection) => {
                        if (
                            selection != undefined &&
                            selection.title === msg.restartIde
                        )
                            reloadWindow();
                    });
            } catch (e) {
                console.error(e);
                window.showErrorMessage(msg.somethingWrong + e);
            }
        }
    );

    let disableTheme = commands.registerCommand(
        "frosted-glass-theme.disableTheme",
        async () => {
            try {
                await injection.restore();
                window
                    .showInformationMessage(msg.disabled, {
                        title: msg.restartIde,
                    })
                    .then((selection) => {
                        if (
                            selection != undefined &&
                            selection.title === msg.restartIde
                        )
                            reloadWindow();
                    });
            } catch (e) {
                console.error(e);
                window.showErrorMessage(msg.somethingWrong + e);
            }
        }
    );

    let applyConfig = commands.registerCommand(
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

    let openCSS = commands.registerCommand("frosted-glass-theme.openCSS", () =>
        cssFile.openInVSCode()
    );

    context.subscriptions.push(enableTheme);
    context.subscriptions.push(disableTheme);
    context.subscriptions.push(applyConfig);
    context.subscriptions.push(openCSS);
}

export function deactivate() {}
