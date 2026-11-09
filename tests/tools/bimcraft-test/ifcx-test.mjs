/* SPDX-License-Identifier: Apache-2.0 */
/**
 * ifcx-test.mjs — IFC5 alpha (IFCX) in BimCraft (0.9 SU.882, session bim-ifcx-09), run by  node bin/test-bimcraft.mjs --ifcx
 * The adapter (ifcx-bimcraft.js on cc-ifcx) on our own fixtures (tools/ifcx/fixtures/): IFCX → IFC4 opened by cc-ifc, and the
 * open model → IFCX → read again. The library itself: node bin/test-ifcx.mjs.
 */
import fs from 'node:fs';
import path from 'node:path';

export async function ifcxMode({ APP, ROOT, WebIFC, IfcModel, quiet }) {
  let bad = 0;
  const ok = (cond, label, detail = '') => { if (!cond) bad++; console.log((cond ? '  ok   ' : '  FAIL ') + label + (!cond && detail ? ' (' + detail + ')' : '')); };
  const FIX = path.join(ROOT, 'tools/ifcx/fixtures');
  const A = await import(path.join(APP, 'ifcx-bimcraft.js'));
  const X = await import(path.join(APP, 'ifcx/index.js'));
  const text = (n) => fs.readFileSync(path.join(FIX, n), 'utf8');
  const files = [{ name: 'house.ifcx', text: text('house.ifcx') }, { name: 'layer-fire.ifcx', text: text('layer-fire.ifcx') }];

  // 1. the copy in BimCraft is the library
  for (const f of ['index.js', 'model.js', 'build.js', 'compose.js', 'parse.js', 'validate.js', 'names.js', 'util.js', 'NOTICE']) {
    ok(Buffer.compare(fs.readFileSync(path.join(ROOT, 'lib/ifcx', f)), fs.readFileSync(path.join(APP, 'ifcx', f))) === 0, 'ifcx/' + f + ' is byte-identical to lib/ifcx');
  }

  // 2. IFCX → IFC4, no schema files given: warnings, nothing fetched, nothing lost
  const r = await A.readIfcxFiles(files);
  ok(r.used.main === 'house.ifcx' && r.used.layers.join() === 'layer-fire.ifcx', 'first file with nodes is the main file, the next one a layer', JSON.stringify(r.used));
  ok(r.issues.some((i) => i.code === 'ifcx.imp.missing') && !r.issues.some((i) => i.level === 'error'), 'imports not given: warnings, no errors, no network');
  ok(r.stats.layers === 2 && r.stats.elements === 5, '2 layers (nothing imported), 5 elements', JSON.stringify(r.stats));
  const eng = await quiet(IfcModel.create)(WebIFC, null);
  const M = await quiet((b) => eng.load(b))(new TextEncoder().encode(r.text));
  const mid = eng.modelID ?? M.modelID;
  const count = (t) => eng.api.GetLineIDsWithType(mid, t).size();
  ok(count(WebIFC.IFCWALL) === 1 && count(WebIFC.IFCWINDOW) === 2 && count(WebIFC.IFCSPACE) === 1 && count(WebIFC.IFCSLAB) === 1, 'cc-ifc opens it: 1 wall, 2 windows, 1 space, 1 slab');
  ok(count(WebIFC.IFCBUILDINGSTOREY) === 2 && M.storeys.length === 2, 'two storeys', String(M.storeys && M.storeys.length));
  const el = [...M.storeys].sort((a, b) => a.elevation - b.elevation).map((s) => s.elevation);
  ok(el[0] === 0 && el[1] === 3, 'storey elevations 0 and 3 m', el.join());
  ok(M.elements >= 4 && M.triangles > 0, 'geometry arrives (elements, triangles)', M.elements + ' / ' + M.triangles);
  const wall = [...M.classOf.entries()].find(([, c]) => /^IfcWall$/i.test(c));
  ok(!!wall, 'the wall is an IfcWall in the viewer model');
  const props = wall ? await eng.properties(wall[0]) : null;
  const flat = JSON.stringify(props || {});
  ok(/Qto_IFCX/.test(flat) && /Height/.test(flat) && /3\.2/.test(flat), 'wall Height 3.2 (the later layer) is in an IFC4 quantity set Qto_IFCX');
  ok(/Pset_IFCX/.test(flat) && /IsExternal/.test(flat), 'IsExternal is in a property set');
  // 3. the line count of unknown attributes does not hide: the model still has them
  ok(r.model.sites[0].buildings[0].storeys[0].elements.find((e) => e.ifcClass === 'IfcWall').extra['acme::FireRating'] === 'REI60', 'attributes with no IFC meaning stay in the model (acme::FireRating)');

  // 4. an error is told in words with a code
  let code = null; try { await A.readIfcxFiles([{ name: 'x.ifcx', text: '{nope' }]); } catch (e) { code = e.code; }
  ok(code === 'ifcx.err.json', 'not JSON: ifcx.err.json');
  code = null; try { await A.readIfcxFiles([]); } catch (e) { code = e.code; }
  ok(code === 'ifcx.err.nofile', 'no file: ifcx.err.nofile');
  const lang = JSON.parse(fs.readFileSync(path.join(APP, 'lang/en.json'), 'utf8'));
  const issueCodes = new Set([...r.issues].map((i) => i.code));
  ok([...issueCodes, 'ifcx.err.json', 'ifcx.err.nofile'].every((c) => (c.startsWith('ifcx.err') ? lang[c] : lang['ifcx.issue.' + c])), 'every code that came up has an English sentence');

  // 5. open model → IFCX → read again
  const entries = [{ mi: 0, ifc: eng, model: M, name: 'house.ifc', visible: true }];
  const out = await A.bimIfcx(entries, { name: 'house' });
  ok(out.file.header.author === 'CadCraft' && out.file.header.ifcxVersion === 'ifcx_alpha', 'our header: author CadCraft, ifcx_alpha');
  const proj = out.file.data.find((n) => n.attributes && n.attributes[X.A.CLASS] && n.attributes[X.A.CLASS].code === 'IfcProject');
  ok(proj && /alpha/i.test(proj.attributes[X.A.ALPHA].note), 'the file states that it is the alpha format');
  ok(out.report.elements === M.elements + (M.spaces || 0) || out.report.elements >= 4, 'elements written', JSON.stringify(out.report));
  const back = await X.readIfcx(out.text);
  const errs = back.issues.filter((i) => i.level === 'error');
  ok(errs.length === 0, 'the file validates against the schemas it carries', JSON.stringify(errs.slice(0, 2)));
  const bm = back.model;
  const sto = bm.sites[0].buildings[0].storeys;
  ok(sto.length === 2 && sto[1].elevation === 3 && sto[1].name === M.storeys.find((s) => s.elevation === 3).name, 'storeys and the 3 m elevation survive');
  const all = sto.flatMap((s) => s.elements).concat(bm.sites[0].buildings[0].elements);
  const cls = all.map((e) => e.ifcClass).sort().join();
  ok(/IfcSlab/.test(cls) && /IfcWall/.test(cls) && /IfcWindow,IfcWindow/.test(cls), 'classes survive', cls);
  const w2 = all.find((e) => e.ifcClass === 'IfcWall');
  ok(w2 && w2.quantities.IFCX && w2.quantities.IFCX.Height && w2.quantities.IFCX.Height.kind === 'Length' && Math.abs(w2.quantities.IFCX.Height.value - 3.2) < 1e-9, 'a Qto_IFCX Height comes back as bsi::ifc::prop::Height (3.2 m, Length)');
  ok(w2 && w2.props.IFCX && w2.props.IFCX.IsExternal === true, 'IsExternal is a standard property again');
  const tris = all.reduce((n, e) => n + e.meshes.reduce((m, x) => m + x.indices.length / 3, 0), 0);
  ok(tris === out.report.triangles && tris > 20, 'triangles written = triangles read', tris + ' / ' + out.report.triangles);
  const colours = all.flatMap((e) => e.meshes.map((m) => m.color)).filter(Boolean).length;
  ok(colours > 0, 'colours travel with the meshes');
  // storey top: window sits at x = 1 .. 1.9 m (in the scene, Z up) — the points are the viewer's, turned Z up
  const win = all.find((e) => e.ifcClass === 'IfcWindow');
  const xs = win.meshes.flatMap((m) => m.positions.filter((_, i) => i % 3 === 0));
  ok(Math.min(...xs) > 0.9 && Math.max(...xs) < 2.1, 'a window\'s geometry is where the file put it (1.0–1.9 m along the wall)', Math.min(...xs) + '..' + Math.max(...xs));
  const again = A.ifcxModelToIfc4(bm, { name: 'again' });
  const eng2 = await quiet(IfcModel.create)(WebIFC, null);
  const M2 = await quiet((b) => eng2.load(b))(new TextEncoder().encode(again.text));
  ok(M2.storeys.length === 2 && M2.elements === M.elements, 'IFCX we wrote opens again as the same number of elements', M2.elements + ' / ' + M.elements);
  console.log(bad ? `\n${bad} failed` : '\nall ok');
  return bad ? 1 : 0;
}
