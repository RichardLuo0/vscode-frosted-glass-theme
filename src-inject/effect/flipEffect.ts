import { getRelativePos, isHTMLElement } from "src-inject/utils";
import config from "../config.json" with { type: "json" };

const {
  effect: { flipEffect },
} = config;

export function applyFlipEffect(
  element: Element & {
    _appliedFlipEffect?: boolean;
  }
) {
  if (element._appliedFlipEffect || !isHTMLElement(element)) return;

  const oriTransform = element.style.transform;

  element.style.transition = "transform " + flipEffect.transition;
  element.addEventListener("mousedown", e => {
    const mouse = getRelativePos(element, e);
    const rect = element.getBoundingClientRect();
    const center = [rect.x + rect.height / 2, rect.y + rect.width / 2];
    const vector = [center[0] - mouse[0], center[1] - mouse[1]];
    const axis: [number, number] =
      vector[1] == 0 ? [0, vector[0]] : [1, -vector[0]];
    element.style.transform = `rotate3d(${axis[0]}, ${axis[1]}, 0, ${flipEffect.degree}deg)`;
  });
  element.addEventListener("mouseup", () => {
    element.style.transform = oriTransform;
  });
  element.addEventListener("mouseleave", () => {
    element.style.transform = oriTransform;
  });

  element._appliedFlipEffect = true;
}
