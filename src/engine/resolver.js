// resolver.js — the "RESOLVE" verb. Skill checks with seeded, bounded RNG.
import { getPath, nextFloat } from './state.js';

// Contest model: P(win) = stat / (stat + difficulty). Equal stat & difficulty => 50%.
// Bounded by construction — never 0% or 100%, so nothing is ever a sure thing.
export function resolveTest(state, test) {
  if (!test) return 'win';
  const stat = Math.max(0, getPath(state, test.stat) ?? 0);
  return resolveContest(state, stat, test.vs);
}

// Same bounded contest, but the "stat" is a pre-computed score (e.g. a caster's
// working score) rather than a state path. Never 0% or 100% — nothing is certain.
export function resolveContest(state, score, vs) {
  const s = Math.max(0, score);
  const v = Math.max(1, vs);
  return nextFloat(state) < s / (s + v) ? 'win' : 'lose';
}
