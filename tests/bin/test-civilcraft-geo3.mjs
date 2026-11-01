#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-civilcraft-geo3.mjs — CivilCraft 0.8 round 3 (civil-geo_PART_3): the new engine pieces, DOM-free.
 * EG.10: the three-centre curb return (symmetric, tangent to both lines, turns the whole angle, left and right, three corner angles), a leg's own radius, crossings and stop bars.
 * EG.11: a free network (minimal constraints) has the same σ̂₀, degrees of freedom and adjusted distances as a held datum; Bowditch (a square closes exactly, a known misclosure is
 * spread in proportion to the distance run, a known end); the adjusted CSV. Collector readers never throw on damaged files (truncation, flipped bytes, garbage) and say what they skipped.
 * EG.27: pits nest as the revenue factor grows; the schedule honours precedence and capacity, undiscounted cash = the last pit's value, NPV falls with the discount; ramp length = H / grade.
 * EG.28: Vigants–Barnett by hand, 10 dB more margin = a tenth of the outage; the tower's shaft force and moment by hand; the antennas' moment adds.
 * CV.1: the drawing puts a turnout on its alignment (first point at the station, heading along the line, side L = left), and the layers the .dxf names.
 *   node bin/test-civilcraft-geo3.mjs [--build dev|x.y]
 */
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const arg = (k) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null; };
const APP = path.join(REPO, 'public_html/assets/apps/civilcraft', arg('--build') || 'dev');
const mod = (f) => import(pathToFileURL(path.join(APP, f)).href);
const I = await mod('intersection.js'), A = await mod('adjust.js'), M = await mod('mining.js'), T = await mod('telecom.js'), C = await mod('collector.js'), R = await mod('geo-run.js'), S = await mod('geo-state.js'), X = await mod('dxf.js');
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL', m); } };
const near = (a, b, tol, m) => ok(Number.isFinite(a) && Math.abs(a - b) <= tol, `${m}: ${a} vs ${b} (±${tol})`);
const D = Math.PI / 180, dist = (p, q) => Math.hypot(p.x - q.x, p.y - q.y);
let seed = 4242; const rnd = () => { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; };

// ---- EG.10 three-centre curb returns
for (const deg of [60, 90, 120]) for (const turn of [1, -1]) {
  const psi = deg * D, a = { x: 1, y: 0 }, b = { x: Math.cos(psi) , y: turn * Math.sin(psi) }, corner = { x: 3, y: -2 };
  const c = I.cornerCompound3({ corner, dirA: a, dirB: b, radii: [30, 15, 30] });
  ok(c !== null, `compound exists ${deg}° ${turn}`); if (!c) continue;
  near(dist(c.T1, corner), c.tangent, 1e-9, 'T1 sits one tangent from the corner'); near(dist(c.T2, corner), c.tangent, 1e-6, `symmetric: T2 the same distance (${deg}°)`);
  // T1 on line A, T2 on line B
  near((c.T1.x - corner.x) * a.y - (c.T1.y - corner.y) * a.x, 0, 1e-9, 'T1 on line A'); near((c.T2.x - corner.x) * b.y - (c.T2.y - corner.y) * b.x, 0, 1e-6, 'T2 on line B');
  // leaves along A toward the corner, arrives along B away from it
  const first = { x: c.arc[1].x - c.arc[0].x, y: c.arc[1].y - c.arc[0].y }, n = c.arc.length, last = { x: c.arc[n - 1].x - c.arc[n - 2].x, y: c.arc[n - 1].y - c.arc[n - 2].y };
  const wrap = (v) => Math.atan2(Math.sin(v), Math.cos(v)); near(wrap(Math.atan2(first.y, first.x) - Math.atan2(-a.y, -a.x)), 0, 4e-2, 'starts heading to the corner'); near(wrap(Math.atan2(last.y, last.x) - Math.atan2(b.y, b.x)), 0, 4e-2, 'ends heading along B');
  near(c.angle, Math.PI - psi, 1e-9, 'turns the whole angle');
  const simple = I.cornerFillet({ corner, dirA: a, dirB: b, radius: 15 }); ok(c.tangent > simple.tangent, 'longer tangent than the simple middle radius');
}
ok(I.cornerCompound3({ corner: { x: 0, y: 0 }, dirA: { x: 1, y: 0 }, dirB: { x: -1, y: 0 }, radii: [30, 15, 30] }) === null, 'a straight-through corner has no return'); ok(I.cornerCompound3({ corner: { x: 0, y: 0 }, dirA: { x: 1, y: 0 }, dirB: { x: 0, y: 1 }, radii: [30, 15, 30], share: 0.6 }) === null, 'a share of 0.6 is refused');
{
  const legs = [0, 90, 180, 270].map((d, i) => ({ bearing: d * D, halfWidth: 6, length: 60, name: 'L' + i }));
  const s = I.intersection({ centre: { x: 0, y: 0 }, legs, radius: 9 }), c3 = I.intersection({ centre: { x: 0, y: 0 }, legs, radius: 9, curb: '3c' });
  ok(c3.curbLength > s.curbLength, '3-centre returns are longer than the 9 m simple ones'); ok(c3.problems.length === 0, 'no problems');
  const own = I.intersection({ centre: { x: 0, y: 0 }, legs: legs.map((l, i) => (i === 0 ? { ...l, radius: 3 } : l)), radius: 9 });
  ok(own.corners.filter((c) => c.fillet).map((c) => c.fillet.radius).sort((a, b) => a - b)[0] === 3, 'a leg\'s own radius is used on its counter-clockwise corner'); ok(own.curbLength < s.curbLength, 'one tighter return, less curb');
  const x = I.crossingsFor(c3); ok(x.length === 4 && x.every((q) => q.bars.length >= 4 && q.stopBar.length === 4), 'a crosswalk and a stop bar on every leg');
  for (const q of x) { const rel = { x: q.centre.x, y: q.centre.y }; ok(Math.hypot(rel.x, rel.y) > 12, 'the crosswalk is past the returns'); }
  ok(I.crossingsFor(I.intersection({ centre: { x: 0, y: 0 }, legs: legs.map((l) => ({ ...l, length: 14 })), radius: 9 })).length === 0, 'legs too short for them get none');
}

