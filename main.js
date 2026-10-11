/* =========================================================
   ARCADE NOVA — Carga dinámica de juegos
   Basado en NekeritDevs/Web-juegos (MIT)
   ========================================================= */

const rutas = [
  "Juegos/Ajedrez/metadata.json",
  "Juegos/3-en-raya/metadata.json",
  "Juegos/pac-man/metadata.json",
  "Juegos/Tetris/metadata.json",
  "Juegos/ping-pong/metadata.json",
  "Juegos/ahorcado/metadata.json",
  "Juegos/damas/metadata.json",
  "Juegos/conecta4/metadata.json",
  "Juegos/Memory/metadata.json",
  "Juegos/pokemon-puzzle/metadata.json",
  "Juegos/space-invaders/metadata.json",
  "Juegos/snake/metadata.json",
  "Juegos/gatitos-locos/metadata.json",
];

const contenedor = document.getElementById("juegos-container");
const inputBusqueda = document.getElementById("busqueda");
const selectTags = document.getElementById("filtro-tags");
const selectAutor = document.getElementById("filtro-autor");
const footerStats = document.getElementById("footer-stats");

let todosLosJuegos = [];
let todosLosTags = new Set();
let todosLosAutores = new Set();

const coloresTags = [
  "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7",
  "#DDA0DD", "#98D8C8", "#F7DC6F", "#BB8FCE", "#85C1E9",
];

function obtenerColorTag(tag, index) {
  return coloresTags[index % coloresTags.length];
}

/** Escapa texto proveniente de metadata.json antes de inyectarlo en HTML. */
function escapar(texto = "") {
  return String(texto).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
}

async function cargarJuegos() {
  for (const ruta of rutas) {
    try {
      const res = await fetch(ruta);
      if (!res.ok) throw new Error(`Error cargando ${ruta}`);
      const juego = await res.json();

      // Normalizar rutas para servidores sensibles a mayúsculas (GitHub Pages)
      if (juego.miniatura) {
        juego.miniatura = juego.miniatura.replace(/^(\.\/)?juegos\//i, "./Juegos/");
      }
      if (juego.url) {
        juego.url = juego.url.replace(/^(\.\/)?juegos\//i, "./Juegos/");
      }

      todosLosJuegos.push(juego);

      if (juego.tags) juego.tags.forEach((tag) => todosLosTags.add(tag));
      if (juego.autor) todosLosAutores.add(juego.autor);
    } catch (error) {
      console.error(error);
    }
  }

  // Dropdown de tags
  [...todosLosTags]
    .sort((a, b) => a.localeCompare(b, "es"))
    .forEach((tag) => {
      const option = document.createElement("option");
      option.value = tag;
      option.textContent = tag.charAt(0).toUpperCase() + tag.slice(1);
      selectTags.appendChild(option);
    });

  // Dropdown de autores
  [...todosLosAutores]
    .sort((a, b) => a.localeCompare(b, "es"))
    .forEach((autor) => {
      const option = document.createElement("option");
      option.value = autor;
      option.textContent = autor;
      selectAutor.appendChild(option);
    });

  actualizarStats();
  mostrarJuegos(todosLosJuegos);
}

function actualizarStats() {
  const total = todosLosJuegos.length;
  if (footerStats) {
    footerStats.textContent = `${total} juego${total === 1 ? "" : "s"} · ${todosLosTags.size} tags · hecho con HTML, CSS y JavaScript`;
  }
}

function mostrarJuegos(juegos) {
  contenedor.innerHTML = "";

  if (juegos.length === 0) {
    contenedor.innerHTML = `
      <div class="estado-vacio">
        <i class="fa-solid fa-ghost"></i>
        No encontramos ningún juego con esos filtros.
      </div>`;
    return;
  }

  juegos.forEach((juego) => mostrarJuego(juego));
}

function mostrarJuego(juego) {
  const card = document.createElement("div");
  card.className = "juego-card";

  const tagsHTML = juego.tags
    ? juego.tags
        .map((tag, index) => {
          const tagFormateado = escapar(tag.charAt(0).toUpperCase() + tag.slice(1));
          return `<span class="tag" style="background-color: ${obtenerColorTag(tag, index)}; color: #1a1a1a;">${tagFormateado}</span>`;
        })
        .join("")
    : "";

  const autorHTML = juego.autor
    ? `<p class="autor"><strong>Autor:</strong> ${
        juego.github
          ? `<a href="${escapar(juego.github)}" target="_blank" rel="noopener noreferrer">${escapar(juego.autor)}</a>`
          : escapar(juego.autor)
      }</p>`
    : "";

  card.innerHTML = `
      <img src="${escapar(juego.miniatura)}" alt="Miniatura de ${escapar(juego.nombre)}" loading="lazy">
      <h2>${escapar(juego.nombre)}</h2>
      <p class="descripcion">${escapar(juego.descripcion)}</p>
      <p class="categoria"><strong>Categoría:</strong> ${escapar(juego.categoria)}</p>
      ${autorHTML}
      ${tagsHTML ? `<div class="tags-container">${tagsHTML}</div>` : ""}
      <button type="button" data-url="${escapar(juego.url)}">Jugar</button>
    `;

  card.querySelector("button").addEventListener("click", () => {
    location.href = juego.url;
  });

  contenedor.appendChild(card);
}

// ====== FILTRADO UNIFICADO ======
function filtrarJuegos() {
  const texto = inputBusqueda.value.trim().toLowerCase();
  const tagSeleccionado = selectTags.value.toLowerCase();
  const autorSeleccionado = selectAutor.value.toLowerCase();

  const filtrados = todosLosJuegos.filter((juego) => {
    const nombreCoincide = juego.nombre.toLowerCase().includes(texto);
    const tagCoincide = !tagSeleccionado || juego.tags?.some((t) => t.toLowerCase() === tagSeleccionado);
    const autorCoincide = !autorSeleccionado || (juego.autor?.toLowerCase() === autorSeleccionado);
    return nombreCoincide && tagCoincide && autorCoincide;
  });

  mostrarJuegos(filtrados);
}

inputBusqueda.addEventListener("input", filtrarJuegos);
selectTags.addEventListener("change", filtrarJuegos);
selectAutor.addEventListener("change", filtrarJuegos);

cargarJuegos();

// ====== TEMA CLARO / OSCURO ======
function toggleTheme() {
  const body = document.body;
  const indicator = document.getElementById("themeIndicator");
  const themeText = document.getElementById("themeText");

  body.classList.add("theme-transition");

  if (body.getAttribute("data-theme") === "light") {
    body.setAttribute("data-theme", "dark");
    themeText.textContent = "Modo Oscuro";
    localStorage.setItem("theme", "dark");
  } else {
    body.setAttribute("data-theme", "light");
    themeText.textContent = "Modo Claro";
    localStorage.setItem("theme", "light");
  }

  indicator.classList.add("show");
  setTimeout(() => indicator.classList.remove("show"), 1000);
  setTimeout(() => body.classList.remove("theme-transition"), 500);
}

function loadTheme() {
  const savedTheme = localStorage.getItem("theme") || "dark";
  document.body.setAttribute("data-theme", savedTheme);

  const themeText = document.getElementById("themeText");
  if (themeText) themeText.textContent = savedTheme === "dark" ? "Modo Oscuro" : "Modo Claro";
}

document.addEventListener("DOMContentLoaded", loadTheme);
