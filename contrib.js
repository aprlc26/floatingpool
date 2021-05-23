/*
A THREE.js model of an indoor floating pool scene. Copyright (©) 2019 by April Chu and Vera Ye.
This program is released under the GNU General Public License (GPL).

Authors: April Chu and Vera Ye
Date: 12/11/2019
Purpose: CS 307 Final Project
*/

// a global variable accessible for demo.html
var poolParams = {
    // initial control points for water bezier surface
    topToBottom: [
      [ [0,50,0], [10,50,0], [20,50,0], [50,50,0] ],
      [ [0,20,0], [10,45,5], [20,10,9], [50,20,0] ],
      [ [0,10,0], [10,40,9], [20,5,5], [50,10,0] ],
      [ [0,0,0], [10,0,0], [20,0,0], [50,0,0] ],
    ],

    // a 15x8x15 rectangular pool
    innerPoolWidth: 50,
    innerPoolHeight: 18,
    innerPoolDepth: 50,
    // texture for inner pool
    poolTileTexture: "pool_tile.jpg",

    // a 16x10x16 rectangular pool
    outerPoolWidth: 52,
    outerPoolHeight: 20,
    outerPoolDepth: 52,

    // 0.5x16 pool borders
    poolPlaneWidth: 1,
    poolPlaneHeight: 52,

    // a 15x5x15 water cube
    waterCubeWidth: 50,
    waterCubeHeight: 10,
    waterCubeDepth: 50,
    // textures for water cube
    waterTexture: "water.jpg",
    waterBumpMap: "waterBump.jpg",

    // a half torus with thickness of 0.3 and radius of 2
    handleRad: 2,
    handleTube: 0.3,
    handleArc: Math.PI,

    // a cylinder with radius of 0.3 and length of 6
    stepRad: 0.3, //radius of the step
    stepWidth: 6, //horizontal distance between the two sides of the ladder
    stepGap: 3, //vertical distance between the steps of the ladder

    // height of the ladder is float (see below) + extraHeight
    extraHeight: 10,
    // texture for ladder
    ladderTexture: "silver.jpg",

    // circular stair parameters
    cirStairRad: 35,
    cirStairHeight: 6,
    cirStairTS: 0,
    cirStairTLQuarter: Math.PI/2,
    cirStairTLFull: Math.PI*2,

    // marble ball parameters
    marbleBallR: 10,

    // flamingo parameters
    bodyLength: 50,
    bodyWidth: 12,
    bodyScale: 1,
    headWidth: 2.5,
    neckRadius: 2,
    neckLength: 50,
    eyeRadius: 1,
    segments: 50,
    legRadius: 1,
    legLength: 40,
    footRadius: 3,

    // flamingo textures
    featherTexture: "feathers.jpg",
    feathersBumpMap: "feathersBumpMap.jpg",
    beakTexture: "beak.jpg",
    beakBumpMap: "beakBumpMap.jpg",
    legTexture: "leg.jpg",
    legBumpMap: "legBumpMap.jpg",

    // ring buoy parameters
    ringRad: 7,
    ringTube: 2.5,
    stripeTexture: "pwstripe.png",

    // beach chair parameters
    backWid: 10,
    legWid: 18,
    seatDep: 8,
    seatHeight: 2,

    // smoothness of all objects
    radialSeg: 32,

    // a 200*150*200 scene box
    sceneBoxWidth: 200,
    sceneBoxHeight: 150,
    sceneBoxDepth: 220,

    // textures for objects in scene box and scene box itself
    gradientTexture: "gradient.jpg",
    marbleTexture: "marble.jpg",
    pinkMarbleTexture: "pinkmarble.jpg",

    // gui parameters
    float: 5,   // height of the initial displacement in the Y direction
    rotate: 0   // degree of the inital rotation
};

