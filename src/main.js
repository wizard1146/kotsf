// main.js — the UI controller. Wires the (renderer-agnostic) engine to the view,
// loads content, drives the app shell (splash → menu → game) and the in-game
// turn flow, manages save slots + settings, and autosaves to localStorage.
//
// APP-LEVEL UI STATE LIVES HERE, NEVER IN THE ENGINE. `screen`/`overlay`/
// `settings` are presentation concerns; the GameState model knows nothing of them.
import { createInitialState, castMember, workingScore } from './engine/state.js';
import { meets } from './engine/conditions.js';
import { pickScene } from './engine/selector.js';
import { advanceTime, applyChoice, checkEnd } from './engine/loop.js';
import { applyEffects } from './engine/effects.js';
import { resolveContest } from './engine/resolver.js';
import { serialize, deserialize } from './engine/save.js';
import { render } from './ui/view.js';

const APP_VERSION = 'v15';              // shell build — KEEP IN SYNC with sw.js CACHE ('kotsf-vN')
const AUTOSAVE_KEY = 'kotsf-save-v1';   // the single continuous campaign
const MANUAL_KEY = 'kotsf-manual-v1';   // the one manual bookmark slot
const SETTINGS_KEY = 'kotsf-settings-v1';
const app = document.getElementById('app');

// content (loaded once)
let scenes = [];
let defs = {};                 // circle id -> definition (name, color, bio)
let codex = [];                // wiki/codex categories
let actions = [];              // per-screen actions (Workings, Fields, …): requires + effects
let counsel = {};              // screen id -> ambient advisor line pool (footer counsel off-scene)
let portraits = [];            // member portrait filenames (assets/portraits/*.webp)

// app-shell UI state
let screen = 'splash';         // 'splash' | 'menu' | 'game'
let overlay = null;            // null | 'options' | 'codex' | 'saves'
let gameView = 'scene';        // which stage screen is shown (scene | saga | coven | ...)
let hearthMenuOpen = false;    // the in-game hamburger dropdown (Options/Save/Menu)
let pinnedCard = null;         // index of an advisor card tapped open (tap again to close)
let casterId = null;           // Workings screen: chosen caster (null → default second-in-command)
let selectedMember = null;     // Coven screen: advisor whose full sheet is open (null → roster)
let codexTab = null;           // active codex category id (view falls back to first)
let codexQuery = '';           // codex search text
let optionsTab = 'display';    // active options section
let restoreSearchFocus = false; // re-focus the codex search box after a re-render
let codexTarget = null;        // DOM id of a codex entry to scroll to after render
let settings = loadSettings();

// game (in-memory campaign) state
let state = null;
let current = null;            // the scene being presented
let phase = 'scene';           // 'scene' | 'outcome' | 'recap' | 'end'
let lastOutcome = null;
let end = null;
let yearRecap = null;          // end-of-year Runehold recap payload
let yearOpenPressures = null;  // pressure snapshot at the start of the current year

// ---- storage helpers ------------------------------------------------------
function writeSlot(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage unavailable — non-fatal */ }
}
function readSlot(key) {
  try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : null; } catch { return null; }
}
function stamp() {
  try { return new Date().toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }); }
  catch { return ''; }
}
function envelope() {
  return {
    save: serialize(state), currentId: current?.id ?? null, phase, end,
    meta: { year: state.year, season: state.season, savedAt: stamp() },
  };
}
// metadata for the saves overlay, tolerant of older meta-less envelopes
function metaOf(env) {
  if (!env) return null;
  if (env.meta) return env.meta;
  try { const st = deserialize(env.save); return { year: st.year, season: st.season }; }
  catch { return { year: '?', season: 0 }; }
}

// ---- settings -------------------------------------------------------------
function loadSettings() {
  const s = readSlot(SETTINGS_KEY) || {};
  return { textSize: s.textSize || 'm', reduceMotion: !!s.reduceMotion, autosave: s.autosave !== false, lockLandscape: s.lockLandscape !== false, landscapeFlip: !!s.landscapeFlip, revealMeters: !!s.revealMeters, footerPortraits: s.footerPortraits !== false };
}
function applySettings() {
  const r = document.documentElement;
  r.dataset.textSize = settings.textSize;
  r.dataset.reduceMotion = settings.reduceMotion ? '1' : '0';
  applyOrientation();
}

