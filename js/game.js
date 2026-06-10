/*** Initializes canvas, audio and controls after the page loads.*/
function init() {
    canvas = document.getElementById("polloCanvas");
    configureGlobalAudio();
    initMobileControls();
    initCanvasMobileControls();
    initKeyboardInfo();
    syncResponsiveControlMode();
    window.addEventListener("resize", syncResponsiveControlMode);
}

/*** Configures shared audio defaults.*/
function configureGlobalAudio() {
    pepeDeadSound.preload = "auto";
    pepeDeadSound.volume = 0.45;
    gameSound.preload = "auto";
    gameSound.volume = 0.015;
    gameSound.loop = true;
}

/*** Registers the recurring win and game-over check.*/
function startGameStateWatcher() {
    setInterval(() => {
        if (shouldSkipStateWatcher()) {return;}
        resolveGameEndState();
    }, 100);
}

/*** Checks whether the state watcher should pause.
 * @returns {boolean} True when watcher work should be skipped.*/
function shouldSkipStateWatcher() {
    return !world || !world.character || gamePaused;
}

/** Resolves the boss-fight outcome so only one end state is shown. */
function resolveGameEndState() {
    if (gameOverShown || winShown) {
        return;
    }
    if (isCharacterDefeated()) {
        showGameOverScreen();
        return;
    }
    if (didCharacterWinBossFight()) {
        showWinScreen();
    }
}

/*** Checks whether Pepe is defeated (dead or empty health bar).
 * @returns {boolean} True when Pepe should be game over.*/
function isCharacterDefeated() {
    return world.character.isDead() || world.character.energy < 20;
}

/**
 * Checks whether Pepe won the boss fight.
 * @returns {boolean} True when the boss is defeated and Pepe is not defeated.
 */
function didCharacterWinBossFight() {
    const endboss = world.getEndboss?.();
    return Boolean(world?.winTriggered || endboss?.isDead()) && !isCharacterDefeated();
}

/*** Handles keyboard down input.
 * @param {KeyboardEvent} event - The keyboard event.*/
function handleGlobalKeyDown(event) {
    if (gamePaused) {return;}
    if (keyboard.handleKeyDown(event)) {
        syncWalkingAudioFromInput();}
}

/*** Handles keyboard up input.
 * @param {KeyboardEvent} event - The keyboard event.*/
function handleGlobalKeyUp(event) {
    if (keyboard.handleKeyUp(event)) {
        syncWalkingAudioFromInput();
    }
}

/*** Registers one managed interval.
 * @param {Function} fn - The interval callback.
 * @param {number} time - The interval delay.*/
function stopIntervals(fn, time) {
    const id = setInterval(fn, time);
    intervalId.push(id);
}

/*** Stops tracked intervals and shows a game over alert.*/
function stopGame() {
    intervalId.forEach((id) => clearInterval(id));
    alert("Game Over!");
}

/*** Clears all tracked intervals.*/
function clearIntervals() {
    intervalId.forEach((id) => clearInterval(id));
    intervalId = [];
}

startGameStateWatcher();
window.addEventListener("keydown", handleGlobalKeyDown);
window.addEventListener("keyup", handleGlobalKeyUp);
