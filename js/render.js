import { state, markVisited } from './state.js';
import { scenes, runAction } from './data/scenes.js';
import { getItem } from './data/items.js';
import { checkEnding } from './ending.js';
import { playClick } from './audio.js';
import { saveGame } from './storage.js';
import { openItemModal } from './itemModal.js';

const elStepsCount = document.getElementById('steps-count');
const elStepsFill  = document.getElementById('steps-fill');
const elSceneFade  = document.getElementById('scene-fade');
const elSceneName  = document.getElementById('scene-name');
const elSceneText  = document.getElementById('scene-text');
const elChoices    = document.getElementById('choices-area');
const elItemsScroll= document.getElementById('items-scroll');
const elToastArea  = document.getElementById('item-toast-area');

let typewriterId = 0;
let uiMode = 'normal'; // 'normal' | 'result'

export function renderAll() {
  uiMode = 'normal';
  renderHeader();
  renderScene();
  renderItems();
  applyEffects();
}

function renderHeader() {
  const pct = (state.steps / 100) * 100;
  elStepsCount.textContent = state.steps;
  elStepsFill.style.width = pct + '%';

  if (state.steps <= 20) {
    elStepsCount.classList.add('steps-warning');
  } else {
    elStepsCount.classList.remove('steps-warning');
  }
}

function renderScene() {
  const scene = scenes[state.currentScene];
  if (!scene) return;

  elSceneName.textContent = `[${scene.name}]`;
  elSceneText.textContent = scene.text(state).trim();

  renderChoices(scene);
}

function renderChoices(scene) {
  elChoices.innerHTML = '';
  const choices = scene.choices(state);

  choices.forEach((choice) => {
    if (choice.hidden) return;
    if (choice.if && !choice.if(state)) return;

    const isMovement = !!(choice.next && choice.next !== scene.id);

    const btn = document.createElement('button');
    btn.className = 'choice-btn ' + (isMovement ? 'choice-move' : 'choice-stay');
    btn.disabled = state.steps <= 0 || state.steps < choice.cost;

    const labelEl = document.createElement('span');
    labelEl.className = 'choice-label';
    labelEl.textContent = choice.label;

    const costEl = document.createElement('span');
    costEl.className = 'choice-cost';
    costEl.textContent = `-${choice.cost}歩`;

    btn.appendChild(labelEl);
    btn.appendChild(costEl);

    btn.addEventListener('click', () => handleChoice(choice));
    elChoices.appendChild(btn);
  });
}

function renderResultMode(beats) {
  uiMode = 'result';
  const pages = Array.isArray(beats) ? beats : [beats];
  const total = pages.length;

  return showBeat(0);

  async function showBeat(idx) {
    elChoices.innerHTML = '';
    elChoices.scrollTop = 0;

    const btn = document.createElement('button');
    btn.className = 'choice-btn next-btn';
    const labelEl = document.createElement('span');
    labelEl.className = 'choice-label';

    const isLast = idx === total - 1;
    if (total > 1) {
      labelEl.textContent = isLast ? `次へ (${idx + 1}/${total})` : `続き (${idx + 1}/${total})`;
    } else {
      labelEl.textContent = '次へ';
    }
    btn.appendChild(labelEl);

    btn.addEventListener('click', async () => {
      playClick();
      if (!isLast) {
        await showBeat(idx + 1);
        return;
      }
      uiMode = 'normal';
      const scene = scenes[state.currentScene];
      if (scene) {
        renderChoices(scene);
        await typewriterText(elSceneText, scene.text(state).trim());
      }
    });

    elChoices.appendChild(btn);
    await typewriterText(elSceneText, String(pages[idx]).trim());
  }
}

function renderItems() {
  elItemsScroll.innerHTML = '';
  if (state.items.length === 0) {
    const empty = document.createElement('span');
    empty.className = 'items-empty';
    empty.textContent = '所持品なし';
    elItemsScroll.appendChild(empty);
    return;
  }
  state.items.forEach(id => {
    const item = getItem(id);
    const chip = document.createElement('button');
    chip.className = 'item-chip';
    chip.type = 'button';
    chip.setAttribute('aria-label', `${item.name}の詳細を見る`);
    chip.textContent = `${item.icon} ${item.name}`;
    chip.addEventListener('click', () => {
      playClick();
      openItemModal(id);
    });
    elItemsScroll.appendChild(chip);
  });
}

