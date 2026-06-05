let canvas;
let world;
let keyboard = new Keyboard();
let gameOverShown = false;
let winShown = false;
let pepeDeadSound = new Audio("audio/pepeDead.mp3");
let gameSound = new Audio("audio/gameSound.mp3");

function init() {
    canvas = document.getElementById("polloCanvas");
    pepeDeadSound.preload = "auto";
    pepeDeadSound.volume = 0.75;
    gameSound.preload = "auto";
    gameSound.volume = 0.35;
    gameSound.loop = true;
    initMobileControls();
}

function setMobileControlsVisible(isVisible) {
    const mobileControls = document.getElementById("mobileControls");
    if (!mobileControls) {
        return;
    }

    mobileControls.classList.toggle("hidden", !isVisible);

    if (!isVisible) {
        keyboard.left = false;
        keyboard.right = false;
        keyboard.space = false;
        keyboard.D = false;
        syncWalkingAudioFromInput();
    }
}

function setKeyboardFlag(key, value) {
    keyboard[key] = value;
    syncWalkingAudioFromInput();
}

function bindTouchButton(buttonId, key) {
    const button = document.getElementById(buttonId);
    if (!button) {
        return;
    }

    button.addEventListener("touchstart", (event) => {
        event.preventDefault();
        setKeyboardFlag(key, true);
    }, { passive: false });

    button.addEventListener("touchend", (event) => {
        event.preventDefault();
        setKeyboardFlag(key, false);
    }, { passive: false });

    button.addEventListener("touchcancel", (event) => {
        event.preventDefault();
        setKeyboardFlag(key, false);
    }, { passive: false });
}

function initMobileControls() {
    bindTouchButton("mobileLeft", "left");
    bindTouchButton("mobileRight", "right");
    bindTouchButton("mobileJump", "space");
    bindTouchButton("mobileThrow", "D");
}

function startGameSound() {
    gameSound.currentTime = 0;
    gameSound.play().catch(() => { });
}

function stopGameSound() {
    gameSound.pause();
    gameSound.currentTime = 0;
}

function startGame() {
    if (world && !gameOverShown) {
        return;
    }

    initLevel1();

    const startScreen = document.getElementById("startScreen");
    const gameOverScreen = document.getElementById("gameOverScreen");
    const winScreen = document.getElementById("winScreen");
    const fullscreenButton = document.getElementById("fullscreenButton");

    if (startScreen) {
        startScreen.classList.add("hidden");
    }

    if (gameOverScreen) {
        gameOverScreen.classList.add("hidden");
    }

    if (winScreen) {
        winScreen.classList.add("hidden");
    }

    if (canvas) {
        canvas.classList.remove("hidden");
    }

    if (fullscreenButton) {
        fullscreenButton.classList.remove("hidden");
    }

    setMobileControlsVisible(true);

    if (!world) {
        world = new World(canvas, keyboard);
    }

    startGameSound();

    gameOverShown = false;
    winShown = false;
}

function showGameOverScreen() {
    if (gameOverShown || winShown) {
        return;
    }

    gameOverShown = true;
    stopGameSound();
    pepeDeadSound.currentTime = 0;
    pepeDeadSound.play().catch(() => { });
    const gameOverScreen = document.getElementById("gameOverScreen");

    if (gameOverScreen) {
        gameOverScreen.classList.remove("hidden");
    }

    setMobileControlsVisible(false);
}

function showWinScreen() {
    if (winShown || gameOverShown) {
        return;
    }

    winShown = true;
    stopGameSound();
    const winScreen = document.getElementById("winScreen");

    if (winScreen) {
        winScreen.classList.remove("hidden");
    }

    setMobileControlsVisible(false);
}

function syncWalkingAudioFromInput() {
    if (!world || !world.character || world.character.isDead()) {
        return;
    }

    if (keyboard.left || keyboard.right) {
        world.character.startWalkingSound();
    } else {
        world.character.stopWalkingSound();
    }
}

setInterval(() => {
    if (!world || !world.character) {
        return;
    }

    if (!gameOverShown && !winShown && world.character.isDead()) {
        showGameOverScreen();
    }

    const endboss = typeof world.getEndboss === "function" ? world.getEndboss() : null;
    if (!gameOverShown && !winShown && endboss && endboss.isDead()) {
        showWinScreen();
    }
}, 100);

window.addEventListener("keydown", (event) => {
    if (event.key === "ArrowRight" || event.keyCode === 39) { // Pfeil nach rechts
        keyboard.right = true;
    } else if (event.key === "ArrowLeft" || event.keyCode === 37) { // Pfeil nach links
        keyboard.left = true;
    } else if (event.key === "ArrowUp" || event.keyCode === 38) { // Pfeil nach oben
        keyboard.up = true;
    } else if (event.key === "ArrowDown" || event.keyCode === 40) { // Pfeil nach unten
        keyboard.down = true;
    } else if (event.key === " " || event.code === "Space") { // Leertaste
        keyboard.space = true;
    } else if (event.key === "d" || event.key === "D" || event.keyCode === 68) { // Taste D
        keyboard.D = true;
    }

    syncWalkingAudioFromInput();
});

