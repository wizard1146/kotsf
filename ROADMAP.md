# Keeper of the Sacred Flame — Development Roadmap & Architecture

Companion to `PLANNING_01.md`. Covers the tech decision, the minimalist architecture, the structured file system for scenes, the scene data contract, and the phased build plan.

---

## 1. Tech stack decision (Steam-bound)

**Decision: plain JavaScript (ES modules) + HTML/CSS UI, dev with Vite, packaged for desktop/Steam with Tauri 2.** *(TypeScript was considered and ruled out by preference; the JSON Schema in `content/schema/` covers content validation in its place.)*

### Why this, for *this* game
- **It's a text-forward storylet game.** The engine's bulk is UI: rendering scene text, choice buttons, stat panels, the Circle, save/load. **HTML/CSS is the most powerful, least-code text/UI system in existence** — rich text, scrolling, responsive panels, theming come nearly free. This is the single biggest lever on "minimalist codebase."
- **Content-as-data.** The game is ~85% authored content (JSON scenes) + a tiny engine. JS reading external JSON keeps the engine small and the content browsable/diffable in git.
- **One codebase → web *and* Steam.** Ship the same core to the browser (marketing demos, reach) and wrap it with **Tauri** for desktop. Tauri uses a Rust shell with the OS webview → tiny binaries (vs. Electron's bundled Chromium).
- **Steam integration is solved.** Achievements / cloud saves / overlay via **steamworks.js** (or a Tauri Steamworks plugin) when we need them. Steam happily distributes Tauri/web-wrapped games.
- **No engine royalties, no vendor lock.**

### The alternative (named, not chosen)
- **Godot 4 (GDScript)** — the right call *if we drop web and go Steam-only*, or if we later want rich real-time animation, native gamepad/audio, and Steam-native features without a binding (via GodotSteam). Trade-off: rebuilding rich text UI in Control nodes is more verbose than HTML/CSS for a text-heavy game. **Swap target if priorities change.**
- Unity / Love2D / Monogame — overkill or more DIY for a UI-driven narrative game. Not recommended.

> **Architecture insurance:** keep the **engine logic pure and renderer-agnostic** (no DOM calls inside `engine/`). If we ever migrate to Godot, the state model, condition evaluator, selector, and resolver port directly; only the `ui/` layer is rewritten.

---

## 2. Minimalist architecture principles

1. **Logic ≠ content ≠ presentation.** Three hard-separated layers. The engine never hard-codes a scene; content never contains logic beyond declarative conditions/effects.
2. **No `eval`.** Conditions and effects are **declarative data** interpreted by a tiny safe evaluator — never executable code in content files. (KODP used a custom scripting language; we use small JSON expressions instead.)
3. **The engine is a storylet machine:** eligible-scene selection over a shared state blob, weighted pick, present, resolve choice, mutate state, repeat. Target: engine core in the low hundreds of lines.
4. **Content is the product.** Scenes are flat files, one concern per file, validated against a JSON Schema in CI.
5. **Renderer-agnostic core** (see insurance note above).

---

## 3. Structured file system

```
kotsf/
├── PLANNING_01.md
├── ROADMAP.md
├── package.json              # type:module; `npm run dev` / `harness` / `bundle`                [built]
├── index.html                # page shell, loads /src/main.js                                   [built]
│
├── src/
│   ├── main.js               # UI controller: wires engine → view, turn flow, autosave         [built]
│   ├── ui/
│   │   ├── view.js           # pure render: state → HTML                                        [built]
│   │   └── styles.css        # dark / runic / flame-lit theme                                   [built]
│   └── engine/               # renderer-agnostic — NO DOM here
│       ├── state.js          # GameState: 8 pressures, flags, circle, souls, cults, seeded RNG  [built]
│       ├── conditions.js     # safe declarative condition evaluator (no eval)                    [built]
│       ├── effects.js        # the ONLY place state mutates                                      [built]
│       ├── selector.js       # storylet eligibility + weighted pick + forced follow-ups          [built]
│       ├── resolver.js       # skill-check resolution (seeded RNG)                                [built]
│       ├── loop.js           # the heartbeat: advanceTime / applyChoice / checkEnd               [built]
│       └── save.js           # serialize / deserialize (versioned)                               [built]
│
├── content/                  # THE GAME — data only, no logic
│   ├── scenes/
│   │   ├── interactive/      # cult tension, fracture-mending, soul/circle scenes               [built: 13]
│   │   ├── news/             # ash-on-the-wind, the-long-dark                                    [built: 2]
│   │   └── quests/           # (Phase 2: Infinity Veil rune-quests)
│   ├── circle/               # vela, korr, ember, wisp                                           [built: 4]
│   ├── cults/                # (Phase 2: the seven Color Cults)
│   ├── strings/              # (Phase 2: shared text, lore glossary)
│   └── schema/
│       └── scene.schema.json # JSON Schema — the content contract                               [built]
│
├── tools/
│   ├── harness.js            # headless engine proof: play N turns, print the saga              [built]
│   ├── bundle.js             # collect content/ → content/bundle.json (no bundler)              [built]
│   └── serve.js              # zero-dep dev server (builds bundle + serves)                     [built]
│
├── assets/                   # (art/audio land in Phase 1–3)
│
└── src-tauri/                # (Phase 3: desktop/Steam shell)
```

**Conventions**
- One scene per file: `content/scenes/interactive/<id>.json`, where `<id>` is kebab-case and matches the file's `id` field.
- Art referenced by relative path from the scene file; missing art falls back to a placeholder (so writing is never blocked on art).
- Scene `id`s are **stable identifiers** — never renamed once authored (follow-ups and saves reference them).

---

## 4. The scene data contract

The atom we author (text + trigger + mutation, together). Declarative throughout — no executable code.

```jsonc
// content/scenes/interactive/the-flickering-door.json
{
  "id": "the-flickering-door",
  "type": "interactive",            // interactive | news | quest
  "title": "The Flickering Door",
  "art": "art/scenes/secret-tower-basement.png",
  "music": "infinity-veil",         // optional
  "weight": 10,                      // selection weight among eligible scenes
  "once": true,                      // fire at most once per campaign

  // ELIGIBILITY — declarative condition over GameState. No eval.
  "trigger": {
    "all": [
      { "gte": ["flames_regard", 30] },
      { "lt": ["lore", 40] },
      { "flag": "found_secret_tower" }
    ]
  },

  "intro": "A door breathes light at the foot of the stair. Behind it, the Flame waits...",

  // The Circle weighs in (optional) — advisors react per leaning.
  "advisors": [
    { "member": "vela-the-blue", "if": { "lt": ["lore", 40] },
      "text": "We are forgetting faster than we learn. The Flame remembers. Use it." },
    { "member": "korr-ashen",
      "text": "And what walks back out wearing our faces? I have buried Souls before." }
  ],

  "choices": [
    {
      "id": "step-into-flame",
      "label": "Send an apprentice into the Flame",
      "requires": { "gte": ["mana", 10] },
      "test": { "stat": "flames_regard", "vs": 50 },   // optional skill check
      "win": {
        "text": "She returns wreathed in old knowledge, eyes bright and strange.",
        "effects": [
          { "add": ["lore", 25] },
          { "add": ["flames_regard", 10] },
          { "set_flag": "first_soul_blessing" }
        ]
      },
      "lose": {
        "text": "What returns is not her. The Circle does not speak for three days.",
        "effects": [
          { "add": ["faith", -15] },
          { "transform_member": "random_apprentice_to_soul" }
        ]
      }
    },
    {
      "id": "seal-the-door",
      "label": "Seal the door. Some things should stay forgotten.",
      "win": {
        "text": "You wall the stair with rune and stone.",
        "effects": [
          { "add": ["flames_regard", -5] },
          { "add": ["faith", 5] },
          { "unlock": "the-sealed-stair" }   // queues a follow-up scene
        ]
      }
    }
  ]
}
```

**Evaluator surface (kept tiny):**
- Conditions: `all` / `any` / `not`, plus leaf ops `gte` `lte` `gt` `lt` `eq` over a pressure or counter, and `flag` checks.
- Effects: `add` (delta to a pressure), `set` / `set_flag` / `clear_flag`, `unlock` (queue follow-up), `transform_member`, `adjust_cult` (one of the seven).
- Tests: `{ stat, vs }` → resolver compares stat to difficulty with bounded RNG → win/lose branch.

This surface is intentionally small; it covers KODP-class scenes without a scripting language.

---

## 4b. Screen architecture — the two UI patterns  *(absorbed from the retired `SCREENS.md`)*

The interface is the KODP chrome (Hearth bar / Stage / Circle bar) over the pressure model, built from
**exactly two reusable patterns — do not add a third:**

1. **`gameView` stage-swap** — the *management* screens: Coven, Fields, Market, War, Cults, Workings,
   Map, Saga, and the default **Season** (the current event). One controller field (`gameView` in
   `main.js`) selects which view `stageHTML()` renders; the Hearth bar + Circle bar persist as chrome.
   Switching a view **never advances time** — pure presentation; events pull focus back to the Season.
2. **Full-page overlays** (`fullpage()` + the `panel-*` layout) — the *reference* screens: Codex, Options,
   Saves. They layer on top of any screen.

**Per-screen actions** (Workings, Fields, Market, War) are one data pool: `content/actions/*.json`, each
`{ id, screen, label, desc, requires, effects }` (cost folded into `effects`, gated by `requires`, usable
once/season via `state.actionsUsed`). One renderer (`actionScreenHTML`) + one handler (`doAction`) serve
them all — a new action-screen is just content + a `gameView` branch.

**Invariants:** the engine never knows about screens (`gameView`/`overlay` live in `main.js` only); a
screen is a pure `ctx → HTML` function in `view.js` that reads state, never mutates it; list+detail
screens (Cults, Coven) reuse the `panel-*` sidebar layout. *(UI-shell specifics — Split layout, the
hand-of-cards Circle bar, the hamburger, and the "redraw kills CSS transitions" gotcha — are documented in
the code + agent memory, not here.)*

**Motifs still worth stealing (not yet built):** the KODP *megalith* → a central Hearth-rune showing
**active workings** (a small `state.workings` list of temporary blessings/curses ticked in `loop.js`);
and the *Tula view* → a fullscreen **end-of-year Runehold recap** (an annual rhythm + natural autosave point).

---

## 5. Phased roadmap

### Phase 0 — Foundations (the spine) ✅ in progress
- [x] World + pressure-system bible (`PLANNING_01.md`)
- [x] Architecture + file system + scene contract (this doc)
- [x] Resolve the open design questions in `PLANNING_01.md §5` — title (KOTSF), license (not CC0), Flame/Soul (permanent), time model (finite, victory-horizon) all DECIDED; **only color characterizations remain**
- [x] ~~Confirm CC0 license~~ — **DECIDED: not CC0.** Hybrid model; commercial OK with stipulations above a revenue threshold (confirm exact threshold + lawyer review pre-Steam)

### Phase 1 — Vertical slice (~1–2 weeks focused) — *prove the loop is fun*
- [x] `engine/`: state model (8 pressures), condition evaluator, effects, selector, resolver, loop, save
- [x] JSON Schema for scenes (content contract); CI validation still TODO
- [x] Headless harness — engine proven playing itself end-to-end (`npm run harness`)
- [x] 4 Circle members; 6 scenes (5 interactive + 1 news) wired to live state
- [x] `ui/`: scene view + pressures/cults/Circle/saga panels (web, HTML/CSS), autosave, end screens
- [ ] Scale to ~30–50 interlocking scenes; the seven Cults stubbed as data  ← **in progress: 15 scenes** (cross-cult tension, Fracture-mending, Soul/Circle beats). Cults now have a screen + signed standings.
- [ ] Placeholder/AI art pipeline (writing never blocked on art)
- [ ] **Balance fixes surfaced by the harness** (see §7)
- **Definition of done:** a playable 30-minute loop where pressures visibly drive scene selection and choices feed back into state. Measure our real **scenes-per-day** authoring velocity here.

### §7 — What the first harness run revealed (honest findings, not blockers)
1. **The Fracture is a one-way death spiral.** It only rises (+1/tick, +raids, +ash); its sole *content* sink (`the-sealed-stair` reinforce, −4) is gated behind sealing the Flame door. **Partially addressed:** the **Workings** screen adds a repeatable player-controlled sink — *Mend the Wards* (−6 Fracture for 12 Mana, once/season). Random play still loses (it never works the wards — by design; the fix is a *player tool*, not an auto-win). Remaining: more Fracture-reducing *scene* choices so it's not solely a Workings chore.
2. ~~**Cult standing is clamped 0–100, so enmity is impossible**~~ — **RESOLVED.** Standings are now **signed (−100…+100)**, neutral at 0; refusing a cult can now make a sworn enemy. `effects.js` clamps `cult.*` to ±100 (pressures stay 0–100). Visualized on the new **Cults screen** (see §4b).
3. ~~**Mana is too abundant**~~ — **RESOLVED.** Regen trimmed **+5→+3/tick** (`loop.js`) and the **Workings** screen gives Mana a real sink (8–16 each, one of each per season). Harness now ends Mana ~12 instead of pinned at 80.
4. **The model already produces emergent story.** Seed 12345: an apprentice (Wisp) lost to the Flame in Year 1, then years of hunger and forgetting, the Fracture creeping to catastrophe by Year 9 — a coherent tragic arc from random choices. The core premise works.
5. **The harness only plays *scenes*, never the action screens** (Workings / Fields / Market / War) — the
   only sinks for Provisions and the Fracture. So its balance numbers measure a game no human plays
   (random play dies of famine at every seed). **Open (the P0 from the retired `ASSESSMENT_01.md`):** give
   the harness a heuristic policy that also spends each season's actions, then re-derive balance. Companion
   open item: scale the scene pool toward 30–50 (Phase 1).

### Phase 2 — Substantial demo (~1–2 months part-time) — *prove the world*
- [ ] ~150 interactive scenes; news system live; first rune-quest (Infinity Veil)
- [ ] Full Circle with relationships/feuds; all seven Cults characterized
- [ ] The Flame/Soul mechanic fully wired (per the §5 stakes decision)
- [ ] First-pass balance + playtesting; The Fracture doom clock active
- [ ] Web build published (marketing/wishlist driver)

### Phase 3 — Steam-bound build (~4–9 months, content-dominated) — *ship*
- [ ] Add `src-tauri/`; desktop packaging (Win/Mac/Linux)
- [ ] Steamworks integration (achievements, cloud saves, overlay) via steamworks.js
- [ ] Scale toward KODP-class content (target set with Phase-1 velocity data, not guessed)
- [ ] Consistent art pass; audio; settings; accessibility
- [ ] Balance iteration (the irreducible, playtest-bound long pole)
- [ ] Steam page, wishlist campaign, Early Access decision

---

## 6. Open decisions blocking build
Tracked in `PLANNING_01.md §5`. **Flame/Soul stakes: DECIDED — permanent** (see `PLANNING_01.md §5a`). Engine consequence: `transform_member` **moves** a member from the `circle` roster to a `souls` roster (persists as an NPC) rather than deleting them; recruitment paths must outpace worst-case attrition to avoid softlock. Remaining open items: color characterizations (Yellow/Brown/Green/Purple/White), time model (seasonal/finite vs. open-ended), and CC0 confirmation.

---

## 7. Web build & deploy (PWA — live)

The web build is **static / serverless** — `tools/serve.js` is dev-only (ES modules + `fetch` need an http
origin locally); production is just files on a static host.

- **Live at** `wizard1146.github.io/kotsf/` (GitHub Pages, repo `wizard1146/kotsf`, branch `main`).
- **All asset paths are relative** (never root-absolute `/…`) — the Pages *project* subpath `/kotsf/`
  would 404 them otherwise. Applies to `index.html`, `main.js`'s bundle fetch, `styles.css` `url()`s,
  `view.js` icon srcs, `manifest.webmanifest`, and `sw.js` (which resolves its precache list against its
  own directory).
- **PWA:** installable + offline via `manifest.webmanifest` + `sw.js` (precache the app shell, runtime-cache
  the rest). **Bump the `CACHE` string in `sw.js` (`kotsf-vN`) on every shell change** so returning players
  update. `content/bundle.json` must stay committed (the static deploy fetches it).
- The Phase-3 Tauri/Steam wrapper (§5) is separate; this is the web / marketing build.
