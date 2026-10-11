/* =========================================================
   Simón — Arcade Nova
   Basado en NekeritDevs/Web-juegos (MIT)
   ========================================================= */

const BEST_KEY = "arcadeNovaSimon-best";
const PAD_MS = 520; // duración de cada luz
const GAP_MS = 160; // pausa entre luces

const pads = [...document.querySelectorAll(".pad")];
const roundEl = document.getElementById("round");
const bestEl = document.getElementById("best");
const statusEl = document.getElementById("status");
const startBtn = document.getElementById("start");
const soundBtn = document.getElementById("sound-toggle");

// Frecuencias clásicas de Simón (E, C#, A, E grave)
const FREQS = [659.25, 554.37, 440.0, 329.63];

let sequence = [],
  inputIndex = 0,
  round = 0,
  best = 0,
  showing = false,
  gameOver = false,
  soundOn = true,
  audioCtx = null;

// ====== SONIDO ======
function tone(freq, duration = 300) {
  if (!soundOn) return;
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === "suspended") audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.25, audioCtx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration / 1000);
    osc.connect(gain).connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration / 1000 + 0.05);
  } catch (_) { /* sin audio disponible */ }
}

function toneError() {
  if (!soundOn) return;
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(160, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(60, audioCtx.currentTime + 0.5);
    gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.55);
    osc.connect(gain).connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.6);
  } catch (_) { /* sin audio disponible */ }
}

// ====== ILUMINACIÓN ======
function light(i, ms = PAD_MS) {
  pads[i].classList.add("lit");
  tone(FREQS[i], ms);
  setTimeout(() => pads[i].classList.remove("lit"), ms);
}

function setStatus(text, cls = "") {
  statusEl.textContent = text;
  statusEl.className = "status" + (cls ? ` ${cls}` : "");
}

// ====== FLUJO ======
function siguienteRonda() {
  round++;
  roundEl.textContent = round;
  sequence.push(Math.floor(Math.random() * 4));
  inputIndex = 0;
  mostrarSecuencia();
}

function mostrarSecuencia() {
  showing = true;
  pads.forEach((p) => (p.disabled = true));
  setStatus(`Mira la secuencia… (${sequence.length})`);
  sequence.forEach((padIndex, step) => {
    setTimeout(() => light(padIndex), 400 + step * (PAD_MS + GAP_MS));
  });
  const total = 400 + sequence.length * (PAD_MS + GAP_MS);
  setTimeout(() => {
    showing = false;
    pads.forEach((p) => (p.disabled = false));
    setStatus("¡Tu turno! Repite la secuencia");
  }, total);
}

function entrada(i) {
  if (showing || gameOver) return;
  light(i, 260);
  if (sequence[inputIndex] === i) {
    inputIndex++;
    if (inputIndex === sequence.length) {
      if (round > best) {
        best = round;
        bestEl.textContent = best;
        try { localStorage.setItem(BEST_KEY, String(best)); } catch (_) { /* modo privado */ }
      }
      setStatus("¡Correcto! 👏", "ok");
      pads.forEach((p) => (p.disabled = true));
      setTimeout(siguienteRonda, 900);
    }
  } else {
    gameOver = true;
    showing = true;
    pads.forEach((p) => (p.disabled = true));
    toneError();
    setStatus(`¡Fallaste! Llegaste a la ronda ${round}`, "error");
    startBtn.innerHTML = '<i class="fa-solid fa-rotate-right"></i> Otra vez';
    startBtn.disabled = false;
  }
}

function empezar() {
  sequence = [];
  inputIndex = 0;
  round = 0;
  gameOver = false;
  roundEl.textContent = "0";
  startBtn.disabled = true;
  siguienteRonda();
}

// ====== EVENTOS ======
pads.forEach((pad) => {
  pad.addEventListener("click", () => entrada(+pad.dataset.i));
});

startBtn.addEventListener("click", empezar);

soundBtn.addEventListener("click", () => {
  soundOn = !soundOn;
  soundBtn.classList.toggle("muted", !soundOn);
  soundBtn.innerHTML = soundOn
    ? '<i class="fa-solid fa-volume-high"></i>'
    : '<i class="fa-solid fa-volume-xmark"></i>';
  if (soundOn) tone(FREQS[0], 200);
});

// ====== INICIO ======
pads.forEach((p) => (p.disabled = true));
try { best = parseInt(localStorage.getItem(BEST_KEY), 10) || 0; } catch (_) { best = 0; }
bestEl.textContent = best;
