var Player = function(game, scene, gamepad) {

    this.game = game;
    this.scene = scene;
    this.gamePad = gamepad;
    this.camera = this.scene.activeCamera;
    this.startPos = this.camera.position;
    this.ball = null;
    this.ballCount = 0;
    var score = 0;

    /*************************************/
    /* CUPS
    /************************************/

    // Hole material
    var matHole = new BABYLON.StandardMaterial("matHole", this.scene);
    matHole.diffuseColor = BABYLON.Color3.Red();
    matHole.backFaceCulling = false; //Allways show the front and the back of an element
    var matHoleBottom = new BABYLON.StandardMaterial("matHoleBottom", this.scene);
    matHoleBottom.diffuseColor = BABYLON.Color3.White();
    matHoleBottom.backFaceCulling = false;
    var boxPhysics = {
        mass: 0,
        restitution: 0.5,
        friction: 0.1
    };

    var holeBack = BABYLON.Mesh.CreateBox("holeBack", 10, this.scene);
    holeBack.scaling = new BABYLON.Vector3(1, 0.6, 0.1);
    holeBack.position.y = 3;
    holeBack.position.z = 25;
    holeBack.material = matHole;
    holeBack.setPhysicsState(BABYLON.PhysicsEngine.BoxImpostor, boxPhysics);

    var holeFront = BABYLON.Mesh.CreateBox("holeFront", 10, this.scene);
    holeFront.scaling = new BABYLON.Vector3(1, 0.6, 0.1);
    holeFront.position.y = 3;
    holeFront.position.z = 15;
    holeFront.material = matHole;
    holeFront.setPhysicsState(BABYLON.PhysicsEngine.BoxImpostor, boxPhysics);

    var holeLeft = BABYLON.Mesh.CreateBox("holeLeft", 10, this.scene);
    holeLeft.scaling = new BABYLON.Vector3(0.1, 0.6, 1);
    holeLeft.position.x = -5;
    holeLeft.position.y = 3;
    holeLeft.position.z = 20;
    holeLeft.material = matHole;
    holeLeft.setPhysicsState(BABYLON.PhysicsEngine.BoxImpostor, boxPhysics);

    var holRight = BABYLON.Mesh.CreateBox("holRight", 10, this.scene);
    holRight.scaling = new BABYLON.Vector3(0.1, 0.6, 1);
    holRight.position.x = 5;
    holRight.position.y = 3;
    holRight.position.z = 20;
    holRight.material = matHole;
    holRight.setPhysicsState(BABYLON.PhysicsEngine.BoxImpostor, boxPhysics);

    var holeBot = BABYLON.Mesh.CreateBox("holeBot", 10, this.scene);
    holeBot.scaling = new BABYLON.Vector3(1, 0.1, 1);
    holeBot.position.y = 0;
    holeBot.position.z = 20;
    holeBot.material = matHoleBottom;
    holeBot.setPhysicsState(BABYLON.PhysicsEngine.BoxImpostor, boxPhysics);


    /* GAMEPAD*/
    var that = this;
    this.scene.registerBeforeRender(function() {

        if (that.ball) {
            // if ball touches bottom of box
            if (that.ball.intersectsMesh(holeBot, false)) {

                // only allows ball to be detected once in cup
                if (that.gameMode) {
                    that.gameMode = false;

                    setTimeout(function() {
                        that.destroy();
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
            this.destroy();

            // create new ball
            this.create();
        }

        // control force based on keypress duration
        this.isThrown = bool ? true : false;
    },

    create: function() {

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
            mass: 1, //changing mass?
            friction: 1,
            restitution: 1
        });

        // get direction
        var inView = new BABYLON.Matrix();
    	this.camera.getViewMatrix().invertToRef(inView);
    	this.direction = BABYLON.Vector3.TransformNormal(new BABYLON.Vector3(0, 0, 12), inView);
    },

    destroy: function() {
        // if exists destroy ball
        if (this.ball) {
            this.ball.dispose();
        }
    }
};
