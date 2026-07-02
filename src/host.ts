import { env, WorkspaceConfiguration } from "vscode";

export type HostId = "cursor" | "vscode";

/** Settings key for Cursor-only blur/background tunables (nested under frosted-glass-theme). */
export const CURSOR_TARGETED_OVERRIDES_KEY = "cursor.targetted.overrides";

/** Settings key for editable acrylic blur on shared frosted surfaces (Cursor). */
export const CURSOR_ADDITIONAL_STYLE_KEY = "cursor.additional.style";

export function getHostId(): HostId {
  return env.appName.toLowerCase().includes("cursor") ? "cursor" : "vscode";
}

export function isCursor(): boolean {
  return getHostId() === "cursor";
}

function ensureObject(
  parent: Record<string, unknown>,
  key: string
): Record<string, unknown> {
  const value = parent[key];
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    parent[key] = {};
  }
  return parent[key] as Record<string, unknown>;
}

function isUserConfigured(
  config: WorkspaceConfiguration,
  key: string
): boolean {
  const inspected = config.inspect(key);
  return (
    inspected?.globalValue !== undefined ||
    inspected?.workspaceValue !== undefined ||
    inspected?.workspaceFolderValue !== undefined
  );
}

export const CURSOR_OVERRIDES_STYLE = "./cursor-targeted-overrides.css";

const CURSOR_ADDITIONAL_STYLES = [CURSOR_OVERRIDES_STYLE];

const CURSOR_FILTER_DEFAULT = {
  filter: "saturate(var(--fgt-saturate)) url(#fgt-acrylic-{key})",
  disableBackgroundColor: true,
  opacity: 0.4,
};

const CURSOR_FAKE_MICA_FILTER =
  "saturate(var(--fgt-saturate)) blur(6px) var(--fgt-mica-filter)";

const CURSOR_VARIABLE = {
  "fgt-luminosity-opacity": "30%",
};

const CURSOR_VARIABLE_DARK = {
  "fgt-luminosity-opacity": "30%",
  "fgt-mica-filter": "brightness(100%) saturate(125%)",
};

const CURSOR_EFFECT = {
  extendMenuFocusBackground: "#00000000",
  revealEffect: {
    gradientSize: "50%",
    lightColor: "#ffffff28",
  },
};

const CURSOR_ADDITIONAL_STYLE_DEFAULTS = {
  generalMenuBlur: "8px",
  quickInputBlur: "8px",
  notificationsBlur: "6px",
  wordSearchBarBlur: "4px",
};

const CURSOR_TARGETED_DEFAULTS = {
  chatPaneBackground: "#11111133",
  agentSidebarBackground: "#1f1f1f0D",
  sidebarIconBarBackground: "#1f1f1f4d",
  sentMessageBubbleBackground: "#00000000",
  sentMessageBubbleBlur: "8px",
  slashMenuBlur: "8px",
  mentionMenuBlur: "8px",
  modePickerMenuBlur: "6px",
  modelPickerMenuBlur: "6px",
  chatRightClickMenuBlur: "4px",
};

function isLegacyFlatCursorObject(value: Record<string, unknown>): boolean {
  return (
    "chatPaneBackground" in value ||
    "slashMenuBlur" in value ||
    "sentMessageBubbleBlur" in value
  );
}

/** Read cursor.additional.style blur values (nested or legacy generalMenuBlur in overrides). */
export function readCursorAdditionalStyle(
  settings: Record<string, unknown>
): Record<string, unknown> {
  const cursorRoot = settings.cursor;
  if (cursorRoot && typeof cursorRoot === "object" && !Array.isArray(cursorRoot)) {
    const root = cursorRoot as Record<string, unknown>;
    const additional = root.additional;
    if (
      additional &&
      typeof additional === "object" &&
      !Array.isArray(additional)
    ) {
      const style = (additional as Record<string, unknown>).style;
      if (style && typeof style === "object" && !Array.isArray(style)) {
        return { ...(style as Record<string, unknown>) };
      }
    }
  }

  const overrides = readCursorTargetedOverrides(settings);
  if (overrides.generalMenuBlur !== undefined) {
    return { generalMenuBlur: overrides.generalMenuBlur };
  }
  return {};
}

/** Read targeted overrides from settings shape (nested or legacy flat `cursor`). */
export function readCursorTargetedOverrides(
  settings: Record<string, unknown>
): Record<string, unknown> {
  const cursorRoot = settings.cursor;
  if (cursorRoot && typeof cursorRoot === "object" && !Array.isArray(cursorRoot)) {
    const root = cursorRoot as Record<string, unknown>;
    const nested = root.targetted;
    if (nested && typeof nested === "object" && !Array.isArray(nested)) {
      const overrides = (nested as Record<string, unknown>).overrides;
      if (
        overrides &&
        typeof overrides === "object" &&
        !Array.isArray(overrides)
      ) {
        return { ...(overrides as Record<string, unknown>) };
      }
    }
    if (isLegacyFlatCursorObject(root)) {
      return { ...root };
    }
  }
  return {};
}

