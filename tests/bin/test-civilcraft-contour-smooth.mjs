#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-civilcraft-contour-smooth.mjs — CivilCraft 0.9.1 (/suggest #1500): contour smoothing (contour-smooth.js), index contours
 * and their layers in the export, and breaklines as hard edges of the triangulation. DOM-free, in Node.
 *   - survey points that already exist in the repo (tools/civilcraft-test/site-topo.csv, 276 points) as a triangulation and
 *     as a gridded surface: after light and strong smoothing no contour crosses another or itself, every smoothed point's
 *     surface elevation is within 10 % / 25 % of the interval of its contour, no point is farther from the unsmoothed line
 *     than 1/6 / 1/3 of that line's longest piece, the corners on triangle edges have not moved, and the lines really are
 *     smoother (less turning per vertex)
 *   - 'none' returns exactly what tin.js traces (existing drawings do not change)
 *   - a geometric breakline case (two planes meeting on a line, clearly synthetic): the breakline is a chain of triangle
 *     edges, no triangle straddles it, contours kink exactly on it, and smoothing leaves that kink sharp
 *   - the project: the setting is saved only when on; DXF and DWG carry minor and index contours on their own layers at
 *     their elevations, smoothed when smoothing is on; index contours are labelled
 *   node bin/test-civilcraft-contour-smooth.mjs [--build dev|x.y] [--verbose]
 */
import fs from 'node:fs';
import path from 'node:path';
import { registerHooks } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const arg = (k) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null; };
const BUILD = arg('--build') || 'dev';
const VERBOSE = process.argv.includes('--verbose');
const APP = path.join(REPO, 'public_html/assets/apps/civilcraft', BUILD);
const manifest = JSON.parse(fs.readFileSync(path.join(APP, 'manifest.json'), 'utf8'));
registerHooks({
  resolve(spec, ctx, next) {
    const m = manifest.imports?.[spec];
    if (m) return { url: pathToFileURL(path.join(REPO, 'public_html', m)).href, shortCircuit: true };
    return next(spec, ctx);
  },
});
const mod = (f) => import(pathToFileURL(path.join(APP, f)).href);
const I18N = await mod('i18n.js');
I18N.init({ strings: JSON.parse(fs.readFileSync(path.join(APP, 'lang/en.json'), 'utf8')) });
const TIN = await mod('tin.js');
const CS = await mod('contour-smooth.js');
const GS = await mod('ground-surface.js');
const G = await mod('gridding.js');
const PJ = await mod('project.js');
const PTS = await mod('points.js');
const SC = await mod('scene.js');
const DXF = await mod('dxf.js');
const DWGW = await mod('dwg-write.js');
const DWGR = await mod('dwg/read.js');

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; if (VERBOSE) console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };
const section = (s) => console.log('\n== ' + s);

const fx = PTS.parsePoints(fs.readFileSync(path.join(REPO, 'tools/civilcraft-test/site-topo.csv'), 'utf8')).points;

// distance from a point to a polyline
const distTo = (p, pts) => {
  let best = Infinity;
  for (let i = 0; i + 1 < pts.length; i++) {
    const a = pts[i], b = pts[i + 1], dx = b.x - a.x, dy = b.y - a.y, l2 = dx * dx + dy * dy;
    const t = l2 ? Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / l2)) : 0;
    best = Math.min(best, Math.hypot(p.x - a.x - t * dx, p.y - a.y - t * dy));
  }
  return best;
};
// mean turning (radians) per interior vertex, pieces shorter than `tiny` skipped
const turning = (lines) => {
  let sum = 0, n = 0, worst = 0;
  for (const l of lines) for (let i = 1; i + 1 < l.pts.length; i++) {
    const a = l.pts[i - 1], b = l.pts[i], c = l.pts[i + 1], ux = b.x - a.x, uy = b.y - a.y, vx = c.x - b.x, vy = c.y - b.y;
    if (Math.hypot(ux, uy) < 1e-6 || Math.hypot(vx, vy) < 1e-6) continue;
    const t = Math.abs(Math.atan2(ux * vy - uy * vx, ux * vx + uy * vy)); sum += t; n++; worst = Math.max(worst, t);
  }
  return { mean: sum / n, worst, n };
};
const crossings = (lines) => GS.checkContours(lines.map((l) => ({ z: l.z, pts: l.pts, closed: false })), { maxIssues: 1e6 }).filter((i) => i.code === 'crossing' || i.code === 'samelevel');

