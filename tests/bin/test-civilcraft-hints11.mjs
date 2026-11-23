#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-civilcraft-hints11.mjs — CivilCraft 0.11 PERF.21 (perf-finish-11, lane civil): hinted undo steps.
 * Project.change(label, fn, { keys }) and editPoints(label, fn, { keys }) make the step from the chunks the hint names only. Checked here:
 *   - on random edits of alignments, pads, features, masses, the network and points, a hinted project and an unhinted twin make the same steps
 *     (same chunk records) and stay equal through undo and redo (the state JSON and the file JSON);
 *   - Project.verifyHints throws on a hint that misses a change (a hint that names the wrong object);
 *   - a 'change' listener that edits the state and says so with touch() (the landscape links) is joined to the step by the full look;
 *   - keysOf() names the objects (edits in place), listKeys() also the list's order (adds, deletes); a list whose ids repeat is one chunk and still records;
 *   - a hint that says "in place" for an add is caught by the check.
 *   node bin/test-civilcraft-hints11.mjs [--build dev]
 */
import fs from 'node:fs';
import path from 'node:path';
import { registerHooks } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const arg = (k) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null; };
const APP = path.join(REPO, 'public_html/assets/apps/civilcraft', arg('--build') || 'dev');
(await import(pathToFileURL(path.join(APP, 'i18n.js')).href)).init({ strings: JSON.parse(fs.readFileSync(path.join(APP, 'lang/en.json'), 'utf8')) });
const manifest = JSON.parse(fs.readFileSync(path.join(APP, 'manifest.json'), 'utf8'));
registerHooks({ resolve(spec, ctx, next) { const m = manifest.imports?.[spec]; if (m) return { url: pathToFileURL(path.join(REPO, 'public_html', m)).href, shortCircuit: true }; return next(spec, ctx); } });
const { Project } = await import(pathToFileURL(path.join(APP, 'project.js')).href);
const { movePoint } = await import(pathToFileURL(path.join(APP, 'point-edit.js')).href);
let pass = 0, fail = 0;
const ok = (c, m, x) => { if (c) pass++; else { fail++; console.log('FAIL', m, x === undefined ? '' : JSON.stringify(x).slice(0, 300)); } };
let seed = 11; const rnd = () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32;
const ri = (n) => Math.floor(rnd() * n);

function seedProject() {
  const p = new Project();
  p.setPoints(Array.from({ length: 300 }, (_, i) => ({ n: String(i + 1), x: rnd() * 500, y: rnd() * 500, z: 10 + rnd() * 5, d: i % 7 ? 'GND' : 'EP' })), 'seed');
  p.change('seed', (s) => {
    for (let i = 0; i < 6; i++) s.alignments.push({ id: 'a' + (i + 1), name: 'A' + i, start: 0, pis: [{ x: i, y: 0, r: 0 }, { x: i + 100, y: 50, r: 30 }, { x: i + 200, y: 0, r: 0 }], pvis: [{ sta: 0, z: 10, L: 0 }, { sta: 100, z: 12, L: 40 }, { sta: 200, z: 11, L: 0 }] });
    for (let i = 0; i < 6; i++) s.pads.push({ id: 'd' + (i + 10), name: 'P' + i, pts: [{ x: i, y: i }, { x: i + 20, y: i }, { x: i + 20, y: i + 20 }], z: 12, cut: 2, fill: 3 });
    for (let i = 0; i < 40; i++) s.features.push({ id: 'f' + (i + 20), name: 'F' + i, pts: [{ x: i, y: 0, z: 1 }, { x: i, y: 9, z: 2 }], closed: false, use: 'off', daylight: false, cut: 2, fill: 3 });
    for (let i = 0; i < 4; i++) s.masses.push({ id: 'm' + (i + 70), name: 'M' + i, pts: [{ x: 0, y: 0 }, { x: 9, y: 0 }, { x: 9, y: 9 }], floors: 2 });
    s.network = { name: 'Storm', type: 'storm', rules: { minSlope: 0.005, minCover: 3 }, structures: [{ id: 's80', name: 'S1', x: 1, y: 1, rim: null, dia: 4 }, { id: 's81', name: 'S2', x: 50, y: 1, rim: null, dia: 4 }], pipes: [{ id: 'p82', name: 'P1', from: 's80', to: 's81', dia: 1.5 }] };
    s.seq = 100;
  });
  p.undoStack = []; p.redoStack = [];
  return p;
}
const recOf = (st) => (st.rec ? JSON.stringify([[...st.rec.undo].sort(), [...st.rec.redo].sort()]) : 'none');
const file = (p) => { const j = p.toJSON(); delete j.saved; return JSON.stringify(j); };

