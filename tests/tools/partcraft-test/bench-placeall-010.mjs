#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * bench-placeall-010.mjs — PERF.40 (0.10 session `model-part-10`): how long placeAll takes on the generated lattices
 * (testfiles/generated/partcraft/assembly-{1000,5000,20000,200000}.partcraft-asm.json, gen-assembly-large.mjs), in Node with
 * the dev build's assembly.js, timed per phase: readAssembly, placeAll (full: end frames + walk), placeAll with the last answer
 * after one joint turned (only what moved), and the same full placement with the lookup the wave-3 report measured (an
 * instances.find per joint end) put back in a throw-away copy of assembly.js (`--find`), so before and after run on one machine.
 *   nice -n 10 node tools/partcraft-test/bench-placeall-010.mjs [--sizes 1000,5000,20000,200000] [--find] [--runs 3]
 * Prints one RESULT line per size (JSON, with the load average). No timing is asserted.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DEV = path.resolve(HERE, '../../public_html/assets/apps/partcraft/dev/');
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const sizes = arg('--sizes', '1000,5000,20000,200000').split(',').map(Number), runs = +arg('--runs', 3), FIND = process.argv.includes('--find');
const load = () => os.loadavg().map((x) => x.toFixed(2)).join(' ');

const I18N = await import(pathToFileURL(path.join(DEV, 'i18n.js')));
I18N.init({ locale: 'en', strings: JSON.parse(fs.readFileSync(path.join(DEV, 'lang/en.json'), 'utf8')) });
// The bench runs a throw-away copy of assembly.js (beside the original, so its relative imports resolve; removed at the end)
// with the file caps lifted so the 200,000 lattice can be timed at all (readAssembly refuses more than its MAX instances),
// and with --find, the wave-3 lookup put back.
let src = fs.readFileSync(path.join(DEV, 'assembly.js'), 'utf8');
const uncapped = src.replace(/j\.instances\.length > (\d+|MAX_INSTANCES)/, 'j.instances.length > 1e7').replace(/j\.joints\.length > (\d+|MAX_JOINTS)/, 'j.joints.length > 1e7');
if (uncapped === src) throw new Error('readAssembly caps not found: the bench needs updating');
src = uncapped;
if (FIND) {
  const old = src.replace('const inst = instanceOf(asm, end.inst);', 'const inst = asm.instances.find((i) => i.id === end.inst);');
  if (old === src) throw new Error('endFrame lookup not found: the bench needs updating');
  src = old;
}
const tmp = path.join(DEV, `.bench-assembly-${process.pid}.js`);
fs.writeFileSync(tmp, src);
const A = await import(pathToFileURL(tmp));
const G = await import(path.join(HERE, 'gen-assembly-large.mjs'));
const builds = (asm) => new Map(Object.keys(asm.parts).map((p) => [p, { results: new Map(), candidates: [] }]));
const best = (f) => { let b = Infinity, v; for (let k = 0; k < runs; k++) { const t0 = performance.now(); v = f(); b = Math.min(b, performance.now() - t0); } return [Math.round(b * 10) / 10, v]; };

try {
  for (const n of sizes) {
    const file = G.FILES[n] || path.join('/var/www/CADCRAFT/testfiles/generated/partcraft', `assembly-${n}.partcraft-asm.json`);
    if (!fs.existsSync(file)) { console.log('skip ' + file); continue; }
    const text = fs.readFileSync(file, 'utf8');
    const [readMs, asm] = best(() => A.readAssembly(text));
    const B = builds(asm);
    const r1 = n >= 200000 && FIND ? 1 : runs;   // the quadratic one at 200k: once
    let full = Infinity, first;
    for (let k = 0; k < r1; k++) { const t0 = performance.now(); first = A.placeAll(asm, B); full = Math.min(full, performance.now() - t0); }
    let incMs = null;
    if (!FIND && first.inc) {
      const j = asm.joints[Math.floor(asm.joints.length / 2)];
      [incMs] = best(() => { j.angle = (j.angle || 0) + 1; return A.placeAll(asm, B, { prev: first }); });
    }
    const R = { size: n, lookup: FIND ? 'find (wave 3)' : 'map (dev)', read_ms: readMs, placeAll_ms: Math.round(full * 10) / 10, inc_ms: incMs, problems: first.problems.length, placed: first.world.size, node: process.version, cpus: os.cpus().length, load: load() };
    console.log('RESULT ' + JSON.stringify(R));
  }
} finally { fs.rmSync(tmp, { force: true }); }
