#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * kernel-print.mjs — known answers for the kernel fix of session kernel-print (0.7, 2026-10-23; log
 * docs/0.7-sessions/kernel-print.md): model.js `mergeCoplanar` lost faces (print-07 § Found 1) because `reface` took its
 * sample point for "which old face is this region in" on the very edge being merged away, where point-in-polygon is a
 * coin flip; and it re-faced the plane once per edge (minutes for a few thousand triangles). Also the print tools'
 * results as solids (print-solid.js `replaceWithPart`).
 *
 *   node tools/modelcraft-test/kernel-print.mjs [--verbose]     on its own
 *   run({ok, close, section, APP})                            from bin/test-modelcraft.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

/** A box from o, size s, every side two triangles; `flip` picks the other diagonal on every side. Wound outward. */
export function cubeTris(o, s, flip = false) {
  const P = (i, j, k) => [o[0] + i * s[0], o[1] + j * s[1], o[2] + k * s[2]];
  // each side as a quad a b c d counter-clockwise seen from outside
  const quads = [
    [P(0, 0, 0), P(0, 1, 0), P(1, 1, 0), P(1, 0, 0)], [P(0, 0, 1), P(1, 0, 1), P(1, 1, 1), P(0, 1, 1)],
    [P(0, 0, 0), P(1, 0, 0), P(1, 0, 1), P(0, 0, 1)], [P(0, 1, 0), P(0, 1, 1), P(1, 1, 1), P(1, 1, 0)],
    [P(0, 0, 0), P(0, 0, 1), P(0, 1, 1), P(0, 1, 0)], [P(1, 0, 0), P(1, 1, 0), P(1, 1, 1), P(1, 0, 1)],
  ];
  const out = [];
  for (const [a, b, c, d] of quads) out.push(...(flip ? [[a, b, d], [b, c, d]] : [[a, b, c], [a, c, d]]));
  return out;
}
/** A 30 mm box (metres) whose top and bottom are n × n grids of triangle pairs and whose sides are n strips each. */
export function gridBox(n, s = 0.03) {
  const out = [], h = s / n;
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
    const x0 = i * h, x1 = x0 + h, y0 = j * h, y1 = y0 + h;
    out.push([[x0, y0, s], [x1, y0, s], [x1, y1, s]], [[x0, y0, s], [x1, y1, s], [x0, y1, s]]);
    out.push([[x0, y0, 0], [x1, y1, 0], [x1, y0, 0]], [[x0, y0, 0], [x0, y1, 0], [x1, y1, 0]]);
  }
  for (let i = 0; i < n; i++) {
    const a = i * h, b = a + h;
    out.push([[a, 0, 0], [b, 0, 0], [b, 0, s]], [[a, 0, 0], [b, 0, s], [a, 0, s]]);
    out.push([[b, s, 0], [a, s, 0], [a, s, s]], [[b, s, 0], [a, s, s], [b, s, s]]);
    out.push([[0, b, 0], [0, a, 0], [0, a, s]], [[0, b, 0], [0, a, s], [0, b, s]]);
    out.push([[s, a, 0], [s, b, 0], [s, b, s]], [[s, a, 0], [s, b, s], [s, a, s]]);
  }
  return out;
}

