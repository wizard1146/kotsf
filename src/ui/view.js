// view.js — pure rendering. Turns the game state into HTML. The swappable layer:
// the engine never imports this; this imports only read-only engine helpers.
import { meets } from '../engine/conditions.js';
import { seasonName, timeName, CULTS, castMember, castText, workingOdds, ageVariant } from '../engine/state.js';

const P_LABELS = {
  mana: 'Mana', provisions: 'Provisions', coin: 'Coin', lore: 'Lore',
  faith: 'Faith', flamesRegard: "Flame's Regard", fracture: 'Fracture',
};
const P_ORDER = ['mana', 'provisions', 'coin', 'lore', 'faith', 'flamesRegard', 'fracture'];
const CULT_HEX = {
  red: '#c0392b', yellow: '#d4ac0d', brown: '#8a5a1f', green: '#229954',
  blue: '#2471a3', purple: '#7d3c98', white: '#d5d8dc',
};
const END_COPY = {
  'victory:keeper-of-the-sacred-flame': ['Keeper of the Sacred Flame', 'The Tower opens to you. The Flame burns at your word now — and remembers your name when all else is forgotten.'],
  'defeat:the-coven-is-empty': ['The Coven is Empty', 'One by one they were taken or they left. Runehold stands silent, its hearth-rune cold.'],
  'defeat:the-coven-has-lost-faith': ['Faith Has Failed', 'They no longer believe you can lead them through the dark. They scatter to other holds, and your name goes unspoken.'],
  'defeat:famine': ['The Last Hungry Season', 'The stores ran dry before the harvest. A coven cannot eat runes.'],
  'defeat:the-fracture-consumes-all': ['The Fracture Consumes All', 'The wound in the world widened faster than you could mend it. The ash takes Runehold last of all.'],
};

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const cap = (s) => (s ? String(s)[0].toUpperCase() + String(s).slice(1) : '');

function reqHint(req) {
  if (!req) return 'unavailable';
  if (req.gte) return `needs ${P_LABELS[req.gte[0]] || req.gte[0]} ${req.gte[1]}+`;
  return 'unavailable';
}

function pressuresHTML(state) {
  return P_ORDER.map((k) => {
    const v = state.pressures[k];
    return `<div class="stat">
      <div class="stat-row"><span>${P_LABELS[k]}</span><span>${v}</span></div>
      <div class="bar ${k === 'fracture' ? 'bar-danger' : ''}"><div class="bar-fill" style="width:${v}%"></div></div>
    </div>`;
  }).join('');
}

function cultsHTML(state) {
  return `<div class="cults">${CULTS.map((c) =>
    `<span class="cult" title="${c}"><i style="background:${CULT_HEX[c]}"></i>${state.cults[c]}</span>`).join('')}</div>`;
}

// Cast a scene's advisor lines onto YOUR rolled Circle — a member fills each role
// ("shape, not name"), each cast at most once per scene; a line with no match is
// simply not heard (the emergent bit). Returns [{ m, text }].
function sceneVoices(state, scene) {
  const out = []; const used = new Set();
  for (const a of (scene?.advisors || [])) {
    if (a.if && !meets(state, a.if)) continue;
    const m = castMember(state, a.cast, used);
    if (!m) continue;
    used.add(m.id);
    out.push({ m, text: castText(a.text, m) });
  }
  return out;
}
function advisorsHTML(state, scene) {
  return sceneVoices(state, scene).map(({ m, text }) => {
    const color = CULT_HEX[m.school] || 'var(--ink)';
    return `<div class="advisor"><b style="color:${color}">${esc(m.name)}</b> &mdash; &ldquo;${esc(text)}&rdquo;</div>`;
  }).join('');
}

function choicesHTML(state, scene) {
  return scene.choices.map((ch) => {
    const ok = meets(state, ch.requires);
    return `<button class="choice" data-action="choose" data-choice="${esc(ch.id)}" ${ok ? '' : 'disabled'}>
      <span>${esc(ch.label)}</span>
      ${ch.test ? `<em class="test">contest: ${P_LABELS[ch.test.stat] || ch.test.stat} vs ${ch.test.vs}</em>` : ''}
      ${ok ? '' : `<em class="req">${reqHint(ch.requires)}</em>`}
    </button>`;
  }).join('');
}

function effectChips(effects = []) {
  return effects.map((e) => {
    if (e.add) { const [p, d] = e.add; return `<span class="chip ${d >= 0 ? 'up' : 'down'}">${P_LABELS[p] || p} ${d > 0 ? '+' : ''}${d}</span>`; }
    if (e.adjust_cult) { const [c, d] = e.adjust_cult; return `<span class="chip ${d >= 0 ? 'up' : 'down'}">${c} cult ${d > 0 ? '+' : ''}${d}</span>`; }
    if (e.transform_member) return `<span class="chip soul">A Wizard is lost to the Flame</span>`;
    return '';
  }).join('');
}

function sigil(title) {
  return `<div class="art"><img class="rune" src="assets/icons/icon_flame.png" alt="" aria-hidden="true"><div class="art-cap">${esc(title)}</div></div>`;
}

function centerHTML(ctx) {
  const { state, defs, phase, current, lastOutcome, end } = ctx;
  if (phase === 'end') {
    const [title, flavor] = END_COPY[end] || ['The Saga Ends', ''];
    const kind = end.startsWith('victory') ? 'victory' : 'defeat';
    return `<section class="end ${kind}"><h2>${esc(title)}</h2><p>${esc(flavor)}</p>
      <button data-action="new-run">Begin a new coven</button></section>`;
  }
  if (phase === 'outcome') {
    return `<section class="scene scene-split">
      <div class="scene-art">${sigil(current.title)}</div>
      <div class="scene-body">
        <p class="outcome-text">${esc(lastOutcome.text || '')}</p>
        <div class="chips">${effectChips(lastOutcome.effects)}</div>
        <button class="choice cont" data-action="continue">Continue &rarr;</button>
      </div></section>`;
  }
  if (!current) {
    return `<section class="scene scene-split">
      <div class="scene-art">${sigil('A Quiet Season')}</div>
      <div class="scene-body">
        <p class="intro">The season passes quietly over Runehold.</p>
        <button class="choice cont" data-action="continue">Continue &rarr;</button>
      </div></section>`;
  }
  return `<section class="scene scene-split">
    <div class="scene-art">${sigil(current.title)}</div>
    <div class="scene-body">
      <p class="intro">${esc(current.intro || '')}</p>
      ${advisorsHTML(state, current)}
      <div class="choices">${choicesHTML(state, current)}</div>
    </div></section>`;
}

// ---- the game screen: three KODP-style zones (hearth bar / stage / circle bar)

