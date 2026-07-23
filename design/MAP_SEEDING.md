# KOTSF — Seeding the Map from the Runiverse

> How to grow KOTSF's in-game map out of the **canonical Forgotten Runes world map**
> (154 places, saved in [`forgotten-runes-locations.json`](forgotten-runes-locations.json),
> pulled from wizzypedia / `forgottenrunes.com/map`). Design intent, not yet built.
> Ties into [`ENDGAME_ARC.md`](../ENDGAME_ARC.md) and the expedition subsystem.

The gift here is that **we don't invent geography — we inherit it.** The canon map
already contains our seven cults' capitals, the Sacred Flame's tower, the Shadowing's
darkness, and a hundred dungeons and dead cities ready to be quest sites. Runehold is
the one thing we add: a small, invented frontier hearth dropped into a real world.

---

## The layers (what each canonical location becomes)

**1. The seven cult seats → fixed diplomacy nodes.** These already back our
cult-standing system and are named in our scenes; the map just gives them a home.

| KOTSF cult | Canonical seat(s) |
|---|---|
| Red | Red Wizard Capital, Red Navy Port, The Corporation HQ (our "Gilded Reach") |
| Blue | Blue Wizard Bastion (our "Forgotten Athenaeum") |
| Green | Green Wizard City, The Emerald Forest |
| Yellow | Yellow Wizard Haven, Chronomancer's Riviera / Citadel (already cited in our Yellow scenes) |
| Purple | Purple Wizard Pavilion, The Court of Chaos Magic |
| White | White Wizard Tower |
| Brown | Brown Hat Delta |

**2. The cosmic core → the endgame, locked & hidden.** `The Secret Tower` (the
Sacred Flame's seat — the win-condition destination), `The Infinity Veil` (canon:
houses the Flame), `The Sacred Pillars`, and the threat side — `The Quantum Shadow`,
`The Quantum Downs`, `The Cave of the Platonic Shadow`, `The Gate to the Seventh
Realm`, `The Tower at the End of the World`, `World Shaper Spire`. These start
**undiscovered**; the Secret Tower's location is the arc's great reveal (step 1 of
ENDGAME_ARC).

**3. Ember-hearths → the 8–14 scattered Embers.** Each game randomly designates
`embersGoal` (8–14) minor cities/strongholds as hidden Ember-hearths to seek —
drawn from candidates like `Calista's Citadel`, `Alessar's Keep`, `Merlin's Tower`,
`Obsidian City`, `Starfall Stronghold`, `Halcyon Sanctum`, `Spirit Villa`. Some are
**dead hearths** (Ember guttered out) — `BlackSand: The City That Once Was` is the
canon ready-made for our existing `the-cold-hearth` beat. This is the seam that wires
the endgame Ember counter to the map.

**4. Dungeons & lore sites → expedition destinations.** Ground our invented
expedition sites in canon, and mine the rest for new ones:

| Expedition | Canonical home |
|---|---|
| The Nameless Pyramid | `Solomon's Tomb` |
| The Descent into the Fracture | a seam near `The Quantum Downs` / `The Ice Abyss` |
| Bearing the Ember Home | out of `BlackSand: The City That Once Was` |
| The Pilgrimage to the Rival Hearth | any living Ember-hearth city above |
| *(new sites)* | `Skeleton Mines`, `Vampyre Castle`, `Dread Tower`, `Gorgon City`, `Manticore Valley`, `The Nightmare Dominion`, `Torment Manor`, `Wolf Dungeon` |

**5. The three fallen Keepers → evocative canon addresses** (ENDGAME_ARC step 2):
the **mad** Keeper at `Cuckoo Land and the Psychic Leap` / `The Nightmare Dominion`;
the **power-lost martial-artist hermit** at `Honor Mountain` / `Muscle Mountain` /
`The Hall of the Mountain King`; the **imprisoned** Keeper at `Torment Manor` /
`Wolf Dungeon` / `The Hole`.

**6. Everything else → regions & travel texture.** The woods, mountains, seas, and
wastes group the named nodes into regions and set travel distance (which can drive
expedition `away` times — cult seats near, cosmic sites far).

---

## The data model (proposed)

A `content/map/nodes.json`, seeded from `forgotten-runes-locations.json`:

```
{ id, name, region, kind,            // kind: cult_seat | cosmic | ember_hearth | dungeon | city | wild …
  cult?: "<colour>",                 // for the seven seats
  discovered: false,                 // fog-of-war; most start hidden
  unlock?: <condition>,              // e.g. gte lore 60 + embersFound N, or a flag
  ember?: false,                     // rolled per-game for the 8–14 hearths
  dist: <ticks from Runehold>,       // seeds expedition away-time / travel cost
  links: [ ...node ids ] }           // adjacency for the map graph
```

Runehold is node 0, invented, placed on a frontier (suggest: northern, between the
Brown Hat Delta and the wild — far from the Secret Tower, which lies dark and distant).

---

## How it plugs into what exists

- **Cult system** — the seven seats become the *places* behind the standings our cult
  scenes already move. A future Cults/Map screen can show where each faction sits.
- **Expeditions** — nodes are the destinations; `dist` seeds `away` times; discovering
  a node can be an expedition outcome.
- **Endgame (ENDGAME_ARC)** — `ember_hearth` nodes + the `embersFound/embersGoal`
  counter give the Ember hunt a board; the Secret Tower is the locked final node; the
  three Keepers get addresses.
- **Fog of war** — most nodes hidden, revealed through rumor / lore / expeditions —
  directly serving North Star #5 ("no perfect information").

## First build step (smallest useful slice)

1. Generate `content/map/nodes.json` from the location data: the 7 cult seats
   (discovered) + the cosmic core (hidden) + Runehold. Skip the long tail for now.
2. Replace the map stub (`mapScreenHTML`) with a simple region list of discovered
   nodes.
3. Roll `embersGoal` (8–14) at creation and tag that many hearth candidates `ember`.
   Wire `ember_borne` / `ember_taken` (currently orphan flags) to increment
   `embersFound` — closing the loop the content audit flagged.
