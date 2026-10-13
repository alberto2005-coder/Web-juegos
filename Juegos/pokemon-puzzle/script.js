let rows = 3;
let columns = 3;

let currTile;
let otherTile; // en blanco

let turns = 0;
let time = 0;
let timer;

let imgOrder = ["4", "2", "8", "6", "1", "5", "7", "9", "3"];

window.onload = function() {
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {

            // crear imagen
            let tile = document.createElement("img");
            tile.id = r.toString() + "-" + c.toString();
            tile.src = "./images/pikachu/" + imgOrder.shift() + ".png";

            //funcion arrastrar
            tile.addEventListener("dragstart", dragStart); //comienza a arrastrar
            tile.addEventListener("dragover", dragOver); //arrastrando sobre otro elemento
            tile.addEventListener("dragenter", dragEnter); //entra en el area de otro elemento
            tile.addEventListener("dragleave", dragLeave); //sale del area de otro elemento
            tile.addEventListener("drop", dragDrop); //deja caer sobre otro elemento
            tile.addEventListener("dragend", dragEnd); //termina de arrastrar
            tile.addEventListener("click", tapMove); //toque/clic: entra en el hueco (móvil)

            document.getElementById("board").append(tile);
        }
    }

    // contador de tiempo
    timer = setInterval(function() {
        time++;
    }, 1000);
}

function dragStart() {
    currTile = this; // la imagen que se esta arrastrando
    otherTile = null; // se rellena solo al soltar sobre otra casilla
}

function dragOver(e) {
    e.preventDefault();
}

function dragEnter(e) {
    e.preventDefault();
}

function dragLeave() {

}

function dragDrop() {
    otherTile = this; // la imagen sobre la que se deja caer
}

function dragEnd() {
    // otherTile es undefined/null si se suelta fuera de una casilla
    if (otherTile) {
        tryMove(currTile, otherTile);
        otherTile = null;
    }
    ultimoArrastre = Date.now();
}

let ultimoArrastre = 0;

// Tocar/clic una pieza: entra en el hueco si es adyacente.
// El drag&drop HTML5 no funciona en móvil, así que esto lo sustituye allí.
function tapMove() {
    if (Date.now() - ultimoArrastre < 400) return; // evitar doble acción tras arrastrar
    if (this.src.includes("9.png")) return; // el hueco no se mueve
    let hole = null;
    document.querySelectorAll("#board img").forEach(t => {
        if (t.src.includes("9.png")) hole = t;
    });
    if (hole) tryMove(this, hole);
}

// Mueve una pieza hacia el hueco (imagen 9). Compartido por arrastre y toque.
function tryMove(from, to) {
    if (!from || !to || from === to) return;
    if (!to.src.includes("9.png")) return; // solo se puede mover hacia el hueco

    let currCoords = from.id.split("-"); // ["0", "0"]
    let r = parseInt(currCoords[0]);
    let c = parseInt(currCoords[1]);

    let otherCoords = to.id.split("-"); // ["0", "0"]
    let r2 = parseInt(otherCoords[0]);
    let c2 = parseInt(otherCoords[1]);

    let moveLeft = c2 == c - 1 && r2 == r;
    let moveRight = c2 == c + 1 && r2 == r;
    let moveUp = r2 == r - 1 && c2 == c;
    let moveDown = r2 == r + 1 && c2 == c;

    let isAdjacent = moveLeft || moveRight || moveUp || moveDown;
    if (!isAdjacent) return;

    // intercambiar las imagenes
    let currImg = from.src;
    let otherImg = to.src;

    from.src = otherImg;
    to.src = currImg;

    turns++;
    document.getElementById("turnos").innerText = turns;
    checkWin();
}

function checkWin() {
    let imgOrder = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
    let correct = 0;

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            let tile = document.getElementById(r.toString() + "-" + c.toString());
            let imgNum = tile.src.charAt(tile.src.length - 5);

            if (imgNum == imgOrder.shift()) {
                correct++;
            }
        }
    }

    if (correct == 9) {
        clearInterval(timer);
        modal.style.display = 'flex';
        document.getElementById("final-time").innerText = time + " segundos";
        document.getElementById("final-turns").innerText = turns + " turnos";
    }
}

const reiniciarBtn = document.getElementById('reiniciar-btn');
const closeBtn = document.getElementById('close-modal');
const modal = document.getElementById('modal');

reiniciarBtn.addEventListener('click', () => {
  location.reload(); 
});

closeBtn.addEventListener('click', () => {
  modal.style.display = 'none';
});

window.addEventListener('click', (e) => {
  if (e.target === modal) {
    modal.style.display = 'none';
  }
});