// 1. random hinted edits vs the same edits unhinted
Project.verifyHints = true;
const A = seedProject(); seed = 11; const B = seedProject();
ok(file(A) === file(B), 'twins start equal');
const EDITS = [
  ['al.pi', (p, s, id) => { s.alignments.find((a) => a.id === id).pis[1].x += 3; }, 'alignments'],
  ['al.pvi.add', (p, s, id) => { const v = s.alignments.find((a) => a.id === id).pvis; v.push({ sta: 150, z: 9, L: 0 }); v.sort((m, n) => m.sta - n.sta); }, 'alignments'],
  ['al.design', (p, s, id) => { const a = s.alignments.find((x) => x.id === id); a.design = { speed: 50, unit: 'km/h' }; }, 'alignments'],
  ['al.delete', (p, s, id) => { s.alignments = s.alignments.filter((a) => a.id !== id); }, 'alignments'],
  ['pad.corner', (p, s, id) => { const q = s.pads.find((x) => x.id === id); if (q) q.pts[0].x -= 1; }, 'pads'],
  ['pad.replace', (p, s, id) => { const i = s.pads.findIndex((x) => x.id === id); if (i >= 0) s.pads[i] = { ...s.pads[i], z: 99, id }; }, 'pads'],
  ['feature.replace', (p, s, id) => { const i = s.features.findIndex((x) => x.id === id); if (i >= 0) s.features[i] = { ...s.features[i], name: 'R' + ri(99), id }; }, 'features'],
  ['feature.delete', (p, s, id) => { s.features = s.features.filter((x) => x.id !== id); }, 'features'],
  ['feature.add', (p, s) => { const nid = p.nextId('f'); s.features.push({ id: nid, name: 'N', pts: [{ x: 1, y: 1, z: 1 }, { x: 2, y: 2, z: 1 }], closed: false, use: 'off', daylight: false, cut: 2, fill: 3 }); return nid; }, 'features'],
  ['mass.floors', (p, s, id) => { const q = s.masses.find((x) => x.id === id); if (q) q.floors += 1; }, 'masses'],
  ['net.struct', (p, s) => { s.network.structures[0].x += 2; }, null],
];
const pick = (p, list) => { const a = list ? p.state[list] : []; return a.length ? a[ri(a.length)].id : 'none'; };
for (let i = 0; i < 400; i++) {
  const r = rnd();
  if (r < 0.12 && A.undoStack.length) { A.undo(); B.undo(); continue; }
  if (r < 0.2 && A.redoStack.length) { A.redo(); B.redo(); continue; }
  if (r < 0.27) {   // a point move (editPoints with its hint) against the same move made unhinted
    const n = String(1 + ri(300)), x = rnd() * 500, y = rnd() * 500;
    movePoint(A, n, x, y);
    const idx = B.points.findIndex((q) => q.n === n);
    if (idx >= 0) B.editPoints('Move point ' + n, (pts) => { pts[idx] = { ...pts[idx], x, y }; return pts; });
    continue;
  }
  const [name, fn, list] = EDITS[ri(EDITS.length)];
  const orderEdit = /delete|add/.test(name);
  const id = pick(A, list), s0 = seed;
  let thrown = null;
  try { A.change(name, (s) => fn(A, s, id), { keys: list ? (orderEdit ? A.listKeys(list, id) : A.keysOf(list, id)) : ['k:network'] }); } catch (e) { thrown = e; }
  seed = s0;
  try { B.change(name, (s) => fn(B, s, id)); } catch { /* the same throw */ }
  ok(!thrown || !/hint missed/.test(thrown.message), 'hint covers ' + name, thrown?.message);
  if (A.undoStack.length && B.undoStack.length) ok(recOf(A.undoStack.at(-1)) === recOf(B.undoStack.at(-1)), 'same record ' + name + ' #' + i);
  if (i % 20 === 0) ok(file(A) === file(B), 'same file after ' + i);
}
ok(file(A) === file(B), 'same file at the end');
ok(A.undoStack.length === B.undoStack.length && A.redoStack.length === B.redoStack.length, 'same stacks', [A.undoStack.length, B.undoStack.length]);
while (A.undoStack.length) { A.undo(); B.undo(); ok(file(A) === file(B), 'same after undo ' + A.undoStack.length); }
while (A.redoStack.length) { A.redo(); B.redo(); }
ok(file(A) === file(B), 'same after redo all');

