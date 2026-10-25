#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * meshfiles.mjs — ModelCraft's OBJ + MTL, PLY, STL and Alembic (modelcraft/dev/io/{obj,ply,stl,abc}.js; 0.7 XF.3, session
 * `interchange`). Run by bin/test-modelcraft.mjs (§ OBJ, PLY, STL, Alembic) or on its own:
 *   node tools/modelcraft-test/meshfiles.mjs [--no-fuzz]
 *
 * Second readers / writers, test-only and outside every repo (a missing one is said and its checks skipped):
 * trimesh + plyfile in /var/www/CADCRAFT/oracles/mesh-venv (`pip install trimesh numpy plyfile pillow`), and the Alembic
 * library's own reader/writer through /var/www/CADCRAFT/oracles/alembic-oracle/alembic-oracle (built by
 * /var/www/CADCRAFT/oracles/build-alembic.sh from refs/alembic, BSD-3). Small files only, in tmp/meshfiles-test/.
 *
 *   run({ ok, close, section, APP })
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../..');
const PY = '/var/www/CADCRAFT/oracles/mesh-venv/bin/python';
const ABC = '/var/www/CADCRAFT/oracles/alembic-oracle/alembic-oracle';
const ABC_TESTS = '/var/www/CADCRAFT/refs/alembic/lib/Alembic/AbcGeom/Tests';
const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==', 'base64');

async function libs(APP) {
  const I18N = await import(path.join(APP, 'i18n.js'));
  const LANG = path.join(APP, 'lang/en.json');
  if (fs.existsSync(LANG)) I18N.init({ locale: 'en', strings: JSON.parse(fs.readFileSync(LANG, 'utf8')) });
  return {
    M: await import(path.join(APP, 'model.js')), V: await import(path.join(APP, 'vec.js')),
    O: await import(path.join(APP, 'io/obj.js')), P: await import(path.join(APP, 'io/ply.js')),
    S: await import(path.join(APP, 'io/stl.js')), A: await import(path.join(APP, 'io/abc.js')),
  };
}