// the rune menu — most entries swap the stage; Codex opens the full-page overlay.
const SCREENS = [
  { id: 'map', label: 'Map', icon: 'map' },
  { id: 'scene', label: 'Seasons', icon: 'seasons' },
  { id: 'coven', label: 'Coven', icon: 'coven' },
  { id: 'workings', label: 'Workings', icon: 'workings' },
  { id: 'fields', label: 'Hearthfields', icon: 'fields' },
  { id: 'market', label: 'Market', icon: 'market' },
  { id: 'cults', label: 'Cults', icon: 'cults' },
  { id: 'war', label: 'War', icon: 'war' },
  { id: 'saga', label: 'Saga', icon: 'saga' },
];
// small UI runes for the rune tabs + pressure readout (Tier-A icon_min_* set)
const runeIco = (s) => s.icon ? `<img class="rune-ico" src="assets/icons/icon_min_${s.icon}.png" alt="" aria-hidden="true">` : '';
const P_ICON = { mana: 'mana', provisions: 'provisions', coin: 'coin', lore: 'lore', faith: 'faith', flamesRegard: 'flames_regard', fracture: 'fracture' };
// clicking a pressure jumps to the screen that governs it (coin → Market, etc.);
// pressures with no governing screen (lore) are shown but not clickable.
const P_TAB = { mana: 'workings', provisions: 'fields', coin: 'market', lore: 'saga', faith: 'coven', flamesRegard: 'map', fracture: 'war' };
// short labels for the cramped bottom bar
const P_SHORT = { mana: 'Mana', provisions: 'Food', coin: 'Coin', lore: 'Lore', faith: 'Faith', flamesRegard: 'Regard', fracture: 'Fracture' };
// The two cosmic/doom meters are VEILED by default — you feel their effects (chips)
// but don't see the running number. Reveal them in Options. See MANUAL / Codex.
const HIDDEN_METERS = ['flamesRegard', 'fracture'];
const showMeter = (ctx, k) => !HIDDEN_METERS.includes(k) || ctx.settings?.revealMeters;
// qualitative band for a veiled Fracture readout (no number leaked)
const fractureBand = (v) => (v < 20 ? 'quiet' : v < 45 ? 'stirring' : v < 70 ? 'rising' : 'dire');
// flavor for screens not yet built — all 9 are built now, kept for future screens
const STUBS = {};

function runeMenuHTML(ctx, vertical) {
  const tabs = SCREENS.map((s) => {
    const inner = runeIco(s) || `<span>${s.label}</span>`;   // icon-only; text fallback if no icon
    return s.overlay
      ? `<button class="rune-tab icon-only" data-action="open" data-overlay="${s.overlay}" title="${s.label}" aria-label="${s.label}">${inner}</button>`
      : `<button class="rune-tab icon-only ${ctx.gameView === s.id ? 'on' : ''}" data-action="game-view" data-view="${s.id}" title="${s.label}" aria-label="${s.label}">${inner}</button>`;
  }).join('');
  // scrolls the tabs, with arrows that brighten when usable. `vertical` stacks them
  // (Layout B's right rail); the arrows are rotated to ▲/▼ in CSS.
  return `<div class="runes-wrap${vertical ? ' vertical' : ''}">
    <button class="runes-arrow prev" data-action="runes-scroll" data-dir="-1" aria-label="${vertical ? 'Scroll tabs up' : 'Scroll tabs left'}">&lsaquo;</button>
    <nav class="runes">${tabs}</nav>
    <button class="runes-arrow next" data-action="runes-scroll" data-dir="1" aria-label="${vertical ? 'Scroll tabs down' : 'Scroll tabs right'}">&rsaquo;</button>
  </div>`;
}

// the hamburger + its dropdown (Codex / Options / Save / Menu) — shared by both layouts
function hearthMenuHTML(ctx) {
  return `<div class="hearth-menu${ctx.hearthMenuOpen ? ' open' : ''}">
    <button class="hamburger" data-action="toggle-hearth-menu" aria-label="Menu" aria-expanded="${ctx.hearthMenuOpen ? 'true' : 'false'}"><span></span><span></span><span></span></button>
    <div class="hearth-pop">
      <button data-action="open" data-overlay="codex">Codex</button>
      <button data-action="open" data-overlay="options">Options</button>
      <button data-action="open" data-overlay="confirm-save">Save</button>
      <button data-action="open" data-overlay="confirm-menu">Menu</button>
    </div>
  </div>`;
}

function placeholderScreen(title, flavor) {
  return `<section class="screen screen-stub">
    <img class="rune" src="assets/icons/icon_flame.png" alt="" aria-hidden="true">
    <h2 class="screen-title">${esc(title)}</h2>
    <p class="muted">${esc(flavor)}</p>
    <p class="muted">This hall is not yet raised. <button class="linkish" data-action="game-view" data-view="scene">Return to the season &rarr;</button></p>
  </section>`;
}

function sagaScreenHTML(state) {
  const lines = state.saga.slice().reverse();
  return `<section class="screen saga-screen">
    <h2 class="screen-title">The Saga of Runehold</h2>
    ${lines.length
      ? `<ol class="saga-full">${lines.map((l) => `<li>${esc(l)}</li>`).join('')}</ol>`
      : `<p class="muted">No deeds yet recorded. The saga begins with your first season.</p>`}
  </section>`;
}

// Per-screen actions (Workings, Fields, …) — declarative `requires` + `effects`,
// one of each per season. The cost is folded into effects (a negative add) and
// shown as a chip; `requires` gates affordability. This is how the player gets
// proactive levers between events — e.g. Mana→Fracture, or Coin→Provisions.
// The active caster for the Workings screen: whoever the player picked, else the
// second-in-command (the default caster). May be null pre-game / empty Circle.
function activeCaster(ctx) {
  const state = ctx.state;
  return (ctx.casterId && state.circle.find((m) => m.id === ctx.casterId)) || castMember(state, 'second');
}

function casterPickerHTML(state, caster) {
  const pills = state.circle.map((m) => {
    const on = caster && m.id === caster.id;
    return `<button class="caster-pill${on ? ' on' : ''}" data-action="set-caster" data-caster="${esc(m.id)}" style="--cult:${CULT_HEX[m.school] || '#777'}" title="${esc(m.name)} — ${CLASS_LABEL[m.class] || m.class}, ${cap(m.school)} school${m.rank === 'adept' ? ' (default caster)' : ''}">
      <span class="cp-dot"></span>${esc(m.name)}</button>`;
  }).join('');
  return `<div class="caster-bar"><span class="caster-lead">Cast by</span><div class="caster-pills">${pills}</div></div>`;
}

function workingCardHTML(state, a, caster, isUsed, can, disabled) {
  // caster-cast working: school badge + the contest + this caster's odds
  const odds = Math.round(workingOdds(state, a, caster) * 100);
  const oddsCls = odds >= 66 ? 'odds-good' : odds >= 42 ? 'odds-mid' : 'odds-low';
  const badge = a.school
    ? `<span class="wk-school" style="--cult:${CULT_HEX[a.school] || '#777'}">${cap(a.school)}</span>`
    : `<span class="wk-school wk-flame">Flame</span>`;
  return `<div class="working-card cast-card${disabled ? ' spent' : ''}">
    <div class="working-head"><b>${esc(a.label)}</b>${badge}</div>
    <p class="working-desc">${esc(a.desc)}</p>
    <div class="wk-meta">
      <span class="wk-stat">${cap(a.cast.stat)} vs ${a.cast.vs}</span>
      ${caster ? `<span class="wk-odds ${oddsCls}">${esc(caster.name)} &middot; ~${odds}%</span>` : ''}
    </div>
    <div class="chips">${effectChips((a.win || {}).effects)}</div>
    <button class="choice" data-action="do-action" data-act="${esc(a.id)}" ${disabled ? 'disabled' : ''}>
      ${isUsed ? 'Cast this season' : can ? 'Cast' : reqHint(a.requires)}
    </button>
  </div>`;
}

