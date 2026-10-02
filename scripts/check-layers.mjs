// Guards the cascade-layer order (docs/css-follow-ups.md item 12).
//
// src/styles/global.css declares `@layer reset, base, layout, code;` and
// everything site-wide sits in those four layers, while component styles
// (Astro <style> blocks, CSS Modules) stay unlayered so they always win.
// Layer order is fixed by first appearance, so an @layer anywhere else would
// silently join that ordering, and a misspelt layer name (layer(Code)) would
// create a fifth layer that outranks the other four. Only two files may name
// layers at all, and only the declared four.
//
// Run with `npm run lint:layers`. Exits 1 and lists every violation.
import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const ORDER = ['reset', 'base', 'layout', 'code'];
const ALLOWED = new Set(['src/styles/global.css', 'src/styles/code-layer.css']);

const files = [];
const walk = (dir) => {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) walk(path);
    else if (/\.(css|astro)$/.test(entry.name)) files.push(relative(ROOT, path));
  }
};
walk(join(ROOT, 'src'));

// Blank out comments so prose about @layer (like global.css's own) doesn't
// count, keeping their newlines so reported line numbers stay true.
const code = (path) =>
  readFileSync(join(ROOT, path), 'utf8').replace(/\/\*[\s\S]*?\*\//g, (c) => c.replace(/[^\n]/g, ''));

const problems = [];
for (const path of files) {
  const text = code(path);
  const lines = text.split('\n');
  lines.forEach((line, i) => {
    const uses = line.match(/@layer\b[^;{]*|layer\(\s*[^)]*\)/g);
    if (!uses) return;
    for (const use of uses) {
      if (!ALLOWED.has(path)) {
        problems.push(`${path}:${i + 1}: \`${use.trim()}\` — component and page styles must stay unlayered`);
        continue;
      }
      const names = use.replace(/^@layer|^layer\(|\)$/g, '').split(',').map((n) => n.trim()).filter(Boolean);
      for (const name of names) {
        if (!ORDER.includes(name)) problems.push(`${path}:${i + 1}: unknown layer \`${name}\` (declared: ${ORDER.join(', ')})`);
      }
    }
  });
}

const declared = code('src/styles/global.css').match(/@layer\s+([^;{]+);/);
const order = declared?.[1].split(',').map((n) => n.trim());
if (order?.join() !== ORDER.join()) {
  problems.push(`src/styles/global.css: layer order statement is \`${declared?.[0] ?? 'missing'}\`, expected \`@layer ${ORDER.join(', ')};\``);
}

if (problems.length) {
  console.error(`Layer order check failed (${problems.length}):\n  ${problems.join('\n  ')}`);
  process.exit(1);
}
console.log(`Layer order check passed: ${files.length} style sources scanned; only ${[...ALLOWED].join(' and ')} name layers, all of them declared.`);
