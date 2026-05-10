import { state, resetState, loadState, markVisited } from './state.js';
import { renderAll } from './render.js';
import { initAudio, startHeartbeat } from './audio.js';
import { hasSave, loadGame, clearSave, getUnlockedEndings } from './storage.js';
import { endings } from './data/endings.js';
import { previewEnding, isPreviewMode } from './ending.js';
import { VERSION } from './version.js';
import { initTheme } from './theme.js';

// ─── 初期化 ─────────────────────────────────────────
initTheme();
document.getElementById('version-display').textContent = VERSION;
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
    endingsSection.querySelector('.endings-label').textContent =
      `解放済みエンディング ${unlocked.length} / ${endings.length}`;
    const grid = document.getElementById('endings-grid');
    grid.innerHTML = '';
    unlocked.forEach(id => {
      const ending = endings.find(e => e.id === id);
      if (!ending) return;
      const badge = document.createElement('button');
      badge.type = 'button';
      badge.className = 'ending-badge';
      badge.textContent = ending.name;
      badge.setAttribute('aria-label', `${ending.name}のテキストを読み返す`);
      badge.addEventListener('click', () => previewEnding(ending));
      grid.appendChild(badge);
    });
  }

  document.getElementById('btn-new-game').addEventListener('click', async () => {
    resetState();
    markVisited('opening');
    document.getElementById('title-screen').style.display = 'none';
    const { playOpeningCinematic } = await import('./opening.js');
    await playOpeningCinematic();
    startGame({ typewriter: true, fadeIn: true, typewriterDelay: 1200 + 1500 });
  });

  btnContinue.addEventListener('click', () => {
    const saved = loadGame();
    if (saved) {
      loadState(saved);
      startGame();
    }
  });

  document.getElementById('btn-back-title').addEventListener('click', () => {
    if (isPreviewMode()) {
      // 閲覧モード: セーブを残したままタイトルへ戻る
      document.getElementById('ending-screen').style.display = 'none';
      document.getElementById('title-screen').style.display = '';
      return;
    }
    clearSave();
    location.reload();
  });

  document.getElementById('btn-title-settings').addEventListener('click', () => {
    import('./settingsModal.js').then(m => m.openSettings());
  });

  document.getElementById('btn-about').addEventListener('click', () => {
    import('./aboutModal.js').then(m => m.openAbout());
  });
}

// ─── ゲーム開始 ─────────────────────────────────────
function startGame({ typewriter = false, fadeIn = false, typewriterDelay = 0 } = {}) {
  document.getElementById('title-screen').style.display = 'none';
  const gameScreen = document.getElementById('game-screen');
  gameScreen.style.display = 'flex';
  if (fadeIn) {
    gameScreen.classList.remove('screen-fade-in');
    void gameScreen.offsetWidth;
    gameScreen.classList.add('screen-fade-in');
  }

  // 設定ボタン (テーマ・音声トグル)
  document.getElementById('btn-settings').addEventListener('click', () => {
    import('./settingsModal.js').then(m => m.openSettings());
  });

  // マップボタン
  document.getElementById('btn-map').addEventListener('click', () => {
    import('./map.js').then(m => m.openMap());
  });

  // 持ち物ボタン
  document.getElementById('btn-inventory').addEventListener('click', () => {
    import('./inventoryModal.js').then(m => m.openInventory());
  });

  // 人物ボタン
  document.getElementById('btn-characters').addEventListener('click', () => {
    import('./charactersModal.js').then(m => m.openCharacters());
  });

  // 歩数監視 (鼓動エフェクト)
  setInterval(() => {
    startHeartbeat(state.steps);
  }, 2000);

  renderAll({ typewriter, typewriterDelay });
}
