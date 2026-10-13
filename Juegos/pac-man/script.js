/* =========================================================
   Pac-Man — Arcade Nova
   Basado en NekeritDevs/Web-juegos (MIT)
   ========================================================= */

// Configuración del juego
const BOARD_WIDTH = 21;
const BOARD_HEIGHT = 21;
const TICK_MS = 150; // ritmo del juego (movimiento continuo)

// Mapa del laberinto (1 = pared, 0 = punto, 2 = power pellet, 3 = vacío)
const maze = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1],
    [1,2,1,1,1,0,1,1,1,0,1,0,1,1,1,0,1,1,1,2,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,1,0,1,0,1,1,1,1,1,0,1,0,1,1,1,0,1],
    [1,0,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,0,1],
    [1,1,1,1,1,0,1,1,1,3,1,3,1,1,1,0,1,1,1,1,1],
    [1,1,1,1,1,0,1,3,3,3,3,3,3,3,1,0,1,1,1,1,1],
    [1,1,1,1,1,0,1,3,1,1,3,1,1,3,1,0,1,1,1,1,1],
    [3,3,3,3,3,0,3,3,1,3,3,3,1,3,3,0,3,3,3,3,3],
    [1,1,1,1,1,0,1,3,1,3,3,3,1,3,1,0,1,1,1,1,1],
    [1,1,1,1,1,0,1,3,1,1,1,1,1,3,1,0,1,1,1,1,1],
    [1,1,1,1,1,0,1,3,3,3,3,3,3,3,1,0,1,1,1,1,1],
    [1,1,1,1,1,0,1,1,1,3,1,3,1,1,1,0,1,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,1,0,1,1,1,0,1,0,1,1,1,0,1,1,1,0,1],
    [1,2,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,2,1],
    [1,1,1,0,1,0,1,0,1,1,1,1,1,0,1,0,1,0,1,1,1],
    [1,0,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,0,1],
    [1,0,1,1,1,1,1,1,1,0,1,0,1,1,1,1,1,1,1,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

// Copia original SIEMPRE limpia (evita que el laberinto se corrompa al reiniciar)
const MAZE_ORIGINAL = maze.map((fila) => fila.slice());

// Variables del juego
const gameBoard = document.getElementById("gameBoard");
const overlayEl = document.getElementById("overlay");
const overlayTitle = document.getElementById("overlay-title");
const overlayText = document.getElementById("overlay-text");
const overlayBtn = document.getElementById("overlay-btn");
const startBtn = document.getElementById("startBtn");

let score = 0;
let lives = 3;
let gameRunning = false;
let powerPelletActive = false;
let powerPelletTimer = 0;
let dotsComidos = 0;
let fantasmaCombo = 0;
let freezeTicks = 0; // pausa breve al perder una vida
let loopTimer = null;
let colaDireccion = null; // turno en cola (estilo clásico)

// Posición de Pac-Man
let pacman = { x: 10, y: 15, direction: "right" };

// Fantasmas iniciales con comportamientos únicos
let ghosts = [
    { x: 10, y: 8, direction: "up", color: "red", scared: false, name: "blinky" },
    { x: 8, y: 8, direction: "left", color: "pink", scared: false, name: "pinky" },
    { x: 12, y: 8, direction: "right", color: "cyan", scared: false, name: "inky" },
    { x: 10, y: 12, direction: "down", color: "orange", scared: false, name: "clyde" },
];

let modeTimer = 0;
let currentMode = "scatter"; // scatter o chase
let ghostMoveCounter = 0;

const OPPOSITE = { up: "down", down: "up", left: "right", right: "left" };
const DELTA = { up: { x: 0, y: -1 }, down: { x: 0, y: 1 }, left: { x: -1, y: 0 }, right: { x: 1, y: 0 } };

// ====== TABLERO (se construye una sola vez) ======
function createBoard() {
    gameBoard.innerHTML = "";

    for (let row = 0; row < BOARD_HEIGHT; row++) {
        for (let col = 0; col < BOARD_WIDTH; col++) {
            const cell = document.createElement("div");
            cell.className = "cell";
            cell.id = `cell-${col}-${row}`;

            switch (maze[row][col]) {
                case 1: cell.classList.add("wall"); break;
                case 0: cell.classList.add("dot"); break;
                case 2: cell.classList.add("power-pellet"); break;
            }

            gameBoard.appendChild(cell);
        }
    }
}

// ====== DIBUJO DE ENTIDADES ======
function drawEntities() {
    // Limpiar clases de entidades (los puntos NO se tocan)
    gameBoard.querySelectorAll(".pacman, .ghost").forEach((el) => {
        el.classList.remove(
            "pacman", "up", "down", "left", "right",
            "ghost", "red", "pink", "cyan", "orange", "scared"
        );
    });

    const celdaP = document.getElementById(`cell-${pacman.x}-${pacman.y}`);
    if (celdaP) celdaP.classList.add("pacman", pacman.direction);

    ghosts.forEach((ghost) => {
        const celda = document.getElementById(`cell-${ghost.x}-${ghost.y}`);
        if (!celda) return;
        celda.classList.add("ghost", ghost.color, ghost.direction);
        if (ghost.scared) celda.classList.add("scared");
    });
}

// ====== MOVIMIENTO DE PAC-MAN (continuo) ======
function hayCamino(x, y, dir) {
    const d = DELTA[dir];
    if (!d) return false;
    let nx = x + d.x;
    let ny = y + d.y;
    if (nx < 0) nx = BOARD_WIDTH - 1;
    if (nx >= BOARD_WIDTH) nx = 0;
    if (ny < 0 || ny >= BOARD_HEIGHT) return false;
    return maze[ny][nx] !== 1;
}

function pasoPacman() {
    // 1) Ejecutar el turno en cola si ya es posible (giros estilo clásico)
    if (colaDireccion) {
        if (colaDireccion === pacman.direction || hayCamino(pacman.x, pacman.y, colaDireccion)) {
            pacman.direction = colaDireccion;
            colaDireccion = null;
        }
    }

    // 2) Avanzar una casilla en la dirección actual
    if (!hayCamino(pacman.x, pacman.y, pacman.direction)) return;
    const d = DELTA[pacman.direction];
    let nx = pacman.x + d.x;
    let ny = pacman.y + d.y;
    if (nx < 0) nx = BOARD_WIDTH - 1;
    if (nx >= BOARD_WIDTH) nx = 0;
    if (ny < 0 || ny >= BOARD_HEIGHT) return;

    pacman.x = nx;
    pacman.y = ny;
    comer(nx, ny);
}

function comer(x, y) {
    const valor = maze[y][x];
    if (valor !== 0 && valor !== 2) return;

    const celda = document.getElementById(`cell-${x}-${y}`);
    maze[y][x] = 3;
    dotsComidos++;

    if (valor === 0) {
        if (celda) celda.classList.remove("dot");
        score += 10;
    } else {
        if (celda) celda.classList.remove("power-pellet");
        score += 50;
        powerPelletActive = true;
        powerPelletTimer = 45; // ≈ 7 s de pánico
        fantasmaCombo = 0;
        ghosts.forEach((g) => (g.scared = true));
    }

    updateScore();
    checkWin();
}

// ====== IA DE FANTASMAS ======
function getGhostTarget(ghost) {
    if (ghost.scared) {
        // Los asustados huyen hacia esquinas
        const corners = [
            { x: 1, y: 1 }, { x: 19, y: 1 },
            { x: 1, y: 19 }, { x: 19, y: 19 },
        ];
        return corners[Math.floor(Math.random() * corners.length)];
    }

    switch (ghost.name) {
        case "blinky": // Rojo - persigue directamente
            return currentMode === "chase"
                ? { x: pacman.x, y: pacman.y }
                : { x: 18, y: 1 };

        case "pinky": { // Rosa - embosca 4 casillas adelante
            if (currentMode !== "chase") return { x: 2, y: 1 };
            let tx = pacman.x;
            let ty = pacman.y;
            const d = DELTA[pacman.direction];
            tx += d.x * 4;
            ty += d.y * 4;
            return {
                x: Math.max(0, Math.min(BOARD_WIDTH - 1, tx)),
                y: Math.max(0, Math.min(BOARD_HEIGHT - 1, ty)),
            };
        }

        case "inky": { // Cian - reflejo doble respecto a Blinky
            if (currentMode !== "chase") return { x: 18, y: 19 };
            const blinky = ghosts.find((g) => g.name === "blinky");
            const d = DELTA[pacman.direction];
            const ahead = { x: pacman.x + d.x * 2, y: pacman.y + d.y * 2 };
            const tx = ahead.x + (ahead.x - blinky.x);
            const ty = ahead.y + (ahead.y - blinky.y);
            return {
                x: Math.max(0, Math.min(BOARD_WIDTH - 1, tx)),
                y: Math.max(0, Math.min(BOARD_HEIGHT - 1, ty)),
            };
        }

        case "clyde": { // Naranja - persigue si está lejos, huye si está cerca
            if (currentMode !== "chase") return { x: 2, y: 19 };
            const dist = Math.abs(ghost.x - pacman.x) + Math.abs(ghost.y - pacman.y);
            return dist > 8 ? { x: pacman.x, y: pacman.y } : { x: 2, y: 19 };
        }

        default:
            return { x: pacman.x, y: pacman.y };
    }
}

function moveGhosts() {
    ghosts.forEach((ghost) => {
        const target = getGhostTarget(ghost);
        const directions = ["up", "down", "left", "right"];
        const validMoves = [];

        directions.forEach((dir) => {
            if (dir === OPPOSITE[ghost.direction]) return; // no retroceder
            let nx = ghost.x + DELTA[dir].x;
            let ny = ghost.y + DELTA[dir].y;
            if (nx < 0) nx = BOARD_WIDTH - 1;
            if (nx >= BOARD_WIDTH) nx = 0;
            if (ny < 0 || ny >= BOARD_HEIGHT) return;
            if (maze[ny][nx] === 1) return;
            validMoves.push({
                direction: dir,
                x: nx,
                y: ny,
                distance: Math.abs(nx - target.x) + Math.abs(ny - target.y),
            });
        });

        // Si solo puede retroceder, lo permite
        let elegir = validMoves;
        if (elegir.length === 0) {
            directions.forEach((dir) => {
                let nx = ghost.x + DELTA[dir].x;
                let ny = ghost.y + DELTA[dir].y;
                if (nx < 0) nx = BOARD_WIDTH - 1;
                if (nx >= BOARD_WIDTH) nx = 0;
                if (ny < 0 || ny >= BOARD_HEIGHT) return;
                if (maze[ny][nx] === 1) return;
                elegir.push({
                    direction: dir,
                    x: nx,
                    y: ny,
                    distance: Math.abs(nx - target.x) + Math.abs(ny - target.y),
                });
            });
        }

        if (elegir.length > 0) {
            elegir.sort((a, b) =>
                ghost.scared ? b.distance - a.distance : a.distance - b.distance
            );
            const mejor = elegir[0];
            ghost.x = mejor.x;
            ghost.y = mejor.y;
            ghost.direction = mejor.direction;
        }
    });
}

// ====== COLISIONES ======
function checkCollisions() {
    for (const ghost of ghosts) {
        if (ghost.x !== pacman.x || ghost.y !== pacman.y) continue;

        if (ghost.scared) {
            // Comer fantasma: 200 → 400 → 800 → 1600 durante el mismo power pellet
            score += 200 * Math.pow(2, Math.min(fantasmaCombo, 3));
            fantasmaCombo++;
            ghost.scared = false;
            ghost.x = 10;
            ghost.y = 10;
            updateScore();
        } else {
            lives--;
            updateLives();
            if (lives <= 0) {
                gameOver();
            } else {
                resetPositions();
                freezeTicks = 8; // ≈ 1,2 s para reaccionar
            }
            return;
        }
    }
}

function resetPositions() {
    pacman = { x: 10, y: 15, direction: "right" };
    ghosts = [
        { x: 10, y: 8, direction: "up", color: "red", scared: false, name: "blinky" },
        { x: 8, y: 8, direction: "left", color: "pink", scared: false, name: "pinky" },
        { x: 12, y: 8, direction: "right", color: "cyan", scared: false, name: "inky" },
        { x: 10, y: 12, direction: "down", color: "orange", scared: false, name: "clyde" },
    ];
    powerPelletActive = false;
    powerPelletTimer = 0;
    fantasmaCombo = 0;
    modeTimer = 0;
    currentMode = "scatter";
    ghostMoveCounter = 0;
    colaDireccion = null;
}

// ====== ESTADOS ======
function checkWin() {
    if (!gameRunning) return;
    for (let row = 0; row < BOARD_HEIGHT; row++) {
        for (let col = 0; col < BOARD_WIDTH; col++) {
            if (maze[row][col] === 0 || maze[row][col] === 2) return;
        }
    }
    // ¡Tablero limpio!
    gameRunning = false;
    clearTimeout(loopTimer);
    startBtn.textContent = "INICIAR JUEGO";
    mostrarOverlay("¡Tablero limpio! 🎉", `Puntuación: ${score}`, "Jugar otra vez");
}

function updateScore() {
    document.getElementById("score").textContent = score;
}

function updateLives() {
    document.getElementById("lives").textContent = lives;
}

function gameOver() {
    gameRunning = false;
    clearTimeout(loopTimer);
    startBtn.textContent = "INICIAR JUEGO";
    mostrarOverlay("¡Juego terminado!", `Puntuación final: ${score}`, "Jugar otra vez");
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

// ====== PARTIDA ======
function startGame() {
    score = 0;
    lives = 3;
    gameRunning = true;
    powerPelletActive = false;
    powerPelletTimer = 0;
    dotsComidos = 0;
    fantasmaCombo = 0;
    freezeTicks = 0;

    startBtn.textContent = "REINICIAR JUEGO";
    ocultarOverlay();

    // Restaurar el laberinto desde la copia original (sin corrupciones)
    for (let row = 0; row < BOARD_HEIGHT; row++) {
        for (let col = 0; col < BOARD_WIDTH; col++) {
            maze[row][col] = MAZE_ORIGINAL[row][col];
        }
    }

    resetPositions();
    createBoard();
    updateScore();
    updateLives();

    // Un solo bucle activo
    clearTimeout(loopTimer);
    loopTimer = setTimeout(tick, TICK_MS);
}

// ====== BUCLE PRINCIPAL ======
function tick() {
    if (!gameRunning) return;

    if (freezeTicks > 0) {
        freezeTicks--;
        drawEntities();
        loopTimer = setTimeout(tick, TICK_MS);
        return;
    }

    // Alternar scatter/chase cada ~18 s
    modeTimer++;
    if (modeTimer >= 120) {
        currentMode = currentMode === "scatter" ? "chase" : "scatter";
        modeTimer = 0;
        ghosts.forEach((g) => (g.direction = OPPOSITE[g.direction]));
    }

    // Fin del power pellet
    if (powerPelletActive) {
        powerPelletTimer--;
        if (powerPelletTimer <= 0) {
            powerPelletActive = false;
            ghosts.forEach((g) => (g.scared = false));
        }
    }

    pasoPacman();

    // Fantasmas: a mitad de partida aceleran (cada tick en vez de cada 2)
    ghostMoveCounter++;
    const cada = dotsComidos >= 100 ? 1 : 2;
    if (ghostMoveCounter >= cada) {
        moveGhosts();
        ghostMoveCounter = 0;
    }

    checkCollisions();
    drawEntities();

    loopTimer = setTimeout(tick, TICK_MS);
}

// ====== CONTROLES ======
const TECLAS = {
    ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right",
    w: "up", s: "down", a: "left", d: "right",
    W: "up", S: "down", A: "left", D: "right",
};

document.addEventListener("keydown", (e) => {
    const dir = TECLAS[e.key];
    if (!dir) return;
    e.preventDefault(); // las flechas ya no desplazan la página
    if (!gameRunning) return;
    colaDireccion = dir;
});

// Control táctil: deslizar sobre el laberinto
const boardWrap = document.querySelector(".board-wrap");
let touchX = null;
let touchY = null;

boardWrap.addEventListener("touchstart", (e) => {
    touchX = e.touches[0].clientX;
    touchY = e.touches[0].clientY;
}, { passive: true });

boardWrap.addEventListener("touchmove", (e) => {
    if (touchX === null || !gameRunning) return;
    const dx = e.touches[0].clientX - touchX;
    const dy = e.touches[0].clientY - touchY;
    if (Math.abs(dx) + Math.abs(dy) < 24) return;
    let dir;
    if (Math.abs(dx) > Math.abs(dy)) dir = dx > 0 ? "right" : "left";
    else dir = dy > 0 ? "down" : "up";
    colaDireccion = dir;
    // permite giros en cadena sin levantar el dedo
    touchX = e.touches[0].clientX;
    touchY = e.touches[0].clientY;
}, { passive: true });

boardWrap.addEventListener("touchend", () => {
    const empezar = !gameRunning && overlayEl.hidden;
    touchX = null;
    touchY = null;
    if (empezar) startGame(); // tocar el tablero también inicia
}, { passive: true });

// Botón del overlay
overlayBtn.addEventListener("click", startGame);

// ====== INICIO (tablero estático) ======
createBoard();
drawEntities();
updateScore();
updateLives();
