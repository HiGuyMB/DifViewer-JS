//If the pointer is locked
var pointerLock = false;

//Movement keys state
var keyState = {
	forward: false,
	backward: false,
	left: false,
	right: false,
	jump: false
};

var inputKeys = [
	{"action": "forward",  "keyCode": 87}, //w
	{"action": "backward", "keyCode": 82}, //r
	{"action": "left",     "keyCode": 65}, //a
	{"action": "right",    "keyCode": 83}, //s
	{"action": "jump",     "keyCode": 32} //space
];

//Mouse button state (just as an array)
var mouseState = [];

function initInput() {
	//Need all of these to be compatible apparently because some people still use old browsers
	document.addEventListener("pointerlockchange", pointerLockChange, false);
	document.addEventListener("mozpointerlockchange", pointerLockChange, false);
	document.addEventListener("webkitpointerlockchange", pointerLockChange, false);
	//Same goes for error
	document.addEventListener("pointerlockerror", pointerLockError, false);
	document.addEventListener("mozpointerlockerror", pointerLockError, false);
	document.addEventListener("webkitpointerlockerror", pointerLockError, false);

	canvas.requestPointerLock = canvas.requestPointerLock ||
		canvas.mozRequestPointerLock ||
		canvas.webkitRequestPointerLock;

	if (canvas.requestPointerLock) {
		canvas.requestPointerLock();
	} else {
		//TODO: Display a "use Chrome or Firefox" message here
	}

	function pointerLockError(e) {
		//TODO: Display a click here screen or something
		// alert("Could not capture cursor");
	}

	function pointerLockChange(e) {
		//Check if we're locked to our element
		pointerLock = (
			document.pointerLockElement === canvas ||
			document.mozPointerLockElement === canvas ||
			document.webkitPointerLockElement === canvas
		);
	}

	document.onkeydown = function(e) {
		inputKeys.forEach(function(info) {
			if (e.keyCode === info.keyCode) {
				keyState[info.action] = true;
			}
		});
	};

	document.onkeyup = function(e) {
		inputKeys.forEach(function(info) {
			if (e.keyCode === info.keyCode) {
				keyState[info.action] = false;
			}
		});
	};

	document.onmousemove = function(e) {
		if (pointerLock) {
			//TODO: Adjustable this
			cameraRotation[0] += e.movementX * 0.01;
			cameraRotation[1] += e.movementY * 0.01;
		}
	};

	document.onclick = function(/* e */) {
		if (canvas.requestPointerLock) {
			canvas.requestPointerLock();
		} else {
			//TODO: Display a "use Chrome or Firefox" message here
		}
	};

	document.onmousedown = function(e) {
		mouseState[e.button] = true;
	};

	document.onmouseup = function(e) {
		mouseState[e.button] = false;
	};

	window.requestAnimFrame = (function() {
		//Super robust animation frame method that works basically everywhere
		// http://www.paulirish.com/2011/requestanimationframe-for-smart-animating/
		return window.requestAnimationFrame ||
			window.webkitRequestAnimationFrame ||
			window.mozRequestAnimationFrame ||
			window.oRequestAnimationFrame ||
			window.msRequestAnimationFrame ||
			function(callback) {
				window.setTimeout(callback, 1000 / 60);
			};
	})();
}