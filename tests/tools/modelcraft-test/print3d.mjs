/* SPDX-License-Identifier: Apache-2.0 */
/**
 * print3d.mjs — known answers for print3d.js (0.5 SG.4: is it ready for a 3D printer; STL and 3MF), shared by
 * bin/test-modelcraft.mjs and bin/test-partcraft.mjs (each passes its own build folder: the copy must behave the same).
 *   run({ok, close, section, APP, OUT, ROOT})
 * Meshes are built by hand (mm, Z up): a closed cube, the cube with a face missing, one face turned over, the whole
 * cube inside out, a hollow cube (an inner cube turned inward), two separate cubes that overlap, a closed shell that
 * passes through itself, a cube floating on its corner (no base, all overhang), a shape with a 60° overhang.
 * The STL and 3MF are read back by trimesh (tools/modelcraft-test/venv, + networkx for 3MF) when the venv is there.
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

// a box as 12 triangles wound outward (inward = turned over)
export function boxTris(x0, y0, z0, x1, y1, z1, { inward = false, color } = {}) {
  const v = [[x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0], [x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]];
  const quads = [[0, 3, 2, 1], [4, 5, 6, 7], [0, 1, 5, 4], [1, 2, 6, 5], [2, 3, 7, 6], [3, 0, 4, 7]];
  const out = [];
  for (const q of quads) for (const t of [[q[0], q[1], q[2]], [q[0], q[2], q[3]]]) {
    const p = t.map((i) => v[i]);
    out.push({ p: inward ? [p[0], p[2], p[1]] : p, color });
  }
  return out;
}

export async function run({ ok, close, section, APP, OUT, ROOT }) {
  section('3D printing: print3d.js (0.5 SG.4) — ' + path.basename(path.dirname(APP)) + '/' + path.basename(APP));
  const X = await import(path.join(APP, 'print3d.js'));
  const check = (tris, opts) => X.printCheck(X.meshFromTriangles(tris), opts);
  const kinds = (r) => r.problems.map((p) => p.kind).join(',');
  const warns = (r) => r.warnings.map((w) => w.kind);

  const cube = check(boxTris(0, 0, 0, 20, 20, 20));
  ok(cube.ok && cube.shells === 1 && cube.triangles === 12 && cube.vertices === 8, 'a 20 mm cube is ready: 1 shell, 12 triangles, 8 corners — ' + kinds(cube));
  ok(close(cube.volume, 8000, 1e-6) && close(cube.area, 2400, 1e-6), 'its volume 8000 mm³ and area 2400 mm²: ' + cube.volume);
  ok(close(cube.bedArea, 400, 1e-9) && cube.overhangArea === 0 && !warns(cube).length, 'it stands on a 400 mm² base, no overhang, no warning');

  const open = check(boxTris(0, 0, 0, 20, 20, 20).slice(2));
  ok(!open.ok && open.open === 4 && kinds(open) === 'open' && open.problems[0].at.length === 4, 'a missing face = 4 open edges, with where they are');
  ok(open.volume === null, 'no volume for a mesh that is not closed');

  const one = boxTris(0, 0, 0, 20, 20, 20);
  one[4] = { p: [one[4].p[0], one[4].p[2], one[4].p[1]] };
  const flipped = check(one);
  ok(!flipped.ok && flipped.flipped === 3 && kinds(flipped) === 'flipped', 'one triangle turned over: its 3 edges face the wrong way — ' + flipped.flipped);

  const inside = check(boxTris(0, 0, 0, 20, 20, 20, { inward: true }));
  ok(!inside.ok && inside.inverted === 1 && kinds(inside) === 'inverted', 'the whole cube inside out is caught');

  const hollow = check([...boxTris(0, 0, 0, 30, 30, 30), ...boxTris(10, 10, 10, 20, 20, 20, { inward: true })]);
  ok(hollow.ok && hollow.shells === 2 && close(hollow.volume, 27000 - 1000, 1e-6), 'a hollow cube (inner cube turned inward) is right: 26000 mm³ — ' + kinds(hollow));
  const floatingCavity = check([...boxTris(0, 0, 0, 30, 30, 30), ...boxTris(40, 0, 0, 50, 10, 10, { inward: true })]);
  ok(floatingCavity.inverted === 1, 'an inward cube that is not inside anything is inside out');

  const two = check([...boxTris(0, 0, 0, 20, 20, 20), ...boxTris(10, 10, 10, 30, 30, 30)]);
  ok(two.ok && two.overlaps > 0 && warns(two).includes('overlap') && two.selfIntersections === 0, 'two overlapping cubes: printable, with an overlap warning (' + two.overlaps + ' crossings)');
  const apart = check([...boxTris(0, 0, 0, 10, 10, 10), ...boxTris(20, 0, 0, 30, 10, 10)]);
  ok(apart.ok && apart.shells === 2 && apart.overlaps === 0 && close(apart.volume, 2000, 1e-9), 'two cubes apart: 2 shells, no warning, 2000 mm³');
  const touching = check([...boxTris(0, 0, 0, 10, 10, 10), ...boxTris(10, 0, 0, 20, 10, 10)]);
  ok(touching.ok && touching.touching === 4 && warns(touching).includes('touch') && touching.nonManifold === 0 && close(touching.volume, 2000, 1e-9), 'two cubes face to face: printable, 4 edges where they touch (a warning), 2000 mm³');

  // a closed shell through itself: a cube whose top corner is pulled down through the bottom
  const fold = boxTris(0, 0, 0, 20, 20, 20).map((t) => ({ p: t.p.map((p) => (p[0] === 20 && p[1] === 20 && p[2] === 20 ? [15, 15, -10] : p)) }));
  const folded = check(fold);
  ok(!folded.ok && folded.selfIntersections > 0 && kinds(folded).includes('selfintersect'), 'a shell that passes through itself is caught: ' + folded.selfIntersections);

  // on its corner: no base; the lower half of the surface overhangs
  const R = (p) => { const a = Math.PI / 4, b = Math.atan(1 / Math.SQRT2); let [x, y, z] = p; [x, y] = [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)]; [y, z] = [y * Math.cos(b) - z * Math.sin(b), y * Math.sin(b) + z * Math.cos(b)]; return [x, y, z]; };
  const corner = check(boxTris(-10, -10, -10, 10, 10, 10).map((t) => ({ p: t.p.map(R) })));
  ok(corner.ok && warns(corner).includes('nobase') && warns(corner).includes('overhang'), 'a cube on its corner: no flat base, needs support — ' + warns(corner));
  ok(close(corner.volume, 8000, 1e-6), 'turning keeps the volume: ' + corner.volume);

  // a 60° slope from vertical overhangs; a 30° one does not (45° default)
  const wedge = (deg) => {
    const h = 10, d = h * Math.tan(deg * Math.PI / 180);   // the top sticks out by d
    const v = [[0, 0, 0], [10, 0, 0], [10, 10, 0], [0, 10, 0], [0, 0, h], [10 + d, 0, h], [10 + d, 10, h], [0, 10, h]];
    const quads = [[0, 3, 2, 1], [4, 5, 6, 7], [0, 1, 5, 4], [1, 2, 6, 5], [2, 3, 7, 6], [3, 0, 4, 7]];
    return quads.flatMap((q) => [[q[0], q[1], q[2]], [q[0], q[2], q[3]]].map((t) => ({ p: t.map((i) => v[i]) })));
  };
  const w60 = check(wedge(60)), w30 = check(wedge(30));
  ok(w60.ok && close(w60.overhangArea, 10 * 10 / Math.cos(60 * Math.PI / 180), 1e-6) && warns(w60).includes('overhang'), 'a 60° overhang needs support: ' + w60.overhangArea.toFixed(3) + ' mm²');
  ok(w30.ok && w30.overhangArea === 0 && !warns(w30).includes('overhang'), 'a 30° one prints without');

  ok(warns(check(boxTris(0, 0, 0, 0.5, 0.5, 0.5))).includes('tiny'), 'a half-millimeter cube: check the units');
  ok(warns(check(boxTris(0, 0, 0, 300, 100, 50), { bed: [220, 220, 250] })).includes('bed'), 'larger than a 220 × 220 bed');
  ok(!warns(check(boxTris(0, 0, 0, 100, 210, 50), { bed: [220, 200, 250] })).includes('bed'), 'fits once turned 90° on the bed');
  const deg = check([...boxTris(0, 0, 0, 10, 10, 10), { p: [[0, 0, 0], [5, 0, 0], [10, 0, 0]] }]);
  ok(deg.ok && deg.degenerate === 1 && warns(deg).includes('degenerate'), 'a zero-area triangle is left out and counted');
  const empty = check([]);
  ok(!empty.ok && kinds(empty) === 'empty', 'nothing to print');
  // corners a hair apart (0.00001 mm) are the same corner
  const nudged = boxTris(0, 0, 0, 20, 20, 20).map((t, i) => ({ p: t.p.map((p) => (i % 2 ? p.map((c) => c + 1e-5) : p)) }));
  ok(check(nudged).ok, 'corners 0.00001 mm apart weld into one');
  ok(X.triTri([0, 0, 0], [10, 0, 0], [0, 10, 0], [2, 2, -1], [2, 2, 1], [8, 8, 0]) && !X.triTri([0, 0, 0], [10, 0, 0], [0, 10, 0], [20, 2, -1], [20, 2, 1], [28, 8, 0]), 'triangle–triangle crossing test');

  // files
  const colored = X.weld(X.meshFromTriangles([...boxTris(0, 0, 0, 20, 20, 20, { color: '#ff0000' }), ...boxTris(30, 0, 0, 40, 10, 10, { color: '#0000ff' })]));
  const stl = X.stlBinary(colored, 'test');
  const dv = new DataView(stl.buffer);
  ok(stl.length === 84 + 24 * 50 && dv.getUint32(80, true) === 24, 'STL: 24 triangles, 84 + 24 × 50 bytes');
  const mf = X.threeMF(colored, { name: 'Two <cubes> & co', app: 'test' });
  const txt = new TextDecoder().decode(mf);
  ok(txt.includes('3D/3dmodel.model') && txt.includes('unit="millimeter"') && txt.includes('displaycolor="#FF0000FF"') && txt.includes('Two &lt;cubes&gt; &amp; co'), '3MF: model part, millimeters, colors, escaped name');
  const py = path.join(ROOT, 'tools/modelcraft-test/venv/bin/python');
  if (!fs.existsSync(py)) { console.log('  (skipped: trimesh venv missing)'); return; }
  fs.mkdirSync(OUT, { recursive: true });
  const f1 = path.join(OUT, 'print3d-test.stl'), f2 = path.join(OUT, 'print3d-test.3mf');
  fs.writeFileSync(f1, stl); fs.writeFileSync(f2, mf);
  const read = (f) => { try { return JSON.parse(execFileSync(py, [path.join(ROOT, 'tools/modelcraft-test/print_check.py'), f], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] })); } catch (err) { return { error: String(err.stderr || err.message).slice(-300) }; } };
  const a = read(f1), b = read(f2);
  ok(!a.error && a.triangles === 24 && a.watertight && a.winding && close(a.volume, 9000, 1e-3), 'trimesh reads the STL: 24 triangles, watertight, 9000 mm³ — ' + JSON.stringify(a.error || a.volume));
  ok(!b.error && b.zip_ok && b.namespace_ok && b.unit === 'millimeter' && b.triangles === 24 && b.watertight && close(b.volume, 9000, 1e-3), 'trimesh reads the 3MF: zip, core namespace, mm, 24 triangles, watertight, 9000 mm³ — ' + JSON.stringify(b.error || b.volume));
  ok(!b.error && JSON.stringify(b.colors) === JSON.stringify(['#FF0000FF', '#0000FFFF']), '3MF colors: ' + JSON.stringify(b.colors));
}
