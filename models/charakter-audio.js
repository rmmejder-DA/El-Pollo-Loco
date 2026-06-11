const CharakterAudio = {
    /*** Applies mute state to Pepe's sounds.
     * @param {Charakter} character - The character instance.
     * @param {boolean} isMuted - Whether audio should be muted.*/
    setMuted(character, isMuted) {
        character.walking_sound.muted = isMuted;
        character.jump_sound.muted = isMuted;
        character.snoring_sound.muted = isMuted;
        if (isMuted) {
            this.stopWalkingSound(character);
            this.stopSnoringSound(character);
        }
    },

    /** Stops Pepe's walking sound with a fade out.
     * @param {Charakter} character - The character instance.*/
    stopWalkingSound(character) {
        if (!character.walkingAudioActive || character.walkingFadeInterval) {
            return;
        }
        character.walkingFadeInterval = setInterval(() => {
            this.fadeWalkingSoundStep(character);
        }, 30);
    },

    /** Applies one fade-out step to the walking sound.
     * @param {Charakter} character - The character instance.*/
    fadeWalkingSoundStep(character) {
        const nextVolume = Math.max(0, character.walking_sound.volume - 0.08);
        character.walking_sound.volume = nextVolume;
        if (nextVolume <= 0) {
            this.finishWalkingSoundFade(character);
        }
    },

    /** Finishes the walking sound fade-out.
     * @param {Charakter} character - The character instance.*/
    finishWalkingSoundFade(character) {
        clearInterval(character.walkingFadeInterval);
        character.walkingFadeInterval = null;
        character.walking_sound.pause();
        character.walkingAudioActive = false;
        character.walking_sound.volume = character.walkingVolume;
    },

    /** Starts Pepe's snoring sound while he sleeps.
     * @param {Charakter} character - The character instance.*/
    startSnoringSound(character) {
        if ((typeof isGameMuted === "function" && isGameMuted()) || character.snoringAudioActive) {
            return;
        }
        character.snoringAudioActive = true;
        character.snoring_sound.currentTime = 0;
        character.snoring_sound.volume = 0.03;
        character.snoring_sound.play().catch((error) => {
            character.snoringAudioActive = false;
            console.warn("Snoring sound playback was blocked or failed.", error);
        });
    },

    /** Stops Pepe's snoring sound.
     * @param {Charakter} character - The character instance.*/
    stopSnoringSound(character) {
        if (!character.snoringAudioActive) {
            return;
        }
        character.snoring_sound.pause();
        character.snoring_sound.currentTime = 0;
        character.snoringAudioActive = false;
    },

    /** Starts Pepe's walking sound when audio is enabled.
     * @param {Charakter} character - The character instance.*/
    startWalkingSound(character) {
        if (typeof isGameMuted === "function" && isGameMuted()) {
            return;
        }
        this.cancelWalkingFade(character);
        if (character.walkingAudioActive) {
            return;
        }
        this.playWalkingSound(character);
    },

    /** Starts the walking sound playback.
     * @param {Charakter} character - The character instance.*/
    playWalkingSound(character) {
        character.walking_sound.volume = character.walkingVolume;
        character.walkingAudioActive = true;
        character.walking_sound.play().catch(() => {
            character.walkingAudioActive = false;
        });
    },

    /** Cancels a running walking sound fade.
     * @param {Charakter} character - The character instance.*/
    cancelWalkingFade(character) {
        if (!character.walkingFadeInterval) {
            return;
        }
        clearInterval(character.walkingFadeInterval);
        character.walkingFadeInterval = null;
        character.walking_sound.volume = character.walkingVolume;
    },

    /** Plays Pepe's jump sound.
     * @param {Charakter} character - The character instance.*/
    playJumpSound(character) {
        character.jump_sound.currentTime = 0;
        character.jump_sound.muted = typeof isGameMuted === "function" && isGameMuted();
        character.jump_sound.play().catch((error) => {
            console.warn("Jump sound playback was blocked or failed.", error);
        });
    }
};