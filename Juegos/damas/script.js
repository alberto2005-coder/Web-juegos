const BOARD_SIZE = 8;
// Board representation: null, { color: 'red'|'black', isKing: boolean }
let board = [];
let currentTurn = 'red'; // 'red' moves first (upward)
let selectedPiece = null; // { r, c }
let validMoves = []; // array of { toR, toC, captured: {r,c} | null }
let isGameOver = false;
let vsAI = true;
let capturedCount = { red: 0, black: 0 };

let audioCtx = null;
function playSound(freq, duration = 0.1) {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch (e) {}
}

const boardEl = document.getElementById('board');
const turnLabel = document.getElementById('turnLabel');
const cardRed = document.getElementById('cardRed');
const cardBlack = document.getElementById('cardBlack');
const capturedRedEl = document.getElementById('capturedByRed');
const capturedBlackEl = document.getElementById('capturedByBlack');
const modeSelect = document.getElementById('gameMode');
const p2Title = document.getElementById('p2Title');
const resetBtn = document.getElementById('resetBtn');
const winModal = document.getElementById('winModal');
const winnerText = document.getElementById('winnerText');
const winnerSub = document.getElementById('winnerSub');
const modalPlayAgain = document.getElementById('modalPlayAgain');

function initGame() {
  board = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));
  capturedCount = { red: 0, black: 0 };
  currentTurn = 'red';
  selectedPiece = null;
  validMoves = [];
  isGameOver = false;
  winModal.classList.add('hidden');

  // Place initial pieces
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if ((r + c) % 2 === 1) {
        if (r < 3) {
          board[r][c] = { color: 'black', isKing: false };
        } else if (r > 4) {
          board[r][c] = { color: 'red', isKing: false };
        }
      }
    }
  }

  updateUI();
  renderBoard();
}

function renderBoard() {
  boardEl.innerHTML = '';

  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const square = document.createElement('div');
      const isDark = (r + c) % 2 === 1;
      square.className = `square ${isDark ? 'dark' : 'light'}`;
      square.dataset.r = r;
      square.dataset.c = c;

      if (selectedPiece && selectedPiece.r === r && selectedPiece.c === c) {
        square.classList.add('selected');
      }

      // Check if square is a valid target move
      const move = validMoves.find(m => m.toR === r && m.toC === c);
      if (move) {
        square.classList.add('highlight');
        square.addEventListener('click', () => executeMove(move));
      }

      const piece = board[r][c];
      if (piece) {
        const pieceEl = document.createElement('div');
        pieceEl.className = `piece ${piece.color} ${piece.isKing ? 'king' : ''}`;
        
        pieceEl.addEventListener('click', (e) => {
          e.stopPropagation();
          onPieceClick(r, c);
        });

        square.appendChild(pieceEl);
      }

      boardEl.appendChild(square);
    }
  }
}

function onPieceClick(r, c) {
  if (isGameOver) return;
  if (vsAI && currentTurn === 'black') return;

  const piece = board[r][c];
  if (!piece || piece.color !== currentTurn) return;

  selectedPiece = { r, c };
  validMoves = getMovesForPiece(r, c);
  playSound(350, 0.08);
  renderBoard();
}

function getMovesForPiece(r, c) {
  const piece = board[r][c];
  if (!piece) return [];

  const moves = [];
  const directions = [];

  if (piece.isKing) {
    directions.push([-1, -1], [-1, 1], [1, -1], [1, 1]);
  } else if (piece.color === 'red') {
    directions.push([-1, -1], [-1, 1]); // Red moves upwards
  } else {
    directions.push([1, -1], [1, 1]); // Black moves downwards
  }

  // 1. Regular 1-step diagonal moves
  for (const [dr, dc] of directions) {
    const nr = r + dr;
    const nc = c + dc;
    if (isInBounds(nr, nc) && board[nr][nc] === null) {
      moves.push({ toR: nr, toC: nc, captured: null });
    }
  }

  // 2. Jump/Capture moves
  const jumpDirs = piece.isKing 
    ? [[-1,-1], [-1,1], [1,-1], [1,1]] 
    : [[-1,-1], [-1,1], [1,-1], [1,1]]; // Any piece can jump captures
  
  for (const [dr, dc] of jumpDirs) {
    const midR = r + dr;
    const midC = c + dc;
    const endR = r + dr * 2;
    const endC = c + dc * 2;

    if (isInBounds(endR, endC)) {
      const midPiece = board[midR][midC];
      if (midPiece && midPiece.color !== piece.color && board[endR][endC] === null) {
        moves.push({ toR: endR, toC: endC, captured: { r: midR, c: midC } });
      }
    }
  }

  // If there are captures, prefer captures
  const captures = moves.filter(m => m.captured !== null);
  return captures.length > 0 ? captures : moves;
}

