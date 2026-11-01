#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-civilcraft-rail.mjs — CivilCraft 0.7.1 71.26: railway alignments and tracks (alignment.js transitions, rail.js, the corridor as a
 * track, sections, quantities, the plan, 3D, sheets, the project file, Problems). DOM-free.
 *
 *   node bin/test-civilcraft-rail.mjs [--build dev|x.y] [--verbose]
 *
 * Known answers.
 *  - Every transition is checked against an independent numerical integration of its own curvature definition (κ(l) written out here,
 *    θ = ∫κ, x = ∫cos θ, y = ∫sin θ, trapezoid on 40 000 steps), and against the published small-angle shifts p = Ls²/(24R) clothoid,
 *    Ls²/(40R) Bloss, Ls²/(48R) Helmert (Schramm), Ls²/R·(1/8 − 1/π²) sine half-wave (cosine), Ls²/R·(1/24 − 1/(4π²)) sine; the cubic
 *    parabola ends exactly on y = Ls² / 6R with tan θ = Ls / 2R.
 *  - Equilibrium cant against the familiar E = 11.8·V²/R (mm, km/h, m) and, in feet, AREMA's E = 0.0007·D·V² (inches, degree of curve,
 *    mph) with 59.5 in between the rails' centres.
 *  - Ballast and quantities by hand for a level straight track.
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
const AL = await mod('alignment.js');
const RL = await mod('rail.js');
const PJ = await mod('project.js');
const TIN = await mod('tin.js');
const LX = await mod('landxml.js');
const SEC = await mod('sections.js');
const S3 = await mod('site3d.js');
const S3L = await mod('site3d-landscape.js');
const PB = await mod('problems-civilcraft.js');
const PP = await mod('pp-sheets.js');
const SC = await mod('scene.js');

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; if (VERBOSE) console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };
const near = (a, b, tol, m) => ok(Number.isFinite(a) && Math.abs(a - b) <= tol, `${m} (${a} vs ${b}, ±${tol})`);
const section = (s) => console.log('\n== ' + s);

