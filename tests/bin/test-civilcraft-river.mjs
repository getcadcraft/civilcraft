#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-civilcraft-river.mjs — CivilCraft 0.8 SU.957: sections from the terrain (terrain-section.js), the river model
 * (river.js), the standard-step solver (river-solve.js), the flood extent (river-extent.js) and the report
 * (river-report.js), DOM-free, in Node. Known answers:
 *
 *   - terrain-section: a plane gives back the plane at every point; the cut has a point at EVERY triangle-edge crossing
 *     (counted by brute force over all edges) and nothing between (the midpoint of each piece lies on the TIN); a line that
 *     leaves the TIN splits into runs; left/right signs.
 *   - Manning normal depth: a prismatic rectangular channel started at normal depth stays at it (to 1e-4) for 20 sections;
 *     started 1 m high it falls toward it (an M1 curve) monotonically. Normal depth checked against Q = (1/n)·A·R^(2/3)·√S
 *     solved by bisection here, independently of the program.
 *   - Critical depth in a rectangular channel: yc = (q²/g)^(1/3), SI and US units.
 *   - Textbook: Chow, V. T. (1959), Open-Channel Hydraulics, McGraw-Hill, ch. 10, Examples 10-1 / 10-2 (direct step and
 *     standard step): trapezoidal channel, bottom 20 ft, side slopes 2:1, S0 0.0016, n 0.025, Q 400 cfs, α 1.10, a dam
 *     holding 5 ft of water; the book gives yn = 3.36 ft and yc = 2.22 ft, and the profile runs up to 1 % above yn. The
 *     profile is checked against the gradually varied flow equation dx/dy = (1 − αQ²T/gA³)/(S0 − Sf) integrated here by RK4
 *     in 0.0005 ft steps (the direct step method in the limit), not against numbers typed from the book.
 *   - Conveyance by subdivision of a compound section by hand (areas, wetted perimeters incl. the end walls, K per piece,
 *     α); composite n of a channel with two roughnesses.
 *   - Energy balance closes at every section of a run (WS + hv = WS↓ + hv↓ + L·Sf + C·|Δhv|), with the contraction
 *     coefficient where the flow speeds up downstream and the expansion one where it slows.
 *   - Supercritical (S2): critical at the top of a steep channel, then down to normal depth; mixed: steep then mild flags a
 *     jump; a subcritical run on a steep channel is held at critical and flagged.
 *   - Flow changes, untrusted project data, sections cut along a TIN valley (reach lengths, left to right looking
 *     downstream), normal depth in a V valley, the flood extent of a level water surface over a V valley (area and
 *     waterline exact), and the report's review line.
 *
 *   node bin/test-civilcraft-river.mjs [--build dev|x.y] [--verbose]
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
const EN = JSON.parse(fs.readFileSync(path.join(APP, 'lang/en.json'), 'utf8'));
I18N.init({ strings: EN });
const TS = await mod('terrain-section.js');
const RV = await mod('river.js');
const SV = await mod('river-solve.js');
const EX = await mod('river-extent.js');
const TIN = await mod('tin.js');
const PR = await mod('problems-river.js');
let RP = null;
try { RP = await mod('river-report.js'); } catch { /* step 4 */ }

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; if (VERBOSE) console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };
const near = (a, b, tol, m) => ok(Number.isFinite(a) && Math.abs(a - b) <= tol, `${m} (${a} vs ${b}, ±${tol})`);
const section = (s) => console.log('\n== ' + s);

function gridTin(fz, { x0, x1, y0, y1, step }) {
  const pts = [];
  let n = 1;
  for (let x = x0; x <= x1 + 1e-9; x += step) for (let y = y0; y <= y1 + 1e-9; y += step) pts.push({ n: String(n++), x, y, z: fz(x, y) });
  return TIN.buildSurface({ points: pts }).surface;
}

