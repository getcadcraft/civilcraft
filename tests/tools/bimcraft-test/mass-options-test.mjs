/* SPDX-License-Identifier: Apache-2.0 */
/**
 * mass-options-test.mjs: massing option sets in the same model, the site check on the current option, and the round trip
 * ModelCraft push / pull massing -> IFC -> BimCraft (0.10 BK.44, session bk-r3-stages-10), DOM-free:
 *   node bin/test-bimcraft.mjs --massoptions
 * Part A: a new two-level building (levels 3000 apart) on a 40 000 x 30 000 mm site, building origin at the site's corner.
 * Part B: tools/modelcraft-test/massing-model.mjs (Bar, Stepped, L; numbers worked by hand there) through ModelCraft's
 * massing-mc.js into a file, opened here. Part C: CivilCraft's older fixture, which has no option fields.
 */
import path from 'node:path';
import fs from 'node:fs';

export async function massOptionsMode({ APP, ROOT, WebIFC, IfcModel, quiet }) {
  let bad = 0, good = 0;
  const ok = (cond, label, detail = '') => { if (cond) good++; else bad++; console.log((cond ? '  ok   ' : '  FAIL ') + label + (!cond && detail !== '' ? ' (' + (typeof detail === 'string' ? detail : JSON.stringify(detail)) + ')' : '')); };
  const near = (a, b, e = 0.01) => Math.abs(a - b) <= e;
  const { ModelWriter } = await import(path.join(APP, 'model-write.js'));
  const OPS = await import(path.join(APP, 'model-ops.js'));
  const MW = await import(path.join(APP, 'model-walls.js'));
  const MS = await import(path.join(APP, 'model-site.js'));
  const SC = await import(path.join(APP, 'model-site-constraints.js'));
  const SM = await import(path.join(APP, 'model-site-mass.js'));
  const MO = await import(path.join(APP, 'mass-options.js'));
  const { readDerived } = await import(path.join(APP, 'model-slabs.js'));
  const { readAreas } = await import(path.join(APP, 'room-bounds.js'));
  const { IfcEditor } = await import(path.join(APP, 'ifc-edit.js'));
  const { ids } = await import(path.join(APP, 'ifc-util.js'));
  const { t } = await import(path.join(APP, 'i18n.js'));
  const N = await import(path.join(APP, 'new-model.js'));
  const boot = async (bytes) => { const eng = await quiet(IfcModel.create)(WebIFC, null); await quiet((b) => eng.load(b))(bytes); return new IfcEditor(WebIFC, eng); };
  let ed = await boot(new TextEncoder().encode(N.newBuilding({ name: 'Options', levels: N.stackLevels(2, 3000, (i) => 'Level ' + (i + 1)), fileName: 'mo.ifc', now: new Date('2026-11-11T12:00:00Z') })));
  const W = () => new ModelWriter(WebIFC, ed.api, ed.mid);
  const levels = () => OPS.snapshotModel(ed).levels;
  const sets = () => MO.readOptionSets(W());
  const opt = (name) => sets().flatMap((s) => s.options).find((o) => o.option === name);
  const spaceCount = () => ids(ed.api, ed.mid, 'IFCSPACE').length;
  const probs = () => SC.siteProblems(W(), { t, levelName: () => '', extra: MO.optionFootprints(W(), (o) => 'Massing option ' + o.option) });
  const L1 = levels()[0];

  console.log('== A. options kept in the model');
  ok(sets().length === 0, 'a new building: no option sets');
  ed.modelChange(MS.setSiteOutline({ storey: L1.guid, points: [[0, 0], [40000, 0], [40000, 30000], [0, 30000]] }));
  // setbacks 5000 front, 2000 the rest: the building line is (2000, 5000) to (38000, 28000)
  ed.modelChange(SC.setSetbacks({ setbacks: [5000, 2000, 2000, 2000] }));
  // a 3000 wide sewer servitude along x = 30000 (x from 28500 to 31500)
  ed.modelChange(SC.addConstraint({ storey: L1.guid, kind: 'servitude', shape: 'strip', pts: [[30000, 0], [30000, 30000]], width: 3000, servitude: 'sewer', name: 'Sewer' }));
  let n0 = ed.changes.length;
  // Bar: 20 x 10 m, 3 floors of 3 m: footprint 200 m2, gross 600 m2, volume 200 * 9 = 1800 m3, envelope (2 * (20 + 10)) * 9 = 540 m2
  const rBar = ed.modelChange(MO.addMassOption({ set: 'Scheme A', name: 'Bar', pts: [[5000, 6000], [25000, 6000], [25000, 16000], [5000, 16000]], floors: 3, floorHeight: 3000, use: 'Office' }), { label: 'Keep Bar' });
  ok(ed.changes.length === n0 + 1, 'keeping an option is one undo step');
  let S = sets();
  const bar = S[0]?.options[0];
  ok(S.length === 1 && S[0].set === 'Scheme A' && S[0].options.length === 1 && bar.option === 'Bar' && bar.name === 'Bar' && bar.use === 'Office', 'one set "Scheme A" with the option Bar', S);
  ok(bar.floors === 3 && near(bar.floorHeight, 3000) && near(bar.height, 9000), 'Bar: 3 floors of 3000, 9000 high', [bar.floors, bar.floorHeight, bar.height]);
  ok(near(bar.footprint_m2, 200) && near(bar.gross_m2, 600) && near(bar.volume_m3, 1800) && near(bar.envelope_m2, 540), 'Bar: 200 m2, 600 m2 gross, 1800 m3, 540 m2 of outer wall', [bar.footprint_m2, bar.gross_m2, bar.volume_m3, bar.envelope_m2]);
  ok(bar.pts.length === 4 && near(Math.min(...bar.pts.map((p) => p[0])), 5000, 0.5) && near(Math.max(...bar.pts.map((p) => p[1])), 16000, 0.5), 'Bar: its outline reads back where it was drawn (world mm)', bar.pts);
  ok(bar.current && bar.spaces === 3 && spaceCount() === 3, 'the first option of a set is the current one, with a floor space per floor (3)', [bar.current, bar.spaces, spaceCount()]);
  ok(typeof rBar.guid === 'string' && rBar.guid === bar.guid, 'the op hands back the new option\'s GlobalId');
  ok(SM.readMasses(W()).length === 1 && SM.readMasses(W())[0].guid === bar.guid, 'it is a building mass like any other (readMasses)');
  ok(levels().length === 2, 'keeping a 3-floor option added no level (still 2)');
  ok(readDerived(W()).spaces.length === 0 && readAreas(W()).length === 0, 'the floor spaces are neither rooms nor areas');
  ok(probs().length === 0, 'Bar stands inside the building line and off the servitude: no warning', probs().map((p) => p.text));
  // Tower: 10 x 10 m, 6 floors: footprint 100, gross 600, volume 100 * 18 = 1800, envelope 40 * 18 = 720. It stands on the sewer (x 26000..36000)
  ed.modelChange(MO.addMassOption({ set: 'Scheme A', name: 'Tower', pts: [[26000, 8000], [36000, 8000], [36000, 18000], [26000, 18000]], floors: 6, floorHeight: 3000 }));
  let tower = opt('Tower');
  ok(sets()[0].options.length === 2 && !tower.current && tower.spaces === 0 && spaceCount() === 3, 'a second option is kept beside it, not current, with no floor spaces', [tower.current, tower.spaces]);
  ok(near(tower.footprint_m2, 100) && near(tower.gross_m2, 600) && near(tower.volume_m3, 1800) && near(tower.envelope_m2, 720), 'Tower: 100 m2, 600 m2 gross, 1800 m3, 720 m2 of outer wall', [tower.footprint_m2, tower.gross_m2, tower.volume_m3, tower.envelope_m2]);
  ok(probs().length === 0, 'an option that is not current is not checked against the site (Tower stands on the sewer: no warning yet)');
  n0 = ed.changes.length;
  ed.modelChange(MO.setCurrentOption(tower.guid), { label: 'Make Tower current' });
  ok(ed.changes.length === n0 + 1 && opt('Tower').current && !opt('Bar').current, 'Make current: one undo step, exactly one current');
  ok(opt('Tower').spaces === 6 && opt('Bar').spaces === 0 && spaceCount() === 6, 'the floor spaces follow the current option: 6 for Tower, none for Bar', [opt('Tower').spaces, opt('Bar').spaces, spaceCount()]);
  let P = probs();
  ok(P.length === 1 && P[0].code === 'site.servitude.over' && P[0].severity === 'warning' && P[0].about[0].id === tower.guid && /Massing option Tower/.test(P[0].text) && /Sewer/.test(P[0].text), 'now the site check warns: the current option stands on the sewer servitude (a warning, nothing refused)', P.map((p) => p.text));
  ed.undo();
  ok(opt('Bar').current && !opt('Tower').current && spaceCount() === 3 && probs().length === 0, 'undo: Bar is current again with its 3 floor spaces, the warning gone');
  ed.redo();
  ok(opt('Tower').current && spaceCount() === 6 && probs().length === 1, 'redo: Tower again');
  // an option over the front building line (y from 3000, the line is at 5000) and outside the site (x from -1000)
  ed.modelChange(MO.addMassOption({ set: 'Scheme A', name: 'Low', pts: [[-1000, 3000], [9000, 3000], [9000, 13000], [-1000, 13000]], floors: 1, floorHeight: 3000, current: true }));
  P = probs();
  ok(opt('Low').current && !opt('Tower').current && P.length === 2 && P.some((p) => p.code === 'site.boundary.cross') && P.some((p) => p.code === 'site.buildingline.cross') && P.every((p) => p.about[0].id === opt('Low').guid), 'kept as the current one, an option over the boundary and the building line gets both warnings and Tower\'s goes', P.map((p) => p.code));
  // a second set: its own current option, checked as well
  ed.modelChange(MO.addMassOption({ set: 'Scheme B', name: 'Annex', pts: [[10000, 20000], [20000, 20000], [20000, 26000], [10000, 26000]], floors: 2, floorHeight: 3500 }));
  S = sets();
  ok(S.length === 2 && S[1].set === 'Scheme B' && S[1].options[0].current && S[0].options.filter((o) => o.current).length === 1, 'a second set has its own current option; one current per set', S.map((s) => s.set));
  ok(near(opt('Annex').height, 7000) && near(opt('Annex').gross_m2, 120) && spaceCount() === 1 + 2, 'Annex: 2 floors of 3500 = 7000 high, 120 m2 gross; floor spaces 1 (Low) + 2 (Annex)', spaceCount());
  // rename, and move to another set
  ed.modelChange(MO.renameOption(opt('Low').guid, { name: 'Courtyard house' }));
  ok(opt('Courtyard house')?.name === 'Courtyard house' && !opt('Low'), 'rename: the option and the element are renamed');
  let threw = null; try { ed.modelChange(MO.renameOption(opt('Bar').guid, { name: '   ' })); } catch (e) { threw = e.key; }
  ok(threw === 'model.err.massopt.name', 'an empty name is refused', threw);
  threw = null; try { ed.modelChange(MO.setCurrentOption('nope')); } catch (e) { threw = e.key; }
  ok(threw === 'model.err.mass.none', 'an unknown option is refused', threw);
  threw = null; try { ed.modelChange(MO.addMassOption({ set: 'X', name: 'Bad', pts: [[0, 0], [1000, 0]], floors: 1, floorHeight: 3000 })); } catch (e) { threw = e.key; }
  ok(threw === 'model.err.mass.shape', 'an outline of two points is refused', threw);
  // remove the current one: the set's first other option takes over
  ed.modelChange(MO.removeMassOption(opt('Courtyard house').guid));
  ok(sets()[0].options.length === 2 && opt('Bar').current && opt('Bar').spaces === 3 && !opt('Tower').current, 'removing the current option: the first other one (Bar) takes over with its floor spaces', sets()[0].options.map((o) => [o.option, o.current, o.spaces]));
  ok(probs().length === 0, 'and the warnings about the removed option are gone');

  console.log('== the assistant tools (agents.js): massing_describe lists what is kept, massing_add keep, massing_option');
  {
    const AG = await import(path.join(APP, 'agents.js'));
    const tools = new Map(AG.modelTools({ ed: () => ed, apply: async (label, op) => ed.modelChange(op, { label: 'Assistant: ' + label }) }).map((d) => [d.name, d]));
    const args = { program: [{ name: 'Office', count: 10, area_m2: 25 }], width_m: 30, depth_m: 20 };
    const d = await tools.get('massing_describe').run(args);
    ok(d.options.length > 0 && d.kept.length === 2 && d.kept[0].set === 'Scheme A' && d.kept[0].options.map((o) => o.name).join() === 'Bar,Tower' && d.kept[0].options[0].current && near(d.kept[0].options[0].gross_m2, 600), 'massing_describe answers with the options for the program and `kept`: Scheme A (Bar current, Tower), Scheme B', d.kept);
    n0 = ed.changes.length;
    const k = await tools.get('massing_add').run({ ...args, option: d.options[0].key, keep: true, set: 'Scheme C' });
    ok(ed.changes.length === n0 + 1 && MW.readWalls(W()).length === 0 && k.kept.some((x) => x.set === 'Scheme C' && x.options.length === 1 && x.options[0].current) && /no walls/.test(k.note), 'massing_add with keep: true keeps the option in "Scheme C" in one step and builds no wall', k.note);
    const g = opt('Tower').guid;
    const c = await tools.get('massing_option').run({ guid: g, action: 'current' });
    ok(c.kept[0].options.find((o) => o.guid === g).current && !opt('Bar').current, 'massing_option current: Tower is the current option');
    await tools.get('massing_option').run({ guid: g, action: 'rename', name: 'Tall' });
    ok(opt('Tall') && !opt('Tower'), 'massing_option rename');
    let said = ''; try { await tools.get('massing_option').run({ guid: 'x'.repeat(22), action: 'remove' }); } catch (e) { said = e.message; }
    ok(said.length > 0, 'an unknown option: refused in words (' + said + ')');
    const sc = k.kept.find((x) => x.set === 'Scheme C').options[0].guid;
    await tools.get('massing_option').run({ guid: sc, action: 'remove' });
    ok(sets().length === 2, 'massing_option remove: Scheme C is gone again');
    // back as the rest of this test expects
    ed.modelChange(MO.renameOption(g, { name: 'Tower' })); ed.modelChange(MO.setCurrentOption(opt('Bar').guid));
  }

  console.log('== save, reopen');
  const bytes = ed.save();
  const ed1 = ed;
  ed = await boot(bytes);
  S = sets();
  ok(S.length === 2 && S[0].options.map((o) => o.option).join() === 'Bar,Tower' && S[1].options[0].option === 'Annex', 'the sets and their options read back from the saved file', S.map((s) => s.options.map((o) => o.option)));
  ok(opt('Bar').current && opt('Bar').spaces === 3 && near(opt('Bar').gross_m2, 600) && near(opt('Tower').envelope_m2, 720) && !opt('Tower').current, 'current, floor spaces and figures the same');
  const txt = new TextDecoder().decode(bytes);
  ok(/IFCBUILDINGELEMENTPROXY\([^;]*'Bar',\$,'Building mass'/.test(txt) && /'OptionSet'/.test(txt) && /'MassingFloor'/.test(txt) && /'CadCraft_MassFloor'/.test(txt), 'in the file: a proxy "Building mass", OptionSet in its pset, floor spaces of type MassingFloor');

  console.log('== develop a kept option');
  n0 = ed.changes.length;
  ed.modelChange(MO.developOption(opt('Bar').guid), { label: 'Develop Bar' });
  ok(ed.changes.length === n0 + 1, 'developing is one undo step');
  ok(levels().length === 3, 'a third level was added for the third floor', levels().length);
  ok(MW.readWalls(W()).length === 12 && readDerived(W()).floors.length === 3, '4 walls and a floor on each of 3 levels', [MW.readWalls(W()).length, readDerived(W()).floors.length]);
  ok(!opt('Bar') && opt('Tower') && opt('Annex') && sets()[0].options.length === 1, 'the developed option is gone from the list, the others are kept');
  ok(!ids(ed.api, ed.mid, 'IFCSPACE').some((id) => W().readPset(id, MO.FLOOR_PSET)?.Mass === bar.massId), 'its floor spaces went with it');
  ed.undo();
  ok(opt('Bar')?.current && levels().length === 2 && MW.readWalls(W()).length === 0, 'undo: the option is back, the walls and the level are gone');
  ed.redo();
  const afterDev = ed.save();

  console.log('== B. ModelCraft push / pull massing -> IFC -> here');
  const MC = path.join(ROOT, 'public_html/assets/apps/modelcraft/dev');
  const MCI = await import(path.join(MC, 'i18n.js'));
  MCI.init({ locale: 'en', strings: JSON.parse(fs.readFileSync(path.join(MC, 'lang/en.json'), 'utf8')) });
  const { buildMassingModel } = await import(path.join(ROOT, 'tools/modelcraft-test/massing-model.mjs'));
  const MM = await import(path.join(MC, 'massing-mc.js'));
  const { model } = await buildMassingModel(MC);
  const file = MM.massingFile(model, { floorHeight: 3, set: 'Scheme A', name: 'tower', now: new Date('2026-11-11T12:00:00Z') });
  const mcBytes = new TextEncoder().encode(file.text);
  ed = await boot(mcBytes);
  S = sets();
  ok(S.length === 1 && S[0].set === 'Scheme A' && S[0].options.map((o) => o.option).join() === 'Bar,Stepped,L', 'the file opens with one set of three options: Bar, Stepped, L', S.map((s) => s.options.map((o) => o.option)));
  const rep = Object.fromEntries(file.report.map((m) => [m.name, m]));
  for (const o of S[0].options) {
    const m = rep[o.option];
    ok(o.floors === m.floors && near(o.floorHeight, m.floorHeight * 1000, 0.01) && near(o.height, m.height * 1000, 0.01) && near(o.footprint_m2, m.footprint) && near(o.gross_m2, m.gross) && near(o.volume_m3, m.volume),
      o.option + ': floors, heights (mm), footprint, gross area and volume equal ModelCraft\'s (' + [o.floors, o.footprint_m2, o.gross_m2, o.volume_m3].join(', ') + ')', [o, m.floors, m.footprint, m.gross, m.volume]);
  }
  const st = opt('Stepped');
  ok(near(opt('Bar').gross_m2, 600) && near(st.gross_m2, 500) && st.floorAreas_m2.join() === '200,200,100' && st.simplified && near(st.volume_m3, 1500) && !opt('Bar').simplified && near(opt('L').footprint_m2, 300), 'by hand: Bar 600 m2; Stepped 200 + 200 + 100 = 500 m2, 1500 m3, marked simplified; L 300 m2 footprint', [st.gross_m2, st.floorAreas_m2]);
  // Stepped's proxy is its 20 x 10 base to 9 m: envelope 60 * 9 = 540 (the solid's own outer wall is not measured)
  ok(near(st.envelope_m2, 540) && near(opt('L').envelope_m2, 80 * 6), 'outer wall area from the outline and the height: Stepped 540, L 80 m x 6 m = 480', [st.envelope_m2, opt('L').envelope_m2]);
  ok(S[0].options.every((o) => !o.current) && opt('Bar').spaces === 3 && st.spaces === 3 && opt('L').spaces === 2 && o3(opt('L').pts), 'none is current yet; each arrived with its floor spaces (3, 3, 2); L stands at x = 60..80 m');
  function o3(P) { return near(Math.min(...P.map((p) => p[0])), 60000, 1) && near(Math.max(...P.map((p) => p[0])), 80000, 1); }
  ok(levels().length === 3 && near(levels()[2].elevation, 6000, 0.01), 'the building has the tallest option\'s three levels, 3000 apart');
  ed.modelChange(MO.setCurrentOption(st.guid));
  ok(opt('Stepped').current && opt('Stepped').spaces === 3 && opt('Bar').spaces === 0 && opt('L').spaces === 0 && spaceCount() === 3, 'Make Stepped current: only its floor spaces stay');
  const q = (id) => { const w = W(), d = w.defNamed(id, 'Qto_SpaceBaseQuantities'); for (const h of d?.line.Quantities || []) { const l = ed.api.GetLine(ed.mid, h.value, false); if (l?.Name?.value === 'GrossFloorArea') return Number(l.AreaValue?.value ?? l.AreaValue); } return null; };
  const floorAreas = ids(ed.api, ed.mid, 'IFCSPACE').map(q).sort((a, b) => a - b);
  ok(floorAreas.length === 3 && near(floorAreas[0], 100) && near(floorAreas[1], 200) && near(floorAreas[2], 200), 'its floor spaces carry 200, 200 and 100 m2', floorAreas);
  // the L has 2 floors in a 3-storey building: developed as an option (walls on 2 levels: 6 walls each)
  ed.modelChange(MO.developOption(opt('L').guid));
  ok(MW.readWalls(W()).length === 12 && readDerived(W()).floors.length === 2 && !opt('L') && opt('Bar') && opt('Stepped'), 'Develop L: 6 walls on each of its 2 floors and 2 floor slabs; Bar and Stepped stay', [MW.readWalls(W()).length, readDerived(W()).floors.length]);
  // Bar has as many floors as the building has storeys: the older "Develop this mass" works on it too
  ed.modelChange(SM.developMass({ guid: opt('Bar').guid }));
  ok(MW.readWalls(W()).length === 12 + 12 && !opt('Bar'), 'the 0.7 "Develop this mass" still works on a mass ModelCraft sent (Bar: 12 more walls)', MW.readWalls(W()).length);
  const mcAfter = ed.save();

  console.log('== C. an older file: masses with no option fields');
  ed = await boot(new Uint8Array(fs.readFileSync(path.join(ROOT, 'fixtures/ifc/site-masses.ifc'))));
  S = sets();
  ok(S.length === 1 && S[0].set === MO.DEFAULT_SET && S[0].options.length === 2 && S[0].options.every((o) => !o.current && o.option === o.name), 'CivilCraft\'s two masses read as one set, each its own option, none current, none lost', S);
  const FT = 1200 / 3937;
  const A = S[0].options.find((o) => o.massId === 'm1');
  // Block A: 30 x 40 ft, 3 floors of 12 ft: footprint 1200 sq ft = 1200 * FT^2 m2; volume = footprint * 36 ft
  ok(near(A.footprint_m2, 1200 * FT * FT, 0.02) && near(A.gross_m2, 3600 * FT * FT, 0.05) && near(A.volume_m3, 1200 * 36 * FT * FT * FT, 0.5) && near(A.envelope_m2, 140 * 36 * FT * FT, 0.05), 'Block A: 30 x 40 ft, 3 floors of 12 ft, in metric figures', [A.footprint_m2, A.gross_m2, A.volume_m3, A.envelope_m2]);
  ed.modelChange(MO.setCurrentOption(A.guid));
  ok(opt('Block A').current && opt('Block A').spaces === 3 && !opt('Block B').current, 'one of them can be made current (3 floor spaces written)');

  // IfcOpenShell schema validation when a venv with it is here (as --siteconstraints does)
  const py = [path.join(ROOT, 'tools/detailcraft-test/venv/bin/python'), path.join(ROOT, 'tools/bimcraft-test/venv/bin/python')].find((p) => fs.existsSync(p));
  if (!py) console.log('  --   no venv with ifcopenshell: schema validation skipped');
  else {
    const { execFileSync } = await import('node:child_process');
    const os = await import('node:os');
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'bim-mo-'));
    const files = [['options', bytes], ['developed', afterDev], ['modelcraft-massing', mcBytes], ['modelcraft-after', mcAfter], ['civil-current', ed.save()]].map(([k, b]) => { const f = path.join(dir, k + '.ifc'); fs.writeFileSync(f, b); return f; });
    let out = '';
    try { out = execFileSync(py, ['-I', path.join(ROOT, 'tools/bimcraft-test/ifc_validate.py'), ...files], { encoding: 'utf8' }); } catch (e) { out = String(e.stdout || ''); }
    const res = out.trim().split('\n').filter(Boolean).map((l) => JSON.parse(l));
    ok(res.length === files.length && res.every((r) => r.errors === 0), 'another IFC reader (schema validation) finds no errors in ' + res.map((r) => path.basename(r.file) + ' (' + r.errors + ')').join(', ') + (res.some((r) => r.errors) ? ': ' + res.flatMap((r) => r.first).slice(0, 4).join(' | ') : ''));
    fs.rmSync(dir, { recursive: true, force: true });
  }
  void ed1;
  console.log(`\n${good} passed, ${bad} failed`);
  return bad ? 1 : 0;
}
