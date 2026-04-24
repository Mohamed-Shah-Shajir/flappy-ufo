const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 360;
canvas.height = 640;

// IMAGES
const ufoImg = new Image();
ufoImg.src = "assets/ufo.png";

const bgImg = new Image();
bgImg.src = "assets/bg.png";

const coinImg = new Image();
coinImg.src = "assets/coin.png";

// COIN SPRITE (AUTO FIX WIDTH)
let coinFrameWidth = 0;
let coinFrameHeight = 0;
const totalFrames = 8;

let coinFrame = 0;
let frameTimer = 0;

// once image loads → calculate frame width
coinImg.onload = () => {
  coinFrameWidth = coinImg.width / totalFrames;
  coinFrameHeight = coinImg.height;
};

// SOUNDS
const coinSound = document.getElementById("coinSound");
const dieSound = document.getElementById("dieSound");

// GAME STATE
let gameStarted = false;
let gameOver = false;
let score = 0;

// UFO
let ufo = {
  x: 60,
  y: 200,
  w: 70,
  h: 55,
  gravity: 0.3,
  lift: -6.5,
  velocity: 0
};

// PIPES
let pipes = [];

// COINS
let coins = [];

// INPUT
function handleInput() {
  if (gameOver) {
    location.reload();
    return;
  }

  if (!gameStarted) gameStarted = true;

  ufo.velocity = ufo.lift;
}

document.addEventListener("touchstart", handleInput);
document.addEventListener("click", handleInput);

// CREATE PIPES (BIG GAP)
function createPipe() {
  let gap = 190; // increased gap
  let top = Math.random() * 220 + 50;

  pipes.push({
    x: canvas.width,
    top: top,
    bottom: top + gap,
    width: 65,
    passed: false,
    speed: 2
  });

  coins.push({
    x: canvas.width + 30,
    y: top + gap / 2 - 15,
    size: 35,
    collected: false
  });
}

// DRAW PIPE
function drawPipe(x, y, width, height) {
  ctx.fillStyle = "#2ecc71";
  ctx.fillRect(x, y, width, height);

  ctx.fillStyle = "#27ae60";
  ctx.fillRect(x - 5, y + height - 10, width + 10, 10);
}

// GAME LOOP
function update() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // BACKGROUND
  ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

  // START SCREEN
  if (!gameStarted) {
    ctx.fillStyle = "white";
    ctx.font = "28px Arial";
    ctx.textAlign = "center";

    ctx.fillText("UFO Flappy", canvas.width / 2, 200);
    ctx.font = "18px Arial";
    ctx.fillText("Tap to Start", canvas.width / 2, 240);

    ctx.drawImage(ufoImg, ufo.x, ufo.y, ufo.w, ufo.h);
    requestAnimationFrame(update);
    return;
  }

  // COIN ANIMATION
  frameTimer++;
  if (frameTimer % 6 === 0) {
    coinFrame = (coinFrame + 1) % totalFrames;
  }

  // UFO PHYSICS
  ufo.velocity += ufo.gravity;
  ufo.y += ufo.velocity;

  let angle = Math.min(Math.max(ufo.velocity * 3, -20), 30);
  ctx.save();
  ctx.translate(ufo.x + ufo.w / 2, ufo.y + ufo.h / 2);
  ctx.rotate(angle * Math.PI / 180);
  ctx.drawImage(ufoImg, -ufo.w / 2, -ufo.h / 2, ufo.w, ufo.h);
  ctx.restore();

  // PIPES
  for (let i = 0; i < pipes.length; i++) {
    let p = pipes[i];
    p.x -= p.speed;

    drawPipe(p.x, 0, p.width, p.top);
    drawPipe(p.x, p.bottom, p.width, canvas.height - p.bottom);

    if (!p.passed && p.x + p.width < ufo.x) {
      p.passed = true;
      score++;
    }

    if (
      ufo.x < p.x + p.width &&
      ufo.x + ufo.w > p.x &&
      (ufo.y < p.top || ufo.y + ufo.h > p.bottom)
    ) {
      die();
    }
  }

  // COINS
  for (let i = 0; i < coins.length; i++) {
    let c = coins[i];
    c.x -= 2;

    if (!c.collected && coinFrameWidth > 0) {
      ctx.drawImage(
        coinImg,
        coinFrame * coinFrameWidth,
        0,
        coinFrameWidth,
        coinFrameHeight,
        c.x,
        c.y,
        c.size,
        c.size
      );
    }

    if (
      !c.collected &&
      ufo.x < c.x + c.size &&
      ufo.x + ufo.w > c.x &&
      ufo.y < c.y + c.size &&
      ufo.y + ufo.h > c.y
    ) {
      c.collected = true;
      score += 2;

      coinSound.currentTime = 0;
      coinSound.play();
    }
  }

  // COLLISION (GROUND / SKY)
  if (ufo.y + ufo.h >= canvas.height || ufo.y <= 0) {
    die();
  }

  // SCORE
  ctx.fillStyle = "white";
  ctx.font = "22px Arial";
  ctx.fillText("Score: " + score, 20, 40);

  // GAME OVER
  if (gameOver) {
    ctx.fillStyle = "red";
    ctx.font = "28px Arial";
    ctx.textAlign = "center";

    ctx.fillText("Game Over", canvas.width / 2, 300);
    ctx.font = "18px Arial";
    ctx.fillText("Tap to Restart", canvas.width / 2, 340);
    return;
  }

  requestAnimationFrame(update);
}

// DIE (FIX SOUND OVERLAP)
function die() {
  if (!gameOver) {
    gameOver = true;

    coinSound.pause();
    coinSound.currentTime = 0;

    dieSound.play();
  }
}

// SPAWN LOOP (5 SECONDS)
setInterval(() => {
  if (gameStarted && !gameOver) {
    createPipe();
  }
}, 5000);

// START
update();