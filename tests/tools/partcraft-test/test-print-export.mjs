#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-print-export.mjs — 0.8 SU.934 + SU.929 step 5 in PartCraft as export actions (part_PART_3; print-export.js over the shared
 * scale-factors / print-features / print-split / print3d copies). Hand cases on a part built by the mesh kernel:
 *   - a 100 × 60 × 10 block, 2 % shrinkage "add" on X and Y, none on Z, about the centre: the file's box is 102 × 61.2 × 10 about the same
 *     centre; "exact" 2 % gives 100 / 0.98 = 102.0408…; plain factors 1.5 / 1 / 0.5 about the lowest corner keep that corner;
 *   - the volume scales by fx·fy·fz (STL read back);
 *   - a 300 × 60 × 10 bar split for a 220 × 220 × 250 bed: at least 2 pieces, each fitting the bed, a zip of STL pieces + the assembly sheet;
 *   - the copies are byte-identical to ModelCraft's (print-split-sync.mjs --check partcraft).
 *   node tools/partcraft-test/test-print-export.mjs   (or runPrintExportTests() from bin/test-partcraft.mjs)
 */
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '../..');
const DEV = path.join(REPO, 'public_html/assets/apps/partcraft/dev/');

const readStl = (b) => {
  const dv = new DataView(b.buffer, b.byteOffset, b.byteLength), n = dv.getUint32(80, true), lo = [Infinity, Infinity, Infinity], hi = [-Infinity, -Infinity, -Infinity];
  let vol = 0;
  for (let k = 0; k < n; k++) {
    const o = 84 + 50 * k + 12, p = [0, 1, 2].map((j) => [0, 1, 2].map((a) => dv.getFloat32(o + 12 * j + 4 * a, true)));
    for (const q of p) for (let a = 0; a < 3; a++) { lo[a] = Math.min(lo[a], q[a]); hi[a] = Math.max(hi[a], q[a]); }
    vol += (p[0][0] * (p[1][1] * p[2][2] - p[1][2] * p[2][1]) - p[0][1] * (p[1][0] * p[2][2] - p[1][2] * p[2][0]) + p[0][2] * (p[1][0] * p[2][1] - p[1][1] * p[2][0])) / 6;
  }
  return { n, lo, hi, vol };
};
const zipNames = (z) => { const out = []; const dv = new DataView(z.buffer, z.byteOffset, z.byteLength); let o = 0; while (o + 30 <= z.length && dv.getUint32(o, true) === 0x04034b50) { const cs = dv.getUint32(o + 18, true), nl = dv.getUint16(o + 26, true), el = dv.getUint16(o + 28, true); out.push(new TextDecoder().decode(z.subarray(o + 30, o + 30 + nl))); o += 30 + nl + el + cs; } return out; };

