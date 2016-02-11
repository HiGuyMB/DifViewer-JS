function VBO(data, type, stride, count) {
	//Store some basic info about the vbo
	this.stride = stride;
	this.type = type;
	this.count = count;

	//Attribute list for shaders
	this.attributes = [];

	//Why not? Create the buffer now
	this.buffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
}

VBO.prototype.addAttribute = function(name, size, type, normalized, offset) {
	//Just push it as an object, we can deal with it later
	this.attributes.push({
		name: name,
		size: size,
		type: type,
		normalized: normalized,
		offset: offset
	});
};

VBO.prototype.activate = function(shader) {
	//Bind our buffer before doing anything with attributes
	gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);

	//Enable each of them and load their settings into the GL
	this.attributes.forEach(function(attribute) {
		var location = shader.getAttributeLocation(attribute.name);
		if (location != -1) {
			gl.enableVertexAttribArray(location);
			gl.vertexAttribPointer(location, attribute.size, attribute.type, attribute.normalized, this.stride * 4, attribute.offset * 4);
		}
	}, this);
};

VBO.prototype.draw = function(start, count) {
	//Default parameters in case you just want to draw everything
	start = start || 0;
	count = count || this.count;

	gl.drawArrays(this.type, start, count);
};

VBO.prototype.deactivate = function(shader) {
	//Disable each of them
	this.attributes.forEach(function(attribute) {
		var location = shader.getAttributeLocation(attribute.name);
		if (location != -1) {
			gl.disableVertexAttribArray(location);
		}
	});

	//And finally unbind our buffer
	gl.bindBuffer(gl.ARRAY_BUFFER, null);
};
