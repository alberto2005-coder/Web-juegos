/* =========================================================
   2048 — Arcade Nova
   Basado en NekeritDevs/Web-juegos (MIT)
   ========================================================= */

const SIZE = 4;
const MERGE_DELAY = 130;
const SPAWN_DELAY = 145;
const BEST_KEY = "arcadeNova2048-best";

const boardEl = document.getElementById("board");
const scoreEl = document.getElementById("score");
const bestEl = document.getElementById("best");
const overlayEl = document.getElementById("overlay");
const overlayTitle = document.getElementById("overlay-title");
const overlayText = document.getElementById("overlay-text");
const playAgainBtn = document.getElementById("play-again");
const newGameBtn = document.getElementById("new-game");

const VECTORS = {
  up: [-1, 0],
  down: [1, 0],
  left: [0, -1],
  right: [0, 1],
};

let grid, score, best, over, won, continued, nextId;

// ====== UTILIDADES ======
function emptyGrid() {
  return Array.from({ length: SIZE }, () => Array(SIZE).fill(null));
}

function inBounds(r, c) {
  return r >= 0 && r < SIZE && c >= 0 && c < SIZE;
}

function setPos(el, r, c) {
  // 100% = ancho propio de la ficha; el pitch de celda es ficha + hueco
  el.style.transform =
    `translate(calc((100% + var(--gap)) * ${c}), calc((100% + var(--gap)) * ${r}))`;
}

function valueClass(v) {
  return `v-${Math.min(v, 2048)}`;
}

// ====== RENDER ======
function renderAll() {
  boardEl.querySelectorAll(".tile").forEach((t) => t.remove());
  for (const row of grid) {
    for (const tile of row) {
      if (tile) renderTile(tile, false);
    }
  }
}

function renderTile(tile, isNew) {
  const el = document.createElement("div");
  el.className = `tile ${valueClass(tile.value)}${isNew ? " tile-new" : ""}`;
  el.textContent = tile.value;
  setPos(el, tile.r, tile.c);
  boardEl.appendChild(el);
  tile.el = el;
}

// ====== LÓGICA ======
function spawn() {
  const vacias = [];
  grid.forEach((row, r) => row.forEach((cell, c) => { if (!cell) vacias.push([r, c]); }));
  if (!vacias.length) return;
  const [r, c] = vacias[Math.floor(Math.random() * vacias.length)];
  const tile = { id: nextId++, value: Math.random() < 0.9 ? 2 : 4, r, c, locked: false };
  grid[r][c] = tile;
  renderTile(tile, true);
}

function updateScore(gained) {
  scoreEl.textContent = score;
  scoreEl.parentElement.classList.remove("bump");
  void scoreEl.parentElement.offsetWidth; // reinicia la animación
  scoreEl.parentElement.classList.add("bump");

  if (score > best) {
    best = score;
    bestEl.textContent = best;
    try { localStorage.setItem(BEST_KEY, String(best)); } catch (_) { /* modo privado */ }
  }
}

