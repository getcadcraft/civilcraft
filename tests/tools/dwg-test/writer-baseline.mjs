/* SPDX-License-Identifier: Apache-2.0 */
/**
 * writer-baseline.mjs — run the oracle readers on the ORIGINAL drawings (no writer involved) and compare their DXF with our
 * reader's model, exactly as writer-roundtrip.mjs compares a written file. A difference that shows up here too is the
 * oracle's (or our reader's) own behaviour on the source, not something the writer did: writer-roundtrip.mjs --baseline
 * drops round-trip differences that this comparison also reports.
 *
 *   node tools/dwg-test/writer-baseline.mjs [--sources a.dwg,dir,…] [--readers libredwg,libdxfrw,oda] [--keep dir]
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { readDwg } from '../../lib/dwg/read.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const TOOLS = path.join(ROOT, 'tools/civilcraft-test');
const PY = path.join(TOOLS, 'venv/bin/python');
const hex = (h) => (h === undefined || h === null ? null : String(h).toUpperCase().replace(/^0+(?=.)/, ''));

/** A writer report that says "every entity of the source was written unchanged". */
export function identityReport(src) {
  const handles = {};
  for (const b of src.blocks) for (const e of b.entities) if (e.handle !== undefined) handles[hex(e.handle)] = hex(e.handle);
  return { handles, renamed: { layers: {}, blocks: {}, layouts: {} }, skipped: {} };
}

/** Strip entity indices so the same difference matches whatever the entity's position in its list. */
export const diffKey = (s) => s.replace(/ #\d+ /, ' # ').replace(/: \d+ entities, expected \d+$/, ': entity count');

/** { reader → Set(diffKey) } for one source file. */
export async function baseline(file, readers, dir, version = 'AC1032') {
  const { compareRT } = await import('./writer-roundtrip.mjs');
  const { availableReaders } = await import(pathToFileURL(path.join(TOOLS, 'dwg-readers.mjs')).href);
  const key = (r) => (/LibreDWG/.test(r.name) ? 'libredwg' : /libdxfrw/.test(r.name) ? 'libdxfrw' : 'oda');
  const src = readDwg(new Uint8Array(fs.readFileSync(file)));
  const report = identityReport(src);
  const out = {};
  const copy = path.join(dir, 'orig-' + path.basename(file));
  fs.copyFileSync(file, copy);
  for (const rd of availableReaders(TOOLS).filter((r) => readers.includes(key(r)))) {
    const k = key(rd);
    const r = rd.run([copy], dir).get(copy);
    if (k === 'libredwg') {   // every warning, not only the first 20 the oracle wrapper keeps
      const dwgread = path.join(TOOLS, 'venv/dwg-readers/libredwg/bin/dwgread');
      const v = spawnSync(dwgread, ['-v2', copy], { encoding: 'latin1', maxBuffer: 1 << 30 });
      r.problems = (v.stderr || '').split('\n').filter((l) => /error|warn/i.test(l));
    }
    const set = new Set();
    if (fs.existsSync(r.dxf)) {
      const d = JSON.parse(execFileSync(PY, [path.join(ROOT, 'tools/dwg-test/writer-dump.py'), r.dxf, ...(r.encoding ? [r.encoding] : [])], { encoding: 'utf8', maxBuffer: 1 << 30 }));
      // entity counts and type mismatches are never excused: they would hide an entity the writer lost
      for (const m of compareRT(src, report, d, { reader: k, version }).diffs) if (!/entities, expected|: type /.test(m)) set.add(diffKey(m));
    }
    out[k] = { diffs: set, problems: r.problems };
  }
  return out;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const arg = (k, d) => { const i = process.argv.indexOf(k); return i >= 0 ? process.argv[i + 1] : d; };
  const dir = path.resolve(arg('--keep', fs.mkdtempSync(path.join(process.env.TMPDIR || '/tmp', 'dwgw-base-'))));
  fs.mkdirSync(dir, { recursive: true });
  const files = [];
  for (const s of arg('--sources', '/var/www/CADCRAFT/testfiles/dwg-samples').split(',')) {
    if (fs.statSync(s).isDirectory()) for (const f of fs.readdirSync(s).sort()) { if (f.toLowerCase().endsWith('.dwg')) files.push(path.join(s, f)); }
    else files.push(s);
  }
  const readers = arg('--readers', 'libredwg,libdxfrw,oda').split(',');
  for (const f of files) {
    const b = await baseline(f, readers, dir);
    for (const [k, v] of Object.entries(b)) {
      console.log(`${path.basename(f).slice(0, 44).padEnd(44)} ${k.padEnd(8)} ${v.diffs.size} diff(s)` + (v.problems.length ? ` | ${v.problems.slice(0, 2).join(' | ')}` : ''));
      for (const m of [...v.diffs].slice(0, 12)) console.log('    ' + m.slice(0, 220));
    }
  }
}