// ---------------------------------------------------------------------------
section('terrain-section: a polyline over a TIN');
{
  const plane = (x, y) => 100 + 0.01 * x + 0.02 * y;
  const sf = gridTin(plane, { x0: 0, x1: 100, y0: 0, y1: 100, step: 10 });
  const line = [{ x: 5, y: 7 }, { x: 63, y: 41 }, { x: 88, y: 92 }];
  const cut = TS.cutSection(sf, line, { origin: 10 });
  ok(cut.runs.length === 1, 'one run when the whole line is on the TIN');
  const r = cut.runs[0];
  ok(r.every((p) => Math.abs(p.z - plane(p.x, p.y)) < 1e-9), 'every point on the plane');
  near(cut.length, TS.lineLength(line), 1e-12, 'length = the polyline');
  near(r[0].o, -10, 1e-12, 'offset = distance − origin (start)');
  near(r[r.length - 1].o, cut.length - 10, 1e-9, 'offset at the end');
  ok(r.filter((p) => p.k === 'vertex').length === 1 && r[0].k === 'end' && r[r.length - 1].k === 'end', 'ends and the middle vertex are marked');
  // brute force: every TIN edge the polyline crosses
  const { X, Y, tris, ox, oy } = sf, edges = new Set();
  for (let t = 0; t < tris.length; t += 3) for (let e = 0; e < 3; e++) { const a = tris[t + e], b = tris[t + ((e + 1) % 3)]; edges.add(a < b ? a + ',' + b : b + ',' + a); }
  let hits = 0;
  const cr = (p, q, a, b) => { const d = (q.x - p.x) * (b.y - a.y) - (q.y - p.y) * (b.x - a.x); if (Math.abs(d) < 1e-15) return false; const t = ((a.x - p.x) * (b.y - a.y) - (a.y - p.y) * (b.x - a.x)) / d, u = ((a.x - p.x) * (q.y - p.y) - (a.y - p.y) * (q.x - p.x)) / d; return t > 1e-9 && t < 1 - 1e-9 && u >= -1e-12 && u <= 1 + 1e-12; };
  for (const k of edges) {
    const [a, b] = k.split(',').map(Number), A = { x: X[a] + ox, y: Y[a] + oy }, B = { x: X[b] + ox, y: Y[b] + oy };
    for (let i = 1; i < line.length; i++) if (cr(line[i - 1], line[i], A, B)) hits++;
  }
  const crossPts = new Set(r.filter((p) => p.k === 'edge').map((p) => p.d.toFixed(6))).size;
  ok(cut.breaks === crossPts && crossPts > 20 && crossPts <= hits, `a point at every edge crossing (${cut.breaks} points, ${hits} edge hits; a hit through a TIN vertex crosses several edges at one point)`);
  // exact between: a non-planar TIN (z = |y − 50| ridge) — the midpoint of each piece is on the TIN
  const v = gridTin((x, y) => 100 + Math.abs(y - 50) * 0.3 + 0.002 * x * x, { x0: 0, x1: 100, y0: 0, y1: 100, step: 10 });
  const c2 = TS.cutSection(v, line);
  let worst = 0;
  for (const run of c2.runs) for (let i = 1; i < run.length; i++) { const p = run[i - 1], q = run[i]; const z = v.elevationAt((p.x + q.x) / 2, (p.y + q.y) / 2, 1e-7); worst = Math.max(worst, Math.abs(z - (p.z + q.z) / 2)); }
  ok(worst < 1e-9, `nothing between the points: the TIN is flat between them (worst ${worst.toExponential(1)})`);
  const out = TS.cutSection(sf, [{ x: -50, y: 50 }, { x: 150, y: 50 }]);
  ok(out.runs.length === 1 && Math.abs(out.runs[0][0].d - 50) < 1e-6 && Math.abs(out.runs[0].at(-1).d - 150) < 1e-6, 'a line past the TIN keeps only the part on it');
  const hole = gridTin(plane, { x0: 0, x1: 100, y0: 0, y1: 100, step: 10 });
  void hole;
  const two = TS.cutSection(sf, [{ x: 50, y: -10 }, { x: 50, y: 50 }, { x: 50, y: 110 }, { x: 50, y: 150 }]);
  ok(two.runs.length === 1, 'a polyline in and out of the TIN at its ends: one run');
  const sq = TS.squareAcross([{ x: 0, y: 0 }, { x: 10, y: 0 }], 5, 3, 4);
  ok(Math.abs(sq[0].x - 5) < 1e-12 && Math.abs(sq[0].y - 3) < 1e-12 && Math.abs(sq[1].y + 4) < 1e-12, 'squareAcross: left end to the left of the line (east line: left = north)');
  const lo = TS.locateOn([{ x: 0, y: 0 }, { x: 10, y: 0 }], { x: 4, y: 2 });
  ok(lo.d === 4 && lo.off === -2, 'locateOn: a point left of the line has a negative offset');
  const cx = TS.crossing([{ x: 5, y: 5 }, { x: 5, y: -5 }], [{ x: 0, y: 0 }, { x: 10, y: 0 }]);
  ok(cx && cx.da === 5 && cx.db === 5, 'crossing: distances on both lines');
  ok(TS.zAt(cut.runs, 0) !== null && Math.abs(TS.zAt(cut.runs, 0) - plane(TS.pointAt(line, 10).x, TS.pointAt(line, 10).y)) < 1e-9, 'zAt between points');
}

// ---------------------------------------------------------------------------
// helpers for prismatic channels
const rect = (b, h = 10) => [{ o: 0, z: h }, { o: 0, z: 0 }, { o: b, z: 0 }, { o: b, z: h }];
const trap = (b, zs, h = 10) => [{ o: 0, z: h }, { o: zs * h, z: 0 }, { o: zs * h + b, z: 0 }, { o: 2 * zs * h + b, z: h }];
function prismatic({ pts, n, slope, count, dx, units = 'm', q, down, up, regime = 'sub', cc = 0.1, ce = 0.3, alpha = null, bedAt = null }) {
  const bank = [pts[0].o, pts[pts.length - 1].o];
  const sections = [];
  for (let i = 0; i < count; i++) {
    const rs = i * dx, zb = bedAt ? bedAt(rs) : rs * slope;
    sections.push({ id: 'xs' + i, rs, pts: pts.map((p) => ({ o: p.o, z: p.z + zb })), banks: bank, n: [{ o: bank[0], n }], reach: { lob: i ? dx : 0, ch: i ? dx : 0, rob: i ? dx : 0 }, cc, ce, alpha });
  }
  return RV.cleanRiver({ units, sections, profiles: [{ name: 'PF 1', q, down, up }], regime });
}
function manningY(Q, n, S, A, P, k = 1) {   // bisection on Q = k/n · A R^(2/3) √S, independent of the program
  let lo = 1e-6, hi = 100;
  for (let i = 0; i < 200; i++) { const y = (lo + hi) / 2, a = A(y), r = a / P(y); if ((k / n) * a * Math.pow(r, 2 / 3) * Math.sqrt(S) > Q) hi = y; else lo = y; }
  return (lo + hi) / 2;
}

