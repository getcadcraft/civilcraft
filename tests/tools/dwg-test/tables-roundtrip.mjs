/* SPDX-License-Identifier: Apache-2.0 */
/**
 * tables-roundtrip.mjs — builder T's writer check for tables. For each drawing with tables: read the corpus file,
 * write it in every version, then
 *   1. read the written file back with our reader: every table's model digest must equal the source's
 *      (tables-model.mjs tableDigest);
 *   2. convert it with the ODA File Converter (DWG → DXF 2018, audit on): no .err allowed;
 *   3. compare the ACAD_TABLE cells of ODA's DXF of our file with ODA's DXF of the source (the corpus truth of the
 *      R2018 file: ODA's DXF of R2000/R2004 sources drops "general" cell values, see table-write.js): per table
 *      (matched by its *T block's insert point) row heights, column widths, and per cell the type, merge flags and
 *      sizes, value text, data type, alignment override, field code / cached value, block and attribute values.
 *
 *   node tools/dwg-test/tables-roundtrip.mjs [--files a,b] [--from AC1032] [--targets AC1015,…] [--no-oda] [--keep]
 *     diagnostics: [--drop-objects PLOTSETTINGS,…] (leave those source objects out: isolates other writers' issues)
 *                  [--lz-literal] (R2004+ pages stored uncompressed: isolates compressor issues)
 */
import fs from 'node:fs';
import path from 'node:path';
import { readDwg, writeDwg } from '../../lib/dwg/index.js';
import { odaConvert, TAG_TO_ODA, mkdirp, REPO, arg, list, flag, pool } from './lib/util.mjs';
import { tableDigest, tablesOf, diffDigest, CORPUS, VERS } from './tables-model.mjs';

const NAMES = list(arg('--files')) || ['example-2000', 'example-2004', 'example-2007', 'example-2010', 'example-2013', 'example-2018', 'blocks-and-tables-imperial'];
const FROM = list(arg('--from')) || ['AC1032'];
const TARGETS = list(arg('--targets')) || VERS;
const OUT = mkdirp(path.join(REPO, 'tmp/dwg-tables'));

