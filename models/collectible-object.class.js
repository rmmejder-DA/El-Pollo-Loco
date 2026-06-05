class CollectibleObject extends DrawableObject {
    constructor(imagePath, x, y, width = 60, height = 60) {
        super();
        this.loadImage(imagePath);
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
}

class Coin extends CollectibleObject {
    constructor(x, y) {
        const image = Math.random() < 0.5
            ? "img/8_coin/coin_1.png"
            : "img/8_coin/coin_2.png";
        super(image, x, y, 90, 90);
    }
}

class BottlePickup extends CollectibleObject {
    constructor(x, y) {
        const image = Math.random() < 0.5
            ? "img/6_salsa_bottle/1_salsa_bottle_on_ground.png"
            : "img/6_salsa_bottle/2_salsa_bottle_on_ground.png";
        super(image, x, y, 60, 70);
    }
}