/* SPDX-License-Identifier: Apache-2.0 */
/**
 * defaults-test.mjs: 0.10 DP.1 Default Policies in BimCraft, on real IFC models (session `bk-defaults-10`). DOM-free, run by
 *   node bin/test-bimcraft.mjs --defaults
 * With the add-on's provider on the defaults hook and policies set, a new building really starts that way: a metric project on
 * the masonry wall type, three named levels, its first sheet on another paper at another scale (or none), LOD tags on the
 * starter types and on a newly made type, kept in the file. With no provider, or nothing set, the file a new building gets is
 * the SAME TEXT as before (compared against new-defaults.js). The engine alone: node tools/defaults/test.mjs. The page:
 * tools/bimcraft-test/browser-defaults.mjs.
 */
import path from 'node:path';
import { pathToFileURL } from 'node:url';

export async function defaultsMode({ APP, ROOT, WebIFC, IfcModel, quiet }) {
  let bad = 0, good = 0;
  const ok = (cond, label, detail = '') => { if (cond) good++; else bad++; console.log((cond ? '  ok   ' : '  FAIL ') + label + (!cond && detail ? ' (' + detail + ')' : '')); };
  const near = (a, b, tol = 0.01) => Math.abs(a - b) <= tol;
  const lib = (f) => import(pathToFileURL(path.join(ROOT, 'lib/defaults', f)).href);
  const P = await lib('policies.js'), { makeProvider } = await lib('provider.js');
  const H = await import(path.join(APP, 'defaults-hook.js'));
  const NU = await import(path.join(APP, 'new-defaults-ui.js'));
  const ND = await import(path.join(APP, 'new-defaults.js'));
  const NP = await import(path.join(APP, 'new-policy.js'));
  const N = await import(path.join(APP, 'new-model.js'));
  const MW = await import(path.join(APP, 'model-walls.js'));
  const WA = await import(path.join(APP, 'wall-assemblies.js'));
  const RS = await import(path.join(APP, 'res-sheets.js'));
  const V = await import(path.join(APP, 'views-model.js'));
  const OPS = await import(path.join(APP, 'model-ops.js'));
  const { ModelWriter } = await import(path.join(APP, 'model-write.js'));
  const { IfcEditor } = await import(path.join(APP, 'ifc-edit.js'));
  const open = async (text) => {
    const eng = await quiet(IfcModel.create)(WebIFC, null);
    await quiet((b) => eng.load(b))(new TextEncoder().encode(text));
    const ed = new IfcEditor(WebIFC, eng);
    return { ed, w: () => new ModelWriter(WebIFC, ed.api, ed.mid) };
  };
  let n = 0;
  const guid = () => 'G' + String(++n).padStart(21, '0');
  const now = new Date('2026-11-11T12:00:00Z');
  /** The file the New building dialog would make from `start`, left untouched (what bimcraft.js askNewBuilding does on Create). */
  const build = (start) => {
    n = 0;
    const levels = N.stackLevels(start.levels, start.height, (i) => (start.levelName ? start.levelName(i) : 'Level ' + (i + 1)));
    return { levels, text: N.newBuilding({ name: 'B', siteName: 'Site', levels, fileName: 'b.ifc', now, guid, sheet: NU.startSheet(start, { titleOf: (l) => l + ' plan', levelName: levels[0].name }) }) };
  };
  const before = (metric) => {
    n = 0;
    const d = ND.startDefaults({ metric }), levels = N.stackLevels(d.levels, d.height, (i) => 'Level ' + (i + 1));
    return N.newBuilding({ name: 'B', siteName: 'Site', levels, fileName: 'b.ifc', now, guid, sheet: ND.firstSheet({ metric, title: 'Level 1 plan' }) });
  };
  let doc = P.emptyDoc();
  const optionsOf = (p, s) => { const a = { wallTypes: MW.WALL_TYPES.map((x) => x.key), papers: Object.keys(RS.PAPERS), scales: RS.scalesFor(s === 'imperial' ? 'ftin' : 'mm').map((x) => x.ratio) }[p.optionsFrom]; return a || null; };
  const prov = makeProvider({ doc: () => doc, source: () => 'from your Default Policies', optionsOf });

  console.log('== nothing set: a new building is byte for byte what it was');
  for (const metric of [true, false]) {
    const s = NU.startFor({ metricOwn: metric, unitsNow: metric ? 'mm' : 'ftin' });
    ok(build(s).text === before(metric), 'no add-on, ' + (metric ? 'metric' : 'imperial') + ': the same IFC text as new-defaults.js gives');
  }
  H.setDefaults(prov);
  for (const metric of [true, false]) {
    const s = NU.startFor({ metricOwn: metric, unitsNow: metric ? 'mm' : 'ftin' });
    ok(!s.any && build(s).text === before(metric), 'add-on on, no policy set, ' + (metric ? 'metric' : 'imperial') + ': still the same IFC text');
  }
  ok(MW.WALL_TYPES.filter((x) => !x.lod).every((x) => !('lod' in MW.wallType(x.key))) && !('lod' in MW.wallType('ext-2x6@200')) && MW.WALL_TYPES.filter((x) => x.lod).map((x) => x.key).join() === 'generic-200,generic-100', 'starter wall types carry no LOD field (but the two generic walls of BK.15, which are LOD 200 by what they are)');

  console.log('== a metric office: masonry first, three named levels, sheet A-001 on A1 at 1:50');
  let q = P.emptyDoc();
  q = P.setValue(q, 'bimcraft.wall.first', 'ext-300', { system: 'metric', optionsOf });
  q = P.setValue(q, 'bimcraft.levels.count', 3); q = P.setValue(q, 'bimcraft.levels.name', 'Floor {nn0}'); q = P.setValue(q, 'bimcraft.levels.height', 2700, { system: 'metric' });
  q = P.setValue(q, 'bimcraft.sheet.paper', 'a1', { system: 'metric', optionsOf }); q = P.setValue(q, 'bimcraft.sheet.scale', 50, { system: 'metric', optionsOf });
  q = P.setValue(q, 'bimcraft.sheet.number', 'A-001', { system: 'metric' }); q = P.setValue(q, 'bimcraft.sheet.title', 'Plan: {level}', { system: 'metric' });
  q = P.setValue(q, 'bimcraft.tool.afterCreate', 'wall');
  doc = q;
  const sm = NU.startFor({ metricOwn: true, unitsNow: 'mm' });
  ok(sm.wallType === 'ext-300' && sm.levels === 3 && sm.height === 2700 && sm.heightText === '2700 mm' && sm.tool === 'wall' && sm.sheet.scale === '1:50' && sm.source === 'from your Default Policies',
    'the dialog would show: Exterior masonry 300, 3 levels, 2700 mm, 1:50, Wall tool, "from your Default Policies"', JSON.stringify(sm));
  {
    const { text } = build(sm), { ed, w } = await open(text);
    const snap = OPS.snapshotModel(ed), lv = snap.levels.slice().sort((a, b) => a.elevation - b.elevation);
    ok(lv.length === 3 && lv.map((l) => l.name).join() === 'Floor 00,Floor 01,Floor 02' && lv.map((l) => l.elevation).join() === '0,2700,5400' && lv.every((l) => near(l.height, 2700)), 'the file has Floor 00, Floor 01, Floor 02 at 0, 2700, 5400, each 2700 high', JSON.stringify(lv.map((l) => [l.name, l.elevation, l.height])));
    const sheets = V.readSheets(w());
    ok(sheets.length === 1 && sheets[0].number === 'A-001' && sheets[0].title === 'Plan: Floor 00' && sheets[0].paper === 'a1' && sheets[0].views.length === 1 && sheets[0].views[0].ratio === 50 && sheets[0].views[0].ref === lv[0].guid, 'one sheet: A-001 "Plan: Floor 00" on A1 with the lowest level\'s plan at 1:50', JSON.stringify(sheets));
    ok(near(sheets[0].views[0].x, 420.5) && near(sheets[0].views[0].y, 311), 'the plan sits in the middle of the A1 drawing area (420.5, 311)');
    ed.modelChange(OPS.drawWalls({ storey: lv[0].guid, segs: [{ a: [0, 0], b: [6000, 0] }], typeKey: sm.wallType, topLevel: lv[1].guid }));
    const wall = OPS.snapshotModel(ed).walls[0];
    ok(wall && wall.typeKey === 'ext-300' && near(wall.t, 300) && near(wall.height, 2700), 'the first wall drawn with it: Exterior masonry, 300 thick, 2700 high', JSON.stringify(wall && [wall.typeKey, wall.t, wall.height]));
  }
  const si = NU.startFor({ metricOwn: false, unitsNow: 'ftin' }), di = ND.startDefaults({ metric: false });
  ok(si.wallType === di.wallType && si.height === di.height && si.heightText === di.heightText && si.sheet.paper === di.sheet.paper && si.sheet.ratio === di.sheet.ratio && si.sheet.number === di.sheet.number && si.levels === 3,
    'the same office starting an imperial project: wall type, height and sheet are BimCraft\'s own (only the metric halves were set); 3 levels still apply');

  console.log('== an imperial half, and "no first sheet"');
  doc = P.setValue(P.setValue(P.setValue(q, 'bimcraft.levels.height', 2743.2, { system: 'imperial' }), 'bimcraft.wall.first', 'cmu-8', { system: 'imperial', optionsOf }), 'bimcraft.sheet.scale', 48, { system: 'imperial', optionsOf });
  const s2 = NU.startFor({ metricOwn: false, unitsNow: 'ftin' });
  ok(s2.wallType === 'cmu-8' && s2.height === 2743.2 && s2.heightText === "9'-0\"" && s2.sheet.ratio === 48 && s2.sheet.scale === '1/4" = 1\'-0"' && s2.sheet.paper === 'tabloid', 'imperial: 8 in block, 9\'-0", 1/4" = 1\'-0" on the app\'s own Tabloid', JSON.stringify(s2));
  doc = P.setValue(q, 'bimcraft.sheet.first', 'none');
  {
    const s = NU.startFor({ metricOwn: true, unitsNow: 'mm' }), { text } = build(s), { w } = await open(text);
    ok(s.sheet === null && V.readSheets(w()).length === 0 && !/CadCraft_Sheets/.test(text), '"No first sheet": the new file has no sheet at all');
  }

  console.log('== LOD tags: starter types, and a newly made type');
  doc = P.setValue(P.setValue(P.emptyDoc(), 'bimcraft.wall.starterLod', 200), 'bimcraft.wall.newLod', 350);
  ok(MW.WALL_TYPES.every((x) => MW.wallType(x.key).lod === 200) && MW.wallType('ext-2x6@200').lod === 200, 'every starter type (and a starter at another thickness) carries LOD 200');
  {
    const s = NU.startFor({ metricOwn: true, unitsNow: 'mm' }), { text } = build(s), { ed, w } = await open(text);
    ok(text === before(true), 'the LOD policies change nothing in the new file itself');
    ok(MW.wallTypes(w()).length === MW.WALL_TYPES.length && MW.wallTypes(w()).every((x) => x.lod === 200), 'the model\'s type list (Wall tool, Properties, swap list) shows the tag on all ' + MW.WALL_TYPES.length);
    const lv = OPS.snapshotModel(ed).levels;
    ed.modelChange(OPS.drawWalls({ storey: lv[0].guid, segs: [{ a: [0, 0], b: [5000, 0] }], typeKey: 'ext-300', topLevel: lv[1].guid }));
    // what the type editor does for a NEW type (wall-assemblies-ui.js openAssembly): a copy of the source, the new-type LOD first
    const recipe = structuredClone(MW.wallType('ext-300', w()));
    const first = NP.newTypeLod(); if (first) recipe.lod = first;
    const input = WA.validateAssembly({ ...recipe, key: 'wall-dp-test', name: 'Office masonry', exterior: true });
    ed.modelChange(OPS.saveWallAssembly(input, []));
    const made = MW.wallTypes(w()).find((x) => x.key === 'wall-dp-test');
    ok(made && made.lod === 350 && made.custom, 'a newly made type starts on LOD 350');
    const saved = new TextDecoder().decode(ed.save()), re = await open(saved);
    ok(MW.wallTypes(re.w()).find((x) => x.key === 'wall-dp-test')?.lod === 350 && /'LOD',\$,IFCINTEGER\(350\)/.test(saved), 'kept through save and reopen, with the plain LOD property in the file');
    H.setDefaults(null);
    const again = MW.wallTypes(re.w());
    ok(again.find((x) => x.key === 'wall-dp-test')?.lod === 350 && again.filter((x) => !x.custom && !/^generic-/.test(x.key)).every((x) => !('lod' in x)), 'add-on off: the project type keeps its tag (it is in the file); the starter types have none again');
    H.setDefaults(prov);
  }
  doc = P.setValue(P.emptyDoc(), 'bimcraft.wall.starterLod', 300);
  {
    const recipe = structuredClone(MW.wallType('int-100'));
    const first = NP.newTypeLod(); if (first) recipe.lod = first;
    ok(recipe.lod === 300, 'with only the starter tag set, a copy of a starter starts on the starter\'s tag');
  }

  console.log('== units of a new project');
  doc = P.setValue(P.emptyDoc(), 'bimcraft.units', 'm');
  let su = NU.startFor({ metricOwn: false, unitsNow: 'ftin' });
  ok(su.metric && su.units === 'm' && su.from.units && su.heightText === '3000 mm' && su.sheet.paper === 'a3', 'units policy "m" in an imperial browser: a metric start (3000 mm levels, A3), units switch to metres on Create');
  doc = P.setValue(P.emptyDoc(), 'all.system', 'imperial');
  su = NU.startFor({ metricOwn: true, unitsNow: 'mm' });
  ok(!su.metric && su.units === 'ftin' && su.heightText === "10'-0\"" && su.sheet.paper === 'tabloid', 'the unit system for every app, imperial: feet and inches, 10\'-0", Tabloid');

  H.setDefaults(null);
  const off = NU.startFor({ metricOwn: true, unitsNow: 'mm' });
  ok(!off.any && build(off).text === before(true) && !('lod' in MW.wallType('ext-2x6')), 'add-on switched off: everything is as before again');
  console.log(`\n${good} ok, ${bad} failed`);
  return bad ? 1 : 0;
}
