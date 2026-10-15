/* SPDX-License-Identifier: Apache-2.0 */
/**
 * render-test.mjs — `node bin/test-bimcraft.mjs --render` (0.5 part 4 RC.7 / RC.11 (b), session `render`): library materials
 * painted onto IFC elements (paint-bim.js) on cc-ifc, no browser. A new building with four walls drawn by BimCraft's own
 * tools: paint a wall Red brick (CadCraft_Render, a styled body, an IFC4 surface style with the texture's name) → one undo
 * step; save → reopen → the wall's batch shows the brick colour; web-ifc (the oracle in tools/bimcraft-test/node_modules)
 * opens the file and reads the same colour; paint one side (Y−) with siding; which side a face is (faceAxis, the wall's own
 * placement, a wall along Y as well); take the paint off; undo / redo; render-bim.js splits a batch by element and side
 * with UVs. Run by bin/test-bimcraft.mjs, which loads cc-ifc and the language file first.
 */
import path from 'node:path';
import fs from 'node:fs';
import { register } from 'node:module';
import { pathToFileURL } from 'node:url';

export async function renderMode({ APP, ROOT, WebIFC, IfcModel, quiet, require }) {
  register('data:text/javascript,' + encodeURIComponent(`export async function resolve(s, c, next) { return s === 'three' ? { url: ${JSON.stringify(pathToFileURL(path.join(ROOT, 'public_html/assets/vendor/three/current/three.module.js')).href)}, shortCircuit: true } : next(s, c); }`));
  const N = await import(path.join(APP, 'new-model.js'));
  const OPS = await import(path.join(APP, 'model-ops.js'));
  const { ModelWriter } = await import(path.join(APP, 'model-write.js'));
  const { IfcEditor } = await import(path.join(APP, 'ifc-edit.js'));
  const { ids, val } = await import(path.join(APP, 'ifc-util.js'));
  const PB = await import(path.join(APP, 'paint-bim.js'));
  const MAT = await import(path.join(APP, 'render/materials.js'));
  let bad = 0, good = 0;
  const ok = (cond, label, detail = '') => { if (cond) good++; else bad++; console.log((cond ? '  ok   ' : '  FAIL ') + label + (detail ? ' (' + detail + ')' : '')); };
  const lines = (ed, type) => ids(ed.api, ed.mid, type).map((id) => ({ id, l: ed.api.GetLine(ed.mid, id, false) }));

  console.log('== Paint a wall (one undo step)');
  const lv = (n, h) => N.stackLevels(n, h, (i) => 'Level ' + (i + 1));
  const text = N.newBuilding({ name: 'Paint test', levels: lv(2, 3000), fileName: 'p.ifc', now: new Date('2026-10-14T12:00:00Z') });
  const engine = await quiet(IfcModel.create)(WebIFC, null);
  await quiet((b) => engine.load(b))(new TextEncoder().encode(text));
  const ed = new IfcEditor(WebIFC, engine);
  let snap = OPS.snapshotModel(ed);
  const P = [[0, 0], [6000, 0], [6000, 4000], [0, 4000]];
  ed.modelChange(OPS.drawWalls({ storey: snap.levels[0].guid, segs: P.map((p, i) => ({ a: p, b: P[(i + 1) % 4] })), typeKey: 'ext-2x6', topLevel: snap.levels[1].guid }), { label: 'walls' });
  snap = OPS.snapshotModel(ed);
  const w = new ModelWriter(ed.W, ed.api, ed.mid);
  const wallIds = snap.walls.map((x) => w.byGuid(x.guid));
  ok(wallIds.length === 4 && wallIds.every((x) => x > 0), 'four walls drawn');
  const [W0, W1] = wallIds;
  const nChanges = ed.changes.length;
  ed.modelChange(PB.paintOp({ ids: [W0], mat: 'brick-red' }), { label: 'Red brick', verb: 'Painted' });
  ok(ed.changes.length === nChanges + 1, 'one undo step');
  let paint = PB.readPaint(ed.api, ed.mid);
  ok(paint.get(W0)?.all === 'brick-red' && paint.size === 1, 'CadCraft_Render.Material = brick-red on that wall only');
  const style = lines(ed, 'IFCSURFACESTYLE').find((x) => val(x.l.Name) === 'brick-red (CadCraft)');
  ok(!!style, 'a surface style named for the material');
  const tex = lines(ed, 'IFCIMAGETEXTURE').find((x) => val(x.l.URLReference) === 'cadcraft-material:brick-red');
  ok(!!tex, 'IFC4: IfcSurfaceStyleWithTextures → IfcImageTexture cadcraft-material:brick-red');
  const styled = lines(ed, 'IFCSTYLEDITEM').filter((x) => (x.l.Styles || []).some((h) => h.value === style?.id));
  ok(styled.length >= 1, 'the wall\'s body is styled with it', String(styled.length));
  const again = lines(ed, 'IFCSURFACESTYLE').length;
  ed.modelChange(PB.paintOp({ ids: [W1], mat: 'brick-red' }), { label: 'Red brick' });
  ok(lines(ed, 'IFCSURFACESTYLE').length === again, 'a second wall reuses the style');
  ed.undo();
  ok(!PB.readPaint(ed.api, ed.mid).has(W1), 'undo takes the second wall\'s paint off');

  console.log('== The file: cc-ifc and web-ifc read the colour');
  const bytes = ed.save();
  const back = await quiet(IfcModel.create)(WebIFC, null);
  const m2 = await quiet((b) => back.load(b))(bytes);
  const want = MAT.material('brick-red').color, hex = (c) => '#' + c.slice(0, 3).map((x) => Math.round(x * 255).toString(16).padStart(2, '0')).join('');
  const batchOf = (mm, id) => mm.batches.find((b) => b.elems.ids.includes((mm.keyBase || 0) + id) || b.elems.ids.includes(id));
  const b0 = batchOf(m2, W0);
  const d = (a, b2) => { const x = [1, 3, 5].map((o) => parseInt(a.slice(o, o + 2), 16)), y = [1, 3, 5].map((o) => parseInt(b2.slice(o, o + 2), 16)); return Math.hypot(x[0] - y[0], x[1] - y[1], x[2] - y[2]); };
  ok(b0 && d(hex(b0.color), want) < 3, 'reopened: the wall\'s batch is the brick colour', b0 && hex(b0.color) + ' vs ' + want);
  const b1 = batchOf(m2, W1);
  ok(b1 && d(hex(b1.color), want) > 20, 'the other walls keep their own colour', b1 && hex(b1.color));
  ok(PB.readPaint(back.api, m2.modelID).get(W0)?.all === 'brick-red', 'reopened: the material is read back');
  let oracle = null;
  try { oracle = require('web-ifc'); } catch { oracle = null; }
  if (oracle) {
    const api = new oracle.IfcAPI();
    await quiet(() => api.Init())();
    const mid = api.OpenModel(bytes);
    let col = null;
    api.StreamAllMeshes(mid, (fm) => { if (fm.expressID === W0 && fm.geometries.size()) { const c = fm.geometries.get(0).color; col = [c.x, c.y, c.z]; } });
    ok(col && d(hex(col), want) < 3, 'web-ifc reads the brick colour too', col && hex(col));
    ok(api.GetLineIDsWithType(mid, oracle.IFCIMAGETEXTURE).size() === 1, 'web-ifc reads the texture line');
    api.CloseModel(mid);
  } else console.log('  skip web-ifc (cd tools/bimcraft-test && npm install)');

  console.log('== Paint a side');
  ed.modelChange(PB.paintOp({ ids: [W0], mat: 'siding-white', axis: 'Y-' }), { label: 'side' });
  paint = PB.readPaint(ed.api, ed.mid);
  ok(paint.get(W0).all === 'brick-red' && paint.get(W0).sides['Y-'] === 'siding-white', 'Material Y− = siding-white, the rest stays brick');
  const ax = (id, n) => PB.faceAxis(ed.api, ed.mid, id, n);
  ok(ax(W0, [0, -1, 0]) === 'Y-' && ax(W0, [0, 1, 0]) === 'Y+' && ax(W0, [0, 0, 1]) === 'Z+' && ax(W0, [1, 0, 0]) === 'X+', 'a wall along X: its faces\' axes in its own placement');
  const a1 = ax(W1, [1, 0, 0]), a1b = ax(W1, [-1, 0, 0]);
  ok(a1 && a1b && a1[0] === 'Y' && a1b[0] === 'Y' && a1 !== a1b, 'a wall along Y: its two sides are Y± of its own placement', a1 + ' / ' + a1b);
  ok(ax(W0, [0, -0.5, 0.866]) === 'Z+' && ax(W0, [0, -0.866, 0.5]) === 'Y-', 'a sloped face goes with the axis it is nearest (a 30° roof is a top)');
  const of = (n) => PB.paintOf(paint, W0, n, ed.api, ed.mid);
  ok(of([0, -1, 0]) === 'siding-white' && of([0, 1, 0]) === 'brick-red' && of([0, 0, 1]) === 'brick-red', 'paintOf: the painted side siding, the other side and the top brick');
  ok(PB.viewerToFileDir([0, 0, 1]).join() === '0,-1,0' && PB.viewerToFileDir([0, 1, 0]).join() === '0,0,1', 'viewer (Y up) → file (Z up) directions');
  const sidesOnly = lines(ed, 'IFCSTYLEDITEM').filter((x) => (x.l.Styles || []).some((h) => h.value === style.id)).length;
  ok(sidesOnly === styled.length, 'a side paint leaves the body\'s style alone');

  console.log('== Take the paint off, undo, redo');
  ed.modelChange(PB.paintOp({ ids: [W0], mat: null }), { label: 'off' });
  paint = PB.readPaint(ed.api, ed.mid);
  ok(!paint.has(W0), 'Material and every side emptied: nothing painted');
  ok(!lines(ed, 'IFCSTYLEDITEM').some((x) => (x.l.Styles || []).some((h) => h.value === style.id)), 'the body\'s material style is removed');
  ed.undo();
  ok(PB.readPaint(ed.api, ed.mid).get(W0)?.sides['Y-'] === 'siding-white', 'undo: brick with a siding side again');
  ok(lines(ed, 'IFCSTYLEDITEM').some((x) => (x.l.Styles || []).some((h) => h.value === style.id)), 'undo: the style is back');
  ed.redo();
  ok(!PB.readPaint(ed.api, ed.mid).has(W0), 'redo: off again');
  ed.undo();
  let threw = false; try { PB.paintOp({ ids: [W0], mat: 'unobtainium' }); } catch { threw = true; }
  ok(threw, 'an unknown material is refused');

  console.log('== render-bim.js: a batch split by element and side, with UVs');
  {
    const THREE = await import('three');
    const R = await import(path.join(APP, 'render-bim.js'));
    const L = await import(path.join(APP, 'render/looks.js'));
    const eng = await quiet(IfcModel.create)(WebIFC, null);
    const mm = await quiet((b) => eng.load(b))(ed.save());
    const meshes = mm.batches.filter((b) => !b.space).map((b) => {
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.BufferAttribute(b.positions, 3));
      g.setAttribute('normal', new THREE.BufferAttribute(b.normals, 3));
      g.setIndex(new THREE.BufferAttribute(b.indices, 1));
      g.addGroup(0, b.indices.length, 0);
      const mesh = new THREE.Mesh(g, [new THREE.MeshBasicMaterial()]);
      mesh.userData = { batch: b, color: new THREE.Color().setRGB(b.color[0], b.color[1], b.color[2], THREE.SRGBColorSpace), triIds: b.triIds };
      return mesh;
    });
    const rootG = new THREE.Group(); for (const x of meshes) rootG.add(x);
    const box = new THREE.Box3(); for (const x of meshes) { x.geometry.computeBoundingBox(); box.union(x.geometry.boundingBox); }
    const cam = new THREE.PerspectiveCamera(45, 1.5, 0.1, 1000); cam.position.set(20, 10, 20); cam.lookAt(3, 1.5, -2);
    const viewer = { root: rootG, layers: new Map([[0, { meshes, edges: [] }]]), box, camera: cam, clip: [] };
    const paints = new Map([[0, { paint: PB.readPaint(eng.api, mm.modelID), api: eng.api, mid: mm.modelID, keyBase: mm.keyBase || 0, C: [...eng.api.GetCoordinationMatrix(mm.modelID)] }]]);
    const sc = R.bimScene(viewer, L.cleanSettings({}), null, paints);
    const looks = sc.items.filter((i) => !i.lines).map((i) => i.look);
    ok(looks.includes('mat:brick-red') && looks.includes('mat:siding-white'), 'brick and siding parts', looks.join(' '));
    const sid = sc.items.find((i) => i.look === 'mat:siding-white'), br = sc.items.find((i) => i.look === 'mat:brick-red');
    ok(sid.geometry.getAttribute('uv') && sid.geometry.getAttribute('uv').count === sid.geometry.getAttribute('position').count, 'the materials carry UVs');
    // the siding part is the wall's south face only: every one of its triangles faces −Z in the viewer (= −Y in the file)
    const nz = []; const ix = sid.geometry.index.array, nrm = sid.geometry.getAttribute('normal');
    for (let i = 0; i < ix.length; i += 3) nz.push(nrm.getZ(ix[i]));
    ok(nz.length >= 2 && nz.every((z) => z > 0.99), 'the siding is the one side (viewer +Z = file −Y)', nz.length / 1 + ' triangles');
    const tris = (it) => it.geometry.index.count / 3;
    const total = sc.items.filter((i) => !i.lines).reduce((s, i) => s + tris(i), 0);
    ok(total === meshes.reduce((s, x) => s + x.geometry.index.count / 3, 0), 'every triangle drawn once');
    ok(tris(br) > tris(sid), 'the rest of the wall stays brick');
    sc.dispose();
  }

  console.log('== Saved views and walkthroughs (views-bim.js)');
  {
    const V = await import(path.join(APP, 'views-bim.js'));
    const near = (a, b2, e = 1e-3) => a.every((x, i) => Math.abs(x - b2[i]) <= e);
    const v1 = { name: 'Street', pos: [-5, -12, 1.6], dir: [0.3, 0.95, -0.05], fov: 50 };
    const dv = V.decodeView(V.encodeView(v1));
    ok(dv && near(dv.pos, v1.pos) && Math.abs(Math.hypot(...dv.dir) - 1) < 1e-9 && dv.fov === 50, 'a view encodes and decodes (direction normalised)');
    ok(V.decodeView('1 2 3 0 0 0 45') === null && V.decodeView('1 2 NaN 0 1 0 45') === null && V.decodeView('1 2 3 0 1 0') === null && V.decodeView('1e9 0 0 0 1 0 45') === null, 'tampered views refused (zero direction, NaN, short, far away)');
    ok(V.decodeView('0 0 0 0 1 0 500').fov === 120, 'field of view clamped');
    const pts = [0, 1, 2, 3].map((k) => ({ t: k * 0.25, pos: [k, 0, 1.6], dir: [1, 0, 0] }));
    const dw = V.decodeWalk(V.encodeWalk(pts));
    ok(dw && dw.length === 4 && dw[3].t === 0.75, 'a walk encodes and decodes');
    ok(V.decodeWalk('0 0 0 0 1 0 0; 1 1 0 0 1 0 0; 0.5 2 0 0 1 0 0').length === 2, 'samples going back in time are dropped');
    ok(V.decodeWalk('0 0 0 0 1 0 0') === null, 'one sample is not a walk');
    ok(near(V.viewAt({ pts }, 0.375).pos, [1.5, 0, 1.6]) && near(V.viewAt({ pts }, 9).pos, [3, 0, 1.6]) && near(V.viewAt({ pts }, -1).pos, [0, 0, 1.6]), 'the walk at any time: between samples, clamped at the ends');
    ok(V.cleanName(' A\u0000 view\n') === 'A view' && V.cleanName('x'.repeat(300)).length === 80, 'names cleaned');
    const n0 = ed.changes.length;
    ed.modelChange(V.writeViewsOp({ views: [v1, { name: 'Back yard', pos: [3, 15, 1.6], dir: [0, -1, 0], fov: 60 }], walks: [{ name: 'Walk 1', pts }] }), { label: 'views' });
    ok(ed.changes.length === n0 + 1, 'saving views is one undo step');
    let rv = V.readViews(ed.api, ed.mid);
    ok(rv.views.map((x) => x.name).join() === 'Street,Back yard' && rv.walks.length === 1 && rv.walks[0].pts.length === 4, 'read back in order, with the walk');
    ed.modelChange(V.writeViewsOp({ views: [rv.views[1], rv.views[0]], walks: [] }), { label: 'reorder' });
    rv = V.readViews(ed.api, ed.mid);
    ok(rv.views[0].name === 'Back yard' && !rv.walks.length, 'reordered, the walk deleted');
    ed.undo();
    rv = V.readViews(ed.api, ed.mid);
    ok(rv.views[0].name === 'Street' && rv.walks.length === 1, 'undo puts the order and the walk back');
    const back2 = await quiet(IfcModel.create)(WebIFC, null);
    const m3 = await quiet((b) => back2.load(b))(ed.save());
    ok(V.readViews(back2.api, m3.modelID).views.length === 2, 'saved in the file, read again on open');
    ed.modelChange(V.writeViewsOp({ views: [], walks: [] }), { label: 'none' });
    ok(!V.readViews(ed.api, ed.mid).views.length, 'an empty list: no views');
    ed.undo();
  }

  console.log('== Lamps: light fixtures light the picture (render-bim.js bimLamps / lampOp)');
  {
    const R = await import(path.join(APP, 'render-bim.js'));
    const VIS = await import(path.join(APP, 'ifc-vis.js'));
    const L1 = OPS.snapshotModel(ed).levels[0].guid;
    let fix = null;
    ed.modelChange((e2) => {
      const w2 = new ModelWriter(e2.W, e2.api, e2.mid);
      return w2.run(() => {
        const st = w2.byGuid(L1), slp = w2.api.GetLine(w2.mid, st, false).ObjectPlacement.value;
        const lp = w2.placeAt(slp, 2000, 2000, 2600, 0);
        fix = w2.make('IFCLIGHTFIXTURE', w2.guid(), w2.ownerHistory(), w2.L('Ceiling lamp'), null, null, w2.H(lp), null, null, 'NOTDEFINED');
        w2.setShape(fix, [w2.rep('body', 'Body', 'SweptSolid', [w2.box(-150, -150, 0, 150, 150, 100)])]);
        w2.contain(fix, st);
        return { id: fix };
      });
    }, { label: 'lamp' });
    const lampsNow = async () => {
      const eng = await quiet(IfcModel.create)(WebIFC, null);
      const mm = await quiet((b) => eng.load(b))(ed.save());
      const viewer = { layers: new Map([[0, { group: { visible: true } }]]), vis: { state: () => VIS.SOLID }, keyBounds: (keys) => VIS.boundsOf(mm.batches, keys) };
      return { lamps: R.bimLamps(viewer, [{ mi: 0, api: eng.api, mid: mm.modelID, keyBase: mm.keyBase || 0 }]), bb: VIS.boundsOf(mm.batches, [(mm.keyBase || 0) + fix]) };
    };
    let { lamps, bb } = await lampsNow();
    ok(lamps.length === 1 && lamps[0].name === 'Ceiling lamp' && lamps[0].kind === 'point' && lamps[0].lumens === 800 && lamps[0].on, 'an IfcLightFixture is a lamp: 800 lm, warm, on', JSON.stringify(lamps[0] && { n: lamps[0].name, lm: lamps[0].lumens }));
    ok(lamps[0] && Math.abs(lamps[0].p[1] - (bb.min[1] - 0.03)) < 1e-6 && Math.abs(lamps[0].p[0] - (bb.min[0] + bb.max[0]) / 2) < 1e-6 && lamps[0].dir[1] === -1, 'just under the fixture, pointing down');
    const n0 = ed.changes.length;
    ed.modelChange(R.lampOp(fix, { lumens: 2400, kind: 'spot', angle: 40, color: '#FFF1DC' }), { label: 'lamp' });
    ok(ed.changes.length === n0 + 1, 'changing a lamp is one undo step');
    ({ lamps } = await lampsNow());
    ok(lamps[0].lumens === 2400 && lamps[0].kind === 'spot' && lamps[0].angle === 40 && lamps[0].color === '#fff1dc', 'CadCraft_Light read back: 2400 lm spot, 40°');
    ed.modelChange(R.lampOp(fix, { on: false }), { label: 'off' });
    ({ lamps } = await lampsNow());
    ok(lamps[0].on === false, 'switched off (saved as On = false)');
    ed.undo(); ed.undo();
    ({ lamps } = await lampsNow());
    ok(lamps[0].lumens === 800 && lamps[0].on, 'undo twice: back to the defaults');
    ok(R.fixturesOf(ed.api, ed.mid).size === 1, 'fixturesOf finds it');
  }

  console.log('== Entourage (RC.11 (e)): a placed tree and car keep their parts\' colours (ifc-place.js partBodyItems)');
  {
    const E = await import(path.join(ROOT, 'lib/entourage/entourage.js'));
    const all = E.entourage();
    const tree = E.libraryItem(all.find((e) => e.slug === 'tree-deciduous-6m')), car = E.libraryItem(all.find((e) => e.slug === 'car-sedan'));
    const stId = new ModelWriter(ed.W, ed.api, ed.mid).byGuid(OPS.snapshotModel(ed).levels[0].guid);
    const n0 = ed.changes.length;
    const rt = ed.placeItem({ ...tree, uuid: 'e0000000-0000-4000-8000-000000000001', version: 1 }, { storey: stId, x: 9000, y: -3000, rot: 0, sha256: 'tree' });
    const rc = ed.placeItem({ ...car, uuid: 'e0000000-0000-4000-8000-000000000002', version: 1 }, { storey: stId, x: 3000, y: -6000, rot: 0, sha256: 'car' });
    ok(ed.changes.length === n0 + 2 && rt.id > 0 && rc.id > 0, 'a tree and a car placed (one step each)');
    const eng = await quiet(IfcModel.create)(WebIFC, null);
    const mm = await quiet((b) => eng.load(b))(ed.save());
    const kb = mm.keyBase || 0;
    const hexOf = (c) => '#' + c.slice(0, 3).map((x) => Math.round(x * 255).toString(16).padStart(2, '0')).join('');
    const colours = (id) => mm.batches.filter((b) => b.elems.ids.includes(kb + id)).map((b) => hexOf(b.color) + (b.color[3] < 0.98 ? '/' + b.color[3].toFixed(2) : '')).sort();
    const tc = colours(rt.id), cc = colours(rc.id);
    ok(tc.length === 2 && tc.includes('#6b4a2f') && tc.includes('#4f7a3a'), 'the tree: trunk brown, leaves green', tc.join(' '));
    ok(cc.length === 4 && cc.includes('#8a1f24') && cc.some((x) => x.startsWith('#2d3a44/0.5')) && cc.includes('#1e2023'), 'the car: body, see-through glass, tyres, lights', cc.join(' '));
    const tris = (id) => mm.batches.reduce((a, b) => { const r = [...b.elems.ids].indexOf(kb + id); return a + (r >= 0 ? b.elems.tn[r] : 0); }, 0);
    ok(tris(rt.id) === tree.body.indices.length / 3, 'every triangle of the tree is there', String(tris(rt.id)));
    let oracle = null; try { oracle = require('web-ifc'); } catch { oracle = null; }
    if (oracle) {
      const api = new oracle.IfcAPI();
      await quiet(() => api.Init())();
      const mid = api.OpenModel(ed.save());
      const seen = new Set();
      api.StreamAllMeshes(mid, (fm) => { if (fm.expressID === rt.id) for (let i = 0; i < fm.geometries.size(); i++) { const c = fm.geometries.get(i).color; seen.add(hexOf([c.x, c.y, c.z])); } });
      ok(seen.has('#6b4a2f') && seen.has('#4f7a3a'), 'web-ifc shows the tree in its two colours', [...seen].join(' '));
      api.CloseModel(mid);
    }
    const plain = E.libraryItem(all[0]); delete plain.source_attrs['CC-RENDER-PARTS'];
    const rp = ed.placeItem({ ...plain, uuid: 'e0000000-0000-4000-8000-000000000003', version: 1 }, { storey: stId, x: 12000, y: -3000, rot: 0, sha256: 'plain' });
    const eng2 = await quiet(IfcModel.create)(WebIFC, null);
    const m2 = await quiet((b) => eng2.load(b))(ed.save());
    ok(m2.batches.filter((b) => b.elems.ids.includes((m2.keyBase || 0) + rp.id)).length === 1, 'without CC-RENDER-PARTS an item stays one body, as before');
    ed.undo(); ed.undo(); ed.undo();
  }

  console.log(`\n${good} passed, ${bad} failed`);
  void fs;
  return bad ? 1 : 0;
}
