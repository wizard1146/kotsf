// effects.js — the ONLY place state mutates. Centralized for debuggability:
// if the state is ever wrong, there is exactly one file to look in.
import { pickIndex, chronicle } from './state.js';

const clamp = (v, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, v));

function addPath(state, path, delta) {
  if (path.startsWith('cult.')) {
    // Cult standing is SIGNED: −100 (sworn enemy) … 0 (neutral) … +100 (ally).
    // Pressures stay 0–100; only standings model hostility (ROADMAP §7 #2).
    const c = path.slice(5);
    state.cults[c] = clamp((state.cults[c] || 0) + delta, -100, 100);
    return;
  }
  if (path.startsWith('mastery.')) {
    const s = path.slice(8);
    if (state.mastery && s in state.mastery) state.mastery[s] = clamp(state.mastery[s] + delta);
    return;
  }
  if (path in state.pressures) {
    state.pressures[path] = clamp(state.pressures[path] + delta);
  }
}

// Permanent: the member LEAVES the Circle and persists as a Forgotten Soul NPC
// (PLANNING §5a). We move, not delete — so they can be met again later.
function transformMember(state, spec) {
  let pool = state.circle.filter((m) => m.rank === 'apprentice');
  if (spec === 'random_apprentice_to_soul' && pool.length === 0) {
    pool = state.circle.filter((m) => m.rank !== 'archon');
  }
  if (pool.length === 0) return;
  const m = pool[pickIndex(state, pool.length)];
  state.circle = state.circle.filter((x) => x.id !== m.id);
  state.souls.push({ ...m, wasMember: true });
  chronicle(state, `${m.name} stepped into the Flame and did not return as ${m.name}. A Forgotten Soul now walks the Runiverse.`);
}

export function applyEffects(state, effects = []) {
  for (const e of effects) {
    if (e.add) addPath(state, e.add[0], e.add[1]);
    else if (e.adjust_cult) addPath(state, 'cult.' + e.adjust_cult[0], e.adjust_cult[1]);
    else if (e.adjust_mastery) addPath(state, 'mastery.' + e.adjust_mastery[0], e.adjust_mastery[1]);
    else if (e.set && e.set[0] in state.pressures) state.pressures[e.set[0]] = clamp(e.set[1]);
    else if (e.set_flag) state.flags[e.set_flag] = true;
    else if (e.clear_flag) delete state.flags[e.clear_flag];
    else if (e.unlock) state.followups.push(e.unlock);
    else if (e.transform_member) transformMember(state, e.transform_member);
  }
  return state;
}
