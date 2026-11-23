#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-civilcraft-compound.mjs — CivilCraft 0.11 SU.1944 (a spiral between two curves of different radii: compound and reverse) and
 * FX.369 (the table of an alignment's elements, gisement in gons, French CSV). DOM-free.
 *
 *   node bin/test-civilcraft-compound.mjs [--build dev|x.y] [--verbose]
 *
 * Known answer from a cited text. The Euler spiral with curvature κ(s) = π·s is the one the Fresnel integrals describe,
 * C(x) = ∫0..x cos(π t²/2) dt, S(x) = ∫0..x sin(π t²/2) dt. Abramowitz and Stegun, Handbook of Mathematical Functions (NBS, 1964),
 * section 7.3 and Table 7.7: C(0.5) = 0.4923442258714464, S(0.5) = 0.0647324328263 ..., C(1) = 0.7798934003768228,
 * S(1) = 0.4382591473903548 (the values the table prints to 6 places are 0.492344, 0.064732, 0.779893, 0.438259). A spiral that joins
 * a curve of radius 2/π to one of radius 1/π over a length of 0.5 is the piece of that spiral from s = 0.5 to s = 1: its end is
 * (C(1) − C(0.5), S(1) − S(0.5)) from its start when it starts at the spiral's own heading π/8. The same is checked against a
 * numerical integration of the definition (Simpson, 20,000 steps), and geometry checks (closure, continuity of heading and
 * curvature) cover alignments.
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
registerHooks({ resolve(spec, ctx, next) { const m = manifest.imports?.[spec]; if (m) return { url: pathToFileURL(path.join(REPO, 'public_html', m)).href, shortCircuit: true }; return next(spec, ctx); } });
const mod = (f) => import(pathToFileURL(path.join(APP, f)).href);
const I18N = await mod('i18n.js');
I18N.init({ strings: JSON.parse(fs.readFileSync(path.join(APP, 'lang/en.json'), 'utf8')) });
const AL = await mod('alignment.js');
const TB = await mod('alignment-table.js');

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; if (VERBOSE) console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };
const near = (a, b, tol, m) => ok(Number.isFinite(a) && Math.abs(a - b) <= tol, `${m} (${a} vs ${b}, ±${tol})`);
const section = (s) => console.log('\n== ' + s);
const D = Math.PI / 180;

section('the spiral piece, by the Fresnel integrals (Abramowitz and Stegun 7.3, Table 7.7)');
{
  const C1 = 0.7798934003768228, S1 = 0.4382591473903548, C05 = 0.4923442258714464, S05 = 0.06473243285;
  const k1 = Math.PI / 2, k2 = Math.PI, L = 0.5;
  const e = AL.linearCurvatureAt({ x: 0, y: 0 }, Math.PI / 8, k1, k2, L, L);
  near(e.x, C1 - C05, 1e-8, 'x = C(1) − C(0.5) = 0.28755'); near(e.y, S1 - S05, 1e-8, 'y = S(1) − S(0.5) = 0.37352');
  near(e.x, 0.287550, 1e-6, 'x to the table\'s six places'); near(e.y, 0.373527, 1e-6, 'y to the table\'s six places');
  near(e.dir, Math.PI / 2, 1e-12, 'the heading at s = 1 is π/2 (π·1²/2)');
  // numerical integration of the definition
  let x = 0, y = 0; const n = 20000, h = L / n;
  for (let i = 0; i <= n; i++) { const w = i === 0 || i === n ? 1 : i % 2 ? 4 : 2, s = 0.5 + i * h; x += w * Math.cos((Math.PI * s * s) / 2); y += w * Math.sin((Math.PI * s * s) / 2); }
  near(e.x, (x * h) / 3, 1e-10, 'equals Simpson on cos(π s²/2)'); near(e.y, (y * h) / 3, 1e-10, 'and on sin');
  // from zero curvature it is the alignment's own clothoid
  for (const [R, Ls] of [[1000, 300], [250, 100], [60, 60]]) {
    const c = AL.clothoid(Ls, R, Ls), q = AL.linearCurvatureAt({ x: 0, y: 0 }, 0, 0, 1 / R, Ls, Ls);
    near(q.x, c.x, 1e-9, `k1 = 0 is the clothoid, x (R ${R}, Ls ${Ls})`); near(q.y, c.y, 1e-9, 'y'); near(q.dir, c.th, 1e-12, 'heading');
  }
  // a piece taken in two halves is the whole
  const a = AL.linearCurvatureAt({ x: 0, y: 0 }, 0.2, -0.01, 0.02, 80, 30), b = AL.linearCurvatureAt({ x: a.x, y: a.y }, a.dir, -0.01 + (0.03 * 30) / 80, 0.02, 50, 50), w = AL.linearCurvatureAt({ x: 0, y: 0 }, 0.2, -0.01, 0.02, 80, 80);
  near(b.x, w.x, 1e-9, 'two pieces make the whole, x'); near(b.y, w.y, 1e-9, 'y'); near(b.dir, w.dir, 1e-12, 'heading');
}