section('Manning normal depth in a prismatic channel');
{
  const b = 10, n = 0.03, S = 0.001, Q = 20;
  const yn = manningY(Q, n, S, (y) => b * y, (y) => b + 2 * y);
  const m = prismatic({ pts: rect(b), n, slope: S, count: 21, dx: 100, q: Q, down: { type: 'normal', slope: S } });
  const geo = SV.geometry(RV.ordered(m)[0]);
  near(SV.normalWs(geo, Q, S, 'm'), yn, 1e-6, 'normalWs = Manning by hand');
  const res = SV.solve(m), rows = res.profiles[0].rows;
  ok(res.issues.length === 0, 'no issues');
  let worst = 0;
  for (const r of rows) worst = Math.max(worst, Math.abs(r.depth - yn));
  ok(worst < 1e-4, `started at normal depth, every section stays at yn = ${yn.toFixed(4)} m (worst ${worst.toExponential(1)})`);
  ok(rows.every((r) => r.flags.length === 0), 'no flags on a uniform subcritical channel');
  near(rows[5].sf, S, 1e-6, 'friction slope = bed slope');
  near(rows[5].froude, (Q / (b * yn)) / Math.sqrt(9.80665 * yn), 1e-6, 'Froude = V/√(gD)');
  // M1: 1 m above normal depth at the outlet
  const m1 = prismatic({ pts: rect(b), n, slope: S, count: 81, dx: 250, q: Q, down: { type: 'ws', wse: yn + 1 } });
  const r1 = SV.solve(m1).profiles[0].rows;
  let mono = true;
  for (let i = 1; i < r1.length; i++) if (!(r1[i].depth <= r1[i - 1].depth + 1e-9 && r1[i].depth > yn - 1e-5)) mono = false;
  ok(mono, 'M1 backwater: depth falls upstream and stays above yn');
  ok(r1.at(-1).depth - yn < 0.02, `20 km upstream the depth is back within 2 cm of yn (${(r1.at(-1).depth - yn).toFixed(4)} m)`);
}

section('Critical depth in a rectangular channel');
{
  const g = 9.80665, geo = SV.geometry(RV.cleanRiver({ sections: [{ rs: 0, pts: rect(5), banks: [0, 5], n: [{ o: 0, n: 0.03 }] }] }).sections[0]);
  near(SV.criticalWs(geo, 15, 'm'), Math.cbrt(9 / g), 1e-5, 'b 5 m, Q 15 m³/s: yc = (q²/g)^(1/3) = 0.9718 m');
  const gu = 32.174, geu = SV.geometry(RV.cleanRiver({ units: 'ft', sections: [{ rs: 0, pts: rect(10, 20), banks: [0, 10], n: [{ o: 0, n: 0.03 }] }] }).sections[0]);
  near(SV.criticalWs(geu, 200, 'ft'), Math.cbrt(400 / gu), 1e-5, 'b 10 ft, Q 200 cfs: yc = 2.316 ft');
  const m = prismatic({ pts: rect(5), n: 0.03, slope: 0.001, count: 5, dx: 50, q: 15, down: { type: 'critical' } });
  const rows = SV.solve(m).profiles[0].rows;
  near(rows[0].depth, Math.cbrt(9 / g), 1e-5, 'a critical-depth boundary sets the outlet to yc');
  near(rows[0].froude, 1, 1e-4, 'Froude 1 at critical depth');
}

section('Textbook: Chow (1959) Examples 10-1 / 10-2, a backwater curve behind a dam');
{
  const b = 20, z = 2, S0 = 0.0016, n = 0.025, Q = 400, al = 1.10, g = 32.174, k = 1.486;
  const A = (y) => y * (b + z * y), T = (y) => b + 2 * z * y, P = (y) => b + 2 * y * Math.sqrt(1 + z * z);
  const yn = manningY(Q, n, S0, A, P, k);
  near(yn, 3.36, 0.005, 'normal depth (book: 3.36 ft)');
  const geo = SV.geometry(RV.cleanRiver({ units: 'ft', sections: [{ rs: 0, pts: trap(b, z, 12), banks: [0, 68], n: [{ o: 0, n }], alpha: al }] }).sections[0]);
  near(SV.normalWs(geo, Q, S0, 'ft'), yn, 1e-5, 'normalWs = the hand value');
  near(SV.criticalWs(geo, Q, 'ft'), 2.22, 0.01, 'critical depth with α 1.10 (book: 2.22 ft)');
  // the gradually varied flow equation integrated from y = 5 down to 1.01·yn
  const Sf = (y) => { const a = A(y), r = a / P(y); return Math.pow((n * Q) / (k * a * Math.pow(r, 2 / 3)), 2); };
  const dxdy = (y) => (1 - (al * Q * Q * T(y)) / (g * A(y) ** 3)) / (S0 - Sf(y));
  const curve = [[5, 0]];
  const yEnd = 1.01 * yn;
  for (let y = 5, x = 0, h = -0.0005; y + h > yEnd - 1e-12;) {
    const k1 = dxdy(y), k2 = dxdy(y + h / 2), k3 = k2 === k2 ? dxdy(y + h / 2) : 0, k4 = dxdy(y + h);
    x += (h * (k1 + 2 * k2 + 2 * k3 + k4)) / 6; y += h; curve.push([y, -x]);   // x upstream (positive)
  }
  const xEnd = curve.at(-1)[1];
  ok(xEnd > 2000 && xEnd < 4000, `the curve reaches 1 % above yn about ${xEnd.toFixed(0)} ft upstream`);
  const yOf = (x) => { for (let i = 1; i < curve.length; i++) if (curve[i][1] >= x) { const [y0, x0] = curve[i - 1], [y1, x1] = curve[i]; return y0 + ((y1 - y0) * (x - x0)) / (x1 - x0); } return null; };
  const dx = 50, count = Math.floor(xEnd / dx) + 1;
  const m = prismatic({ units: 'ft', pts: trap(b, z, 12), n, slope: S0, count, dx, q: Q, down: { type: 'ws', wse: 5 }, cc: 0, ce: 0, alpha: al });
  const rows = SV.solve(m).profiles[0].rows;
  let worst = 0;
  for (const r of rows) worst = Math.max(worst, Math.abs(r.depth - yOf(r.rs)));
  ok(worst < 0.005, `standard step (50 ft steps, average conveyance) on the GVF curve within 0.005 ft at all ${rows.length} sections (worst ${worst.toFixed(5)} ft)`);
  const at1000 = rows.find((r) => r.rs === 1000);
  near(at1000.depth, yOf(1000), 0.005, 'depth 1000 ft upstream of the dam');
  const coarse = SV.solve(prismatic({ units: 'ft', pts: trap(b, z, 12), n, slope: S0, count: Math.floor(xEnd / 250) + 1, dx: 250, q: Q, down: { type: 'ws', wse: 5 }, cc: 0, ce: 0, alpha: al })).profiles[0].rows;
  let wc = 0;
  for (const r of coarse) wc = Math.max(wc, Math.abs(r.depth - yOf(r.rs)));
  ok(wc < 0.01, `250 ft steps (Chow-sized) still within 0.01 ft (worst ${wc.toFixed(4)} ft)`);
  if (VERBOSE) for (const r of coarse) console.log(`     x ${r.rs.toFixed(0).padStart(5)} ft  y ${r.depth.toFixed(3)}  GVF ${yOf(r.rs).toFixed(3)}`);
}

