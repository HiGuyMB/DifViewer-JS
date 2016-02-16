function ammoVec3(jsVec) {
	return new Ammo.btVector3(jsVec[0], jsVec[1], jsVec[2]);
}

function jsVec3(ammoVec) {
	return [ammoVec.x(), ammoVec.y(), ammoVec.z()];
}

function ammoQuat(jsQuat) {
	return new Ammo.btQuaternion(jsQuat[0], jsQuat[1], jsQuat[2], jsQuat[3]);
}

function jsQuat(ammoQuat) {
	return [ammoQuat.x(), ammoQuat.y(), ammoQuat.z(), ammoQuat.w()];
}

mat4.getPosition = function(out, mat) {
	out[0] = mat[12];
	out[1] = mat[13];
	out[2] = mat[14];
};