// ---------------------------------------------------------------- DXF tables (group codes of the ACAD_TABLE entity)
export function dxfPairs(text) {
  const L = text.split(/\r?\n/);
  const out = [];
  for (let i = 0; i + 1 < L.length; i += 2) out.push([parseInt(L[i], 10), L[i + 1]]);
  return out;
}
export function dxfTables(text) {
  const P = dxfPairs(text);
  const objs = [];
  let cur = null;
  for (const [c, v] of P) {
    if (c === 0) { cur = { type: v, g: [] }; objs.push(cur); continue; }
    if (cur) cur.g.push([c, v]);
  }
  const byHandle = new Map();
  for (const o of objs) { const h = o.g.find(([c]) => c === 5); if (h) byHandle.set(h[1], o); }
  const field = (h, d = 0) => {
    const o = byHandle.get(h);
    if (!o || o.type !== 'FIELD' || d > 8) return null;
    const get = (c) => o.g.filter(([k]) => k === c).map(([, v]) => v);
    const code = (get(2)[0] || '') + get(3).join('');
    const kids = get(360).map((x) => field(x, d + 1)).filter(Boolean);
    const vs = get(301).join('') ;
    return kids.length ? kids.map((k) => k).join(';') : code + (vs ? ' = ' + vs : '');
  };
  const tables = [];
  for (const o of objs) {
    if (o.type !== 'ACAD_TABLE') continue;
    const g = o.g;
    const k = g.findIndex(([c, v]) => c === 100 && v === 'AcDbTable');
    const head = g.slice(0, k), body = g.slice(k + 1);
    const t = { block: (head.find(([c]) => c === 2) || [])[1], insert: [10, 20, 30].map((c) => +((head.find(([x]) => x === c) || [0, 0])[1])).map((x) => +x.toFixed(6)).join(','),
      rows: [], cols: [], cells: [] };
    let i = 0;
    for (; i < body.length && body[i][0] !== 171; i++) {
      const [c, v] = body[i];
      if (c === 141) t.rows.push(+(+v).toPrecision(9));
      if (c === 142) t.cols.push(+(+v).toPrecision(9));
      if (c === 342) t.style = v;
    }
    let cell = null, inValue = false;
    for (; i < body.length; i++) {
      const [c, v] = body[i];
      if (c === 171) { cell = { type: +v }; t.cells.push(cell); inValue = false; continue; }
      if (!cell) continue;
      if (c === 301 && v === 'CELL_VALUE') { inValue = true; continue; }
      if (c === 304 && v === 'ACVALUE_END') { inValue = false; continue; }
      if (inValue) {
        if (c === 90) cell.dataType = +v;
        else if (c === 93) cell.vflags = +v;
        else if (c === 1 || c === 2) { if (v) cell.text = (cell.text || '') + v; }
        else if (c === 302 || c === 3) { if (v) cell.vtext = (cell.vtext || '') + v; }
        else if (c === 140 && cell.dataType === 2) cell.text = cell.text ?? String(+v);
        continue;
      }
      if (c === 173) cell.covered = +v;
      else if (c === 175) cell.mw = +v;
      else if (c === 176) cell.mh = +v;
      else if (c === 91) cell.flags = +v;
      else if (c === 170) cell.align = +v;
      else if (c === 145) cell.rot = +(+v).toFixed(9);
      else if (c === 344) cell.field = field(v) ?? 'FIELD?';
      else if (c === 340) { const b = byHandle.get(v); cell.block = b ? ((b.g.find(([x]) => x === 2) || [])[1] ?? v) : v; }
      else if (c === 300 && cell.type === 2) (cell.attrs || (cell.attrs = [])).push(v);
      else if (c === 1 && !inValue) cell.text = (cell.text || '') + v;
      else if (c === 140) cell.th = +(+v).toPrecision(9);
      else if (c === 7) cell.ts = v;
      else if (c === 62 || c === 63 || c === 64) cell['c' + c] = +v;
    }
    for (const x of t.cells) {
      if (x.text === undefined && x.vtext !== undefined) x.text = x.vtext;
      delete x.vtext;
      if (x.vflags !== undefined) x.vflags &= 1;   // only "no data" is meaningful across versions
    }
    tables.push(t);
  }
  return tables;
}
/** what a version cannot store: R2000/R2004 keep no cell data types (ODA reports 4 = string) */
export function diffDxfTables(a, b, version = 'AC1032') {
  // R2000/R2004 store neither data types nor "no value": ODA reports 4 (string) for every text cell, an empty
  // string for an empty one (and sets the 0x40000 value flag on it)
  if (version < 'AC1021') for (const t of [...a, ...b]) for (const x of t.cells) {
    if (x.dataType === 4 || x.dataType === 512) x.dataType = 'str';
    if (x.type === 1 && !x.text && !x.field) { x.dataType = 'empty'; delete x.vflags; if (x.flags) x.flags &= ~0x40000; }
  }
  return diffDxfTables0(a, b);
}
function diffDxfTables0(a, b) {
  const out = [];
  if (a.length !== b.length) out.push(`table count ${a.length} ≠ ${b.length}`);
  for (const ta of a) {
    const tb = b.find((x) => x.insert === ta.insert);
    if (!tb) { out.push(`table at ${ta.insert}: missing`); continue; }
    if (JSON.stringify(ta.rows) !== JSON.stringify(tb.rows)) out.push(`${ta.insert} row heights ${ta.rows} ≠ ${tb.rows}`);
    if (JSON.stringify(ta.cols) !== JSON.stringify(tb.cols)) out.push(`${ta.insert} column widths ${ta.cols} ≠ ${tb.cols}`);
    if (ta.cells.length !== tb.cells.length) out.push(`${ta.insert} cell count ${ta.cells.length} ≠ ${tb.cells.length}`);
    const nc = ta.cols.length || 1;
    for (let k = 0; k < Math.min(ta.cells.length, tb.cells.length); k++) {
      const x = JSON.stringify(ta.cells[k]), y = JSON.stringify(tb.cells[k]);
      if (x !== y) out.push(`${ta.insert} cell ${Math.floor(k / nc)},${k % nc}: ${x} ≠ ${y}`);
    }
  }
  return out;
}

