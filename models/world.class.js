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
    nextFleeChickenSpawnAt = 0;
    coinCount = 0;
    bottleCount = 0;
    maxCoins = 1;
    maxBottles = 5;
    throwableObjects = [];
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
    heartHintImage = new Image();
    healthHintUntil = 0;
    collisionHandler;
    canvasControls;
    renderer;

    /**
     * Creates a game world for the canvas.
     * @param {HTMLCanvasElement} canvas - The game canvas.
     * @param {Keyboard} keyboard - The keyboard input state.
     */
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

    /**
     * Stores canvas and keyboard references.
     * @param {HTMLCanvasElement} canvas - The game canvas.
     * @param {Keyboard} keyboard - The keyboard input state.
     */
    setupCanvas(canvas, keyboard) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.keyboard = keyboard;
    }

    /** Sets static image sources used by the world. */
    setupImages() {
        this.winImage.src = "img/You won, you lost/You Win A.png";
        this.heartHintImage.src = "img/7_statusbars/3_icons/icon_health.png";
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
        this.maxCoins = 3;
        this.maxBottles = 5;
        this.updateCollectibleStatusBars();
    }

    /** Updates coin and bottle status bars. */
    updateCollectibleStatusBars() {
        const coinPercentage = Math.min(100, (this.coinCount / this.maxCoins) * 100);
        this.coinStatusBar.setPercentage(coinPercentage);
        this.bottleStatusBar.setPercentage(this.getBottlePercentage());
    }

    /** Converts a full coin bar into extra health for Pepe. */
    convertCoinsToHealth() {
        if (this.character.energy >= 100) {
            this.coinCount = 0;
            return;
        }
        this.character.energy = Math.min(100, this.character.energy + 20);
        this.statusBar.setPercentage(this.character.energy);
        this.coinCount = 0;
        this.healthHintUntil = Date.now() + 1500;
        this.playCollectibleSound(this.coinCollectSound);
    }

    /** Calculates the bottle status percentage. */
    getBottlePercentage() {
        return Math.min(100, (this.bottleCount / this.maxBottles) * 100);
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
        this.handleFleeingChickens();
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
        this.keyboard.D = false;
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

    /** Checks whether another bottle can be collected. */
    canCollectBottle() {
        return this.bottleCount < this.maxBottles;
    }

    /**
     * Plays a collectible or collision sound.
     * @param {HTMLAudioElement} sound - The sound to play.
     */
    playCollectibleSound(sound) {
        if (!sound) {
            return;
        }
        sound.muted = typeof isGameMuted === "function" && isGameMuted();
        sound.currentTime = 0;
        sound.play().catch(() => { });
    }

    /**
     * Applies mute state to world audio.
     * @param {boolean} isMuted - Whether audio should be muted.
     */
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

    /**
     * Spawns bottle pickups near the boss.
     * @param {number} amount - The number of bottles to spawn.
     */
    spawnBossBottleDrops(amount) {
        const endboss = this.getEndboss();
        if (!this.canSpawnBossBottles(endboss, amount)) {
            return;
        }
        this.addBossBottleDrops(endboss, amount);
        this.updateCollectibleStatusBars();
    }

    /**
     * Checks whether boss bottles can spawn.
     * @param {Endboss} endboss - The endboss instance.
     * @param {number} amount - The number of bottles to spawn.
     * @returns {boolean} True when boss bottles can spawn.
     */
    canSpawnBossBottles(endboss, amount) {
        return Boolean(endboss && this.character && amount > 0);
    }

    /**
     * Adds boss bottle drops to the level.
     * @param {Endboss} endboss - The endboss instance.
     * @param {number} amount - The number of bottles to add.
     */
    addBossBottleDrops(endboss, amount) {
        const direction = this.character.x <= endboss.x ? -1 : 1;
        const startX = this.getBossBottleStartX(endboss, direction);
        const startY = this.getBossBottleStartY(endboss);
        for (let i = 0; i < amount; i++) {
            this.level.bottles.push(new BottlePickup(
                startX + direction * i * 18,
                startY,
                this.getBossBottleDropMotion(direction, i)
            ));
        }
    }

    /**
     * Calculates the first boss bottle drop x position.
     * @param {Endboss} endboss - The endboss instance.
     * @param {number} direction - The drop direction (-1 or 1).
     * @returns {number} The first bottle x position.
     */
    getBossBottleStartX(endboss, direction) {
        return direction < 0 ? endboss.x + 20 : endboss.x + endboss.width - 80;
    }

    /**
     * Calculates the boss bottle spawn y position near the beak.
     * @param {Endboss} endboss - The endboss instance.
     * @returns {number} The bottle spawn y position.
     */
    getBossBottleStartY(endboss) {
        return endboss.y + 135;
    }

    /**
     * Builds the spawn motion for one boss-spit bottle.
     * @param {number} direction - The spit direction (-1 or 1).
     * @param {number} index - The bottle index within the spit batch.
     * @returns {{settleY: number, velocityX: number, velocityY: number, gravity: number}} The motion config.
     */
    getBossBottleDropMotion(direction, index) {
        return {
            settleY: 355,
            velocityX: direction * (2.8 + index * 0.35),
            velocityY: -(6.2 + index * 0.7),
            gravity: 0.42
        };
    }

    /** Wires world references into actors. */
    setWorld() {
        this.character.world = this;
        this.level.enemies?.forEach((enemy) => {
            if (typeof enemy.setWorld === "function") {
                enemy.setWorld(this);
            }
        });
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

    /**
     * Checks whether the boss phase should start.
     * @param {Endboss} endboss - The endboss instance.
     * @returns {boolean} True when the boss phase should start.
     */
    shouldStartBossPhase(endboss) {
        return Boolean(endboss && !this.bossPhaseStarted && this.character.x >= endboss.x - 500);
    }

    /** Removes normal chickens at boss phase start. */
    clearRegularChickens() {
        this.level.enemies = (this.level.enemies || []).filter((enemy) => !(enemy instanceof Chicken));
    }

    /** Spawns chasing chickens when Pepe flees from the boss. */
    handleFleeingChickens() {
        const endboss = this.getEndboss();
        if (!this.bossPhaseStarted || !endboss || endboss.isDead()) {
            return;
        }
        if (!this.isCharacterFleeingBoss(endboss) || Date.now() < this.nextFleeChickenSpawnAt) {
            return;
        }
        this.spawnChasingChicken(this.character.x + 720);
        this.spawnChasingChicken(this.character.x - 720);
        this.nextFleeChickenSpawnAt = Date.now() + 2500;
    }

    /**
     * Checks whether Pepe runs away from the boss.
     * @param {Endboss} endboss - The endboss instance.
     * @returns {boolean} True when Pepe flees from the boss.
     */
    isCharacterFleeingBoss(endboss) {
        return this.character.x < endboss.x - 600;
    }

    /**
     * Spawns a single chicken that chases Pepe.
     * @param {number} spawnX - The chicken spawn x position.
     */
    spawnChasingChicken(spawnX) {
        const startX = Math.max(0, spawnX);
        const chicken = new Chicken(startX);
        chicken.chasePepe = true;
        chicken.setWorld?.(this);
        this.level.enemies.push(chicken);
    }

    /**
     * Shows boss UI and plays the boss sound.
     * @param {Endboss} endboss - The endboss instance.
     */
    activateBossUi(endboss) {
        this.showEndbossStatusBar = true;
        this.endbossStatusBar.setPercentage(endboss.energy);
        this.bossPhaseStarted = true;
        this.bossFightTextUntil = Date.now() + 2200;
        this.playCollectibleSound(this.chickenBossSound);
    }

    /**
     * Configures the boss fight movement bounds.
     * @param {Endboss} endboss - The endboss instance.
     */
    configureBossFight(endboss) {
        const minX = Math.max(1200, endboss.x - 650);
        const maxX = Math.min(this.level.level_end_x - endboss.width + 20, endboss.x + 1200);
        endboss.setFightBounds?.(minX, maxX);
    }

    /** Returns the active endboss. */
    getEndboss() {
        return this.findEndboss(this.level.clouds) || this.findEndboss(this.level.enemies);
    }

    /**
     * Finds an endboss inside a collection.
     * @param {object[]} [objects=[]] - The objects to search.
     * @returns {Endboss|undefined} The found endboss or undefined.
     */
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

    /**
     * Calculates the pre-boss gate x limit.
     * @param {number} levelMaxX - The level end limit.
     * @param {Endboss} endboss - The endboss instance.
     * @returns {number} The gate x limit before the boss.
     */
    getBossGateMaxX(levelMaxX, endboss) {
        if (endboss.energy <= 50) {
            return Math.max(0, levelMaxX);
        }
        const bossGateX = endboss.x - this.character.width + 40;
        return Math.max(0, Math.min(levelMaxX, bossGateX));
    }

    /** Updates camera position from Pepe's position. */
    updateCameraX() {
        if (!this.character || !this.canvas || !this.level) {
            return;
        }
        const maxOffset = Math.max(0, this.level.level_end_x - this.canvas.width);
        this.camera_x = Math.round(-Math.min(maxOffset, Math.max(0, this.character.x - 100)));
    }

    /** Delegates frame rendering to the renderer. */
    draw() {
        this.renderer.draw();
    }
}