function move(dir) {
  if (over) return;
  const [dr, dc] = VECTORS[dir];
  const rows = [...Array(SIZE).keys()];
  const cols = [...Array(SIZE).keys()];
  if (dr === 1) rows.reverse();
  if (dc === 1) cols.reverse();

  for (const row of grid) for (const tile of row) if (tile) tile.locked = false;

  let moved = false;
  let gained = 0;
  const newGrid = emptyGrid();
  const merges = [];

  for (const r of rows) {
    for (const c of cols) {
      const tile = grid[r][c];
      if (!tile) continue;

      let nr = r, nc = c;
      while (inBounds(nr + dr, nc + dc) && !newGrid[nr + dr][nc + dc]) {
        nr += dr; nc += dc;
      }

      const ar = nr + dr, ac = nc + dc;
      const ahead = inBounds(ar, ac) ? newGrid[ar][ac] : null;

      if (ahead && ahead.value === tile.value && !ahead.locked) {
        ahead.locked = true;
        setPos(tile.el, ar, ac); // la ficha absorbida vuela hacia la otra
        tile.el.classList.add("tile-gone");
        const dead = tile.el;
        const newValue = ahead.value * 2;
        gained += newValue;
        merges.push(new Promise((resolve) => setTimeout(() => {
          dead.remove();
          ahead.value = newValue;
          ahead.el.textContent = newValue;
          ahead.el.className = `tile ${valueClass(newValue)} tile-pop`;
          resolve();
        }, MERGE_DELAY)));
        moved = true;
      } else {
        newGrid[nr][nc] = tile;
        if (nr !== r || nc !== c) {
          tile.r = nr; tile.c = nc;
          setPos(tile.el, nr, nc);
          moved = true;
        }
      }
    }
  }

  if (!moved) {
    boardEl.classList.remove("shake");
    void boardEl.offsetWidth;
    boardEl.classList.add("shake");
    return;
  }

  grid = newGrid;
  score += gained;
  if (gained > 0) updateScore(gained);

  setTimeout(() => {
    if (!won && !continued && alcanzo2048()) {
      won = true;
      mostrarOverlay("¡Lo lograste! 🎉", "Has llegado a la ficha 2048. ¿Seguimos jugando?", "Continuar");
    }
    spawn();
    if (!hayMovidas()) {
      over = true;
      mostrarOverlay("¡Juego terminado!", `Puntuación final: ${score}`, "Jugar otra vez");
    }
  }, SPAWN_DELAY);

  return Promise.all(merges);
}

function alcanzo2048() {
  return grid.some((row) => row.some((t) => t && t.value >= 2048));
}

function hayMovidas() {
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (!grid[r][c]) return true;
      const v = grid[r][c].value;
      if (inBounds(r + 1, c) && grid[r + 1][c] && grid[r + 1][c].value === v) return true;
      if (inBounds(r, c + 1) && grid[r][c + 1] && grid[r][c + 1].value === v) return true;
    }
  }
  return false;
}

function mostrarOverlay(titulo, texto, boton) {
  overlayTitle.textContent = titulo;
  overlayText.textContent = texto;
  playAgainBtn.textContent = boton;
  overlayEl.hidden = false;
}

function ocultarOverlay() {
  overlayEl.hidden = true;
}

function newGame() {
  grid = emptyGrid();
  score = 0;
  over = false;
  won = false;
  continued = false;
  scoreEl.textContent = "0";
  ocultarOverlay();
  spawn();
  spawn();
}

// ====== CONTROLES ======
document.addEventListener("keydown", (e) => {
  const map = {
    ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right",
    w: "up", s: "down", a: "left", d: "right",
    W: "up", S: "down", A: "left", D: "right",
  };
  const dir = map[e.key];
  if (!dir) return;
  e.preventDefault();
  move(dir);
});

let touchStart = null;
boardEl.addEventListener("touchstart", (e) => {
  const t = e.changedTouches[0];
  touchStart = { x: t.clientX, y: t.clientY };
}, { passive: true });

boardEl.addEventListener("touchend", (e) => {
  if (!touchStart) return;
  const t = e.changedTouches[0];
  const dx = t.clientX - touchStart.x;
  const dy = t.clientY - touchStart.y;
  touchStart = null;
  const absX = Math.abs(dx), absY = Math.abs(dy);
  if (Math.max(absX, absY) < 24) return;
  move(absX > absY ? (dx > 0 ? "right" : "left") : (dy > 0 ? "down" : "up"));
}, { passive: true });

playAgainBtn.addEventListener("click", () => {
  if (won && !over && continued === false) {
    continued = true;
    ocultarOverlay();
    return;
  }
  newGame();
});

newGameBtn.addEventListener("click", newGame);

// ====== INICIO ======
(function init() {
  // Fondo del tablero (16 casillas vacías)
  const bg = document.createElement("div");
  bg.className = "board-bg";
  for (let i = 0; i < SIZE * SIZE; i++) bg.appendChild(document.createElement("span"));
  boardEl.appendChild(bg);

  try { best = parseInt(localStorage.getItem(BEST_KEY), 10) || 0; } catch (_) { best = 0; }
  bestEl.textContent = best;

  newGame();
})();
