const ROWS = 6;
const COLS = 7;
let boardState = []; // 0 = empty, 1 = red, 2 = yellow
let currentPlayer = 1;
let isGameOver = false;
let scores = { 1: 0, 2: 0 };
let vsAI = true;

// Audio synth
let audioCtx = null;
function playSound(freq, type = 'sine', duration = 0.15) {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch (e) {}
}

const boardEl = document.getElementById('board');
const previewRowEl = document.getElementById('previewRow');
const score1El = document.getElementById('score1');
const score2El = document.getElementById('score2');
const card1 = document.getElementById('scoreCard1');
const card2 = document.getElementById('scoreCard2');
const turnHighlight = document.getElementById('currentTurnName');
const modeSelect = document.getElementById('gameMode');
const p2Name = document.getElementById('p2Name');
const resetBtn = document.getElementById('resetBtn');
const winModal = document.getElementById('winModal');
const winnerText = document.getElementById('winnerText');
const winnerSub = document.getElementById('winnerSub');
const modalPlayAgain = document.getElementById('modalPlayAgain');

function initGame() {
  boardState = Array(ROWS).fill(null).map(() => Array(COLS).fill(0));
  currentPlayer = 1;
  isGameOver = false;
  winModal.classList.add('hidden');
  updateTurnDisplay();
  renderBoard();
}

function renderBoard() {
  boardEl.innerHTML = '';
  previewRowEl.innerHTML = '';

  // Render preview indicators
  for (let c = 0; c < COLS; c++) {
    const previewCell = document.createElement('div');
    previewCell.className = 'preview-cell';
    const disc = document.createElement('div');
    disc.className = `preview-disc ${currentPlayer === 1 ? 'red' : 'yellow'}`;
    disc.id = `preview-${c}`;
    previewCell.appendChild(disc);
    previewRowEl.appendChild(previewCell);
  }

  // Render board cells
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.dataset.row = r;
      cell.dataset.col = c;

      if (boardState[r][c] !== 0) {
        const disc = document.createElement('div');
        disc.className = `disc ${boardState[r][c] === 1 ? 'red' : 'yellow'}`;
        cell.appendChild(disc);
      }

      cell.addEventListener('mouseenter', () => showPreview(c));
      cell.addEventListener('mouseleave', () => hidePreview(c));
      cell.addEventListener('click', () => handleColClick(c));

      boardEl.appendChild(cell);
    }
  }
}

function showPreview(col) {
  if (isGameOver) return;
  if (vsAI && currentPlayer === 2) return;
  const pDisc = document.getElementById(`preview-${col}`);
  if (pDisc) {
    pDisc.className = `preview-disc visible ${currentPlayer === 1 ? 'red' : 'yellow'}`;
  }
}

function hidePreview(col) {
  const pDisc = document.getElementById(`preview-${col}`);
  if (pDisc) {
    pDisc.classList.remove('visible');
  }
}

function handleColClick(col) {
  if (isGameOver) return;
  if (vsAI && currentPlayer === 2) return;
  dropPiece(col);
}

function dropPiece(col) {
  // Find lowest available row in column
  let targetRow = -1;
  for (let r = ROWS - 1; r >= 0; r--) {
    if (boardState[r][col] === 0) {
      targetRow = r;
      break;
    }
  }

  if (targetRow === -1) return; // Column full

  boardState[targetRow][col] = currentPlayer;
  playSound(currentPlayer === 1 ? 400 : 520, 'sine', 0.12);

  // Update cell visually
  const cell = document.querySelector(`.cell[data-row='${targetRow}'][data-col='${col}']`);
  if (cell) {
    const disc = document.createElement('div');
    disc.className = `disc ${currentPlayer === 1 ? 'red' : 'yellow'}`;
    cell.appendChild(disc);
  }

  const winCombo = checkWin(boardState, currentPlayer);
  if (winCombo) {
    handleWin(currentPlayer, winCombo);
    return;
  }

  if (checkDraw()) {
    handleDraw();
    return;
  }

  // Switch turn
  currentPlayer = currentPlayer === 1 ? 2 : 1;
  updateTurnDisplay();

  // If AI mode and player 2 turn
  if (vsAI && currentPlayer === 2 && !isGameOver) {
    setTimeout(makeAIMove, 450);
  }
}

function updateTurnDisplay() {
  card1.classList.toggle('active', currentPlayer === 1);
  card2.classList.toggle('active', currentPlayer === 2);
  
  if (currentPlayer === 1) {
    turnHighlight.textContent = 'Rojo';
    turnHighlight.style.color = '#ef4444';
  } else {
    turnHighlight.textContent = vsAI ? 'IA (Amarillo)' : 'Amarillo';
    turnHighlight.style.color = '#eab308';
  }
}

