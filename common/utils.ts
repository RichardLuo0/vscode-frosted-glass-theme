export function lazy<T>(init: () => T): () => T {
  const getVar: (() => T) & { value?: T } = () =>
    getVar.value ?? (getVar.value = init());
  return getVar;
}
