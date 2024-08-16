import { readFile } from "fs/promises";
import {
  ExtensionContext,
  QuickPickItem,
  window,
  workspace,
  WorkspaceConfiguration,
} from "vscode";
import { AbsolutePath, listFilesInDir } from "./utils";
import { localize } from "./localization";
import path from "path";

function applyThemeMod(
  fgtConfig: WorkspaceConfiguration,
  themeMod: { [key: string]: any }
) {
  const prefix = "frosted-glass-theme.";
  for (const key in themeMod) {
    if (key.startsWith(prefix))
      fgtConfig.update(key.substring(prefix.length), themeMod[key], true);
  }
  const colorCustomizationsMod = themeMod["workbench.colorCustomizations"];
  const workbench = workspace.getConfiguration("workbench");
  workbench.update(
    "colorCustomizations",
    Object.assign(
      workbench.get<object>("colorCustomizations") ?? {},
      colorCustomizationsMod
    ),
    true
  );
}

async function chooseWallpaper(fgtConfig: WorkspaceConfiguration) {
  const loadWallpaperItems = async () => {
    type WallpaperItem = QuickPickItem & { _path?: string };
    const items: WallpaperItem[] = [
      {
        label: "Custom",
        detail: "Type it you self.",
      },
    ];
    const promiseList: Promise<WallpaperItem[]>[] = [];
    const imgTypes = new Set([".jpg", ".jpeg", ".webp"]);
    const mapWallpaperItem = (pathList: AbsolutePath[]) =>
      pathList
        .filter(p => imgTypes.has(path.extname(p.name)))
        .map(p => ({
          label: p.name,
          detail: p.absPath,
          _path: p.absPath,
        }));
    if (process.platform == "win32") {
      promiseList.push(
        listFilesInDir(
          `C:/Users/${process.env.USERNAME}/AppData/Roaming/Microsoft/Windows/Themes/CachedFiles`
        ).then(pathList =>
          pathList.map(p => ({
            label: "Windows Spotlight",
            detail: p.absPath,
            _path: p.absPath,
          }))
        )
      );
      promiseList.push(
        listFilesInDir("C:/Windows/Web/Wallpaper", true).then(mapWallpaperItem)
      );
    } else {
      promiseList.push(
        listFilesInDir("/usr/share/backgrounds", true).then(mapWallpaperItem)
      );
    }
    items.push(
      ...(await Promise.allSettled(promiseList))
        .filter(result => result.status == "fulfilled")
        .map(result => result.value)
        .flat()
    );
    return items;
  };
  const wallpaper = await window.showQuickPick(loadWallpaperItems(), {
    title: localize("setup.chooseWallpaper"),
  });
  const url =
    wallpaper?._path ??
    (await window.showInputBox({ title: localize("setup.inputWallpaper") }));
  if (url) fgtConfig.update("fakeMica.url", url, true);
}

async function chooseThemeMod(
  context: ExtensionContext,
  fgtConfig: WorkspaceConfiguration
) {
  const useCurrent: QuickPickItem & { _path?: string } = {
    label: "Use current theme",
    detail: "No change, you need to modify `colorCustomizations` yourself.",
  };
  const themeModItem = await window.showQuickPick(
    listFilesInDir(context.asAbsolutePath("theme")).then(
      pathList => [
        useCurrent,
        ...pathList.map(p => ({
          label: p.name,
          detail: p.absPath,
          _path: p.absPath,
        })),
      ],
      () => [useCurrent]
    ),
    {
      title: localize("setup.chooseThemeMod"),
    }
  );
  if (themeModItem?._path) {
    applyThemeMod(
      fgtConfig,
      JSON.parse(await readFile(themeModItem._path, "utf-8"))
    );
  }
}

export async function setup(context: ExtensionContext) {
  const fgtConfig = workspace.getConfiguration("frosted-glass-theme");
  const select = await window.showQuickPick(["Yes", "No"], {
    title: localize("setup.enableMica"),
  });
  if (select != "Yes") return false;
  fgtConfig.update("fakeMica.enabled", true, true);

  await chooseWallpaper(fgtConfig);
  await chooseThemeMod(context, fgtConfig);

  window.showInformationMessage(localize("setup.complete"));
  return true;
}
