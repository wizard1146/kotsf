# Keeper of the Sacred Flame — The Endgame Arc

> **Status: design intent, not yet built.** This is the canonical spec for KOTSF's
> long-arc win condition — the spine that turns the emergent season-to-season game
> into a campaign with a destination. Captured from WY's design brain-dump
> (2026-07-22). Cross-referenced from `ROADMAP.md` and `NORTH_STAR.md`.
>
> Nothing here is implemented yet. The **expedition subsystem** (`src/engine/expeditions.js`,
> `content/expeditions/`) is the first primitive built toward it — the Tower, the
> Keepers, and the player's own adventuring are all expeditions.

---

## The spine (in order)

1. **Discover the Secret Tower's location.** A major lore milestone — the seat of the
   original Sacred Flame, dark since the Keepers left (see the Embers/Flame-as-memory
   myth). Found via lore accumulation + an expedition.

2. **Discover the three original Keepers** *(optional)*. Those who broke the Flame into
   Embers and scattered. Each is found in a fallen state:
   - one has **gone mad**;
   - one has **lost their power** and become a **martial-artist hermit** (body, no magic);
   - one has been **imprisoned**.

3. **Try to redeem all three** *(optional)*. Each is a quest/expedition with its own
   branch. **If not found or not redeemed, you can still progress without them** — they
   are a strength multiplier and an ending-shaper, not a gate.

4. **Recover all the Embers.** A **random target each game, between 8 and 14.** This is
   the main campaign counter. Ties directly to the existing Ember-hunt content
   (*A Rumour of Embers*, *The Cold Hearth*, *The Rival Hearth*).

5. **Elevate three Wizards to restore the Sacred Flame** — only **after all Embers are
   recovered.** The three may include any recovered original Keepers.
   - **Fail to elevate → the game deteriorates** (a decline state / soft-fail pressure).
   - **Elevate successfully → SOFT WIN.**

6. **Close the Fracture** *(only if you won "hard enough")*. A final story-progression
   sequence of **seven choices — thin chances, a few dice rolls.**
   - **Close the Fracture → HARD WIN.**

---

## Elevation, self-stats, and the endings

**You can elevate yourself.** This is the big structural consequence: the **Archon
(the player) must have their own tracked skillset** — power / wisdom / guile / courage,
like any Wizard — so that self-elevation is meaningful. *(Non-trivial to track; flagged
as "eep" by WY. See Open Questions.)*

Endings keyed on **who you elevate** and **whether you elevate yourself:**

| Path | Ending |
|------|--------|
| Win **without** elevating yourself | **Orchestrator of the Flame** — you restored it but stayed the conductor, not the fuel. |
| Win **as a Keeper** (you elevated yourself as one of the three) | **Keeper of the Sacred Flame** — the title ending. |
| Raise **one** Wizard to become the **sole Keeper** (thin pathway) | Under-specified. Likely a **corruption** ending — absolute keepership as a dark outcome. **TBD.** |

- **Soft win** = Flame restored (step 5). **Hard win** = Fracture closed (step 6).
- Alternate endings **TBD.**

---

## The player as adventurer (adventure mode)

Once the Archon has their own stats, they can **personally adventure** (not just send
parties). To leave the hold:

- **Appoint a caretaker / steward** to run Runehold in your absence.
- The game screen **locks down** — everything except your **minute-to-minute, day-to-day
  adventure decisions with your travelling party** is hidden. A distinct **Adventure Mode**
  UI, separate from the hold-management shell.

This reuses the expedition subsystem but with the player *in* the party, at a finer time
granularity than the season loop.

---

## How it connects to what already exists

- **Embers** → the Ember target (8–14) becomes a campaign counter (`state.embersGoal` /
  `state.embersFound`), fed by the existing Ember scenes.
- **Elevation** → conceptual inverse of `transform_member` (a Wizard *ascends* rather than
  falls to a Soul). New effect/subsystem.
- **Expeditions** (built) → the vehicle for finding the Tower, redeeming the Keepers, and
  the player's own adventuring. Multi-stage, take members out of circulation, return over
  seasons — already in place.
- **Fracture** → the existing `fracture` pressure; the seven-choice finale is its payoff.
- **Souls & the returning-soul naming beat** (built) → tonal groundwork for the Keepers'
  fallen states and the cost of the road.

---

## Open questions / TBD

- The **sole-Keeper corruption** ending — barely sketched.
- **Alternate endings** beyond the three named.
- **Self-stat model**: how the Archon's stats are set at creation, and how they grow
  (elevation? adventuring? deeds?).
- **Adventure-mode UI**: the locked-down screen, the finer time granularity, party
  micro-decisions, and how a caretaker/steward runs the hold meanwhile.
- **Deterioration state** when elevation fails — is it a slow decline, a countdown, a new
  pressure?
- Sequencing/gating: how much of steps 1–3 is truly optional vs. soft-required for the
  hard win.
