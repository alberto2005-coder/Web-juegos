# Arcade Nova

[![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)](https://developer.mozilla.org/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)](https://developer.mozilla.org/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-Vanilla-F7DF1E?logo=javascript&logoColor=black)](https://developer.mozilla.org/docs/Web/JavaScript)
[![MIT](https://img.shields.io/badge/Licencia-MIT-green)](LICENSE)

[Español](#español) · [English](#english)

---

## Español

### Índice

- [Descripción](#descripción)
- [Demo](#demo)
- [Características](#características)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Ejecución local](#ejecución-local)
- [Añadir un juego](#añadir-un-juego)
- [Formato de metadata.json](#formato-de-metadatajson)
- [Personalización](#personalización)
- [Tecnologías](#tecnologías)
- [Notas](#notas)
- [Créditos y licencia](#créditos-y-licencia)
- [Licencia](#licencia)

### Descripción

**Arcade Nova** es una galería web de **18 minijuegos** que se ejecutan directamente en el navegador, sin descargas ni instalaciones. La página se construye sola: lee el `metadata.json` de cada juego, genera las tarjetas y ofrece búsqueda y filtros en tiempo real. Todo es HTML5, CSS3 y JavaScript puro, sin build ni dependencias.

### Demo

**Juega ahora:** <https://alberto2005-coder.github.io/Web-juegos/>

### Características

- **Catálogo dinámico**: los juegos se cargan desde sus archivos `metadata.json`.
- **Búsqueda y filtros** por nombre, autor y etiqueta al escribir.
- **Diseño responsive** con tarjetas glassmorphism, rejilla fluida y cabecera fija con desenfoque.
- **Modo claro/oscuro** persistido en `localStorage`.
- **Sin dependencias ni compilación**: se sirve como archivos estáticos, ideal para GitHub Pages.
- **Accesible**: etiquetas ARIA, respeto por `prefers-reduced-motion` y carga diferida de imágenes.
- **Protección XSS**: todo el texto de `metadata.json` se escapa antes de insertarse en el DOM.

Juegos incluidos: 2048, 3 en raya, Ajedrez, Memory, Tetris, Ahorcado, Breakout, Buscaminas, Conecta 4, Damas, Flappy Nova, Gatitos Locos, Pac-Man, Ping Pong, Pokémon Puzzle, Simon, Snake y Space Invaders.

### Estructura del proyecto

```text
Web-juegos/
├── Juegos/
│   ├── Nombre-del-juego/
│   │   ├── metadata.json     # Fuente de verdad del juego
│   │   ├── index.html
│   │   ├── styles.css        # o style.css
│   │   ├── script.js         # o main.js / game.js
│   │   └── logo.png
│   └── ...
├── index.html      # Shell de la galería
├── main.js         # Carga de metadatos, filtros y tema
├── styles.css      # Diseño de la galería
├── logo.svg        # Logotipo vectorial
├── logo.png        # Logotipo raster (favicon)
├── LICENSE         # MIT, copyright original de NekeritStudio
└── README.md
```

### Ejecución local

`main.js` usa `fetch()`, así que **abrir `index.html` con doble clic no funciona** (`file://`). Usa un servidor estático:

| Opción | Comando |
|---|---|
| VS Code + Live Server | Clic derecho en `index.html` → *Open with Live Server* |
| Python | `python -m http.server 8000` |
| Node | `npx serve .` |

Después abre <http://localhost:8000>.

Para publicarlo, sube el repositorio a **GitHub Pages** (rama `main`, carpeta raíz). `main.js` normaliza las rutas de imágenes para servidores sensibles a mayúsculas.

### Añadir un juego

1. Crea una carpeta dentro de `Juegos/` con el nombre del juego.
2. Copia dentro sus archivos (`index.html`, estilos, scripts, imágenes).
3. Crea el `metadata.json` con el formato de abajo.
4. Añade la ruta al array `rutas` de `main.js`:

```javascript
const rutas = [
  "Juegos/Ajedrez/metadata.json",
  "Juegos/3-en-raya/metadata.json",
  // ...
  "Juegos/MiNuevoJuego/metadata.json", // nueva ruta
];
```

5. Recarga la página: la tarjeta aparece sola.

### Formato de metadata.json

```json
{
  "nombre": "Nombre del juego",
  "descripcion": "Breve descripción del juego",
  "categoria": "Categoría del juego",
  "autor": "Nombre del autor (opcional)",
  "github": "https://github.com/usuario (opcional)",
  "miniatura": "Juegos/Nombre-del-juego/logo.png",
  "url": "Juegos/Nombre-del-juego/index.html",
  "tags": ["arcade", "puzzle", "un-jugador"]
}
```

| Campo | Obligatorio | Descripción |
|---|---|---|
| `nombre` | Sí | Nombre visible en la tarjeta |
| `descripcion` | Sí | Descripción corta (se muestran 3 líneas) |
| `categoria` | Sí | Por ejemplo *Estrategia*, *Arcade* o *Puzzle* |
| `autor` | No | Autor del juego |
| `github` | No | Enlace al repositorio del autor |
| `miniatura` | Sí | Imagen de la tarjeta (~600×400 recomendado) |
| `url` | Sí | Ruta al `index.html` del juego |
| `tags` | No | Etiquetas, coloreadas automáticamente |

> [!IMPORTANT]
> Usa rutas relativas tal cual (`Juegos/...`) y respeta mayúsculas y minúsculas: en GitHub Pages las rutas distinguen entre `Logo.png` y `logo.png`.

### Personalización

**Tema y colores** — en `styles.css`:

```css
:root { /* tema oscuro */ --accent: #7c3aed; --accent-2: #22d3ee; }
[data-theme="light"] { /* tema claro */ }
```

**Colores de etiquetas** — en `main.js`, el array `coloresTags` asigna un color a cada etiqueta en orden:

```javascript
const coloresTags = ['#FF6B6B', '#4ECDC4', '#45B7D1'];
```

**Rejilla** — `grid-template-columns: repeat(auto-fill, minmax(255px, 1fr));`

### Tecnologías

- HTML5 semántico.
- CSS3: custom properties, grid, `backdrop-filter`, animaciones y media queries.
- JavaScript ES6+: `async/await`, `fetch` y módulos lógicos.
- [Font Awesome 6](https://fontawesome.com) e [Inter](https://fonts.google.com/specimen/Inter) vía CDN.

### Notas

- Cada juego necesita su propio `metadata.json`.
- Los metadatos se cargan en paralelo; una ruta inexistente solo deja un error en consola y no rompe la galería.
- Si un juego no aparece, revisa que `miniatura` y `url` apunten a archivos reales.
- La galería no incluye backend: no hay puntuaciones, cuentas ni guardado en servidor.

Cada tarjeta muestra la miniatura, el nombre, la descripción, la categoría, el autor (con enlace a GitHub si existe), las etiquetas y un botón **Jugar**.

### Créditos y licencia

> **Proyecto original:** [`NekeritDevs/Web-juegos`](https://github.com/NekeritDevs/Web-juegos)
> **Copyright (c) 2025 NekeritStudio**
> **Licencia:** [MIT](LICENSE)

Arcade Nova es una **derivación de «Web Juegos» de NekeritDevs**. El nombre, la identidad visual, el diseño y la documentación se han renovado, pero **todo el código base procede de ese proyecto** y se distribuye bajo su misma licencia.

La licencia MIT obliga a conservar el aviso de copyright y el texto de permiso en todas las copias o partes sustanciales. Por eso el repositorio mantiene:

1. **`LICENSE`** con el texto íntegro de MIT y el copyright original de NekeritStudio, sin modificar.
2. **Este apartado** con enlace al repositorio upstream.
3. **La atribución en el footer** de la web, que enlaza al proyecto original y a su licencia.

**Agradecimientos**: NekeritStudio (autores originales de la galería) y los autores de los juegos incluidos: Alberto Ortiz, Dorado Rodriguez, Marcelo Ecuador, Fernando Brandan, Jairo Delgado, Hevieri y colaboradores.

> [!NOTE]
> La marca *Pokémon* y sus recursos pertenecen a Nintendo / Creatures Inc. / GAME FREAK inc. `pokemon-puzzle` se distribuye con fines educativos y sin afiliación oficial. Este proyecto no está afiliado ni respaldado por NekeritDevs ni por ningún otro tercero mencionado.

### Licencia

**MIT** — consulta [LICENSE](LICENSE). El copyright original de **NekeritStudio** debe conservarse en las copias y versiones derivadas.

---

## English

### Table of contents

- [Overview](#overview)
- [Demo](#demo)
- [Features](#features)
- [Project structure](#project-structure)
- [Running locally](#running-locally)
- [Adding a game](#adding-a-game)
- [metadata.json format](#metadatajson-format)
- [Customisation](#customisation)
- [Technologies](#technologies)
- [Notes](#notes)
- [Credits and license](#credits-and-license)
- [License](#license)

### Overview

**Arcade Nova** is a web gallery of **18 browser minigames** that run with no downloads or installs. The page builds itself: it reads each game's `metadata.json`, renders the cards and provides live search and filters. Everything is plain HTML5, CSS3 and JavaScript, with no build step and no dependencies.

### Demo

**Play now:** <https://alberto2005-coder.github.io/Web-juegos/>

### Features

- **Dynamic catalogue**: games load from their `metadata.json` files.
- **Search and filters** by name, author and tag as you type.
- **Responsive design** with glassmorphism cards, a fluid grid and a fixed blurred header.
- **Light/dark mode** persisted in `localStorage`.
- **No dependencies or build**: served as static files, ideal for GitHub Pages.
- **Accessible**: ARIA labels, `prefers-reduced-motion` support and lazy image loading.
- **XSS protection**: all `metadata.json` text is escaped before being inserted into the DOM.

Included games: 2048, Tic-tac-toe, Chess, Memory, Tetris, Hangman, Breakout, Minesweeper, Connect 4, Checkers, Flappy Nova, Crazy Cats, Pac-Man, Ping Pong, Pokémon Puzzle, Simon, Snake and Space Invaders.

### Project structure

```text
Web-juegos/
├── Juegos/
│   ├── Game-Name/
│   │   ├── metadata.json     # Source of truth for the game
│   │   ├── index.html
│   │   ├── styles.css        # or style.css
│   │   ├── script.js         # or main.js / game.js
│   │   └── logo.png
│   └── ...
├── index.html      # Gallery shell
├── main.js         # Metadata loading, filters and theme
├── styles.css      # Gallery design
├── logo.svg        # Vector logo
├── logo.png        # Raster logo (favicon)
├── LICENSE         # MIT, original NekeritStudio copyright
└── README.md
```

### Running locally

`main.js` uses `fetch()`, so **double-clicking `index.html` will not work** (`file://`). Use a static server:

| Option | Command |
|---|---|
| VS Code + Live Server | Right-click `index.html` → *Open with Live Server* |
| Python | `python -m http.server 8000` |
| Node | `npx serve .` |

Then open <http://localhost:8000>.

To publish it, push the repository to **GitHub Pages** (branch `main`, root folder). `main.js` normalises image paths for case-sensitive servers.

### Adding a game

1. Create a folder inside `Juegos/` named after the game.
2. Copy its files in (`index.html`, styles, scripts, images).
3. Create the `metadata.json` using the format below.
4. Add the route to the `rutas` array in `main.js`:

```javascript
const rutas = [
  "Juegos/Ajedrez/metadata.json",
  "Juegos/3-en-raya/metadata.json",
  // ...
  "Juegos/MyNewGame/metadata.json", // new route
];
```

5. Reload the page: the card appears on its own.

### metadata.json format

```json
{
  "nombre": "Game name",
  "descripcion": "Short game description",
  "categoria": "Game category",
  "autor": "Author name (optional)",
  "github": "https://github.com/user (optional)",
  "miniatura": "Juegos/Game-Name/logo.png",
  "url": "Juegos/Game-Name/index.html",
  "tags": ["arcade", "puzzle", "single-player"]
}
```

| Field | Required | Description |
|---|---|---|
| `nombre` | Yes | Name shown on the card |
| `descripcion` | Yes | Short description (3 lines are shown) |
| `categoria` | Yes | For example *Strategy*, *Arcade* or *Puzzle* |
| `autor` | No | Game author |
| `github` | No | Link to the author's repository |
| `miniatura` | Yes | Card image (~600×400 recommended) |
| `url` | Yes | Path to the game's `index.html` |
| `tags` | No | Tags, coloured automatically |

> [!IMPORTANT]
> Use relative paths exactly as written (`Juegos/...`) and mind the case: GitHub Pages is case-sensitive, so `Logo.png` and `logo.png` are different files.

### Customisation

**Theme and colours** — in `styles.css`:

```css
:root { /* dark theme */ --accent: #7c3aed; --accent-2: #22d3ee; }
[data-theme="light"] { /* light theme */ }
```

**Tag colours** — in `main.js`, the `coloresTags` array assigns colours in order:

```javascript
const coloresTags = ['#FF6B6B', '#4ECDC4', '#45B7D1'];
```

**Grid** — `grid-template-columns: repeat(auto-fill, minmax(255px, 1fr));`

### Technologies

- Semantic HTML5.
- CSS3: custom properties, grid, `backdrop-filter`, animations and media queries.
- JavaScript ES6+: `async/await`, `fetch` and logical modules.
- [Font Awesome 6](https://fontawesome.com) and [Inter](https://fonts.google.com/specimen/Inter) via CDN.

### Notes

- Every game needs its own `metadata.json`.
- Metadata loads in parallel; a missing route only logs a console error and does not break the gallery.
- If a game does not show up, check that `miniatura` and `url` point at real files.
- There is no backend: no scores, accounts or server-side storage.

Each card shows the thumbnail, name, description, category, author (linked to GitHub when present), tags and a **Play** button.

### Credits and license

> **Original project:** [`NekeritDevs/Web-juegos`](https://github.com/NekeritDevs/Web-juegos)
> **Copyright (c) 2025 NekeritStudio**
> **License:** [MIT](LICENSE)

Arcade Nova is a **derivation of "Web Juegos" by NekeritDevs**. The name, visual identity, design and documentation have been renewed, but **the entire codebase comes from that project** and is distributed under the same licence.

The MIT licence requires keeping the copyright notice and permission text in all copies or substantial parts. That is why the repository keeps:

1. **`LICENSE`** with the full MIT text and the original NekeritStudio copyright, unmodified.
2. **This section** with a link to the upstream repository.
3. **Attribution in the web footer**, linking to the original project and its licence.

**Acknowledgements**: NekeritStudio (original authors of the gallery) and the authors of the included games: Alberto Ortiz, Dorado Rodriguez, Marcelo Ecuador, Fernando Brandan, Jairo Delgado, Hevieri and collaborators.

> [!NOTE]
> The *Pokémon* brand and its assets belong to Nintendo / Creatures Inc. / GAME FREAK inc. `pokemon-puzzle` is distributed for educational purposes with no official affiliation. This project is not affiliated with or endorsed by NekeritDevs or any other third party mentioned.

### License

**MIT** — see [LICENSE](LICENSE). The original **NekeritStudio** copyright must be preserved in copies and derivative versions.
