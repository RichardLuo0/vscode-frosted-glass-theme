import config from "../../config/config.json" with { type: "json" };

export function resolveFakeMicaBackgroundUrl(url: string): string {
  if (url.startsWith("data:") || url.startsWith("vscode-file:")) return url;

  if (!/^[a-zA-Z]:/.test(url) && !url.startsWith("/")) {
    return new URL(url, import.meta.url).href;
  }

  const host = (config as { runtime?: { host?: string } }).runtime?.host;
  if (host === "cursor") return url;

  return `vscode-file://vscode-app/${url}`;
}
