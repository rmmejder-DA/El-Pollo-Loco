let level1;

/** Initializes the first level. */
function initLevel1() {
    const backgroundObjects = BackgroundObject.createLevelBackground();
    const levelEndX = getLevelEndX(backgroundObjects);
    level1 = new Level(
        createChickens(),
        [...createClouds(levelEndX), new Endboss()],
        backgroundObjects,
        createCoins(),
        createBottles()
    );
}

/** Creates chicken enemies. */
function createChickens() {
    return Array.from({ length: 10 }, (_, index) => {
        return new Chicken(450 + index * 320 + Math.random() * 180);
    });
}

/** Creates collectible coins. */
function createCoins() {
    return Array.from({ length: 12 }, (_, index) => {
        const x = 300 + index * 230 + Math.random() * 120;
        const y = 180 + Math.random() * 110;
        return new Coin(x, y);
    });
}

/** Creates bottle pickups. */
function createBottles() {
    return Array.from({ length: 10 }, (_, index) => {
        const x = 260 + index * 290 + Math.random() * 100;
        const y = 350 + Math.random() * 35;
        return new BottlePickup(x, y);
    });
}

/**
 * Calculates the level end position.
 * @param {BackgroundObject[]} backgroundObjects - The background layers.
 * @returns {number} The far right level edge.
 */
function getLevelEndX(backgroundObjects) {
    return Math.max(...backgroundObjects.map((object) => object.x + object.width));
}

/**
 * Creates moving clouds for the level.
 * @param {number} levelEndX - The level end x for cloud wrapping.
 * @returns {Cloud[]} The created clouds.
 */
function createClouds(levelEndX) {
    return Array.from({ length: 8 }, (_, index) => {
        const x = -500 + index * 560 + Math.random() * 160;
        return new Cloud(x, levelEndX);
    });
}
