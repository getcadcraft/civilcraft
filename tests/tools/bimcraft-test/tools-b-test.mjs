/* SPDX-License-Identifier: Apache-2.0 */
/**
 * tools-b-test.mjs — the ten tools of session bk-tools-b-10 in Node: Curtain System, Curtain Grid, Mullion, By Face, Set Work
 * Plane, Show Work Plane (its geometry), Reference Plane, Work Plane Viewer (its section), Model Text, Model Line.
 *   node bin/test-bimcraft.mjs --tools-b
 * Real IFC models made by the app's own operations; every expected number is worked out in the comment beside it. Each tool is
 * saved, reopened and read again; the saved files go through a second reader (IfcOpenShell's schema validation) at the end.
 */
import fs from 'node:fs';
import path from 'node:path';

export async function toolsBMode({ APP, ROOT, WebIFC, IfcModel, quiet }) {
  let bad = 0, good = 0;
  const ok = (cond, label, detail = '') => { if (cond) good++; else bad++; console.log((cond ? '  ok   ' : '  FAIL ') + label + (!cond && detail !== '' ? ' (' + (typeof detail === 'string' ? detail : JSON.stringify(detail)) + ')' : '')); };
  const near = (a, b, e = 0.01) => Math.abs(a - b) <= e;
  const P = await import(path.join(APP, 'workplane/plane.js'));
  const CV = await import(path.join(APP, 'workplane/curve.js'));
  const GL = await import(path.join(APP, 'workplane/glyphs.js'));
  const LY = await import(path.join(APP, 'curtain/layout.js'));
  const WP = await import(path.join(APP, 'model-workplane.js'));
  const CW = await import(path.join(APP, 'model-curtain.js'));
  const OPS = await import(path.join(APP, 'model-ops.js'));
  const { ModelWriter } = await import(path.join(APP, 'model-write.js'));
  const { IfcEditor } = await import(path.join(APP, 'ifc-edit.js'));
  const { ids, val, productTriangles, inv4 } = await import(path.join(APP, 'ifc-util.js'));
  const N = await import(path.join(APP, 'new-model.js'));
  const I18 = await import(path.join(APP, 'i18n.js'));
  I18.init({ locale: 'en', strings: JSON.parse(fs.readFileSync(path.join(APP, 'lang/en.json'), 'utf8')) });
  const saved = {};
  const boot = async (bytes) => { const eng = await quiet(IfcModel.create)(WebIFC, null); await quiet((b) => eng.load(b))(bytes); return new IfcEditor(WebIFC, eng); };
  const fresh = (name, levels = 2, h = 3000) => boot(new TextEncoder().encode(N.newBuilding({ name, levels: N.stackLevels(levels, h, (i) => 'Level ' + (i + 1)), fileName: 'b.ifc', now: new Date('2026-11-11T12:00:00Z') })));
  const W = (ed) => new ModelWriter(WebIFC, ed.api, ed.mid);
  const reopen = async (ed) => boot(ed.save());
  const refusal = (ed, run) => { try { ed.modelChange(run); return ''; } catch (e) { return e.key || e.message; } };
  const danglingRefs = (txt) => {
    const defined = new Set([...txt.matchAll(/^#(\d+)=/gm)].map((m) => m[1])), out = new Set();
    for (const line of txt.split('\n')) for (const m of line.replace(/^#\d+=/, '').replace(/'(?:[^']|'')*'/g, '').matchAll(/#(\d+)/g)) if (!defined.has(m[1])) out.add('#' + m[1]);
    return [...out];
  };
  const qto = (w, id, set) => {
    const out = {}, d = w.defNamed(id, set);
    for (const h of d?.line.Quantities || []) { const q = w.api.GetLine(w.mid, h.value, false); out[val(q.Name)] = Number(val(q.LengthValue ?? q.AreaValue ?? q.VolumeValue ?? q.CountValue)); }
    return out;
  };
  /** The box of an element's own triangles in model mm. */
  const box = (ed, id) => {
    const w = W(ed), g = productTriangles(ed.api, ed.mid, id, w.unitMm, inv4(ed.api.GetCoordinationMatrix(ed.mid))), T = [], lo = [1e99, 1e99, 1e99], hi = [-1e99, -1e99, -1e99];
    for (const i of g.indices) T.push(g.positions[i * 3] * w.unitMm, g.positions[i * 3 + 1] * w.unitMm, g.positions[i * 3 + 2] * w.unitMm);
    for (let i = 0; i < T.length; i += 3) for (let k = 0; k < 3; k++) { lo[k] = Math.min(lo[k], T[i + k]); hi[k] = Math.max(hi[k], T[i + k]); }
    return { lo, hi, n: T.length / 9, T };
  };
  /** The volume inside a closed triangle soup (the divergence theorem), mm3. */
  const volume = (T) => { let v = 0; for (let i = 0; i < T.length; i += 9) { const a = [T[i], T[i + 1], T[i + 2]], b = [T[i + 3], T[i + 4], T[i + 5]], c = [T[i + 6], T[i + 7], T[i + 8]]; v += P.dot(a, P.cross(b, c)) / 6; } return Math.abs(v); };

  // ============================================================================================ the shared mathematics
  console.log('== the plane, the curves, the layout (lib/workplane, lib/curtain)');
  {
    const F = P.linePlane([1000, 2000], [5000, 2000], 300);
    // the upright plane through y = 2000, x along +X, y up: the point (3000, 2000, 1300) is 2000 along and 1000 up, on the plane
    ok(P.toPlane(F, [3000, 2000, 1300]).join() === '2000,1000,0' && P.fromPlane(F, 2000, 1000).join() === '3000,2000,1300' && P.isUpright(F) && !P.isLevel(F), 'an upright plane through a plan line: (3000, 2000, 1300) is 2000 along, 1000 up, 0 off');
    ok(P.dot(P.cross(F.x, F.y), F.n) === 1 && P.levelPlane(3000).n.join() === '0,0,1' && P.isLevel(P.levelPlane(3000)), 'frames are right-handed; a level plane looks down from above');
    const A = P.acrossPlane(P.levelPlane(0), [0, 0], [0, 4000]);
    ok(A.x.join() === '0,1,0' && A.y.join() === '0,0,1' && A.n.join() === '1,0,0', 'a line drawn in plan stands up as a plane square to the plan');
    // a 2 m cube's faces cut by the plane x = 500: the cut is the square 2000 x 2000 (four sides)
    const cube = []; const q = (a, b, c, d) => cube.push(...a, ...b, ...c, ...a, ...c, ...d);
    const c = [[0, 0, 0], [2000, 0, 0], [2000, 2000, 0], [0, 2000, 0], [0, 0, 2000], [2000, 0, 2000], [2000, 2000, 2000], [0, 2000, 2000]];
    q(c[0], c[1], c[2], c[3]); q(c[4], c[5], c[6], c[7]); q(c[0], c[1], c[5], c[4]); q(c[1], c[2], c[6], c[5]); q(c[2], c[3], c[7], c[6]); q(c[3], c[0], c[4], c[7]);
    const sec = P.planeSection(P.frame([500, 0, 0], [1, 0, 0]), cube);
    const len = sec.reduce((s, g) => s + Math.hypot(g[2] - g[0], g[3] - g[1]), 0);
    ok(near(len, 8000), 'a 2 m cube cut by an upright plane: a square, 4 x 2000 = 8000 of cut line', len);
    const fo = P.faceOutline(P.frame([2000, 0, 0], [1, 0, 0]), cube);
    ok(fo && fo.outline.length === 4 && near(fo.area, 4e6) && fo.holes === 0, 'the cube\'s east face read from its triangles: four corners, 2000 x 2000 = 4 000 000 mm2', fo);
    // an arc from (1000, 0) through (0, 1000) to (-1000, 0): half a circle of radius 1000, length pi x 1000 = 3141.593
    const arc = CV.arcThrough([1000, 0], [0, 1000], [-1000, 0]);
    ok(near(arc.r, 1000, 1e-9) && near(arc.c[0], 0, 1e-9) && arc.ccw && near(CV.curveLength('arc', [[1000, 0], [0, 1000], [-1000, 0]]), Math.PI * 1000, 1e-6), 'an arc through three points: radius 1000, centre 0,0, length pi x 1000 = 3141.593');
    ok(CV.curveProblem('arc', [[0, 0], [1, 0], [2, 0]]) === 'inline' && CV.curveProblem('line', [[0, 0]]) === 'short' && CV.curveLength('polyline', [[0, 0], [3000, 0], [3000, 4000]], true) === 12000, 'three points in line are no arc; a closed 3-4-5 triangle is 12 000 long');
  }

  // ============================================================================================ 1 Curtain System
  console.log('== 1 Curtain System: 6000 long, 3000 high, a line every 1500, mullions 50 x 150, panes 25 thick');
  let ed = await fresh('Tools B');
  const L1 = OPS.snapshotModel(ed).levels[0], L2 = OPS.snapshotModel(ed).levels[1];
  const base = CW.wallCurtain({ a: [0, 0], b: [6000, 0], z: 0, height: 3000 });
  let r = ed.modelChange(CW.placeCurtain({ storey: L1.guid, ...base, spacingU: 1500, spacingV: 0 }));
  let cs = CW.readCurtains(W(ed));
  let c = cs[0];
  // grid lines at 1500, 3000, 4500 (none at the ends): four panes; mullions on the three lines and round the border
  ok(cs.length === 1 && c.linesU.map((l) => l.at).join() === '1500,3000,4500' && c.linesV.length === 0 && c.border && c.source === 'line', 'one IfcCurtainWall; grid lines at 1500, 3000, 4500', c.linesU);
  ok(c.plates.length === 4 && c.members.length === 7, 'aggregates 4 IfcPlate and 7 IfcMember (3 on the grid, 4 round the border)', [c.plates.length, c.members.length]);
  let w = W(ed);
  // panes: width 1500 less the border's 50 and half a grid mullion (25) = 1425 at the ends, 1500 - 50 = 1450 between; height 3000 - 2 x 50 = 2900
  const netOf = (id) => qto(w, id, 'Qto_PlateBaseQuantities');
  const nets = c.plates.map((id) => netOf(id).NetArea).sort((a, b) => a - b);
  ok(near(nets[0], 1.425 * 2.9, 1e-6) && near(nets[1], 1.425 * 2.9, 1e-6) && near(nets[2], 1.45 * 2.9, 1e-6) && near(nets[3], 1.45 * 2.9, 1e-6), 'pane net areas: 1425 x 2900 = 4.1325 m2 twice, 1450 x 2900 = 4.205 m2 twice', nets);
  const p0 = netOf(c.plates[0]);
  ok(near(p0.GrossArea, 4.5, 1e-6) && near(p0.Width, 25) && near(p0.NetVolume, p0.NetArea * 0.025, 1e-6) && near(p0.Perimeter, 2 * (p0.NetArea / 2.9 * 1000 + 2900), 0.01), 'a pane: gross 1500 x 3000 = 4.5 m2 (grid line to grid line), 25 thick, volume = net x 0.025', p0);
  // mullions: 3 grid lines x (3000 - 2 x 50) = 8700; border 2 x 3000 (the uprights run through) + 2 x (6000 - 2 x 50) = 17 800; total 26 500
  const mq = c.members.map((id) => qto(w, id, 'Qto_MemberBaseQuantities'));
  const mlen = mq.reduce((s, q) => s + q.Length, 0);
  ok(near(mlen, 26500) && near(c.totals.mullionLength, 26500) && mq.every((q) => near(q.CrossSectionArea, 0.0075, 1e-9) && near(q.NetVolume, 0.0075 * q.Length / 1000, 1e-9)), 'mullion length 3 x 2900 + 2 x 3000 + 2 x 5900 = 26 500; each 50 x 150 = 0.0075 m2', mlen);
  const cq = qto(w, c.id, 'Qto_CurtainWallQuantities');
  // net glass: (1425 + 1450 + 1450 + 1425) x 2900 = 5750 x 2900 = 16.675 m2
  ok(near(cq.Length, 6000) && near(cq.Height, 3000) && near(cq.Width, 150) && near(cq.GrossSideArea, 18, 1e-6) && near(cq.NetSideArea, 16.675, 1e-6), 'Qto_CurtainWallQuantities: 6000 long, 3000 high, 150 deep, 18 m2 gross, 5750 x 2900 = 16.675 m2 of glass', cq);
  // the geometry itself: a pane's box and volume, a mullion's box
  const pb = c.plates.map((id) => box(ed, id)).sort((a, b) => a.lo[0] - b.lo[0]);
  ok(near(pb[0].lo[0], 50) && near(pb[0].hi[0], 1475) && near(pb[0].lo[2], 50) && near(pb[0].hi[2], 2950) && near(pb[0].lo[1], -12.5) && near(pb[0].hi[1], 12.5), 'the first pane\'s solid: x 50 to 1475, z 50 to 2950, 25 thick about the line', [pb[0].lo, pb[0].hi]);
  ok(near(volume(pb[0].T), 1425 * 2900 * 25, 1), 'its volume from the triangles: 1425 x 2900 x 25 = 103 312 500 mm3', volume(pb[0].T));
  const mb = c.members.map((id) => box(ed, id));
  const up = mb.find((b) => near(b.lo[0], 1475) && near(b.hi[0], 1525));
  ok(up && near(up.lo[2], 50) && near(up.hi[2], 2950) && near(up.lo[1], -75) && near(up.hi[1], 75), 'the mullion on the line at 1500: x 1475 to 1525, z 50 to 2950, 150 deep about the line', up && [up.lo, up.hi]);
  const cls = (id) => ed.api.GetLine(ed.mid, id, false);
  ok(val(cls(c.plates[0]).PredefinedType) === 'CURTAIN_PANEL' && val(cls(c.members[0]).PredefinedType) === 'MULLION', 'IfcPlate CURTAIN_PANEL, IfcMember MULLION');
  ok(ed.undo() && CW.readCurtains(W(ed)).length === 0 && !ids(ed.api, ed.mid, 'IFCPLATE').length && !ids(ed.api, ed.mid, 'IFCMEMBER').length, 'undo is one step: the system, its panes and its mullions are gone');
  ok(ed.redo() && CW.readCurtains(W(ed))[0].guid === c.guid && CW.readCurtains(W(ed))[0].plates.length === 4, 'redo makes the same system again (the same GlobalId)');
  ok(refusal(ed, CW.placeCurtain({ storey: L1.guid, frame: base.frame, outline: [[0, 0], [1000, 0], [2000, 0]] })) === 'model.err.cw.outline', 'an outline with no area: refused (nothing to make)');
  // an odd size is made, never refused: 300 long, 200 high
  r = ed.modelChange(CW.placeCurtain({ storey: L1.guid, ...CW.wallCurtain({ a: [0, 9000], b: [300, 9000], z: 0, height: 200 }), spacingU: 0 }));
  ok(CW.readCurtains(W(ed)).length === 2, 'a 300 x 200 system is made as asked (no size is refused)');
  ed.undo();

  // ============================================================================================ 2 Curtain Grid
  console.log('== 2 Curtain Grid: add, move, remove, by spacing');
  const G = c.guid;
  const now = () => CW.readCurtains(W(ed)).find((x) => x.guid === G);
  ed.modelChange(CW.gridChange(G, { dir: 'v', add: 1000 }));
  c = now();
  // a horizontal line at 1000: 8 panes; its mullion stops at the three uprights and the border: 1425 + 1450 + 1450 + 1425 = 5750
  ok(c.linesV.map((l) => l.at).join() === '1000' && c.plates.length === 8 && c.members.length === 11 && near(c.totals.mullionLength, 26500 + 5750), 'a horizontal line at 1000: 8 panes, 11 mullion pieces, 5750 more mullion (26 500 + 5750 = 32 250)', c.totals);
  // net glass now (1425 + 1450 + 1450 + 1425) x (925 + 1925) = 5750 x 2850 = 16.3875 m2
  ok(near(c.totals.net, 16387500) && near(qto(W(ed), c.id, 'Qto_CurtainWallQuantities').NetSideArea, 16.3875, 1e-6), 'glass 5750 x (925 + 1925) = 16.3875 m2', c.totals.net);
  ed.modelChange(CW.gridChange(G, { dir: 'u', move: [0, 1000] }));
  c = now();
  ok(c.linesU.map((l) => l.at).join() === '1000,3000,4500' && c.spacingU === 0 && c.plates.length === 8, 'the first upright line moved from 1500 to 1000: lines at 1000, 3000, 4500; the panes follow');
  const widths = [...new Set(c.plates.map((id) => Math.round(box(ed, id).hi[0] - box(ed, id).lo[0])))].sort((a, b) => a - b);
  ok(widths.join() === '925,1425,1450,1950', 'pane widths now 925, 1950, 1450, 1425', widths);
  ed.modelChange(CW.gridChange(G, { dir: 'u', remove: 1 }));
  c = now();
  ok(c.linesU.map((l) => l.at).join() === '1000,4500' && c.plates.length === 6, 'the line at 3000 removed: 2 lines, 6 panes');
  ed.modelChange(CW.gridChange(G, { dir: 'u', spacing: 2000 }));
  c = now();
  ok(c.linesU.map((l) => l.at).join() === '2000,4000' && c.spacingU === 2000 && c.plates.length === 6, 'by spacing 2000: lines at 2000 and 4000 (none at the end, 6000)');
  ok(refusal(ed, CW.gridChange(G, { dir: 'u', remove: 9 })) === 'model.err.cw.line', 'a line that is not there: refused');
  const before = ed.changes.length;
  ed.undo();
  ok(now().linesU.map((l) => l.at).join() === '1000,4500', 'undo puts the two lines back (one step)');
  ed.redo();

  // ============================================================================================ 3 Mullion
  console.log('== 3 Mullion: one line, all, a profile');
  ed.modelChange(CW.mullionChange(G, { dir: 'u', line: 0, on: false }));
  c = now();
  // the upright at 2000 loses its mullion: the horizontal mullion at 1000 now runs through it: pieces 50..3975 and 4025..5950
  const hz = () => c.members.map((id) => box(ed, id)).filter((b) => near(b.lo[2], 975) && near(b.hi[2], 1025)).map((b) => Math.round(b.hi[0] - b.lo[0])).sort((a, b) => a - b);
  ok(!c.linesU[0].m && c.linesU[1].m && c.members.length === 4 + 1 + 2 && hz().join() === '1925,3925', 'the mullion on the line at 2000 removed: the horizontal one runs through it (3925 and 1925)', hz());
  // the panes beside that line now meet on it: their edge is at 2000
  ok(c.plates.some((id) => near(box(ed, id).hi[0], 2000)) && c.plates.some((id) => near(box(ed, id).lo[0], 2000)), 'the panes on either side of it meet on the grid line (x = 2000)');
  ed.modelChange(CW.mullionChange(G, { dir: 'all', on: false }));
  c = now();
  ok(c.members.length === 0 && !c.border && c.plates.length === 6 && near(c.totals.net, 18e6), 'all mullions removed: 6 panes, no member, the glass is the whole 18 m2');
  ed.modelChange(CW.mullionChange(G, { dir: 'all', on: true, width: 80, depth: 200 }));
  c = now();
  const m80 = c.members.map((id) => qto(W(ed), id, 'Qto_MemberBaseQuantities'));
  // 80 x 200: uprights 2 x (3000 - 160) = 5680; horizontal at 1000: (2000 - 80 - 40) + (2000 - 80) + (2000 - 40 - 80) = 1880 + 1920 + 1880 = 5680; border 2 x 3000 + 2 x (6000 - 160) = 17 680
  ok(c.members.length === 9 && m80.every((q) => near(q.CrossSectionArea, 0.016, 1e-9)) && near(c.totals.mullionLength, 5680 + 5680 + 17680), 'mullions on every line with profile 80 x 200: 9 pieces, 0.016 m2 each, 29 040 in all', c.totals.mullionLength);
  ok(refusal(ed, CW.mullionChange(G, { dir: 'v', line: 5, on: true })) === 'model.err.cw.line', 'a mullion on a line that is not there: refused');
  saved.curtain = ed.save();
  {
    const back = await reopen(ed), cb = CW.readCurtains(W(back))[0];
    ok(cb && cb.guid === G && cb.linesU.map((l) => l.at + ':' + l.m).join() === '2000:true,4000:true' && cb.linesV[0].at === 1000 && cb.mullion.width === 80 && cb.mullion.depth === 200 && cb.plates.length === 6 && cb.members.length === 9 && near(cb.totals.mullionLength, 29040), 'saved and reopened: the same grid, mullions, profile, panes and pieces');
    ok(!danglingRefs(new TextDecoder().decode(ed.save())).length, 'no dangling references in the saved file');
  }

  // ============================================================================================ 4 By Face
  console.log('== 4 By Face: a curtain system on a face, a sloped face, a gable');
  // the east face of a 4000 x 5000 x 6000 mass standing at x = 10 000..14 000: its outline read from the face's triangles
  const eastF = P.frame([14000, 0, 0], [1, 0, 0]);
  const tri = [14000, 0, 0, 14000, 5000, 0, 14000, 5000, 6000, 14000, 0, 0, 14000, 5000, 6000, 14000, 0, 6000];
  const fo = P.faceOutline(eastF, tri);
  ok(fo && near(fo.area, 30e6) && fo.outline.length === 4, 'the face 5000 x 6000 read from its two triangles (30 m2)', fo);
  r = ed.modelChange(CW.placeCurtain({ storey: L1.guid, frame: eastF, outline: fo.outline, source: 'face', host: 'mass-guid', spacingU: 2500, spacingV: 3000 }));
  let f = CW.readCurtains(W(ed)).find((x) => x.source === 'face');
  ok(f && f.host === 'mass-guid' && f.plates.length === 4 && near(f.totals.area, 30e6) && f.frame.n.join() === '1,0,0', 'a system on it: 2 x 2 panes, lying in the face (normal +X)', f?.totals);
  const fb = f.plates.map((id) => box(ed, id));
  ok(fb.every((b) => near(b.lo[0], 14000 - 12.5) && near(b.hi[0], 14000 + 12.5)) && near(Math.min(...fb.map((b) => b.lo[1])), 50) && near(Math.max(...fb.map((b) => b.hi[2])), 5950), 'its panes are 25 thick about x = 14 000, from y 50 to z 5950 (inside the border)');
  // a roof face sloping 45 degrees: 4000 along the eave, 3000 up the slope
  const s45 = Math.SQRT1_2, slope = P.frame([0, 20000, 3000], [0, -s45, s45]);
  r = ed.modelChange(CW.placeCurtain({ storey: L2.guid, frame: slope, outline: [[0, 0], [4000, 0], [4000, 3000], [0, 3000]], source: 'face', spacingU: 2000, mullions: false }));
  f = CW.readCurtains(W(ed)).find((x) => Math.abs(x.frame.n[2] - s45) < 1e-6);
  const sb = f.plates.map((id) => box(ed, id));
  // up the slope 3000 at 45 degrees: 3000 x 0.7071 = 2121.3 up and back; the pane is 25 thick square to the slope (+-8.84 each way)
  ok(f.plates.length === 2 && f.members.length === 0 && near(Math.max(...sb.map((b) => b.hi[2])), 3000 + 3000 * s45 + 12.5 * s45, 0.01) && near(f.totals.net, 12e6), 'on a 45 degree roof face: 2 panes, top at 3000 + 2121.3 + 8.8, 12 m2 of glass, no mullions', Math.max(...sb.map((b) => b.hi[2])));
  // a gable (a triangle 6000 wide, 3000 high): the panes are cut to it; their gross areas add up to the gable's 9 m2
  const gable = [[0, 0], [6000, 0], [3000, 3000]];
  const gl = LY.layoutCurtain({ outline: gable, linesU: [{ at: 3000, m: true }], linesV: [{ at: 1000, m: true }], border: false, mullion: { width: 50, depth: 150 }, panel: { thickness: 25 } });
  ok(gl.panels.length === 4 && near(gl.totals.gross, 9e6) && near(gl.totals.area, 9e6), 'a gable outline: 4 panes cut to the triangle, gross areas add up to 6000 x 3000 / 2 = 9 m2', gl.totals);
  // the horizontal mullion at 1000 spans the gable's width there (6000 - 2 x 1000 = 4000) less the upright's 50: 2 x 1975
  ok(gl.mullions.filter((m) => m.kind === 'v').map((m) => Math.round(m.length)).join() === '1975,1975' && near(gl.mullions.find((m) => m.kind === 'u').length, 3000), 'its mullions are cut to the gable: 1975 + 1975 across at 1000, 3000 up the middle');
  saved.byface = ed.save();

  // ============================================================================================ 5 / 6 / 8 the work plane
  console.log('== 5 Set Work Plane, 6 Show Work Plane, 8 Work Plane Viewer');
  ok(WP.readWorkPlane(W(ed)) === null && WP.defaultWorkPlane(W(ed)).ref === L1.guid && WP.defaultWorkPlane(W(ed)).frame.o[2] === 0, 'no plane set yet: the work plane is the lowest level');
  ed.modelChange(WP.setWorkPlane({ kind: 'level', ref: L2.guid, label: 'Level 2', frame: P.levelPlane(3000) }));
  let wp = WP.readWorkPlane(W(ed));
  ok(wp.kind === 'level' && wp.ref === L2.guid && wp.frame.o[2] === 3000 && wp.frame.n.join() === '0,0,1', 'set to Level 2: a level plane at 3000, kept on IfcProject');
  ed.modelChange(WP.setWorkPlane({ kind: 'face', ref: 'mass-guid', label: 'Face', frame: eastF }));
  wp = WP.readWorkPlane(W(ed));
  ok(wp.kind === 'face' && wp.frame.n.join() === '1,0,0' && wp.frame.x.join() === '0,1,0' && wp.frame.y.join() === '0,0,1', 'set to a face: normal +X, x level along the face, y up');
  ed.undo();
  ok(WP.readWorkPlane(W(ed)).kind === 'level', 'undo goes back to the level plane (one step)');
  ed.redo();
  ok(refusal(ed, WP.setWorkPlane({ kind: 'face', frame: { o: [0, 0, 0], n: [0, 0, 0] } })) === 'model.err.wp.plane', 'a normal of no length is not a plane: refused');
  {
    // what the viewer draws: the cut of the model by the work plane. The first curtain system (y = 0, x 0..6000) cut by the plane x = 14 000: nothing; by the face's own plane the face system's panes lie in it
    const cur = now(), T = cur.plates.flatMap((id) => [...box(ed, id).T]);
    const cut = P.planeSection(P.frame([1000, 0, 0], [1, 0, 0]), T);
    // the plane x = 1000 cuts the panes of the first system (25 thick, between z 80 and 2920 with the 80 border): two rectangles 25 wide
    const hgt = cut.filter((g) => Math.abs(g[0] - g[2]) < 1e-6).reduce((s, g) => s + Math.abs(g[3] - g[1]), 0);
    // lower pane 80..960 = 880, upper pane 1040..2920 = 1880; each cut has two upright sides: 2 x (880 + 1880) = 5520
    ok(near(hgt, 5520, 0.5), 'the viewer\'s cut of the first system by the plane x = 1000: two panes, 2 x (880 + 1880) = 5520 of upright cut line', hgt);
  }

  // ============================================================================================ 7 Reference Plane
  console.log('== 7 Reference Plane');
  const rf = P.linePlane([2000, -1000], [2000, 7000], 0);
  r = ed.modelChange(WP.addRefPlane({ storey: L1.guid, frame: rf, length: 8000, height: 3000, base: 0, baseName: 'Reference plane' }));
  let refs = WP.readRefPlanes(W(ed));
  ok(refs.length === 1 && refs[0].name === 'Reference plane 1' && refs[0].length === 8000 && refs[0].frame.x.join() === '0,1,0' && refs[0].frame.n.join() === '1,0,0', 'a reference plane drawn in plan from (2000, -1000) to (2000, 7000): upright, named Reference plane 1', refs[0]);
  const cor = WP.refCorners(refs[0]);
  ok(cor[0].join() === '2000,-1000,0' && cor[2].join() === '2000,7000,3000', 'its extent: from (2000, -1000, 0) to (2000, 7000, 3000)');
  ed.modelChange(WP.changeRefPlane(refs[0].guid, { name: 'Centre line' }));
  ok(WP.readRefPlanes(W(ed))[0].name === 'Centre line' && val(ed.api.GetLine(ed.mid, refs[0].id, false).Name) === 'Centre line', 'renamed: Centre line (the IfcAnnotation\'s Name too)');
  ed.modelChange(WP.addRefPlane({ storey: L1.guid, frame: P.linePlane([0, 2500], [6000, 2500], 0), length: 6000, height: 3000, baseName: 'Reference plane' }));
  ok(refusal(ed, WP.changeRefPlane(refs[0].guid, { name: 'Reference plane 2' })) === 'model.err.wp.name', 'a second plane of the same name: refused (a name picks one plane)');
  // used as the work plane, by name; moving the plane moves the work plane
  refs = WP.readRefPlanes(W(ed));
  ed.modelChange(WP.setWorkPlane({ kind: 'reference', ref: refs[0].guid, label: refs[0].name, frame: refs[0].frame }));
  ed.modelChange(WP.changeRefPlane(refs[0].guid, { frame: { ...refs[0].frame, o: [2500, -1000, 0] } }));
  wp = WP.readWorkPlane(W(ed));
  ok(wp.kind === 'reference' && wp.ref === refs[0].guid && wp.frame.o[0] === 2500 && wp.label === 'Centre line', 'used as the work plane; moved 500 east, the work plane goes with it');
  const an = ed.api.GetLine(ed.mid, refs[0].id, true);
  ok(val(an.ObjectType) === 'ReferencePlane' && an.Representation.Representations[0].Items[0].Elements[0].Points.length === 5, 'IFC: an IfcAnnotation "ReferencePlane" whose curve is its closed outline (5 points)');
  ed.modelChange(WP.removeRefPlanes([refs[1].guid]));
  ok(WP.readRefPlanes(W(ed)).length === 1 && ed.undo() && WP.readRefPlanes(W(ed)).length === 2, 'removed, and back with undo');
  ed.redo();   // removed again: one reference plane from here on

  // ============================================================================================ 10 Model Line
  console.log('== 10 Model Line');
  const face = WP.readWorkPlane(W(ed)).frame;   // the upright plane x = 2500, x along +Y, y up
  r = ed.modelChange(WP.addModelLine({ frame: face, kind: 'line', pts: [[1000, 500], [4000, 2500]] }));
  let lines = WP.readModelLines(W(ed));
  // on the plane x = 2500 (origin y = -1000): plane (1000, 500) is model (2500, 0, 500); (4000, 2500) is (2500, 3000, 2500); length sqrt(3000^2 + 2000^2) = 3605.551
  const p3 = WP.linePoints3(lines[0]);
  ok(lines.length === 1 && p3[0].join() === '2500,0,500' && p3[1].join() === '2500,3000,2500' && near(lines[0].length, Math.hypot(3000, 2000), 1e-6) && lines[0].storey === L1.id, 'a line on the upright work plane: from (2500, 0, 500) to (2500, 3000, 2500), 3605.551 long, on Level 1', p3);
  r = ed.modelChange(WP.addModelLine({ frame: P.levelPlane(3000), kind: 'polyline', closed: true, pts: [[0, 0], [3000, 0], [3000, 4000]] }));
  r = ed.modelChange(WP.addModelLine({ frame: P.levelPlane(3000), kind: 'arc', pts: [[1000, 0], [0, 1000], [-1000, 0]] }));
  lines = WP.readModelLines(W(ed));
  const pl = lines.find((l) => l.kind === 'polyline'), ar = lines.find((l) => l.kind === 'arc');
  ok(pl.closed && pl.length === 12000 && pl.storey === L2.id && WP.linePoints3(pl).every((q) => q[2] === 3000), 'a closed polyline on Level 2\'s plane (z = 3000): 3000 + 4000 + 5000 = 12 000 long, kept on Level 2');
  ok(near(ar.length, Math.PI * 1000, 1e-6), 'an arc through three points: pi x 1000 = 3141.593 long', ar.length);
  const arcLine = ed.api.GetLine(ed.mid, ar.id, true).Representation.Representations[0].Items[0].Elements[0];
  ok(arcLine.BasisCurve && near(Number(val(arcLine.BasisCurve.Radius)), 1000, 1e-6) && val(arcLine.MasterRepresentation) === 'CARTESIAN', 'IFC: the arc is an IfcTrimmedCurve on an IfcCircle of radius 1000, trimmed by its end points');
  const lineRep = ed.api.GetLine(ed.mid, lines[0].id, true).Representation.Representations[0];
  ok(val(lineRep.RepresentationType) === 'GeometricCurveSet' && lineRep.Items[0].Elements[0].Points.length === 2 && lineRep.Items[0].Elements[0].Points[0].Coordinates.length === 3, 'IFC: the line is a 3D IfcPolyline in a GeometricCurveSet (not a 2D drafting line)');
  ed.modelChange(WP.moveModelLines([lines[0].guid], 0, 250));
  ok(WP.linePoints3(WP.readModelLines(W(ed))[0])[0].join() === '2500,0,750', 'moved 250 up its plane');
  ok(refusal(ed, WP.addModelLine({ frame: face, kind: 'line', pts: [[0, 0], [0, 0.2]] })) === 'model.err.wp.short' && refusal(ed, WP.addModelLine({ frame: face, kind: 'arc', pts: [[0, 0], [10, 0], [20, 0]] })) === 'model.err.wp.inline', 'no length, or an arc\'s points in line: refused (nothing to make)');
  ed.modelChange(WP.removeModelLines([ar.guid]));
  ok(WP.readModelLines(W(ed)).length === 2 && ed.undo() && WP.readModelLines(W(ed)).length === 3, 'removed, and back with undo');

  // ============================================================================================ 9 Model Text
  console.log('== 9 Model Text');
  const font = GL.readOutlineFont(fs.readFileSync(path.join(ROOT, 'public_html/assets/vendor/liberation-sans/current/LiberationSans-Regular.ttf')));
  // the capital I of the font is a plain rectangle: 191 units wide, as high as the capitals (1409 of 2048 units)
  const I = font.contours(font.glyph(73));
  ok(font.unitsPerEm === 2048 && font.capHeight === 1409 && I.length === 1 && I[0].length === 4 && Math.max(...I[0].map((q) => q[0])) - Math.min(...I[0].map((q) => q[0])) === 191, 'the font\'s capital I: one rectangle, 191 x 1409 units');
  const tI = GL.textPolygons(font, 'I', { height: 300 });
  // at a capital height of 300: 191 / 1409 x 300 = 40.667 wide, face 40.667 x 300 = 12 200.14 mm2
  ok(tI.polys.length === 1 && tI.polys[0].holes.length === 0 && near(tI.area, 191 / 1409 * 300 * 300, 1e-6), '"I" 300 high: 40.667 x 300 = 12 200.14 mm2', tI.area);
  const tO = GL.textPolygons(font, 'O', { height: 300 }), tB = GL.textPolygons(font, 'B', { height: 300 });
  ok(tO.polys.length === 1 && tO.polys[0].holes.length === 1 && tB.polys[0].holes.length === 2 && GL.textPolygons(font, 'i', { height: 300 }).polys.length === 2, 'an O keeps its hole, a B its two, an i is two pieces');
  r = ed.modelChange(WP.addModelText({ frame: P.levelPlane(3000), at: [1000, 2000], text: 'I', height: 300, depth: 50, polys: tI.polys, width: tI.width }));
  let texts = WP.readModelTexts(W(ed));
  let tx = texts[0], tb = box(ed, tx.id);
  // on Level 2's plane at (1000, 2000): the I's stem starts 189 / 1409 x 300 = 40.241 right of its origin; it rises 50 from the plane
  ok(texts.length === 1 && tx.text === 'I' && tx.height === 300 && tx.depth === 50 && tx.storey === L2.id && near(tb.lo[0], 1000 + 189 / 1409 * 300, 0.01) && near(tb.hi[0] - tb.lo[0], 191 / 1409 * 300, 0.01) && near(tb.lo[1], 2000) && near(tb.hi[1], 2300) && near(tb.lo[2], 3000) && near(tb.hi[2], 3050),
    'an "I" on Level 2\'s plane at (1000, 2000): 40.667 wide, 300 high, from z 3000 to 3050', [tb.lo, tb.hi]);
  ok(near(volume(tb.T), 191 / 1409 * 300 * 300 * 50, 1) && near(qto(W(ed), tx.id, 'Qto_BuildingElementProxyQuantities').NetVolume, 191 / 1409 * 300 * 300 * 50 / 1e9, 1e-6), 'its volume from the triangles and in the file: 12 200.14 x 50 = 610 007 mm3', volume(tb.T));
  const tW = GL.textPolygons(font, 'Boiler 2', { height: 200 });
  ed.modelChange(WP.changeModelText(tx.guid, { text: 'Boiler 2', height: 200, depth: 20, polys: tW.polys, width: tW.width, frame: face, at: [500, 1000] }));
  tx = WP.readModelTexts(W(ed))[0]; tb = box(ed, tx.id);
  const body = ed.api.GetLine(ed.mid, tx.id, true).Representation.Representations[0];
  // B o i l e r 2: the i is two pieces, so 8 solids; on the upright plane x = 2500 it rises 20 towards +X and reads along +Y;
  // its foot is the baseline at z = 1000 (the round letters dip a few mm under it), its width the text's own advance width
  ok(tx.text === 'Boiler 2' && body.Items.length === 8 && val(body.RepresentationType) === 'SweptSolid' && near(tb.lo[0], 2500) && near(tb.hi[0], 2520) && tb.lo[2] > 995 && tb.lo[2] <= 1000 && tb.hi[1] - tb.lo[1] > tW.width * 0.9 && tb.hi[1] - tb.lo[1] <= tW.width,
    'changed to "Boiler 2", 200 high, 20 deep, on the upright work plane: 8 solids, from x 2500 to 2520, reading along the plane', [tb.lo, tb.hi, body.Items.length]);
  ok(near(volume(tb.T), tW.area * 20, tW.area * 20 * 1e-6) && near(tx.faceArea, tW.area, 1), 'volume = the letters\' face area x 20', [volume(tb.T), tW.area * 20]);
  ok(body.Items.some((it) => it.SweptArea.InnerCurves?.length === 2) && body.Items.some((it) => it.SweptArea.InnerCurves?.length === 1), 'IFC: the B is a profile with two voids, the o, e and 2... with theirs');
  ok(refusal(ed, WP.addModelText({ frame: face, at: [0, 0], text: '   ', polys: [] })) === 'model.err.wp.text', 'no text: refused (nothing to make)');
  ok(ed.undo() && WP.readModelTexts(W(ed))[0].text === 'I', 'undo: the text is "I" again');
  ed.redo();
  saved.workplane = ed.save();
  {
    const back = await reopen(ed), wb = W(back);
    const bw = WP.readWorkPlane(wb), br = WP.readRefPlanes(wb), bl = WP.readModelLines(wb), bt = WP.readModelTexts(wb);
    ok(bw.kind === 'reference' && bw.frame.o[0] === 2500 && br.length === 1 && br[0].name === 'Centre line' && br[0].length === 8000 && br[0].height === 3000, 'saved and reopened: the work plane (the reference plane Centre line) and the reference plane with its name and extent');
    ok(bl.length === 3 && near(bl.find((l) => l.kind === 'arc').length, Math.PI * 1000, 1e-6) && bl.find((l) => l.kind === 'polyline').closed && WP.linePoints3(bl[0])[0].join() === '2500,0,750', 'saved and reopened: the three model lines where they were');
    ok(bt.length === 1 && bt[0].text === 'Boiler 2' && bt[0].height === 200 && bt[0].depth === 20 && near(volume(box(back, bt[0].id).T), tW.area * 20, tW.area * 20 * 1e-6), 'saved and reopened: the model text with its geometry');
    ok(CW.readCurtains(wb).length === 3 && !danglingRefs(new TextDecoder().decode(ed.save())).length, 'saved and reopened: the three curtain systems; no dangling references');
  }
  void before; void r;

  // ============================================================================================ a second reader
  if (Object.keys(saved).length) {
    const py = [path.join(ROOT, 'tools/detailcraft-test/venv/bin/python'), path.join(ROOT, 'tools/bimcraft-test/venv/bin/python')].find((p) => fs.existsSync(p));
    if (!py) console.log('  --   no venv with ifcopenshell: schema validation skipped');
    else {
      const { execFileSync } = await import('node:child_process');
      const os = await import('node:os');
      const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'bim-tools-b-'));
      const files = Object.entries(saved).map(([k, b]) => { const f2 = path.join(dir, k + '.ifc'); fs.writeFileSync(f2, b); return f2; });
      let out = '';
      try { out = execFileSync(py, ['-I', path.join(ROOT, 'tools/bimcraft-test/ifc_validate.py'), ...files], { encoding: 'utf8' }); } catch (e) { out = String(e.stdout || ''); }
      const res = out.trim().split('\n').filter(Boolean).map((l) => JSON.parse(l));
      ok(res.length === files.length && res.every((x) => x.errors === 0), 'a second reader (IfcOpenShell) finds no schema errors in ' + res.map((x) => path.basename(x.file) + ' (' + x.errors + ')').join(', ') + (res.some((x) => x.errors) ? ': ' + res.flatMap((x) => x.first).slice(0, 4).join(' | ') : ''));
      try {
        // the same reader counts what the files hold
        const count = execFileSync(py, ['-I', '-c', 'import ifcopenshell,sys,json\nf=ifcopenshell.open(sys.argv[1])\nprint(json.dumps({k:len(f.by_type(k)) for k in ["IfcCurtainWall","IfcPlate","IfcMember","IfcAnnotation","IfcBuildingElementProxy","IfcTrimmedCurve"]}))', files[files.length - 1]], { encoding: 'utf8' });
        const n = JSON.parse(count);
        ok(n.IfcCurtainWall === 3 && n.IfcPlate === 6 + 4 + 2 && n.IfcMember === 9 + 7 && n.IfcAnnotation === 4 && n.IfcBuildingElementProxy === 1 && n.IfcTrimmedCurve === 1, 'and counts 3 curtain walls, 12 plates (6 + 4 + 2), 16 members (9 + 7), 4 annotations (1 plane, 3 lines), 1 text, 1 trimmed curve', n);
      } catch (e) { ok(false, 'the second reader could count the elements', String(e.message).slice(0, 200)); }
      fs.rmSync(dir, { recursive: true, force: true });
    }
  }

  console.log(`\n${good} passed, ${bad} failed`);
  return bad ? 1 : 0;
}
