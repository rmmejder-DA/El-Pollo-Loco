let level1;
function initLevel1() {
    const chickenCount = 10;
    const chickens = Array.from({ length: chickenCount }, (_, index) => {
        const spawnX = 450 + index * 320 + Math.random() * 180;
        return new Chicken(spawnX);
    });

    const coinCount = 18;
    const coins = Array.from({ length: coinCount }, (_, index) => {
        const x = 300 + index * 180 + Math.random() * 100;
        const y = 180 + Math.random() * 110;
        return new Coin(x, y);
    });

    const bottleCount = 10;
    const bottles = Array.from({ length: bottleCount }, (_, index) => {
        const x = 260 + index * 290 + Math.random() * 100;
        const y = 350 + Math.random() * 35;
        return new BottlePickup(x, y);
    });

    const buildSegment = (x, variant) => ([
        new BackgroundObject("img/5_background/layers/4_clouds/1.png", x),
        new BackgroundObject("img/5_background/layers/air.png", x),
        new BackgroundObject(`img/5_background/layers/3_third_layer/${variant}.png`, x),
        new BackgroundObject(`img/5_background/layers/2_second_layer/${variant}.png`, x),
        new BackgroundObject(`img/5_background/layers/1_first_layer/${variant}.png`, x)
    ]);

    const backgroundObjects = [
        ...buildSegment(-720, 2),
        ...buildSegment(0, 1),
        ...buildSegment(720, 2),
        ...buildSegment(720 * 2, 1),
        ...buildSegment(720 * 3, 2)
    ];

    const levelEndX = Math.max(...backgroundObjects.map((object) => object.x + object.width));
    const clouds = Array.from({ length: 8 }, (_, index) => {
        const x = -500 + index * 560 + Math.random() * 160;
        return new Cloud(x, levelEndX);
    });

    level1 = new Level(
        chickens,
        [...clouds, new Endboss()],
        backgroundObjects,
        coins,
        bottles);
}