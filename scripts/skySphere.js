function SkySphere(material) {
	this.material = material;
	this.shader = new Shader("shaders/sky_sphereV.glsl", "shaders/sky_sphereF.glsl");

	var verts = [
		-1.0,  1.0, -1.0,
		-1.0, -1.0, -1.0,
		 1.0, -1.0, -1.0,
		 1.0, -1.0, -1.0,
		 1.0,  1.0, -1.0,
		-1.0,  1.0, -1.0,

		-1.0, -1.0,  1.0,
		-1.0, -1.0, -1.0,
		-1.0,  1.0, -1.0,
		-1.0,  1.0, -1.0,
		-1.0,  1.0,  1.0,
		-1.0, -1.0,  1.0,

		 1.0, -1.0, -1.0,
		 1.0, -1.0,  1.0,
		 1.0,  1.0,  1.0,
		 1.0,  1.0,  1.0,
		 1.0,  1.0, -1.0,
		 1.0, -1.0, -1.0,

		-1.0, -1.0,  1.0,
		-1.0,  1.0,  1.0,
		 1.0,  1.0,  1.0,
		 1.0,  1.0,  1.0,
		 1.0, -1.0,  1.0,
		-1.0, -1.0,  1.0,

		-1.0,  1.0, -1.0,
		 1.0,  1.0, -1.0,
		 1.0,  1.0,  1.0,
		 1.0,  1.0,  1.0,
		-1.0,  1.0,  1.0,
		-1.0,  1.0, -1.0,

		-1.0, -1.0, -1.0,
		-1.0, -1.0,  1.0,
		 1.0, -1.0, -1.0,
		 1.0, -1.0, -1.0,
		-1.0, -1.0,  1.0,
		 1.0, -1.0,  1.0
	];
	this.vertCount = verts.length / 3;
	this.vbo = new VBO(verts, gl.TRIANGLES, 3, this.vertCount);
	this.vbo.addAttribute("in_position", 3, gl.FLOAT, false, 0);
}

SkySphere.prototype.render = function(projectionMat, viewMat) {
	if (this.shader.loaded && this.material.isLoaded()) {
		gl.depthFunc(gl.GREATER);
		gl.disable(gl.DEPTH_TEST);

		this.shader.activate();
		this.vbo.activate(this.shader);

		//Load the matrices into the shader
		gl.uniformMatrix4fv(this.shader.getUniformLocation("in_projection_mat"), false, projectionMat);
		gl.uniformMatrix4fv(this.shader.getUniformLocation("in_view_mat"), false, viewMat);

		//Activate the current material
		this.material.activate(this.shader, ["tex_front", "tex_back"], [gl.TEXTURE0, gl.TEXTURE1]);
		this.vbo.draw(0, this.vertCount);

		this.shader.deactivate();
		this.vbo.deactivate(this.shader);
		this.material.deactivate();

		gl.enable(gl.DEPTH_TEST);
		gl.depthFunc(gl.LEQUAL);
	}
};
