// SPDX-License-Identifier: Apache-2.0
// Super 0.1, SC.5 "one selection" in a real browser, with the REAL panels of all eight apps (session sc-r5-select-10).
//   A. a project with a file for each app opens; every app has its pick adapter (by app name: seven apps share the page);
//   B. each app's own pick (a real click where the page offers one, else the app's own select call) reaches the one selection, Properties and the status line;
//   C. the row's first sentence: a wall clicked in BimCraft's PLAN is picked in 3D and in the takeoff; a takeoff row clicked shows its elements in plan and 3D;
//   D. one cross-app pick per app in each direction over the project's links (drawing, markup, takeoff mark, site, steel, part, 3D model);
//   E. clear, multi-pick, an echo is not a new pick, an empty panel does not take a pick away, the page's ccPickApply goes to the app a ref names.
// Nothing is posted anywhere: the page talks to the harness only.
//   node tools/super-test/picks.mjs
import fs from 'node:fs'; import path from 'node:path';
import { start, launch, OUT, ROOT } from './serve.mjs';
const { url, close } = await start({ langs: [''] }); const browser = await launch({ width: 1600, height: 1000 });
let pass = 0, fail = 0; const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL', m); } };
const ctx = await browser.newContext({ viewport: { width: 1600, height: 1000 } }); const page = await ctx.newPage(); const errors = [];
page.on('pageerror', e => { if (!/fetching the script/.test(String(e.message))) errors.push(String(e.message) + ' @ ' + String(e.stack || '').split('\n').slice(1, 4).join(' < ').slice(0, 400)); });
await page.goto(url); await page.waitForSelector('[data-sc-ready]'); await page.evaluate(() => window.superWindow.ready); await page.waitForTimeout(600);
await page.evaluate(() => window.superWindow.home.leave()); await page.waitForTimeout(200);

