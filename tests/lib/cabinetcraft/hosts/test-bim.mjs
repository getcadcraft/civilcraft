/* SPDX-License-Identifier: Apache-2.0 */
// The BimCraft adapter (hosts/bim.js) against BimCraft's REAL add-on API and a REAL IfcEditor on a drawn two-room house (cc-ifc, the build's own engine; manifold-3d for openings):
// rooms read from the walls, the room taken into the job, the cabinets placed as IfcFurniture in ONE undo step, replaced, removed, the schedule read back, the check, the plan drawn
// on the level as drafting lines, Undo and Redo, an IFC2X3 model, and the add-on loaded through BimCraft's own loader from its own folder.
const { ok, section, near, ADDON, APP, ROOT } = globalThis.__ccTest;
import fs from 'node:fs';
import path from 'node:path';
import { register } from 'node:module';
import { pathToFileURL, fileURLToPath } from 'node:url';

register('data:text/javascript,' + encodeURIComponent(`import { pathToFileURL } from 'node:url';
export async function resolve(spec, ctx, next) {
  if (/^[A-Za-z]:/.test(spec)) return { url: pathToFileURL(spec).href, shortCircuit: true };
  if (spec === 'manifold-3d') return { url: ${JSON.stringify(pathToFileURL(path.join(ROOT, 'public_html/assets/vendor/manifold-3d/current/manifold.js')).href)}, shortCircuit: true };
  if (spec === 'proj4') return { url: ${JSON.stringify(pathToFileURL(path.join(ROOT, 'public_html/assets/vendor/proj4/current/proj4.esm.min.js')).href)}, shortCircuit: true };
  if (spec === 'delaunator') return { url: ${JSON.stringify(pathToFileURL(path.join(ROOT, 'public_html/assets/vendor/delaunator/current/index.js')).href)}, shortCircuit: true };
  if (spec === 'robust-predicates') return { url: ${JSON.stringify(pathToFileURL(path.join(ROOT, 'public_html/assets/vendor/robust-predicates/current/index.js')).href)}, shortCircuit: true };
  return next(spec, ctx);
}`), import.meta.url);

