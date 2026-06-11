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
    snoring_sound = new Audio("audio/snoring.mp3");
    deathAnimationStarted = false;
    walkingAudioActive = false;
    snoringAudioActive = false;
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
    landingDuration = CHARAKTER_DEFAULTS.landingDuration;
    landingActive = false;
    landingStartedAt = null;
    wasAboveGround = false;

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

    /*** Checks whether Pepe was hit recently.
     * @returns {boolean} True when the hurt animation should still be shown.*/
    isHurt() {
        return Date.now() - this.lastHit < this.hurtMovementLockMs;
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

    /** Updates Pepe's visible animation state. */
    updateCharacterAnimation() {
        if (typeof isGamePaused === "function" && isGamePaused()) {
            CharakterAudio.stopSnoringSound(this);
            return;}
        if (this.tryPlayNonGroundAnimation()) {
            return;
        }
        this.prepareLandingState();
        this.playGroundStateAnimation();
    }

    /*** Plays the non-ground state animation when needed.
     * @returns {boolean} True when a non-ground state handled the frame.*/
    tryPlayNonGroundAnimation() {
        if (this.isDead()) {
            this.playDeathStateAnimation();
            return true;
        }
        if (this.isHurt()) {
            this.playHurtStateAnimation();
            return true;
        }
        if (this.isAboveGround()) {
            this.wasAboveGround = true;
            this.playAirStateAnimation();
            return true;
        }
        return false;
    }

    /** Prepares the landing state after Pepe touches the ground again. */
    prepareLandingState() {
        if (!this.wasAboveGround) {
            return;
        }
        this.wasAboveGround = false;
        this.landingActive = true;
        this.landingStartedAt = Date.now();
    }

    /** Plays the death animation state. */
    playDeathStateAnimation() {
        this.resetIdleTimer();
        if (!this.deathAnimationStarted) {
            this.currentImageIndex = 0;
            this.activeAnimation = null;
            this.deathAnimationStarted = true;
        }
        CharakterAudio.stopWalkingSound(this);
        CharakterAudio.stopSnoringSound(this);
        this.playCharacterAnimation(this.IMAGES_DEAD);
    }

    /** Plays the hurt animation state. */
    playHurtStateAnimation() {
        this.resetIdleTimer();
        this.deathAnimationStarted = false;
        CharakterAudio.stopSnoringSound(this);
        this.playCharacterAnimation(this.IMAGES_HURT);
    }

    /** Plays the jump animation state. */
    playAirStateAnimation() {
        this.resetIdleTimer();
        this.deathAnimationStarted = false;
        CharakterAudio.stopSnoringSound(this);
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
        if (this.shouldShowLandingFrame() || !this.world || !this.world.keyboard) {
            return;
        }
        if (this.tryPlayGroundActionAnimation()) {
            return;
        }
        this.playIdleStateAnimation();
    }

    /*** Keeps Pepe on the landing frame until the landing animation expires.
     * @returns {boolean} True when the landing frame is still active.*/
    shouldShowLandingFrame() {
        if (!this.landingActive) {
            return false;
        }
        if (Date.now() - this.landingStartedAt < this.landingDuration) {
            this.img = this.imageCache[this.IMAGES_JUMPING[this.jumpShadowStartFrameIndex]];
            return true;
        }
        this.landingActive = false;
        return false;
    }

    /*** Plays moving or throwing animations while on the ground.
     * @returns {boolean} True when an action animation was played.*/
    tryPlayGroundActionAnimation() {
        if (this.isMoving()) {
            CharakterAudio.stopSnoringSound(this);
            this.playMovingAnimation();
            return true;
        }
        if (this.isThrowingBottle()) {
            CharakterAudio.stopSnoringSound(this);
            this.playThrowingAnimation();
            return true;
        }
        return false;
    }

    /** Plays Pepe's idle or sleeping animation on the ground. */
    playIdleStateAnimation() {
        const idleAnimation = this.getIdleAnimation();
        if (idleAnimation === this.IMAGES_LONG_IDLE) {
            CharakterAudio.startSnoringSound(this);
        } else {
            CharakterAudio.stopSnoringSound(this);
        }
        this.playCharacterAnimation(idleAnimation);
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
            CharakterAudio.stopWalkingSound(this);
            CharakterAudio.stopSnoringSound(this);
            return true;}
        if (!this.world || !this.world.keyboard || this.handleDeadMovementState()) {
            return true;}
        if (this.isMovementLockedAfterHit()) {
            CharakterAudio.stopWalkingSound(this);
            CharakterAudio.stopSnoringSound(this);
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
        CharakterAudio.stopWalkingSound(this);
        CharakterAudio.stopSnoringSound(this);
        return true;
    }

    /** Updates walking audio from current input. */
    updateMovementAudio() {
        if (this.isMoving() || this.isThrowingBottle()) {
            this.resetIdleTimer();}
        if (this.isMoving()) {
            CharakterAudio.startWalkingSound(this);} 
        else {CharakterAudio.stopWalkingSound(this);}
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
        this.snoring_sound.preload = "auto";
        this.walking_sound.loop = true;
        this.snoring_sound.loop = true;
        this.applyGravity();
        this.animate();
    }
}