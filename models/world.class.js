class World extends DrawableObject {
    character = new Charakter();
    level = level1;
    canvas;
    ctx;
    keyboard;
    camera_x = 0;
    statusBar = new StatusBar();
    coinStatusBar;
    bottleStatusBar;
    endbossStatusBar;
    showEndbossStatusBar = false;
    bossPhaseStarted = false;
    coinCount = 0;
    bottleCount = 0;
    maxCoins = 1;
    maxBottles = 1;
    throwableObjects = [];
    carriedBottleImage = new Image();
    coinCollectSound = new Audio("audio/coins.mp3");
    addBottleSound = new Audio("audio/addBottle.mp3");
    chickenBossSound = new Audio("audio/chickenBoss.mp3");
    collisionSound = new Audio("audio/collision.mp3");
    chickenHitSound = new Audio("audio/chickenhit.mp3");
    endbossBottleHits = 0;
    bossFightTextUntil = 0;
    winTriggered = false;
    winScreenVisibleAt = 0;
    winImage = new Image();
    collisionHandler;
    canvasControls;
    renderer;

    /** Creates a game world for the canvas. */
    constructor(canvas, keyboard) {
        super();
        this.setupCanvas(canvas, keyboard);
        this.setupImages();
        this.setupHandlers();
        this.setupAudio();
        this.setupStatusBars();
        this.initializeCollectibleCounters();
        this.draw();
        this.setWorld();
        this.run();
    }

    /** Stores canvas and keyboard references. */
    setupCanvas(canvas, keyboard) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.keyboard = keyboard;
    }

    /** Sets static image sources used by the world. */
    setupImages() {
        this.carriedBottleImage.src = "img/7_statusbars/3_icons/icon_salsa_bottle.png";
        this.winImage.src = "img/You won, you lost/You Win A.png";
    }

    /** Creates helper classes for world behavior. */
    setupHandlers() {
        this.collisionHandler = new WorldCollisionHandler(this);
        this.canvasControls = new WorldCanvasControls(this);
        this.renderer = new WorldRenderer(this);
    }

    /** Configures all world-owned audio files. */
    setupAudio() {
        this.getWorldSounds().forEach((sound) => sound.preload = "auto");
        this.coinCollectSound.volume = 0.45;
        this.addBottleSound.volume = 0.5;
        this.chickenBossSound.volume = 0.65;
        this.collisionSound.volume = 0.55;
        this.chickenHitSound.volume = 0.7;
    }

    /** Returns all world-owned sounds. */
    getWorldSounds() {
        return [
            this.coinCollectSound, this.addBottleSound, this.chickenBossSound,
            this.collisionSound, this.chickenHitSound
        ];
    }

    /** Creates all status bars. */
    setupStatusBars() {
        this.coinStatusBar = WorldStatusFactory.createCoinStatusBar();
        this.bottleStatusBar = WorldStatusFactory.createBottleStatusBar();
        this.endbossStatusBar = WorldStatusFactory.createEndbossStatusBar(this.canvas);
    }

    /** Resets collectible counters and limits. */
    initializeCollectibleCounters() {
        this.coinCount = 0;
        this.bottleCount = 0;
        this.endbossBottleHits = 0;
        this.winTriggered = false;
        this.winScreenVisibleAt = 0;
        this.maxCoins = Math.max(1, this.level?.coins?.length || 1);
        this.maxBottles = Math.max(1, this.level?.bottles?.length || 1);
        this.updateCollectibleStatusBars();
    }

    /** Updates coin and bottle status bars. */
    updateCollectibleStatusBars() {
        const coinPercentage = Math.min(100, (this.coinCount / this.maxCoins) * 100);
        this.coinStatusBar.setPercentage(coinPercentage);
        this.bottleStatusBar.setPercentage(this.getBottlePercentage());
    }

    /** Calculates the bottle status percentage. */
    getBottlePercentage() {
        if (this.bottleCount <= 0) {
            return 0;
        }
        return Math.max(20, Math.min(100, (this.bottleCount / this.maxBottles) * 100));
    }

    /** Starts world update loops. */
    run() {
        setInterval(() => this.runCollisionTick(), 1000 / 60);
        setInterval(() => this.runThrowTick(), 200);
    }

    /** Runs one collision update tick. */
    runCollisionTick() {
        if (this.shouldSkipWorldTick()) {
            return;
        }
        this.handleBossPhase();
        this.collisionHandler.checkCollisions();
        this.collisionHandler.checkCollectibleCollisions();
        this.collisionHandler.checkBottleCollisions();
    }

    /** Runs one bottle throw update tick. */
    runThrowTick() {
        if (!this.shouldSkipWorldTick()) {
            this.checkTrowObjects();
        }
    }

    /** Checks whether world updates should pause. */
    shouldSkipWorldTick() {
        return typeof isGamePaused === "function" && isGamePaused();
    }

    /** Throws a bottle when input and inventory allow it. */
    checkTrowObjects() {
        if (!this.keyboard.D || this.bottleCount <= 0) {
            return;
        }
        this.throwBottleFromCharacter();
        this.bottleCount--;
        this.updateCollectibleStatusBars();
    }

    /** Creates one throwable bottle from Pepe's hand. */
    throwBottleFromCharacter() {
        const direction = this.character.otherDirection ? -1 : 1;
        const bottleX = this.getBottleThrowX();
        this.throwableObjects.push(new ThrowableObject(bottleX, this.character.y + 6, direction));
    }

    /** Calculates the bottle throw start x position. */
    getBottleThrowX() {
        return this.character.otherDirection
            ? this.character.x + 58
            : this.character.x + this.character.width - 68;
    }

    /** Plays a collectible or collision sound. */
    playCollectibleSound(sound) {
        if (!sound) {
            return;
        }
        sound.muted = typeof isGameMuted === "function" && isGameMuted();
        sound.currentTime = 0;
        sound.play().catch(() => { });
    }

    /** Applies mute state to world audio. */
    setMuted(isMuted) {
        this.getWorldSounds().forEach((sound) => sound.muted = isMuted);
        this.character?.setMuted?.(isMuted);
    }

    /** Schedules the win screen after the boss dies. */
    triggerWinAfterBossDefeat() {
        if (this.winTriggered) {
            return;
        }
        this.winTriggered = true;
        this.winScreenVisibleAt = Date.now() + 700;
        setTimeout(() => showWinScreen?.(), 700);
    }

    /** Spawns bottle pickups near the boss. */
    spawnBossBottleDrops(amount) {
        const endboss = this.getEndboss();
        if (!this.canSpawnBossBottles(endboss, amount)) {
            return;
        }
        this.addBossBottleDrops(endboss, amount);
        this.maxBottles += amount;
        this.updateCollectibleStatusBars();
    }

    /** Checks whether boss bottles can spawn. */
    canSpawnBossBottles(endboss, amount) {
        return Boolean(endboss && this.character && amount > 0);
    }

    /** Adds boss bottle drops to the level. */
    addBossBottleDrops(endboss, amount) {
        const direction = this.character.x < endboss.x ? -1 : 1;
        const startX = this.getBossBottleStartX(endboss, direction);
        for (let i = 0; i < amount; i++) {
            this.level.bottles.push(new BottlePickup(startX + direction * i * 70, 355));
        }
    }

    /** Calculates the first boss bottle drop x position. */
    getBossBottleStartX(endboss, direction) {
        return direction < 0 ? endboss.x - 80 : endboss.x + endboss.width + 30;
    }

    /** Wires world references into actors. */
    setWorld() {
        this.character.world = this;
        const endboss = this.getEndboss();
        if (endboss) {
            endboss.world = this;
        }
    }

    /** Starts the endboss phase when Pepe gets close. */
    handleBossPhase() {
        const endboss = this.getEndboss();
        if (!this.shouldStartBossPhase(endboss)) {
            return;
        }
        this.clearRegularChickens();
        this.activateBossUi(endboss);
        this.configureBossFight(endboss);
        endboss.startFight?.();
    }

    /** Checks whether the boss phase should start. */
    shouldStartBossPhase(endboss) {
        return Boolean(endboss && !this.bossPhaseStarted && this.character.x >= endboss.x - 500);
    }

    /** Removes normal chickens at boss phase start. */
    clearRegularChickens() {
        this.level.enemies = (this.level.enemies || []).filter((enemy) => !(enemy instanceof Chicken));
    }

    /** Shows boss UI and plays the boss sound. */
    activateBossUi(endboss) {
        this.showEndbossStatusBar = true;
        this.endbossStatusBar.setPercentage(endboss.energy);
        this.bossPhaseStarted = true;
        this.bossFightTextUntil = Date.now() + 2200;
        this.playCollectibleSound(this.chickenBossSound);
    }

    /** Configures the boss fight movement bounds. */
    configureBossFight(endboss) {
        const minX = Math.max(1200, endboss.x - 650);
        const maxX = Math.min(this.level.level_end_x - endboss.width + 20, endboss.x + 1200);
        endboss.setFightBounds?.(minX, maxX);
    }

    /** Returns the active endboss. */
    getEndboss() {
        return this.findEndboss(this.level.clouds) || this.findEndboss(this.level.enemies);
    }

    /** Finds an endboss inside a collection. */
    findEndboss(objects = []) {
        return objects.find((object) => object instanceof Endboss);
    }

    /** Calculates Pepe's maximum x position. */
    getCharacterMaxX() {
        const levelMaxX = this.getLevelCharacterMaxX();
        const endboss = this.getEndboss();
        if (!endboss || this.bossPhaseStarted) {
            return Math.max(0, levelMaxX);
        }
        return this.getBossGateMaxX(levelMaxX, endboss);
    }

    /** Calculates the level end limit for Pepe. */
    getLevelCharacterMaxX() {
        return (this.level?.level_end_x ?? 0) - (this.character?.width || 0);
    }

    /** Calculates the pre-boss gate x limit. */
    getBossGateMaxX(levelMaxX, endboss) {
        const bossGateX = endboss.x - this.character.width + 40;
        return Math.max(0, Math.min(levelMaxX, bossGateX));
    }

    /** Updates camera position from Pepe's position. */
    updateCameraX() {
        if (!this.character || !this.canvas || !this.level) {
            return;
        }
        const maxOffset = Math.max(0, this.level.level_end_x - this.canvas.width);
        this.camera_x = -Math.min(maxOffset, Math.max(0, this.character.x - 100));
    }

    /** Delegates frame rendering to the renderer. */
    draw() {
        this.renderer.draw();
    }
}
