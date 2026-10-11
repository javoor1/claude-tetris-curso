'use strict';

const COLS = 10;
const ROWS = 20;
const BLOCK = 30;

// Cada skin define paleta (índices 1-7 como PIECES), fondos, rejilla y función de dibujo de bloque.
const SKINS = {
  retro: {
    name: 'Retro',
    colors: [null, '#4dd0e1', '#ffd54f', '#ba68c8', '#81c784', '#e57373', '#7986cb', '#ffb74d'],
    bg: '#1a1a25',
    grid: '#22222e',
    drawBlock(context, px, py, size, color) {
      context.fillStyle = color;
      context.fillRect(px + 1, py + 1, size - 2, size - 2);
      context.fillStyle = 'rgba(255,255,255,0.12)';
      context.fillRect(px + 1, py + 1, size - 2, 4);
    },
  },
  neon: {
    name: 'Neon',
    colors: [null, '#00fff2', '#fff200', '#d400ff', '#39ff14', '#ff073a', '#2f6bff', '#ff8c00'],
    bg: '#000000',
    grid: '#10101a',
    drawBlock(context, px, py, size, color) {
      context.shadowColor = color;
      context.shadowBlur = 12;
      context.fillStyle = color + '33';
      context.fillRect(px + 2, py + 2, size - 4, size - 4);
      context.strokeStyle = color;
      context.lineWidth = 2;
      context.strokeRect(px + 3, py + 3, size - 6, size - 6);
      context.shadowBlur = 0;
      context.shadowColor = 'transparent';
    },
  },
  pastel: {
    name: 'Pastel',
    colors: [null, '#a8e6ef', '#fff1a8', '#d9b8e6', '#b8e6c1', '#f7b6b6', '#b9c1ee', '#ffd3a1'],
    bg: '#fdf6f0',
    grid: '#eadfd6',
    drawBlock(context, px, py, size, color) {
      const r = size * 0.3;
      context.fillStyle = color;
      context.beginPath();
      context.roundRect(px + 2, py + 2, size - 4, size - 4, r);
      context.fill();
      context.fillStyle = 'rgba(255,255,255,0.45)';
      context.beginPath();
      context.roundRect(px + 5, py + 5, size - 10, size * 0.2, r / 2);
      context.fill();
    },
  },
  pixel: {
    name: 'Pixel art',
    colors: [null, '#3ec6d8', '#f2c230', '#a24bc0', '#4caf50', '#d63c3c', '#4f5fc4', '#e8892b'],
    bg: '#14141c',
    grid: '#1e1e2a',
    drawBlock(context, px, py, size, color) {
      const u = size / 6; // rejilla 6x6 de "píxeles"
      context.fillStyle = color;
      context.fillRect(px, py, size, size);
      // sombra (abajo/derecha) y luz (arriba/izquierda)
      context.fillStyle = 'rgba(0,0,0,0.35)';
      context.fillRect(px, py + size - u, size, u);
      context.fillRect(px + size - u, py, u, size);
      context.fillStyle = 'rgba(255,255,255,0.35)';
      context.fillRect(px, py, size - u, u);
      context.fillRect(px, py, u, size - u);
      // textura: damero interior
      context.fillStyle = 'rgba(0,0,0,0.18)';
      for (let i = 1; i < 5; i++)
        for (let j = 1; j < 5; j++)
          if ((i + j) % 2 === 0) context.fillRect(px + i * u, py + j * u, u, u);
      context.fillStyle = 'rgba(255,255,255,0.5)';
      context.fillRect(px + u, py + u, u, u);
    },
  },
};

const SKIN_KEY = 'tetris-skin';
let skin = SKINS.retro;
let COLORS = skin.colors;

const PIECES = [
  null,
  [[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]], // I
  [[2,2],[2,2]],                               // O
  [[0,3,0],[3,3,3],[0,0,0]],                  // T
  [[0,4,4],[4,4,0],[0,0,0]],                  // S
  [[5,5,0],[0,5,5],[0,0,0]],                  // Z
  [[6,0,0],[6,6,6],[0,0,0]],                  // J
  [[0,0,7],[7,7,7],[0,0,0]],                  // L
];

const LINE_SCORES = [0, 100, 300, 500, 800];

const canvas = document.getElementById('board');
const ctx = canvas.getContext('2d');
const nextCanvas = document.getElementById('next-canvas');
const nextCtx = nextCanvas.getContext('2d');
const scoreEl = document.getElementById('score');
const linesEl = document.getElementById('lines');
const levelEl = document.getElementById('level');
const overlay = document.getElementById('overlay');
const overlayTitle = document.getElementById('overlay-title');
const overlayScore = document.getElementById('overlay-score');
const restartBtn = document.getElementById('restart-btn');