function actionScreenHTML(ctx, screen, title, intro, resourceKey, resourceLabel) {
  const { state } = ctx;
  const used = state.actionsUsed || [];
  const all = (ctx.actions || []).filter((a) => a.screen === screen);
  const hasCast = all.some((a) => a.cast);
  const caster = hasCast ? activeCaster(ctx) : null;
  const cards = all.map((a) => {
    const isUsed = used.includes(a.id);
    const can = meets(state, a.requires);
    const disabled = isUsed || !can;
    if (a.cast) return workingCardHTML(state, a, caster, isUsed, can, disabled);
    return `<div class="working-card${disabled ? ' spent' : ''}">
      <div class="working-head"><b>${esc(a.label)}</b></div>
      <p class="working-desc">${esc(a.desc)}</p>
      <div class="chips">${effectChips(a.effects)}</div>
      <button class="choice" data-action="do-action" data-act="${esc(a.id)}" ${disabled ? 'disabled' : ''}>
        ${isUsed ? 'Done this season' : can ? 'Perform' : reqHint(a.requires)}
      </button>
    </div>`;
  }).join('');
  const rv = state.pressures[resourceKey];
  return `<section class="screen workings-screen">
    <h2 class="screen-title">${esc(title)}</h2>
    <p class="muted">${esc(intro)}</p>
    ${HIDDEN_METERS.includes(resourceKey) && !showMeter(ctx, resourceKey)
      ? `<div class="working-mana veiled"><b>${esc(resourceLabel)}</b><span class="meter-veil" title="Veiled — reveal in Options">${resourceKey === 'fracture' ? fractureBand(rv) : 'veiled'}</span></div>`
      : `<div class="working-mana"><b>${esc(resourceLabel)}</b><div class="bar${resourceKey === 'fracture' ? ' bar-danger' : ''}"><div class="bar-fill" style="width:${rv}%"></div></div><span>${rv}</span></div>`}
    ${hasCast ? casterPickerHTML(state, caster) : ''}
    <div class="working-grid">${cards}</div>
  </section>`;
}
const workingsScreenHTML = (ctx) => actionScreenHTML(ctx, 'workings', 'Workings',
  'Spend Mana on workings — one of each per season. Mana renews slowly as the seasons turn.', 'mana', 'Mana');
const fieldsScreenHTML = (ctx) => actionScreenHTML(ctx, 'fields', 'The Hearth-fields',
  'Hold the coven against the hungry season — one labour of each kind per season.', 'provisions', 'Provisions');
const marketScreenHTML = (ctx) => actionScreenHTML(ctx, 'market', 'The Stock Sanctuary',
  'Trade through the Gilded Reach — turn coin to craft and back, one bargain of each kind per season.', 'coin', 'Coin');
const warScreenHTML = (ctx) => actionScreenHTML(ctx, 'war', 'Magic vs Steel',
  'Raid, muster, and ward Runehold against the broken world — one action of each kind per season.', 'fracture', 'The Fracture');

// The Tula-style end-of-year recap: how the year moved the coven, who stands,
// and the year's deeds — a pause and a page-turn before the next year.
function recapHTML(ctx) {
  const { state } = ctx;
  const r = ctx.yearRecap || { year: state.year, deltas: {}, beats: [] };
  const chips = Object.entries(r.deltas).filter(([, d]) => d !== 0)
    .map(([k, d]) => `<span class="chip ${d >= 0 ? 'up' : 'down'}">${P_LABELS[k] || k} ${d > 0 ? '+' : ''}${d}</span>`).join('');
  const beats = r.beats.length
    ? `<ol class="saga-full">${r.beats.map((l) => `<li>${esc(l)}</li>`).join('')}</ol>`
    : `<p class="muted">No deeds were recorded this year.</p>`;
  const circle = state.circle.map((m) => esc(m.name)).join(', ');
  const souls = state.souls.length ? ` &middot; <span class="muted">Souls: ${state.souls.map((m) => esc(m.name)).join(', ')}</span>` : '';
  return `<section class="screen recap-screen">
    <div class="recap-head"><img class="rune" src="assets/icons/icon_flame.png" alt="" aria-hidden="true">
      <h2 class="screen-title">Runehold &mdash; the Year ${r.year} Ends</h2></div>
    <p class="muted">The hearth-rune is renewed; the saga turns a page.</p>
    <h3 class="coven-subhead">How the year moved you</h3>
    <div class="chips recap-chips">${chips || '<span class="muted">A quiet year; little changed.</span>'}</div>
    <h3 class="coven-subhead">The Circle</h3>
    <p class="recap-circle">${circle}${souls}</p>
    <h3 class="coven-subhead">The year's deeds</h3>
    ${beats}
    <button class="choice cont" data-action="continue">Into the new year &rarr;</button>
  </section>`;
}

function stageHTML(ctx) {
  if (ctx.phase === 'recap') return recapHTML(ctx);   // year's end takes the stage
  const v = ctx.gameView;
  if (v === 'saga') return sagaScreenHTML(ctx.state);
  if (v === 'cults') return cultsScreenHTML(ctx);
  if (v === 'coven') return covenScreenHTML(ctx);
  if (v === 'workings') return workingsScreenHTML(ctx);
  if (v === 'fields') return fieldsScreenHTML(ctx);
  if (v === 'market') return marketScreenHTML(ctx);
  if (v === 'war') return warScreenHTML(ctx);
  if (v === 'map') return mapScreenHTML(ctx);
  if (STUBS[v]) return placeholderScreen(STUBS[v][0], STUBS[v][1]);
  return centerHTML(ctx);   // 'scene' (default): the current event / quiet season
}

