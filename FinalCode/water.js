BABYLON.Effect.ShadersStore["customVertexShader"]= "\r\n"+
    "#ifdef GL_ES\r\n"+
    "precision mediump float;\r\n"+
    "#endif\r\n"+
    "\r\n"+
    "\r\n"+
    "// Attributes\r\n"+
    "attribute vec3 position;\r\n"+
    "attribute vec3 normal;\r\n"+
    "attribute vec2 uv;\r\n"+
    "\r\n"+
    "// Uniforms\r\n"+
    "uniform vec2 waveData;\r\n"+
    "uniform mat4 windMatrix;\r\n"+
    "uniform mat4 world;\r\n"+
    "uniform mat4 worldViewProjection;\r\n"+
    "\r\n"+
    "// Normal\r\n"+
    "varying vec3 vPositionW;\r\n"+
    "varying vec3 vNormalW;\r\n"+
    "varying vec4 vUV;\r\n"+
    "varying vec2 vBumpUV;\r\n"+
    "\r\n"+
    "void main(void) {\r\n"+
    "    vec4 outPosition = worldViewProjection * vec4(position, 1.0);\r\n"+
    "    gl_Position = outPosition;\r\n"+
    "\r\n"+
    "    vPositionW = vec3(world * vec4(position, 1.0));\r\n"+
    "    vNormalW = normalize(vec3(world * vec4(normal, 0.0)));\r\n"+
    "\r\n"+
    "    vUV = outPosition;\r\n"+
    "\r\n"+
    "    vec2 bumpTexCoord = vec2(windMatrix * vec4(uv, 0.0, 1.0));\r\n"+
    "    vBumpUV = bumpTexCoord / waveData.x;\r\n"+
    "}\r\n";

BABYLON.Effect.ShadersStore["customFragmentShader"]="\r\n"+
    "#ifdef GL_ES\r\n"+
    "precision mediump float;\r\n"+
    "#endif\r\n"+
    "uniform vec3 vEyePosition;\r\n"+
    "uniform vec4 vLevels;\r\n"+
    "uniform vec3 waterColor;\r\n"+
    "uniform vec2 waveData;\r\n"+
    "\r\n"+
    "// Lights\r\n"+
    "varying vec3 vPositionW;\r\n"+
    "varying vec3 vNormalW;\r\n"+
    "uniform vec3 vLightPosition;\r\n"+
    "\r\n"+
    "// Refs\r\n"+
    "varying vec2 vBumpUV;\r\n"+
    "varying vec4 vUV;\r\n"+
    "uniform sampler2D refractionSampler;\r\n"+
    "uniform sampler2D reflectionSampler;\r\n"+
    "uniform sampler2D bumpSampler;\r\n"+
    "\r\n"+
    "void main(void) {\r\n"+
    "    vec3 viewDirectionW = normalize(vEyePosition - vPositionW);\r\n"+
    "\r\n"+
    "    // Light\r\n"+
    "    vec3 lightVectorW = normalize(vLightPosition - vPositionW);\r\n"+
    "\r\n"+
    "    // Wave\r\n"+
    "    vec3 bumpNormal = 2.0 * texture2D(bumpSampler, vBumpUV).rgb - 1.0;\r\n"+
    "    vec2 perturbation = waveData.y * bumpNormal.rg;\r\n"+
    "\r\n"+
    "    // diffuse\r\n"+
    "    float ndl = max(0., dot(vNormalW, lightVectorW));\r\n"+
    "\r\n"+
    "    // Specular\r\n"+
    "    vec3 angleW = normalize(viewDirectionW + lightVectorW);\r\n"+
    "    float specComp = dot(normalize(vNormalW), angleW);\r\n"+
    "    specComp = pow(specComp, 256.);\r\n"+
    "\r\n"+
    "    // Refraction\r\n"+
    "    vec2 texCoords;\r\n"+
    "    texCoords.x = vUV.x / vUV.w / 2.0 + 0.5;\r\n"+
    "    texCoords.y = vUV.y / vUV.w / 2.0 + 0.5;\r\n"+
    "\r\n"+
    "    vec3 refractionColor = texture2D(refractionSampler, texCoords + perturbation).rgb;\r\n"+
    "\r\n"+
    "    // Reflection\r\n"+
    "    vec3 reflectionColor = texture2D(reflectionSampler, texCoords + perturbation).rgb;\r\n"+
    "\r\n"+
    "    // Fresnel\r\n"+
    "    float fresnelTerm = dot(viewDirectionW, vNormalW);\r\n"+
    "    fresnelTerm = clamp((1.0 - fresnelTerm) * vLevels.y, 0., 1.);\r\n"+
    "\r\n"+
    "    // Water color\r\n"+
    "\r\n"+
    "    vec3 finalColor = (waterColor * ndl) * vLevels.x + (1.0 - vLevels.x) * (reflectionColor * fresnelTerm * vLevels.z +\r\n"+
    "                                                       (1.0 - fresnelTerm) * refractionColor * vLevels.w) + specComp;\r\n"+
    "\r\n"+
    "\r\n"+
    "    gl_FragColor = vec4(finalColor, 1.);\r\n"+
    "}\r\n";


// Compile
var shaderMaterial = new BABYLON.ShaderMaterial("shader", scene, {
        vertex: "custom",
        fragment: "custom",
    },
    {
        attributes: ["position", "normal", "uv"],
        uniforms: ["world", "worldView", "worldViewProjection", "view", "projection"]
    });

var refTexture = new BABYLON.Texture("ref.jpg", scene);
refTexture.wrapU = BABYLON.Texture.CLAMP_ADDRESSMODE;
refTexture.wrapV = BABYLON.Texture.CLAMP_ADDRESSMODE;

var mainTexture = new BABYLON.Texture("amiga.jpg", scene);

shaderMaterial.setTexture("textureSampler", mainTexture);
shaderMaterial.setTexture("refSampler", refTexture);
shaderMaterial.setFloat("time", 0);
shaderMaterial.setVector3("cameraPosition", BABYLON.Vector3.Zero());
shaderMaterial.backFaceCulling = false;

for (var index = 0; index < meshes.length; index++) {
    var mesh = meshes[index];
    mesh.material = shaderMaterial;
}

