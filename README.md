<p align="center">
  <img src="logo.svg" alt="Logo de Arcade Nova" width="120">
</p>

<h1 align="center">🕹️ Arcade Nova</h1>

<p align="center">
  <strong>Galería de juegos web para jugar directamente desde el navegador.</strong><br>
  Sin descargas, sin instalaciones: HTML5 + CSS3 + JavaScript puro.
</p>

<p align="center">
  <a href="#-cómo-ejecutarlo-localemente">Ejecutar</a> ·
  <a href="#-añadir-un-juego">Añadir juegos</a> ·
  <a href="#-formato-de-metadatos">Metadata</a> ·
  <a href="#-créditos-y-licencia">Créditos</a>
</p>

---

## ✨ Características

- **Catálogo dinámico**: los juegos se cargan automáticamente desde sus `metadata.json`.
- **Búsqueda y filtros** por nombre, autor y tag en tiempo real.
- **Diseño moderno y responsive**: tarjetas glassmorphism, rejilla fluida y header fijo con desenfoque.
- **Modo claro / oscuro** persistido en `localStorage`.
- **Sin dependencias ni build**: se sirve como archivos estáticos (ideal para GitHub Pages).
- **Accesible**: etiquetas ARIA, `prefers-reduced-motion` y carga diferida de imágenes.

---

## 📂 Estructura del proyecto

```
Web-juegos/
│
├─ Juegos/
│  ├─ Nombre-del-juego/
│  │  ├─ metadata.json     ← fuente de verdad del juego
│  │  ├─ index.html
│  │  ├─ styles.css (o style.css)
│  │  ├─ script.js (o main.js / game.js)
│  │  └─ logo.png
│  └─ ...
│
├─ index.html      ← página principal (shell de la galería)
├─ main.js         ← carga de metadata, filtros y tema
├─ styles.css      ← diseño completo de la galería
├─ logo.svg        ← logo vectorial
├─ logo.png        ← logo raster (favicon y compatibilidad)
├─ LICENSE         ← Licencia MIT (texto original, sin modificar)
└─ README.md       ← este archivo
```