// ------------------------------------------------------------------ worker: fuzz one file through one reader
if (!isMainThread && workerData?.meshFuzz) {
  const { APP, file, kind, cuts, flips, seed } = workerData;
  const { M, O, P, S, A } = await libs(APP);
  const bytes = new Uint8Array(fs.readFileSync(file));
  const res = [];
  const one = async (b, tag) => {
    try {
      const model = new M.Model();
      if (kind === 'abc') { const a = A.readAbc(b); model.change('x', (m) => A.importAbc(m, a, 'f')); }
      else if (kind === 'ply') { const p = P.readPly(b); model.change('x', (m) => P.importPly(m, p, 'f')); }
      else if (kind === 'stl') { const s = S.readStl(b); model.change('x', (m) => S.importStl(m, s, 'f')); }
      else { const o = await O.readObj(b); model.change('x', (m) => O.importObj(m, o, 'f')); }
      res.push({ tag, ok: 'read' });
    } catch (e) {
      const expected = e instanceof A.AbcError || (e && typeof e.message === 'string' && /This (OBJ|PLY|STL|Alembic) file|This is not an? (PLY|STL|Alembic)/.test(e.message));
      res.push(expected ? { tag, ok: 'refused' } : { tag, bad: e && e.stack ? e.stack.split('\n').slice(0, 3).join(' | ') : String(e) });
    }
  };
  for (const c of cuts) await one(bytes.subarray(0, c), '@' + c);
  let s = seed >>> 0;
  const rnd = () => { s = (s + 0x6d2b79f5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  for (let k = 0; k < flips; k++) {
    const b = bytes.slice();
    for (let j = 0, n = 1 + Math.floor(rnd() * 6); j < n; j++) b[Math.floor(rnd() * b.length)] = Math.floor(rnd() * 256);
    await one(b, 'flip' + k);
  }
  parentPort.postMessage(res);
}

export async function run({ ok, close, section, APP }) {
  const { M, V, O, P, S, A } = await libs(APP);
  const TMP = path.join(ROOT, 'tmp/meshfiles-test');
  fs.rmSync(TMP, { recursive: true, force: true });
  fs.mkdirSync(TMP, { recursive: true });
  const havePy = fs.existsSync(PY);
  const haveAbc = fs.existsSync(ABC);
  const py = (code, ...args) => execFileSync(PY, ['-I', '-c', code, ...args], { encoding: 'utf8', maxBuffer: 1e8 });
  const ident = V.ident();
  const meshes = (model) => [...model.defs.values()].filter((d) => d.mesh);
  const worldPts = (model) => { const out = []; model.walk((d, wm) => { if (!d.mesh) return; const p = d.mesh.P; for (let v = 0; v < d.mesh.nv; v++) out.push(V.apply(wm, [p[v * 3], p[v * 3 + 1], p[v * 3 + 2]])); }); return out; };
  const into = (fn) => { const model = new M.Model(); const r = model.change('import', (m) => { const x = fn(m); m.place(m.root, x.def.id, ident); return x; }); return { model, r }; };

  section('OBJ + MTL');
  {
    const obj = ['mtllib looks.mtl', 'o Slab', 'v 0 0 0', 'v 2 0 0', 'v 2 0 -1', 'v 0 0 -1', 'v 1 0 -1.6', 'vt 0 0', 'vt 1 0', 'vt 1 1', 'vt 0 1', 'vn 0 1 0',
      'usemtl Brick', 's off', 'f 1/1/1 2/2/1 3/3/1 4/4/1', 'usemtl Plain', 'f -2/4/1 -3/3/1 5/1/1', 'l 1 2', 'g Second', 'v 0 1 0 1 0 0', 'v 1 1 0 0 1 0', 'v 0 2 0 0 0 1', 'f 6 7 8', 'p 1'].join('\n');
    const mtl = ['newmtl Brick', 'Kd 0.8 0.2 0.1', 'map_Kd -s 2 2 -o 0.5 0 brick.png', 'map_Bump bump.png', 'newmtl Plain', 'Kd 0.5 0.5 0.5'].join('\n');
    const files = { 'looks.mtl': new TextEncoder().encode(mtl), 'brick.png': new Uint8Array(PNG) };
    const parsed = await O.readObj(obj, { resolve: async (n) => files[n] || null });
    const { model, r } = into((m) => O.importObj(m, parsed, 'test'));
    const ms = meshes(model);
    ok(ms.length === 2 && r.report.objects === 2, 'o and g make two mesh definitions', JSON.stringify(r.report));
    const slab = ms.find((d) => d.name === 'Slab');
    ok(slab && slab.mesh.faceCount === 2 && [...slab.mesh.faceCorners(0, [])].length === 4, 'faces stay as they are: a quad and a triangle', slab && slab.mesh.faceCount);
    const pt = worldPts(model).find((p) => close(p[0], 2) && close(p[2], 0));
    ok(pt && close(pt[1], 0), 'Y up → Z up: OBJ (2, 0, −1) sits at (2, 1, 0)… the quad lies flat on the ground', JSON.stringify(worldPts(model).slice(0, 4)));
    ok(M.isImagePaint(slab.mesh.facePaint(0)) && model.images.size === 1 && slab.mesh.facePaint(1) === '#808080', 'map_Kd → an image paint; a plain Kd → its colour (#808080)', slab.mesh.facePaint(0) + ' ' + slab.mesh.facePaint(1));
    const uv = slab.mesh.attrArray('uv');
    const cs = slab.mesh.faceCorners(0, []);
    ok(uv && close(uv[cs[2] * 2], 2.5, 1e-6) && close(uv[cs[2] * 2 + 1], 2, 1e-6), 'map_Kd -s 2 2 -o 0.5 0 applied to the uv layer (vt 1 1 → 2.5, 2)', uv && [uv[cs[2] * 2], uv[cs[2] * 2 + 1]].join(','));
    const nrm = slab.mesh.attrArray('normal');
    ok(nrm && close(nrm[cs[0] * 3 + 2], 1, 1e-6), 'vn 0 1 0 → the normal layer pointing up (Z)');
    const second = ms.find((d) => d.name === 'Second');
    ok(second && second.mesh.hasAttr('color') && second.mesh.attrArray('color')[0] !== second.mesh.attrArray('color')[4], 'v x y z r g b → the color layer');
    ok(Object.keys(r.report.skipped).some((k) => /lines/.test(k)) && Object.keys(r.report.skipped).some((k) => /points/.test(k)) && Object.keys(r.report.skipped).some((k) => /bump|colour map/.test(k)), 'lines, points and other maps are counted', JSON.stringify(r.report.skipped));
    const miss = await O.readObj('mtllib gone.mtl\nv 0 0 0\nv 1 0 0\nv 0 1 0\nf 1 2 3\n', { resolve: async () => null });
    ok(Object.keys(miss.notes).some((k) => /gone\.mtl/.test(k)), 'a materials file that was not given is named');
    let refused = '';
    try { await O.readObj('v 0 0 0\nv nope 0 0\n'); } catch (e) { refused = e.message; }
    ok(/damaged/.test(refused), 'a broken vertex line is refused', refused);
    // export, then read back
    const out = O.exportObj(model, { base: 'round trip' });
    ok(out.mtlName === 'round_trip.mtl' && /map_Kd textures\//.test(out.mtl) && out.images.length === 1, 'export: a .mtl naming the texture, the picture handed back for the zip', out.mtl);
    const files2 = { [out.mtlName]: new TextEncoder().encode(out.mtl), [out.images[0].name.split('/').pop()]: out.images[0].bytes };
    const back = await O.readObj(out.obj, { resolve: async (n) => files2[n.split('/').pop()] || null });
    const { model: m2, r: r2 } = into((m) => O.importObj(m, back, 'back'));
    const a = worldPts(model).map((p) => p.map((x) => x.toFixed(5)).join(',')).sort();
    const b = [...new Set(worldPts(m2).map((p) => p.map((x) => x.toFixed(5)).join(',')))].sort();
    ok(r2.report.faces === 3 && JSON.stringify([...new Set(a)].sort()) === JSON.stringify(b), 'OBJ → ModelCraft → OBJ → ModelCraft: same faces and points', r2.report.faces + ' faces');
    const s2 = meshes(m2).find((d) => d.mesh.faceCount === 2);
    const u2 = s2 && s2.mesh.attrArray('uv');
    ok(u2 && Math.max(...Array.from(u2.subarray(0, s2.mesh.nh * 2))) > 2.4 && model.images.size === 1 && m2.images.size === 1, 'the texture and its UVs come back');
    if (havePy) {
      const f = path.join(TMP, 'export.obj');
      fs.writeFileSync(f, out.obj);
      fs.writeFileSync(path.join(TMP, out.mtlName), out.mtl);
      const info = JSON.parse(py('import trimesh,json,sys; s=trimesh.load(sys.argv[1], force="scene", process=False); g=list(s.geometry.values()); print(json.dumps({"n":len(g),"faces":sum(len(x.faces) for x in g),"bounds":s.bounds.tolist()}))', f));
      ok(info.n >= 2 && info.faces === 4, 'trimesh reads our OBJ (4 triangles from a quad + 2 triangles)', JSON.stringify(info));
    }
  }

  section('PLY');
  {
    if (havePy) {
      for (const fmt of ['ascii', 'binary_big_endian', 'binary_little_endian']) {
        const f = path.join(TMP, 'oracle-' + fmt + '.ply');
        py(`import numpy as np, sys
from plyfile import PlyData, PlyElement
v = np.array([(0,0,0, 255,0,0, 0,0,1, 0.0,0.0),(1,0,0, 0,255,0, 0,0,1, 1.0,0.0),(1,1,0, 0,0,255, 0,0,1, 1.0,1.0),(0,1,0, 255,255,255, 0,0,1, 0.0,1.0),(0.5,1.5,0, 10,20,30, 0,0,1, 0.5,1.5)],
  dtype=[('x','f4'),('y','f4'),('z','f4'),('red','u1'),('green','u1'),('blue','u1'),('nx','f4'),('ny','f4'),('nz','f4'),('s','f4'),('t','f4')])
fc = np.empty(2, dtype=[('vertex_indices','i4',(4,)) ])
fs = np.array([([0,1,2,3],), ([3,2,4],)], dtype=object)
faces = np.array([([0,1,2,3],200,100,50),([3,2,4],0,0,0)], dtype=[('vertex_indices','O'),('red','u1'),('green','u1'),('blue','u1')])
el = [PlyElement.describe(v,'vertex'), PlyElement.describe(faces,'face'), PlyElement.describe(np.array([(1.5,)],dtype=[('w','f8')]),'extra')]
PlyData(el, text=(sys.argv[2]=='ascii'), byte_order=('>' if 'big' in sys.argv[2] else '<'), comments=['made by plyfile']).write(sys.argv[1])`, f, fmt);
        const ply = P.readPly(fs.readFileSync(f));
        const { model, r } = into((m) => P.importPly(m, ply, 'ply'));
        const [md] = meshes(model);
        ok(md && md.mesh.faceCount === 2 && md.mesh.vertexCount === 5 && md.mesh.hasAttr('uv') && md.mesh.hasAttr('normal') && md.mesh.hasAttr('color'), 'plyfile ' + fmt + ': quad + triangle with uv, normals, colours', JSON.stringify(r.report));
        ok(md.mesh.facePaint(0) === '#cc6633' && Object.keys(r.report.skipped).some((k) => /extra/.test(k)), fmt + ': the face colour (200, 100, 50) paints the face (nearest of 4,096: #cc6633); an unknown element is skipped', md.mesh.facePaint(0) + ' ' + JSON.stringify(r.report.skipped));
      }
      // our export → plyfile + trimesh
      const model = new M.Model();
      model.change('box', (m) => {
        const pts = [[0, 0, 0], [2, 0, 0], [2, 1, 0], [0, 1, 0]];
        const d = M.meshDef(m, [pts, pts.map(([x, y]) => [x, y, 1]).reverse()], 'Slab');
        for (const f of d.faces.values()) f.color = '#336699';
        m.place(m.root, d.id, ident);
      });
      const { bytes, report } = P.exportPly(model);
      const f = path.join(TMP, 'ours.ply');
      fs.writeFileSync(f, bytes);
      const info = JSON.parse(py(`import json, sys
from plyfile import PlyData
p = PlyData.read(sys.argv[1]); v = p['vertex']; fc = p['face']
print(json.dumps({"v": len(v), "f": len(fc), "rgb": [int(v['red'][0]), int(v['green'][0]), int(v['blue'][0])], "zmax": float(max(v['z']))}))`, f));
      ok(info.f === report.faces && info.rgb.join() === '51,102,153' && close(info.zmax, 1, 1e-6), 'plyfile reads our PLY: faces, colour #336699, heights', JSON.stringify(info));
      const tri = JSON.parse(py('import trimesh,json,sys; m=trimesh.load(sys.argv[1], process=False); print(json.dumps({"faces":len(m.faces),"bounds":m.bounds.tolist()}))', f));
      ok(tri.bounds[1][0] === 2 && tri.bounds[1][2] === 1, 'trimesh reads it with the right bounds', JSON.stringify(tri));
      const back = into((m) => P.importPly(m, P.readPly(bytes), 'back'));
      ok(meshes(back.model)[0].mesh.facePaint(0) === '#336699', 'and it comes back painted the same');
    } else console.log('  mesh oracles not found at ' + PY + ' — PLY / OBJ / STL second-reader checks skipped.');
    let refused = '';
    try { P.readPly(new TextEncoder().encode('ply\nformat binary_little_endian 1.0\nelement vertex 99\nproperty float x\nend_header\n')); } catch (e) { refused = e.message; }
    ok(/damaged/.test(refused), 'a PLY cut short is refused', refused);
    const pts = into((m) => P.importPly(m, P.readPly(new TextEncoder().encode('ply\nformat ascii 1.0\nelement vertex 2\nproperty float x\nproperty float y\nproperty float z\nend_header\n0 0 0\n1 1 1\n')), 'cloud'));
    ok(pts.r.report.points === 2 && !meshes(pts.model).length, 'a PLY with points only is counted, not imported (a point cloud)');
  }

  section('STL');
  {
    if (havePy) {
      const f = path.join(TMP, 'oracle.stl');
      py('import trimesh,sys; m=trimesh.creation.box(extents=(20,10,5)); m.export(sys.argv[1])', f);
      const stl = S.readStl(fs.readFileSync(f));
      const { model, r } = into((m) => S.importStl(m, stl, 'box'));
      const bb = model.bbox();
      ok(r.report.faces === 12 && r.report.vertices === 8 && close(bb.max[0] - bb.min[0], 0.02, 1e-9), 'trimesh\'s 20 × 10 × 5 box: 12 faces on 8 welded vertices, read as millimetres', JSON.stringify(bb));
      const info = meshes(model)[0].mesh.info();
      ok(info.closed && info.volume > 0, 'the box comes in closed, faces outward (volume > 0)', JSON.stringify(info));
      const af = path.join(TMP, 'oracle-ascii.stl');
      py('import trimesh,sys; m=trimesh.creation.icosphere(subdivisions=1); open(sys.argv[1],"w").write(trimesh.exchange.stl.export_stl_ascii(m))', af);
      const a = S.readStl(fs.readFileSync(af));
      ok(a.ascii && a.triangles === 80, 'an ASCII STL from trimesh: 80 triangles');
      const { bytes } = S.exportStl(model);
      const sf = path.join(TMP, 'ours.stl');
      fs.writeFileSync(sf, bytes);
      const tri = JSON.parse(py('import trimesh,json,sys; m=trimesh.load(sys.argv[1]); print(json.dumps({"faces":len(m.faces),"volume":float(m.volume)}))', sf));
      ok(tri.faces === 12 && close(tri.volume, 1000, 1e-3), 'trimesh reads our STL: 12 faces, 1,000 mm³', JSON.stringify(tri));
    }
    // colours, both conventions
    const tri = (attr, head = '') => {
      const b = new Uint8Array(84 + 50);
      for (let i = 0; i < head.length; i++) b[i] = head.charCodeAt(i);
      const dv = new DataView(b.buffer);
      dv.setUint32(80, 1, true);
      [[0, 0, 1], [0, 0, 0], [10, 0, 0], [0, 10, 0]].flat().forEach((v, i) => dv.setFloat32(84 + i * 4, v, true));
      dv.setUint16(84 + 48, attr, true);
      return b;
    };
    const vis = S.readStl(tri(0x8000 | (31 << 10)));
    ok(vis.convention === 'viscam' && close(vis.colors[0], 1, 1e-6) && vis.colors[2] === 0, 'VisCAM / SolidView: bit 15 + red in bits 10–14 → red');
    const mag = S.readStl(tri(31, 'COLOR=' + String.fromCharCode(0, 255, 0, 255)));
    ok(mag.convention === 'magics' && close(mag.colors[0], 1, 1e-6), 'Materialise: COLOR= in the header and red in bits 0–4 (bit 15 clear)', JSON.stringify(Array.from(mag.colors)));
    const magPart = S.readStl(tri(0x8000, 'COLOR=' + String.fromCharCode(0, 255, 0, 255)));
    ok(close(magPart.colors[1], 1, 1e-6) && magPart.colors[0] === 0, 'Materialise: bit 15 set → the part colour from the header (green)');
    const painted = new M.Model();
    painted.change('p', (m) => { const d = M.meshDef(m, [[[0, 0, 0], [1, 0, 0], [0, 1, 0]]], 'T'); for (const f of d.faces.values()) f.color = '#ff0000'; m.place(m.root, d.id, ident); });
    const round = S.readStl(S.exportStl(painted).bytes);
    ok(round.convention === 'viscam' && close(round.colors[0], 1, 1e-6), 'our STL carries a painted face\'s colour (VisCAM) and reads it back');
    let refused = '';
    try { S.readStl(tri(0).subarray(0, 100)); } catch (e) { refused = e.message; }
    ok(/damaged|not an STL/.test(refused), 'an STL cut short is refused', refused);
  }

  section('Alembic');
  if (!haveAbc) console.log('  Alembic oracle not found at ' + ABC + ' — Alembic checks skipped.');
  else {
    for (const c of ['cube', 'anim', 'hier', 'big']) execFileSync(ABC, ['write', path.join(TMP, c + '.abc'), c]);
    const cmp = (file, time) => {
      const abc = A.readAbc(fs.readFileSync(file), { time });
      const { model, r } = into((m) => A.importAbc(m, abc, 'abc'));
      const ours = new Set(worldPts(model).map((q) => [q[0], q[2], -q[1]].map((x) => Math.round(x * 1e4) / 1e4).join(',')));
      const o = JSON.parse(execFileSync(ABC, ['dump', file, String(time ?? 0)], { encoding: 'utf8', maxBuffer: 1e9 }));
      const theirs = new Set();
      let faces = 0;
      for (const m of o.meshes) { for (let i = 0; i < m.points.length; i += 3) theirs.add([m.points[i], m.points[i + 1], m.points[i + 2]].map((x) => Math.round(x * 1e4) / 1e4).join(',')); faces += m.counts.length; }
      let miss = 0;
      for (const k of theirs) if (!ours.has(k)) miss++;
      return { model, r, faces, miss, n: theirs.size, abc };
    };
    const cube = cmp(path.join(TMP, 'cube.abc'));
    ok(cube.r.report.faces === 6 && !cube.miss, 'a cube under translate + rotate Z + scale: the Alembic library\'s own world points, every one', cube.miss + ' missing of ' + cube.n);
    const cm = meshes(cube.model)[0].mesh;
    ok(cm.hasAttr('uv') && cm.hasAttr('normal') && cm.info().volume > 0, 'indexed facevarying uv and N come in; clockwise faces turned round (volume > 0)', JSON.stringify(cm.info()));
    for (const time of [0, 1 / 24, 2 / 24]) {
      const a = cmp(path.join(TMP, 'anim.abc'), time);
      ok(!a.miss && a.abc.samples === 3, 'an animated cache read at ' + (time * 24) + '/24 s matches the library at that time', a.miss + ' missing');
    }
    const hier = cmp(path.join(TMP, 'hier.abc'));
    ok(!hier.miss && hier.r.report.faces === 13 && hier.r.report.meshes === 3, 'nested xforms, one that does not inherit, a matrix op: all points where the library puts them', hier.miss + ' missing of ' + hier.n);
    const big = cmp(path.join(TMP, 'big.abc'));
    ok(!big.miss && big.r.report.faces === 90000, '90,000 quads read and placed', big.miss + ' missing');
    let code = '';
    try { A.readAbc(new Uint8Array([0x89, 0x48, 0x44, 0x46, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0, 0, 0, 0, 0])); } catch (e) { code = e.code; }
    ok(code === 'unsupported', 'an HDF5 Alembic file is refused with a reason');
    code = '';
    try { A.readAbc(new TextEncoder().encode('solid not alembic at all')); } catch (e) { code = e.code; }
    ok(code === 'not_abc', 'not an Alembic file');
    const unclosed = new Uint8Array(fs.readFileSync(path.join(TMP, 'cube.abc')));
    unclosed[5] = 0;
    code = '';
    try { A.readAbc(unclosed); } catch (e) { code = e.code; }
    ok(code === 'damaged', 'a file that was never closed is refused (as the library does)');
    // the library's own malformed test files
    for (const f of ['fuzzer_issue25695.abc', 'malformed_xform.abc']) {
      const p = path.join(ABC_TESTS, f);
      if (!fs.existsSync(p)) continue;
      let outcome = 'read';
      try { const a = A.readAbc(fs.readFileSync(p)); new M.Model().change('x', (m) => A.importAbc(m, a, 'x')); } catch (e) { outcome = e instanceof A.AbcError ? 'AbcError' : 'BAD ' + e.message; }
      ok(!outcome.startsWith('BAD'), 'the Alembic project\'s ' + f + ': ' + outcome);
    }
  }

  if (!process.argv.includes('--no-fuzz')) {
    section('OBJ, PLY, STL, Alembic: fuzz (worker, time limit)');
    const set = [];
    if (fs.existsSync(path.join(TMP, 'cube.abc'))) set.push([path.join(TMP, 'cube.abc'), 'abc'], [path.join(TMP, 'hier.abc'), 'abc']);
    if (fs.existsSync(path.join(TMP, 'oracle-binary_little_endian.ply'))) set.push([path.join(TMP, 'oracle-binary_little_endian.ply'), 'ply'], [path.join(TMP, 'oracle-ascii.ply'), 'ply']);
    if (fs.existsSync(path.join(TMP, 'oracle.stl'))) set.push([path.join(TMP, 'oracle.stl'), 'stl']);
    if (fs.existsSync(path.join(TMP, 'export.obj'))) set.push([path.join(TMP, 'export.obj'), 'obj']);
    for (const [file, kind] of set) {
      const size = fs.statSync(file).size;
      const cuts = new Set([0, 4, 16, 40, 100, size - 1]);
      for (let i = 1; i <= 10; i++) cuts.add(Math.floor(size * i / 11));
      const res = await new Promise((resolve) => {
        const w = new Worker(fileURLToPath(import.meta.url), { workerData: { meshFuzz: true, APP, file, kind, cuts: [...cuts].filter((c) => c >= 0).sort((a, b) => a - b), flips: 40, seed: size } });
        const timer = setTimeout(() => { w.terminate(); resolve({ hang: true }); }, 180000);
        w.once('message', (m) => { clearTimeout(timer); w.terminate(); resolve(m); });
        w.once('error', (e) => { clearTimeout(timer); resolve([{ tag: 'worker', bad: e.message }]); });
      });
      if (res.hang) { ok(false, 'fuzz ' + path.basename(file), 'no answer within 180 s'); continue; }
      const bad = res.filter((x) => x.bad);
      const counts = {};
      for (const x of res) { const k = x.ok || 'BAD'; counts[k] = (counts[k] || 0) + 1; }
      ok(!bad.length, 'fuzz ' + path.basename(file) + ' (' + Object.entries(counts).map(([k, n]) => n + ' ' + k).join(', ') + ')', bad.slice(0, 2).map((x) => x.tag + ' ' + x.bad).join(' || '));
    }
  }
  fs.rmSync(TMP, { recursive: true, force: true });
}

if (isMainThread && process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const APP = path.join(ROOT, 'public_html/assets/apps/modelcraft/dev');
  let pass = 0;
  let fail = 0;
  const ok = (c, what, d) => { if (c) pass++; else { fail++; console.log('  FAIL ' + what + (d ? ' — ' + d : '')); } };
  const close = (a, b, eps = 1e-9) => Math.abs(a - b) <= eps;
  await run({ ok, close, section: (s) => console.log(s), APP });
  console.log('\n' + pass + ' passed, ' + fail + ' failed');
  process.exit(fail ? 1 : 0);
}