/* ---------------- A. a project with a file for each of the eight apps */
const b64 = f => fs.readFileSync(path.join(ROOT, f)).toString('base64');
const members = [
  { app: 'cadcraft', name: 'house.dwg', b64: b64('fixtures/showcase/cadcraft-sample-house.dwg') },   // a DWG: the registry lists it from the open app, in the spelling the pick carries
  { app: 'bimcraft', name: 'small-house.ifc', b64: b64('fixtures/bimcraft/small-house.ifc') },
  { app: 'modelcraft', name: 'house.modelcraft', b64: b64('fixtures/showcase/modelcraft-house.modelcraft') },
  { app: 'markupcraft', name: 'markups.pdf', b64: b64('fixtures/showcase/markupcraft-markups-that-act.pdf') },
  { app: 'takeoffcraft', name: 'kitchen.pdf', b64: b64('fixtures/showcase/kitchen-plan-sheet.pdf') },
  { app: 'civilcraft', name: 'site.civilcraft.json', b64: b64('fixtures/showcase/civilcraft-subdivision.civilcraft.json') },
  { app: 'detailcraft', name: 'frame.detailcraft.json', b64: b64('fixtures/showcase/detailcraft-erection.detailcraft.json') },
  { app: 'partcraft', name: 'bracket.partcraft.json', b64: b64('fixtures/showcase/partcraft-enclosure.partcraft.json') },
];
await page.evaluate(async ([ms, n]) => {
  const P = window.superWindow.P, p = P.newProject(n); const un = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));
  for (const m of ms) P.addMember(p, { app: m.app, name: m.name, bytes: un(m.b64) });
  return window.superWindow.openProject(new File([P.zipStore(P.projectFiles(p, {}).files.map(f => ({ path: n + '/' + f.path, bytes: f.bytes })))], n + '.ccproject'));
}, [members, 'Picks']);
const PANELS = { cad: 'cadcraft', bim: 'bimcraft', model: 'modelcraft', markup: 'markupcraft', takeoff: 'takeoffcraft', civil: 'civilcraft', detail: 'detailcraft', part: 'partcraft' };
const show = async id => { await page.evaluate(i => { const sw = window.superWindow; sw.M.showPanel(sw.state, i); sw.render(); }, id); await page.waitForTimeout(250); };
for (const id of Object.keys(PANELS)) {
  await show(id);
  await page.waitForFunction(i => { const d = document.querySelector(`[data-panel="${i}"][data-mount]`)?.dataset.mount; return d === 'ready' || d === 'failed'; }, id, { timeout: 90000 }).catch(() => {});
}
/** Run fn(appGlobal, window) in the window an app lives in (the page, or its own frame). */
const inApp = (app, fn, arg) => page.evaluate(([a, src, x]) => {
  const w = [window, ...[...document.querySelectorAll('iframe')].map(f => { try { return f.contentWindow; } catch { return null; } })].find(v => v && v[a]);
  if (!w) return { noapp: a };
  return new w.Function('app', 'win', 'arg', 'return (' + src + ')(app, win, arg)')(w[a], w, x);
}, [app, String(fn), arg]);
const settle = async (ms = 350) => { await page.evaluate(() => window.superWindow.selWire.settled()); await page.waitForTimeout(ms); await page.evaluate(() => window.superWindow.selWire.settled()); };
const hub = () => page.evaluate(() => { const h = window.superWindow.hub; return { ...h.get(), related: h.related(), shown: h.shown() }; });
const statusText = () => page.$eval('.sc-status', n => n.textContent);
const propsText = () => page.evaluate(() => { const n = document.querySelector('.sc-props'); return n ? n.textContent : null; });
// each app has read its file
await page.waitForFunction(() => { try { return window.cadcraft.doc.all().length > 20 && window.bimcraftColor.index() && window.civilcraft.project.state.alignments.length === 1 && window.detailcraft.model.state.members.length > 3 && window.markupcraft.store && window.partcraft.part.features.length > 0 && window.takeoffcraft.sheets().length === 1; } catch { return false; } }, null, { timeout: 120000 }).catch(() => {});
await page.waitForFunction(() => { try { return window.takeoffcraft.model.state.items.some(i => i.origin && i.origin.key === 'ifc:ifcwall:count'); } catch { return false; } }, null, { timeout: 90000 }).catch(() => {});
const mcReady = await page.waitForFunction(() => { const f = document.querySelector('iframe[data-sc-frame="model"]'); try { const mc = f.contentWindow.modelcraft; return mc.model.context(mc.host.path).def.insts.size > 0; } catch { return false; } }, null, { timeout: 90000 }).then(() => true, () => false);
const mounted = await page.evaluate(ids => ids.map(i => ({ app: i, state: i === 'model' ? (document.querySelector('iframe[data-sc-frame="model"]')?.contentWindow?.modelcraft ? 'ready' : 'closed') : document.querySelector(`[data-panel="${i}"][data-mount]`)?.dataset.mount || 'closed' })), Object.keys(PANELS));
ok(mounted.length === 8 && mounted.every(m => m.state === 'ready'), 'all eight apps are mounted and ready: ' + JSON.stringify(mounted.map(m => m.app + ':' + m.state)));
ok(mcReady, 'the 3D model view has its model (in its own frame)');
const adapters = await page.evaluate(() => { const sw = window.superWindow.selWire; return Object.fromEntries(['cadcraft', 'modelcraft', 'markupcraft', 'takeoffcraft', 'civilcraft', 'detailcraft', 'partcraft'].map(a => { const x = sw.adapter(a); return [a, x ? (typeof x.apply === 'function') + '/' + (typeof x.clear === 'function') : null]; })); });
ok(Object.values(adapters).every(v => v === 'true/true'), 'every app has its own pick adapter (show a pick, take it away), found by app name: ' + JSON.stringify(adapters));
ok(await page.evaluate(() => !!window.bimcraftVis && typeof window.bimcraftVis.pick === 'function'), 'and the building view its pick hook');
const proj = await page.evaluate(() => { const p = window.superWindow.project; return { ids: Object.fromEntries(p.members.map(m => [m.app, m.id])), links: p.links.map(l => l.kind) }; });
ok(proj.links.includes('quantities'), 'the project has the takeoff link of the model: ' + JSON.stringify(proj.links));
await show('props');
await page.evaluate(() => window.superRegistry.index());   // "Check for changes": the registry reads the open apps and the files

