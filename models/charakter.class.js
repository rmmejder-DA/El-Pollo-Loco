class Charakter extends MovableObject {
    height = 150;
    y = 280;
    groundY = 280;
    speed = 7;
    speedY = 0;
    acceleration = 2;
    gravity = 1;
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
        "img/2_character_pepe/3_jump/J-36.png"
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

    world;
    walking_sound = new Audio("audio/walking.mp3");
    jump_sound = new Audio("audio/jump.mp3");
    deathAnimationStarted = false;
    walkingAudioActive = false;
    walkingFadeInterval = null;
    walkingVolume = 0.45;

    stopWalkingSound() {
        if (!this.walkingAudioActive) {
            return;
        }

        if (this.walkingFadeInterval) {
            return;
        }

        this.walkingFadeInterval = setInterval(() => {
            const nextVolume = Math.max(0, this.walking_sound.volume - 0.08);
            this.walking_sound.volume = nextVolume;

            if (nextVolume <= 0) {
                clearInterval(this.walkingFadeInterval);
                this.walkingFadeInterval = null;
                this.walking_sound.pause();
                this.walkingAudioActive = false;
                this.walking_sound.volume = this.walkingVolume;
            }
        }, 30);
    }

    startWalkingSound() {
        if (this.walkingFadeInterval) {
            clearInterval(this.walkingFadeInterval);
            this.walkingFadeInterval = null;
            this.walking_sound.volume = this.walkingVolume;
        }

        if (this.walkingAudioActive) {
            return;
        }

        this.walking_sound.volume = this.walkingVolume;
        this.walkingAudioActive = true;
        this.walking_sound.play().catch(() => {
            this.walkingAudioActive = false;
        });
    }

    animate() {
        setInterval(() => {
            if (!this.world || !this.world.keyboard) {
                return;
            }

            if (this.isDead()) {
                this.stopWalkingSound();
                return;
            }

            const maxX = typeof this.world.getCharacterMaxX === "function"
                ? this.world.getCharacterMaxX()
                : this.world.level.level_end_x;

            const isMovingRight = this.world.keyboard.right && this.x < maxX;
            const isMovingLeft = this.world.keyboard.left && this.x > 0;
            const isMoving = isMovingRight || isMovingLeft;

            if (isMoving) {
                this.startWalkingSound();
            } else {
                this.stopWalkingSound();
            }

            if (isMovingRight) {
                this.moveRight();
                this.otherDirection = false;
            } else if (isMovingLeft) {
                this.moveLeft();
                this.otherDirection = true;
            }

            this.x = Math.max(0, Math.min(this.x, maxX));

            if (this.world.keyboard.space && !this.isAboveGround()) {
                this.jump_sound.currentTime = 0;
                this.jump_sound.play().catch(() => { });
                this.jump();
            }

            if (typeof this.world.updateCameraX === "function") {
                this.world.updateCameraX();
            } else {
                this.world.camera_x = -this.x + 100;
            }
        }, 1000 / 60); // 60 FPS

        setInterval(() => {
            if (this.isDead()) {
                if (!this.deathAnimationStarted) {
                    this.currentImageIndex = 0;
                    this.deathAnimationStarted = true;
                }

                this.stopWalkingSound();
                this.playAnimation(this.IMAGES_DEAD);
            } else if (this.isHurt()) {
                this.deathAnimationStarted = false;
                this.playAnimation(this.IMAGES_HURT);
            } else if (this.isAboveGround()) {
                this.deathAnimationStarted = false;
                this.playAnimation(this.IMAGES_JUMPING);
            } else {
                this.deathAnimationStarted = false;
                if (!this.world || !this.world.keyboard) {
                    return;
                }

                if (this.world.keyboard.right || this.world.keyboard.left) {
                    this.playAnimation(this.IMAGES_WALKING);
                } else {
                    this.playAnimation(this.IMAGES_IDLE);
                }
            }
        }, 50);
    }

    constructor() {
        super().loadImage("img/2_character_pepe/1_idle/idle/I-1.png");
        this.loadImages(this.IMAGES_WALKING);
        this.loadImages(this.IMAGES_JUMPING);
        this.loadImages(this.IMAGES_IDLE);
        this.loadImages(this.IMAGES_DEAD);
        this.loadImages(this.IMAGES_HURT);
        this.walking_sound.preload = "auto";
        this.jump_sound.preload = "auto";
        this.walking_sound.loop = true;
        this.applyGravity();
        this.animate();
    }

}

moveRight = () => {
    this.x += this.speed;
};
