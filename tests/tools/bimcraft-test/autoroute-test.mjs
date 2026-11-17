/* SPDX-License-Identifier: Apache-2.0 */
/**
 * `node bin/test-bimcraft.mjs --autoroute` (0.10 MEP.1, suggestion #1556): the 3D MEP router end to end in BimCraft's dev build.
 * The model is made here with the app's own ops: one storey 14 × 8 m, exterior walls up to the next level, three rooms behind
 * partitions that stop at 2.6 m, a steel beam across the ceiling space and the slab over it; an air handler in the plant
 * room and one diffuser in each of the three other rooms. The obstacles are the model's own geometry (the boxes of the
 * loaded IFC, as the viewer has it); the network is drawn as runs in one undo step; then:
 *   - every terminal reached, the fittings made (elbows, tees, reducers), the Connections check clean;
 *   - no part of the network touches a wall, slab, beam or column (clash.js, the Clash check's own code);
 *   - saved as IFC4 (fixtures/mep-route/autoroute-ahu-3-terminals.ifc; --write keeps the file), re-opened in BimCraft:
 *     the same runs and sizes, the classes, and every diffuser reached from the air handler through IfcRelNests +
 *     IfcRelConnectsPorts alone (read from the file, not from BimCraft's own records);
 *   - one run edited: its fittings made again, the other runs' definitions unchanged, still connected;
 *   - a plan drawing of the network (SVG) next to the IFC, and the model before routing (--write).
 * IfcOpenShell is NOT used here (the no-GPL rule: it is LGPL); the file is checked by BimCraft's reader and web-ifc (MPL-2.0).
 */
import path from 'node:path';
import fs from 'node:fs';

