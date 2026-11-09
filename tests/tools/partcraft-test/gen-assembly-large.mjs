#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * gen-assembly-large.mjs — the large PartCraft test assemblies (0.9 SU.749, session assembly-09): 1,000, 5,000 and 20,000
 * instances of three small parts (a block, a pin with a counterbored hole, a plate with four holes; all 20 × 20 mm in plan) in a
 * lattice. Every instance is joined to the one before it in its row by a rigid joint (+X face to −X face), the first of each row
 * to the first of the row before (+Z face to −Z face); every 25th joint of a row is a revolute (angle 0, mobile) so a joint can
 * be turned and the mate solve has something to move. One joint per instance, so the joints form a tree.
 * Made ONCE (the files are skipped when they exist); registered in testfiles/LARGE-FILES.md.
 *
 *   node tools/partcraft-test/gen-assembly-large.mjs            writes testfiles/generated/partcraft/assembly-{1000,5000,20000}.partcraft-asm.json
 *   import { makeAssembly, SIZES, FILES } from './gen-assembly-large.mjs'
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '../..');
const DEV = path.join(REPO, 'public_html/assets/apps/partcraft/dev/');
export const DIR = path.resolve(REPO, '../testfiles/generated/partcraft');
export const SIZES = [1000, 5000, 20000];
export const COLS = { 1000: 25, 5000: 50, 20000: 100 };   // instances per row; rows = size / cols
export const FILES = Object.fromEntries(SIZES.map((n) => [n, path.join(DIR, `assembly-${n}.partcraft-asm.json`)]));
{
  const I18N = await import(DEV + 'i18n.js');
  I18N.init({ locale: 'en', strings: JSON.parse(fs.readFileSync(DEV + 'lang/en.json', 'utf8')) });
}
const S = await import(DEV + 'sketch.js');
const P = await import(DEV + 'part.js');

const W = 20, H = 10;   // plan 20 × 20 mm, 10 mm tall (sketched on the top plane, extruded up from y = 0)

function parts() {
  const block = P.newPart('Block');
  { const sk = S.newSketch(); S.addRect(sk, [-W / 2, -W / 2], [W / 2, W / 2]); const s = P.addFeature(block, 'sketch', { plane: { kind: 'base', name: 'top' }, sketch: sk }); P.addFeature(block, 'extrude', { sketch: s.id, depth: H }); }
  const pin = P.newPart('Pin');
  { const sk = S.newSketch(); S.addRect(sk, [-W / 2, -W / 2], [W / 2, W / 2]); const s = P.addFeature(pin, 'sketch', { plane: { kind: 'base', name: 'top' }, sketch: sk }); const e = P.addFeature(pin, 'extrude', { sketch: s.id, depth: H });
    const hk = S.newSketch(); S.addPoint(hk, 0, 0); const hs = P.addFeature(pin, 'sketch', { plane: { kind: 'face', feature: e.id, face: 'end' }, sketch: hk }); P.addFeature(pin, 'hole', { sketch: hs.id, kind: 'cbore', d: 5, cboreD: 9, cboreDepth: 3, through: true }); }
  const plate = P.newPart('Plate');
  { const sk = S.newSketch(); S.addRect(sk, [-W / 2, -W / 2], [W / 2, W / 2]); const s = P.addFeature(plate, 'sketch', { plane: { kind: 'base', name: 'top' }, sketch: sk }); const e = P.addFeature(plate, 'extrude', { sketch: s.id, depth: H });
    const hk = S.newSketch(); for (const [x, y] of [[-5, -5], [5, -5], [5, 5], [-5, 5]]) S.addPoint(hk, x, y); const hs = P.addFeature(plate, 'sketch', { plane: { kind: 'face', feature: e.id, face: 'end' }, sketch: hk }); P.addFeature(plate, 'hole', { sketch: hs.id, d: 3, through: true }); }
  return [block, pin, plate];
}

const face = (o, n) => ({ kind: 'fixed', o, n });
const X_POS = face([W / 2, H / 2, 0], [1, 0, 0]), X_NEG = face([-W / 2, H / 2, 0], [-1, 0, 0]);
const Z_POS = face([0, H / 2, W / 2], [0, 0, 1]), Z_NEG = face([0, H / 2, -W / 2], [0, 0, -1]);

/** The assembly object for `n` instances (seq numbers: parts p1…p3, then instances and joints from 4). */
export function makeAssembly(n) {
  const cols = COLS[n] || 50, rows = Math.ceil(n / cols);
  const ps = parts();
  const asm = { format: 'partcraft-assembly', version: 2, name: `Lattice ${n}`, seq: 1, parts: {}, instances: [], joints: [], views: [] };
  ps.forEach((p, k) => { asm.parts['p' + (k + 1)] = { name: p.name, part: JSON.parse(P.toJSON(p)) }; });
  let seq = 4;
  const ident = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
  const ids = [];
  for (let k = 0; k < n; k++) {
    const r = Math.floor(k / cols), c = k % cols, pid = 'p' + (((r + c) % 3) + 1);
    const id = 'i' + seq++;
    ids.push(id);
    asm.instances.push({ id, part: pid, name: `${asm.parts[pid].name}<${k + 1}>`, place: ident.slice() });
  }
  for (let k = 1; k < n; k++) {
    const r = Math.floor(k / cols), c = k % cols;
    const row = c > 0;
    const a = row ? ids[k - 1] : ids[k - cols], b = ids[k];
    const revolute = row && c % 25 === 12;
    const j = { id: 'j' + seq++, name: (revolute ? 'Revolute' : 'Rigid') + k, type: revolute ? 'revolute' : 'rigid',
      a: { inst: a, plane: row ? X_POS : Z_POS }, b: { inst: b, plane: row ? X_NEG : Z_NEG }, angle: 0, offset: 0 };
    asm.joints.push(j);
  }
  asm.seq = seq;
  return asm;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  fs.mkdirSync(DIR, { recursive: true });
  for (const n of SIZES) {
    if (fs.existsSync(FILES[n])) { console.log('kept ' + FILES[n] + ' (' + fs.statSync(FILES[n]).size + ' bytes)'); continue; }
    const a = makeAssembly(n);
    fs.writeFileSync(FILES[n], JSON.stringify(a));
    console.log('wrote ' + FILES[n] + ' (' + fs.statSync(FILES[n]).size + ' bytes, ' + a.instances.length + ' instances, ' + a.joints.length + ' joints)');
  }
}