/* ---------------- B. each app's own pick reaches the one selection, Properties and the status line */
const VIEW = {};   // app → the name the window uses for its view
const picked = async (app, n, what) => {
  await settle();
  const h = await hub(), st = await statusText(), pr = await propsText();
  ok(h.source === app && h.refs.length === n && h.refs.every(r => r.app === app), `${what}: the one selection holds it (${n} from ${app}): ` + JSON.stringify([h.source, h.refs.slice(0, 2)]));
  ok(new RegExp('^' + n + ' picked in ').test((/Selection:?\s*(.*)$/.exec(st) || [])[1] || st.slice(st.indexOf(n + ' picked'))), `${what}: the status line says ${n} picked: ` + st.slice(0, 160));
  ok(pr !== null && /Picked in .*: /.test(pr) && pr.includes(': ' + n), `${what}: Properties says what is picked: ` + String(pr).slice(0, 120));
  return h;
};
// CadCraft: its own selection call, an entity of the drawing
const cad = await inApp('cadcraft', c => { const es = c.doc.all().filter(e => e.type === 'line'); const hx = e => (typeof e.handle === 'string' && /^[0-9A-Fa-f]{1,16}$/.test(e.handle) ? e.handle.toUpperCase() : e.id.toString(16).toUpperCase()); return es.slice(0, 3).map(e => ({ id: e.id, hex: hx(e) })); });
await inApp('cadcraft', (c, w, id) => { c.host.setSelection(new Set([id])); }, cad[0].id);
const hCad = await picked('cadcraft', 1, 'a line picked in the 2D drawing');
const cadNative = `${proj.ids.cadcraft}:${cad[0].hex}`;
ok(hCad.refs[0].aka && hCad.refs[0].aka.includes(cadNative), 'the drawing pick also carries the id the object registry knows it by: ' + JSON.stringify(hCad.refs[0]));
// MarkupCraft: a real click on a markup on the open sheet (its edge, as a person would)
const mk = await inApp('markupcraft', m => { const cur = m.sheets[m.cur], key = cur && cur.page && cur.page.key; const all = [...(m.store.all ? m.store.all() : m.store.list ? m.store.list() : [])]; const here = all.filter(x => x.sheet === key && m.boundsOfId(x.id)); return { key, ids: here.map(x => x.id), types: here.map(x => x.type), b: here.map(x => m.boundsOfId(x.id)) }; });
ok(mk.ids && mk.ids.length >= 2, 'the markup view has markups on its open sheet: ' + JSON.stringify(mk).slice(0, 300));
await show('markup');
const mkClick = async i => {
  const at = await inApp('markupcraft', (m, w, b) => { const bb = Array.isArray(b) ? b : [b.x0 ?? b.minX ?? b.x, b.y0 ?? b.minY ?? b.y, b.x1 ?? b.maxX ?? (b.x + b.w), b.y1 ?? b.maxY ?? (b.y + b.h)]; const s = m.view.toScreen([bb[0], (bb[1] + bb[3]) / 2]); const cv = m.stage.querySelector('canvas') || m.stage, r = cv.getBoundingClientRect(); const q = Array.isArray(s) ? s : [s.x, s.y]; return [r.left + q[0] + 1, r.top + q[1]]; }, mk.b[i]);
  await inApp('markupcraft', m => m.setTool('select'));
  await page.mouse.move(at[0], at[1], { steps: 2 }); await page.mouse.click(at[0], at[1]);
};
await mkClick(0);
let mkSel = await inApp('markupcraft', m => [...m.sel]);
if (mkSel.length !== 1) { await inApp('markupcraft', (m, w, id) => m.control && m.shellMount ? null : null); }
ok(mkSel.length === 1, 'a click on a markup selects it in the markup view: ' + JSON.stringify(mkSel));
const mkId = mkSel[0] || mk.ids[0];
await picked('markupcraft', 1, 'a markup clicked on the sheet');
// TakeoffCraft: a real click on a quantity row
await show('takeoff');
const tk = await inApp('takeoffcraft', t => ({ items: t.model.state.items.map(i => ({ id: i.id, name: i.name, key: i.origin && i.origin.key })), sheet: t.sheet() }));
const tkWall = tk.items.find(i => i.key === 'ifc:ifcwall:count'), tkDoor = tk.items.find(i => i.key === 'ifc:ifcdoor:count');
await page.click(`[data-panel="takeoff"] .tc-item[data-item="${tkDoor.id}"]`);
const hTk = await picked('takeoffcraft', 1, 'a quantity row clicked in the takeoff');
ok(hTk.refs[0].id === tkDoor.id && hTk.refs[0].key === 'ifc:ifcdoor:count', 'the row is named by its own id and carries the model\'s key: ' + JSON.stringify(hTk.refs[0]));
// TakeoffCraft: a mark drawn with the app's own model call, then really clicked on the sheet
const mark = await inApp('takeoffcraft', t => { const st = t.model.state; let it = st.items.find(i => i.type === 'count' && !i.origin); if (!it) it = t.model.item(t.model.addItem({ name: 'Outlets', type: 'count', unit: 'EA' })); const a = t.model.addMark({ item: it.id, sheet: t.sheet(), pts: [[200, 200]] }), b = t.model.addMark({ item: it.id, sheet: t.sheet(), pts: [[260, 200]] }); return { item: it.id, a, b, pa: t.toScreen({ x: 200, y: 200 }), pb: t.toScreen({ x: 260, y: 200 }) }; });
await page.waitForTimeout(300);
await page.mouse.click(mark.pa.x, mark.pa.y);
const hMark = await picked('takeoffcraft', 1, 'a takeoff mark clicked on the sheet');
ok(hMark.refs[0].id === 'mark:' + mark.a, 'a mark is named as the object registry names it: ' + JSON.stringify(hMark.refs[0]));
// CivilCraft: its own select (an alignment), then survey points
const cv = await inApp('civilcraft', c => ({ al: c.project.state.alignments[0].id, pad: c.project.state.pads[0].id, parcel: c.project.state.parcels[0].id, pts: c.project.points.slice(0, 3).map(p => p.n) }));
await inApp('civilcraft', (c, w, id) => c.select({ kind: 'alignment', id }), cv.al);
const hCv = await picked('civilcraft', 1, 'an alignment picked in the site view');
ok(hCv.refs[0].id === 'alignment:' + cv.al, 'named as the object registry names it: ' + hCv.refs[0].id);
ok(await page.evaluate(id => { const R = window.superRegistry.REG, o = R.byNative(window.superWindow.project, 'civilcraft', id); return !!o; }, hCv.refs[0].id), 'and the registry has that very id');
await inApp('civilcraft', (c, w, ns) => c.pick(ns), cv.pts);
await picked('civilcraft', 3, 'three survey points picked in the site view');
// DetailCraft: its own selection call (a member)
const dc = await inApp('detailcraft', d => ({ members: d.model.state.members.slice(0, 4).map(m => m.id), conn: (d.model.state.connections[0] || {}).id }));
await inApp('detailcraft', (d, w, id) => d.setSelection([{ kind: 'member', id }]), dc.members[0]);
const hDc = await picked('detailcraft', 1, 'a steel member picked in the steel view');
ok(hDc.refs[0].id === String(dc.members[0]) && /^[0-9A-Za-z_$]{22}$/.test(hDc.refs[0].guid || ''), 'the member carries the GlobalId its IFC export gives it: ' + JSON.stringify(hDc.refs[0]));
ok(await page.evaluate(id => !!window.superRegistry.REG.byNative(window.superWindow.project, 'detailcraft', id), hDc.refs[0].id), 'and the registry has the member under that id');
// PartCraft: a real click on a feature in the history tree
await show('part');
const pc = await inApp('partcraft', p => p.part.features.map(f => f.id));
await page.click(`[data-panel="part"] .pc-node[data-id="${pc[0]}"]`);
const hPc = await picked('partcraft', 1, 'a feature clicked in the part history');
ok(hPc.refs[0].id === String(pc[0]), 'the feature by its id: ' + hPc.refs[0].id);
// ModelCraft (in its own frame): its own selection call
const mc = await inApp('modelcraft', m => [...m.model.context(m.host.path).def.insts.keys()].slice(0, 3));
await inApp('modelcraft', (m, w, id) => m.host.setSel([{ t: 'i', id }]), mc[0]);
await picked('modelcraft', 1, 'an object picked in the 3D model view (a frame of its own)');

