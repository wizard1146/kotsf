# KOTSF — Content Audit

> Rigorous, actionable audit of all shipped content against `NORTH_STAR.md` and
> `ENDGAME_ARC.md`. Ground truth: 53 scenes, 6 expeditions, `creation.json`,
> `roles.json`, `codex/core.json`, and the engine (`state.js`, `conditions.js`,
> `resolver.js`, `effects.js`, `expeditions.js`). Generated 2026-07-23.

## TL;DR — the three things that matter

1. **CRITICAL BUG — 8 expedition skill-checks silently always-lose.** Every
   expedition `test` on `power` / `guile` / `courage` resolves to `undefined→0`
   (the engine's `getPath` cannot read member competence). Consequence:
   **The Champion's Tourney is literally unwinnable** (the crown is behind a
   `power` test), **`hearth_accord` — an endgame flag — is unreachable** (behind
   a `guile` test), and the seizure / ambush branches **always kill the party**.
2. **41 of 47 flags are orphans (set, never read).** The entire creation
   backstory (`deed_*`, `belief_*`, `fear_*`, `mark_*`, `path_*`, `player_*`) and
   every endgame flag (`ember_borne`, `glimpsed_first_memory`, `hearth_accord`)
   gate nothing. Only 6 flags are actually consumed.
3. **The endgame spine is unbuilt.** No Ember counter, no Keepers, no Secret
   Tower, no elevation. Ember-hunt *scenes* exist but feed no campaign counter.

---

## 1. Inventory & shape

**53 scenes** + **6 expeditions** + a creation wizard.

| Scene `type` | Count |
|---|---|
| interactive | 40 |
| quest | 11 |
| news | 2 |

(`quest`-type here = single-scene story beats, distinct from the multi-stage
`content/expeditions/`.)

**Primary tag (first tag = category):**

| Primary tag | Count | | Primary tag | Count |
|---|---|---|---|---|
| cults | 13 | | flame | 5 |
| fracture | 8 | | war | 4 |
| lore | 6 | | tomes | 3 |
| hearth | 6 | | famine | 2 |
| embers | 5 | | coven | 1 |

All-tags (incl. secondary): `lore 14`, `cults 14`, `mana 12`, `fracture 8`,
`hearth 6`, `embers 6`, `war 5`, `flame 5`, `tomes 3`; colour tags
`brown 2, yellow 2, purple 2, green 1, red 1, white 1`, **`blue 0`**. `mana` is a
*secondary* tag on 12 scenes (the mana-gain batch) but never a primary category.

| Well-stocked | Thin / missing |
|---|---|
| Cult diplomacy (13 scenes, all 7 colours touched) | **Keepers / Secret Tower — 0 scenes** (endgame spine) |
| Fracture/war pressure (8) | Coven/personality drama — **1** primary-tag scene |
| Mana economy (12 mana-gain scenes) | Famine/fields — **2** scenes |
| Lore/tomes (6+3) | Recruitment — **2** scenes (`the-old-archons-kin`, `a-wandering-wizard`) |
| Ember-hunt (7 scenes + `bear-an-ember-home`) | Ember *counter* (state) — not implemented |
| Expeditions (6 multi-stage quests) | Recurring named characters / feuds — near-zero |

---

## 2. Skill-check deficits

**44 tests total** — 30 in scenes, 14 in expeditions. 28/53 scenes carry ≥1
test; 10 more have a `requires` gate but no test; **15 are pure narrative** (no
test, no gate): `a-dormant-ember-found`, `a-map-in-the-ash`, `a-rumour-of-embers`,
`draw-from-the-ember`, `the-deepfrost-alignment`, `the-drowned-conjuror`,
`the-land-dispute`, `the-last-true-name`, `the-ley-tide`, `the-lingering-soul`,
`the-restless-wizard`, `the-seam-beckons`, `the-tourney-is-called`,
`word-of-a-living-hearth`, `ash-on-the-wind`.

### 2a. BUGS — tests on non-resolvable paths (always-lose)

`resolveTest` → `getPath` only resolves pressures, `mastery.<school>`,
`cult.<colour>`, `turn`, `year`. A `test.stat` of `power`/`guile`/`courage`
returns `undefined`, coerced to `0` → `P(win)=0/(0+vs)=0`. **These 8 checks can
never be won, silently:**

