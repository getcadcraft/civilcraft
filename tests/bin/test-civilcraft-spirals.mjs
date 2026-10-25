#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-civilcraft-spirals.mjs — CivilCraft 0.7 D7.35: clothoid spirals in alignments (alignment.js), LandXML in and out
 * (landxml.js, validated against the 1.2 XSD when lxml is there), superelevation through spirals (superelev.js). DOM-free.
 *
 *   node bin/test-civilcraft-spirals.mjs [--build dev|x.y] [--verbose]
 *
 * Known answers. By the defining formulas (AASHTO "A Policy on Geometric Design", the usual highway-curves text): θs = Ls / 2R,
 * Xc = Ls(1 − θs²/10 + θs⁴/216 − …), Yc = Ls(θs/3 − θs³/42 + θs⁵/1320 − …), p = Yc − R(1 − cos θs), k = Xc − R sin θs,
 * Ts = (R + p) tan(Δ/2) + k, Es = (R + p) sec(Δ/2) − R, Lc = R(Δ − 2θs). The series are also checked against an independent
 * numerical integration of the clothoid's own definition (heading θ(l) = l² / 2RLs, x = ∫cos θ, y = ∫sin θ, Simpson, 4000
 * steps), and the alignment is checked as geometry: it turns by exactly Δ, stations run through the spirals, the curve closes.
 * No textbook table was available on this server; the printed values 8.594°, 299.33, 14.98, 3.75 and 149.89 for Ls 300 / R 1000
 * are those of the usual worked example and are asserted below to the digits a table prints.
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
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
const SE = await mod('superelev.js');
const LX = await mod('landxml.js');
const PJ = await mod('project.js');
const TOOLS = path.join(REPO, 'tools/civilcraft-test');
const python = fs.existsSync(path.join(TOOLS, 'venv/bin/python')) ? path.join(TOOLS, 'venv/bin/python') : 'python3';
const OUT = fs.mkdtempSync(path.join(REPO, 'tmp/spirals-test-'));
process.on('exit', () => fs.rmSync(OUT, { recursive: true, force: true }));

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; if (VERBOSE) console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };
const near = (a, b, tol, m) => ok(Number.isFinite(a) && Math.abs(a - b) <= tol, `${m} (${a} vs ${b}, ±${tol})`);
const section = (s) => console.log('\n== ' + s);
const D = Math.PI / 180;

// the clothoid by its definition: Simpson over the heading
function integrate(l, R, Ls, n = 4000) {
  const th = (s) => (s * s) / (2 * R * Ls), h = l / n;
  let x = 0, y = 0;
  for (let i = 0; i <= n; i++) { const w = i === 0 || i === n ? 1 : i % 2 ? 4 : 2; x += w * Math.cos(th(i * h)); y += w * Math.sin(th(i * h)); }
  return { x: (x * h) / 3, y: (y * h) / 3 };
}

section('the spiral constants (Ls 300, R 1000)');
{
  const K = AL.spiralConstants(1000, 300);
  near(K.th / D, 8.5944, 5e-4, 'θs = Ls / 2R = 0.15 rad = 8.5944°');
  near(K.Xc, 299.33, 5e-3, 'Xc = 299.33'); near(K.Yc, 14.98, 5e-3, 'Yc = 14.98');
  near(K.p, 3.75, 5e-3, 'p = 3.75 (Ls² / 24R = 3.75 to the first term)'); near(K.k, 149.89, 5e-3, 'k = 149.89 (Ls / 2 − Ls³ / 240R² = 149.875 to the first terms)');
  near(K.p, (300 * 300) / (24 * 1000), 0.01, 'p ≈ Ls² / 24R'); near(K.k, 150 - 300 ** 3 / (240 * 1000 ** 2), 0.02, 'k ≈ Ls / 2 − Ls³ / 240R²');
  for (const [R, Ls] of [[1000, 300], [250, 100], [60, 60], [800, 80], [100, 150], [30, 45]]) {
    const c = AL.clothoid(Ls, R, Ls), q = integrate(Ls, R, Ls);
    near(c.x, q.x, 1e-6, `series = numerical integration, x (R ${R}, Ls ${Ls})`); near(c.y, q.y, 1e-6, `y (R ${R}, Ls ${Ls})`);
    const mid = AL.clothoid(Ls / 2, R, Ls), qm = integrate(Ls / 2, R, Ls);
    near(mid.x, qm.x, 1e-6, 'and at the middle, x'); near(mid.y, qm.y, 1e-6, 'y');
  }
  const none = AL.spiralConstants(1000, 0);
  ok(none.p === 0 && none.k === 0 && none.Xc === 0, 'no spiral: all zero');
}

