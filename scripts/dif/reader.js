function Reader(bytes) {
	this.bytes = bytes;
	this.position = 0;
}

Reader.prototype.readU8 = function() {
	return this.bytes[this.position ++];
};

Reader.prototype.readU16 = function() {
	return this.readU8() | (this.readU8() << 8);
};

Reader.prototype.readU32 = function() {
	return this.readU16() | (this.readU16() << 16);
};

Reader.prototype.readF32 = function() {
	var buffer = new ArrayBuffer(4);
	var intView = new Int32Array(buffer);
	var floatView = new Float32Array(buffer);
	intView[0] = this.readU32();
	return floatView[0];
};

Reader.prototype.readString = function() {
	var length = this.readU8();
	var str = "";
	for (var i = 0; i < length; i ++) {
		str += String.fromCharCode(this.readU8());
	}
	return str;
};

Reader.prototype.readDictionary = function() {
	var length = this.readU32();
	var dict = {};

	for (var i = 0; i < length; i ++) {
		var name = this.readString();
		var value = this.readString();

		dict[name] = value;
	}
	return dict;
};

Reader.prototype.readArray = function(readMethod) {
	var length = this.readU32();
	var array = [];
	for (var i = 0; i < length; i ++) {
		array.push(readMethod());
	}
	return array;
};

Reader.prototype.readArrayFlags = function(readMethod) {
	var length = this.readU32();
	var flags = this.readU32();
	var array = [];
	for (var i = 0; i < length; i ++) {
		array.push(readMethod());
	}
	return array;
};

Reader.prototype.readPNG = function() {
	var footer = [0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82];

	//I can't parse these, so I just read em all
	var data = [];
	while (true) {
		data.push(this.readU8());

		if (data.length >= 8) {
			var match = true;
			for (var i = 0; i < 8; i ++) {
				if (data[i + (data.length - 8)] !== footer[i]) {
					match = false;
					break;
				}
			}
			if (match)
				break;
		}
	}

	return data;
};

Reader.prototype.readColorF = function() {
	return [this.readU8(), this.readU8(), this.readU8(), this.readU8()];
};