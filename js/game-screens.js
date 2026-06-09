/**
 * Hides start and end screens before gameplay begins.
 */
function hideMenuScreens() {
    hideElementById("startScreen");
    hideElementById("gameOverScreen");
    hideElementById("winScreen");
}

/**
 * Hides one element by id.
 * @param {string} id - The element id.
 */
function hideElementById(id) {
    document.getElementById(id)?.classList.add("hidden");
}

/**
 * Shows one element by id.
 * @param {string} id - The element id.
 */
function showElementById(id) {
    document.getElementById(id)?.classList.remove("hidden");
}

/**
 * Prepares the page for the loading screen.
 */
function prepareGameScreen() {
    hideMenuScreens();
    canvas?.classList.add("hidden");
    setFullscreenButtonVisible(false);
    hideElementById("helpMeContainer");
    hideElementById("keyboardInfo");
    setMobileControlsVisible(false);
    setGamePaused(false);
}

/**
 * Shows the canvas and active gameplay controls.
 */
function activateGameScreen() {
    canvas?.classList.remove("hidden");
    setFullscreenButtonVisible(true);
    setMobileControlsVisible(true);
}

/**
 * Starts a new game from the start screen.
 * @returns {Promise<void>} A promise that resolves after the game starts.
 */
async function startGame() {
    if (loadingShown || (world && !gameOverShown && !winShown)) {
        return;
    }

    requestFullscreenOnMobileStart();
    startGameSound();
    prepareGameScreen();
    await showLoadingScreen();
    buildFreshWorld();
    finishGameStart();
}

/**
 * Builds the initial level and world instance.
 */
function buildFreshWorld() {
    initLevel1();
    if (!world) {
        world = new World(canvas, keyboard);
    }
}

/**
 * Applies the final state after starting gameplay.
 */
function finishGameStart() {
    applyMuteState();
    gameOverShown = false;
    winShown = false;
    activateGameScreen();
}

/**
 * Shows the game over screen once.
 */
function showGameOverScreen() {
    if (gameOverShown || winShown) {
        return;
    }

    gameOverShown = true;
    stopGameSound();
    playPepeDeadSound();
    showElementById("gameOverScreen");
    setMobileControlsVisible(false);
    setTimeout(() => setGamePaused(true), 600);
}

/**
 * Plays Pepe's death sound.
 */
function playPepeDeadSound() {
    pepeDeadSound.currentTime = 0;
    pepeDeadSound.play().catch(() => { });
}

/**
 * Shows the win screen once.
 */
function showWinScreen() {
    if (winShown || gameOverShown) {
        return;
    }

    winShown = true;
    setGamePaused(false);
    stopGameSound();
    showElementById("winScreen");
    setMobileControlsVisible(false);
}

/**
 * Restarts gameplay after win or game over.
 */
function restartGame() {
    hideMenuScreens();
    resetRestartInputAndAudio();
    initLevel1();
    resetWorldForRestart();
    finishRestartState();
}

/**
 * Clears input and audio before restarting.
 */
function resetRestartInputAndAudio() {
    keyboard.reset();
    setGamePaused(false);
    world?.character?.stopWalkingSound();
    stopGameSound();
}

/**
 * Reuses or creates the world for a restart.
 */
function resetWorldForRestart() {
    if (!world) {
        world = new World(canvas, keyboard);
        return;
    }

    resetExistingWorldForRestart();
}

/**
 * Resets an existing world instance for restart.
 */
function resetExistingWorldForRestart() {
    world.level = level1;
    world.character = new Charakter();
    resetWorldBars();
    resetWorldRuntimeState();
    resetRestartEndboss();
}

/**
 * Recreates world status bars.
 */
function resetWorldBars() {
    world.statusBar = new StatusBar();
    world.coinStatusBar = createCoinStatusBar();
    world.bottleStatusBar = createBottleStatusBar();
    world.endbossStatusBar = createEndbossStatusBar();
}

/**
 * Creates the coin status bar.
 * @returns {StatusBar} The coin status bar.
 */
function createCoinStatusBar() {
    return new StatusBar([
        "img/7_statusbars/1_statusbar/1_statusbar_coin/green/0.png",
        "img/7_statusbars/1_statusbar/1_statusbar_coin/green/20.png",
        "img/7_statusbars/1_statusbar/1_statusbar_coin/green/40.png",
        "img/7_statusbars/1_statusbar/1_statusbar_coin/green/60.png",
        "img/7_statusbars/1_statusbar/1_statusbar_coin/green/80.png",
        "img/7_statusbars/1_statusbar/1_statusbar_coin/green/100.png"
    ], 20, 70);
}

/**
 * Creates the bottle status bar.
 * @returns {StatusBar} The bottle status bar.
 */
function createBottleStatusBar() {
    return new StatusBar([
        "img/7_statusbars/1_statusbar/3_statusbar_bottle/green/0.png",
        "img/7_statusbars/1_statusbar/3_statusbar_bottle/green/20.png",
        "img/7_statusbars/1_statusbar/3_statusbar_bottle/green/40.png",
        "img/7_statusbars/1_statusbar/3_statusbar_bottle/green/60.png",
        "img/7_statusbars/1_statusbar/3_statusbar_bottle/green/80.png",
        "img/7_statusbars/1_statusbar/3_statusbar_bottle/green/100.png"
    ], 20, 120);
}

/**
 * Creates the endboss status bar.
 * @returns {StatusBar} The endboss status bar.
 */
function createEndbossStatusBar() {
    return new StatusBar([
        "img/7_statusbars/2_statusbar_endboss/green/green0.png",
        "img/7_statusbars/2_statusbar_endboss/green/green20.png",
        "img/7_statusbars/2_statusbar_endboss/green/green40.png",
        "img/7_statusbars/2_statusbar_endboss/green/green60.png",
        "img/7_statusbars/2_statusbar_endboss/green/green80.png",
        "img/7_statusbars/2_statusbar_endboss/green/green100.png"
    ], canvas.width - 220, 20);
}

/**
 * Resets transient world runtime fields.
 */
function resetWorldRuntimeState() {
    world.showEndbossStatusBar = false;
    world.bossPhaseStarted = false;
    world.throwableObjects = [];
    world.camera_x = 0;
    world.initializeCollectibleCounters();
    world.setWorld();
}

/**
 * Resets the endboss animation state after restart.
 */
function resetRestartEndboss() {
    const endboss = world.getEndboss?.();
    if (!endboss) {
        return;
    }

    endboss.currentImageIndex = 0;
    endboss.isDeadAnimationStarted = false;
}

/**
 * Restores visible gameplay state after restart.
 */
function finishRestartState() {
    gameOverShown = false;
    winShown = false;
    applyMuteState();
    activateGameScreen();
    startGameSound();
}
