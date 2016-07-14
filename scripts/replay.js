var showReplay = false;
var replay = null;

var replayStart = 0;
var replayCurrent = 0;
var replayFrame = 0;

var replaySpheres = [];
var replaySphereFollow = 0;

function isRunningReplay() {
	return showReplay && replay != null;
}

function setReplay(r) {
	replay = r;

	replayStart = r.recdata[0].time;
	replayCurrent = 0;
	replayFrame = 0;
}

function updateReplay(delta) {
	replayCurrent += delta;

	if (replayCurrent > (replay.recdata[replayFrame].time - replayStart)) {
		replayFrame ++;
	}
}

function createReplaySphere(i) {
	var sphere = new Sphere(0.2);
	replaySpheres.push(sphere);
}

function replayRender(projectionMat, viewMat) {
	document.getElementById("test").innerHTML = JSON.stringify(replay.recdata[replayFrame]);

	var frame = replay.recdata[replayFrame];
	var players = frame.players;
	var gems = frame.gems;

	for (var i = 0; i < players.length; i ++) {
		if (replaySpheres.length <= i) {
			createReplaySphere(i);
		}

		var sphere = replaySpheres[i];
		var playerFrame = players[i];

		var pos = playerFrame.pos;
		var rot = playerFrame.rot;
		var rotMat = mat4.fromRotation(mat4.create(), -rot[3], vec3.fromValues(rot[0], rot[1], rot[2]));

		var modelMat = mat4.create();
		mat4.translate(modelMat, modelMat, pos);
		mat4.mul(modelMat, modelMat, rotMat);

		sphere.render(projectionMat, viewMat, modelMat);

		if (i === replaySphereFollow) {
			cameraRotation[0] = playerFrame.cam[0];
			cameraRotation[1] = playerFrame.cam[1];

			cameraPosition = pos;
		}
	}
}
