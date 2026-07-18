# Keeper of the Sacred Flame — Screens & Chrome

Companion to `PLANNING_01.md` (world + pressures) and `ROADMAP.md` (architecture + phases).
This doc defines the **screen architecture**: the persistent chrome, the screen set, and how
each screen is implemented over existing engine state. It adapts *King of Dragon Pass*'s
interface (the design lineage in PLANNING §0) to KOTSF.

---

## 1. The KODP model we're adapting

KODP divides the screen into **four parts** (verbatim from its GUI):

1. **Season bar** (top) — season, clan name, year, and a triskelion to advance time.
2. **The menu** — a half-disk of **runes**; clicking a rune swaps the main screen. Nine runes:
   Farming · Relations · Trade · War · Clan · Magic · Map · Background · Saga. A glowing rune = current screen.
3. **The main screen** (center) — swaps per rune. Every screen is anchored by a **megalith**, a
   central stone displaying the gods' **active blessings**.
4. **The Clan bar** (bottom) — the Clan Ring portraits (leader marked with a circle rune; each
   portrait tagged with its deity rune) **plus** resources: Cattle, Goods, Food, Population,
   Weaponthanes, Magic.

Two special modes:
- **During events**, the season bar + menu **hide** (more room for the scene); the Clan bar stays.
- **End of year**, the **Tula view** takes the whole screen: your lands + a recap of the year.

---

## 2. KOTSF chrome (our adaptation)

Three persistent zones for the **game** screen (the splash/menu/overlays are separate, see §5):

- **Hearth bar** (top, `.hearth-bar`) — the coven seat **Runehold**, the **season · year**, an
  advance-time control (triskelion analog), and the **rune menu** that swaps the stage.
- **The Stage** (center, `.stage`) — swaps among screens via one controller field, `gameView`.
  Target motif: a central **Hearth-rune / Flame stone** showing **active workings** (our megalith
  analog — see §4). The default stage is **The Season** (the current event / quiet-season view).
- **Circle bar** (bottom, `.circle-bar`) — the Circle's advisor portraits (leader marked, each with a
  color/leaning rune) plus a compact **resource readout** (the pressures). The Clan-bar analog.

Special modes (parity with KODP):
- **Scene mode** — when an event is active, keep the focus on the Stage and the Circle bar.
  (We currently keep the bar always visible and let the rune menu browse; hiding the menu during
  events is an optional later tweak.)
- **The Runehold view** (Tula analog) — at end of year, a fullscreen **year recap** + the coven's
  standing. *(Not yet built — Phase 2 cadence beat.)*

---

## 3. The screen set — KODP rune → KOTSF screen

Near 1:1 with KODP's nine runes. Every screen is a **view over existing state**; none requires an
engine rewrite (the one exception, active workings, is small and additive — §4).

| KODP rune | KOTSF screen (`gameView`) | Reads / writes | Status |
|---|---|---|---|
| Clan | **The Coven** (`coven`) — roster, Faith/morale, the Souls memorial *(recruit/organize: planned)* | `circle`, `souls`, `faith`; recruitment (anti-softlock, PLANNING §5a) | **built** ✅ |
| Farming | **The Hearth-fields** (`fields`) — proactive labours vs famine (drive harvest, bless, buy seed, forage) | `provisions`, `actionsUsed` | **built** ✅ |
| Trade | **The Stock Sanctuary** (`market`) — convert coin ↔ mana/provisions, buy Red favour | `coin`, `mana`, `provisions`, `cult.red`, `actionsUsed` | **built** ✅ |
| War | **Magic vs Steel** (`war`) — raid (gain + Fracture), muster, fortify, hire Warrior steel (Faith cost) | `provisions`, `coin`, `fracture`, `faith`, `actionsUsed` | **built** ✅ |
| Relations | **The Seven Cults** (`cults`) — standing per color, alliance/enmity, envoys | `cults` — **signed −100…+100** (ROADMAP §7 ✓) | **built** ✅ |
| Magic | **Workings** (`workings`) — spend Mana on workings; ward the Fracture, hold Lore, court Regard | `mana`, `lore`, `fracture`, `flamesRegard`, `actionsUsed` | **built** ✅ |
| Map | **The Runiverse** (`map`) — stylized data-driven map: Runehold, the seven cult holds (live standing), the Secret Tower, the Fracture's creeping ash, uncharted holds | `cults`, `fracture` | **built** ✅ |
| Background | **The Codex** (overlay) — myths, world, glossary | `codex` | **built** ✅ |
| Saga | **The Saga** (`saga`) — the running chronicle of Runehold's deeds | `state.saga` | **first slice** ▶ |
| *(events)* | **The Season** (`scene`) — the storylet decision; the default stage | `scenes`, all pressures | **built** ✅ |

