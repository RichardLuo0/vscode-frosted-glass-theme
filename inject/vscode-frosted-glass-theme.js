var Fe=Object.create;var le=Object.defineProperty;var Be=Object.getOwnPropertyDescriptor;var Me=Object.getOwnPropertyNames;var Le=Object.getPrototypeOf,$e=Object.prototype.hasOwnProperty;var Ae=(e,t)=>()=>(t||e((t={exports:{}}).exports,t),t.exports);var He=(e,t,o,n)=>{if(t&&typeof t=="object"||typeof t=="function")for(let r of Me(t))!$e.call(e,r)&&r!==o&&le(e,r,{get:()=>t[r],enumerable:!(n=Be(t,r))||n.enumerable});return e};var Pe=(e,t,o)=>(o=e!=null?Fe(Le(e)):{},He(t||!e||!e.__esModule?le(o,"default",{value:e,enumerable:!0}):o,e));var he=Ae((O,te)=>{(function(e,t){typeof O=="object"&&typeof te=="object"?te.exports=t():typeof define=="function"&&define.amd?define("fluent-reveal-effect",[],t):typeof O=="object"?O["fluent-reveal-effect"]=t():e["fluent-reveal-effect"]=t()})(O,()=>(()=>{"use strict";var e={d:(i,a)=>{for(var c in a)e.o(a,c)&&!e.o(i,c)&&Object.defineProperty(i,c,{enumerable:!0,get:a[c]})},o:(i,a)=>Object.prototype.hasOwnProperty.call(i,a),r:i=>{typeof Symbol<"u"&&Symbol.toStringTag&&Object.defineProperty(i,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(i,"__esModule",{value:!0})}},t={};function o(i,a){let c=function(s){let l=s.getBoundingClientRect();return{top:l.top,left:l.left}}(i);return[a.pageX-c.left-window.scrollX,a.pageY-c.top-window.scrollY]}function n(i,a,c,s){return`radial-gradient(circle ${i}px at ${a}px ${c}px, ${s}, rgba(255,255,255,0))`}function r(i,a,c,s,l,p=null){let f=p===null?n(l,a,c,s):p;i.style.backgroundImage=f}function u(i,a,c,s){let[l,p]=o(i,s);r(i,l,p,a,c)}function d(i,a,c,s){let[l,p]=o(i,s),f=function(R,x,b,F){return`${n(R,x,b,F)}, radial-gradient(circle 70px at ${x}px ${b}px, rgba(255,255,255,0), ${F}, rgba(255,255,255,0), rgba(255,255,255,0))`}(c,l,p,a);r(i,l,p,a,c,f)}function g(i,a){a[0]=!1,i.el.style.backgroundImage=i.oriBg}function B(i,a,c,s,l){let p=i.el;(function(f,R,x,b){let F={left:R-b,right:R+b,top:x-b,bottom:x+b},h=f.getBoundingClientRect(),$={left:h.left,right:h.right,top:h.top,bottom:h.bottom};var j,q;return!((q=$).left>(j=F).right||q.right<j.left||q.top>j.bottom||q.bottom<j.top)})(p,l.clientX,l.clientY,c)?u(p,a,c,l):g(i,s)}function y(i,a,c,s,l){let p=i.el;p.addEventListener("mousemove",f=>{s&&l[0]?d(p,a,c,f):u(p,a,c,f)}),p.addEventListener("mouseleave",()=>{g(i,l)})}function re(i,a,c,s){let l=i.el;l.addEventListener("mousedown",p=>{s[0]=!0,d(l,a,c,p)}),l.addEventListener("mouseup",p=>{s[0]=!1,u(l,a,c,p)})}function W(i,a,c){y(i,a.lightColor,a.gradientSize,a.clickEffect,c)}function V(i,a,c){y(i,a.children?.lightColor||"",a.children?.gradientSize||100,a.clickEffect,c)}function D(i,a,c){re(i,a.lightColor,a.gradientSize,c)}function X(i,a,c){re(i,a.children?.lightColor||"",a.children?.gradientSize||100,c)}function oe(i){return{oriBg:getComputedStyle(i).backgroundImage,el:i}}function ie(i){let a=[],c=i.length;for(let s=0;s<c;s++){let l=i[s];a.push(oe(l))}return a}function Y(i){return ie(document.querySelectorAll(i))}function G(i){return Object.assign({lightColor:"rgba(255,255,255,0.25)",gradientSize:150,clickEffect:!1,isContainer:!1,children:{borderSelector:".eff-reveal-border",elementSelector:".eff-reveal",lightColor:"rgba(255,255,255,0.25)",gradientSize:150}},i)}function ae(i,a,c,s,l){s(i,a,c),a.clickEffect&&l(i,a,c)}function K(i,a,c,s,l){let p=i.length;for(let f=0;f<p;f++)ae(i[f],a,c,s,l)}function ce(i,a,c,s,l){(function(p,f,R,x){let b=p.el,F=f.length;b.addEventListener("mousemove",h=>{for(let $=0;$<F;$++)B(f[$],R.lightColor,R.gradientSize,x,h)}),b.addEventListener("mouseleave",()=>{for(let h=0;h<F;h++)g(f[h],x)})})(i,Y(a.children?.borderSelector||""),a,c),K(Y(a.children?.elementSelector||""),a,c,s,l)}function se(i,a,c,s,l){let p=i.length;for(let f=0;f<p;f++)ce(i[f],a,c,s,l)}e.r(t),e.d(t,{applyEffect:()=>Re,applyElementEffect:()=>Ce,applyElementsEffect:()=>we});let Ce=(i,a={})=>{let c=[!1],s=G(a),l=oe(i);s.isContainer?ce(l,s,c,V,X):ae(l,s,c,W,D)},we=(i,a={})=>{let c=[!1],s=G(a),l=ie(i);s.isContainer?se(l,s,c,V,X):K(l,s,c,W,D)},Re=(i,a={})=>{let c=[!1],s=G(a),l=Y(i);s.isContainer?se(l,s,c,V,X):K(l,s,c,W,D)};return t})())});import Ie from"./config.json"with{type:"json"};function k(e){return e&&e instanceof HTMLElement}var de=import.meta.url,Oe=de.substring(0,de.lastIndexOf("/")+1);function Ne(){return Oe}function _(e){return e.startsWith(".")||e.startsWith("..")?Ne()+e:`vscode-file://vscode-app/${e}`}var je=trustedTypes.createPolicy("fgtSvg",{createHTML(e){return e},createScriptURL(e){return e}});function I(e){let t=[];for(let o of e)t.push(fetch(_(o)));return async function o(n,r=!1){let u=o,d=!1;if(!u.svgs){d=!0,u.svgs=[];for(let g of await Promise.all(t)){let B=await g.text(),y=new DOMParser().parseFromString(je.createHTML(B),"text/xml").querySelector("svg");if(!y)throw g.url+" does not contain a valid svg!";y.style.position="absolute",y.style.width="0px",y.style.height="0px",y.style.colorInterpolation="srgb",y.style.colorInterpolationFilters="srgb",u.svgs.push(y)}}if(r||!d)for(let g of u.svgs)n.appendChild(g.cloneNode(!0));else n.append(...u.svgs)}}import pe from"./config.json"with{type:"json"};var{opacity:v}=pe,U=[["--vscode-quickInputList-focusBackground",v.selection],["--vscode-editorSuggestWidget-selectedBackground",v.selection],["--vscode-menu-border",v.border],["--vscode-widget-border",v.border],["--vscode-editorWidget-border",v.border],["--vscode-editorHoverWidget-border",v.border],["--vscode-editorSuggestWidget-border",v.border],["--vscode-menu-separatorBackground",v.separator]];pe.revealEffect.enabled||U.push(["--vscode-menu-selectionBackground",v.selection]);function fe(e,t,o){U.push([e,t,o])}function J(e){let o=e.ownerDocument.querySelector("head > style.contributedColorTheme");if(!o)return;ue(e,o),new MutationObserver(ue.bind(globalThis,e,o)).observe(o,{characterData:!1,attributes:!1,childList:!0,subtree:!1})}function qe(e,t){if(e=e.trim(),e.startsWith("#")){let n=Math.round(t*255).toString(16);return e.length===7?e+n:e}let o=e.slice(e.indexOf("(")+1,-1);if(e.startsWith("rgb")){let n=o.split(",");if(n.length>=4)return e;let[r,u,d]=n.map(Number);return`rgba(${r}, ${u}, ${d}, ${t})`}if(e.startsWith("hsl")){let n=o.split(",");if(n.length>=4)return e;let[r,u,d]=n.map(parseFloat);return`hsla(${r}, ${u}%, ${d}%, ${t})`}return e}function _e(e){return Array.from(document.styleSheets).find(t=>t.ownerNode===e)}function ue(e,t){let o=_e(t)?.cssRules;if(!o)return;let n=o[o.length-1];if(!(n instanceof CSSStyleRule))return;let r=n.style;U.forEach(u=>{e.style.setProperty(u[2]??u[0],qe(r.getPropertyValue(u[0]),u[1]))})}import ge from"./vscode-frosted-glass-theme.css"with{type:"css"};var{filter:ze,tintSvg:We}=Ie,me=I(We),ye=[["multiDiffEditorHeader","--vscode-editor-background",".monaco-component.multiDiffEditor .header","--fgt-multiDiffEditorHeader-background"],["editorHoverWidget","--vscode-editorHoverWidget-background",".debug-hover-widget, .monaco-editor-overlaymessage .message"],["editorSuggestWidget","--vscode-editorSuggestWidget-background",".monaco-editor .suggest-details"],["peekViewResult","--vscode-peekViewResult-background",".monaco-tree-type-filter"],["quickInput","--vscode-quickInput-background",".quick-input-widget"],["menu","--vscode-menu-background",".monaco-menu-container .monaco-scrollable-element"],["notifications","--vscode-notifications-background",".notifications-list-container"],["notificationCenterHeader","--vscode-notificationCenterHeader-background",".notifications-center-header"],["hover","--vscode-editorHoverWidget-statusBarBackground",".monaco-hover"],["editorStickyScroll","--vscode-editorStickyScroll-background",".sticky-widget"],["listFilterWidget","--vscode-listFilterWidget-background",".editor-widget.find-widget"],["editorWidget","--vscode-editorWidget-background",".editor-widget, .simple-find-part, .monaco-dialog-box, .action-widget, .rename-box, .defineKeybindingWidget"],["breadcrumbPicker","--vscode-breadcrumbPicker-background",".monaco-breadcrumbs-picker > :not(.arrow)"],["debugToolBar","--vscode-debugToolBar-background",".debug-toolbar"],["treeStickyContainer","--vscode-sideBarStickyScroll-background",".monaco-tree-sticky-container","--fgt-treeStickyContainer-background"],["cellTitleToolbar","--vscode-editorStickyScroll-background",".cell-title-toolbar","--fgt-cellTitleToolbar-background"],["slider","--vscode-scrollbarSlider-background",".editor-scrollable > .scrollbar.horizontal > .slider, .monaco-scrollable-element:not(.editor-scrollable) > .scrollbar > .slider"],["sideBarSectionHeader","--vscode-sideBarSectionHeader-background",".pane-header.expanded"],["dropdown","--vscode-dropdown-background",".select-box-dropdown-list-container, .select-box-details-pane"],["minimap","--fgt-transparent",".minimap"],["decorationsOverviewRuler","--fgt-transparent",".monaco-editor .decorationsOverviewRuler"],["terminalOverlay","--fgt-transparent",".hover-overlay"]];ge.insertRule(`[role="application"] {
    --fgt-transparent: transparent;
  }`);var A={default:{filter:"",disableBackgroundColor:!0,opacity:.4}};{let e=ze,t=typeof e.default=="string"?{filter:e.default}:e.default??{},o=Object.assign(A.default,t);for(let n in e)n!="default"&&(typeof e[n]=="string"?A[n]={...o,filter:e[n]}:A[n]={...o,...e[n]})}ye.forEach(e=>{let t=A[e[0]]??A.default;fe(e[1],t.opacity,e[3]);let o=t.filter.replaceAll("{key}",e[0]);ge.insertRule(`${e[2]} {
      backdrop-filter: ${o};
      background: ${t.disableBackgroundColor?"transparent":`var(${e[1]})`} !important;
    }`)});async function Q(e){for(let t of ye){let o=document.createElement("div");o.style.setProperty("--fgt-current-background",`var(${t[1]})`),await me(o,!0),o.querySelectorAll("filter").forEach(n=>n.id=n.id+"-"+t[0]),e.appendChild(o)}}function be(e){let t=document.createElement("div");t.style.setProperty("--fgt-current-background","var(--vscode-menu-background)"),me(t,!0),t.querySelectorAll("filter").forEach(o=>o.id=o.id+"-menu"),e.appendChild(t)}import S from"./config.json"with{type:"json"};import Ve from"./config.json"with{type:"json"};import M from"./vscode-frosted-glass-theme.css"with{type:"css"};var{fakeMica:E}=Ve;E.enabled&&(M.insertRule(`[role="application"]::before {
      content: "";
      display: block;
      position: absolute;
      top: 0px;
      left: 0px;
      width: 100%;
      height: 100%;
    }`),M.insertRule(`.fgt-mica-svg-loaded::before {
      filter: ${E.filter};
      background: url("vscode-file://vscode-app/${E.url}") center center / cover no-repeat
    }`),E.titlebarFix&&M.insertRule(`.part.titlebar {
        background-color: color-mix(
          in srgb,
          var(--vscode-titleBar-activeBackground) ${E.titlebarOpacity*100}%, transparent) !important;
      }`),E.listBackgroundFix&&M.insertRule(`.monaco-list-rows {
        background-color: transparent !important;
      }`),E.editorBackgroundFix&&(M.insertRule(`.content,
      .monaco-editor,
      .monaco-editor-background,
      .view-overlays .selected-text:has(+ .monaco-editor-background) {
        background-color: transparent !important;
      }`),M.insertRule(`.editor-group-container.empty {
        background-color: var(--vscode-editor-background);
      }`)));async function Z(e,t){E.enabled&&(await t,e.classList.add("fgt-mica-svg-loaded"))}function m(e,t,o){if(!e||!e[t]||e[t]._hiddenTag)return;let n=e[t];e[t]=function(...r){return o.call(this,n.bind(this),...r)},e[t]._hiddenTag=!0}function z(e,t,o){for(let n of t)m(e,n,o)}function H(e){return function(t,...o){return e.call(this,t(...o),...o)}}function ee(e){return function(t,...o){return e.call(this,...o),t(...o)}}function C(e,t){return function(o,n,...r){return k(n)&&(e===null||n.classList.contains(e))&&t.call(this,n,...r),o(n,...r)}}function P(e,t,o,n){let r=e.querySelector("div."+t);r&&n(r),o instanceof Array?z(e,o,C(t,n)):m(e,o,C(t,n))}var ve=Pe(he());import De from"./config.json"with{type:"json"};import Xe from"./vscode-frosted-glass-theme.css"with{type:"css"};var{revealEffect:w}=De;w.enabled&&w.focusBackground&&Xe.insertRule(`ul.actions-container .action-item.focused { 
      background-color: color-mix(in srgb, var(--vscode-menu-selectionBackground) ${w.opacity*100}%, transparent) 
    }`);function Se(e){if(w.enabled){let t=e.querySelectorAll(w.disableForDisabledItem?"ul.actions-container > li:not(.disabled)":"ul.actions-container > li:not(:has(> a.separator))");(0,ve.applyElementsEffect)(t,{lightColor:`color-mix(in srgb, var(--vscode-menu-selectionBackground) ${w.opacity*100}%, transparent)`,gradientSize:w.gradientSize,clickEffect:w.clickEffect})}}function N(e){if(!k(e))return;m(e,"appendChild",(n,r)=>n(k(r)&&r.classList.contains("monaco-scrollable-element")?o(r):r));function t(n,r){function u(d){return!k(d)||d._hiddenTag||(Object.defineProperty(d,"parentNode",{get(){return n}}),n._subMenu=d,m(n,"contains",H((g,B)=>g||n._subMenu===B||(n._subMenu?.contains(B)??!1))),d.addEventListener("focusout",g=>setTimeout(()=>n.dispatchEvent(new Event(g.type,{...g,bubbles:!1})))),N(d),d._hiddenTag=!0),d}n.append=d=>r.append(u(d)),n.removeChild=d=>r.removeChild(d),n.replaceChild=(d,g)=>r.replaceChild(u(d),g)}function o(n){if(!k(n))return n;let r=n.querySelector("div.monaco-action-bar");if(!r)return n;let u=r.cloneNode();for(let d of Array.from(r.children))u.appendChild(d);return r.parentNode?.replaceChild(u,r),r.className="",r.appendChild(n),r.querySelectorAll("ul.actions-container > li:has(> .monaco-submenu-item)").forEach(d=>t(d,r)),Se(r),r}}function Te(e){let t=r=>{k(r)&&z(r,["append","appendChild"],ee(N))};(function(){let r=e.querySelector("#workbench\\.parts\\.titlebar > div > div.titlebar-left");if(!r)return;P(r,"menubar","append",d=>{d.querySelectorAll("div.menubar-menu-button").forEach(t),z(d,["append","appendChild","insertBefore"],ee(t))})})();function o(r){if(!r)return;P(r,"menubar","prepend",d=>{P(d,"menubar-menu-button","appendChild",t)})}o(e.querySelector("#workbench\\.parts\\.activitybar > div.content"));let n=e.querySelector("#workbench\\.parts\\.sidebar");n&&P(n,"composite",["insertBefore","appendChild"],u=>o(u.querySelector("div.composite-bar-container")))}var xe=N;import Ye from"./config.json"with{type:"json"};import ne from"./vscode-frosted-glass-theme.css"with{type:"css"};var{miscellaneous:Ge}=Ye;Ge.progressBarBehindSectionHeader?(ne.insertRule(`
    .pane > .monaco-progress-container {
      height: 22px !important;
      top: 0px !important;
    }`),ne.insertRule(`
    .pane > .monaco-progress-container > .progress-bit {
      height: 22px !important;
      left: 1px !important;
    }`)):ne.insertRule(`
    .pane > .monaco-progress-container {
      z-index: 20;
    }`);import T from"./vscode-frosted-glass-theme.css"with{type:"css"};var{opacity:Ke,borderRadius:L}=S;T.insertRule(`[role="application"] {
    --fgt-transition: ${S.transition};
    --fgt-animation-menu: ${S.animation.menu};
    --fgt-animation-dialog: ${S.animation.dialog};
    --fgt-minimap-opacity: ${Ke.minimap*100}%;
  }`);for(let e of S.additionalStyle){let t=document.createElement("link");t.setAttribute("rel","stylesheet"),t.setAttribute("type","text/css"),t.setAttribute("href",_(e)),document.head.append(t)}function ke(e,t){T.insertRule(`${e} {
    ${Object.entries(t).reduce((o,n)=>{let[r,u]=n;return o+`--${r}: ${u};`},"")}
  }`)}ke('[role="application"]',S.variable);ke('[role="application"].vs-dark, [role="application"].hc-black',S.variableDark);S.revealEffect.enabled?T.insertRule(`.monaco-menu-container ul.actions-container > li > a.action-menu-item {
      background-color: transparent !important;
      outline: none !important;
    }`):L.menuItem&&T.insertRule(`.monaco-menu-container ul.actions-container > li > a.action-menu-item {
      border-radius: ${L.menuItem} !important;
    }`);L.menu&&T.insertRule(`.monaco-menu-container .monaco-scrollable-element {
      border-radius: ${L.menu} !important;
    }`);L.suggestWidget&&T.insertRule(`.editor-widget.suggest-widget {
      border-radius: ${L.suggestWidget} !important;
      overflow: hidden;
    }`);document.adoptedStyleSheets.push(T);var Ee=I(S.svg);m(document.body,"appendChild",C("monaco-workbench",e=>{J(e);let t=Ee(e);Z(e,t),Q(e),m(e,"prepend",C("monaco-grid-view",Te)),m(e,"appendChild",C("context-view",xe))}));m(Element.prototype,"attachShadow",H(e=>(e.adoptedStyleSheets.push(...e.ownerDocument.adoptedStyleSheets),be(e),m(e,"appendChild",C("monaco-menu-container",N)),e)));m(window,"open",H(e=>{if(!e)return e;let t=e,o=e.document,n=new t.CSSStyleSheet;for(let r=0;r<T.cssRules.length;r++)n.insertRule(T.cssRules[r].cssText);return o.adoptedStyleSheets.push(n),m(o.body,"append",C(null,r=>{J(r);let u=Ee(r);Z(r,u),Q(r)})),e}));
//# sourceMappingURL=vscode-frosted-glass-theme.js.map
