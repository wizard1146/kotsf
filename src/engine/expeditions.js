// expeditions.js — long-running, multi-season quests. A party of Circle members
// LEAVES (marked `m.away = <expId>`, out of circulation for casting/tasks/counsel
// but still on the roster), and returns over several ticks. Each stage surfaces a
// beat scene when its countdown (`wait`, in ticks) reaches zero; the beat's choice
// effects steer the quest (advance / branch / end). Templates are content; the
// runtime instance state lives on `state.expeditions`.
//
// Content model (content/expeditions/*.json):
//   { id, title, party:<n>, partyPick:"most:courage"|…, stages:[
//       { id, away:<ticks>, kind?:"name-soul", scene:{ intro, advisors?, choices[] } } ] }
// Beat choices use the same effect vocabulary plus the expedition_* verbs below.
import { chronicle, castText, pickIndex, shuffle } from './state.js';

// ---- template registry (data in, once, at load) ---------------------------
let TEMPLATES = {};
export function registerExpeditions(list) {
  TEMPLATES = {};
  for (const t of list || []) TEMPLATES[t.id] = t;
}
export function getTemplate(id) { return TEMPLATES[id]; }

const active = (state) => (state.expeditions || []).find((e) => e.id === state._activeExp);
const party = (state, exp) => (exp.party || []).map((id) => state.circle.find((m) => m.id === id)).filter(Boolean);
const names = (ms) => (ms.length <= 1 ? (ms[0]?.name || 'the party')
  : ms.slice(0, -1).map((m) => m.name).join(', ') + ' and ' + ms[ms.length - 1].name);

// ---- launch ---------------------------------------------------------------
// Pick a party and send them. The ring-leader always stays home (someone must
// keep the hearth), and away members can't be sent again.
export function startExpedition(state, spec) {
  const tmpl = TEMPLATES[spec?.tmpl];
  if (!tmpl || !(tmpl.stages || []).length) return;
  const size = spec.party ?? tmpl.party ?? 1;
  const avail = state.circle.filter((m) => !m.away && m.rank !== 'ring-leader');
  if (!avail.length) { chronicle(state, `The road calls, but no Wizard can be spared for ${tmpl.title}.`); return; }
  const chosen = pickParty(state, avail, tmpl.partyPick, size);
  if (!chosen.length) return;
  if (state.nextExpeditionId == null) state.nextExpeditionId = 0;
  const id = `exp-${state.nextExpeditionId++}`;
  for (const m of chosen) m.away = id;
  const s0 = tmpl.stages[0];
  state.expeditions = state.expeditions || [];
  state.expeditions.push({ id, tmpl: tmpl.id, stage: 0, wait: s0.away ?? 3, party: chosen.map((m) => m.id), data: {} });
  chronicle(state, `${names(chosen)} set out from Runehold — ${tmpl.title} begins.`);
}

// Rank/competence-ordered party pick. `pick` may be "most:<stat>" | "trait:<axis>:high|low".
function pickParty(state, pool, pick, size) {
  let scored = pool.slice();
  if (typeof pick === 'string' && pick.startsWith('most:')) {
    const stat = pick.slice(5);
    scored.sort((a, b) => (b[stat] || 0) - (a[stat] || 0));
  } else if (typeof pick === 'string' && pick.startsWith('trait:')) {
    const [, ax, hl] = pick.split(':');
    scored.sort((a, b) => (hl === 'low' ? a[ax] - b[ax] : b[ax] - a[ax]));
  } else {
    // default: adepts before apprentices, then by raw competence
    const rw = { adept: 2, apprentice: 1 };
    scored.sort((a, b) => (rw[b.rank] || 0) - (rw[a.rank] || 0) || (b.power + b.wisdom) - (a.power + a.wisdom));
  }
  return scored.slice(0, Math.max(1, Math.min(size, scored.length)));
}

// ---- the clock ------------------------------------------------------------
// Called once per tick from advanceTime. Counts every running party down.
export function tickExpeditions(state) {
  for (const e of state.expeditions || []) if (e.wait > 0) e.wait -= 1;
}
// The first expedition whose current stage has come due (party is "back this season").
export function dueExpedition(state) {
  return (state.expeditions || []).find((e) => e.wait <= 0);
}

