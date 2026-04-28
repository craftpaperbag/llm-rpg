import { endings } from './data/endings.js';
import { unlockEnding } from './storage.js';
import { playMeteorFall } from './audio.js';

export function checkEnding(state) {
  const matched = endings.find(e => e.check(state));
  if (matched) showEnding(matched);
}

async function showEnding(ending) {
  // 隕石落下演出
  const meteorShadow = document.getElementById('meteor-shadow');
  meteorShadow.classList.add('meteor-falling');
  playMeteorFall();

  await sleep(1800);

  unlockEnding(ending.id);

  document.getElementById('game-screen').style.display = 'none';
  meteorShadow.classList.remove('meteor-falling');

  const endingScreen = document.getElementById('ending-screen');
  endingScreen.style.display = 'flex';

  document.getElementById('ending-category').textContent = ending.category;
  document.getElementById('ending-title').textContent = ending.name;
  document.getElementById('ending-text').textContent = ending.text.trim();
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}
