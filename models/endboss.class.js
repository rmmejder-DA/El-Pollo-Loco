class Endboss extends MovableObject {
    height = 400;
    width = 250;
    y = 50;
    x = 2000; // Startposition des Endboss
    isDeadAnimationStarted = false;
    world;
    speed = 2.8;
    fightStarted = false;
    patrolDirection = -1;
    deadAnimationPlayed = false;
    fightMinX = 1450;
    fightMaxX = 3350;
    preferredDistanceMin = 120;
    preferredDistanceMax = 260;
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

    animate() {
        setInterval(() => {
            if (this.isDead()) {
                return;
            }

            if (!this.fightStarted || !this.world || !this.world.character) {
                return;
            }

            const character = this.world.character;
            const distanceToCharacter = character.x - this.x;
            this.otherDirection = distanceToCharacter > 0;
            this.updateAttackState(Math.abs(distanceToCharacter));

            const minX = this.fightMinX;
            const maxX = this.fightMaxX;

            if (this.isKnockedBack()) {
                this.x += this.knockbackDirection * this.knockbackSpeed;
                this.x = Math.max(minX, Math.min(this.x, maxX));
                return;
            }

            if (this.isAttacking()) {
                this.x += distanceToCharacter > 0 ? this.speed * 0.8 : -this.speed * 0.8;
                this.x = Math.max(minX, Math.min(this.x, maxX));
                return;
            }

            if (Math.abs(distanceToCharacter) > this.preferredDistanceMax) {
                this.x += distanceToCharacter > 0 ? this.speed : -this.speed;
                this.x = Math.max(minX, Math.min(this.x, maxX));
                return;
            }

            if (Math.abs(distanceToCharacter) < this.preferredDistanceMin) {
                this.x += distanceToCharacter > 0 ? -this.speed * 0.9 : this.speed * 0.9;
                this.x = Math.max(minX, Math.min(this.x, maxX));
                return;
            }

            if (this.x <= minX) {
                this.patrolDirection = 1;
            } else if (this.x >= maxX) {
                this.patrolDirection = -1;
            }

            this.x += this.speed * 0.45 * this.patrolDirection;
            this.x = Math.max(minX, Math.min(this.x, maxX));
        }, 1000 / 60);

        setInterval(() => {
            if (this.isDead()) {
                if (!this.deadAnimationPlayed) {
                    if (!this.isDeadAnimationStarted) {
                        this.currentImageIndex = 0;
                        this.isDeadAnimationStarted = true;
                    }

                    this.playAnimation(this.IMAGES_DEAD);
                    if (this.currentImageIndex >= this.IMAGES_DEAD.length) {
                        this.deadAnimationPlayed = true;
                        this.currentImageIndex = this.IMAGES_DEAD.length - 1;
                    }
                }
                return;
            }

            if (!this.fightStarted) {
                this.playAnimation(this.IMAGES_ALERT);
                return;
            }

            if (this.isHurt()) {
                this.playAnimation(this.IMAGES_HURT);
                return;
            }

            if (this.isAttacking()) {
                this.playAnimation(this.IMAGES_ATTACK);
                return;
            }

            this.playAnimation(this.IMAGES_WALKING);
        }, 120);
    }

    startFight() {
        this.fightStarted = true;
    }

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

    setFightBounds(minX, maxX) {
        if (typeof minX === "number" && typeof maxX === "number" && maxX > minX) {
            this.fightMinX = minX;
            this.fightMaxX = maxX;
        }
    }

    updateAttackState(distanceToCharacter) {
        const now = Date.now();
        if (distanceToCharacter <= 190 && now - this.lastAttackAt >= this.attackCooldownMs) {
            this.lastAttackAt = now;
            this.attackingUntil = now + this.attackDurationMs;
        }
    }

    isAttacking() {
        return Date.now() < this.attackingUntil;
    }

    isKnockedBack() {
        return Date.now() < this.knockbackUntil;
    }

    canDamageCharacter() {
        return this.isAttacking();
    }
}