- **Juegos/** — un directorio por juego, cada uno con su `metadata.json`.
- **index.html** — estructura de la galería y filtrado.
- **main.js** — lee la lista `rutas`, genera las tarjetas y aplica los filtros.
- **styles.css** — variables de tema (claro/oscuro), tarjetas, footer y responsive.

---

## 🚀 Cómo ejecutarlo localmente

`main.js` usa `fetch()`, así que el proyecto **no funciona abriendo `index.html` con doble clic** (`file://`). Usá cualquiera de estas opciones:

| Opción | Comando |
| --- | --- |
| **VS Code + Live Server** | clic derecho en `index.html` → *Open with Live Server* |
| **Python** | `python -m http.server 8000` |
| **Node** | `npx serve .` |

Luego abrí <http://localhost:8000>.

Para publicarlo, subí el repositorio a **GitHub Pages** (rama `main`, carpeta `/root`). Las rutas de imágenes se normalizan automáticamente en `main.js` para servidores sensibles a mayúsculas.

---

## 🎮 Añadir un nuevo juego

1. Creá una carpeta dentro de `Juegos/` con el nombre del juego.
2. Copiá dentro los archivos del juego (`index.html`, estilos, scripts, imágenes).
3. Creá el `metadata.json` (formato abajo).
4. Agregá la ruta al array `rutas` en `main.js`:

```javascript
const rutas = [
  "Juegos/Ajedrez/metadata.json",
  "Juegos/3-en-raya/metadata.json",
  // ...
  "Juegos/MiNuevoJuego/metadata.json", // ← nueva ruta
];
```

5. Recargá la página: la tarjeta aparece sola.

---

## 📝 Formato de `metadata.json`

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
| --- | --- | --- |
| `nombre` | ✅ | Nombre visible en la tarjeta. |
| `descripcion` | ✅ | Descripción corta (se muestran 3 líneas). |
| `categoria` | ✅ | Ej.: *Estrategia*, *Arcade*, *Puzzle*. |
| `autor` | ⬜ | Autor del juego. |
| `github` | ⬜ | Enlace al repo del autor (se muestra como enlace junto al nombre). |
| `miniatura` | ✅ | Imagen de la tarjeta (recomendado ~600×400). |
| `url` | ✅ | Ruta al `index.html` del juego. |
| `tags` | ⬜ | Array de etiquetas, coloreadas automáticamente. |

> ⚠️ Usá rutas relativas tal cual (`Juegos/...`), respetando mayúsculas/minúsculas.

---

## 🎨 Personalización

### Tema y colores
Todo el sistema de colores vive en las variables CSS de `styles.css`:

```css
:root { /* tema oscuro */ --accent: #7c3aed; --accent-2: #22d3ee; /* ... */ }
[data-theme="light"] { /* tema claro */ }
```

### Colores de los tags
El array `coloresTags` de `main.js` asigna un color a cada tag en orden:

```javascript
const coloresTags = ['#FF6B6B', '#4ECDC4', '#45B7D1', /* ... */];
```

### Rejilla
```css
grid-template-columns: repeat(auto-fill, minmax(255px, 1fr));
```

---

## 🧰 Tecnologías

- HTML5 semántico
- CSS3 (custom properties, grid, `backdrop-filter`, animaciones, media queries)
- JavaScript ES6+ (async/await, `fetch`, módulos lógicos)
- [Font Awesome 6](https://fontawesome.com) e [Inter](https://fonts.google.com/specimen/Inter) vía CDN

---

## ⚠️ Notas

- Cada juego debe tener su propio `metadata.json`.
- Los datos se cargan en paralelo a la lista `rutas`; una ruta inexistente solo genera un error en consola, sin romper la galería.
- Todos los textos inyectados desde `metadata.json` se escapan antes de renderizarse (proyección contra XSS).
- Si un juego no aparece, revisá que `miniatura` y `url` apunten a rutas reales.

---

## 🖥️ Vista previa

Cada tarjeta muestra:

- Miniatura del juego
- Nombre y descripción
- Categoría y autor (con enlace a GitHub si existe)
- Tags con colores
- Botón **Jugar** que abre el juego

---

## 🔍 Créditos y licencia

> **Proyecto original:** [`NekeritDevs/Web-juegos`](https://github.com/NekeritDevs/Web-juegos)
> **Copyright (c) 2025 NekeritStudio**
> **Licencia:** [MIT](./LICENSE)

Arcade Nova es una **derivación del proyecto «Web Juegos» de NekeritDevs** (antes publicado como fork del repositorio original). El nombre, la identidad visual, el diseño y la documentación han sido renovados, pero **todo el código base procede de dicho proyecto** y se distribuye bajo su misma licencia.

La [Licencia MIT](./LICENSE) obliga a conservar el aviso de copyright y el texto de permiso en **todas las copias o partes sustanciales** del software. Por eso este repositorio mantiene:

1. **`LICENSE`** — texto íntegro de la Licencia MIT con el copyright original de NekeritStudio, **sin modificar**.
2. **Este apartado** en el README principal, con enlace al repositorio upstream.
3. **La atribución visible en el footer** de la web (icono *code-branch*), que enlaza al repositorio original y a su licencia.

### ¿Qué podés hacer con la licencia MIT?

| Permitido | Condición |
| --- | --- |
| Usar, copiar, modificar | Conservar el aviso de copyright y la licencia MIT |
| Fusionar, publicar, sublicenciar, vender | Incluir el mismo aviso en copias y partes sustanciales |

### Agradecimientos

- **[NekeritStudio](https://github.com/NekeritDevs)** — autores originales de *Web Juegos* y de la estructura de la galería.
- Autores de los juegos incluidos: Alberto Ortiz, Dorado Rodriguez, Marcelo Ecuador, Fernando Brandan, Jairo Delgado, Hevieri y colaboradores.
- La marca *Pokémon* y sus recursos son propiedad de Nintendo / Creatures Inc. / GAME FREAK inc.; `pokemon-puzzle` se distribuye con fines educativos y sin afiliación oficial.

> ℹ️ Este proyecto **no está afiliado ni respaldado** por NekeritDevs ni por ningún tercero mencionado.


---

# English Version

**Arcade Nova** — a dynamic, scalable web gallery of browser minigames. Built with a modular frontend architecture (HTML5/CSS3/vanilla JS) that automatically renders game cards from JSON metadata files.

**Play it live:** https://alberto2005-coder.github.io/Web-juegos/

## ✨ Features

- **Dynamic catalogue**: games load automatically from their `metadata.json` files.
- **Search and filters** by name, author and tag in real time.
- **Modern responsive design**: glassmorphism cards, fluid grid and fixed blurred header.
- **Light / dark mode** persisted in `localStorage`.
- **No dependencies or build step**: served as static files (ideal for GitHub Pages).
- **Accessible**: ARIA labels, `prefers-reduced-motion` and lazy image loading.

## 📂 Project Structure

```text
Web-juegos/
│
├─ Juegos/
│  ├─ Game-Name/
│  │  ├─ metadata.json     <- source of truth for the game
│  │  ├─ index.html
│  │  ├─ styles.css (or style.css)
│  │  ├─ script.js (or main.js / game.js)
│  │  └─ logo.png
│  └─ ...
│
├─ index.html      <- main page (gallery shell)
├─ main.js         <- loads metadata, filters and theme
├─ styles.css      <- full design (light/dark, cards, footer, responsive)
├─ logo.svg        <- vector logo
├─ logo.png        <- raster logo (favicon and compatibility)
├─ LICENSE         <- MIT License
└─ README.md       <- this file
```

`Juegos/` — one directory per game, each with its own `metadata.json`.
`index.html` — gallery structure and filtering.
`main.js` — reads the route list, generates cards and applies filters.
`styles.css` — theme variables (light/dark), cards, footer and responsive rules.

## 🚀 Run it locally

`main.js` uses `fetch()`, so the project does **not** work by double-clicking `index.html` (`file://`). Use any of these options:

