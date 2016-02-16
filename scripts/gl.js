//List of materials to be loaded from the model
var materials = [];

//Initial camera parameters
var cameraPosition = vec3.create();
var cameraRotation = vec2.create();

//Time information
var time = 0;
var lastTimestamp = null;

function initGL() {
	canvas = document.getElementById("screen");
	/** @type {WebGLRenderingContext} gl */
	gl = canvas.getContext("webgl");
	fpsMeter = document.getElementById("fpsMeter");

	//Clear state
	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT);

	//Lots of stuff to init first
	initInput();
	initShaders();
	initBuffers();
	initTextures();

	//Then start running!
	window.requestAnimFrame(render);
}

function initShaders() {
	//One shader for now
	shader = new Shader("shaders/vertex.glsl", "shaders/fragment.glsl");
}

function initBuffers() {
	//VBO of the model. 14 components per vertex:
	// {position (3), uv (2), normal (3), tangent (3), bitangent (3)}
	vbo = new VBO(model.faces, gl.TRIANGLES, 14, model.faces.length / 14);

	//Attributes are pretty basic
	vbo.addAttribute("in_position", 3, gl.FLOAT, false, 0);
	vbo.addAttribute("in_uv", 2, gl.FLOAT, false, 3);
	vbo.addAttribute("in_normal", 3, gl.FLOAT, false, 5);
	vbo.addAttribute("in_tangent", 3, gl.FLOAT, false, 8);
	vbo.addAttribute("in_bitangent", 3, gl.FLOAT, false, 11);
}

function initTextures() {
	//Load each material in the model
	model.textures.forEach(function(tex, i) {
		if (tex.count > 0) {
			//Default material names with .alpha / .normal
			materials[i] = new Material([
				new Texture("model/" + tex.texture.toLowerCase() + ".jpg",        Texture.DEFAULT_DIFFUSE_TEXTURE), //Diffuse
				new Texture("model/" + tex.texture.toLowerCase() + ".normal.png", Texture.DEFAULT_NORMAL_TEXTURE),  //Normal
				new Texture("model/" + tex.texture.toLowerCase() + ".alpha.jpg",  Texture.DEFAULT_SPECULAR_TEXTURE) //Specular
			]);
		}
	});
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

	//Check if the window updated its size. If so, we need to update the canvas and viewport to match.
	var density = 1;
	if (canvas.width != canvas.clientWidth * density || canvas.height != canvas.clientHeight * density) {
		canvas.width = canvas.clientWidth * density;
		canvas.height = canvas.clientHeight * density;

		gl.viewport(0, 0, canvas.clientWidth * density, canvas.clientHeight * density);
	}

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

	//Get the inverse camera position because we move the world instead of the camera
	var inverseCamera = vec3.create();
	vec3.scale(inverseCamera, cameraPosition, -1);

	//Three fundamental matrices
	var projectionMat = mat4.create();
	var viewMat = mat4.create();
	var modelMat = mat4.create();

	//Basic perspective
	mat4.perspective(projectionMat, glMatrix.toRadian(90), canvas.clientWidth / canvas.clientHeight, 0.1, 500.0);

	//Basic view matrix too
	mat4.identity(viewMat);
	//Because we like having the Z axis be up instead of Y
	mat4.rotate(viewMat, viewMat, glMatrix.toRadian(-90), [1, 0, 0]);
	//Camera orientation
	mat4.rotate(viewMat, viewMat, cameraRotation[1], [1, 0, 0]);
	mat4.rotate(viewMat, viewMat, cameraRotation[0], [0, 0, 1]);
	//And offset
	mat4.translate(viewMat, viewMat, inverseCamera);

	//Nothing for model yet
	mat4.identity(modelMat);

	//Don't try to render if we don't have a shader loaded
	if (shader.loaded) {
		//Clear the screen before each render
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		gl.enable(gl.DEPTH_TEST);
		gl.depthFunc(gl.LEQUAL);

		gl.enable(gl.CULL_FACE);
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

		//Load shader outside of the materials loop to optimize
		shader.activate();

		//Render each material's textures
		materials.forEach(function(mat, i) {
			//Model tex allows us to know starts/counts for triangles
			var modelTex = model.textures[i];

			//Don't try to render if the texture is still loading
			if (mat.isLoaded()) {
				//Activate the model
				vbo.activate(shader);

				//Load the matrices into the shader
				gl.uniformMatrix4fv(shader.getUniformLocation("in_projection_mat"), false, projectionMat);
				gl.uniformMatrix4fv(shader.getUniformLocation("in_view_mat"), false, viewMat);
				gl.uniformMatrix4fv(shader.getUniformLocation("in_model_mat"), false, modelMat);

				//Hardcoded lighting values for now
				gl.uniform4fv(shader.getUniformLocation("in_light_color"), [1.0, 0.95, 0.9, 1.0]);
				gl.uniform4fv(shader.getUniformLocation("in_ambient_color"), [0.7, 0.7, 0.7, 1.0]);
				gl.uniform3fv(shader.getUniformLocation("in_sun_position"), [100.0, 75.0, 100.0]);
				gl.uniform1f(shader.getUniformLocation("in_specular_exponent"), 7);

				//Activate the current material
				mat.activate(shader, ["tex_diffuse", "tex_normal", "tex_specular"], [gl.TEXTURE0, gl.TEXTURE1, gl.TEXTURE2]);

				//Actually draw the thing!
				vbo.draw(modelTex.start * 3, modelTex.count * 3);

				//Deactivate everything for the next round
				mat.deactivate();
				vbo.deactivate(shader);
			}
		});
		shader.deactivate();
	}

	//Tell the browser to get us the next frame
	window.requestAnimFrame(render);
}