section('Conveyance by subdivision (compound section by hand)');
{
  const pts = [{ o: 0, z: 4 }, { o: 0, z: 2 }, { o: 20, z: 2 }, { o: 20, z: 0 }, { o: 30, z: 0 }, { o: 30, z: 2 }, { o: 50, z: 2 }, { o: 50, z: 4 }];
  const sec = RV.cleanRiver({ sections: [{ rs: 0, pts, banks: [20, 30], n: [{ o: 0, n: 0.06 }, { o: 20, n: 0.03 }, { o: 30, n: 0.06 }, { o: 40, n: 0.08 }] }] }).sections[0];
  const h = SV.hydraulics(SV.geometry(sec), 3, 'm');
  near(h.reg.lob.A, 20, 1e-12, 'LOB area 20'); near(h.reg.lob.P, 21, 1e-12, 'LOB wetted perimeter 20 + 1 (end wall)');
  near(h.reg.ch.A, 30, 1e-12, 'channel area 30'); near(h.reg.ch.P, 14, 1e-12, 'channel perimeter 2 + 10 + 2 (no water-water edges)');
  near(h.reg.rob.A, 20, 1e-12, 'ROB area 20'); near(h.reg.rob.P, 21, 1e-12, 'ROB perimeter 20 + 1');
  const Kl = (1 / 0.06) * 20 * Math.pow(20 / 21, 2 / 3), Kc = (1 / 0.03) * 30 * Math.pow(30 / 14, 2 / 3), Kr = (1 / 0.06) * 10 * 1 + (1 / 0.08) * 10 * Math.pow(10 / 11, 2 / 3);
  near(h.reg.lob.K, Kl, 1e-9, 'K LOB'); near(h.reg.ch.K, Kc, 1e-9, 'K channel'); near(h.reg.rob.K, Kr, 1e-9, 'K ROB split at its n change (two pieces)');
  const At = 70, Kt = Kl + Kc + Kr, alpha = (At * At * (Kl ** 3 / 400 + Kc ** 3 / 900 + Kr ** 3 / 400)) / Kt ** 3;
  near(h.alpha, alpha, 1e-9, `α = At²·Σ(K³/A²)/Kt³ = ${alpha.toFixed(4)}`);
  near(h.T, 50, 1e-12, 'top width 50');
  const c = RV.cleanRiver({ sections: [{ rs: 0, pts: rect(10), banks: [0, 10], n: [{ o: 0, n: 0.02 }, { o: 5, n: 0.04 }] }] }).sections[0];
  const hc = SV.hydraulics(SV.geometry(c), 2, 'm');
  const nc = Math.pow((7 * 0.02 ** 1.5 + 7 * 0.04 ** 1.5) / 14, 2 / 3);
  near(hc.reg.ch.n, nc, 1e-12, `composite channel n = (ΣP·n^1.5/P)^(2/3) = ${nc.toFixed(5)}`);
  near(hc.K, (1 / nc) * 20 * Math.pow(20 / 14, 2 / 3), 1e-9, 'channel K with the composite n');
}

