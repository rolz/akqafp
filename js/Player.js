var Player = function(game, scene, gamepad) {

    this.game = game;
    this.scene = scene;
    this.gamePad = gamepad;
    this.camera = this.scene.activeCamera;
    this.startPos = this.camera.position;
    this.ball = null;
    this.ballCount = 0;
    this.cups = [];
    var score = 0;

    /*************************************/
    /* CUPS - blender
    /************************************/

    var that = this;
    var newMeshes = [];

    BABYLON.SceneLoader.ImportMesh("Cube.000", "assets/", "boxCup.babylon", this.scene, function (newMeshes) {
        console.log(newMeshes);

        var parent = newMeshes[0],
            c1     = newMeshes[1],
            c2     = newMeshes[2],
            c3     = newMeshes[3],
            c4     = newMeshes[4];

        parent.isVisible = false;
        c1.isVisible     = false;
        c2.isVisible     = false;
        c3.isVisible     = false;
        c4.isVisible     = false;

        PARENT_MODEL = parent;
        C1_MODEL     = c1;
        C2_MODEL     = c2;
        C3_MODEL     = c3;
        C4_MODEL     = c4;

        var scalings = {
            pX: 5,
            pY: 0.5,
            pZ: 5,
            c1X: 0.5,
            c1Y: 5,
            c1Z: 5,
            c2X: 5,
            c2Y: 5,
            c2Z: 0.5,
            c3X: 5,
            c3Y: 5,
            c3Z: 0.5,
            c4X: 0.5,
            c4Y: 5,
            c4Z: 5
        }

        var positions = {
            pX: 0,
            pY: 0.5,
            pZ: 0,
            c1X: 5.5,
            c1Y: 5,
            c1Z: 0,
            c2X: 0,
            c2Y: 5,
            c2Z: -5.5,
            c3X: 0,
            c3Y: 5,
            c3Z: 5.5,
            c4X: -5.5,
            c4Y: 5,
            c4Z: 0
        }

        var positions2 = {
            pX: -20,
            pY: 0.5,
            pZ: 0,
            c1X: -14.5,
            c1Y: 5,
            c1Z: 0,
            c2X: -20,
            c2Y: 5,
            c2Z: -5.5,
            c3X: -20,
            c3Y: 5,
            c3Z: 5.5,
            c4X: -25.5,
            c4Y: 5,
            c4Z: 0
        }

        var positions3 = {
            pX: 20,
            pY: 0.5,
            pZ: 0,
            c1X: 25.5,
            c1Y: 5,
            c1Z: 0,
            c2X: 20,
            c2Y: 5,
            c2Z: -5.5,
            c3X: 20,
            c3Y: 5,
            c3Z: 5.5,
            c4X: 14.5,
            c4Y: 5,
            c4Z: 0
        }

        that.createCup(1,scalings, positions);
        that.createCup(2,scalings, positions2);
        that.createCup(3,scalings, positions3);

    });

    /* GAMEPAD*/
    this.scene.registerBeforeRender(function() {

        if (that.ball && that.cups) {

        /* TRY AND FIGURE OUT HOW TO MAKE THE BOX MESHES MERGE ON PHYSICS MOVE */
        // if (that.ball && that.cupParentMesh && that.rightSide && that.frontSide && that.backSide && that.leftSide) {
        //
        //     // check if walls are touched and add remove physics
        //     if (that.ball.intersectsMesh(that.rightSide, false)) {
        //         console.log("hello");
        //     }
        //
        //     if (that.ball.intersectsMesh(that.frontSide, false)) {
        //         console.log("hello");
        //     }
        //
        //     if (that.ball.intersectsMesh(that.backSide, false)) {
        //         console.log("hello");
        //     }
        //
        //     if (that.ball.intersectsMesh(that.leftSide, false)) {
        //         console.log("hello");
        //     }

            for (var i=0; i < that.cups.length; i++) {

                // if ball touches bottom of box get a point and destroy ball
                if (that.ball.intersectsMesh(that.cups[i][0], true)) {
                    // only allows ball to be detected once in cup
                    var thisCup = that.cups[i];
                    if (that.gameMode) {
                        that.gameMode = false;
                    
                        setTimeout(function() {

                            // destoy ball
                            that.destroy(that.ball);

                            // loop over array and destroy all cup sides
                            for(var j = 0; j < thisCup.length; j++) {
                                that.destroy(thisCup[j]);
                            }

                            // add score
                            score++;
                            document.getElementById('count').innerHTML = score;
                        }, 1000);

                    }

                }
            }


        }

        that.update();
    });

    /* MOUSECLICK */
    window.addEventListener("mousedown", function(evt) {
        that.handleMouseClick(evt, 1); //true
    });

    window.addEventListener("mouseup", function(evt) {
        that.handleMouseClick(evt, 0); //false
    });

};


