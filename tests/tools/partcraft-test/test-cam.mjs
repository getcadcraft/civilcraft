#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-cam.mjs — PartCraft's CAM kernel (cam-offset.js, cam-tools.js, cam.js, cam-paths.js, cam-sim.js,
 * cam-post.js) against closed forms and independent readers:
 *   2D offsets (areas of offset rectangles / L-shapes / islands in closed form, every point at exactly d,
 *   a comb shape against a brute-force raster of {p : dist(p, walls) ≥ d}, necks that vanish), feeds and
 *   speeds (n = 1000·vc/πd), the stock simulation (a flat and a ball cut against the tool profile), a block
 *   with a rectangular and a round pocket built by OpenCascade (toolpath r from the walls exactly, floor
 *   cleared but for the 4·(1 − π/4)·r² corners), contour offset, flange drill points at the hole centres,
 *   the full flange program without gouges, a deliberate gouge found, G-code read back by our own parser
 *   (to 1e-6 of the quantised path, arcs included) and by gcode-toolpath (cncjs, MIT; test-only), posts
 *   differing only where they should, cycle time, study files and their refusals.
 *   node tools/partcraft-test/test-cam.mjs [--verbose] [--keep]   (or runCamTests() from bin/test-partcraft.mjs)
 */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '../..');
const DEV = path.join(REPO, 'public_html/assets/apps/partcraft/dev/');
const TMP = path.join(REPO, 'tmp/partcraft-cam');

