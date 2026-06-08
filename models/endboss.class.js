class Endboss extends MovableObject {
    height = 400;
    width = 250;
    y = 50;
    x = 2000; // Startposition des Endboss
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
    targetDistance = 80;
    attackCooldownMs = 750;
    attackDurationMs = 520;
    lastAttackAt = 0;
    attackingUntil = 0;
    knockbackUntil = 0;
    knockbackDirection = 0;
    knockbackDurationMs = 360;
    knockbackSpeed = 5;

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
        this.x = 2000; // Startposition des Endboss
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
        this.otherDirection = distance > 0;
        this.updateAttackState(Math.abs(distance));
        this.moveByCurrentState(character, distance);
    }

    /** Checks whether movement should be skipped. */
    shouldSkipMovementFrame() {
        return this.isPaused() || this.isDead() || !this.fightStarted || !this.world?.character;
    }

    /** Moves the boss according to its current state. */
    moveByCurrentState(character, distance) {
        if (this.isKnockedBack()) {
            this.moveKnockback();
        } else if (this.isAttacking()) {
            this.moveAttackStep(distance);
        } else {
            this.moveTowardCharacter(character);
        }
    }

    /** Moves the boss during knockback. */
    moveKnockback() {
        this.x += this.knockbackDirection * this.knockbackSpeed;
        this.keepInsideFightBounds();
    }

    /** Moves the boss during an attack. */
    moveAttackStep(distance) {
        this.x += distance > 0 ? this.speed * 0.8 : -this.speed * 0.8;
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

    /** Checks whether the game is paused. */
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
            this.playAnimation(this.IMAGES_ALERT);
        } else if (this.isHurt()) {
            this.playAnimation(this.IMAGES_HURT);
        } else if (this.isAttacking()) {
            this.playAnimation(this.IMAGES_ATTACK);
        } else {
            this.playAnimation(this.IMAGES_WALKING);
        }
    }

    /** Starts the active boss fight. */
    startFight() {
        this.fightStarted = true;
    }

    /** Applies damage and knockback to the boss. */
    hit() {
        const previousEnergy = this.energy;
        super.hit();
        if (this.energy === previousEnergy || !this.world || !this.world.character) {
            return;
        }
        this.attackingUntil = 0;
        this.knockbackDirection = this.world.character.x < this.x ? 1 : -1;
        this.knockbackUntil = Date.now() + this.knockbackDurationMs;
    }

    /** Sets the horizontal boss fight bounds. */
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

    /** Moves the boss toward Pepe. */
    moveTowardCharacter(character) {
        const targetX = Math.max(this.fightMinX, Math.min(character.x, this.fightMaxX));
        const distanceToTarget = targetX - this.x;
        if (Math.abs(distanceToTarget) <= this.targetDistance) {
            this.keepInsideFightBounds();
            return;}
        this.x += distanceToTarget > 0 ? this.speed : -this.speed;
        this.keepInsideFightBounds();
    }

    /** Updates attack timing from distance. */
    updateAttackState(distanceToCharacter) {
        const now = Date.now();
        if (distanceToCharacter <= 190 && now - this.lastAttackAt >= this.attackCooldownMs) {
            this.lastAttackAt = now;
            this.attackingUntil = now + this.attackDurationMs;
        }
    }

    /** Checks whether the boss is attacking. */
    isAttacking() {
        return Date.now() < this.attackingUntil;
    }

    /** Checks whether the boss is knocked back. */
    isKnockedBack() {
        return Date.now() < this.knockbackUntil;
    }

    /** Checks whether the boss can damage Pepe. */
    canDamageCharacter() {
        return this.isAttacking();
    }
}