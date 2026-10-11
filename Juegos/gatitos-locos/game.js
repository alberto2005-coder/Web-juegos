/* =========================================================
   GATITOS LOCOS — juego de gatos en el navegador
   Sin dependencias: HTML5 Canvas + Web Audio
   ========================================================= */

(() => {
  "use strict";

  /* ---------- Referencias del DOM ---------- */
  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");

  const el = {
    hud: document.getElementById("hud"),
    score: document.getElementById("score"),
    best: document.getElementById("best"),
    time: document.getElementById("time"),
    level: document.getElementById("level"),
    lives: document.getElementById("lives"),
    combo: document.getElementById("combo"),
    menu: document.getElementById("menu"),
    over: document.getElementById("over"),
    pause: document.getElementById("pause"),
    finalScore: document.getElementById("finalScore"),
    newBest: document.getElementById("newBest"),
    stats: document.getElementById("stats"),
    startBtn: document.getElementById("startBtn"),
    retryBtn: document.getElementById("retryBtn"),
    resumeBtn: document.getElementById("resumeBtn"),
  };

  /* ---------- Utilidades ---------- */
  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = (arr) => arr[(Math.random() * arr.length) | 0];
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const TAU = Math.PI * 2;

  /* ---------- Lienzo / resize ---------- */
  let W = 0, H = 0, DPR = 1;

  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = Math.floor(W * DPR);
    canvas.height = Math.floor(H * DPR);
    canvas.style.width = W + "px";
    canvas.style.height = H + "px";
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    buildScenery();
  }

  /* ---------- Escenario (jardín) ---------- */
  let groundY = 0, scenery = [];

  function buildScenery() {
    groundY = Math.max(220, H * 0.52);
    scenery = [];
    // arbustos, flores y setas repartidos por el césped
    const n = Math.round(W / 70);
    for (let i = 0; i < n; i++) {
      scenery.push({
        kind: Math.random() < 0.45 ? "bush" : "flower",
        x: rand(-20, W + 20),
        y: rand(groundY + 30, H - 8),
        s: rand(0.7, 1.5),
        c: pick(["#ff7b9c", "#ffd166", "#b28dff", "#7ce7ff", "#ff9f6b"]),
      });
    }
    scenery.sort((a, b) => a.y - b.y);
  }

  /* ---------- Audio (miaus sintetizados) ---------- */
  let audioCtx = null;
  function audio() {
    if (!audioCtx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) audioCtx = new AC();
    }
    if (audioCtx && audioCtx.state === "suspended") audioCtx.resume();
    return audioCtx;
  }

  function meow(pitch = 1) {
    const ac = audio();
    if (!ac) return;
    const t = ac.currentTime;
    const osc = ac.createOscillator();
    const filt = ac.createBiquadFilter();
    const gain = ac.createGain();
    osc.type = "sawtooth";
    filt.type = "lowpass";
    filt.frequency.value = 2400;
    osc.frequency.setValueAtTime(430 * pitch, t);
    osc.frequency.exponentialRampToValueAtTime(760 * pitch, t + 0.09);
    osc.frequency.exponentialRampToValueAtTime(360 * pitch, t + 0.38);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.22, t + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.42);
    osc.connect(filt).connect(gain).connect(ac.destination);
    osc.start(t);
    osc.stop(t + 0.45);
  }

  function sfx(type) {
    const ac = audio();
    if (!ac) return;
    const t = ac.currentTime;
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.connect(gain).connect(ac.destination);
    osc.start(t); // debe iniciar antes de poder programar stop()
    gain.gain.setValueAtTime(0.0001, t);

    if (type === "coin") {
      osc.type = "square";
      osc.frequency.setValueAtTime(660, t);
      osc.frequency.setValueAtTime(990, t + 0.07);
      osc.frequency.setValueAtTime(1320, t + 0.14);
      gain.gain.exponentialRampToValueAtTime(0.15, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
      osc.stop(t + 0.32);
    } else if (type === "escape") {
      osc.type = "triangle";
      osc.frequency.setValueAtTime(420, t);
      osc.frequency.exponentialRampToValueAtTime(120, t + 0.35);
      gain.gain.exponentialRampToValueAtTime(0.2, t + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.4);
      osc.stop(t + 0.42);
    } else if (type === "over") {
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(340, t);
      osc.frequency.exponentialRampToValueAtTime(90, t + 0.9);
      gain.gain.exponentialRampToValueAtTime(0.22, t + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.0);
      osc.stop(t + 1.02);
    } else {
      osc.type = "sine";
      osc.frequency.setValueAtTime(700, t);
      gain.gain.exponentialRampToValueAtTime(0.1, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.15);
      osc.stop(t + 0.16);
    }
  }

  /* ---------- Tipos de gato ---------- */
  const FURS = [
    { base: "#f5a24b", stripe: "#d9762a", name: "naranja" },
    { base: "#8d8d99", stripe: "#6b6b78", name: "gris" },
    { base: "#f4f1ea", stripe: "#d8d2c6", name: "blanco" },
    { base: "#4a4a55", stripe: "#33333c", name: "negro" },
    { base: "#a9714b", stripe: "#7d4f31", name: "café" },
    { base: "#e9c9a4", stripe: "#c9a37a", name: "crema" },
  ];

  /* ---------- Estado del juego ---------- */
  const G = {
    state: "menu", // menu | playing | paused | over
    score: 0,
    best: 0,
    lives: 3,
    level: 1,
    timeLeft: 60,
    pets: 0,
    combo: 0,
    comboTimer: 0,
    spawnTimer: 0,
    cats: [],
    particles: [],
    floaters: [],
    shake: 0,
    elapsed: 0,
  };

  try {
    G.best = parseInt(localStorage.getItem("gatitos_best") || "0", 10) || 0;
  } catch (e) { G.best = 0; }
  el.best.textContent = G.best;
  window.__G = G; // depuración

  /* ---------- Crear gato ---------- */
  function spawnCat() {
    const golden = Math.random() < 0.1;
    const side = Math.random() < 0.5 ? -1 : 1; // -1: entra por la izquierda
    const size = golden ? rand(24, 30) : rand(30, 42);
    const fur = golden ? { base: "#ffd447", stripe: "#f0a400", name: "dorado" } : pick(FURS);
    const speed = rand(60, 105) * (1 + (G.level - 1) * 0.16) * (golden ? 1.7 : 1);

    const y = rand(groundY + 45, H - 55);
    const dir = -side;        // si entra por la izquierda, camina hacia la derecha
    G.cats.push({
      x: side === -1 ? -size * 2 : W + size * 2,
      y,
      dir,
      size,
      speed,
      fur,
      golden,
      flip: dir === -1,       // mirando hacia la izquierda cuando camina hacia allí
      phase: rand(0, TAU),
      walk: rand(0, 10),
      state: "walk",          // walk | happy | gone
      stateT: 0,
      dead: false,
      w: size * 2.3,
      h: size * 1.7,
    });
  }

  /* ---------- Partículas ---------- */
  function hearts(x, y, n, color) {
    for (let i = 0; i < n; i++) {
      G.particles.push({
        type: "heart",
        x: x + rand(-14, 14),
        y: y + rand(-10, 6),
        vx: rand(-60, 60),
        vy: rand(-150, -70),
        life: rand(0.7, 1.2),
        t: 0,
        size: rand(9, 17),
        color,
      });
    }
  }

  function burst(x, y, color, n = 12) {
    for (let i = 0; i < n; i++) {
      const a = rand(0, TAU), sp = rand(60, 260);
      G.particles.push({
        type: "dot",
        x, y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp - 60,
        life: rand(0.4, 0.8),
        t: 0,
        size: rand(3, 7),
        color,
      });
    }
  }

  function floater(x, y, text, color) {
    G.floaters.push({ x, y, text, color, t: 0, life: 1 });
  }

  /* ---------- Interacción ---------- */
  function pointerPos(ev) {
    const r = canvas.getBoundingClientRect();
    const p = ev.touches ? ev.touches[0] : ev;
    return { x: p.clientX - r.left, y: p.clientY - r.top };
  }

  function onPointer(ev) {
    if (G.state !== "playing") return;
    audio(); // desbloquear audio con el primer gesto
    const { x, y } = pointerPos(ev);

    for (let i = G.cats.length - 1; i >= 0; i--) {
      const c = G.cats[i];
      if (c.state !== "walk") continue;
      const hw = c.w * 0.62, hh = c.h * 0.72;
      if (x > c.x - hw && x < c.x + hw && y > c.y - hh && y < c.y + hh) {
        petCat(c);
        return;
      }
    }
    // clic al vacío: pequeño efecto de "plop"
    burst(x, y, "rgba(255,255,255,0.8)", 5);
    sfx("click");
  }

  function petCat(c) {
    c.state = "happy";
    c.stateT = 0;

    // combo
    G.combo = G.comboTimer > 0 ? G.combo + 1 : 1;
    G.comboTimer = 2.2;
    const mult = Math.min(G.combo, 5);

    const base = c.golden ? 50 : 10;
    const pts = base * mult;
    G.score += pts;
    G.pets++;

    if (c.golden) {
      G.timeLeft = Math.min(75, G.timeLeft + 4);
      sfx("coin");
      burst(c.x, c.y, "#ffd447", 22);
      floater(c.x, c.y - 40, `+${pts} ¡DORADO!`, "#ffd447");
      meow(1.35);
    } else {
      sfx("pop");
      burst(c.x, c.y, c.fur.base, 10);
      floater(c.x, c.y - 40, `+${pts}`, "#ffffff");
      meow(rand(0.85, 1.25));
    }
    hearts(c.x, c.y - 10, c.golden ? 8 : 5, "#ff7b9c");

    // nivel cada 10 aciertos
    const lvl = Math.floor(G.pets / 10) + 1;
    if (lvl > G.level) {
      G.level = lvl;
      floater(W / 2, H / 2, `NIVEL ${G.level}`, "#7dff9e");
      sfx("coin");
    }

    G.shake = c.golden ? 10 : 4;
    updateHUD();
  }

  function loseLife(c) {
    G.lives--;
    G.combo = 0;
    G.comboTimer = 0;
    G.shake = 14;
    sfx("escape");
    floater(clamp(c.x, 60, W - 60), clamp(c.y - 30, 60, H - 60), "¡se escapó! 😿", "#ff6b6b");
    updateHUD();
    if (G.lives <= 0) endGame();
  }

  /* ---------- HUD ---------- */
  function updateHUD() {
    el.score.textContent = G.score;
    el.level.textContent = G.level;
    el.lives.textContent = "❤️".repeat(Math.max(0, G.lives)) + "🖤".repeat(Math.max(0, 3 - G.lives));
    const t = Math.ceil(G.timeLeft);
    el.time.textContent = t;
    el.time.classList.toggle("danger", t <= 10);
    if (G.combo >= 2 && G.comboTimer > 0) {
      el.combo.textContent = "COMBO x" + Math.min(G.combo, 5);
      el.combo.classList.remove("hidden");
      // reiniciar animación
      el.combo.style.animation = "none";
      void el.combo.offsetWidth;
      el.combo.style.animation = "";
    } else {
      el.combo.classList.add("hidden");
    }
  }

  /* ---------- Ciclo de juego ---------- */
  function resetGame() {
    G.score = 0;
    G.lives = 3;
    G.level = 1;
    G.timeLeft = 60;
    G.pets = 0;
    G.combo = 0;
    G.comboTimer = 0;
    G.spawnTimer = 0.3;
    G.cats = [];
    G.particles = [];
    G.floaters = [];
    G.shake = 0;
    updateHUD();
  }

  function startGame() {
    resetGame();
    G.state = "playing";
    el.menu.classList.add("hidden");
    el.over.classList.add("hidden");
    el.pause.classList.add("hidden");
    el.hud.classList.remove("hidden");
    audio();
    for (let i = 0; i < 3; i++) spawnCat();
  }

  function endGame() {
    G.state = "over";
    sfx("over");
    const isBest = G.score > G.best;
    if (isBest) {
      G.best = G.score;
      try { localStorage.setItem("gatitos_best", String(G.best)); } catch (e) {}
    }
    el.best.textContent = G.best;
    el.finalScore.textContent = G.score;
    el.stats.textContent = `Acariciaste ${G.pets} gatos y llegaste al nivel ${G.level}.`;
    el.newBest.classList.toggle("hidden", !isBest);
    el.hud.classList.add("hidden");
    el.combo.classList.add("hidden");
    setTimeout(() => el.over.classList.remove("hidden"), 550);
  }

  function togglePause() {
    if (G.state === "playing") {
      G.state = "paused";
      el.pause.classList.remove("hidden");
    } else if (G.state === "paused") {
      G.state = "playing";
      el.pause.classList.add("hidden");
    }
  }

  /* ---------- Actualización ---------- */
  function update(dt) {
    G.elapsed += dt;

    if (G.state === "playing") {
      G.timeLeft -= dt;
      if (G.timeLeft <= 0) {
        G.timeLeft = 0;
        updateHUD();
        endGame();
        return;
      }

      G.comboTimer = Math.max(0, G.comboTimer - dt);
      if (G.comboTimer === 0) G.combo = 0;

      // aparición progresiva
      G.spawnTimer -= dt;
      if (G.spawnTimer <= 0 && G.cats.length < 9) {
        spawnCat();
        G.spawnTimer = rand(0.7, 1.5) / (1 + (G.level - 1) * 0.12);
      }

      updateHUD();
    }

    // gatos: caminan siempre (también en el menú, para dar vida a la escena)
    for (let i = G.cats.length - 1; i >= 0; i--) {
      const c = G.cats[i];
      c.walk += dt * 8;

      if (c.state === "walk") {
        c.x += c.dir * c.speed * dt;
        const escaped = c.dir === -1 ? c.x > W + c.size * 2.5 : c.x < -c.size * 2.5;
        if (escaped) {
          G.cats.splice(i, 1);
          if (G.state === "playing") loseLife(c);
          continue;
        }
      } else if (c.state === "happy") {
        c.stateT += dt;
        if (c.stateT > 0.75) c.state = "gone";
      }

      if (c.state === "gone") G.cats.splice(i, 1);
    }

    // partículas (también en pausa no, pero en menú sí para el ambiente)
    for (let i = G.particles.length - 1; i >= 0; i--) {
      const p = G.particles[i];
      p.t += dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.type === "heart") p.vy += 90 * dt;
      else p.vy += 520 * dt;
      if (p.t >= p.life) G.particles.splice(i, 1);
    }

    for (let i = G.floaters.length - 1; i >= 0; i--) {
      const f = G.floaters[i];
      f.t += dt;
      f.y -= 46 * dt;
      if (f.t >= f.life) G.floaters.splice(i, 1);
    }

    G.shake = Math.max(0, G.shake - dt * 30);
  }

  /* ---------- Dibujo ---------- */
  function drawBackground() {
    // cielo
    const sky = ctx.createLinearGradient(0, 0, 0, groundY);
    sky.addColorStop(0, "#67c8ff");
    sky.addColorStop(0.6, "#a5e2ff");
    sky.addColorStop(1, "#e8f8ff");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, groundY);

    // sol / luna
    ctx.save();
    ctx.globalAlpha = 0.9;
    const sx = W - 110, sy = 95;
    const glow = ctx.createRadialGradient(sx, sy, 5, sx, sy, 70);
    glow.addColorStop(0, "rgba(255,241,150,1)");
    glow.addColorStop(0.4, "rgba(255,224,90,0.75)");
    glow.addColorStop(1, "rgba(255,224,90,0)");
    ctx.fillStyle = glow;
    ctx.beginPath(); ctx.arc(sx, sy, 70, 0, TAU); ctx.fill();
    ctx.fillStyle = "#fff2a8";
    ctx.beginPath(); ctx.arc(sx, sy, 34, 0, TAU); ctx.fill();
    ctx.restore();

    // nubes
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    for (let i = 0; i < 4; i++) {
      const cx = ((G.elapsed * (8 + i * 4) + i * 320) % (W + 260)) - 130;
      const cy = 55 + i * 34;
      ctx.beginPath();
      ctx.arc(cx, cy, 24, 0, TAU);
      ctx.arc(cx + 26, cy + 6, 18, 0, TAU);
      ctx.arc(cx - 26, cy + 7, 16, 0, TAU);
      ctx.arc(cx + 6, cy - 14, 17, 0, TAU);
      ctx.fill();
    }

    // césped
    const grass = ctx.createLinearGradient(0, groundY, 0, H);
    grass.addColorStop(0, "#7ed957");
    grass.addColorStop(1, "#4aa63c");
    ctx.fillStyle = grass;
    ctx.fillRect(0, groundY, W, H - groundY);

    // borde de arbusto
    ctx.fillStyle = "#5cbf47";
    for (let x = -30; x < W + 40; x += 46) {
      const h = 16 + Math.sin(x * 0.05) * 6;
      ctx.beginPath();
      ctx.ellipse(x, groundY + 4, 30, h, 0, Math.PI, 0);
      ctx.fill();
    }

    // cerca de madera
    ctx.fillStyle = "#b98553";
    for (let x = 10; x < W; x += 74) {
      ctx.fillRect(x, groundY - 46, 12, 50);
      ctx.beginPath();
      ctx.moveTo(x, groundY - 46);
      ctx.lineTo(x + 6, groundY - 56);
      ctx.lineTo(x + 12, groundY - 46);
      ctx.fill();
    }
    ctx.fillStyle = "#c9945f";
    ctx.fillRect(0, groundY - 34, W, 7);
    ctx.fillRect(0, groundY - 16, W, 7);

    // plantas
    for (const s of scenery) {
      ctx.save();
      ctx.translate(s.x, s.y);
      ctx.scale(s.s, s.s);
      if (s.kind === "bush") {
        ctx.fillStyle = "#3f9c39";
        ctx.beginPath();
        ctx.arc(-13, 0, 15, 0, TAU);
        ctx.arc(13, 1, 14, 0, TAU);
        ctx.arc(0, -10, 17, 0, TAU);
        ctx.fill();
        ctx.fillStyle = "rgba(255,255,255,0.14)";
        ctx.beginPath(); ctx.arc(-4, -14, 7, 0, TAU); ctx.fill();
      } else {
        ctx.strokeStyle = "#3f9c39";
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(0, 4); ctx.lineTo(0, -14); ctx.stroke();
        ctx.fillStyle = s.c;
        for (let a = 0; a < 5; a++) {
          const ang = (a / 5) * TAU;
          ctx.beginPath();
          ctx.arc(Math.cos(ang) * 7, -14 + Math.sin(ang) * 7, 5.5, 0, TAU);
          ctx.fill();
        }
        ctx.fillStyle = "#fff3b0";
        ctx.beginPath(); ctx.arc(0, -14, 4.5, 0, TAU); ctx.fill();
      }
      ctx.restore();
    }
  }

  function drawCat(c) {
    const s = c.size;
    const happy = c.state === "happy";
    const popScale = happy ? 1 + Math.sin(c.stateT * 22) * 0.12 : 1;
    const fade = happy ? clamp(1 - (c.stateT - 0.35) / 0.4, 0, 1) : 1;

    const bob = Math.sin(c.walk) * (happy ? 2 : s * 0.10);
    const legSwing = Math.sin(c.walk * 1.6) * (happy ? 0 : 0.35);

    ctx.save();
    ctx.globalAlpha = fade;
    ctx.translate(c.x, c.y + bob);
    ctx.scale((c.flip ? -1 : 1) * popScale, popScale);

    // sombra
    ctx.fillStyle = "rgba(0,0,0,0.18)";
    ctx.beginPath();
    ctx.ellipse(0, s * 0.72, s * 0.95, s * 0.2, 0, 0, TAU);
    ctx.fill();

    const F = c.fur;

    // cola
    ctx.save();
    ctx.strokeStyle = F.base;
    ctx.lineWidth = s * 0.3;
    ctx.lineCap = "round";
    const tailWave = Math.sin(c.walk * 1.3) * 0.5;
    ctx.beginPath();
    ctx.moveTo(-s * 0.85, s * 0.25);
    ctx.quadraticCurveTo(-s * 1.5, s * 0.1 + tailWave * s, -s * 1.45, -s * 0.55 + tailWave * s);
    ctx.stroke();
    ctx.lineWidth = s * 0.14;
    ctx.strokeStyle = F.stripe;
    ctx.beginPath();
    ctx.moveTo(-s * 1.42, -s * 0.28 + tailWave * s);
    ctx.quadraticCurveTo(-s * 1.5, -s * 0.45 + tailWave * s, -s * 1.45, -s * 0.58 + tailWave * s);
    ctx.stroke();
    ctx.restore();

    // patas
    ctx.fillStyle = F.base;
    const legs = [-s * 0.55, -s * 0.18, s * 0.3, s * 0.62];
    legs.forEach((lx, i) => {
      const sw = (i % 2 === 0 ? 1 : -1) * legSwing * s * 0.35;
      ctx.save();
      ctx.translate(lx, s * 0.35);
      ctx.rotate(sw / s);
      ctx.fillRect(-s * 0.14, 0, s * 0.28, s * 0.42);
      ctx.fillStyle = "rgba(255,255,255,0.55)";
      ctx.fillRect(-s * 0.14, s * 0.3, s * 0.28, s * 0.12);
      ctx.fillStyle = F.base;
      ctx.restore();
    });

    // cuerpo
    ctx.fillStyle = F.base;
    ctx.beginPath();
    ctx.ellipse(-s * 0.05, s * 0.12, s * 0.92, s * 0.55, 0, 0, TAU);
    ctx.fill();

    // rayas del cuerpo
    ctx.strokeStyle = F.stripe;
    ctx.lineWidth = s * 0.1;
    ctx.lineCap = "round";
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.arc(-s * 0.35 + i * s * 0.3, -s * 0.16, s * 0.26, Math.PI * 1.15, Math.PI * 1.85);
      ctx.stroke();
    }

    // panza clara
    ctx.fillStyle = "rgba(255,255,255,0.35)";
    ctx.beginPath();
    ctx.ellipse(s * 0.15, s * 0.42, s * 0.4, s * 0.2, 0, 0, TAU);
    ctx.fill();

    // cabeza
    const hx = s * 0.78, hy = -s * 0.18;
    ctx.save();
    ctx.translate(hx, hy);
    const headTilt = happy ? Math.sin(c.stateT * 14) * 0.12 : Math.sin(c.walk * 0.7) * 0.05;
    ctx.rotate(headTilt);

    // orejas
    ctx.fillStyle = F.base;
    ctx.beginPath();
    ctx.moveTo(-s * 0.42, -s * 0.2);
    ctx.lineTo(-s * 0.3, -s * 0.72);
    ctx.lineTo(s * 0.02, -s * 0.38);
    ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(s * 0.16, -s * 0.42);
    ctx.lineTo(s * 0.42, -s * 0.74);
    ctx.lineTo(s * 0.5, -s * 0.22);
    ctx.closePath(); ctx.fill();
    // interior orejas
    ctx.fillStyle = "#ffb7c5";
    ctx.beginPath();
    ctx.moveTo(-s * 0.33, -s * 0.3);
    ctx.lineTo(-s * 0.28, -s * 0.58);
    ctx.lineTo(-s * 0.06, -s * 0.38);
    ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(s * 0.23, -s * 0.42);
    ctx.lineTo(s * 0.39, -s * 0.6);
    ctx.lineTo(s * 0.43, -s * 0.3);
    ctx.closePath(); ctx.fill();

    // cara
    ctx.fillStyle = F.base;
    ctx.beginPath();
    ctx.ellipse(0, 0, s * 0.52, s * 0.46, 0, 0, TAU);
    ctx.fill();

    // mancha frontal
    ctx.fillStyle = "rgba(255,255,255,0.45)";
    ctx.beginPath();
    ctx.ellipse(s * 0.1, s * 0.14, s * 0.3, s * 0.24, 0, 0, TAU);
    ctx.fill();

    // rayas de la frente
    ctx.strokeStyle = F.stripe;
    ctx.lineWidth = s * 0.07;
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath();
      ctx.moveTo(i * s * 0.16, -s * 0.4);
      ctx.lineTo(i * s * 0.13, -s * 0.2);
      ctx.stroke();
    }

    // ojos
    const eyeY = -s * 0.05;
    ctx.fillStyle = "#2c2c36";
    if (happy) {
      // ojos felices ^ ^
      ctx.strokeStyle = "#2c2c36";
      ctx.lineWidth = s * 0.075;
      ctx.lineCap = "round";
      [-s * 0.2, s * 0.2].forEach((ex) => {
        ctx.beginPath();
        ctx.arc(ex, eyeY + s * 0.04, s * 0.11, Math.PI * 1.15, Math.PI * 1.85);
        ctx.stroke();
      });
    } else {
      const blink = Math.sin(c.walk * 0.5 + c.phase) > 0.96;
      [-s * 0.2, s * 0.2].forEach((ex, idx) => {
        if (blink) {
          ctx.strokeStyle = "#2c2c36";
          ctx.lineWidth = s * 0.06;
          ctx.beginPath();
          ctx.moveTo(ex - s * 0.1, eyeY);
          ctx.lineTo(ex + s * 0.1, eyeY);
          ctx.stroke();
        } else {
          ctx.fillStyle = c.golden ? "#2fa84f" : "#3fbf6b";
          ctx.beginPath(); ctx.ellipse(ex, eyeY, s * 0.1, s * 0.12, 0, 0, TAU); ctx.fill();
          ctx.fillStyle = "#141419";
          ctx.beginPath();
          ctx.ellipse(ex + (idx === 0 ? s * 0.02 : -s * 0.02), eyeY, s * 0.045, s * 0.09, 0, 0, TAU);
          ctx.fill();
          ctx.fillStyle = "#fff";
          ctx.beginPath();
          ctx.arc(ex + s * 0.03, eyeY - s * 0.05, s * 0.028, 0, TAU);
          ctx.fill();
        }
      });
    }

    // hocico
    ctx.fillStyle = "#ff9aa9";
    ctx.beginPath();
    ctx.moveTo(-s * 0.07, s * 0.1);
    ctx.lineTo(s * 0.07, s * 0.1);
    ctx.lineTo(0, s * 0.2);
    ctx.closePath(); ctx.fill();

    // boca
    ctx.strokeStyle = "#5a3b40";
    ctx.lineWidth = s * 0.045;
    if (happy) {
      ctx.beginPath();
      ctx.arc(-s * 0.09, s * 0.2, s * 0.09, 0, Math.PI);
      ctx.arc(s * 0.09, s * 0.2, s * 0.09, 0, Math.PI);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.moveTo(0, s * 0.2);
      ctx.quadraticCurveTo(-s * 0.1, s * 0.3, -s * 0.16, s * 0.22);
      ctx.moveTo(0, s * 0.2);
      ctx.quadraticCurveTo(s * 0.1, s * 0.3, s * 0.16, s * 0.22);
      ctx.stroke();
    }

    // bigotes
    ctx.strokeStyle = "rgba(255,255,255,0.9)";
    ctx.lineWidth = s * 0.03;
    ctx.lineCap = "round";
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath();
      ctx.moveTo(s * 0.18, s * 0.12 + i * s * 0.06);
      ctx.lineTo(s * 0.72, s * 0.05 + i * s * 0.15);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-s * 0.18, s * 0.12 + i * s * 0.06);
      ctx.lineTo(-s * 0.5, s * 0.06 + i * s * 0.14);
      ctx.stroke();
    }

    // cachetes al acariciar
    if (happy) {
      ctx.fillStyle = "rgba(255,120,150,0.5)";
      ctx.beginPath(); ctx.ellipse(-s * 0.3, s * 0.16, s * 0.1, s * 0.07, 0, 0, TAU); ctx.fill();
      ctx.beginPath(); ctx.ellipse(s * 0.3, s * 0.16, s * 0.1, s * 0.07, 0, 0, TAU); ctx.fill();
    }

    ctx.restore(); // cabeza
    ctx.restore(); // gato completo

    // medidor del gato dorado (brillo)
    if (c.golden && !happy) {
      ctx.save();
      ctx.globalAlpha = 0.35 + Math.sin(G.elapsed * 8) * 0.2;
      ctx.strokeStyle = "#fff6c2";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(c.x, c.y, c.w * 0.7, c.h * 0.75, 0, 0, TAU);
      ctx.stroke();
      ctx.restore();
    }
  }

  function drawParticles() {
    for (const p of G.particles) {
      const a = 1 - p.t / p.life;
      ctx.save();
      ctx.globalAlpha = clamp(a, 0, 1);
      ctx.fillStyle = p.color;
      if (p.type === "heart") {
        const s = p.size;
        ctx.translate(p.x, p.y);
        ctx.rotate(Math.sin(p.t * 6) * 0.3);
        ctx.beginPath();
        ctx.moveTo(0, s * 0.3);
        ctx.bezierCurveTo(-s, -s * 0.4, -s * 0.4, -s, 0, -s * 0.35);
        ctx.bezierCurveTo(s * 0.4, -s, s, -s * 0.4, 0, s * 0.3);
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * a, 0, TAU);
        ctx.fill();
      }
      ctx.restore();
    }

    for (const f of G.floaters) {
      const a = 1 - f.t / f.life;
      ctx.save();
      ctx.globalAlpha = clamp(a, 0, 1);
      ctx.font = "900 26px 'Segoe UI', system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.lineWidth = 5;
      ctx.strokeStyle = "rgba(0,0,0,0.55)";
      ctx.strokeText(f.text, f.x, f.y);
      ctx.fillStyle = f.color;
      ctx.fillText(f.text, f.x, f.y);
      ctx.restore();
    }
  }

  function render() {
    ctx.save();
    if (G.shake > 0) {
      ctx.translate(rand(-G.shake, G.shake), rand(-G.shake, G.shake));
    }

    drawBackground();

    // gatos ordenados por profundidad
    const sorted = G.cats.slice().sort((a, b) => a.y - b.y);
    for (const c of sorted) drawCat(c);

    drawParticles();
    ctx.restore();
  }

  /* ---------- Bucle principal ---------- */
  let last = performance.now();
  function loop(now) {
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    update(dt);
    render();
    requestAnimationFrame(loop);
  }

  /* ---------- Gatos de fondo en el menú ---------- */
  function menuAmbient() {
    if (G.state !== "menu") return;
    if (G.cats.length < 5 && Math.random() < 0.02) spawnCat();
  }

  /* ---------- Eventos ---------- */
  canvas.addEventListener("pointerdown", onPointer);
  canvas.addEventListener("touchstart", (e) => { e.preventDefault(); onPointer(e); }, { passive: false });

  document.addEventListener("keydown", (e) => {
    if (e.key === "p" || e.key === "P" || e.key === "Escape") togglePause();
    if (e.key === " " && G.state !== "playing") { e.preventDefault(); startGame(); }
  });

  el.startBtn.addEventListener("click", startGame);
  el.retryBtn.addEventListener("click", startGame);
  el.resumeBtn.addEventListener("click", togglePause);
  window.addEventListener("resize", resize);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden && G.state === "playing") togglePause();
  });

  setInterval(menuAmbient, 300);

  /* ---------- Arranque ---------- */
  resize();
  for (let i = 0; i < 4; i++) spawnCat();
  requestAnimationFrame(loop);
})();
