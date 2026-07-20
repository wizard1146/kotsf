# KOTSF — Character Portrait Prompts (King of Dragon's Pass style)

Each block below is a **complete, self-contained Midjourney prompt** — paste as-is. Companion to
`ICON_PROMPTS.md` (that doc = UI icons; this doc = character portraits).

**The look:** King of Dragon's Pass character portraits (painterly, semi-realistic head-and-shoulders busts,
slight three-quarter turn, matte illustrated finish, weathered characterful faces, neutral dark ground)
**×** KOTSF's brand (firelit, occult-folk, post-cataclysm wizards)
**×** Forgotten Runes canon (pointed colour-cult hats as the faction key, familiars, staffs, runes — per
`WIZZYPEDIA_READING.md`, *Wizards_(Runiverse)*). Never clean high-fantasy gloss, never bright, never cutesy.

**For a consistent roster (do this):** generate **Vela first**, upscale the best, copy her image URL, and
append `--sref <that-url>` to every other prompt so the whole cast shares one painting style. Keep a fixed
`--seed` (e.g. `--seed 777`) on all of them too. The four framing constants — bust crop, one-side firelight,
dim firelit backdrop, matte painterly finish — are baked into every prompt below; don't vary them.

**Backgrounds are dim, not black.** Portraits use a low-key firelit backdrop with real tonal separation
behind the head (KODP-style), darkening toward the edges — NOT the near-black used for the flame mark. A
pure-black ground reads as a floating head in a void. If a render still comes back too dark, add
`readable background, not pure black, gentle atmospheric depth` and/or nudge exposure in post.

**Keep the house style age-neutral.** Age, weathering, scars, and "hard living" are a **per-character
lever**, never a global constant — bake them into the subject line only. Do NOT add blanket terms like
"weathered face / real age / ash and hard living / grizzled" to the shared style, or the whole cast reads
old (Ember and Wisp are teenagers; the Yellow cult is youthful).

**Params:** `--ar 4:5 --style raw --v 6`. **v6 is the recommended model for this set** — for a painterly,
consistent multi-character roster it holds the KODP look and responds to `--sref`/`--seed` more predictably.
v7 has sharper detail and prompt adherence but tends to over-render toward glossy/photoreal and drifts more
across a set (the opposite of what a matched roster wants); try it per-character only if v6 lacks fidelity.
If a render drifts glossy, append `flat matte painting, no glossy skin, no lens flare, no rendered polish`.

**Colour key = the cult.** Each character's cult colour drives their hat, robe trim, and magic light. Cool
light (blue/violet/green/white) = arcane; warm light (amber/orange/crimson) = fire & danger. Cult hexes:
Red `#c0392b` · Yellow `#d4ac0d` · Brown `#8a5a1f` · Green `#229954` · Blue `#2471a3` · Purple `#7d3c98` ·
White `#d5d8dc`.

**Canon/invention boundary:** these are *our* named NPCs in the Runiverse idiom — never imply official
Forgotten Runes endorsement.

---

## 1 · The Circle (the four starting advisors)

**1 · Vela — Blue, the Loremaster** *(advisor; keeper of the half-burned Athenaeum-scrolls)*
```
head-and-shoulders character portrait of an older woman wizard, silver-streaked dark hair bound back, sharp intelligent eyes, ink-stained fingers, deep indigo-blue robes trimmed with faded arcane script and a pointed blue wizard hat, a half-burned scroll tucked at her collar, composed and scholarly and unyielding, slight three-quarter turn with eyes to camera, painterly semi-realistic illustration in the style of King of Dragon's Pass character portraits, matte finish with visible brushwork, muted earthy palette, no linework, occult-folk Forgotten Runes wizard of the post-cataclysm Runiverse, cool blue arcane light on one side against a dim firelit backdrop of muted warm shadow tones, low-key but readable with soft atmospheric depth behind the figure, darker toward the edges, soft rim light, dark fantasy, weathered characterful face, centered bust crop, no text, no lettering --ar 4:5 --style raw --v 6
```

**2 · Korr Ashen — Red, the Survivor** *(advisor; burn-scarred veteran of the Great Burning)*
```
head-and-shoulders character portrait of a grizzled middle-aged man wizard, close-cropped grey hair, a heavy burn scar across one cheek and jaw, hard tired eyes that have buried too many, ember-red robes gone to ash-grey at the hems and a battered pointed red wizard hat, a mourning-charm of bone and cord at his throat, grim and weathered and watchful, slight three-quarter turn with eyes to camera, painterly semi-realistic illustration in the style of King of Dragon's Pass character portraits, matte finish with visible brushwork, muted earthy palette, no linework, occult-folk Forgotten Runes wizard of the post-cataclysm Runiverse, warm crimson firelight raking the scarred side of his face against a dim firelit backdrop of muted warm shadow tones, low-key but readable with soft atmospheric depth behind the figure, darker toward the edges, soft rim light and faint ember glow, dark fantasy, weathered characterful face, centered bust crop, no text, no lettering --ar 4:5 --style raw --v 6
```

