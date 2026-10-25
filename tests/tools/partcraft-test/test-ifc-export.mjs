#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-ifc-export.mjs — IFC4 export with every property (0.5 WL.32; ifc-export.js), read back by IfcOpenShell (a second,
 * independent reader: tools/detailcraft-test/venv, else skipped):
 *   - a part (the flange on the mesh kernel) with a material, three parameters (one a formula with a note), a filled title
 *     block, an active configuration: the file passes IfcOpenShell's schema validation; one IfcBuildingElementProxy with the
 *     part's name and its drawing number as Tag; property sets PartCraft_Part (material, density 7850 kg/m³, configuration),
 *     PartCraft_Parameters (every parameter's value, a formula's expression), PartCraft_TitleBlock (every filled field);
 *     quantities NetVolume = the part's volume (m³), NetWeight = ρV, the box (IFC axes, Z up); IfcMaterial associated;
 *     the body's own volume computed from IfcOpenShell's triangles = the mesh's; Z up (the flange's axis is IFC's Z);
 *     exporting twice gives the same GlobalIds;
 *   - an assembly (2 flanges + 1 block): one IfcElementAssembly aggregating 3 occurrences, 2 types (one per part) holding the
 *     part properties (part number, description), each occurrence's PartCraft_Instance values (name, id, BOM item,
 *     grounded) and quantities; every occurrence's geometry where PartCraft places it (its centre from IfcOpenShell's world
 *     coordinates = the instance's matrix × the part's centre, Y up → Z up);
 *   - strings with quotes, a backslash and non-ASCII come back intact.
 *   node tools/partcraft-test/test-ifc-export.mjs [--verbose] [--keep]    (or runIfcExportTests() from bin/test-partcraft.mjs)
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '../..');
const DEV = path.join(REPO, 'public_html/assets/apps/partcraft/dev/');
const PY = path.join(REPO, 'tools/detailcraft-test/venv/bin/python');

const READER = String.raw`
import sys, json
import ifcopenshell, ifcopenshell.validate, ifcopenshell.util.element as U, ifcopenshell.geom as G
f = ifcopenshell.open(sys.argv[1])
log = ifcopenshell.validate.json_logger()
ifcopenshell.validate.validate(f, log)
st = G.settings(); st.set(st.USE_WORLD_COORDS, True)
def vol(sh):   # IfcOpenShell's coordinates are metres: back to millimetres
    v = [x * 1000 for x in sh.geometry.verts]; fa = sh.geometry.faces; s = 0.0
    for i in range(0, len(fa), 3):
        a = v[3*fa[i]:3*fa[i]+3]; b = v[3*fa[i+1]:3*fa[i+1]+3]; c = v[3*fa[i+2]:3*fa[i+2]+3]
        s += (a[0]*(b[1]*c[2]-b[2]*c[1]) - a[1]*(b[0]*c[2]-b[2]*c[0]) + a[2]*(b[0]*c[1]-b[1]*c[0])) / 6
    return s
def box(sh):
    v = [x * 1000 for x in sh.geometry.verts]; xs = v[0::3]; ys = v[1::3]; zs = v[2::3]
    return [min(xs), min(ys), min(zs), max(xs), max(ys), max(zs)]
out = { 'schema': f.schema, 'errors': [str(e.get('message', e))[:200] for e in log.statements][:10], 'elements': [], 'types': [] }
for el in f.by_type('IfcBuildingElementProxy') + f.by_type('IfcElementAssembly'):
    rec = { 'cls': el.is_a(), 'name': el.Name, 'tag': el.Tag, 'gid': el.GlobalId, 'psets': U.get_psets(el), 'type': (U.get_type(el).Name if U.get_type(el) else None),
            'material': (U.get_material(el).Name if U.get_material(el) else None), 'container': (U.get_container(el).Name if U.get_container(el) else None),
            'aggregate': (U.get_aggregate(el).Name if U.get_aggregate(el) else None) }
    if el.Representation:
        sh = G.create_shape(st, el)
        rec['volume'] = vol(sh); rec['box'] = box(sh)
    out['elements'].append(rec)
for ty in f.by_type('IfcBuildingElementProxyType'):
    out['types'].append({ 'name': ty.Name, 'tag': ty.Tag, 'psets': U.get_psets(ty) })
print(json.dumps(out))
`;

