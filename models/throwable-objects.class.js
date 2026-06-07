class ThrowableObject extends MovableObject {
    throwSpeedX = 12;
    moveInterval = null;
    animationInterval = null;
    hasSplashed = false;
    SPLASH_IMAGE = "img/6_salsa_bottle/bottle_rotation/bottle_splash/4_bottle_splash.png";
    IMAGES_ROTATION = [
        "img/6_salsa_bottle/bottle_rotation/1_bottle_rotation.png",
        "img/6_salsa_bottle/bottle_rotation/2_bottle_rotation.png",
        "img/6_salsa_bottle/bottle_rotation/3_bottle_rotation.png",
        "img/6_salsa_bottle/bottle_rotation/4_bottle_rotation.png"
    ];

    constructor(x, y, direction = 1) {
        super().loadImage(this.IMAGES_ROTATION[0]);
        this.loadImages(this.IMAGES_ROTATION);
        this.loadImages([this.SPLASH_IMAGE]);
        this.x = x;
        this.y = y;
        this.throwSpeedX = Math.abs(this.throwSpeedX) * direction;
        this.height = 50;
        this.width = 50;
        this.trow();
        this.animate();
    }

    trow() {
        this.speedY = 12;
        this.applyGravity();
        this.moveInterval = setInterval(() => {
            if (this.hasSplashed) {
                return;
            }

            this.x += this.throwSpeedX;
        }, 1000 / 60);
    }

    animate() {
        this.animationInterval = setInterval(() => {
            if (this.hasSplashed) {
                return;
            }

            this.playAnimation(this.IMAGES_ROTATION);
        }, 80);
    }

    splash() {
        if (this.hasSplashed) {
            return;
        }

        this.hasSplashed = true;
        this.speedY = 0;
        this.throwSpeedX = 0;
        clearInterval(this.moveInterval);
        clearInterval(this.animationInterval);
        this.img = this.imageCache[this.SPLASH_IMAGE];
    }
}