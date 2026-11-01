#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-foundation.mjs — foundation design checks (0.8 round 2, EG.5): the pressure under a rigid footing (full contact and lift-off) against
 * closed forms, then each check by hand: bearing, sliding, overturning, flexure with the minimum steel, one-way shear, punching, development, a
 * combined footing's statics, a pile group, a cantilever retaining wall, and a support reaction turned into a footing load.
 *   node tools/detailcraft-test/test-foundation.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const APP = path.join(ROOT, 'public_html/assets/apps/detailcraft/dev');
const load = (f) => import(pathToFileURL(path.join(APP, f)).href);
(await load('i18n.js')).init({ strings: JSON.parse(fs.readFileSync(path.join(APP, 'lang/en.json'), 'utf8')) });
const R = await load('rebar.js'), F = await load('foundation.js'), { requiredAs } = await load('frame/rc-aci318.js');
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.log('  FAIL ' + m); } };
const near = (a, b, tol) => Math.abs(a - b) <= tol;
const foot = (o = {}) => R.cleanFooting({ ...R.FOOTING_DEFAULTS, ...o, mat: { ...R.FOOTING_DEFAULTS.mat, ...(o.mat || {}) }, starters: { ...R.FOOTING_DEFAULTS.starters, ...(o.starters || {}) } }).footing;
const get = (res, id, k = 0) => res.checks.filter((c) => c.id === id)[k];

// ---- the pressure plane ----
let p = F.pressureField(1000, 0, 0, 2000, 2000);
ok(near(p.qmax, 250, 1e-9) && !p.partial, 'concentric: 1000 kN on 4 m² = 250 kPa');
p = F.pressureField(1000, 200, 0, 2000, 2000);
ok(near(p.qmax, 400, 1e-6) && near(p.qmin, 100, 1e-6), 'e = 200 mm on 2 m: q = 250 (1 ± 6e/L) = 400 / 100 kPa');
p = F.pressureField(1000, 1000, 0, 3000, 1000);
ok(p.partial && near(p.qmax, 2 * 1000 / (3 * 0.5 * 1), 20), 'e = 1000 mm on 3 m (outside the kern): qmax = 2N / (3 (L/2 − e) B) = 1333 kPa (' + p.qmax.toFixed(1) + ')');
ok(p.residual < 1e-5, 'lift-off: the plane carries N at e (residual ' + p.residual?.toExponential(1) + ')');
p = F.pressureField(1000, 1600, 0, 3000, 1000);
ok(p.ok === false && p.reason === 'outside' || p.ok === false, 'resultant at the edge or outside: no pressure plane');
p = F.pressureField(1000, 700, 400, 2000, 2000);
ok(p.partial && Math.abs(p.ex - 0.7) < 1e-9 && p.qmax > 4 * 250 * 0.5, 'biaxial lift-off solves (qmax ' + p.qmax.toFixed(0) + ' kPa)');
// equilibrium of the biaxial plane by grid sum
let sum = 0, mx = 0, my = 0; const nn = 200;
for (let i = 0; i < nn; i++) for (let j = 0; j < nn; j++) { const x = -1 + (i + 0.5) * 2 / nn, y = -1 + (j + 0.5) * 2 / nn, q = p.q(x, y) * 4 / nn / nn; sum += q; mx += q * x; my += q * y; }
ok(near(sum, 1000, 8) && near(mx, 700, 6) && near(my, 400, 6), 'biaxial plane: ΣN, ΣN·x, ΣN·y = ' + sum.toFixed(1) + ', ' + mx.toFixed(1) + ', ' + my.toFixed(1));