export async function runCamTests({ ok, section, near, oc = null, skip = (m) => console.log('  skip ' + m), keep = false }) {
  const O = await import(DEV + 'cam-offset.js');
  const T = await import(DEV + 'cam-tools.js');
  const C = await import(DEV + 'cam.js');
  const CP = await import(DEV + 'cam-paths.js');
  const CS = await import(DEV + 'cam-sim.js');
  const PO = await import(DEV + 'cam-post.js');
  const B = await import(DEV + 'brep.js');
  const S = await import(DEV + 'sketch.js');
  const P = await import(DEV + 'part.js');
  const F = await import(path.join(HERE, 'fixtures.mjs'));
  if (!oc) {
    const { default: init } = await import(path.join(REPO, 'public_html/assets/vendor/replicad-opencascadejs/current/replicad_single.js'));
    oc = await init({ print: () => {}, printErr: () => {} });
  }
  fs.mkdirSync(TMP, { recursive: true });
  const rect = (x0, y0, x1, y1) => [O.line([x0, y0], [x1, y0]), O.line([x1, y0], [x1, y1]), O.line([x1, y1], [x0, y1]), O.line([x0, y1], [x0, y0])];
  const poly = (pts) => pts.map((p, i) => O.line(p, pts[(i + 1) % pts.length]));
  const areaOf = (ls) => ls.reduce((s, l) => s + O.loopArea(l), 0);
  // an independent point–segment distance (not cam-offset's)
  const segD = (p, a, b) => { const dx = b[0] - a[0], dy = b[1] - a[1]; const t = Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / (dx * dx + dy * dy))); return Math.hypot(p[0] - a[0] - t * dx, p[1] - a[1] - t * dy); };
  const pip = (p, pts) => { let c = false; for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) if ((pts[i][1] > p[1]) !== (pts[j][1] > p[1]) && p[0] < ((pts[j][0] - pts[i][0]) * (p[1] - pts[i][1])) / (pts[j][1] - pts[i][1]) + pts[i][0]) c = !c; return c; };
  const pointsOf = (ls, tol = 1e-3) => ls.flatMap((l) => l.flatMap((p) => O.samplePrim(p, tol)));

  // ===================================================================================
  section('CAM: 2D offsets (closed forms)');
  {
    const R = [rect(0, 0, 40, 20)];
    const a = O.offsetRegion(R, 3);
    ok(a.length === 1 && near(areaOf(a), 34 * 14, 1e-9), 'rectangle 40 × 20 shrunk by 3 → 34 × 14 exactly');
    ok(a[0].every((p) => p.k === 'L') && O.loopArea(a[0]) > 0, 'shrunk rectangle: four lines, counter-clockwise');
    const g = O.offsetRegion(R, -3);
    ok(g.length === 1 && near(areaOf(g), 800 + 120 * 3 + Math.PI * 9, 1e-9), 'grown by 3 → A + P·d + π·d² (rounded corners) exactly');
    ok(g[0].filter((p) => p.k === 'A').length === 4 && g[0].filter((p) => p.k === 'A').every((p) => near(p.r, 3, 1e-12)), 'grown corners are arcs of radius 3');
    ok(O.offsetRegion(R, 10).length === 0 && O.offsetRegion(R, 9.99).length === 1, 'shrinking by half the width leaves nothing; just under leaves a sliver');
    const Ls = [poly([[0, 0], [60, 0], [60, 20], [20, 20], [20, 60], [0, 60]])];
    const ls = O.offsetRegion(Ls, 4);
    ok(near(areaOf(ls), 52 * 12 + 12 * 52 - 12 * 12 + (16 - 4 * Math.PI), 1e-9), 'L-shape shrunk by 4: two 52 × 12 arms − their 12² overlap + the reflex corner square less a quarter disc (16 − 4π) exactly');
    const lsArc = ls[0].filter((p) => p.k === 'A');
    ok(lsArc.length === 1 && near(lsArc[0].r, 4, 1e-12) && near(lsArc[0].c[0], 20, 1e-12) && near(lsArc[0].c[1], 20, 1e-12), 'the reflex corner (20, 20) becomes one arc r 4 about it');
    const lg = O.offsetRegion(Ls, -4);
    ok(near(areaOf(lg), 2000 + 4 * 240 + 5 * (Math.PI * 16) / 4 - 16, 1e-9), 'L-shape grown by 4 = A + P·d + 5 quarter discs − the reflex overlap d² exactly');
    const isl = O.orientRegion([rect(0, 0, 100, 60), [O.circle([50, 30], 10)]]);
    ok(O.loopArea(isl[1]) < 0, 'orientRegion makes the island clockwise');
    const io = O.offsetRegion(isl, 3);
    ok(io.length === 2 && near(areaOf(io), 94 * 54 - Math.PI * 169, 1e-9), 'pocket with a round island, offset 3: 94 × 54 − π·13² exactly');
    ok(O.offsetRegion(isl, 22).length === 0, 'island grown into the walls: nothing left');
    const pts = pointsOf(io, 1e-4);
    ok(pts.every((q) => Math.abs(O.distToLoops(q, isl) - 3) < 1e-9), `every point of the offset is 3 from the walls (${pts.length} samples, 1e-9)`);
    // dumbbell: a narrow neck of width 6 vanishes at d > 3
    const db = [poly([[0, 0], [30, 0], [30, 12], [50, 12], [50, 0], [80, 0], [80, 30], [50, 30], [50, 18], [30, 18], [30, 30], [0, 30]])];
    ok(O.offsetRegion(db, 2.9).length === 1 && O.offsetRegion(db, 3.1).length === 2, 'a neck 6 wide: one loop at d 2.9, two lobes at 3.1');
    // comb: many self-intersections in the raw offset, checked against a brute-force raster
    const comb = [[0, 0], [70, 0], [70, 40]];
    for (let k = 6; k >= 0; k--) { const x = k * 10; comb.push([x + 7, 40], [x + 7, 12], [x + 3, 12], [x + 3, 40]); }
    comb.splice(comb.length - 2, 2);
    comb.push([0, 40]);
    const cb = O.orientRegion([poly(comb)]);
    for (const d of [1.5, 2.5, 4]) {
      const off = O.offsetRegion(cb, d);
      const h = 0.1;
      let cnt = 0;
      for (let x = h / 2; x < 70; x += h) for (let y = h / 2; y < 40; y += h) {
        if (!pip([x, y], comb)) continue;
        let m = Infinity;
        for (let i = 0; i < comb.length; i++) m = Math.min(m, segD([x, y], comb[i], comb[(i + 1) % comb.length]));
        if (m >= d) cnt++;
      }
      const ras = cnt * h * h, ex = areaOf(off);
      const perim = off.reduce((s, l) => s + O.loopLength(l), 0);
      ok(Math.abs(ras - ex) < perim * h, `comb offset ${d}: exact area ${ex.toFixed(2)} vs raster ${ras.toFixed(2)} (within perimeter × cell)`);
      ok(pointsOf(off, 1e-3).every((q) => Math.abs(O.distToLoops(q, cb) - d) < 1e-9), `comb offset ${d}: on the level set (1e-9), ${off.length} loop(s)`);
    }
    const c34 = O.offsetRegion([[O.circle([0, 0], 34)]], 3);
    ok(c34.length === 1 && c34[0].length === 1 && near(c34[0][0].r, 31, 1e-12), 'circle r 34 shrunk by 3 → one circle r 31');
    // helpers
    const sp = O.splitAtLengths(rect(0, 0, 40, 20), [10, 50, 70]);
    ok(sp.length === 4 && near(O.loopLength(sp[0]), 10) && near(O.loopLength(sp[1]), 40) && near(O.loopLength(sp[2]), 20) && near(O.loopLength(sp[3]), 50), 'splitAtLengths cuts a loop at given lengths');
    const la = O.limitArcs([O.circle([0, 0], 5)]);
    ok(la.length === 2 && la.every((p) => near(Math.abs(p.sw), Math.PI, 1e-12)) && near(la[1].e[0], la[0].s[0]), 'limitArcs: a full circle → two half circles');
    const sn = O.startNearest(rect(0, 0, 40, 20), [15, -5]);
    ok(near(sn.d, 5) && near(sn.loop[0].s[0], 15) && near(sn.loop[0].s[1], 0) && near(O.loopLength(sn.loop), 120), 'startNearest splits a side at the nearest point');
    ok(O.winding([[O.circle([0, 0], 5)]], [4.9, 0]) === 1 && O.winding([[O.circle([0, 0], 5)]], [5.1, 0]) === 0 && O.winding([[O.circle([0, 0], 5, false)]], [0, 4.99]) === -1, 'winding about arcs (ccw +1, cw −1, outside 0)');
  }

  // ===================================================================================
  section('CAM: tools, feeds and speeds');
  {
    const t = T.newTool('flat', { id: 'a1', d: 6, flutes: 3 });
    const s = T.speeds(t, 'aluminum', { maxRpm: 30000 });
    ok(Math.abs(s.rpm - (1000 * 200) / (Math.PI * 6)) <= 0.5, `n = 1000·vc/(π·d): ${s.rpm} rpm for vc 200, d 6`);
    ok(near(s.feed, Math.round(s.rpm * 3 * 0.03 * 10) / 10, 1e-9) && near(s.fz, 0.03, 1e-12), 'feed = n · z · fz (fz 0.005·d = 0.03)');
    const c = T.speeds(t, 'aluminum', { maxRpm: 8000 });
    ok(c.rpm === 8000 && c.clamped === 'max' && near(c.feed, Math.round(8000 * 3 * 0.03 * 10) / 10, 1e-9), 'clamped at the machine maximum, chip load kept');
    const d = T.speeds(T.newTool('drill', { id: 'd1', d: 10 }), 'steel', {});
    ok(near(d.feed, Math.round(d.rpm * 0.15 * 10) / 10, 1e-9) && near(d.plunge, d.feed), 'drill feed = n · f (f = 0.015·d per rev in steel)');
    const o = T.speeds(T.newTool('flat', { id: 'o1', d: 6, rpm: 10000, feed: 1234 }), 'aluminum', {});
    ok(o.rpm === 10000 && o.feed === 1234, 'per-tool rpm and feed overrides win');
    ok(near(T.profile(T.newTool('ball', { id: 'b', d: 6 })).h(3), 3) && near(T.profile(T.newTool('ball', { id: 'b', d: 6 })).h(0), 0) && T.profile(T.newTool('ball', { id: 'b', d: 6 })).h(3.01) === Infinity, 'ball profile: 0 at the tip, R at the rim, ∞ beyond');
    ok(near(T.profile(T.newTool('drill', { id: 'q', d: 10 })).tip, 5 / Math.tan((59 * Math.PI) / 180), 1e-12), 'drill tip length = R / tan(59°) for 118°');
    ok(near(T.profile(T.newTool('bull', { id: 'q', d: 10, cornerR: 2 })).h(5), 2) && T.profile(T.newTool('bull', { id: 'q', d: 10, cornerR: 2 })).h(3) === 0, 'bull nose profile: flat to R − rc, rc at the rim');
    ok(near(T.profile(T.newTool('chamfer', { id: 'q', d: 12, angle: 90, tipD: 2 })).h(6), 5), 'chamfer 90°: height = ρ − tip radius');
    const bad = (fn) => { try { T.readTool(fn(JSON.parse(JSON.stringify(t)))); return false; } catch (e) { return /^Tool:/.test(e.message); } };
    ok(T.readTool(JSON.parse(JSON.stringify(t))).d === 6, 'a tool reads back');
    ok(bad((j) => { j.d = -1; return j; }) && bad((j) => { j.kind = 'laser'; return j; }) && bad((j) => { j.number = 1.5; return j; }) && bad((j) => { j.id = '<x>'; return j; }) && bad((j) => { j.vc = 'fast'; return j; }), 'bad tools refused (diameter, kind, number, id, override)');
  }

  // ===================================================================================
  section('CAM: stock simulation against the tool profile');
  {
    // a fake model: no part, a 40 × 40 × 10 stock
    const model = { stock: { kind: 'box', min: [0, 0, -10], max: [40, 40, 0] }, box: { min: [0, 0, -10], max: [40, 40, 0] }, heightAt: () => -Infinity };
    const sim = new CS.Sim(model, { cell: 0.1 });
    const tool = T.newTool('flat', { id: 'f', d: 6 });
    sim.run({ op: { id: 'x' }, tool, moves: [{ k: 'rapid', p: [5, 20, 5] }, { k: 'feed', p: [5, 20, -2], f: 100 }, { k: 'feed', p: [35, 20, -2], f: 100 }] });
    let okW = true;
    for (let j = 0; j < sim.ny; j++) { const y = sim.y0 + (j + 0.5) * sim.cell; const z = sim.at(20, y); const exp = Math.abs(y - 20) <= 3 ? -2 : 0; if (Math.abs(z - exp) > 1e-12) okW = false; }
    ok(okW, 'flat Ø6 slot 2 deep: cells within 3 of the track at −2, the rest untouched');
    const sim2 = new CS.Sim(model, { cell: 0.1 });
    const ball = T.newTool('ball', { id: 'b', d: 6 });
    sim2.run({ op: { id: 'y' }, tool: ball, moves: [{ k: 'rapid', p: [5, 20, 5] }, { k: 'feed', p: [5, 20, -2], f: 100 }, { k: 'feed', p: [35, 20, -2], f: 100 }] });
    let worst = 0;
    for (let j = 0; j < sim2.ny; j++) { const y = sim2.y0 + (j + 0.5) * sim2.cell; const rho = Math.abs(y - 20); if (rho > 3) continue; const exp = Math.min(0, -2 + 3 - Math.sqrt(9 - rho * rho)); worst = Math.max(worst, Math.abs(sim2.at(20, y) - exp)); }
    ok(worst < 1e-12, `ball Ø6 slot: the floor follows −2 + R − √(R² − ρ²) (worst ${worst.toExponential(1)})`);
    const removed = sim2.log[0].removed;
    // cross-section area of the ball groove 2 deep (circle segment), times 30 + the two half-ends (spherical caps)
    const seg = 9 * Math.acos(1 / 3) - 1 * Math.sqrt(8);
    const cap = (Math.PI * 4 * (9 - 2)) / 3;
    ok(Math.abs(removed - (seg * 30 + cap)) / (seg * 30 + cap) < 0.01, `ball groove volume ${removed.toFixed(1)} vs segment·30 + cap ${(seg * 30 + cap).toFixed(1)} mm³ (1 %)`);
    const tm = CS.cycleTime({ paths: [{ op: { id: 'q' }, tool, moves: [{ k: 'rapid', p: [0, 0, 0] }, { k: 'feed', p: [100, 0, 0], f: 500 }, { k: 'rapid', p: [100, 50, 0] }] }] }, { machine: { rapid: 5000, toolChange: 10 } });
    ok(near(tm.seconds, 12 + 0.6, 1e-9) && near(tm.feed, 12) && near(tm.rapid, 0.6), 'cycle time: 100 mm at 500 mm/min + 50 mm rapid at 5000 = 12.6 s');
  }

  // ===================================================================================
  section('CAM: block with pockets (OpenCascade)');
  const part = P.newPart('Block');
  const s1 = S.newSketch(); S.addRect(s1, [0, 0], [100, 60]);
  const f1 = P.addFeature(part, 'sketch', { plane: { kind: 'base', name: 'top' }, sketch: s1 });
  const e1 = P.addFeature(part, 'extrude', { sketch: f1.id, op: 'add', end: 'blind', depth: 20 });
  const s2 = S.newSketch(); S.addRect(s2, [30, 18], [70, 42]); S.addCircle(s2, [15, 30], 8);
  const f2 = P.addFeature(part, 'sketch', { plane: { kind: 'face', feature: e1.id, face: 'end' }, sketch: s2 });
  P.addFeature(part, 'extrude', { sketch: f2.id, op: 'cut', end: 'blind', depth: 8 });
  const rg = B.regenerateBrep(part, oc);
  ok(near(rg.stats.volume, 120000 - 40 * 24 * 8 - Math.PI * 64 * 8, 1e-6), 'block 100 × 60 × 20 with a 40 × 24 and a Ø16 pocket, 8 deep: exact volume');
  const study = C.newStudy();
  study.setup.stock = { ...study.setup.stock, side: 2, top: 1, bottom: 0 };
  const model = C.machineModel(rg, study.setup);
  ok(near(model.stock.max[2], 0) && near(model.stock.min[0], 0) && near(model.box.min[0], 2) && near(model.top, -1) && near(model.bottom, -21), 'work frame: stock top front-left = origin; model top −1, bottom −21');
  const floors = rg.faces.map((f, i) => [f, i]).filter(([f]) => model.isFloor(model.faces[rg.faces.indexOf(f)]) && Math.abs(model.faces[rg.faces.indexOf(f)].o[2] + 9) < 1e-6);
  const rectFace = floors.find(([f, i]) => model.faceLoops(i).loops[0].length === 4)[0];
  const circFace = floors.find(([f, i]) => model.faceLoops(i).loops[0].length === 1)[0];
  {
    const L = model.faceLoops(rg.faces.indexOf(rectFace)).loops[0];
    const xs = L.map((p) => p.s[0]), ys = L.map((p) => p.s[1]);
    ok(near(Math.min(...xs), 32, 1e-9) && near(Math.max(...xs), 72, 1e-9) && near(Math.min(...ys), 20, 1e-9) && near(Math.max(...ys), 44, 1e-9), 'pocket floor loop: exact corners (32, 20)–(72, 44) snapped from the edge table');
    const c = model.faceLoops(rg.faces.indexOf(circFace)).loops[0][0];
    ok(c.k === 'A' && near(c.r, 8, 1e-9) && near(c.c[0], 17, 1e-9) && near(c.c[1], 32, 1e-9) && near(Math.abs(c.sw), 2 * Math.PI), 'round pocket floor: one exact circle r 8 about (17, 32)');
  }
  const em = study.tools.find((t) => t.id === 'em6');
  const r = em.d / 2;
  const wallsRect = rect(32, 20, 72, 44);
  study.ops = [
    C.newOp('pocket', { id: 'pr', tool: 'em6', geo: { faces: [B.faceRef(rectFace)] }, params: { stepdown: 3, stepover: 0.45 } }),
    C.newOp('pocket', { id: 'pc', tool: 'em6', geo: { faces: [B.faceRef(circFace)] }, params: { stepdown: 4, entry: 'helix' } }),
    C.newOp('contour', { id: 'co', tool: 'em6', geo: { faces: [B.faceRef(rg.faces.find((f) => f.type === 'plane' && f.n[1] > 0.9 && Math.abs(f.o[1] - 20) < 1e-6))] }, params: { stepdown: 7, tabs: 4, tabHeight: 2, tabWidth: 5 } }),
  ];
  const sim = new CS.Sim(model, { cell: 0.1 });
  const prog = CP.generateProgram(study, rg, { sim, model });
  ok(prog.paths.every((p) => !p.error), 'block program builds: ' + prog.paths.map((p) => p.error || p.op.id + ' ' + p.moves.length + ' moves').join(', '));
  {
    const segs = CP.segments([prog.paths[0]]).filter((s) => s.k !== 'rapid' && Math.min(s.a[2], s.b[2]) < -1 + 1e-9);
    const pts = segs.flatMap((s) => CP.segPoints(s, 1e-4));
    const inside = pts.every((q) => q[0] >= 32 + r - 1e-9 && q[0] <= 72 - r + 1e-9 && q[1] >= 20 + r - 1e-9 && q[1] <= 44 - r + 1e-9);
    const md = Math.min(...pts.map((q) => O.distToLoops([q[0], q[1]], [wallsRect])));
    ok(inside && Math.abs(md - r) < 1e-9, `rectangular pocket: every cutting point at least r from the walls, the wall pass at exactly r (min ${md.toFixed(12)})`);
    const zs = [...new Set(segs.map((s) => +s.b[2].toFixed(9)))].sort((a, b) => a - b);
    ok(near(zs[0], -9, 1e-9) && segs.every((s) => s.b[2] >= -9 - 1e-9), 'pocket floor depth −9 (face height), never deeper');
    // floor cleared: every cell inside the pocket is at the floor except the corners a round tool cannot reach
    let wrong = 0, left = 0;
    const c = sim.cell;
    for (let j = 0; j < sim.ny; j++) for (let i = 0; i < sim.nx; i++) {
      const [x, y] = sim.centre(i, j);
      if (x < 32 + c || x > 72 - c || y < 20 + c || y > 44 - c) continue;
      const cx = x < 52 ? 32 + r : 72 - r, cy = y < 32 ? 20 + r : 44 - r;
      const inCornerSq = Math.abs(x - cx) <= r && Math.abs(y - cy) <= r && (x < 32 + r || x > 72 - r) && (y < 20 + r || y > 44 - r);
      const outsideDisc = Math.hypot(x - cx, y - cy) > r;
      const z = sim.at(x, y);
      const cut = Math.abs(z + 9) < 1e-9;
      if (!cut) left++;
      const band = Math.abs(Math.hypot(x - cx, y - cy) - r) < c;
      if (!band && cut === (inCornerSq && outsideDisc)) wrong++;
    }
    const exp = 4 * (1 - Math.PI / 4) * r * r;
    ok(wrong === 0, `pocket floor: every cell cut to −9 except the four corner remnants (mismatches ${wrong})`);
    ok(Math.abs(left * c * c - exp) < 4 * (Math.PI / 2) * r * c * 1.5 + 0.2, `uncut corner area ${(left * c * c).toFixed(2)} ≈ 4·(1 − π/4)·r² = ${exp.toFixed(2)} mm²`);
  }
  {
    const segs = CP.segments([prog.paths[1]]).filter((s) => s.k !== 'rapid' && Math.min(s.a[2], s.b[2]) < -1 + 1e-9);
    const pts = segs.flatMap((s) => CP.segPoints(s, 1e-4));
    const rad = pts.map((q) => Math.hypot(q[0] - 17, q[1] - 32));
    ok(Math.max(...rad) <= 8 - r + 1e-9 && Math.abs(Math.max(...rad) - (8 - r)) < 1e-9, `round pocket: the path reaches radius 8 − r = ${8 - r} exactly, never beyond`);
    ok(segs.some((s) => s.k === 'arc' && Math.abs(s.b[2] - s.a[2]) > 1e-6), 'round pocket enters by a helix (arcs that descend)');
    let unc = 0;
    for (let j = 0; j < sim.ny; j++) for (let i = 0; i < sim.nx; i++) { const [x, y] = sim.centre(i, j); if (Math.hypot(x - 17, y - 32) < 8 - sim.cell && Math.abs(sim.at(x, y) + 9) > 1e-9) unc++; }
    ok(unc === 0, 'round pocket floor: every cell inside r 8 cut to −9');
  }
  {
    const segs = CP.segments([prog.paths[2]]).filter((s) => s.k !== 'rapid');
    const outline = rect(2, 2, 102, 62);
    const main = segs.filter((s) => s.k === 'feed' && Math.abs(s.a[2] - s.b[2]) < 1e-12 && (Math.abs(s.a[0] - s.b[0]) < 1e-12 || Math.abs(s.a[1] - s.b[1]) < 1e-12) && O.distToLoops([s.a[0], s.a[1]], [outline]) < r + 1e-6);
    const dm = main.flatMap((s) => [s.a, s.b]).map((q) => O.distToLoops([q[0], q[1]], [outline]));
    ok(main.length > 0 && dm.every((d) => Math.abs(d - r) < 1e-9), `contour: straight cuts exactly r = ${r} outside the outline (${main.length} segments, 1e-9)`);
    const all = segs.flatMap((s) => CP.segPoints(s, 1e-4));
    ok(all.every((q) => O.distToLoops([q[0], q[1]], [outline]) >= r - 1e-9 && !O.inside([outline], [q[0], q[1]])), 'contour: lead arcs and corners never closer than r');
    const tabTop = -21 - 1 + 2;
    const tabs = segs.filter((s) => Math.abs(s.a[2] - tabTop) < 1e-9 && Math.abs(s.b[2] - tabTop) < 1e-9 && s.k !== 'rapid');
    const len = tabs.reduce((t, s) => t + CP.segLength(s), 0);
    ok(tabs.length > 0 && Math.abs(len - 4 * (5 + 6)) < 1e-6, `4 tabs 2 high: ${len.toFixed(3)} mm of path held at the tab top = 4·(5 + Ø6)`);
    const climb = prog.paths[2].moves.find((m) => m.k === 'arc' && [[2, 2], [102, 2], [102, 62], [2, 62]].some((c) => O.dist(c, m.c) < 1e-9));
    ok(!!climb && climb.sw < 0, 'outside contour climbs (clockwise round the part with M3)');
  }
  const rep = sim.report();
  ok(rep.gouges === 0, `block program: no gouges (cell 0.1, tol ${rep.tolV} / ${rep.tolLat.toFixed(3)})`);
  {
    const st2 = JSON.parse(JSON.stringify(study));
    st2.ops = [C.newOp('pocket', { id: 'pg', tool: 'em6', geo: { faces: [B.faceRef(rectFace)] }, params: { stepdown: 5, bottom: -10 } })];
    const sm = new CS.Sim(C.machineModel(rg, st2.setup), { cell: 0.25 });
    const pg = CP.generateProgram(st2, rg, { sim: sm });
    const g = pg.paths[0].sim;
    ok(g.gouges > 1000 && g.at.every((a) => Math.abs(a[2] - 1) < 0.03), `a pocket taken 1 mm below its floor: ${g.gouges} gouge cells found, each ≈ 1 mm deep`);
  }

  // known answers for path length and depth (LC.15 item 3)
  {
    const topFace = rg.faces.find((f) => f.type === 'plane' && f.n[1] > 0.9 && Math.abs(f.o[1] - 20) < 1e-6);
    const st3 = JSON.parse(JSON.stringify(study));
    st3.ops = [
      C.newOp('contour', { id: 'k1', tool: 'em6', geo: { faces: [B.faceRef(topFace)] }, params: { stepdown: 50, lead: 0, tabs: 0 } }),
      C.newOp('pocket', { id: 'k2', tool: 'em6', geo: { faces: [B.faceRef(rectFace)] }, params: { stepdown: 9, stepover: 0.5, entry: 'plunge' } }),
    ];
    const pg3 = CP.generateProgram(st3, rg, { sim: new CS.Sim(model, { cell: 0.25 }), model });
    const horizLen = (ph) => CP.segments([ph]).filter((g) => g.k !== 'rapid' && Math.hypot(g.b[0] - g.a[0], g.b[1] - g.a[1]) > 1e-9).reduce((a, g) => a + CP.segLength(g), 0);
    const zmin = (ph) => Math.min(...CP.segments([ph]).filter((g) => g.k !== 'rapid').flatMap((g) => [g.a[2], g.b[2]]));
    ok(pg3.paths.every((p) => !p.error), 'known-answer programs build: ' + pg3.paths.map((p) => p.error || p.op.id).join(', '));
    const per = 2 * (100 + 60) + 2 * Math.PI * 3;
    ok(Math.abs(horizLen(pg3.paths[0]) - per) < 1e-6, `contour round the 100 × 60 outline, one depth, no lead-in: the cut is the rounded rectangle exactly, 2·(100 + 60) + 2π·3 = ${per.toFixed(4)} mm (got ${horizLen(pg3.paths[0]).toFixed(4)})`);
    ok(near(zmin(pg3.paths[0]), -21 - 1, 1e-9), 'contour depth: the model bottom −21 less the 1 mm breakthrough');
    const lh = horizLen(pg3.paths[1]);
    ok(pg3.paths[1].info.loops === 3 && lh >= 240 - 1e-6 && lh <= 240 + 12, `pocket 40 × 24, tool Ø6, stepover 3: three loops of 34 × 18, 28 × 12 and 22 × 6 = 104 + 80 + 56 = 240 mm, plus the short links (cut ${lh.toFixed(2)} mm)`);
    ok(near(zmin(pg3.paths[1]), -9, 1e-9), 'pocket depth: the floor, −9');
    ok(pg3.paths.every((p) => p.sim.gouges === 0), 'both known-answer programs cut without a gouge in the stock simulation');
    // chamfer: a 90° chamfer mill, 0.5 wide, tip 0.5 above the cone's point → cuts 0.5 down at the edge, the path is the outline grown by the tip offset
    const st4 = JSON.parse(JSON.stringify(study));
    st4.ops = [C.newOp('chamfer', { id: 'k3', tool: 'ch90', geo: { faces: [B.faceRef(topFace)] }, params: { width: 0.5, tipOffset: 0.5, holes: false } })];
    const sim4 = new CS.Sim(model, { cell: 0.1 });
    const pg4 = CP.generateProgram(st4, rg, { sim: sim4, model });
    const ch = pg4.paths[0];
    ok(!ch.error, 'chamfer builds' + (ch.error ? ': ' + ch.error : ''));
    const per4 = 2 * (100 + 60) + 2 * Math.PI * 0.5;
    ok(Math.abs(horizLen(ch) - per4) < 1e-6 && near(zmin(ch), -1 - 0.5 - 0.5, 1e-9) && near(ch.info.depth, 0.5, 1e-12), `chamfer: the path is the outline grown by 0.5 (2·(100 + 60) + 2π·0.5 = ${per4.toFixed(4)} mm), at the model top − depth 0.5 − tip offset 0.5 = −2`);
    // the cut profile across the straight edge at y = 2: z = −1.5 + (y − 2), 45°, from 0.5 below the top at the edge to the top 0.5 in
    let dz = 0;
    for (const y of [2.05, 2.15, 2.3, 2.45]) dz = Math.max(dz, Math.abs(sim4.at(52, y) - (-1.5 + (y - 2))));
    ok(dz < 0.08, `the simulated cut across the straight edge follows the 45° chamfer: −1.5 at the edge rising to −1 half a millimetre in (worst error ${dz.toFixed(3)} mm, cell 0.1)`);
  }

  // ===================================================================================
  section('CAM: flange (face, pocket, drill, contour, bore)');
  const fl = F.flange();
  const rf = B.regenerateBrep(fl.part, oc);
  const fs2 = C.newStudy();
  const fr = (name) => B.faceRef(rf.faces.find((f) => f.name === name));
  const longEm = T.newTool('flat', { id: 'em10', number: 8, d: 10, flutes: 3, fluteLen: 90 });
  fs2.tools.push(longEm);
  fs2.ops = [
    C.newOp('face', { id: 'fa', tool: 'fm50' }),
    C.newOp('pocket', { id: 'po', tool: 'em10', geo: { faces: [fr('f2.side:l17')] }, params: { stepdown: 10, stepover: 0.5 } }),
    C.newOp('drill', { id: 'dr', tool: 'dr14', geo: { faces: rf.faces.filter((f) => /wall/.test(f.name)).map((f) => B.faceRef(f)) } }),
    C.newOp('contour', { id: 'ct', tool: 'em10', geo: { faces: [fr('f2.side:l13')] }, params: { stepdown: 10 } }),
    C.newOp('pocket', { id: 'bo', tool: 'em10', geo: { faces: [fr('f2.side:l29')] }, params: { stepdown: 10 } }),
  ];
  const fm = C.machineModel(rf, fs2.setup);
  const fsim = new CS.Sim(fm, { cell: 0.4 });
  const t0 = Date.now();
  const fprog = CP.generateProgram(fs2, rf, { sim: fsim, model: fm });
  const ms = Date.now() - t0;
  ok(fprog.paths.every((p) => !p.error), `flange program builds in ${ms} ms: ` + fprog.paths.map((p) => p.op.id + ' ' + p.moves.length).join(', '));
  const frep = fsim.report();
  ok(frep.gouges === 0 && fprog.paths.every((p) => p.sim.gouges === 0 && p.sim.rapidCuts === 0), `flange: no gouges and no rapid into stock (Z-map ${frep.nx} × ${frep.ny})`);
  ok(near(fprog.paths[0].sim.removed, 204 * 204 * 1, 1e-6), 'facing removes the 1 mm top offset over the whole stock (204² mm³)');
  {
    const cyc = fprog.paths[2].moves.find((m) => m.k === 'cycle');
    const ctr = [102, 102];
    const want = Array.from({ length: 8 }, (_, k) => [ctr[0] + 75 * Math.cos((k * Math.PI) / 4), ctr[1] + 75 * Math.sin((k * Math.PI) / 4)]);
    const match = cyc.holes.every((h) => want.some((w) => O.dist(w, h.at) < 1e-9)) && cyc.holes.length === 8;
    ok(match, 'drill: 8 points at the bolt-hole centres (r 75 about the axis, 1e-9)');
    const tip = 7 / Math.tan((59 * Math.PI) / 180);
    ok(cyc.holes.every((h) => near(h.z, -81 - 1 - tip, 1e-9) && near(h.top, -51, 1e-9)), 'through holes: drilled to the bottom − 1 breakthrough − the 118° tip (full diameter through)');
    ok(cyc.holes.every((h) => near(h.r, -51 + 2, 1e-6)) && cyc.kind === 'peck', 'R plane 2 above the disc top (the pocket cleared the stock there), G83 pecks');
    {
      let prev = null, feedZ = 0;
      for (const e of CP.expandCycle(cyc)) { if (e.k === 'feed' && prev) feedZ += Math.abs(e.p[2] - prev[2]); prev = e.p; }
      // each hole: the depth below the R plane, plus the 0.254 mm back-off every later peck re-enters through
      const want = cyc.holes.reduce((a, h) => a + (h.r - h.z) + CP.PECK_BACKOFF * (Math.ceil((h.r - h.z) / h.q - 1e-9) - 1), 0);
      ok(near(feedZ, want, 1e-9), `drill: the feed travel of the 8 peck cycles = Σ [depth + 0.254 × (pecks − 1)] = ${want.toFixed(3)} mm`);
    }
    let through = 0;
    for (const h of cyc.holes) if (fsim.at(h.at[0], h.at[1]) < -81) through++;
    ok(through === 8, 'the simulated stock is drilled through at every hole');
    ok(fsim.at(102 + 60, 102) <= -51 + 1e-9 && fsim.at(102 + 60, 102) > -51 - 0.02, 'pocket around the hub: the disc top left at −51 (its face height)');
    ok(fsim.at(102, 102) < -81, 'bore pocketed through');
    ok(fsim.at(102 + 46, 102) > -51 + 1, 'the hub (Ø104 at the disc) is left standing');
  }
  const ct = CS.cycleTime(fprog, fs2.setup);
  ok(ct.toolChanges === 3 && ct.seconds > 0 && near(ct.seconds, ct.feed + ct.rapid + 3 * fs2.setup.machine.toolChange, 1e-6), `cycle time ${(ct.seconds / 60).toFixed(1)} min (feeds + rapids at ${fs2.setup.machine.rapid} mm/min + 3 tool changes)`);

  // ===================================================================================
  section('CAM: posts read back');
  const parse = (text) => parseGcode(text);
  const segsQ = (paths) => CP.segments(paths).map((s) => ({ ...s, a: s.a.map(qz), b: s.b.map(qz) })).filter((s) => s.k === 'arc' || Math.hypot(s.b[0] - s.a[0], s.b[1] - s.a[1], s.b[2] - s.a[2]) > 1e-9);
  const progs = [['block', prog], ['flange', fprog]];
  const texts = {};
  for (const [nm, pg] of progs) {
    const want = segsQ(pg.paths);
    for (const kind of ['fanuc', 'grbl', 'linuxcnc']) {
      const out = PO.post(pg, { post: kind, name: nm });
      texts[nm + '.' + kind] = out.text;
      if (keep) fs.writeFileSync(path.join(TMP, `${nm}.${kind}.${out.ext}`), out.text);
      const got = parse(out.text);
      let bad = got.err || null, i = 0;
      // the post goes up to the clearance height and then across: one extra rapid allowed before each internal rapid
      for (const w of want) {
        let g = got.moves[i];
        while (g && w.k === 'rapid' && g.k === 'rapid' && !samePt(g.b, w.b) && got.moves[i + 1] && got.moves[i + 1].k === 'rapid' && samePt(got.moves[i + 1].b, w.b)) g = got.moves[++i];
        if (!g) { bad = bad || `ran out at segment ${i}`; break; }
        if (g.k !== w.k || !samePt(g.b, w.b) || !samePt(g.a, w.a)) { bad = bad || `segment ${i}: ${g.k} ${g.b} vs ${w.k} ${w.b}`; break; }
        if (w.k === 'arc') {
          const cw = [qz(w.a[0]) + qz(w.c[0] - qz(w.a[0])), qz(w.a[1]) + qz(w.c[1] - qz(w.a[1]))];
          if (Math.abs(g.c[0] - cw[0]) > 1e-6 || Math.abs(g.c[1] - cw[1]) > 1e-6 || Math.abs(g.c[0] - w.c[0]) > 1e-3 || Math.sign(g.sw) !== Math.sign(w.sw) || Math.abs(g.sw - w.sw) > 1e-3) { bad = bad || `arc ${i}: centre ${g.c} vs ${w.c}, sweep ${g.sw} vs ${w.sw}`; break; }
        }
        if (w.k !== 'rapid' && Math.abs(g.f - Math.round(w.f * 1000) / 1000) > 1e-6) { bad = bad || `feed ${i}: ${g.f} vs ${w.f}`; break; }
        i++;
      }
      if (!bad && i !== got.moves.length) bad = `${got.moves.length - i} extra moves`;
      ok(!bad, `${nm} ${kind}: our parser re-runs the G-code onto the internal path (${want.length} segments, 1e-6, arcs incl.)` + (bad ? ' — ' + bad : ''));
    }
    const maxQ = Math.max(...CP.segments(pg.paths).map((s) => Math.max(...s.b.map((v) => Math.abs(v - qz(v))))));
    ok(maxQ <= 5e-4 + 1e-12, `${nm}: 3-decimal output moves no point more than 0.5 µm per axis`);
  }
  {
    const norm = (t, grbl) => t.split('\n').map((l) => l.replace(/^N\d+ /, '').replace(/(\d)\.(?=\D|$)/g, '$1').replace(/ G43 Z(\S+) H\d+/, ' Z$1')).filter((l) => /^(G[0-3]\b|G8[0-3]|G73|G9[89]|X|Y|Z)/.test(l) && !/^G(17|21|90|94)/.test(l));
    const a = norm(texts['flange.fanuc']), b = norm(texts['flange.linuxcnc']);
    ok(a.length > 100 && a.join('\n') === b.join('\n'), `fanuc and linuxcnc motion lines identical (${a.length} lines, canned cycles incl.)`);
    const g = norm(texts['block.grbl']), f = norm(texts['block.fanuc']);
    ok(g.join('\n') === f.join('\n'), `grbl and fanuc motion identical for a program without drilling (${g.length} lines)`);
    const tf = texts['flange.fanuc'], tg = texts['flange.grbl'], tl = texts['flange.linuxcnc'];
    ok(/^%\nO1001 \(FLANGE\)/.test(tf) && /\nN\d+ T5 M6\n/.test(tf) && /G0 G43 Z-?[\d.]+ H5/.test(tf) && /G83 X/.test(tf) && /G80/.test(tf) && /M30\n%\n$/.test(tf) && /X102\.|X102\.\s|Y102\./.test(tf), 'fanuc: % + O number, N numbers, T M6 + G43 H, G83 … G80, decimal points, M30');
    ok(!/^%|^N\d|M6|G43|G8[0-3]|G73|G28/m.test(tg) && /\nM0\n/.test(tg) && /\(Tool change: T5 D14 drill/.test(tg) && /M30\n$/.test(tg), 'grbl: no %, N, M6, G43, canned cycles or G28; M0 pause at tool changes; M30');
    ok(/^%\n/.test(tl) && /G53 G0 Z0/.test(tl) && /T5 M6/.test(tl) && /G83 X/.test(tl) && /M2\n%\n$/.test(tl) && !/^N\d/m.test(tl), 'linuxcnc: % wrapper, G53 G0 Z0, T M6, G83, M2');
    ok([tf, tg, tl].every((t) => /\(Generated by PartCraft, lab build - verify before running\)/.test(t) && /G54/.test(t) && /G21/.test(t) && /G90/.test(t) && /\(Stock: box 204 x 204 x 81 mm\)/.test(t) && /M8/.test(t) && /S\d+ M3/.test(t) && /^[\x0a\x20-\x7e]*$/.test(t)), 'every post: header comments, G54 G21 G90, M3 S, coolant, ASCII only');
  }
  // the post files (cam-postdef.js): the three built-ins as text = the code above, byte for byte, on these two real programs too
  await (await import('./test-cam-post.mjs')).runCamPostTests({ ok, section, near, extra: [{ program: prog, name: 'block', label: 'the block program' }, { program: fprog, name: 'flange', label: 'the flange program, canned cycles' }] });
  // 3D finishing (cam-finish.js): synthetic plane and dome meshes, closed forms and a brute-force oracle
  await (await import('./test-cam-finish.mjs')).runCamFinishTests({ ok, section, near });
  // tool libraries and the stock-versus-model colour
  await (await import('./test-cam-library.mjs')).runCamLibraryTests({ ok, section, near });
  // second reader: gcode-toolpath (cncjs) on the GRBL text
  {
    const require = createRequire(path.join(HERE, 'package.json'));
    let Toolpath = null;
    try { Toolpath = require('gcode-toolpath'); Toolpath = Toolpath.default || Toolpath; } catch { /* missing */ }
    if (!Toolpath) skip('gcode-toolpath not installed (cd tools/partcraft-test && npm install)');
    else for (const nm of ['block', 'flange']) {
      const segs = [];
      const tp = new Toolpath({
        addLine: (modal, v1, v2) => segs.push({ k: modal.motion === 'G0' ? 'rapid' : 'feed', a: [v1.x, v1.y, v1.z], b: [v2.x, v2.y, v2.z] }),
        addArcCurve: (modal, v1, v2, v0) => segs.push({ k: 'arc', cw: modal.motion === 'G2', a: [v1.x, v1.y, v1.z], b: [v2.x, v2.y, v2.z], c: [v0.x, v0.y] }),
      });
      tp.loadFromStringSync(texts[nm + '.grbl']);
      const want = segsQ((nm === 'block' ? prog : fprog).paths);
      const got = segs.filter((s) => s.k === 'arc' || Math.hypot(s.b[0] - s.a[0], s.b[1] - s.a[1], s.b[2] - s.a[2]) > 1e-9);
      // gcode-toolpath starts at 0,0,0: drop its moves until it reaches the first internal point
      let k = got.findIndex((s) => samePt(s.b, want[0].a));
      let bad = k < 0 ? 'start not found' : null;
      const rest = k >= 0 ? got.slice(k + 1) : [];
      let i = 0;
      for (const w of want) {
        if (bad) break;
        let g = rest[i];
        while (g && w.k === 'rapid' && !samePt(g.b, w.b) && rest[i + 1] && samePt(rest[i + 1].b, w.b)) g = rest[++i];
        if (!g || g.k !== w.k || !samePt(g.b, w.b)) { bad = `segment ${i}`; break; }
        if (w.k === 'arc' && (Math.abs(g.c[0] - w.c[0]) > 1e-3 || Math.abs(g.c[1] - w.c[1]) > 1e-3 || g.cw !== w.sw < 0)) { bad = `arc ${i}`; break; }
        i++;
      }
      ok(!bad, `${nm}: gcode-toolpath (cncjs) reads the GRBL file onto the same ${want.length} segments` + (bad ? ' — ' + bad : ''));
    }
  }
  {
    const csv = PO.toolpathCsv(fprog).trim().split('\n');
    ok(csv[0].startsWith('op,kind,x0') && csv.length - 1 === CP.segments(fprog.paths).length, `toolpath CSV: one row per segment (${csv.length - 1})`);
    const js = JSON.parse(PO.toolpathJson(fprog));
    ok(js.format === 'partcraft-toolpath' && js.ops.length === 5 && js.ops[2].moves.some((m) => m.k === 'cycle'), 'toolpath JSON: every operation, cycles kept');
  }

  // ===================================================================================
  section('CAM: study files');
  {
    const j = JSON.parse(JSON.stringify(fs2));
    const back = C.readStudy(j);
    ok(back.ops.length === 5 && back.tools.length === fs2.tools.length && back.ops[1].params.stepover === 0.5 && back.ops[2].geo.faces.length === 8, 'a study reads back (5 operations, 8 hole refs, params kept)');
    const again = CP.generateProgram(back, rf, { model: fm });
    ok(again.paths.every((p, i) => p.moves.length === fprog.paths[i].moves.length), 'the read-back study makes the same toolpaths');
    const tamper = (fn, re = /^Manufacture study|^Tool:|newer PartCraft/) => { const x = JSON.parse(JSON.stringify(fs2)); fn(x); try { C.readStudy(x); return false; } catch (e) { return re.test(e.message); } };
    ok(tamper((x) => { x.version = 2; }, /newer PartCraft/), 'a newer study version is refused, saying so');
    ok(tamper((x) => { x.ops[0].type = 'laser'; }), 'unknown operation type refused');
    ok(tamper((x) => { x.ops[1].params.stepover = 0.9; }), 'pocket stepover over 50 % refused (coverage needs ≤ r)');
    ok(tamper((x) => { x.ops[1].tool = 'nope'; }), 'an operation with a tool not in the library refused');
    ok(tamper((x) => { x.ops[2].geo.faces[0].name = 'x; drop'; }), 'a bad face reference refused');
    ok(tamper((x) => { x.setup.axis = 'up'; }) && tamper((x) => { x.setup.machine.rapid = -5; }) && tamper((x) => { x.setup.stock.side = 'lots'; }), 'bad setup refused (axis, rapid rate, stock offset)');
    ok(tamper((x) => { x.ops[1].id = x.ops[0].id; }) && tamper((x) => { x.tools[1].id = x.tools[0].id; }), 'repeated operation or tool ids refused');
    ok(tamper((x) => { x.ops[3].params.side = 'sideways'; }) && tamper((x) => { x.ops[3].params.tabs = 2.5; }), 'bad choices refused (contour side, fractional tabs)');
    const up = JSON.parse(JSON.stringify(fs2)); up.setup.axis = '-z';
    const m2 = C.machineModel(rf, C.readSetup(up.setup));
    ok(near(m2.box.max[2] - m2.box.min[2], 200, 1e-9) && near(m2.box.max[0] - m2.box.min[0], 200, 1e-9) && near(m2.box.max[1] - m2.box.min[1], 80, 1e-9), 'tool axis −Z: the flange lies on its side (200 × 80 × 200 high in Z → 200 deep)');
    const cy = JSON.parse(JSON.stringify(fs2.setup)); cy.stock.kind = 'cylinder';
    const m3 = C.machineModel(rf, C.readSetup(cy));
    ok(m3.stock.kind === 'cylinder' && near(m3.stock.r, Math.hypot(200, 200) / 2 + 2, 1e-9), 'cylinder stock round the model');
  }
}

