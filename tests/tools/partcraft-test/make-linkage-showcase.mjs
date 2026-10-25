#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * make-linkage-showcase.mjs — makes fixtures/showcase/partcraft-four-bar.partcraft-asm.json ONCE (0.7 D7.40; CC0, ours): a
 * crank-rocker four-bar linkage of flat bars (ground 100, crank 30, coupler 110, rocker 80 between hole centres, 16 wide, 5 thick,
 * Ø4 holes), four revolute joints on the hole axes, stacked so the loop agrees in depth, saved closed with the crank at 60°.
 * Refuses to overwrite; `--check` rebuilds in memory and compares.
 *   node tools/partcraft-test/make-linkage-showcase.mjs [--check]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '../..');
const DEV = path.join(REPO, 'public_html/assets/apps/partcraft/dev/');
const OUT = path.join(REPO, 'fixtures/showcase/partcraft-four-bar.partcraft-asm.json');
const check = process.argv.includes('--check');
if (fs.existsSync(OUT) && !check) { console.log('exists, left as it is: ' + OUT); process.exit(0); }
const I18N = await import(DEV + 'i18n.js');
I18N.init({ locale: 'en', strings: JSON.parse(fs.readFileSync(DEV + 'lang/en.json', 'utf8')) });
const A = await import(DEV + 'assembly.js'), K = await import(DEV + 'kernel.js'), P = await import(DEV + 'part.js'), S = await import(DEV + 'sketch.js');
const { default: Module } = await import(path.join(REPO, 'public_html/assets/vendor/manifold-3d/current/manifold.js'));
const M = await Module(); M.setup();
const bar = (name, at) => {
  const part = P.newPart(name);
  const sk = S.newSketch(); S.addRect(sk, [Math.min(...at) - 8, -8], [Math.max(...at) + 8, 8]);
  const s1 = P.addFeature(part, 'sketch', { plane: { kind: 'base', name: 'front' }, sketch: sk });
  const e1 = P.addFeature(part, 'extrude', { sketch: s1.id, depth: 5 });
  const hk = S.newSketch(); for (const x of at) S.addPoint(hk, x, 0);
  const s2 = P.addFeature(part, 'sketch', { plane: { kind: 'face', feature: e1.id, face: 'end' }, sketch: hk });
  const h = P.addFeature(part, 'hole', { sketch: s2.id, kind: 'simple', d: 4, depth: 5, through: true });
  return { part, e: e1.id, h: h.id };
};
const top = (b, inst, k) => ({ inst, plane: { kind: 'face', feature: b.e, face: 'end' }, axis: { feature: b.h, index: k } });
const bottom = (b, inst, k) => ({ inst, plane: { kind: 'face', feature: b.e, face: 'start' }, axis: { feature: b.h, index: k } });
const G = bar('Ground', [0, 100]), C = bar('Crank', [0, 30]), CP = bar('Coupler', [0, 110]), R = bar('Rocker', [0, 80]);
const asm = A.newAssembly('Four-bar linkage');
const ig = A.insertPart(asm, G.part), ic = A.insertPart(asm, C.part), icp = A.insertPart(asm, CP.part), ir = A.insertPart(asm, R.part);
const j1 = A.addJoint(asm, 'revolute', top(G, ig.id, 0), bottom(C, ic.id, 0), { angle: 60 });
A.addJoint(asm, 'revolute', top(C, ic.id, 1), bottom(CP, icp.id, 0), { angle: -50 });
A.addJoint(asm, 'revolute', top(R, ir.id, 1), bottom(CP, icp.id, 1), { angle: 0 });
A.addJoint(asm, 'revolute', top(G, ig.id, 1), bottom(R, ir.id, 0), { angle: 90 });
const builds = new Map(Object.entries(asm.parts).map(([pid, p]) => [pid, K.regenerate(p.part, M)]));
const r = A.placeAll(asm, builds, { hold: new Set([j1.id + '.angle']) });
if (!r.loops.closed) { console.log('the loop did not close'); process.exit(1); }
A.applySolved(asm, r.loops);
const text = A.toJSON(asm) + '\n';
if (check) { const same = fs.existsSync(OUT) && fs.readFileSync(OUT, 'utf8') === text; console.log(same ? 'same' : 'DIFFERS'); process.exit(same ? 0 : 1); }
fs.writeFileSync(OUT, text);
console.log(`wrote ${OUT} (${text.length} bytes)`);
