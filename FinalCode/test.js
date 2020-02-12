
window.addEventListener('DOMContentLoaded', function(){

    // get the canvas DOM element
    var canvas = document.getElementById('renderCanvas');
    // load the 3D engine
    var engine = new BABYLON.Engine(canvas, true);

    var createScene = function() {

        var scene = new BABYLON.Scene(engine);
        var camera = new BABYLON.FreeCamera("camera1",   new BABYLON.Vector3(0.0, 8.0, -100.0), scene);
        scene.collisionsEnabled = true;
        camera.attachControl(canvas, true);
        camera.checkCollisions=true;
        var light0 = new BABYLON.PointLight("Omni0", new BABYLON.Vector3(0,100,150), scene);
        light0.intensity = 5;
        light0.specular = new BABYLON.Color3(0,0,0);

        var mapSubX = 1500;
        var mapSubZ = 1500;
        var mapData = new Float32Array(mapSubX * mapSubZ * 3);

        var seed = 0.3;
        noise.seed(seed);

        for (var l = 0; l < mapSubZ; l++) {
            for (var w = 0; w < mapSubX; w++) {
                var x = (w - mapSubX * 0.5);
                var z = (l - mapSubZ * 0.5);
                var e =  5 * noise.perlin2 (0.01 * x, 0.01 * z) + 0.5 * noise.perlin2(0.1 * x, 0.1*z) + 0.05 * noise.perlin2(0.9 * x, 0.9 * z);

                var y = Math.pow(e,4.0);

                if(y>40){
                    y=40;
                }
                var noiseScale = 0.03;
                var elevationScale = 6.0;
                if(mapSubX-w<20){
                    if(y>15){
                        y = noise.simplex2(x * noiseScale, z * noiseScale);
                        y *= (0.5 + y) * y * elevationScale;                    }
                }
                if(mapSubZ-l<20){
                    if(y>15){
                        y = noise.simplex2(x * noiseScale, z * noiseScale);
                        y *= (0.5 + y) * y * elevationScale;                    }                }
                if(mapSubX-w<10){
                    if(y>7){
                        y = noise.simplex2(x * noiseScale, z * noiseScale);
                        y *= (0.5 + y) * y * elevationScale;                    }                }
                if(mapSubZ-l<10){
                    if(y>7){
                        y = noise.simplex2(x * noiseScale, z * noiseScale);
                        y *= (0.5 + y) * y * elevationScale;                    }                  }
                if(w<20){
                    if(y>15){
                        y = noise.simplex2(x * noiseScale, z * noiseScale);
                        y *= (0.5 + y) * y * elevationScale;                    }                 }
                if(l<20){
                    if(y>15){
                        y = noise.simplex2(x * noiseScale, z * noiseScale);
                        y *= (0.5 + y) * y * elevationScale;                    }                 }
                if(w<10){
                    if(y>7){
                        y = noise.simplex2(x * noiseScale, z * noiseScale);
                        y *= (0.5 + y) * y * elevationScale;                    }                  }
                if(l<10){
                    if(y>7){
                        y = noise.simplex2(x * noiseScale, z * noiseScale);
                        y *= (0.5 + y) * y * elevationScale;                    }                  }

                mapData[3 * (l * mapSubX + w)] = x;
                mapData[3 * (l * mapSubX + w) + 1] = y;
                mapData[3 * (l * mapSubX + w) + 2] = z;

            }
        }


        // Dynamic Terrain


        var terrainSub = 500;
        var params = {
            mapData: mapData,
            mapSubX: mapSubX,
            mapSubZ: mapSubZ,
            terrainSub: terrainSub
        };


        var terrain = new BABYLON.DynamicTerrain("tm", params, scene);


        // Create terrain material
        var terrainMaterial = new BABYLON.TerrainMaterial("terrainMaterial", scene);



        terrainMaterial.mixTexture = new BABYLON.Texture("Texture/mixMap.png", scene);


        terrainMaterial.diffuseTexture1 = new BABYLON.Texture("Texture/ground.png", scene);
        terrainMaterial.diffuseTexture2 = new BABYLON.Texture("Texture/ground.png", scene);
        terrainMaterial.diffuseTexture3 = new BABYLON.Texture("Texture/ground.png", scene);

        // Rescale textures according to the terrain
        terrainMaterial.diffuseTexture1.uScale = terrainMaterial.diffuseTexture1.vScale = 10;
        terrainMaterial.diffuseTexture2.uScale = terrainMaterial.diffuseTexture2.vScale = 10;
        terrainMaterial.diffuseTexture3.uScale = terrainMaterial.diffuseTexture3.vScale = 10;

        terrainMaterial._reflectionEnabled = true;
        terrain.mesh.material = terrainMaterial;


        // Fog
        scene.fogMode = BABYLON.Scene.FOGMODE_EXP;
        scene.fogColor = new BABYLON.Color3(1,1,1);
        scene.fogDensity = 0.002;
        scene.fogStart = 1000;



        // Skybox
        var box = BABYLON.Mesh.CreateBox('SkyBox', 1000, scene, false, BABYLON.Mesh.BACKSIDE);
        var skyMaterial = new BABYLON.SkyMaterial("skyMaterial", scene);
        box.material = skyMaterial;
        skyMaterial.turbidity = 1;
        skyMaterial.luminance = 0.9;

        skyMaterial.useSunPosition = true;
        skyMaterial.sunPosition = new BABYLON.Vector3(0, 5, 100);
        skyMaterial.mieCoefficient = 0.001;

        box.material.backFaceCulling = false;
        box.material.reflectionTexture = new BABYLON.CubeTexture("//www.babylonjs.com/assets/skybox/TropicalSunnyDay", scene);
        box.material.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
        box.material.diffuseColor = new BABYLON.Color3(0, 0, 0);
        box.material.specularColor = new BABYLON.Color3(0, 0, 0);
        box.material.disableLighting = true;
        box.parent = null;
        box.infiniteDistance = true;
        box.material.inclination = -0.46;

        terrain.mesh.checkCollisions=true;
        box.checkCollisions = true;

        terrain.LODLimits = [1, 1, 2,2,2,4,4,8,8,8,8];
        terrain.updateCameraLOD = function(terrainCamera) {
            // LOD value increases with camera altitude
            var camLOD = Math.abs((terrainCamera.globalPosition.y / 64.0)|0);
            return camLOD;
        };


        // Disp WireFrame
        var dispWire = document.getElementById("wireframe");
        dispWire.oninput = function () {
            if(terrainMaterial.wireframe==false){
                terrainMaterial.wireframe = true;
            }else {
                terrainMaterial.wireframe = false;
            }
        };


        // Quality Slider
        var qualitySlider = document.getElementById("quality");
        var qualityOutput = document.getElementById("qualityValue");
        qualityOutput.innerHTML = "High";


        qualitySlider.oninput = function() {
            if(this.value == 1){
                terrain.LODLimits = [1, 1, 2,2,2,4,4,8,8,8,8];
                terrain.updateCameraLOD = function(terrainCamera) {
                    // LOD value increases with camera altitude
                    var camLOD = Math.abs((terrainCamera.globalPosition.y / 1.0)|0);
                    return camLOD;
                };
                qualityOutput.innerHTML = "Low";
            }else if(this.value == 2){
                terrain.LODLimits = [1, 1, 2,2,2,4,4,8,8,8,8];
                terrain.updateCameraLOD = function(terrainCamera) {
                    // LOD value increases with camera altitude
                    var camLOD = Math.abs((terrainCamera.globalPosition.y / 2.0)|0);
                    return camLOD;
                };
                qualityOutput.innerHTML = "Medium";
            }else if(this.value == 3){
                terrain.LODLimits = [1, 1, 2,2,2,4,4,8,8,8,8];
                terrain.updateCameraLOD = function(terrainCamera) {
                    // LOD value increases with camera altitude
                    var camLOD = Math.abs((terrainCamera.globalPosition.y / 64.0)|0);
                    return camLOD;
                };
                qualityOutput.innerHTML = "High";
                /*  terrain.LODLimits = [1, 1, 2,2,2,4,4,8,8,8,8,16,16,32,32,64,64,128,128,256,256];        // Terrain camera LOD : custom function
                  terrain.updateCameraLOD = function(terrainCamera) {
                      // LOD value increases with camera altitude
                      var camLOD = Math.abs((terrainCamera.globalPosition.y / 64.0)|0);
                      return camLOD;
                  };*/
            }
        };

        // Sun Slider

        var sunSlider = document.getElementById("sun");
        var sunOutput = document.getElementById("sunValue");

        sunOutput.innerHTML = sunSlider.value;
        sunSlider.oninput = function() {
            sunOutput.innerHTML = this.value;
            skyMaterial.sunPosition = new BABYLON.Vector3(0, this.value, 100);
            light0.position = new BABYLON.Vector3(0,this.value,150);

        };


        var mieCoeffSlider = document.getElementById("mieCoeff");
        var mieCoeffOutput = document.getElementById("mieCoeffValue");

        mieCoeffOutput.innerHTML = mieCoeffSlider.value;
        skyMaterial.mieCoefficient = mieCoeffSlider.value*0.001;
        mieCoeffSlider.oninput = function() {
            mieCoeffOutput.innerHTML = this.value;
            skyMaterial.mieCoefficient = this.value*0.001;
            light0.intensity= this.value/5;
        };

        //a

        var terrainSlider = document.getElementById("terrain");
        var terrainOutput = document.getElementById("terrainValue");
        terrainOutput.innerHTML = terrainSlider.value;

        var freqaSlider = document.getElementById("frequencya");
        var freqaOutput = document.getElementById("frequencyValuea");
        freqaOutput.innerHTML = freqaSlider.value/100;


        terrainSlider.oninput = function() {
            terrainOutput.innerHTML = this.value;
        };


        freqaSlider.oninput = function() {
            freqaOutput.innerHTML = this.value/100;
        };


        //b

        var terrainSlider2 = document.getElementById("terrain2");
        var terrainOutput2 = document.getElementById("terrainValue2");
        terrainOutput2.innerHTML = terrainSlider2.value/10;

        var freqbSlider = document.getElementById("frequencyb");
        var freqbOutput = document.getElementById("frequencyValueb");
        freqbOutput.innerHTML = freqbSlider.value/100;


        terrainSlider2.oninput = function() {
            terrainOutput2.innerHTML = this.value/10;
        };

        freqbSlider.oninput = function() {
            freqbOutput.innerHTML = this.value/100;
        };


        //c

        var terrainSlider3 = document.getElementById("terrain3");
        var terrainOutput3 = document.getElementById("terrainValue3");
        terrainOutput3.innerHTML = terrainSlider3.value/40;

        var freqcSlider = document.getElementById("frequencyc");
        var freqcOutput = document.getElementById("frequencyValuec");
        freqcOutput.innerHTML = freqcSlider.value/100;

        terrainSlider3.oninput = function() {
            terrainOutput3.innerHTML = this.value/40;
        };

        freqcSlider.oninput = function() {
            freqcOutput.innerHTML = this.value/100;
        };

        // Exponent Slider

        var eSlider = document.getElementById("exponent");
        var eOutput = document.getElementById("exponentValue");
        eOutput.innerHTML = eSlider.value/100;

        eSlider.oninput = function() {
            eOutput.innerHTML = this.value/100;
        };


        var buttonA = document.getElementById("terrainGenerator");
        buttonA.onclick = function () {
            var mapData1 = function (a,a1,b,b1,c,c1,d) {


                var mapSubX = 1500;
                var mapSubZ = 1500;
                var mapData = new Float32Array(mapSubX * mapSubZ * 3);

                var seed = 0.3;
                noise.seed(seed);

                for (var l = 0; l < mapSubZ; l++) {
                    for (var w = 0; w < mapSubX; w++) {
                        var x = (w - mapSubX * 0.5);
                        var z = (l - mapSubZ * 0.5);
                        var e =  a * noise.perlin2(a1 * x, a1 * z) + b * noise.perlin2(b1 * x, b1 * z) + c * noise.perlin2(c1 * x, c1 * z);  // let's increase a bit the noise computed altitude
                        var y = Math.pow(e,d);

                        if(y>40){
                            y=40;
                        }
                        var noiseScale = 0.03;         // noise frequency
                        var elevationScale = 6.0;
                        if(mapSubX-w<20){
                            if(y>15){
                                y = noise.simplex2(x * noiseScale, z * noiseScale);
                                y *= (0.5 + y) * y * elevationScale;                    }
                        }
                        if(mapSubZ-l<20){
                            if(y>15){
                                y = noise.simplex2(x * noiseScale, z * noiseScale);
                                y *= (0.5 + y) * y * elevationScale;                    }                }
                        if(mapSubX-w<10){
                            if(y>7){
                                y = noise.simplex2(x * noiseScale, z * noiseScale);
                                y *= (0.5 + y) * y * elevationScale;                    }                }
                        if(mapSubZ-l<10){
                            if(y>7){
                                y = noise.simplex2(x * noiseScale, z * noiseScale);
                                y *= (0.5 + y) * y * elevationScale;                    }                  }
                        if(w<20){
                            if(y>15){
                                y = noise.simplex2(x * noiseScale, z * noiseScale);
                                y *= (0.5 + y) * y * elevationScale;                    }                 }
                        if(l<20){
                            if(y>15){
                                y = noise.simplex2(x * noiseScale, z * noiseScale);
                                y *= (0.5 + y) * y * elevationScale;                    }                 }
                        if(w<10){
                            if(y>7){
                                y = noise.simplex2(x * noiseScale, z * noiseScale);
                                y *= (0.5 + y) * y * elevationScale;                    }                  }
                        if(l<10){
                            if(y>7){
                                y = noise.simplex2(x * noiseScale, z * noiseScale);
                                y *= (0.5 + y) * y * elevationScale;                    }                  }

                        mapData[3 * (l * mapSubX + w)] = x;
                        if(y<0){
                            y=0;
                        }
                        if(isNaN(y)){
                            y=0;
                        }
                        mapData[3 * (l * mapSubX + w) + 1] = y;
                        mapData[3 * (l * mapSubX + w) + 2] = z;
                    }
                }
                waterMesh.position.x = camera.position.x;
                waterMesh.position.z = camera.position.z;
                return mapData;
            };
            terrain.mapData = mapData1(terrainOutput.innerHTML, freqaOutput.innerHTML, terrainOutput2.innerHTML, freqbOutput.innerHTML, terrainOutput3.innerHTML, freqcOutput.innerHTML, eOutput.innerHTML);
        };


        // Water
        var waterMesh = BABYLON.Mesh.CreateGround("waterMesh", 1000, 1000, 1000, scene, false);
        var water = new BABYLON.WaterMaterial("water", scene, new BABYLON.Vector2(1024, 1024));
        water.backFaceCulling = true;
        water.bumpTexture = new BABYLON.Texture("Texture/water.jpg", scene);
        water.windForce = -5;
        water.waveHeight = 0.01;
        water.bumpHeight = 0.10;
        water.waveLength = 0.05;
        water.colorBlendFactor = 0;
        water.addToRenderList(box);
        water.addToRenderList(terrain.mesh);
        waterMesh.material = water;
        waterMesh.position.x = camera.position.x;
        waterMesh.position.z = camera.position.z;

        //Water Slider

        var waterSlider = document.getElementById("water");
        var waterLevel = document.getElementById("waterLevel");
        waterLevel.innerHTML = waterSlider.value;

        waterMesh.position.y = waterSlider.value/100;

        terrain.useCustomVertexFunction = true;

        terrain.updateVertex = function(vertex) {

            vertex.color.g = 1.0;
            vertex.color.r = 1.0;
            vertex.color.b = 1.0;



            if (vertex.position.y < 27.0) {
                vertex.color.g = 0.25;
                vertex.color.r=0.25;
                vertex.color.b =0.25;
            }

            if (vertex.position.y < 25.0) {
                vertex.color.r=0.112;
                vertex.color.g = 0.066;
                vertex.color.b =0.020;
            }

            if (vertex.position.y < 5){
                vertex.color.r = 0.128;
                vertex.color.g = 0.188;
                vertex.color.b = 0.0;

            }
            if (vertex.position.y - waterMesh.position.y < 0.5){
                vertex.color.r = 0.255;
                vertex.color.g = 0.255;
                vertex.color.b = 0.255;

            }
        };

        terrain.computeNormals = true;


        waterSlider.oninput = function() {
            waterLevel.innerHTML = this.value/100;
            waterMesh.position.y = this.value / 100;
            terrain.updateVertex = function (vertex) {

                vertex.color.g = 1.0;
                vertex.color.r = 1.0;
                vertex.color.b = 1.0;


                if (vertex.position.y < 27.0) {
                    vertex.color.g = 0.25;
                    vertex.color.r=0.25;
                    vertex.color.b =0.25;
                }

                if (vertex.position.y < 25.0) {
                    vertex.color.r=0.112;
                    vertex.color.g = 0.066;
                    vertex.color.b =0.020;
                }

                if (vertex.position.y < 5.0){
                    vertex.color.r = 0.128;
                    vertex.color.g = 0.188;
                    vertex.color.b = 0.0;

                }
                if (vertex.position.y - waterMesh.position.y < 0.5){
                    vertex.color.r = 0.255;
                    vertex.color.g = 0.255;
                    vertex.color.b = 0.255;

                }
            } ;
            terrain.computeNormals = true;
            terrain.update;

        };

        document.onkeydown = checkKey;

        function checkKey(e) {
            e = e || window.event;
            if (e.keyCode == '38' ||e.keyCode == '40'||e.keyCode == '37'||e.keyCode == '39') {
                waterMesh.position.x = camera.position.x;
                waterMesh.position.z = camera.position.z;

            }
        }

        var bumpHSlider = document.getElementById("bumpHeight");
        var bumpHValue = document.getElementById("bumpHeightValue");
        bumpHValue.innerHTML = bumpHSlider.value;

        bumpHSlider.oninput = function() {
            bumpHValue.innerHTML = this.value;
            water.bumpHeight = this.value / 100;
        };


        var waveLSlider = document.getElementById("waveLength");
        var waveLValue = document.getElementById("waveLengthValue");
        waveLValue.innerHTML = waveLSlider.value;

        waveLSlider.oninput = function() {
            waveLValue.innerHTML = this.value;
            water.waveLength = this.value / 100;
        };


        // Fog Slider

        var fogSlider = document.getElementById("fog");
        var fogOutput = document.getElementById("fogValue");
        var tmp = (fogSlider.value*0.0001);
        fogOutput.innerHTML = Math.round(tmp*Math.pow(10,5))/Math.pow(10,5);


        fogSlider.oninput = function() {
            var tmp = (this.value*0.0001);
            fogOutput.innerHTML = Math.round(tmp*Math.pow(10,5))/Math.pow(10,5);
            scene.fogDensity = this.value*0.0001;
        };


        light0.parent = box;
        return scene;
    };

    var scene = createScene();


    engine.runRenderLoop(function(){

        scene.render();

        var fpsLabel = document.getElementById('fpsLabel');
        fpsLabel.innerHTML = engine.getFps().toFixed() + "FPS";
    });


    window.addEventListener('resize', function(){
        engine.resize();
    });

});
