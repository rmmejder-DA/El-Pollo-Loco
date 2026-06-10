class WorldBossManager {
    /**
     * Creates a boss manager for one world instance.
     * @param {World} world - The world using this manager.
     */
    constructor(world) {
        this.world = world;
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
        const world = this.world;
        return Boolean(endboss && !world.bossPhaseStarted && world.character.x >= endboss.x - 500);
    }

    /** Removes normal chickens at boss phase start. */
    clearRegularChickens() {
        this.world.level.enemies = (this.world.level.enemies || []).filter((enemy) => !(enemy instanceof Chicken));
    }

    /** Spawns chasing chickens when Pepe flees from the boss. */
    handleFleeingChickens() {
        const world = this.world;
        const endboss = this.getEndboss();
        if (!world.bossPhaseStarted || !endboss || endboss.isDead()) {
            return;
        }
        if (!this.isCharacterFleeingBoss(endboss) || Date.now() < world.nextFleeChickenSpawnAt) {
            return;
        }
        this.spawnChasingChicken(world.character.x + 720);
        this.spawnChasingChicken(world.character.x - 720);
        world.nextFleeChickenSpawnAt = Date.now() + 2500;
    }

    /** Spawns small attacker chickens while the angry boss is hurt. */
    handleAngryBossChickens() {
        const world = this.world;
        const endboss = this.getEndboss();
        if (!world.bossPhaseStarted || !endboss || endboss.isDead() || !endboss.isHurt?.()) {
            return;
        }
        if (!this.canSpawnAngryChicken() || Date.now() < world.nextAngryChickenSpawnAt) {
            return;
        }
        const spawnDirection = Math.random() < 0.5 ? -1 : 1;
        this.spawnSmallChasingChicken(world.character.x + spawnDirection * 340);
        world.nextAngryChickenSpawnAt = Date.now() + 3200;
    }

    /**
     * Checks whether another angry small chicken can spawn.
     * @returns {boolean} True when spawn is allowed.
     */
    canSpawnAngryChicken() {
        return this.countActiveSmallChickens() < 2;
    }

    /**
     * Counts living small chickens in the enemy list.
     * @returns {number} Number of active small chickens.
     */
    countActiveSmallChickens() {
        const enemies = this.world.level.enemies || [];
        return enemies.filter((enemy) => enemy?.variant === "small" && !enemy.isDead).length;
    }

    /**
     * Checks whether Pepe runs away from the boss.
     * @param {Endboss} endboss - The endboss instance.
     * @returns {boolean} True when Pepe flees from the boss.
     */
    isCharacterFleeingBoss(endboss) {
        return this.world.character.x < endboss.x - 600;
    }

    /**
     * Spawns a single chicken that chases Pepe.
     * @param {number} spawnX - The chicken spawn x position.
     */
    spawnChasingChicken(spawnX) {
        const startX = Math.max(0, spawnX);
        const chicken = new Chicken(startX);
        chicken.chasePepe = true;
        chicken.setWorld?.(this.world);
        this.world.level.enemies.push(chicken);
    }

    /**
     * Spawns a small chicken that directly chases Pepe.
     * @param {number} spawnX - The chicken spawn x position.
     */
    spawnSmallChasingChicken(spawnX) {
        const startX = Math.max(0, spawnX);
        const chicken = new Chicken(startX, "small");
        chicken.chasePepe = true;
        chicken.setWorld?.(this.world);
        this.world.level.enemies.push(chicken);
    }

    /**
     * Shows boss UI and plays the boss sound.
     * @param {Endboss} endboss - The endboss instance.
     */
    activateBossUi(endboss) {
        const world = this.world;
        world.showEndbossStatusBar = true;
        world.endbossStatusBar.setPercentage(endboss.energy);
        world.bossPhaseStarted = true;
        world.bossAttackUnlocked = false;
        world.nextAngryChickenSpawnAt = 0;
        world.nextFleeChickenSpawnAt = 0;
        world.bossFightTextUntil = Date.now() + 2200;
        world.playCollectibleSound(world.chickenBossSound);
    }

    /**
     * Configures the boss fight movement bounds.
     * @param {Endboss} endboss - The endboss instance.
     */
    configureBossFight(endboss) {
        const world = this.world;
        const minX = Math.max(1200, endboss.x - 650);
        const maxX = Math.min(world.level.level_end_x - endboss.width + 20, endboss.x + 1200);
        endboss.setFightBounds?.(minX, maxX);
    }

    /**
     * Returns the active endboss.
     * @returns {Endboss|undefined} The current endboss.
     */
    getEndboss() {
        return this.findEndboss(this.world.level.clouds) || this.findEndboss(this.world.level.enemies);
    }

    /**
     * Finds an endboss inside a collection.
     * @param {object[]} [objects=[]] - The objects to search.
     * @returns {Endboss|undefined} The found endboss or undefined.
     */
    findEndboss(objects = []) {
        return objects.find((object) => object instanceof Endboss);
    }

    /**
     * Calculates Pepe's maximum x position.
     * @returns {number} The maximum x position for Pepe.
     */
    getCharacterMaxX() {
        const levelMaxX = this.getLevelCharacterMaxX();
        const endboss = this.getEndboss();
        if (!endboss) {
            return Math.max(0, levelMaxX);
        }
        if (this.world.bossPhaseStarted) {
            return this.getBossFightMaxX(levelMaxX, endboss);
        }
        return this.getBossGateMaxX(levelMaxX, endboss);
    }

    /**
     * Calculates Pepe's minimum x position.
     * @returns {number} The minimum x position for Pepe.
     */
    getCharacterMinX() {
        const world = this.world;
        const endboss = this.getEndboss();
        if (!endboss || !world.bossPhaseStarted) {
            return 0;
        }
        const leftBound = (endboss.fightMinX ?? 0) - world.character.width + 65;
        return Math.max(0, Math.round(leftBound));
    }

    /**
     * Calculates the level end limit for Pepe.
     * @returns {number} The level maximum x position for Pepe.
     */
    getLevelCharacterMaxX() {
        const world = this.world;
        return (world.level?.level_end_x ?? 0) - (world.character?.width || 0);
    }

    /**
     * Calculates the pre-boss gate x limit.
     * @param {number} levelMaxX - The level end limit.
     * @param {Endboss} endboss - The endboss instance.
     * @returns {number} The gate x limit before the boss.
     */
    getBossGateMaxX(levelMaxX, endboss) {
        const world = this.world;
        if (endboss.energy <= 50) {
            return Math.max(0, levelMaxX);
        }
        const bossGateX = endboss.x - world.character.width + 40;
        return Math.max(0, Math.min(levelMaxX, bossGateX));
    }

    /**
     * Calculates the right fight bound during the active boss phase.
     * @param {number} levelMaxX - The level end limit.
     * @param {Endboss} endboss - The endboss instance.
     * @returns {number} The maximum x limit in the boss arena.
     */
    getBossFightMaxX(levelMaxX, endboss) {
        const world = this.world;
        const rightBound = (endboss.fightMaxX ?? levelMaxX) - world.character.width + 30;
        return Math.max(this.getCharacterMinX(), Math.min(levelMaxX, Math.round(rightBound)));
    }
}
