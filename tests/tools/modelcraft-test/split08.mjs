#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * split08.mjs — known answers for Split for printing (0.8 SU.929, session sx-split): print-split.js (grid for a bed, cuts,
 * connectors with clearance, numbers on both faces, the assembly sheet and the zip) and print-split-mc.js (the pieces
 * in the model, one undo step). Meshes in millimetres, Z up, as print3d.js reads them.
 *
 *   node tools/modelcraft-test/split08.mjs [--verbose]          on its own
 *   run({ok, close, section, APP})                              from bin/test-modelcraft.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { boxTris } from './print3d.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

/** A cylinder along Z, `seg` sides, wound outward. */
function cylTris(r, h, seg = 48, c = [0, 0, 0]) {
  const out = [], p = (i, z) => [c[0] + r * Math.cos(2 * Math.PI * i / seg), c[1] + r * Math.sin(2 * Math.PI * i / seg), c[2] + z];
  for (let i = 0; i < seg; i++) {
    const j = (i + 1) % seg;
    out.push({ p: [p(i, 0), p(j, 0), p(j, h)] }, { p: [p(i, 0), p(j, h), p(i, h)] });
    out.push({ p: [[c[0], c[1], c[2]], p(j, 0), p(i, 0)] }, { p: [[c[0], c[1], c[2] + h], p(i, h), p(j, h)] });
  }
  return out;
}

