class MovableObject extends DrawableObject {
    currentImageIndex = 0;
    speed = 0.15;
    otherDirection = false;
    speedY = 0;
    acceleration = 2.5;
    energy = 100;
    lastHit = 0;

    /** Applies gravity to the object. */
    applyGravity() {
        setInterval(() => {
            if (typeof isGamePaused === "function" && isGamePaused()) {
                return;}
            this.updateGravityFrame();
        }, 1000 / 25);
    }

    /** Updates one gravity frame. */
    updateGravityFrame() {
        if (this.isAboveGround() || this.speedY > 0) {
            this.y -= this.speedY;
            this.speedY -= this.acceleration;
            this.snapToGroundWhenNeeded();
        }
    }

    /** Snaps the object back to the ground when needed. */
    snapToGroundWhenNeeded() {
        if (typeof this.groundY === "number" && this.y > this.groundY) {
            this.y = this.groundY;
            this.speedY = 0;
        }
    }
    /** Checks whether the object is above its ground. */
    isAboveGround() {
        if (this instanceof ThrowableObject) {
            return true;
        } else {
            const groundLevel = typeof this.groundY === "number" ? this.groundY : 180;
            return this.y < groundLevel;
        }
    }


    /** Draws the debug collision frame. */
    drawFrame(ctx) {
        if (this instanceof Charakter || this instanceof Chicken) {
            const box = this.getCollisionBox();
            ctx.beginPath();
            ctx.lineWidth = "5";
            ctx.strokeStyle = "blue";
            ctx.rect(box.x, box.y, box.width, box.height);
            ctx.stroke();
        }
    }

    /** Checks collision against another object. */
    isColliding(mo) {
        const ownBox = this.getCollisionBox();
        const otherBox = mo.getCollisionBox();

        return (
            ownBox.x + ownBox.width > otherBox.x &&
            ownBox.x < otherBox.x + otherBox.width &&
            ownBox.y + ownBox.height > otherBox.y &&
            ownBox.y < otherBox.y + otherBox.height
        );
    }

    /** Applies damage to the object. */
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

    /** Checks whether the object has no energy. */
    isDead() {
        return this.energy == 0;
    }

    /** Checks whether the object was hit recently. */
    isHurt() {
        let timePassed = new Date().getTime() - this.lastHit;// Zeit seit letztem Treffer
        timePassed = timePassed / 1000;// in Sekunden
        return timePassed < 1;// Ist die Figur in den letzten 1 Sekunden getroffen worden?
    }
    /** Plays the next image from an animation. */
    playAnimation = (images) => {
        let i = this.currentImageIndex % images.length;//% sorgt dafür, dass der Index immer im Bereich der Array-Länge bleibt
        // i = 0, 1, 2, 3, 4, 5, 0, 1, ...
        let path = images[i];
        this.img = this.imageCache[path];
        this.currentImageIndex++;
    }
    /** Moves the object left. */
    moveLeft = () => {
        this.x -= this.speed;
    };

    /** Moves the object right. */
    moveRight = () => {
        this.x += this.speed;
    };

    /** Starts an upward jump. */
    jump() {
        this.speedY = 30;
    }
}