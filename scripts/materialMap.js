function MaterialInfo(info) {
	this.scale = [1.0, 1.0];
	this.lightColor = [1.08, 1.03, 0.9, 1.0];
	this.ambientColor = [0.4, 0.4, 0.5, 1.0];
	this.sunDirection = [0.573201, 0.275357, -0.771764];
	this.specularExponent = 7;
	this.shader = "default";

	Object.keys(info).forEach(function(key) {
		if (info.hasOwnProperty(key)) {
			this[key] = info[key];
		}
	}, this);
}

var defaultMaterial = new MaterialInfo({});

var materialMap = {};

materialMap["tile_advanced_blue_shadow_tiny"]      = new MaterialInfo({scale: [0.25, 0.25], shader: "noise", replacement: "tile_advanced_blue_shadow"});
materialMap["tile_advanced_green_shadow_tiny"]     = new MaterialInfo({scale: [0.25, 0.25], shader: "noise", replacement: "tile_advanced_green_shadow"});
materialMap["tile_advanced_shadow_tiny"]           = new MaterialInfo({scale: [0.25, 0.25], shader: "noise", replacement: "tile_advanced_shadow"});
materialMap["tile_beginner_blue_shadow_tiny"]      = new MaterialInfo({scale: [0.25, 0.25], shader: "noise", replacement: "tile_beginner_blue_shadow"});
materialMap["tile_beginner_red_shadow_tiny"]       = new MaterialInfo({scale: [0.25, 0.25], shader: "noise", replacement: "tile_beginner_red_shadow"});
materialMap["tile_beginner_shadow_tiny"]           = new MaterialInfo({scale: [0.25, 0.25], shader: "noise", replacement: "tile_beginner_shadow"});
materialMap["tile_intermediate_green_shadow_tiny"] = new MaterialInfo({scale: [0.25, 0.25], shader: "noise", replacement: "tile_intermediate_green_shadow"});
materialMap["tile_intermediate_red_shadow_tiny"]   = new MaterialInfo({scale: [0.25, 0.25], shader: "noise", replacement: "tile_intermediate_red_shadow"});
materialMap["tile_intermediate_shadow_tiny"]       = new MaterialInfo({scale: [0.25, 0.25], shader: "noise", replacement: "tile_intermediate_shadow"});

materialMap["tile_advanced_blue_shadow"]      = new MaterialInfo({shader: "noise"});
materialMap["tile_advanced_blue"]             = new MaterialInfo({shader: "noise"});
materialMap["tile_advanced_green_shadow"]     = new MaterialInfo({shader: "noise"});
materialMap["tile_advanced_green"]            = new MaterialInfo({shader: "noise"});
materialMap["tile_advanced_shadow"]           = new MaterialInfo({shader: "noise"});
materialMap["tile_advanced"]                  = new MaterialInfo({shader: "noise"});
materialMap["tile_beginner_blue_shadow"]      = new MaterialInfo({shader: "noise"});
materialMap["tile_beginner_blue"]             = new MaterialInfo({shader: "noise"});
materialMap["tile_beginner_red_shadow"]       = new MaterialInfo({shader: "noise"});
materialMap["tile_beginner_red"]              = new MaterialInfo({shader: "noise"});
materialMap["tile_beginner_shadow"]           = new MaterialInfo({shader: "noise"});
materialMap["tile_beginner"]                  = new MaterialInfo({shader: "noise"});
materialMap["tile_intermediate_green_shadow"] = new MaterialInfo({shader: "noise"});
materialMap["tile_intermediate_green"]        = new MaterialInfo({shader: "noise"});
materialMap["tile_intermediate_red_shadow"]   = new MaterialInfo({shader: "noise"});
materialMap["tile_intermediate_red"]          = new MaterialInfo({shader: "noise"});
materialMap["tile_intermediate_shadow"]       = new MaterialInfo({shader: "noise"});
materialMap["tile_intermediate"]              = new MaterialInfo({shader: "noise"});

materialMap["plate_1"]       = new MaterialInfo({scale: [0.5, 0.5]});
materialMap["friction_high"] = new MaterialInfo({scale: [2, 2]});

function getMaterialInfo(material) {
	var info = materialMap[material];
	if (typeof(info) === "undefined") {
		info = defaultMaterial;
	}
	return info;
}
