export const initialState = () => ({
  steps: 100,
  currentScene: 'apartment',
  items: ['key_home', 'note'],
  params: { bond: 0, nihil: 0, wrath: 0, hope: 0, truth: 0 },
  flags: {},
  visited: [],
});

export let state = initialState();

export function setState(partial) {
  Object.assign(state, partial);
}

export function consumeSteps(cost) {
  state.steps = Math.max(0, state.steps - cost);
}

export function addItem(id) {
  if (!state.items.includes(id)) state.items.push(id);
}

export function removeItem(id) {
  state.items = state.items.filter(i => i !== id);
}

export function hasItem(id) {
  return state.items.includes(id);
}

export function addParam(name, amount = 1) {
  if (name in state.params) state.params[name] += amount;
}

export function setFlag(name, value = true) {
  state.flags[name] = value;
}

export function getFlag(name) {
  return !!state.flags[name];
}

export function markVisited(sceneId) {
  if (!state.visited.includes(sceneId)) state.visited.push(sceneId);
}

export function resetState() {
  const fresh = initialState();
  Object.keys(fresh).forEach(k => { state[k] = fresh[k]; });
}

export function loadState(saved) {
  Object.keys(saved).forEach(k => { state[k] = saved[k]; });
}
