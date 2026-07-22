// main.js — the UI controller. Wires the (renderer-agnostic) engine to the view,
// loads content, drives the app shell (splash → menu → game) and the in-game
// turn flow, manages save slots + settings, and autosaves to localStorage.
//
// APP-LEVEL UI STATE LIVES HERE, NEVER IN THE ENGINE. `screen`/`overlay`/
// `settings` are presentation concerns; the GameState model knows nothing of them.
import { createInitialState, castMember, workingScore, chronicle, shuffle } from './engine/state.js';
import { meets } from './engine/conditions.js';
import { pickScene } from './engine/selector.js';
import { advanceTime, applyChoice, checkEnd } from './engine/loop.js';
import { applyEffects } from './engine/effects.js';
import { registerExpeditions, dueExpedition, expeditionScene, nameReturningSoul, startExpedition, eligibleParty } from './engine/expeditions.js';
import { resolveContest } from './engine/resolver.js';
import { serialize, deserialize } from './engine/save.js';
import { render } from './ui/view.js';

const APP_VERSION = 'v35';              // shell build — KEEP IN SYNC with sw.js CACHE ('kotsf-vN')
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
let creationDefs = [];         // new-coven creation wizard steps (from bundle)
let rolesDefs = [];            // advisor task/role definitions (from bundle)
let expeditionDefs = [];       // long-running quest templates (from bundle)

// app-shell UI state
let screen = 'splash';         // 'splash' | 'menu' | 'create' | 'game'
let creation = null;           // in-progress new-coven wizard: { step, choices:{stepId:optId} }
let overlay = null;            // null | 'options' | 'codex' | 'saves'
let gameView = 'scene';        // which stage screen is shown (scene | saga | coven | ...)
let sagaPage = null;           // Saga screen: which year page (0 = The Founding; null = latest)
let hearthMenuOpen = false;    // the in-game hamburger dropdown (Options/Save/Menu)
let pinnedCard = null;         // index of an advisor card tapped open (tap again to close)
let casterId = null;           // Workings screen: chosen caster (null → default second-in-command)
let selectedMember = null;     // Coven screen: advisor whose full sheet is open (null → roster)
let pendingRole = null;        // { member, role, from }: a task reassignment awaiting confirmation
let partyPicker = null;        // { tmpl, size, picked:[ids] }: choosing who goes on an offered expedition
let cardsOpen = false;         // card bar raised (tuck mode): tap the tucked hand to lift it
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
  return { textSize: s.textSize || 'm', reduceMotion: !!s.reduceMotion, autosave: s.autosave !== false, revealMeters: !!s.revealMeters, footerPortraits: s.footerPortraits !== false, tuckCards: s.tuckCards !== false, layout: s.layout === 'b' ? 'b' : 'a' };
}
function applySettings() {
  const r = document.documentElement;
  r.dataset.textSize = settings.textSize;
  r.dataset.reduceMotion = settings.reduceMotion ? '1' : '0';
}
// Enter fullscreen, then lock to landscape. The Screen Orientation API's lock()
// only works in fullscreen — that's the piece the manifest alone can't do in a
// browser tab. MUST be called from a user gesture. Both steps are best-effort:
// denied on iOS / older browsers, which is fine (manifest still covers installed).
async function goFullscreenLandscape() {
  const el = document.documentElement;
  try {
    if (!document.fullscreenElement) {
      if (el.requestFullscreen) await el.requestFullscreen({ navigationUI: 'hide' });
      else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
    }
  } catch { /* fullscreen denied — carry on */ }
  try {
    const lock = screen.orientation && screen.orientation.lock;
    if (lock) await screen.orientation.lock('landscape');
  } catch { /* orientation lock unsupported — carry on */ }
}

// The full-screen wizard/menu screens scroll the window; snap to the top after
// a step change so the new question starts from its title, not mid-scroll.
function scrollTop() { try { window.scrollTo(0, 0); } catch { /* non-DOM env */ } }

