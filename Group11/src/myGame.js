var moveSpeed = 2;
var enemySpeedScale = 0.005;
var maxTrackingDistance = 5;
var doWander = false;
var allTokensFound = false;
var topViewCount = 4; // only 3 tries for top down view

var score = document.getElementsByTagName('h2')[0];
var seconds = 0, minutes = 0, hours = 0;
var t;

var timerBegin = false;

function startTime() {
	seconds++; // add seconds
	if (seconds >= 60) { // if seconds is 60 or over, change minutes
		seconds = 0;
		minutes++;
		if (minutes >= 60) { // if minutes go over 60 change hours
			hours++;
		}
	}
	// write in html
	score.textContent = (hours ? (hours > 9 ? hours : "0" + hours) : "00") + ":" + (minutes ? (minutes > 9 ? minutes : "0" + minutes) : "00") + ":" + (seconds > 9 ? seconds : "0" + seconds);
	timer();
}

function timer() {
	t = setTimeout(startTime, 1000);
}

function startGame(state) {
    document.addEventListener("contextmenu", function (e) {
        e.preventDefault();
    }, false);

    for (let i = 0; i < state.objectCount; i++) {
        if (state.objects[i].name === "token"){
            state.tokens += 1;
        }
    }
	
    gameRunning = true;

    updateTokens(state);
    updatePlayerPos(state);
    updateEnemyPositions(state);

    for (let i = 0; i < state.objectCount; i++) {
        if (state.objects[i].name === "enemy" || state.objects[i].name === "player") {
            state.objects[i].loaded = false;
        }
    }

    document.addEventListener('mousemove', (event) => {
        //handle right click
        if (event.buttons == 2) {
            state.mouse['camMove'] = true;
            state.mouse.rateX = event.movementX;
        }
    });

    document.addEventListener('mouseup', (event) => {
        state.mouse['camMove'] = false;
        state.mouse.rateX = 0;
    })		

    document.addEventListener('keypress', (event) => {
        switch (event.code) {
            case "Space":
				startTime();
				state.timeBegin = true;
				state.keyboard[event.key] = true;
				myMusic = new sound("./sounds/bg_music.mp3");
				myMusic.play();

			case "KeyW":
				if (!state.timeBegin)
					state.keyboard[event.key] = false;
				else
					state.keyboard[event.key] = true;
                break;

            case "KeyS":
                state.keyboard[event.key] = true;
                break;

            case "KeyA":
                state.keyboard[event.key] = true;
                break;

            case "KeyD":
                state.keyboard[event.key] = true;
                break;
            
            case "KeyQ":
                state.keyboard[event.key] = true;
                break;
            
            case "KeyE":
                state.keyboard[event.key] = true;
                break;
            
            default:
                break;
        }
    });
	

    document.addEventListener('keyup', (event) => {
        switch (event.code) {
            case "KeyW":
                state.keyboard[event.key] = false;
                break;

            case "KeyS":
                state.keyboard[event.key] = false;
                break;

            case "KeyA":
                state.keyboard[event.key] = false;
                break;

            case "KeyD":
                state.keyboard[event.key] = false;
                break;
        
            case "KeyC":
				if(state.timeBegin) {
					topViewCount--;
					console.log("topViewCount: " + topViewCount);
					if (topViewCount <= 0) {
						state.keyboard[event.key] = false;
						topViewCount = 0;	
						console.log("Can't open top down view anymore");
					} else {
						state.keyboard[event.key] = true;
						state.keyboard['v'] = false;
					}
				}
                break;

            case "KeyV":
                state.keyboard[event.key] = true;				
                state.keyboard['c'] = false;
                break;

            case "KeyQ":
                state.keyboard[event.key] = false;
                break;

            case "KeyE":
                state.keyboard[event.key] = false;
                break;

            case "KeyR":
                location.reload(true);
                break;

            case "KeyZ":
                state.lightIndices.map((index) => {
                    let light = state.objects[index];
                    light.strength += 0.1;
                })
                break;

            case "KeyX":
                state.lightIndices.map((index) => {
                    let light = state.objects[index];
                    light.strength -= 0.1;
                })
                break;

            default:
                break;
        }
    });

	
}