/** Every guarantee, for one surface and one interval. */
function guarantees(name, surface, interval) {
  const raw = surface.contours(interval);
  ok(raw.length > 5, `${name}: ${raw.length} contour lines at ${interval}`);
  const none = CS.smoothContours(surface, interval, { level: 'none' });
  ok(JSON.stringify(none) === JSON.stringify(raw), `${name}: "none" is exactly the traced lines`);
  ok(JSON.stringify(CS.smoothContours(surface, interval, { level: 'toString' })) === JSON.stringify(raw) && JSON.stringify(CS.smoothContours(surface, interval, {})) === JSON.stringify(raw), `${name}: an unknown level or no level is "none"`);
  ok(crossings(raw).length === 0, `${name}: the traced lines do not cross (the check itself)`);
  const turnRaw = turning(raw);
  for (const level of ['light', 'strong']) {
    const L = CS.LEVELS[level];
    const sm = CS.smoothContours(surface, interval, { level });
    ok(sm.length === raw.length && sm.every((l, i) => l.z === raw[i].z && l.closed === raw[i].closed), `${name} ${level}: same lines, elevations and closed flags`);
    const x = crossings(sm);
    ok(x.length === 0, `${name} ${level}: no smoothed contour crosses another or itself (${x.length} found${x[0] ? `, first at ${x[0].x.toFixed(2)}, ${x[0].y.toFixed(2)}` : ''})`);
    // the corners on triangle edges are still there, in order
    let kept = true, worstBand = 0, off = 0, worstDev = 0, devOk = true, added = 0;
    sm.forEach((l, i) => {
      let k = 0;
      for (const p of l.pts) if (k < raw[i].pts.length && p.x === raw[i].pts[k].x && p.y === raw[i].pts[k].y) k++;
      if (k !== raw[i].pts.length) kept = false;
      added += l.pts.length - raw[i].pts.length;
      let longest = 0;
      for (let j = 0; j + 1 < raw[i].pts.length; j++) longest = Math.max(longest, Math.hypot(raw[i].pts[j + 1].x - raw[i].pts[j].x, raw[i].pts[j + 1].y - raw[i].pts[j].y));
      const probe = (p) => {
        const z = surface.elevationAt(p.x, p.y, 1e-6);
        if (z === null) { off++; return; }
        worstBand = Math.max(worstBand, Math.abs(z - l.z) / interval);
        const d = distTo(p, raw[i].pts); worstDev = Math.max(worstDev, longest ? d / longest : 0);
        if (d > L.handle * longest + 1e-9) devOk = false;
      };
      for (let j = 0; j < l.pts.length; j++) { probe(l.pts[j]); if (j + 1 < l.pts.length) probe({ x: (l.pts[j].x + l.pts[j + 1].x) / 2, y: (l.pts[j].y + l.pts[j + 1].y) / 2 }); }
    });
    ok(kept, `${name} ${level}: every corner on a triangle edge is still on the line, unmoved`);
    ok(added > 0, `${name} ${level}: ${added} points added along the curves`);
    ok(off === 0, `${name} ${level}: no smoothed point (or middle of a piece) is off the surface`);
    ok(worstBand <= L.band + 1e-6, `${name} ${level}: surface elevation along the smoothed lines within ${L.band * 100} % of the interval of the contour (worst ${(worstBand * 100).toFixed(2)} %)`);
    ok(devOk, `${name} ${level}: never farther from the traced line than ${L.handle.toFixed(3)} of its longest piece (worst ${worstDev.toFixed(4)})`);
    const tn = turning(sm);
    ok(tn.mean < turnRaw.mean * 0.75, `${name} ${level}: smoother, mean turn per vertex ${(tn.mean * 180 / Math.PI).toFixed(2)}° against ${(turnRaw.mean * 180 / Math.PI).toFixed(2)}° traced`);
    if (VERBOSE) console.log(`      ${name} ${level}: ${sm.reduce((s, l) => s + l.pts.length, 0)} points (traced ${raw.reduce((s, l) => s + l.pts.length, 0)}), worst turn ${(tn.worst * 180 / Math.PI).toFixed(1)}° (traced ${(turnRaw.worst * 180 / Math.PI).toFixed(1)}°)`);
  }
}

