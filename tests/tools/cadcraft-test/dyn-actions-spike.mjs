#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * dyn-actions-spike.mjs — 0.5 DB.6 spike: how a dynamic block reference's copy differs from its definition, entity by
 * entity, beside the reference's parameter values; and each action's selection set (read from its handle list).
 *   node tools/cadcraft-test/dyn-actions-spike.mjs [file.dwg]
 * Test tooling only. Findings: docs/0.5-sessions/cad-draw.md § DB.6.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const APP = path.join(REPO, 'public_html/assets/apps/cadcraft/dev/');
const load = (f) => import(pathToFileURL(APP + f).href);
const file = process.argv[2] || '/var/www/CADCRAFT/testfiles/dwg-samples/blocks_and_tables_-_imperial.dwg';
if (!fs.existsSync(file)) { console.log('no sample: ' + file); process.exit(0); }
const I18n = await load('i18n.js'); I18n.init({ strings: JSON.parse(fs.readFileSync(APP + 'lang/en.json', 'utf8')) });
const { Doc } = await load('doc.js'); const { readDwg } = await load('dwg/read.js'); const { importDwg } = await load('dwg-import.js');
const d = new Doc(); d.load(importDwg(readDwg(new Uint8Array(fs.readFileSync(file))), { versionTag: 'AC1021' }));
const pts = (e) => { switch (e.type) { case 'line': return [[e.x1, e.y1], [e.x2, e.y2]]; case 'poly': return e.pts.map((p) => [p.x, p.y]); case 'arc': case 'circle': return [[e.cx, e.cy]]; case 'text': case 'insert': return [[e.x, e.y]]; default: return []; } };
const seen = new Set();
for (const e of d.model.values()) {
  if (e.type !== 'insert' || !e.dyn) continue;
  const B = d.blocks.get(e.block), def = B.dyn.def ? B : d.blocks.get(B.dyn.of);
  if (!def || def.dyn.vis || seen.has(e.block)) continue;
  seen.add(e.block);
  const vals = (e.dyn.values || []).map((v) => v.kind + (v.distance !== undefined ? ':' + v.distance.toFixed(3) : '') + (v.flipped !== undefined ? ':f' + v.flipped : '') + (v.angle !== undefined ? ':a' + v.angle.toFixed(3) : '')).join(' ');
  const diffs = [];
  B.dyn.all.forEach((parts, i) => { const dp = def.dyn.all[i]; if (!dp || !parts) return; parts.forEach((x, j) => { const y = dp[j]; if (!y) return; const a = pts(x), b = pts(y); const mv = a.map((p, k) => (b[k] ? [+(p[0] - b[k][0]).toFixed(3), +(p[1] - b[k][1]).toFixed(3)] : null)); if (mv.some((m) => m && (m[0] || m[1]))) diffs.push(i + ':' + x.type + JSON.stringify(mv)); }); });
  console.log(def.name + ' via ' + e.block + ' | ' + vals + ' | ' + (diffs.join('  ') || 'same as definition'));
}