// ---- a single footing, service ----
const f = foot({ L: 2000, B: 2000, H: 600 });   // 4000 psi, #5 @ 250 both ways, cover 75
const col = (P, extra = {}) => ({ x: 0, y: 0, cx: 400, cy: 400, service: { P, Vx: 0, Vy: 0, Mx: 0, My: 0 }, strength: { P: 1000, Vx: 0, Vy: 0, Mx: 0, My: 0 }, ...extra });
let res = F.checkFooting(f, [col(800)], { qa: 200, mu: 0.5 });
// N = 800 + 24 × 4 × 0.6 = 857.6 → q = 214.4
let b = get(res, 'bearing');
ok(near(res.info.N, 857.6, 0.05) && near(b.demand, 214.4, 0.05) && b.status === 'fail' && near(b.ratio, 1.072, 0.001), 'bearing: 857.6 kN on 4 m² = 214.4 kPa against 200: fails by 7.2%');
res = F.checkFooting(f, [col(700)], { qa: 200 });
ok(get(res, 'bearing').status === 'ok', 'bearing: 757.6 kN → 189 kPa passes');
res = F.checkFooting(f, [col(700)], {});
ok(get(res, 'bearing').status === 'note' && !get(res, 'sliding'), 'qa not entered: bearing is a note, not a pass');
// sliding and the moment of the horizontal force: H = 100 kN at the footing's top, h = 0.6 m → My = 60 → e = 60 / 757.6 = 79 mm
res = F.checkFooting(f, [col(700, { service: { P: 700, Vx: 100, Vy: 0, Mx: 0, My: 0 } })], { qa: 200, mu: 0.5 });
ok(near(res.info.ex, 60 / 757.6 * 1000, 0.2) && near(res.info.N, 757.6, 0.05), 'V × h loads the +x side: e = 60 / 757.6 = 79.2 mm (' + res.info.ex + ')');
const sl = get(res, 'sliding');
ok(sl.status === 'ok' && near(sl.vars.fs, 0.5 * 757.6 / 100, 0.01), 'sliding: FS = μN/H = 3.79');
res = F.checkFooting(f, [col(700, { service: { P: 700, Vx: 300, Vy: 0, Mx: 0, My: 0 } })], { qa: 400, mu: 0.4 });
ok(get(res, 'sliding').status === 'fail', 'sliding: μN/H = 1.01 against 1.5 fails');
// overturning
res = F.checkFooting(f, [col(300, { service: { P: 300, Vx: 0, Vy: 0, Mx: 0, My: 400 } })], { qa: 5000, fsOt: 1.5 });
const ot = get(res, 'overturning');
// N = 357.6; e = 400 / 357.6 = 1.1186 m > L/2 = 1 → outside: bearing fails, overturning FS < 1
ok(get(res, 'bearing').status === 'fail' && ot.status === 'fail' && ot.vars.fs < 1, 'My = 400 on 300 kN + self weight: the resultant leaves the base (FS ' + ot.vars.fs + ')');
res = F.checkFooting(f, [col(600, { service: { P: 600, Vx: 0, Vy: 0, Mx: 0, My: 180 } })], { qa: 5000 });
// N = 657.6, e = 0.2737 m: > L/6 = 0.333? no, 0.2737 < 0.333 → full contact; FS_ot = 1 / (0.2737/1) = 3.65
ok(res.pressure && !res.pressure.partial && near(get(res, 'overturning').vars.fs, 1 / (180 / 657.6), 0.01), 'overturning FS = (L/2) / e = 3.65, full contact');
// ---- strength, a column at the middle: qu = 1000 / 4 = 250 kPa
res = F.checkFooting(f, [col(700)], { qa: 400 });
const fc = 4000 * 0.00689476, dX = 600 - 75 - 15.875 / 2, dY = dX - 15.875 / 2 - 15.875 / 2;
const fx = get(res, 'flexure-x');
// cantilever from the face: l = (2.0 − 0.4)/2 = 0.8 m, Mu = 250 × 0.8² / 2 = 80 kN·m per metre
ok(near(fx.vars.Mu, 80, 0.8), 'flexure: Mu = qu l² / 2 = 80 kN·m/m at the column face (' + fx.vars.Mu + ')');
const asReq = requiredAs({ b: 1000, d: dX, fc, fy: 420, Mu: 80e6, phi: 0.9 });
ok(near(fx.vars.req, Math.round(asReq), 8), 'flexure: As required from Mu = ' + fx.vars.req + ' mm²/m (' + Math.round(asReq) + ')');
ok(fx.vars.min === 1080 && fx.demand === 1080 && fx.status === 'fail', 'flexure: 0.0018 × 1000 × 600 = 1080 mm²/m minimum; #5 @ 250 gives 800: fails');
const f2 = foot({ L: 2000, B: 2000, H: 600, mat: { barX: '#6', sX: 250, barY: '#6', sY: 250, cover: 75, hooks: true } });
ok(get(F.checkFooting(f2, [col(700)], { qa: 400 }), 'flexure-x').status === 'ok', '#6 @ 250 = 1136 mm²/m passes');
// one-way shear at d from the face: V = qu B (0.8 − d)
const sx = get(res, 'shear-x');
ok(near(sx.vars.Vu, 250 * 2 * (0.8 - dX / 1000), 1.5), 'shear-x: Vu = 250 × 2 × (0.8 − d) = ' + (250 * 2 * (0.8 - dX / 1000)).toFixed(1) + ' kN (' + sx.vars.Vu + ')');
ok(sx.status === 'ok' && sx.capacity > sx.demand, 'shear-x passes: φVc ' + sx.vars.phiVc + ' kN');
// punching
const pn = get(res, 'punching');
const d = (dX + dY) / 2, bo = 4 * (400 + d), inside = 250 * ((400 + d) / 1000) ** 2, vu = (1000 - inside) * 1000 / (bo * d);
const lamS = Math.sqrt(2 / (1 + 0.004 * d)), vcMPa = Math.min(0.33, 0.17 * 3, 0.083 * (2 + 40 * d / bo)) * lamS * Math.sqrt(fc);
ok(near(pn.vars.vu, vu, 0.01) && near(pn.vars.phivc, 0.75 * vcMPa, 0.01), 'punching: vu = ' + vu.toFixed(3) + ' MPa, φvc = ' + (0.75 * vcMPa).toFixed(3) + ' MPa (' + pn.vars.vu + ', ' + pn.vars.phivc + ')');
ok(pn.status === 'ok', 'punching passes on a 600 mm footing');
// a thin footing fails punching
const thin = foot({ L: 2000, B: 2000, H: 300, mat: { barX: '#6', sX: 150, barY: '#6', sY: 150, cover: 50, hooks: true } });
ok(get(F.checkFooting(thin, [col(700)], { qa: 900 }), 'punching').status === 'fail', 'a 300 mm footing under 1000 kN: punching fails');
// depth above the bars: H − c − db − db = 600 − 75 − 31.75 = 493 ≥ 150; thin: 300 − 50 − 31.75 = 218
ok(get(res, 'depth').status === 'ok', 'depth above the bars passes');
const shallow = foot({ L: 2000, B: 2000, H: 250, mat: { cover: 75, barX: '#5', barY: '#5', sX: 250, sY: 250, hooks: true } });
ok(get(F.checkFooting(shallow, [col(300)], {}), 'depth').status === 'fail', '250 mm footing: 250 − 75 − 32 = 143 < 150 fails');
// development: straight, #5 (small): fy / (2.1 √fc) db = 420 / (2.1 × 5.252) × 15.875 = 604.5 mm, available (2000 − 400)/2 − 75 = 725
const dev = get(res, 'development-x');
ok(near(F.developmentLength(R.BARS.get('#5'), 420, fc), 420 / (2.1 * Math.sqrt(fc)) * 15.875, 0.01) && dev.status === 'ok' && dev.vars.avail === 725, 'development: ld = 604.5 mm against 725 available');
ok(near(F.developmentLength(R.BARS.get('#8'), 420, fc, 1, false), 420 / (1.1 * Math.sqrt(fc)) * 25.4, 0.01), 'development: #8, spacing or cover short: fy / (1.1 √f\'c) db');
ok(near(F.hookDevelopment(R.BARS.get('#5'), 420, fc), 0.24 * 420 / Math.sqrt(fc) * 15.875, 0.01), 'hook development: 0.24 fy / √f\'c × db');
ok(F.fcOf('4000 psi') > 27.5 && F.fcOf('4000 psi') < 27.6 && F.fcOf('C30/37') === 30 && F.fcOf('35 MPa') === 35 && F.fcOf('') === 28, "f'c read from the footing's text");
// loads not given for strength
ok(F.checkFooting(f, [{ x: 0, y: 0, cx: 400, cy: 400, service: { P: 500 } }], { qa: 300 }).checks.some((c) => c.id === 'strength-loads' && c.status === 'note'), 'no factored loads: said, not skipped silently');
// ---- a combined footing: two columns 2 m apart, 3000 × 1500
const fc2 = foot({ L: 3000, B: 1500, H: 700, starters: { on: false }, mat: { barX: '#6', sX: 150, barY: '#6', sY: 150, cover: 75, hooks: true } });
const two = [col(500, { x: -1000, cx: 300, cy: 300, strength: { P: 500 } }), col(500, { x: 1000, cx: 300, cy: 300, strength: { P: 500 } })];
res = F.checkFooting(fc2, two, { qa: 300 });
const qu = 1000 / 4.5;
const mxC = get(res, 'flexure-x');
ok(near(res.strength.qmax, qu, 0.01), 'combined: uniform pressure ' + qu.toFixed(1) + ' kPa when the loads are balanced');
ok(near(mxC.vars.Mu * 1.5, 125, 3), 'combined: the hogging moment between the columns is q B l²/2 − P l = 125 kN·m over 1.5 m (' + (mxC.vars.Mu * 1.5).toFixed(1) + ')');
ok(near(Math.abs(mxC.vars.at), 0, 0.1), 'combined: …found at the middle of the span (' + mxC.vars.at + ')');
ok(res.checks.filter((c) => c.id === 'punching').length === 2, 'combined: punching for each column');
// ---- a pile group
let g = F.pileGroup([{ x: -750, y: -750 }, { x: 750, y: -750 }, { x: -750, y: 750 }, { x: 750, y: 750 }], { P: 2000, Mx: 0, My: 0 }, { compression: 600 });
ok(g.reactions.every((r) => near(r, 500, 1e-9)) && g.checks[0].status === 'ok', 'piles: 2000 kN on four piles = 500 kN each');
g = F.pileGroup([{ x: -750, y: -750 }, { x: 750, y: -750 }, { x: -750, y: 750 }, { x: 750, y: 750 }], { P: 2000, Mx: 400, My: 0 }, { compression: 600 });
ok(near(Math.max(...g.reactions), 500 + 400 * 0.75 / 2.25, 1e-9) && near(Math.min(...g.reactions), 500 - 400 * 0.75 / 2.25, 1e-9) && g.equilibrium, 'piles: Mx = 400 adds ±133.3 kN');
ok(g.checks[0].status === 'fail', '633 kN against a 600 kN pile fails');
g = F.pileGroup([{ x: -1000, y: 0 }, { x: 1000, y: 0 }], { P: 200, Mx: 0, My: 800 }, { compression: 1000, tension: 100 });
ok(near(g.reactions[1], 100 + 800 / 2, 1e-9) && g.checks.some((c) => c.id === 'pile-tension' && c.status === 'fail'), 'piles: uplift 300 kN on one pile against a tension capacity of 100 fails');
// ---- a retaining wall: H 3 m, base 0.5 m thick, stem 0.4, toe 0.8, heel 1.8; γ 18, φ 30°
const w = F.retainingWall({ H: 3000, hb: 500, t: 400, toe: 800, heel: 1800 }, { gamma: 18, phi: 30, qa: 150, mu: 0.5 });
ok(near(w.Ka, 1 / 3, 1e-9) && near(w.Pa, 36.75, 1e-9) && near(w.Mo, 36.75 * 3.5 / 3, 1e-9), 'wall: Ka = 1/3, Pa = ½ Ka γ H² = 36.75 kN/m, Mo = 42.9 kN·m/m');
ok(near(w.W, 162, 1e-9) && near(w.Mr, 286.92, 1e-6), 'wall: weights 162 kN/m, Mr = 286.9 kN·m/m about the toe');
ok(near(w.checks[0].vars.fs, 286.92 / 42.875, 0.01) && w.checks[0].status === 'ok', 'wall: overturning FS = 6.69');
ok(near(w.checks.find((c) => c.id === 'wall-sliding').vars.fs, 0.5 * 162 / 36.75, 0.01), 'wall: sliding FS = μW/Pa = 2.20');
ok(near(w.e, 1.5 - (286.92 - 42.875) / 162, 1e-9) && w.field.ok && near(w.field.qmax, 54 * (1 + 6 * Math.abs(w.e) / 3), 0.2), 'wall: base pressure from the eccentricity (' + w.field.qmax.toFixed(1) + ' kPa)');
const w2 = F.retainingWall({ H: 3000, hb: 500, t: 400, toe: 300, heel: 600 }, { surcharge: 20, mu: 0.4 });
ok(w2.checks[0].status === 'fail' || w2.checks.find((c) => c.id === 'wall-sliding').status === 'fail', 'wall: a short heel with a surcharge fails overturning or sliding');
// ---- an Analysis reaction → the load on the footing: N, N·mm; the support's force on the structure is up (Rz > 0)
const l = F.toFootingAxes([10000, -4000, 800000, 2e6, -3e6, 0], 0);
ok(near(l.P, 800, 1e-9) && near(l.Vx, -10, 1e-9) && near(l.Vy, 4, 1e-9) && near(l.Mx, -2, 1e-9) && near(l.My, 3, 1e-9), 'reaction → footing: P 800 kN down, V = −R, M = −R');
const l90 = F.toFootingAxes([10000, 0, 800000, 0, 0, 0], 90);
ok(near(l90.Vx, 0, 1e-9) && near(l90.Vy, 10, 1e-9) || near(l90.Vy, -10, 1e-9), 'a footing turned 90° gets the horizontal force along its own y');
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