export async function runIfcExportTests({ ok, section, skip = (m) => console.log('  skip ' + m), keep = false }) {
  const I18N = await import(DEV + 'i18n.js');
  I18N.init({ locale: 'en', strings: JSON.parse(fs.readFileSync(DEV + 'lang/en.json', 'utf8')) });
  const F = await import(path.join(HERE, 'fixtures.mjs'));
  const K = await import(DEV + 'kernel.js'), P = await import(DEV + 'part.js'), A = await import(DEV + 'assembly.js'), V = await import(DEV + 'vec.js');
  const BOM = await import(DEV + 'bom.js'), PR = await import(DEV + 'params.js'), X = await import(DEV + 'ifc-export.js');
  const { default: Module } = await import(path.join(REPO, 'public_html/assets/vendor/manifold-3d/current/manifold.js'));
  const M = await Module(); M.setup();
  const rel = (a, b, r) => Math.abs(a - b) <= r * Math.max(1e-12, Math.abs(b));
  const TMP = path.join(REPO, 'tmp/partcraft-ifc');
  fs.mkdirSync(TMP, { recursive: true });
  const read = (file) => {
    const r = spawnSync(PY, ['-I', '-c', READER, file], { encoding: 'utf8', maxBuffer: 64 << 20, timeout: 120000 });
    if (r.status !== 0) return { fail: (r.stderr || '').trim().split('\n').slice(-3).join(' | ') };
    return JSON.parse(r.stdout);
  };
  const now = new Date('2026-10-14T12:00:00Z');

  section('IFC export: a part with every property (0.5 WL.32)');
  const fl = F.flange().part;
  fl.name = "Flange 'DN65' \\ Ø150";
  fl.material = { name: 'Steel (carbon)', density: 7.85 };
  fl.params = { vars: [{ name: 'bolts', expr: '8' }, { name: 'pcd', expr: '150', note: 'pitch circle' }, { name: 'r', expr: 'pcd / 2' }], links: [] };
  fl.drawing = { title: { title: 'Weld-neck flange', number: 'FL-100', rev: 'B', company: 'Acme, Inc.', drawnBy: 'A. Lee', date: '2026-10-14', finish: 'Ra 3.2', tolerance: 'ISO 2768-m' }, sheet: 'a2', notes: [] };
  fl.configs = { rows: [{ name: 'Standard', values: { bolts: 8 } }], active: 'Standard' };
  const r = K.regenerate(fl, M);
  const out1 = X.partIfc(fl, r, { now, evaluate: PR.evaluateVars });
  const out2 = X.partIfc(fl, r, { now, evaluate: PR.evaluateVars });
  ok(out1.text === out2.text && /^ISO-10303-21;/.test(out1.text) && /FILE_SCHEMA\(\('IFC4'\)\)/.test(out1.text), 'IFC4 Part 21 text; exporting twice gives the same file (GlobalIds from the name)');
  ok(out1.counts.elements === 1 && out1.counts.triangles === r.mesh.indices.length / 3 && out1.counts.psets === 5, `counts: 1 element, ${out1.counts.triangles} triangles, ${out1.counts.psets} sets, ${out1.counts.properties} properties`);
  const f1 = path.join(TMP, 'flange.ifc');
  fs.writeFileSync(f1, out1.text);
  if (!fs.existsSync(PY)) skip('IfcOpenShell (tools/detailcraft-test/venv): the read-back checks');
  else {
    const j = read(f1);
    if (j.fail) ok(false, 'IfcOpenShell reads the part file: ' + j.fail);
    else {
      ok(j.schema === 'IFC4' && j.errors.length === 0, 'IfcOpenShell: IFC4, schema validation clean' + (j.errors.length ? ': ' + j.errors.join('; ') : ''));
      const e = j.elements[0], ps = e.psets;
      ok(j.elements.length === 1 && e.cls === 'IfcBuildingElementProxy' && e.name === fl.name && e.tag === 'FL-100' && e.container === 'PartCraft', `one proxy named "${e.name}" (quote, backslash and Ø intact), Tag FL-100, in the storey`);
      const pp = ps.PartCraft_Part;
      ok(pp && pp.Material === 'Steel (carbon)' && rel(pp.Density, 7850, 1e-12) && pp.Configuration === 'Standard' && pp.Bodies === 1 && pp.Name === fl.name, 'PartCraft_Part: name, material, density 7850 kg/m³, configuration, bodies: ' + JSON.stringify(pp));
      const pa = ps.PartCraft_Parameters;
      ok(pa && pa.bolts === 8 && pa.pcd === 150 && pa.r === 75, 'PartCraft_Parameters: bolts 8, pcd 150, r = pcd / 2 → 75');
      const tb = ps.PartCraft_TitleBlock;
      ok(tb && tb.Title === 'Weld-neck flange' && tb.DrawingNumber === 'FL-100' && tb.Revision === 'B' && tb.Company === 'Acme, Inc.' && tb.DrawnBy === 'A. Lee' && tb.GeneralTolerance === 'ISO 2768-m' && tb.SheetSize === 'A2' && !('CheckedBy' in tb), 'PartCraft_TitleBlock: every filled field, the sheet size, empty ones left out');
      const q = ps.Qto_BuildingElementProxyQuantities, qq = ps.PartCraft_Quantities;
      ok(q && rel(q.NetVolume, r.stats.volume * 1e-9, 1e-9) && rel(q.NetSurfaceArea, r.stats.area * 1e-6, 1e-9), `quantities: NetVolume ${q?.NetVolume} m³ = the part's ${(r.stats.volume * 1e-9).toPrecision(8)}, NetSurfaceArea`);
      ok(qq && rel(qq.NetWeight, r.stats.volume * 7.85e-6, 1e-9) && rel(qq.OverallDepth, r.stats.bbox.max[1] - r.stats.bbox.min[1], 1e-6) && rel(qq.OverallLength, 200, 1e-6), `NetWeight ${qq?.NetWeight?.toFixed(4)} kg = ρV; the box: Z (depth) is PartCraft's Y`);
      ok(e.material === 'Steel (carbon)', 'IfcMaterial associated');
      ok(rel(e.volume, r.stats.volume, 1e-6), `the body's volume from IfcOpenShell's triangles ${e.volume.toFixed(2)} = the mesh's ${r.stats.volume.toFixed(2)} mm³ (closed, outward)`);
      const zr = e.box[5] - e.box[2], yr = e.box[4] - e.box[1];
      ok(rel(zr, r.stats.bbox.max[1] - r.stats.bbox.min[1], 1e-6) && rel(yr, r.stats.bbox.max[2] - r.stats.bbox.min[2], 1e-6), 'Z up: the flange\'s height is IFC\'s Z');
    }
  }

  section('IFC export: an assembly, its parts as types, every instance with its values');
  const box = P.newPart('Block');
  const s1 = P.addFeature(box, 'sketch', { plane: { kind: 'base', name: 'top' }, sketch: F.blockSketch(100, 50).sk });
  P.addFeature(box, 'extrude', { sketch: s1.id, depth: 20 });
  const asm = A.newAssembly('Flange stack');
  const i1 = A.insertPart(asm, fl);
  const i2 = A.insertPart(asm, null, { pid: i1.part, place: V.translation([0, 0, 400]) });
  const ib = A.insertPart(asm, box, { place: V.matMul(V.translation([300, 0, 0]), V.matMul(V.rotationAbout([0, 0, 0], [0, 1, 0], 90), V.rotationAbout([0, 0, 0], [1, 0, 0], 30))) });   // turned about two axes
  Object.assign(asm.parts[i1.part], { number: 'FL-100', description: 'Weld-neck flange, "DN 65"' });
  asm.instances.find((x) => x.id === i2.id).name = 'Top flange';
  const builds = new Map([[i1.part, K.regenerate(P.readPart(asm.parts[i1.part].part), M)], [ib.part, K.regenerate(P.readPart(asm.parts[ib.part].part), M)]]);
  const world = A.placeAll(asm, builds).world;
  const bom = BOM.bomRows(asm, builds);
  const ao = X.assemblyIfc(asm, builds, world, { now, evaluate: PR.evaluateVars, readPart: P.readPart, bom });
  const f2 = path.join(TMP, 'stack.ifc');
  fs.writeFileSync(f2, ao.text);
  ok(ao.counts.elements === 4 && ao.counts.triangles === builds.get(i1.part).mesh.indices.length / 3 + builds.get(ib.part).mesh.indices.length / 3, 'one assembly + 3 occurrences; each part\'s triangles written once (a type\'s representation map)');
  if (fs.existsSync(PY)) {
    const j = read(f2);
    if (j.fail) ok(false, 'IfcOpenShell reads the assembly file: ' + j.fail);
    else {
      ok(j.errors.length === 0, 'IfcOpenShell: schema validation clean' + (j.errors.length ? ': ' + j.errors.join('; ') : ''));
      const occ = j.elements.filter((e) => e.cls === 'IfcBuildingElementProxy'), as = j.elements.find((e) => e.cls === 'IfcElementAssembly');
      ok(as && as.name === 'Flange stack' && as.container === 'PartCraft' && occ.length === 3 && occ.every((e) => e.aggregate === 'Flange stack'), 'an IfcElementAssembly in the storey aggregating the 3 occurrences');
      ok(j.types.length === 2 && j.types.some((t) => t.tag === 'FL-100' && t.psets.PartCraft_Part.PartNumber === 'FL-100' && t.psets.PartCraft_Part.Description === 'Weld-neck flange, "DN 65"' && t.psets.PartCraft_Parameters.r === 75), 'two types: the flange\'s carries its part number, description and parameters');
      const top = occ.find((e) => e.name === 'Top flange'), base = occ.find((e) => e.psets.PartCraft_Instance?.Grounded === true), blk = occ.find((e) => e.type === 'Block');
      ok(top && top.type === fl.name && top.psets.PartCraft_Instance.InstanceId === i2.id && top.psets.PartCraft_Instance.Item === 1 && blk?.psets.PartCraft_Instance.Item === 2 && base && base !== top, 'each occurrence: its own name, id, BOM item (flange 1, block 2) and the grounded one marked');
      ok(top.psets.PartCraft_Part?.PartNumber === 'FL-100' && rel(top.psets.PartCraft_Quantities.NetWeight, builds.get(i1.part).stats.volume * 7.85e-6, 1e-9), 'an occurrence sees its type\'s properties, and has its own quantities (mass)');
      // where each copy is: IfcOpenShell's world box centre = the instance matrix × the part's box centre, Y up → Z up
      const centre = (b) => [(b[0] + b[3]) / 2, (b[1] + b[4]) / 2, (b[2] + b[5]) / 2];
      const want = (inst) => { const st = builds.get(inst.part).stats; const c = V.applyMat(world.get(inst.id), st.bbox.min.map((v, k) => (v + st.bbox.max[k]) / 2)); return [c[0], -c[2], c[1]]; };
      const placed = [[i1, base], [i2, top], [ib, blk]].every(([inst, e]) => { const a = centre(e.box), b = want(asm.instances.find((x) => x.id === inst.id)); return a.every((v, k) => Math.abs(v - b[k]) < 1e-3); });
      ok(placed, 'every copy sits where PartCraft places it, the block turned about two axes (box centres to 1e-3 mm, Z up)');
    }
  }
  if (!keep) fs.rmSync(TMP, { recursive: true, force: true });
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const VERBOSE = process.argv.includes('--verbose');
  let pass = 0, fail = 0;
  const ok = (c, m) => { if (c) { pass++; if (VERBOSE) console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };
  const section = (t) => console.log('\n== ' + t);
  await runIfcExportTests({ ok, section, keep: process.argv.includes('--keep') });
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}
