function InteriorModel(model) {
	this.model = model;
	this.shaders = {};
	this.position = vec3.create();
}

InteriorModel.prototype.generateBuffer = function() {
	this.shaders["default"]   = new Shader("shaders/interiorV.glsl", "shaders/interiorF.glsl");

	if (customShaders) {
		this.shaders["noise"] = new Shader("shaders/interiorV.glsl", "shaders/noise_tileF.glsl");
		this.shaders["ice"]   = new Shader("shaders/interiorV.glsl", "shaders/iceF.glsl");
	}

	//VBO of the model. 14 components per vertex:
	// {position (3), uv (2), normal (3), tangent (3), bitangent (3)}
	this.vbo = new VBO(this.model.faces, gl.TRIANGLES, 14, this.model.faces.length / 14);

	//Attributes are pretty basic
	this.vbo.addAttribute("in_position", 3, gl.FLOAT, false, 0);
	this.vbo.addAttribute("in_uv", 2, gl.FLOAT, false, 3);
	this.vbo.addAttribute("in_normal", 3, gl.FLOAT, false, 5);
	this.vbo.addAttribute("in_tangent", 3, gl.FLOAT, false, 8);
	this.vbo.addAttribute("in_bitangent", 3, gl.FLOAT, false, 11);

	//Load each material in the model
	this.model.textures.forEach(function(tex, i) {
		if (tex.count > 0) {
			var texture = tex.texture;
			if (texture.indexOf("/") !== -1)
				texture = texture.substr(texture.lastIndexOf("/") + 1);

			var materialInfo = getMaterialInfo(tex.texture);
			var shader = this.shaders[materialInfo.shader];

			if (typeof(materialInfo.replacement) !== "undefined")
				texture = materialInfo.replacement;

			if (typeof(shader) === "undefined")
				shader = this.shaders["default"];

			//Default material names with .alpha / .normal
			shader.materials[tex.texture] = new Material(i, [
				new Texture("texture/" + texChoice + "/" + texture.toLowerCase() + ".jpg",        Texture.DEFAULT_DIFFUSE_TEXTURE), //Diffuse
				new Texture("texture/" + texChoice + "/" + texture.toLowerCase() + ".normal.png", Texture.DEFAULT_NORMAL_TEXTURE),  //Normal
				new Texture("texture/" + texChoice + "/" + texture.toLowerCase() + ".alpha.jpg",  Texture.DEFAULT_SPECULAR_TEXTURE) //Specular
			], this);
		}
	}, this);
};

InteriorModel.prototype.render = function(projectionMat, viewMat) {
	var modelMat = mat4.create();

	//Nothing for model yet
	mat4.identity(modelMat);
	mat4.translate(modelMat, modelMat, this.position);

	//Don't try to render if we don't have a shader loaded
	Object.keys(this.shaders).forEach(function(shaderName) {
		var shader = this.shaders[shaderName];

		if (shader.loaded) {
			//Load shader outside of the materials loop to optimize
			shader.activate();

			//Render each material's textures
			Object.keys(shader.materials).forEach(function(matName) {
				var mat = shader.materials[matName];

				//Model tex allows us to know starts/counts for triangles
				var modelTex = this.model.textures[mat.index];

				var materialInfo = getMaterialInfo(this.model.textures[mat.index].texture);

				//Don't try to render if the texture is still loading
				if (mat.isLoaded()) {
					//Activate the model
					this.vbo.activate(shader);

					//Load the matrices into the shader
					gl.uniformMatrix4fv(shader.getUniformLocation("in_projection_mat"), false, projectionMat);
					gl.uniformMatrix4fv(shader.getUniformLocation("in_view_mat"), false, viewMat);
					gl.uniformMatrix4fv(shader.getUniformLocation("in_model_mat"), false, modelMat);

					//Get light values from the info
					gl.uniform4fv(shader.getUniformLocation("in_light_color"), materialInfo.lightColor);
					gl.uniform4fv(shader.getUniformLocation("in_ambient_color"), materialInfo.ambientColor);
					gl.uniform3fv(shader.getUniformLocation("in_sun_direction"), materialInfo.sunDirection);
					gl.uniform1f(shader.getUniformLocation("in_specular_exponent"), materialInfo.specularExponent);

					//Scale
					gl.uniform2fv(shader.getUniformLocation("in_scale"), materialInfo.scale);

					//Activate the current material
					mat.activate(shader, ["tex_diffuse", "tex_normal", "tex_specular"], [gl.TEXTURE0, gl.TEXTURE1, gl.TEXTURE2]);

					//Actually draw the thing!
					this.vbo.draw(modelTex.start * 3, modelTex.count * 3);

					//Deactivate everything for the next round
					mat.deactivate();
					this.vbo.deactivate(shader);
				}
			}, this);
			shader.deactivate();
		}
	}, this);
};