export async function run({ ok, close, section, APP }) {
  const I18N = await import(pathToFileURL(path.join(APP, 'i18n.js')));
  if (!I18N.t('sx.split.h').includes(' ')) I18N.init({ locale: 'en', strings: JSON.parse(fs.readFileSync(path.join(APP, 'lang/en.json'), 'utf8')) });
  const S = await import(pathToFileURL(path.join(APP, 'print-split.js')));
  const P = await import(pathToFileURL(path.join(APP, 'print3d.js')));
  const SO = await import(pathToFileURL(path.join(APP, 'solids.js')));
  const MF = await SO.manifold(() => import(pathToFileURL(path.resolve(APP, '../../../vendor/manifold-3d/current/manifold.js')).href));
  const kinds = (r) => r.pieces.map((p) => p.check.problems.map((q) => q.kind).join('/') || 'ok').join(' ');
  /** A piece's triangles as a manifold (mm), for overlap tests. */
  const man = (tris, dx = [0, 0, 0]) => {
    const key = new Map(), v = [], idx = [];
    const id = (p) => { const k = p.map((x) => Math.round(x * 1e5)).join(','); let i = key.get(k); if (i === undefined) { i = v.length / 3; key.set(k, i); v.push(p[0] + dx[0], p[1] + dx[1], p[2] + dx[2]); } return i; };
    for (const t of tris) { const a = id(t[0]), b = id(t[1]), c = id(t[2]); if (a !== b && b !== c && a !== c) idx.push(a, b, c); }
    const m = new MF.Mesh({ numProp: 3, vertProperties: new Float32Array(v), triVerts: new Uint32Array(idx) });
    m.merge();
    return new MF.Manifold(m);
  };
  const overlap = (a, b, dx) => { const A = man(a, dx), B = man(b), I = A.intersect(B), v = I.volume(); A.delete(); B.delete(); I.delete(); return v; };

  section('Split for printing: the grid that fits a bed (0.8 SU.929 step 1, print-split.js gridForBed)');
  {
    const g = S.gridForBed([300, 300, 300], [220, 220, 250], { extra: 6 });
    ok(g && g.pieces === 8 && g.counts.join() === '2,2,2' && g.cell.every((c) => close(c, 150)), 'a 300 mm cube on a 220 × 220 × 250 bed: 2 × 2 × 2 = 8 pieces of 150 mm');
    const one = S.gridForBed([300, 300, 300], [300, 300, 400], { extra: 6 });
    ok(one && one.pieces === 1, 'on a 300 × 300 × 400 bed it fits whole: 1 piece');
    const rod = S.gridForBed([500, 50, 50], [220, 220, 250], { extra: 6 });
    ok(rod && rod.pieces === 3 && rod.counts.join() === '3,1,1', 'a 500 mm rod: 250 + 6 mm of peg is over 250 even standing up, so 3 pieces, not 2: ' + rod?.counts);
    const flat = S.gridForBed([240, 100, 20], [220, 220, 250], { extra: 6 });
    ok(flat && flat.pieces === 1 && flat.perm.join() === '2,0,1', 'a 240 mm plank fits whole standing on its end (turned), not cut: perm ' + flat?.perm);
    ok(S.gridForBed([300, 300, 300], [0, 220, 250]) === null, 'no bed size, no grid');
    const pl = S.gridPlanes([0, 0, 0], [300, 300, 300], [2, 2, 2]);
    ok(pl.length === 3 && pl.every((p) => close(p.d, 150)) && pl.map((p) => p.axis).join() === '0,1,2', 'three planes at 150 mm, one per axis');
  }

  section('Split for printing: a 300 mm cube on a 220 mm bed (steps 1–3, splitForPrint)');
  const cubeTris = boxTris(0, 0, 0, 300, 300, 300);
  const t0 = Date.now();
  const r = await S.splitForPrint(MF, cubeTris, { bed: [220, 220, 250] });
  const ms = Date.now() - t0;
  {
    ok(r.ok && r.pieces.length === 8, '8 pieces, every one closed and passing the 3D-print check: ' + kinds(r) + ' (' + ms + ' ms, VPS)');
    ok(r.pieces.every((p) => p.check.shells === 1), 'each piece is one shell');
    ok(r.pieces.every((p) => p.fits), 'each piece fits the bed');
    ok(r.pieces.every((p) => p.size.every((s) => close(s, 150, 1e-3) || close(s, 156, 1e-3))), 'each piece is 150 mm a side, 156 where its pegs stand out 6 mm');
    ok(r.joints.length === 12 && r.joints.every((j) => j.connectors.length === 2 && j.connectors.every((c) => c.kind === 'peg')), '12 joints (the 12 inner faces), 2 pegs each');
    ok(r.joints.every((j) => j.labels.length === 1 && j.label === j.a + '-' + j.b && close(j.labels[0].h, 5)), 'every joint numbered "a-b" at 5 mm high');
    const p1 = r.pieces[0];
    ok(close(p1.lo[0], 0, 1e-3) && close(p1.lo[1], 0, 1e-3) && close(p1.lo[2], 0, 1e-3), 'piece 1 is the bottom front left one');
    // every peg at least wall + clearance + its radius from any outside, and the two of a joint 2 × that apart
    const lat = 2.5 + 0.2 + 2;
    let worst = Infinity, sep = Infinity;
    for (const j of r.joints) {
      for (const c of j.connectors) for (let k = 0; k < 3; k++) if (Math.abs(c.n[k]) < 0.5) worst = Math.min(worst, c.at[k] - 0, 300 - c.at[k], Math.abs(c.at[k] - 150));
      sep = Math.min(sep, Math.hypot(...[0, 1, 2].map((k) => j.connectors[0].at[k] - j.connectors[1].at[k])));
    }
    ok(worst >= lat + 6.2 - 1e-6, 'every peg ≥ ' + (lat + 6.2).toFixed(1) + ' mm (wall + clearance + radius + the hole depth) from the outside and the other cuts: ' + worst.toFixed(1));
    ok(sep >= 2 * lat, 'the two pegs of a joint are ' + sep.toFixed(1) + ' mm apart');
    // fit: the mating pieces never overlap; the peg moves 0.19 mm sideways in its hole freely and hits its side at 0.25
    const j12 = r.joints.find((j) => j.label === '1-2');
    const A = r.pieces[j12.a - 1], B = r.pieces[j12.b - 1];
    ok(j12 && overlap(A.tris, B.tris) < 1e-3, 'pieces 1 and 2 as cut: no overlap (' + overlap(A.tris, B.tris).toExponential(1) + ' mm³)');
    const side = [0, 1, 0];
    ok(overlap(A.tris, B.tris, side.map((x) => x * 0.19)) < 1e-3, 'piece 1 moved 0.19 mm along a cut face still clears piece 2: the 0.2 mm clearance holds all round');
    ok(overlap(A.tris, B.tris, side.map((x) => x * 0.25)) > 1e-3, 'moved 0.25 mm, its pegs hit the holes\' sides');
    ok(overlap(A.tris, B.tris, [-0.19, 0, 0]) < 1e-3, 'pulled 0.19 mm out of the joint it is free too');
    // the same number on both faces: the same engraved volume out of each side
    const plain = await S.splitForPrint(MF, cubeTris, { bed: [220, 220, 250], numbers: false });
    // per joint: what the number takes out of each mating piece, in a 14 mm box round the number (the pegs stay outside it)
    const near = (tris, at, n) => { const A = man(tris), bx = MF.Manifold.cube([14, 14, 14], true).translate(at), I = A.intersect(bx), v = I.volume(); A.delete(); bx.delete(); I.delete(); return v; };
    let same = 0, any = 0;
    const lost = [];
    for (const j of r.joints) {
      const at = j.labels[0].at;
      const ea = near(plain.pieces[j.a - 1].tris, at) - near(r.pieces[j.a - 1].tris, at), eb = near(plain.pieces[j.b - 1].tris, at) - near(r.pieces[j.b - 1].tris, at);
      if (ea > 1 && eb > 1) any++;
      if (close(ea, eb, 1e-3 * ea)) same++;
      lost.push(ea.toFixed(1) + '/' + eb.toFixed(1));
    }
    ok(any === 12 && same === 12, 'each joint\'s number is cut into both mating faces, the same amount on each (mm³ a/b): ' + lost.join(' '));
    const nn = await S.splitForPrint(MF, cubeTris, { bed: [220, 220, 250], numbers: false, connector: 'none' });
    ok(close(nn.pieces.reduce((s, p) => s + p.volume, 0), 27e6, 1e-3) && nn.pieces.every((p) => close(p.volume, 3.375e6, 1e-3)), 'with no connectors and no numbers the 8 volumes add up to the cube: 27 000 cm³');
    const oneAB = await S.splitForPrint(MF, boxTris(0, 0, 0, 100, 40, 20), { planes: [{ n: [1, 0, 0], d: 50 }], connector: 'none', numbers: true });
    const a = oneAB.pieces[0], b = oneAB.pieces[1];
    ok(close(50 * 40 * 20 - a.volume, 50 * 40 * 20 - b.volume, 1e-6), 'one cut, numbers only: the same engraved volume on both mating faces (' + (50 * 40 * 20 - a.volume).toFixed(2) + ' mm³ each)');
    ok(close(oneAB.joints[0].labels[0].at[0], 50, 1e-9), 'the number sits on the cut face');
    // reads the right way on each face: "1-2" seen from outside piece 1 (looking −X) runs along +Y, seen from outside piece 2
    // (looking +X) along −Y; the thin "1" is where the reading starts, so the engraving is lighter on that end of each face
    const L0 = oneAB.joints[0].labels[0].at, plain1 = await S.splitForPrint(MF, boxTris(0, 0, 0, 100, 40, 20), { planes: [{ n: [1, 0, 0], d: 50 }], connector: 'none', numbers: false });
    const half = (tris, side) => { const A = man(tris), bx = MF.Manifold.cube([4, 10, 12], true).translate([L0[0], L0[1] + side * 5, L0[2]]), I = A.intersect(bx), v = I.volume(); A.delete(); bx.delete(); I.delete(); return v; };
    const cut = (k, side) => half(plain1.pieces[k].tris, side) - half(oneAB.pieces[k].tris, side);
    ok(cut(0, -1) < cut(0, 1) && cut(1, 1) < cut(1, -1), 'the number reads the right way round on both faces (not mirrored): piece 1 ' + cut(0, -1).toFixed(1) + ' < ' + cut(0, 1).toFixed(1) + ', piece 2 ' + cut(1, 1).toFixed(1) + ' < ' + cut(1, -1).toFixed(1) + ' mm³');
  }

  section('Split for printing: connectors (step 2)');
  {
    const bar = boxTris(0, 0, 0, 100, 40, 20);
    for (const [conn, extra] of [['peg', 6], ['key', 6], ['dovetail', 4], ['dowel', 0], ['magnet', 0]]) {
      const s = await S.splitForPrint(MF, bar, { planes: [{ n: [1, 0, 0], d: 50 }], connector: conn });
      const j = s.joints[0];
      ok(s.ok && s.pieces.length === 2 && j.connectors.length >= 1 && j.connectors.every((c) => c.kind === conn), conn + ': a 100 × 40 × 20 bar cut in half, ' + j.connectors.length + ' ' + conn + '(s), both pieces pass: ' + kinds(s));
      ok(close(s.pieces[0].size[0], 50 + extra, 1e-3) && close(s.pieces[1].size[0], 50, 1e-3), conn + ': the piece below the cut is ' + (50 + extra) + ' mm long');
      ok(overlap(s.pieces[0].tris, s.pieces[1].tris) < 1e-3, conn + ': the two halves do not overlap');
      if (conn === 'dowel') ok(s.pins.length === j.connectors.length && s.pins.every((p) => p.check.ok && close(p.check.size[2] > 1 ? Math.max(...p.check.size) : 0, 19.8, 1e-3)), 'dowel: one printed pin per pair of holes, 19.8 mm long (20 − clearance), each closed');
    }
    const s2 = await S.splitForPrint(MF, bar, { planes: [{ n: [1, 0, 0], d: 50 }], connector: 'peg' });
    ok(s2.joints[0].connectors.length === 2 && Math.abs(s2.joints[0].connectors[0].at[1] - s2.joints[0].connectors[1].at[1]) > 9.4, 'two pegs spread along the 40 mm face (' + s2.joints[0].connectors.map((c) => c.at[1].toFixed(1)).join(', ') + ')');
    const dv = await S.splitForPrint(MF, bar, { planes: [{ n: [1, 0, 0], d: 50 }], connector: 'dovetail' });
    ok(dv.joints[0].connectors[0].open === 2 && Math.abs(dv.joints[0].connectors[0].dir[2]) > 0.99, 'a dovetail runs the short way across (20 mm, along Z), open at both ends, so piece 2 slides on');
    const vB = dv.pieces[1].volume, vA = dv.pieces[0].volume;
    ok(vA > 50 * 40 * 20 && vB < 50 * 40 * 20, 'the tongue adds to piece 1 what the slot takes from piece 2, plus the clearance');
    const grid = await S.splitForPrint(MF, cubeTris, { bed: [220, 220, 250], connector: 'dovetail' });
    ok(grid.ok && grid.joints.every((j) => j.connectors.length === 1 && j.connectors[0].open === 1) && grid.notes.includes('dovetail-directions'), 'on the cube\'s grid every dovetail is stopped (open on the outside end) and the result warns about sliding in two directions');
    // thin: no room for a connector or a number, said, still two good pieces
    const plate = await S.splitForPrint(MF, boxTris(0, 0, 0, 100, 40, 3), { planes: [{ n: [1, 0, 0], d: 50 }] });
    ok(plate.ok && plate.joints[0].connectors.length === 0 && plate.joints[0].notes.includes('small') && plate.joints[0].notes.includes('no-label'), 'a 3 mm plate: no peg fits (needs 9.4 mm), no number fits, both said; the halves still pass');
    // placed by hand
    const placed = await S.splitForPrint(MF, bar, { planes: [{ n: [1, 0, 0], d: 50 }], place: { '1-2': [[50, 20, 10], [50, 2, 10]] } });
    ok(placed.joints[0].connectors.length === 1 && close(placed.joints[0].connectors[0].at[1], 20, 0.6) && placed.joints[0].notes.includes('placed-misfit'), 'placed spots: the middle one is made, the one 2 mm from the edge is refused and said');
  }

  section('Split for printing: other shapes (step 1)');
  {
    const cyl = await S.splitForPrint(MF, cylTris(30, 80), { planes: [{ n: [1, 0, 1], d: 30 }] });
    ok(cyl.ok && cyl.pieces.length === 2 && cyl.joints.length === 1 && cyl.joints[0].connectors.length >= 1, 'a cylinder cut by a slanting plane: 2 good pieces, pegs square to the cut: ' + kinds(cyl));
    // an arch: two legs and a top; cutting below the top gives three pieces and two joints
    const arch = [...boxTris(0, 0, 0, 30, 30, 60), ...boxTris(70, 0, 0, 100, 30, 60), ...boxTris(0, 0, 60, 100, 30, 90)];
    const unioned = (await import(pathToFileURL(path.join(APP, 'print-solid.js')))).booleanTris(MF, [boxTris(0, 0, 0, 30, 30, 60).map((x) => x.p), boxTris(70, 0, 0, 100, 30, 60).map((x) => x.p), boxTris(0, 0, 59.999, 100, 30, 90).map((x) => x.p)], [], 'union');
    const ar = await S.splitForPrint(MF, unioned, { planes: [{ n: [0, 0, 1], d: 40 }] });
    ok(arch.length && ar.ok && ar.pieces.length === 3 && ar.joints.length === 2 && ar.joints.map((j) => j.label).sort().join() === '1-3,2-3', 'an arch cut through its legs: 3 pieces (two leg stubs, the rest), joints 1-3 and 2-3: ' + ar.joints.map((j) => j.label));
    const several = await S.splitForPrint(MF, boxTris(0, 0, 0, 200, 40, 30), { planes: [{ n: [1, 0, 0], d: 50 }, { n: [1, 0, 0], d: 100 }, { n: [1, 0, 0], d: 150 }] });
    ok(several.ok && several.pieces.length === 4 && several.joints.map((j) => j.label).join() === '1-2,2-3,3-4', 'three parallel cuts: 4 pieces in a row, joints 1-2, 2-3, 3-4');
  }

  section('Split for printing: on the bed, the assembly sheet and the zip (step 4)');
  {
    const o = S.orientForBed(P.weld(P.meshFromTriangles(boxTris(10, 10, 10, 240, 60, 30))), [220, 220, 250]);
    const c = P.printCheck(o.mesh);
    ok(o.fits && c.ok && close(c.min[2], 0, 1e-9) && close(c.size[2], 230, 1e-9) && close(c.volume, 230 * 50 * 20, 1e-6), 'a 230 mm long piece stands on its end to fit a 220 mm bed, turned (not mirrored: still closed and the right way out), on z = 0');
    const svg = S.assemblySheet(r);
    ok(svg.startsWith('<svg') && (svg.match(/<circle/g) || []).length === 8 && svg.includes('Piece 8:') && svg.includes('Pieces 1 and 2'), 'the assembly sheet: an SVG with the 8 numbered pieces and the list');
    const files = S.splitFiles(r, { name: 'Cube' });
    ok(files.length === 10 && files[0].name === 'Cube-01.stl' && files[7].name === 'Cube-08.stl' && files[8].name === 'assembly.svg' && files[9].name === 'assembly.txt', 'the zip: Cube-01.stl … Cube-08.stl, assembly.svg, assembly.txt');
    const stlN = new DataView(files[0].data.buffer, files[0].data.byteOffset).getUint32(80, true);
    ok(files[0].data.length === 84 + 50 * stlN && stlN === r.pieces[0].mesh.indices.length / 3, 'each STL holds its piece (' + stlN + ' triangles)');
    const zip = S.splitZip(r, { name: 'Cube', format: '3mf' });
    const ends = new DataView(zip.buffer, zip.byteOffset + zip.length - 22);
    ok(ends.getUint32(0, true) === 0x06054b50 && ends.getUint16(10, true) === 10, 'one stored zip of 10 files (3MF pieces this time)');
    const txt = String(files[9].data);
    ok(/Assembly: 8 pieces/.test(txt) && /Pieces 1 and 2 \(number 1-2 on both faces\): 2 pegs/.test(txt), 'assembly.txt lists the pieces and the joints in words');
    const dw = await S.splitForPrint(MF, boxTris(0, 0, 0, 100, 40, 20), { planes: [{ n: [1, 0, 0], d: 50 }], connector: 'dowel' });
    const df = S.splitFiles(dw, { name: 'Bar' });
    ok(df.filter((f) => /pin-\d+\.stl$/.test(f.name)).length === dw.pins.length && dw.pins.length === 2, 'dowels: the two pins are in the zip too');
  }

  section('Split for printing: into the model, one undo step (print-split-mc.js)');
  {
    const M = await import(pathToFileURL(path.join(APP, 'model.js')));
    const PM = await import(pathToFileURL(path.join(APP, 'print-split-mc.js')));
    const { printTriangles } = await import(pathToFileURL(path.join(APP, 'print-mc.js')));
    const B = await import(pathToFileURL(path.join(APP, 'beginner.js')));
    const model = new M.Model();
    const iid = model.change('box', (m) => { const d = B.buildShape(m, 'box', 'Box'); return m.place(m.root, d.id, [5, 0, 0, 0, 0, 2, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]); });   // 100 × 40 × 20 mm
    const { tris } = printTriangles(model, { sel: [{ t: 'i', id: iid }] });
    const s = await S.splitForPrint(MF, tris, { planes: [{ n: [1, 0, 0], d: 0 }] });
    const before = model.root.insts.size;
    const placed = PM.placePieces(model, [], [iid], s.pieces, { label: 'Split for printing', name: 'Box' });
    ok(placed.length === 2 && model.root.insts.size === before + 1 && !model.root.insts.has(iid), 'two pieces in place of the box');
    const back = placed.map((p) => P.printCheck(P.meshFromTriangles(printTriangles(model, { sel: [{ t: 'i', id: p.iid }] }).tris)));
    ok(back.every((c) => c.ok) && close(back[0].volume + back[1].volume, s.pieces[0].volume + s.pieces[1].volume, 1e-5 * 80000), 'each piece in the model is closed with the volume it was cut with (within the 1 µm grid): ' + back.map((c) => c.volume?.toFixed(2)) + ' vs ' + s.pieces.map((p) => p.volume.toFixed(2)));
    ok(placed.every((p) => p.solid), 'both are solid groups of faces (not meshes)');
    model.undo();
    ok(model.root.insts.has(iid) && model.root.insts.size === before, 'one undo brings the box back');
    // the showcase file (made once by make-split-showcase.mjs): its Column, 120 mm across and 360 mm tall, on a 220 mm bed
    const show = path.resolve(APP, '../../../../../fixtures/showcase/modelcraft-split.modelcraft');
    if (fs.existsSync(show)) {
      const sm = new M.Model(); sm.load(JSON.parse(fs.readFileSync(show, 'utf8')));
      const col = [...sm.root.insts].find(([, i]) => sm.def(i.def).name === 'Column')?.[0];
      const cr = await S.splitForPrint(MF, printTriangles(sm, { sel: [{ t: 'i', id: col }] }).tris, { bed: [220, 220, 250] });
      ok(cr.ok && cr.pieces.length === 2 && cr.counts.join() === '1,1,2' && cr.joints[0].connectors.length === 2 && cr.joints[0].labels.length === 1, 'showcase Column: 2 pieces (cut at 180 mm), 2 pegs and the number "1-2", both pass: ' + kinds(cr));
    } else ok(true, 'showcase file not made here (skipped)');
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
