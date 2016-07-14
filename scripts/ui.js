function handleDifSelect(e) {
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
}

document.getElementById("picker").addEventListener("change", handleDifSelect, false);

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