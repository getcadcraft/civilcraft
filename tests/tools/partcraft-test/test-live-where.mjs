#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-live-where.mjs — 0.8 EG.41 in PartCraft (part_PART_3): the Studio Live adapter's where(ops) names what a step changes (sketch, features,
 * params, studies, drawing, material, part) on the one place a part is (sheet ''), and Studio's assistant-scope.js (when CADCRAFT_STUDIO or
 * ../studio has it) judges a scope by those tags: a sketch-only assistant may edit a sketch, not an extrude; an area scope refuses a step it
 * cannot place.
 *   node tools/partcraft-test/test-live-where.mjs   (or runLiveWhereTests() from bin/test-partcraft.mjs)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '../..');
const DEV = path.join(REPO, 'public_html/assets/apps/partcraft/dev/');

export async function runLiveWhereTests({ ok, section, skip = (m) => console.log('  skip ' + m) }) {
  section('EG.41: PartCraft live where(ops) (tags on the one part)');
  const L = await import(DEV + 'live.js'), P = await import(DEV + 'part.js'), S = await import(DEV + 'sketch.js');
  const part = P.newPart('Block'), sk = S.newSketch(); S.addRect(sk, [0, 0], [40, 20]);
  const f1 = P.addFeature(part, 'sketch', { plane: { kind: 'base', name: 'top' }, sketch: sk });
  const f2 = P.addFeature(part, 'extrude', { sketch: f1.id, op: 'add', end: 'blind', depth: 10 });
  let cur = part;
  const live = L.createLive({ get: () => cur, applied() {}, replace(p) { cur = p; } });
  const after = (fn) => { const b = JSON.parse(JSON.stringify(cur)); fn(b); return live.diff(cur, b); };
  const opsSketch = after((b) => { b.features.find((x) => x.id === f1.id).sketch.name = 'Outline'; });
  const opsDepth = after((b) => { b.features.find((x) => x.id === f2.id).depth = 12; });
  const opsParams = after((b) => { b.params = { vars: [{ name: 'L', expr: '40' }], links: [] }; });
  const opsStudy = after((b) => { b.studies = { cost: { v: 1, qty: 2 } }; });
  const w1 = live.where(opsSketch), w2 = live.where(opsDepth), w3 = live.where(opsParams), w4 = live.where(opsStudy);
  ok(w1 && w1.sheet === '' && w1.tags.join() === 'sketch', 'a sketch edit: sheet "" (the part), tags [sketch]', JSON.stringify(w1));
  ok(w2 && w2.tags.join() === 'features', 'an extrude depth: tags [features]', JSON.stringify(w2));
  ok(w3 && w3.tags.join() === 'params' && w4 && w4.tags.join() === 'studies', 'variables: [params]; a study: [studies]', JSON.stringify([w3, w4]));
  ok(live.where([]) === null && !('box' in w2), 'no ops → null; never a box (a 2-D area means nothing on a part)');
  const studio = process.env.CADCRAFT_STUDIO || path.resolve(REPO, '../studio');
  const scopeFile = path.join(studio, 'hub/live/assistant-scope.js');
  if (!fs.existsSync(scopeFile)) { skip('assistant-scope.js not found (set CADCRAFT_STUDIO): scope judging not checked'); return; }
  const A = await import(pathToFileURL(scopeFile).href);
  const sketchOnly = A.makeScope({ label: 'Sketches only', tags: ['sketch'] }), area = A.makeScope({ area: [0, 0, 10, 10] });
  ok(A.judge(sketchOnly, A.locate(live, opsSketch)) === null, 'Studio judges a sketch-only assistant: its sketch edit is allowed');
  ok(A.judge(sketchOnly, A.locate(live, opsDepth)) === A.REASONS.tags, 'and the extrude depth is refused (' + A.REASONS.tags + ')');
  ok(A.judge(area, A.locate(live, opsSketch)) === A.REASONS.unknown, 'an area scope refuses a step it cannot place (' + A.REASONS.unknown + ')');
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  let pass = 0, fail = 0;
  const ok = (c, m, x = '') => { if (c) pass++; else { fail++; console.log('FAIL', m, x); } };
  await runLiveWhereTests({ ok, section: (s) => console.log('\n== ' + s) });
  console.log(`\nlive-where: ${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}
