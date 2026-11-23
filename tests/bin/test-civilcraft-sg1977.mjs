#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-civilcraft-sg1977.mjs — CivilCraft 0.10.1, suggestion #1977: roads that meet roads (a junction), a road that ends at a
 * pad, a path that meets a road. DOM-free, in Node.
 *
 *   node bin/test-civilcraft-sg1977.mjs [--build dev]
 *
 * Every number is worked by hand in the comment above its check.
 */
import fs from 'node:fs';
import path from 'node:path';
import { registerHooks } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const arg = (k) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null; };
const APP = path.join(REPO, 'public_html/assets/apps/civilcraft', arg('--build') || 'dev');
const manifest = JSON.parse(fs.readFileSync(path.join(APP, 'manifest.json'), 'utf8'));
registerHooks({ resolve(spec, ctx, next) { const m = manifest.imports?.[spec]; return m ? { url: pathToFileURL(path.join(REPO, 'public_html', m)).href, shortCircuit: true } : next(spec, ctx); } });
const imp = (f) => import(pathToFileURL(path.join(APP, f)).href);
const I18N = await imp('i18n.js');
I18N.init({ strings: JSON.parse(fs.readFileSync(path.join(APP, 'lang/en.json'), 'utf8')) });
const J = await imp('junction.js');
const { buildAlignment } = await imp('alignment.js');
const { buildSurface } = await imp('tin.js');
const { gradedSurface } = await imp('grading.js');
const HS = await imp('landscape/hardscape.js');
const PL = await imp('landscape/planting.js');
const S3 = await imp('site3d.js');
const { Project } = await imp('project.js');

let pass = 0, fail = 0;
const ok = (c, m, x) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (x !== undefined ? ' — ' + JSON.stringify(x) : '')); } };
const near = (a, b, e = 1e-6) => Number.isFinite(a) && Number.isFinite(b) && Math.abs(a - b) <= e;
const section = (s) => console.log('\n' + s);

// ---------------------------------------------------------------------------------------------------------------------
section('Widths from the assembly');
{
  // the plain assembly: lane 3.5, shoulder 1 → pavement 3.5, body 4.5, the same both sides
  const w = J.nominalWidths({ lane: 3.5, shoulder: 1 }, 'm');
  ok(w.L.pave === 3.5 && w.L.body === 4.5 && w.R.pave === 3.5 && w.R.body === 4.5, 'lane 3.5 + shoulder 1: pavement 3.5, body 4.5', w);
  // parts, left: lane 3.6, lane 3.6, gutter 0.6, curb 0.15, strip 1.5, walk 1.8 → pavement 3.6 + 3.6 + 0.6 + 0.15 = 7.95, body 7.95 + 1.5 + 1.8 = 11.25
  // right: lane 3, shoulder 1.2 → pavement 3, body 4.2
  const P = (type, o) => ({ type, ...o });
  const u = J.nominalWidths({ lane: 3.5, shoulder: 1, parts: { L: [P('lane', { w: 3.6 }), P('lane', { w: 3.6 }), P('gutter', { w: 0.6 }), P('curb', { w: 0.15, h: 0.15 }), P('strip', { w: 1.5 }), P('walk', { w: 1.8 }), P('daylight', {})], R: [P('lane', { w: 3 }), P('shoulder', { w: 1.2 }), P('daylight', {})] } }, 'm');
  ok(near(u.L.pave, 7.95) && near(u.L.body, 11.25), 'urban side: pavement runs to the back of the curb (7.95), body to the back of the walk (11.25)', u.L);
  ok(near(u.R.pave, 3) && near(u.R.body, 4.2), 'rural side: pavement = the lane (3), body = lane + shoulder (4.2)', u.R);
}

