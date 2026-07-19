# KOTSF — Small / UI Icon Prompts (48px-legible, Tier A)

The ornate Tier-B icons (`ICON_PROMPTS.md`) blur to a blob below ~48px. These prompts generate the
**small, functional** versions for the always-on UI — pressures, rune-menu tabs, feedback. Different rules:

- **No** rune-medallion frame, **no** grunge/cracks, **no** fine detail, **no** shading.
- **Bold, flat, chunky** single silhouette, thick even weight, sharp angular corners (still not rounded/cutesy).
- Maximum negative space; one clear idea per icon.

**How to use**
1. Same MJ setup: generate one, pin its URL as `--sref` on the rest for a matched set. Fixed `--seed` helps.
2. **Downscale each result to 48 / 32 / 24px and judge there** — if it survives 24px, it's good.
3. These are a **starting point**: for the truly tiny pips (16–24px in the circle bar), the cleanest result is
   to **vectorise the winner** (Illustrator Image Trace / `vtracer`) → hand-tidy → SVG that scales perfectly.
4. Generate on **solid black**, then knock out to transparent for UI use.

**Shared style suffix** (already baked into every prompt below):
> `minimalist flat pictogram, single bold solid cream-white silhouette on solid black, thick even weight, chunky simplified shape, sharp angular corners not rounded, no frame, no border, no grunge, no texture, no shading, high contrast, generous negative space, centered, reads clearly at 24-48px --ar 1:1 --style raw --v 6 --no text, letters, runic border, circle frame, cracks, gradient, small details`

---

## The seven pressures

**1 · Mana**
```
a single four-pointed arcane spark star, minimalist flat pictogram, single bold solid cream-white silhouette on solid black, thick even weight, chunky simplified shape, sharp angular corners not rounded, no frame, no border, no grunge, no texture, no shading, high contrast, generous negative space, centered, reads clearly at 24-48px --ar 1:1 --style raw --v 6 --no text, letters, runic border, circle frame, cracks, gradient, small details
```

**2 · Provisions**
```
a simple bound wheat sheaf, minimalist flat pictogram, single bold solid cream-white silhouette on solid black, thick even weight, chunky simplified shape, sharp angular corners not rounded, no frame, no border, no grunge, no texture, no shading, high contrast, generous negative space, centered, reads clearly at 24-48px --ar 1:1 --style raw --v 6 --no text, letters, runic border, circle frame, cracks, gradient, small details
```

**3 · Coin**
```
a single round coin with one small rune mark, minimalist flat pictogram, single bold solid cream-white silhouette on solid black, thick even weight, chunky simplified shape, sharp angular corners not rounded, no frame, no border, no grunge, no texture, no shading, high contrast, generous negative space, centered, reads clearly at 24-48px --ar 1:1 --style raw --v 6 --no text, letters, runic border, circle frame, cracks, gradient, small details
```

**4 · Lore**
```
a simple open book, minimalist flat pictogram, single bold solid cream-white silhouette on solid black, thick even weight, chunky simplified shape, sharp angular corners not rounded, no frame, no border, no grunge, no texture, no shading, high contrast, generous negative space, centered, reads clearly at 24-48px --ar 1:1 --style raw --v 6 --no text, letters, runic border, circle frame, cracks, gradient, small details
```

**5 · Faith**
```
a single small flame, minimalist flat pictogram, single bold solid cream-white silhouette on solid black, thick even weight, chunky simplified shape, sharp angular corners not rounded, no frame, no border, no grunge, no texture, no shading, high contrast, generous negative space, centered, reads clearly at 24-48px --ar 1:1 --style raw --v 6 --no text, letters, runic border, circle frame, cracks, gradient, small details
```

**6 · Flame's Regard**
```
a single eye with one small flame above it, minimalist flat pictogram, single bold solid cream-white silhouette on solid black, thick even weight, chunky simplified shape, sharp angular corners not rounded, no frame, no border, no grunge, no texture, no shading, high contrast, generous negative space, centered, reads clearly at 24-48px --ar 1:1 --style raw --v 6 --no text, letters, runic border, circle frame, cracks, gradient, small details
```

