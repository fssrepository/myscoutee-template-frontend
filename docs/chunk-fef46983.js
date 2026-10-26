import{b2 as Gt,bY as Yt,aC as I,aP as _t,M as St,aV as G,B as D,cg as W,bS as Q,E as b,bv as P,c6 as o,D as g,cm as x,as as Zt,av as Ct,aZ as Kt,ai as tt,aT as B,au as Xt,A as Jt,aW as M,ca as Wt,c3 as Qt,n as k,ar as a,bo as r,bC as l,Z as h,X as L,bx as d,v as c,aB as U,C as E,bT as Pt,bO as Y,bK as q,cj as te,by as Mt,bV as ee,a as ne,aM as T,Y as et,am as Nt,cp as Ot,bW as y,ah as m,bA as R,a2 as u,g as N,a7 as w,az as _,ce as kt,bn as z,f as ie,i as oe,l as nt,an as ae,cf as it,bf as re,c5 as se,J as ot,b7 as le,bc as at,I as Lt,ad as de,ae as rt,q as st,aE as lt,bG as dt,cl as ct,c9 as Rt}from"./main-4bf72aea.js";import{ae as mt,a_ as ce,bb as me,X as ue,v as pe,ap as be,bB as ge,a3 as j,U as V,ab as F,b7 as zt,by as Z,bO as he,b4 as fe,l as ve,ad as xe,bG as It,af as At,aF as ye,bM as we,ai as ut,bt as _e,bl as $,b0 as Ut,aj as Et,bS as K,m as Se,bc as Ce,am as Pe,aY as Me,aV as Ne,bg as Oe,ak as ke,bC as qt,bP as Le,b5 as Re,a4 as ze,J as Ie,aM as Ae,aq as Ue,ay as Ee,as as qe,d as Te}from"./chunk-2564ce9c.js";var $e=new Jt("MAT_BUTTON_CONFIG");function Tt(n){return n==null?void 0:Qt(n)}var $t=(()=>{class n{_elementRef=x(Zt);_ngZone=x(Ct);_animationsDisabled=me();_config=x($e,{optional:!0});_focusMonitor=x(ue);_cleanupClick;_renderer=x(Kt);_rippleLoader=x(pe);_isAnchor;_isFab=!1;color;get disableRipple(){return this._disableRipple}set disableRipple(e){this._disableRipple=e,this._updateRippleDisabled()}_disableRipple=!1;get disabled(){return this._disabled}set disabled(e){this._disabled=e,this._updateRippleDisabled()}_disabled=!1;ariaDisabled;disabledInteractive;tabIndex;set _tabindex(e){this.tabIndex=e}showProgress=tt(!1,{transform:B});constructor(){x(be).load(ge);let e=this._elementRef.nativeElement;this._isAnchor=e.tagName==="A",this.disabledInteractive=this._config?.disabledInteractive??!1,this.color=this._config?.color??null,this._rippleLoader?.configureRipple(e,{className:"mat-mdc-button-ripple"})}ngAfterViewInit(){this._focusMonitor.monitor(this._elementRef,!0),this._isAnchor&&this._setupAsAnchor()}ngOnDestroy(){this._cleanupClick?.(),this._focusMonitor.stopMonitoring(this._elementRef),this._rippleLoader?.destroyRipple(this._elementRef.nativeElement)}focus(e="program",i){e?this._focusMonitor.focusVia(this._elementRef.nativeElement,e,i):this._elementRef.nativeElement.focus(i)}_getAriaDisabled(){return this.ariaDisabled!=null?this.ariaDisabled:this._isAnchor?this.disabled||null:this.disabled&&this.disabledInteractive?!0:null}_getDisabledAttribute(){return this.disabledInteractive||!this.disabled?null:!0}_updateRippleDisabled(){this._rippleLoader?.setDisabled(this._elementRef.nativeElement,this.disableRipple||this.disabled)}_getTabIndex(){return this._isAnchor?this.disabled&&!this.disabledInteractive?-1:this.tabIndex:this.tabIndex}_setupAsAnchor(){this._cleanupClick=this._ngZone.runOutsideAngular(()=>this._renderer.listen(this._elementRef.nativeElement,"click",e=>{this.disabled&&(e.preventDefault(),e.stopImmediatePropagation())}))}static \u0275fac=function(e){return new(e||n)};static \u0275dir=Xt({type:n,hostAttrs:[1,"mat-mdc-button-base"],hostVars:15,hostBindings:function(e,i){e&2&&(M("disabled",i._getDisabledAttribute())("aria-disabled",i._getAriaDisabled())("tabindex",i._getTabIndex()),Wt(i.color?"mat-"+i.color:""),P("mat-mdc-button-progress-indicator-shown",i.showProgress())("mat-mdc-button-disabled",i.disabled)("mat-mdc-button-disabled-interactive",i.disabledInteractive)("mat-unthemed",!i.color)("_mat-animation-noopable",i._animationsDisabled))},inputs:{color:"color",disableRipple:[2,"disableRipple","disableRipple",B],disabled:[2,"disabled","disabled",B],ariaDisabled:[2,"aria-disabled","ariaDisabled",B],disabledInteractive:[2,"disabledInteractive","disabledInteractive",B],tabIndex:[2,"tabIndex","tabIndex",Tt],_tabindex:[2,"tabindex","_tabindex",Tt],showProgress:[1,"showProgress"]}})}return n})(),De=(()=>{class n extends $t{constructor(){super(),this._rippleLoader.configureRipple(this._elementRef.nativeElement,{centered:!0})}static \u0275fac=function(e){return new(e||n)};static \u0275cmp=(function(){let e=["*",[["","progressIndicator",""]]],i=["*","[progressIndicator]"];function s(p,f){p&1&&(W(0,"div",1),D(1,1),Q())}return I({type:n,selectors:[["button","mat-icon-button",""],["a","mat-icon-button",""],["button","matIconButton",""],["a","matIconButton",""]],hostAttrs:[1,"mdc-icon-button","mat-mdc-icon-button"],exportAs:["matButton","matAnchor"],features:[_t],ngContentSelectors:i,decls:5,vars:1,consts:[[1,"mat-mdc-button-persistent-ripple","mdc-icon-button__ripple"],[1,"mat-mdc-button-progress-indicator-container"],[1,"mat-focus-indicator"],[1,"mat-mdc-button-touch-target"]],template:function(p,f){p&1&&(St(e),G(0,"span",0),D(1),b(2,s,2,0,"div",1),G(3,"span",2)(4,"span",3)),p&2&&(o(2),g(f.showProgress()?2:-1))},styles:[`.mat-mdc-icon-button {
  -webkit-user-select: none;
  user-select: none;
  display: inline-block;
  position: relative;
  box-sizing: border-box;
  border: none;
  outline: none;
  background-color: transparent;
  fill: currentColor;
  text-decoration: none;
  cursor: pointer;
  z-index: 0;
  overflow: visible;
  border-radius: var(--%NS%mat-icon-button-container-shape, var(--%NS%mat-sys-corner-full, 50%));
  flex-shrink: 0;
  text-align: center;
  width: var(--%NS%mat-icon-button-state-layer-size, 40px);
  height: var(--%NS%mat-icon-button-state-layer-size, 40px);
  padding: calc(calc(var(--%NS%mat-icon-button-state-layer-size, 40px) - var(--%NS%mat-icon-button-icon-size, 24px)) / 2);
  font-size: var(--%NS%mat-icon-button-icon-size, 24px);
  color: var(--%NS%mat-icon-button-icon-color, var(--%NS%mat-sys-on-surface-variant));
  -webkit-tap-highlight-color: transparent;
}
.mat-mdc-icon-button .mat-mdc-button-ripple,
.mat-mdc-icon-button .mat-mdc-button-persistent-ripple,
.mat-mdc-icon-button .mat-mdc-button-persistent-ripple::before {
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  position: absolute;
  pointer-events: none;
  border-radius: inherit;
}
.mat-mdc-icon-button .mat-mdc-button-ripple {
  overflow: hidden;
}
.mat-mdc-icon-button .mat-mdc-button-persistent-ripple::before {
  content: "";
  opacity: 0;
}
.mat-mdc-icon-button .mdc-button__label,
.mat-mdc-icon-button .mat-icon {
  z-index: 1;
  position: relative;
}
.mat-mdc-icon-button .mat-focus-indicator {
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  position: absolute;
  border-radius: inherit;
}
.mat-mdc-icon-button:focus-visible > .mat-focus-indicator::before {
  content: "";
  border-radius: inherit;
}
.mat-mdc-icon-button .mat-ripple-element {
  background-color: var(--%NS%mat-icon-button-ripple-color, color-mix(in srgb, var(--%NS%mat-sys-on-surface-variant) calc(var(--%NS%mat-sys-pressed-state-layer-opacity) * 100%), transparent));
}
.mat-mdc-icon-button .mat-mdc-button-persistent-ripple::before {
  background-color: var(--%NS%mat-icon-button-state-layer-color, var(--%NS%mat-sys-on-surface-variant));
}
.mat-mdc-icon-button.mat-mdc-button-disabled .mat-mdc-button-persistent-ripple::before {
  background-color: var(--%NS%mat-icon-button-disabled-state-layer-color, var(--%NS%mat-sys-on-surface-variant));
}
.mat-mdc-icon-button:hover > .mat-mdc-button-persistent-ripple::before {
  opacity: var(--%NS%mat-icon-button-hover-state-layer-opacity, var(--%NS%mat-sys-hover-state-layer-opacity));
}
.mat-mdc-icon-button.cdk-program-focused > .mat-mdc-button-persistent-ripple::before, .mat-mdc-icon-button.cdk-keyboard-focused > .mat-mdc-button-persistent-ripple::before, .mat-mdc-icon-button.mat-mdc-button-disabled-interactive:focus > .mat-mdc-button-persistent-ripple::before {
  opacity: var(--%NS%mat-icon-button-focus-state-layer-opacity, var(--%NS%mat-sys-focus-state-layer-opacity));
}
.mat-mdc-icon-button:active > .mat-mdc-button-persistent-ripple::before {
  opacity: var(--%NS%mat-icon-button-pressed-state-layer-opacity, var(--%NS%mat-sys-pressed-state-layer-opacity));
}
.mat-mdc-icon-button .mat-mdc-button-touch-target {
  position: absolute;
  top: 50%;
  height: var(--%NS%mat-icon-button-touch-target-size, 48px);
  display: var(--%NS%mat-icon-button-touch-target-display, block);
  left: 50%;
  width: var(--%NS%mat-icon-button-touch-target-size, 48px);
  transform: translate(-50%, -50%);
}
.mat-mdc-icon-button._mat-animation-noopable {
  transition: none !important;
  animation: none !important;
}
.mat-mdc-icon-button[disabled], .mat-mdc-icon-button.mat-mdc-button-disabled {
  cursor: default;
  pointer-events: none;
  color: var(--%NS%mat-icon-button-disabled-icon-color, color-mix(in srgb, var(--%NS%mat-sys-on-surface) 38%, transparent));
}
.mat-mdc-icon-button.mat-mdc-button-disabled-interactive {
  pointer-events: auto;
}
.mat-mdc-icon-button img,
.mat-mdc-icon-button svg {
  width: var(--%NS%mat-icon-button-icon-size, 24px);
  height: var(--%NS%mat-icon-button-icon-size, 24px);
  vertical-align: baseline;
}
.mat-mdc-icon-button .mat-mdc-button-progress-indicator-container .mdc-circular-progress__determinate-circle-graphic {
  width: inherit;
  height: inherit;
}
.mat-mdc-icon-button .mat-mdc-button-progress-indicator-container .mdc-circular-progress__indeterminate-circle-graphic {
  height: 100%;
}
.mat-mdc-icon-button .mat-mdc-button-persistent-ripple {
  border-radius: var(--%NS%mat-icon-button-container-shape, var(--%NS%mat-sys-corner-full, 50%));
}
.mat-mdc-icon-button[hidden] {
  display: none;
}
.mat-mdc-icon-button.mat-unthemed:not(.mdc-ripple-upgraded):focus::before, .mat-mdc-icon-button.mat-primary:not(.mdc-ripple-upgraded):focus::before, .mat-mdc-icon-button.mat-accent:not(.mdc-ripple-upgraded):focus::before, .mat-mdc-icon-button.mat-warn:not(.mdc-ripple-upgraded):focus::before {
  background: transparent;
  opacity: 1;
}

.mat-mdc-button-progress-indicator-container {
  position: absolute;
  inset-inline-start: 0;
  inset-block-start: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
}

.mat-mdc-button-progress-indicator-shown mat-icon {
  visibility: hidden;
}
`,`@media (forced-colors: active) {
  .mat-mdc-button:not(.mdc-button--outlined),
  .mat-mdc-unelevated-button:not(.mdc-button--outlined),
  .mat-mdc-raised-button:not(.mdc-button--outlined),
  .mat-mdc-outlined-button:not(.mdc-button--outlined),
  .mat-mdc-button-base.mat-tonal-button,
  .mat-mdc-icon-button.mat-mdc-icon-button,
  .mat-mdc-outlined-button .mdc-button__ripple {
    outline: solid 1px;
  }
}
`],encapsulation:2})})()}return n})(),Dt=new Map([["text",["mat-mdc-button"]],["filled",["mdc-button--unelevated","mat-mdc-unelevated-button"]],["elevated",["mdc-button--raised","mat-mdc-raised-button"]],["outlined",["mdc-button--outlined","mat-mdc-outlined-button"]],["tonal",["mat-tonal-button"]]]),Bt=(()=>{class n extends $t{get appearance(){return this._appearance}set appearance(e){this.setAppearance(e||this._config?.defaultAppearance||"text")}_appearance=null;constructor(){super();let e=Be(this._elementRef.nativeElement);e&&this.setAppearance(e)}setAppearance(e){if(e===this._appearance)return;let i=this._elementRef.nativeElement.classList,s=this._appearance?Dt.get(this._appearance):null,p=Dt.get(e);s&&i.remove(...s),i.add(...p),this._appearance=e}static \u0275fac=function(e){return new(e||n)};static \u0275cmp=(function(){let e=[[["",8,"material-icons",3,"iconPositionEnd",""],["mat-icon",3,"iconPositionEnd",""],["","matButtonIcon","",3,"iconPositionEnd",""],["",8,"material-symbols-outlined",3,"iconPositionEnd",""],["",8,"material-symbols-rounded",3,"iconPositionEnd",""],["",8,"material-symbols-sharp",3,"iconPositionEnd",""]],"*",[["","iconPositionEnd","",8,"material-icons"],["mat-icon","iconPositionEnd",""],["","matButtonIcon","","iconPositionEnd",""],["","iconPositionEnd","",8,"material-symbols-outlined"],["","iconPositionEnd","",8,"material-symbols-rounded"],["","iconPositionEnd","",8,"material-symbols-sharp"]],[["","progressIndicator",""]]],i=[".material-icons:not([iconPositionEnd]), mat-icon:not([iconPositionEnd]), [matButtonIcon]:not([iconPositionEnd]), .material-symbols-outlined:not([iconPositionEnd]), .material-symbols-rounded:not([iconPositionEnd]), .material-symbols-sharp:not([iconPositionEnd])","*",".material-icons[iconPositionEnd], mat-icon[iconPositionEnd], [matButtonIcon][iconPositionEnd], .material-symbols-outlined[iconPositionEnd], .material-symbols-rounded[iconPositionEnd], .material-symbols-sharp[iconPositionEnd]","[progressIndicator]"];function s(p,f){p&1&&(W(0,"div",2),D(1,3),Q())}return I({type:n,selectors:[["button","matButton",""],["a","matButton",""],["button","mat-button",""],["button","mat-raised-button",""],["button","mat-flat-button",""],["button","mat-stroked-button",""],["a","mat-button",""],["a","mat-raised-button",""],["a","mat-flat-button",""],["a","mat-stroked-button",""]],hostAttrs:[1,"mdc-button"],inputs:{appearance:[0,"matButton","appearance"]},exportAs:["matButton","matAnchor"],features:[_t],ngContentSelectors:i,decls:8,vars:5,consts:[[1,"mat-mdc-button-persistent-ripple"],[1,"mdc-button__label"],[1,"mat-mdc-button-progress-indicator-container"],[1,"mat-focus-indicator"],[1,"mat-mdc-button-touch-target"]],template:function(p,f){p&1&&(St(e),G(0,"span",0),D(1),W(2,"span",1),D(3,1),Q(),D(4,2),b(5,s,2,0,"div",2),G(6,"span",3)(7,"span",4)),p&2&&(P("mdc-button__ripple",!f._isFab)("mdc-fab__ripple",f._isFab),o(5),g(f.showProgress()?5:-1))},styles:[`.mat-mdc-button-base {
  text-decoration: none;
}
.mat-mdc-button-base .mat-icon {
  min-height: fit-content;
  flex-shrink: 0;
}
@media (hover: none) {
  .mat-mdc-button-base:hover > span.mat-mdc-button-persistent-ripple::before {
    opacity: 0;
  }
}

.mdc-button {
  -webkit-user-select: none;
  user-select: none;
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  min-width: 64px;
  border: none;
  outline: none;
  line-height: inherit;
  -webkit-appearance: none;
  overflow: visible;
  vertical-align: middle;
  background: transparent;
  padding: 0 8px;
}
.mdc-button::-moz-focus-inner {
  padding: 0;
  border: 0;
}
.mdc-button:active {
  outline: none;
}
.mdc-button:hover {
  cursor: pointer;
}
.mdc-button:disabled {
  cursor: default;
  pointer-events: none;
}
.mdc-button[hidden] {
  display: none;
}
.mdc-button .mdc-button__label {
  position: relative;
}

.mat-mdc-button {
  padding: 0 var(--%NS%mat-button-text-horizontal-padding, 12px);
  height: var(--%NS%mat-button-text-container-height, 40px);
  font-family: var(--%NS%mat-button-text-label-text-font, var(--%NS%mat-sys-label-large-font));
  font-size: var(--%NS%mat-button-text-label-text-size, var(--%NS%mat-sys-label-large-size));
  letter-spacing: var(--%NS%mat-button-text-label-text-tracking, var(--%NS%mat-sys-label-large-tracking));
  text-transform: var(--%NS%mat-button-text-label-text-transform);
  font-weight: var(--%NS%mat-button-text-label-text-weight, var(--%NS%mat-sys-label-large-weight));
}
.mat-mdc-button, .mat-mdc-button .mdc-button__ripple {
  border-radius: var(--%NS%mat-button-text-container-shape, var(--%NS%mat-sys-corner-full));
}
.mat-mdc-button:not(:disabled) {
  color: var(--%NS%mat-button-text-label-text-color, var(--%NS%mat-sys-primary));
}
.mat-mdc-button[disabled], .mat-mdc-button.mat-mdc-button-disabled {
  cursor: default;
  pointer-events: none;
  color: var(--%NS%mat-button-text-disabled-label-text-color, color-mix(in srgb, var(--%NS%mat-sys-on-surface) 38%, transparent));
}
.mat-mdc-button.mat-mdc-button-disabled-interactive {
  pointer-events: auto;
}
.mat-mdc-button:has(.material-icons, .material-symbols-outlined, .material-symbols-rounded,
.material-symbols-sharp, mat-icon, [matButtonIcon]) {
  padding: 0 var(--%NS%mat-button-text-with-icon-horizontal-padding, 16px);
}
.mat-mdc-button > .mat-icon {
  margin-right: var(--%NS%mat-button-text-icon-spacing, 8px);
  margin-left: var(--%NS%mat-button-text-icon-offset, -4px);
}
[dir=rtl] .mat-mdc-button > .mat-icon {
  margin-right: var(--%NS%mat-button-text-icon-offset, -4px);
  margin-left: var(--%NS%mat-button-text-icon-spacing, 8px);
}
.mat-mdc-button .mdc-button__label + .mat-icon {
  margin-right: var(--%NS%mat-button-text-icon-offset, -4px);
  margin-left: var(--%NS%mat-button-text-icon-spacing, 8px);
}
[dir=rtl] .mat-mdc-button .mdc-button__label + .mat-icon {
  margin-right: var(--%NS%mat-button-text-icon-spacing, 8px);
  margin-left: var(--%NS%mat-button-text-icon-offset, -4px);
}
.mat-mdc-button .mat-ripple-element {
  background-color: var(--%NS%mat-button-text-ripple-color, color-mix(in srgb, var(--%NS%mat-sys-primary) calc(var(--%NS%mat-sys-pressed-state-layer-opacity) * 100%), transparent));
}
.mat-mdc-button .mat-mdc-button-persistent-ripple::before {
  background-color: var(--%NS%mat-button-text-state-layer-color, var(--%NS%mat-sys-primary));
}
.mat-mdc-button.mat-mdc-button-disabled .mat-mdc-button-persistent-ripple::before {
  background-color: var(--%NS%mat-button-text-disabled-state-layer-color, var(--%NS%mat-sys-on-surface-variant));
}
.mat-mdc-button:hover > .mat-mdc-button-persistent-ripple::before {
  opacity: var(--%NS%mat-button-text-hover-state-layer-opacity, var(--%NS%mat-sys-hover-state-layer-opacity));
}
.mat-mdc-button.cdk-program-focused > .mat-mdc-button-persistent-ripple::before, .mat-mdc-button.cdk-keyboard-focused > .mat-mdc-button-persistent-ripple::before, .mat-mdc-button.mat-mdc-button-disabled-interactive:focus > .mat-mdc-button-persistent-ripple::before {
  opacity: var(--%NS%mat-button-text-focus-state-layer-opacity, var(--%NS%mat-sys-focus-state-layer-opacity));
}
.mat-mdc-button:active > .mat-mdc-button-persistent-ripple::before {
  opacity: var(--%NS%mat-button-text-pressed-state-layer-opacity, var(--%NS%mat-sys-pressed-state-layer-opacity));
}
.mat-mdc-button .mat-mdc-button-touch-target {
  position: absolute;
  top: 50%;
  height: var(--%NS%mat-button-text-touch-target-size, 48px);
  display: var(--%NS%mat-button-text-touch-target-display, block);
  left: 0;
  right: 0;
  transform: translateY(-50%);
}

.mat-mdc-unelevated-button {
  transition: box-shadow 280ms cubic-bezier(0.4, 0, 0.2, 1);
  height: var(--%NS%mat-button-filled-container-height, 40px);
  font-family: var(--%NS%mat-button-filled-label-text-font, var(--%NS%mat-sys-label-large-font));
  font-size: var(--%NS%mat-button-filled-label-text-size, var(--%NS%mat-sys-label-large-size));
  letter-spacing: var(--%NS%mat-button-filled-label-text-tracking, var(--%NS%mat-sys-label-large-tracking));
  text-transform: var(--%NS%mat-button-filled-label-text-transform);
  font-weight: var(--%NS%mat-button-filled-label-text-weight, var(--%NS%mat-sys-label-large-weight));
  padding: 0 var(--%NS%mat-button-filled-horizontal-padding, 24px);
}
.mat-mdc-unelevated-button > .mat-icon {
  margin-right: var(--%NS%mat-button-filled-icon-spacing, 8px);
  margin-left: var(--%NS%mat-button-filled-icon-offset, -8px);
}
[dir=rtl] .mat-mdc-unelevated-button > .mat-icon {
  margin-right: var(--%NS%mat-button-filled-icon-offset, -8px);
  margin-left: var(--%NS%mat-button-filled-icon-spacing, 8px);
}
.mat-mdc-unelevated-button .mdc-button__label + .mat-icon {
  margin-right: var(--%NS%mat-button-filled-icon-offset, -8px);
  margin-left: var(--%NS%mat-button-filled-icon-spacing, 8px);
}
[dir=rtl] .mat-mdc-unelevated-button .mdc-button__label + .mat-icon {
  margin-right: var(--%NS%mat-button-filled-icon-spacing, 8px);
  margin-left: var(--%NS%mat-button-filled-icon-offset, -8px);
}
.mat-mdc-unelevated-button .mat-ripple-element {
  background-color: var(--%NS%mat-button-filled-ripple-color, color-mix(in srgb, var(--%NS%mat-sys-on-primary) calc(var(--%NS%mat-sys-pressed-state-layer-opacity) * 100%), transparent));
}
.mat-mdc-unelevated-button .mat-mdc-button-persistent-ripple::before {
  background-color: var(--%NS%mat-button-filled-state-layer-color, var(--%NS%mat-sys-on-primary));
}
.mat-mdc-unelevated-button.mat-mdc-button-disabled .mat-mdc-button-persistent-ripple::before {
  background-color: var(--%NS%mat-button-filled-disabled-state-layer-color, var(--%NS%mat-sys-on-surface-variant));
}
.mat-mdc-unelevated-button:hover > .mat-mdc-button-persistent-ripple::before {
  opacity: var(--%NS%mat-button-filled-hover-state-layer-opacity, var(--%NS%mat-sys-hover-state-layer-opacity));
}
.mat-mdc-unelevated-button.cdk-program-focused > .mat-mdc-button-persistent-ripple::before, .mat-mdc-unelevated-button.cdk-keyboard-focused > .mat-mdc-button-persistent-ripple::before, .mat-mdc-unelevated-button.mat-mdc-button-disabled-interactive:focus > .mat-mdc-button-persistent-ripple::before {
  opacity: var(--%NS%mat-button-filled-focus-state-layer-opacity, var(--%NS%mat-sys-focus-state-layer-opacity));
}
.mat-mdc-unelevated-button:active > .mat-mdc-button-persistent-ripple::before {
  opacity: var(--%NS%mat-button-filled-pressed-state-layer-opacity, var(--%NS%mat-sys-pressed-state-layer-opacity));
}
.mat-mdc-unelevated-button .mat-mdc-button-touch-target {
  position: absolute;
  top: 50%;
  height: var(--%NS%mat-button-filled-touch-target-size, 48px);
  display: var(--%NS%mat-button-filled-touch-target-display, block);
  left: 0;
  right: 0;
  transform: translateY(-50%);
}
.mat-mdc-unelevated-button:not(:disabled) {
  color: var(--%NS%mat-button-filled-label-text-color, var(--%NS%mat-sys-on-primary));
  background-color: var(--%NS%mat-button-filled-container-color, var(--%NS%mat-sys-primary));
}
.mat-mdc-unelevated-button, .mat-mdc-unelevated-button .mdc-button__ripple {
  border-radius: var(--%NS%mat-button-filled-container-shape, var(--%NS%mat-sys-corner-full));
}
.mat-mdc-unelevated-button .mat-mdc-button-progress-indicator-container {
  --%NS%mat-progress-spinner-active-indicator-color: var(--%NS%mat-button-filled-progress-active-indicator-color, var(--%NS%mat-sys-on-primary));
}
.mat-mdc-unelevated-button[disabled], .mat-mdc-unelevated-button.mat-mdc-button-disabled {
  cursor: default;
  pointer-events: none;
  color: var(--%NS%mat-button-filled-disabled-label-text-color, color-mix(in srgb, var(--%NS%mat-sys-on-surface) 38%, transparent));
  background-color: var(--%NS%mat-button-filled-disabled-container-color, color-mix(in srgb, var(--%NS%mat-sys-on-surface) 12%, transparent));
}
.mat-mdc-unelevated-button.mat-mdc-button-disabled-interactive {
  pointer-events: auto;
}

.mat-mdc-raised-button {
  transition: box-shadow 280ms cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: var(--%NS%mat-button-protected-container-elevation-shadow, var(--%NS%mat-sys-level1));
  height: var(--%NS%mat-button-protected-container-height, 40px);
  font-family: var(--%NS%mat-button-protected-label-text-font, var(--%NS%mat-sys-label-large-font));
  font-size: var(--%NS%mat-button-protected-label-text-size, var(--%NS%mat-sys-label-large-size));
  letter-spacing: var(--%NS%mat-button-protected-label-text-tracking, var(--%NS%mat-sys-label-large-tracking));
  text-transform: var(--%NS%mat-button-protected-label-text-transform);
  font-weight: var(--%NS%mat-button-protected-label-text-weight, var(--%NS%mat-sys-label-large-weight));
  padding: 0 var(--%NS%mat-button-protected-horizontal-padding, 24px);
}
.mat-mdc-raised-button > .mat-icon {
  margin-right: var(--%NS%mat-button-protected-icon-spacing, 8px);
  margin-left: var(--%NS%mat-button-protected-icon-offset, -8px);
}
[dir=rtl] .mat-mdc-raised-button > .mat-icon {
  margin-right: var(--%NS%mat-button-protected-icon-offset, -8px);
  margin-left: var(--%NS%mat-button-protected-icon-spacing, 8px);
}
.mat-mdc-raised-button .mdc-button__label + .mat-icon {
  margin-right: var(--%NS%mat-button-protected-icon-offset, -8px);
  margin-left: var(--%NS%mat-button-protected-icon-spacing, 8px);
}
[dir=rtl] .mat-mdc-raised-button .mdc-button__label + .mat-icon {
  margin-right: var(--%NS%mat-button-protected-icon-spacing, 8px);
  margin-left: var(--%NS%mat-button-protected-icon-offset, -8px);
}
.mat-mdc-raised-button .mat-ripple-element {
  background-color: var(--%NS%mat-button-protected-ripple-color, color-mix(in srgb, var(--%NS%mat-sys-primary) calc(var(--%NS%mat-sys-pressed-state-layer-opacity) * 100%), transparent));
}
.mat-mdc-raised-button .mat-mdc-button-persistent-ripple::before {
  background-color: var(--%NS%mat-button-protected-state-layer-color, var(--%NS%mat-sys-primary));
}
.mat-mdc-raised-button.mat-mdc-button-disabled .mat-mdc-button-persistent-ripple::before {
  background-color: var(--%NS%mat-button-protected-disabled-state-layer-color, var(--%NS%mat-sys-on-surface-variant));
}
.mat-mdc-raised-button:hover > .mat-mdc-button-persistent-ripple::before {
  opacity: var(--%NS%mat-button-protected-hover-state-layer-opacity, var(--%NS%mat-sys-hover-state-layer-opacity));
}
.mat-mdc-raised-button.cdk-program-focused > .mat-mdc-button-persistent-ripple::before, .mat-mdc-raised-button.cdk-keyboard-focused > .mat-mdc-button-persistent-ripple::before, .mat-mdc-raised-button.mat-mdc-button-disabled-interactive:focus > .mat-mdc-button-persistent-ripple::before {
  opacity: var(--%NS%mat-button-protected-focus-state-layer-opacity, var(--%NS%mat-sys-focus-state-layer-opacity));
}
.mat-mdc-raised-button:active > .mat-mdc-button-persistent-ripple::before {
  opacity: var(--%NS%mat-button-protected-pressed-state-layer-opacity, var(--%NS%mat-sys-pressed-state-layer-opacity));
}
.mat-mdc-raised-button .mat-mdc-button-touch-target {
  position: absolute;
  top: 50%;
  height: var(--%NS%mat-button-protected-touch-target-size, 48px);
  display: var(--%NS%mat-button-protected-touch-target-display, block);
  left: 0;
  right: 0;
  transform: translateY(-50%);
}
.mat-mdc-raised-button:not(:disabled) {
  color: var(--%NS%mat-button-protected-label-text-color, var(--%NS%mat-sys-primary));
  background-color: var(--%NS%mat-button-protected-container-color, var(--%NS%mat-sys-surface));
}
.mat-mdc-raised-button, .mat-mdc-raised-button .mdc-button__ripple {
  border-radius: var(--%NS%mat-button-protected-container-shape, var(--%NS%mat-sys-corner-full));
}
@media (hover: hover) {
  .mat-mdc-raised-button:hover {
    box-shadow: var(--%NS%mat-button-protected-hover-container-elevation-shadow, var(--%NS%mat-sys-level2));
  }
}
.mat-mdc-raised-button:focus {
  box-shadow: var(--%NS%mat-button-protected-focus-container-elevation-shadow, var(--%NS%mat-sys-level1));
}
.mat-mdc-raised-button:active, .mat-mdc-raised-button:focus:active {
  box-shadow: var(--%NS%mat-button-protected-pressed-container-elevation-shadow, var(--%NS%mat-sys-level1));
}
.mat-mdc-raised-button[disabled], .mat-mdc-raised-button.mat-mdc-button-disabled {
  cursor: default;
  pointer-events: none;
  color: var(--%NS%mat-button-protected-disabled-label-text-color, color-mix(in srgb, var(--%NS%mat-sys-on-surface) 38%, transparent));
  background-color: var(--%NS%mat-button-protected-disabled-container-color, color-mix(in srgb, var(--%NS%mat-sys-on-surface) 12%, transparent));
}
.mat-mdc-raised-button[disabled].mat-mdc-button-disabled, .mat-mdc-raised-button.mat-mdc-button-disabled.mat-mdc-button-disabled {
  box-shadow: var(--%NS%mat-button-protected-disabled-container-elevation-shadow, var(--%NS%mat-sys-level0));
}
.mat-mdc-raised-button.mat-mdc-button-disabled-interactive {
  pointer-events: auto;
}

.mat-mdc-outlined-button {
  border-style: solid;
  transition: border 280ms cubic-bezier(0.4, 0, 0.2, 1);
  height: var(--%NS%mat-button-outlined-container-height, 40px);
  font-family: var(--%NS%mat-button-outlined-label-text-font, var(--%NS%mat-sys-label-large-font));
  font-size: var(--%NS%mat-button-outlined-label-text-size, var(--%NS%mat-sys-label-large-size));
  letter-spacing: var(--%NS%mat-button-outlined-label-text-tracking, var(--%NS%mat-sys-label-large-tracking));
  text-transform: var(--%NS%mat-button-outlined-label-text-transform);
  font-weight: var(--%NS%mat-button-outlined-label-text-weight, var(--%NS%mat-sys-label-large-weight));
  border-radius: var(--%NS%mat-button-outlined-container-shape, var(--%NS%mat-sys-corner-full));
  border-width: var(--%NS%mat-button-outlined-outline-width, 1px);
  padding: 0 var(--%NS%mat-button-outlined-horizontal-padding, 24px);
}
.mat-mdc-outlined-button > .mat-icon {
  margin-right: var(--%NS%mat-button-outlined-icon-spacing, 8px);
  margin-left: var(--%NS%mat-button-outlined-icon-offset, -8px);
}
[dir=rtl] .mat-mdc-outlined-button > .mat-icon {
  margin-right: var(--%NS%mat-button-outlined-icon-offset, -8px);
  margin-left: var(--%NS%mat-button-outlined-icon-spacing, 8px);
}
.mat-mdc-outlined-button .mdc-button__label + .mat-icon {
  margin-right: var(--%NS%mat-button-outlined-icon-offset, -8px);
  margin-left: var(--%NS%mat-button-outlined-icon-spacing, 8px);
}
[dir=rtl] .mat-mdc-outlined-button .mdc-button__label + .mat-icon {
  margin-right: var(--%NS%mat-button-outlined-icon-spacing, 8px);
  margin-left: var(--%NS%mat-button-outlined-icon-offset, -8px);
}
.mat-mdc-outlined-button .mat-ripple-element {
  background-color: var(--%NS%mat-button-outlined-ripple-color, color-mix(in srgb, var(--%NS%mat-sys-primary) calc(var(--%NS%mat-sys-pressed-state-layer-opacity) * 100%), transparent));
}
.mat-mdc-outlined-button .mat-mdc-button-persistent-ripple::before {
  background-color: var(--%NS%mat-button-outlined-state-layer-color, var(--%NS%mat-sys-primary));
}
.mat-mdc-outlined-button.mat-mdc-button-disabled .mat-mdc-button-persistent-ripple::before {
  background-color: var(--%NS%mat-button-outlined-disabled-state-layer-color, var(--%NS%mat-sys-on-surface-variant));
}
.mat-mdc-outlined-button:hover > .mat-mdc-button-persistent-ripple::before {
  opacity: var(--%NS%mat-button-outlined-hover-state-layer-opacity, var(--%NS%mat-sys-hover-state-layer-opacity));
}
.mat-mdc-outlined-button.cdk-program-focused > .mat-mdc-button-persistent-ripple::before, .mat-mdc-outlined-button.cdk-keyboard-focused > .mat-mdc-button-persistent-ripple::before, .mat-mdc-outlined-button.mat-mdc-button-disabled-interactive:focus > .mat-mdc-button-persistent-ripple::before {
  opacity: var(--%NS%mat-button-outlined-focus-state-layer-opacity, var(--%NS%mat-sys-focus-state-layer-opacity));
}
.mat-mdc-outlined-button:active > .mat-mdc-button-persistent-ripple::before {
  opacity: var(--%NS%mat-button-outlined-pressed-state-layer-opacity, var(--%NS%mat-sys-pressed-state-layer-opacity));
}
.mat-mdc-outlined-button .mat-mdc-button-touch-target {
  position: absolute;
  top: 50%;
  height: var(--%NS%mat-button-outlined-touch-target-size, 48px);
  display: var(--%NS%mat-button-outlined-touch-target-display, block);
  left: 0;
  right: 0;
  transform: translateY(-50%);
}
.mat-mdc-outlined-button:not(:disabled) {
  color: var(--%NS%mat-button-outlined-label-text-color, var(--%NS%mat-sys-primary));
  border-color: var(--%NS%mat-button-outlined-outline-color, var(--%NS%mat-sys-outline));
}
.mat-mdc-outlined-button[disabled], .mat-mdc-outlined-button.mat-mdc-button-disabled {
  cursor: default;
  pointer-events: none;
  color: var(--%NS%mat-button-outlined-disabled-label-text-color, color-mix(in srgb, var(--%NS%mat-sys-on-surface) 38%, transparent));
  border-color: var(--%NS%mat-button-outlined-disabled-outline-color, color-mix(in srgb, var(--%NS%mat-sys-on-surface) 12%, transparent));
}
.mat-mdc-outlined-button.mat-mdc-button-disabled-interactive {
  pointer-events: auto;
}

.mat-tonal-button {
  transition: box-shadow 280ms cubic-bezier(0.4, 0, 0.2, 1);
  height: var(--%NS%mat-button-tonal-container-height, 40px);
  font-family: var(--%NS%mat-button-tonal-label-text-font, var(--%NS%mat-sys-label-large-font));
  font-size: var(--%NS%mat-button-tonal-label-text-size, var(--%NS%mat-sys-label-large-size));
  letter-spacing: var(--%NS%mat-button-tonal-label-text-tracking, var(--%NS%mat-sys-label-large-tracking));
  text-transform: var(--%NS%mat-button-tonal-label-text-transform);
  font-weight: var(--%NS%mat-button-tonal-label-text-weight, var(--%NS%mat-sys-label-large-weight));
  padding: 0 var(--%NS%mat-button-tonal-horizontal-padding, 24px);
}
.mat-tonal-button:not(:disabled) {
  color: var(--%NS%mat-button-tonal-label-text-color, var(--%NS%mat-sys-on-secondary-container));
  background-color: var(--%NS%mat-button-tonal-container-color, var(--%NS%mat-sys-secondary-container));
}
.mat-tonal-button, .mat-tonal-button .mdc-button__ripple {
  border-radius: var(--%NS%mat-button-tonal-container-shape, var(--%NS%mat-sys-corner-full));
}
.mat-tonal-button[disabled], .mat-tonal-button.mat-mdc-button-disabled {
  cursor: default;
  pointer-events: none;
  color: var(--%NS%mat-button-tonal-disabled-label-text-color, color-mix(in srgb, var(--%NS%mat-sys-on-surface) 38%, transparent));
  background-color: var(--%NS%mat-button-tonal-disabled-container-color, color-mix(in srgb, var(--%NS%mat-sys-on-surface) 12%, transparent));
}
.mat-tonal-button.mat-mdc-button-disabled-interactive {
  pointer-events: auto;
}
.mat-tonal-button > .mat-icon {
  margin-right: var(--%NS%mat-button-tonal-icon-spacing, 8px);
  margin-left: var(--%NS%mat-button-tonal-icon-offset, -8px);
}
[dir=rtl] .mat-tonal-button > .mat-icon {
  margin-right: var(--%NS%mat-button-tonal-icon-offset, -8px);
  margin-left: var(--%NS%mat-button-tonal-icon-spacing, 8px);
}
.mat-tonal-button .mdc-button__label + .mat-icon {
  margin-right: var(--%NS%mat-button-tonal-icon-offset, -8px);
  margin-left: var(--%NS%mat-button-tonal-icon-spacing, 8px);
}
[dir=rtl] .mat-tonal-button .mdc-button__label + .mat-icon {
  margin-right: var(--%NS%mat-button-tonal-icon-spacing, 8px);
  margin-left: var(--%NS%mat-button-tonal-icon-offset, -8px);
}
.mat-tonal-button .mat-ripple-element {
  background-color: var(--%NS%mat-button-tonal-ripple-color, color-mix(in srgb, var(--%NS%mat-sys-on-secondary-container) calc(var(--%NS%mat-sys-pressed-state-layer-opacity) * 100%), transparent));
}
.mat-tonal-button .mat-mdc-button-persistent-ripple::before {
  background-color: var(--%NS%mat-button-tonal-state-layer-color, var(--%NS%mat-sys-on-secondary-container));
}
.mat-tonal-button.mat-mdc-button-disabled .mat-mdc-button-persistent-ripple::before {
  background-color: var(--%NS%mat-button-tonal-disabled-state-layer-color, var(--%NS%mat-sys-on-surface-variant));
}
.mat-tonal-button:hover > .mat-mdc-button-persistent-ripple::before {
  opacity: var(--%NS%mat-button-tonal-hover-state-layer-opacity, var(--%NS%mat-sys-hover-state-layer-opacity));
}
.mat-tonal-button.cdk-program-focused > .mat-mdc-button-persistent-ripple::before, .mat-tonal-button.cdk-keyboard-focused > .mat-mdc-button-persistent-ripple::before, .mat-tonal-button.mat-mdc-button-disabled-interactive:focus > .mat-mdc-button-persistent-ripple::before {
  opacity: var(--%NS%mat-button-tonal-focus-state-layer-opacity, var(--%NS%mat-sys-focus-state-layer-opacity));
}
.mat-tonal-button:active > .mat-mdc-button-persistent-ripple::before {
  opacity: var(--%NS%mat-button-tonal-pressed-state-layer-opacity, var(--%NS%mat-sys-pressed-state-layer-opacity));
}
.mat-tonal-button .mat-mdc-button-touch-target {
  position: absolute;
  top: 50%;
  height: var(--%NS%mat-button-tonal-touch-target-size, 48px);
  display: var(--%NS%mat-button-tonal-touch-target-display, block);
  left: 0;
  right: 0;
  transform: translateY(-50%);
}

.mat-mdc-button,
.mat-mdc-unelevated-button,
.mat-mdc-raised-button,
.mat-mdc-outlined-button,
.mat-tonal-button {
  -webkit-tap-highlight-color: transparent;
}
.mat-mdc-button .mat-mdc-button-ripple,
.mat-mdc-button .mat-mdc-button-persistent-ripple,
.mat-mdc-button .mat-mdc-button-persistent-ripple::before,
.mat-mdc-unelevated-button .mat-mdc-button-ripple,
.mat-mdc-unelevated-button .mat-mdc-button-persistent-ripple,
.mat-mdc-unelevated-button .mat-mdc-button-persistent-ripple::before,
.mat-mdc-raised-button .mat-mdc-button-ripple,
.mat-mdc-raised-button .mat-mdc-button-persistent-ripple,
.mat-mdc-raised-button .mat-mdc-button-persistent-ripple::before,
.mat-mdc-outlined-button .mat-mdc-button-ripple,
.mat-mdc-outlined-button .mat-mdc-button-persistent-ripple,
.mat-mdc-outlined-button .mat-mdc-button-persistent-ripple::before,
.mat-tonal-button .mat-mdc-button-ripple,
.mat-tonal-button .mat-mdc-button-persistent-ripple,
.mat-tonal-button .mat-mdc-button-persistent-ripple::before {
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  position: absolute;
  pointer-events: none;
  border-radius: inherit;
}
.mat-mdc-button .mat-mdc-button-ripple,
.mat-mdc-unelevated-button .mat-mdc-button-ripple,
.mat-mdc-raised-button .mat-mdc-button-ripple,
.mat-mdc-outlined-button .mat-mdc-button-ripple,
.mat-tonal-button .mat-mdc-button-ripple {
  overflow: hidden;
}
.mat-mdc-button .mat-mdc-button-persistent-ripple::before,
.mat-mdc-unelevated-button .mat-mdc-button-persistent-ripple::before,
.mat-mdc-raised-button .mat-mdc-button-persistent-ripple::before,
.mat-mdc-outlined-button .mat-mdc-button-persistent-ripple::before,
.mat-tonal-button .mat-mdc-button-persistent-ripple::before {
  content: "";
  opacity: 0;
}
.mat-mdc-button .mdc-button__label,
.mat-mdc-button .mat-icon,
.mat-mdc-unelevated-button .mdc-button__label,
.mat-mdc-unelevated-button .mat-icon,
.mat-mdc-raised-button .mdc-button__label,
.mat-mdc-raised-button .mat-icon,
.mat-mdc-outlined-button .mdc-button__label,
.mat-mdc-outlined-button .mat-icon,
.mat-tonal-button .mdc-button__label,
.mat-tonal-button .mat-icon {
  z-index: 1;
  position: relative;
}
.mat-mdc-button .mat-focus-indicator,
.mat-mdc-unelevated-button .mat-focus-indicator,
.mat-mdc-raised-button .mat-focus-indicator,
.mat-mdc-outlined-button .mat-focus-indicator,
.mat-tonal-button .mat-focus-indicator {
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  position: absolute;
  border-radius: inherit;
}
.mat-mdc-button:focus-visible > .mat-focus-indicator::before,
.mat-mdc-unelevated-button:focus-visible > .mat-focus-indicator::before,
.mat-mdc-raised-button:focus-visible > .mat-focus-indicator::before,
.mat-mdc-outlined-button:focus-visible > .mat-focus-indicator::before,
.mat-tonal-button:focus-visible > .mat-focus-indicator::before {
  content: "";
  border-radius: inherit;
}
.mat-mdc-button._mat-animation-noopable,
.mat-mdc-unelevated-button._mat-animation-noopable,
.mat-mdc-raised-button._mat-animation-noopable,
.mat-mdc-outlined-button._mat-animation-noopable,
.mat-tonal-button._mat-animation-noopable {
  transition: none !important;
  animation: none !important;
}
.mat-mdc-button > .mat-icon,
.mat-mdc-unelevated-button > .mat-icon,
.mat-mdc-raised-button > .mat-icon,
.mat-mdc-outlined-button > .mat-icon,
.mat-tonal-button > .mat-icon {
  display: inline-block;
  position: relative;
  vertical-align: top;
  font-size: 1.125rem;
  height: 1.125rem;
  width: 1.125rem;
}

.mat-mdc-outlined-button .mat-mdc-button-ripple,
.mat-mdc-outlined-button .mdc-button__ripple {
  top: -1px;
  left: -1px;
  bottom: -1px;
  right: -1px;
}

.mat-mdc-unelevated-button .mat-focus-indicator::before,
.mat-tonal-button .mat-focus-indicator::before,
.mat-mdc-raised-button .mat-focus-indicator::before {
  margin: calc(calc(var(--%NS%mat-focus-indicator-border-width, 3px) + 2px) * -1);
}

.mat-mdc-outlined-button .mat-focus-indicator::before {
  margin: calc(calc(var(--%NS%mat-focus-indicator-border-width, 3px) + 3px) * -1);
}

.mat-mdc-button-progress-indicator-container {
  position: absolute;
  inset-inline-start: 0;
  inset-block-start: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
}

.mat-mdc-button-progress-indicator-shown mat-icon,
.mat-mdc-button-progress-indicator-shown [matButtonIcon],
.mat-mdc-button-progress-indicator-shown .mdc-button__label {
  visibility: hidden;
}
`,`@media (forced-colors: active) {
  .mat-mdc-button:not(.mdc-button--outlined),
  .mat-mdc-unelevated-button:not(.mdc-button--outlined),
  .mat-mdc-raised-button:not(.mdc-button--outlined),
  .mat-mdc-outlined-button:not(.mdc-button--outlined),
  .mat-mdc-button-base.mat-tonal-button,
  .mat-mdc-icon-button.mat-mdc-icon-button,
  .mat-mdc-outlined-button .mdc-button__ripple {
    outline: solid 1px;
  }
}
`],encapsulation:2})})()}return n})();function Be(n){return n.hasAttribute("mat-raised-button")?"elevated":n.hasAttribute("mat-stroked-button")?"outlined":n.hasAttribute("mat-flat-button")?"filled":n.hasAttribute("mat-button")?"text":null}var jt=(()=>{class n{static \u0275fac=function(e){return new(e||n)};static \u0275mod=Gt({type:n});static \u0275inj=Yt({imports:[mt,ce]})}return n})(),je=class ht{model=tt.required();actions=tt.required();popup=k(()=>Y(q({},this.model().popup),{onClose:t=>{t.stopPropagation(),this.actions().close()}}));static \u0275fac=function(t){return new(t||ht)};static \u0275cmp=(function(){let t=(v,C)=>C.id;function e(v,C){if(v&1&&(a(0,"div",1),L(1,"app-indicator",3),a(2,"span"),d(3),r()()),v&2){let S=l(2);o(3),c(S.model().loadingLabel)}}function i(v,C){if(v&1&&(a(0,"p",8),d(1),r()),v&2){let S=l().$implicit;o(),c(S.blurb)}}function s(v,C){if(v&1&&(a(0,"div",10)(1,"span",11)(2,"mat-icon"),d(3),r()()()),v&2){let S=l().$implicit;o(3),c(S.icon)}}function p(v,C){if(v&1&&(a(0,"section",6)(1,"div",7)(2,"h3",8),d(3),r(),b(4,i,2,1,"p",8),L(5,"div",9),b(6,s,4,1,"div",10),r()()),v&2){let S=C.$implicit;P("explanation-popup__item--span-1",S.layout==="span-1")("explanation-popup__item--span-2",S.layout==="span-2")("explanation-popup__item--span-3",S.layout==="span-3"),o(3),c(S.title),o(),g(S.blurb?4:-1),o(),h("appLazyHtmlImages",!0)("innerHTML",S.html,Pt),o(),g(S.showIcon?6:-1)}}function f(v,C){if(v&1&&(a(0,"div",2)(1,"div",4),U(2,p,7,11,"section",5,t),r()()),v&2){let S=l(2);o(2),E(S.model().sections)}}function O(v,C){if(v&1&&(a(0,"app-popup",0),b(1,e,4,1,"div",1)(2,f,4,0,"div",2),r()),v&2){let S=l();h("model",S.popup())("zIndex",S.model().zIndex),o(),g(S.model().loading?1:2)}}return I({type:ht,selectors:[["app-explanation-dialog"]],inputs:{model:[1,"model"],actions:[1,"actions"]},decls:1,vars:1,consts:[[3,"model","zIndex"],[1,"explanation-popup__loading-body"],[1,"explanation-popup__body"],["kind","load-ring","state","loading"],[1,"explanation-popup__grid"],[1,"explanation-popup__item",3,"explanation-popup__item--span-1","explanation-popup__item--span-2","explanation-popup__item--span-3"],[1,"explanation-popup__item"],[1,"explanation-popup__item-copy"],["data-i18n-ignore",""],["appLazyBgImage","","data-i18n-ignore","",1,"explanation-popup__html",3,"appLazyHtmlImages","innerHTML"],["aria-hidden","true",1,"explanation-popup__item-visual"],[1,"explanation-popup__visual-generic"]],template:function(v,C){v&1&&b(0,O,3,3,"app-popup",0),v&2&&g(C.model().open?0:-1)},dependencies:[j,V,F,zt,Z],styles:["[_nghost-%COMP%]{display:contents}.explanation-popup__item[_ngcontent-%COMP%]   h3[_ngcontent-%COMP%], .explanation-popup__item[_ngcontent-%COMP%]   p[_ngcontent-%COMP%]{margin:0}.explanation-popup__body[_ngcontent-%COMP%]{flex:1 1 auto;min-height:0;overflow-y:auto;overflow-x:hidden;padding:.12rem}.explanation-popup__loading-body[_ngcontent-%COMP%]{flex:1 1 auto;min-height:0;display:grid;place-items:center;gap:.74rem;color:#2a3d58c7;font-size:.92rem;font-weight:850;text-align:center}.explanation-popup__grid[_ngcontent-%COMP%]{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:.58rem}.explanation-popup__item[_ngcontent-%COMP%]{min-width:0;border:1px solid rgba(33,61,96,.12);border-radius:12px;background:#fff;padding:.74rem;box-shadow:0 7px 18px #172a480f}.explanation-popup__item-copy[_ngcontent-%COMP%]{min-width:0}.explanation-popup__item-visual[_ngcontent-%COMP%]{min-height:42px;display:flex;align-items:center;flex-wrap:wrap;gap:.42rem;margin-top:.52rem}.explanation-popup__visual-generic[_ngcontent-%COMP%]{min-width:0;min-height:40px;border:1px solid rgba(40,80,128,.14);border-radius:12px;background:#f7fbff;color:#245c9c;display:inline-flex;align-items:center;justify-content:center;gap:.34rem;box-shadow:inset 0 1px #ffffffbd}.explanation-popup__item--span-1[_ngcontent-%COMP%]{grid-column:span 1}.explanation-popup__item--span-2[_ngcontent-%COMP%]{grid-column:span 2}.explanation-popup__item--span-3[_ngcontent-%COMP%]{grid-column:1/-1}.explanation-popup__visual-generic[_ngcontent-%COMP%]{flex:0 0 46px}.explanation-popup__item-visual[_ngcontent-%COMP%]   .mat-icon[_ngcontent-%COMP%]{width:19px;height:19px;font-size:19px;line-height:19px}.explanation-popup__item[_ngcontent-%COMP%]   h3[_ngcontent-%COMP%]{color:#1f3658;font-size:.9rem;font-weight:950;line-height:1.18}.explanation-popup__item[_ngcontent-%COMP%]   p[_ngcontent-%COMP%], .explanation-popup__html[_ngcontent-%COMP%]{color:#2d405cc2;font-size:.8rem;font-weight:700;line-height:1.34;overflow-wrap:anywhere}.explanation-popup__item[_ngcontent-%COMP%]   p[_ngcontent-%COMP%]{margin-top:.24rem}.explanation-popup__html[_ngcontent-%COMP%]{margin-top:.34rem}[_nghost-%COMP%]     .explanation-popup__html :where(p,ul,ol){margin:.3rem 0 0}[_nghost-%COMP%]     .explanation-popup__html :where(ul,ol){padding-left:1.1rem}[_nghost-%COMP%]     .explanation-popup__html :where(figure){margin:.58rem 0 0;display:flex;justify-content:center}[_nghost-%COMP%]     .explanation-popup__html :where(figure.explanation-seeded-visual,figure.lazy-image-frame-loading,figure.lazy-image-frame-loaded){position:relative;width:100%;min-height:176px;aspect-ratio:16/9;align-items:center;overflow:hidden;border:1px solid rgba(40,80,128,.14);border-radius:10px;background:linear-gradient(180deg,#f8fcffeb,#eff6ffeb);box-shadow:inset 0 1px #ffffffbd}[_nghost-%COMP%]     .explanation-popup__html :where(img){display:block;width:100%;height:auto;max-width:100%;max-height:280px;object-fit:contain;margin:.58rem auto 0;border:1px solid rgba(40,80,128,.14);border-radius:10px;background:#f5f8fc;box-shadow:inset 0 1px #ffffffbd}[_nghost-%COMP%]     .explanation-popup__html :where(figure.explanation-seeded-visual,figure.lazy-image-frame-loading,figure.lazy-image-frame-loaded)>img{position:absolute;inset:0;width:100%;height:100%;max-height:none;margin:0;border:0;border-radius:0;background:transparent;box-shadow:none;object-fit:contain;transition:opacity .12s ease-in}[_nghost-%COMP%]     .explanation-popup__html :where(figure.lazy-image-frame-loading)>img{opacity:0}[_nghost-%COMP%]     .explanation-popup__html :where(figure.lazy-image-frame-loaded)>img{opacity:1}[_nghost-%COMP%]     .explanation-popup__html :where(.lazy-image-frame-spinner){position:absolute;left:50%;top:50%;z-index:2;transform:translate(-50%,-50%)}[_nghost-%COMP%]     .explanation-popup__item--span-2 .explanation-popup__html :where(img), [_nghost-%COMP%]     .explanation-popup__item--span-3 .explanation-popup__html :where(img){width:100%}[_nghost-%COMP%]     .explanation-popup__item--span-2 .explanation-popup__html :where(img){max-height:300px}[_nghost-%COMP%]     .explanation-popup__item--span-3 .explanation-popup__html :where(img){max-height:340px}@media(max-width:760px){.explanation-popup__item--span-1[_ngcontent-%COMP%], .explanation-popup__item--span-2[_ngcontent-%COMP%], .explanation-popup__item--span-3[_ngcontent-%COMP%]{grid-column:auto}.explanation-popup__body[_ngcontent-%COMP%]{padding:0 .18rem .1rem}.explanation-popup__grid[_ngcontent-%COMP%]{grid-template-columns:1fr;gap:.48rem}.explanation-popup__item[_ngcontent-%COMP%]{padding:.62rem}.explanation-popup__item-visual[_ngcontent-%COMP%]{min-height:42px;gap:.34rem}.explanation-popup__visual-generic[_ngcontent-%COMP%]{min-height:36px;border-radius:10px}}"]})})()},Ve=Object.freeze({__proto__:null,ExplanationDialogComponent:je}),pt="user-by-id",Vt="user-profile-save",Fe="user-logout",X=class H extends he{transportAdapters=x(fe);location=x(ve);local=this.transportAdapters.reference(xe.USERS);http=this.transportAdapters.reference(It.USERS);profiles=x(At);routeDelay=x(ye);realtimePollIntervalMs(){return this.routeDelay.resolveIntervalMs("/auth/me/realtime/long-poll",3e4)}async pollUserRealtimeSnapshot(t,e=null,i){return this.userService.queryUserRealtimeLongPoll(t,e,i)}loadedSessionIdentity=null;peekCurrentUser(){return this.loadedSessionIdentity===this.sessionService.identity()?this.profiles.activeUserProfile():null}peekCachedUserById(t){let e=t.trim();return e?this.profiles.getUserProfile(e)??(this.localModeEnabled?this.local.peekCachedUserById(e):this.http.peekCachedUserById(e)):null}runtime=x(we);async prepareDemoUserSession(t,e){this.localModeEnabled&&await this.local.prepareUserSession(t,e)}get localModeEnabled(){return this.isLocalRouteEnabled("/auth/me")}loadAvailableDemoUsers(t="member"){return this.resolveRouteService("/auth/demo-users",this.local,this.http).queryAvailableDemoUsers(t)}async checkLocationEligibility(t){return(this.isLocalRouteEnabled("/auth/me")?this.local:await this.transportAdapters.get(It.USERS)).checkLocationEligibility(t)}get userService(){return this.resolveRouteService("/auth/me",this.local,this.http)}async loadUserById(t){let e=this.sessionService.identity();this.runtime.setStatus(pt,"loading");try{let i=await this.userService.queryUserById(t);if(e!==this.sessionService.identity())return null;if(!i.user)throw new Error("User details not found.");return this.profiles.setActiveUserProfile(i.user),this.loadedSessionIdentity=e,this.runtime.setStatus(pt,"success"),i.user}catch(i){throw e===this.sessionService.identity()&&this.runtime.setStatus("user-by-id","error","Unable to load user details."),i}}async saveUserProfile(t){let e=this.sessionService.identity();this.runtime.setStatus(Vt,"loading");try{let i=this.sessionService.currentSession(),s=!t.locationCoordinates&&i?.kind==="authenticated"?await this.location.pendingLoginCoordinates(i.profile.id):null;if(e!==this.sessionService.identity())return null;let p=await this.userService.saveUserProfile(s?Y(q({},t),{locationCoordinates:s}):t);if(e!==this.sessionService.identity())return null;if(!p)throw new Error("Profile save returned no user.");return this.profiles.setUserProfile(p),this.runtime.setStatus(Vt,"success"),p}catch(i){throw e===this.sessionService.identity()&&this.runtime.setStatus("user-profile-save","error","Unable to save profile."),i}}async deleteUser(t){let e=await this.resolveRouteService("/auth/me/delete",this.local,this.http).deleteUser({userId:t.trim()});if(!e.submitted)throw new Error(e.message||"Unable to delete account.")}async logoutUser(t,e,i){let s={userId:t.trim()};return this.submitUserAction(Fe,(p,f)=>this.userService.logoutUser(s,p,f),e,"Logout request timeout.","Unable to log out.",i)}async submitUserAction(t,e,i,s,p,f){if(f?.aborted)return this.runtime.resetLoadingState(t),{submitted:!1,message:null};let O=new AbortController,v=this.bindAbort(f,O);this.runtime.setStatus(t,"loading");try{let C=await e(O.signal,i);return C.submitted?(this.runtime.setStatus(t,"success"),C):(this.runtime.setStatus(t,"error",C.message??p),{submitted:!1,message:C.message??p})}catch(C){return this.isAbortError(C)?(this.runtime.resetLoadingState(t),{submitted:!1,message:null}):this.isTimeoutError(C,s)?(this.runtime.setStatus(t,"timeout",s),{submitted:!1,message:s}):(this.runtime.setStatus(t,"error",p),{submitted:!1,message:p})}finally{v()}}isAbortError(t){return t instanceof Error&&t.name==="AbortError"}isTimeoutError(t,e){return t instanceof Error&&t.message===e}bindAbort(t,e){if(!t)return()=>{};if(t.aborted)return e.abort(),()=>{};let i=()=>e.abort();return t.addEventListener("abort",i,{once:!0}),()=>t.removeEventListener("abort",i)}static \u0275fac=(()=>{let t;return function(e){return(t||(t=te(H)))(e||H)}})();static \u0275prov=Mt({token:H,factory:H.\u0275fac,providedIn:"root"})},He=(n,t)=>t.id;function Ge(n,t){n&1&&(a(0,"img",17),y("load",function(e){return e.target.classList.add("is-loaded")})("error",function(e){return e.target.classList.remove("is-loaded")}),r()),n&2&&h("src",t)}function Ye(n,t){if(n&1&&d(0),n&2){let e=l(2),i=l(3);R(" ",i.userAvatarLabel(e)," ")}}function Ze(n,t){if(n&1&&(a(0,"span",12),L(1,"span",14),a(2,"span",15),b(3,Ge,1,1,"img",16)(4,Ye,1,1),r()()),n&2){let e,i=l(),s=l(3);o(2),P("has-photo",!!s.userAvatarUrl(i)),h("ngClass",s.userAvatarClass(i)),o(),g((e=s.userAvatarUrl(i))?3:4,e)}}function Ke(n,t){if(n&1&&(a(0,"div",6),b(1,Ze,5,4,"span",12),a(2,"span",13)(3,"strong"),d(4),r(),a(5,"small"),d(6),m(7,"i18n"),r()()()),n&2){let e=t,i=l(3);o(),g(i.userAvatarUrl(e)||i.userAvatarLabel(e)?1:-1),o(3),c(e.name),o(2),c(u(7,3,"demo.selector.selection.automatic"))}}function Xe(n,t){if(n&1&&L(0,"app-indicator",9),n&2){let e=l(3);h("durationMs",e.userListLoadDurationMs())}}function Je(n,t){if(n&1&&L(0,"app-indicator",10),n&2){let e=l(3);h("position",e.loading?e.loadingPosition():0)}}function We(n,t){if(n&1&&(a(0,"p",11),d(1),r()),n&2){let e=l(3);o(),R("",e.loadingProgress,"%")}}function Qe(n,t){if(n&1&&(a(0,"div",2)(1,"div",3)(2,"div",4)(3,"p",5),d(4),m(5,"i18n"),r(),b(6,Ke,8,5,"div",6),a(7,"p",7),d(8),m(9,"i18n"),r(),a(10,"div",8),m(11,"i18n"),b(12,Xe,1,1,"app-indicator",9)(13,Je,1,1,"app-indicator",10),r(),b(14,We,2,1,"p",11),r()()()),n&2){let e,i=l(2);o(4),R(" ",u(5,9,i.submitting?"demo.session.opening.title":"demo.selector.loading.title")," "),o(2),g((e=i.submitting&&i.selectedUser())?6:-1,e),o(2),c(u(9,11,i.submitting&&!i.loading?"demo.session.opening.description":i.loadingLabel)),o(2),M("aria-label",u(11,13,"demo.bootstrap.progress.aria"))("aria-valuemin",0)("aria-valuemax",100)("aria-valuenow",i.loadingUserList||!i.loading?null:i.loadingProgress),o(2),g(i.loadingUserList?12:13),o(2),g(i.loading&&!i.loadingUserList?14:-1)}}function tn(n,t){if(n&1){let e=N();a(0,"div",2)(1,"div",3)(2,"div",4)(3,"p",5),d(4),m(5,"i18n"),r(),a(6,"p",7),d(7),m(8,"i18n"),r(),a(9,"button",19),y("click",function(){w(e);let i=l(3);return _(i.requestRetry())}),d(10),m(11,"i18n"),r()()()()}if(n&2){let e=l(3);o(4),c(u(5,4,"demo.selector.unavailable.title")),o(3),c(u(8,6,e.errorMessage)),o(2),h("disabled",e.submitting),o(),R(" ",u(11,8,"try.again")," ")}}function en(n,t){n&1&&(a(0,"img",17),y("load",function(e){return e.target.classList.add("is-loaded")})("error",function(e){return e.target.classList.remove("is-loaded")}),r()),n&2&&h("src",t)}function nn(n,t){if(n&1&&d(0),n&2){let e=l(2).$implicit,i=l(4);R(" ",i.userAvatarLabel(e)," ")}}function on(n,t){if(n&1&&(a(0,"span",15),b(1,en,1,1,"img",16)(2,nn,1,1),r()),n&2){let e,i=l().$implicit,s=l(4);P("has-photo",!!s.userAvatarUrl(i)),h("ngClass",s.userAvatarClass(i)),o(),g((e=s.userAvatarUrl(i))?1:2,e)}}function an(n,t){if(n&1&&(a(0,"span",23),d(1),r()),n&2){let e=l().$implicit;o(),c(e.name.trim())}}function rn(n,t){n&1&&(a(0,"span",24),d(1),m(2,"i18n"),r()),n&2&&(o(),c(u(2,1,"new.demo.profile")))}function sn(n,t){n&1&&(a(0,"span"),d(1),m(2,"i18n"),r()),n&2&&(o(),c(u(2,1,"needs.setup")))}function ln(n,t){if(n&1&&(a(0,"span",28),d(1),r()),n&2){let e=l(2).$implicit;o(),c(e.city.trim())}}function dn(n,t){n&1&&(a(0,"span",29),d(1),m(2,"i18n"),r()),n&2&&(o(),c(u(2,1,"needs.setup")))}function cn(n,t){if(n&1&&(a(0,"span"),d(1),m(2,"i18n"),r(),a(3,"span",27),d(4," \xB7 "),r(),b(5,ln,2,1,"span",28)(6,dn,3,3,"span",29)),n&2){let e=l().$implicit,i=l(4);o(),c(u(2,2,i.userGenderLabel(e))),o(4),g(e.city.trim()?5:6)}}function mn(n,t){if(n&1&&(a(0,"span",26),d(1),m(2,"i18n"),r()),n&2){let e=l().$implicit,i=l(4);o(),c(u(2,1,i.userStatusLabel(e)))}}function un(n,t){if(n&1){let e=N();a(0,"button",21),y("click",function(){let i=w(e).$implicit,s=l(4);return _(s.requestUserSelect(i.id))}),b(1,on,3,4,"span",22),b(2,an,2,1,"span",23)(3,rn,3,3,"span",24),a(4,"span",25),b(5,sn,3,3,"span")(6,cn,7,4),r(),b(7,mn,3,3,"span",26),r()}if(n&2){let e=t.$implicit,i=l(4);P("demo-user-item-selected",i.selectedUserId.trim()===e.id.trim()),h("ngClass",i.userStatusClass(e))("disabled",i.submitting)("matRippleColor","rgba(72, 111, 196, 0.16)"),M("data-user-id",e.id),o(),g(i.userAvatarUrl(e)||i.userAvatarLabel(e)?1:-1),o(),g(e.name.trim()?2:3),o(3),g(i.isNewProfile(e)?5:6),o(2),g(i.userStatusLabel(e)?7:-1)}}function pn(n,t){if(n&1&&(a(0,"div",18),U(1,un,8,10,"button",20,He),r()),n&2){let e=l(3);o(),E(e.visibleUsers())}}function bn(n,t){n&1&&(a(0,"div",2)(1,"p",7),d(2),m(3,"i18n"),r()()),n&2&&(o(2),c(u(3,1,"demo.selector.empty.description")))}function gn(n,t){if(n&1&&b(0,tn,12,10,"div",2)(1,pn,3,0,"div",18)(2,bn,4,3,"div",2),n&2){let e=l(2);g(e.errorMessage?0:e.visibleUsers().length>0?1:2)}}function hn(n,t){if(n&1&&(a(0,"app-popup",0)(1,"div",1),b(2,Qe,15,15,"div",2)(3,gn,3,1),r()()),n&2){let e=l();h("model",e.popupModel())("zIndex",2800),o(2),g(e.loading?2:3)}}var fn=class ft{i18n=x(ut);demoBootstrapSelectorStore=x(_e);usersService=x(X);injector=x(ee);changeDetectorRef=x(ne);ngZone=x(Ct);contextRequest=null;contextRequestToken=0;contextControlled=!1;contextSelectorSeedReady=!1;selectedMode="member";open=!1;loading=!1;loadingProgress=0;loadingLabel="demo.bootstrap.loading";loadingStage="selector";loadingUserList=!1;errorMessage="";submitting=!1;users=[];title="select.demo.user";subtitle="demo.selector.subtitle";selectedUserId="";closeRequested=new T;retryRequested=new T;userSelected=new T;newProfileRequested=new T;constructor(){et(()=>{let t=this.demoBootstrapSelectorStore.demoBootstrapSelector();if(!t){this.resetContextState();return}this.openContextRequest(t)})}onGlobalEscape(t){if(!this.open||!this.contextRequest)return;let e=t;e.defaultPrevented||(e.stopPropagation(),this.requestClose())}requestClose(){if(!this.submitting){if(this.contextRequest){this.contextRequest.onClose?.();return}this.closeRequested.emit()}}popupModel(){let t=[],e=this.newProfileMenuItems();e.length>0&&t.push({id:"new-profile",kind:"menu",menuKind:"inline",items:e});let i=this.selectorRoleMenuItems();return i.length>0&&t.push({id:"selector-role",kind:"menu",menuKind:"select",trigger:this.selectorRoleMenuTrigger(),items:i,panelAlign:"end"}),{title:this.title,subtitle:this.subtitle,ariaLabel:"demo.selector.aria",closeAriaLabel:"demo.selector.close",size:"wide",height:"auto",headerLayout:"document",headerTone:"accent",headerPalette:"green",headerTitleTone:"neutral",bodyLayout:"flush",headerControls:t,onClose:()=>this.requestClose(),onMenuSelect:s=>this.onPopupMenuSelect(s)}}requestUserSelect(t){if(!(this.loading||this.submitting)){if(this.contextRequest){this.selectContextUser(t);return}this.userSelected.emit(t)}}requestRetry(){if(!(this.loading||this.submitting)){if(this.contextRequest){this.openContextRequest(this.contextRequest);return}this.retryRequested.emit()}}userStatusClass(t){switch(`${t.status??""}`.trim().toUpperCase()){case"B":return"demo-user-item-blocked";case"D":return"demo-user-item-deleted";default:return this.isNewProfile(t)?"demo-user-item-new":t.locationRequired?"demo-user-item-location":""}}userStatusLabel(t){switch(`${t.status??""}`.trim().toUpperCase()){case"B":return"demo.selector.status.blocked";case"D":return"demo.selector.status.deleted";default:return this.isNewProfile(t)?"demo.selector.status.new":t.locationRequired?"demo.selector.status.location":""}}userGenderLabel(t){return t.gender==="woman"?"woman":"man"}userAvatarClass(t){return this.isNewProfile(t)?"user-color-setup":`user-color-${t.gender}`}userAvatarLabel(t){return this.isNewProfile(t)?"":`${t.initials??""}`.trim()}userAvatarUrl(t){return this.isNewProfile(t)?"":$.mediaImageVariantUrl(t.avatarUrl,"small")}isNewProfile(t){return!t.name.trim()}newProfileMenuItems(){return this.newProfileAvailable()?[{id:"new-profile",label:"new.demo.profile",icon:"person_add",kind:"action",layout:"action",compactOnMobile:!0,palette:"red",disabled:()=>this.loading||this.submitting,ariaLabel:"demo.profile.create.aria",context:{action:"new-profile"}}]:[]}selectorRoleMenuTrigger(){return{label:this.selectorRoleLabel(this.selectedMode),icon:this.selectorRoleIcon(this.selectedMode),trailingIcon:"expand_more",ariaLabel:"demo.selector.filter.aria",palette:this.selectorRolePalette(this.selectedMode),layout:"pill",disabled:()=>this.submitting}}selectorRoleMenuItems(){let t=this.contextRequest?.selectableModes??[this.selectedMode];return t.length<=1?[]:t.map(e=>({id:e,label:this.selectorRoleLabel(e),icon:this.selectorRoleIcon(e),kind:"radio",palette:this.selectorRolePalette(e),surface:"tinted",active:()=>this.selectedMode===e,disabled:()=>this.submitting,ariaLabel:this.i18n.translateParams("demo.selector.role.show.aria",{role:this.selectorRoleLabel(e)}),context:{mode:e}}))}onPopupMenuSelect(t){if(t.control.id==="new-profile"){t.itemSelect.context&&"action"in t.itemSelect.context&&this.requestNewProfile();return}let e=t.itemSelect.context,i=e&&"mode"in e?e.mode:t.itemSelect.id;this.selectContextMode(i)}visibleUsers(){return this.users.filter(t=>!this.isNewProfile(t))}selectedUser(){let t=this.selectedUserId.trim();return t?this.users.find(e=>e.id.trim()===t)??null:null}loadingPosition(){let t=Number(this.loadingProgress);return Number.isFinite(t)?Math.max(0,Math.min(1,t/100)):0}userListLoadDurationMs(){return 3e3}openContextRequest(t){let e=++this.contextRequestToken;this.contextRequest=t,this.contextControlled=!0,this.contextSelectorSeedReady=!1,this.commit(()=>{this.open=!0,this.title=t.title??"select.demo.user",this.subtitle=t.subtitle??"demo.selector.subtitle",this.selectedMode=t.mode,this.users=t.users?.map(i=>q({},i))??[],this.loading=!0,this.loadingUserList=!1,this.loadingProgress=0,this.loadingLabel="demo.bootstrap.loading",this.loadingStage="selector",this.errorMessage="",this.submitting=!1,this.selectedUserId=""}),this.loadContextUsers(t,e,t.mode,!0)}async loadContextUsers(t,e,i,s){if(await this.waitForPopupPaint(),!!this.isCurrentContextRequest(e))try{if(this.usersService.localModeEnabled&&!this.contextSelectorSeedReady){let O=await this.localSeedBootstrap();s?await O.ensureDemoSelectorReady(this.selectorSeedMode(t),v=>{this.isCurrentContextRequest(e)&&this.commit(()=>{this.loadingUserList=!1,this.loadingProgress=v.percent,this.loadingLabel=v.label,this.loadingStage=v.stage})}):(this.commit(()=>{this.loadingUserList=!0,this.loadingProgress=0,this.loadingLabel=this.i18n.translateParams("demo.users.loading",{role:this.selectorRoleLabel(i).toLowerCase()}),this.loadingStage="users"}),await O.ensureDemoSelectorReady(this.selectorSeedMode(t))),this.contextSelectorSeedReady=!0,s&&await this.waitForPhaseReadyBlink()}if(!this.isCurrentContextRequest(e))return;let p=i===t.mode?t.users?.map(O=>q({},O))??null:null;if(p||(this.commit(()=>{this.loadingUserList=!0,this.loadingProgress=0,this.loadingLabel=this.i18n.translateParams("demo.users.loading",{role:this.selectorRoleLabel(i).toLowerCase()}),this.loadingStage="users"}),p=await this.usersService.loadAvailableDemoUsers(i)),!this.isCurrentContextRequest(e))return;this.commit(()=>{this.users=p,this.errorMessage="",this.loadingUserList=!1,this.selectedMode=i});let f=`${t.autoSelectUserId??""}`.trim();if(f&&i===t.mode){if(!(p.find(O=>O.id.trim()===f)??null)){this.commit(()=>{this.loading=!1,this.loadingUserList=!1,this.loadingProgress=0,this.loadingLabel="demo.selector.retry",this.loadingStage="selector",this.errorMessage="demo.session.open.error"});return}this.selectContextUser(f);return}this.commit(()=>{this.loading=!1})}catch{if(!this.isCurrentContextRequest(e))return;this.commit(()=>{this.loading=!1,this.loadingUserList=!1,this.loadingProgress=0,this.loadingLabel="demo.selector.retry",this.loadingStage="selector",this.errorMessage="demo.selector.load.error"})}}selectContextUser(t){if(!this.contextRequest)return;let e=t.trim();if(!e)return;let i=this.contextRequestToken;if(!this.usersService.localModeEnabled){this.commit(()=>{this.submitting=!0,this.selectedUserId=e,this.errorMessage=""}),this.completeContextSelection(e,this.selectedMode,i);return}this.commit(()=>{this.submitting=!0,this.selectedUserId=e,this.loading=!0,this.loadingUserList=!1,this.loadingProgress=0,this.loadingLabel="demo.session.preparing",this.loadingStage="session",this.errorMessage=""}),this.prepareContextUser(e,this.selectedMode,i)}selectContextMode(t){if(!this.contextRequest)return;let e=t==="admin"||t==="operator"?t:"member";if(e===this.selectedMode||this.submitting||!this.contextRequest.selectableModes.includes(e))return;let i=this.contextRequest,s=++this.contextRequestToken;this.commit(()=>{this.selectedMode=e,this.users=[],this.selectedUserId="",this.loading=!0,this.loadingUserList=!0,this.loadingProgress=0,this.loadingLabel=this.i18n.translateParams("demo.users.loading",{role:this.selectorRoleLabel(e).toLowerCase()}),this.loadingStage="users",this.errorMessage=""}),this.loadContextUsers(i,s,e,!1)}requestNewProfile(){if(!(this.loading||this.submitting)){if(this.contextRequest){this.selectContextNewProfile();return}this.newProfileRequested.emit()}}selectContextNewProfile(){if(!this.contextRequest?.onNewProfile)return;let t=this.contextRequestToken;this.commit(()=>{this.submitting=!0,this.selectedUserId="",this.loading=!1,this.loadingUserList=!1,this.loadingProgress=0,this.loadingLabel="Opening profile setup",this.loadingStage="session",this.errorMessage=""}),this.completeContextNewProfileSelection(t)}async prepareContextUser(t,e,i){if(await this.waitForPopupPaint(),!(!this.isCurrentContextRequest(i)||!this.contextRequest))try{let s=p=>{this.isCurrentContextRequest(i)&&this.commit(()=>{this.loadingProgress=p.percent,this.loadingLabel=p.label,this.loadingStage=p.stage})};if(this.usersService.localModeEnabled?await(await this.localSeedBootstrap()).ensureUserReady(t,e,s):await this.usersService.prepareDemoUserSession(t,s),!this.isCurrentContextRequest(i)||(this.commit(()=>{this.loadingProgress=100,this.loadingLabel="demo.session.ready.title",this.loadingStage="sessionReady"}),await this.waitForLoaderCompletionBeat(),!this.isCurrentContextRequest(i)))return;await this.completeContextSelection(t,e,i)}catch{this.isCurrentContextRequest(i)&&this.resetContextSelectionFailure("Unable to open demo session.")}}async localSeedBootstrap(){let{SeedDemoBootstrapService:t}=await import("./chunk-6440b1e1.js");return this.injector.get(t)}async completeContextSelection(t,e,i){let s=this.contextRequest;if(!(!s||!this.isCurrentContextRequest(i)))try{let p=await s.onSelect(t,e,this.users.find(f=>f.id===t));if(!this.isCurrentContextRequest(i)||p!==!1&&typeof p!="string")return;this.resetContextSelectionFailure(typeof p=="string"?p.trim():"demo.session.open.error")}catch{this.isCurrentContextRequest(i)&&this.resetContextSelectionFailure("demo.session.open.error")}}async completeContextNewProfileSelection(t){let e=this.contextRequest;if(!(!e?.onNewProfile||!this.isCurrentContextRequest(t)))try{if(await e.onNewProfile(),!this.isCurrentContextRequest(t))return;this.commit(()=>{this.submitting=!1})}catch{this.isCurrentContextRequest(t)&&this.resetContextSelectionFailure("Unable to open profile setup.")}}newProfileAvailable(){return this.contextRequest?this.selectedMode==="member"&&!!this.contextRequest.onNewProfile:!0}selectorSeedMode(t){return t.selectableModes.length>1?"union":t.mode}selectorRoleLabel(t){return t==="admin"?this.i18n.translate("admin.role.label"):t==="operator"?this.i18n.translate("operator"):this.i18n.translate("member")}selectorRoleIcon(t){return t==="admin"?"admin_panel_settings":t==="operator"?"dns":"person"}selectorRolePalette(t){return t==="admin"?"blue":t==="operator"?"violet":"green"}resetContextSelectionFailure(t){this.commit(()=>{this.loading=!1,this.loadingUserList=!1,this.submitting=!1,this.selectedUserId="",this.loadingProgress=0,this.loadingLabel="demo.bootstrap.loading",this.loadingStage="selector",this.errorMessage=t})}isCurrentContextRequest(t){return this.open&&this.contextRequestToken===t&&this.contextRequest!==null}resetContextState(){this.contextControlled&&(this.contextRequestToken+=1,this.contextRequest=null,this.contextControlled=!1,this.contextSelectorSeedReady=!1,this.open=!1,this.loading=!1,this.loadingUserList=!1,this.loadingProgress=0,this.loadingLabel="demo.bootstrap.loading",this.loadingStage="selector",this.errorMessage="",this.submitting=!1,this.selectedUserId="",this.users=[],this.selectedMode="member",this.changeDetectorRef.markForCheck())}commit(t){this.ngZone.run(()=>{t(),this.changeDetectorRef.detectChanges()})}waitForPopupPaint(){return new Promise(t=>{if(typeof window<"u"&&typeof window.requestAnimationFrame=="function"){window.requestAnimationFrame(()=>{window.requestAnimationFrame(()=>{setTimeout(t,80)})});return}setTimeout(t,80)})}waitForLoaderCompletionBeat(){return new Promise(t=>setTimeout(t,240))}waitForPhaseReadyBlink(){return new Promise(t=>setTimeout(t,500))}static \u0275fac=function(t){return new(t||ft)};static \u0275cmp=I({type:ft,selectors:[["app-demo-bootstrap-selector"]],hostBindings:function(t,e){t&1&&y("keydown.escape",function(i){return e.onGlobalEscape(i)},kt)},inputs:{open:"open",loading:"loading",loadingProgress:"loadingProgress",loadingLabel:"loadingLabel",loadingStage:"loadingStage",errorMessage:"errorMessage",submitting:"submitting",users:"users",title:"title",subtitle:"subtitle",selectedUserId:"selectedUserId"},outputs:{closeRequested:"closeRequested",retryRequested:"retryRequested",userSelected:"userSelected",newProfileRequested:"newProfileRequested"},decls:1,vars:1,consts:[[3,"model","zIndex"],["appLandingGuideSurface","landing.demo",1,"demo-user-stage"],[1,"demo-user-grid","demo-user-grid-loading"],[1,"demo-user-loading-shell"],[1,"demo-user-loading-copy-group"],[1,"demo-user-loading-eyebrow"],[1,"demo-user-selected-session"],[1,"demo-user-loading-copy"],["role","progressbar",1,"demo-user-progress-shell"],["kind","load-ring","state","loading",3,"durationMs"],["kind","pill-bar",3,"position"],[1,"demo-user-progress-value"],[1,"demo-user-selected-avatar-wrap"],[1,"demo-user-selected-copy"],["aria-hidden","true",1,"demo-user-selected-ring"],["data-i18n-ignore","",1,"user-avatar",3,"ngClass"],["alt","","loading","lazy","decoding","async",3,"src"],["alt","","loading","lazy","decoding","async",3,"load","error","src"],[1,"demo-user-grid"],["mat-flat-button","","type","button",1,"demo-user-retry-btn",3,"click","disabled"],["type","button","data-guide-field","member-card","matRipple","",1,"demo-user-item",3,"ngClass","demo-user-item-selected","disabled","matRippleColor"],["type","button","data-guide-field","member-card","matRipple","",1,"demo-user-item",3,"click","ngClass","disabled","matRippleColor"],["data-i18n-ignore","",1,"user-avatar",3,"has-photo","ngClass"],["data-i18n-ignore","",1,"demo-user-name"],[1,"demo-user-name"],[1,"demo-user-meta"],[1,"demo-user-status-pill"],["aria-hidden","true",1,"demo-user-meta-separator"],["data-i18n-ignore","",1,"demo-user-city"],[1,"demo-user-city"]],template:function(t,e){t&1&&b(0,hn,4,3,"app-popup",0),t&2&&g(e.open?0:-1)},dependencies:[Ut,Nt,Ot,jt,Bt,mt,Et,j,Z,K],styles:['[_nghost-%COMP%]{display:contents;font-family:var(--%NS%entry-font-family, "Nunito Sans", "Segoe UI", sans-serif)}.demo-user-stage[_ngcontent-%COMP%]{position:relative;min-height:0;height:clamp(22rem,62vh,31rem)}.demo-user-grid[_ngcontent-%COMP%]{box-sizing:border-box;height:100%;padding:.92rem 1rem 1rem;display:grid;grid-template-columns:repeat(5,minmax(0,1fr));align-content:start;gap:.45rem;overflow-y:auto;overflow-x:hidden;min-height:0}.demo-user-grid-loading[_ngcontent-%COMP%]{grid-template-columns:minmax(0,1fr);align-content:stretch;place-items:center;min-height:0;overflow:hidden}.demo-user-loading-copy[_ngcontent-%COMP%]{margin:0;color:var(--%NS%entry-text-muted, rgba(34, 50, 74, .72));font-size:.88rem;font-weight:600;text-align:center}.demo-user-loading-shell[_ngcontent-%COMP%]{width:100%;height:100%;display:grid;place-items:center;padding:1.2rem;box-sizing:border-box}.demo-user-loading-copy-group[_ngcontent-%COMP%]{width:min(100%,32rem);display:grid;gap:.75rem;justify-items:center;text-align:center}.demo-user-loading-eyebrow[_ngcontent-%COMP%]{margin:0;color:#2c5796c7;font-size:.74rem;font-weight:800;letter-spacing:.08em;text-transform:uppercase}.demo-user-progress-shell[_ngcontent-%COMP%]{width:min(100%,23rem)}.demo-user-progress-value[_ngcontent-%COMP%]{margin:0;color:#1b3254d1;font-size:.8rem;font-weight:800}.demo-user-selected-session[_ngcontent-%COMP%]{display:inline-flex;align-items:center;gap:.62rem;min-width:min(100%,17rem);padding:.44rem .68rem .44rem .48rem;border:1px solid rgba(66,107,174,.22);border-radius:999px;background:linear-gradient(180deg,#fff,#f4f8ff);box-shadow:0 10px 22px #1428481a}.demo-user-selected-avatar-wrap[_ngcontent-%COMP%]{position:relative;width:44px;height:44px;display:inline-grid;place-items:center;flex:0 0 auto}.demo-user-selected-avatar-wrap[_ngcontent-%COMP%]   .user-avatar[_ngcontent-%COMP%]{width:36px;height:36px;font-size:.84rem;position:relative;z-index:1}.demo-user-selected-ring[_ngcontent-%COMP%]{position:absolute;inset:0;border-radius:50%;border:2px solid rgba(66,116,202,.16);border-top-color:#4274cad1;animation:_ngcontent-%COMP%_demo-user-selected-ring-spin .9s linear infinite}.demo-user-selected-copy[_ngcontent-%COMP%]{display:grid;gap:.06rem;text-align:left}.demo-user-selected-copy[_ngcontent-%COMP%]   strong[_ngcontent-%COMP%]{color:var(--%NS%entry-text-main, #22324a);font-size:.88rem;line-height:1.1}.demo-user-selected-copy[_ngcontent-%COMP%]   small[_ngcontent-%COMP%]{color:#2c5796c7;font-size:.72rem;font-weight:800;line-height:1.1}.demo-user-retry-btn[_ngcontent-%COMP%]{min-width:8.5rem;border-radius:999px}.demo-user-item[_ngcontent-%COMP%]{position:relative;overflow:hidden;height:5rem;border:1px solid var(--%NS%entry-line, rgba(23, 33, 54, .12));border-radius:12px;background:#fff;padding:.55rem;cursor:pointer;display:grid;grid-template-columns:38px minmax(0,1fr);grid-template-rows:auto auto;column-gap:.58rem;row-gap:.08rem;align-content:center;align-items:center;text-align:left;transition:transform .16s ease,box-shadow .16s ease,border-color .16s ease}.demo-user-item[_ngcontent-%COMP%]:hover{transform:translateY(-1px);box-shadow:0 10px 18px #0d1b3914}.demo-user-item[_ngcontent-%COMP%]:disabled{cursor:default}.demo-user-item-selected[_ngcontent-%COMP%]{border-color:#3f70cb7a;background:linear-gradient(180deg,#f9fbff,#edf4ff);box-shadow:inset 3px 0 #3f70cbd9}.demo-user-item.demo-user-item-blocked[_ngcontent-%COMP%]{border-color:#b53b4859;background:linear-gradient(180deg,#fff6f6,#fde9e9)}.demo-user-item.demo-user-item-deleted[_ngcontent-%COMP%]{border-color:#61697657;background:linear-gradient(180deg,#f7f8fa,#e9edf2)}.demo-user-item.demo-user-item-new[_ngcontent-%COMP%]{border-color:#26826161;background:linear-gradient(180deg,#f7fffb,#e8f8ef)}.demo-user-item.demo-user-item-location[_ngcontent-%COMP%]{border-color:#b5741c59;background:linear-gradient(180deg,#fffcf6,#fff1d9)}.demo-user-item[_ngcontent-%COMP%]   .user-avatar[_ngcontent-%COMP%], .demo-user-item[_ngcontent-%COMP%]   .demo-user-name[_ngcontent-%COMP%], .demo-user-item[_ngcontent-%COMP%]   .demo-user-meta[_ngcontent-%COMP%]{position:relative;z-index:1}.demo-user-item[_ngcontent-%COMP%]   .user-avatar[_ngcontent-%COMP%]{grid-column:1;grid-row:1/span 2;align-self:center}.demo-user-item[_ngcontent-%COMP%]   .demo-user-name[_ngcontent-%COMP%]{grid-column:2;grid-row:1;align-self:end;min-width:0}.demo-user-item[_ngcontent-%COMP%]   .demo-user-meta[_ngcontent-%COMP%]{grid-column:2;grid-row:2;align-self:start;min-width:0}.user-avatar[_ngcontent-%COMP%]{width:38px;height:38px;flex:0 0 38px;border-radius:50%;overflow:hidden;display:inline-flex;align-items:center;justify-content:center;color:#fff;font-size:.9rem;font-weight:800}.user-avatar.has-photo[_ngcontent-%COMP%]{background:#eef3f9}.user-avatar[_ngcontent-%COMP%]   img[_ngcontent-%COMP%]{opacity:0;display:block;width:100%;height:100%;object-fit:cover;object-position:center}.user-avatar[_ngcontent-%COMP%]   img.is-loaded[_ngcontent-%COMP%]{opacity:1}.user-avatar.user-color-woman[_ngcontent-%COMP%]{background:linear-gradient(180deg,#ff87b7,#ec4b93)}.user-avatar.user-color-man[_ngcontent-%COMP%]{background:linear-gradient(180deg,#74a2ff,#3968d8)}.user-avatar.user-color-setup[_ngcontent-%COMP%]{background:linear-gradient(180deg,#78d4b8,#2a8f73)}.demo-user-name[_ngcontent-%COMP%]{font-size:.86rem;font-weight:700;color:var(--%NS%entry-text-main, #22324a)}.demo-user-meta[_ngcontent-%COMP%]{font-size:.74rem;color:var(--%NS%entry-text-muted, rgba(34, 50, 74, .72))}.demo-user-status-pill[_ngcontent-%COMP%]{position:absolute;top:.48rem;right:.5rem;z-index:1;padding:.16rem .44rem;border-radius:999px;font-size:.66rem;font-weight:800;text-transform:uppercase;letter-spacing:0}.demo-user-item-blocked[_ngcontent-%COMP%]   .demo-user-status-pill[_ngcontent-%COMP%]{background:#b53b48;color:#fff}.demo-user-item-deleted[_ngcontent-%COMP%]   .demo-user-status-pill[_ngcontent-%COMP%]{background:#657080;color:#fff}.demo-user-item-new[_ngcontent-%COMP%]   .demo-user-status-pill[_ngcontent-%COMP%]{background:#268261;color:#fff}.demo-user-item-location[_ngcontent-%COMP%]   .demo-user-status-pill[_ngcontent-%COMP%]{background:#9b6014;color:#fff}@media(max-width:760px){.demo-user-stage[_ngcontent-%COMP%]{height:100%}.demo-user-grid[_ngcontent-%COMP%]{grid-template-columns:repeat(2,minmax(0,1fr));padding-bottom:calc(1rem + env(safe-area-inset-bottom))}.demo-user-grid-loading[_ngcontent-%COMP%]{grid-template-columns:minmax(0,1fr);justify-items:center;align-items:center}.demo-user-loading-shell[_ngcontent-%COMP%]{padding:max(1.2rem,env(safe-area-inset-top)) 1.4rem max(1.2rem + env(safe-area-inset-bottom),1.2rem)}.demo-user-loading-copy-group[_ngcontent-%COMP%]{width:min(100%,24rem)}.demo-user-progress-shell[_ngcontent-%COMP%]{width:min(100%,18.5rem);margin-inline:auto}}@keyframes _ngcontent-%COMP%_demo-user-selected-ring-spin{to{transform:rotate(360deg)}}'],changeDetection:1})},vn=Object.freeze({__proto__:null,DemoBootstrapSelectorComponent:fn}),xn=Object.freeze({__proto__:null,UsersService:X}),bt=class J{users=x(X);profiles=x(At);editingUserId="";onSaved;onCancel;onboarding=k(()=>this.profiles.activeUserProfile()?.profileStatus==="onboarding");open=z(!1);componentRef=z(null);componentLoad=null;component=this.componentRef.asReadonly();loadFailed=z(!1);loadingModel={title:"profile",ariaLabel:"profile",size:"wide",height:"full",bodyLayout:"fill",onClose:()=>this.close()};draft=z({name:"",images:[]});saving=z(!1);uploading=z(!1);error=z("");busy=k(()=>this.saving()||this.uploading());valid=k(()=>!!this.draft().name.trim()&&this.draft().name.trim().length<=80);constructor(){et(()=>{let t=this.profiles.activeUserId();ie(()=>{this.editingUserId&&t!==this.editingUserId&&(this.open.set(!1),this.draft.set({name:"",images:[]}),this.error.set(""),this.editingUserId="",this.onSaved=void 0,this.onCancel=void 0)})})}begin(t){let e=this.profiles.activeUserProfile();!e||this.busy()||(this.editingUserId=e.id,this.onSaved=t?.onSaved,this.onCancel=t?.onCancel,this.draft.set({name:e.name,images:[...e.images??[]],profileStatus:e.profileStatus,about:e.about,headline:e.headline}),this.error.set(""),this.open.set(!0),this.ensureLoaded())}async ensureLoaded(){if(!this.componentRef())return this.componentLoad?this.componentLoad:(this.loadFailed.set(!1),this.componentLoad=new Promise(t=>Se(t)).then(()=>import("./chunk-46dd7830.js")).then(t=>{this.componentRef.set(t.ProfileEditorComponent)}).catch(()=>{this.loadFailed.set(!0)}).finally(()=>{this.componentLoad=null}),this.componentLoad)}close(){if(this.busy())return;this.open.set(!1);let t=this.onCancel;this.onSaved=void 0,this.onCancel=void 0,t?.()}async save(){let t=this.profiles.activeUserProfile();if(!this.open()||this.busy()||!this.valid()||t?.id!==this.editingUserId)return;let e=this.draft();this.saving.set(!0),this.error.set("");try{let i=await this.users.saveUserProfile(q(Y(q({},t),{name:e.name.trim(),initials:$.initialsFromText(e.name),images:[...e.images],profileStatus:e.profileStatus??t.profileStatus,about:e.about??t.about,headline:e.headline??t.headline}),this.onboarding()?{profileStatus:"public",deletedAtIso:null}:{}));if(i&&this.profiles.activeUserId()===t.id){let s=this.onSaved;this.onSaved=void 0,this.onCancel=void 0,this.open.set(!1),await s?.(i)}}catch{this.error.set("profile.save.failed")}finally{this.saving.set(!1)}}static \u0275fac=function(t){return new(t||J)};static \u0275prov=Mt({token:J,factory:J.\u0275fac,providedIn:"root"})};function yn(n,t){if(n&1){let e=N();a(0,"mat-icon"),d(1,"error_outline"),r(),a(2,"button",2),y("click",function(){w(e);let i=l(2);return _(i.editor.ensureLoaded())}),d(3),m(4,"i18n"),r()}n&2&&(o(3),c(u(4,1,"try.again")))}function wn(n,t){n&1&&(L(0,"app-indicator",3),a(1,"span"),d(2),m(3,"i18n"),r()),n&2&&(o(2),c(ae(3,1,"loading.profile","Loading profile")))}function _n(n,t){if(n&1&&(a(0,"app-popup",0)(1,"div",1),b(2,yn,5,3)(3,wn,4,4),r()()),n&2){let e=l();h("model",e.editor.loadingModel),o(),M("aria-busy",!e.editor.loadFailed()),o(),g(e.editor.loadFailed()?2:3)}}function Sn(n,t){n&1&&it(0)}function Cn(n,t){n&1&&nt(0,Sn,1,0,"ng-container",4),n&2&&h("ngComponentOutlet",t)}var Ft=class vt{editor=x(bt);static \u0275fac=function(t){return new(t||vt)};static \u0275cmp=I({type:vt,selectors:[["app-profile-editor-host"]],decls:2,vars:2,consts:[[3,"model"],["role","status",1,"profile-editor-loading"],["type","button",3,"click"],["kind","spinner-ring","state","loading"],[4,"ngComponentOutlet"]],template:function(t,e){if(t&1&&(b(0,_n,4,3,"app-popup",0),b(1,Cn,1,1,"ng-container")),t&2){let i;g(e.editor.open()&&!e.editor.component()?0:-1),o(),g((i=e.editor.open()&&e.editor.component())?1:-1,i)}},dependencies:[oe,V,F,Z,j,K],styles:["[_nghost-%COMP%]{display:contents}.profile-editor-loading[_ngcontent-%COMP%]{flex:1;display:grid;place-content:center;justify-items:center;gap:12px;min-height:240px;color:#536a84}"],changeDetection:1})},Pn=/{{([^{}]+)}}/g;function Mn(n,t,e){let i=Nn(t);return`${n??""}`.replace(Pn,(s,p)=>{switch(p.trim()){case"deployment.privacy.contactDetails":return i?On(i,e):`<p>${A(e.contactNotPublished)}</p>`;case"deployment.privacy.deletionEmailRoute":return i?kn(i,e):"";default:return""}})}function Nn(n){let t=`${n?.dataControllerName??""}`.trim(),e=`${n?.privacyContactEmail??""}`.trim().toLowerCase();return n?.configured!==!0||!t||!$.isEmail(e)?null:{configured:!0,dataControllerName:t,privacyContactEmail:e}}function On(n,t){let e=A(n.privacyContactEmail);return["<ul>","<li>",`<strong>${A(t.dataControllerLabel)}:</strong> `,A(n.dataControllerName),"</li>","<li>",`<strong>${A(t.privacyContactEmailLabel)}:</strong> `,`<a href="mailto:${e}">${e}</a>`,"</li>","</ul>"].join("")}function kn(n,t){let e=A(n.privacyContactEmail);return["<p>",A(t.deletionEmailPrefix)," ",`<a href="mailto:${e}">${e}</a>`,A(t.deletionEmailSuffix),"</p>"].join("")}function A(n){return`${n??""}`.replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t]??"")}var Ln=()=>({actionSizing:"content"});function Rn(n,t){if(n&1&&(a(0,"article",5),L(1,"app-indicator",8),a(2,"span"),d(3),r()()),n&2){let e=l(3);o(3),c(e.loadingLabel())}}function zn(n,t){if(n&1&&(a(0,"p",11),d(1),r()),n&2){let e=l();o(),c(e.blurb)}}function In(n,t){if(n&1&&L(0,"div",12),n&2){let e=l();h("appLazyHtmlImages",!0)("innerHTML",e.contentHtml,Pt)}}function An(n,t){if(n&1&&(a(0,"li",14),d(1),r()),n&2){let e=t.$implicit;o(),c(e)}}function Un(n,t){if(n&1&&(a(0,"ul",13),U(1,An,2,1,"li",14,at),r()),n&2){let e=l();o(),E(e.points)}}function En(n,t){if(n&1&&(a(0,"li",14),d(1),r()),n&2){let e=t.$implicit;o(),c(e)}}function qn(n,t){if(n&1&&(a(0,"ul",13),U(1,En,2,1,"li",14,at),r()),n&2){let e=l();o(),E(e.details)}}function Tn(n,t){if(n&1&&(a(0,"div",10),b(1,zn,2,1,"p",11),b(2,In,1,2,"div",12),b(3,Un,3,0,"ul",13),b(4,qn,3,0,"ul",13),r()),n&2){let e=t;o(),g(e.blurb?1:-1),o(),g(e.contentHtml?2:-1),o(),g(e.points?.length?3:-1),o(),g(e.details?.length?4:-1)}}function $n(n,t){if(n&1&&b(0,Tn,5,4,"div",10),n&2){let e,i=t.$implicit,s=l(4);g((e=s.documentSectionFromItem(i))?0:-1,e)}}function Dn(n,t){if(n&1){let e=N();a(0,"app-accordion",9),y("itemToggle",function(i){w(e);let s=l(3);return _(s.onDocumentAccordionToggle(i))})("itemSelectionToggle",function(i){w(e);let s=l(3);return _(s.onDocumentAccordionSelectionToggle(i))}),r(),nt(1,$n,1,1,"ng-template",null,1,Lt)}if(n&2){let e=ot(2),i=l(3);h("model",i.documentAccordionModel())("itemTemplate",e)}}function Bn(n,t){if(n&1&&(a(0,"article",6)(1,"mat-icon"),d(2),r(),a(3,"h4"),d(4),r(),a(5,"p"),d(6),r()()),n&2){let e=l(3);o(2),c(e.emptyIcon()),o(2),c(e.emptyTitle()),o(2),c(e.emptyDescription())}}function jn(n,t){if(n&1&&(a(0,"span",16),d(1),r()),n&2){let e=l(4);h("ngClass",e.statusToneClass()),o(),c(e.statusMessage())}}function Vn(n,t){if(n&1){let e=N();a(0,"app-menu",18),y("itemSelect",function(i){w(e);let s=l(4);return _(s.onActionMenuSelect(i))}),r()}if(n&2){let e=l(4);h("model",le(2,Ln))("items",e.actionMenuItems())}}function Fn(n,t){if(n&1&&(a(0,"footer",15),b(1,jn,2,2,"span",16),b(2,Vn,1,3,"app-menu",17),r()),n&2){let e=l(3);P("document-viewer-actions-single",e.visibleActions().length<=1),o(),g(e.statusMessage()?1:-1),o(),g(e.visibleActions().length>0?2:-1)}}function Hn(n,t){if(n&1&&(a(0,"div",4),b(1,Rn,4,1,"article",5)(2,Dn,3,2)(3,Bn,7,3,"article",6),r(),b(4,Fn,3,4,"footer",7)),n&2){let e=l(2);P("document-viewer-content-loading",e.loading()),o(),g(e.loading()?1:e.activeConfig()?.sections?.length?2:3),o(3),g(e.statusMessage()||e.visibleActions().length>0?4:-1)}}function Gn(n,t){if(n&1&&(a(0,"app-popup",2),it(1,19),r()),n&2){l();let e=ot(1),i=l();h("model",i.documentPopupModel())("zIndex",2400),o(),h("ngTemplateOutlet",e)}}function Yn(n,t){if(n&1&&(a(0,"a",22),L(1,"app-deployment-brand",26),r()),n&2){let e=l(3);o(),h("branding",e.deploymentBranding())}}function Zn(n,t){if(n&1&&(a(0,"p",14),d(1),r()),n&2){let e=l(3);o(),c(e.description())}}function Kn(n,t){if(n&1&&(a(0,"span",25),d(1),r()),n&2){let e=l(3);o(),c(e.versionLabel())}}function Xn(n,t){if(n&1&&(a(0,"section",3)(1,"article",20)(2,"header",21),b(3,Yn,2,1,"a",22),a(4,"div",23)(5,"div",24)(6,"h2")(7,"span",14),d(8),r()(),b(9,Zn,2,1,"p",14),r(),b(10,Kn,2,1,"span",25),r()(),it(11,19),r()()),n&2){l();let e=ot(1),i=l();M("aria-label",i.ariaLabel()),o(2),h("ngClass",i.headerPaletteClass()),o(),g(i.showBrand()?3:-1),o(5),c(i.title()),o(),g(i.description()?9:-1),o(),g(i.versionLabel()?10:-1),o(),h("ngTemplateOutlet",e)}}function Jn(n,t){if(n&1&&(nt(0,Hn,5,4,"ng-template",null,0,Lt),b(2,Gn,2,3,"app-popup",2)(3,Xn,12,7,"section",3)),n&2){let e=l();o(2),g(e.isPopupShell()?2:3)}}var gt=class xt{deploymentConfiguration=x(Ce);deploymentBranding=this.deploymentConfiguration.branding;i18n=x(ut);route=x(Pe);helpCenter=x(Me);config=null;action=new T;openSectionId="";selectedSectionIds=new Set;initialSelectedSectionIds=new Set;selectionInputSignature="";sectionSignature="";openSectionSignature="";routeConfig=z(null);ngOnInit(){this.config||this.prepareRouteDocument()}ngOnChanges(t){t.config&&(this.syncSelectionFromConfig(),this.syncOpenSection())}isOpen(){return this.activeConfig()?.open!==!1}shell(){return this.activeConfig()?.shell??"page"}isPopupShell(){return this.shell()==="popup"}ariaLabel(){let t=this.activeConfig();return this.uiText(t?.ariaLabel?.trim()||t?.title||"document.title")}title(){return this.uiText(this.activeConfig()?.title?.trim()||"document.title")}description(){let t=this.activeConfig()?.description?.trim()??"";return t?this.uiText(t):""}versionLabel(){return this.activeConfig()?.versionLabel?.trim()??""}headerPaletteClass(){return`document-viewer-header-${this.normalizeHeaderPalette(this.activeConfig()?.headerPalette)}`}documentPopupModel(){let t=this.activeConfig();return{title:this.title(),subtitle:this.description(),headerBadge:this.versionLabel(),ariaLabel:this.ariaLabel(),closeAriaLabel:this.closeAriaLabel(),translateTitle:!1,translateSubtitle:!1,translateHeaderBadge:!1,closeOnBackdrop:t?.closeOnBackdrop!==!1,size:"wide",height:"full",headerLayout:"document",headerPalette:this.normalizeHeaderPalette(t?.headerPalette),bodyLayout:"flush",backdropTone:"dim",onClose:e=>this.requestClose(e)}}showBrand(){return!this.isPopupShell()&&this.activeConfig()?.showBrand!==!1}loading(){return this.activeConfig()?.loading===!0}loadingLabel(){return this.uiText(this.activeConfig()?.loadingLabel?.trim()||"Loading document")}closeAriaLabel(){return this.uiText(this.activeConfig()?.closeAriaLabel?.trim()||"Close document")}requestClose(t){t?.stopPropagation(),this.activeConfig()?.onClose?.()}toggleSectionSelection(t,e){if(e?.preventDefault(),e?.stopPropagation(),e?.stopImmediatePropagation(),!t.toggleable)return;let i=new Set(this.selectedSectionIds);i.has(t.id)?i.delete(t.id):i.add(t.id),this.selectedSectionIds=i}documentAccordionModel(){return this.activeConfig(),{items:this.resolvedSections().map(t=>({id:t.id,title:t.title,icon:t.icon,palette:this.sectionAccordionPalette(t),open:this.openSectionId===t.id,selectable:t.toggleable===!0,selected:this.isSectionSelected(t),selectionAriaLabel:this.selectionAriaLabel(t),context:t})),multi:!1,labelSize:"large"}}documentSectionFromItem(t){return t.context??this.resolvedSections().find(e=>e.id===t.id)??null}onDocumentAccordionToggle(t){this.openSectionId=t.open?t.id:""}onDocumentAccordionSelectionToggle(t){let e=this.documentSectionFromItem(t.item);e&&this.toggleSectionSelection(e,t.sourceEvent)}isSectionSelected(t){return this.selectedSectionIds.has(t.id)}sectionAccordionPalette(t){return t.tone==="mandatory"?"amber":t.tone==="optional"?"blue":"slate"}selectionAriaLabel(t){let e=t.title?.trim()||this.uiText("Section");return this.isSectionSelected(t)?this.uiText(`${e} selected`):this.uiText(`Select ${e}`)}visibleActions(){return(this.activeConfig()?.actions??[]).filter(t=>this.isActionVisible(t.visible))}actionMenuItems(){return this.visibleActions().map(t=>({id:t.id,label:t.label,icon:t.icon??void 0,kind:"action",layout:"action",palette:t.palette??"blue",disabled:t.disabled===!0,progress:t.progress??null,ariaLabel:t.label}))}onActionMenuSelect(t){let e=this.visibleActions().find(i=>i.id===t.id);!e||e.disabled||this.emitDocumentAction(e,t.sourceEvent)}statusToneClass(){return this.activeConfig()?.statusTone==="error"?"document-viewer-status-message-error":"document-viewer-status-message-default"}statusMessage(){return this.activeConfig()?.statusMessage?.trim()??""}emptyIcon(){return this.activeConfig()?.emptyState?.icon?.trim()||"description"}emptyTitle(){return this.uiText(this.activeConfig()?.emptyState?.title?.trim()||"Document is not available")}emptyDescription(){return this.uiText(this.activeConfig()?.emptyState?.description?.trim()||"Document content is not available right now.")}uiText(t){return this.i18n.translateParams(t,{productName:this.deploymentBranding().productName})}syncSelectionFromConfig(){let t=this.activeConfig(),e=t?.sections??[],i=e.map(f=>`${f.id}:${f.toggleable===!0}:${f.selected===!0}`).join("|"),s=t?.selectedSectionIds?t.selectedSectionIds.map(f=>`${f??""}`.trim()).filter(Boolean):e.filter(f=>f.selected===!0).map(f=>f.id),p=s.join("|");i===this.sectionSignature&&p===this.selectionInputSignature||(this.sectionSignature=i,this.selectionInputSignature=p,this.selectedSectionIds=new Set(s),this.initialSelectedSectionIds=new Set(s))}syncOpenSection(){let t=this.activeConfig()?.sections??[],e=t.map(s=>s.id).join("|");if(t.length===0){this.openSectionSignature="",this.openSectionId="";return}let i=e!==this.openSectionSignature;if(this.openSectionSignature=e,!i){this.openSectionId&&!t.some(s=>s.id===this.openSectionId)&&(this.openSectionId=t[0].id);return}(!this.openSectionId||!t.some(s=>s.id===this.openSectionId))&&(this.openSectionId=t[0].id)}currentSelectedSectionIds(){return Array.from(this.selectedSectionIds).sort($.compareCodeUnits)}isSelectionDirty(){let t=this.currentSelectedSectionIds(),e=Array.from(this.initialSelectedSectionIds).sort($.compareCodeUnits);return t.length!==e.length?!0:t.some((i,s)=>i!==e[s])}isActionVisible(t){return t==="dirty"?this.isSelectionDirty():t!==!1}emitDocumentAction(t,e){this.action.emit({id:t.id,action:t,selectedSectionIds:this.currentSelectedSectionIds(),sourceEvent:e??new Event(t.id)})}normalizeHeaderPalette(t){return $.enumValue(t,Ne.documentViewerHeaderPalettes,"amber")}activeConfig(){return this.config??this.routeConfig()}async prepareRouteDocument(){let t=this.route.snapshot.data,e=this.normalizeDocumentKind(t.documentKind);this.routeConfig.set(this.createRouteConfig(t,null,!0));try{await this.helpCenter.preload(e),this.routeConfig.set(this.createRouteConfig(t,this.activeRevision(e),!1)),this.syncSelectionFromConfig(),this.syncOpenSection()}catch{this.routeConfig.set(this.createRouteConfig(t,null,!1))}}createRouteConfig(t,e,i){let s=this.normalizeDocumentKind(t.documentKind);return{shell:"page",open:!0,ariaLabel:t.ariaLabel?.trim()||this.defaultAriaLabel(s),title:e?.summary?.trim()||t.title?.trim()||this.defaultTitle(s),description:e?.description?.trim()||t.description?.trim()||this.defaultDescription(s),versionLabel:this.routeVersionLabel(e?.version),headerPalette:this.routeHeaderPalette(s,e?.headerColor??t.headerPalette),loading:i,loadingLabel:t.loadingLabel?.trim()||this.defaultLoadingLabel(s),emptyState:{icon:t.emptyIcon?.trim()||this.defaultEmptyIcon(s),title:t.emptyTitle?.trim()||this.defaultEmptyTitle(s),description:t.emptyDescription?.trim()||this.defaultEmptyDescription(s)},sections:(e?.sections??[]).map(p=>({id:p.id,icon:p.icon,title:p.title,blurb:p.blurb,contentHtml:p.contentHtml,points:p.points,details:p.details}))}}resolvedSections(){this.i18n.revision();let t=this.deploymentConfiguration.privacyContact(),e={dataControllerLabel:this.i18n.translate("deployment.privacy.data.controller"),privacyContactEmailLabel:this.i18n.translate("deployment.privacy.contact.email"),contactNotPublished:this.i18n.translate("deployment.privacy.contact.not.published"),deletionEmailPrefix:this.i18n.translate("deployment.privacy.deletion.email.prefix"),deletionEmailSuffix:this.i18n.translate("deployment.privacy.deletion.email.suffix")};return(this.activeConfig()?.sections??[]).map(i=>Y(q({},i),{contentHtml:Mn(i.contentHtml,t,e)}))}activeRevision(t){return t==="privacy"?this.helpCenter.activePrivacyRevision():t==="terms"?this.helpCenter.activeTermsRevision():this.helpCenter.activeRevision()}normalizeDocumentKind(t){return t==="privacy"||t==="terms"?t:"help"}routeVersionLabel(t){return Number.isFinite(Number(t))&&Number(t)>0?`v${Math.trunc(Number(t))}`:""}routeHeaderPalette(t,e){let i=this.normalizeHeaderPalette(e);return t==="help"&&i==="amber"?"teal":i}defaultAriaLabel(t){return t==="privacy"?"privacy.consent.aria":t==="terms"?"terms.document.aria":"help"}defaultTitle(t){return t==="privacy"?"privacy.document.title":t==="terms"?"terms.document.title":"help"}defaultDescription(t){return t==="terms"?"document.terms.description":""}defaultLoadingLabel(t){return t==="privacy"?"privacy.document.loading":t==="terms"?"terms.document.loading":"help.document.loading"}defaultEmptyIcon(t){return t==="privacy"?"policy":t==="terms"?"rule":"help_outline"}defaultEmptyTitle(t){return t==="privacy"?"privacy.document.unavailable.title":t==="terms"?"terms.document.unavailable.title":"help.document.unavailable.title"}defaultEmptyDescription(t){return t==="privacy"?"privacy.document.unavailable.description":t==="terms"?"terms.document.unavailable.description":"help.document.unavailable.description"}static \u0275fac=function(t){return new(t||xt)};static \u0275cmp=I({type:xt,selectors:[["app-document-viewer"]],inputs:{config:"config"},outputs:{action:"action"},features:[se],decls:1,vars:1,consts:[["documentViewerBody",""],["documentSectionTemplate",""],[3,"model","zIndex"],[1,"document-viewer-page"],[1,"document-viewer-content"],[1,"document-viewer-status","document-viewer-status-loading"],[1,"document-viewer-status"],[1,"document-viewer-actions",3,"document-viewer-actions-single"],["kind","load-ring","state","loading"],[1,"document-viewer-accordion",3,"itemToggle","itemSelectionToggle","model","itemTemplate"],[1,"document-viewer-section-body"],["data-i18n-ignore","",1,"document-viewer-lead"],["appLazyBgImage","","data-i18n-ignore","",1,"document-viewer-html",3,"appLazyHtmlImages","innerHTML"],[1,"document-viewer-list"],["data-i18n-ignore",""],[1,"document-viewer-actions"],["role","status",1,"document-viewer-status-message",3,"ngClass"],["kind","inline","layout","row",1,"document-viewer-action-menu",3,"model","items"],["kind","inline","layout","row",1,"document-viewer-action-menu",3,"itemSelect","model","items"],[3,"ngTemplateOutlet"],[1,"document-viewer-page-panel"],[1,"document-viewer-head",3,"ngClass"],["href","/",1,"document-viewer-brand"],[1,"document-viewer-head-row"],[1,"document-viewer-title-wrap"],[1,"document-viewer-version"],[3,"branding"]],template:function(t,e){t&1&&b(0,Jn,4,1),t&2&&g(e.isOpen()?0:-1)},dependencies:[Nt,Ot,re,V,F,zt,Oe,ke,Z,qt,j],styles:["[_nghost-%COMP%]{display:contents}.document-viewer-page[_ngcontent-%COMP%]{box-sizing:border-box;min-height:0;height:100vh;overflow:hidden;display:grid;place-items:stretch;background:radial-gradient(circle at top left,rgba(80,96,125,.12),transparent 34rem),linear-gradient(180deg,#f8fbff,#fff 46%,#f7f8fc);color:#172033;padding:36px 16px 64px}.document-viewer-page-panel[_ngcontent-%COMP%]{position:relative;z-index:1;overflow:hidden;display:grid;grid-template-rows:auto minmax(0,1fr) auto;border:1px solid rgba(198,210,226,.92);background:#fff;color:#172033}.document-viewer-page-panel[_ngcontent-%COMP%]{width:min(920px,100%);height:100%;min-height:0;margin:0 auto;border:1px solid rgba(35,45,72,.1);border-radius:14px;box-shadow:0 18px 58px #2d395624}.document-viewer-head[_ngcontent-%COMP%]{--%NS%document-viewer-header-bg: linear-gradient(180deg, #eef3f8 0%, #f8fafc 100%);--%NS%document-viewer-header-border: rgba(72, 92, 118, .24);--%NS%document-viewer-header-title: #304157;--%NS%document-viewer-header-text: rgba(48, 65, 87, .78);--%NS%document-viewer-header-pill-bg: #40566f;border-bottom:1px solid var(--%NS%document-viewer-header-border);background:var(--%NS%document-viewer-header-bg)}.document-viewer-header-amber[_ngcontent-%COMP%]{--%NS%document-viewer-header-bg: linear-gradient(180deg, #fbf4e8 0%, #fffaf0 100%);--%NS%document-viewer-header-border: rgba(157, 118, 41, .24);--%NS%document-viewer-header-title: #7c5618;--%NS%document-viewer-header-text: rgba(108, 74, 19, .84);--%NS%document-viewer-header-pill-bg: #b66a15}.document-viewer-header-blue[_ngcontent-%COMP%]{--%NS%document-viewer-header-bg: linear-gradient(180deg, #eef6ff 0%, #f8fbff 100%);--%NS%document-viewer-header-border: rgba(53, 96, 162, .24);--%NS%document-viewer-header-title: #1f3f6f;--%NS%document-viewer-header-text: rgba(46, 78, 119, .84);--%NS%document-viewer-header-pill-bg: #2f6fae}.document-viewer-header-green[_ngcontent-%COMP%]{--%NS%document-viewer-header-bg: linear-gradient(180deg, #f0fbf3 0%, #e4f7ea 100%);--%NS%document-viewer-header-border: rgba(58, 143, 91, .3);--%NS%document-viewer-header-title: #246b42;--%NS%document-viewer-header-text: rgba(35, 94, 58, .84);--%NS%document-viewer-header-pill-bg: #1f7a49}.document-viewer-header-teal[_ngcontent-%COMP%]{--%NS%document-viewer-header-bg: linear-gradient(180deg, #eefafa 0%, #f7fdfd 100%);--%NS%document-viewer-header-border: rgba(33, 126, 132, .24);--%NS%document-viewer-header-title: #17646d;--%NS%document-viewer-header-text: rgba(28, 91, 99, .84);--%NS%document-viewer-header-pill-bg: #197987}.document-viewer-header-rose[_ngcontent-%COMP%]{--%NS%document-viewer-header-bg: linear-gradient(180deg, #fff1f4 0%, #fff8fa 100%);--%NS%document-viewer-header-border: rgba(178, 69, 98, .26);--%NS%document-viewer-header-title: #8c2e49;--%NS%document-viewer-header-text: rgba(122, 45, 70, .84);--%NS%document-viewer-header-pill-bg: #b94462}.document-viewer-header-violet[_ngcontent-%COMP%]{--%NS%document-viewer-header-bg: linear-gradient(180deg, #f5f0ff 0%, #fbf8ff 100%);--%NS%document-viewer-header-border: rgba(107, 80, 175, .26);--%NS%document-viewer-header-title: #50398e;--%NS%document-viewer-header-text: rgba(75, 52, 128, .84);--%NS%document-viewer-header-pill-bg: #6b50af}.document-viewer-header-slate[_ngcontent-%COMP%]{--%NS%document-viewer-header-bg: linear-gradient(180deg, #eef3f8 0%, #f8fafc 100%);--%NS%document-viewer-header-border: rgba(72, 92, 118, .24);--%NS%document-viewer-header-title: #304157;--%NS%document-viewer-header-text: rgba(48, 65, 87, .78);--%NS%document-viewer-header-pill-bg: #40566f}.document-viewer-brand[_ngcontent-%COMP%]{display:inline-flex;align-items:center;gap:10px;width:fit-content;margin:18px 20px 0;color:inherit;text-decoration:none;font-weight:800;font-size:1.2rem;--%NS%deployment-brand-logo-size: 40px;--%NS%deployment-brand-gap: 10px}.document-viewer-brand[_ngcontent-%COMP%]   app-deployment-brand[_ngcontent-%COMP%]{filter:drop-shadow(0 8px 11px rgba(71,68,158,.18))}.document-viewer-head-row[_ngcontent-%COMP%]{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:16px;align-items:start;padding:18px 20px}.document-viewer-title-wrap[_ngcontent-%COMP%]{min-width:0}.document-viewer-title-wrap[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%], .document-viewer-title-wrap[_ngcontent-%COMP%]   p[_ngcontent-%COMP%]{margin:0}.document-viewer-title-wrap[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%]{color:var(--%NS%document-viewer-header-title);font-size:1.45rem;line-height:1.12}.document-viewer-title-wrap[_ngcontent-%COMP%]   p[_ngcontent-%COMP%]{margin-top:6px;color:var(--%NS%document-viewer-header-text);line-height:1.45;font-weight:400}.document-viewer-version[_ngcontent-%COMP%]{align-self:start;border-radius:999px;background:var(--%NS%document-viewer-header-pill-bg);color:#fff;padding:5px 10px;font-size:.78rem;font-weight:800}.document-viewer-content[_ngcontent-%COMP%]{flex:1 1 auto;overflow:auto;min-height:0;padding:18px;background:#f8fbff}.document-viewer-content-loading[_ngcontent-%COMP%]{display:grid;place-items:center}.document-viewer-accordion[_ngcontent-%COMP%]{display:block}.document-viewer-section-body[_ngcontent-%COMP%]{padding:.1rem .25rem .2rem;color:#33405a;line-height:1.62}.document-viewer-lead[_ngcontent-%COMP%]{margin:0 0 12px;color:#4b5872;line-height:1.58}.document-viewer-html[_ngcontent-%COMP%]   :is(p[_ngcontent-%COMP%], ul[_ngcontent-%COMP%], ol[_ngcontent-%COMP%]){margin:0 0 12px;color:#26374f;line-height:1.55}.document-viewer-html[_ngcontent-%COMP%]   :is(h3[_ngcontent-%COMP%], h4[_ngcontent-%COMP%]){margin:18px 0 10px;color:#172033}.document-viewer-html[_ngcontent-%COMP%]   ul[_ngcontent-%COMP%], .document-viewer-html[_ngcontent-%COMP%]   ol[_ngcontent-%COMP%], .document-viewer-list[_ngcontent-%COMP%]{display:grid;gap:8px;margin:0 0 12px;padding-left:1.2rem;color:#26374f}.document-viewer-html[_ngcontent-%COMP%]   :is(figure[_ngcontent-%COMP%]){margin:.85rem 0}.document-viewer-html[_ngcontent-%COMP%]   :is(img[_ngcontent-%COMP%]){max-width:100%;height:auto;border-radius:8px}.document-viewer-status[_ngcontent-%COMP%]{display:grid;place-items:center;min-height:220px;border:1px dashed rgba(83,105,139,.24);border-radius:8px;background:#f7fafed1;color:#2c3f5cb8;text-align:center;padding:2rem}.document-viewer-status[_ngcontent-%COMP%]   h4[_ngcontent-%COMP%], .document-viewer-status[_ngcontent-%COMP%]   p[_ngcontent-%COMP%]{margin:0}.document-viewer-status[_ngcontent-%COMP%]   .mat-icon[_ngcontent-%COMP%]{margin-bottom:.45rem;color:#6d86a8}.document-viewer-status-loading[_ngcontent-%COMP%]{gap:.7rem;min-height:180px;box-sizing:border-box;width:min(100%,360px);font-weight:800}.document-viewer-actions[_ngcontent-%COMP%]{display:flex;align-items:center;justify-content:flex-end;gap:12px;border-top:1px solid rgba(35,45,72,.1);background:#fff;padding:14px 18px}.document-viewer-actions-single[_ngcontent-%COMP%]{justify-content:flex-end}.document-viewer-status-message[_ngcontent-%COMP%]{margin-right:auto;font-size:.9rem;font-weight:700}.document-viewer-status-message-default[_ngcontent-%COMP%]{color:#244168b8}.document-viewer-status-message-error[_ngcontent-%COMP%]{color:#9b2c37}.document-viewer-action-menu[_ngcontent-%COMP%]{display:inline-flex}@media(max-width:760px){.document-viewer-page[_ngcontent-%COMP%]{padding:0}.document-viewer-page-panel[_ngcontent-%COMP%]{width:100vw;height:100vh;max-height:none;min-height:0;border-radius:0;border-inline:0}.document-viewer-head-row[_ngcontent-%COMP%]{grid-template-columns:minmax(0,1fr) max-content;gap:10px}.document-viewer-version[_ngcontent-%COMP%]{justify-self:start}.document-viewer-content[_ngcontent-%COMP%]{padding:.8rem}.document-viewer-actions[_ngcontent-%COMP%]{align-items:stretch;flex-direction:column}.document-viewer-status-message[_ngcontent-%COMP%]{margin-right:0}.document-viewer-action-menu[_ngcontent-%COMP%]{align-self:flex-end}}"],changeDetection:1})},Wn=Object.freeze({__proto__:null,DocumentViewerComponent:gt}),Qn=Object.freeze({__proto__:null,ProfileEditorHostComponent:Ft}),ti=n=>[n],Ht=(n,t)=>t.id;function ei(n,t){if(n&1){let e=N();a(0,"app-menu",11),y("itemSelect",function(i){w(e);let s=l(2);return _(s.toggle(i))}),r()}if(n&2){let e=t.$implicit;h("items",de(2,ti,e)),M("data-guide-field",e.id)}}function ni(n,t){if(n&1){let e=N();a(0,"app-menu",12),y("itemSelect",function(i){w(e);let s=l(2);return _(s.action(i))}),r()}if(n&2){let e=l(2);h("model",e.actionModel)("items",e.permissionActions())}}function ii(n,t){if(n&1){let e=N();a(0,"section",9)(1,"h3",13),d(2),m(3,"i18n"),r(),a(4,"p"),d(5),m(6,"i18n"),r(),a(7,"app-menu",14),y("itemSelect",function(i){w(e);let s=l(2);return _(s.action(i))}),r()()}if(n&2){let e=l(2);o(2),c(u(3,4,"install.app")),o(3),c(u(6,6,"app.setup.description")),o(2),h("model",e.actionModel)("items",e.installActions())}}function oi(n,t){if(n&1&&(a(0,"section",17)(1,"h3")(2,"mat-icon",18),d(3),r(),d(4),m(5,"i18n"),r(),a(6,"p"),d(7),m(8,"i18n"),r()()),n&2){let e=t.$implicit;M("data-tone",e.tone),o(3),c(e.icon),o(),c(u(5,4,"app.setup.help."+e.id+".title")),o(3),c(u(8,6,"app.setup.help."+e.id+".text"))}}function ai(n,t){if(n&1){let e=N();a(0,"app-popup",15),y("close",function(){w(e);let i=l(2);return _(i.helpOpen.set(!1))}),a(1,"div",16),U(2,oi,9,8,"section",17,Ht),r()()}if(n&2){let e=l(2);h("model",e.helpModel),o(2),E(e.helpSections)}}function ri(n,t){if(n&1){let e=N();a(0,"app-popup",0),y("close",function(){w(e);let i=l();return _(i.store.close())}),a(1,"div",1)(2,"section",2)(3,"h3",3),d(4),m(5,"i18n"),r(),a(6,"p"),d(7),m(8,"i18n"),r(),a(9,"app-menu",4),y("itemSelect",function(i){w(e);let s=l();return _(s.action(i))}),r()(),a(10,"section",5)(11,"h3",6),d(12),m(13,"i18n"),r(),a(14,"p"),d(15),m(16,"i18n"),r(),U(17,ei,1,4,"app-menu",7,Ht),b(19,ni,1,2,"app-menu",8),r(),b(20,ii,8,8,"section",9),r()(),b(21,ai,4,1,"app-popup",10)}if(n&2){let e=l();h("model",e.model()),o(4),c(u(5,10,"app.setup.open.browser")),o(3),c(u(8,12,"app.setup.open.browser.help")),o(2),h("model",e.actionModel)("items",e.browserActions),o(3),c(u(13,14,"app.setup.permissions")),o(3),c(u(16,16,"app.setup.permission.help")),o(2),E(e.toggles()),o(2),g(e.showPermissionAction()?19:-1),o(),g(e.installActions().length?20:-1),o(),g(e.helpOpen()?21:-1)}}var si=class yt{store=x(Le);i18n=x(ut);helpOpen=z(!1);actionModel={actionSizing:"content"};browserActions=[{id:"open-browser",icon:"open_in_browser",layout:"action",label:"app.setup.open.browser",palette:"blue"}];model=k(()=>({errorMessage:this.store.error()||(this.store.locationSelected()?null:"entry.permissions.location.required"),title:"app.setup.title",size:"small",height:"auto",mobilePresentation:"fullscreen",headerTone:"accent",headerPalette:"violet",showClose:!0,closeOnBackdrop:!1,backdropTone:"dim",headerActions:[{id:"help",guideFieldId:"help",icon:"question_mark",palette:"blue",ariaLabel:this.i18n.translate("app.setup.help.title")}],onAction:()=>this.helpOpen.set(!0)}));helpModel={title:"app.setup.help.title",size:"default",height:"auto",headerTone:"accent",headerPalette:"blue",showClose:!0,backdropTone:"dim"};helpSections=[{id:"location",icon:"location_on",tone:"blue"},{id:"notifications",icon:"notifications",tone:"violet"},{id:"install",icon:"install_mobile",tone:"green"},{id:"blocked",icon:"block",tone:"rose"},{id:"android",icon:"android",tone:"teal"},{id:"ios",icon:"phone_iphone",tone:"orange"}];toggles=k(()=>[{id:"location",kind:"toggle",layout:"pill",icon:"location_on",label:"app.setup.location",palette:"blue",togglePalette:this.store.locationSelected()&&this.store.locationAvailable()?"green":this.store.locationPermission()==="denied"?"red":this.store.locationSelected()?"blue":"slate",checked:this.store.locationSelected(),showToggleIndicator:!this.store.locationPermissionPending(),progress:this.store.locationPermissionPending()?{state:"loading",shape:"button"}:null,disabled:this.store.actionPending()||this.store.locationPermissionPending()},{id:"notifications",kind:"toggle",layout:"pill",icon:"notifications",label:"app.setup.notifications",palette:"violet",togglePalette:this.store.notificationsSelected()&&this.store.messaging.notificationPermission()==="granted"?"green":this.store.messaging.notificationPermission()==="denied"?"red":this.store.notificationsSelected()?"blue":"slate",checked:this.store.notificationsSelected(),showToggleIndicator:!this.store.notificationConfigurationPending(),progress:this.store.notificationConfigurationPending()?{state:"loading",shape:"button"}:null,disabled:this.store.actionPending()||this.store.notificationConfigurationPending()||!this.store.messaging.notificationsConfigured}]);installActions=k(()=>[...this.store.pwa.installAvailable()||this.store.pwa.installActionPending()?[{id:"install",icon:"install_desktop",layout:"action",label:"install.app",palette:"violet",disabled:this.store.actionPending()||this.store.pwa.installActionPending(),progress:{state:this.store.pwa.installBusy()?"loading":null}}]:[]]);showPermissionAction=k(()=>this.store.actionPending()||this.store.locationPermissionPending()||this.store.notificationConfigurationPending()||this.store.locationMissing()||this.toggles().some(t=>!t.disabled));permissionActionPending=k(()=>this.store.busy()||this.store.notificationConfigurationPending()||this.store.locationPermissionPending());permissionActions=k(()=>[{id:"allow",icon:this.permissionActionPending()?"hourglass_empty":this.store.saveSucceeded()?"check_circle":"check",label:this.permissionActionPending()?"entry.permissions.checking":this.store.loginRequested()?"login":"app.setup.update",layout:"action",palette:this.store.error()?"danger":this.store.saveSucceeded()?"green":"blue",disabled:this.store.allowDisabled(),progress:this.permissionActionPending()||this.store.error()?{state:this.permissionActionPending()?"loading":"error",shape:"button",perimeter:100,durationMs:Re.locationRequestTimeoutMs}:this.store.saveSucceeded()?{state:"success",durationMs:1e3}:null}]);constructor(){et(()=>{this.store.isOpen()||this.helpOpen.set(!1)})}refreshPermissions(){this.store.isOpen()&&this.store.refreshPermissions()}toggle(t){this.store.actionPending()||(t.id==="location"?this.store.toggleLocation():t.id==="notifications"&&this.store.toggleNotifications())}action(t){t.id==="install"&&this.store.install(),t.id==="open-browser"&&this.store.pwa.openInBrowser(),t.id==="allow"&&this.store.allow()}static \u0275fac=function(t){return new(t||yt)};static \u0275cmp=I({type:yt,selectors:[["app-setup-popup"]],hostBindings:function(t,e){t&1&&y("focus",function(){return e.refreshPermissions()},kt)},decls:1,vars:1,consts:[["guideContext","landing.setup",3,"close","model"],[1,"app-setup-content"],["aria-labelledby","setup-browser",1,"app-setup-section","app-setup-browser"],["id","setup-browser"],["kind","inline",1,"app-setup-action",3,"itemSelect","model","items"],["aria-labelledby","setup-permissions",1,"app-setup-section"],["id","setup-permissions"],["kind","inline",1,"app-setup-toggle",3,"items"],["kind","inline","data-guide-field","permissions-save",1,"app-setup-action",3,"model","items"],["aria-labelledby","setup-install",1,"app-setup-section","app-setup-install"],[3,"model"],["kind","inline",1,"app-setup-toggle",3,"itemSelect","items"],["kind","inline","data-guide-field","permissions-save",1,"app-setup-action",3,"itemSelect","model","items"],["id","setup-install"],["kind","inline","data-guide-field","install",1,"app-setup-action",3,"itemSelect","model","items"],[3,"close","model"],[1,"app-setup-help"],[1,"app-setup-help-card"],["aria-hidden","true"]],template:function(t,e){t&1&&b(0,ri,22,18),t&2&&g(e.store.isOpen()?0:-1)},dependencies:[j,qt,V,F,K],styles:["[_nghost-%COMP%]{--%NS%app-popup-small-width: 340px}.app-setup-content[_ngcontent-%COMP%], .app-setup-section[_ngcontent-%COMP%]{display:grid;grid-template-columns:minmax(0,1fr);min-width:0;gap:.65rem}.app-setup-content[_ngcontent-%COMP%]{padding:.5rem;color:#28415f;line-height:1.4}h3[_ngcontent-%COMP%], p[_ngcontent-%COMP%]{margin:0}h3[_ngcontent-%COMP%]{font-size:.95rem}p[_ngcontent-%COMP%]{font-size:.9rem;overflow-wrap:anywhere}.app-setup-install[_ngcontent-%COMP%]{border-top:1px solid #dce3ed;padding-top:.8rem;margin-top:.3rem}.app-setup-error[_ngcontent-%COMP%]{color:#a32035}app-menu[_ngcontent-%COMP%]{max-width:100%}.app-setup-action[_ngcontent-%COMP%]{justify-self:end}.app-setup-toggle[_ngcontent-%COMP%]{--%NS%app-menu-row-item-width: 14rem;--%NS%app-menu-row-item-justify: space-between}.app-setup-help[_ngcontent-%COMP%]{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.65rem;padding:.25rem;color:#28415f;line-height:1.45}.app-setup-help-card[_ngcontent-%COMP%]{--%NS%help-accent: #315fcf;--%NS%help-soft: #eef5ff;min-width:0;padding:.8rem;border:1px solid color-mix(in srgb,var(--%NS%help-accent) 34%,transparent);border-radius:14px;background:linear-gradient(155deg,var(--%NS%help-soft),#fff 76%)}.app-setup-help-card[data-tone=violet][_ngcontent-%COMP%]{--%NS%help-accent: #7247db;--%NS%help-soft: #f4efff}.app-setup-help-card[data-tone=green][_ngcontent-%COMP%]{--%NS%help-accent: #176b47;--%NS%help-soft: #ecfaf2}.app-setup-help-card[data-tone=rose][_ngcontent-%COMP%]{--%NS%help-accent: #b85072;--%NS%help-soft: #fff0f4}.app-setup-help-card[data-tone=teal][_ngcontent-%COMP%]{--%NS%help-accent: #167887;--%NS%help-soft: #eaf9fb}.app-setup-help-card[data-tone=orange][_ngcontent-%COMP%]{--%NS%help-accent: #a94808;--%NS%help-soft: #fff3e8}.app-setup-help-card[_ngcontent-%COMP%]   h3[_ngcontent-%COMP%]{display:flex;align-items:center;gap:.5rem;color:var(--%NS%help-accent);margin-bottom:.5rem}.app-setup-help-card[_ngcontent-%COMP%]   mat-icon[_ngcontent-%COMP%]{flex:0 0 auto}@media(max-width:600px){.app-setup-help[_ngcontent-%COMP%]{grid-template-columns:minmax(0,1fr)}}.app-setup-browser[_ngcontent-%COMP%]{padding:.8rem;border:2px solid #edbd6b;border-radius:12px;background:linear-gradient(135deg,#fff5cf,#fff0f6);color:#513a50}.app-setup-browser[_ngcontent-%COMP%]   h3[_ngcontent-%COMP%]{color:#713cb0}.app-setup-browser[_ngcontent-%COMP%]   p[_ngcontent-%COMP%]{font-weight:500}"],changeDetection:1})},li=Object.freeze({__proto__:null,AppSetupPopupComponent:si}),di=Object.freeze({__proto__:null,DocumentViewerComponent:gt});function ci(n,t){if(n&1&&(a(0,"p",6),d(1),m(2,"i18n"),r()),n&2){let e=l(2);o(),c(u(2,1,e.statusMessage))}}function mi(n,t){if(n&1){let e=N();a(0,"div",7)(1,"button",8),y("click",function(){w(e);let i=l(2);return _(i.requestProvider("google"))}),a(2,"span",9)(3,"span",10),d(4,"G"),r()(),a(5,"span"),d(6),m(7,"i18n"),r()(),a(8,"button",11),m(9,"i18n"),a(10,"span",12),d(11,"f"),r(),a(12,"span"),d(13),m(14,"i18n"),r(),a(15,"span",13),d(16),m(17,"i18n"),r()(),a(18,"button",14),y("click",function(){w(e);let i=l(2);return _(i.openEmail())}),a(19,"span",15)(20,"mat-icon"),d(21,"mail"),r()(),a(22,"span"),d(23),m(24,"i18n"),r()(),a(25,"p",16),d(26),m(27,"i18n"),a(28,"a",17),d(29,"Google"),r(),d(30),m(31,"i18n"),a(32,"a",17),d(33,"Meta/Facebook"),r(),d(34),m(35,"i18n"),r()()}if(n&2){let e=l(2);o(),h("disabled",e.busy)("matRippleColor","rgba(66, 133, 244, 0.12)"),o(5),c(u(7,14,e.busy?"connecting":"continue.with.google")),o(2),M("title",u(9,16,"facebook.login.coming.soon")),o(5),c(u(14,18,"continue.with.facebook")),o(3),c(u(17,20,"coming.soon")),o(2),h("disabled",e.busy)("matRippleColor","rgba(54, 74, 104, 0.12)"),o(5),c(u(24,22,"continue.with.email")),o(3),R(" ",u(27,24,"firebase.auth.provider.terms.prefix")," "),o(2),h("href",e.googleTermsUrl,Rt),o(2),R(" ",u(31,26,"and")," "),o(2),h("href",e.facebookTermsUrl,Rt),o(2),R(" ",u(35,28,"firebase.auth.provider.terms.suffix")," ")}}function ui(n,t){if(n&1&&L(0,"span"),n&2){let e=t.$implicit,i=l(3);P("active",e<=i.passwordStrengthLevel())}}function pi(n,t){if(n&1&&(a(0,"ul",29),m(1,"i18n"),a(2,"li")(3,"mat-icon"),d(4),r(),a(5,"span"),d(6),m(7,"i18n"),r()(),a(8,"li")(9,"mat-icon"),d(10),r(),a(11,"span"),d(12),m(13,"i18n"),r()(),a(14,"li")(15,"mat-icon"),d(16),r(),a(17,"span"),d(18),m(19,"i18n"),r()(),a(20,"li")(21,"mat-icon"),d(22),r(),a(23,"span"),d(24),m(25,"i18n"),r()(),a(26,"li")(27,"mat-icon"),d(28),r(),a(29,"span"),d(30),m(31,"i18n"),r()()()),n&2){let e=l(3);M("aria-label",u(1,21,"password.rules")),o(2),P("met",e.passwordHasMinimumLength()),o(2),c(e.passwordHasMinimumLength()?"check_circle":"radio_button_unchecked"),o(2),c(u(7,23,"password.minimum.8")),o(2),P("met",e.passwordHasLetter()),o(2),c(e.passwordHasLetter()?"check_circle":"radio_button_unchecked"),o(2),c(u(13,25,"password.letter")),o(2),P("met",e.passwordHasNumber()),o(2),c(e.passwordHasNumber()?"check_circle":"radio_button_unchecked"),o(2),c(u(19,27,"password.number")),o(2),P("met",e.passwordHasOptionalSymbol()),o(2),c(e.passwordHasOptionalSymbol()?"check_circle":"radio_button_unchecked"),o(2),c(u(25,29,"password.symbol.optional")),o(2),P("met",e.passwordConfirmationMatches()),o(2),c(e.passwordConfirmationMatches()?"check_circle":"radio_button_unchecked"),o(2),c(u(31,31,"passwords.match"))}}function bi(n,t){if(n&1){let e=N();a(0,"label")(1,"span"),d(2),m(3,"i18n"),r(),a(4,"span",23)(5,"input",32),rt(),st("ngModelChange",function(i){w(e);let s=l(3);return ct(s.passwordConfirmation,i)||(s.passwordConfirmation=i),_(i)}),r(),a(6,"button",25),m(7,"i18n"),y("click",function(){w(e);let i=l(3);return _(i.togglePasswordConfirmationVisibility())}),a(8,"mat-icon"),d(9),r()()()()}if(n&2){let e=l(3);o(2),c(u(3,7,"confirm.password")),o(3),h("type",e.passwordConfirmationInputType())("disabled",e.busy),lt("ngModel",e.passwordConfirmation),dt(),o(),h("disabled",e.busy),M("aria-label",u(7,9,e.passwordConfirmationVisible?"hide.password":"show.password")),o(3),c(e.passwordConfirmationVisible?"visibility_off":"visibility")}}function gi(n,t){if(n&1&&(a(0,"p",30),d(1),m(2,"i18n"),r()),n&2){let e=l(3);o(),c(u(2,1,e.emailError))}}function hi(n,t){if(n&1){let e=N();a(0,"button",18),y("click",function(){w(e);let i=l(2);return _(i.backToProviders())}),a(1,"mat-icon"),d(2,"arrow_back"),r(),a(3,"span"),d(4),m(5,"i18n"),r()(),a(6,"form",19),y("submit",function(i){w(e);let s=l(2);return i.preventDefault(),_(s.requestEmail())}),a(7,"div",20),m(8,"i18n"),a(9,"button",21),y("click",function(){w(e);let i=l(2);return _(i.setEmailMode("sign-in"))}),d(10),m(11,"i18n"),r(),a(12,"button",21),y("click",function(){w(e);let i=l(2);return _(i.setEmailMode("create"))}),d(13),m(14,"i18n"),r()(),a(15,"label")(16,"span"),d(17),m(18,"i18n"),r(),a(19,"input",22),rt(),st("ngModelChange",function(i){w(e);let s=l(2);return ct(s.email,i)||(s.email=i),_(i)}),r()(),a(20,"label")(21,"span"),d(22),m(23,"i18n"),r(),a(24,"span",23)(25,"input",24),m(26,"i18n"),rt(),st("ngModelChange",function(i){w(e);let s=l(2);return ct(s.password,i)||(s.password=i),_(i)}),r(),a(27,"button",25),m(28,"i18n"),y("click",function(){w(e);let i=l(2);return _(i.togglePasswordVisibility())}),a(29,"mat-icon"),d(30),r()()()(),a(31,"div",26),m(32,"i18n"),a(33,"div",27),U(34,ui,1,2,"span",28,at),r(),a(36,"span"),d(37),m(38,"i18n"),r()(),b(39,pi,32,33,"ul",29),b(40,bi,10,11,"label"),b(41,gi,3,3,"p",30),a(42,"button",31)(43,"mat-icon"),d(44,"mail"),r(),a(45,"span"),d(46),m(47,"i18n"),r()()()}if(n&2){let e=l(2);h("disabled",e.busy),o(4),c(u(5,41,"all.login.methods")),o(3),M("aria-label",u(8,43,"email.login.mode")),o(2),P("active",e.emailMode==="sign-in"),h("disabled",e.busy),M("aria-selected",e.emailMode==="sign-in"),o(),R(" ",u(11,45,"login")," "),o(2),P("active",e.emailMode==="create"),h("disabled",e.busy),M("aria-selected",e.emailMode==="create"),o(),R(" ",u(14,47,"create")," "),o(4),c(u(18,49,"email")),o(2),h("disabled",e.busy),lt("ngModel",e.email),dt(),o(3),c(u(23,51,"password")),o(3),h("type",e.passwordInputType())("autocomplete",e.emailPasswordAutocomplete())("placeholder",u(26,53,e.passwordPlaceholder()))("disabled",e.busy),lt("ngModel",e.password),dt(),o(2),h("disabled",e.busy),M("aria-label",u(28,55,e.passwordVisible?"hide.password":"show.password")),o(3),c(e.passwordVisible?"visibility_off":"visibility"),o(),P("level-1",e.passwordStrengthLevel()===1)("level-2",e.passwordStrengthLevel()===2)("level-3",e.passwordStrengthLevel()===3)("level-4",e.passwordStrengthLevel()===4),M("aria-label",u(32,57,e.passwordStrengthText())),o(3),E(e.passwordStrengthSegments()),o(3),c(u(38,59,e.passwordStrengthText())),o(2),g(e.emailMode==="create"?39:-1),o(),g(e.emailMode==="create"?40:-1),o(),g(e.emailError?41:-1),o(),h("disabled",e.busy)("matRippleColor","rgba(255, 255, 255, 0.22)"),o(4),c(u(47,61,e.emailSubmitLabel()))}}function fi(n,t){if(n&1){let e=N();a(0,"section",0)(1,"div",1),y("click",function(){w(e);let i=l();return _(i.requestClose())}),r(),a(2,"div",2),y("click",function(i){return i.stopPropagation()}),a(3,"div",3)(4,"h2"),d(5),m(6,"i18n"),r(),a(7,"button",4),m(8,"i18n"),y("click",function(){w(e);let i=l();return _(i.requestClose())}),a(9,"mat-icon",5),d(10,"close"),r()()(),b(11,ci,3,3,"p",6),b(12,mi,36,30,"div",7)(13,hi,48,63),r()()}if(n&2){let e=l();o(2),P("mobile-fullscreen",e.isMobileView),o(3),c(u(6,7,"login")),o(2),h("matRippleColor","rgba(41, 78, 128, 0.12)"),M("aria-label",u(8,9,"close.login.popup")),o(4),g(e.statusMessage?11:-1),o(),g(e.authStep==="providers"?12:13)}}var vi=class wt{open=!1;busy=!1;isMobileView=!1;statusMessage="";closeRequested=new T;authRequested=new T;authStep="providers";emailMode="sign-in";email="";password="";passwordConfirmation="";passwordVisible=!1;passwordConfirmationVisible=!1;emailError="";googleTermsUrl="https://policies.google.com/terms";facebookTermsUrl="https://www.facebook.com/legal/terms";requestClose(){this.closeRequested.emit()}requestProvider(t){this.emailError="",this.authRequested.emit({provider:t})}openEmail(){this.busy||(this.authStep="email",this.emailMode="sign-in",this.emailError="")}backToProviders(){this.busy||(this.authStep="providers",this.emailError="")}togglePasswordVisibility(){this.passwordVisible=!this.passwordVisible}togglePasswordConfirmationVisibility(){this.passwordConfirmationVisible=!this.passwordConfirmationVisible}setEmailMode(t){this.busy||(this.emailMode=t,this.emailError="",t==="sign-in"&&(this.passwordConfirmation=""))}requestEmail(){if(this.busy)return;let t=this.email.trim();if(!this.isValidEmail(t)){this.emailError="firebase.auth.error.email.invalid";return}if(this.emailMode==="sign-in"&&this.password.length<6){this.emailError="firebase.auth.error.password.minimum";return}if(this.emailMode==="create"&&!this.isCreatePasswordValid()){this.emailError="firebase.auth.error.password.rules";return}if(this.emailMode==="create"&&this.password!==this.passwordConfirmation){this.emailError="firebase.auth.error.password.mismatch";return}this.emailError="",this.authRequested.emit({provider:"email",emailMode:this.emailMode,email:t,password:this.password})}emailSubmitLabel(){return this.busy?"connecting":this.emailMode==="create"?"create.account":"login"}emailPasswordAutocomplete(){return this.emailMode==="create"?"new-password":"current-password"}passwordPlaceholder(){return this.emailMode==="create"?"firebase.auth.password.create.placeholder":"password"}passwordInputType(){return this.passwordVisible?"text":"password"}passwordConfirmationInputType(){return this.passwordConfirmationVisible?"text":"password"}passwordStrengthLevel(){let t=this.password;if(!t)return 0;let e=[t.length>=8,t.length>=12,/[a-z]/.test(t)&&/[A-Z]/.test(t),/\d/.test(t),/[^A-Za-z0-9]/.test(t)];return Math.min(4,Math.max(1,e.filter(Boolean).length))}passwordStrengthSegments(){return[1,2,3,4]}passwordStrengthText(){switch(this.passwordStrengthLevel()){case 1:return"password.strength.weak";case 2:return"password.strength.basic";case 3:return"good";case 4:return"password.strength.strong";default:return"password.strength"}}passwordHasMinimumLength(){return this.password.length>=8}passwordHasLetter(){return this.hasTextLetter(this.password)}passwordHasNumber(){return/\d/.test(this.password)}passwordHasOptionalSymbol(){return Array.from(this.password).some(t=>!this.isTextLetter(t)&&!/\d/.test(t))}passwordConfirmationMatches(){return this.password.length>0&&this.password===this.passwordConfirmation}isCreatePasswordValid(){return this.passwordHasMinimumLength()&&this.passwordHasLetter()&&this.passwordHasNumber()}hasTextLetter(t){return Array.from(t).some(e=>this.isTextLetter(e))}isTextLetter(t){return t.toLocaleLowerCase("en-US")!==t.toLocaleUpperCase("en-US")}isValidEmail(t){return $.isEmail(t)}static \u0275fac=function(t){return new(t||wt)};static \u0275cmp=I({type:wt,selectors:[["app-entry-firebase-auth-popup"]],inputs:{open:"open",busy:"busy",isMobileView:"isMobileView",statusMessage:"statusMessage"},outputs:{closeRequested:"closeRequested",authRequested:"authRequested"},decls:1,vars:1,consts:[[1,"firebase-auth-overlay"],[1,"firebase-auth-backdrop",3,"click"],["appLandingGuideSurface","landing.auth",1,"firebase-auth-panel",3,"click"],[1,"firebase-auth-header"],["type","button","matRipple","",1,"popup-close",3,"click","matRippleColor"],["aria-hidden","true"],["role","status",1,"firebase-auth-status"],["data-guide-field","providers",1,"firebase-auth-provider-list"],["type","button","matRipple","",1,"firebase-auth-provider-btn","google",3,"click","disabled","matRippleColor"],["aria-hidden","true",1,"firebase-auth-brand-mark","google-mark"],[1,"google-mark-letter"],["type","button","disabled","","aria-disabled","true",1,"firebase-auth-provider-btn","facebook","coming-soon"],["aria-hidden","true",1,"firebase-auth-brand-mark","facebook-mark"],[1,"firebase-auth-provider-badge"],["type","button","matRipple","",1,"firebase-auth-provider-btn","email",3,"click","disabled","matRippleColor"],["aria-hidden","true",1,"firebase-auth-brand-mark","email-mark"],[1,"firebase-auth-provider-terms"],["target","_blank","rel","noopener noreferrer",3,"href"],["type","button","data-motion","none",1,"firebase-auth-back-btn",3,"click","disabled"],[1,"firebase-auth-email-form",3,"submit"],["data-guide-field","account-mode","role","tablist",1,"firebase-auth-email-tabs"],["type","button","role","tab","data-motion","none",3,"click","disabled"],["type","email","name","email","data-guide-field","email","autocomplete","email",3,"ngModelChange","disabled","ngModel"],[1,"firebase-auth-password-control"],["name","password","data-guide-field","password",3,"ngModelChange","type","autocomplete","placeholder","disabled","ngModel"],["type","button","data-motion","none",1,"firebase-auth-password-toggle",3,"click","disabled"],[1,"firebase-password-strength"],["aria-hidden","true",1,"firebase-password-strength-lines"],[3,"active"],["data-guide-field","password-rules",1,"firebase-password-rules"],[1,"firebase-auth-error"],["type","submit","data-guide-field","submit","matRipple","",1,"firebase-auth-main-btn",3,"disabled","matRippleColor"],["name","passwordConfirmation","data-guide-field","confirmation","autocomplete","new-password",3,"ngModelChange","type","disabled","ngModel"]],template:function(t,e){t&1&&b(0,fi,14,11,"section",0),t&2&&g(e.open?0:-1)},dependencies:[Ut,ze,Ie,Ae,Ue,Ee,qe,Te,mt,Et,V,F,K],styles:['.popup-close[_ngcontent-%COMP%]{flex:0 0 auto;width:34px;height:34px;min-width:34px;min-height:34px;border:1px solid rgba(47,86,139,.2);border-radius:50%;background:#ffffffeb;color:#264369eb;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;padding:0;line-height:0;box-sizing:border-box;box-shadow:0 8px 18px #253e5f1f;--%NS%mdc-icon-button-state-layer-size: 34px}.popup-close[_ngcontent-%COMP%]   .mat-icon[_ngcontent-%COMP%]{display:inline-flex;align-items:center;justify-content:center;width:21px;height:21px;font-size:21px;line-height:21px;margin:0}.popup-close[_ngcontent-%COMP%]:not(:disabled):not([aria-disabled=true]):hover{border-color:#2f568b52;background:#fff;color:#183254fa}.popup-close[_ngcontent-%COMP%]:not(:disabled):not([aria-disabled=true]):active{background:#eff5fcf5}.popup-close[_ngcontent-%COMP%]:focus-visible{outline:2px solid rgba(61,108,186,.35);outline-offset:1px}.popup-close[_ngcontent-%COMP%]:disabled, .popup-close[aria-disabled=true][_ngcontent-%COMP%]{opacity:.56;cursor:default}[_nghost-%COMP%]{display:block;font-family:var(--%NS%entry-font-family, "Nunito Sans", "Segoe UI", sans-serif);--%NS%interactive-hover-lift: 0px;--%NS%interactive-hover-scale: 1;--%NS%interactive-press-scale: 1}.firebase-auth-overlay[_ngcontent-%COMP%]{position:fixed;inset:0;z-index:2850;display:flex;align-items:center;justify-content:center;padding:1rem}.firebase-auth-backdrop[_ngcontent-%COMP%]{position:absolute;inset:0;background:#0b1527b8}.firebase-auth-panel[_ngcontent-%COMP%]{position:relative;z-index:1;width:min(480px,100vw - 1.2rem);border-radius:14px;background:#fff;padding:.88rem;display:flex;flex-direction:column;gap:.7rem}.firebase-auth-panel[_ngcontent-%COMP%], .firebase-auth-panel[_ngcontent-%COMP%]   *[_ngcontent-%COMP%]{box-sizing:border-box}.firebase-auth-header[_ngcontent-%COMP%]{display:flex;align-items:center;justify-content:space-between;gap:.5rem}.firebase-auth-header[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%]{margin:0;font-size:1.12rem;color:var(--%NS%entry-text-main, #22324a)}.firebase-auth-provider-list[_ngcontent-%COMP%]{display:flex;flex-direction:column;gap:.55rem}.firebase-auth-provider-btn[_ngcontent-%COMP%]{width:100%;min-height:44px;border:1px solid rgba(44,74,121,.18);border-radius:8px;background:#fff;color:#203454f5;font-size:.88rem;font-weight:800;display:inline-flex;align-items:center;justify-content:flex-start;gap:.62rem;padding:0 .78rem;cursor:pointer}.firebase-auth-provider-btn.google[_ngcontent-%COMP%]{border-color:#4285f457;background:#fff;color:#26374f}.firebase-auth-provider-btn.facebook[_ngcontent-%COMP%]{background:#1877f2;border-color:#1877f2;color:#fff}.firebase-auth-provider-btn.email[_ngcontent-%COMP%]{background:#f4f7fb;color:#27364d}.firebase-auth-provider-btn.coming-soon[_ngcontent-%COMP%]{background:#1877f21f;border-color:#1877f238;color:#1c457ec7;cursor:not-allowed}.firebase-auth-provider-btn[_ngcontent-%COMP%]:disabled, .firebase-auth-email-form[_ngcontent-%COMP%]   input[_ngcontent-%COMP%]:disabled{opacity:.68;cursor:default}.firebase-auth-provider-btn.coming-soon[_ngcontent-%COMP%]:disabled{opacity:1;cursor:not-allowed}.firebase-auth-brand-mark[_ngcontent-%COMP%]{flex:0 0 auto;width:24px;height:24px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:.95rem;font-weight:900;line-height:1}.google-mark[_ngcontent-%COMP%]{position:relative;overflow:hidden;background:conic-gradient(#4285f4 0 25%,#34a853 0 50%,#fbbc05 0 75%,#ea4335 0 100%);border:0;color:#4285f4}.google-mark[_ngcontent-%COMP%]:before{content:"";position:absolute;inset:3px;border-radius:inherit;background:#fff}.google-mark-letter[_ngcontent-%COMP%]{position:relative;z-index:1;font-size:.92rem;font-weight:950}.facebook-mark[_ngcontent-%COMP%]{background:#1877f2;color:#fff;font-family:Arial,sans-serif;font-size:1.2rem}.email-mark[_ngcontent-%COMP%]{background:#e5ebf4;color:#33445e}.email-mark[_ngcontent-%COMP%]   .mat-icon[_ngcontent-%COMP%]{width:16px;height:16px;font-size:16px;line-height:16px}.firebase-auth-provider-badge[_ngcontent-%COMP%]{margin-left:auto;border-radius:999px;background:#ffffffb8;color:#174888e0;padding:.15rem .42rem;font-size:.66rem;font-weight:900;line-height:1;white-space:nowrap}.firebase-auth-provider-terms[_ngcontent-%COMP%]{margin:.12rem 0 0;color:#36435aad;font-size:.72rem;font-weight:750;line-height:1.35}.firebase-auth-provider-terms[_ngcontent-%COMP%]   a[_ngcontent-%COMP%]{color:#1c56a8f5;font-weight:900;text-decoration:none}.firebase-auth-provider-terms[_ngcontent-%COMP%]   a[_ngcontent-%COMP%]:hover{text-decoration:underline}.firebase-auth-divider[_ngcontent-%COMP%]{min-height:1px;display:flex;align-items:center;gap:.55rem;color:#22324a99;font-size:.74rem;font-weight:800;text-transform:uppercase}.firebase-auth-divider[_ngcontent-%COMP%]:before, .firebase-auth-divider[_ngcontent-%COMP%]:after{content:"";flex:1 1 0;height:1px;background:#2c4a7929}.firebase-auth-back-btn[_ngcontent-%COMP%]{align-self:flex-start;min-height:30px;border:0;background:transparent;color:#274979e0;font:inherit;font-size:.8rem;font-weight:800;display:inline-flex;align-items:center;gap:.24rem;cursor:pointer;padding:0}.firebase-auth-back-btn[_ngcontent-%COMP%]   .mat-icon[_ngcontent-%COMP%]{width:18px;height:18px;font-size:18px;line-height:18px}.firebase-auth-email-form[_ngcontent-%COMP%]{display:flex;flex-direction:column;gap:.55rem}.firebase-auth-email-tabs[_ngcontent-%COMP%]{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:0;border:1px solid rgba(44,74,121,.18);border-radius:9px;background:#edf3fb;padding:3px}.firebase-auth-email-tabs[_ngcontent-%COMP%]   button[_ngcontent-%COMP%]{min-height:34px;border:0;border-radius:7px;background:transparent;color:#31425dc2;font:inherit;font-size:.82rem;font-weight:850;cursor:pointer}.firebase-auth-email-tabs[_ngcontent-%COMP%]   button.active[_ngcontent-%COMP%]{background:#fff;color:#1c3457fa;box-shadow:0 8px 20px #2548781f}.firebase-auth-email-tabs[_ngcontent-%COMP%]   button[_ngcontent-%COMP%]:disabled{cursor:default;opacity:.7}.firebase-auth-status[_ngcontent-%COMP%]{margin:0;border-radius:8px;background:#eef6ff;color:#1f4e7a;padding:.58rem .66rem;font-size:.78rem;font-weight:800;line-height:1.25}.firebase-auth-email-form[_ngcontent-%COMP%]   label[_ngcontent-%COMP%]{display:flex;flex-direction:column;gap:.28rem;color:#22324ab8;font-size:.74rem;font-weight:800}.firebase-auth-email-form[_ngcontent-%COMP%]   input[_ngcontent-%COMP%]{width:100%;min-height:38px;border-radius:8px;border:1px solid rgba(44,74,121,.22);background:#fff;color:#22324afa;padding:0 .72rem;font:inherit}.firebase-auth-email-form[_ngcontent-%COMP%]   input[_ngcontent-%COMP%]:focus{outline:2px solid rgba(61,108,186,.24);border-color:#3d6cba70}.firebase-auth-password-control[_ngcontent-%COMP%]{position:relative;display:block;width:100%}.firebase-auth-password-control[_ngcontent-%COMP%]   input[_ngcontent-%COMP%]{width:100%;padding-right:2.65rem}.firebase-auth-password-toggle[_ngcontent-%COMP%]{position:absolute;right:.32rem;top:50%;width:32px;height:32px;transform:translateY(-50%);border:0;border-radius:999px;background:transparent;color:#263d5eb8;display:inline-flex;align-items:center;justify-content:center;cursor:pointer}.firebase-auth-password-toggle[_ngcontent-%COMP%]:hover{background:#2c4a7914;color:#1d3456f5;transform:translateY(-50%)}.firebase-auth-password-toggle[_ngcontent-%COMP%]:active, .firebase-auth-password-toggle[_ngcontent-%COMP%]:focus{transform:translateY(-50%)}.firebase-auth-password-toggle[_ngcontent-%COMP%]:disabled{cursor:default;opacity:.7}.firebase-auth-password-toggle[_ngcontent-%COMP%]   .mat-icon[_ngcontent-%COMP%]{width:18px;height:18px;font-size:18px;line-height:18px}.firebase-password-strength[_ngcontent-%COMP%]{display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:.55rem;margin-top:-.28rem;color:#3d4b639e;font-size:.68rem;font-weight:850}.firebase-password-strength-lines[_ngcontent-%COMP%]{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:.28rem}.firebase-password-strength-lines[_ngcontent-%COMP%]   span[_ngcontent-%COMP%]{height:4px;border-radius:999px;background:#2c4a7929}.firebase-password-strength-lines[_ngcontent-%COMP%]   span.active[_ngcontent-%COMP%]{background:#9aa7b8}.firebase-password-strength.level-1[_ngcontent-%COMP%]{color:#a43b45}.firebase-password-strength.level-1[_ngcontent-%COMP%]   .firebase-password-strength-lines[_ngcontent-%COMP%]   span.active[_ngcontent-%COMP%]{background:#d94d5a}.firebase-password-strength.level-2[_ngcontent-%COMP%]{color:#9a641b}.firebase-password-strength.level-2[_ngcontent-%COMP%]   .firebase-password-strength-lines[_ngcontent-%COMP%]   span.active[_ngcontent-%COMP%]{background:#e39b30}.firebase-password-strength.level-3[_ngcontent-%COMP%]{color:#286f80}.firebase-password-strength.level-3[_ngcontent-%COMP%]   .firebase-password-strength-lines[_ngcontent-%COMP%]   span.active[_ngcontent-%COMP%]{background:#42a9bd}.firebase-password-strength.level-4[_ngcontent-%COMP%]{color:#22744d}.firebase-password-strength.level-4[_ngcontent-%COMP%]   .firebase-password-strength-lines[_ngcontent-%COMP%]   span.active[_ngcontent-%COMP%]{background:#31a66a}.firebase-password-rules[_ngcontent-%COMP%]{display:flex;flex-wrap:wrap;gap:.34rem;margin:-.1rem 0 0;padding:0;list-style:none}.firebase-password-rules[_ngcontent-%COMP%]   li[_ngcontent-%COMP%]{min-height:24px;border-radius:999px;background:#2c4a7912;color:#31425db3;display:inline-flex;align-items:center;gap:.24rem;padding:0 .48rem 0 .34rem;font-size:.68rem;font-weight:850}.firebase-password-rules[_ngcontent-%COMP%]   li.met[_ngcontent-%COMP%]{background:#31a66a1f;color:#22744d}.firebase-password-rules[_ngcontent-%COMP%]   .mat-icon[_ngcontent-%COMP%]{width:14px;height:14px;font-size:14px;line-height:14px}.firebase-auth-error[_ngcontent-%COMP%]{margin:0;color:#9f2f35;font-size:.76rem;font-weight:700}.firebase-auth-main-btn[_ngcontent-%COMP%]{position:relative;overflow:hidden;min-height:42px;border:1px solid rgba(34,96,176,.42);border-radius:12px;background:linear-gradient(180deg,#4f8fdf,#3e79c4);color:#fff;font-size:.88rem;font-weight:700;display:inline-flex;align-items:center;justify-content:center;gap:.4rem;cursor:pointer}.firebase-auth-main-btn[_ngcontent-%COMP%]:disabled{opacity:.76;cursor:default}.firebase-auth-main-btn[_ngcontent-%COMP%]   .mat-icon[_ngcontent-%COMP%]{width:18px;height:18px;font-size:18px;line-height:18px}.firebase-auth-main-btn[_ngcontent-%COMP%]   .mat-icon[_ngcontent-%COMP%], .firebase-auth-main-btn[_ngcontent-%COMP%]   span[_ngcontent-%COMP%]{position:relative;z-index:1}@media(max-width:760px){.firebase-auth-overlay[_ngcontent-%COMP%]{padding:0}.firebase-auth-panel.mobile-fullscreen[_ngcontent-%COMP%]{width:100vw;height:100%;max-height:100%;overflow-y:auto;max-width:100vw;border-radius:0;padding:max(.52rem,env(safe-area-inset-top,0px)) .9rem 1rem}}'],changeDetection:1})},xi=Object.freeze({__proto__:null,EntryFirebaseAuthPopupComponent:vi}),yi=Object.freeze({__proto__:null,ProfileEditorStore:bt});export{Ft as F,De as G,X as R,vn as a,li as b,pt as c,di as d,Qn as e,Wn as f,yi as g,xn as h,Ve as i,xi as j,Bt as m,gt as o,jt as s,bt as v};
