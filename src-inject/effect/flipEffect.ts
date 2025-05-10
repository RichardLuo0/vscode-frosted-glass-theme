import config from "../config.json" with { type: "json" };
import { getRelativePos, isHTMLElement } from "../utils/utils";

const {
  effect: { flipEffect },
} = config;

const reducedDistanceFunc = new Function(
  "radius",
  '"use strict";return ' + flipEffect.reducedDistanceFunc
) as (radius: number) => number;

function positiveRoot(a: number, b: number, c: number) {
  return (-b + Math.sqrt(b * b - 4 * a * c)) / (2 * a);
}

// p: perspective
// r: radius
// d: reduced distance
// z = adjacent * p / (r - d) - p - opposite
// when z = 0, let a = r - d, c is cos\theta, solve (p^2r^2/a^2 + r^2)c^2 - 2p^2rc/a + p^2 - r^2 = 0
function transform(element: HTMLElement, e: MouseEvent) {
  const mouse = getRelativePos(element, e);
  const rect = element.getBoundingClientRect();
  const center = [rect.width / 2, rect.height / 2];
  const vector = [center[0] - mouse[0], center[1] - mouse[1]];
  const axis = [vector[1], -vector[0]];
  const rs = (rect.width * rect.width + rect.height * rect.height) / 4;
  const r = Math.sqrt(rs);
  const distance = Math.sqrt(vector[0] * vector[0] + vector[1] * vector[1]);
  const p = (flipEffect.perspective * 96) / 2.54;
  const d = reducedDistanceFunc(r);
  const a = r - d; // remain distance
  const adjacent =
    r -
    (1 -
      positiveRoot(
        ((p * p) / (a * a) + 1) * rs,
        -(2 * p * p * r) / a,
        p * p - rs
      )) *
      distance;
  const degreeInRadius = Math.acos(adjacent / r);
  const opposite = Math.sin(degreeInRadius) * r;
  const z = (adjacent * p) / (r - d) - p - opposite;
  const perspective = `perspective(${flipEffect.perspective}cm)`;
  const rotate3d = `rotate3d(${axis[0]}, ${axis[1]}, 0, ${(degreeInRadius * 180) / Math.PI}deg)`;
  const translateZ = `translateZ(-${z}px)`;
  element.style.transform = `${perspective} ${translateZ} ${rotate3d}`;
}

export function applyFlipEffect(
  element: Element & {
    _appliedFlipEffect?: boolean;
  }
) {
  if (element._appliedFlipEffect || !isHTMLElement(element)) return;

  let oriTransform = "";
  let oriTransition = "";

  let isPressed = false;

  element.addEventListener("mousedown", e => {
    oriTransform = element.style.transform;
    oriTransition = element.style.transition;
    element.style.transition =
      oriTransition + ", transform " + flipEffect.transition;
    isPressed = true;
    transform(element, e);
  });

  element.addEventListener("mousemove", e => {
    if (isPressed) transform(element, e);
  });

  const onRelease = (e: MouseEvent) => {
    if (!isPressed) return;
    isPressed = false;
    element.style.transform = oriTransform;
    element.style.transition = oriTransition;
  };
  element.addEventListener("mouseup", onRelease);
  element.addEventListener("mouseleave", onRelease);

  element._appliedFlipEffect = true;
}