// ------------------------------------------------------------------------------------------------------------------------------
section('rail transitions: the shapes against their own definitions');
const KAPPA = {
  clothoid: (u) => u,
  bloss: (u) => 3 * u * u - 2 * u ** 3,
  helmert: (u) => (u <= 0.5 ? 2 * u * u : 1 - 2 * (1 - u) ** 2),
  sinehalf: (u) => (1 - Math.cos(Math.PI * u)) / 2,
  sine: (u) => u - Math.sin(2 * Math.PI * u) / (2 * Math.PI),
};
/** x, y, θ at the end of a transition by brute force: θ by trapezoid of κ, x and y by trapezoid of cos θ, sin θ. */
function brute(kind, R, Ls, N = 40000) {
  let th = 0, x = 0, y = 0, kp = 0, cp = 1, sp = 0;
  const h = Ls / N;
  for (let i = 1; i <= N; i++) {
    const k = KAPPA[kind](i / N) / R;
    th += ((kp + k) / 2) * h; kp = k;
    const c = Math.cos(th), s = Math.sin(th);
    x += ((cp + c) / 2) * h; y += ((sp + s) / 2) * h; cp = c; sp = s;
  }
  return { x, y, th };
}
for (const kind of Object.keys(KAPPA)) {
  const R = 600, Ls = 120, a = AL.transitionAt(kind, Ls, R, Ls), b = brute(kind, R, Ls);
  near(a.th, Ls / (2 * R), 1e-12, `${kind}: turns Ls/2R = 0.1 rad over its length`);
  near(a.x, b.x, 2e-6, `${kind}: x at the end = the integral of cos θ`);
  near(a.y, b.y, 2e-6, `${kind}: y at the end = the integral of sin θ`);
}
// mid-way points against the brute force of the partial curvature
for (const kind of ['bloss', 'helmert', 'sinehalf', 'sine']) {
  const R = 400, Ls = 90, l = 37, a = AL.transitionAt(kind, l, R, Ls);
  let th = 0, x = 0, y = 0, kp = 0, cp = 1, sp = 0; const N = 40000, h = l / N;
  for (let i = 1; i <= N; i++) { const k = KAPPA[kind]((i * h) / Ls) / R; th += ((kp + k) / 2) * h; kp = k; const c = Math.cos(th), s = Math.sin(th); x += ((cp + c) / 2) * h; y += ((sp + s) / 2) * h; cp = c; sp = s; }
  ok(Math.abs(a.x - x) < 1e-6 && Math.abs(a.y - y) < 1e-6 && Math.abs(a.th - th) < 1e-9, `${kind}: a point part-way (37 of 90) matches too`);
}
{
  // published shifts p = Yc − R(1 − cos θ), small angle (R 3000, Ls 100: θ = 1/60 rad)
  const R = 3000, Ls = 100, P = (k) => AL.spiralConstants(R, Ls, k).p, rel = 2e-3;
  near(P('clothoid') / (Ls * Ls / (24 * R)), 1, rel, 'clothoid shift p = Ls²/24R');
  near(P('bloss') / (Ls * Ls / (40 * R)), 1, rel, 'Bloss shift p = Ls²/40R');
  near(P('helmert') / (Ls * Ls / (48 * R)), 1, rel, 'Helmert shift p = Ls²/48R');
  near(P('sinehalf') / ((Ls * Ls / R) * (1 / 8 - 1 / Math.PI ** 2)), 1, rel, 'sine half-wave shift p = Ls²/R·(1/8 − 1/π²)');
  near(P('sine') / ((Ls * Ls / R) * (1 / 24 - 1 / (4 * Math.PI ** 2))), 1, rel, 'sine shift p = Ls²/R·(1/24 − 1/4π²)');
  near(AL.spiralConstants(R, Ls, 'bloss').k, Ls / 2, 0.01, 'Bloss k ≈ Ls/2');
  // the cubic parabola
  const c = AL.spiralConstants(600, 120, 'cubic');
  near(c.Yc, (120 * 120) / (6 * 600), 1e-9, 'cubic parabola: ends on y = Ls²/6R = 4');
  near(c.Xc, 120, 1e-9, 'cubic parabola: Ls is its length along the tangent (x = 120)');
  near(Math.tan(c.th), 120 / 1200, 1e-12, 'cubic parabola: tan θ = Ls/2R');
  let arc = 0; { const N = 40000, h = 120 / N; for (let i = 0; i < N; i++) { const f = (x) => Math.hypot(1, (x * x) / (2 * 600 * 120)); arc += ((f(i * h) + f((i + 1) * h)) / 2) * h; } }
  near(c.len, arc, 1e-6, `cubic parabola: its true length ${c.len.toFixed(4)} (longer than 120)`);
  near(AL.cubicParamFor(600, c.len), 120, 1e-9, 'cubicParamFor: back from the length to Ls');
  near(AL.spiralConstants(3000, 100, 'cubic').p / (100 * 100 / (24 * 3000)), 1, 2e-3, 'cubic parabola shift ≈ Ls²/24R at a small angle, as a clothoid');
}

section('alignments with rail transitions: geometry closes for every kind');
for (const kind of AL.TRANSITIONS) {
  const pis = [{ x: 0, y: 0 }, { x: 600, y: 0, r: 500, ls1: 100, ls2: 80, tr: kind }, { x: 600 + 600 * Math.cos(0.6), y: 600 * Math.sin(0.6) }];
  const al = AL.buildAlignment({ pis, start: 1000 });
  ok(al.ok, `${kind}: builds`);
  const els = al.elements;
  let joins = true;
  for (let i = 1; i < els.length; i++) {
    const a = al.pointAt(els[i].sta - 1e-9), b = al.pointAt(els[i].sta + 1e-9);
    if (Math.hypot(a.x - b.x, a.y - b.y) > 1e-6 || Math.abs(AL.normAng(a.dir - b.dir)) > 1e-6) joins = false;
  }
  ok(joins, `${kind}: every element meets the next in position and direction`);
  const end = al.pointAt(al.end);
  near(AL.normAng(end.dir), 0.6, 1e-9, `${kind}: turns by Δ = 0.6 rad`);
  const off = (end.x - 600) * Math.sin(0.6) - end.y * Math.cos(0.6);
  near(off, 0, 1e-6, `${kind}: ends on the outgoing tangent`);
  near(al.length, els.reduce((s, e) => s + e.len, 0), 1e-9, `${kind}: stations run through every element`);
  const c = al.curves[0];
  ok(c.tr === kind && c.lp1 === 100 && c.lp2 === 80 && Math.abs(c.sc - c.ts - c.ls1) < 1e-9, `${kind}: the curve record carries tr, lp1/lp2 and TS → SC = the true length`);
  const so = al.stationOffset(al.pointAt(c.ts + 40).x + 3 * Math.sin(al.pointAt(c.ts + 40).dir), al.pointAt(c.ts + 40).y - 3 * Math.cos(al.pointAt(c.ts + 40).dir));
  near(so.sta, c.ts + 40, 1e-6, `${kind}: station and offset of a point beside the transition (station)`);
  near(so.off, 3, 1e-6, `${kind}: … (3 to the right)`);
}

