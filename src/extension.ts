import { commands, ExtensionContext, window, workspace } from "vscode";
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

    function updateConfiguration() {
        let configureID: Record<string, RegExp> = {
            "frosted-glass-theme.backdropFilter": /(--backdrop-filter: ).*?;/,
            "frosted-glass-theme.backgroundColor": /(--background-color: ).*?;/,
            "frosted-glass-theme.transition": /(--transition: ).*?;/,
        };
        let configuration = workspace.getConfiguration();
        for (const key in configureID) {
            cssFile.modify(
                configureID[key],
                "$1" + configuration.get(key) + ";"
            );
        }
        jsFile.modify(
            /(let delay = ).*?;/,
            "$1" + configuration.get("frosted-glass-theme.jsDelay") + ";"
        );
    }

    let enableTheme = commands.registerCommand(
        "frosted-glass-theme.enableTheme",
        async () => {
            updateConfiguration();
            try {
                await injection.inject();
                window
                    .showInformationMessage(msg.applied, {
                        title: msg.restartIde,
                    })
                    .then(function (selection) {
                        if (
                            selection != undefined &&
                            selection.title == msg.restartIde
                        )
                            reloadWindow();
                    });
            } catch (e) {
                console.error(e);
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
                    .then(function (selection) {
                        if (
                            selection != undefined &&
                            selection.title == msg.restartIde
                        )
                            reloadWindow();
                    });
            } catch (e) {
                console.error(e);
            }
        }
    );

    let updateTheme = commands.registerCommand(
        "frosted-glass-theme.updateTheme",
        () => {
            updateConfiguration();
            window
                .showInformationMessage(msg.enabled, { title: msg.restartIde })
                .then(function (selection) {
                    if (
                        selection != undefined &&
                        selection.title == msg.restartIde
                    )
                        reloadWindow();
                });
        }
    );

    let openCSS = commands.registerCommand(
        "frosted-glass-theme.openCSS",
        () => {
            cssFile.openInVSCode();
        }
    );

    context.subscriptions.push(enableTheme);
    context.subscriptions.push(disableTheme);
    context.subscriptions.push(updateTheme);
    context.subscriptions.push(openCSS);
}

export function deactivate() {}
