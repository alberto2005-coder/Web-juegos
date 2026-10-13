const cnv = document.getElementById('c');
const ctx = cnv.getContext('2d');

// Configuración del canvas
cnv.width = 800;
cnv.height = 400;

// Estado del juego
let gameState = 'start'; // 'start', 'playing', 'paused', 'gameOver'
let scoreLeft = 0;
let scoreRight = 0;
const winScore = 5;

// Pelota
let ball = {
    x: cnv.width / 2,
    y: cnv.height / 2,
    r: 12,
    vx: 2,
    vy: 1.3,
    color: '#00ff88',
    trail: []
};

// Paletas
const paddleWidth = 15;
const paddleHeight = 80;
const paddleSpeed = 8;

let leftPaddle = {
    x: 30,
    y: cnv.height / 2 - paddleHeight / 2,
    w: paddleWidth,
    h: paddleHeight,
    color: '#ff6b6b'
};

let rightPaddle = {
    x: cnv.width - 30 - paddleWidth,
    y: cnv.height / 2 - paddleHeight / 2,
    w: paddleWidth,
    h: paddleHeight,
    color: '#4ecdc4'
};

// Controles
const keys = {
    w: false,
    s: false,
    up: false,
    down: false,
    space: false,
    r: false
};

// Partículas para efectos
let particles = [];

function rnd() {
    return '#' + Math.floor(Math.random() * 16777215).toString(16);
}

function createParticles(x, y, color) {
    for (let i = 0; i < 8; i++) {
        particles.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 10,
            vy: (Math.random() - 0.5) * 10,
            life: 30,
            maxLife: 30,
            color: color
        });
    }
}

function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.98;
        p.vy *= 0.98;
        p.life--;

        if (p.life <= 0) {
            particles.splice(i, 1);
        }
    }
}

function drawParticles() {
    particles.forEach(p => {
        const alpha = p.life / p.maxLife;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3 * alpha, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    });
}

