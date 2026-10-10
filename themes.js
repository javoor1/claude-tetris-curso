'use strict';

// Temas visuales (skins). Se carga antes que game.js.
// Cada tema: paleta (índices 1-7 como COLORS), color de rejilla y función propia de dibujo de bloque.

const SKIN_KEY = 'tetris.skin';
const DEFAULT_SKIN = 'retro';

function roundedRectPath(context, x, y, w, h, r) {
  context.beginPath();
  context.moveTo(x + r, y);
  context.arcTo(x + w, y, x + w, y + h, r);
  context.arcTo(x + w, y + h, x, y + h, r);
  context.arcTo(x, y + h, x, y, r);
  context.arcTo(x, y, x + w, y, r);
  context.closePath();
}

const THEMES = {
  retro: {
    label: 'Retro',
    palette: [
      null,
      '#4dd0e1', '#ffd54f', '#ba68c8', '#81c784', '#e57373', '#90caf9', '#ffb74d',
    ],
    grid: '#22222e',
    drawBlock(context, x, y, colorIndex, size, alpha) {
      context.globalAlpha = alpha ?? 1;
      context.fillStyle = this.palette[colorIndex];
      context.fillRect(x * size + 1, y * size + 1, size - 2, size - 2);
      context.fillStyle = 'rgba(255,255,255,0.12)';
      context.fillRect(x * size + 1, y * size + 1, size - 2, 4);
      context.globalAlpha = 1;
    },
  },

  neon: {
    label: 'Neon',
    palette: [
      null,
      '#00f0ff', '#fff700', '#d400ff', '#39ff14', '#ff073a', '#2f6bff', '#ff9100',
    ],
    grid: '#161628',
    drawBlock(context, x, y, colorIndex, size, alpha) {
      const color = this.palette[colorIndex];
      const px = x * size + 3;
      const py = y * size + 3;
      const s = size - 6;
      context.save();
      context.globalAlpha = alpha ?? 1;
      context.shadowColor = color;
      context.shadowBlur = 12;
      context.fillStyle = 'rgba(0,0,0,0.85)';
      context.fillRect(px, py, s, s);
      context.strokeStyle = color;
      context.lineWidth = 2;
      context.strokeRect(px, py, s, s);
      context.shadowBlur = 0;
      context.fillStyle = color;
      context.globalAlpha = (alpha ?? 1) * 0.35;
      context.fillRect(px + 3, py + 3, s - 6, s - 6);
      context.restore();
      context.shadowBlur = 0;
      context.globalAlpha = 1;
    },
  },

  pastel: {
    label: 'Pastel',
    palette: [
      null,
      '#a8e6ef', '#fff1b3', '#d9b8f0', '#b7e4c7', '#ffb3ba', '#bcd7ff', '#ffd6a5',
    ],
    grid: '#3a3a4e',
    drawBlock(context, x, y, colorIndex, size, alpha) {
      const px = x * size + 2;
      const py = y * size + 2;
      const s = size - 4;
      context.globalAlpha = alpha ?? 1;
      roundedRectPath(context, px, py, s, s, 8);
      context.fillStyle = this.palette[colorIndex];
      context.fill();
      roundedRectPath(context, px + 4, py + 3, s - 8, 5, 2.5);
      context.fillStyle = 'rgba(255,255,255,0.45)';
      context.fill();
      context.globalAlpha = 1;
    },
  },

  pixel: {
    label: 'Pixel art',
    palette: [
      null,
      '#3fc7d8', '#f2c230', '#9c4fc0', '#4caf50', '#d84a4a', '#4f8fe0', '#e8892a',
    ],
    grid: '#1c1c28',
    drawBlock(context, x, y, colorIndex, size, alpha) {
      const bx = x * size + 1;
      const by = y * size + 1;
      const s = size - 2;
      const p = Math.max(2, Math.round(s / 6)); // "píxel" de la textura
      context.globalAlpha = alpha ?? 1;
      context.fillStyle = this.palette[colorIndex];
      context.fillRect(bx, by, s, s);
      // textura: tablero de ajedrez sutil
      context.fillStyle = 'rgba(255,255,255,0.14)';
      for (let i = 0; i * p < s; i++)
        for (let j = 0; j * p < s; j++)
          if ((i + j) % 2 === 0)
            context.fillRect(bx + i * p, by + j * p, Math.min(p, s - i * p), Math.min(p, s - j * p));
      // bisel claro arriba/izquierda y oscuro abajo/derecha
      context.fillStyle = 'rgba(255,255,255,0.45)';
      context.fillRect(bx, by, s, p);
      context.fillRect(bx, by, p, s);
      context.fillStyle = 'rgba(0,0,0,0.4)';
      context.fillRect(bx, by + s - p, s, p);
      context.fillRect(bx + s - p, by, p, s);
      context.globalAlpha = 1;
    },
  },
};

let activeSkin = DEFAULT_SKIN;

function activeTheme() {
  return THEMES[activeSkin];
}

function applySkin(name, persist) {
  if (!Object.prototype.hasOwnProperty.call(THEMES, name)) name = DEFAULT_SKIN;
  activeSkin = name;
  for (const key of Object.keys(THEMES)) document.body.classList.remove('skin-' + key);
  document.body.classList.add('skin-' + name);
  const sel = document.getElementById('skin-select');
  if (sel && sel.value !== name) sel.value = name;
  if (persist) {
    try { localStorage.setItem(SKIN_KEY, name); } catch (e) { /* sin almacenamiento */ }
  }
  // redibuja tablero y NEXT (definida en game.js; no existe aún durante la carga)
  if (typeof refreshView === 'function') refreshView();
}

(function initSkins() {
  const sel = document.getElementById('skin-select');
  if (sel) {
    for (const key of Object.keys(THEMES)) {
      const opt = document.createElement('option');
      opt.value = key;
      opt.textContent = THEMES[key].label;
      sel.appendChild(opt);
    }
    sel.addEventListener('change', () => {
      applySkin(sel.value, true);
      sel.blur(); // evita que las flechas/Espacio del juego manipulen el select
    });
  }
  let saved = null;
  try { saved = localStorage.getItem(SKIN_KEY); } catch (e) { /* ignorar */ }
  applySkin(saved || DEFAULT_SKIN, false);
})();
