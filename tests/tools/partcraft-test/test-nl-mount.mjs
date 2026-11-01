#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-nl-mount.mjs — 0.8 SU.891 mounted in PartCraft (part_PART_3): the study kinds 'nonlinear' and 'contact' from a part built on
 * the mesh kernel, through sim.js (read, simJob) and the worker ops in nl-worker.js (nlSolve, ccxDeck, ccxRead), and the Problems
 * they raise (nlstudy.js nlProblems). The solvers themselves are part-sim-08's / physics_PART_3's (test-sim08.mjs checks them).
 * Hand cases:
 *   - a bar held on three symmetry faces and pulled: below yield the nonlinear op equals the linear tet solve on the same mesh;
 *     past yield the end moves L(σy/E + (σ − σy)/Et) (bilinear, uniaxial: exact for linear tets in a uniform field);
 *   - perfectly plastic (Et 0) at 1.2 × the limit load: the steps do not converge → a Problem 'sim.nl.newton';
 *   - two bars end to end across a 0.01 mm gap, pushed: the contact carries the load (≈ the applied force), the far end moves
 *     the gap + FL/EA for both bars (+ the penalty's own compliance);
 *   - the CalculiX deck of that model (nodes, C3D10, *CONTACT PAIR, *PLASTIC) and a .frd written from our own answer read back.
 *   node tools/partcraft-test/test-nl-mount.mjs   (or runNlMountTests() from bin/test-partcraft.mjs)
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '../..');
const DEV = path.join(REPO, 'public_html/assets/apps/partcraft/dev/');

