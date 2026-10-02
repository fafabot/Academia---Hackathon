var He=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};function Ee(o){return o&&o.__esModule&&Object.prototype.hasOwnProperty.call(o,"default")?o.default:o}var B={exports:{}},r={};/**
 * @license React
 * react.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var X;function Le(){if(X)return r;X=1;var o=Symbol.for("react.element"),n=Symbol.for("react.portal"),p=Symbol.for("react.fragment"),s=Symbol.for("react.strict_mode"),g=Symbol.for("react.profiler"),$=Symbol.for("react.provider"),M=Symbol.for("react.context"),C=Symbol.for("react.forward_ref"),v=Symbol.for("react.suspense"),j=Symbol.for("react.memo"),E=Symbol.for("react.lazy"),R=Symbol.iterator;function A(e){return e===null||typeof e!="object"?null:(e=R&&e[R]||e["@@iterator"],typeof e=="function"?e:null)}var x={isMounted:function(){return!1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},y=Object.assign,w={};function m(e,t,c){this.props=e,this.context=t,this.refs=w,this.updater=c||x}m.prototype.isReactComponent={},m.prototype.setState=function(e,t){if(typeof e!="object"&&typeof e!="function"&&e!=null)throw Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");this.updater.enqueueSetState(this,e,t,"setState")},m.prototype.forceUpdate=function(e){this.updater.enqueueForceUpdate(this,e,"forceUpdate")};function S(){}S.prototype=m.prototype;function b(e,t,c){this.props=e,this.context=t,this.refs=w,this.updater=c||x}var L=b.prototype=new S;L.constructor=b,y(L,m.prototype),L.isPureReactComponent=!0;var P=Array.isArray,N=Object.prototype.hasOwnProperty,q={current:null},I={key:!0,ref:!0,__self:!0,__source:!0};function O(e,t,c){var u,i={},d=null,h=null;if(t!=null)for(u in t.ref!==void 0&&(h=t.ref),t.key!==void 0&&(d=""+t.key),t)N.call(t,u)&&!I.hasOwnProperty(u)&&(i[u]=t[u]);var f=arguments.length-2;if(f===1)i.children=c;else if(1<f){for(var l=Array(f),_=0;_<f;_++)l[_]=arguments[_+2];i.children=l}if(e&&e.defaultProps)for(u in f=e.defaultProps,f)i[u]===void 0&&(i[u]=f[u]);return{$$typeof:o,type:e,key:d,ref:h,props:i,_owner:q.current}}function De(e,t){return{$$typeof:o,type:e.type,key:t,ref:e.ref,props:e.props,_owner:e._owner}}function U(e){return typeof e=="object"&&e!==null&&e.$$typeof===o}function je(e){var t={"=":"=0",":":"=2"};return"$"+e.replace(/[=:]/g,function(c){return t[c]})}var G=/\/+/g;function F(e,t){return typeof e=="object"&&e!==null&&e.key!=null?je(""+e.key):t.toString(36)}function V(e,t,c,u,i){var d=typeof e;(d==="undefined"||d==="boolean")&&(e=null);var h=!1;if(e===null)h=!0;else switch(d){case"string":case"number":h=!0;break;case"object":switch(e.$$typeof){case o:case n:h=!0}}if(h)return h=e,i=i(h),e=u===""?"."+F(h,0):u,P(i)?(c="",e!=null&&(c=e.replace(G,"$&/")+"/"),V(i,t,c,"",function(_){return _})):i!=null&&(U(i)&&(i=De(i,c+(!i.key||h&&h.key===i.key?"":(""+i.key).replace(G,"$&/")+"/")+e)),t.push(i)),1;if(h=0,u=u===""?".":u+":",P(e))for(var f=0;f<e.length;f++){d=e[f];var l=u+F(d,f);h+=V(d,t,c,l,i)}else if(l=A(e),typeof l=="function")for(e=l.call(e),f=0;!(d=e.next()).done;)d=d.value,l=u+F(d,f++),h+=V(d,t,c,l,i);else if(d==="object")throw t=String(e),Error("Objects are not valid as a React child (found: "+(t==="[object Object]"?"object with keys {"+Object.keys(e).join(", ")+"}":t)+"). If you meant to render a collection of children, use an array instead.");return h}function T(e,t,c){if(e==null)return e;var u=[],i=0;return V(e,u,"","",function(d){return t.call(c,d,i++)}),u}function Re(e){if(e._status===-1){var t=e._result;t=t(),t.then(function(c){(e._status===0||e._status===-1)&&(e._status=1,e._result=c)},function(c){(e._status===0||e._status===-1)&&(e._status=2,e._result=c)}),e._status===-1&&(e._status=0,e._result=t)}if(e._status===1)return e._result.default;throw e._result}var k={current:null},W={transition:null},Ae={ReactCurrentDispatcher:k,ReactCurrentBatchConfig:W,ReactCurrentOwner:q};function K(){throw Error("act(...) is not supported in production builds of React.")}return r.Children={map:T,forEach:function(e,t,c){T(e,function(){t.apply(this,arguments)},c)},count:function(e){var t=0;return T(e,function(){t++}),t},toArray:function(e){return T(e,function(t){return t})||[]},only:function(e){if(!U(e))throw Error("React.Children.only expected to receive a single React element child.");return e}},r.Component=m,r.Fragment=p,r.Profiler=g,r.PureComponent=b,r.StrictMode=s,r.Suspense=v,r.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED=Ae,r.act=K,r.cloneElement=function(e,t,c){if(e==null)throw Error("React.cloneElement(...): The argument must be a React element, but you passed "+e+".");var u=y({},e.props),i=e.key,d=e.ref,h=e._owner;if(t!=null){if(t.ref!==void 0&&(d=t.ref,h=q.current),t.key!==void 0&&(i=""+t.key),e.type&&e.type.defaultProps)var f=e.type.defaultProps;for(l in t)N.call(t,l)&&!I.hasOwnProperty(l)&&(u[l]=t[l]===void 0&&f!==void 0?f[l]:t[l])}var l=arguments.length-2;if(l===1)u.children=c;else if(1<l){f=Array(l);for(var _=0;_<l;_++)f[_]=arguments[_+2];u.children=f}return{$$typeof:o,type:e.type,key:i,ref:d,props:u,_owner:h}},r.createContext=function(e){return e={$$typeof:M,_currentValue:e,_currentValue2:e,_threadCount:0,Provider:null,Consumer:null,_defaultValue:null,_globalName:null},e.Provider={$$typeof:$,_context:e},e.Consumer=e},r.createElement=O,r.createFactory=function(e){var t=O.bind(null,e);return t.type=e,t},r.createRef=function(){return{current:null}},r.forwardRef=function(e){return{$$typeof:C,render:e}},r.isValidElement=U,r.lazy=function(e){return{$$typeof:E,_payload:{_status:-1,_result:e},_init:Re}},r.memo=function(e,t){return{$$typeof:j,type:e,compare:t===void 0?null:t}},r.startTransition=function(e){var t=W.transition;W.transition={};try{e()}finally{W.transition=t}},r.unstable_act=K,r.useCallback=function(e,t){return k.current.useCallback(e,t)},r.useContext=function(e){return k.current.useContext(e)},r.useDebugValue=function(){},r.useDeferredValue=function(e){return k.current.useDeferredValue(e)},r.useEffect=function(e,t){return k.current.useEffect(e,t)},r.useId=function(){return k.current.useId()},r.useImperativeHandle=function(e,t,c){return k.current.useImperativeHandle(e,t,c)},r.useInsertionEffect=function(e,t){return k.current.useInsertionEffect(e,t)},r.useLayoutEffect=function(e,t){return k.current.useLayoutEffect(e,t)},r.useMemo=function(e,t){return k.current.useMemo(e,t)},r.useReducer=function(e,t,c){return k.current.useReducer(e,t,c)},r.useRef=function(e){return k.current.useRef(e)},r.useState=function(e){return k.current.useState(e)},r.useSyncExternalStore=function(e,t,c){return k.current.useSyncExternalStore(e,t,c)},r.useTransition=function(){return k.current.useTransition()},r.version="18.3.1",r}var J;function qe(){return J||(J=1,B.exports=Le()),B.exports}var z=qe();const Ze=Ee(z);/**
 * @license lucide-react v1.50.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Pe=o=>o==null?void 0:o.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase();/**
 * @license lucide-react v1.50.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */function Ne(o,n,p=[]){if(n==null)throw new Error("[lucide]: iconNode is required when icon name is used");return{name:Pe(o),size:24,node:n,...p.length>0?{aliases:p}:{}}}/**
 * @license lucide-react v1.50.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ie=o=>{let n="",p=!1;for(const s of o){if(s==="-"||s==="_"||s<=" "){p=n.length>0;continue}n.length===0?n+=s.toLowerCase():n+=p?s.toUpperCase():s,p=!1}return n};/**
 * @license lucide-react v1.50.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Oe=o=>{const n=Ie(o);return n.charAt(0).toUpperCase()+n.slice(1)};/**
 * @license lucide-react v1.50.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Z=(...o)=>o.filter((n,p,s)=>!!n&&n.trim()!==""&&s.indexOf(n)===p).join(" ").trim();/**
 * @license lucide-react v1.50.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const D={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor","stroke-width":2,"stroke-linecap":"round","stroke-linejoin":"round"};/**
 * @license lucide-react v1.50.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */function H(o){return o!=null}function Ve(o,n={}){var A,x;const p=n.attributeNames??{},s=y=>p[y]??y,g=o.size??o.width??D.width,$=o.size??o.height??D.height,M=((A=o.aliases)==null?void 0:A.filter(y=>typeof y=="string"&&y.trim()!=="").map(y=>`lucide-${y}`))??[],C=[...o.name?[`lucide-${o.name}`]:[],...M],v=((x=n.className)==null?void 0:x.split(" ").filter(Boolean))??[],j=n.includeDefaultClasses===!1?Z(...v):Z("lucide",...C,...v),E=n.absoluteStrokeWidth?Number(n.strokeWidth??D["stroke-width"])*Number(o.size??o.width??D.width)/Number(n.size??n.width??D.width):n.strokeWidth??D["stroke-width"];return["svg",{...Object.entries(D).reduce((y,[w,m])=>(y[s(w)]=m,y),{}),..."color"in n&&n.color&&{[s("stroke")]:n.color},..."size"in n&&H(n.size)&&{[s("width")]:n.size,[s("height")]:n.size},..."width"in n&&H(n.width)&&{[s("width")]:n.width},..."height"in n&&H(n.height)&&{[s("height")]:n.height},[s("stroke-width")]:E,...j&&{[s("class")]:j},[s("viewBox")]:`0 0 ${g} ${$}`,...n.hasA11yProp===!1?{[s("aria-hidden")]:"true"}:{},..."attributes"in n&&n.attributes},o.node.map(y=>{const[w,m,S]=y,b=n.nonScalingStroke?{[s("vector-effect")]:"non-scaling-stroke",...m}:m;return S?[w,b,S]:[w,b]})]}/**
 * @license lucide-react v1.50.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */function Te(o,n={}){return Ve(o,{...n,attributeNames:{...n.attributeNames,class:"className","stroke-width":"strokeWidth","stroke-linecap":"strokeLinecap","stroke-linejoin":"strokeLinejoin","vector-effect":"vectorEffect"}})}/**
 * @license lucide-react v1.50.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const We=o=>{for(const n in o)if(n.startsWith("aria-")||n==="role"||n==="title")return!0;return!1},Ue=z.createContext({}),Fe=()=>z.useContext(Ue),Be=z.forwardRef(({color:o,size:n,width:p,height:s,strokeWidth:g,absoluteStrokeWidth:$,nonScalingStroke:M,className:C="",children:v,iconNode:j=[],icon:E={node:j,aliases:[],size:24},...R},A)=>{const{size:x=24,strokeWidth:y=2,absoluteStrokeWidth:w=!1,nonScalingStroke:m=!1,color:S="currentColor",className:b=""}=Fe()??{},L=!!v||We(R),[P,N,q=[]]=Te(E,{color:o??S,width:p??n??x,height:s??n??x,strokeWidth:g??y,absoluteStrokeWidth:$??w,nonScalingStroke:M??m,className:Z(b,C),hasA11yProp:L,attributes:R});return z.createElement(P,{ref:A,...N},[...q.map(([I,O])=>z.createElement(I,O)),...Array.isArray(v)?v:[v]])});/**
 * @license lucide-react v1.50.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */function a(o,n=[],p=[]){const s=typeof o=="string"?Ne(o,n,p):o,g=z.forwardRef(({className:$,...M},C)=>z.createElement(Be,{ref:C,icon:s,className:$,...M}));return s.name&&(g.displayName=Oe(s.name)),g}/**
 * @license lucide-react v1.50.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Q={name:"activity",size:24,node:[["path",{d:"M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2",key:"169zse"}]]};Q.node;const Ge=a(Q);/**
 * @license lucide-react v1.50.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Y={name:"apple",size:24,node:[["path",{d:"M12 6.528V3a1 1 0 0 1 1-1h0",key:"11qiee"}],["path",{d:"M18.237 21A15 15 0 0 0 22 11a6 6 0 0 0-10-4.472A6 6 0 0 0 2 11a15.1 15.1 0 0 0 3.763 10 3 3 0 0 0 3.648.648 5.5 5.5 0 0 1 5.178 0A3 3 0 0 0 18.237 21",key:"110c12"}]]};Y.node;const Ke=a(Y);/**
 * @license lucide-react v1.50.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ee={name:"arrow-right",size:24,node:[["path",{d:"M5 12h14",key:"1ays0h"}],["path",{d:"m12 5 7 7-7 7",key:"xquz4c"}]]};ee.node;const Xe=a(ee);/**
 * @license lucide-react v1.50.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const te={name:"award",size:24,node:[["path",{d:"m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526",key:"1yiouv"}],["circle",{cx:"12",cy:"8",r:"6",key:"1vp47v"}]]};te.node;const Je=a(te);/**
 * @license lucide-react v1.50.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ne={name:"calendar",size:24,node:[["path",{d:"M8 2v3",key:"1ioesn"}],["path",{d:"M16 2v3",key:"otl347"}],["rect",{x:"3",y:"3",width:"18",height:"18",rx:"2",key:"h1oib"}],["path",{d:"M3 9h18",key:"1pudct"}]]};ne.node;const Qe=a(ne);/**
 * @license lucide-react v1.50.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const oe={name:"chart-pie",size:24,node:[["path",{d:"M21 12c.552 0 1.005-.449.95-.998a10 10 0 0 0-8.953-8.951c-.55-.055-.998.398-.998.95v8a1 1 0 0 0 1 1z",key:"pzmjnu"}],["path",{d:"M21.21 15.89A10 10 0 1 1 8 2.83",key:"k2fpak"}]],aliases:["pie-chart"]};oe.node;const Ye=a(oe);/**
 * @license lucide-react v1.50.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const re={name:"check",size:24,node:[["path",{d:"M20 6 9 17l-5-5",key:"1gmf2c"}]]};re.node;const et=a(re);/**
 * @license lucide-react v1.50.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ae={name:"circle-alert",size:24,node:[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["line",{x1:"12",x2:"12",y1:"8",y2:"12",key:"1pkeuh"}],["line",{x1:"12",x2:"12.01",y1:"16",y2:"16",key:"4dfq90"}]],aliases:["alert-circle"]};ae.node;const tt=a(ae);/**
 * @license lucide-react v1.50.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ce={name:"circle-check",size:24,node:[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"m16 9-5.5 5.5L8 12",key:"xofnsj"}]],aliases:["check-circle-2"]};ce.node;const nt=a(ce);/**
 * @license lucide-react v1.50.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const se={name:"clock",size:24,node:[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"M12 6v6l4 2",key:"mmk7yg"}]]};se.node;const ot=a(se);/**
 * @license lucide-react v1.50.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ie={name:"dumbbell",size:24,node:[["path",{d:"M17.596 12.768a2 2 0 1 0 2.829-2.829l-1.768-1.767a2 2 0 0 0 2.828-2.829l-2.828-2.828a2 2 0 0 0-2.829 2.828l-1.767-1.768a2 2 0 1 0-2.829 2.829z",key:"9m4mmf"}],["path",{d:"m2.5 21.5 1.4-1.4",key:"17g3f0"}],["path",{d:"m20.1 3.9 1.4-1.4",key:"1qn309"}],["path",{d:"M5.343 21.485a2 2 0 1 0 2.829-2.828l1.767 1.768a2 2 0 1 0 2.829-2.829l-6.364-6.364a2 2 0 1 0-2.829 2.829l1.768 1.767a2 2 0 0 0-2.828 2.829z",key:"1t2c92"}],["path",{d:"m9.6 14.4 4.8-4.8",key:"6umqxw"}]]};ie.node;const rt=a(ie);/**
 * @license lucide-react v1.50.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ue={name:"flame",size:24,node:[["path",{d:"M12 3q1 4 4 6.5t3 5.5a1 1 0 0 1-14 0 5 5 0 0 1 1-3 1 1 0 0 0 5 0c0-2-1.5-3-1.5-5q0-2 2.5-4",key:"1slcih"}]]};ue.node;const at=a(ue);/**
 * @license lucide-react v1.50.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const le={name:"layers",size:24,node:[["path",{d:"M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z",key:"zw3jo"}],["path",{d:"M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12",key:"1wduqc"}],["path",{d:"M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17",key:"kqbvx6"}]],aliases:["layers-3"]};le.node;const ct=a(le);/**
 * @license lucide-react v1.50.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const de={name:"lock",size:24,node:[["rect",{width:"18",height:"11",x:"3",y:"11",rx:"2",ry:"2",key:"1w4ew1"}],["path",{d:"M7 11V7a5 5 0 0 1 10 0v4",key:"fwvmzm"}]]};de.node;const st=a(de);/**
 * @license lucide-react v1.50.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const fe={name:"log-out",size:24,node:[["path",{d:"m16 17 5-5-5-5",key:"1bji2h"}],["path",{d:"M21 12H9",key:"dn1m92"}],["path",{d:"M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4",key:"1uf3rs"}]]};fe.node;const it=a(fe);/**
 * @license lucide-react v1.50.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const he={name:"mail",size:24,node:[["path",{d:"m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7",key:"132q7q"}],["rect",{x:"2",y:"4",width:"20",height:"16",rx:"2",key:"izxlao"}]]};he.node;const ut=a(he);/**
 * @license lucide-react v1.50.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ye={name:"menu",size:24,node:[["path",{d:"M4 5h16",key:"1tepv9"}],["path",{d:"M4 12h16",key:"1lakjw"}],["path",{d:"M4 19h16",key:"1djgab"}]]};ye.node;const lt=a(ye);/**
 * @license lucide-react v1.50.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const pe={name:"minus",size:24,node:[["path",{d:"M5 12h14",key:"1ays0h"}]]};pe.node;const dt=a(pe);/**
 * @license lucide-react v1.50.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ke={name:"palette",size:24,node:[["path",{d:"M12 22a1 1 0 0 1 0-20 10 9 0 0 1 10 9 5 5 0 0 1-5 5h-2.25a1.75 1.75 0 0 0-1.4 2.8l.3.4a1.75 1.75 0 0 1-1.4 2.8z",key:"e79jfc"}],["circle",{cx:"13.5",cy:"6.5",r:".5",fill:"currentColor",key:"1okk4w"}],["circle",{cx:"17.5",cy:"10.5",r:".5",fill:"currentColor",key:"f64h9f"}],["circle",{cx:"6.5",cy:"12.5",r:".5",fill:"currentColor",key:"qy21gx"}],["circle",{cx:"8.5",cy:"7.5",r:".5",fill:"currentColor",key:"fotxhn"}]]};ke.node;const ft=a(ke);/**
 * @license lucide-react v1.50.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const me={name:"plus",size:24,node:[["path",{d:"M5 12h14",key:"1ays0h"}],["path",{d:"M12 5v14",key:"s699le"}]]};me.node;const ht=a(me);/**
 * @license lucide-react v1.50.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const _e={name:"ruler",size:24,node:[["path",{d:"M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.41 2.41 0 0 1 0-3.4l2.6-2.6a2.41 2.41 0 0 1 3.4 0Z",key:"icamh8"}],["path",{d:"m14.5 12.5 2-2",key:"inckbg"}],["path",{d:"m11.5 9.5 2-2",key:"fmmyf7"}],["path",{d:"m8.5 6.5 2-2",key:"vc6u1g"}],["path",{d:"m17.5 15.5 2-2",key:"wo5hmg"}]]};_e.node;const yt=a(_e);/**
 * @license lucide-react v1.50.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ve={name:"scale",size:24,node:[["path",{d:"M12 3v18",key:"108xh3"}],["path",{d:"m19 8 3 8a5 5 0 0 1-6 0zV7",key:"zcdpyk"}],["path",{d:"M3 7h1a17 17 0 0 0 8-2 17 17 0 0 0 8 2h1",key:"1yorad"}],["path",{d:"m5 8 3 8a5 5 0 0 1-6 0zV7",key:"eua70x"}],["path",{d:"M7 21h10",key:"1b0cd5"}]]};ve.node;const pt=a(ve);/**
 * @license lucide-react v1.50.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const we={name:"sparkles",size:24,node:[["path",{d:"M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z",key:"1s2grr"}],["path",{d:"M20 2v4",key:"1rf3ol"}],["path",{d:"M22 4h-4",key:"gwowj6"}],["circle",{cx:"4",cy:"20",r:"2",key:"6kqj1y"}]],aliases:["stars"]};we.node;const kt=a(we);/**
 * @license lucide-react v1.50.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ge={name:"target",size:24,node:[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["circle",{cx:"12",cy:"12",r:"6",key:"1vlfrh"}],["circle",{cx:"12",cy:"12",r:"2",key:"1c9p78"}]]};ge.node;const mt=a(ge);/**
 * @license lucide-react v1.50.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const xe={name:"trash",size:24,node:[["path",{d:"M10 11v6",key:"nco0om"}],["path",{d:"M14 11v6",key:"outv1u"}],["path",{d:"M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6",key:"miytrc"}],["path",{d:"M3 6h18",key:"d0wm0j"}],["path",{d:"M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2",key:"e791ji"}]],aliases:["trash-2"]};xe.node;const _t=a(xe);/**
 * @license lucide-react v1.50.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const be={name:"trending-down",size:24,node:[["path",{d:"M16 17h6v-6",key:"t6n2it"}],["path",{d:"m22 17-8.5-8.5-5 5L2 7",key:"x473p"}]]};be.node;const vt=a(be);/**
 * @license lucide-react v1.50.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ze={name:"trending-up",size:24,node:[["path",{d:"M16 7h6v6",key:"box55l"}],["path",{d:"m22 7-8.5 8.5-5-5L2 17",key:"1t1m79"}]]};ze.node;const wt=a(ze);/**
 * @license lucide-react v1.50.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const $e={name:"user",size:24,node:[["path",{d:"M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2",key:"975kel"}],["circle",{cx:"12",cy:"7",r:"4",key:"17ys0d"}]]};$e.node;const gt=a($e);/**
 * @license lucide-react v1.50.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Me={name:"utensils",size:24,node:[["path",{d:"M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2",key:"cjf0a3"}],["path",{d:"M7 2v20",key:"1473qp"}],["path",{d:"M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7",key:"j28e5"}]],aliases:["fork-knife"]};Me.node;const xt=a(Me);/**
 * @license lucide-react v1.50.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ce={name:"x",size:24,node:[["path",{d:"M18 6 6 18",key:"1bl5f8"}],["path",{d:"m6 6 12 12",key:"d8bk6v"}]]};Ce.node;const bt=a(Ce);/**
 * @license lucide-react v1.50.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Se={name:"zap",size:24,node:[["path",{d:"M15.914 4a1.5 1.5 0 00-2.474-1.561l-9 9A1.5 1.5 0 005.5 14h4.002a.5.5 0 01.471.666L8.086 20a1.5 1.5 0 002.475 1.56l9-9A1.5 1.5 0 0018.5 10h-3.997a.5.5 0 01-.472-.667z",key:"1v7up4"}]]};Se.node;const zt=a(Se);export{Xe as A,tt as C,rt as D,at as F,st as L,ut as M,ft as P,Ze as R,kt as S,mt as T,gt as U,bt as X,zt as Z,z as a,nt as b,He as c,pt as d,yt as e,wt as f,Ee as g,Ke as h,it as i,lt as j,ct as k,vt as l,ht as m,_t as n,dt as o,Qe as p,ot as q,qe as r,xt as s,Ye as t,Je as u,Ge as v,et as w};
