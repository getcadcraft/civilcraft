#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * tools/detailcraft-test/perf-10.mjs (0.10 PERF.36 / FX.144; the wave-3 tool with --app <0.9|dev>) — what each of DetailCraft's open-time functions costs on a big model, in Node, one
 * function per child process with a time cap (0.9 PERF wave 3, track apps-3d). The release's own modules
 * (public_html/assets/apps/detailcraft/current/*.js, DOM-free) on a generated model from tools/perf/gen/detail-grid.mjs.
 * refresh() in detailcraft.js:354 runs most of these after EVERY edit: build → markParts → bendingSchedule → the panels'
 * problems() (erection plan, autopilot propose, constructability, dcProblems) → the report.
 *
 *   node tools/detailcraft-test/perf-10.mjs [--file <model.json>] [--cap 180] [--only build,marks,…]
 *   node tools/detailcraft-test/perf-10.mjs --one <name> --file <model.json>      (one function, used by the parent)
 */
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';

const APP_NAME = (() => { const i = process.argv.indexOf('--app'); return i > 0 ? process.argv[i + 1] : 'dev'; })();
const APP = '/var/www/CADCRAFT/getcadcraft.com/public_html/assets/apps/detailcraft/' + APP_NAME + '/';
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const FILE = arg('--file', '/var/www/CADCRAFT/testfiles/generated/detail/grid24x12x5.detailcraft.json');
const CAP = Number(arg('--cap', 180));
const NAMES = ['read', 'stringify', 'build', 'marks', 'schedule', 'dcProblems', 'constructability', 'erectionPlan', 'autopilot', 'clash', 'drawings', 'writeIfc', 'nc'];

async function one(name) {
  const mod = (f) => import(pathToFileURL(path.join(APP, f)).href);
  const I18N = await mod('i18n.js');
  I18N.init({ locale: 'en', strings: JSON.parse(fs.readFileSync(APP + 'lang/en.json', 'utf8')) });
  const Md = await mod('model.js'), B = await mod('build.js'), Mk = await mod('marks.js'), Rb = await mod('rebar.js');
  const text = fs.readFileSync(FILE, 'utf8');
  const time = (fn) => { const t0 = performance.now(); const v = fn(); return [performance.now() - t0, v]; };
  let state = Md.readModel(text); state = state.state || state;
  const out = { name, members: state.members.length, connections: state.connections.length };
  if (name === 'read') { const [ms] = time(() => Md.readModel(text)); out.ms = ms; out.note = 'readModel (parse + clean)'; }
  else if (name === 'stringify') { const [ms, s] = time(() => JSON.stringify(state)); out.ms = ms; out.note = 'JSON.stringify(state) x1 (Model.change does it twice per edit) = ' + (s.length / 1048576).toFixed(1) + ' MB'; }
  else {
    const [bms, built] = time(() => B.build(state)); out.build_ms = Math.round(bms); out.parts = built.parts.length; out.bolts = built.bolts.length;
    if (name === 'build') { out.ms = bms; out.note = 'build(state): parts, holes, bolts, welds'; }
    else {
      const [mms, marks] = time(() => Mk.markParts(built, { perPhase: true })); out.marks_ms = Math.round(mms);
      if (name === 'marks') { out.ms = mms; out.note = 'markParts (identical parts share a mark)'; }
      else if (name === 'schedule') { const [ms] = time(() => Rb.bendingSchedule(state.footings)); out.ms = ms; out.note = 'bendingSchedule(footings)'; }
      else if (name === 'dcProblems') { const P = await mod('problems-detailcraft.js'); const [ms, r] = time(() => P.dcProblems(built, state)); out.ms = ms; out.note = 'dcProblems → ' + r.length; }
      else if (name === 'constructability') { const C = await mod('constructability.js'); const [ms, r] = time(() => C.constructability(state, built)); out.ms = ms; out.note = 'constructability → ' + (r?.items?.length ?? r?.length ?? '?'); }
      else if (name === 'erectionPlan') { const E = await mod('erection.js'); const [ms, r] = time(() => E.plan(state, built, marks, E.emptySetup())); out.ms = ms; out.note = 'erection plan → ' + (r?.picks?.length ?? '?') + ' picks'; }
      else if (name === 'autopilot') { const A = await mod('autopilot.js'); const [ms, r] = time(() => A.propose(state)); out.ms = ms; out.note = 'autopilot propose → ' + (r?.items?.length ?? '?'); }
      else if (name === 'clash') { const K = await mod('clash.js'); const [ms, r] = time(() => K.clashCheck(state, built)); out.ms = ms; out.note = 'clashCheck → ' + (r?.clashes?.length ?? '?'); }
      else if (name === 'drawings') { const D = await mod('drawings.js'); const [ms, r] = time(() => D.drawingSet(state, built, marks, { date: '2026-11-08' })); out.ms = ms; out.note = 'drawingSet → ' + (r?.sheets?.length ?? (Array.isArray(r) ? r.length : '?')) + ' sheets'; }
      else if (name === 'writeIfc') { const I = await mod('ifc.js'); const [ms, r] = time(() => I.writeIfc(state, built, marks, Rb.bendingSchedule(state.footings), {})); out.ms = ms; out.note = 'writeIfc → ' + (r.length / 1048576).toFixed(1) + ' MB'; }
      else if (name === 'nc') { const N = await mod('nc1.js'); const fn = N.ncFiles || N.nc1Files || N.dstvFiles || Object.values(N).find((f) => typeof f === 'function'); const [ms, r] = time(() => fn(built, marks, state)); out.ms = ms; out.note = (fn.name || 'nc1') + ' → ' + (r?.files?.length ?? r?.length ?? '?'); }
    }
  }
  out.ms = Math.round(out.ms); out.heapMB = Math.round(process.memoryUsage().heapUsed / 1048576);
  console.log(JSON.stringify(out));
}

if (process.argv.includes('--one')) { await one(arg('--one')); process.exit(0); }
const only = arg('--only', null)?.split(',');
console.log(`DetailCraft ${path.basename(FILE)} (${(fs.statSync(FILE).size / 1048576).toFixed(1)} MB), cap ${CAP} s per function`);
for (const n of NAMES) {
  if (only && !only.includes(n)) continue;
  const t0 = Date.now();
  const r = spawnSync('timeout', [String(CAP), 'node', '--max-old-space-size=8000', process.argv[1], '--one', n, '--file', FILE, '--app', APP_NAME], { encoding: 'utf8' });
  const line = (r.stdout || '').trim().split('\n').pop();
  if (r.status === 124) console.log(`  ${n.padEnd(16)} NOT DONE in ${CAP} s`);
  else if (r.status !== 0) console.log(`  ${n.padEnd(16)} ERROR ${(r.stderr || '').split('\n').find((l) => /Error|error/.test(l))?.slice(0, 160) || r.status}`);
  else { try { const o = JSON.parse(line); console.log(`  ${n.padEnd(16)} ${String(o.ms).padStart(7)} ms  ${o.note || ''}${o.build_ms !== undefined && n !== 'build' ? `  (after build ${o.build_ms} ms${o.marks_ms !== undefined && n !== 'marks' ? ' + marks ' + o.marks_ms + ' ms' : ''})` : ''}  heap ${o.heapMB} MB  [${Date.now() - t0} ms wall]`); } catch { console.log(`  ${n.padEnd(16)} ? ${line.slice(0, 160)}`); } }
}
