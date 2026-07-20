// state.js — the single source of truth. Depends on nothing.
// Plain data + a few pure helpers. Every other module reads/writes THIS.

export const PRESSURES = ['mana', 'provisions', 'coin', 'lore', 'faith', 'flamesRegard', 'fracture'];
export const CULTS = ['red', 'yellow', 'brown', 'green', 'blue', 'purple', 'white'];

// NOTE: the Circle roster below is embedded for the Phase-1 slice. The canonical
// definitions live in content/circle/*.json; a later phase loads from there.
export function createInitialState(seed = 1) {
  return {
    turn: 0,
    season: 0,          // 0..3 (Thaw…Deepfrost)
    phase: 0,           // 0..2 within a season (Early/Mid/Late) — 12 sub-seasons per year
    year: 1,
    seed,
    rngState: seed >>> 0,
    pressures: { mana: 30, provisions: 50, coin: 35, lore: 40, faith: 50, flamesRegard: 35, fracture: 10 },
    cults: { red: 0, yellow: 0, brown: 0, green: 0, blue: 0, purple: 0, white: 0 },
    flags: {},
    circle: [
      { id: 'vela-the-blue', name: 'Vela', color: 'blue', leaning: 'lore', rank: 'advisor' },
      { id: 'korr-ashen', name: 'Korr Ashen', color: 'red', leaning: 'caution', rank: 'advisor' },
      { id: 'ember', name: 'Ember', color: 'yellow', leaning: 'flame', rank: 'apprentice' },
      { id: 'wisp', name: 'Wisp', color: 'white', leaning: 'flame', rank: 'apprentice' },
    ],
    souls: [],          // members lost to the Flame persist here as NPCs (permanent — see PLANNING §5a)
    saga: [],           // the running history log
    scenesSeen: {},     // id -> count (for `once`)
    followups: [],      // queued scene ids (from `unlock` effects)
    actionsUsed: [],    // per-screen action ids performed this season (reset each tick)
  };
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

// Path resolution shared by conditions + effects. Keeps content's vocabulary tiny.
export function getPath(state, path) {
  if (path.startsWith('cult.')) return state.cults[path.slice(5)];
  if (path in state.pressures) return state.pressures[path];
  if (path === 'turn') return state.turn;
  if (path === 'year') return state.year;
  return undefined;
}
