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
  };
  writeFileSync(join(ROOT, 'content', 'bundle.json'), JSON.stringify(bundle, null, 2));
  return bundle;
}

if (process.argv[1] && process.argv[1].endsWith('bundle.js')) {
  const b = buildBundle();
  console.log(`bundled ${b.scenes.length} scenes, ${b.circle.length} circle members, ${b.codex.length} codex categories, ${b.actions.length} actions → content/bundle.json`);
}
