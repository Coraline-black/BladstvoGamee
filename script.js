const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

/* === КАРТИНКИ (БЕЗ ПАПКИ img) === */
const images = {};
[
  "grandma",
  "corridor",
  "book",
  "phone",
  "chest",
  "prize1",
  "prize2",
  "prize3"
].forEach(name => {
  const img = new Image();
  img.src = name + ".png";
  images[name] = img;
});

/* === ФОН (КОРИДОР) === */
let bgX = 0;
const bgSpeed = 3;

/* === ДОРОЖКИ === */
const lanes = [60, 155, 250];
let currentLane = 1;

/* === ИГРОК === */
const groundY = 420;
const player = {
  x: lanes[currentLane],
  y: groundY,
  w: 70,
  h: 110,
  vy: 0,
  gravity: 1,
  jumpPower: -18,
  onGround: true
};

/* === ИГРОВЫЕ ДАННЫЕ === */
let score = 0;
let books = [];
let phones = [];
let chest = null;
let prizes = [];
let nextChestScore = 50;

/* === ПРЫЖОК === */
function jump() {
  if (player.onGround) {
    player.vy = player.jumpPower;
    player.onGround = false;
  }
}

/* === СВАЙПЫ === */
let startX = 0;
let startY = 0;

canvas.addEventListener("touchstart", e => {
  startX = e.touches[0].clientX;
  startY = e.touches[0].clientY;
});

canvas.addEventListener("touchend", e => {
  const dx = e.changedTouches[0].clientX - startX;
  const dy = e.changedTouches[0].clientY - startY;

  if (Math.abs(dx) > Math.abs(dy)) {
    if (dx > 50 && currentLane < 2) currentLane++;
    if (dx < -50 && currentLane > 0) currentLane--;
  } else {
    if (dy < -50) jump();
  }
});

/* === СПАВН ПРЕДМЕТОВ === */
setInterval(() => {
  books.push({
    x: canvas.width + 40,
    lane: Math.floor(Math.random() * 3)
  });
}, 1500);

setInterval(() => {
  phones.push({
    x: canvas.width + 40,
    lane: Math.floor(Math.random() * 3)
  });
}, 4000);

/* === ОБНОВЛЕНИЕ ИГРЫ === */
function update() {
  bgX -= bgSpeed;
  if (bgX <= -canvas.width) bgX = 0;

  player.x = lanes[currentLane];

  player.y += player.vy;
  player.vy += player.gravity;

  if (player.y >= groundY) {
    player.y = groundY;
    player.vy = 0;
    player.onGround = true;
  }

  handleObjects(books, 1);
  handleObjects(phones, -25);

  if (chest) {
    chest.x -= 5;
    if (checkCollision(chest)) {
      if (prizes.length < 3) {
        prizes.push(images["prize" + (prizes.length + 1)]);
      }
      chest = null;
      nextChestScore += 50;
    }
  }
}

function handleObjects(arr, points) {
  for (let i = arr.length - 1; i >= 0; i--) {
    arr[i].x -= 5;

    if (arr[i].lane === currentLane && checkCollision(arr[i])) {
      score += points;
      if (score < 0) score = 0;
      arr.splice(i, 1);

      if (score >= nextChestScore && !chest) {
        chest = {
          x: canvas.width + 40,
          lane: currentLane
        };
      }
    }

    if (arr[i] && arr[i].x < -50) {
      arr.splice(i, 1);
    }
  }
}

function checkCollision(obj) {
  return (
    obj.x < player.x + player.w &&
    obj.x + 40 > player.x &&
    player.y + player.h > groundY
  );
}

/* === ОТРИСОВКА === */
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.drawImage(images.corridor, bgX, 0, canvas.width, canvas.height);
  ctx.drawImage(images.corridor, bgX + canvas.width, 0, canvas.width, canvas.height);

  ctx.drawImage(images.grandma, player.x, player.y, player.w, player.h);

  books.forEach(b => {
    ctx.drawImage(images.book, b.x, groundY + 40, 40, 40);
  });

  phones.forEach(p => {
    ctx.drawImage(images.phone, p.x, groundY + 40, 40, 40);
  });

  if (chest) {
    ctx.drawImage(images.chest, chest.x, groundY + 30, 50, 50);
  }

  ctx.fillStyle = "white";
  ctx.font = "20px Arial";
  ctx.fillText("Очки: " + score, 10, 30);

  prizes.forEach((p, i) => {
    ctx.drawImage(p, 10 + i * 45, 50, 40, 40);
  });
}

/* === ЦИКЛ === */
function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

gameLoop();
