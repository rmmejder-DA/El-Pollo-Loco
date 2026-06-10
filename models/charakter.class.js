class Charakter extends MovableObject {
    height = 260;
    width = 150;
    groundY = 180;
    y = this.groundY;
    speed = 7;
    speedY = 0;
    acceleration = 2;
    gravity = 1;
    offset = {top: 95, right: 35, bottom: 10, left: 35};

    IMAGES_HURT = [
        "img/2_character_pepe/4_hurt/H-41.png",
        "img/2_character_pepe/4_hurt/H-42.png",
        "img/2_character_pepe/4_hurt/H-43.png"
    ];

    IMAGES_DEAD = [
        "img/2_character_pepe/5_dead/D-51.png",
        "img/2_character_pepe/5_dead/D-52.png",
        "img/2_character_pepe/5_dead/D-53.png",
        "img/2_character_pepe/5_dead/D-54.png",
        "img/2_character_pepe/5_dead/D-55.png",
        "img/2_character_pepe/5_dead/D-56.png"
    ];

    IMAGES_WALKING = [
        "img/2_character_pepe/2_walk/W-21.png",
        "img/2_character_pepe/2_walk/W-22.png",
        "img/2_character_pepe/2_walk/W-23.png",
        "img/2_character_pepe/2_walk/W-24.png",
        "img/2_character_pepe/2_walk/W-25.png",
        "img/2_character_pepe/2_walk/W-26.png"
    ];

    IMAGES_JUMPING = [
        "img/2_character_pepe/3_jump/J-31.png",
        "img/2_character_pepe/3_jump/J-32.png",
        "img/2_character_pepe/3_jump/J-33.png",
        "img/2_character_pepe/3_jump/J-34.png",
        "img/2_character_pepe/3_jump/J-35.png",
        "img/2_character_pepe/3_jump/J-36.png",
        "img/2_character_pepe/3_jump/J-37.png",
        "img/2_character_pepe/3_jump/J-38.png",
        "img/2_character_pepe/3_jump/J-39.png"
    ];

    IMAGES_IDLE = [
        "img/2_character_pepe/1_idle/idle/I-1.png",
        "img/2_character_pepe/1_idle/idle/I-2.png",
        "img/2_character_pepe/1_idle/idle/I-3.png",
        "img/2_character_pepe/1_idle/idle/I-4.png",
        "img/2_character_pepe/1_idle/idle/I-5.png",
        "img/2_character_pepe/1_idle/idle/I-6.png",
        "img/2_character_pepe/1_idle/idle/I-7.png",
        "img/2_character_pepe/1_idle/idle/I-8.png",
        "img/2_character_pepe/1_idle/idle/I-9.png",
        "img/2_character_pepe/1_idle/idle/I-10.png"
    ];

    IMAGES_LONG_IDLE = [
        "img/2_character_pepe/1_idle/long_idle/I-11.png",
        "img/2_character_pepe/1_idle/long_idle/I-12.png",
        "img/2_character_pepe/1_idle/long_idle/I-13.png",
        "img/2_character_pepe/1_idle/long_idle/I-14.png",
        "img/2_character_pepe/1_idle/long_idle/I-15.png",
        "img/2_character_pepe/1_idle/long_idle/I-16.png",
        "img/2_character_pepe/1_idle/long_idle/I-17.png",
        "img/2_character_pepe/1_idle/long_idle/I-18.png",
        "img/2_character_pepe/1_idle/long_idle/I-19.png",
        "img/2_character_pepe/1_idle/long_idle/I-20.png"
    ];

    world;
    walking_sound = new Audio("audio/walking.mp3");
    jump_sound = new Audio("audio/jump.mp3");
    deathAnimationStarted = false;
    walkingAudioActive = false;
    walkingFadeInterval = null;
    walkingVolume = 0.25;
    activeAnimation = null;
    idleStartedAt = null;
    longIdleDelay = 5000;
    hurtMovementLockMs = 350;

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
        if (this.activeAnimation !== images) {
            this.currentImageIndex = 0;
            this.activeAnimation = images;
        }
        this.playAnimation(images);
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

    /** Plays the grounded animation state. */
    playGroundStateAnimation() {
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
        if (!this.world.keyboard.space || this.isAboveGround()) {
            return;}
        this.resetIdleTimer();
        this.playJumpSound();
        this.jump();
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