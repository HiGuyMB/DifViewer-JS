function initPhysicsBuffers() {
	sphere = new Sphere(0.3);
	sphere.generate();
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
		var origin = new Ammo.btVector3(0, 0, 10);
		transform.setOrigin(origin);

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
	models.forEach(function(intmodel) {
		var state = new Ammo.btDefaultMotionState();
		var mesh  = new Ammo.btTriangleMesh();

		var model = intmodel.model;

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
	});
}

function updatePhysics(delta) {
	world.stepSimulation(delta, 1);
	var transform = new Ammo.btTransform();
	physSphere.getMotionState().getWorldTransform(transform);

	var origin = transform.getOrigin();

	var marblePos = [origin.x(), origin.y(), origin.z()];
	cameraPosition = marblePos;

	sphere.updateMovement(delta / 1000.0);
}

function physicsRender(projectionMat, viewMat) {
	var transform = new Ammo.btTransform();
	physSphere.getMotionState().getWorldTransform(transform);

	var origin = transform.getOrigin();
	var rotation = transform.getRotation();

	var marblePos = [origin.x(), origin.y(), origin.z()];
	var marbleRot = [rotation.x(), rotation.y(), rotation.z(), rotation.w()];

	var modelMat = mat4.create();
	mat4.fromRotationTranslation(modelMat, marbleRot, marblePos);

	sphere.render(projectionMat, viewMat, modelMat);
}
