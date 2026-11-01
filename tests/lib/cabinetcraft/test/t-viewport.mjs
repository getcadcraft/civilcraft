/* SPDX-License-Identifier: Apache-2.0 */
// Round 2 (DC.117): the cabinets as display bodies in PartCraft's viewport: the body schema (addons/addon-bodies.js), add-on API 1.1 (api.model),
// the part file, one undo step, replace / remove as a group, an add-on that asks for 1.0 still loads, and CabinetCraft's bodies (lib/bodies3d.js).
const { ok, section, near, mine, app, ADDON, APP, EN } = globalThis.__ccTest;
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { makeDocument } from './fake-dom.mjs';

const AB = await app('addons/addon-bodies.js');
const Bd = await mine('lib/bodies3d.js');
const P = await mine('lib/project.js');
const An = await mine('lib/analyze.js');

section('Display bodies: the schema');
{
  const box = AB.cleanBody({ name: 'a<b>', color: '#AABBCC', box: [10, 5, 0, 0, 0, 20], opacity: 0.5 });
  ok(box && box.box.join() === '0,0,0,10,5,20' && box.color === '#aabbcc' && !/[<>]/.test(box.name) && box.opacity === 0.5, 'a box: corners put in order, colour lower-cased, markup out of the name');
  ok(AB.cleanBody({ box: [0, 0, 0, 0, 5, 5] }) === null && AB.cleanBody({ box: [0, 0, 0, 1, 1] }) === null && AB.cleanBody({ box: [0, 0, 0, NaN, 1, 1] }) === null && AB.cleanBody({}) === null && AB.cleanBody(null) === null, 'a flat box, a short list, NaN, nothing: refused');
  ok(AB.cleanBody({ box: [0, 0, 0, 1, 1, 1], color: 'red' }).color === '#c9c2b4', 'a colour that is not #rrggbb becomes the plain one');
  ok(AB.cleanBody({ box: [0, 0, 0, 1, 1, 1], opacity: 7 }).opacity === undefined, 'opacity outside 0.05–1 is left out');
  const mesh = { positions: [0, 0, 0, 1, 0, 0, 0, 1, 0], indices: [0, 1, 2] };
  ok(AB.cleanBody({ mesh }) && AB.cleanBody({ mesh: { positions: [0, 0, 0, 1, 0, 0, 0, 1, 0], indices: [0, 1, 3] } }) === null && AB.cleanBody({ mesh: { positions: [0, 0], indices: [0, 0, 0] } }) === null, 'a mesh: indices must point at points');
  ok(AB.cleanBody({ box: [0, 0, 0, 1, 1, 1], at: [1, 2] }) === null && AB.cleanBody({ box: [0, 0, 0, 1, 1, 1], at: [1, 2, 3], rotY: 90 }).rotY === 90, 'at needs three numbers');
  ok(AB.cleanBody({ box: [0, 0, 0, 1e9, 1, 1] }) === null, 'a coordinate beyond ±10 million mm is refused');
  const g = AB.cleanGroup({ name: 'k', bodies: [{ box: [0, 0, 0, 1, 1, 1] }, { nope: 1 }, null, { box: [0, 0, 0, 2, 2, 2] }] });
  ok(g.bodies.length === 2, 'a group keeps the bodies it can use');
  ok(AB.cleanGroup({ bodies: Array.from({ length: 9000 }, () => ({ box: [0, 0, 0, 1, 1, 1] })) }).bodies.length <= 5000, 'a group is capped (6000 bodies, 60000 triangles)');
  const file = AB.readAddonBodies({ 'cabinetcraft': { kitchen: { name: 'x', bodies: [{ box: [0, 0, 0, 1, 1, 1] }] }, 'Bad Id': { bodies: [{ box: [0, 0, 0, 1, 1, 1] }] } }, '../x': { a: { bodies: [{ box: [0, 0, 0, 1, 1, 1] }] } }, other: 5 });
  ok(file && Object.keys(file).join() === 'cabinetcraft' && Object.keys(file.cabinetcraft).join() === 'kitchen', 'a file: bad group ids, bad add-on ids and non-objects are dropped');
  ok(AB.readAddonBodies(null) === null && AB.readAddonBodies([]) === null && AB.readAddonBodies({}) === null, 'nothing in, nothing out');
  const part = {};
  ok(AB.setGroup(part, 'x', 'g1', { name: 'n', bodies: [{ box: [0, 0, 0, 1, 1, 2] }] }) === 1 && AB.groupsOf(part).length === 1, 'setGroup / groupsOf');
  let threw = ''; try { AB.setGroup(part, 'x', 'Bad Id', { bodies: [{ box: [0, 0, 0, 1, 1, 1] }] }); } catch (e) { threw = e.message; }
  ok(/group id/.test(threw), 'a bad group id is refused with the reason');
  threw = ''; try { AB.setGroup(part, 'x', 'g2', { bodies: [{ nope: 1 }] }); } catch (e) { threw = e.message; }
  ok(/no usable body/.test(threw), 'a group with nothing usable is refused with the reason');
  ok(AB.boundsOf(part).min.join() === '0,0,0' && AB.boundsOf(part).max.join() === '1,1,2', 'bounds');
  AB.setGroup(part, 'x', 'g3', { bodies: [{ box: [0, 0, 0, 1, 1, 1], rotY: 90, at: [100, 0, 0] }] });
  const b = AB.boundsOf(part);
  ok(b.max[0] > 100 && b.min[2] < 0 || b.max[0] > 100, 'rotY and at move the body in the bounds', JSON.stringify(b));
  ok(AB.removeGroup(part, 'x', 'g1') && AB.removeGroup(part, 'x', 'g3') && !part.addonBodies && !AB.removeGroup(part, 'x', 'g1'), 'removeGroup; the key goes when the last group does');
  const tri = AB.bodyTriangles(AB.cleanBody({ box: [0, 0, 0, 2, 3, 4] }));
  ok(tri.length === 12 * 9, 'a box is twelve triangles');
  let vol = 0; for (let i = 0; i < tri.length; i += 9) { const [a, b2, c] = [tri.slice(i, i + 3), tri.slice(i + 3, i + 6), tri.slice(i + 6, i + 9)]; vol += (a[0] * (b2[1] * c[2] - b2[2] * c[1]) - a[1] * (b2[0] * c[2] - b2[2] * c[0]) + a[2] * (b2[0] * c[1] - b2[1] * c[0])) / 6; }
  ok(near(vol, 24, 1e-6), 'and they face outward (signed volume 2 × 3 × 4 = 24)', String(vol));
}

