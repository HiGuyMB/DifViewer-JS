function BoxF(minx, miny, minz, maxx, maxy, maxz) {
	this.minx = minx;
	this.miny = miny;
	this.minz = minz;
	this.maxx = maxx;
	this.maxy = maxy;
	this.maxz = maxz;
}

Reader.prototype.readBoxF = function() {
	return new BoxF(this.readF32(), this.readF32(), this.readF32(), this.readF32(), this.readF32(), this.readF32());
};

function SphereF(originx, originy, originz, radius) {
	this.originx = originx;
	this.originy = originy;
	this.originz = originz;
	this.radius = radius;
}

Reader.prototype.readSphereF = function() {
	return new SphereF(this.readF32(), this.readF32(), this.readF32(), this.readF32());
};

Reader.prototype.readPoint3F = function() {
	return [this.readF32(), this.readF32(), this.readF32()];
};

Reader.prototype.readPoint4F = function() {
	return [this.readF32(), this.readF32(), this.readF32(), this.readF32()];
};

function PlaneF(x, y, z, d) {
	this.x = x;
	this.y = y;
	this.z = z;
	this.d = d;
}

Reader.prototype.readPlaneF= function() {
	return new PlaneF(this.readF32(), this.readF32(), this.readF32(), this.readF32());
};