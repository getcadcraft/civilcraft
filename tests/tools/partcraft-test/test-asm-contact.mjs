#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-asm-contact.mjs — 0.8 SU.891, the assembly contact study (asm-contact.js + phys-worker.js contactSolve / contactDeck), session dec-su_PART_3.
 * Two bars (100 mm long, 10 × 10) end to end across a 0.01 mm gap in an ASSEMBLY, the second one turned half a turn about Z (so its frame is not the
 * assembly's: placement of nodes, exact faces and force direction are checked by the answer). Part A is fixed at its far end (its own Simulation study),
 * part B carries a 10 kN push toward A (its own study). Contact between the two end faces (a pair in the assembly file).
 *   closed form: contact force = 10 000 N; B's far end moves gap + F·(L_A + L_B)/(E·A) = 0.01 + 0.1 = 0.11 mm.
 *   node tools/partcraft-test/test-asm-contact.mjs   (or runAsmContactTests() from bin/test-partcraft.mjs)
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '../..');
const DEV = path.join(REPO, 'public_html/assets/apps/partcraft/dev/');

export async function runAsmContactTests({ ok, section, M = null }) {
  const K = await import(DEV + 'kernel.js'), P = await import(DEV + 'part.js'), S = await import(DEV + 'sketch.js'), B = await import(DEV + 'brep.js');
  const SIM = await import(DEV + 'sim.js'), A = await import(DEV + 'assembly.js'), AC = await import(DEV + 'asm-contact.js'), PW = await import(DEV + 'phys-worker.js');
  const V = await import(DEV + 'vec.js'), I18N = await import(DEV + 'i18n.js');
  try { const fs = await import('node:fs'); I18N.init({ strings: JSON.parse(fs.readFileSync(DEV + 'lang/en.json', 'utf8')) }); } catch { /* strings are optional here */ }
  if (!M) { const { default: Module } = await import(path.join(REPO, 'public_html/assets/vendor/manifold-3d/current/manifold.js')); M = await Module(); M.setup(); }
  try { P.registerStudyReader('simulation', (raw) => SIM.readSimStudy(raw)); } catch { /* already registered by ws-simulation.js */ }
  const steel = { name: 'Test steel', E: 200000, nu: 0.3, density: 7850, yield: 1e5 };
  const w = 10, L = 100, gap = 0.01, F = 10000;

  const bar = (name) => { const part = P.newPart(name), sk = S.newSketch(); S.addRect(sk, [0, 0], [L, w]); const f = P.addFeature(part, 'sketch', { plane: { kind: 'base', name: 'top' }, sketch: sk }); P.addFeature(part, 'extrude', { sketch: f.id, op: 'add', end: 'blind', depth: w }); return { part, regen: K.regenerate(part, M) }; };
  const face = (regen, n, c) => regen.faces.findIndex((f) => f.type === 'plane' && f.n && f.n.every((v, k) => Math.abs(v - n[k]) < 1e-9) && Math.abs(f.o[n.findIndex((v) => v !== 0)] - c) < 1e-6);
  const ref = (regen, i) => B.faceRef(regen.faces[i]);

  section('SU.891 assembly: a contact study between two placed parts');
  const a = bar('A'), b = bar('B');
  ok(a.regen.named && a.regen.faces.length === 6, 'the bars build on the mesh kernel with named faces');
  const study = (extra) => ({ ...SIM.newSimStudy(), kind: 'static', material: { ...steel }, h: Number(process.env.PC_H || 10), mesher: 'tet', ...extra });
  const aFixed = face(a.regen, [-1, 0, 0], 0), aEnd = face(a.regen, [1, 0, 0], L), bFar = face(b.regen, [-1, 0, 0], 0), bNear = face(b.regen, [1, 0, 0], L);
  ok([aFixed, aEnd, bFar, bNear].every((i) => i >= 0), 'the end faces are found by normal and place');
  P.setStudy(a.part, 'simulation', study({ constraints: [{ id: 'c1', type: 'fixed', faces: [ref(a.regen, aFixed)] }] }));
  // B is held sideways by two symmetry faces (its own study); along x only the contact holds it. A frictionless pair alone never holds a part sideways.
  const bLow = (ax) => b.regen.faces.findIndex((f) => f.type === 'plane' && f.n && Math.abs(f.n[ax] + 1) < 1e-9);
  P.setStudy(b.part, 'simulation', study({ constraints: [1, 2].map((ax, k) => ({ id: 'c' + (k + 1), type: 'frictionless', faces: [ref(b.regen, bLow(ax))] })), loads: [{ id: 'l1', type: 'force', faces: [ref(b.regen, bFar)], total: F, dir: [1, 0, 0] }] }));

  const asm = A.newAssembly('Two bars');
  const ia = A.insertPart(asm, a.part), ib = A.insertPart(asm, b.part, { place: [-1, 0, 0, 0, 0, -1, 0, 0, 0, 0, 1, 0, 2 * L + gap, w, 0, 1] });
  const builds = new Map([[asm.instances.find((i) => i.id === ia.id).part, a.regen], [asm.instances.find((i) => i.id === ib.id).part, b.regen]]);
  const placed = A.placeAll(asm, builds);
  ok(placed.world.size === 2, 'the assembly places both bars');

  // the study: read, refuse hostile input
  const c = AC.newContact();
  const pr = AC.addPair(c, 'frictionless'); pr.a = { inst: ia.id, faces: [ref(a.regen, aEnd)] }; pr.b = { inst: ib.id, faces: [ref(b.regen, bNear)] }; pr.factor = 1000;
  const ids = asm.instances.map((i) => i.id);
  const back = AC.readContact(JSON.parse(JSON.stringify(c)), ids);
  ok(back && back.pairs.length === 1 && back.pairs[0].factor === 1000 && back.pairs[0].a.faces[0].name === pr.a.faces[0].name, 'readContact keeps the pair, its faces and the penalty factor');
  ok(AC.readContact({ pairs: [{ a: { inst: 'zz', faces: [] }, b: { inst: ia.id, faces: [] } }] }, ids) === null, 'a pair naming an instance that is not in the assembly is dropped (and a study without pairs is null)');
  const hostile = AC.readContact({ steps: 1e9, tol: -5, Et: 'x', pairs: [{ type: 'weld', factor: 1e12, a: { inst: ia.id, faces: [{ name: '<script>', at: [0, 0, 0] }, { name: 'ok', at: [1e99, 0, 0] }] }, b: { inst: ib.id, faces: 'no' } }] }, ids);
  ok(hostile && hostile.steps === 10 && hostile.tol === 1e-6 && hostile.Et === null && hostile.pairs[0].type === 'frictionless' && hostile.pairs[0].factor === 20 && hostile.pairs[0].a.faces.length === 0 && hostile.pairs[0].b.faces.length === 0,
    'hostile numbers, a bad face name, a far point and a wrong type are replaced by defaults or dropped');
  ok(JSON.stringify(A.readAssembly(JSON.parse(A.toJSON(asm))).contactStudy ?? null) === 'null', 'an assembly without a study reads back without the key');

  // problems in words, nothing solved
  const empty = AC.contactJob(asm, builds, placed.world, AC.newContact());
  ok(!empty.job && empty.problems.length === 1, 'no pair: a problem in words, no job');
  const noSup = AC.contactJob(asm, builds, placed.world, { ...c, pairs: [{ ...pr }] });
  ok(noSup.job && !noSup.warnings.length, 'the job is made from the parts\' own studies: ' + noSup.problems.join(' '));

  const jc = noSup.job;
  ok(jc.parts.length === 2 && jc.parts[1].place[0] === -1 && jc.pairs[0].slave.part === 0 && jc.pairs[0].master.part === 1 && jc.pairs[0].factor === 1000, 'two part jobs (B carries its placement) and one pair of part indices');
  const t0 = Date.now();
  const r = PW.contactSolve(jc);
  const cf = r.contact;
  ok(r.converged, `converged in ${r.steps.length} steps (${Date.now() - t0} ms)`);
  ok(cf.points > 20 && Math.abs(cf.normalForce - F) / F < 0.01, `contact force ${cf.normalForce.toFixed(1)} N = the push ${F} N (${cf.points} points)`);
  const want = gap + F * 2 * L / (steel.E * w * w);
  // far end of B = the node farthest along world +x in the merged plot mesh: the displacement there along -x
  const maxU = r.maxDisp.value;
  ok(Math.abs(maxU - want) / want < 0.03, `B's far end moves ${maxU.toFixed(5)} mm vs gap + F(L_A+L_B)/EA = ${want.toFixed(5)} mm (${(100 * Math.abs(maxU - want) / want).toFixed(2)} %)`);
  ok(r.maxDisp.at[0] > 2 * L - 1, `the largest movement is at B's far end, in the assembly frame (x = ${r.maxDisp.at[0].toFixed(2)})`);
  ok(cf.maxPenetration < 0.01 * Math.min(...[r.summary.h]), `penetration ${cf.maxPenetration.toExponential(2)} mm stays under 1 % of the element size`);
  ok(AC.contactProblems(r).length === 0, 'a converged, stiff study raises no Problem');

  // a bonded pair carries the same push
  const rb = PW.contactSolve({ ...jc, pairs: [{ ...jc.pairs[0], type: 'bonded', factor: 1000 }] });
  ok(rb.converged && rb.maxDisp.value < maxU + 1e-9 && rb.maxDisp.value > 0.09, `bonded: B's far end ${rb.maxDisp.value.toFixed(5)} mm (the gap is closed by the bond, so a little less than the contact case)`);
  // a soft penalty gives the penetration Problem
  const soft = PW.contactSolve({ ...jc, parts: jc.parts.map((p) => ({ ...p, bcs: { ...p.bcs, loads: (p.bcs.loads || []).map((l) => ({ ...l, total: 3e6 })) } })), pairs: [{ ...jc.pairs[0], factor: 1 }], nonlinear: { steps: 4, tol: 1e-5 } });
  ok(AC.contactProblems(soft).some((x) => x.code === 'sim.nl.penetration'), 'a very soft penalty under a huge push raises sim.nl.penetration');

  // problems
  const lost = AC.contactJob(asm, builds, placed.world, { ...c, pairs: [{ ...pr, a: { inst: ia.id, faces: [{ name: 'gone', at: [0, 0, 0] }] } }] });
  ok(!lost.job && lost.problems.length >= 1, 'a face that no longer exists is a problem, not a job: ' + lost.problems[0]);
  const same = AC.contactJob(asm, builds, placed.world, { ...c, pairs: [{ ...pr, b: { inst: ia.id, faces: [ref(a.regen, aFixed)] } }] });
  ok(!same.job, 'a pair of one part with itself is refused here (that is a part study)');
  const inAsm = (inst) => asm.parts[asm.instances.find((i) => i.id === inst.id).part].part;   // the assembly holds its own copy of each part
  const pA = inAsm(ia), pB = inAsm(ib), keepA = pA.studies.simulation, keepB = pB.studies.simulation;
  P.setStudy(pA, 'simulation', study({})); P.setStudy(pB, 'simulation', study({ loads: keepB.loads }));
  const nosup = AC.contactJob(asm, builds, placed.world, c);
  ok(!nosup.job && nosup.problems.some((x) => /support|hold|fixed/i.test(x)), 'with no support on any part there is nothing to hold the assembly: ' + nosup.problems[0]);

  // the CalculiX deck
  P.setStudy(pA, 'simulation', keepA); P.setStudy(pB, 'simulation', keepB);
  const deck = PW.contactDeck(AC.contactJob(asm, builds, placed.world, c).job);
  ok(/\*ELEMENT, TYPE=C3D10, ELSET=/.test(deck.text) && /\*CONTACT PAIR/.test(deck.text) && /\*CLOAD/.test(deck.text) && deck.elements > 100, `the CalculiX deck: ${deck.nodes} nodes, ${deck.elements} C3D10, *CONTACT PAIR, *CLOAD`);
  // the results file CalculiX would write for that deck, read back on the rebuilt mesh
  const prep = PW.prepareContact(AC.contactJob(asm, builds, placed.world, c).job), n = prep.model.n, X = prep.model.X;
  const I10 = (v) => String(v).padStart(10), E12 = (v) => (v < 0 ? '-' : ' ') + Math.abs(v).toExponential(5).replace(/e([+-])(\d)$/, 'e$10$2');
  const frd = ['    1C', '    2C' + ' '.repeat(18) + n];
  for (let k = 0; k < n; k++) frd.push(' -1' + I10(k + 1) + E12(X[3 * k]) + E12(X[3 * k + 1]) + E12(X[3 * k + 2]));
  frd.push(' -3', '  100CL  101 1.000000000       ' + n + '                     0    1', ' -4  DISP        4    1', ' -5  D1          1    2    1    0', ' -5  D2          1    2    2    0', ' -5  D3          1    2    3    0', ' -5  ALL         1    2    0    0    1ALL');
  let xmax = 0; for (let k = 0; k < n; k++) xmax = Math.max(xmax, Math.hypot(X[3 * k], X[3 * k + 1], X[3 * k + 2]));
  for (let k = 0; k < n; k++) frd.push(' -1' + I10(k + 1) + E12(1e-3 * X[3 * k]) + E12(1e-3 * X[3 * k + 1]) + E12(1e-3 * X[3 * k + 2]));
  frd.push(' -3', '9999');
  const backFrd = PW.contactRead({ ...AC.contactJob(asm, builds, placed.world, c).job, frd: frd.join('\n') });
  ok(backFrd.calculix.nodes === n && Math.abs(backFrd.maxDisp.value - 1e-3 * xmax) / (1e-3 * xmax) < 1e-4 && !backFrd.calculix.stress, `a .frd read back on the rebuilt mesh: ${n} nodes matched, largest displacement ${backFrd.maxDisp.value.toExponential(4)} (known ${(1e-3 * xmax).toExponential(4)})`);
  let refused = ''; try { PW.contactRead({ ...AC.contactJob(asm, builds, placed.world, c).job, frd: frd.join('\n').replace(/^    2C.*$/m, '    2C').split('\n').filter((l, i) => !(l.startsWith(' -1') && i === 3)).join('\n') }); } catch (e) { refused = e.message; }
  ok(/mesh|node/i.test(refused), 'a .frd for another mesh (one node fewer) is refused in words');
  ok((deck.text.match(/ELSET=/g) || []).length >= 4, 'one element set per part (two sets, each named once in *ELEMENT and once in *SOLID SECTION)');
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  let pass = 0, fail = 0;
  const ok = (c, m) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };
  await runAsmContactTests({ ok, section: (s) => console.log('== ' + s) });
  console.log(fail ? `\n${pass} ok, ${fail} FAILED` : `\nall ok (${pass})`);
  process.exit(fail ? 1 : 0);
}
