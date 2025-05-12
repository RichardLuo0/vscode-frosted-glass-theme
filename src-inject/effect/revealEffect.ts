import config from "../../config/config.json" with { type: "json" };
import { getRelativePos, isHTMLElement } from "../utils/utils";

const {
  effect: { revealEffect },
} = config;

enum SizeType {
  Px,
  Per,
}

type CachedSize = {
  type: SizeType;
  value: number;
};

function getSizeCached(value: string | number): CachedSize {
  if (typeof value === "number") return { type: SizeType.Px, value };
  else if (value.endsWith("%"))
    return { type: SizeType.Per, value: parseFloat(value) / 100 };
  else return { type: SizeType.Px, value: parseFloat(value) };
}

const gradientSize = getSizeCached(revealEffect.gradientSize);
const clickSize = getSizeCached(revealEffect.clickEffect.size);

function getSize(element: HTMLElement, cachedSize: CachedSize) {
  const { value } = cachedSize;
  switch (cachedSize.type) {
    case SizeType.Per:
      const rect = element.getBoundingClientRect();
      return Math.max(rect.width, rect.height) * value;
    default:
      return value;
  }
}

function lightHoverEffect(x: number, y: number, size: number) {
  return `radial-gradient(circle ${size}px at ${x}px ${y}px, ${revealEffect.lightColor}, transparent)`;
}

function lightClickEffect(
  x: number,
  y: number,
  size: number,
  lightColor: string
) {
  return `radial-gradient(circle ${size}px at ${x}px ${y}px, transparent, ${lightColor}, transparent)`;
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

  const [x, y] = getRelativePos(element, e);
  const speed = revealEffect.clickEffect.speed;
  const startSize = getSize(element, clickSize);
  const duration = revealEffect.clickEffect.duration;
  const distance = duration * speed;

  let start: DOMHighResTimeStamp | undefined;
  function step(time: DOMHighResTimeStamp) {
    if (start === undefined) start = time;
    const elapsed = time - start;
    const hoverEffect = element._revealEffectHover;
    if (elapsed < duration) {
      const percentage = elapsed / duration;
      element.style.backgroundImage =
        hoverEffect +
        ", " +
        lightClickEffect(
          x,
          y,
          distance * percentage + startSize,
          `color-mix(in srgb, ${revealEffect.lightColor}, transparent ${percentage * 100}%)`
        );
      element._revealEffectAnimation = requestAnimationFrame(step);
    } else {
      element.style.backgroundImage = hoverEffect ?? "";
      element._revealEffectAnimation = undefined;
    }
  }
  element._revealEffectAnimation = requestAnimationFrame(step);
}

export function applyRevealEffect(
  element: Element & {
    _appliedRevealEffect?: boolean;
    _revealEffectHover?: string;
    _revealEffectAnimation?: number;
  }
) {
  if (element._appliedRevealEffect || !isHTMLElement(element)) return;

  const oriBackground = element.style.backgroundImage;

  element.addEventListener("mousemove", e => {
    const [x, y] = getRelativePos(element, e);
    const hoverEffect = lightHoverEffect(x, y, getSize(element, gradientSize));
    if (!element._revealEffectAnimation)
      element.style.backgroundImage = hoverEffect;
    element._revealEffectHover = hoverEffect;
  });
  element.addEventListener("mouseleave", () => {
    element.style.backgroundImage = oriBackground;
    element._revealEffectHover = oriBackground;
  });

  if (revealEffect.clickEffect && !element.classList.contains("disabled"))
    element.addEventListener("mousedown", e => startClickAnimation(element, e));

  element._appliedRevealEffect = true;
}
