let canvas;
let world;
let keyboard = new Keyboard();
let gameOverShown = false;
let winShown = false;
let loadingShown = false;
let loadingPepeAnimation = null;
let pepeDeadSound = new Audio("audio/pepeDead.mp3");
let gameSound = new Audio("audio/gameSound.mp3");
let activeCanvasPointers = new Map();
let canvasMobileControlsActive = false;
let gamePaused = false;
let gameMuted = false;
let intervalId = [];
let i = 1;

const LOADING_DURATION = 2200;
const MOBILE_FULLSCREEN_MAX_WIDTH = 1200;
const LOADING_PEPE_IMAGES = [
    "img/2_character_pepe/2_walk/W-21.png",
    "img/2_character_pepe/2_walk/W-22.png",
    "img/2_character_pepe/2_walk/W-23.png",
    "img/2_character_pepe/2_walk/W-24.png",
    "img/2_character_pepe/2_walk/W-25.png",
    "img/2_character_pepe/2_walk/W-26.png"
];
const LOADING_PRELOAD_IMAGES = [
    "img/5_background/second_half_background.png",
    ...LOADING_PEPE_IMAGES
];

/**
 * Checks whether the viewport should use mobile controls.
 * @returns {boolean} True when the viewport is within the mobile width.
 */
function isMobileViewport() {
    return window.matchMedia(`(max-width: ${MOBILE_FULLSCREEN_MAX_WIDTH}px)`).matches;
}

/**
 * Checks whether start should request fullscreen.
 * @returns {boolean} True when fullscreen should be requested on start.
 */
function isStartFullscreenViewport() {
    return isMobileViewport();
}

/**
 * Checks whether canvas touch controls should be drawn.
 * @returns {boolean} True when canvas controls are active.
 */
function shouldUseCanvasMobileControls() {
    return canvasMobileControlsActive && world && !loadingShown && !gameOverShown && !winShown && !gamePaused;
}

/**
 * Checks whether pause and mute controls should be drawn.
 * @returns {boolean} True when HUD controls should be visible.
 */
function shouldShowCanvasHudControls() {
    return world && !loadingShown && !gameOverShown && !winShown;
}

/**
 * Returns the current pause state.
 * @returns {boolean} True when the game is paused.
 */
function isGamePaused() {
    return gamePaused;
}

/**
 * Returns the current mute state.
 * @returns {boolean} True when audio is muted.
 */
function isGameMuted() {
    return gameMuted;
}