| Expedition : stage : choice | stat | vs | Consequence of guaranteed loss |
|---|---|---|---|
| `the-champions-tourney : the-final : fight-final` | power | 55 | **Crown unwinnable** — every tourney ends runner-up; the 18-coin/8-faith/6-Regard jackpot is unreachable |
| `the-champions-tourney : the-bouts : press-cheat` | guile | 50 | Cheat path always half-caught (faith−4, fracture+3) |
| `the-rival-hearth-pilgrimage : the-threshold : sue` | guile | 50 | **`hearth_accord` (endgame flag) unreachable** — `sue` always routes to `the-cold-door` |
| `the-rival-hearth-pilgrimage : the-seizure : take` | power | 55 | **Seizure always fatal** — `expedition_end:"lost"`; `hearths_hostile` never set |
| `bear-an-ember-home : the-ambush : fight-through` | courage | 55 | **Always kills the party** (`lost`); the ambush is only reachable via `evade` |
| `bear-an-ember-home : the-hunted-road : evade` | guile | 50 | Always routes into the ambush above |
| `bear-an-ember-home : the-hunted-road : fight-clear` | power | 52 | Always takes the bloodied branch (but still advances) |
| `the-deep-fracture-descent : the-unmaking : press` | courage | 55 | Always fatal; `cut-losses` is the safe alt |

Root cause is doubly clear: every affected expedition sets `partyPick:
"most:power"` / `"most:courage"` / `"most:guile"` — the author *intended* the
party's competence to decide these, but the engine can't read it.
`roles.json` proves member stats *are* wired elsewhere (Steward=wisdom,
Warden=power…), so the model exists; expeditions just never got the hookup.
**Scenes are clean** — every scene test uses a resolvable path, so whoever wrote
the scenes knew the rule and the expeditions author did not.

### 2b. Distribution across masteries vs pressures

**Test stat frequency:** `lore 11, faith 9, mana 6`, mastery `purple 2, white 2,
green 1, brown 1, blue 1` (=7), `flamesRegard 2, coin 1`; plus the 8 buggy
member-stat checks.

- **Pressures dominate; two schools are never checked.** `mastery.red` and
  `mastery.yellow` are **never** a test path (and never trigger/requires either).
  Red and Yellow can raise mastery at creation but the coven can never *show it
  off*.
- **`lore` is the over-used pressure** — 11 of 30 scene tests, 14 tags, and the
  most common trigger path. `faith` (9) and `mana` (6) follow. `provisions` is
  never a test stat despite two famine scenes.
- **Mastery checks are swingy 0%/35% gates.** `mastery.X` starts at 0 unless a
  Circle member holds school X (+16…28) or the player picked that colour (+12).
  So e.g. `the-purple-dare:contest` (mastery.purple vs40) is **0%** for a coven
  with no purple, ~35% for one that has it. Effectively "do you own this school",
  and silently impossible if not — a softer cousin of the 2a bug.

### 2c. Difficulty spread

Resolvable checks cluster **33–54%** at opening pressures — nothing trivially
easy (>60%), nothing certain (bounded model). Examples at start-of-game values
(mana 30/prov 50/coin 35/lore 40/faith 50/Regard 35):
`coin vs30 → 54%`, `faith vs45 → 53%`, `lore vs40 → 50%`, `lore vs55 → 42%`,
`mana vs55 → 35%`, `mana vs65 → 32%`. Two structural notes:

- **Mana checks fire when mana is low.** Many mana-test scenes trigger on
  `mana < 45/50`, so the *effective* odds are worse than the base — the check
  lands exactly when you can least afford it. Punishing but on-theme.
- Several checks reward the same pressure they test (faith-checks that pay faith),
  a mild rich-get-richer pattern.

### 2d. Pure-narrative quests with no checks/gates

15 scenes (listed above) have no test and no gate — notably several **`quest`**
beats (`a-dormant-ember-found`, `a-map-in-the-ash`, `the-last-true-name`,
`word-of-a-living-hearth`, `the-seam-beckons`, `the-tourney-is-called`,
`the-restless-wizard`). "Quest" content is currently the *least* mechanically
interactive — mostly flavour + guaranteed effects.

---

## 3. Colour / school representation

All seven colours receive cult-standing touches, and the +/- balance is healthy
(no colour is purely positive or purely negative):

| Colour | cult+ / cult− touches | mastery `adjust` | mastery `test` | player_* flag read? |
|---|---|---|---|---|
| red | 7 / 8 | 1 (creation) | 0 | **no** |
| yellow | 5 / 2 | 1 (creation) | 0 | **no** |
| brown | 4 / 3 | 2 | 1 | **no** |
| green | 7 / 4 | 2 | 1 | **no** |
| blue | 5 / 5 | 3 | 1 | **no** |
| purple | 4 / 4 | 1 (creation) | 2 | **no** |
| white | 5 / 4 | 1 (creation) | 2 | **no** |

- **Cult standing is the healthiest system in the game** — genuinely zero-sum,
  well-distributed (`a-craft-and-a-grove`, `the-disputed-relic`,
  `the-rite-disputed`, `the-land-dispute` all trade one colour against another).