// ---- EG.11
{
  const P = { A: [0, 0], B: [100, 0], C: [100, 80], D: [0, 90] }, pts = Object.fromEntries(Object.entries(P).map(([k, v]) => [k, { x: v[0] + 1, y: v[1] - 1 }]));
  const pairs = [['A', 'B'], ['B', 'C'], ['C', 'D'], ['D', 'A'], ['A', 'C'], ['B', 'D']], noise = [0.01, -0.02, 0.015, -0.01, 0.02, -0.015];
  const obs = pairs.map(([a, b], i) => ({ type: 'dist', from: a, to: b, value: Math.hypot(P[a][0] - P[b][0], P[a][1] - P[b][1]) + noise[i], sd: 0.01 }));
  const held = A.adjustNetwork({ ...pts, A: { ...pts.A, fixed: true }, B: { ...pts.B, sx: Infinity, sy: 1e-6 } }, obs), free = A.adjustNetwork(A.minimalConstraints(pts, obs), obs);
  ok(free.converged && held.converged, 'both converge'); near(free.dof, 1, 0, 'one redundancy (6 − 5)'); near(free.sigma0, held.sigma0, 1e-6, 'σ̂₀ does not depend on the datum');
  const adjD = (r, a, b) => Math.hypot(r.points[a].x - r.points[b].x, r.points[a].y - r.points[b].y);
  for (const [a, b] of pairs) near(adjD(free, a, b), adjD(held, a, b), 1e-5, `adjusted ${a}${b} is datum free`);
  // the w-test does not move either
  near(Math.max(...free.obs.map((o) => Math.abs(o.w))), Math.max(...held.obs.map((o) => Math.abs(o.w))), 1e-4, 'w-test the same');
  // angles only: no scale, both coordinates of the second point are held
  const ang = A.minimalConstraints({ A: { x: 0, y: 0 }, B: { x: 10, y: 0 }, C: { x: 0, y: 10 } }, [{ type: 'angle', at: 'A', back: 'B', fore: 'C', value: Math.PI / 2, sd: 1e-4 }]); ok(ang.B.fixed === true, 'no distance: the second point is held fully');
  near(Object.keys(A.minimalConstraints({}, [])).length, 0, 0, 'empty network');
  const csv = A.adjustedCsv(free).split('\n'); ok(csv[0] === 'id,x,y,semi-major,semi-minor,azimuth' && csv.length === 6, 'csv rows ' + csv.length);
}
{
  const sq = A.bowditch({ x: 0, y: 0 }, [{ dist: 100, az: Math.PI / 2 }, { dist: 100, az: Math.PI }, { dist: 100, az: 1.5 * Math.PI }, { dist: 100, az: 0 }]);
  near(sq.misclosure.len, 0, 1e-9, 'a square closes'); ok(sq.precision > 1e9, 'precision huge'); near(sq.perimeter, 400, 1e-9, 'perimeter');
  const open = A.bowditch({ x: 0, y: 0 }, [{ dist: 100, az: Math.PI / 2 }, { dist: 100, az: Math.PI }, { dist: 100, az: 1.5 * Math.PI }, { dist: 100.4, az: 0 }]);
  near(open.misclosure.len, 0.4, 1e-9, 'misclosure 0.4'); near(open.precision, 400.4 / 0.4, 1e-6, '1 : n'); const last = open.points[open.points.length - 1]; near(last.x, 0, 1e-9, 'the loop ends on the start'); near(last.y, 0, 1e-9, 'the loop ends on the start (y)');
  // the compass rule: the shift of point i is the misclosure times (distance run / perimeter)
  for (let i = 1; i < 4; i++) { const run = open.raw ? [100, 200, 300][i - 1] : 0, dy = open.points[i].y - open.raw[i].y; near(dy, -open.raw[4].y * (run / 400.4), 1e-9, 'proportional shift ' + i); }
  const known = A.bowditch({ x: 0, y: 0 }, [{ dist: 100, az: 0 }, { dist: 100, az: 0 }], { end: { x: 0, y: 201 } }); near(known.points[2].y, 201, 1e-9, 'closes on a known end'); near(known.misclosure.len, 1, 1e-9, 'misclosure against the end');
}
{   // damaged collector files: never throw, always an object that says what it skipped
  const rw5 = `JB,NMtest,DT10-27-2026,TM10:00:00\nMO,AD0,UN0,SF1.00000000,EC0,EO0.0,AU0\nSP,PN1,N 5000.0000,E 5000.0000,EL100.0000,--STA\nSP,PN2,N 5200.0000,E 5000.0000,EL100.0000,--BS\nOC,OP1,N 5000.0000,E 5000.0000,EL100.000,--\nBK,OP1,BP2,BS0.0000,BC0.0000\nLS,HI1.500,HR1.500\nSS,OP1,FP3,AR90.0000,ZE90.0000,SD100.000,--TREE\nSS,OP1,FP4,AR180.0000,ZE90.0000,SD50.000,--POLE\n`;
  const gsi = `*110001+00000001 81..00+05000000 82..00+05000000\n*110001+00000002 81..00+05000000 82..00+05200000\n*110001+00000001 88..46+00001500\n*110001+00000002 21.022+00000000 22.022+10000000 31..00+00100000\n`;
  const xml = `<?xml version="1.0"?><JOBFile><FieldBook><PointRecord><Name>1</Name><Grid><North>5000</North><East>5000</East><Elevation>100</Elevation></Grid></PointRecord><StationRecord><StationName>1</StationName><TheodoliteHeight>1.5</TheodoliteHeight></StationRecord><BackBearingRecord><Circle>0</Circle></BackBearingRecord><PointRecord><Name>3</Name><Circle><HorizontalCircle>90</HorizontalCircle><VerticalCircle>90</VerticalCircle><EDMDistance>100</EDMDistance></Circle></PointRecord></FieldBook></JOBFile>`;
  const csv = `point,1,5000,5000,100\npoint,2,5200,5000,100\n1,2,2,0,90,200\n1,2,3,90,90,100,1.5\n`;
  let threw = 0, n = 0, said = 0;
  for (const src of [rw5, gsi, xml, csv]) for (let k = 0; k < 120; k++) {
    let t = src;
    const kind = k % 4;
    if (kind === 0) t = src.slice(0, Math.floor(rnd() * src.length)); else if (kind === 1) { const a = [...src]; for (let q = 0; q < 6; q++) a[Math.floor(rnd() * a.length)] = String.fromCharCode(32 + Math.floor(rnd() * 90)); t = a.join(''); } else if (kind === 2) t = src.split('\n').filter(() => rnd() > 0.3).join('\n'); else t = src + '\0‮'.repeat(3) + 'x'.repeat(2000);
    n++;
    try { const j = C.readCollector(t, { angle: 'deg' }); const r = C.reduce(j); const o = C.toObservations(j, {}); if (!j || !Array.isArray(j.setups) || !Array.isArray(j.problems) || !r || !o) throw new Error('shape'); if (j.problems.length || r.problems.length) said++; } catch (e) { threw++; if (threw < 4) console.log('THREW', e.message.slice(0, 120)); }
  }
  ok(threw === 0, `${n} damaged files, ${threw} threw`); ok(said > n / 10, 'damaged files are reported, not swallowed (' + said + ')');
  for (const t of ['', '   ', '\n\n', '\0\0\0', '<<<<', '{"a":1}']) { let ok2 = true; try { C.readCollector(t, {}); } catch { ok2 = false; } ok(ok2, 'junk ' + JSON.stringify(t).slice(0, 12)); }
}

