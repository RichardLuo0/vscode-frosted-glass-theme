declare module "*.css" {
  const styleSheet: CSSStyleSheet;
  export default styleSheet;
}

declare namespace vscode {
  const process: {
    versions: {
      chrome: string;
    };
  };
  const ipcRenderer: {
    on(channel: string, listener: (e: any, ...args: any[]) => void): any;
  };
}
