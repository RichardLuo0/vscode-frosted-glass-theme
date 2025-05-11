import { isHTMLElement } from "./utils";
import { AnyFunction, NewFunc, proxy, proxyAll } from "../../common/proxy";

export function useHTMLElement<This, Args extends any[]>(
  className: string | null,
  f: (this: This, e: HTMLElement, ...args: Args) => void
) {
  return function <OldFunc extends AnyFunction>(
    this: This,
    oldFunc: OldFunc,
    e: unknown,
    ...args: Args
  ) {
    isHTMLElement(e) &&
      (className === null || e.classList.contains(className)) &&
      f.call(this, e, ...args);
    return oldFunc(e, ...args) as ReturnType<OldFunc>;
  };
}

export function applyAndProxyElement<
  Parent extends Element &
    Record<FuncName, (this: Parent, e: Element, ...arg: any[]) => unknown>,
  FuncName extends string,
>(
  parent: Parent,
  className: string,
  funcName: FuncName | FuncName[],
  func: (this: Parent, e: Element) => unknown
) {
  const e = parent.querySelector("div." + className);
  if (e) func.call(parent, e);
  const newFunc = useHTMLElement(className, func) as NewFunc<
    Parent[FuncName],
    Parent
  >;
  if (funcName instanceof Array) proxyAll(parent, funcName, newFunc);
  else proxy(parent, funcName, newFunc);
}