window.addEventListener("keyup", (event) => {
    if (event.key === "ArrowRight" || event.keyCode === 39) { // Pfeil nach rechts
        keyboard.right = false;
    } else if (event.key === "ArrowLeft" || event.keyCode === 37) { // Pfeil nach links
        keyboard.left = false;
    } else if (event.key === "ArrowUp" || event.keyCode === 38) { // Pfeil nach oben
        keyboard.up = false;
    } else if (event.key === "ArrowDown" || event.keyCode === 40) { // Pfeil nach unten
        keyboard.down = false;
    } else if (event.key === " " || event.code === "Space") { // Leertaste
        keyboard.space = false;
    } else if (event.key === "d" || event.key === "D" || event.keyCode === 68) { // Taste D
        keyboard.D = false;
    }

    syncWalkingAudioFromInput();
});
let intervalId = [];
let i = 1;

function stopIntervals(fn, time) {
    let id = setInterval(fn, time);
    intervalId.push(id);
}

function stopGame() {
    intervalId.forEach(id => clearInterval(id));
    alert("Game Over!");
}
 
function clearIntervals() {
    intervalId.forEach(id => clearInterval(id));
    intervalId = [];
}

function restartGame() {
    const gameOverScreen = document.getElementById("gameOverScreen");
    const winScreen = document.getElementById("winScreen");
    const fullscreenButton = document.getElementById("fullscreenButton");

    if (gameOverScreen) {
        gameOverScreen.classList.add("hidden");
    }

    if (winScreen) {
        winScreen.classList.add("hidden");
    }

    if (canvas) {
        canvas.classList.remove("hidden");
    }

    if (fullscreenButton) {
        fullscreenButton.classList.remove("hidden");
    }

    setMobileControlsVisible(true);

    keyboard.left = false;
    keyboard.right = false;
    keyboard.up = false;
    keyboard.down = false;
    keyboard.space = false;
    keyboard.D = false;

    if (world && world.character) {
        world.character.stopWalkingSound();
    }

    stopGameSound();

    initLevel1();

    if (!world) {
        world = new World(canvas, keyboard);
    } else {
        world.level = level1;
        world.character = new Charakter();
        world.statusBar = new StatusBar();
        world.coinStatusBar = new StatusBar([
            "img/7_statusbars/1_statusbar/1_statusbar_coin/green/0.png",
            "img/7_statusbars/1_statusbar/1_statusbar_coin/green/20.png",
            "img/7_statusbars/1_statusbar/1_statusbar_coin/green/40.png",
            "img/7_statusbars/1_statusbar/1_statusbar_coin/green/60.png",
            "img/7_statusbars/1_statusbar/1_statusbar_coin/green/80.png",
            "img/7_statusbars/1_statusbar/1_statusbar_coin/green/100.png"
        ], 20, 70);
        world.coinStatusBar.setPercentage(0);
        world.bottleStatusBar = new StatusBar([
            "img/7_statusbars/1_statusbar/3_statusbar_bottle/green/0.png",
            "img/7_statusbars/1_statusbar/3_statusbar_bottle/green/20.png",
            "img/7_statusbars/1_statusbar/3_statusbar_bottle/green/40.png",
            "img/7_statusbars/1_statusbar/3_statusbar_bottle/green/60.png",
            "img/7_statusbars/1_statusbar/3_statusbar_bottle/green/80.png",
            "img/7_statusbars/1_statusbar/3_statusbar_bottle/green/100.png"
        ], 20, 120);
        world.bottleStatusBar.setPercentage(0);
        world.endbossStatusBar = new StatusBar([
            "img/7_statusbars/2_statusbar_endboss/green/green0.png",
            "img/7_statusbars/2_statusbar_endboss/green/green20.png",
            "img/7_statusbars/2_statusbar_endboss/green/green40.png",
            "img/7_statusbars/2_statusbar_endboss/green/green60.png",
            "img/7_statusbars/2_statusbar_endboss/green/green80.png",
            "img/7_statusbars/2_statusbar_endboss/green/green100.png"
        ], canvas.width - 220, 20);
        world.showEndbossStatusBar = false;
        world.bossPhaseStarted = false;
        world.throwableObjects = [];
        world.camera_x = 0;
        world.initializeCollectibleCounters();
        world.setWorld();
        const endboss = typeof world.getEndboss === "function" ? world.getEndboss() : null;
        if (endboss) {
            endboss.currentImageIndex = 0;
            endboss.isDeadAnimationStarted = false;
        }
    }

    gameOverShown = false;
    winShown = false;
    startGameSound();
}

/* View in fullscreen */
function openFullscreen() {
    if (!canvas) {
        return;
    }

    if (canvas.requestFullscreen) {
        canvas.requestFullscreen();
    } else if (canvas.webkitRequestFullscreen) { /* Safari */
        canvas.webkitRequestFullscreen();
    } else if (canvas.msRequestFullscreen) { /* IE11 */
        canvas.msRequestFullscreen();
    }
}

/* Close fullscreen */
function closeFullscreen() {
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if (document.webkitExitFullscreen) { /* Safari */
    document.webkitExitFullscreen();
  } else if (document.msExitFullscreen) { /* IE11 */
    document.msExitFullscreen();
  }
}