function showItemToast(id) {
  const item = getItem(id);
  const toast = document.createElement('div');
  toast.className = 'item-toast';
  toast.setAttribute('role', 'status');

  const label = document.createElement('span');
  label.className = 'item-toast-label';
  label.textContent = '入手';

  const body = document.createElement('span');
  body.className = 'item-toast-body';
  body.textContent = `${item.icon} ${item.name}`;

  toast.appendChild(label);
  toast.appendChild(body);
  elToastArea.appendChild(toast);

  // フェードイン
  requestAnimationFrame(() => toast.classList.add('show'));

  // 自動消去
  setTimeout(() => {
    toast.classList.remove('show');
    toast.classList.add('hide');
    setTimeout(() => toast.remove(), 400);
  }, 2200);
}

function applyEffects() {
  // 隕石の影を拡大
  const meteorShadow = document.getElementById('meteor-shadow');
  const ratio = 1 - (state.steps / 100);
  const scale = 1 + ratio * 5;
  meteorShadow.style.transform = `scale(${scale})`;

  // ノイズオーバーレイ
  const noise = document.getElementById('noise-overlay');
  if (state.steps <= 20) {
    noise.classList.add('active');
  } else {
    noise.classList.remove('active');
  }

  // 振動
  const gameScreen = document.getElementById('game-screen');
  if (state.steps <= 10) {
    gameScreen.classList.add('game-shake');
  } else {
    gameScreen.classList.remove('game-shake');
  }
}

async function handleChoice(choice) {
  playClick();

  // 連打・歩数尽き後の誤発火を防ぐためにこの瞬間で選択肢を全部ロック
  lockChoices();

  const isMovement = !!(choice.next && choice.next !== state.currentScene);

  // 歩数消費
  state.steps = Math.max(0, state.steps - choice.cost);

  // アクション実行 (新規アイテム検出のため前後で差分を取る)
  const before = new Set(state.items);
  if (choice.action) runAction(choice.action, state);
  const newItems = state.items.filter(id => !before.has(id));

  // 訪問記録
  if (choice.next) markVisited(choice.next);

  // オートセーブ
  saveGame(state);

  // アイテム取得トースト
  newItems.forEach(showItemToast);

  // エンディング判定
  if (state.steps <= 0) {
    await fadeTransition();
    checkEnding(state);
    return;
  }

  // 移動分岐
  if (isMovement) {
    await fadeTransition();
    state.currentScene = choice.next;
    markVisited(choice.next);

    renderHeader();
    renderItems();
    applyEffects();

    const scene = scenes[state.currentScene];
    if (scene) {
      elSceneName.textContent = `[${scene.name}]`;
      elChoices.scrollTop = 0;
      renderChoices(scene);
      await typewriterText(elSceneText, scene.text(state).trim());
    }
    return;
  }

  // 滞在分岐: リザルトモード
  renderHeader();
  renderItems();
  applyEffects();

  const scene = scenes[state.currentScene];
  if (!scene) return;

  elSceneName.textContent = `[${scene.name}]`;
  const resultPayload = choice.result ? choice.result(state) : scene.text(state);
  await renderResultMode(resultPayload);
}

async function typewriterText(el, text, speed = 22) {
  const myId = ++typewriterId;
  el.textContent = '';
  elSceneFade.scrollTop = 0;
  for (const char of text) {
    if (typewriterId !== myId) return;
    el.textContent += char;
    if (char !== '\n' && char !== ' ') await sleep(speed);
  }
}

async function fadeTransition() {
  elSceneFade.classList.add('fading');
  await sleep(200);
  elSceneFade.classList.remove('fading');
}

function lockChoices() {
  elChoices.querySelectorAll('button').forEach(b => { b.disabled = true; });
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}
