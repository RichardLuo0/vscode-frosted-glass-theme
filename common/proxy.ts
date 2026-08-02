export type AnyFunction = (this: any, ...args: any) => unknown;

export type NewFunc<OldFunc extends AnyFunction, This = any> = OldFunc extends (
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
>(src: Src, funcName: FuncName, newFunc: NewFunc<Src[FuncName], Src>) {
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
>(src: Src, funcNames: FuncNames[], newFunc: NewFunc<Src[FuncNames], Src>) {
  for (const funcName of funcNames) proxy(src, funcName, newFunc);
}

export function proxyOrDefine<
  Src extends Record<FuncName, FuncType | undefined>,
  FuncName extends string,
  FuncType extends AnyFunction & {
    _proxied?: boolean;
  },
>(src: Src, funcName: FuncName, newFunc: NewFunc<FuncType, Src>) {
  if (src[funcName] === undefined) src[funcName] = (() => {}) as Src[FuncName];
  type NewSrc = Record<FuncName, FuncType>;
  proxy(src as NewSrc, funcName, newFunc as NewFunc<FuncType, NewSrc>);
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
