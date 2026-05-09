import { state } from './state.js';
import { getItem } from './data/items.js';
import { playClick } from './audio.js';

let overlayEl = null;
let bodyEl = null;

function build() {
  if (overlayEl) return;

  overlayEl = document.createElement('div');
  overlayEl.id = 'inventory-overlay';
  overlayEl.className = 'item-overlay';
  overlayEl.hidden = true;

  const modal = document.createElement('div');
  modal.className = 'item-modal';

  const closeBtn = document.createElement('button');
  closeBtn.className = 'item-close';
  closeBtn.type = 'button';
  closeBtn.setAttribute('aria-label', '閉じる');
  closeBtn.textContent = '×';
  closeBtn.addEventListener('click', () => {
    playClick();
    closeInventory();
  });
  modal.appendChild(closeBtn);

  bodyEl = document.createElement('div');
  modal.appendChild(bodyEl);

  overlayEl.appendChild(modal);

  overlayEl.addEventListener('click', (e) => {
    if (e.target === overlayEl) closeInventory();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !overlayEl.hidden) closeInventory();
  });

  document.body.appendChild(overlayEl);
}

function renderList() {
  bodyEl.innerHTML = '';

  const title = document.createElement('div');
  title.className = 'item-modal-title';
  title.textContent = '持ち物';
  bodyEl.appendChild(title);

  if (state.items.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'item-modal-empty';
    empty.textContent = '所持品なし';
    bodyEl.appendChild(empty);
    return;
  }

  const list = document.createElement('div');
  list.className = 'item-modal-list';

  state.items.forEach((id) => {
    const item = getItem(id);
    const row = document.createElement('button');
    row.className = 'item-modal-row';
    row.type = 'button';
    row.setAttribute('aria-label', `${item.name}の詳細を見る`);

    const icon = document.createElement('span');
    icon.className = 'item-modal-row-icon';
    icon.textContent = item.icon;

    const name = document.createElement('span');
    name.className = 'item-modal-row-name';
    name.textContent = item.name;

    const arrow = document.createElement('span');
    arrow.className = 'item-modal-row-arrow';
    arrow.textContent = '›';

    row.appendChild(icon);
    row.appendChild(name);
    row.appendChild(arrow);

    row.addEventListener('click', () => {
      playClick();
      renderDetail(id);
    });

    list.appendChild(row);
  });

  bodyEl.appendChild(list);
}

function renderDetail(id) {
  bodyEl.innerHTML = '';
  const item = getItem(id);

  const back = document.createElement('button');
  back.className = 'item-modal-back';
  back.type = 'button';
  back.textContent = '← 戻る';
  back.addEventListener('click', () => {
    playClick();
    renderList();
  });
  bodyEl.appendChild(back);

  const icon = document.createElement('div');
  icon.className = 'item-modal-icon';
  icon.textContent = item.icon;
  bodyEl.appendChild(icon);

  const name = document.createElement('div');
  name.className = 'item-modal-name';
  name.textContent = item.name;
  bodyEl.appendChild(name);

  const desc = document.createElement('div');
  desc.className = 'item-modal-desc';
  desc.textContent = (item.description || '——').trim();
  bodyEl.appendChild(desc);
}

export function openInventory() {
  build();
  renderList();
  overlayEl.hidden = false;
}

export function closeInventory() {
  if (overlayEl) overlayEl.hidden = true;
}