function sound(src) {
	this.sound = document.createElement("audio");
	this.sound.src = src;
	this.sound.setAttribute("preload", "auto");
	this.sound.setAttribute("controls", "none");
	this.sound.style.display = "none";
	document.body.appendChild(this.sound);
	this.play = function(){
	this.sound.play();
	}
	this.stop = function(){
	this.sound.pause();
	}
}

function vectorLength(vector){
    return Math.sqrt(vector[0] * vector[0] + vector[1] * vector[1] + vector[2] * vector[2]);
}

function printForwardVector(state, important = null) {
    let vMatrix = state.viewMatrix;
    if (important) {
        console.warn(vMatrix[2], vMatrix[6], vMatrix[10])
    } else {
        console.log(vMatrix[2], vMatrix[6], vMatrix[10])
    }
}

function moveForward(state) {
    let inverseView = mat4.create(), forwardVector = vec3.fromValues(0, 0, 0), cameraCenterVector = vec3.fromValues(0, 0, 0), cameraPositionVector = vec3.fromValues(0, 0, 0);

    mat4.invert(inverseView, state.viewMatrix);
    //forward vector from the viewmatrix
    forwardVector = vec3.fromValues(inverseView[2], inverseView[6], -inverseView[10]);

    vec3.normalize(forwardVector, forwardVector);
    vec3.scale(forwardVector, forwardVector, (state.deltaTime * moveSpeed));

    cameraPositionVector = vec3.fromValues(state.camera.position[0], state.camera.position[1], state.camera.position[2]);
    cameraCenterVector = vec3.fromValues(state.camera.center[0], state.camera.center[1], state.camera.center[2]);

    vec3.add(cameraPositionVector, cameraPositionVector, forwardVector);
    vec3.add(cameraCenterVector, cameraPositionVector, forwardVector);

    var oldCamPos = state.camera.position;
    var oldCamCenter = state.camera.center;
    state.camera.position = [cameraPositionVector[0], cameraPositionVector[1], cameraPositionVector[2]];
    state.camera.center = [cameraCenterVector[0], cameraCenterVector[1], cameraCenterVector[2]];

    updatePlayerPos(state);

    let collide = checkPlayerCollision(state);

    if (collide){
        state.camera.position = oldCamPos;
        state.camera.center = oldCamCenter;
    }
}

function moveBackward(state) {
    let inverseView = mat4.create(), forwardVector = vec3.fromValues(0, 0, 0), cameraCenterVector = vec3.fromValues(0, 0, 0), cameraPositionVector = vec3.fromValues(0, 0, 0);

    mat4.invert(inverseView, state.viewMatrix);
    //forward vector from the viewmatrix
    forwardVector = vec3.fromValues(-inverseView[2], -inverseView[6], inverseView[10]);
    vec3.normalize(forwardVector, forwardVector);

    vec3.normalize(forwardVector, forwardVector);
    vec3.scale(forwardVector, forwardVector, (state.deltaTime * moveSpeed));

    cameraPositionVector = vec3.fromValues(state.camera.position[0], state.camera.position[1], state.camera.position[2]);
    cameraCenterVector = vec3.fromValues(state.camera.center[0], state.camera.center[1], state.camera.center[2]);

    vec3.add(cameraPositionVector, cameraPositionVector, forwardVector);

    var oldCamPos = state.camera.position;
    var oldCamCenter = state.camera.center;
    state.camera.position = [cameraPositionVector[0], cameraPositionVector[1], cameraPositionVector[2]];
    state.camera.center = [cameraCenterVector[0], cameraCenterVector[1], cameraCenterVector[2]];

    updatePlayerPos(state);

    let collide = checkPlayerCollision(state);

    if (collide){
        state.camera.position = oldCamPos;
        state.camera.center = oldCamCenter;
    }
}

