/* =========================================================
   Flappy Nova — Arcade Nova
   Basado en NekeritDevs/Web-juegos (MIT)
   ========================================================= */

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const W = canvas.width;   // 400
const H = canvas.height;  // 620

const scoreEl = document.getElementById("score");
const bestEl = document.getElementById("best");
const overlayEl = document.getElementById("overlay");
const overlayTitle = document.getElementById("overlay-title");
const overlayText = document.getElementById("overlay-text");
const overlayBtn = document.getElementById("overlay-btn");
const hintEl = document.getElementById("hint");

const SUelo = 48;                 // altura del suelo
const PW = 64;                    // ancho de tubería
const GRAVEDAD = 1500;            // px/s²
const IMPULSO = -430;             // aleteo
const CLAVE_MEJOR = "arcadeNovaFlappy-best";

let pipes = [],
  score = 0,
  mejor = Number(localStorage.getItem(CLAVE_MEJOR) || 0),
  state = "ready", // ready | playing | over
  spawnTimer = 300,
  bird = { x: 110, y: H / 2 - 40, vy: 0, r: 14, t: 0 },
  sueloX = 0,
  nubesX = 0,
  lastT = 0,
  audioCtx = null;

bestEl.textContent = mejor;

// ====== SONIDO ======
function beep(freq, dur = 0.07, type = "sine", vol = 0.16) {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === "suspended") audioCtx.resume();
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, audioCtx.currentTime);
    g.gain.setValueAtTime(vol, audioCtx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + dur);
    o.connect(g).connect(audioCtx.destination);
    o.start();
    o.stop(audioCtx.currentTime + dur + 0.02);
  } catch (_) { /* sin audio */ }
}

// ====== PARTIDA ======
function nuevaPartida() {
  pipes = [];
  score = 0;
  spawnTimer = 340;
  bird.y = H / 2 - 40;
  bird.vy = 0;
  scoreEl.textContent = "0";
  state = "ready";
  ocultarOverlay();
  hintEl.textContent = "Espacio, clic o toque para aletear";
}

function velocidad() {
  return Math.min(230, 140 + score * 3);
}

function huecoActual() {
  return Math.max(115, 160 - Math.floor(score / 4) * 6);
}

function crearTuberia() {
  const gap = huecoActual();
  const minTop = 70;
  const gapY = minTop + Math.random() * (H - SUelo - gap - minTop * 2);
  pipes.push({ x: W + 20, gapY, gap, scored: false });
}

function aletear() {
  if (state === "over") return;
  if (state === "ready") {
    state = "playing";
    hintEl.textContent = "¡Esquiva las tuberías!";
  }
  bird.vy = IMPULSO;
  beep(520, 0.06, "square", 0.12);
}

