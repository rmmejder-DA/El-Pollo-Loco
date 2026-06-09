class WorldCanvasControls {
    mobileJumpImage = new Image();
    mobileThrowImage = new Image();

    /**
     * Creates canvas control rendering helpers.
     * @param {World} world - The world to render controls for.
     */
    constructor(world) {
        this.world = world;
        this.mobileJumpImage.src = "icon/jump.png";
        this.mobileThrowImage.src = "img/6_salsa_bottle/bottle_rotation/1_bottle_rotation.png";
    }

    /** Draws mobile controls inside the canvas. */
    drawMobileCanvasControls() {
        if (typeof shouldUseCanvasMobileControls !== "function" || !shouldUseCanvasMobileControls()) {
            return;
        }

        if (typeof getCanvasMobileControlButtons !== "function") {
            return;
        }

        getCanvasMobileControlButtons(this.world.canvas).forEach((button) => this.drawMobileCanvasButton(button));
    }

    /**
     * Draws one mobile canvas button.
     * @param {object} button - The button layout descriptor.
     */
    drawMobileCanvasButton(button) {
        const centerX = button.x + button.size / 2;
        const centerY = button.y + button.size / 2;

        this.drawRoundButton(centerX, centerY, button.size, 0.86);

        if (button.image) {
            this.drawMobileCanvasButtonImage(button);
        } else {
            this.drawMobileCanvasButtonLabel(button, centerX, centerY);
        }
    }

    /**
     * Draws a round canvas button background.
     * @param {number} centerX - The button center x position.
     * @param {number} centerY - The button center y position.
     * @param {number} size - The button size in pixels.
     * @param {number} [alpha=0.9] - The fill opacity.
     */
    drawRoundButton(centerX, centerY, size, alpha = 0.9) {
        const ctx = this.world.ctx;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = "rgba(0, 0, 0, 0.55)";
        ctx.strokeStyle = "rgba(255, 204, 0, 0.9)";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(centerX, centerY, size / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
    }

    /**
     * Draws the label of a mobile canvas button.
     * @param {object} button - The button layout descriptor.
     * @param {number} centerX - The button center x position.
     * @param {number} centerY - The button center y position.
     */
    drawMobileCanvasButtonLabel(button, centerX, centerY) {
        const ctx = this.world.ctx;
        ctx.save();
        ctx.fillStyle = "#ffcc00";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = "42px 'Midnight Crimson', Arial";
        ctx.fillText(button.label, centerX, centerY - 3);
        ctx.restore();
    }

    /**
     * Draws an icon inside a mobile canvas button.
     * @param {object} button - The button layout descriptor.
     */
    drawMobileCanvasButtonImage(button) {
        const image = button.image === "jump" ? this.mobileJumpImage : this.mobileThrowImage;
        if (!image.complete || image.naturalWidth === 0) {
            return;
        }

        this.drawPreparedButtonImage(button, image);
    }

    /**
     * Draws a prepared button image with rotation and filter.
     * @param {object} button - The button layout descriptor.
     * @param {HTMLImageElement} image - The icon image to draw.
     */
    drawPreparedButtonImage(button, image) {
        const icon = this.getButtonIconMetrics(button);
        const ctx = this.world.ctx;
        ctx.save();
        ctx.translate(icon.x + icon.size / 2, icon.y + icon.size / 2);
        ctx.rotate(button.image === "jump" ? -70 * Math.PI / 180 : 20 * Math.PI / 180);
        ctx.filter = button.image === "jump" ? "brightness(0) invert(1)" : "none";
        ctx.drawImage(image, -icon.size / 2, -icon.size / 2, icon.size, icon.size);
        ctx.restore();
    }

    /**
     * Calculates button icon metrics.
     * @param {object} button - The button layout descriptor.
     * @returns {{size: number, x: number, y: number}} The icon metrics.
     */
    getButtonIconMetrics(button) {
        const size = button.image === "jump" ? 32 : 42;
        return { size, x: button.x + (button.size - size) / 2, y: button.y + (button.size - size) / 2 };
    }

    /** Draws pause and mute HUD controls. */
    drawCanvasHudControls() {
        if (typeof shouldShowCanvasHudControls !== "function" || !shouldShowCanvasHudControls()) {
            return;
        }

        if (typeof getCanvasHudButtons !== "function") {
            return;
        }

        getCanvasHudButtons(this.world.canvas).forEach((button) => this.drawCanvasHudButton(button));
    }

    /**
     * Draws one HUD button.
     * @param {object} button - The button layout descriptor.
     */
    drawCanvasHudButton(button) {
        const centerX = button.x + button.size / 2;
        const centerY = button.y + button.size / 2;

        this.drawRoundButton(centerX, centerY, button.size);

        if (button.action === "pause") {
            this.drawPauseIcon(centerX, centerY, button.size);
        } else {
            this.drawMuteIcon(centerX, centerY, button.size);
        }
    }

    /**
     * Draws the pause or play icon.
     * @param {number} centerX - The icon center x position.
     * @param {number} centerY - The icon center y position.
     * @param {number} size - The icon size in pixels.
     */
    drawPauseIcon(centerX, centerY, size) {
        const ctx = this.world.ctx;
        ctx.save();
        ctx.fillStyle = "#ffcc00";

        if (typeof isGamePaused === "function" && isGamePaused()) {
            this.drawPlayTriangle(centerX, centerY, size);
        } else {
            this.drawPauseBars(centerX, centerY, size);
        }
        ctx.restore();
    }

    /**
     * Draws the play triangle icon.
     * @param {number} centerX - The icon center x position.
     * @param {number} centerY - The icon center y position.
     * @param {number} size - The icon size in pixels.
     */
    drawPlayTriangle(centerX, centerY, size) {
        const ctx = this.world.ctx;
        ctx.beginPath();
        ctx.moveTo(centerX - size * 0.13, centerY - size * 0.2);
        ctx.lineTo(centerX - size * 0.13, centerY + size * 0.2);
        ctx.lineTo(centerX + size * 0.2, centerY);
        ctx.closePath();
        ctx.fill();
    }

    /**
     * Draws pause bars.
     * @param {number} centerX - The icon center x position.
     * @param {number} centerY - The icon center y position.
     * @param {number} size - The icon size in pixels.
     */
    drawPauseBars(centerX, centerY, size) {
        const ctx = this.world.ctx;
        const barWidth = size * 0.11;
        const barHeight = size * 0.38;
        ctx.fillRect(centerX - size * 0.16, centerY - barHeight / 2, barWidth, barHeight);
        ctx.fillRect(centerX + size * 0.05, centerY - barHeight / 2, barWidth, barHeight);
    }

    /**
     * Draws the mute or volume icon.
     * @param {number} centerX - The icon center x position.
     * @param {number} centerY - The icon center y position.
     * @param {number} size - The icon size in pixels.
     */
    drawMuteIcon(centerX, centerY, size) {
        const iconCenterX = centerX - size * 0.08;
        const ctx = this.world.ctx;
        this.prepareMuteIconContext(ctx);
        this.drawSpeakerBody(iconCenterX, centerY, size);
        this.drawMuteState(iconCenterX, centerY, size);
        ctx.restore();
    }

    /**
     * Draws either muted or volume state.
     * @param {number} centerX - The icon center x position.
     * @param {number} centerY - The icon center y position.
     * @param {number} size - The icon size in pixels.
     */
    drawMuteState(centerX, centerY, size) {
        if (typeof isGameMuted === "function" && isGameMuted()) {
            this.drawMuteCross(centerX, centerY, size);
        } else {
            this.drawVolumeWave(centerX, centerY, size);
        }
    }

    /**
     * Draws the volume wave.
     * @param {number} centerX - The icon center x position.
     * @param {number} centerY - The icon center y position.
     * @param {number} size - The icon size in pixels.
     */
    drawVolumeWave(centerX, centerY, size) {
        const ctx = this.world.ctx;
        ctx.beginPath();
        ctx.arc(centerX + size * 0.13, centerY, size * 0.16, -0.7, 0.7);
        ctx.stroke();
    }

    /**
     * Prepares the drawing context for the mute icon.
     * @param {CanvasRenderingContext2D} ctx - The drawing context.
     */
    prepareMuteIconContext(ctx) {
        ctx.save();
        ctx.fillStyle = "#ffcc00";
        ctx.strokeStyle = "#ffcc00";
        ctx.lineWidth = 3;
        ctx.lineCap = "round";
    }

    /**
     * Draws the speaker body icon.
     * @param {number} centerX - The icon center x position.
     * @param {number} centerY - The icon center y position.
     * @param {number} size - The icon size in pixels.
     */
    drawSpeakerBody(centerX, centerY, size) {
        const ctx = this.world.ctx;
        ctx.beginPath();
        ctx.moveTo(centerX - size * 0.2, centerY - size * 0.08);
        ctx.lineTo(centerX - size * 0.06, centerY - size * 0.08);
        ctx.lineTo(centerX + size * 0.11, centerY - size * 0.22);
        ctx.lineTo(centerX + size * 0.11, centerY + size * 0.22);
        ctx.lineTo(centerX - size * 0.06, centerY + size * 0.08);
        ctx.lineTo(centerX - size * 0.2, centerY + size * 0.08);
        ctx.closePath();
        ctx.fill();
    }

    /**
     * Draws the muted cross icon.
     * @param {number} centerX - The icon center x position.
     * @param {number} centerY - The icon center y position.
     * @param {number} size - The icon size in pixels.
     */
    drawMuteCross(centerX, centerY, size) {
        const ctx = this.world.ctx;
        ctx.beginPath();
        ctx.moveTo(centerX + size * 0.19, centerY - size * 0.18);
        ctx.lineTo(centerX + size * 0.34, centerY + size * 0.18);
        ctx.moveTo(centerX + size * 0.34, centerY - size * 0.18);
        ctx.lineTo(centerX + size * 0.19, centerY + size * 0.18);
        ctx.stroke();
    }
}