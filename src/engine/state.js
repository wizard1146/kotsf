// state.js — the single source of truth. Depends on nothing.
// Plain data + a few pure helpers. Every other module reads/writes THIS.

export const PRESSURES = ['mana', 'provisions', 'coin', 'lore', 'faith', 'flamesRegard', 'fracture'];
export const CULTS = ['red', 'yellow', 'brown', 'green', 'blue', 'purple', 'white'];

// NOTE: the Circle roster below is embedded for the Phase-1 slice. The canonical
// definitions live in content/circle/*.json; a later phase loads from there.
export function createInitialState(seed = 1) {
  const state = {
    turn: 0,
    season: 0,          // 0..3 (Thaw…Deepfrost)
    phase: 0,           // 0..2 within a season (Early/Mid/Late) — 12 sub-seasons per year
    year: 1,
    seed,
    rngState: seed >>> 0,
    pressures: { mana: 30, provisions: 50, coin: 35, lore: 40, faith: 50, flamesRegard: 35, fracture: 10 },
    cults: { red: 0, yellow: 0, brown: 0, green: 0, blue: 0, purple: 0, white: 0 },
    flags: {},
    circle: [],         // a fresh ring is rolled below (seeded → reproducible) — see rollCircle
    souls: [],          // members lost to the Flame persist here as NPCs (permanent — see PLANNING §5a)
    saga: [],           // the running history log
    scenesSeen: {},     // id -> count (for `once`)
    followups: [],      // queued scene ids (from `unlock` effects)
    actionsUsed: [],    // per-screen action ids performed this season (reset each tick)
    // Per-school Mastery (0..100) — how much practical command of each colour the coven
    // holds. SEPARATE from cults[] (that is standing/reputation with the cult). Mastery
    // raises the odds on that school's workings; casting a working nudges it up.
    mastery: { red: 0, yellow: 0, brown: 0, green: 0, blue: 0, purple: 0, white: 0 },
  };
  state.circle = rollCircle(state);
  // Opening mastery reflects who stands in the Circle: each Wizard lends practice to their school.
  for (const m of state.circle) state.mastery[m.school] += m.rank === 'ring-leader' ? 28 : m.rank === 'adept' ? 22 : 16;
  return state;
}

const SEASON_NAMES = ['Thaw', 'Highsun', 'Emberfall', 'Deepfrost'];
export const seasonName = (s) => SEASON_NAMES[s % 4];

// Each season now ticks in thirds — Early / Mid / Late — for a finer decision cadence.
const PHASE_NAMES = ['Early', 'Mid', 'Late'];
export const phaseName = (p) => PHASE_NAMES[(p || 0) % 3];
// full time label, e.g. "Early Thaw" (phase defaults to 0 for pre-sub-season saves)
export const timeName = (phase, season) => `${PHASE_NAMES[(phase || 0) % 3]} ${SEASON_NAMES[season % 4]}`;

