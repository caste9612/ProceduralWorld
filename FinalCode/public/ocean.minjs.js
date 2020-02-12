!function(e,n){"object"==typeof exports&&"object"==typeof module?module.exports=n(require("babylonjs")):"function"==typeof define&&define.amd?define("babylonjs-post-process",["babylonjs"],n):"object"==typeof exports?exports["babylonjs-post-process"]=n(require("babylonjs")):e.POSTPROCESSES=n(e.BABYLON)}("undefined"!=typeof self?self:"undefined"!=typeof global?global:this,function(e){return function(e){var n={};function t(r){if(n[r])return n[r].exports;var o=n[r]={i:r,l:!1,exports:{}};return e[r].call(o.exports,o,o.exports,t),o.l=!0,o.exports}return t.m=e,t.c=n,t.d=function(e,n,r){t.o(e,n)||Object.defineProperty(e,n,{enumerable:!0,get:r})},t.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},t.t=function(e,n){if(1&n&&(e=t(e)),8&n)return e;if(4&n&&"object"==typeof e&&e&&e.__esModule)return e;var r=Object.create(null);if(t.r(r),Object.defineProperty(r,"default",{enumerable:!0,value:e}),2&n&&"string"!=typeof e)for(var o in e)t.d(r,o,function(n){return e[n]}.bind(null,o));return r},t.n=function(e){var n=e&&e.__esModule?function(){return e.default}:function(){return e};return t.d(n,"a",n),n},t.o=function(e,n){return Object.prototype.hasOwnProperty.call(e,n)},t.p="",t(t.s=10)}([function(n,t){n.exports=e},function(e,n,t){"use strict";t.d(n,"b",function(){return o}),t.d(n,"a",function(){return i});
/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */
var r=function(e,n){return(r=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(e,n){e.__proto__=n}||function(e,n){for(var t in n)n.hasOwnProperty(t)&&(e[t]=n[t])})(e,n)};function o(e,n){function t(){this.constructor=e}r(e,n),e.prototype=null===n?Object.create(n):(t.prototype=n.prototype,new t)}function i(e,n,t,r){var o,i=arguments.length,a=i<3?n:null===r?r=Object.getOwnPropertyDescriptor(n,t):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(e,n,t,r);else for(var c=e.length-1;c>=0;c--)(o=e[c])&&(a=(i<3?o(a):i>3?o(n,t,a):o(n,t))||a);return i>3&&a&&Object.defineProperty(n,t,a),a}},,function(e,n,t){"use strict";t.r(n);var r=t(1),o=t(0),i="\n\nuniform sampler2D textureSampler;\nuniform sampler2D positionSampler;\n#ifdef REFLECTION_ENABLED\nuniform sampler2D reflectionSampler;\n#endif\n#ifdef REFRACTION_ENABLED\nuniform sampler2D refractionSampler;\n#endif\nuniform float time;\nuniform vec2 resolution;\nuniform vec3 cameraRotation;\nuniform vec3 cameraPosition;\n\nvarying vec2 vUV;\n\nconst int NUM_STEPS=8;\nconst float PI=3.141592;\nconst float EPSILON=1e-3;\n#define EPSILON_NRM (0.1/resolution.x)\n\nconst int ITER_GEOMETRY=8;\nconst int ITER_FRAGMENT=5;\nconst float SEA_HEIGHT=0.6;\nconst float SEA_CHOPPY=4.0;\nconst float SEA_SPEED=0.8;\nconst float SEA_FREQ=0.16;\nconst vec3 SEA_BASE=vec3(0.1,0.19,0.22);\nconst vec3 SEA_WATER_COLOR=vec3(0.8,0.9,0.6);\n#define SEA_TIME (1.0+time*SEA_SPEED)\nconst mat2 octave_m=mat2(1.6,1.2,-1.2,1.6);\n\nmat3 fromEuler(vec3 ang)\n{\nvec2 a1=vec2(sin(ang.x),cos(ang.x));\nvec2 a2=vec2(sin(ang.y),cos(ang.y));\nvec2 a3=vec2(sin(ang.z),cos(ang.z));\nmat3 m;\nm[0]=vec3(a1.y*a3.y+a1.x*a2.x*a3.x,a1.y*a2.x*a3.x+a3.y*a1.x,-a2.y*a3.x);\nm[1]=vec3(-a2.y*a1.x,a1.y*a2.y,a2.x);\nm[2]=vec3(a3.y*a1.x*a2.x+a1.y*a3.x,a1.x*a3.x-a1.y*a3.y*a2.x,a2.y*a3.y);\nreturn m;\n}\nfloat hash( vec2 p )\n{\nfloat h=dot(p,vec2(127.1,311.7));\nreturn fract(sin(h)*43758.5453123);\n}\nfloat noise( in vec2 p )\n{\nvec2 i=floor( p );\nvec2 f=fract( p );\nvec2 u=f*f*(3.0-2.0*f);\nreturn -1.0+2.0*mix( mix( hash( i+vec2(0.0,0.0) ),\nhash( i+vec2(1.0,0.0) ),u.x),\nmix( hash( i+vec2(0.0,1.0) ),\nhash( i+vec2(1.0,1.0) ),u.x),u.y);\n}\n\nfloat diffuse(vec3 n,vec3 l,float p)\n{\nreturn pow(dot(n,l)*0.4+0.6,p);\n}\nfloat specular(vec3 n,vec3 l,vec3 e,float s)\n{\nfloat nrm=(s+8.0)/(PI*8.0);\nreturn pow(max(dot(reflect(e,n),l),0.0),s)*nrm;\n}\n\nfloat sea_octave(vec2 uv,float choppy)\n{\nuv+=noise(uv);\nvec2 wv=1.0-abs(sin(uv));\nvec2 swv=abs(cos(uv));\nwv=mix(wv,swv,wv);\nreturn pow(1.0-pow(wv.x*wv.y,0.65),choppy);\n}\nfloat map(vec3 p)\n{\nfloat freq=SEA_FREQ;\nfloat amp=SEA_HEIGHT;\nfloat choppy=SEA_CHOPPY;\nvec2 uv=p.xz; uv.x*=0.75;\nfloat d,h=0.0;\nfor(int i=0; i<ITER_GEOMETRY; i++)\n{\nd=sea_octave((uv+SEA_TIME)*freq,choppy);\nd+=sea_octave((uv-SEA_TIME)*freq,choppy);\nh+=d*amp;\nuv*=octave_m; freq*=1.9; amp*=0.22;\nchoppy=mix(choppy,1.0,0.2);\n}\nreturn p.y-h;\n}\nfloat map_detailed(vec3 p)\n{\nfloat freq=SEA_FREQ;\nfloat amp=SEA_HEIGHT;\nfloat choppy=SEA_CHOPPY;\nvec2 uv=p.xz; uv.x*=0.75;\nfloat d,h=0.0;\nfor(int i=0; i<ITER_FRAGMENT; i++)\n{\nd=sea_octave((uv+SEA_TIME)*freq,choppy);\nd+=sea_octave((uv-SEA_TIME)*freq,choppy);\nh+=d*amp;\nuv*=octave_m; freq*=1.9; amp*=0.22;\nchoppy=mix(choppy,1.0,0.2);\n}\nreturn p.y-h;\n}\nvec3 getSeaColor(vec3 p,vec3 n,vec3 l,vec3 eye,vec3 dist)\n{\nfloat fresnel=clamp(1.0-dot(n,-eye),0.0,1.0);\nfresnel=pow(fresnel,3.0)*0.65;\n#if defined(REFLECTION_ENABLED) || defined(REFRACTION_ENABLED)\nvec2 reflectionUv=vec2(vUV.x,vUV.y+normalize(n).y);\n#endif\n#ifdef REFLECTION_ENABLED\nvec3 reflected=texture2D(reflectionSampler,reflectionUv).rgb*(1.0-fresnel);\n#else\nvec3 eyeNormal=reflect(eye,n);\neyeNormal.y=max(eyeNormal.y,0.0);\nvec3 reflected=vec3(pow(1.0-eyeNormal.y,2.0),1.0-eyeNormal.y,0.6+(1.0-eyeNormal.y)*0.4);\n#endif\n#ifdef REFRACTION_ENABLED\nvec3 refracted=SEA_BASE+diffuse(n,l,80.0)*SEA_WATER_COLOR*0.12;\nrefracted+=(texture2D(refractionSampler,reflectionUv).rgb*fresnel);\n#else\nvec3 refracted=SEA_BASE+diffuse(n,l,80.0)*SEA_WATER_COLOR*0.12;\n#endif\nvec3 color=mix(refracted,reflected,fresnel);\nfloat atten=max(1.0-dot(dist,dist)*0.001,0.0);\ncolor+=SEA_WATER_COLOR*(p.y-SEA_HEIGHT)*0.18*atten;\ncolor+=vec3(specular(n,l,eye,60.0));\nreturn color;\n}\n\nvec3 getNormal(vec3 p,float eps)\n{\nvec3 n;\nn.y=map_detailed(p);\nn.x=map_detailed(vec3(p.x+eps,p.y,p.z))-n.y;\nn.z=map_detailed(vec3(p.x,p.y,p.z+eps))-n.y;\nn.y=eps;\nreturn normalize(n);\n}\nfloat heightMapTracing(vec3 ori,vec3 dir,out vec3 p)\n{\nfloat tm=0.0;\nfloat tx=1000.0;\nfloat hx=map(ori+dir*tx);\nif(hx>0.0) return tx;\nfloat hm=map(ori+dir*tm);\nfloat tmid=0.0;\nfor(int i=0; i<NUM_STEPS; i++)\n{\ntmid=mix(tm,tx,hm/(hm-hx));\np=ori+dir*tmid;\nfloat hmid=map(p);\nif(hmid<0.0)\n{\ntx=tmid;\nhx=hmid;\n}\nelse\n{\ntm=tmid;\nhm=hmid;\n}\n}\nreturn tmid;\n}\n\nvoid main()\n{\n#ifdef NOT_SUPPORTED\n\ngl_FragColor=texture2D(textureSampler,vUV);\n#else\nvec2 uv=vUV;\nuv=uv*2.0-1.0;\nuv.x*=resolution.x/resolution.y;\n\nvec3 ang=vec3(cameraRotation.z,cameraRotation.x,cameraRotation.y);\nvec3 ori=vec3(cameraPosition.x,cameraPosition.y,-cameraPosition.z);\nvec3 dir=normalize(vec3(uv.xy,-3.0));\ndir=normalize(dir)*fromEuler(ang);\n\nvec3 p;\nheightMapTracing(ori,dir,p);\nvec3 dist=p-ori;\nvec3 n=getNormal(p,dot(dist,dist)*EPSILON_NRM);\nvec3 light=normalize(vec3(0.0,1.0,0.8));\n\nfloat seaFact=clamp(max(ori.y,0.0),0.0,1.0);\nvec3 position=texture2D(positionSampler,vUV).rgb;\nvec3 baseColor=texture2D(textureSampler,vUV).rgb;\nvec3 color=baseColor;\nif (max(position.y,0.0)<p.y)\n{\n\ncolor=mix(\nbaseColor,\ngetSeaColor(p,n,light,dir,dist),\npow(smoothstep(0.0,-0.05,dir.y),0.3)\n)*seaFact;\n}\ncolor=mix(\ncolor,\nbaseColor*SEA_BASE+diffuse(n,n,80.0)*SEA_WATER_COLOR*0.12,\n1.0-seaFact\n);\n\ngl_FragColor=vec4(pow(color,vec3(0.75)),1.0);\n#endif\n}\n";o.Effect.ShadersStore.oceanPostProcessPixelShader=i;var a=function(e){function n(n,t,r){void 0===r&&(r={});var i=e.call(this,n,"oceanPostProcess",["time","resolution","cameraPosition","cameraRotation"],["positionSampler","reflectionSampler","refractionSampler"],{width:t.getEngine().getRenderWidth(),height:t.getEngine().getRenderHeight()},t,o.Texture.TRILINEAR_SAMPLINGMODE,t.getEngine(),!0)||this;return i._time=0,i._cameraRotation=o.Vector3.Zero(),i._cameraViewMatrix=o.Matrix.Identity(),i._reflectionEnabled=!1,i._refractionEnabled=!1,i._geometryRenderer=t.getScene().enableGeometryBufferRenderer(1),i._geometryRenderer&&i._geometryRenderer.isSupported?(i._geometryRenderer.enablePosition=!0,i.reflectionTexture=new o.MirrorTexture("oceanPostProcessReflection",r.reflectionSize||{width:512,height:512},t.getScene()),i.reflectionTexture.mirrorPlane=o.Plane.FromPositionAndNormal(o.Vector3.Zero(),new o.Vector3(0,-1,0)),i.refractionTexture=new o.RenderTargetTexture("oceanPostProcessRefraction",r.refractionSize||{width:512,height:512},t.getScene())):i.updateEffect("#define NOT_SUPPORTED\n"),i.onApply=function(e){if(i._geometryRenderer&&i._geometryRenderer.isSupported){var n=t.getEngine(),r=t.getScene();i._time+=.001*n.getDeltaTime(),e.setFloat("time",i._time),e.setVector2("resolution",new o.Vector2(n.getRenderWidth(),n.getRenderHeight())),r&&(e.setVector3("cameraPosition",t.globalPosition),i._computeCameraRotation(t),e.setVector3("cameraRotation",i._cameraRotation),e.setTexture("positionSampler",i._geometryRenderer.getGBuffer().textures[2]),i._reflectionEnabled&&e.setTexture("reflectionSampler",i.reflectionTexture),i._refractionEnabled&&e.setTexture("refractionSampler",i.refractionTexture))}},i}return r.b(n,e),Object.defineProperty(n.prototype,"reflectionEnabled",{get:function(){return this._reflectionEnabled},set:function(e){if(this._reflectionEnabled!==e){this._reflectionEnabled=e,this.updateEffect(this._getDefines());var n=this.getCamera().getScene().customRenderTargets;if(e)n.push(this.reflectionTexture);else{var t=n.indexOf(this.reflectionTexture);-1!==t&&n.splice(t,1)}}},enumerable:!0,configurable:!0}),Object.defineProperty(n.prototype,"refractionEnabled",{get:function(){return this._refractionEnabled},set:function(e){if(this._refractionEnabled!==e){this._refractionEnabled=e,this.updateEffect(this._getDefines());var n=this.getCamera().getScene().customRenderTargets;if(e)n.push(this.refractionTexture);else{var t=n.indexOf(this.refractionTexture);-1!==t&&n.splice(t,1)}}},enumerable:!0,configurable:!0}),Object.defineProperty(n.prototype,"isSupported",{get:function(){return null!==this._geometryRenderer&&this._geometryRenderer.isSupported},enumerable:!0,configurable:!0}),n.prototype._getDefines=function(){var e=[];return this._reflectionEnabled&&e.push("#define REFLECTION_ENABLED"),this._refractionEnabled&&e.push("#define REFRACTION_ENABLED"),e.join("\n")},n.prototype._computeCameraRotation=function(e){e.upVector.normalize();var n=e.getTarget();e._initialFocalDistance=n.subtract(e.position).length(),e.position.z===n.z&&(e.position.z+=o.Epsilon);var t=n.subtract(e.position);e._viewMatrix.invertToRef(this._cameraViewMatrix),this._cameraRotation.x=Math.atan(this._cameraViewMatrix.m[6]/this._cameraViewMatrix.m[10]),t.x>=0?this._cameraRotation.y=-Math.atan(t.z/t.x)+Math.PI/2:this._cameraRotation.y=-Math.atan(t.z/t.x)-Math.PI/2,this._cameraRotation.z=0,isNaN(this._cameraRotation.x)&&(this._cameraRotation.x=0),isNaN(this._cameraRotation.y)&&(this._cameraRotation.y=0),isNaN(this._cameraRotation.z)&&(this._cameraRotation.z=0)},n}(o.PostProcess);t.d(n,"OceanPostProcess",function(){return a})},,function(e,n){var t;t=function(){return this}();try{t=t||new Function("return this")()}catch(e){"object"==typeof window&&(t=window)}e.exports=t},,,,,function(e,n,t){"use strict";t.r(n),function(e){var r=t(3);t.d(n,"OceanPostProcess",function(){return r.OceanPostProcess});var o=void 0!==e?e:"undefined"!=typeof window?window:void 0;if(void 0!==o)for(var i in r)o.BABYLON[i]=r[i]}.call(this,t(5))}])});