section('Ineffective flow areas and levees (SU.957 step 2)');
{
  const pts = [{ o: 0, z: 4 }, { o: 0, z: 2 }, { o: 20, z: 2 }, { o: 20, z: 0 }, { o: 30, z: 0 }, { o: 30, z: 2 }, { o: 50, z: 2 }, { o: 50, z: 4 }];
  const mk = (extra) => RV.cleanRiver({ sections: [{ rs: 0, pts, banks: [20, 30], n: [{ o: 0, n: 0.06 }, { o: 20, n: 0.03 }, { o: 30, n: 0.06 }], ...extra }] }).sections[0];
  const base = SV.hydraulics(SV.geometry(mk({})), 3, 'm');
  const inf = SV.hydraulics(SV.geometry(mk({ ineff: [{ o0: 0, o1: 20, trigger: null }] })), 3, 'm');
  ok(inf.reg.lob.A === 0 && inf.reg.lob.P === 0 && inf.reg.lob.K === 0, 'a permanent ineffective left overbank carries nothing: A, P and K are 0');
  near(inf.A, 50, 1e-12, 'total area 30 + 20'); near(inf.T, 30, 1e-12, 'top width 10 + 20 (the ineffective width is left out)');
  near(inf.reg.ch.K, base.reg.ch.K, 1e-12, 'the channel is unchanged'); near(inf.reg.rob.K, base.reg.rob.K, 1e-12, 'so is the right overbank');
  near(inf.P, base.P - 21, 1e-12, 'its wetted perimeter (20 + the 1 ft end wall) is gone');
  ok(inf.alpha > 1 && inf.walls === false, 'α from what is left; no end wall on the ineffective side (walls flag only for the right end: ' + inf.walls + ')');
  // a trigger: ineffective while the water is below 3.5, effective above it
  const g = SV.geometry(mk({ ineff: [{ o0: 0, o1: 20, trigger: 3.5 }] }));
  near(SV.hydraulics(g, 3, 'm').reg.lob.A, 0, 0, 'below the trigger (ws 3): nothing in the left overbank');
  near(SV.hydraulics(g, 3.6, 'm').reg.lob.A, 20 * 1.6, 1e-12, 'above it (ws 3.6): the overbank carries again (20 × 1.6)');
  // levees: right levee at o = 40, crest 3.5: ground beyond it is cut off while the water is under the crest
  const gl = SV.geometry(mk({ levees: { left: null, right: { o: 40, z: 3.5 } } }));
  const lv = SV.hydraulics(gl, 3, 'm'), lv2 = SV.hydraulics(gl, 3.6, 'm');
  near(lv.reg.rob.A, 10, 1e-12, 'behind a right levee (ws under the crest): only 30–40 of the right overbank, area 10');
  near(lv.reg.rob.P, 10, 1e-12, 'its wetted perimeter is the bed 10 (no end wall, no levee wall)');
  near(lv2.reg.rob.A, 20 * 1.6, 1e-12, 'over the crest the whole overbank is back');
  const lvl = SV.hydraulics(SV.geometry(mk({ levees: { left: { o: 5, z: 3.5 }, right: null } })), 3, 'm');
  near(lvl.reg.lob.A, 15, 1e-12, 'a left levee at o = 5 keeps 5–20 of the left overbank (depth 1 × 15)');
  // the solver: cutting the left overbank off raises the water surface for the same flow
  const run = (extra) => {
    const secs = [0, 100, 200].map((rs) => ({ rs, pts, banks: [20, 30], n: [{ o: 0, n: 0.06 }, { o: 20, n: 0.03 }, { o: 30, n: 0.06 }], ...extra, reach: { lob: rs ? 100 : null, ch: rs ? 100 : null, rob: rs ? 100 : null } }));
    return SV.solve(RV.cleanRiver({ units: 'm', regime: 'sub', sections: secs, profiles: [{ name: 'PF 1', q: 400, down: { type: 'ws', wse: 3 }, up: { type: 'critical' } }] }));
  };
  const a = run({}), b = run({ ineff: [{ o0: 0, o1: 20, trigger: null }, { o0: 30, o1: 50, trigger: null }] });
  ok(a.profiles[0].rows.length === 3 && b.profiles[0].rows.length === 3, 'both runs solve');
  ok(b.profiles[0].rows.every((r, i) => r.wse >= a.profiles[0].rows[i].wse - 1e-9) && b.profiles[0].rows[2].wse > a.profiles[0].rows[2].wse + 0.01, `with both overbanks ineffective the water stands higher upstream (${a.profiles[0].rows[2].wse.toFixed(3)} → ${b.profiles[0].rows[2].wse.toFixed(3)})`);
  // the file: cleaned, capped, clipped to the section
  const c = RV.cleanRiver({ sections: [{ rs: 0, pts, banks: [20, 30], ineff: [{ o0: 70, o1: -10, trigger: 'x' }, { o0: 5, o1: 5 }, ...Array.from({ length: 40 }, () => ({ o0: 1, o1: 2 }))], levees: { left: { o: 99, z: 1 }, right: { o: 40, z: 3 } } }] }).sections[0];
  ok(c.ineff.length === 19 && c.ineff[0].o0 === 0 && c.ineff[0].o1 === 50 && c.ineff[0].trigger === null, 'ineffective areas: ordered, clipped to the section, junk trigger dropped, the empty one dropped, the first 20 read (19 left)');
  ok(c.levees && c.levees.left === null && c.levees.right.o === 40, 'a levee outside the section is dropped, the other kept');
  const iss = RV.check(RV.cleanRiver({ sections: [{ rs: 0, pts, banks: [20, 30], levees: { left: { o: 25, z: 3 }, right: null }, ineff: [{ o0: 10, o1: 25, trigger: null }] }, { rs: 100, pts, banks: [20, 30] }], profiles: [{ q: 1, down: { type: 'critical' }, up: { type: 'critical' } }] })).map((x) => x.code);
  ok(iss.includes('levee') && iss.includes('ineffchannel'), 'check() flags a levee inside the banks and an ineffective area over the channel');
}

