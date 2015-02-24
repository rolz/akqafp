
var GameState = function(game) {
    State.call(this, game);
};


GameState.prototype = Object.create(State.prototype);
GameState.prototype.constructor = GameState;


GameState.prototype = {


    _initScene : function() {

        var scene = new BABYLON.Scene(this.engine);
        scene.enablePhysics();
        scene.setGravity(new BABYLON.Vector3(0, -20, 0)); //this controls forces.
        scene.checkCollisions = true;
        scene.collisionsEnabled = true;

        // Camera attached to the canvas
        var camera = new BABYLON.FreeCamera("cam", new BABYLON.Vector3(0,45,-180), scene);
        camera.setTarget(new BABYLON.Vector3(0, 28, 0));
        scene.activeCamera = camera;

        // CAMERA ACTIONS
        camera.attachControl(this.engine.getRenderingCanvas());

        // Hemispheric light to light the scene
        var h = new BABYLON.HemisphericLight("hemi", new BABYLON.Vector3(0,1,0), scene);
        h.groundColor = BABYLON.Color3.FromInts(255,83,13);
        h.intensity = 0.9;

        // Ground creation
        var ground = BABYLON.Mesh.CreateGround("ground", 100, 170, 1, scene);
        ground.position.z = -10;
        ground.receiveShadows = true;
        ground.checkCollisions = true;
        ground.setPhysicsState(BABYLON.PhysicsEngine.BoxImpostor, {mass:0, restitution:0.5, friction:0.1});


        // Ground Texture
        var matGround = new BABYLON.StandardMaterial("matGround", scene);
        matGround.diffuseColor = BABYLON.Color3.White();
        matGround.backFaceCulling = false; //Allways show the front and the back of an element
        ground.material = matGround;

        return scene;
    },

    /**
     * Run the current state
     */
    run : function() {

        this.scene = this._initScene();

        // The loader
        var loader =  new BABYLON.AssetsManager(this.scene);

        var that = this;
        loader.onFinish = function (tasks) {

            // Init the game
            that._initGame();

            // The state is ready to be played
            that.isReady = true;

            that.engine.runRenderLoop(function () {
                that.scene.render();
            });
        };

        loader.load();
    },

    _initGame : function() {
        new Player(this.game, this.scene);
    }
};
