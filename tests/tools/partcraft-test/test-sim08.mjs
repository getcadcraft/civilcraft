#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-sim08.mjs — PartCraft simulation, 0.8 (session part-sim-08): nonlinear.js, contact.js, calculix.js, magnet.js,
 * each against a closed-form or published answer.
 *   nonlinear: the bilinear stress–strain curve of a bar under force (3 load levels, two Poisson ratios), the algorithmic
 *     tangent against a finite difference of the stress update, perfectly plastic limit.
 *   contact: bonded non-matching bars (exact 1-D elongation), frictionless bars across a gap (gap + σL/E), Hertz contact of a
 *     steel sphere on an aluminium sphere (contact radius, peak pressure, force balance).
 *   calculix: the deck written for the bar and the contact model, read back by a small independent reader; a .frd read back.
 *   magnet: see magnet.js.
 *   node tools/partcraft-test/test-sim08.mjs [--verbose] [--skip-hertz] [--write-decks <dir>]
 */
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { boxT10, faceTraction, outwardFaces, revolveQuarter, spherePole } from './sim08-mesh.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DEV = path.join(HERE, '../../public_html/assets/apps/partcraft/dev/');
const args = process.argv.slice(2), verbose = args.includes('--verbose');

export async function runSim08Tests({ ok, section, near, log = (m) => console.log('  note ' + m) }) {
  const TF = await import(DEV + 'tetfea.js'), NL = await import(DEV + 'nonlinear.js'), CT = await import(DEV + 'contact.js'), CX = await import(DEV + 'calculix.js');
  const FE = await import(DEV + 'fea.js');
  const rel = (a, b) => Math.abs(a / b - 1);

  /** model + nodal load + symmetric supports from a box t10: load f0 (old numbering) → permuted. */
  const prepare = (t10, f0, holds, extraPairs = null) => {
    const model = TF.makeTetModel(t10, extraPairs ? { extraPairs } : {});
    const f = new Float64Array(model.N);
    for (let i = 0; i < t10.nodes.length / 3; i++) for (let a = 0; a < 3; a++) f[3 * model.perm[i] + a] = f0[3 * i + a];
    const nd = new Map();
    for (const [i, ax] of holds) { const l = nd.get(model.perm[i]) || []; l.push([0, 1, 2].map((b) => (b === ax ? 1 : 0))); nd.set(model.perm[i], l); }
    return { model, f, cons: FE.makeConstraints(nd) };
  };
  const planeHolds = (t10, planes) => { const h = []; for (let i = 0; i < t10.nodes.length / 3; i++) for (const [ax, v] of planes) if (Math.abs(t10.nodes[3 * i + ax] - v) < 1e-9) h.push([i, ax]); return h; };
  const meanU = (model, t10, u, ax, pred) => { let s = 0, c = 0; for (let i = 0; i < t10.nodes.length / 3; i++) if (pred([t10.nodes[3 * i], t10.nodes[3 * i + 1], t10.nodes[3 * i + 2]])) { s += u[3 * model.perm[i] + ax]; c++; } return s / c; };

  // ------------------------------------------------------------------ nonlinear
  section('nonlinear.js: the bilinear curve of a bar under force, and the tangent');
  const E = 200000, sy = 250, Et = 20000, L = 20, W = 5;
  const bar = boxT10([L, W, W], [4, 1, 1]);
  for (const nu of [0.3, 0]) {
    const mat = NL.bilinearMaterial({ E, nu, yield: sy, Et });
    const hold = planeHolds(bar, [[0, 0], [1, 0], [2, 0]]);
    for (const stress of [200, 300, 400]) {
      const P = prepare(bar, faceTraction(bar, (p) => Math.abs(p[0] - L) < 1e-9, [stress, 0, 0]), hold);
      const r = NL.solveNonlinear(P.model, [mat], null, P, { steps: 8 });
      const eps = meanU(P.model, bar, r.u, 0, (p) => Math.abs(p[0] - L) < 1e-9) / L, ref = stress <= sy ? stress / E : sy / E + (stress - sy) / Et;
      ok(r.converged && rel(eps, ref) < 1e-4, `ν ${nu}, σ ${stress} MPa: axial strain ${eps.toExponential(5)} vs the bilinear curve ${ref.toExponential(5)} (${((eps / ref - 1) * 100).toExponential(1)} %)`);
      if (stress === 400 && nu === 0.3) {
        const lat = meanU(P.model, bar, r.u, 1, (p) => Math.abs(p[1] - W) < 1e-9) / W;
        // lateral strain: elastic part −ν σy/E ... plus the incompressible plastic part −½ Δεp, with Δεp = (σ − σy)(1/Et − 1/E)
        const epl = (stress - sy) * (1 / Et - 1 / E), refLat = -nu * stress / E - 0.5 * epl;
        ok(rel(lat, refLat) < 1e-3, `ν 0.3, σ 400: lateral strain ${lat.toExponential(4)} vs −νσ/E − ½εp = ${refLat.toExponential(4)} (plastic flow does not change volume)`);
        const aMax = Math.max(...r.state.a);
        ok(rel(aMax, epl) < 1e-4, `accumulated plastic strain ${aMax.toExponential(4)} vs (σ − σy)(1/Et − 1/E) = ${epl.toExponential(4)}`);
      }
    }
  }
  {
    // the algorithmic tangent is the derivative of the stress update (finite difference), elastic and plastic
    const mat = NL.bilinearMaterial({ E, nu: 0.3, yield: sy, Et });
    const eps0 = [2e-3, -5e-4, -4e-4, 6e-4, -3e-4, 2e-4], ep0 = new Float64Array(6), out = { ep: new Float64Array(6), a: 0 };
    let worst = 0;
    for (const sc of [0.2, 1, 2.5]) {
      const eps = eps0.map((v) => v * sc), sig = new Float64Array(6), Dep = new Float64Array(36);
      const pl = NL.returnMap(mat, eps, ep0, 0, sig, Dep, out);
      for (let j = 0; j < 6; j++) {
        const h = 1e-8, e2 = eps.slice(), s2 = new Float64Array(6), D2 = new Float64Array(36), o2 = { ep: new Float64Array(6), a: 0 };
        e2[j] += h; NL.returnMap(mat, e2, ep0, 0, s2, D2, o2);
        for (let i = 0; i < 6; i++) worst = Math.max(worst, Math.abs((s2[i] - sig[i]) / h - Dep[i * 6 + j]) / (E * 0.5));
      }
      if (sc === 1) ok(pl, 'the test strain yields at scale 1');
    }
    ok(worst < 1e-5, `algorithmic tangent vs finite difference of the stress update (elastic, just plastic, deeply plastic): worst ${worst.toExponential(1)} of E/2`);
    // perfectly plastic: the stress stays at the yield stress
    const pp = NL.bilinearMaterial({ E, nu: 0.3, yield: sy, Et: 0 }), sg = new Float64Array(6), Dp = new Float64Array(36);
    NL.returnMap(pp, [5e-3, -1.5e-3, -1.5e-3, 0, 0, 0], new Float64Array(6), 0, sg, Dp, out);
    ok(Math.abs(Math.abs(sg[0] - sg[1]) - sy) < 1e-6, `perfectly plastic (Et 0): uniaxial stress held at ${sy} MPa (σ1 − σ2 = ${(sg[0] - sg[1]).toFixed(6)})`);
  }

  // ------------------------------------------------------------------ contact: bonded and frictionless bars
  /** Two bars end to end (steel, aluminium; 3×3 and 2×2 elements on the joint), a gap for the frictionless case, a pull (bonded) or a push (frictionless). */
  const bars = (type) => {
    const E1 = 200000, E2 = 70000, S = 10, A = 8, gap = 0.01, stress = 100, g = type === 'bonded' ? 0 : gap;
    const b1 = boxT10([S, A, A], [2, 3, 3]), b2 = boxT10([S, A, A], [2, 2, 2], [S + g, 0, 0]);
    const slaveT = outwardFaces(b1, (p) => Math.abs(p[0] - S) < 1e-9), masterT = outwardFaces(b2, (p) => Math.abs(p[0] - (S + g)) < 1e-9);
    const t10 = CT.mergeBodies([{ ...b1, btri6: Int32Array.from(slaveT.flat()), bface: new Int32Array(slaveT.length) }, { ...b2, btri6: Int32Array.from(masterT.flat()), bface: new Int32Array(masterT.length) }]);
    const pairs = [{ type, slave: slaveT.map((_, i) => i), master: masterT.map((_, i) => slaveT.length + i), kn: CT.autoPenalty(E2, 2.7, type === 'bonded' ? 1e3 : 200) }];
    const plan = CT.planContact(t10, pairs, { cutoff: 3 });
    const holds = [...planeHolds(b1, [[0, 0], [1, 0], [2, 0]]), ...planeHolds(b2, [[1, 0], [2, 0]]).map(([i, ax]) => [i + b1.nodes.length / 3, ax])];
    const f0 = new Float64Array(t10.nodes.length), sgn = type === 'bonded' ? 1 : -1;
    faceTraction(b2, (p) => Math.abs(p[0] - (S + g + S)) < 1e-9, [sgn * stress, 0, 0]).forEach((v, i) => { f0[b1.nodes.length + i] = v; });
    const P = prepare(t10, f0, holds, plan.extraPairs);
    return { t10, plan, P, pairs, mats: [NL.bilinearMaterial({ E: E1, nu: 0 }), NL.bilinearMaterial({ E: E2, nu: 0 })], tipX: S + g + S, ref: sgn * (g + stress * S / E1 + stress * S / E2), type };
  };
  section('contact.js: bonded and frictionless bars against the 1-D elongation');
  for (const type of ['bonded', 'frictionless']) {
    const B = bars(type), r = NL.solveNonlinear(B.P.model, B.mats, B.t10.elemBody, B.P, { steps: 2, contact: B.plan.bind(B.P.model), prec: 'ic0' });
    const tip = meanU(B.P.model, B.t10, r.u, 0, (p) => Math.abs(p[0] - B.tipX) < 1e-9);
    ok(r.converged && rel(tip, B.ref) < 1.5e-3, `${type}: end displacement ${tip.toFixed(6)} mm vs ±(gap + σL₁/E₁ + σL₂/E₂) = ${B.ref.toFixed(6)} (${((tip / B.ref - 1) * 100).toFixed(3)} %; the penalty's own compliance)`);
  }

  // ------------------------------------------------------------------ CalculiX
  section('calculix.js: the deck written for CalculiX, read back independently; a .frd read back');
  {
    const read = (txt) => {   // a small reader of our own output: nodes, elements by set, keyword lines
      const lines = txt.split('\n'), nodes = new Map(), els = [], kw = [];
      let mode = '', set = '';
      for (const ln of lines) {
        if (ln.startsWith('*')) { kw.push(ln); mode = ln.split(',')[0].toUpperCase(); set = (ln.match(/ELSET=(\w+)/) || [])[1] || ''; continue; }
        const v = ln.split(',').map((x) => x.trim()).filter((x) => x !== '');
        if (mode === '*NODE') nodes.set(+v[0], v.slice(1).map(Number));
        else if (mode === '*ELEMENT') els.push({ id: +v[0], n: v.slice(1).map(Number), set });
      }
      return { nodes, els, kw, lines };
    };
    const vol = (nodes, n) => { const P = (k) => nodes.get(n[k]), a = P(0), b = P(1), c = P(2), d = P(3), u = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], w = [c[0] - a[0], c[1] - a[1], c[2] - a[2]], z = [d[0] - a[0], d[1] - a[1], d[2] - a[2]]; return (u[0] * (w[1] * z[2] - w[2] * z[1]) - u[1] * (w[0] * z[2] - w[2] * z[0]) + u[2] * (w[0] * z[1] - w[1] * z[0])) / 6; };
    // (1) the bilinear bar
    const mat = NL.bilinearMaterial({ E, nu: 0.3, yield: sy, Et });
    const hold = planeHolds(bar, [[0, 0], [1, 0], [2, 0]]);
    const P = prepare(bar, faceTraction(bar, (p) => Math.abs(p[0] - L) < 1e-9, [400, 0, 0]), hold);
    const inp = CX.exportInp({ model: P.model, elemBody: null, materials: [mat], cons: P.cons, f: P.f, steps: 8, title: 'bilinear bar' }), R = read(inp);
    let V = 0, badOrder = 0;
    for (const e of R.els) {
      V += vol(R.nodes, e.n);
      const mid = (i, j) => [0, 1, 2].map((c) => (R.nodes.get(e.n[i - 1])[c] + R.nodes.get(e.n[j - 1])[c]) / 2);
      // CalculiX C3D10: 5 = 1-2, 6 = 2-3, 7 = 3-1, 8 = 1-4, 9 = 2-4, 10 = 3-4
      [[5, 1, 2], [6, 2, 3], [7, 3, 1], [8, 1, 4], [9, 2, 4], [10, 3, 4]].forEach(([k, i, j]) => { const q = R.nodes.get(e.n[k - 1]), m = mid(i, j); if (Math.hypot(q[0] - m[0], q[1] - m[1], q[2] - m[2]) > 1e-9) badOrder++; });
    }
    ok(R.nodes.size === P.model.n && R.els.length === P.model.tets10.length / 10 && R.els.every((e) => e.n.length === 10), `bar deck: ${R.nodes.size} nodes, ${R.els.length} C3D10 elements of 10 nodes`);
    ok(near(V, L * W * W, 1e-9 * L * W * W) && badOrder === 0, `bar deck: element volumes add up to the bar (${V.toFixed(6)} of ${L * W * W}) and every midside node sits where CalculiX expects it (0 out of order)`);
    ok(R.kw.includes('*PLASTIC') && R.lines.some((l) => l.trim() === '2.5000000000e+2, 0.') && R.lines.some((l) => l.trim().startsWith('2.2472222222e+4, 1.')), 'bar deck: *PLASTIC has the yield stress at 0 and σy + H at εp = 1 (H = E·Et/(E − Et) = 22 222 MPa)');
    const bnd = R.lines.slice(R.lines.indexOf('*BOUNDARY') + 1).filter((l) => /^ \d+, \d, \d, 0\.$/.test(l)).length, nDof = P.cons.dirs.reduce((s, d) => s + d.length, 0);
    ok(bnd === nDof, `bar deck: ${bnd} *BOUNDARY lines for ${nDof} held directions`);
    let fx = 0; for (const l of R.lines) { const m = l.match(/^ \d+, 1, (\S+)$/); if (m && R.lines.indexOf(l) > R.lines.indexOf('*CLOAD')) fx += Number(m[1]); }
    ok(near(fx, 400 * W * W, 1e-6), `bar deck: *CLOAD adds up to the load ${fx.toFixed(4)} N (σ·A = ${400 * W * W})`);
    ok(R.kw.some((k) => k.startsWith('*STATIC')) && R.lines.some((l) => l.trim() === 'S, E, PEEQ'), 'bar deck: one *STATIC step; stresses, strains and PEEQ requested');
    // (2) contact decks: the surfaces are the faces of the right elements
    for (const type of ['frictionless', 'bonded']) {
      const B = bars(type), deck = CX.exportInp({ model: B.P.model, elemBody: B.t10.elemBody, materials: B.mats, cons: B.P.cons, f: B.P.f, pairs: B.pairs.map((p) => ({ ...p, slave: p.slave, master: p.master })), steps: 2, names: ['steel', 'alu'], title: type + ' bars' }), D = read(deck);
      const surf = (name) => { const i = D.lines.indexOf(`*SURFACE, NAME=${name}, TYPE=ELEMENT`); const out = []; for (let k = i + 1; k < D.lines.length && !D.lines[k].startsWith('*'); k++) out.push(D.lines[k]); return out; };
      const planeOf = (name, x) => surf(name).every((l) => { const [e, f] = l.split(',').map((s) => s.trim()); const el = D.els.find((q) => q.id === +e), fi = +f.slice(1) - 1, idx = [[0, 1, 2], [0, 3, 1], [1, 3, 2], [2, 3, 0]][fi]; return idx.every((k) => Math.abs(D.nodes.get(el.n[k])[0] - x) < 1e-9); });
      const g = type === 'bonded' ? 0 : 0.01;
      ok(surf('SLAVE1').length === B.pairs[0].slave.length && planeOf('SLAVE1', 10) && planeOf('MASTER1', 10 + g), `${type} deck: ${surf('SLAVE1').length} slave and ${surf('MASTER1').length} master element faces, each on its joint plane`);
      ok(type === 'bonded' ? D.kw.some((k) => k.startsWith('*TIE')) : D.kw.some((k) => k.startsWith('*CONTACT PAIR')) && D.kw.includes('*SURFACE BEHAVIOR, PRESSURE-OVERCLOSURE=LINEAR'), `${type} deck: ${type === 'bonded' ? '*TIE' : '*CONTACT PAIR with a linear pressure-overclosure'}`);
      ok(D.els.filter((e) => e.set === 'STEEL').length + D.els.filter((e) => e.set === 'ALU').length === D.els.length && D.els.filter((e) => e.set === 'ALU').length === B.t10.elemBody.filter((b) => b === 1).length, `${type} deck: one element set per part`);
      if (args.includes('--write-decks')) {
        const dir = args[args.indexOf('--write-decks') + 1]; fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(path.join(dir, `bars-${type}.inp`), deck);
        const r = NL.solveNonlinear(B.P.model, B.mats, B.t10.elemBody, B.P, { steps: 2, contact: B.plan.bind(B.P.model), prec: 'ic0' });
        fs.writeFileSync(path.join(dir, `bars-${type}.expected.json`), JSON.stringify({ deck: `bars-${type}.inp`, endNodes: [...Array(B.P.model.n).keys()].filter((i) => Math.abs(B.P.model.X[3 * i] - B.tipX) < 1e-9).map((i) => i + 1), endDisplacementX: meanU(B.P.model, B.t10, r.u, 0, (p) => Math.abs(p[0] - B.tipX) < 1e-9), analytic: B.ref, tolerance: 0.01 }, null, 1));
      }
    }
    if (args.includes('--write-decks')) {
      const dir = args[args.indexOf('--write-decks') + 1], r = NL.solveNonlinear(P.model, [mat], null, P, { steps: 8 });
      fs.writeFileSync(path.join(dir, 'bar-bilinear.inp'), inp);
      fs.writeFileSync(path.join(dir, 'bar-bilinear.expected.json'), JSON.stringify({ deck: 'bar-bilinear.inp', endNodes: [...Array(P.model.n).keys()].filter((i) => Math.abs(P.model.X[3 * i] - L) < 1e-9).map((i) => i + 1), endDisplacementX: meanU(P.model, bar, r.u, 0, (p) => Math.abs(p[0] - L) < 1e-9), analytic: L * (sy / E + (400 - sy) / Et), tolerance: 0.01 }, null, 1));
    }
    // (3) a .frd, written in CalculiX's layout (I10 node ids, E12.5 fields), read back
    const fmt = (v) => (v < 0 ? '-' : ' ') + Math.abs(v).toExponential(5).replace('e', 'E').replace(/E([+-])(\d)$/, 'E$10$2');
    const rs = NL.solveNonlinear(P.model, [mat], null, P, { steps: 8 });
    const frd = ['    1C                                                                    1', '    2C' + String(P.model.n).padStart(30) + '                          1'];
    for (let i = 0; i < P.model.n; i++) frd.push(' -1' + String(i + 1).padStart(10) + [0, 1, 2].map((a) => fmt(P.model.X[3 * i + a])).join(''));
    frd.push(' -3', '  100CL  101 1.00000E+00' + String(P.model.n).padStart(12) + '                     0    1           1', ' -4  DISP        4    1', ' -5  D1          1    2    1    0', ' -5  D2          1    2    2    0', ' -5  D3          1    2    3    0', ' -5  ALL         1    2    0    0    1ALL');
    for (let i = 0; i < P.model.n; i++) frd.push(' -1' + String(i + 1).padStart(10) + [0, 1, 2].map((a) => fmt(rs.u[3 * i + a])).join(''));
    frd.push(' -3', ' 9999');
    const parsed = CX.parseFrd(frd.join('\n')), back = CX.frdDisplacements(parsed, P.model);
    let worst = 0, scale = Math.max(...rs.u.map(Math.abs));
    for (let i = 0; i < rs.u.length; i++) worst = Math.max(worst, Math.abs(back[i] - rs.u[i]) / scale);
    ok(parsed.nodes.size === P.model.n && parsed.blocks.length === 1 && parsed.blocks[0].name === 'DISP' && parsed.blocks[0].components.join() === 'D1,D2,D3', `.frd: ${parsed.nodes.size} nodes, one DISP block with components ${parsed.blocks[0].components.join(', ')}`);
    ok(worst < 2e-5, `.frd: displacements read back within the file's 6 digits (worst ${worst.toExponential(1)} of the largest)`);
  }

  // ------------------------------------------------------------------ magnetostatics
  section('magnet.js: a line current, saturating steel in a slab solenoid, a round magnet, force and torque between wires');
  {
    const MG = await import(DEV + 'magnet.js');
    const { MU0 } = MG;
    // (1) a wire (0.02 m square, 1000 A) in a 4 m box held at A = 0: B r = μ0 I / 2π at r = 0.1 m
    {
      const I = 1000, ax = MG.gradedZone(-2, 2, -0.03, 0.03, 0.005, 1.15, 0.2), mesh = MG.gridMesh(ax, ax), J = I / 0.02 ** 2;
      const r = MG.solveMagnetostatic(mesh, { region: (x, y) => (Math.abs(x) < 0.01 && Math.abs(y) < 0.01 ? 1 : 0), materials: { 0: MG.linear(1), 1: MG.linear(1) }, current: { 1: J } });
      let s = 0, c = 0; const G = r.geom;
      for (let e = 0; e < r.Bmag.length; e++) { const rr = Math.hypot(G.cx[e], G.cy[e]); if (rr > 0.09 && rr < 0.11) { s += r.Bmag[e] * rr; c++; } }
      const got = s / c, ref = MU0 * I / (2 * Math.PI);
      ok(rel(got, ref) < 0.01, `line current: B·r over the ring 0.09–0.11 m ${got.toExponential(4)} T·m vs μ0 I/2π ${ref.toExponential(4)} (${((got / ref - 1) * 100).toFixed(2)} %; ${mesh.nodes.length / 2} nodes)`);
    }
    // (2) a slab solenoid: iron 0 < x < 0.1, a current sheet of K A/m (0.01 thick) at 0.1 < x < 0.11, A = 0 on x = 0, nothing else held.
    //     Between the sheets H = K exactly, so B in the iron is the curve at H = K.
    {
      const steel = MG.table([[0.2, 30], [0.6, 60], [1.0, 110], [1.4, 300], [1.6, 800], [1.8, 3000], [2.0, 10000], [2.2, 50000]]);
      const brauerM = MG.brauer({ k1: 0.3, k2: 2.9, k3: 400 }), xs = Array.from({ length: 41 }, (_, i) => i * 0.005), ys = Array.from({ length: 6 }, (_, i) => i * 0.04 / 5);
      const mesh = MG.gridMesh(xs, ys), fixed = new Map(); for (let j = 0; j < ys.length; j++) fixed.set(mesh.nx * j, 0);
      const inv = (f, K, lo, hi) => { for (let i = 0; i < 200; i++) { const mid = (lo + hi) / 2; if (f(mid) < K) lo = mid; else hi = mid; } return (lo + hi) / 2; };
      for (const [name, mat, Hof] of [['measured table', steel, (B) => steel.H(B)], ['Brauer fit', brauerM, (B) => brauerM.nu(B * B) * B], ['linear μr 1000', MG.linear(1000), (B) => B / (MU0 * 1000)]]) {
        const hiB = 100;
        let worst = 0, itMax = 0; const lines = [];
        for (const K of [300, 3000, 30000]) {
          const r = MG.solveMagnetostatic(mesh, { region: (x) => (x < 0.1 - 1e-9 ? 1 : x < 0.11 - 1e-9 ? 2 : 0), materials: { 0: MG.linear(1), 1: mat, 2: MG.linear(1) }, current: { 2: K / 0.01 }, fixed, tol: 1e-11, maxIter: 60 });
          const iron = []; for (let e = 0; e < r.Bmag.length; e++) if (r.geom.cx[e] < 0.095) iron.push(r.Bmag[e]);
          const Bref = inv(Hof, K, 0, hiB), Bmean = iron.reduce((a, b) => a + b, 0) / iron.length;
          worst = Math.max(worst, Math.abs(Bmean / Bref - 1), (Math.max(...iron) - Math.min(...iron)) / Bref); itMax = Math.max(itMax, r.iterations);
          lines.push(`K ${K}: B ${Bmean.toFixed(4)} T (curve ${Bref.toFixed(4)})`);
          if (!r.converged) worst = 1;
        }
        ok(worst < 5e-4, `slab solenoid, ${name}: B in the iron is the curve at H = K, uniform, ${lines.join('; ')}; worst ${worst.toExponential(1)}, ≤ ${itMax} Newton steps`);
      }
    }
    // (3) a long round magnet magnetised across its axis, in air: B inside = Br / (1 + μr)  (Osborn 1945, demagnetising factor ½)
    {
      const R = 0.01, Br = 1.2, mur = 1.05, ax = MG.gradedZone(-0.2, 0.2, -0.015, 0.015, 0.0005, 1.12, 0.03), mesh = MG.gridMesh(ax, ax);
      const r = MG.solveMagnetostatic(mesh, { region: (x, y) => (Math.hypot(x, y) < R ? 1 : 0), materials: { 0: MG.linear(1), 1: MG.linear(mur) }, br: { 1: [Br, 0] } });
      let s = 0, c = 0; for (let e = 0; e < r.Bx.length; e++) if (Math.hypot(r.geom.cx[e], r.geom.cy[e]) < 0.7 * R) { s += r.Bx[e]; c++; }
      const got = s / c, ref = Br / (1 + mur);
      ok(rel(got, ref) < 0.02, `round magnet: B inside ${got.toFixed(4)} T vs Br/(1+μr) = ${ref.toFixed(4)} T (${((got / ref - 1) * 100).toFixed(2)} %; ${mesh.nodes.length / 2} nodes, a staircase edge)`);
    }
    // (4) two parallel wires, 1000 A each, 0.2 m apart: F/L = μ0 I²/2πd on the upper one, by the Maxwell stress round it; and its torque about the origin
    {
      const I = 1000, d = 0.2, X0 = 0.5, xs = MG.gradedZone(-3.5, 4.5, X0 - 0.1, X0 + 0.1, 0.005, 1.15, 0.4), ys = MG.gradedZone(-3.9, 4.1, -0.1, d + 0.1, 0.005, 1.15, 0.4), mesh = MG.gridMesh(xs, ys);
      const wire = (x, y) => (Math.abs(x - X0) < 0.01 && (Math.abs(y) < 0.01 || Math.abs(y - d) < 0.01));
      const r = MG.solveMagnetostatic(mesh, { region: (x, y) => (wire(x, y) ? 1 : 0), materials: { 0: MG.linear(1), 1: MG.linear(1) }, current: { 1: I / 0.02 ** 2 } });
      for (const rad of [0.04, 0.07]) {
        const F = MG.maxwell(mesh, r, (x, y) => Math.hypot(x - X0, y - d) < rad), ref = MU0 * I * I / (2 * Math.PI * d);
        ok(rel(Math.abs(F.fy), ref) < 0.03 && Math.abs(F.fx) < 0.02 * ref && F.fy < 0, `wires: force on the upper wire (contour radius ${rad} m) ${F.fy.toFixed(4)} N/m along y vs ∓μ0 I²/2πd = ${ref.toFixed(4)} (${((Math.abs(F.fy) / ref - 1) * 100).toFixed(2)} %), across ${F.fx.toExponential(1)}`);
        ok(rel(Math.abs(F.torque), X0 * ref) < 0.03, `wires: torque about the origin (contour ${rad} m) ${F.torque.toFixed(4)} N vs x·F = ${(X0 * -ref).toFixed(4)} (${((Math.abs(F.torque) / (X0 * ref) - 1) * 100).toFixed(2)} %)`);
      }
    }
  }

  // ------------------------------------------------------------------ Hertz
  if (!args.includes('--skip-hertz')) {
    section('contact.js: Hertz contact, a steel sphere on an aluminium sphere');
    const TM = await import(DEV + 'tetmesh.js');
    const R1 = 10, R2 = 15, E1 = 200000, n1 = 0.3, E2 = 70000, n2 = 0.33, Ft = 12860, fine = !!process.env.HERTZ_FINE, h = fine ? 1.8 : 2.5, hc = fine ? 0.45 : 0.8, gr = fine ? 0.2 : 0.3;
    const body = (R, dir) => {
      const { mesh, faces } = revolveQuarter(spherePole(R, 55 * Math.PI / 180, hc * 0.9, 1.2, dir), 28, 4), bvh = TM.buildBVH(mesh);
      const field = { floor: hc, at: (p) => Math.min(h, hc + gr * Math.hypot(p[0], p[1], p[2])), add() {}, samples: 1 };
      const tm = TM.tetMesh(mesh, faces, { h, bvh, field, curv: 0, thick: 0, levels: 5, maxTets: 100000 });
      return { t10: TM.toT10(tm, mesh, faces, bvh), faces };
    };
    const b1 = body(R1, 1), b2 = body(R2, -1), M = CT.mergeBodies([b1.t10, b2.t10]);
    const tris = (b) => { const o = []; for (let t = 0; t < M.bface.length; t++) if (M.bface[t] === M.faceStart[b]) o.push(t); return o; };
    const plan = CT.planContact(M, [{ type: 'frictionless', slave: tris(0), master: tris(1), kn: CT.autoPenalty(E2, hc, 20) }], { cutoff: 2 });
    const model = TF.makeTetModel(M, { extraPairs: plan.extraPairs });
    const bc = TF.tetBoundaryConditions(model, { constraints: [{ type: 'frictionless', faces: [1, 2, 5, 6, 7] }], loads: [{ type: 'force', faces: [3], total: Ft / 4, dir: [0, -1, 0] }] }, { faces: [...b1.faces, ...b2.faces] });
    const contact = plan.bind(model), t0 = Date.now();
    const r = NL.solveNonlinear(model, [NL.bilinearMaterial({ E: E1, nu: n1 }), NL.bilinearMaterial({ E: E2, nu: n2 })], M.elemBody, bc, { steps: 4, contact, maxIter: 25, prec: 'ic0' });
    const rep = contact.report(); let F = 0, m2 = 0, pm = 0;
    for (const q of rep) { const rr = Math.hypot(q.at[0], q.at[2]); F += q.force; m2 += q.force * rr * rr; pm = Math.max(pm, q.pressure); }
    const Rs = 1 / (1 / R1 + 1 / R2), Es = 1 / ((1 - n1 * n1) / E1 + (1 - n2 * n2) / E2), a = Math.cbrt(3 * Ft * Rs / (4 * Es)), p0 = 3 * Ft / (2 * Math.PI * a * a);
    const aFE = Math.sqrt(m2 / F / 0.4);
    // mean pressure over the disc r < 0.6 a (the peak at one point is noisy): Hertz gives F(1 − (1 − ρ²/a²)^1.5) over πρ²
    const rho = 0.6 * a; let fc = 0, ac = 0;
    for (const q of rep) if (Math.hypot(q.at[0], q.at[2]) < rho) { fc += q.force; ac += q.w; }
    const pcRef = Ft * (1 - (1 - (rho / a) ** 2) ** 1.5) / (Math.PI * rho * rho), pcFE = fc / ac;
    log(`Hertz: ${M.elemBody.length} tets (${b1.t10.tets10.length / 10} + ${b2.t10.tets10.length / 10}), ${rep.length} nodes in contact, ${Date.now() - t0} ms; a ${aFE.toFixed(4)} vs ${a.toFixed(4)} (${((aFE / a - 1) * 100).toFixed(2)} %), central pressure ${pcFE.toFixed(0)} vs ${pcRef.toFixed(0)} (${((pcFE / pcRef - 1) * 100).toFixed(2)} %), penetration ${contact.info.maxPenetration.toExponential(2)} mm`);
    ok(r.converged, 'Hertz: the load steps converged');
    ok(rel(F, Ft / 4) < 0.01, `Hertz: the contact force ${F.toFixed(1)} N is the applied quarter load ${(Ft / 4).toFixed(1)} N (within 1 %)`);
    const tolA = fine ? 0.01 : 0.04, tolP = fine ? 0.06 : 0.15;
    ok(rel(aFE, a) < tolA, `Hertz: contact radius from the force distribution (⟨r²⟩ = 0.4 a²) ${aFE.toFixed(4)} mm vs ${a.toFixed(4)} mm (within ${tolA * 100} %)`);
    ok(rel(pcFE, pcRef) < tolP, `Hertz: mean pressure over r < 0.6a ${pcFE.toFixed(0)} MPa vs ${pcRef.toFixed(0)} MPa from the Hertz profile (within ${tolP * 100} %; the fine mesh HERTZ_FINE=1 is 3 %); the largest pressure at one point ${pm.toFixed(0)} MPa is ${((pm / p0 - 1) * 100).toFixed(0)} % above p0 ${p0.toFixed(0)}`);
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  let passed = 0, failed = 0;
  const ok = (c, msg) => { if (c) { passed++; if (verbose) console.log('  ok   ' + msg); } else { failed++; console.log('  FAIL ' + msg); } };
  const section = (s) => console.log('\n' + s);
  const near = (a, b, t) => Math.abs(a - b) <= t;
  await runSim08Tests({ ok, section, near });
  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
}
