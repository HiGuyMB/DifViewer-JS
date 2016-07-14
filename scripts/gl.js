//List of materials to be loaded from the model
var shaders = {};

//Initial camera parameters
var cameraPosition = vec3.create();
var cameraRotation = vec2.create();

//Time information
var time = 0;
var lastTimestamp = null;

var physics = true;
var customShaders = true;

var skyChoice = "Clear";
var texChoice = "custom";
var models = [];

function initGL() {
	canvas = document.createElement("canvas");
	canvas.setAttribute("id", "screen");
	document.body.insertBefore(canvas, document.getElementById("input"));
	document.body.removeChild(document.getElementById("input"));
	/** @type {WebGLRenderingContext} gl */
	gl = canvas.getContext("webgl");
	fpsMeter = document.getElementById("fpsMeter");

	//Clear state
	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT);

	//Lots of stuff to init first
	initInput();
	initBuffers();

	if (physics) {
		initPhysics();
	}

	//Then start running!
	window.requestAnimFrame(render);
}

function initBuffers() {
	models.forEach(function(model) {
		model.generateBuffer();
	});

	if (physics) {
		initPhysicsBuffers();
	}

	sky = new SkySphere(new Material(0, [
		new Texture("assets/skies/" + skyChoice + "/back.png",  "assets/DefaultSkyBack.png"),
		new Texture("assets/skies/" + skyChoice + "/front.png", "assets/DefaultSkyFront.png")
	]));
}

function render(timestamp) {
	//Get the delta time since the last frame
	var delta = 0;
	if (lastTimestamp !== null) {
		delta = timestamp - lastTimestamp;
		time += delta;
		fpsMeter.innerHTML = (1000 / delta) + " FPS";
	}
	lastTimestamp = timestamp;

	if (physics) {
		updatePhysics(delta);
	} else if (isRunningReplay()) {
		updateReplay(delta);
	} else {
		//Movement direction based on keyboard input
		var movement = vec3.create();
		//Movement speed is faster if you hold the mouse button
		var moveSpeed = (mouseState[0] ? 30.0 : 10.0);

		if (keyState.forward) {
			movement[1] += (delta / 1000) * moveSpeed;
		} else if (keyState.backward) {
			movement[1] -= (delta / 1000) * moveSpeed;
		}
		if (keyState.right) {
			movement[0] += (delta / 1000) * moveSpeed;
		} else if (keyState.left) {
			movement[0] -= (delta / 1000) * moveSpeed;
		}

		//Rotate the movement by the camera direction so we move relative to that
		var movementMat = mat4.create();
		mat4.rotate(movementMat, movementMat, -cameraRotation[0], [0, 0, 1]);
		mat4.rotate(movementMat, movementMat, -cameraRotation[1], [1, 0, 0]);
		mat4.translate(movementMat, movementMat, movement);

		//Get the position components of this matrix for the camera position offset
		var offset = vec3.fromValues(movementMat[12], movementMat[13], movementMat[14]);
		vec3.add(cameraPosition, cameraPosition, offset);
	}

	//Check if the window updated its size. If so, we need to update the canvas and viewport to match.
	var density = 1;
	if (canvas.width != canvas.clientWidth * density || canvas.height != canvas.clientHeight * density) {
		canvas.width = canvas.clientWidth * density;
		canvas.height = canvas.clientHeight * density;

		gl.viewport(0, 0, canvas.clientWidth * density, canvas.clientHeight * density);
	}

	//Get the inverse camera position because we move the world instead of the camera
	var inverseCamera = vec3.create();
	vec3.scale(inverseCamera, cameraPosition, -1);

	//Three fundamental matrices
	var projectionMat = mat4.create();
	var viewMat = mat4.create();
	var modelMat = mat4.create();

	//Basic perspective
	mat4.perspective(projectionMat, glMatrix.toRadian(90), canvas.clientWidth / canvas.clientHeight, 0.1, 500.0);

	var rotMat = mat4.create();

	//Basic view matrix too
	mat4.identity(rotMat);
	//Camera orientation
	mat4.rotate(rotMat, rotMat, cameraRotation[1], [1, 0, 0]);
	mat4.rotate(rotMat, rotMat, cameraRotation[0], [0, 0, 1]);

	//Because we like having the Z axis be up instead of Y
	mat4.rotate(viewMat, viewMat, glMatrix.toRadian(-90), [1, 0, 0]);

	if (physics || isRunningReplay()) {
		mat4.translate(viewMat, viewMat, [0, 2.5, 0]);
	}
	mat4.multiply(viewMat, viewMat, rotMat);
	mat4.translate(viewMat, viewMat, inverseCamera);

	//Clear the screen before each render
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	gl.enable(gl.DEPTH_TEST);
	gl.depthFunc(gl.LEQUAL);

	gl.enable(gl.CULL_FACE);
	gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
	sky.render(projectionMat, viewMat);

	models.forEach(function(model) {
		model.render(projectionMat, viewMat);
	});

	if (physics) {
		physicsRender(projectionMat, viewMat);
	}

	if (isRunningReplay()) {
		replayRender(projectionMat, viewMat);
	}

	//Tell the browser to get us the next frame
	window.requestAnimFrame(render);
}