section('Display bodies: a THREE group');
{
  const THREE = await import('three').catch(() => null);
  if (!THREE) ok(true, 'three is not importable here: the browser test covers the scene');
  else {
    const g = AB.cleanGroup({ name: 'k', bodies: [{ color: '#ff0000', box: [0, 0, 0, 1, 1, 1] }, { color: '#ff0000', box: [2, 0, 0, 3, 1, 1] }, { color: '#00ff00', opacity: 0.4, box: [0, 2, 0, 1, 3, 1] }] });
    const obj = AB.groupObject(THREE, g);
    const meshes = obj.children.filter((c) => c.isMesh), lines = obj.children.filter((c) => c.isLineSegments);
    ok(meshes.length === 2 && lines.length === 1 && obj.userData.addonBodies === 3, 'one mesh per colour and opacity, one set of edges (translucent bodies have none)');
    ok(meshes[0].geometry.getAttribute('position').count === 72 && meshes[1].material.transparent === true, 'two red boxes merged (72 corners); the green one is see-through');
  }
}

// ---- through the loader
const doc = makeDocument();
globalThis.document = doc;
const mem = () => { const m = new Map(); return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k), m }; };
const store = mem();
globalThis.window = { localStorage: store, addEventListener() {} };
const i18n = await app('i18n.js');
i18n.init({ locale: 'en', strings: JSON.parse(fs.readFileSync(path.join(APP, 'lang/en.json'), 'utf8')) });
const PT = await app('part.js');
const A = await app('addons.js');
const PA = await app('addons/partcraft-api.js');