// Force landscape by PINNING to a single side. Media queries can't tell the two
// landscape sub-orientations apart (why it flipped upside-down on your side), so we
// read the real physical orientation in JS and set data-rotate = the CSS rotation
// (0/90/180/270) that lands the app on the chosen side. `landscapeFlip` picks the
// other side. When the lock is off we never rotate (data-rotate="0").
function physicalOrientation() {
  const t = (typeof screen !== 'undefined' && screen.orientation && screen.orientation.type) || '';
  if (t) return t;                                   // 'landscape-primary' etc. (most browsers)
  const wo = typeof window.orientation === 'number' ? window.orientation : null;  // iOS Safari fallback
  if (wo === 0) return 'portrait-primary';
  if (wo === 180) return 'portrait-secondary';
  if (wo === 90) return 'landscape-primary';
  if (wo === -90 || wo === 270) return 'landscape-secondary';
  return window.matchMedia('(orientation: landscape)').matches ? 'landscape-primary' : 'portrait-primary';
}
// rotation (deg) that maps each physical orientation onto our default landscape side
const ORIENT_BASE = { 'landscape-primary': 0, 'landscape-secondary': 180, 'portrait-primary': 90, 'portrait-secondary': 270 };
function applyOrientation() {
  let rot = 0;
  if (settings.lockLandscape) {
    rot = ORIENT_BASE[physicalOrientation()] ?? 0;
    if (settings.landscapeFlip) rot = (rot + 180) % 360;   // pin to the other landscape side
  }
  document.documentElement.dataset.rotate = String(rot);
}
function setOption(key, val) {
  if (key === 'textSize') settings.textSize = val;
  else settings[key] = val === '1';
  writeSlot(SETTINGS_KEY, settings);
  applySettings();
  draw();
}

// ---- the in-game turn flow ------------------------------------------------
// Advance time until a scene becomes eligible (or the game ends). Each presented
// scene is one season; quiet seasons just tick by.
function advanceToScene() {
  for (let i = 0; i < 16; i++) {
    const prevYear = state.year;
    advanceTime(state);
    end = checkEnd(state);
    if (end) { phase = 'end'; current = null; return; }
    if (state.year !== prevYear) { openYearRecap(prevYear); return; }  // pause at year's end
    const s = pickScene(state, scenes);
    if (s) { current = s; phase = 'scene'; return; }
  }
  current = null; phase = 'scene';
}

// The Tula-style year recap: capture how the year moved the coven, then pause.
function openYearRecap(year) {
  const deltas = {};
  for (const k in state.pressures) deltas[k] = state.pressures[k] - (yearOpenPressures?.[k] ?? state.pressures[k]);
  yearRecap = { year, deltas, beats: state.saga.filter((l) => l.includes(`Y${year}]`)) };
  yearOpenPressures = { ...state.pressures };
  phase = 'recap'; current = null; gameView = 'scene';
}

function newRun(seed) {
  state = createInitialState(seed ?? (Date.now() & 0xffffffff));
  end = null; lastOutcome = null; current = null; yearRecap = null;
  casterId = null; selectedMember = null;   // fresh coven — clear per-Circle UI selections
  yearOpenPressures = { ...state.pressures };
  advanceToScene();
  draw();
}

function choose(id) {
  const ch = current?.choices.find((c) => c.id === id);
  if (!ch || !meets(state, ch.requires)) return;
  const outcome = applyChoice(state, current, ch);
  lastOutcome = ch[outcome] || ch.win;
  end = checkEnd(state);
  phase = 'outcome';
  draw();
}

function proceed() {
  if (end) { phase = 'end'; draw(); return; }
  advanceToScene();
  draw();
}

// ---- shell navigation + saves ---------------------------------------------
function startGame() { overlay = null; screen = 'game'; gameView = 'scene'; newRun(); }

// New Coven overwrites the single continuous campaign — confirm first if one exists.
function confirmNewCoven() {
  if (state || readSlot(AUTOSAVE_KEY)) { overlay = 'confirm-new'; draw(); }
  else startGame();
}

// Perform a per-screen action: apply its effects (cost included), once per season.
function doAction(id) {
  if (!state) return;
  const a = actions.find((x) => x.id === id);
  if (!a) return;
  if (!state.actionsUsed) state.actionsUsed = [];
  if (state.actionsUsed.includes(id) || !meets(state, a.requires)) return;
  if (a.cast) {
    // a caster-cast working: the chosen caster (default 2iC) contests the difficulty.
    // Win/lose branches differ; either way the mana is spent and the school is practised.
    const caster = (casterId && state.circle.find((m) => m.id === casterId)) || castMember(state, 'second');
    const outcome = resolveContest(state, workingScore(state, a, caster), a.cast.vs);
    applyEffects(state, (a[outcome] || {}).effects || []);
    if (a.school) applyEffects(state, [{ adjust_mastery: [a.school, outcome === 'win' ? 4 : 2] }]);
    const line = (a[outcome] || {}).text;
    state.saga.push(`${caster ? caster.name : 'The coven'} cast ${a.label} — ${outcome === 'win' ? 'and it held' : 'and it faltered'}.${line ? ' ' + line : ''}`);
  } else {
    applyEffects(state, a.effects);
  }
  state.actionsUsed.push(id);
  end = checkEnd(state);
  if (end) { phase = 'end'; gameView = 'scene'; }   // an action can win (Regard) or surface a loss
  draw();
}