section('LandXML: rail transitions out and back in');
for (const kind of ['cubic', 'bloss', 'helmert', 'sinehalf', 'sine']) {
  const p = new PJ.Project();
  p.change('m', (s) => { s.units = 'm'; s.alignments.push({ id: 'a1', name: 'Main', start: 0, pis: [{ x: 0, y: 0, r: 0 }, { x: 400, y: 0, r: 700, ls1: 90, ls2: 90, tr: kind }, { x: 700, y: 250, r: 0 }], pvis: [], corridor: null, sampling: null }); });
  const xml = LX.writeLandXml({ name: 'rail', units: 'm', points: [], surfaces: [], alignments: [{ name: 'Main', alignment: p.alignment(p.state.alignments[0]) }] });
  const want = LX.SPI_TYPES[kind];
  ok(xml.includes(`spiType="${want}"`), `${kind}: written as spiType="${want}"`);
  const back = LX.readLandXml(xml);
  const pi = back.alignments[0]?.pis?.[1];
  ok(pi && pi.tr === kind && Math.abs(pi.ls1 - 90) < 1e-6 && Math.abs(pi.r - 700) < 1e-6, `${kind}: read back as one PI with tr, r 700, Ls 90 (${pi && pi.ls1})`);
}

// ------------------------------------------------------------------------------------------------------------------------------
section('equilibrium cant');
near(RL.equilibriumCant(160, 2000, 1500), (11.8 * 160 * 160) / 2000, 0.05, 'E = 11.8·V²/R: 160 km/h, R 2000 m → 151 mm');
near(RL.equilibriumCant(100, 600, 1500), (11.8 * 100 * 100) / 600, 0.1, 'E = 11.8·V²/R: 100 km/h, R 600 m → 197 mm');
{
  const V = 60, Rft = 2000, D = 5729.578 / Rft;
  const E = RL.equilibriumCant(RL.kmh(V, 'mph'), RL.toM(Rft, 'ft'), 59.5 * 25.4) / 25.4;
  near(E / (0.0007 * D * V * V), 1, 0.015, `feet: AREMA E = 0.0007·D·V² (60 mph, 2000 ft: ${E.toFixed(2)} in)`);
}
ok(RL.baseOf(RL.railDefaults('m')) === 1435 + 72, 'rail centres: the gauge + the 60E1 head (1507 mm) unless set');
ok(RL.baseOf({ ...RL.railDefaults('m'), base: 1500 }) === 1500, 'rail centres: as set');

