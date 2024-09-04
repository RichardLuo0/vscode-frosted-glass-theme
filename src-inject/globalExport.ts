declare global {
  interface Window {
    _fgtTheme: Record<string, unknown>;
  }
}

window._fgtTheme = Object.create(null);
export default window._fgtTheme;