| Option | Command |
|---|---|
| VS Code + Live Server | right-click `index.html` -> Open with Live Server |
| Python | `python -m http.server 8000` |
| Node | `npx serve .` |

Then open `http://localhost:8000`.

To publish it, upload the repository to GitHub Pages (branch `main`, root folder). Image paths are normalized automatically in `main.js` for case-sensitive servers.

## 🎮 Add a new game

1. Create a folder inside `Juegos/` with the game's name.
2. Copy the game files into it (`index.html`, styles, scripts, images).
3. Create the `metadata.json` (format below).
4. Add the route to the `rutas` array in `main.js`:

```js
const rutas = [
  "Juegos/Ajedrez/metadata.json",
  "Juegos/3-en-raya/metadata.json",
  // ...
  "Juegos/MyNewGame/metadata.json", // <- new route
];
```

5. Reload the page: the card appears automatically.

## 📝 metadata.json format

```json
{
  "nombre": "Game Name",
  "descripcion": "Brief description of the game",
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
| `nombre` | ✅ | Name shown on the card. |
| `descripcion` | ✅ | Short description (3 lines are shown). |
| `categoria` | ✅ | e.g. Strategy, Arcade, Puzzle. |
| `autor` | ⬜ | Game author. |
| `github` | ⬜ | Author's repo link (shown next to the name). |
| `miniatura` | ✅ | Card image (recommended ~600×400). |
| `url` | ✅ | Path to the game's `index.html`. |
| `tags` | ⬜ | Array of tags, coloured automatically. |

⚠️ Use relative paths as-is (`Juegos/...`), respecting case.

## 🎨 Customization

Theme and colours live in the CSS variables in `styles.css`:

```css
:root { /* dark theme */ --accent: #7c3aed; --accent-2: #22d3ee; /* ... */ }
[data-theme="light"] { /* light theme */ }
```

Tag colours are assigned in order by the `coloresTags` array in `main.js`:

```js
const coloresTags = ['#FFB6B6', '#4ECDC4', '#45B7D1', /* ... */];
```

Grid: `grid-template-columns: repeat(auto-fill, minmax(255px, 1fr));`

## 🧰 Technologies

- Semantic HTML5
- CSS3 (custom properties, grid, backdrop-filter, animations, media queries)
- JavaScript ES6+ (async/await, fetch, logical modules)
- Font Awesome 6 and Inter via CDN

## ⚠️ Notes

- Each game must have its own `metadata.json`.
- Data loads in parallel with the route list; a missing route only logs an error without breaking the gallery.
- All text injected from `metadata.json` is escaped before rendering (XSS protection).
- If a game does not appear, check that `miniatura` and `url` point to real paths.

## 🔗 Credits and License

Original project: [NekeritDevs/Web-juegos](https://github.com/NekeritDevs/Web-juegos)
Copyright (c) 2025 NekeritStudio
License: MIT

**Arcade Nova** is a derivation of the "Web Juegos" project by NekeritDevs (previously published as a fork of the original repository). The name, visual identity, design and documentation have been renewed, but the entire code base comes from that project and is distributed under the same license.

The MIT License requires keeping the copyright notice and permission text in all copies or substantial parts of the software. That is why this repository keeps:

- `LICENSE` — the full MIT License text with the original NekeritStudio copyright, unmodified.
- This section in the main README, with a link to the upstream repository.
- Visible attribution in the web footer (code-branch icon), linking to the original repository and its license.

### What you can do under the MIT License

| Allowed | Condition |
|---|---|
| Use, copy, modify | Keep the copyright notice and the MIT License |
| Merge, publish, sublicense, sell | Include the same notice in copies and substantial parts |

### Acknowledgements

- **NekeritStudio** — original authors of Web Juegos and of the gallery structure.
- Authors of the included games: Alberto Ortiz, Dorado Rodriguez, Marcelo Ecuador, Fernando Brandan, Jairo Delgado, Hevieri and collaborators.
- The Pokémon brand and its assets are property of Nintendo / Creatures Inc. / GAME FREAK inc.; `pokemon-puzzle` is distributed for educational purposes with no official affiliation.

ℹ️ This project is not affiliated with or endorsed by NekeritDevs or any other third party mentioned.

