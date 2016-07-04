function MaterialInfo(info) {
	this.scale = [1.0, 1.0];

	Object.keys(info).forEach(function(key) {
		if (info.hasOwnProperty(key)) {
			this[key] = info[key];
		}
	}, this);
}

var defaultMaterial = new MaterialInfo({});

var materialMap = {};

materialMap["tile_advanced_blue_shadow_tiny"]      = new MaterialInfo({scale: [0.25, 0.25], replacement: "tile_advanced_blue_shadow"});
materialMap["tile_advanced_green_shadow_tiny"]     = new MaterialInfo({scale: [0.25, 0.25], replacement: "tile_advanced_green_shadow"});
materialMap["tile_advanced_shadow_tiny"]           = new MaterialInfo({scale: [0.25, 0.25], replacement: "tile_advanced_shadow"});
materialMap["tile_beginner_blue_shadow_tiny"]      = new MaterialInfo({scale: [0.25, 0.25], replacement: "tile_beginner_blue_shadow"});
materialMap["tile_beginner_red_shadow_tiny"]       = new MaterialInfo({scale: [0.25, 0.25], replacement: "tile_beginner_red_shadow"});
materialMap["tile_beginner_shadow_tiny"]           = new MaterialInfo({scale: [0.25, 0.25], replacement: "tile_beginner_shadow"});
materialMap["tile_intermediate_green_shadow_tiny"] = new MaterialInfo({scale: [0.25, 0.25], replacement: "tile_intermediate_green_shadow"});
materialMap["tile_intermediate_red_shadow_tiny"]   = new MaterialInfo({scale: [0.25, 0.25], replacement: "tile_intermediate_red_shadow"});
materialMap["tile_intermediate_shadow_tiny"]       = new MaterialInfo({scale: [0.25, 0.25], replacement: "tile_intermediate_shadow"});

materialMap["plate_1"]       = new MaterialInfo({scale: [0.5, 0.5]});
materialMap["friction_high"] = new MaterialInfo({scale: [0.5, 0.5]});

function getMaterialInfo(material) {
	var info = materialMap[material];
	if (typeof(info) === "undefined") {
		info = defaultMaterial;
	}
	return info;
}
