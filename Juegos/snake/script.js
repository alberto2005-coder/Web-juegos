const canvas = document.getElementById('juegoCanvas');
const ctx = canvas.getContext('2d');
const puntuacion = document.getElementById('puntos');
const finJuego = document.getElementById('finJuego');
const puntosFinal = document.getElementById('puntosFinal');


const grid = 40;
const casillasX = canvas.width / grid;
const casillasY = canvas.height / grid;

let snake = [{ x: 5, y: 5 }]
let dx = 0;
let dy = 0;
let comidaX = 10;
let comidaY = 10;
let puntos = 0;
let juegoActivo = true;
let velocidadJuego = 120;
let ultimaDireccion = { dx: 0, dy: 0 };
let direccionCambiada = false;
let ultimoTiempo = 0;
let progreso = 0;
let posicionesAnteriores = [];

function pintarJuego(tiempoActual = 0) {
    if (!juegoActivo) return;
    
    const deltaTime = tiempoActual - ultimoTiempo;
    progreso = Math.min(deltaTime / velocidadJuego, 1);
    
    if (deltaTime >= velocidadJuego) {
        posicionesAnteriores = snake.map(s => ({x: s.x, y: s.y}));
        
        moverSnake();
        
        if (collision()) {
            finalizarJuego(); 
            return;
        }
        
        ultimoTiempo = tiempoActual;
        progreso = 0;
    }

    limpiarCanvas();
    pintarSnakeInterpolado();
    pintarComida();
    actualizarPuntos();

    requestAnimationFrame(pintarJuego);
}

function pintarSnakeInterpolado() {
    snake.forEach((segmento, index) => {
        if (index == 0) {
            ctx.fillStyle = '#4ade80';
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#4ade80';
        } else {
            ctx.fillStyle = '#22c55e';
            ctx.shadowBlur = 5;
            ctx.shadowColor = '#22c55e';
        }

        let x = segmento.x;
        let y = segmento.y;
        
        if (posicionesAnteriores[index] && progreso < 1) {
            x = posicionesAnteriores[index].x + (segmento.x - posicionesAnteriores[index].x) * progreso;
            y = posicionesAnteriores[index].y + (segmento.y - posicionesAnteriores[index].y) * progreso;
        }
        
        ctx.fillRect(x * grid, y * grid, grid - 2, grid - 2);
    });
    ctx.shadowBlur = 0;
}


function limpiarCanvas() {
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function pintarSnake() {
    snake.forEach((segmento, index) => {
        if ( index == 0 ) {
            ctx.fillStyle = '#4ade80';
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#4ade80';
        } else {
            ctx.fillStyle = '#22c55e';
            ctx.shadowBlur = 5;
            ctx.shadowColor = '#22c55e';
        }
        ctx.fillRect(segmento.x * grid, segmento.y * grid, grid - 2, grid - 2);
    });
    ctx.shadowBlur = 0;
}

function pintarComida() {
    ctx.fillStyle = '#ef4444';
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#ef4444';
    ctx.fillRect(comidaX * grid, comidaY * grid, grid - 2, grid - 2);
    ctx.shadowBlur = 0;
}

function moverSnake() {
    if (dx == 0 && dy == 0) return;
    const cabeza = { x: snake[0].x + dx, y: snake[0].y + dy };
    snake.unshift(cabeza);

    if ( cabeza.x == comidaX && cabeza.y == comidaY ) {
        puntos++;
        generarComida();
        
    } else {
        snake.pop();
    }

    ultimaDireccion = { dx, dy };
}   

function generarComida() {
    comidaX = Math.floor(Math.random() * casillasX);
    comidaY = Math.floor(Math.random() * casillasY);

    for (let segmento of snake) {
        if ( segmento.x == comidaX && segmento.y == comidaY ) {
            generarComida();
            break;
        }
    }
}

function collision() {
    const cabeza = snake[0];
    if ( cabeza.x < 0 || cabeza.x >= casillasX || cabeza.y < 0 || cabeza.y >= casillasY ) {
        return true;
    }
    for (let segmento of snake.slice(1)) {
        if ( segmento.x == cabeza.x && segmento.y == cabeza.y ) {
            return true;
        }
    }
    return false;
}


function actualizarPuntos() {
    puntuacion.textContent = puntos;
}

function finalizarJuego() {
    juegoActivo = false;
    finJuego.style.display = 'block';
    puntosFinal.textContent = puntos;
}

function reiniciarJuego() {
    juegoActivo = true;
    finJuego.style.display = 'none';
    puntos = 0;
    snake = [{ x: 5, y: 5 }];
    dx = 0;
    dy = 0;
    pintarComida();
    generarComida();
    pintarJuego();
}


document.addEventListener('keydown', (e) => {
    if (e.code === 'ArrowLeft' && ultimaDireccion.dx != 1) {
        e.preventDefault(); // evitar que la página se desplace
        dx = -1;
        dy = 0;
        direccionCambiada = true;
    }
    if (e.code === 'ArrowRight' && ultimaDireccion.dx != -1) {
        e.preventDefault();
        dx = 1;
        dy = 0; 
        direccionCambiada = true;
    }
    if (e.code === 'ArrowUp' && ultimaDireccion.dy != 1) {
        e.preventDefault();
        dx = 0;
        dy = -1;
        direccionCambiada = true;
    }
    if (e.code === 'ArrowDown' && ultimaDireccion.dy != -1) {
        e.preventDefault();
        dx = 0; 
        dy = 1;
        direccionCambiada = true;
    }
});

pintarComida();
generarComida();
pintarJuego();
