class Chicken extends MovableObject {
    height = 60;
    y = 370;
    groundY = 370;
    isDead = false;

    IMAGES_WALKING = [
        "img/3_enemies_chicken/chicken_normal/1_walk/1_w.png",
        "img/3_enemies_chicken/chicken_normal/1_walk/2_w.png",
        "img/3_enemies_chicken/chicken_normal/1_walk/3_w.png"
    ];

    IMAGES_DEAD = [
        "img/3_enemies_chicken/chicken_normal/2_dead/dead.png"
    ];


    constructor(startX) {
        super().loadImage("img/3_enemies_chicken/chicken_normal/1_walk/1_w.png");
        this.loadImages(this.IMAGES_WALKING);
        this.loadImages(this.IMAGES_DEAD);

        this.x = typeof startX === "number" ? startX : 200 + Math.random() * 500;
        this.speed = 0.15 + Math.random() * 0.1; // Zufällige Geschwindigkeit zwischen 0.15 und 0.25
        this.applyGravity();
        this.animate();
    }
    animate() {
        setInterval(() => {
            if (this.isDead) {
                return;
            }

            this.moveLeft();
        }, 1000 / 60);
        
        setInterval(() => {
            if (this.isDead) {
                return;
            }

            this.playAnimation(this.IMAGES_WALKING);
        }, 100);

        setInterval(() => {
            if (this.isDead || this.isAboveGround()) {
                return;
            }

            // Zufällige KI-Sprünge für mehr Bewegung im Level.
            if (Math.random() < 0.12) {
                this.speedY = 14 + Math.random() * 10;
            }
        }, 300);
    }

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