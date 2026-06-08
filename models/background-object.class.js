class BackgroundObject extends MovableObject {
    width = 720;
    height = 480;
    
    /** Creates a background layer object. */
    constructor(imagePath, x, y) {
        super().loadImage(imagePath);
        this.x = x;
        this.y = 480 - this.height; // Positioniere das Objekt am unteren Rand des Canvas

        this.loadImage(imagePath);
    }
}