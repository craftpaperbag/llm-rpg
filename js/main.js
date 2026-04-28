import { state, resetState, loadState, markVisited } from './state.js';
import { renderAll } from './render.js';
import { initAudio, toggleMute, isMuted, startHeartbeat } from './audio.js';
import { hasSave, loadGame, clearSave, getUnlockedEndings } from './storage.js';
import { endings } from './data/endings.js';

// ─── 初期化 ─────────────────────────────────────────
initAudio();
setupTitleScreen();

// ─── タイトル画面セットアップ ─────────────────────────
function setupTitleScreen() {
  const hasSaved = hasSave();

  const btnContinue = document.getElementById('btn-continue');
  if (hasSaved) btnContinue.style.display = '';

  const unlocked = getUnlockedEndings();
  if (unlocked.length > 0) {
    const endingsSection = document.getElementById('unlocked-endings');
    endingsSection.style.display = '';
    const grid = document.getElementById('endings-grid');
    unlocked.forEach(id => {
      const ending = endings.find(e => e.id === id);
      if (!ending) return;
      const badge = document.createElement('span');
      badge.className = 'ending-badge';
      badge.textContent = ending.name;
      grid.appendChild(badge);
    });
  }

  document.getElementById('btn-new-game').addEventListener('click', () => {
    resetState();
    markVisited('apartment');
    startGame();
  });

  btnContinue.addEventListener('click', () => {
    const saved = loadGame();
    if (saved) {
      loadState(saved);
      startGame();
    }
  });

  document.getElementById('btn-back-title').addEventListener('click', () => {
    clearSave();
    location.reload();
  });
}

// ─── ゲーム開始 ─────────────────────────────────────
function startGame() {
  document.getElementById('title-screen').style.display = 'none';
  document.getElementById('game-screen').style.display = 'flex';

  // ミュートボタン
  const muteBtn = document.getElementById('btn-mute');
  muteBtn.addEventListener('click', () => {
    const muted = toggleMute();
    muteBtn.classList.toggle('muted', muted);
    muteBtn.textContent = muted ? '🔈' : '🔇';
  });

  // 歩数監視 (鼓動エフェクト)
  setInterval(() => {
    startHeartbeat(state.steps);
  }, 2000);

  renderAll();
}
