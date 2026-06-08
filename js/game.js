/**
 * Initializes canvas, audio and controls after the page loads.
 */
function init() {
    canvas = document.getElementById("polloCanvas");
    configureGlobalAudio();
    initMobileControls();
    initCanvasMobileControls();
    initKeyboardInfo();
}

/**
 * Configures shared audio defaults.
 */
function configureGlobalAudio() {
    pepeDeadSound.preload = "auto";
    pepeDeadSound.volume = 0.75;
    gameSound.preload = "auto";
    gameSound.volume = 0.35;
    gameSound.loop = true;
}

/**
 * Registers the recurring win and game-over check.
 */
function startGameStateWatcher() {
    setInterval(() => {
        if (shouldSkipStateWatcher()) {
            return;
        }

        checkCharacterGameOver();
        checkEndbossWin();
    }, 100);
}

/**
 * Checks whether the state watcher should pause.
 * @returns {boolean} True when watcher work should be skipped.
 */
function shouldSkipStateWatcher() {
    return !world || !world.character || gamePaused;
}

/**
 * Shows game over when Pepe is dead.
 */
function checkCharacterGameOver() {
    if (!gameOverShown && !winShown && world.character.isDead()) {
        showGameOverScreen();
    }
}

/**
 * Shows win when the endboss is dead.
 */
function checkEndbossWin() {
    const endboss = world.getEndboss?.();
    if (!gameOverShown && !winShown && endboss?.isDead()) {
        showWinScreen();
    }
}

/**
 * Handles keyboard down input.
 * @param {KeyboardEvent} event - The keyboard event.
 */
function handleGlobalKeyDown(event) {
    if (gamePaused) {
        return;
    }

    if (keyboard.handleKeyDown(event)) {
        syncWalkingAudioFromInput();
    }
}

/**
 * Handles keyboard up input.
 * @param {KeyboardEvent} event - The keyboard event.
 */
function handleGlobalKeyUp(event) {
    if (keyboard.handleKeyUp(event)) {
        syncWalkingAudioFromInput();
    }
}

/**
 * Registers one managed interval.
 * @param {Function} fn - The interval callback.
 * @param {number} time - The interval delay.
 */
function stopIntervals(fn, time) {
    const id = setInterval(fn, time);
    intervalId.push(id);
}

/**
 * Stops tracked intervals and shows a game over alert.
 */
function stopGame() {
    intervalId.forEach((id) => clearInterval(id));
    alert("Game Over!");
}

/**
 * Clears all tracked intervals.
 */
function clearIntervals() {
    intervalId.forEach((id) => clearInterval(id));
    intervalId = [];
}

startGameStateWatcher();
window.addEventListener("keydown", handleGlobalKeyDown);
window.addEventListener("keyup", handleGlobalKeyUp);