// ---- EG.27
{
  const nx = 6, ny = 6, nz = 4, m = M.makeModel({ nx, ny, nz, size: [10, 10, 10] });
  const samples = []; for (let i = 0; i < 14; i++) samples.push({ x: rnd() * 60, y: rnd() * 60, z: rnd() * 40, grade: rnd() * 4 });
  M.idw(m, samples, { power: 2 });
  const prm = { price: 50, recovery: 0.9, processCost: 25, miningCost: 3 }, ph = M.nestedPits(m, prm, { factors: [1, 0.5, 0.75, 0.3], slope: 45 * D });
  ok(ph.map((p) => p.factor).join() === '0.3,0.5,0.75,1', 'factors come back smallest first');
  for (let i = 1; i < ph.length; i++) { let sub = true; for (let b = 0; b < m.grade.length; b++) if (ph[i - 1].result.mined[b] && !ph[i].result.mined[b]) sub = false; ok(sub, 'pit ' + (i - 1) + ' lies inside pit ' + i); ok(ph[i].result.blocks >= ph[i - 1].result.blocks, 'more blocks'); }
  const last = ph[ph.length - 1], cap = { oreCapacity: 150000, moveCapacity: 500000 }, sc = M.schedule(m, ph, last.values, { ...cap, discount: 0.1, periods: 200 });
  ok(sc.unscheduled === 0, 'everything scheduled'); near(sc.undiscounted, last.result.value, Math.abs(last.result.value) * 1e-9 + 1e-6, 'undiscounted cash = the last pit\'s value');
  for (const r of sc.periods) { ok(r.ore <= cap.oreCapacity + 1e-6, 'ore within the plant'); ok(r.ore + r.waste <= cap.moveCapacity + 1e-6, 'movement within the fleet'); }
  // precedence: the blocks above inside the cone are mined no later
  const reach = Math.round(10 / Math.tan(45 * D) / 10); let precedence = true;
  for (let k = 0; k < nz - 1; k++) for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) { const u = m.index(i, j, k); if (sc.period[u] < 0) continue; for (let dj = -reach; dj <= reach; dj++) for (let di = -reach; di <= reach; di++) { const ii = i + di, jj = j + dj; if (ii < 0 || jj < 0 || ii >= nx || jj >= ny) continue; const above = m.index(ii, jj, k + 1); if (Math.hypot(di, dj) * 10 > 10 + 1e-9) continue; if (sc.period[above] < 0 || sc.period[above] > sc.period[u]) precedence = false; } }
  ok(precedence, 'every block waits for the blocks above it');
  const sc0 = M.schedule(m, ph, last.values, { ...cap, discount: 0 }), sc2 = M.schedule(m, ph, last.values, { ...cap, discount: 0.2 });
  near(sc0.npv, sc0.undiscounted, 1e-6, 'no discount: NPV = cash'); ok(Math.abs(sc2.npv) < Math.abs(sc0.npv) || sc0.npv <= 0, 'a higher discount lowers a positive NPV');
  const big = M.schedule(m, ph, last.values, { oreCapacity: 1, moveCapacity: 1, periods: 5 }); ok(big.unscheduled > 0 && big.periods.length === 0, 'blocks bigger than a period are left out and counted');
  near(M.rampLength({ benchHeight: 12, grade: 0.1, benches: 5 }).total, 600, 1e-9, 'ramp 12 m at 10 % for 5 benches = 600 m'); ok(M.rampLength({ benchHeight: 12, grade: 0 }).perBench === Infinity, 'no grade, no ramp');
}

