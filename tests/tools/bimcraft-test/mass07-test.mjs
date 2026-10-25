/* SPDX-License-Identifier: Apache-2.0 */
/**
 * `node bin/test-bimcraft.mjs --mass07` (0.7 LC.1 B2, session `massing`): CivilCraft's building masses developed in BimCraft.
 * fixtures/ifc/site-masses.ifc (made by tools/massing-test/make-fixture.mjs from civilcraft/dev/ifc-massing.js): two masses in
 * US survey feet on an EPSG:2277 site — Block A, 30 × 40 ft, 3 floors of 12 ft; Block B, an L of 700 sq ft, 2 floors of 10 ft.
 *   readMasses finds both with their pset and footprint (in mm); developMass turns one into walls and floors in ONE undo step,
 *   removes the proxy, keeps the other mass, leaves the georeference alone; redo/undo; refusals.
 * Called by bin/test-bimcraft.mjs with what it has set up (the build's folder, the engine, quiet()).
 */
import path from 'node:path';
import fs from 'node:fs';

export async function mass07Mode({ APP, ROOT, WebIFC, IfcModel, quiet }) {
  let bad = 0, good = 0;
  const ok = (cond, label, detail = '') => { if (cond) good++; else bad++; console.log((cond ? '  ok   ' : '  FAIL ') + label + (!cond && detail ? ' (' + detail + ')' : '')); };
  const near = (a, b, e = 0.01) => Math.abs(a - b) <= e;
  const FT = 1200 / 3937 * 1000;   // mm in a US survey foot
  const SM = await import(path.join(APP, 'model-site-mass.js'));
  const { IfcEditor } = await import(path.join(APP, 'ifc-edit.js'));
  const { ModelWriter } = await import(path.join(APP, 'model-write.js'));
  const { readWalls } = await import(path.join(APP, 'model-walls.js'));
  const { readDerived } = await import(path.join(APP, 'model-slabs.js'));
  const GEO = await import(path.join(APP, 'ifc-geo.js'));
  const eng = await quiet(IfcModel.create)(WebIFC, null);
  await quiet((b) => eng.load(b))(new Uint8Array(fs.readFileSync(path.join(ROOT, 'fixtures/ifc/site-masses.ifc'))));
  const ed = new IfcEditor(WebIFC, eng);
  const W = () => new ModelWriter(ed.W, ed.api, ed.mid);

  console.log('== reading the masses');
  let ms = SM.readMasses(W());
  const A = ms.find((m) => m.massId === 'm1'), B = ms.find((m) => m.massId === 'm2');
  ok(ms.length === 2 && A && B, 'two mass proxies found by their pset CadCraft_SiteMass');
  ok(A.name === 'Block A' && A.use === 'Housing' && A.floors === 3 && near(A.floorHeight, 12 * FT, 0.01) && A.parcel === 'Lot 7' && A.base === 'stepped', 'Block A: use, 3 floors, floor height 12 ft in mm, parcel, base', JSON.stringify({ n: A.name, f: A.floors, h: A.floorHeight }));
  ok(A.storeys.length === 3 && B.storeys.length === 2, 'its storeys are the building\'s own: 3 and 2');
  const area = (P) => { let s = 0; for (let i = 0; i < P.length; i++) { const a = P[i], b = P[(i + 1) % P.length]; s += a[0] * b[1] - a[1] * b[0]; } return s / 2; };
  ok(near(area(A.pts), 30 * 40 * FT * FT, 5000) && area(A.pts) > 0, 'Block A\'s footprint is 30 × 40 ft (' + (area(A.pts) / FT / FT).toFixed(3) + ' sq ft), counter-clockwise');
  ok(near(area(B.pts) / FT / FT, 700, 0.01), 'Block B\'s footprint, an L: 700 sq ft (' + (area(B.pts) / FT / FT).toFixed(3) + ')');

  console.log('== the Properties extension (model-site-mass-ui.js) and the hand-over receiver');
  {
    const UI = await import(path.join(APP, 'model-site-mass-ui.js'));
    // a bare-bones document: el() only needs createElement, className, setAttribute, addEventListener and append
    const had = globalThis.document;
    globalThis.document = { createElement: (tag) => ({ tag, className: '', attrs: {}, kids: [], setAttribute(k, v) { this.attrs[k] = v; }, addEventListener() {}, append(...c) { this.kids.push(...c); } }) };
    let ext = null;
    const A = { t: (k, v) => k + (v ? JSON.stringify(v) : ''), ed: () => ed, kb: () => 100000, units: () => 'ftin', commit: (o, meta) => ed.modelChange(o, meta) };
    UI.mountSiteMass({ extend: (x) => { ext = x; return A; } });
    ext.refresh();
    ok(ext.classes.test('IfcBuildingElementProxy') && !ext.classes.test('IfcWall'), 'it claims IfcBuildingElementProxy only');
    const hit = ext.pick(100000 + SM.readMasses(W()).find((m) => m.massId === 'm1').id);
    ok(hit && hit.kind === 'sitemass' && /Block A/.test(hit.label) && ext.pick(5) === null, 'pick finds a mass by its key, nothing else');
    const rows = [], kit = { rows, button: (label, attr, fn) => ({ label, attr, fn, tag: 'button', kids: [], attrs: { [attr]: '' } }), field: () => {} };
    const r = ext.props([hit], kit);
    ok(r && r.title === 'mass.title' && rows.length >= 8, 'props fills rows and gives a title (' + rows.length + ' rows)');
    const find = (n) => (n && n.attr === 'data-mass-develop' ? n : n && n.kids ? n.kids.map(find).find(Boolean) : null);
    const btn = rows.map(find).find(Boolean);
    ok(btn && typeof btn.fn === 'function', 'a "Develop this mass" button');
    btn.fn();
    ok(readWalls(W()).length === 12 && SM.readMasses(W()).length === 1, 'pressing it develops the mass (12 walls) in one step');
    ed.undo();
    const H = await import(path.join(APP, 'handoff-in.js'));
    ok(await H.receiveHandoff({ search: '?x=1', open: () => { throw new Error('no'); } }) === null, 'no ?handoff= in the address: nothing taken');
    let code = 'none'; try { await H.receiveHandoff({ search: '?handoff=11111111-2222-4333-8444-555555555555', open: () => {}, loc: { search: '?handoff=11111111-2222-4333-8444-555555555555', pathname: '/lab/bimcraft', hash: '' }, hist: { replaceState: () => {} } }); } catch (e) { code = e.code || e.name; }
    ok(code !== 'none', 'with ?handoff= it goes to the shared store (this Node has no IndexedDB, so it throws: ' + code + ')');
    ok(await H.receiveHandoff({ search: '?handoff=../../x', open: () => {} }) === null, 'a malformed id is ignored');
    if (had) globalThis.document = had; else delete globalThis.document;
  }
  console.log('== developing Block A');
  const geoBefore = GEO.readGeoref(ed.api, ed.mid);
  const n0 = ed.changes.length;
  ed.modelChange(SM.developMass({ guid: A.guid }), { label: 'Develop Block A', verb: 'Developed' });
  ok(ed.changes.length === n0 + 1, 'one undo step');
  const walls = readWalls(W()), D = readDerived(W());
  ok(walls.length === 4 * 3, '4 walls on each of 3 storeys: ' + walls.length);
  ok(D.floors.length === 3, 'a floor on each storey: ' + D.floors.length);
  ms = SM.readMasses(W());
  ok(ms.length === 1 && ms[0].massId === 'm2', 'the proxy is gone, Block B\'s stays');
  const levels = new Set(walls.map((x) => x.storey));
  ok(levels.size === 3, 'walls on all three storeys');
  const top = walls.filter((x) => x.storey === A.storeys[2]), mid = walls.filter((x) => x.storey === A.storeys[1]);
  ok(top.every((x) => near(x.height, 12 * FT, 1)) && mid.every((x) => near(x.height, 12 * FT, 1) && x.topLevel === W().guidOf(A.storeys[2])), 'each wall is one floor high and the lower ones follow the level above: ' + [...walls.map((x) => Math.round(x.height))].slice(0, 4).join(','));
  // the footprint is the walls' outer face: the 4 location lines are the footprint's edges
  const first = walls.filter((x) => x.storey === A.storeys[0]);
  const sq = (p, q) => Math.hypot(p[0] - q[0], p[1] - q[1]);
  const perim = first.reduce((s, x) => s + sq(x.a, x.b), 0);
  ok(near(perim / FT, 140, 0.05), 'their length adds up to the footprint\'s perimeter, 2 × (30 + 40) = 140 ft (' + (perim / FT).toFixed(3) + ')');
  ok(first.every((x) => x.extSide === 'right' && x.justification === 'exterior'), 'exterior on the right of a counter-clockwise run, the location line on the outer face');
  const txt = new TextDecoder().decode(ed.save());
  ok(/CadCraft_SiteMass/.test(txt) && /Developed/.test(txt), 'the building keeps the study\'s pset, marked Developed');
  const geoAfter = GEO.readGeoref(ed.api, ed.mid);
  ok(geoAfter && geoAfter.crs.code === 2277 && Math.abs(geoAfter.mapUnitM - geoBefore.mapUnitM) < 1e-15, 'the georeference is untouched (EPSG:2277)');
  const dangling = (t) => { const defined = new Set([...t.matchAll(/^#(\d+)=/gm)].map((m) => m[1])), out = new Set(); for (const line of t.split('\n')) for (const m of line.replace(/^#\d+=/, '').replace(/'(?:[^']|'')*'/g, '').matchAll(/#(\d+)/g)) if (!defined.has(m[1])) out.add('#' + m[1]); return [...out]; };
  ok(!dangling(txt).length, 'no dangling references in the saved file', dangling(txt).slice(0, 5).join(' '));

  console.log('== undo, redo, refusals');
  ed.undo();
  ok(SM.readMasses(W()).length === 2 && readWalls(W()).length === 0, 'undo: both masses back, no walls');
  ed.redo?.();
  ok(SM.readMasses(W()).length === 1 && readWalls(W()).length === 12, 'redo: developed again');
  let key = ''; try { ed.modelChange(SM.developMass({ guid: 'nope' })); } catch (e) { key = e.key; }
  ok(key === 'model.err.mass.none', 'a mass that is not there: refused (model.err.mass.none)');
  console.log('== developing the L (Block B)');
  const Bn = SM.readMasses(W())[0];
  ed.modelChange(SM.developMass({ guid: Bn.guid }), { label: 'Develop Block B', verb: 'Developed' });
  const wb = readWalls(W()).filter((x) => x.storey === Bn.storeys[0]);
  ok(wb.length === 6, 'an L has six walls on each storey: ' + wb.length);
  ok(near(wb.reduce((s, x) => s + sq(x.a, x.b), 0) / FT, 40 + 10 + 30 + 30 + 10 + 40, 0.05), 'their length is the L\'s perimeter, 160 ft');
  ok(readDerived(W()).floors.length === 3 + 2 && SM.readMasses(W()).length === 0, 'a floor on each of its two storeys (5 in all); no masses left');
  const p = SM.insidePoint([[0, 0], [40, 0], [40, 10], [10, 10], [10, 40], [0, 40]]);
  ok(p[0] > 0 && p[0] < 40 && p[1] > 0 && p[1] < 40 && !(p[0] > 10 && p[1] > 10), 'insidePoint of the L is inside it: (' + p.map((v) => v.toFixed(1)) + ')');
  console.log(bad ? '\n' + bad + ' FAILED, ' + good + ' passed' : '\nall ' + good + ' mass hand-over checks passed');
  return bad ? 1 : 0;
}