**3 · Ember — Yellow, the Reckless Apprentice** *(young, drawn to the Sacred Flame)*
```
head-and-shoulders character portrait of a young woman wizard in her late teens, wild amber-gold hair, bright fearless eyes, a half-smile like she has already decided, simple yellow-gold apprentice robes singed at the sleeves and a slightly-too-large pointed yellow wizard hat, a small flame reflected in her gaze, reckless and alive and hungry, slight three-quarter turn with eyes to camera, painterly semi-realistic illustration in the style of King of Dragon's Pass character portraits, matte finish with visible brushwork, muted earthy palette, no linework, occult-folk Forgotten Runes wizard of the post-cataclysm Runiverse, hot amber flame-light washing her face with sparks in the dark air against a dim firelit backdrop of muted warm shadow tones, low-key but readable with soft atmospheric depth behind the figure, darker toward the edges, soft rim light, dark fantasy, characterful face, centered bust crop, no text, no lettering --ar 4:5 --style raw --v 6
```

**4 · Wisp — White, the Devout Apprentice** *(quiet, half-listening to something the others cannot hear)*
```
head-and-shoulders character portrait of a slight pale young man wizard, shaved or close-cropped hair, downcast half-focused eyes as if listening to something no one else can hear, plain faintly-luminous bone-white robes and a soft pointed white wizard hat, a simple flame-sigil at the breast, quiet and devout and otherworldly and faintly unsettling, slight three-quarter turn, painterly semi-realistic illustration in the style of King of Dragon's Pass character portraits, matte finish with visible brushwork, muted earthy palette, no linework, occult-folk Forgotten Runes wizard of the post-cataclysm Runiverse, cold white light with a thread of violet glow at the edges against a dim firelit backdrop of muted warm shadow tones, low-key but readable with soft atmospheric depth behind the figure, darker toward the edges, soft rim light, dark fantasy, characterful face, centered bust crop, no text, no lettering --ar 4:5 --style raw --v 6
```

---

## 2 · The Seven Cults (emissary archetypes)

