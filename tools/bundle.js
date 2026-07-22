// bundle.js — collect content/ JSON into a single content/bundle.json the browser
// can fetch with no bundler. Keeps the slice install-free (no node_modules).
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

function loadJson(dir, recurse) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (recurse) out.push(...loadJson(p, recurse));
    } else if (entry.name.endsWith('.json')) {
      out.push(JSON.parse(readFileSync(p, 'utf8')));
    }
  }
  return out;
}

export function buildBundle() {
  const bundle = {
    scenes: loadJson(join(ROOT, 'content', 'scenes'), true),
    circle: loadJson(join(ROOT, 'content', 'circle'), false),
    // codex/wiki entries; each file contributes its `categories`. Flattened so
    // the lore can grow across multiple files without the view caring.
    codex: loadJson(join(ROOT, 'content', 'codex'), false).flatMap((f) => f.categories || []),
    // per-screen actions (Workings, Fields, …) — declarative requires + effects,
    // tagged by `screen`. One unified pool; the view filters by screen.
    actions: loadJson(join(ROOT, 'content', 'actions'), false).flatMap((f) => f.actions || []),
    // ambient advisor counsel per management screen — merged by screen key. The
    // footer casts a personality-fit line to each pinned advisor off the scene page.
    counsel: loadJson(join(ROOT, 'content', 'counsel'), false).reduce((acc, f) => {
      for (const [k, arr] of Object.entries(f.screens || {})) (acc[k] ||= []).push(...arr);
      return acc;
    }, {}),
    // member portrait filenames: portrait_<school>_<gender>_<NNN><a|b|c>.webp
    // (a/b/c = young/middle/old). The view matches one to each Circle member; the
    // originals/ subfolder is skipped (only webp/png files are listed).
    portraits: (() => {
      try { return readdirSync(join(ROOT, 'assets', 'portraits')).filter((f) => /\.(webp|png)$/i.test(f)); }
      catch { return []; }
    })(),
    // new-coven creation wizard (welcome → coven → value selectors)
    creation: (() => {
      try { return JSON.parse(readFileSync(join(ROOT, 'content', 'creation.json'), 'utf8')).steps || []; }
      catch { return []; }
    })(),
    // advisor tasks/roles (assignable per Circle member; passive per-season effects)
    roles: (() => {
      try { return JSON.parse(readFileSync(join(ROOT, 'content', 'roles.json'), 'utf8')).roles || []; }
      catch { return []; }
    })(),
  };
  writeFileSync(join(ROOT, 'content', 'bundle.json'), JSON.stringify(bundle, null, 2));
  return bundle;
}

if (process.argv[1] && process.argv[1].endsWith('bundle.js')) {
  const b = buildBundle();
  console.log(`bundled ${b.scenes.length} scenes, ${b.circle.length} circle members, ${b.codex.length} codex categories, ${b.actions.length} actions → content/bundle.json`);
}
