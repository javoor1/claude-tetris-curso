'use strict';

// Menú de pausa. Se carga antes de game.js; game.js llama a showPauseMenu /
// hidePauseMenu y lee startLevel. Los botones llaman a togglePause() e init()
// (definidas en game.js) solo en tiempo de ejecución.

const pauseMenu = document.getElementById('pause-menu');
const pauseResumeBtn = document.getElementById('pause-resume-btn');
const pauseRestartBtn = document.getElementById('pause-restart-btn');
const pauseControlsBtn = document.getElementById('pause-controls-btn');
const pauseControlsList = document.getElementById('pause-controls-list');
const startLevelSelect = document.getElementById('start-level');

let startLevel = 1;

function showPauseMenu() {
  pauseControlsList.classList.add('hidden');
  pauseControlsBtn.setAttribute('aria-expanded', 'false');
  startLevelSelect.value = String(startLevel);
  pauseMenu.classList.remove('hidden');
  pauseResumeBtn.focus();
}

function hidePauseMenu() {
  pauseMenu.classList.add('hidden');
  if (document.activeElement && pauseMenu.contains(document.activeElement)) {
    document.activeElement.blur();
  }
}

pauseResumeBtn.addEventListener('click', () => togglePause());
pauseRestartBtn.addEventListener('click', () => init());
pauseControlsBtn.addEventListener('click', () => {
  const hidden = pauseControlsList.classList.toggle('hidden');
  pauseControlsBtn.setAttribute('aria-expanded', String(!hidden));
});
startLevelSelect.addEventListener('change', () => {
  const n = parseInt(startLevelSelect.value, 10);
  startLevel = n >= 1 && n <= 10 ? n : 1;
});
