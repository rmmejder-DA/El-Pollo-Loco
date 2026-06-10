class Endboss extends MovableObject {
    energy = 80;
    height = 400;
    width = 250;
    groundY = 50;
    y = 50;
    x = 2000;
    offset = {
        top: 80,
        right: 25,
        bottom: 20,
        left: 35
    };
    isDeadAnimationStarted = false;
    world;
    speed = 2.8;
    fightStarted = false;
    patrolDirection = -1;
    deadAnimationPlayed = false;
    fightMinX = 1450;
    fightMaxX = 3350;
    targetDistance = 125;
    attackTriggerDistance = 205;
    attackCooldownMs = 1150;
    attackDurationMs = 650;
    lastAttackAt = 0;
    attackingUntil = 0;
    attackDirection = 1;
    attackLungeSpeed = 6.9;
    attackJumpForce = 22;
    knockbackUntil = 0;
    knockbackDirection = 0;
    knockbackDurationMs = 360;
    knockbackSpeed = 5;
    retreatTriggerDistance = 115;
    retreatDurationMs = 1200;
    retreatCooldownMs = 1400;
    retreatSpeed = 4.8;
    retreatUntil = 0;
    lastRetreatAt = 0;
    activeAnimation = null;

    IMAGES_WALKING = [
        "img/4_enemie_boss_chicken/1_walk/G1.png",
        "img/4_enemie_boss_chicken/1_walk/G2.png",
        "img/4_enemie_boss_chicken/1_walk/G3.png",
        "img/4_enemie_boss_chicken/1_walk/G4.png"
    ];

    IMAGES_ALERT = [
        "img/4_enemie_boss_chicken/2_alert/G5.png",
        "img/4_enemie_boss_chicken/2_alert/G6.png",
        "img/4_enemie_boss_chicken/2_alert/G7.png",
        "img/4_enemie_boss_chicken/2_alert/G8.png",
        "img/4_enemie_boss_chicken/2_alert/G9.png",
        "img/4_enemie_boss_chicken/2_alert/G10.png",
        "img/4_enemie_boss_chicken/2_alert/G11.png",
        "img/4_enemie_boss_chicken/2_alert/G12.png"
    ];

    IMAGES_ATTACK = [
        "img/4_enemie_boss_chicken/3_attack/G13.png",
        "img/4_enemie_boss_chicken/3_attack/G14.png",
        "img/4_enemie_boss_chicken/3_attack/G15.png",
        "img/4_enemie_boss_chicken/3_attack/G16.png",
        "img/4_enemie_boss_chicken/3_attack/G17.png",
        "img/4_enemie_boss_chicken/3_attack/G18.png",
        "img/4_enemie_boss_chicken/3_attack/G19.png",
        "img/4_enemie_boss_chicken/3_attack/G20.png"
    ];
    
    IMAGES_HURT = [
        "img/4_enemie_boss_chicken/4_hurt/G21.png",
        "img/4_enemie_boss_chicken/4_hurt/G22.png",
        "img/4_enemie_boss_chicken/4_hurt/G23.png"
    ];

    IMAGES_DEAD = [
        "img/4_enemie_boss_chicken/5_dead/G24.png",
        "img/4_enemie_boss_chicken/5_dead/G25.png",
        "img/4_enemie_boss_chicken/5_dead/G26.png"
    ];
    hadFirstContact = false;

    /** Creates the endboss and preloads animations. */
    constructor() {
        super();
        this.loadImages(this.IMAGES_WALKING);
        this.loadImages(this.IMAGES_ALERT);
        this.loadImages(this.IMAGES_ATTACK);
        this.loadImages(this.IMAGES_HURT);
        this.loadImages(this.IMAGES_DEAD);
        this.loadImage(this.IMAGES_WALKING[0]);
        this.x = 2000;
        this.applyGravity();
        this.animate();
    }

    /** Starts endboss movement and animation loops. */
    animate() {
        setInterval(() => this.updateMovementFrame(), 1000 / 60);
        setInterval(() => this.updateAnimationFrame(), 120);
    }

    /** Updates one movement frame. */
    updateMovementFrame() {
        if (this.shouldSkipMovementFrame()) {
            return;
        }
        const character = this.world.character;
        const distance = character.x - this.x;
        const absoluteDistance = Math.abs(distance);
        this.otherDirection = distance > 0;
        this.updateRetreatState(absoluteDistance);
        this.updateAttackState(absoluteDistance);
        this.moveByCurrentState(character, distance);
    }

    /*** Checks whether movement should be skipped.
     * @returns {boolean} True when the movement frame is skipped.*/
    shouldSkipMovementFrame() {
        return this.isPaused() || this.isDead() || !this.fightStarted || !this.world?.character;
    }

    /*** Moves the boss according to its current state.
     * @param {Charakter} character - Pepe's character instance.
     * @param {number} distance - Horizontal distance to Pepe.*/
    moveByCurrentState(character, distance) {
        if (this.isKnockedBack()) {
            this.moveKnockback();
        } else if (this.isAttacking()) {
            this.moveAttackStep(distance);
        } else if (this.isRetreating()) {
            this.moveRetreatStep(distance);
        } else {
            this.moveTowardCharacter(character);
        }
    }

    /** Moves the boss during knockback. */
    moveKnockback() {
        this.x += this.knockbackDirection * this.knockbackSpeed;
        this.keepInsideFightBounds();
    }

    /*** Moves the boss during an attack.
     * @param {number} distance - Horizontal distance to Pepe.*/
    moveAttackStep(distance) {
        const direction = this.attackDirection || (distance > 0 ? 1 : -1);
        const inAirMultiplier = this.isAboveGround() ? 1.15 : 1;
        this.x += direction * this.attackLungeSpeed * inAirMultiplier;
        this.keepInsideFightBounds();
    }

    /**
     * Moves the boss one step backwards to open space.
     * @param {number} distance - Horizontal distance to Pepe.
     */
    moveRetreatStep(distance) {
        const directionAwayFromPepe = distance > 0 ? -1 : 1;
        this.x += directionAwayFromPepe * this.retreatSpeed;
        this.keepInsideFightBounds();
    }

    /** Updates one animation frame. */
    updateAnimationFrame() {
        if (this.isPaused()) {
            return;
        }
        if (this.isDead()) {
            this.playDeadAnimation();
            return;
        }
        this.playAliveAnimation();
    }

    /*** Checks whether the game is paused.
     * @returns {boolean} True when the game is paused.*/
    isPaused() {
        return typeof isGamePaused === "function" && isGamePaused();
    }

    /** Plays the dead animation once. */
    playDeadAnimation() {
        if (this.deadAnimationPlayed) {
            return;
        }
        this.prepareDeadAnimation();
        this.playAnimation(this.IMAGES_DEAD);
        this.finishDeadAnimationWhenDone();
    }

    /** Prepares the dead animation start. */
    prepareDeadAnimation() {
        if (!this.isDeadAnimationStarted) {
            this.currentImageIndex = 0;
            this.isDeadAnimationStarted = true;
            this.activeAnimation = this.IMAGES_DEAD;
        }
    }

    /** Freezes the dead animation at the last frame. */
    finishDeadAnimationWhenDone() {
        if (this.currentImageIndex < this.IMAGES_DEAD.length) {
            return;
        }
        this.deadAnimationPlayed = true;
        this.currentImageIndex = this.IMAGES_DEAD.length - 1;
    }

    /** Plays the current alive animation. */
    playAliveAnimation() {
        if (!this.fightStarted) {
            this.playBossAnimation(this.IMAGES_ALERT);
        } else if (this.isHurt()) {
            this.playBossAnimation(this.IMAGES_HURT);
        } else if (this.isAttacking()) {
            this.playBossAnimation(this.IMAGES_ATTACK);
        } else {
            this.playBossAnimation(this.IMAGES_WALKING);
        }
    }

    /*** Plays a boss animation and resets the frame on state change.
     * @param {string[]} images - The animation frame paths.*/
    playBossAnimation(images) {
        if (this.activeAnimation !== images) {
            this.currentImageIndex = 0;
            this.activeAnimation = images;
        }
        this.playAnimation(images);
    }

    /** Starts the active boss fight. */
    startFight() {
        this.fightStarted = true;
    }

    /**
     * Applies damage and knockback to the boss.
     * @param {number} [damage=25] - The damage amount.
     */
    hit(damage = 25) {
        const previousEnergy = this.energy;
        super.hit(damage);
        if (this.energy === previousEnergy || !this.world || !this.world.character) {
            return;
        }
        this.world.spawnBossBottleDrops?.(1);
        this.attackingUntil = 0;
        this.knockbackDirection = this.world.character.x < this.x ? 1 : -1;
        this.knockbackUntil = Date.now() + this.knockbackDurationMs;
    }

    /*** Sets the horizontal boss fight bounds.
     * @param {number} minX - The minimum x position.
     * @param {number} maxX - The maximum x position.*/
    setFightBounds(minX, maxX) {
        if (typeof minX === "number" && typeof maxX === "number" && maxX > minX) {
            this.fightMinX = minX;
            this.fightMaxX = maxX;
        }
    }

    /** Keeps the boss inside its fight bounds. */
    keepInsideFightBounds() {
        this.x = Math.max(this.fightMinX, Math.min(this.x, this.fightMaxX));
    }

    /*** Moves the boss toward Pepe.
     * @param {Charakter} character - Pepe's character instance.*/
    moveTowardCharacter(character) {
        const targetX = Math.max(this.fightMinX, Math.min(character.x, this.fightMaxX));
        const distanceToTarget = targetX - this.x;
        if (Math.abs(distanceToTarget) <= this.targetDistance) {
            this.keepInsideFightBounds();
            return;}
        this.x += distanceToTarget > 0 ? this.speed : -this.speed;
        this.keepInsideFightBounds();
    }

    /*** Updates attack timing from distance.
     * @param {number} distanceToCharacter - Distance to Pepe.*/
    updateAttackState(distanceToCharacter) {
        if (this.isRetreating()) {
            return;
        }
        if (typeof this.world?.canEndbossAttack === "function" && !this.world.canEndbossAttack()) {
            return;
        }
        const now = Date.now();
        if (distanceToCharacter <= this.attackTriggerDistance && now - this.lastAttackAt >= this.attackCooldownMs) {
            this.startAttack();
            this.world?.spawnBossBottleDrops?.(1);
        }
    }

    /**
     * Starts retreat phases when Pepe gets too close.
     * @param {number} distanceToCharacter - Distance to Pepe.
     */
    updateRetreatState(distanceToCharacter) {
        const now = Date.now();
        if (this.isAttacking() || this.isKnockedBack() || this.isRetreating()) {
            return;
        }
        if (distanceToCharacter > this.retreatTriggerDistance) {
            return;
        }
        if (now - this.lastRetreatAt < this.retreatCooldownMs) {
            return;
        }
        if (Math.random() < 0.7) {
            this.lastRetreatAt = now;
            this.retreatUntil = now + this.retreatDurationMs;
        }
    }

    /** Starts one leap attack toward Pepe. */
    startAttack() {
        const now = Date.now();
        const character = this.world?.character;
        this.lastAttackAt = now;
        this.attackingUntil = now + this.attackDurationMs;
        this.attackDirection = character && character.x < this.x ? -1 : 1;

        if (!this.isAboveGround()) {
            this.speedY = this.attackJumpForce;
        }
    }

    /*** Checks whether the boss is attacking.
     * @returns {boolean} True when the boss is attacking.*/
    isAttacking() {
        return Date.now() < this.attackingUntil;
    }

    /*** Checks whether the boss is knocked back.
     * @returns {boolean} True when the boss is knocked back.*/
    isKnockedBack() {
        return Date.now() < this.knockbackUntil;
    }

    /**
     * Checks whether the boss is currently retreating.
     * @returns {boolean} True when the boss is retreating.
     */
    isRetreating() {
        return Date.now() < this.retreatUntil;
    }

    /*** Checks whether the boss can damage Pepe.
     * @returns {boolean} True when the boss can damage Pepe.*/
    canDamageCharacter() {
        return this.isAttacking();
    }
}