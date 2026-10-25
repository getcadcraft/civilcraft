#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-large.mjs — 0.7 D7.51 (session part-07): parts with hundreds of features stay usable. The mesh kernel's batched build
 * (add / cut tools folded per cluster, one subtract and one add on the body) must give the same part as building one tool at
 * a time, and its checkpoints (kernel.js) must give the same part as building from nothing after an edit, an undo, a
 * rollback or a part of the history.
 *   - a 12-cell plate (50 features): batched = one at a time (volume, faces, edges, every feature's status), with and without checkpoints;
 *   - the same with a checkpoint taken at every feature (CP_MS forced to 0 through the test hook): edit the last extrude, the first,
 *     undo it (the old part again), roll back half and forward again, all equal a fresh build;
 *   - the failure paths: a cut with no body, a hole through nothing — the batched build falls back to one at a time and says the same;
 *   - the 750-feature part (testfiles/generated/partcraft/features-750.partcraft.json, made once by gen-750.mjs; skipped when
 *     missing): opens, builds with no feature failing, 1 body, 775 faces, the volume the one-at-a-time build gave (3212412.896 mm³).
 * No timing is asserted (rule 14): tools/partcraft-test/bench-750.mjs prints them with the load.
 *   node tools/partcraft-test/test-large.mjs [--verbose]    (or runLargeTests() from bin/test-partcraft.mjs)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '../..');
const DEV = path.join(REPO, 'public_html/assets/apps/partcraft/dev/');