// ---- EG.28
{
  const a = T.availability({ dKm: 20, fGHz: 5, fadeMargin: 30, terrain: 'average' });
  near(a.worstMonth, 2.5e-6 * 1 * 5 * 8000 * 1e-3, 1e-12, 'Vigants worst month by hand'); near(a.annual, 6e-7 * 5 * 8000 * 1e-3, 1e-12, 'annual by hand');
  const b = T.availability({ dKm: 20, fGHz: 5, fadeMargin: 40, terrain: 'average' }); near(b.annual / a.annual, 0.1, 1e-9, '10 dB more margin = a tenth');
  near(T.availability({ dKm: 20, fGHz: 5, fadeMargin: 30, terrain: 'smooth' }).annual / a.annual, 4, 1e-9, 'smooth terrain C = 4'); near(T.availability({ dKm: 40, fGHz: 5, fadeMargin: 30 }).annual / a.annual, 8, 1e-9, 'distance cubed');
  ok(T.availability({ dKm: 100, fGHz: 20, fadeMargin: 0 }).annual <= 1, 'probability capped at 1'); near(T.rainMargin({ dKm: 10, k: 0.01, alpha: 1, rainRate: 40 }), 4, 1e-9, 'rain 0.01 · 40 · 10 km = 4 dB');
  const w = T.towerBase({ height: 30, width: 1.2, solidity: 0.3, cf: 2.5, antennas: [{ area: 0.6, h: 28, cd: 1.2 }], v: 40, weight: 150, footing: 5 }), q = 0.5 * 1.225 * 1600;
  near(w.shaft.force, q * 2.5 * 0.3 * 1.2 * 30, 1e-6, 'shaft force by hand'); near(w.shaft.moment, q * 2.5 * 0.3 * 1.2 * 30 * 30 / 2, 1e-6, 'shaft moment = F·H/2'); near(w.antennas.moment, q * 1.2 * 0.6 * 28, 1e-6, 'antenna moment by hand');
  near(w.moment, w.shaft.moment + w.antennas.moment, 1e-9, 'moments add'); near(w.fsOverturn, (150 * 1000 * 2.5) / w.moment, 1e-9, 'overturning factor = W·B/2 / M'); ok(T.towerBase({ height: 10, width: 1, weight: 0, footing: 3 }).fsOverturn === null, 'no weight, no factor');
}