Player.prototype = {

    update: function() {
        this.move();
    },

    move: function() {

        if (this.ball) {


            // add body to mesh so physics works
            this.body.body.linearVelocity.scaleEqual(0.99);
            this.body.body.angularVelocity.scaleEqual(0.7);

            // if mousedown apply force
            if (this.isThrown) {
                this.ball.applyImpulse(this.direction, this.ball.position);
            }
        }

    },

    handleMouseClick: function(evt, bool) {
        // create ball on click
        if (bool) {

            // destroy previous ball
            this.destroy(this.ball);

            // create new ball
            this.createBall();
        }

        // control force based on keypress duration
        this.isThrown = bool ? true : false;
    },

    createBall: function() {

        // establish game mode
        this.gameMode = true;

        //Count balls thrown
        var i = this.ballCount++;

        // create balls with unique id's
        this.ball = ["ball"+i];
        this.ball = BABYLON.Mesh.CreateSphere("sphere", 16.0, 2.0, this.scene);
        this.ball.position = new BABYLON.Vector3(this.startPos.x, this.startPos.y, this.startPos.z);
        this.ball.checkCollisions = true;
        this.ball.material = new BABYLON.StandardMaterial("ballMat", this.scene);
        this.ball.material.diffuseColor = new BABYLON.Color3.Green();
        this.body = this.ball.setPhysicsState(BABYLON.PhysicsEngine.SphereImpostor, {
            mass: 1,
            friction: 1,
            restitution: 1
        });

        // get direction
        var inView = new BABYLON.Matrix();
    	this.camera.getViewMatrix().invertToRef(inView);
    	this.direction = BABYLON.Vector3.TransformNormal(new BABYLON.Vector3(0, 0, 12), inView);
    },

    /*
        params: cup number,the cup scale, and the cup position
    */
    createCup: function (num, scale, pos) {

        //PARENT
        // Create a clone of our template
        var parent = PARENT_MODEL.clone(PARENT_MODEL.name);
        parent.id = PARENT_MODEL.name+(this.cups.length+1);
        parent.isVisible = true;
        parent.scaling = new BABYLON.Vector3(scale.pX,scale.pY,scale.pZ);
        parent.position = new BABYLON.Vector3(pos.pX,pos.pY,pos.pZ);

        parent.setPhysicsState(BABYLON.PhysicsEngine.BoxImpostor, {
            mass: 1,
            friction: 0.1,
            restitution: 0.1
        });

        if(parent) {
            // CHILDREN

            // TODO: Figure out which side is which!

            var rightSide = C1_MODEL.clone(C1_MODEL.name),
                frontSide = C2_MODEL.clone(C2_MODEL.name),
                backSide = C3_MODEL.clone(C3_MODEL.name),
                leftSide = C4_MODEL.clone(C4_MODEL.name);

            rightSide.scaling = new BABYLON.Vector3(scale.c1X,scale.c1Y,scale.c1Z);
            frontSide.scaling = new BABYLON.Vector3(scale.c2X,scale.c2Y,scale.c2Z);
            backSide.scaling = new BABYLON.Vector3(scale.c3X,scale.c3Y,scale.c3Z);
            leftSide.scaling = new BABYLON.Vector3(scale.c4X,scale.c4Y,scale.c4Z);

            rightSide.position = new BABYLON.Vector3(pos.c1X,pos.c1Y,pos.c1Z);
            frontSide.position = new BABYLON.Vector3(pos.c2X,pos.c2Y,pos.c2Z);
            backSide.position = new BABYLON.Vector3(pos.c3X,pos.c3Y,pos.c3Z);
            leftSide.position = new BABYLON.Vector3(pos.c4X,pos.c4Y,pos.c4Z);

            rightSide.isVisible = true;
            frontSide.isVisible = true;
            backSide.isVisible = true;
            leftSide.isVisible = true;

            var childPhysics = {
                mass: 25, // how fast wall fall down
                friction: 0.01,
                restitution: 0.01
            }

            rightSide.setPhysicsState(BABYLON.PhysicsEngine.BoxImpostor, childPhysics);
            frontSide.setPhysicsState(BABYLON.PhysicsEngine.BoxImpostor, childPhysics);
            backSide.setPhysicsState(BABYLON.PhysicsEngine.BoxImpostor, childPhysics);
            leftSide.setPhysicsState(BABYLON.PhysicsEngine.BoxImpostor, childPhysics);

            // define the whole cup and push it into cup array
            var cup = [parent,rightSide,frontSide,backSide,leftSide];
            this.cups.push(cup);
            console.log(this.cups);
        }






    },

    destroy: function (_this) {
        if(_this) {
            _this.dispose();
        }
    }
};
