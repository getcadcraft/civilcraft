#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * TEST STUB ONLY — not the library converter.
 *
 * A tiny stand-in for tools/library/convert.mjs (owned by builder B) that speaks the same CLI contract
 * (docs/LIBRARY-SPEC.md §2) so bin/test-library.php can exercise LibraryConverter / LibrarySubmissions
 * before the real converter exists. It is used ONLY when a test sets LibraryConverter::$script to this
 * file; the site never runs it.
 *
 *   node test-stub-convert.mjs <input> <out-dir> [--units in|mm|…] [--block <name>]… [--list]
 *
 * Supports: ASCII DXF (BLOCKS section: named, non-anonymous blocks; LINE/CIRCLE/ARC/LWPOLYLINE; ATTDEF
 * tags + defaults; INSUNITS 1 = in, 4 = mm, else --units or inches) and CSV (name,width,depth,height with
 * "(in)"/"(mm)" header suffix). Reads only <input>, writes only under <out-dir>.
 * Special input name "stub-fail.dxf" → exit 2 {ok:false}; "stub-hang.dxf" sleeps (timeout tests).
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { basename, join, extname } from 'node:path';

const argv = process.argv.slice(2);
const out = (o, code = 0) => { process.stdout.write(JSON.stringify(o)); process.exit(code); };
if (argv.length < 2) out({ ok: false, error: 'usage: <input> <out-dir> [--list]' }, 2);
const [input, outDir] = argv;
const list = argv.includes('--list');
const unitsArg = argv.includes('--units') ? argv[argv.indexOf('--units') + 1] : null;
const blocks = argv.flatMap((a, i) => (a === '--block' ? [argv[i + 1]] : []));
const name = basename(input);
if (name.startsWith('stub-fail')) out({ ok: false, error: 'Stub failure requested.' }, 2);
if (name.startsWith('stub-hang')) { setTimeout(() => {}, 1e9); }
const SCALE = { in: 25.4, ft: 304.8, mm: 1, cm: 10, m: 1000 };

function parseDxf(text) {
  const lines = text.split(/\r?\n/);
  const pairs = [];
  for (let i = 0; i + 1 < lines.length; i += 2) pairs.push([parseInt(lines[i].trim(), 10), lines[i + 1].trim()]);
  let insunits = 0;
  for (let i = 0; i < pairs.length; i++) if (pairs[i][1] === '$INSUNITS' && pairs[i + 1]) insunits = parseInt(pairs[i + 1][1], 10);
  const res = [];
  let inBlocks = false, cur = null, ent = null;
  const flush = () => { if (ent && cur) cur.ents.push(ent); ent = null; };
  for (let i = 0; i < pairs.length; i++) {
    const [c, v] = pairs[i];
    if (c === 2 && v === 'BLOCKS' && pairs[i - 1]?.[1] === 'SECTION') { inBlocks = true; continue; }
    if (!inBlocks) continue;
    if (c === 0 && v === 'ENDSEC') { flush(); break; }
    if (c === 0) {
      flush();
      if (v === 'BLOCK') { cur = { name: null, ents: [], attrs: {} }; continue; }
      if (v === 'ENDBLK') { if (cur && cur.name && !cur.name.startsWith('*')) res.push(cur); cur = null; continue; }
      if (cur) ent = { type: v, g: {} };
      continue;
    }
    if (cur && !ent && c === 2 && cur.name === null) cur.name = v;
    if (ent) (ent.g[c] ??= []).push(v);
  }
  return { insunits, blocks: res };
}

function blockItem(b, scale) {
  const ents = []; const attrs = {};
  for (const e of b.ents) {
    const n = (c, k = 0) => parseFloat(e.g[c]?.[k] ?? '0') * scale;
    if (e.type === 'LINE') ents.push({ type: 'line', layer: e.g[8]?.[0] ?? '0', color: null, x1: n(10), y1: n(20), x2: n(11), y2: n(21) });
    else if (e.type === 'CIRCLE') ents.push({ type: 'circle', layer: e.g[8]?.[0] ?? '0', color: null, x: n(10), y: n(20), r: n(40) });
    else if (e.type === 'ARC') ents.push({ type: 'arc', layer: e.g[8]?.[0] ?? '0', color: null, x: n(10), y: n(20), r: n(40), a0: parseFloat(e.g[50]?.[0] ?? 0), a1: parseFloat(e.g[51]?.[0] ?? 0) });
    else if (e.type === 'LWPOLYLINE') {
      const xs = e.g[10] ?? [], ys = e.g[20] ?? [];
      ents.push({ type: 'poly', layer: e.g[8]?.[0] ?? '0', color: null, pts: xs.map((x, k) => [parseFloat(x) * scale, parseFloat(ys[k]) * scale]), closed: (parseInt(e.g[70]?.[0] ?? '0', 10) & 1) === 1 });
    } else if (e.type === 'ATTDEF') attrs[e.g[2]?.[0] ?? 'TAG'] = e.g[1]?.[0] ?? '';
  }
  return { ents, attrs };
}

