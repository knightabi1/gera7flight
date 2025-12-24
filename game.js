

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

const era7Img = new Image(); era7Img.src = 'era7.png';
const kaktusImg = new Image(); kaktusImg.src = 'kaktus.png';

let era7 = { x: 50, y: canvas.height / 2, w: 50, h: 50, gravity: 0.5, lift: -8, velocity: 0 };
let pipes = [];
let score = 0;
let frame = 0;
let gameOver = false;

function jump() {
    if (gameOver) {
        resetGame();
    } else {
        era7.velocity = era7.lift;
    }
}

// Mobil ve PC Kontrolleri (Gecikmesiz)
window.addEventListener('keydown', (e) => { if (e.code === 'Space') jump(); });
canvas.addEventListener('touchstart', (e) => { e.preventDefault(); jump(); }, { passive: false });
canvas.addEventListener('mousedown', jump);

function resetGame() {
    era7.y = canvas.height / 2; era7.velocity = 0;
    pipes = []; score = 0; frame = 0;
    gameOver = false;
    loop();
}

function loop() {
    if (gameOver) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    era7.velocity += era7.gravity;
    era7.y += era7.velocity;

    if (frame % 100 === 0) {
        let gap = 170;
        let pipeHeight = Math.random() * (canvas.height - gap - 100) + 50;
        pipes.push({ x: canvas.width, y: pipeHeight, w: 60, gap: gap });
    }

    for (let i = pipes.length - 1; i >= 0; i--) {
        pipes[i].x -= 3.5;
        ctx.drawImage(kaktusImg, pipes[i].x, 0, pipes[i].w, pipes[i].y);
        ctx.drawImage(kaktusImg, pipes[i].x, pipes[i].y + pipes[i].gap, pipes[i].w, canvas.height);

        if (era7.x + era7.w > pipes[i].x && era7.x < pipes[i].x + pipes[i].w) {
            if (era7.y < pipes[i].y || era7.y + era7.h > pipes[i].y + pipes[i].gap) gameOver = true;
        }

        if (pipes[i].x + pipes[i].w < 0) {
            pipes.splice(i, 1);
            score++;
        }
    }

    ctx.drawImage(era7Img, era7.x, era7.y, era7.w, era7.h);
    if (era7.y + era7.h > canvas.height || era7.y < 0) gameOver = true;

    ctx.fillStyle = "white"; ctx.font = "bold 25px Arial";
    ctx.fillText("Skor: " + score, 20, 40);

    if (gameOver) {
        ctx.fillStyle = "rgba(0,0,0,0.7)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "white"; ctx.textAlign = "center";
        ctx.fillText("OYUN BİTTİ", canvas.width / 2, canvas.height / 2 - 20);
        ctx.fillText("Yeniden Başlamak İçin Dokun", canvas.width / 2, canvas.height / 2 + 20);
    }

    frame++;
    requestAnimationFrame(loop);
}

era7Img.onload = loop;
