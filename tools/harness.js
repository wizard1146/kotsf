// harness.js — headless proof of the engine. NO UI. "Play N turns, print the saga."
// This is the most important checkpoint in Phase 1: if a believable run comes out
// of here, the UI is just presentation over a known-good core.
//
// Usage: node tools/harness.js [turns] [seed]
import { readdirSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { createInitialState, pickIndex, seasonName } from '../src/engine/state.js';
import { meets } from '../src/engine/conditions.js';
import { pickScene } from '../src/engine/selector.js';
import { advanceTime, applyChoice, checkEnd } from '../src/engine/loop.js';
import { registerExpeditions, dueExpedition, expeditionScene, nameReturningSoul, startExpedition } from '../src/engine/expeditions.js';

const __dir = dirname(fileURLToPath(import.meta.url));
const SCENES_DIR = join(__dir, '..', 'content', 'scenes');

function loadScenes(dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...loadScenes(p));
    else if (entry.name.endsWith('.json')) out.push(JSON.parse(readFileSync(p, 'utf8')));
  }
  return out;
}

const validChoices = (state, scene) => scene.choices.filter((c) => meets(state, c.requires));

const maxTurns = Number(process.argv[2] || 60);
const seed = Number(process.argv[3] || 12345);
const scenes = loadScenes(SCENES_DIR);
const expeditions = loadScenes(join(__dir, '..', 'content', 'expeditions'));
registerExpeditions(expeditions);
const state = createInitialState(seed);

// Lint: a SCENE test/requires must resolve against a coven path (pressures,
// mastery.<school>, cult.<colour>, turn, year). Member competence only resolves
// inside an expedition beat — testing it in a plain scene silently always-loses.
// (This is exactly the class of bug that made 8 expedition checks always fail.)
(() => {
  const COMP = new Set(['power', 'wisdom', 'guile', 'courage']);
  const resolvable = (p) => typeof p === 'string' && (p.startsWith('mastery.') || p.startsWith('cult.') || ['mana', 'provisions', 'coin', 'lore', 'faith', 'flamesRegard', 'fracture', 'turn', 'year'].includes(p));
  const warns = [];
  const walkReq = (id, cond) => { if (!cond || typeof cond !== 'object') return; for (const k of ['gte', 'lte', 'gt', 'lt', 'eq']) if (cond[k] && !resolvable(cond[k][0])) warns.push(`${id}: requires "${cond[k][0]}" won't resolve`); for (const k of ['all', 'any']) if (cond[k]) cond[k].forEach((c) => walkReq(id, c)); if (cond.not) walkReq(id, cond.not); };
  for (const s of scenes) for (const c of s.choices || []) {
    if (c.test && !resolvable(c.test.stat)) warns.push(`${s.id}/${c.id}: test "${c.test.stat}" won't resolve${COMP.has(c.test.stat) ? ' (member competence — use a coven path in scenes)' : ''}`);
    walkReq(`${s.id}/${c.id}`, c.requires);
  }
  if (warns.length) { console.log('LINT WARNINGS (non-resolvable scene paths):'); warns.forEach((w) => console.log('  ! ' + w)); console.log(''); }
})();

console.log(`\n=== Keeper of the Sacred Flame — headless run (seed ${seed}, ${scenes.length} scenes loaded) ===\n`);

let end = null;
while (state.turn < maxTurns && !end) {
  advanceTime(state);
  // A party come due interrupts the pool with its beat (mirrors main.js advanceToScene).
  const exp = dueExpedition(state);
  if (exp) {
    state._activeExp = exp.id;
    const beat = expeditionScene(state, exp);
    if (beat.kind === 'name-soul') {
      const cands = [...(exp.data.candidates || []), '__nameless__'];
      const r = nameReturningSoul(state, exp, cands[pickIndex(state, cands.length)]);
      console.log(`T${String(state.turn).padStart(2)} ${seasonName(state.season).padEnd(9)} Y${state.year} | ${beat.title} -> named [${r.correct ? 'right' : 'wrong'}]`);
    } else {
      const chs = validChoices(state, beat);
      const ch = (chs.length ? chs : beat.choices)[pickIndex(state, (chs.length ? chs : beat.choices).length)];
      const outcome = applyChoice(state, beat, ch);
      console.log(`T${String(state.turn).padStart(2)} ${seasonName(state.season).padEnd(9)} Y${state.year} | ${beat.title} -> "${ch.label}" [exp:${outcome}]`);
    }
    delete state._activeExp;
    end = checkEnd(state);
    continue;
  }
  const scene = pickScene(state, scenes);
  if (!scene) continue; // nothing eligible this season — the world is quiet
  const choices = validChoices(state, scene);
  if (choices.length === 0) {
    // No affordable choice (e.g. can't pay tribute, can't buy grain): mark seen, skip.
    state.scenesSeen[scene.id] = (state.scenesSeen[scene.id] || 0) + 1;
    continue;
  }
  const choice = choices[pickIndex(state, choices.length)];
  const outcome = applyChoice(state, scene, choice);
  console.log(`T${String(state.turn).padStart(2)} ${seasonName(state.season).padEnd(9)} Y${state.year} | ${scene.title} -> "${choice.label}" [${outcome}]`);
  if (state._pendingExpedition) { startExpedition(state, { tmpl: state._pendingExpedition.tmpl }); delete state._pendingExpedition; }   // no picker in the harness — auto-pick
  end = checkEnd(state);
}

console.log(`\n--- Saga ---`);
for (const line of state.saga) console.log('  ' + line);

console.log(`\n--- Final state ---`);
console.log('  pressures:', state.pressures);
console.log('  cults:   ', state.cults);
console.log('  circle:  ', state.circle.map((m) => m.name).join(', ') || '(none)');
console.log('  souls:   ', state.souls.map((m) => m.name).join(', ') || '(none)');
console.log('  outcome: ', end || `survived all ${maxTurns} turns`);
console.log('');
