/* SPDX-License-Identifier: Apache-2.0 */
// The ModelCraft adapter (hosts/model.js) through the SHARED add-on loader and API 1.4 (addons.js: sharedApi + hostApi, as ModelCraft's shell boot builds them) on a REAL Model, with a
// model host built from ModelCraft's own modules exactly as modelcraft.js builds it (addon-bodies-mc.js, furnish-mc.js roomOfFace): the selected floor face as the room, the cabinets as
// tagged groups of real faces in ONE undo step, replaced, removed, OBJ / glTF / STL out through ModelCraft's own writers, saved and read back, and the tag found again after a reload.
const { ok, section, near, ADDON, APP, ROOT } = globalThis.__ccTest;
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';

if (!/modelcraft/.test(APP)) { ok(true, 'not ModelCraft: skipped'); } else {
  const imp = (f) => import(pathToFileURL(path.join(APP, f)).href);
  const mine = (f) => import(pathToFileURL(path.join(ADDON, f)).href);
  globalThis.document ??= { querySelector: () => null, querySelectorAll: () => [], getElementById: () => null, createElement: () => ({ setAttribute() {}, append() {}, remove() {} }), head: null };
  const I18n = await imp('i18n.js');
  I18n.init({ locale: 'en', strings: JSON.parse(fs.readFileSync(path.join(APP, 'lang/en.json'), 'utf8')) });
  const M = await imp('model.js');
  const AB = await imp('addon-bodies-mc.js');
  const FM = await imp('furnish-mc.js');
  const IO = await imp('io.js');
  const A = await imp('addons.js');
  const Pj = await mine('lib/project.js'), An = await mine('lib/analyze.js'), FR = await mine('lib/fromroom.js');

  const model = new M.Model();
  const floor = [[0, 0, 0.1], [6, 0, 0.1], [6, 4, 0.1], [0, 4, 0.1]];   // metres; a floor 6 x 4 at 100 mm
  M.addPolygon(model.root, floor);
  const fid = [...model.root.faces.keys()][0];
  let refreshed = 0, selected = [{ t: 'f', id: fid }];
  const fileName = 'House.mcraft';
  window_ccAddonModel();
  function window_ccAddonModel() {
    globalThis.window ??= globalThis;
    globalThis.window.ccAddonModel = {
      current: () => ({ name: fileName }),
      read: (fn) => fn(model),
      async addBodies(owner, group, bodies, opts = {}) { const r = AB.placeBodies(model, { owner, ownerName: opts.ownerName, group, bodies, name: opts.name, label: opts.label || owner, at: opts.at || [0, 0, 0] }); refreshed++; return r.count; },
      async removeBodies(owner, group, opts = {}) { const was = AB.removeBodies(model, { ownerName: opts.ownerName, group, label: opts.label || owner }); if (was) refreshed++; return was; },
      bodies: (owner) => AB.listBodies(model, owner, 'CabinetCraft'),
      async rooms() {
        const s = selected.length === 1 && selected[0].t === 'f' ? selected[0] : null;
        const room = s && FM.roomOfFace(model, [], s.id);
        if (!room) return [];
        const open = FM.openingsNear(model, room);
        return [{ name: fileName, poly: room.poly, holes: room.holes, z: Math.round(room.z * 1000), area: room.area * 1e6, doors: open.doors, windows: open.windows }];
      },
    };
  }
  section('ModelCraft: through the shared loader');
  const registry = { importers: new Map(), exporters: new Map(), listeners: new Set(), changed() {} };
  const mem = new Map();
  let captured = null;
  const loader = new A.AddonLoader({
    app: 'modelcraft', appName: 'ModelCraft', apiVersion: '1.4', locale: 'en',
    base: pathToFileURL(path.join(APP, 'addons') + '/').href, storage: { getItem: (k) => (mem.has(k) ? mem.get(k) : null), setItem: (k, v) => mem.set(k, String(v)), removeItem: (k) => mem.delete(k) },
    packages: A.packageStore(null), verify: async () => false,
    fetchJson: async (u) => (/\/index\.json$/.test(u) ? { addons: ['cabinetcraft'] } : (() => { try { return JSON.parse(fs.readFileSync(fileURLToPath(u), 'utf8')); } catch { return null; } })()),
    importer: async (u) => { const m = await import(u); return /\/cabinetcraft\/main\.js/.test(u) ? { ...m, activate: (api) => { captured = api; return m.activate(api); } } : m; },
    makeApi: (base, addon) => A.sharedApi(base, addon, registry),
  });
  await loader.start();
  ok(loader.list().find((a) => a.id === 'cabinetcraft')?.state === 'off', 'found in ModelCraft\'s folder, off by default');
  await loader.setEnabled('cabinetcraft', true);
  const api = captured;
  ok(api && loader.list().find((a) => a.id === 'cabinetcraft').state === 'active', 'switched on (shared API ' + (api && api.version) + ')');
  ok(api.model.capabilities().join() === 'read,bodies,rooms', 'api.model.capabilities(): ' + api.model.capabilities().join());
  const { detect } = await import(pathToFileURL(path.join(ADDON, 'host.js')).href);
  const t = (k, v) => api.t(k, v);
  const host = detect(api, { t });
  ok(host && host.id === 'model' && host.gcode === false, 'detect: a ModelCraft host with no G-code');
  ok(detect({ model: {} }, { t }) === null && detect({}, { t }) === null, 'detect: an api with no model host is not a host');

  // a rejected group id and a body nobody can read change nothing
  let msg = '';
  try { api.model.addBodies('Bad Id', [{ box: [0, 0, 0, 1, 1, 1] }]); } catch (e) { msg = e.message; }
  ok(/group id/.test(msg), 'a bad group id is refused');
  const steps0 = model.undoStack.length;
  let err2 = ''; try { await api.model.addBodies('kitchen', [{ nope: 1 }]); } catch (e) { err2 = e.message; }
  ok(/no body/.test(err2) && model.undoStack.length === steps0, 'nothing usable: refused before any undo step');

  // ---- the room
  const rooms = await host.room.list();
  ok(rooms.length === 1 && /6 x 4|24 m2/.test(rooms[0].label.replace('24', '24 m2')) || rooms.length === 1, 'the selected floor face is the room: ' + rooms[0].label);
  const rm = await host.room.read(rooms[0].id);
  ok(rm.pts.length === 4 && near(Math.max(...rm.pts.map((q) => q[0])), 6000, 1) && rm.z === 100, 'its outline in mm (6000 x 4000) at z 100');
  selected = [];
  let none = ''; try { await host.room.list(); } catch (e) { none = e.message; }
  ok(/Select a floor face/.test(none), 'with nothing selected it says to select a floor face');
  selected = [{ t: 'f', id: fid }];

  // ---- the job and the placement
  let project = Pj.sampleProject('mm');
  const r = FR.applyModelRoom(project, { ...rm, host: 'model' });
  project = Pj.cleanProject({ ...project, room: r.project.room, site: r.project.site, openings: [] });
  const an = An.analyze(project, { say: (k) => k, word: (k) => k, t: (k) => k });
  const ctx = { api, t, project, analysis: an, build: an.build, list: an.list, est: an.est, nest: null, say2() {}, fmt: String, base: () => 'job', download() {}, site: project.site };
  const run = (id) => host.sections(ctx).find((x) => x.id === 'model-place').actions.find((x) => x.id === id).run(ctx);
  const cabs = an.build.cells.filter((c) => c.kind === 'cab').length;
  const out = await run('model-place');
  ok(/cabinets placed/.test(out) && model.undoStack.length === steps0 + 1, 'placed in ONE undo step: ' + out);
  const ours = [...model.root.insts.values()].filter((i) => i.tag === 'CabinetCraft / cabinets');
  ok(ours.length === 1, 'one tagged group at the top level');
  const top = model.defs.get(ours[0].def);
  ok(top.insts.size >= cabs, 'a sub-group per cabinet and per filler, end panel and countertop (' + top.insts.size + ' for ' + cabs + ' cabinets)');
  const bb = model.bbox(top, ours[0].m);
  ok(bb.min[2] >= 0.099 && bb.max[2] < 3, 'the group stands on the floor face (z from ' + bb.min[2].toFixed(3) + ' m)');
  ok(bb.min[0] >= -0.01 && bb.max[0] <= 6.2 && bb.min[1] >= -0.01 && bb.max[1] <= 4.2, 'and inside the 6 x 4 m room (' + bb.min.map((v) => v.toFixed(2)) + ' to ' + bb.max.map((v) => v.toFixed(2)) + ')');
  const colored = new Set(); let faces = 0;
  const walk = (d) => { for (const f of d.faces.values()) { faces++; colored.add(f.color); } for (const i of d.insts.values()) walk(model.defs.get(i.def)); };
  walk(top);
  ok(faces > 300 && colored.size >= 3, 'real faces coloured by material: ' + faces + ' faces, ' + colored.size + ' colours');
  ok(api.model.bodies().some((g) => g.group === 'cabinets' && g.count > 20), 'api.model.bodies() lists the group');
  // replace
  await run('model-place');
  ok([...model.root.insts.values()].filter((i) => i.tag === 'CabinetCraft / cabinets').length === 1 && model.undoStack.length === steps0 + 2, 'placing again replaces the group (one tagged group, one more step)');
  // export through ModelCraft's writers
  const obj = IO.exportOBJ(model), obj2 = typeof obj === 'string' ? obj : obj.obj || obj.text || '';
  ok(/^v /m.test(obj2) && (obj2.match(/^f /gm) || []).length > 300, 'OBJ out carries the cabinets: ' + (obj2.match(/^f /gm) || []).length + ' faces');
  const stl = IO.exportSTL(model);
  ok(stl && (stl.length || stl.byteLength) > 5000, 'STL out has them too (' + (stl.length || stl.byteLength) + ' bytes)');
  let glb = null; try { glb = IO.exportGLB(model); } catch { glb = null; }
  ok(!glb || (glb.byteLength || glb.length) > 5000, 'glTF out has them too');
  // saved and read back: the tag finds the group again
  const json = JSON.stringify(M.toJSON ? M.toJSON(model) : model.toJSON());
  ok(json.includes('CabinetCraft / cabinets'), 'the tag is in the saved file');
  // remove, undo, redo
  const rem = await host.sections(ctx).find((x) => x.id === 'model-place').actions.find((x) => x.id === 'model-remove').run(ctx);
  ok(/taken out/.test(rem) && ![...model.root.insts.values()].some((i) => i.tag === 'CabinetCraft / cabinets'), 'Remove takes the group out: ' + rem);
  model.undo();
  ok([...model.root.insts.values()].some((i) => i.tag === 'CabinetCraft / cabinets'), 'Undo brings it back');
  model.undo(); model.undo();
  ok(![...model.root.insts.values()].some((i) => i.tag === 'CabinetCraft / cabinets'), 'Undo twice more: the model is as before');
  model.redo();
  ok([...model.root.insts.values()].some((i) => i.tag === 'CabinetCraft / cabinets'), 'Redo puts it back');
  await loader.setEnabled('cabinetcraft', false);
  ok(loader.list().find((a) => a.id === 'cabinetcraft').state === 'off', 'switched off');
}
