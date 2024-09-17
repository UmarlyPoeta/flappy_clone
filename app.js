let config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: '#f9f9f9',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

let game = new Phaser.Game(config);
let bird;
let pipes;
let cursors;
let score = 0;
let scoreText;
let flapSound;
let hitSound;
let restartSound;
let gameOverText;
let isGameOver = false;

function preload() {
    this.load.image('bird', 'assets/bird.png');
    this.load.image('pipe', 'assets/pipe.png');
    this.load.audio('flap', 'assets/flap.wav');
    this.load.audio('hit', 'assets/hit.wav');
    this.load.audio('restart', 'assets/restart.wav');
}

function create() {
    bird = this.physics.add.sprite(50, 50, 'bird');
    bird.setCollideWorldBounds(true);

    pipes = this.physics.add.group();
    this.time.addEvent({
        delay: 1500,
        callback: addPipe,
        callbackScope: this,
        loop: true
    });

    cursors = this.input.keyboard.createCursorKeys();

    scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#000' });

    gameOverText = this.add.text(400, 300, 'Game Over', { fontSize: '64px', fill: '#000' });
    gameOverText.setOrigin(0.5);
    gameOverText.setVisible(false);

    this.physics.add.collider(bird, pipes, hitPipe, null, this);

    flapSound = this.sound.add('flap');
    hitSound = this.sound.add('hit');
    restartSound = this.sound.add('restart');
}

function update() {
    if (isGameOver) {
        if (cursors.space.isDown) {
            restartGame();
        }
        return;
    }

    if (cursors.space.isDown) {
        bird.setVelocityY(-350);
        flapSound.play();
    }

    if (bird.y < 0 || bird.y > 600) {
        gameOver();
    }

    pipes.children.iterate(function (pipe) {
        if (pipe.x < -50) {
            pipe.destroy();
        }
    });

    pipes.children.iterate(function (pipe) {
        if (pipe.x + pipe.width < bird.x && !pipe.passed) {
            pipe.passed = true;
            score += 1;
            scoreText.setText('Score: ' + score);
        }
    });
}

function addPipe() {
    let hole = Math.floor(Math.random() * 5) + 1;

    for (let i = 0; i < 10; i++) {
        if (i !== hole && i !== hole + 1) {
            let pipe = pipes.create(800, i * 60, 'pipe'); // Start from the right edge of the screen
            pipe.setVelocityX(-200); // Move to the left
            pipe.body.allowGravity = false;
            pipe.body.immovable = true;
            pipe.passed = false;
        }
    }
}

function hitPipe() {
    hitSound.play();
    gameOver();
}

function gameOver() {
    isGameOver = true;
    bird.setTint(0xff0000);
    bird.setVelocity(0, 0);
    pipes.setVelocityX(0);
    gameOverText.setVisible(true);
}

function restartGame() {
    restartSound.play();
    this.scene.restart();
    score = 0;
    isGameOver = false;
}