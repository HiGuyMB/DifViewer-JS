function Texture(src, fallback) {
	this.fallback = fallback;
	this.usingFallback = false;

	this.tex = gl.createTexture();

	//Download the image data
	this.image = new Image();
	this.image.onload = this.imageLoaded.bind(this);
	this.image.onerror = this.imageError.bind(this);
	this.image.src = src;

	//So we can tell if we've loaded
	this.loaded = false;
}

Texture.DEFAULT_DIFFUSE_TEXTURE  = "assets/DefaultDiffuse.png";
Texture.DEFAULT_NORMAL_TEXTURE   = "assets/DefaultNormal.png";
Texture.DEFAULT_SPECULAR_TEXTURE = "assets/DefaultSpec.png";

Texture.prototype.imageLoaded = function() {
	//Set up the texture with the image data we downloaded
	gl.bindTexture(gl.TEXTURE_2D, this.tex);
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.image);

	//Wrap around so we have nice tiling
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);

	//Give us mipmapping so we don't render full-size at long distances
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
	gl.generateMipmap(gl.TEXTURE_2D);

	//Clean up
	gl.bindTexture(gl.TEXTURE_2D, null);
	this.loaded = true;
};

Texture.prototype.imageError = function() {
	if (this.usingFallback) {
		//TODO: Errors
	} else {
		this.usingFallback = true;
		this.image.src = this.fallback;
	}
};

Texture.prototype.activate = function(shader, uniform, location) {
	//Activate which texture we want and load it!
	gl.activeTexture(location);
	gl.bindTexture(gl.TEXTURE_2D, this.tex);
	gl.uniform1i(shader.getUniformLocation(uniform), Texture.locationToNumber(location));
};

Texture.prototype.deactivate = function() {
	gl.bindTexture(gl.TEXTURE_2D, null);
};

Texture.locationToNumber = function(location) {
	//Simple offset from texture 0
	return location - gl.TEXTURE0;
};
Texture.numberToLocation = function(number) {
	//Simple offset from texture 0
	return number + gl.TEXTURE0;
};