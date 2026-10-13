const canvas = document.getElementById('juegoCanvas');
const ctx = canvas.getContext('2d');

let estadoJuego = {
    puntos: 0,
    nivel: 1,
    vidas: 3,
    pausa: false,
    final: false,
};

const player = {
    x: canvas.width / 2 - 30,
    y: canvas.height - 50,
    ancho: 40,
    alto: 30,
    velocidad: 5,
    moverIzquierda: false,
    moverDerecha: false,
};

let balas = [];
let aliens = [];
let balasAliens = [];
let alienDireccion = 1;
let alienVelocidad = 1;

function crearAliens() {
    aliens = [];
    const filas = 4;
    const columnas = 8;
    const spaciado = 70;
    const X = 80;
    const Y = 50;
    
    for (let fila = 0; fila < filas; fila++) {
        for (let columna = 0; columna < columnas; columna++) {
            aliens.push({
                x: X + columna * spaciado,
                y: Y + fila * spaciado,
                ancho: 40,
                alto: 30,
                vivo: true,
            });
        }
    }
}

function pintarJugador() {
    ctx.fillStyle = '#00ff00';
    ctx.fillRect(player.x, player.y, player.ancho, player.alto);
    ctx.fillRect(player.x + 15, player.y + 10, 10, 10);
}

function pintarAliens(alien) {
    if (!alien.vivo) return;
    ctx.fillStyle = '#ff00ff';
    ctx.fillRect(alien.x, alien.y, alien.ancho, alien.alto);
    ctx.fillStyle = '#00ff00';
    ctx.fillRect(alien.x + 10, alien.y + 5, 10, 10);
    ctx.fillRect(alien.x + 25, alien.y + 5, 10, 10);
}

function pintarBalas(bala) {
    ctx.fillStyle = bala.fromPlayer ? '#00ff00' : '#ff0000';
    ctx.fillRect(bala.x, bala.y, 4, 10);
}

function actualizarJugador() {
    if (player.moverIzquierda && player.x > 0) {
        player.x -= player.velocidad;
    }
    if (player.moverDerecha && player.x < canvas.width - player.ancho) {
        player.x += player.velocidad;
    }
}

function actualizarBalas() {
    balas = balas.filter(b => {
        b.y -= 7;
        return b.y > 0;
    });

    balasAliens = balasAliens.filter(b => {
        b.y += 5;
        return b.y < canvas.height;
    });
}

function actualizarAliens() {
    let moveDown = false;  
    for (let alien of aliens) {
        if (!alien.vivo) continue;
        
        alien.x += alienDireccion * alienVelocidad;
        
        if (alien.x <= 0 || alien.x >= canvas.width - alien.ancho) {
            moveDown = true;
        }
    }

    if (moveDown) {
        alienDireccion *= -1;
        for (let alien of aliens) {
            if (alien.vivo) {   
                alien.y += 20;
                if (alien.y + alien.alto > player.y) {  
                    estadoJuego.final = true;
                }
            }
        }
    }

    if (Math.random() < 0.02) {
        const aliensVivos = aliens.filter(a => a.vivo);
        if (aliensVivos.length > 0) {
            const disparo = aliensVivos[Math.floor(Math.random() * aliensVivos.length)];
            balasAliens.push({
                x: disparo.x + disparo.ancho / 2,
                y: disparo.y + disparo.alto,
                fromPlayer: false
            });
        }
    }
}

function comprobarColision() {
    balas.forEach((bala, bIndex) => {
        aliens.forEach(alien => {
            if (alien.vivo && 
                bala.x < alien.x + alien.ancho &&
                bala.x + 4 > alien.x &&
                bala.y < alien.y + alien.alto &&
                bala.y + 10 > alien.y) {
                alien.vivo = false;
                balas.splice(bIndex, 1);
                estadoJuego.puntos += 10 * estadoJuego.nivel;
                actualizarPuntos();
            }
        });
    });
    
    balasAliens.forEach((bala, bIndex) => {
        if (bala.x < player.x + player.ancho &&
            bala.x + 4 > player.x &&
            bala.y < player.y + player.alto &&
            bala.y + 10 > player.y) {
            balasAliens.splice(bIndex, 1);
            estadoJuego.vidas--;
            actualizarVidas();
            if (estadoJuego.vidas <= 0) {
                estadoJuego.final = true;
            }
        }
    });
    
    const aliensVivos = aliens.filter(a => a.vivo);
    if (aliensVivos.length === 0) {
        estadoJuego.nivel++;
        alienVelocidad += 0.3;
        actualizarNivel();
        crearAliens();
    }
}


function actualizarPuntos() {
    document.getElementById('puntos').textContent = estadoJuego.puntos;
}

function actualizarNivel() {
    document.getElementById('nivel').textContent = estadoJuego.nivel;
}

function actualizarVidas() {
    document.getElementById('vidas').textContent = estadoJuego.vidas;
}

function gameLoop() {
    if (estadoJuego.final) {
        document.getElementById('puntosFinal').textContent = estadoJuego.puntos;
        document.getElementById('final').style.display = 'block';
        return;
    }

    if (estadoJuego.pausa) {
        requestAnimationFrame(gameLoop);
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    actualizarJugador();
    actualizarBalas();
    actualizarAliens();
    comprobarColision();
    pintarJugador();
    balas.forEach(pintarBalas);
    balasAliens.forEach(pintarBalas);
    aliens.forEach(pintarAliens);
    requestAnimationFrame(gameLoop);
}


document.addEventListener('keydown', (e) => {
    if (e.code === 'ArrowLeft') {
        e.preventDefault(); // evitar que la página se desplace
        player.moverIzquierda = true;
    }
    if (e.code === 'ArrowRight') {
        e.preventDefault();
        player.moverDerecha = true;
    }
    if (e.code === 'Space') {
        e.preventDefault();
        if (balas.length < 3) {
            balas.push({
                x: player.x + player.ancho / 2,
                y: player.y,
                fromPlayer: true
            });
        }
    }
    if (e.code === 'KeyP') {
        estadoJuego.pausa = !estadoJuego.pausa;
        }
});

document.addEventListener('keyup', (e) => {
    if (e.code === 'ArrowLeft') player.moverIzquierda = false;
    if (e.code === 'ArrowRight') player.moverDerecha = false;
});

function reiniciarJuego() {
    estadoJuego = {
        puntos: 0,
        nivel: 1,
        vidas: 3,
        pausa: false,
        final: false
    };
    player.x = canvas.width / 2 - 20;
        balas = [];
        balasAliens = [];
        alienDireccion = 1;
        alienVelocidad = 1;
        document.getElementById('final').style.display = 'none';
        actualizarPuntos();
        actualizarNivel();
        actualizarVidas();
        crearAliens();
        gameLoop();
}


crearAliens();
gameLoop();