declare module "*.css";
declare module "*.json" {
  const config: {
    backdropFilter: string;
    backgroundColor: string;
    transition: string;
    opacity: {
      menu: number;
      selection: number;
      border: number;
      separator: number;
      minimap: number;
      panelHeader: number;
    };
    animation: {
      menu: string;
      dialog: string;
    };
    revealEffect: {
      enabled: boolean;
      opacity: number;
      gradientSize: number;
      clickEffect: boolean;
    };
  };
  export default config;
}
