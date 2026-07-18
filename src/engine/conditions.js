// conditions.js — read-only predicate evaluator over state. Pure. No eval.
// This is the "GATHER" verb's brain: "is this scene/choice relevant right now?"
import { getPath } from './state.js';

const LEAF = {
  gte: (a, b) => a >= b,
  lte: (a, b) => a <= b,
  gt: (a, b) => a > b,
  lt: (a, b) => a < b,
  eq: (a, b) => a === b,
};

export function meets(state, cond) {
  if (!cond) return true;                                  // no condition = always true
  if (cond.all) return cond.all.every((c) => meets(state, c));
  if (cond.any) return cond.any.some((c) => meets(state, c));
  if (cond.not) return !meets(state, cond.not);
  if (cond.flag) return !!state.flags[cond.flag];
  for (const op of Object.keys(LEAF)) {
    if (cond[op]) {
      const [path, val] = cond[op];
      return LEAF[op](getPath(state, path), val);
    }
  }
  return true;
}