function perder() {
  state = "over";
  beep(200, 0.12, "sawtooth", 0.2);
  setTimeout(() => beep(140, 0.3, "sawtooth", 0.18), 90);
  if (score > mejor) {
    mejor = score;
    localStorage.setItem(CLAVE_MEJOR, String(mejor));
    bestEl.textContent = mejor;
    mostrarOverlay("¡Nuevo récord! 🌟", `Puntuación: ${score}`, "Intentar de nuevo");
  } else {
    mostrarOverlay("¡Juego terminado!", `Puntuación: ${score}\nRécord: ${mejor}`, "Intentar de nuevo");
  }
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
function actualizar(dt) {
  bird.t += dt;

  if (state === "ready") {
    // Pájaro balanceándose + parallax suave
    bird.y = H / 2 - 40 + Math.sin(bird.t * 3) * 9;
    sueloX = (sueloX + 40 * dt) % 40;
    return;
  }

  if (state === "playing") {
    // Pájaro
    bird.vy += GRAVEDAD * dt;
    bird.y += bird.vy * dt;
    if (bird.y - bird.r < 0) { bird.y = bird.r; bird.vy = 0; }

    // Tuberías
    const v = velocidad();
    spawnTimer -= v * dt;
    if (spawnTimer <= 0) {
      crearTuberia();
      spawnTimer = 220;
    }
    for (const p of pipes) p.x -= v * dt;
    if (pipes.length && pipes[0].x + PW < -20) pipes.shift();

    // Puntuación
    for (const p of pipes) {
      if (!p.scored && p.x + PW < bird.x - bird.r) {
        p.scored = true;
        score++;
        scoreEl.textContent = score;
        beep(880, 0.08, "triangle");
        setTimeout(() => beep(1170, 0.07, "triangle"), 70);
      }
    }

    sueloX = (sueloX + v * dt) % 40;

    // Choques con tuberías
    for (const p of pipes) {
      if (bird.x + bird.r > p.x && bird.x - bird.r < p.x + PW) {
        const arriba = bird.y - bird.r < p.gapY;
        const abajo = bird.y + bird.r > p.gapY + p.gap;
        if (arriba || abajo) return perder();
      }
    }

    // Suelo
    if (bird.y + bird.r > H - SUelo) {
      bird.y = H - SUelo - bird.r;
      return perder();
    }
    return;
  }

  // state === "over": el pájaro cae hasta el suelo
  bird.vy += GRAVEDAD * dt;
  bird.y += bird.vy * dt;
  const sueloY = H - SUelo - bird.r;
  if (bird.y > sueloY) { bird.y = sueloY; bird.vy = 0; }
}

// ====== DIBUJO ======
function draw() {
  // Cielo (atardecer nova)
  const cielo = ctx.createLinearGradient(0, 0, 0, H);
  cielo.addColorStop(0, "#3b2f80");
  cielo.addColorStop(0.55, "#5aa9d6");
  cielo.addColorStop(1, "#a8e6f3");
  ctx.fillStyle = cielo;
  ctx.fillRect(0, 0, W, H);

  // Estrellitas arriba
  ctx.fillStyle = "rgba(255,255,255,0.75)";
  const estrellas = [[40, 36], [120, 70], [210, 30], [300, 64], [360, 28], [80, 120], [255, 96]];
  for (const [sx, sy] of estrellas) {
    ctx.globalAlpha = 0.35 + 0.3 * Math.sin(bird.t * 2 + sx);
    ctx.fillRect(sx, sy, 2.5, 2.5);
  }
  ctx.globalAlpha = 1;

  // Nubes
  nubesX = (nubesX + 8 * 0.016) % (W + 160);
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  nube(140 - nubesX, 150, 1);
  nube(420 - nubesX, 210, 0.8);
  nube(660 - nubesX, 130, 1.1);
  nube(-80 - nubesX + (W + 160), 180, 0.9);

  // Tuberías
  for (const p of pipes) {
    tuberia(p.x, p.gapY);
    tuberia(p.x, p.gapY + p.gap, true);
  }

  // Suelo
  ctx.fillStyle = "#2a2f5e";
  ctx.fillRect(0, H - SUelo, W, SUelo);
  ctx.fillStyle = "#3b4280";
  ctx.fillRect(0, H - SUelo, W, 5);
  ctx.strokeStyle = "rgba(34,211,238,0.9)";
  ctx.lineWidth = 3;
  ctx.setLineDash([14, 12]);
  ctx.lineDashOffset = -sueloX;
  ctx.beginPath();
  ctx.moveTo(0, H - SUelo + 22);
  ctx.lineTo(W, H - SUelo + 22);
  ctx.stroke();
  ctx.setLineDash([]);

  // Pájaro
  pajarO();

  // Puntuación en pantalla
  ctx.font = "800 44px Inter, Segoe UI, sans-serif";
  ctx.textAlign = "center";
  ctx.lineWidth = 6;
  ctx.strokeStyle = "rgba(13,18,38,0.65)";
  ctx.strokeText(String(score), W / 2, 74);
  ctx.fillStyle = "#ffffff";
  ctx.fillText(String(score), W / 2, 74);

  // Aviso de inicio
  if (state === "ready") {
    ctx.font = "700 17px Inter, Segoe UI, sans-serif";
    ctx.lineWidth = 5;
    ctx.strokeStyle = "rgba(13,18,38,0.6)";
    ctx.strokeText("Toca o pulsa espacio para volar", W / 2, 150);
    ctx.fillStyle = "#ffe680";
    ctx.fillText("Toca o pulsa espacio para volar", W / 2, 150);
  }
}

function nube(x, y, s) {
  ctx.beginPath();
  ctx.ellipse(x, y, 34 * s, 15 * s, 0, 0, Math.PI * 2);
  ctx.ellipse(x + 26 * s, y + 5 * s, 26 * s, 12 * s, 0, 0, Math.PI * 2);
  ctx.ellipse(x - 26 * s, y + 6 * s, 24 * s, 11 * s, 0, 0, Math.PI * 2);
  ctx.fill();
}

function tuberia(x, gapY, esInferior) {
  const altoSuperior = gapY;
  const altoInferior = H - SUelo - (gapY + (esInferior ? 0 : 0));
  // Cuerpo: parte superior (de 0 a gapY) o inferior (de gapY+gap al suelo)
  let y0, h;
  if (!esInferior) {
    y0 = 0; h = altoSuperior;
  } else {
    y0 = gapY; h = H - SUelo - gapY;
  }
  const g = ctx.createLinearGradient(x, 0, x + PW, 0);
  g.addColorStop(0, "#3fbf5a");
  g.addColorStop(0.5, "#57d97a");
  g.addColorStop(1, "#2f9e4c");
  ctx.fillStyle = g;
  ctx.fillRect(x, y0, PW, h);
  ctx.strokeStyle = "rgba(13,60,30,0.55)";
  ctx.lineWidth = 3;
  ctx.strokeRect(x, y0, PW, h);

  // Tapa (borde hacia el hueco)
  const tapaH = 26;
  const tapaY = esInferior ? y0 : y0 + h - tapaH;
  ctx.fillStyle = "#4fd171";
  ctx.fillRect(x - 5, tapaY, PW + 10, tapaH);
  ctx.strokeRect(x - 5, tapaY, PW + 10, tapaH);
}

function pajarO() {
  // Rotación según la velocidad
  const ang = Math.max(-0.5, Math.min(1.25, bird.vy / 520));
  ctx.save();
  ctx.translate(bird.x, bird.y);
  ctx.rotate(ang);

  // Ala
  const ala = Math.sin(bird.t * 14) * 5;
  ctx.fillStyle = "#fde68a";
  ctx.beginPath();
  ctx.ellipse(-5, 2 + ala * 0.4, 8, 5.5, -0.4, 0, Math.PI * 2);
  ctx.fill();

  // Cuerpo
  ctx.fillStyle = "#fbbf24";
  ctx.strokeStyle = "#b45309";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(0, 0, bird.r, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Pico
  ctx.fillStyle = "#f97316";
  ctx.beginPath();
  ctx.moveTo(bird.r - 3, -3);
  ctx.lineTo(bird.r + 8, 0);
  ctx.lineTo(bird.r - 3, 4);
  ctx.closePath();
  ctx.fill();

  // Ojo
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(5, -5, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#0d1226";
  ctx.beginPath();
  ctx.arc(6.5, -5, 2.4, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
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
canvas.addEventListener("mousedown", aletear);
canvas.addEventListener("touchstart", (e) => {
  e.preventDefault();
  aletear();
}, { passive: false });

document.addEventListener("keydown", (e) => {
  if (e.key === " " || e.key === "ArrowUp" || e.key === "w" || e.key === "W") {
    e.preventDefault();
    aletear();
  }
});

overlayBtn.addEventListener("click", nuevaPartida);

// ====== INICIO ======
nuevaPartida();
requestAnimationFrame((t) => { lastT = t; requestAnimationFrame(loop); });
