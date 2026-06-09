class WorldStatusFactory {
    /**
     * Creates the coin status bar.
     * @returns {StatusBar} The coin status bar.
     */
    static createCoinStatusBar() {
        const bar = new StatusBar(this.getCoinBarImages(), 20, 70);
        bar.setPercentage(0);
        return bar;
    }

    /**
     * Creates the bottle status bar.
     * @returns {StatusBar} The bottle status bar.
     */
    static createBottleStatusBar() {
        const bar = new StatusBar(this.getBottleBarImages(), 20, 120);
        bar.setPercentage(0);
        return bar;
    }

    /**
     * Creates the endboss status bar.
     * @param {HTMLCanvasElement} canvas - The game canvas.
     * @returns {StatusBar} The endboss status bar.
     */
    static createEndbossStatusBar(canvas) {
        return new StatusBar(this.getEndbossBarImages(), canvas.width - 220, 20);
    }

    /**
     * Returns coin bar image paths.
     * @returns {string[]} The coin bar image paths.
     */
    static getCoinBarImages() {
        return [
            "img/7_statusbars/1_statusbar/1_statusbar_coin/green/0.png",
            "img/7_statusbars/1_statusbar/1_statusbar_coin/green/20.png",
            "img/7_statusbars/1_statusbar/1_statusbar_coin/green/40.png",
            "img/7_statusbars/1_statusbar/1_statusbar_coin/green/60.png",
            "img/7_statusbars/1_statusbar/1_statusbar_coin/green/80.png",
            "img/7_statusbars/1_statusbar/1_statusbar_coin/green/100.png"
        ];
    }

    /**
     * Returns bottle bar image paths.
     * @returns {string[]} The bottle bar image paths.
     */
    static getBottleBarImages() {
        return [
            "img/7_statusbars/1_statusbar/3_statusbar_bottle/green/0.png",
            "img/7_statusbars/1_statusbar/3_statusbar_bottle/green/20.png",
            "img/7_statusbars/1_statusbar/3_statusbar_bottle/green/40.png",
            "img/7_statusbars/1_statusbar/3_statusbar_bottle/green/60.png",
            "img/7_statusbars/1_statusbar/3_statusbar_bottle/green/80.png",
            "img/7_statusbars/1_statusbar/3_statusbar_bottle/green/100.png"
        ];
    }

    /**
     * Returns endboss bar image paths.
     * @returns {string[]} The endboss bar image paths.
     */
    static getEndbossBarImages() {
        return [
            "img/7_statusbars/2_statusbar_endboss/green/green0.png",
            "img/7_statusbars/2_statusbar_endboss/green/green20.png",
            "img/7_statusbars/2_statusbar_endboss/green/green40.png",
            "img/7_statusbars/2_statusbar_endboss/green/green60.png",
            "img/7_statusbars/2_statusbar_endboss/green/green80.png",
            "img/7_statusbars/2_statusbar_endboss/green/green100.png"
        ];
    }
}
