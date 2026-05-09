let overlayEl = null;

const GITHUB_URL = 'https://github.com/craftpaperbag/llm-rpg';

function build() {
  if (overlayEl) return;

  overlayEl = document.createElement('div');
  overlayEl.id = 'about-overlay';
  overlayEl.className = 'item-overlay about-overlay';
  overlayEl.hidden = true;

  const modal = document.createElement('div');
  modal.className = 'item-modal about-modal';

  const closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.className = 'item-close';
  closeBtn.setAttribute('aria-label', '閉じる');
  closeBtn.textContent = '×';
  closeBtn.addEventListener('click', closeAbout);
  modal.appendChild(closeBtn);

  const title = document.createElement('div');
  title.className = 'about-title';
  title.textContent = '作品について';
  modal.appendChild(title);

  const body = document.createElement('div');
  body.className = 'about-body';
  body.appendChild(makeParagraph('本作は、すべて AI コーディングツールへの指示のみで作られた実験的な作品です。コードの一行も人手では書かれていません。'));
  body.appendChild(makeParagraph('ソースコードは GitHub で公開しています。'));

  const linkWrap = document.createElement('div');
  linkWrap.className = 'about-link-wrap';
  const link = document.createElement('a');
  link.className = 'about-link';
  link.href = GITHUB_URL;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.textContent = GITHUB_URL.replace(/^https?:\/\//, '');
  linkWrap.appendChild(link);
  body.appendChild(linkWrap);

  modal.appendChild(body);
  overlayEl.appendChild(modal);

  overlayEl.addEventListener('click', (e) => {
    if (e.target === overlayEl) closeAbout();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !overlayEl.hidden) closeAbout();
  });

  document.body.appendChild(overlayEl);
}

function makeParagraph(text) {
  const p = document.createElement('p');
  p.className = 'about-paragraph';
  p.textContent = text;
  return p;
}

export function openAbout() {
  build();
  overlayEl.hidden = false;
}

export function closeAbout() {
  if (overlayEl) overlayEl.hidden = true;
}
