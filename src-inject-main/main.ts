import { app } from "electron/main";
import { proxy } from "../common/proxy";

app.on("browser-window-created", (_, win) => {
  const updateMica = () => {
    win.webContents.send("vscode:update-mica");
  };

  win.on("move", updateMica);
  win.on("unmaximize", updateMica);
  win.on("restore", () => {
    // Delay 100ms otherwise screenX and screenY are not ready.
    setTimeout(updateMica, 100);
  });
});

// Allow auxiliary window listening to channel
app.on("web-contents-created", (_, contents) => {
  proxy(contents, "setWindowOpenHandler", (oldFunc, handler, ...args) => {
    oldFunc(
      (...args) => {
        const res = handler(...args);
        const webPreferences = res.overrideBrowserWindowOptions?.webPreferences;
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
