class ThrowableObject extends MovableObject {
    throwSpeedX = 12;
    IMAGES_ROTATION = [
        "img/6_salsa_bottle/bottle_rotation/1_bottle_rotation.png",
        "img/6_salsa_bottle/bottle_rotation/2_bottle_rotation.png",
        "img/6_salsa_bottle/bottle_rotation/3_bottle_rotation.png",
        "img/6_salsa_bottle/bottle_rotation/4_bottle_rotation.png"
    ];

    constructor(x, y, direction = 1) {
        super().loadImage(this.IMAGES_ROTATION[0]);
        this.loadImages(this.IMAGES_ROTATION);
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
        setInterval(() => {
            this.x += this.throwSpeedX;
        }, 1000 / 60);
    }

    animate() {
        setInterval(() => {
            this.playAnimation(this.IMAGES_ROTATION);
        }, 80);
    }
}