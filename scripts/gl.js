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

	initPhysics();

	//Then start running!
	window.requestAnimFrame(render);
}

function initShaders() {
	//One shader for now
	shader = new Shader("shaders/interiorV.glsl", "shaders/interiorF.glsl");
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

	sphere = new Sphere(0.3);
	sphere.generate();
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

function initPhysics() {
	var config     = new Ammo.btDefaultCollisionConfiguration();
	dispatcher     = new Ammo.btCollisionDispatcher(config);
	var broadphase = new Ammo.btDbvtBroadphase();
	var solver     = new Ammo.btSequentialImpulseConstraintSolver();
	world          = new Ammo.btDiscreteDynamicsWorld(dispatcher, broadphase, solver, config);
	world.setGravity(new Ammo.btVector3(0, 0, -20));

	{
		var state = new Ammo.btDefaultMotionState();
		var shape = new Ammo.btSphereShape(0.3);

		var fallInertia = new Ammo.btVector3(0, 0, 0);
		shape.calculateLocalInertia(1.0, fallInertia);
		shape.setMargin(0.01);

		//Update position
		var transform = new Ammo.btTransform();
		transform.setIdentity();

		state.setWorldTransform(transform);

		//Construction info
		var info = new Ammo.btRigidBodyConstructionInfo(1, state, shape, fallInertia);
		info.set_m_restitution(0.5); // 0.5 * 0.7
		info.set_m_friction(1.0);
		info.set_m_rollingFriction(0.3);

		//Create the actor and add it to the scene
		physSphere = new Ammo.btRigidBody(info);
		physSphere.setActivationState(4);
		physSphere.setCcdMotionThreshold(1e-3);
		physSphere.setCcdSweptSphereRadius(0.3 / 10.0);
		physSphere.setRollingFriction(3.0);
		physSphere.setContactProcessingThreshold(0.0);

		world.addRigidBody(physSphere);
	}
	{
		var state = new Ammo.btDefaultMotionState();
		var mesh  = new Ammo.btTriangleMesh();

		for (var i = 0; i < model.faces.length; i += 3 * 14) {
			var v0 = new Ammo.btVector3(model.faces[i + (14 * 0) + 0], model.faces[i + (14 * 0) + 1], model.faces[i + (14 * 0) + 2]);
			var v1 = new Ammo.btVector3(model.faces[i + (14 * 1) + 0], model.faces[i + (14 * 1) + 1], model.faces[i + (14 * 1) + 2]);
			var v2 = new Ammo.btVector3(model.faces[i + (14 * 2) + 0], model.faces[i + (14 * 2) + 1], model.faces[i + (14 * 2) + 2]);

			mesh.addTriangle(v0, v1, v2);
		}

		var shape = new Ammo.btBvhTriangleMeshShape(mesh, true, true);
		shape.setMargin(0.01);

		var transform = new Ammo.btTransform();
		transform.setIdentity();

		state.setWorldTransform(transform);

		var inertia = new Ammo.btVector3(0, 0, 0);
		var info = new Ammo.btRigidBodyConstructionInfo(0, state, shape, inertia);

		var actor = new Ammo.btRigidBody(info);
		actor.setRestitution(1.0);
		actor.setFriction(1.0);

		world.addRigidBody(actor);
	}
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

	world.stepSimulation(delta, 1);
	var transform = new Ammo.btTransform();
	physSphere.getMotionState().getWorldTransform(transform);

	var origin = transform.getOrigin();
	var rotation = transform.getRotation();

	var marblePos = [origin.x(), origin.y(), origin.z()];
	var marbleRot = [rotation.x(), rotation.y(), rotation.z(), rotation.w()];

	//Check if the window updated its size. If so, we need to update the canvas and viewport to match.
	var density = 1;
	if (canvas.width != canvas.clientWidth * density || canvas.height != canvas.clientHeight * density) {
		canvas.width = canvas.clientWidth * density;
		canvas.height = canvas.clientHeight * density;

		gl.viewport(0, 0, canvas.clientWidth * density, canvas.clientHeight * density);
	}

	sphere.updateMovement(delta / 1000.0);

	//Get the inverse camera position because we move the world instead of the camera
	var inverseCamera = vec3.create();
	vec3.scale(inverseCamera, marblePos, -1);

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

	mat4.translate(viewMat, viewMat, [0, 2.5, 0]);
	mat4.multiply(viewMat, viewMat, rotMat);
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

	modelMat = mat4.create();
	mat4.fromRotationTranslation(modelMat, marbleRot, marblePos);

	sphere.render(projectionMat, viewMat, modelMat);

	//Tell the browser to get us the next frame
	window.requestAnimFrame(render);
}