// ---------------------------------------------------------------------------------------------------------------------
section('Finding junctions in plan');
const W = J.nominalWidths({ lane: 3.5, shoulder: 1 }, 'm');
const road = (key, pis) => { const al = buildAlignment({ pis: pis.map(([x, y]) => ({ x, y, r: 0 })), start: 0 }); return { key, alId: key, al, from: al.start, to: al.end, w: W }; };
{
  // Main along y = 0 from x = 0 to 200. Side comes down x = 100 from y = 80 and stops on the main centreline (0 from it; body 4.5).
  // The side's centreline meets the main's body edge (y = 4.5) at its station 80 − 4.5 = 75.5, at the main's station 100.
  // Opening: the side's pavement half width 3.5 either side at 90° → main stations 96.5 to 103.5, on the main's LEFT (the main
  // runs +x, so +y is its left).
  const j = J.findJunctions([road('m', [[0, 0], [200, 0]]), road('s', [[100, 80], [100, 0]])], { units: 'm' });
  ok(j.length === 1 && j[0].major === 'm' && j[0].minor === 's' && j[0].end === 'end', 'a road ending on another: one junction, the through road is the major one', j);
  ok(near(j[0].staMinor, 75.5, 1e-4) && near(j[0].staMajor, 100, 1e-4) && near(j[0].at.y, 4.5, 1e-4), 'it meets the main road\'s body edge at its station 75.5 (main station 100)', j[0]);
  ok(j[0].openings.length === 1 && j[0].openings[0].side === 'L' && near(j[0].openings[0].from, 96.5, 1e-4) && near(j[0].openings[0].to, 103.5, 1e-4), 'the main road opens on its left from 96.5 to 103.5', j[0].openings);
  // the same two roads listed the other way round: the road that ENDS there is still the minor one
  const k = J.findJunctions([road('s', [[100, 80], [100, 0]]), road('m', [[0, 0], [200, 0]])], { units: 'm' });
  ok(k.length === 1 && k[0].major === 'm' && k[0].minor === 's', 'listed the other way round, the road that ends there is still the side road', k);
  // the side road starting there instead (drawn away from the main road): end 'start', station 4.5
  const s2 = J.findJunctions([road('m', [[0, 0], [200, 0]]), road('s', [[100, 0], [100, 80]])], { units: 'm' });
  ok(s2.length === 1 && s2[0].end === 'start' && near(s2[0].staMinor, 4.5, 1e-4), 'drawn away from the main road: its START joins, at station 4.5', s2);
  // stopping short: the side ends at y = 6, 1.5 outside the body edge. Tolerance = its pavement half width 3.5 (≥ 2 m) → still a junction
  const s3 = J.findJunctions([road('m', [[0, 0], [200, 0]]), road('s', [[100, 80], [100, 6]])], { units: 'm' });
  ok(s3.length === 1 && s3[0].end === 'end' && near(s3[0].staMinor, 74, 1e-6), 'an end 1.5 short of the edge still joins (tolerance 3.5); the join is its end, station 74', s3);
  // stopping 9 short (y = 13.5: 4.5 + 3.5 = 8 < 13.5): not a junction
  ok(J.findJunctions([road('m', [[0, 0], [200, 0]]), road('s', [[100, 80], [100, 13.5]])], { units: 'm' }).length === 0, 'an end 9 short of the edge is not a junction');
  // two roads that cross at (100, 0): the earlier one is the major one; it opens both sides 96.5 to 103.5
  const x = J.findJunctions([road('m', [[0, 0], [200, 0]]), road('c', [[100, -60], [100, 60]])], { units: 'm' });
  ok(x.length === 1 && x[0].end === null && x[0].major === 'm' && near(x[0].staMajor, 100, 1e-6) && near(x[0].staMinor, 60, 1e-6), 'two roads that cross: the earlier one is the through road', x);
  ok(x[0].openings.map((o) => o.side).join('') === 'LR' && x[0].openings.every((o) => near(o.from, 96.5, 1e-6) && near(o.to, 103.5, 1e-6)), 'a crossing opens both sides');
  // a crossing on a skew of 45°: the opening is 3.5 / sin 45° = 4.9497 either side
  const sk = J.findJunctions([road('m', [[0, 0], [200, 0]]), road('c', [[40, -60], [160, 60]])], { units: 'm' });
  ok(sk.length === 1 && near(sk[0].openings[0].to - sk[0].openings[0].from, 2 * 3.5 / Math.SQRT1_2, 1e-6), 'on a 45° skew the opening is 3.5 / sin 45° each way (9.90 long)', sk[0]?.openings);
  // parallel roads 6 apart, and a road continuing another in line: no junction
  ok(J.findJunctions([road('m', [[0, 0], [200, 0]]), road('p', [[0, 6], [200, 6]])], { units: 'm' }).length === 0, 'roads alongside each other are not a junction');
  ok(J.findJunctions([road('m', [[0, 0], [200, 0]]), road('p', [[200, 0], [300, 5]])], { units: 'm' }).length === 0, 'a road continuing another nearly in line is not a junction');
  // two ends that meet at a right angle: the earlier road is the major one, once
  const L = J.findJunctions([road('m', [[0, 0], [100, 0]]), road('s', [[100, 80], [100, 0]])], { units: 'm' });
  ok(L.length === 1 && L[0].major === 'm' && L[0].minor === 's', 'two ends meeting at a corner: one junction, the earlier road the major one', L);
  // a pad from (90, 78) to (110, 95): the side road's start (100, 80) is in it; its end is not
  const pe = J.padEnds(road('s', [[100, 80], [100, 0]]), [{ id: 'p1', pts: [{ x: 90, y: 78 }, { x: 110, y: 78 }, { x: 110, y: 95 }, { x: 90, y: 95 }] }], { units: 'm' });
  ok(pe.length === 1 && pe[0].pad === 'p1' && pe[0].end === 'start', 'a road whose start is in a pad: that end joins the pad', pe);
  // an end 2 outside the pad's edge (tolerance 3.5) joins; 5 outside does not
  const sq = [{ id: 'p2', pts: [{ x: 90, y: 82 }, { x: 110, y: 82 }, { x: 110, y: 95 }, { x: 90, y: 95 }] }];
  ok(J.padEnds(road('s', [[100, 80], [100, 0]]), sq, { units: 'm' }).length === 1 && J.padEnds(road('s', [[100, 77], [100, 0]]), sq, { units: 'm' }).length === 0, 'an end 2 short of a pad joins it, an end 5 short does not');
}

// ---------------------------------------------------------------------------------------------------------------------
section('A pad\'s level at a point');
{
  const flat = J.padZAt({ z: 13.4, pts: [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 10 }, { x: 0, y: 10 }] });
  ok(flat(5, 5) === 13.4 && flat(0, 5) === 13.4 && flat(11, 5) === null, 'a flat pad: its elevation inside and on the edge, nothing outside');
  // corners 10, 10, 12, 12 (a ramp rising 2 from y = 0 to y = 10): the centre is 11, (5, 2.5) is 10.5 (a plane, which mean value
  // coordinates reproduce exactly), the edge x = 10 at y = 4 is 10 + 0.4 × 2 = 10.8
  const ramp = J.padZAt({ z: 10, pts: [{ x: 0, y: 0, z: 10 }, { x: 10, y: 0, z: 10 }, { x: 10, y: 10, z: 12 }, { x: 0, y: 10, z: 12 }] });
  ok(near(ramp(5, 5), 11, 1e-9) && near(ramp(5, 2.5), 10.5, 1e-9) && near(ramp(2, 9), 11.8, 1e-9), 'corner elevations 10, 10, 12, 12: a plane through them (centre 11, quarter 10.5)', [ramp(5, 5), ramp(5, 2.5), ramp(2, 9)]);
  ok(near(ramp(10, 4), 10.8, 1e-9) && ramp(0, 0) === 10, 'on a side: along that side (10.8); on a corner: the corner');
}

