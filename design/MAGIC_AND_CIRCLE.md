# Magic & the Circle — design (draft)

> Turning the "magic in a magic game" gap into a system. Grounded in canon (the seven colour schools +
> the 9 practitioner classes, per `Wizards_(Runiverse)`) and our locked calls:
> **(B) per-school Mastery tracks · casting always names a caster, defaulting to the second-in-command · all 9 classes.**
> Companion to `PLANNING_01.md` (pressures), `ROADMAP.md` (engine), `NORTH_STAR.md` (the personality test).
>
> Status: **proposal — decide the open questions, then build in slices.** Nothing here is in the engine yet.

---

## 1. The three layers of magic

Magic = **School × Class × Rune-lore**, performed by a **named caster**.

- **School (colour)** — the *flavour*. Canon: Red (wealth/binding), Blue (knowledge/science), Yellow (time),
  Green (nature), Brown (practical), Purple (chaos), White (order). This is the same seven axis we already
  model as cults — now it also carries magic.
- **Class** — the *verb*. The advisor's specialty (the 9 canon classes, §3).
- **Rune-lore** — the *memory of how*. Our existing **Lore** meter (general) + the new per-school **Mastery**.

## 2. Mastery — the coven's school-knowledge  *(the "B" tracks)*

A new engine track: `state.mastery = { red, yellow, brown, green, blue, purple, white }`, each **0–100**.
Distinct from `state.cults` (diplomatic **standing**, −100…+100): you can be at war with Blue and still
practise Blue magic. Mastery = *how much of that school Runehold has recovered and holds.*

- **Decays** slowly (the Forgetting — thematic; rate TBD, maybe tied to Lore).
- **Gained** via rune-quests into the Infinity Veil, certain workings, Blue-Athenaeum trades, recruiting a
  master of that school.
- **Gates** workings & quests: a high working needs `mastery.<school> ≥ req`.
- Engine: extend `getPath` for `mastery.<school>`; add an effect `{ "adjust_mastery": ["yellow", +8] }`
  (mirrors `adjust_cult`); conditions can read `{ "gte": ["mastery.yellow", 40] }`.

## 3. The nine classes  *(what each advisor DOES)*

Each Circle member has one class. Loosely school-affiliated but not 1:1 (a Blue Necromancer is fine).

| Class | Verb in KOTSF |
|---|---|
| **Magus** | generalist — reliable at any school, master of none |
| **Sorcerer** | raw power — big effects, higher backfire variance |
| **Druid** | nature/Green — provisions, herds, healing the coven |
| **Necromancer** | death/Souls — dark workings; raise/bind; strong with Forgotten Souls |
| **Pyromancer** | fire/the Flame — Regard, Faith, the hearth; best at Flame rites |
| **Enchanter** | wards & objects — Fracture wards, buffs, protecting Runehold |
| **Charmer** | the social art — cult standing, envoys, **recruitment** |
| **Chaos Mage** | Purple/chaos — high-variance, unpredictable swings |
| **Ghost Eater** | consumes spirits — the unique lever on **Forgotten Souls** (consult / lay to rest / devour for power) |

## 4. Casting — why WHO matters (the NORTH_STAR personality test, finally real)

A working/quest is `{ school, class_affinity?, mana, mastery_req, difficulty, effect }`. When performed:

1. A **caster** is chosen from the Circle — **defaults to the second-in-command** (`circle[1]`, falling back
   to the leader). The player can send someone else.
2. Resolution is a contest: **caster proficiency + school-match bonus + class-affinity bonus** vs the working's
   `difficulty`. Win → full effect; lose → weak/backfire (and, for Flame-tier, a Soul risk — permanent).
3. So a coven with no Chronomancer literally can't slow time well; sending your reckless apprentice into a
   Flame rite is a different gamble than sending your Pyromancer. **Different caster → different outcome.** ✅

## 5. The Circle — advisor metrics, recruitment, progression

Each member (`content/circle/*.json` + `state.circle`) carries: **`school`** (colour, exists) · **`class`**
(§3) · **`rank`** (apprentice → adept → ring-leader) · a **competence** block · a **temperament** block.

### 5a. Competence — four skills that modify what they *do* (feed contests)
Four stats, each ~0–100, mapping to the game's four action modes. A working/quest declares which it tests;
the caster's stat (+ school-match + class-affinity bonus) contests the difficulty.

| Stat | Governs | Classes / systems it serves |
|---|---|---|
| **Power** | raw magical force | Sorcerer, Pyromancer, Enchanter — big workings, wards, magical raids |
| **Wisdom** | lore, judgment, rune-memory | Magus, Druid + Blue — Lore & Mastery recovery, careful magic, resisting the Forgetting |
| **Guile** | cunning & tongue | Charmer, Chaos Mage + Red — cult standing, envoys, recruitment, trade |
| **Courage** | facing the Flame & the dark | Necromancer, Ghost Eater — Flame rites, Soul-work, holding vs the Fracture |

### 5b. Temperament — three axes that drive *advice & feuds* (not contests)
- **Boldness** — cautious ↔ reckless (risk appetite; which option they push in a scene).
- **Piety** — skeptic ↔ Flame-zealot (attitude to Regard / courting the Flame).
- **Temper** — steady ↔ volatile (feud likelihood; morale swing under loss). *(Replaces the coarse `leaning`.)*

*(Competence = "can they pull it off"; temperament = "what will they urge, and will they clash." Stat names
**LOCKED: Power · Wisdom · Guile · Courage** + **Boldness · Piety · Temper**, 4 + 3.)*

