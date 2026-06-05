class DrawableObject {
    x = 120;
    y = 280;
    height = 100;
    width = 100;
    img;
    imageCache = {};

    loadImage = (path) => {
        this.img = new Image();
        this.img.src = path;//
    }
// über try und catch könnte man den Fehler abfangen, wenn das Bild nicht geladen werden kann
    draw(ctx) {
        ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
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