section('River warnings as shared Problems (problems-river.js)');
{
  const tt = (k, v) => I18N.t(k, v);
  const b = 5, n = 0.015, S = 0.02, Q = 15;
  const steep = prismatic({ pts: rect(b, 10), n, slope: S, count: 6, dx: 100, q: Q, down: { type: 'normal', slope: S }, up: { type: 'critical' }, regime: 'sub' });
  steep.id = 'rv1'; steep.name = 'Steep reach';
  const res = SV.solve(steep);
  const pr = PR.riverProblems([steep], { t: tt, resultsOf: () => res, unit: 'm' });
  const crit = pr.find((p) => p.code === 'river.flag.critical');
  ok(crit && crit.severity === 'warning' && crit.about[0].kind === 'river' && crit.about[0].id === 'rv1' && crit.source.name === 'civilcraft.river', 'a subcritical run on a steep channel: a critical-depth warning about the river');
  ok(crit.msg.key === 'sx.su957.flag.critical' && crit.msg.vars.n >= 1 && /PF 1/.test(crit.text) && /First at river station/.test(crit.text), 'with its key and count, the profile name and the first station in its words: ' + crit.text.slice(0, 80));
  ok(pr.every((p) => typeof p.code === 'string' && p.text && p.part && ['error', 'warning'].includes(p.severity)), 'every problem has code, text, part and a severity');
  ok(new Set(pr.map((p) => p.part)).size === pr.length, 'parts are unique (a problem keeps its identity between runs)');
  const bad = PR.riverProblems([{ id: 'rv2', name: 'Bare', centreline: [], sections: [], profiles: [] }], { t: tt, resultsOf: () => null });
  ok(bad.some((p) => p.code === 'river.issue.fewsections' && p.severity === 'error') && bad.some((p) => p.code === 'river.issue.noprofile'), 'model issues: fewer than two sections and no profile are errors');
  const lev = prismatic({ pts: rect(b, 10), n, slope: 0.001, count: 3, dx: 100, q: 5, down: { type: 'normal', slope: 0.001 } });
  lev.id = 'rv3'; lev.sections.forEach((sc) => { sc.levees = { left: { o: 3, z: 9 }, right: null }; sc.line = [{ x: 0, y: 10 * sc.rs }, { x: 10, y: 10 * sc.rs }]; });
  const lp = PR.riverProblems([lev], { t: tt, resultsOf: () => null });
  const lw = lp.find((p) => p.code === 'river.issue.levee');
  ok(lw && lw.severity === 'warning' && lw.where?.space === '2d' && Math.abs(lw.where.at[0] - 5) < 1e-9, 'a levee inside the banks: a warning placed at the section\'s cut line (where.at = its middle)');
  ok(PR.riverProblems([], { t: tt }).length === 0 && PR.riverProblems(null, { t: tt }).length === 0, 'no rivers, no problems');
}

section('Energy balance with contraction and expansion losses');
{
  // a wide section, a narrow one, a wide one (rs 0 = downstream)
  const widths = [12, 6, 12, 12];
  const sections = widths.map((w, i) => ({ id: 'x' + i, rs: i * 100, pts: rect(w).map((p) => ({ o: p.o, z: p.z + i * 0.05 })), banks: [0, w], n: [{ o: 0, n: 0.03 }], reach: { lob: i ? 100 : 0, ch: i ? 100 : 0, rob: i ? 100 : 0 }, cc: 0.1, ce: 0.3 }));
  const m = RV.cleanRiver({ sections, profiles: [{ name: 'PF', q: 30, down: { type: 'ws', wse: 3 } }] });
  const rows = SV.solve(m).profiles[0].rows, g = 9.80665;
  const hv = (r) => (r.alpha * r.v * r.v) / (2 * g);
  let worst = 0;
  for (let i = 1; i < rows.length; i++) {
    const u = rows[i], d = rows[i - 1];
    const sf = ((u.q + d.q) / (u.k + d.k)) ** 2, C = hv(d) > hv(u) ? 0.1 : 0.3;
    worst = Math.max(worst, Math.abs(u.wse + hv(u) - (d.wse + hv(d) + 100 * sf + C * Math.abs(hv(u) - hv(d)))));
  }
  ok(worst < 2e-6, `energy closes at every section (worst ${worst.toExponential(1)})`);
  near(rows[2].hce, 0.1 * Math.abs(hv(rows[2]) - hv(rows[1])), 1e-9, 'wide → narrow going downstream: contraction 0.1');
  near(rows[1].hce, 0.3 * Math.abs(hv(rows[1]) - hv(rows[0])), 1e-9, 'narrow → wide: expansion 0.3');
  ok(rows.every((r) => Math.abs(r.egl - (r.wse + hv(r))) < 1e-9), 'EGL = WS + αV²/2g');
}

section('Supercritical, mixed and a subcritical run on a steep channel');
{
  const b = 5, n = 0.015, S = 0.02, Q = 15, g = 9.80665;
  const yn = manningY(Q, n, S, (y) => b * y, (y) => b + 2 * y), yc = Math.cbrt(9 / g);
  ok(yn < yc, `steep: yn ${yn.toFixed(3)} < yc ${yc.toFixed(3)}`);
  const sup = SV.solve(prismatic({ pts: rect(b), n, slope: S, count: 61, dx: 20, q: Q, up: { type: 'critical' }, regime: 'super' })).profiles[0].rows;
  near(sup.at(-1).depth, yc, 1e-5, 'upstream boundary at critical');
  ok(sup.slice(0, -1).every((r) => r.regime === 'super' && r.froude > 1), 'supercritical below it');
  near(sup[0].depth, yn, 0.01, 'S2 curve reaches normal depth 1.2 km down');
  let mono = true;
  for (let i = 1; i < sup.length; i++) if (!(sup[i].depth >= sup[i - 1].depth - 1e-12)) mono = false;
  ok(mono, 'S2: depth falls going downstream');
  const subOnSteep = SV.solve(prismatic({ pts: rect(b), n, slope: S, count: 10, dx: 20, q: Q, down: { type: 'normal', slope: S } })).profiles[0];
  ok(subOnSteep.rows.every((r) => r.flags.includes('critical')) && subOnSteep.flags.critical === 10, 'subcritical run on a steep channel: every section held at critical and flagged');
  // steep upstream 600 m (S 0.02), mild downstream 1 km (S 0.0005): a jump on the mild part
  const bed = (rs) => (rs <= 1000 ? rs * 0.0005 : 0.5 + (rs - 1000) * 0.02);
  const mix = SV.solve(prismatic({ pts: rect(b, 30), n, slope: 0, bedAt: bed, count: 81, dx: 20, q: Q, down: { type: 'normal', slope: 0.0005 }, up: { type: 'critical' }, regime: 'mixed' })).profiles[0];
  const ups = mix.rows.filter((r) => r.rs > 1100), dns = mix.rows.filter((r) => r.rs < 600);
  ok(ups.every((r) => r.regime === 'super' || r.regime === 'crit'), 'mixed: supercritical on the steep reach');
  ok(dns.every((r) => r.regime === 'sub'), 'mixed: subcritical on the mild reach');
  ok(mix.flags.jump === 1, 'mixed: one hydraulic jump flagged');
  const j = mix.rows.find((r) => r.flags.includes('jump'));
  ok(j && j.rs <= 1100, `the jump is at or below the slope break (between rs ${j?.rs - 20} and ${j?.rs})`);
}

