#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * gen-750.mjs — the 750-feature test part (0.7 D7.51, session part-07). A 14 × 14 mounting plate (40 mm pitch) with, per grid
 * cell, four features: a sketch on the plate's face and a boss (extrude add) or a pocket (extrude cut), then a one-point sketch
 * on the boss's top (or the pocket's floor) and a through hole. Four cell shapes (rectangle / round, boss / pocket), sizes
 * from a seeded generator. The last row is three linear patterns and one pattern of a hole. Feature count: 2 (plate) +
 * 184 cells × 4 + 4 × 3 (patterns) = 750.
 *
 *   node tools/partcraft-test/gen-750.mjs            writes testfiles/generated/partcraft/features-750.partcraft.json
 *                                                   only when it is missing (registered in testfiles/LARGE-FILES.md)
 *   import { make750 } from './gen-750.mjs'          the part object, for tests that want it without the file
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '../..');
const DEV = path.join(REPO, 'public_html/assets/apps/partcraft/dev/');
export const OUT = path.resolve(REPO, '../testfiles/generated/partcraft/features-750.partcraft.json');
{
  const I18N = await import(DEV + 'i18n.js');
  I18N.init({ locale: 'en', strings: JSON.parse(fs.readFileSync(DEV + 'lang/en.json', 'utf8')) });
}
const S = await import(DEV + 'sketch.js');
const P = await import(DEV + 'part.js');

const mulberry32 = (a) => () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };

const COLS = 14, PITCH = 40, PLATE_T = 10, CELLS = 184;

/** The plate with `cells` grid cells (4 features each) and, with `patterns`, the last row's four patterns (12 features): 750 = 2 + 184 × 4 + 12. */
export function makePlate(cells = CELLS, patterns = true) {
  const rnd = mulberry32(750);
  const part = P.newPart('Mounting plate, 750 features');
  const add = (type, props) => P.addFeature(part, type, props);
  const onTop = { kind: 'base', name: 'top' };

  const sk0 = S.newSketch();
  S.addRect(sk0, [0, 0], [COLS * PITCH, -COLS * PITCH]);   // top plane: sketch y = −Z
  const plateSk = add('sketch', { plane: onTop, sketch: sk0 });
  const plate = add('extrude', { sketch: plateSk.id, depth: PLATE_T });
  const faceOf = (ext) => ({ kind: 'face', feature: ext.id, face: 'end' });
  const centre = (i) => [(i % COLS) * PITCH + PITCH / 2, -(Math.floor(i / COLS) * PITCH + PITCH / 2)];

  const shape = (sk, kind, c, size) => {
    if (kind === 'rect') S.addRect(sk, [c[0] - size / 2, c[1] - size / 2], [c[0] + size / 2, c[1] + size / 2]);
    else S.addCircle(sk, c, size / 2);
  };
  const holeSketch = (c) => { const sk = S.newSketch(); S.addPoint(sk, c[0], c[1]); return sk; };

  // one cell → { solid: the extrude, hole: the hole } (4 features)
  const cell = (i, atOffset = null) => {
    const c = atOffset ? [centre(0)[0] + atOffset, centre(0)[1]] : centre(i);
    const kind = i % 2 ? 'circle' : 'rect', cut = (i >> 1) % 2 === 1;
    const size = 16 + Math.round(rnd() * 8);          // 16–24 mm in a 40 mm cell
    const depth = cut ? 3 + Math.round(rnd() * 4) : 5 + Math.round(rnd() * 6);
    const sk = S.newSketch();
    shape(sk, kind, c, size);
    const s = add('sketch', { plane: faceOf(plate), sketch: sk });
    const e = add('extrude', { sketch: s.id, op: cut ? 'cut' : 'add', depth });
    // the hole sits on the boss's top / the pocket's floor: the extrude's own end face
    const hs = add('sketch', { plane: faceOf(e), sketch: holeSketch(c) });
    const h = add('hole', { sketch: hs.id, d: 3 + Math.round(rnd() * 3), through: true });
    return { e, h, c, kind, cut, size, depth };
  };
  for (let i = 0; i < cells; i++) cell(i);
  if (!patterns) return part;

  // the last row (slots 184–195, 12 free): four patterns, 3 features each (sketch + feature + pattern)
  const row = (col, count, make) => {
    const i = CELLS + col - 2;   // slot index, only used for the centre
    const c = [col * PITCH + PITCH / 2, -(13 * PITCH + PITCH / 2)];
    const seed = make(c);
    add('lpattern', { seeds: [seed.id], dir: { kind: 'world', axis: 'x' }, count, spacing: PITCH });
    return i;
  };
  row(2, 4, (c) => { const sk = S.newSketch(); S.addRect(sk, [c[0] - 10, c[1] - 10], [c[0] + 10, c[1] + 10]); return add('extrude', { sketch: add('sketch', { plane: faceOf(plate), sketch: sk }).id, depth: 8 }); });
  row(6, 3, (c) => add('hole', { sketch: add('sketch', { plane: faceOf(plate), sketch: holeSketch(c) }).id, d: 5, through: true }));
  row(9, 3, (c) => { const sk = S.newSketch(); S.addCircle(sk, c, 9); return add('extrude', { sketch: add('sketch', { plane: faceOf(plate), sketch: sk }).id, op: 'cut', depth: 4 }); });
  row(12, 2, (c) => { const sk = S.newSketch(); S.addCircle(sk, c, 8); return add('extrude', { sketch: add('sketch', { plane: faceOf(plate), sketch: sk }).id, depth: 6 }); });
  return part;
}

export const make750 = () => makePlate(CELLS, true);

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const part = make750();
  if (part.features.length !== 750) { console.error('expected 750 features, made ' + part.features.length); process.exit(1); }
  if (fs.existsSync(OUT)) console.log('kept ' + OUT + ' (' + fs.statSync(OUT).size + ' bytes)');
  else { fs.mkdirSync(path.dirname(OUT), { recursive: true }); fs.writeFileSync(OUT, P.toJSON(part)); console.log('wrote ' + OUT + ' (' + fs.statSync(OUT).size + ' bytes, 750 features)'); }
}
