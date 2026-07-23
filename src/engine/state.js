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
    roles: {},          // member.id -> role id (Steward, Warden, …) — passive per-season effects
    nextMemberId: 4,    // running id counter for recruits (the opening ring is wz-0..3)
    expeditions: [],    // long-running quests in progress (see engine/expeditions.js)
    nextExpeditionId: 0,
  };
  state.circle = rollCircle(state);
  // Opening mastery reflects who stands in the Circle: each Wizard lends practice to their school.
  for (const m of state.circle) state.mastery[m.school] += m.rank === 'ring-leader' ? 28 : m.rank === 'adept' ? 22 : 16;
  return state;
}

// The Circle may grow to this many through recruitment.
export const MAX_CIRCLE = 7;

const SEASON_NAMES = ['Thaw', 'Highsun', 'Emberfall', 'Deepfrost'];
export const seasonName = (s) => SEASON_NAMES[s % 4];

// Each season now ticks in thirds — Early / Mid / Late — for a finer decision cadence.
const PHASE_NAMES = ['Early', 'Mid', 'Late'];
export const phaseName = (p) => PHASE_NAMES[(p || 0) % 3];
// full time label, e.g. "Early Thaw" (phase defaults to 0 for pre-sub-season saves)
export const timeName = (phase, season) => `${PHASE_NAMES[(phase || 0) % 3]} ${SEASON_NAMES[season % 4]}`;

