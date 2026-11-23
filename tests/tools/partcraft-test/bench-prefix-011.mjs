#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * bench-prefix-011.mjs — PERF.39 (0.11 session `model-part-11`): what the checkpoint keys cost. kernel.js prefixKeys stringifies and
 * hashes every feature on every rebuild; the row asked for a per-feature revision so an edit near the end does not rehash all of them.
 * This times, on the 750-feature part (testfiles/generated/partcraft/features-750.partcraft.json): the same stringify + hash pass the
 * kernel does, a rebuild after an edit of the last extrude (checkpoints on), the same with checkpoints off, and an unchanged rebuild.
 *   PC_EXACT=0 nice -n 10 node tools/partcraft-test/bench-prefix-011.mjs [--runs 5]
 * Prints one RESULT line (JSON, with the load average). No timing is asserted.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '../..');
const DEV = path.join(REPO, 'public_html/assets/apps/partcraft/dev/');
await import('./fixtures.mjs');
const P = await import(DEV + 'part.js');
const K = await import(DEV + 'kernel.js');
const { default: Module } = await import(path.join(REPO, 'public_html/assets/vendor/manifold-3d/current/manifold.js'));
const M = await Module(); M.setup();
const F750 = path.resolve(REPO, '..', 'testfiles/generated/partcraft/features-750.partcraft.json');
if (!fs.existsSync(F750)) { console.log('skip: ' + F750 + ' missing (node tools/partcraft-test/gen-750.mjs)'); process.exit(0); }
const runs = +(process.argv.includes('--runs') ? process.argv[process.argv.indexOf('--runs') + 1] : 5);
const med = (a) => a.slice().sort((x, y) => x - y)[a.length >> 1];
const time = (f) => { const t = performance.now(); f(); return performance.now() - t; };
const part = P.readPart(JSON.parse(fs.readFileSync(F750, 'utf8')));
K.regenerate(part, M);
const hashPass = () => { let h1 = 1, h2 = 2; for (const f of part.features) { const s = JSON.stringify(f); for (let i = 0; i < s.length; i++) { const c = s.charCodeAt(i); h1 = Math.imul(h1 ^ c, 2654435761); h2 = Math.imul(h2 ^ c, 1597334677); } } return h1 ^ h2; };
const ex = part.features.filter((f) => f.type === 'extrude'), last = ex[ex.length - 1];
const out = { features: part.features.length, load: os.loadavg().map((x) => x.toFixed(2)).join(' ') };
out.hash_pass_ms = +med(Array.from({ length: 20 }, () => time(hashPass))).toFixed(2);
out.unchanged_rebuild_ms = +med(Array.from({ length: runs }, () => time(() => K.regenerate(part, M)))).toFixed(1);
out.edit_last_ms = +med(Array.from({ length: runs }, () => { last.depth += 0.25; return time(() => K.regenerate(part, M)); })).toFixed(1);
out.edit_last_no_checkpoints_ms = +med(Array.from({ length: runs }, () => { last.depth += 0.25; return time(() => K.regenerate(part, M, { checkpoints: false })); })).toFixed(1);
out.hash_share_of_edit_last = +(out.hash_pass_ms / out.edit_last_ms).toFixed(3);
console.log('RESULT ' + JSON.stringify(out));