section('a symmetric spiral curve, by the textbook formulas');
// PI at (1000, 0) between an east tangent and a tangent turning 40° left; R 1000, Ls 300 each end
const Dl = 40 * D, R = 1000, Ls = 300;
const pi1 = { x: 1000, y: 0 }, out = { x: 1000 + 800 * Math.cos(Dl), y: 800 * Math.sin(Dl) };
const al = AL.buildAlignment({ pis: [{ x: 0, y: 0 }, { ...pi1, r: R, ls: Ls }, out], start: 0 });
const K = AL.spiralConstants(R, Ls);
{
  ok(al.ok && al.elements.map((e) => e.type).join() === 'line,spiral,arc,spiral,line', 'tangent, spiral, curve, spiral, tangent');
  const c = al.curves[0];
  const Ts = (R + K.p) * Math.tan(Dl / 2) + K.k, Es = (R + K.p) / Math.cos(Dl / 2) - R, Lc = R * (Dl - 2 * K.th);
  near(c.T1, Ts, 1e-9, `Ts = (R + p) tan(Δ/2) + k = ${Ts.toFixed(3)}`); near(c.T2, Ts, 1e-9, 'the same at the far end');
  near(Ts, 515.22, 5e-3, 'Ts = 515.22');
  near(c.Es, Es, 1e-9, `Es = (R + p) sec(Δ/2) − R = ${Es.toFixed(3)}`); near(Es, 68.165, 5e-3, 'Es = 68.17');
  near(c.Lc, Lc, 1e-9, `Lc = R(Δ − 2θs) = ${Lc.toFixed(3)}`); near(c.theta1, 0.15, 1e-12, 'θs 0.15 rad');
  near(c.ts, 1000 - Ts, 1e-9, 'TS station = PI − Ts (start 0)'); near(c.sc, c.ts + Ls, 1e-9, 'SC = TS + Ls'); near(c.cs, c.sc + Lc, 1e-9, 'CS = SC + Lc'); near(c.st, c.cs + Ls, 1e-9, 'ST = CS + Ls');
  near(al.length, (1000 - Ts) + 2 * Ls + Lc + (800 - Ts), 1e-9, 'total length = tangent + 2Ls + Lc + tangent');
  const [l0, sp1, arc, sp2, l1] = al.elements;
  near(sp1.p0.x, 1000 - Ts, 1e-9, 'the TS lies on the first tangent Ts before the PI'); near(sp1.p0.y, 0, 1e-12, 'on the axis');
  near(sp1.p1.x, 1000 - Ts + K.Xc, 1e-9, 'SC at (Xc, Yc) from the TS, along the tangent'); near(sp1.p1.y, K.Yc, 1e-9, 'and Yc off it');
  near(sp1.dir1, K.th, 1e-12, 'the heading at the SC is θs');
  near(arc.delta, Dl - 2 * K.th, 1e-12, 'the circular curve turns Δ − 2θs');
  near(Math.hypot(arc.p0.x - arc.c.x, arc.p0.y - arc.c.y), R, 1e-9, 'the SC is on the circle'); near(Math.hypot(sp2.p0.x - arc.c.x, sp2.p0.y - arc.c.y), R, 1e-6, 'and so is the CS');
  near(Math.hypot(sp2.p0.x - arc.p1.x, sp2.p0.y - arc.p1.y), 0, 1e-6, 'the curve ends where the second spiral starts');
  near(Math.hypot(sp2.p1.x - l1.p0.x, sp2.p1.y - l1.p0.y), 0, 1e-6, 'the second spiral ends where the last tangent starts');
  near(l1.dir, Dl, 1e-12, 'the last tangent is at Δ');
  // the circle is R + p from each tangent, and the PI-centre distance gives Es
  near(Math.hypot(arc.c.x - 1000, arc.c.y), R + Es, 1e-6, 'the centre is R + Es from the PI');
  // heading and curvature along the whole thing, by finite differences
  let worst = 0;
  for (let s = 1; s < al.length - 1; s += 7.3) {
    const a = al.pointAt(s - 0.01), b = al.pointAt(s + 0.01), m = al.pointAt(s);
    worst = Math.max(worst, Math.abs(Math.atan2(b.y - a.y, b.x - a.x) - m.dir));
  }
  ok(worst < 1e-6, 'pointAt: the heading is the direction of travel everywhere (' + worst.toExponential(1) + ')');
  // curvature through the spiral grows linearly: 0 at the TS, 1/R at the SC, half-way 1/2R
  const kap = (s) => { const h = 0.05, a = al.pointAt(s - h).dir, b = al.pointAt(s + h).dir; return (b - a) / (2 * h); };
  near(kap(c.ts + Ls / 2), 1 / (2 * R), 1e-6, 'curvature at the middle of the spiral is 1/2R'); near(kap(c.sc + 5), 1 / R, 1e-6, 'and 1/R on the circle'); near(kap(c.ts + 0.2), 0.2 / (R * Ls), 1e-6, 'and l / (R·Ls) near the TS');
  near(kap(c.cs + Ls / 2), 1 / (2 * R), 1e-6, 'and the same going out');
}

