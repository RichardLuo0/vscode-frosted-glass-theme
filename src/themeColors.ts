import { readFile } from "fs/promises";
import path from "path";
import { extensions, workspace } from "vscode";

type ThemeContribution = {
  id?: string;
  label: string;
  path: string;
};

async function readThemeColorsFromFile(
  themePath: string
): Promise<Record<string, string>> {
  const content = JSON.parse(await readFile(themePath, "utf-8")) as {
    include?: string;
    colors?: Record<string, string>;
  };

  let colors: Record<string, string> = {};
  if (content.include) {
    colors = await readThemeColorsFromFile(
      path.resolve(path.dirname(themePath), content.include)
    );
  }
  if (content.colors) {
    colors = { ...colors, ...content.colors };
  }
  return colors;
}

function findThemeContribution(themeLabel: string) {
  for (const ext of extensions.all) {
    const themes = ext.packageJSON.contributes?.themes as
      | ThemeContribution[]
      | undefined;
    if (!themes) continue;
    for (const theme of themes) {
      if (theme.label === themeLabel || theme.id === themeLabel) {
        return {
          themePath: path.join(ext.extensionPath, theme.path),
        };
      }
    }
  }
}

function getFlatColorCustomizations(): Record<string, string> {
  const raw =
    workspace
      .getConfiguration("workbench")
      .get<Record<string, unknown>>("colorCustomizations") ?? {};
  const colors: Record<string, string> = {};

  for (const [key, value] of Object.entries(raw)) {
    if (
      key.startsWith("[") &&
      value &&
      typeof value === "object" &&
      !Array.isArray(value)
    ) {
      for (const [colorKey, colorValue] of Object.entries(
        value as Record<string, unknown>
      )) {
        if (typeof colorValue === "string") colors[colorKey] = colorValue;
      }
    } else if (typeof value === "string") {
      colors[key] = value;
    }
  }

  return colors;
}

/** Read active theme workbench colors without `generateColorTheme` (avoids Cursor freeze). */
export async function resolveActiveThemeColors(): Promise<
  Record<string, string | undefined> | undefined
> {
  const customizations = getFlatColorCustomizations();
  const themeLabel = workspace
    .getConfiguration("workbench")
    .get<string>("colorTheme");

  const contribution = themeLabel
    ? findThemeContribution(themeLabel)
    : undefined;

  if (contribution) {
    const baseColors = await readThemeColorsFromFile(contribution.themePath);
    return { ...baseColors, ...customizations };
  }

  if (Object.keys(customizations).length > 0) {
    return customizations;
  }

  return undefined;
}
