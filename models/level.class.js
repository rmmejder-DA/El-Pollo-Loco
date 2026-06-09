    class Level {
    enemies;
    clouds;
    backgroundObjects;
    coins;
    bottles;
    level_end_x = 720 * 5;

    /**
     * Creates a level definition.
     * @param {MovableObject[]} enemies - The level enemies.
     * @param {Cloud[]} clouds - The level clouds.
     * @param {BackgroundObject[]} backgroundObjects - The background layers.
     * @param {Coin[]} [coins=[]] - The collectible coins.
     * @param {BottlePickup[]} [bottles=[]] - The collectible bottles.
     */
    constructor(enemies, clouds, backgroundObjects, coins = [], bottles = []) {
        this.enemies = enemies;
        this.clouds = clouds;
        this.backgroundObjects = backgroundObjects;
        this.coins = coins;
        this.bottles = bottles;
        this.level_end_x = this.getBackgroundEndX();
    }

    /**
     * Returns the far right background edge.
     * @returns {number} The far right background x position.
     */
    getBackgroundEndX() {
        if (!Array.isArray(this.backgroundObjects) || this.backgroundObjects.length === 0) {
            return this.level_end_x;
        }

        return Math.max(...this.backgroundObjects.map((object) => object.x + object.width));
    }
}