section('stationing through the spirals');
{
  const c = al.curves[0];
  for (const s of [10, c.ts, c.ts + 100, c.sc, c.sc + 100, c.cs, c.cs + 150, c.st, c.st + 50, al.end - 1]) {
    const p = al.pointAt(s), so = al.stationOffset(p.x, p.y);
    near(so.sta, s, 1e-6, `station ${s.toFixed(2)} → point → station`); near(so.off, 0, 1e-6, '  and offset 0');
    const side = al.stationOffset(p.x + 5 * Math.sin(p.dir), p.y - 5 * Math.cos(p.dir));
    ok(Math.abs(side.off - 5) < 1e-6 && Math.abs(side.sta - s) < 1e-6, '  5 to the right → offset +5 at the same station');
  }
  // stations are arc length: the polyline's length, summed, equals the alignment's
  const pl = al.polyline(5);
  let len = 0; for (let i = 1; i < pl.length; i++) len += Math.hypot(pl[i].x - pl[i - 1].x, pl[i].y - pl[i - 1].y);
  near(len, al.length, 0.02, 'the polyline is as long as the stationing says');
  near(pl[pl.length - 1].sta, al.end, 1e-9, 'and ends at the end station');
  const ks = al.keyStations().map((k) => k.kind).join();
  ok(ks === 'Start,TS,SC,CS,ST,End', 'key stations: ' + ks);
  const tk = al.ticks(100);
  ok(tk.length === 18 && Math.abs(tk[8].sta - 800) < 1e-9, 'ticks every 100 run through the spirals');
  const pc = al.pieces();
  near(pc.reduce((s, e) => s + e.len, 0), al.length, 1e-9, 'pieces (spirals as short lines) keep the length'); ok(pc.every((e) => e.type !== 'spiral'), 'and have no spiral');
}