section('the levels');
ok(CS.LEVELS.none === null && CS.LEVELS.light.band === 0.10 && CS.LEVELS.strong.band === 0.25 && CS.LEVELS.light.handle === 1 / 6 && CS.LEVELS.strong.handle === 1 / 3, 'none, light (10 %, 1/6), strong (25 %, 1/3)');
ok(CS.LEVELS.light.band < 0.5 && CS.LEVELS.strong.band < 0.5, 'both bands are under half an interval, so two elevations can never meet');

section('survey points as a triangulation (site-topo.csv)');
const tin = TIN.buildSurface({ points: fx }).surface;
ok(!!tin && tin.stats().points === 276, 'the triangulation uses the 276 points');
guarantees('TIN 1 ft', tin, 1);
guarantees('TIN 0.25 ft', tin, 0.25);

section('the same points gridded (kriging), then smoothed');
{
  const r = G.gridSurface(fx.map((p) => ({ x: p.x, y: p.y, z: p.z })), { method: 'kriging' });
  const s = TIN.surfaceFromFaces({ pts: r.pts, faces: r.faces }).surface;
  guarantees('kriging 1 ft', s, 1);
}

section('contours through data points (elevations that sit exactly on a level)');
{
  // the fixture's elevations rounded to whole feet: every point is on a contour level, the hardest case for tracing
  const s = TIN.buildSurface({ points: fx.map((p) => ({ x: p.x, y: p.y, z: Math.round(p.z) })) }).surface;
  for (const level of ['light', 'strong']) {
    const sm = CS.smoothContours(s, 1, { level });
    ok(crossings(sm).length === 0, `whole-foot elevations, ${level}: no crossings`);
    let worst = 0;
    for (const l of sm) for (const p of l.pts) { const z = s.elevationAt(p.x, p.y, 1e-6); if (z !== null) worst = Math.max(worst, Math.abs(z - l.z)); }
    ok(worst <= CS.LEVELS[level].band + 1e-6, `whole-foot elevations, ${level}: within the band (worst ${worst.toFixed(4)})`);
  }
}

