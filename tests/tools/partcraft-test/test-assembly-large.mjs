#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-assembly-large.mjs — 0.9 SU.749 (session assembly-09): large assemblies, the parts that do not need a browser.
 *   - the made-once lattices (testfiles/generated/partcraft/assembly-{1000,5000,20000}.partcraft-asm.json, gen-assembly-large.mjs) open
 *     through readAssembly (the old caps of 500 instances / 1000 joints are gone) and place with no problem;
 *   - placing only what moved: after turning one revolute joint (or three, or a rigid joint's offset) placeAll with the last answer
 *     gives, for EVERY instance, the same matrix (to 1e-9) as placing everything again; the instances not behind the joint keep the
 *     very same matrix object; `moved` is the size of the subtree, not the assembly;
 *   - the fallbacks: a rebuilt part, a joint added, a face changed, the grounded part moved: all place everything (no `moved`);
 *   - a loop assembly is never placed incrementally (its answer comes from solveLoops).
 * No timing is asserted (rule 14); the numbers are in bin/ browser-assembly-large.mjs's RESULT line.
 *   node tools/partcraft-test/test-assembly-large.mjs [--verbose]    (or runAssemblyLargeTests() from bin/test-partcraft.mjs)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '../..');
const DEV = path.join(REPO, 'public_html/assets/apps/partcraft/dev/');

export async function runAssemblyLargeTests({ ok, section }) {
  const I18N = await import(DEV + 'i18n.js');
  I18N.init({ locale: 'en', strings: JSON.parse(fs.readFileSync(DEV + 'lang/en.json', 'utf8')) });
  const A = await import(DEV + 'assembly.js');
  const G = await import(path.join(HERE, 'gen-assembly-large.mjs'));
  const builds = (asm) => new Map(Object.keys(asm.parts).map((p) => [p, { results: new Map(), candidates: [] }]));
  const maxDiff = (a, b) => { let m = 0; for (const [k, v] of a) { const w = b.get(k); for (let q = 0; q < 16; q++) m = Math.max(m, Math.abs(v[q] - w[q])); } return m; };

  section('large assemblies: files and caps');
  for (const n of G.SIZES) {
    if (!fs.existsSync(G.FILES[n])) { console.log('  skip: ' + G.FILES[n] + ' is missing (node tools/partcraft-test/gen-assembly-large.mjs)'); continue; }
    const asm = A.readAssembly(fs.readFileSync(G.FILES[n], 'utf8'));
    const r = A.placeAll(asm, builds(asm));
    ok(asm.instances.length === n && asm.joints.length === n - 1 && r.problems.length === 0 && r.world.size === n, `${n} instances open and place: ${asm.joints.length} joints, no problem`);
  }

  section('large assemblies: placing only what moved');
  const file = G.FILES[5000];
  if (!fs.existsSync(file)) { console.log('  skip: no 5000 file'); return; }
  const asm = A.readAssembly(fs.readFileSync(file, 'utf8'));
  const B = builds(asm);
  const first = A.placeAll(asm, B);
  ok(!!first.inc, 'a tree of joints leaves an incremental state');
  const rev = asm.joints.filter((j) => j.type === 'revolute');
  const check = (what, expectMoved) => {
    const inc = A.placeAll(asm, B, { prev: last });
    const full = A.placeAll(asm, B);
    const d = maxDiff(inc.world, full.world);
    ok(d < 1e-9, `${what}: every instance equals a full placement (largest difference ${d.toExponential(1)})`);
    if (expectMoved !== undefined) ok(inc.moved === expectMoved || (expectMoved === 'some' && inc.moved > 0 && inc.moved < asm.instances.length), `${what}: ${inc.moved} parts placed again (not ${asm.instances.length})`);
    let same = 0; for (const [k, v] of inc.world) if (last.world.get(k) === v) same++;
    last = inc;
    return { inc, same };
  };
  let last = first;
  rev[0].angle = 15;
  let r1 = check('a revolute joint near the root turned', 'some');
  ok(r1.same > 0, `the parts before it kept the very same matrix (${r1.same} of ${asm.instances.length})`);
  rev[rev.length - 1].angle = 30;
  const r2 = check('a revolute joint near the end turned', 'some');
  ok(r2.inc.moved < asm.instances.length / 10, `the last joint moves only the parts behind it (${r2.inc.moved})`);
  rev[3].angle = -20; rev[40].angle = 45; rev[41].angle = 10;
  check('three joints turned at once', 'some');
  const rigid = asm.joints.find((j) => j.type === 'rigid');
  rigid.offset = 2.5;
  check('a rigid joint\'s offset changed', 'some');
  const same = A.placeAll(asm, B, { prev: last });
  ok(same.moved === 0 && maxDiff(same.world, last.world) === 0, 'nothing changed: nothing is placed again');

  section('large assemblies: what places everything');
  const full = (what, mutate, undo) => {
    const keep = last;
    mutate();
    const r = A.placeAll(asm, B, { prev: keep });
    const f = A.placeAll(asm, B);
    ok(r.moved === undefined && maxDiff(r.world, f.world) < 1e-9, `${what}: placed in full, same answer`);
    undo?.();
  };
  const B2 = new Map(B);
  const pid = [...B2.keys()][0];
  { const r = A.placeAll(asm, new Map([...B].map(([k, v]) => [k, k === pid ? { ...v } : v])), { prev: last }); ok(r.moved === undefined, 'a rebuilt part: placed in full'); }
  { const g = asm.instances[0], keep = g.place; g.place = [...keep]; g.place[12] = 5; full('the grounded part moved', () => {}, () => { g.place = keep; }); }
  { const j = asm.joints[7], keep = j.a.plane; j.a = { ...j.a, plane: { kind: 'fixed', o: [10, 6, 0], n: [1, 0, 0] } }; full('a joint\'s face changed', () => {}, () => { j.a = { ...j.a, plane: keep }; }); }
  { const extra = { id: 'j' + 900000, name: 'Extra', type: 'rigid', a: asm.joints[0].a, b: asm.joints[0].b, angle: 0, offset: 0 }; asm.joints.push(extra); const r = A.placeAll(asm, B, { prev: last }); ok(r.moved === undefined, 'a joint added: placed in full'); asm.joints.pop(); }

  section('large assemblies: a loop is not placed incrementally');
  { const small = A.readAssembly(fs.readFileSync(G.FILES[1000], 'utf8')); const b = builds(small);
    // close a loop: a second joint from the first to the second instance (the same faces, a different joint id)
    const j0 = small.joints[0]; small.joints.push({ id: 'j900001', name: 'Loop', type: 'rigid', a: j0.a, b: j0.b, angle: 0, offset: 0 });
    const r0 = A.placeAll(small, b), r1 = A.placeAll(small, b, { prev: r0 });
    ok(!r0.inc && r1.moved === undefined, 'with a loop there is no incremental state, every placement solves the loop'); }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  let pass = 0, fail = 0;
  const ok = (c, m) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };
  const section = (s) => console.log('\n== ' + s);
  await runAssemblyLargeTests({ ok, section });
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}
