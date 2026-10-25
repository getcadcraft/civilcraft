#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-illustrate.mjs — the Illustrate workspace's DOM-free modules (0.7 Track TP, session `illustrate`):
 * the manual file (format, untrusted reading, truncation and mutation fuzz), its undo document, views and instance looks,
 * and each later item's module as it lands.
 *   node tools/partcraft-test/test-illustrate.mjs [--verbose]     (or runIllustrateTests() from bin/test-partcraft.mjs)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { EN, ES } from './illustrate-lang.mjs';
import * as FX from './illustrate-fixtures.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DEV = path.join(HERE, '../../public_html/assets/apps/partcraft/dev/');

/** Seeded random numbers (mulberry32) so a fuzz failure can be run again. */
export function rng(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

export async function runIllustrateTests({ ok, section, near = (a, b, tol = 1e-9) => Math.abs(a - b) <= tol, M = null }) {
  const I18N = await import(DEV + 'i18n.js');
  const base = JSON.parse(fs.readFileSync(path.join(DEV, 'lang/en.json'), 'utf8'));
  I18N.init({ locale: 'en', strings: { ...base, ...EN } });
  const M4 = await import(DEV + 'illustrate/m4.js');
  const MN = await import(DEV + 'illustrate/manual.js');
  const PL = await import(DEV + 'illustrate/parts-list.js');
  const AN = await import(DEV + 'illustrate/annotate.js');
  const CAM = await import(DEV + 'illustrate/camera.js');
  const SVG = await import(DEV + 'illustrate/svg.js');
  const throws = (fn) => { try { fn(); return false; } catch { return true; } };
  const code = (fn) => { try { fn(); return 'none'; } catch (e) { return e instanceof MN.ManualError ? e.code : 'other:' + (e && e.name) + ': ' + (e && e.message); } };

  section('illustrate: words (illustrate-lang.mjs)');
  {
    const srcs = [path.join(DEV, 'ws-illustrate.js'), ...fs.readdirSync(path.join(DEV, 'illustrate')).filter((f) => f.endsWith('.js')).map((f) => path.join(DEV, 'illustrate', f))];
    const used = new Set();
    for (const f of srcs) for (const m of fs.readFileSync(f, 'utf8').matchAll(/['"](illustrate\.[a-z0-9_.-]+[a-z0-9_-])['"]/g)) used.add(m[1]);
    const missing = [...used].filter((k) => !(k in EN) && !Object.keys(EN).some((e) => e.startsWith(k.endsWith('_') ? k : k + '.')));
    ok(!missing.length, `every illustrate.* key the code names is in the words (${used.size} named)` + (missing.length ? ': missing ' + missing.slice(0, 5).join(', ') : ''));
    ok(Object.keys(EN).join() === Object.keys(ES).join(), `es-MX draft has the same ${Object.keys(EN).length} keys in the same order`);
    const trade = Object.entries(EN).filter(([, v]) => /composer|solidworks/i.test(v));
    ok(!trade.length, 'no other product\'s name in the words' + (trade.length ? ': ' + trade[0][0] : ''));
    const fills = Object.keys(EN).filter((k) => JSON.stringify((EN[k].match(/\{[a-z_]+\}/gi) || []).sort()) !== JSON.stringify((ES[k].match(/\{[a-z_]+\}/gi) || []).sort()));
    ok(!fills.length, 'the draft keeps every {fill}' + (fills.length ? ': ' + fills.join(', ') : ''));
  }

  section('illustrate: maths (m4.js)');
  {
    const R = [0.36, 0.48, -0.8, 0, -0.8, 0.6, 0, 0, 0.48, 0.64, 0.6, 0, 12, -3, 7, 1];
    ok(M4.isRigid(R), 'a rotation + move is rigid');
    const inv = M4.invert(R), back = M4.matMul(R, inv);
    ok(back.every((v, k) => near(v, M4.IDENT[k], 1e-12)), 'invert · m = identity');
    const mesh = FX.cylinder(5, 12, 9);
    const B = new Float64Array(mesh.positions.length);
    for (let i = 0; i < mesh.positions.length; i += 3) B.set(M4.apply(R, [mesh.positions[i], mesh.positions[i + 1], mesh.positions[i + 2]]), i);
    const fit = M4.rigidFit(mesh.positions, B);
    ok(fit.err < 1e-4 && fit.m.every((v, k) => near(v, R[k], 1e-5)), `rigidFit finds the motion between two copies (err ${fit.err.toExponential(1)})`);
  }

  section('illustrate: the manual file (manual.js)');
  const P = FX.product();
  const made = MN.newManual({ name: 'Bracket manual', source: { kind: 'partcraft-assembly', name: 'Bracket', sha256: 'a'.repeat(64) }, ...P, created: '2026-10-23T00:00:00Z' });
  {
    ok(made.m.format === 'partcraft-manual' && made.m.version === 1 && Object.keys(made.m.parts).length === 4 && made.m.instances.length === 5, 'newManual: format, version, 4 parts, 5 placed');
    const bytes = new Uint8Array(256).map((_, i) => i);
    ok(MN.b64decode(MN.b64encode(bytes)).every((v, i) => v === bytes[i]) && MN.b64decode(MN.b64encode(bytes.slice(0, 254))).length === 254, 'base64 round trip (and padding)');
    ok(MN.b64decode('ab$=') === null && MN.b64decode('abc') === null, 'base64: bad letters and lengths are refused');
    const text = MN.toJSON(made.m, made.meshes);
    const back = MN.readManual(text);
    ok(JSON.stringify(back.m) === JSON.stringify(made.m), 'toJSON → readManual gives the same manual');
    ok([...made.meshes].every(([pid, ms]) => { const b = back.meshes.get(pid); return b.positions.length === ms.positions.length && b.positions.every((v, i) => v === ms.positions[i]) && b.indices.every((v, i) => v === ms.indices[i]); }), 'every mesh comes back bit for bit');
    ok(MN.readManual(new TextEncoder().encode('﻿' + text)).m.name === 'Bracket manual', 'bytes with a UTF-8 BOM read too');
    const big = MN.newManual({ ...P });
    ok(MN.readManual(MN.toJSON(big.m, big.meshes)).m.instances.length === 5, 'a manual without views or balloons reads');
  }

  section('illustrate: a manual is untrusted input');
  {
    const good = JSON.parse(MN.toJSON(made.m, made.meshes));
    const bad = (what, change, want) => { const o = structuredClone(good); change(o); const c = code(() => MN.readManualObject(o)); ok(c === want, `${what} → ${want} (${c})`); };
    ok(code(() => MN.readManual('{')) === 'not_json' && code(() => MN.readManual(new Uint8Array([0xff, 0xfe, 0x00]))) === 'not_json', 'not JSON / not UTF-8 → not_json');
    bad('another format', (o) => { o.format = 'partcraft-assembly'; }, 'not_manual');
    bad('version 2', (o) => { o.version = 2; }, 'too_new');
    bad('version 0', (o) => { o.version = 0; }, 'not_manual');
    bad('an unknown source kind', (o) => { o.source.kind = 'dwg'; }, 'bad_source');
    bad('no parts', (o) => { o.parts = {}; }, 'no_parts');
    bad('a part id with a slash run', (o) => { o.parts['bad id'] = o.parts.pin; }, 'bad_parts');
    bad('density 99', (o) => { o.parts.plate.density = 99; }, 'bad_parts');
    bad('a mesh index past the vertices', (o) => { const ms = FX.box(1, 1, 1); ms.indices[5] = 8; o.parts.pin.mesh = MN.encodeMesh(ms); }, 'bad_mesh');
    bad('a NaN vertex', (o) => { const ms = FX.box(1, 1, 1); ms.positions[4] = NaN; o.parts.pin.mesh = MN.encodeMesh(ms); }, 'bad_mesh');
    bad('a huge vertex', (o) => { const ms = FX.box(1, 1, 1); ms.positions[4] = 1e9; o.parts.pin.mesh = MN.encodeMesh(ms); }, 'bad_mesh');
    bad('half a triangle', (o) => { o.parts.pin.mesh.t = MN.b64encode(new Uint8Array(8)); }, 'bad_mesh');
    bad('mesh not base64', (o) => { o.parts.pin.mesh.v = '!!!!'; }, 'bad_mesh');
    bad('a group loop', (o) => { o.groups[0].parent = 'g2'; }, 'bad_tree');
    bad('a group under a missing parent', (o) => { o.groups[1].parent = 'gx'; }, 'bad_tree');
    bad('two instances with one id', (o) => { o.instances[1].id = 'i1'; }, 'bad_instance');
    bad('an instance of a missing part', (o) => { o.instances[0].part = 'nope'; }, 'bad_instance');
    bad('a 15-number matrix', (o) => { o.instances[0].matrix.pop(); }, 'bad_instance');
    bad('an instance in a missing group', (o) => { o.instances[0].group = 'g9'; }, 'bad_instance');
    bad('an explode step on a missing instance', (o) => { o.explodes[0].steps[0].insts = ['i99']; }, 'bad_explode');
    bad('a zero explode direction', (o) => { o.explodes[0].steps[0].dir = [0, 0, 0]; }, 'bad_explode');
    bad('a balloon number given twice', (o) => { o.balloons = { next: 3, items: { plate: 1, post: 1 } }; }, 'bad_balloons');
    bad('a balloon number not below next', (o) => { o.balloons = { next: 2, items: { plate: 2 } }; }, 'bad_balloons');
    const withView = () => { const d = new MN.Doc(MN.readManualObject(structuredClone(good))); d.edit('v', (m) => MN.addView(m, { camera: MN.defaultCamera(null) })); return JSON.parse(d.toJSON()); };
    const gv = withView();
    ok(code(() => MN.readManualObject(structuredClone(gv))) === 'none', 'a manual with a view reads');
    const badV = (what, change) => { const o = structuredClone(gv); change(o.views[0], o); const c = code(() => MN.readManualObject(o)); ok(c === 'bad_view', `${what} → bad_view (${c})`); };
    badV('a view camera of an unknown type', (v) => { v.camera.type = 'fisheye'; });
    badV('a camera at its own target', (v) => { v.camera.pos = [...v.camera.target]; });
    badV('a look on a missing instance', (v) => { v.insts.i99 = { hide: true }; });
    badV('a colour that is not #rrggbb', (v) => { v.insts.i1 = { color: 'red' }; });
    badV('opacity 2', (v) => { v.insts.i1 = { opacity: 2 }; });
    badV('a thumbnail that is a web address', (v) => { v.thumb = 'https://example.com/x.png'; });
    badV('an explode of a missing view', (v) => { v.explode = { ref: 'v9', t: 1 }; });
    badV('a view id that is not ours', (v) => { v.id = 'view one'; });
    badV('two views with one id', (v, o) => { o.views.push(structuredClone(v)); });
    const proto = JSON.parse(JSON.stringify(gv).replace('"insts":{}', '"insts":{"__proto__":{"hide":true}}'));
    ok(code(() => MN.readManualObject(proto)) === 'none' && ({}).hide === undefined, 'a "__proto__" key is skipped (no prototype pollution)');
    // strings are cleaned and capped
    const o = structuredClone(good); o.name = 'A\u0000B' + 'x'.repeat(500); o.parts.pin.name = '\u0007Pin\n2';
    const r = MN.readManualObject(o);
    ok(r.m.name.length === 120 && !/[\u0000-\u001f]/.test(r.m.name) && r.m.parts.pin.name === 'Pin 2', 'names lose control characters and are cut to 120 characters');
  }

  section('illustrate: truncation and mutation fuzz (only ManualError may come out)');
  {
    const d = new MN.Doc(MN.readManual(MN.toJSON(made.m, made.meshes)));
    d.edit('v', (m) => { const v = MN.addView(m, { camera: MN.defaultCamera(null) }); v.explode = { ref: 'v1', t: 0.5 }; MN.setInstState(v, ['i2'], { ghost: true, color: '#ff8800' }); });
    const text = d.toJSON(), bytes = new TextEncoder().encode(text);
    const cuts = new Set([0, 1, 2, 10, 30, 100, bytes.length - 1, bytes.length - 2, bytes.length - 20]);
    for (let i = 1; i <= 40; i++) cuts.add(Math.floor(bytes.length * i / 41));
    const odd = [];
    for (const c of cuts) { const r = code(() => MN.readManual(bytes.slice(0, c))); if (r.startsWith('other') || r === 'none') odd.push(c + ' ' + r); }
    ok(!odd.length, `${cuts.size} cuts: each one refused with a ManualError` + (odd.length ? ' — ' + odd.slice(0, 3).join('; ') : ''));
    const rand = rng(20261023), obj = JSON.parse(text);
    const paths = [];
    const walk = (v, p) => { paths.push(p); if (v && typeof v === 'object' && p.length < 6) for (const k of Object.keys(v)) if (!(typeof v[k] === 'string' && v[k].length > 200)) walk(v[k], [...p, k]); };
    walk(obj, []);
    const values = [null, -1, 0, 1, 1e12, NaN, '', 'x', [], {}, [1, 2, 3], true, 'v1', 'i1', 'plate'];
    let others = 0, refused = 0, read = 0;
    for (let n = 0; n < 600; n++) {
      const o = structuredClone(obj);
      const p = paths[Math.floor(rand() * paths.length)];
      if (!p.length) continue;
      let at = o;
      for (const k of p.slice(0, -1)) at = at[k];
      const last = p.at(-1);
      if (rand() < 0.3) { if (Array.isArray(at)) at.splice(last, 1); else delete at[last]; } else at[last] = values[Math.floor(rand() * values.length)];
      const r = code(() => MN.readManualObject(o));
      if (r.startsWith('other')) { others++; if (others < 4) console.log('    mutation at ' + p.join('.') + ': ' + r); } else if (r === 'none') read++; else refused++;
    }
    ok(others === 0, `600 mutations: ${refused} refused, ${read} still read, ${others} other errors`);
  }

  section('illustrate: views, looks and undo (Doc)');
  {
    const doc = new MN.Doc(MN.readManual(MN.toJSON(made.m, made.meshes)));
    const box = MN.sceneBox(doc.m, doc.meshes, null);
    ok(near(box.min[1], 0, 1e-6) && near(box.max[1], 76, 1e-6), `sceneBox: the product from y 0 to 76 (${box.min[1]}…${box.max[1]})`);
    const cam = MN.defaultCamera(box);
    const v1 = doc.edit('Add view', (m) => MN.addView(m, { camera: cam }));
    ok(doc.m.views.length === 1 && v1.id === 'v1' && v1.name === 'View 1' && doc.undoLabel === 'Add view', 'Add view: one view, one undo step');
    doc.edit('Hide', (m) => MN.setInstState(doc.view(v1.id), ['i5'], { hide: true }));
    ok(MN.shownInstances(doc.m, doc.view('v1')).length === 4, 'Hide: four parts shown');
    doc.edit('Ghost', (m) => MN.setInstState(doc.view('v1'), ['i2', 'i3'], { ghost: true, opacity: 0.4, color: '#336699' }));
    const st = MN.instState(doc.view('v1'), 'i2');
    ok(st.ghost && st.opacity === 0.4 && st.color === '#336699' && !st.hide, 'Ghost + opacity + colour in one step');
    doc.edit('Clear', () => MN.setInstState(doc.view('v1'), ['i2'], { ghost: false, opacity: 1, color: null }));
    ok(doc.view('v1').insts.i2 === undefined, 'clearing every look removes the entry');
    ok(MN.sameParts(doc.m, ['i2']).join() === 'i2,i3', 'select-same-part: both posts');
    ok(MN.instancesIn(doc.m, 'g1').sort().join() === 'i2,i3,i4', 'a group\'s instances include its sub-group\'s');
    doc.edit('Isolate', (m) => MN.isolate(m, doc.view('v1'), ['i1', 'i4']));
    ok(MN.shownInstances(doc.m, doc.view('v1')).map((i) => i.id).join() === 'i1,i4', 'Isolate shows only the picked parts');
    doc.edit('Show all', (m) => MN.showAll(m, doc.view('v1')));
    ok(MN.shownInstances(doc.m, doc.view('v1')).length === 5, 'Show all');
    const v2 = doc.edit('Duplicate', (m) => MN.duplicateView(m, 'v1'));
    ok(doc.m.views.map((v) => v.id).join() === 'v1,v2' && v2.name === 'View 1 (copy)', 'Duplicate goes right after the original');
    doc.edit('Move', (m) => MN.moveView(m, 'v2', 0));
    ok(doc.m.views.map((v) => v.id).join() === 'v2,v1', 'reorder');
    doc.edit('Rename', (m) => MN.renameView(m, 'v2', '  Front\u0000 '));
    ok(doc.view('v2').name === 'Front', 'rename cleans the name');
    doc.edit('Explode', () => { doc.view('v2').explode = { ref: 'v1', t: 1 }; MN.moveInstances(doc.view('v2'), ['i1'], [0, -20, 0]); });
    const w = MN.worldOf(doc.m, doc.view('v2'));
    ok(near(w.get('i5')[13], 66 + 70) && near(w.get('i4')[13], 53 + 30) && near(w.get('i1')[13], 5 - 20) && near(w.get('i2')[13], 30), 'worldOf: explode (both steps) + a move of its own');
    const EX = await import(DEV + 'explode.js');
    const ref = EX.offsets(doc.m.explodes[0], 0.6), mine = MN.explodeOffsets(doc.m.explodes[0], 0.6);
    ok([...ref].every(([id, o]) => mine.get(id).every((x, k) => near(x, o[k]))) && ref.size === mine.size, 'explodeOffsets plays the steps exactly as explode.js does (t 0.6)');
    doc.edit('Update', (m) => MN.updateView(m, 'v1', { camera: { ...cam, type: 'persp', fov: 50 }, explode: { ref: 'v1', t: 0.5 }, moves: {}, insts: { i3: { hide: true } } }));
    ok(doc.view('v1').camera.type === 'persp' && doc.view('v1').camera.fov === 50 && doc.view('v1').insts.i3.hide, 'Update view stores the scene');
    const steps = doc.undoStack.length;
    let threw = false;
    try { doc.edit('Bad', (m) => { m.views.length = 0; throw new Error('stop'); }); } catch { threw = true; }
    ok(threw && doc.m.views.length === 2 && doc.undoStack.length === steps, 'an edit that throws changes nothing and adds no step');
    doc.undo(); ok(!doc.view('v1').explode, 'undo Update view'); doc.redo(); ok(doc.view('v1').explode.t === 0.5, 'redo');
    while (doc.canUndo) doc.undo();
    ok(doc.m.views.length === 0 && doc.canRedo, 'undo all the way back to no views');
    doc.edit('Add', (m) => MN.addView(m, {}));
    ok(!doc.canRedo, 'a new edit clears redo');
    doc.edit('Remove', (m) => MN.removeView(m, doc.m.views[0].id));
    ok(doc.m.views.length === 0, 'remove a view');
    const rows = MN.treeRows(doc.m);
    ok(rows.map((r) => (r.kind === 'group' ? '+' : '') + r.id + '@' + r.depth).join() === '+g1@0,+g2@1,i2@2,i3@2,i4@1,i1@0,i5@0', 'the product tree rows (groups first, then their parts)');
    const stats = MN.meshStats(FX.box(10, 20, 30));
    ok(near(stats.volume, 6000, 1e-6) && near(stats.area, 2200, 1e-6), 'meshStats: a box\'s volume and area');
  }

  section('illustrate: the parts list and balloon numbers (parts-list.js, TP.4)');
  {
    const doc = new MN.Doc(MN.readManual(MN.toJSON(made.m, made.meshes)));
    const all = PL.rows(doc.m, doc.meshes);
    ok(all.length === 4 && all.find((r) => r.name === 'Post').qty === 2 && all.reduce((s, r) => s + r.qty, 0) === 5, 'four rows; the two posts are one row with quantity 2');
    const plate = all.find((r) => r.name === 'Base plate');
    ok(near(plate.volume, 120 * 10 * 80, 1e-3) && near(plate.massEach, 120 * 10 * 80 * 7.85 / 1000, 1e-3) && all.find((r) => r.name === 'Pin').massEach === null, 'volume from the mesh, mass from the density; no density, no mass');
    ok(PL.rows(doc.m, doc.meshes, { collapse: false }).length === 5, 'collapse off: one row per placed part');
    doc.edit('v', (m) => { m.scene = MN.blankScene(MN.defaultCamera(null)); MN.setInstState(m.scene, ['i5'], { hide: true }); MN.setInstState(m.scene, ['i4'], { ghost: true }); });
    ok(PL.rows(doc.m, doc.meshes, { view: doc.m.scene, scope: 'view' }).map((r) => r.name).sort().join() === 'Base plate,Post', 'scope view: hidden and ghosted parts are left out');
    doc.edit('n', (m) => PL.giveNumbers(m, ['post', 'plate']));
    ok(PL.numberOf(doc.m, 'post') === 1 && PL.numberOf(doc.m, 'plate') === 2 && doc.m.balloons.next === 3, 'numbers in the order asked: post 1, plate 2');
    doc.edit('n', (m) => { PL.giveNumbers(m, ['post', 'cap']); PL.dropNumber(m, 'plate'); PL.giveNumbers(m, ['pin']); });
    ok(PL.numberOf(doc.m, 'post') === 1 && PL.numberOf(doc.m, 'cap') === 3 && PL.numberOf(doc.m, 'pin') === 4 && PL.numberOf(doc.m, 'plate') === null, 'a number stays put; a dropped number (2) is never given again');
    ok(PL.rows(doc.m, doc.meshes).map((r) => r.item ?? '-').join() === '1,3,4,-', 'rows in balloon order, unnumbered last');
    const twin = structuredClone(P); twin.parts.post2 = { ...twin.parts.post }; twin.instances[2].part = 'post2';
    const tm = MN.newManual(twin);
    ok(PL.rows(tm.m, tm.meshes).find((r) => r.name === 'Post').qty === 2 && PL.rows(tm.m, tm.meshes).length === 4, 'auto-collapse: two parts with the same number and shape are one row');
    const csv = PL.csv([{ ...all[0], name: '=HYPERLINK("x")', number: 'A,"B"' }], ['item', 'qty', 'number', 'name'], (k) => ({ item: 'Item', qty: 'Qty', number: 'Part number', name: 'Name' })[k]);
    ok(csv.startsWith('﻿Item,Qty,Part number,Name\r\n') && csv.includes('"A,""B"""') && csv.includes('"\'=HYPERLINK(""x"")"'), 'CSV: header, quotes doubled, a formula cell defused');
    ok(PL.readTable({ at: [2, 0], columns: ['name', 'bogus', 'prop:Finish'] }).columns.join() === 'name,prop:Finish' && PL.readTable({}).columns.join() === PL.DEFAULT_COLUMNS.join(), 'a table from a file keeps known columns only; none = the default ones');
    doc.edit('table', (m) => { m.scene.table = PL.readTable({ columns: ['item', 'name', 'qty'] }); MN.addView(m, { from: { ...m.scene, id: 'x', name: 'With table' } }); });
    const r2 = MN.readManual(doc.toJSON());
    ok(r2.m.views[0].table.columns.join() === 'item,name,qty' && r2.m.scene.table && r2.m.balloons.next === 5, 'the table and the numbers save and read back');
  }

  section('illustrate: annotations that stay attached (annotate.js, TP.3)');
  {
    const doc = new MN.Doc(MN.readManual(MN.toJSON(made.m, made.meshes)));
    const box = MN.sceneBox(doc.m, doc.meshes, null);
    doc.edit('scene', (m) => { m.scene = MN.blankScene(CAM.fitCamera(box, { dir: [0, 0, 1], aspect: 1.5 })); });
    const sc = () => doc.m.scene;
    const lab = doc.edit('Label', (m) => AN.addAnnotation(m, { kind: 'label', anchor: { inst: 'i4', p: [50, 3, 0] }, off: [0.1, 0.05], text: '{name} ({number}), {qty} off' }, m.scene));
    const items = () => AN.layout(doc.m, doc.meshes, sc(), { aspect: 1.5, H: 100 });
    const txt = items().filter((i) => i.t === 'text' && i.ref === lab.id);
    ok(txt.length === 1 && txt[0].text === 'Cap (CP-1), 1 off', `a label fills its fields from the part ("${txt[0]?.text}")`);
    const dot0 = items().find((i) => i.t === 'circle' && i.ref === lab.id).c;
    doc.edit('Explode', (m) => { m.scene.explode = { ref: 'v1', t: 1 }; });
    const dot1 = items().find((i) => i.t === 'circle' && i.ref === lab.id).c;
    const P0 = CAM.projector(sc().camera, 1.5);
    ok(near(dot1[0], dot0[0], 1e-6) && near((dot1[1] - dot0[1]) / 100 * P0.mmPerUnit, 30, 1e-3), 'the label\'s point moves with the cap when it explodes (30 mm up)');
    const mz = doc.edit('Measure', (m) => AN.addAnnotation(m, { kind: 'measure', measure: { kind: 'linear', pts: [{ inst: 'i1', p: [-60, 5, 0] }, { inst: 'i1', p: [60, 5, 0] }], decimals: 1 }, off: [0, -0.05] }, m.scene));
    ok(AN.measureValue(doc.m, mz).text === '120.0 mm' && items().some((i) => i.t === 'text' && i.ref === mz.id && i.text === '120.0 mm'), 'a linear measurement reads 120.0 mm from the plate');
    const mz2 = doc.edit('Gap', (m) => AN.addAnnotation(m, { kind: 'measure', measure: { kind: 'linear', pts: [{ inst: 'i4', p: [0, 3, 0] }, { inst: 'i5', p: [0, 10, 0] }], decimals: 2 } }, m.scene));
    ok(AN.measureValue(doc.m, mz2).text === '20.00 mm', 'a measurement between two parts is taken where they are assembled, even while exploded');
    const rad = doc.edit('R', (m) => AN.addAnnotation(m, { kind: 'measure', measure: { kind: 'radius', pts: [{ inst: 'i2', p: [6, 20, 0] }, { inst: 'i2', p: [0, 20, 6] }, { inst: 'i2', p: [-6, 20, 0] }], decimals: 1 } }, m.scene));
    const ang = doc.edit('A', (m) => AN.addAnnotation(m, { kind: 'measure', measure: { kind: 'angle', pts: [{ inst: 'i1', p: [60, 5, 40] }, { inst: 'i1', p: [60, 5, -40] }, { inst: 'i1', p: [-60, 5, -40] }], decimals: 0 } }, m.scene));
    ok(AN.measureValue(doc.m, rad).text === 'R6.0' && AN.measureValue(doc.m, ang).text === '90°', `radius R6.0 from three points on the post; a 90° corner (${AN.measureValue(doc.m, rad).text}, ${AN.measureValue(doc.m, ang).text})`);
    const arr = doc.edit('Arrow', (m) => AN.addAnnotation(m, { kind: 'arrow', anchor: { inst: 'i5', p: [0, 10, 0] }, arrow: { dir: [0, 1, 0], len: 25, style: 'turn' } }, m.scene));
    ok(items().filter((i) => i.ref === arr.id && i.t === 'path').length === 2, 'a turn arrow: an arc and its head');
    ok(items().some((i) => i.ref === arr.id && i.t === 'path' && i.pts.length > 30), 'the turn arrow is a curve (about the pin\'s axis)');
    doc.edit('hide pin', (m) => MN.setInstState(m.scene, ['i5'], { hide: true }));
    ok(!items().some((i) => i.ref === arr.id), 'an annotation on a hidden part is not drawn');
    doc.edit('show pin', (m) => MN.setInstState(m.scene, ['i5'], { hide: false }));
    const balloons = doc.edit('Balloons', (m) => AN.autoBalloons(m, doc.meshes, m.scene, { aspect: 1.5 }).map((b) => AN.addAnnotation(m, b, m.scene)));
    ok(balloons.length === 4 && balloons.map((b) => PL.numberOf(doc.m, b.pid)).sort().join() === '1,2,3,4', 'balloon everything visible: four rows, numbers 1–4');
    const again = doc.edit('Balloons again', (m) => AN.autoBalloons(m, doc.meshes, m.scene, { aspect: 1.5 }));
    ok(again.length === 0, 'a second run adds none (each row has its balloon)');
    const bt = items().filter((i) => i.t === 'text' && balloons.some((b) => b.id === i.ref)).map((i) => i.text).sort().join();
    ok(bt === '1,2,3,4', `balloons draw their numbers (${bt})`);
    const bc = items().filter((i) => i.t === 'circle' && i.r > 1 && balloons.some((b) => b.id === i.ref));
    const sep = Math.min(...bc.flatMap((a, k) => bc.slice(k + 1).map((b) => Math.hypot(a.c[0] - b.c[0], a.c[1] - b.c[1]))));
    ok(bc.length === 4 && sep > 5, `balloons kept apart on their ring (closest ${sep.toFixed(1)} mm)`);
    const postB = balloons.find((b) => b.pid === 'post');
    ok(['i2', 'i3'].includes(postB.anchor.inst), 'the posts\' row has one balloon, on one of the two posts');
    doc.edit('Add view', (m) => MN.addView(m, { from: { ...m.scene, id: 'x', name: 'Balloons' } }));
    const shape = doc.edit('Box', (m) => AN.addAnnotation(m, { kind: 'shape', shape: 'rect', box: [0.1, 0.1, 0.3, 0.2] }, m.scene));
    ok(items().some((i) => i.ref === shape.id && i.pts.length === 4), 'a rectangle pinned to the picture');
    const r3 = MN.readManual(doc.toJSON());
    ok(r3.m.annotations.length === doc.m.annotations.length && r3.m.views[0].annots.length === doc.m.views[0].annots.length && JSON.stringify(r3.m.annotations) === JSON.stringify(doc.m.annotations), 'annotations and the views\' lists save and read back');
    doc.edit('Delete', (m) => AN.removeAnnotation(m, balloons[0].id));
    ok(!doc.m.views[0].annots.includes(balloons[0].id) && !doc.m.scene.annots.includes(balloons[0].id), 'deleting an annotation takes it out of every view');
    const g = JSON.parse(doc.toJSON());
    const badA = (what, change) => { const o = structuredClone(g); change(o); const c = code(() => MN.readManualObject(o)); ok(c === 'bad_annotation' || c === 'bad_view', `${what} → refused (${c})`); };
    badA('an unknown kind', (o) => { o.annotations[0].kind = 'sticker'; });
    badA('an anchor on a missing part', (o) => { o.annotations[0].anchor.inst = 'i42'; });
    badA('a picture from the web', (o) => { o.annotations.push({ id: 'a900', kind: 'picture', src: 'https://x.test/a.png', box: [0, 0, 1, 1] }); });
    badA('text size 0.5', (o) => { o.annotations[0].style = { size: 0.5 }; });
    badA('a view showing a missing annotation', (o) => { o.views[0].annots.push('a777'); });
    badA('a balloon of a missing part', (o) => { const b = o.annotations.find((a) => a.kind === 'balloon'); b.pid = 'nope'; });
    const svg = SVG.svgText({ w: 150, h: 100, items: [...items(), { t: 'text', x: 1, y: 1, size: 3, text: '<script>&"' }] }, { title: 'A <b>' });
    ok(svg.startsWith('<?xml') && /<svg [^>]*viewBox="0 0 150 100"/.test(svg) && !svg.includes('<script') && svg.includes('&lt;script&gt;&amp;&quot;') && svg.includes('<title>A &lt;b&gt;</title>'), 'SVG: millimetre viewBox, text escaped, no script');
  }

  section('illustrate: line art — hidden lines by the mesh method (hlr.js, lineart.js, TP.7)');
  {
    const HL = await import(DEV + 'illustrate/hlr.js');
    const LA = await import(DEV + 'illustrate/lineart.js');
    const PDF = await import(DEV + 'illustrate/pdf.js');
    const T = (x, y, z) => [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1];
    // a big box in front of a small one (front view): the small one is wholly hidden
    const two = MN.newManual({ parts: { big: { name: 'Big', mesh: FX.box(100, 100, 10) }, small: { name: 'Small', mesh: FX.box(40, 40, 10) } },
      instances: [{ id: 'f', part: 'big', name: 'Big', matrix: T(0, 0, 50) }, { id: 'b', part: 'small', name: 'Small', matrix: T(0, 0, 0) }] });
    const front = { ...MN.blankScene({ type: 'ortho', pos: [0, 0, 500], target: [0, 0, 0], up: [0, 1, 0], height: 60 }) };
    const r = HL.hiddenLines(two.m, two.meshes, front, { aspect: 1 });
    const lenOf = (kinds, inst) => r.lines.filter((l) => kinds.includes(l.kind) && (!inst || l.inst === inst)).reduce((s, l) => s + Math.hypot(l.b[0] - l.a[0], l.b[1] - l.a[1]), 0) * 120;   // picture units → mm (height 2 × 60)
    const vis = lenOf(['outline', 'edge']), hidSmall = lenOf(['hidden'], 'b'), visSmall = lenOf(['outline', 'edge'], 'b');
    ok(Math.abs(vis - 400) < 2 && visSmall < 0.5, `front view: the big box's outline is all that shows (${vis.toFixed(1)} mm of 400; small box ${visSmall.toFixed(2)})`);
    ok(Math.abs(hidSmall - 320) < 3, `the small box behind it is drawn hidden: its front and back squares, 320 mm (${hidSmall.toFixed(1)})`);
    const rOff = HL.hiddenLines(two.m, two.meshes, front, { aspect: 1, hidden: false });
    ok(!rOff.lines.some((l) => l.kind === 'hidden'), 'hidden lines off: none drawn');
    // move the big box aside in the view: now the small one shows
    const aside = { ...front, moves: { f: [80, 0, 0] } };
    const r2 = HL.hiddenLines(two.m, two.meshes, aside, { aspect: 1 });
    const vs2 = r2.lines.filter((l) => l.inst === 'b' && l.kind === 'outline').reduce((s, l) => s + Math.hypot(l.b[0] - l.a[0], l.b[1] - l.a[1]), 0) * 120;
    ok(vs2 > 155 && vs2 < 165, `a part moved in the view no longer hides the other (small box outline ${vs2.toFixed(1)} mm)`);
    // ghosted: hides nothing, drawn light
    const ghost = { ...front, insts: { f: { ghost: true } } };
    const r3 = HL.hiddenLines(two.m, two.meshes, ghost, { aspect: 1 });
    ok(r3.lines.some((l) => l.inst === 'f' && l.kind === 'ghost') && r3.lines.some((l) => l.inst === 'b' && l.kind === 'outline'), 'a ghosted part is drawn light and hides nothing behind it');
    // iso view of the product: every kind of line, quickly
    const isoV = MN.blankScene(CAM.fitCamera(MN.sceneBox(made.m, made.meshes, null), { aspect: 1.5 }));
    const ri = HL.hiddenLines(made.m, made.meshes, isoV, { aspect: 1.5 });
    const kinds = new Set(ri.lines.map((l) => l.kind));
    ok(kinds.has('outline') && kinds.has('edge') && kinds.has('hidden') && ri.stats.ms < 20000, `iso view of the bracket: outlines, sharp edges and hidden lines (${ri.lines.length} runs, ${ri.stats.ms} ms)`);
    // perspective: the far end of a long bar looks smaller
    const bar = MN.newManual({ parts: { bar: { name: 'Bar', mesh: FX.box(20, 20, 400) } }, instances: [{ id: 'i', part: 'bar', name: 'Bar', matrix: T(0, 0, 0) }] });
    const pv = MN.blankScene({ type: 'persp', pos: [0, 0, 400], target: [0, 0, 0], up: [0, 1, 0], height: 50, fov: 60 });
    const rp = HL.hiddenLines(bar.m, bar.meshes, pv, { aspect: 1 });
    const spans = rp.lines.filter((l) => Math.abs(l.a[1] - l.b[1]) < 1e-9).map((l) => Math.abs(l.b[0] - l.a[0])).sort((a, b) => a - b);
    ok(spans.length >= 2 && spans[spans.length - 1] / spans[0] > 2.5, `perspective: the near end ${(spans.at(-1) ?? 0).toFixed(3)} wide, the far end ${(spans[0] ?? 0).toFixed(3)} (the far one drawn hidden)`);
    // a section: a 100 mm cube cut at x = 0, seen from the iso side: a capped, hatched square
    const cube = MN.newManual({ parts: { c: { name: 'Cube', mesh: FX.box(100, 100, 100) } }, instances: [{ id: 'i', part: 'c', name: 'Cube', matrix: T(0, 0, 0) }] });
    const cuts = { removed: (p) => p[0] > 0, faces: [{ n: [1, 0, 0], c: 0, region: () => true }] };
    const iv = MN.blankScene(CAM.fitCamera({ min: [-50, -50, -50], max: [50, 50, 50] }, { dir: [1, 0.8, 1], aspect: 1 }));
    const rc = HL.hiddenLines(cube.m, cube.meshes, iv, { aspect: 1, cuts });
    const cutLen = rc.lines.filter((l) => l.kind === 'cut').length;
    ok(rc.caps.length === 1 && rc.caps[0].loops.length === 1 && rc.caps[0].loops[0].length >= 4 && cutLen > 0, `the cut face: one loop, drawn as the cut outline (${rc.caps[0]?.loops[0]?.length} corners)`);
    ok(rc.hatch.length > 20 && rc.hatch.every((h) => Math.abs((h.b[1] - h.a[1]) - (h.b[0] - h.a[0])) < 1e-9), `hatched at 45° (${rc.hatch.length} lines)`);
    const P = CAM.projector(iv.camera, 1);
    const q = P.project([40, 0, 40]);
    ok(!rc.lines.some((l) => l.kind !== 'hidden' && Math.hypot((l.a[0] + l.b[0]) / 2 - q[0], (l.a[1] + l.b[1]) / 2 - q[1]) < 0.01), 'nothing is drawn where the cut-away half was');
    ok(HL.insideLoops([[[0, 0], [10, 0], [10, 10], [0, 10]], [[3, 3], [6, 3], [6, 6], [3, 6]]], [1, 1]) && !HL.insideLoops([[[0, 0], [10, 0], [10, 10], [0, 10]], [[3, 3], [6, 3], [6, 6], [3, 6]]], [4, 4]), 'even-odd inside test (a hole is outside)');
    // the whole picture, with fills, annotations and the table, written as SVG and PDF
    const doc = new MN.Doc(MN.readManual(MN.toJSON(made.m, made.meshes)));
    doc.edit('setup', (m) => {
      m.scene = MN.blankScene(CAM.fitCamera(MN.sceneBox(m, doc.meshes, null), { aspect: 1.5 }));
      m.scene.explode = { ref: 'v1', t: 1 };
      for (const b of AN.autoBalloons(m, doc.meshes, m.scene, { aspect: 1.5 })) AN.addAnnotation(m, b, m.scene);
      m.scene.table = PL.readTable({});
      MN.addView(m, { from: { ...m.scene, id: 'x', name: 'Exploded' } });
    });
    const labels = (k) => ({ item: 'Item', qty: 'Qty', number: 'Part number', name: 'Name', material: 'Material' })[k] || k;
    const art = LA.lineArt(doc.m, doc.meshes, doc.m.views[0], { W: 180, H: 120, fills: 'shaded', labels });
    const texts = art.items.filter((i) => i.t === 'text').map((i) => i.text);
    ok(art.w === 180 && art.items.some((i) => i.t === 'path' && i.dash && i.dash.length === 4) && ['1', '2', '3', '4', 'Item', 'Base plate'].every((x) => texts.includes(x)), 'line art of the exploded view: trails (chain lines), balloons 1–4, the parts list');
    ok(art.items.filter((i) => i.t === 'path' && i.fill && !i.stroke?.startsWith('#1b')).length > 50, 'shaded fills under the lines');
    const svg = SVG.svgText(art, { title: 'Exploded' });
    ok(/viewBox="0 0 180 120"/.test(svg) && (svg.match(/<path /g) || []).length > 100, `SVG: ${Math.round(svg.length / 1024)} KB, ${(svg.match(/<path /g) || []).length} paths`);
    const sh = LA.sheet({ paper: 'a4', title: 'Bracket: views', views: [{ art, caption: 'Exploded' }, { art: LA.lineArt(doc.m, doc.meshes, MN.blankScene(CAM.fitCamera(MN.sceneBox(doc.m, doc.meshes, null), { dir: [0, 0, 1], aspect: 1.5 })), { W: 180, H: 120 }), caption: 'Front' }] });
    ok(sh.w === 297 && sh.h === 210 && sh.items.filter((i) => i.t === 'group').length === 2 && sh.items.some((i) => i.t === 'text' && i.text === 'Front'), 'a multi-view sheet: A4 landscape, two views with captions');
    const pdf = await PDF.toPdf([art, sh, { w: 100, h: 50, items: [{ t: 'text', x: 10, y: 10, size: 5, text: 'Tick ✓ é (x)' }] }], { title: 'Bracket (é)' });
    const txt = new TextDecoder('latin1').decode(pdf.bytes);
    const xref = Number(/startxref\n(\d+)/.exec(txt)[1]);
    const offs = [...txt.slice(xref).matchAll(/^(\d{10}) 00000 n $/gm)].map((x) => Number(x[1]));
    const offOk = offs.every((o, i) => txt.slice(o, o + 12).startsWith((i + 1) + ' 0 obj'));
    ok(txt.startsWith('%PDF-1.4') && txt.trimEnd().endsWith('%%EOF') && offOk && /\/Count 3/.test(txt) && pdf.missing === 1 && PDF.winAnsi('Tick ✓ é (x)').str === 'Tick ? \\351 \\(x\\)', `PDF: three pages, every cross-reference offset right (${offs.length} objects), "✓" not in WinAnsi counted (${pdf.missing})`);
    const zlib = await import('node:zlib');
    const png = (() => { const w = 2, h = 2, raw = Buffer.from([0, 255, 0, 0, 0, 255, 0, 0, 0, 0, 255, 255, 255, 255]); const z = zlib.deflateSync(raw); const crc = () => Buffer.alloc(4); const chunk = (type, data) => { const l = Buffer.alloc(4); l.writeUInt32BE(data.length); return Buffer.concat([l, Buffer.from(type), data, crc()]); }; const ih = Buffer.alloc(13); ih.writeUInt32BE(w, 0); ih.writeUInt32BE(h, 4); ih[8] = 8; ih[9] = 2; return Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), chunk('IHDR', ih), chunk('IDAT', z), chunk('IEND', Buffer.alloc(0))]); })();
    const io = PDF.imageObject('data:image/png;base64,' + png.toString('base64'));
    ok(io && io.w === 2 && /Predictor 15 \/Colors 3/.test(io.dict), 'a PNG picture goes into the PDF by its own deflate stream (predictor 15)');
    const jpg = Uint8Array.from([0xff, 0xd8, 0xff, 0xe0, 0, 4, 0, 0, 0xff, 0xc0, 0, 11, 8, 0, 3, 0, 5, 3, 1, 0x11, 0, 0, 0, 0, 0, 0]);
    const jo = PDF.imageObject('data:image/jpeg;base64,' + Buffer.from(jpg).toString('base64'));
    ok(jo && jo.w === 5 && jo.h === 3 && /DCTDecode/.test(jo.dict) && PDF.imageObject('data:image/png;base64,AAAA') === null, 'a JPEG goes in as it is (its size read from SOF0); a broken picture is left out');
  }

  section('illustrate: looks, cut-aways and the magnifier (look.js, TP.5)');
  {
    const LK = await import(DEV + 'illustrate/look.js');
    const HL = await import(DEV + 'illustrate/hlr.js');
    const LA = await import(DEV + 'illustrate/lineart.js');
    ok(LK.readLook({ style: 'xray', section: { n: [2, 0, 0], c: 5 } }).section.n.join() === '1,0,0' && throws(() => LK.readLook({ style: 'neon' })) && throws(() => LK.readLook({ box: { min: [0, 0, 0], max: [0, 1, 1] } })) && throws(() => LK.readLook({ magnifier: { at: [0, 0], target: [0, 0], r: 0.9, zoom: 3, mode: 'zoom' } })), 'readLook: cleans a section, refuses a bad style, a flat box and a huge lens');
    const sec = LK.sectionFor({ min: [-50, 0, -10], max: [50, 20, 10] }, 'x', 0.25);
    const cuts = LK.cutsOf({ section: sec });
    ok(sec.c === -25 && cuts.removed([0, 5, 0]) && !cuts.removed([-30, 5, 0]), 'a section a quarter of the way along X: everything right of x = −25 is cut away');
    const bc = LK.cutsOf({ box: { min: [0, 0, 0], max: [10, 10, 10] } });
    ok(bc.removed([5, 5, 5]) && !bc.removed([5, 5, 15]) && bc.faces.length === 6 && bc.faces[0].region([10, 5, 5]) && !bc.faces[0].region([10, 15, 5]), 'a box cut-away removes what is inside; each of its faces is a rectangle of its plane');
    const cube = MN.newManual({ parts: { c: { name: 'Cube', mesh: FX.box(100, 100, 100) } }, instances: [{ id: 'i', part: 'c', name: 'Cube', matrix: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1] }] });
    const ring = MN.newManual({ parts: { r: { name: 'Tube', mesh: (() => { const o = FX.cylinder(30, 60, 24), i = FX.cylinder(20, 60, 24); const n = o.positions.length / 3; const I = Array.from(i.indices); for (let k = 0; k < I.length; k += 3) [I[k + 1], I[k + 2]] = [I[k + 2], I[k + 1]]; return { positions: Float32Array.from([...o.positions, ...i.positions]), indices: Uint32Array.from([...o.indices, ...I.map((x) => x + n)]) }; })() } }, instances: [{ id: 't', part: 'r', name: 'Tube', matrix: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1] }] });
    const caps = HL.capPolygons(ring.m, ring.meshes, MN.blankScene(MN.defaultCamera(null)), LK.cutsOf({ section: { n: [0, 1, 0], c: 0 } }));
    ok(caps.length === 1 && caps[0].polys.length === 1 && caps[0].polys[0].holes.length === 1, `a tube cut across: one ring, the outer wall's loop with the inner wall's as its hole (${caps[0]?.polys.length} outer, ${caps[0]?.polys[0]?.holes.length} hole)`);
    const nest = HL.nestLoops([[[0, 0], [10, 0], [10, 10], [0, 10]], [[3, 3], [6, 3], [6, 6], [3, 6]]]);
    ok(nest.length === 1 && nest[0].holes.length === 1, 'nested loops: a square with a square hole is one outer with one hole');
    const v = { ...MN.blankScene(CAM.fitCamera({ min: [-50, -50, -50], max: [50, 50, 50] }, { aspect: 1.5 })), look: { ...LK.defaultLook(), box: { min: [0, 0, 0], max: [60, 60, 60] } } };
    const art = LA.lineArt(cube.m, cube.meshes, v, { W: 150, H: 100 });
    ok(art.items.filter((i) => i.t === 'path' && i.stroke === '#1b1b1b' && i.width === 0.18 && !i.dash).length > 10, `a box cut-away in line art: the corner's three cut faces hatched (${art.items.filter((i) => i.t === 'path' && i.width === 0.18 && !i.dash).length} hatch lines)`);
    const mv = { ...v, look: { ...LK.defaultLook(), magnifier: { at: [1.2, 0.7], target: [0.75, 0.5], r: 0.2, zoom: 4, mode: 'zoom' } } };
    const z = LK.magnified(mv, mv.look, 1.5);
    ok(near(z.view.camera.height, v.camera.height * 2 * 0.2 / 4, 1e-9) && z.view.annots.length === 0, 'the lens\'s camera: 2r / zoom of the picture\'s height, no annotations inside');
    const art2 = LA.lineArt(cube.m, cube.meshes, mv, { W: 150, H: 100 });
    const lensG = art2.items.find((i) => i.t === 'group' && i.clip?.circle);
    ok(lensG && near(lensG.clip.circle[0], 120, 1e-6) && near(lensG.clip.circle[2], 20, 1e-6) && lensG.items.length > 3, 'the magnifier in line art: a group clipped to a 20 mm circle at the lens, with the zoomed drawing inside');
    const pdf = await (await import(DEV + 'illustrate/pdf.js')).toPdf([art2]);
    ok(pdf.bytes.length > 500, 'a PDF with a clipped lens writes');
    const doc = new MN.Doc(MN.readManual(MN.toJSON(cube.m, cube.meshes)));
    doc.edit('look', (m) => { m.scene = MN.blankScene(v.camera); m.scene.look = LK.readLook({ style: 'flat', section: { n: [0, 0, 1], c: 10 }, magnifier: mv.look.magnifier }); MN.addView(m, { from: { ...m.scene, id: 'x', name: 'Cut' } }); });
    const back = MN.readManual(doc.toJSON());
    ok(back.m.views[0].look.style === 'flat' && back.m.views[0].look.section.c === 10 && back.m.scene.look.magnifier.zoom === 4, 'a view\'s look saves and reads back');
    const bad = JSON.parse(doc.toJSON()); bad.views[0].look.style = 'neon';
    ok(code(() => MN.readManualObject(bad)) === 'bad_view', 'a bad look in a file → bad_view');
  }

  section('illustrate: instructions documents (instructions.js, TP.8)');
  {
    const IN = await import(DEV + 'illustrate/instructions.js');
    const PDF = await import(DEV + 'illustrate/pdf.js');
    const words = { page: (n, total) => `Page ${n} of ${total}`, step: (n) => `Step ${n}`, warning: 'Warning:', parts: 'Parts', tools: 'Tools', partsList: 'Parts list', coverLine: (s, p) => `${s} steps, ${p} parts` };
    const labels = (k) => ({ item: 'Item', qty: 'Qty', number: 'Part number', name: 'Name', material: 'Material', description: 'Description' })[k] || k;
    const doc = new MN.Doc(MN.readManual(MN.toJSON(made.m, made.meshes)));
    doc.edit('views', (m) => {
      const box = MN.sceneBox(m, doc.meshes, null);
      m.scene = MN.blankScene(CAM.fitCamera(box, { aspect: 1.6 }));
      MN.setInstState(m.scene, ['i4', 'i5'], { hide: true });
      MN.addView(m, { from: { ...m.scene, id: 'x' }, name: 'Posts on the plate' });
      MN.showAll(m, m.scene); m.scene.explode = { ref: 'v1', t: 1 };
      MN.addView(m, { from: { ...m.scene, id: 'x' }, name: 'Cap and pin' });
      m.instructions = IN.defaultInstructions(m);
      m.instructions.title = 'Bracket assembly'; m.instructions.subtitle = 'Instructions';
      m.instructions.steps[0].notes = 'Press both posts into the plate until they stop. The holes are a light press fit, so a few taps with a soft mallet are enough.';
      m.instructions.steps[0].warnings = ['Wear gloves: the plate edges are sharp.'];
      m.instructions.steps[0].tools = ['Soft mallet', 'Gloves'];
      m.instructions.steps[1].picture = 'shaded';
      m.instructions.template = IN.cleanTemplate({ paper: 'letter', accent: '#1F5FA8', footer: 'Example Co. — not for sale', logo: 'javascript:alert(1)' });
    });
    const ins = doc.m.instructions;
    ok(ins.steps.map((s) => s.title).join() === 'Posts on the plate,Cap and pin' && ins.template.accent === '#1f5fa8' && ins.template.logo === '', 'steps from the views in order; the template keeps its colour and drops a logo that is not a picture');
    const pg = IN.pages(doc.m, doc.meshes, { words, labels });
    ok(pg.length === 4 && near(pg[0].w, 215.9, 1e-6) && near(pg[0].h, 279.4, 1e-6), `pages: cover, two steps, the parts list (${pg.length}), Letter portrait`);
    const tx = (p) => p.items.filter((i) => i.t === 'text').map((i) => i.text);
    ok(tx(pg[1]).includes('Step 1') && tx(pg[1]).includes('Posts on the plate') && tx(pg[1]).includes('Page 2 of 4') && tx(pg[1]).some((x) => x.startsWith('Warning: Wear gloves')) && tx(pg[1]).some((x) => x.includes('Soft mallet')), 'step 1: its heading, page number, notes, the warning and the tools');
    ok(tx(pg[1]).includes('Post') && !tx(pg[1]).includes('Cap') && tx(pg[2]).includes('Cap'), 'each step lists only the parts its view shows');
    ok(tx(pg[3]).includes('Parts list') && ['BP-100', 'CP-1', 'PN-3', 'PS-20'].every((n) => tx(pg[3]).includes(n)), 'the parts-list page has every part');
    ok(pg[2].items.some((i) => i.t === 'group' && i.items.some((x) => x.t === 'path' && x.fill && x.fill !== '#ffffff')), 'step 2 is drawn shaded (its own picture setting)');
    const wr = IN.wrap('one two three four five six', 3, 20);
    ok(wr.length > 1, `wrap: ${wr.length} lines within 20 mm`);
    const pdf = await PDF.toPdf(pg, { title: ins.title });
    ok(/\/Count 4/.test(new TextDecoder('latin1').decode(pdf.bytes)), `the instructions as a four-page PDF (${Math.round(pdf.bytes.length / 1024)} KB)`);
    const h = IN.html(doc.m, doc.meshes, { words, labels, svgText: SVG.svgText });
    ok(h.startsWith('<!doctype html>') && (h.match(/<section class="step">/g) || []).length === 2 && h.includes('@page { size: letter portrait') && h.includes('<p class="warning"><strong>Warning:</strong>Wear gloves') && !/<script/i.test(h) && (h.match(/<svg /g) || []).length === 3, 'HTML: one page, two steps, print rules for Letter, the warning, three inline drawings, no script');
    doc.edit('evil', (m) => { m.instructions.steps[0].notes = '<img src=x onerror=alert(1)>'; m.instructions.title = 'A & B </title>'; });
    const h2 = IN.html(doc.m, doc.meshes, { words, labels, svgText: SVG.svgText });
    ok(!h2.includes('<img src=x') && h2.includes('&lt;img src=x onerror=alert(1)&gt;') && h2.includes('<title>A &amp; B &lt;/title&gt;</title>'), 'HTML: everything typed is escaped');
    const tplText = IN.templateText({ paper: 'a3', landscape: true, accent: '#00ff00', footer: 'F' });
    ok(IN.readTemplate(tplText).paper === 'a3' && IN.readTemplate(tplText).landscape === true && throws(() => IN.readTemplate('{"format":"other"}')), 'a template saves as its own file and reads back; another file is refused');
    const back = MN.readManual(doc.toJSON());
    ok(back.m.instructions.steps.length === 2 && back.m.instructions.steps[0].tools.join() === 'Soft mallet,Gloves', 'the instructions save with the manual');
    doc.edit('rm', (m) => MN.removeView(m, m.views[0].id));
    ok(doc.m.instructions.steps.length === 1, 'removing a view removes its step');
    const badI = JSON.parse(doc.toJSON()); badI.instructions.steps[0].view = 'v999';
    ok(code(() => MN.readManualObject(badI)) === 'bad_instructions', 'a step on a missing view → bad_instructions');
  }

  section('illustrate: update from the design (update.js, TP.10)');
  {
    const UP = await import(DEV + 'illustrate/update.js');
    const doc = new MN.Doc(MN.readManual(MN.toJSON(made.m, made.meshes)));
    let lab, gap;
    doc.edit('setup', (m) => {
      m.scene = MN.blankScene(CAM.fitCamera(MN.sceneBox(m, doc.meshes, null), { aspect: 1.5 }));
      for (const b of AN.autoBalloons(m, doc.meshes, m.scene, { aspect: 1.5 })) AN.addAnnotation(m, b, m.scene);
      lab = AN.addAnnotation(m, { kind: 'label', anchor: { inst: 'i4', p: [0, 3, 0] }, text: '{name}' }, m.scene);
      gap = AN.addAnnotation(m, { kind: 'measure', measure: { kind: 'linear', pts: [{ inst: 'i1', p: [0, 5, 0] }, { inst: 'i5', p: [0, 10, 0] }] } }, m.scene);
      MN.addView(m, { from: { ...m.scene, id: 'x' }, name: 'All' });
      MN.isolate(m, m.scene, ['i2', 'i3']);
      MN.addView(m, { from: { ...m.scene, id: 'x' }, name: 'Posts' });
    });
    const numbers0 = { ...doc.m.balloons.items };
    // the design changes: the pin is gone, one post moved 10 mm, the cap is bigger, a washer is new, the plate renamed
    const P2 = FX.product();
    P2.instances = P2.instances.filter((i) => i.id !== 'i5');
    P2.instances[2].matrix = [...P2.instances[2].matrix]; P2.instances[2].matrix[12] += 10;
    P2.parts.cap.mesh = FX.box(110, 6, 30);
    P2.parts.washer = { name: 'Washer', number: 'WS-6', mesh: FX.cylinder(8, 2, 16) };
    P2.instances.push({ id: 'i6', part: 'washer', name: 'Washer', matrix: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 51, 0, 1] });
    P2.instances[0].name = 'Base plate (v2)';
    P2.explodes[0].steps = P2.explodes[0].steps.map((s) => ({ ...s, insts: s.insts.filter((x) => x !== 'i5') })).filter((s) => s.insts.length);
    const fresh = MN.newManual({ ...P2, source: { kind: 'partcraft-assembly', name: 'Bracket v2', sha256: 'd'.repeat(64) } });
    const plan = UP.planUpdate(doc.m, doc.meshes, fresh);
    ok(plan.moved.map((x) => x.id).join() === 'i3' && near(plan.moved[0].dist, 10, 1e-6) && plan.reshaped.map((x) => x.id).join() === 'i4' && plan.added.map((x) => x.id).join() === 'i6' && plan.removed.map((x) => x.id).join() === 'i5' && plan.renamed[0]?.to === 'Base plate (v2)', 'the report: one moved (10 mm), one reshaped, one added, one removed, one renamed');
    ok(plan.removed[0].annotations.map((a) => a.id).sort().join() === [gap.id, doc.m.annotations.find((a) => a.kind === 'balloon' && a.pid === 'pin').id].sort().join(), 'the removed pin\'s annotations are named in the report (its balloon and the measurement to it)');
    const steps = doc.undoStack.length;
    const rep = doc.edit('Update', (m, d) => UP.applyUpdate(m, d, fresh));
    ok(doc.undoStack.length === steps + 1 && rep.removed.length === 1, 'Update is one undo step');
    ok(doc.m.instances.length === 5 && doc.m.source.sha256 === 'd'.repeat(64) && doc.meshes.get('cap').positions[3] === 55, 'the new product is in: the washer, the bigger cap, the new source');
    ok(['plate', 'post', 'cap'].every((p) => doc.m.balloons.items[p] === numbers0[p]) && doc.m.balloons.items.washer === undefined && doc.m.balloons.next === 5, 'balloon numbers stay with their parts; the new washer has none; no number is given again');
    ok(doc.m.annotations.some((a) => a.id === lab.id) && !doc.m.annotations.some((a) => a.id === gap.id), 'the label on the cap stays; the measurement to the removed pin leaves (and was listed)');
    const posts = doc.m.views.find((v) => v.name === 'Posts');
    ok(!MN.instState(posts, 'i6').hide && MN.instState(posts, 'i1').hide && !('i5' in posts.insts), 'the washer shows in every view (even one that isolated the posts); the pin\'s view entries are gone');
    const back = MN.readManual(doc.toJSON());
    ok(back.m.instances.length === 5 && back.m.annotations.length === doc.m.annotations.length, 'the updated manual saves and reads back');
    doc.undo();
    ok(doc.m.instances.some((i) => i.id === 'i5') && doc.meshes.get('cap').positions[3] === 50 && doc.m.annotations.some((a) => a.id === gap.id), 'undo brings the old product, shapes and annotations back');
    // a part whose id changed: the balloon follows it through the matched instance
    const P3 = FX.product(); P3.parts.capB = P3.parts.cap; delete P3.parts.cap; P3.instances[3].part = 'capB';
    doc.edit('Update 2', (m, d) => UP.applyUpdate(m, d, MN.newManual(P3)));
    ok(doc.m.balloons.items.capB === numbers0.cap && doc.m.annotations.some((a) => a.kind === 'balloon' && a.pid === 'capB'), 'a part renamed in the source keeps its balloon number and its balloon');
    ok(UP.planUpdate(doc.m, doc.meshes, MN.newManual(P3)).same, 'updating again from the same design: nothing to do');
  }

  section('illustrate: animation on AN.1\'s model (timeline.js + a byte-identical anim.js, TP.6)');
  {
    const TL = await import(DEV + 'illustrate/timeline.js');
    const UP = await import(DEV + 'illustrate/update.js');
    const { execFileSync } = await import('node:child_process');
    let same = true;
    try { execFileSync('node', [path.join(HERE, 'illustrate-anim-sync.mjs'), '--check'], { stdio: 'pipe' }); } catch { same = false; }
    ok(same, 'illustrate/anim.js, video.js, webm.js, mp4.js are byte-identical copies of ModelCraft\'s (no fork)');
    const doc = new MN.Doc(MN.readManual(MN.toJSON(made.m, made.meshes)));
    const cam0 = CAM.fitCamera(MN.sceneBox(doc.m, doc.meshes, null), { aspect: 1.5 });
    doc.edit('keys', (m) => {
      m.scene = MN.blankScene(cam0);
      TL.keyScene(m, m.scene, 0);
      const later = structuredClone(m.scene);
      MN.moveInstances(later, ['i1'], [0, -40, 0]);
      MN.setInstState(later, ['i5'], { hide: true });
      MN.setInstState(later, ['i4'], { color: '#ff0000' });
      TL.keyParts(m, later, 2, ['i1', 'i4', 'i5']);
    });
    ok(doc.m.anim.format === 'cadcraft-anim' && Object.keys(doc.m.animIds.of).length === 5 && doc.m.anim.objects.length === 5, 'keys are a cadcraft-anim: one numbered track per part');
    const f0 = TL.frameAt(doc.m, 0, doc.m.scene), f1 = TL.frameAt(doc.m, 1, doc.m.scene), f2 = TL.frameAt(doc.m, 2, doc.m.scene);
    ok(near(f0.world.get('i1')[13], 5, 1e-6) && near(f2.world.get('i1')[13], -35, 1e-6) && f1.world.get('i1')[13] < 5 && f1.world.get('i1')[13] > -35, `a moved part goes from its place to the key (y at 1 s: ${f1.world.get('i1')[13].toFixed(2)})`);
    ok(!f1.state('i5').hide && f2.state('i5').hide && f2.state('i4').color === '#ff0000' && f1.state('i4').color !== '#ff0000', 'visibility is held until its key; colour fades to the key');
    // the steps of the exploded view
    doc.edit('explode', (m) => { m.scene.explode = { ref: 'v1', t: 1 }; TL.recordExplode(m, m.scene, { start: 3, step: 1 }); });
    const pin = doc.m.anim.objects.find((o) => o.path[0] === doc.m.animIds.of.i5);
    ok(pin.keys.filter((k) => k.t >= 3).length === 3, 'record the exploded view: one key per step (2 steps → 3 keys from 3 s)');
    const half = MN.worldOf(doc.m, { ...doc.m.scene, explode: { ref: 'v1', t: 0.5 } }).get('i5');
    ok(near(TL.frameAt(doc.m, 4, doc.m.scene).world.get('i5')[13], half[13], 1e-6), 'at the first step\'s key the pin is where explode.js puts it halfway');
    // views as camera stops
    doc.edit('views', (m) => {
      const a = MN.addView(m, { from: { ...m.scene, id: 'x', explode: null }, name: 'Front' }); a.camera = MN.readCamera(CAM.fitCamera(MN.sceneBox(m, doc.meshes, null), { dir: [0, 0, 1], aspect: 1.5 }));
      MN.addView(m, { from: { ...m.scene, id: 'x' }, name: 'Exploded' });
      TL.viewsAsStops(m, m.views.map((v) => v.id), { start: 6, move: 2, hold: 1 });
    });
    const front = doc.m.views[0].camera;
    const atFront = TL.frameAt(doc.m, 6.5, doc.m.scene).camera;
    ok(doc.m.anim.camera.length === 5 && near(atFront.pos[2] - atFront.target[2], front.pos[2] - front.target[2], 1e-3) && near(atFront.height, front.height, 1e-3), 'views as camera stops: the camera holds each view (keys at 6, 7, 9, 10 s)');
    const back = MN.readManual(doc.toJSON());
    ok(JSON.stringify(back.m.anim) === JSON.stringify(doc.m.anim) && back.m.animIds.next === doc.m.animIds.next, 'the animation saves and reads back as it was');
    const bad = JSON.parse(doc.toJSON()); bad.anim.objects[0].path = [999];
    ok(code(() => MN.readManualObject(bad)) === 'bad_anim', 'a track on an unknown number → bad_anim');
    const bad2 = JSON.parse(doc.toJSON()); bad2.animIds.of.i99 = 77;
    ok(code(() => MN.readManualObject(bad2)) === 'bad_anim', 'a number for a missing instance → bad_anim');
    // Update: the pin is removed with its keys, listed
    const P4 = FX.product(); P4.instances = P4.instances.filter((i) => i.id !== 'i5'); P4.explodes[0].steps = [{ insts: ['i4'], dir: [0, 1, 0], dist: 30 }];
    const plan = UP.planUpdate(doc.m, doc.meshes, MN.newManual(P4));
    ok(plan.removed[0].keys === TL.keysOn(doc.m, 'i5') && plan.removed[0].keys > 5, `Update lists the removed pin's animation keys (${plan.removed[0].keys})`);
    const n5 = doc.m.animIds.of.i5;
    doc.edit('up', (m, d) => UP.applyUpdate(m, d, MN.newManual(P4)));
    ok(!doc.m.anim.objects.some((o) => o.path[0] === n5) && doc.m.animIds.of.i5 === undefined && doc.m.animIds.next > n5, 'its tracks go; its number is not given again');
    ok(MN.readManual(doc.toJSON()).m.anim.objects.length === 4, 'and the manual still reads');
  }

  section('illustrate: the interactive 3D file (viewer-data.js, TP.9)');
  {
    const VD = await import(DEV + 'illustrate/viewer-data.js');
    const doc = new MN.Doc(MN.readManual(MN.toJSON(made.m, made.meshes)));
    doc.edit('views', (m) => {
      m.scene = MN.blankScene(CAM.fitCamera(MN.sceneBox(m, doc.meshes, null), { aspect: 1.5 }));
      MN.addView(m, { from: { ...m.scene, id: 'x' }, name: 'All' });
      m.scene.explode = { ref: 'v1', t: 1 }; MN.setInstState(m.scene, ['i1'], { ghost: true });
      MN.addView(m, { from: { ...m.scene, id: 'x' }, name: 'Exploded </script><script>alert(1)</script>' });
    });
    const data = VD.viewerData(doc.m, doc.meshes, { words: { views: 'Views' }, labels: (k) => k });
    ok(data.format === 'partcraft-manual-viewer' && data.parts.length === 4 && data.instances.length === 5 && data.views.length === 2, 'the file\'s data: 4 parts once, 5 placed, 2 views');
    ok(Object.keys(data.views[0].world).length === 0 && Object.keys(data.views[1].world).sort().join() === 'i4,i5' && data.views[1].state.i1.o === 0.22, 'a view carries only what it changes: the exploded parts\' places, the ghost');
    ok(data.list.rows.find((r) => r.cells[3] === 'Post').insts.join() === 'i2,i3', 'the parts list knows each row\'s parts (to light them up)');
    const re = VD.rewriteImports("import * as T from 'three';\nimport { x } from \"./anim.js\";\nexport { y } from './three.core.js';\nconst z = await import('three');\nimport {\n a } from 'three';", { three: '@il/three', './anim.js': '@il/anim', './three.core.js': '@il/core' });
    ok(re === "import * as T from '@il/three';\nimport { x } from \"@il/anim\";\nexport { y } from '@il/core';\nconst z = await import('@il/three');\nimport {\n a } from '@il/three';", 'import, export-from and dynamic imports are renamed to the bundle\'s keys');
    const html = VD.viewerHtml({ title: 'A & <B>', modules: [{ key: '@il/app', source: 'export const s = "</script>";' }], data, licence: 'The MIT License\n\nCopyright © 2010-2025 three.js authors' });
    ok(html.includes("Content-Security-Policy\" content=\"default-src 'none'") && !/https?:\/\//.test(html.replace(/http-equiv/g, '')), 'the file forbids every request and names no web address');
    ok((html.match(/<\/script>/g) || []).length === 4 && html.includes('<title>A &amp; &lt;B&gt;</title>') && html.includes('\\u003c/script>'), 'nothing in the data or the modules can close a script element early');
    ok(JSON.parse(html.match(/<script type="application\/json" id="il-data">([\s\S]*?)<\/script>/)[1]).views[1].name.startsWith('Exploded </script>'), 'the data reads back whole from the page');
  }

  section('illustrate: other files keep their tree and names (import.js, TP.2)');
  {
    const IM = await import(DEV + 'illustrate/import.js');
    const icode = async (fn) => { try { await fn(); return 'none'; } catch (e) { return e instanceof IM.ImportError ? e.code : 'other:' + e.name + ': ' + e.message; } };
    const T = (x, y, z) => [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1];
    const Ry90 = [0, 0, -1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1];
    // glTF: a group with two posts sharing one mesh, a plate, and a second mesh that is a copy of the post's geometry
    const post = FX.cylinder(6, 40, 16), plate = FX.box(120, 10, 80);
    const glb = FX.gltf([{ name: 'Post', mesh: post }, { name: 'Plate', mesh: plate }, { name: 'Post copy', mesh: post }], [
      { name: 'Plate', mesh: 1, t: [0, 0.005, 0] },
      { name: 'Posts', t: [0, 0.03, 0], children: [{ name: 'Post A', mesh: 0, t: [-0.04, 0, 0] }, { name: 'Post B', mesh: 0, t: [0.04, 0, 0] }, { name: 'Post C', mesh: 2, t: [0, 0, 0.02], r: [0, Math.SQRT1_2, 0, Math.SQRT1_2] }] },
    ]);
    const g = await IM.readProduct(glb, 'Bracket.glb');
    ok(g.kind === 'gltf' && g.parts.size === 3 && g.instances.length === 4 && g.groups.length === 1 && g.groups[0].name === 'Posts', `GLB: 3 meshes, 4 placed, the group "Posts" (${g.parts.size}/${g.instances.length}/${g.groups.map((x) => x.name)})`);
    const pa = g.instances.find((i) => i.name === 'Post A');
    ok(pa.group === g.groups[0].id && near(pa.matrix[12], -40, 1e-6) && near(pa.matrix[13], 30, 1e-6), 'GLB: metres become millimetres; a child sits where its parent puts it');
    ok(near(g.parts.get(pa.part).mesh.positions[1], -20, 1e-4), 'GLB: the mesh itself in millimetres');
    const folded = IM.sameParts(g);
    ok(folded.folded === 1 && folded.product.parts.size === 2, `sameParts: the copied mesh is folded into the post (${folded.folded} folded, ${folded.product.parts.size} parts left)`);
    const pc = folded.product.instances.find((i) => i.name === 'Post C');
    const pcPoint = M4.apply(pc.matrix, [6, 0, 0]);
    ok(pc.part === pa.part && near(pcPoint[0], 0, 1e-4) && near(pcPoint[2], 20 - 6, 1e-4), 'the folded copy keeps its place and turn (its matrix takes the shared mesh there)');
    const emb = await IM.readProduct(FX.gltf([{ name: 'Post', mesh: post }], [{ name: 'P', mesh: 0 }], { embedded: true }), 'post.gltf');
    ok(emb.instances.length === 1 && emb.parts.get('m0').mesh.indices.length === post.indices.length, '.gltf with a data: buffer');
    const made = IM.productToManual(folded.product, { sourceName: 'Bracket.glb', sha: 'c'.repeat(64) });
    const back = MN.readManual(MN.toJSON(made.m, made.meshes));
    ok(back.m.source.kind === 'gltf' && back.m.instances.length === 4 && back.m.groups.length === 1, 'a manual from the glTF saves and reads back');
    // OBJ: two cubes at different places (one part, two copies) and a pin
    const cube = FX.box(10, 10, 10), pin = FX.cylinder(1, 6, 6);
    const o = await IM.readProduct(FX.obj([{ name: 'Cube 1', mesh: cube, at: [0, 0, 0] }, { name: 'Cube 2', mesh: cube, at: [30, 0, 0] }, { name: 'Pin', mesh: pin, at: [0, 20, 0] }]), 'cubes.obj', { unit: 'cm' });
    ok(o.instances.map((i) => i.name).join() === 'Cube 1,Cube 2,Pin' && near(o.parts.get('o2').mesh.positions[0], 250, 1e-4), 'OBJ: one part per "o", names kept, cm → mm');
    const of = IM.sameParts(o);
    ok(of.product.parts.size === 2 && of.product.parts.get('o1').name === 'Cube' && near(of.product.instances[1].matrix[12], 300, 1e-4), 'OBJ: the two cubes are one part "Cube" (quantity 2); the second is moved 300 mm');
    // STL: one binary STL of two brackets (one turned) and a block: split into shells, the copies recognised
    const s = await IM.readProduct(FX.stl([{ mesh: post, m: T(0, 0, 0) }, { mesh: post, m: M4.matMul(T(50, 0, 0), Ry90) }, { mesh: plate, m: T(0, -30, 0) }]), 'two.stl', { up: 'y' });
    ok(s.parts.size === 3 && s.groups.length === 1 && s.groups[0].name === 'Two brackets', `STL: three shells under the file's own name (${s.parts.size}, ${s.groups.map((x) => x.name)})`);
    const sf = IM.sameParts(s);
    ok(sf.folded === 1 && sf.product.parts.size === 2, 'STL: the turned copy is the same part');
    const sz = await IM.readProduct(FX.stl([{ mesh: FX.box(1, 2, 3), m: T(0, 0, 0) }]), 'z.stl');
    const zb = M4.boxOf(sz.parts.get('p1').mesh.positions);
    ok(near(zb.max[1] - zb.min[1], 3, 1e-5) && near(zb.max[2] - zb.min[2], 2, 1e-5), 'STL is Z up by default: its Z becomes the view\'s Y');
    // 3MF: the block placed twice (one moved, in inches) and a block-with-pegs (a group with three parts)
    const t3 = await IM.readProduct(FX.threeMf({ unit: 'inch', items: [{ id: 1 }, { id: 1, transform: '1 0 0 0 1 0 0 0 1 2 0 0' }, { id: 3, transform: '1 0 0 0 1 0 0 0 1 0 4 0' }] }), 'blocks.3mf');
    ok(t3.parts.size === 2 && t3.instances.length === 5 && t3.groups.length === 1 && t3.groups[0].name === 'Block with pegs', `3MF: 2 objects, 5 placed, one group (${t3.parts.size}/${t3.instances.length}/${t3.groups.length})`);
    const b2 = t3.instances[1];
    ok(near(b2.matrix[12], 50.8, 1e-4) && near(t3.parts.get('b1').mesh.positions[0], -5 * 25.4, 1e-3), '3MF: inches → mm (meshes and moves)');
    const peg = t3.instances.find((i) => i.id === 'b3.2');
    ok(peg && near(peg.matrix[13], 19 * 25.4, 1e-3) && near(peg.matrix[14], -4 * 25.4, 1e-3), '3MF: a component\'s place inside its object, Z up turned to Y up');
    // refusals: only ImportError comes out
    ok(await icode(() => IM.readProduct(new Uint8Array([1, 2, 3]), 'x.dwg')) === 'unknown_kind', 'an unknown kind → unknown_kind');
    ok(await icode(() => IM.readProduct(glb.slice(0, glb.length - 40), 'cut.glb')) === 'cut_off', 'a cut-off GLB → cut_off');
    const ext = JSON.parse(new TextDecoder().decode(FX.gltf([{ name: 'P', mesh: post }], [{ name: 'P', mesh: 0 }], { embedded: true })));
    ext.buffers[0].uri = 'post.bin';
    ok(await icode(() => IM.readProduct(new TextEncoder().encode(JSON.stringify(ext)), 'x.gltf')) === 'gltf_external', 'a .gltf with its buffer in another file → gltf_external (says to use .glb)');
    const badIdx = JSON.parse(new TextDecoder().decode(FX.gltf([{ name: 'P', mesh: FX.box(1, 1, 1) }], [{ name: 'P', mesh: 0 }], { embedded: true })));
    badIdx.accessors[1].count = 999;
    ok(await icode(() => IM.readProduct(new TextEncoder().encode(JSON.stringify(badIdx)), 'x.gltf')) === 'cut_off', 'an accessor past its buffer → cut_off');
    const loop = JSON.parse(new TextDecoder().decode(FX.gltf([{ name: 'P', mesh: post }], [{ name: 'A', children: [{ name: 'B', mesh: 0 }] }], { embedded: true })));
    loop.nodes[1].children = [0];
    ok(await icode(() => IM.readProduct(new TextEncoder().encode(JSON.stringify(loop)), 'x.gltf')) === 'gltf_bad', 'a node loop → gltf_bad');
    ok(await icode(() => IM.readProduct(new TextEncoder().encode('v 0 0 0\nf 1 2 3\n'), 'x.obj')) === 'no_faces', 'OBJ faces on missing corners → no_faces');
    // truncation fuzz over every format
    const files = [['Bracket.glb', glb], ['cubes.obj', FX.obj([{ name: 'A', mesh: cube, at: [0, 0, 0] }])], ['two.stl', FX.stl([{ mesh: post, m: T(0, 0, 0) }])], ['blocks.3mf', FX.threeMf({ items: [{ id: 3 }] })]];
    for (const [name, bytes] of files) {
      const odd = [];
      for (let i = 1; i <= 30; i++) { const cut = Math.floor(bytes.length * i / 31); const r = await icode(() => IM.readProduct(bytes.slice(0, cut), name)); if (r.startsWith('other')) odd.push(cut + ': ' + r); }
      ok(!odd.length, `${name}: 30 cuts, only ImportError or a smaller model` + (odd.length ? ' — ' + odd.slice(0, 2).join('; ') : ''));
    }
  }

  section('illustrate: the workspace (ws-illustrate.js) and a manual from a real PartCraft assembly');
  {
    const WS = await import(DEV + 'workspaces.js');
    const W = await import(DEV + 'ws-illustrate.js');
    const ws = WS.getWorkspace('illustrate');
    ok(ws && ws.label === 'Illustrate' && ws.groups.length === 4 && ws.groups.every((g) => g.items.every((i) => !i.label.startsWith('illustrate.') && !i.title.startsWith('illustrate.'))), 'registered as "Illustrate"; every label and title comes from the language file');
    ok(ws.groups.flatMap((g) => g.items).length <= 10, 'at most 10 toolbar buttons (the 1440 px budget)');
    const sel = []; const host = { status: (m) => sel.push(m) };
    ok(ws.toolState('illustrate-save', host).ok === false && ws.toolState('illustrate-new', host).ok === true, 'Save is off until a manual is open; New is on');
    ok(ws.command('view-fit', host) === false && ws.command('undo', host) === false, 'with no manual open, shared commands go on to Design');
    if (!M) { const { default: Module } = await import(path.join(HERE, '../../public_html/assets/vendor/manifold-3d/current/manifold.js')); M = await Module(); M.setup(); }
    const PF = await import(path.join(HERE, 'fixtures.mjs'));
    const A = await import(DEV + 'assembly.js');
    const K = await import(DEV + 'kernel.js');
    const EXP = await import(DEV + 'explode.js');
    const flange = PF.flange({ resolution: 24 }).part;
    const asm = A.newAssembly('Two flanges');
    A.insertPart(asm, flange);
    const pid = asm.instances[0].part;
    asm.parts[pid].number = 'FL-80'; asm.parts[pid].material = { name: 'Steel', density: 7.85 };
    asm.instances.push({ id: 'i' + asm.seq++, part: pid, name: 'Flange <2>', place: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 120, 0, 1] });
    const ev = EXP.newView(asm, 'Apart');
    EXP.addStep(asm, ev, [asm.instances[1].id], [0, 1, 0], 90);
    const builds = new Map([[pid, K.regenerate(flange, M, { checkpoints: false })]]);
    const world = A.placeAll(asm, builds).world;
    const made = W.manualFromAssembly(asm, builds, world, { sourceName: 'Two flanges.partcraft-asm.json', sha: 'b'.repeat(64) });
    ok(Object.keys(made.m.parts).length === 1 && made.m.instances.length === 2 && made.m.parts[pid].number === 'FL-80' && made.m.parts[pid].density === 7.85, 'one part, two placed, part number and material from bom.js rows');
    ok(made.m.explodes.length === 1 && made.m.explodes[0].steps[0]?.dist === 90 && made.m.source.assembly.format === 'partcraft-assembly', 'the exploded view and the assembly itself come along (for Update)');
    const back = MN.readManual(MN.toJSON(made.m, made.meshes));
    ok(back.meshes.get(pid).indices.length === builds.get(pid).mesh.indices.length && A.readAssembly(JSON.stringify(back.m.source.assembly)).instances.length === 2, 'saved and read back: the mesh and the embedded assembly are whole');
    const vol = MN.meshStats(back.meshes.get(pid)).volume;
    ok(Math.abs(vol - builds.get(pid).stats.volume) / vol < 1e-4, `the mesh in the manual has the part's volume (${vol.toFixed(0)} mm³)`);
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const VERBOSE = process.argv.includes('--verbose');
  let pass = 0, fail = 0;
  const ok = (c, m) => { if (c) { pass++; if (VERBOSE) console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };
  const section = (t) => console.log('\n== ' + t);
  await runIllustrateTests({ ok, section });
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}
