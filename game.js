const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// ---------- DURUM ----------
let score = 0;
let gameOver = false;
let showSettings = false;
let glowTime = 0;
let invincibleTime = 0;
let speed = 3;
let timeOfDay = 0; // 0=gündüz, 1=akşam, 2=gece
let timeCounter = 0;

// ---------- GÖRSELLER ----------
const eraImg = new Image(); eraImg.src = "era7.png";
const ritimImg = new Image(); ritimImg.src = "ritim.png";
const powerSound = new Audio("guc.mp3");

// ---------- KARAKTERLER ----------
const player = { x:200, y:300, w:70, h:70, vy:0 };
const ritim  = { x:80, y:300, w:60, h:60 };

// ---------- NESNELER ----------
let pipes = [];
let mic = null;
let birds = Array.from({length:4},()=>({x:Math.random()*800,y:100+Math.random()*120}));
let plane = {x:-150,y:140};

// ---------- STATİK DAĞLAR ----------
const staticPeaks = [
  {x1:0,y1:420,x2:150,y2:250,x3:300,y3:420},
  {x1:250,y1:420,x2:450,y2:220,x3:650,y3:420},
  {x1:600,y1:420,x2:750,y2:300,x3:900,y3:420}
];

// ---------- BUTON ----------
const settingsBtn = {x:700,y:10,w:80,h:40};

// ---------- YARDIMCI ----------
function hit(o){ return {x:o.x+18,y:o.y+18,w:o.w-36,h:o.h-36}; }
function collide(a,b){ return a.x<b.x+b.w && a.x+a.w>b.x && a.y<b.y+b.h && a.y+a.h>b.y; }

// ---------- INPUT ----------
canvas.onclick = e=>{
  const x=e.offsetX, y=e.offsetY;
  if(x>settingsBtn.x && y>settingsBtn.y && x<settingsBtn.x+settingsBtn.w && y<settingsBtn.y+settingsBtn.h){
    showSettings = !showSettings; return;
  }
  if(showSettings){
    if(x>300 && x<500 && y>260 && y<300) speed=2;
    if(x>300 && x<500 && y>310 && y<350) speed=3;
    if(x>300 && x<500 && y>360 && y<400) speed=4;
    return;
  }
  if(!gameOver) player.vy=-7;
  else location.reload();
};

// ---------- ENGEL ----------
function spawnPipe(){
  const h = Math.random()*120+140;
  pipes.push({x:800,top:h,passed:false});
}

// ---------- GÜN ZAMANLAMASI ----------
function updateTime(){
  timeCounter++;
  if(timeCounter>600){ // 10 saniye per day/night
    timeCounter=0;
    timeOfDay=(timeOfDay+1)%3;
  }
}

// ---------- UPDATE ----------
function update(frame){
  if(gameOver) return;

  player.vy += 0.35;
  player.y += player.vy;
  if(player.y<0) player.y=0;
  if(player.y+player.h>600 && invincibleTime<=0) gameOver=true;

  updateTime();

  // kaktüs spawn
  if(frame%120===0 && pipes.length<6) spawnPipe();

  pipes.forEach((p,i)=>{
    p.x -= speed;
    const GAP=260;
    const top={x:p.x,y:0,w:90,h:p.top};
    const bot={x:p.x,y:p.top+GAP,w:90,h:600};

    if(invincibleTime<=0 && (collide(hit(player),top)||collide(hit(player),bot))) gameOver=true;

    if(!p.passed && p.x+90<player.x){
      score++; p.passed=true;
    }

    if(p.x+90<0) pipes.splice(i,1);
  });

  // ALTIN MİKROFON
  if(score===5 && !mic) mic={x:800,y:220,w:40,h:40};
  if(mic){
    mic.x -= speed;
    if(collide(hit(player),mic)){
      powerSound.currentTime=0; powerSound.play();
      glowTime=300; invincibleTime=240; // 4 saniye ölümsüzlük
      mic=null;
    }
  }

  // RİTİM TAKİP
  if(ritim.x<player.x-110) ritim.x+=1.2;
  ritim.y += (player.y-ritim.y)*0.02;

  if(glowTime>0) glowTime--;
  if(invincibleTime>0) invincibleTime--;
}

