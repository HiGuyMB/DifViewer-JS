function Shader(vertSrc, fragSrc) {
	this.attributes = {};
	this.uniforms = {};
	this.materials = {};

	//So we can tell if we're still downloading
	this.loaded = false;

	//Download the vertex and fragment shaders
	var shader = this;
	Shader.downloadShader(vertSrc, function(code) {
		if (code !== null) {
			//Try and load the shader from the downloaded source
			shader.vert = Shader.loadShader(code, gl.VERTEX_SHADER);
		} else {
			//If this shader failed, there's no need to wait. We've failed.
			shader.finalize();
		}
		//If the other shader already loaded, then we can go ahead and create the program
		if (typeof(shader.frag) !== "undefined") {
			shader.finalize();
		}
	});
	Shader.downloadShader(fragSrc, function(code) {
		if (code !== null) {
			//Try and load the shader from the downloaded source
			shader.frag = Shader.loadShader(code, gl.FRAGMENT_SHADER);
		} else {
			//If this shader failed, there's no need to wait. We've failed.
			shader.finalize();
		}
		//If the other shader already loaded, then we can go ahead and create the program
		if (typeof(shader.vert) !== "undefined") {
			shader.finalize();
		}
	});
}

Shader.prototype.finalize = function() {
	//Make sure our vert/frag load correctly
	if (this.vert === null || this.frag === null) {
		alert("Shader fail");
		this.program = null;
		return;
	}

	//Link everything together
	this.program = gl.createProgram();
	gl.attachShader(this.program, this.vert);
	gl.attachShader(this.program, this.frag);
	gl.linkProgram(this.program);

	//Make sure it succeeded
	if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
		alert(gl.getProgramInfoLog(this.program));
		this.program = null;
	}

	this.loaded = true;
};

Shader.downloadShader = function(src, callback) {
	//Send an XHR to get the shader's contents
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function() {
		if (this.readyState === this.DONE) {
			if (this.status === 200) {
				//Found it, let us know
				callback(this.responseText);
			} else {
				//Could not find it?
				callback(null);
			}
		}
	};
	//Actually get it
	xhr.open("GET", src);
	xhr.send();
};

Shader.loadShader = function(source, type) {
	//Create and compile the shader
	var shader = gl.createShader(type);
	gl.shaderSource(shader, source);
	gl.compileShader(shader);

	//If the link failed, don't use the shader
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		alert(gl.getShaderInfoLog(shader));
		return null;
	}
	return shader;
};

Shader.prototype.activate = function() {
	gl.useProgram(this.program);
};

Shader.prototype.deactivate = function() {
	gl.useProgram(null);
};

Shader.prototype.getAttributeLocation = function(name) {
	//Cache attribute locations to speed up the rendering
	if (typeof(this.attributes[name]) === "undefined") {
		this.attributes[name] = gl.getAttribLocation(this.program, name);
	}
	return this.attributes[name];
};

Shader.prototype.getUniformLocation = function(name) {
	//Cache uniform locations to speed up the rendering
	if (typeof(this.uniforms[name]) === "undefined") {
		this.uniforms[name] = gl.getUniformLocation(this.program, name);
	}
	return this.uniforms[name];
};
