const rutas = [
  "Juegos/Ajedrez/metadata.json",
  "Juegos/3-en-raya/metadata.json",
  "Juegos/pac-man/metadata.json",
  "Juegos/Tetris/metadata.json",
  "Juegos/ping-pong/metadata.json",
  //"Juegos/ahorcado/metadata.json",
  //"Juegos/damas/metadata.json",
  //"Juegos/conecta4/metadata.json",
  "Juegos/Memory/metadata.json",
  "Juegos/pokemon-puzzle/metadata.json",
  "Juegos/space-invaders/metadata.json",
  "Juegos/snake/metadata.json",
];

// 🚨 Validación de protocolo
function verificarProtocolo() {
  if (location.protocol === 'file:') {
    alert("⚠️ Este proyecto debe ejecutarse desde un servidor local.\n\nUsá Live Server, Python o Node para que los juegos se carguen correctamente.");
  }
}

verificarProtocolo();

const contenedor = document.getElementById("juegos-container");
const inputBusqueda = document.getElementById("busqueda");
const selectTags = document.getElementById("filtro-tags");
const selectAutor = document.getElementById("filtro-autor");

let todosLosJuegos = [];
let todosLosTags = new Set();
let todosLosAutores = new Set();

const coloresTags = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'];

function obtenerColorTag(tag, index) {
  return coloresTags[index % coloresTags.length];
}

async function cargarJuegos() {
  for (const ruta of rutas) {
    try {
      const res = await fetch(ruta);
      if (!res.ok) throw new Error(`Error cargando ${ruta}`);
      const juego = await res.json();

      // Normalizar rutas para servidores sensibles a mayúsculas (GitHub Pages)
      if (juego.miniatura) {
        juego.miniatura = juego.miniatura.replace(/^(\.\/)?juegos\//i, './Juegos/');
      }
      if (juego.url) {
        juego.url = juego.url.replace(/^(\.\/)?juegos\//i, './Juegos/');
      }

      todosLosJuegos.push(juego);

      // Agregar tags y autores a los sets
      if (juego.tags) juego.tags.forEach(tag => todosLosTags.add(tag));
      if (juego.autor) todosLosAutores.add(juego.autor);

    } catch (error) {
      console.error(error);
    }
  }

  // Llenar dropdown de tags
  todosLosTags.forEach(tag => {
    const option = document.createElement('option');
    option.value = tag;
    option.textContent = tag.charAt(0).toUpperCase() + tag.slice(1);
    selectTags.appendChild(option);
  });

  // Llenar dropdown de autores
  todosLosAutores.forEach(autor => {
    const option = document.createElement('option');
    option.value = autor;
    option.textContent = autor;
    selectAutor.appendChild(option);
  });

  mostrarJuegos(todosLosJuegos);
}

function mostrarJuegos(juegos) {
  contenedor.innerHTML = '';
  juegos.forEach(juego => mostrarJuego(juego));
}

function mostrarJuego(juego) {
  const card = document.createElement("div");
  card.className = "juego-card";

  const tagsHTML = juego.tags
    ? juego.tags.map((tag, index) => {
        const tagFormateado = tag.charAt(0).toUpperCase() + tag.slice(1);
        return `<span class="tag" style="background-color: ${obtenerColorTag(tag, index)}; color: white;">${tagFormateado}</span>`;
      }).join('')
    : '';

  card.innerHTML = `
        <img src="${juego.miniatura}" alt="${juego.nombre}">
        <h2>${juego.nombre}</h2>
        <p class="descripcion">${juego.descripcion}</p>
        <p class="categoria"><strong>Categoría:</strong> ${juego.categoria}</p>
        ${juego.autor ? `<p class="autor"><strong>Autor:</strong> ${
          juego.github ? `<a href="${juego.github}" target="_blank"> ${juego.autor}</a>`: juego.autor
        }</p>` : ''}
        ${tagsHTML ? `<div class="tags-container">${tagsHTML}</div>` : ''}
        <button onclick="location.href='${juego.url}'">Jugar</button>
      `;

  contenedor.appendChild(card);
}

// Filtro unificado
function filtrarJuegos() {
  const texto = inputBusqueda.value.toLowerCase();
  const tagSeleccionado = selectTags.value.toLowerCase();
  const autorSeleccionado = selectAutor.value.toLowerCase();

  const filtrados = todosLosJuegos.filter(juego => {
    const nombreCoincide = juego.nombre.toLowerCase().includes(texto);
    const tagCoincide = !tagSeleccionado || juego.tags?.some(tag => tag.toLowerCase() === tagSeleccionado);
    const autorCoincide = !autorSeleccionado || (juego.autor?.toLowerCase() === autorSeleccionado);
    return nombreCoincide && tagCoincide && autorCoincide;
  });

  mostrarJuegos(filtrados);
}

// Eventos de filtrado unificados
inputBusqueda.addEventListener('input', filtrarJuegos);
selectTags.addEventListener('change', filtrarJuegos);
selectAutor.addEventListener('change', filtrarJuegos);

// Cargar los juegos al inicio
cargarJuegos();

// ====== FUNCIONALIDAD DE TEMA ====== 
function toggleTheme() {
  const body = document.body;
  const indicator = document.getElementById('themeIndicator');
  const themeText = document.getElementById('themeText');
  
  body.classList.add('theme-transition');
  
  if (body.getAttribute('data-theme') === 'light') {
    body.setAttribute('data-theme', 'dark');
    themeText.textContent = 'Modo Oscuro';
    localStorage.setItem('theme', 'dark');
  } else {
    body.setAttribute('data-theme', 'light');
    themeText.textContent = 'Modo Claro';
    localStorage.setItem('theme', 'light');
  }
  
  indicator.classList.add('show');
  setTimeout(() => indicator.classList.remove('show'), 1000);
  setTimeout(() => body.classList.remove('theme-transition'), 500);
}

// Cargar tema guardado
function loadTheme() {
  const savedTheme = localStorage.getItem('theme') || 'dark';
  document.body.setAttribute('data-theme', savedTheme);
  
  const themeText = document.getElementById('themeText');
  themeText.textContent = savedTheme === 'dark' ? 'Modo Oscuro' : 'Modo Claro';
}

document.addEventListener('DOMContentLoaded', loadTheme);
