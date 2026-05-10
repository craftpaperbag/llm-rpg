# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

`llm-rpg` is **「100歩の黙示録」 (100 Steps Apocalypse)** — a Japanese-language browser RPG about the last 100 steps before a meteor strike. It is built as a static site with **plain HTML / CSS / JS (ES Modules), no build step, no dependencies, no lockfile**. All game text and UI is in Japanese.

The full design specification is in `DESIGN.md` and is the source of truth for game mechanics, scene layout, parameter formulas, ending conditions, and visual/audio design. Read it before making non-trivial changes.

Public deploy: GitHub Pages from `main` branch root (https://craftpaperbag.github.io/llm-rpg/).

## Running Locally

There is no build, no package manager, no test suite, and no linter. `file://` is **not supported** because of ES Module + `fetch` constraints — always serve over HTTP:

```sh
python -m http.server 8000
# then open http://localhost:8000/
```

To reset state while developing, clear these `localStorage` keys in DevTools:
- `llm-rpg-save` — current run
- `llm-rpg-endings` — persistent unlocked-endings list
- `llm-rpg-theme` — `'dark'` (default) or `'light'`

## CI

`.github/workflows/bump-version.yml` auto-bumps the patch in `js/version.js` on every push to `main` and commits it back with `[skip ci]`. Add `[skip ci]` to your commit subject to suppress the bump (e.g. for docs-only changes).

## Architecture

The game is a single-page state machine with **four** top-level screens (`#title-screen`, `#opening-cinematic`, `#game-screen`, `#ending-screen`) toggled via inline `display`. `index.html` contains all four screen templates; `js/main.js` is the entry point loaded as `<script type="module">`.

### Module responsibilities

- **`js/main.js`** — boots theme + audio, wires title-screen buttons, awaits the opening cinematic on new game, starts a `setInterval` that polls `state.steps` to drive the heartbeat sound. Modal modules are loaded **lazily via dynamic `import()`** the first time their button is tapped.
- **`js/state.js`** — exports a single mutable `state` object plus mutators (`addItem`, `addParam`, `setFlag`, `markVisited`, `resetState`, `loadState`). State shape: `{ steps, currentScene, items[], params{bond,nihil,wrath,hope,truth}, flags{}, visited[] }`. Note: `visited` is an array (not a `Set`) so it round-trips through `JSON.stringify` for save/load.
- **`js/render.js`** — owns all DOM updates. `renderAll()` paints header/scene/items/effects; `handleChoice()` is the central event handler that consumes steps, runs scene actions, autosaves, triggers ending check, fades to next scene, and types out the new text. Step-dependent visual effects (meteor shadow scale, noise overlay at ≤20, shake at ≤10) are applied here in `applyEffects()`.
- **`js/ending.js`** — iterates `endings` in array order and shows the **first** match. Order matters: the priority of endings is encoded by their position in `js/data/endings.js`, with the true ending (`truth`) first and the default lonely ending last.
- **`js/audio.js`** — Web Audio API only, no asset files. Wind (brown noise + lowpass) starts on first user click via `resumeOnce`. Heartbeat tempo scales with remaining steps. Mute toggles a single `windGain`.
- **`js/storage.js`** — thin `localStorage` wrapper. Three keys: `llm-rpg-save` (current run), `llm-rpg-endings` (persistent unlock list), `llm-rpg-theme` (`'dark' | 'light'`).
- **`js/theme.js`** — sets `document.documentElement.dataset.theme` (`dark` / `light`) and updates `<meta name="theme-color">`. CSS variables in `style.css` switch on `html[data-theme="..."]`.
- **`js/opening.js`** — controls `#opening-cinematic`: a ~13s meteor approach animation plus typewriter narration. Returns a `Promise` that resolves on safety timeout, narration finish, or screen/skip-button tap. `main.js` awaits it before showing `#game-screen`.
- **`js/map.js`** — renders the map modal, mapping each scene id to a `viewBox 0–100` coordinate.
- **`js/aboutModal.js` / `js/inventoryModal.js` / `js/charactersModal.js` / `js/settingsModal.js`** — modal UIs for 作品について / 持ち物 / 人物 / 設定 (theme + mute + 諦める). Each builds its own overlay lazily on first open.
- **`js/version.js`** — single `VERSION` constant displayed on the title screen.
- **`js/data/scenes.js`** — `scenes` map keyed by scene id, plus an `actions` registry and `runAction(name, state)` dispatcher. Scenes have `text(state)` and `choices(state)` as **functions** so they can react to flags/items.
- **`js/data/endings.js`** — array of `{ id, name, category, check(state), text }`. Order = priority.
- **`js/data/items.js`** — flat `items` map and `getItem(id)` with a fallback shape so missing ids don't crash rendering.
- **`js/data/characters.js`** — `characters` map; `charactersModal.js` shows entries the player has met (gated by `flags`).

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
      hidden: s.flags.alreadyDone,          // also hides
      result: () => `タップ直後に表示する本文` }, // optional; see below
  ],
}
```

- `cost` is integer steps consumed; choices with `state.steps < cost` render disabled (do not gate them with `if`, the renderer handles it).
- `action` must exist as a key in the `actions` registry at the top of `scenes.js`.
- `next: 'sameScene'` re-renders in place after running the action — useful for "examine" choices.
- **`result` field**: when present (typically on stay-in-scene choices), `render.js` enters `renderResultMode` after running the action: it overrides the scene body with the result text and replaces the choice list with a single auto-paginated 「次へ」 / 「続き (n/total)」 button. `result` may return either a single string (one beat) or an array of strings (multiple beats, paginated). After the last beat the player taps 「次へ」 and the scene re-renders normally (so updated `text(state)` and `choices(state)` reflect any flags the action set). Use this to show narrative beats without leaving the scene.
- Hidden params (`bond`, `nihil`, `wrath`, `hope`, `truth`) are set only via `addParam` inside actions; they must remain invisible to the player.
- Action functions receive the state as their argument but in practice mutate the imported `state` singleton from `state.js` via `setFlag` / `addParam` / `addItem`. Don't reassign properties on the argument — use the helpers.

### Ending authoring conventions

Endings are checked top-down by `endings.find(e => e.check(state))`. When adding an ending, place it at the priority position required by `DESIGN.md` §5 — the lonely default must stay last. `check` typically combines a `params.X >= N` threshold with one or more `flags`/`items` requirements.

## Conventions

- Japanese only for all player-facing strings, scene names, and ending text. Code identifiers and comments are a mix; match the surrounding file.
- **Theming**: the app supports light and dark modes via `html[data-theme="dark"|"light"]` data-attribute, with palettes defined as CSS variables in `style.css` (top of file). New CSS should use `var(--bg)` / `var(--fg)` rather than literal colors. Allowed literals are the monochrome set `#0a0a0a` / `#f0f0f0` / `#666` / `#333`, used only when a variable can't apply. **Exception**: `#opening-cinematic` and its descendants are intentionally theme-independent (always dark background `#0a0a0a` + light foreground `#f0f0f0` / `#fff`) — see comment around `style.css` `.cine-narration`. Adding theme-aware vars there would break the cinematic look.
- Tap/click only — no keyboard handlers. Tap targets ≥56px tall (see `.choice-btn`).
- No external assets and no dependencies. All sound is generated at runtime in `audio.js`; no fonts are bundled (system fallbacks via `'Noto Sans JP', 'Hiragino Sans', ...`).
- Mobile-first: layout is centered with `max-width: 480px`, uses `100dvh` and `env(safe-area-inset-*)`. Test changes in a narrow viewport.
- Audio must never play before the first user gesture — `AudioContext.resume()` happens in a one-shot click handler.
- Modals are imported on demand via `import('./xxxModal.js')`; keep them self-contained (own overlay element, own build/teardown) so dynamic loading stays cheap.