const qz = (v) => { const r = Math.round(v * 1000) / 1000; return Object.is(r, -0) ? 0 : r; };
const samePt = (a, b) => Math.abs(a[0] - b[0]) < 1e-6 && Math.abs(a[1] - b[1]) < 1e-6 && Math.abs(a[2] - b[2]) < 1e-6;

/**
 * A tiny G-code reader (this test's own): modal G0/G1/G2/G3 (I J incremental, XY), G81/G83/G73 with
 * G98/G99/G80 (LinuxCNC's documented cycle motions, back-off 0.254 mm), G43 H Z as a rapid, G28/G53 lines
 * ignored (machine coordinates). → {moves: [{k, a, b, c?, sw?, f}], err}
 */
export function parseGcode(text) {
  const pos = [null, null, null];
  let motion = null, f = null, cyc = null, ret = 'G98', init = null;
  const moves = [];
  const known = () => pos.every((v) => v !== null);
  const go = (k, to, extra = {}) => {
    const a = pos.slice();
    const had = known();
    pos[0] = to[0] ?? pos[0]; pos[1] = to[1] ?? pos[1]; pos[2] = to[2] ?? pos[2];
    if (had && known()) { const b = pos.slice(); if (k === 'arc' || Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]) > 1e-12) moves.push({ k, a, b, f: k === 'rapid' ? undefined : f, ...extra }); }
  };
  const hole = (x, y) => {
    go('rapid', [x, y, null]);
    const R = cyc.R, Z = cyc.Z;
    go('rapid', [null, null, R]);
    if (cyc.code === 'G81') go('feed', [null, null, Z]);
    else {
      let cur = R;
      while (cur > Z + 1e-9) {
        const next = Math.max(Z, cur - cyc.Q);
        if (cyc.code === 'G83' && cur < R) go('rapid', [null, null, cur + 0.254]);
        go('feed', [null, null, next]);
        if (next > Z + 1e-9) go('rapid', [null, null, cyc.code === 'G83' ? R : next + 0.254]);
        cur = next;
      }
    }
    go('rapid', [null, null, ret === 'G99' ? R : init]);
  };
  for (const raw of text.split('\n')) {
    const l = raw.replace(/\([^)]*\)/g, '').replace(/;.*$/, '').trim().toUpperCase();
    if (!l || l === '%' || /^O\d+/.test(l)) continue;
    const words = [...l.replace(/^N\d+\s*/, '').matchAll(/([A-Z])\s*([-+]?(\d+\.?\d*|\.\d+))/g)].map((m) => [m[1], parseFloat(m[2])]);
    const gs = words.filter((w) => w[0] === 'G').map((w) => w[1]);
    const val = (k) => { const w = words.find((x) => x[0] === k); return w ? w[1] : null; };
    if (gs.includes(28) || gs.includes(53)) { pos[2] = null; continue; }
    if (val('F') !== null) f = val('F');
    if (gs.includes(98)) ret = 'G98';
    if (gs.includes(99)) ret = 'G99';
    if (gs.includes(80)) { cyc = null; motion = null; }
    const X = val('X'), Y = val('Y'), Z = val('Z');
    const cc = gs.find((g) => g === 81 || g === 83 || g === 73);
    if (cc !== undefined) { init = pos[2]; cyc = { code: 'G' + cc, R: val('R'), Z, Q: val('Q') }; hole(X ?? pos[0], Y ?? pos[1]); continue; }
    if (cyc && (X !== null || Y !== null) && !gs.some((g) => g <= 3)) {
      if (Z !== null) cyc.Z = Z; if (val('R') !== null) cyc.R = val('R'); if (val('Q') !== null) cyc.Q = val('Q');
      hole(X ?? pos[0], Y ?? pos[1]); continue;
    }
    const mg = gs.filter((g) => g === 0 || g === 1 || g === 2 || g === 3).pop();
    if (mg !== undefined) motion = mg;
    if (gs.includes(43)) { if (Z !== null) go('rapid', [null, null, Z]); continue; }
    if (X === null && Y === null && Z === null) continue;
    if (motion === 0) go('rapid', [X, Y, Z]);
    else if (motion === 1) go('feed', [X, Y, Z]);
    else if (motion === 2 || motion === 3) {
      const s = pos.slice(), c = [s[0] + (val('I') ?? 0), s[1] + (val('J') ?? 0)];
      const e = [X ?? s[0], Y ?? s[1]];
      const a0 = Math.atan2(s[1] - c[1], s[0] - c[0]), a1 = Math.atan2(e[1] - c[1], e[0] - c[0]);
      const m = (v) => ((v % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
      let sw = motion === 3 ? m(a1 - a0) : -m(a0 - a1);
      if (Math.abs(sw) < 1e-9) sw = motion === 3 ? 2 * Math.PI : -2 * Math.PI;
      go('arc', [X, Y, Z], { c, sw });
    } else return { moves, err: 'motion before a motion mode: ' + raw };
  }
  return { moves, err: null };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const VERBOSE = process.argv.includes('--verbose');
  let pass = 0, fail = 0;
  const ok = (c, m) => { if (c) { pass++; if (VERBOSE) console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };
  const section = (t) => console.log('\n== ' + t);
  const near = (a, b, tol = 1e-9) => Math.abs(a - b) <= tol;
  await runCamTests({ ok, section, near, keep: process.argv.includes('--keep') });
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}