**Class → stat bias (mild):** a class nudges starting stats (a Pyromancer opens Power-high, a Charmer
Guile-high, a Ghost Eater Courage-high) — a lean, not a cap. Any class can grow any stat.
- **Recruitment** (anti-softlock, PLANNING §5a): high **Faith** + a Coven action *Call an Apprentice*, and/or
  scenes that offer recruits. New members roll a school/class. A **Charmer** improves recruitment.
- **Progression**: `prof` rises with use (casting/leading); a rite promotes `rank`; losing a member to the
  Flame can lock a whole line of magic — real stakes.
- **Second-in-command**: the ring is ordered — `circle[0]` = leader, `circle[1]` = the 2iC (the default caster).

## 6. How it threads the existing game

- **Workings screen** → each card shows its school/mastery-req + the **caster picker** (defaults to 2iC).
- **Coven screen** → each advisor card shows school · class · prof · rank + traits.
- **Cults screen** → gains a second read: standing (diplomacy) *and* your Mastery in that colour.
- **Infinity Veil / rune-quests** (Phase 2) → the main way to raise Mastery — myth-as-mechanic (NORTH_STAR).
- **The Forgetting** now bites twice: general Lore *and* per-school Mastery — recovering magic is the fight
  against the Shadowing.

## 7. Open questions (decide before building)

1. **Traits** — do we model numeric trait axes now (boldness/piety/temper), or keep `leaning` for v1 and add
   traits later?
2. **Mastery decay** — flat per-season, tied to Lore, or none for v1 (just gate on mastery, add decay later)?
3. **Class↔school coupling** — are classes free of school (any class, any colour), or nudged (Pyromancer leans
   Red/White, etc.)?
4. **Recruitment source** — a Coven action, scenes, or both, for v1?

## 8. Proposed first build slice (small, proves the loop)

1. Add `class` + `prof` + `rank` to the 4 existing advisors (`content/circle/*.json`).
2. Add `state.mastery` + `getPath('mastery.*')` + the `adjust_mastery` effect + condition support.
3. Convert **2–3 Workings** into school/mastery-gated spells with a **named caster (default 2iC)** and a
   caster-modified contest.
4. UI: caster picker on Workings; class/prof/rank on the Coven cards.
5. Update the **Codex** (a "Magic, Schools & the Circle" entry) and the **knowledge-graph** to match.

Then Mastery-raising rune-quests, recruitment, and traits/feuds follow as their own slices.

---

## 9. Rolled Circle & casting by shape  *(the emergent pivot — supersedes fixed advisors)*

**Decision (2026-07-20): the starting Circle is rolled fresh each campaign** — not the fixed Vela/Korr/
Ember/Wisp. Those four become *example rolls*, not canon. This forces two changes that make the game far
more KODP:

### 9a. Character generation
A generator rolls each starting member: **name** (from a pool), **school**, **class**, **rank**, the four
competence stats (biased by class, §5a), the three temperament axes, and a **pronoun set**. Seeded by the
campaign RNG so a run is reproducible. Needs: a **nameset** (hand-authored, in-voice, ~40+), a class/stat
roll table, and rules for a balanced opening ring (e.g., guarantee a spread of schools, one leader, one 2iC).

### 9b. Scenes cast a ROLE, not a name  *(the crux)*
A scene "voice" changes from a hard-coded member to a **caster selector** + text with substitution:

```jsonc
// OLD (breaks under a rolled Circle):
{ "member": "korr-ashen", "text": "And what walks back wearing our faces? I have buried Souls before." }
// NEW (casts whoever fits *your* ring):
{ "cast": { "most": "courage" }, "text": "{name} narrows {their} eyes. 'What walks back wearing our faces? {they} have buried Souls before.'" }
```

**Selector vocabulary (proposal):** `"leader"` · `"second"` (the 2iC / default caster) · `"any"` ·
object filters (AND'd): `{ "class": "necromancer" }` · `{ "school": "blue" }` · `{ "trait": { "boldness": "high|low" } }` ·
`{ "most": "wisdom" }` (highest of a competence stat). The engine casts the best-fit Circle member; if
**none matches, the line is simply not spoken** — so which voices you hear is emergent, per your ring.

**Text substitution:** `{name}`, and pronoun tokens `{they}/{them}/{their}/{theirs}` from the member's set.
Optionally `{class}`, `{school}`. Lines must be written to the **archetype**, never to a specific person.

### 9c. Consequences
- **The 15 existing scenes** must have their advisor lines **rewritten to archetypes** + `{name}` (migration).
- **The storyboard** shows the *cast shape* (e.g. `⟨most courage⟩`, `⟨any Blue⟩`) instead of a member id.
- **A generated opening** introduces your rolled ring by name (one archetype line each) — the campaign's cold open.

### 9d. Decisions (2026-07-20)
1. **First run: always random** — no curated tutorial ring.
2. **Pronouns: gendered he/she, rolled per member.** Each character rolls a gender; the text tokens
   `{they}/{them}/{their}/{theirs}` resolve to *his/her* forms. Authoring stays in he/she (both take `-s`
   verbs, so no "he has / they have" agreement trap). *(Add non-binary `they` later if wanted.)*
3. **Nameset: invented in-voice + a handful pulled from Forgotten Runes Wizard metadata** — the canonical
   "⟨Name⟩ the ⟨Epithet⟩ of ⟨Place⟩" pattern; the invented majority written to match.
4. **Migration: yes** — rewrite the 15 scenes' advisor lines to archetype casting + `{name}`, as part of the
   caster build (not a fixed-Circle detour).
5. **Selector vocabulary:** the fixed set of "casting calls" a scene uses to say *which kind* of advisor
   speaks a line (see 9b). Proposed: `"leader"` · `"second"` · `"any"` · `{ "class": … }` · `{ "school": … }` ·
   `{ "trait": { "boldness": "high|low" } }` · `{ "most": "<competence stat>" }`. Engine casts the best fit;
   no match → the line is silent.