// ---------------------------------------------------------------------------------------------------------------------
// The site used below (metres). Ground: the plane z = 10 + 0.01 x + 0.02 y. Main road along y = 0, x 0 to 200, profile level at
// 12. Side road down x = 100 from y = 80 to y = 0, profile 13 at station 0 falling to 12.5 at station 80. Both: lane 3.5 at 2%,
// shoulder 1 at 4%, cut 2:1, fill 3:1, a section every 5.
const ASM = { on: true, lane: 3.5, laneSlope: 0.02, shoulder: 1, shoulderSlope: 0.04, cut: 2, fill: 3, step: 5 };
function site({ side = true, sideFirst = false, pad = false, ground = true } = {}) {
  const p = new Project(), pts = [];
  let n = 1;
  if (ground) { for (let x = -50; x <= 250; x += 10) for (let y = -100; y <= 150; y += 10) pts.push({ n: String(n++), x, y, z: 10 + 0.01 * x + 0.02 * y, d: '' }); p.setPoints(pts, 'flat'); }
  p.change('site', (s) => {
    s.units = 'm';
    const main = { id: 'a1', name: 'Main', start: 0, pis: [{ x: 0, y: 0, r: 0 }, { x: 200, y: 0, r: 0 }], pvis: [{ sta: 0, z: 12, L: 0 }, { sta: 200, z: 12, L: 0 }], corridor: { ...ASM } };
    const sd = { id: 'a2', name: 'Side', start: 0, pis: [{ x: 100, y: 80, r: 0 }, { x: 100, y: 0, r: 0 }], pvis: [{ sta: 0, z: 13, L: 0 }, { sta: 80, z: 12.5, L: 0 }], corridor: { ...ASM } };
    s.alignments.push(...(side ? (sideFirst ? [sd, main] : [main, sd]) : [main]));
    if (pad) s.pads.push({ id: 'p1', name: 'Pad 1', z: 13.4, cut: 2, fill: 2, pts: [{ x: 90, y: 78 }, { x: 110, y: 78 }, { x: 110, y: 95 }, { x: 90, y: 95 }] });
  });
  return p;
}
const item = (p, id) => p.graded().items.find((x) => x.id === id);
const secAt = (it, sta) => it.sections.find((s) => Math.abs(s.sta - sta) < 1e-4);

section('The main road\'s surface from its sections');
{
  const p = site({ side: false }), it = item(p, 'a1'), z = J.roadZAt(it, p.alignment(p.state.alignments[0]));
  // crown 12; edge of pavement 3.5 out: 12 − 3.5 × 0.02 = 11.93; shoulder edge 4.5 out: 11.93 − 1 × 0.04 = 11.89; halfway down the lane 11.965
  ok(near(z(60, 0), 12) && near(z(60, 3.5), 11.93) && near(z(60, -4.5), 11.89) && near(z(63, 1.75), 11.965), 'crown 12, edge of pavement 11.93, shoulder edge 11.89, mid lane 11.965', [z(60, 0), z(60, 3.5), z(60, -4.5), z(63, 1.75)]);
  ok(z(60, 4.6) === null && z(-5, 0) === null, 'off the body (past the shoulder, before the start): nothing');
  const b = J.bodyOf(it);
  // the body outline: left shoulder edge forward then the right one back = 2 × the section count; 5 lines (CL, EOP L/R, body edge L/R)
  ok(b.poly.length === 2 * it.sections.length && b.lines.length === 5 && near(b.lines[3][0].y, 4.5) && near(b.lines[4][0].y, -4.5), 'the body: the outline between the two shoulder edges, and five 3D lines');
}