- **`player_<colour>` is mechanically inert.** All seven are set at creation and
  **never read** by any trigger/requires/advisor-`if`. The Archon's school does
  nothing beyond the +12 mastery nudge — the single most identity-defining choice
  in creation gates zero content.
- **Red & Yellow are flavour-only for mastery** — 0 mastery tests, so their
  standing matters but their *practice* never does. Purple & White are the most
  mechanically live schools (2 tests each). Blue is lore-adjacent but has 0 colour
  tags.

---

## 4. Narrative gaps (vs North Star & Endgame Arc)

- **The endgame spine is essentially unbuilt.** `ENDGAME_ARC.md` needs: Secret
  Tower discovery (0 scenes), the three Keepers — mad / power-lost hermit /
  imprisoned (0 scenes), elevation of 3 Wizards (no effect/subsystem — it's the
  conceptual inverse of `transform_member`, unbuilt), Fracture-close 7-choice
  finale (0 scenes), and the Archon's own tracked stats (absent — creation sets
  no self power/wisdom/guile/courage). None of this exists.
- **Ember density vs the 8–14 target.** Ember-hunt *scenes* are reasonably
  stocked (~7 scenes + `bear-an-ember-home`) but there is **no campaign counter**
  (`embersFound`/`embersGoal`). The flags that *should* feed it — `ember_borne`,
  `ember_taken`, `ember_ally` — are orphans (§5). The hunt currently has no
  destination.
- **Inter-Circle personality drama is the biggest thin spot.** Only **1**
  primary-`coven` scene (`the-coven-divided`), and only **1 conditional advisor
  line in the entire content set** (`the-warrior-levy`, keyed on
  `warriors_allies`/`_enemies`) — expeditions have **zero**. Advisors are static
  two-voice pairs; they almost never react to state, backstory, or each other.
  This directly under-serves North Star #5 (no perfect info) and #6 (distinct
  personalities). The Circle matters via *roles* and *casting selectors*, but
  rarely via *drama*.
- **Warriors / steel-vs-magic** is present (`war` 4–5, plus creation
  `warriors_*`) but shallow — one levy, one gate, and `warriors_disdain` /
  `warriors_none` are orphans, so two of four backstory answers pay off nothing.
