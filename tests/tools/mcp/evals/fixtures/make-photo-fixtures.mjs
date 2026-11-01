#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file — developer script. Makes barge.partcraft.json (EG.26), plate-photo.png (a 400 × 250 px plate with 30 px rounded corners and a Ø80 px hole on a 600 × 400 light ground) and blank.partcraft.json, once, for the photo_import eval (EG.38). */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const HERE = path.dirname(fileURLToPath(import.meta.url)), ROOT = path.resolve(HERE, '../../../..');
const R = await import(path.join(ROOT, 'lib/raster/index.js'));
const W = 600, H = 400, data = new Uint8Array(W * H).fill(235);
const inRR = (x, y) => { const x0 = 100, y0 = 75, x1 = 500, y1 = 325, r = 30; if (x < x0 || x > x1 || y < y0 || y > y1) return false; const cx = Math.min(Math.max(x, x0 + r), x1 - r), cy = Math.min(Math.max(y, y0 + r), y1 - r); return (x - cx) ** 2 + (y - cy) ** 2 <= r * r; };
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (inRR(x + 0.5, y + 0.5) && (x + 0.5 - 250) ** 2 + (y + 0.5 - 200) ** 2 > 1600) data[y * W + x] = 30;
const out = path.join(HERE, 'plate-photo.png');
if (!fs.existsSync(out)) fs.writeFileSync(out, await R.writePng({ w: W, h: H, channels: 1, data }));
const blank = path.join(HERE, 'blank.partcraft.json');
if (!fs.existsSync(blank)) fs.writeFileSync(blank, JSON.stringify({ format: 'partcraft', version: 2, name: 'Blank', units: 'mm', resolution: 64, seq: 1, rollback: null, features: [] }, null, 1));
// barge.partcraft.json (EG.26): a 10 × 3 × 4 m box, length along X, up Y, across Z — built once by PartCraft's own sketch and extrude
const barge = path.join(HERE, 'barge.partcraft.json');
if (!fs.existsSync(barge)) {
  const S = await import(path.join(ROOT, 'public_html/assets/apps/partcraft/dev/sketch.js'));
  const P = await import(path.join(ROOT, 'public_html/assets/apps/partcraft/dev/part.js'));
  const part = P.newPart('Barge'), sk = S.newSketch();
  S.addRect(sk, [0, 0], [10000, 3000]);
  const s1 = P.addFeature(part, 'sketch', { plane: { kind: 'base', name: 'front' }, sketch: sk });
  P.addFeature(part, 'extrude', { sketch: s1.id, depth: 4000, end: 'mid' });
  fs.writeFileSync(barge, JSON.stringify(JSON.parse(P.toJSON(part)), null, 1));
}
console.log('fixtures ready');
