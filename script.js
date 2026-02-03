const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

/* === КАРТИНКИ === */
const images = {};
[
  "grandma","corridor","book","phone",
  "prize1","prize2","prize3"
].forEach(name => {
  const img = new Image();
  img.src = name + ".png";
  images[name] = img;
});

/* === ФОН (ВНИЗ) === */
let bgY = 0;
const bgSpeed = 4;

/* === ДОРОЖКИ === */
const lanes = [60, 155, 250];
let currentLane = 1;

/* === ИГРОК === */
const groundY = 380;
const player = {
  x: lanes[currentLane],
  y: groundY,
  w: 100,
  h: 160,
  vy: 0,
  gravity: 1,
  jumpPower: -20,
  onGround: true
};

/* === ИГРОВЫЕ ДАННЫЕ === */
let score = 0;
let record = Number(localStorage.getItem("record")) || 0;

let books = [];
let phones = [];

let prizes = [];
let nextPrizeScore = 50;

let showPrizeScreen = false;
let gamePaused = false;
let currentPrize = null;

let runTime = 0;

/* === ПРЫЖОК === */
function jump() {
  if (player.onGround && !gamePaused) {
    player.vy = player.jumpPower;
    player.onGround = false;
  }
}

/* === СВАЙПЫ === */
let sx = 0, sy = 0;

canvas.addEventListener("touchstart", e => {
  sx = e.touches[0].clientX;
  sy = e.touches[0].clientY;
});

canvas.addEventListener("touchend", e => {
  if (showPrizeScreen) {
    showPrizeScreen = false;
    gamePaused = false;
    return;
  }

  const dx = e.changedTouches[0].clientX - sx;
  const dy = e.changedTouches[0].clientY - sy;

  if (Math.abs(dx) > Math.abs(dy)) {
    if (dx > 50 && currentLane < 2) currentLane++;
    if (dx < -50 && currentLane > 0) currentLane--;
  } else if (dy < -50) {
    jump();
  }
});

/* === СПАВН === */
setInterval(() => {
  if (!gamePaused)
    books.push({ y: -40, lane: Math.floor(Math.random() * 3) });
}, 1200);

setInterval(() => {
  if (!gamePaused)
    phones.push({ y: -40, lane: Math.floor(Math.random() * 3) });
}, 3500);

/* === ОБНОВЛЕНИЕ === */
function update() {
  if (gamePaused) return;

  bgY += bgSpeed;
  if (bgY >= canvas.height) bgY = 0;

  runTime += 0.15;
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

  if (score > record) {
    record = score;
    localStorage.setItem("record", record);
  }
}

function handleObjects(arr, points) {
  for (let i = arr.length - 1; i >= 0; i--) {
    arr[i].y += 5;

    if (arr[i].lane === currentLane && hit(arr[i])) {
      score += points;
      if (score < 0) score = 0;
      arr.splice(i, 1);

      if (score >= nextPrizeScore) {
        openPrize();
        nextPrizeScore += 50;
      }
    }

    if (arr[i] && arr[i].y > canvas.height + 50) {
      arr.splice(i, 1);
    }
  }
}

/* === ПРИЗ === */
function openPrize() {
  gamePaused = true;
  showPrizeScreen = true;

  const prizeIndex = prizes.length % 3 + 1;
  currentPrize = images["prize" + prizeIndex];
  prizes.push(currentPrize);
}

/* === СТОЛКНОВЕНИЕ === */
function hit(o) {
  return (
    lanes[o.lane] < player.x + player.w &&
    lanes[o.lane] + 40 > player.x &&
    o.y < player.y + player.h &&
    o.y + 40 > player.y
  );
}

/* === ОТРИСОВКА === */
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.drawImage(images.corridor, 0, bgY - canvas.height, canvas.width, canvas.height);
  ctx.drawImage(images.corridor, 0, bgY, canvas.width, canvas.height);

  books.forEach(b =>
    ctx.drawImage(images.book, lanes[b.lane], b.y, 40, 40)
  );
  phones.forEach(p =>
    ctx.drawImage(images.phone, lanes[p.lane], p.y, 40, 40)
  );

  const runOffset = Math.sin(runTime) * 5;
  ctx.drawImage(
    images.grandma,
    player.x,
    player.y + runOffset,
    player.w,
    player.h
  );

  ctx.fillStyle = "white";
  ctx.font = "20px Arial";
  ctx.fillText("Очки: " + score, 10, 30);
  ctx.fillText("Рекорд: " + record, 10, 55);

  prizes.forEach((p, i) =>
    ctx.drawImage(p, 10 + i * 45, 80, 40, 40)
  );

  if (showPrizeScreen) {
    ctx.fillStyle = "rgba(0,0,0,0.75)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.drawImage(currentPrize, 80, 180, 200, 200);

    ctx.fillStyle = "white";
    ctx.font = "26px Arial";
    ctx.fillText("Новый приз!", 85, 150);
    ctx.font = "20px Arial";
    ctx.fillText("Рекорд: " + record, 100, 410);
    ctx.fillText("Нажми, чтобы продолжить", 35, 450);
  }
}

/* === ЦИКЛ === */
function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}
loop();