// Build the ready-to-present beat scene for an expedition's current stage:
// party names substituted in, tagged with `_exp` so the controller can bind
// effects to this instance, and (for name-soul beats) the returning Soul rolled.
export function expeditionScene(state, exp) {
  const tmpl = TEMPLATES[exp.tmpl];
  const stage = tmpl.stages[exp.stage];
  const ms = party(state, exp);
  const lead = ms[0] || null;
  const sub = (t) => String(t == null ? '' : t).replace(/\{party\}/g, names(ms));
  const deep = (t) => castText(sub(t), lead);
  const src = stage.scene || {};
  const scene = {
    id: `${tmpl.id}:${stage.id}`,
    type: 'expedition',
    title: deep(src.title || tmpl.title),
    intro: deep(src.intro || ''),
    _exp: exp.id,
    kind: stage.kind || null,
    advisors: (src.advisors || []).map((a) => ({ ...a, text: deep(a.text) })),
    choices: (src.choices || []).map((c) => ({
      ...c,
      label: deep(c.label),
      win: c.win ? { ...c.win, text: deep(c.win.text), saga: c.win.saga ? deep(c.win.saga) : undefined } : undefined,
      lose: c.lose ? { ...c.lose, text: deep(c.lose.text), saga: c.lose.saga ? deep(c.lose.saga) : undefined } : undefined,
    })),
  };
  if (stage.kind === 'name-soul' && !exp.data.soulRolled) rollReturningSoul(state, exp);
  return scene;
}

// ---- stage control (invoked by beat effects; act on the active expedition) --
export function advanceExpedition(state, gotoId) {
  const exp = active(state);
  if (!exp) return;
  const tmpl = TEMPLATES[exp.tmpl];
  const next = gotoId ? tmpl.stages.findIndex((s) => s.id === gotoId) : exp.stage + 1;
  if (next < 0 || next >= tmpl.stages.length) { endExpedition(state, 'return'); return; }
  exp.stage = next;
  exp.wait = tmpl.stages[next].away ?? 3;
}

// Finish now. 'return' brings the party home; 'lost' turns them into Forgotten
// Souls (they set out and did not come back as themselves).
export function endExpedition(state, mode = 'return') {
  const exp = active(state);
  if (!exp) return;
  const ms = party(state, exp);
  const tmpl = TEMPLATES[exp.tmpl];
  if (mode === 'lost') {
    for (const m of ms) {
      state.circle = state.circle.filter((x) => x.id !== m.id);
      delete m.away;
      state.souls.push({ ...m, wasMember: true });
    }
    chronicle(state, `${names(ms)} did not return from ${tmpl.title}. The Runiverse keeps them now.`);
  } else {
    for (const m of ms) delete m.away;
    chronicle(state, `${names(ms)} came home to Runehold from ${tmpl.title}.`);
  }
  state.expeditions = (state.expeditions || []).filter((e) => e.id !== exp.id);
}

// ---- the returning-Soul naming beat ---------------------------------------
// When a Wizard returns wrong, roll WHO the Soul really is: sometimes a nameless
// Forgotten Soul (just the lost Wizard, unrecognisable), sometimes one of YOUR
// own — a Wizard you burned or lost to the Flame, come back wearing this shape.
// The player names it; being right is a small grace, being wrong a small wound.
function rollReturningSoul(state, exp) {
  const ms = party(state, exp);
  const lead = ms[0];
  exp.data.soulRolled = true;
  exp.data.soulMember = lead ? lead.id : null;
  // candidates: your named Souls (burned/lost members) + the nameless option
  const known = (state.souls || []).filter((s) => s.wasMember).map((s) => s.name);
  const roll = nextChance(state);
  // ~55% it's genuinely nameless; otherwise it's one of your own returned
  if (known.length && roll > 0.55) {
    exp.data.soulTrue = known[pickIndex(state, known.length)];
  } else {
    exp.data.soulTrue = '__nameless__';
  }
  const decoys = shuffle(state, known.filter((n) => n !== exp.data.soulTrue)).slice(0, 3);
  const opts = shuffle(state, [...new Set([...(exp.data.soulTrue !== '__nameless__' ? [exp.data.soulTrue] : []), ...decoys])]);
  exp.data.candidates = opts;   // named guesses to offer (plus the always-present "no name I know")
}
const nextChance = (state) => { // 0..1, seeded
  // small local helper so we don't import nextFloat's name collision risk
  return pickIndex(state, 1000) / 1000;
};

// Resolve a naming guess. `guess` is a Soul name or '__nameless__'. Returns
// { correct, name } and finalises: the lead becomes a Soul, party returns.
export function nameReturningSoul(state, exp, guess) {
  const ms = party(state, exp);
  const lead = ms[0];
  const truth = exp.data.soulTrue;
  const correct = guess === truth;
  // the lead Wizard is gone regardless — a Soul now walks in their place
  if (lead) {
    state.circle = state.circle.filter((x) => x.id !== lead.id);
    delete lead.away;
    // if the truth was one of your own, this Soul IS that one (already in souls);
    // otherwise the lead joins the Souls, nameless to the world.
    if (truth === '__nameless__') state.souls.push({ ...lead, wasMember: true, nameless: true });
  }
  for (const m of ms.slice(1)) delete m.away;   // any companions come home
  state.expeditions = (state.expeditions || []).filter((e) => e.id !== exp.id);
  return { correct, truth, name: truth === '__nameless__' ? null : truth };
}