section('spirals that differ, one end only, right turns');
{
  // unequal spirals: 150 in, 90 out, to the right (south-east) 50°
  const d2 = 50 * D, R2 = 400, a = AL.buildAlignment({ pis: [{ x: 0, y: 0 }, { x: 600, y: 0, r: R2, ls1: 150, ls2: 90 }, { x: 600 + 500 * Math.cos(-d2), y: 500 * Math.sin(-d2) }] });
  const c = a.curves[0], S1 = AL.spiralConstants(R2, 150), S2 = AL.spiralConstants(R2, 90);
  ok(a.ok && !c.ccw && a.elements.length === 5, 'unequal spirals to the right build');
  // by hand: T1 = k1 + (R+p2... the general case: the centre is R+p1 from the first tangent and R+p2 from the second
  const [, sp1, arc, sp2, l1] = a.elements;
  const dist = (p, q, ang) => Math.abs((p.x - q.x) * Math.sin(ang) - (p.y - q.y) * Math.cos(ang));
  near(dist(arc.c, { x: 0, y: 0 }, 0), R2 + S1.p, 1e-6, 'the centre is R + p1 from the first tangent');
  near(dist(arc.c, l1.p0, -d2), R2 + S2.p, 1e-6, 'and R + p2 from the second');
  near(arc.delta, d2 - S1.th - S2.th, 1e-12, 'the curve turns Δ − θ1 − θ2'); near(l1.dir, -d2, 1e-12, 'exit heading −50°');
  near(Math.hypot(sp2.p0.x - arc.p1.x, sp2.p0.y - arc.p1.y), 0, 1e-6, 'closes at the CS'); near(Math.hypot(sp2.p1.x - l1.p0.x, sp2.p1.y - l1.p0.y), 0, 1e-6, 'closes at the ST');
  near(c.T1, S1.k + (R2 + S1.p) * Math.tan(d2 / 2) + ((S2.p - S1.p) / Math.sin(d2)), 1e-6, 'T1 = k1 + (R + p1) tan(Δ/2) + (p2 − p1) / sin Δ (the unequal-spiral form)');
  near(c.T2, S2.k + (R2 + S2.p) * Math.tan(d2 / 2) + ((S1.p - S2.p) / Math.sin(d2)), 1e-6, 'T2 the same, 1 ↔ 2');
  const p = a.pointAt(c.sc + 60), q = a.stationOffset(p.x - 3 * Math.sin(p.dir), p.y + 3 * Math.cos(p.dir));
  near(q.off, -3, 1e-6, 'a point 3 to the left of a right-hand curve is at −3');
  // one spiral only
  const b = AL.buildAlignment({ pis: [{ x: 0, y: 0 }, { x: 600, y: 0, r: 400, ls1: 100 }, { x: 900, y: 300 }] });
  ok(b.ok && b.elements.map((e) => e.type).join() === 'line,spiral,arc,line' && b.keyStations().map((k) => k.kind).join() === 'Start,TS,SC,PT,End', 'a spiral in and a plain end: TS, SC, PT');
  // radius 0 / no spiral at all is the old code, untouched
  const o = AL.buildAlignment({ pis: [{ x: 0, y: 0 }, { x: 1000, y: 0, r: 500 }, { x: 1700, y: 700 }] });
  near(o.curves[0].T1, 500 * Math.tan(Math.PI / 8), 1e-9, 'no spirals: T = R tan(Δ/2)'); ok(o.elements.map((e) => e.type).join() === 'line,arc,line', 'and no spiral element');
  // errors: spirals that turn more than the curve; spirals that do not fit between PIs
  const e1 = AL.buildAlignment({ pis: [{ x: 0, y: 0 }, { x: 600, y: 0, r: 100, ls: 200 }, { x: 900, y: 30 }] });
  ok(!e1.ok && /spirals at PI 2/.test(e1.errors[0]), 'spirals that turn more than the whole curve are refused: ' + e1.errors[0]);
  const e2 = AL.buildAlignment({ pis: [{ x: 0, y: 0 }, { x: 300, y: 0, r: 400, ls: 150 }, { x: 600, y: 200, r: 400, ls: 150 }, { x: 900, y: 0 }] });
  ok(!e2.ok && /overlap/.test(e2.errors[0]), 'two spiral curves too close are an overlap: ' + e2.errors[0]);
  const e3 = AL.buildAlignment({ pis: [{ x: 0, y: 0 }, { x: 600, y: 0, ls: 100 }, { x: 900, y: 300 }] });
  ok(e3.ok && !e3.curves.length, 'a spiral length with no radius is ignored');
}

