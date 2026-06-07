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

    constructor(canvas, keyboard) {
        super();
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.keyboard = keyboard;
        this.carriedBottleImage.src = "img/7_statusbars/3_icons/icon_salsa_bottle.png";
        this.winImage.src = "img/You won, you lost/You Win A.png";
        this.coinCollectSound.preload = "auto";
        this.addBottleSound.preload = "auto";
        this.chickenBossSound.preload = "auto";
        this.collisionSound.preload = "auto";
        this.chickenHitSound.preload = "auto";
        this.coinCollectSound.volume = 0.45;
        this.addBottleSound.volume = 0.5;
        this.chickenBossSound.volume = 0.65;
        this.collisionSound.volume = 0.55;
        this.chickenHitSound.volume = 0.7;
        this.coinStatusBar = new StatusBar([
            "img/7_statusbars/1_statusbar/1_statusbar_coin/green/0.png",
            "img/7_statusbars/1_statusbar/1_statusbar_coin/green/20.png",
            "img/7_statusbars/1_statusbar/1_statusbar_coin/green/40.png",
            "img/7_statusbars/1_statusbar/1_statusbar_coin/green/60.png",
            "img/7_statusbars/1_statusbar/1_statusbar_coin/green/80.png",
            "img/7_statusbars/1_statusbar/1_statusbar_coin/green/100.png"
        ], 20, 70);
        this.coinStatusBar.setPercentage(0);

        this.bottleStatusBar = new StatusBar([
            "img/7_statusbars/1_statusbar/3_statusbar_bottle/green/0.png",
            "img/7_statusbars/1_statusbar/3_statusbar_bottle/green/20.png",
            "img/7_statusbars/1_statusbar/3_statusbar_bottle/green/40.png",
            "img/7_statusbars/1_statusbar/3_statusbar_bottle/green/60.png",
            "img/7_statusbars/1_statusbar/3_statusbar_bottle/green/80.png",
            "img/7_statusbars/1_statusbar/3_statusbar_bottle/green/100.png"
        ], 20, 120);
        this.bottleStatusBar.setPercentage(0);

        this.endbossStatusBar = new StatusBar([
            "img/7_statusbars/2_statusbar_endboss/green/green0.png",
            "img/7_statusbars/2_statusbar_endboss/green/green20.png",
            "img/7_statusbars/2_statusbar_endboss/green/green40.png",
            "img/7_statusbars/2_statusbar_endboss/green/green60.png",
            "img/7_statusbars/2_statusbar_endboss/green/green80.png",
            "img/7_statusbars/2_statusbar_endboss/green/green100.png"
        ], this.canvas.width - 220, 20);
        this.initializeCollectibleCounters();
        this.draw();
        this.setWorld();
        this.run();
    }

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

    updateCollectibleStatusBars() {
        const coinPercentage = Math.min(100, (this.coinCount / this.maxCoins) * 100);
        const bottlePercentage = this.bottleCount > 0
            ? Math.max(20, Math.min(100, (this.bottleCount / this.maxBottles) * 100))
            : 0;
        this.coinStatusBar.setPercentage(coinPercentage);
        this.bottleStatusBar.setPercentage(bottlePercentage);
    }

    run() {
        setInterval(() => {
            this.handleBossPhase();
            this.checkCollisions();
            this.checkCollectibleCollisions();
            this.checkBottleCollisions();
        }, 1000 / 60);

        setInterval(() => {
            this.checkTrowObjects();
        }, 200);
    }
    checkTrowObjects() {
        if (this.keyboard.D && this.bottleCount > 0) {
            const direction = this.character.otherDirection ? -1 : 1;
            const bottleX = this.character.otherDirection
                ? this.character.x + 58
                : this.character.x + this.character.width - 68;
            let bottle = new ThrowableObject(bottleX, this.character.y + 6, direction);
            this.throwableObjects.push(bottle);
            this.bottleCount--;
            this.updateCollectibleStatusBars();
        }
    }

    checkCollectibleCollisions() {
        for (let i = this.level.coins.length - 1; i >= 0; i--) {
            const coin = this.level.coins[i];
            if (!coin || !this.isCoinCollectingCollision(coin)) {
                continue;
            }

            this.level.coins.splice(i, 1);
            this.coinCount = Math.min(this.maxCoins, this.coinCount + 1);
            this.updateCollectibleStatusBars();
            this.playCollectibleSound(this.coinCollectSound);
        }

        for (let i = this.level.bottles.length - 1; i >= 0; i--) {
            const bottlePickup = this.level.bottles[i];
            if (!bottlePickup || !this.character.isColliding(bottlePickup)) {
                continue;
            }

            this.level.bottles.splice(i, 1);
            this.bottleCount = Math.min(this.maxBottles, this.bottleCount + 1);
            this.updateCollectibleStatusBars();
            this.playCollectibleSound(this.addBottleSound);
        }
    }

    playCollectibleSound(sound) {
        if (!sound) {
            return;
        }

        sound.currentTime = 0;
        sound.play().catch(() => { });
    }

    isCoinCollectingCollision(coin) {
        if (!this.character || !coin) {
            return false;
        }

        const overlapsHorizontally =
            this.character.x + this.character.width > coin.x &&
            this.character.x < coin.x + coin.width;

        if (!overlapsHorizontally) {
            return false;
        }

        // Schwebende Coins sollen nur gesammelt werden, wenn Pepe wirklich in die Coin-Hoehe springt.
        const characterReachedCoinHeight = this.character.y < coin.y + coin.height * 0.4;
        return characterReachedCoinHeight;
    }
    checkCollisions() {
        for (let i = this.level.enemies.length - 1; i >= 0; i--) {
            const enemy = this.level.enemies[i];

            if (enemy && enemy.isDead) {
                continue;
            }

            if (!this.character.isColliding(enemy)) {
                continue;
            }

            const characterBottom = this.character.y + this.character.height;
            const enemyTop = enemy.y;
            const isFalling = this.character.speedY < 0;
            const verticalHitDistance = characterBottom - enemyTop;
            const hitFromAbove = this.character.y + this.character.height <= enemy.y + enemy.height * 0.65;
            const stompedEnemy = isFalling && verticalHitDistance >= 0 && verticalHitDistance <= 40 && hitFromAbove;

            if (stompedEnemy) {
                if (typeof enemy.die === "function") {
                    enemy.die();
                    setTimeout(() => {
                        const enemyIndex = this.level.enemies.indexOf(enemy);
                        if (enemyIndex > -1) {
                            this.level.enemies.splice(enemyIndex, 1);
                        }
                    }, 300);
                } else {
                    this.level.enemies.splice(i, 1);
                }

                this.character.speedY = 20;
                continue;
            }

            const previousEnergy = this.character.energy;
            this.character.hit();

            if (this.character.energy !== previousEnergy) {
                this.statusBar.setPercentage(this.character.energy);
                this.playCollectibleSound(this.collisionSound);
            }
        }

        const endboss = this.getEndboss();
        const bossCanDamage = endboss && typeof endboss.canDamageCharacter === "function"
            ? endboss.canDamageCharacter()
            : true;

        if (endboss && !endboss.isDead() && this.character.isColliding(endboss) && bossCanDamage) {
            const previousEnergy = this.character.energy;
            this.character.hit();

            if (this.character.energy !== previousEnergy) {
                this.statusBar.setPercentage(this.character.energy);
                this.playCollectibleSound(this.collisionSound);
            }
        }
    }

    checkBottleCollisions() {
        const endboss = this.getEndboss();

        for (let i = this.throwableObjects.length - 1; i >= 0; i--) {
            const bottle = this.throwableObjects[i];
            if (!bottle) {
                continue;
            }

            let hitEnemy = false;

            for (let enemyIndex = this.level.enemies.length - 1; enemyIndex >= 0; enemyIndex--) {
                const enemy = this.level.enemies[enemyIndex];
                if (!enemy || enemy.isDead || !bottle.isColliding(enemy)) {
                    continue;
                }

                this.throwableObjects.splice(i, 1);
                hitEnemy = true;

                if (typeof enemy.die === "function") {
                    enemy.die();
                    setTimeout(() => {
                        const currentEnemyIndex = this.level.enemies.indexOf(enemy);
                        if (currentEnemyIndex > -1) {
                            this.level.enemies.splice(currentEnemyIndex, 1);
                        }
                    }, 300);
                } else {
                    this.level.enemies.splice(enemyIndex, 1);
                }

                break;
            }

            if (hitEnemy) {
                continue;
            }

            if (!endboss || endboss.isDead() || !bottle.isColliding(endboss)) {
                continue;
            }

            this.throwableObjects.splice(i, 1);
            endboss.hit();
            this.playCollectibleSound(this.chickenHitSound);
            this.endbossBottleHits += 1;
            this.showEndbossStatusBar = true;
            this.endbossStatusBar.setPercentage(endboss.energy);

            if (endboss.isDead()) {
                this.triggerWinAfterBossDefeat();
                continue;
            }

            if (this.endbossBottleHits % 3 === 0) {
                this.spawnBossBottleDrops(3);
            }
        }
    }

    triggerWinAfterBossDefeat() {
        if (this.winTriggered) {
            return;
        }

        this.winTriggered = true;
        this.winScreenVisibleAt = Date.now() + 700;
        setTimeout(() => {
            if (typeof showWinScreen === "function") {
                showWinScreen();
            }
        }, 700);
    }

    spawnBossBottleDrops(amount) {
        const endboss = this.getEndboss();
        if (!endboss || !this.character || amount <= 0) {
            return;
        }

        const directionToPepe = this.character.x < endboss.x ? -1 : 1;
        const startX = directionToPepe < 0
            ? endboss.x - 80
            : endboss.x + endboss.width + 30;

        for (let i = 0; i < amount; i++) {
            const dropX = startX + directionToPepe * i * 70;
            const dropY = 355;
            this.level.bottles.push(new BottlePickup(dropX, dropY));
        }

        this.maxBottles += amount;
        this.updateCollectibleStatusBars();
    }

    setWorld() {
        this.character.world = this;

        const endboss = this.getEndboss();
        if (endboss) {
            endboss.world = this;
        }
    }

    handleBossPhase() {
        const endboss = this.getEndboss();
        if (!endboss || this.bossPhaseStarted) {
            return;
        }

        const bossIntroDistance = 500;
        if (this.character.x >= endboss.x - bossIntroDistance) {
            this.level.enemies = (this.level.enemies || []).filter((enemy) => !(enemy instanceof Chicken));
            this.showEndbossStatusBar = true;
            this.endbossStatusBar.setPercentage(endboss.energy);
            this.bossPhaseStarted = true;
            this.bossFightTextUntil = Date.now() + 2200;
            this.playCollectibleSound(this.chickenBossSound);

            const fightMinX = Math.max(1200, endboss.x - 650);
            const fightMaxX = Math.min(this.level.level_end_x - endboss.width + 20, endboss.x + 1200);
            if (typeof endboss.setFightBounds === "function") {
                endboss.setFightBounds(fightMinX, fightMaxX);
            }

            if (typeof endboss.startFight === "function") {
                endboss.startFight();
            }
        }
    }

    getEndboss() {
        const cloudBoss = (this.level.clouds || []).find((object) => object instanceof Endboss);
        if (cloudBoss) {
            return cloudBoss;
        }

        return (this.level.enemies || []).find((object) => object instanceof Endboss);
    }

    getCharacterMaxX() {
        const levelEndX = this.level?.level_end_x ?? 0;
        const levelMaxX = levelEndX - (this.character?.width || 0);
        const endboss = this.getEndboss();

        if (!endboss) {
            return Math.max(0, levelMaxX);
        }

        if (this.bossPhaseStarted) {
            return Math.max(0, levelMaxX);
        }

        // Vor dem Endboss wird die Map gesperrt, damit Pepe nicht weiter durchlaufen kann.
        const bossGatePadding = 40;
        const bossGateX = endboss.x - this.character.width + bossGatePadding;
        return Math.max(0, Math.min(levelMaxX, bossGateX));
    }

    updateCameraX() {
        if (!this.character || !this.canvas || !this.level) {
            return;
        }

        const maxCameraOffset = Math.max(0, this.level.level_end_x - this.canvas.width);
        const cameraOffset = Math.min(maxCameraOffset, Math.max(0, this.character.x - 100));
        this.camera_x = -cameraOffset;
    }

    draw() {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.canvas.height);

        if (!this.level) {
            requestAnimationFrame(() => this.draw());
            return;
        }

        this.ctx.translate(this.camera_x, 0);
        this.addObjectsToMap(this.level.backgroundObjects || []);
        this.addObjectsToMap(this.level.clouds || []);
        this.addToMap(this.character);
        this.drawCarriedBottle();
        this.addObjectsToMap(this.level.coins || []);
        this.addObjectsToMap(this.level.bottles || []);
        this.addObjectsToMap(this.level.enemies || []);
        this.addObjectsToMap(this.throwableObjects);
        this.ctx.translate(-this.camera_x, 0);
        this.addToMap(this.statusBar);
        this.addToMap(this.coinStatusBar);
        this.addToMap(this.bottleStatusBar);
        if (this.showEndbossStatusBar) {
            this.addToMap(this.endbossStatusBar);
        }
        this.drawBossFightText();
        this.drawWinImage();

        let self = this;
        requestAnimationFrame(() => {
            self.draw();
        });
    }

    addObjectsToMap(objects) {
        if (!Array.isArray(objects)) {
            return;
        }
        objects.forEach((object) => {
            this.addToMap(object);
        });
    }

    addToMap(mo) {
        if (!mo || !mo.img || !mo.img.complete || mo.img.naturalWidth === 0) {
            return;
        }

        if (mo.otherDirection) {
            this.ctx.save();
            this.ctx.translate(mo.x + mo.width, 0);
            this.ctx.scale(-1, 1);
            this.ctx.drawImage(mo.img, 0, mo.y, mo.width, mo.height);
            this.ctx.restore();
            return;
        }

        this.ctx.drawImage(mo.img, mo.x, mo.y, mo.width, mo.height);
    }

    drawCarriedBottle() {
        if (!this.character || this.bottleCount < 1) {
            return;
        }

        if (!this.carriedBottleImage.complete || this.carriedBottleImage.naturalWidth === 0) {
            return;
        }

        const bottleWidth = 42;
        const bottleHeight = 40;
        const bottleY = this.character.y + 162;
        const bottleX = this.character.otherDirection
            ? this.character.x + this.character.width - 66
            : this.character.x + 16;

        this.ctx.drawImage(this.carriedBottleImage, bottleX, bottleY, bottleWidth, bottleHeight);
    }

    drawBossFightText() {
        const timeLeft = this.bossFightTextUntil - Date.now();
        if (timeLeft <= 0) {
            return;
        }

        const opacity = Math.min(1, timeLeft / 500);
        this.ctx.save();
        this.ctx.globalAlpha = opacity;
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";
        this.ctx.font = "70px 'Midnight Crimson', Arial";
        this.ctx.lineWidth = 8;
        this.ctx.strokeStyle = "#3b1600";
        this.ctx.fillStyle = "#ffcc00";
        this.ctx.strokeText("BOSS Fight!", this.canvas.width / 2, 115);
        this.ctx.fillText("BOSS Fight!", this.canvas.width / 2, 115);
        this.ctx.restore();
    }

    drawWinImage() {
        if (!this.winTriggered || Date.now() < this.winScreenVisibleAt) {
            return;
        }

        if (!this.winImage.complete || this.winImage.naturalWidth === 0) {
            return;
        }

        this.ctx.save();
        this.ctx.fillStyle = "rgba(0, 0, 0, 0.62)";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.drawImage(this.winImage, 192, 80, 336, 240);
        this.ctx.restore();
    }

};