// Seeded, serializable RNG (mulberry32). Mutates state.rngState; returns [0,1).
// Storing the integer state in the save makes runs reproducible — which is what
// keeps permanent Flame-loss honest (no reload-until-she-survives).
export function nextFloat(state) {
  let t = (state.rngState = (state.rngState + 0x6d2b79f5) >>> 0);
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

export function pickIndex(state, n) {
  return Math.floor(nextFloat(state) * n);
}

// ---- character generation: a fresh Circle is rolled each campaign, seeded so a
// run is reproducible. Names are invented in the Runiverse voice (swap a handful
// for canon Forgotten Runes names later). See design/MAGIC_AND_CIRCLE.md.
const NAMES = [
  ['Vela', 'she'], ['Wisp', 'she'], ['Sabra', 'she'], ['Nyx', 'she'], ['Corvane', 'she'], ['Lyra', 'she'],
  ['Ashling', 'she'], ['Thessa', 'she'], ['Mirren', 'she'], ['Ondine', 'she'], ['Bryn', 'she'], ['Saffron', 'she'],
  ['Elowen', 'she'], ['Isolde', 'she'], ['Wren', 'she'], ['Marent', 'she'],
  ['Korr', 'he'], ['Ember', 'he'], ['Bram', 'he'], ['Dain', 'he'], ['Osric', 'he'], ['Fenn', 'he'], ['Garrow', 'he'],
  ['Roan', 'he'], ['Cael', 'he'], ['Alric', 'he'], ['Emrys', 'he'], ['Tobar', 'he'], ['Silas', 'he'], ['Vane', 'he'],
  ['Hale', 'he'], ['Rune', 'he'],
];
export const CLASSES = ['magus', 'sorcerer', 'druid', 'necromancer', 'pyromancer', 'enchanter', 'charmer', 'chaos-mage', 'ghost-eater'];
// mild class → competence lean (a nudge, not a cap)
const CLASS_BIAS = {
  magus: { wisdom: 12 }, sorcerer: { power: 16 }, druid: { wisdom: 10 }, necromancer: { courage: 12 },
  pyromancer: { power: 14 }, enchanter: { power: 10 }, charmer: { guile: 16 }, 'chaos-mage': { guile: 10 }, 'ghost-eater': { courage: 14 },
};
const clampStat = (v) => Math.max(5, Math.min(95, Math.round(v)));
const rollRange = (state, lo, hi) => lo + pickIndex(state, hi - lo + 1);

// Roll the opening ring of four: a leader, a second (the default caster), two apprentices.
const shuffle = (state, arr) => { for (let i = arr.length - 1; i > 0; i--) { const j = pickIndex(state, i + 1); [arr[i], arr[j]] = [arr[j], arr[i]]; } return arr; };

// Age band → portrait variant letter (a/b/c = young/middle/old). Members carry a
// real `age` that ticks up each year, so their portrait can age with them.
export const ageBand = (age) => (age < 33 ? 'young' : age <= 51 ? 'middle' : 'old');
export const ageVariant = (age) => (age < 33 ? 'a' : age <= 51 ? 'b' : 'c');

export function rollCircle(state) {
  const names = shuffle(state, NAMES.slice());
  const classes = shuffle(state, CLASSES.slice());   // distinct class per member — no clustering
  const schools = shuffle(state, CULTS.slice());      // distinct school per member (4 of 7)
  const ranks = ['ring-leader', 'adept', 'apprentice', 'apprentice'];
  const rankBase = { 'ring-leader': 56, adept: 50, apprentice: 38 };
  const rankAge = { 'ring-leader': 54, adept: 38, apprentice: 22 };   // seniority reads as age
  return ranks.map((rank, i) => {
    const [name, gender] = names[i];
    const cls = classes[i];
    const school = schools[i];
    const bias = CLASS_BIAS[cls] || {};
    const stat = (k) => clampStat(rankBase[rank] + (bias[k] || 0) + rollRange(state, -14, 14));
    return {
      id: `wz-${i}`, name, gender, school, class: cls, rank,
      age: rankAge[rank] + rollRange(state, -6, 8),
      power: stat('power'), wisdom: stat('wisdom'), guile: stat('guile'), courage: stat('courage'),
      boldness: rollRange(state, 15, 85), piety: rollRange(state, 15, 85), temper: rollRange(state, 15, 85),
    };
  });
}

// ---- casting: pick which Circle member fills a scene role ("a shape, not a name") ----
// Selectors: 'leader' | 'second' | 'any' | { class } | { school } | { trait: {axis:'high'|'low'} } | { most: '<stat>' }.
// Returns null when nobody matches (so that voice simply isn't heard) — the emergent bit.
export function castMember(state, sel, exclude) {
  let pool = state.circle.filter((m) => !(exclude && exclude.has(m.id)));
  if (!pool.length) return null;
  if (sel === 'leader') return pool.find((m) => m.rank === 'ring-leader') || pool[0];
  if (sel === 'second') return pool.find((m) => m.rank === 'adept') || pool[1] || pool[0];
  if (!sel || sel === 'any') return pool[0];
  if (typeof sel === 'object') {
    if (sel.class) pool = pool.filter((m) => m.class === sel.class);
    if (sel.school) pool = pool.filter((m) => m.school === sel.school);
    if (!pool.length) return null;
    if (sel.trait) { const [ax, hl] = Object.entries(sel.trait)[0]; return pool.slice().sort((a, b) => (hl === 'low' ? a[ax] - b[ax] : b[ax] - a[ax]))[0]; }
    if (sel.most) return pool.slice().sort((a, b) => (b[sel.most] || 0) - (a[sel.most] || 0))[0];
    return pool[0];
  }
  return pool[0];
}

// ---- working (spell) casting: score a caster attempting a working ----
// score = their competence in the working's stat + a bonus when their school matches
// the working + the coven's mastery of that school. Fed to resolveContest vs difficulty.
export function workingScore(state, working, caster) {
  const cast = working.cast || {};
  const base = caster ? caster[cast.stat] || 0 : 30;
  const schoolBonus = caster && working.school && caster.school === working.school ? 15 : 0;
  const masteryBonus = working.school ? Math.floor((state.mastery?.[working.school] || 0) / 4) : 0; // up to +25
  return base + schoolBonus + masteryBonus;
}
// Win probability [0,1) for the odds hint the UI shows.
export function workingOdds(state, working, caster) {
  const s = workingScore(state, working, caster);
  return s / (s + Math.max(1, (working.cast || {}).vs || 40));
}

// Substitute {name} + gendered pronoun tokens ({they}/{them}/{their}/{theirs}) into scene text.
export function castText(text, m) {
  if (!m || !text) return text || '';
  const she = m.gender === 'she';
  const P = { they: she ? 'she' : 'he', them: she ? 'her' : 'him', their: she ? 'her' : 'his', theirs: she ? 'hers' : 'his' };
  return String(text)
    .replace(/\{name\}/g, m.name)
    .replace(/\{(they|them|their|theirs)\}/g, (_, k) => P[k])
    .replace(/\{(They|Them|Their|Theirs)\}/g, (_, k) => { const w = P[k.toLowerCase()]; return w[0].toUpperCase() + w.slice(1); })
    .replace(/\{class\}/g, m.class).replace(/\{school\}/g, m.school);
}

// Path resolution shared by conditions + effects. Keeps content's vocabulary tiny.
export function getPath(state, path) {
  if (path.startsWith('cult.')) return state.cults[path.slice(5)];
  if (path.startsWith('mastery.')) return (state.mastery || {})[path.slice(8)];
  if (path in state.pressures) return state.pressures[path];
  if (path === 'turn') return state.turn;
  if (path === 'year') return state.year;
  return undefined;
}
