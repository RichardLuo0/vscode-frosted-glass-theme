import { app, BrowserWindow, screen } from "electron/main";
import { proxy } from "../common/proxy";
import config from "../config/config.json" with { type: "json" };

if (config.fakeMica.enabled) {
  app.once("ready", () => {
    screen.on("display-metrics-changed", () => {
      for (const win of BrowserWindow.getAllWindows()) {
        win.webContents.send("vscode:update-mica");
      }
    });
  });

  if (config.fakeMica.moveWithWindow) {
    app.on("browser-window-created", (_, win) => {
      const updateMica = () => {
        if (win.isVisible()) win.webContents.send("vscode:update-mica");
      };

      win.on("move", updateMica);
      win.on("unmaximize", updateMica);
    });

    // Allow auxiliary window listening to channel
    app.on("web-contents-created", (_, contents) => {
      proxy(contents, "setWindowOpenHandler", (oldFunc, handler, ...args) => {
        oldFunc(
          (...args) => {
            const res = handler(...args);
            const webPreferences =
              res.overrideBrowserWindowOptions?.webPreferences;
            if (webPreferences)
              webPreferences.preload = webPreferences.preload?.replace(
                /preload-aux.js$/,
                "preload.js"
              );
            return res;
          },
          ...args
        );
      });
    });
  }
}