section('A side road ending on a main road (a T junction)');
{
  const p = site(), g = p.graded(), a1 = item(p, 'a1'), a2 = item(p, 'a2');
  ok(!g.report.errors.length && !a1.problems.length && !a2.problems.length && g.surface, 'both corridors grade without a problem', [g.report.errors, a1.problems, a2.problems]);
  ok(g.items.map((x) => x.id).join() === 'a1,a2', 'the main road is graded first');
  // THE OPENING. Main stations 96.5 to 103.5, left side: the shoulder edge is laid on the lane's 2%: 12 − 4.5 × 0.02 = 11.91
  // (it was 11.89). Just outside (96.4), and on the right side everywhere, it is the shoulder's own 11.89.
  const o = [96.5, 100, 103.5].map((s) => secAt(a1, s));
  ok(o.every((s) => s && s.open?.L && !s.open?.R && near(s.L[2].z, 11.91) && s.L[2].open === true && near(s.R[2].z, 11.89) && !s.R[2].open), 'across the mouth the main road\'s left shoulder edge is on the lane slope (11.91) and marked open; its right side is untouched (11.89)', o.map((s) => s && [s.sta, s.L[2].z, s.R[2].z]));
  const out = secAt(a1, 96.45) || a1.sections.find((s) => s.sta > 96.3 && s.sta < 96.5);
  ok(out && !out.open && near(out.L[2].z, 11.89) && near(secAt(a1, 95).L[2].z, 11.89), 'just outside the mouth (a section 5 cm before it) the shoulder is the shoulder again (11.89)', out && [out.sta, out.L[2].z]);
  // THE TIE. Zone: side stations 75.5 (the main road's body edge) to 80 (its end on the main centreline).
  const tie = a2.ties?.find((x) => x.kind === 'road');
  // the side's own centreline at 75.5: 13 − 0.5 × 75.5 / 80 = 12.528125; the main road there (in the opening, 4.5 out): 11.91 → −0.618125.
  // Blend length: the larger of 10 and 20 × 0.618125 = 12.3625.
  ok(tie && tie.id === 'a1' && tie.name === 'Main' && near(tie.from, 75.5, 1e-4) && near(tie.to, 80) && near(tie.dz, -0.618125, 1e-5) && near(tie.len, 12.3625, 1e-4), 'the side road reports the join: zone 75.5 to 80, lowered 0.618 there, eased over 12.36', tie);
  // at 75.5 the section lies along the main road's edge: the lane (x 96.5 to 103.5) in the opening at 11.91, the shoulders' outer
  // edges (x 95.5 and 104.5) on the main road's own shoulder edge at 11.89
  const t0 = secAt(a2, 75.5);
  ok(t0?.tie?.kind === 'road' && near(t0.L[0].z, 11.91) && near(t0.L[1].z, 11.91) && near(t0.R[1].z, 11.91) && near(t0.L[2].z, 11.89) && near(t0.R[2].z, 11.89), 'at the main road\'s edge the side road\'s section lies on it: lanes 11.91 (the opening), shoulder edges 11.89', t0 && [t0.L.map((q) => q.z), t0.R.map((q) => q.z)]);
  // at its end (station 80, y = 0) every point of the section is on the main crown: 12. The side road's own profile says 12.5.
  const t1 = secAt(a2, 80);
  ok(t1?.tie && [...t1.L.slice(0, 3), ...t1.R.slice(0, 3)].every((q) => near(q.z, 12)), 'at its end the whole section is on the main road\'s crown (12; its own profile says 12.5)', t1 && t1.L.map((q) => q.z));
  ok(near(p.designProfile(p.state.alignments[1]).elevationAt(80), 12.5), 'the design profile itself is not changed (still 12.5 at station 80)');
  // a section where the centreline crosses the main road's edge of pavement (y = 3.5 → station 76.5): on the lane, 12 − 3.5 × 0.02 = 11.93
  ok(near(secAt(a2, 76.5)?.L[0].z, 11.93), 'a section where it crosses the main road\'s edge of pavement (station 76.5): 11.93');
  // THE APPROACH. Station 70 is 5.5 before the zone: u = 1 − 5.5 / 12.3625 = 0.555106, eased 3u² − 2u³ = 0.582336.
  // Own centreline 13 − 0.5 × 70 / 80 = 12.5625; moved by 0.582336 × −0.618125 = −0.359956 → 12.202544. (The zone's edge is found
  // by halving to 0.00001 of a station, so these agree to about 0.0001.)
  const b70 = secAt(a2, 70);
  ok(b70 && !b70.tie && near(b70.blend, 0.582336, 1e-4) && near(b70.L[0].z, 12.202544, 1e-4), 'on the approach (station 70) the centreline is eased down by 0.5823 of the difference: 12.2025', b70 && [b70.blend, b70.L[0].z]);
  // its edge of pavement moves by ITS line's difference at the zone edge: own at 75.5 = 12.528125 − 0.07 = 12.458125, the main road
  // there 11.91 → −0.548125; own at 70 = 12.5625 − 0.07 = 12.4925 → 12.4925 − 0.582336 × 0.548125 = 12.173307
  ok(near(b70.L[1].z, 12.173307, 1e-4), 'each line is eased by its own difference (the edge of pavement at station 70: 12.1733)', b70.L[1].z);
  // station 60 is 15.5 before the zone, past the blend length: exactly the profile, 13 − 0.5 × 60 / 80 = 12.625
  ok(!secAt(a2, 60).blend && near(secAt(a2, 60).L[0].z, 12.625), 'beyond the blend length the road is exactly its profile (12.625 at station 60)');
  // THE SURFACE. On the main crown 12; in the mouth at the body edge 11.91; the main road's far shoulder 11.89; away from the
  // junction the main road's near shoulder 11.89; the side road at station 70 (y = 10) 12.2025.
  const sf = g.surface, z = (x, y) => sf.elevationAt(x, y);
  ok(near(z(100, 0), 12, 1e-6) && near(z(100, 4.5), 11.91, 1e-6) && near(z(98, 4.5), 11.91, 1e-6) && near(z(100, -4.5), 11.89, 1e-6) && near(z(60, 4.5), 11.89, 1e-6), 'the proposed surface: crown 12, the mouth 11.91, the far shoulder and the shoulder away from the junction 11.89', [z(100, 0), z(100, 4.5), z(98, 4.5), z(100, -4.5), z(60, 4.5)]);
  ok(near(z(100, 10), 12.202544, 1e-4) && near(z(100, 2), 11.96, 1e-6), 'the side road on its approach (12.2025) and the main lane under its end (12 − 2 × 0.02 = 11.96)', [z(100, 10), z(100, 2)]);
  // the main road keeps its shape along its whole length: its edge lines used to be dropped whole when a second road met it
  ok(near(z(20, 3.5), 11.93, 1e-6) && near(z(180, -3.5), 11.93, 1e-6) && near(z(150, 0), 12, 1e-6), 'the main road keeps its crown and edges of pavement far from the junction');

  // the side road listed first: the main road is still graded first, the same join
  const q = site({ sideFirst: true }), gq = q.graded();
  ok(gq.items.map((x) => x.id).join() === 'a1,a2' && near(item(q, 'a2').ties[0].dz, -0.618125, 1e-5), 'with the side road listed first, the main road is still graded first and the join is the same');

  // SWITCHED OFF on the side road: no join, no opening
  p.change('off', (s) => { s.alignments[1].corridor.join = false; });
  const off2 = item(p, 'a2'), off1 = item(p, 'a1');
  ok(!off2.ties && near(secAt(off2, 80).L[0].z, 12.5) && !off2.sections.some((s) => s.tie || s.blend), 'join off on the side road: it is exactly its profile again (12.5 at its end), nothing tied or eased');
  ok(!off1.sections.some((s) => s.open) && near(secAt(off1, 100).L[2].z, 11.89), 'and the main road has no opening');
  const back = Project.fromJSON(JSON.parse(JSON.stringify(p.toJSON()))).project;
  ok(back.state.alignments[1].corridor.join === false && back.state.alignments[0].corridor.join === undefined && !item(back, 'a2').ties, 'saved and opened again: the switch is kept (and absent where it was never turned off)');
  p.undo?.();
}

