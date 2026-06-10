class Chicken extends MovableObject {
    height = 70;
    width = 70;
    y = 370;
    groundY = 370;
    variant = "normal";
    isDead = false;
    chasePepe = false;
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

    SMALL_IMAGES_WALKING = [
        "img/3_enemies_chicken/chicken_small/1_walk/1_w.png",
        "img/3_enemies_chicken/chicken_small/1_walk/2_w.png",
        "img/3_enemies_chicken/chicken_small/1_walk/3_w.png"
    ];

    SMALL_IMAGES_DEAD = [
        "img/3_enemies_chicken/chicken_small/2_dead/dead.png"
    ];

    /**
     * Creates a chicken enemy.
     * @param {number} [startX] - The chicken start x position.
     */
    constructor(startX, variant = "normal") {
        super();
        this.variant = variant === "small" ? "small" : "normal";
        this.configureVariant();

        this.x = typeof startX === "number" ? startX : 200 + Math.random() * 500;
        this.speed = 0.75 + Math.random() * 0.1;
        this.applyGravity();
        this.animate();
    }

    /** Applies sprite set and size for the selected chicken variant. */
    configureVariant() {
        if (this.variant !== "small") {
            this.loadImage(this.IMAGES_WALKING[0]);
            this.loadImages(this.IMAGES_WALKING);
            this.loadImages(this.IMAGES_DEAD);
            return;
        }

        this.height = 60;
        this.width = 60;
        this.y = 380;
        this.groundY = 380;
        this.offset = {
            top: 6,
            right: 6,
            bottom: 4,
            left: 6
        };
        this.IMAGES_WALKING = [...this.SMALL_IMAGES_WALKING];
        this.IMAGES_DEAD = [...this.SMALL_IMAGES_DEAD];
        this.loadImage(this.IMAGES_WALKING[0]);
        this.loadImages(this.IMAGES_WALKING);
        this.loadImages(this.IMAGES_DEAD);
    }

    /** Starts chicken movement and animation loops. */
    animate() {
        setInterval(() => this.updateWalkingFrame(), 1000 / 60);
        setInterval(() => this.updateAnimationFrame(), 100);
        setInterval(() => this.updateJumpFrame(), 300);
    }

    /** Updates one walking frame. */
    updateWalkingFrame() {
        if (this.shouldSkipChickenFrame()) {
            return;
        }
        if (this.chasePepe && this.world?.character) {
            this.moveTowardCharacter();
        } else {
            this.moveLeft();
        }
    }

    /** Moves the chicken toward Pepe. */
    moveTowardCharacter() {
        const distance = this.world.character.x - this.x;
        if (distance < 0) {
            this.x -= this.speed;
            this.otherDirection = false;
        } else {
            this.x += this.speed;
            this.otherDirection = true;
        }
    }

    /** Updates one image animation frame. */
    updateAnimationFrame() {
        if (!this.shouldSkipChickenFrame()) {
            this.playAnimation(this.IMAGES_WALKING);
        }
    }

    /** Updates one jump frame when the character is nearby. */
    updateJumpFrame() {
        if (this.shouldSkipChickenFrame() || this.isAboveGround()) {
            return;
        }
        if (this.isCharacterNearby() && Math.random() < 0.4) {
            this.speedY = 14 + Math.random() * 10;
        }
    }

    /*** Checks whether the character is nearby and should trigger jump.
     * @returns {boolean} True when Pepe is within jump range.*/
    isCharacterNearby() {
        const distanceThreshold = 200;
        if (typeof this.world !== "object" || !this.world.character) {
            return false;
        }
        const distance = Math.abs(this.x - this.world.character.x);
        return distance < distanceThreshold;
    }

    /*** Checks whether chicken updates should be skipped.
     * @returns {boolean} True when the chicken frame is skipped.*/
    shouldSkipChickenFrame() {
        return this.isDead || (typeof isGamePaused === "function" && isGamePaused());
    }

    /** Marks the chicken as dead. */
    die() {
        if (this.isDead) {
            return;}
        this.isDead = true;
        this.speed = 0;
        this.speedY = 0;
        this.loadImage(this.IMAGES_DEAD[0]);
    }

    /*** Sets the world reference for chicken behavior.
     * @param {World} world - The world reference.*/
    setWorld(world) {
        this.world = world;
    }
}