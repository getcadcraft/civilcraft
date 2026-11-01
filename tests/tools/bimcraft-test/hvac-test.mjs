/* SPDX-License-Identifier: Apache-2.0 */
/**
 * `node bin/test-bimcraft.mjs --hvac` (0.8 SU.888, session `sx-mep`): the split / VRF / fan-coil equipment pack (mep/hvac.js),
 * ACR tube (mep/tables-acr.js + mep/pipes.js), the line set table, refnets, line sets placed as one undo step, the
 * Connections check over them, and the files they make (IFC4 + IFC2X3; IfcOpenShell reads the classes back when its venv
 * exists). `--only data|ifc` runs one section. Temp files go to a mkdtemp folder that is removed at the end.
 */
import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';
import { execFileSync } from 'node:child_process';

export async function hvacMode({ APP, ROOT, WebIFC, IfcModel, quiet, args = [] }) {
  let bad = 0, good = 0;
  const ok = (cond, label, detail = '') => { if (cond) good++; else bad++; console.log((cond ? '  ok   ' : '  FAIL ') + label + (!cond && detail ? ' (' + detail + ')' : '')); };
  const near = (a, b, e = 0.01) => Math.abs(a - b) <= e;
  const only = args.includes('--only') ? args[args.indexOf('--only') + 1] : null;
  const want = (k) => !only || only === k;
  const H = await import(path.join(APP, 'mep/hvac.js'));
  const E = await import(path.join(APP, 'mep/equipment.js'));
  const PI = await import(path.join(APP, 'mep/pipes.js'));
  const AC = await import(path.join(APP, 'mep/tables-acr.js'));
  const M = await import(path.join(APP, 'mep-model.js'));
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'hvac-'));
  const PY = [path.join(ROOT, 'tools/detailcraft-test/venv/bin/python'), path.join(ROOT, 'tools/bimcraft-test/venv/bin/python')].find((p) => fs.existsSync(p));
  const py = (script, file) => { if (!PY) return null; let out = ''; try { out = execFileSync(PY, ['-I', path.join(ROOT, 'tools/bimcraft-test', script), file], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }); } catch (e) { out = String(e.stdout || ''); } try { return JSON.parse(out.trim().split('\n').pop()); } catch (e) { return { error: out.slice(0, 300) }; } };

  // ============================================================================================ 1. data (no IFC)
  if (want('data')) {
    console.log('== the pack, the tube and the table (DOM-free)');
    const kinds = ['split-wall', 'split-cassette', 'split-ducted', 'split-outdoor', 'vrf-outdoor', 'refnet', 'fancoil'];
    ok(kinds.every((k) => E.EQUIPMENT[k] && E.EQUIPMENT_KINDS.includes(k)) && H.registerHvac().length === 7 && E.EQUIPMENT_KINDS.filter((k) => k === 'refnet').length === 1, 'seven kinds join the MEP equipment table once (registering again adds nothing)');
    const LI = await import(path.join(APP, 'libitem.js'));
    for (const k of kinds) {
      const item = E.equipmentItem(k, {}, { name: k });
      const v = LI.validateItem(item, { partial: true });
      // the LibraryCraft item format (libitem.js PORT_SYSTEMS, LibraryItemFormat.php) has no refrigerant or condensate system yet:
      // those three port systems are the only complaint (asked of the owner in the sx-mep log; placing never validates the item)
      const rest = (v.errors || []).filter((e) => !(/^ports\[\d+\]\.system/.test(e) && item.ports[Number(/\[(\d+)\]/.exec(e)[1])] && ['refl', 'refg', 'cond'].includes(item.ports[Number(/\[(\d+)\]/.exec(e)[1])].system)));
      ok(!rest.length, k + ': a LibraryCraft item, valid but for the refrigerant / condensate port systems (' + item.ifc.class + ' ' + item.ifc.predefined + ')', JSON.stringify(rest).slice(0, 200));
    }
    const names = (k, v = {}) => E.buildEquipment(k, v).built.ports.map((p) => p.name).join(',');
    ok(names('split-wall') === 'ref-liquid,ref-gas,drain' && names('split-cassette') === 'ref-liquid,ref-gas,drain', 'wall and cassette units: liquid, gas, condensate');
    ok(names('split-ducted') === 'supply,return,ref-liquid,ref-gas,drain', 'ducted unit: supply and return ducts, liquid, gas, condensate');
    ok(names('split-outdoor') === 'ref-liquid,ref-gas' && names('vrf-outdoor') === 'ref-liquid,ref-gas', 'outdoor units (single split, VRF): liquid and gas');
    ok(names('refnet') === 'inlet,branch-a,branch-b', 'refnet: inlet and two branches');
    ok(names('fancoil') === 'supply,return,coil-in,coil-out,drain' && names('fancoil', { pipes: '4-pipe' }) === 'supply,return,coil-in,coil-out,heat-in,heat-out,drain', 'fan coil: 2-pipe 5 ports, 4-pipe 7 (heating in and out)');
    const sysOf = (k, v = {}) => Object.fromEntries(E.buildEquipment(k, v).built.ports.map((p) => [p.name, p.system + '/' + p.direction]));
    const sw = sysOf('split-wall');
    ok(sw['ref-liquid'] === 'refl/both' && sw['ref-gas'] === 'refg/both' && sw.drain === 'cond/out', 'systems: liquid refl, gas refg (both ways: a heat pump), condensate cond out', JSON.stringify(sw));
    const fc = sysOf('fancoil', { pipes: '4-pipe' });
    ok(fc['coil-in'] === 'chw/in' && fc['coil-out'] === 'chw/out' && fc['heat-in'] === 'hhw/in' && fc.supply === 'supply/out' && fc.return === 'return/in', 'fan coil 4-pipe: chilled water, heating water, supply out, return in', JSON.stringify(fc));
    // IFC classes
    const cls = (k) => E.EQUIPMENT[k].cls.join(' ');
    ok(['split-wall', 'split-cassette', 'split-ducted', 'split-outdoor', 'vrf-outdoor'].every((k) => cls(k) === 'IFCUNITARYEQUIPMENT IFCUNITARYEQUIPMENTTYPE SPLITSYSTEM IFCENERGYCONVERSIONDEVICE IFCUNITARYEQUIPMENTTYPE SPLITSYSTEM'), 'split and VRF units: IfcUnitaryEquipment SPLITSYSTEM (IFC2X3 IfcEnergyConversionDevice + type)');
    ok(cls('refnet') === 'IFCPIPEFITTING IFCPIPEFITTINGTYPE JUNCTION IFCFLOWFITTING IFCPIPEFITTINGTYPE JUNCTION' && cls('fancoil').startsWith('IFCUNITARYEQUIPMENT IFCUNITARYEQUIPMENTTYPE AIRHANDLER'), 'refnet IfcPipeFitting JUNCTION; fan coil IfcUnitaryEquipment AIRHANDLER');
    // ACR tube
    const p38 = AC.acrPipeSize('coil', '3/8');
    ok(p38 && near(p38.od, 0.375, 1e-9) && near(p38.wall, 0.032, 1e-9) && p38.label === 'Ø9.52' && p38.ref === '3/8', 'ACR 3/8 coil: OD 0.375 in, wall 0.032 in, Ø9.52', JSON.stringify(p38));
    ok(AC.acrPipeSize('drawn', '1/4') === null && AC.acrPipeSize('coil', '2-1/8') === null && near(AC.acrPipeSize('drawn', '2-1/8').wall, 0.07, 1e-9), '1/4 is coil only, 2-1/8 drawn only (wall as type L)');
    const s = PI.sizesFor('acr', 'coil');
    ok(PI.MATERIALS.includes('acr') && s[0] === '1/4' && s.at(-1) === '1-5/8' && PI.DEFAULT_CLASS.acr === 'coil' && PI.pipeSize('acr', 'coil', '5/8').metric === true && PI.drainSlope(PI.pipeSize('acr', 'coil', '5/8')) === null, 'pipes.js knows acr: sizes smallest first, default coil, never a drain', s.join(' '));
    ok(PI.pipeSize('copper', 'L', '1/2').od === 0.625 && PI.sizesFor('steel', '40')[0] === '1/8' && PI.MATERIALS.slice(0, 6).join() === 'steel,copper,pvc,pex,pvc-sold,pvc-esg', 'the other tables are unchanged');
    const d = M.runDefaults('pipe', 'refg', '5/8');
    ok(d.mat === 'acr' && d.cls === 'coil' && d.size === '5/8' && d.slope === 0 && M.runDefaults('pipe', 'cond').mat === 'pvc' && M.runDefaults('pipe', 'cond').slope > 0, 'a refrigerant run defaults to ACR (size kept), a condensate run to PVC with a drain slope', JSON.stringify(d));
    ok(M.PIPE_SYSTEMS.refl.ifc === 'REFRIGERATION' && M.PIPE_SYSTEMS.refg.ifc === 'REFRIGERATION' && M.PIPE_SYSTEMS.cond.ifc === 'DRAINAGE', 'systems: refrigerant lines REFRIGERATION, condensate DRAINAGE (IFC4 IfcDistributionSystemEnum)');
    const sec = M.sectionOf({ kind: 'pipe', mat: 'acr', cls: 'coil', size: '3/8' });
    ok(sec && near(sec.od, 9.525, 0.001) && sec.label === 'Ø9.52', 'a 3/8 ACR run is 9.525 mm across, labelled Ø9.52', JSON.stringify(sec?.label));
    // the table
    const ls = (kw) => { const r = H.lineSetFor(kw); return r.liquid + ' ' + r.gas; };
    ok(ls(2.5) === '1/4 3/8' && ls(3.5) === '1/4 1/2' && ls(5.6) === '1/4 1/2' && ls(7.1) === '3/8 5/8' && ls(22.4) === '3/8 3/4' && ls(28) === '3/8 7/8' && ls(45) === '1/2 1-1/8' && ls(68) === '5/8 1-1/8' && ls(500) === '3/4 1-5/8',
      'line set by capacity: 2.5 kW 1/4 + 3/8 … 28 kW 3/8 + 7/8 … 68 kW 5/8 + 1-1/8; past the table its last row');
    const port = (k, v, n) => E.buildEquipment(k, v).built.ports.find((p) => p.name === n);
    ok(port('split-wall', { capacity: '2.5' }, 'ref-gas').nominal === '3/8' && port('split-wall', { capacity: '7.1' }, 'ref-gas').nominal === '5/8' && near(port('split-wall', { capacity: '7.1' }, 'ref-gas').size, 15.875, 0.001), '"From the table": a 2.5 kW unit\'s gas port is 3/8, a 7.1 kW unit\'s 5/8 (15.875 mm)');
    ok(port('split-wall', { capacity: '2.5', gasline: '12.7' }, 'ref-gas').nominal === '1/2', 'a size typed in wins over the table (Ø12.7 = 1/2)');
    ok(port('refnet', { line: 'gasline', loada: '7.1', loadb: '5.0' }, 'inlet').nominal === '5/8' && port('refnet', { line: 'gasline', loada: '7.1', loadb: '5.0' }, 'branch-b').nominal === '1/2' && port('refnet', { line: 'liquid', loada: '22.4', loadb: '28.0' }, 'inlet').nominal === '5/8',
      'refnet: inlet sized for both branches (12.1 kW gas 5/8), each branch for its own (5 kW 1/2); 50.4 kW liquid inlet 5/8');
    ok(port('vrf-outdoor', { capacity: '45.0' }, 'ref-gas').nominal === '1-1/8' && port('vrf-outdoor', { capacity: '45.0' }, 'ref-liquid').nominal === '1/2', 'VRF outdoor 45 kW: 1/2 + 1-1/8');
    let threw = '';
    try { H.setLineSetTable([{ upTo: 5, liquid: '1/4', gas: '3/8' }, { upTo: 4, liquid: '1/4', gas: '1/2' }]); } catch (e) { threw = e.key; }
    ok(threw === 'sx.su888.table.err.order', 'a table whose capacities don\'t rise is refused', threw);
    ok(H.cleanLineSetTable([{ upTo: 5, liquid: '1/4', gas: '9/16' }]).error === 'sx.su888.table.err.size' && H.cleanLineSetTable([]).error === 'sx.su888.table.err.rows' && H.cleanLineSetTable([{ upTo: -1, liquid: '1/4', gas: '3/8' }]).error === 'sx.su888.table.err.kw', 'unknown tube, no rows, bad capacity: refused');
    H.setLineSetTable([{ upTo: 4, liquid: '1/4', gas: '1/2' }, { upTo: 200, liquid: '3/8', gas: '3/4' }]);
    ok(port('split-wall', { capacity: '2.5' }, 'ref-gas').nominal === '1/2' && ls(10) === '3/8 3/4', 'a person\'s table is used for "From the table"');
    H.setLineSetTable(null);
    ok(ls(2.5) === '1/4 3/8' && H.lineSetTable().length === H.LINESET_DEFAULT.length, 'null puts the typical table back');
    // refusals
    threw = '';
    try { E.buildEquipment('split-cassette', { panel: 600, body: 840 }); } catch (e) { threw = e.key; }
    ok(threw === 'mep.eq.err.fit', 'a cassette body bigger than its panel is refused');
    threw = '';
    try { E.equipmentValues('split-wall', { capacity: '99' }); } catch (e) { threw = e.key; }
    ok(threw === 'mep.eq.err.value', 'a capacity not on the list is refused');
    // routes
    const r = H.routeBetween([0, 0, 100], [1, 0, 0], [3000, 2000, 2400], [0, -1, 0], 0);
    const legsOk = r && r.slice(1).every((q, i) => [0, 1, 2].filter((k) => Math.abs(q[k] - r[i][k]) > 0.5).length === 1);
    ok(r && r[0].join() === '0,0,100' && r.at(-1).join() === '3000,2000,2400' && legsOk && near(r[1][0], 150) && near(r.at(-2)[0], 3000) && near(r.at(-2)[2], 2400) && r.at(-2)[1] <= 1850, 'a route leaves each port straight out 150 mm, legs along X, Y, Z only', JSON.stringify(r));
    const back = H.routeBetween([0, 0, 100], [1, 0, 0], [-2000, 0, 100], [1, 0, 0], 0);
    ok(back && back.slice(2).every((q, i) => { const a = back[i], b2 = back[i + 1]; const d1 = [b2[0] - a[0], b2[1] - a[1], b2[2] - a[2]], d2 = [q[0] - b2[0], q[1] - b2[1], q[2] - b2[2]]; return d1[0] * d2[0] + d1[1] * d2[1] + d1[2] * d2[2] > -1e-6; }), 'a unit behind another: the route goes round, never doubling back', JSON.stringify(back));
    ok(H.roleOf('split-ducted') === 'indoor' && H.roleOf('vrf-outdoor') === 'outdoor' && H.roleOf('refnet') === 'refnet' && H.roleOf('pump') === null, 'roles');
    const fake = (kind, x, y, extra = {}) => ({ id: x + y, guid: kind + x, kind, values: E.equipmentValues(kind, extra), x, y, z: 0, rot: 0 });
    ok(H.planLineSet(fake('split-wall', 0, 0), fake('split-cassette', 2000, 0)).error === 'sx.su888.ls.err.indoor' && H.planLineSet(fake('pump', 0, 0), fake('split-wall', 1, 0)).error === 'sx.su888.ls.err.kind', 'two indoor units, or a pump: no line set (a refnet goes between)');
    const plan = H.planLineSet(fake('split-outdoor', 0, 0, { capacity: '7.1' }), fake('split-wall', 4000, 3000, { capacity: '3.5' }));
    ok(plan.runs?.length === 2 && plan.runs[0].system === 'refl' && plan.runs[0].size === '1/4' && plan.runs[1].size === '1/2' && plan.runs[1].ends[1].port === 'ref-gas', 'outdoor + indoor: a liquid and a gas run sized at the indoor unit (3.5 kW: 1/4 + 1/2)', JSON.stringify(plan).slice(0, 200));
    const pr = H.planLineSet(fake('refnet', 0, 0, { line: 'gasline' }), fake('vrf-outdoor', -3000, 0));
    ok(pr.runs?.length === 1 && pr.runs[0].ends[0].port === 'inlet' && pr.runs[0].system === 'refg', 'refnet + outdoor unit: only the refnet\'s line, into its inlet', JSON.stringify(pr).slice(0, 200));
  }

  // ============================================================================================ 2. in a model
  if (want('ifc')) {
    const { ModelWriter } = await import(path.join(APP, 'model-write.js'));
    const { IfcEditor } = await import(path.join(APP, 'ifc-edit.js'));
    const OPS = await import(path.join(APP, 'model-ops.js'));
    const N = await import(path.join(APP, 'new-model.js'));
    const C = await import(path.join(APP, 'mep/connections.js'));
    const P = await import(path.join(APP, 'mep/ports.js'));
    const editorFor = async (bytes) => {
      const eng = await quiet(IfcModel.create)(WebIFC, null);
      await quiet((b) => eng.load(b))(bytes);
      const ed = new IfcEditor(WebIFC, eng);
      return { ed, levels: OPS.snapshotModel(ed).levels, w: () => new ModelWriter(WebIFC, ed.api, ed.mid) };
    };
    for (const schema of ['IFC4', 'IFC2X3']) {
      console.log('== a VRF system and a fan coil on a new ' + schema + ' model');
      const b = schema === 'IFC2X3' ? await editorFor(fs.readFileSync(path.join(ROOT, 'tools/detailcraft-test/fixtures/ios-steel-ifc2x3.ifc')))
        : await editorFor(new TextEncoder().encode(N.newBuilding({ name: 'HVAC', levels: N.stackLevels(2, 3000, (i) => 'Level ' + (i + 1)), fileName: 'h.ifc', now: new Date('2026-10-27T12:00:00Z') })));
      const L1 = b.levels[0].guid;
      const go = (o, label) => b.ed.modelChange(o, { label });
      const place = (kind, x, y, z, values, tag, rot = 0) => [...go(E.placeEquipment({ storey: L1, kind, values, x, y, z, rot, tag, name: kind }), kind).made.keys()][0];
      const odu = place('vrf-outdoor', 0, -3000, 0, { capacity: '22.4' }, 'ODU-1');
      const rg = place('refnet', 3000, 0, 2700, { line: 'gasline', loada: '14.0', loadb: '7.1' }, 'RN-G1');
      const rl = place('refnet', 3000, 600, 2700, { line: 'liquid', loada: '14.0', loadb: '7.1' }, 'RN-L1');
      const iu1 = place('split-ducted', 7000, -1500, 2500, { capacity: '14.0' }, 'IU-1');
      const iu2 = place('split-wall', 7000, 3000, 2100, { capacity: '7.1' }, 'IU-2', 180);
      const fcu = place('fancoil', 12000, 0, 2600, { pipes: '4-pipe' }, 'FC-1');
      const eqs = () => E.readEquipment(b.w());
      const byG = (g) => eqs().find((e) => e.guid === g);
      ok(eqs().length === 6 && byG(rg)?.kind === 'refnet' && byG(fcu)?.values.pipes === '4-pipe', 'six pieces read back with their kinds and values (a refnet too, though it is a fitting)', eqs().map((e) => e.kind).join(','));
      // line sets, one undo step each
      const free = () => { const s = new Set(); for (const p of P.readPorts(b.w())) if (p.role === 'equipment' && !p.connectedTo) s.add(p.owner + '#' + p.portName); return s; };
      const lineSet = (ga, gb, label) => {
        const pl = H.planLineSet(byG(ga), byG(gb), { free: free() });
        if (pl.error) return pl;
        const n0 = b.ed.changes.length;
        go(H.chainOps(pl.runs.map((r) => M.placeRun({ storey: L1, kind: 'pipe', system: r.system, mat: r.mat, cls: r.cls, size: r.size, points: r.points, ends: r.ends }))), label);
        return { ...pl, steps: b.ed.changes.length - n0 };
      };
      const runs0 = M.readRuns(b.w()).length;
      const a1 = lineSet(odu, rg, 'main gas'), a2 = lineSet(odu, rl, 'main liquid');
      ok(a1.runs?.length === 1 && a2.runs?.length === 1 && a1.runs[0].size === '3/4' && a2.runs[0].size === '3/8', 'outdoor unit (22.4 kW) → each refnet\'s inlet (14 + 7.1 kW): one run each, gas 3/4, liquid 3/8', JSON.stringify([a1.runs?.[0]?.size, a2.runs?.[0]?.size, a1.error, a2.error]));
      const a3 = lineSet(rg, iu1, 'branch 1 gas'), a4 = lineSet(rl, iu1, 'branch 1 liquid');
      const a5 = lineSet(rg, iu2, 'branch 2 gas'), a6 = lineSet(rl, iu2, 'branch 2 liquid');
      ok([a3, a4, a5, a6].every((x) => x.runs?.length === 1 && x.steps === 1), 'refnet branches → indoor units: one run per line, each one undo step', JSON.stringify([a3, a4, a5, a6].map((x) => x.error || x.runs[0].size)));
      ok(M.readRuns(b.w()).length === runs0 + 6, 'six refrigerant runs in the model');
      // a whole line set (indoor + outdoor single split) as ONE change, then Undo / Redo
      const ou2 = place('split-outdoor', -4000, 4000, 0, { capacity: '3.5' }, 'OU-2');
      const iu3 = place('split-cassette', -4000, 8000, 2700, { capacity: '3.5' }, 'IU-3');
      const before = M.readRuns(b.w()).length;
      const ls = lineSet(ou2, iu3, 'line set');
      ok(ls.runs?.length === 2 && ls.steps === 1 && M.readRuns(b.w()).length === before + 2, 'outdoor + cassette: liquid and gas runs placed as ONE change', JSON.stringify(ls.error));
      b.ed.undo();
      ok(M.readRuns(b.w()).length === before, 'one Undo takes both runs back');
      b.ed.redo();
      ok(M.readRuns(b.w()).length === before + 2, 'Redo puts both back');
      // the check
      const chk = C.checkConnections(b.w());
      const errs = chk.issues.filter((i) => i.level === 'error');
      const sizeErr = errs.filter((i) => i.code === 'size');
      ok(!errs.filter((i) => i.code !== 'size').length, 'Connections check: no kind / system / gone errors on the refrigerant system', JSON.stringify(errs.slice(0, 3)));
      ok(sizeErr.length === 0, 'no size mismatches: each run takes its downstream end\'s size and the table agrees at the other end here', JSON.stringify(sizeErr.map((i) => i.fill)));
      const ports = P.readPorts(b.w());
      const eqPort = (g, n) => ports.find((p) => p.ownerGuid === g && p.portName === n);
      ok(eqPort(iu3, 'ref-liquid')?.connectedTo && eqPort(iu3, 'ref-gas')?.connectedTo && eqPort(ou2, 'ref-gas')?.connectedTo, 'the line set\'s ends are connected to both units\' ports');
      ok(chk.issues.some((i) => i.code === 'open-port' && i.fill.port === 'drain') && !chk.issues.some((i) => i.code === 'no-source' && /ref/.test(i.fill.system || '')), 'open condensate ports are listed; refrigerant runs have a source (the outdoor unit\'s both-way ports)');
      // auto sizes follow a capacity change
      go(E.changeEquipment(iu2, { values: { capacity: '3.5' } }), 'smaller');
      const g2 = P.readPorts(b.w()).find((p) => p.ownerGuid === iu2 && p.portName === 'ref-gas');
      ok(g2?.nominal === '1/2' && C.checkConnections(b.w()).issues.some((i) => i.code === 'size'), 'IU-2 made 3.5 kW: its gas port becomes 1/2 and the check shows the 5/8 run no longer fits', JSON.stringify(g2?.nominal));
      // the model's own table (hvac-ui.js): saved on the project as one change, read back, Undo takes it away
      const HU = await import(path.join(APP, 'mep/hvac-ui.js'));
      ok(HU.readModelTable(b.w()) === null, 'no table saved: the typical one is used');
      const mine = [{ upTo: 4, liquid: '1/4', gas: '1/2' }, { upTo: 200, liquid: '3/8', gas: '3/4' }];
      go(HU.saveModelTable(mine), 'table');
      ok(JSON.stringify(HU.readModelTable(b.w())) === JSON.stringify(mine), 'Line set sizes: the person\'s table is kept in the model (CadCraft_HvacLineSets on IfcProject)');
      b.ed.undo();
      ok(HU.readModelTable(b.w()) === null, 'Undo takes the table back');
      b.ed.redo();
      // file
      const bytes = b.ed.save();
      const f = path.join(tmp, 'hvac-' + schema + '.ifc');
      fs.writeFileSync(f, bytes);
      const v = py('ifc_validate.py', f);
      ok(v === null || v.errors === 0, 'IfcOpenShell: schema clean' + (v === null ? ' (venv not here: skipped)' : ''), JSON.stringify(v?.first || v));
      const hc = py('hvac_check.py', f);
      if (hc && !hc.error) {
        const q = hc.equipment;
        const wantCls = schema === 'IFC4' ? 'IfcUnitaryEquipment' : 'IfcEnergyConversionDevice';
        ok(q['ODU-1']?.class === wantCls && q['ODU-1'].object_type === 'VRF outdoor unit' && q['ODU-1'].type_class === 'IfcUnitaryEquipmentType' && q['ODU-1'].type_predefined === 'SPLITSYSTEM' && (schema !== 'IFC4' || q['ODU-1'].predefined === 'SPLITSYSTEM'), 'IfcOpenShell: VRF outdoor unit = ' + wantCls + ' SPLITSYSTEM, ObjectType "VRF outdoor unit"', JSON.stringify(q['ODU-1']).slice(0, 300));
        ok(q['RN-G1']?.class === (schema === 'IFC4' ? 'IfcPipeFitting' : 'IfcFlowFitting') && q['RN-G1'].type_class === 'IfcPipeFittingType' && q['RN-G1'].type_predefined === 'JUNCTION' && q['RN-G1'].ports.length === 3, 'refnet = IfcPipeFitting JUNCTION with 3 ports', JSON.stringify(q['RN-G1']).slice(0, 300));
        ok(q['FC-1']?.type_predefined === 'AIRHANDLER' && q['FC-1'].object_type === 'Fan coil unit' && q['FC-1'].ports.length === 7, 'fan coil = IfcUnitaryEquipment AIRHANDLER "Fan coil unit", 7 ports', JSON.stringify(q['FC-1']).slice(0, 300));
        const gas = q['IU-3']?.ports.find((p) => p.name === 'ref-gas');
        ok(gas && gas.connected && gas.system === 'refg' && gas.flow === 'SOURCEANDSINK' && (schema !== 'IFC4' || gas.system_type === 'REFRIGERATION'), 'IU-3 gas port: connected, SOURCEANDSINK, REFRIGERATION', JSON.stringify(gas));
        ok(Object.values(hc.systems).filter((x) => x === 'REFRIGERATION').length === 2 && Object.values(hc.systems).includes('DRAINAGE') && Object.keys(hc.systems).every((n) => !/^mep\.sys\./.test(n)), 'systems: liquid and gas lines (REFRIGERATION), condensate (DRAINAGE, the units join it), named in words', JSON.stringify(hc.systems));
      } else ok(!PY, 'hvac_check.py ran', JSON.stringify(hc));
      const b2 = await editorFor(bytes);
      ok(E.readEquipment(b2.w()).length === 8 && M.readRuns(b2.w()).filter((r) => r.mat === 'acr').length === 8 && HU.readModelTable(b2.w())?.length === 2, 'reopened: 8 pieces, 8 ACR runs, the table');
    }
  }
  if (args.includes('--keep')) console.log('  kept ' + tmp); else fs.rmSync(tmp, { recursive: true, force: true });
  console.log('\n' + good + ' passed, ' + bad + ' failed');
  return bad ? 1 : 0;
}