section('A road that ends at a pad');
{
  const p = site({ pad: true }), g = p.graded(), a2 = item(p, 'a2');
  ok(!g.report.errors.length && g.items.every((x) => !x.problems.length), 'roads and pad grade without a problem', g.items.map((x) => [x.id, x.problems]));
  // The pad: y 78 to 95 at 13.4. The side road starts at y = 80 (in it) and leaves it at y = 78 → station 2. Own centreline at
  // station 2: 13 − 0.5 × 2 / 80 = 12.9875 → raised 0.4125. Blend length: the larger of 10 and 20 × 0.4125 = 8.25 → 10.
  const tie = a2.ties.find((x) => x.kind === 'pad');
  ok(tie && tie.id === 'p1' && tie.end === 'start' && near(tie.from, 0) && near(tie.to, 2, 1e-4) && near(tie.dz, 0.4125, 1e-5) && near(tie.len, 10), 'the join: zone station 0 to 2, raised 0.4125 at the pad\'s edge, eased over 10', tie);
  ok([0, 2].every((s) => { const c = secAt(a2, s); return c?.tie?.kind === 'pad' && [...c.L.slice(0, 3), ...c.R.slice(0, 3)].every((q) => near(q.z, 13.4)); }), 'inside the pad the road is at the pad\'s level across its whole width (13.4)');
  // station 5 is 3 past the zone: u = 0.7, eased 3 × 0.49 − 2 × 0.343 = 0.784; own 13 − 0.5 × 5 / 80 = 12.96875 + 0.784 × 0.4125 = 13.29215
  ok(near(secAt(a2, 5).L[0].z, 13.29215, 1e-4) && near(secAt(a2, 5).blend, 0.784, 1e-4), 'leaving the pad (station 5) the centreline is eased back: 13.2922', secAt(a2, 5).L[0].z);
  // station 15 (13 past the zone, the blend is 10): the profile, 13 − 0.5 × 15 / 80 = 12.90625
  ok(near(secAt(a2, 15).L[0].z, 12.90625), 'past the blend length: the profile (12.9063 at station 15)');
  ok(a2.ties.length === 2 && a2.ties.some((x) => x.kind === 'road'), 'the same road still joins the main road at its other end');
  const sf = g.surface;
  // the pad is flat at 13.4, the road meets it level at its edge (100, 78), and is 13.2922 at station 5 (y = 75)
  ok(near(sf.elevationAt(100, 85), 13.4, 1e-6) && near(sf.elevationAt(100, 78.001), 13.4, 1e-3) && near(sf.elevationAt(100, 75), 13.29215, 1e-4), 'the surface: pad 13.4, the road level with it at its edge, 13.2922 at station 5', [sf.elevationAt(100, 85), sf.elevationAt(100, 78.001), sf.elevationAt(100, 75)]);
  // a pad with corner elevations: a ramp 13 at y = 78 to 14.7 at y = 95 (0.1 per metre). The road in it follows that plane:
  // its start (y = 80) is at 13.2, its section at the pad's edge (y = 78) at 13.0.
  p.change('ramp', (s) => { s.pads[0].pts = [{ x: 90, y: 78, z: 13 }, { x: 110, y: 78, z: 13 }, { x: 110, y: 95, z: 14.7 }, { x: 90, y: 95, z: 14.7 }]; });
  const r2 = item(p, 'a2');
  ok(near(secAt(r2, 0).L[0].z, 13.2, 1e-9) && near(secAt(r2, 0).R[2].z, 13.2, 1e-9) && near(secAt(r2, 2).L[0].z, 13.0, 1e-6), 'a pad with corner elevations: the road follows its plane (13.2 at its start, 13.0 at the pad\'s edge)', [secAt(r2, 0).L[0].z, secAt(r2, 2).L[0].z]);
}

section('Two roads that cross');
{
  const p = new Project(), pts = [];
  let n = 1;
  for (let x = -50; x <= 250; x += 10) for (let y = -100; y <= 150; y += 10) pts.push({ n: String(n++), x, y, z: 10 + 0.01 * x + 0.02 * y, d: '' });
  p.setPoints(pts, 'flat');
  p.change('site', (s) => {
    s.units = 'm';
    s.alignments.push({ id: 'a1', name: 'Main', start: 0, pis: [{ x: 0, y: 0, r: 0 }, { x: 200, y: 0, r: 0 }], pvis: [{ sta: 0, z: 12, L: 0 }, { sta: 200, z: 12, L: 0 }], corridor: { ...ASM } });
    // crosses at (100, 0), its station 60; its profile is level at 12.4 (0.4 above the main crown)
    s.alignments.push({ id: 'a2', name: 'Cross', start: 0, pis: [{ x: 100, y: -60, r: 0 }, { x: 100, y: 60, r: 0 }], pvis: [{ sta: 0, z: 12.4, L: 0 }, { sta: 120, z: 12.4, L: 0 }], corridor: { ...ASM } });
  });
  const g = p.graded(), a1 = item(p, 'a1'), a2 = item(p, 'a2');
  ok(!g.report.errors.length && !a1.problems.length && !a2.problems.length, 'both grade without a problem', [a1.problems, a2.problems]);
  ok(secAt(a1, 100).open?.L && secAt(a1, 100).open?.R && near(secAt(a1, 100).L[2].z, 11.91) && near(secAt(a1, 100).R[2].z, 11.91), 'the through road opens on both sides (11.91 at both shoulder edges)');
  // the zone: the main body, y −4.5 to 4.5 → stations 55.5 to 64.5; at the crossing (station 60) the crossing road is on the main crown, 12
  const tie = a2.ties[0];
  ok(a2.ties.length === 1 && near(tie.from, 55.5, 1e-4) && near(tie.to, 64.5, 1e-4) && near(secAt(a2, 60).L[0].z, 12) && near(secAt(a2, 60).L[1].z, 12), 'the crossing road lies on the through road from 55.5 to 64.5 (12 at the crossing)', tie);
  // both approaches: the difference at the zone edges is 11.91 − 12.4 = −0.49; blend the larger of 10 and 9.8 → 10. Station 50
  // (5.5 before) and station 70 (5.5 after): u = 0.45, eased 3 × 0.2025 − 2 × 0.091125 = 0.42525 → 12.4 − 0.42525 × 0.49 = 12.1916275
  ok(near(secAt(a2, 50).L[0].z, 12.1916275, 1e-6) && near(secAt(a2, 70).L[0].z, 12.1916275, 1e-6) && near(secAt(a2, 40).L[0].z, 12.4), 'both approaches are eased the same (12.1916 at stations 50 and 70), the profile beyond (12.4 at 40)', [secAt(a2, 50).L[0].z, secAt(a2, 70).L[0].z]);
  const sf = g.surface;
  ok(near(sf.elevationAt(100, 0), 12, 1e-6) && near(sf.elevationAt(100, 3.5), 11.93, 1e-6) && near(sf.elevationAt(100, -3.5), 11.93, 1e-6) && near(sf.elevationAt(40, 0), 12, 1e-6), 'the surface keeps the through road\'s crown and lanes across the crossing');
}

