import { endings } from './data/endings.js';
import { unlockEnding } from './storage.js';
import { playMeteorFall } from './audio.js';

// プレビュー閲覧モードか否か。タイトル画面から開いたときは true。
let previewMode = false;

export function isPreviewMode() {
  return previewMode;
}

export function checkEnding(state) {
  const matched = endings.find(e => e.check(state));
  if (matched) showEnding(matched);
}

async function showEnding(ending) {
  previewMode = false;

  // 既存の小刻みな振動を、より重い揺れに差し替える
  const gameScreen = document.getElementById('game-screen');
  const meteorShadow = document.getElementById('meteor-shadow');
  const flash = document.getElementById('impact-flash');

  gameScreen.classList.remove('game-shake');
  gameScreen.classList.add('game-quake');

  meteorShadow.classList.add('meteor-falling');
  playMeteorFall();

  // 落下: 揺れながら影が膨張し続ける (3.0s)
  await sleep(3000);

  // 衝撃: 白フラッシュ → 黒に焼き付け (~1.2s)
  if (flash) flash.classList.add('firing');
  await sleep(1100);

  // 黒の余韻 (0.5s) — 振動だけ止める
  gameScreen.classList.remove('game-quake');
  await sleep(500);

  unlockEnding(ending.id);

  // 黒のままゲーム画面を退場
  gameScreen.style.display = 'none';
  meteorShadow.classList.remove('meteor-falling');
  if (flash) flash.classList.remove('firing');

  paintEnding(ending);
}

// タイトル画面から呼ぶ閲覧モード。隕石演出と保存処理を行わない。
export function previewEnding(ending) {
  previewMode = true;
  document.getElementById('title-screen').style.display = 'none';
  paintEnding(ending);
}

function paintEnding(ending) {
  const endingScreen = document.getElementById('ending-screen');
  endingScreen.style.display = 'flex';

  document.getElementById('ending-category').textContent = ending.category;
  document.getElementById('ending-title').textContent = ending.name;
  document.getElementById('ending-text').textContent = ending.text.trim();
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}