/** Inject runtime uses flat `cursor` (see config.schema.json). */
function writeCursorTargetedOverridesForInject(
  settings: Record<string, unknown>,
  overrides: Record<string, unknown>
): void {
  settings.cursor = overrides;
}

function resolveFilterOpacity(
  filter: Record<string, unknown>,
  filterKey: string,
  filterDefault: Record<string, unknown>
): number {
  const existing = filter[filterKey] as { opacity?: number } | undefined;
  return (
    existing?.opacity ??
    (filterDefault.opacity as number | undefined) ??
    CURSOR_FILTER_DEFAULT.opacity
  );
}

function parseBlurPx(blur: string): number {
  const match = blur.trim().match(/^([\d.]+)\s*px$/i);
  return match ? parseFloat(match[1]) : 12;
}

function wireAcrylicBlurFilter(
  filter: Record<string, unknown>,
  filterKey: string,
  blur: string,
  filterDefault: Record<string, unknown>
): void {
  filter[filterKey] = {
    filter: `saturate(var(--fgt-saturate)) url(#fgt-acrylic-${filterKey})`,
    disableBackgroundColor: true,
    opacity: resolveFilterOpacity(filter, filterKey, filterDefault),
    acrylicBlur: parseBlurPx(blur),
  };
}

/** @deprecated Use applyCursorInjectDefaults */
export const applyCursorMicaInjectDefaults = applyCursorInjectDefaults;

/**
 * Cursor-only inject defaults at Apply Config time.
 * Mirrors package.json schema defaults merged by getConfiguration().
 * Only runs when isCursor(); respects keys the user explicitly set in settings.
 */
