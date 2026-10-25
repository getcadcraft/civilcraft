#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * print07.mjs — known answers for the 0.7 print tools (LC.21, session print-07): the supports preview
 * (print-supports.js), the wall-thickness check (print-walls.js), hollowing (print-hollow.js) and repair
 * (print-repair.js). Meshes are built by hand in millimetres, Z up, as print3d.js reads them.
 *
 *   node tools/modelcraft-test/print07.mjs [--verbose]        on its own
 *   run({ok, close, section, APP})                            from bin/test-modelcraft.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { boxTris } from './print3d.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

/** A prism: a profile [[x, z] …] counter-clockwise seen from the front (−Y), from y0 to y1; caps given as triangles of the profile. */
export function prismTris(prof, y0, y1, caps) {
  const out = [], n = prof.length;
  const F = (i) => [prof[i][0], y0, prof[i][1]], B = (i) => [prof[i][0], y1, prof[i][1]];
  for (let i = 0; i < n; i++) { const j = (i + 1) % n; out.push({ p: [F(i), B(j), F(j)] }, { p: [F(i), B(i), B(j)] }); }
  for (const [a, b, c] of caps) out.push({ p: [F(a), F(b), F(c)] }, { p: [B(a), B(c), B(b)] });
  return out;
}
/** A UV sphere, `seg` around and `seg / 2` from pole to pole, wound outward. */
export function sphereTris(r, seg = 48, c = [0, 0, 0]) {
  const out = [], rings = seg / 2;
  const p = (i, j) => { const th = Math.PI * i / rings, ph = 2 * Math.PI * j / seg; return [c[0] + r * Math.sin(th) * Math.cos(ph), c[1] + r * Math.sin(th) * Math.sin(ph), c[2] + r * Math.cos(th)]; };
  for (let i = 0; i < rings; i++) for (let j = 0; j < seg; j++) {
    const a = p(i, j), b = p(i + 1, j), cc = p(i + 1, j + 1), d = p(i, j + 1);
    if (i > 0) out.push({ p: [a, b, d] });
    if (i < rings - 1) out.push({ p: [b, cc, d] });
  }
  return out;
}
// the bridge: two 10 mm legs, a 40 mm span 10 mm thick at 30 mm, 20 mm deep
export const BRIDGE = [[[0, 0], [10, 0], [10, 30], [50, 30], [50, 0], [60, 0], [60, 40], [0, 40]], [[0, 1, 2], [0, 2, 7], [2, 3, 6], [2, 6, 7], [3, 4, 5], [3, 5, 6]]];
// a shelf: a base 10 mm high, a back 10 mm wide, a top 10 mm thick reaching out 30 mm over the base
export const SHELF = [[[0, 0], [40, 0], [40, 10], [10, 10], [10, 20], [40, 20], [40, 30], [0, 30]], [[0, 1, 2], [0, 2, 3], [0, 3, 7], [3, 4, 7], [4, 5, 6], [4, 6, 7]]];