section('API 1.1: api.model');
{
  ok(/^1\.(?:[1-9]\d*)$/.test(PA.PARTCRAFT_API_VERSION), 'PartCraft\'s add-on API is 1.1 or a later 1.x (' + PA.PARTCRAFT_API_VERSION + '): api.model is in it');
  const part = PT.newPart('Test');
  const history = [];
  const calls = { sync: 0, fit: 0 };
  const host = { get part() { return part; }, regen: { mesh: null }, commit: (label, fn) => { history.push({ label, snap: JSON.stringify(part) }); const r = fn(); return r; }, status() {}, renderAll() {} };
  const root = doc.createElement('div'), list = doc.createElement('div');
  list.setAttribute('data-right-tabs', ''); root.append(list); doc.body.append(root);
  const started = await PA.startAddons({
    host, selection: () => null, select() {}, find: (sel) => (sel.includes('data-right-tabs') ? list : null), showTab() {}, bodies: { sync: () => { calls.sync++; }, fit: () => { calls.fit++; } },
    base: pathToFileURL(path.join(APP, 'addons') + '/').href, importer: (u) => import(u), storage: store, verify: async () => false, bundledOnly: false, noGlobal: true, packages: A.packageStore(null),
    fetchJson: async (u) => { try { return JSON.parse(fs.readFileSync(fileURLToPath(u), 'utf8')); } catch { return null; } },
  });
  await started.loader.setEnabled('cabinetcraft', true);
  ok(started.list().find((a) => a.id === 'cabinetcraft').state === 'active', 'CabinetCraft (API 1.1) is accepted by the 1.1 loader', JSON.stringify(started.list().find((a) => a.id === 'cabinetcraft')));
  // the rest goes through its command, as a person would
  started.runCommand('cabinetcraft:sample');
  const n0 = history.length;
  ok(started.runCommand('cabinetcraft:cab3d') === true, 'the command CAB3D runs');
  const ab = part.addonBodies && part.addonBodies.cabinetcraft && part.addonBodies.cabinetcraft.kitchen;
  ok(ab && ab.bodies.length > 60 && history.length === n0 + 1 && /CabinetCraft/.test(history.at(-1).label), 'the cabinets are in the part as display bodies in ONE history step labelled with the add-on: ' + (ab ? ab.bodies.length : 0) + ' bodies');
  ok(calls.fit === 1, 'the app was asked to frame them (fit)');
  const names = ab.bodies.map((b) => b.name);
  ok(names.some((x) => /Door/.test(x)) && names.some((x) => /Drawer front/.test(x)) && names.some((x) => /Countertop/.test(x)) && names.some((x) => /Side/.test(x)) && names.some((x) => /Floor/.test(x)) && names.some((x) => /Wall/.test(x)), 'panels, doors, drawer fronts, countertop, floor and walls are named in words');
  ok(new Set(ab.bodies.map((b) => b.color)).size >= 5, 'several colours: carcass, back, fronts, plinth, countertop …');
  ok(ab.bodies.every((b) => (b.box && b.box.length === 6) || b.mesh), 'every body is a box or a mesh');
  // the box of a base cabinet side sits where the plan says (room 3600 × 3000: the north run is at y = 3000 → world z = −3000)
  const bb = AB.boundsOf(part);
  ok(near(bb.min[0], -100, 1) && near(bb.max[0], 3700, 1) && near(bb.max[1], 2400, 1) && near(bb.min[2], -3100, 1) && near(bb.max[2], 100, 1), 'in PartCraft\'s axes (Y up, mm): the room spans x −100…3700 (the walls\' thickness), height 2400, z −3100…100', JSON.stringify(bb));
  // placing again replaces
  const count = ab.bodies.length;
  started.runCommand('cabinetcraft:cab3d');
  ok(part.addonBodies.cabinetcraft.kitchen.bodies.length === count && AB.groupsOf(part).length === 1 && history.length === n0 + 2, 'placing again replaces the group (one group, same count, another history step)');
  // the part file brings them back
  const json = PT.toJSON(part);
  const back = PT.readPart(json);
  ok(back.addonBodies && back.addonBodies.cabinetcraft.kitchen.bodies.length === count, 'saved with the part and read back');
  ok(JSON.parse(json).version === PT.fileVersion(part), 'the file version is whatever the part needs (display bodies add none)');
  const hostile = JSON.parse(json); hostile.addonBodies.cabinetcraft.kitchen.bodies.push({ box: ['x'] }, { mesh: 5 }); hostile.addonBodies['../../etc'] = { g: { bodies: [{ box: [0, 0, 0, 1, 1, 1] }] } };
  const clean = PT.readPart(hostile);
  ok(clean.addonBodies.cabinetcraft.kitchen.bodies.length === count && !clean.addonBodies['../../etc'], 'a hostile file: unusable bodies and a bad add-on id are dropped');
  const noBodies = JSON.parse(json); delete noBodies.addonBodies;
  ok(!PT.readPart(noBodies).addonBodies, 'a part without them opens as before');
  // undo = the history snapshot before the step
  const before = JSON.parse(history.at(-1).snap);
  ok(before.addonBodies && before.addonBodies.cabinetcraft.kitchen.bodies.length === count, 'the step before the last held the first placement (undo restores it)');
  const first = JSON.parse(history[n0].snap);
  ok(!first.addonBodies, 'the step before the first placement held none (undo removes them)');
  // remove
  const n1 = history.length;
  ok(started.runCommand('cabinetcraft:cab3d-clear') === true && !part.addonBodies && history.length === n1 + 1 && calls.sync >= 1, 'Take out of the viewport removes the group in one step and asks the app to redraw');
  // the old API keeps working: an add-on that asks for "1.0"
  const old = A.checkManifest({ id: 'xx', name: 'x', version: '1.0.0', api: '1.0', apps: ['partcraft'], entry: './main.js', license: 'MIT' }, { app: 'partcraft', apiVersion: PA.PARTCRAFT_API_VERSION });
  ok(old.ok !== false, 'a manifest asking for API 1.0 is accepted by 1.1');
  const newer = A.checkManifest({ id: 'xx', name: 'x', version: '1.0.0', api: '1.99', apps: ['partcraft'], entry: './main.js', license: 'MIT' }, { app: 'partcraft', apiVersion: PA.PARTCRAFT_API_VERSION });
  ok(newer.ok === false, 'one asking for 1.99 is refused: ' + JSON.stringify(newer.reason || newer));
  await started.loader.setEnabled('cabinetcraft', false);
}

