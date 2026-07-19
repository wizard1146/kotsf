# KOTSF — Small / UI Icon Prompts (48px-legible, Tier A)

The ornate Tier-B icons (`ICON_PROMPTS.md`) blur to a blob below ~48px. These prompts generate the **small, functional** versions for the always-on UI — pressures, rune-menu tabs, feedback. Different rules:

- **No** rune-medallion frame, **no** grunge/cracks, **no** heavy shading — but **keep enough internal detail that the subject reads** (a sheaf looks like a sheaf, a book like a book). Flat, not blank.
- **Bold, flat** silhouette with **clear internal lines**; crisp angular linework (still not rounded/cutesy).
- Balanced negative space; one clear idea per icon, described legibly — not abstracted into spikes.

**How to use**
1. **The anchor is the cropped coin** (`assets/icons/icon_min_coin.png`) — it sets the scale, ink weight, cream tone, and pure-black ground for the whole set. In the MJ web app, **drag the coin onto the prompt bar and tag it as the Style Reference**, then paste any prompt below (each is scaffolded with `--sw 250 --seed 777`). Tune the bind: raise `--sw` toward 300–1000 to hug the coin harder, lower it if the reference over-constrains.
   *(Discord / URL route: send the coin in a channel, right-click → Copy Link, and add `--sref <that-url>`.)*
2. **Downscale each result to 48 / 32 / 24px and judge there** — if it survives 24px, it's good.
3. These are a **starting point**: for the truly tiny pips (16–24px in the circle bar), the cleanest result is to **vectorise the winner** (Illustrator Image Trace / `vtracer`) → hand-tidy → SVG that scales perfectly.
4. Generate on **solid black**, then knock out to transparent for UI use.

**Shared style suffix** (already baked into every prompt below):
> `bold flat two-tone icon, solid cream-white silhouette on near-black, clear internal detail lines, moderate detail, crisp angular hand-inked linework, not rounded or cutesy, occult folk dark-fantasy character, no frame, no border, high contrast, balanced negative space, centered, reads clearly at 32-48px --ar 1:1 --style raw --sw 250 --seed 777 --no text, letters, runic border, circle frame, gradient, photoreal, 3d`

---

## The seven pressures

**1 · Mana**
```
a single four-pointed arcane spark star, bold flat two-tone icon, solid cream-white silhouette on near-black, clear internal detail lines, moderate detail, crisp angular hand-inked linework, not rounded or cutesy, occult folk dark-fantasy character, no frame, no border, high contrast, balanced negative space, centered, reads clearly at 32-48px --ar 1:1 --style raw --sw 250 --seed 777 --no text, letters, runic border, circle frame, gradient, photoreal, 3d
```

**2 · Provisions**
```
a simple bound wheat sheaf, bold flat two-tone icon, solid cream-white silhouette on near-black, clear internal detail lines, moderate detail, crisp angular hand-inked linework, not rounded or cutesy, occult folk dark-fantasy character, no frame, no border, high contrast, balanced negative space, centered, reads clearly at 32-48px --ar 1:1 --style raw --sw 250 --seed 777 --no text, letters, runic border, circle frame, gradient, photoreal, 3d
```

**3 · Coin**
```
a single round coin with one small rune mark, bold flat two-tone icon, solid cream-white silhouette on near-black, clear internal detail lines, moderate detail, crisp angular hand-inked linework, not rounded or cutesy, occult folk dark-fantasy character, no frame, no border, high contrast, balanced negative space, centered, reads clearly at 32-48px --ar 1:1 --style raw --sw 250 --seed 777 --no text, letters, runic border, circle frame, gradient, photoreal, 3d
```

**4 · Lore**
```
a simple open book, bold flat two-tone icon, solid cream-white silhouette on near-black, clear internal detail lines, moderate detail, crisp angular hand-inked linework, not rounded or cutesy, occult folk dark-fantasy character, no frame, no border, high contrast, balanced negative space, centered, reads clearly at 32-48px --ar 1:1 --style raw --sw 250 --seed 777 --no text, letters, runic border, circle frame, gradient, photoreal, 3d
```

**5 · Faith**
```
two hands pressed together in prayer, bold flat two-tone icon, solid cream-white silhouette on near-black, clear internal detail lines, moderate detail, crisp angular hand-inked linework, not rounded or cutesy, occult folk dark-fantasy character, no frame, no border, high contrast, balanced negative space, centered, reads clearly at 32-48px --ar 1:1 --style raw --sw 250 --seed 777 --no text, letters, runic border, circle frame, gradient, photoreal, 3d
```

**6 · Flame's Regard**
```
a single eye with one small flame above it, bold flat two-tone icon, solid cream-white silhouette on near-black, clear internal detail lines, moderate detail, crisp angular hand-inked linework, not rounded or cutesy, occult folk dark-fantasy character, no frame, no border, high contrast, balanced negative space, centered, reads clearly at 32-48px --ar 1:1 --style raw --sw 250 --seed 777 --no text, letters, runic border, circle frame, gradient, photoreal, 3d
```

