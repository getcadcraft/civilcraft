#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-cam-sheets.mjs — nested sheets (the Cabinets add-on's DXF) → PartCraft programs → G-code (cam-sheets.js, 0.8 SU.1035 step 4b).
 * Known answers: a rectangle's finished tool path is the part grown by the tool radius; holes before outlines; sheets split by the
 * SHEET rectangles; the three posts; arcs (bulges) as G2/G3.   node tools/partcraft-test/test-cam-sheets.mjs
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const DEV = path.join(HERE, '../../public_html/assets/apps/partcraft/dev/');
const CAB = path.join(HERE, '../../public_html/assets/apps/cadcraft/dev/addons/cabinet/lib/');
let pass = 0, fail = 0;
const ok = (c, m, x = '') => { if (c) pass++; else { fail++; console.log('FAIL', m, x); } };
const near = (a, b, e = 1e-6) => Math.abs(a - b) < e;
const S = await import(DEV + 'cam-sheets.js');
const N = await import(DEV + 'nest/nest.js');
const M = await import(CAB + 'model.js');
const J = await import(CAB + 'job.js');

// ---- a hand-made sheet: two rectangles and one with a hole, on two sheets
const rect = (x, y, w, h) => [{ x, y }, { x: x + w, y }, { x: x + w, y: y + h }, { x, y: y + h }];
const result = {
  sheets: [{}, {}],
  placed: [
    { sheet: 0, id: 'a', name: 'A (1)', loops: [rect(10, 10, 300, 200)] },
    { sheet: 0, id: 'b', name: 'B (2)', loops: [rect(330, 10, 200, 200), rect(400, 80, 60, 60)] },
    { sheet: 1, id: 'c', name: 'C (3)', loops: [rect(10, 10, 100, 100)] },
  ],
  unplaced: [],
};
const sheet = { w: 1000, h: 500, margin: 0 };
const dxf = N.nestDxf(result, sheet, { units: 'mm' });
const r = S.sheetsFromDxf(dxf);
ok(r.sheets.length === 2, 'two SHEET rectangles → two sheets', String(r.sheets.length));
ok(r.sheets[0].w === 1000 && r.sheets[0].h === 500, 'sheet size 1000 × 500');
ok(r.sheets[0].parts.length === 2 && r.sheets[1].parts.length === 1, 'parts land on their own sheet', r.sheets.map((s) => s.parts.length).join());
const b = r.sheets[0].parts.find((p) => p.holes.length);
ok(b && b.holes.length === 1, 'the inner loop is a hole of its part');
ok(r.sheets[0].parts[0].label.startsWith('A') && r.sheets[0].parts[1].label.startsWith('B'), 'labels follow the cutting order', r.sheets[0].parts.map((p) => p.label).join());
const p0 = r.sheets[0].parts[0].loops[0];
ok(near(p0[0].x, 10) && near(p0[0].y, 10), 'coordinates moved to the sheet\'s own lower left', JSON.stringify(p0[0]));

const prog = S.sheetPrograms(r.sheets, { thickness: 18, tool: { d: 6 } });
ok(prog.programs.length === 2 && prog.notes.length === 0, 'a program per sheet, no notes', JSON.stringify(prog.notes));
const P = prog.programs[0].program;
ok(P.paths.length === 3 && P.paths[0].op.name.includes('hole'), 'hole first, then the outlines in order', P.paths.map((p) => p.op.name).join());
// tool path of part A: the 300 × 200 rectangle at (10,10) grown by 3 → x from 7 to 313, y from 7 to 213
const feeds = P.paths[1].moves.filter((m) => m.k === 'feed' || m.k === 'arc');
const xs = feeds.map((m) => m.p[0]), ys = feeds.map((m) => m.p[1]);
ok(near(Math.max(...xs), 313, 0.01) && near(Math.max(...ys), 213, 0.01) && Math.min(...xs) > 3 && Math.min(...xs) <= 7.01 && Math.min(...ys) > 3 && Math.min(...ys) <= 7.01, 'outline path = part grown by the tool radius (lead arcs aside)', [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)].join());
const zs = P.paths[1].moves.map((m) => m.p[2]);
ok(near(Math.min(...zs), -19), 'cut through: 18 + 1 breakthrough', String(Math.min(...zs)));
// the hole: tool stays inside it (hole 60 × 60 at 400..460 → path from 403 to 457)
const hx = P.paths[0].moves.filter((m) => m.k !== 'rapid').map((m) => m.p[0]);
ok(Math.min(...hx) > 399 && Math.max(...hx) < 461, 'hole path stays inside the hole', Math.min(...hx) + '..' + Math.max(...hx));
ok(near(Math.min(...P.paths[0].moves.map((m) => m.p[2])), -19), 'the hole is cut through too');

