#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * tools/detailcraft-test/perf-11.mjs (0.11 PERF.36) — what one edit costs on a big model, in Node, the release's modules (0.10) against the lab's (dev), same file, same
 * machine, one app per child process (so neither sees the other's heap). Per app: read the file, cold build + markParts, then the work an edit does (Model.change through
 * the Tx, build with the cache the page keeps, markParts, undo, redo), the Tx lookups by id (2,000 holes and 2,000 base plates in one change), and clashCheck.
 *   node tools/detailcraft-test/perf-11.mjs --file <model.json> [--root <dir with 0.10/ and dev/>] [--edits 5] [--out <json>]
 * Run on workstation11a for the 28,500-member model (rule 68): see docs/0.11-sessions/detail-11.md for the command.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const here = path.dirname(fileURLToPath(import.meta.url));
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const FILE = arg('--file', '/var/www/CADCRAFT/testfiles/generated/detail/grid24x12x5.detailcraft.json');
const ROOT = arg('--root', path.resolve(here, '../../public_html/assets/apps/detailcraft'));
const EDITS = Number(arg('--edits', 5));
const ms = (t0) => Math.round((performance.now() - t0) * 10) / 10;

async function one(app) {
  const dir = path.join(ROOT, app) + '/';
  const mod = (f) => import(pathToFileURL(dir + f).href);
  const I = await mod('i18n.js');
  I.init({ locale: 'en', strings: JSON.parse(fs.readFileSync(dir + 'lang/en.json', 'utf8')) });
  const [Md, B, Mk, K] = await Promise.all([mod('model.js'), mod('build.js'), mod('marks.js'), mod('clash.js')]);
  const out = { app, file: path.basename(FILE), machine: os.hostname() + ' ' + os.cpus()[0].model + ' x' + os.cpus().length, load: os.loadavg().map((x) => Math.round(x * 10) / 10), node: process.version };
  const text = fs.readFileSync(FILE, 'utf8');
  let t = performance.now(); const r = Md.readModel(text); out.read_ms = ms(t);
  const state = r.state || r;
  // readModel keeps at most 20,000 members and 20,000 connections (model.js, a product limit); a bigger file is measured whole: the stored rows are already in the clean shape
  const raw = JSON.parse(text);
  if (raw.members.length > state.members.length) { state.members = raw.members; state.connections = raw.connections; state.seq = Math.max(state.seq || 1, raw.seq || 1); out.uncapped = true; }
  out.members = state.members.length; out.connections = state.connections.length;
  const model = new Md.Model(state);
  const cache = {};
  let lastV = -1;
  const rebuild = () => { const a = performance.now(); const dirty = model.dirtySince ? model.dirtySince(lastV) : null; lastV = model.version; const built = B.build(model.state, { cache, dirty }); const b = performance.now(); const marks = Mk.markParts(built, { perPhase: true }); return { built, marks, build: b - a, marks_ms: performance.now() - b }; };
  t = performance.now(); let cur = rebuild(); out.cold = { build_ms: Math.round(cur.build), marks_ms: Math.round(cur.marks_ms), parts: cur.built.parts.length };
  const beams = state.members.filter((m) => m.type === 'beam');
  const rows = [];
  for (let i = 0; i < EDITS; i++) {
    const id = beams[(i * 7919) % beams.length].id;
    t = performance.now(); model.change('edit', (tx) => tx.updateMember(id, { material: i % 2 ? 'A992' : 'A36' })); const ch = ms(t);
    cur = rebuild();
    rows.push({ change: ch, build: Math.round(cur.build * 10) / 10, marks: Math.round(cur.marks_ms * 10) / 10 });
  }
  const med = (k) => rows.map((x) => x[k]).sort((a, b) => a - b)[Math.floor(rows.length / 2)];
  out.edit = { change_ms: med('change'), build_ms: med('build'), marks_ms: med('marks'), total_ms: Math.round((med('change') + med('build') + med('marks')) * 10) / 10, rows };
  t = performance.now(); model.undo(); out.undo_ms = ms(t); cur = rebuild(); out.after_undo_rebuild_ms = Math.round(cur.build + cur.marks_ms);
  t = performance.now(); model.redo(); out.redo_ms = ms(t);
  // Tx lookups by id: 2,000 holes on different members, then 2,000 base plates (the columns have them already: each is refused, which is the duplicate check)
  const cols = state.members.filter((m) => m.type === 'column');
  t = performance.now(); model.change('holes', (tx) => { for (let i = 0; i < 2000; i++) tx.addHole(beams[(i * 13) % beams.length].id, { face: 'web', x: 300 + (i % 50), y: 0, d: 20 }); }); out.tx_2000_holes_ms = ms(t);
  t = performance.now(); let refused = 0; model.change('bases', (tx) => { for (let i = 0; i < 2000; i++) { try { tx.addConnection({ type: 'baseplate', column: cols[(i * 17) % cols.length].id }); } catch (e) { refused++; } } }); out.tx_2000_baseplates_ms = ms(t); out.tx_refused = refused;
  t = performance.now(); const cc = K.clashCheck(model.state, cur.built); out.clash_ms = ms(t); out.clashes = cc?.clashes?.length ?? cc?.length;
  out.heapMB = Math.round(process.memoryUsage().heapUsed / 1048576);
  console.log(JSON.stringify(out));
}

if (process.argv.includes('--one')) { await one(arg('--one')); process.exit(0); }
const all = [];
for (const app of ['0.10', 'dev']) {
  const r = spawnSync('node', ['--max-old-space-size=8000', process.argv[1], '--one', app, '--file', FILE, '--root', ROOT, '--edits', String(EDITS)], { encoding: 'utf8', maxBuffer: 1e8 });
  const line = (r.stdout || '').trim().split('\n').pop();
  try { const o = JSON.parse(line); all.push(o); console.log(app.padEnd(5), `${o.members} members: read ${o.read_ms} ms; cold build ${o.cold.build_ms} + marks ${o.cold.marks_ms}; edit: change ${o.edit.change_ms} + build ${o.edit.build_ms} + marks ${o.edit.marks_ms} = ${o.edit.total_ms} ms; undo ${o.undo_ms}; redo ${o.redo_ms}; 2,000 holes ${o.tx_2000_holes_ms}; 2,000 base plates ${o.tx_2000_baseplates_ms} (${o.tx_refused} refused); clash ${o.clash_ms} ms; heap ${o.heapMB} MB; ${o.machine}; load ${o.load.join('/')}`); }
  catch (e) { console.log(app, 'ERROR', (r.stderr || '').split('\n').slice(0, 3).join(' | ').slice(0, 300)); }
}
const o = arg('--out'); if (o) fs.writeFileSync(o, JSON.stringify(all, null, 1));