function moveLeft(state) {
    let forwardVector = vec3.fromValues(0, 0, 0), sidewaysVector = vec3.fromValues(0, 0, 0), cameraCenterVector = vec3.fromValues(0, 0, 0), cameraPositionVector = vec3.fromValues(0, 0, 0);

    sidewaysVector = vec3.fromValues(0, 0, 0);
    forwardVector = vec3.fromValues(state.viewMatrix[2], state.viewMatrix[6], state.viewMatrix[10]);
    vec3.cross(sidewaysVector, forwardVector, state.camera.up);
    vec3.normalize(sidewaysVector, sidewaysVector);
    vec3.scale(sidewaysVector, sidewaysVector, (state.deltaTime * moveSpeed));

    cameraCenterVector = vec3.fromValues(state.camera.center[0], state.camera.center[1], state.camera.center[2]);
    cameraPositionVector = vec3.fromValues(state.camera.position[0], state.camera.position[1], state.camera.position[2]);

    vec3.add(cameraCenterVector, cameraCenterVector, sidewaysVector);
    vec3.add(cameraPositionVector, cameraPositionVector, sidewaysVector);

    var oldCamPos = state.camera.position;
    var oldCamCenter = state.camera.center;
    state.camera.center = [cameraCenterVector[0], cameraCenterVector[1], cameraCenterVector[2]];
    state.camera.position = [cameraPositionVector[0], cameraPositionVector[1], cameraPositionVector[2]];

    updatePlayerPos(state);

    let collide = checkPlayerCollision(state);

    if (collide){
        state.camera.position = oldCamPos;
        state.camera.center = oldCamCenter;
    }
}

function moveRight(state) {
    let forwardVector = vec3.fromValues(0, 0, 0), sidewaysVector = vec3.fromValues(0, 0, 0), cameraCenterVector = vec3.fromValues(0, 0, 0), cameraPositionVector = vec3.fromValues(0, 0, 0);

    sidewaysVector = vec3.fromValues(0, 0, 0);
    forwardVector = vec3.fromValues(-state.viewMatrix[2], -state.viewMatrix[6], -state.viewMatrix[10]);
    vec3.cross(sidewaysVector, forwardVector, state.camera.up);
    vec3.normalize(sidewaysVector, sidewaysVector);
    vec3.scale(sidewaysVector, sidewaysVector, (state.deltaTime * moveSpeed));

    cameraCenterVector = vec3.fromValues(state.camera.center[0], state.camera.center[1], state.camera.center[2]);
    cameraPositionVector = vec3.fromValues(state.camera.position[0], state.camera.position[1], state.camera.position[2]);

    vec3.add(cameraCenterVector, cameraCenterVector, sidewaysVector);
    vec3.add(cameraPositionVector, cameraPositionVector, sidewaysVector);

    var oldCamPos = state.camera.position;
    var oldCamCenter = state.camera.center;
    state.camera.center = [cameraCenterVector[0], cameraCenterVector[1], cameraCenterVector[2]];
    state.camera.position = [cameraPositionVector[0], cameraPositionVector[1], cameraPositionVector[2]];

    updatePlayerPos(state);

    let collide = checkPlayerCollision(state);

    if (collide){
        state.camera.position = oldCamPos;
        state.camera.center = oldCamCenter;
    }
}



function updatePlayerPos(state){
    let player = getObject(state, "player");
    let pOffset = vec3.fromValues(-0.2, -0.9, -0.2);
    let translateVector = vec3.fromValues(0,0,0);

    vec3.sub(translateVector, state.camera.position, player.model.position);
    vec3.add(translateVector, translateVector, pOffset);

    player.translate(translateVector);

    for (let t = 0; t < state.objectCount; t++) {
        if (state.objects[t].name === "player_model") {
            vec3.add(state.objects[t].model.position, player.model.position, vec3.fromValues(0.2, 0.4, 0.2));
        }
    }
}

