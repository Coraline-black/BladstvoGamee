const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

/* === КАРТИНКИ (БЕЗ ПАПКИ) === */
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

/* === ФОН (КОРИДОР ВНИЗ) === */
let bgY = 0;
const bgSpeed = 4;

/* === ДОРОЖКИ === */
const lanes = [60, 155, 250];
let currentLane = 1;

/* === ИГРОК (БОЛЬШАЯ БАБУШКА) === */
const groundY = 380;
const player = {
  x: lanes[currentLane],
  y: groundY,
  w: 100,   // шире
  h: 160,   // выше
  vy: 0,
  gravity: 1,
  jumpPower: -20,
  onGround: true
};

/* === ИГРОВЫЕ ДАННЫЕ === */
let score = 0;
let books = [];
let phones = [];
let chest = null;
let prizes = [];
let nextChestScore = 50;

/* === ЛЁГКАЯ АНИМАЦИЯ БЕГА === */
let runTime = 0;

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
    y: -40,
    lane: Math.floor(Math.random() * 3)
  });
}, 1200);

setInterval(() => {
  phones.push({
    y: -40,
    lane: Math.floor(Math.random() * 3)
  });
}, 3500);

/* === ОБНОВЛЕНИЕ === */
function update() {
  // движение коридора вниз
  bgY += bgSpeed;
  if (bgY >= canvas.height) bgY = 0;

  // бег
  runTime += 0.15;

  // позиция игрока
  player.x = lanes[currentLane];

  // прыжок
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
    chest.y += 5;
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
    arr[i].y += 5;

    if (arr[i].lane === currentLane && checkCollision(arr[i])) {
      score += points;
      if (score < 0) score = 0;
      arr.splice(i, 1);

      if (score >= nextChestScore && !chest) {
        chest = {
          y: -50,
          lane: currentLane
        };
      }
    }

    if (arr[i] && arr[i].y > canvas.height + 50) {
      arr.splice(i, 1);
    }
  }
}

function checkCollision(obj) {
  return (
    lanes[obj.lane] < player.x + player.w &&
    lanes[obj.lane] + 40 > player.x &&
    obj.y < player.y + player.h &&
    obj.y + 40 > player.y
  );
}

/* === ОТРИСОВКА === */
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // коридор (движется вниз)
  ctx.drawImage(images.corridor, 0, bgY - canvas.height, canvas.width, canvas.height);
  ctx.drawImage(images.corridor, 0, bgY, canvas.width, canvas.height);

  // предметы
  books.forEach(b => {
    ctx.drawImage(images.book, lanes[b.lane], b.y, 40, 40);
  });

  phones.forEach(p => {
    ctx.drawImage(images.phone, lanes[p.lane], p.y, 40, 40);
  });

  if (chest) {
    ctx.drawImage(images.chest, lanes[chest.lane], chest.y, 50, 50);
  }

  // бабушка (эффект бега)
  const runOffset = Math.sin(runTime) * 5;
  ctx.drawImage(
    images.grandma,
    player.x,
    player.y + runOffset,
    player.w,
    player.h
  );

  // очки
  ctx.fillStyle = "white";
  ctx.font = "20px Arial";
  ctx.fillText("Очки: " + score, 10, 30);

  // призы
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