function drawBall() {
    // Estela de la pelota
    ball.trail.push({ x: ball.x, y: ball.y });
    if (ball.trail.length > 10) {
        ball.trail.shift();
    }

    // Dibujar estela
    ctx.save();
    for (let i = 0; i < ball.trail.length; i++) {
        ctx.globalAlpha = i / ball.trail.length * 0.5;
        ctx.fillStyle = ball.color;
        ctx.beginPath();
        ctx.arc(ball.trail[i].x, ball.trail[i].y, ball.r * (i / ball.trail.length), 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.restore();

    // Dibujar pelota principal
    ctx.fillStyle = ball.color;
    ctx.shadowBlur = 20;
    ctx.shadowColor = ball.color;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
}

function drawPaddle(paddle) {
    // Gradiente para las paletas
    const gradient = ctx.createLinearGradient(paddle.x, paddle.y, paddle.x + paddle.w, paddle.y);
    gradient.addColorStop(0, paddle.color);
    gradient.addColorStop(1, '#ffffff');

    ctx.fillStyle = gradient;
    ctx.shadowBlur = 10;
    ctx.shadowColor = paddle.color;
    ctx.fillRect(paddle.x, paddle.y, paddle.w, paddle.h);
    ctx.shadowBlur = 0;
}

function drawNet() {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 3;
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(cnv.width / 2, 0);
    ctx.lineTo(cnv.width / 2, cnv.height);
    ctx.stroke();
    ctx.setLineDash([]);
}

function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.w &&
        rect1.x + rect1.w > rect2.x &&
        rect1.y < rect2.y + rect2.h &&
        rect1.y + rect1.h > rect2.y;
}

function resetBall() {
    ball.x = cnv.width / 2;
    ball.y = cnv.height / 2;
    ball.vx = (Math.random() > 0.5 ? 1 : -1) * 2;
    ball.vy = (Math.random() - 0.5) * 2.7;
    ball.color = rnd();
    ball.trail = [];
}

function updateBall() {
    ball.x += ball.vx;
    ball.y += ball.vy;

    // Rebote en paredes superior e inferior
    if (ball.y <= ball.r || ball.y >= cnv.height - ball.r) {
        ball.vy *= -1;
        ball.color = rnd();
        createParticles(ball.x, ball.y, ball.color);
    }

    // Colisión con paleta izquierda
    if (checkCollision(
        { x: ball.x - ball.r, y: ball.y - ball.r, w: ball.r * 2, h: ball.r * 2 },
        leftPaddle
    )) {
        if (ball.vx < 0) {
            ball.vx *= -1.05; // Incrementar velocidad ligeramente
            ball.vy += (ball.y - (leftPaddle.y + leftPaddle.h / 2)) * 0.03;
            ball.color = leftPaddle.color;
            createParticles(ball.x, ball.y, leftPaddle.color);
        }
    }

    // Colisión con paleta derecha
    if (checkCollision(
        { x: ball.x - ball.r, y: ball.y - ball.r, w: ball.r * 2, h: ball.r * 2 },
        rightPaddle
    )) {
        if (ball.vx > 0) {
            ball.vx *= -1.05; // Incrementar velocidad ligeramente
            ball.vy += (ball.y - (rightPaddle.y + rightPaddle.h / 2)) * 0.03;
            ball.color = rightPaddle.color;
            createParticles(ball.x, ball.y, rightPaddle.color);
        }
    }

    // Puntuación
    if (ball.x <= 0) {
        scoreRight++;
        document.getElementById('scoreRight').textContent = scoreRight;
        checkWin();
        resetBall();
    } else if (ball.x >= cnv.width) {
        scoreLeft++;
        document.getElementById('scoreLeft').textContent = scoreLeft;
        checkWin();
        resetBall();
    }
}

function updatePaddles() {
    // Paleta izquierda (W/S)
    if (keys.w && leftPaddle.y > 0) {
        leftPaddle.y -= paddleSpeed;
    }
    if (keys.s && leftPaddle.y < cnv.height - leftPaddle.h) {
        leftPaddle.y += paddleSpeed;
    }

    // Paleta derecha (↑/↓)
    if (keys.up && rightPaddle.y > 0) {
        rightPaddle.y -= paddleSpeed;
    }
    if (keys.down && rightPaddle.y < cnv.height - rightPaddle.h) {
        rightPaddle.y += paddleSpeed;
    }
}

function checkWin() {
    if (scoreLeft >= winScore || scoreRight >= winScore) {
        gameState = 'gameOver';
        const winner = scoreLeft >= winScore ? 'Jugador 1' : 'Jugador 2';
        document.getElementById('winnerText').textContent = `¡${winner} Gana!`;
        document.getElementById('gameOver').style.display = 'block';
    }
}

function startGame() {
    gameState = 'playing';
    document.getElementById('startScreen').style.display = 'none';
    resetBall();
}

function resetGame() {
    scoreLeft = 0;
    scoreRight = 0;
    document.getElementById('scoreLeft').textContent = '0';
    document.getElementById('scoreRight').textContent = '0';
    document.getElementById('startScreen').style.display = 'none';
    document.getElementById('gameOver').style.display = 'none';
    gameState = 'playing';
    resetBall();
    leftPaddle.y = cnv.height / 2 - paddleHeight / 2;
    rightPaddle.y = cnv.height / 2 - paddleHeight / 2;
    particles = [];
}

function draw() {
    // Fondo con gradiente
    const gradient = ctx.createLinearGradient(0, 0, cnv.width, cnv.height);
    gradient.addColorStop(0, '#0a0a0a');
    gradient.addColorStop(1, '#1a1a2e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, cnv.width, cnv.height);

    drawNet();
    drawPaddle(leftPaddle);
    drawPaddle(rightPaddle);
    drawBall();
    drawParticles();

    // Mostrar pantalla de inicio
    if (gameState === 'start') {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, cnv.width, cnv.height);
        return;
    }

    // Mostrar "PAUSA" si está pausado
    if (gameState === 'paused') {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, cnv.width, cnv.height);

        ctx.fillStyle = '#00ff88';
        ctx.font = '48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('PAUSA', cnv.width / 2, cnv.height / 2);
        ctx.font = '16px Arial';
        ctx.fillText('Presiona ESPACIO para continuar', cnv.width / 2, cnv.height / 2 + 50);
    }
}

function update() {
    if (gameState === 'playing') {
        updateBall();
        updatePaddles();
    }
    updateParticles();
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Función global para el botón
window.startGame = startGame;

// Event listeners
document.addEventListener('keydown', (e) => {
    switch (e.key.toLowerCase()) {
        case 'w':
            if (gameState === 'playing') keys.w = true;
            break;
        case 's':
            if (gameState === 'playing') keys.s = true;
            break;
        case 'arrowup':
            if (gameState === 'playing') keys.up = true;
            e.preventDefault();
            break;
        case 'arrowdown':
            if (gameState === 'playing') keys.down = true;
            e.preventDefault();
            break;
        case ' ':
            if (gameState === 'start') {
                startGame();
            } else if (gameState === 'playing') {
                gameState = 'paused';
            } else if (gameState === 'paused') {
                gameState = 'playing';
            }
            e.preventDefault();
            break;
        case 'r':
            resetGame();
            break;
    }
});

document.addEventListener('keyup', (e) => {
    switch (e.key.toLowerCase()) {
        case 'w': keys.w = false; break;
        case 's': keys.s = false; break;
        case 'arrowup': keys.up = false; break;
        case 'arrowdown': keys.down = false; break;
    }
});

// Iniciar el juego
gameLoop();