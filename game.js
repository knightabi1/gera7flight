
   const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

// Görseller
const era7Img = new Image(); era7Img.src = 'era7.png';
const ritimImg = new Image(); ritimImg.src = 'ritim.png';

let era7 = { x: 100, y: canvas.height / 2, w: 45, h: 45, gravity: 0.4, lift: -7, velocity: 0 };
let ritim = { x: -50, y: canvas.height / 2, w: 60, h: 60 };
let pipes = [];
let clouds = [];
let birds = [];
let score = 0;
let frame = 0;
let gameOver = false;

// Arka Plan Objeleri (Dağlar, Bulutlar, Kuşlar)
function initDecorations() {
    for(let i=0; i<5; i++) {
        clouds.push({ x: Math.random()*canvas.width, y: Math.random()*150, s: 0.5 + Math.random() });
        birds.push({ x: Math.random()*canvas.width, y: 150 + Math.random()*100, s: 1 + Math.random() });
    }
}
initDecorations();

function jump() {
    if (gameOver) resetGame();
    else era7.velocity = era7.lift;
}

window.addEventListener('keydown', (e) => { if (e.code === 'Space') jump(); });
canvas.addEventListener('touchstart', (e) => { e.preventDefault(); jump(); }, { passive: false });
canvas.addEventListener('mousedown', jump);

function resetGame() {
    era7.y = canvas.height / 2; era7.velocity = 0;
    pipes = []; score = 0; frame = 0;
    gameOver = false;
    loop();
}

function drawBackground() {
    // Gökyüzü ve Dağlar
    let grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, '#70c5ce');
    grad.addColorStop(1, '#94d3ac');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Basit Dağ Çizimi
    ctx.fillStyle = '#4e8d5f';
    ctx.beginPath();
    ctx.moveTo(0, canvas.height);
    ctx.lineTo(canvas.width/4, canvas.height-150);
    ctx.lineTo(canvas.width/2, canvas.height);
    ctx.fill();

    // Bulutlar ve Kuşlar
    ctx.fillStyle = 'white';
    clouds.forEach(c => {
        c.x -= c.s; if(c.x < -100) c.x = canvas.width + 50;
        ctx.beginPath(); ctx.arc(c.x, c.y, 20, 0, Math.PI*2); ctx.fill();
    });
}

function loop() {
    if (gameOver) return;
    drawBackground();

    // Ritim Kovalama Efekti
    ritim.x = era7.x - 80 + Math.sin(frame * 0.1) * 10;
    ritim.y += (era7.y - ritim.y) * 0.1;
    ctx.drawImage(ritimImg, ritim.x, ritim.y, ritim.w, ritim.h);

    // Era7 Hareket & Dar Hitbox (Daha adil oyun)
    era7.velocity += era7.gravity;
    era7.y += era7.velocity;
    ctx.drawImage(era7Img, era7.x, era7.y, era7.w, era7.h);

    // Engel Oluşturma (Uzun Dikdörtgenler)
    if (frame % 110 === 0) {
        let gap = 180;
        let h = Math.random() * (canvas.height - gap - 100) + 50;
        pipes.push({ x: canvas.width, y: h, w: 40, gap: gap });
    }

    for (let i = pipes.length - 1; i >= 0; i--) {
        pipes[i].x -= 4; // Hız dengelendi
        ctx.fillStyle = '#333'; // Modern Koyu Dikdörtgenler
        ctx.fillRect(pipes[i].x, 0, pipes[i].w, pipes[i].y);
        ctx.fillRect(pipes[i].x, pipes[i].y + pipes[i].gap, pipes[i].w, canvas.height);

        // Hassas Hitbox Kontrolü (Görselden %10 daha küçük)
        if (era7.x + 5 < pipes[i].x + pipes[i].w && era7.x + era7.w - 5 > pipes[i].x) {
            if (era7.y + 5 < pipes[i].y || era7.y + era7.h - 5 > pipes[i].y + pipes[i].gap) gameOver = true;
        }

        if (pipes[i].x + pipes[i].w < 0) { pipes.splice(i, 1); score++; }
    }

    // Yer ve Tavan Kontrolü
    if (era7.y + era7.h > canvas.height || era7.y < 0) gameOver = true;

    // Skor Tabelası
    ctx.fillStyle = "rgba(0,0,0,0.5)"; ctx.fillRect(10, 10, 120, 40);
    ctx.fillStyle = "gold"; ctx.font = "bold 22px Arial";
    ctx.fillText("SKOR: " + score, 25, 38);

    if (gameOver) {
        ctx.fillStyle = "rgba(0,0,0,0.8)"; ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "white"; ctx.textAlign = "center";
        ctx.fillText("EYVAH! RİTİME YAKALANDIN", canvas.width/2, canvas.height/2);
        ctx.fillText("Tekrar Uçmak İçin Dokun", canvas.width/2, canvas.height/2 + 40);
    }

    frame++;
    requestAnimationFrame(loop);
}
era7Img.onload = loop;