// ---- the posts
for (const post of ['grbl', 'fanuc', 'linuxcnc']) {
  const g = S.sheetsGcode(dxf, { thickness: 18, post, name: 'Job' });
  ok(g.files.length === 2 && g.files[0].name === 'Job-01', post + ': two files named by sheet');
  const t0 = g.files[0].text;
  ok(/G21/.test(t0) && /G1 /.test(t0) && /M[35]/.test(t0), post + ': header, feeds and spindle');
  ok(!/NaN|undefined|Infinity/.test(t0), post + ': no NaN / undefined in the program');
  ok(/verify before running/.test(t0), post + ': says verify before running');
}
// ---- bulges: a rounded corner part becomes an arc
const rounded = [{ x: 10, y: 10 }, { x: 110, y: 10 }, { x: 110, y: 110, b: 0 }, { x: 10, y: 110 }];
const circ = { sheets: [{}], placed: [{ sheet: 0, id: 'r', name: 'R (1)', loops: [[{ x: 100, y: 100, b: 1 }, { x: 200, y: 100, b: 1 }]] }], unplaced: [] };
const g2 = S.sheetsGcode(N.nestDxf(circ, sheet, { units: 'mm' }), { thickness: 12, post: 'grbl' });
ok(g2.files.length === 1 && /G[23] /.test(g2.files[0].text), 'a round part is cut with G2/G3 arcs');

// ---- inches
const inch = N.nestDxf({ sheets: [{}], placed: [{ sheet: 0, id: 'a', name: 'A (1)', loops: [rect(1, 1, 12, 8)] }], unplaced: [] }, { w: 96, h: 48, margin: 0 }, { units: 'in' });
const ri = S.sheetsFromDxf(inch);
ok(near(ri.sheets[0].w, 96 * 25.4, 1e-6) && near(ri.sheets[0].parts[0].loops[0][0].x, 25.4, 1e-6), 'a DXF in inches is read in mm');

// ---- a real cabinet job: parts → nest → DXF → G-code
const R = M.RULES.mm;
const cabs = [M.cleanCabinet({ no: 'B01', type: 'base' }, R), M.cleanCabinet({ no: 'W01', type: 'wall' }, R)].map((cab) => ({ cab, R }));
const parts = J.jobParts(cabs);
const job = J.nestJob(parts, { sheet: { w: 2440, h: 1220, margin: 10 }, tries: 2, timeLimit: 1500 });
const jd = J.jobDxf(job, { w: 2440, h: 1220, margin: 10 });
const rj = S.sheetsFromDxf(jd);
const total = rj.sheets.reduce((a, s) => a + s.parts.length, 0);
const nested = job.mats.reduce((a, m) => a + m.result.placed.length, 0);
ok(rj.sheets.length >= job.sheets - 0 && total === nested, 'every nested part is found on its sheet', total + ' of ' + nested);
ok(rj.sheets.every((s) => s.parts.every((p) => p.label)), 'every part has its piece id from LABELS');
const gj = S.sheetsGcode(jd, { thickness: 18, post: 'grbl' });
ok(gj.files.length === rj.sheets.filter((s) => s.parts.length).length && gj.notes.every((n) => n.code === 'units_none' ? false : true), 'a file per sheet, no notes', JSON.stringify(gj.notes));
// ---- the dialog's pure parts (cam-sheets-ui.js) and its words
const U = await import(DEV + 'cam-sheets-ui.js');
const LG = await import('./sheets-lang.mjs');
const o = U.readOptions({ thickness: '12', toolD: '99', flutes: 0, tabs: 40, post: 'fanuc', material: 'nope' });
ok(o.thickness === 12 && o.tool.d === 50 && o.tool.flutes === 1 && o.tabs === 12 && o.post === 'fanuc' && o.material === 'wood' && o.tool.fluteLen === 20, 'options are clamped (tool ≤ 50, tabs ≤ 12, flutes ≥ 1), an unknown material is wood');
ok(U.readOptions({}).thickness === 18 && U.readOptions({ thickness: 'abc' }).thickness === 18, 'defaults for what is not a number');
const wordKeys = new Set();
for (const f of ['cam-sheets-ui.js', 'cam-sheets.js']) for (const m of (await import('node:fs')).readFileSync(DEV + f, 'utf8').matchAll(/\bt\('(sheets\.[a-z_.]+)'/g)) wordKeys.add(m[1]);
wordKeys.delete('sheets.note.');
for (const code of ['no_sheets', 'no_parts', 'units_none', 'open_loops', 'unplaced_part', 'part_not_cut', 'tool_too_big']) wordKeys.add('sheets.note.' + code);
ok([...wordKeys].every((k) => k in LG.EN && k in LG.ES), 'every word the dialog uses is in sheets-lang.mjs (en and es-MX)', [...wordKeys].filter((k) => !(k in LG.EN)).join(' '));
ok(Object.keys(LG.EN).join() === Object.keys(LG.ES).join(), 'es-MX has exactly the English keys');
console.log(`cam-sheets: ${pass}/${fail}`);
process.exit(fail ? 1 : 0);