// Append a stamped line to the saga. The `[… Y<N>]` prefix is what the Saga screen
// paginates on (year N); founding lines use a "[The Founding]" prefix instead.
export function chronicle(state, text) {
  state.saga.push(`[${timeName(state.phase, state.season)} Y${state.year}] ${text}`);
}

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
// Real Forgotten Runes wizards (sampled from the on-chain collection via
// portal.forgottenrunes.com/api/wizards/data/<id>). Each carries its short call-name
// (`n`, shown inline + on cards), its full canonical name (`full` — front title +
// name + back title, shown on the advisor sheet), and a grammatical gender (`g`;
// 'they' for the collection's gender-ambiguous wizards). See design/PORTRAIT_PROMPTS
// / the roster. Names are distinct so the Circle never doubles up.
const NAMES = [
  { n: 'Caligari', full: 'Voodoo Priest Caligari of the Mount', g: 'he' },
  { n: 'Voidoth', full: 'Cosmic Mage Voidoth of the Ether', g: 'they' },
  { n: 'Lamia', full: 'Shaman Lamia of the Berg', g: 'she' },
  { n: 'Durm', full: 'Battle Mage Durm of the Bastion', g: 'he' },
  { n: 'Alessar', full: 'Arch-Magician Alessar of Mu', g: 'he' },
  { n: 'Molek', full: 'Shaman Molek of the Valley', g: 'he' },
  { n: 'Eizo', full: 'Druid Eizo of the Plains', g: 'he' },
  { n: 'Imeena', full: 'Hedge Wizard Imeena of the Plains', g: 'she' },
  { n: 'Lilith', full: 'Witch Lilith of the Pit', g: 'she' },
  { n: 'Aldo', full: 'Thaumaturge Aldo of the Light', g: 'he' },
  { n: 'Chooki', full: 'Necromancer Chooki of the Toadstools', g: 'they' },
  { n: 'Jahid', full: 'Adept Jahid of the Keep', g: 'he' },
  { n: 'Ofaris', full: 'Arch-Magician Ofaris', g: 'he' },
  { n: 'Magpie', full: 'Transmuter Magpie of the Mist', g: 'they' },
  { n: 'Lumos', full: 'Archmagus Lumos in the Shadows', g: 'they' },
  { n: 'Diana', full: 'Enchanter Diana of the Road', g: 'she' },
  { n: 'Asphodel', full: 'Oracle Asphodel of the Wood', g: 'she' },
  { n: 'Victoria', full: 'Arch-Magician Victoria of the Field', g: 'she' },
  { n: 'Ekmira', full: 'Sage Ekmira of the Wood', g: 'she' },
  { n: 'Poppy', full: 'Geomancer Poppy of the Canyon', g: 'she' },
  { n: 'Cromwell', full: 'Battle Mage Cromwell of the Gnostics', g: 'he' },
  { n: 'Fark', full: 'Enchanter Fark of the Thorn', g: 'they' },
  { n: 'Lucien', full: 'Runecaster Lucien of Limbo', g: 'he' },
  { n: 'Merlon', full: 'Artificer Merlon of the Wood', g: 'he' },
  { n: 'Aleister', full: 'Archmagus Aleister out of the Blizzard', g: 'he' },
  { n: 'Ariadne', full: 'Enchanter Ariadne of the Plains', g: 'she' },
  { n: 'Bathsheba', full: 'Enchanter Bathsheba of the Wold', g: 'she' },
  { n: 'Cosmo', full: 'Aeromancer Cosmo of the Tower', g: 'he' },
  { n: 'Finn', full: 'Magus Finn of the Hills', g: 'he' },
  { n: 'Zeromus', full: 'Void Disciple Zeromus of Mu', g: 'he' },
  { n: 'Alizam', full: 'Shaman Alizam of the Canyon', g: 'he' },
  { n: 'Hagar', full: 'Battle Mage Hagar of the Wild', g: 'she' },
  { n: 'Pierre', full: 'Voodoo Priest Pierre of the Palms', g: 'he' },
  { n: 'Cybele', full: 'Enchanter Cybele of the Lake', g: 'she' },
  { n: "C'thalpa", full: "Shaman C'thalpa of Arcadia", g: 'they' },
  { n: 'Jadis', full: 'Enchanter Jadis of the Sun', g: 'she' },
  { n: 'Jerret', full: 'Archmagus Jerret of the Mist', g: 'he' },
  { n: 'Nixie', full: 'Summoner Nixie of the Palms', g: 'she' },
  { n: 'Talbot', full: 'Aeromancer Talbot of the Mount', g: 'he' },
  { n: 'Bayard', full: 'Battle Mage Bayard of the Fey', g: 'he' },
  { n: 'Tundror', full: 'Battle Mage Tundror of the Valley', g: 'he' },
  { n: 'Samuel', full: 'Aeromancer Samuel of the Wood', g: 'he' },
  { n: 'Maia', full: 'Enchanter Maia of the Grotto', g: 'she' },
  { n: 'Ulysse', full: 'Battle Mage Ulysse of the Wold', g: 'he' },
  { n: 'Iprix', full: 'Archmagus Iprix of the Field', g: 'they' },
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
export const shuffle = (state, arr) => { for (let i = arr.length - 1; i > 0; i--) { const j = pickIndex(state, i + 1); [arr[i], arr[j]] = [arr[j], arr[i]]; } return arr; };

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
    const { n: name, full: fullName, g: gender } = names[i];
    const cls = classes[i];
    const school = schools[i];
    const bias = CLASS_BIAS[cls] || {};
    const stat = (k) => clampStat(rankBase[rank] + (bias[k] || 0) + rollRange(state, -14, 14));
    return {
      id: `wz-${i}`, name, fullName, gender, school, class: cls, rank,
      age: rankAge[rank] + rollRange(state, -6, 8),
      power: stat('power'), wisdom: stat('wisdom'), guile: stat('guile'), courage: stat('courage'),
      boldness: rollRange(state, 15, 85), piety: rollRange(state, 15, 85), temper: rollRange(state, 15, 85),
    };
  });
}

