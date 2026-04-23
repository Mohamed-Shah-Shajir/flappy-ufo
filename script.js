const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 360;
canvas.height = 640;

// IMAGES
const ufoImg = new Image();
ufoImg.src = "assets/ufo.png";

const coinImg = new Image();
coinImg.src = "assets/coin.png";

const bgImg = new Image();
bgImg.src = "assets/bg.png";

// SOUNDS
const coinSound = document.getElementById("coinSound");
const dieSound = document.getElementById("dieSound");

// GAME STATE
let gameStarted = false;
let gameOver = false;
let score = 0;

// UFO (PLAYER)
let ufo = {
  x: 60,
  y: 200,
  w: 50,
  h: 40,
  gravity: 0.5,
  lift: -9,
  velocity: 0
};

// PIPES
let pipes = [];

// COINS
let coins = [];

// CONTROLS
function handleInput() {
  if (gameOver) {
    location.reload();
    return;
  }

  if (!gameStarted) {
    gameStarted = true;
  }

  ufo.velocity = ufo.lift;
}

document.addEventListener("touchstart", handleInput);
document.addEventListener("click", handleInput);

// CREATE PIPES + COINS
function createPipe() {
  let gap = 160;
  let top = Math.random() * 300 + 50;

  pipes.push({
    x: canvas.width,
    top: top,
    bottom: top + gap,
    width: 60,
    passed: false
  });

  coins.push({
    x: canvas.width + 30,
    y: top + gap / 2 - 15,
    size: 30,
    collected: false
  });
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

  // UFO PHYSICS
  ufo.velocity += ufo.gravity;
  ufo.y += ufo.velocity;

  ctx.drawImage(ufoImg, ufo.x, ufo.y, ufo.w, ufo.h);

  // PIPES
  for (let i = 0; i < pipes.length; i++) {
    let p = pipes[i];
    p.x -= 2.5;

    ctx.fillStyle = "green";
    ctx.fillRect(p.x, 0, p.width, p.top);
    ctx.fillRect(p.x, p.bottom, p.width, canvas.height);

    // SCORE (pass pipe)
    if (!p.passed && p.x + p.width < ufo.x) {
      p.passed = true;
      score++;
    }

    // COLLISION
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
    c.x -= 2.5;

    if (!c.collected) {
      ctx.drawImage(coinImg, c.x, c.y, c.size, c.size);
    }

    if (
      !c.collected &&
      ufo.x < c.x + c.size &&
      ufo.x + ufo.w > c.x &&
      ufo.y < c.y + c.size &&
      ufo.y + ufo.h > c.y
    ) {
      c.collected = true;
      score += 2; // bonus
      coinSound.play();
    }
  }

  // GROUND / SKY COLLISION
  if (ufo.y + ufo.h >= canvas.height || ufo.y <= 0) {
    die();
  }

  // SCORE DISPLAY
  ctx.fillStyle = "white";
  ctx.font = "22px Arial";
  ctx.fillText("Score: " + score, 20, 40);

  // GAME OVER SCREEN
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

// DIE
function die() {
  if (!gameOver) {
    gameOver = true;
    dieSound.play();
  }
}

// SPAWN LOOP
setInterval(() => {
  if (gameStarted && !gameOver) {
    createPipe();
  }
}, 1800);

// START GAME
update();