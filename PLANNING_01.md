# Keeper of the Sacred Flame — PLANNING_01

> A storylet-driven, emergent-narrative strategy game set in the **Forgotten Runes Runiverse** (CC0 IP).
> Working title: **Keeper of the Sacred Flame** (KOTSF). In-fiction coven seat: **Runehold**.

*Status: design bible, pre-code. Captures the world + pressure-system spine agreed before any scene is written.*

---

## 0. Design lineage (why the game is shaped this way)

This is, structurally, a **King of Dragon Pass**-class game: a light strategy/management layer wrapped around a large pool of hand-authored, illustrated **decision scenes**, where the "story" is **emergent** — selected from a pool by the values of game-state variables, not laid out as authored arcs.

KODP's documented scale, for scoping reference:
- ~**1,624** total scenes in the content DB: **614** interactive, **462** news, **84** quests, **464** code chunks.
- ~**544** *distinct* interactive events after removing follow-ups.
- ~**450,000** words of writing, ~**430** paintings.
- Campaign length ~48–58 in-game years.

**Decision we committed to:** scenes are authored as **text + trigger-condition + state-mutation atoms, together** — never prose-first with conditionals bolted on later. In a storylet game the trigger *is* part of the writing. We build the world + pressure spine first (this document), then write scene-atoms against it.

---

## 1. The IP foundation (canon — must respect)

The **Runiverse** is the world of Forgotten Runes Wizard's Cult (10,000 on-chain pixel-art Wizards, launched June 2021). Load-bearing canon:

- **A fractured world.** A cataclysm tore the world apart; survivors rebuilt with mismatched magic and technology. Deliberately patchwork — *not* clean medieval fantasy. This fracturing is the justification for a coven-survival game.
- **Seven Color Cults** — Red, Yellow, Brown, Green, Blue, Purple, White. Both Wizards and Warriors affiliate by color.
  - **Red** — Markertropolis; greedy aristocrats; the Stock Sanctuary (the mercantile/coin power).
  - **Blue** — the Bastion; largest libraries; the **Forgotten Athenaeum** (the lore/knowledge power).
  - (Yellow, Brown, Green, Purple, White — characterizations to be developed against canon + community lore.)
- **Distinct peoples:**
  - **Wizards** (10,000) — magic-wielders. Our protagonists.
  - **Warriors** (16,000) — **cannot use magic**; weapons, shields, faithful animal companions; *outnumber* Wizards.
  - **Forgotten Souls** — Wizards transformed by the Sacred Flame.
  - **Beasts** (8, e.g. the Quantum Ouroboros) + **Beast Spawn** — epic creatures behind the **Gate to the Seventh Realm**.
  - **Ponies** (~479) — mounts from the **Elysian Fields**.
- **The Sacred Flame / The Great Burning.** In the basement of the **Secret Tower**, on All Hallows' Eve, Wizards stepped into the **Sacred Flame** and became **Forgotten Souls**. Outcomes were *uncertain* — you might get back something greater, or something "undesirable" (~1 in 10). The **Infinity Veil** houses the Flame.
- **Decentralized, community-authored lore.** No central plot — holders write their own characters' stories. This *natively matches* the storylet/emergent model.

### License (DECIDED — not CC0; commercial-with-threshold)
Forgotten Runes is **NOT full CC0** (a common misconception). It uses a **hybrid IP model**: building on the Runiverse commercially is permitted, but **licensing stipulations kick in above a revenue threshold**. Below that threshold we are clear to build and ship; once KOTSF crosses it, the project's commercial terms apply.
- **ACTION (pre-Steam):** confirm the exact revenue threshold and the obligations it triggers (fee/royalty/permission), and have an IP lawyer review before commercial release.
- **ACTION (always):** "Forgotten Runes" / "Runiverse" names/logos may be trademarked independent of any art license — never imply official endorsement; keep our canon/invention boundary clean (see below).

### What's ours to invent (flagged, never asserted as canon)
- The protagonist role (a coven **Archon** / aspiring **Keeper**).
- The pressure meters and the "memory decays" economy ("The Forgetting").
- Runehold (the coven seat) and any named NPCs/scenes we author.
- We keep a clear canon/invention boundary so we never contradict canon or step on holders' lore.