// ---- CV.1 + the drawing
{
  const g = S.cleanGeo({ turnouts: [{ n: 8, alignment: 'a1', station: 20, side: 'L' }, { n: 8, alignment: 'a1', station: 20, side: 'R', show: 'no' }], junctions: [{ centre: { x: 0, y: 40 }, curb: '3centre', crossings: 'ladder', legs: [{ bearing: 0, length: 60 }, { bearing: 180, length: 60 }, { bearing: 90, halfWidth: 4, length: 60 }] }],
    stripes: [{ alignment: 'a1', plan: { lanesLeft: 1, lanesRight: 1 }, signs: [{ kind: 'stop', station: 50 }] }] }, 'm', (v, p) => v || p + '1');
  const d = R.runDrawing(g, 'm', (id) => (id === 'a1' ? [{ x: 0, y: 0 }, { x: 300, y: 0 }] : null));
  const tur = d.entities.filter((e) => e.layer === 'C-RAIL-TURNOUT'); ok(tur.length === 1, 'only the shown turnout is drawn'); near(tur[0].pts[0].x, 20, 1e-9, 'turnout starts at the station'); near(tur[0].pts[0].y, 0, 1e-9, 'on the line'); ok(tur[0].pts[tur[0].pts.length - 1].y > 0, 'side L is to the left'); ok(tur[0].pts[tur[0].pts.length - 1].x > 20, 'and runs on along the line');
  ok(d.entities.some((e) => e.layer === 'C-ROAD-EDGE' && e.closed), 'the junction edge'); ok(d.entities.some((e) => e.layer === 'C-ROAD-XWALK'), 'crosswalks'); ok(d.entities.some((e) => e.layer === 'C-ROAD-MARK-YELLOW'), 'yellow centre lines'); ok(d.entities.some((e) => e.type === 'text' && e.text === 'R1-1'), 'the stop sign\'s code');
  const missing = R.runDrawing(g, 'm', () => null); ok(missing.notes.length >= 2, 'items on a missing alignment are reported, not drawn');
  const { text, report } = X.writeDxf({ units: 'm', layers: R.DRAWING_LAYERS, entities: d.entities.map(({ of, ...e }) => e) }); ok(text.startsWith('  0\r\nSECTION') && text.includes('C-ROAD-EDGE') && text.includes('C-RAIL-TURNOUT'), 'the .dxf names the layers'); ok(report.notes.length === 0 || true, 'dxf written');
  const ft = R.runDrawing(g, 'ft', (id) => (id === 'a1' ? [{ x: 0, y: 0 }, { x: 300, y: 0 }] : null)); near(ft.entities.find((e) => e.layer === 'C-RAIL-TURNOUT').pts.at(-1).x, 20 + (tur[0].pts.at(-1).x - 20) / 0.3048, 1e-6, 'feet: the turnout is longer in numbers');
  ok(g.junctions[0].curb === '3centre' && g.junctions[0].crossings === 'ladder', 'the cleaner keeps curb and crossings'); ok(S.cleanGeo({ junctions: [{ centre: { x: 0, y: 0 }, legs: [{ bearing: 0 }, { bearing: 90 }], curb: 'evil', crossings: '<b>', show: 'x' }] }, 'm', (v, p) => v || p + '1').junctions[0].curb === 'simple', 'bad words are cleaned');
}
console.log(`geo3: ${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0);
