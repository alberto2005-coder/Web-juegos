/* =========================================================
   Breakout — Arcade Nova
   Basado en NekeritDevs/Web-juegos (MIT)
   ========================================================= */

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const W = canvas.width;   // 480
const H = canvas.height;  // 640

const scoreEl = document.getElementById("score");
const livesEl = document.getElementById("lives");
const overlayEl = document.getElementById("overlay");
const overlayTitle = document.getElementById("overlay-title");
const overlayText = document.getElementById("overlay-text");
const overlayBtn = document.getElementById("overlay-btn");
const restartBtn = document.getElementById("restart");
const hintEl = document.getElementById("hint");

const PALETA = ["#7c3aed", "#8b5cf6", "#22d3ee", "#f472b6", "#f59e0b", "#4ade80"];
const COLS = 8;
const BALL_R = 7;

let bricks = [],
  score = 0,
  lives = 3,
  level = 1,
  state = "ready", // ready | playing | over | levelclear
  paddle = { x: W / 2 - 50, w: 100, h: 13, y: H - 46, target: W / 2 },
  ball = { x: W / 2, y: 0, vx: 0, vy: 0, speed: 340 },
  lastT = 0,
  audioCtx = null;

// ====== SONIDO ======
function beep(freq, dur = 0.07, type = "sine", vol = 0.16) {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === "suspended") audioCtx.resume();
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = type;
    o.frequency.value = freq;
    g.gain.setValueAtTime(vol, audioCtx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + dur);
    o.connect(g).connect(audioCtx.destination);
    o.start();
    o.stop(audioCtx.currentTime + dur + 0.02);
  } catch (_) { /* sin audio */ }
}

// ====== CONFIGURACIÓN DE NIVELES ======
function crearLadrillos() {
  bricks = [];
  const rows = Math.min(5 + level - 1, 8);
  const gap = 6, mx = 14, top = 62, bh = 20;
  const bw = (W - mx * 2 - gap * (COLS - 1)) / COLS;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < COLS; c++) {
      // A partir del nivel 3, las dos primeras filas resisten dos golpes
      const hp = level >= 3 && r < 2 ? 2 : 1;
      bricks.push({
        x: mx + c * (bw + gap),
        y: top + r * (bh + gap),
        w: bw,
        h: bh,
        color: PALETA[r % PALETA.length],
        hp,
        alive: true,
      });
    }
  }
}

function prepararNivel() {
  paddle.w = Math.max(64, 100 - (level - 1) * 8);
  paddle.x = W / 2 - paddle.w / 2;
  paddle.target = W / 2;
  ball.speed = 340 + (level - 1) * 45;
  ball.x = W / 2;
  ball.y = paddle.y - BALL_R - 2;
  ball.vx = 0;
  ball.vy = 0;
  crearLadrillos();
  state = "ready";
  ocultarOverlay();
  hintEl.textContent = "Mueve el ratón o el dedo para guiar la pala · Clic o espacio para lanzar";
}

function nuevaPartida() {
  score = 0;
  lives = 3;
  level = 1;
  scoreEl.textContent = "0";
  livesEl.textContent = "3";
  prepararNivel();
}

function actualizarHUD() {
  scoreEl.textContent = score;
  livesEl.textContent = lives;
}

// ====== OVERLAY ======
function mostrarOverlay(titulo, texto, boton) {
  overlayTitle.textContent = titulo;
  overlayText.textContent = texto;
  overlayBtn.textContent = boton;
  overlayEl.hidden = false;
}

function ocultarOverlay() {
  overlayEl.hidden = true;
}

// ====== FÍSICA ======
function lanzar() {
  if (state !== "ready") return;
  state = "playing";
  const ang = (Math.random() * 60 - 30) * (Math.PI / 180); // -30°..30°
  ball.vx = Math.sin(ang) * ball.speed;
  ball.vy = -Math.cos(ang) * ball.speed;
  hintEl.textContent = "¡Rompe todos los ladrillos!";
  beep(660, 0.08, "triangle");
}

