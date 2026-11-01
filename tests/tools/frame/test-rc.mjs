#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-rc.mjs — reinforced concrete checks by ACI 318-19 (0.8 SU.1056 step 3): lib/frame/rc-section.js, rc-aci318.js,
 * rc-design.js.
 *
 *   node tools/frame/test-rc.mjs [--verbose]
 *
 * Every expected number is a hand calculation written out step by step in this file (closed forms, not the library's
 * bisection), each line naming the ACI 318-19 clause it follows. A printed worked example from a design guide (e.g. the ACI
 * Reinforced Concrete Design Handbook, or Wight's Reinforced Concrete: Mechanics and Design) is NOT typed in yet: there is
 * none on this machine (see the session log, For the owner) — those are the next checks to add.
 */
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const VERBOSE = process.argv.includes('--verbose');
let pass = 0, fail = 0;
const ok = (c, name, extra = '') => { if (c) { pass++; if (VERBOSE) console.log('  ok   ' + name + (extra ? ' — ' + extra : '')); } else { fail++; console.log('  FAIL ' + name + (extra ? ' — ' + extra : '')); } };
const rel = (a, b) => Math.abs(a - b) / Math.max(Math.abs(b), 1e-300);
const load = (f) => import(pathToFileURL(path.join(ROOT, f)).href);
const RS = await load('lib/frame/rc-section.js');
const ACI = await load('lib/frame/rc-aci318.js');
const kNm = (v) => (v / 1e6).toFixed(3) + ' kN·m', kN = (v) => (v / 1e3).toFixed(3) + ' kN';

console.log('Stress block and φ (ACI 318-19 Table 22.2.2.4.3, Table 21.2.2)');
ok(ACI.beta1(28) === 0.85 && ACI.beta1(20) === 0.85 && rel(ACI.beta1(35), 0.80) < 1e-12 && rel(ACI.beta1(42), 0.75) < 1e-12 && ACI.beta1(55) === 0.65 && ACI.beta1(70) === 0.65, 'β1 = 0.85 to 28 MPa, −0.05 per 7 MPa, 0.65 from 55 MPa');
const ety = 420 / 200000;
ok(ACI.phiAxialFlexure(0.0051, ety) === 0.9 && ACI.phiAxialFlexure(0.002, ety) === 0.65 && rel(ACI.phiAxialFlexure(ety + 0.0015, ety), 0.775) < 1e-12 && rel(ACI.phiAxialFlexure(ety + 0.0015, ety, true), 0.825) < 1e-12,
  'φ: 0.90 at εt ≥ εty + 0.003, 0.65 tied / 0.75 spiral at εt ≤ εty, straight line between (εty = fy/Es = 0.0021)');

console.log('Beam flexure, singly reinforced');
{
  // b 300, h 600, d 540, As 1500 mm², f'c 28, fy 420
  //   a = As fy / (0.85 f'c b) = 630 000 / 7 140 = 88.235 mm (22.2.2.4.1); c = a / β1 = 103.806 mm
  //   εt = 0.003 (d − c) / c = 0.012606 ≥ εty + 0.003 = 0.0051 → tension-controlled, φ = 0.90 (Table 21.2.2)
  //   Mn = As fy (d − a/2) = 630 000 × 495.882 = 312.406 kN·m; φMn = 281.165 kN·m
  //   As,min = max(0.25 √28 / 420, 1.4 / 420) × 300 × 540 = max(510.3, 540.0) = 540 mm² (9.6.1.2)
  const b = 300, h = 600, d = 540, As = 1500, fc = 28, fy = 420;
  const a = As * fy / (0.85 * fc * b), c = a / 0.85, Mn = As * fy * (d - a / 2);
  const r = ACI.beamFlexure({ b, h, layers: [{ d, As }], fc, fy });
  ok(rel(r.a, a) < 1e-9 && rel(r.c, c) < 1e-9, 'stress block depth a = 88.235 mm, c = 103.806 mm', r.a.toFixed(3) + ', ' + r.c.toFixed(3));
  ok(rel(r.Mn, Mn) < 1e-9 && rel(Mn, 312.4059e6) < 1e-6, 'Mn = As fy (d − a/2) = 312.406 kN·m', kNm(r.Mn));
  ok(r.phi === 0.9 && r.tensionControlled && r.ductile && rel(r.epsT, 0.003 * (d - c) / c) < 1e-9, 'tension-controlled, φ = 0.90, εt = 0.01261 ≥ 0.004 (9.3.3.1)', r.epsT.toFixed(5));
  ok(rel(r.AsMin, 540) < 1e-9 && r.AsMinOk, 'As,min = 540 mm² (1.4/fy governs), provided', r.AsMin.toFixed(1));
  ok(rel(ACI.requiredAs({ b, d, fc, fy, Mu: r.phiMn }), As) < 1e-9, 'required As for Mu = φMn gives back 1500 mm²');
  // the same beam from bar positions (rectBars) and with the moment reversed: the bars are then on the compression side
  const bars = RS.rectBars({ b, h, bottom: { n: 3, A: 500, cover: 60 } });
  const r2 = ACI.beamFlexure({ b, h, bars, fc, fy, axis: 'y', sign: 1 });
  ok(rel(r2.Mn, Mn) < 1e-9, 'three 500 mm² bars at 60 mm cover from rectBars: the same Mn (My > 0 compresses +z)');
  const over = ACI.beamFlexure({ b, h, layers: [{ d, As: 6000 }], fc, fy });
  // As 6000: assuming yield, a = 352.9 → c = 415.2 and εs = 0.003 (540 − 415.2)/415.2 = 0.0009 < εty, so the steel does not
  // yield; equilibrium with fs = Es εs gives εt ≈ 0.0017 < εty: compression-controlled, φ = 0.65, and εt < 0.004 (9.3.3.1)
  ok(!over.ductile && over.phi === 0.65 && over.steel[0].fs < fy, 'heavily reinforced (6000 mm²): steel does not yield, εt < 0.004 flagged, φ = 0.65', over.epsT.toFixed(5));
}

console.log('Beam flexure, doubly reinforced');
{
  // b 300, d 540, d' 60, As 3000, A's 1000, f'c 28, fy 420. Assume A's yields: a = (3000·420 − 1000(420 − 23.8))/7140 =
  //   120.98, c = 142.33 → ε's = 0.003 (142.33 − 60)/142.33 = 0.00174 < εty: it does not. With f's = 600 (c − 60)/c:
  //   0.85·28·300·0.85 c + 1000 (600 (c − 60)/c − 0.85·28) = 3000·420  →  6069 c² − 683 800 c − 36 000 000 = 0
  //   c = (683 800 + √(683 800² + 4·6069·36e6)) / (2·6069) = 151.758 mm; a = 128.994; f's = 362.78 MPa
  //   Mn = 0.85 f'c b a (d − a/2) + A's (f's − 0.85 f'c)(d − d') = 600.66 kN·m; εt = 0.003 (540 − c)/c = 0.00768 → φ 0.90
  const qa = 6069, qb = -683800, qc = -36e6;
  const c = (-qb + Math.sqrt(qb * qb - 4 * qa * qc)) / (2 * qa), a = 0.85 * c, fsp = 600 * (c - 60) / c;
  const Mn = 0.85 * 28 * 300 * a * (540 - a / 2) + 1000 * (fsp - 0.85 * 28) * (540 - 60);
  const r = ACI.beamFlexure({ b: 300, h: 600, layers: [{ d: 60, As: 1000 }, { d: 540, As: 3000 }], fc: 28, fy: 420 });
  ok(rel(r.c, c) < 1e-6 && rel(c, 151.758) < 1e-5, 'neutral axis c = 151.758 mm (compression steel elastic)', r.c.toFixed(3));
  ok(rel(r.steel[0].fs, fsp) < 1e-6 && rel(fsp, 362.78) < 1e-4, "f's = 362.78 MPa < fy", r.steel[0].fs.toFixed(2));
  ok(rel(r.Mn, Mn) < 1e-6 && rel(Mn, 600.66e6) < 1e-4, 'Mn = 600.66 kN·m', kNm(r.Mn));
  ok(r.phi === 0.9 && r.ductile, 'φ = 0.90, εt = 0.00768');
}

console.log('Shear (Table 22.5.5.1, 22.5.8.5.3, 9.6.3.4, 9.7.6.2.2)');
{
  // bw 300, d 540, h 600, f'c 28, fyt 420, two-leg 10 mm stirrups Av = 2 × 71 = 142 mm² at s = 200, As = 1500 (ρw 0.009259)
  //   Av,min = max(0.062 √28, 0.35) × 300 × 200 / 420 = max(46.87, 50.00) = 50.0 mm² → Av ≥ Av,min, so Vc = the larger of
  //   (a) 0.17 √28 × 300 × 540 = 145.729 kN and (b) 0.66 ρw^⅓ √28 × 300 × 540 = 118.84 kN → 145.729 kN
  //   Vs = Av fyt d / s = 142 × 420 × 540 / 200 = 161.028 kN; φVn = 0.75 (145.729 + 161.028) = 230.068 kN
  //   Vs ≤ 0.33 √28 bw d = 282.88 kN → s ≤ min(d/2, 600) = 270 mm
  const r = ACI.beamShear({ bw: 300, d: 540, h: 600, fc: 28, fyt: 420, Av: 142, s: 200, Vu: 200000, As: 1500 });
  const Vca = 0.17 * Math.sqrt(28) * 300 * 540, Vcb = 0.66 * Math.cbrt(1500 / (300 * 540)) * Math.sqrt(28) * 300 * 540;
  ok(rel(r.AvMin, 50) < 1e-12 && r.hasMin, 'Av,min = 50.0 mm² (0.35 bw s / fyt governs); 142 provided');
  ok(rel(r.Vc, Vca) < 1e-12 && rel(Vca, 145729) < 1e-5 && r.eq === '(a)' && Vcb < Vca, 'Vc = 145.729 kN by (a) (> (b) 118.8 kN)', kN(r.Vc) + ' / (b) ' + kN(Vcb));
  ok(rel(r.Vs, 161028) < 1e-12 && rel(r.phiVn, 0.75 * (Vca + 161028)) < 1e-12, 'Vs = 161.028 kN, φVn = 230.068 kN', kN(r.phiVn));
  ok(r.sMax === 270 && r.sOk && r.sizeOk && r.AvMinNeeded, 's ≤ 270 mm; section size ok; Av,min needed (Vu > φ 0.083 √f\'c bw d)');
  const none = ACI.beamShear({ bw: 300, d: 540, h: 600, fc: 28, fyt: 420, Av: 0, s: 0, Vu: 20000, As: 1500 });
  // no stirrups: (c) λs = √(2 / (1 + 0.004 × 540)) = 0.7956; Vc = 0.66 × 0.7956 × 0.21 × √28 × 300 × 540 = 94.54 kN
  const ls = Math.sqrt(2 / (1 + 0.004 * 540));
  ok(rel(none.lamS, ls) < 1e-12 && rel(none.Vc, 0.66 * ls * Math.cbrt(1500 / 162000) * Math.sqrt(28) * 162000) < 1e-12 && none.eq === '(c)', 'no stirrups: Vc by (c) with the size effect λs = 0.7956', kN(none.Vc));
  ok(!none.AvMinNeeded, 'Vu = 20 kN ≤ φ 0.083 √f\'c bw d = 53.4 kN: no minimum stirrups needed');
  const big = ACI.beamShear({ bw: 300, d: 540, h: 600, fc: 28, fyt: 420, Av: 142, s: 100, Vu: 900000, As: 1500 });
  ok(!big.sizeOk && big.sMax === 135, 'Vu 900 kN: section too small (22.5.1.2); Vs > 0.33 √f\'c bw d halves the spacing to d/4 = 135 mm');
  const hi = ACI.beamShear({ bw: 300, d: 540, h: 600, fc: 100, fyt: 500, Av: 142, s: 200, As: 1500 });
  ok(rel(hi.Vc, 0.17 * 8.3 * 162000) < 1e-12 && hi.fytUse === 420, '√f\'c capped at 8.3 MPa (22.5.3.1), fyt at 420 MPa (20.2.2.4)');
}

console.log('Column P–M interaction (22.4.2, Table 21.2.2)');
{
  // 400 × 400, f'c 28, fy 420, 8 bars of 510 mm²: 3 at d = 60, 2 at d = 200, 3 at d = 340 (Ast 4080, Ag 160 000)
  //   Po = 0.85·28 (160 000 − 4080) + 420·4080 = 5 424.496 kN (22.4.2.2); Pn,max = 0.80 Po = 4 339.597 kN; φ = 0.65 → 2 820.738 kN
  //   balanced: c = 340 × 0.003 / (0.003 + 0.0021) = 200 mm, a = 170 mm, Cc = 23.8 × 400 × 170 = 1 618.4 kN
  //     d 60: εs = 0.0021 → 420 MPa, inside the block: 1530 (420 − 23.8) = 606.186 kN; d 200: εs = 0 → 0; d 340: −420 → −642.6 kN
  //     Pn = 1 581.986 kN; Mn = 1618.4 × 115 + 606.186 × 140 + 642.6 × 140 = 360.946 kN·m; εt = εty → φ = 0.65
  const bars = RS.perimeterBars({ b: 400, h: 400, cover: 60, ny: 3, nz: 3, A: 510 });
  ok(bars.length === 8, 'perimeterBars: 3 × 3 cage = 8 bars');
  const D = ACI.interaction({ b: 400, h: 400, bars, fc: 28, fy: 420 });
  ok(rel(D.Po, 5424496) < 1e-12 && rel(D.phiPnMax, 0.65 * 0.8 * 5424496) < 1e-12, 'Po = 5 424.5 kN, φPn,max = 0.65 × 0.80 Po = 2 820.7 kN', kN(D.phiPnMax));
  const bal = D.points.find((p) => Math.abs(p.c - 200) < 1e-9);
  ok(bal && rel(bal.Pn, 1581986) < 1e-9 && rel(bal.Mn, 360946040) < 1e-9 && bal.phi === 0.65, 'balanced point: Pn = 1 581.986 kN, Mn = 360.946 kN·m, φ = 0.65', bal && (kN(bal.Pn) + ', ' + kNm(bal.Mn)));
  ok(rel(D.Pnt, -420 * 4080) < 1e-12 && D.phiPnt === 0.9 * D.Pnt, 'pure tension Pnt = fy Ast = −1 713.6 kN, φ = 0.90');
  ok(Math.abs(ACI.pmRatio(D, bal.phiPn, bal.phiMn) - 1) < 1e-9, 'a load on the φ outline has utilisation 1');
  ok(rel(ACI.pmRatio(D, bal.phiPn / 2, bal.phiMn / 2), 0.5) < 1e-9 && rel(ACI.pmRatio(D, D.phiPnMax * 0.8, 0), 0.8) < 1e-9, 'half the balanced load → 0.5; 0.8 φPn,max with no moment → 0.8');
  const pure = D.points.find((p) => Math.abs(p.Pn) < 1e-3);
  const flex = ACI.beamFlexure({ b: 400, h: 400, bars, fc: 28, fy: 420 });
  ok(pure && rel(pure.Mn, flex.Mn) < 1e-9, 'the diagram passes through pure bending = beamFlexure on the same bars', kNm(flex.Mn));
  ok(D.points.every((p, k) => !k || p.Pn <= D.points[k - 1].Pn + 1e-6 * D.Po), 'points run from compression to tension');
  const sp = ACI.interaction({ b: 400, h: 400, bars, fc: 28, fy: 420, spiral: true });
  ok(rel(sp.phiPnMax, 0.75 * 0.85 * 5424496) < 1e-12, 'spiral: φPn,max = 0.75 × 0.85 Po');
  const zAxis = ACI.interaction({ b: 300, h: 500, bars: RS.perimeterBars({ b: 300, h: 500, cover: 50, ny: 2, nz: 3, A: 500 }), fc: 35, fy: 420, axis: 'z' });
  const yAxis = ACI.interaction({ b: 300, h: 500, bars: RS.perimeterBars({ b: 300, h: 500, cover: 50, ny: 2, nz: 3, A: 500 }), fc: 35, fy: 420, axis: 'y' });
  const mz = Math.max(...zAxis.points.map((p) => p.phiMn)), my = Math.max(...yAxis.points.map((p) => p.phiMn));
  ok(my > mz * 1.3, 'a 300 × 500 column is stronger about its strong axis (y) than about z', kNm(my) + ' vs ' + kNm(mz));
  ok(rel(ACI.torsionThreshold({ b: 300, h: 600, fc: 28 }), 0.75 * 0.083 * Math.sqrt(28) * 180000 ** 2 / 1800) < 1e-12, 'threshold torsion φ 0.083 √f\'c Acp²/pcp (22.7.4.1)');
}

console.log('Members of a solved frame (rc-design.js)');
{
  const FM = await load('lib/frame/frame-model.js'), FS = await load('lib/frame/frame-solve.js'), RD = await load('lib/frame/rc-design.js');
  const Ec = 4700 * Math.sqrt(28), Gc = Ec / 2.4;                                  // 19.2.2.1(b); ν = 0.2
  // a simply supported beam 300 × 600, L = 6 m, bottom 3 × 500 mm² at 60 mm, top 2 × 200 at 50 mm, ties Av 142 @ 200
  const bars = RS.rectBars({ b: 300, h: 600, bottom: { n: 3, A: 500, cover: 60 }, top: { n: 2, A: 200, cover: 50 } });
  const w = 40;                                                                     // N/mm factored
  const beam = FM.cleanFrame({ format: 'cadcraft-frame', version: 1, nodes: [{ id: 'a', x: 0, y: 0, z: 3000 }, { id: 'b', x: 6000, y: 0, z: 3000 }],
    materials: [{ id: 'c', E: Ec, G: Gc, rho: 0 }], sections: [{ id: 'B', name: '300x600', A: 180000, Iy: 300 * 600 ** 3 / 12, Iz: 600 * 300 ** 3 / 12, J: 2.7e9 }, { id: 'X', A: 1, Iy: 1, Iz: 1, J: 1 }],
    members: [{ id: 'm', i: 'a', j: 'b', section: 'B', material: 'c' }],
    supports: [{ node: 'a', fix: [1, 1, 1, 1, 0, 0] }, { node: 'b', fix: [0, 1, 1, 0, 0, 0] }],
    cases: [{ id: 'D', kind: 'dead', loads: [{ type: 'udl', member: 'm', dir: 'Z', w: -w }] }], combos: [{ id: 'U', name: 'U', factors: [{ case: 'D', f: 1 }], limit: 'strength', clause: 'test' }] }).model;
  const sol = FS.solveFrame(beam);
  const rc = { code: 'aci318', fc: 28, fy: 420, fyt: 420, sections: { B: { b: 300, h: 600, bars, ties: { Av: 142, s: 200 } } } };
  const res = RD.checkRcFrame(beam, sol, rc, { n: 24 });
  const m = res.members[0], gov = m.sets[0].checks;
  const fl = ACI.beamFlexure({ b: 300, h: 600, bars, fc: 28, fy: 420, axis: 'y', sign: 1 });
  const flex = gov.find((c) => c.id === 'rc-flexure'), sh = gov.find((c) => c.id === 'rc-shear-z');
  ok(res.ok && m.role === 'beam' && rel(flex.demand, w * 6000 ** 2 / 8 / fl.phiMn) < 1e-6, 'beam: flexure utilisation = (wL²/8) / φMn+ at mid-span', (flex.demand * 100).toFixed(2) + ' %');
  const vs = ACI.beamShear({ bw: 300, d: 540, h: 600, fc: 28, fyt: 420, Av: 142, s: 200, Vu: w * 3000, As: 1500 });
  ok(rel(sh.demand, w * 3000) < 1e-6 && rel(sh.capacity, vs.phiVn) < 1e-9 && sh.x < 1e-9, 'beam: shear wL/2 at the support against φVn with d = 540 mm', (sh.demand / sh.capacity * 100).toFixed(2) + ' %');
  ok(m.status === 'ok' && m.util < 1 && res.clauses.includes('ACI 318-19 22.5.1.1 + Table 22.5.5.1'), 'beam passes and names its clauses', m.check.id + ' ' + (m.util * 100).toFixed(1) + ' %');
  const heavy = RD.checkRcFrame(beam, sol, { ...rc, sections: { B: { ...rc.sections.B, bars: RS.rectBars({ b: 300, h: 600, bottom: { n: 4, A: 1500, cover: 60 } }) } } });
  ok(heavy.members[0].status === 'fail' && heavy.members[0].sets[0].checks.some((c) => c.id === 'rc-ductility' && c.ratio > 1), 'over-reinforced beam fails 9.3.3.1 (εt < 0.004)');
  const nos = RD.checkRcFrame(beam, sol, { ...rc, sections: {} });
  ok(nos.members[0].status === 'not-checked' && nos.members[0].why === 'no-rc-section' && nos.members[0].util === null, 'a member without bars is "not checked", never a number');
  ok(!RD.checkRcFrame(beam, sol, { code: 'none' }).ok && !RD.checkRcFrame(beam, { ok: false }, rc).ok, 'no code chosen / no solution: refused');
  // a cantilever column 400 × 400 with the 8-bar cage: axial load + a horizontal load at the top
  const cage = RS.perimeterBars({ b: 400, h: 400, cover: 60, ny: 3, nz: 3, A: 510 });
  const col = (Lc, H, P) => FM.cleanFrame({ format: 'cadcraft-frame', version: 1, nodes: [{ id: 'a', x: 0, y: 0, z: 0 }, { id: 'b', x: 0, y: 0, z: Lc }],
    materials: [{ id: 'c', E: Ec, G: Gc, rho: 0 }], sections: [{ id: 'C', name: '400x400', A: 160000, Iy: 400 ** 4 / 12, Iz: 400 ** 4 / 12, J: 3.6e9 }],
    members: [{ id: 'c1', i: 'a', j: 'b', section: 'C', material: 'c' }], supports: [{ node: 'a', fix: [1, 1, 1, 1, 1, 1] }],
    cases: [{ id: 'D', loads: [{ type: 'node', node: 'b', F: [H, 0, -P, 0, 0, 0] }] }], combos: [{ id: 'U', name: 'U', factors: [{ case: 'D', f: 1 }], limit: 'strength' }] }).model;
  const crc = { code: 'aci318', fc: 28, fy: 420, fyt: 420, sections: { C: { b: 400, h: 400, bars: cage, ties: { Av: 157, s: 150 } } } };
  const c1 = col(2400, 50000, 1000000);
  const cr = RD.checkRcFrame(c1, FS.solveFrame(c1), crc);
  const D = ACI.interaction({ b: 400, h: 400, bars: cage, fc: 28, fy: 420, axis: 'z' });
  const pm = cr.members[0].sets[0].checks.find((c) => c.id === 'rc-pm');
  // the vertical member's local z is +X, so a load along X bends it about local y… the cage is square: both axes alike
  ok(cr.members[0].role === 'column' && rel(pm.demand, ACI.pmRatio(D, 1e6, 50000 * 2400)) < 1e-6 && pm.x < 1e-9, 'column: P–M utilisation at the base = (1000 kN, 120 kN·m) on the φ diagram', (pm.demand * 100).toFixed(2) + ' %');
  ok(cr.members[0].status === 'ok' && !cr.members[0].partial.includes('slender-sway'), 'ℓu/r = 2400 / 120 = 20 ≤ 22: no slenderness flag');
  const c2 = col(3000, 50000, 1000000), cr2 = RD.checkRcFrame(c2, FS.solveFrame(c2), crc);
  ok(cr2.members[0].status === 'partial' && cr2.members[0].partial.includes('slender-sway'), 'ℓu/r = 25 > 22 (sway): "partly checked", sway magnification (6.6.4.6) not built');
  const c3 = col(2400, 0, 2000000), cr3 = RD.checkRcFrame(c3, FS.solveFrame(c3), crc);
  ok(rel(cr3.members[0].util, 2e6 / D.phiPnMax) < 1e-6, 'pure axial load: utilisation = Pu / φPn,max', (cr3.members[0].util * 100).toFixed(2) + ' %');
  // biaxial: equal loads along X and Y at the top
  const c4 = FM.cleanFrame({ ...c1, combos: c1.combos, cases: [{ id: 'D', loads: [{ type: 'node', node: 'b', F: [40000, 40000, -1000000, 0, 0, 0] }] }] }).model;
  const cr4 = RD.checkRcFrame(c4, FS.solveFrame(c4), crc);
  const b4 = cr4.members[0].sets[0].checks.find((c) => c.id === 'rc-pm');
  ok(b4.clause.includes('Bresler') && b4.demand > ACI.pmRatio(D, 1e6, 40000 * 2400), 'two moments, Pu ≥ 0.10 f\'c Ag: Bresler\'s reciprocal method, more than either axis alone', (b4.demand * 100).toFixed(2) + ' %');
}

console.log('Slenderness of a non-sway column (6.6.4.5)');
{
  const FM = await load('lib/frame/frame-model.js'), FS = await load('lib/frame/frame-solve.js'), RD = await load('lib/frame/rc-design.js');
  const Ec = 4700 * Math.sqrt(28);
  // hand: 400 × 400, ℓu = 6000, k = 1, fc 28, βdns 0.6: kℓu/r = 6000 / 120 = 50 > 40 (single curvature, M1/M2 = 1: 34 + 12 = 46 ≤ 40)
  const Ig = 400 ** 4 / 12, EI = 0.4 * Ec * Ig / 1.6, Pc = Math.PI ** 2 * EI / 6000 ** 2;
  const Pu = 1e6, M = 100e6;
  const rcSet = { fc: 28, k: 1, betaDns: 0.6 };
  const mg = RD.magnifyNonSway({ Ms: [M, M, M], Pu, dim: 400, Ig, L: 6000, rc: rcSet });
  ok(mg.slender && rel(mg.Pc, Pc) < 1e-12 && Math.abs(Pc / 1e3 - 3636.5) < 1, 'Pc = π² (0.4 Ec Ig / 1.6) / ℓu² = 3636 kN', (Pc / 1e3).toFixed(1));
  const delta = 1 / (1 - Pu / (0.75 * Pc));
  ok(rel(mg.delta, delta) < 1e-12 && Math.abs(delta - 1.579) < 0.001, 'δns = Cm / (1 − Pu / 0.75 Pc) = 1 / 0.6333 = 1.579 with Cm = 1.0 (M1 = M2 would be 0.6 + 0.4 = 1.0)', delta.toFixed(4));
  ok(rel(mg.Mc, delta * M) < 1e-12, 'Mc = δns M2', mg.Mc / 1e6);
  ok(rel(mg.M2min, Pu * (15 + 0.03 * 400)) < 1e-12 && mg.M2min === 27e6, 'M2,min = Pu (15 + 0.03 h) = 1000 kN × 27 mm = 27 kN·m');
  // a short column is left alone; double curvature has a larger limit but a smaller Cm
  ok(RD.magnifyNonSway({ Ms: [M, M], Pu, dim: 400, Ig, L: 4000, rc: rcSet }).slender === false, 'kℓu/r = 33 ≤ 46: not slender');
  const dbl = RD.magnifyNonSway({ Ms: [M, 0, -M], Pu, dim: 400, Ig, L: 6000, rc: rcSet });
  ok(dbl.slender === false || dbl.Cm === 0.4, 'double curvature (M1/M2 = −1): limit 34 − 12 = 22 → slender, Cm = 0.6 − 0.4 = 0.2 → 0.4', dbl);
  const low = RD.magnifyNonSway({ Ms: [1e6, 1e6], Pu, dim: 400, Ig, L: 6000, rc: rcSet });
  ok(low.Cm === 1 && rel(low.Mc, low.delta * 27e6) < 1e-12, 'when M2,min governs Cm = 1.0 and Mc = δns M2,min (6.6.4.5.4)', low);
  const bent = RD.magnifyNonSway({ Ms: [0, 80e6, 0], Pu, dim: 400, Ig, L: 6000, rc: rcSet });
  ok(bent.Cm === 1, 'a moment diagram bulging between the ends (loads between the supports): Cm = 1.0 (6.6.4.5.3b)', bent.Cm);
  const buck = RD.magnifyNonSway({ Ms: [M, M], Pu: 0.8 * Pc, dim: 400, Ig, L: 6000, rc: rcSet });
  ok(buck.unstable === true, 'Pu above 0.75 Pc: the column buckles — a failure, not a number');
  // in the frame check: a constant moment on a 6 m column, non-sway: the P–M ratio is taken at δns M
  const cage = RS.perimeterBars({ b: 400, h: 400, cover: 60, ny: 3, nz: 3, A: 510 });
  const Gc = Ec / 2.4;
  const colm = FM.cleanFrame({ format: FM.FORMAT, version: FM.VERSION, nodes: [{ id: 'a', x: 0, y: 0, z: 0 }, { id: 'b', x: 0, y: 0, z: 6000 }],
    materials: [{ id: 'c', E: Ec, G: Gc, rho: 0 }], sections: [{ id: 'C', name: '400x400', A: 160000, Iy: Ig, Iz: Ig, J: 3.6e9 }],
    members: [{ id: 'c1', i: 'a', j: 'b', section: 'C', material: 'c' }], supports: [{ node: 'a', fix: [1, 1, 1, 1, 1, 1] }],
    cases: [{ id: 'D', loads: [{ type: 'node', node: 'b', F: [0, 0, -Pu, 0, M, 0] }] }], combos: [{ id: 'U', name: 'U', factors: [{ case: 'D', f: 1 }], limit: 'strength' }] }).model;
  const base = { code: 'aci318', fc: 28, fy: 420, fyt: 420, sections: { C: { b: 400, h: 400, bars: cage, ties: { Av: 157, s: 150 } } } };
  const nonsway = RD.checkRcFrame(colm, FS.solveFrame(colm), { ...base, sway: false, k: 1 });
  const D = ACI.interaction({ b: 400, h: 400, bars: cage, fc: 28, fy: 420, axis: 'z' });
  const pmN = nonsway.members[0].sets[0].checks.find((c) => c.id === 'rc-pm');
  ok(nonsway.members[0].mag && nonsway.members[0].mag.y && nonsway.members[0].mag.y.slender, 'the member reports its magnification');
  const dN = nonsway.members[0].mag.y.delta;
  ok(Math.abs(dN - delta) < 1e-6, 'the frame check finds the same δns as the hand calculation', dN);
  ok(rel(pmN.demand, ACI.pmRatio(D, Pu, dN * M)) < 1e-6, 'non-sway: the P–M ratio is taken at Mc = δns M', (pmN.demand * 100).toFixed(2) + ' % vs ' + (ACI.pmRatio(D, Pu, dN * M) * 100).toFixed(2) + ' % at Mc, ' + (ACI.pmRatio(D, Pu, M) * 100).toFixed(2) + ' % first order, M at base ' + pmN.x);
  ok(pmN.demand > ACI.pmRatio(D, Pu, M), 'it is larger than the first-order ratio');
  ok(!nonsway.members[0].partial.includes('slender-sway') && !nonsway.members[0].partial.includes('slender'), 'a non-sway column is designed, not left "partly checked" for slenderness');
  const swayed = RD.checkRcFrame(colm, FS.solveFrame(colm), { ...base, sway: true, k: 1 });
  ok(swayed.members[0].partial.includes('slender-sway') && rel(swayed.members[0].sets[0].checks.find((c) => c.id === 'rc-pm').demand, ACI.pmRatio(D, Pu, M)) < 1e-6, 'a sway column is flagged and left at the first-order moment');
  const unstable = FM.cleanFrame({ ...colm, cases: [{ id: 'D', loads: [{ type: 'node', node: 'b', F: [0, 0, -0.8 * Pc, 0, M, 0] }] }] }).model;
  const ur = RD.checkRcFrame(unstable, FS.solveFrame(unstable), { ...base, sway: false, k: 1 });
  ok(ur.members[0].status === 'fail' && ur.members[0].sets[0].checks.some((c) => c.id === 'rc-slender-buckling' && c.ratio > 1), 'Pu above 0.75 Pc fails the member with its own check', ur.members[0].sets[0].checks.map((c) => c.id));
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
