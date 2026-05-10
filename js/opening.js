// オープニング・シネマティック制御
// ・暗黒の空に隕石がゆっくり巨大化していく18秒の演出
// ・3〜4行のナレーションを順次タイプライター表示（最終行は余韻フェードアウトに残す）
// ・ナレーション完了後、隕石とナレーションを共にゆっくりフェードアウトして余韻を残す
// ・画面/スキップボタンのタップで早期終了 → Promise resolve

const NARRATION = [
  '──西暦2026年、5月。',
  '空に新しい星が、ひとつ。',
  'その星は、毎日少しずつ、大きくなった。',
  'そして今夜、空が落ちてくる。',
];

const SAFETY_TIMEOUT_MS = 22000;
const FINAL_FADE_MS = 1500;

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
      meteor.style.transform = '';
      meteor.style.opacity = '';
      root.classList.remove('cine-visible');
      root.classList.remove('cine-fading-out');
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

    runNarration(narrEl, NARRATION, () => cancelNarration).then(async () => {
      // ナレーション最終行が画面に残っている状態 → 余韻を経て隕石とともにフェードアウト
      if (cancelNarration) return;
      await sleep(600);
      if (cancelNarration) return;
      // 隕石アニメを停止しつつ現在の transform/opacity をインラインに固定
      const cs = window.getComputedStyle(meteor);
      meteor.style.transform = cs.transform;
      meteor.style.opacity = cs.opacity;
      meteor.classList.remove('cine-falling');
      void meteor.offsetWidth;
      root.classList.add('cine-fading-out');
      timers.push(setTimeout(finish, FINAL_FADE_MS));
    });

    // 安全弁: 最大22秒で必ず終了
    timers.push(setTimeout(finish, SAFETY_TIMEOUT_MS));
  });
}

async function runNarration(container, lines, isCancelled) {
  for (let i = 0; i < lines.length; i++) {
    if (isCancelled()) return;
    const line = lines[i];
    const isLast = (i === lines.length - 1);
    const el = document.createElement('div');
    el.className = 'cine-line';
    container.appendChild(el);
    await typewriter(el, line, 70, isCancelled);
    if (isCancelled()) return;
    if (isLast) return; // 最終行は余韻フェードアウトで消すため残す
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