function setOption(key, val) {
  if (key === 'textSize' || key === 'layout') settings[key] = val;   // string-valued options
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
    advanceTime(state, rolesDefs);
    end = checkEnd(state);
    if (end) { phase = 'end'; current = null; return; }
    if (state.year !== prevYear) { openYearRecap(prevYear); return; }  // pause at year's end
    // A party come due this season interrupts the normal pool with its beat.
    const exp = dueExpedition(state);
    if (exp) { state._activeExp = exp.id; current = expeditionScene(state, exp); phase = 'scene'; return; }
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

// New coven → the creation wizard. Roll the Circle now (so it can be shown/tailored);
// choice effects are applied only when the saga begins, so Back is safe.
function beginCreation() {
  goFullscreenLandscape();
  state = createInitialState(Date.now() & 0xffffffff);
  end = null; lastOutcome = null; current = null; yearRecap = null;
  casterId = null; selectedMember = null; cardsOpen = false; gameView = 'scene';
  creation = { step: 0, choices: {}, plan: buildCreationPlan() };
  overlay = null; screen = 'create';
  draw();
}
// Assemble this playthrough's wizard: the fixed steps, with two questions drawn at
// random from the pool inserted right after 'deed', and each choice narrowed to a
// random `pick` of its options — so answers and questions vary game to game. Uses
// the campaign's seeded RNG (a fresh Date.now seed per coven), keeping it reproducible.
function buildCreationPlan() {
  const steps = creationDefs.steps || [];
  const pool = creationDefs.pool || [];
  const drawn = shuffle(state, pool.slice()).slice(0, 2);
  const narrow = (s) => {
    if (s.kind !== 'choice' || !s.pick || !s.options || s.options.length <= s.pick) return s;
    return { ...s, options: shuffle(state, s.options.slice()).slice(0, s.pick) };
  };
  const plan = [];
  for (const s of steps) {
    plan.push(narrow(s));
    if (s.id === 'deed') for (const p of drawn) plan.push(narrow(p));
  }
  return plan;
}
// Apply each chosen option's effects, record the founding into the Saga (in step
// order, under "The Founding"), snapshot the year, then into the first scene.
function finishCreation() {
  state.saga.push('[The Founding] The Ember passes to a new Archon, and Runehold\'s hearth-rune is kept alight.');
  for (const step of (creation.plan || [])) {
    const opt = (step.options || []).find((o) => o.id === creation.choices[step.id]);
    if (!opt) continue;
    if (opt.effects) applyEffects(state, opt.effects);
    if (opt.saga) state.saga.push(`[The Founding] ${opt.saga}`);
  }
  creation = null;
  yearOpenPressures = { ...state.pressures };
  screen = 'game'; phase = 'scene';
  advanceToScene();
  draw();
}

function choose(id) {
  const ch = current?.choices.find((c) => c.id === id);
  if (!ch || !meets(state, ch.requires)) return;
  if (current._exp) state._activeExp = current._exp;   // bind expedition_* effects to this instance
  const outcome = applyChoice(state, current, ch);
  lastOutcome = ch[outcome] || ch.win;
  delete state._activeExp;
  end = checkEnd(state);
  phase = 'outcome';
  draw();
}

// A returning Soul is named. Resolve the guess (blessing if right, a wound if wrong),
// finalise the expedition, and show the truth as the outcome.
function nameSoul(guess) {
  if (!current?._exp) return;
  const exp = (state.expeditions || []).find((e) => e.id === current._exp);
  if (!exp) return;
  const r = nameReturningSoul(state, exp, guess);
  const who = r.name ? r.name : 'no Wizard you had lost — a nameless Soul';
  if (r.correct) {
    applyEffects(state, [{ add: ['faith', 6] }, { add: ['flamesRegard', 6] }]);
    chronicle(state, r.name
      ? `You named the returning Soul true: ${r.name}, come back to you. Naming it was a grace, and the hearth burned warmer for it.`
      : `You saw the returning Soul for what it was — nameless, and one of your own no longer. There is a cold mercy in being right.`);
    lastOutcome = { text: `You named it true. It was ${who}. A grace passes between you, and the coven takes heart.` };
  } else {
    applyEffects(state, [{ add: ['faith', -5] }, { add: ['fracture', 4] }]);
    chronicle(state, `You named the returning Soul wrongly. It was ${who}. The mistake sits ill with the Circle.`);
    lastOutcome = { text: `You named it wrongly. It was ${who}. The Circle looks at you differently now.` };
  }
  delete state._activeExp;
  end = checkEnd(state);
  phase = 'outcome';
  draw();
}

function proceed() {
  if (end) { phase = 'end'; draw(); return; }
  // A quest was accepted this scene → raise the party-picker before time moves on.
  if (state && state._pendingExpedition) {
    partyPicker = { tmpl: state._pendingExpedition.tmpl, size: state._pendingExpedition.size, picked: [] };
    delete state._pendingExpedition;
    draw();
    return;
  }
  advanceToScene();
  draw();
}

// ---- the expedition party picker ------------------------------------------
function togglePartyPick(id) {
  if (!partyPicker) return;
  const i = partyPicker.picked.indexOf(id);
  if (i >= 0) partyPicker.picked.splice(i, 1);
  else if (partyPicker.picked.length < partyPicker.size) partyPicker.picked.push(id);
  draw();
}
function confirmParty() {
  if (!partyPicker || partyPicker.picked.length !== partyPicker.size) return;
  startExpedition(state, { tmpl: partyPicker.tmpl, partyIds: partyPicker.picked });
  partyPicker = null;
  advanceToScene();
  draw();
}
function cancelParty() {           // changed your mind — no one goes
  if (state) chronicle(state, 'You weighed the road and, in the end, sent no one.');
  partyPicker = null;
  advanceToScene();
  draw();
}

// ---- shell navigation + saves ---------------------------------------------
function startGame() { beginCreation(); }   // "New Coven" enters the creation wizard

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
    chronicle(state, `${caster ? caster.name : 'The coven'} cast ${a.label} — ${outcome === 'win' ? 'and it held' : 'and it faltered'}.${line ? ' ' + line : ''}`);
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
    screen, overlay, gameView, hearthMenuOpen, pinnedCard, casterId, selectedMember, cardsOpen, creation, creationDefs, rolesDefs, expeditionDefs, pendingRole, partyPicker, sagaPage, settings, codex, actions, counsel, portraits, yearRecap, codexTab, codexQuery, optionsTab, appVersion: APP_VERSION, inGame: !!state,
    saves: { auto: metaOf(readSlot(AUTOSAVE_KEY)), manual: metaOf(readSlot(MANUAL_KEY)) },
    state, defs, phase, current, lastOutcome, end,
  };
}

