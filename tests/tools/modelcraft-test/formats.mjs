/* SPDX-License-Identifier: Apache-2.0 */
/**
 * formats.mjs — ModelCraft file-format checks, run by bin/test-modelcraft.mjs:
 *   const { run } = await import('tools/modelcraft-test/formats.mjs'); await run({ ok, close, section, APP, OUT, ROOT, VERBOSE });
 * Every export is read back by our own importer AND by a second reader where one exists:
 * the Khronos glTF validator + trimesh (GLB), trimesh (OBJ, STL), web-ifc (IFC), the Collada 1.4.1 schema +
 * pycollada + trimesh (DAE); DAE import is checked on a file pycollada writes (gen_dae.py) and DWG import (cc-dwg's
 * readDwg, the app's dwg/ copy) against LibreDWG's own DXF output of the same sample (dwg2dxf.mjs, an independent oracle). A missing second
 * reader is skipped with a note, never counted as a failure. Setup: see bin/test-modelcraft.mjs.
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';

export async function run({ ok, close, section, APP, OUT, ROOT, VERBOSE = false }) {
  const M = await import(path.join(APP, 'model.js'));
  const V = await import(path.join(APP, 'vec.js'));
  const IO = await import(path.join(APP, 'io.js'));
  const { Model, addPolygon, addEdge, rectPts, pushPull, faceNormal, faceArea, worldTriangles, solidInfo } = M;
  const HERE = path.join(ROOT, 'tools/modelcraft-test');
  const req = createRequire(path.join(HERE, 'package.json'));
  const PY = path.join(HERE, 'venv/bin/python');
  const note = (s) => console.log('  note ' + s);
  const write = (name, data) => { const p = path.join(OUT, name); fs.writeFileSync(p, data); fs.chmodSync(p, 0o644); return p; };
  const triArea = (ps) => V.len(V.cross(V.sub(ps[1], ps[0]), V.sub(ps[2], ps[0]))) / 2;

  // ---- the test model ----
  const m = new Model();
  const root = m.root;
  addPolygon(root, rectPts([0, 0, 0], [1, 0, 0], [0, 1, 0], 4, 3));
  pushPull(root, [...root.faces.keys()][0], 2.5);                         // 30 m³ loose box
  const col = m.newDef('component', 'Column');
  addPolygon(col, rectPts([0, 0, 0], [1, 0, 0], [0, 1, 0], 0.4, 0.4));
  pushPull(col, [...col.faces.keys()][0], 3);                             // 0.48 m³
  m.place(root, col.id, V.translation([6, 0, 0]));
  m.place(root, col.id, V.mmul(V.translation([8, 2, 0]), V.rotation([0, 0, 1], Math.PI / 6)));
  m.place(root, col.id, V.mmul(V.translation([10, 0, 0]), V.scaling(1.5)));   // not rigid: baked into the IFC
  const wall = m.newDef('group', 'Wall with opening');
  addPolygon(wall, rectPts([0, 0, 0], [1, 0, 0], [0, 1, 0], 4, 0.3));
  pushPull(wall, [...wall.faces.keys()][0], 3);
  addPolygon(wall, rectPts([1, 0, 0.5], [1, 0, 0], [0, 0, 1], 1, 1.5));
  const win = [...wall.faces].find(([, f]) => V.dot(faceNormal(wall, f), [0, -1, 0]) > 0.999 && close(faceArea(wall, f), 1.5))?.[0];
  pushPull(wall, win, -5);
  m.place(root, wall.id, V.translation([0, 6, 0]));
  const pad = m.newDef('group', 'Pad');                                   // an open surface
  addPolygon(pad, rectPts([0, 0, 0], [1, 0, 0], [0, 1, 0], 2, 2));
  m.place(root, pad.id, V.translation([0, 12, 0]));
  addEdge(root, [14, 10, 0], [16, 10, 0]);                                 // a loose edge
  const colVol = 0.48, expVol = 30 + 2 * colVol + colVol * 3.375 + (3.6 - 0.45);   // the pad has no volume
  const wt = worldTriangles(m);
  let expArea = 0, bb = null;
  for (const t of wt) { expArea += triArea(t.p); for (const p of t.p) bb = V.bboxAdd(bb, p); }
  const meshInfo = (file) => JSON.parse(execFileSync(PY, [path.join(HERE, 'mesh_check.py'), file], { encoding: 'utf8' }));
  const havePy = fs.existsSync(PY) && (() => { try { execFileSync(PY, ['-c', 'import trimesh'], { stdio: 'ignore' }); return true; } catch { return false; } })();
  const defArea = (d) => [...d.faces.values()].reduce((s, f) => s + faceArea(d, f), 0);
  const bbClose = (a, b, tol = 1e-5) => a && b && [0, 1, 2].every((k) => close(a.min[k], b.min[k], tol) && close(a.max[k], b.max[k], tol));
  const yBounds = (b) => [[b.min[0], b.min[2], -b.max[1]], [b.max[0], b.max[2], -b.min[1]]];
  const boundsClose = (got, want, tol = 1e-4) => [0, 1].every((r) => [0, 1, 2].every((k) => close(got[r][k], want[r][k], tol)));
  // the pad is open: trimesh's volume counts only closed parts reliably, so the mesh volume check uses a padless copy
  const closedOnly = new Model();
  closedOnly.load(JSON.parse(m.snapshot()));
  for (const [iid, inst] of closedOnly.root.insts) if (inst.def === pad.id) closedOnly.root.insts.delete(iid);

  section('files: native .modelcraft');
  {
    const text = JSON.stringify(m.toJSON());
    const m2 = new Model();
    m2.load(JSON.parse(text));
    ok(m2.snapshot() === m.snapshot(), 'save → open gives the identical model');
    ok(m2.defs.size === m.defs.size && m2.instanceCounts().get(col.id) === 3, 'definitions and the 3 column instances survive');
    const bad = (label, mutate, re = /./) => {
      const j = JSON.parse(text);
      mutate(j);
      let err = null;
      try { new Model().load(j); } catch (e) { err = e; }
      ok(err instanceof Error && re.test(err.message), `refused: ${label}${err ? ' ("' + err.message.slice(0, 70) + '")' : ''}`);
    };
    bad('no format mark', (j) => { delete j.format; });
    bad('version 0', (j) => { j.version = 0; });
    bad('a newer version', (j) => { j.version = 99; }, /newer/);
    bad('a group containing itself', (j) => { const d = j.defs.find((x) => x.id === wall.id); d.insts.push({ id: 999, def: wall.id, m: V.ident() }); }, /itself/);
    bad('two definitions containing each other', (j) => {
      const a = j.defs.find((x) => x.id === wall.id), b = j.defs.find((x) => x.id === pad.id);
      a.insts.push({ id: 998, def: pad.id, m: V.ident() }); b.insts.push({ id: 997, def: wall.id, m: V.ident() });
    }, /itself/);
    bad('a face with a missing vertex', (j) => { j.defs[0].faces[0].loops[0][1] = 123456; });
    bad('a huge coordinate', (j) => { j.defs[0].verts[0][1] = 1e300; });
    bad('a NaN coordinate (as null)', (j) => { j.defs[0].verts[0][2] = null; });
    bad('an instance of a missing definition', (j) => { j.defs[0].insts[0].def = 'd999'; });
    bad('a bad matrix', (j) => { j.defs[0].insts[0].m = [1, 2, 3]; });
    bad('not an object', (j) => { for (const k of Object.keys(j)) delete j[k]; });
    const m3 = new Model();
    m3.load(JSON.parse(text.replace('"Wall with opening"', '"Wall\\u0000<b>x</b>"')));
    ok(!/\u0000/.test(m3.defs.get(wall.id).name), 'control characters are stripped from names');
  }

  section('files: GLB (glTF binary)');
  {
    const glb = IO.exportGLB(m);
    const file = write('model.glb', glb);
    ok(new DataView(glb.buffer).getUint32(0, true) === 0x46546c67 && glb.length % 4 === 0, `GLB header and 4-byte padding (${glb.length} bytes)`);
    const json = JSON.parse(new TextDecoder().decode(glb.subarray(20, 20 + new DataView(glb.buffer).getUint32(12, true))));
    ok(json.meshes.length === 4, `one mesh per definition with faces (${json.meshes.length}: model, column, wall, pad)`);
    ok(json.nodes.filter((n) => n.mesh === json.meshes.findIndex((x) => x.name === 'Column')).length === 3, 'the column mesh is shared by 3 nodes');
    ok(json.asset.generator === 'ModelCraft' && json.accessors.filter((a) => a.min).length >= 4, 'generator set, POSITION accessors carry min/max');
    let validator = null;
    try { validator = req('gltf-validator'); } catch { note('gltf-validator missing: (cd tools/modelcraft-test && npm install)'); }
    if (validator) {
      const rep = await validator.validateBytes(glb, { maxIssues: 100 });
      ok(rep.issues.numErrors === 0, `Khronos glTF validator: ${rep.issues.numErrors} errors, ${rep.issues.numWarnings} warnings`);
      if (VERBOSE || rep.issues.numErrors) for (const i of rep.issues.messages.slice(0, 10)) console.log('       ' + i.severity + ' ' + i.code + ' ' + i.pointer + ' ' + i.message);
    }
    const m2 = new Model();
    const { def, report } = IO.importGLTF(m2, glb, 'model.glb');
    ok(report.triangles === wt.length, `re-imported: ${report.triangles} triangles (exported ${wt.length})`);
    ok(close(defArea(def), expArea, 1e-6), `re-imported area ${defArea(def).toFixed(6)} = ${expArea.toFixed(6)} m²`);
    ok(bbClose(m2.defBBox(def), bb), 're-imported bounding box matches (Y up → Z up)');
    if (havePy) {
      const t = meshInfo(file);
      ok(close(t.area, expArea, 1e-4), `trimesh: area ${t.area.toFixed(4)} m²`);
      ok(boundsClose(t.bounds, yBounds(bb)), 'trimesh: bounds match (Y up)');
    } else note('trimesh missing: python3 -m venv tools/modelcraft-test/venv && tools/modelcraft-test/venv/bin/pip install trimesh numpy');
    if (havePy) {
      const t = meshInfo(write('closed.glb', IO.exportGLB(closedOnly)));
      ok(close(t.volume, expVol, 1e-4) && t.watertight, `trimesh: closed solids' volume ${t.volume.toFixed(4)} = ${expVol.toFixed(4)} m³, watertight`);
    }
    // colours survive
    const mc = new Model();
    addPolygon(mc.root, rectPts([0, 0, 0], [1, 0, 0], [0, 1, 0], 1, 1));
    pushPull(mc.root, [...mc.root.faces.keys()][0], 1);
    const top = [...mc.root.faces.values()].find((f) => faceNormal(mc.root, f)[2] > 0.99);
    top.color = '#c0392b';
    const g2 = IO.exportGLB(mc);
    const back = IO.importGLTF(new Model(), g2, 'c').def;
    const colored = [...back.faces.values()].filter((f) => f.color);
    ok(colored.length === 2 && colored.every((f) => f.color === '#c0392b'), 'a face colour goes out as a material and comes back (2 triangles)');
    if (validator) ok((await validator.validateBytes(g2)).issues.numErrors === 0, 'the coloured GLB validates too');
    // untrusted input
    const refuse = (label, bytes, re = /./) => { let e = null; try { IO.importGLTF(new Model(), bytes, 'x'); } catch (x) { e = x; } ok(e instanceof Error && re.test(e.message), 'refused: ' + label + (e ? ' ("' + e.message.slice(0, 60) + '")' : '')); };
    const cut = glb.slice(0, glb.length - 100);
    new DataView(cut.buffer).setUint32(8, cut.length, true);
    refuse('a truncated GLB', cut);
    refuse('an external .bin', new TextEncoder().encode(JSON.stringify({ asset: { version: '2.0' }, buffers: [{ uri: 'model.bin', byteLength: 10 }] })), /\.glb/);
    refuse('glTF 1.0', new TextEncoder().encode(JSON.stringify({ asset: { version: '1.0' } })), /2\.0/);
    refuse('an accessor past its buffer', new TextEncoder().encode(JSON.stringify({
      asset: { version: '2.0' }, buffers: [{ uri: 'data:application/octet-stream;base64,AAAAAAAAAAAAAAAA', byteLength: 12 }],
      bufferViews: [{ buffer: 0, byteLength: 12 }], accessors: [{ bufferView: 0, componentType: 5126, count: 3, type: 'VEC3' }],
      meshes: [{ primitives: [{ attributes: { POSITION: 0 } }] }], nodes: [{ mesh: 0 }], scenes: [{ nodes: [0] }],
    })), /past/);
    // a .gltf with a data: URI, a TRS node, a triangle strip and a line primitive
    const pos = new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 1, 0]);
    const b64 = Buffer.from(pos.buffer).toString('base64');
    const gl = {
      asset: { version: '2.0' }, buffers: [{ uri: 'data:application/octet-stream;base64,' + b64, byteLength: 48 }],
      bufferViews: [{ buffer: 0, byteLength: 48 }], accessors: [{ bufferView: 0, componentType: 5126, count: 4, type: 'VEC3', min: [0, 0, 0], max: [1, 1, 0] }],
      meshes: [{ primitives: [{ attributes: { POSITION: 0 }, mode: 5 }, { attributes: { POSITION: 0 }, mode: 1 }] }],
      nodes: [{ mesh: 0, translation: [5, 0, 0], scale: [2, 2, 2] }], scenes: [{ nodes: [0] }], scene: 0,
    };
    const r = IO.importGLTF(new Model(), new TextEncoder().encode(JSON.stringify(gl)), 'strip');
    const pts = [...r.def.verts.values()];
    ok(r.report.triangles === 2 && r.report.skipped.lines === 1, '.gltf: a triangle strip becomes 2 triangles, the line primitive is counted as skipped');
    ok(close(defArea(r.def), 4) && pts.every((p) => p[0] >= 5 - 1e-9 && p[0] <= 7 + 1e-9 && close(p[1], 0)), '.gltf: TRS scale 2 + translation applied, Y up → Z up (a 2 × 2 square standing in XZ)');
  }

  section('files: OBJ');
  {
    const text = IO.exportOBJ(m);
    const file = write('model.obj', text);
    ok(/^l \d+ \d+$/m.test(text), 'the loose edge is written as an l line');
    ok((text.match(/^o /gm) || []).length === 6, `one object per placed definition: model, 3 columns, wall, pad (${(text.match(/^o /gm) || []).length})`);
    const m2 = new Model();
    const { def, report } = IO.importOBJ(m2, text, 'model.obj');
    ok(close(defArea(def), expArea, 1e-5), `re-imported area ${defArea(def).toFixed(5)} m² (faces ${report.faces})`);
    ok(bbClose(m2.defBBox(def), { min: bb.min, max: [bb.max[0], Math.max(bb.max[1], 10), bb.max[2]] }, 1e-5) || bbClose(m2.defBBox(def), bb, 1e-5), 're-imported bounding box matches');
    ok(report.skipped.lines === 1, 'the l line is counted as skipped on import');
    if (havePy) {
      const t = meshInfo(file);
      ok(close(t.area, expArea, 1e-4), `trimesh: area ${t.area.toFixed(4)} m²`);
      ok(boundsClose(t.bounds, yBounds(bb)), 'trimesh: bounds match (Y up)');
      const tc = meshInfo(write('closed.obj', IO.exportOBJ(closedOnly)));
      ok(close(tc.volume, expVol, 1e-4) && tc.watertight, `trimesh: volume ${tc.volume.toFixed(4)} m³, watertight`);
    }
    const r = IO.importOBJ(new Model(), '# t\nv 0 0 0\nv 1 0 0\nv 1 1 0\nv 0 1 0\nvt 0 0\nvn 0 0 1\nf -4/1/1 -3/1/1 -2/1/1 -1/1/1\nf 1 2 9\nf 1 1 1\n', 'q');
    ok(r.def.faces.size === 1 && close(defArea(r.def), 1) && r.report.skipped['bad face'] === 1, 'negative and v/vt/vn indices read; an out-of-range face is skipped');
    let e = null;
    try { IO.importOBJ(new Model(), 'v 1 2 x\n', 'bad'); } catch (x) { e = x; }
    ok(e instanceof Error, 'a vertex that is not a number is refused');
  }

  section('files: STL');
  {
    const stl = IO.exportSTL(m);
    const file = write('model.stl', stl);
    const dv = new DataView(stl.buffer);
    ok(new TextDecoder().decode(stl.subarray(0, 27)) === 'ModelCraft STL, millimeters', 'header names the unit');
    ok(dv.getUint32(80, true) === wt.length && stl.length === 84 + 50 * wt.length, `${wt.length} triangles, size 84 + 50 × n`);
    if (havePy) {
      const t = meshInfo(file);
      ok(close(t.area, expArea * 1e6, 1), `trimesh: area ${(t.area / 1e6).toFixed(4)} m² (in mm²)`);
      ok(boundsClose(t.bounds, [bb.min.map((x) => x * 1000), bb.max.map((x) => x * 1000)], 0.01), 'trimesh: bounds in millimeters, Z up');
      const tc = meshInfo(write('closed.stl', IO.exportSTL(closedOnly)));
      ok(close(tc.volume, expVol * 1e9, 1e3) && tc.watertight, `trimesh: volume ${(tc.volume / 1e9).toFixed(4)} m³ (×1e9 mm³), watertight`);
    }
  }

  section('files: DXF site plan');
  {
    const P = (...kv) => kv.join('\n');
    const dxf = P(
      '0', 'SECTION', '2', 'HEADER', '9', '$INSUNITS', '70', '4', '0', 'ENDSEC',
      '0', 'SECTION', '2', 'BLOCKS',
      '0', 'BLOCK', '8', '0', '2', 'TREE', '70', '0', '10', '0', '20', '0', '30', '0',
      '0', 'CIRCLE', '8', '0', '10', '0', '20', '0', '30', '0', '40', '500',
      '0', 'ENDBLK', '8', '0', '0', 'ENDSEC',
      '0', 'SECTION', '2', 'ENTITIES',
      '0', 'LINE', '8', 'Site', '10', '0', '20', '0', '30', '7', '11', '10000', '21', '0', '31', '7',
      '0', 'LWPOLYLINE', '8', 'Site', '90', '4', '70', '1',
      '10', '0', '20', '-5000', '10', '2000', '20', '-5000', '10', '2000', '20', '-3000', '10', '0', '20', '-3000', '42', '1',
      '0', 'CIRCLE', '8', 'Site', '10', '20000', '20', '0', '30', '0', '40', '1000',
      '0', 'ARC', '8', 'Site', '10', '30000', '20', '0', '30', '0', '40', '1000', '50', '0', '51', '90',
      '0', 'INSERT', '8', 'Trees', '2', 'TREE', '10', '40000', '20', '0', '30', '0', '41', '2', '42', '2', '50', '30',
      '0', 'TEXT', '8', 'Site', '10', '0', '20', '-20000', '40', '1000', '1', 'Lot 4',
      '0', 'LINE', '8', 'Sheet', '67', '1', '10', '0', '20', '0', '11', '5', '21', '5',
      '0', 'LINE', '8', 'Site', '60', '1', '10', '0', '20', '90000', '11', '5', '21', '90000',
      '0', 'ENDSEC', '0', 'EOF', '');
    const m2 = new Model();
    const { def, report, units } = IO.importDXF(m2, dxf, 'site.dxf');
    const lenOf = (d, pred = () => true) => [...d.edges.values()].reduce((s, e) => { const a = d.verts.get(e.a), b = d.verts.get(e.b); return pred(a, b) ? s + V.dist(a, b) : s; }, 0);
    const chord = (deg, r) => 2 * r * Math.sin((deg * Math.PI / 180) / 2);
    ok(units === 'mm', '$INSUNITS 4 → millimeters');
    ok(report.lines === 1 && report.polylines === 1 && report.circles === 2 && report.arcs === 1 && report.inserts === 1, 'one of each entity read (2 circles: one through the block): ' + JSON.stringify(report));
    ok(report.texts === 1 && !report.skipped.TEXT && report.paperSpace === 1, 'text drawn (0.4 M1); the paper-space line left out');
    const lot = [...def.verts.values()].filter((p) => p[1] < -18.5);
    ok(lot.length > 20 && close(Math.max(...lot.map((p) => p[1])), -19, 1e-9) && close(Math.min(...lot.map((p) => p[0])), 0, 1e-9), `"Lot 4" in single-stroke letters, 1 m tall from its insertion point (${lot.length} points)`);
    ok(![...def.verts.values()].some((p) => p[1] > 80), 'an invisible line (code 60 = 1, e.g. a dynamic block\'s other state) is left out');
    ok([...def.verts.values()].every((p) => p[2] === 0), 'every vertex on the ground (z = 0; the line had z 7)');
    ok(close(lenOf(def, (a, b) => a[1] === 0 && b[1] === 0 && a[0] <= 10 && b[0] <= 10), 10), 'the line is 10 m');
    const polyLen = lenOf(def, (a, b) => a[1] < -2.9 && b[1] < -2.9 && a[1] > -5.1 && b[1] > -5.1);
    const expPoly = 2 + 2 + 2 + 24 * chord(7.5, 1);
    ok(close(polyLen, expPoly, 1e-6), `closed polyline with a half-circle bulge: ${polyLen.toFixed(6)} m (exact arc 6 + π = ${(6 + Math.PI).toFixed(4)})`);
    const bulgeMin = Math.min(...[...def.verts.values()].filter((p) => p[1] < -2.9 && p[1] > -5.1).map((p) => p[0]));
    ok(close(bulgeMin, -1, 1e-9), 'the bulge swings out to x = −1 m (counter-clockwise from the last vertex)');
    ok(close(lenOf(def, (a) => a[0] > 18.5 && a[0] < 21.5), 48 * chord(7.5, 1), 1e-9), 'circle: 48 segments of radius 1 m');
    ok(close(lenOf(def, (a) => a[0] > 28.5 && a[0] < 31.5), 12 * chord(7.5, 1), 1e-9), 'arc 0–90°: 12 segments');
    const tree = [...def.verts.values()].filter((p) => p[0] > 38);
    const cx = tree.reduce((s, p) => s + p[0], 0) / tree.length;
    ok(tree.length === 48 && close(cx, 40, 1e-9) && tree.every((p) => close(V.dist(p, [40, 0, 0]), 1, 1e-9)), 'the inserted block: a 0.5 m circle × 2 at (40, 0) → radius 1 m');
    ok(report.edges === def.edges.size && def.faces.size === 0, `edges only, no faces (${def.edges.size} edges)`);
    const noUnits = dxf.replace("'9', '$INSUNITS'", '').replace('$INSUNITS\n70\n4', '$ACADVER\n1\nAC1009');
    const r2 = IO.importDXF(new Model(), noUnits, 'x', { unit: 'ft' });
    ok(r2.units === null && close(lenOf(r2.def, (a, b) => a[1] === 0 && b[1] === 0 && a[0] <= 3048.1 && b[0] <= 3048.1 && a[0] >= 0 && b[0] >= 0), 3048), 'no $INSUNITS: units null and the caller\'s unit used (feet: 10000 → 3048 m)');
    let e = null;
    try { IO.importDXF(new Model(), 'AutoCAD Binary DXF\r\n\u001a\u0000', 'b'); } catch (x) { e = x; }
    ok(e instanceof Error && /binary/i.test(e.message), 'binary DXF refused with a plain message');
    // a DXF written by CadCraft's own writer (copied reader must agree with it)
    try {
      const CC = path.join(ROOT, 'public_html/assets/apps/cadcraft/dev');
      const { Doc } = await import(path.join(CC, 'doc.js'));
      const { writeDxf } = await import(path.join(CC, 'dxf.js'));
      const doc = new Doc();
      doc.load({ meta: { name: 'site', units: 'meters' } });
      doc.change('t', () => {
        doc.add({ type: 'line', layer: '0', color: null, x1: 0, y1: 0, x2: 30, y2: 0 });
        doc.add({ type: 'poly', layer: '0', color: null, pts: [{ x: 0, y: 0, b: 0 }, { x: 30, y: 0, b: 0 }, { x: 30, y: 20, b: 0 }, { x: 0, y: 20, b: 0 }], closed: true });
        doc.add({ type: 'circle', layer: '0', color: null, cx: 15, cy: 10, r: 2 });
      });
      const out = writeDxf(doc).text;
      const r3 = IO.importDXF(new Model(), out, 'cc');
      ok(r3.report.lines === 1 && r3.report.polylines === 1 && r3.report.circles === 1, `CadCraft's own R12 DXF reads (units ${r3.units}): ${JSON.stringify(r3.report)}`);
      ok(close(lenOf(r3.def), 100 * (r3.units === 'mm' ? 0.001 : 1) + 48 * chord(7.5, 2) * (r3.units === 'mm' ? 0.001 : 1), 1e-6), `CadCraft DXF: the 30 × 20 lot (the line on its edge welded into it) + a 48-segment circle (${lenOf(r3.def).toFixed(4)})`);
    } catch (x) { note('CadCraft DXF round trip skipped: ' + x.message); }
  }

  section('files: DXF text, splines, ellipses, hatches, 3D faces, dimensions (0.4 M1; the DXF written by ezdxf)');
  {
    const EZ = path.join(ROOT, 'tools/cadcraft-test/venv/bin/python');
    const file = path.join(OUT, 'm1.dxf');
    let facts = null;
    if (fs.existsSync(EZ)) { try { facts = JSON.parse(execFileSync(EZ, ['-I', path.join(HERE, 'm1_fixture.py'), file], { encoding: 'utf8' })); } catch (x) { note('m1_fixture.py failed: ' + x.message.split('\n')[0]); } }
    else note('ezdxf missing (tools/cadcraft-test/venv: python3 -m venv … && …/pip install ezdxf): the M1 DXF fixture is not checked');
    if (facts) {
      const { def, report, units } = IO.importDXF(new Model(), fs.readFileSync(file, 'latin1'), 'm1');
      const pts = [...def.verts.values()];
      const inBox = (x0, y0, x1, y1) => (p) => p[0] >= x0 && p[0] <= x1 && p[1] >= y0 && p[1] <= y1;
      const lenIn = (pred) => [...def.edges.values()].reduce((s2, e) => { const a = def.verts.get(e.a), b2 = def.verts.get(e.b); return pred(a) && pred(b2) ? s2 + V.dist(a, b2) : s2; }, 0);
      const rel = (a, b2, t) => Math.abs(a - b2) <= t * Math.abs(b2);
      ok(units === 'm' && report.splines === 3 && report.ellipses === 2 && report.texts === 4 && report.hatches === 2 && report.faces3d === 2 && report.dimensions === 1 && report.inserts >= 1,
        'every kind read: 3 splines, 2 ellipses, 4 texts (TEXT, MTEXT, the dimension\'s, an attribute), 2 hatches, a 3D face + a solid, 1 dimension: ' + JSON.stringify(report));
      const sl = lenIn(inBox(-0.5, -2, 10.5, 4.5));
      ok(rel(sl, facts.spline_len, 2e-3), `spline through 5 control points: ${sl.toFixed(4)} m (ezdxf ${facts.spline_len.toFixed(4)})`);
      const q = pts.filter(inBox(19.9, -0.1, 25.1, 5.1));
      ok(q.length > 10 && q.every((p) => Math.abs(V.dist(p, [25, 0, 0]) - 5) < 1e-9) && rel(lenIn(inBox(19.9, -0.1, 25.1, 5.1)), facts.quarter_len, 2e-3), 'rational spline (weights 1, √½, 1): every point exactly on the quarter circle of radius 5');
      ok(facts.fit.every(([x, y]) => pts.some((p) => Math.hypot(p[0] - x, p[1] - y) < 1e-9)), 'a spline stored with fit points only passes through each fit point');
      const el = pts.filter(inBox(35.9, -2.1, 44.1, 2.1));
      ok(el.length >= 48 && el.every((p) => Math.abs(((p[0] - 40) / 4) ** 2 + (p[1] / 2) ** 2 - 1) < 1e-9), `full ellipse 4 × 2: ${el.length} points, all on it`);
      const ea = lenIn(inBox(36.9, 9.9, 40.1, 13.1));
      ok(rel(ea, facts.ellipse_arc_len, 3e-3), `quarter of an upright ellipse: ${ea.toFixed(4)} m (ezdxf ${facts.ellipse_arc_len.toFixed(4)})`);
      const ct = pts.filter(inBox(15, -11, 25, -9));
      const cx = (Math.min(...ct.map((p) => p[0])) + Math.max(...ct.map((p) => p[0]))) / 2, cy = (Math.min(...ct.map((p) => p[1])) + Math.max(...ct.map((p) => p[1]))) / 2;
      ok(ct.length > 20 && Math.abs(cx - 20) < 0.05 && Math.abs(cy + 10) < 0.05, `TEXT "CENTER", middle-centre aligned at (20, −10): drawn centred there (${cx.toFixed(3)}, ${cy.toFixed(3)})`);
      const mt = pts.filter(inBox(-0.1, -12, 6, -9.9));
      ok(mt.length > 20 && Math.abs(Math.max(...mt.map((p) => p[1])) + 10) < 1e-9 && Math.abs(Math.min(...mt.map((p) => p[0]))) < 1e-9 && Math.min(...mt.map((p) => p[1])) < -10.8, 'MTEXT attached top left at (0, −10): its first line hangs below that point, the second below it');
      const fa = [...def.faces.values()].map((f) => ({ f, a: M.faceArea(def, f), z: Math.max(...f.loops[0].map((v) => def.verts.get(v)[2])), x: def.verts.get(f.loops[0][0])[0] }));
      const h1 = fa.find((x) => x.x >= 49 && x.x <= 61), h2 = fa.find((x) => x.x >= 63 && x.x <= 69);
      ok(h1 && h1.f.loops.length === 2 && Math.abs(h1.a - (60 - 24 * Math.sin(2 * Math.PI / 48))) < 1e-9, `hatch with a round island → a face with a hole: ${h1 && h1.a.toFixed(4)} m² (60 − the 48-sided hole; exact ${facts.hatch1_area.toFixed(4)})`);
      ok(h2 && rel(h2.a, facts.hatch2_area, 3e-3) && h2.z === 0, `hatch with a half-circle bulge → a face on the ground: ${h2 && h2.a.toFixed(4)} m² (exact ${facts.hatch2_area.toFixed(4)})`);
      const f3 = fa.find((x) => x.x >= 69 && x.x <= 73), so = fa.find((x) => x.x >= 79 && x.x <= 83);
      ok(f3 && Math.abs(f3.a - facts.face3d_area) < 1e-9 && f3.z === 3, `3DFACE keeps its heights: ${f3 && f3.a.toFixed(4)} m², up to z = 3`);
      ok(so && Math.abs(so.a - facts.solid_area) < 1e-9, 'SOLID (corners 1 2 4 3) → a 2 × 2 square face, not a bow tie');
      ok(lenIn(inBox(-1, -21.5, 7, -17.5)) > 6, 'the dimension is drawn from its own block (lines, arrowheads, its text)');
      ok(pts.some(inBox(90.6, -0.1, 92.5, 0.6)), 'the block reference\'s attribute value "A-12" is drawn beside it');
    }
  }

  section('files: DXF and DWG export (0.4 M2; read back by ezdxf, cc-dwg and the DWG readers)');
  {
    // a box with a coloured top and a loose edge; a component placed three times (as is, turned 90° about red, mirrored);
    // a group turned and then stretched along a slant (a skew: written out in place)
    const mx = new Model(); mx.units = 'mm';
    mx.change('box', (mm) => {
      addPolygon(mm.root, rectPts([0, 0, 0], [1, 0, 0], [0, 1, 0], 2, 1)); pushPull(mm.root, [...mm.root.faces.keys()][0], 0.5);
      const top = [...mm.root.faces.values()].find((f) => close(faceNormal(mm.root, f)[2], 1));
      top.color = '#c0392b';
      addEdge(mm.root, [3, 0, 0], [3, 2, 0]);
      const cd = mm.newDef('component', 'Post');
      addPolygon(cd, rectPts([0, 0, 0], [1, 0, 0], [0, 1, 0], 0.2, 0.2)); pushPull(cd, [...cd.faces.keys()][0], 1.5);
      mm.place(mm.root, cd.id, V.translation([5, 0, 0]));
      mm.place(mm.root, cd.id, V.mmul(V.translation([7, 0, 0]), V.rotation([1, 0, 0], Math.PI / 2)));
      mm.place(mm.root, cd.id, V.mmul(V.translation([9, 0, 0]), [-1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]));
      const gd = mm.newDef('group', 'Slab');
      addPolygon(gd, rectPts([0, 0, 0], [1, 0, 0], [0, 1, 0], 1, 1)); pushPull(gd, [...gd.faces.keys()][0], 0.1);
      const skew = V.mmul(V.translation([12, 0, 0]), V.mmul([2, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1], V.rotation([0, 0, 1], Math.PI / 6)));
      mm.place(mm.root, gd.id, skew);
    });
    // expected, from ModelCraft's own world triangles: area in mm², extents in mm
    const wt = worldTriangles(mx);
    const expArea = wt.reduce((sum, t) => sum + triArea(t.p), 0) * 1e6;
    let bb = null; for (const t of wt) for (const p of t.p) bb = V.bboxAdd(bb, p);
    bb = V.bboxAdd(V.bboxAdd(bb, [3, 0, 0]), [3, 2, 0]);   // the loose edge
    const expBox = [bb.min.map((x) => x * 1000), bb.max.map((x) => x * 1000)];
    const { text, report } = IO.exportDXF(mx);
    ok(report.blocks === 1 && report.inserts === 3 && report.flattened === 1 && report.lines === 1 && report.unit === 'millimeters', 'DXF: the component is one block placed 3 times; the skewed group is written out in place: ' + JSON.stringify(report));
    ok(/^0\r\nSECTION\r\n2\r\nHEADER\r\n9\r\n\$ACADVER\r\n1\r\nAC1009/.test(text) && /\r\n0\r\nEOF\r\n$/.test(text), 'DXF R12 (AC1009), CRLF, ends with EOF');
    const EZ = [path.join(ROOT, 'tools/cadcraft-test/venv/bin/python'), path.join(ROOT, 'tools/civilcraft-test/venv/bin/python')].find((x) => fs.existsSync(x));
    const ez = (f) => JSON.parse(execFileSync(EZ, ['-I', path.join(HERE, 'cad_check.py'), f], { encoding: 'utf8' }));
    const sameBox = (b2, tol) => [0, 1].every((i) => [0, 1, 2].every((j) => Math.abs(b2[i][j] - expBox[i][j]) <= tol));
    if (!EZ) note('ezdxf missing (tools/cadcraft-test/venv): DXF/DWG export not read back');
    else {
      const dxfFile = write('export-m2.dxf', text);
      const c = ez(dxfFile);
      ok(c.audit_errors === 0 && c.version === 'AC1009', `ezdxf reads the DXF: ${c.version}, ${c.audit_errors} audit errors`);
      ok(Math.abs(c.area - expArea) <= expArea * 1e-9 && sameBox(c.bbox, 1e-6), `ezdxf explodes the inserts itself (turned, mirrored): face area ${c.area.toFixed(3)} mm² = ModelCraft's ${expArea.toFixed(3)}, same extents`);
      ok(c.lines === 1 && Math.abs(c.line_len - 2000) < 1e-9 && c.colors.includes(IO.nearestAci('#c0392b')) && IO.nearestAci('#c0392b') !== 7, `the loose edge is a 2000 mm LINE; the red top is AutoCAD colour ${IO.nearestAci('#c0392b')}, the nearest to #c0392b (${c.colors})`);
      // inches for a feet-and-inches model
      mx.units = 'ft-in';
      const ci = ez(write('export-m2-in.dxf', IO.exportDXF(mx).text));
      mx.units = 'mm';
      ok(Math.abs(ci.area - expArea / 645.16) <= ci.area * 1e-9, 'a feet-and-inches model is written in inches (area ÷ 645.16)');
    }
    // DWG through cc-dwg's writer (the library; ModelCraft's dev/dwg gets the writer copy from cad-files)
    const { writeDwg } = await import(path.join(ROOT, 'lib/dwg/write.js'));
    const { readDwg } = await import(path.join(ROOT, 'lib/dwg/read.js'));
    const { dwg } = IO.toDwgModel(mx);
    const out = writeDwg(dwg, { version: 'AC1018' });
    const dwgFile = write('export-m2.dwg', out.bytes);
    const back = readDwg(out.bytes);
    const msb = back.blocks.find((x) => /^\*model_space$/i.test(x.name));
    const cnt = (t) => back.blocks.reduce((n, x) => n + x.entities.filter((e) => e.type === t).length, 0);
    ok(back.header.INSUNITS === 4 && msb && cnt('INSERT') === 3 && cnt('LINE') === 1 && cnt('3DFACE') === report.triangles, `DWG 2004 written and read back by cc-dwg: INSUNITS 4, ${cnt('3DFACE')} 3D faces, 3 inserts, 1 line` + (out.report.notes.length ? ' — notes: ' + out.report.notes.join('; ') : ''));
    const tops = back.blocks.flatMap((x) => x.entities).filter((e) => e.type === '3DFACE' && e.color && e.color.rgb === 0xc0392b).length;
    ok(tops === 2, `the red top keeps its true colour in DWG (${tops} triangles)`);
    const TOOLS = path.join(ROOT, 'tools/civilcraft-test');
    if (EZ && fs.existsSync(path.join(TOOLS, 'dwg-readers.mjs'))) {
      const { availableReaders } = await import(path.join(TOOLS, 'dwg-readers.mjs'));
      const readers = availableReaders(TOOLS).filter((r) => !/libdxfrw/.test(r.name));   // libdxfrw's dwg2dxf never writes 3DFACEs (see CadCraft's dwg-save-check)
      if (!readers.length) note('no DWG reader installed (tools/civilcraft-test/setup-dwg-readers.sh)');
      for (const r of readers) {
        const got = r.run([dwgFile], OUT).get(dwgFile);
        let c = null;
        try { c = got && fs.existsSync(got.dxf) ? ez(got.dxf) : null; } catch (x) { note(r.name + ': ezdxf could not read its DXF: ' + x.message.split('\n')[0]); }
        ok(c && Math.abs(c.area - expArea) <= expArea * 1e-6 && sameBox(c.bbox, 1e-3) && c.lines === 1, `${r.name}: the DWG's faces add up to ${c ? c.area.toFixed(3) : '?'} mm² (ModelCraft ${expArea.toFixed(3)}), same extents` + (got?.problems?.length ? ' — reader said: ' + got.problems.slice(0, 2).join(' | ') : ''));
      }
    }
  }

  section('paint (0.4 M8): face and placement colours in the file and every export');
  {
    // a box with a red top; a component placed three times: plain, blue, and green with its own yellow top
    const mp = new Model(); mp.units = 'm';
    let iB, iC;
    mp.change('paint', (mm) => {
      addPolygon(mm.root, rectPts([0, 0, 0], [1, 0, 0], [0, 1, 0], 2, 1)); pushPull(mm.root, [...mm.root.faces.keys()][0], 0.5);
      const top = [...mm.root.faces].find(([, f]) => close(faceNormal(mm.root, f)[2], 1));
      M.paintFaces(mm.root, [top[0]], '#C0392B');
      const cd = mm.newDef('component', 'Post');
      addPolygon(cd, rectPts([0, 0, 0], [1, 0, 0], [0, 1, 0], 0.2, 0.2)); pushPull(cd, [...cd.faces.keys()][0], 1);
      mm.place(mm.root, cd.id, V.translation([4, 0, 0]));
      iB = mm.place(mm.root, cd.id, V.translation([5, 0, 0]));
      iC = mm.place(mm.root, cd.id, V.translation([6, 0, 0]));
      M.paintInstance(mm.root, iB, '#2b5fbd');
      M.paintInstance(mm.root, iC, '#2e9d57');
    });
    ok([...mp.root.faces.values()].some((f) => f.color === '#c0392b'), 'paintFaces stores the colour in lower case');
    // ModelCraft's own per-colour area: the reference every export is checked against
    const byColour = (tris) => { const o = {}; for (const t of tris) { const k = t.color || ''; o[k] = (o[k] || 0) + triArea(t.p); } return o; };
    const want = byColour(worldTriangles(mp));
    const post = 4 * 0.2 + 2 * 0.04;
    ok(close(want['#2b5fbd'], post, 1e-9) && close(want['#2e9d57'], post, 1e-9) && close(want['#c0392b'], 2, 1e-9), 'a placement colour fills every face of that copy that has none: blue post ' + want['#2b5fbd']?.toFixed(3) + ' m², green post ' + want['#2e9d57']?.toFixed(3) + ' m², the red top 2 m²');
    // a face colour of its own wins over the placement's
    mp.change('own', (mm) => { const cd = mm.def(mm.root.insts.get(iC).def); const top = [...cd.faces].find(([, f]) => close(faceNormal(cd, f)[2], 1)); M.paintFaces(cd, [top[0]], '#f1c40f'); });
    const want2 = byColour(worldTriangles(mp));
    ok(close(want2['#f1c40f'], 3 * 0.04, 1e-9) && close(want2['#2e9d57'], post - 0.04, 1e-9), 'a face painted inside the component keeps its own colour in every copy (yellow tops ×3; the green copy\'s other faces stay green)');
    const cmp = (got, label, tol = 1e-6) => {
      const keys = new Set([...Object.keys(want2), ...Object.keys(got)].filter((k) => (want2[k] || 0) > 1e-12 || (got[k] || 0) > 1e-12));
      const bad = [...keys].filter((k) => Math.abs((want2[k] || 0) - (got[k] || 0)) > tol * Math.max(1, want2[k] || 0));
      ok(!bad.length, `${label}: area per colour as in ModelCraft` + (bad.length ? ' — differs: ' + bad.map((k) => `${k || 'default'} ${(got[k] || 0).toFixed(4)} vs ${(want2[k] || 0).toFixed(4)}`).join(', ') : ''));
    };
    // file
    const mb = new Model(); mb.load(JSON.parse(JSON.stringify(mp.toJSON())));
    cmp(byColour(worldTriangles(mb)), 'native file round trip');
    // GLB: walk the nodes, area per material base colour
    {
      const glb = IO.exportGLB(mp), dv = new DataView(glb.buffer, glb.byteOffset);
      const jl = dv.getUint32(12, true), J = JSON.parse(new TextDecoder().decode(glb.subarray(20, 20 + jl))), bin = glb.subarray(28 + jl);
      const acc = (i) => { const a = J.accessors[i], bv = J.bufferViews[a.bufferView], n = { SCALAR: 1, VEC3: 3 }[a.type]; return a.componentType === 5126 ? new Float32Array(bin.buffer, bin.byteOffset + (bv.byteOffset || 0), a.count * n) : new Uint32Array(bin.buffer, bin.byteOffset + (bv.byteOffset || 0), a.count); };
      const lin2s = (x) => (x <= 0.0031308 ? x * 12.92 : 1.055 * x ** (1 / 2.4) - 0.055);
      const got = {};
      const visit = (ni, m) => {
        const nd = J.nodes[ni], mm2 = nd.matrix ? V.mmul(m, nd.matrix) : m;
        if (nd.mesh !== undefined) for (const pr of J.meshes[nd.mesh].primitives) {
          const mat = J.materials[pr.material], bc = mat.pbrMetallicRoughness.baseColorFactor;
          const k = bc ? '#' + bc.slice(0, 3).map((x) => Math.round(lin2s(x) * 255).toString(16).padStart(2, '0')).join('') : '';
          const P = acc(pr.attributes.POSITION), I = acc(pr.indices);
          for (let i = 0; i < I.length; i += 3) { const p = [0, 1, 2].map((q) => V.apply(mm2, [P[I[i + q] * 3], P[I[i + q] * 3 + 1], P[I[i + q] * 3 + 2]])); got[k] = (got[k] || 0) + triArea(p); }
        }
        for (const c of nd.children || []) visit(c, mm2);
      };
      visit(0, V.ident());
      cmp(got, 'GLB (meshes per placement colour, materials by base colour)', 1e-5);
      ok(J.meshes.length === 4, `GLB: the post gets one mesh per colour it is shown in (${J.meshes.length} meshes: box, post, blue post, green post)`);
    }
    // OBJ + MTL
    {
      const obj = IO.exportOBJ(mp, { mtl: 'paint.mtl' }), mtl = IO.exportMTL(mp);
      const kd = {}; let cur = null;
      for (const l of mtl.split('\n')) { if (l.startsWith('newmtl ')) cur = l.slice(7); else if (l.startsWith('Kd ') && cur) kd[cur] = l.slice(3).split(' ').map(Number); }
      const hex = (v) => '#' + v.map((x) => Math.round(x * 255).toString(16).padStart(2, '0')).join('');
      const vs = [], got = {}; let mat = null;
      for (const l of obj.split('\n')) {
        if (l.startsWith('v ')) vs.push(l.slice(2).split(' ').map(Number));
        else if (l.startsWith('usemtl ')) mat = l.slice(7);
        else if (l.startsWith('f ')) { const ids = l.slice(2).split(' ').map((x) => parseInt(x, 10) - 1); const k = mat === 'Default' ? '' : hex(kd[mat]); for (let i = 1; i + 1 < ids.length; i++) got[k] = (got[k] || 0) + triArea([vs[ids[0]], vs[ids[i]], vs[ids[i + 1]]]); }
      }
      ok(/^mtllib paint\.mtl$/m.test(obj) && Object.keys(kd).length === 5, `OBJ names its .mtl; the .mtl has the default and 4 colours (${Object.keys(kd).join(', ')})`);
      cmp(got, 'OBJ + MTL (usemtl per colour, Kd in sRGB)', 1e-5);
    }
    // Collada: schema + pycollada, area per material colour
    if (havePy) {
      const f = write('paint.dae', IO.exportDAE(mp, { name: 'paint' }));
      let c = null;
      try { c = JSON.parse(execFileSync(PY, ['-I', path.join(HERE, 'dae_check.py'), f], { encoding: 'utf8' })); } catch (x) { note('dae_check.py failed: ' + x.message.split('\n')[0]); }
      if (c) {
        ok(c.valid, 'Collada with placement colours is valid against the 1.4.1 schema' + (c.errors.length ? ': ' + c.errors[0] : ''));
        cmp(c.area_by_colour, 'Collada read by pycollada', 1e-5);
      }
    }
    // DXF: colour of each 3D face (nearest AutoCAD colour)
    {
      const { text } = IO.exportDXF(mp);
      const blocks = (text.match(/\r\nBLOCK\r\n/g) || []).length;
      const aci = new Set([...text.matchAll(/3DFACE\r\n {0,2}8\r\n0\r\n62\r\n(\d+)/g)].map((m) => +m[1]));
      ok(blocks === 3 && ['#c0392b', '#2b5fbd', '#2e9d57', '#f1c40f'].every((c) => aci.has(IO.nearestAci(c))), `DXF: a block per colour the post is shown in (${blocks}), each face in its nearest AutoCAD colour (${[...aci].join(', ')})`);
    }
  }

  section('files: DWG site plans (cc-dwg readDwg, read in place from the CadCraft test samples)');
  {
    const DWG_DIR = '/var/www/CADCRAFT/testfiles/dwg-samples';
    const files = fs.existsSync(DWG_DIR) ? fs.readdirSync(DWG_DIR).filter((f) => /\.dwg$/i.test(f)).sort() : [];
    if (!files.length) note('no sample DWGs at ' + DWG_DIR + ': DWG import not checked');
    else {
      // the app ships byte-identical copies of lib/dwg's reader; the browser path (dwg-reader.js) is the one tested
      const { READER_FILES } = await import(path.join(ROOT, 'tools/dwg-test/writer-sync.mjs'));
      const differ = READER_FILES.filter((f) => !fs.existsSync(path.join(APP, 'dwg', f)) || !fs.readFileSync(path.join(ROOT, 'lib/dwg', f)).equals(fs.readFileSync(path.join(APP, 'dwg', f))));
      ok(!differ.length, `dwg/ holds byte-identical copies of the ${READER_FILES.length} lib/dwg reader files` + (differ.length ? ' — differ: ' + differ.join(', ') + ' (node tools/dwg-test/writer-sync.mjs modelcraft)' : ''));
      const mf = fs.readFileSync(path.join(APP, 'manifest.json'), 'utf8') + fs.readFileSync(path.join(APP, 'ui.inc'), 'utf8') + fs.readFileSync(path.join(APP, 'dwg-reader.js'), 'utf8') + fs.readFileSync(path.join(APP, 'modelcraft.js'), 'utf8');
      ok(!/libredwg|dwgWasm|dwg-wasm/i.test(mf), 'no LibreDWG left in the manifest, the page, dwg-reader.js or modelcraft.js');
      const { readDWG } = await import(path.join(APP, 'dwg-reader.js'));
      let refused = null;
      try { await readDWG(new TextEncoder().encode('AC1009' + '\0'.repeat(200))); } catch (x) { refused = x.message; }
      ok(refused && /AC1009/.test(refused), 'an R12 DWG is refused with the reader\'s reason: ' + refused);
      const lenOf = (d) => [...d.edges.values()].reduce((s, e) => s + V.dist(d.verts.get(e.a), d.verts.get(e.b)), 0);
      const bbOf = (d) => { let b = null; for (const p of d.verts.values()) b = V.bboxAdd(b, p); return b; };
      const relClose = (a, b, tol) => Math.abs(a - b) <= tol * Math.max(1, Math.abs(a), Math.abs(b));
      let crossChecked = 0;
      // LibreDWG is a test-only oracle a clone fetches only with `npm test -- --oracles` (PROVENANCE.md): without it, skip the cross-check
      const VEND = path.join(ROOT, 'public_html/assets/vendor/libredwg-web');
      const haveLibre = fs.existsSync(path.join(VEND, 'current')) || (fs.existsSync(VEND) && fs.readdirSync(VEND).some((d) => /^\d/.test(d)));
      if (!haveLibre) note('LibreDWG (assets/vendor/libredwg-web) missing: DWG imports are checked, the cross-check against its DXF is skipped (npm test -- --oracles fetches it)');
      for (const f of files) {
        const bytes = new Uint8Array(fs.readFileSync(path.join(DWG_DIR, f)));
        let db = null;
        try { db = await readDWG(bytes); } catch (x) { ok(false, f + ': ' + x.message); continue; }
        const t0 = Date.now();
        const r = IO.importDWG(new Model(), db, f);
        const d = r.def, L = lenOf(d), bb = bbOf(d);
        // edges on the ground; 3D faces keep their heights (0.4 M1), so only edges no face uses must be at z = 0
        const onFace = new Set(); for (const fc of d.faces.values()) for (const l of fc.loops) for (const v of l) onFace.add(v);
        const flat = [...d.verts].every(([id, p]) => p.every(Number.isFinite) && (onFace.has(id) || p[2] === 0));
        const R = r.report;
        ok(d.edges.size > 0 && flat && r.units, `${f}: ${d.edges.size} edges on the ground, ${d.faces.size} faces, in ${r.units} (${Date.now() - t0} ms; lines ${R.lines}, polylines ${R.polylines}, arcs ${R.arcs}, circles ${R.circles}, inserts ${R.inserts}, splines ${R.splines}, ellipses ${R.ellipses}, texts ${R.texts}, hatches ${R.hatches}, 3D faces ${R.faces3d}, dimensions ${R.dimensions})`);
        // second path: LibreDWG's own DXF writer → our DXF reader must give the same site plan
        const dxfPath = path.join(OUT, f.replace(/\.dwg$/i, '.dxf'));
        let converted = false;
        if (haveLibre) try { execFileSync(process.execPath, [path.join(HERE, 'dwg2dxf.mjs'), path.join(DWG_DIR, f), dxfPath], { stdio: 'ignore', timeout: 60000 }); converted = fs.existsSync(dxfPath); } catch { converted = false; }
        if (!converted) { if (VERBOSE && haveLibre) note(f + ': LibreDWG\'s DXF writer could not convert it, so no DXF cross-check'); continue; }
        const r2 = IO.importDXF(new Model(), fs.readFileSync(dxfPath, 'latin1'), f);
        const L2 = lenOf(r2.def), bb2 = bbOf(r2.def);
        const sameBB = bb && bb2 && [0, 1].every((k) => relClose(bb.min[k], bb2.min[k], 1e-6) && relClose(bb.max[k], bb2.max[k], 1e-6));
        ok(r2.units === r.units && relClose(r2.def.edges.size, d.edges.size, 1e-3) && relClose(L2, L, 1e-4) && sameBB,
          `${f}: the DWG path matches the DXF LibreDWG writes, read by our DXF reader (${d.edges.size} vs ${r2.def.edges.size} edges, ${L.toFixed(3)} vs ${L2.toFixed(3)} m, same extents)`);
        crossChecked++;
        if (f === 'civil_example-imperial.dwg') {
          // the civil sample in inches; read again as if it said nothing: units null, the caller's unit used
          const noUnits = { ...db, header: { ...db.header, INSUNITS: 0 } };
          const r3 = IO.importDWG(new Model(), noUnits, f, { unit: 'ft' });
          ok(r.units === 'in' && r3.units === null && close(lenOf(r3.def), L * 12, 1e-6 * L * 12), `civil sample: $INSUNITS inches; without it the units come back null (the app asks), and feet makes it 12× longer (${L.toFixed(2)} → ${lenOf(r3.def).toFixed(2)} m)`);
          ok(r.report.inserts >= 1 && r.report.arcs >= 2 && r.report.skipped.DIMENSION > 0 && r.report.paperSpace > 0, 'civil sample: its block insert expanded, arcs drawn, dimensions and the paper space left out and counted');
        }
      }
      if (haveLibre) ok(crossChecked >= 3, `${crossChecked} of ${files.length} samples cross-checked against LibreDWG's DXF (its writer aborts on some versions; those are imported, not cross-checked)`);
      // the model's own closed flag (DWG LWPOLYLINE flag 512; 1 there means "has an extrusion"), an invisible line, a missing block
      const sq = { header: { INSUNITS: 6 }, blocks: [{ name: '*Model_Space', entities: [
        { type: 'LWPOLYLINE', flags: 512, closed: true, vertices: [{ x: 0, y: 0, bulge: 0 }, { x: 1, y: 0, bulge: 0 }, { x: 1, y: 1, bulge: 0 }, { x: 0, y: 1, bulge: 0 }] },
        { type: 'LWPOLYLINE', flags: 1, closed: false, vertices: [{ x: 5, y: 0, bulge: 1 }, { x: 7, y: 0, bulge: 0 }] },
        { type: 'LINE', invisible: true, start: { x: 0, y: 5, z: 0 }, end: { x: 9, y: 5, z: 0 } },
        { type: 'INSERT', block: 'nope', insert: { x: 0, y: 0, z: 0 } },
      ] }] };
      const rs = IO.importDWG(new Model(), sq, 'sq');
      const half = [...rs.def.edges.values()].filter((e) => rs.def.verts.get(e.a)[0] >= 5);
      ok(rs.units === 'm' && close(lenOf(rs.def), 4 + half.reduce((s, e) => s + V.dist(rs.def.verts.get(e.a), rs.def.verts.get(e.b)), 0), 1e-9) && half.length === 24 && rs.report.skipped['INSERT (missing block)'] === 1,
        'DWG model: closed (flag 512) closes the square (4 m), an open bulge polyline is a 24-segment half circle, an invisible line is left out, a missing block is counted');
    }
  }

  section('files: Collada (DAE) export (checked against the Collada 1.4.1 schema, read back by pycollada and trimesh)');
  {
    const mc = new Model();
    mc.load(JSON.parse(m.snapshot()));
    const top = [...mc.root.faces.values()].find((f) => V.dot(faceNormal(mc.root, f), [0, 0, 1]) > 0.999);
    top.color = '#cc3300';
    for (const f of mc.defs.get(wall.id).faces.values()) f.color = '#336699';
    const dae = IO.exportDAE(mc, { name: 'Test model', date: new Date('2026-10-10T12:00:00Z') });
    const file = write('model.dae', dae);
    ok(dae.startsWith('<?xml') && /<up_axis>Z_UP<\/up_axis>/.test(dae) && /<unit name="meter" meter="1"\/>/.test(dae), 'Collada 1.4.1, Z up, meters');
    ok((dae.match(/<geometry /g) || []).length === 4 && (dae.match(/<instance_node /g) || []).length === 3 && (dae.match(/<node id="comp-/g) || []).length === 1,
      'one geometry per definition (model, column, wall, pad); the column once in library_nodes, placed by 3 instance_nodes');
    ok((dae.match(/<polylist /g) || []).length === 5 && /<lines count="1">/.test(dae), 'one polylist per face set (colour) per geometry: 5; the loose edge as <lines>');
    const wt2 = M.worldTriangles(mc);
    const area2 = wt2.reduce((s, t) => s + triArea(t.p), 0);
    if (!havePy) note('pycollada/trimesh missing: tools/modelcraft-test/venv/bin/pip install trimesh numpy pycollada lxml');
    else {
      let c = null;
      try { c = JSON.parse(execFileSync(PY, ['-I', path.join(HERE, 'dae_check.py'), file], { encoding: 'utf8' })); } catch (x) { note('dae_check.py failed (pip install pycollada lxml?): ' + x.message.split('\n')[0]); }
      if (c) {
        ok(c.valid, `valid against the Collada 1.4.1 schema (${c.schema} copy)` + (c.errors.length ? ': ' + c.errors.join(' | ') : ''));
        ok(c.up === 'Z_UP' && c.meter === 1 && c.geometries === 4 && c.nodes === 1 && c.materials === 2, `pycollada: Z up, meter 1, ${c.geometries} geometries, ${c.nodes} library node, ${c.materials} materials`);
        ok(close(c.area, area2, 1e-4), `pycollada: scene triangle area ${c.area.toFixed(5)} = ${area2.toFixed(5)} m² (instance_node and node matrices applied)`);
        ok(boundsClose(c.zbounds, [bb.min, bb.max], 1e-4), 'pycollada: scene bounds = the model\'s');
        ok(JSON.stringify(c.colours) === JSON.stringify(['#336699', '#cc3300']), 'pycollada: the two face colours come back as material diffuse colours ' + JSON.stringify(c.colours));
      }
      try {
        const t = meshInfo(file);
        ok(close(t.area, area2, 1e-3) && boundsClose(t.bounds, [bb.min, bb.max], 1e-3), `trimesh: area ${t.area.toFixed(4)} m², bounds as the model (${t.triangles} triangles)`);
      } catch (x) { note('trimesh could not read the DAE: ' + x.message.split('\n')[0]); }
    }
    // our own reader
    const m3 = new Model();
    const r = IO.importDAE(m3, dae, 'model');
    m3.place(m3.root, r.def.id, V.ident());
    const wt3 = M.worldTriangles(m3);
    const area3 = wt3.reduce((s, t) => s + triArea(t.p), 0);
    let bb3 = null;
    for (const t of wt3) for (const p of t.p) bb3 = V.bboxAdd(bb3, p);
    ok(close(area3, area2, 1e-6) && bbClose(bb3, bb, 1e-6) && bbClose(m3.bbox(), mc.bbox(), 1e-6), `re-import: same face area (${area3.toFixed(6)} m²) and bounds (faces, and with the loose edge)`);
    const comps = [...m3.defs.values()].filter((d) => d.kind === 'component');
    ok(comps.length === 1 && comps[0].name === 'Column' && m3.instanceCounts().get(comps[0].id) === 3 && close(solidInfo(comps[0]).volume, colVol, 1e-9), 're-import: Column is one component with 3 instances and its 0.48 m³ solid');
    const w3 = [...m3.defs.values()].find((d) => d.name === 'Wall with opening');
    ok(w3 && w3.kind === 'group' && solidInfo(w3).closed && close(solidInfo(w3).volume, 3.6 - 0.45, 1e-9) && [...w3.faces.values()].every((f) => f.color === '#336699'), 're-import: the wall group keeps its exact name (spaces and all), stays a closed 3.15 m³ solid, blue faces');
    ok(r.def.name === 'model' && [...r.def.faces.values()].filter((f) => f.color === '#cc3300').length === 1 && [...r.def.edges.values()].some((e) => !M.edgeFaces(r.def).has(e.a < e.b ? e.a + '|' + e.b : e.b + '|' + e.a)), 're-import: the top face keeps its colour and the loose edge comes back');
  }

  section('files: Collada (DAE) import (files written by other programs)');
  {
    if (havePy) {
      const gfile = path.join(OUT, 'pycollada.dae');
      let ok2 = true;
      try { execFileSync(PY, ['-I', path.join(HERE, 'gen_dae.py'), gfile], { stdio: 'ignore' }); } catch (x) { ok2 = false; note('gen_dae.py failed (pip install pycollada?): ' + x.message.split('\n')[0]); }
      if (ok2) {
        const c = JSON.parse(execFileSync(PY, ['-I', path.join(HERE, 'dae_check.py'), gfile], { encoding: 'utf8' }));
        const m4 = new Model();
        const r = IO.importDAE(m4, fs.readFileSync(gfile, 'utf8'), 'pycollada');
        m4.place(m4.root, r.def.id, V.ident());
        const wt = M.worldTriangles(m4);
        const a = wt.reduce((s, t) => s + triArea(t.p), 0);
        let b4 = null;
        for (const t of wt) for (const p of t.p) b4 = V.bboxAdd(b4, p);
        ok(r.report.up === 'Y_UP' && r.report.meter === 0.0254, 'pycollada file: Y up, inches (unit meter 0.0254) read from <asset>');
        ok(close(a, c.area_m2, 1e-6) && close(a, 7000 * 0.0254 ** 2, 1e-9), `area ${a.toFixed(6)} m² = pycollada's own ${c.area_m2.toFixed(6)} (7000 sq in)`);
        ok(boundsClose([b4.min, b4.max], c.zbounds, 1e-6), 'bounds = pycollada\'s, turned Z up: ' + JSON.stringify([b4.min, b4.max].map((p) => p.map((x) => +x.toFixed(4)))));
        const post = [...m4.defs.values()].find((d) => d.name === 'Post');
        const names = [...r.def.insts.values()].map((i) => i.name || m4.defs.get(i.def).name).sort();
        ok(post && post.kind === 'component' && m4.instanceCounts().get(post.id) === 2 && JSON.stringify(names) === '["Placed_box","Post_A","Post_B"]', 'library node "Post" placed twice by instance_node → one component, 2 instances named Post_A / Post_B');
        const box = [...m4.defs.values()].find((d) => d.name === 'Placed_box');
        const boxInst = [...r.def.insts.values()].find((i) => i.def === box?.id);
        const boxVol = box && Math.abs(solidInfo(box).volume) * Math.abs(V.det3(boxInst.m));
        ok(box && box.faces.size === 12 && solidInfo(box).closed && close(boxVol, 10 * 40 * 30 * 0.0254 ** 3, 1e-12), `translate · rotate · scale(1, 2, 1): the 10 × 20 × 30 in box becomes ${(boxVol / 0.0254 ** 3).toFixed(1)} cu in (12 000)`);
        const cols = new Set(wt.map((t) => t.color));
        ok(cols.has('#ff0000') && cols.has('#0000ff') && cols.size === 2, 'bind_material → face colours red (box) and blue (posts)');
        const postZ = wt.filter((t) => t.color === '#0000ff').flatMap((t) => t.p.map((p) => p[2]));
        ok(postZ.every((z) => close(z, 5 * 0.0254, 1e-9)), 'the post\'s own matrix (lift of 5 in, Y up) puts both plates 5 in above the ground');
      }
    }
    // hand-written: holes, fans, strips, lines, X up, centimeters, and what is not read
    const X = (up, unit, body, extra = '') => `<?xml version="1.0"?>\n<!DOCTYPE COLLADA [<!ENTITY boom "BOOM">]>\n<COLLADA xmlns="http://www.collada.org/2005/11/COLLADASchema" version="1.4.1"><asset><unit meter="${unit}"/><up_axis>${up}</up_axis></asset>` +
      `<library_geometries><geometry id="g" name="Shapes &amp; holes"><mesh><source id="p"><float_array id="pa" count="0">${body.pts}</float_array><technique_common><accessor source="#pa" count="${body.n}" stride="3"/></technique_common></source>` +
      `<vertices id="v"><input semantic="POSITION" source="#p"/></vertices>${body.prims}</mesh></geometry></library_geometries>` +
      `<library_visual_scenes><visual_scene id="s"><node name="n &boom;"><lookat>0 0 1 0 0 0 0 1 0</lookat><instance_geometry url="#g"/>${extra}</node></visual_scene></library_visual_scenes><scene><instance_visual_scene url="#s"/></scene></COLLADA>`;
    // a 100 cm square with a 50 cm hole (polygons/ph), a fan (square 200..300), a strip (square 400..500), a line
    const pts = [[0, 0, 0], [100, 0, 0], [100, 100, 0], [0, 100, 0], [25, 25, 0], [75, 25, 0], [75, 75, 0], [25, 75, 0],
      [200, 0, 0], [300, 0, 0], [300, 100, 0], [200, 100, 0], [400, 0, 0], [500, 0, 0], [400, 100, 0], [500, 100, 0], [0, 200, 0], [100, 200, 0]];
    const body = {
      n: pts.length, pts: pts.flat().join(' '),
      prims: '<polygons count="1"><input semantic="VERTEX" source="#v" offset="0"/><ph><p>0 1 2 3</p><h>4 7 6 5</h></ph></polygons>' +
        '<trifans count="1"><input semantic="VERTEX" source="#v" offset="0"/><p>8 9 10 11</p></trifans>' +
        '<tristrips count="1"><input semantic="VERTEX" source="#v" offset="0"/><p>12 13 14 15</p></tristrips>' +
        '<lines count="1"><input semantic="VERTEX" source="#v" offset="0"/><p>16 17</p></lines>',
    };
    const r5 = IO.importDAE(new Model(), X('Z_UP', '0.01', body, '<node name="ext"><instance_node url="other.dae#thing"/></node><instance_light url="#nolight"/>'), 'hand');
    const d5 = r5.def;
    const area5 = [...d5.faces.values()].reduce((s, f) => s + faceArea(d5, f), 0);
    const holed = [...d5.faces.values()].find((f) => f.loops.length === 2);
    ok(holed && close(faceArea(d5, holed), 0.75, 1e-9) && close(area5, 0.75 + 1 + 1, 1e-9), `<ph> hole: a 1 m square with a 0.5 m hole = 0.75 m²; fan and strip squares 1 m² each (total ${area5.toFixed(4)} m², centimeters)`);
    ok(V.dot(faceNormal(d5, holed), [0, 0, 1]) > 0.999 && V.dot(V.newell(holed.loops[1].map((v) => d5.verts.get(v))), [0, 0, 1]) < -0.999, 'the hole runs against its face (CW), the face faces up');
    ok([...d5.edges.values()].some((e) => close(V.dist(d5.verts.get(e.a), d5.verts.get(e.b)), 1) && d5.verts.get(e.a)[1] === 2), '<lines> → a 1 m edge');
    ok(r5.report.skipped['lookat transforms'] === 1 && r5.report.skipped['references to other files'] === 1 && r5.report.skipped['cameras and lights'] === 1, 'not read, and counted: lookat, a reference to another file, a light: ' + JSON.stringify(r5.report.skipped));
    const XML = await import(path.join(APP, 'xml.js'));
    const xe = XML.parseXML('<?xml version="1.0"?><!DOCTYPE a [<!ENTITY x "BOOM"><!ENTITY y SYSTEM "file:///etc/passwd">]><a t="&lt;&#65;&#x42;">&x;&y;<![CDATA[<raw>]]>&amp;</a>');
    ok(xe.text === '&x;&y;<raw>&' && xe.attrs.t === '<AB', 'XML reader: DOCTYPE entities (internal and SYSTEM) are never expanded; the five predefined entities, character references and CDATA are');
    const tri = { n: 3, pts: '0 0 0 1 0 0 0 1 0', prims: '<triangles count="1"><input semantic="VERTEX" source="#v" offset="0"/><p>0 1 2</p></triangles>' };
    const r6 = IO.importDAE(new Model(), X('X_UP', '1', tri), 'x');
    const p6 = [...r6.def.verts.values()].map((p) => p.map((x) => Math.round(x * 1e9) / 1e9 + 0).join(',')).sort();
    ok(JSON.stringify(p6) === JSON.stringify(['-1,0,0', '0,0,0', '0,0,1']), 'X up: the file\'s X (up) becomes our Z, its Y becomes −X: ' + JSON.stringify(p6));
    const bad = (label, text, re) => {
      let e = null;
      try { IO.importDAE(new Model(), text, 'bad'); } catch (x) { e = x; }
      ok(e instanceof Error && re.test(e.message), `refused: ${label}${e ? ' ("' + e.message.slice(0, 80) + '")' : ''}`);
    };
    bad('not XML', 'solid cube\nfacet normal 0 0 1', /not well-formed|Collada/);
    bad('an unclosed tag', '<COLLADA><asset></COLLADA>', /does not match|never closed/);
    bad('another XML root', '<?xml version="1.0"?><svg xmlns="http://www.w3.org/2000/svg"/>', /not a Collada/);
    bad('an index past the vertices', X('Z_UP', '1', { ...tri, prims: tri.prims.replace('0 1 2', '0 1 9') }), /index/);
    bad('a short position array', X('Z_UP', '1', { ...tri, pts: '0 0 0 1 0' }), /shorter/);
    bad('a NaN coordinate', X('Z_UP', '1', { ...tri, pts: '0 0 0 1 0 x 0 1 0' }), /not a number/);
    bad('no geometry at all', X('Z_UP', '1', { n: 0, pts: '', prims: '' }), /no geometry/);
    const loop = '<?xml version="1.0"?><COLLADA><library_nodes><node id="a"><instance_node url="#b"/></node><node id="b"><instance_node url="#a"/></node></library_nodes>' +
      '<library_visual_scenes><visual_scene id="s"><node><instance_node url="#a"/></node></visual_scene></library_visual_scenes></COLLADA>';
    bad('nodes that place each other (and nothing else)', loop, /no geometry/);
  }

  section('files: IFC export (read back by web-ifc)');
  {
    const text = IO.exportIFC(m, { name: 'Pavilion — test', date: new Date('2026-10-10T12:00:00Z') });
    write('model.ifc', text);
    ok(text.startsWith('ISO-10303-21;') && /FILE_SCHEMA\(\('IFC4'\)\)/.test(text), 'IFC4 STEP header');
    ok(text === IO.exportIFC(m, { name: 'Pavilion — test', date: new Date('2026-10-10T12:00:00Z') }), 'the same model exports the same file (deterministic GlobalIds)');
    ok(/'Pavilion \\X2\\2014\\X0\\ test'/.test(text), 'non-ASCII names are \\X2\\ escaped');
    const ids = [...text.matchAll(/IFC[A-Z]+\('([0-9A-Za-z_$]{22})'/g)].map((x) => x[1]);
    ok(ids.length > 8 && new Set(ids).size === ids.length, `${ids.length} GlobalIds, all distinct, 22 characters`);
    ok(IO.stepString("it's \\ ok") === "'it''s \\\\ ok'", 'quotes doubled and backslashes escaped');
    let W = null;
    try { W = req('web-ifc'); } catch { note('web-ifc missing: (cd tools/modelcraft-test && npm install)'); }
    if (W) {
      const quiet = async (fn) => { const s = [console.log, console.warn, console.error]; console.log = console.warn = console.error = () => {}; try { return await fn(); } finally { [console.log, console.warn, console.error] = s; } };
      const res = await quiet(async () => {
        const api = new W.IfcAPI();
        await api.Init();
        const id = api.OpenModel(new TextEncoder().encode(text));
        const count = (t) => api.GetLineIDsWithType(id, t).size();
        const out = { proxies: count(W.IFCBUILDINGELEMENTPROXY), breps: count(W.IFCFACETEDBREP), surf: count(W.IFCSHELLBASEDSURFACEMODEL), storeys: count(W.IFCBUILDINGSTOREY), area: 0, bb: null, names: [] };
        for (const pid of api.GetLineIDsWithType(id, W.IFCBUILDINGELEMENTPROXY)) out.names.push(api.GetLine(id, pid).Name.value);
        api.StreamAllMeshes(id, (mesh) => {
          for (let i = 0; i < mesh.geometries.size(); i++) {
            const pg = mesh.geometries.get(i);
            const geom = api.GetGeometry(id, pg.geometryExpressID);
            const v = api.GetVertexArray(geom.GetVertexData(), geom.GetVertexDataSize());
            const ix = api.GetIndexArray(geom.GetIndexData(), geom.GetIndexDataSize());
            const T = pg.flatTransformation;
            const P = (k) => { const p = V.apply(T, [v[k * 6], v[k * 6 + 1], v[k * 6 + 2]]); return [p[0], -p[2], p[1]]; };   // web-ifc hands Y up
            for (let t = 0; t < ix.length; t += 3) {
              const ps = [P(ix[t]), P(ix[t + 1]), P(ix[t + 2])];
              out.area += triArea(ps);
              for (const p of ps) out.bb = V.bboxAdd(out.bb, p);
            }
            geom.delete?.();
          }
        });
        api.CloseModel(id);
        return out;
      });
      ok(res.storeys === 1, 'one storey');
      ok(res.proxies === 6, `6 building element proxies (3 columns, wall, pad, loose geometry): ${res.proxies}`);
      ok(res.breps === 5 && res.surf === 1, `5 faceted breps (closed) + 1 surface model (the open pad): ${res.breps} + ${res.surf}`);
      ok(res.names.includes('Loose geometry') && res.names.filter((x) => x === 'Column').length === 3 && res.names.includes('Wall with opening'), 'proxy names from the definitions');
      ok(close(res.area, expArea, 1e-4), `web-ifc triangle area ${res.area.toFixed(5)} = ${expArea.toFixed(5)} m²`);
      ok(bbClose(res.bb, bb, 1e-4), 'web-ifc bounding box = the model\'s (instance placements applied, the scaled column baked)');
    // storeys (0.4 M12): a box on the ground and one on the floor above, two storeys at 0 and 3 m
    {
      const ms = new Model();
      const box = (z, nm) => { const d = ms.newDef('group', nm); addPolygon(d, rectPts([0, 0, 0], [1, 0, 0], [0, 1, 0], 2, 2)); pushPull(d, [...d.faces.keys()][0], 1); ms.place(ms.root, d.id, V.translation([1, 1, z])); };
      box(0, 'Ground box'); box(3, 'Upper box');
      ms.storeys = M.cleanStoreys([{ name: 'Upper floor', elevation: 3 }, { name: 'Ground floor', elevation: 0 }]);
      const t2 = IO.exportIFC(ms, { name: 'Storeys', date: new Date('2026-10-10T12:00:00Z') });
      write('storeys.ifc', t2);
      const r2 = await quiet(async () => {
        const api = new W.IfcAPI(); await api.Init();
        const id = api.OpenModel(new TextEncoder().encode(t2));
        const out = { storeys: [], bb: null };
        for (const sid of api.GetLineIDsWithType(id, W.IFCBUILDINGSTOREY)) { const st = api.GetLine(id, sid); out.storeys.push([st.Name.value, st.Elevation.value]); }
        for (const rid of api.GetLineIDsWithType(id, W.IFCRELCONTAINEDINSPATIALSTRUCTURE)) {
          const r = api.GetLine(id, rid), st = api.GetLine(id, r.RelatingStructure.value);
          out[st.Name.value] = r.RelatedElements.map((e) => api.GetLine(id, e.value).Name.value);
        }
        api.StreamAllMeshes(id, (mesh) => { for (let i = 0; i < mesh.geometries.size(); i++) { const pg = mesh.geometries.get(i), geom = api.GetGeometry(id, pg.geometryExpressID), v = api.GetVertexArray(geom.GetVertexData(), geom.GetVertexDataSize()); for (let k = 0; k < v.length; k += 6) { const p = V.apply(pg.flatTransformation, [v[k], v[k + 1], v[k + 2]]); out.bb = V.bboxAdd(out.bb, [p[0], -p[2], p[1]]); } geom.delete?.(); } });
        api.CloseModel(id);
        return out;
      });
      ok(r2.storeys.length === 2 && r2.storeys.some(([n, e]) => n === 'Upper floor' && close(e, 3)) && r2['Ground floor']?.join() === 'Ground box' && r2['Upper floor']?.join() === 'Upper box', `IFC with storeys: Ground floor (0) holds the ground box, Upper floor (3 m) the upper one (${JSON.stringify(r2.storeys)})`);
      ok(bbClose(r2.bb, ms.bbox(), 1e-6), 'and both boxes stay where they are (web-ifc bounding box = the model\'s)');
    }
  }
  }
}
