/* SPDX-License-Identifier: Apache-2.0 */
/**
 * views2-test.mjs — BimCraft views, round 2 (0.6 DC.117, session `bim-views_PART_2`), DOM-free, run by
 *   node bin/test-bimcraft.mjs --views2 [--only a,b]
 *   a   crop region + scale + underlay per plan (views-model.js, res-sheets.js clip, model-pdf.js)
 *   b   reflected ceiling plans (views-model.js CadCraft_CeilingPlan, model-plan.js, ceiling patterns, fixtures at the ceiling)
 *   c   callout views (views-model.js CadCraft_CalloutViews: parent, crop, scale; a callout of a callout; missing parents; delete
 *       with what is inside; on sheets)
 *   d   drafting lines and hatch regions in one view (drafting.js: IfcAnnotation, the six patterns, clipping, move, sheets, PDF;
 *       IFC4, IFC2X3 and an IFC4 file in feet)
 * Saved files are checked by IfcOpenShell at the end when a venv with it is here (tools/bimcraft-test/ifc_validate.py).
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

export async function views2Mode({ APP, ROOT, WebIFC, IfcModel, quiet, args = [] }) {
  const only = (() => { const i = args.indexOf('--only'); return i >= 0 ? new Set(String(args[i + 1] || '').split(',')) : null; })();
  const want = (k) => !only || only.has(k);
  let bad = 0, good = 0;
  const ok = (cond, label, detail = '') => { if (cond) good++; else bad++; console.log((cond ? '  ok   ' : '  FAIL ') + label + (!cond && detail ? ' (' + detail + ')' : '')); };
  const near = (a, b, e = 0.01) => Math.abs(a - b) <= e;
  const saved = {};
  const latin = (b) => new TextDecoder('latin1').decode(b);
  const { ModelWriter } = await import(path.join(APP, 'model-write.js'));
  async function building({ n = 2, h = 3000 } = {}) {
    const N = await import(path.join(APP, 'new-model.js'));
    const OPS = await import(path.join(APP, 'model-ops.js'));
    const { IfcEditor } = await import(path.join(APP, 'ifc-edit.js'));
    const text = N.newBuilding({ name: 'Views2', levels: N.stackLevels(n, h, (i) => 'Level ' + (i + 1)), fileName: 'v.ifc', now: new Date('2026-10-18T12:00:00Z') });
    const eng = await quiet(IfcModel.create)(WebIFC, null);
    await quiet((b) => eng.load(b))(new TextEncoder().encode(text));
    const ed = new IfcEditor(WebIFC, eng);
    return { ed, eng, OPS, levels: OPS.snapshotModel(ed).levels, w: () => new ModelWriter(WebIFC, ed.api, ed.mid) };
  }
  async function reopen(bytes) {
    const eng = await quiet(IfcModel.create)(WebIFC, null);
    const m = await quiet((b) => eng.load(b))(bytes);
    return new ModelWriter(WebIFC, eng.api, m.modelID);
  }

  // ===================================================================================== (a) crop, scale, underlay
  if (want('a')) {
    console.log('== DC.117 (a) crop region, scale and underlay per plan');
    const V = await import(path.join(APP, 'views-model.js'));
    const RS = await import(path.join(APP, 'res-sheets.js'));
    const { planPdf } = await import(path.join(APP, 'model-pdf.js'));
    const B = await building();
    const { ed, levels, w } = B;
    const [L1, L2] = levels;
    // one step: scale, crop, underlay together
    let n0 = ed.changes.length;
    ed.modelChange(V.setPlanView(L2.guid, { scale: 48, crop: [5000, 4000, -1000, -500], underlay: L1.guid }), { label: 'Crop' });
    let pv = V.readPlanViews(w()).get(L2.id);
    ok(ed.changes.length === n0 + 1 && pv.scale === 48 && pv.underlay === L1.guid, 'scale 1/4" and Level 1 as the underlay: one undo step', JSON.stringify(pv));
    ok(pv.crop && pv.crop.join() === '-1000,-500,5000,4000', 'the crop region kept in order (x0 y0 x1 y1), whichever corners came first', pv.crop?.join());
    ok(pv.cut === 1200 && pv.depth === 50 && !pv.hiddenClasses.length, 'the rest of the view range keeps its defaults');
    let txt = new TextDecoder().decode(ed.save());
    ok(/IFCPROPERTYSINGLEVALUE\('Scale',\$,IFCINTEGER\(48\)/.test(txt) && /'CropX0',\$,IFCLENGTHMEASURE\(-1000\.?\)/.test(txt) && new RegExp("'Underlay',\\$,IFCLABEL\\('" + L1.guid.replace(/\$/g, '\\$') + "'\\)").test(txt), 'written on the level\'s CadCraft_PlanView: Scale (IfcInteger), CropX0…CropY1 (lengths), Underlay (the level\'s GlobalId)');
    // refusals: nothing changes
    const refusal = (ch) => { try { ed.modelChange(V.setPlanView(L2.guid, ch)); return ''; } catch (e) { return e.key || e.message; } };
    n0 = ed.changes.length;
    ok(refusal({ crop: [0, 0, 50, 4000] }) === 'model.err.vr.crop', 'a crop 50 mm wide: refused');
    ok(refusal({ underlay: L2.guid }) === 'model.err.vr.underlay' && refusal({ underlay: 'no-such-level' }) === 'model.err.vr.underlay', 'an underlay of the level itself, or of no level: refused');
    ok(refusal({ scale: -5 }) === 'model.err.vr.scale', 'a negative scale: refused');
    pv = V.readPlanViews(w()).get(L2.id);
    ok(ed.changes.length === n0 && pv.crop.join() === '-1000,-500,5000,4000' && pv.scale === 48, 'after the refusals nothing changed (no undo step either)');
    // clearing the crop, the underlay
    ed.modelChange(V.setPlanView(L2.guid, { crop: null, underlay: '' }));
    pv = V.readPlanViews(w()).get(L2.id);
    ok(pv.crop === null && pv.underlay === '' && pv.scale === 48, 'crop and underlay cleared; the scale stays');
    ed.undo();
    pv = V.readPlanViews(w()).get(L2.id);
    ok(pv.crop?.join() === '-1000,-500,5000,4000' && pv.underlay === L1.guid, 'undo: crop and underlay back');
    ok(V.cropOf([0, 0, 0, 0]) === null && V.cropOf([0, 0, 99, 500]) === null && V.cropOf([10, 20, 0, 0]) === null && V.cropOf([1, 2, 3]) === null && V.cropOf([3000, 0, 0, 3000]).join() === '0,0,3000,3000', 'cropOf: all 0 = none, under 100 mm or not four numbers = none, corners ordered');
    // templates carry the scale (not the crop or the underlay)
    ed.modelChange(V.saveTemplate({ name: 'Eighth', cut: 1200, top: 0, bottom: 0, depth: 50, hidden: [], scale: 96 }));
    ed.modelChange(V.setPlanView(L2.guid, { template: 'Eighth' }));
    let eff = V.effectiveView(V.readPlanViews(w()).get(L2.id), V.readTemplates(w()), L2.height);
    ok(eff.scale === 96 && eff.crop?.join() === '-1000,-500,5000,4000' && eff.underlay === L1.guid && eff.template === 'Eighth', 'a template\'s scale (1/8") wins; the crop and the underlay stay the view\'s own', JSON.stringify({ s: eff.scale, c: eff.crop, u: eff.underlay }));
    ed.modelChange(V.deleteTemplate('Eighth'));
    pv = V.readPlanViews(w()).get(L2.id);
    ok(pv.template === '' && pv.scale === 96, 'the template deleted: the view keeps its scale as its own');
    ok(V.effectiveView(null, [], 3000).scale === 0 && V.effectiveView(null, [], 3000).crop === null, 'a level with no settings: no scale (fit), no crop');
    saved.a = ed.save();
    const re = V.readPlanViews(await reopen(saved.a)).get(L2.id);
    ok(re && re.scale === 96 && re.crop?.join() === '-1000,-500,5000,4000' && re.underlay === L1.guid, 'saved and reopened: scale, crop and underlay as they were');

    // the underlay: another level's scene moved into this level's plan
    const T = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1000, 2000, 3000, 1];   // that level 1 m east and 2 m north of this one
    const sc = { wallEdges: [[[0, 0], [4000, 0], [4000, 3000], [0, 3000]]], cut: [{ segs: [100, 100, 200, 100] }], symbols: [{ lines: [[0, 0, 0, 900]], arcs: [{ c: [0, 0], r: 900, a0: 0, a1: Math.PI / 2 }] }], below: [{ segs: [9, 9, 9, 9] }] };
    const U = V.underlaySegments(sc, T);
    ok(U.length === (4 + 1 + 1 + 12) * 4, 'underlaySegments: the walls\' outline (4 edges), a cut element, a door leaf and its swing (12 chords); nothing below the cut', String(U.length / 4));
    ok(U[0] === 1000 && U[1] === 2000 && U[2] === 5000 && U[3] === 2000, 'each point moved into this level\'s plan (+1000, +2000)');
    const lastArc = U.slice(-4);
    ok(near(lastArc[2], 1000, 1e-6) && near(lastArc[3], 2900, 1e-6), 'the swing ends where the arc does (90°, r 900)');

    // sheets: the crop is the view's extent and clips it; the view's scale is the default
    const scene = { walls: [{ poly: [[-3000, -3000], [9000, -3000], [9000, 9000], [-3000, 9000]] }], crop: [0, 0, 4000, 2000], scale: 48, underlay: { segs: [0, 0, 4000, 0] } };
    const input = { plans: [{ ref: L2.guid, title: 'Level 2 plan', scene }], elevations: [], sections: [], schedules: [] };
    const sh = RS.composeSheet({ number: 'A-601', title: 'Crop', views: [{ kind: 'plan', ref: L2.guid, x: 200, y: 140, ratio: 0 }] }, input, { paper: 'tabloid', units: 'ftin' });
    const v0 = sh.views[0];
    ok(v0.ratio === 48 && v0.label === '1/4" = 1\'-0"', 'placed with "scale 0": the plan\'s own scale (1/4")', v0.label);
    ok(near(v0.box[2] - v0.box[0], 4000 / 48, 1e-9) && near(v0.box[3] - v0.box[1], 2000 / 48, 1e-9), 'its size on the sheet = the crop at that scale (not the 12 m wall square)');
    const ci = sh.items.findIndex((it) => it.t === 'clip'), ui = sh.items.findIndex((it) => it.t === 'unclip');
    ok(ci >= 0 && ui > ci && near(sh.items[ci].rect[0], v0.box[0], 1e-9) && near(sh.items[ci].rect[3], v0.box[3], 1e-9), 'the plan\'s items sit between a clip to the crop rectangle and its end');
    ok(sh.items.slice(ci, ui).some((it) => it.t === 'line' && it.g === 0.72), 'the underlay drawn light grey (0.72) inside the clip');
    const placed = RS.composeSheet({ number: 'A-602', views: [{ kind: 'plan', ref: L2.guid, x: 200, y: 140, ratio: 96 }] }, input, { paper: 'tabloid', units: 'ftin' });
    ok(placed.views[0].ratio === 96, 'a scale chosen on the sheet still wins over the view\'s');
    const pdf = latin(RS.setPdf([sh], { paper: 'tabloid', title: 'Crop' }));
    ok(/ re W n\n/.test(pdf) && /\nQ\n/.test(pdf), 'the sheet\'s PDF clips with a rectangle path (re W n … Q)');
    const svg = RS.sheetSvg(sh, { paper: 'tabloid' });
    ok(/<clipPath id="cc-crop-0"><rect /.test(svg) && /<g clip-path="url\(#cc-crop-0\)">/.test(svg) && (svg.match(/<g /g) || []).length === (svg.match(/<\/g>/g) || []).length, 'the preview SVG clips the same way (a clipPath, groups closed)');
    const set = RS.buildSet({ plans: [{ title: 'Level 2 plan', scene }] }, { paper: 'tabloid', units: 'ftin' });
    ok(set.length === 1 && set[0].items.some((it) => it.t === 'clip'), 'the drawing set\'s plan sheet is cropped too');
    // the plan's own Print
    const pp = planPdf({ ...scene }, { title: 'Level 2', units: 'ftin', paper: 'letter', scale: 48 });
    const ptxt = latin(pp.bytes);
    ok(pp.scale.ratio === 48 && / re W n\n/.test(ptxt) && /\nQ\n/.test(ptxt), 'Print: at the view\'s scale, clipped to the crop');
    const auto = planPdf({ walls: scene.walls, crop: [0, 0, 4000, 2000] }, { units: 'ftin', paper: 'letter' });
    const wide = planPdf({ walls: scene.walls }, { units: 'ftin', paper: 'letter' });
    ok(auto.scale.ratio < wide.scale.ratio, 'with no scale, a cropped plan fits at a larger scale than the whole level (' + auto.scale.label + ' vs ' + wide.scale.label + ')');
  }

  // ======================================================================================== (b) reflected ceiling plans
  if (want('b')) {
    console.log('== DC.117 (b) reflected ceiling plans');
    const V = await import(path.join(APP, 'views-model.js'));
    const RS = await import(path.join(APP, 'res-sheets.js'));
    const { planCut } = await import(path.join(APP, 'model-plan.js'));
    const { CEILING_PATTERNS, readDerived } = await import(path.join(APP, 'model-slabs.js'));
    const B = await building();
    const { ed, levels, w, OPS } = B;
    const [L1, L2] = levels;
    // the ceiling plan's own settings, beside the floor plan's
    ed.modelChange(V.setPlanView(L1.guid, { cut: 1500 }));
    let n0 = ed.changes.length;
    ed.modelChange(V.setPlanView(L1.guid, { cut: 2200, top: 0, scale: 50, crop: [0, 0, 6000, 4000] }, 'rcp'), { label: 'RCP' });
    const rc = V.readPlanViews(w(), 'rcp').get(L1.id), fp = V.readPlanViews(w()).get(L1.id);
    ok(ed.changes.length === n0 + 1 && rc && rc.kind === 'rcp' && rc.cut === 2200 && rc.scale === 50 && rc.crop.join() === '0,0,6000,4000', 'a ceiling plan\'s range: one undo step, cut 2200, 1:50, its own crop', JSON.stringify(rc));
    ok(fp.cut === 1500 && fp.crop === null, 'the floor plan of that level keeps its own (cut 1500, no crop)');
    let txt = new TextDecoder().decode(ed.save());
    ok(/'CadCraft_CeilingPlan'/.test(txt) && /'CadCraft_PlanView'/.test(txt), 'kept on the level as CadCraft_CeilingPlan, apart from CadCraft_PlanView');
    let refused = '';
    try { ed.modelChange(V.saveTemplate({ name: 'T', cut: 1200 })); ed.modelChange(V.setPlanView(L1.guid, { template: 'T' }, 'rcp')); } catch (e) { refused = e.key; }
    ok(refused === 'model.err.vr.template', 'a ceiling plan takes no view template');
    refused = '';
    try { ed.modelChange(V.setPlanView(L1.guid, { cut: 3500 }, 'rcp')); } catch (e) { refused = e.key; }
    ok(refused === 'model.err.vr.order', 'a ceiling cut above the level\'s height (3000): refused');
    let eff = V.effectiveView(null, [], 3000, 'rcp');
    ok(eff.kind === 'rcp' && eff.cut === 2300 && eff.top === 3000, 'no settings: a ceiling plan looks up from 2300 to the level\'s height');
    eff = V.effectiveView(V.readPlanViews(w(), 'rcp').get(L1.id), V.readTemplates(w()), 3000, 'rcp');
    ok(eff.cut === 2200 && eff.scale === 50 && eff.top === 3000, 'with its own: cut 2200, top = the level\'s height, 1:50');
    ok(V.SHEET_KINDS.includes('rcp'), 'sheets take ceiling plans');

    // looking up: what planCut gives with the ceiling plan's settings (model-ui.js: bottom = the cut, depth 0, top = the level)
    const box = (x, z0, z1, wd = 500) => { const P = [], I = []; for (const z of [z0, z1]) for (const [a, b] of [[0, 0], [1, 0], [1, 1], [0, 1]]) P.push(x + a * wd, b * wd, z); for (const [a, b, c] of [[0, 1, 2], [0, 2, 3], [4, 6, 5], [4, 7, 6], [0, 4, 5], [0, 5, 1], [1, 5, 6], [1, 6, 2], [2, 6, 7], [2, 7, 3], [3, 7, 4], [3, 4, 0]]) I.push(a, b, c); return { P, I }; };
    const parts = [box(0, 0, 3000, 200), box(1000, 0, 750), box(2000, 2438, 2451, 2000), box(2500, 2338, 2438, 600), box(5000, 3200, 3400)];   // wall, table, ceiling, light, above the level
    const P = [], I = [], E = { ids: [], t0: [], tn: [], v0: [], vn: [] };
    parts.forEach((b, k) => { const v0 = P.length / 3; E.ids.push(20 + k); E.t0.push(I.length / 3); E.tn.push(b.I.length / 3); E.v0.push(v0); E.vn.push(b.P.length / 3); P.push(...b.P); I.push(...b.I.map((i) => i + v0)); });
    const M = { batches: [{ storey: 1, positions: Float32Array.from(P), indices: Uint32Array.from(I), elems: E }] };
    const I4 = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
    const up = planCut(M, { M: I4, storey: 1, cutZ: 2300, bottom: 2300, depth: 0, top: 3000 });
    ok(up.cut.has(20) && !up.below.size, 'looking up from 2300: the wall is cut, nothing below the cut is drawn (the table left out)');
    ok(up.above.has(22) && up.above.has(23) && !up.above.has(24), 'the ceiling and the light above the cut are drawn; what starts above the level is not');

    // a ceiling's pattern: one undo step, kept, a short list only
    const room = await (async () => { ed.modelChange(OPS.drawWallPath({ storey: L1.guid, points: [[0, 0], [6000, 0], [6000, 4000], [0, 4000], [0, 0]], guids: [], typeKey: 'ext-2x6', height: 3000 })); return OPS.snapshotModel(ed); })();
    ed.modelChange(OPS.placeCeiling({ storey: L1.guid, seed: [3000, 2000], height: 2438.4 }));
    const ce = readDerived(w()).ceilings[0];
    ok(room.walls.length === 4 && ce && ce.pattern === '', 'a room and its ceiling (no pattern yet)');
    n0 = ed.changes.length;
    ed.modelChange(OPS.changeDerived([ce.guid], { pattern: '2x4' }));
    ok(ed.changes.length === n0 + 1 && readDerived(w()).ceilings[0].pattern === '2x4' && near(readDerived(w()).ceilings[0].height, 2438.4, 0.01), 'pattern 2\' × 4\': one undo step; the height stays');
    refused = '';
    try { ed.modelChange(OPS.changeDerived([ce.guid], { pattern: 'checkerboard' })); } catch (e) { refused = e.key; }
    ok(refused === 'model.err.ce.pattern' && readDerived(w()).ceilings[0].pattern === '2x4', 'a pattern that is not on the list: refused');
    ok(CEILING_PATTERNS.map((p) => p.key).join() === ',600x600,600x1200,2x2,2x4' && near(CEILING_PATTERNS[4].v, 1219.2, 1e-9), 'the list: none, 600 × 600, 600 × 1200, 2\' × 2\', 2\' × 4\' (1219.2 mm)');

    // the grid drawn on it
    const rect = [[0, 0], [3000, 0], [3000, 2400], [0, 2400]];
    let g = V.ceilingGrid(rect, [], { u: 600, v: 600 });
    const xs = [], ys = [];
    for (let i = 0; i < g.length; i += 4) (g[i] === g[i + 2] ? xs : ys).push(g[i] === g[i + 2] ? g[i] : g[i + 1]);
    ok(xs.sort((a, b) => a - b).join() === '600,1200,1800,2400' && ys.sort((a, b) => a - b).join() === '300,900,1500,2100', 'a 3 × 2.4 m ceiling, 600 grid: a tile centred (x lines 600…2400, y lines 300…2100)', xs.join() + ' / ' + ys.join());
    ok(g.every((v, i) => (i % 2 ? v >= 0 && v <= 2400 : v >= 0 && v <= 3000)), 'every line stays inside the outline');
    const L = [[0, 0], [4000, 0], [4000, 2000], [2000, 2000], [2000, 4000], [0, 4000]];
    g = V.ceilingGrid(L, [], { u: 1000, v: 1000 });
    const x3 = []; for (let i = 0; i < g.length; i += 4) if (g[i] === g[i + 2] && near(g[i], 3500, 1e-6)) x3.push(g[i + 1], g[i + 3]);
    ok(x3.length === 2 && near(Math.min(...x3), 0) && near(Math.max(...x3), 2000), 'an L-shaped ceiling: a line in the short leg stops at the notch (x 3500: y 0…2000)', x3.join());
    g = V.ceilingGrid(rect, [[[1000, 800], [2000, 800], [2000, 1600], [1000, 1600]]], { u: 600, v: 600 });
    const mid = []; for (let i = 0; i < g.length; i += 4) if (g[i] === g[i + 2] && near(g[i], 1200, 1e-6)) mid.push([g[i + 1], g[i + 3]]);
    ok(mid.length === 2 && mid.some(([a, b]) => near(Math.max(a, b), 800)) && mid.some(([a, b]) => near(Math.min(a, b), 1600)), 'a hole (an opening in the ceiling): the line through it is cut in two', JSON.stringify(mid));
    ok(V.ceilingGrid(rect, [], CEILING_PATTERNS[0]).length === 0 && V.ceilingGrid([], [], { u: 600, v: 600 }).length === 0, 'no pattern, or no outline: no lines');

    // a light at the ceiling: placed with z, its top at the ceiling's underside
    const item = JSON.parse(fs.readFileSync(path.join(ROOT, 'tools/library/seed/range.item.json'), 'utf8'));
    const h = item.body.h;
    const r = ed.placeItem(item, { storey: L1.id, x: 3000, y: 2000, rot: 0, itemNumber: '1', quantity: 1, z: 2438.4 - h });
    const occ = ed.api.GetLine(ed.mid, r.id, false), lp = ed.api.GetLine(ed.mid, occ.ObjectPlacement.value, false), ax = ed.api.GetLine(ed.mid, lp.RelativePlacement.value, false), loc = ed.api.GetLine(ed.mid, ax.Location.value, false);
    const z = Number(loc.Coordinates[2]?.value ?? loc.Coordinates[2]);
    ok(near(z, 2438.4 - h, 0.01), 'placed with z: its placement sits ' + (2438.4 - h).toFixed(1) + ' above the level (top at the ceiling, 2438.4)', String(z));
    const r0 = ed.placeItem(item, { storey: L1.id, x: 1000, y: 1000, rot: 0, itemNumber: '2', quantity: 1 });
    const z0 = (() => { const o = ed.api.GetLine(ed.mid, r0.id, false), l = ed.api.GetLine(ed.mid, o.ObjectPlacement.value, false), a = ed.api.GetLine(ed.mid, l.RelativePlacement.value, false), c = ed.api.GetLine(ed.mid, a.Location.value, false); return Number(c.Coordinates[2]?.value ?? c.Coordinates[2]); })();
    ok(z0 === 0, 'without z: on the floor, as before');

    // on a sheet
    const scene = { walls: [{ poly: rect }], kind: 'rcp', below: [{ segs: [0, 0, 3000, 2400] }], symbols: [{ thin: [[600, 0, 600, 2400]] }], rooms: [{ at: [1500, 1200], label: ['CLG 8\'-0"'] }], scale: 50 };
    const sh = RS.composeSheet({ number: 'A-701', views: [{ kind: 'rcp', ref: L1.guid, x: 200, y: 140, ratio: 0 }] }, { plans: [], rcps: [{ ref: L1.guid, title: 'Level 1 ceiling plan', scene }], elevations: [], sections: [], schedules: [] }, { paper: 'tabloid', units: 'mm' });
    ok(sh.views.length === 1 && sh.views[0].kind === 'rcp' && sh.views[0].ratio === 50 && sh.items.some((it) => it.t === 'text' && it.s === 'Level 1 ceiling plan') && sh.items.some((it) => it.t === 'text' && it.s === 'CLG 8\'-0"'), 'composeSheet: a ceiling plan placed like a plan, at its scale, with its title and the height tag');
    ok(!RS.composeSheet({ views: [{ kind: 'rcp', ref: 'gone', x: 1, y: 1 }] }, { plans: [], rcps: [] }, { units: 'mm' }).views.length, 'a ceiling plan whose level is gone: missing, nothing drawn');
    saved.b = ed.save();
    const re = await reopen(saved.b);
    ok(V.readPlanViews(re, 'rcp').get(L1.id)?.cut === 2200 && readDerived(re).ceilings[0]?.pattern === '2x4', 'saved and reopened: the ceiling plan\'s range and the ceiling\'s pattern');
  }

  // ============================================================================================== (c) callout views
  if (want('c')) {
    console.log('== DC.117 (c) callout views');
    const V = await import(path.join(APP, 'views-model.js'));
    const RS = await import(path.join(APP, 'res-sheets.js'));
    const DR = await import(path.join(APP, 'drafting.js'));
    const B = await building();
    const { ed, levels, w } = B;
    const [L1, L2] = levels;
    const G = () => new Set(levels.map((l) => l.guid));
    let n0 = ed.changes.length;
    const r1 = ed.modelChange(V.saveCallout({ name: 'Detail A', parent: 'plan:' + L1.guid, crop: [3000, 2500, 1000, 1000], scale: 20 }), { label: 'Callout' });
    let co = V.readCallouts(w());
    ok(ed.changes.length === n0 + 1 && co.length === 1 && co[0].id === 'callout-1' && r1.callout === 'callout-1', 'a callout of Level 1\'s floor plan: one undo step, id callout-1', JSON.stringify(co));
    ok(co[0].crop.join() === '1000,1000,3000,2500' && co[0].scale === 20 && co[0].parent === 'plan:' + L1.guid, 'its rectangle kept in order, 1:20, its parent the floor plan');
    let txt = new TextDecoder().decode(ed.save());
    ok(/'CadCraft_CalloutViews'/.test(txt) && /IFCPROPERTYSINGLEVALUE\('callout-1',\$,IFCTEXT\('\{"name":"Detail A","parent":"plan:/.test(txt), 'kept on the project as CadCraft_CalloutViews: one IfcText per callout (JSON)');
    // a callout of a callout, and one of a ceiling plan
    ed.modelChange(V.saveCallout({ name: 'Detail A1', parent: 'callout:callout-1', crop: [1500, 1200, 2200, 1800], scale: 10 }));
    ed.modelChange(V.saveCallout({ name: 'Ceiling detail', parent: 'rcp:' + L2.guid, crop: [0, 0, 2000, 2000], scale: 25 }));
    co = V.readCallouts(w());
    const root2 = V.calloutRoot(co, 'callout-2', G()), root3 = V.calloutRoot(co, 'callout-3', G());
    ok(co.length === 3 && root2?.kind === 'plan' && root2.level === L1.guid && root2.chain.join() === 'callout-1,callout-2', 'a callout of a callout: drawn from Level 1\'s floor plan (chain callout-1 → callout-2)', JSON.stringify(root2));
    ok(root3?.kind === 'rcp' && root3.level === L2.guid, 'a callout of Level 2\'s ceiling plan: drawn as that ceiling plan');
    ok(V.calloutsInside(co, 'callout-1').join() === 'callout-2' && !V.calloutsInside(co, 'callout-2').length, 'calloutsInside: callout-1 holds callout-2');
    // refusals: nothing changes
    const refusal = (c) => { try { ed.modelChange(V.saveCallout(c)); return ''; } catch (e) { return e.key || e.message; } };
    n0 = ed.changes.length;
    ok(refusal({ name: 'X', parent: 'plan:0123456789012345678901', crop: [0, 0, 1000, 1000] }) === 'model.err.co.parent', 'a parent level that is not there: refused');
    ok(refusal({ id: 'callout-1', parent: 'callout:callout-2' }) === 'model.err.co.parent' && refusal({ id: 'callout-1', parent: 'callout:callout-1' }) === 'model.err.co.parent', 'a callout inside itself (or inside its own callout): refused');
    ok(refusal({ name: 'X', parent: 'plan:' + L1.guid, crop: [0, 0, 50, 1000] }) === 'model.err.vr.crop' && refusal({ name: '  ', parent: 'plan:' + L1.guid, crop: [0, 0, 1000, 1000] }) === 'model.err.co.name', 'a rectangle 50 mm wide, a blank name: refused');
    ok(ed.changes.length === n0 && V.readCallouts(w()).length === 3, 'after the refusals nothing changed');
    // a change keeps what it does not name
    ed.modelChange(V.saveCallout({ id: 'callout-1', name: 'Detail B', scale: 25 }));
    co = V.readCallouts(w());
    const c1 = co.find((c) => c.id === 'callout-1');
    ok(c1.name === 'Detail B' && c1.scale === 25 && c1.crop.join() === '1000,1000,3000,2500' && c1.parent === 'plan:' + L1.guid, 'renamed and 1:25: its rectangle and parent stay');
    // a parent gone: missing, still listed
    ok(V.calloutRoot(co, 'callout-3', new Set([L1.guid])) === null && V.calloutRoot(co, 'callout-2', new Set([L1.guid])) !== null, 'Level 2 gone: its ceiling-plan callout has no root (missing); Level 1\'s still do');
    ok(V.calloutRoot([{ id: 'callout-1', parent: 'callout:callout-2' }, { id: 'callout-2', parent: 'callout:callout-1' }], 'callout-1', G()) === null, 'a loop (a file edited by hand): missing, not an endless walk');
    // on a sheet: at its own scale, cropped; a missing one listed as missing
    ok(V.SHEET_KINDS.includes('callout'), 'sheets take callouts');
    const scene = { walls: [{ poly: [[-3000, -3000], [9000, -3000], [9000, 9000], [-3000, 9000]] }], crop: c1.crop, scale: c1.scale, symbols: [], rooms: [] };
    const input = { plans: [], rcps: [], callouts: [{ ref: 'callout-1', title: 'Detail B', scene }], elevations: [], sections: [], schedules: [] };
    const sh = RS.composeSheet({ number: 'A-801', views: [{ kind: 'callout', ref: 'callout-1', x: 200, y: 140, ratio: 0 }, { kind: 'callout', ref: 'callout-3', x: 100, y: 100, ratio: 0 }] }, input, { paper: 'tabloid', units: 'mm' });
    ok(sh.views.length === 1 && sh.views[0].ratio === 25 && near(sh.views[0].box[2] - sh.views[0].box[0], 2000 / 25, 1e-9) && sh.items.some((it) => it.t === 'clip') && sh.items.some((it) => it.t === 'text' && it.s === 'Detail B'), 'composeSheet: the callout at its 1:25, as big as its rectangle, clipped to it, titled');
    ok(sh.missing.join() === '1', 'the callout not offered (parent gone) is listed as missing on the sheet');
    ed.modelChange(V.saveSheet({ number: 'A-801', title: 'Details', paper: 'tabloid', views: [{ kind: 'callout', ref: 'callout-1', x: 200, y: 140, ratio: 0 }] }));
    ok(V.readSheets(w())[0]?.views[0]?.kind === 'callout', 'a sheet saved with a callout on it reads back as kind callout');
    // delete: with the callouts inside it and the drafting drawn in them, one step; undo brings all back
    ed.modelChange(DR.addDrafting({ level: L1.guid, view: 'callout:callout-2', kind: 'lines', pts: [[1600, 1300], [2100, 1700]] }));
    ed.modelChange(DR.addDrafting({ level: L1.guid, view: 'plan:' + L1.guid, kind: 'lines', pts: [[0, 0], [500, 0]] }));
    n0 = ed.changes.length;
    const del = ed.modelChange(V.deleteCallout('callout-1'));
    co = V.readCallouts(w());
    let dr = DR.readDrafting(w());
    ok(ed.changes.length === n0 + 1 && co.map((c) => c.id).join() === 'callout-3' && del.callouts.join() === 'callout-1,callout-2' && del.drafting === 1, 'delete callout-1: callout-2 inside it and its drafting go too, one undo step', JSON.stringify({ co: co.map((c) => c.id), del }));
    ok(dr.length === 1 && dr[0].view === 'plan:' + L1.guid, 'the floor plan\'s own drafting stays');
    ed.undo();
    ok(V.readCallouts(w()).length === 3 && DR.readDrafting(w()).length === 2, 'undo: both callouts and the drafting back');
    saved.c = ed.save();
    const re = V.readCallouts(await reopen(saved.c));
    ok(re.length === 3 && re.find((c) => c.id === 'callout-2')?.parent === 'callout:callout-1', 'saved and reopened: the three callouts, the nested one still inside callout-1');
  }

  // ============================================================================================ (d) drafting in a view
  if (want('d')) {
    console.log('== DC.117 (d) drafting lines and hatch regions');
    const DR = await import(path.join(APP, 'drafting.js'));
    const RS = await import(path.join(APP, 'res-sheets.js'));
    const { planPdf } = await import(path.join(APP, 'model-pdf.js'));
    const B = await building();
    const { ed, levels, w } = B;
    const [L1, L2] = levels;
    const view = 'plan:' + L1.guid;
    let n0 = ed.changes.length;
    const r = ed.modelChange(DR.addDrafting({ level: L1.guid, view, kind: 'lines', pts: [[0, 0], [2000, 0], [2000, 1500]] }), { label: 'Line' });
    let dr = DR.readDrafting(w());
    ok(ed.changes.length === n0 + 1 && dr.length === 1 && dr[0].guid === r.guid, 'a drafting polyline: one undo step');
    ok(dr[0].kind === 'lines' && dr[0].view === view && dr[0].storey === L1.id && !dr[0].closed && dr[0].pts.map((q) => q.join(' ')).join(',') === '0 0,2000 0,2000 1500', 'read back: its points, open, in Level 1, drawn in Level 1\'s floor plan', JSON.stringify(dr[0]));
    ed.modelChange(DR.addDrafting({ level: L1.guid, view, kind: 'lines', pts: [[0, 2000], [1000, 2000], [1000, 3000], [0, 3000]], closed: true }));
    ed.modelChange(DR.addDrafting({ level: L1.guid, view, kind: 'hatch', pts: [[0, 0], [4000, 0], [4000, 3000], [0, 3000]], holes: [[[1000, 1000], [2000, 1000], [2000, 2000], [1000, 2000]]], pattern: 'cross', scale: 2 }));
    ed.modelChange(DR.addDrafting({ level: L2.guid, view: 'rcp:' + L2.guid, kind: 'hatch', pts: [[0, 0], [1000, 0], [1000, 1000]], pattern: 'solid' }));
    ed.modelChange(DR.addDrafting({ level: L1.guid, view, kind: 'hatch', pts: [[5000, 0], [6000, 0], [6000, 1000], [5000, 1000]], pattern: 'cross', scale: 2 }));
    dr = DR.readDrafting(w());
    const rect = dr[1], hat = dr.find((d) => d.kind === 'hatch' && d.holes.length), sol = dr.find((d) => d.pattern === 'solid' && d.kind === 'hatch');
    ok(rect.closed && rect.pts.length === 4, 'a rectangle: closed, four corners (the closing point not repeated)');
    ok(hat && hat.pattern === 'cross' && hat.scale === 2 && hat.pts.length === 4 && hat.holes.length === 1 && hat.holes[0].length === 4, 'a hatch region: cross-hatch at scale 2, its outline and its hole read back', JSON.stringify(hat && { p: hat.pattern, s: hat.scale, h: hat.holes }));
    ok(sol && sol.view === 'rcp:' + L2.guid && sol.storey === L2.id, 'a solid fill in Level 2\'s ceiling plan, contained in Level 2');
    const txt = new TextDecoder().decode(ed.save());
    const count = (re) => (txt.match(re) || []).length;
    ok(count(/IFCANNOTATION\('[^']+',#\d+,'(Drafting line|Hatch region)',\$,'Drafting'/g) === 5, 'five IfcAnnotations, ObjectType "Drafting"');
    ok(count(/IFCGEOMETRICCURVESET\(/g) >= 2 && count(/IFCANNOTATIONFILLAREA\(/g) === 3 && count(/IFCSHAPEREPRESENTATION\([^;]*'Annotation','Annotation2D'/g) === 3, 'lines as an IfcGeometricCurveSet, hatches as IfcAnnotationFillArea (Annotation2D)');
    ok(count(/IFCFILLAREASTYLE\('CadCraft drafting: cross x2'/g) === 1 && count(/IFCFILLAREASTYLEHATCHING\(/g) === 2 && count(/IFCSTYLEDITEM\(#\d+/g) >= 3, 'the cross-hatch style is shared by both regions using it: one IfcFillAreaStyle, two IfcFillAreaStyleHatching (45° and 135°)', (txt.match(/IFCFILLAREASTYLE[^;]*;/g) || []).join(' ').slice(0, 400));
    ok(/IFCFILLAREASTYLE\('CadCraft drafting: solid x1',\(#\d+\)/.test(txt), 'Solid: a fill area style with one colour');
    ok(/IFCPROPERTYSINGLEVALUE\('View',\$,IFCLABEL\('plan:/.test(txt) && /'PatternScale',\$,IFCREAL\(2\.?\)/.test(txt), 'CadCraft_Drafting: View, Kind, Pattern, PatternScale');
    // refusals
    const refusal = (spec) => { try { ed.modelChange(DR.addDrafting({ level: L1.guid, view, ...spec })); return ''; } catch (e) { return e.key || e.message; } };
    n0 = ed.changes.length;
    ok(refusal({ kind: 'lines', pts: [[0, 0], [5, 0]] }) === 'model.err.dr.short' && refusal({ kind: 'hatch', pts: [[0, 0], [1000, 0]] }) === 'model.err.dr.area' && refusal({ kind: 'hatch', pts: [[0, 0], [1000, 0], [2000, 0]] }) === 'model.err.dr.area', 'a line 5 mm long, a hatch of two corners or no area: refused');
    ok(refusal({ kind: 'hatch', pts: [[0, 0], [1000, 0], [0, 1000]], pattern: 'tartan' }) === 'model.err.dr.pattern' && refusal({ kind: 'lines', pts: [[0, 0], [1000, 0]], view: 'section:x' }) === 'model.err.dr.view', 'a pattern not on the list, a view that is not a plan / ceiling plan / callout: refused');
    ok(ed.changes.length === n0, 'nothing changed after the refusals');
    // change, move, delete: one step each
    n0 = ed.changes.length;
    ed.modelChange(DR.changeDrafting([hat.guid], { pattern: 'earth', scale: 1.5 }));
    let h2 = DR.readDrafting(w()).find((d) => d.guid === hat.guid);
    ok(ed.changes.length === n0 + 1 && h2.pattern === 'earth' && h2.scale === 1.5 && h2.holes.length === 1, 'Properties › Pattern earth, scale 1.5: one step; its hole kept');
    ed.modelChange(DR.moveDrafting([hat.guid, r.guid], 500, -250));
    h2 = DR.readDrafting(w()).find((d) => d.guid === hat.guid);
    const l2 = DR.readDrafting(w()).find((d) => d.guid === r.guid);
    ok(h2.pts[0].join() === '500,-250' && h2.holes[0][0].join() === '1500,750' && l2.pts[2].join() === '2500,1250', 'moved 500, −250 (both picked, one step): the outline, its hole and the polyline');
    ed.undo();
    ok(DR.readDrafting(w()).find((d) => d.guid === hat.guid).pts[0].join() === '0,0', 'undo: back where they were');
    ed.modelChange(DR.removeDrafting([rect.guid]));
    ok(!DR.readDrafting(w()).some((d) => d.guid === rect.guid), 'deleted');
    ed.undo();
    ok(DR.readDrafting(w()).some((d) => d.guid === rect.guid), 'undo: the rectangle back');
    // the patterns
    const sq = [[0, 0], [3000, 0], [3000, 3000], [0, 3000]], hole = [[1000, 1000], [2000, 1000], [2000, 2000], [1000, 2000]];
    const inside = (x, y, p) => { let c = false; for (let i = 0, j = p.length - 1; i < p.length; j = i++) if ((p[i][1] > y) !== (p[j][1] > y) && x < (p[j][0] - p[i][0]) * (y - p[i][1]) / (p[j][1] - p[i][1]) + p[i][0]) c = !c; return c; };
    let g = DR.hatchSegments(sq, [], 'diagonal', 1);
    let allIn = true, all45 = true;
    for (let i = 0; i < g.length; i += 4) { if (![0, 1].every((k) => g[i + 2 * k] >= -1e-6 && g[i + 2 * k] <= 3000 + 1e-6 && g[i + 2 * k + 1] >= -1e-6 && g[i + 2 * k + 1] <= 3000 + 1e-6)) allIn = false; if (Math.abs(Math.abs(Math.atan2(g[i + 3] - g[i + 1], g[i + 2] - g[i]) * 180 / Math.PI) - 45) > 1e-6 && Math.abs(Math.abs(Math.atan2(g[i + 3] - g[i + 1], g[i + 2] - g[i]) * 180 / Math.PI) - 135) > 1e-6) all45 = false; }
    ok(g.length / 4 >= 25 && g.length / 4 <= 31 && allIn && all45, 'Diagonal in a 3 m square: about 28 lines 150 mm apart at 45°, all inside (' + g.length / 4 + ')');
    g = DR.hatchSegments(sq, [hole], 'cross', 1);
    let hit = 0;
    for (let i = 0; i < g.length; i += 4) if (inside((g[i] + g[i + 2]) / 2, (g[i + 1] + g[i + 3]) / 2, hole)) hit++;
    ok(g.length > 0 && hit === 0, 'Cross-hatch with a hole: no stroke crosses the hole');
    ok(DR.hatchSegments(sq, [], 'diagonal', 2).length < DR.hatchSegments(sq, [], 'diagonal', 1).length * 0.6, 'scale 2: half as many lines');
    const per = DR.PATTERNS.map((p) => [p.key, DR.hatchSegments(sq, [], p.key, 1).length / 4]);
    ok(DR.PATTERN_KEYS.join() === 'solid,diagonal,cross,concrete,insulation,earth' && per.every(([k, n]) => (k === 'solid' ? n === 0 : n > 5)), 'the six patterns: solid (a fill, no strokes) and five that draw strokes ' + per.map(([k, n]) => k + ' ' + n).join(', '));
    const big = [[0, 0], [100000, 0], [100000, 100000], [0, 100000]];
    ok(DR.hatchSegments(big, [], 'cross', 0.1).length / 4 <= 60000, 'a 100 m square at scale 0.1: made coarser rather than millions of strokes (' + DR.hatchSegments(big, [], 'cross', 0.1).length / 4 + ')');
    const cs = DR.clipSegment([sq, hole], [-500, 1500], [3500, 1500]);
    ok(cs.length === 2 && near(cs[0][0][0], 0) && near(cs[0][1][0], 1000) && near(cs[1][0][0], 2000) && near(cs[1][1][0], 3000), 'clipSegment: a line across the square and its hole → 0–1000 and 2000–3000', JSON.stringify(cs));
    // the scene item, sheets and the PDF
    const it = DR.draftingItem(DR.readDrafting(w()).find((d) => d.guid === hat.guid), 99);
    const its = DR.draftingItem(DR.readDrafting(w()).find((d) => d.pattern === 'solid' && d.kind === 'hatch'), 100);
    ok(it.key === 99 && it.rings.length === 2 && it.segs.length > 0 && !it.solid && its.solid && !its.segs.length, 'draftingItem: a hatch\'s rings and strokes; solid: a fill, no strokes');
    const scene = { walls: [], symbols: [], rooms: [], drafting: [it, its, DR.draftingItem(DR.readDrafting(w()).find((d) => d.guid === r.guid), 101)] };
    const sh = RS.composeSheet({ number: 'A-901', views: [{ kind: 'plan', ref: L1.guid, x: 200, y: 140, ratio: 50 }] }, { plans: [{ ref: L1.guid, title: 'Level 1', scene }] }, { paper: 'tabloid', units: 'mm' });
    ok(sh.views.length === 1 && sh.items.some((x) => x.t === 'fill' && x.g === 0.6) && sh.items.filter((x) => x.t === 'line' && x.w === 0.13).length >= it.segs.length / 4, 'on a sheet: the solid fill (grey 0.6), every hatch stroke, the outlines');
    ok(sh.views[0].box[2] - sh.views[0].box[0] > 4000 / 50, 'a view with only drafting in it is framed on the drafting');
    const pp = planPdf(scene, { units: 'mm', paper: 'a4', scale: 50 });
    const pt = latin(pp.bytes);
    ok(pt.startsWith('%PDF') && /0\.6 g/.test(pt) && /f\*/.test(pt), 'Print: the plan\'s PDF draws the drafting (the solid fill, the strokes)');
    saved.d = ed.save();
    const re = DR.readDrafting(await reopen(saved.d));
    ok(re.length === 5 && re.find((d) => d.guid === hat.guid)?.pattern === 'earth', 'saved and reopened: the five items, the hatch still earth');
    // other schemas and units: an IFC2X3 file (mm) and an IFC4 file in feet
    for (const [name, file, v4] of [['d-x3', 'ios-steel-ifc2x3.ifc', false], ['d-ft', 'ios-steel-ifc4-feet.ifc', true]]) {
      const eng = await quiet(IfcModel.create)(WebIFC, null);
      await quiet((b) => eng.load(b))(fs.readFileSync(path.join(ROOT, 'tools/detailcraft-test/fixtures', file)));
      const { IfcEditor } = await import(path.join(APP, 'ifc-edit.js'));
      const e2 = new IfcEditor(WebIFC, eng);
      const lv = B.OPS.snapshotModel(e2).levels[0];
      e2.modelChange(DR.addDrafting({ level: lv.guid, view: 'plan:' + lv.guid, kind: 'hatch', pts: [[0, 0], [3048, 0], [3048, 3048], [0, 3048]], pattern: 'diagonal' }));
      e2.modelChange(DR.addDrafting({ level: lv.guid, view: 'plan:' + lv.guid, kind: 'lines', pts: [[0, 0], [3048, 3048]] }));
      const w2 = new ModelWriter(WebIFC, e2.api, e2.mid), d2 = DR.readDrafting(w2);
      const t2 = new TextDecoder().decode(e2.save());
      ok(d2.length === 2 && near(d2[0].pts[2][0], 3048, 0.01) && near(d2[1].pts[1][1], 3048, 0.01) && (v4 ? true : /IFCPRESENTATIONSTYLEASSIGNMENT\(\(#\d+\)\)/.test(t2)) && (v4 ? /IFCPOSITIVELENGTHMEASURE\(0\.4921/.test(t2) : /IFCPOSITIVELENGTHMEASURE\(150\.?\)/.test(t2)),
        (v4 ? 'IFC4 in feet: the 10\' square and line read back in mm; the hatch gap written in feet (150 mm = 0.492\')' : 'IFC2X3: drafting written and read back; the style through an IfcPresentationStyleAssignment'), JSON.stringify(d2.map((d) => d.pts)) + (t2.match(/IFCFILLAREASTYLEHATCHING[^;]*;/g) || []).join(' '));
      saved[name] = e2.save();
    }
  }

  // ======================================================================================== IfcOpenShell validation
  if (Object.keys(saved).length) {
    const py = [path.join(ROOT, 'tools/detailcraft-test/venv/bin/python'), path.join(ROOT, 'tools/bimcraft-test/venv/bin/python')].find((p) => fs.existsSync(p));
    if (!py) console.log('  --   no venv with ifcopenshell: schema validation skipped');
    else {
      const { execFileSync } = await import('node:child_process');
      const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'bim-views2-'));
      const files = Object.entries(saved).map(([k, b]) => { const f = path.join(dir, k + '.ifc'); fs.writeFileSync(f, b); return f; });
      if (process.env.BIMCRAFT_VIEWS2_KEEP) { fs.mkdirSync(process.env.BIMCRAFT_VIEWS2_KEEP, { recursive: true }); for (const f of files) fs.copyFileSync(f, path.join(process.env.BIMCRAFT_VIEWS2_KEEP, path.basename(f))); }   // the saved files, for a closer look
      let out = '';
      try { out = execFileSync(py, ['-I', path.join(ROOT, 'tools/bimcraft-test/ifc_validate.py'), ...files], { encoding: 'utf8' }); } catch (e) { out = String(e.stdout || ''); }
      const res = out.trim().split('\n').filter(Boolean).map((l) => JSON.parse(l));
      ok(res.length === files.length && res.every((r) => r.errors === 0), 'IfcOpenShell finds no schema errors in ' + res.map((r) => path.basename(r.file) + ' (' + r.errors + ')').join(', ') + (res.some((r) => r.errors) ? ': ' + res.flatMap((r) => r.first).slice(0, 3).join(' | ') : ''));
      fs.rmSync(dir, { recursive: true, force: true });
    }
  }

  console.log(`\n${good} passed, ${bad} failed`);
  return bad ? 1 : 0;
}