// The Coven (Clan) — Faith/morale, the Circle roster, and the Souls memorial.
const LEANING_LABEL = { flame: 'Flame-touched', lore: 'Lore-keeper', caution: 'Cautious', war: 'War-minded' };
function faithBand(v) {
  if (v >= 80) return ['Devoted', 'ally'];
  if (v >= 60) return ['Loyal', 'friendly'];
  if (v >= 40) return ['Steady', 'neutral'];
  if (v >= 20) return ['Wavering', 'hostile'];
  return ['Faithless', 'enemy'];
}
// A Coven member as a portrait card: a school-tinted portrait (initial placeholder
// for now), the name, and the class; full stats on hover.
// ---- member portraits: match a file to a member by school + gender + age ----
// Filenames: portrait_<school>_<gender>_<NNN><a|b|c>.webp  (a/b/c = young/middle/old).
// Member rank sets the preferred age (apprentice→young, adept→mid, ring-leader→old);
// no match at all falls back to the silhouette placeholder.
const PORTRAIT_PLACEHOLDER = 'assets/portraits/portrait_placeholder.svg';
const GENDER_TOKEN = { she: 'female', he: 'male' };
const RANK_AGE = { apprentice: 'a', adept: 'b', 'ring-leader': 'c' };
function portraitFor(m, portraits) {
  if (!portraits || !portraits.length) return null;
  const g = GENDER_TOKEN[m.gender] || 'male';
  const matches = portraits.map((f) => {
    const [school, gender, idv = ''] = f.replace(/^portraits?_/, '').replace(/\.[a-z0-9]+$/i, '').split('_');
    return { f, school, gender, age: (idv.match(/[a-z]$/i) || [''])[0].toLowerCase() };
  }).filter((p) => p.school === m.school && p.gender === g);
  if (!matches.length) return null;
  const want = m.age != null ? ageVariant(m.age) : RANK_AGE[m.rank];   // by real age; rank fallback for old saves
  const aged = matches.filter((p) => p.age === want);
  const pool = aged.length ? aged : matches;                 // prefer the right age, else any of school+gender
  return `assets/portraits/${pool[stableHash(m.id + '|portrait') % pool.length].f}`;
}
// portrait or silhouette-placeholder fill for a member frame (keeps the initial as a
// faint identity on the placeholder only)
function portraitFill(m, portraits) {
  const photo = portraitFor(m, portraits);
  if (photo) return `<img class="member-photo" src="${esc(photo)}" alt="" loading="lazy">`;
  return `<img class="member-photo is-placeholder" src="${PORTRAIT_PLACEHOLDER}" alt="" aria-hidden="true"><span class="pcard-init">${esc((m.name[0] || '?').toUpperCase())}</span>`;
}

function memberCard(m, isLeader, portraits) {
  const tip = `${m.name} — ${CLASS_LABEL[m.class] || m.class} · ${CULT_NAMES[m.school]} · ${m.rank} · Pow ${m.power} Wis ${m.wisdom} Gui ${m.guile} Cou ${m.courage}`;
  return `<button class="pcard${isLeader ? ' leader' : ''}" data-action="view-member" data-member="${esc(m.id)}" style="--cult:${CULT_HEX[m.school] || '#777'}" title="${esc(tip)}">
    <div class="pcard-img">${portraitFill(m, portraits)}</div>
    <div class="pcard-name">${esc(m.name)}${isLeader ? ' <span class="pcard-star" title="Ring leader">&#9733;</span>' : ''}</div>
    <div class="pcard-sub">${esc(CLASS_LABEL[m.class] || m.class)}</div>
  </button>`;
}

// full-stage advisor sheet — navigated into from a Coven portrait (not a modal)
const RANK_LABEL = { 'ring-leader': 'Ring-leader', adept: 'Second-in-command', apprentice: 'Apprentice' };
const TEMP_WORDS = {
  boldness: ['Cautious', 'Measured', 'Bold'],
  piety: ['Worldly', 'Observant', 'Devout'],
  temper: ['Cool', 'Even', 'Fiery'],
};
const tempWord = (axis, v) => TEMP_WORDS[axis][v < 38 ? 0 : v > 62 ? 2 : 1];

function sheetStat(label, v, word) {
  return `<div class="sheet-stat">
    <div class="sheet-stat-row"><span>${label}</span><span class="${word ? 'sheet-temp-word' : ''}">${word || v}</span></div>
    <div class="bar${word ? ' bar-temp' : ''}"><div class="bar-fill" style="width:${v}%"></div></div>
  </div>`;
}

function advisorSheetHTML(ctx, m) {
  const state = ctx.state;
  const isLeader = state.circle[0] && state.circle[0].id === m.id;
  const cls = CLASS_LABEL[m.class] || m.class;
  const school = CULT_NAMES[m.school] || cap(m.school);
  const rank = RANK_LABEL[m.rank] || m.rank;
  const top = [['Power', m.power], ['Wisdom', m.wisdom], ['Guile', m.guile], ['Courage', m.courage]].sort((a, b) => b[1] - a[1])[0][0];
  const mastery = (state.mastery || {})[m.school] ?? 0;
  const flavour = `${m.name} is a ${school} ${cls}, ${rank.toLowerCase()} of the Circle — strongest in ${top}, ${tempWord('boldness', m.boldness).toLowerCase()} and ${tempWord('piety', m.piety).toLowerCase()} by nature.`;
  return `<section class="screen coven-screen advisor-sheet" style="--cult:${CULT_HEX[m.school] || '#777'}">
    <button class="sheet-back" data-action="close-member">&#8592; The Coven</button>
    <div class="sheet-layout">
      <aside class="sheet-portrait-col">
        <div class="sheet-portrait">${portraitFill(m, ctx.portraits)}</div>
        <h2 class="sheet-name">${esc(m.name)}${isLeader ? ' <span class="pcard-star" title="Ring leader">&#9733;</span>' : ''}</h2>
        <div class="sheet-tags"><span class="wk-school" style="--cult:${CULT_HEX[m.school] || '#777'}">${cap(m.school)}</span> <span class="sheet-class">${esc(cls)}</span></div>
        <div class="sheet-rank">${esc(rank)}${m.age != null ? ` &middot; ${m.age} years` : ''}</div>
      </aside>
      <div class="sheet-body">
        <p class="sheet-flavour">${esc(flavour)}</p>
        <h3 class="sheet-h">Competence</h3>
        <div class="sheet-stats">
          ${sheetStat('Power', m.power)}${sheetStat('Wisdom', m.wisdom)}${sheetStat('Guile', m.guile)}${sheetStat('Courage', m.courage)}
        </div>
        <h3 class="sheet-h">Temperament</h3>
        <div class="sheet-stats">
          ${sheetStat('Boldness', m.boldness, tempWord('boldness', m.boldness))}${sheetStat('Piety', m.piety, tempWord('piety', m.piety))}${sheetStat('Temper', m.temper, tempWord('temper', m.temper))}
        </div>
        <p class="sheet-mastery">Practises the <b>${esc(school)}</b> school &mdash; the coven's ${cap(m.school)} Mastery stands at <b>${mastery}</b>.</p>
      </div>
    </div>
  </section>`;
}
function covenScreenHTML(ctx) {
  const { state } = ctx;
  const sel = ctx.selectedMember && state.circle.find((m) => m.id === ctx.selectedMember);
  if (sel) return advisorSheetHTML(ctx, sel);   // navigated into a member — show the full sheet
  const faith = state.pressures.faith;
  const [fLabel, fCls] = faithBand(faith);
  const n = state.circle.length;
  const soulCount = state.souls.length;
  const members = state.circle.map((m, i) => memberCard(m, i === 0, ctx.portraits)).join('');
  const souls = soulCount
    ? `<h3 class="coven-subhead">Forgotten Souls <small>${soulCount}</small></h3>
       <div class="souls-roll">${state.souls.map((m) =>
         `<div class="soul-chip" title="Lost to the Flame"><span class="cult-swatch" style="background:${CULT_HEX[m.school] || '#777'}"></span>${esc(m.name)}</div>`).join('')}</div>`
    : '';
  return `<section class="screen coven-screen">
    <div class="coven-layout">
      <aside class="coven-tower">
        <img src="assets/icons/icon_cults_3.png" alt="The Coven" />
        <div class="coven-tower-cap">The Coven &mdash; ${n} Wizard${n === 1 ? '' : 's'}</div>
      </aside>
      <div class="coven-main">
        <p class="coven-faithline">Faith &mdash; <b class="cult-standing ${fCls}">${fLabel}</b> (${faith})</p>
        <div class="portrait-grid">${members}</div>
        ${souls}
        <p class="muted coven-note">Recruitment rites are not yet established — in time, new Wizards will be drawn to a coven of high Faith, and apprentices raised into the Circle.</p>
      </div>
    </div>
  </section>`;
}

