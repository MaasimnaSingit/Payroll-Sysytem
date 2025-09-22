// Safe cleaner: removes files under <SRC> that are not reachable from <SRC>/main.tsx
// Usage:
//   node scripts/cleanup.mjs                 # dry-run for src/
//   node scripts/cleanup.mjs --apply         # apply for src/
//   node scripts/cleanup.mjs --src=web/src   # dry-run for web/src
//   node scripts/cleanup.mjs --src=web/src --apply

import { promises as fs } from 'fs';
import path from 'path';
import url from 'url';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

function arg(key, fallback = null) {
  const hit = process.argv.find(a => a.startsWith(key + '='));
  return hit ? hit.split('=').slice(1).join('=').trim() : fallback;
}
const SRC = path.resolve(__dirname, '..', arg('--src', 'src'));
const APPLY = process.argv.includes('--apply');

async function exists(p) { try { await fs.stat(p); return true; } catch { return false; } }

async function walk(dir) {
  const out = [];
  const ents = await fs.readdir(dir, { withFileTypes: true });
  for (const e of ents) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...await walk(p));
    else out.push(p);
  }
  return out;
}

function isLocal(spec) {
  return spec.startsWith('./') || spec.startsWith('../') || spec.startsWith('/') || spec.startsWith('@/'); // @/ treated as <SRC> root
}

async function resolveImport(fromFile, spec) {
  if (!isLocal(spec)) return null;
  let base;
  if (spec.startsWith('@/')) {
    base = path.join(SRC, spec.slice(2)); // after @/
  } else if (spec.startsWith('/')) {
    base = path.join(SRC, spec);
  } else {
    base = path.resolve(path.dirname(fromFile), spec);
  }
  const candidates = [
    base,
    ...['.ts','.tsx','.js','.jsx','.json','.css'].map(ext => base + ext),
    path.join(base, 'index.ts'),
    path.join(base, 'index.tsx'),
    path.join(base, 'index.js'),
    path.join(base, 'index.jsx'),
  ];
  for (const c of candidates) {
    if (await exists(c)) return c;
  }
  return null;
}

async function parseImports(file) {
  const text = await fs.readFile(file, 'utf8');
  const specs = [];
  const r1 = /import\s+[^'\"]*?['\"]([^'\"]+)['\"]/g;
  const r2 = /export\s+[^'\"]*?from\s+['\"]([^'\"]+)['\"]/g;
  const r3 = /import\(\s*['\"]([^'\"]+)['\"]\s*\)/g;
  let m;
  while ((m = r1.exec(text))) specs.push(m[1]);
  while ((m = r2.exec(text))) specs.push(m[1]);
  while ((m = r3.exec(text))) specs.push(m[1]);
  return specs;
}

async function buildGraph(entry) {
  const q = [entry];
  const seen = new Set();
  while (q.length) {
    const f = q.pop();
    if (seen.has(f)) continue;
    seen.add(f);

    const ext = path.extname(f).toLowerCase();
    if (ext === '.json' || ext === '.css') continue; // include, but don't parse

    if (!['.ts','.tsx','.js','.jsx'].includes(ext)) continue;

    const specs = await parseImports(f);
    for (const s of specs) {
      const r = await resolveImport(f, s);
      if (r && r.startsWith(SRC) && !seen.has(r)) q.push(r);
    }
  }
  return seen;
}

async function main() {
  // support multiple entry filenames
  const ENTRY_CANDIDATES = ['main.tsx','main.jsx','main.ts','main.js','index.tsx','index.jsx'];
  let entry = null;
  for (const cand of ENTRY_CANDIDATES) {
    const p = path.join(SRC, cand);
    // eslint-disable-next-line no-await-in-loop
    if (await exists(p)) { entry = p; break; }
  }
  if (!entry) {
    console.error('Entry not found. Tried:', ENTRY_CANDIDATES.map(c => path.join(SRC,c)).join(', '));
    process.exit(2);
  }

  const reachable = await buildGraph(entry);
  const keepAlso = [
    path.join(SRC, 'styles', 'tailwind.css')
  ].filter(Boolean).map(p => path.normalize(p));

  const keep = new Set([...reachable, ...keepAlso]);
  const all = (await walk(SRC)).map(p => path.normalize(p));

  const extras = all.filter(f =>
    !keep.has(f) &&
    !f.endsWith('.d.ts') &&
    path.basename(f) !== 'vite-env.d.ts'
  );

  const rel = p => path.relative(SRC, p).split(path.sep).join('/');

  if (extras.length === 0) {
    console.log(`[${path.relative(process.cwd(), SRC) || '.'}] Nothing to clean. Source is tidy.`);
    return;
  }

  if (!APPLY) {
    console.log(`[DRY RUN] Unreferenced files under ${path.relative(process.cwd(), SRC) || '.'}:`);
    for (const f of extras) console.log('  -', rel(f));
    console.log('\nTo apply: node scripts/cleanup.mjs --src=' + path.relative(path.join(__dirname,'..'), SRC) + ' --apply');
    return;
  }

  const logPath = path.resolve(__dirname, '..', 'cleanup-removed.txt');
  await fs.writeFile(logPath, extras.map(rel).join('\n') + '\n', 'utf8');
  for (const f of extras) { try { await fs.unlink(f); } catch {} }
  console.log(`Removed ${extras.length} files from ${path.relative(process.cwd(), SRC) || '.'}. List saved to ${path.basename(logPath)}.`);
}

main().catch(e => { console.error('cleanup failed:', e); process.exit(1); });