function bounds(ents) {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  const add = (x, y) => { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); };
  for (const e of ents) {
    if (e.type === 'line') { add(e.x1, e.y1); add(e.x2, e.y2); }
    else if (e.type === 'circle' || e.type === 'arc') { add(e.x - e.r, e.y - e.r); add(e.x + e.r, e.y + e.r); }
    else if (e.type === 'poly') e.pts.forEach(p => add(p[0], p[1]));
  }
  return isFinite(x0) ? { x0, y0, x1, y1 } : { x0: 0, y0: 0, x1: 1, y1: 1 };
}

function svg(ents) {
  const b = bounds(ents); const w = (b.x1 - b.x0) || 1, h = (b.y1 - b.y0) || 1;
  const body = ents.map(e => e.type === 'line' ? `<line x1="${e.x1}" y1="${-e.y1}" x2="${e.x2}" y2="${-e.y2}"/>`
    : e.type === 'circle' ? `<circle cx="${e.x}" cy="${-e.y}" r="${e.r}"/>`
    : e.type === 'poly' ? `<polyline points="${e.pts.map(p => `${p[0]},${-p[1]}`).join(' ')}"/>` : '').join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${b.x0} ${-b.y1} ${w} ${h}"><rect x="${b.x0}" y="${-b.y1}" width="${w}" height="${h}" fill="#fff"/><g fill="none" stroke="#000" vector-effect="non-scaling-stroke">${body}</g></svg>`;
}

const key = s => s.replace(/[^A-Za-z0-9_-]+/g, '_').slice(0, 80) || 'item';
let kind, cands = [], notes = [];
const ext = extname(input).toLowerCase();
const text = readFileSync(input, 'utf8');

if (ext === '.dxf') {
  kind = 'dxf';
  const d = parseDxf(text);
  let unit = unitsArg;
  if (!unit) { unit = d.insunits === 4 ? 'mm' : 'in'; if (![1, 4].includes(d.insunits)) notes.push('The drawing has no units; inches were assumed.'); }
  const scale = SCALE[unit] ?? 25.4;
  for (const b of d.blocks) {
    const { ents, attrs } = blockItem(b, scale);
    const bb = bounds(ents);
    cands.push({ key: key(b.name), name: b.name, entities: ents.length, attrs, has_body: true,
      item: { format: 'cadcraft-library-item', format_version: 1, name: b.name, kind: 'equipment', category: 'other/other',
        description: '', maker: '', model: '', plan: { layers: [{ name: '0', color: 7 }], entities: ents },
        body: { type: 'box', x: bb.x0, y: bb.y0, z: 0, w: bb.x1 - bb.x0, d: bb.y1 - bb.y0, h: 900 },
        params: { width: bb.x1 - bb.x0, depth: bb.y1 - bb.y0, height: 900 }, source_attrs: attrs } });
  }
} else if (ext === '.csv') {
  kind = 'csv';
  const rows = text.trim().split(/\r?\n/).map(l => l.split(',').map(s => s.trim()));
  const head = rows.shift().map(s => s.toLowerCase());
  const col = n => head.findIndex(h => h.startsWith(n));
  const sc = head.some(h => h.includes('(mm)')) ? 1 : 25.4;
  for (const r of rows) {
    const nm = r[col('name')]; const w = parseFloat(r[col('width')]) * sc, d = parseFloat(r[col('depth')]) * sc, hh = parseFloat(r[col('height')]) * sc;
    const ents = [{ type: 'poly', layer: 'EQUIP', color: null, pts: [[-w / 2, -d / 2], [w / 2, -d / 2], [w / 2, d / 2], [-w / 2, d / 2]], closed: true }];
    cands.push({ key: key(nm), name: nm, entities: 1, attrs: {}, has_body: true,
      item: { format: 'cadcraft-library-item', format_version: 1, name: nm, kind: 'equipment', category: r[col('category')] || 'other/other',
        plan: { layers: [{ name: 'EQUIP', color: 7 }], entities: ents }, body: { type: 'box', x: -w / 2, y: -d / 2, z: 0, w, d, h: hh },
        params: { width: w, depth: d, height: hh }, source_attrs: {} } });
  }
} else out({ ok: false, error: 'stub: unsupported type ' + ext }, 2);

if (list) out({ ok: true, kind, candidates: cands.map(({ item, ...c }) => c), notes });
const pick = blocks.length ? cands.filter(c => blocks.includes(c.name)) : cands;
const items = [];
for (const c of pick) {
  const dir = join(outDir, c.key);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'item.json'), JSON.stringify(c.item));
  writeFileSync(join(dir, 'preview.svg'), svg(c.item.plan.entities));
  items.push({ key: c.key, path: join(dir, 'item.json') });
}
out({ ok: true, items, notes });
