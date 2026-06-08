class CollectibleObject extends DrawableObject {
    /** Creates a collectible object. */
    constructor(imagePath, x, y, width = 60, height = 60) {
        super();
        this.loadImage(imagePath);
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.offset = {
            top: 10,
            right: 10,
            bottom: 10,
            left: 10
        };
    }
}

class Coin extends CollectibleObject {
    rotationAngle = Math.random() * Math.PI * 2;
    rotationSpeed = 0.006;

    /** Creates a coin pickup. */
    constructor(x, y) {
        const image = Math.random() < 0.5
            ? "img/8_coin/coin_1.png"
            : "img/8_coin/coin_2.png";
        super(image, x, y, 90, 90);
    }

    /** Draws the rotating coin image. */
    draw(ctx) {
        if (typeof isGamePaused !== "function" || !isGamePaused()) {
            this.rotationAngle += this.rotationSpeed;
        }

        this.drawRotatedCoin(ctx);
    }

    /** Draws the coin with its current rotation angle. */
    drawRotatedCoin(ctx) {
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        const scaleX = Math.cos(this.rotationAngle);
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.scale(scaleX, 1);
        ctx.drawImage(this.img, -this.width / 2, -this.height / 2, this.width, this.height);
        ctx.restore();
    }
}

class BottlePickup extends CollectibleObject {
    /** Creates a bottle pickup. */
    constructor(x, y) {
        const image = Math.random() < 0.5
            ? "img/6_salsa_bottle/1_salsa_bottle_on_ground.png"
            : "img/6_salsa_bottle/2_salsa_bottle_on_ground.png";
        super(image, x, y, 60, 70);
    }
}