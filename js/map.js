import { state } from './state.js';
import { scenes } from './data/scenes.js';

// 各シーンの座標 (viewBox 0-100)
const positions = {
  apartment:         { x: 50, y: 78 },
  apartment_balcony: { x: 32, y: 88 },
  parents:           { x: 50, y: 94 },
  convenience:       { x: 28, y: 60 },
  station:           { x: 50, y: 50 },
  school:            { x: 70, y: 30 },
  office:            { x: 84, y: 50 },
  rooftop:           { x: 92, y: 30 },
  hospital:          { x: 84, y: 72 },
  shrine:            { x: 32, y: 30 },
  riverbed:          { x: 12, y: 70 },
};

const SVG_NS = 'http://www.w3.org/2000/svg';

let edges = null;
let overlayEl = null;
let svgEl = null;

function buildEdges() {
  const stub = { flags: {}, items: [], params: {}, steps: 100, currentScene: '', visited: [] };
  const set = new Set();
  for (const id of Object.keys(scenes)) {
    const scene = scenes[id];
    let list;
    try {
      list = scene.choices(stub);
    } catch (e) {
      list = [];
    }
    for (const c of list) {
      if (c && c.next && c.next !== id) {
        const a = id < c.next ? id : c.next;
        const b = id < c.next ? c.next : id;
        set.add(a + '||' + b);
      }
    }
  }
  return [...set].map(s => s.split('||'));
}

function buildOverlay() {
  if (overlayEl) return;
  edges = buildEdges();

  overlayEl = document.createElement('div');
  overlayEl.id = 'map-overlay';
  overlayEl.className = 'map-overlay';
  overlayEl.hidden = true;

  const modal = document.createElement('div');
  modal.className = 'map-modal';

  const closeBtn = document.createElement('button');
  closeBtn.className = 'map-close';
  closeBtn.setAttribute('aria-label', '閉じる');
  closeBtn.textContent = '×';
  closeBtn.addEventListener('click', closeMap);
  modal.appendChild(closeBtn);

  const title = document.createElement('div');
  title.className = 'map-title';
  title.textContent = 'マップ';
  modal.appendChild(title);

  svgEl = document.createElementNS(SVG_NS, 'svg');
  svgEl.classList.add('map-svg');
  svgEl.setAttribute('viewBox', '0 0 100 100');
  svgEl.setAttribute('preserveAspectRatio', 'xMidYMid meet');
  modal.appendChild(svgEl);

  overlayEl.appendChild(modal);

  // 背景クリックで閉じる
  overlayEl.addEventListener('click', (e) => {
    if (e.target === overlayEl) closeMap();
  });

  document.getElementById('game-screen').appendChild(overlayEl);

  // Escキーで閉じる
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !overlayEl.hidden) closeMap();
  });
}

function repaintSvg() {
  while (svgEl.firstChild) svgEl.removeChild(svgEl.firstChild);

  const visited = new Set(state.visited);
  if (state.currentScene) visited.add(state.currentScene);

  // 表示集合: 訪問済み + そこから1ホップ先の未訪問
  const visible = new Set(visited);
  for (const [a, b] of edges) {
    if (visited.has(a) && !visited.has(b)) visible.add(b);
    if (visited.has(b) && !visited.has(a)) visible.add(a);
  }

  // 辺(両端が visible なもののみ)
  for (const [a, b] of edges) {
    if (!visible.has(a) || !visible.has(b)) continue;
    const pa = positions[a], pb = positions[b];
    if (!pa || !pb) continue;
    const line = document.createElementNS(SVG_NS, 'line');
    line.setAttribute('x1', pa.x);
    line.setAttribute('y1', pa.y);
    line.setAttribute('x2', pb.x);
    line.setAttribute('y2', pb.y);
    // 未訪問への接続は破線
    if (!visited.has(a) || !visited.has(b)) {
      line.setAttribute('stroke-dasharray', '1.5 1.5');
    }
    svgEl.appendChild(line);
  }

  // ノード
  for (const id of visible) {
    const pos = positions[id];
    if (!pos) continue;
    const isVisited = visited.has(id);
    const isCurrent = id === state.currentScene;

    const circle = document.createElementNS(SVG_NS, 'circle');
    circle.setAttribute('cx', pos.x);
    circle.setAttribute('cy', pos.y);
    circle.setAttribute('r', '3');
    circle.classList.add('node');
    if (!isVisited) circle.classList.add('node-unvisited');
    svgEl.appendChild(circle);

    if (isCurrent) {
      const ring = document.createElementNS(SVG_NS, 'circle');
      ring.setAttribute('cx', pos.x);
      ring.setAttribute('cy', pos.y);
      ring.setAttribute('r', '4.5');
      ring.classList.add('node-current');
      svgEl.appendChild(ring);
    }

    const label = document.createElementNS(SVG_NS, 'text');
    label.setAttribute('x', pos.x);
    label.setAttribute('y', pos.y - 5);
    label.classList.add(isVisited ? 'label-visited' : 'label-unvisited');
    label.textContent = isVisited ? (scenes[id]?.name || id) : '?';
    svgEl.appendChild(label);
  }
}

export function openMap() {
  buildOverlay();
  repaintSvg();
  overlayEl.hidden = false;
}

export function closeMap() {
  if (overlayEl) overlayEl.hidden = true;
}
