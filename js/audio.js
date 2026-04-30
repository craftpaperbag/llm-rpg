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

// 隕石落下音 — 重く巨大な多段階演出
export function playMeteorFall() {
  if (muted) return;
  const c = getCtx();
  if (c.state === 'suspended') return;
  const t0 = c.currentTime;

  const masterGain = c.createGain();
  masterGain.gain.value = 0.9;
  masterGain.connect(c.destination);

  // ── Phase 1: 沈み込む地鳴り (0〜3.0s)
  const rumbleBuf = c.createBuffer(1, c.sampleRate * 4, c.sampleRate);
  const rumbleData = rumbleBuf.getChannelData(0);
  let last = 0;
  for (let i = 0; i < rumbleData.length; i++) {
    const w = Math.random() * 2 - 1;
    last = (last + 0.005 * w) / 1.005;
    rumbleData[i] = last * 9;
  }
  const rumbleSrc = c.createBufferSource();
  rumbleSrc.buffer = rumbleBuf;
  rumbleSrc.loop = true;
  const rumbleLPF = c.createBiquadFilter();
  rumbleLPF.type = 'lowpass';
  rumbleLPF.frequency.value = 90;
  const rumbleGain = c.createGain();
  rumbleGain.gain.setValueAtTime(0.02, t0);
  rumbleGain.gain.exponentialRampToValueAtTime(0.7, t0 + 2.9);
  rumbleGain.gain.setValueAtTime(0.7, t0 + 3.0);
  rumbleGain.gain.exponentialRampToValueAtTime(0.001, t0 + 4.6);
  rumbleSrc.connect(rumbleLPF);
  rumbleLPF.connect(rumbleGain);
  rumbleGain.connect(masterGain);
  rumbleSrc.start(t0);
  rumbleSrc.stop(t0 + 4.7);

  // ── Phase 2: 落下する咆哮 (sawtooth 1500→30Hz, 0〜3.0s)
  const howl = c.createOscillator();
  howl.type = 'sawtooth';
  howl.frequency.setValueAtTime(1500, t0);
  howl.frequency.exponentialRampToValueAtTime(60, t0 + 2.9);
  const howlGain = c.createGain();
  howlGain.gain.setValueAtTime(0.04, t0);
  howlGain.gain.linearRampToValueAtTime(0.32, t0 + 1.8);
  howlGain.gain.exponentialRampToValueAtTime(0.001, t0 + 3.0);
  howl.connect(howlGain);
  howlGain.connect(masterGain);
  howl.start(t0);
  howl.stop(t0 + 3.05);

  // ── Phase 2b: 高域シャー (空気を裂く高音、0.8〜2.8s)
  const screechBuf = c.createBuffer(1, c.sampleRate * 2.2, c.sampleRate);
  const screechData = screechBuf.getChannelData(0);
  for (let i = 0; i < screechData.length; i++) screechData[i] = Math.random() * 2 - 1;
  const screechSrc = c.createBufferSource();
  screechSrc.buffer = screechBuf;
  const screechBPF = c.createBiquadFilter();
  screechBPF.type = 'bandpass';
  screechBPF.frequency.setValueAtTime(2200, t0 + 0.8);
  screechBPF.frequency.exponentialRampToValueAtTime(600, t0 + 2.9);
  screechBPF.Q.value = 0.7;
  const screechGain = c.createGain();
  screechGain.gain.setValueAtTime(0, t0);
  screechGain.gain.linearRampToValueAtTime(0.18, t0 + 1.6);
  screechGain.gain.exponentialRampToValueAtTime(0.001, t0 + 3.0);
  screechSrc.connect(screechBPF);
  screechBPF.connect(screechGain);
  screechGain.connect(masterGain);
  screechSrc.start(t0 + 0.8);
  screechSrc.stop(t0 + 3.05);

  // ── Phase 3: 衝突の重低音 (sub-bass, 3.0〜4.5s)
  const boom = c.createOscillator();
  boom.type = 'sine';
  boom.frequency.setValueAtTime(55, t0 + 2.95);
  boom.frequency.exponentialRampToValueAtTime(18, t0 + 4.4);
  const boomGain = c.createGain();
  boomGain.gain.setValueAtTime(0, t0 + 2.95);
  boomGain.gain.linearRampToValueAtTime(0.95, t0 + 3.02);
  boomGain.gain.exponentialRampToValueAtTime(0.001, t0 + 4.5);
  boom.connect(boomGain);
  boomGain.connect(masterGain);
  boom.start(t0 + 2.95);
  boom.stop(t0 + 4.55);

  // ── Phase 3b: 衝撃ノイズバースト (3.0〜4.6s)
  const burstBuf = c.createBuffer(1, c.sampleRate * 1.8, c.sampleRate);
  const burstData = burstBuf.getChannelData(0);
  for (let i = 0; i < burstData.length; i++) {
    const decay = 1 - (i / burstData.length);
    burstData[i] = (Math.random() * 2 - 1) * decay * decay;
  }
  const burstSrc = c.createBufferSource();
  burstSrc.buffer = burstBuf;
  const burstLPF = c.createBiquadFilter();
  burstLPF.type = 'lowpass';
  burstLPF.frequency.value = 320;
  const burstGain = c.createGain();
  burstGain.gain.setValueAtTime(0, t0 + 2.95);
  burstGain.gain.linearRampToValueAtTime(0.85, t0 + 3.04);
  burstGain.gain.exponentialRampToValueAtTime(0.001, t0 + 4.6);
  burstSrc.connect(burstLPF);
  burstLPF.connect(burstGain);
  burstGain.connect(masterGain);
  burstSrc.start(t0 + 2.95);
  burstSrc.stop(t0 + 4.65);

  // ── Phase 4: 余韻のサブハム (3.5〜5.0s)
  const tail = c.createOscillator();
  tail.type = 'sine';
  tail.frequency.value = 22;
  const tailGain = c.createGain();
  tailGain.gain.setValueAtTime(0, t0 + 3.5);
  tailGain.gain.linearRampToValueAtTime(0.35, t0 + 3.7);
  tailGain.gain.exponentialRampToValueAtTime(0.001, t0 + 5.0);
  tail.connect(tailGain);
  tailGain.connect(masterGain);
  tail.start(t0 + 3.5);
  tail.stop(t0 + 5.05);
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
