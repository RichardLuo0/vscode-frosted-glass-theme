import { isHTMLElement } from "./utils";

type AnyFunction = (this: any, ...args: any) => unknown;

type NewFunc<OldFunc extends AnyFunction> = OldFunc extends (
  this: infer This,
  ...args: infer Args
) => infer Ret
  ? (this: This, oldFunc: OmitThisParameter<OldFunc>, ...args: Args) => Ret
  : never;

// Proxy function on src
export function proxy<
  Src extends Record<
    FuncName,
    AnyFunction & {
      _proxied?: boolean;
    }
  >,
  FuncName extends string,
>(src: Src, funcName: FuncName, newFunc: NewFunc<Src[FuncName]>) {
  if (!src[funcName] || src[funcName]._proxied) return;
  const oldFunc = src[funcName];
  src[funcName] = function (
    this: ThisParameterType<Src[FuncName]>,
    ...args: Parameters<Src[FuncName]>
  ) {
    return newFunc.call(this, oldFunc.bind(this), ...args);
  } as Src[FuncName];
  src[funcName]._proxied = true;
}

export function proxyAll<
  Src extends Record<FuncNames, AnyFunction>,
  FuncNames extends string,
>(src: Src, funcNames: FuncNames[], newFunc: NewFunc<Src[FuncNames]>) {
  for (const funcName of funcNames) proxy(src, funcName, newFunc);
}

export function useRet<This, Args extends any[], Ret>(
  f: (this: This, oldRet: Ret, ...args: Args) => Ret
) {
  return function (this: This, oldFunc: (...args: any) => Ret, ...args: Args) {
    return f.call(this, oldFunc(...args), ...args);
  };
}

export function useArgs<This, Args extends any[]>(
  f: (this: This, ...args: Args) => void
) {
  return function <OldFunc extends AnyFunction>(
    this: This,
    oldFunc: OldFunc,
    ...args: Args
  ) {
    f.call(this, ...args);
    return oldFunc(...args) as ReturnType<OldFunc>;
  };
}

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

export function applyAndProxy<FunNames extends string>(
  parent: Element &
    Record<FunNames, (this: any, e: any, ...args: any) => unknown>,
  className: string,
  funcName: FunNames | FunNames[],
  func: (e: Element, ...args: any[]) => void
) {
  const e = parent.querySelector("div." + className);
  if (e) func(e);
  const newFunc = useHTMLElement(className, func) as NewFunc<
    (typeof parent)[FunNames]
  >;
  if (funcName instanceof Array) proxyAll(parent, funcName, newFunc);
  else proxy(parent, funcName, newFunc);
}