section('the cant plan: ramps, segments, rail heights');
const mkAl = (kind, cant, opts = {}) => AL.buildAlignment({ pis: [{ x: 0, y: 0 }, { x: 800, y: 0, r: 600, ls1: opts.ls ?? 120, ls2: opts.ls ?? 120, tr: kind, cant }, { x: 800 + 800 * Math.cos(0.5), y: 800 * Math.sin(0.5) }] });
{
  const al = mkAl('clothoid', 120), rail = RL.cleanRail({ on: true }, 'm'), plan = RL.cantPlan(al, rail, { speed: 130, units: 'm', id: 'a1', name: 'Main' });
  const c = plan.curves[0];
  ok(c.high === 'R' && c.dir === 'left' && c.cant === 120, 'a left-hand curve: the right (outer) rail is high');
  near(RL.cantAt(plan, (c.ts + c.sc) / 2).E, 60, 1e-9, 'clothoid: linear ramp, half the cant half-way along the transition');
  near(RL.cantAt(plan, (c.sc + c.cs) / 2).R, 120, 1e-9, 'low-rail pivot: the outer rail 120 mm up on the curve');
  near(RL.cantAt(plan, (c.sc + c.cs) / 2).L, 0, 1e-9, '… the inner (low) rail stays on the profile');
  near(c.rampIn.gradient, 120 / 120, 1e-9, 'gradient 120 mm over 120 m = 1 mm/m');
  near(c.rampIn.rate, (130 / 3.6) * 1, 1e-9, 'rate = gradient × speed = 36.1 mm/s');
  near(c.eq, RL.equilibriumCant(130, 600, 1507), 1e-9, 'equilibrium cant from the line speed (base 1507)');
  near(c.deficiency, c.eq - 120, 1e-9, 'deficiency = equilibrium − applied');
  // segments: contiguous, cover the alignment, IFC fields
  const S = plan.segments;
  ok(S.length === 5 && S.map((s) => s.type).join() === 'CONSTANTCANT,LINEARTRANSITION,CONSTANTCANT,LINEARTRANSITION,CONSTANTCANT', 'segments: straight, ramp, full cant, ramp, straight (' + S.map((s) => s.type).join() + ')');
  ok(S.every((s, i) => !i || Math.abs(s.start - (S[i - 1].start + S[i - 1].length)) < 1e-9) && Math.abs(S[0].start - al.start) < 1e-9 && Math.abs(S.at(-1).start + S.at(-1).length - al.end) < 1e-9, 'segments are contiguous from the start to the end');
  ok(S[1].startCant === 0 && S[1].endCant === 120 && S[1].startRight === 0 && S[1].endRight === 120 && S[1].endLeft === 0, 'the ramp segment: 0 → 120 mm, right rail 0 → 120, left 0');
  const pc = RL.cantPlan(al, { ...rail, pivot: 'centre' }, { units: 'm' });
  near(RL.cantAt(pc, (c.sc + c.cs) / 2).L, -60, 1e-9, 'centre pivot: the inner rail 60 mm down …');
  near(RL.cantAt(pc, (c.sc + c.cs) / 2).R, 60, 1e-9, '… the outer 60 mm up');
  ok(plan.warnings.some((w) => w.code === 'rail.cant.deficiency') && !plan.warnings.some((w) => w.code === 'rail.cant.gradient'), 'at 130 km/h on R 600 the deficiency (' + c.deficiency.toFixed(0) + ' mm) is over 130: warned; the gradient is fine');
}
{
  const al = mkAl('bloss', 100), plan = RL.cantPlan(al, RL.cleanRail({ on: true }, 'm'), { units: 'm' }), c = plan.curves[0];
  near(RL.cantAt(plan, c.ts + 0.25 * (c.sc - c.ts)).E, 100 * (3 / 16 - 2 / 64), 1e-9, 'Bloss: the cant follows 3u² − 2u³ (a quarter of the way: 15.6 mm)');
  near(RL.cantAt(plan, c.st - 0.25 * (c.st - c.cs)).E, 100 * (3 / 16 - 2 / 64), 1e-9, 'Bloss: and the same mirrored at the exit');
  near(c.rampIn.gradient, 1.5 * 100 / 120, 1e-9, 'Bloss: steepest gradient 1.5 × E / L');
  ok(plan.segments[1].type === 'BLOSSCURVE' && plan.segments[3].type === 'BLOSSCURVE', 'segments typed BLOSSCURVE');
  ok(plan.warnings.length === 1 && plan.warnings[0].code === 'rail.speed.none' && plan.warnings[0].severity === 'note', 'no design speed: a note that deficiency and rate are not checked');
  for (const [k, peak, type] of [['helmert', 2, 'HELMERTCURVE'], ['sinehalf', Math.PI / 2, 'COSINECURVE'], ['sine', 2, 'SINECURVE'], ['cubic', 1, 'LINEARTRANSITION']]) {
    const p2 = RL.cantPlan(mkAl(k, 100), RL.cleanRail({ on: true }, 'm'), { units: 'm' }), c2 = p2.curves[0];
    near(c2.rampIn.gradient, (peak * 100) / RL.toM(c2.sc - c2.ts, 'm'), 1e-9, `${k}: steepest gradient ${peak.toFixed(3)} × E / L`);
    ok(p2.segments[1].type === type, `${k}: ramp segment ${type}`);
  }
}
{
  // limits: cant, excess, gradient, rate; ramps on the straight without a transition; overlap
  const rail = RL.cleanRail({ on: true, limits: { cant: 100, deficiency: 130, excess: 50, gradient: 1, rate: 20 } }, 'm');
  const plan = RL.cantPlan(mkAl('clothoid', 150, { ls: 60 }), rail, { speed: 80, minSpeed: 30, units: 'm', id: 'a1', name: 'Main' });
  const codes = new Set(plan.warnings.map((w) => w.code));
  for (const k of ['rail.cant.max', 'rail.cant.excess', 'rail.cant.gradient', 'rail.cant.rate']) ok(codes.has(k), 'warned: ' + k);
  const w = plan.warnings.find((x) => x.code === 'rail.cant.max');
  ok(w.severity === 'warning' && w.hard === false && w.ref === 'a1' && w.about.kind === 'alignment' && w.limit === 100 && w.value === 150 && w.unit === 'mm' && w.part === 'pi2', 'the Problems shape: severity, about, part, limit, value, unit');
  ok(/PI 2 \(150 mm\)/.test(w.text), 'its words: ' + w.text);
  const plain = AL.buildAlignment({ pis: [{ x: 0, y: 0 }, { x: 500, y: 0, r: 800, cant: 90 }, { x: 900, y: 300 }] });
  const pp = RL.cantPlan(plain, RL.cleanRail({ on: true, limits: { gradient: 1.5 } }, 'm'), { units: 'm' });
  const c = pp.curves[0];
  ok(pp.warnings.filter((x) => x.code === 'rail.cant.notransition').length === 2, 'a curve with cant and no transitions: said at both ends');
  near(c.rampIn.to - c.rampIn.from, 60, 1e-9, 'its ramp runs on the straight, 90 mm / 1.5 mm/m = 60 m, ending at the PC');
  ok(Math.abs(c.rampIn.to - c.ts) < 1e-9 && Math.abs(c.rampOut.from - c.st) < 1e-9, '… and starts again at the PT');
  const two = AL.buildAlignment({ pis: [{ x: 0, y: 0 }, { x: 300, y: 0, r: 400, cant: 100 }, { x: 556, y: 192, r: 400, cant: 100 }, { x: 856, y: 192 }] });
  ok(two.ok && RL.cantPlan(two, RL.cleanRail({ on: true }, 'm'), { units: 'm' }).warnings.some((x) => x.code === 'rail.cant.overlap'), 'two curves whose straight-line ramps overlap: warned');
}