- **Recurring characters** barely exist. `the-old-archons-kin` (the usurped
  Archon's sister) is the one true callback; nothing else remembers a name across
  scenes.

---

## 5. Continuity & flag hygiene

**47 flags SET. 6 genuinely READ.** (`__never` is a deliberate sentinel — see
below — not a real flag.)

**Flags actually consumed (the working gates):**

| Flag | Set by | Read by |
|---|---|---|
| `ember_hunt` | `a-rumour-of-embers` | `the-cold-hearth`, `the-rival-hearth` triggers |
| `read_a_failure_tale` | 3 scenes (`the-cold-hearth`, `the-drowned-conjuror`, `the-tower-that-forgot`) | `the-last-true-name` trigger |
| `appointed_usurper` | creation | `the-old-archons-kin` trigger (**best example** — backstory→recurring conflict) |
| `warriors_allies` | creation | `the-warrior-levy` advisor-if |
| `warriors_enemies` | creation | `steel-at-the-gate` trigger, `the-warrior-levy` advisor-if |
| `champion_cheats` | `the-champions-tourney` | same expedition's `requires` (intra-quest branch) |

**41 ORPHAN flags (SET, never READ):**

- Whole creation categories dead: `deed_*` (4), `belief_*` (4), `fear_*` (4),
  `mark_*` (4), `path_*` (4), `player_*` (7), plus `appointed_named/raised/alone`
  and `warriors_disdain/none`. Of ~30 creation flags, **only `appointed_usurper`,
  `warriors_allies`, `warriors_enemies`** ever gate anything.
- **Endgame flags all orphan:** `ember_borne`, `glimpsed_first_memory`,
  `hearth_accord`, `ember_taken`, `ember_ally`, `hearths_hostile`,
  `knows_flame_is_memory`, `kin_feud`, `first_soul_blessing`. Expected (endgame
  unbuilt) but each is a wired-in hook waiting for a consumer.

**Broken gates (READ, never SET):** none real. The only hit is
`the-sealed-stair`'s trigger `{flag:"__never"}` — **an intentional sentinel**:
combined with `selector.js` (followups bypass triggers), it makes the scene
*unlock-only*, fired exclusively by `the-flickering-door`'s `unlock`. Working as
designed, but it *looks* like a bug and defeats flag tooling — worth a comment or
a first-class "unlock-only" idiom.

**Tonal / lore contradictions:** none material. The Runiverse voice
(Forgetting / Embers / Flame-as-memory / Forgotten Souls) is consistent across
scenes, creation, and expeditions. The Flame-is-memory reveal is coherently
seeded (`the-last-true-name` sets `knows_flame_is_memory`;
`the-deep-fracture-descent` and `the-cold-hearth` reinforce it).

---

## 6. Emotional-beat coverage

| Beat | Rating | Reasoning |
|---|---|---|
| **Surprise** | Adequate | Mechanisms exist: `once` scenes, unlock chains, the hidden unlock-only `the-sealed-stair`, random-apprentice `transform_member` loss, the returning-soul naming beat, the `appointed_usurper→the-old-archons-kin` callback. But only **1 conditional advisor** and few "safe choice that still bites"; only one sub-weight-3 gem. Surprise is structural, not authored-in. |
| **Decision** | **Strong** | Nearly every scene has real opposition — cult-vs-cult zero-sum (`a-craft-and-a-grove`, `the-disputed-relic`, `the-rite-disputed`), advisors disagree, no dominant option. Passes the dominant-choice and cosmetic-choice litmus tests. The game's clear strength. |
| **Disappointment (failure writing)** | **Strong** (prose) / undermined by bug | Lose branches are authored and story-generating to the KODP bar — `the-cold-hearth` rekindle ("something in the dead hearth stirred… and did not settle"), `bear-an-ember` lost party. **But** the §2a always-lose bug makes several failures *arbitrary* — the tourney runner-up and the fatal ambush aren't "a tragedy you caused," they're rigged. That violates the honesty principle. |
| **Elation** | Adequate→Thin | Jackpots exist (`the-purple-dare:contest` +16, `the-white-audit:impress` +16, the tourney crown) — but the single biggest hard-won payoff, **the Champion's Tourney crown, is unwinnable** (bug). Hard wins otherwise sit behind sub-35% mana checks. Wins are mostly modest; the peak "risk paid off" moment is broken. |
| **Investment** | **Strong** (systems) / Thin (payoff) | Named Wizards, permanent loss (`transform_member`, expedition `"lost"`), Souls persisting as NPCs, the naming beat, and a rich creation backstory all build attachment. **But** that backstory is ~95% inert (§5), so early investment is rarely repaid. Fixing the orphan flags is the highest-leverage investment win. |

---

## 7. Prioritised recommendations

### P0 — Bugs (fix first; small, high-impact)

1. **Fix the 8 always-lose expedition checks (§2a).** Preferred: teach the
   expedition beat resolver to read the party lead's competence
   (`power`/`guile`/`courage`) instead of `getPath` — this both fixes the bug and
   *delivers* North Star #6 ("who you send matters"), which `partyPick` already
   promises. Cheaper stopgap: rewrite the 8 tests to resolvable paths
   (`mastery.<school>` / a pressure). Either way, **the Champion's Tourney becomes
   winnable and `hearth_accord` becomes reachable.**
2. **Add a content lint to `tools/harness.js`** that rejects any `test.stat` /
   comparison `path` not resolvable by `getPath`. This bug class is currently
   invisible to tooling (a 0% test just always loses, looking like normal play).
   One check would have caught all 8.

### P1 — Highest-value content gaps

3. **Wire the Ember campaign counter** (`state.embersFound` / `embersGoal` 8–14)
   and make `ember_borne`/`ember_taken`/`ember_ally` increment it. This gives the
   whole Ember-hunt a destination and is the first concrete step of the endgame
   spine. (Also un-orphans 3 flags.)
4. **Build the Keepers / Secret Tower first beat.** Even one expedition that
   discovers the Tower (gated on high `lore` + an Ember count) turns the arc from
   "design intent" into playable spine. This is the largest missing narrative
   block.
5. **Deepen inter-Circle drama.** Add conditional advisor lines and a handful of
   `coven`-tag scenes where members feud/grieve/react to state (currently 1
   scene, 1 conditional advisor). This is the cheapest route to North Star #5/#6.

### P2 — Cheap wins (mostly wiring existing orphans)

6. **Pay off the creation backstory.** Read `player_<colour>` somewhere (a gated
   choice or advisor-if per colour), and consume a few `deed_*`/`fear_*`/`mark_*`
   flags. `the-old-archons-kin` (usurper) is the proven template. Enormous
   investment payoff for pure content work — no engine changes.
7. **Give Red & Yellow a mastery check each** so all seven schools can be *shown
   off*, not just banked.
8. **Add conditional advisor lines broadly** (`advisor.if`) keyed on cult
   standing / backstory — only 1 exists; this directly serves "advisors
   disagree / no perfect information."
9. Add a `provisions` test to at least one famine scene (currently never a test
   stat despite being a survival axis).
