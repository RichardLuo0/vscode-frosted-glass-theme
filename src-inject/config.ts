//! @fgt-config
const config = {
  backdropFilter: "blur(30px)",
  backgroundColor: "",
  transition: "300ms",
  opacity: {
    menu: 0.4,
    selection: 1,
    panelHeader: 0.4,
    border: 0.4,
    minimap: 0.4,
  },
  animation: {
    menu: "300ms cubic-bezier(0, 0.8, 0.2, 1) 0s 1 forwards fgtDropdown",
    dialog: "300ms cubic-bezier(0, 0.8, 0.2, 1) 0s 1 forwards fgtZoomIn",
  },
  revealEffect: {
    enabled: true,
    opacity: 0.1,
    gradientSize: 200,
    clickEffect: true,
  },
};
export default config;