function restore(slot) {
  const env = readSlot(slot === 'auto' ? AUTOSAVE_KEY : MANUAL_KEY);
  if (!env) return;
  state = deserialize(env.save);
  yearOpenPressures = { ...state.pressures };
  end = env.end ?? null;
  current = env.currentId ? scenes.find((s) => s.id === env.currentId) : null;
  lastOutcome = null;
  phase = end ? 'end' : 'scene';
  if (!current && !end) advanceToScene();
  overlay = null; screen = 'game'; gameView = 'scene';
  draw();
}

function saveManual(btn) {
  if (!state) return;
  writeSlot(MANUAL_KEY, envelope());
  if (overlay === 'saves') { draw(); return; }   // refresh the slot list
  if (btn) { const t = btn.textContent; btn.textContent = 'Saved'; setTimeout(() => { btn.textContent = t; }, 900); }
}

function deleteManual() { try { localStorage.removeItem(MANUAL_KEY); } catch { /* noop */ } draw(); }

// Force the PWA onto the latest shell: drop the service-worker caches and re-register,
// then hard-reload. Saves live in localStorage and are left untouched.
async function forceUpdate(el) {
  if (el) { el.textContent = 'Updating…'; el.disabled = true; }
  try {
    if (window.caches) { const keys = await caches.keys(); await Promise.all(keys.map((k) => caches.delete(k))); }
    if ('serviceWorker' in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map((r) => r.unregister().catch(() => {})));
    }
  } catch { /* best-effort — reload anyway */ }
  location.reload();
}

function clearData() {
  if (!window.confirm('Clear all saved campaigns and settings? This cannot be undone.')) return;
  try { [AUTOSAVE_KEY, MANUAL_KEY, SETTINGS_KEY].forEach((k) => localStorage.removeItem(k)); } catch { /* noop */ }
  state = null; current = null; end = null; lastOutcome = null;
  settings = loadSettings(); applySettings();
  overlay = null; screen = 'menu';
  draw();
}

// ---- render ----------------------------------------------------------------
function ctx() {
  return {
    screen, overlay, gameView, hearthMenuOpen, pinnedCard, casterId, selectedMember, settings, codex, actions, counsel, portraits, yearRecap, codexTab, codexQuery, optionsTab, appVersion: APP_VERSION, inGame: !!state,
    saves: { auto: metaOf(readSlot(AUTOSAVE_KEY)), manual: metaOf(readSlot(MANUAL_KEY)) },
    state, defs, phase, current, lastOutcome, end,
  };
}

function persist() {
  if (state && settings.autosave) writeSlot(AUTOSAVE_KEY, envelope());
}

function draw() {
  const runesScroll = app.querySelector('.runes')?.scrollLeft ?? 0;   // survive the innerHTML swap
  app.className = `screen-${screen}${overlay ? ' has-overlay' : ''}`;
  app.innerHTML = render(ctx());
  // innerHTML replacement drops focus; hand it back to the search box mid-type
  if (restoreSearchFocus) {
    const si = app.querySelector('.panel-search input');
    if (si) { si.focus(); const n = si.value.length; si.setSelectionRange(n, n); }
    restoreSearchFocus = false;
  }
  // scroll a just-navigated codex entry into view and flash it
  if (codexTarget) {
    const el = document.getElementById(codexTarget);
    if (el) {
      el.scrollIntoView({ block: 'center', behavior: settings.reduceMotion ? 'auto' : 'smooth' });
      el.classList.add('codex-flash');
    }
    codexTarget = null;
  }
  // rune tab bar: restore prior scroll (no snap on nav), wire scroll listener + arrow affordances
  const runes = app.querySelector('.runes');
  if (runes) {
    runes.scrollLeft = runesScroll;
    runes.addEventListener('scroll', updateRuneArrows, { passive: true });
    updateRuneArrows();
  }
  persist();
}

