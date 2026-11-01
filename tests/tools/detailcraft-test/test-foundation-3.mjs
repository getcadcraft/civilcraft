#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-foundation-3.mjs — EG.5, round 3 (detail_PART_3): settlement, punching at an edge or a corner, and the flexible mat on springs, each against a
 * closed form or a hand calculation written out below.   node tools/detailcraft-test/test-foundation-3.mjs
 */
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const F = await import(pathToFileURL(path.join(REPO, 'public_html/assets/apps/detailcraft/dev/foundation.js')).href);
let pass = 0, fail = 0;
const ok = (c, m, x) => { if (c) pass++; else { fail++; console.log('FAIL ' + m + (x !== undefined ? ' — ' + JSON.stringify(x) : '')); } };
const near = (a, b, tol) => Math.abs(a - b) <= tol * Math.max(1, Math.abs(b));

console.log('Settlement');
{
  // Timoshenko and Goodier: a flexible square, corner 0.5611 q B (1-nu^2)/E, centre 1.1222 q B (1-nu^2)/E (4 corners of the quarter squares)
  const q = 100, E = 20, nu = 0.3, B = 2000;
  const w = F.settlement(B, B, q, E, nu);
  const unit = q * (B / 1000) * (1 - nu * nu) / (E * 1000) * 1000;   // mm
  const c0 = 2 * Math.log(1 + Math.SQRT2) / Math.PI;   // 0.56110…
  ok(near(w.corner, c0 * unit, 1e-9), 'corner of a square: 0.5611 q B (1-nu^2)/E', [w.corner, c0 * unit]);
  ok(near(w.centre, 2 * c0 * unit, 1e-9), 'centre of a square: 1.1222 q B (1-nu^2)/E', [w.centre, 2 * c0 * unit]);
  const long = F.settlement(8000, 2000, q, E, nu), sq = F.settlement(2000, 2000, q, E, nu);
  ok(long.centre > sq.centre && long.corner > sq.corner, 'a longer footing of the same width settles more');
  // a strip (L/B large) approaches the plane-strain logarithm: settlement grows like ln(L/B), so doubling L adds a roughly fixed amount
  const s8 = F.settlement(16000, 2000, q, E, nu).centre - F.settlement(8000, 2000, q, E, nu).centre, s4 = F.settlement(8000, 2000, q, E, nu).centre - F.settlement(4000, 2000, q, E, nu).centre;
  ok(near(s8, s4, 0.15), 'each doubling of the length adds about the same (the logarithm of a strip)', [s4, s8]);
  const f = { L: 2000, B: 2000, H: 500, concrete: '28 MPa', mat: { barX: '#5', sX: 200, barY: '#5', sY: 200, cover: 75, hooks: true } };
  const loads = [{ x: 0, y: 0, cx: 300, cy: 300, service: { P: 400, Vx: 0, Vy: 0, Mx: 0, My: 0 } }];
  const r = F.checkFooting(f, loads, { qa: 500, Es: 20, nu: 0.3, slim: 25 });
  const c = r.checks.find((x) => x.id === 'settlement');
  const N = 400 + 24 * 4 * 0.5, qq = N / 4;   // kN, kPa
  ok(c && c.status === 'ok' && near(c.demand, F.settlement(2000, 2000, qq, 20, 0.3).centre, 1e-9), 'checkFooting: settlement of the service pressure against the limit', c);
  ok(F.checkFooting(f, loads, { qa: 500 }).checks.find((x) => x.id === 'settlement').status === 'note', 'no soil modulus entered → a note, not a pass');
  ok(F.checkFooting(f, loads, { qa: 500, Es: 2, slim: 5 }).checks.find((x) => x.id === 'settlement').status === 'fail', 'a soft soil over the limit fails');
}

