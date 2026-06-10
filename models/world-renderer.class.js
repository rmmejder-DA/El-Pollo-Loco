class WorldRenderer {
    /**
     * Stores the world reference for rendering.
     * @param {World} world - The world to render.
     */
    constructor(world) {
        this.world = world;
    }

    /** Draws one animation frame. */
    draw() {
        const world = this.world;
        world.ctx.clearRect(0, 0, world.ctx.canvas.width, world.canvas.height);
        if (!world.level) {
            return this.queueNextFrame();
        }
        this.drawWorldObjects();
        this.drawScreenObjects();
        this.queueNextFrame();
    }

    /** Draws camera-bound world objects. */
    drawWorldObjects() {
        const world = this.world;
        const cameraX = Math.round(world.camera_x);
        world.ctx.translate(cameraX, 0);
        this.drawWorldObjectLayers();
        world.ctx.translate(-cameraX, 0);
    }

    /** Draws all gameplay object layers. */
    drawWorldObjectLayers() {
        const world = this.world;
        this.addObjectsToMap(world.level.backgroundObjects || []);
        this.addObjectsToMap(world.level.clouds || []);
        this.addToMap(world.character);
        this.addObjectsToMap(world.level.coins || []);
        this.addObjectsToMap(world.level.bottles || []);
        this.addObjectsToMap(world.level.enemies || []);
        this.addObjectsToMap(world.throwableObjects);
    }

    /** Draws fixed screen overlays and controls. */
    drawScreenObjects() {
        this.drawStatusBars();
        this.drawHealthHint();
        this.drawBossFightText();
        this.world.canvasControls.drawMobileCanvasControls();
        this.world.canvasControls.drawCanvasHudControls();
    }

    /** Draws the heart hint when Pepe gained extra health. */
    drawHealthHint() {
        const world = this.world;
        const timeLeft = world.healthHintUntil - Date.now();
        if (timeLeft <= 0 || !this.canDrawObject({ img: world.heartHintImage })) {
            return;
        }
        const ctx = world.ctx;
        ctx.save();
        ctx.globalAlpha = Math.min(1, timeLeft / 600);
        const offsetY = 20 - (1500 - timeLeft) / 60;
        ctx.drawImage(world.heartHintImage, 215, 18 + offsetY, 40, 40);
        ctx.restore();
    }

    /** Draws the status bars. */
    drawStatusBars() {
        const world = this.world;
        [world.statusBar, world.coinStatusBar, world.bottleStatusBar].forEach((bar) => this.addToMap(bar));
        if (world.showEndbossStatusBar) {
            this.addToMap(world.endbossStatusBar);
        }
    }

    /** Queues the next animation frame. */
    queueNextFrame() {
        requestAnimationFrame(() => this.draw());
    }

    /**
     * Draws a list of objects.
     * @param {DrawableObject[]} objects - The objects to draw.
     */
    addObjectsToMap(objects) {
        if (Array.isArray(objects)) {
            objects.forEach((object) => this.addToMap(object));
        }
    }

    /**
     * Draws one object when its image is ready.
     * @param {DrawableObject} mo - The object to draw.
     */
    addToMap(mo) {
        if (!this.canDrawObject(mo)) {
            return;
        }
        if (mo.otherDirection) {
            this.drawFlippedObject(mo);
        } else {
            mo.draw(this.world.ctx);
        }
    }

    /**
     * Checks whether an object can be drawn.
     * @param {DrawableObject} mo - The object to test.
     * @returns {boolean} True when the object image is ready.
     */
    canDrawObject(mo) {
        return Boolean(mo?.img?.complete && mo.img.naturalWidth !== 0);
    }

    /**
     * Draws one object mirrored horizontally.
     * @param {DrawableObject} mo - The object to draw flipped.
     */
    drawFlippedObject(mo) {
        const ctx = this.world.ctx;
        ctx.save();
        ctx.translate(mo.x + mo.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(mo.img, 0, mo.y, mo.width, mo.height);
        ctx.restore();
    }

    /** Draws the boss fight text overlay. */
    drawBossFightText() {
        const timeLeft = this.world.bossFightTextUntil - Date.now();
        if (timeLeft <= 0) {
            return;
        }
        this.drawBossFightTextWithOpacity(Math.min(1, timeLeft / 500));
    }

    /**
     * Draws the boss fight text with opacity.
     * @param {number} opacity - The text opacity from 0 to 1.
     */
    drawBossFightTextWithOpacity(opacity) {
        const world = this.world;
        world.ctx.save();
        this.applyBossTextStyle(opacity);
        world.ctx.strokeText("BOSS Fight!", world.canvas.width / 2, 115);
        world.ctx.fillText("BOSS Fight!", world.canvas.width / 2, 115);
        world.ctx.restore();
    }

    /**
     * Applies boss fight text styles.
     * @param {number} opacity - The text opacity from 0 to 1.
     */
    applyBossTextStyle(opacity) {
        const ctx = this.world.ctx;
        ctx.globalAlpha = opacity;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = "70px 'Midnight Crimson', Arial";
        ctx.lineWidth = 8;
        ctx.strokeStyle = "#3b1600";
        ctx.fillStyle = "#ffcc00";
    }

}
