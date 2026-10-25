#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * make-configurator-showcase.mjs — makes fixtures/showcase/partcraft-configurator.partcraft.json ONCE (0.7 W3.19; CC0, ours):
 * a mounting plate with two bolt holes (tools/partcraft-cli/examples/bracket.pcscript) saved with four configurations — Small,
 * Medium, Large and "Medium, no holes" (which turns the Bolts feature off) — for the variant pack and the configurator page.
 * Refuses to overwrite; `--check` rebuilds in memory and compares.
 *   node tools/partcraft-test/make-configurator-showcase.mjs [--check]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '../..');
const DEV = path.join(REPO, 'public_html/assets/apps/partcraft/dev/');
const OUT = path.join(REPO, 'fixtures/showcase/partcraft-configurator.partcraft.json');
const check = process.argv.includes('--check');
if (fs.existsSync(OUT) && !check) { console.log('exists, left as it is: ' + OUT); process.exit(0); }
const I18N = await import(DEV + 'i18n.js');
I18N.init({ locale: 'en', strings: JSON.parse(fs.readFileSync(DEV + 'lang/en.json', 'utf8')) });
const P = await import(DEV + 'part.js'), SC = await import(DEV + 'script.js'), CF = await import(DEV + 'configs.js');
const src = fs.readFileSync(path.join(REPO, 'tools/partcraft-cli/examples/bracket.pcscript'), 'utf8');
const part = SC.scriptToPart(src).part;
part.name = 'Mounting plate';
const bolts = part.features.find((f) => f.name === 'Bolts');
let cfg = null;
for (const row of [
  { name: 'Small', values: { width: 80, depth: 50, thick: 6 } },
  { name: 'Medium', values: { width: 120, depth: 60, thick: 8 } },
  { name: 'Large', values: { width: 180, depth: 90, thick: 10 } },
  { name: 'Medium, no holes', values: { width: 120, depth: 60, thick: 8 }, off: [bolts.id] },
]) cfg = CF.saveRow(cfg, row);
part.configs = { ...cfg, active: 'Medium' };
const text = P.toJSON(part) + '\n';
if (check) { const same = fs.existsSync(OUT) && fs.readFileSync(OUT, 'utf8') === text; console.log(same ? 'same' : 'DIFFERS'); process.exit(same ? 0 : 1); }
fs.writeFileSync(OUT, text);
console.log(`wrote ${OUT} (${text.length} bytes)`);
