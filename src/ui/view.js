// view.js — pure rendering. Turns the game state into HTML. The swappable layer:
// the engine never imports this; this imports only read-only engine helpers.
import { meets } from '../engine/conditions.js';
import { seasonName, CULTS } from '../engine/state.js';

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

function advisorsHTML(state, defs, scene) {
  const inCircle = new Set(state.circle.map((m) => m.id));
  return (scene.advisors || [])
    .filter((a) => inCircle.has(a.member) && meets(state, a.if))
    .map((a) => {
      const def = defs[a.member] || {};
      const color = CULT_HEX[def.color] || 'var(--ink)';
      return `<div class="advisor"><b style="color:${color}">${esc(def.name || a.member)}</b> &mdash; &ldquo;${esc(a.text)}&rdquo;</div>`;
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
  return `<div class="art"><img class="rune" src="/assets/icons/icon_flame.png" alt="" aria-hidden="true"><div class="art-cap">${esc(title)}</div></div>`;
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
    return `<section class="scene">${sigil(current.title)}
      <p class="outcome-text">${esc(lastOutcome.text || '')}</p>
      <div class="chips">${effectChips(lastOutcome.effects)}</div>
      <button class="choice cont" data-action="continue">Continue &rarr;</button></section>`;
  }
  if (!current) {
    return `<section class="scene"><p class="intro">The season passes quietly over Runehold.</p>
      <button class="choice cont" data-action="continue">Continue &rarr;</button></section>`;
  }
  return `<section class="scene">${sigil(current.title)}
    <p class="intro">${esc(current.intro || '')}</p>
    ${advisorsHTML(state, defs, current)}
    <div class="choices">${choicesHTML(state, current)}</div></section>`;
}

// ---- the game screen: three KODP-style zones (hearth bar / stage / circle bar)

// the rune menu — most entries swap the stage; Codex opens the full-page overlay.
const SCREENS = [
  { id: 'scene', label: 'Season', icon: 'seasons' },
  { id: 'coven', label: 'Coven', icon: 'coven' },
  { id: 'fields', label: 'Fields', icon: 'fields' },
  { id: 'market', label: 'Market', icon: 'market' },
  { id: 'war', label: 'War', icon: 'war' },
  { id: 'cults', label: 'Cults', icon: 'cults' },
  { id: 'workings', label: 'Workings', icon: 'workings' },
  { id: 'map', label: 'Map', icon: 'map' },
  { id: 'saga', label: 'Saga', icon: 'saga' },
  { id: 'codex', label: 'Codex', overlay: 'codex', icon: 'codex' },
];
// small UI runes for the rune tabs + pressure readout (Tier-A icon_min_* set)
const runeIco = (s) => s.icon ? `<img class="rune-ico" src="/assets/icons/icon_min_${s.icon}.png" alt="" aria-hidden="true">` : '';
const P_ICON = { mana: 'mana', provisions: 'provisions', coin: 'coin', lore: 'lore', faith: 'faith', flamesRegard: 'flames_regard', fracture: 'fracture' };
// short labels for the cramped bottom bar
const P_SHORT = { mana: 'Mana', provisions: 'Food', coin: 'Coin', lore: 'Lore', faith: 'Faith', flamesRegard: 'Regard', fracture: 'Fracture' };
// flavor for screens not yet built — all 9 are built now, kept for future screens
const STUBS = {};

function runeMenuHTML(ctx) {
  const tabs = SCREENS.map((s) => {
    const inner = runeIco(s) || `<span>${s.label}</span>`;   // icon-only; text fallback if no icon
    return s.overlay
      ? `<button class="rune-tab icon-only" data-action="open" data-overlay="${s.overlay}" title="${s.label}" aria-label="${s.label}">${inner}</button>`
      : `<button class="rune-tab icon-only ${ctx.gameView === s.id ? 'on' : ''}" data-action="game-view" data-view="${s.id}" title="${s.label}" aria-label="${s.label}">${inner}</button>`;
  }).join('');
  // hearth-id + actions take their content width; this wrap flexes to the gap
  // between them and scrolls the tabs, with ‹ › arrows that brighten when usable.
  return `<div class="runes-wrap">
    <button class="runes-arrow prev" data-action="runes-scroll" data-dir="-1" aria-label="Scroll tabs left">&lsaquo;</button>
    <nav class="runes">${tabs}</nav>
    <button class="runes-arrow next" data-action="runes-scroll" data-dir="1" aria-label="Scroll tabs right">&rsaquo;</button>
  </div>`;
}

function placeholderScreen(title, flavor) {
  return `<section class="screen screen-stub">
    <img class="rune" src="/assets/icons/icon_flame.png" alt="" aria-hidden="true">
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
function actionScreenHTML(ctx, screen, title, intro, resourceKey, resourceLabel) {
  const { state } = ctx;
  const used = state.actionsUsed || [];
  const cards = (ctx.actions || []).filter((a) => a.screen === screen).map((a) => {
    const isUsed = used.includes(a.id);
    const can = meets(state, a.requires);
    const disabled = isUsed || !can;
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
    <div class="working-mana"><b>${esc(resourceLabel)}</b><div class="bar${resourceKey === 'fracture' ? ' bar-danger' : ''}"><div class="bar-fill" style="width:${rv}%"></div></div><span>${rv}</span></div>
    <div class="working-grid">${cards}</div>
  </section>`;
}
const workingsScreenHTML = (ctx) => actionScreenHTML(ctx, 'workings', 'Workings',
  'Spend Mana on workings — one of each per season. Mana renews slowly as the seasons turn.', 'mana', 'Mana');
const fieldsScreenHTML = (ctx) => actionScreenHTML(ctx, 'fields', 'The Hearth-fields',
  'Hold the coven against the hungry season — one labour of each kind per season.', 'provisions', 'Provisions');
const marketScreenHTML = (ctx) => actionScreenHTML(ctx, 'market', 'The Stock Sanctuary',
  'Trade through Markertropolis — turn coin to craft and back, one bargain of each kind per season.', 'coin', 'Coin');
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
    <div class="recap-head"><img class="rune" src="/assets/icons/icon_flame.png" alt="" aria-hidden="true">
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
function memberCard(m, def, isLeader) {
  const leaning = LEANING_LABEL[m.leaning] || (m.leaning ? m.leaning[0].toUpperCase() + m.leaning.slice(1) : '');
  const meta = [m.rank, leaning, CULT_NAMES[m.color]].filter(Boolean).join(' · ');
  return `<div class="member-card">
    <div class="member-head">
      <span class="cult-swatch" style="background:${CULT_HEX[m.color] || '#777'}"></span>
      <b>${esc(def.name || m.name)}</b>
      ${isLeader ? '<span class="member-leader">Ring leader</span>' : ''}
    </div>
    <div class="member-meta">${esc(meta)}</div>
    <p class="member-bio">${esc(def.bio || '')}</p>
  </div>`;
}
function covenScreenHTML(ctx) {
  const { state, defs } = ctx;
  const faith = state.pressures.faith;
  const [fLabel, fCls] = faithBand(faith);
  const n = state.circle.length;
  const soulCount = state.souls.length;
  const members = state.circle.map((m, i) => memberCard(m, defs[m.id] || {}, i === 0)).join('');
  const souls = soulCount
    ? `<h3 class="coven-subhead">Forgotten Souls <small>${soulCount}</small></h3>
       <div class="souls-roll">${state.souls.map((m) =>
         `<div class="soul-chip" title="Lost to the Flame"><span class="cult-swatch" style="background:${CULT_HEX[m.color] || '#777'}"></span>${esc(m.name)}</div>`).join('')}</div>`
    : '';
  return `<section class="screen coven-screen">
    <h2 class="screen-title">The Coven of Runehold</h2>
    <div class="coven-faith">
      <div class="cult-head"><b>Faith</b><span class="cult-standing ${fCls}">${fLabel} (${faith})</span></div>
      <div class="bar"><div class="bar-fill" style="width:${faith}%"></div></div>
      <p class="muted">${n} Wizard${n === 1 ? '' : 's'} stand in the Circle.${soulCount ? ` ${soulCount} ${soulCount === 1 ? 'has' : 'have'} been lost to the Flame.` : ''}</p>
    </div>
    <h3 class="coven-subhead">The Circle</h3>
    <div class="member-grid">${members}</div>
    ${souls}
    <p class="muted coven-note">Recruitment rites are not yet established — in time, new Wizards will be drawn to a coven of high Faith, and apprentices raised into the Circle.</p>
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
const HOLD_NAMES = { red: 'Markertropolis', blue: 'The Bastion' };
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
        <img class="rune" src="/assets/icons/icon_flame.png" alt="" aria-hidden="true"><span class="map-label">Runehold</span>
      </div>
    </div>
    <p class="muted map-fracture-note">The Fracture stands at <b class="${fCls}">${fracture}</b>. Its ash creeps further into the known world each season it is left unchecked.</p>
  </section>`;
}

// the Circle bar (bottom chrome) — advisor portraits + a compact resource readout
function circleBarHTML(ctx) {
  const { state, defs } = ctx;
  const portraits = state.circle.map((m, i) => `<div class="cb-portrait" title="${esc(defs[m.id]?.bio || '')}">
      <i style="background:${CULT_HEX[m.color] || '#777'}"></i>
      <span class="cb-name">${esc(m.name)}</span>
      <small>${i === 0 ? 'leader' : esc(m.leaning || m.rank || '')}</small>
    </div>`).join('');
  const souls = state.souls.map((m) =>
    `<div class="cb-portrait lost" title="Lost to the Flame"><i style="background:${CULT_HEX[m.color] || '#777'}"></i><span class="cb-name">${esc(m.name)}</span><small>soul</small></div>`).join('');
  const res = P_ORDER.map((k) =>
    `<span class="cb-res ${k === 'fracture' ? 'danger' : ''}" title="${P_SHORT[k]}"><img class="cb-ico" src="/assets/icons/icon_min_${P_ICON[k]}.png" alt="${P_SHORT[k]}"><span class="cb-val">${state.pressures[k]}</span></span>`).join('');
  return `<div class="circle-bar">
    <div class="cb-portraits">${portraits}${souls}</div>
    <div class="cb-res-row">${res}</div>
  </div>`;
}

function gameHTML(ctx) {
  const { state } = ctx;
  return `<div class="hearth-bar">
      <div class="hearth-id"><img class="rune" src="/assets/icons/icon_flame.png" alt="" aria-hidden="true">
        <div><b>Runehold</b><small>${seasonName(state.season)} &middot; Year ${state.year}</small></div>
      </div>
      ${runeMenuHTML(ctx)}
      <span class="hearth-actions">
        <button data-action="open" data-overlay="options">Options</button>
        <button data-action="save-manual">Save</button>
        <button data-action="go-menu">Menu</button>
      </span>
    </div>
    <main class="stage">${stageHTML(ctx)}</main>
    ${circleBarHTML(ctx)}`;
}

// ---- splash + main menu ---------------------------------------------------
function splashHTML() {
  return `<section class="splash" data-action="enter">
    <div class="splash-flame"><img class="splash-mark" src="/assets/icons/icon_flame_gem.gif" alt="" /></div>
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
    <div class="menu-brand"><img class="rune" src="/assets/icons/icon_flame_anim.gif" alt="" aria-hidden="true">
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
  const sections = [{ id: 'display', title: 'Display' }, { id: 'saves', title: 'Saves' }, { id: 'data', title: 'Data' }];
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
  } else {
    main = `<div class="opt"><label>Text size</label><div class="seg">${seg}</div></div>
      <div class="opt"><label>Reduce motion</label>${toggle('reduceMotion', s.reduceMotion)}</div>`;
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
        <button class="fullpage-close" data-action="close" aria-label="Close">&times;</button>
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
