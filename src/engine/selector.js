// selector.js — the "GATHER + PICK" verbs. Composes conditions to choose
// the next scene from the pool based purely on current state.
import { meets } from './conditions.js';
import { nextFloat } from './state.js';

const seen = (state, scene) => (state.scenesSeen[scene.id] || 0) > 0;

export function pickScene(state, scenes) {
  // 1) Forced follow-ups first. These were explicitly unlocked, so they bypass
  //    the normal trigger and fire in order (FIFO).
  while (state.followups.length) {
    const id = state.followups.shift();
    const s = scenes.find((x) => x.id === id);
    if (s && !(s.once && seen(state, s))) return s;
  }
  // 2) Otherwise, weighted pick from everything currently eligible.
  const eligible = scenes.filter((s) => !(s.once && seen(state, s)) && meets(state, s.trigger));
  if (eligible.length === 0) return null;

  const total = eligible.reduce((n, s) => n + (s.weight ?? 1), 0);
  let r = nextFloat(state) * total;
  for (const s of eligible) {
    r -= s.weight ?? 1;
    if (r <= 0) return s;
  }
  return eligible[eligible.length - 1];
}
