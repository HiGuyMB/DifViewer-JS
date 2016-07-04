function Interior() {

}

Interior.prototype.read = function(reader) {
	this.version = reader.readU32();
	this.detailLevel = reader.readU32();
	this.minPixels = reader.readU32();
	this.boundingBox = reader.readBoxF();
	this.boundingSphere = reader.readSphereF();
	this.hasAlarmState = reader.readU8();
	this.lightStateEntry = reader.readArray(reader.readU32.bind(reader));
	this.normal = reader.readArray(reader.readPoint3F.bind(reader));
	this.plane = reader.readArray(reader.readPlane.bind(reader));
	this.point = reader.readArray(reader.readPoint3F.bind(reader));
	this.pointVisibility = reader.readArray(reader.readU8.bind(reader));
	this.texGenEq = reader.readArray(reader.readTexGenEQ.bind(reader));
	this.bspNode = reader.readArray(reader.readBSPNode.bind(reader));
	this.bspSolidLeaf = reader.readArray(reader.readBSPSolidLeaf.bind(reader));
	this.materialVersion = reader.readU8();
	this.material = reader.readArray(reader.readString.bind(reader));
	this.index = reader.readArray(reader.readU32.bind(reader));
	this.windingIndex = reader.readArray(reader.readWindingIndex.bind(reader));
	this.zone = reader.readArray(reader.readZone.bind(reader));
	this.zoneSurface = reader.readArray(reader.readU16.bind(reader));
	this.zonePortalList = reader.readArray(reader.readU16.bind(reader));
	this.portal = reader.readArray(reader.readPortal.bind(reader));
	this.surface = reader.readArray(reader.readSurface.bind(reader));
	this.normalLMapIndex = reader.readArray(reader.readU8.bind(reader));
	this.alarmLMapIndex = reader.readArray(reader.readU8.bind(reader));
	this.nullSurface = reader.readArray(reader.readNullSurface.bind(reader));
	this.lightMap = reader.readArray(reader.readLightMap.bind(reader));
	this.solidLeafSurface = reader.readArray(reader.readU32.bind(reader));
	this.animatedLight = reader.readArray(reader.readAnimatedLight.bind(reader));
	this.lightState = reader.readArray(reader.readLightState.bind(reader));
	this.stateData = reader.readArray(reader.readStateData.bind(reader));
	this.stateDataBuffer = reader.readArrayFlags(reader.readU8.bind(reader));
	this.nameBufferCharacter = reader.readArray(reader.readU8.bind(reader));
	this.subObjects = reader.readArray(function(){});
	this.convexHull = reader.readArray(reader.readConvexHull.bind(reader));
	this.convexHullEmitStringCharacter = reader.readArray(reader.readU8.bind(reader));
	this.hullIndex = reader.readArray(reader.readU32.bind(reader));
	this.hullPlaneIndex = reader.readArray(reader.readU16.bind(reader));
	this.hullEmitStringIndex = reader.readArray(reader.readU32.bind(reader));
	this.hullSurfaceIndex = reader.readArray(reader.readU32.bind(reader));
	this.polyListPlaneIndex = reader.readArray(reader.readU16.bind(reader));
	this.polyListPointIndex = reader.readArray(reader.readU32.bind(reader));
	this.polyListStringCharacter = reader.readArray(reader.readU8.bind(reader));

	this.coordBin = [];
	for (var i = 0; i < 16*16; i ++) {
		this.coordBin.push(reader.readCoordBin());
	}

	this.coordBinIndex = reader.readArray(reader.readU16.bind(reader));
	this.coordBinMode = reader.readU32();
	this.baseAmbientColor = reader.readColorF();
	this.alarmAmbientColor = reader.readColorF();
	this.texNormal = reader.readArray(reader.readPoint3F.bind(reader));
	this.texMatrix = reader.readArray(reader.readTexMatrix.bind(reader));
	this.texMatIndex = reader.readArray(reader.readU32.bind(reader));
	this.extendedLightMapData = reader.readU32();
	if (this.extendedLightMapData) {
		this.lightMapBorderSize = reader.readU32();
		reader.readU32();
	}
};

function Plane(normalIndex, planeDistance) {
	this.normalIndex = normalIndex;
	this.planeDistance = planeDistance;
}

Reader.prototype.readPlane = function() {
	return new Plane(this.readU16(), this.readF32());
};

function TexGenEQ(planeX, planeY) {
	this.planeX = planeX;
	this.planeY = planeY;
}

Reader.prototype.readTexGenEQ = function() {
	return new TexGenEQ(this.readPlaneF(), this.readPlaneF());
};

function BSPNode(planeIndex, frontIndex, backIndex) {
	this.planeIndex = planeIndex;
	this.frontIndex = frontIndex;
	this.backIndex = backIndex;
}

Reader.prototype.readBSPNode = function() {
	return new BSPNode(this.readU16(), this.readU16(), this.readU16());
};

function BSPSolidLeaf(surfaceIndex, surfaceCount) {
	this.surfaceIndex = surfaceIndex;
	this.surfaceCount = surfaceCount;
}

Reader.prototype.readBSPSolidLeaf = function() {
	return new BSPSolidLeaf(this.readU32(), this.readU16());
};

