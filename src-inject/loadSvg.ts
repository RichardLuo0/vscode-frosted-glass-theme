import { makeAbsolutePath } from "./utils";

declare const trustedTypes: any;

const ttp = trustedTypes.createPolicy("fgtSvg", {
  createHTML(html: any) {
    return html;
  },

  createScriptURL(scriptUrl: any) {
    return scriptUrl;
  },
});

export type MountSvgTo = (
  element: Node & ParentNode,
  copy?: boolean
) => Promise<void>;

export function loadSvgs(svgList: string[]): MountSvgTo {
  const fetchList = svgList.map(path =>
    fetch(makeAbsolutePath(path)).then(async res => {
      const svgStr = await res.text();
      const svg = new DOMParser()
        .parseFromString(ttp.createHTML(svgStr), "text/xml")
        .querySelector<SVGElement>("svg");
      if (!svg) throw res.url + " does not contain a valid svg!";
      svg.style.position = "absolute";
      svg.style.width = "0px";
      svg.style.height = "0px";
      svg.style.colorInterpolation = "srgb";
      svg.style.colorInterpolationFilters = "srgb";
      return svg;
    })
  );
  return async function mountSvgTo(
    element: Node & ParentNode,
    copy: boolean = false
  ) {
    const svgList = await Promise.all(fetchList);
    if (copy) svgList.forEach(svg => element.appendChild(svg.cloneNode(true)));
    else element.append(...svgList);
  };
}
