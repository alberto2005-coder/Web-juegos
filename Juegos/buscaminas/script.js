/* =========================================================
   Buscaminas — Arcade Nova
   Basado en NekeritDevs/Web-juegos (MIT)
   ========================================================= */

const NIVELES = {
  facil:   { filas: 9,  cols: 9,  minas: 10 },
  medio:   { filas: 16, cols: 16, minas: 40 },
  experto: { filas: 16, cols: 30, minas: 99 },
};
const NIVEL_KEY = "arcadeNovaBuscaminas-nivel";

const boardEl = document.getElementById("board");
const minesLeftEl = document.getElementById("mines-left");
const timerEl = document.getElementById("timer");
const faceEl = document.getElementById("face");
const restartBtn = document.getElementById("restart");
const levelBtns = [...document.querySelectorAll(".level")];

let nivel, // clave del nivel activo
  ROWS, COLS, MINAS,
  grid, // grid[r][c] = { mine, open, flagged, n }
  firstClick, gameOver, won, flags, seconds, timerId;

// ====== CONFIGURACIÓN ======
function aplicarNivel(clave) {
  nivel = clave;
  ({ filas: ROWS, cols: COLS, minas: MINAS } = NIVELES[nivel]);
  levelBtns.forEach((b) => b.classList.toggle("active", b.dataset.level === nivel));
  boardEl.className = `board level-${nivel}`;
  // minmax(0, 1fr) evita que el contenido infle las columnas/filas (tableros grandes)
  boardEl.style.gridTemplateColumns = `repeat(${COLS}, minmax(0, 1fr))`;
  boardEl.style.gridAutoRows = "minmax(0, 1fr)";
  boardEl.style.aspectRatio = `${COLS} / ${ROWS}`;
  try { localStorage.setItem(NIVEL_KEY, nivel); } catch (_) { /* modo privado */ }
}

function crearTablero() {
  grid = Array.from({ length: ROWS }, () =>
    Array.from({ length: COLS }, () => ({ mine: false, open: false, flagged: false, n: 0 }))
  );
  boardEl.innerHTML = "";
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
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
  while (colocadas < MINAS) {
    const r = Math.floor(Math.random() * ROWS);
    const c = Math.floor(Math.random() * COLS);
    const cell = grid[r][c];
    // La primera casilla (y sus vecinas) siempre está segura
    if (cell.mine || (Math.abs(r - exceptoR) <= 1 && Math.abs(c - exceptoC) <= 1)) continue;
    cell.mine = true;
    colocadas++;
  }
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
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
      if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) out.push([nr, nc]);
    }
  }
  return out;
}

// ====== RENDER ======
function cellEl(r, c) {
  return boardEl.children[r * COLS + c];
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
  minesLeftEl.textContent = MINAS - flags;
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
  if (abiertas === ROWS * COLS - MINAS) {
    won = true;
    gameOver = true;
    detenerTemporizador();
    // Marcar todas las minas restantes
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (grid[r][c].mine && !grid[r][c].flagged) {
          grid[r][c].flagged = true;
          pintar(r, c);
        }
      }
    }
    flags = MINAS;
    actualizarHUD();
  }
}

function perder() {
  gameOver = true;
  detenerTemporizador();
  // Revelar todas las minas
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
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

levelBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    aplicarNivel(btn.dataset.level);
    nuevaPartida();
  });
});

// ====== INICIO ======
(function init() {
  let guardado = "facil";
  try { guardado = localStorage.getItem(NIVEL_KEY) || "facil"; } catch (_) { /* modo privado */ }
  if (!NIVELES[guardado]) guardado = "facil";
  aplicarNivel(guardado);
  nuevaPartida();
})();
