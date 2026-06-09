class DrawableObject {
    x = 120;
    y = 280;
    height = 100;
    width = 100;
    img;
    imageCache = {};
    offset = {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
    };

    /**
     * Loads a single image into the object.
     * @param {string} path - The image source path.
     */
    loadImage = (path) => {
        this.img = new Image();
        this.img.src = path;
    }

    /**
     * Draws the object image.
     * @param {CanvasRenderingContext2D} ctx - The drawing context.
     */
    draw(ctx) {
        ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
    }

    /**
     * Returns the collision box with offsets applied.
     * @returns {{x: number, y: number, width: number, height: number}} The collision box.
     */
    getCollisionBox() {
        return {
            x: this.x + this.offset.left,
            y: this.y + this.offset.top,
            width: this.width - this.offset.left - this.offset.right,
            height: this.height - this.offset.top - this.offset.bottom
        };
    }

    /**
     * Loads and caches multiple images.
     * @param {string[]} arr - Image source paths to cache.
     */
    loadImages = (arr) => {
        arr.forEach(path => {
            let img = new Image();
            img.src = path;
            this.imageCache[path] = img;
        });
    };
}