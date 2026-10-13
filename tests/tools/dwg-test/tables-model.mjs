/* SPDX-License-Identifier: Apache-2.0 */
/**
 * tables-model.mjs — builder T's version-neutrality check: reads one drawing in every corpus version and
 * compares each ACAD_TABLE's model digest (grid, sizes, row styles, cell type/value/field/block/attrs, merges,
 * alignment, rotation, overrides) across the versions.
 *   node tools/dwg-test/tables-model.mjs [name…]        (default: example-2000 … example-2018, blocks-and-tables-imperial)
 *   exports tableDigest(entity) for the other tables-*.mjs tools
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readDwg } from '../../lib/dwg/index.js';

export const CORPUS = '/var/www/CADCRAFT/testfiles/dwg-corpus';
export const VERS = ['AC1015', 'AC1018', 'AC1021', 'AC1024', 'AC1027', 'AC1032'];
const r9 = (x) => (typeof x === 'number' ? +x.toPrecision(9) : x);
const col = (c) => (!c ? undefined : c.rgb !== undefined ? 'rgb' + c.rgb.toString(16) : 'i' + c.index);

/** A comparable digest of one table entity (version-neutral parts only). */
export function tableDigest(e, { overrides = true } = {}) {
  const t = e.table;
  if (!t) return { missing: true };
  const d = {
    styleName: t.styleName, flow: t.flowDirection || 0,
    rows: t.rows.map((r) => r9(r.height) + ':' + r.style), cols: t.columns.map((c) => r9(c.width)),
    merged: (t.merged || []).map((m) => `${m.top},${m.left}-${m.bottom},${m.right}`).sort(),
    cells: t.cells.map((row) => row.map((c) => {
      const o = { t: c.type, v: c.value };
      if (c.field) o.f = c.field.children && c.field.children.length ? c.field.children.map((k) => k.code) : c.field.code;
      if (c.block) o.b = c.block + '*' + r9(c.blockScale);
      if (c.attrs) o.a = c.attrs.map((a) => (a.tag || a.index) + '=' + a.value);
      if (c.covered) o.cov = 1;
      if (c.merged) o.m = c.merged.rows + 'x' + c.merged.cols;
      if (c.align !== undefined) o.al = c.align;
      if (c.rotation) o.rot = r9(c.rotation);
      if (overrides && c.overrides) {
        const v = c.overrides, x = {};
        for (const k of Object.keys(v).sort()) x[k] = k === 'color' || k === 'background' ? col(v[k]) : k === 'borders' ? JSON.stringify(v[k]) : r9(v[k]);
        o.ov = x;
      }
      return JSON.stringify(o);
    })),
  };
  return d;
}

export function tablesOf(model) {
  const out = [];
  for (const b of model.blocks) for (const e of b.entities) if (e.type === 'ACAD_TABLE') out.push(e);
  return out;
}

export function diffDigest(a, b) {
  const out = [];
  for (const k of ['styleName', 'flow']) if (a[k] !== b[k]) out.push(`${k}: ${a[k]} ≠ ${b[k]}`);
  for (const k of ['rows', 'cols', 'merged']) if (JSON.stringify(a[k]) !== JSON.stringify(b[k])) out.push(`${k}: ${JSON.stringify(a[k])} ≠ ${JSON.stringify(b[k])}`);
  const n = Math.max(a.cells?.length || 0, b.cells?.length || 0);
  for (let i = 0; i < n; i++) {
    const ra = a.cells?.[i] || [], rb = b.cells?.[i] || [];
    for (let j = 0; j < Math.max(ra.length, rb.length); j++) if (ra[j] !== rb[j]) out.push(`cell ${i},${j}: ${ra[j]} ≠ ${rb[j]}`);
  }
  return out;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const names = process.argv.slice(2).length ? process.argv.slice(2) : ['example-2000', 'example-2004', 'example-2007', 'example-2010', 'example-2013', 'example-2018', 'blocks-and-tables-imperial'];
  let bad = 0;
  for (const name of names) {
    const per = {};
    for (const v of VERS) {
      const f = path.join(CORPUS, v, name + '.dwg');
      if (!fs.existsSync(f)) continue;
      const m = readDwg(new Uint8Array(fs.readFileSync(f)));
      per[v] = tablesOf(m).map((e) => ({ h: e.handle, d: tableDigest(e), damaged: e.damaged }));
    }
    const ref = per.AC1032;
    for (const v of VERS) {
      if (!per[v]) continue;
      const msgs = [];
      if (per[v].length !== ref.length) msgs.push(`table count ${per[v].length} ≠ ${ref.length}`);
      per[v].forEach((t, i) => {
        if (t.damaged) msgs.push(t.h + ' damaged: ' + t.damaged);
        const r = ref.find((x) => x.h === t.h) || ref[i];
        if (r) for (const m of diffDigest(t.d, r.d)) msgs.push(t.h + ' ' + m);
      });
      if (msgs.length) bad++;
      console.log(`${name} ${v} vs AC1032: ${msgs.length ? msgs.length + ' differences' : 'same'}`);
      for (const m of msgs.slice(0, 12)) console.log('   ' + m);
    }
  }
  process.exitCode = bad ? 1 : 0;
}