section('the project file');
{
  const p = new PJ.Project();
  p.change('al', (s) => { s.alignments.push({ id: 'a1', name: 'A', start: 0, pis: [{ x: 0, y: 0 }, { x: 600, y: 0, r: 400, ls1: 100, ls2: 100 }, { x: 900, y: 300 }], pvis: [], corridor: null }); });
  const back = PJ.Project.fromJSON(JSON.parse(JSON.stringify(p.toJSON()))).project;
  const q = back.state.alignments[0].pis[1];
  ok(q.ls1 === 100 && q.ls2 === 100 && q.r === 400, 'spiral lengths are kept');
  const bad = PJ.Project.fromJSON({ ...JSON.parse(JSON.stringify(p.toJSON())), alignments: [{ id: 'a1', name: 'B', pis: [{ x: 0, y: 0 }, { x: 600, y: 0, r: 400, ls1: -5, ls2: 'x', ls: 50 }, { x: 900, y: 300, ls1: 9 }], pvis: [] }] }).project;
  const b1 = bad.state.alignments[0].pis;
  ok(b1[1].ls1 === 50 && b1[1].ls2 === 50 && !('ls' in b1[1]), 'untrusted: ls is both ends, junk lengths dropped'); ok(b1[2].ls1 === undefined || b1[2].ls1 === 0, 'no radius, no spiral');
}

