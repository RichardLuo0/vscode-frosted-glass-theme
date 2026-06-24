import { env } from "vscode";

export type HostId = "cursor" | "vscode";

export function getHostId(): HostId {
  return env.appName.toLowerCase().includes("cursor") ? "cursor" : "vscode";
}

export function isCursor(): boolean {
  return getHostId() === "cursor";
}

export function applyCursorMicaInjectDefaults(
  settings: Record<string, unknown>
): void {
  const fakeMica = settings.fakeMica as
    | { enabled?: boolean; filter?: string }
    | undefined;
  if (!isCursor() || !fakeMica?.enabled) return;

  const additionalStyle = settings.additionalStyle as string[] | undefined;
  if (!additionalStyle?.length) {
    settings.additionalStyle = [
      "./cursor-chat.css",
      "./cursor-agent-sidebar.css",
      "./cursor-sidebar-iconbar.css",
      "./cursor-hide-corrupt-notification.css",
    ];
  }

  settings.variableDark = {
    ...(settings.variableDark as object),
    "fgt-mica-filter": "brightness(85%) saturate(125%)",
    "fgt-luminosity-opacity": "30%",
  };
  settings.variable = {
    ...(settings.variable as object),
    "fgt-luminosity-opacity": "30%",
  };
  fakeMica.filter =
    "saturate(var(--fgt-saturate)) blur(6px) var(--fgt-mica-filter)";
}