section('A later item no longer wipes out the lines it only touches');
{
  // Flat ground at 100 with a ditch line at 95 along y = 50 from x = 0 to 200 (a breakline). A pad 20 × 20 at 100 sits on the
  // ditch at x 90 to 110. The pad's daylight region crosses the ditch line. The ditch must stay a ditch away from the pad:
  // at (20, 50) and (180, 50) the surface is 95. (Before this, a line a region touched was dropped whole: 100 there.)
  const pts = [];
  for (let x = 0; x <= 200; x += 20) for (const y of [0, 20, 40, 60, 80, 100]) pts.push({ x, y, z: 100 });
  const ditch = { name: 'ditch', pts: [{ x: 0, y: 50, z: 95 }, { x: 60, y: 50, z: 95 }, { x: 140, y: 50, z: 95 }, { x: 200, y: 50, z: 95 }] };
  const build = (input) => buildSurface(input), base = build({ points: pts, breaklines: [ditch] }).surface;
  ok(near(base.elevationAt(20, 50), 95) && near(base.elevationAt(100, 50), 95), 'the ground has the ditch (95 along y = 50)');
  const r = gradedSurface(base, pts, [ditch], [{ name: 'Pad', pts: [{ x: 90, y: 40 }, { x: 110, y: 40 }, { x: 110, y: 60 }, { x: 90, y: 60 }], z: 100, cut: 2, fill: 2 }], build);
  ok(r.surface && near(r.surface.elevationAt(100, 50), 100, 1e-6), 'the pad fills the ditch where it sits (100)');
  ok(near(r.surface.elevationAt(20, 50), 95, 1e-6) && near(r.surface.elevationAt(180, 50), 95, 1e-6) && near(r.surface.elevationAt(55, 50), 95, 1e-6), 'the ditch is still a ditch away from the pad (95 at x = 20, 55 and 180)', [r.surface.elevationAt(20, 50), r.surface.elevationAt(55, 50), r.surface.elevationAt(180, 50)]);
}