/* ---------------- C. the row's first sentence: a wall picked in the PLAN is picked in 3D and in the takeoff */
await show('bim');
await page.click('[data-panel="bim"] [data-model-toggle]').catch(() => {});
await page.waitForFunction(() => window.bimcraftPlan && window.bimcraftPlan.state.on && window.bimcraftPlan.view.scene && (window.bimcraftPlan.view.scene.walls || []).length >= 4, null, { timeout: 60000 }).catch(() => {});
await page.waitForTimeout(800);
const plan = await page.evaluate(() => { const pl = window.bimcraftPlan; if (!pl) return null; const ws = pl.view.scene.walls.map(w => ({ key: w.key, poly: w.poly })); return { on: pl.state.on, tool: pl.state.tool, walls: ws.length, w0: ws[0] }; });
ok(plan && plan.on && plan.walls >= 4, 'the building view shows its plan with the walls: ' + JSON.stringify(plan && [plan.on, plan.tool, plan.walls]));
/** The screen point of the middle of a wall of the plan (the centre of its outline). */
const wallScan = i => page.evaluate(k => {
  const pv = window.bimcraftPlan.view, w = pv.scene.walls[k]; pv.canvas.scrollIntoView({ block: 'center' });
  const flat = Array.isArray(w.poly[0]) ? w.poly : w.poly.reduce((a, v, j) => (j % 2 ? a[a.length - 1].push(v) : a.push([v]), a), []);
  const c = flat.reduce((a, q) => [a[0] + q[0] / flat.length, a[1] + q[1] / flat.length], [0, 0]), r = pv.canvas.getBoundingClientRect();
  const inside = (x, y) => x > r.left + 8 && x < r.right - 8 && y > r.top + 8 && y < r.bottom - 8;
  // the first place on the wall where a click picks the wall itself (a door, a window or a dimension line may lie over parts of it)
  const xs = flat.map(q => q[0]), ys = flat.map(q => q[1]), x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
  for (let a = 1; a < 80; a++) for (const b of [0.5, 0.3, 0.7, 0.15, 0.85]) {
    const p = (x1 - x0) >= (y1 - y0) ? [x0 + (x1 - x0) * a / 80, y0 + (y1 - y0) * b] : [x0 + (x1 - x0) * b, y0 + (y1 - y0) * a / 80], s = pv.toScreen(p), x = r.left + s.x, y = r.top + s.y;
    if (inside(x, y) && pv.hit(x, y) === w.key) return { key: w.key, x, y, hit: w.key };
  }
  const s = pv.toScreen([x0 + (x1 - x0) * 0.2, y0 + (y1 - y0) * 0.5]); return { key: w.key, x: r.left + s.x, y: r.top + s.y, hit: null };
}, i);
/** Where to click wall i of the plan. Zoomed out, a wall is a few pixels thick and its dimension line takes the click: the wheel zooms in on it, as a person would. */
const wallAt = async i => {
  await page.waitForTimeout(500);
  let at = await wallScan(i);
  for (let n = 0; n < 5 && at.hit !== at.key; n++) { await page.mouse.move(at.x, at.y); await page.mouse.wheel(0, -300); await page.waitForTimeout(350); at = await wallScan(i); }
  return at;
};
const w0 = await wallAt(0);
ok(w0.hit === w0.key, 'a point on the first wall is where a click picks it: ' + JSON.stringify(w0));
await page.mouse.move(w0.x, w0.y, { steps: 3 }); await page.mouse.click(w0.x, w0.y);
const hWall = await picked('bimcraft', 1, 'a wall clicked in the PLAN of the building view');
ok(hWall.refs[0].cls === 'IfcWall' && /^[0-9A-Za-z_$]{22}$/.test(hWall.refs[0].guid || '') && hWall.refs[0].id === String(w0.key), 'the pick is the wall, with its class and GlobalId: ' + JSON.stringify(hWall.refs[0]));
const bimNow = () => page.evaluate(() => ({ v3d: window.superWindow.selWire.bimPick(), plan: [...window.bimcraftPlan.view.selection].map(String) }));
let bn = await bimNow();
ok(bn.v3d.length === 1 && bn.v3d[0] === String(w0.key) && bn.plan.includes(String(w0.key)), 'picked in the plan it is picked in 3D too (one selection inside the app): ' + JSON.stringify(bn));
const tkHl = () => page.evaluate(() => { const b = document.querySelector('[data-panel="takeoff"] .tc-item.is-hl'); return b ? b.dataset.item : null; });
ok(hWall.related.some(r => r.app === 'takeoffcraft' && r.id === 'ifc:ifcwall:count'), 'the wall relates to the wall rows of the takeoff: ' + JSON.stringify(hWall.related.map(r => r.id)));
const hlWall = await tkHl(), wallRows = tk.items.filter(i => /^ifc:ifcwall:/.test(i.key || '')).map(i => i.id);
ok(wallRows.includes(hlWall), 'and the takeoff shows a wall row picked (highlighted): ' + hlWall + ' of ' + JSON.stringify(wallRows));
ok((await hub()).source === 'bimcraft' && (await hub()).shown.includes('takeoffcraft'), 'showing it in the takeoff is not a new pick: the pick is still the wall\'s');
const prWall = await propsText();
ok(/Also in the other views/.test(prWall) && /Wall: count/.test(prWall), 'Properties lists the takeoff rows the wall stands for, by name: ' + String(prWall).slice(0, 200));
await page.screenshot({ path: `${OUT}/picks-plan-wall.png` });
// the other way round: a takeoff row clicked shows every door in the plan and in 3D
await show('takeoff');
await page.click(`[data-panel="takeoff"] .tc-item[data-item="${tkDoor.id}"]`);
await settle(500);
const doorKeys = await page.evaluate(() => { const t = window.bimcraftTree().tree; return [...t.byKey].filter(([k, n]) => n.geo && String(n.cls).toLowerCase() === 'ifcdoor').map(([k]) => String(k)); });
bn = await bimNow();
ok(doorKeys.length === 2 && bn.v3d.length === 2 && doorKeys.every(k => bn.v3d.includes(k)), 'a door row clicked in the takeoff picks both doors in 3D: ' + JSON.stringify([doorKeys, bn.v3d]));
ok(doorKeys.every(k => bn.plan.includes(k)), 'and in the plan: ' + JSON.stringify(bn.plan));
ok((await hub()).source === 'takeoffcraft', 'the pick is still the takeoff row\'s (the model reporting the doors back is an echo)');
// clear in the takeoff (the row clicked again): the doors are let go in plan and 3D
await page.click(`[data-panel="takeoff"] .tc-item[data-item="${tkDoor.id}"]`);
await settle(500);
bn = await bimNow();
ok((await hub()).refs.length === 0 && bn.v3d.length === 0 && bn.plan.length === 0, 'the row let go in the takeoff: nothing is picked anywhere, plan and 3D included: ' + JSON.stringify([(await hub()).refs.length, bn]));
ok(/Nothing|nothing|–|—/.test((await statusText())) || !/picked in/.test(await statusText()), 'and the status line no longer says picked: ' + (await statusText()).slice(0, 120));

