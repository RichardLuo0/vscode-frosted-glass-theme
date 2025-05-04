import config from "../config.json" with { type: "json" };
import { getRelativePos, isHTMLElement } from "../utils";

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
// d: reduced distance = reducedPercentage * radius;
// z = adjacent * p / (r - d) - p - opposite
// when z = 0, let a = r - d, c is cos\theta, solve (p^2r^2/a^2 + r^2)c^2 - 2p^2rc/a + p^2 - r^2 = 0
function transform(element: HTMLElement, e: MouseEvent) {
  const mouse = getRelativePos(element, e);
  const rect = element.getBoundingClientRect();
  const center = [rect.width / 2, rect.height / 2];
  const vector = [center[0] - mouse[0], center[1] - mouse[1]];
  const axis = [vector[1], -vector[0]];
  const rS = (rect.width * rect.width + rect.height * rect.height) / 4;
  const radius = Math.sqrt(rS);
  const distance = Math.sqrt(vector[0] * vector[0] + vector[1] * vector[1]);
  const p = (flipEffect.perspective * 96) / 2.54;
  const d = reducedDistanceFunc(radius);
  const a = radius - d; // remain distance
  const adjacent =
    radius -
    (1 -
      positiveRoot(
        ((p * p) / (a * a) + 1) * rS,
        -(2 * p * p * radius) / a,
        p * p - rS
      )) *
      distance;
  const degreeInRadius = Math.acos(adjacent / radius);
  const opposite = Math.sin(degreeInRadius) * radius;
  const z = (adjacent * p) / (radius - d) - p - opposite;
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
