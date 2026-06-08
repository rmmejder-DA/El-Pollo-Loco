class Chicken extends MovableObject {
    height = 70;
    width = 70;
    y = 370;
    groundY = 370;
    isDead = false;
    offset = {
        top: 8,
        right: 8,
        bottom: 5,
        left: 8
    };

    IMAGES_WALKING = [
        "img/3_enemies_chicken/chicken_normal/1_walk/1_w.png",
        "img/3_enemies_chicken/chicken_normal/1_walk/2_w.png",
        "img/3_enemies_chicken/chicken_normal/1_walk/3_w.png"
    ];

    IMAGES_DEAD = [
        "img/3_enemies_chicken/chicken_normal/2_dead/dead.png"
    ];


    /** Creates a chicken enemy. */
    constructor(startX) {
        super().loadImage("img/3_enemies_chicken/chicken_normal/1_walk/1_w.png");
        this.loadImages(this.IMAGES_WALKING);
        this.loadImages(this.IMAGES_DEAD);

        this.x = typeof startX === "number" ? startX : 200 + Math.random() * 500;
        this.speed = 0.15 + Math.random() * 0.1; // Zufällige Geschwindigkeit zwischen 0.15 und 0.25
        this.applyGravity();
        this.animate();
    }
    /** Starts chicken movement and animation loops. */
    animate() {
        setInterval(() => this.updateWalkingFrame(), 1000 / 60);
        setInterval(() => this.updateAnimationFrame(), 100);
        setInterval(() => this.updateJumpFrame(), 300);
    }

    /** Updates one walking frame. */
    updateWalkingFrame() {
        if (!this.shouldSkipChickenFrame()) {
            this.moveLeft();
        }
    }

    /** Updates one image animation frame. */
    updateAnimationFrame() {
        if (!this.shouldSkipChickenFrame()) {
            this.playAnimation(this.IMAGES_WALKING);
        }
    }

    /** Updates one random jump frame. */
    updateJumpFrame() {
        if (this.shouldSkipChickenFrame() || this.isAboveGround()) {
            return;
        }
        if (Math.random() < 0.12) {
            this.speedY = 14 + Math.random() * 10;
        }
    }

    /** Checks whether chicken updates should be skipped. */
    shouldSkipChickenFrame() {
        return this.isDead || (typeof isGamePaused === "function" && isGamePaused());
    }

    /** Marks the chicken as dead. */
    die() {
        if (this.isDead) {
            return;
        }

        this.isDead = true;
        this.speed = 0;
        this.speedY = 0;
        this.loadImage(this.IMAGES_DEAD[0]);
    }
}