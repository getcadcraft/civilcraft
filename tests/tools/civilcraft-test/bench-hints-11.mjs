#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * bench-hints-11.mjs — CivilCraft 0.11 PERF.21 (perf-finish-11, lane civil): what one undo step of a hot edit costs with and without its hint,
 * on survey-500k (500,000 points) + N features in the state (the bench-10 set-up). Each edit is the one the page's caller makes (grip move of an
 * alignment PI, a pad corner, a feature vertex, a property edit, a point move). "full" = the same edit with no hint (what the code did before:
 * the step looked at every chunk), "hinted" = with the caller's hint. Medians of --edits runs, alternated. The two records are compared too.
 *   node --expose-gc tools/civilcraft-test/bench-hints-11.mjs [--bulk 20000] [--edits 40]
 */
import fs from 'node:fs';
import path from 'node:path';
import { registerHooks } from 'node:module';
import { pathToFileURL } from 'node:url';
const REPO = '/var/www/CADCRAFT/getcadcraft.com';
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const APP = path.join(REPO, 'public_html/assets/apps/civilcraft/dev');
(await import(pathToFileURL(path.join(APP, 'i18n.js')).href)).init({ strings: JSON.parse(fs.readFileSync(path.join(APP, 'lang/en.json'), 'utf8')) });
const manifest = JSON.parse(fs.readFileSync(path.join(APP, 'manifest.json'), 'utf8'));
registerHooks({ resolve(spec, ctx, next) { const m = manifest.imports?.[spec]; if (m) return { url: pathToFileURL(path.join(REPO, 'public_html', m)).href, shortCircuit: true }; return next(spec, ctx); } });
const { Project } = await import(pathToFileURL(path.join(APP, 'project.js')).href);
const { movePoint } = await import(pathToFileURL(path.join(APP, 'point-edit.js')).href);
const BULK = Number(arg('--bulk', 20000)), EDITS = Number(arg('--edits', 40));
const p = Project.fromJSON(JSON.parse(fs.readFileSync('/var/www/CADCRAFT/testfiles/generated/civil/survey-500k.civilcraft.json', 'utf8'))).project;
p.change('seed', (s) => {
  for (let i = 0; i < BULK; i++) s.features.push({ id: 'f' + (i + 1000), name: 'Feature ' + i, pts: [{ x: i, y: 0, z: 1 }, { x: i, y: 9, z: 2 }, { x: i + 3, y: 9, z: 2 }], closed: false, use: 'off', daylight: false, cut: 2, fill: 3 });
  for (let i = 0; i < 50; i++) s.alignments.push({ id: 'a' + (i + 1), name: 'A' + i, start: 0, pis: [{ x: i, y: 0, r: 0 }, { x: i + 100, y: 50, r: 30 }, { x: i + 200, y: 0, r: 0 }], pvis: [{ sta: 0, z: 10, L: 0 }, { sta: 200, z: 11, L: 0 }] });
  for (let i = 0; i < 200; i++) s.pads.push({ id: 'd' + (i + 100), name: 'P' + i, pts: [{ x: i, y: i }, { x: i + 20, y: i }, { x: i + 20, y: i + 20 }], z: 12, cut: 2, fill: 3 });
});
p.undoStack = []; p.redoStack = [];
const med = (a) => { const s = [...a].sort((x, y) => x - y); return +s[Math.floor(s.length / 2)].toFixed(2); };
const time = (f) => { const t0 = performance.now(); f(); return performance.now() - t0; };
const rec = () => { const r = p.undoStack.at(-1).rec; return JSON.stringify([[...r.undo].sort(), [...r.redo].sort()]); };
const cases = {
  'grip: alignment PI': (i, hint) => p.change('Move PI', () => { const a = p.state.alignments.find((x) => x.id === 'a7'); a.pis[1].x = 1000.5 + i; }, hint ? { keys: p.keysOf('alignments', 'a7') } : {}),
  'grip: pad corner': (i, hint) => p.change('Move corner', () => { const d = p.state.pads.find((x) => x.id === 'd150'); d.pts[0].x = 1000.5 + i; }, hint ? { keys: p.keysOf('pads', 'd150') } : {}),
  'grip: feature vertex': (i, hint) => p.change('Move vertex', () => { const f = p.state.features.find((x) => x.id === 'f9000'); f.pts[1].x = 1000.5 + i; }, hint ? { keys: p.keysOf('features', 'f9000') } : {}),
  'props: feature replace': (i, hint) => p.change('Feature', (s) => { const k = s.features.findIndex((x) => x.id === 'f12000'); s.features[k] = { ...s.features[k], name: 'N' + i, id: 'f12000' }; }, hint ? { keys: p.keysOf('features', 'f12000') } : {}),
  'props: feature delete+undo': (i, hint) => { p.change('Delete', (s) => { s.features = s.features.filter((x) => x.id !== 'f5000'); }, hint ? { keys: p.listKeys('features', 'f5000') } : {}); },
};
const out = { file: 'survey-500k', points: p.points.length, features: p.state.features.length, stateMB: +(JSON.stringify(p.state).length / 1048576).toFixed(1), edits: EDITS, rows: {} };
for (const [name, f] of Object.entries(cases)) {
  const full = [], hinted = []; let same = true;
  for (let i = 0; i < EDITS; i++) {
    const a = time(() => f(i, false)); const ra = rec(); p.undo();
    const b = time(() => f(i, true)); if (ra !== rec()) same = false; p.undo();
    full.push(a); hinted.push(b);
  }
  out.rows[name] = { fullMs: med(full), hintedMs: med(hinted), sameRecord: same };
}
{ // consecutive hinted edits with no undo between (a run of grip drags): lib/history keeps the list's id index between calls (scale-shell, perf-finish-11)
  const run = [];
  for (let i = 0; i < EDITS; i++) run.push(time(() => p.change('Move vertex', () => { const f = p.state.features.find((x) => x.id === 'f9000'); f.pts[1].x = 2000.5 + i; }, { keys: p.keysOf('features', 'f9000') })));
  out.rows['grip: feature vertex, consecutive'] = { fullMs: null, hintedMs: med(run.slice(1)) };
  for (let i = 0; i < EDITS; i++) p.undo();
}
{ const full = [], hinted = [];   // point move: editPoints (the step copies the 500k array either way)
  for (let i = 0; i < EDITS; i++) {
    const n = String(1 + i), idx = p.points.findIndex((q) => q.n === n);
    full.push(time(() => p.editPoints('Move point', (pts) => { pts[idx] = { ...pts[idx], x: pts[idx].x + 1 }; return pts; })));
    hinted.push(time(() => movePoint(p, n, p.points[idx].x + 1, p.points[idx].y)));
  }
  out.rows['point move (editPoints)'] = { fullMs: med(full), hintedMs: med(hinted) };
}
console.log(JSON.stringify(out, null, 1));
