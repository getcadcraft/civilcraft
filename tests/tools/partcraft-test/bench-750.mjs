#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * bench-750.mjs — D7.51: times the 750-feature part (testfiles/generated/partcraft/features-750.partcraft.json, made once by
 * gen-750.mjs) on the DOM-free side: open (readPart), full rebuild, rebuild up to a middle feature, one parameter edit +
 * rebuild, undo-history push/undo, save (toJSON). Prints `uptime` beside the numbers: VPS, capped, never copy.
 *   node tools/partcraft-test/bench-750.mjs [--profile]
 */
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '../..');
const DEV = path.join(REPO, 'public_html/assets/apps/partcraft/dev/');
const F = await import('./fixtures.mjs');   // loads the English strings
const P = await import(DEV + 'part.js');
const K = await import(DEV + 'kernel.js');
const { OUT } = await import('./gen-750.mjs');
const { default: Module } = await import(path.join(REPO, 'public_html/assets/vendor/manifold-3d/current/manifold.js'));
const M = await Module(); M.setup();
if (!fs.existsSync(OUT)) { console.log('skip: ' + OUT + ' missing (node tools/partcraft-test/gen-750.mjs)'); process.exit(0); }
const ms = (f) => { const t = performance.now(); const r = f(); return [performance.now() - t, r]; };
const text = fs.readFileSync(OUT, 'utf8');
const out = {};
let part;
[out.open_ms, part] = ms(() => P.readPart(JSON.parse(text)));
let r;
[out.rebuild_ms, r] = ms(() => K.regenerate(part, M));
const r0 = K.regenerate(part, M, { checkpoints: false });
out.same_as_uncached = r0.stats.volume === r.stats.volume && r0.stats.tris === r.stats.tris && r0.faces.length === r.faces.length;
const bad = [...r.results.values()].filter((x) => x.status !== 'ok');
out.features = part.features.length; out.bad = bad.length; out.firstBad = bad[0]?.message;
out.tris = r.stats?.tris; out.bodies = r.stats?.bodies; out.faces = r.stats?.faces; out.volume = r.stats?.volume;
[out.rebuild2_ms] = ms(() => K.regenerate(part, M));
[out.rebuild_upTo_half_ms] = ms(() => K.regenerate(part, M, { upTo: 375 }));
const h = new P.History();
[out.history_push_ms] = ms(() => h.push(part, 'x'));
out.snapshot_bytes = h.undoStack[0].json.length;
for (let i = 0; i < 199; i++) h.push(part, 'x');
out.history_200_mb = +(h.undoStack.reduce((a, s) => a + s.json.length, 0) / 1e6).toFixed(1);
let u; [out.undo_ms, u] = ms(() => h.undo(part));
[out.save_ms] = ms(() => P.toJSON(part));
// a parameter edit near the end and near the start
const ex = part.features.filter((f) => f.type === 'extrude');
ex[ex.length - 1].depth += 1; [out.edit_last_rebuild_ms] = ms(() => K.regenerate(part, M));
ex[0].depth += 0.5; [out.edit_plate_rebuild_ms] = ms(() => K.regenerate(part, M));
for (const k in out) if (typeof out[k] === 'number') out[k] = +out[k].toFixed(1);
console.log(JSON.stringify(out, null, 1));
console.log('uptime: ' + fs.readFileSync('/proc/loadavg', 'utf8').trim() + ' cpus=' + os.cpus().length + ' (VPS, capped)');
