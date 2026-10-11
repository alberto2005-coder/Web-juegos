/* =========================================================
   Buscaminas — Arcade Nova
   Basado en NekeritDevs/Web-juegos (MIT)
   ========================================================= */

const SIZE = 9;
const MINES = 10;

const boardEl = document.getElementById("board");
const minesLeftEl = document.getElementById("mines-left");
const timerEl = document.getElementById("timer");
const faceEl = document.getElementById("face");
const restartBtn = document.getElementById("restart");

let grid, // grid[r][c] = { mine, open, flagged, n }
  firstClick, gameOver, won, flags, seconds, timerId;

// ====== CONFIGURACIÓN ======
function crearTablero() {
  grid = Array.from({ length: SIZE }, () =>
    Array.from({ length: SIZE }, () => ({ mine: false, open: false, flagged: false, n: 0 }))
  );
  boardEl.innerHTML = "";
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const cell = document.createElement("button");
      cell.type = "button";
      cell.className = "cell";
      cell.dataset.r = r;
      cell.dataset.c = c;
      cell.setAttribute("aria-label", `Casilla ${r + 1},${c + 1}`);
      boardEl.appendChild(cell);
    }
  }
}

function colocarMinas(exceptoR, exceptoC) {
  let colocadas = 0;
  while (colocadas < MINES) {
    const r = Math.floor(Math.random() * SIZE);
    const c = Math.floor(Math.random() * SIZE);
    const cell = grid[r][c];
    // La primera casilla (y sus vecinas) siempre está segura
    if (cell.mine || Math.abs(r - exceptoR) <= 1 && Math.abs(c - exceptoC) <= 1) continue;
    cell.mine = true;
    colocadas++;
  }
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      grid[r][c].n = vecinos(r, c).filter(([vr, vc]) => grid[vr][vc].mine).length;
    }
  }
}

function vecinos(r, c) {
  const out = [];
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (!dr && !dc) continue;
      const nr = r + dr, nc = c + dc;
      if (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE) out.push([nr, nc]);
    }
  }
  return out;
}

// ====== RENDER ======
function cellEl(r, c) {
  return boardEl.children[r * SIZE + c];
}

function pintar(r, c) {
  const cell = grid[r][c];
  const el = cellEl(r, c);
  el.className = "cell";
  el.textContent = "";
  if (cell.open) {
    el.classList.add("open");
    if (cell.mine) {
      el.classList.add("mine");
      el.textContent = "💣";
    } else if (cell.n > 0) {
      el.classList.add(`c${cell.n}`);
      el.textContent = cell.n;
    }
  } else if (cell.flagged) {
    el.classList.add("flagged");
    el.textContent = "🚩";
  }
}

function actualizarHUD() {
  minesLeftEl.textContent = MINES - flags;
  timerEl.textContent = seconds;
  faceEl.textContent = gameOver ? (won ? "😎" : "💀") : "🙂";
}

// ====== LÓGICA ======
function abrir(r, c) {
  const cell = grid[r][c];
  if (gameOver || cell.open || cell.flagged) return;

  if (firstClick) {
    firstClick = false;
    colocarMinas(r, c);
    iniciarTemporizador();
  }

  if (cell.mine) {
    cell.open = true;
    cellEl(r, c).classList.add("boom");
    return perder();
  }

  // Flood fill iterativo para celdas vacías
  const pila = [[r, c]];
  while (pila.length) {
    const [cr, cc] = pila.pop();
    const cur = grid[cr][cc];
    if (cur.open || cur.flagged) continue;
    cur.open = true;
    pintar(cr, cc);
    if (cur.n === 0) {
      for (const [nr, nc] of vecinos(cr, cc)) {
        if (!grid[nr][nc].open) pila.push([nr, nc]);
      }
    }
  }
  comprobarVictoria();
}

function marcar(r, c) {
  const cell = grid[r][c];
  if (gameOver || cell.open) return;
  cell.flagged = !cell.flagged;
  flags += cell.flagged ? 1 : -1;
  pintar(r, c);
  actualizarHUD();
  comprobarVictoria();
}

function comprobarVictoria() {
  let abiertas = 0;
  for (const row of grid) for (const cell of row) if (cell.open) abiertas++;
  if (abiertas === SIZE * SIZE - MINES) {
    won = true;
    gameOver = true;
    detenerTemporizador();
    // Marcar todas las minas restantes
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if (grid[r][c].mine && !grid[r][c].flagged) {
          grid[r][c].flagged = true;
          pintar(r, c);
        }
      }
    }
    flags = MINES;
    actualizarHUD();
  }
}

function perder() {
  gameOver = true;
  detenerTemporizador();
  // Revelar todas las minas
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (grid[r][c].mine) {
        grid[r][c].open = true;
        pintar(r, c);
      }
    }
  }
  actualizarHUD();
}

// ====== TEMPORIZADOR ======
function iniciarTemporizador() {
  detenerTemporizador();
  timerId = setInterval(() => {
    seconds++;
    actualizarHUD();
  }, 1000);
}

function detenerTemporizador() {
  if (timerId) clearInterval(timerId);
  timerId = null;
}

// ====== NUEVA PARTIDA ======
function nuevaPartida() {
  crearTablero();
  firstClick = true;
  gameOver = false;
  won = false;
  flags = 0;
  seconds = 0;
  detenerTemporizador();
  actualizarHUD();
}

// ====== EVENTOS ======
boardEl.addEventListener("click", (e) => {
  const el = e.target.closest(".cell");
  if (!el) return;
  abrir(+el.dataset.r, +el.dataset.c);
});

boardEl.addEventListener("contextmenu", (e) => {
  e.preventDefault();
  const el = e.target.closest(".cell");
  if (!el) return;
  marcar(+el.dataset.r, +el.dataset.c);
});

// Clic largo = bandera (táctil)
let longTimer = null;
boardEl.addEventListener("touchstart", (e) => {
  const el = e.target.closest(".cell");
  if (!el) return;
  longTimer = setTimeout(() => {
    marcar(+el.dataset.r, +el.dataset.c);
    longTimer = null;
  }, 400);
}, { passive: true });

boardEl.addEventListener("touchend", () => {
  if (longTimer) {
    clearTimeout(longTimer);
    longTimer = null;
  }
});

boardEl.addEventListener("touchmove", () => {
  if (longTimer) {
    clearTimeout(longTimer);
    longTimer = null;
  }
}, { passive: true });

restartBtn.addEventListener("click", nuevaPartida);
faceEl.addEventListener("click", nuevaPartida);

nuevaPartida();
