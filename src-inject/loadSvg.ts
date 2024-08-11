import config from "./config.json" with { type: "json" };

export function loadSvgs(svgList: string[]) {
  let fetchList = [];
  const path = import.meta.url;
  const currentPath = path.substring(0, path.lastIndexOf("/") + 1);
  for (const svg of svgList) {
    let absoluteURL =
      svg.startsWith(".") || svg.startsWith("..")
        ? currentPath + svg
        : `vscode-file://vscode-app/${svg}`;
    fetchList.push(fetch(absoluteURL));
  }
  return async function mountSvgTo(
    element: Node & ParentNode,
    copy: boolean = false
  ) {
    let _this = mountSvgTo as unknown as { svgs: Node[] };
    let justCreated = false;
    if (!_this.svgs) {
      justCreated = true;
      _this.svgs = [];
      const { sanitize } = require("vs/base/browser/dompurify/dompurify");
      for (const res of await Promise.all(fetchList)) {
        const svgStr = await res.text();
        const svg = sanitize(svgStr, {
          RETURN_DOM: true,
          USE_PROFILES: { svg: true, svgFilters: true },
          ADD_ATTR: [
            "tableValues",
            "slope",
            "intercept",
            "amplitude",
            "exponent",
            "offset",
          ],
        }).firstChild as SVGElement;
        svg.style.position = "absolute";
        svg.style.width = "0px";
        svg.style.height = "0px";
        svg.style.colorInterpolation = "srgb";
        svg.style.colorInterpolationFilters = "srgb";
        _this.svgs.push(svg);
      }
    }
    if (copy || !justCreated)
      for (const svg of _this.svgs) element.appendChild(svg.cloneNode(true));
    else element.append(..._this.svgs);
  };
}