/* ---------------- D. one cross-app pick per app, both directions, over the project's links */
const wallGuid = hWall.refs[0].guid, wallKey = String(w0.key);
await show('bim'); const w1 = await wallAt(1);
const wall2 = await page.evaluate(k => { const ix = window.bimcraftColor.index(); for (const [id, g] of ix.values('guid')) if (ix.keyBase + id === k) return g; return null; }, w1.key);
const link = (role, from, to) => page.evaluate(([role, from, to]) => { const sw = window.superWindow; return sw.P.addLink(sw.project, { kind: 'object', role, from, to }).id; }, [role, from, to]);
await link('depicts', { app: 'cadcraft', id: cadNative }, { app: 'bimcraft', id: wallGuid });               // a drawing line depicts the wall (the registry's spelling of the line)
await link('marks', { app: 'markupcraft', id: mkId }, { app: 'bimcraft', id: wallGuid });                 // a markup marks the wall
await link('measures', { app: 'takeoffcraft', id: 'mark:' + mark.a }, { app: 'cadcraft', id: cadNative });   // a takeoff mark measures the drawing line
await link('hosts', { app: 'civilcraft', id: 'pad:' + cv.pad }, { app: 'bimcraft', id: wall2 });           // the pad hosts the second wall
await link('same', { app: 'detailcraft', id: String(dc.members[0]) }, { app: 'bimcraft', id: wall2 });     // a steel member is the same thing as an element of the model
await link('defines', { app: 'partcraft', id: String(pc[0]) }, { app: 'modelcraft', id: String(mc[0]) }); // a part feature defines an object of the 3D model
const sel = { cad: () => inApp('cadcraft', c => [...c.host.selection].map(String)), mk: () => inApp('markupcraft', m => [...m.sel]), tkm: () => inApp('takeoffcraft', t => t.selection()),
  cv: () => inApp('civilcraft', c => (c.sel ? c.sel.kind + ':' + c.sel.id : c.picked.length ? 'points:' + c.picked.length : null)), dc: () => inApp('detailcraft', d => d.selected.map(r => r.kind + ':' + r.id)),
  pc: () => inApp('partcraft', p => (p.sel && p.sel.kind === 'feature' ? String(p.sel.id) : null)), mc: () => inApp('modelcraft', m => m.host.sel.map(x => String(x.id))) };
