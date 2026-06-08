let level1;

/** Initializes the first level. */
function initLevel1() {
    const backgroundObjects = createBackgroundObjects();
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
    return Array.from({ length: 18 }, (_, index) => {
        const x = 300 + index * 180 + Math.random() * 100;
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

/** Creates all background layer objects. */
function createBackgroundObjects() {
    return [
        ...createBackgroundSegment(-720, 2),
        ...createBackgroundSegment(0, 1),
        ...createBackgroundSegment(720, 2),
        ...createBackgroundSegment(720 * 2, 1),
        ...createBackgroundSegment(720 * 3, 2)
    ];
}

/** Creates one background segment. */
function createBackgroundSegment(x, variant) {
    return [
        new BackgroundObject("img/5_background/layers/4_clouds/1.png", x),
        new BackgroundObject("img/5_background/layers/air.png", x),
        new BackgroundObject(`img/5_background/layers/3_third_layer/${variant}.png`, x),
        new BackgroundObject(`img/5_background/layers/2_second_layer/${variant}.png`, x),
        new BackgroundObject(`img/5_background/layers/1_first_layer/${variant}.png`, x)
    ];
}

/** Calculates the level end position. */
function getLevelEndX(backgroundObjects) {
    return Math.max(...backgroundObjects.map((object) => object.x + object.width));
}

/** Creates moving clouds for the level. */
function createClouds(levelEndX) {
    return Array.from({ length: 8 }, (_, index) => {
        const x = -500 + index * 560 + Math.random() * 160;
        return new Cloud(x, levelEndX);
    });
}
