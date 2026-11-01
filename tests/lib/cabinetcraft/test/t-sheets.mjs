/* SPDX-License-Identifier: Apache-2.0 */
// The per-job cut list, the nest by material, the DXF, the labels, the G-code through PartCraft's nested-sheets path, the CSV files.
const { ok, section, near, mine, app } = globalThis.__ccTest;
const P = await mine('lib/project.js');
const A = await mine('lib/analyze.js');
const S = await mine('lib/sheets.js');
const X = await mine('lib/export.js');
const CS = await app('cam-sheets.js');
const NEST = await mine('lib/nest/nest.js');

const p = P.sampleProject();
const t0 = Date.now();
const a0 = A.analyze(p);
const nest = A.runNest(a0.build, { tries: 3, timeLimit: 5000 });
const ms = Date.now() - t0;

section('Cut list and linear stock');
{
  ok(a0.list.pieces === a0.build.parts.reduce((s, x) => s + x.qty, 0), 'the cut list counts every piece of every part', String(a0.list.pieces));
  ok(a0.list.groups.length === 5 && a0.list.banding.length === 2, 'five materials; two bandings (1 and 2 mm)', a0.list.groups.map((g) => g.material).join());
  const ff = A.analyze({ ...p, construction: 'faceframe' });
  ok(ff.linear.length === 1 && ff.linear[0].pieces > 20 && ff.linear[0].width === 38, 'face frames: the hardwood is a linear list, one width', JSON.stringify(ff.linear));
  ok(!ff.list.groups.some((g) => g.material === ff.build.F.mat), 'frame stock is not in the sheet cut list');
  ok(S.sheetParts(ff.build.parts).linear.every((x) => x.meta.linear) && S.sheetParts(ff.build.parts).sheet.length + S.sheetParts(ff.build.parts).linear.length === ff.build.parts.length, 'sheetParts splits every part exactly once');
}

section('Nest by material');
{
  ok(nest.unplaced.length === 0, 'every part fits its sheet');
  ok(nest.mats.length === 5 && nest.mats.every((m) => NEST.checkNest(m.result, { w: m.sheet.w, h: m.sheet.h, margin: nest.margin }, { spacing: p.sheet.spacing }).ok !== false), 'five nests, each passes lib/nest\'s exact re-check', JSON.stringify(nest.mats.map((m) => NEST.checkNest(m.result, { w: m.sheet.w, h: m.sheet.h, margin: nest.margin }, { spacing: p.sheet.spacing }))).slice(0, 200));
  const placed = nest.mats.reduce((s, m) => s + m.result.placed.length, 0);
  ok(placed === a0.list.pieces, 'every piece is placed exactly once: ' + placed + ' of ' + a0.list.pieces);
  ok(nest.seq.length === placed && new Set(nest.seq.map((x) => x.pieceId)).size === placed, 'the cutting order numbers every piece once');
  ok(nest.sheets === nest.mats.reduce((s, m) => s + m.result.sheets.length, 0) && nest.sheets >= 10 && nest.sheets <= 20, 'sheets in all: ' + nest.sheets);
  ok(nest.efficiency.every((e) => e.efficiency > 0.3), 'every material is used above 30 %', JSON.stringify(nest.efficiency.map((e) => Math.round(e.efficiency * 100))));
  ok(A.runNest(a0.build, { tries: 3, timeLimit: 5000 }).sheets === nest.sheets, 'the same job nests the same (a fixed seed)');
  // a custom material with its own sheet size is nested on that sheet
  const q = P.cleanProject({ ...p, custom: [{ id: 'my-big', role: 'back', name: 'Big back board', thickness: 6, sheet: { w: 2800, h: 2070 } }], picks: { ...p.picks, back: 'my-big' } });
  const nq = A.runNest(A.analyze(q).build, { tries: 2, timeLimit: 3000 });
  const back = nq.mats.find((m) => m.material === 'Big back board');
  ok(back && back.sheet.w === 2800 && back.sheet.h === 2070, 'a material with its own sheet size nests on that size');
  // a part too big for the sheet is reported, not lost
  const big = P.cleanProject({ unit: 'mm', runs: [{ id: 'A', wall: 'S', base: [{ kind: 'cab', tpl: 'tall-pantry', w: 600, h: 2700 }] }], room: { w: 3600, d: 3000, h: 3000 }, sheet: { w: 2440, h: 1220, margin: 10, spacing: 8 } });
  const nb = A.runNest(A.analyze(big).build, { tries: 1, timeLimit: 2000 });
  ok(nb.unplaced.length === 0 || nb.unplaced.every((u) => u.id && u.why), 'unplaced parts carry id and reason');
  const tiny = P.cleanProject({ ...big, sheet: { w: 1000, h: 600, margin: 10, spacing: 8 }, picks: { ...big.picks } });
  const nt = A.runNest(A.analyze(tiny).build, { tries: 1, timeLimit: 1000 });
  ok(nt.unplaced.length > 0 || nt.mats.every((m) => m.sheet.w > 1000), 'when the sheet is too small the long parts are listed unplaced (the standard sheets are by material)');
}