const pauseMenu = document.getElementById('pause-menu');
const pauseMain = document.getElementById('pause-main');
const pauseControls = document.getElementById('pause-controls');
const resumeBtn = document.getElementById('resume-btn');
const pauseRestartBtn = document.getElementById('pause-restart-btn');
const controlsBtn = document.getElementById('controls-btn');
const controlsBackBtn = document.getElementById('controls-back-btn');
const startLevelSel = document.getElementById('start-level');

const MAX_START_LEVEL = 15;

const startScreen = document.getElementById('start-screen');
const startBtn = document.getElementById('start-btn');
const skinSelect = document.getElementById('skin-select');

const STORAGE_KEY = 'tetris-records';
const MAX_RECORDS = 5;
const nameForm = document.getElementById('name-form');
const nameInput = document.getElementById('name-input');
const recordMsg = document.getElementById('record-msg');
const recordsLists = document.querySelectorAll('.records-list');
const recordsExtras = document.querySelectorAll('.records-extra');
const resetBtns = document.querySelectorAll('.reset-records-btn');

let started = false;
let startLevel = 1;
let board, current, next, score, lines, level, paused, gameOver, lastTime, dropAccum, dropInterval, animId;
let combo, maxCombo, records, highlightIdx;

function loadRecords() {
  const empty = { top: [], bestCombo: 0, maxLines: 0 };
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!data || !Array.isArray(data.top)) return empty;
    return {
      top: data.top.slice(0, MAX_RECORDS),
      bestCombo: Number(data.bestCombo) || 0,
      maxLines: Number(data.maxLines) || 0,
    };
  } catch (e) {
    return empty;
  }
}

function saveRecords() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch (e) { /* almacenamiento no disponible */ }
}

function qualifiesForTop(sc) {
  if (sc <= 0) return false;
  return records.top.length < MAX_RECORDS || sc > records.top[records.top.length - 1].score;
}

function renderRecords() {
  recordsLists.forEach(list => {
    list.textContent = '';
    if (!records.top.length) {
      const li = document.createElement('li');
      li.className = 'empty';
      li.textContent = 'Sin records todavía';
      list.appendChild(li);
    }
    records.top.forEach((rec, i) => {
      const li = document.createElement('li');
      if (i === highlightIdx) li.className = 'highlight';
      const name = document.createElement('span');
      name.textContent = `${i + 1}. ${rec.name}`;
      const pts = document.createElement('span');
      pts.textContent = Number(rec.score).toLocaleString();
      li.append(name, pts);
      list.appendChild(li);
    });
  });
  recordsExtras.forEach(el => {
    el.textContent = `Mejor combo: ${records.bestCombo} · Líneas máx: ${records.maxLines}`;
  });
}

function submitRecord() {
  if (nameForm.classList.contains('hidden')) return;
  const name = nameInput.value.trim().slice(0, 12) || 'Anónimo';
  let idx = records.top.findIndex(r => score > r.score);
  if (idx === -1) idx = records.top.length;
  records.top.splice(idx, 0, { name, score });
  records.top.length = Math.min(records.top.length, MAX_RECORDS);
  highlightIdx = idx;
  saveRecords();
  nameForm.classList.add('hidden');
  recordMsg.textContent = `¡Guardado en el puesto ${idx + 1}!`;
  renderRecords();
}

function resetRecords() {
  if (!confirm('¿Borrar todos los records?')) return;
  records = { top: [], bestCombo: 0, maxLines: 0 };
  highlightIdx = -1;
  saveRecords();
  renderRecords();
}

function speedFor(lvl) {
  return Math.max(100, 1000 - (lvl - 1) * 90);
}

function createBoard() {
  return Array.from({ length: ROWS }, () => new Array(COLS).fill(0));
}

function randomPiece() {
  const type = Math.floor(Math.random() * 7) + 1;
  const shape = PIECES[type].map(row => [...row]);
  return { type, shape, x: Math.floor(COLS / 2) - Math.floor(shape[0].length / 2), y: 0 };
}

function collide(shape, ox, oy) {
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (!shape[r][c]) continue;
      const nx = ox + c;
      const ny = oy + r;
      if (nx < 0 || nx >= COLS || ny >= ROWS) return true;
      if (ny >= 0 && board[ny][nx]) return true;
    }
  }
  return false;
}

function rotateCW(shape) {
  const rows = shape.length, cols = shape[0].length;
  const result = Array.from({ length: cols }, () => new Array(rows).fill(0));
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      result[c][rows - 1 - r] = shape[r][c];
  return result;
}

