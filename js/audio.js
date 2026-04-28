let ctx = null;
let windGain = null;
let heartbeatInterval = null;
let muted = false;
let started = false;

function getCtx() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  return ctx;
}

export function initAudio() {
  // 初回タップで resume
  document.addEventListener('click', resumeOnce, { once: true });
}

function resumeOnce() {
  const c = getCtx();
  if (c.state === 'suspended') c.resume();
  if (!started) {
    started = true;
    startWind();
  }
}

// 風音 (ブラウンノイズ + ローパス)
function startWind() {
  if (muted) return;
  const c = getCtx();

  const bufferSize = c.sampleRate * 4;
  const buffer = c.createBuffer(1, bufferSize, c.sampleRate);
  const data = buffer.getChannelData(0);
  let lastOut = 0;
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    lastOut = (lastOut + 0.02 * white) / 1.02;
    data[i] = lastOut * 3.5;
  }

  const source = c.createBufferSource();
  source.buffer = buffer;
  source.loop = true;

  const lpf = c.createBiquadFilter();
  lpf.type = 'lowpass';
  lpf.frequency.value = 400;

  windGain = c.createGain();
  windGain.gain.value = muted ? 0 : 0.05;

  source.connect(lpf);
  lpf.connect(windGain);
  windGain.connect(c.destination);
  source.start();
}

// 鼓動 (残り20歩以下)
export function startHeartbeat(steps) {
  if (steps > 20) {
    stopHeartbeat();
    return;
  }
  if (heartbeatInterval) return;

  const bpm = Math.max(40, 80 - (20 - steps) * 2);
  const interval = (60 / bpm) * 1000;

  heartbeatInterval = setInterval(() => {
    if (!muted) playPulse();
  }, interval);
}

export function stopHeartbeat() {
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
    heartbeatInterval = null;
  }
}

function playPulse() {
  const c = getCtx();
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = 'sine';
  osc.frequency.value = 60;
  gain.gain.setValueAtTime(0.15, c.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.1);
  osc.connect(gain);
  gain.connect(c.destination);
  osc.start();
  osc.stop(c.currentTime + 0.1);
}

// クリック音
export function playClick() {
  if (muted) return;
  const c = getCtx();
  if (c.state === 'suspended') return;

  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = 'square';
  osc.frequency.value = 1000;
  gain.gain.setValueAtTime(0.08, c.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.03);
  osc.connect(gain);
  gain.connect(c.destination);
  osc.start();
  osc.stop(c.currentTime + 0.03);
}

// 隕石落下音
export function playMeteorFall() {
  if (muted) return;
  const c = getCtx();
  if (c.state === 'suspended') return;

  // ホワイトノイズ + ピッチ下降
  const bufferSize = c.sampleRate * 2;
  const buffer = c.createBuffer(1, bufferSize, c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

  const source = c.createBufferSource();
  source.buffer = buffer;

  const osc = c.createOscillator();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(800, c.currentTime);
  osc.frequency.exponentialRampToValueAtTime(80, c.currentTime + 1.8);

  const noiseGain = c.createGain();
  noiseGain.gain.setValueAtTime(0.3, c.currentTime);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 2);

  const oscGain = c.createGain();
  oscGain.gain.setValueAtTime(0.2, c.currentTime);
  oscGain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 1.8);

  source.connect(noiseGain);
  noiseGain.connect(c.destination);
  osc.connect(oscGain);
  oscGain.connect(c.destination);

  source.start();
  osc.start();
  source.stop(c.currentTime + 2);
  osc.stop(c.currentTime + 1.8);
}

export function toggleMute() {
  muted = !muted;
  if (windGain) {
    const c = getCtx();
    windGain.gain.setTargetAtTime(muted ? 0 : 0.05, c.currentTime, 0.1);
  }
  if (muted) stopHeartbeat();
  return muted;
}

export function isMuted() {
  return muted;
}
