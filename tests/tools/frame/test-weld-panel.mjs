#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-weld-panel.mjs — the Weld checks block of the shared frame panel (0.10 SU.1811): framePanel(host) with a stub host over a pump-skid frame made by
 * buildFrame (frame-members.js). Checks that the block is there, that Check welds runs checkWelds on the solved frame, that the rows, the report tables and the
 * stale state follow, and that every key the block uses is in tools/frame/lang.mjs (English and Spanish).
 *   node tools/frame/test-weld-panel.mjs
 */
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const load = (f) => import(pathToFileURL(path.join(ROOT, f)).href);
const P = await load('lib/frame/frame-panel.js'), MB = await load('lib/frame/frame-members.js'), FS = await load('lib/frame/frame-solve.js');
const SH = await load('lib/shapes/sections.js'), WD = await load('lib/frame/frame-weld.js'), D = await load('lib/frame/frame-design.js'), LANG = await load('tools/frame/lang.mjs');
let pass = 0, fail = 0;
const ok = (c, name, extra = '') => { if (c) pass++; else { fail++; console.log('  FAIL ' + name + (extra ? ' — ' + extra : '')); } };

const built = MB.buildFrame({ name: 'skid', code: 'asce-aisc', selfWeight: 1,
  members: [
    { id: 'rail1', a: [0, 0, 600], b: [2000, 0, 600], section: 'HSS4X4X1/4' }, { id: 'rail2', a: [0, 800, 600], b: [2000, 800, 600], section: 'HSS4X4X1/4' },
    { id: 'end1', a: [0, 0, 600], b: [0, 800, 600], section: 'HSS4X4X1/4' }, { id: 'end2', a: [2000, 0, 600], b: [2000, 800, 600], section: 'HSS4X4X1/4' },
    ...[[0, 0], [2000, 0], [0, 800], [2000, 800]].map(([x, y], k) => ({ id: 'leg' + (k + 1), a: [x, y, 0], b: [x, y, 600], section: 'HSS4X4X1/4' })),
  ],
  supports: [[0, 0], [2000, 0], [0, 800], [2000, 800]].map(([x, y]) => ({ at: [x, y, 0], fix: 'pinned' })),
  equipment: [{ id: 'pump', mass: 400, cg: [1000, 400, 800], mounts: [[500, 0, 600], [1500, 0, 600], [500, 800, 600], [1500, 800, 600]] }] },
  { findSection: SH.findSection, outline: SH.outline });
ok(built.ok, 'the skid frame builds', built.error);

let version = 1, analysis = { ...P.defaultAnalysis((k) => k), design: D.cleanDesign({ code: 'asce-aisc' }) }, printed = [];
const el = (tag, props = {}, ...kids) => ({ tag, props: props || {}, kids: kids.flat(Infinity).filter((k) => k !== null && k !== undefined) });
const walk = (n, f) => { if (n && typeof n === 'object') { f(n); (n.kids || []).forEach((k) => walk(k, f)); } };
const text = (n) => (typeof n === 'string' ? n : (n?.kids || []).map(text).join(' '));
const host = {
  el, t: (k, v) => k + (v ? JSON.stringify(v) : ''), cls: { block: 'b', head: 'h', btn: 'btn', input: 'i', select: 's', note: 'n', table: 't', link: 'l' },
  analysis: () => analysis, setAnalysis: (_l, a) => { analysis = a; version++; }, version: () => version, rerender: () => {}, print: (s) => printed.push(s),
  selection: () => [], hide: () => {}, show: () => ({}), showUtil: () => {}, member: () => null, select: () => {}, design: true,
  analyse: () => ({ frame: { model: built.model, nodes: [], parts: new Map(), notes: [], skipped: [], warnings: [] }, sol: FS.solveFrame(built.model) }),
};
const panel = P.framePanel(host);
const find = (attr) => { let r = null; walk({ kids: panel.panel() }, (n) => { if (!r && n.props && attr in n.props) r = n; }); return r; };

ok(!!find('data-fa-weld-run'), 'the Weld checks block is in the panel when the app gives its sections shapes (host.design)');
ok(find('data-fa-weld-state')?.kids.join('').includes('frame.weld.none-yet'), 'before a run it says so');
find('data-fa-weld-run').props.onclick();
const rows = []; walk({ kids: panel.panel() }, (n) => { if (n.props?.['data-fa-weld-row']) rows.push(n); });
ok(rows.length > 0 && find('data-fa-weld-summary'), 'Check welds runs on the solved frame and lists the groups', 'rows ' + rows.length + ', printed ' + printed.slice(-1));
const groups = MB.jointWelds(built.model);
ok(rows.length === groups.length, 'one row per joint group (' + groups.length + ')');
const direct = WD.checkWelds(built.model, FS.solveFrame(built.model), groups, { code: 'asce-aisc', grade: analysis.design.grade, na: analysis.design.na, fexx: WD.FEXX_E70 });
const utils = rows.map((r) => r.kids[3].kids.join(''));
const top = Math.max(...direct.groups.map((g) => g.util ?? 0));
ok(direct.ok && utils.includes((Math.round(top * 1000) / 10).toFixed(1) + ' %'), 'the highest utilisation shown equals checkWelds called directly', 'top ' + top);
version++;
ok(find('data-fa-weld-state')?.kids.join('').includes('frame.des.stale') && !find('data-fa-weld-table'), 'a changed model makes the result stale and hides the table');
analysis = { ...analysis, design: D.cleanDesign({ code: 'none' }) };
ok(find('data-fa-weld-run').props.disabled === true, 'with no design code the button is off');
const keys = new Set(); for (const k of Object.keys(LANG.EN)) if (k.startsWith('frame.weld.')) keys.add(k);
const used = ['h', 'run', 'aid', 'f-size', 'f-fexx', 'none-yet', 'err.no-joints', 'err.no-solution', 'err.no-combos', 'limits', 'counts-text', 'title'];
ok(used.every((u) => 'frame.weld.' + u in LANG.EN && 'frame.weld.' + u in LANG.ES), 'every word the block uses is in the English and the Spanish table');
ok(['noncompact-hss', 'ltb-hss', 'high-shear-hss'].every((u) => 'frame.des.why.' + u in LANG.EN && 'frame.des.why.' + u in LANG.ES), 'the three hollow-section "not checked" reasons have words');
console.log(fail ? fail + ' FAILED, ' + pass + ' passed' : pass + ' passed');
process.exit(fail ? 1 : 0);