One representative face per colour for diplomacy scenes and the Cults screen. Characterizations follow
Wizzypedia *Wizards_(Runiverse)* (Red/Blue are canon-locked in `PLANNING_01.md`; the other five stay
canon-adjacent until §5's colour characterizations are locked).

**5 · Red emissary — the Gilded Reach** *(cosmopolitan, well-dressed, mercantile-political)*
```
head-and-shoulders character portrait of an opulent aristocrat wizard of the Gilded Reach, cosmopolitan and well-dressed and coldly charming, crimson-and-gold brocade robes heavy with rings and a tall lacquered pointed red wizard hat, gold coin-charms and a merchant's clasp at the throat, urbane and calculating, slight three-quarter turn with eyes to camera, painterly semi-realistic illustration in the style of King of Dragon's Pass character portraits, matte finish with visible brushwork, muted earthy palette, no linework, occult-folk Forgotten Runes Runiverse, warm crimson-gold light on one side against a dim firelit backdrop of muted warm shadow tones, low-key but readable with soft atmospheric depth behind the figure, darker toward the edges, soft rim light, dark fantasy, characterful face, centered bust crop, no text, no lettering --ar 4:5 --style raw --v 6
```

**6 · Yellow emissary — the sun-cult** *(youthful, exuberant, time-and-sun aesthetics)*
```
head-and-shoulders character portrait of a youthful exuberant wizard of the yellow sun-cult, sun-bleached hair and an easy grin, festive golden robes with hourglass and sun motifs and a jaunty pointed yellow wizard hat, small time-charms of glass and sand, warm and reckless and bright-eyed, slight three-quarter turn with eyes to camera, painterly semi-realistic illustration in the style of King of Dragon's Pass character portraits, matte finish with visible brushwork, muted earthy palette, no linework, occult-folk Forgotten Runes Runiverse, warm gold light on one side against a dim firelit backdrop of muted warm shadow tones, low-key but readable with soft atmospheric depth behind the figure, darker toward the edges, soft rim light, dark fantasy, characterful face, centered bust crop, no text, no lettering --ar 4:5 --style raw --v 6
```

**7 · Brown emissary — the rustic hedge-cult** *(provincial, practical, outdated gear)*
```
head-and-shoulders character portrait of a weather-beaten rustic wizard of the brown hedge-cult, sun-lined provincial face and a bushy beard, patched earth-brown homespun robes with a battered floppy pointed brown wizard hat, practical outdated tools and a horn on a cord, plain-spoken and stubborn and shrewd, slight three-quarter turn with eyes to camera, painterly semi-realistic illustration in the style of King of Dragon's Pass character portraits, matte finish with visible brushwork, muted earthy palette, no linework, occult-folk Forgotten Runes Runiverse, warm ochre firelight on one side against a dim firelit backdrop of muted warm shadow tones, low-key but readable with soft atmospheric depth behind the figure, darker toward the edges, soft rim light, dark fantasy, characterful face, centered bust crop, no text, no lettering --ar 4:5 --style raw --v 6
```

**8 · Green emissary — the jungle-cult** *(natural harmony, organic, bio-centric)*
```
head-and-shoulders character portrait of a wild green-cult wizard of the deep jungle, moss-green robes woven with living vines and leaf-charms and a leaf-draped pointed green wizard hat, bark-textured skin and river-stone beads, serene and rooted and faintly feral, slight three-quarter turn with eyes to camera, painterly semi-realistic illustration in the style of King of Dragon's Pass character portraits, matte finish with visible brushwork, muted earthy palette, no linework, occult-folk Forgotten Runes Runiverse, cool green dappled light on one side against a dim firelit backdrop of muted warm shadow tones, low-key but readable with soft atmospheric depth behind the figure, darker toward the edges, soft rim light, dark fantasy, characterful face, centered bust crop, no text, no lettering --ar 4:5 --style raw --v 6
```

**9 · Blue emissary — the scholar-cult** *(academic, technical, relic-keepers)*
```
head-and-shoulders character portrait of a precise scholarly wizard of the blue academy, spectacle-lens monocle and neat trimmed beard, deep-blue robes layered with relic-instruments and rune-diagrams and a crisp pointed blue wizard hat, technical and aloof and exacting, slight three-quarter turn with eyes to camera, painterly semi-realistic illustration in the style of King of Dragon's Pass character portraits, matte finish with visible brushwork, muted earthy palette, no linework, occult-folk Forgotten Runes Runiverse, cool blue arcane light on one side against a dim firelit backdrop of muted warm shadow tones, low-key but readable with soft atmospheric depth behind the figure, darker toward the edges, soft rim light, dark fantasy, characterful face, centered bust crop, no text, no lettering --ar 4:5 --style raw --v 6
```

**10 · Purple emissary — the chaos-cult** *(chaotic, esoteric, intense magical auras)*
```
head-and-shoulders character portrait of a wild-eyed purple-cult wizard wreathed in loud explosive esoteric magic, disheveled violet robes crackling with unstable arcane auras and a crooked pointed purple wizard hat, mismatched charms and a spark-scorched sleeve, chaotic and brilliant and unnerving, slight three-quarter turn with eyes to camera, painterly semi-realistic illustration in the style of King of Dragon's Pass character portraits, matte finish with visible brushwork, muted earthy palette, no linework, occult-folk Forgotten Runes Runiverse, intense violet-magenta magic light on one side against a dim firelit backdrop of muted warm shadow tones, low-key but readable with soft atmospheric depth behind the figure, darker toward the edges, soft rim light, dark fantasy, characterful face, centered bust crop, no text, no lettering --ar 4:5 --style raw --v 6
```

**11 · White emissary — the zen-cult** *(meditative, minimalist, hidden power)*
```
head-and-shoulders character portrait of a serene ascetic wizard of the white zen-cult, shaved head and calm half-closed eyes, plain undyed bone-white robes with no ornament and a soft simple pointed white wizard hat, quiet hidden power, meditative and minimal and faintly luminous, slight three-quarter turn, painterly semi-realistic illustration in the style of King of Dragon's Pass character portraits, matte finish with visible brushwork, muted earthy palette, no linework, occult-folk Forgotten Runes Runiverse, cool pale light on one side against a dim firelit backdrop of muted warm shadow tones, low-key but readable with soft atmospheric depth behind the figure, darker toward the edges, soft rim light, dark fantasy, characterful face, centered bust crop, no text, no lettering --ar 4:5 --style raw --v 6
```

---

## 3 · Practitioner-class templates (recruit portraits)

Reusable templates for procedurally-recruited Circle members — one per class in `view.js CLASS_LABEL`.
**Swap the accent colour** (hat / robe trim / magic light) to the recruited member's cult before generating.

**12 · Magus** *(the learned generalist)*
```
head-and-shoulders character portrait of a composed learned magus, greying hair and a measured gaze, layered scholar-mage robes with a rune-etched staff-head visible and a pointed wizard hat, a keeper of balanced disciplines, slight three-quarter turn with eyes to camera, painterly semi-realistic illustration in the style of King of Dragon's Pass character portraits, matte finish with visible brushwork, muted earthy palette, no linework, occult-folk post-cataclysm Forgotten Runes wizard, firelit from one side against a dim firelit backdrop of muted warm shadow tones, low-key but readable with soft atmospheric depth behind the figure, darker toward the edges, soft rim light, dark fantasy, weathered characterful face, centered bust crop, no text, no lettering --ar 4:5 --style raw --v 6
```

**13 · Sorcerer** *(raw innate power)*
```
head-and-shoulders character portrait of an intense sorcerer channeling raw innate power, taut features and glowing veins of magic at the temples, unadorned dark robes barely containing the energy and a plain pointed wizard hat, dangerous and self-taught, slight three-quarter turn with eyes to camera, painterly semi-realistic illustration in the style of King of Dragon's Pass character portraits, matte finish with visible brushwork, muted earthy palette, no linework, occult-folk post-cataclysm Forgotten Runes wizard, arcane light on one side against a dim firelit backdrop of muted warm shadow tones, low-key but readable with soft atmospheric depth behind the figure, darker toward the edges, soft rim light, dark fantasy, characterful face, centered bust crop, no text, no lettering --ar 4:5 --style raw --v 6
```

**14 · Druid** *(the wild keeper)*
```
head-and-shoulders character portrait of a weathered druid, antler-and-bone circlet and leaf-tangled hair, robes of hide and living moss with a wild pointed wizard hat wound in ivy, a keeper of the broken land, slight three-quarter turn with eyes to camera, painterly semi-realistic illustration in the style of King of Dragon's Pass character portraits, matte finish with visible brushwork, muted earthy palette, no linework, occult-folk post-cataclysm Forgotten Runes wizard, dappled natural light on one side against a dim firelit backdrop of muted warm shadow tones, low-key but readable with soft atmospheric depth behind the figure, darker toward the edges, soft rim light, dark fantasy, weathered characterful face, centered bust crop, no text, no lettering --ar 4:5 --style raw --v 6
```

**15 · Necromancer** *(death's accountant)*
```
head-and-shoulders character portrait of a gaunt hollow-eyed necromancer, ash-pale skin and a cold patient stare, black-and-bone robes hung with grave-charms and a tall drooping pointed wizard hat, a small skull familiar at the shoulder, grim and unhurried, slight three-quarter turn with eyes to camera, painterly semi-realistic illustration in the style of King of Dragon's Pass character portraits, matte finish with visible brushwork, muted earthy palette, no linework, occult-folk post-cataclysm Forgotten Runes wizard, sickly green-grey light on one side against a dim firelit backdrop of muted warm shadow tones, low-key but readable with soft atmospheric depth behind the figure, darker toward the edges, soft rim light, dark fantasy, characterful face, centered bust crop, no text, no lettering --ar 4:5 --style raw --v 6
```

**16 · Pyromancer** *(the Flame's own)*
```
head-and-shoulders character portrait of a fervent pyromancer, singed brows and eyes lit with reflected fire, scorch-marked robes with ember-cracked trim and a heat-warped pointed wizard hat, small flames dancing at the fingertips, zealous and volatile, slight three-quarter turn with eyes to camera, painterly semi-realistic illustration in the style of King of Dragon's Pass character portraits, matte finish with visible brushwork, muted earthy palette, no linework, occult-folk post-cataclysm Forgotten Runes wizard, hot amber-crimson flame-light on one side against a dim firelit backdrop of muted warm shadow tones, low-key but readable with soft atmospheric depth behind the figure, darker toward the edges, soft rim light and ember glow, dark fantasy, characterful face, centered bust crop, no text, no lettering --ar 4:5 --style raw --v 6
```

**17 · Enchanter** *(binder of runes)*
```
head-and-shoulders character portrait of a meticulous enchanter, fine features and a jeweler's focus, robes stitched with glowing bound runes and threaded charms and a rune-pinned pointed wizard hat, rings of worked silver on every finger, patient and precise, slight three-quarter turn with eyes to camera, painterly semi-realistic illustration in the style of King of Dragon's Pass character portraits, matte finish with visible brushwork, muted earthy palette, no linework, occult-folk post-cataclysm Forgotten Runes wizard, soft rune-glow light on one side against a dim firelit backdrop of muted warm shadow tones, low-key but readable with soft atmospheric depth behind the figure, darker toward the edges, soft rim light, dark fantasy, characterful face, centered bust crop, no text, no lettering --ar 4:5 --style raw --v 6
```

**18 · Charmer** *(the honeyed tongue)*
```
head-and-shoulders character portrait of a beguiling charmer, warm knowing smile and bright disarming eyes, fine well-kept robes with a rakish tilted pointed wizard hat and a single charmed songbird familiar, persuasive and quick, slight three-quarter turn with eyes to camera, painterly semi-realistic illustration in the style of King of Dragon's Pass character portraits, matte finish with visible brushwork, muted earthy palette, no linework, occult-folk post-cataclysm Forgotten Runes wizard, warm inviting light on one side against a dim firelit backdrop of muted warm shadow tones, low-key but readable with soft atmospheric depth behind the figure, darker toward the edges, soft rim light, dark fantasy, characterful face, centered bust crop, no text, no lettering --ar 4:5 --style raw --v 6
```

**19 · Chaos Mage** *(the unstable one)*
```
head-and-shoulders character portrait of an erratic chaos mage, asymmetric wild hair and a manic uneven grin, mismatched patchwork robes flickering between colours and a crooked pointed wizard hat, sparks and glitching magic around the hands, unpredictable and grinning, slight three-quarter turn with eyes to camera, painterly semi-realistic illustration in the style of King of Dragon's Pass character portraits, matte finish with visible brushwork, muted earthy palette, no linework, occult-folk post-cataclysm Forgotten Runes wizard, shifting multi-hued magic light on one side against a dim firelit backdrop of muted warm shadow tones, low-key but readable with soft atmospheric depth behind the figure, darker toward the edges, soft rim light, dark fantasy, characterful face, centered bust crop, no text, no lettering --ar 4:5 --style raw --v 6
```

**20 · Ghost Eater** *(devourer of the dead's echoes)*
```
head-and-shoulders character portrait of a haunted ghost-eater, sunken cheeks and faintly glowing throat, dark wind-worn robes trailing wisps of consumed spirit and a ragged pointed wizard hat, a captured ghost-light in a jar at the collar, hollow and hungry and quiet, slight three-quarter turn, painterly semi-realistic illustration in the style of King of Dragon's Pass character portraits, matte finish with visible brushwork, muted earthy palette, no linework, occult-folk post-cataclysm Forgotten Runes wizard, cold spectral blue-white light on one side against a dim firelit backdrop of muted warm shadow tones, low-key but readable with soft atmospheric depth behind the figure, darker toward the edges, soft rim light, dark fantasy, characterful face, centered bust crop, no text, no lettering --ar 4:5 --style raw --v 6
```

---

## 4 · Special states

**21 · Forgotten Soul** *(a Circle member transformed by the Sacred Flame — permanent-loss NPC)*
Generate this as a **transfigured variant of a specific member's portrait**: `--sref` the living member's
image so it reads as "something came back wearing their face."
```
head-and-shoulders character portrait of a Forgotten Soul, a wizard transfigured by the Sacred Flame into something greater and wrong, the familiar face now ash-pale and half-translucent with hollow flame-lit eyes and cracks of white-hot light beneath the skin, tattered scorched robes dissolving into drifting embers and violet glow, the same person and not, tragic and luminous and unsettling, slight three-quarter turn, painterly semi-realistic illustration in the style of King of Dragon's Pass character portraits, matte finish with visible brushwork, muted earthy palette, no linework, occult-folk post-cataclysm Forgotten Runes Runiverse, white-hot core light and violet-magenta glow against a dim firelit backdrop of muted warm shadow tones, low-key but readable with soft atmospheric depth behind the figure, darker toward the edges, soft rim light and ember glow, dark fantasy, centered bust crop, no text, no lettering --ar 4:5 --style raw --v 6
```

---

## Post-processing (match the icon pipeline)

Portraits ship as raster PNG. After generating: pick the take whose light-direction and crop match the set,
crop to a consistent bust rectangle. Keep the backdrop dim and readable, but **vignette the edges down toward
`--panel` (`#1f1a16`)** so the portrait blends into the Circle bar / Advisor Sheet without a hard seam while
the area behind the head keeps its firelit depth. Store under `assets/portraits/<id>.png` (id = the
member's `content/circle/*.json` id, e.g. `vela-the-blue.png`) so `view.js` can resolve them by member id.