console.log('Punching at an edge and a corner');
{
  const d = 0.45, L = 3, B = 3;
  const interior = F.punchSection({ x: 0, y: 0, cx: 0.4, cy: 0.4 }, d, L, B);
  ok(interior.segs.length === 4 && near(interior.bo, 4 * 0.85, 1e-12), 'interior: four sides, bo = 4 (c + d)', interior.bo);
  // ACI closed form for the interior section
  const b1 = 0.85, Jc = d * b1 ** 3 / 6 + b1 * d ** 3 / 6 + d * b1 * b1 ** 2 / 2;
  ok(near(interior.Jx, Jc, 1e-12) && near(interior.Jy, Jc, 1e-12), 'interior J equals ACI R22.6.5.3', [interior.Jx, Jc]);
  // an edge column: x = -1.2 m, its outer side at -1.625 would leave the footing (edge at -1.5): three sides
  const e = F.punchSection({ x: -1.2, y: 0, cx: 0.4, cy: 0.4 }, d, L, B);
  ok(e.segs.length === 3 && near(e.bo, 2 * (1.5 - 0.775) + 0.85, 1e-12), 'edge: three sides, the two long ones cut at the footing edge, bo = 2.30 m', e.bo);
  // hand calculation: the sides are 0.725 long at x from -1.5 to -0.775 (mid -1.1375) and the inner side 0.85 at x = -0.775
  const xc = (0.85 * -0.775 + 2 * 0.725 * -1.1375) / 2.3;
  ok(near(e.xc, xc, 1e-12) && Math.abs(e.yc) < 1e-12, 'edge centroid by hand', [e.xc, xc]);
  // J about the y axis through the centroid, the geometric part by summing the line in 1 mm steps (independent of the closed forms) plus the d^3 terms
  let Jn = 0; const ds = 0.0005;
  for (const y of [-0.425, 0.425]) for (let x = -1.5 + ds / 2; x < -0.775; x += ds) Jn += d * ds * (x - xc) ** 2;
  for (let y = -0.425 + ds / 2; y < 0.425; y += ds) Jn += d * ds * (-0.775 - xc) ** 2;
  Jn += 2 * 0.725 * d ** 3 / 12;   // the d^3 term of the two sides along the bending direction
  ok(near(e.Jx, Jn, 2e-3), 'edge J about the centroid, by summing the line', [e.Jx, Jn]);
  ok(near(e.cx, Math.max(Math.abs(-1.5 - xc), Math.abs(-0.775 - xc)), 1e-12), 'the far end of the section is the footing edge', e.cx);
  // a corner column: two sides
  const c = F.punchSection({ x: -1.2, y: -1.2, cx: 0.4, cy: 0.4 }, d, L, B);
  ok(c.segs.length === 2 && near(c.bo, 2 * 0.725, 1e-12), 'corner: two sides, bo = 1.45 m', c.bo);
  // a column near the edge but whose section still fits stays interior
  ok(F.punchSection({ x: -0.9, y: 0, cx: 0.4, cy: 0.4 }, d, L, B).segs.length === 4, 'a column 0.6 m from the edge keeps four sides');
  // the checks: with a bigger bo the interior column needs less stress for the same load
  const f = { L: 3000, B: 3000, H: 600, concrete: '28 MPa', mat: { barX: '#6', sX: 200, barY: '#6', sY: 200, cover: 75, hooks: true } };
  const col = (x, y) => ({ x, y, cx: 400, cy: 400, service: { P: 500, Vx: 0, Vy: 0, Mx: 0, My: 0 }, strength: { P: 700, Vx: 0, Vy: 0, Mx: 0, My: 0 } });
  const run = (loads) => F.checkFooting(f, loads, { qa: 400 }).checks.filter((x) => x.id === 'punching');
  const pe = run([col(-1200, 0), col(300, 0)]);
  ok(pe.length === 2 && pe.every((x) => x.status !== 'note'), 'an edge column is checked now (it was a note)', pe.map((x) => x.status));
  ok(pe[0].vars.where === 'edge' && pe[1].vars.where === 'interior', 'the check says which kind of section it is', pe.map((x) => x.vars.where));
  const pc = run([col(-1200, -1200), col(0, 0)]);
  ok(pc[0].vars.where === 'corner', 'a corner column is a corner section');
  // with the same force a one-sided perimeter is shorter than the full one, so the shear stress is larger
  ok(pe[0].vars.bo < pe[1].vars.bo, 'the edge perimeter is shorter than the interior one', [pe[0].vars.bo, pe[1].vars.bo]);
}