**7 · Fracture**
```
a single bold jagged crack, minimalist flat pictogram, single bold solid cream-white silhouette on solid black, thick even weight, chunky simplified shape, sharp angular corners not rounded, no frame, no border, no grunge, no texture, no shading, high contrast, generous negative space, centered, reads clearly at 24-48px --ar 1:1 --style raw --v 6 --no text, letters, runic border, circle frame, cracks, gradient, small details
```

---

## The ten screens (rune-menu tabs)

**8 · Season**
```
a disc that is half sun half moon, minimalist flat pictogram, single bold solid cream-white silhouette on solid black, thick even weight, chunky simplified shape, sharp angular corners not rounded, no frame, no border, no grunge, no texture, no shading, high contrast, generous negative space, centered, reads clearly at 24-48px --ar 1:1 --style raw --v 6 --no text, letters, runic border, circle frame, cracks, gradient, small details
```

**9 · Coven**
```
three simple hooded figures grouped together, minimalist flat pictogram, single bold solid cream-white silhouette on solid black, thick even weight, chunky simplified shape, sharp angular corners not rounded, no frame, no border, no grunge, no texture, no shading, high contrast, generous negative space, centered, reads clearly at 24-48px --ar 1:1 --style raw --v 6 --no text, letters, runic border, circle frame, cracks, gradient, small details
```

**10 · Fields**
```
a wheat sheaf crossed with a scythe, minimalist flat pictogram, single bold solid cream-white silhouette on solid black, thick even weight, chunky simplified shape, sharp angular corners not rounded, no frame, no border, no grunge, no texture, no shading, high contrast, generous negative space, centered, reads clearly at 24-48px --ar 1:1 --style raw --v 6 --no text, letters, runic border, circle frame, cracks, gradient, small details
```

**11 · Market**
```
a simple balance scale, minimalist flat pictogram, single bold solid cream-white silhouette on solid black, thick even weight, chunky simplified shape, sharp angular corners not rounded, no frame, no border, no grunge, no texture, no shading, high contrast, generous negative space, centered, reads clearly at 24-48px --ar 1:1 --style raw --v 6 --no text, letters, runic border, circle frame, cracks, gradient, small details
```

**12 · War**
```
a wizard staff crossed with a sword, minimalist flat pictogram, single bold solid cream-white silhouette on solid black, thick even weight, chunky simplified shape, sharp angular corners not rounded, no frame, no border, no grunge, no texture, no shading, high contrast, generous negative space, centered, reads clearly at 24-48px --ar 1:1 --style raw --v 6 --no text, letters, runic border, circle frame, cracks, gradient, small details
```

**13 · Cults**
```
a bold seven-pointed star, minimalist flat pictogram, single bold solid cream-white silhouette on solid black, thick even weight, chunky simplified shape, sharp angular corners not rounded, no frame, no border, no grunge, no texture, no shading, high contrast, generous negative space, centered, reads clearly at 24-48px --ar 1:1 --style raw --v 6 --no text, letters, runic border, circle frame, cracks, gradient, small details
```

**14 · Workings**
```
a circle with a single flame at its center, minimalist flat pictogram, single bold solid cream-white silhouette on solid black, thick even weight, chunky simplified shape, sharp angular corners not rounded, no frame, no border, no grunge, no texture, no shading, high contrast, generous negative space, centered, reads clearly at 24-48px --ar 1:1 --style raw --v 6 --no text, letters, runic border, circle frame, cracks, gradient, small details
```

**15 · Map**
```
a simple folded map with a single location pin, minimalist flat pictogram, single bold solid cream-white silhouette on solid black, thick even weight, chunky simplified shape, sharp angular corners not rounded, no frame, no border, no grunge, no texture, no shading, high contrast, generous negative space, centered, reads clearly at 24-48px --ar 1:1 --style raw --v 6 --no text, letters, runic border, circle frame, cracks, gradient, small details
```

**16 · Codex**
```
a simple closed book with one rune on the cover, minimalist flat pictogram, single bold solid cream-white silhouette on solid black, thick even weight, chunky simplified shape, sharp angular corners not rounded, no frame, no border, no grunge, no texture, no shading, high contrast, generous negative space, centered, reads clearly at 24-48px --ar 1:1 --style raw --v 6 --no text, letters, runic border, circle frame, cracks, gradient, small details
```

