import { isHTMLElement } from "./utils";

/**
 * Proxy function on src
 */
export function proxy<
  SrcType extends Record<string, any>,
  FuncName extends string,
  FuncType extends SrcType[FuncName]
>(
  src: SrcType,
  funcName: FuncName,
  newFunc: (
    this: SrcType,
    oldFunc: FuncType,
    ...args: Parameters<SrcType[FuncName]>
  ) => ReturnType<SrcType[FuncName]>
) {
  if (!src || !src[funcName] || src[funcName]._hiddenTag) return;
  const oldFunc = src[funcName];
  src[funcName] = function (
    this: SrcType,
    ...args: Parameters<SrcType[FuncName]>
  ) {
    return newFunc.call(this, oldFunc.bind(this), ...args);
  } as FuncType;
  src[funcName]._hiddenTag = true;
}

export function proxyAll<
  SrcType extends Record<string, any>,
  FuncName extends string,
  FuncType extends SrcType[FuncName]
>(
  src: SrcType,
  funcNames: FuncName[],
  newFunc: (
    this: SrcType,
    oldFunc: FuncType,
    ...args: Parameters<SrcType[FuncName[number]]>
  ) => ReturnType<SrcType[FuncName[number]]>
) {
  for (const funcName of funcNames) proxy(src, funcName, newFunc);
}

export function useRet<SrcType, ArgsType extends any[], RetType>(
  f: (this: SrcType, oldRet: RetType, ...args: ArgsType) => RetType
) {
  type BoundFuncType = (...args: ArgsType) => RetType;
  return function (this: SrcType, oldFunc: BoundFuncType, ...args: ArgsType) {
    return f.call(this, oldFunc(...args), ...args);
  };
}

export function useArgs<SrcType, ArgsType extends any[]>(
  f: (this: SrcType, ...args: ArgsType) => void
) {
  type BoundFuncType = (...args: ArgsType) => any;
  return function (this: SrcType, oldFunc: BoundFuncType, ...args: ArgsType) {
    f.call(this, ...args);
    return oldFunc(...args);
  };
}

export function useHTMLElement<SrcType, ArgsType extends any[]>(
  className: string | null,
  f: (this: SrcType, e: HTMLElement, ...args: ArgsType) => void
) {
  type BoundFuncType = (e: any, ...args: ArgsType) => any;
  return function (
    this: SrcType,
    oldFunc: BoundFuncType,
    e: any,
    ...args: ArgsType
  ) {
    isHTMLElement(e) &&
      (className === null || e.classList.contains(className)) &&
      f.call(this, e, ...args);
    return oldFunc(e, ...args);
  };
}
