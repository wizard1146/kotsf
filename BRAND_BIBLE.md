# Keeper of the Sacred Flame — Brand Bible v1

> The visual + verbal identity system for KOTSF. Companion to `NORTH_STAR.md` (design conscience),
> `PLANNING_01.md` (world), and the working files in `design/`. When a design decision is ambiguous,
> resolve it toward **dark, runic, occult-folk, flame-lit** — never clean/corporate, never cutesy.

---

## 1. The mark — the Sacred Flame

The brand mark is a **pixel-art flame**, drawn in the idiom of the actual Forgotten Runes *Sacred Flame*
(the NFT in the Secret Tower basement). Forgotten Runes is a **pixel-art** world; the mark must live in
that language. (See `design/flame-v2.html` for the live asset, size ladder, and the animated loop.)

**Anatomy (canon colour zones, top → bottom):**
crimson licking **tips** → orange **body** → white-hot **core** → violet/magenta **glow pooling at the base**.
No outline — it *glows* against the dark. An optional faceted **diamond gem** floats beneath it for the fuller
hero lockup.

**Variants**
- **Static flame** — favicon, inline UI, small use.
- **Animated flame** — a 3-frame ping-pong flicker (~130 ms/frame) for splash, loading, and the hearth-rune.
  Must respect `prefers-reduced-motion` (hold frame 1).
- **Flame + gem** — richer splash/hero lockup only.

**Rules**
- **Favicon:** export the flame at native **32×32** (works down to 16 with one simplification step). Pixel
  art scales crisply at integer multiples only — never smooth-scale it.
- **Ground:** the flame reads best on **near-black**. Never place it on light/parchment for the primary mark.
- **Clear space:** keep at least one flame-width of empty dark around the mark.
- **Retired:** the smooth-vector "three triangles" (v1) and the old runic-box glyph `ᚾ`. Do not reuse.

**Don'ts:** don't add drop shadows or bevels, don't recolour outside the canon zones, don't outline it,
don't rotate it, don't stretch it off its pixel grid.

---

## 2. Colour

### 2a. The Flame palette (the hero colours)
| Token | Hex | Use |
|---|---|---|
| Crimson tip | `#c62a1e` | flame edges, danger accents |
| Orange body | `#e86a1c` | flame mid, warm highlights |
| Amber | `#f4a92a` | flame inner, secondary warm |
| White-hot core | `#fde7bf` | flame core, brightest points |
| Magenta base | `#b83a86` | flame base, arcane accents |
| Violet glow | `#7a2f9e` | flame base glow, magic/mana |

### 2b. UI neutrals (in `src/ui/styles.css`)
| Token | Hex | Role |
|---|---|---|
| `--bg` | `#14110f` | app background (warm near-black) |
| `--panel` | `#1f1a16` | panels |
| `--panel-2` | `#2a231d` | raised panels / buttons |
| `--ink` | `#e7dccb` | primary text (warm parchment) |
| `--ink-dim` | `#9c8f7d` | secondary text |
| `--line` | `#3a3128` | borders / dividers |
| `--flame` | `#e8a33d` | **the primary accent** — titles, active state, links |
| `--flame-deep` | `#b5641c` | accent border / hover |
| `--danger` | `#c0392b` | loss, warnings, the Fracture |
| `--ok` | `#4e9a51` | gain, allied standing |

### 2c. The Seven Cult colours (canonical, in `view.js CULT_HEX`)
Red `#c0392b` · Yellow `#d4ac0d` · Brown `#8a5a1f` · Green `#229954` · Blue `#2471a3` · Purple `#7d3c98`
· White `#d5d8dc`. These are **identity colours** — always used to key a cult's swatch, meter, and hold.
Never repurpose them as generic UI colours.

**Principle:** the world is warm-dark and firelit. Cool colours (blue/violet/green) belong to **magic, cults,
and the arcane**; warm colours (amber/orange/crimson) belong to **fire, the hearth, and danger**. Keep that split.

---

## 3. Typography — Barlow, everywhere

The entire game is set in **Barlow** (Jonathan Barnbrook–adjacent grotesque; low-contrast, slightly
condensed, industrial-but-warm). One family, three roles — **weight and width carry the hierarchy.**

| Role | Family | Weight | Used for |
|---|---|---|---|
| **Display** | Barlow Semi Condensed | 700 | game title, screen titles, `h1`–`h3` |
| **Body** | Barlow | 400 / 500 | scene prose, UI text, buttons (500/600) |
| **Emphasis** | Barlow *italic* | 400/500 | advisor quotes, flavour, the Saga |
| **Numeric** | SF Mono / system mono | 400 | pressures, counters, contest values, timestamps |