// 2. a wrong hint is caught
{
  const p = seedProject();
  let msg = '';
  try { p.change('wrong', (s) => { s.alignments[0].name = 'X'; }, { keys: p.keysOf('alignments', 'a2') }); } catch (e) { msg = e.message; }
  ok(/hint missed e:alignments:a1/.test(msg), 'verifyHints names the missed chunk', msg);
  Project.verifyHints = false;
  p.change('wrong, unchecked', (s) => { s.pads[0].name = 'Y'; }, { keys: p.keysOf('pads', 'd11') });
  ok(p.undoStack.length === 0 || !p.undoStack.at(-1).rec.redo.has('e:pads:d10'), 'without the check a wrong hint records only what it names (why the check is on in the tests)');
  Project.verifyHints = true;
}

// 3. a listener that edits the state (the landscape links) joins the step through the full look
{
  const p = seedProject();
  p.on((kind) => { if (kind === 'change' && p.state.features[0].name !== 'followed') { p.state.features[0].name = 'followed'; p.touch('links'); } });
  p.change('move pad', (s) => { s.pads[0].z = 1; }, { keys: p.keysOf('pads', s0id(p)) });
  const st = p.undoStack.at(-1);
  ok(st.rec.redo.has('e:pads:d10') && st.rec.redo.has('e:features:f20'), 'the follow-up joins the hinted step', [...st.rec.redo.keys()]);
  p.undo();
  ok(p.state.pads[0].z === 12 && p.state.features[0].name === 'F0', 'one undo puts both back');
}
function s0id(p) { return p.state.pads[0].id; }

// 4. keysOf + a list whose ids repeat (one chunk)
{
  const p = seedProject();
  const k = p.keysOf('features', 'f20', 'f21');
  ok(k.join() === 'e:features:f20,e:features:f21', 'keysOf', k);
  ok(p.listKeys('features', 'f20').join() === 'e:features:f20,o:features', 'listKeys', p.listKeys('features', 'f20'));
  let miss = '';
  try { p.change('add said in place', (s) => { s.features.push({ id: 'f999', name: 'x', pts: [] }); }, { keys: p.keysOf('features', 'f20') }); } catch (e) { miss = e.message; }
  ok(/hint missed/.test(miss), 'an add hinted as an edit in place is caught', miss);
  ok(p.keysOf(null, 'k:network').join() === 'k:network', 'keysOf(null, chunk key)');
  p.change('dup ids', (s) => { s.features.push({ ...s.features[0] }); });   // two f20: the list is one chunk now
  p.change('edit in a one-chunk list', (s) => { s.features[3].name = 'Z'; }, { keys: p.keysOf('features', 'f23') });
  ok(p.keysOf('features', 'f23').join() === 'k:features', 'a one-chunk list is named whole', p.keysOf('features', 'f23'));
  ok(p.undoStack.at(-1).label === 'edit in a one-chunk list' && p.undoStack.at(-1).rec.redo.has('k:features'), 'recorded as k:features');
  p.undo();
  ok(p.state.features[3].name === 'F3', 'and undone');
}
console.log(`test-civilcraft-hints11: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
