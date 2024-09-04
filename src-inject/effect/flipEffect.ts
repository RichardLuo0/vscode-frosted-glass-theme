import { getRelativePos, isHTMLElement } from "src-inject/utils";
import config from "../config.json" with { type: "json" };
import { quad } from "./timingFunction";

const {
  effect: { flipEffect },
} = config;

function transform(element: HTMLElement, e: MouseEvent) {
  const mouse = getRelativePos(element, e);
  const rect = element.getBoundingClientRect();
  const center = [rect.width / 2, rect.height / 2];
  const vector = [center[0] - mouse[0], center[1] - mouse[1]];
  const axis = [vector[1], -vector[0]];
  const radius =
    Math.sqrt(rect.width * rect.width + rect.height * rect.height) / 2;
  const maxDegree =
    radius >= 50
      ? flipEffect.degree
      : 20 - 0.008 * radius * radius + flipEffect.degree;
  const distance = Math.sqrt(vector[0] * vector[0] + vector[1] * vector[1]);
  element.style.transform = `rotate3d(${axis[0]}, ${axis[1]}, 0, ${maxDegree * quad(distance / radius)}deg)`;
}

export function applyFlipEffect(
  element: Element & {
    _appliedFlipEffect?: boolean;
  }
) {
  if (element._appliedFlipEffect || !isHTMLElement(element)) return;

  const oriTransform = element.style.transform;

  let isPressed = false;
  element.style.transition = "transform " + flipEffect.transition;
  element.addEventListener("mousedown", e => {
    isPressed = true;
    transform(element, e);
  });

  element.addEventListener("mousemove", e => {
    if (isPressed) transform(element, e);
  });

  element.addEventListener("mouseup", () => {
    isPressed = false;
    element.style.transform = oriTransform;
  });
  element.addEventListener("mouseleave", () => {
    isPressed = false;
    element.style.transform = oriTransform;
  });

  element._appliedFlipEffect = true;
}
