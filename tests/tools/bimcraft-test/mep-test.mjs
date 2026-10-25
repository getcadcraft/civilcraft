/* SPDX-License-Identifier: Apache-2.0 */
/**
 * `node bin/test-bimcraft.mjs --mep` (0.6 DF.29, session `bim-draw`): pipe and duct runs in Node, on models made here and on
 * the public DetailCraft fixtures (an IFC2X3 file in mm, an IFC4 file in feet). Checks the table copies against CadCraft's
 * add-ons, the layout (fittings made by themselves), the IFC each edit writes (one undo step; classes, types, ports and their
 * connections, systems, sets), the shapes cc-ifc draws from it, edits, deletes, schedules and the sizing helpers; then
 * IfcOpenShell (schema, systems, connections, its own geometry) and web-ifc (classes) read the files.
 */
import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';
import { execFileSync } from 'node:child_process';

export async function mepMode({ APP, ROOT, WebIFC, IfcModel, quiet }) {
  let bad = 0, good = 0;
  const ok = (cond, label, detail = '') => { if (cond) good++; else bad++; console.log((cond ? '  ok   ' : '  FAIL ') + label + (!cond && detail ? ' (' + detail + ')' : '')); };
  const near = (a, b, e = 0.01) => Math.abs(a - b) <= e;
  const saved = {};
  const M = await import(path.join(APP, 'mep-model.js'));
  const T = await import(path.join(APP, 'mep/tables.js'));
  const { ModelWriter } = await import(path.join(APP, 'model-write.js'));
  const { IfcEditor } = await import(path.join(APP, 'ifc-edit.js'));
  const OPS = await import(path.join(APP, 'model-ops.js'));
  const N = await import(path.join(APP, 'new-model.js'));
  const dec = (b) => new TextDecoder().decode(b);
  const count = (txt, re) => (txt.match(re) || []).length;
  const danglingRefs = (txt) => {
    const defined = new Set([...txt.matchAll(/^#(\d+)=/gm)].map((m) => m[1])), out = new Set();
    for (const line of txt.split('\n')) for (const m of line.replace(/^#\d+=/, '').replace(/'(?:[^']|'')*'/g, '').matchAll(/#(\d+)/g)) if (!defined.has(m[1])) out.add('#' + m[1]);
    return [...out];
  };
  async function editorFor(bytes) {
    const eng = await quiet(IfcModel.create)(WebIFC, null);
    await quiet((b) => eng.load(b))(bytes);
    const ed = new IfcEditor(WebIFC, eng);
    return { ed, levels: OPS.snapshotModel(ed).levels, w: () => new ModelWriter(WebIFC, ed.api, ed.mid) };
  }
  const building = () => editorFor(new TextEncoder().encode(N.newBuilding({ name: 'MEP', levels: N.stackLevels(2, 3000, (i) => 'Level ' + (i + 1)), fileName: 'm.ifc', now: new Date('2026-10-17T12:00:00Z') })));
  /** cc-ifc's vertices of one element, in plan mm (x east, y north, z up) relative to the file's origin. */
  async function meshOf(bytes) {
    const eng = await quiet(IfcModel.create)(WebIFC, null), m = await quiet((b) => eng.load(b))(bytes);
    const C = eng.api.GetCoordinationMatrix(m.modelID);
    return (id) => { const out = []; for (const b of m.batches) for (let i = 0; i < b.elems.ids.length; i++) if (b.elems.ids[i] === id) for (let v = b.elems.v0[i]; v < b.elems.v0[i] + b.elems.vn[i]; v++) out.push([(b.positions[v * 3] - C[12]) * 1000, -(b.positions[v * 3 + 2] - C[14]) * 1000, (b.positions[v * 3 + 1] - C[13]) * 1000]); return out; };
  }
  const bbox = (V) => [0, 1, 2].map((j) => [Math.min(...V.map((q) => q[j])), Math.max(...V.map((q) => q[j]))]);

  // ============================================================================================ the tables are the add-ons'
  console.log('== the pipe and duct tables (copies of CadCraft\'s Piping and HVAC add-ons)');
  const ADD = path.join(ROOT, 'public_html/assets/apps/cadcraft/dev/addons');
  for (const [from, to] of [['piping/lib/tables.js', 'tables.js'], ['hvac/lib/sizing.js', 'sizing.js']]) {
    ok(Buffer.compare(fs.readFileSync(path.join(ADD, from)), fs.readFileSync(path.join(APP, 'mep', to))) === 0, 'mep/' + to + ' is byte for byte the add-on\'s ' + from + ' (node tools/bimcraft-test/mep-sync.mjs)');
  }

  // ============================================================================================ sections and the layout
  console.log('== sections, slope and the layout (mep-model.js, pure)');
  let s = M.sectionOf({ kind: 'pipe', mat: 'steel', cls: '40', size: '2' });
  ok(near(s.od, 60.325, 1e-9) && near(s.wall, 3.9116, 1e-9) && near(s.R, 76.2, 1e-9), 'NPS 2 Schedule 40 steel: OD 60.325, wall 3.9116 (ASME B36.10M), elbow radius 76.2 = 1.5 × NPS (B16.9 long radius)');
  s = M.sectionOf({ kind: 'pipe', mat: 'copper', cls: 'L', size: '3/4' });
  ok(near(s.od, 22.225, 1e-9) && near(s.R, 22.225, 1e-9), 'copper type L 3/4: OD 22.225 (7/8"), elbows drawn at one OD');
  ok(M.sectionOf({ kind: 'pipe', mat: 'copper', cls: 'M', size: '1/4' }) === null && M.sectionOf({ kind: 'duct', shape: 'oval', w: 200, h: 300 }) === null && M.sectionOf({ kind: 'duct', shape: 'rect', w: 30, h: 200 }) === null,
    'sizes that are not made: copper M 1/4, an oval taller than wide, a 30 mm duct');
  const slopeRun = { points: [[0, 0, 2400], [3000, 0, 2400], [3000, 3000, 2400]], slope: 0.125 / 12 };
  const sv = M.runVertices(slopeRun);
  ok(near(sv[1][2], 2400 - 3000 * 0.125 / 12, 1e-9) && near(sv[2][2], 2400 - 6000 * 0.125 / 12, 1e-9), 'a drain at 1/8"/ft falls 31.25 over 3000 and 62.5 over 6000 of plan length');
  ok(near(M.drainMinimum({ kind: 'pipe', system: 'san', mat: 'pvc', cls: '40', size: '3' }), 0.125 / 12, 1e-12) && near(M.drainMinimum({ kind: 'pipe', system: 'san', mat: 'pvc', cls: '40', size: '2' }), 0.25 / 12, 1e-12) && M.drainMinimum({ kind: 'pipe', system: 'cw', mat: 'copper', cls: 'L', size: '1' }) === null,
    'drain minimum (IPC 2021 Table 704.1): 3" = 1/8"/ft, 2" = 1/4"/ft; water is not a drain');
  const D = M.runDefaults('pipe', 'san');
  ok(D.mat === 'pvc' && D.cls === '40' && D.size === '3' && near(D.slope, 0.125 / 12, 1e-12), 'a new sanitary run: PVC Schedule 40, 3", at its minimum slope');
  const lay0 = (runs) => M.mepLayout(runs.map((r, i) => ({ guid: 'g' + i, ...r, sec: M.sectionOf(r), verts: M.runVertices(r), valves: r.valves || [] })));
  const main = { kind: 'pipe', system: 'cw', mat: 'steel', cls: '40', size: '2', points: [[0, 0, 2700], [3000, 0, 2700], [3000, 2000, 2700]], valves: [{ s: 800, kind: 'gate' }] };
  const branch = { kind: 'pipe', system: 'cw', mat: 'steel', cls: '40', size: '1', points: [[1500, 1000, 2700], [1500, 0, 2700]] };
  const tail = { kind: 'pipe', system: 'cw', mat: 'steel', cls: '40', size: '1', points: [[3000, 2000, 2700], [3000, 4000, 2700]] };
  let L = lay0([main, branch, tail]);
  const kinds = (g) => L.runs.get(g).parts.map((p) => p.kind).join(',');
  ok(!L.error && kinds('g0') === 'segment,valve,segment,tee,segment,bend,segment,reducer', 'the main: segment, gate valve, segment, tee (the branch ends on it), segment, elbow, segment, reducer (the 1" run starts at its end)', kinds('g0'));
  ok(kinds('g1') === 'segment' && kinds('g2') === 'segment', 'the branch and the tail: one segment each (their fittings are the main\'s)');
  const bend = L.runs.get('g0').parts.find((p) => p.kind === 'bend');
  ok(near(bend.th, Math.PI / 2, 1e-12) && near(bend.p0[0], 3000 - 76.2, 1e-9) && near(bend.p1[1], 76.2, 1e-9), 'the elbow: 90°, its ends 76.2 back from the corner along both legs (R tan 45°)');
  const tee = L.runs.get('g0').parts.find((p) => p.kind === 'tee'), bseg = L.runs.get('g1').parts[0];
  ok(near(tee.at[0], 1500, 1e-9) && near(tee.m, 0.5 * T.STEEL['1'][0] * 25.4 + 0.25 * 60.325, 1e-9) && near(bseg.b[1], tee.mb, 1e-9), 'the tee at x 1500; the branch stops at its outlet');
  const red = L.runs.get('g0').parts.at(-1);
  ok(near(red.b[1], 2000, 1e-9) && near(red.a[1], 2000 - 60.325, 1e-9) && near(red.to.od, 33.401, 1e-9), 'the reducer: 2" × 1", one larger OD long, ending where the 1" run starts');
  const ends = (g) => L.runs.get(g).parts.flatMap((p) => p.ports);
  const allPorts = ['g0', 'g1', 'g2'].flatMap(ends), key = (p) => p.p.map((x) => Math.round(x)).join(',');
  const byKey = new Map(); for (const p of allPorts) byKey.set(key(p), (byKey.get(key(p)) || 0) + 1);
  ok([...byKey.values()].filter((n) => n === 2).length === 9 && [...byKey.values()].filter((n) => n === 1).length === 3, 'ports: 9 pairs touch (7 along the main, the tee to the branch, the reducer to the tail); 3 open ends (the main\'s start, the branch\'s start, the tail\'s end)', JSON.stringify([...byKey.values()]));
  ok(lay0([{ ...main, points: [[0, 0, 0], [1000, 0, 0], [0, 0, 0]], valves: [] }]).error === 'mep.err.back', 'a run that turns straight back: refused (mep.err.back)');
  ok(lay0([{ ...main, points: [[0, 0, 0], [60, 0, 0], [60, 60, 0]], valves: [] }]).error === 'mep.err.short', 'legs of 60 under a 76.2 elbow: refused (mep.err.short)');
  ok(lay0([{ kind: 'duct', system: 'supply', shape: 'rect', w: 300, h: 200, points: [[0, 0, 0], [2000, 0, 0]], valves: [{ s: 500, kind: 'gate' }] }]).error === 'mep.err.valve', 'a valve on a duct: refused (mep.err.valve)');
  // a rectangular duct turning in plan bends across its width; turning up, across its height
  L = lay0([{ kind: 'duct', system: 'supply', shape: 'rect', w: 400, h: 250, points: [[0, 0, 2600], [3000, 0, 2600], [3000, 3000, 2600], [3000, 3000, 5000]] }]);
  const db = L.runs.get('g0').parts.filter((p) => p.kind === 'bend');
  ok(db.length === 2 && near(db[0].R, 400, 1e-9) && near(db[1].R, 250, 1e-9), 'a rectangular duct: a turn in plan at R = its width (400), a turn up at R = its height (250)');

  // ============================================================================================ IFC4, mm: one undo step each
  console.log('== runs in a new building (IFC4, mm)');
  let B = await building();
  const { ed, levels } = B;
  const L1 = levels[0].guid;
  let n0 = ed.changes.length;
  ed.modelChange(M.placeRun({ storey: L1, ...main }), { label: 'Pipe run', verb: 'Drew' });
  ok(ed.changes.length === n0 + 1 && M.readRuns(B.w()).length === 1, 'the main drawn: one undo step, one run');
  ed.modelChange(M.placeRun({ storey: L1, ...branch }), { label: 'Pipe run' });
  ed.modelChange(M.placeRun({ storey: L1, ...tail }), { label: 'Pipe run' });
  ed.modelChange(M.placeRun({ storey: L1, kind: 'duct', system: 'supply', shape: 'rect', w: 400, h: 250, points: [[0, 5000, 2600], [4000, 5000, 2600], [4000, 8000, 2600]] }), { label: 'Duct run' });
  ed.modelChange(M.placeRun({ storey: L1, kind: 'duct', system: 'supply', shape: 'round', w: 250, points: [[4000, 8000, 2600], [4000, 10000, 2600]] }), { label: 'Duct run' });
  let runs = M.readRuns(B.w());
  const partsN = runs.map((r) => r.parts.length).join(',');
  ok(ed.changes.length === n0 + 5 && runs.length === 5 && partsN === '8,1,1,4,1', 'five runs, five undo steps; their parts 8, 1, 1, 4, 1 (the duct: segment, elbow, segment, transition)', partsN);
  let txt = dec(ed.save());
  ok(count(txt, /IFCELEMENTASSEMBLY\([^;]*\.NOTDEFINED\.,\.USERDEFINED\.\);/g) === 5 && /'Pipe run'/.test(txt) && /'Duct run'/.test(txt) && count(txt, /'CadCraft_MepRun'/g) === 5,
    'each run an IfcElementAssembly .USERDEFINED. ("Pipe run" / "Duct run") holding CadCraft_MepRun');
  ok(count(txt, /IFCPIPESEGMENT\([^;]*\.RIGIDSEGMENT\.\)/g) === 6 && count(txt, /IFCPIPEFITTING\([^;]*\.BEND\.\)/g) === 1 && count(txt, /IFCPIPEFITTING\([^;]*\.JUNCTION\.\)/g) === 1 && count(txt, /IFCPIPEFITTING\([^;]*\.TRANSITION\.\)/g) === 1 && count(txt, /IFCVALVE\([^;]*\.ISOLATING\.\)/g) === 1,
    'pipe parts: 6 IfcPipeSegment .RIGIDSEGMENT., IfcPipeFitting .BEND. / .JUNCTION. / .TRANSITION., IfcValve .ISOLATING.');
  ok(count(txt, /IFCDUCTSEGMENT\(/g) === 3 && count(txt, /IFCDUCTFITTING\([^;]*\.BEND\.\)/g) === 1 && count(txt, /IFCDUCTFITTING\([^;]*\.TRANSITION\.\)/g) === 1 && /IFCFACETEDBREP\(/.test(txt), 'duct parts: 3 IfcDuctSegment, an elbow and a lofted (faceted) rectangular-to-round transition');
  ok(/IFCPIPESEGMENTTYPE\('[^']*',#\d+,'Pipe: Steel, Schedule 40'/.test(txt) && /IFCPIPEFITTINGTYPE\('[^']*',#\d+,'Elbow'/.test(txt) && /IFCVALVETYPE\('[^']*',#\d+,'Gate valve'/.test(txt) && /IFCDUCTSEGMENTTYPE\('[^']*',#\d+,'Rectangular duct'/.test(txt) && count(txt, /IFCRELDEFINESBYTYPE\(/g) >= 8,
    'their types: "Pipe: Steel, Schedule 40", "Elbow", "Gate valve", "Rectangular duct", …');
  const nPorts = count(txt, /IFCDISTRIBUTIONPORT\(/g), nConn = count(txt, /IFCRELCONNECTSPORTS\(/g);
  ok(nPorts === 2 * 15 + 1 && nConn === 13 && count(txt, /IFCRELNESTS\(/g) === 15 && /IFCDISTRIBUTIONPORT\([^;]*\.SINK\.,\.PIPE\.,\.DOMESTICCOLDWATER\.\)/.test(txt) && /IFCDISTRIBUTIONPORT\([^;]*\.SOURCE\.,\.DUCT\.,\.AIRCONDITIONING\.\)/.test(txt),
    '31 ports nested on their 15 parts (SINK upstream, SOURCE downstream, PIPE / DUCT, the system\'s type); 13 connected pairs (9 pipe, 4 duct)', nPorts + ' ports, ' + nConn + ' connections');
  ok(/IFCDISTRIBUTIONSYSTEM\('[^']*',#\d+,'Domestic cold water',\$,\$,\$,\.DOMESTICCOLDWATER\.\)/.test(txt) && /IFCDISTRIBUTIONSYSTEM\('[^']*',#\d+,'Supply air',\$,\$,\$,\.AIRCONDITIONING\.\)/.test(txt) && count(txt, /IFCRELSERVICESBUILDINGS\(/g) === 2 && count(txt, /IFCRELASSIGNSTOGROUP\(/g) >= 2,
    'two systems (IfcDistributionSystem .DOMESTICCOLDWATER. and .AIRCONDITIONING.), each serving the building and holding its parts (IFC4: one assignment per edit)');
  ok(/'CadCraft_Pipe'/.test(txt) && /'Pset_PipeSegmentTypeCommon'/.test(txt) && /'Qto_PipeSegmentBaseQuantities'/.test(txt) && /'CadCraft_Duct'/.test(txt) && /'Qto_DuctSegmentBaseQuantities'/.test(txt) && /'CadCraft_MepFitting'/.test(txt) && /'CadCraft_Valve'/.test(txt) && /'Axis','Curve3D'/.test(txt),
    'sets: CadCraft_Pipe / CadCraft_Duct, Pset_PipeSegmentTypeCommon, the base quantities, CadCraft_MepFitting, CadCraft_Valve; segments carry an Axis line');
  ok(/IFCMATERIAL\('Steel'/.test(txt) && /IFCMATERIAL\('Galvanized steel'/.test(txt) && /IFCSURFACESTYLE\('CadCraft MEP pipe cw'/.test(txt) && !/CadCraft MEP[^']*\(CadCraft\)'/.test(txt), 'materials Steel and Galvanized steel; one colour per system (not named like a paint, so Paint leaves it alone)');
  ok(!danglingRefs(txt).length, 'no dangling references');
  saved.mm = ed.save();
  // an edit touches only the runs whose parts change (Live: nobody else's lines are written over)
  const before = new Map(M.readRuns(B.w()).map((r) => [r.guid, r.parts.join()]));
  ed.modelChange(M.placeRun({ storey: L1, kind: 'pipe', system: 'cw', mat: 'copper', cls: 'L', size: '1/2', points: [[8000, 0, 2400], [9000, 0, 2400]] }), { label: 'Pipe run' });
  const after = M.readRuns(B.w());
  ok(after.length === 6 && [...before].every(([g, p]) => after.find((r) => r.guid === g).parts.join() === p), 'a run that touches nothing: the five others keep every part as it was (same lines)');
  const branchRun = after.find((r) => r.size === '1' && r.points[0][0] === 1500);
  ed.modelChange(M.changeRun(branchRun.guid, { size: '3/4' }), { label: 'Pipe run' });
  const after2 = M.readRuns(B.w()), mainNow = after2.find((r) => r.size === '2'), ductNow = after2.filter((r) => r.kind === 'duct');
  ok(mainNow.parts.join() !== before.get(mainNow.guid) && ductNow.every((r) => r.parts.join() === before.get(r.guid)), 'the branch made 3/4": the main is written again (its tee is 2" × 3/4" now), the ducts are not');
  ed.undo(); ed.undo();
  ok(M.readRuns(B.w()).length === 5 && dec(ed.save()) === dec(saved.mm), 'two undos: the file is exactly what it was, line for line');
  // the shapes cc-ifc draws
  let mesh = await meshOf(saved.mm);
  const all = runs.map((r) => ({ ...r, sec: M.sectionOf(r), verts: M.runVertices(r) })), LL = M.mepLayout(all);
  let worst = 0, sweep = 0, segOk = true, drawn = 0;
  const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]], dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  for (const r of all) LL.runs.get(r.guid).parts.forEach((p, i) => {
    const V = mesh(r.parts[i]);
    if (V.length) drawn++;
    if (p.kind === 'segment') { const bb = bbox(V), lo = [0, 1, 2].map((j) => Math.min(p.a[j], p.b[j])), hi = [0, 1, 2].map((j) => Math.max(p.a[j], p.b[j])); const hw = Math.max(r.sec.w, r.sec.h) / 2 + 1; for (let j = 0; j < 3; j++) if (bb[j][0] < lo[j] - hw || bb[j][1] > hi[j] + hw) segOk = false; }
    if (p.kind === 'bend') {
      const ax = [p.d1[1] * p.n[2] - p.d1[2] * p.n[1], p.d1[2] * p.n[0] - p.d1[0] * p.n[2], p.d1[0] * p.n[1] - p.d1[1] * p.n[0]];
      for (const q of V) { const v = sub(q, p.center), h = dot(v, ax), ip = sub(v, [ax[0] * h, ax[1] * h, ax[2] * h]), rr = Math.hypot(...ip); worst = Math.max(worst, Math.hypot(rr - p.R, h) / (Math.hypot(r.sec.w, r.sec.h) / 2)); sweep = Math.max(sweep, Math.acos(Math.max(-1, Math.min(1, -dot(ip, p.n) / rr)))); }
    }
  });
  ok(drawn === 15, 'cc-ifc draws every one of the 15 parts', String(drawn));
  ok(worst <= 1.001 && near(sweep, Math.PI / 2, 0.01), 'both elbows lie on their bend (every vertex within the section of the arc\'s centre line) and sweep 90° toward the next leg', worst.toFixed(4) + ', ' + (sweep * 180 / Math.PI).toFixed(2) + '°');
  ok(segOk, 'every segment is drawn between its own two ends');
  // undo / redo: the same run again (redo runs the op again; GlobalIds fixed)
  const g5 = runs[4].guid;
  ed.undo();
  ok(M.readRuns(B.w()).length === 4 && !M.readRuns(B.w()).some((r) => r.guid === g5), 'undo: the round duct goes (and the transition with it)');
  ok(M.readRuns(B.w()).find((r) => r.kind === 'duct').parts.length === 3, 'the rectangular duct\'s end is open again: segment, elbow, segment');
  ed.redo();
  runs = M.readRuns(B.w());
  ok(runs.length === 5 && runs.some((r) => r.guid === g5) && runs.find((r) => r.kind === 'duct' && r.shape === 'rect').parts.length === 4, 'redo: the same run (same GlobalId) and the transition again');
  // edits
  const mainRun = runs.find((r) => r.size === '2');
  ed.modelChange(M.changeRun(mainRun.guid, { size: '1' }), { label: 'Pipe run' });
  runs = M.readRuns(B.w());
  let kk = M.mepLayout(runs.map((r) => ({ ...r, sec: M.sectionOf(r), verts: M.runVertices(r) }))).runs.get(mainRun.guid).parts.map((p) => p.kind).join(',');
  ok(kk === 'segment,valve,segment,tee,segment,bend,segment', 'the main made 1": its reducer goes (both runs 1" now), the tee and elbow stay', kk);
  ed.modelChange(M.changeRun(mainRun.guid, { system: 'hw', mat: 'copper', cls: 'L', size: '1' }), { label: 'Pipe run' });
  txt = dec(ed.save());
  ok(/'Domestic hot water'/.test(txt) && /'Domestic cold water'/.test(txt) && count(txt, /IFCDISTRIBUTIONSYSTEM\(/g) === 3, 'the main moved to hot water: a hot water system; cold water stays (the branch and the tail are in it)');
  ed.modelChange(M.addValve(mainRun.guid, 2400, 'check'), { label: 'Valve' });
  ok(M.readRuns(B.w()).find((r) => r.guid === mainRun.guid).valves.map((v) => v.kind).join() === 'gate,check' && /IFCVALVE\([^;]*\.CHECK\.\)/.test(dec(ed.save())), 'a check valve added (.CHECK.), after the gate valve');
  let key2 = ''; try { ed.modelChange(M.addValve(mainRun.guid, 1460, 'ball')); } catch (e) { key2 = e.key; }
  ok(key2 === 'mep.err.short' && M.readRuns(B.w()).find((r) => r.guid === mainRun.guid).valves.length === 2, 'a valve on top of the tee: refused, nothing written');
  ed.modelChange(M.removeValve(mainRun.guid, 1), { label: 'Valve' });
  ok(M.readRuns(B.w()).find((r) => r.guid === mainRun.guid).valves.length === 1, 'the check valve removed');
  // delete: every part and port goes; a system with nothing in it goes too
  ed.modelChange(M.removeRuns([mainRun.guid]), { label: 'Delete' });
  txt = dec(ed.save());
  ok(M.readRuns(B.w()).length === 4 && !/'Domestic hot water'/.test(txt) && !danglingRefs(txt).length && count(txt, /IFCDISTRIBUTIONPORT\(/g) === 2 * (1 + 1 + 4 + 1) + 0, 'the main deleted: its parts and ports go, the hot water system (now empty) too, no dangling references', count(txt, /IFCDISTRIBUTIONPORT\(/g) + ' ports');
  ed.undo();
  ok(M.readRuns(B.w()).length === 5 && /'Domestic hot water'/.test(dec(ed.save())), 'undo brings it back with its system');

  // ============================================================================================ a drain, a riser, a vertical duct
  console.log('== a drain at its slope, a riser to the level above');
  B = await building();
  const ed2 = B.ed;
  ed2.modelChange(M.placeRun({ storey: B.levels[0].guid, ...M.runDefaults('pipe', 'san'), points: [[0, 0, 300], [6000, 0, 300], [6000, 4000, 300]] }), { label: 'Pipe run' });
  let r = M.readRuns(B.w())[0];
  const segs = r.parts.filter((id) => B.w().readPset(id, 'CadCraft_Pipe'));
  const ps = B.w().readPset(segs[0], 'CadCraft_Pipe');
  ok(near(ps.Slope, 0.125 / 12, 1e-9) && ps.NominalSize === '3' && ps.Material === 'pvc', 'a sanitary drain: 3" PVC, its slope 1/8"/ft written on each segment');
  mesh = await meshOf(ed2.save());
  const z0 = bbox(mesh(segs[0]))[2], z1 = bbox(mesh(segs[1]))[2];
  ok(z1[1] < z0[1] - 50 && near(z0[1] - z1[1], 6000 * 0.125 / 12, 6), 'cc-ifc: the second leg sits about 62 lower than the first (it falls along the run)', (z0[1] - z1[1]).toFixed(1));
  ed2.modelChange(M.placeRun({ storey: B.levels[0].guid, kind: 'pipe', system: 'cw', mat: 'copper', cls: 'L', size: '1', points: [[1000, 6000, 2700], [3000, 6000, 2700], [3000, 6000, 4500], [5000, 6000, 4500]] }), { label: 'Pipe run' });
  r = M.readRuns(B.w()).find((x) => x.system === 'cw');
  L = M.mepLayout([{ ...r, sec: M.sectionOf(r), verts: M.runVertices(r) }]);
  ok(L.runs.get(r.guid).parts.map((p) => p.kind).join(',') === 'segment,bend,segment,bend,segment' && r.points[2][2] > 3000, 'a riser up into Level 2 (2700 → 4500): two elbows, up and over; the run stays on Level 1');
  saved.riser = ed2.save();

  // ============================================================================================ other schemas and units
  console.log('== an IFC2X3 file (mm) and an IFC4 file in feet (the DetailCraft fixtures)');
  for (const [name, file, v4, unit] of [['x3', 'ios-steel-ifc2x3.ifc', false, 1], ['ft', 'ios-steel-ifc4-feet.ifc', true, 304.8]]) {
    const F = await editorFor(fs.readFileSync(path.join(ROOT, 'tools/detailcraft-test/fixtures', file)));
    F.ed.modelChange(M.placeRun({ storey: F.levels[0].guid, kind: 'pipe', system: 'fire', mat: 'steel', cls: '40', size: '4', points: [[0, 0, 3000], [5000, 0, 3000], [5000, 4000, 3000]], valves: [{ s: 1000, kind: 'globe' }] }), { label: 'Pipe run' });
    F.ed.modelChange(M.placeRun({ storey: F.levels[0].guid, kind: 'duct', system: 'return', shape: 'oval', w: 500, h: 250, points: [[0, 6000, 2600], [4000, 6000, 2600], [4000, 6000, 3400]] }), { label: 'Duct run' });
    const t2 = dec(F.ed.save());
    if (!v4) ok(count(t2, /IFCFLOWSEGMENT\(/g) === 5 && count(t2, /IFCFLOWFITTING\(/g) === 2 && count(t2, /IFCFLOWCONTROLLER\(/g) === 1 && count(t2, /IFCSYSTEM\(/g) === 2 && count(t2, /IFCRELCONNECTSPORTTOELEMENT\(/g) === count(t2, /IFCDISTRIBUTIONPORT\(/g) && !/IFCRELNESTS\(/.test(t2) && /'FIREPROTECTION'/.test(t2),
      'IFC2X3: IfcFlowSegment / IfcFlowFitting / IfcFlowController, IfcSystem (ObjectType FIREPROTECTION), ports by IfcRelConnectsPortToElement');
    else {
      const od = /IFCPROPERTYSINGLEVALUE\('OuterDiameter',\$,IFCLENGTHMEASURE\(([\d.]+)\)/.exec(t2);
      ok(od && near(Number(od[1]), 4.5 * 25.4 / 304.8, 1e-6) && /IFCVALVE\([^;]*\.REGULATING\.\)/.test(t2), 'IFC4 in feet: the 4" pipe\'s OuterDiameter in feet (0.375); the globe valve .REGULATING.', od?.[1]);
    }
    ok(!danglingRefs(t2).length && M.readRuns(F.w()).every((x) => x.parts.length > 0), name + ': no dangling references; both runs read back with their parts');
    saved[name] = F.ed.save();
  }

  // ============================================================================================ schedules and sizing
  console.log('== schedules and the sizing helpers');
  B = await building();
  B.ed.modelChange(M.placeRun({ storey: B.levels[0].guid, ...main }), { label: 'Pipe run' });
  B.ed.modelChange(M.placeRun({ storey: B.levels[0].guid, ...branch }), { label: 'Pipe run' });
  const S = M.runSchedules(B.w());
  const p2 = S.pipes.find((x) => x.size === '2'), lenSum = 3000 + 2000 - 2 * 76.2 - Math.max(75, 2.5 * 60.325) - 2 * (0.5 * 33.401 + 0.25 * 60.325);
  ok(p2 && near(p2.length, lenSum, 0.01) && p2.n === 4, '2" pipe: 4 pieces, the centre line less the elbow, the valve and the tee (' + lenSum.toFixed(1) + ')', p2 && p2.length.toFixed(2));
  ok(S.fittings.length === 3 && S.fittings.some((f) => f.what === 'bend' && f.angle === 90) && S.fittings.some((f) => f.what === 'tee' && f.size === '2" × 1"') && S.fittings.some((f) => f.valve && f.what === 'gate'), 'fittings: a 90° elbow, a 2" × 1" tee, a gate valve');
  const pf = M.pipeForFlow('copper', 'L', 10, 8);
  // the smallest size that does it (the table lists "1", "2" … before "1/2": go by nominal size)
  const want = T.sizesFor('copper', 'L').slice().sort((a, b) => T.nominal(a) - T.nominal(b)).find((sz) => { const q = T.pipeSize('copper', 'L', sz); const A = Math.PI * (q.id * 0.0254) ** 2 / 4; return 10 * 3.785411784 / 60 / 1000 / A <= 8 * 0.3048; });
  ok(pf && pf.size === want && pf.v <= 8, '10 gpm in copper L at 8 ft/s or less: ' + want, pf && pf.size);
  const df = M.ductForFlow({ q: 1000, rate: 0.08, shape: 'round', u: 'in' });
  const ADDS = await import(path.join(ADD, 'hvac/lib/sizing.js'));
  ok(df && near(df.w, ADDS.sizeSection({ q: 1000, rate: 0.08, shape: 'round', u: 'in' }).w * 25.4, 1e-9), '1000 cfm at 0.08 in. w.g./100 ft, round: the HVAC add-on\'s size (' + (df.w / 25.4) + '")');
  const loss = M.ductLoss({ kind: 'duct', flow: 1000, shape: 'round', w: df.w }, 'in');
  ok(loss && loss.rate <= 0.08 + 1e-9 && loss.V > 0, 'that duct as drawn: friction at or under the target, its velocity ' + Math.round(loss?.V || 0) + ' fpm');

  // ============================================================================================ outside readers
  const py = [path.join(ROOT, 'tools/detailcraft-test/venv/bin/python'), path.join(ROOT, 'tools/bimcraft-test/venv/bin/python')].find((p) => fs.existsSync(p));
  if (!py) console.log('  --   no venv with ifcopenshell: IfcOpenShell checks skipped');
  else {
    console.log('== IfcOpenShell reads them');
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'bim-mep-'));
    const files = Object.entries(saved).map(([k, b]) => { const f = path.join(dir, k + '.ifc'); fs.writeFileSync(f, b); return f; });
    let out = '';
    try { out = execFileSync(py, ['-I', path.join(ROOT, 'tools/bimcraft-test/ifc_validate.py'), ...files], { encoding: 'utf8' }); } catch (e) { out = String(e.stdout || ''); }
    const res = out.trim().split('\n').filter(Boolean).map((l) => JSON.parse(l));
    ok(res.length === files.length && res.every((x) => x.errors === 0), 'no schema errors in ' + res.map((x) => path.basename(x.file) + ' (' + x.schema + ', ' + x.errors + ')').join(', ') + (res.some((x) => x.errors) ? ': ' + res.flatMap((x) => x.first).slice(0, 3).join(' | ') : ''));
    try { out = execFileSync(py, ['-I', path.join(ROOT, 'tools/bimcraft-test/mep_check.py'), path.join(dir, 'mm.ifc'), path.join(dir, 'x3.ifc')], { encoding: 'utf8' }); } catch (e) { out = String(e.stdout || '') + String(e.stderr || ''); }
    const [a, b] = out.trim().split('\n').filter((l) => l.startsWith('{')).map((l) => JSON.parse(l));
    ok(a && a.systems['Domestic cold water'] === 10 && a.systems['Supply air'] === 5 && a.connections === 13 && a.open_ports === 5, 'IfcOpenShell (IFC4): cold water holds 10 parts, supply air 5; 13 connections; 5 open ports (the runs\' free ends)', JSON.stringify(a && { s: a.systems, c: a.connections, o: a.open_ports }));
    const segBoxes = a ? a.segments.filter((x) => !x.error) : [];
    ok(segBoxes.length === 9 && segBoxes.some((x) => near(x.min[0], 0, 1) && near(x.min[2], 2700 - 30.2, 0.5)), 'IfcOpenShell draws all 9 segments in world coordinates; the main\'s first starts at x 0, its bottom at 2700 − OD/2', JSON.stringify(segBoxes.slice(0, 2)));
    ok(b && b.schema === 'IFC2X3' && b.systems['Fire protection'] === 5 && b.systems['Return air'] === 3 && b.classes.IfcFlowController === 1, 'IfcOpenShell (IFC2X3): the fire protection system (5 parts) and return air (3); one IfcFlowController', JSON.stringify(b && { s: b.systems, k: b.classes }));
    fs.rmSync(dir, { recursive: true, force: true });
  }
  try {
    const Wi = (await import('node:module')).createRequire(path.join(ROOT, 'tools/bimcraft-test/package.json'))('web-ifc');
    const api = new Wi.IfcAPI(); await quiet(() => api.Init())();
    const id = api.OpenModel(saved.mm);
    ok(api.GetLineIDsWithType(id, Wi.IFCPIPESEGMENT).size() === 6 && api.GetLineIDsWithType(id, Wi.IFCDUCTFITTING).size() === 2 && api.GetLineIDsWithType(id, Wi.IFCRELCONNECTSPORTS).size() === 13 && api.GetLineIDsWithType(id, Wi.IFCDISTRIBUTIONSYSTEM).size() === 2,
      'web-ifc (oracle): 6 pipe segments, 2 duct fittings, 13 port connections, 2 systems');
  } catch (e) { console.log('  --   web-ifc not installed: oracle check skipped (' + e.message + ')'); }

  console.log(`\n${good} passed, ${bad} failed`);
  return bad ? 1 : 0;
}
