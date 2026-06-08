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

    /** Loads a single image. */
    loadImage = (path) => {
        this.img = new Image();
        this.img.src = path;//
    }
// über try und catch könnte man den Fehler abfangen, wenn das Bild nicht geladen werden kann
    /** Draws the object image. */
    draw(ctx) {
        ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
    }

    /** Returns the collision box with offsets applied. */
    getCollisionBox() {
        return {
            x: this.x + this.offset.left,
            y: this.y + this.offset.top,
            width: this.width - this.offset.left - this.offset.right,
            height: this.height - this.offset.top - this.offset.bottom
        };
    }

    /**
 * 
 * @param {Array} arr - ["path1.png", "path2.png", ...]
 */
    loadImages = (arr) => {
        arr.forEach(path => {// Lädt jedes Bild und speichert es im Cache
            let img = new Image();
            img.src = path;
            this.imageCache[path] = img;
        });
    };
}