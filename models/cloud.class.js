class Cloud extends MovableObject {
    y = 50;
    height = 250;
    width = 500;
    speed = 0.35;
    levelEndX = 3600;

    constructor(startX = 200 + Math.random() * 500, levelEndX = 3600) {
        super().loadImage("img/5_background/layers/4_clouds/1.png");
        this.x = startX;
        this.y = 20 + Math.random() * 90;
        this.levelEndX = levelEndX;
        this.animate();
    }
    animate() {// Bewegt die Wolke langsam nach links
        setInterval(() => {
            this.moveLeft();
            if (this.x + this.width < -720) {
                this.x = this.levelEndX + Math.random() * 720;
                this.y = 20 + Math.random() * 90;
            }
        }, 1000 / 60);
    }


}