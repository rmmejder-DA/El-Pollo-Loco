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
let intervalId = [];
let i = 1;

const STORAGE_KEY_GAME_PAUSED = "elPolloLoco.gamePaused";
const STORAGE_KEY_GAME_MUTED = "elPolloLoco.gameMuted";
const LOADING_DURATION = 2200;
const END_SCREEN_DELAY_MS = 1000;
const MOBILE_FULLSCREEN_MAX_WIDTH = 1366;
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

let gamePaused = loadStoredBoolean(STORAGE_KEY_GAME_PAUSED, false);
let gameMuted = loadStoredBoolean(STORAGE_KEY_GAME_MUTED, false);

/*** Reads a boolean value from local storage.
 * @param {string} key - The local storage key.
 * @param {boolean} fallback - The value to use when no stored value exists.
 * @returns {boolean} The stored boolean value.*/
function loadStoredBoolean(key, fallback) {
    try {
        const value = localStorage.getItem(key);
        return value === null ? fallback : value === "true";
    } catch (error) {
        return fallback;
    }
}

/*** Saves a boolean value to local storage.
 * @param {string} key - The local storage key.
 * @param {boolean} value - The value to store.*/
function saveStoredBoolean(key, value) {
    try {
        localStorage.setItem(key, String(value));
    } catch (error) {
        console.warn("Could not persist game setting in localStorage.", error);
    }
}

/*** Checks whether the viewport should use mobile controls.
 * @returns {boolean} True when the viewport is within the mobile width.*/
function isMobileViewport() {
    return window.matchMedia(`(max-width: ${MOBILE_FULLSCREEN_MAX_WIDTH}px)`).matches;
}

/*** Checks whether start should request fullscreen.
 * @returns {boolean} True when fullscreen should be requested on start.*/
function isStartFullscreenViewport() {
    return isMobileViewport();
}

/**
 * Detects whether the game runs on a real mobile/tablet device.
 * @returns {boolean} True for phones/tablets, false for desktop browsers.
 */
function isLikelyMobileDevice() {
    const ua = navigator.userAgent || "";
    const uaDataMobile = navigator.userAgentData?.mobile === true;
    const hasMobileUserAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
    const isIpadDesktopUserAgent = navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
    return uaDataMobile || hasMobileUserAgent || isIpadDesktopUserAgent;
}

/**
 * Checks whether fullscreen should be auto-started on game start.
 * @returns {boolean} True when viewport is mobile-sized on a real mobile device.
 */
function shouldAutoStartFullscreen() {
    return isStartFullscreenViewport() && isLikelyMobileDevice();
}

/*** Checks whether canvas touch controls should be drawn.
 * @returns {boolean} True when canvas controls are active.*/
function shouldUseCanvasMobileControls() {
    return canvasMobileControlsActive && world && !loadingShown && !gameOverShown && !winShown && !gamePaused;
}

/**
 * Syncs responsive touch controls with the current viewport width.
 * This also covers desktop browsers when side panels reduce the usable width.
 */
function syncResponsiveControlMode() {
    const shouldEnableCanvasControls = isMobileViewport();
    if (canvasMobileControlsActive === shouldEnableCanvasControls) {
        return;
    }
    canvasMobileControlsActive = shouldEnableCanvasControls;
    if (!canvasMobileControlsActive) {
        resetCanvasMobileControls?.();
        syncWalkingAudioFromInput?.();
    }
}

/*** Checks whether pause and mute controls should be drawn.
 * @returns {boolean} True when HUD controls should be visible.*/
function shouldShowCanvasHudControls() {
    return world && !loadingShown && !gameOverShown && !winShown;
}

/*** Returns the current pause state.
 * @returns {boolean} True when the game is paused.*/
function isGamePaused() {
    return gamePaused;
}

/*** Returns the current mute state.
 * @returns {boolean} True when audio is muted.*/
function isGameMuted() {
    return gameMuted;
}
