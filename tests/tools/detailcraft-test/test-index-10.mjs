#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * tools/detailcraft-test/test-index-10.mjs (0.10 FX.144 / PERF.36): the grid over the solids' boxes (clash.js solidIndex) must give the SAME answers as the
 * 0.9 loops over every solid. Runs the 0.9 modules and the dev modules on the same generated models and compares their whole output as JSON:
 *   clashCheck(state, built)        (frames13: 78 clashes; grid10x6x4: 0)
 *   constructability(state, built)  (frames13: 67 items; 0.9 needs about 30 s here)
 * plus the index itself: near(p) holds every solid whose box holds p, pairs() holds every overlapping pair, on random boxes.
 *   node tools/detailcraft-test/test-index-10.mjs [--quick]       (--quick leaves out the 0.9 constructability run)
 */
import fs from 'node:fs';
import { pathToFileURL } from 'node:url';

const ROOT = '/var/www/CADCRAFT/getcadcraft.com/public_html/assets/apps/detailcraft/';
const FILES = '/var/www/CADCRAFT/testfiles/generated/detail/';
const quick = process.argv.includes('--quick');
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.log('  FAIL ' + m); } };

async function load(v) {
  const mod = (f) => import(pathToFileURL(ROOT + v + '/' + f).href);
  const I = await mod('i18n.js');
  I.init({ locale: 'en', strings: JSON.parse(fs.readFileSync(ROOT + v + '/lang/en.json', 'utf8')) });
  const [Md, B, C, K] = await Promise.all([mod('model.js'), mod('build.js'), mod('constructability.js'), mod('clash.js')]);
  return { Md, B, C, K };
}
const [old, cur] = [await load('0.9'), await load('dev')];
const run = (m, file) => { let st = m.Md.readModel(fs.readFileSync(FILES + file, 'utf8')); st = st.state || st; return { st, built: m.B.build(st) }; };

for (const [file, withCons] of [['frames13.detailcraft.json', !quick], ['grid10x6x4.detailcraft.json', false]]) {
  const a = run(old, file), b = run(cur, file);
  let t = performance.now(); const ca = old.K.clashCheck(a.st, a.built); const ta = performance.now() - t;
  t = performance.now(); const cb = cur.K.clashCheck(b.st, b.built); const tb = performance.now() - t;
  const noMs = (r) => JSON.stringify({ ...r, ms: 0 });   // the result carries its own run time
  ok(noMs(ca) === noMs(cb), file + ': clashCheck output differs');
  console.log(`${file}: clashCheck ${ca.clashes?.length ?? ca.length} clashes, 0.9 ${Math.round(ta)} ms, dev ${Math.round(tb)} ms`);
  if (withCons) {
    t = performance.now(); const ra = old.C.constructability(a.st, a.built); const t1 = performance.now() - t;
    t = performance.now(); const rb = cur.C.constructability(b.st, b.built); const t2 = performance.now() - t;
    ok(JSON.stringify(ra) === JSON.stringify(rb), file + ': constructability output differs');
    console.log(`${file}: constructability ${ra.length} items, 0.9 ${Math.round(t1)} ms, dev ${Math.round(t2)} ms`);
  }
}

// the joint finders (PERF.36): findSplices / findJoints / freeSplices / autopilot.propose through grids must list the same joints in the same order as 0.9's loops
{
  const mod = (v, f) => import(pathToFileURL(ROOT + v + '/' + f).href);
  const [Co, Cn, Po, Pn] = await Promise.all([mod('0.9', 'connections.js'), mod('dev', 'connections.js'), mod('0.9', 'autopilot.js'), mod('dev', 'autopilot.js')]);
  for (const file of ['frames13.detailcraft.json', 'grid10x6x4.detailcraft.json', 'grid24x12x5.detailcraft.json']) {
    const a = run(old, file).st, b = run(cur, file).st;
    for (const fn of ['findSplices', 'findJoints', 'freeSplices', 'findBraceEnds']) {
      const ra = JSON.stringify(Co[fn](a)), rb = JSON.stringify(Cn[fn](b));
      ok(ra === rb, `${file}: ${fn} differs`);
    }
    const t0 = performance.now(); const pa = Po.propose(a); const ta = performance.now() - t0;
    const t1 = performance.now(); const pb = Pn.propose(b); const tb = performance.now() - t1;
    ok(JSON.stringify(pa) === JSON.stringify(pb), `${file}: autopilot propose differs`);
    console.log(`${file}: autopilot propose ${pa.items.length} proposals, 0.9 ${Math.round(ta)} ms, dev ${Math.round(tb)} ms`);
  }
}