So of KODP's screens: **two already exist** (Codex ≈ Background; The Season ≈ events), the **Saga**
is nearly free (data exists), and the rest are new views over state we already model.

---

## 4. Two motifs worth stealing

- **The megalith → active workings.** KODP shows the gods' active blessings on a central stone on
  every screen. We have no active-effects system yet. Adopting one — a small `state.workings` list
  of temporary blessings/curses (id, label, remaining duration, effect) ticked in `loop.js` — gives
  every KOTSF screen the same central anchor (a Hearth-rune showing what's currently empowering or
  afflicting the coven) and a new lever for scene effects. **Additive, low-risk; recommended.**
- **The Tula view → the Runehold year-recap.** An end-of-year fullscreen beat (lands + what changed
  this year, drawn from the saga) gives the campaign an annual rhythm and a natural autosave point.

---

## 5. How screens are implemented (the contract)

Two reusable patterns already in the codebase — split the screens between them; **do not** add a third.

1. **`gameView` stage-swap** (the KODP model) for the *interactive management* screens — Coven,
   Fields, Market, War, Cults, Workings, Map, Saga, and the default Season. One controller field
   (`gameView`) selects which view `stageHTML()` renders; the Hearth bar + Circle bar persist as
   chrome. Switching a view **does not advance time** — it's pure presentation. Events pull focus
   back to the Season view.

2. **Full-page overlays** (`fullpage()` + the `panel-*` layout) for *reference* screens — the Codex
   (≈ Background), Options, Saves. These layer on top of any screen.

**Per-screen actions (Workings, Fields, …).** Proactive between-event levers are unified as one
data pool: `content/actions/*.json`, each action `{ id, screen, label, desc, requires, effects }`.
The cost is folded into `effects` (a negative `add`); `requires` gates affordability; each is usable
**once per season** (`state.actionsUsed`, reset each tick). One renderer (`actionScreenHTML`) and one
handler (`doAction`) serve every action-screen — a new action-screen is just content + a `gameView`
branch. This is how Mana→Fracture (Workings) and Coin/Faith/Mana→Provisions (Fields) levers exist.

Invariants:
- The **engine never knows about screens.** `gameView` lives in `main.js` only, like `overlay`.
- A screen is a pure `ctx → HTML` function in `view.js`; it reads state, never mutates it. Actions on
  a screen go through the existing `data-action` dispatch and the engine's effects, same as scenes.
- Screens that want a list+detail split reuse the `panel-*` sidebar layout (Cults, Coven).

---

## 6. Build order

1. **Chrome + The Saga** — Hearth bar, rune menu, Circle bar, `gameView` swap; Saga as the first real
   stage (data exists). Proves the pattern end-to-end. ▶ *in progress*
2. ~~**The Seven Cults**~~ — **done.** Signed-standing fix (ROADMAP §7 #2) landed with it; the screen renders the ±100 meter.
3. ~~**The Coven**~~ — **done** (roster, Faith, Souls memorial). Recruit/organize actions still to wire (needs the recruitment mechanic, PLANNING §5a).
4. ~~**Workings**~~ — **done.** Mana sink (§7 #3) + the Fracture's player-controlled counter (§7 #1).
5. ~~**The Hearth-fields (Fields)**~~ — **done.** Player-facing famine levers; generalized the per-screen **action** system (one data pool + renderer + handler).
6. ~~**The Stock Sanctuary (Market)**~~ — **done.** Coin ↔ mana/provisions trades + buy Red favour. Pure content + a one-line `gameView` branch — validates the unified action system.
7. ~~**Magic vs Steel (War)**~~ — **done.** Raid / muster / fortify / hire mercenaries; the steel-vs-pride tension as a Faith cost.
8. ~~**The Runiverse (Map)**~~ — **done.** Stylized data-driven map (no art assets); cult holds show live standing, the Fracture's ash creeps in. **All 9 rune-menu screens are now built.**

**Next horizons (post-9-screens):** the two motifs from §4 (active workings / megalith; the Tula-style end-of-year **Runehold recap**), real **recruit/organize** actions on the Coven (the recruitment mechanic, PLANNING §5a), richer map (real geography/art), and continuing to **scale the scene pool** toward ~30–50 (ROADMAP Phase 1).
5. **Active workings system** (§4) — the megalith motif; unlocks richer scene effects.
6. **The Runiverse Map** and **The Runehold year-recap** — Phase 2, more content/art.
