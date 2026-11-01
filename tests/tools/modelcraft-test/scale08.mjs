#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * scale08.mjs — known answers for Scale by factors and the shrinkage allowance (0.8 SU.934, session model-08; scale-nu.js).
 *
 *   node tools/modelcraft-test/scale08.mjs      on its own
 *   run({ok, close, section, APP})              from bin/test-modelcraft.mjs
 */
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

export async function run({ ok, close, section, APP }) {
  const imp = (f) => import(pathToFileURL(path.join(APP, f)));
  const S = await imp('scale-nu.js'), M = await imp('model.js');

  section('Scale by factors (0.8 SU.934): the words');
  ok(S.parseFactor('1.015') === 1.015 && S.parseFactor('101.5%') === 1.015 && S.parseFactor('+1.5%') === 1.015 && S.parseFactor('-2%') === 0.98, 'a factor as 1.015, 101.5%, +1.5% or -2%');
  ok(S.parseFactor('1,015') === 1.015 && S.parseFactor(' 2 ') === 2, 'a decimal comma and spaces');
  ok(S.parseFactor('0') === null && S.parseFactor('-1') === null && S.parseFactor('abc') === null && S.parseFactor('') === null && S.parseFactor('1e9') === null, 'zero, negatives, words and absurd sizes are refused');
  ok(JSON.stringify(S.parseFactors('1.01; 1.02; 1.03')) === '[1.01,1.02,1.03]' && JSON.stringify(S.parseFactors('1.5')) === '[1.5,1.5,1.5]', 'three factors, or one for all');
  ok(S.parseFactors('1.01;x;1') === null && S.parseFactors('1;2') === null, 'a bad or a missing one = null');
  ok(close(S.shrinkFactor(1.5), 1.015) && close(S.shrinkFactor(1.5, 'exact'), 1 / 0.985) && S.shrinkFactor(60) === null && S.shrinkFactor(-1) === null && S.shrinkFactor(0) === 1, 'shrinkage: 1 + s or 1 / (1 − s); 0 % = 1; out of range = null');

  section('Scale by factors: on the model');
  const box = (m, x0 = 0, dx = 2, dy = 3, dz = 4) => {
    M.addPolygon(m.root, [[x0, 0, 0], [x0 + dx, 0, 0], [x0 + dx, dy, 0], [x0, dy, 0]], [0, 0, 1]);
    M.pushPull(m.root, [...m.root.faces.keys()].at(-1), dz);
  };
  const size = (m, def) => { const b = m.bbox(def, [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]); return [0, 1, 2].map((i) => b.max[i] - b.min[i]); };
  {
    const m = new M.Model();
    m.change('box', (mm) => box(mm));
    const all = [...m.root.faces.keys()].map((id) => ({ t: 'f', id }));
    const bb = S.selectionBox(m, [], all);
    ok(close(bb.max[0] - bb.min[0], 2) && close(bb.max[1] - bb.min[1], 3) && close(bb.max[2] - bb.min[2], 4), 'the selection box is the box');
    ok(JSON.stringify(S.anchorPoint(bb, 'min')) === '[0,0,0]' && JSON.stringify(S.anchorPoint(bb, 'center')) === '[1,1.5,2]' && JSON.stringify(S.anchorPoint(bb, 'base')) === '[1,1.5,0]' && JSON.stringify(S.anchorPoint(bb, 'origin')) === '[0,0,0]', 'anchors: lowest corner, middle, middle of the bottom, origin');
    const n = S.scaleSelection(m, [], all, [1.015, 1.03, 1], S.anchorPoint(bb, 'min'), 'Scale');
    const s = size(m, m.root);
    ok(n === all.length && close(s[0], 2 * 1.015, 1e-9) && close(s[1], 3 * 1.03, 1e-9) && close(s[2], 4, 1e-9), `a box scaled 1.015 × 1.03 × 1 is ${s.map((v) => +v.toFixed(4)).join(' × ')}`);
    const b2 = S.selectionBox(m, [], [...m.root.faces.keys()].map((id) => ({ t: 'f', id })));
    ok(close(b2.min[0], 0) && close(b2.min[1], 0) && close(b2.min[2], 0), 'the lowest corner stayed put');
    const info = M.solidInfo(m.root);
    ok(info.closed && close(info.volume, 2 * 1.015 * 3 * 1.03 * 4, 1e-9), `still a closed solid, volume ${info.volume.toFixed(4)}`);
    m.undo();
    ok(close(size(m, m.root)[0], 2) && close(size(m, m.root)[1], 3), 'one undo puts it back');
    m.redo();
    ok(close(size(m, m.root)[0], 2 * 1.015), 'and redo does it again');
  }
  {
    // a group, scaled about the middle of its bottom: sizes, and the contents are not touched
    const m = new M.Model();
    m.change('box', (mm) => box(mm, 10));
    const id = m.change('group', (mm) => mm.makeGroup(mm.root, [...mm.root.faces.keys()].map((f) => ({ t: 'f', id: f })), 'group'));
    const inst = m.root.insts.get(id), defId = inst.def;
    const before = JSON.stringify([...m.def(defId).verts.values()]);
    const sel = [{ t: 'i', id }];
    const bb = S.selectionBox(m, [], sel);
    ok(close(bb.max[0] - bb.min[0], 2) && close(bb.max[2] - bb.min[2], 4), 'the box of a group');
    S.scaleSelection(m, [], sel, [1.5, 1.5, 1.5], S.anchorPoint(bb, 'base'), 'Scale');
    const b2 = S.selectionBox(m, [], sel);
    ok(close(b2.max[0] - b2.min[0], 3) && close(b2.max[1] - b2.min[1], 4.5) && close(b2.max[2] - b2.min[2], 6), 'the group is 1.5 times bigger');
    ok(close((b2.min[0] + b2.max[0]) / 2, 11) && close(b2.min[2], bb.min[2]), 'about the middle of its bottom: that point did not move');
    ok(JSON.stringify([...m.def(defId).verts.values()]) === before, 'what is inside the group is untouched (its matrix carries the scale)');
    ok(S.scaleSelection(m, [], [{ t: 'g', id: 'x' }], [2, 2, 2], [0, 0, 0], 'Scale') === 0, 'nothing selected that scales = 0, no undo step');
    let threw = false; try { S.scaleSelection(m, [], sel, [0, 1, 1], [0, 0, 0], 'x'); } catch { threw = true; }
    ok(threw, 'a zero factor is refused');
  }
  section('Shrinkage allowance (0.8 SU.934)');
  {
    // a 100 × 60 × 20 mm pattern for a casting that shrinks 1.5 % in length and width and 1 % in height
    const m = new M.Model();
    m.change('box', (mm) => box(mm, 0, 0.1, 0.06, 0.02));
    const all = [...m.root.faces.keys()].map((id) => ({ t: 'f', id }));
    const fs = [1.5, 1.5, 1].map((p) => S.shrinkFactor(p));
    S.scaleSelection(m, [], all, fs, S.anchorPoint(S.selectionBox(m, [], all), 'min'), 'Scale');
    const s = size(m, m.root).map((v) => v * 1000);
    ok(close(s[0], 101.5, 1e-6) && close(s[1], 60.9, 1e-6) && close(s[2], 20.2, 1e-6), `pattern ${s.map((v) => +v.toFixed(3)).join(' × ')} mm (101.5 × 60.9 × 20.2)`);
    const cast = s.map((v, i) => v / fs[i]);
    ok(close(cast[0], 100, 1e-6) && close(cast[1], 60, 1e-6) && close(cast[2], 20, 1e-6), 'and the casting it makes is the part');
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  let pass = 0, fail = 0;
  const ok = (c, m) => { if (c) pass++; else { fail++; console.log('  FAIL ' + m); } };
  const close = (a, b, tol = 1e-6) => Math.abs(a - b) <= tol;
  await run({ ok, close, section: (s) => console.log('\n== ' + s), APP: path.join(ROOT, 'public_html/assets/apps/modelcraft/dev') });
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}