// Roll a single new Wizard for recruitment (an apprentice by default). Name is drawn
// from those not already in the Circle or among the Souls; school/class are free.
export function rollMember(state, rank = 'apprentice') {
  const used = new Set([...state.circle, ...state.souls].map((m) => m.name));
  const pool = NAMES.filter((e) => !used.has(e.n));
  const { n: name, full: fullName, g: gender } = (pool.length ? pool : NAMES)[pickIndex(state, (pool.length ? pool : NAMES).length)];
  const cls = CLASSES[pickIndex(state, CLASSES.length)];
  const school = CULTS[pickIndex(state, CULTS.length)];
  const bias = CLASS_BIAS[cls] || {};
  const rankBase = { 'ring-leader': 56, adept: 50, apprentice: 38 }[rank] ?? 40;
  const rankAge = { 'ring-leader': 54, adept: 38, apprentice: 22 }[rank] ?? 28;
  const stat = (k) => clampStat(rankBase + (bias[k] || 0) + rollRange(state, -14, 14));
  const id = `wz-${state.nextMemberId != null ? state.nextMemberId++ : state.circle.length}`;
  return {
    id, name, fullName, gender, school, class: cls, rank,
    age: rankAge + rollRange(state, -6, 8),
    power: stat('power'), wisdom: stat('wisdom'), guile: stat('guile'), courage: stat('courage'),
    boldness: rollRange(state, 15, 85), piety: rollRange(state, 15, 85), temper: rollRange(state, 15, 85),
  };
}

// ---- casting: pick which Circle member fills a scene role ("a shape, not a name") ----
// Selectors: 'leader' | 'second' | 'any' | { class } | { school } | { trait: {axis:'high'|'low'} } | { most: '<stat>' }.
// Returns null when nobody matches (so that voice simply isn't heard) — the emergent bit.
export function castMember(state, sel, exclude) {
  // Members away on an expedition are out of circulation — they can't advise or cast.
  let pool = state.circle.filter((m) => !m.away && !(exclude && exclude.has(m.id)));
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
// Gender is three-way: 'she' / 'he' / 'they' (the Runiverse has many gender-ambiguous
// Wizards). Singular 'they' takes plural verb agreement, so the conjugation tokens
// {s}/{es}/{ies} drop to the bare stem for 'they' — write "ask{s}", "carr{ies}",
// "go{es}" and it reads right for all three (she asks / they ask).
export function castText(text, m) {
  if (!m || !text) return text || '';
  const g = m.gender === 'she' ? 'she' : m.gender === 'he' ? 'he' : 'they';
  const plural = g === 'they';
  const P = g === 'she' ? { they: 'she', them: 'her', their: 'her', theirs: 'hers', themselves: 'herself' }
    : g === 'he' ? { they: 'he', them: 'him', their: 'his', theirs: 'his', themselves: 'himself' }
      : { they: 'they', them: 'them', their: 'their', theirs: 'theirs', themselves: 'themselves' };
  const cap = (w) => w[0].toUpperCase() + w.slice(1);
  return String(text)
    .replace(/\{name\}/g, m.name)
    .replace(/\{(they|them|their|theirs|themselves)\}/g, (_, k) => P[k])
    .replace(/\{(They|Them|Their|Theirs|Themselves)\}/g, (_, k) => cap(P[k.toLowerCase()]))
    .replace(/\{s\}/g, plural ? '' : 's')
    .replace(/\{es\}/g, plural ? '' : 'es')
    .replace(/\{ies\}/g, plural ? 'y' : 'ies')
    .replace(/\{class\}/g, m.class).replace(/\{school\}/g, m.school);
}

// Path resolution shared by conditions + effects. Keeps content's vocabulary tiny.
export function getPath(state, path) {
  if (path.startsWith('cult.')) return state.cults[path.slice(5)];
  if (path.startsWith('mastery.')) return (state.mastery || {})[path.slice(8)];
  if (path in state.pressures) return state.pressures[path];
  if (path === 'turn') return state.turn;
  if (path === 'year') return state.year;
  // Member competence (power/wisdom/guile/courage) is NOT a coven-wide value, so it
  // only resolves inside an active EXPEDITION beat — as the best of the party you
  // sent. This is what makes "who you send matters": a bold party clears a courage
  // test a timid one would fail. Outside an expedition it stays undefined (scenes
  // must test coven paths, not competence).
  if (path === 'power' || path === 'wisdom' || path === 'guile' || path === 'courage') {
    const exp = (state.expeditions || []).find((e) => e.id === state._activeExp);
    const party = exp ? (exp.party || []).map((id) => state.circle.find((m) => m.id === id)).filter(Boolean) : [];
    return party.length ? Math.max(...party.map((m) => m[path] || 0)) : undefined;
  }
  return undefined;
}