function checkWin(state, player) {
  // Horizontal
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c <= COLS - 4; c++) {
      if (state[r][c] === player && state[r][c+1] === player && state[r][c+2] === player && state[r][c+3] === player) {
        return [[r,c], [r,c+1], [r,c+2], [r,c+3]];
      }
    }
  }

  // Vertical
  for (let c = 0; c < COLS; c++) {
    for (let r = 0; r <= ROWS - 4; r++) {
      if (state[r][c] === player && state[r+1][c] === player && state[r+2][c] === player && state[r+3][c] === player) {
        return [[r,c], [r+1,c], [r+2,c], [r+3,c]];
      }
    }
  }

  // Diagonal Down-Right
  for (let r = 0; r <= ROWS - 4; r++) {
    for (let c = 0; c <= COLS - 4; c++) {
      if (state[r][c] === player && state[r+1][c+1] === player && state[r+2][c+2] === player && state[r+3][c+3] === player) {
        return [[r,c], [r+1,c+1], [r+2,c+2], [r+3,c+3]];
      }
    }
  }

  // Diagonal Up-Right
  for (let r = 3; r < ROWS; r++) {
    for (let c = 0; c <= COLS - 4; c++) {
      if (state[r][c] === player && state[r-1][c+1] === player && state[r-2][c+2] === player && state[r-3][c+3] === player) {
        return [[r,c], [r-1,c+1], [r-2,c+2], [r-3,c+3]];
      }
    }
  }

  return null;
}

function checkDraw() {
  return boardState.every(row => row.every(cell => cell !== 0));
}

function handleWin(winner, combo) {
  isGameOver = true;
  scores[winner]++;
  score1El.textContent = scores[1];
  score2El.textContent = scores[2];

  combo.forEach(([r, c]) => {
    const cell = document.querySelector(`.cell[data-row='${r}'][data-col='${c}'] .disc`);
    if (cell) cell.classList.add('winning');
  });

  playSound(587, 'triangle', 0.2);
  setTimeout(() => playSound(880, 'triangle', 0.4), 200);

  setTimeout(() => {
    const name = winner === 1 ? 'Rojo (J1)' : (vsAI ? 'la IA' : 'Amarillo (J2)');
    winnerText.textContent = `¡Victoria para ${name}! 🏆`;
    winnerSub.textContent = '¡4 en línea conectado!';
    winModal.classList.remove('hidden');
  }, 700);
}

function handleDraw() {
  isGameOver = true;
  winnerText.textContent = '¡Empate! 🤝';
  winnerSub.textContent = 'El tablero se ha llenado sin ganador.';
  winModal.classList.remove('hidden');
}

// IA Logic
function makeAIMove() {
  if (isGameOver) return;

  const validCols = [];
  for (let c = 0; c < COLS; c++) {
    if (boardState[0][c] === 0) validCols.push(c);
  }
  if (validCols.length === 0) return;

  // 1. Can AI win immediately?
  for (const c of validCols) {
    const tempState = boardState.map(row => [...row]);
    let targetRow = -1;
    for (let r = ROWS - 1; r >= 0; r--) {
      if (tempState[r][c] === 0) { targetRow = r; break; }
    }
    tempState[targetRow][c] = 2;
    if (checkWin(tempState, 2)) {
      dropPiece(c);
      return;
    }
  }

  // 2. Can Player 1 win next turn? Block it!
  for (const c of validCols) {
    const tempState = boardState.map(row => [...row]);
    let targetRow = -1;
    for (let r = ROWS - 1; r >= 0; r--) {
      if (tempState[r][c] === 0) { targetRow = r; break; }
    }
    tempState[targetRow][c] = 1;
    if (checkWin(tempState, 1)) {
      dropPiece(c);
      return;
    }
  }

  // 3. Prefer central columns (col 3, then 2, 4, then 1, 5...)
  const preference = [3, 2, 4, 1, 5, 0, 6];
  for (const c of preference) {
    if (validCols.includes(c)) {
      // Avoid giving player immediate win on top of our move
      const tempState = boardState.map(row => [...row]);
      let targetRow = -1;
      for (let r = ROWS - 1; r >= 0; r--) {
        if (tempState[r][c] === 0) { targetRow = r; break; }
      }
      if (targetRow > 0) {
        tempState[targetRow - 1][c] = 1;
        if (checkWin(tempState, 1)) continue; // Bad move, gives opponent win
      }
      dropPiece(c);
      return;
    }
  }

  // Random fallback
  const randCol = validCols[Math.floor(Math.random() * validCols.length)];
  dropPiece(randCol);
}

// Events
resetBtn.addEventListener('click', initGame);
modalPlayAgain.addEventListener('click', initGame);

modeSelect.addEventListener('change', (e) => {
  vsAI = e.target.value === 'pve';
  p2Name.textContent = vsAI ? 'IA (Amarillo)' : 'Amarillo (J2)';
  scores = { 1: 0, 2: 0 };
  score1El.textContent = '0';
  score2El.textContent = '0';
  initGame();
});

initGame();
