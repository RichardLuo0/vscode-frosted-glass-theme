import { getRelativePos, isHTMLElement } from "src-inject/utils";
import config from "../config.json" with { type: "json" };
import fgtSheet from "../vscode-frosted-glass-theme.css" with { type: "css" };

const {
  effect: { revealEffect },
} = config;

function getSize(element: HTMLElement, pxOrPer: number | string) {
  if (typeof pxOrPer == "number") return pxOrPer;
  else if (pxOrPer.endsWith("%")) {
    const rect = element.getBoundingClientRect();
    return (
      (Math.max(rect.width, rect.height) *
        Number.parseFloat(pxOrPer.substring(0, pxOrPer.length - 1))) /
      100
    );
  } else return Number.parseFloat(pxOrPer);
}

function lightHoverEffect(x: number, y: number, size: number) {
  return `radial-gradient(circle ${size}px at ${x}px ${y}px, ${revealEffect.lightColor}, transparent)`;
}

function lightClickEffect(x: number, y: number, size: number) {
  return `radial-gradient(circle ${size}px at ${x}px ${y}px, transparent, ${revealEffect.lightColor}, transparent)`;
}

function startClickAnimation(
  element: HTMLElement & {
    _revealEffectAnimation?: number;
    _revealEffectHover?: string;
  },
  e: MouseEvent
) {
  if (element._revealEffectAnimation)
    cancelAnimationFrame(element._revealEffectAnimation);
  element._revealEffectAnimation = undefined;

  const [x, y] = getRelativePos(element, e);
  const speed = revealEffect.clickEffect.speed;
  const startSize = getSize(element, revealEffect.clickEffect.size);

  let start: DOMHighResTimeStamp | undefined;
  function step(time: DOMHighResTimeStamp) {
    if (start === undefined) start = time;
    const elapsed = time - start;
    const hoverEffect = element._revealEffectHover;
    if (elapsed < 300) {
      element.style.backgroundImage =
        hoverEffect +
        ", " +
        lightClickEffect(x, y, speed * elapsed + startSize);
      element._revealEffectAnimation = requestAnimationFrame(step);
    } else {
      element.style.backgroundImage = hoverEffect ?? "";
      element._revealEffectAnimation = undefined;
    }
  }
  element._revealEffectAnimation = requestAnimationFrame(step);
}

let isDisabledMenuSelectionBackground = false;
function disableMenuSelectionBackground() {
  if (isDisabledMenuSelectionBackground) return;
  fgtSheet.insertRule(
    `.monaco-menu-container ul.actions-container > li > a.action-menu-item {
        background-color: transparent !important;
        outline: none !important;
      }`
  );
  if (revealEffect.focusBackground)
    fgtSheet.insertRule(
      `.monaco-menu-container ul.actions-container .action-item.focused {
          background-color: ${revealEffect.focusBackground.color}
        }`
    );
  isDisabledMenuSelectionBackground = true;
}

export function applyRevealEffect(
  element: Element & {
    _appliedRevealEffect?: boolean;
    _revealEffectHover?: string;
    _revealEffectAnimation?: number;
  }
) {
  if (element._appliedRevealEffect || !isHTMLElement(element)) return;

  if (element.classList.contains("action-item"))
    disableMenuSelectionBackground();

  const oriBackground = element.style.backgroundImage;

  element.addEventListener("mousemove", e => {
    const [x, y] = getRelativePos(element, e);
    const hoverEffect = lightHoverEffect(
      x,
      y,
      getSize(element, revealEffect.gradientSize)
    );
    if (!element._revealEffectAnimation)
      element.style.backgroundImage = hoverEffect;
    else element._revealEffectHover = hoverEffect;
  });
  element.addEventListener("mouseleave", () => {
    element.style.backgroundImage = oriBackground;
    element._revealEffectHover = oriBackground;
  });

  if (revealEffect.clickEffect && !element.classList.contains("disabled")) {
    element.addEventListener("mousedown", e => {
      element._revealEffectHover = element.style.backgroundImage;
      startClickAnimation(element, e);
    });
  }

  element._appliedRevealEffect = true;
}