// The Seven Cults (Relations) — signed standing per color, with a centered
// −100…+100 meter and lore pulled from the codex (single source of truth).
const CULT_NAMES = { red: 'Red', yellow: 'Yellow', brown: 'Brown', green: 'Green', blue: 'Blue', purple: 'Purple', white: 'White' };
function standingBand(v) {
  if (v <= -60) return ['Sworn Enemy', 'enemy'];
  if (v <= -20) return ['Hostile', 'hostile'];
  if (v < 20) return ['Neutral', 'neutral'];
  if (v < 60) return ['Friendly', 'friendly'];
  return ['Ally', 'ally'];
}
function cultsScreenHTML(ctx) {
  const { state } = ctx;
  const cultCat = (ctx.codex || []).find((c) => c.id === 'cults');
  const lore = {};
  if (cultCat) for (const e of (cultCat.entries || [])) lore[e.term.toLowerCase()] = e.body;
  const rows = CULTS.map((c) => {
    const v = state.cults[c] || 0;
    const [label, cls] = standingBand(v);
    const pct = (v + 100) / 2;                 // −100…+100 → 0…100
    return `<div class="cult-row">
      <div class="cult-head">
        <span class="cult-swatch" style="background:${CULT_HEX[c]}"></span>
        <b>${CULT_NAMES[c]}</b>
        <span class="cult-standing ${cls}">${label} (${v > 0 ? '+' : ''}${v})</span>
      </div>
      <div class="cult-meter"><span class="cult-zero"></span><i class="cult-fill ${cls}" style="left:${Math.min(pct, 50)}%;width:${Math.abs(pct - 50)}%"></i></div>
      <p class="cult-desc">${esc(lore[c] || '')}</p>
    </div>`;
  }).join('');
  return `<section class="screen cults-screen">
    <h2 class="screen-title">The Seven Cults</h2>
    <p class="muted">Your standing with each color — from sworn enmity (−100) through neutral (0) to alliance (+100). Acting for one often costs another.</p>
    ${rows}
  </section>`;
}

// The Runiverse (Map) — stylized, data-driven: Runehold at centre, the seven
// cult holds ringed around it (live standing), the Secret Tower, and the
// Fracture's ash creeping in as it rises. Canon holds named; others generic.
const HOLD_NAMES = { red: 'The Gilded Reach', blue: 'The Bastion' };
function mapScreenHTML(ctx) {
  const { state } = ctx;
  const fracture = state.pressures.fracture;
  const holds = CULTS.map((c, i) => {
    const ang = (-90 + i * (360 / 7)) * Math.PI / 180;
    const x = (50 + 36 * Math.cos(ang)).toFixed(1);
    const y = (50 + 36 * Math.sin(ang)).toFixed(1);
    const v = state.cults[c] || 0;
    const charted = v !== 0;
    const [label, cls] = charted ? standingBand(v) : ['Uncharted', 'uncharted'];
    const name = HOLD_NAMES[c] || `${CULT_NAMES[c]} Hold`;
    return `<div class="map-hold ${cls}" style="left:${x}%;top:${y}%" title="${esc(name)} — ${label}${charted ? ` (${v > 0 ? '+' : ''}${v})` : ''}">
      <span class="map-pin" style="background:${CULT_HEX[c]}"></span>
      <span class="map-label">${esc(name)}<small>${label}</small></span>
    </div>`;
  }).join('');
  const fCls = fracture >= 66 ? 'enemy' : fracture >= 33 ? 'hostile' : 'neutral';
  return `<section class="screen map-screen">
    <h2 class="screen-title">The Runiverse</h2>
    <p class="muted">Runehold and the seven Color Cults, across a world the Fracture is unmaking. Holds you have never dealt with stay uncharted — white on the map, or already forgotten.</p>
    <div class="map-field">
      <div class="map-ash" style="opacity:${(fracture / 100 * 0.7).toFixed(2)}"></div>
      <div class="map-hold map-tower" style="left:50%;top:8%" title="The Secret Tower — the Sacred Flame burns in its basement">
        <span class="map-pin tower"></span><span class="map-label">The Secret Tower<small>the Flame</small></span>
      </div>
      ${holds}
      <div class="map-hold map-home" style="left:50%;top:50%" title="Runehold — your coven seat">
        <img class="rune" src="assets/icons/icon_flame.png" alt="" aria-hidden="true"><span class="map-label">Runehold</span>
      </div>
    </div>
    <p class="muted map-fracture-note">${showMeter(ctx, 'fracture')
      ? `The Fracture stands at <b class="${fCls}">${fracture}</b>.`
      : `The Fracture is <b class="${fCls}">${fractureBand(fracture)}</b>.`} Its ash creeps further into the known world each season it is left unchecked.</p>
  </section>`;
}

// short display labels for the 9 classes
const CLASS_LABEL = { magus: 'Magus', sorcerer: 'Sorcerer', druid: 'Druid', necromancer: 'Necromancer', pyromancer: 'Pyromancer', enchanter: 'Enchanter', charmer: 'Charmer', 'chaos-mage': 'Chaos Mage', 'ghost-eater': 'Ghost Eater' };

