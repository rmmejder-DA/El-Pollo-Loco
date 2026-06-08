class WorldCollisionHandler {
    /** Creates a collision handler for a world. */
    constructor(world) {
        this.world = world;
    }

    /** Checks character collisions with enemies and boss. */
    checkCollisions() {
        this.checkEnemyCollisions();
        this.checkEndbossCollision();
    }

    /** Checks Pepe against all normal enemies. */
    checkEnemyCollisions() {
        for (let i = this.world.level.enemies.length - 1; i >= 0; i--) {
            this.checkSingleEnemyCollision(this.world.level.enemies[i], i);
        }
    }

    /** Checks one enemy collision. */
    checkSingleEnemyCollision(enemy, enemyIndex) {
        if (!this.canEnemyCollide(enemy)) {
            return;
        }
        if (this.isEnemyStomped(enemy)) {
            this.defeatStompedEnemy(enemy, enemyIndex);
        } else {
            this.damageCharacter();
        }
    }

    /** Defeats a stomped enemy and bounces Pepe. */
    defeatStompedEnemy(enemy, enemyIndex) {
        this.defeatEnemy(enemy, enemyIndex);
        this.world.character.speedY = 20;
    }

    /** Checks whether one enemy can collide. */
    canEnemyCollide(enemy) {
        return enemy && !enemy.isDead && this.world.character.isColliding(enemy);
    }

    /** Checks whether Pepe stomped an enemy. */
    isEnemyStomped(enemy) {
        const character = this.world.character;
        const characterBottom = character.y + character.height;
        const verticalHitDistance = characterBottom - enemy.y;
        const hitFromAbove = character.y + character.height <= enemy.y + enemy.height * 0.65;
        return character.speedY < 0 && verticalHitDistance >= 0 && verticalHitDistance <= 40 && hitFromAbove;
    }

    /** Defeats or removes an enemy. */
    defeatEnemy(enemy, enemyIndex) {
        if (typeof enemy.die === "function") {
            enemy.die();
            setTimeout(() => this.removeEnemy(enemy), 300);
            return;
        }

        this.world.level.enemies.splice(enemyIndex, 1);
    }

    /** Removes an enemy from the level. */
    removeEnemy(enemy) {
        const enemyIndex = this.world.level.enemies.indexOf(enemy);
        if (enemyIndex > -1) {
            this.world.level.enemies.splice(enemyIndex, 1);
        }
    }

    /** Applies damage to Pepe. */
    damageCharacter() {
        const previousEnergy = this.world.character.energy;
        this.world.character.hit();

        if (this.world.character.energy !== previousEnergy) {
            this.world.statusBar.setPercentage(this.world.character.energy);
            this.world.playCollectibleSound(this.world.collisionSound);
        }
    }

    /** Checks Pepe against the endboss. */
    checkEndbossCollision() {
        const endboss = this.world.getEndboss();
        const bossCanDamage = endboss && typeof endboss.canDamageCharacter === "function"
            ? endboss.canDamageCharacter()
            : true;

        if (endboss && !endboss.isDead() && this.world.character.isColliding(endboss) && bossCanDamage) {
            this.damageCharacter();
        }
    }

    /** Checks all collectible collisions. */
    checkCollectibleCollisions() {
        this.checkCoinCollisions();
        this.checkBottlePickupCollisions();
    }

    /** Checks coin pickup collisions. */
    checkCoinCollisions() {
        for (let i = this.world.level.coins.length - 1; i >= 0; i--) {
            const coin = this.world.level.coins[i];
            if (!coin || !this.isCoinCollectingCollision(coin)) {
                continue;
            }

            this.world.level.coins.splice(i, 1);
            this.world.coinCount = Math.min(this.world.maxCoins, this.world.coinCount + 1);
            this.world.updateCollectibleStatusBars();
            this.world.playCollectibleSound(this.world.coinCollectSound);
        }
    }

    /** Checks whether Pepe collects a coin. */
    isCoinCollectingCollision(coin) {
        return this.world.character.isColliding(coin);
    }

    /** Checks bottle pickup collisions. */
    checkBottlePickupCollisions() {
        for (let i = this.world.level.bottles.length - 1; i >= 0; i--) {
            const bottlePickup = this.world.level.bottles[i];
            if (!bottlePickup || !this.world.character.isColliding(bottlePickup)) {
                continue;
            }

            this.world.level.bottles.splice(i, 1);
            this.world.bottleCount = Math.min(this.world.maxBottles, this.world.bottleCount + 1);
            this.world.updateCollectibleStatusBars();
            this.world.playCollectibleSound(this.world.addBottleSound);
        }
    }

    /** Checks thrown bottle collisions. */
    checkBottleCollisions() {
        const endboss = this.world.getEndboss();

        for (let i = this.world.throwableObjects.length - 1; i >= 0; i--) {
            const bottle = this.world.throwableObjects[i];
            if (!bottle || this.checkBottleEnemyHit(bottle, i)) {
                continue;
            }

            this.checkBottleEndbossHit(bottle, i, endboss);
        }
    }

    /** Checks one bottle against normal enemies. */
    checkBottleEnemyHit(bottle, bottleIndex) {
        for (let enemyIndex = this.world.level.enemies.length - 1; enemyIndex >= 0; enemyIndex--) {
            const enemy = this.world.level.enemies[enemyIndex];
            if (!enemy || enemy.isDead || !bottle.isColliding(enemy)) {
                continue;
            }

            this.world.throwableObjects.splice(bottleIndex, 1);
            this.defeatEnemy(enemy, enemyIndex);
            return true;
        }

        return false;
    }

    /** Checks one thrown bottle against the endboss. */
    checkBottleEndbossHit(bottle, bottleIndex, endboss) {
        if (!endboss || endboss.isDead() || !bottle.isColliding(endboss)) {
            return;
        }

        this.world.throwableObjects.splice(bottleIndex, 1);
        endboss.hit();
        this.world.playCollectibleSound(this.world.chickenHitSound);
        this.world.endbossBottleHits += 1;
        this.updateEndbossStatusBar(endboss);
        this.handleEndbossHitResult(endboss);
    }

    /** Updates the visible endboss status bar. */
    updateEndbossStatusBar(endboss) {
        this.world.showEndbossStatusBar = true;
        this.world.endbossStatusBar.setPercentage(endboss.energy);
    }

    /** Handles the result after the endboss was hit. */
    handleEndbossHitResult(endboss) {
        if (endboss.isDead()) {
            this.world.triggerWinAfterBossDefeat();
        } else if (this.world.endbossBottleHits % 3 === 0) {
            this.world.spawnBossBottleDrops(3);
        }
    }
}