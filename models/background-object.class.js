class BackgroundObject extends MovableObject {
    width = 720;
    height = 480;
    seamOverlap = 1;

    static backgroundImages = [
        { path: "img/5_background/layers/4_clouds/1.png", x: -720 },
        { path: "img/5_background/layers/air.png", x: -720 },
        { path: "img/5_background/layers/3_third_layer/2.png", x: -720 },
        { path: "img/5_background/layers/2_second_layer/2.png", x: -720 },
        { path: "img/5_background/layers/1_first_layer/2.png", x: -720 },
        { path: "img/5_background/layers/4_clouds/1.png", x: 0 },
        { path: "img/5_background/layers/air.png", x: 0 },
        { path: "img/5_background/layers/3_third_layer/1.png", x: 0 },
        { path: "img/5_background/layers/2_second_layer/1.png", x: 0 },
        { path: "img/5_background/layers/1_first_layer/1.png", x: 0 },
        { path: "img/5_background/layers/4_clouds/1.png", x: 720 },
        { path: "img/5_background/layers/air.png", x: 720 },
        { path: "img/5_background/layers/3_third_layer/2.png", x: 720 },
        { path: "img/5_background/layers/2_second_layer/2.png", x: 720 },
        { path: "img/5_background/layers/1_first_layer/2.png", x: 720 },
        { path: "img/5_background/layers/4_clouds/1.png", x: 720 * 2 },
        { path: "img/5_background/layers/air.png", x: 720 * 2 },
        { path: "img/5_background/layers/3_third_layer/1.png", x: 720 * 2 },
        { path: "img/5_background/layers/2_second_layer/1.png", x: 720 * 2 },
        { path: "img/5_background/layers/1_first_layer/1.png", x: 720 * 2 },
        { path: "img/5_background/layers/4_clouds/1.png", x: 720 * 3 },
        { path: "img/5_background/layers/air.png", x: 720 * 3 },
        { path: "img/5_background/layers/3_third_layer/2.png", x: 720 * 3 },
        { path: "img/5_background/layers/2_second_layer/2.png", x: 720 * 3 },
        { path: "img/5_background/layers/1_first_layer/2.png", x: 720 * 3 }
    ];

    /*** Creates all visible background objects for the level.
     * @returns {BackgroundObject[]} The created background layers.*/
    static createLevelBackground() {
        return this.backgroundImages.map((backgroundImage) => {
            return new BackgroundObject(backgroundImage.path, backgroundImage.x);
        });
    }
    
    /*** Creates a background layer object.
     * @param {string} imagePath - The image source path.
     * @param {number} x - The x position.
     * @param {number} [y] - The y position; defaults to bottom-aligned.*/
    constructor(imagePath, x, y) {
        super();
        this.loadImage(imagePath);
        this.x = x;
        this.y = typeof y === "number" ? y : 480 - this.height;
    }

    /*** Draws one background tile with a tiny overlap to hide seam lines.
     * @param {CanvasRenderingContext2D} ctx - The drawing context.*/
    draw(ctx) {
        const drawX = Math.round(this.x) - this.seamOverlap;
        const drawY = Math.round(this.y);
        const drawWidth = Math.round(this.width) + this.seamOverlap * 2;
        const drawHeight = Math.round(this.height);
        ctx.drawImage(this.img, drawX, drawY, drawWidth, drawHeight);
    }
}