function persist() {
  if (state && settings.autosave && screen !== 'create') writeSlot(AUTOSAVE_KEY, envelope());   // don't autosave an un-started coven
}

function draw() {
  const runesEl0 = app.querySelector('.runes');                       // survive the innerHTML swap
  const runesScrollL = runesEl0?.scrollLeft ?? 0;
  const runesScrollT = runesEl0?.scrollTop ?? 0;
  const advScrollT = app.querySelector('.lb-adv-scroll')?.scrollTop ?? 0;   // keep the advisor rail put across redraws
  const layoutB = screen === 'game' && settings.layout === 'b';
  app.className = `screen-${screen}${layoutB ? ' layout-b' : ''}${overlay ? ' has-overlay' : ''}`;
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
    runes.scrollLeft = runesScrollL; runes.scrollTop = runesScrollT;   // one axis is always 0
    runes.addEventListener('scroll', updateRuneArrows, { passive: true });
    updateRuneArrows();
  }
  const advScroll = app.querySelector('.lb-adv-scroll');   // restore native scroll pos + wire arrows
  if (advScroll) {
    advScroll.scrollTop = advScrollT;
    advScroll.addEventListener('scroll', updateAdvArrows, { passive: true });
    updateAdvArrows();
  }
  // tab/tile heights can grow once icons + fonts finish laying out — re-measure next frame
  requestAnimationFrame(() => { updateRuneArrows(); if (screen === 'game' && settings.layout === 'b') updateAdvArrows(); });
  persist();
}

