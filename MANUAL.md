# Keeper of the Sacred Flame — Game Manual

*A storylet-driven survival saga of the Forgotten Runiverse. You are the Archon of Runehold, a
fledgling coven of Wizards around a guttering hearth-rune. The world is forgetting itself; the Flame
still burns beneath the Secret Tower; the seven Color Cults circle. Tend the flame, or be forgotten.*

> Companion to the design docs: `PLANNING_01.md` (world + pressures), `NORTH_STAR.md` (design philosophy),
> and `ROADMAP.md` (architecture, screen patterns & build plan). This manual describes the game
> **as it actually plays today** — it grows as the game does.

---

## Introduction

Generations after the cataclysm that tore the world apart, the Runiverse is a quilt of fractured holds.
You lead a **coven of Wizards** — a few dozen souls, four named advisors, and a half-remembered claim
to old power. Magic is real but *thinning*. The Warriors outnumber you and need no spells to kill you.
And beneath the Secret Tower, the **Sacred Flame** still burns: the greatest power and the greatest loss
in the world.

### Your place in the Runiverse

The world is **forgetting itself** — this is the dramatic engine of the game. Knowledge (Lore) decays
every season unless you spend effort to hold it. The cataclysm (the **Fracture**) is not finished; it
creeps toward Runehold a little more each season you neglect it. Around you, **seven Color Cults** —
Red, Yellow, Brown, Green, Blue, Purple, White — court you, trade with you, or turn against you.

### You, the player

You play as the **Archon**: you decide, the **Circle** of advisors counsels and grumbles, and the world
reacts. The story is **emergent** — not a scripted campaign but a saga assembled from the choices you
make against the state of your coven. Some choices bite immediately; others wait years to come due.

There is **seldom one right answer**. Most decisions trade one good for another — Lore for Coin, the
Flame's favour for the safety of your people, one Cult's friendship for another's enmity. Your job is
not to solve a puzzle but to **lead a society through the dark** and leave a saga worth telling.

### If you don't read manuals, read this

- **Listen to the Circle.** On a scene, your advisors speak per their leanings — and they *disagree*.
  Their counsel serves their own agendas as much as the coven's. Weigh it; don't obey it.
- **Watch the bottom bar.** Your advisor portraits and your seven pressures live there at all times.
- **Use the rune menu** (top of the screen) to visit the management screens between events — the
  Coven, Fields, Market, War, Cults, Workings, Map, Saga — and the Codex for world lore.
- **Nothing is free.** Workings and labours cost a resource; raiding stirs the Fracture; courting the
  Flame risks your own Wizards. Spend deliberately.
- **Failure is part of the saga.** A famine or a Wizard lost to the Flame is not just a setback — it is
  written into Runehold's history. Lose well.

---

## The world

