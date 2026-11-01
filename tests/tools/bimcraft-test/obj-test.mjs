/* SPDX-License-Identifier: Apache-2.0 */
/**
 * obj-test.mjs — OBJ import (0.8 SU.1055, session bim-08), run by  node bin/test-bimcraft.mjs --obj
 * The reader (faces, objects, negative indices, units, axes, caps) and the IFC it writes, opened by web-ifc.
 */
import path from 'node:path';

export async function objMode({ APP, WebIFC, IfcModel, quiet }) {
  let bad = 0;
  const ok = (cond, label, detail = '') => { if (!cond) bad++; console.log((cond ? '  ok   ' : '  FAIL ') + label + (!cond && detail ? ' (' + detail + ')' : '')); };
  const O = await import(path.join(APP, 'obj-ifc.js'));
  const cube = 'o Box\nv 0 0 0\nv 1 0 0\nv 1 0 -1\nv 0 0 -1\nv 0 1 0\nv 1 1 0\nv 1 1 -1\nv 0 1 -1\n' +
    'f 1 2 3 4\nf 5 8 7 6\nf 1 5 6 2\nf 2 6 7 3\nf 3 7 8 4\nf 4 8 5 1\n' +
    'o Tri\nv 2 0 0\nv 3 0 0\nv 2 1 0\nf -3 -2 -1\n';
  const r = O.readObj(cube);
  ok(r.solids.length === 2 && r.solids[0].name === 'Box' && r.solids[1].name === 'Tri', 'two objects, by name', r.solids.map((s) => s.name).join());
  ok(r.solids[0].indices.length / 3 === 12 && r.solids[1].indices.length / 3 === 1, 'quads become two triangles each; 12 + 1');
  const P = r.solids[0].positions;
  const zs = []; for (let i = 2; i < P.length; i += 3) zs.push(P[i]);
  const ys = []; for (let i = 1; i < P.length; i += 3) ys.push(P[i]);
  ok(Math.max(...zs) === 1000 && Math.min(...zs) === 0, 'metres to mm and Y up to Z up: height 1000 mm', zs.join());
  ok(Math.min(...ys) === 0 && Math.max(...ys) === 1000, 'OBJ -Z (away from the viewer) becomes +Y in the plan', ys.join());
  ok(r.solids[1].indices.length === 3, 'negative indices count back from the last vertex');
  const mm = O.readObj('v 0 0 0\nv 100 0 0\nv 0 100 0\nf 1 2 3\n', { unit: 'mm', yUp: false });
  ok(mm.solids[0].positions[3] === 100 && mm.solids[0].positions[7] === 100, 'unit mm and yUp false keep the numbers');
  const skipped = O.readObj('v 0 0 0\nv 1 0 0\nv 0 1 0\nf 1 2 3\nf 1 2 9\nl 1 2\nusemtl x\n');
  ok(skipped.skipped.faces === 1 && skipped.skipped.lines === 1, 'a face with a missing vertex and a line are counted as skipped', JSON.stringify(skipped.skipped));
  let code = null; try { O.readObj('# nothing\n'); } catch (e) { code = e.code; }
  ok(code === 'obj.err.empty', 'no faces: obj.err.empty');
  code = null; try { O.readObj('v a b c\n'); } catch (e) { code = e.code; }
  ok(code === 'obj.err.vertex', 'a bad vertex: obj.err.vertex');
  code = null; try { O.readObj('v 0 0 0\n', { unit: 'yd' }); } catch (e) { code = e.code; }
  ok(code === 'obj.err.unit', 'an unknown unit');
  const out = O.objToIfc(cube, { name: 'box' });
  ok(out.read.objects === 2 && out.read.triangles === 13, 'objToIfc: 2 objects, 13 triangles');
  const eng = await quiet(IfcModel.create)(WebIFC, null);
  await quiet((b) => eng.load(b))(new TextEncoder().encode(out.text));
  const proxies = eng.api.GetLineIDsWithType(eng.modelID ?? eng.model?.modelID ?? 0, WebIFC.IFCBUILDINGELEMENTPROXY).size();
  ok(proxies === 2, 'web-ifc opens it: two mesh elements', String(proxies));
  console.log(bad ? `\n${bad} failed` : '\nall ok');
  return bad ? 1 : 0;
}
