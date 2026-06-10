class Charakter extends MovableObject {
    height = CHARAKTER_DEFAULTS.height;
    width = CHARAKTER_DEFAULTS.width;
    groundY = CHARAKTER_DEFAULTS.groundY;
    y = this.groundY;
    speed = CHARAKTER_DEFAULTS.speed;
    speedY = CHARAKTER_DEFAULTS.speedY;
    acceleration = CHARAKTER_DEFAULTS.acceleration;
    gravity = CHARAKTER_DEFAULTS.gravity;
    offset = CHARAKTER_DEFAULTS.offset;

    IMAGES_HURT = CHARAKTER_ASSETS.hurt;
    IMAGES_DEAD = CHARAKTER_ASSETS.dead;
    IMAGES_WALKING = CHARAKTER_ASSETS.walking;
    IMAGES_JUMPING = CHARAKTER_ASSETS.jumping;
    IMAGES_IDLE = CHARAKTER_ASSETS.idle;
    IMAGES_LONG_IDLE = CHARAKTER_ASSETS.longIdle;

    world;
    walking_sound = new Audio("audio/walking.mp3");
    jump_sound = new Audio("audio/jump.mp3");
    deathAnimationStarted = false;
    walkingAudioActive = false;
    walkingFadeInterval = null;
    walkingVolume = CHARAKTER_DEFAULTS.walkingVolume;
    activeAnimation = null;
    lastAnimationFrameAt = 0;
    normalJumpStartFrameIndex = CHARAKTER_DEFAULTS.normalJumpStartFrameIndex;
    fastJumpFrameCount = CHARAKTER_DEFAULTS.fastJumpFrameCount;
    jumpLoopStartFrameIndex = this.normalJumpStartFrameIndex;
    stompJumpFrameIndex = CHARAKTER_DEFAULTS.stompJumpFrameIndex;
    stompJumpLastFrameIndex = CHARAKTER_DEFAULTS.stompJumpLastFrameIndex;
    jumpShadowStartFrameIndex = CHARAKTER_DEFAULTS.jumpShadowStartFrameIndex;
    jumpShadowGroundDistance = CHARAKTER_DEFAULTS.jumpShadowGroundDistance;
    stompBounceActive = false;
    firstJumpFrameInterval = CHARAKTER_DEFAULTS.firstJumpFrameInterval;
    jumpFrameInterval = CHARAKTER_DEFAULTS.jumpFrameInterval;
    idleStartedAt = null;
    longIdleDelay = CHARAKTER_DEFAULTS.longIdleDelay;
    hurtMovementLockMs = CHARAKTER_DEFAULTS.hurtMovementLockMs;

    /*** Returns Pepe's maximum x position.
     * @returns {number} The maximum x position for Pepe.*/
    getMaxX() {
        return typeof this.world.getCharacterMaxX === "function"
            ? this.world.getCharacterMaxX()
            : this.world.level.level_end_x;
    }

    /**
     * Returns Pepe's minimum x position.
     * @returns {number} The minimum x position for Pepe.
     */
    getMinX() {
        return typeof this.world.getCharacterMinX === "function"
            ? this.world.getCharacterMinX()
            : 0;
    }

    /*** Checks whether Pepe is moving horizontally.
     * @returns {boolean} True when Pepe moves left or right.*/
    isMoving() {
        if (!this.world || !this.world.keyboard) {
            return false;}
        const minX = this.getMinX();
        const maxX = this.getMaxX();
        const isMovingRight = this.world.keyboard.right && this.x < maxX;
        const isMovingLeft = this.world.keyboard.left && this.x > minX;
        return isMovingRight || isMovingLeft;
    }

    /*** Checks whether Pepe is throwing a bottle.
     * @returns {boolean} True when the throw key is pressed.*/
    isThrowingBottle() {
        return this.world && this.world.keyboard && this.world.keyboard.D;
    }

    /*** Plays a character animation sequence.
     * @param {string[]} images - The animation frame paths.*/
    playCharacterAnimation(images) {
        CharakterJumpLogic.playCharacterAnimation(this, images);
    }

    /**
     * Checks whether jump frames with ground shadow should be hidden.
     * @returns {boolean} True when Pepe is still too high above ground.
     */
    shouldHideJumpShadowFrames() {
        return CharakterJumpLogic.shouldHideJumpShadowFrames(this);
    }

    /**
     * Checks whether the current animation should advance to the next frame.
     * @param {string[]} images - The animation frame paths.
     * @returns {boolean} True when the next frame should be shown now.
     */
    shouldAdvanceAnimationFrame(images) {
        return CharakterJumpLogic.shouldAdvanceAnimationFrame(this, images);
    }

    /** Resets the idle timer. */
    resetIdleTimer() {
        this.idleStartedAt = null;
    }

    /*** Returns the correct idle animation.
     * @returns {string[]} The idle or long idle animation frames.*/
    getIdleAnimation() {
        if (!this.idleStartedAt) {
            this.idleStartedAt = Date.now();
        }
        const idleTime = Date.now() - this.idleStartedAt;
        return idleTime >= this.longIdleDelay
            ? this.IMAGES_LONG_IDLE
            : this.IMAGES_IDLE;
    }

    /** Stops Pepe's walking sound with a fade out. */
    stopWalkingSound() {
        if (!this.walkingAudioActive) {
            return;}
        if (this.walkingFadeInterval) {
            return;}
        this.walkingFadeInterval = setInterval(() => {
            this.fadeWalkingSoundStep();
        }, 30);
    }

    /** Applies one fade-out step to the walking sound. */
    fadeWalkingSoundStep() {
        const nextVolume = Math.max(0, this.walking_sound.volume - 0.08);
        this.walking_sound.volume = nextVolume;
        if (nextVolume <= 0) {
            this.finishWalkingSoundFade();
        }
    }

    /** Finishes the walking sound fade-out. */
    finishWalkingSoundFade() {
        clearInterval(this.walkingFadeInterval);
        this.walkingFadeInterval = null;
        this.walking_sound.pause();
        this.walkingAudioActive = false;
        this.walking_sound.volume = this.walkingVolume;
    }

    /*** Applies mute state to Pepe's sounds.
     * @param {boolean} isMuted - Whether audio should be muted.*/
    setMuted(isMuted) {
        this.walking_sound.muted = isMuted;
        this.jump_sound.muted = isMuted;
        if (isMuted) {
            this.stopWalkingSound();}
    }

    /** Starts Pepe's walking sound when audio is enabled. */
    startWalkingSound() {
        if (typeof isGameMuted === "function" && isGameMuted()) {
            return;}
        this.cancelWalkingFade();
        if (this.walkingAudioActive) {
            return;}
        this.playWalkingSound();
    }

    /** Starts the walking sound playback. */
    playWalkingSound() {
        this.walking_sound.volume = this.walkingVolume;
        this.walkingAudioActive = true;
        this.walking_sound.play().catch(() => {
            this.walkingAudioActive = false;
        });
    }

    /** Cancels a running walking sound fade. */
    cancelWalkingFade() {
        if (!this.walkingFadeInterval) {
            return;}
        clearInterval(this.walkingFadeInterval);
        this.walkingFadeInterval = null;
        this.walking_sound.volume = this.walkingVolume;
    }

    /** Updates Pepe's visible animation state. */
    updateCharacterAnimation() {
        if (typeof isGamePaused === "function" && isGamePaused()) {
            return;}
        if (this.isDead()) {
            this.playDeathStateAnimation();
            return;}
        if (this.isHurt()) {
            this.playHurtStateAnimation();
            return;}
        if (this.isAboveGround()) {
            this.playAirStateAnimation();
            return;}
        this.playGroundStateAnimation();
    }

    /** Plays the death animation state. */
    playDeathStateAnimation() {
        this.resetIdleTimer();
        if (!this.deathAnimationStarted) {
            this.currentImageIndex = 0;
            this.activeAnimation = null;
            this.deathAnimationStarted = true;
        }
        this.stopWalkingSound();
        this.playCharacterAnimation(this.IMAGES_DEAD);
    }

    /** Plays the hurt animation state. */
    playHurtStateAnimation() {
        this.resetIdleTimer();
        this.deathAnimationStarted = false;
        this.playCharacterAnimation(this.IMAGES_HURT);
    }

    /** Plays the jump animation state. */
    playAirStateAnimation() {
        this.resetIdleTimer();
        this.deathAnimationStarted = false;
        this.playCharacterAnimation(this.IMAGES_JUMPING);
    }

    /** Forces the stomp jump frame so Pepe does not show the early air shadow on a chicken. */
    showStompJumpFrame() {
        CharakterJumpLogic.showStompJumpFrame(this);
    }

    /** Plays the grounded animation state. */
    playGroundStateAnimation() {
        this.stompBounceActive = false;
        this.jumpLoopStartFrameIndex = this.normalJumpStartFrameIndex;
        this.deathAnimationStarted = false;
        if (!this.world || !this.world.keyboard) {
            return;}
        if (this.isMoving()) {
            this.playMovingAnimation();
            return;}
        if (this.isThrowingBottle()) {
            this.playThrowingAnimation();
            return;}
        this.playCharacterAnimation(this.getIdleAnimation());
    }

    /** Plays the walking animation. */
    playMovingAnimation() {
        this.resetIdleTimer();
        this.playCharacterAnimation(this.IMAGES_WALKING);
    }

    /** Plays the throwing animation. */
    playThrowingAnimation() {
        this.resetIdleTimer();
        this.playCharacterAnimation(this.IMAGES_IDLE);
    }

    /** Starts Pepe's movement and animation loops. */
    animate() {
        setInterval(() => this.updateMovementFrame(), 1000 / 60);
        setInterval(() => this.updateCharacterAnimation(), 50);
    }

    /** Updates one movement frame. */
    updateMovementFrame() {
        if (this.shouldSkipMovementFrame()) {
            return;}
        const minX = this.getMinX();
        const maxX = this.getMaxX();
        this.updateMovementAudio();
        this.updateHorizontalMovement(minX, maxX);
        this.updateJumpInput();
        this.updateCameraPosition();
    }

    /*** Checks whether movement should be skipped.
     * @returns {boolean} True when the movement frame is skipped.*/
    shouldSkipMovementFrame() {
        if (typeof isGamePaused === "function" && isGamePaused()) {
            this.stopWalkingSound();
            return true;}
        if (!this.world || !this.world.keyboard || this.handleDeadMovementState()) {
            return true;
        }
        if (this.isMovementLockedAfterHit()) {
            this.stopWalkingSound();
            this.updateCameraPosition();
            return true;
        }
        return false;
    }

    /**
     * Checks whether Pepe should still be movement-locked after a hit.
     * @returns {boolean} True while the short post-hit control lock is active.
     */
    isMovementLockedAfterHit() {
        return Date.now() - this.lastHit < this.hurtMovementLockMs;
    }

    /*** Handles dead movement state.
     * @returns {boolean} True when Pepe is dead.*/
    handleDeadMovementState() {
        if (!this.isDead()) {
            return false;}
        this.resetIdleTimer();
        this.stopWalkingSound();
        return true;
    }

    /** Updates walking audio from current input. */
    updateMovementAudio() {
        if (this.isMoving() || this.isThrowingBottle()) {
            this.resetIdleTimer();}
        if (this.isMoving()) {
            this.startWalkingSound();} 
        else {this.stopWalkingSound();}
    }

    /*** Updates horizontal movement and facing direction.
     * @param {number} minX - The minimum x position for Pepe.
     * @param {number} maxX - The maximum x position for Pepe.*/
    updateHorizontalMovement(minX, maxX) {
        if (this.world.keyboard.right && this.x < maxX) {
            this.moveRight();
            this.otherDirection = false;
        } else if (this.world.keyboard.left && this.x > minX) {
            this.moveLeft();
            this.otherDirection = true;
        }
        this.x = Math.max(minX, Math.min(this.x, maxX));
    }

    /** Applies jump input when Pepe is grounded. */
    updateJumpInput() {
        CharakterJumpLogic.updateJumpInput(this);
    }

    /** Plays Pepe's jump sound. */
    playJumpSound() {
        this.jump_sound.currentTime = 0;
        this.jump_sound.muted = typeof isGameMuted === "function" && isGameMuted();
        this.jump_sound.play().catch(() => { });
    }

    /** Updates the world camera position. */
    updateCameraPosition() {
        if (typeof this.world.updateCameraX === "function") {
            this.world.updateCameraX();
        } else {
            this.world.camera_x = -this.x + 100;
        }
    }

    /** Creates Pepe and preloads his assets. */
    constructor() {
        super().loadImage("img/2_character_pepe/1_idle/idle/I-1.png");
        this.loadImages(this.IMAGES_WALKING);
        this.loadImages(this.IMAGES_JUMPING);
        this.loadImages(this.IMAGES_IDLE);
        this.loadImages(this.IMAGES_LONG_IDLE);
        this.loadImages(this.IMAGES_DEAD);
        this.loadImages(this.IMAGES_HURT);
        this.walking_sound.preload = "auto";
        this.jump_sound.preload = "auto";
        this.walking_sound.loop = true;
        this.applyGravity();
        this.animate();
    }
}