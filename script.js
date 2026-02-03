const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

/* === КАРТИНКИ === */
const imgs = {};
[
  "grandma","corridor","book","phone","chest",
  "prize1","prize2","prize3"
].forEach(name => {
  const img = new Image();
  img.src = "img/" + name + ".png";
  imgs[name] = img;
});

/* === КОРИДОР === */
let bgX = 0;
const bgSpeed = 3;

/* === ПОЛОСЫ === */
const lanes = [70, 160, 250];
let lane = 1;

/* === ИГРОК === */
const ground = 420;
const player = {
  x: lanes[lane],
  y: ground,
  w: 70,
  h: 110,
  vy: 0,
  g: 1,
  jump: -18,
  onGround: true
};

/* === ИГРА === */
let score = 0;
let books = [];
let phones = [];
let chest = null;
let prizes = [];
let nextPrize = 50;

/* === ПРЫЖОК === */
function jump() {
  if (player.onGround) {
    player.vy = player.jump;
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
  const dx = e.changedTouches[0].clientX - sx;
  const dy = e.changedTouches[0].clientY - sy;
  if (Math.abs(dx) > Math.abs(dy)) {
    if (dx > 50 && lane < 2) lane++;
    if (dx < -50 && lane > 0) lane--;
  } else if (dy < -50) jump();
});

/* === СПАВН === */
setInterval(() => {
  books.push({ x: 360, lane: Math.floor(Math.random()*3) });
}, 1500);

setInterval(() => {
  phones.push({ x: 360, lane: Math.floor(Math.random()*3) });
}, 4000);

/* === ОБНОВЛЕНИЕ === */
function update() {
  bgX -= bgSpeed;
  if (bgX <= -360) bgX = 0;

  player.x = lanes[lane];
  player.y += player.vy;
  player.vy += player.g;

  if (player.y >= ground) {
    player.y = ground;
    player.vy = 0;
    player.onGround = true;
  }

  handleObjects(books, 1);
  handleObjects(phones, -25);

  if (chest) {
    chest.x -= 5;
    if (hit(chest)) {
      const i = prizes.length;
      if (i < 3) prizes.push(imgs["prize"+(i+1)]);
      chest = null;
      nextPrize += 50;
    }
  }
}

function handleObjects(arr, pts) {
  for (let i = arr.length-1; i>=0; i--) {
    arr[i].x -= 5;
    if (arr[i].lane === lane && hit(arr[i])) {
      score += pts;
      if (score < 0) score = 0;
      arr.splice(i,1);
      if (score >= nextPrize && !chest) {
        chest = { x: 360, lane: lane };
      }
    }
  }
}

function hit(o) {
  return (
    o.x < player.x + player.w &&
    o.x + 40 > player.x &&
    ground < player.y + player.h
  );
}

/* === ОТРИСОВКА === */
function draw() {
  ctx.clearRect(0,0,360,600);

  ctx.drawImage(imgs.corridor, bgX, 0, 360, 600);
  ctx.drawImage(imgs.corridor, bgX+360, 0, 360, 600);

  ctx.drawImage(imgs.grandma, player.x, player.y, player.w, player.h);

  books.forEach(b =>
    ctx.drawImage(imgs.book, b.x, ground+40, 40,40)
  );

  phones.forEach(p =>
    ctx.drawImage(imgs.phone, p.x, ground+40, 40,40)
  );

  if (chest)
    ctx.drawImage(imgs.chest, chest.x, ground+30, 50,50);

  ctx.fillStyle="white";
  ctx.font="20px Arial";
  ctx.fillText("Очки: "+score, 10,30);

  prizes.forEach((p,i)=>
    ctx.drawImage(p, 10+i*45, 50, 40,40)
  );
}

/* === ЦИКЛ === */
function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}
loop();
