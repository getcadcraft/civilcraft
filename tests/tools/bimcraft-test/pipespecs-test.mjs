/* SPDX-License-Identifier: Apache-2.0 */
/**
 * `node bin/test-bimcraft.mjs --pipespecs` (0.9.1, suggestions #1499 and #1493): custom pipe specs (mep/pipe-specs.js, kept in the
 * model by mep/pipe-specs-model.js), the starter specs' data, the in-line components (mep/inline.js: more valves, a strainer,
 * dampers on ducts), manufacturers' families on a run and as equipment (mep/oem-families.js), radiators and convectors
 * (mep/equip-more.js), and the files they make (IFC4 + IFC2X3; IfcOpenShell validates and reads the classes back when its venv
 * exists). `--only data|model` runs one section. Temp files go to a mkdtemp folder that is removed at the end.
 */
import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';
import { execFileSync } from 'node:child_process';

export async function pipeSpecsMode({ APP, ROOT, WebIFC, IfcModel, quiet, args = [] }) {
  let bad = 0, good = 0;
  const ok = (cond, label, detail = '') => { if (cond) good++; else bad++; console.log((cond ? '  ok   ' : '  FAIL ') + label + (!cond && detail ? ' (' + detail + ')' : '')); };
  const near = (a, b, e = 0.01) => Math.abs(a - b) <= e;
  const only = args.includes('--only') ? args[args.indexOf('--only') + 1] : null;
  const want = (k) => !only || only === k;
  const SP = await import(path.join(APP, 'mep/pipe-specs.js'));
  const SD = await import(path.join(APP, 'mep/pipe-specs-data.js'));
  const SM = await import(path.join(APP, 'mep/pipe-specs-model.js'));
  const PI = await import(path.join(APP, 'mep/pipes.js'));
  const IL = await import(path.join(APP, 'mep/inline.js'));
  const OF = await import(path.join(APP, 'mep/oem-families.js'));
  const E = await import(path.join(APP, 'mep/equipment.js'));
  await import(path.join(APP, 'mep/equip-more.js'));
  const M = await import(path.join(APP, 'mep-model.js'));
  const C = await import(path.join(APP, 'mep/connections.js'));
  const P = await import(path.join(APP, 'mep/ports.js'));
  const FL = await import(path.join(APP, 'mep/flow.js'));
  const CALC = await import(path.join(APP, 'mep-calc.js'));
  const U = await import(path.join(APP, 'ifc-util.js'));
  const { ModelWriter } = await import(path.join(APP, 'model-write.js'));
  const { IfcEditor } = await import(path.join(APP, 'ifc-edit.js'));
  const N = await import(path.join(APP, 'new-model.js'));
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'pipespecs-'));
  const PY = [path.join(ROOT, 'tools/detailcraft-test/venv/bin/python'), path.join(ROOT, 'tools/bimcraft-test/venv/bin/python')].find((p) => fs.existsSync(p));
  const key = (fn) => { try { fn(); return ''; } catch (e) { return e.key || e.message; } };

  const CSV = '# name: Site tube A\n# standard: Company spec PS-12 rev C\n# material: Stainless 316L\n# joint: orbital\n# roughness: 0.0008 mm\n# elbow: 1.5\nSize;DN;OD;Wall;Pressure\nDN10;10;13;1,5;PN16\nDN15;15;19;1.5;PN16\nDN25;25;29;1.5;PN16\nDN50;50;53;1.5;PN10\n';

  // ============================================================================================ 1. data (no IFC)
  if (want('data')) {
    console.log('== a pipe spec: clean, CSV, JSON (DOM-free)');
    const c = SP.specFromCsv(CSV);
    ok(c.spec && c.spec.id === 'site-tube-a' && c.spec.sizes.length === 4 && c.spec.standard === 'Company spec PS-12 rev C' && c.spec.material === 'Stainless 316L' && c.spec.joint === 'orbital' && c.spec.roughness === 0.0008, 'CSV with "# key: value" lines, semicolons and a decimal comma → a spec', JSON.stringify(c).slice(0, 300));
    const s15 = c.spec.sizes.find((z) => z.name === 'DN15');
    ok(s15.od === 19 && s15.wall === 1.5 && s15.id === 16 && s15.dn === 15 && s15.pn === 'PN16', 'a row: OD 19, wall 1.5 → ID 16, DN 15, PN16');
    const inch = SP.specFromCsv('Size,OD (in),Wall (in)\n1/2",0.5,0.065\n1",1,0.065\n2",2 in,1.65 mm\n', { name: 'Inch tube' });
    ok(inch.spec && near(inch.spec.sizes[0].od, 12.7, 1e-6) && near(inch.spec.sizes[0].wall, 1.651, 1e-6) && near(inch.spec.sizes[2].od, 50.8, 1e-6) && inch.spec.sizes[2].wall === 1.65, 'inch columns ("OD (in)") and a cell with its own unit', JSON.stringify(inch.spec?.sizes));
    const byId = SP.specFromCsv('Size\tOD\tID\nA\t20\t16\n', { name: 'By ID' });
    ok(byId.spec && byId.spec.sizes[0].wall === 2 && byId.spec.sizes[0].id === 16, 'a tab-separated paste with an inside diameter instead of a wall: wall = (OD − ID) / 2');
    ok(SP.specFromCsv('Size,OD\nA,20\n').error === 'mep.spec.err.columns' && SP.specFromCsv('Size,OD,Wall\n').error === 'mep.spec.err.norows', 'no wall or ID column, or no rows: refused with the reason');
    ok(SP.specFromCsv('Size,OD,Wall\nA,20,12\n', { name: 'x' }).error === 'mep.spec.err.wall' && SP.specFromCsv('Size,OD,Wall\nA,20,2\nA,25,2\n', { name: 'x' }).error === 'mep.spec.err.dupsize' && SP.specFromCsv('Size,OD,Wall,ID\nA,20,2,10\n', { name: 'x' }).error === 'mep.spec.err.idwall',
      'a wall that leaves no bore, a size named twice, an ID that disagrees with OD − 2 × wall: each refused');
    const back = SP.specFromCsv(SP.specToCsv(c.spec));
    ok(JSON.stringify(back.spec) === JSON.stringify(c.spec), 'CSV out and in again gives the same spec');
    const j = SP.specsFromJson(SP.specToJson(c.spec));
    ok(j.specs.length === 1 && !j.errors.length && JSON.stringify(j.specs[0]) === JSON.stringify(c.spec), 'JSON out and in again gives the same spec');
    const set = SP.specsFromJson(SP.specsToJson([c.spec, inch.spec]));
    ok(set.specs.length === 2 && SP.specsFromJson('{nope').errors[0].error === 'mep.spec.err.json' && SP.specsFromJson(JSON.stringify({ name: 'bad', sizes: [{ name: 'A', od: -1, wall: 1 }] })).errors[0].error === 'mep.spec.err.od', 'a file of several specs; broken JSON and a bad row are reported, never guessed');
    const dup = SP.duplicateSpec(c.spec, ['site-tube-a', 'site-tube-a-copy']);
    ok(dup.id !== c.spec.id && dup.id !== 'site-tube-a-copy' && dup.name === 'Site tube A (copy)' && dup.sizes.length === 4 && dup.sizes[0] !== c.spec.sizes[0], 'duplicate: a free id, "(copy)", its own rows', dup.id);
    ok(SP.newSpec('', ['spec']).sizes.length === 0 && SP.newSpec('', ['new-spec']).id === 'new-spec-2', 'a new spec is empty and gets a free id');

    console.log('== the spec in force: materials, sizes, bends');
    SP.setModelSpecs([c.spec, inch.spec]);
    const mat = SP.specMaterial('site-tube-a');
    ok(PI.MATERIALS.includes(mat) && PI.CLASSES[mat].join() === '' && PI.DEFAULT_CLASS[mat] === '' && PI.TABLE_MATERIALS.join() === 'steel,copper,pvc,pex,pvc-sold,pvc-esg,acr', 'the spec is a material of pipes.js with the one class ""; the table materials are as before');
    ok(PI.sizesFor(mat, '').join() === 'DN10,DN15,DN25,DN50' && PI.sizesFor('steel', '40').length === 23, 'the size list of a run in the spec is ONLY the spec\'s sizes (steel keeps its 23)', PI.sizesFor(mat, '').join());
    const p = PI.pipeSize(mat, '', 'DN25');
    ok(p && near(p.od * 25.4, 29, 1e-9) && near(p.id * 25.4, 26, 1e-9) && p.label === 'DN25' && p.metric && p.spec === 'site-tube-a' && p.roughnessMm === 0.0008 && PI.pipeSize(mat, '', '2') === null, 'pipeSize: OD 29, ID 26, the spec\'s roughness; a size the spec does not have is not made');
    ok(near(PI.bendRadius(p) * 25.4, 1.5 * 29, 1e-6) && PI.drainSlope(p) === null, 'elbows at the spec\'s factor × OD (1.5 × 29 mm); no plumbing-code slope is claimed for a spec');
    const sec = M.sectionOf({ kind: 'pipe', mat, cls: '', size: 'DN25' });
    ok(sec && near(sec.od, 29) && near(sec.id, 26) && near(sec.wall, 1.5) && sec.label === 'DN25' && near(sec.R, 43.5), 'sectionOf a run in the spec: 29 × 1.5, bend radius 43.5', JSON.stringify(sec?.label));
    SP.setSystemSpecs({ chw: 'site-tube-a', hw: 'nope', cw: 'inch-tube' });
    const d = M.runDefaults('pipe', 'chw'), d2 = M.runDefaults('pipe', 'chw', 'DN50'), d3 = M.runDefaults('pipe', 'gas');
    ok(d.mat === mat && d.cls === '' && d.size === 'DN25' && d2.size === 'DN50' && d3.mat === 'steel' && !SP.systemSpecs().hw, 'a service given a spec starts its runs in it (DN25: its first size of 20 mm or more; DN50 when asked); other services as before; an unknown spec is dropped', JSON.stringify([d, d3]));
    const f = M.pipeForFlow(mat, '', 1.0, 2.0, 'mm');
    ok(f && f.size === 'DN25' && near(f.id, 26), 'size by flow reads the spec\'s inside diameters: 1 L/s at 2 m/s needs DN25 (ID 26; DN15\'s ID 16 is too small)', JSON.stringify(f));
    SP.setModelSpecs([]); SP.setSystemSpecs({});
    ok(!PI.MATERIALS.some(SP.isSpecMaterial) && PI.CLASSES[mat] === undefined && M.runDefaults('pipe', 'chw').mat === 'steel', 'with no specs in the model the lists are the tables again');

    console.log('== the starter specs (data from fetched pages, marked to be checked)');
    const st = SD.STARTER_SPECS;
    ok(st.length === 4 && st.every((s) => SP.cleanSpec(s).spec && s.source.url.startsWith('https://') && s.source.url2.startsWith('https://') && s.source.fetched === '2026-11-11' && s.source.edition), 'four starters, each with two source pages, the fetch date and what the pages say of the edition');
    ok(st.every((s) => SP.cleanSpec(SD.starterSpec(s.builtin)).spec.check === true && SP.cleanSpec(s).spec.roughness === null), 'each is marked "check against your project standard"; none claims a roughness');
    const bpe = SP.cleanSpec(SD.starterSpec('asme-bpe-tube')).spec, din = SP.cleanSpec(SD.starterSpec('en-10357-a')).spec, enM = SP.cleanSpec(SD.starterSpec('en-10255-m')).spec, enH = SP.cleanSpec(SD.starterSpec('en-10255-h')).spec;
    const row = (s, n) => { const z = s.sizes.find((x) => x.name === n); return z ? z.od + 'x' + z.wall : ''; };
    ok(bpe.sizes.length === 11 && row(bpe, '1/4"') === '6.35x0.89' && row(bpe, '1"') === '25.4x1.65' && row(bpe, '4"') === '101.6x2.11' && row(bpe, '6"') === '152.4x2.77', 'ASME BPE tube: 11 sizes as recorded (1/4" 6.35 × 0.89 … 6" 152.4 × 2.77)');
    ok(din.sizes.length === 13 && row(din, 'DN10') === '13x1.5' && row(din, 'DN50') === '53x1.5' && row(din, 'DN65') === '70x2' && row(din, 'DN200') === '204x2', 'EN 10357 series A / DIN 11850 row 2: 13 sizes as recorded (DN10 13 × 1.5 … DN200 204 × 2)');
    ok(enM.sizes.length === 11 && row(enM, 'DN15') === '21.3x2.6' && row(enM, 'DN50') === '60.3x3.6' && row(enM, 'DN150') === '165.1x5' && enH.sizes.length === 10 && row(enH, 'DN15') === '21.3x3.2' && row(enH, 'DN125') === '139.7x5.4', 'EN 10255 medium (DN15–150) and heavy (DN15–125) as recorded; rows only one page gave are left out');

    console.log('== in-line components and families (DOM-free)');
    ok(IL.inlineKindsFor('pipe').join() === 'gate,ball,butterfly,globe,check,balancing,control,strainer' && IL.inlineKindsFor('duct').join() === 'damper-volume,damper-fire', 'pipes carry gate, ball, butterfly, globe, check, balancing, control, strainer; ducts a volume and a fire damper');
    ok(IL.INLINE.strainer.cls === 'IFCFILTER' && IL.INLINE.strainer.pre === 'STRAINER' && IL.INLINE['damper-fire'].cls === 'IFCDAMPER' && IL.INLINE['damper-fire'].pre === 'FIREDAMPER' && IL.INLINE['damper-volume'].pre === 'BALANCINGDAMPER' && IL.INLINE.balancing.pre === 'COMMISSIONING' && IL.INLINE.butterfly.pre === 'ISOLATING' && M.VALVE_KINDS.gate === 'ISOLATING' && M.VALVE_KINDS.check === 'CHECK',
      'classes: strainer IfcFilter STRAINER, dampers IfcDamper BALANCINGDAMPER / FIREDAMPER, balancing COMMISSIONING, butterfly ISOLATING');
    ok(IL.inlineLength('gate', { od: 60.3 }) === 150.75 && IL.inlineLength('gate', { od: 21.3 }) === 75 && IL.inlineLength('butterfly', { od: 114.3 }) < IL.inlineLength('gate', { od: 114.3 }) && IL.inlineLength('damper-fire', { w: 400 }) === 300, 'schematic lengths: a gate valve 2.5 × OD (at least 75 mm, as since 0.6), a butterfly shorter, a fire damper 300 mm');
    const body = { positions: [0, -20, -20, 100, -20, -20, 100, 20, -20, 0, 20, -20, 0, -20, 20, 100, -20, 20, 100, 20, 20, 0, 20, 20], indices: [0, 3, 2, 0, 2, 1, 4, 5, 6, 4, 6, 7, 0, 1, 5, 0, 5, 4, 1, 2, 6, 1, 6, 5, 2, 3, 7, 2, 7, 6, 3, 0, 4, 3, 4, 7] };
    const fam = OF.cleanFamily({ name: 'ACME V100 DN25', maker: 'ACME', model: 'V100', base: 'ball', body, ports: [{ name: 'in', x: 0, y: 0, z: 0, axis: [-1, 0, 0], size: 29, nominal: 'DN25', end: 'clamp' }, { name: 'out', x: 100, y: 0, z: 0, axis: [2, 0, 0], size: 29, nominal: 'DN25' }] }).family;
    const fr = OF.inlineFrame(fam);
    ok(fam && fam.id === 'acme-v100-dn25' && fam.role === 'inline' && fr.ok && fr.L === 100 && fr.kind === 'pipe' && fam.ports[1].axis.join() === '1,0,0', 'a family with two opposed ports 100 mm apart is an in-line family of length 100');
    const pl = OF.placeInline(fam, [1000, 2000, 300], [0, 1, 0]);
    ok(pl.map([100, 0, 0]).join() === '1000,2100,300' && pl.map([0, 0, 20]).join() === '1000,2000,320', 'placed on a run going +Y: its second port 100 mm along the run, its top still up');
    ok(OF.sizeFits(fam, { kind: 'pipe', od: 29, label: 'DN25', p: { size: 'DN25' } }).ok && !OF.sizeFits(fam, { kind: 'pipe', od: 53, label: 'DN50', p: { size: 'DN50' } }).ok, 'sizeFits: its 29 mm ports fit a DN25 run of the spec, not a DN50 one');
    const bent = OF.cleanFamily({ name: 'Angle', body, ports: [{ name: 'a', x: 0, y: 0, z: 0, axis: [-1, 0, 0], size: 29 }, { name: 'b', x: 50, y: 0, z: -40, axis: [0, 0, -1], size: 29 }] }).family;
    ok(OF.inlineFrame(bent).error === 'mep.oem.err.inline' && OF.inlineFrame({ ...fam, ports: fam.ports.slice(0, 1) }).error === 'mep.oem.err.twoports', 'an angle pattern or a single port is not in-line (said, never forced onto a run)');
    ok(OF.cleanFamily({ name: 'x', body: { positions: [0, 0, 0], indices: [0, 0, 0] } }).error === 'mep.oem.err.body' && OF.cleanFamily({ name: 'x', body, ports: [{ name: 'a', x: 0, y: 0, z: 0, axis: [0, 0, 0], size: 10 }] }).error === 'mep.oem.err.portaxis', 'a broken mesh or a port with no direction is refused');
    const LI = await import(path.join(APP, 'libitem.js'));
    const item = OF.familyToLibraryItem(fam), v = LI.validateItem(item, { partial: true });
    ok(!(v.errors || []).length && item.ports.length === 2 && item.category === 'piping/valves', 'the family as a LibraryCraft item with its ports validates (the file the Library flow takes)', JSON.stringify(v.errors || []).slice(0, 300));
    const again = OF.cleanFamily(OF.familyFromItem(item, { file: 'x.json', format: 'json' }));
    ok(again.family && again.family.ports.length === 2 && OF.inlineFrame(again.family).ok && again.family.base === 'ball', 'and that item comes back as the same in-line family');
    ok(E.EQUIPMENT.radiator.cls.join(' ') === 'IFCSPACEHEATER IFCSPACEHEATERTYPE RADIATOR IFCENERGYCONVERSIONDEVICE IFCSPACEHEATERTYPE PANELRADIATOR' && E.EQUIPMENT.convector.cls[2] === 'CONVECTOR' && E.EQUIPMENT.ahu.cls[2] === 'AIRHANDLER' && E.EQUIPMENT.diffuser.cls[2] === 'DIFFUSER' && E.EQUIPMENT.grille.cls[2] === 'GRILLE',
      'equipment classes: radiator IfcSpaceHeater RADIATOR, convector CONVECTOR; air handler AIRHANDLER, diffuser DIFFUSER, grille GRILLE (already there)');
    const rad = E.buildEquipment('radiator', {}).built.ports;
    ok(rad.map((q) => q.name + ':' + q.system + ':' + q.direction).join() === 'flow:hhw:in,return:hhw:out' && rad[0].nominal === '1/2', 'a radiator has a flow and a return connection, heating water, 1/2"');
  }

  // ============================================================================================ 2. in the model
  if (want('model')) for (const schema of ['IFC4', 'IFC2X3']) {
    console.log('== ' + schema + ': specs kept in the model, runs drawn in them');
    const eng = await quiet(IfcModel.create)(WebIFC, null);
    const bytes0 = schema === 'IFC2X3' ? fs.readFileSync(path.join(ROOT, 'tools/detailcraft-test/fixtures/ios-steel-ifc2x3.ifc'))
      : new TextEncoder().encode(N.newBuilding({ name: 'SPEC', levels: N.stackLevels(1, 3000, () => 'Level 1'), fileName: 's.ifc', now: new Date('2026-11-11T12:00:00Z') }));
    await quiet((x) => eng.load(x))(bytes0);
    const ed = new IfcEditor(WebIFC, eng), w = () => new ModelWriter(WebIFC, ed.api, ed.mid);
    const go = (op, label) => ed.modelChange(op, { label });
    const L1 = U.val(ed.api.GetLine(ed.mid, U.ids(ed.api, ed.mid, 'IFCBUILDINGSTOREY')[0], false).GlobalId);
    const count = (cls) => { try { return U.ids(ed.api, ed.mid, cls).length; } catch (e) { return 0; } };
    const spec = SP.specFromCsv(CSV).spec, mat = SP.specMaterial(spec.id);
    M.readRuns(w());
    ok(SP.modelSpecs().length === 0, 'a model with no specs: none in force');
    go(SM.saveSpecs([spec, SP.cleanSpec(SD.starterSpec('asme-bpe-tube')).spec], { chw: spec.id }), 'specs');
    ok(SP.modelSpecs().length === 2 && SP.systemSpecs().chw === spec.id, 'two specs saved, chilled water given one');
    ed.undo(); M.readRuns(w());
    ok(SP.modelSpecs().length === 0, 'one Undo takes them back');
    ed.redo(); M.readRuns(w());
    ok(SP.modelSpecs().length === 2 && PI.sizesFor(mat, '').length === 4, 'Redo puts them back');
    const d = M.runDefaults('pipe', 'chw');
    const g1 = [...go(M.placeRun({ storey: L1, kind: 'pipe', system: 'chw', mat: d.mat, cls: d.cls, size: d.size, points: [[0, 0, 2700], [4000, 0, 2700], [4000, 3000, 2700]] }), 'run').made.keys()][0];
    let r = M.readRuns(w()).find((x) => x.guid === g1);
    ok(r && r.mat === mat && r.size === 'DN25' && r.parts.length === 3, 'a chilled-water run is drawn in the spec: 2 pipes and an elbow', JSON.stringify(r && [r.mat, r.size, r.parts.length]));
    const seg = r.parts.map((id) => ({ id, ps: w().readPset(id, 'CadCraft_Pipe') })).find((x) => x.ps);
    const common = w().readPset(seg.id, 'Pset_PipeSegmentTypeCommon'), sps = w().readPset(seg.id, 'CadCraft_PipeSpec'), k = w().unitMm;
    ok(common && near(common.OuterDiameter * k, 29, 1e-3) && near(common.InnerDiameter * k, 26, 1e-3) && near(common.NominalDiameter * k, 25, 1e-3), 'the segment: Pset_PipeSegmentTypeCommon NominalDiameter 25, OuterDiameter 29, InnerDiameter 26', JSON.stringify(common));
    ok(sps && sps.Spec === 'Site tube A' && sps.Standard === 'Company spec PS-12 rev C' && sps.Material === 'Stainless 316L' && sps.Joint === 'orbital' && sps.PressureRating === 'PN16' && sps.CheckAgainstProjectStandard === true, 'and CadCraft_PipeSpec: the spec\'s name, standard, material, joint, pressure rating, "check" mark', JSON.stringify(sps));
    // the type carries the dimensions (HasPropertySets)
    const types = U.ids(ed.api, ed.mid, 'IFCPIPESEGMENTTYPE').map((id) => ed.api.GetLine(ed.mid, id, false)).filter((t) => U.val(t.Name) === 'Site tube A DN25');
    const tsets = types.length === 1 ? (types[0].HasPropertySets || []).map((h) => ed.api.GetLine(ed.mid, h.value, false)) : [];
    const tprops = (name) => { const ps = tsets.find((x) => U.val(x.Name) === name); const o = {}; for (const h of ps?.HasProperties || []) { const pr = ed.api.GetLine(ed.mid, h.value, false); o[U.val(pr.Name)] = U.val(pr.NominalValue); } return o; };
    ok(types.length === 1 && near(tprops('Pset_PipeSegmentTypeCommon').OuterDiameter * k, 29, 1e-3) && near(tprops('Pset_PipeSegmentTypeCommon').InnerDiameter * k, 26, 1e-3) && tprops('CadCraft_PipeSpec').Spec === 'Site tube A', 'the IfcPipeSegmentType "Site tube A DN25" carries the same dimensions and the spec name', JSON.stringify(tprops('Pset_PipeSegmentTypeCommon')));
    const mats = U.ids(ed.api, ed.mid, 'IFCMATERIAL').map((id) => U.val(ed.api.GetLine(ed.mid, id, false).Name));
    ok(mats.includes('Stainless 316L'), 'the material is the spec\'s: Stainless 316L');
    // the size list of the run, a size change, a size the spec does not have
    go(M.changeRun(g1, { size: 'DN50' }), 'size');
    r = M.readRuns(w()).find((x) => x.guid === g1);
    ok(r.size === 'DN50' && near(M.sectionOf(r).od, 53) && key(() => go(M.changeRun(g1, { size: '2' }), 'bad')) === 'mep.err.size', 'the run takes another size of the spec (DN50, 53 mm); a size the spec does not have is refused');
    // sizing: ID and roughness from the spec
    const toWorld = M.worldOf(w(), r.storey, new Map());   // the IFC2X3 fixture's storey is not at the world origin
    const calc = CALC.calcPipes(w(), { system: 'chw', extraLoads: [{ key: 'L', lps: 1.2, p: toWorld([4000, 3000, 2700]), label: 'load' }], source: toWorld([0, 0, 2700]) });
    const sg = calc.ok ? calc.res.segs.find((x) => x.flow > 0) : null;
    const wantRate = sg ? FL.darcyWater(sg.flow, 0.050, 0.0008 / 1000) : 0;
    ok(calc.ok && sg && near(sg.D, 0.050, 1e-9) && sg.method === 'darcy' && sg.epsMm === 0.0008 && near(sg.rate, wantRate, 1e-9) && !near(sg.rate, FL.hazenWilliams(sg.flow, 0.050, 130), 1e-6), 'the pressure-drop calculation reads the spec: ID 50 mm, Darcy–Weisbach at its roughness 0.0008 mm (not a material default)', JSON.stringify(sg && [sg.D, sg.method, sg.rate]).slice(0, 120));
    // the spec's numbers change: the run is made again
    const spec2 = { ...spec, sizes: spec.sizes.map((z) => (z.name === 'DN50' ? { ...z, od: 54, wall: 2, id: undefined } : z)) };
    go(SM.saveSpecs([spec2, SP.modelSpecs()[1]], { chw: spec.id }), 'edit');
    r = M.readRuns(w()).find((x) => x.guid === g1);
    const seg2 = r.parts.map((id) => w().readPset(id, 'Pset_PipeSegmentTypeCommon')).find(Boolean);
    ok(near(seg2.OuterDiameter * k, 54, 1e-3) && near(seg2.InnerDiameter * k, 50, 1e-3), 'editing the spec (DN50 now 54 × 2) makes the run again at the new size', JSON.stringify(seg2));
    ok(key(() => go(SM.saveSpecs([SP.modelSpecs()[1]], {}), 'del')) === 'mep.spec.err.inuse' && key(() => go(SM.saveSpecs([{ ...spec2, sizes: spec2.sizes.filter((z) => z.name !== 'DN50') }], {}), 'del')) === 'mep.spec.err.sizeinuse' && M.readRuns(w()).length === 1, 'a spec, or a size of it, that a run is drawn in cannot be deleted');

    console.log('== ' + schema + ': valves, a strainer and dampers on a run');
    const run0 = M.readRuns(w()).find((x) => x.guid === g1), parts0 = run0.parts.length, len0 = M.runLength(run0);
    let at = 400;
    for (const kind of IL.inlineKindsFor('pipe')) { go(M.addValve(g1, at, kind), kind); at += 420; }
    r = M.readRuns(w()).find((x) => x.guid === g1);
    ok(r.valves.length === 8 && r.parts.length === parts0 + 16, 'eight components cut in: each adds itself and one more piece of pipe (' + r.parts.length + ' parts)');
    const chk = C.checkConnections(w());
    ok(!chk.issues.some((i) => i.level === 'error') && chk.issues.filter((i) => i.code === 'open-end').length === 2, 'both sides of every component stay connected: only the run\'s two ends are open', JSON.stringify(chk.issues.map((i) => i.code)));
    if (schema === 'IFC4') ok(count('IFCVALVE') === 7 && count('IFCFILTER') === 1, 'IFC4: seven IfcValve and one IfcFilter (the strainer)', count('IFCVALVE') + ' ' + count('IFCFILTER'));
    else ok(count('IFCFLOWCONTROLLER') === 7 && count('IFCFLOWTREATMENTDEVICE') === 1 && count('IFCFILTERTYPE') === 1, 'IFC2X3: seven IfcFlowController and one IfcFlowTreatmentDevice typed IfcFilterType');
    const vps = r.parts.map((id) => w().readPset(id, 'CadCraft_Valve')).filter(Boolean);
    ok(vps.length === 8 && vps.every((x) => x.Generic === true && x.Spec === 'Site tube A' && x.Size === 'DN50') && near(vps.find((x) => x.Kind === 'gate').Length * k, 2.5 * 54, 0.01), 'each says its kind, the run\'s size and spec, and that its body is generic (a gate valve 2.5 × OD long)');
    const sch = M.runSchedules(w());
    ok(sch.fittings.filter((x) => x.valve).length === 8 && sch.fittings.filter((x) => x.valve).every((x) => x.n === 1 && x.size === 'DN50') && sch.pipes.length === 1 && sch.pipes[0].size === 'DN50' && sch.pipes[0].mat === mat, 'the schedules count them by kind and size, and the pipe by the spec\'s size');
    // remove them all: the run heals
    for (let i = 7; i >= 0; i--) go(M.removeValve(g1, i), 'remove');
    r = M.readRuns(w()).find((x) => x.guid === g1);
    ok(r.valves.length === 0 && r.parts.length === parts0 && near(M.runLength(r), len0, 1e-6) && count(schema === 'IFC4' ? 'IFCFILTER' : 'IFCFLOWTREATMENTDEVICE') === 0, 'removed: the run is its ' + parts0 + ' parts again, nothing left over');
    ok(key(() => go(M.addValve(g1, 500, 'damper-fire'), 'x')) === 'mep.err.valve.pipe', 'a damper on a pipe is refused');
    const gd = [...go(M.placeRun({ storey: L1, kind: 'duct', system: 'supply', shape: 'rect', w: 400, h: 300, points: [[0, 6000, 3000], [5000, 6000, 3000]] }), 'duct').made.keys()][0];
    go(M.addValve(gd, 1500, 'damper-volume'), 'vd'); go(M.addValve(gd, 3500, 'damper-fire'), 'fd');
    let rd = M.readRuns(w()).find((x) => x.guid === gd);
    ok(rd.parts.length === 5 && (schema === 'IFC4' ? count('IFCDAMPER') === 2 : count('IFCDAMPERTYPE') === 2) && key(() => go(M.addValve(gd, 800, 'gate'), 'x')) === 'mep.err.valve.duct', 'a volume and a fire damper on a duct (5 parts' + (schema === 'IFC4' ? ', two IfcDamper' : ', two IfcDamperType') + '); a gate valve on a duct is refused');
    go(M.changeRun(gd, { points: [[0, 7000, 3000], [5000, 7000, 3000]] }), 'move');
    rd = M.readRuns(w()).find((x) => x.guid === gd);
    const dports = P.readPorts(w()).filter((q) => q.run === gd);
    ok(rd.valves.length === 2 && dports.every((q) => near(q.at[1], 7000, 0.01)) && dports.filter((q) => !q.connectedTo).length === 2, 'the dampers move with the run and stay connected');
    go(M.removeValve(gd, 0), 'r'); go(M.removeValve(gd, 0), 'r');
    ok(M.readRuns(w()).find((x) => x.guid === gd).parts.length === 1, 'removed: the duct is one piece again');

    console.log('== ' + schema + ': a manufacturer\'s family on the run, and as equipment');
    const body = { positions: [0, -20, -20, 100, -20, -20, 100, 20, -20, 0, 20, -20, 0, -20, 20, 100, -20, 20, 100, 20, 20, 0, 20, 20], indices: [0, 3, 2, 0, 2, 1, 4, 5, 6, 4, 6, 7, 0, 1, 5, 0, 5, 4, 1, 2, 6, 1, 6, 5, 2, 3, 7, 2, 7, 6, 3, 0, 4, 3, 4, 7] };
    const famRaw = { name: 'ACME V100 DN50', maker: 'ACME', model: 'V100-50', base: 'ball', body, ports: [{ name: 'in', x: 0, y: 0, z: 0, axis: [-1, 0, 0], size: 54, nominal: 'DN50', end: 'clamp', system: 'chw' }, { name: 'out', x: 100, y: 0, z: 0, axis: [1, 0, 0], size: 54, nominal: 'DN50', system: 'chw' }] };
    go(SM.saveFamily(famRaw), 'family');
    M.readRuns(w());
    const fam = OF.familyById('acme-v100-dn50');
    ok(fam && OF.modelFamilies().length === 1 && fam.rev === 1, 'the family is kept in the model');
    go(M.addValve(g1, 1000, 'oem', fam.id), 'oem');
    r = M.readRuns(w()).find((x) => x.guid === g1);
    const fv = r.parts.map((id) => ({ id, ps: w().readPset(id, 'CadCraft_Valve') })).find((x) => x.ps);
    ok(r.parts.length === parts0 + 2 && fv && fv.ps.Family === 'ACME V100 DN50' && fv.ps.Maker === 'ACME' && fv.ps.Generic === false && near(fv.ps.Length * k, 100, 1e-3), 'placed on the run like a valve: it cuts in at its own length (100 mm between its ports), not a generic body', JSON.stringify(fv?.ps));
    const fp = P.readPorts(w()).filter((q) => q.owner === fv.id);
    ok(fp.length === 2 && fp.every((q) => q.connectedTo) && near(Math.abs(fp[0].at[0] - fp[1].at[0]), 100, 0.01), 'the pipes either side connect to its two ports, 100 mm apart');
    ok(String(ed.api.GetNameFromTypeCode(ed.api.GetLine(ed.mid, fv.id, false).type)).toUpperCase() === (schema === 'IFC4' ? 'IFCVALVE' : 'IFCFLOWCONTROLLER'), 'written as the class it stands for (a ball valve: ' + (schema === 'IFC4' ? 'IfcValve ISOLATING' : 'IfcFlowController') + ')');
    ok(OF.sizeFits(fam, M.sectionOf(r)).ok && !OF.sizeFits(fam, M.sectionOf({ ...r, size: 'DN25' })).ok, 'its 54 mm ports fit this DN50 run; on a DN25 run the app is told they do not');
    // on a run of another size it is still drawn at its own size, and the Connections check says so; a spec without tees says so too
    go(M.changeRun(g1, { size: 'DN25' }), 'smaller');
    const fv2 = M.readRuns(w()).find((x) => x.guid === g1).parts.map((id) => w().readPset(id, 'CadCraft_Valve')).find(Boolean);
    const chkF = C.checkConnections(w()).issues.filter((i) => i.code === 'family-size');
    ok(near(fv2.Length * k, 100, 1e-3) && chkF.length === 1 && chkF[0].level === 'warn' && chkF[0].fill.name === 'ACME V100 DN50' && chkF[0].fill.want === 'DN25', 'on a DN25 run it keeps its own 100 mm (never stretched) and the Connections check warns of the size', JSON.stringify(chkF.map((i) => i.fill)));
    go(M.changeRun(g1, { size: 'DN50' }), 'back');
    const gt = [...go(M.placeRun({ storey: L1, kind: 'pipe', system: 'chw', mat, cls: '', size: 'DN50', points: [[2500, -1500, 2700], [2500, 0, 2700]] }), 'branch').made.keys()][0];
    go(SM.saveSpecs([{ ...SP.specById(spec.id), tees: false }, SP.modelSpecs()[1]], { chw: spec.id }), 'no tees');
    const chkT = C.checkConnections(w()).issues.filter((i) => i.code === 'spec-fitting');
    ok(chkT.length === 1 && chkT[0].fill.what === 'tee' && chkT[0].fill.name === 'Site tube A', 'a spec set to have no tees: the tee a branch made is listed by the Connections check', JSON.stringify(chkT.map((i) => i.fill)));
    go(M.removeRuns([gt]), 'branch away'); go(SM.saveSpecs([{ ...SP.specById(spec.id), tees: true }, SP.modelSpecs()[1]], { chw: spec.id }), 'tees again');
    ok(key(() => go(SM.removeFamily(fam.id), 'x')) === 'mep.oem.err.inuse', 'a family that is placed cannot be deleted');
    go(M.removeValve(g1, 0), 'r');
    ok(M.readRuns(w()).find((x) => x.guid === g1).parts.length === parts0, 'removed: the run heals');
    // as equipment: a family with role equipment, a run fixed to its port
    go(SM.saveFamily({ ...famRaw, name: 'ACME skid', role: 'equipment', base: 'pump' }), 'family 2');
    M.readRuns(w());
    const eqg = [...go(E.placeEquipment({ storey: L1, kind: 'oem', values: { family: 'acme-skid' }, x: 8000, y: 0, z: 1000, rot: 0, tag: 'SK-1', name: 'ACME skid' }), 'eq').made.keys()][0];
    const eq = E.readEquipment(w()).find((x) => x.guid === eqg), pout = E.portsAt(eq).find((q) => q.name === 'out');
    go(M.placeRun({ storey: L1, kind: 'pipe', system: 'chw', mat, cls: '', size: 'DN50', points: [pout.at, [pout.at[0] + 1500, pout.at[1], pout.at[2]]], ends: [{ eq: eqg, port: 'out' }, null] }), 'run to skid');
    const eqPorts = P.readPorts(w()).filter((q) => q.owner === eq.id);
    ok(eq && eqPorts.length === 2 && eqPorts.find((q) => q.portName === 'out').connectedTo && !eqPorts.find((q) => q.portName === 'in').connectedTo, 'the same model as equipment: placed with its two ports, a run fixed to one of them is connected');
    ok(String(ed.api.GetNameFromTypeCode(ed.api.GetLine(ed.mid, eq.id, false).type)).toUpperCase() === (schema === 'IFC4' ? 'IFCPUMP' : 'IFCFLOWMOVINGDEVICE'), 'written as the class chosen for it (a pump)');

    console.log('== ' + schema + ': radiator, convector, air handler and air terminals');
    const place = (kind, x, z = 0) => [...go(E.placeEquipment({ storey: L1, kind, values: {}, x, y: -6000, z, rot: 0, tag: kind, name: kind }), kind).made.keys()][0];
    const rg = place('radiator', 0, 150), cg = place('convector', 3000), ag = place('ahu', 8000), dg = place('diffuser', 12000, 2700), gg = place('grille', 14000, 2700);
    const eqs = E.readEquipment(w()), byG = (g) => eqs.find((x) => x.guid === g);
    const cls = (g) => String(ed.api.GetNameFromTypeCode(ed.api.GetLine(ed.mid, byG(g).id, false).type)).toUpperCase(), pre = (g) => U.val(ed.api.GetLine(ed.mid, byG(g).id, false).PredefinedType);
    if (schema === 'IFC4') ok(cls(rg) === 'IFCSPACEHEATER' && pre(rg) === 'RADIATOR' && cls(cg) === 'IFCSPACEHEATER' && pre(cg) === 'CONVECTOR' && cls(ag) === 'IFCUNITARYEQUIPMENT' && pre(ag) === 'AIRHANDLER' && cls(dg) === 'IFCAIRTERMINAL' && pre(dg) === 'DIFFUSER' && pre(gg) === 'GRILLE',
      'IFC4 classes: IfcSpaceHeater RADIATOR / CONVECTOR, IfcUnitaryEquipment AIRHANDLER, IfcAirTerminal DIFFUSER / GRILLE', [cls(rg), pre(rg), cls(cg), pre(cg)].join(' '));
    else ok(cls(rg) === 'IFCENERGYCONVERSIONDEVICE' && count('IFCSPACEHEATERTYPE') === 2 && cls(dg) === 'IFCFLOWTERMINAL', 'IFC2X3: IfcEnergyConversionDevice typed IfcSpaceHeaterType (two types), terminals IfcFlowTerminal');
    const fl = E.portsAt(byG(rg)).find((q) => q.name === 'flow'), rt = E.portsAt(byG(rg)).find((q) => q.name === 'return');
    go(M.placeRun({ storey: L1, kind: 'pipe', system: 'hhw', mat: 'steel', cls: '40', size: '1/2', points: [[fl.at[0] - 1500, fl.at[1], fl.at[2]], fl.at], ends: [null, { eq: rg, port: 'flow' }] }), 'flow');
    go(M.placeRun({ storey: L1, kind: 'pipe', system: 'hhw', mat: 'steel', cls: '40', size: '1/2', points: [rt.at, [rt.at[0] + 800, rt.at[1], rt.at[2]]], ends: [{ eq: rg, port: 'return' }, null] }), 'return');
    const nk = E.portsAt(byG(dg)).find((q) => q.name === 'neck');
    go(M.placeRun({ storey: L1, kind: 'duct', system: 'supply', shape: 'round', w: 250, h: 250, points: [[nk.at[0], nk.at[1] + 2000, nk.at[2] + 400], [nk.at[0], nk.at[1], nk.at[2] + 400], nk.at], ends: [null, { eq: dg, port: 'neck' }] }), 'to diffuser');
    const pr = P.readPorts(w());
    ok(pr.filter((q) => q.owner === byG(rg).id).every((q) => q.connectedTo) && pr.filter((q) => q.owner === byG(dg).id).every((q) => q.connectedTo), 'pipes connect to the radiator\'s flow and return, a duct to the diffuser\'s neck');
    const chk2 = C.checkConnections(w());
    ok(!chk2.issues.some((i) => i.level === 'error'), 'the Connections check finds no size, kind or system error', JSON.stringify(chk2.issues.filter((i) => i.level === 'error').map((i) => [i.code, i.fill])).slice(0, 300));
    go(E.changeEquipment(rg, { x: 500 }), 'move radiator');
    ok(P.readPorts(w()).filter((q) => q.owner === byG(rg).id).every((q) => q.connectedTo), 'moved: the pipes follow the radiator and stay connected');

    console.log('== ' + schema + ': saved and opened again');
    go(M.addValve(g1, 900, 'butterfly'), 'bf'); go(M.addValve(g1, 1700, 'oem', fam.id), 'oem'); go(M.addValve(gd, 2000, 'damper-fire'), 'fd');
    const out = ed.save(), file = path.join(tmp, schema + '.ifc');
    fs.writeFileSync(file, out);
    const txt = new TextDecoder().decode(out);
    ok(/CadCraft_MepPipeSpecs/.test(txt) && /CadCraft_MepFamilies/.test(txt) && /Site tube A/.test(txt), 'the file carries the specs and the families');
    SP.setModelSpecs([]); OF.setModelFamilies([]);
    const eng2 = await quiet(IfcModel.create)(WebIFC, null);
    await quiet((x) => eng2.load(x))(out);
    const ed2 = new IfcEditor(WebIFC, eng2), w2 = () => new ModelWriter(WebIFC, ed2.api, ed2.mid);
    const runs2 = M.readRuns(w2()), r2 = runs2.find((x) => x.guid === g1);
    ok(SP.modelSpecs().length === 2 && SP.systemSpecs().chw === spec.id && SP.specById(spec.id).sizes.find((z) => z.name === 'DN50').od === 54 && OF.modelFamilies().length === 2, 'opened again: both specs (with the edited DN50), the service\'s spec and both families are in force');
    ok(r2 && r2.mat === mat && r2.size === 'DN50' && near(M.sectionOf(r2).od, 54) && r2.valves.map((v) => v.kind).join() === 'butterfly,oem' && r2.valves[1].fam === fam.id && runs2.find((x) => x.guid === gd).valves[0].kind === 'damper-fire', 'the run is still in its spec with its butterfly valve and its family; the duct has its fire damper');
    const eq2 = E.readEquipment(w2());
    ok(eq2.filter((x) => ['radiator', 'convector', 'ahu', 'diffuser', 'grille', 'oem'].includes(x.kind)).length === 6 && C.checkConnections(w2()).issues.filter((i) => i.level === 'error').length === 0, 'the radiator, convector, air handler, terminals and the family placed as equipment read back; connections still without errors');
    // a change after reopening writes nothing it should not: the run is not made again by merely reading
    const before = r2.parts.join();
    ed2.modelChange(M.changeRun(gd, { points: [[0, 7100, 3000], [5000, 7100, 3000]] }), { label: 'move duct' });
    ok(M.readRuns(w2()).find((x) => x.guid === g1).parts.join() === before, 'editing another run after reopening leaves the spec run\'s parts as they were (its fingerprint is stable across save and open)');
    if (PY) {
      let outp = '';
      try { outp = execFileSync(PY, ['-I', path.join(ROOT, 'tools/bimcraft-test/pipespecs_check.py'), file], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }); } catch (e) { outp = String(e.stdout || '') + String(e.stderr || ''); }
      let j = null; try { j = JSON.parse(outp.trim().split('\n').pop()); } catch (e) { j = { error: outp.slice(0, 400) }; }
      const c = j.classes || {};
      if (schema === 'IFC4') ok(!j.error && c.IfcValve >= 2 && c.IfcDamper === 1 && c.IfcSpaceHeater === 2 && c.IfcAirTerminal === 2 && c.IfcUnitaryEquipment >= 1 && j.predefined.includes('IfcSpaceHeater:RADIATOR') && j.predefined.includes('IfcSpaceHeater:CONVECTOR') && j.predefined.includes('IfcDamper:FIREDAMPER') && j.predefined.includes('IfcAirTerminal:DIFFUSER') && j.predefined.includes('IfcAirTerminal:GRILLE') && j.predefined.includes('IfcUnitaryEquipment:AIRHANDLER'),
        'IfcOpenShell reads the file: IfcValve, IfcDamper FIREDAMPER, IfcSpaceHeater RADIATOR + CONVECTOR, IfcAirTerminal DIFFUSER + GRILLE, IfcUnitaryEquipment AIRHANDLER', JSON.stringify(j).slice(0, 500));
      else ok(!j.error && c.IfcFlowController >= 3 && c.IfcEnergyConversionDevice >= 3 && j.types.includes('IfcDamperType:FIREDAMPER') && j.types.includes('IfcSpaceHeaterType:PANELRADIATOR') && j.types.includes('IfcSpaceHeaterType:CONVECTOR'), 'IfcOpenShell reads the IFC2X3 file: flow controllers and energy conversion devices typed IfcDamperType FIREDAMPER, IfcSpaceHeaterType PANELRADIATOR / CONVECTOR', JSON.stringify(j).slice(0, 500));
      ok(!j.error && j.schema_errors === 0, 'IfcOpenShell\'s schema validation finds no error in what was written', JSON.stringify(j.first_errors || j.error).slice(0, 600));
      ok(!j.error && j.spec_segment && near(j.spec_segment.OuterDiameter, 54, 0.01) && near(j.spec_segment.InnerDiameter, 50, 0.01) && j.spec_segment.type_name === 'Site tube A DN50' && near(j.spec_segment.type_OuterDiameter, 54, 0.01) && j.spec_segment.material === 'Stainless 316L',
        'and the spec pipe: OuterDiameter 54, InnerDiameter 50 on the segment and on its type "Site tube A DN50", material Stainless 316L', JSON.stringify(j.spec_segment));
      ok(!j.error && j.valve_ports_connected === true && j.open_valve_ports === 0, 'every valve and damper has two ports, each connected', JSON.stringify([j.valve_ports_connected, j.open_valve_ports]));
    } else console.log('  note  no IfcOpenShell venv: the class read-back and schema validation were skipped');
    SP.setModelSpecs([]); SP.setSystemSpecs({}); OF.setModelFamilies([]);
  }
  fs.rmSync(tmp, { recursive: true, force: true });
  console.log('\n' + good + ' ok, ' + bad + ' failed');
  return bad ? 1 : 0;
}