section('Flow changes, untrusted data, checks');
{
  const p = { name: 'PF', q: 10, changes: [{ rs: 500, q: 15 }, { rs: 200, q: 18 }] };
  ok(RV.flowAt(p, 900) === 10 && RV.flowAt(p, 500) === 15 && RV.flowAt(p, 300) === 15 && RV.flowAt(p, 100) === 18, 'a flow change holds from its station downstream');
  ok(RV.cleanRiver(null) === null && RV.cleanRiver('x') === null, 'not an object → null');
  const bad = RV.cleanRiver({ units: 'parsecs', sections: [{ rs: 'a' }, { rs: 1, pts: [{ o: 5, z: 1 }, { o: 1, z: 0 }] }, { rs: 2, pts: [{ o: 0, z: 1 }, { o: NaN, z: 0 }, { o: 2, z: 1 }], cc: 7, ce: -1, n: [{ o: 0, n: 3 }] }], profiles: [{ q: -1 }, { q: 5, down: { type: 'normal', slope: -2 } }, { q: 6, down: { type: 'ws', wse: 1e20 } }], regime: 'up' });
  ok(bad.units === 'm' && bad.regime === 'sub', 'unknown units / regime → defaults');
  ok(bad.sections.length === 1 && bad.sections[0].pts.length === 2, 'sections with no station or backwards offsets dropped; NaN points dropped');
  ok(bad.sections[0].cc === 0.1 && bad.sections[0].ce === 0.3 && bad.sections[0].n.every((z) => z.n < 1), 'coefficients and n out of range → defaults');
  ok(bad.profiles.length === 2 && bad.profiles.every((q) => q.down === null), 'negative flows dropped; bad boundaries → none');
  const issues = RV.check(bad).map((i) => i.code);
  ok(issues.includes('fewsections') && issues.includes('nodown'), 'check: too few sections, no downstream boundary');
  ok(SV.solve(bad).profiles.length === 0, 'solve refuses a model with blocking issues');
  const many = RV.cleanRiver({ sections: Array.from({ length: 900 }, (_, i) => ({ rs: i, pts: rect(2) })) });
  ok(many.sections.length === RV.MAX_SECTIONS, 'sections capped');
}

