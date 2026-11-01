#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * live-where.mjs — EG.41 in ModelCraft (0.8 round 3, model_PART_3): live.js where(ops) locates each step in plan for the hub's
 * assistant scope (studio/hub/live/assistant-scope.js judges it): a new group, a moved placement, a component's geometry edited
 * (every copy counts), a removal / a guide / units (unknown → box null), a step inside and outside an area, here() passed through.
 *   node tools/modelcraft-test/live-where.mjs
 */
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const D = path.join(REPO, 'public_html/assets/apps/modelcraft/dev/');
const L = await import(pathToFileURL(D + 'live.js').href), M = await import(pathToFileURL(D + 'model.js').href);
const SC = await import(pathToFileURL('/var/www/CADCRAFT/studio/hub/live/assistant-scope.js').href).catch(() => null);
let pass = 0, fail = 0;
const ok = (c, m, d = '') => { if (c) pass++; else { fail++; console.log('  FAIL ' + m + (d ? ' — ' + d : '')); } };
const near = (a, b, e = 1e-9) => Array.isArray(a) && a.length === b.length && a.every((v, i) => Math.abs(v - b[i]) < e);

const m = new M.Model();
const live = L.createLive(m, { here: () => ({ sheet: '', area: [0, 0, 10, 10] }) });
const got = [];
live.bind({ c: 1, localChange: (x) => got.push(x), setPresence() {}, peers: new Map(), on: () => () => {} });
const S = () => JSON.stringify(m.toJSON());
const step = (label, fn) => { const a = S(); const r = m.change(label, fn); live.step(label, a, S()); return r; };
const last = () => got[got.length - 1].ops;

const iid = step('make', (mm) => { M.addPolygon(mm.root, [[1, 1, 0], [3, 1, 0], [3, 2, 0], [1, 2, 0]], [0, 0, 1]); return mm.makeGroup(mm.root, [...mm.root.faces.keys()].map((f) => ({ t: 'f', id: f })), 'component', 'Bench'); });
let w = live.where(last());
ok(w && w.sheet === '' && near(w.box, [1, 1, 3, 2]), 'a new component: its plan box', JSON.stringify(w));
step('move', (mm) => { const i = mm.root.insts.get(iid); i.m[12] += 5; });
w = live.where(last());
ok(near(w.box, [6, 1, 8, 2]), 'a moved placement: where it now sits', JSON.stringify(w));
const defId = m.root.insts.get(iid).def;
step('copy', (mm) => { const i = mm.root.insts.get(iid); mm.root.insts.set(mm.newInstId ? mm.newInstId() : 999, { ...i, m: [...i.m.slice(0, 12), -20, 0, 0, 1] }); });
step('geo', (mm) => { const d = mm.defs.get(defId); for (const p of d.verts.values()) p[2] += 1; });
w = live.where(last());
ok(w.box && w.box[0] < -10 && w.box[2] > 7, 'a component\'s geometry: every copy counts (both placements)', JSON.stringify(w));
step('erase', (mm) => { mm.root.insts.delete(iid); });
w = live.where(last());
ok(w && w.box === null, 'a removal cannot be pinned to a place: box null', JSON.stringify(w));
ok(live.where([{ o: 'g', g: 's1' }]) === null, 'no ops: null');
ok(live.where([{ o: 'put', path: ['units'], v: 'mm' }]).box === null, 'units (not in one place): box null');
ok(live.where([{ o: 'add', path: ['guides'], id: 5, v: {} }]).box === null, 'a guide: box null');
ok(live.where([{ o: 'atom', path: ['defs', '#nope', 'geo'], v: {} }]).box === null, 'a definition that is not there: box null');
ok(typeof live.sheetLabel() === 'string' && live.sheetLabel().length > 0, 'sheetLabel names the model (live.where.model)');
ok(near(live.here().area, [0, 0, 10, 10]), 'here() is the page\'s view footprint');
ok(typeof L.createLive(m).here === 'undefined', 'no here() when the page gives none (the hub falls back to presence)');
if (SC) {
  const scope = SC.makeScope({ sheet: '', area: [0, 0, 10, 10] });
  const a = { where: (ops) => live.where(ops) };
  const judge = SC.judge;
  {
    step('make2', (mm) => { M.addPolygon(mm.root, [[2, 2, 0], [4, 2, 0], [4, 4, 0], [2, 4, 0]], [0, 0, 1]); return mm.makeGroup(mm.root, [...mm.root.faces.keys()].map((f) => ({ t: 'f', id: f })), 'group', 'In'); });
    const inOps = last();
    step('make3', (mm) => { M.addPolygon(mm.root, [[20, 20, 0], [24, 20, 0], [24, 24, 0], [20, 24, 0]], [0, 0, 1]); return mm.makeGroup(mm.root, [...mm.root.faces.keys()].map((f) => ({ t: 'f', id: f })), 'group', 'Out'); });
    const outOps = last();
    ok(!judge(scope, SC.locate(a, inOps)), 'the hub lets a step inside the area through');
    ok(judge(scope, SC.locate(a, outOps)) === 'scope-area', 'and refuses one outside it (scope-area)');
    ok(judge(scope, SC.locate(a, [{ o: 'del', path: ['defs', '#root', 'insts'], id: 1 }])) === 'scope-unknown', 'a removal under an area: scope-unknown');
  }
} else console.log('  (studio/hub/live/assistant-scope.js not found: hub checks skipped)');
console.log((fail ? 'FAILED' : 'ok') + ' — ' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