section('a breakline is a hard edge of the triangulation (geometric case: two planes meeting on the line x = 50)');
{
  // left of x = 50 the ground rises 0.1 per unit north; right of it it also rises 0.2 per unit east. Points are scattered and none is on the line.
  let seed = 4242;
  const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
  const f = (x, y) => 0.1 * y + (x > 50 ? 0.2 * (x - 50) : 0);
  const pts = [];
  for (let i = 0; i < 400; i++) { const x = rnd() * 100, y = rnd() * 100; if (Math.abs(x - 50) > 0.8) pts.push({ x: 1000 + x, y: 2000 + y, z: f(x, y) }); }
  for (const [x, y] of [[0, 0], [100, 0], [100, 100], [0, 100]]) pts.push({ x: 1000 + x, y: 2000 + y, z: f(x, y) });
  const line = { name: 'kerb', pts: [{ x: 1050, y: 2000, z: f(50, 0) }, { x: 1050, y: 2043, z: f(50, 43) }, { x: 1050, y: 2100, z: f(50, 100) }] };
  const straddle = (s) => { let n = 0; for (const t of s.triangles()) { const xs = [t[0], t[3], t[6]]; if (Math.min(...xs) < 1050 - 1e-9 && Math.max(...xs) > 1050 + 1e-9) n++; } return n; };
  const free = TIN.buildSurface({ points: pts }).surface;
  const built = TIN.buildSurface({ points: pts, breaklines: [line] });
  const hard = built.surface;
  ok(straddle(free) > 20, `without the breakline ${straddle(free)} triangles lie across the line (so the test can tell)`);
  ok(built.report.constraintFailures === 0 && straddle(hard) === 0, 'with the breakline no triangle lies across it');
  // the breakline is a chain of constrained triangle edges from end to end
  const onLine = hard.constrainedEdges.filter(([a, b]) => Math.abs(hard.X[a] + hard.ox - 1050) < 1e-9 && Math.abs(hard.X[b] + hard.ox - 1050) < 1e-9);
  const lenOn = onLine.reduce((s, [a, b]) => s + Math.abs(hard.Y[a] - hard.Y[b]), 0);
  ok(Math.abs(lenOn - 100) < 1e-9, `its constrained edges add up to the whole line (${lenOn.toFixed(6)} of 100)`);
  const edgeSet = new Set(); { const E = hard.edges(); for (let i = 0; i < E.length; i += 2) edgeSet.add(Math.min(E[i], E[i + 1]) + '_' + Math.max(E[i], E[i + 1])); }
  ok(onLine.every(([a, b]) => edgeSet.has(Math.min(a, b) + '_' + Math.max(a, b))), 'each of them is an edge of the triangulation');
  // elevations: exact on both planes with the breakline, wrong near the line without it
  let worstHard = 0, worstFree = 0;
  for (let i = 0; i < 2000; i++) { const x = 45 + rnd() * 10, y = 5 + rnd() * 90; worstHard = Math.max(worstHard, Math.abs(hard.elevationAt(1000 + x, 2000 + y) - f(x, y))); worstFree = Math.max(worstFree, Math.abs(free.elevationAt(1000 + x, 2000 + y) - f(x, y))); }
  ok(worstHard < 1e-9, `with the breakline the surface is the two planes exactly near the line (worst ${worstHard.toExponential(1)})`);
  ok(worstFree > 0.05, `without it the surface is off near the line (worst ${worstFree.toFixed(3)})`);
  // contours kink exactly on the breakline
  const raw = hard.contours(1, { base: 0.37 });   // levels 0.37, 1.37, …: clear of the corner and breakline elevations
  const crossing = raw.filter((l) => l.pts.some((p) => p.x < 1049) && l.pts.some((p) => p.x > 1051));
  ok(crossing.length >= 8, `${crossing.length} contours cross the breakline`);
  ok(crossing.every((l) => l.pts.some((p) => Math.abs(p.x - 1050) < 1e-9 && Math.abs(0.1 * (p.y - 2000) - l.z) < 1e-6)), 'each has a vertex exactly on the breakline, at the right place');
  const truth = (l) => (p) => Math.abs(f(p.x - 1000, p.y - 2000) - l.z);
  ok(raw.every((l) => l.pts.every((p) => truth(l)(p) < 1e-6)), 'the traced contours are the true ones (straight on each side, a kink on the line)');
  for (const level of ['light', 'strong']) {
    const sm = CS.smoothContours(hard, 1, { level, base: 0.37 });
    let worst = 0;
    sm.forEach((l, i) => { for (const p of l.pts) worst = Math.max(worst, distTo(p, raw[i].pts)); });
    ok(worst < 1e-9, `${level}: the kink on the breakline stays sharp and the straight parts stay straight (moved ${worst.toExponential(1)})`);
    ok(sm.every((l) => l.pts.every((p) => truth(l)(p) < 1e-6)), `${level}: still the true contours`);
  }
  // the same surface with the edges not marked as a breakline: smoothing would round the kink (so the rule above is doing something)
  const soft = TIN.buildSurface({ points: pts, breaklines: [line] }).surface; soft.constrainedEdges = [];
  const rounded = CS.smoothContours(soft, 1, { level: 'strong', base: 0.37 });
  let moved = 0;
  rounded.forEach((l, i) => { for (const p of l.pts) moved = Math.max(moved, distTo(p, raw[i].pts)); });
  ok(moved > 1e-3, `were the line not a breakline the kink would be rounded (by ${moved.toFixed(4)})`);
  // a breakline that is not straight and crosses between points: ridge, wall top and bottom
  const wallTop = { name: 'top', pts: [{ x: 1020, y: 2010, z: 8 }, { x: 1030, y: 2050, z: 8.5 }, { x: 1022, y: 2090, z: 9 }] };
  const wallBot = { name: 'bottom', pts: [{ x: 1020.3, y: 2010, z: 5 }, { x: 1030.3, y: 2050, z: 5.5 }, { x: 1022.3, y: 2090, z: 6 }] };
  const w = TIN.buildSurface({ points: pts.filter((p) => p.x < 1018 || p.x > 1033), breaklines: [wallTop, wallBot] });
  const has = (s, a, b) => s.constrainedEdges.some(([i, j]) => { const P = (k) => [s.X[k] + s.ox, s.Y[k] + s.oy]; const [p, q] = [P(i), P(j)]; const on = (r) => Math.abs((b.x - a.x) * (r[1] - a.y) - (b.y - a.y) * (r[0] - a.x)) < 1e-6; return on(p) && on(q); });
  ok(w.report.constraintFailures === 0 && has(w.surface, wallTop.pts[0], wallTop.pts[1]) && has(w.surface, wallBot.pts[1], wallBot.pts[2]), 'a wall (top and bottom 0.3 apart) goes in as two chains of hard edges');
  const zt = w.surface.elevationAt(1025, 2030), zb = w.surface.elevationAt(1025.3, 2030);
  ok(Math.abs(zt - 8.25) < 1e-9 && Math.abs(zb - 5.25) < 1e-9, `the surface drops 3 across the 0.3 between them (${zt.toFixed(3)} to ${zb.toFixed(3)})`);
  for (const level of ['light', 'strong']) ok(crossings(CS.smoothContours(w.surface, 0.5, { level })).length === 0, `wall, ${level}: smoothed contours (packed on the wall face) do not cross`);
}