export async function runNlMountTests({ ok, section, M = null }) {
  const K = await import(DEV + 'kernel.js'), P = await import(DEV + 'part.js'), S = await import(DEV + 'sketch.js'), B = await import(DEV + 'brep.js');
  const SIM = await import(DEV + 'sim.js'), NS = await import(DEV + 'nlstudy.js'), NW = await import(DEV + 'nl-worker.js'), TW = await import(DEV + 'tet-worker.js');
  const I18N = await import(DEV + 'i18n.js');
  try { const fs = await import('node:fs'); I18N.init({ strings: JSON.parse(fs.readFileSync(DEV + 'lang/en.json', 'utf8')) }); } catch { /* strings are optional here */ }
  if (!M) { const { default: Module } = await import(path.join(REPO, 'public_html/assets/vendor/manifold-3d/current/manifold.js')); M = await Module(); M.setup(); }
  const rel = (a, b) => Math.abs(a - b) / Math.max(Math.abs(b), 1e-300);

  /** A part of bars along X (w × w section), each [x0, x1]: rectangles of one sketch, one extrude — separate pieces of one body
   *  (the mesh kernel holds one body; pieces that do not touch are fine). */
  const bars = (spans, w = 10) => {
    const part = P.newPart('Bars'), sk = S.newSketch();
    for (const [x0, x1] of spans) S.addRect(sk, [x0, 0], [x1, w]);
    const f = P.addFeature(part, 'sketch', { plane: { kind: 'base', name: 'top' }, sketch: sk });
    P.addFeature(part, 'extrude', { sketch: f.id, op: 'add', end: 'blind', depth: w });
    return { part, regen: K.regenerate(part, M) };
  };
  /** The plane face whose outward normal is n and whose point lies at coordinate `c` along that axis (and between x0, x1 when given). */
  const face = (regen, n, c, xr = null) => {
    const ax = n.findIndex((v) => v !== 0);
    const i = regen.faces.findIndex((f) => f.type === 'plane' && f.n && f.n.every((v, k) => Math.abs(v - n[k]) < 1e-9) && Math.abs(f.o[ax] - c) < 1e-6 && (!xr || (f.at[0] > xr[0] && f.at[0] < xr[1])));
    return i;
  };
  const ref = (regen, i) => B.faceRef(regen.faces[i]);
  const steel = { name: 'Test steel', E: 200000, nu: 0.3, density: 7850, yield: 250 };

  section('SU.891 mounted: a nonlinear study on a PartCraft part (nlstudy.js + nl-worker.js)');
  const one = bars([[0, 100]]);
  ok(one.regen.named && one.regen.faces.length === 6, `the bar builds on the mesh kernel with named faces (${one.regen.faces.length})`);
  // the axis of the extrude: find which of y / z the depth went along from the bbox
  const bb = one.regen.stats.bbox;
  const sym = [[[-1, 0, 0], 0]], ends = [[1, 0, 0], 100];
  for (const a of [1, 2]) sym.push([[0, a === 1 ? -1 : 0, a === 2 ? -1 : 0], bb.min[a]]);
  const symFaces = sym.map(([n, c]) => face(one.regen, n, c));
  const endFace = face(one.regen, ...ends);
  ok(symFaces.every((i) => i >= 0) && endFace >= 0, 'the three symmetry faces and the pulled end are found by normal and place');
  const study = (kind, total, extra = {}) => {
    const st = { ...SIM.newSimStudy(), kind, material: { ...steel }, h: 5, ...extra };
    st.constraints = symFaces.map((i, k) => ({ id: 'c' + (k + 1), type: 'frictionless', faces: [ref(one.regen, i)] }));
    st.loads = [{ id: 'l1', type: 'force', faces: [ref(one.regen, endFace)], total, dir: [1, 0, 0] }];
    return NS.ensureNl(st);
  };
  // reading: unknown kind refused before; now read back as written
  const st0 = SIM.readSimStudy(study('nonlinear', 20000));
  ok(st0.kind === 'nonlinear' && st0.nonlinear.steps === 10 && st0.nonlinear.Et === null && st0.mesher === 'tet', 'readSimStudy keeps kind nonlinear and its block { steps 10, Et null (1 % of E) }');
  let refused = false; try { SIM.readSimStudy({ ...st0, nonlinear: { steps: 1e6 } }); } catch { refused = true; }
  ok(refused, 'a hostile step count is refused by the reader (untrusted file)');
  const plain = SIM.readSimStudy({ ...SIM.newSimStudy() });
  ok(!('nonlinear' in plain) && !('contacts' in plain), 'a static study gains no new keys (older files read back unchanged)');

  // 1. elastic: same as the linear tet solve on the same mesh
  const sigE = 200, F = sigE * 100;
  const { job: jl } = SIM.simJob(SIM.readSimStudy({ ...study('static', F), kind: 'static' }), one.regen);
  const lin = TW.tetSolve(jl);
  const { job: jn, problems: pn } = SIM.simJob(SIM.readSimStudy(study('nonlinear', F)), one.regen);
  ok(!pn.length && jn.nonlinear && jn.nonlinear.Et === 2000, `simJob: no problems, the job carries nonlinear { Et ${jn?.nonlinear?.Et} = 1 % of E }`);
  const nr = NW.nlSolve(jn);
  ok(nr.nonlinear.converged && nr.nonlinear.maxPlastic === 0 && rel(nr.maxDisp.value, lin.maxDisp.value) < 1e-5,
    `below yield (σ ${sigE} MPa): converged, no plastic strain, end ${nr.maxDisp.value.toFixed(6)} mm = the linear solve ${lin.maxDisp.value.toFixed(6)} (FL/EA ${(F * 100 / (200000 * 100)).toFixed(6)})`);
  ok(rel(nr.reaction[0], -F) < 1e-6 && Math.abs(nr.reaction[1]) < 1e-6 * F, `the reactions balance the load: ${nr.reaction.map((v) => v.toFixed(3)).join(', ')} N`);
  ok(Math.abs(nr.maxVm.value - sigE) < 1e-3 * sigE, `von Mises ${nr.maxVm.value.toFixed(4)} MPa = F/A`);
  ok(nr.vertex.plastic.length === nr.plotMesh.positions.length / 3 && nr.vertex.vm.length === nr.vertex.plastic.length, 'the plot mesh carries vm, displacement and plastic strain per vertex');

  // 2. past yield, bilinear: L(σy/E + (σ − σy)/Et)
  const sigP = 300, Et = 20000, Fp = sigP * 100;
  const { job: jp } = SIM.simJob(SIM.readSimStudy(study('nonlinear', Fp, { nonlinear: { steps: 10, Et, tol: 1e-8 } })), one.regen);
  const rp = NW.nlSolve(jp), want = 100 * (250 / 200000 + (sigP - 250) / Et);
  const ux = (r) => { let m = 0; for (let v = 0; v < r.vertex.u.length; v += 3) m = Math.max(m, Math.abs(r.vertex.u[v])); return m; };
  ok(rp.nonlinear.converged && rel(ux(rp), want) < 1e-4,
    `past yield (σ ${sigP}, Et ${Et}): end moves ${ux(rp).toFixed(6)} mm along the bar vs L(σy/E + (σ−σy)/Et) ${want.toFixed(6)} (${(100 * (ux(rp) / want - 1)).toFixed(4)} %)`);
  const epWant = (sigP - 250) * (1 / Et - 1 / 200000);
  ok(rel(rp.nonlinear.maxPlastic, epWant) < 1e-3, `plastic strain ${rp.nonlinear.maxPlastic.toExponential(5)} vs (σ−σy)(1/Et − 1/E) ${epWant.toExponential(5)}`);
  ok(NS.nlProblems(rp).length === 0, 'a converged study without contact raises no Problem');

  // 3. perfectly plastic above the limit load: the steps fail
  const { job: jf } = SIM.simJob(SIM.readSimStudy(study('nonlinear', 1.2 * 250 * 100, { nonlinear: { steps: 4, Et: 0, tol: 1e-6 } })), one.regen);
  const rf = NW.nlSolve(jf), pf = NS.nlProblems(rf);
  ok(!rf.nonlinear.converged && rf.nonlinear.failedAt > rf.nonlinear.lambda && rf.nonlinear.lambda > 0.7 && rf.nonlinear.lambda <= 1 / 1.2 + 1e-9,
    `perfectly plastic at 1.2 × the limit: stops at ${(100 * rf.nonlinear.lambda).toFixed(1)} % of the load (limit ${(100 / 1.2).toFixed(1)} %), failed at ${(100 * rf.nonlinear.failedAt).toFixed(1)} %`);
  ok(pf.length === 1 && pf[0].code === 'sim.nl.newton' && pf[0].severity === 'error' && pf[0].msg.key === 'study.nl.p.newton' && pf[0].req.op === '>=',
    'Problems: one error "sim.nl.newton" with what was reached and what was asked');

  section('SU.891 mounted: contact between two bodies of a part');
  const gap = 0.01, two = bars([[0, 50], [50 + gap, 100 + gap]]);
  const g2 = two.regen, b2 = g2.stats.bbox;
  const fA = face(g2, [1, 0, 0], 50), fB = face(g2, [-1, 0, 0], 50 + gap), fEnd = face(g2, [1, 0, 0], 100 + gap), fStart = face(g2, [-1, 0, 0], 0);
  const lows = [1, 2].flatMap((a) => [[0, 50], [50 + gap, 100 + gap]].map((xr) => face(g2, [0, a === 1 ? -1 : 0, a === 2 ? -1 : 0], b2.min[a], xr)));
  ok(g2.stats.bodies === 2 && [fA, fB, fEnd, fStart, ...lows].every((i) => i >= 0), `two pieces (${g2.stats.bodies}), the facing ends and the four symmetry faces found`);
  const cst = NS.ensureNl({ ...SIM.newSimStudy(), kind: 'contact', material: { ...steel, yield: 1e5 }, h: 5 });
  cst.constraints = [{ id: 'c1', type: 'frictionless', faces: [ref(g2, fStart)] }, ...lows.map((i, k) => ({ id: 'c' + (k + 2), type: 'frictionless', faces: [ref(g2, i)] }))];
  const Fc = 10000;
  cst.loads = [{ id: 'l1', type: 'force', faces: [ref(g2, fEnd)], total: Fc, dir: [-1, 0, 0] }];
  cst.contacts = [{ id: 'p1', type: 'frictionless', faces: [ref(g2, fB)], master: [ref(g2, fA)], factor: 1000 }];
  const cread = SIM.readSimStudy(cst);
  ok(cread.contacts.length === 1 && cread.contacts[0].master.length === 1 && cread.contacts[0].factor === 1000, 'readSimStudy keeps the contact pair (side A, side B, penalty factor)');
  const { job: jc, problems: pc } = SIM.simJob(cread, g2);
  ok(!pc.length && jc.contacts.length === 1 && jc.contacts[0].slave[0] === fB && jc.contacts[0].master[0] === fA, `simJob resolves the pair to faces ${jc?.contacts?.[0]?.slave} → ${jc?.contacts?.[0]?.master} ${pc.join(' ')}`);
  const rc = NW.nlSolve(jc), c = rc.nonlinear.contact, endWant = gap + 2 * Fc * 50 / (200000 * 100);
  const uxc = (() => { let m = 0; for (let v = 0; v < rc.vertex.u.length; v += 3) m = Math.max(m, Math.abs(rc.vertex.u[v])); return m; })();
  ok(rc.nonlinear.converged && c && c.active > 0, `converged, ${c?.active} contact points active`);
  ok(c && rel(c.normalForce, Fc) < 0.01, `the contact carries the load: ${c?.normalForce.toFixed(1)} N vs ${Fc} N`);
  ok(rel(uxc, endWant) < 0.01, `the pushed end moves ${uxc.toFixed(6)} mm along the bars vs gap + 2FL/EA ${endWant.toFixed(6)} (${(100 * (uxc / endWant - 1)).toFixed(3)} %, the penalty's compliance)`);
  ok(c && c.maxPenetration < 0.01 * 5 && NS.nlProblems(rc).length === 0, `penetration ${c?.maxPenetration.toExponential(2)} mm < 1 % of the 5 mm element: no Problem`);
  // a soft penalty: penetration over 1 % of the element size → a warning
  // penetration ≈ p·h / (factor·E): over 1 % of h needs p > 0.01·factor·E (2000 MPa for steel at factor 1) — 3000 MPa here, elastic
  const soft = SIM.simJob(SIM.readSimStudy({ ...cst, loads: [{ ...cst.loads[0], total: 300000 }], contacts: [{ ...cst.contacts[0], factor: 1 }] }), g2).job;
  const rs = NW.nlSolve(soft), ps = NS.nlProblems(rs);
  ok(ps.some((p) => p.code === 'sim.nl.penetration' && p.severity === 'warning' && p.found.value > p.req.value), `a soft penalty (factor 1) at 3000 MPa: penetration ${rs.nonlinear.contact.maxPenetration.toFixed(4)} mm > 1 % of 5 mm → Problem "sim.nl.penetration"`);
  const same = SIM.simJob(SIM.readSimStudy({ ...cst, contacts: [{ ...cst.contacts[0], master: [ref(g2, fB)] }] }), g2);
  ok(same.problems.length > 0, `a pair whose two sides share a face is a problem before solving: "${same.problems[0]}"`);

  section('SU.891 mounted: File › Export CalculiX (.inp) and Import results (.frd)');
  const deck = NW.ccxDeck(jc);
  const lines = deck.text.split('\n');
  const nodeLines = lines.slice(lines.indexOf('*NODE, NSET=NALL') + 1).findIndex((l) => l.startsWith('*'));
  ok(nodeLines === deck.nodes && /\*ELEMENT, TYPE=C3D10/.test(deck.text) && /\*CONTACT PAIR/.test(deck.text) && /\*SURFACE BEHAVIOR, PRESSURE-OVERCLOSURE=LINEAR/.test(deck.text) && /\*PLASTIC/.test(deck.text),
    `the deck: ${deck.nodes} nodes, ${deck.elements} C3D10 elements, the contact pair with a linear penalty, *PLASTIC`);
  // a .frd as CalculiX writes it, from our own contact answer, read back on the rebuilt mesh
  const P2 = NW.prepare(jc), n = P2.model.n, u = new Float64Array(3 * n);
  for (let k = 0; k < n; k++) { u[3 * k] = -1e-3 * P2.model.X[3 * k]; u[3 * k + 1] = 0; u[3 * k + 2] = 0; }
  const E12 = (v) => { const s = v.toExponential(5).replace(/e([+-])(\d)$/, 'e$10$2').toUpperCase(); return s.padStart(12); };
  const I10 = (v) => String(v).padStart(10);
  const frd = ['    1C', '    2C' + ' '.repeat(18) + n];
  for (let k = 0; k < n; k++) frd.push(' -1' + I10(k + 1) + E12(P2.model.X[3 * k]) + E12(P2.model.X[3 * k + 1]) + E12(P2.model.X[3 * k + 2]));
  frd.push(' -3', '  100CL  101 1.000000000       ' + n + '                     0    1', ' -4  DISP        4    1', ' -5  D1          1    2    1    0', ' -5  D2          1    2    2    0', ' -5  D3          1    2    3    0', ' -5  ALL         1    2    0    0    1ALL');
  for (let k = 0; k < n; k++) frd.push(' -1' + I10(k + 1) + E12(u[3 * k]) + E12(u[3 * k + 1]) + E12(u[3 * k + 2]));
  frd.push(' -3', '9999');
  const back = NW.ccxRead({ ...jc, frd: frd.join('\n') });
  const xmax = Math.max(...Array.from({ length: n }, (_, k) => P2.model.X[3 * k]));
  ok(back.calculix.nodes === n && rel(back.maxDisp.value, 1e-3 * xmax) < 1e-5 && !back.calculix.stress, `a .frd read back on the rebuilt mesh: ${back.calculix.nodes} nodes matched, largest displacement ${back.maxDisp.value.toExponential(5)} mm (written ${(1e-3 * xmax).toExponential(5)})`);
  let mesh = false; try { NW.ccxRead({ ...jc, frd: frd.join('\n').replace(/^    2C.*$/m, '    2C').split('\n').filter((l, i) => !(l.startsWith(' -1') && i === 3)).join('\n') }); } catch (e) { mesh = /mesh|node/i.test(e.message); }
  ok(mesh, 'a .frd for another mesh (one node fewer) is refused in words');
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  let pass = 0, fail = 0;
  const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL', m); } if (process.argv.includes('--verbose') && c) console.log('  ok  ', m); };
  await runNlMountTests({ ok, section: (s) => console.log('\n== ' + s) });
  console.log(`\nnl-mount: ${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}
