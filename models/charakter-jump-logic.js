const CharakterJumpLogic = {
    /**
     * Plays one animation step for the given character.
     * @param {Charakter} character - The character instance.
     * @param {string[]} images - The animation frame paths.
     */
    playCharacterAnimation(character, images) {
        this.startAnimationIfChanged(character, images);
        this.applyJumpFrameGuards(character, images);
        if (!this.shouldAdvanceAnimationFrame(character, images)) {
            return;
        }
        this.advanceAnimationFrame(character, images);
    },

    /**
     * Resets animation counters when switching animation sets.
     * @param {Charakter} character - The character instance.
     * @param {string[]} images - The animation frame paths.
     */
    startAnimationIfChanged(character, images) {
        if (character.activeAnimation === images) {
            return;
        }
        character.currentImageIndex = this.getAnimationStartIndex(character, images);
        character.activeAnimation = images;
        character.lastAnimationFrameAt = 0;
    },

    /**
     * Returns the first frame index for an animation.
     * @param {Charakter} character - The character instance.
     * @param {string[]} images - The animation frame paths.
     * @returns {number} The frame index to start from.
     */
    getAnimationStartIndex(character, images) {
        if (images === character.IMAGES_JUMPING) {
            return character.jumpLoopStartFrameIndex;
        }
        return 0;
    },

    /**
     * Applies all frame guards used for jump animation.
     * @param {Charakter} character - The character instance.
     * @param {string[]} images - The animation frame paths.
     */
    applyJumpFrameGuards(character, images) {
        if (images !== character.IMAGES_JUMPING) {
            return;
        }
        this.capJumpShadowFrames(character);
        this.keepStompFramesInRange(character);
        this.wrapJumpFrameIndex(character, images.length);
    },

    /**
     * Prevents shadow jump frames while character is still high in air.
     * @param {Charakter} character - The character instance.
     */
    capJumpShadowFrames(character) {
        if (!this.shouldHideJumpShadowFrames(character)) {
            return;
        }
        character.currentImageIndex = Math.min(character.currentImageIndex, character.stompJumpLastFrameIndex);
    },

    /**
     * Keeps stomp bounce frames between configured min and max.
     * @param {Charakter} character - The character instance.
     */
    keepStompFramesInRange(character) {
        if (!character.stompBounceActive) {
            return;
        }
        character.currentImageIndex = Math.max(character.currentImageIndex, character.stompJumpFrameIndex);
        if (character.currentImageIndex > character.stompJumpLastFrameIndex) {
            character.currentImageIndex = character.stompJumpFrameIndex;
        }
    },

    /**
     * Wraps jump animation back to configured loop start.
     * @param {Charakter} character - The character instance.
     * @param {number} imageCount - Number of frames in the animation.
     */
    wrapJumpFrameIndex(character, imageCount) {
        if (character.currentImageIndex < imageCount) {
            return;
        }
        character.currentImageIndex = character.jumpLoopStartFrameIndex;
    },

    /**
     * Advances animation by one frame and stamps update time.
     * @param {Charakter} character - The character instance.
     * @param {string[]} images - The animation frame paths.
     */
    advanceAnimationFrame(character, images) {
        character.lastAnimationFrameAt = Date.now();
        character.playAnimation(images);
    },

    /**
     * Checks whether jump frames with ground shadow should be hidden.
     * @param {Charakter} character - The character instance.
     * @returns {boolean} True when Pepe is still too high above ground.
     */
    shouldHideJumpShadowFrames(character) {
        if (character.stompBounceActive) {
            return false;
        }
        const groundLevel = typeof character.groundY === "number" ? character.groundY : 180;
        const distanceToGround = groundLevel - character.y;
        return distanceToGround > character.jumpShadowGroundDistance;
    },

    /**
     * Checks whether animation should advance to the next frame.
     * @param {Charakter} character - The character instance.
     * @param {string[]} images - The animation frame paths.
     * @returns {boolean} True when the next frame should be shown now.
     */
    shouldAdvanceAnimationFrame(character, images) {
        if (images !== character.IMAGES_JUMPING) {
            return true;
        }
        const now = Date.now();
        const frameInterval = character.currentImageIndex < character.fastJumpFrameCount
            ? character.firstJumpFrameInterval
            : character.jumpFrameInterval;
        return now - character.lastAnimationFrameAt >= frameInterval;
    },

    /**
     * Forces a stomp bounce jump frame.
     * @param {Charakter} character - The character instance.
     */
    showStompJumpFrame(character) {
        character.stompBounceActive = true;
        character.jumpLoopStartFrameIndex = character.stompJumpFrameIndex;
        character.activeAnimation = character.IMAGES_JUMPING;
        character.currentImageIndex = character.stompJumpFrameIndex;
        character.lastAnimationFrameAt = Date.now();
        const framePath = character.IMAGES_JUMPING[character.stompJumpFrameIndex];
        character.img = character.imageCache[framePath];
    },

    /**
     * Applies jump input when grounded.
     * @param {Charakter} character - The character instance.
     */
    updateJumpInput(character) {
        if (!character.world.keyboard.space || character.isAboveGround()) {
            return;
        }
        character.stompBounceActive = false;
        character.jumpLoopStartFrameIndex = character.normalJumpStartFrameIndex;
        character.resetIdleTimer();
        CharakterAudio.playJumpSound(character);
        character.jump();
    }
};