**17 · Saga**
```
a simple unrolled scroll, minimalist flat pictogram, single bold solid cream-white silhouette on solid black, thick even weight, chunky simplified shape, sharp angular corners not rounded, no frame, no border, no grunge, no texture, no shading, high contrast, generous negative space, centered, reads clearly at 24-48px --ar 1:1 --style raw --v 6 --no text, letters, runic border, circle frame, cracks, gradient, small details
```

---

## State & feedback (inherently small UI)

**18 · Forgotten Soul**
```
a simple hooded ghost wisp, minimalist flat pictogram, single bold solid cream-white silhouette on solid black, thick even weight, chunky simplified shape, sharp angular corners not rounded, no frame, no border, no grunge, no texture, no shading, high contrast, generous negative space, centered, reads clearly at 24-48px --ar 1:1 --style raw --v 6 --no text, letters, runic border, circle frame, cracks, gradient, small details
```

**19 · Hearth-rune**
```
a single bold angular rune glyph, minimalist flat pictogram, single bold solid cream-white silhouette on solid black, thick even weight, chunky simplified shape, sharp angular corners not rounded, no frame, no border, no grunge, no texture, no shading, high contrast, generous negative space, centered, reads clearly at 24-48px --ar 1:1 --style raw --v 6 --no text, letters, runic border, circle frame, cracks, gradient, small details
```

**20 · Gain (up)**
```
a bold upward chevron arrow, minimalist flat pictogram, single bold solid cream-white silhouette on solid black, thick even weight, chunky simplified shape, sharp angular corners not rounded, no frame, no border, no grunge, no texture, no shading, high contrast, generous negative space, centered, reads clearly at 24-48px --ar 1:1 --style raw --v 6 --no text, letters, runic border, circle frame, cracks, gradient, small details
```

**21 · Loss (down)**
```
a bold downward chevron arrow, minimalist flat pictogram, single bold solid cream-white silhouette on solid black, thick even weight, chunky simplified shape, sharp angular corners not rounded, no frame, no border, no grunge, no texture, no shading, high contrast, generous negative space, centered, reads clearly at 24-48px --ar 1:1 --style raw --v 6 --no text, letters, runic border, circle frame, cracks, gradient, small details
```

**22 · Contest (skill test)**
```
a simple six-sided die, minimalist flat pictogram, single bold solid cream-white silhouette on solid black, thick even weight, chunky simplified shape, sharp angular corners not rounded, no frame, no border, no grunge, no texture, no shading, high contrast, generous negative space, centered, reads clearly at 24-48px --ar 1:1 --style raw --v 6 --no text, letters, runic border, circle frame, cracks, gradient, small details
```

**23 · Locked / requirement**
```
a simple closed padlock, minimalist flat pictogram, single bold solid cream-white silhouette on solid black, thick even weight, chunky simplified shape, sharp angular corners not rounded, no frame, no border, no grunge, no texture, no shading, high contrast, generous negative space, centered, reads clearly at 24-48px --ar 1:1 --style raw --v 6 --no text, letters, runic border, circle frame, cracks, gradient, small details
```

**24 · Danger / Flame-loss warning**
```
a warning triangle containing a small flame, minimalist flat pictogram, single bold solid cream-white silhouette on solid black, thick even weight, chunky simplified shape, sharp angular corners not rounded, no frame, no border, no grunge, no texture, no shading, high contrast, generous negative space, centered, reads clearly at 24-48px --ar 1:1 --style raw --v 6 --no text, letters, runic border, circle frame, cracks, gradient, small details
```

**25 · Advance the season**
```
a three-armed triskelion spiral, minimalist flat pictogram, single bold solid cream-white silhouette on solid black, thick even weight, chunky simplified shape, sharp angular corners not rounded, no frame, no border, no grunge, no texture, no shading, high contrast, generous negative space, centered, reads clearly at 24-48px --ar 1:1 --style raw --v 6 --no text, letters, runic border, circle frame, cracks, gradient, small details
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
