class WorldCollisionHandler {
    coinPickupDistance = 95;
    endbossBottleDamage = 27.5;

    /*** Creates a collision handler for a world.
     * @param {World} world - The world to handle collisions for.*/
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

    /**
     * Checks one enemy collision.
     * @param {MovableObject} enemy - The enemy to test.
     * @param {number} enemyIndex - The enemy index in the level.
     */
    checkSingleEnemyCollision(enemy, enemyIndex) {
        if (!this.canEnemyCollide(enemy)) {
            return;
        }
        if (this.isEnemyStomped(enemy)) {
            this.defeatStompedEnemy(enemy, enemyIndex);
        } else {
            this.damageCharacter(5);
        }
    }

    /**
     * Blocks Pepe so he cannot walk through an enemy.
     * @param {MovableObject} enemy - The blocking enemy.
     */
    blockCharacterAt(enemy) {
        const character = this.world.character;
        const characterBox = character.getCollisionBox();
        const enemyBox = enemy.getCollisionBox();
        const characterCenter = characterBox.x + characterBox.width / 2;
        const enemyCenter = enemyBox.x + enemyBox.width / 2;
        if (characterCenter < enemyCenter) {
            character.x = enemyBox.x - characterBox.width - (characterBox.x - character.x);
        } else {
            character.x = enemyBox.x + enemyBox.width - (characterBox.x - character.x);
        }
    }

    /**
     * Defeats a stomped enemy and bounces Pepe.
     * @param {MovableObject} enemy - The stomped enemy.
     * @param {number} enemyIndex - The enemy index in the level.
     */
    defeatStompedEnemy(enemy, enemyIndex) {
        this.defeatEnemy(enemy, enemyIndex);
        this.world.character.speedY = 20;
        this.world.character.showStompJumpFrame?.();
    }

    /**
     * Checks whether one enemy can collide.
     * @param {MovableObject} enemy - The enemy to test.
     * @returns {boolean} True when the enemy can collide.
     */
    canEnemyCollide(enemy) {
        return enemy && !enemy.isDead && this.world.character.isColliding(enemy);
    }

    /**
     * Checks whether Pepe stomped an enemy.
     * @param {MovableObject} enemy - The enemy to test.
     * @returns {boolean} True when Pepe stomped the enemy.
     */
    isEnemyStomped(enemy) {
        const character = this.world.character;
        const characterBottom = character.y + character.height;
        const verticalHitDistance = characterBottom - enemy.y;
        const hitFromAbove = character.y + character.height <= enemy.y + enemy.height * 0.65;
        return character.speedY < 0 && verticalHitDistance >= 0 && verticalHitDistance <= 40 && hitFromAbove;
    }

    /**
     * Defeats or removes an enemy.
     * @param {MovableObject} enemy - The enemy to defeat.
     * @param {number} enemyIndex - The enemy index in the level.
     */
    defeatEnemy(enemy, enemyIndex) {
        if (typeof enemy.die === "function") {
            enemy.die();
            setTimeout(() => this.removeEnemy(enemy), 300);
            return;
        }

        this.world.level.enemies.splice(enemyIndex, 1);
    }

    /**
     * Removes an enemy from the level.
     * @param {MovableObject} enemy - The enemy to remove.
     */
    removeEnemy(enemy) {
        const enemyIndex = this.world.level.enemies.indexOf(enemy);
        if (enemyIndex > -1) {
            this.world.level.enemies.splice(enemyIndex, 1);
        }
    }

    /**
     * Applies damage to Pepe.
     * @param {number} [damage=20] - The damage amount to apply.
     */
    damageCharacter(damage = 20) {
        if (this.world.winTriggered) {
            return;
        }
        const previousEnergy = this.world.character.energy;
        this.world.character.hit(damage);

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
        const bossIsRetreating = endboss && typeof endboss.isRetreating === "function"
            ? endboss.isRetreating()
            : false;

        if (endboss && !endboss.isDead() && this.world.character.isColliding(endboss)) {
            if (!bossIsRetreating) {
                this.blockCharacterAt(endboss);
            }
            if (bossCanDamage) {
                this.damageCharacter();
            }
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
            this.world.coinCount += 1;
            this.world.playCollectibleSound(this.world.coinCollectSound);
            if (this.world.coinCount >= this.world.maxCoins) {
                this.world.convertCoinsToHealth();
            }
            this.world.updateCollectibleStatusBars();
        }
    }

    /**
     * Checks whether Pepe collects a coin.
     * @param {DrawableObject} coin - The coin to test.
     * @returns {boolean} True when Pepe jumps close enough to the coin.
     */
    isCoinCollectingCollision(coin) {
        const character = this.world.character;
        return character.isAboveGround() && this.isCoinInPickupRange(character, coin);
    }

    /**
     * Checks whether a coin is close enough to Pepe to be collected.
     * @param {MovableObject} character - Pepe.
     * @param {DrawableObject} coin - The coin to test.
     * @returns {boolean} True when coin distance is within the pickup range.
     */
    isCoinInPickupRange(character, coin) {
        const characterBox = character.getCollisionBox();
        const coinBox = coin.getCollisionBox();
        const characterCenterX = characterBox.x + characterBox.width / 2;
        const characterCenterY = characterBox.y + characterBox.height / 2;
        const coinCenterX = coinBox.x + coinBox.width / 2;
        const coinCenterY = coinBox.y + coinBox.height / 2;
        const distanceX = characterCenterX - coinCenterX;
        const distanceY = characterCenterY - coinCenterY;
        const distance = Math.hypot(distanceX, distanceY);
        return distance <= this.coinPickupDistance;
    }

    /** Checks bottle pickup collisions. */
    checkBottlePickupCollisions() {
        for (let i = this.world.level.bottles.length - 1; i >= 0; i--) {
            const bottlePickup = this.world.level.bottles[i];
            if (!bottlePickup || !this.world.character.isColliding(bottlePickup)) {
                continue;
            }
            if (!this.world.canCollectBottle()) {
                continue;
            }

            this.world.level.bottles.splice(i, 1);
            this.world.bottleCount++;
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

    /**
     * Checks one bottle against normal enemies.
     * @param {ThrowableObject} bottle - The thrown bottle.
     * @param {number} bottleIndex - The bottle index in the throwables.
     * @returns {boolean} True when an enemy was hit.
     */
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

    /**
     * Checks one thrown bottle against the endboss.
     * @param {ThrowableObject} bottle - The thrown bottle.
     * @param {number} bottleIndex - The bottle index in the throwables.
     * @param {Endboss} endboss - The endboss to test.
     */
    checkBottleEndbossHit(bottle, bottleIndex, endboss) {
        if (!endboss || endboss.isDead() || !bottle.isColliding(endboss)) {
            return;
        }

        this.world.throwableObjects.splice(bottleIndex, 1);
        endboss.hit(this.endbossBottleDamage);
        this.world.playCollectibleSound(this.world.chickenHitSound);
        this.world.endbossBottleHits += 1;
        this.updateEndbossStatusBar(endboss);
        this.handleEndbossHitResult(endboss);
    }

    /**
     * Updates the visible endboss status bar.
     * @param {Endboss} endboss - The endboss to read energy from.
     */
    updateEndbossStatusBar(endboss) {
        this.world.showEndbossStatusBar = true;
        this.world.endbossStatusBar.setPercentage(endboss.energy);
    }

    /**
     * Handles the result after the endboss was hit.
     * @param {Endboss} endboss - The endboss that was hit.
     */
    handleEndbossHitResult(endboss) {
        if (endboss.isDead()) {
            this.world.triggerWinAfterBossDefeat();
        }
    }
}