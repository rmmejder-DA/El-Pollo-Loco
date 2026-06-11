class StatusBar extends DrawableObject {
    x = 20;
    y = 20;
    height = 50;
    width = 200;
    
    defaultImages = [
        "img/7_statusbars/1_statusbar/2_statusbar_health/green/0.png",
        "img/7_statusbars/1_statusbar/2_statusbar_health/green/20.png",
        "img/7_statusbars/1_statusbar/2_statusbar_health/green/40.png",
        "img/7_statusbars/1_statusbar/2_statusbar_health/green/60.png",
        "img/7_statusbars/1_statusbar/2_statusbar_health/green/80.png",
        "img/7_statusbars/1_statusbar/2_statusbar_health/green/100.png"
    ];
    IMAGES = [];

    percentage = 100;
    /*** Creates a status bar.
     * @param {string[]|null} [images=null] - The bar image paths.
     * @param {number} [x=20] - The x position.
     * @param {number} [y=20] - The y position.*/
    constructor(images = null, x = 20, y = 20) {
        super();
        this.x = x;
        this.y = y;
        this.IMAGES = images || this.defaultImages;

        this.loadImage(this.IMAGES[0]);
        this.loadImages(this.IMAGES);
        this.setPercentage(100);
    }

    /*** Updates the displayed percentage.
     * @param {number} percentage - The percentage value to show.*/
    setPercentage(percentage) {
        this.percentage = percentage;
        let path = this.IMAGES[this.resolveImageIndex()];
        this.img = this.imageCache[path];
    }

    /*** Resolves the image index for the current percentage.
     * @returns {number} The image index for the current percentage.*/
    resolveImageIndex() {
        if (this.percentage == 100) return 5;
        if (this.percentage >= 80) return 4;
        if (this.percentage >= 60) return 3;
        if (this.percentage >= 40) return 2;
        if (this.percentage > 0) return 1;
        return 0;
    }
}