function actualizar(dt) {
  // Pala: sigue al puntero con suavidad
  const vel = 1400;
  const dif = paddle.target - (paddle.x + paddle.w / 2);
  paddle.x += Math.max(-vel * dt, Math.min(vel * dt, dif));
  paddle.x = Math.max(0, Math.min(W - paddle.w, paddle.x));

  if (state === "ready") {
    ball.x = paddle.x + paddle.w / 2;
    ball.y = paddle.y - BALL_R - 2;
    return;
  }
  if (state !== "playing") return;

  ball.x += ball.vx * dt;
  ball.y += ball.vy * dt;

  // Paredes
  if (ball.x - BALL_R < 0) { ball.x = BALL_R; ball.vx = Math.abs(ball.vx); beep(420); }
  if (ball.x + BALL_R > W) { ball.x = W - BALL_R; ball.vx = -Math.abs(ball.vx); beep(420); }
  if (ball.y - BALL_R < 0) { ball.y = BALL_R; ball.vy = Math.abs(ball.vy); beep(520); }

  // Pala
  if (
    ball.vy > 0 &&
    ball.y + BALL_R >= paddle.y &&
    ball.y - BALL_R <= paddle.y + paddle.h &&
    ball.x >= paddle.x - BALL_R &&
    ball.x <= paddle.x + paddle.w + BALL_R
  ) {
    const offset = (ball.x - (paddle.x + paddle.w / 2)) / (paddle.w / 2);
    const ang = offset * (Math.PI / 3); // hasta 60°
    ball.vx = Math.sin(ang) * ball.speed;
    ball.vy = -Math.abs(Math.cos(ang) * ball.speed);
    ball.y = paddle.y - BALL_R - 1;
    beep(300, 0.06, "square");
  }

  // Ladrillos
  for (const b of bricks) {
    if (!b.alive) continue;
    const cx = Math.max(b.x, Math.min(ball.x, b.x + b.w));
    const cy = Math.max(b.y, Math.min(ball.y, b.y + b.h));
    const dx = ball.x - cx;
    const dy = ball.y - cy;
    if (dx * dx + dy * dy > BALL_R * BALL_R) continue;

    // Eje de rebote según la penetración relativa
    const relX = Math.abs(ball.x - (b.x + b.w / 2)) / (b.w / 2);
    const relY = Math.abs(ball.y - (b.y + b.h / 2)) / (b.h / 2);
    if (relX > relY) {
      ball.vx = ball.vx > 0 ? -Math.abs(ball.vx) : Math.abs(ball.vx);
      ball.x += ball.vx > 0 ? 1 : -1;
    } else {
      ball.vy = ball.vy > 0 ? -Math.abs(ball.vy) : Math.abs(ball.vy);
      ball.y += ball.vy > 0 ? 1 : -1;
    }

    b.hp--;
    if (b.hp <= 0) {
      b.alive = false;
      score += 10 * level;
      beep(700 + b.y / 8, 0.07, "triangle");
    } else {
      score += 5;
      beep(500, 0.05, "square", 0.1);
    }
    actualizarHUD();
    break; // un ladrillo por frame
  }

  // ¿Nivel superado?
  if (bricks.every((b) => !b.alive)) {
    state = "levelclear";
    beep(880, 0.15, "triangle");
    setTimeout(() => beep(1100, 0.18, "triangle"), 130);
    mostrarOverlay(
      "¡Nivel superado! 🎉",
      `Puntuación: ${score}`,
      "Siguiente nivel"
    );
    return;
  }

  // Fuera por abajo
  if (ball.y - BALL_R > H) {
    lives--;
    actualizarHUD();
    beep(160, 0.3, "sawtooth", 0.18);
    if (lives <= 0) {
      state = "over";
      mostrarOverlay("¡Juego terminado!", `Puntuación final: ${score}`, "Jugar otra vez");
    } else {
      state = "ready";
      ball.vx = 0;
      ball.vy = 0;
      hintEl.textContent = `Te quedan ${lives} vida${lives === 1 ? "" : "s"} · Clic o espacio para lanzar`;
    }
  }
}

