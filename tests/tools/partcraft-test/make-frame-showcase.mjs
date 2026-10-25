#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * make-frame-showcase.mjs — makes fixtures/showcase/partcraft-frame.partcraft.json ONCE (0.7 D7.50; CC0, ours): a welded table
 * frame — a 900 × 500 top rectangle on a plane 750 up and four legs drawn on two front planes — as one Structural member of
 * HSS2x2x1/4, mitred, 6 mm caps on the feet, plus a crossbar sketch left unticked (tick it in the panel to add it). Refuses to
 * overwrite; `--check` rebuilds in memory and compares.
 *   node tools/partcraft-test/make-frame-showcase.mjs [--check]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '../..');
const DEV = path.join(REPO, 'public_html/assets/apps/partcraft/dev/');
const OUT = path.join(REPO, 'fixtures/showcase/partcraft-frame.partcraft.json');
const check = process.argv.includes('--check');
if (fs.existsSync(OUT) && !check) { console.log('exists, left as it is: ' + OUT); process.exit(0); }
const I18N = await import(DEV + 'i18n.js');
I18N.init({ locale: 'en', strings: JSON.parse(fs.readFileSync(DEV + 'lang/en.json', 'utf8')) });
const P = await import(DEV + 'part.js'), S = await import(DEV + 'sketch.js');
const part = P.newPart('Table frame');
const top = S.newSketch(); const rt = S.addRect(top, [0, 0], [900, 500]);
const sTop = P.addFeature(part, 'sketch', { plane: { kind: 'fixed', o: [0, 750, 0], n: [0, 1, 0] }, sketch: top });
const legs = () => { const sk = S.newSketch(); const a = S.addLine(sk, [0, 0], [0, 750]), b = S.addLine(sk, [900, 0], [900, 750]); return { sk, ids: [a.id, b.id] }; };
const L1 = legs(), L2 = legs();
const s1 = P.addFeature(part, 'sketch', { plane: { kind: 'fixed', o: [0, 0, 0], n: [0, 0, 1] }, sketch: L1.sk });
const s2 = P.addFeature(part, 'sketch', { plane: { kind: 'fixed', o: [0, 0, -500], n: [0, 0, 1] }, sketch: L2.sk });
const xb = S.newSketch(); S.addLine(xb, [450, 0], [450, 500]);
P.addFeature(part, 'sketch', { plane: { kind: 'fixed', o: [0, 750, 0], n: [0, 1, 0] }, sketch: xb });
P.addFeature(part, 'member', { segs: [...rt.lines.map((l) => ({ sketch: sTop.id, line: l })), ...L1.ids.map((l) => ({ sketch: s1.id, line: l })), ...L2.ids.map((l) => ({ sketch: s2.id, line: l }))], section: 'HSS2X2X1/4', corner: 'miter', caps: { t: 6 } });
const text = P.toJSON(part) + '\n';
if (check) { const same = fs.existsSync(OUT) && fs.readFileSync(OUT, 'utf8') === text; console.log(same ? 'same' : 'DIFFERS'); process.exit(same ? 0 : 1); }
fs.writeFileSync(OUT, text);
console.log(`wrote ${OUT} (${text.length} bytes)`);