export async function run({ ok, close, section, APP }) {
  const I18N = await import(pathToFileURL(path.join(APP, 'i18n.js')));
  if (!I18N.t('app.ptool.eyebrow').includes('3D')) I18N.init({ locale: 'en', strings: JSON.parse(fs.readFileSync(path.join(APP, 'lang/en.json'), 'utf8')) });
  const P = await import(pathToFileURL(path.join(APP, 'print3d.js')));
  const S = await import(pathToFileURL(path.join(APP, 'print-supports.js')));
  const mesh = (tris) => P.weld(P.meshFromTriangles(tris));

  section('3D printing tools: supports preview (0.7 LC.21 item 1, print-supports.js)');
  {
    const bridge = mesh(prismTris(...[BRIDGE[0], 0, 20, BRIDGE[1]]));
    const chk = P.printCheck(bridge);
    ok(chk.ok && close(chk.volume, 24000, 1e-6), 'the bridge is a closed solid of 24 000 mm³: ' + chk.volume);
    const c = S.supportPreview(bridge);
    ok(close(c.overhangArea, 800, 1e-9), 'the span\'s underside (40 × 20 mm) is the only overhang: ' + c.overhangArea + ' mm²');
    ok(c.points === 98 && c.columns === 98 && c.toModel === 0, 'a 3 mm grid puts 14 × 7 = 98 columns under it, all on the bed: ' + c.points);
    ok(close(c.volume, 98 * 9 * 0.15 * 30, 1e-6), 'columns: 98 × 3² mm × 15 % × 30 mm high = 3969 mm³: ' + c.volume);
    const segsOk = [...Array(c.segs.length / 6).keys()].every((k) => close(c.segs[k * 6 + 2], 30, 1e-3) && close(c.segs[k * 6 + 5], 0, 1e-9));
    ok(segsOk, 'every column runs from the span (30 mm) down to the bed (0)');
    const tr = S.supportPreview(bridge, { style: 'tree' });
    ok(tr.points === 98 && tr.branches === 98 && tr.columns < 98 && tr.columns > 0, 'trees: the same 98 points join ' + tr.columns + ' trunks');
    let flat = 0;
    for (let k = 0; k < tr.segs.length / 6; k++) {
      const dx = tr.segs[k * 6 + 3] - tr.segs[k * 6], dy = tr.segs[k * 6 + 4] - tr.segs[k * 6 + 1], dz = Math.abs(tr.segs[k * 6 + 5] - tr.segs[k * 6 + 2]);
      if (Math.hypot(dx, dy) > dz + 1e-9) flat++;
    }
    ok(!flat, 'no branch is flatter than 45° from vertical');
    ok(tr.volume > 0 && tr.volume < c.volume, 'trees take less material than columns here: ' + tr.volume.toFixed(0) + ' < ' + c.volume.toFixed(0) + ' mm³');
    const steep = S.supportPreview(bridge, { angle: 89.9 });
    ok(steep.overhang.length === 2 && steep.points === 98, 'the underside stays an overhang at any angle under 90°');

    const cube = S.supportPreview(mesh(boxTris(0, 0, 0, 20, 20, 20)));
    ok(!cube.overhang.length && !cube.points && cube.volume === 0, 'a cube standing on the bed needs no support');
    const lifted = S.supportPreview(mesh(boxTris(0, 0, 5, 20, 20, 25)), { bedZ: 0 });
    ok(close(lifted.overhangArea, 400, 1e-9) && lifted.points === 49, 'a cube floating 5 mm above the bed: its whole base (400 mm²) needs 7 × 7 supports');

    const shelf = S.supportPreview(mesh(prismTris(SHELF[0], 0, 20, SHELF[1])));
    ok(close(shelf.overhangArea, 600, 1e-9) && shelf.points === 70 && shelf.toModel === 70, 'a shelf over its base: 70 supports, all standing on the base (on the model)');
    ok(close(shelf.volume, 70 * 9 * 0.15 * 10, 1e-6), 'they are 10 mm high (base top 10 → shelf 20): 945 mm³');

    const wide = S.supportPreview(bridge, { maxPoints: 20 });
    ok(wide.spacing > 3 && wide.points <= 40, 'a laptop limit: max 20 points widens the grid to ' + wide.spacing.toFixed(2) + ' mm (' + wide.points + ' points)');

    const ball = S.supportPreview(mesh(sphereTris(10, 32, [0, 0, 10])));
    ok(ball.overhang.length > 0 && ball.points > 0 && ball.toModel === 0, 'a ball on the bed: its lower half needs support from the bed (' + ball.points + ' points)');
  }

  section('3D printing tools: wall thickness (0.7 LC.21 item 3, print-walls.js)');
  {
    const W = await import(pathToFileURL(path.join(APP, 'print-walls.js')));
    const walled = mesh([...boxTris(0, 0, 0, 20, 20, 20), ...boxTris(2, 2, 2, 18, 18, 18, { inward: true })]);
    const r = W.wallThickness(walled, { min: 2.5 });
    ok([...r.values].every((v) => close(v, 2, 1e-6)), 'a box with 2 mm walls: every face measures 2 mm (' + [...new Set([...r.values].map((v) => v.toFixed(4)))] + ')');
    ok(r.thin.length === 24 && close(r.thinArea, 2400 + 1536, 1e-6) && r.regions.length === 2 && close(r.thinnest, 2, 1e-6), 'under a 2.5 mm limit: all of it is thin — the outside and the inside, 2 areas, 3936 mm²');
    const ok15 = W.wallThickness(walled, { min: 1.5 });
    ok(!ok15.thin.length && !ok15.regions.length, 'under a 1.5 mm limit: nothing is thin');
    const plate = W.wallThickness(mesh(boxTris(0, 0, 0, 20, 20, 0.6)));
    ok(plate.regions.length === 2 && close(plate.thinnest, 0.6, 1e-6) && close(plate.thinArea, 800, 1e-6), 'a 0.6 mm plate under the 0.8 mm default: its top and bottom are thin (2 areas, 800 mm²), its edges are not');
    ok(close(plate.regions[0].at[2], 0.3, 0.31), 'each area says where it is');
    const shell = mesh([...sphereTris(10, 48), ...sphereTris(9, 48).map((t) => ({ p: [t.p[0], t.p[2], t.p[1]] }))]);
    const sw = W.wallThickness(shell, { min: 0.8 });
    ok(sw.thinnest > 0.97 && sw.thinnest < 1.03 && !sw.thin.length, 'a ball with a 1 mm shell measures about 1 mm (' + sw.thinnest.toFixed(3) + '): fine at 0.8');
    const dec = W.wallThickness(shell, { min: 1.2, maxRays: 300 });
    ok(dec.decimated && dec.rays <= 300 && [...dec.values].every(Number.isFinite) && dec.thin.length > 0.9 * dec.values.length, 'a laptop limit of 300 rays: every face still gets a value from its neighbours (' + dec.rays + ' rays for ' + dec.values.length + ' faces), and the shell is thin under 1.2 mm');
  }

  section('3D printing tools: hollow with drain holes (0.7 LC.21 item 4, print-hollow.js)');
  {
    const H = await import(pathToFileURL(path.join(APP, 'print-hollow.js')));
    const G = await import(pathToFileURL(path.join(APP, 'print-geom.js')));
    const PS = await import(pathToFileURL(path.join(APP, 'print-solid.js')));
    const SO = await import(pathToFileURL(path.join(APP, 'solids.js')));
    const MF = await SO.manifold(() => import(pathToFileURL(path.resolve(APP, '../../../vendor/manifold-3d/current/manifold.js')).href));
    const asTris = (m) => { const out = []; for (let t = 0; t < m.indices.length; t += 3) out.push({ p: [0, 1, 2].map((k) => { const v = m.indices[t + k] * 3; return [m.positions[v], m.positions[v + 1], m.positions[v + 2]]; }) }); return out; };
    const check = (r) => P.printCheck(P.meshFromTriangles(asTris(r)));

    const box = H.hollowMesh(mesh(boxTris(0, 0, 0, 30, 30, 30)), { wall: 2 });
    let c = check(box);
    ok(box.method === 'offset' && close(box.cavityVolume, 26 ** 3, 1e-6), 'a 30 mm cube hollowed to 2 mm walls: an exact 26 mm hollow (' + box.cavityVolume + ' mm³)');
    ok(c.ok && c.shells === 2 && !c.inverted && close(c.volume, 27000 - 17576, 1e-6), 'the 3D-print check accepts it: 2 shells, the inner one a hollow, 9424 mm³ of material');
    const boxF = H.hollowMesh(mesh(boxTris(0, 0, 0, 30, 30, 30)), { wall: 2, method: 'field' });
    c = check(boxF);
    ok(boxF.method === 'field' && c.ok && Math.abs(boxF.cavityVolume / 17576 - 1) < 0.01, 'the distance field on the same cube: closed and accepted, the hollow within 1 % (' + boxF.cavityVolume.toFixed(0) + ' mm³, grid ' + boxF.cell.toFixed(2) + ' mm)');

    const ball = mesh(sphereTris(20, 48, [0, 0, 20]));
    const outV = P.printCheck(ball).volume, want = outV * (18.5 / 20) ** 3;
    const sp = H.hollowMesh(ball, { wall: 1.5 });
    ok(sp.method === 'offset' && Math.abs(sp.cavityVolume / want - 1) < 0.005 && check(sp).ok, 'a 40 mm ball hollowed to 1.5 mm: the hollow is a 37 mm ball within 0.5 % (' + sp.cavityVolume.toFixed(0) + ' / ' + want.toFixed(0) + ' mm³), accepted');
    const spF = H.hollowMesh(ball, { wall: 1.5, method: 'field' });
    ok(spF.method === 'field' && Math.abs(spF.cavityVolume / want - 1) < 0.01 && check(spF).ok, 'the field on the ball: within 1 % (' + spF.cavityVolume.toFixed(0) + ' mm³), accepted');
    let minWall = Infinity;
    const T0 = G.triMesh(ball);
    for (let v = 0; v < spF.cavity.positions.length / 3; v += 7) minWall = Math.min(minWall, G.nearestDist(T0, spF.cavity.positions[v * 3], spF.cavity.positions[v * 3 + 1], spF.cavity.positions[v * 3 + 2], 5));
    ok(minWall > 1.5 - spF.cell && minWall < 1.5 + spF.cell, 'its walls are 1.5 mm to within one grid step (' + minWall.toFixed(2) + ' mm, grid ' + spF.cell.toFixed(2) + ')');

    const bridge = H.hollowMesh(mesh(prismTris(BRIDGE[0], 0, 20, BRIDGE[1])), { wall: 2 });
    ok(bridge.method === 'offset' && close(bridge.cavityVolume, 696 * 16, 1e-6) && check(bridge).ok, 'the bridge (concave corners): an exact offset hollow, 11 136 mm³');
    // a 2 mm fin on a 30 mm block: an offset of the fin turns over, so the field takes over and leaves the fin solid
    const T1 = [[0, 0], [30, 0], [30, 30], [16, 30], [16, 50], [14, 50], [14, 30], [0, 30]];
    const fin = H.hollowMesh(mesh(prismTris(T1, 0, 30, [[0, 1, 2], [0, 2, 3], [0, 3, 6], [0, 6, 7], [3, 4, 5], [3, 5, 6]])), { wall: 2 });
    c = check(fin);
    ok(fin.method === 'field' && fin.why && c.ok && fin.cavityVolume > 0.9 * 26 ** 3 && fin.cavityVolume < 26 ** 3 * 1.02, 'a block with a 2 mm fin: the offset is refused (' + fin.why + '), the field hollows the block only (' + fin.cavityVolume.toFixed(0) + ' mm³), accepted');
    const thin = H.hollowMesh(mesh(boxTris(0, 0, 0, 30, 30, 3)), { wall: 2 });
    ok(thin.method === 'none' && !thin.cavity, 'a 3 mm plate under 2 mm walls: nothing to hollow, said so');

    // a drain hole through the cube's bottom middle
    const Tb = G.triMesh(P.weld(box));   // the hollow cube: a hole goes in until it meets the hollow
    let tri = -1;
    for (let t = 0; t < Tb.nt; t++) if (Tb.N[t * 3 + 2] < -0.99) { const h = { tri: -1, back: 0 }; if (G.rayNearest(Tb, 15, 15.01, -1, 0, 0, 1, 0, 2, -1, h) >= 0) { tri = h.tri; break; } }
    const cyl = H.drainHole(Tb, { tri, p: [15, 15.01, 0] }, { d: 3, wall: 2 });
    ok(cyl && cyl.length === 96, 'a 3 mm drain hole under the cube: a closed 24-sided cylinder');
    const holed = PS.booleanTris(MF, [asTris(box).map((q) => q.p)], [cyl], 'subtract');
    c = P.printCheck(P.meshFromTriangles(holed.map((p3) => ({ p: p3 }))));
    const plug = 0.5 * 24 * 1.5 * 1.5 * Math.sin(2 * Math.PI / 24) * 2;
    ok(c.ok && c.shells === 1 && close(c.volume, 9424 - plug, 0.05), 'with the drain hole: one closed body (the hollow opens to the outside), ' + c.volume.toFixed(2) + ' mm³ (' + (9424 - plug).toFixed(2) + ')');
  }

  section('3D printing tools: repair beyond flat holes (0.7 LC.21 item 5, print-repair.js)');
  {
    const RP = await import(pathToFileURL(path.join(APP, 'print-repair.js')));
    const SO = await import(pathToFileURL(path.join(APP, 'solids.js')));
    const MF = await SO.manifold(() => import(pathToFileURL(path.resolve(APP, '../../../vendor/manifold-3d/current/manifold.js')).href));
    const asTris = (m) => { const out = []; for (let t = 0; t < m.indices.length; t += 3) out.push({ p: [0, 1, 2].map((k) => { const v = m.indices[t + k] * 3; return [m.positions[v], m.positions[v + 1], m.positions[v + 2]]; }) }); return out; };
    const check = (m) => P.printCheck(P.meshFromTriangles(asTris(m)));
    const kinds = (l) => l.map((x) => x.kind + ':' + x.n).join(' ');
    const turn = (q) => ({ p: [q.p[0], q.p[2], q.p[1]] });

    const good = RP.repairMesh(mesh(boxTris(0, 0, 0, 20, 20, 20)));
    ok(!good.fixed.length && !good.left.length && !good.changed, 'a good cube: nothing to fix, nothing left');
    const one = boxTris(0, 0, 0, 20, 20, 20); one[4] = turn(one[4]);
    let r = RP.repairMesh(mesh(one));
    ok(kinds(r.fixed) === 'flipped:1' && !r.left.length && check(r).ok && close(check(r).volume, 8000, 1e-6), 'one triangle turned over: turned back (flipped:1), 8000 mm³');
    r = RP.repairMesh(mesh(boxTris(0, 0, 0, 20, 20, 20, { inward: true })));
    ok(kinds(r.fixed) === 'inverted:1' && check(r).ok && close(check(r).volume, 8000, 1e-6), 'a cube inside out: turned outward (inverted:1)');
    const hollowed = [...boxTris(0, 0, 0, 30, 30, 30), ...boxTris(10, 10, 10, 20, 20, 20, { inward: true })];
    r = RP.repairMesh(mesh(hollowed));
    ok(!r.fixed.length && check(r).ok && close(check(r).volume, 26000, 1e-6), 'a hollow cube: its inward hollow is right and left alone');
    r = RP.repairMesh(mesh(boxTris(0, 0, 0, 20, 20, 20).slice(2)));
    ok(kinds(r.fixed) === 'holes:1' && check(r).ok && close(check(r).volume, 8000, 1e-6), 'a cube with its bottom missing: the square hole closed (holes:1), 8000 mm³');
    // a ball with its top cap gone: a hole that is not flat (two rings of triangles)
    const ballT = sphereTris(10, 32), cut = ballT.filter((q) => !q.p.every((v) => v[2] > 9.2) && !(q.p.some((v) => v[2] > 9.9)));
    r = RP.repairMesh(mesh(cut));
    const ball = P.printCheck(P.meshFromTriangles(ballT)).volume;
    ok(kinds(r.fixed) === 'holes:1' && check(r).ok && check(r).volume > ball * 0.97, 'a ball with its top cut off: the curved hole closed by a fan (holes:1), closed again (' + check(r).volume.toFixed(0) + ' of ' + ball.toFixed(0) + ' mm³)');
    const dup = [...boxTris(0, 0, 0, 20, 20, 20), boxTris(0, 0, 0, 20, 20, 20)[5]];
    r = RP.repairMesh(mesh(dup));
    ok(kinds(r.fixed) === 'duplicate:1' && check(r).ok, 'a triangle drawn twice: one removed (duplicate:1)');
    const inner = [...boxTris(0, 0, 0, 20, 20, 20), { p: [[0, 0, 10], [20, 0, 10], [20, 20, 10]] }, { p: [[0, 0, 10], [20, 20, 10], [20, 0, 10]] }];
    r = RP.repairMesh(mesh(inner));
    ok(kinds(r.fixed) === 'duplicate:2' && check(r).ok && close(check(r).volume, 8000, 1e-6), 'a face back to back with itself inside the cube: both removed');
    const crumb = [...boxTris(0, 0, 0, 20, 20, 20), ...boxTris(30, 0, 0, 30.2, 0.2, 0.2)];
    r = RP.repairMesh(mesh(crumb));
    ok(kinds(r.fixed) === 'small:1' && check(r).ok && check(r).shells === 1, 'a 0.2 mm crumb beside the cube: removed (small:1)');
    const mixed = boxTris(0, 0, 0, 20, 20, 20).slice(1); mixed[3] = turn(mixed[3]);
    r = RP.repairMesh(mesh([...mixed, ...boxTris(40, 0, 0, 40.1, 0.1, 0.1)]));
    ok(r.fixed.map((f) => f.kind).join() === 'small,flipped,holes' && check(r).ok, 'several at once, each listed: ' + kinds(r.fixed));
    // reported, not fixed
    const flap = [...boxTris(0, 0, 0, 10, 10, 10), { p: [[0, 0, 10], [10, 0, 10], [5, -5, 15]] }];
    r = RP.repairMesh(mesh(flap));
    ok(r.left.some((l) => l.kind === 'nonmanifold' && l.n === 1 && l.at.length === 1) && r.left.some((l) => l.kind === 'open'), 'a loose flap on a cube\'s edge: the edge with three faces and the flap\'s open edges reported, with where, not fixed: ' + kinds(r.left));
    const fin2 = [...boxTris(0, 0, 0, 10, 10, 10), { p: [[0, 0, 10], [10, 0, 10], [5, -5, 15]] }, { p: [[0, 0, 10], [5, -5, 15], [10, 0, 10]] }];
    r = RP.repairMesh(mesh(fin2));
    ok(kinds(r.fixed) === 'duplicate:2' && !r.left.length && check(r).ok, 'the same flap drawn back to back (no thickness): removed, the cube is clean');
    const two = [...boxTris(0, 0, 0, 20, 20, 20), ...boxTris(10, 10, 10, 30, 30, 30)];
    r = RP.repairMesh(mesh(two));
    ok(!r.fixed.length && r.left.some((l) => l.kind === 'overlap'), 'two overlapping cubes: the overlap reported (joining is asked for separately)');
    const joined = RP.joinOverlaps(MF, r);
    const jc = P.printCheck(P.meshFromTriangles(joined.map((p3) => ({ p: p3 }))));
    ok(jc.ok && jc.shells === 1 && !jc.overlaps && close(jc.volume, 8000 + 8000 - 1000, 1e-2), 'Join overlapping parts: one closed body of 15 000 mm³');
    const crossing = [...boxTris(0, 0, 0, 20, 20, 20)];
    for (const q of crossing) for (const v of q.p) if (v[0] === 20 && v[2] === 20) v[0] = -5;   // the top's right edge pulled through the left side
    r = RP.repairMesh(mesh(crossing));
    ok(r.left.some((l) => l.kind === 'selfintersect'), 'a cube folded through itself: reported (selfintersect), not fixed: ' + kinds(r.left));
  }

  section('3D printing tools: the Beginner style\'s shapes, holes, align (0.7 LC.21 item 2, beginner.js)');
  {
    const M = await import(pathToFileURL(path.join(APP, 'model.js')));
    const B = await import(pathToFileURL(path.join(APP, 'beginner.js')));
    const SO = await import(pathToFileURL(path.join(APP, 'solids.js')));
    const ROOTDIR = path.resolve(APP, '../../../../..');
    const { printTriangles } = await import(pathToFileURL(path.join(APP, 'print-mc.js')));
    const model = new M.Model();
    const drop = (id, x, y = 0, z = 0) => model.change('drop ' + id, (m) => { const d = B.buildShape(m, id, id); return m.place(m.root, d.id, [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1]); });
    const vol = (iid) => { const r = P.printCheck(P.meshFromTriangles(printTriangles(model, { sel: [{ t: 'i', id: iid }] }).tris)); return r; };
    const R = 10, H = 20;
    const want = { box: 8000, cylinder: 0.5 * 32 * R * R * Math.sin(2 * Math.PI / 32) * H, cone: 0.5 * 32 * R * R * Math.sin(2 * Math.PI / 32) * H / 3, roof: 0.5 * 20 * 20 * 20 };
    const ids = {};
    for (const [k, x] of [['box', 0], ['cylinder', 40], ['sphere', 80], ['cone', 120], ['roof', 160]]) {
      ids[k] = drop(k, x / 1000);
      const r = vol(ids[k]);
      ok(r.ok && r.shells === 1 && r.bedArea > 0 === (k !== 'sphere'), k + ': a closed solid ready to print, standing on the ground' + (r.ok ? '' : ' — ' + r.problems.map((q) => q.kind)));
      if (want[k]) ok(close(r.volume, want[k], 1e-3), k + ': ' + r.volume.toFixed(1) + ' mm³ (' + want[k].toFixed(1) + ')');
      else ok(r.volume > 3500 && r.volume < 4189, 'sphere: ' + r.volume.toFixed(0) + ' mm³, a little under (4/3)π·10³ = 4189 (24 × 12 facets)');
      ok(close(r.size[0], 20, 1e-6) && close(r.size[1], 20, 1e-6) && close(r.size[2], 20, 1e-6) && close(r.min[1], -10, 1e-6) && close(r.min[0], x - 10, 1e-6), k + ': 20 mm across and high, centred where it was dropped');
    }
    // a hole through a box: the Beginner style's Group subtracts it
    const hole = drop('hole-cylinder', 0, 0, 0);
    let def = model.root;
    const MF = await SO.manifold(() => import(pathToFileURL(path.join(ROOTDIR, 'public_html/assets/vendor/manifold-3d/current/manifold.js')).href));
    ok(B.isHole(model, def.insts.get(hole)) && !B.isHole(model, def.insts.get(ids.box)), 'a dropped hole is a hole, a box is not');
    model.change('scale hole', () => { const i = def.insts.get(hole); i.m = [0.5, 0, 0, 0, 0, 0.5, 0, 0, 0, 0, 1.5, 0, 0, 0, -0.005, 1]; });
    const { solids, holes } = B.solidsAndHoles(model, def, [ids.box, hole]);
    ok(solids.length === 1 && holes.length === 1, 'the selection splits into one solid and one hole');
    const PS = await import(pathToFileURL(path.join(APP, 'print-solid.js')));
    const out = PS.booleanTris(MF, solids.map((i) => PS.placementTris(model, def, i)), holes.map((i) => PS.placementTris(model, def, i)), 'subtract');
    const iid = PS.replaceWithMesh(model, [], [...solids, ...holes], PS.meshFromTris(out), { label: 'group', name: 'Box' });
    const cut = vol(iid);
    const ring = 8000 - 0.5 * 32 * 25 * Math.sin(2 * Math.PI / 32) * 20;
    ok(cut.ok && close(cut.volume, ring, 1e-2), 'grouped: a 20 mm box with a 10 mm hole through it, ' + (cut.volume ?? 0).toFixed(1) + ' mm³ (' + ring.toFixed(1) + '), a closed mesh');
    ok(model.def(def.insts.get(iid).def).kind === 'mesh' && def.insts.size === 5, 'one mesh placement in place of the box and the hole');
    model.undo();
    def = model.root;   // undo puts back the definitions as they were (new objects)
    ok(def.insts.has(ids.box) && def.insts.has(hole), 'one undo brings the box and the hole back');
    // holes on and off
    model.change('solid', (m) => B.setHole(m, m.root, [hole], false));
    ok(!B.isHole(model, def.insts.get(hole)) && model.def(def.insts.get(hole).def).starter === 'beginner-cylinder', 'Make it solid: the hole cylinder is an orange cylinder');
    model.change('hole', (m) => B.setHole(m, m.root, [ids.cone], true));
    ok(B.isHole(model, def.insts.get(ids.cone)) && [...model.def(def.insts.get(ids.cone).def).faces.values()].every((f) => f.color === B.HOLE_COLOR), 'Make it a hole: the cone turns grey and is a hole');
    const j = JSON.parse(JSON.stringify(model.toJSON()));
    const back = new M.Model(); back.load(j);
    const coneBack = back.root.insts.get(ids.cone);
    ok(coneBack && B.isHole(back, coneBack), 'a hole stays a hole in the saved file');
    // align and drop
    def = model.root;
    model.change('lift', () => { def.insts.get(ids.sphere).m[14] = 0.013; def.insts.get(ids.roof).m[13] = 0.007; });
    const n = model.change('align', (m) => B.align(m, m.root, [ids.box, ids.sphere, ids.roof], 1, 'max'));
    const by = (iid) => B.placementBox(model, def, iid);
    ok(n === 2 && close(by(ids.box).max[1], by(ids.roof).max[1], 1e-12) && close(by(ids.sphere).max[1], by(ids.roof).max[1], 1e-12), 'Align back: the box and the sphere meet the roof\'s back side (' + n + ' moved)');
    model.change('align', (m) => B.align(m, m.root, [ids.box, ids.cylinder], 0, 'mid'));
    ok(close((by(ids.box).min[0] + by(ids.box).max[0]) / 2, (by(ids.cylinder).min[0] + by(ids.cylinder).max[0]) / 2, 1e-12), 'Align centre on red: their middles meet');
    ok(by(ids.sphere).min[2] > 0.012, 'the sphere floats 13 mm up');
    model.change('drop', (m) => B.dropToGround(m, m.root, [ids.sphere]));
    ok(close(by(ids.sphere).min[2], 0, 1e-12), 'Drop to the ground: it stands on z = 0 again');
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
