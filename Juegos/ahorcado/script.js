const WORDS = [
  // --- Animales (30) ---
  { word: "ELEFANTE", category: "Animales", hint: "Tiene una gran trompa" },
  { word: "JIRAFA", category: "Animales", hint: "Tiene un cuello muy largo" },
  { word: "DELFIN", category: "Animales", hint: "Mamífero acuático muy inteligente" },
  { word: "PINGUINO", category: "Animales", hint: "Ave marina que no vuela" },
  { word: "COLIBRI", category: "Animales", hint: "Pájaro diminuto de aleteo veloz" },
  { word: "LEON", category: "Animales", hint: "Conocido como el rey de la selva" },
  { word: "TIGRE", category: "Animales", hint: "Felino rayado de gran tamaño" },
  { word: "CANGURO", category: "Animales", hint: "Marsupial que se desplaza a saltos" },
  { word: "KOALA", category: "Animales", hint: "Pasa el día durmiendo y come eucalipto" },
  { word: "PANDA", category: "Animales", hint: "Oso blanco y negro aficionado al bambú" },
  { word: "LOBO", category: "Animales", hint: "Cánido salvaje que aúlla a la luna" },
  { word: "AGUILA", category: "Animales", hint: "Ave rapaz de vista prodigiosa" },
  { word: "CABALLO", category: "Animales", hint: "Equino noble y veloz" },
  { word: "TORTUGA", category: "Animales", hint: "Reptil con caparazón protector y andar lento" },
  { word: "BALLENA", category: "Animales", hint: "El animal más grande de los océanos" },
  { word: "TIBURON", category: "Animales", hint: "Depredador marino con aleta dorsal temida" },
  { word: "LEOPARDO", category: "Animales", hint: "Felino ágil cubierto de manchas" },
  { word: "GORILA", category: "Animales", hint: "Gran primate de enorme fuerza" },
  { word: "RINOCERONTE", category: "Animales", hint: "Posee uno o dos cuernos sobre el hocico" },
  { word: "HIPOPOTAMO", category: "Animales", hint: "Pasa horas en ríos africanos y es muy territorial" },
  { word: "CAMALEON", category: "Animales", hint: "Reptil capaz de cambiar de color" },
  { word: "FLAMENCO", category: "Animales", hint: "Ave rosa que suele apoyarse en una sola pata" },
  { word: "ERIZO", category: "Animales", hint: "Pequeño mamífero cubierto de púas" },
  { word: "PULPO", category: "Animales", hint: "Molusco con ocho tentáculos e inteligencia notable" },
  { word: "ZORRO", category: "Animales", hint: "Famoso por su astucia y cola esponjosa" },
  { word: "BUHO", category: "Animales", hint: "Ave nocturna con grandes ojos redondeados" },
  { word: "ORCA", category: "Animales", hint: "Conocida como la ballena asesina" },
  { word: "SURICATA", category: "Animales", hint: "Centinela vigilante de las llanuras africanas" },
  { word: "GUEPARDO", category: "Animales", hint: "El mamífero terrestre más veloz" },
  { word: "PERRO", category: "Animales", hint: "El mejor amigo del ser humano" },

  // --- Países (30) ---
  { word: "ESPAÑA", category: "Países", hint: "País de la península ibérica" },
  { word: "ARGENTINA", category: "Países", hint: "País del tango y el asado" },
  { word: "JAPON", category: "Países", hint: "País del sol naciente" },
  { word: "MEXICO", category: "Países", hint: "Tierra de los tacos y mariachis" },
  { word: "AUSTRALIA", category: "Países", hint: "Hogar de canguros y koalas" },
  { word: "FRANCIA", category: "Países", hint: "Hogar de la Torre Eiffel y los croissants" },
  { word: "ITALIA", category: "Países", hint: "Cuna del Renacimiento y la pasta" },
  { word: "ALEMANIA", category: "Países", hint: "Famoso por sus castillos, autos y cerveza" },
  { word: "BRASIL", category: "Países", hint: "Tierra del carnaval de Río y el Amazonas" },
  { word: "CANADA", category: "Países", hint: "Tierra del jarabe de arce y el frío polar" },
  { word: "CHILE", category: "Países", hint: "El país más largo y angosto de Sudamérica" },
  { word: "COLOMBIA", category: "Países", hint: "Célebre por su café de alta montaña y cumbia" },
  { word: "PERU", category: "Países", hint: "Hogar de la ciudadela inca de Machu Picchu" },
  { word: "EGIPTO", category: "Países", hint: "Tierra de faraones, pirámides y el Nilo" },
  { word: "GRECIA", category: "Países", hint: "Cuna de la democracia y la mitología clásica" },
  { word: "PORTUGAL", category: "Países", hint: "Vecino ibérico del fado y los pasteles de nata" },
  { word: "CHINA", category: "Países", hint: "Alberga la Gran Muralla y una cultura milenaria" },
  { word: "INDIA", category: "Países", hint: "Tierra del Taj Mahal y las especias" },
  { word: "NORUEGA", category: "Países", hint: "Famosa por sus fiordos y auroras boreales" },
  { word: "SUECIA", category: "Países", hint: "Hogar del diseño nórdico y los muebles de paquete plano" },
  { word: "SUIZA", category: "Países", hint: "Famosa por sus chocolates, relojes y los Alpes" },
  { word: "MARRUECOS", category: "Países", hint: "Destaca por sus zocos, el té de menta y desiertos" },
  { word: "TURQUIA", category: "Países", hint: "Puente geográfico e histórico entre Europa y Asia" },
  { word: "IRLANDA", category: "Países", hint: "La Isla Esmeralda y la leyenda de los duendes" },
  { word: "ISLANDIA", category: "Países", hint: "Tierra de géiseres, glaciares y volcanes" },
  { word: "URUGUAY", category: "Países", hint: "Rincón rioplatense amante del mate y el candombe" },
  { word: "COREA", category: "Países", hint: "Epicentro mundial del K-pop y los doramas" },
  { word: "TAILANDIA", category: "Países", hint: "Conocida como la tierra de las sonrisas y templos dorados" },
  { word: "AUSTRIA", category: "Países", hint: "Capital mundial de la música clásica y los palacios vieneses" },
  { word: "CUBA", category: "Países", hint: "Isla caribeña famosa por sus autos clásicos y salsa" },

  // --- Videojuegos (30) ---
  { word: "MINECRAFT", category: "Videojuegos", hint: "Mundo de bloques y crafteo" },
  { word: "POKEMON", category: "Videojuegos", hint: "¡Atrápalos a todos!" },
  { word: "ZELDA", category: "Videojuegos", hint: "La leyenda del héroe de Hyrule" },
  { word: "FORTNITE", category: "Videojuegos", hint: "Battle Royale con bailes y construcción" },
  { word: "TETRIS", category: "Videojuegos", hint: "Líneas de figuras que caen" },
  { word: "MARIO", category: "Videojuegos", hint: "El fontanero más icónico del mundo" },
  { word: "SONIC", category: "Videojuegos", hint: "El erizo azul que corre a toda prisa" },
  { word: "PACMAN", category: "Videojuegos", hint: "Come puntos amarillos huyendo de fantasmas" },
  { word: "DOOM", category: "Videojuegos", hint: "Pionero del shooter visceral contra demonios" },
  { word: "HALO", category: "Videojuegos", hint: "La odisea espacial del Jefe Maestro" },
  { word: "SKYRIM", category: "Videojuegos", hint: "Grita como Sangre de Dragón por tierras gélidas" },
  { word: "OVERWATCH", category: "Videojuegos", hint: "Shooter de héroes en batallas por equipos" },
  { word: "VALORANT", category: "Videojuegos", hint: "Táctico shooter competitivo con agentes y habilidades" },
  { word: "ROBLOX", category: "Videojuegos", hint: "Plataforma comunitaria de millones de minijuegos" },
  { word: "METROID", category: "Videojuegos", hint: "Samus Aran explorando cavernas alienígenas" },
  { word: "PORTAL", category: "Videojuegos", hint: "Puzles espaciales, pastel y GlaDOS" },
  { word: "TERRARIA", category: "Videojuegos", hint: "Aventura 2D de exploración, minería y jefes titánicos" },
  { word: "FALLOUT", category: "Videojuegos", hint: "Supervivencia postapocalíptica tras la guerra nuclear" },
  { word: "BIOSHOCK", category: "Videojuegos", hint: "Secretos y mutaciones en la submarina Rapture" },
  { word: "DARKSOULS", category: "Videojuegos", hint: "Prepara la paciencia y no dejes que se apague la llama" },
  { word: "SEKIRO", category: "Videojuegos", hint: "Desvíos de katana milimétricos en el Japón feudal" },
  { word: "CYBERPUNK", category: "Videojuegos", hint: "Distopía futurista llena de neones en Night City" },
  { word: "UNCHARTED", category: "Videojuegos", hint: "Búsqueda de tesoros con Nathan Drake" },
  { word: "BLOODBORNE", category: "Videojuegos", hint: "Cacería de pesadillas góticas en Yharnam" },
  { word: "WARCRAFT", category: "Videojuegos", hint: "Conflicto eterno entre la Alianza y la Horda" },
  { word: "STARCRAFT", category: "Videojuegos", hint: "Estrategia en tiempo real entre Terran, Zerg y Protoss" },
  { word: "CUPHEAD", category: "Videojuegos", hint: "Jefes despiadados con estética de animación de los años 30" },
  { word: "CELESTE", category: "Videojuegos", hint: "Saltos de precisión y superación escalando una montaña" },
  { word: "HOLLOWKNIGHT", category: "Videojuegos", hint: "Aventura subterránea en el reino de Hallownest" },
  { word: "ELDENRING", category: "Videojuegos", hint: "Explora las Tierras Intermedias para ser el Señor del Círculo" },

  // --- Comida (30) ---
  { word: "CHOCOLATE", category: "Comida", hint: "Dulce elaborado a base de cacao" },
  { word: "PIZZA", category: "Comida", hint: "Masa al horno con salsa y queso" },
  { word: "HAMBURGUESA", category: "Comida", hint: "Carne entre panes con patatas" },
  { word: "SUSHI", category: "Comida", hint: "Rollos de arroz avinagrado con pescado fresco" },
  { word: "TACOS", category: "Comida", hint: "Tortillas dobladas con carne, cilantro y salsa" },
  { word: "PAELLA", category: "Comida", hint: "Arroz cocinado en sartén ancha con mariscos o carne" },
  { word: "LASAÑA", category: "Comida", hint: "Capas de pasta rellenas de carne y bechamel" },
  { word: "EMPANADA", category: "Comida", hint: "Masa rellena cocida al horno o frita" },
  { word: "CROQUETAS", category: "Comida", hint: "Porción de masa rebozada con bechamel y jamón" },
  { word: "TORTILLA", category: "Comida", hint: "Plato clásico a base de huevos batidos y patatas" },
  { word: "RAMEN", category: "Comida", hint: "Sopa japonesa de fideos servida en caldo denso" },
  { word: "CEVICHE", category: "Comida", hint: "Pescado marinado en jugo de limón y especias" },
  { word: "GUACAMOLE", category: "Comida", hint: "Salsa cremosa mexicana a base de aguacate" },
  { word: "BURRITO", category: "Comida", hint: "Tortilla de trigo enrollada con frijoles y carne" },
  { word: "PANQUEQUE", category: "Comida", hint: "Masa circular fina y dulce para desayunos" },
  { word: "ESPAGUETI", category: "Comida", hint: "Pasta alargada servida con boloñesa o carbonara" },
  { word: "GAZPACHO", category: "Comida", hint: "Sopa fría andaluza de tomate y hortalizas" },
  { word: "RISOTTO", category: "Comida", hint: "Arroz italiano cocinado lentamente hasta quedar cremoso" },
  { word: "CURRY", category: "Comida", hint: "Guiso aromático con mezcla especiada y salsa densa" },
  { word: "HUMMUS", category: "Comida", hint: "Pasta untable hecha de garbanzos y tahini" },
  { word: "AREPA", category: "Comida", hint: "Torta circular de maíz tostada y rellena" },
  { word: "CHURROS", category: "Comida", hint: "Masa frita alargada que suele mojarse en chocolate" },
  { word: "TIRAMISU", category: "Comida", hint: "Postre italiano a capas con café y mascarpone" },
  { word: "BROWNIE", category: "Comida", hint: "Bizcocho denso de chocolate con nueces" },
  { word: "CREPE", category: "Comida", hint: "Fina lámina de masa francesa dulce o salada" },
  { word: "NACHOS", category: "Comida", hint: "Totopos de maíz cubiertos de queso fundido y jalapeños" },
  { word: "HOTDOG", category: "Comida", hint: "Salchicha cocida servida dentro de un pan alargado" },
  { word: "BAGEL", category: "Comida", hint: "Pan redondeado con un agujero en medio" },
  { word: "DONA", category: "Comida", hint: "Rosquilla dulce frita y glaseada" },
  { word: "FALAFEL", category: "Comida", hint: "Albóndigas fritas a base de garbanzos triturados" }
];

