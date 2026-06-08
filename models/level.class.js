    class Level {
    enemies;
    clouds;
    backgroundObjects;
    coins;
    bottles;
    level_end_x = 720 * 5; // Beispielwert, je nachdem wie lang dein Level sein soll
    
    /** Creates a level definition. */
    constructor(enemies, clouds, backgroundObjects, coins = [], bottles = []) {
        this.enemies = enemies;
        this.clouds = clouds;
        this.backgroundObjects = backgroundObjects;
        this.coins = coins;
        this.bottles = bottles;
        this.level_end_x = this.getBackgroundEndX();
    }

    /** Returns the far right background edge. */
    getBackgroundEndX() {
        if (!Array.isArray(this.backgroundObjects) || this.backgroundObjects.length === 0) {
            return this.level_end_x;
        }

        return Math.max(...this.backgroundObjects.map((object) => object.x + object.width));
    }
}