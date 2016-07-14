var obviousMats = [
	{album: "mbg", textures:[
		"grid_cool",
		"grid_cool2",
		"grid_cool3",
		"grid_cool4",
		"grid_neutral",
		"grid_neutral1",
		"grid_neutral2",
		"grid_neutral3",
		"grid_neutral4",
		"grid_warm",
		"grid_warm1",
		"grid_warm2",
		"grid_warm3",
		"grid_warm4.jpg",
		"pattern_cool2"
	]},
	{album: "mbp", textures:[
		"mbp_hot2",
		"mbp_hot3",
		"mbp_hot4",
		"mbp_hot5",
		"mbp_hot6",
		"mbp_hot7",
		"mbp_neon1",
		"mbp_neon2",
		"mbp_neon3",
		"mbu_grid_blue1",
		"mbu_grid_cool1",
		"mbu_grid_green1",
		"mbu_grid_green2",
		"mbu_grid_hot1",
		"mbu_grid_neutral1",
		"mbu_grid_warm5",
		"mbu_neutral",
		"mbu_neutral2",
		"mbu_neutral3",
		"mbu_neutral4",
		"mbu_neutral5",
		"mbu_pattern_cool2"
	]},
	{album: "mbu", textures:[
		"plate_1",
		"tile_advanced_blue_shadow",
		"tile_advanced_blue",
		"tile_advanced_green_shadow",
		"tile_advanced_green",
		"tile_advanced_shadow",
		"tile_advanced",
		"tile_beginner_blue_shadow",
		"tile_beginner_blue",
		"tile_beginner_red_shadow",
		"tile_beginner_red",
		"tile_beginner_shadow",
		"tile_beginner",
		"tile_intermediate_green_shadow",
		"tile_intermediate_green",
		"tile_intermediate_red_shadow",
		"tile_intermediate_red",
		"tile_intermediate_shadow",
		"tile_intermediate",
		"tile_underside"
	]}
];

document.getElementById("picker").addEventListener("change", function (e) {
	var files = e.target.files;
	for (var i = 0; i < files.length; i ++) {
		var file = files[i];

		var reader = new FileReader();
		reader.onload = (function(file) {
			return function(e) {
				var raw = e.target.result;
				var rawBytes = new Uint8Array(raw);

				var dif = new DIF(rawBytes);
				var model = dif.getModel(0);
				models.push(new InteriorModel(model));

				var textures = dif.interiors[0].material;
				obviousMats.forEach(function(group) {
					var album = group.album;
					group.textures.forEach(function(texture) {
						if (textures.indexOf(texture) != -1) {
							var picker = document.getElementById("texChoice");
							for (var index = 0; index < picker.children.length; index ++) {
								var child = picker.children[index];
								if (child.value == album)
									picker.selectedIndex = index;
							}
							texChoice = album;
						}
					});
				});

				var infoTable = document.getElementById("difInfo");

				var container = document.createElement("tr");

				//Delete button
				var deleter = document.createElement("input");
				deleter.setAttribute("type", "submit");
				deleter.value = "×";
				deleter.addEventListener("click", function(e) {
					//Remove model
					models.splice(models.indexOf(model), 1);
					//Remove button
					infoTable.removeChild(container);
				}, false);
				var delcol = document.createElement("td");
				delcol.appendChild(deleter);
				container.appendChild(delcol);

				var namer = document.createElement("td");
				namer.innerHTML = file.name + " (" + rawBytes.length + " bytes): ";
				namer.innerHTML += "Loaded " + dif.interiors.length + " interior(s), " + dif.interiors[0].surface.length + " surface(s)";
				container.appendChild(namer);

				infoTable.appendChild(container);

			};
		})(file);
		reader.readAsArrayBuffer(file);
	}
}, false);

document.getElementById("load").addEventListener("click", function(e) {
	physics = document.getElementById("physics").checked;
	customShaders = document.getElementById("shaders").checked;

	var picker = document.getElementById("skyChoice");
	skyChoice = picker.children[picker.selectedIndex].value;

	picker = document.getElementById("texChoice");
	texChoice = picker.children[picker.selectedIndex].value;

	initGL();
}, false);

[
	{"id": "controlLeft", "action": "left"}, 
	{"id": "controlRight", "action": "right"}, 
	{"id": "controlForward", "action": "forward"}, 
	{"id": "controlBackward", "action": "backward"}
].forEach(function(options) {
	var input = document.getElementById(options.id);

	var inputKey = inputKeys.find(function(info) {
		return info.action === options.action;
	});
	input.innerText = String.fromCharCode(inputKey.keyCode);

	input.addEventListener("click", function(e) {
		input.classList.add("active");
		var listener = function(e) {
			input.classList.remove("active");

			document.removeEventListener("keydown", listener, false);

			input.innerText = String.fromCharCode(e.keyCode);
			inputKey.keyCode = e.keyCode;
		};
		document.addEventListener("keydown", listener, false);
	}, false);
});

document.getElementById("replayCheck").addEventListener("click", function(e) {
	showReplay = !showReplay;
	if (showReplay) {
		document.getElementById("replayBox").style.display = "block";
	} else {
		document.getElementById("replayBox").style.display = "none";
	}
});

document.getElementById("replayPicker").addEventListener("change", function(e) {
	var files = e.target.files;
	for (var i = 0; i < files.length; i ++) {
		var file = files[i];

		var reader = new FileReader();
		reader.onload = (function(file) {
			return function(e) {
				var raw = e.target.result;

				var infoDiv = document.getElementById("replayInfo");
				var replay;

				try {
					replay = JSON.parse(raw);
				} catch (err) {
					infoDiv.innerHTML = "Error.";
					return;
				}

				infoDiv.innerHTML = "Loaded replay " + file.name;

				setReplay(replay);
			};
		})(file);
		reader.readAsText(file);
	}
}, true);