await inApp('detailcraft', d => d.setSelection([])); await inApp('civilcraft', c => c.select(null)); await settle();   // the views' own picks of part B are let go first
// 1. BimCraft → CadCraft, MarkupCraft (and on through nothing else): the wall clicked in the plan
await show('bim'); { const q = await wallAt(0); await page.mouse.click(q.x, q.y); } await settle(600);
ok((await sel.cad()).join() === String(cad[0].id), 'wall picked in the plan → its line is selected in the 2D drawing: ' + JSON.stringify(await sel.cad()));
ok((await sel.mk()).join() === mkId, 'wall picked in the plan → its markup is selected in the markup view: ' + JSON.stringify(await sel.mk()));
let h = await hub();
ok(h.source === 'bimcraft' && ['cadcraft', 'markupcraft', 'takeoffcraft'].every(a => h.shown.includes(a)), 'the pick stays the wall\'s; three other views show it: ' + JSON.stringify([h.source, h.shown]));
const prRoles = await page.$$eval('.sc-props .sc-related li', n => n.map(x => x.dataset.related + ':' + x.dataset.sclinkRole));
ok(prRoles.includes('cadcraft:depicts') && prRoles.includes('markupcraft:marks') && prRoles.some(x => x === 'takeoffcraft:measures'), 'Properties lists each related thing with what the link means: ' + JSON.stringify(prRoles));
const prNames = await propsText();
ok(/LINE/.test(prNames), 'and names the drawing line by the registry\'s label, not by a bare id: ' + String(prNames).slice(0, 260));
await page.screenshot({ path: `${OUT}/picks-wall-everywhere.png` });
// 2. CadCraft → BimCraft (plan and 3D), TakeoffCraft mark: the line selected in the drawing
await page.evaluate(() => window.bimcraftVis.pick([])); await settle();   // let go in the model first
ok((await sel.cad()).length === 0 && (await sel.mk()).length === 0, 'the wall let go in the model: the drawing and the markup view let go of what they showed: ' + JSON.stringify([await sel.cad(), await sel.mk()]));
await inApp('cadcraft', (c, w, id) => c.host.setSelection(new Set([id])), cad[0].id); await settle(600);
bn = await bimNow();
ok(bn.v3d.join() === wallKey && bn.plan.includes(wallKey), 'line picked in the drawing → the wall is picked in 3D and in the plan: ' + JSON.stringify(bn));
ok((await sel.tkm()).join() === mark.a, 'line picked in the drawing → the takeoff mark that measures it is selected: ' + JSON.stringify(await sel.tkm()));
ok((await hub()).source === 'cadcraft', 'the pick is the drawing\'s');
// 3. TakeoffCraft mark → CadCraft: the mark clicked on the sheet
await inApp('cadcraft', c => c.host.setSelection(new Set())); await settle();
ok((await sel.tkm()).length === 0 && (await bimNow()).v3d.length === 0, 'the line let go: the mark and the wall are let go');
await show('takeoff'); const pa = await inApp('takeoffcraft', t => t.toScreen({ x: 200, y: 200 }));
await page.mouse.click(pa.x, pa.y); await settle(600);
ok((await sel.cad()).join() === String(cad[0].id), 'mark clicked in the takeoff → the line it measures is selected in the drawing: ' + JSON.stringify(await sel.cad()));
// 4. MarkupCraft → BimCraft: the markup clicked
await show('markup'); await mkClick(0); await settle(600);
bn = await bimNow();
ok((await hub()).source === 'markupcraft' && bn.v3d.join() === wallKey && bn.plan.includes(wallKey), 'markup clicked → the wall it marks is picked in 3D and plan: ' + JSON.stringify(bn));
ok((await sel.cad()).length === 0, 'and the drawing let go of the line the earlier pick showed there: ' + JSON.stringify(await sel.cad()));
// 5. CivilCraft ↔ BimCraft: the pad hosts the second wall
await inApp('civilcraft', (c, w, id) => c.select({ kind: 'pad', id }), cv.pad); await settle(600);
bn = await bimNow();
ok((await hub()).source === 'civilcraft' && bn.v3d.join() === String(w1.key) && bn.plan.includes(String(w1.key)), 'pad picked in the site view → the wall it hosts is picked in the model: ' + JSON.stringify(bn));
ok((await sel.dc()).length === 0, 'a pick does not travel on over a second link (the steel member linked to that wall stays unpicked)');
await inApp('civilcraft', c => c.select(null)); await settle();
await show('bim'); const w1b = await wallAt(1); await page.mouse.click(w1b.x, w1b.y); await settle(600);
ok((await sel.cv()) === 'pad:' + cv.pad, 'second wall clicked in the plan → the pad is selected in the site view: ' + await sel.cv());
// 6. DetailCraft ↔ BimCraft: the member that is the same thing as the second wall
ok((await sel.dc()).join() === 'member:' + dc.members[0], 'second wall clicked in the plan → the steel member is selected in the steel view: ' + JSON.stringify(await sel.dc()));
await page.evaluate(() => window.bimcraftVis.pick([])); await settle();
ok((await sel.dc()).length === 0 && (await sel.cv()) === null, 'let go in the model: steel and site let go');
await inApp('detailcraft', (d, w, id) => d.setSelection([{ kind: 'member', id }]), dc.members[0]); await settle(600);
bn = await bimNow();
ok((await hub()).source === 'detailcraft' && bn.v3d.join() === String(w1.key), 'member picked in the steel view → its element is picked in the model: ' + JSON.stringify(bn));
// 7. PartCraft ↔ ModelCraft (a frame): the feature defines the object
await inApp('detailcraft', d => d.setSelection([])); await settle();
await show('part'); await page.click(`[data-panel="part"] .pc-node[data-id="${pc[0]}"]`); await settle(600);
ok((await sel.mc()).join() === String(mc[0]), 'feature clicked in the part history → the object is selected in the 3D model view (in its frame): ' + JSON.stringify(await sel.mc()));
await inApp('partcraft', p => p.run ? null : null);
await inApp('modelcraft', (m, w, id) => m.host.setSel([{ t: 'i', id }]), mc[1]); await settle();
ok((await hub()).source === 'modelcraft' && (await hub()).refs[0].id === String(mc[1]), 'another object picked in the 3D model view is a new pick');
await inApp('modelcraft', (m, w, id) => m.host.setSel([{ t: 'i', id }]), mc[0]); await settle(600);
ok((await sel.pc()) === String(pc[0]), 'object picked in the 3D model view → the feature that defines it is selected in the part view: ' + await sel.pc());