// ------------------------------------------------------------------------------------------------------------------------------
section('the track section');
{
  const rail = RL.cleanRail({ on: true, sub: { fall: 0, depth: 0.2, cess: 0.5 }, ballast: { depth: 0.3, shoulder: 0.4, slope: 1.5 } }, 'm');
  const s = RL.trackShape(rail, { hL: 0, hR: 0 }, 'm'), k = s.tracks[0], S = rail.sleeper;
  near(k.rails[0].o, -1.507 / 2, 1e-12, 'rails ±base/2 from the centre');
  near(k.sleeper[0].z, -(0.172 + 0.010), 1e-12, 'the sleeper top is the rail (172 mm) + pad (10 mm) under the rail head');
  near(k.sleeper[3].z - s.z0, 0.3, 1e-12, 'the ballast is 0.3 m deep under the sleeper (level track)');
  // level, no fall: the ballast is a trapezoid — top = sleeper + 2 shoulders, height = depth + sleeper depth − crib, sides at 1.5:1
  const H = 0.3 + S.depth - 0.03, top = S.length + 0.8, bot = top + 2 * 1.5 * H;   // the ballast's top 30 mm under the sleepers' (crib)
  near(s.areas.ballast, ((top + bot) / 2) * H, 1e-9, `ballast area by hand: ${(((top + bot) / 2) * H).toFixed(4)} m²`);
  near(s.areas.sub, (bot + 2 * 0.5) * 0.2, 1e-9, 'sub-ballast: (toe to toe + 2 cess) × 0.2');
  const codes = s.top.R.map((q) => q.code).join();
  ok(codes === 'CL,SLP,BSH,BTOE,CESS', 'the ballast top from the centre out: ' + codes);
  // canted 150 mm about the low rail: the low rail stays, the high one rises; the formation stays level
  const c = RL.trackShape(rail, { hL: 0, hR: 150 }, 'm'), kc = c.tracks[0];
  near(kc.rails[0].z, 0, 1e-12, 'canted: the low (left) rail stays on the profile');
  near(kc.rails[1].z, 0.15, 1e-12, '… the high rail 150 mm up');
  near(kc.slope, 0.15 / 1.507, 1e-12, '… the sleeper tilts with them');
  near(kc.sleeper[3].z + (kc.sleeper[2].z - kc.sleeper[3].z) * ((kc.rails[0].o - kc.sleeper[3].o) / (kc.sleeper[2].o - kc.sleeper[3].o)) - c.z0, 0.3, 1e-9, '… still 0.3 m of ballast under the low rail');
  near(c.top.L.find((q) => q.code === 'CESS').z, c.top.R.find((q) => q.code === 'CESS').z, 1e-12, '… the formation is not tilted (both cess edges level, no fall)');
  // two tracks
  const t2 = RL.trackShape({ ...rail, tracks: 2, centres: 4 }, {}, 'm');
  ok(t2.tracks.length === 2 && Math.abs(t2.tracks[0].c + 2) < 1e-12 && Math.abs(t2.tracks[1].c - 2) < 1e-12, 'two tracks, 4 m centres, either side of the alignment');
  ok(t2.top.R.map((q) => q.code).join() === 'CL,SLP,SLP2,BSH,BTOE,CESS', 'two tracks: both sleeper ends on each side');
}