export async function autorouteMode({ APP, ROOT, WebIFC, IfcModel, quiet, args = [] }) {
  let bad = 0, good = 0;
  const ok = (cond, label, detail = '') => { if (cond) good++; else bad++; console.log((cond ? '  ok   ' : '  FAIL ') + label + (!cond && detail ? ' (' + detail + ')' : '')); };
  const M = await import(path.join(APP, 'mep-model.js'));
  const AR = await import(path.join(APP, 'mep/autoroute.js'));
  const E = await import(path.join(APP, 'mep/equipment.js'));
  const C = await import(path.join(APP, 'mep/connections.js'));
  const ST = await import(path.join(APP, 'mep/structure.js'));
  const { elementsOf, clashes } = await import(path.join(APP, 'clash.js'));
  const { ModelWriter } = await import(path.join(APP, 'model-write.js'));
  const { IfcEditor } = await import(path.join(APP, 'ifc-edit.js'));
  const OPS = await import(path.join(APP, 'model-ops.js'));
  const N = await import(path.join(APP, 'new-model.js'));
  const write = args.includes('--write');
  async function editorFor(bytes) {
    const eng = await quiet(IfcModel.create)(WebIFC, null);
    const m = await quiet((b) => eng.load(b))(bytes);
    const ed = new IfcEditor(WebIFC, eng);
    return { eng, m, ed, levels: OPS.snapshotModel(ed).levels, w: () => new ModelWriter(WebIFC, ed.api, ed.mid) };
  }
  const ap = (Mx, v) => [Mx[0] * v[0] + Mx[4] * v[1] + Mx[8] * v[2] + Mx[12], Mx[1] * v[0] + Mx[5] * v[1] + Mx[9] * v[2] + Mx[13], Mx[2] * v[0] + Mx[6] * v[1] + Mx[10] * v[2] + Mx[14]];
  /** the viewer's metres ↔ a storey's plan mm (the same frame mep07-test's openings use); toPlan is mep/autoroute.js toPlanOf */
  const frames = (b) => {
    const Cm = b.eng.api.GetCoordinationMatrix(b.m.modelID), w = b.w();
    return {
      toViewer: (st, p) => { const q = ap(w.storeyWorld(st), p).map((x) => x / 1000); return ap(Cm, [q[0], q[2], -q[1]]); },
      toPlan: (st) => AR.toPlanOf(Cm, w.storeyWorld(st)),   // the adapter's own (the panel uses it)
    };
  };

  console.log('== the model: plant room + three rooms, partitions, a beam, the slab; an air handler and three diffusers');
  const b0 = await editorFor(new TextEncoder().encode(N.newBuilding({ name: 'Auto-route test', levels: N.stackLevels(2, 4200, (i) => 'Level ' + (i + 1)), fileName: 'autoroute.ifc', now: new Date('2026-11-12T12:00:00Z') })));
  const [L1, L2] = b0.levels.map((l) => l.guid);
  const go = (b, opr, label) => { try { return b.ed.modelChange(opr, { label }); } catch (e) { throw new Error(label + ': ' + (e.key || e.message)); } };
  const RECT = [[0, 0], [14000, 0], [14000, 8000], [0, 8000]];
  go(b0, OPS.drawWalls({ storey: L1, segs: RECT.map((p, i) => ({ a: p, b: RECT[(i + 1) % 4] })), typeKey: 'ext-2x6', topLevel: L2 }), 'exterior walls');
  go(b0, OPS.placeFloor({ storey: L1, seed: [2000, 2000], mode: 'room', kind: 'concrete' }), 'floor');
  go(b0, OPS.drawWalls({ storey: L1, segs: [{ a: [5000, 0], b: [5000, 8000] }, { a: [5000, 4000], b: [14000, 4000] }, { a: [9500, 0], b: [9500, 4000] }], typeKey: 'int-100', height: 2600 }), 'partitions to 2.6 m');
  // a beam across the ceiling space and the slab over the storey: real IfcBeam / IfcSlab with their own solids
  go(b0, OPS.op((w) => {
    const st = w.byGuid(L1), lp = w.api.GetLine(w.mid, st, false).ObjectPlacement.value;
    const add = (cls, name, pre, bx) => {
      const id = w.make(cls, w.guid(), w.ownerHistory(), w.L(name), null, null, w.H(w.placeAt(lp, 0, 0, 0, 0)), null, null, pre);
      w.setShape(id, [w.rep('body', 'Body', 'SweptSolid', [w.box(...bx)])]);
      w.contain(id, st);
      return { id };
    };
    add('IFCBEAM', 'Beam 300 × 400', 'BEAM', [6000, -100, 3600, 6300, 8100, 4000]);
    return add('IFCSLAB', 'Slab over level 1', 'FLOOR', [0, 0, 4000, 14000, 8000, 4200]);
  }), 'beam + slab');
  const place = (spec) => [...go(b0, E.placeEquipment({ storey: L1, ...spec }), spec.kind).made.keys()][0];
  const ahu = place({ kind: 'ahu', values: { supplyW: 450, supplyH: 250 }, x: 2075, y: 4000, tag: 'AHU-1', name: 'Air handler' });
  const dif = [[7250, 2000], [11750, 2000], [9500, 6000]].map(([x, y], i) => place({ kind: 'diffuser', values: { neck: 250, system: 'supply' }, x, y, z: 2400, tag: 'D-' + (i + 1), name: 'Diffuser' }));
  const eqs = E.readEquipment(b0.w());
  ok(eqs.length === 4 && eqs.filter((e) => e.kind === 'diffuser').length === 3, 'one air handler, three diffusers in three rooms');

  // the obstacles from the model as the viewer loads it
  const unrouted = b0.ed.save();
  const b = await editorFor(unrouted);
  const F = frames(b);
  const L1id = b.w().byGuid(L1);   // storeyWorld takes the express id (placeRun the GlobalId)
  const back = F.toPlan(L1id)(F.toViewer(L1id, [1234, -567, 890]));
  ok(back.every((v, k) => Math.abs(v - [1234, -567, 890][k]) < 1e-6), 'toPlanOf undoes the viewer frame (plan mm → viewer m → plan mm)', JSON.stringify(back));
  const obstacles = AR.obstaclesFrom(b.m.batches, b.m.classOf, F.toPlan(L1id));
  const byCls = (c) => obstacles.filter((o) => o.cls === c).length;
  ok(byCls('IfcWall') >= 7 && byCls('IfcBeam') === 1 && byCls('IfcSlab') >= 2 && byCls('IfcUnitaryEquipment') === 1 && byCls('IfcAirTerminal') === 3, 'obstacles read from the model: walls, the beam, the slabs, the air handler, the diffusers', JSON.stringify(Object.fromEntries([...new Set(obstacles.map((o) => o.cls))].map((c) => [c, byCls(c)]))));
  const beam = obstacles.find((o) => o.cls === 'IfcBeam');
  ok(beam && Math.abs(beam.min[0] - 6000) < 1 && Math.abs(beam.min[2] - 3600) < 1 && Math.abs(beam.max[2] - 4000) < 1, 'the beam\'s box in the storey\'s plan mm: x 6000, z 3600 to 4000', JSON.stringify(beam && [beam.min, beam.max]));

  console.log('== routed and drawn');
  const t0 = Date.now();
  const plan = AR.planDucts(b.w(), { storey: L1, source: { eq: ahu, port: 'supply' }, terminals: dif.map((g) => ({ eq: g, port: 'neck', flow: 150 })), obstacles, clearance: 25, rate: 0.8, h: 250 });
  const ms = Date.now() - t0;
  ok(plan.ok && !plan.failed.length, 'every diffuser reached (' + ms + ' ms, ' + plan.specs.length + ' runs, ' + Math.round(plan.net?.length || 0) + ' mm of centre line)', JSON.stringify(plan.failed || plan.error));
  ok(!plan.net.clash, 'the router\'s own check: no centre line within half its size + 25 mm of an obstacle');
  for (const s of plan.specs) console.log('       ' + s.role.padEnd(6) + ' ' + (s.shape === 'round' ? 'Ø' + s.w : s.w + '×' + s.h).padEnd(8) + ' ' + String(Math.round(s.flow)).padStart(4) + ' L/s  ' + s.points.map((p) => '(' + p.map(Math.round).join(' ') + ')').join(' '));
  const n0 = b.ed.changes.length;
  go(b, AR.placeNetwork(plan.specs), 'Route ducts');
  const runs = M.readRuns(b.w());
  ok(runs.length === plan.specs.length && b.ed.changes.length === n0 + 1, 'drawn as ' + runs.length + ' duct runs in ONE undo step');
  const mains = plan.specs.filter((s) => s.role === 'main');
  ok(mains.length >= 2 && mains[0].shape === 'rect' && mains[0].w === 450 && mains[0].h === 250, 'a rectangular main, 450 × 250 at the air handler (its outlet size)', mains.map((s) => s.w + '×' + s.h).join(' → '));
  // the fittings in the file
  const lineOf = (ed, id) => ed.api.GetLine(ed.mid, id, false);
  const idsOf = (ed, T) => { const v = ed.api.GetLineIDsWithType(ed.mid, T); const o = []; for (let i = 0; i < v.size(); i++) o.push(v.get(i)); return o; };
  const fittings = (ed) => idsOf(ed, WebIFC.IFCDUCTFITTING).map((id) => lineOf(ed, id).PredefinedType?.value);
  const count = (ed) => { const f = fittings(ed); return { bend: f.filter((x) => x === 'BEND').length, tee: f.filter((x) => x === 'JUNCTION').length, reducer: f.filter((x) => x === 'TRANSITION').length, seg: idsOf(ed, WebIFC.IFCDUCTSEGMENT).length }; };
  const k1 = count(b.ed);
  ok(k1.tee === 2 && k1.reducer >= 1 && k1.bend >= 4 && k1.seg >= runs.length, 'fittings made: ' + k1.bend + ' elbows, ' + k1.tee + ' tees, ' + k1.reducer + ' reducers, ' + k1.seg + ' straight segments', JSON.stringify(k1));
  const chk = C.checkConnections(b.w());
  ok(chk.counts.error === 0, 'the Connections check: no errors (' + chk.counts.warn + ' warnings: ' + ([...new Set(chk.issues.map((i) => i.code))].join(', ') || 'none') + ')', JSON.stringify(chk.issues.filter((i) => i.level === 'error').map((i) => i.code)));
  ok(!chk.issues.some((i) => i.code === 'open-end' || i.code === 'no-source'), 'no open run end, and the whole network is fed by the air handler');
  const openPorts = chk.issues.filter((i) => i.code === 'open-port');
  ok(openPorts.length === 4, 'the only open ports are the air handler\'s return, coil and drain (4), none of the supply network', String(openPorts.length));
  b.ed.undo();
  ok(M.readRuns(b.w()).length === 0, 'Undo takes the whole network back');
  b.ed.redo();
  ok(M.readRuns(b.w()).length === runs.length, 'Redo draws it again');

  console.log('== against the structure (clash.js, the Clash check\'s code)');
  const bytes = b.ed.save();
  const b2 = await editorFor(bytes);
  const sets = Object.fromEntries(['mep', 'structure'].map((k) => [k, ST.setKeys(b2.m.classOf, k)]));
  const hard = clashes(elementsOf(b2.m.batches, sets.mep), elementsOf(b2.m.batches, sets.structure), { tolerance: 0.001 });
  ok(sets.mep.length >= k1.seg + k1.bend + k1.tee + k1.reducer && hard.length === 0, 'no duct part touches a wall, slab, beam or column (' + sets.mep.length + ' parts against ' + sets.structure.length + ' structural elements)', JSON.stringify(hard.slice(0, 5).map((c) => [b2.m.classOf.get(c.a), b2.m.classOf.get(c.b)])));
  // clearance: the soft check at 25 mm
  const soft = ST.clearances({ mep: elementsOf(b2.m.batches, sets.mep), structure: elementsOf(b2.m.batches, sets.structure), gapMm: 24 });
  ok(soft.length === 0, 'and none comes within 24 mm of one (the 25 mm typed, less a millimetre for faceting)', JSON.stringify(soft.slice(0, 3)));

  console.log('== IFC4 out, and back in');
  const text = new TextDecoder().decode(bytes);
  ok(/FILE_SCHEMA\(\('IFC4'\)\)/.test(text), 'the file is IFC4');
  const defined = new Set([...text.matchAll(/^#(\d+)=/gm)].map((m) => m[1]));
  const dangling = new Set();
  for (const line of text.split('\n')) for (const m of line.replace(/^#\d+=/, '').replace(/'(?:[^']|'')*'/g, '').matchAll(/#(\d+)/g)) if (!defined.has(m[1])) dangling.add(m[1]);
  ok(dangling.size === 0, 'no reference to a line that is not there');
  const ed2 = b2.ed, w2 = b2.w();
  const runs2 = M.readRuns(w2);
  const key = (r) => [r.shape, Math.round(r.w), Math.round(r.h), r.points.map((p) => p.map((v) => Math.round(v)).join(',')).join(';'), JSON.stringify(r.ends)].join('|');
  ok(runs2.length === runs.length && runs2.map(key).sort().join('\n') === runs.map(key).sort().join('\n'), 'BimCraft re-opens the same runs: shapes, sizes, centre lines, fixed ends');
  const k2 = count(ed2);
  ok(JSON.stringify(k2) === JSON.stringify(k1), 'and the same fittings', JSON.stringify(k2));
  const cls = (id) => ed2.api.GetNameFromTypeCode(lineOf(ed2, id).type);
  const sys = idsOf(ed2, WebIFC.IFCDISTRIBUTIONSYSTEM);
  ok(sys.length >= 1 && idsOf(ed2, WebIFC.IFCUNITARYEQUIPMENT).length === 1 && idsOf(ed2, WebIFC.IFCAIRTERMINAL).length === 3, 'classes: IfcDuctSegment, IfcDuctFitting (BEND, JUNCTION, TRANSITION), IfcUnitaryEquipment, IfcAirTerminal, IfcDistributionSystem');
  // connectivity from the file alone: element —IfcRelNests→ ports —IfcRelConnectsPorts— ports ←IfcRelNests— element
  const ownerOf = new Map(), portsOf = new Map();
  for (const id of idsOf(ed2, WebIFC.IFCRELNESTS)) {
    const r = lineOf(ed2, id), host = r.RelatingObject.value;
    for (const p of r.RelatedObjects) if (lineOf(ed2, p.value).type === WebIFC.IFCDISTRIBUTIONPORT) { ownerOf.set(p.value, host); (portsOf.get(host) || portsOf.set(host, []).get(host)).push(p.value); }
  }
  const linked = new Map();
  for (const id of idsOf(ed2, WebIFC.IFCRELCONNECTSPORTS)) { const r = lineOf(ed2, id), a = r.RelatingPort.value, c = r.RelatedPort.value; (linked.get(a) || linked.set(a, []).get(a)).push(c); (linked.get(c) || linked.set(c, []).get(c)).push(a); }
  const ports = idsOf(ed2, WebIFC.IFCDISTRIBUTIONPORT);
  ok(ports.length > 0 && ports.every((p) => ownerOf.has(p)), ports.length + ' IfcDistributionPorts, each nested in its element (IfcRelNests)');
  const ahuId = idsOf(ed2, WebIFC.IFCUNITARYEQUIPMENT)[0], terms = new Set(idsOf(ed2, WebIFC.IFCAIRTERMINAL));
  const seen = new Set([ahuId]), queue = [ahuId];
  while (queue.length) { const e = queue.shift(); for (const p of portsOf.get(e) || []) for (const q of linked.get(p) || []) { const o = ownerOf.get(q); if (o && !seen.has(o)) { seen.add(o); queue.push(o); } } }
  ok([...terms].every((t) => seen.has(t)), 'every diffuser is reached from the air handler through the file\'s ports alone (' + seen.size + ' elements on the way)');
  const netParts = new Set([...sets.mep]);
  ok([...netParts].every((k) => seen.has(k)), 'and so is every duct part (nothing left floating)', String([...netParts].filter((k) => !seen.has(k)).length));
  // the network against itself: two parts may overlap only when a port joins them (a segment in its elbow, the tee's arms)
  const joinedTo = new Map();
  for (const [p, list] of linked) for (const q of list) { const a = ownerOf.get(p), c = ownerOf.get(q); if (a && c) (joinedTo.get(a) || joinedTo.set(a, new Set()).get(a)).add(c); }
  const mepEl = elementsOf(b2.m.batches, sets.mep);
  const self = clashes(mepEl, mepEl, { tolerance: 0.001 }).filter((c) => c.a !== c.b && !joinedTo.get(c.a)?.has(c.b));
  ok(self.length === 0, 'no duct part runs through another one it is not joined to', JSON.stringify(self.slice(0, 5).map((c) => [c.a, c.b])));
  const flows = (pid) => lineOf(ed2, pid).FlowDirection?.value;
  ok([...linked.entries()].every(([a, list]) => list.every((c) => flows(a) !== flows(c) || flows(a) === 'SOURCEANDSINK')), 'every connection joins a SOURCE to a SINK');
  const widths = runs2.map((r) => r.w).sort((x, y) => x - y).join(' ');
  const specKey = (s) => [s.shape, Math.round(s.w), Math.round(s.h)].join(' ');
  ok(runs2.map(specKey).sort().join('|') === plan.specs.map(specKey).sort().join('|'), 'sizes kept through the file: every run has the shape and sides it was routed with (widths ' + widths + ' mm)');

  console.log('== edited afterwards');
  const before = new Map(runs2.map((r) => [r.guid, key(r)]));
  const last = runs2.find((r) => r.ends[1] && r.shape === 'round' && r.ends[0] === null && runs2.some((o) => o !== r && o.shape === 'rect' && Math.hypot(...[0, 1, 2].map((k) => o.points[o.points.length - 1][k] - r.points[0][k])) < 1));
  if (last) {
    ed2.modelChange(M.changeRun(last.guid, { shape: 'rect', w: 300, h: 250 }), { label: 'size' });
    const after = M.readRuns(b2.w());
    const k3 = count(ed2);
    ok(after.filter((r) => r.guid !== last.guid).every((r) => before.get(r.guid) === key(r)), 'the other runs\' definitions are unchanged');
    ok(k3.reducer === k1.reducer - 1 && k3.tee === k1.tee, 'the main\'s last piece made 300 × 250 like the piece before it: that reducer goes, the tees stay (' + k3.reducer + ' reducers)', JSON.stringify(k3));
    const chk2 = C.checkConnections(b2.w());
    ok(chk2.issues.filter((i) => i.level === 'error').every((i) => i.code === 'size'), 'still joined up (the one error left is the size the edit made at the diffuser: ' + chk2.counts.error + ')', JSON.stringify(chk2.issues.filter((i) => i.level === 'error').map((i) => i.code)));
    ed2.undo();
    ok(JSON.stringify(count(ed2)) === JSON.stringify(k1), 'Undo puts the reducer back');
  } else ok(false, 'a round last piece of the main after a reducer, to edit');

  if (write) {
    const dir = path.join(ROOT, 'fixtures/mep-route');
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'autoroute-ahu-3-terminals.ifc'), bytes);
    fs.writeFileSync(path.join(dir, 'autoroute-ahu-3-terminals-unrouted.ifc'), unrouted);   // the same model before routing (browser-autoroute.mjs opens it)
    // a plan drawing of the network: walls, beam, equipment boxes, the runs by width
    const W = 14000, H = 8000, s = 0.06, pad = 20;
    const X = (x) => (pad + x * s).toFixed(1), Y = (y) => (pad + (H - y) * s).toFixed(1);
    const rect = (o, cl) => '<rect class="' + cl + '" x="' + X(o.min[0]) + '" y="' + Y(o.max[1]) + '" width="' + ((o.max[0] - o.min[0]) * s).toFixed(1) + '" height="' + ((o.max[1] - o.min[1]) * s).toFixed(1) + '"/>';
    const el = [];
    for (const o of obstacles) if (o.cls === 'IfcWall') el.push(rect(o, 'wall')); else if (o.cls === 'IfcBeam') el.push(rect(o, 'beam')); else if (/Equipment|Terminal/.test(o.cls)) el.push(rect(o, 'eq'));
    for (const r of plan.specs) el.push('<polyline class="' + r.role + '" stroke-width="' + Math.max(2, r.w * s).toFixed(1) + '" points="' + r.points.map((p) => X(p[0]) + ',' + Y(p[1])).join(' ') + '"/>');
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + (W * s + 2 * pad) + ' ' + (H * s + 2 * pad + 30) + '"><style>rect.wall{fill:#555}rect.beam{fill:none;stroke:#c0392b;stroke-dasharray:6 3}rect.eq{fill:#ddd;stroke:#333}polyline{fill:none;stroke-linejoin:round;opacity:.85}.main{stroke:#1f6fb2}.branch{stroke:#2e9e5b}text{font:12px sans-serif}</style>'
      + el.join('') + '<text x="' + pad + '" y="' + (H * s + 2 * pad + 18) + '">Level 1 plan. Blue: main ' + mains.map((r) => (r.shape === 'round' ? 'Ø' + r.w : r.w + '×' + r.h)).join(' → ') + '. Green: branches. Red dashes: beam.</text></svg>';
    fs.writeFileSync(path.join(dir, 'autoroute-ahu-3-terminals-plan.svg'), svg);
    console.log('  wrote fixtures/mep-route/autoroute-ahu-3-terminals.ifc (' + bytes.length + ' bytes) and its plan .svg');
  }
  console.log((bad ? 'FAILED ' : 'passed ') + good + ' / ' + (good + bad));
  return bad ? 1 : 0;
}