const MAX_LIVES = 6;
let currentWordObj = null;
let guessedLetters = new Set();
let lives = MAX_LIVES;
let streak = 0;
let isGameOver = false;

// Audio synth
let audioCtx = null;
function playSound(freq, duration = 0.1) {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch (e) { }
}

const canvas = document.getElementById('hangmanCanvas');
const ctx = canvas.getContext('2d');
const wordDisplay = document.getElementById('wordDisplay');
const keyboard = document.getElementById('keyboard');
const currentCategoryEl = document.getElementById('currentCategory');
const livesRemainingEl = document.getElementById('livesRemaining');
const streakCountEl = document.getElementById('streakCount');
const hintBox = document.getElementById('hintBox');
const restartBtn = document.getElementById('restartBtn');
const gameModal = document.getElementById('gameModal');
const modalTitle = document.getElementById('modalTitle');
const modalDesc = document.getElementById('modalDesc');
const solutionWord = document.getElementById('solutionWord');
const modalNextBtn = document.getElementById('modalNextBtn');

function initGame() {
  currentWordObj = WORDS[Math.floor(Math.random() * WORDS.length)];
  guessedLetters = new Set();
  lives = MAX_LIVES;
  isGameOver = false;
  gameModal.classList.add('hidden');

  currentCategoryEl.textContent = currentWordObj.category;
  livesRemainingEl.textContent = lives;
  hintBox.textContent = 'Pista disponible tras 2 fallos';

  drawHangman(0);
  renderWord();
  renderKeyboard();
}

