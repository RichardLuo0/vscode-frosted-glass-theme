import { BrowserWindow } from "electron";
import { proxy, useArgs } from "../common/proxy";

proxy(
  BrowserWindow.prototype,
  "loadURL",
  useArgs(function () {
    const updateMica = () => {
      this.webContents.send("vscode:update-mica");
    };
    this.on("move", updateMica);
    this.on("unmaximize", updateMica);
    this.on("restore", () => {
      // Delay 100ms otherwise screenX and screenY are not ready.
      setTimeout(updateMica, 100);
    });
  })
);
