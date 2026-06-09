/**
 * Updates a keyboard flag and syncs movement audio.
 * @param {string} key - The key flag to update.
 * @param {boolean} value - Whether the key is pressed.
 */
function setKeyboardFlag(key, value) {
    if (gamePaused) {
        return;
    }

    if (keyboard.setKey(key, value)) {
        syncWalkingAudioFromInput();
    }
}

/**
 * Pauses or resumes the game state and background music.
 * @param {boolean} isPaused - Whether the game should be paused.
 */
function setGamePaused(isPaused) {
    if (gamePaused === isPaused) {
        return;
    }
    gamePaused = isPaused;
    saveStoredBoolean(STORAGE_KEY_GAME_PAUSED, gamePaused);
    updatePauseAudio(isPaused);
}

/**
 * Applies the correct audio behavior for pause changes.
 * @param {boolean} isPaused - Whether the game is paused.
 */
function updatePauseAudio(isPaused) {
    if (isPaused) {
        pauseGameAudio();
    } else {
        resumeGameAudio();
    }
}

/**
 * Stops movement and background audio while paused.
 */
function pauseGameAudio() {
    resetMovementInput();
    world?.character?.stopWalkingSound();
    gameSound.pause();
}

/**
 * Resumes the background audio when allowed.
 */
function resumeGameAudio() {
    if (world && !gameOverShown && !winShown && !gameMuted) {
        gameSound.play().catch(() => { });
    }
}

/**
 * Toggles the pause state.
 */
function toggleGamePause() {
    setGamePaused(!gamePaused);
}

/**
 * Applies mute state to one audio object.
 * @param {HTMLAudioElement} audio - The audio element to update.
 * @param {boolean} isMuted - Whether the audio should be muted.
 */
function setAudioMuted(audio, isMuted) {
    if (audio) {
        audio.muted = isMuted;
    }
}

/**
 * Applies the current mute state to all game audio.
 */
function applyMuteState() {
    setAudioMuted(gameSound, gameMuted);
    setAudioMuted(pepeDeadSound, gameMuted);
    world?.setMuted?.(gameMuted);
}

/**
 * Toggles all game audio between muted and unmuted.
 */
function toggleGameMute() {
    gameMuted = !gameMuted;
    saveStoredBoolean(STORAGE_KEY_GAME_MUTED, gameMuted);
    applyMuteState();
}

/**
 * Starts the looping background music.
 */
function startGameSound() {
    gameSound.currentTime = 0;
    gameSound.muted = gameMuted;
    gameSound.play().catch(() => { });
}

/**
 * Stops the looping background music.
 */
function stopGameSound() {
    gameSound.pause();
    gameSound.currentTime = 0;
}

/**
 * Starts or stops Pepe's walking audio from input state.
 */
function syncWalkingAudioFromInput() {
    if (shouldSkipWalkingAudio()) {
        return;
    }

    if (keyboard.left || keyboard.right) {
        world.character.startWalkingSound();
    } else {
        world.character.stopWalkingSound();
    }
}

/**
 * Checks whether walking audio should be ignored.
 * @returns {boolean} True when walking audio should not update.
 */
function shouldSkipWalkingAudio() {
    return !world || !world.character || world.character.isDead() || gamePaused || gameMuted;
}