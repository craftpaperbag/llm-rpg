import { getItem } from './data/items.js';

let overlayEl = null;
let iconEl = null;
let nameEl = null;
let descEl = null;

function build() {
  if (overlayEl) return;

  overlayEl = document.createElement('div');
  overlayEl.id = 'item-overlay';
  overlayEl.className = 'item-overlay';
  overlayEl.hidden = true;

  const modal = document.createElement('div');
  modal.className = 'item-modal';

  const closeBtn = document.createElement('button');
  closeBtn.className = 'item-close';
  closeBtn.setAttribute('aria-label', '閉じる');
  closeBtn.textContent = '×';
  closeBtn.addEventListener('click', closeItemModal);
  modal.appendChild(closeBtn);

  iconEl = document.createElement('div');
  iconEl.className = 'item-modal-icon';
  modal.appendChild(iconEl);

  nameEl = document.createElement('div');
  nameEl.className = 'item-modal-name';
  modal.appendChild(nameEl);

  descEl = document.createElement('div');
  descEl.className = 'item-modal-desc';
  modal.appendChild(descEl);

  overlayEl.appendChild(modal);

  overlayEl.addEventListener('click', (e) => {
    if (e.target === overlayEl) closeItemModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !overlayEl.hidden) closeItemModal();
  });

  document.body.appendChild(overlayEl);
}

export function openItemModal(id) {
  build();
  const item = getItem(id);
  iconEl.textContent = item.icon;
  nameEl.textContent = item.name;
  descEl.textContent = (item.description || '——').trim();
  overlayEl.hidden = false;
}

export function closeItemModal() {
  if (overlayEl) overlayEl.hidden = true;
}
