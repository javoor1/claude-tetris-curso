'use strict';

// Tabla de records local (localStorage). Funciona sin storage (solo en memoria).
const Records = (() => {
  const KEY = 'tetris.records';
  const MAX_ENTRIES = 5;
  const MAX_NAME = 12;
  const DEFAULT_NAME = 'Anónimo';

  let data = load();
  let combo = 0;      // limpiezas consecutivas en la partida actual
  let pending = null; // entrada recién guardada que aún espera nombre

  function empty() {
    return { scores: [], bestCombo: 0, maxLines: 0 };
  }

  function cleanName(name) {
    const n = Array.from(String(name == null ? '' : name).replace(/\s+/g, ' ').trim()).slice(0, MAX_NAME).join('');
    return n || DEFAULT_NAME;
  }

  function load() {
    const d = empty();
    try {
      const raw = JSON.parse(localStorage.getItem(KEY));
      if (raw && typeof raw === 'object') {
        if (Array.isArray(raw.scores)) {
          d.scores = raw.scores
            .filter(s => s && Number.isFinite(s.score) && s.score > 0)
            .map(s => ({ name: cleanName(s.name), score: s.score }))
            .sort((a, b) => b.score - a.score)
            .slice(0, MAX_ENTRIES);
        }
        if (Number.isFinite(raw.bestCombo) && raw.bestCombo > 0) d.bestCombo = raw.bestCombo;
        if (Number.isFinite(raw.maxLines) && raw.maxLines > 0) d.maxLines = raw.maxLines;
      }
    } catch (e) { /* sin storage o JSON corrupto */ }
    return d;
  }

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) { /* ignorar */ }
  }

  function rankFor(score) {
    if (!(score > 0)) return -1;
    let i = data.scores.findIndex(s => score > s.score);
    if (i === -1) i = data.scores.length;
    return i < MAX_ENTRIES ? i : -1;
  }

  return {
    MAX_NAME,

    // Nueva partida: una puntuación sin nombrar queda como anónima.
    startRun() {
      pending = null;
      combo = 0;
    },

    // Llamar en cada bloqueo de pieza con las líneas limpiadas (0 si ninguna).
    onLock(cleared) {
      combo = cleared > 0 ? combo + 1 : 0;
      if (combo > data.bestCombo) { data.bestCombo = combo; save(); }
    },

    // Fin de partida. Devuelve true si la puntuación entra al top (hay que pedir nombre).
    // La puntuación se guarda de inmediato como anónima (así no se pierde si se
    // cierra la pestaña) y submit() solo le pone el nombre.
    endRun(score, lines) {
      if (lines > data.maxLines) data.maxLines = lines;
      pending = null;
      const rank = rankFor(score);
      if (rank !== -1) {
        const entry = { name: DEFAULT_NAME, score };
        data.scores.splice(rank, 0, entry);
        data.scores.length = Math.min(data.scores.length, MAX_ENTRIES);
        pending = entry;
      }
      save();
      return pending !== null;
    },

    // Pone nombre a la puntuación pendiente. Devuelve el índice de la fila o -1.
    submit(name) {
      if (!pending) return -1;
      pending.name = cleanName(name);
      const rank = data.scores.indexOf(pending);
      pending = null;
      save();
      return rank;
    },

    // Fila de la puntuación pendiente (para resaltarla antes de nombrarla).
    pendingRank() {
      return pending ? data.scores.indexOf(pending) : -1;
    },

    reset() {
      data = empty();
      pending = null;
      try { localStorage.removeItem(KEY); } catch (e) { /* ignorar */ }
    },

    // Dibuja la tabla en `container` usando solo textContent.
    render(container, highlight) {
      container.textContent = '';
      const ol = document.createElement('ol');
      ol.className = 'records-list';
      for (let i = 0; i < MAX_ENTRIES; i++) {
        const li = document.createElement('li');
        const s = data.scores[i];
        const name = document.createElement('span');
        name.className = 'rec-name';
        name.textContent = s ? s.name : '---';
        const val = document.createElement('span');
        val.className = 'rec-score';
        val.textContent = s ? s.score.toLocaleString() : '0';
        li.append(name, val);
        if (i === highlight) li.className = 'highlight';
        ol.appendChild(li);
      }
      const stats = document.createElement('p');
      stats.className = 'records-stats';
      stats.textContent = `Mejor combo: ${data.bestCombo} · Líneas máx.: ${data.maxLines}`;
      container.append(ol, stats);
    },
  };
})();