**7 · Fracture**
```
an ancient rune-stone split cleanly in two with a dark gap down the middle and a few ash motes, bold flat two-tone icon, solid cream-white silhouette on near-black, clear internal detail lines, moderate detail, crisp angular hand-inked linework, not rounded or cutesy, occult folk dark-fantasy character, no frame, no border, high contrast, balanced negative space, centered, reads clearly at 32-48px --ar 1:1 --style raw --sw 250 --seed 777 --no text, letters, runic border, circle frame, gradient, photoreal, 3d
```

---

## The ten screens (rune-menu tabs)

**8 · Season**
```
a single disc split down the middle, one half a rayed sun and the other half a crescent moon, bold flat two-tone icon, solid cream-white silhouette on near-black, clear internal detail lines, moderate detail, crisp angular hand-inked linework, not rounded or cutesy, occult folk dark-fantasy character, no frame, no border, high contrast, balanced negative space, centered, reads clearly at 32-48px --ar 1:1 --style raw --sw 250 --seed 777 --no text, letters, runic border, circle frame, gradient, photoreal, 3d
```

**9 · Coven**
```
three simple hooded figures grouped together, bold flat two-tone icon, solid cream-white silhouette on near-black, clear internal detail lines, moderate detail, crisp angular hand-inked linework, not rounded or cutesy, occult folk dark-fantasy character, no frame, no border, high contrast, balanced negative space, centered, reads clearly at 32-48px --ar 1:1 --style raw --sw 250 --seed 777 --no text, letters, runic border, circle frame, gradient, photoreal, 3d
```

**10 · Fields**
```
a single grain stalk sprouting upward from a cracked rune-stone, bold flat two-tone icon, solid cream-white silhouette on near-black, clear internal detail lines, moderate detail, crisp angular hand-inked linework, not rounded or cutesy, occult folk dark-fantasy character, no frame, no border, high contrast, balanced negative space, centered, reads clearly at 32-48px --ar 1:1 --style raw --sw 250 --seed 777 --no text, letters, runic border, circle frame, gradient, photoreal, 3d
```

**11 · Market**
```
a simple balance scale, bold flat two-tone icon, solid cream-white silhouette on near-black, clear internal detail lines, moderate detail, crisp angular hand-inked linework, not rounded or cutesy, occult folk dark-fantasy character, no frame, no border, high contrast, balanced negative space, centered, reads clearly at 32-48px --ar 1:1 --style raw --sw 250 --seed 777 --no text, letters, runic border, circle frame, gradient, photoreal, 3d
```

**12 · War**
```
a wizard's gnarled staff crossed with a warrior's sword in an X with a small spark where they cross, no figure, bold flat two-tone icon, solid cream-white silhouette on near-black, clear internal detail lines, moderate detail, crisp angular hand-inked linework, not rounded or cutesy, occult folk dark-fantasy character, no frame, no border, high contrast, balanced negative space, centered, reads clearly at 32-48px --ar 1:1 --style raw --sw 250 --seed 777 --no text, letters, runic border, circle frame, gradient, photoreal, 3d
```

**13 · Cults**
```
a ring of seven small distinct rune sigils arranged evenly around a circle, bold flat two-tone icon, solid cream-white silhouette on near-black, clear internal detail lines, moderate detail, crisp angular hand-inked linework, not rounded or cutesy, occult folk dark-fantasy character, no frame, no border, high contrast, balanced negative space, centered, reads clearly at 32-48px --ar 1:1 --style raw --sw 250 --seed 777 --no text, letters, runic border, circle frame, gradient, photoreal, 3d
```

**14 · Workings**
```
an open casting hand, fingers spread, a single glowing rune in the palm, bold flat two-tone icon, solid cream-white silhouette on near-black, clear internal detail lines, moderate detail, crisp angular hand-inked linework, not rounded or cutesy, occult folk dark-fantasy character, no frame, no border, high contrast, balanced negative space, centered, reads clearly at 32-48px --ar 1:1 --style raw --sw 250 --seed 777 --no text, letters, runic border, circle frame, gradient, photoreal, 3d
```

**15 · Map**
```
a simple folded map with a single location pin, bold flat two-tone icon, solid cream-white silhouette on near-black, clear internal detail lines, moderate detail, crisp angular hand-inked linework, not rounded or cutesy, occult folk dark-fantasy character, no frame, no border, high contrast, balanced negative space, centered, reads clearly at 32-48px --ar 1:1 --style raw --sw 250 --seed 777 --no text, letters, runic border, circle frame, gradient, photoreal, 3d
```

**16 · Codex**
```
a simple closed book with one rune on the cover, bold flat two-tone icon, solid cream-white silhouette on near-black, clear internal detail lines, moderate detail, crisp angular hand-inked linework, not rounded or cutesy, occult folk dark-fantasy character, no frame, no border, high contrast, balanced negative space, centered, reads clearly at 32-48px --ar 1:1 --style raw --sw 250 --seed 777 --no text, letters, runic border, circle frame, gradient, photoreal, 3d
```

