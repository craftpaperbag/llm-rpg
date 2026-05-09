import { setTheme, getCurrentTheme } from './theme.js';
import { toggleMute, isMuted } from './audio.js';
import { giveUp } from './render.js';

let overlayEl = null;
let themeSegEl = null;
let muteSegEl = null;
let giveUpRowEl = null;
let giveUpBtnEl = null;
let giveUpArmed = false;
let giveUpResetTimer = null;

function build() {
  if (overlayEl) return;

  overlayEl = document.createElement('div');
  overlayEl.id = 'settings-overlay';
  overlayEl.className = 'item-overlay settings-overlay';
  overlayEl.hidden = true;

  const modal = document.createElement('div');
  modal.className = 'item-modal settings-modal';

  const closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.className = 'item-close';
  closeBtn.setAttribute('aria-label', '閉じる');
  closeBtn.textContent = '×';
  closeBtn.addEventListener('click', closeSettings);
  modal.appendChild(closeBtn);

  const title = document.createElement('div');
  title.className = 'settings-title';
  title.textContent = '設定';
  modal.appendChild(title);

  themeSegEl = buildSegment({
    label: 'テーマ',
    options: [
      { value: 'dark', label: 'ダーク' },
      { value: 'light', label: 'ライト' },
    ],
    onChange: (v) => {
      setTheme(v);
      updateThemeSegment();
    },
  });
  modal.appendChild(themeSegEl.row);

  muteSegEl = buildSegment({
    label: '音声',
    options: [
      { value: 'on', label: 'ON' },
      { value: 'off', label: 'OFF' },
    ],
    onChange: (v) => {
      const currentlyMuted = isMuted();
      const wantMuted = v === 'off';
      if (currentlyMuted !== wantMuted) toggleMute();
      updateMuteSegment();
      syncGameMuteIcon();
    },
  });
  modal.appendChild(muteSegEl.row);

  giveUpRowEl = document.createElement('div');
  giveUpRowEl.className = 'settings-row settings-row-action';

  const giveUpLabel = document.createElement('div');
  giveUpLabel.className = 'settings-row-label';
  giveUpLabel.textContent = '諦める';
  giveUpRowEl.appendChild(giveUpLabel);

  giveUpBtnEl = document.createElement('button');
  giveUpBtnEl.type = 'button';
  giveUpBtnEl.className = 'settings-action-btn';
  giveUpBtnEl.textContent = 'ここで終わる';
  giveUpBtnEl.addEventListener('click', handleGiveUpClick);
  giveUpRowEl.appendChild(giveUpBtnEl);

  modal.appendChild(giveUpRowEl);

  overlayEl.appendChild(modal);

  overlayEl.addEventListener('click', (e) => {
    if (e.target === overlayEl) closeSettings();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !overlayEl.hidden) closeSettings();
  });

  document.body.appendChild(overlayEl);
}

function buildSegment({ label, options, onChange }) {
  const row = document.createElement('div');
  row.className = 'settings-row';

  const labelEl = document.createElement('div');
  labelEl.className = 'settings-row-label';
  labelEl.textContent = label;
  row.appendChild(labelEl);

  const seg = document.createElement('div');
  seg.className = 'settings-segment';
  const buttons = options.map(opt => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'settings-seg-btn';
    b.dataset.value = opt.value;
    b.textContent = opt.label;
    b.addEventListener('click', () => onChange(opt.value));
    seg.appendChild(b);
    return b;
  });
  row.appendChild(seg);

  return { row, buttons };
}

function updateThemeSegment() {
  const cur = getCurrentTheme();
  themeSegEl.buttons.forEach(b => {
    b.classList.toggle('active', b.dataset.value === cur);
  });
}

function updateMuteSegment() {
  const cur = isMuted() ? 'off' : 'on';
  muteSegEl.buttons.forEach(b => {
    b.classList.toggle('active', b.dataset.value === cur);
  });
}

function syncGameMuteIcon() {
  // ゲームヘッダのアイコン表示は使っていないが、過去互換のため:
  const muteBtn = document.getElementById('btn-mute');
  if (muteBtn) {
    const muted = isMuted();
    muteBtn.classList.toggle('muted', muted);
    muteBtn.textContent = muted ? '🔈' : '🔇';
  }
}

function isGameActive() {
  const gameScreen = document.getElementById('game-screen');
  return !!gameScreen && gameScreen.style.display !== 'none';
}

function resetGiveUp() {
  giveUpArmed = false;
  if (giveUpResetTimer) {
    clearTimeout(giveUpResetTimer);
    giveUpResetTimer = null;
  }
  if (giveUpBtnEl) {
    giveUpBtnEl.textContent = 'ここで終わる';
    giveUpBtnEl.classList.remove('armed');
  }
}

function handleGiveUpClick() {
  if (!giveUpArmed) {
    giveUpArmed = true;
    giveUpBtnEl.textContent = 'もう一度押すと確定';
    giveUpBtnEl.classList.add('armed');
    giveUpResetTimer = setTimeout(resetGiveUp, 4000);
    return;
  }
  resetGiveUp();
  closeSettings();
  giveUp();
}

export function openSettings() {
  build();
  updateThemeSegment();
  updateMuteSegment();
  resetGiveUp();
  giveUpRowEl.style.display = isGameActive() ? '' : 'none';
  overlayEl.hidden = false;
}

export function closeSettings() {
  if (overlayEl) overlayEl.hidden = true;
  resetGiveUp();
}
