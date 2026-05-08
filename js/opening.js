// オープニング・シネマティック制御
// ・暗黒の空に隕石がゆっくり巨大化していく13秒の演出
// ・3〜4行のナレーションを順次タイプライター表示
// ・画面/スキップボタンのタップで早期終了 → Promise resolve

const NARRATION = [
  '──西暦2026年、5月。',
  '空に新しい星が、ひとつ。',
  'その星は、毎日少しずつ、大きくなった。',
  'そして今夜、空が落ちてくる。',
];

const SAFETY_TIMEOUT_MS = 16000;

export function playOpeningCinematic() {
  return new Promise(resolve => {
    const root = document.getElementById('opening-cinematic');
    const meteor = root.querySelector('.cine-meteor');
    const narrEl = document.getElementById('cine-narration');
    const skipBtn = document.getElementById('cine-skip');

    root.style.display = 'flex';
    root.setAttribute('aria-hidden', 'false');
    narrEl.innerHTML = '';

    // ルート全体のフェードイン: 一度クラスを外してからリフロー → クラス付与で transition を再発火
    root.classList.remove('cine-visible');
    meteor.classList.remove('cine-falling');
    void meteor.offsetWidth;
    root.classList.add('cine-visible');
    meteor.classList.add('cine-falling');

    const timers = [];
    let done = false;
    let cancelNarration = false;

    const finish = () => {
      if (done) return;
      done = true;
      cancelNarration = true;
      timers.forEach(clearTimeout);
      meteor.classList.remove('cine-falling');
      root.classList.remove('cine-visible');
      root.style.display = 'none';
      root.setAttribute('aria-hidden', 'true');
      narrEl.innerHTML = '';
      root.removeEventListener('click', onTap);
      skipBtn.removeEventListener('click', onSkip);
      resolve();
    };

    const onTap = () => finish();
    const onSkip = (e) => {
      e.stopPropagation();
      finish();
    };

    root.addEventListener('click', onTap);
    skipBtn.addEventListener('click', onSkip);

    runNarration(narrEl, NARRATION, () => cancelNarration).then(() => {
      // ナレーション完了後、隕石アニメ完走を少し待って自動終了
      timers.push(setTimeout(finish, 1500));
    });

    // 安全弁: 最大16秒で必ず終了
    timers.push(setTimeout(finish, SAFETY_TIMEOUT_MS));
  });
}

async function runNarration(container, lines, isCancelled) {
  for (const line of lines) {
    if (isCancelled()) return;
    const el = document.createElement('div');
    el.className = 'cine-line';
    container.appendChild(el);
    await typewriter(el, line, 70, isCancelled);
    if (isCancelled()) return;
    await sleep(1400);
    if (isCancelled()) return;
    el.classList.add('fade-out');
    await sleep(600);
    if (isCancelled()) return;
    el.remove();
  }
}

async function typewriter(el, text, speed, isCancelled) {
  el.textContent = '';
  for (const c of text) {
    if (isCancelled()) return;
    el.textContent += c;
    if (c !== '\n' && c !== ' ') await sleep(speed);
  }
}

const sleep = ms => new Promise(r => setTimeout(r, ms));
