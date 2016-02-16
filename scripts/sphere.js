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
	this.vbo = new VBO(pointData, gl.TRIANGLES, 8, pointData.length / 8);
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