function WindingIndex(windingStart, windingCount) {
	this.windingStart = windingStart;
	this.windingCount = windingCount;
}

Reader.prototype.readWindingIndex = function() {
	return new WindingIndex(this.readU32(), this.readU32());
};

function Zone(portalStart, portalCount, surfaceStart, surfaceCount) {
	this.portalStart = portalStart;
	this.portalCount = portalCount;
	this.surfaceStart = surfaceStart;
	this.surfaceCount = surfaceCount;
}

Reader.prototype.readZone = function() {
	return new Zone(this.readU16(), this.readU16(), this.readU32(), this.readU32());
};

function Portal(planeIndex, triFanCount, triFanStart, zoneFront, zoneBack) {
	this.planeIndex = planeIndex;
	this.triFanCount = triFanCount;
	this.triFanStart = triFanStart;
	this.zoneFront = zoneFront;
	this.zoneBack = zoneBack;
}

Reader.prototype.readPortal = function() {
	return new Portal(this.readU16(), this.readU16(), this.readU32(), this.readU16(), this.readU16());
};

function Surface() {

}

Surface.prototype.read = function(reader) {
	this.windingStart = reader.readU32();
	this.windingCount = reader.readU8();
	var plane = reader.readU16();
	this.planeFlipped = (plane >> 15 != 0);
	this.planeIndex = (plane & ~0x8000);
	this.textureIndex = reader.readU16();
	this.texGenIndex = reader.readU32();
	this.surfaceFlags = reader.readU8();
	this.fanMask = reader.readU32();
	this.lightMap = {};
	this.lightMap.finalWord = reader.readU16();
	this.lightMap.texGenXDistance = reader.readF32();
	this.lightMap.texGenYDistance = reader.readF32();
	this.lightCount = reader.readU16();
	this.lightStateInfoStart = reader.readU32();
	this.mapOffsetX = reader.readU8();
	this.mapOffsetY = reader.readU8();
	this.mapSizeX = reader.readU8();
	this.mapSizeY = reader.readU8();
};

Reader.prototype.readSurface = function() {
	var surface = new Surface();
	surface.read(this);
	return surface;
};

function NullSurface(vertex0, vertex1, normal0, normal1) {
	this.vertex0 = vertex0;
	this.vertex1 = vertex1;
	this.normal0 = normal0;
	this.normal1 = normal1;
}

Reader.prototype.readNullSurface = function() {
	return new NullSurface(this.readU32(), this.readU32(), this.readU32(), this.readU32());
};

function LightMap(lightMap, keepLightMap) {
	this.lightMap = lightMap;
	this.keepLightMap = keepLightMap;
}

Reader.prototype.readLightMap = function() {
	return new LightMap(this.readPNG(), this.readU8());
};

function AnimatedLight(nameIndex, stateIndex, stateCount, flags, duration) {
	this.nameIndex = nameIndex;
	this.stateIndex = stateIndex;
	this.stateCount = stateCount;
	this.flags = flags;
	this.duration = duration;
}

Reader.prototype.readAnimatedLight = function() {
	return new AnimatedLight(this.readU32(), this.readU32(), this.readU16(), this.readU16(), this.readU32())
};

function LightState(red, green, blue, activeTime, dataIndex, dataCount) {
	this.red = red;
	this.green = green;
	this.blue = blue;
	this.activeTime = activeTime;
	this.dataIndex = dataIndex;
	this.dataCount = dataCount;
}

Reader.prototype.readLightState = function() {
	return new LightState(this.readU8(), this.readU8(), this.readU8(), this.readU32(), this.readU32(), this.readU16());
};

function StateData(surfaceIndex, mapIndex, lightStateIndex) {
	this.surfaceIndex = surfaceIndex;
	this.mapIndex = mapIndex;
	this.lightStateIndex = lightStateIndex;
}

Reader.prototype.readStateData = function() {
	return new StateData(this.readU32(), this.readU32(), this.readU16());
};

function ConvexHull() {

}

ConvexHull.prototype.read = function(reader) {
	this.hullStart = reader.readU32();
	this.hullCount = reader.readU16();
	this.minX = reader.readF32();
	this.maxX = reader.readF32();
	this.minY = reader.readF32();
	this.maxY = reader.readF32();
	this.minZ = reader.readF32();
	this.maxZ = reader.readF32();
	this.surfaceStart = reader.readU32();
	this.surfaceCount = reader.readU16();
	this.planeStart = reader.readU32();
	this.polyListPlaneStart = reader.readU32();
	this.polyListPointStart = reader.readU32();
	this.polyListStringStart = reader.readU32();
};

Reader.prototype.readConvexHull = function() {
	var hull = new ConvexHull();
	hull.read(this);
	return hull;
};

function CoordBin(binStart, binCount) {
	this.binStart = binStart;
	this.binCount = binCount;
}

Reader.prototype.readCoordBin = function() {
	return new CoordBin(this.readU32(), this.readU32());
};

function TexMatrix(t, n, b) {
	this.t = t;
	this.n = n;
	this.b = b;
}

Reader.prototype.readTexMatrix = function() {
	return new TexMatrix(this.readU32(), this.readU32(), this.readU32());
};