section('a straight track built as a corridor: quantities by hand');
function siteProject(units = 'm') {
  const p = new PJ.Project();
  const pts = [];
  for (let i = -6; i <= 30; i++) for (let j = -12; j <= 20; j++) pts.push({ n: String(pts.length + 1), x: i * 25, y: j * 25, z: 100, d: 'EG' });
  p.setPoints(pts, 'flat.csv');
  p.change('units', (s) => { s.units = units; });
  return p;
}
{
  const p = siteProject('m');
  p.change('track', (s) => { s.alignments.push({ id: 'a1', name: 'Down main', start: 0, pis: [{ x: 0, y: 0, r: 0 }, { x: 300, y: 0, r: 0 }], pvis: [{ sta: 0, z: 101, L: 0 }, { sta: 300, z: 101, L: 0 }], corridor: { on: true, cut: 2, fill: 2, step: 10 }, sampling: null, rail: RL.cleanRail({ on: true, sub: { fall: 0 } }, 'm') }); });
  const it = p.graded().items.find((x) => x.id === 'a1');
  ok(it && !it.problems.length && it.rail, 'the corridor builds as a track (info.rail)');
  const q = it.rail.quantities, rail = p.state.alignments[0].rail, S = rail.sleeper;
  near(q.length, 300, 1e-9, 'track length 300 m');
  ok(q.sleepers === Math.floor(300 / 0.6 + 1e-9) + 1, `sleepers every 0.6 m: ${q.sleepers}`);
  near(q.railLength, 600, 1e-6, 'rail: two rails × 300 m');
  const shape = RL.trackShape(rail, {}, 'm');
  near(q.ballastGross, shape.areas.ballast * 300, 1e-6, 'ballast bed = its area × 300 m');
  near(q.ballast, q.ballastGross - q.sleepers * S.length * S.width * (S.depth - rail.ballast.crib), 1e-6, 'net ballast = the bed less the sleepers\' part in it (they stand 30 mm proud)');
  near(q.sleeperVolume, q.sleepers * S.length * S.width * S.depth, 1e-9, 'sleeper volume = count × 2.6 × 0.28 × 0.22');
  near(q.sub, shape.areas.sub * 300, 1e-6, 'sub-ballast = its area × 300 m');
  const sec = it.sections[3];
  near(sec.det.R.find((x) => x.code === 'SLP').z, 101 - 0.182 - 0.03, 1e-9, 'the design surface at the sleeper end = the ballast top, 30 mm under the sleeper top (profile − rail − pad − crib)');
  ok(it.lines.BSH_L && it.lines.BTOE_R && it.lines.CESS_L, 'feature lines for the ballast shoulder, toe and cess');
  // undo: one step for a cant change
  const before = p.undoStack.length;
  p.change('cant', (s) => { s.alignments[0].pis[1].cant = 50; });
  ok(p.undoStack.length === before + 1 && p.undo() === 'cant', 'a change is one undo step');
}

