/* SPDX-License-Identifier: Apache-2.0 */
/**
 * site-constraints-test.mjs: building lines, servitudes and the wall-crossing warning on a real IFC model (BK.104, session
 * bk-stages-10), DOM-free:   node bin/test-bimcraft.mjs --siteconstraints
 * A 20 000 x 30 000 mm site with the building's origin at its corner, so plan millimetres = site millimetres. Setbacks: front
 * (south) 5000, sides 1500, rear 3000 → the building line is (1500, 5000) to (18500, 27000). A 3000 wide sewer servitude runs
 * along x = 16000 (x from 14500 to 17500). Every expected result is worked out in the comment beside it.
 */
import path from 'node:path';
import fs from 'node:fs';

export async function siteConstraintsMode({ APP, ROOT, WebIFC, IfcModel, quiet }) {
  let bad = 0, good = 0;
  const ok = (cond, label, detail = '') => { if (cond) good++; else bad++; console.log((cond ? '  ok   ' : '  FAIL ') + label + (!cond && detail !== '' ? ' (' + (typeof detail === 'string' ? detail : JSON.stringify(detail)) + ')' : '')); };
  const near = (a, b, e = 0.01) => Math.abs(a - b) <= e;
  const { ModelWriter } = await import(path.join(APP, 'model-write.js'));
  const OPS = await import(path.join(APP, 'model-ops.js'));
  const MW = await import(path.join(APP, 'model-walls.js'));
  const MS = await import(path.join(APP, 'model-site.js'));
  const SC = await import(path.join(APP, 'model-site-constraints.js'));
  const { IfcEditor } = await import(path.join(APP, 'ifc-edit.js'));
  const { ids, val } = await import(path.join(APP, 'ifc-util.js'));
  const { t } = await import(path.join(APP, 'i18n.js'));
  const N = await import(path.join(APP, 'new-model.js'));
  const boot = async (bytes) => { const eng = await quiet(IfcModel.create)(WebIFC, null); await quiet((b) => eng.load(b))(bytes); return new IfcEditor(WebIFC, eng); };
  const text = N.newBuilding({ name: 'Site constraints', levels: N.stackLevels(2, 3000, (i) => 'Level ' + (i + 1)), fileName: 'sc.ifc', now: new Date('2026-11-11T12:00:00Z') });
  let ed = await boot(new TextEncoder().encode(text));
  const W = () => new ModelWriter(WebIFC, ed.api, ed.mid);
  const levels = () => OPS.snapshotModel(ed).levels;
  const L1 = levels()[0], L2 = levels()[1];
  const read = () => SC.readConstraints(W());
  const probs = () => SC.siteProblems(W(), { t, levelName: (id) => levels().find((l) => l.id === id)?.name || '' });
  const has = (poly, x, y) => poly.some((p) => near(p[0], x, 0.01) && near(p[1], y, 0.01));
  const wallGuid = (a, b) => MW.readWalls(W()).find((x) => near(x.a[0], a[0], 1) && near(x.a[1], a[1], 1) && near(x.b[0], b[0], 1) && near(x.b[1], b[1], 1))?.guid;
  const draw = (level, a, b, bulge = 0) => { ed.modelChange(OPS.drawWalls({ storey: level.guid, segs: [{ a, b, ...(bulge ? { bulge } : {}) }], typeKey: 'int-2x4', height: 2700 })); return wallGuid(a, b); };

  console.log('== the site, setbacks and the building line worked out from them');
  ok(read().site === null || read().items.length === 0, 'a new building: no constraints');
  ok(probs().length === 0, 'and no problems');
  ed.modelChange(MS.setSiteOutline({ storey: L1.guid, points: [[0, 0], [20000, 0], [20000, 30000], [0, 30000]] }));
  let threw = null;
  try { ed.modelChange(SC.setSetbacks({ setbacks: [5000, 1500] })); } catch (e) { threw = e.key; }
  ok(threw === 'model.err.sc.setbacks', 'two distances for four boundaries: refused (model.err.sc.setbacks)', threw);
  threw = null;
  try { ed.modelChange(SC.setSetbacks({ setbacks: [0, 10000, 0, 10000] })); } catch (e) { threw = e.key; }
  ok(threw === 'model.err.sc.fold', 'side setbacks of 10 000 + 10 000 on a 20 000 wide site: refused (nothing left to build in)', threw);
  let n0 = ed.changes.length;
  ed.modelChange(SC.setSetbacks({ setbacks: [5000, 1500, 3000, 1500] }), { label: 'Setbacks' });
  ok(ed.changes.length === n0 + 1, 'setting the setbacks is one undo step');
  let C = read();
  ok(JSON.stringify(C.setbacks) === '[5000,1500,3000,1500]', 'the setbacks read back per boundary: 5000, 1500, 3000, 1500', C.setbacks);
  const d = C.items.find((x) => x.derived);
  ok(C.items.length === 1 && d && d.closed && d.pts.length === 4 && has(d.pts, 1500, 5000) && has(d.pts, 18500, 5000) && has(d.pts, 18500, 27000) && has(d.pts, 1500, 27000), 'one building line from them: (1500, 5000) (18500, 5000) (18500, 27000) (1500, 27000)', d?.pts);

  console.log('== walls against the building line: inside, touching, crossing');
  // int-2x4 is 114.3 thick (half 57.15)
  const inside = draw(L1, [3000, 8000], [10000, 8000]);
  ok(probs().length === 0, 'a wall well inside: no warning');
  // touching: centre line at y = 5057.15, outer face exactly on the line y = 5000
  const touch = draw(L1, [3000, 5057.15], [10000, 5057.15]);
  ok(probs().length === 0, 'a wall with its face on the line (centre at y = 5057.15, half thickness 57.15): touching is allowed', probs().map((p) => p.text));
  // crossing: from y = 3000 to y = 7000 across the front line; drawing it is NOT refused
  n0 = ed.changes.length;
  const cross = draw(L1, [12000, 3000], [12000, 7000]);
  ok(!!cross && ed.changes.length === n0 + 1 && MW.readWalls(W()).some((x) => x.guid === cross), 'a wall drawn across the front building line is drawn (the action is not refused)');
  let P = probs();
  ok(P.length === 1 && P[0].code === 'site.buildingline.cross' && P[0].severity === 'warning' && P[0].about[0].id === cross && P[0].part === d.guid, 'one warning, about that wall and that line', P);
  ok(/Level 1/.test(P[0].text) && /Building line from setbacks/.test(P[0].text) && /over the building line/.test(P[0].text), 'its words name the wall (with its level) and the line: ' + P[0]?.text);
  ok(P.every((p) => p.severity === 'warning' && p.acceptable !== false), 'advisory: a warning that can be accepted, never an error');
  // moved back: the wall now runs from y = 6000 to y = 10000
  ed.modelChange(OPS.changeWall(cross, { a: [12000, 6000], b: [12000, 10000] }));
  ok(probs().length === 0, 'the wall moved back inside the line: the warning clears');
  ed.undo();
  ok(probs().length === 1, 'undo: the warning is back');
  ed.redo();
  ok(probs().length === 0, 'redo: clear again');

  console.log('== a servitude: a strip with a kind, a name, a reference and a width');
  threw = null;
  try { ed.modelChange(SC.addConstraint({ storey: L1.guid, kind: 'servitude', shape: 'strip', pts: [[16000, 0], [16000, 30000]], width: 0 })); } catch (e) { threw = e.key; }
  ok(threw === 'model.err.sc.width', 'a strip with no width: refused (model.err.sc.width)', threw);
  const rS = ed.modelChange(SC.addConstraint({ storey: L1.guid, kind: 'servitude', shape: 'strip', pts: [[16000, 0], [16000, 30000]], width: 3000, servitude: 'sewer', name: 'Municipal sewer', reference: 'SG 1234/1998' }));
  C = read();
  const sv = C.items.find((x) => x.kind === 'servitude');
  ok(sv && sv.guid === rS.guid && sv.shape === 'strip' && near(sv.width, 3000) && sv.servitude === 'sewer' && sv.name === 'Municipal sewer' && sv.reference === 'SG 1234/1998', 'read back: a sewer servitude 3000 wide, "Municipal sewer", SG 1234/1998', sv);
  ok(sv.poly.length === 4 && has(sv.poly, 14500, 0) && has(sv.poly, 17500, 0) && has(sv.poly, 17500, 30000) && has(sv.poly, 14500, 30000), 'its area: x from 14500 to 17500 over the depth of the site');
  ok(probs().length === 0, 'no wall on it yet: no warning');
  // a wall ending at x = 15000 is 500 inside the strip (edge at 14500); it is inside the building line (y = 12000)
  const over = draw(L1, [11000, 12000], [15000, 12000]);
  P = probs();
  ok(P.length === 1 && P[0].code === 'site.servitude.over' && P[0].about[0].id === over && P[0].part === sv.guid && /Municipal sewer \(SG 1234\/1998\)/.test(P[0].text) && /Sewer servitude/.test(P[0].text), 'a wall ending 500 inside the strip: one warning naming the wall, the servitude and its reference: ' + P[0]?.text, P);
  // the same wall on the level above also stands over the servitude
  const up = draw(L2, [11000, 14000], [16000, 14000]);
  P = probs();
  ok(P.length === 2 && P.some((p) => p.about[0].id === up && /Level 2/.test(p.text)), 'a wall on Level 2 over the strip warns too, named with its level');
  // a wall ending on the strip's edge (x = 14500): touching
  draw(L1, [11000, 16000], [14500, 16000]);
  ok(probs().length === 2, 'a wall ending exactly on the servitude edge: touching, no new warning');
  // narrower: 2000 wide = x from 15000 to 17000; the first wall (to x = 15000) now only touches, the Level 2 one (to 16000) is still over it
  ed.modelChange(SC.changeConstraint(sv.guid, { width: 2000 }));
  P = probs();
  ok(near(read().items.find((x) => x.guid === sv.guid).width, 2000) && P.length === 1 && P[0].about[0].id === up, 'the servitude made 2000 wide (x from 15000): the wall to x = 15000 clears, the one to x = 16000 stays');
  ed.modelChange(SC.changeConstraint(sv.guid, { width: 3000, name: 'Sewer main', servitude: 'stormwater' }));
  ok(read().items.find((x) => x.guid === sv.guid).name === 'Sewer main' && read().items.find((x) => x.guid === sv.guid).servitude === 'stormwater' && probs().length === 2, 'name, kind and width edited in one step');

  console.log('== a curved wall');
  // a half circle on the chord (4000, 20000) → (10000, 20000): radius 3000. Bulge −1 bows up (top at y = 23000 + 57: inside the rear line at 27000).
  draw(L1, [4000, 20000], [10000, 20000], -1);
  ok(probs().length === 2, 'a curved wall bowing inside the building line: no new warning');
  // a half circle on the chord (4000, 7000) → (10000, 7000), bulge +1 bows down: bottom at y = 4000 − 57, over the front line (y = 5000); both ends are inside
  const curved = draw(L1, [4000, 7000], [10000, 7000], 1);
  P = probs();
  ok(!!curved && P.length === 3 && P.some((p) => p.about[0].id === curved && p.code === 'site.buildingline.cross'), 'a curved wall whose ends are inside but whose belly bows over the front line: a warning');
  ed.modelChange(OPS.removeWalls([curved]));
  ok(probs().length === 2, 'the curved wall deleted: its warning goes');

  console.log('== a drawn building line (open), an area servitude, the boundary');
  const rB = ed.modelChange(SC.addConstraint({ storey: L1.guid, kind: 'buildingline', pts: [[0, 25000], [20000, 25000]], name: 'Rear building line', reference: 'Title deed T123' }));
  ok(probs().length === 2, 'an open drawn line nothing crosses: no new warning');
  const xb = draw(L1, [5000, 24000], [5000, 26000]);
  P = probs();
  ok(P.length === 3 && P.some((p) => p.about[0].id === xb && p.part === rB.guid && /crosses the building line "Rear building line \(Title deed T123\)"/.test(p.text)), 'a wall across the drawn line: "crosses the building line", with its name and reference');
  ed.modelChange(SC.moveConstraints([rB.guid], { storey: L1.guid, from: [0, 25000], to: [0, 26500] }));
  ok(near(read().items.find((x) => x.guid === rB.guid).pts[0][1], 26500) && probs().length === 2, 'the line moved to y = 26500 (past the wall end at 26000): the warning clears');
  const rA = ed.modelChange(SC.addConstraint({ storey: L1.guid, kind: 'servitude', pts: [[2000, 9000], [4000, 9000], [4000, 11000], [2000, 11000], [2000, 9000]], servitude: 'right-of-way', name: 'Right of way' }));
  const area = read().items.find((x) => x.guid === rA.guid);
  ok(area && area.shape === 'area' && area.poly.length === 4, 'a servitude closed on its first point is an area (four corners)');
  const inA = draw(L1, [2500, 10000], [3500, 10000]);
  ok(probs().some((p) => p.about[0].id === inA && p.part === rA.guid && /Right of way/.test(p.text)), 'a wall inside the area: a warning');
  // outside the site: from x = 19000 to x = 21000 → over the boundary AND over the building line (x = 18500)
  const out = draw(L1, [19000, 20000], [21000, 20000]);
  P = probs().filter((p) => p.about[0].id === out);
  ok(P.length === 2 && P.some((p) => p.code === 'site.boundary.cross') && P.some((p) => p.code === 'site.buildingline.cross'), 'a wall running out of the site: two warnings (the boundary, the building line)', P.map((p) => p.code));
  const ids0 = probs().map((p) => p.code + ':' + p.about[0].id + '#' + p.part).sort().join('|');

  console.log('== the wall\'s real footprint: a mitred corner');
  {
    // two walls meeting at (8000, 20000): one from the west, one going north. Each wall's own rectangle stops at the corner point:
    // west wall x <= 8000 (y from 19942.85 to 20057.15), north wall y >= 20000 (x from 7942.85 to 8057.15). The mitre adds the outer
    // square x 8000..8057.15, y 19942.85..20000, split on the diagonal x + y = 28000: the half below it belongs to the west wall.
    // A short drawn line ending at (8030, 19960) (x + y = 27990: 7 mm inside the west wall's half, 27 and 17 mm from the outer faces)
    // touches neither rectangle, so only the real (mitred) footprint is crossed.
    const nP = probs().length;
    ed.modelChange(OPS.drawWalls({ storey: L1.guid, segs: [{ a: [5000, 20000], b: [8000, 20000] }, { a: [8000, 20000], b: [8000, 23000] }], typeKey: 'int-2x4', height: 2700 }));
    const west = wallGuid([5000, 20000], [8000, 20000]);
    ok(probs().length === nP, 'an L of two walls well inside everything: no new warning');
    const tip = ed.modelChange(SC.addConstraint({ storey: L1.guid, kind: 'buildingline', pts: [[8100, 19900], [8030, 19960]], name: 'Corner line' }));
    const got = probs().filter((p) => p.part === tip.guid);
    ok(got.length === 1 && got[0].about[0].id === west, 'a line ending inside the mitred outer corner (outside both walls\' own rectangles): the west wall is warned about, by its real footprint', got.map((p) => p.text));
    ed.modelChange(SC.removeConstraints([tip.guid]));
    ed.modelChange(OPS.removeWalls([west, wallGuid([8000, 20000], [8000, 23000])]));
    ok(probs().length === nP, 'the corner and its line removed: back to the warnings before');
  }

  console.log('== save and reopen');
  const bytes = ed.save(), txt = new TextDecoder().decode(bytes);
  const defined = new Set([...txt.matchAll(/^#(\d+)=/gm)].map((m) => m[1])), dangling = new Set();
  for (const line of txt.split('\n')) for (const m of line.replace(/^#\d+=/, '').replace(/'(?:[^']|'')*'/g, '').matchAll(/#(\d+)/g)) if (!defined.has(m[1])) dangling.add(m[1]);
  ok(dangling.size === 0, 'the saved file has no dangling references', [...dangling].slice(0, 5));
  ok((txt.match(/IFCANNOTATION\(/g) || []).length >= 4 && /'BuildingLine'/.test(txt) && /'Servitude'/.test(txt) && /'CadCraft_SiteConstraint'/.test(txt) && /IFCGEOMETRICCURVESET/.test(txt), 'building lines and servitudes are IfcAnnotations (ObjectType BuildingLine / Servitude) with a curve set and CadCraft_SiteConstraint');
  const before = read();
  ed = await boot(bytes);
  const after = read();
  const key = (R) => R.items.map((x) => [x.guid, x.kind, x.shape, x.closed, Math.round(x.width), x.name, x.reference, x.servitude, x.derived, x.pts.map((p) => p.map((v) => Math.round(v)).join(',')).join(';')].join('/')).sort().join('|');
  ok(after.items.length === 4 && key(after) === key(before), 'reopened: the four constraints are as saved (kind, shape, points, width, name, reference)', key(after));
  ok(JSON.stringify(after.setbacks) === '[5000,1500,3000,1500]', 'the setbacks are as saved');
  ok(probs().map((p) => p.code + ':' + p.about[0].id + '#' + p.part).sort().join('|') === ids0, 'and the same warnings come back (same walls, same constraints: an accepted warning stays accepted)');
  // the annotations hang under the site, and other readers find a plain curve
  {
    const w = W(), site = MS.readSite(w);
    const rel = ids(w.api, w.mid, 'IFCRELCONTAINEDINSPATIALSTRUCTURE').map((r) => w.api.GetLine(w.mid, r, false)).find((r) => r.RelatingStructure?.value === site.id);
    ok(rel && after.items.every((x) => rel.RelatedElements.some((h) => h.value === x.id)), 'all four are contained in the IfcSite');
    const a = w.api.GetLine(w.mid, after.items.find((x) => x.kind === 'servitude' && x.shape === 'strip').id, true);
    const rep = a.Representation.Representations[0], pl = rep.Items[0].Elements[0];
    ok(val(rep.RepresentationType) === 'GeometricCurveSet' && pl.Points.length === 5, 'the strip is written as its outline: a closed polyline of 5 points (4 corners, back to the first)', pl.Points.length);
  }

  console.log('== the site outline drawn again; removing');
  ed.modelChange(MS.setSiteOutline({ storey: L1.guid, points: [[0, 0], [22000, 0], [22000, 30000], [0, 30000]] }));
  let dd = read().items.find((x) => x.derived);
  ok(dd && has(dd.pts, 20500, 5000) && has(dd.pts, 20500, 27000), 'a wider site with as many boundaries: the setbacks stay and the building line follows (east side now x = 20500)', dd?.pts);
  ed.modelChange(MS.setSiteOutline({ storey: L1.guid, points: [[0, 0], [22000, 0], [22000, 30000], [11000, 32000], [0, 30000]] }));
  ok(read().setbacks.length === 0 && !read().items.some((x) => x.derived), 'an outline with another number of boundaries (and unequal setbacks): the setbacks are cleared, the line from them goes');
  ed.undo();
  ok(read().items.some((x) => x.derived) && read().setbacks.length === 4, 'undo brings both back');
  n0 = read().items.length;
  ed.modelChange(SC.removeConstraints([rA.guid, rB.guid]));
  ok(read().items.length === n0 - 2 && !probs().some((p) => p.part === rA.guid), 'two constraints removed: their warnings go with them');
  ed.modelChange(SC.removeConstraints([read().items.find((x) => x.derived).guid]));
  ok(read().setbacks.length === 0 && !read().items.some((x) => x.derived), 'removing the line from setbacks clears the setbacks');
  const final = ed.save();

  // IfcOpenShell schema validation when a venv with it is here (as draw06 does)
  const py = [path.join(ROOT, 'tools/detailcraft-test/venv/bin/python'), path.join(ROOT, 'tools/bimcraft-test/venv/bin/python')].find((p) => fs.existsSync(p));
  if (!py) console.log('  --   no venv with ifcopenshell: schema validation skipped');
  else {
    const { execFileSync } = await import('node:child_process');
    const os = await import('node:os');
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'bim-sc-'));
    const files = [['constraints', bytes], ['after', final]].map(([k, b]) => { const f = path.join(dir, k + '.ifc'); fs.writeFileSync(f, b); return f; });
    let out = '';
    try { out = execFileSync(py, ['-I', path.join(ROOT, 'tools/bimcraft-test/ifc_validate.py'), ...files], { encoding: 'utf8' }); } catch (e) { out = String(e.stdout || ''); }
    const res = out.trim().split('\n').filter(Boolean).map((l) => JSON.parse(l));
    ok(res.length === files.length && res.every((r) => r.errors === 0), 'another IFC reader (schema validation) finds no errors in ' + res.map((r) => path.basename(r.file) + ' (' + r.errors + ')').join(', ') + (res.some((r) => r.errors) ? ': ' + res.flatMap((r) => r.first).slice(0, 3).join(' | ') : ''));
    fs.rmSync(dir, { recursive: true, force: true });
  }

  console.log(`\n${good} passed, ${bad} failed`);
  return bad ? 1 : 0;
}