---

## 2. Names considered

Each echoes the *King of **X*** title-shape, on a different theme:

1. **Keeper of the Sacred Flame** *(chosen)* — mirrors "King of Dragon Pass" beat-for-beat; "Keeper" frames the game (you *tend* something dangerous, you don't simply rule it); the Flame is the IP's strongest icon.
2. **The Long Forgetting** — leans into "Forgotten" as the dramatic engine; most distinctive, least KODP-derivative.
3. **Lord of the Seven Cults** — foregrounds seven-color diplomacy; clearest strategy-title read.
4. **Of Ash and Rune** — most literary/tonal; ash (Burning) vs. rune (memory); vaguer on mechanics.
5. **Runehold** — a *place* name, the way "Dragon Pass" is. **Adopted as the in-fiction coven seat.**

---

## 3. The world (broadstroke spine)

**Premise.** Generations after the cataclysm, the Runiverse is a quilt of fractured holds. You are the newly-risen **Archon of a fledgling coven of Wizards** — a few dozen souls around a guttering hearth-rune and a half-remembered claim to old power. Magic is real but *thinning*; the world is literally forgetting itself. Warriors outnumber you and don't need spells to kill you. The seven Color Cults circle, allied or hostile by turns. And beneath the Secret Tower, the Sacred Flame still burns — the greatest power and the greatest loss in the world.

**Your role.** Lead through a **Circle** (the advisor ring) of named Wizards, each with a color leaning and a temperament. You *decide*; the Circle advises and grumbles; the world reacts. Emergent, not scripted.

**Arc / win conditions** (open, not a single rail):
- Grow the coven from a hearth to a power.
- Navigate the seven Cults toward unity or dominance.
- Master the rune-lore your rivals have let rot.
- Make a bid for the **Secret Tower** and the right to tend the Flame — to become **Keeper**.
- Or fail: dwindle into a Forgotten hold, your name unspoken.

**Central tensions** (every scene pulls against these):
- **Ambition vs. the Flame's price** — the Flame can save you or transform your people into Souls; every great working courts permanent loss.
- **The Forgetting** — knowledge is power, but it *decays*; gains erode if unmaintained.
- **Magic vs. Steel** — the Warrior's Guild: more numerous, immune to your best tools; allies or terrors.
- **Seven rivals, one Runiverse** — no faction stands alone; alliance and betrayal across the color spectrum.

---

## 4. The pressure-system

Eight interlocking pressures. **These are the storylet state** — every scene reads and writes them.

### Material
1. **Mana** — spellcasting reserve. Powers workings, quests, defenses. Regenerates slowly; spent in bursts.
2. **Provisions** — feeding the coven in a broken world. Famine is a constant low-grade threat (KODP herds/crops analog).
3. **Coin** — the mercantile axis (Markertropolis, Red Cult). Buys what magic and farming can't; ties you to aristocrat politics.

### Signature pressure
4. **Lore (Runes / Memory)** — *the* distinctive meter. Unlocks great workings and rune-quests, **but decays every turn** — "The Forgetting," made mechanical. Maintain libraries (echo the Blue Bastion / Athenaeum), train apprentices, or watch power slip from memory. Hoard vs. use vs. preserve is a constant three-way squeeze.

### Social & spiritual
5. **Faith of the Coven** (morale) — whether your Wizards believe in your leadership. Driven by Circle relationships and consistency with the coven's values.
6. **Standing with the Seven Cults** — seven independent reputation tracks (Red…White). Acting for one often costs another; the diplomatic core.
7. **The Flame's Regard** — the cosmic meter. Drawing on the Sacred Flame is the highest-reward, highest-risk action: salvation, transformation, or "undesirable" loss (~1-in-10 dread). High Regard opens Soul-tier power; courting it recklessly **burns your own Wizards into Forgotten Souls — permanently** (see §5a) — sometimes triumph, sometimes a tragedy you caused.

### The clock
8. **The Fracture** (doom track) — the cataclysm isn't finished. Nightmare Imps, Beasts stirring behind the Gate to the Seventh Realm, and the slow Forgetting advance a background threat. Rises if neglected; the long game beneath all the others.

### The Circle (advisor ring)
A council of named Wizard archetypes, each with a **color allegiance** and **temperament**, e.g.:
- A **Blue** scholar who values Lore above all.
- A **Red** pragmatist who'll sell anything.
- A **White** zealot who reveres the Flame.
- A battle-scarred Wizard who wants a Warrior alliance.

They advise per their leanings, feud with each other, and **remember how you've treated them** — the human texture that makes the systems feel alive.

### Rune-questing (heroquest analog)
KODP's myth re-enactment becomes journeys into the **Infinity Veil** to re-walk the runes of the old world — recover lost Lore, win Flame's Regard, risk Soul-transformation. Same "you must actually know the myth" design, reskinned to the memory theme.

---

## 5. Open design questions (decide early — they shape the whole register)

1. ~~**Flame/Soul stakes:** permanent or recoverable?~~ **DECIDED: PERMANENT.** When a Circle member is taken by the Flame, the transformation is irreversible — KODP-grade stakes. See §5a for the design consequences this forces.
2. ~~**Title:** confirm *Keeper of the Sacred Flame*.~~ **DECIDED: confirmed.** *Keeper of the Sacred Flame* (KOTSF); in-fiction seat **Runehold**.
3. ~~**License:** confirm Forgotten Runes CC0 terms before commercial (Steam) use.~~ **DECIDED: not CC0.** Hybrid model — commercial build/ship is permitted, with **licensing stipulations above a revenue threshold** (see §1 *License*). Exact threshold + lawyer review still an ACTION before Steam.
4. **Color characterizations:** lock canon-aligned identities for Yellow, Brown, Green, Purple, White (Red and Blue are well-defined). ← **only remaining open item**
5. ~~**Time model:** KODP runs in years; do we tick in seasons/years with a finite campaign, or open-ended?~~ **DECIDED: finite, victory-horizon.** Engine already ticks **4 seasons/year** (Thaw → Highsun → Emberfall → Deepfrost). No hard turn-cap; the campaign drives toward an endgame (the bid for the Secret Tower / Keeper victory) or a defeat state — a KODP-shaped saga of a few dozen years. Both signature mechanics (the Forgetting decay, the Fracture doom clock) are entropy systems, so an open-ended sandbox would fight the theme; a victory horizon gives each run a shape.

---

## 5a. Consequences of permanent Flame/Soul loss (DECIDED)

Permanent transformation is the dramatic core, but "permanent" must mean *consequential*, not *cheap* or *softlocking*. Design rules this forces:

- **Loss is a transformation, not a deletion.** A Circle member taken by the Flame **leaves the Circle but persists in the world as a Forgotten Soul** — an NPC you may later encounter, bargain with, mourn, or be haunted by. This is canon-aligned (Souls exist as beings) and turns a stat-loss into ongoing narrative. The engine's `transform_member` moves the member from `circle` to a `souls` roster rather than destroying them.
- **The player must always have agency over the risk.** No scene takes a named member without the player knowingly courting the Flame (sending *someone*, choosing the reckless option). Telegraph the odds in-fiction; never a silent dice-roll that erases a beloved advisor.
- **No softlock.** Recruitment must outpace worst-case attrition — there must be paths to draw new Wizards into the Circle, or losing your last members ends the campaign deliberately (a *defeat state*, authored), never an unwinnable stall.
- **Asymmetric payoff.** Because loss is permanent, the *reward* for Flame use must be correspondingly high (Soul-tier Lore, powerful workings) — the gamble has to be genuinely tempting, or players simply never touch the best system in the game.
- **Memory hooks.** A lost member's death should ripple: surviving Circle members who were close gain grief/resentment; the saga records them by name. Permanence earns its weight through being *remembered* — fitting for a game about The Forgetting.

## 6. Sources
- forgottenrunes.com — official site & world map
- wizzypedia.forgottenrunes.com — A Guide to the Collections; The Great Burning; Wizards (Runiverse)
- runiverse.world — An Introduction to the Forgotten Runiverse
- kingofdragonpass.blogspot.com — "How Many Scenes?"; OSL scripting (design-lineage reference)