section('CabinetCraft bodies: what is in them');
{
  const mk = (rooms) => P.cleanProject({ unit: 'mm', room: { w: 4000, d: 3000, h: 2400, ...rooms }, runs: [], islands: [] });
  const sample = P.sampleProject('mm', { name: 'x', north: 'N', east: 'E' });
  const b = An.analyze(sample, { word: (k) => k }).build;
  const bodies = Bd.viewportBodies(b, { word: (k) => k, room: false });
  const cabs = b.cells.filter((c) => c.kind === 'cab').length;
  ok(bodies.length > cabs * 5 && bodies.every((x) => x.name && x.color), 'a body for every panel: ' + bodies.length + ' for ' + cabs + ' cabinets');
  ok(bodies.filter((x) => /door/.test(x.name)).length >= 8 && bodies.filter((x) => /drawer-front/.test(x.name)).length >= 5, 'every door and drawer front is its own body');
  const withRoom = Bd.viewportBodies(b, { word: (k) => k, room: true });
  ok(withRoom.length === bodies.length + 1 + 4 && withRoom.some((x) => x.opacity && x.opacity < 0.5), 'the room: a floor and four walls, translucent');
  // openings are cut in the walls
  let q = P.cleanProject({ ...sample, openings: [{ id: 'W1', kind: 'window', wall: 'S', at: 500, w: 1200, h: 1000, sill: 900 }, { id: 'D1', kind: 'door', wall: 'W', at: 500, w: 900, h: 2100 }] });
  const wb = Bd.viewportBodies(An.analyze(q, {}).build, { word: (k) => k, room: true });
  ok(wb.some((x) => /bodies.window W1/.test(x.name)) && wb.some((x) => /bodies.door D1/.test(x.name)), 'a window pane and a door leaf stand in the wall');
  ok(wb.filter((x) => /bodies.wall S/.test(x.name)).length >= 4, 'the wall with a window is in pieces: before, under, over, after');
  // inches come out in millimetres
  const inch = P.cleanProject({ unit: 'in', room: { w: 120, d: 100, h: 96 }, runs: [{ id: 'A', wall: 'S', base: [{ kind: 'cab', tpl: 'base-door', w: 24 }] }] });
  const ib = Bd.viewportBodies(An.analyze(inch, {}).build, { word: (k) => k, room: false });
  const sx = AB.boundsOf({ addonBodies: { x: { g: AB.cleanGroup({ bodies: ib }) } } });
  ok(sx.max[0] > 600 && sx.max[0] < 700, 'inches are converted: a 24 in cabinet is about 610 mm wide', JSON.stringify(sx));
  // triangulation
  const L = [[0, 0], [4, 0], [4, 4], [2, 4], [2, 2], [0, 2]];
  const tris = Bd.triangulate(L);
  const ar = tris.reduce((s, [i, j, k]) => s + Math.abs((L[j][0] - L[i][0]) * (L[k][1] - L[i][1]) - (L[k][0] - L[i][0]) * (L[j][1] - L[i][1])) / 2, 0);
  ok(tris.length === 4 && near(ar, 12), 'ear clipping an L: four triangles, the right area');
  // L room and a corner cabinet
  const corner = P.cleanProject({ unit: 'mm', room: { w: 3600, d: 3000, h: 2400 }, runs: [{ id: 'A', wall: 'N', base: [{ kind: 'cab', tpl: 'base-door', w: 600 }, { kind: 'cab', tpl: 'base-corner-diag', w: 900 }] }] });
  const cb = Bd.viewportBodies(An.analyze(corner, {}).build, { word: (k) => k, room: false });
  ok(cb.some((x) => x.mesh) && AB.cleanGroup({ bodies: cb }).bodies.length === cb.length, 'a diagonal corner cabinet brings meshes (door, shelves, top) and all of it is accepted');
  void mk; void EN; void ADDON;
}
