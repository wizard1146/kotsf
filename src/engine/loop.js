// loop.js — the heartbeat. Composes the six verbs into a playable turn.
// The harness (and later the UI) drives these; this file holds the rules of time.
import { seasonName } from './state.js';
import { resolveTest } from './resolver.js';
import { applyEffects } from './effects.js';

// Per-tick drift. The Forgetting bites HERE: lore decays every season unless
// the player spends effort to hold it. Mana regenerates; the Fracture creeps up.
// Mana regen trimmed +5→+3 (ROADMAP §7 #3) now that Workings give it a real sink.
const DECAY = { lore: -3, mana: +3, provisions: -3, fracture: +1 };

export function advanceTime(state) {
  for (const [k, d] of Object.entries(DECAY)) {
    state.pressures[k] = Math.max(0, Math.min(100, state.pressures[k] + d));
  }
  state.actionsUsed = [];    // per-screen actions refresh each season
  state.turn += 1;
  state.season = (state.season + 1) % 4;
  if (state.season === 0) state.year += 1;
}

export function applyChoice(state, scene, choice) {
  state.scenesSeen[scene.id] = (state.scenesSeen[scene.id] || 0) + 1;
  const outcome = choice.test ? resolveTest(state, choice.test) : 'win';
  const branch = choice[outcome] || choice.win;
  if (branch) {
    if (branch.text) {
      state.saga.push(`[${seasonName(state.season)} Y${state.year}] ${scene.title}: ${branch.text}`);
    }
    applyEffects(state, branch.effects);
  }
  return outcome;
}

export function checkEnd(state) {
  const p = state.pressures;
  if (state.circle.length === 0) return 'defeat:the-coven-is-empty';
  if (p.faith <= 0) return 'defeat:the-coven-has-lost-faith';
  if (p.provisions <= 0) return 'defeat:famine';
  if (p.fracture >= 100) return 'defeat:the-fracture-consumes-all';
  if (p.flamesRegard >= 80) return 'victory:keeper-of-the-sacred-flame';
  return null;
}