section('LandXML out and back in (Spiral, Curve, Spiral)');
{
  const xml = LX.writeLandXml({ units: 'm', alignments: [{ name: 'Spiral road', alignment: al, pis: [] }] });
  const f = path.join(OUT, 'spiral.xml'); fs.writeFileSync(f, xml);
  ok((xml.match(/<Spiral /g) || []).length === 2 && /spiType="clothoid"/.test(xml) && /radiusStart="INF"/.test(xml) && /radiusEnd="INF"/.test(xml), 'two Spiral elements, clothoid, INF at the straight end');
  const m = /<Spiral rot="ccw"[^>]*length="300"[^>]*theta="([\d.]+)"[^>]*totalX="([\d.]+)" totalY="([\d.]+)" tanLong="([\d.]+)" tanShort="([\d.]+)" constant="([\d.]+)"/.exec(xml);
  ok(!!m, 'the spiral carries theta, totalX, totalY, tanLong, tanShort and constant');
  if (m) {
    near(Number(m[1]), 8.5944, 5e-4, 'theta 8.5944°'); near(Number(m[2]), K.Xc, 1e-3, 'totalX = Xc'); near(Number(m[3]), K.Yc, 1e-3, 'totalY = Yc');
    near(Number(m[4]), K.Xc - K.Yc / Math.tan(K.th), 1e-3, 'tanLong = Xc − Yc / tan θs'); near(Number(m[5]), K.Yc / Math.sin(K.th), 1e-3, 'tanShort = Yc / sin θs'); near(Number(m[6]), Math.sqrt(R * Ls), 1e-3, 'constant A = √(R·Ls)');
  }
  let chk = null;
  try { chk = JSON.parse(execFileSync(python, [path.join(TOOLS, 'check.py'), 'landxml', f], { encoding: 'utf8' })); } catch (e) { console.log('  (schema check not run: ' + String(e.message).split('\n')[0] + ')'); }
  if (chk) {
    ok(chk.schema === 'valid' || chk.schema === 'skipped', 'the file validates against the LandXML 1.2 XSD (' + chk.schema + ')' + (chk.schema_errors?.length ? ': ' + chk.schema_errors.join(' | ') : ''));
    if (chk.schema === 'skipped') console.log('  (schema check skipped: no lxml)');
  }
  const r = LX.readLandXml(xml);
  ok(r.alignments.length === 1 && !r.notes.some((n) => /skipped/.test(n)), 'read back: one alignment, nothing skipped');
  const pis = r.alignments[0].pis;
  ok(pis.length === 3, 'three PIs back'); near(pis[1].x, 1000, 1e-4, 'the PI is where it was (easting)'); near(pis[1].y, 0, 1e-4, '(northing)');
  near(pis[1].r, R, 1e-6, 'radius back'); near(pis[1].ls1, Ls, 1e-9, 'spiral in back'); near(pis[1].ls2, Ls, 1e-9, 'spiral out back');
  const again = AL.buildAlignment({ pis: r.alignments[0].pis, start: r.alignments[0].start });
  near(again.length, al.length, 1e-6, 'rebuilt from the file: the same length'); near(again.curves[0].ts, al.curves[0].ts, 1e-6, 'the same TS');
  const pa = al.pointAt(1000), pb = again.pointAt(1000);
  near(Math.hypot(pa.x - pb.x, pa.y - pb.y), 0, 1e-6, 'the same point at station 1000');
  // unequal spirals, a right turn and a spiral at one end only survive too
  const odd = AL.buildAlignment({ pis: [{ x: 0, y: 0 }, { x: 600, y: 0, r: 400, ls1: 150, ls2: 90 }, { x: 600 + 500 * Math.cos(-50 * D), y: 500 * Math.sin(-50 * D) }, { x: 1500, y: -800, r: 300, ls1: 80 }, { x: 1900, y: -1500 }] });
  ok(odd.ok, 'a two-curve alignment with unequal spirals builds: ' + odd.errors.join(' '));
  const x2 = LX.writeLandXml({ units: 'm', alignments: [{ name: 'Odd', alignment: odd, pis: [] }] });
  const r2 = LX.readLandXml(x2).alignments[0], o2 = AL.buildAlignment({ pis: r2.pis, start: 0 });
  ok(o2.ok && o2.curves.length === 2, 'read back: both curves'); near(o2.length, odd.length, 1e-3, 'same length');
  near(o2.curves[0].ls1, 150, 1e-9, 'unequal: 150 in'); near(o2.curves[0].ls2, 90, 1e-9, 'unequal: 90 out'); near(o2.curves[1].ls1, 80, 1e-9, 'one-sided: 80 in'); near(o2.curves[1].ls2, 0, 1e-12, 'none out');
  near(Math.hypot(odd.pointAt(1100).x - o2.pointAt(1100).x, odd.pointAt(1100).y - o2.pointAt(1100).y), 0, 1e-5, 'and the same point on the second curve');
  const f2 = path.join(OUT, 'odd.xml'); fs.writeFileSync(f2, x2);
  try { const c2 = JSON.parse(execFileSync(python, [path.join(TOOLS, 'check.py'), 'landxml', f2], { encoding: 'utf8' })); ok(c2.schema === 'valid' || c2.schema === 'skipped', 'the second file validates too (' + c2.schema + ')'); } catch { /* reported above */ }
  // a file from another program: Line - Spiral - Curve - Spiral - Line, written by hand with the PIs left out of the curve
  const hand = '<?xml version="1.0"?><LandXML xmlns="http://www.landxml.org/schema/LandXML-1.2" version="1.2"><Units><Metric linearUnit="meter" areaUnit="squareMeter" volumeUnit="cubicMeter" temperatureUnit="celsius" pressureUnit="milliBars"/></Units><Alignments><Alignment name="H" length="1" staStart="0"><CoordGeom>' +
    '<Line><Start>0 0</Start><End>0 100</End></Line>' +
    '<Spiral length="60" radiusStart="INF" radiusEnd="200" rot="cw" spiType="clothoid"><Start>0 100</Start><PI>0 130</PI><End>3.0 159.9</End></Spiral>' +
    '</CoordGeom></Alignment></Alignments></LandXML>';
  ok(LX.readLandXml(hand).alignments.length === 0, 'a lone spiral that ends in nothing is named, not guessed');
  const cubic = hand.replace('spiType="clothoid"', 'spiType="cubic"');
  const rc = LX.readLandXml(cubic);
  ok(rc.alignments.length === 0 && rc.notes.some((n) => /cubic/.test(n)), 'a cubic spiral is named and the alignment skipped');
  // metric → feet conversion keeps spiral lengths in step
  const sc = LX.scaleImport(LX.readLandXml(xml), 1 / 0.3048).alignments[0].pis[1];
  near(sc.ls1, Ls / 0.3048, 1e-9, 'scaleImport scales the spiral lengths');
}

