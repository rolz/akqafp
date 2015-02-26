var Player = function(game, scene, gamepad) {

    this.game = game;
    this.scene = scene;
    this.gamePad = gamepad;
    this.camera = this.scene.activeCamera;
    this.startPos = this.camera.position;
    this.ball = null;
    this.ballCount = 0;
    var cup1, cup2, cup3, cup4, cup5, cup6;
    var score = 0;

    /*************************************/
    /* CUPS - blender
    /************************************/

    var that = this;
    var newMeshes = [];

    BABYLON.SceneLoader.ImportMesh("Cube.000", "assets/", "boxCup.babylon", this.scene, function (newMeshes) {
        console.log(newMeshes);
        cup1 = that.createCup(newMeshes[0], newMeshes[1], newMeshes[2], newMeshes[3], newMeshes[4], 0, 0.5, 0);
    });

    /* GAMEPAD*/
    this.scene.registerBeforeRender(function() {

        if (that.ball && that.cupParentMesh) {

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


            // if ball touches bottom of box get a point and destroy ball
            if (that.ball.intersectsMesh(that.cupParentMesh, true)) {

                // only allows ball to be detected once in cup
                if (that.gameMode) {
                    that.gameMode = false;

                    setTimeout(function() {
                        that.destroy(that.ball);
                        that.destroy(that.cupParentMesh);
                        score++;
                        document.getElementById('count').innerHTML = score;
                    }, 1000);

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

    createCup: function (parent,c1,c2,c3,c4, x, y, z) {

        this.cupParentMesh = parent;
        this.cupParentMesh.position = new BABYLON.Vector3(x, y, z);
        this.cupParentMesh.scaling = new BABYLON.Vector3(5, 0.5, 5);

        this.cupParentMesh.setPhysicsState(BABYLON.PhysicsEngine.BoxImpostor, {
            mass: 1,
            friction: 0.1,
            restitution: 0.1
        });

        var rightSide = c1;
        frontSide = c2;
        backSide = c3;
        leftSide = c4;

        var physics = {
            mass: 25, // how fast wall fall down
            friction: 0.01,
            restitution: 0.01
        }

        rightSide.setPhysicsState(BABYLON.PhysicsEngine.BoxImpostor, physics);
        frontSide.setPhysicsState(BABYLON.PhysicsEngine.BoxImpostor, physics);
        backSide.setPhysicsState(BABYLON.PhysicsEngine.BoxImpostor, physics);
        leftSide.setPhysicsState(BABYLON.PhysicsEngine.BoxImpostor, physics);

    },

    destroy: function (_this) {
        if(_this) {
            _this.dispose();
        }
    }
};