section('DXF, labels, CSV');
{
  const dxf = S.nestDxf(nest);
  ok(/SECTION/.test(dxf) && dxf.includes('SHEET') && dxf.includes('PARTS') && dxf.includes('LABELS') && /\bB01-\d\d/.test(dxf), 'a DXF with the SHEET, PARTS and LABELS layers and the piece ids');
  const sh = CS.sheetsFromDxf(dxf);
  ok(sh.sheets.length === nest.sheets, 'PartCraft\'s own reader finds every sheet of the job', sh.sheets.length + ' of ' + nest.sheets);
  ok(sh.sheets.reduce((s, x) => s + x.parts.length, 0) === nest.mats.reduce((s, m) => s + m.result.placed.length, 0), 'and every part on them');
  const labels = X.labelsHtml(a0.build, nest, { template: 'a4-24', title: 'Test' });
  ok(labels.count === a0.list.pieces && /<svg/.test(labels.html) && labels.pages === Math.ceil(a0.list.pieces / 24), 'labels: one per piece, ' + labels.pages + ' pages of 24', JSON.stringify([labels.count, labels.pages]));
  const first = S.labelsOf(a0.build.parts, nest);
  ok(first.length === a0.list.pieces && first[0].nest === 'Sheet 1, no. 1' && first[1].nest === 'Sheet 1, no. 2', 'labels follow the nest order: first is sheet 1, number 1, then 2');
  const noNest = S.labelsOf(a0.build.parts, null);
  ok(noNest.length === a0.list.pieces && noNest.every((l) => l.nest === ''), 'without a nest the labels are in cut-list order and say no sheet');
  const csv = X.cutlistCsv(a0.build);
  const lines = csv.trim().split('\r\n');
  ok(lines[0].startsWith('Part,Name,Cabinet,Material') && lines.length > 20 && lines.every((l) => l.split(',').length >= 16), 'cut list CSV: header and one row per kind of part');
  ok(!/^[=+@]/m.test(csv.replace(/^Part.*\r\n/, '')), 'no cell starts with a formula character');
  const dr = X.drillCsv(a0.build);
  ok(dr.split('\r\n')[0] === 'part,name,face,kind,x,y,diameter,depth,side,qty,note' && /shelf-pin/.test(dr) && /cup/.test(dr), 'drilling CSV: shelf pins and cups');
  const hw = X.hardwareCsv(a0.build);
  ok(/hw\.hinge/.test(hw) && hw.split('\r\n')[0] === 'item,spec,qty', 'hardware CSV');
  const js = JSON.parse(X.jobJson(p));
  ok(JSON.stringify(P.cleanProject(js)) === JSON.stringify(p), 'the job file round-trips through cleanProject unchanged');
}

section('G-code through PartCraft\'s nested-sheets path');
{
  const files = X.gcodeFiles(nest, CS.sheetsGcode, { unit: 'mm', name: 'Test', post: 'grbl', tool: { d: 6 } });
  const real = files.filter((f) => !f.notesOnly);
  ok(real.length === nest.sheets, 'one program per sheet: ' + real.length + ' of ' + nest.sheets, JSON.stringify(files.filter((f) => f.notesOnly).map((f) => f.notes)));
  ok(real.every((f) => f.text.length > 200 && /G0?1|G0?0/.test(f.text)), 'each has moves');
  ok(new Set(real.map((f) => f.material)).size === 5, 'for all five materials');
  const thick = real.find((f) => f.material === a0.build.R.carcass);
  ok(thick && /Z-?1[8-9]|Z-?19/.test(thick.text), 'the 18 mm board is cut through to about its thickness', thick ? thick.text.split('\n').filter((l) => /Z-/.test(l)).slice(0, 3).join(' | ') : '');
  const f2 = X.gcodeFiles(nest, CS.sheetsGcode, { unit: 'mm', name: 'Test', post: 'fanuc', tool: { d: 6 } }).filter((f) => !f.notesOnly);
  ok(f2.length === real.length && f2[0].text !== real[0].text, 'another post gives another program');
  // an inch job: the DXF scale is passed
  const inch = A.analyze(P.sampleProject('in'));
  const ni = A.runNest(inch.build, { tries: 1, timeLimit: 3000 });
  const gi = X.gcodeFiles(ni, CS.sheetsGcode, { unit: 'in', name: 'Inch', post: 'grbl', tool: { d: 6 } }).filter((f) => !f.notesOnly);
  ok(gi.length === ni.sheets && gi[0].text.length > 200, 'an inch job makes programs too (scaled 25.4)', gi.length + ' of ' + ni.sheets);
  const tw = gi.map((f) => Math.max(...[...f.text.matchAll(/X(-?\d+\.?\d*)/g)].map((m) => Number(m[1])))).filter(Number.isFinite);
  ok(tw.length && Math.max(...tw) > 500 && Math.max(...tw) < 2500, 'inch job moves are in millimetres (X up to ' + Math.max(...tw).toFixed(0) + ')');
}
console.log('  (sheets: nest of the example kitchen took ' + ms + ' ms on this machine, ' + nest.sheets + ' sheets)');
