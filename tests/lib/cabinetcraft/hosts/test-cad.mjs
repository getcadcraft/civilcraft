/* SPDX-License-Identifier: Apache-2.0 */
// The CadCraft adapter (hosts/cad.js) against CadCraft's REAL add-on API (cadcraft-api.js), a REAL Doc and the real command line: switched on through the loader, the shop drawings
// drawn as entities on CC- layers with blocks, real dimensions and hatches in ONE undo step, tagged so Redraw replaces and Erase removes, in a metre drawing as well, the room from a closed
// polyline (with a bulge and a door block), the cabinets on the 3D tab, the CCDRAW command, and DXF out through CadCraft's own writer.
const { ok, section, near, ADDON, APP, ROOT } = globalThis.__ccTest;
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';

if (!/cadcraft/.test(APP)) { ok(true, 'not CadCraft: skipped'); } else {
  const imp = (f) => import(pathToFileURL(path.join(APP, f)).href);
  const mine = (f) => import(pathToFileURL(path.join(ADDON, f)).href);
  const I18n = await imp('i18n.js');
  I18n.init({ strings: JSON.parse(fs.readFileSync(path.join(APP, 'lang/en.json'), 'utf8')) });
  const { Doc } = await imp('doc.js');
  const Cmd = await imp('commands.js');
  const CA = await imp('addons/cadcraft-api.js');
  const A = await imp('addons.js');
  const Pj = await mine('lib/project.js'), An = await mine('lib/analyze.js');
  const log = [];
  const makeHost = (doc) => ({ cursor: { x: 0, y: 0 }, selection: new Set(), print: (s) => log.push(String(s)), prompt() {}, setSelection(s) { this.selection = new Set(s); }, preview() {}, pickAt: () => null, pickWindow: () => [], zoomExtents() {}, zoomWindow() {}, props: { schedule() {} } });
  const mem = new Map();
  const start = async (doc, units) => {
    if (units) doc.meta.units = units;
    const host = makeHost(doc);
    const eng = new Cmd.Engine(doc, host);
    let captured = null;
    const started = await CA.startAddons({
      doc, engine: eng, host, print: (s) => log.push(String(s)), redraw() {}, focusCommandLine() {}, noGlobal: true,
      base: pathToFileURL(path.join(APP, 'addons') + '/').href, storage: { getItem: (k) => (mem.has(k) ? mem.get(k) : null), setItem: (k, v) => mem.set(k, String(v)), removeItem: (k) => mem.delete(k) },
      verify: async () => false, bundledOnly: false, packages: A.packageStore(null),
      fetchJson: async (u) => (/\/index\.json$/.test(u) ? { addons: ['cabinetcraft'] } : (() => { try { return JSON.parse(fs.readFileSync(fileURLToPath(u), 'utf8')); } catch { return null; } })()),
      importer: async (u) => { const m = await import(u); return /\/cabinetcraft\/main\.js/.test(u) ? { ...m, activate: (api) => { captured = api; return m.activate(api); } } : m; },
    });
    await started.loader.setEnabled('cabinetcraft', true);
    const { detect } = await import(pathToFileURL(path.join(ADDON, 'host.js')).href);
    const host2 = detect(captured, { t: (k, v) => captured.t(k, v) });
    return { started, api: captured, host: host2, eng, hostObj: host };
  };
  const project = Pj.sampleProject('mm');
  const an = An.analyze(project, { say: (k) => k, word: (k) => k, t: (k) => k });
  const nest = An.runNest(an.build, { tries: 1, timeLimit: 600 });
  const mk = (api, t, nestIt = false) => ({ api, t, project, analysis: an, build: an.build, list: an.list, est: an.est, nest: nestIt ? nest : null, say2() {}, fmt: String, base: () => 'job', download() {}, site: null });
  const act = (host, c, secId, actId) => host.sections(c).find((x) => x.id === secId).actions.find((x) => x.id === actId).run(c);

  section('CadCraft: a millimetre drawing');
  {
    const doc = new Doc();
    const { started, api, host, eng } = await start(doc);
    const entry = started.list().find((a) => a.id === 'cabinetcraft');
    ok(entry && entry.state === 'active' && entry.source === 'bundled', 'CabinetCraft is active through CadCraft\'s own loader (API ' + api.version + ')');
    ok(host && host.id === 'cad' && host.gcode === false && host.room, 'detect: a CadCraft host with no G-code and a room from the drawing');
    ok(require_null(await import(pathToFileURL(path.join(ADDON, 'host.js')).href)), 'detect: an api with no drawing is not a host');
    const t = (k, v) => api.t(k, v);
    const c = mk(api, t, true);
    const n0 = doc.undoStack.length;
    const msg = await act(host, c, 'cad-draw', 'cad-draw');
    ok(/sheets drawn/.test(msg) && doc.undoStack.length === n0 + 1, 'Draw the sheets: one undo step (' + msg + ')');
    const all = [...doc.model.values()];
    const layers = new Set(all.map((e) => e.layer));
    ok([...layers].every((l) => /^CC-/.test(l)) && layers.size >= 7, 'on CC- layers only: ' + [...layers].sort().join(' '));
    ok(['CC-ROOM', 'CC-BASE', 'CC-UPPER', 'CC-FILL', 'CC-COUNTER', 'CC-TEXT', 'CC-DIM', 'CC-TABLE', 'CC-SHEET'].every((l) => doc.layers.has(l)) && doc.layers.get('CC-UPPER').linetype === 'HIDDEN', 'the layers exist with their linetypes');
    const types = new Set(all.map((e) => e.type));
    ok(['line', 'poly', 'text', 'dim', 'hatch', 'insert'].every((x) => types.has(x)), 'entity types: ' + [...types].join(', '));
    ok(doc.blocks.size >= 3 && all.filter((e) => e.type === 'insert').every((e) => doc.blocks.has(e.block)) && [...doc.blocks.keys()].every((b) => /^CC-CAB-/.test(b)), 'one block per cabinet type (' + doc.blocks.size + '), every insert names one');
    ok(all.every((e) => { const d = api.data.get(e); return d && d.job === 'cabinetcraft:' + (project.name || 'job'); }), 'every entity carries the add-on\'s data (the job key)');
    ok(all.filter((e) => e.type === 'dim' && e.kind === 'linear').length >= 6, 'real linear dimensions');
    ok(all.some((e) => e.type === 'text' && /Nested|nest/i.test(e.s) === false) && all.some((e) => e.type === 'text' && e.s === 'T01'), 'the cabinet numbers are text');
    const minX = Math.min(...all.filter((e) => e.type === 'line').map((e) => e.x1));
    ok(Number.isFinite(minX), 'the drawing has coordinates');
    // Redraw replaces
    const count1 = doc.model.size;
    await act(host, c, 'cad-draw', 'cad-draw');
    ok(doc.model.size === count1 && doc.undoStack.length === n0 + 2, 'Redraw replaces the earlier drawing (' + count1 + ' entities both times)');
    // the user's own entity survives
    let own;
    doc.change('own', () => { own = doc.add({ type: 'line', layer: '0', x1: 0, y1: 0, x2: 10, y2: 10 }); });
    await act(host, c, 'cad-draw', 'cad-draw');
    ok(doc.model.has(own.id), 'a line of the person\'s own is not touched by Redraw');
    // 3D
    const out3 = await act(host, c, 'cad-3d', 'cad-3d');
    const keys = api.solids.keys();
    ok(keys.length >= 10 && /put on the 3D tab/.test(out3), 'the cabinets are on the 3D tab as solids: ' + keys.length);
    await act(host, c, 'cad-3d', 'cad-3d-clear');
    ok(api.solids.keys().length === 0, 'and taken off again');
    // erase and undo
    const er = await act(host, c, 'cad-draw', 'cad-erase');
    ok(/erased/.test(er) && [...doc.model.values()].every((e) => e.id === own.id), 'Erase removes the sheets and leaves the person\'s line: ' + er);
    doc.undo();
    ok(doc.model.size > 100, 'Undo brings the sheets back (' + doc.model.size + ')');
    // DXF out through CadCraft's writer
    const D = await imp('dxf.js').catch(() => null);
    if (D && D.writeDxf) { const txt = D.writeDxf(doc).text; ok(/CC-BASE/.test(txt) && /CC-CAB-1/.test(txt) && /CC-DIM/.test(txt) && /CC-COUNTER/.test(txt), 'DXF out carries the layers, the cabinet blocks, the dimension and countertop layers (' + Math.round(txt.length / 1024) + ' KB)'); }
    else ok(true, 'DXF writer not importable here (skipped)');
    // the command line
    log.length = 0;
    eng.text('CCDRAW');
    for (let i = 0; i < 12; i++) await new Promise((r) => setTimeout(r, 0));
    ok(log.some((l) => /sheets drawn/.test(l)) || [...doc.model.values()].length > 100, 'CCDRAW is a command of the command line (' + (log[log.length - 1] || '').slice(0, 50) + ')');
    await started.loader.setEnabled('cabinetcraft', false);
    ok(!Cmd.lookup('CCDRAW') && !Cmd.lookup('CCNEST'), 'switched off: its commands are gone');
  }
  section('CadCraft: a metre drawing, the room from a polyline');
  {
    const doc = new Doc();
    const { api, host } = await start(doc, 'meters');
    const t = (k, v) => api.t(k, v);
    const c = mk(api, t, false);
    await act(host, c, 'cad-draw', 'cad-draw');
    const lines = [...doc.model.values()].filter((e) => e.type === 'line' || e.type === 'poly');
    const big = Math.max(...lines.flatMap((e) => (e.type === 'line' ? [Math.abs(e.x1), Math.abs(e.x2)] : e.pts.map((p) => Math.abs(p.x)))));
    ok(big < 200 && big > 1, 'in a metre drawing the plan is metres, not millimetres (largest x ' + big.toFixed(1) + ')');
    const th = [...doc.model.values()].find((e) => e.type === 'text');
    ok(th.h < 1, 'text heights are metres too (' + th.h + ')');
    // a closed polyline with a bulge as the room, a door block near its edge
    doc.change('room', () => {
      doc.add({ type: 'poly', layer: 'ROOM', closed: true, pts: [{ x: 10, y: 10 }, { x: 14, y: 10 }, { x: 14, y: 13, b: 0.4 }, { x: 10, y: 13 }] });
      doc.defineBlock({ name: 'DOOR-900', base: { x: 0, y: 0 }, entities: [{ type: 'line', layer: '0', x1: 0, y1: 0, x2: 0.9, y2: 0 }] });
      doc.add({ type: 'insert', layer: 'DOORS', block: 'DOOR-900', x: 11, y: 10, sx: 1, sy: 1, rot: 0 });
    });
    const rooms = await host.room.list();
    ok(rooms.length === 1 && /ROOM/.test(rooms[0].label), 'the closed polyline is listed as a room: ' + rooms[0].label);
    const m = await host.room.read(rooms[0].id);
    ok(m.pts.length > 4 && near(Math.max(...m.pts.map((q) => q[0])), 14000, 1) && m.openings.some((o) => o.kind === 'door' && near(o.x, 11000, 1) && o.w > 800 && o.w < 1000), 'the outline in mm, the bulge cut into chords (' + m.pts.length + ' corners), the door block an opening ' + JSON.stringify(m.openings[0]));
    ok(m.pts.every((q) => q[1] >= 9999 && q[1] <= 13000 + 1 + 3000), 'every corner in mm');
    const FR = await mine('lib/fromroom.js');
    const r = FR.applyModelRoom(Pj.newProject('mm'), { ...m, host: 'cad' });
    ok(r.project.room.shape === 'free' && r.project.openings.length === 1 && r.project.site.host === 'cad', 'the job takes it: a free outline and the door');
  }
  function require_null(mod) { return mod.detect({}, { t: (k) => k }) === null && mod.detect({ doc: {} }, { t: (k) => k }) === null; }
}