// the per-connection cache (PERF.36): after an edit the cached answer must equal a fresh one, and an untouched model must re-answer from the cache
for (const file of ['frames13.detailcraft.json', 'grid10x6x4.detailcraft.json']) {
  const m = run(cur, file), cache = new Map();
  const first = cur.C.constructability(m.st, m.built, { cache }), plain = cur.C.constructability(m.st, m.built);
  ok(JSON.stringify(first) === JSON.stringify(plain), file + ': a cold cached run differs from the plain run');
  const t0 = performance.now(); const again = cur.C.constructability(m.st, m.built, { cache }); const tAgain = performance.now() - t0;
  ok(JSON.stringify(again) === JSON.stringify(plain), file + ': a warm cached run differs');
  const mv = m.st.members.find((x) => x.start[2] === x.end[2]) || m.st.members[0];   // move one beam sideways, so some connection's steel changes
  mv.start[1] += 20; mv.end[1] += 20;
  const built2 = cur.B.build(m.st);
  const t1 = performance.now(); const edited = cur.C.constructability(m.st, built2, { cache }); const tEdit = performance.now() - t1;
  const fresh = cur.C.constructability(m.st, built2);
  ok(JSON.stringify(edited) === JSON.stringify(fresh), file + ': after an edit the cached answer differs from a fresh one');
  console.log(`${file}: constructability cached: warm ${Math.round(tAgain)} ms, after one member moved ${Math.round(tEdit)} ms (${plain.length} items)`);
}

// the index on random oriented boxes: near(p) must hold every solid whose (grown) box contains p, pairs() every overlapping pair
let seed = 7; const rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
const S = Array.from({ length: 300 }, () => {
  const a = rnd() * Math.PI;
  return { box: { c: [rnd() * 20000, rnd() * 20000, rnd() * 8000], h: [100 + rnd() * 3000, 50 + rnd() * 300, 50 + rnd() * 300],
    ax: [[Math.cos(a), Math.sin(a), 0], [-Math.sin(a), Math.cos(a), 0], [0, 0, 1]] } };
});
const idx = cur.K.solidIndex(S, { margin: 3 });
const inside = (q, p, g) => [0, 1, 2].every((i) => Math.abs((p[0] - q.box.c[0]) * q.box.ax[i][0] + (p[1] - q.box.c[1]) * q.box.ax[i][1] + (p[2] - q.box.c[2]) * q.box.ax[i][2]) <= q.box.h[i] + g);
let miss = 0;
for (let n = 0; n < 4000; n++) {
  const q = S[n % S.length], p = [q.box.c[0] + (rnd() - 0.5) * 2 * q.box.h[0] * 0.9, q.box.c[1] + (rnd() - 0.5) * 2 * q.box.h[1] * 0.9, q.box.c[2] + (rnd() - 0.5) * 2 * q.box.h[2] * 0.9];
  const near = new Set(idx.near(p));
  for (const s of S) if (inside(s, p, 0) && !near.has(s)) miss++;
}
ok(miss === 0, `near(p) missed ${miss} solids whose box holds the point`);
const aabb = (q) => [0, 1, 2].map((k) => { const e = Math.abs(q.box.ax[0][k]) * q.box.h[0] + Math.abs(q.box.ax[1][k]) * q.box.h[1] + Math.abs(q.box.ax[2][k]) * q.box.h[2]; return [q.box.c[k] - e, q.box.c[k] + e]; });
const have = new Set(idx.pairs().map(([i, j]) => i * S.length + j));
let lost = 0, sorted = true; const pl = idx.pairs();
for (let i = 1; i < pl.length; i++) if (pl[i - 1][0] > pl[i][0] || (pl[i - 1][0] === pl[i][0] && pl[i - 1][1] >= pl[i][1])) sorted = false;
for (let i = 0; i < S.length; i++) for (let j = i + 1; j < S.length; j++) {
  const A = aabb(S[i]), B = aabb(S[j]);
  if ([0, 1, 2].every((k) => A[k][0] <= B[k][1] && B[k][0] <= A[k][1]) && !have.has(i * S.length + j)) lost++;
}
ok(lost === 0, `pairs() lost ${lost} overlapping pairs`);
ok(sorted, 'pairs() is sorted and without duplicates');
console.log(`index on 300 random boxes: ${pl.length} candidate pairs of ${300 * 299 / 2}`);
console.log(`${pass} checks passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