async function main() {
  const jobs = [];
  for (const name of NAMES) for (const from of FROM) for (const to of TARGETS) jobs.push({ name, from, to });
  const refDxf = new Map();
  const results = [];
  await pool(jobs, 6, async (j) => {
    const srcFile = path.join(CORPUS, j.from, j.name + '.dwg');
    if (!fs.existsSync(srcFile)) return;
    const m = readDwg(new Uint8Array(fs.readFileSync(srcFile)));
    const dropT = new Set(list(arg('--drop-objects')) || []);
    if (dropT.size) m.objects = m.objects.filter((o) => !dropT.has(o.type));
    if (flag('--lz-literal')) globalThis.__LZ_LITERAL = true;
    const srcT = tablesOf(m);
    if (!srcT.length) return;
    const res = { ...j, problems: [] };
    results.push(res);
    let bytes, report;
    try { ({ bytes, report } = writeDwg(m, { version: j.to })); } catch (e) { res.problems.push('writeDwg threw: ' + e.stack.split('\n').slice(0, 3).join(' | ')); return; }
    const out = path.join(OUT, `${j.name}.${j.from}-${j.to}.dwg`);
    fs.writeFileSync(out, bytes);
    res.notes = report.notes.filter((n) => /table|field/i.test(n));
    // 1. our reader
    const back = readDwg(bytes);
    const backT = tablesOf(back);
    if (backT.length !== srcT.length) res.problems.push(`ours: ${backT.length} tables read back, source has ${srcT.length}`);
    srcT.forEach((s, i) => {
      const b = backT.find((x) => Math.abs(x.insert.x - s.insert.x) < 1e-9 && Math.abs(x.insert.y - s.insert.y) < 1e-9) || backT[i];
      if (!b) return;
      if (b.damaged) res.problems.push('ours: damaged ' + b.damaged);
      for (const d of diffDigest(tableDigest(b), tableDigest(s))) res.problems.push('ours: ' + d);
      if (b.block.slice(0, 2) !== '*T') res.problems.push('ours: block ' + b.block);
    });
    const tbObjs = back.objects.filter((o) => /TABLESTYLE|^FIELD$/.test(o.type));
    for (const o of tbObjs) if (o.damaged) res.problems.push(`ours: ${o.type} ${o.handle} damaged: ${o.damaged}`);
    for (const n of back.report.notes) if (/could not|in part|damaged/i.test(n)) res.problems.push('ours note: ' + n);
    if (flag('--no-oda')) return;
    // 2./3. ODA
    const r = await odaConvert(out, 'ACAD2018', 'DXF', path.join(OUT, 'oda'), { stem: `${j.name}.${j.from}-${j.to}` });
    if (r.err.length) res.problems.push('ODA .err: ' + r.err.slice(0, 6).join(' | '));
    if (!r.out) { res.problems.push('ODA wrote no DXF'); return; }
    const ref = path.join(CORPUS, '_truth/AC1032', j.name + '.dxf');
    if (!refDxf.has(ref)) refDxf.set(ref, dxfTables(fs.readFileSync(ref, 'utf8')));
    const got = dxfTables(fs.readFileSync(r.out, 'utf8'));
    for (const d of diffDxfTables(got, JSON.parse(JSON.stringify(refDxf.get(ref))), j.from < j.to ? j.from : j.to)) res.problems.push('ODA DXF: ' + d);
    if (!flag('--keep')) fs.rmSync(r.out, { force: true });
  });
  results.sort((a, b) => (a.name + a.from + a.to < b.name + b.from + b.to ? -1 : 1));
  let bad = 0;
  for (const r of results) {
    if (r.problems.length) bad++;
    console.log(`${r.name} ${r.from}→${r.to}: ${r.problems.length ? r.problems.length + ' problems' : 'OK'}`);
    for (const p of r.problems.slice(0, +(arg('--show') || 8))) console.log('    ' + p);
  }
  console.log(`${results.length - bad}/${results.length} OK`);
  process.exitCode = bad ? 1 : 0;
}
if (process.argv[1] && import.meta.url.endsWith(path.basename(process.argv[1]))) main();