function checkPlayerCollision(state){
    let player = getObject(state, "player");

    for (let i = 0; i < state.objectCount; i++) {
        if (state.objects[i] !== player && state.objects[i].type === "cube") {
            collide = intersect(player.boundingBox, state.objects[i].boundingBox);
            if (collide){
                if (allTokensFound && state.objects[i].name === "exit"){
                    endGame(state, true);
                }
                if (state.objects[i].name === "token"){
                    if (state.objects[i].loaded === true){
                        if (i == 4){
                            for (let t = 0; t < state.objectCount; t++) {
                                if (state.objects[t].name === "token_model0") {
                                    state.objects[t].loaded = false;
                                }
                            }
                        }else if (i == 5){
                            for (let t = 0; t < state.objectCount; t++) {
                                if (state.objects[t].name === "token_model1") {
                                    state.objects[t].loaded = false;
                                }
                            }
                        }else if (i == 6){
                            for (let t = 0; t < state.objectCount; t++) {
                                if (state.objects[t].name === "token_model2") {
                                    state.objects[t].loaded = false;
                                }
                            }
                        }
                        state.objects[i].loaded = false;
                        state.tokensCollected += 1;
                        updateTokens(state)
                        return false;
                    }
                    return false;
                }
                return true;
            }
        }
    }
    return false;
}

function updateEnemyPositions(state){
    let player = getObject(state, "player");

    for (let i = 0; i < state.objectCount; i++) {
        if (state.objects[i].name === "enemy") {
            var translateVector = vec3.fromValues(0,0,0);
            vec3.sub(translateVector, player.model.position, state.objects[i].model.position);

            var inRange = vectorLength(translateVector) < maxTrackingDistance;

            if (inRange){
                translateVector[0] *= enemySpeedScale;
                translateVector[1] = 0;
                translateVector[2] *= enemySpeedScale;

                state.objects[i].translate(translateVector);

                let collide = checkEnemyCollision(state, state.objects[i]);

                if (collide){
                    vec3.mul(translateVector, translateVector, vec3.fromValues(-1,1,-1));
                    state.objects[i].translate(translateVector);
                }
            }

            if (i == 2){
                for (let t = 0; t < state.objectCount; t++) {
                    if (state.objects[t].name === "enemy_model0") {
                        vec3.add(state.objects[t].model.position, state.objects[i].model.position, vec3.fromValues(0.2, 0.4, 0.2));
                    }
                }
            }else if(i == 3){
                for (let t = 0; t < state.objectCount; t++) {
                    if (state.objects[t].name === "enemy_model1") {
                        vec3.add(state.objects[t].model.position, state.objects[i].model.position, vec3.fromValues(0.2, 0.4, 0.2));
                    }
                }
            }
        }
    }
}

function setRandomTarget(enemy, range){
    enemy.targetPos = vec3.fromValues(
        Math.random(enemy.model.position[0] - range, enemy.model.position[0] + range),
        0,
        Math.random(enemy.model.position[2] - range, enemy.model.position[2] + range)
    );
}

function checkEnemyCollision(state, enemy){
    for (let i = 0; i < state.objectCount; i++) {
        if (state.objects[i] !== enemy && state.objects[i].type === "cube" && state.objects[i].name !== "token") {
            collide = intersect(enemy.boundingBox, state.objects[i].boundingBox);
            if (collide){
                if (state.objects[i].name === "player"){
                    endGame(state, false);
                }
                return true;
            }
        }
    }
    return false;
}

function updateTokens(state){
    let newText = state.tokensCollected + "/" + state.tokens;

    document.getElementById("tokens").innerHTML = newText;

    if (state.tokensCollected === state.tokens){
        allTokensFound = true;
        document.getElementById("objective").innerHTML = "All apples collected! Proceed to the exit";
        for (let i = 0; i < state.objectCount; i++) {
            if (state.objects[i].name === "exit") {
                state.objects[i].material.ambient = vec3.fromValues(0.1, 0.6, 0.1);
                break;
            }
        }
    }
}

function endGame(state, successful){
    if (successful){
        document.getElementById("objective").innerHTML = "Congratulations! You made it out alive"
    }else{
        document.getElementById("objective").innerHTML = "Game Over! You collected " + state.tokensCollected + "/" + state.tokens + " apples";
    }
	clearTimeout(t);
	
	score.textContent = "Your final score is: " + t + "seconds";
    setTimeout(function(){ location.reload(true); }, 10000);
}