const kappa = (al, s) => { const hh = 0.02, a = al.pointAt(s - hh).dir, b = al.pointAt(s + hh).dir; return (b - a) / (2 * hh); };
function checkRun(al, label, R1, R2, sg1, sg2, a3, Q2, lsc) {
  ok(al.ok, label + ': builds' + (al.errors.length ? ' (' + al.errors.join('; ') + ')' : ''));
  if (!al.ok) return;
  const types = al.elements.map((e) => e.type + (e.io === 'cs' ? ':cs' : '')).join();
  ok(/arc,spiral:cs,arc/.test(types), label + ': arc, joining spiral, arc (' + types + ')');
  const cs = al.elements.find((e) => e.io === 'cs'), [c1, c2] = al.curves;
  near(cs.len, lsc, 1e-12, label + ': the spiral has the asked length');
  near(kappa(al, cs.sta + 0.05), sg1 / R1, 5e-5, label + ': curvature at its start is 1/R1'); near(kappa(al, cs.sta + cs.len - 0.05), sg2 / R2, 5e-5, label + ': and 1/R2 at its end');
  near(kappa(al, cs.sta + cs.len / 2), (sg1 / R1 + sg2 / R2) / 2, 5e-5, label + ': half-way it is the mean (linear curvature)');
  // continuity of position and heading at every join
  let worst = 0, worstH = 0;
  for (let i = 0; i + 1 < al.elements.length; i++) {
    const a = al.elements[i], b = al.elements[i + 1], pa = al.pointAt(a.sta + a.len - 1e-9), pb = al.pointAt(b.sta + 1e-9);
    worst = Math.max(worst, Math.hypot(a.p1.x - b.p0.x, a.p1.y - b.p0.y)); worstH = Math.max(worstH, Math.abs(AL.normAng(pa.dir - pb.dir)));
  }
  ok(worst < 1e-7, label + ': each element starts where the last ends (' + worst.toExponential(1) + ')'); ok(worstH < 1e-6, label + ': and with the same heading (' + worstH.toExponential(1) + ')');
  const last = al.elements[al.elements.length - 1];
  near(AL.normAng(last.dir - a3), 0, 1e-9, label + ': the last tangent has the deflected direction');
  const q = al.elements.filter((e) => e.type === 'arc' || e.io === 'cs' || e.type === 'spiral').pop(), pe = last.p0;
  near((pe.x - Q2.x) * Math.sin(a3) - (pe.y - Q2.y) * Math.cos(a3), 0, 1e-7, label + ': the run ends ON the last tangent line'); void q;
  near(c1.R ?? c1.r, R1, 0, label + ': curve 1 keeps its radius'); near(c2.r, R2, 0, label + ': curve 2 keeps its radius');
  // stations run on, and a point on it finds its station
  near(al.length, al.elements.reduce((s, e) => s + e.len, 0), 1e-9, label + ': length is the sum');
  let w = 0; for (let s = al.start + 1; s < al.end - 1; s += 9.7) { const p = al.pointAt(s), so = al.stationOffset(p.x, p.y); w = Math.max(w, Math.abs(so.sta - s), Math.abs(so.off)); }
  ok(w < 1e-5, label + ': stationOffset finds every station back (' + w.toExponential(1) + ')');
  ok(al.keyStations().length >= 6, label + ': key stations listed');
}
const U = (deg) => ({ x: Math.cos(deg * D), y: Math.sin(deg * D) });
const along = (p, d, t) => ({ x: p.x + d.x * t, y: p.y + d.y * t });
// the two deflection lines meet at V; PI 2 sits near V on the last tangent (the spiral takes the tangent's place, so the PIs of a
// compound run are close: moving PI 2 along the last tangent moves where the run starts, and far enough it has no solution)
section('a compound curve (same way, R 300 then R 150, spiral 60)');
{
  const u = U(50), V = { x: 750, y: 0 }, P2 = along(V, u, 32), P3 = along(V, u, 400);
  const Q = [{ x: 0, y: 0 }, { x: 700, y: 0, r: 300, lsc: 60 }, { ...P2, r: 150 }, P3];
  const al = AL.buildAlignment({ pis: Q, start: 1000 });
  checkRun(al, 'compound', 300, 150, 1, 1, 50 * D, P2, 60);
  const cs = al.elements.find((e) => e.io === 'cs');
  if (cs) {
    near(cs.theta, ((1 / 300 + 1 / 150) / 2) * 60, 1e-12, 'the spiral turns (1/R1 + 1/R2)·Ls/2 = 0.3 rad');
    near(al.curves[0].d + al.curves[1].d, 50 * D, 1e-9, 'the two deflections add to the total');
    near(al.curves[0].Lc * 0 + al.elements.filter((e) => e.type === 'arc').reduce((s, e) => s + e.delta, 0) + cs.theta, 50 * D, 1e-9, 'arcs and spiral turn the whole deflection');
    near(cs.sta, al.curves[0].cs, 1e-9, 'the first curve ends where the spiral starts'); near(al.curves[1].ts, cs.sta + cs.len, 1e-9, 'the second starts where it ends');
  }
}
section('a reverse curve (left R 300, right R 200, spiral 80)');
{
  const u = U(-20), P3 = { x: 900, y: 300 }, P2 = along(P3, u, -100), P4 = along(P3, u, 300);
  const Q = [{ x: 0, y: 0 }, { x: 400, y: 0, r: 300, lsc: 80 }, { ...P2, r: 200 }, P4];
  const al = AL.buildAlignment({ pis: Q, start: 0 });
  checkRun(al, 'reverse', 300, 200, 1, -1, -20 * D, P2, 80);
  const cs = al.elements.find((e) => e.io === 'cs');
  if (cs) {
    near(cs.k1, 1 / 300, 1e-15, 'it starts at +1/R1 (left)'); near(cs.k2, -1 / 200, 1e-15, 'and ends at −1/R2 (right)');
    near(kappa(al, cs.sta + (80 * (1 / 300)) / (1 / 300 + 1 / 200)), 0, 5e-5, 'curvature is zero at the inflection, L·k1/(k1 − k2) from the start');
    near(cs.theta, Math.abs(((1 / 300 - 1 / 200) / 2) * 80), 1e-12, 'the spiral turns |k1 + k2|·L/2');
  }
}
section('with spirals at the two outer ends too');
{
  const u = U(50), V = { x: 750, y: 0 }, P2 = along(V, u, 40), P3 = along(V, u, 400);
  const Q = [{ x: 0, y: 0 }, { x: 700, y: 0, r: 300, lsc: 60, ls1: 50 }, { ...P2, r: 150, ls2: 40 }, P3];
  const al = AL.buildAlignment({ pis: Q, start: 0 });
  ok(al.ok, 'builds ' + al.errors.join(';'));
  if (al.ok) {
    const kinds = al.elements.map((e) => e.type + (e.io ? ':' + e.io : '')).join();
    ok(kinds === 'line,spiral:in,arc,spiral:cs,arc,spiral:out,line', 'line, in, arc, joining, arc, out, line: ' + kinds);
    const last = al.elements[al.elements.length - 1];
    near(AL.normAng(last.dir - 50 * D), 0, 1e-9, 'ends on the deflected direction');
    near((last.p0.x - P2.x) * Math.sin(50 * D) - (last.p0.y - P2.y) * Math.cos(50 * D), 0, 1e-6, 'and on the last tangent line');
    let worst = 0; for (let i = 0; i + 1 < al.elements.length; i++) worst = Math.max(worst, Math.hypot(al.elements[i].p1.x - al.elements[i + 1].p0.x, al.elements[i].p1.y - al.elements[i + 1].p0.y));
    ok(worst < 1e-6, 'joins close (' + worst.toExponential(1) + ')');
    const cs = al.elements.find((e) => e.io === 'cs');
    near(kappa(al, cs.sta + 0.05), 1 / 300, 5e-5, 'curvature 1/R1 where the joining spiral starts'); near(kappa(al, cs.sta + cs.len - 0.05), 1 / 150, 5e-5, 'and 1/R2 where it ends');
  }
}
section('refusals');
{
  const bad = AL.buildAlignment({ pis: [{ x: 0, y: 0 }, { x: 400, y: 0, r: 300, lsc: 60 }, { x: 700, y: 150 }, { x: 900, y: 450 }] });
  ok(bad.ok, 'a spiral asked with no second curve is ignored (an ordinary alignment)');
  const none = AL.buildAlignment({ pis: [{ x: 0, y: 0 }, { x: 700, y: 0, r: 300, lsc: 5000 }, { x: 700, y: 150, r: 150 }, { x: 900, y: 450 }] });
  ok(!none.ok && none.errors.length > 0, 'a spiral far too long says so: ' + none.errors[0]);
}

