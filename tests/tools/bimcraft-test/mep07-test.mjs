/* SPDX-License-Identifier: Apache-2.0 */
/**
 * `node bin/test-bimcraft.mjs --mep07` (0.7 LC.9, session `mep-07`): the add-on API 1.1 (model.write, mep.runs, mep.ports) against
 * a real IfcEditor; more sections join as the session's items land (equipment with ports, connected runs, clash sets and openings,
 * spools). Models are made here (new-model.js) in IFC4 and IFC2X3; IfcOpenShell checks the saved files when its venv exists.
 * `--only <section>` runs one section (api, equip, connect, structure, spools).
 */
import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';
import { execFileSync } from 'node:child_process';

export async function mep07Mode({ APP, ROOT, WebIFC, IfcModel, quiet, args = [] }) {
  let bad = 0, good = 0;
  const ok = (cond, label, detail = '') => { if (cond) good++; else bad++; console.log((cond ? '  ok   ' : '  FAIL ') + label + (!cond && detail ? ' (' + detail + ')' : '')); };
  const near = (a, b, e = 0.01) => Math.abs(a - b) <= e;
  const only = args.includes('--only') ? args[args.indexOf('--only') + 1] : null;
  const want = (k) => !only || only === k;
  const M = await import(path.join(APP, 'mep-model.js'));
  const { ModelWriter } = await import(path.join(APP, 'model-write.js'));
  const { IfcEditor } = await import(path.join(APP, 'ifc-edit.js'));
  const OPS = await import(path.join(APP, 'model-ops.js'));
  const N = await import(path.join(APP, 'new-model.js'));
  const P = await import(path.join(APP, 'mep/ports.js'));
  const dec = (b) => new TextDecoder().decode(b);
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'mep07-'));
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
  /** IFC4: a new BimCraft building (mm); IFC2X3: DetailCraft's public steel fixture (mm, one storey). */
  const building = (schema) => schema === 'IFC2X3' ? editorFor(fs.readFileSync(path.join(ROOT, 'tools/detailcraft-test/fixtures/ios-steel-ifc2x3.ifc')))
    : editorFor(new TextEncoder().encode(N.newBuilding({ name: 'MEP 07', levels: N.stackLevels(2, 3000, (i) => 'Level ' + (i + 1)), fileName: 'm.ifc', now: new Date('2026-10-23T12:00:00Z') })));
  const reopen = async (bytes) => editorFor(bytes);
  /** An IfcRoot by GlobalId, any class (ModelWriter.byGuid knows only the Draw tools' classes). */
  const findGuid = (ed, g) => { for (const t of ed.api.GetAllTypesOfModel(ed.mid)) { const v = ed.api.GetLineIDsWithType(ed.mid, t.typeID); for (let i = 0; i < v.size(); i++) { const l = ed.api.GetLine(ed.mid, v.get(i), false); if (l?.GlobalId?.value === g) return v.get(i); } } return null; };
  /** IfcOpenShell's schema check when tools/bimcraft-test's venv is there (null = not available here). */
  const PY = [path.join(ROOT, 'tools/detailcraft-test/venv/bin/python'), path.join(ROOT, 'tools/bimcraft-test/venv/bin/python')].find((p) => fs.existsSync(p));
  /** → { errors, first } or null when no venv */
  const validate = (file) => {
    if (!PY) return null;
    let out = '';
    try { out = execFileSync(PY, ['-I', path.join(ROOT, 'tools/bimcraft-test/ifc_validate.py'), file], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }); } catch (e) { out = String(e.stdout || ''); }
    try { return JSON.parse(out.trim().split('\n').pop()); } catch (e) { return { errors: -1, first: [out.slice(0, 300)] }; }
  };

  // ============================================================================================ the showcase (made once)
  // `--showcase`: fixtures/showcase/bimcraft-mep-plant-room.ifc, built here with the app's own ops when it is not there yet
  // (`--showcase --force` builds it again; the README line says what is in it). Nothing else runs.
  if (args.includes('--showcase')) {
    const out = path.join(ROOT, 'fixtures/showcase/bimcraft-mep-plant-room.ifc');
    if (fs.existsSync(out) && !args.includes('--force')) { console.log('  --   ' + path.relative(ROOT, out) + ' is there: not made again'); return 0; }
    const E = await import(path.join(APP, 'mep/equipment.js'));
    const C = await import(path.join(APP, 'mep/connections.js'));
    const SP = await import(path.join(APP, 'mep/spools.js'));
    const b = await editorFor(new TextEncoder().encode(N.newBuilding({ name: 'Plant room', levels: N.stackLevels(2, 3600, (i) => 'Level ' + (i + 1)), fileName: 'bimcraft-mep-plant-room.ifc', now: new Date('2026-10-23T12:00:00Z') })));
    const [L1, L2] = b.levels.map((l) => l.guid);
    const go = (opr, label) => { try { return b.ed.modelChange(opr, { label }); } catch (e) { throw new Error(label + ': ' + (e.key || e.message)); } };
    const R4 = [[0, 0], [12000, 0], [12000, 8000], [0, 8000]];
    go(OPS.drawWalls({ storey: L1, segs: R4.map((p, i) => ({ a: p, b: R4[(i + 1) % 4] })), typeKey: 'ext-2x6', topLevel: L2 }), 'walls');
    go(OPS.placeFloor({ storey: L1, seed: [6000, 4000], mode: 'room', kind: 'concrete' }), 'floor');
    const place = (spec) => [...go(E.placeEquipment({ storey: L1, ...spec }), spec.kind).made.keys()][0];
    const eqOf = (g) => E.readEquipment(b.w()).find((e) => e.guid === g);
    const portOf = (g, name) => E.portsAt(eqOf(g)).find((p) => p.name === name).at;
    const ahu = place({ kind: 'ahu', values: {}, x: 3000, y: 2500, tag: 'AHU-1', name: 'Air handler' });
    const dif1 = place({ kind: 'diffuser', values: { neck: 250 }, x: 7000, y: 5000, z: 2700, tag: 'D-1', name: 'Diffuser' });
    const dif2 = place({ kind: 'diffuser', values: { neck: 250 }, x: 10000, y: 5000, z: 2700, tag: 'D-2', name: 'Diffuser' });
    const grl = place({ kind: 'grille', values: { faceW: 700, faceH: 500, neckW: 600, neckH: 400 }, x: 3000, y: 6500, z: 2700, tag: 'R-1', name: 'Grille' });
    const pump = place({ kind: 'pump', values: { size: '1-1/2', system: 'chw' }, x: 6500, y: 1200, rot: 180, tag: 'CHWP-1', name: 'Pump' });
    place({ kind: 'boiler', values: {}, x: 10500, y: 1200, tag: 'B-1', name: 'Boiler' });
    place({ kind: 'heater', values: {}, x: 9000, y: 1000, tag: 'WH-1', name: 'Water heater' });
    place({ kind: 'tank', values: { diameter: 600, height: 1200, size: '1-1/2', system: 'chw' }, x: 7800, y: 2800, tag: 'ET-1', name: 'Tank' });
    // supply air: up from the air handler, east over the ceiling, a branch down to each diffuser
    const sp = portOf(ahu, 'supply');
    go(M.placeRun({ storey: L1, kind: 'duct', system: 'supply', shape: 'rect', w: 600, h: 400, points: [sp, [sp[0] + 900, sp[1], sp[2]], [sp[0] + 900, sp[1], 3400], [10600, sp[1], 3400]], ends: [{ eq: ahu, port: 'supply' }, null] }), 'supply main');
    for (const d of [dif1, dif2]) { const n = portOf(d, 'neck'); go(M.placeRun({ storey: L1, kind: 'duct', system: 'supply', shape: 'round', w: 250, h: 250, points: [[n[0], sp[1], 3400], [n[0], n[1], 3400], n], ends: [null, { eq: d, port: 'neck' }] }), 'branch'); }
    // return air: from the grille up and back to the air handler's return
    const rn = portOf(grl, 'neck'), rp = portOf(ahu, 'return');
    go(M.placeRun({ storey: L1, kind: 'duct', system: 'return', shape: 'rect', w: 600, h: 400, points: [rn, [rn[0], rn[1], 3450], [rp[0] - 900, rn[1], 3450], [rp[0] - 900, rp[1], 3450], [rp[0] - 900, rp[1], rp[2]], rp], ends: [{ eq: grl, port: 'neck' }, { eq: ahu, port: 'return' }] }), 'return');
    // chilled water: the pump's outlet to the coil (steel, spooled), the coil's outlet out through the south wall (insulated)
    const po = portOf(pump, 'out'), ci = portOf(ahu, 'coil-in'), co = portOf(ahu, 'coil-out');
    go(M.placeRun({ storey: L1, kind: 'pipe', system: 'chw', mat: 'steel', cls: '40', size: '1-1/2', points: [po, [ci[0], po[1], po[2]], [ci[0], po[1], ci[2]], ci], ends: [{ eq: pump, port: 'out' }, { eq: ahu, port: 'coil-in' }], insulation: 25, spoolMax: 2400, fieldWelds: [1000], line: '1' }), 'chw supply');
    go(M.placeRun({ storey: L1, kind: 'pipe', system: 'chw', mat: 'steel', cls: '40', size: '1-1/2', points: [co, [co[0], -1500, co[2]]], ends: [{ eq: ahu, port: 'coil-out' }, null], insulation: 25, spoolMax: 6000, line: '2' }), 'chw return');
    const chk = C.checkConnections(b.w());
    const bytes = b.ed.save();
    fs.writeFileSync(out, bytes);
    console.log('  made ' + path.relative(ROOT, out) + ' (' + bytes.length + ' bytes): ' + E.readEquipment(b.w()).length + ' pieces of equipment, ' + M.readRuns(b.w()).length + ' runs, ' + SP.readSpools(b.w(), M.readRuns(b.w())).length + ' spools; check: ' + chk.counts.error + ' errors, ' + chk.counts.warn + ' warnings (' + chk.issues.map((i) => i.code).join(', ') + ')');
    return 0;
  }

  // ============================================================================================ 1. the add-on API 1.1
  if (want('api')) for (const schema of ['IFC4', 'IFC2X3']) {
    console.log('== add-on API 1.1 (addons/bimcraft-api.js) on a new ' + schema + ' building');
    const BA = await import(path.join(APP, 'addons/bimcraft-api.js'));
    ok(BA.BIMCRAFT_API_VERSION === '1.1', 'the API says 1.1');
    const A = await import(path.join(APP, 'addons.js'));
    ok(A.checkManifest({ id: 'zz.a', name: 'A', version: '1.0.0', apps: ['bimcraft'], api: '1.0', license: 'Apache-2.0', entry: 'main.js' }, { app: 'bimcraft', apiVersion: BA.BIMCRAFT_API_VERSION }).ok
      && !A.checkManifest({ id: 'zz.a', name: 'A', version: '1.0.0', apps: ['bimcraft'], api: '1.2', license: 'Apache-2.0', entry: 'main.js' }, { app: 'bimcraft', apiVersion: BA.BIMCRAFT_API_VERSION }).ok,
      'an add-on written for 1.0 still loads; one asking for 1.2 does not');
    const b = await building(schema);
    const lvl = b.levels[0];
    // a pipe run drawn the usual way, so mep.runs / mep.ports have something to read
    b.ed.modelChange(M.placeRun({ storey: lvl.guid, kind: 'pipe', system: 'cw', mat: 'steel', cls: '40', size: '2', points: [[0, 0, 2700], [3000, 0, 2700], [3000, 2000, 2700]] }), { label: 'Pipe' });
    let edits = 0;
    const ctx = { editor: () => b.ed, model: () => ({}), name: () => 'm.ifc', selection: () => [], select: () => {}, afterEdit: () => { edits++; }, status: () => {}, registry: { importers: new Map(), exporters: new Map() }, commands: new Map(), props: new Map(), tabs: new Map(), changeListeners: new Set() };
    const base = { onDeactivate: () => {}, log: () => {}, t: (k) => k };
    const api = BA.makeBimcraftApi(base, { id: 'zz-test.writer', name: 'Writer' }, ctx);
    const n0 = b.ed.changes.length;
    const res = await api.model.write('a box', (w) => {
      const st = w.byGuid(lvl.guid);
      const lp = w.api.GetLine(w.mid, st, false).ObjectPlacement.value;
      const id = w.make('IFCBUILDINGELEMENTPROXY', w.guid(), w.ownerHistory(), w.L('Test box'), null, null, w.H(w.placeAt(lp, 1000, 1000, 0, 0)), null, null, ...(w.v4 ? ['NOTDEFINED'] : [null]));
      w.setShape(id, [w.rep('body', 'Body', 'SweptSolid', [w.box(0, 0, 0, 500, 400, 300)])]);
      w.contain(id, st);
      w.upsertPset(id, 'ZZ_Test', [['Note', 'IFCLABEL', 'made by an add-on']]);
      return { made: w.guidOf(id) };
    });
    ok(b.ed.changes.length === n0 + 1 && b.ed.changes.at(-1).label === 'Writer: a box' && edits === 1, 'model.write: ONE change in the editor, labelled "<add-on>: <label>", panels refreshed');
    ok(res.created.length === 1 && res.guids.length === 1 && res.value.made === res.guids[0], 'it returns the created element (express id + GlobalId) and fn\'s value', JSON.stringify(res));
    const proxyId = res.created[0];
    ok(/BUILDINGELEMENTPROXY/i.test(b.ed.api.GetNameFromTypeCode(b.ed.api.GetLine(b.ed.mid, proxyId, false).type)), 'the created id is the proxy');
    b.ed.undo();
    ok(!findGuid(b.ed, res.guids[0]) && b.ed.changes.length === n0, 'Undo takes it back');
    b.ed.redo();
    const again = findGuid(b.ed, res.guids[0]);
    ok(again && b.w().readPset(again, 'ZZ_Test')?.Note === 'made by an add-on', 'Redo makes it again with the same GlobalId (fn runs again)');
    let threw = '';
    const before = b.ed.changes.length;
    try { await api.model.write('broken', (w) => { w.make('IFCBUILDINGELEMENTPROXY', w.guid(), w.ownerHistory(), w.L('half'), null, null, null, null, null, ...(w.v4 ? ['NOTDEFINED'] : [null])); throw new Error('stop'); }); } catch (e) { threw = e.message; }
    ok(threw === 'stop' && b.ed.changes.length === before, 'a throw in fn rejects and records nothing');
    const half = [...(function* () { const v = b.ed.api.GetLineIDsWithType(b.ed.mid, WebIFC.IFCBUILDINGELEMENTPROXY); for (let i = 0; i < v.size(); i++) yield v.get(i); })()].filter((id) => { const l = b.ed.api.GetLine(b.ed.mid, id, false); return l && l.Name?.value === 'half'; });
    ok(!half.length, '…and leaves nothing half-made in the file');
    // mep.runs / mep.ports
    const runs = api.mep.runs();
    ok(runs.length === 1 && runs[0].kind === 'pipe' && runs[0].size === '2' && runs[0].storey === lvl.guid && runs[0].parts.length === 3, 'mep.runs: the run with its storey GlobalId, size and parts', JSON.stringify(runs[0]).slice(0, 200));
    runs[0].size = '99';
    ok(api.mep.runs()[0].size === '2', 'mep.runs is a copy (changing it changes nothing)');
    const ports = api.mep.ports();
    const runPorts = ports.filter((p) => p.role === 'run');
    ok(runPorts.length === 6 && runPorts.every((p) => p.kind === 'pipe' && p.system === 'cw' && p.nominal === '2' && near(p.size, 60.325, 0.01) && p.run === runs[0].guid), 'mep.ports: 6 ports (segment, elbow, segment), pipe, cold water, NPS 2, OD 60.3', JSON.stringify(runPorts[0]));
    const joined = runPorts.filter((p) => p.connectedTo);
    ok(joined.length === 4 && joined.every((p) => ports.find((q) => q.id === p.connectedTo)?.connectedTo === p.id), 'the four inner ports are connected in pairs; the two run ends are open');
    const open = runPorts.filter((p) => !p.connectedTo).map((p) => p.at);
    ok(open.some((q) => near(q[0], 0, 0.5) && near(q[1], 0, 0.5) && near(q[2], 2700, 0.5)) && open.some((q) => near(q[0], 3000, 0.5) && near(q[1], 2000, 0.5)), 'the open ports sit at the run\'s two ends, in plan mm above the level', JSON.stringify(open));
    const start = runPorts.find((p) => !p.connectedTo && near(p.at[0], 0, 0.5));
    ok(start && near(start.out[0], -1, 1e-6) && start.flow === 'SINK', 'the start port faces back along the run and is the SINK end', JSON.stringify(start?.out));
    // 1.1 additions asked by plant-design: model.read, mep.placeRun, mep.addPorts, mep.spools
    ok(api.model.read((w) => w.byGuid(lvl.guid)) > 0, 'model.read: fn gets a writer and its value comes back');
    threw = '';
    try { api.model.read((w) => w.make('IFCBUILDINGELEMENTPROXY', w.guid(), null, null, null, null, null, null, null, null)); } catch (e) { threw = e.message || 'threw'; }
    ok(threw && b.ed.changes.length === before, 'model.read cannot write (a write throws, nothing recorded)');
    // an add-on's own pump with ports, then a run from its outlet through mep.placeRun
    const tank = await api.model.write('vessel', (w) => {
      const st = w.byGuid(lvl.guid), lp = w.api.GetLine(w.mid, st, false).ObjectPlacement.value;
      const id = w.make('IFCBUILDINGELEMENTPROXY', w.guid(), w.ownerHistory(), w.L('Vessel'), null, null, w.H(w.placeAt(lp, 0, 6000, 0, 0)), null, null, ...(w.v4 ? ['NOTDEFINED'] : [null]));
      w.setShape(id, [w.rep('body', 'Body', 'SweptSolid', [w.box(-500, -500, 0, 500, 500, 1500)])]);
      w.contain(id, st);
      api.mep.addPorts(w, id, [{ name: 'N1', system: 'chw', direction: 'out', shape: 'round', size: 60.325, nominal: '2', x: 575, y: 0, z: 600, axis: [1, 0, 0] }]);
      return id;
    });
    const n1 = api.mep.ports().find((p) => p.owner === tank.created[0]);
    ok(n1 && n1.role === 'equipment' && n1.portName === 'N1' && n1.nominal === '2' && near(n1.at[0], 575, 0.05) && near(n1.at[1], 6000, 0.05) && near(n1.out[0], 1, 1e-9), 'mep.addPorts: the add-on\'s vessel has its port (CadCraft_Port, NPS 2, facing east), read as role equipment', JSON.stringify(n1));
    const pr = await api.mep.placeRun({ storey: lvl.guid, kind: 'pipe', system: 'chw', mat: 'steel', cls: '40', size: '2', points: [n1.at, [n1.at[0] + 2000, n1.at[1], n1.at[2]]], label: 'routed' });
    const n1b = api.mep.ports().find((p) => p.id === n1.id);
    ok(pr.guid && api.mep.runs().some((r) => r.guid === pr.guid) && b.ed.changes.at(-1).label === 'Writer: routed', 'mep.placeRun: the run is drawn, one change labelled with the add-on');
    ok(n1b.connectedTo && api.mep.ports().find((p) => p.id === n1b.connectedTo)?.run === pr.guid, '…and its start is connected to the vessel\'s port');
    ok(Array.isArray(api.mep.spools()) && api.mep.spools().length === 0, 'mep.spools: none until a steel run is cut into spools');
    b.ed.modelChange(M.changeRun(pr.guid, { spoolMax: 1500, line: '7' }), { label: 'spools' });
    const sp = api.mep.spools();
    ok(sp.length === 2 && sp[0].id === 'CHW-7-S01' && sp[0].run === pr.guid && sp[0].parts.length >= 1, 'mep.spools: CHW-7-S01, S02 with their parts', JSON.stringify(sp));
    // the file saves clean and reads back
    const bytes = b.ed.save();
    const txt = dec(bytes);
    ok(!danglingRefs(txt).length, 'saved: no reference to a missing line');
    const f = path.join(tmp, 'api11-' + schema + '.ifc');
    fs.writeFileSync(f, bytes);
    const v = validate(f);
    ok(v === null || v.errors === 0, 'IfcOpenShell: schema clean' + (v === null ? ' (venv not here: skipped)' : ''), JSON.stringify(v?.first));
    const b2 = await reopen(bytes);
    const p2 = P.readPorts(b2.w());
    ok(p2.filter((p) => p.role === 'run').length >= 6 && findGuid(b2.ed, res.guids[0]), 'reopened: the ports and the add-on\'s element are there');
  }

  // ============================================================================================ 2. equipment with ports
  const saved = {};
  if (want('equip')) {
    console.log('== equipment with ports (mep/equipment.js): items, IFC classes, ports, systems, moves, undo');
    const E = await import(path.join(APP, 'mep/equipment.js'));
    const LI = await import(path.join(APP, 'libitem.js'));
    for (const kind of E.EQUIPMENT_KINDS) {
      const item = E.equipmentItem(kind, {}, { name: kind });
      const v = LI.validateItem(item, { partial: true });
      const names = item.ports.map((p) => p.name);
      ok(v.ok && item.ports.length >= 1 && new Set(names).size === names.length && item.body.indices.length > 0, kind + ': a valid library item (format 1, partial) with ' + item.ports.length + ' ports, names unique', (v.errors || []).slice(0, 3).join(' | '));
    }
    let threw = '';
    try { E.equipmentItem('diffuser', { face: 200, neck: 250 }); } catch (e) { threw = e.key; }
    ok(threw === 'mep.eq.err.fit', 'a neck wider than its face is refused (mep.eq.err.fit)');
    threw = '';
    try { E.equipmentValues('pump', { size: '2-3/4' }); } catch (e) { threw = e.key; }
    ok(threw === 'mep.eq.err.value', 'a pipe size the table does not have is refused');
    const pumpItem = E.equipmentItem('pump', { size: '2' });
    ok(pumpItem.ports.every((p) => near(p.size, 60.325, 1e-6)) && !('nominal' in pumpItem.ports[0]), 'pump NPS 2: ports 60.3 mm (steel OD, ASME B36.10M); the item format has no nominal yet, so it is not in the item');
    const at = E.portsAt({ kind: 'pump', values: E.equipmentValues('pump', { size: '2' }), x: 1000, y: 500, z: 0, rot: 90 });
    const pin = at.find((p) => p.name === 'in');
    ok(near(pin.at[0], 1000, 1e-6) && pin.at[1] < 500 && near(pin.axis[1], -1, 1e-9), 'turned 90°: the pump\'s suction port is south of it, facing south');

    for (const schema of ['IFC4', 'IFC2X3']) {
      console.log('-- placed in ' + schema);
      const b = await building(schema);
      const lvl = b.levels[0];
      const placed = {};
      let x = 0;
      for (const kind of E.EQUIPMENT_KINDS) {
        const n0 = b.ed.changes.length;
        const r = b.ed.modelChange(E.placeEquipment({ storey: lvl.guid, kind, values: {}, x, y: 0, z: kind === 'diffuser' || kind === 'grille' ? 2700 : 0, rot: 0, tag: kind.toUpperCase() + '-1', name: kind }), { label: kind });
        placed[kind] = { id: r.id, guid: [...r.made.keys()][0] };
        x += 4000;
        if (b.ed.changes.length !== n0 + 1) ok(false, kind + ': one change');
      }
      const w = b.w();
      const eqs = E.readEquipment(w);
      ok(eqs.length === E.EQUIPMENT_KINDS.length && eqs.every((e) => e.storey === w.byGuid(lvl.guid)), 'every kind placed, one change each, on its level');
      const clsOf = (id) => String(b.ed.api.GetNameFromTypeCode(b.ed.api.GetLine(b.ed.mid, id, false).type)).toUpperCase();
      const want4 = { ahu: 'IFCUNITARYEQUIPMENT', fan: 'IFCFAN', pump: 'IFCPUMP', boiler: 'IFCBOILER', heater: 'IFCBOILER', terminal: 'IFCAIRTERMINALBOX', diffuser: 'IFCAIRTERMINAL', grille: 'IFCAIRTERMINAL', tank: 'IFCTANK' };
      const want3 = { ahu: 'IFCENERGYCONVERSIONDEVICE', fan: 'IFCFLOWMOVINGDEVICE', pump: 'IFCFLOWMOVINGDEVICE', boiler: 'IFCENERGYCONVERSIONDEVICE', heater: 'IFCENERGYCONVERSIONDEVICE', terminal: 'IFCFLOWCONTROLLER', diffuser: 'IFCFLOWTERMINAL', grille: 'IFCFLOWTERMINAL', tank: 'IFCFLOWSTORAGEDEVICE' };
      const wantC = schema === 'IFC4' ? want4 : want3;
      const wrong = E.EQUIPMENT_KINDS.filter((k) => clsOf(placed[k].id) !== wantC[k]);
      ok(!wrong.length, 'classes: ' + E.EQUIPMENT_KINDS.map((k) => k + ' → ' + wantC[k]).join(', '), wrong.join());
      const ports = P.readPorts(w).filter((p) => p.role === 'equipment');
      const total = E.EQUIPMENT_KINDS.reduce((n, k) => n + E.equipmentItem(k, {}).ports.length, 0);
      ok(ports.length === total, 'every port written (' + total + '), read back as equipment ports with their CadCraft_Port', ports.length + ' vs ' + total);
      const pump = eqs.find((e) => e.kind === 'pump');
      const pp = ports.filter((p) => p.owner === pump.id);
      const ex = E.portsAt(pump);
      ok(pp.length === 2 && pp.every((p) => { const q = ex.find((o) => o.name === p.portName); return q && q.at.every((c, i) => near(c, p.at[i], 0.05)) && q.axis.every((c, i) => near(c, p.out[i], 1e-6)); }),
        'the pump\'s ports sit where portsAt says, facing out (from their IFC placements)', JSON.stringify(pp.map((p) => [p.portName, p.at, p.out])));
      ok(pp.find((p) => p.portName === 'in').flow === 'SINK' && pp.find((p) => p.portName === 'out').flow === 'SOURCE' && pp.every((p) => p.kind === 'pipe' && p.system === 'chw' && p.nominal === '2'), 'pump: in = SINK, out = SOURCE, pipe, chilled water, NPS 2');
      const ahuP = ports.filter((p) => p.owner === placed.ahu.id);
      ok(ahuP.find((p) => p.portName === 'supply')?.shape === 'rect' && near(ahuP.find((p) => p.portName === 'supply').w, 600) && near(ahuP.find((p) => p.portName === 'supply').h, 400) && ahuP.find((p) => p.portName === 'drain')?.system === 'san', 'air handler: a 600 × 400 supply duct port, a condensate drain on the sanitary system');
      const tpe = (id) => { const v = b.ed.api.GetLineIDsWithType(b.ed.mid, WebIFC.IFCRELDEFINESBYTYPE); for (let i = 0; i < v.size(); i++) { const r = b.ed.api.GetLine(b.ed.mid, v.get(i), false); if ((r.RelatedObjects || []).some((h) => h.value === id)) return r.RelatingType.value; } return null; };
      ok(String(b.ed.api.GetNameFromTypeCode(b.ed.api.GetLine(b.ed.mid, tpe(placed.diffuser.id), false).type)).toUpperCase() === 'IFCAIRTERMINALTYPE' && String(b.ed.api.GetLine(b.ed.mid, tpe(placed.diffuser.id), false).PredefinedType?.value) === 'DIFFUSER', 'the diffuser\'s type: IfcAirTerminalType DIFFUSER');
      ok(w.readPset(placed.tank.id, 'CadCraft_LibraryItem')?.Library === 'cadcraft-generic' && w.readPset(placed.tank.id, 'CadCraft_MepEquipment')?.Tag === 'TANK-1', 'library item sets (Library cadcraft-generic) and the tag');
      // a second pump of the same size shares the type; resizing one gives it its own
      b.ed.modelChange(E.placeEquipment({ storey: lvl.guid, kind: 'pump', values: {}, x: 0, y: 3000, rot: 180 }), { label: 'pump 2' });
      const pumps = E.readEquipment(b.w()).filter((e) => e.kind === 'pump');
      ok(pumps.length === 2 && tpe(pumps[0].id) === tpe(pumps[1].id), 'two pumps of one size share one type');
      // move the first pump: its ports follow
      b.ed.modelChange(E.changeEquipment(pumps[0].guid, { x: 500, y: 7000, rot: 90 }), { label: 'move' });
      const pm = E.readEquipment(b.w()).find((e) => e.guid === pumps[0].guid);
      const pp2 = P.readPorts(b.w()).filter((p) => p.owner === pm.id);
      const ex2 = E.portsAt(pm);
      ok(pm.x === 500 && pm.rot === 90 && pp2.length === 2 && pp2.every((p) => { const q = ex2.find((o) => o.name === p.portName); return q && q.at.every((c, i) => near(c, p.at[i], 0.05)); }), 'moved and turned: its ports are where the pump now is', JSON.stringify(pp2.map((p) => p.at)));
      b.ed.modelChange(E.changeEquipment(pumps[0].guid, { values: { size: '3' } }), { label: 'resize' });
      const pr = E.readEquipment(b.w()).filter((e) => e.kind === 'pump');
      ok(tpe(pr[0].id) !== tpe(pr[1].id) && P.readPorts(b.w()).filter((p) => p.owner === pr.find((e) => e.guid === pumps[0].guid).id).every((p) => p.nominal === '3'), 'resized to NPS 3: its own type, ports NPS 3');
      b.ed.undo(); b.ed.undo();
      const back = E.readEquipment(b.w()).find((e) => e.guid === pumps[0].guid);
      ok(back.x === pump.x && back.y === pump.y && back.rot === 0 && back.values.size === '2', 'two undos: back where it was, NPS 2', JSON.stringify([back.x, back.y, pump.x]));
      b.ed.redo();
      ok(E.readEquipment(b.w()).find((e) => e.guid === pumps[0].guid).x === 500, 'redo moves it again');
      // systems
      const sys = (id) => { const out = []; const v = b.ed.api.GetLineIDsWithType(b.ed.mid, WebIFC.IFCRELASSIGNSTOGROUP); for (let i = 0; i < v.size(); i++) { const r = b.ed.api.GetLine(b.ed.mid, v.get(i), false); if ((r.RelatedObjects || []).some((h) => h.value === id)) out.push(b.ed.api.GetLine(b.ed.mid, r.RelatingGroup.value, false).Name?.value); } return out.sort(); };
      ok(sys(placed.ahu.id).length === 4, 'the air handler is in four systems (supply, return, chilled water, sanitary)', JSON.stringify(sys(placed.ahu.id)));
      // remove one
      b.ed.modelChange(E.removeEquipment([pumps[1].guid]), { label: 'remove' });
      ok(E.readEquipment(b.w()).filter((e) => e.kind === 'pump').length === 1 && P.readPorts(b.w()).filter((p) => p.role === 'equipment').length === total, 'removed: it and its ports are gone');
      const bytes = b.ed.save();
      ok(!danglingRefs(dec(bytes)).length, 'saved: no reference to a missing line', danglingRefs(dec(bytes)).slice(0, 5).join());
      saved['equip-' + schema] = bytes;
      const b2 = await reopen(bytes);
      ok(E.readEquipment(b2.w()).length === E.EQUIPMENT_KINDS.length && P.readPorts(b2.w()).filter((p) => p.role === 'equipment').length === total, 'reopened: the equipment and its ports read back');
      // cc-ifc draws each piece (its own body)
      const eng = await quiet(IfcModel.create)(WebIFC, null), m = await quiet((x) => eng.load(x))(bytes);
      const drawn = new Set();
      for (const bt of m.batches) for (let i = 0; i < bt.elems.ids.length; i++) if (bt.elems.vn[i] > 0) drawn.add(bt.elems.ids[i]);
      const eq2 = E.readEquipment(b2.w());
      ok(eq2.every((e) => drawn.has(e.id)), 'cc-ifc draws every piece', eq2.filter((e) => !drawn.has(e.id)).map((e) => e.kind).join());
    }
  }

  // ============================================================================================ 3. connected runs + the check
  if (want('connect')) for (const schema of ['IFC4', 'IFC2X3']) {
    console.log('== connected runs and the Connections check (' + schema + ')');
    const E = await import(path.join(APP, 'mep/equipment.js'));
    const C = await import(path.join(APP, 'mep/connections.js'));
    const b = await building(schema);
    const lvl = b.levels[0];
    const pr = b.ed.modelChange(E.placeEquipment({ storey: lvl.guid, kind: 'pump', values: { size: '2', system: 'chw' }, x: 0, y: 0, rot: 0, tag: 'P-1' }), { label: 'pump' });
    const pumpG = [...pr.made.keys()][0];
    const pump = () => E.readEquipment(b.w()).find((e) => e.guid === pumpG);
    const out = E.portsAt(pump()).find((p) => p.name === 'out');
    const start = out.at;
    const rr = b.ed.modelChange(M.placeRun({ storey: lvl.guid, kind: 'pipe', system: 'chw', mat: 'steel', cls: '40', size: '2', points: [start, [start[0] + 3000, start[1], start[2]], [start[0] + 3000, start[1] + 2000, start[2]]], ends: [{ eq: pumpG, port: 'out' }, null] }), { label: 'run' });
    const runG = [...rr.made.keys()][0];
    const portsNow = () => P.readPorts(b.w());
    const pumpOut = () => { const e = pump(); return portsNow().find((p) => p.owner === e.id && p.portName === 'out'); };
    let po = pumpOut();
    const runOf = () => M.readRuns(b.w()).find((r) => r.guid === runG);
    ok(po.connectedTo && portsNow().find((p) => p.id === po.connectedTo)?.run === runG, 'a run drawn from the pump\'s outlet is connected to it (IfcRelConnectsPorts)');
    ok(runOf().ends[0]?.eq === pumpG && runOf().ends[0].port === 'out' && runOf().ends[1] === null, 'its start is fixed to that port (CadCraft_MepRun.Ends)');
    // the pump moves: the run's start follows and stays connected
    b.ed.modelChange(E.changeEquipment(pumpG, { y: 600 }), { label: 'move pump' });
    po = pumpOut();
    const r1 = runOf();
    ok(near(r1.points[0][1], start[1] + 600, 0.01) && near(r1.points[1][1], start[1], 0.01), 'the pump moved 600 north: the run\'s first point went with it, its second stayed', JSON.stringify(r1.points.slice(0, 2)));
    ok(po.connectedTo && portsNow().find((p) => p.id === po.connectedTo)?.run === runG && P.readPorts(b.w()).filter((p) => p.connectedTo && p.role === 'equipment').length === 1, 'still connected, once');
    // the run is edited: its fixed end stays on the port
    b.ed.modelChange(M.changeRun(runG, { points: [[0, 0, 150], [3000, 0, 150], [3000, 4000, 150]] }), { label: 'edit run' });
    const r2 = runOf();
    ok(near(r2.points[0][0], po.at[0], 0.01) && near(r2.points[0][1], po.at[1], 0.01) && near(r2.points[0][2], po.at[2], 0.01) && near(r2.points[2][1], 4000, 0.01), 'the run edited: its fixed start stays on the pump\'s port, the rest moves', JSON.stringify(r2.points));
    ok(pumpOut().connectedTo, '…and stays connected');
    b.ed.undo(); b.ed.undo();
    ok(near(runOf().points[0][1], start[1], 0.01) && pumpOut().connectedTo, 'two undos: back at the start, connected');
    b.ed.redo(); b.ed.redo();
    // the check: the pump's inlet is open, the run ends open; nothing else
    let chk = C.checkConnections(b.w());
    const codes = (c) => c.issues.map((i) => i.code).sort().join(',');
    ok(codes(chk) === 'open-end,open-port' && chk.counts.error === 0, 'Connections: the pump\'s inlet open, the run\'s far end open; no errors', codes(chk));
    ok(chk.issues.find((i) => i.code === 'open-port').fill.port === 'in' && chk.issues.find((i) => i.code === 'open-port').ids[0] === pump().id, 'the open port is the pump\'s inlet, with the pump to select');
    // a run of another size on the pump's inlet: size error; a lone run: no source
    const pin = E.portsAt(pump()).find((p) => p.name === 'in');
    b.ed.modelChange(M.placeRun({ storey: lvl.guid, kind: 'pipe', system: 'chw', mat: 'steel', cls: '40', size: '3', points: [[pin.at[0] - 2000, pin.at[1], pin.at[2]], pin.at], ends: [null, { eq: pumpG, port: 'in' }] }), { label: 'suction' });
    b.ed.modelChange(M.placeRun({ storey: lvl.guid, kind: 'pipe', system: 'hhw', mat: 'steel', cls: '40', size: '1', points: [[0, 8000, 2700], [4000, 8000, 2700]] }), { label: 'lone' });
    chk = C.checkConnections(b.w());
    ok(chk.issues.some((i) => i.code === 'size' && /3/.test(i.fill.a + i.fill.b) && /2/.test(i.fill.a + i.fill.b)), 'an NPS 3 run on the NPS 2 inlet: a size error', codes(chk));
    ok(chk.issues.filter((i) => i.code === 'no-source').length === 1 && chk.issues.find((i) => i.code === 'no-source').fill.system === 'hhw', 'the lone heating run has no source; the suction run (joined to the pump) has one');
    // a duct of the wrong system on a diffuser; a sanitary drain alone is not asked for a source
    const dr = b.ed.modelChange(E.placeEquipment({ storey: lvl.guid, kind: 'diffuser', values: { neck: 250 }, x: 6000, y: 6000, z: 2600 }), { label: 'diffuser' });
    const difG = [...dr.made.keys()][0];
    const neck = E.portsAt(E.readEquipment(b.w()).find((e) => e.guid === difG)).find((p) => p.name === 'neck');
    b.ed.modelChange(M.placeRun({ storey: lvl.guid, kind: 'duct', system: 'return', shape: 'round', w: 250, h: 250, points: [[neck.at[0] - 3000, neck.at[1], neck.at[2] + 700], [neck.at[0], neck.at[1], neck.at[2] + 700], neck.at], ends: [null, { eq: difG, port: 'neck' }] }), { label: 'duct' });
    b.ed.modelChange(M.placeRun({ storey: lvl.guid, kind: 'pipe', system: 'san', mat: 'pvc', cls: '40', size: '3', points: [[0, 12000, 600], [3000, 12000, 600]] }), { label: 'drain' });
    chk = C.checkConnections(b.w());
    ok(chk.issues.some((i) => i.code === 'system' && i.fill.a !== i.fill.b && [i.fill.a, i.fill.b].includes('return') && [i.fill.a, i.fill.b].includes('supply')), 'a return duct on a supply diffuser: a system error', codes(chk));
    ok(!chk.issues.some((i) => i.code === 'no-source' && i.fill.system === 'san'), 'a sanitary drain is not asked for a source');
    // the pump goes: the runs fixed to it say so
    b.ed.modelChange(E.removeEquipment([pumpG]), { label: 'remove pump' });
    chk = C.checkConnections(b.w());
    ok(chk.issues.filter((i) => i.code === 'fixed-gone').length === 2, 'the pump removed: both runs fixed to it are listed (fixed-gone)', codes(chk));
    const bytes = b.ed.save();
    ok(!danglingRefs(dec(bytes)).length, 'saved: no reference to a missing line');
    saved['connect-' + schema] = bytes;
  }

  // ============================================================================================ 4. MEP against the structure
  if (want('structure')) {
    console.log('== MEP against the structure (mep/structure.js): sets, soft clearances, openings, CSV, BCF');
    const ST = await import(path.join(APP, 'mep/structure.js'));
    const MW = await import(path.join(APP, 'model-walls.js'));
    const B = await import(path.join(APP, 'bcf.js'));
    const { elementsOf, clashes } = await import(path.join(APP, 'clash.js'));
    const b = await building('IFC4');
    const [L1, L2] = b.levels.map((l) => l.guid);
    const P4 = [[0, 0], [6000, 0], [6000, 4000], [0, 4000]];
    b.ed.modelChange(OPS.drawWalls({ storey: L1, segs: P4.map((p, i) => ({ a: p, b: P4[(i + 1) % 4] })), typeKey: 'ext-2x6', topLevel: L2 }), { label: 'walls' });
    b.ed.modelChange(OPS.placeFloor({ storey: L1, seed: [2000, 2000], mode: 'room', kind: 'concrete' }), { label: 'floor' });
    const th = MW.typeThickness(MW.wallType('ext-2x6'));
    // a pipe through the south wall (insulated 25), a duct along the north wall 30 mm off its face, a riser through the floor
    b.ed.modelChange(M.placeRun({ storey: L1, kind: 'pipe', system: 'chw', mat: 'steel', cls: '40', size: '2', points: [[3000, -1500, 2400], [3000, 1500, 2400]], insulation: 25 }), { label: 'through' });
    const yDuct = 4000 - th / 2 - 30 - 200;
    b.ed.modelChange(M.placeRun({ storey: L1, kind: 'duct', system: 'supply', shape: 'rect', w: 400, h: 300, points: [[1000, yDuct, 2500], [5000, yDuct, 2500]] }), { label: 'near' });
    b.ed.modelChange(M.placeRun({ storey: L1, kind: 'pipe', system: 'cw', mat: 'copper', cls: 'L', size: '1', points: [[1500, 2000, -900], [1500, 2000, 900]] }), { label: 'riser' });
    ok(M.readRuns(b.w()).find((r) => r.size === '2')?.insulation === 25, 'a run keeps its insulation (CadCraft_MepRun.Insulation)');
    const bytes = b.ed.save();
    // the model as the viewer has it
    const eng = await quiet(IfcModel.create)(WebIFC, null), m = await quiet((x) => eng.load(x))(bytes);
    const ed2 = new IfcEditor(WebIFC, eng);
    const w2 = new ModelWriter(WebIFC, ed2.api, ed2.mid);
    const sets = Object.fromEntries(['mep', 'walls', 'slabs', 'beams', 'columns', 'structure'].map((k) => [k, ST.setKeys(m.classOf, k)]));
    ok(sets.walls.length === 4 && sets.slabs.length >= 1 && sets.mep.length >= 3 && sets.structure.length === sets.walls.length + sets.slabs.length, 'the sets: 4 walls, the floor slab, every pipe and duct part; structure = walls + slabs here', JSON.stringify(Object.fromEntries(Object.entries(sets).map(([k, v]) => [k, v.length]))));
    // ready to run on clash.js: the pipe through the wall is a hard clash with it
    const all = (keys) => elementsOf(m.batches, keys);
    const hard = clashes(all(sets.mep), all(sets.structure), { tolerance: 0.001 });
    const runs = M.readRuns(w2), pipe = runs.find((r) => r.size === '2'), duct = runs.find((r) => r.kind === 'duct'), riser = runs.find((r) => r.size === '1');
    ok(hard.some((c) => pipe.parts.includes(c.a) && sets.walls.includes(c.b)) && !hard.some((c) => duct.parts.includes(c.a)), 'clash.js on the ready-made sets: the pipe hits the south wall; the duct hits nothing', JSON.stringify(hard.map((c) => [c.a, c.b])));
    // the frame: storey plan mm → the viewer's metres
    const C = eng.api.GetCoordinationMatrix(m.modelID);
    const ap = (Mx, v) => [Mx[0] * v[0] + Mx[4] * v[1] + Mx[8] * v[2] + Mx[12], Mx[1] * v[0] + Mx[5] * v[1] + Mx[9] * v[2] + Mx[13], Mx[2] * v[0] + Mx[6] * v[1] + Mx[10] * v[2] + Mx[14]];
    const toViewer = (st, p) => { const q = ap(w2.storeyWorld(st), p).map((x) => x / 1000); return ap(C, [q[0], q[2], -q[1]]); };
    const st = all(sets.structure);
    for (const e of st) e.cls = m.classOf.get(e.key);
    const rows = ST.openings({ runs, structure: st, toViewer, keyOf: (id) => id, gapMm: 25 });
    const wallRow = rows.find((r) => r.run === pipe.guid), slabRow = rows.find((r) => r.run === riser.guid);
    ok(rows.length === 2 && wallRow && slabRow, 'openings: the pipe through the wall and the riser through the floor; the duct beside the wall needs none', JSON.stringify(rows.map((r) => [r.cls, r.sizeLabel])));
    ok(wallRow && wallRow.cls === 'IfcWall' && near(wallRow.w, 60.325 + 2 * 25 + 2 * 25, 0.01) && wallRow.shape === 'round', 'the wall opening: Ø 160.3 = OD 60.3 + 2 × 25 insulation + 2 × 25 gap', JSON.stringify(wallRow && [wallRow.w, wallRow.shape]));
    ok(wallRow && near(wallRow.at[0], 3000, 0.5) && near(wallRow.at[1], 0, 0.5) && near(wallRow.at[2], 2400, 0.5) && near(wallRow.through, th, 0.5), 'at x 3000, y 0 (the wall\'s centre line), z 2400; ' + th.toFixed(1) + ' mm through (the wall\'s thickness)', JSON.stringify(wallRow && [wallRow.at, wallRow.through]));
    ok(slabRow && slabRow.cls === 'IfcSlab' && near(slabRow.at[0], 1500, 0.5) && near(slabRow.w, 28.575 + 50, 0.01), 'the floor opening: at x 1500, Ø 78.6 (copper 1" OD 28.6 + 2 × 25)', JSON.stringify(slabRow && [slabRow.at, slabRow.w]));
    // soft: insulation + gap
    const ins = new Map(); for (const r of runs) for (const id of r.parts) ins.set(id, r.insulation || 0);
    const through = new Set(rows.map((o) => o.part + ':' + o.element));
    let soft = ST.clearances({ mep: all(sets.mep), structure: all(sets.structure), gapMm: 50, insulationOf: (k) => ins.get(k) || 0, skip: (a, c) => through.has(a + ':' + c) });
    const north = soft.find((c) => duct.parts.includes(c.a));
    ok(north && near(north.gap * 1000, 30, 0.6) && near(north.need * 1000, 50, 1e-6), 'soft: the duct is 30 mm off the north wall, under the 50 mm asked', JSON.stringify(soft.map((c) => [c.a, c.b, Math.round(c.gap * 1000)])));
    ok(!soft.some((c) => pipe.parts.includes(c.a) && sets.walls.includes(c.b) && through.has(c.a + ':' + c.b)), 'the pipe through the wall is an opening, not a clearance');
    soft = ST.clearances({ mep: all(sets.mep), structure: all(sets.structure), gapMm: 20, insulationOf: (k) => ins.get(k) || 0, skip: (a, c) => through.has(a + ':' + c) });
    ok(!soft.some((c) => duct.parts.includes(c.a)), 'with a 20 mm gap the duct is clear');
    // CSV and BCF
    const csv = ST.openingsCsv(rows.map((r, i) => ({ ...r, n: i + 1 })), ['N', 'Size', 'X'], (r) => [r.n, r.sizeLabel, '=1+1']);
    ok(csv.split('\r\n').length === 4 && csv.includes("'=1+1"), 'CSV: a head and one line per opening; a cell starting "=" is text');
    const guidOf = (k) => ed2.api.GetLine(ed2.mid, k, false)?.GlobalId?.value || null;
    let gid = 0;
    const topics = ST.openingTopics(rows.map((r, i) => ({ ...r, n: i + 1 })), { title: (r) => 'Opening ' + r.n, description: (r) => 'Ø' + Math.round(r.w), author: 'test', now: '2026-10-23T12:00:00Z', guidOf, worldOf: (r) => ap(w2.storeyWorld(r.storey), r.at).map((x) => x / 1000), newGuid: () => '00000000-0000-4000-8000-' + String(++gid).padStart(12, '0') });
    const bcf = await B.writeBcf({ topics, file: { name: 'm.ifc' } });
    const back = await B.readBcf(bcf);
    ok(back.topics.length === 2 && back.topics.every((x) => x.viewpoints[0].selection.length === 2), 'BCF: two topics, each selecting the run\'s part and the wall or slab (GlobalIds)');
    const py = path.join(ROOT, 'tools/markupcraft-test/venv/bin/python'), checker = path.join(ROOT, 'tools/markupcraft-test/bcf_check.py');
    if (fs.existsSync(py) && fs.existsSync(checker)) {
      const f = path.join(tmp, 'openings.bcf'); fs.writeFileSync(f, bcf);
      let res; try { res = JSON.parse(execFileSync(py, [checker, f], { encoding: 'utf8' })); } catch (e) { res = JSON.parse(e.stdout || '{}'); }
      ok(res.ok && res.topics === 2, 'BCF valid against the buildingSMART 2.1 schemas', (res.errors || []).slice(0, 3).join(' | '));
    }
    // IFC2X3: the steel fixture's beams and columns are in their sets
    const x3 = await quiet(IfcModel.create)(WebIFC, null), mx = await quiet((x) => x3.load(x))(fs.readFileSync(path.join(ROOT, 'tools/detailcraft-test/fixtures/ios-steel-ifc2x3.ifc')));
    const xb = ST.setKeys(mx.classOf, 'beams'), xc = ST.setKeys(mx.classOf, 'columns');
    ok(xb.length > 0 && xc.length > 0, 'IFC2X3 steel fixture: ' + xb.length + ' beams and ' + xc.length + ' columns in their sets');
  }

  // ============================================================================================ 5. spools and spool sheets
  if (want('spools')) for (const schema of ['IFC4', 'IFC2X3']) {
    console.log('== spools and spool sheets (mep/spools.js, mep/spool-sheet.js) in ' + schema);
    const SP = await import(path.join(APP, 'mep/spools.js'));
    const SS = await import(path.join(APP, 'mep/spool-sheet.js'));
    const b = await building(schema);
    const L1 = b.levels[0].guid;
    // NPS 4 steel chilled water: 15 m east, 8 m north, a gate valve at 2 m; spools of at most 6 m, a field weld at 4 m
    const rr = b.ed.modelChange(M.placeRun({ storey: L1, kind: 'pipe', system: 'chw', mat: 'steel', cls: '40', size: '4', points: [[0, 0, 2700], [15000, 0, 2700], [15000, 8000, 2700]], valves: [{ s: 2000, kind: 'gate' }] }), { label: 'main' });
    const g = [...rr.made.keys()][0];
    const run = () => M.readRuns(b.w()).find((r) => r.guid === g);
    const n0 = run().parts.length;
    b.ed.modelChange(M.changeRun(g, { spoolMax: 6000, fieldWelds: [4000], line: '12' }), { label: 'spool it' });
    const r = run();
    const sps = SP.readSpools(b.w(), [r]);
    ok(r.spoolMax === 6000 && r.line === '12' && r.fieldWelds[0] === 4000, 'the run keeps its spool rules (CadCraft_MepRun SpoolMaxMm, FieldWelds, Line)');
    ok(sps.length >= 5 && sps.every((s, i) => s.id === 'CHW-12-S' + String(i + 1).padStart(2, '0')) && r.parts.every((id) => b.w().readPset(id, 'CadCraft_Spool')?.SpoolId), sps.length + ' spools, numbered CHW-12-S01 …, every part carries its CadCraft_Spool', JSON.stringify(sps.map((s) => s.id)));
    ok(r.parts.length > n0, 'the straight pipe was cut at the welds (' + n0 + ' → ' + r.parts.length + ' parts)');
    const sheets = SP.sheetsFor(b.w());
    ok(sheets.length === sps.length && sheets.every((s) => s.length <= 6000 + 0.5), 'every spool is at most 6 m (centre line)', JSON.stringify(sheets.map((s) => Math.round(s.length))));
    ok(near(sps[0].s1, 4000, 0.5) && near(sps[1].s0, 4000, 0.5), 'the field weld at 4 m ends S01 and starts S02', JSON.stringify(sps.slice(0, 2).map((s) => [s.s0, s.s1])));
    const total = sheets.reduce((s, x) => s + x.cuts.reduce((a, c) => a + c.length, 0), 0);
    const straight = r.parts.reduce((s, id) => s + (Number(b.w().readPset(id, 'CadCraft_Pipe')?.Length) || 0) * b.w().unitMm, 0);
    ok(near(total, straight, 0.5), 'cut lengths add up to the run\'s straight pipe (' + Math.round(total) + ' mm)');
    const s1 = sheets[0];
    ok(s1.fittings.some((f) => f.kind === 'valve' && f.valve === 'gate') && s1.welds.filter((x) => x.kind === 'shop').length === 2 && s1.welds.filter((x) => x.kind === 'field').length === 1, 'S01: segment, gate valve, segment → 2 shop welds and 1 field weld (to S02)', JSON.stringify(s1.welds.map((x) => x.n + ':' + x.kind)));
    const elbowSheet = sheets.find((s) => s.fittings.some((f) => f.kind === 'bend'));
    ok(elbowSheet && elbowSheet.fittings.find((f) => f.kind === 'bend').angle === 90 && !elbowSheet.fittings.find((f) => f.kind === 'bend').generic, 'the elbow is in one spool: 90° long radius (ASME B16.9 radius), not marked generic');
    const kg = s1.bom.find((x) => x.item === 'pipe').kg, len1 = s1.cuts.reduce((a, c) => a + c.length, 0);
    ok(near(kg, 0.0246615 * (114.3 - 6.0198) * 6.0198 * len1 / 1000, 0.01), 'BOM: NPS 4 Sch 40 at 16.07 kg/m (ASME B36.10M plain-end weight)', String(kg));
    // the person moves the field weld into the valve: it goes to the nearer joint
    b.ed.modelChange(M.changeRun(g, { fieldWelds: [2010] }), { label: 'weld in valve' });
    const moved = SP.readSpools(b.w(), [run()]);
    ok(moved.length >= 3 && moved.some((s) => Math.abs(s.s1 - 2000 - 0) < 400 && s.index === 1), 'a field weld put inside the valve moves to its nearer joint', JSON.stringify(moved.slice(0, 2).map((s) => [Math.round(s.s0), Math.round(s.s1)])));
    b.ed.undo();
    ok(SP.readSpools(b.w(), [run()]).length === sps.length, 'undo: the spools as they were');
    // copper is not spooled
    const cr = b.ed.modelChange(M.placeRun({ storey: L1, kind: 'pipe', system: 'cw', mat: 'copper', cls: 'L', size: '1', points: [[0, 5000, 2400], [9000, 5000, 2400]], spoolMax: 3000 }), { label: 'copper' });
    const cg = [...cr.made.keys()][0];
    ok(!SP.spooled(M.readRuns(b.w()).find((x) => x.guid === cg)) && M.readRuns(b.w()).find((x) => x.guid === cg).parts.every((id) => !b.w().readPset(id, 'CadCraft_Spool')), 'a copper run is never spooled (its joints are not butt welds)');
    // the sheets
    const { t: tr } = await import(path.join(APP, 'i18n.js'));
    const pdf = SS.spoolPdf(SP.sheetsFor(b.w()), { paper: 'letter', words: tr });
    const txt = dec(pdf.bytes);
    ok(txt.startsWith('%PDF-1.4') && (txt.match(/\/Type \/Page /g) || []).length === sps.length && pdf.missing === 0 && /%%EOF\s*$/.test(txt), 'PDF: one page per spool, nothing outside its font', (txt.match(/\/Type \/Page /g) || []).length + ' pages');
    const pdfFile = path.join(tmp, 'spools-' + schema + '.pdf'); fs.writeFileSync(pdfFile, pdf.bytes);
    if (process.env.MEP07_OUT) fs.copyFileSync(pdfFile, path.join(process.env.MEP07_OUT, path.basename(pdfFile)));   // to look at it
    try { const out = execFileSync('pdftotext', [pdfFile, '-'], { encoding: 'utf8' }); ok(/CHW-12-S01/.test(out) && /CHW-12-S0\d/.test(out), 'pdftotext reads the spool ids', out.slice(0, 300)); } catch (e) { console.log('  --   pdftotext not here: skipped'); }
    const rows = SS.spoolCsvRows(SP.sheetsFor(b.w()));
    const csv = SP.csvOf(rows);
    ok(rows.length > sps.length * 3 && csv.includes('CHW-12-S01') && rows.every((x) => x.length === rows[0].length), 'CSV: a block per spool (cuts, fittings, welds, BOM), one width');
    // ducts: a cut list by length
    b.ed.modelChange(M.placeRun({ storey: L1, kind: 'duct', system: 'supply', shape: 'rect', w: 400, h: 300, points: [[0, 12000, 2900], [7000, 12000, 2900]] }), { label: 'duct' });
    const cut = SP.ductCutListOf(b.w(), 1500);
    ok(cut.length === 2 && cut.find((x) => x.length === 1500)?.qty === 4 && cut.find((x) => x.length === 1000)?.qty === 1, 'duct cut list: 7 m of 400 × 300 = 4 pieces of 1500 and one of 1000', JSON.stringify(cut));
    const bytes = b.ed.save();
    ok(!danglingRefs(dec(bytes)).length, 'saved: no reference to a missing line');
    saved['spools-' + schema] = bytes;
    const b2 = await reopen(bytes);
    ok(SP.readSpools(b2.w(), M.readRuns(b2.w())).length === sps.length, 'reopened: the spools read back from CadCraft_Spool');
  }

  // ============================================================================================ IfcOpenShell reads them
  if (PY && Object.keys(saved).length) {
    console.log('== IfcOpenShell reads the equipment');
    const files = Object.entries(saved).map(([k, bytes]) => { const f = path.join(tmp, k + '.ifc'); fs.writeFileSync(f, bytes); return [k, f]; });
    for (const [k, f] of files) {
      const v = validate(f);
      ok(v && v.errors === 0, k + ': schema clean (' + v?.schema + ')', JSON.stringify(v?.first));
    }
    let out = '';
    try { out = execFileSync(PY, ['-I', path.join(ROOT, 'tools/bimcraft-test/mep07_check.py'), ...files.map((x) => x[1])], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }); } catch (e) { out = String(e.stdout || '') + String(e.stderr || ''); }
    const res = Object.fromEntries(out.trim().split('\n').filter((l) => l.startsWith('{')).map((l) => JSON.parse(l)).map((r) => [path.basename(r.file, '.ifc'), r]));
    const e4 = res['equip-IFC4'], e3 = res['equip-IFC2X3'];
    if (e4) {
      const list = Object.values(e4.equipment);
      ok(list.length === 9 && list.every((x) => x.ports.length >= 1 && x.box && !x.box.error), 'IFC4: 9 pieces, each with its ports (util.system.get_ports) and drawn by IfcOpenShell', JSON.stringify(list.map((x) => [x.class, x.ports.length, x.box?.error])));
      const pump = list.find((x) => x.class === 'IfcPump');
      ok(pump && pump.predefined === 'CIRCULATOR' && pump.type_class === 'IfcPumpType' && pump.ports.some((p) => p.flow === 'SINK') && pump.ports.some((p) => p.flow === 'SOURCE'), 'IfcPump CIRCULATOR with its IfcPumpType; SINK and SOURCE ports', JSON.stringify(pump));
      const dif = list.find((x) => x.class === 'IfcAirTerminal' && x.predefined === 'DIFFUSER');
      ok(dif && near(dif.ports[0].world[2], 2700 + 175, 0.5) && near(dif.ports[0].facing[2], 1, 1e-6) && near(dif.box.min[2], 2700, 0.5), 'the diffuser: face at 2700, its neck port 175 above, facing up', JSON.stringify(dif && { p: dif.ports[0], b: dif.box }));
      const heat = list.find((x) => x.object_type === 'Water heater');
      ok(heat && heat.class === 'IfcBoiler' && heat.systems.length === 4, 'the water heater: IfcBoiler "Water heater" in cold, hot, gas and exhaust systems', JSON.stringify(heat && heat.systems));
    } else if (saved['equip-IFC4']) ok(false, 'mep07_check.py read the IFC4 file', out.slice(0, 300));
    if (e3) {
      const list = Object.values(e3.equipment);
      ok(e3.schema === 'IFC2X3' && list.length === 9 && list.every((x) => x.ports.length >= 1) && list.some((x) => x.class === 'IfcFlowMovingDevice' && x.type_class === 'IfcPumpType'), 'IFC2X3: 9 pieces with ports (IfcRelConnectsPortToElement), a pump = IfcFlowMovingDevice + IfcPumpType', JSON.stringify(list.map((x) => [x.class, x.type_class])));
    } else if (saved['equip-IFC2X3']) ok(false, 'mep07_check.py read the IFC2X3 file', out.slice(0, 300));
    for (const k of ['connect-IFC4', 'connect-IFC2X3']) {
      const c = res[k];
      if (!saved[k]) continue;
      const dif = c && Object.values(c.equipment).find((x) => x.class === 'IfcAirTerminal' || x.class === 'IfcFlowTerminal');
      ok(dif && /Duct(Fitting|Segment)|FlowFitting|FlowSegment/.test(dif.ports[0]?.connected_class || ''), k + ': IfcOpenShell sees the diffuser\'s neck connected to the duct run\'s end part', JSON.stringify(dif?.ports));
    }
  } else if (!PY) console.log('  --   no venv with ifcopenshell: IfcOpenShell checks skipped');

  fs.rmSync(tmp, { recursive: true, force: true });
  console.log(`\n${good} passed, ${bad} failed`);
  return bad ? 1 : 0;
}