// The rune tab bar flexes into the width between the hearth id and the actions;
// these page it and light the arrows only when there's more to reveal that way.
function scrollRunes(dir) {
  const nav = app.querySelector('.runes');
  if (!nav) return;
  const vert = nav.closest('.runes-wrap')?.classList.contains('vertical');
  const opts = { behavior: settings.reduceMotion ? 'auto' : 'smooth' };
  if (vert) nav.scrollBy({ top: dir * nav.clientHeight * 0.75, ...opts });
  else nav.scrollBy({ left: dir * nav.clientWidth * 0.75, ...opts });
}
// Layout B advisor rail: NATIVE vertical scroll (touch + momentum). The tapped
// advisor's counsel shows in a fixed bottom dock, so nothing overflows sideways and
// the scroller can clip cleanly. Arrows just nudge the native scroll.
function scrollAdvisors(dir) {
  const el = app.querySelector('.lb-adv-scroll');
  if (!el) return;
  el.scrollBy({ top: dir * el.clientHeight * 0.7, behavior: settings.reduceMotion ? 'auto' : 'smooth' });
}
function updateAdvArrows() {
  const rail = app.querySelector('.lb-advisors');
  const el = app.querySelector('.lb-adv-scroll');
  if (!rail || !el) return;
  const max = el.scrollHeight - el.clientHeight;
  rail.querySelector('.lb-adv-arrow.up')?.classList.toggle('can', el.scrollTop > 1);
  rail.querySelector('.lb-adv-arrow.down')?.classList.toggle('can', el.scrollTop < max - 1);
}
function updateRuneArrows() {
  const wrap = app.querySelector('.runes-wrap');
  if (!wrap) return;
  const nav = wrap.querySelector('.runes');
  const vert = wrap.classList.contains('vertical');
  const [pos, size, client] = vert
    ? [nav.scrollTop, nav.scrollHeight, nav.clientHeight]
    : [nav.scrollLeft, nav.scrollWidth, nav.clientWidth];
  const overflow = size - client > 1;
  wrap.classList.toggle('has-overflow', overflow);
  wrap.querySelector('.runes-arrow.prev')?.classList.toggle('can', overflow && pos > 1);
  wrap.querySelector('.runes-arrow.next')?.classList.toggle('can', overflow && pos < size - client - 1);
}
// on any viewport change, re-measure both rails' scroll-arrow affordances
function remeasureRails() { updateRuneArrows(); if (screen === 'game' && settings.layout === 'b') updateAdvArrows(); }
window.addEventListener('resize', remeasureRails);
// turning the device (portrait↔landscape) re-lays out via CSS; just re-measure rails
window.addEventListener('orientationchange', remeasureRails);
// leaving the app (to another app) drops fullscreen + the orientation lock; try to
// re-take them when we come back to the foreground (best-effort — some browsers need
// a fresh tap, which the next in-game touch provides).
document.addEventListener('visibilitychange', () => { if (!document.hidden && screen === 'game') goFullscreenLandscape(); });

