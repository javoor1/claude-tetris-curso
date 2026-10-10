# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Vanilla JS Tetris (HTML5 Canvas). No `package.json`, bundler, linter or tests. The git repo root is `claude-tetris-curso/`; the parent folder is not a repo. README and UI strings are in Spanish.

## Running

Open `index.html` directly, or serve the folder statically (e.g. `python -m http.server 8000`). There is no build, lint or test command.

## Architecture

Four files: `index.html` (DOM, two canvases), `style.css`, `themes.js` (skins: `THEMES` with palette, grid color and `drawBlock` per theme; persisted in `localStorage` key `tetris.skin`; must load before `game.js`) and `game.js` (all game logic, loaded as a classic script, `'use strict'`). `drawBlock`/`drawGrid` in `game.js` delegate to `activeTheme()`; `COLORS` is just the Retro palette.

`game.js` uses module-level mutable state declared on one `let` line (`board`, `current`, `next`, `score`, `lines`, `level`, `paused`, `gameOver`, `lastTime`, `dropAccum`, `dropInterval`, `animId`). `init()` resets all of it and is also the restart handler.

Key flow:
- `loop(ts)` (rAF) accumulates `dropAccum`; on `dropInterval` it moves the piece down or calls `lockPiece()`, then `draw()`.
- `lockPiece()` = `merge()` -> `clearLines()` -> `spawn()`. `spawn()` promotes `next` to `current` and triggers `endGame()` if the new piece collides immediately.
- `clearLines()` owns level and speed: `level = floor(lines/10)+1`, `dropInterval = max(100, 1000 - (level-1)*90)`.
- Soft drop and hard drop award points outside `clearLines()` (1 per row, 2 per row).
- Pause and game over both cancel the rAF (`cancelAnimationFrame(animId)`); `togglePause()` restarts the loop by calling `loop()` directly after resetting `lastTime`.

Data model: `board` is `ROWS x COLS` of `0` or a color index 1-7. `PIECES[type]` and `COLORS[type]` share the same index, and the numbers inside each shape matrix equal that index. `randomPiece()` copies the shape, so never mutate `PIECES`.

## Gotchas

- Canvas size is hard-coded in `index.html` (`#board` 300x600, `#next-canvas` 120x120). If `COLS`, `ROWS` or `BLOCK` change, update the canvas `width`/`height` to match. The next-piece preview assumes a 4x4 cell box at 30px (`NB` in `drawNext`).
- Rotation is clockwise only (`rotateCW`), with a simple horizontal kick list `[0, -1, 1, -2, 2]` in `tryRotate`. Not SRS.
- Pieces spawn at `y: 0`, and `collide` ignores cells with `ny < 0`.
- `keydown` handler uses `e.code` (`KeyP`, `KeyX`, `Space`, arrows), not `e.key`.
