const CORRUPT_NEEDLE = "appears to be corrupt";

function mentionsCorrupt(el: Element): boolean {
  const label = el.getAttribute("aria-label") ?? "";
  if (label.includes(CORRUPT_NEEDLE)) return true;
  const message = el.querySelector(
    ".notification-list-item-message span"
  )?.textContent;
  if (message?.includes(CORRUPT_NEEDLE)) return true;
  return (el.textContent ?? "").includes(CORRUPT_NEEDLE);
}

function isCorruptToastContainer(container: Element): boolean {
  if (mentionsCorrupt(container)) return true;

  const list = container.querySelector(".monaco-list");
  if (list && mentionsCorrupt(list)) return true;

  const rows = container.querySelectorAll(".monaco-list-row");
  if (!rows.length) return false;

  return [...rows].every(row => mentionsCorrupt(row));
}

function hasOtherNotifications(container: Element): boolean {
  for (const row of container.querySelectorAll(".monaco-list-row")) {
    if (!mentionsCorrupt(row)) {
      const message = row
        .querySelector(".notification-list-item-message span")
        ?.textContent?.trim();
      if (message) return true;
    }
  }
  return false;
}

function removeCorruptToasts(root: ParentNode = document): void {
  for (const container of root.querySelectorAll(
    ".notifications-toasts .notification-toast-container, .notification-toast-container"
  )) {
    if (!isCorruptToastContainer(container)) continue;
    if (hasOtherNotifications(container)) continue;
    container.remove();
  }
}

let sweepScheduled = false;

function scheduleSweep(): void {
  if (sweepScheduled) return;
  sweepScheduled = true;
  requestAnimationFrame(() => {
    sweepScheduled = false;
    removeCorruptToasts();
  });
}

export function hideCorruptNotifications(): void {
  removeCorruptToasts();

  new MutationObserver(scheduleSweep).observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["aria-label", "class", "style"],
  });

  for (const ms of [0, 50, 200, 500, 1000, 2000, 5000, 10000]) {
    setTimeout(removeCorruptToasts, ms);
  }
}