/* ---------------- E. clear, multi-pick, echo, an empty panel, the page's ccPickApply */
// multi-pick: both walls in the plan (Shift+click adds)
await inApp('modelcraft', m => m.host.setSel([])); await settle();
await show('bim'); const a0 = await wallAt(0), a1 = await wallAt(1);
ok(a0.hit === a0.key && a1.hit === a1.key, 'both walls can be clicked in the plan');
await page.mouse.click(a0.x, a0.y); await page.keyboard.down('Shift'); await page.mouse.click(a1.x, a1.y); await page.keyboard.up('Shift'); await settle(700);
h = await hub();
ok(h.source === 'bimcraft' && h.refs.length === 2, 'Shift+click in the plan: two walls are the pick: ' + JSON.stringify(h.refs.map(r => r.id)));
ok((await sel.cad()).join() === String(cad[0].id) && (await sel.cv()) === 'pad:' + cv.pad && (await sel.dc()).join() === 'member:' + dc.members[0] && (await sel.mk()).join() === mkId, 'each view shows what belongs to either wall: drawing, site, steel, markup: ' + JSON.stringify([await sel.cad(), await sel.cv(), await sel.dc(), await sel.mk()]));
ok(/^2 picked in /.test((await statusText()).slice((await statusText()).indexOf('2 picked'))), 'the status line says 2 picked: ' + (await statusText()).slice(0, 140));
// echo: the views that were shown the pick report it back later; that is not a new pick
await page.evaluate(() => { window.dispatchEvent(new CustomEvent('cc-pick', { detail: { app: 'civilcraft', ids: ['pad:' + window.civilcraft.project.state.pads[0].id] } })); });
ok((await hub()).source === 'bimcraft', 'a view reporting back what it was shown (late) is an echo, not a new pick');
// an app with nothing selected does not take the pick away
await page.evaluate(() => window.dispatchEvent(new CustomEvent('cc-pick', { detail: { app: 'partcraft', ids: [] } })));
ok((await hub()).refs.length === 2, 'a view that reports "nothing selected" does not clear another view\'s pick');
// a real new pick in a view that was showing the pick takes over
await inApp('civilcraft', (c, w, id) => c.select({ kind: 'alignment', id }), cv.al); await settle(600);
h = await hub();
ok(h.source === 'civilcraft' && h.refs[0].id === 'alignment:' + cv.al, 'a different object picked in a view that was showing the pick is a new pick: ' + JSON.stringify(h.refs));
bn = await bimNow();
ok(bn.v3d.length === 2, 'the view the pick came from keeps its own selection (only what the page showed is taken away): ' + JSON.stringify(bn.v3d));
ok((await sel.cad()).length === 0 && (await sel.dc()).length === 0 && (await sel.mk()).length === 0, 'and the views the page had shown the walls in let go: ' + JSON.stringify([await sel.cad(), await sel.dc(), await sel.mk()]));
// clear from the page
await page.evaluate(() => window.superWindow.hub.clear()); await settle();
ok((await hub()).refs.length === 0 && !/picked in/.test(await statusText()), 'cleared: nothing picked, the status line says so');
// the page's ccPickApply sends a ref to the app it names (seven apps share the page)
const routed = await page.evaluate(async ([cid, did]) => { const r = await window.ccPickApply([{ app: 'cadcraft', id: cid }, { app: 'detailcraft', id: did }]); return r; }, [cadNative, String(dc.members[1])]);
await settle();
ok(routed === true && (await sel.cad()).join() === String(cad[0].id) && (await sel.dc()).join() === 'member:' + dc.members[1], 'window.ccPickApply on the page goes to the app each ref names (the drawing by the registry\'s id, steel by its own): ' + JSON.stringify([routed, await sel.cad(), await sel.dc()]));
// the same steel in two apps with no link: the steel view answers for the GlobalId its export gives a member
const twin = await page.evaluate(async id => { const sw = window.superWindow; sw.hub.clear(); const g = (sw.hub.set('detailcraft', []), null); return g; }, null);
await inApp('detailcraft', (d, w, id) => d.setSelection([{ kind: 'member', id }]), dc.members[2]); await settle();
const g2 = (await hub()).refs[0].guid;
const viaGuid = await page.evaluate(async g => { const a = window.superWindow.selWire.adapter('detailcraft'); const has = a.has(g), none = a.has('0000000000000000000000'); window.detailcraft.setSelection([]); const res = await a.apply([{ app: 'detailcraft', id: g }]); return { has, none, res }; }, g2);
ok(viaGuid.has === true && viaGuid.none === false && Array.isArray(viaGuid.res) && viaGuid.res[0] === String(dc.members[2]), 'the steel view knows a member by the GlobalId of its IFC export and shows it: ' + JSON.stringify(viaGuid));
const related2 = await page.evaluate(g => window.superWindow.hub.set('bimcraft', [{ app: 'bimcraft', id: '999999', cls: 'IfcBeam', guid: g }]) && window.superWindow.hub.related(), g2);
ok(Array.isArray(related2) && related2.some(r => r.app === 'detailcraft' && r.id === g2 && r.why === 'same'), 'an element of the model with that GlobalId relates to the steel member with no link made: ' + JSON.stringify(related2));
await page.evaluate(() => window.superWindow.hub.clear()); await settle();
await page.screenshot({ path: `${OUT}/picks-end.png` });

