let level1;
const BOSS_START_X = 2000;
const COLLECTIBLE_MAX_X = BOSS_START_X - 260;

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
        const x = getCollectibleX(300, COLLECTIBLE_MAX_X, 12, index, 90);
        const y = 180 + Math.random() * 110;
        return new Coin(x, y);
    });
}

/** Creates bottle pickups. */
function createBottles() {
    return Array.from({ length: 10 }, (_, index) => {
        const x = getCollectibleX(260, COLLECTIBLE_MAX_X, 10, index, 75);
        const y = 350 + Math.random() * 35;
        return new BottlePickup(x, y);
    });
}

/*** Calculates one collectible x position before the boss area.
 * @param {number} minX - The minimum collectible x position.
 * @param {number} maxX - The maximum collectible x position.
 * @param {number} count - Total collectible count.
 * @param {number} index - Current collectible index.
 * @param {number} jitter - Random horizontal variation.
 * @returns {number} The collectible x position.*/
function getCollectibleX(minX, maxX, count, index, jitter) {
    const availableWidth = Math.max(0, maxX - minX);
    const spacing = count > 1 ? availableWidth / (count - 1) : 0;
    const baseX = minX + index * spacing;
    const randomOffset = Math.random() * jitter;
    return Math.min(maxX, Math.round(baseX + randomOffset));
}

/*** Calculates the level end position.
 * @param {BackgroundObject[]} backgroundObjects - The background layers.
 * @returns {number} The far right level edge.*/
function getLevelEndX(backgroundObjects) {
    if (!Array.isArray(backgroundObjects) || backgroundObjects.length === 0) {
        return 719 * 5;
    }

    const lastBackground = backgroundObjects[backgroundObjects.length - 1];
    return lastBackground.x + lastBackground.width;
}

/*** Creates moving clouds for the level.
 * @param {number} levelEndX - The level end x for cloud wrapping.
 * @returns {Cloud[]} The created clouds.*/
function createClouds(levelEndX) {
    return Array.from({ length: 8 }, (_, index) => {
        const x = -500 + index * 560 + Math.random() * 160;
        return new Cloud(x, levelEndX);
    });
}