section('a curved track: cant, quantities, sections, plan, 3D, sheets, the file, Problems');
const p = siteProject('m');
p.change('track', (s) => {
  s.alignments.push({ id: 'a1', name: 'Up main', start: 0, pis: [{ x: 0, y: 0, r: 0 }, { x: 300, y: 0, r: 400, ls1: 80, ls2: 80, tr: 'bloss', cant: 110 }, { x: 300 + 300 * Math.cos(0.7), y: 300 * Math.sin(0.7), r: 0 }],
    pvis: [{ sta: 0, z: 101, L: 0 }, { sta: 600, z: 101, L: 0 }], corridor: { on: true, cut: 2, fill: 2, step: 5 }, sampling: { step: 25, left: 15, right: 15, extra: [] }, design: { speed: 100, unit: 'km/h' }, rail: RL.cleanRail({ on: true, tracks: 2, centres: 4 }, 'm') });
});
const a = p.state.alignments[0], al = p.alignment(a), it = p.graded().items.find((x) => x.id === 'a1');
ok(al.ok && it && it.rail && !it.problems.length, 'a curved, canted, two-track railway builds');
{
  const plan = p.railPlan(a), c = plan.curves[0];
  ok(c.cant === 110 && c.tr === 'bloss' && c.eq > 0, 'railPlan: the curve with its cant and its Bloss ramps');
  const mid = it.sections.find((s) => s.sta > c.sc + 5 && s.sta < c.cs - 5);
  ok(mid && Math.abs(mid.track.E - 110) < 1e-9 && mid.track.shape.tracks.every((k) => Math.abs(k.slope - 0.11 / 1.507) < 1e-12), 'on the curve every track is tilted by 110 mm over 1507');
  ok(mid.track.hL === 0 && mid.track.hR === 110, 'a left-hand curve about the low rail: right rail up');
  const q = it.rail.quantities;
  ok(q.tracks.length === 2 && q.tracks[0].length < q.tracks[1].length, `two tracks: the inner (left, ${q.tracks[0].length.toFixed(2)}) is shorter than the outer (${q.tracks[1].length.toFixed(2)})… `);
  near(q.tracks[1].length - q.tracks[0].length, 4 * Math.abs(AL.normAng(al.pointAt(al.end).dir - al.pointAt(al.start).dir)), 0.05, '… by the centres × the total turn (0.7 rad × 4 m)');
  ok(q.sleepers === q.tracks[0].sleepers + q.tracks[1].sleepers && q.railLength > 4 * al.length * 0.99, 'sleepers and rail of both tracks counted');
  // Problems
  const probs = PB.civilProblems({ alignments: [], rail: p.railWarnings() }, { t: I18N.t, unit: 'm' });
  const def = probs.find((x) => x.code === 'rail.cant.deficiency');
  ok(def && def.severity === 'warning' && def.about[0].id === 'a1' && def.req.op === '<=' && def.req.value === 130 && def.found.value > 130 && def.source.name === 'civilcraft.rail', 'Problems: the deficiency as { code, severity, about, req, found }');
  // sections: track lines in the layers
  const secs = p.sections(a);
  const layerCodes = new Set(secs.sections.flatMap((s) => s.layers.map((l) => l.code)));
  ok(['SLEEPER', 'RAIL', 'BALLAST', 'SUBBALLAST'].every((k) => layerCodes.has(k)), 'sections: sleepers, rails, ballast and sub-ballast bottoms drawn');
  // plan
  const items = RL.railSceneItems([it]);
  ok(items.filter((x) => x.layer === 'C-RAIL-TRAK').length === 4 && items.filter((x) => x.layer === 'C-RAIL-CNTR').length === 2, 'plan: four rails and two track centres');
  ok(SC.LAYERS.some((l) => l.name === 'C-RAIL-TRAK') && SC.LAYERS.some((l) => l.name === 'C-RAIL-CNTR'), 'plan layers C-RAIL-TRAK and C-RAIL-CNTR');
  // 3D
  const sc = S3.buildSite3D(S3.siteInput(p), { exag: 2 });
  const sl = sc.instances.find((x) => x.key === 'sleepers');
  ok(sc.meshes.some((m) => m.key === 'rails' && m.indices.length > 0) && sc.meshes.some((m) => m.key === 'ballast' && m.onGround), '3D: rails and the ballast bed');
  ok(sl && sl.count === q.sleepers && sl.rot.length === 4 * sl.count, `3D: one instanced box per sleeper (${sl?.count}), each turned`);
  const qn = (i) => Math.hypot(sl.rot[4 * i], sl.rot[4 * i + 1], sl.rot[4 * i + 2], sl.rot[4 * i + 3]);
  ok([0, 100, sl.count - 1].every((i) => Math.abs(qn(i) - 1) < 1e-6), 'the quaternions are unit length');
  const ex = S3L.expandInstances(sc).find((m) => m.key === 'sleepers');
  ok(ex && ex.indices.length === 36 * sl.count, 'exports: the sleepers expanded to plain boxes');
  ok(!S3.buildSite3D(S3.siteInput(p), { show: { track: false } }).meshes.some((m) => m.key === 'rails'), 'Show › Track off: not drawn');
  // a sleeper on the curve lies across the track, tilted
  const k0 = sl.count - 1, q0 = [sl.rot[4 * k0], sl.rot[4 * k0 + 1], sl.rot[4 * k0 + 2], sl.rot[4 * k0 + 3]];
  const across = (await mod('site3d-rail.js')).rotateQ(q0, [0, 1, 0]);
  near(Math.abs(across[0] * Math.cos(0.7) + across[1] * Math.sin(0.7)), 0, 1e-6, 'the last sleeper lies square to the track at its end (heading 0.7 rad)');
  // sheets: a cant band under the profile
  const scale = { mmPerUnit: 1, label: '1:1000' };
  const out = PP.planProfileSheets({ layers: SC.LAYERS, items }, { alignment: al, eg: p.egProfile(a), profile: p.designProfile(a), scale, units: 'm', name: 'Up main', cant: p.railPlan(a) });
  ok(out.sheets.some((sh) => sh.views[1].texts.some((x) => x.text === 'Cant')), 'plan and profile sheets: a cant band under the profile');
  const out0 = PP.planProfileSheets({ layers: SC.LAYERS, items }, { alignment: al, eg: p.egProfile(a), profile: p.designProfile(a), scale, units: 'm', name: 'Up main' });
  ok(!out0.sheets.some((sh) => sh.views[1].texts.some((x) => x.text === 'Cant')), '… and none without it');
}
{
  // the project file
  const back = PJ.Project.fromJSON(JSON.parse(JSON.stringify(p.toJSON()))).project, b = back.state.alignments[0];
  ok(b.rail && b.rail.on && b.rail.tracks === 2 && b.rail.centres === 4 && b.pis[1].cant === 110 && b.pis[1].tr === 'bloss', 'the file keeps rail, the cant and the transition');
  ok(JSON.stringify(back.railPlan(b).segments) === JSON.stringify(p.railPlan(a).segments), '… and the same cant plan comes back');
  const junk = PJ.Project.fromJSON({ format: 'civilcraft-project', version: 1, units: 'm', alignments: [{ id: 'a1', name: 'x', pis: [{ x: 0, y: 0 }, { x: 100, y: 0, r: 50, tr: '<script>', cant: 9999 }, { x: 200, y: 50 }], pvis: [], rail: { on: true, gauge: 'wide', tracks: 99, rail: 'X', pivot: 'up', sleeper: { length: -1 }, limits: { cant: 1e9 } } }] }).project.state.alignments[0];
  ok(!junk.pis[1].tr && !junk.pis[1].cant, 'junk transition and cant dropped');
  ok(junk.rail.gauge === 1435 && junk.rail.tracks === 1 && junk.rail.rail === '60E1' && junk.rail.pivot === 'low' && junk.rail.sleeper.length === 2.6 && junk.rail.limits.cant === 160, 'junk rail settings fall back to the defaults');
  ok(RL.cleanRail(null) === null && RL.cleanRail('x') === null, 'no rail → null');
}
{
  // feet: the defaults and units
  const d = RL.railDefaults('ft');
  ok(d.rail === '115RE' && d.sleeper.spacing === 1.625 && d.sleeper.material === 'timber', 'feet: 115RE rail, timber sleepers every 19.5 in');
  near(RL.mmTo(304.8006096, 'ft'), 1, 1e-9, 'mm → US survey feet');
}