section('Sections cut along a TIN valley, normal depth, flood extent');
{
  // V valley along +x (flow toward +x), bed 101 − 0.001·x, side slopes 0.05 (20:1)
  const zf = (x, y) => 101 - 0.001 * x + 0.05 * Math.abs(y);
  const sf = gridTin(zf, { x0: -20, x1: 1020, y0: -100, y1: 100, step: 10 });
  const cl = [{ x: 0, y: 0 }, { x: 1000, y: 0 }];
  const secs = RV.sectionsAlong(sf, cl, { spacing: 100, left: 80, right: 80, bank: 10, n: 0.035, nOver: 0.035 });
  ok(secs.every((s) => Math.abs(s.banks[0] + 10) < 1e-9 && Math.abs(s.banks[1] - 10) < 1e-9), 'banks guessed ±10 m around the thalweg');
  for (const s of secs) { s.banks = [-80, 80]; s.n = [{ o: -80, n: 0.035 }]; }   // one piece: subdividing a V raises K (as it should), the hand formula is for one piece
  ok(secs.length === 11, '11 sections every 100 m');
  ok(secs[0].rs === 1000 && secs.at(-1).rs === 0, 'river stations grow upstream (1000 at the top)');
  ok(secs.every((s) => s.line[0].y > 0 && s.line.at(-1).y < 0), 'cut lines run left to right looking downstream (left = +y here)');
  ok(secs.every((s) => Math.abs(s.pts[0].o + 80) < 1e-6 && Math.abs(s.pts.at(-1).o - 80) < 1e-6), 'offsets −80 … 80, 0 at the centreline');
  const thal = secs.map((s) => Math.min(...s.pts.map((p) => p.z)));
  ok(secs.every((s, i) => Math.abs(thal[i] - (101 - 0.001 * (1000 - s.rs))) < 1e-9), 'thalweg = the valley bed at every section');
  const model = RV.cleanRiver({ centreline: cl, sections: secs, profiles: [{ name: '100-yr', q: 50, down: { type: 'normal', slope: 0.001 } }] });
  RV.setReachLengths(model);
  ok(RV.ordered(model).slice(1).every((s) => Math.abs(s.reach.ch - 100) < 1e-9 && Math.abs(s.reach.lob - 100) < 1e-6 && Math.abs(s.reach.rob - 100) < 1e-6), 'reach lengths 100 m (channel and both overbanks, from the plan)');
  const res = SV.solve(model), rows = res.profiles[0].rows;
  ok(res.issues.length === 0, 'model ready: no issues');
  // V channel, side slope m = 20: A = m y², P = 2y√(1+m²)
  const mz = 20, yn = manningY(50, 0.035, 0.001, (y) => mz * y * y, (y) => 2 * y * Math.sqrt(1 + mz * mz));
  ok(rows.every((r) => Math.abs(r.depth - yn) < 1e-4), `uniform V valley: every section at yn = ${yn.toFixed(4)} m`);
  const ext = EX.floodExtent(sf, model, rows);
  const half = yn / 0.05;
  near(ext.area, 2 * half * 1000, 2 * half * 1000 * 0.02, `flood extent area = 2 · ${half.toFixed(2)} m · 1000 m (corridor ends follow the triangles)`);
  const ys = ext.outline.flat().map((p) => Math.abs(p.y));
  const wy = Math.max(...ys.map((y) => Math.abs(y - half)));
  ok(ys.length > 0 && wy < 1e-3, `the waterline lies where depth is 0: |y| = yn/0.05 (worst ${wy.toExponential(1)} m)`);
  ok(ext.outline.length === 2, 'two waterlines, one on each bank (chained across triangles)');
  near(ext.maxDepth, yn, 1e-4, 'deepest = the depth on the centreline');
  near(EX.wsAt(model, rows, { x: 450, y: 30 }), rows.find((r) => r.rs === 600).wse - 0.5 * (rows.find((r) => r.rs === 600).wse - rows.find((r) => r.rs === 500).wse), 1e-9, 'water surface between sections: linear in river station, level across');
  ok(EX.wsAt(model, rows, { x: 1010, y: 0 }) === null, 'no water surface past the last section');
  // levees: a left levee (left = +y here) halfway out, crest above the water → the ground beyond it stays dry; crest under it → no effect
  const withLevee = (crestDrop) => RV.cleanRiver({ centreline: cl, sections: secs.map((sc) => ({ ...sc, levees: { left: { o: -half / 2, z: rows.find((r) => r.rs === sc.rs).wse + crestDrop }, right: null } })), profiles: model.profiles });
  const mL = withLevee(0.5), mL2 = withLevee(-0.5);
  const e1 = EX.floodExtent(sf, mL, rows), e2 = EX.floodExtent(sf, mL2, rows);
  const maxY = (e) => Math.max(...e.wet.flat().map((p) => p.y));
  ok(maxY(e1) < half / 2 + 12 && maxY(ext) > half - 12, `a levee halfway out keeps the left bank's far side dry (wet to y = ${maxY(e1).toFixed(1)}, without it ${maxY(ext).toFixed(1)}; the levee is at ${(half / 2).toFixed(1)})`);
  ok(Math.abs(e1.area - 1.5 * half * 1000) < 1.5 * half * 1000 * 0.08, 'the wet area is the river and the near side only (' + e1.area.toFixed(0) + ' vs ' + (1.5 * half * 1000).toFixed(0) + ')');
  near(e2.area, ext.area, 1e-6, 'a crest under the water surface does nothing: the same extent as without a levee');
  ok(EX.blockedAt(mL, rows, { x: 450, y: half * 0.8 }, 100) === true && EX.blockedAt(mL, rows, { x: 450, y: half * 0.8 }, 200) === false && EX.blockedAt(mL, rows, { x: 450, y: -half * 0.8 }, 100) === false, 'blockedAt: beyond the levee and under the crest only, not on the other bank');
  if (RP) {
    const rep = RP.reportText(model, res, { t: I18N.t });
    ok(rep.includes(I18N.t('sx.su957.review')), 'the report says it needs an engineer’s review');
    const csv = RP.tableCsv(res.profiles[0], { units: 'm' });
    ok(csv.split('\r\n').filter(Boolean).length === rows.length + 1, 'CSV: a header and one line per section');
    const svg = RP.profileSvg(model, res.profiles[0], { t: I18N.t });
    ok(svg.startsWith('<svg') && svg.includes(I18N.t('sx.su957.review')), 'profile plot: SVG with the review line');
  }
}

if (RP) {
  section('Strings');
  const keys = Object.keys(EN).filter((k) => k.startsWith('sx.su957.'));
  ok(keys.length > 30, `sx.su957.* strings in en (${keys.length})`);
  const codes = ['critical', 'walls', 'froude', 'kratio', 'noconv', 'jump'];
  ok(codes.every((c) => EN['sx.su957.flag.' + c] && EN['sx.su957.flag.' + c + '.short']), 'every warning code has its sentence and short form');
  const issues = ['nomodel', 'fewsections', 'noprofile', 'samers', 'banks', 'emptychannel', 'gaps', 'reach', 'nodown', 'noup', 'levee', 'ineffchannel'];
  ok(issues.every((c) => EN['sx.su957.issue.' + c]), 'every issue code has its sentence');
  const srcCodes = [...fs.readFileSync(path.join(APP, 'river-solve.js'), 'utf8').matchAll(/flags\.push\('([a-z]+)'\)|push\('([a-z]+)'\)/g)].map((m) => m[1] || m[2]);
  ok(srcCodes.length > 0 && srcCodes.every((c) => codes.includes(c)), 'the solver raises only those codes: ' + [...new Set(srcCodes)].join(', '));
  const issueSrc = [...fs.readFileSync(path.join(APP, 'river.js'), 'utf8').matchAll(/code: '([a-z]+)'/g)].map((m) => m[1]);
  ok(issueSrc.every((c) => issues.includes(c)), 'check() raises only those issues');
  const miss = I18N.missing ? I18N.missing().filter((k) => k.startsWith('sx.su957.')) : [];
  ok(miss.length === 0, 'no missing sx.su957.* key used: ' + miss.join(', '));
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
