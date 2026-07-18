// resolver.js — the "RESOLVE" verb. Skill checks with seeded, bounded RNG.
import { getPath, nextFloat } from './state.js';

// Contest model: P(win) = stat / (stat + difficulty). Equal stat & difficulty => 50%.
// Bounded by construction — never 0% or 100%, so nothing is ever a sure thing.
export function resolveTest(state, test) {
  if (!test) return 'win';
  const stat = Math.max(0, getPath(state, test.stat) ?? 0);
  const vs = Math.max(1, test.vs);
  const chance = stat / (stat + vs);
  return nextFloat(state) < chance ? 'win' : 'lose';
}