export function applyCursorInjectDefaults(
  settings: Record<string, unknown>,
  fgtConfig?: WorkspaceConfiguration
): void {
  if (!isCursor()) return;

  const userSet = (key: string) =>
    fgtConfig ? isUserConfigured(fgtConfig, key) : false;

  if (!userSet("additionalStyle")) {
    settings.additionalStyle = [...CURSOR_ADDITIONAL_STYLES];
  } else {
    const additionalStyle = settings.additionalStyle as string[] | undefined;
    const normalized = [...new Set(additionalStyle ?? [])];
    for (const style of CURSOR_ADDITIONAL_STYLES) {
      if (!normalized.includes(style)) normalized.push(style);
    }
    settings.additionalStyle = normalized;
  }

  const additionalStyle: Record<string, unknown> = userSet(
    CURSOR_ADDITIONAL_STYLE_KEY
  )
    ? readCursorAdditionalStyle(settings)
    : (() => {
        const legacy = readCursorAdditionalStyle(settings);
        return Object.keys(legacy).length
          ? { ...CURSOR_ADDITIONAL_STYLE_DEFAULTS, ...legacy }
          : { ...CURSOR_ADDITIONAL_STYLE_DEFAULTS };
      })();

  additionalStyle.generalMenuBlur ??= CURSOR_ADDITIONAL_STYLE_DEFAULTS.generalMenuBlur;
  additionalStyle.quickInputBlur ??= CURSOR_ADDITIONAL_STYLE_DEFAULTS.quickInputBlur;
  additionalStyle.notificationsBlur ??=
    CURSOR_ADDITIONAL_STYLE_DEFAULTS.notificationsBlur;
  additionalStyle.wordSearchBarBlur ??=
    CURSOR_ADDITIONAL_STYLE_DEFAULTS.wordSearchBarBlur;

  const overrides: Record<string, unknown> = userSet(CURSOR_TARGETED_OVERRIDES_KEY)
    ? readCursorTargetedOverrides(settings)
    : (() => {
        const legacy = readCursorTargetedOverrides(settings);
        return Object.keys(legacy).length
          ? { ...legacy }
          : { ...CURSOR_TARGETED_DEFAULTS };
      })();

  delete overrides.quitConfirmationBlur;
  delete (overrides as { confirmationDialogBlur?: string })
    .confirmationDialogBlur;
  delete overrides.generalMenuBlur;

  overrides.chatPaneBackground ??= CURSOR_TARGETED_DEFAULTS.chatPaneBackground;
  overrides.agentSidebarBackground ??=
    CURSOR_TARGETED_DEFAULTS.agentSidebarBackground;
  overrides.sidebarIconBarBackground ??=
    CURSOR_TARGETED_DEFAULTS.sidebarIconBarBackground;
  overrides.sentMessageBubbleBackground ??=
    CURSOR_TARGETED_DEFAULTS.sentMessageBubbleBackground;
  overrides.sentMessageBubbleBlur ??=
    CURSOR_TARGETED_DEFAULTS.sentMessageBubbleBlur;
  overrides.slashMenuBlur ??= CURSOR_TARGETED_DEFAULTS.slashMenuBlur;
  overrides.mentionMenuBlur ??= CURSOR_TARGETED_DEFAULTS.mentionMenuBlur;
  overrides.modePickerMenuBlur ??=
    (overrides as { composerModeMenuBlur?: string }).composerModeMenuBlur ??
    CURSOR_TARGETED_DEFAULTS.modePickerMenuBlur;
  overrides.modelPickerMenuBlur ??= CURSOR_TARGETED_DEFAULTS.modelPickerMenuBlur;
  overrides.chatRightClickMenuBlur ??=
    (overrides as { chatContextMenuBlur?: string }).chatContextMenuBlur ??
    CURSOR_TARGETED_DEFAULTS.chatRightClickMenuBlur;

  writeCursorTargetedOverridesForInject(settings, overrides);

  const filter = ensureObject(settings, "filter");
  const filterDefault = ensureObject(filter, "default");
  if (!userSet("filter")) {
    Object.assign(filterDefault, CURSOR_FILTER_DEFAULT);
  } else {
    filterDefault.filter ??= CURSOR_FILTER_DEFAULT.filter;
    filterDefault.disableBackgroundColor ??=
      CURSOR_FILTER_DEFAULT.disableBackgroundColor;
    filterDefault.opacity ??= CURSOR_FILTER_DEFAULT.opacity;
  }

  wireAcrylicBlurFilter(
    filter,
    "menu",
    String(additionalStyle.generalMenuBlur),
    filterDefault
  );
  wireAcrylicBlurFilter(
    filter,
    "quickInput",
    String(additionalStyle.quickInputBlur),
    filterDefault
  );
  wireAcrylicBlurFilter(
    filter,
    "notifications",
    String(additionalStyle.notificationsBlur),
    filterDefault
  );
  wireAcrylicBlurFilter(
    filter,
    "notificationToast",
    String(additionalStyle.notificationsBlur),
    filterDefault
  );
  wireAcrylicBlurFilter(
    filter,
    "listFilterWidget",
    String(additionalStyle.wordSearchBarBlur),
    filterDefault
  );

  const effect = ensureObject(settings, "effect");
  if (!userSet("effect.extendMenuFocusBackground")) {
    effect.extendMenuFocusBackground =
      CURSOR_EFFECT.extendMenuFocusBackground;
  }
  const revealEffect = ensureObject(effect, "revealEffect");
  if (!userSet("effect.revealEffect")) {
    Object.assign(revealEffect, CURSOR_EFFECT.revealEffect);
  }

  const fakeMica = settings.fakeMica as
    | { enabled?: boolean; filter?: string }
    | undefined;
  if (!fakeMica?.enabled) return;

  if (!userSet("fakeMica.filter")) {
    fakeMica.filter = CURSOR_FAKE_MICA_FILTER;
  }

  if (!userSet("variable")) {
    Object.assign(ensureObject(settings, "variable"), CURSOR_VARIABLE);
  }

  if (!userSet("variableDark")) {
    Object.assign(ensureObject(settings, "variableDark"), CURSOR_VARIABLE_DARK);
  }
}

/** Cursor-only: write editable frosted-glass keys to settings.json during Setup. */
export async function applyCursorSettingsDefaults(
  fgtConfig: WorkspaceConfiguration
): Promise<void> {
  if (!isCursor()) return;

  await Promise.all([
    fgtConfig.update(
      "filter",
      { default: { ...CURSOR_FILTER_DEFAULT } },
      true
    ),
    fgtConfig.update("fakeMica.filter", CURSOR_FAKE_MICA_FILTER, true),
    fgtConfig.update("variable", { ...CURSOR_VARIABLE }, true),
    fgtConfig.update("variableDark", { ...CURSOR_VARIABLE_DARK }, true),
    fgtConfig.update(
      "effect.extendMenuFocusBackground",
      CURSOR_EFFECT.extendMenuFocusBackground,
      true
    ),
    fgtConfig.update(
      "effect.revealEffect",
      { ...CURSOR_EFFECT.revealEffect },
      true
    ),
    fgtConfig.update(
      CURSOR_ADDITIONAL_STYLE_KEY,
      { ...CURSOR_ADDITIONAL_STYLE_DEFAULTS },
      true
    ),
    fgtConfig.update(
      CURSOR_TARGETED_OVERRIDES_KEY,
      { ...CURSOR_TARGETED_DEFAULTS },
      true
    ),
  ]);
}
