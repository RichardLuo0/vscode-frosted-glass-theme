import fs from "fs/promises";
import path from "path";
import { window } from "vscode";
import { isCursor } from "./host";

export function injectWallpaperName(sourcePath: string): string {
  const ext = path.extname(sourcePath).toLowerCase();
  return `wallpaper${ext || ".jpg"}`;
}

function isLocalImagePath(url: string): boolean {
  if (
    !url ||
    url.startsWith("data:") ||
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("vscode-file:") ||
    url.startsWith("wallpaper.")
  ) {
    return false;
  }
  return /^([a-zA-Z]:[\\/]|\/)/.test(url);
}

export async function resolveFakeMicaUrlForInject(
  url: string,
  injectDir: string
): Promise<string> {
  if (url.startsWith("data:")) return url;
  if (url.startsWith("wallpaper.")) return url;
  if (!isCursor() || !isLocalImagePath(url)) return url;

  const destName = injectWallpaperName(url);
  try {
    await fs.copyFile(url, path.join(injectDir, destName));
    return destName;
  } catch (e) {
    console.error(e);
    window.showWarningMessage(
      `Frosted Glass Theme: failed to copy wallpaper from ${url}. Using path as-is.`
    );
    return url;
  }
}
