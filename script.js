const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

/* === АДАПТИВНЫЙ FULLSCREEN === */
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

/* === КАРТИНКИ === */
const images = {};
["grandma","corridor","book","phone","prize1","prize2","prize3"].forEach(name=>{
  const img = new Image();
  img.src = name+".png";
  images[name] = img;
});

/* === ИГРОК === */
let groundY; // будет вычисляться при resize
const player = {
  x: 0,
  y: 0,
  w: 0,
  h: 0,
  vy: 0,
  gravity: 1,
  jumpPower: 0,
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
let bgY = 0;
const bgSpeed = 5;

/* === ИНИЦИАЛИЗАЦИЯ РАЗМЕРОВ === */
function initSizes() {
  groundY = canvas.height*0.65;
  player.w = canvas.width*0.18;
  player.h = canvas.height*0.25;
  player.x = canvas.width*0.5 - player.w/2;
  player.y = groundY;
  player.jumpPower = -canvas.height*0.035;
}
initSizes();
window.addEventListener("resize", initSizes);

/* === ДОРОЖКИ === */
function getLanes() {
  return [
    canvas.width*0.2,
    canvas.width*0.5 - player.w/2,
    canvas.width*0.8 - player.w
  ];
}
let currentLane = 1;

/* === ПРЫЖОК === */
function jump() {
  if(player.onGround && !gamePaused){
    player.vy = player.jumpPower;
    player.onGround = false;
  }
}

/* === СВАЙП === */
let sx=0, sy=0;
canvas.addEventListener("touchstart", e=>{
  sx=e.touches[0].clientX;
  sy=e.touches[0].clientY;
});
canvas.addEventListener("touchend", e=>{
  if(showPrizeScreen){
    showPrizeScreen=false;
    gamePaused=false;
    return;
  }
  const dx = e.changedTouches[0].clientX-sx;
  const dy = e.changedTouches[0].clientY-sy;
  if(Math.abs(dx)>Math.abs(dy)){
    if(dx>50 && currentLane<2) currentLane++;
    if(dx<-50 && currentLane>0) currentLane--;
  } else if(dy<-50){
    jump();
  }
});

/* === СПАВН === */
setInterval(()=>{if(!gamePaused) books.push({y:-50,lane:Math.floor(Math.random()*3)});},1200);
setInterval(()=>{if(!gamePaused) phones.push({y:-50,lane:Math.floor(Math.random()*3)});},3500);

/* === ОБНОВЛЕНИЕ === */
function update(){
  if(gamePaused) return;
  bgY+=bgSpeed;
  if(bgY>=canvas.height) bgY=0;
  runTime+=0.15;

  const lanes=getLanes();
  player.x=lanes[currentLane];
  player.y+=player.vy;
  player.vy+=player.gravity;

  if(player.y>=groundY){
    player.y=groundY;
    player.vy=0;
    player.onGround=true;
  }

  handleObjects(books,1);
  handleObjects(phones,-25);

  if(score>record){
    record=score;
    localStorage.setItem("record",record);
  }
}

function handleObjects(arr,points){
  for(let i=arr.length-1;i>=0;i--){
    arr[i].y+=canvas.height*0.008;
    if(arr[i].lane===currentLane && hit(arr[i])){
      score+=points;
      if(score<0) score=0;
      arr.splice(i,1);
      if(score>=nextPrizeScore) openPrize();
    }
    if(arr[i] && arr[i].y>canvas.height+50) arr.splice(i,1);
  }
}

function openPrize(){
  gamePaused=true;
  showPrizeScreen=true;
  const idx=prizes.length%3+1;
  currentPrize=images["prize"+idx];
  prizes.push(currentPrize);
  nextPrizeScore+=50;
}

function hit(o){
  const x=getLanes()[o.lane];
  return (x<player.x+player.w && x+canvas.width*0.08>player.x && o.y<player.y+player.h && o.y+canvas.height*0.08>player.y);
}

/* === ОТРИСОВКА === */
function draw(){
  ctx.clearRect(0,0,canvas.width,canvas.height);

  ctx.drawImage(images.corridor,0,bgY-canvas.height,canvas.width,canvas.height);
  ctx.drawImage(images.corridor,0,bgY,canvas.width,canvas.height);

  const lanes=getLanes();

  books.forEach(b=>ctx.drawImage(images.book,lanes[b.lane],b.y,canvas.width*0.08,canvas.height*0.08));
  phones.forEach(p=>ctx.drawImage(images.phone,lanes[p.lane],p.y,canvas.width*0.08,canvas.height*0.08));

  const runOffset=Math.sin(runTime)*canvas.height*0.005;
  ctx.drawImage(images.grandma,player.x,player.y+runOffset,player.w,player.h);

  ctx.fillStyle="white";
  ctx.font=`${canvas.height*0.03}px Arial`;
  ctx.fillText("Очки: "+score,canvas.width*0.02,canvas.height*0.05);
  ctx.fillText("Рекорд: "+record,canvas.width*0.02,canvas.height*0.09);

  prizes.forEach((p,i)=>ctx.drawImage(p,canvas.width*0.02+i*canvas.width*0.12,canvas.height*0.12,canvas.width*0.1,canvas.width*0.1));

  if(showPrizeScreen){
    ctx.fillStyle="rgba(0,0,0,0.85)";
    ctx.fillRect(0,0,canvas.width,canvas.height);

    ctx.drawImage(currentPrize,canvas.width/2-150,canvas.height/2-150,300,300);
    ctx.fillStyle="white";
    ctx.font=`${canvas.height*0.04}px Arial`;
    ctx.fillText("Новый приз!",canvas.width/2-100,canvas.height/2-180);
    ctx.font=`${canvas.height*0.03}px Arial`;
    ctx.fillText("Рекорд: "+record,canvas.width/2-70,canvas.height/2+180);
    ctx.fillText("Нажми, чтобы продолжить",canvas.width/2-150,canvas.height/2+220);
  }
}

/* === ЦИКЛ === */
function loop(){update();draw();requestAnimationFrame(loop);}
loop();