export async function runPrintExportTests({ ok, section, M = null }) {
  section('SU.934 + SU.929 step 5: print exports (print-export.js)');
  const K = await import(DEV + 'kernel.js'), P = await import(DEV + 'part.js'), S = await import(DEV + 'sketch.js'), X = await import(DEV + 'print-export.js');
  if (!M) { const { default: Module } = await import(path.join(REPO, 'public_html/assets/vendor/manifold-3d/current/manifold.js')); M = await Module(); M.setup(); }
  const block = (w, h, d) => { const part = P.newPart('Block'), sk = S.newSketch(); S.addRect(sk, [0, 0], [w, h]); const f = P.addFeature(part, 'sketch', { plane: { kind: 'base', name: 'front' }, sketch: sk }); P.addFeature(part, 'extrude', { sketch: f.id, op: 'add', end: 'blind', depth: d }); return K.regenerate(part, M); };
  const r = block(100, 60, 10), b0 = r.stats.bbox, size0 = [0, 1, 2].map((a) => b0.max[a] - b0.min[a]);
  ok(Math.abs(size0[0] - 100) < 1e-6 && Math.abs(size0[1] - 60) < 1e-6 && Math.abs(size0[2] - 10) < 1e-6, `the block is ${size0.map((v) => +v.toFixed(3)).join(' × ')} mm (front plane: x 100, y 60, depth along z 10)`);
  const near = (a, b, e = 1e-3) => Math.abs(a - b) <= e;
  const a = X.scaleFile(r.mesh, { factors: [1, 1, 1], about: 'center', shrink: { pct: [2, 2, 0], mode: 'add' } }, { name: 'Block' });
  const sa = readStl(a.data), ca = [0, 1, 2].map((k) => (sa.lo[k] + sa.hi[k]) / 2), c0 = [0, 1, 2].map((k) => (b0.min[k] + b0.max[k]) / 2);
  ok(near(sa.hi[0] - sa.lo[0], 102) && near(sa.hi[1] - sa.lo[1], 61.2) && near(sa.hi[2] - sa.lo[2], 10) && ca.every((v, k) => near(v, c0[k])), `2 % shrinkage "add" on X and Y about the centre: ${[0, 1, 2].map((k) => (sa.hi[k] - sa.lo[k]).toFixed(4)).join(' × ')} (102 × 61.2 × 10), centre kept`);
  ok(near(Math.abs(sa.vol), 100 * 60 * 10 * 1.02 * 1.02, 0.5), `volume × 1.02²: ${Math.abs(sa.vol).toFixed(1)} vs ${(60000 * 1.0404).toFixed(1)} mm³`);
  ok(a.name === 'Block-scaled.stl' && a.factors.join() === '1.02,1.02,1', 'the file is Block-scaled.stl, factors 1.02, 1.02, 1');
  const e = X.scaleFile(r.mesh, { factors: [1, 1, 1], about: 'center', shrink: { pct: [2, 0, 0], mode: 'exact' } });
  const se = readStl(e.data);
  ok(near(se.hi[0] - se.lo[0], 100 / 0.98, 1e-3), `2 % "exact" (pattern = size ÷ (1 − s)): ${(se.hi[0] - se.lo[0]).toFixed(4)} vs 100 / 0.98 = ${(100 / 0.98).toFixed(4)}`);
  const f = X.scaleFile(r.mesh, { factors: [1.5, 1, 0.5], about: 'min', shrink: null }, { format: '3mf' });
  ok(f.name.endsWith('.3mf') && f.data.length > 100 && f.data[0] === 0x50 && f.data[1] === 0x4b, '3MF out (a zip package)');
  const m2 = X.scaledMesh(r.mesh, { factors: [1.5, 1, 0.5], about: 'min', shrink: null });
  let lo = [Infinity, Infinity, Infinity], hi = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < m2.positions.length; i += 3) for (let k = 0; k < 3; k++) { lo[k] = Math.min(lo[k], m2.positions[i + k]); hi[k] = Math.max(hi[k], m2.positions[i + k]); }
  ok(lo.every((v, k) => near(v, b0.min[k])) && near(hi[0] - lo[0], 150) && near(hi[2] - lo[2], 5), `factors 1.5 / 1 / 0.5 about the lowest corner: the corner stays at (${lo.map((v) => +v.toFixed(3)).join(', ')}), size ${(hi[0] - lo[0]).toFixed(3)} × ${(hi[1] - lo[1]).toFixed(3)} × ${(hi[2] - lo[2]).toFixed(3)}`);
  // split for printing
  const bar = block(300, 60, 10), t0 = Date.now();
  const z = await X.splitZip(M, bar.mesh, { mode: 'bed', bed: [220, 220, 250], planes: [], ...(await import(DEV + 'print-split.js')).SPLIT_DEFAULTS }, { name: 'Bar' });
  const names = zipNames(z.data);
  ok(z.pieces >= 2 && z.joints >= 1 && z.name === 'Bar-pieces.zip', `a 300 mm bar for a 220 mm bed: ${z.pieces} pieces, ${z.joints} joints, ${z.pins} pins (${Date.now() - t0} ms)`);
  ok(names.filter((n) => /^Bar-\d+\.stl$/.test(n)).length === z.pieces && names.includes('assembly.svg'), 'the zip: one STL per piece and the assembly sheet — ' + names.join(', '));
  let fits = true; const { inflateRawSync } = await import('node:zlib');
  const dv = new DataView(z.data.buffer, z.data.byteOffset, z.data.byteLength); let o = 0;
  while (o + 30 <= z.data.length && dv.getUint32(o, true) === 0x04034b50) {
    const meth = dv.getUint16(o + 8, true), cs = dv.getUint32(o + 18, true), nl = dv.getUint16(o + 26, true), el = dv.getUint16(o + 28, true), nm = new TextDecoder().decode(z.data.subarray(o + 30, o + 30 + nl));
    let body = z.data.subarray(o + 30 + nl + el, o + 30 + nl + el + cs); if (meth === 8) body = inflateRawSync(body);
    if (/^Bar-\d+\.stl$/.test(nm)) { const s = readStl(new Uint8Array(body)); const sz = [0, 1, 2].map((k) => s.hi[k] - s.lo[k]).sort((p, q) => q - p); if (!(sz[0] <= 250 + 1e-3 && sz[1] <= 220 + 1e-3 && sz[2] <= 220 + 1e-3)) fits = false; }
    o += 30 + nl + el + cs;
  }
  ok(fits, 'every piece fits the 220 × 220 × 250 bed');
  let same = false; try { execFileSync(process.execPath, [path.join(REPO, 'tools/modelcraft-test/print-split-sync.mjs'), '--check', 'partcraft'], { stdio: 'pipe' }); same = true; } catch { same = false; }
  ok(same, 'the shared files are byte-identical to ModelCraft\'s (print-split-sync.mjs --check partcraft)');
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  let pass = 0, fail = 0;
  const ok = (c, m) => { if (c) { pass++; if (process.argv.includes('--verbose')) console.log('  ok  ', m); } else { fail++; console.log('FAIL', m); } };
  await runPrintExportTests({ ok, section: (s) => console.log('\n== ' + s) });
  console.log(`\nprint-export: ${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}
