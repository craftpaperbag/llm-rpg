# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

`llm-rpg` is **「100歩の黙示録」 (100 Steps Apocalypse)** — a Japanese-language, monochrome browser RPG about the last 100 steps before a meteor strike. It is built as a static site with **plain HTML / CSS / JS (ES Modules), no build step**. All game text and UI is in Japanese.

The full design specification is in `DESIGN.md` and is the source of truth for game mechanics, scene layout, parameter formulas, ending conditions, and visual/audio design. Read it before making non-trivial changes.

Public deploy: GitHub Pages from `main` branch root (https://craftpaperbag.github.io/llm-rpg/).

## Running Locally

There is no build, no package manager, no test suite, and no linter. `file://` is **not supported** because of ES Module + `fetch` constraints — always serve over HTTP:

```sh
python -m http.server 8000
# then open http://localhost:8000/
```

To clear saves while developing, clear `localStorage` keys `llm-rpg-save` and `llm-rpg-endings` in DevTools.

## Architecture

The game is a single-page state machine with three top-level screens (`#title-screen`, `#game-screen`, `#ending-screen`) toggled via inline `display`. `index.html` contains all three screen templates; `js/main.js` is the entry point loaded as `<script type="module">`.

### Module responsibilities

- **`js/main.js`** — boots audio, wires title-screen buttons, starts a `setInterval` that polls `state.steps` to drive the heartbeat sound.
- **`js/state.js`** — exports a single mutable `state` object plus mutators (`addItem`, `addParam`, `setFlag`, `markVisited`, `resetState`, `loadState`). State shape: `{ steps, currentScene, items[], params{bond,nihil,wrath,hope,truth}, flags{}, visited[] }`. Note: `visited` is an array (not a `Set`) so it round-trips through `JSON.stringify` for save/load.
- **`js/render.js`** — owns all DOM updates. `renderAll()` paints header/scene/items/effects; `handleChoice()` is the central event handler that consumes steps, runs scene actions, autosaves, triggers ending check, fades to next scene, and types out the new text. Step-dependent visual effects (meteor shadow scale, noise overlay at ≤20, shake at ≤10) are applied here in `applyEffects()`.
- **`js/ending.js`** — iterates `endings` in array order and shows the **first** match. Order matters: the priority of endings is encoded by their position in `js/data/endings.js`, with the true ending (`truth`) first and the default lonely ending last.
- **`js/audio.js`** — Web Audio API only, no asset files. Wind (brown noise + lowpass) starts on first user click via `resumeOnce`. Heartbeat tempo scales with remaining steps. Mute toggles a single `windGain`.
- **`js/storage.js`** — thin `localStorage` wrapper. Two keys: `llm-rpg-save` (current run) and `llm-rpg-endings` (persistent unlock list across runs).
- **`js/data/scenes.js`** — `scenes` map keyed by scene id, plus an `actions` registry and `runAction(name, state)` dispatcher. Scenes have `text(state)` and `choices(state)` as **functions** so they can react to flags/items.
- **`js/data/endings.js`** — array of `{ id, name, category, check(state), text }`. Order = priority.
- **`js/data/items.js`** — flat `items` map and `getItem(id)` with a fallback shape so missing ids don't crash rendering.

### Game loop

1. `renderAll()` paints from `state`.
2. User taps a choice button → `handleChoice(choice)`:
   - `state.steps -= choice.cost`
   - if `choice.action`, run it via `runAction` (mutates `state`, sets flags, adds items, increments hidden params)
   - autosave via `saveGame(state)`
   - if `steps <= 0`, fade and call `checkEnding(state)` — terminal
   - else if `choice.next` differs from `currentScene`, fade and switch scene
3. Re-render header/items/effects, then typewriter-animate the new scene text.

### Scene authoring conventions

A scene entry (see `js/data/scenes.js`):

```js
sceneId: {
  id: 'sceneId',
  name: '表示名',
  text: (s) => `本文。${s.flags.someFlag ? '条件分岐テキスト' : ''}`,
  choices: (s) => [
    { label: 'ラベル', cost: 3, next: 'nextScene', action: 'actionName',
      if: (s) => s.items.includes('foo'),   // gate visibility
      hidden: s.flags.alreadyDone },        // also hides
  ],
}
```

- `cost` is integer steps consumed; choices with `state.steps < cost` render disabled (do not gate them with `if`, the renderer handles it).
- `action` must exist as a key in the `actions` registry at the top of `scenes.js`.
- `next: 'sameScene'` re-renders in place after running the action — useful for "examine" choices.
- Hidden params (`bond`, `nihil`, `wrath`, `hope`, `truth`) are set only via `addParam` inside actions; they must remain invisible to the player.

### Ending authoring conventions

Endings are checked top-down by `endings.find(e => e.check(state))`. When adding an ending, place it at the priority position required by `DESIGN.md` §5 — the lonely default must stay last. `check` typically combines a `params.X >= N` threshold with one or more `flags`/`items` requirements.

## Conventions

- Japanese only for all player-facing strings, scene names, and ending text. Code identifiers and comments are a mix; match the surrounding file.
- Monochrome palette only: `#0a0a0a` / `#f0f0f0` / `#666` / `#333` (defined as CSS vars in `style.css`). Do not introduce color.
- Tap/click only — no keyboard handlers. Tap targets ≥56px tall (see `.choice-btn`).
- No external assets. All sound is generated at runtime in `audio.js`; no fonts are bundled (system fallbacks via `'Noto Sans JP', 'Hiragino Sans', ...`).
- Mobile-first: layout is centered with `max-width: 480px`, uses `100dvh` and `env(safe-area-inset-*)`. Test changes in a narrow viewport.
- Audio must never play before the first user gesture — `AudioContext.resume()` happens in a one-shot click handler.