**17 · Saga**
```
an unfurled scroll with a wax seal at the foot, bold flat two-tone icon, solid cream-white silhouette on near-black, clear internal detail lines, moderate detail, crisp angular hand-inked linework, not rounded or cutesy, occult folk dark-fantasy character, no frame, no border, high contrast, balanced negative space, centered, reads clearly at 32-48px --ar 1:1 --style raw --sw 250 --seed 777 --no text, letters, runic border, circle frame, gradient, photoreal, 3d
```

---

## State & feedback (inherently small UI)

**18 · Forgotten Soul**
```
a simple hooded ghost wisp, bold flat two-tone icon, solid cream-white silhouette on near-black, clear internal detail lines, moderate detail, crisp angular hand-inked linework, not rounded or cutesy, occult folk dark-fantasy character, no frame, no border, high contrast, balanced negative space, centered, reads clearly at 32-48px --ar 1:1 --style raw --sw 250 --seed 777 --no text, letters, runic border, circle frame, gradient, photoreal, 3d
```

**19 · Hearth-rune**
```
a standing stone fire-basin brazier with a flame rising from it, bold flat two-tone icon, solid cream-white silhouette on near-black, clear internal detail lines, moderate detail, crisp angular hand-inked linework, not rounded or cutesy, occult folk dark-fantasy character, no frame, no border, high contrast, balanced negative space, centered, reads clearly at 32-48px --ar 1:1 --style raw --sw 250 --seed 777 --no text, letters, runic border, circle frame, gradient, photoreal, 3d
```

**20 · Gain (up)**
```
an upward-pointing angular rune arrow with a small rising spark above it, bold flat two-tone icon, solid cream-white silhouette on near-black, clear internal detail lines, moderate detail, crisp angular hand-inked linework, not rounded or cutesy, occult folk dark-fantasy character, no frame, no border, high contrast, balanced negative space, centered, reads clearly at 32-48px --ar 1:1 --style raw --sw 250 --seed 777 --no text, letters, runic border, circle frame, gradient, photoreal, 3d
```

**21 · Loss (down)**
```
a downward-pointing angular rune arrow with a small ash fleck falling below it, bold flat two-tone icon, solid cream-white silhouette on near-black, clear internal detail lines, moderate detail, crisp angular hand-inked linework, not rounded or cutesy, occult folk dark-fantasy character, no frame, no border, high contrast, balanced negative space, centered, reads clearly at 32-48px --ar 1:1 --style raw --sw 250 --seed 777 --no text, letters, runic border, circle frame, gradient, photoreal, 3d
```

**22 · Contest (skill test)**
```
a simple six-sided die, bold flat two-tone icon, solid cream-white silhouette on near-black, clear internal detail lines, moderate detail, crisp angular hand-inked linework, not rounded or cutesy, occult folk dark-fantasy character, no frame, no border, high contrast, balanced negative space, centered, reads clearly at 32-48px --ar 1:1 --style raw --sw 250 --seed 777 --no text, letters, runic border, circle frame, gradient, photoreal, 3d
```

**23 · Locked / requirement**
```
a simple closed padlock, bold flat two-tone icon, solid cream-white silhouette on near-black, clear internal detail lines, moderate detail, crisp angular hand-inked linework, not rounded or cutesy, occult folk dark-fantasy character, no frame, no border, high contrast, balanced negative space, centered, reads clearly at 32-48px --ar 1:1 --style raw --sw 250 --seed 777 --no text, letters, runic border, circle frame, gradient, photoreal, 3d
```

**24 · Danger / Flame-loss warning**
```
a skull with a small flame burning in its brow, bold flat two-tone icon, solid cream-white silhouette on near-black, clear internal detail lines, moderate detail, crisp angular hand-inked linework, not rounded or cutesy, occult folk dark-fantasy character, no frame, no border, high contrast, balanced negative space, centered, reads clearly at 32-48px --ar 1:1 --style raw --sw 250 --seed 777 --no text, letters, runic border, circle frame, gradient, photoreal, 3d
```

**25 · Advance the season**
```
a three-armed triskelion spiral, bold flat two-tone icon, solid cream-white silhouette on near-black, clear internal detail lines, moderate detail, crisp angular hand-inked linework, not rounded or cutesy, occult folk dark-fantasy character, no frame, no border, high contrast, balanced negative space, centered, reads clearly at 32-48px --ar 1:1 --style raw --sw 250 --seed 777 --no text, letters, runic border, circle frame, gradient, photoreal, 3d
```

---

## Cult swatches (small)

At tiny sizes, cult standing is best shown as a **colour-keyed dot or a simple 7-point star tinted to the cult
colour** — not a detailed sigil. For each cult, take prompt **#13 (seven-pointed star)** and swap
`cream-white` for the cult colour: Red `#c0392b`, Yellow `#d4ac0d`, Brown `#8a5a1f`, Green `#229954`,
Blue `#2471a3`, Purple `#7d3c98`, White `#d5d8dc`. (Or skip AI entirely — a coloured CSS dot already works.)

---

*Reminder: for anything that must render at 16–24px (the circle-bar pressure pips), the reliable path is
generate → vectorise → hand-tidy → SVG. AI raster at 24px is a coin-flip; a clean vector never is.*
