class WorldRenderer {
    /** Stores the world reference for rendering. */
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
        world.ctx.translate(world.camera_x, 0);
        this.drawWorldObjectLayers();
        world.ctx.translate(-world.camera_x, 0);
    }

    /** Draws all gameplay object layers. */
    drawWorldObjectLayers() {
        const world = this.world;
        this.addObjectsToMap(world.level.backgroundObjects || []);
        this.addObjectsToMap(world.level.clouds || []);
        this.addToMap(world.character);
        this.drawCarriedBottle();
        this.addObjectsToMap(world.level.coins || []);
        this.addObjectsToMap(world.level.bottles || []);
        this.addObjectsToMap(world.level.enemies || []);
        this.addObjectsToMap(world.throwableObjects);
    }

    /** Draws fixed screen overlays and controls. */
    drawScreenObjects() {
        this.drawStatusBars();
        this.drawBossFightText();
        this.drawWinImage();
        this.world.canvasControls.drawMobileCanvasControls();
        this.world.canvasControls.drawCanvasHudControls();
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

    /** Draws a list of objects. */
    addObjectsToMap(objects) {
        if (Array.isArray(objects)) {
            objects.forEach((object) => this.addToMap(object));
        }
    }

    /** Draws one object when its image is ready. */
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

    /** Checks whether an object can be drawn. */
    canDrawObject(mo) {
        return Boolean(mo?.img?.complete && mo.img.naturalWidth !== 0);
    }

    /** Draws one object mirrored horizontally. */
    drawFlippedObject(mo) {
        const ctx = this.world.ctx;
        ctx.save();
        ctx.translate(mo.x + mo.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(mo.img, 0, mo.y, mo.width, mo.height);
        ctx.restore();
    }

    /** Draws the bottle Pepe is carrying. */
    drawCarriedBottle() {
        const world = this.world;
        if (!this.shouldDrawCarriedBottle()) {
            return;
        }
        world.ctx.drawImage(world.carriedBottleImage, this.getCarriedBottleX(), world.character.y + 162, 42, 40);
    }

    /** Checks whether the carried bottle should be drawn. */
    shouldDrawCarriedBottle() {
        const world = this.world;
        return Boolean(world.character && world.bottleCount >= 1 && world.carriedBottleImage.complete);
    }

    /** Calculates the carried bottle x position. */
    getCarriedBottleX() {
        const character = this.world.character;
        return character.otherDirection ? character.x + character.width - 66 : character.x + 16;
    }

    /** Draws the boss fight text overlay. */
    drawBossFightText() {
        const timeLeft = this.world.bossFightTextUntil - Date.now();
        if (timeLeft <= 0) {
            return;
        }
        this.drawBossFightTextWithOpacity(Math.min(1, timeLeft / 500));
    }

    /** Draws the boss fight text with opacity. */
    drawBossFightTextWithOpacity(opacity) {
        const world = this.world;
        world.ctx.save();
        this.applyBossTextStyle(opacity);
        world.ctx.strokeText("BOSS Fight!", world.canvas.width / 2, 115);
        world.ctx.fillText("BOSS Fight!", world.canvas.width / 2, 115);
        world.ctx.restore();
    }

    /** Applies boss fight text styles. */
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

    /** Draws the win image overlay. */
    drawWinImage() {
        const world = this.world;
        if (!this.shouldDrawWinImage()) {
            return;
        }
        world.ctx.save();
        world.ctx.fillStyle = "rgba(0, 0, 0, 0.62)";
        world.ctx.fillRect(0, 0, world.canvas.width, world.canvas.height);
        world.ctx.drawImage(world.winImage, 192, 80, 336, 240);
        world.ctx.restore();
    }

    /** Checks whether the win image should be visible. */
    shouldDrawWinImage() {
        const world = this.world;
        return world.winTriggered && Date.now() >= world.winScreenVisibleAt &&
            world.winImage.complete && world.winImage.naturalWidth !== 0;
    }
}
