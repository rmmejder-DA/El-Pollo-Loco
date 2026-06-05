class MovableObject extends DrawableObject {

    currentImageIndex = 0;
    speed = 0.15;
    otherDirection = false;
    speedY = 0;
    acceleration = 2.5;
    energy = 100;
    lastHit = 0;

    applyGravity() {
        setInterval(() => {
            if (this.isAboveGround() || this.speedY > 0) {
                this.y -= this.speedY;
                this.speedY -= this.acceleration;

                if (typeof this.groundY === "number" && this.y > this.groundY) {
                    this.y = this.groundY;
                    this.speedY = 0;
                }
            }
        }, 1000 / 25);
    }
    isAboveGround() {
        if (this instanceof ThrowableObject) {
            return true;
        } else {
            const groundLevel = typeof this.groundY === "number" ? this.groundY : 180;
            return this.y < groundLevel;
        }
    }


    drawFrame(ctx) {
        if (this instanceof Character || this instanceof Chicken) {
            ctx.beginPath();
            ctx.lineWidth = "5";
            ctx.strokeStyle = "blue";
            ctx.rect(this.x, this.y, this.width, this.height);
            ctx.stroke();
        }
    }
    // Kollisionserkennung
    isColliding(mo) {
        return (
            this.x + this.width > mo.x &&
            this.x < mo.x + mo.width &&
            this.y + this.height > mo.y &&
            this.y < mo.y + mo.height
        );
    }

    hit() {
        if (this.isDead() || this.isHurt()) {
            return;
        }

        this.energy -= 5;
        if (this.energy < 0) {
            this.energy = 0;
        }

        this.lastHit = new Date().getTime();
    }

    isDead() {
        return this.energy == 0;
    }

    isHurt() {
        let timePassed = new Date().getTime() - this.lastHit;// Zeit seit letztem Treffer
        timePassed = timePassed / 1000;// in Sekunden
        return timePassed < 1;// Ist die Figur in den letzten 1 Sekunden getroffen worden?
    }
    playAnimation = (images) => {
        let i = this.currentImageIndex % images.length;//% sorgt dafür, dass der Index immer im Bereich der Array-Länge bleibt
        // i = 0, 1, 2, 3, 4, 5, 0, 1, ...
        let path = images[i];
        this.img = this.imageCache[path];
        this.currentImageIndex++;
    }
    moveLeft = () => {
        this.x -= this.speed;
    };

    moveRight = () => {
        this.x += this.speed;
    };

    jump() {
        this.speedY = 30;
    }
}