// ---------- ARKA PLAN ----------
function drawBackground(){
  // gökyüzü
  let skyColors = [["#8ec5fc","#e0f2fe"],["#fbbf24","#f97316"],["#0f172a","#1e293b"]];
  let g = ctx.createLinearGradient(0,0,0,600);
  g.addColorStop(0,skyColors[timeOfDay][0]);
  g.addColorStop(1,skyColors[timeOfDay][1]);
  ctx.fillStyle=g; ctx.fillRect(0,0,800,600);

  // statik dağlar
  staticPeaks.forEach(p=>{
    ctx.fillStyle = (timeOfDay===2)?"#94a3b8":"#2f855a";
    ctx.beginPath(); ctx.moveTo(p.x1,p.y1); ctx.lineTo(p.x2,p.y2); ctx.lineTo(p.x3,p.y3); ctx.fill();

    // tepede kar
    ctx.fillStyle="#fff";
    ctx.beginPath();
    ctx.moveTo(p.x2-20,p.y2); ctx.lineTo(p.x2,p.y2-20); ctx.lineTo(p.x2+20,p.y2); ctx.closePath(); ctx.fill();
  });

  // kuşlar
  birds.forEach(b=>{b.x+=1; if(b.x>820)b.x=-20;
    ctx.strokeStyle="#000";
    ctx.beginPath();
    ctx.moveTo(b.x,b.y); ctx.lineTo(b.x+10,b.y-5); ctx.lineTo(b.x+20,b.y); ctx.stroke();
  });

  // uçak
  plane.x+=2; if(plane.x>900) plane.x=-150;
  ctx.fillStyle="#f8fafc";
  ctx.beginPath();
  ctx.moveTo(plane.x,plane.y);
  ctx.lineTo(plane.x+60,plane.y-6)
  ctx.lineTo(plane.x+95,plane.y)
  ctx.lineTo(plane.x+60,plane.y+6)
  ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(plane.x+35,plane.y);
  ctx.lineTo(plane.x+15,plane.y-18);
  ctx.lineTo(plane.x+40,plane.y-6); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(plane.x+35,plane.y);
  ctx.lineTo(plane.x+15,plane.y+18);
  ctx.lineTo(plane.x+40,plane.y+6); ctx.closePath(); ctx.fill();

  // zemin
  ctx.fillStyle="#22c55e"; ctx.fillRect(0,520,800,80);
}

// ---------- DRAW ----------
function draw(){
  drawBackground();

  // KAKTÜSLER
  let cactusColor = ["#16a34a","#3b82f6","#f59e0b"][timeOfDay];
  ctx.fillStyle=cactusColor;
  pipes.forEach(p=>{
    const GAP=260;
    ctx.fillRect(p.x,0,90,p.top);
    ctx.fillRect(p.x,p.top+GAP,90,600);
  });

  // ALTIN MİKROFON
  if(mic){
    ctx.fillStyle="gold"; ctx.beginPath();
    ctx.arc(mic.x+20,mic.y+20,20,0,Math.PI*2); ctx.fill();
    ctx.fillStyle="#000"; ctx.fillText("🎤",mic.x+8,mic.y+28);
  }

  // ERA7 PARLAMA
  if(glowTime>0){ ctx.save(); ctx.shadowColor="gold"; ctx.shadowBlur=25; ctx.drawImage(eraImg,player.x,player.y,70,70); ctx.restore(); }
  else ctx.drawImage(eraImg,player.x,player.y,70,70);

  // RİTİM
  ctx.drawImage(ritimImg,ritim.x,ritim.y,60,60);

  // SKOR
  ctx.fillStyle="#000"; ctx.font="bold 36px Arial"; ctx.fillText(score,380,50);

  // AYAR BUTONU
  ctx.fillStyle="#fff"; ctx.fillRect(settingsBtn.x,settingsBtn.y,settingsBtn.w,settingsBtn.h);
  ctx.fillStyle="#000"; ctx.fillText("AYAR",715,38);

  // AYAR MENÜ
  if(showSettings){
    ctx.fillStyle="rgba(0,0,0,0.6)"; ctx.fillRect(0,0,800,600);
    ctx.fillStyle="#fff"; ctx.fillRect(250,220,300,220);
    ctx.fillStyle="#000"; ctx.fillText("HIZ",380,250);
    ctx.fillRect(300,260,200,40); ctx.fillRect(300,310,200,40); ctx.fillRect(300,360,200,40);
    ctx.fillText("YAVAŞ",360,288); ctx.fillText("NORMAL",345,338); ctx.fillText("HIZLI",360,388);
  }

  if(gameOver){
    ctx.fillStyle="rgba(0,0,0,0.6)"; ctx.fillRect(0,0,800,600);
    ctx.fillStyle="#fff"; ctx.fillText("GAME OVER",300,300); ctx.fillText("Click to Restart",260,350);
  }
}

// ---------- LOOP ----------
let frame=0;
function loop(){ frame++; update(frame); draw(); requestAnimationFrame(loop); }
loop();
