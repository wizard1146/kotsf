// loop.js — the heartbeat. Composes the six verbs into a playable turn.
// The harness (and later the UI) drives these; this file holds the rules of time.
import { chronicle } from './state.js';
import { resolveTest } from './resolver.js';
import { applyEffects } from './effects.js';
import { tickExpeditions } from './expeditions.js';

// Per-tick drift. The Forgetting bites HERE: lore decays every season unless
// the player spends effort to hold it. Mana regenerates; the Fracture creeps up.
// Mana regen trimmed +5→+3 (ROADMAP §7 #3) now that Workings give it a real sink.
const DECAY = { lore: -3, mana: +3, provisions: -3, fracture: +1 };

// A tick is now a *sub-season* (Early → Mid → Late). Events can fire at any third,
// but the season economy is unchanged: decay + the per-season action refresh land
// only when a full season turns over (every 3rd tick), so the yearly totals hold.
const clampP = (v) => Math.max(0, Math.min(100, v));

// Assigned advisor tasks pay out once per season: dir × scaled(member's stat) on the
// role's pressure. `roles` is the definitions list (from content/roles.json).
function applyRoles(state, roles) {
  if (!state.roles || !roles.length) return;
  for (const m of state.circle) {
    if (m.away) continue;                       // a Wizard on the road can't work their task
    const def = roles.find((r) => r.id === state.roles[m.id]);
    if (!def) continue;
    const d = Math.max(1, Math.min(4, Math.round(((m[def.stat] || 0) - 20) / 18)));
    state.pressures[def.pressure] = clampP(state.pressures[def.pressure] + def.dir * d);
  }
}

export function advanceTime(state, roles = []) {
  state.turn += 1;
  state.phase = ((state.phase || 0) + 1) % 3;
  tickExpeditions(state);                        // parties on the road count down each tick

  if (state.phase === 0) {                 // a full season has turned
    for (const [k, d] of Object.entries(DECAY)) state.pressures[k] = clampP(state.pressures[k] + d);
    applyRoles(state, roles);              // advisor tasks pay out
    state.actionsUsed = [];
    state.season = (state.season + 1) % 4;
    if (state.season === 0) {
      state.year += 1;
      for (const m of state.circle) m.age = (m.age || 0) + 1;   // the Circle grows older each year
    }
  }
}

export function applyChoice(state, scene, choice) {
  state.scenesSeen[scene.id] = (state.scenesSeen[scene.id] || 0) + 1;
  const outcome = choice.test ? resolveTest(state, choice.test) : 'win';
  const branch = choice[outcome] || choice.win;
  if (branch) {
    // Prefer a self-contained `saga` synopsis (names its own specifics, so it reads
    // on the Saga page without the scene's intro for context); else fall back to the
    // outcome text under the scene title.
    if (branch.saga) chronicle(state, branch.saga);
    else if (branch.text) chronicle(state, `${scene.title}: ${branch.text}`);
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