function tryRotate() {
  const rotated = rotateCW(current.shape);
  const kicks = [0, -1, 1, -2, 2];
  for (const kick of kicks) {
    if (!collide(rotated, current.x + kick, current.y)) {
      current.shape = rotated;
      current.x += kick;
      return;
    }
  }
}

function merge() {
  for (let r = 0; r < current.shape.length; r++)
    for (let c = 0; c < current.shape[r].length; c++)
      if (current.shape[r][c])
        board[current.y + r][current.x + c] = current.shape[r][c];
}

function clearLines() {
  let cleared = 0;
  for (let r = ROWS - 1; r >= 0; r--) {
    if (board[r].every(v => v !== 0)) {
      board.splice(r, 1);
      board.unshift(new Array(COLS).fill(0));
      cleared++;
      r++;
    }
  }
  if (cleared) {
    lines += cleared;
    score += (LINE_SCORES[cleared] || 0) * level;
    level = Math.floor(lines / 10) + startLevel;
    dropInterval = speedFor(level);
    updateHUD();
  }
  return cleared;
}

function ghostY() {
  let gy = current.y;
  while (!collide(current.shape, current.x, gy + 1)) gy++;
  return gy;
}

function hardDrop() {
  const gy = ghostY();
  score += (gy - current.y) * 2;
  current.y = gy;
  lockPiece();
}

function softDrop() {
  if (!collide(current.shape, current.x, current.y + 1)) {
    current.y++;
    score += 1;
    updateHUD();
  } else {
    lockPiece();
  }
}

function lockPiece() {
  merge();
  if (clearLines()) {
    combo++;
    maxCombo = Math.max(maxCombo, combo);
  } else {
    combo = 0;
  }
  spawn();
}

function spawn() {
  current = next;
  next = randomPiece();
  if (collide(current.shape, current.x, current.y)) {
    endGame();
  }
  drawNext();
}

function updateHUD() {
  scoreEl.textContent = score.toLocaleString();
  linesEl.textContent = lines;
  levelEl.textContent = level;
}

function drawBlock(context, x, y, colorIndex, size, alpha) {
  if (!colorIndex) return;
  context.globalAlpha = alpha ?? 1;
  skin.drawBlock(context, x * size, y * size, size, COLORS[colorIndex]);
  context.globalAlpha = 1;
}

function applySkin(key) {
  skin = SKINS[key] || SKINS.retro;
  COLORS = skin.colors;
  canvas.style.background = skin.bg;
  nextCanvas.style.background = skin.bg;
  document.body.dataset.skin = key in SKINS ? key : 'retro';
  if (started) {
    draw();
    drawNext();
  }
}

function drawGrid() {
  ctx.strokeStyle = skin.grid;
  ctx.lineWidth = 0.5;
  for (let c = 1; c < COLS; c++) {
    ctx.beginPath();
    ctx.moveTo(c * BLOCK, 0);
    ctx.lineTo(c * BLOCK, ROWS * BLOCK);
    ctx.stroke();
  }
  for (let r = 1; r < ROWS; r++) {
    ctx.beginPath();
    ctx.moveTo(0, r * BLOCK);
    ctx.lineTo(COLS * BLOCK, r * BLOCK);
    ctx.stroke();
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawGrid();

  // board
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS; c++)
      drawBlock(ctx, c, r, board[r][c], BLOCK);

  // ghost
  const gy = ghostY();
  for (let r = 0; r < current.shape.length; r++)
    for (let c = 0; c < current.shape[r].length; c++)
      if (current.shape[r][c])
        drawBlock(ctx, current.x + c, gy + r, current.shape[r][c], BLOCK, 0.2);

  // current piece
  for (let r = 0; r < current.shape.length; r++)
    for (let c = 0; c < current.shape[r].length; c++)
      drawBlock(ctx, current.x + c, current.y + r, current.shape[r][c], BLOCK);
}

function drawNext() {
  const NB = 30;
  nextCtx.clearRect(0, 0, nextCanvas.width, nextCanvas.height);
  const shape = next.shape;
  const offX = Math.floor((4 - shape[0].length) / 2);
  const offY = Math.floor((4 - shape.length) / 2);
  for (let r = 0; r < shape.length; r++)
    for (let c = 0; c < shape[r].length; c++)
      drawBlock(nextCtx, offX + c, offY + r, shape[r][c], NB);
}

