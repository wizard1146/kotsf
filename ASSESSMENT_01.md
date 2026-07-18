# Keeper of the Sacred Flame — ASSESSMENT_01

> A full read-through critique of the codebase, design docs, and gameplay loop as of
> 2026-07-19. Companion to `NORTH_STAR.md` (design conscience), `PLANNING_01.md` (world +
> pressure bible), `SCREENS.md` (UI contract), and `ROADMAP.md` (phases). Where this
> assessment and those docs disagree, the disagreement is the point — see §3.
>
> Method: read the full engine (7 modules), `main.js`, `view.js`, `styles.css`, sample
> content, the harness, and all four design docs; ran `node tools/harness.js` across seeds
> 12345 / 777 / 42.

---

## 1. Where the project actually is

**The pitch:** a *King of Dragon Pass*–class storylet game in the Forgotten Runes Runiverse.
You are the Archon of a coven; emergent stories are selected from a scene pool by game-state,
not scripted.

**What exists, honestly:**

| Layer | State |
|---|---|
| Engine | ✅ Complete & clean — 7 tiny pure modules (state, conditions, effects, selector, resolver, loop, save), ~220 LOC total |
| Content model | ✅ Declarative JSON scenes + a small effect/condition vocabulary; schema written |
| Content volume | ⚠️ **13 interactive + 2 news scenes, 4 Circle members, 4 action-screens.** Roadmap Phase-1 target is 30–50; KODP shipped ~544 distinct |
| UI | ✅ All 9 KODP-style screens built (Coven, Fields, Market, War, Cults, Workings, Map, Codex, Saga) + splash/menu/overlays/saves/options |
| Harness | ✅ Headless self-play exists (but see §3a) |
| Art | ❌ None — a single rune glyph placeholder everywhere |
| Tests / CI | ❌ None. Schema validation is still TODO |
| Git | ❌ Not even a repo yet (`git` returns 128) |

The **development process has been documentation-first and architecture-first**, and it shows.
The four design docs are unusually disciplined for a solo project and are the project's biggest
asset. The code is genuinely well-factored — the engine holds a real "one place state mutates"
invariant (`effects.js`) and the UI never imports the engine's writer functions. Protect that
discipline.

---

## 2. Core logic — how it works

The engine is six "verbs" over one plain-data `GameState`:

1. **State** (`state.js`) — 7 pressures (`mana, provisions, coin, lore, faith, flamesRegard,
   fracture`), 7 signed cult tracks, a Circle roster, a Souls roster, flags, saga log. Seeded
   mulberry32 RNG whose integer state is saved — so runs are reproducible (keeps permanent
   Flame-loss honest: no reload-until-she-survives).
2. **Conditions** (`conditions.js`) — pure predicate tree (`all/any/not/flag` + `gte/lte/gt/lt/eq`
   leaves). No eval. Clean.
3. **Effects** (`effects.js`) — the only mutator. `add`, `set`, `set_flag`, `clear_flag`, `unlock`,
   `adjust_cult`, `transform_member`. Pressures clamp 0–100; cults clamp ±100.
4. **Selector** (`selector.js`) — FIFO forced follow-ups, then weighted-random pick over everything
   whose `trigger` currently `meets()`.
5. **Resolver** (`resolver.js`) — skill checks as `P(win) = stat/(stat+vs)`. Bounded, never 0/100%.
6. **Loop** (`loop.js`) — per-tick decay (`lore −3, mana +3, provisions −3, fracture +1`),
   season/year advance, applies a choice, checks end states.

The turn flow in `main.js:advanceToScene()` ticks time until a scene becomes eligible or the year
ends (Tula-style recap), pausing there. Autosave to localStorage every draw. **For the scope, this
is a correct, legible core.**

---

## 3. Core gameplay loop — critique (the important part)

Running the harness: **random play dies of famine at every seed tried (12345, 777, 42)** —
provisions hit 0, fracture ends 66–85. That surfaces several structural issues.