function renderWord() {
  wordDisplay.innerHTML = '';
  const word = currentWordObj.word;

  for (let i = 0; i < word.length; i++) {
    const letter = word[i];
    const slot = document.createElement('div');
    slot.className = 'letter-slot';

    if (guessedLetters.has(letter)) {
      slot.textContent = letter;
      slot.classList.add('revealed');
    } else {
      slot.textContent = '';
    }

    wordDisplay.appendChild(slot);
  }
}

function renderKeyboard() {
  keyboard.innerHTML = '';
  const alphabet = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ';

  for (const letter of alphabet) {
    const btn = document.createElement('button');
    btn.className = 'key-btn';
    btn.textContent = letter;
    btn.dataset.letter = letter;

    if (guessedLetters.has(letter)) {
      btn.disabled = true;
      if (currentWordObj.word.includes(letter)) {
        btn.classList.add('correct');
      } else {
        btn.classList.add('wrong');
      }
    }

    btn.addEventListener('click', () => handleGuess(letter));
    keyboard.appendChild(btn);
  }
}

function handleGuess(letter) {
  if (isGameOver || guessedLetters.has(letter)) return;

  guessedLetters.add(letter);

  if (currentWordObj.word.includes(letter)) {
    playSound(520, 0.1);
    renderWord();
    checkWin();
  } else {
    lives--;
    livesRemainingEl.textContent = lives;
    playSound(180, 0.15);
    drawHangman(MAX_LIVES - lives);

    if (MAX_LIVES - lives >= 2) {
      hintBox.textContent = `💡 Pista: ${currentWordObj.hint}`;
    }

    if (lives <= 0) {
      handleLoss();
    }
  }

  renderKeyboard();
}