**Peoples of the Runiverse** (canon — the IP's load-bearing facts):
- **Wizards** — magic-wielders; your people.
- **Warriors** — cannot use magic; weapons, shields, animal companions; they *outnumber* Wizards.
- **Forgotten Souls** — Wizards transformed by the Sacred Flame (see below).
- **Beasts** & **Beast Spawn** — epic creatures behind the Gate to the Seventh Realm.
- **Ponies** — mounts from the Elysian Fields.

**The seven Color Cults.** Two are well-defined: **Red** (the Gilded Reach; greedy aristocrats; the Stock
Sanctuary — the coin power) and **Blue** (the Bastion; the Forgotten Athenaeum — the lore power). The
other five (Yellow, Brown, Green, Purple, White) are not yet fixed in this saga and read as *uncharted*.

**The Sacred Flame.** In the basement of the Secret Tower it burns. Wizards who step into it become
Forgotten Souls — returning with something greater, or something undesirable (roughly one in ten). It
is the highest-reward, highest-risk power in the game.

> *Canon vs. ours:* Runehold, the Archon role, the pressure meters, and our named NPCs are **our
> invention**, flagged as such; the peoples, cults, Flame, and Souls are Runiverse canon. We never
> contradict canon or claim authority we don't have.

---

## The turn: seasons, years, and the recap

Time turns through **four seasons** — **Thaw → Highsun → Emberfall → Deepfrost** — and then a new
**Year** begins. Each season, time advances until something demands you: an **event** (a scene), or the
**turn of the year**.

**The drift.** Every season, whether or not anything happens:
- **Lore −3** — the Forgetting bites.
- **Mana +3** — your reserve slowly renews.
- **Provisions −3** — the stores dwindle.
- **The Fracture +1** — the wound in the world widens.

**The year-end Runehold recap.** At the close of each year, the saga turns a page: a recap shows **how
the year moved you** (the net change in every pressure), **who still stands** in the Circle (and any
Souls lost), and **the year's deeds** drawn from the saga. This is your moment to take stock before the
new year. *(This is our analog of KODP's Sacred Time recap and Tula view.)*

---

## The pressures

Seven meters and your standing with the Cults. **Every scene and action reads and writes them.** They
all run **0–100** unless noted; the game begins at: Mana 30 · Provisions 50 · Coin 35 · Lore 40 ·
Faith 50 · Flame's Regard 35 · Fracture 10.

| Pressure | What it is |
|---|---|
| **Mana** | Your spellcasting reserve. Powers Workings; renews slowly (+3/season), spent in bursts. |
| **Provisions** | Food for the coven. Decays every season; reaching **0 ends the game in famine**. |
| **Coin** | The mercantile axis (Red / the Gilded Reach). Buys what magic and farming cannot. |
| **Lore** | Runes and memory — the signature meter. Unlocks power but **decays every season** ("the Forgetting"). |
| **Faith** | The coven's morale. Whether your Wizards believe in your leadership. Reaching **0 ends the game**. |
| **Flame's Regard** | The cosmic meter. Reaching **80 wins the game** — you become Keeper. Courting it recklessly burns your own. |
| **The Fracture** | The doom clock. Rises every season; reaching **100 ends the game** — the Fracture consumes Runehold. |

**Cult Standing** is different: **signed, −100 to +100**, starting at **0** (neutral). Below zero is
hostility; a cult driven to −60 is a **Sworn Enemy**; above +60 is an **Ally**. Acting for one cult often
costs another — there is no pleasing all seven.

---

## The Circle (your advisor ring)

Runehold is led through a **Circle** of named Wizards, each with a **colour** allegiance, a **leaning**
(what they value), and a **temperament**. The first member is the **Ring leader**. You begin with:

- **Vela** (Blue, *Lore-keeper*) — keeper of the half-burned Athenaeum-scrolls; believes memory is the
  only wealth the cataclysm cannot take.
- **Korr Ashen** (Red, *Cautious*) — survived the Great Burning; has buried more Souls than apprentices.
- **Ember** (Yellow, *Flame-touched*, apprentice) — young, reckless, drawn to the Flame.
- **Wisp** (White, *Flame-touched*, apprentice) — quiet, devout, already half-listening to the Flame.

On a scene, eligible advisors **speak per their leanings, and they disagree** — telling you what *they*
would do, which is not always what the coven needs. Visit **The Coven** screen to see the full roster
and the coven's Faith; lost members are remembered there among the **Forgotten Souls**.

> *Recruitment* (drawing new Wizards in, raising apprentices into the Circle) is planned but not yet
> wired — for now the Circle only shrinks, through the Flame.

---

## The screens

Switch screens with the **rune menu** at the top. The management screens change the **main stage**; the
**hearth bar** (season, year, controls) and the **Circle bar** (advisor portraits + pressures) stay on
screen. During an event, the stage holds the scene; you can still browse other screens between events —
**browsing never advances time**.

### The Season — events & decisions
The heart of the game. About once a season an **event** (a scene) demands a decision. Each choice may:
- require a resource (a greyed choice tells you what you lack),
- be a **contest** (a skill check against a difficulty — even good odds can fail, and failure is not the
  end of trying), and
- branch to a **win** or **lose** outcome, each writing the pressures.
Advisors weigh in above the choices. There is rarely one right answer.

### The Coven (Clan)
Your roster, the coven's **Faith** (with a mood band from *Devoted* to *Faithless*), and the memorial of
**Forgotten Souls** lost to the Flame. The informational heart of the coven.

### The Hearth-fields (Farming)
Proactive labours against famine — **one of each per season**:
*Drive the Harvest* (Provisions, at a Faith cost), *Bless the Fields* (Mana → Provisions), *Buy
Seed-Grain* (Coin → Provisions), *Forage the Wastes* (Provisions, at a Fracture cost).

### The Stock Sanctuary (Trade)
the Gilded Reach's market — give **Coin** a purpose. Convert Coin ↔ Mana, sell surplus Provisions for
Coin, or spend Coin to **court the Red factors** (buy Red standing).

### Magic vs Steel (War)
The Warrior-Guild tension. *Raid the Caravans* (gain Provisions/Coin, **raise the Fracture**), *Muster
the Coven* (Faith, costs food), *Fortify the Hold* (Coin → lower Fracture), *Hire Warrior Mercenaries*
(Coin → strongly lower Fracture, but **costs Faith** — the coven distrusts steel it cannot cast).

### The Seven Cults (Relations)
Your **signed standing** with each colour, shown on a meter centred on neutral, with a band from *Sworn
Enemy* to *Ally*. Acting for one cult often costs another. Hostility is escapable — tribute and trade can
mend a feud.

### Workings (Magic)
Spend **Mana** on workings, **one of each per season**: *Mend the Wards* (lower the Fracture — your
chief defence against the doom clock), *Deepen the Runes* (hold Lore against the Forgetting), *Tend the
Hearth-Flame* (raise Faith), *Court the Sacred Flame* (raise Regard toward victory — but it stirs the
Fracture).

### The Runiverse (Map)
A map of the known world: **Runehold** at the centre, the seven **cult holds** ringed around it (each
showing live standing — the Gilded Reach is Red, the Bastion is Blue), the **Secret Tower**, and the
**Fracture's ash** creeping in from the edge as the doom clock rises. Holds you've never engaged stay
**uncharted** — white on the map, or already forgotten.

### The Codex (Background / Lore)
The world's knowledge — the Pressures, the Seven Cults, and the Powers & Perils (the Flame, the
Forgetting, the Fracture, the Circle, Forgotten Souls, Runehold). Search it; click a result to jump to
the entry. *Understanding the world helps you survive it.*

### The Saga
The running chronicle of Runehold's deeds, newest first — the artifact of *your* campaign.

### Options & Saves
**Options:** text size, reduced motion, autosave toggle, and clearing saved data. **Saves:** one
continuous **autosave** (your campaign, picked up by *Continue*) plus a single **manual slot** you can
keep as a bookmark. Losses to the Flame are permanent by design — keep one save and live with your
choices.

---

## The Sacred Flame & Forgotten Souls

The Flame is the highest-reward, highest-risk system in the game. Drawing on it (in scenes, or via *Court
the Sacred Flame*) raises **Flame's Regard** toward the victory threshold — but courting it recklessly
**burns your own Wizards into Forgotten Souls, permanently**.

When a Circle member is taken, the loss is **irreversible** — but it is a *transformation, not a
deletion*: they leave the Circle and persist in the world as a Soul you may later meet, bargain with, or
mourn (see the scene *The Wanderer in the Ash*). You will **always knowingly court the risk** — no scene
takes a beloved advisor by a silent dice-roll. Permanence is the dramatic core; it earns its weight by
being remembered, in the Coven's memorial and the Saga.

---

## The Fracture (the doom clock)

The cataclysm is not finished. The Fracture **rises +1 every season** on its own, and faster when you
raid, forage, or draw deep on the Flame. Reaching **100 ends the campaign** — the ash takes Runehold
last of all.

It is **not** a one-way spiral: you hold it back with *Mend the Wards* (Workings), *Fortify the Hold* and
*Hire Mercenaries* (War), and Fracture-mending scene choices (a pact with a Warrior captain, sealing a
seam in the trembling ground). Left unchecked, it always wins — so check it.

---

## Workings & actions (how the levers work)

The Workings, Fields, Market, and War screens share one model: each is a **declarative action** with a
cost and a set of effects, usable **once per season** (they refresh at the turn of the season). The cost
is shown as a chip; an action you can't afford is greyed with the requirement named. This is how you act
*proactively* between events — to spend down Mana, top up Provisions, ward the Fracture, or mend a feud.

---

## Winning & losing

**Victory — Keeper of the Sacred Flame:** raise **Flame's Regard to 80**. The Tower opens to you; the
Flame burns at your word, and remembers your name when all else is forgotten.

**Defeat — authored, not arbitrary** (each ends the campaign with its own telling):
- **The Coven is Empty** — your last Circle member is gone.
- **Faith Has Failed** — Faith falls to 0; they no longer believe you can lead them.
- **The Last Hungry Season** — Provisions fall to 0; a coven cannot eat runes.
- **The Fracture Consumes All** — the Fracture reaches 100.

The campaign is **finite with a victory horizon** — it drives toward the bid for the Tower or a defeat,
a saga of a few dozen years, not an endless sandbox. The doom clock and the Forgetting make sure of it.

---

## Getting started (and playing well)

- **Keep the Circle full and varied.** Different leanings give you different counsel and different
  strengths; a Circle of one mind is a blind one.
- **Hold the Fracture early.** Mend the Wards or fortify before the ash is at your door — it only gets
  harder.
- **Don't hoard Mana.** It renews slowly but caps out; spend it on Workings rather than letting it sit.
- **Give Coin a job.** Trade it for what you're short of, or buy back a Cult you've wronged.
- **Court the Flame deliberately.** It is the only road to victory, but every great working courts
  permanent loss. Send someone knowing the price; never gamble a beloved advisor idly.
- **Read the Codex.** Knowing the world — the cults, the Flame, the Fracture — is how you out-think it.
- **Play the part.** Cunning risk-calculation takes you only so far. Lead like a Keeper who tends
  something dangerous, and the saga will be worth telling — even if it ends in ash.

*When in doubt, optimise for the story you'll remember, not the number you'll maximise.*