app.addEventListener('click', (e) => {
  const el = e.target.closest('[data-action]');
  if (!el) {   // click-away closes the menu / unpins any open advisor card
    if (hearthMenuOpen || pinnedCard !== null) { hearthMenuOpen = false; pinnedCard = null; cardsOpen = false; draw(); }
    else if (cardsOpen) { cardsOpen = false; app.querySelector('.circle-bar')?.classList.remove('cb-open'); } // animate the hand back down
    return;
  }
  const action = el.dataset.action;
  if (hearthMenuOpen && action !== 'toggle-hearth-menu') hearthMenuOpen = false; // any selection closes the menu
  if (pinnedCard !== null && action !== 'toggle-card' && action !== 'toggle-hearth-menu') pinnedCard = null; // any other action unpins
  if (cardsOpen && action !== 'toggle-card') { cardsOpen = false; app.querySelector('.circle-bar')?.classList.remove('cb-open'); } // any other action lowers the hand
  switch (action) {
    // in-game play
    case 'choose': choose(el.dataset.choice); break;
    case 'name-soul': nameSoul(el.dataset.name); break;
    case 'pick-member': togglePartyPick(el.dataset.member); break;
    case 'confirm-party': confirmParty(); break;
    case 'cancel-party': cancelParty(); break;
    case 'continue': proceed(); break;
    case 'create-next': if (creation) { creation.step = Math.min(creation.plan.length - 1, creation.step + 1); draw(); scrollTop(); } break;
    case 'create-back': if (creation && creation.step > 0) { creation.step -= 1; draw(); scrollTop(); } break;
    case 'create-choose': {
      if (!creation) break;
      creation.choices[el.dataset.step] = el.dataset.opt;
      if (creation.step >= creation.plan.length - 1) finishCreation();
      else { creation.step += 1; draw(); scrollTop(); }
      break;
    }
    case 'create-quit': state = null; creation = null; overlay = null; screen = 'menu'; draw(); break;
    case 'new-run': startGame(); break;
    // shell navigation
    case 'enter': goFullscreenLandscape(); screen = 'menu'; draw(); break;
    case 'go-menu': overlay = null; screen = 'menu'; draw(); break;
    case 'game-view': gameView = el.dataset.view; selectedMember = null; if (gameView === 'saga') sagaPage = null; draw(); break;
    case 'view-member': gameView = 'coven'; selectedMember = el.dataset.member; draw(); break;
    case 'assign-role': {
      if (!state.roles) state.roles = {};
      const r = el.dataset.role;
      const mId = el.dataset.member;
      if (!r) { delete state.roles[mId]; draw(); break; }        // clearing never conflicts
      // A task has one owner: if someone else holds it, confirm the hand-off first.
      const holder = Object.keys(state.roles).find((id) => id !== mId && state.roles[id] === r);
      if (holder) { pendingRole = { member: mId, role: r, from: holder }; overlay = 'confirm-role'; draw(); break; }
      state.roles[mId] = r; draw();
      break;
    }
    case 'confirm-role-yes': {
      if (pendingRole) { if (!state.roles) state.roles = {}; delete state.roles[pendingRole.from]; state.roles[pendingRole.member] = pendingRole.role; }
      pendingRole = null; overlay = null; draw();
      break;
    }
    case 'close-member': selectedMember = null; draw(); break;
    case 'runes-scroll': scrollRunes(Number(el.dataset.dir)); break;
    case 'saga-page': {
      const years = [...new Set(state.saga.map((l) => { const m = l.match(/Y(\d+)\]/); return m ? Number(m[1]) : 0; }))].sort((a, b) => a - b);
      if (!years.length) break;
      let cur = sagaPage; if (cur == null || !years.includes(cur)) cur = years[years.length - 1];
      const i = years.indexOf(cur) + Number(el.dataset.dir);
      if (i >= 0 && i < years.length) { sagaPage = years[i]; draw(); }
      break;
    }
    case 'adv-scroll': scrollAdvisors(Number(el.dataset.dir)); break;
    case 'toggle-hearth-menu': {   // toggle the class on the LIVE node so the ☰→✕ + popover animate (a full redraw would skip the transition)
      hearthMenuOpen = !hearthMenuOpen;
      const hm = app.querySelector('.hearth-menu');
      if (hm) { hm.classList.toggle('open', hearthMenuOpen); hm.querySelector('.hamburger')?.setAttribute('aria-expanded', String(hearthMenuOpen)); }
      break;
    }
    case 'toggle-card': {
      if (settings.layout !== 'b' && settings.tuckCards && !cardsOpen) {   // tucked → first tap raises the hand (animate on the live node, no redraw)
        cardsOpen = true;
        app.querySelector('.circle-bar')?.classList.add('cb-open');
      } else {
        const i = Number(el.dataset.card);
        pinnedCard = pinnedCard === i ? null : i;
        draw();
      }
      break;
    }
    case 'do-action': doAction(el.dataset.act); break;
    case 'set-caster': casterId = el.dataset.caster; draw(); break;
    case 'resume-game': goFullscreenLandscape(); overlay = null; screen = 'game'; draw(); break;
    case 'start-game': confirmNewCoven(); break;
    case 'confirm-new-yes': startGame(); break;
    case 'open': overlay = el.dataset.overlay; if (overlay === 'codex') codexQuery = ''; draw(); break;
    case 'close': overlay = null; pendingRole = null; draw(); break;
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
    case 'confirm-save-yes': if (state) writeSlot(MANUAL_KEY, envelope()); overlay = null; draw(); break;
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
  creationDefs = bundle.creation || { steps: [], pool: [] };
  rolesDefs = bundle.roles || [];
  expeditionDefs = bundle.expeditions || [];
  registerExpeditions(expeditionDefs);             // hand the quest templates to the engine
  applySettings();
  screen = 'splash'; overlay = null;
  draw();
})();