section('the table of elements (FX.369)');
{
  near(TB.gisement(Math.PI / 2), 0, 1e-12, 'north = 0 gon'); near(TB.gisement(0), 100, 1e-12, 'east = 100 gon');
  near(TB.gisement(-Math.PI / 2), 200, 1e-12, 'south = 200 gon'); near(TB.gisement(Math.PI), 300, 1e-12, 'west = 300 gon');
  near(TB.gisement(Math.PI / 4), 50, 1e-12, 'north-east = 50 gon'); near(TB.gisement(Math.PI / 2 + 1e-14), 0, 1e-6, 'just west of north wraps to ~400 → 0');
  // a 100 m east tangent, a right-turning R 100 arc of 90°, a straight north... build it by PIs: east 200, PI at (200,0), turn right to south
  const al = AL.buildAlignment({ pis: [{ x: 0, y: 0 }, { x: 200, y: 0, r: 100 }, { x: 200, y: -300 }], start: 0 });
  const rows = TB.elementRows(al);
  ok(rows.length === 3 && rows.map((r) => r.kind).join() === 'line,arc,line', 'line, arc, line');
  near(rows[0].gisement, 100, 1e-9, 'the first straight runs east: 100 gon'); near(rows[2].gisement, 200, 1e-9, 'the last runs south: 200 gon');
  near(rows[1].gisement, 100, 1e-9, 'the arc leaves heading east: 100 gon'); near(rows[1].R, 100, 0, 'arc R = 100'); ok(rows[1].A === null, 'an arc has no A');
  near(rows[0].len, 100, 1e-9, 'straight 100'); near(rows[1].len, (Math.PI / 2) * 100, 1e-9, 'arc = R·π/2'); near(rows[1].sta0, 100, 1e-9, 'arc starts at 100');
  near(rows[2].x, 200, 1e-9, 'the last straight starts at x = 200'); near(rows[2].y, -100, 1e-9, 'y = −100');
  // A = √(R·L): the spiral of the spirals test, Ls 300, R 1000
  const sp = TB.elementRows(AL.buildAlignment({ pis: [{ x: 0, y: 0 }, { x: 1000, y: 0, r: 1000, ls: 300 }, { x: 1000 + 800 * Math.cos(40 * D), y: 800 * Math.sin(40 * D) }], start: 0 }));
  const s1 = sp.find((r) => r.kind === 'spiral');
  near(s1.A, Math.sqrt(300000), 1e-9, 'A = √(R·Ls) = 547.723'); near(s1.A, 547.723, 5e-4, 'to the digits a table prints');
  // compound: A² = L / |1/R2 − 1/R1|
  const cr = TB.elementRows(AL.buildAlignment({ pis: [{ x: 0, y: 0 }, { x: 700, y: 0, r: 300, lsc: 60 }, along({ x: 750, y: 0 }, U(50), 32), { ...along({ x: 750, y: 0 }, U(50), 400) }].map((q, i) => (i === 2 ? { ...q, r: 150 } : q)) })).find((r) => r.kind === 'cspiral');
  near(cr.A ** 2, 60 / (1 / 150 - 1 / 300), 1e-6, 'compound spiral A² = L / (1/R2 − 1/R1) = 18,000'); near(cr.R, 300, 0, 'R'); near(cr.R2, 150, 0, 'R end');
  const csv = TB.elementsCsv(rows, { locale: 'fr' });
  ok(csv.startsWith('\uFEFF') && csv.includes(';') && csv.includes('\r\n'), 'French CSV: byte-order mark, semicolons, CRLF');
  ok(csv.split('\r\n')[0] === '\uFEFFN°;Type;PK début;PK fin;Longueur;R;R fin;A;Gisement (gon);X début;Y début', 'French heading');
  ok(csv.split('\r\n')[2].startsWith('2;Arc;100,000;257,080;157,080;100,000;;;100,0000;'), 'arc line: comma decimals, empty cells for what an arc has not: ' + csv.split('\r\n')[2]);
  const en = TB.elementsCsv(rows, { locale: 'en' });
  ok(!en.startsWith('\uFEFF') && en.split('\n')[2].startsWith('2,Arc,100.000,257.080,157.080,100.000,,,100.0000,'), 'English CSV: commas and points');
}
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