// The rune tab bar flexes into the width between the hearth id and the actions;
// these page it and light the arrows only when there's more to reveal that way.
function scrollRunes(dir) {
  const nav = app.querySelector('.runes');
  if (!nav) return;
  nav.scrollBy({ left: dir * nav.clientWidth * 0.75, behavior: settings.reduceMotion ? 'auto' : 'smooth' });
}
function updateRuneArrows() {
  const wrap = app.querySelector('.runes-wrap');
  if (!wrap) return;
  const nav = wrap.querySelector('.runes');
  const overflow = nav.scrollWidth - nav.clientWidth > 1;
  wrap.classList.toggle('has-overflow', overflow);
  const atStart = nav.scrollLeft <= 1;
  const atEnd = nav.scrollLeft >= nav.scrollWidth - nav.clientWidth - 1;
  wrap.querySelector('.runes-arrow.prev')?.classList.toggle('can', overflow && !atStart);
  wrap.querySelector('.runes-arrow.next')?.classList.toggle('can', overflow && !atEnd);
}
window.addEventListener('resize', updateRuneArrows);
// re-pin the landscape side whenever the device is physically turned
function onOrientationChange() { applyOrientation(); updateRuneArrows(); }
window.addEventListener('orientationchange', onOrientationChange);
window.addEventListener('resize', applyOrientation);
if (typeof screen !== 'undefined' && screen.orientation && screen.orientation.addEventListener) {
  screen.orientation.addEventListener('change', onOrientationChange);
}

app.addEventListener('click', (e) => {
  const el = e.target.closest('[data-action]');
  if (!el) {   // click-away closes the menu / unpins any open advisor card
    if (hearthMenuOpen || pinnedCard !== null) { hearthMenuOpen = false; pinnedCard = null; draw(); }
    return;
  }
  const action = el.dataset.action;
  if (hearthMenuOpen && action !== 'toggle-hearth-menu') hearthMenuOpen = false; // any selection closes the menu
  if (pinnedCard !== null && action !== 'toggle-card' && action !== 'toggle-hearth-menu') pinnedCard = null; // any other action unpins
  switch (action) {
    // in-game play
    case 'choose': choose(el.dataset.choice); break;
    case 'continue': proceed(); break;
    case 'new-run': startGame(); break;
    // shell navigation
    case 'enter': screen = 'menu'; draw(); break;
    case 'go-menu': overlay = null; screen = 'menu'; draw(); break;
    case 'game-view': gameView = el.dataset.view; selectedMember = null; draw(); break;
    case 'view-member': gameView = 'coven'; selectedMember = el.dataset.member; draw(); break;
    case 'close-member': selectedMember = null; draw(); break;
    case 'runes-scroll': scrollRunes(Number(el.dataset.dir)); break;
    case 'toggle-hearth-menu': {   // toggle the class on the LIVE node so the ☰→✕ + popover animate (a full redraw would skip the transition)
      hearthMenuOpen = !hearthMenuOpen;
      const hm = app.querySelector('.hearth-menu');
      if (hm) { hm.classList.toggle('open', hearthMenuOpen); hm.querySelector('.hamburger')?.setAttribute('aria-expanded', String(hearthMenuOpen)); }
      break;
    }
    case 'toggle-card': { const i = Number(el.dataset.card); pinnedCard = pinnedCard === i ? null : i; draw(); break; }
    case 'do-action': doAction(el.dataset.act); break;
    case 'set-caster': casterId = el.dataset.caster; draw(); break;
    case 'resume-game': overlay = null; screen = 'game'; draw(); break;
    case 'start-game': confirmNewCoven(); break;
    case 'confirm-new-yes': startGame(); break;
    case 'open': overlay = el.dataset.overlay; if (overlay === 'codex') codexQuery = ''; draw(); break;
    case 'close': overlay = null; draw(); break;
    case 'codex-tab': codexTab = el.dataset.tab; codexQuery = ''; draw(); break;
    case 'codex-goto':
      codexTab = el.dataset.tab; codexQuery = '';
      codexTarget = `codex-${el.dataset.tab}-${el.dataset.entry}`;
      draw();
      break;
    case 'options-tab': optionsTab = el.dataset.tab; draw(); break;
    // saves
    case 'restore': restore(el.dataset.slot); break;
    case 'save-manual': saveManual(el); break;
    case 'delete-manual': deleteManual(); break;
    // options
    case 'set-option': setOption(el.dataset.key, el.dataset.val); break;
    case 'force-update': forceUpdate(el); break;
    case 'clear-data': clearData(); break;
  }
});

// live codex search — re-render filters results; draw() restores caret focus
app.addEventListener('input', (e) => {
  if (e.target.matches('.panel-search input')) {
    codexQuery = e.target.value;
    restoreSearchFocus = true;
    draw();
  }
});

// Escape: clear an active codex search first, otherwise close the overlay
window.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape' || !overlay) return;
  if (overlay === 'codex' && codexQuery) { codexQuery = ''; restoreSearchFocus = true; draw(); }
  else { overlay = null; draw(); }
});

(async function boot() {
  const bundle = await (await fetch('content/bundle.json')).json();
  scenes = bundle.scenes;
  defs = Object.fromEntries(bundle.circle.map((c) => [c.id, c]));
  codex = bundle.codex || [];
  actions = bundle.actions || [];
  counsel = bundle.counsel || {};
  portraits = bundle.portraits || [];
  applySettings();
  screen = 'splash'; overlay = null;
  draw();
})();
