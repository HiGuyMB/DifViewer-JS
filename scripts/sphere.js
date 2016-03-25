function Sphere(radius) {
	this.radius = radius;
	this.generate();
}

Sphere.prototype.generate = function() {
	var segments = 36;
	var slices = 18;

	var step = (Math.PI * 2.0 / segments);

	var segments2 = segments / 2;
	var slices2 = slices / 2;

	var size = segments * slices * 2;

	var pointData = [];

	for (var y = -slices2; y < slices2; y ++) {
		var cosy = Math.cos(y * step);
		var cosy1 = Math.cos((y + 1) * step);
		var siny = Math.sin(y * step);
		var siny1 = Math.sin((y + 1) * step);

		for (var i = -segments2; i < segments2; i ++) {
			var cosi = Math.cos(i * step);
			var sini = Math.sin(i * step);

			//Math not invented by me

			//Point
			pointData.push(cosi * cosy);
			pointData.push(siny);
			pointData.push(sini * cosy);
			//UV
			pointData.push(i / segments2);
			pointData.push(y / slices2);
			//Normal
			pointData.push(cosi * cosy);
			pointData.push(siny);
			pointData.push(sini * cosy);

			//Point
			pointData.push(cosi * cosy1);
			pointData.push(siny1);
			pointData.push(sini * cosy1);
			//UV
			pointData.push(i / segments2);
			pointData.push((y + 1) / slices2);
			//Normal
			pointData.push(cosi * cosy1);
			pointData.push(siny1);
			pointData.push(sini * cosy1);
		}
	}

	//Generate a buffer
	this.vbo = new VBO(pointData, gl.TRIANGLE_STRIP, 8, pointData.length / 8);
	this.vbo.addAttribute("in_position", 3, gl.FLOAT, false, 0);
	this.vbo.addAttribute("in_uv",       2, gl.FLOAT, false, 3);
	this.vbo.addAttribute("in_normal",   3, gl.FLOAT, false, 5);

	this.material = new Material([
		new Texture("assets/marble.png", Texture.DEFAULT_DIFFUSE_TEXTURE)
	]);

	this.shader = new Shader("shaders/sphereV.glsl", "shaders/sphereF.glsl");
};

Sphere.prototype.render = function(projectionMat, viewMat, modelMat) {
	mat4.scale(modelMat, modelMat, [this.radius, this.radius, this.radius]);
	if (this.shader.loaded && this.material.isLoaded()) {
		this.shader.activate();

		this.vbo.activate(this.shader);
		gl.uniformMatrix4fv(this.shader.getUniformLocation("in_projection_mat"), false, projectionMat);
		gl.uniformMatrix4fv(this.shader.getUniformLocation("in_view_mat"), false, viewMat);
		gl.uniformMatrix4fv(this.shader.getUniformLocation("in_model_mat"), false, modelMat);

		this.material.activate(this.shader, ["tex_diffuse"], [gl.TEXTURE0]);
		this.vbo.draw();
		this.material.deactivate();

		this.shader.deactivate();
	}
};

