// main.js — the UI controller. Wires the (renderer-agnostic) engine to the view,
// loads content, drives the app shell (splash → menu → game) and the in-game
// turn flow, manages save slots + settings, and autosaves to localStorage.
//
// APP-LEVEL UI STATE LIVES HERE, NEVER IN THE ENGINE. `screen`/`overlay`/
// `settings` are presentation concerns; the GameState model knows nothing of them.
import { createInitialState } from './engine/state.js';
import { meets } from './engine/conditions.js';
import { pickScene } from './engine/selector.js';
import { advanceTime, applyChoice, checkEnd } from './engine/loop.js';
import { applyEffects } from './engine/effects.js';
import { serialize, deserialize } from './engine/save.js';
import { render } from './ui/view.js';

const AUTOSAVE_KEY = 'kotsf-save-v1';   // the single continuous campaign
const MANUAL_KEY = 'kotsf-manual-v1';   // the one manual bookmark slot
const SETTINGS_KEY = 'kotsf-settings-v1';
const app = document.getElementById('app');

// content (loaded once)
let scenes = [];
let defs = {};                 // circle id -> definition (name, color, bio)
let codex = [];                // wiki/codex categories
let actions = [];              // per-screen actions (Workings, Fields, …): requires + effects

// app-shell UI state
let screen = 'splash';         // 'splash' | 'menu' | 'game'
let overlay = null;            // null | 'options' | 'codex' | 'saves'
let gameView = 'scene';        // which stage screen is shown (scene | saga | coven | ...)
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
  return { textSize: s.textSize || 'm', reduceMotion: !!s.reduceMotion, autosave: s.autosave !== false };
}
function applySettings() {
  const r = document.documentElement;
  r.dataset.textSize = settings.textSize;
  r.dataset.reduceMotion = settings.reduceMotion ? '1' : '0';
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
  applyEffects(state, a.effects);
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
    screen, overlay, gameView, settings, codex, actions, yearRecap, codexTab, codexQuery, optionsTab, inGame: !!state,
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

app.addEventListener('click', (e) => {
  const el = e.target.closest('[data-action]');
  if (!el) return;
  switch (el.dataset.action) {
    // in-game play
    case 'choose': choose(el.dataset.choice); break;
    case 'continue': proceed(); break;
    case 'new-run': startGame(); break;
    // shell navigation
    case 'enter': screen = 'menu'; draw(); break;
    case 'go-menu': overlay = null; screen = 'menu'; draw(); break;
    case 'game-view': gameView = el.dataset.view; draw(); break;
    case 'runes-scroll': scrollRunes(Number(el.dataset.dir)); break;
    case 'do-action': doAction(el.dataset.act); break;
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
  const bundle = await (await fetch('/content/bundle.json')).json();
  scenes = bundle.scenes;
  defs = Object.fromEntries(bundle.circle.map((c) => [c.id, c]));
  codex = bundle.codex || [];
  actions = bundle.actions || [];
  applySettings();
  screen = 'splash'; overlay = null;
  draw();
})();
