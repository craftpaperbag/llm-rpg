import { state, markVisited } from './state.js';
import { scenes, runAction } from './data/scenes.js';
import { getItem } from './data/items.js';
import { checkEnding } from './ending.js';
import { playClick } from './audio.js';
import { saveGame } from './storage.js';

const elStepsCount = document.getElementById('steps-count');
const elStepsFill  = document.getElementById('steps-fill');
const elSceneFade  = document.getElementById('scene-fade');
const elSceneName  = document.getElementById('scene-name');
const elSceneText  = document.getElementById('scene-text');
const elChoices    = document.getElementById('choices-area');
const elItemsScroll= document.getElementById('items-scroll');

export function renderAll() {
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

    const btn = document.createElement('button');
    btn.className = 'choice-btn';
    btn.disabled = state.steps < choice.cost;

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
    const chip = document.createElement('span');
    chip.className = 'item-chip';
    chip.textContent = `${item.icon} ${item.name}`;
    elItemsScroll.appendChild(chip);
  });
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

  // 歩数消費
  state.steps = Math.max(0, state.steps - choice.cost);

  // アクション実行
  if (choice.action) runAction(choice.action, state);

  // 訪問記録
  if (choice.next) markVisited(choice.next);

  // オートセーブ
  saveGame(state);

  // エンディング判定
  if (state.steps <= 0) {
    await fadeTransition();
    checkEnding(state);
    return;
  }

  // 次シーン判定
  if (choice.next && choice.next !== state.currentScene) {
    await fadeTransition();
    state.currentScene = choice.next;
    markVisited(choice.next);
  }

  renderAll();
}

async function fadeTransition() {
  elSceneFade.classList.add('fading');
  await sleep(200);
  elSceneFade.classList.remove('fading');
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}