CSS tokens: `--display`, `--sans`, `--mono` (in `styles.css`). See `design/font-study.html` for the full
specimen against real game copy.

**Rules**
- **Titles:** Barlow Semi Condensed 700, tight tracking (`0.01em`), amber (`--flame`), with a soft dark shadow
  when over art.
- **Body:** Barlow 400, line-height ~1.55, `--ink` on dark. Keep measure ≤ ~70ch for scene prose.
- **Small-caps labels** (season/year, ranks): Barlow with `font-variant: small-caps` + letter-spacing `0.1em+`.
- **Numbers stay mono** — never set a stat readout in Barlow proportional; alignment matters more than family here.
- **Loading Barlow:** currently via Google Fonts `<link>` in `index.html`. **Self-host the woff2** before the
  desktop/Tauri build so the game works fully offline. (Migration note, not urgent for web.)

**Don'ts:** no third typeface, no all-caps body, no letter-spacing on running prose, no light weights (<400)
for anything on the dark ground (they smear).

---

## 4. Iconography — a two-tier system

The reference bar is **Aion Rising** / **Mad Monkies** / the **forgottenrunes.com** UI: bold filled
silhouettes, **sharp/angular** cuts, screenprint-grunge texture, occult-folk, often framed in a **cracked
circular rune-medallion**. White-on-dark. **Zero rounded "SaaS" strokes. Nothing cutesy.**

Because that grunge/hand-inked finish is a *render/illustration* job, we split the set:

- **Tier A — Functional UI icons** (the always-on, tiny ones: 7 pressures, chrome, feedback). Authored as
  **sharp vector** — miter joins, no rounded caps, angular geometry, the flame-tongue motif recurring. Must
  read at 16–24 px in the circle bar. Kept in a single SVG sprite the UI `<use>`s.
- **Tier B — Hero / ornate icons** (brand flame, the 10 screen runes, cult sigils, achievements, big moments).
  **AI-generated** in the Aion/Mad-Monkies/FRWC idiom, then cleaned/vectorised. Generation prompts live in
  `design/ICON_PROMPTS.md`. These carry the texture and the rune-medallion frame.

The full 89-icon inventory (tiered P0/P1/P2) is in `design/flame-explorer.html`.

**Rules:** one visual family across both tiers (shared silhouette weight, shared frame device on Tier B);
white/cream on dark; sharp corners; the flame-tongue as a recurring motif; cult icons always keyed to the
cult colour.

---

## 5. Imagery & art direction

- **Splash / hero art:** painterly, cinematic, dark-fantasy (see `assets/splash.png` — a Wizard casting the
  blue hex-spell over a burning battlefield). Always behind a **dark scrim** so amber text stays legible.
- **In-world / scene art:** **pixel-art**, matching the Runiverse (the Sacred Flame, holds, the Fracture ash).
- **Mood:** firelit dark, occult, folk-mythic, patchwork-broken world. **Never** clean high-fantasy gloss,
  never bright/flat, never generic.
- Respect the **canon/invention boundary** (PLANNING §1): never imply official Forgotten Runes endorsement;
  keep our invented content (Runehold, named NPCs, the pressure economy) clearly ours.

---

## 6. Voice & tone

From `NORTH_STAR.md`: stay inside the **Runiverse voice** — the Forgetting, the Flame, the seven Cults,
Forgotten Souls. Terse, mythic, a little grim; the register of a saga being remembered, not a UI being
narrated. Losses are **authored tragedies**, not "game over." Advisors **disagree** — the Circle's conflicting
counsel is a feature, telegraphed in-fiction, not as percentages.

- **Do:** "The stores ran dry before the harvest. A coven cannot eat runes."
- **Don't:** "You have 0 Provisions. Game over."
- Product/UI microcopy may be plain, but anything **in-world** (scenes, advisors, saga, end screens) stays in voice.

---

## 7. Motion

- **Signature motion:** the flame flicker (3-frame ping-pong). Subtle, warm, alive.
- Keep motion **restrained** — occasional flicker/glow, gentle rises on modals. No bouncy/springy easing
  (that reads cutesy). Honour `prefers-reduced-motion` everywhere (the game already has a Reduce Motion setting).

---

## 8. Quick don'ts

- No rounded, thin, "friendly" icon strokes. Sharp and bold.
- No smooth-scaling the pixel flame. Integer scales only.
- No second/third typeface. Barlow does everything; mono for numbers.
- No cult colour used as generic UI chrome.
- No light-on-light; the brand lives on warm near-black.
- Never imply official Forgotten Runes endorsement.