// the Circle bar (bottom chrome): the Circle as a held hand of cards — hover or
// tap a card to lift it and hear the advisor's thought — plus a clickable
// resource readout (each pressure jumps to the screen that governs it).
// Does a member fit a counsel line's `lean` tag? Personality poles, competence
// highs, or a school/class match. Untagged lines fit everyone.
function memberLeans(m, lean) {
  switch (lean) {
    case 'bold': return m.boldness > 62;
    case 'cautious': return m.boldness < 38;
    case 'devout': return m.piety > 62;
    case 'worldly': return m.piety < 38;
    case 'fiery': return m.temper > 62;
    case 'cool': return m.temper < 38;
    case 'strong': return m.power >= 55;
    case 'wise': return m.wisdom >= 55;
    case 'cunning': return m.guile >= 55;
    case 'brave': return m.courage >= 55;
    default: return m.school === lean || m.class === lean;
  }
}
// Stable (non-random, render-pure) index so a pinned bubble doesn't reshuffle each draw.
function stableHash(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
// A member's ambient counsel for the CURRENT management screen (off the scene page).
// A live `if` (pressure) line takes priority — the advisor raises the crisis;
// otherwise a personality-fit ambient line. Stable per member+screen (no RNG).
function screenCounsel(ctx, m) {
  const pool = (ctx.counsel || {})[ctx.gameView];
  if (!pool || !pool.length) return 'No strong counsel here.';
  const leanOk = (l) => !l.lean || memberLeans(m, l.lean);
  const urgent = pool.filter((l) => l.if && meets(ctx.state, l.if) && leanOk(l));   // a crisis, in this member's voice
  const general = pool.filter((l) => !l.if && leanOk(l));                            // calm ambient, fits this member
  const list = urgent.length ? urgent : general.length ? general : pool.filter((l) => !l.if);
  if (!list.length) return 'No strong counsel here.';
  return castText(list[stableHash(m.id + '|' + ctx.gameView) % list.length].text, m);
}

function circleBarHTML(ctx) {
  const { state } = ctx;
  // On the scene (questing) page the advisors answer the scene; on every other
  // screen they answer THAT screen (ambient counsel).
  const onScene = ctx.gameView === 'scene';
  const useThumb = ctx.settings?.footerPortraits !== false;   // portrait thumb vs the plain colour dot
  const voices = onScene ? new Map(sceneVoices(state, ctx.current).map(({ m, text }) => [m.id, text])) : null;
  const cards = state.circle.map((m, i) => {
    const role = m.rank === 'ring-leader' ? 'leader' : (CLASS_LABEL[m.class] || m.class);
    const thought = onScene ? (voices.get(m.id) || 'No strong counsel here.') : screenCounsel(ctx, m);
    const face = useThumb
      ? `<span class="cb-photo"><img src="${esc(portraitFor(m, ctx.portraits) || PORTRAIT_PLACEHOLDER)}" alt="" loading="lazy"></span>`
      : '<span class="cb-dot"></span>';
    return `<button class="cb-card${ctx.pinnedCard === i ? ' pinned' : ''}" data-action="toggle-card" data-card="${i}" style="--i:${i};--cult:${CULT_HEX[m.school] || '#777'}" aria-label="${esc(m.name)}">
        <span class="cb-face">
          ${face}
          <span class="cb-name">${esc(m.name)}</span>
          <span class="cb-role">${esc(role)}</span>
        </span>
        <span class="cb-bubble"><b>${esc(m.name)}</b><span class="cb-sub">${esc(CLASS_LABEL[m.class] || m.class)} &middot; ${CULT_NAMES[m.school] || m.school} &middot; ${esc(m.rank)}</span>${esc(thought)}</span>
      </button>`;
  }).join('');
  const souls = state.souls.map((m) =>
    `<span class="cb-soul" title="Lost to the Flame"><i style="background:${CULT_HEX[m.school] || '#777'}"></i>${esc(m.name)}</span>`).join('');
  const tuck = ctx.settings?.tuckCards !== false;
  const barCls = `circle-bar${tuck ? ' cb-tuck' : ''}${tuck && ctx.cardsOpen ? ' cb-open' : ''}`;
  return `<div class="${barCls}">
    <div class="cb-hand">${cards}${souls ? `<span class="cb-souls">${souls}</span>` : ''}</div>
    <div class="cb-res-row">${pressureMetersHTML(ctx)}</div>
  </div>`;
}

// the seven pressure meters (Fracture/Regard hidden unless revealed) — shared by
// Layout A's footer row and Layout B's top strip.
function pressureMetersHTML(ctx) {
  const { state } = ctx;
  return P_ORDER.filter((k) => showMeter(ctx, k)).map((k) => {
    const tab = P_TAB[k];
    const cls = `cb-res ${k === 'fracture' ? 'danger' : ''}`;
    const inner = `<img class="cb-ico" src="assets/icons/icon_min_${P_ICON[k]}.png" alt="${P_SHORT[k]}"><span class="cb-val">${state.pressures[k]}</span>`;
    return tab
      ? `<button class="${cls}" data-action="game-view" data-view="${tab}" title="${P_SHORT[k]}">${inner}</button>`
      : `<span class="${cls}" title="${P_SHORT[k]}">${inner}</span>`;
  }).join('');
}

function gameHTML(ctx) {
  if (ctx.settings?.layout === 'b') return gameHTMLB(ctx);
  const { state } = ctx;
  return `<div class="hearth-bar">
      <div class="hearth-id"><img class="rune" src="assets/icons/icon_flame.png" alt="" aria-hidden="true">
        <div><b>Runehold</b><small class="hearth-date">${timeName(state.phase, state.season)} &middot; Year ${state.year}</small></div>
      </div>
      ${runeMenuHTML(ctx, false)}
      ${hearthMenuHTML(ctx)}
    </div>
    <main class="stage">${stageHTML(ctx)}</main>
    ${circleBarHTML(ctx)}`;
}

// ---- Layout B: thin top strip (date + meters) · left advisor rail (peek 60%,
// pops out on tap) · right vertical rune rail below the hamburger · centre stage.
// counsel line for one member — their scene voice on the questing page, else their
// ambient screen counsel. Shown in the fixed bottom dock when a tile is tapped.
function memberCounsel(ctx, m) {
  if (ctx.gameView === 'scene') {
    const v = sceneVoices(ctx.state, ctx.current).find((x) => x.m.id === m.id);
    return v ? v.text : 'No strong counsel here.';
  }
  return screenCounsel(ctx, m);
}

function lbAdvTile(ctx, m, i) {
  const pinned = ctx.pinnedCard === i;
  const photo = portraitFor(m, ctx.portraits);
  const img = photo
    ? `<img class="member-photo" src="${esc(photo)}" alt="" loading="lazy">`
    : `<img class="member-photo" src="${PORTRAIT_PLACEHOLDER}" alt="" aria-hidden="true"><span class="pcard-init">${esc((m.name[0] || '?').toUpperCase())}</span>`;
  return `<button class="lb-adv${pinned ? ' pinned' : ''}" data-action="toggle-card" data-card="${i}" style="--i:${i};--cult:${CULT_HEX[m.school] || '#777'}" aria-label="${esc(m.name)}">
      <span class="lb-adv-img">${img}</span>
      <span class="lb-adv-name">${esc(m.name)}</span>
    </button>`;
}

function lbAdvisorsHTML(ctx) {
  const cards = ctx.state.circle.map((m, i) => lbAdvTile(ctx, m, i)).join('');
  // native vertical scroll (touch + momentum) with ▲▼ affordances outside the scroller
  return `<aside class="lb-advisors">
    <button class="lb-adv-arrow up" data-action="adv-scroll" data-dir="-1" aria-label="Scroll advisors up">&lsaquo;</button>
    <div class="lb-adv-scroll"><div class="lb-adv-list">${cards}</div></div>
    <button class="lb-adv-arrow down" data-action="adv-scroll" data-dir="1" aria-label="Scroll advisors down">&rsaquo;</button>
  </aside>`;
}

function gameHTMLB(ctx) {
  const { state } = ctx;
  const pm = ctx.pinnedCard != null ? state.circle[ctx.pinnedCard] : null;   // pinned advisor → bottom dock
  const dockPhoto = pm && (portraitFor(pm, ctx.portraits) || PORTRAIT_PLACEHOLDER);
  const dock = pm ? `<div class="lb-bubble-dock" style="--cult:${CULT_HEX[pm.school] || '#777'}">
      <span class="lb-dock-photo"><img class="member-photo" src="${esc(dockPhoto)}" alt=""></span>
      <div class="lb-dock-body"><b>${esc(pm.name)}</b><span class="cb-sub">${esc(CLASS_LABEL[pm.class] || pm.class)} &middot; ${CULT_NAMES[pm.school] || pm.school} &middot; ${esc(pm.rank)}</span><p>${esc(memberCounsel(ctx, pm))}</p></div>
      <button class="lb-dock-close" data-action="toggle-card" data-card="${ctx.pinnedCard}" aria-label="Close">&times;</button>
    </div>` : '';
  return `<div class="lb-strip">
      <span class="lb-date"><img class="rune" src="assets/icons/icon_flame.png" alt="" aria-hidden="true"><b>Runehold</b> <small class="hearth-date">${timeName(state.phase, state.season)} &middot; Year ${state.year}</small></span>
      <div class="cb-res-row lb-res">${pressureMetersHTML(ctx)}</div>
      ${hearthMenuHTML(ctx)}
    </div>
    ${lbAdvisorsHTML(ctx)}
    <main class="stage">${stageHTML(ctx)}</main>
    <div class="lb-rune-rail">${runeMenuHTML(ctx, true)}</div>
    ${dock}`;
}

// ---- splash + main menu ---------------------------------------------------
function splashHTML() {
  return `<section class="splash" data-action="enter">
    <div class="splash-flame"><img class="splash-mark" src="assets/icons/icon_flame_gem.gif" alt="" /></div>
    <h1>Keeper of the Sacred Flame</h1>
    <p class="splash-sub">A coven-survival saga of the Forgotten Runiverse</p>
    <button class="splash-enter" data-action="enter"><span class="cap">E</span>nter <span class="cap">R</span>unehold &#10095;</button>
  </section>`;
}

function menuHTML(ctx) {
  const resume = ctx.inGame
    ? `<button class="menu-item primary" data-action="resume-game">Return to campaign</button>`
    : ctx.saves.auto
      ? `<button class="menu-item primary" data-action="restore" data-slot="auto">Continue</button>`
      : '';
  return `<section class="menu">
    <div class="menu-brand"><img class="rune" src="assets/icons/icon_flame_anim.gif" alt="" aria-hidden="true">
      <h1>Keeper of the Sacred Flame</h1><p>Runehold</p></div>
    <nav class="menu-nav">
      ${resume}
      <button class="menu-item" data-action="start-game">New Coven</button>
      <button class="menu-item" data-action="open" data-overlay="saves">Load &amp; Save</button>
      <button class="menu-item" data-action="open" data-overlay="codex">Codex</button>
      <button class="menu-item" data-action="open" data-overlay="options">Options</button>
    </nav>
  </section>`;
}

// ---- full-page modal shell (shared by options / codex / saves) -----------
function modal(kind, title, body) {
  return `<div class="overlay overlay-${kind}">
    <button class="overlay-scrim" data-action="close" aria-label="Close"></button>
    <div class="modal modal-${kind}" role="dialog" aria-modal="true" aria-label="${esc(title)}">
      <header class="modal-head">
        <h2>${esc(title)}</h2>
        <button class="modal-close" data-action="close" aria-label="Close">&times;</button>
      </header>
      <div class="modal-body">${body}</div>
    </div>
  </div>`;
}

function optionsHTML(ctx) {
  const s = ctx.settings;
  const sections = [{ id: 'display', title: 'Display' }, { id: 'saves', title: 'Saves' }, { id: 'data', title: 'Data' }, { id: 'about', title: 'About' }];
  const activeId = sections.some((x) => x.id === ctx.optionsTab) ? ctx.optionsTab : 'display';
  const side = sections.map((x) =>
    `<button class="panel-navitem ${x.id === activeId ? 'on' : ''}" data-action="options-tab" data-tab="${x.id}">${x.title}</button>`).join('');

  const sizes = { s: 'Small', m: 'Medium', l: 'Large' };
  const seg = ['s', 'm', 'l'].map((v) =>
    `<button class="${s.textSize === v ? 'on' : ''}" data-action="set-option" data-key="textSize" data-val="${v}">${sizes[v]}</button>`).join('');
  const toggle = (key, on) =>
    `<button class="toggle ${on ? 'on' : ''}" data-action="set-option" data-key="${key}" data-val="${on ? '0' : '1'}">${on ? 'On' : 'Off'}</button>`;

  let main;
  if (activeId === 'saves') {
    main = `<div class="opt"><label>Autosave</label>${toggle('autosave', s.autosave)}</div>
      <p class="muted">Autosave keeps one continuous campaign. Turn it off to play with manual saves only.</p>`;
  } else if (activeId === 'data') {
    main = `<div class="opt opt-danger"><label>Saved data</label><button class="danger" data-action="clear-data">Clear all data</button></div>
      <p class="muted">Removes saved campaigns and settings from this browser. This cannot be undone.</p>`;
  } else if (activeId === 'about') {
    main = `<div class="opt"><label>Version</label><span class="opt-version">${esc(ctx.appVersion || '—')}</span></div>
      <div class="opt"><label>Check for update</label><button data-action="force-update">Update now</button></div>
      <p class="muted">Runehold installs as an app and runs offline. If a new version is out, this clears the cached app and reloads the latest. Your saved campaign is kept.</p>`;
  } else {
    main = `<div class="opt"><label>Layout</label><div class="seg">${['a', 'b'].map((v) => `<button class="${(s.layout || 'a') === v ? 'on' : ''}" data-action="set-option" data-key="layout" data-val="${v}">Layout ${v.toUpperCase()}</button>`).join('')}</div></div>
      <p class="muted opt-note">Layout A: classic — header tabs on top, advisor cards along the bottom. Layout B: thin top strip (date + meters), advisor portraits down the left edge, rune tabs down the right.</p>
      <div class="opt"><label>Text size</label><div class="seg">${seg}</div></div>
      <div class="opt"><label>Reduce motion</label>${toggle('reduceMotion', s.reduceMotion)}</div>
      <div class="opt"><label>Show Fracture &amp; Regard</label>${toggle('revealMeters', s.revealMeters)}</div>
      <p class="muted opt-note">Off (default): the Fracture and Flame's Regard are veiled — you feel their pull through what your choices cost, but the running number stays hidden. On: show the exact meters.</p>
      <div class="opt"><label>Portraits in the card bar</label>${toggle('footerPortraits', s.footerPortraits)}</div>
      <p class="muted opt-note">Show each advisor's portrait on their card in the bottom bar, instead of a plain colour dot.</p>
      <div class="opt"><label>Tuck the card bar</label>${toggle('tuckCards', s.tuckCards)}</div>
      <p class="muted opt-note">On (default): the advisor cards sit low to save space — tap them to raise the hand, tap away to lower it. Off: the cards stay up.</p>`;
  }

  return `<div class="panel-layout">
      <nav class="panel-side" role="tablist">${side}</nav>
      <div class="panel-main"><section class="opt-section">${main}</section></div>
    </div>`;
}

function savesHTML(ctx) {
  const fmt = (m) => m
    ? `Year ${m.year} &middot; ${seasonName(m.season)}${m.savedAt ? ` &middot; ${esc(m.savedAt)}` : ''}`
    : 'Empty';
  const { auto, manual } = ctx.saves;
  return `
    <div class="slot">
      <div class="slot-info"><b>Autosave</b><small>${fmt(auto)}</small></div>
      <div class="slot-actions">
        ${auto ? `<button data-action="restore" data-slot="auto">Resume</button>` : `<span class="muted">No autosave yet</span>`}
      </div>
    </div>
    <div class="slot">
      <div class="slot-info"><b>Manual save</b><small>${fmt(manual)}</small></div>
      <div class="slot-actions">
        ${ctx.inGame ? `<button data-action="save-manual">Save here</button>` : ''}
        ${manual ? `<button data-action="restore" data-slot="manual">Restore</button>` : ''}
        ${manual ? `<button class="danger" data-action="delete-manual">Delete</button>` : ''}
      </div>
    </div>
    <p class="muted slot-note">A single continuous campaign autosaves as you play. Keep one manual save as a bookmark &mdash; losses to the Flame are permanent.</p>`;
}

function codexHTML(ctx) {
  const cats = ctx.codex || [];
  if (!cats.length) return `<div class="panel-main"><p class="muted">The codex is empty.</p></div>`;
  const q = (ctx.codexQuery || '').trim().toLowerCase();
  const active = cats.find((c) => c.id === ctx.codexTab) || cats[0];

  // left column: one nav item per category (no active highlight while searching)
  const side = cats.map((c) =>
    `<button class="panel-navitem ${!q && c.id === active.id ? 'on' : ''}" data-action="codex-tab" data-tab="${esc(c.id)}">${esc(c.title)}</button>`).join('');

  let main;
  if (q) {
    const hits = [];
    for (const c of cats) (c.entries || []).forEach((e, i) => {
      if (e.term.toLowerCase().includes(q) || e.body.toLowerCase().includes(q)) hits.push({ c, e, i });
    });
    const term = esc(ctx.codexQuery.trim());
    // each result is a button that navigates to the entry in its category
    main = hits.length
      ? `<p class="codex-blurb">${hits.length} match${hits.length === 1 ? '' : 'es'} for &ldquo;${term}&rdquo;</p>
         <div class="codex-results">${hits.map(({ c, e, i }) =>
           `<button class="codex-result" data-action="codex-goto" data-tab="${esc(c.id)}" data-entry="${i}">
              <span class="codex-result-term">${esc(e.term)}<span class="codex-cat-tag">${esc(c.title)}</span></span>
              <span class="codex-result-body">${esc(e.body)}</span>
            </button>`).join('')}</div>`
      : `<p class="muted">No matches for &ldquo;${term}&rdquo;.</p>`;
  } else {
    main = `${active.blurb ? `<p class="codex-blurb">${esc(active.blurb)}</p>` : ''}
      <dl>${(active.entries || []).map((e, i) =>
        `<div class="codex-entry" id="codex-${esc(active.id)}-${i}"><dt>${esc(e.term)}</dt><dd>${esc(e.body)}</dd></div>`).join('')}</dl>`;
  }

  return `<div class="panel-layout">
      <nav class="panel-side" role="tablist">${side}</nav>
      <div class="panel-main"><section class="codex-cat">${main}</section></div>
    </div>`;
}

// the codex search box, rendered into the full-page header next to the title
function codexSearchHTML(ctx) {
  return `<div class="panel-search">
    <input type="search" placeholder="Search the codex&hellip;" value="${esc(ctx.codexQuery || '')}" aria-label="Search the codex" />
  </div>`;
}

// full-page takeover panel (the Codex authoring surface) — fastsugar-style:
// a solid full-viewport panel with a header bar, underline tabs, scrolling body.
function fullpage(kind, title, inner, headerExtra = '') {
  return `<div class="overlay overlay-full overlay-${kind}">
    <div class="fullpage" role="dialog" aria-modal="true" aria-label="${esc(title)}">
      <header class="fullpage-head">
        <h2>${esc(title)}</h2>
        ${headerExtra}
        <span class="esc-hint">Esc to close</span>
        <button class="fullpage-close" data-action="close" aria-label="Close"><span></span><span></span><span></span></button>
      </header>
      ${inner}
    </div>
  </div>`;
}

function overlayHTML(ctx) {
  if (!ctx.overlay) return '';
  // the Codex takes over the whole screen (wiki/authoring surface);
  // Options and Saves stay as compact centered modals.
  if (ctx.overlay === 'codex') return fullpage('codex', 'Codex', codexHTML(ctx), codexSearchHTML(ctx));
  if (ctx.overlay === 'options') return fullpage('options', 'Options', optionsHTML(ctx));
  if (ctx.overlay === 'confirm-save') return modal('confirm', 'Save your progress?', `
    <p class="confirm-warn">This writes your <b>manual bookmark</b>, replacing whatever was saved there before. Your continuous autosave is untouched.</p>
    <div class="confirm-actions">
      <button data-action="close">Cancel</button>
      <button class="primary" data-action="confirm-save-yes">Save here</button>
    </div>`);
  if (ctx.overlay === 'confirm-menu') return modal('confirm', 'Return to the main menu?', `
    <p class="confirm-warn">You'll leave this session for the title screen. Your progress is autosaved &mdash; choose <b>Continue</b> there to pick the saga back up.</p>
    <div class="confirm-actions">
      <button data-action="close">Stay</button>
      <button class="primary" data-action="go-menu">Return to menu</button>
    </div>`);
  if (ctx.overlay === 'confirm-new') return modal('confirm', 'Abandon the current saga?', `
    <p class="confirm-warn">Beginning a new coven will <b>overwrite your current campaign</b>. Once it is replaced, the old saga is gone for good &mdash; it cannot be recovered.</p>
    <div class="confirm-actions">
      <button data-action="close">No &mdash; keep playing</button>
      <button class="danger" data-action="confirm-new-yes">Yes &mdash; begin anew</button>
    </div>`);
  const map = { saves: ['Load &amp; Save', savesHTML(ctx)] };
  const m = map[ctx.overlay];
  return m ? modal(ctx.overlay, m[0], m[1]) : '';
}

// ---- top-level dispatch: pick the screen, layer any overlay on top --------
export function render(ctx) {
  const screen = ctx.screen === 'splash' ? splashHTML()
    : ctx.screen === 'menu' ? menuHTML(ctx)
    : gameHTML(ctx);
  return screen + overlayHTML(ctx);
}
