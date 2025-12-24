
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Ekran boyutunu otomatik ayarla (Mobil ve PC uyumlu)
function resizeCanvas() {
    canvas.width = window.innerWidth > 500 ? 400 : window.innerWidth * 0.9;
    canvas.height = window.innerHeight > 600 ? 500 : window.innerHeight * 0.7;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Görseller
const era7Img = new Image(); era7Img.src = 'era7.png';
const kaktusImg = new Image(); kaktusImg.src = 'kaktus.png';
const ritimImg = new Image(); ritimImg.src = 'ritim.png';
const gucSes = new Audio('guc.mp3');

let era7 = { x: 50, y: 150, w: 50, h: 50, gravity: 0.6, lift: -10, velocity: 0 };
let pipes = [];
let score = 0;
let frame = 0;
let gameOver = false;

// Zıplama Fonksiyonu (Hem Tıklama Hem Dokunma İçin)
function jump() {
    if (gameOver) {
        resetGame();
    } else {
        era7.velocity = era7.lift;
        gucSes.play().catch(() => {}); // Ses hatasını engeller
    }
}

// Kontroller: PC (Boşluk) ve Mobil (Dokunmatik)
window.addEventListener('keydown', (e) => { if(e.code === 'Space') jump(); });
canvas.addEventListener('touchstart', (e) => { e.preventDefault(); jump(); }, {passive: false});
canvas.addEventListener('mousedown', (e) => { jump(); });

function resetGame() {
    era7.y = 150; era7.velocity = 0;
    pipes = []; score = 0; frame = 0;
    gameOver = false;
    loop();
}

function loop() {
    if (gameOver) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Era7 Hareket
    era7.velocity += era7.gravity;
    era7.y += era7.velocity;

    // Kaktüsleri Oluştur
    if (frame % 90 === 0) {
        let gap = 150;
        let pipeHeight = Math.random() * (canvas.height - gap - 100) + 50;
        pipes.push({ x: canvas.width, y: pipeHeight, w: 50, gap: gap });
    }

    // Kaktüsleri Çiz ve Kontrol Et
    for (let i = pipes.length - 1; i >= 0; i--) {
        pipes[i].x -= 3;
        ctx.drawImage(kaktusImg, pipes[i].x, 0, pipes[i].w, pipes[i].y);
        ctx.drawImage(kaktusImg, pipes[i].x, pipes[i].y + pipes[i].gap, pipes[i].w, canvas.height);

        // Çarpışma Testi
        if (era7.x + era7.w > pipes[i].x && era7.x < pipes[i].x + pipes[i].w) {
            if (era7.y < pipes[i].y || era7.y + era7.h > pipes[i].y + pipes[i].gap) {
                gameOver = true;
            }
        }

        if (pipes[i].x + pipes[i].w < 0) {
            pipes.splice(i, 1);
            score++;
        }
    }

    // Karakteri Çiz
    ctx.drawImage(era7Img, era7.x, era7.y, era7.w, era7.h);

    // Yere Düşme Kontrolü
    if (era7.y + era7.h > canvas.height || era7.y < 0) gameOver = true;

    // Skor Yazısı
    ctx.fillStyle = "white"; ctx.font = "20px Arial";
    ctx.fillText("Skor: " + score, 10, 30);

    if (gameOver) {
        ctx.fillStyle = "rgba(0,0,0,0.5)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "white"; ctx.textAlign = "center";
        ctx.fillText("GAME OVER - Tıkla ve Yeniden Başla", canvas.width/2, canvas.height/2);
    }

    frame++;
    requestAnimationFrame(loop);
}

era7Img.onload = loop;