// ====== DIBUJO ======
function draw() {
  ctx.clearRect(0, 0, W, H);

  // Rejilla sutil de fondo
  ctx.strokeStyle = "rgba(255,255,255,0.03)";
  ctx.lineWidth = 1;
  for (let x = 40; x < W; x += 40) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
  }
  for (let y = 40; y < H; y += 40) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }

  // Ladrillos
  for (const b of bricks) {
    if (!b.alive) continue;
    ctx.fillStyle = b.color;
    redondeado(b.x, b.y, b.w, b.h, 5);
    ctx.fill();
    // Brillo superior
    ctx.fillStyle = "rgba(255,255,255,0.22)";
    redondeado(b.x + 2, b.y + 2, b.w - 4, 5, 3);
    ctx.fill();
    // Segundo golpe
    if (b.hp > 1) {
      ctx.strokeStyle = "rgba(255,255,255,0.85)";
      ctx.lineWidth = 2;
      redondeado(b.x + 3, b.y + 3, b.w - 6, b.h - 6, 4);
      ctx.stroke();
    }
  }

  // Pala
  const grad = ctx.createLinearGradient(paddle.x, 0, paddle.x + paddle.w, 0);
  grad.addColorStop(0, "#7c3aed");
  grad.addColorStop(1, "#22d3ee");
  ctx.shadowColor = "rgba(124,58,237,0.7)";
  ctx.shadowBlur = 14;
  ctx.fillStyle = grad;
  redondeado(paddle.x, paddle.y, paddle.w, paddle.h, 7);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Pelota
  ctx.shadowColor = "rgba(34,211,238,0.9)";
  ctx.shadowBlur = 16;
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, BALL_R, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Indicador "listo"
  if (state === "ready") {
    ctx.fillStyle = "rgba(232,236,255,0.85)";
    ctx.font = "600 15px Inter, Segoe UI, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("▲ Clic o espacio para lanzar", W / 2, paddle.y - 34);
  }
}

function redondeado(x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// ====== BUCLE ====== 
function loop(t) {
  const dt = Math.min((t - lastT) / 1000, 1 / 30);
  lastT = t;
  actualizar(dt);
  draw();
  requestAnimationFrame(loop);
}

// ====== CONTROLES ======
function apuntar(clientX) {
  const rect = canvas.getBoundingClientRect();
  paddle.target = ((clientX - rect.left) * (W / rect.width));
}

canvas.addEventListener("mousemove", (e) => apuntar(e.clientX));
canvas.addEventListener("click", () => {
  if (state === "over" || state === "levelclear") return;
  lanzar();
});
canvas.addEventListener("touchstart", (e) => {
  e.preventDefault();
  if (state === "over" || state === "levelclear") return;
  apuntar(e.changedTouches[0].clientX);
  lanzar();
}, { passive: false });

canvas.addEventListener("touchmove", (e) => {
  e.preventDefault();
  apuntar(e.changedTouches[0].clientX);
}, { passive: false });

document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
    paddle.target = Math.max(0, paddle.target - 46);
  } else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
    paddle.target = Math.min(W, paddle.target + 46);
  } else if (e.key === " " || e.key === "Enter") {
    e.preventDefault();
    lanzar();
  }
});

overlayBtn.addEventListener("click", () => {
  if (state === "levelclear") {
    level++;
    prepararNivel();
  } else {
    nuevaPartida();
  }
});

restartBtn.addEventListener("click", nuevaPartida);

// ====== INICIO ======
nuevaPartida();
requestAnimationFrame((t) => { lastT = t; requestAnimationFrame(loop); });