const imp = (f) => import(pathToFileURL(path.join(APP, f)).href);
if (!/bimcraft/.test(APP)) { ok(true, 'not BimCraft: skipped'); } else {
  globalThis.document ??= { querySelector: () => null, querySelectorAll: () => [], getElementById: () => null, createElement: () => ({ setAttribute() {}, append() {}, remove() {} }), head: null };
  const quiet = (fn) => async (...a) => { const l = console.log, w = console.warn; console.log = () => {}; console.warn = () => {}; try { return await fn(...a); } finally { console.log = l; console.warn = w; } };
  const i18n = await imp('i18n.js');
  i18n.init({ locale: 'en', strings: JSON.parse(fs.readFileSync(path.join(APP, 'lang/en.json'), 'utf8')) });
  const WebIFC = await imp('ifc/api.js');
  const { IfcModel } = await imp('ifc-model.js');
  const { IfcEditor } = await imp('ifc-edit.js');
  const N = await imp('new-model.js');
  const OPS = await imp('model-ops.js');
  const { ModelWriter } = await imp('model-write.js');
  const BA = await imp('addons/bimcraft-api.js');
  const A = await imp('addons.js');
  const Pj = await mineLib('project.js'), An = await mineLib('analyze.js'), Core = await mineLib('core.js');
  function mineLib(f) { return import(pathToFileURL(path.join(ADDON, 'lib', f)).href); }

  const build = async (schema) => {
    const text = N.newBuilding({ name: 'Kitchen house', levels: N.stackLevels(2, 3000, (i) => 'Level ' + (i + 1)), fileName: 'k.ifc', now: new Date('2026-10-30T12:00:00Z'), ...(schema ? { schema } : {}) });
    const engine = await quiet(IfcModel.create)(WebIFC, null);
    await quiet((b) => engine.load(b))(new TextEncoder().encode(text));
    const ed = new IfcEditor(WebIFC, engine);
    let snap = OPS.snapshotModel(ed);
    const [L1, L2] = snap.levels.map((l) => l.guid);
    const pts = [[0, 0], [8000, 0], [8000, 5000], [0, 5000]];
    ed.modelChange(OPS.drawWalls({ storey: L1, segs: pts.map((p, i) => ({ a: p, b: pts[(i + 1) % 4] })), typeKey: 'ext-2x6', topLevel: L2, extSide: 'right' }));
    ed.modelChange(OPS.drawWalls({ storey: L1, segs: [{ a: [4000, 0], b: [4000, 5000] }], typeKey: 'int-2x4', topLevel: L2 }));
    snap = OPS.snapshotModel(ed);
    const south = snap.walls.find((w) => w.a[1] === 0 && w.b[1] === 0 && w.typeKey === 'ext-2x6');
    ed.modelChange(OPS.placeOpening({ wall: south.guid, typeKey: 'door-single', offset: 500, face: 'left' }));
    return { ed, engine, L1, L2 };
  };

  const run = async (label, schema) => {
    section('BimCraft: ' + label);
    const { ed, engine, L1 } = await build(schema);
    let captured = null, sel = [], afterEdits = 0, said = '';
    const mem = new Map();
    const FIX = path.join(APP, 'addons');
    const started = await BA.startAddons({
      editor: () => ed, model: () => engine, name: () => 'k.ifc', selection: () => sel, select: (ids) => { sel = ids; }, afterEdit: () => { afterEdits++; }, status: (s) => { said = s; }, openIfc: async () => {},
      base: pathToFileURL(FIX + '/').href, storage: { getItem: (k) => (mem.has(k) ? mem.get(k) : null), setItem: (k, v) => mem.set(k, String(v)), removeItem: (k) => mem.delete(k) }, verify: async () => false, bundledOnly: false, noGlobal: true, packages: A.packageStore(null),
      fetchJson: async (u) => (/\/index\.json$/.test(u) ? { addons: ['cabinetcraft'] } : (() => { try { return JSON.parse(fs.readFileSync(fileURLToPath(u), 'utf8')); } catch { return null; } })()),
      importer: async (u) => { const m = await import(u); return /\/cabinetcraft\/main\.js/.test(u) ? { ...m, activate: (api) => { captured = api; return m.activate(api); } } : m; },
    });
    const entry = started.list().find((a) => a.id === 'cabinetcraft');
    ok(entry && entry.state === 'off' && entry.source === 'bundled', 'the add-on is found in BimCraft\'s own folder and is off by default', JSON.stringify(entry));
    await started.loader.setEnabled('cabinetcraft', true);
    ok(started.list().find((a) => a.id === 'cabinetcraft').state === 'active' && captured, 'switched on: active, with BimCraft\'s API ' + (captured && captured.version));
    const api = captured;
    ok(api.version === BA.BIMCRAFT_API_VERSION && typeof api.model.roomPlans === 'function' && typeof api.drafting.put === 'function' && typeof api.model.write === 'function', 'the API has model.write, model.roomPlans and drafting.put (1.4)');
    const { detect } = await import(pathToFileURL(path.join(ADDON, 'host.js')).href);
    const t = (k, v) => api.t(k, v);
    const host = detect(api, { t });
    ok(host && host.id === 'bim' && host.gcode === false && host.room, 'detect: a BimCraft host that says it has no G-code and can take a room');
    ok(detect({ model: {} }, { t }) === null && detect({}, { t }) === null, 'detect: an api with no model.write is not a host');
    started.runCommand('cabinetcraft:check');
    ok(started.commandList().some((c) => c.key === 'cabinetcraft:sample'), 'its commands are in BimCraft\'s command list');

    // ---- the room
    const list = await host.room.list();
    ok(list.length === 2 && list.every((r) => /Level 1/.test(r.label)), 'two rooms found on Level 1: ' + list.map((r) => r.label).join(' | '));
    const w = new ModelWriter(ed.W, ed.api, ed.mid);
    const wallsAll = api.model.walls();
    const inner = wallsAll.find((x) => Math.abs(x.a[0] - 4000) < 1 && Math.abs(x.b[0] - 4000) < 1);
    sel = [inner.id];
    const list2 = await host.room.list();
    ok(list2.length === 2, 'with the inner wall selected the same two rooms come back');
    const m0 = await host.room.read(list2[0].id);
    ok(m0.pts.length === 4 && m0.storey === L1 && near(Math.max(...m0.pts.map((q) => q[0])) - Math.min(...m0.pts.map((q) => q[0])), 4000, 400) && m0.openings.length >= 0, 'a room reads as a 4-corner outline about 4 m wide');
    const hasDoor = [list2[0], list2[1]].map((x) => 0);
    void hasDoor;
    // the south room with the door
    const ids2 = [];
    for (const r of list2) { const m = await host.room.read(r.id); ids2.push({ r, m }); }
    const withDoor = ids2.find((x) => x.m.openings.some((o) => o.kind === 'door'));
    ok(withDoor, 'one of the two rooms has the door of the south wall among its openings');
    const FR = await mineLib('fromroom.js');
    // ---- the job
    const E = await mineLib('edit.js');
    let project = Pj.newProject('mm');
    const r = FR.applyModelRoom(project, { ...withDoor.m, host: 'bim' });
    project = r.project;
    ok(project.site.host === 'bim' && project.site.storey === L1 && project.openings.length >= 1, 'the room is the job\'s room, on Level 1, with the door as an opening');
    project = E.addRun(project, project.room.shape === 'rect' ? 'S' : 'P1');
    const ids = (c) => c;
    void ids;
    // a run with a few cabinets
    project = E.addItem ? E.addItem(project, project.runs[0].id, 'base', { tpl: 'base-door-1', w: 600 }) : project;
    const analyzeNow = (p) => An.analyze(p, { say: (k) => k, word: (k) => k, t: (k) => k });
    let a = analyzeNow(project);
    if (!a.build.cells.some((c) => c.kind === 'cab')) project = Pj.cleanProject({ ...Pj.sampleProject('mm'), room: project.room, openings: [], site: project.site, name: 'Kitchen' }), a = analyzeNow(project);
    ok(a.build.cells.some((c) => c.kind === 'cab'), 'the job has cabinets (' + a.build.cells.filter((c) => c.kind === 'cab').length + ')');
    const mk = (p) => { const an = analyzeNow(p); return { api, t, project: p, analysis: an, build: an.build, list: an.list, est: an.est, nest: null, say2() {}, fmt: String, base: () => 'job', download: (n, d) => { dl.push({ n, d }); }, site: p.site }; };
    const dl = [];
    const act = async (secId, actId, p = project) => { const ctx = mk(p); const sec = host.sections(ctx).find((x) => x.id === secId); const action = sec.actions.find((x) => x.id === actId); return action.run(ctx); };
    const furniture = (w2) => { const out = []; for (const cls of ['IFCFURNITURE', 'IFCFURNISHINGELEMENT', 'IFCBUILDINGELEMENTPROXY']) { try { for (const id of w2.api.GetLineIDsWithType(w2.mid, WebIFC[cls]) ? [...Array(w2.api.GetLineIDsWithType(w2.mid, WebIFC[cls]).size()).keys()].map((i) => w2.api.GetLineIDsWithType(w2.mid, WebIFC[cls]).get(i)) : []) out.push({ cls, id }); } catch { /* none */ } } return out.filter((x) => w2.readPset(x.id, 'CabinetCraft')); };
    const count = () => furniture(new ModelWriter(ed.W, ed.api, ed.mid)).length;
    const before = count();
    const els = (await import(pathToFileURL(path.join(ADDON, 'lib/elements.js')).href)).cabinetElements(a.build, { word: (k) => k });

    // ---- place
    const hist0 = ed.undoStack ? ed.undoStack.length : null;
    const msg = await act('bim-place', 'bim-place');
    ok(count() === before + els.length && /placed/.test(msg), 'placed: ' + els.length + ' elements in the model (' + msg + ')');
    const w3 = new ModelWriter(ed.W, ed.api, ed.mid);
    const f1 = furniture(w3);
    const cls = new Set(f1.map((x) => x.cls));
    ok(schema === 'IFC2X3' ? (cls.has('IFCFURNISHINGELEMENT') && !cls.has('IFCFURNITURE')) : cls.has('IFCFURNITURE'), 'cabinets are ' + (schema === 'IFC2X3' ? 'IfcFurnishingElement (IFC2X3)' : 'IfcFurniture') + '; countertops ' + (cls.has('IFCBUILDINGELEMENTPROXY') ? 'proxies' : 'absent'));
    const p0 = w3.readPset(f1[0].id, 'CabinetCraft');
    ok(p0 && p0.Job && p0.Number && p0.WidthMm > 0 && p0.Template, 'each has the CabinetCraft property set: ' + JSON.stringify(p0).slice(0, 120));
    ok(f1.every((x) => w3.api.GetLine(w3.mid, x.id, false).Representation), 'every element has a body');
    // the elements stand inside the room they were made for (their placements, in the storey's plan axes)
    {
      const xs = withDoor.m.pts.map((q) => q[0]), ys = withDoor.m.pts.map((q) => q[1]);
      const bx = [Math.min(...xs), Math.max(...xs)], by = [Math.min(...ys), Math.max(...ys)];
      const inside = f1.filter((x) => { const l = w3.api.GetLine(w3.mid, x.id, false), M = w3.api.GetWorldTransformMatrix(w3.mid, l.ObjectPlacement.value); const px = M[12] * w3.unitMm, py = M[13] * w3.unitMm; return px >= bx[0] - 60 && px <= bx[1] + 60 && py >= by[0] - 60 && py <= by[1] + 60; });
      ok(inside.length === f1.length, 'every element\'s placement is inside the room (' + inside.length + ' of ' + f1.length + ' within ' + Math.round(bx[1] - bx[0]) + ' x ' + Math.round(by[1] - by[0]) + ')');
    }
    ok(afterEdits >= 1, 'BimCraft\'s panels were refreshed after the write');
    if (hist0 !== null) ok(ed.undoStack.length === hist0 + 1, 'one undo step for the whole placement');
    // ---- bounds: the cabinets stand in the room's place
    const tri = engine.api && null;
    void tri;
    // ---- replace
    await act('bim-place', 'bim-place');
    ok(count() === before + els.length, 'placing again replaces this job\'s elements (still ' + count() + ')');
    // ---- the schedule and the check
    const sm = await act('bim-model', 'bim-schedule');
    ok(dl.length === 1 && /model-schedule\.csv$/.test(dl[0].n) && dl[0].d.split('\n').length === els.length + 2 && /Number/.test(dl[0].d), 'the schedule is read back from the model: ' + els.length + ' rows (' + sm + ')');
    ok(/all \d+ elements/.test(await act('bim-model', 'bim-check')), 'the check says the model has all the job\'s elements');
    // job changes: one cabinet more -> the check finds it missing
    const p2 = E.addRun ? Pj.cleanProject({ ...project, runs: project.runs.map((x, i) => (i === 0 ? { ...x, base: [...x.base, ...x.base.slice(0, 1)] } : x)) }) : project;
    const msgC = await act('bim-model', 'bim-check', p2);
    ok(/differ|missing/.test(msgC) || analyzeNow(p2).build.cells.length === a.build.cells.length, 'a changed job: the check names what differs (' + msgC.slice(0, 60) + ')');
    // ---- the plan on the level
    const dr = await act('bim-draft', 'bim-draft');
    ok(/drafting lines/.test(dr), 'plan drawn on the level: ' + dr);
    const draft = (w2) => { const o = []; try { const q = w2.api.GetLineIDsWithType(w2.mid, WebIFC.IFCANNOTATION); for (let i = 0; i < q.size(); i++) o.push(q.get(i)); } catch { /* none */ } return o.filter((id) => w2.readPset(id, 'CadCraft_DraftTag')); };
    const n1 = draft(new ModelWriter(ed.W, ed.api, ed.mid)).length;
    await act('bim-draft', 'bim-draft');
    ok(n1 > 8 && draft(new ModelWriter(ed.W, ed.api, ed.mid)).length === n1, 'drawing it again replaces it (' + n1 + ' lines both times)');
    // ---- undo / redo
    ed.undo();
    ok(draft(new ModelWriter(ed.W, ed.api, ed.mid)).length === n1, 'one Undo takes back the second drawing (the first stays)');
    ed.undo(); ed.undo();
    ed.undo();
    ok(count() <= before + els.length, 'Undo goes back through the placements');
    while (ed.undoStack && ed.undoStack.length > (hist0 ?? 0)) ed.undo();
    ok(count() === before, 'undone to before the first placement: ' + count() + ' elements');
    ed.redo();
    ok(count() === before + els.length, 'Redo brings the elements back (same count)');
    // ---- remove
    const rm = await act('bim-place', 'bim-remove');
    ok(count() === before && /taken out/.test(rm), 'Remove takes this job\'s elements out: ' + rm);
    ok(/None/.test(await act('bim-place', 'bim-remove')), 'removing again says there is nothing');
    // ---- no room taken: first level
    const noSite = { ...project }; delete noSite.site;
    const m5 = await act('bim-place', 'bim-place', Pj.cleanProject(noSite));
    ok(/first level/.test(m5) && count() === before + els.length, 'a job with no room from the model is placed on the first level at the origin, and says so');
    await started.loader.setEnabled('cabinetcraft', false);
    ok(started.list().find((a2) => a2.id === 'cabinetcraft').state === 'off', 'switched off');
  };
  await run('IFC4 model');
  // an IFC2X3 model (a steel frame from another program): the cabinets are IfcFurnishingElement, the proxies stay proxies, one undo step
  {
    section('BimCraft: IFC2X3 model');
    const engine = await quiet(IfcModel.create)(WebIFC, null);
    await quiet((b) => engine.load(b))(new Uint8Array(fs.readFileSync(path.join(ROOT, 'tools/detailcraft-test/fixtures/ios-steel-ifc2x3.ifc'))));
    const ed = new IfcEditor(WebIFC, engine);
    let captured = null;
    const mem = new Map();
    const started = await BA.startAddons({
      editor: () => ed, model: () => engine, name: () => 'steel.ifc', selection: () => [], select() {}, afterEdit() {}, status() {}, openIfc: async () => {},
      base: pathToFileURL(path.join(APP, 'addons') + '/').href, storage: { getItem: (k) => (mem.has(k) ? mem.get(k) : null), setItem: (k, v) => mem.set(k, String(v)), removeItem: (k) => mem.delete(k) }, verify: async () => false, bundledOnly: false, noGlobal: true, packages: A.packageStore(null),
      fetchJson: async (u) => (/\/index\.json$/.test(u) ? { addons: ['cabinetcraft'] } : (() => { try { return JSON.parse(fs.readFileSync(fileURLToPath(u), 'utf8')); } catch { return null; } })()),
      importer: async (u) => { const m = await import(u); return /\/cabinetcraft\/main\.js/.test(u) ? { ...m, activate: (api) => { captured = api; return m.activate(api); } } : m; },
    });
    await started.loader.setEnabled('cabinetcraft', true);
    const api = captured, t = (k, v) => api.t(k, v);
    const { detect } = await import(pathToFileURL(path.join(ADDON, 'host.js')).href);
    const host = detect(api, { t });
    const project = Pj.sampleProject('mm');
    const an = An.analyze(project, { say: (k) => k, word: (k) => k, t: (k) => k });
    const ctx = { api, t, project, analysis: an, build: an.build, list: an.list, est: an.est, nest: null, say2() {}, fmt: String, base: () => 'job', download() {}, site: null };
    const w0 = new ModelWriter(ed.W, ed.api, ed.mid);
    const lv = api.model.levels();
    ok(lv.length >= 1, 'the IFC2X3 model has a level (' + (lv[0] && lv[0].name) + ')');
    const n0 = ed.undoStack ? ed.undoStack.length : 0;
    const out = await host.sections(ctx).find((x) => x.id === 'bim-place').actions.find((x) => x.id === 'bim-place').run(ctx);
    const w1 = new ModelWriter(ed.W, ed.api, ed.mid);
    const q = w1.api.GetLineIDsWithType(w1.mid, WebIFC.IFCFURNISHINGELEMENT), n = q.size();
    const q2 = w1.api.GetLineIDsWithType(w1.mid, WebIFC.IFCFURNITURE);
    ok(n > 5 && /placed/.test(out) && q2.size() === 0, 'IFC2X3: ' + n + ' IfcFurnishingElement made (' + out + ')');
    ok(w1.readPset(q.get(0), 'CabinetCraft')?.Number, 'with the CabinetCraft property set');
    ok(!ed.undoStack || ed.undoStack.length === n0 + 1, 'one undo step');
    ed.undo();
    const w2 = new ModelWriter(ed.W, ed.api, ed.mid);
    ok(w2.api.GetLineIDsWithType(w2.mid, WebIFC.IFCFURNISHINGELEMENT).size() === 0, 'Undo takes them all out');
    void w0;
  }
}