// the main function to be called in demo.html
function achu4yyePool(renderer, scene, poolParams) {
    // global scene box variable
    var boxMesh;
    // global texture materials
    var textureMat, waterTextureMat, ladderMat, surfaceMat, flamingoMaterials;
    // global variables for animation
    var poolObj, sceneBox, waterSurface, waterCube, floatingballs, pool;
    // global variables for user interaction
    var handle1, handle2, ladderSide1, ladderSide2, steps;
    var buoy, beachChair1, beachChair2, flamingo1, flamingo2, surfboard1, surfboard2,
        quarterStairs, circularStairs, arch1, arch2, arch3, stairBall;

    // load in all textures
    TW.loadTextures([poolParams.poolTileTexture,
                     poolParams.waterTexture,
                     poolParams.waterBumpMap,
                     poolParams.ladderTexture,
                     poolParams.gradientTexture,
                     poolParams.marbleTexture,
                     poolParams.featherTexture,
                     poolParams.feathersBumpMap,
                     poolParams.beakTexture,
                     poolParams.beakBumpMap,
                     poolParams.legTexture,
                     poolParams.legBumpMap,
                     poolParams.pinkMarbleTexture,
                     poolParams.stripeTexture],
        function (textures) {
            // pull out each texture
            var poolTileTexture = textures[0];
            var waterTexture = textures[1];
            var waterBumpMap = textures[2];
            var ladderTexture = textures[3];
            var gradientTexture = textures[4];
            var marbleTexture = textures[5];
            var featherTexture = textures[6];
            var featherBumpMap = textures[7];
            var beakTexture = textures[8];
            var beakBumpMap = textures[9];
            var legTexture = textures[10];
            var legBumpMap = textures[11];
            var pinkMarbleTexture = textures[12];
            var stripeTexture = textures[13];

            //set wrapping style for some textures
            poolTileTexture.wrapS = THREE.RepeatWrapping;
            poolTileTexture.wrapT = THREE.RepeatWrapping;
            poolTileTexture.repeat.set(1,1);

            waterTexture.wrapS = THREE.RepeatWrapping;
            waterTexture.wrapT = THREE.RepeatWrapping;
            waterTexture.repeat.set(1,1);

            ladderTexture.wrapS = THREE.RepeatWrapping;
            ladderTexture.wrapT = THREE.RepeatWrapping;
            ladderTexture.repeat.set(1,1);

            featherTexture.wrapS = THREE.MirroredRepeatWrapping;
            featherTexture.wrapT = THREE.MirroredRepeatWrapping;
            beakTexture.wrapS = THREE.MirroredRepeatWrapping;
            legTexture.wrapT = THREE.RepeatWrapping;

            //textures and materials for the whole scene
            textureMat = new THREE.MeshFaceMaterial(
                //pool tile texture
                [new THREE.MeshPhongMaterial(
                    {color: THREE.ColorKeywords.white,
                     side: THREE.DoubleSide,
                     map: poolTileTexture,
                     shininess: 10,
                     shading: THREE.SmoothShading}),

                //transparent material
                 new THREE.MeshPhongMaterial(
                    {color: THREE.ColorKeywords.white,
                     transparent: true,
                     opacity: 0,
                     shading: THREE.SmoothShading}),

                //light pink material
                new THREE.MeshPhongMaterial(
                  {color: THREE.ColorKeywords.lightpink,
                   side: THREE.DoubleSide,
                   shading: THREE.SmoothShading}),

                //water texture
                new THREE.MeshPhongMaterial(
                  {color: THREE.ColorKeywords.white,
                   side: THREE.DoubleSide,
                   map: waterTexture,
                   bumpMap: waterBumpMap,
                   transparent: true,
                   opacity: 0.5,
                   shininess: 10,
                   shading: THREE.SmoothShading})]
            );

            //texture for water
            waterTextureMat = {water: new THREE.MeshPhongMaterial(
                  {color: THREE.ColorKeywords.white,
                   side: THREE.DoubleSide,
                   map: waterTexture,
                   bumpMap: waterBumpMap,
                   transparent: true,
                   opacity: 0.5,
                   shininess: 10,
                   shading: THREE.SmoothShading})
            };

            //texture for ladder
            ladderMat = {
              ladder: new THREE.MeshPhongMaterial(
                    {color: THREE.ColorKeywords.silver,
                     side: THREE.DoubleSide,
                     map: ladderTexture,
                     shininess: 15,
                     shading: THREE.SmoothShading})
            };

            //texture for marbles
            marbleMaterials = {
              whiteMarble: new THREE.MeshPhongMaterial(
                    {color: THREE.ColorKeywords.white,
                     side: THREE.DoubleSide,
                     map: marbleTexture,
                     shininess: 15,
                     shading: THREE.SmoothShading}),
             pinkMarble: new THREE.MeshPhongMaterial(
                   {color: THREE.ColorKeywords.white,
                    side: THREE.DoubleSide,
                    map: pinkMarbleTexture,
                    shininess: 15,
                    shading: THREE.SmoothShading})
            };

            //texture for pink and white stripe (water buoy)
            stripeMaterial = {
              pwStripe: new THREE.MeshPhongMaterial(
                    {color: THREE.ColorKeywords.white,
                     side: THREE.DoubleSide,
                     map: stripeTexture,
                     shading: THREE.SmoothShading})
            };

            //texture for parts of the flamingo
            flamingoMaterials = {
                feathers: new THREE.MeshPhongMaterial( {
                    color: THREE.ColorKeywords.white,
                    side: THREE.DoubleSide,
                    map: featherTexture, //salmon pink
                    bumpMap: featherBumpMap,
                    shininess: 10 }),
                upperBeak: new THREE.MeshPhongMaterial( {
                    color: THREE.ColorKeywords.white,
                    side: THREE.DoubleSide,
                    map: beakTexture, //golden yellow
                    bumpMap: beakBumpMap }),
                lowerBeak: new THREE.MeshPhongMaterial( {
                    color: 0x000000, //black
                    shininess: 45,
                    specular: 0x111111,
                    emissive: 0x000000,
                    shading: THREE.SmoothShading,
                    side: THREE.DoubleSide } ),
                eyes: new THREE.MeshPhongMaterial( {
                    color: 0x000000, //black
                    shininess: 128,
                    shading: THREE.SmoothShading,
                    side: THREE.DoubleSide } ),
                legs: new THREE.MeshPhongMaterial( {
                    color: THREE.ColorKeywords.white,
                    side: THREE.DoubleSide,
                    map: legTexture, //light pink
                    bumpMap: legBumpMap })
            };


            // Call the functions defined below to create the corresponding objects
            pool = createPoolScene(poolParams);
            quarterStairs = createQuarterStairs(poolParams);
            circularStairs = createCircularStairs(poolParams);
            arch1 = createWallArch();
            arch2 = createWallArch();
            arch3 = createWallArch();
            stairBall = createFloatingBall(poolParams);
            var floatingballs = createAllFloatingBalls(poolParams);
            flamingo1 = createFlamingo(poolParams);
            flamingo2 = createFlamingo(poolParams);
            buoy = createRingBuoy(poolParams);
            beachChair1 = createBeachChair(poolParams);
            beachChair2 = createBeachChair(poolParams);
            surfboard1 = createSurfboard();
            surfboard2 = createSurfboard();
            sceneBox = createSceneBox(poolParams);

            // Set the texture of the scene box
            displayGradientTexture(textures[4]);
            displayMarbleTexture(textures[5]);

            // Position, rotate and scale the objects
            pool.position.y = -(poolParams.sceneBoxHeight/2 - poolParams.outerPoolHeight/2);
            pool.position.x = -(poolParams.sceneBoxWidth/6);
            quarterStairs.position.set(-poolParams.sceneBoxWidth/2,
                                        -poolParams.sceneBoxHeight/2,
                                        -poolParams.sceneBoxDepth/2);
            circularStairs.position.set(poolParams.sceneBoxWidth/4,
                                        -poolParams.sceneBoxHeight/2,
                                        poolParams.sceneBoxDepth/4);
            circularStairs.scale.set(0.8,0.8,0.8);
            arch1.scale.set(1.1,1.1,1.1);
            arch2.scale.set(1.1,1.1,1.1);
            arch3.scale.set(1.1,1.1,1.1);
            arch1.position.set(0,-poolParams.sceneBoxHeight/2,-poolParams.sceneBoxDepth/2);
            arch2.position.set(-44,-poolParams.sceneBoxHeight/2,-poolParams.sceneBoxDepth/2);
            arch3.position.set(44,-poolParams.sceneBoxHeight/2,-poolParams.sceneBoxDepth/2);
            stairBall.position.set(poolParams.sceneBoxWidth/4,
                                   -poolParams.sceneBoxHeight/2 + 4*poolParams.cirStairHeight + 0.5*poolParams.marbleBallR,
                                   poolParams.sceneBoxDepth/4);
            stairBall.scale.set(0.7,0.7,0.7);
            floatingballs.position.y = 15;
            flamingo1.position.set(40,-poolParams.sceneBoxHeight/2.6,-poolParams.sceneBoxDepth/4);
            flamingo1.scale.set(0.5,0.5,0.5);
            flamingo1.rotation.y = Math.PI/9;
            flamingo2.position.set(60,-poolParams.sceneBoxHeight/2.4,-poolParams.sceneBoxDepth/4);
            flamingo2.scale.set(0.35,0.35,0.35);
            flamingo2.rotation.y = -Math.PI/6;
            buoy.position.copy(pool.position);
            buoy.position.y += poolParams.float + poolParams.extraHeight;
            buoy.rotation.set(Math.PI/7, Math.PI/6, 0);
            beachChair1.position.copy(circularStairs.position);
            beachChair1.position.x -= 100;
            beachChair1.scale.x = 1.5;
            beachChair1.rotation.y = Math.PI/7;
            beachChair2.position.copy(beachChair1.position);
            beachChair2.position.z += 23;
            beachChair2.scale.x = 1.5;
            beachChair2.rotation.y = Math.PI/7;
            surfboard1.position.set(-poolParams.sceneBoxWidth/2 + 14, -poolParams.sceneBoxHeight/2 + 5, poolParams.sceneBoxDepth/4);
            surfboard1.rotation.set(Math.PI/2, -Math.PI/2.6, Math.PI/2);
            surfboard1.scale.set(2, 3.4, 0.5);
            surfboard2.position.copy(surfboard1.position);
            surfboard2.position.z += 20;
            surfboard2.rotation.copy(surfboard1.rotation);
            surfboard2.scale.copy(surfboard1.scale);

            // Add all minimal objects to scene box
            sceneBox.add(arch1);
            sceneBox.add(arch2);
            sceneBox.add(arch3);
            sceneBox.add(stairBall);
            sceneBox.add(floatingballs);
            sceneBox.add(pool);
            sceneBox.add(quarterStairs);
            sceneBox.add(circularStairs);
            sceneBox.add(flamingo1);
            sceneBox.add(flamingo2);
            sceneBox.add(buoy);
            sceneBox.add(beachChair1);
            sceneBox.add(beachChair2);
            sceneBox.add(surfboard1);
            sceneBox.add(surfboard2);

            // Add scene box to scene
            scene.add(sceneBox);

            // render the scene
            TW.render();
        });


    /* Create and return a bezier water surface with water texture mapped */
    function createWaterSurface(params) {
        var surfaceGeom = new THREE.BezierSurfaceGeometry(params.topToBottom.reverse(), 10, 10);
        surfaceMat = waterTextureMat.water;
        var surface = new THREE.Mesh( surfaceGeom, surfaceMat );
        return surface;
    }

    // a list of possible Y-values for the inner four control points
    var surfaceHs = [5, 10, 15, 20, 25, 30, 35, 40, 45];
    // frame accumulater for water surface
    var waterSurfaceFrames = 0;
    /* Animate the bezier water surface by altering inner control points */
    function animateWaterSurface(params) {
        // remove the water surface from the water cube object
        if (waterSurface != null){
            waterCube.remove(waterSurface);
        }

        // update the Y-values of the inner 4 control points of topToBottom
        params.topToBottom[2][2][1] = surfaceHs[waterSurfaceFrames % (surfaceHs.length-1) + 1];
        params.topToBottom[1][2][1] = surfaceHs[waterSurfaceFrames % (surfaceHs.length-2) + 2];
        params.topToBottom[1][1][1] = surfaceHs[(surfaceHs.length - waterSurfaceFrames % (surfaceHs.length-1)) - 1];
        params.topToBottom[2][1][1] = surfaceHs[(surfaceHs.length - waterSurfaceFrames % (surfaceHs.length-1)) - 2];

        // create a new water bezier surface
        var surfaceGeom = new THREE.BezierSurfaceGeometry(params.topToBottom.reverse(), 10, 10);
        waterSurface = new THREE.Mesh(surfaceGeom, surfaceMat);

        // position the water surface
        var waterSurfX = -params.innerPoolWidth/2;
        var waterSurfY = params.waterCubeHeight/2;
        var waterSurfZ = params.waterCubeDepth/2;
        waterSurface.position.set(waterSurfX, waterSurfY, waterSurfZ);
        waterSurface.rotation.x = -Math.PI/2;

        // add water surface to the water cube object
        waterCube.add(waterSurface);

        // update frame number and render scene
        waterSurfaceFrames += 1;
        TW.render();
    }
    // animate the water surface every 0.5 second
    setInterval(function(){ animateWaterSurface(poolParams) }, 500);

    /*
      Creates and return a ladder handle
      Frame: Origin is the center of the torus geometry
      Size: Goes from -handleRad to +handleRad
      Colors: Silver textured material
    */
    function createLadderHandle(params) {
        var handleGeom = new THREE.TorusGeometry(params.handleRad,
                                                 params.handleTube,
                                                 params.radialSeg,
                                                 params.radialSeg,
                                                 params.handleArc);
        var handleMat = ladderMat.ladder;
        var handleMesh = new THREE.Mesh(handleGeom,handleMat);
        return handleMesh;
    }

    /* Build the entire swimming pool, with inner and outer pools, a water cube and a side ladder */
    function createPoolScene(params) {
        poolObj = new THREE.Object3D();

        //======================================================
        // create pool
        /// create inner tiled pool and add it to poolObj
        var innerPool = createInnerPool(params);
        poolObj.add(innerPool);

        /// create outer pink pool and add it to poolObj
        var outerPool = createOuterPool(params);
        outerPool.position.y = -1;
        poolObj.add(outerPool);

        /// create planes of pool and add them to poolObj
        var plane1 = createPoolPlane(params);
        plane1.rotation.x = Math.PI/2;
        var plane1PosX = (params.innerPoolWidth + params.outerPoolWidth)/4;
        var plane1PosY = params.innerPoolHeight/2;
        plane1.position.set(plane1PosX,plane1PosY,0);
        poolObj.add(plane1);

        var plane2 = plane1.clone();
        plane2.position.x = -plane1PosX;
        poolObj.add(plane2);

        var plane3 = createPoolPlane(params);
        plane3.rotation.set(Math.PI/2,0,Math.PI/2);
        var plane3PosZ = (params.innerPoolWidth + params.outerPoolWidth)/4;
        plane3.position.set(0,plane1PosY,plane3PosZ);
        poolObj.add(plane3);

        var plane4 = plane3.clone();
        plane4.position.z = -plane3PosZ;
        poolObj.add(plane4);

        //======================================================
        // create water cube with bezier top surface and add it to poolObj
        waterCube = createWaterCube(params);
        waterCube.position.y = params.float;
        poolObj.add(waterCube);

        //======================================================
        // create ladder
        /// create ladder handles and add them to poolObj
        handle1 = createLadderHandle(params);
        var handlePosX = -params.waterCubeWidth/2;
        var handlePosY = params.float + params.waterCubeHeight/2 - 0.5;
        handle1.position.set(handlePosX, handlePosY, 0);
        poolObj.add(handle1);

        handle2 = handle1.clone();
        handle2.position.z = -params.stepWidth;
        poolObj.add(handle2);

        /// create ladder sides (vertical) and add them to poolObj
        ladderSide1 = createLadderSide(params);
        var ladderPosX = handlePosX - params.handleRad;
        var ladderPosY = (params.float+ params.waterCubeHeight - params.extraHeight)/2;
        ladderSide1.position.set(ladderPosX, ladderPosY, 0);
        poolObj.add(ladderSide1);

        ladderSide2 = ladderSide1.clone();
        ladderSide2.position.z = -params.stepWidth;
        poolObj.add(ladderSide2);

        /// create ladder steps (horizontal) and add them to poolObj
        var step;
        var numSteps = (params.float + params.extraHeight)/ params.stepGap;
        steps = new THREE.Object3D();
        for (i = 0; i < numSteps; i++){
            step = createLadderStep(params);
            step.position.set(ladderPosX, handlePosY - (i*params.stepGap), -params.stepWidth/2);
            step.rotation.x = Math.PI/2;
            steps.add(step);
        }
        poolObj.add(steps);

        // return pool object
        return poolObj;

        /*
          Create and return an inner tiled pool with a transparent top face
          Frame: Origin is in the center of the pool
          Size: Goes from -innerPoolWidth/2 to +innerPoolWidth/2
          Colors: Tiled texture
        */
        function createInnerPool(params) {
            var poolGeom = new THREE.BoxGeometry(params.innerPoolWidth,
                                                 params.innerPoolHeight,
                                                 params.innerPoolDepth);
            //set the top of the pool at transparent, sides as pool texture
            TW.setMaterialForFaces(poolGeom,0,0,1,2,3,6,7,8,9,10,11);
            TW.setMaterialForFaces(poolGeom,1,4,5);
            var poolMesh = new THREE.Mesh( poolGeom, textureMat );
            return poolMesh;
        }

        /*
          Create and return an outer pink pool with a transparent top face
          Frame: Origin is in the center of the pool
          Size: Goes from -outerPoolWidth/2 to +outerPoolWidth/2
          Colors: Light pink phong material
        */
        function createOuterPool(params) {
            var poolGeom = new THREE.BoxGeometry(params.outerPoolWidth,
                                                 params.outerPoolHeight,
                                                 params.outerPoolDepth);
            //set the top of the pool at transparent, sides as light pink
            TW.setMaterialForFaces(poolGeom,2,0,1,2,3,6,7,8,9,10,11);
            TW.setMaterialForFaces(poolGeom,1,4,5);
            var poolMesh = new THREE.Mesh( poolGeom, textureMat );
            return poolMesh;
        }

        /*
          Create and return a plane to connect the inner and outer pools
          Frame: Origin is the center of the rectangular plane
          Size: Goes from -poolPlaneWidth/2 to +poolPlaneWidth/2
          Colors: White phong material
        */
        function createPoolPlane(params) {
            var planeGeom = new THREE.PlaneGeometry(params.poolPlaneWidth,
                                                    params.poolPlaneHeight,
                                                    params.radialSeg);
            var planeMat = new THREE.MeshPhongMaterial( {color: THREE.ColorKeywords.white,
                                                         side: THREE.DoubleSide});
            var planeMesh = new THREE.Mesh(planeGeom, planeMat);
            return planeMesh;
        }

        /*
          Create and return a floating water cube with a bezier top surface
          Frame: Origin is the center of the box geometry
          Size: Goes from -waterCubeWidth/2 to +waterCubeWidth/2
          Colors: Water textured material
        */
        function createWaterCube(params) {
            waterCube = new THREE.Object3D;

            //create water body
            var waterGeom = new THREE.BoxGeometry(params.waterCubeWidth,
                                                  params.waterCubeHeight,
                                                  params.waterCubeDepth);
            TW.setMaterialForFaces(waterGeom,3,0,1,2,3,6,7,8,9,10,11);
            TW.setMaterialForFaces(waterGeom,1,4,5);
            var waterMesh = new THREE.Mesh(waterGeom, textureMat);
            waterMesh.castShadow = true;
            waterCube.add(waterMesh);

            //create bezier water surface
            waterSurface = createWaterSurface(params);
            var waterSurfX = -params.innerPoolWidth/2;
            var waterSurfY = -params.waterCubeHeight/2;
            var waterSurfZ = params.waterCubeDepth/2;
            waterSurface.position.set(waterSurfX, waterSurfY, waterSurfZ);
            waterSurface.rotation.x = -Math.PI/2;
            waterCube.add(waterSurface);

            return waterCube;
        }

        /*
          Create and return a ladder side
          Frame: Origin is the center of the torus geometry
          Size: Goes from -handleTube to +handleTube
          Colors: Silver textured material
        */
        function createLadderSide(params) {
            var ladderSideGeom = new THREE.CylinderGeometry(params.handleTube,
                                                            params.handleTube,
                                                            params.float + params.extraHeight,
                                                            params.radialSeg);
            var ladderSideMat = ladderMat.ladder;
            var ladderSideMesh = new THREE.Mesh(ladderSideGeom,ladderSideMat);
            return ladderSideMesh;
        }

        /*
          Create and return a ladder step
          Frame: Origin is the center of the torus geometry
          Size: Goes from -stepRad to +stepRad
          Colors: Silver textured material
        */
        function createLadderStep(params) {
            var ladderStepGeom = new THREE.CylinderGeometry(params.stepRad,
                                                            params.stepRad,
                                                            params.stepWidth,
                                                            params.radialSeg);
            var ladderStepMat = ladderMat.ladder;
            var ladderStepMesh = new THREE.Mesh(ladderStepGeom,ladderStepMat);
            return ladderStepMesh;
        }
    }

    /* Create and return a quarter circular stair */
    function createQuarterStairs(params) {
        var cirStairs = new THREE.Object3D();

        // stair material for all steps
        var cirStairMat = new THREE.MeshPhongMaterial({
                                color: THREE.ColorKeywords.lightpink,
                                side: THREE.DoubleSide,
                                shading: THREE.SmoothShading});

        // bottom step
        var stepGeom1 = new THREE.CylinderGeometry(params.cirStairRad,
                                               params.cirStairRad,
                                               params.cirStairHeight,
                                               params.radialSeg,
                                               params.radialSeg,
                                               false,
                                               params.cirStairTS,
                                               params.cirStairTLQuarter);
        var stepMesh1 = new THREE.Mesh(stepGeom1,cirStairMat);

        // third step
        var stepGeom2 = new THREE.CylinderGeometry(params.cirStairRad * 0.8,
                                               params.cirStairRad* 0.8,
                                               params.cirStairHeight,
                                               params.radialSeg,
                                               params.radialSeg,
                                               false,
                                               params.cirStairTS,
                                               params.cirStairTLQuarter);
        var stepMesh2 = new THREE.Mesh(stepGeom2,cirStairMat);

        // second step
        var stepGeom3 = new THREE.CylinderGeometry(params.cirStairRad * 0.6,
                                               params.cirStairRad* 0.6,
                                               params.cirStairHeight,
                                               params.radialSeg,
                                               params.radialSeg,
                                               false,
                                               params.cirStairTS,
                                               params.cirStairTLQuarter);
        var stepMesh3 = new THREE.Mesh(stepGeom3,cirStairMat);

        // top step
        var stepGeom4 = new THREE.CylinderGeometry(params.cirStairRad * 0.4,
                                               params.cirStairRad* 0.4,
                                               params.cirStairHeight,
                                               params.radialSeg,
                                               params.radialSeg,
                                               false,
                                               params.cirStairTS,
                                               params.cirStairTLQuarter);
        var stepMesh4 = new THREE.Mesh(stepGeom4,cirStairMat);

        // position steps within cirStair object
        stepMesh1.position.y = params.cirStairHeight * 0.5;
        stepMesh2.position.y = params.cirStairHeight* 1.5;
        stepMesh3.position.y = params.cirStairHeight * 2.5;
        stepMesh4.position.y = params.cirStairHeight * 3.5;

        // add them to cirStair object
        cirStairs.add(stepMesh1);
        cirStairs.add(stepMesh2);
        cirStairs.add(stepMesh3);
        cirStairs.add(stepMesh4);

        return cirStairs;
    }

    /* Create and return a circular stair */
    function createCircularStairs(params) {
        var cirStairs = new THREE.Object3D();

        // stair material
        var cirStairMat = marbleMaterials.whiteMarble;

        // bottom step
        var stepGeom1 = new THREE.CylinderGeometry(params.cirStairRad,
                                               params.cirStairRad,
                                               params.cirStairHeight,
                                               params.radialSeg,
                                               params.radialSeg,
                                               false,
                                               params.cirStairTS,
                                               params.cirStairTLFull);
        var stepMesh1 = new THREE.Mesh(stepGeom1,cirStairMat);

        // third step
        var stepGeom2 = new THREE.CylinderGeometry(params.cirStairRad * 0.8,
                                               params.cirStairRad* 0.8,
                                               params.cirStairHeight,
                                               params.radialSeg,
                                               params.radialSeg,
                                               false,
                                               params.cirStairTS,
                                               params.cirStairTLFull);
        var stepMesh2 = new THREE.Mesh(stepGeom2,cirStairMat);

        // second step
        var stepGeom3 = new THREE.CylinderGeometry(params.cirStairRad * 0.6,
                                               params.cirStairRad* 0.6,
                                               params.cirStairHeight,
                                               params.radialSeg,
                                               params.radialSeg,
                                               false,
                                               params.cirStairTS,
                                               params.cirStairTLFull);
        var stepMesh3 = new THREE.Mesh(stepGeom3,cirStairMat);

        // top step
        var stepGeom4 = new THREE.CylinderGeometry(params.cirStairRad * 0.4,
                                               params.cirStairRad* 0.4,
                                               params.cirStairHeight,
                                               params.radialSeg,
                                               params.radialSeg,
                                               false,
                                               params.cirStairTS,
                                               params.cirStairTLFull);
        var stepMesh4 = new THREE.Mesh(stepGeom4,cirStairMat);

        // position steps within cirStair object
        stepMesh1.position.y = params.cirStairHeight * 0.5;
        stepMesh2.position.y = params.cirStairHeight* 1.5;
        stepMesh3.position.y = params.cirStairHeight * 2.5;
        stepMesh4.position.y = params.cirStairHeight * 3.5;

        // add them to cirStair object
        cirStairs.add(stepMesh1);
        cirStairs.add(stepMesh2);
        cirStairs.add(stepMesh3);
        cirStairs.add(stepMesh4);

        return cirStairs;
    }

    /* Create and return a wall arch */
    function createWallArch() {
        var arch = new THREE.Shape();

        arch.moveTo(0, 0);
        arch.lineTo(0, 60);
        arch.lineTo(40, 60);
        arch.lineTo(40, 0);
        arch.lineTo(33, 0);
        arch.moveTo(33, 0);
        arch.bezierCurveTo(33, 55, 7, 55, 7, 0);
        arch.moveTo(7, 0);
        arch.lineTo(0, 0);

        var extrudeSettings = {curveSegments: 32, amount: 5, bevelEnabled: true,
                               bevelSegments: 2, steps: 2, bevelSize: 1, bevelThickness: 1};

        var archGeom = new THREE.ExtrudeGeometry(arch, extrudeSettings);

        var archMesh = new THREE.Mesh(archGeom,
        new THREE.MeshPhongMaterial({color: THREE.ColorKeywords.white}));

        return archMesh;
    }

    /* Create and return a ring buoy */
    function createRingBuoy(params) {
        var buoyGeom = new THREE.TorusGeometry( params.ringRad, params.ringTube, params.radialSeg, params.radialSeg );
        var buoyMat = stripeMaterial.pwStripe;
        var buoy = new THREE.Mesh( buoyGeom, buoyMat );
        return buoy;
    }

    // frame accumulater for floating balls
    var floatingballsFrames = 0;
    /* Animate the floating balls by modifying their rotation based on frame number */
    function animatefloatingballs(sceneBox, params) {
        // remove floatingballs from scene
        if (floatingballs != null){
          sceneBox.remove(floatingballs);
        }

        floatingballs = createAllFloatingBalls(params);
        floatingballs.rotation.y = floatingballsFrames * (Math.PI/6);
        floatingballs.position.y = 15;
        sceneBox.add(floatingballs);

        floatingballsFrames += 1;
        TW.render();
    }
    // animate the floating light balls every 0.8 second
    setInterval(function(){ animatefloatingballs(sceneBox, poolParams) }, 800);

    /* Create and return a floating ball */
    function createFloatingBall(params) {
        var floatingball = new THREE.Object3D();

        var outerMat = new THREE.MeshPhongMaterial({color: THREE.ColorKeywords.pink,
                                                     emissive: THREE.ColorKeywords.pink,
                                                     transparent: true,
                                                     opacity: 0.3});
        var outerGeom =  new THREE.SphereGeometry(params.marbleBallR, params.radialSeg, params.radialSeg);
        var outerBall = new THREE.Mesh(outerGeom, outerMat);
        outerBall.castShadow = true;

        var innerMat = marbleMaterials.pinkMarble;
        var innerGeom =  new THREE.SphereGeometry(params.marbleBallR * 0.7, params.radialSeg, params.radialSeg);
        var innerBall = new THREE.Mesh(innerGeom, innerMat);

        floatingball.add(outerBall);
        floatingball.add(innerBall);

        return floatingball;
    }

    /* Create and return a floatingballs object to contain all floating balls */
    function createAllFloatingBalls(params) {
        floatingballs = new THREE.Object3D();

        var floatingball1 = createFloatingBall(params);
        var floatingball2 = createFloatingBall(params);
        var floatingball3 = createFloatingBall(params);
        var floatingball4 = createFloatingBall(params);
        var floatingball5 = createFloatingBall(params);
        var floatingball6 = createFloatingBall(params);

        // position each floatingball
        floatingball1.position.y += 40;
        floatingball1.position.x += 25;
        floatingball1.position.z -= 35;
        floatingball2.position.copy(floatingball1.position);
        floatingball2.position.x -= 45;
        floatingball2.position.z -= 50;
        floatingball2.scale.set(1.2,1.2,1.2);
        floatingball3.position.copy(floatingball1.position);
        floatingball3.position.y -= 30;
        floatingball3.position.z += 60;
        floatingball3.scale.set(0.7,0.7,0.7);
        floatingball4.position.copy(floatingball1.position);
        floatingball4.position.x += 30;
        floatingball4.position.z -= 40;
        floatingball4.position.y -= 15;
        floatingball4.scale.set(0.8,0.8,0.8);
        floatingball5.position.copy(floatingball1.position);
        floatingball5.position.x += 50;
        floatingball5.position.z += 40;
        floatingball5.position.y -= 20;
        floatingball5.scale.set(1.1,1.1,1.1);
        floatingball6.position.copy(floatingball1.position);
        floatingball6.position.x -= 60;
        floatingball6.position.z += 50;
        floatingball6.position.y -= 30;
        floatingball6.scale.set(0.8,0.8,0.8);

        // add each floatingball to floatingballs object
        floatingballs.add(floatingball1);
        floatingballs.add(floatingball2);
        floatingballs.add(floatingball3);
        floatingballs.add(floatingball4);
        floatingballs.add(floatingball5);
        floatingballs.add(floatingball6);

        return floatingballs;
    }

    /* Create and return a beach chair */
    function createBeachChair(params) {
        var chair = new THREE.Object3D();

        function createBase() {
            var base = new THREE.Shape();

            base.moveTo(0, 0);
            base.lineTo(1, 5);
            base.lineTo(19, 5);
            base.lineTo(20, 0);
            base.lineTo(19, 0);
            base.lineTo(18, 3);
            base.lineTo(2, 3);
            base.lineTo(1, 0);
            base.lineTo(0, 0);

            var extrudeSettings = { curveSegments: 32, amount: 0.5, bevelEnabled: true, bevelSegments: 4, steps: 2, bevelSize: 1, bevelThickness: 1 };
            var baseGeom = new THREE.ExtrudeGeometry( base, extrudeSettings );
            var baseMesh = new THREE.Mesh( baseGeom,
                                      new THREE.MeshPhongMaterial({color: THREE.ColorKeywords.silver}) );
            baseMesh.castShadow = true;
            return baseMesh;
        }

        function createSeat() {
            var seat = new THREE.Shape();

            seat.moveTo(0, 0);
            seat.lineTo(-7, 7);
            seat.lineTo(-6, 8);
            seat.lineTo(0, 2);
            seat.lineTo(18, 2);
            seat.lineTo(19, 0);
            seat.lineTo(0, 0);

            var extrudeSettings = { curveSegments: 32, amount: 12, bevelEnabled: true, bevelSegments: 4, steps: 2, bevelSize: 1, bevelThickness: 3 };
            var seatGeom = new THREE.ExtrudeGeometry( seat, extrudeSettings );
            var seatMesh = new THREE.Mesh( seatGeom,
                                      stripeMaterial.pwStripe );
            seatMesh.castShadow = true;
            return seatMesh;
        }

        var base1 = createBase();
        var base2 = createBase();
        var seat = createSeat();

        // position the meshes
        base2.position.z = 1.5*params.seatDep;
        seat.position.set(1, 5, 0);

        // add bases and seat to chair object
        chair.add(base1);
        chair.add(base2);
        chair.add(seat);
        return chair;
    }

    /* Create and return a surfboard */
    function createSurfboard() {
        var surfboard = new THREE.Shape();

        surfboard.moveTo(0, 0);
        surfboard.bezierCurveTo(3, 3, 3, 8, 0, 10);
        surfboard.moveTo(0, 10);
        surfboard.bezierCurveTo(-3, 8, -3, 3, 0, 0);

        var extrudeSettings = { curveSegments: 32, amount: 0.3, bevelEnabled: true, bevelSegments: 4, steps: 2, bevelSize: 1, bevelThickness: 3 };
        var surfboardGeom = new THREE.ExtrudeGeometry( surfboard, extrudeSettings );
        var surfboardMat = new THREE.MeshPhongMaterial({color: THREE.ColorKeywords.lightblue});
        var surfboardMesh = new THREE.Mesh(surfboardGeom, surfboardMat);
        surfboardMesh.castShadow = true;
        return surfboardMesh;
    }

    /*
     * Main function to create a flamingo (borrowed and modified based on
     * ‘mbritt_flamingo’ in CS307 student contribution library)
     */
    function createFlamingo(flamingoParams) {

        // the functions below access these variables non-locally.
        // it's initialized in the main code at the bottom
        var birdFrame;

        // Helper function for body lathe
        function makeVertices(points) {
            var i;
            var pts = [];
            for (i=0; i<points.length; i++) {
                var p = new THREE.Vector3();
                p.x = points[i][0];
                p.y = points[i][1];
                p.z = 0;
                pts.push(p);
            }
            return pts;
        }

        // Create body and add to body frame
        function addBody(head) {
            var bodyFrame = new THREE.Object3D();
            var bodyPoints = [
                [0, flamingoParams.bodyLength/1.5],
                [flamingoParams.bodyWidth * .75, flamingoParams.bodyLength/4],
                [flamingoParams.bodyWidth, 0],
                [flamingoParams.bodyWidth * .75, -1 * flamingoParams.bodyLength/4],
                [0, -1 * flamingoParams.bodyLength/1.5]]
            // Use points from spline curve to get smoother curve for lathe geometry
            var curve = new THREE.CatmullRomCurve3(makeVertices(bodyPoints));
            var vertices = curve.getPoints(100);
            var bodyGeom = new THREE.LatheGeometry(vertices);
            var bodyMat = flamingoMaterials.feathers;
            var bodyMesh = new THREE.Mesh(bodyGeom, bodyMat);
            bodyMesh.castShadow = true;
            bodyMesh.rotateX(Math.PI/2);
            bodyMesh.scale.x = flamingoParams.bodyScale;
            bodyMesh.scale.y = flamingoParams.bodyScale;
            bodyMesh.scale.z = flamingoParams.bodyScale;
            bodyFrame.add(bodyMesh);
            var neck = createNeck();
            neck.add(head);
            head.position.set(0, flamingoParams.neckLength * .8, flamingoParams.bodyLength/1.75);
            neck.position.set(0, 0, flamingoParams.bodyLength/1.5);
            bodyFrame.add(neck);
            addAngledLeg(bodyFrame);
            addStraightLeg(bodyFrame);
            birdFrame.add(bodyFrame);
        }

        // Create neck using cylinder
        function createNeck() {
            var neckFrame = new THREE.Object3D();
            // Points of neck are created from spline
            // Neck curve is approximately "S" shape
            var neckPoints = [
                [ 0, -.2 * flamingoParams.neckLength], // Begin slightly in body
                [ 0, 0],
                [ flamingoParams.neckLength * .25, flamingoParams.neckLength * .01],
                [ flamingoParams.neckLength * .75, -.2 * flamingoParams.neckLength],
                [ flamingoParams.neckLength * .8, -.1 * flamingoParams.neckLength]
            ]
            var curve = new THREE.CatmullRomCurve3(makeVertices(neckPoints));
            var neckGeom = new THREE.TubeGeometry(curve,
                                                  flamingoParams.segments,
                                                  flamingoParams.neckRadius,
                                                  flamingoParams.segments,
                                                  false);
            var neckMat = flamingoMaterials.feathers;
            var neckMesh = new THREE.Mesh(neckGeom, neckMat);
            neckMesh.castShadow = true;
            neckFrame.add(neckMesh);
            neckFrame.rotateZ(Math.PI/2);
            neckFrame.rotateX(Math.PI/2);
            gneck = neckMesh;
            return neckFrame;
        }

        // Create and return head using sphere
        function createHead() {
            var headFrame = new THREE.Object3D();
            var headMat = flamingoMaterials.feathers;
            var headGeom = new THREE.SphereGeometry(flamingoParams.headWidth * 1.5,
                                                    flamingoParams.segments,
                                                    flamingoParams.segments);
            var headMesh = new THREE.Mesh(headGeom, headMat);
            headMesh.castShadow = true;
            headFrame.add(headMesh);
            addEye(headFrame, -1); // Left eye
            addEye(headFrame, 1); // Right eye
            return headFrame;
        }

        // Add eyes to head, bodySide is represented by 1: right, -1: left
        function addEye(head, bodySide) {
            var eye = new THREE.Object3D();
            var eyeGeom = new THREE.SphereGeometry(flamingoParams.eyeRadius,
                                                   flamingoParams.segments,
                                                   flamingoParams.segments);
            var eyeMesh = new THREE.Mesh(eyeGeom, flamingoMaterials.eyes);
            eyeMesh.castShadow = true;
            eye.add(eyeMesh);
            eye.position.set(flamingoParams.headWidth * 1.5 * bodySide, 0, 0);
            head.add(eye);
        }

        // Add beak to head frame
        function addBeak(head) {
            var beakFrame = new THREE.Object3D();
            yellowBeakMat = flamingoMaterials.upperBeak; // yellow
            blackBeakMat = flamingoMaterials.lowerBeak; // black
            var upperBeakGeom = new THREE.CylinderGeometry(flamingoParams.headWidth * 1.25,
                                                           flamingoParams.headWidth * .5,
                                                           flamingoParams.headWidth * 3,
                                                           flamingoParams.segments);
            var upperBeakMesh = new THREE.Mesh(upperBeakGeom, yellowBeakMat);
            upperBeakMesh.castShadow = true;

            var middleBeakGeom = new THREE.SphereGeometry(flamingoParams.headWidth * .6,
                                                          flamingoParams.segments,
                                                          flamingoParams.segments);
            var middleBeakMesh = new THREE.Mesh(middleBeakGeom, blackBeakMat);
            middleBeakMesh.castShadow = true;
            // position beak at top of upper beak
            middleBeakMesh.position.set(0, flamingoParams.headWidth * -1.75, 0);

            var lowerBeakGeom = new THREE.CylinderGeometry(flamingoParams.headWidth * .5,
                                                           flamingoParams.headWidth * .1,
                                                           flamingoParams.headWidth * 2,
                                                           flamingoParams.segments);

            // lower beak is almost perpendicular to neck
            var lowerBeakMesh = new THREE.Mesh(lowerBeakGeom, blackBeakMat);
            lowerBeakMesh.castShadow = true;
            lowerBeakMesh.position.set(0,
                                       flamingoParams.headWidth * -2,
                                       flamingoParams.headWidth * -1.1);
            lowerBeakMesh.rotation.x = THREE.Math.degToRad(75);

            beakFrame.add(upperBeakMesh);
            beakFrame.add(middleBeakMesh);
            beakFrame.add(lowerBeakMesh);
            // position beak in front of head
            beakFrame.position.set(0,
                                   -0.8 * flamingoParams.headWidth,
                                   flamingoParams.headWidth * 1.5);
            beakFrame.rotation.x = THREE.Math.degToRad(-60);
            head.add(beakFrame);
        }

        // Create straight leg using 2 cylinders and sphere
        function addStraightLeg(body) {
            var legFrame = new THREE.Object3D();
            var upperLegGeom = new THREE.CylinderGeometry(flamingoParams.legRadius,
                                                          flamingoParams.legRadius * .9,
                                                          flamingoParams.legLength/2,
                                                          flamingoParams.segments,
                                                          flamingoParams.segments);
            var jointGeom = new THREE.SphereGeometry(flamingoParams.legRadius * 1.5,
                                                     flamingoParams.segments,
                                                     flamingoParams.segments);
            var lowerLegGeom = new THREE.CylinderGeometry(flamingoParams.legRadius * .9,
                                                          flamingoParams.legRadius * .75,
                                                          flamingoParams.legLength/2,
                                                          flamingoParams.segments,
                                                          flamingoParams.segments);
            var legMat = flamingoMaterials.legs;

            var upperLegMesh = new THREE.Mesh(upperLegGeom, legMat);
            var jointMesh = new THREE.Mesh(jointGeom, legMat);
            var lowerLegMesh = new THREE.Mesh(lowerLegGeom, legMat);
            upperLegMesh.castShadow = true;
            jointMesh.castShadow = true;
            lowerLegMesh.castShadow = true;

            jointMesh.position.set(0, flamingoParams.bodyWidth * -.5, 0);
            lowerLegMesh.position.set(0, flamingoParams.bodyWidth * -1, 0);

            var foot = createFoot();
            foot.position.set(0, flamingoParams.legLength * -.55, 0);

            legFrame.add(foot);
            legFrame.add(upperLegMesh);
            legFrame.add(jointMesh);
            legFrame.add(lowerLegMesh);
            legFrame.position.set(flamingoParams.bodyWidth/-2, flamingoParams.bodyWidth * -1, 0); //Start leg inside body

            body.add(legFrame);
        }

        // Create angled leg using 2 cylinders and sphere, approximately > shape
        function addAngledLeg(body) {
            var legFrame = new THREE.Object3D();
            var upperLegGeom = new THREE.CylinderGeometry(flamingoParams.legRadius,
                                                          flamingoParams.legRadius * .9,
                                                          flamingoParams.legLength/2,
                                                          flamingoParams.segments,
                                                          flamingoParams.segments);
            var jointGeom = new THREE.SphereGeometry(flamingoParams.legRadius * 1.5,
                                                     flamingoParams.segments,
                                                     flamingoParams.segments);
            var lowerLegGeom = new THREE.CylinderGeometry(flamingoParams.legRadius * .9,
                                                          flamingoParams.legRadius * .75,
                                                          flamingoParams.legLength/2,
                                                          flamingoParams.segments,
                                                          flamingoParams.segments);
            var legMat = flamingoMaterials.legs;

            var upperLegMesh = new THREE.Mesh(upperLegGeom, legMat);
            var jointMesh = new THREE.Mesh(jointGeom, legMat);
            var lowerLegMesh = new THREE.Mesh(lowerLegGeom, legMat);
            upperLegMesh.castShadow = true;
            jointMesh.castShadow = true;
            lowerLegMesh.castShadow = true;

            upperLegMesh.rotation.x = THREE.Math.degToRad(45); //rotate backwards
            jointMesh.position.set(0, flamingoParams.bodyWidth * -.5, flamingoParams.bodyWidth * -.5);
            lowerLegMesh.position.set(0, flamingoParams.bodyWidth * -1, 0);
            lowerLegMesh.rotation.x = THREE.Math.degToRad(-45); //rotate forwards

            // foot should be placed at edge of second tube making leg
            var foot = createFoot();
            foot.position.set(0, flamingoParams.legLength * -.45, flamingoParams.bodyWidth * .3 + flamingoParams.footRadius);
            foot.rotation.z = THREE.Math.degToRad(30); //rotate foot to be at slight tilt

            legFrame.add(foot);
            legFrame.add(upperLegMesh);
            legFrame.add(jointMesh);
            legFrame.add(lowerLegMesh);

            legFrame.position.set(flamingoParams.bodyWidth/2, flamingoParams.bodyWidth * -1, 0); //Start leg inside body
            body.add(legFrame);
        }

        // Create foot
        function createFoot() {
            var footGeom = new THREE.SphereGeometry(flamingoParams.footRadius, 3, 2);
            var foot = new THREE.Mesh(footGeom, flamingoMaterials.legs);
            foot.castShadow = true;

            foot.rotation.y = THREE.Math.degToRad(90);
            foot.scale.y = .5;
            foot.scale.x = 2;
            return foot;
        }

        // Create a flamingo object
        birdFrame = new THREE.Object3D();

        // Create a head and add beak and body to head
        var head = createHead();
        addBeak(head);
        addBody(head);

        // Add head to birdFrame
        birdFrame.add(head);
        return birdFrame;
    }

    /* Create and return a sceneBox which contains all minimal objects in the scene */
    function createSceneBox(params) {
        // create a box that will contain the whole scene
        var boxGeom = new THREE.BoxGeometry(params.sceneBoxWidth,
                                            params.sceneBoxHeight,
                                            params.sceneBoxDepth);

        // create an array of 6 Phong materials from an array of colors for the inner
        // faces of the box
        var materialArray = [];
        var sceneBoxMat = ladderMat.ladder;
        for (var i = 0; i < 6; i++) {
            materialArray.push(new THREE.MeshPhongMaterial({
                                        color: THREE.ColorKeywords.white,
                                        side: THREE.BackSide}));
        }

        // create mesh face material and a room mesh, and add the mesh to the scene
        var boxMaterial = new THREE.MeshFaceMaterial(materialArray);
        boxMesh = new THREE.Mesh(boxGeom, boxMaterial);
        boxMesh.receiveShadow = true;

        return boxMesh;
    }

    /* Add texture to the top and walls of the sceneBox */
    function displayGradientTexture(texture) {
        var gradientMaterial = new THREE.MeshPhongMaterial({
                                         color: 0xffffff,
                                         side: THREE.BackSide,
                                         map: texture});
        // set the material of the sceneBox to be the gradient texture
        boxMesh.material.materials[0] = gradientMaterial;
        boxMesh.material.materials[1] = gradientMaterial;
        boxMesh.material.materials[2] = gradientMaterial;
        boxMesh.material.materials[4] = gradientMaterial;
        boxMesh.material.materials[5] = gradientMaterial;

        TW.render();
    }

    /* Add texture to the ground of the sceneBox */
    function displayMarbleTexture(texture) {
        var marbleMaterials = new THREE.MeshPhongMaterial({
                                        color: 0xffffff,
                                        side: THREE.BackSide,
                                        map: texture});
        boxMesh.material.materials[3] = marbleMaterials;

        TW.render();
    }

    /*
     * Call back function for GUI interactions
     * Modify the position and rotation of certain objects based on slider values
     */
    function redrawScene() {
        // reposition scene objects ('float')
        var standardH = -poolParams.sceneBoxHeight/2 + poolParams.float - 5;

        waterCube.position.y = poolParams.float;
        handle1.position.y = poolParams.float + poolParams.waterCubeHeight/2;
        handle2.position.y = poolParams.float + poolParams.waterCubeHeight/2;
        ladderSide1.position.y = poolParams.float - poolParams.handleRad;
        ladderSide2.position.y = poolParams.float - poolParams.handleRad;
        steps.position.y = poolParams.float - 5;
        buoy.position.y = -(poolParams.sceneBoxHeight/2 - poolParams.outerPoolHeight/2)
                          + poolParams.float + poolParams.extraHeight;
        beachChair1.position.y = standardH;
        beachChair2.position.y = standardH;
        flamingo1.position.y = -poolParams.sceneBoxHeight/2.6 + poolParams.float;
        flamingo2.position.y = -poolParams.sceneBoxHeight/2.4 + poolParams.float;
        surfboard1.position.y = standardH + 5;
        surfboard2.position.y = standardH + 5;
        quarterStairs.position.y = standardH;
        circularStairs.position.y = standardH;
        arch1.position.y = standardH;
        arch2.position.y = standardH;
        arch3.position.y = standardH;
        stairBall.position.y = -poolParams.sceneBoxHeight/2 + 4*poolParams.cirStairHeight +
                               0.5*poolParams.marbleBallR + poolParams.float;

        // rotate scene objects ('rotate')
        buoy.rotation.set(poolParams.rotate + Math.PI/7, poolParams.rotate - Math.PI/4, poolParams.rotate + Math.PI/9)
        beachChair1.rotation.y = poolParams.rotate + Math.PI/4;
        beachChair2.rotation.y = poolParams.rotate + Math.PI/4;
        flamingo1.rotation.y = poolParams.rotate + Math.PI/8;
        flamingo2.rotation.y = poolParams.rotate + Math.PI/8;
        surfboard1.rotation.x = Math.abs(poolParams.rotate + Math.PI/4);
        surfboard2.rotation.x = Math.abs(poolParams.rotate + Math.PI/4);
        circularStairs.rotation.set(poolParams.rotate/6,poolParams.rotate/6,poolParams.rotate/6);
        stairBall.rotation.set(poolParams.rotate/6,poolParams.rotate/6,poolParams.rotate/6);

        TW.render();
    }

    // Set up a GUI for user interaction
    var gui = new dat.GUI();

    gui.add(poolParams,'float', 5, 30).onChange(redrawScene);
    gui.add(poolParams,'rotate', -Math.PI/2, Math.PI/2).onChange(redrawScene);
}
