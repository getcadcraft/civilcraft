/* SPDX-License-Identifier: Apache-2.0 */
/**
 * tables-synth.mjs — builder T's writer check for what the corpus tables do not contain: a block cell with an
 * attribute, cell overrides (alignment, text height, text style, content and background colours, a border), a
 * rotated cell, and a table made from scratch (no source table style: the writer makes "Standard").
 * For every version: our reader must read the written tables back with the same model digest (overrides
 * included), ODA must open the file with no .err, and ODA's DXF must show the cells as written.
 *   node tools/dwg-test/tables-synth.mjs [--targets AC1015,…] [--keep]
 */
import fs from 'node:fs';
import path from 'node:path';
import { readDwg, writeDwg } from '../../lib/dwg/index.js';
import { newModel } from '../../lib/dwg/model.js';
import { odaConvert, mkdirp, REPO, arg, list, flag, pool } from './lib/util.mjs';
import { tableDigest, tablesOf, diffDigest, CORPUS, VERS } from './tables-model.mjs';
import { dxfTables } from './tables-roundtrip.mjs';

const TARGETS = list(arg('--targets')) || VERS;
const OUT = mkdirp(path.join(REPO, 'tmp/dwg-tables/synth'));

/** example_2018's table with a block cell, overrides and a rotation */
function edited() {
  const m = readDwg(new Uint8Array(fs.readFileSync(path.join(CORPUS, 'AC1032/example-2018.dwg'))));
  const e = tablesOf(m)[0];
  const t = e.table;
  const att = m.blocks.find((b) => b.name === 'bloko').entities.find((x) => x.type === 'ATTDEF');
  const only = process.env.SYNTH_ONLY || 'block,over,rot,border';
  if (only.includes('block')) t.cells[2][1] = { type: 'block', value: '', block: 'bloko', blockScale: 0.5, attrs: [{ attdef: att.handle, tag: att.tag, value: 'X1', index: 1 }],
    style: t.cells[2][1].style, rotation: 0, align: 2 };
  if (only.includes('over')) t.cells[3][1] = { ...t.cells[3][1], value: 'over', data: undefined, contentFormat: undefined, cellStyle: undefined,
    overrides: { align: 9, textHeight: 3.5, color: { index: 1 }, background: { index: 3 }, textStyle: 'Standard', ...(only.includes('border') ? { borders: { bottom: { color: { index: 5 }, lineweight: 50, visible: false } } } : {}) }, align: 9 };
  if (only.includes('rot')) t.cells[4][1] = { ...t.cells[4][1], value: 'turned', data: undefined, contentFormat: undefined, rotation: Math.PI / 2 };
  return { m, checks: [
    ['block cell', 2, 1, (c) => c.type === 2 && c.block === 'bloko' && JSON.stringify(c.attrs) === '["X1"]'],
    ['overrides', 3, 1, (c) => c.text === 'over' && c.align === 9 && c.th === 3.5],
    ['rotation', 4, 1, (c) => c.text === 'turned' && Math.abs(c.rot - Math.PI / 2) < 1e-6],
  ] };
}

/** a drawing made from nothing: one 3 × 2 table, its *T block drawn by hand, no table style in the model */
function scratch() {
  const m = newModel('AC1032');
  const lines = [];
  for (const y of [0, -1, -2, -3]) lines.push({ type: 'LINE', layer: '0', start: { x: 0, y, z: 0 }, end: { x: 4, y, z: 0 } });
  for (const x of [0, 2, 4]) lines.push({ type: 'LINE', layer: '0', start: { x, y: 0, z: 0 }, end: { x, y: -3, z: 0 } });
  m.blocks.push({ name: '*Model_Space', entities: [] }, { name: '*Paper_Space', entities: [] }, { name: '*T1', base: { x: 0, y: 0, z: 0 }, flags: 1, entities: lines });
  const cell = (value, extra = {}) => ({ type: 'text', value, rotation: 0, ...extra });
  m.blocks[0].entities.push({ type: 'ACAD_TABLE', layer: '0', block: '*T1', insert: { x: 10, y: 20, z: 0 }, scale: { x: 1, y: 1, z: 1 }, rotation: 0,
    extrusion: { x: 0, y: 0, z: 1 }, horizDir: { x: 1, y: 0, z: 0 },
    table: { styleName: 'Standard', flowDirection: 0, rows: [{ height: 1, style: '_TITLE' }, { height: 1, style: '_HEADER' }, { height: 1, style: '_DATA' }],
      columns: [{ width: 2 }, { width: 2 }], merged: [{ top: 0, left: 0, bottom: 0, right: 1 }],
      cells: [[cell('Title', { merged: { rows: 1, cols: 2 }, align: 5 }), cell('', { covered: true, align: 5 })], [cell('A', { align: 5 }), cell('B', { align: 5 })],
        [cell('1', { align: 2 }), cell('2', { overrides: { align: 6 }, align: 6 })]] } });   // align: the default style's (title/header 5, data 2)
  return { m, checks: [
    ['title', 0, 0, (c) => c.text === 'Title' && c.mw === 2],
    ['data', 2, 0, (c) => c.text === '1'],
    ['override', 2, 1, (c) => c.text === '2' && c.align === 6],
  ] };
}

const CASES = { edited, scratch };
const jobs = [];
for (const name of Object.keys(CASES)) for (const to of TARGETS) jobs.push({ name, to });
const results = [];
await pool(jobs, 6, async (j) => {
  const { m, checks } = CASES[j.name]();
  const res = { ...j, problems: [] };
  results.push(res);
  const src = tablesOf(m).map((e) => tableDigest(e));
  let bytes;
  try { ({ bytes } = writeDwg(m, { version: j.to })); } catch (e) { res.problems.push('writeDwg threw: ' + e.stack.split('\n').slice(0, 3).join(' | ')); return; }
  const out = path.join(OUT, `${j.name}.${j.to}.dwg`);
  fs.writeFileSync(out, bytes);
  const back = tablesOf(readDwg(bytes));
  if (back.length !== src.length) res.problems.push(`ours: ${back.length} tables, wrote ${src.length}`);
  back.forEach((b, i) => { if (b.damaged) res.problems.push('ours: damaged ' + b.damaged); for (const d of diffDigest(tableDigest(b), src[i])) res.problems.push('ours: ' + d); });
  const r = await odaConvert(out, 'ACAD2018', 'DXF', path.join(OUT, 'oda'), { stem: `${j.name}.${j.to}` });
  if (r.err.length) res.problems.push('ODA .err: ' + r.err.slice(0, 4).join(' | '));
  if (!r.out) return;
  const t = dxfTables(fs.readFileSync(r.out, 'utf8'))[0];
  if (!t) { res.problems.push('ODA DXF: no ACAD_TABLE'); return; }
  const nc = t.cols.length;
  for (const [what, i, k, ok] of checks) { const c = t.cells[i * nc + k]; if (!c || !ok(c)) res.problems.push(`ODA DXF ${what} (${i},${k}): ${JSON.stringify(c)}`); }
  if (!flag('--keep')) fs.rmSync(r.out, { force: true });
});
results.sort((a, b) => (a.name + a.to < b.name + b.to ? -1 : 1));
let bad = 0;
for (const r of results) {
  if (r.problems.length) bad++;
  console.log(`${r.name} → ${r.to}: ${r.problems.length ? r.problems.length + ' problems' : 'OK'}`);
  for (const p of r.problems.slice(0, 8)) console.log('    ' + p);
}
console.log(`${results.length - bad}/${results.length} OK`);
process.exitCode = bad ? 1 : 0;