export async function run({ ok, close, section, APP }) {
  const I18N = await import(pathToFileURL(path.join(APP, 'i18n.js')));
  if (!I18N.t('app.ptool.eyebrow').includes('3D')) I18N.init({ locale: 'en', strings: JSON.parse(fs.readFileSync(path.join(APP, 'lang/en.json'), 'utf8')) });
  const M = await import(pathToFileURL(path.join(APP, 'model.js')));
  const SO = await import(pathToFileURL(path.join(APP, 'solids.js')));
  const MF = await SO.manifold(() => import(pathToFileURL(path.resolve(APP, '../../../vendor/manifold-3d/current/manifold.js')).href));
  const merged = (tris) => {
    const model = new M.Model();
    const d = M.meshDef(model, tris, 'x', 'group');
    M.mergeCoplanar(d, [...d.edges].filter(([, e]) => e.soft).map(([id]) => id));
    return { d, info: M.solidInfo(d) };
  };

  section('kernel: coplanar merge keeps every face (kernel-print, print-07 § Found 1)');
  {
    // the smallest case: a box of two triangles a side. Merging a side's diagonal leaves a square whose sample point (the
    // centroid of a triangle cut along the OTHER diagonal) lies on the removed one: before the fix that region could be in
    // neither old triangle and was dropped, at any size (the sweep below failed 78 of 180 cases, 8 m parts too)
    let bad = [];
    for (const s of [0.02, 0.0123, 0.2, 2, 8.55]) for (const flip of [false, true]) for (const o of [[0, 0, 0], [0.37 * s, 1.3 * s, -s]]) {
      const { d, info } = merged(cubeTris(o, [s, s, s], flip));
      if (d.faces.size !== 6 || !info.closed || !close(info.volume, s ** 3, s ** 3 * 1e-9)) bad.push(s + (flip ? ' flipped' : '') + ': ' + d.faces.size + ' faces' + (info.closed ? '' : ', open'));
    }
    ok(!bad.length, 'a box of two triangles a side, both diagonals, 12.3 mm to 8.55 m, two origins: 6 faces, closed, s³ each' + (bad.length ? ' — ' + bad.join('; ') : ''));
    const { d, info } = merged(cubeTris([0, 0, 0], [0.02, 0.01, 0.005]));
    ok(d.faces.size === 6 && info.closed && close(info.volume, 1e-6, 1e-15), 'a 20 × 10 × 5 mm block: 6 faces, 1 cm³ (' + d.faces.size + ', ' + info.volume + ')');

    // print-07's repro: Solids › Subtract of a 10 mm bar through a 20 mm box (it came back open: 8 faces, not 10)
    const box = (model, o, w, dd, h) => model.change('box', (mm) => {
      const def = mm.root;
      const before = new Set([...def.faces.keys(), ...def.edges.keys()].map(String));
      M.addPolygon(def, [[o[0], o[1], o[2]], [o[0] + w, o[1], o[2]], [o[0] + w, o[1] + dd, o[2]], [o[0], o[1] + dd, o[2]]], [0, 0, 1]);
      const f = [...def.faces.keys()].find((id) => !before.has(String(id)));
      M.pushPull(def, f, h);
      const sel = [...[...def.faces.keys()].filter((id) => !before.has(String(id))).map((id) => ({ t: 'f', id })), ...[...def.edges.keys()].filter((id) => !before.has(String(id))).map((id) => ({ t: 'e', id }))];
      return mm.makeGroup(def, sel, 'group');
    });
    {
      const model = new M.Model(); model.units = 'm';
      const a = box(model, [0, 0, 0], 0.02, 0.02, 0.02), c = box(model, [0.005, 0.005, -0.01], 0.01, 0.01, 0.04);
      const r = SO.solidOp(MF, model, [], 'subtract', [a], [c]);
      ok(r.closed && r.faces === 10 && close(r.volume, 6e-6, 1e-15), 'Subtract a 10 mm bar through a 20 mm box: closed, 10 faces, 6 cm³ (' + r.faces + ', ' + r.volume + ')');
    }
    // the same three tools at sizes from 1 mm to 10 m
    bad = [];
    for (const k of [0.001, 0.003, 0.01, 0.02, 0.03, 0.1, 0.2, 0.3, 1, 2, 7.32, 8.55]) {
      const r4 = (x) => Math.round(x * 1e4) / 1e4;
      for (const [op, faces, vol] of [['subtract', 10, 6], ['union', 6, 12], ['intersect', 6, 4]]) {
        const model = new M.Model(); model.units = 'm';
        const o = [r4(0.37 * k), r4(1.3 * k), 0];
        const a = box(model, o, r4(2 * k), r4(2 * k), r4(2 * k));
        const c = op === 'subtract' ? box(model, [o[0] + r4(0.5 * k), o[1] + r4(0.5 * k), r4(-k)], r4(k), r4(k), r4(4 * k)) : box(model, [o[0] + r4(k), o[1], 0], r4(2 * k), r4(2 * k), r4(2 * k));
        const r = op === 'subtract' ? SO.solidOp(MF, model, [], op, [a], [c]) : SO.solidOp(MF, model, [], op, [a, c]);
        const kk = r4(k) / 1, want = vol * kk ** 3;
        if (!r.closed || r.faces !== faces || !close(r.volume, want, want * 1e-6)) bad.push(op + ' at ' + k + ' m: ' + r.faces + ' faces' + (r.closed ? '' : ', open'));
      }
    }
    ok(!bad.length, 'Union, Subtract, Intersect of boxes from 1 mm to 8.55 m: every result closed with its 6 or 10 faces and its volume' + (bad.length ? ' — ' + bad.join('; ') : ''));

    // one reface per plane, not per edge: 1760 triangles took about a minute (VPS), now well under a second
    const t0 = performance.now();
    const g = merged(gridBox(20));
    const ms = performance.now() - t0;
    ok(g.d.faces.size === 6 && g.info.closed && close(g.info.volume, 27e-6, 1e-15), 'a 30 mm box of 1760 triangles merges into 6 faces, closed, 27 cm³ (' + g.d.faces.size + ')');
    ok(ms < 10000, 'and in reasonable time: ' + ms.toFixed(0) + ' ms (was about 57 000 ms, VPS)');
  }

  section('print tools: results are solids when the kernel holds them (kernel-print, print-solid.js replaceWithPart)');
  {
    const P = await import(pathToFileURL(path.join(APP, 'print3d.js')));
    const H = await import(pathToFileURL(path.join(APP, 'print-hollow.js')));
    const PS = await import(pathToFileURL(path.join(APP, 'print-solid.js')));
    const { boxTris } = await import(pathToFileURL(path.join(ROOT, 'tools/modelcraft-test/print3d.mjs')));
    const asTris = (m) => { const out = []; for (let t = 0; t < m.indices.length; t += 3) out.push([0, 1, 2].map((k) => { const v = m.indices[t + k] * 3; return [m.positions[v] / 1000, m.positions[v + 1] / 1000, m.positions[v + 2] / 1000]; })); return out; };
    const hollow = H.hollowMesh(P.weld(P.meshFromTriangles(boxTris(0, 0, 0, 30, 30, 30))), { wall: 2 });
    const model = new M.Model(); model.units = 'm';
    const before = model.change('cube', (m) => { const d = m.newDef('group', 'Cube'); for (const t of cubeTris([0, 0, 0], [0.03, 0.03, 0.03])) M.fAdd(d, [t.map((p) => M.vAdd(d, p))]); return m.place(m.root, d.id, [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]); });
    const steps = model.undoStack.length;
    let r = PS.replaceWithPart(model, [], [before], asTris(hollow), { label: 'Hollow', name: 'Cube', color: '#c0392b' });
    let d = model.def(model.root.insts.get(r.iid).def), info = M.solidInfo(d);
    ok(r.solid && r.why === null && d.kind === 'group' && d.faces.size === 12, 'a 30 mm cube hollowed to 2 mm: one solid group of 12 faces (6 outside, 6 in the hollow): ' + d.kind + ', ' + d.faces.size);
    ok(info.closed && close(info.volume, (27000 - 17576) * 1e-9, 1e-15) && model.root.insts.size === 1 && model.root.insts.get(r.iid).color === '#c0392b', 'closed, 9424 mm³ of material, in place of the cube, its colour kept');
    ok(model.undoStack.length === steps + 1, 'in one undo step');
    model.undo();
    ok(model.root.insts.has(before) && model.root.insts.size === 1, 'one undo puts the cube back');
    // not closed (a triangle missing): a mesh keeps every triangle, and says why
    r = PS.replaceWithPart(model, [], [before], cubeTris([0, 0, 0], [0.03, 0.03, 0.03]).slice(1), { label: 'Repair', name: 'Cube' });
    d = model.def(model.root.insts.get(r.iid).def);
    ok(!r.solid && r.why === 'open' && d.kind === 'mesh' && d.mesh.nf === 11, 'a part that does not close becomes a mesh of its 11 triangles (why: open): ' + d.kind + ', ' + r.why);
    model.undo();
    // too many faces for a group (the cap for curved field hollows): a mesh, why size
    r = PS.replaceWithPart(model, [], [before], asTris(hollow), { label: 'Hollow', name: 'Cube', maxFaces: 6 });
    ok(!r.solid && r.why === 'size' && model.def(model.root.insts.get(r.iid).def).kind === 'mesh', 'over the face limit it stays a mesh (why: size)');
    model.undo();
    r = PS.replaceWithPart(model, [], [before], asTris(hollow), { label: 'Hollow', name: 'Cube', max: 10 });
    ok(!r.solid && r.why === 'size', 'over the triangle limit it is a mesh without trying');
    model.undo();
    ok(model.defs.size === 2 && [...model.defs.values()].every((x) => x.id === 'root' || x.name === 'Cube'), 'the definitions tried and left are not kept: ' + model.defs.size);
    // the Beginner style's Group with holes: a 20 mm box with a 10 mm hole through it (32 sides) is one solid group
    const tris = PS.booleanTris(MF, [cubeTris([-0.01, -0.01, 0], [0.02, 0.02, 0.02])], [Array.from({ length: 32 }, (_, i) => {
      const a0 = 2 * Math.PI * i / 32, a1 = 2 * Math.PI * (i + 1) / 32, r5 = 0.005, z0 = -0.005, z1 = 0.025;
      const p = (a, z) => [r5 * Math.cos(a), r5 * Math.sin(a), z];
      return [[p(a0, z0), p(a1, z0), p(a1, z1)], [p(a0, z0), p(a1, z1), p(a0, z1)], [[0, 0, z0], p(a1, z0), p(a0, z0)], [[0, 0, z1], p(a0, z1), p(a1, z1)]];
    }).flat()], 'subtract');
    r = PS.replaceWithPart(model, [], [before], tris, { label: 'Group with holes', name: 'Box' });
    d = model.def(model.root.insts.get(r.iid).def); info = M.solidInfo(d);
    const ring = 8e-6 - 0.5 * 32 * 0.005 ** 2 * Math.sin(2 * Math.PI / 32) * 0.02;
    ok(r.solid && d.kind === 'group' && info.closed && d.faces.size === 6 + 32 && close(info.volume, ring, ring * 1e-4), 'Group with holes: a 20 mm box with a 10 mm hole is a solid group of 38 faces (top and bottom with a hole each, 4 sides, 32 in the hole; its corners on the 1 µm grid), ' + (info.volume * 1e9).toFixed(1) + ' mm³ (' + (ring * 1e9).toFixed(1) + '): ' + d.faces.size);
    const soft = [...d.edges.values()].filter((e) => e.soft).length;
    ok(soft === 32, 'the hole\'s 32 side edges are soft (it shades round), the box\'s edges hard: ' + soft + ' soft');
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  let pass = 0, fail = 0;
  const VERBOSE = process.argv.includes('--verbose');
  const ok = (c, m) => { if (c) { pass++; if (VERBOSE) console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };
  const close = (a, b, tol = 1e-6) => Math.abs(a - b) <= tol;
  const section = (s) => console.log('\n' + s);
  await run({ ok, close, section, APP: path.join(ROOT, 'public_html/assets/apps/modelcraft/dev') });
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}