section('the project: setting, screen list, DXF and DWG');
{
  const p = new PJ.Project();
  p.setPoints(fx, 'site-topo.csv');
  const file = (pr) => { const o = pr.toJSON(); delete o.saved; return JSON.stringify(o); };   // all but the time it was saved
  const before = file(p);
  const raw = p.contours();
  ok(!('smooth' in p.state.display), 'a new project has no smoothing key (today\'s look)');
  p.state.display.smooth = 'strong'; p.touch('display');
  const sm = p.contours();
  ok(sm.length === raw.length && sm.reduce((s, l) => s + l.pts.length, 0) > raw.reduce((s, l) => s + l.pts.length, 0), 'project.contours() is smoothed when the display says so');
  const saved = JSON.parse(JSON.stringify(p.toJSON()));
  ok(saved.display.smooth === 'strong', 'saved in the project file');
  const q = PJ.Project.fromJSON(saved).project ?? PJ.Project.fromJSON(saved);
  ok(q.state.display.smooth === 'strong', 'and read back');
  const o = JSON.parse(JSON.stringify(saved)); o.display.smooth = 'toString'; const bad = PJ.Project.fromJSON(o).project ?? PJ.Project.fromJSON(o);
  ok(!('smooth' in bad.state.display), 'an unknown value in a file is ignored');
  delete p.state.display.smooth; p.touch('display');
  ok(file(p) === before && JSON.stringify(p.contours()) === JSON.stringify(raw), 'turned off again the file and the lines are as before');

  // export: minor and index contours on their own layers, at their elevations, labelled; smoothed when on
  const build = (level) => {
    if (level) p.state.display.smooth = level; else delete p.state.display.smooth; p.touch('display');
    const list = p.contours();
    const scene = SC.planScene({ units: 'ft', points: fx, surface: p.eg().surface, contours: { interval: 1, major: 5, list }, breaklines: [], alignments: [], pads: [] }, { mmPerUnit: 25.4 / 40 });
    const ents = SC.toDxfEntities(scene, 25.4 / 40);
    return { list, scene, ents, dxf: DXF.writeDxf({ units: 'ft', layers: SC.LAYERS.map((l) => ({ name: l.name, color: l.aci })), entities: ents }).text };
  };
  // a small DXF reader: POLYLINE entities with layer, elevation (30) and vertex count
  const polylines = (text) => {
    const g = text.split(/\r\n/), out = [];
    let cur = null;
    for (let i = 0; i + 1 < g.length; i += 2) {
      const c = Number(g[i]), v = g[i + 1];
      if (c === 0) { if (v === 'POLYLINE') { cur = { layer: '', elev: 0, n: 0, flags: 0, inV: false }; out.push(cur); } else if (v === 'VERTEX' && cur) { cur.n++; cur.inV = true; } else if (v === 'SEQEND') cur = null; else if (v !== 'VERTEX') cur = null; }
      else if (cur && !cur.inV) { if (c === 8) cur.layer = v; if (c === 30) cur.elev = Number(v); if (c === 70) cur.flags = Number(v); }
    }
    return out;
  };
  const a = build(null), b = build('strong');
  for (const [name, r] of [['no smoothing', a], ['strong smoothing', b]]) {
    const pl = polylines(r.dxf), maj = pl.filter((x) => x.layer === 'C-TOPO-MAJR'), min = pl.filter((x) => x.layer === 'C-TOPO-MINR');
    const wantMaj = r.list.filter((l) => Math.abs(l.z / 5 - Math.round(l.z / 5)) < 1e-6), wantMin = r.list.filter((l) => Math.abs(l.z / 5 - Math.round(l.z / 5)) >= 1e-6);
    ok(maj.length === wantMaj.length && min.length === wantMin.length && maj.length > 0 && min.length > maj.length, `DXF, ${name}: ${maj.length} index contours on C-TOPO-MAJR and ${min.length} minor on C-TOPO-MINR (every 5th is an index contour)`);
    ok(maj.every((x) => x.elev % 5 === 0) && min.every((x) => x.elev % 5 !== 0) && new Set([...maj, ...min].map((x) => x.elev)).size === new Set(r.list.map((l) => l.z)).size, `DXF, ${name}: each polyline sits at its contour's elevation`);
    ok([...maj, ...min].every((x) => (x.flags & 8) === 0), `DXF, ${name}: flat polylines with an elevation (not 3D polylines)`);
    ok([...maj, ...min].reduce((s, x) => s + x.n, 0) === r.list.reduce((s, l) => s + l.pts.length, 0), `DXF, ${name}: the vertices written are the ones on screen (${r.list.reduce((s, l) => s + l.pts.length, 0)})`);
    const labels = r.scene.items.filter((i) => i.layer === 'C-TOPO-TEXT');
    ok(labels.length > 0 && labels.every((i) => Number(i.text) % 5 === 0), `${name}: ${labels.length} elevation labels, on index contours only, on C-TOPO-TEXT`);
  }
  ok(b.dxf.length > a.dxf.length, 'the DXF with strong smoothing carries the extra vertices');
  // DWG: written, read back with our own reader, polylines on the two layers
  for (const [name, r] of [['no smoothing', a], ['strong smoothing', b]]) {
    const { bytes } = DWGW.writeDwg({ units: 'ft', layers: SC.LAYERS.map((l) => ({ name: l.name, color: l.aci })), entities: r.ents, version: 'AC1015', created: new Date(Date.UTC(2026, 10, 11)) });
    const m = DWGR.readDwg(bytes);
    const ents = m.blocks.find((b) => b.name === '*Model_Space').entities;
    const lay = (e) => (typeof e.layer === 'string' ? e.layer : e.layer?.name);
    const maj = ents.filter((e) => /POLYLINE/i.test(e.type || e.kind || '') && lay(e) === 'C-TOPO-MAJR'), min = ents.filter((e) => /POLYLINE/i.test(e.type || e.kind || '') && lay(e) === 'C-TOPO-MINR');
    const wantMaj = r.list.filter((l) => Math.abs(l.z / 5 - Math.round(l.z / 5)) < 1e-6).length;
    ok(maj.length === wantMaj && min.length === r.list.length - wantMaj, `DWG, ${name}: read back ${maj.length} index and ${min.length} minor contour polylines on their layers`);
    const elevOf = (e) => e.elevation ?? e.elev ?? e.z;
    ok(maj.every((e) => Number.isFinite(elevOf(e)) && elevOf(e) % 5 === 0), `DWG, ${name}: index contours at their elevations`);
    const nv = [...maj, ...min].reduce((s, e) => s + (e.pts || e.vertices || e.points || []).length, 0);
    ok(nv === r.list.reduce((s, l) => s + l.pts.length, 0), `DWG, ${name}: ${nv} vertices, the ones on screen`);
  }
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