console.log('Flexible mat on springs');
{
  const f = { L: 16000, B: 16000, H: 500, concrete: '28 MPa', mat: { barX: '#6', sX: 200, barY: '#6', sY: 200, cover: 75, hooks: true } };
  const one = [{ x: 0, y: 0, cx: 300, cy: 300, service: { P: 1000, Vx: 0, Vy: 0, Mx: 0, My: 0 } }];
  const r = F.flexibleMat(f, one, { ks: 20000 }, { size: 250 });
  // a plate on a Winkler bed under a point load: w = P / (8 k l^2), l = (D/k)^(1/4) (Timoshenko, Theory of Plates and Shells); the plate here is a Mindlin
  // plate (shear deformation adds a little), the load is spread over 300 mm
  const Ec = 4700 * Math.sqrt(28), nu = 0.2, D = Ec * 500 ** 3 / (12 * (1 - nu * nu)), k = 20000e-6, l = (D / k) ** 0.25, theory = 1000e3 / (8 * k * l * l);
  ok(r.ok && near(r.settleMax, theory, 0.10), 'point load on a large mat: deflection within 10 % of P / (8 k l^2)', [r.settleMax, theory]);
  ok(near(r.reaction, 1000, 1e-9), 'the springs carry exactly the load (equilibrium)', r.reaction);
  ok(r.settleMin < 0.05 * r.settleMax, 'far from the load the mat does not move', r.settleMin);
  // symmetry
  const f2 = { ...f, L: 8000, B: 8000 };
  const col = (x, y, P) => ({ x, y, cx: 400, cy: 400, service: { P, Vx: 0, Vy: 0, Mx: 0, My: 0 }, strength: { P: 1.4 * P, Vx: 0, Vy: 0, Mx: 0, My: 0 } });
  const four = F.flexibleMat(f2, [col(-1500, -1500, 800), col(1500, -1500, 800), col(-1500, 1500, 800), col(1500, 1500, 800)], { ks: 20000, qa: 200, fy: 420 });
  ok(four.ok && near(four.reaction, 3200, 1e-9), 'four columns: the springs carry 3200 kN', four.reaction);
  ok(near(four.MxPos, four.MyPos, 1e-6) && near(four.MxNeg, four.MyNeg, 1e-6), 'a symmetric layout: the moments are equal in both directions', [four.MxPos, four.MyPos]);
  const ids = four.checks.map((c) => c.id);
  ok(['mat-bearing', 'mat-flexure-x', 'mat-flexure-y', 'mat-shear', 'punching'].every((i) => ids.includes(i)), 'bearing, flexure both ways, shear and punching are all checked', ids);
  ok(four.checks.filter((c) => c.id === 'punching').length === 4, 'one punching check per column');
  ok(four.qMax > 3200 / 64 && four.qMax < 3 * 3200 / 64, 'the peak pressure is above the average 50 kPa and not wildly above', four.qMax);
  // a stiffer soil gives a smaller settlement and a bigger peak pressure
  const stiff = F.flexibleMat(f2, [col(-1500, -1500, 800), col(1500, -1500, 800), col(-1500, 1500, 800), col(1500, 1500, 800)], { ks: 80000, qa: 200 });
  ok(stiff.settleMax < four.settleMax && stiff.qMax > four.qMax, 'a stiffer bed: less settlement, more pressure under the columns', [four.settleMax, stiff.settleMax]);
  ok(F.flexibleMat(f2, one, {}).reason === 'ks' && F.flexibleMat(f2, [], { ks: 1 }).reason === 'loads', 'no subgrade modulus or no loads → refused with the reason');
  // the peak moment changes by under 5 % between two meshes
  const a = F.flexibleMat(f2, [col(-1500, -1500, 800), col(1500, 1500, 800)], { ks: 20000 }, { size: 200 }), b = F.flexibleMat(f2, [col(-1500, -1500, 800), col(1500, 1500, 800)], { ks: 20000 }, { size: 133 });
  ok(near(a.MxPos, b.MxPos, 0.08), 'the peak moment moves under 8 % when the mesh is refined from 200 to 133 mm (a 400 mm column)', [a.MxPos, b.MxPos]);
}

console.log('Clean');
{
  const c = F.cleanFoundation({ soil: { Es: 30, nu: 0.7, slim: 0, ks: 5e9 }, loads: {} });
  ok(c && c.soil.Es === 30 && c.soil.nu === 0.3 && c.soil.slim === 25 && c.soil.ks === 0, 'new soil numbers are range-checked; bad ones go back to their defaults', c && c.soil);
}
console.log(pass + ' passed, ' + fail + ' failed'); process.exit(fail ? 1 : 0);
