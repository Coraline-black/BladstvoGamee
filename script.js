const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

/* === КАРТИНКИ === */
const grandmaImg = new Image();
grandmaImg.src = "img/grandma.png";

const corridorImg = new Image();
corridorImg.src = "img/corridor.png";

const bookImg = new Image();
bookImg.src = "img/book.png";

const phoneImg = new Image();
phoneImg.src = "img/phone.png";

const chestImg = new Image();
chestImg.src = "img/chest.png";

const prizeImgs = ["prize1.png", "prize2.png", "prize3.png"].map(n => {
  const img = new Image();
  img.src = "img/" + n;
  return img;
});

/* === КОРИДОР (ФОН) === */
let corridorX = 0;
const corridorSpeed = 3;

/* === 3 ПОЛОСЫ === */
const lanes = [80, 180, 280];
let currentLane = 1;

/* === ИГРОК === */
const groundY = 450;

let player = {
  x: lanes[currentLane],
  y: groundY,
  width: 80,
  height: 120,
  vy: 0,
  gravity: 1,
  jumpPower: -18,
  onGround: true
};

/* === ИГРА === */
let score = 0;
let books = [];
let phones = [];
let chest = null;

/* === ПРИЗЫ === */
let prizesOpened = [];
let nextPrizeScore = 50;

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

/* === КЛАВИАТУРА === */
document.addEventListener("keydown", e => {
  if (e.code === "ArrowLeft" && currentLane > 0) currentLane--;
  if (e.code === "ArrowRight" && currentLane < 2) currentLane++;
  if (e.code === "Space") jump();
});

/* === СПАВН УЧЕБНИКОВ === */
setInterval(() => {
  books.push({
    x: canvas.width,
    lane: Math.floor(Math.random() * 3),
    size: 40
  });
}, 1500);

/* === СПАВН ТЕЛЕФОНОВ === */
setInterval(() => {
  phones.push({
    x: canvas.width,
    lane: Math.floor(Math.random() * 3),
    size: 40
  });
}, 4000);

/* === ОБНОВЛЕНИЕ === */
function update() {
  /* Движение коридора */
  corridorX -= corridorSpeed;
  if (corridorX <= -canvas.width) corridorX = 0;

  /* Позиция по полосе */
  player.x = lanes[currentLane];

  /* Прыжок */
  player.y += player.vy;
  player.vy += player.gravity;

  if (player.y >= groundY) {
    player.y = groundY;
    player.vy = 0;
    player.onGround = true;
  }

  handleObjects(books, 1);
  handleObjects(phones, -25);

  /* Сундук */
  if (chest) {
    chest.x -= 6;
    if (collide(chest)) {
      const index = prizesOpened.length;
      if (index < prizeImgs.length) {
        prizesOpened.push(prizeImgs[index]);
        nextPrizeScore += 50;
      }
      chest = null;
    }
  }
}

/* === ОБЪЕКТЫ === */
function handleObjects(arr, points) {
  for (let i = arr.length - 1; i >= 0; i--) {
    arr[i].x -= 6;
    arr[i].y = groundY + 40;

    if (arr[i].lane === currentLane && collide(arr[i])) {
      arr.splice(i, 1);
      score += points;
      if (score < 0) score = 0;

      if (score >= nextPrizeScore && !chest) {
        chest = {
          x: canvas.width,
          lane: currentLane,
          size: 60
        };
      }
    }
  }
}

/* === СТОЛКНОВЕНИЕ === */
function collide(obj) {
  return (
    obj.x < player.x + player.width &&
    obj.x + obj.size > player.x &&
    obj.y < player.y + player.height &&
    obj.y + obj.size > player.y
  );
}

/* === ОТРИСОВКА === */
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  /* Коридор */
  ctx.drawImage(corridorImg, corridorX, 0, canvas.width, canvas.height);
  ctx.drawImage(corridorImg, corridorX + canvas.width, 0, canvas.width, canvas.height);

  /* Бабушка */
  ctx.drawImage(grandmaImg, player.x, player.y, player.width, player.height);

  /* Учебники */
  books.forEach(b => {
    ctx.drawImage(bookImg, b.x, groundY + 40, b.size, b.size);
  });

  /* Телефоны */
  phones.forEach(p => {
    ctx.drawImage(phoneImg, p.x, groundY + 40, p.size, p.size);
  });

  /* Сундук */
  if (chest) {
    ctx.drawImage(chestImg, chest.x, groundY + 20, chest.size, chest.size);
  }

  /* Очки */
  ctx.fillStyle = "#fff";
  ctx.font = "20px Arial";
  ctx.fillText("Очки: " + score, 20, 30);

  /* Призы */
  prizesOpened.forEach((img, i) => {
    ctx.drawImage(img, 20 + i * 45, 50, 40, 40);
  });
}

/* === ЦИКЛ === */
function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}
gameLoop();