/* ---------------- F. the three new adapters in the apps on their own (each app's own page, no Super around it): nothing thrown, the adapter does nothing by itself */
for (const app of ['takeoffcraft', 'civilcraft', 'detailcraft']) {
  const solo = await ctx.newPage(); const errs = [];
  solo.on('pageerror', e => errs.push(String(e.message)));
  await solo.goto(url.replace('/lab/supercadcraft', '/lab/' + app) + '?embed=1');
  const up = await solo.waitForFunction(a => !!window[a] && !!(window.ccPickers && window.ccPickers[a]), app, { timeout: 60000 }).then(() => true, () => false);
  await solo.waitForTimeout(1500);
  const st = up ? await solo.evaluate(async a => { const seen = []; window.addEventListener('cc-pick', e => seen.push(e.detail)); const x = window.ccPickers[a]; const got = x.get(); const none = await x.apply([{ app: a, id: 'no-such-thing' }]); x.clear(); return { ids: got.ids, none, seen: seen.length, router: typeof window.ccPickApply }; }, app) : null;
  ok(up && st && Array.isArray(st.ids) && st.ids.length === 0 && st.none === false && st.seen === 0, `${app} on its own: the adapter is there, holds no pick, refuses an unknown id and announces nothing: ` + JSON.stringify(st));
  ok(errs.length === 0, `${app} on its own: no page errors` + (errs.length ? ': ' + errs.slice(0, 2).join(' | ') : ''));
  await solo.close();
}
// PartCraft's file open used to throw here when the Parts view opened with a project file (FX.239, mended): any page error fails the run
ok(errors.length === 0, 'no page errors' + (errors.length ? ': ' + errors.slice(0, 4).join(' | ') : ''));
await browser.close(); await close(); console.log(`\n${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0);
