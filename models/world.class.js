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
    bossAttackUnlocked = false;
    nextAngryChickenSpawnAt = 0;
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
    bossManager;

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
        this.bossManager = new WorldBossManager(this);
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
        this.handleAngryBossChickens();
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
        this.unlockBossAttackAfterFirstThrow();
        this.bottleCount--;
        this.keyboard.D = false;
        this.updateCollectibleStatusBars();
    }

    /** Unlocks boss attacks after Pepe's first bottle throw in boss phase. */
    unlockBossAttackAfterFirstThrow() {
        if (!this.bossPhaseStarted || this.bossAttackUnlocked) {
            return;
        }
        this.bossAttackUnlocked = true;
    }

    /**
     * Checks whether the endboss can actively attack Pepe.
     * @returns {boolean} True when boss attacks are unlocked.
     */
    canEndbossAttack() {
        return this.bossAttackUnlocked;
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
        if (this.winTriggered || !this.canCharacterWinBossFight()) {
            return;
        }
        this.winTriggered = true;
        this.winScreenVisibleAt = Date.now() + END_SCREEN_DELAY_MS;
    }

    /**
     * Checks whether Pepe is still alive enough to win the boss fight.
     * @returns {boolean} True when Pepe can still be declared the winner.
     */
    canCharacterWinBossFight() {
        return Boolean(this.character) && !this.character.isDead() && this.character.energy >= 20;
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

    /** Delegates boss phase activation to the boss manager. */
    handleBossPhase() {
        this.bossManager.handleBossPhase();
    }

    /** Delegates angry-boss chicken spawns to the boss manager. */
    handleAngryBossChickens() {
        this.bossManager.handleAngryBossChickens();
    }

    /** Delegates fleeing chicken spawns to the boss manager. */
    handleFleeingChickens() {
        this.bossManager.handleFleeingChickens();
    }

    /**
     * Returns the active endboss.
     * @returns {Endboss|undefined} The current endboss.
     */
    getEndboss() {
        return this.bossManager.getEndboss();
    }

    /**
     * Calculates Pepe's maximum x position.
     * @returns {number} The maximum x position for Pepe.
     */
    getCharacterMaxX() {
        return this.bossManager.getCharacterMaxX();
    }

    /**
     * Calculates Pepe's minimum x position.
     * @returns {number} The minimum x position for Pepe.
     */
    getCharacterMinX() {
        return this.bossManager.getCharacterMinX();
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