Sphere.prototype.updateMovement = function(delta) {
	//Apply the camera yaw to a matrix so our rolling is based on the camera direction
	var deltaMat = mat4.create();
	mat4.identity(deltaMat);
	mat4.rotate(deltaMat, deltaMat, -cameraRotation[0], [0, 0, 1]);

	//Convert the movement into a vector
	var move = vec3.create();
	if (keyState.forward) move[1] ++;
	if (keyState.backward) move[1] --;
	if (keyState.left) move[0] --;
	if (keyState.right) move[0] ++;

	var inverseDeltaMat = mat4.create();
	mat4.invert(inverseDeltaMat, deltaMat);
	mat4.translate(inverseDeltaMat, inverseDeltaMat, jsVec3(physSphere.getLinearVelocity()));

	//Linear velocity relative to camera yaw (for capping)
	var linRel = vec3.create();
	mat4.getPosition(linRel, inverseDeltaMat);

	mat4.identity(inverseDeltaMat);
	mat4.invert(inverseDeltaMat, deltaMat);
	mat4.translate(inverseDeltaMat, inverseDeltaMat, jsVec3(physSphere.getLinearVelocity()));

	var angRel = vec3.create();
	mat4.getPosition(angRel, inverseDeltaMat);
	vec3.cross(angRel, angRel, [0, 0, 1]);

	var torque = vec3.clone(move);
	vec3.scale(torque, torque, 750.0 * delta * this.radius);

	if (this.getColliding()) {
		//Don't let us go faster than the max velocity in any direction.
		if (torque[0] > 0 && torque[0] + linRel[0] >  15.0) torque[0] = Math.max(0.0,  15.0 - linRel[0]);
		if (torque[1] > 0 && torque[1] + linRel[1] >  15.0) torque[1] = Math.max(0.0,  15.0 - linRel[1]);
		//Same for backwards
		if (torque[0] < 0 && torque[0] + linRel[0] < -15.0) torque[0] = Math.min(0.0, -15.0 - linRel[0]);
		if (torque[1] < 0 && torque[1] + linRel[1] < -15.0) torque[1] = Math.min(0.0, -15.0 - linRel[1]);
	} else {
		//Don't let us roll faster than the max air roll velocity
		if (torque[0] > 0 && torque[0] + angRel[0] >  50) torque[0] = Math.max(0.0,  50 - angRel[0]);
		if (torque[1] > 0 && torque[1] + angRel[1] >  50) torque[1] = Math.max(0.0,  50 - angRel[1]);
		if (torque[0] < 0 && torque[0] + angRel[0] < -50) torque[0] = Math.min(0.0, -50 - angRel[0]);
		if (torque[1] < 0 && torque[1] + angRel[1] < -50) torque[1] = Math.min(0.0, -50 - angRel[1]);
	}

	//Torque is based on the movement and yaw
	var deltaTorqueMat = mat4.clone(deltaMat);
	mat4.translate(deltaTorqueMat, deltaTorqueMat, torque);

	var torqueRel = vec3.create();
	mat4.getPosition(torqueRel, deltaTorqueMat);
	vec3.scale(torqueRel, torqueRel, 1.0); //Mass

	//Cross to convert 3d coordinates into torque
	vec3.cross(torqueRel, [0, 0, 1], torqueRel);
	physSphere.applyTorque(ammoVec3(torqueRel));

	if (this.getColliding()) {
		////Impact velocity is stored when we collide so we can use it here
		//var impactVelocity;
		////Get collision information
		//var normal = getCollisionNormal(impactVelocity);
		//var vel = mActor->getLinearVelocity();
		//
		//// dot against up vector to determine if we can jump
		//// TODO: take gravities into account
		//var up = vec3.fromValues(0, 0, 1);
		//if (mMovement.jump && glm::dot(up, normal) > 0.001f) {
		//	glm::vec3 currentVelocity = glm::proj(vel, normal);
		//
		//	glm::vec3 projVel = glm::proj(vel, normal);
		//
		//	if (glm::length(projVel) < JumpImpulse) {
		//		glm::vec3 finalVelocity = vel - currentVelocity + (normal * JumpImpulse);
		//		setLinearVelocity(finalVelocity);
		//		IO::printf("Jump! Impact velocity: %f %f %f\n   final Velocity: %f %f %f\n    Projection velocity: %f %f %f\n    Dot: %f\n", vel.x, vel.y, vel.z, finalVelocity.x, finalVelocity.y, finalVelocity.z, projVel.x, projVel.y, projVel.z, glm::dot(up, normal));
		//	} else {
		//		IO::printf("No jump, projection velocity is %f %f %f\n", projVel.x, projVel.y, projVel.z);
		//	}
		//}
	} else {
		deltaTorqueMat = mat4.clone(deltaMat);
		mat4.translate(deltaTorqueMat, deltaTorqueMat, move);

		var moveRel = vec3.create();
		mat4.getPosition(moveRel, deltaTorqueMat);
		vec3.scale(moveRel, moveRel, 5.0 * delta);

		//If we're not touching the ground, apply slight air movement.
		physSphere.applyImpulse(ammoVec3(moveRel), ammoVec3([0, 0, 0]));
	}
};

Sphere.prototype.getColliding = function() {
	var manifolds = world.getDispatcher().getNumManifolds();

	for (var i = 0; i < manifolds; i ++) {
		var manifold = world.getDispatcher().getManifoldByIndexInternal(i);
		var obj1 = manifold.getBody0();
		var obj2 = manifold.getBody1();

		if (Ammo.compare(obj1, physSphere) || Ammo.compare(obj2, physSphere)) {
			if (manifold.getNumContacts() > 0)
				return true;
		}
	}

	return false;
};