// ---------------------------------------------------------------------------
// 0.8 CV.1 (civil_PART_4): the standard a setup cites; no number from it is built in
{
  const RS = await mod('rail-standard.js');
  ok(RS.cleanStd('eu') === 'eu' && RS.cleanStd('aarema') === 'none' && RS.cleanStd(null) === 'none', 'only none and eu are standards');
  const c = RS.cleanCites({ cant: '  EN 13803 clause entered by the engineer  ', deficiency: 5, bogus: 'x', rate: 'y'.repeat(500) });
  ok(c.cant === 'EN 13803 clause entered by the engineer' && !('deficiency' in c) && !('bogus' in c) && c.rate.length === 120, 'clauses are trimmed text, bounded, and only for the limits');
  const r = RL.cleanRail({ on: true, std: 'eu', cites: { cant: 'x' } }, 'm');
  ok(r.std === 'eu' && r.cites.cant === 'x', 'the setup keeps its standard and clause'); ok(RL.cleanRail({ on: true }, 'm').std === 'none' && Object.keys(RL.cleanRail({ on: true }, 'm').cites).length === 0, 'default: none, no clauses');
  const d = RL.railDefaults('m'), e = RL.cleanRail({ on: true, std: 'eu' }, 'm');
  ok(JSON.stringify(e.limits) === JSON.stringify(d.limits), 'naming the European standard changes no number: the limits are the same placeholders');
  ok(RS.STANDARDS.eu.docs.length >= 3 && RS.STANDARDS.eu.docs.every((x) => /^EN \d+$/.test(x.ref) && x.title && !('clause' in x)), 'documents are named by title; no clause number is shipped');
  ok(RS.citeOf(e, 'cant').placeholder === true && RS.citeOf(e, 'cant').clause === '', 'what a result may say: a placeholder, clause not entered');
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