section('A path that meets a road');
{
  const p = site(), g0 = p.graded(), body = J.bodyOf(item(p, 'a2'));
  // The side road's body is x 95.5 to 104.5. Path 1 runs along y = 40 from x = 60 and ends at x = 97, 1.5 INSIDE the road: it is
  // cut at x = 95.5. There the surface is the road's shoulder edge at station 40: 13 − 0.25 − 0.07 − 0.04 = 12.64.
  const path1 = HS.cleanHardscape([{ id: 'l1', kind: 'path', name: 'Path 1', pts: [{ x: 60, y: 40 }, { x: 97, y: 40 }], width: 1.5 }], 'm')[0];
  const s1 = HS.pathStrip(path1, g0.surface, { roads: [body] });
  ok(s1.runs.length === 1 && near(s1.runs[0].center.at(-1).x, 95.5, 1e-6) && near(s1.runs[0].center.at(-1).z, 12.64, 1e-6), 'a path drawn onto the road stops at its outer edge (x = 95.5) at the shoulder edge\'s level (12.64)', s1.runs.map((r) => r.center.at(-1)));
  // Path 2 crosses the road along y = 30 from x = 140 to x = 80: two pieces, 140 → 104.5 and 95.5 → 80. Shoulder edge at station 50: 12.6875 − 0.11 = 12.5775.
  const path2 = HS.cleanHardscape([{ id: 'l2', kind: 'path', name: 'Path 2', pts: [{ x: 140, y: 30 }, { x: 80, y: 30 }], width: 1.5 }], 'm')[0];
  const s2 = HS.pathStrip(path2, g0.surface, { roads: [body] });
  ok(s2.runs.length === 2 && near(s2.runs[0].center.at(-1).x, 104.5, 1e-6) && near(s2.runs[1].center[0].x, 95.5, 1e-6) && near(s2.runs[0].center.at(-1).z, 12.5775, 1e-6) && near(s2.runs[1].center[0].z, 12.5775, 1e-6), 'a path across the road is two pieces, each ending on a shoulder edge (12.5775)', s2.runs.map((r) => [r.center[0].x, r.center.at(-1).x]));
  // Path 3 stops at x = 93.5, 2 SHORT of the road (twice its width 1.5 = 3 reach): carried on to x = 95.5
  const path3 = HS.cleanHardscape([{ id: 'l3', kind: 'path', name: 'Path 3', pts: [{ x: 60, y: 20 }, { x: 93.5, y: 20 }], width: 1.5 }], 'm')[0];
  const s3 = HS.pathStrip(path3, g0.surface, { roads: [body] });
  ok(s3.runs.length === 1 && near(s3.runs[0].center.at(-1).x, 95.5, 1e-6) && near(s3.length, 35.5, 1e-6), 'an end 2 short of the road is carried on to its edge', s3.runs[0]?.center.at(-1));
  // … and one 4 short is left where it was drawn
  const path4 = { ...path3, pts: [{ x: 60, y: 20 }, { x: 91.5, y: 20 }] };
  ok(near(HS.pathStrip(path4, g0.surface, { roads: [body] }).runs[0].center.at(-1).x, 91.5, 1e-9), 'an end 4 short is left as drawn');
  // without roads: exactly what it was (one strip through, same points as before)
  const plain = HS.pathStrip(path2, g0.surface);
  ok(plain.runs.length === 1 && plain.left.length === plain.runs[0].left.length && near(plain.center.at(-1).x, 80), 'without roads the strip is the whole line, as before');

  // IN THE PROJECT: the paths are graded in pieces and the road under them keeps its shape
  p.change('paths', (s) => { s.landscape = PL.emptyLandscape(); s.landscape.hardscape = [path1, path2]; });
  const g = p.graded(), lp = g.items.filter((x) => x.id === 'l1' || x.id === 'l2');
  ok(!g.report.errors.length && lp.length === 2 && lp.every((x) => !x.problems.length) && lp[0].pieces === 1 && lp[1].pieces === 2, 'both paths are graded in: one piece, and two pieces for the one that crosses', lp.map((x) => [x.id, x.problems, x.pieces]));
  // the side road's crown under the crossing path (station 50): 13 − 0.5 × 50 / 80 = 12.6875, its edge of pavement 12.6175
  ok(near(g.surface.elevationAt(100, 30), 12.6875, 1e-6) && near(g.surface.elevationAt(103.5, 30), 12.6175, 1e-6) && near(g.surface.elevationAt(96.5, 40), 12.68, 1e-6), 'the road keeps its crown and edges under the paths (12.6875 / 12.6175)', [g.surface.elevationAt(100, 30), g.surface.elevationAt(103.5, 30)]);
  ok(g.regions.filter(Boolean).length === g.items.length + 1, 'the second piece\'s region is counted with the others (volumes, sections)', [g.regions.filter(Boolean).length, g.items.length]);

  // IN 3D
  const sc = S3.buildSite3D(S3.siteInput(p), { exag: 1 });
  const hard = sc.meshes.find((m) => m.key === 'hardscape'), rd = sc.meshes.find((m) => m.key === 'road');
  ok(hard && rd, 'the 3D scene has the roads and the paths');
  const ox = sc.origin.x, oy = sc.origin.y;
  const xs = (m) => { const o = []; for (let i = 0; i < m.positions.length; i += 3) o.push([m.positions[i] + ox, m.positions[i + 1] + oy]); return o; };
  // no path vertex inside the side road's body (x 95.5 to 104.5; the strips are 0.75 either side of y = 30 and y = 40)
  ok(!xs(hard).some(([x]) => x > 95.5 + 1e-3 && x < 104.5 - 1e-3), 'no part of a path is drawn over the road');
  // the road mesh, by triangle: colour at a point = the colour of the triangle over it
  const colAt = (x, y) => {
    const P = rd.positions, C = rd.colors, I = rd.indices;
    for (let t = 0; t < I.length; t += 3) {
      const a = I[t], b = I[t + 1], c = I[t + 2], ax = P[3 * a] + ox, ay = P[3 * a + 1] + oy, bx = P[3 * b] + ox, by = P[3 * b + 1] + oy, cx = P[3 * c] + ox, cy = P[3 * c + 1] + oy;
      const d = (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
      if (Math.abs(d) < 1e-9) continue;
      const u = ((x - ax) * (cy - ay) - (y - ay) * (cx - ax)) / d, v = ((bx - ax) * (y - ay) - (by - ay) * (x - ax)) / d;
      if (u >= -1e-6 && v >= -1e-6 && u + v <= 1 + 1e-6) return [C[3 * a], C[3 * a + 1], C[3 * a + 2]].map((k) => k.toFixed(3)).join();
    }
    return null;
  };
  const asphalt = colAt(60, 1), shoulder = colAt(60, 4);
  ok(asphalt && shoulder && asphalt !== shoulder, 'away from the junction the main road\'s shoulder is drawn as a shoulder');
  ok(colAt(100, 4) === asphalt && colAt(98, 4.2) === asphalt && colAt(100, -4) === shoulder, 'across the mouth the main road\'s shoulder is drawn as pavement; the far side is still a shoulder', [colAt(100, 4), colAt(100, -4)]);
  // the side road is not drawn where it lies on the main road: the triangle over (100, 2) is the main road's (found once), and
  // the side road's own strip reaches the main road's edge and stops (a triangle at (100, 5), none of its own past y = 4.5)
  const owners = (x, y) => { const P = rd.positions, I = rd.indices, o = new Set(); for (let t = 0; t < I.length; t += 3) { const a = I[t], b = I[t + 1], c = I[t + 2], ax = P[3 * a] + ox, ay = P[3 * a + 1] + oy, bx = P[3 * b] + ox, by = P[3 * b + 1] + oy, cx = P[3 * c] + ox, cy = P[3 * c + 1] + oy, d = (bx - ax) * (cy - ay) - (by - ay) * (cx - ax); if (Math.abs(d) < 1e-9) continue; const u = ((x - ax) * (cy - ay) - (y - ay) * (cx - ax)) / d, v = ((bx - ax) * (y - ay) - (by - ay) * (x - ax)) / d; if (u >= 1e-6 && v >= 1e-6 && u + v <= 1 - 1e-6) o.add(rd.owners?.[rd.triOwner?.[t / 3]]?.id); } return [...o]; };
  ok(owners(100.5, 2).join() === 'a1' && owners(100.5, 6).join() === 'a2', 'where the side road lies on the main road only the main road is drawn; before it, the side road', [owners(100.5, 2), owners(100.5, 6)]);
}

section('With no existing ground (the stand-in view)');
{
  const p = site({ ground: false, pad: true }), st = p.standInCorridors();
  const a2 = st.find((x) => x.id === 'a2'), a1 = st.find((x) => x.id === 'a1');
  ok(st.length === 2 && !a1.problems.length && !a2.problems.length && a1.warnings.length === 1, 'both roads still build on the stand-in ground, with their warning', st.map((x) => [x.id, x.problems]));
  ok(near(a2.sections.find((s) => Math.abs(s.sta - 80) < 1e-4).L[0].z, 12) && a1.sections.some((s) => s.open?.L), 'the junction is made there too (the side road ends on the main crown, the main road opens)');
  const sc = S3.buildSite3D(S3.siteInput(p), { exag: 1 });
  ok(sc.meshes.some((m) => m.key === 'road'), 'and the 3D scene builds');
}

section('In feet, and with the urban preset');
{
  const p = new Project(), pts = [];
  let n = 1;
  for (let x = -100; x <= 700; x += 25) for (let y = -300; y <= 400; y += 25) pts.push({ n: String(n++), x, y, z: 100, d: '' });
  p.setPoints(pts, 'flat');
  const P = (type, o) => ({ type, ...o });
  // each side: two 12 ft lanes at 2%, a 2 ft gutter at 8%, a 0.5 ft curb (0.5 wide), a 5 ft strip and a 5 ft walk at −2%
  const urban = () => [P('lane', { w: 12, slope: 0.02 }), P('lane', { w: 12, slope: 0.02 }), P('gutter', { w: 2, slope: 0.08 }), P('curb', { h: 0.5, w: 0.5, drop: 0 }), P('strip', { w: 5, slope: -0.02 }), P('walk', { w: 5, slope: -0.02 }), P('daylight', { cut: 2, fill: 3 })];
  const asm = { on: true, lane: 12, laneSlope: 0.02, shoulder: 4, shoulderSlope: 0.04, cut: 2, fill: 3, step: 25, parts: { L: urban(), R: urban() } };
  p.change('site', (s) => {
    s.alignments.push({ id: 'a1', name: 'Main', start: 0, pis: [{ x: 0, y: 0, r: 0 }, { x: 600, y: 0, r: 0 }], pvis: [{ sta: 0, z: 101, L: 0 }, { sta: 600, z: 101, L: 0 }], corridor: JSON.parse(JSON.stringify(asm)) });
    s.alignments.push({ id: 'a2', name: 'Side', start: 0, pis: [{ x: 300, y: 300, r: 0 }, { x: 300, y: 0, r: 0 }], pvis: [{ sta: 0, z: 102, L: 0 }, { sta: 300, z: 102, L: 0 }], corridor: JSON.parse(JSON.stringify(asm)) });
  });
  const g = p.graded(), a1 = item(p, 'a1'), a2 = item(p, 'a2');
  ok(!g.report.errors.length && !a1.problems.length && !a2.problems.length, 'both grade without a problem', [a1.problems, a2.problems]);
  // pavement = 12 + 12 + 2 + 0.5 = 26.5 → the mouth is main stations 273.5 to 326.5. In it everything past the edge of pavement
  // (24 out, at 101 − 0.48 = 100.52) lies on the lane's 2%: no curb standing across the mouth. The back of the walk is
  // 24 + 2 + 0.01 + 0.5 + 5 + 5 = 36.51 out → 100.52 − 12.51 × 0.02 = 100.2698. Elsewhere it is 100.52 − 0.16 (gutter) + 0.5 (curb)
  // + 0.1 (strip rising at 2%) + 0.1 (walk) = 101.06.
  const m = secAt(a1, 300), dL = m.det.L, away = secAt(a1, 200).det.L;
  ok(near(a1.sections.find((s) => s.open?.L).sta, 273.5, 1e-4) && near(m.L[1].z, 100.52) && dL.slice(0, -1).every((q, k) => !k || near(q.z, 101 - Math.hypot(q.x - 300, q.y) * 0.02, 1e-9)), 'across the mouth the gutter, curb, strip and walk all lie on the lane\'s 2% (no curb in the way)', dL.map((q) => [q.code, +q.z.toFixed(4)]));
  ok(near(dL[dL.length - 2].z, 100.2698, 1e-4) && near(away[away.length - 2].z, 101.06, 1e-6) && dL.filter((q) => q.open).length === 5, 'the back of the walk: 100.2698 in the mouth, 101.06 elsewhere; five points marked open (gutter, curb top and back, strip, walk)', [dL[dL.length - 2].z, away[away.length - 2].z]);
  // the side road ends on the main crown (101) and is level with the main road's opened edge where it enters its body (station 300 − 36.51 = 263.49: 100.2698)
  ok(near(secAt(a2, 300).det.L[0].z, 101) && near(secAt(a2, 263.49).det.L[0].z, 100.2698, 1e-4), 'the side road enters level with the opened edge (100.2698) and ends on the main crown (101)', a2.ties);
  ok(near(g.surface.elevationAt(300, 30), 101 - 0.6, 1e-6), 'the surface in the mouth, 30 ft out: 101 − 30 × 0.02 = 100.4', g.surface.elevationAt(300, 30));
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