function checkWin() {
  const isWon = currentWordObj.word.split('').every(l => guessedLetters.has(l));
  if (isWon) {
    isGameOver = true;
    streak++;
    streakCountEl.textContent = streak;
    playSound(650, 0.2);
    setTimeout(() => playSound(880, 0.3), 150);

    modalTitle.textContent = '¡Palabra Acertada! 🎉';
    modalDesc.innerHTML = `¡Excelente! Has adivinado <b>${currentWordObj.word}</b>.`;
    gameModal.classList.remove('hidden');
  }
}

function handleLoss() {
  isGameOver = true;
  streak = 0;
  streakCountEl.textContent = streak;
  playSound(120, 0.3);

  modalTitle.textContent = '¡Has Perdido! 💀';
  modalDesc.innerHTML = `La palabra correcta era: <b>${currentWordObj.word}</b>.`;
  gameModal.classList.remove('hidden');
}

function drawHangman(step) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';

  // Base
  ctx.beginPath();
  ctx.moveTo(20, 230);
  ctx.lineTo(120, 230);
  ctx.stroke();

  // Poste
  ctx.beginPath();
  ctx.moveTo(60, 230);
  ctx.lineTo(60, 20);
  ctx.lineTo(150, 20);
  ctx.lineTo(150, 50);
  ctx.stroke();

  // Soporte diagonal
  ctx.beginPath();
  ctx.moveTo(60, 60);
  ctx.lineTo(100, 20);
  ctx.stroke();

  ctx.strokeStyle = '#ef4444';

  // Step 1: Cabeza
  if (step >= 1) {
    ctx.beginPath();
    ctx.arc(150, 75, 22, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Step 2: Cuerpo
  if (step >= 2) {
    ctx.beginPath();
    ctx.moveTo(150, 97);
    ctx.lineTo(150, 160);
    ctx.stroke();
  }

  // Step 3: Brazo izquierdo
  if (step >= 3) {
    ctx.beginPath();
    ctx.moveTo(150, 115);
    ctx.lineTo(120, 145);
    ctx.stroke();
  }

  // Step 4: Brazo derecho
  if (step >= 4) {
    ctx.beginPath();
    ctx.moveTo(150, 115);
    ctx.lineTo(180, 145);
    ctx.stroke();
  }

  // Step 5: Pierna izquierda
  if (step >= 5) {
    ctx.beginPath();
    ctx.moveTo(150, 160);
    ctx.lineTo(125, 205);
    ctx.stroke();
  }

  // Step 6: Pierna derecha
  if (step >= 6) {
    ctx.beginPath();
    ctx.moveTo(150, 160);
    ctx.lineTo(175, 205);
    ctx.stroke();
  }
}

// Physical keyboard listener
window.addEventListener('keydown', (e) => {
  const key = e.key.toUpperCase();
  if (/^[A-ZÑ]$/.test(key)) {
    handleGuess(key);
  }
});

restartBtn.addEventListener('click', initGame);
modalNextBtn.addEventListener('click', initGame);

initGame();