function endGame() {
  gameOver = true;
  cancelAnimationFrame(animId);
  overlayTitle.textContent = 'GAME OVER';
  overlayScore.textContent = `Puntuación: ${score.toLocaleString()}`;
  records.bestCombo = Math.max(records.bestCombo, maxCombo);
  records.maxLines = Math.max(records.maxLines, lines);
  highlightIdx = -1;
  if (qualifiesForTop(score)) {
    recordMsg.textContent = '¡Entras en el top 5! Escribe tu nombre';
    nameForm.classList.remove('hidden');
    nameInput.value = '';
    setTimeout(() => nameInput.focus(), 0);
  } else {
    recordMsg.textContent = '';
    nameForm.classList.add('hidden');
  }
  saveRecords();
  renderRecords();
  overlay.classList.add('is-gameover');
  overlay.classList.remove('hidden');
}

function togglePause() {
  if (gameOver) return;
  paused = !paused;
  if (!paused) {
    pauseMenu.classList.add('hidden');
    if (document.activeElement) document.activeElement.blur();
    lastTime = performance.now();
    loop(lastTime);
  } else {
    cancelAnimationFrame(animId);
    showControls(false);
    pauseMenu.classList.remove('hidden');
    resumeBtn.focus();
  }
}

function showControls(show) {
  pauseMain.classList.toggle('hidden', show);
  pauseControls.classList.toggle('hidden', !show);
  (show ? controlsBackBtn : controlsBtn).focus();
}

function loop(ts) {
  const dt = ts - lastTime;
  lastTime = ts;
  dropAccum += dt;
  if (dropAccum >= dropInterval) {
    dropAccum = 0;
    if (!collide(current.shape, current.x, current.y + 1)) {
      current.y++;
    } else {
      lockPiece();
    }
  }
  draw();
  animId = requestAnimationFrame(loop);
}

function init() {
  board = createBoard();
  score = 0;
  lines = 0;
  level = startLevel;
  paused = false;
  gameOver = false;
  combo = 0;
  maxCombo = 0;
  overlay.classList.remove('is-gameover');
  dropInterval = speedFor(level);
  dropAccum = 0;
  lastTime = performance.now();
  next = randomPiece();
  spawn();
  updateHUD();
  overlay.classList.add('hidden');
  pauseMenu.classList.add('hidden');
  if (document.activeElement) document.activeElement.blur();
  cancelAnimationFrame(animId);
  animId = requestAnimationFrame(loop);
}

document.addEventListener('keydown', e => {
  if (e.target === nameInput) {
    if (e.code === 'Enter') submitRecord();
    return;
  }
  if (!started) {
    if (e.code === 'Enter') startGame();
    return;
  }
  if (e.code === 'KeyP' || e.code === 'Escape') {
    if (!e.repeat) togglePause();
    return;
  }
  // menú de pausa abierto: el juego no recibe inputs
  if (paused || gameOver) return;
  switch (e.code) {
    case 'ArrowLeft':
      if (!collide(current.shape, current.x - 1, current.y)) current.x--;
      break;
    case 'ArrowRight':
      if (!collide(current.shape, current.x + 1, current.y)) current.x++;
      break;
    case 'ArrowDown':
      softDrop();
      break;
    case 'ArrowUp':
    case 'KeyX':
      tryRotate();
      break;
    case 'Space':
      e.preventDefault();
      hardDrop();
      break;
  }
  updateHUD();
});

function startGame() {
  if (started) return;
  started = true;
  startScreen.classList.add('hidden');
  init();
}

document.getElementById('save-record-btn').addEventListener('click', submitRecord);
resetBtns.forEach(b => b.addEventListener('click', resetRecords));
records = loadRecords();
highlightIdx = -1;
renderRecords();

function loadSkin() {
  let key = 'retro';
  try { key = localStorage.getItem(SKIN_KEY) || 'retro'; } catch (_) {}
  if (!(key in SKINS)) key = 'retro';
  skinSelect.value = key;
  applySkin(key);
}

skinSelect.addEventListener('change', () => {
  applySkin(skinSelect.value);
  try { localStorage.setItem(SKIN_KEY, skinSelect.value); } catch (_) {}
  skinSelect.blur(); // evita que flechas/espacio cambien el select
});

for (const [key, s] of Object.entries(SKINS)) {
  skinSelect.add(new Option(s.name, key));
}
loadSkin();

restartBtn.addEventListener('click', init);
startBtn.addEventListener('click', startGame);

for (let l = 1; l <= MAX_START_LEVEL; l++) {
  startLevelSel.add(new Option(l, l));
}
startLevelSel.addEventListener('change', () => {
  startLevel = Number(startLevelSel.value);
  startLevelSel.blur();
});
resumeBtn.addEventListener('click', togglePause);
pauseRestartBtn.addEventListener('click', init);
controlsBtn.addEventListener('click', () => showControls(true));
controlsBackBtn.addEventListener('click', () => showControls(false));