section('superelevation through the spirals');
{
  const sp = { on: true, delta: 0.005, rate: [[0, 0.06]] };   // 6 % for these radii (a placeholder table)
  const plan = SE.superPlan(al, { super: sp, nc: 0.02, lane: 3.6 });
  const c = plan.curves[0], s = c.stations, k = al.curves[0];
  ok(plan.curves.length === 1 && c.spirals && c.e === 0.06, 'one curve, with spirals, e 6 %');
  near(s.lc0, k.ts, 1e-9, 'level crown at the TS'); near(s.fs0, k.sc, 1e-9, 'full superelevation at the SC');
  near(s.fs1, k.cs, 1e-9, 'full to the CS'); near(s.lc1, k.st, 1e-9, 'level crown again at the ST');
  near(c.Lr1, 300, 1e-9, 'the runoff is the spiral (300)'); near(c.Lt1, (0.02 / 0.06) * 300, 1e-9, 'the runout is NC / e × runoff = 100, ahead of the TS'); near(s.nc0, k.ts - 100, 1e-9, 'normal crown until 100 before the TS');
  const at = (sta) => SE.slopesAt(plan, sta, 0.02);
  const outer = (sta) => at(sta)[c.outside];
  near(outer(k.ts), 0, 1e-12, 'outside lane level at the TS'); near(outer(k.ts + 150), -0.03, 1e-12, 'half way along the spiral: half of −6 %');
  near(outer(k.sc), -0.06, 1e-12, 'full −6 % at the SC'); near(outer(k.sc + 100), -0.06, 1e-12, 'held on the curve'); near(outer(k.cs + 150), -0.03, 1e-12, 'and rolled back half way along the second spiral');
  near(at(k.sc)[c.outside === 'L' ? 'R' : 'L'], 0.06, 1e-12, 'the inside lane falls away at +e in full super');
  ok(!plan.problems.length, 'no problems: ' + plan.problems.join(' '));
  // the plan's relative gradient on the spiral: lane × e / Ls = 3.6 × 0.06 / 300 = 0.72 % ≤ 0.5 %? no: it is steeper than Δ 0.5 %
  const steep = SE.superPlan(AL.buildAlignment({ pis: [{ x: 0, y: 0 }, { x: 1000, y: 0, r: R, ls: 30 }, out] }), { super: sp, nc: 0.02, lane: 3.6 });
  ok(steep.problems.some((m) => /spiral at its TS is 30/.test(m)), 'a spiral too short for the relative gradient is said: ' + steep.problems[0]);
  // a curve with a spiral in and none out rolls at the spiral rate in and the 2/3 - 1/3 rule out
  const one = AL.buildAlignment({ pis: [{ x: 0, y: 0 }, { x: 1000, y: 0, r: R, ls1: 300 }, out] });
  const p1 = SE.superPlan(one, { super: sp, nc: 0.02, lane: 3.6 }), o = p1.curves[0], full = (3.6 * 0.06) / 0.005;
  near(o.stations.lc0, one.curves[0].ts, 1e-9, 'one spiral: level crown at the TS'); near(o.stations.fs1, one.curves[0].st - full / 3, 1e-9, 'and the plain end keeps full to PT − Lr/3');
  // arcs only: unchanged
  const plain = AL.buildAlignment({ pis: [{ x: 0, y: 0 }, { x: 1000, y: 0, r: 2000 }, { x: 1700, y: -700 }] });
  const pp = SE.superPlan(plain, { super: { on: true, delta: 0.005, rate: SE.SUPER_DEFAULTS('ft').rate }, nc: 0.02, lane: 12 });
  near(pp.curves[0].Lr, 96, 1e-9, 'without spirals: runoff 96 as before'); near(pp.curves[0].Lr2, 96, 1e-9, 'and the same at the far end');
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