export async function runLargeTests({ ok, section, M }) {
  await import(path.join(HERE, 'fixtures.mjs'));   // the English strings
  const P = await import(DEV + 'part.js');
  const K = await import(DEV + 'kernel.js');
  const G = await import(path.join(HERE, 'gen-750.mjs'));
  const rel = (a, b, r = 1e-9) => Math.abs(a - b) <= r * Math.max(1, Math.abs(b));
  const sig = (r) => ({
    vol: r.stats?.volume, bodies: r.stats?.bodies, genus: r.stats?.genus,
    faces: (r.faces || []).map((f) => f.name + ':' + f.type).sort().join('|'), edges: (r.edges || []).map((e) => e.key || e.name || '').sort().join('|'),
    status: [...r.results].map(([id, x]) => id + ':' + x.status + (x.message ? '!' + x.message : '')).join('|'),
  });
  const same = (a, b) => rel(a.vol, b.vol) && a.bodies === b.bodies && a.genus === b.genus && a.faces === b.faces && a.edges === b.edges && a.status === b.status;
  const clone = (p) => JSON.parse(JSON.stringify(p));

  section('large parts: the batched build and the checkpoints give the same part (0.7 D7.51)');
  {
    const base = G.makePlate(12, false);
    ok(base.features.length === 2 + 12 * 4, `a 12-cell plate: ${base.features.length} features`);
    const seq = sig(K.regenerate(clone(base), M, { batch: false, checkpoints: false }));
    ok(seq.vol > 0 && seq.bodies === 1 && !/!/.test(seq.status), `built one tool at a time: ${seq.vol.toFixed(3)} mm³, one body, every feature ok`);
    const bat = sig(K.regenerate(clone(base), M, { checkpoints: false }));
    ok(same(seq, bat), 'batched = one at a time (volume, genus, faces, edges, statuses)');
    K.clearCheckpoints();
    K.__setCheckpointInterval(0);   // a checkpoint after every feature
    const p = clone(base);
    const first = sig(K.regenerate(p, M));
    ok(same(seq, first), 'with a checkpoint after every feature: the same');
    const again = sig(K.regenerate(p, M));
    ok(same(seq, again), 'rebuilding the unchanged part from its last checkpoint: the same');
    // an edit of the last extrude, then of the first feature that matters, each against a fresh build
    const ex = p.features.filter((f) => f.type === 'extrude');
    const before = clone(p);
    ex[ex.length - 1].depth += 2;
    const e1 = sig(K.regenerate(p, M)), f1 = sig(K.regenerate(clone(p), M, { checkpoints: false, batch: false }));
    ok(same(e1, f1) && !rel(e1.vol, seq.vol), `the last extrude 2 mm deeper: from a checkpoint = from nothing (${e1.vol.toFixed(3)} mm³)`);
    const back = sig(K.regenerate(clone(before), M));   // undo: the old part comes back as a new object
    ok(same(back, seq), 'undo (the old part again, a new object): the first volume back');
    ex[0].depth += 1;
    const e2 = sig(K.regenerate(p, M)), f2 = sig(K.regenerate(clone(p), M, { checkpoints: false, batch: false }));
    ok(same(e2, f2), 'the plate 1 mm thicker (every later feature changes): from checkpoints = from nothing');
    // a rollback bar and an upTo (sketch editing)
    const q = clone(before);
    q.rollback = 20;
    const r20 = sig(K.regenerate(q, M)), g20 = sig(K.regenerate(clone(q), M, { checkpoints: false, batch: false }));
    ok(same(r20, g20), 'rolled back to 20 features: the same as building 20 one at a time');
    const u = sig(K.regenerate(clone(before), M, { upTo: 31 })), v = sig(K.regenerate(clone(before), M, { upTo: 31, checkpoints: false, batch: false }));
    ok(same(u, v), 'upTo 31 (a sketch open for editing): the same');
    const full = sig(K.regenerate(clone(before), M));
    ok(same(full, seq), 'and the whole part again after those partial builds');
    K.__setCheckpointInterval(null);
    K.clearCheckpoints();
  }

  section('large parts: failures are reported the way the one-at-a-time build reports them (0.7 D7.51)');
  {
    const p = G.makePlate(4, false);
    const cut = p.features.find((f, i) => f.type === 'extrude' && i > 2);
    const empty = clone(p);
    empty.features.splice(0, 2);   // the plate is gone: the sketches on its face and everything after cannot build
    const a = sig(K.regenerate(clone(empty), M, { batch: false, checkpoints: false })), b = sig(K.regenerate(clone(empty), M, { checkpoints: false }));
    ok(a.status === b.status && /error|skipped/.test(b.status), 'the plate deleted: the same features fail or are skipped, with the same words');
    // a cut that takes the whole body away, then a hole after it: one at a time warns "nothing left", then the hole has nothing to drill
    const S = await import(DEV + 'sketch.js');
    const q = clone(p), plate = q.features[1];
    const sk = S.newSketch();
    S.addRect(sk, [-100, 100], [1000, -1000]);
    const s1 = P.addFeature(q, 'sketch', { plane: { kind: 'face', feature: plate.id, face: 'end' }, sketch: sk });
    P.addFeature(q, 'extrude', { sketch: s1.id, op: 'cut', depth: 1000 });
    const h = S.newSketch(); S.addPoint(h, 20, -20);
    const s2 = P.addFeature(q, 'sketch', { plane: { kind: 'base', name: 'top' }, sketch: h });
    P.addFeature(q, 'hole', { sketch: s2.id, d: 5, through: true });
    const c = sig(K.regenerate(clone(q), M, { batch: false, checkpoints: false })), d = sig(K.regenerate(clone(q), M, { checkpoints: false }));
    ok(c.status === d.status && /nothing|error/.test(d.status) && c.vol === d.vol, `a cut that takes the whole body, then a hole: batched = one at a time, same words (${d.vol === undefined ? 'no body' : d.vol.toFixed(1) + ' mm³'})`);
    ok(cut !== undefined, 'fixture has extrudes');
  }

  section('large parts: 750 features (0.7 D7.51)');
  if (!fs.existsSync(G.OUT)) console.log('  skip ' + G.OUT + ' is missing (node tools/partcraft-test/gen-750.mjs)');
  else {
    const part = P.readPart(JSON.parse(fs.readFileSync(G.OUT, 'utf8')));
    ok(part.features.length === 750, 'the file opens: 750 features');
    K.clearCheckpoints();
    const r = K.regenerate(part, M);
    const bad = [...r.results.values()].filter((x) => x.status !== 'ok');
    ok(bad.length === 0 && r.stats.bodies === 1 && r.faces.length === 775, `built: no feature failing (${bad.length}), 1 body, ${r.faces.length} faces (775)`);
    ok(rel(r.stats.volume, 3212412.896, 1e-8), `the volume the one-at-a-time build gave: ${r.stats.volume.toFixed(3)} mm³ (3212412.896)`);
    const json = P.toJSON(part), back = P.readPart(JSON.parse(json));
    ok(back.features.length === 750 && JSON.stringify(back.features) === JSON.stringify(part.features), 'save and reopen: the same 750 features');
    const r2 = K.regenerate(back, M);
    ok(rel(r2.stats.volume, r.stats.volume, 1e-9) && r2.faces.length === r.faces.length, 'the reopened part builds to the same solid');
    const h = new P.History();
    for (let i = 0; i < 20; i++) h.push(part, 'x');
    const u = h.undo(part);
    ok(u && u.part.features.length === 750, 'undo hands back all 750 features');
    K.clearCheckpoints();
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  let pass = 0, fail = 0;
  const VERBOSE = process.argv.includes('--verbose');
  const ok = (c, m) => { if (c) { pass++; if (VERBOSE) console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };
  const section = (t) => console.log('\n== ' + t);
  const { default: Module } = await import(path.join(REPO, 'public_html/assets/vendor/manifold-3d/current/manifold.js'));
  const M = await Module(); M.setup();
  await runLargeTests({ ok, section, M });
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}