### 3a. The harness only plays *half the game* — so "the engine is proven" is overstated  `[P0]`
The harness answers *scenes* but never touches the **action screens** (Workings / Fields / Market /
War). Yet those screens are the *only* sinks for the two doom tracks:
- **Provisions** decays −3/tick with **no passive regen** — only scene rewards or Fields actions lift it.
- **Fracture** rises +1/tick with the sole repeatable sink being *Mend the Wards* on Workings.

So the loop is: **you cannot survive by answering events alone — you must proactively work the
management screens every season.** That may be intentional, but it means the harness's balance
findings (ROADMAP §7) measure a game no human would play. Until the harness models a *policy* over
the action screens, we don't actually know if the loop is winnable, let alone fun.
**Fix:** give the harness a heuristic bot that also spends its season actions, then re-derive balance.

### 3b. Two silent one-way death spirals, not one  `[P1]`
ROADMAP §7 honestly flags the Fracture spiral, but **provisions is the same shape** and isn't called
out. Three of four decay terms pull toward loss (`lore −3`, `provisions −3`, `fracture +1`); only
`mana` regens. The economy is entropy-on-rails — thematically apt ("The Forgetting") but with no
self-correcting pressure. A KODP economy breathes (good years and bad); this one only exhales.
**Fix:** add windfall/good-harvest pressure so the economy breathes.

