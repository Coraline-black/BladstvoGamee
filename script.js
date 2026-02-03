const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

/* === FULL SCREEN === */
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

/* === КАРТИНКИ (В КОРНЕ) === */
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
const bgSpeed = 5;

/* === ДОРОЖКИ (АДАПТИВНЫЕ) === */
function getLanes() {
  return [
    canvas.width * 0.25 - 40,
    canvas.width * 0.5 - 50,
    canvas.width * 0.75 - 60
  ];
}
let currentLane = 1;

/* === ИГРОК === */
const groundY = () => canvas.height * 0.65;
const player = {
  x: 0,
  y: 0,
  w: 110,
  h: 180,
  vy: 0,
  gravity: 1,
  jumpPower: -22,
  onGround: true
};

/* === ИГРА === */
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
    books.push({ y: -50, lane: Math.floor(Math.random() * 3) });
}, 1200);

setInterval(() => {
  if (!gamePaused)
    phones.push({ y: -50, lane: Math.floor(Math.random() * 3) });
}, 3500);

/* === ОБНОВЛЕНИЕ === */
function update() {
  if (gamePaused) return;

  bgY += bgSpeed;
  if (bgY >= canvas.height) bgY = 0;

  runTime += 0.15;

  const lanes = getLanes();
  player.x = lanes[currentLane];
  player.y += player.vy;
  player.vy += player.gravity;

  if (player.y >= groundY()) {
    player.y = groundY();
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
    arr[i].y += 6;

    if (arr[i].lane === currentLane && hit(arr[i])) {
      score += points;
      if (score < 0) score = 0;
      arr.splice(i, 1);

      if (score >= nextPrizeScore) {
        openPrize();
        nextPrizeScore += 50;
      }
    }

    if (arr[i] && arr[i].y > canvas.height + 60) {
      arr.splice(i, 1);
    }
  }
}

/* === ПРИЗ === */
function openPrize() {
  gamePaused = true;
  showPrizeScreen = true;

  const index = prizes.length % 3 + 1;
  currentPrize = images["prize" + index];
  prizes.push(currentPrize);
}

/* === СТОЛКНОВЕНИЕ === */
function hit(o) {
  const x = getLanes()[o.lane];
  return (
    x < player.x + player.w &&
    x + 40 > player.x &&
    o.y < player.y + player.h &&
    o.y + 40 > player.y
  );
}

/* === ОТРИСОВКА === */
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.drawImage(images.corridor, 0, bgY - canvas.height, canvas.width, canvas.height);
  ctx.drawImage(images.corridor, 0, bgY, canvas.width, canvas.height);

  const lanes = getLanes();

  books.forEach(b =>
    ctx.drawImage(images.book, lanes[b.lane], b.y, 40, 40)
  );
  phones.forEach(p =>
    ctx.drawImage(images.phone, lanes[p.lane], p.y, 40, 40)
  );

  const runOffset = Math.sin(runTime) * 6;
  ctx.drawImage(
    images.grandma,
    player.x,
    player.y + runOffset,
    player.w,
    player.h
  );

  ctx.fillStyle = "white";
  ctx.font = "22px Arial";
  ctx.fillText("Очки: " + score, 15, 35);
  ctx.fillText("Рекорд: " + record, 15, 65);

  prizes.forEach((p, i) =>
    ctx.drawImage(p, 15 + i * 50, 90, 45, 45)
  );

  if (showPrizeScreen) {
    ctx.fillStyle = "rgba(0,0,0,0.8)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.drawImage(
      currentPrize,
      canvas.width / 2 - 150,
      canvas.height / 2 - 150,
      300,
      300
    );

    ctx.fillStyle = "white";
    ctx.font = "28px Arial";
    ctx.fillText("Новый приз!", canvas.width / 2 - 90, canvas.height / 2 - 180);
    ctx.font = "22px Arial";
    ctx.fillText("Рекорд: " + record, canvas.width / 2 - 70, canvas.height / 2 + 180);
    ctx.fillText("Нажми, чтобы продолжить", canvas.width / 2 - 150, canvas.height / 2 + 220);
  }
}

/* === ЦИКЛ === */
function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}
loop();