function isInBounds(r, c) {
  return r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE;
}

function executeMove(move) {
  const piece = board[selectedPiece.r][selectedPiece.c];
  board[selectedPiece.r][selectedPiece.c] = null;
  board[move.toR][move.toC] = piece;

  if (move.captured) {
    board[move.captured.r][move.captured.c] = null;
    capturedCount[currentTurn]++;
    playSound(200, 0.15);
  } else {
    playSound(440, 0.08);
  }

  // Promotion to King
  if (piece.color === 'red' && move.toR === 0) piece.isKing = true;
  if (piece.color === 'black' && move.toR === BOARD_SIZE - 1) piece.isKing = true;

  selectedPiece = null;
  validMoves = [];

  // Check victory
  const nextPlayer = currentTurn === 'red' ? 'black' : 'red';
  if (checkVictory(nextPlayer)) {
    handleWin(currentTurn);
    return;
  }

  currentTurn = nextPlayer;
  updateUI();
  renderBoard();

  if (vsAI && currentTurn === 'black' && !isGameOver) {
    setTimeout(makeAIMove, 500);
  }
}

function checkVictory(player) {
  let hasPieces = false;
  let hasMoves = false;

  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c] && board[r][c].color === player) {
        hasPieces = true;
        if (getMovesForPiece(r, c).length > 0) {
          hasMoves = true;
          break;
        }
      }
    }
    if (hasMoves) break;
  }

  return !hasPieces || !hasMoves;
}

function handleWin(winner) {
  isGameOver = true;
  playSound(600, 0.25);
  setTimeout(() => playSound(800, 0.35), 200);

  const name = winner === 'red' ? 'Rojas (J1)' : (vsAI ? 'la IA (Negras)' : 'Negras (J2)');
  winnerText.textContent = `¡Victoria para ${name}! 👑`;
  winnerSub.textContent = '¡Sin movimientos o piezas restantes!';
  winModal.classList.remove('hidden');
}

function updateUI() {
  cardRed.classList.toggle('active', currentTurn === 'red');
  cardBlack.classList.toggle('active', currentTurn === 'black');

  turnLabel.textContent = currentTurn === 'red' ? 'Rojas' : (vsAI ? 'IA (Negras)' : 'Negras');
  turnLabel.className = currentTurn === 'red' ? 'turn-red' : 'turn-black';

  capturedRedEl.textContent = capturedCount.red;
  capturedBlackEl.textContent = capturedCount.black;
}

function makeAIMove() {
  if (isGameOver) return;

  const allMoves = [];
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c] && board[r][c].color === 'black') {
        const moves = getMovesForPiece(r, c);
        for (const m of moves) {
          allMoves.push({ fromR: r, fromC: c, ...m });
        }
      }
    }
  }

  if (allMoves.length === 0) {
    handleWin('red');
    return;
  }

  // Prioritize captures
  const captures = allMoves.filter(m => m.captured !== null);
  const chosenMove = captures.length > 0
    ? captures[Math.floor(Math.random() * captures.length)]
    : allMoves[Math.floor(Math.random() * allMoves.length)];

  selectedPiece = { r: chosenMove.fromR, c: chosenMove.fromC };
  executeMove(chosenMove);
}

// Controls
resetBtn.addEventListener('click', initGame);
modalPlayAgain.addEventListener('click', initGame);

modeSelect.addEventListener('change', (e) => {
  vsAI = e.target.value === 'pve';
  p2Title.textContent = vsAI ? 'IA (Negras)' : 'Negras (J2)';
  initGame();
});

initGame();
