function Material(index, textures) {
	this.index = index;
	this.textures = textures;
}

Material.prototype.activate = function(shader, uniforms, locations) {
	//Activate each of our textures at the given uniform and location
	uniforms.forEach(function(uniform, index) {
		var location = locations[index];
		var texture = this.textures[index];

		texture.activate(shader, uniform, location);
	}, this);
};

Material.prototype.deactivate = function() {
	//Deactivate everything
	this.textures.forEach(function(texture) {
		texture.deactivate();
	});
};

Material.prototype.isLoaded = function() {
	//Check if all of our textures are loaded, if any are not finished then we're not loaded.
	return this.textures.reduce(function(loaded, texture) {
		return loaded && texture.loaded;
	}, true);
};