### 3c. The Circle is mechanically inert — this fails our own North Star  `[P1, highest creative leverage]`
The **personality test** ("would the outcome differ if a *different* Circle member acted?")
currently **fails everywhere**:
- Advisors only render *conditional flavor text* (`advisorsHTML`) — they never touch a `test` or effect.
- `resolveTest` reads a *pressure* as the skill stat. No member skill, leaning, or temperament enters any roll.
- `transform_member` takes a **random** apprentice — the player chooses the *option* ("send an
  apprentice") but not *whom*, which softly contradicts PLANNING §5a ("never a silent dice-roll that
  erases a beloved advisor").
- Feuds, grief, relationships, "remember how you've treated them" — none implemented.

Right now the Circle is exactly the set-dressing the North Star warns against. Highest-leverage
creative/design fix in the project.

### 3d. Tests use resources as skills — thematically incoherent  `[P1, ties to 3c]`
"Raid a caravan → contest: **Faith** vs 50." Coven *morale* deciding a *raid's* success is odd and
couples badly (fail raid → lose faith → fail next raid). Skill checks want a *skill* axis (a Circle
member's competence at war/lore/guile), which doesn't exist yet.

### 3e. "No perfect information" is violated by the UI  `[P2]`
NORTH_STAR commits to telegraphing odds *in-fiction, not as exact percentages* (one honesty
exception: Flame loss). But `choicesHTML` prints "**contest: Faith vs 50**" — bare numbers on every
test. Currently the worst of both: numeric enough to break fiction, vague enough to feel unfair.
Pick one register.

### 3f. Myth-as-mechanic is entirely absent (acknowledged, Phase 2)  `[P2]`
The Codex exists, but *knowing* lore never improves an outcome, and there are no rune-quests /
Infinity Veil. The **myth test** is unmet by design-stage. It's the mechanic that would most
differentiate KOTSF from "a CYOA with meters."

### 3g. Scene selection has no recency control  `[P1]`
`selector.js` respects `once` but nothing else. The harness shows *The Trembling Ground* firing
back-to-back (Y7 Highsun→Emberfall) and *The Hungry Season* repeatedly. For an "emergent story"
engine, immediate repeats are immersion-killers. **Fix:** cooldown / recency de-weighting (suppress
a scene's weight for N seasons after it fires).

### 3h. Content fails silently — dangerous at scale  `[P0 gate before scaling scenes]`
`getPath` returns `undefined` for an unknown key; conditions and effects then no-op. A typo like
`{"add": ["provsions", 18]}` silently does nothing — no error, no warning. Fine at 13 scenes;
invisible at 500. The schema exists but isn't enforced. Need CI validation + a dev-mode runtime
assert before scaling content, or we'll ship dead choices.

### 3i. Minor
- Docs say "**8 pressures**"; code has 7 in `PRESSURES` + cults as a separate structure. Reconcile the count.
- `transform_member`'s non-apprentice fallback references `rank !== 'archon'`, but no member has rank
  `archon` and the player isn't in the roster. Recruitment is unimplemented, so attrition is strictly
  one-way → the acknowledged softlock risk is live.
- Save is single-version and throws on mismatch — fine now; wants a migration shim before real players have campaigns.

---

## 4. UX — desktop

**Strengths:** the three-zone KODP chrome (hearth bar / stage / circle bar) is the right structure;
clean `100dvh` flex column; faithful, legible IA (10 rune tabs swapping one stage). Overlays, saves,
options, live codex search with focus-restore — all thoughtful.

**Weaknesses:**
- **Everything is one glyph.** Every scene, screen header, map home, recap, and splash reuse the same
  rune. Total visual monotony, zero scene identity. Even *pre-art*, differentiate screens with
  distinct iconography, accent colors, and layout rhythm.
- **Low hierarchy.** One dark-amber palette across all screens means nothing pops. KODP's megalith
  gave every screen a focal object; SCREENS.md §4 already proposes stealing it (active-workings
  stone). Do it — cheapest big win.
- **Bare stat readout.** The circle bar's 7 mono numbers are functional but joyless; trend arrows
  (↑/↓ since last season) would add life for free.

## 5. UX — mobile

Real mobile intent exists: `@media (max-width:720px)` tightens spacing and wraps the rune menu to its
own row; `@media (pointer:coarse)` gives 44px touch targets; `env(safe-area-inset-top)` on the hearth
bar. Good baseline. But the KODP-on-a-phone squeeze is real and **unverified**:
- Top chrome (id + **10-tab** rune row + 3 buttons) and bottom chrome (portraits + **7 resource
  chips**, both `flex-wrap`) both grow to multiple rows on a narrow screen — potentially 35–45% of a
  `100dvh` viewport, crushing the stage. Measure on a real device.
- **10 horizontally-scrolling rune tabs** with no scroll affordance = tabs off-screen and
  undiscoverable on mobile. Consider a "more" menu or a 2-row grid on small screens.
- **Missing bottom safe-area inset:** only `.hearth-bar` handles the notch; `.circle-bar` has no
  `env(safe-area-inset-bottom)`, so on iPhone it can collide with the home indicator.
- Contest/requirement hints as tiny `<em>` are easy to miss on mobile.

Net: mobile is *scaffolded* but not *proven*. Treat "playable one-handed on an iPhone SE" as an
explicit acceptance test.

---

## 6. Roadmap: closing the deficits

Priorities: `[P0]` do now / blocking · `[P1]` next · `[P2]` after.

### Creative deficits (world & narrative)
1. `[P1]` **Characterize the 5 open Cults** (Yellow/Brown/Green/Purple/White) — the last blocking
   design item; each unlocks scene surface.
2. `[P1]` **Make the Circle characters, not chips** — name, voice, leaning, and at least one
   *mechanical* hook per member (a skill axis, a grudge). Ties to Design #2.
3. `[P2]` **Author failure states** — defeat *labels* exist, but the North Star wants losses that read
   as *tragedy you caused*. Bespoke end-copy that names souls lost and the choice that doomed the coven.
4. `[P2]` **Write the first rune-quest** (Infinity Veil) so *knowing lore helps you win* — proves the premise.
5. `[P1]` **Voice/tone style guide** now, before 200 scenes drift.

### Design deficits (systems & balance)
1. `[P0]` **Upgrade the harness to a policy bot** that also plays the action screens; re-derive
   balance. Nothing else is trustworthy until this exists.
2. `[P1]` **Give tests a real skill axis via the Circle** — `resolveTest` reads *who you assigned*,
   not a morale meter. Fixes 3c, 3d, and the personality test at once.
3. `[P1]` **Recency de-weighting in the selector** so scenes don't repeat back-to-back.
4. `[P1]` **Self-correcting economic pressure** (good harvests, windfalls) so the economy breathes.
5. `[P1]` **Let the player choose *who* enters the Flame** (PLANNING §5a).
6. `[P2]` **Implement recruitment** to close the softlock.
7. `[P2]` **Convert exact odds to in-fiction telegraphing** (honor "no perfect information").
8. `[P2]` **Build the active-workings "megalith" system** (SCREENS §4) — focal object + new
   scene-effect lever.

### Technical deficits
1. `[P0]` **`git init` + first commit.** There is no version control. Most urgent item on the list.
2. `[P0]` **Schema validation in CI + dev-mode runtime assert** on unknown pressure/member/flag keys,
   so content can't fail silently. Gate before scaling scenes.
3. `[P1]` **Content-authoring test harness** (load every scene; assert triggers reachable, effects
   reference real keys).
4. `[P2]` **Save migration shim** before real players exist.
5. `[P1]` **Mobile viewport acceptance test** on a real small device; fix the chrome squeeze,
   off-screen tabs, and bottom safe-area inset.
6. `[trivial]` **Reconcile the "8 pressures" doc/code mismatch.**

---

## 7. Go-To-Market: viral sharing as a build-in

The audience is unusually favorable: the **Forgotten Runes community is CC0-native, loves UGC, and
lives on X and Farcaster**, and *King of Dragon Pass* fans are a passionate, underserved
narrative-strategy niche. The free web build is top-of-funnel; Steam wishlist is the conversion
target. Emergent-story games have the best possible share hook: **every run is a story only that
player got.** Build sharing *into the loss/victory screen*, where emotion peaks.

1. **The Shareable Saga Card (do first).** At run end, auto-generate a stylized card + OG-image and a
   one-click share to X/Farcaster:
   > *"I kept the Sacred Flame for 14 years. The Fracture took Runehold in Deepfrost. Wisp is a
   > Forgotten Soul now. Seed: RUNEHOLD-4417."*
   The seed makes it a **challenge** ("beat my seed") — a self-propagating loop. Runs are
   deterministic, so this is real, not cosmetic. Highest-ROI feature; the saga log and seed already exist.

2. **Import your own Wizard (the killer FR-community hook).** Load a player's actual Forgotten Runes
   Wizard by token ID — public on-chain pixel art + name — as a Circle member. Now *their* NFT can die
   in the Flame and become a named Forgotten Soul. Enormous, canon-aligned share incentive with a
   built-in audience of 10,000 holders. **Guard the license/trademark boundary** (PLANNING §1): public
   metadata only, never imply official endorsement, keep the "fan project" framing clean.

3. **The Book of Forgotten Souls** — a public, aggregated memorial of every player's lost Wizards by
   name. A social object that outlives any single run.

4. **Seed leaderboards / daily seed** — a shared daily seed turns solo play into a communal event;
   gives streamers/Discord a recurring beat.

**Sequencing:** free web demo → Saga Card first (viral loop online before spending on art) → Wizard
import as the FR-community launch moment → point all of it at a Steam wishlist page. Saga Card + seed
challenges are the *engine* of virality; Wizard import is the *spark* for the FR community specifically.

---

## 8. One-line verdict

The architecture and design discipline are genuinely strong — better than most solo games at this
stage — but the project has been *building screens* faster than it's been *proving the loop is fun*.
The two highest-leverage moves: (1) make the Circle mechanically matter (the soul of the KODP formula,
currently absent — §3c), and (2) a harness that plays the *whole* game so balance numbers mean
something (§3a). And before either: `git init`.
