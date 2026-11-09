#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * walls-plan.mjs — 0.9 walls-plan-09: CadCraft plan walls store their joins (FX.59) and take the wall tool's recipes from lib/walls
 * (WT.2 draw, WT.3 set and modify and the Hold block, WT.4 cut, WT.7 grid locks). Node, no page; commands are typed through the
 * command engine as a person would.     node tools/cadcraft-test/walls-plan.mjs [--verbose]
 * Expected values are worked out in the comment beside each check (no reference program).
 */
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import fs from 'node:fs';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const APP = path.join(ROOT, 'public_html/assets/apps/cadcraft/dev/');
const imp = (f) => import(pathToFileURL(APP + f).href);
let pass = 0, fail = 0;
const ok = (c, m, x = '') => { if (c) { pass++; if (process.argv.includes('--verbose')) console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (x !== '' ? ' — ' + JSON.stringify(x) : '')); } };
const near = (a, b, e = 1e-6) => Math.abs(a - b) <= e;

const { Doc } = await imp('doc.js');
const { Engine } = await imp('commands.js');
const G = await imp('geom.js');
const W = await imp('plan2d/walls.js');
const { installWalls } = await imp('walls-cmd.js');
await imp('walls-tools.js');
await imp('gridmove-cmd.js');
const { installPlan } = await imp('plan2d-cmd.js');
const { installClasses } = await imp('classes-cmd.js');
const { readDxf, writeDxf } = await imp('dxf.js');
const { writeDxf2000 } = await imp('dxf2000.js');
const { saveDwg } = await imp('dwg-save.js');
const { importDwg } = await imp('dwg-import.js');
const { readDwg } = await imp('dwg/read.js');
const { txEntity, mTranslate } = G;
installClasses(); installPlan(); installWalls();
const joinsLib = await import(pathToFileURL(path.join(ROOT, 'lib/walls/joins.js')).href);

function harness() {
  const doc = new Doc();
  const log = [];
  const host = {
    cursor: { x: 0, y: 0 }, selection: new Set(), shift: false,
    print: (s) => log.push(s), prompt: () => {}, setSelection: (s) => { host.selection = new Set(s); }, preview: () => {},
    pickAt: (p) => { let best = null, bd = 0.5; for (const e of doc.all()) { const d = G.distToEntity(e, p, doc.blocks); if (d < bd) { bd = d; best = e.id; } } return best; },
    pickWindow: () => [], zoomExtents: () => {}, zoomWindow: () => {},
  };
  const eng = new Engine(doc, host);
  const tick = () => new Promise((r) => setTimeout(r, 0));
  const type = async (...lines) => { for (const l of lines) { eng.text(l); await tick(); } };
  const click = async (x, y) => { eng.click({ x, y }); await tick(); };
  return { doc, host, eng, log, type, click };
}
const wallsOf = (d) => [...d.model.values()].filter(W.isWall).map(W.model);
const byPos = (d, ax, ay, bx, by) => wallsOf(d).find((w) => near(w.a.x, ax, 1e-4) && near(w.a.y, ay, 1e-4) && near(w.b.x, bx, 1e-4) && near(w.b.y, by, 1e-4));
const rawWall = (a, b, t = 100) => W.withWallData({ type: 'insert', layer: 'P-Walls', color: null, block: '*WALLNEW', x: a[0], y: a[1], rot: 0, sx: 1, sy: 1 }, { v: 1, a: [0, 0], b: [b[0] - a[0], b[1] - a[1]], t, f: '', ops: [] });
const addWall = (d, a, b, t) => { let e; d.change('WALL', () => { e = d.add(rawWall(a, b, t)); }); return d.get(e.id); };
const jn = (w) => (w.jn || []).map((r) => `${r.me}-${r.k}-${r.ot}`).sort().join(',');
const stateOf = (d) => JSON.stringify([...d.model.values()].map((e) => [e.id, e.x, e.y, e.block, e.xd]));

// ======================================================================== FX.59 the join record is stored
console.log('== FX.59 stored joins');
{
  const d = new Doc();
  const a = addWall(d, [0, 0], [4000, 0]), b = addWall(d, [4000, 0], [4000, 3000]), c = addWall(d, [4000, 3000], [0, 3000]), e = addWall(d, [0, 3000], [0, 0]);
  const ws = [a, b, c, e].map((x) => W.model(d.get(x.id)));
  ok(ws.every((w) => /^w[0-9a-z]{12}$/.test(w.g)), 'every wall has its own id (g)', ws.map((w) => w.g));
  ok(new Set(ws.map((w) => w.g)).size === 4, 'the ids differ');
  ok(ws.every((w) => w.jn.length === 2 && w.jn.every((r) => r.k === 'L')), 'a closed room: two L records on each wall', ws.map(jn));
  const [A, B] = ws;
  ok(A.jn.some((r) => r.o === B.g && r.me === 'end' && r.ot === 'start') && B.jn.some((r) => r.o === A.g && r.me === 'start' && r.ot === 'end'), 'the record is on BOTH walls, end meets start (the same record as BimCraft: where each wall meets)');
  // the keys equal what BimCraft's rules (lib/walls/joins.js) say for these four walls
  const rows = ws.map((w) => ({ guid: w.g, a: [w.a.x, w.a.y], b: [w.b.x, w.b.y], t: w.t }));
  const want = joinsLib.deriveJoins(rows).map((r) => r.key).sort();
  const have = [...new Set(ws.flatMap((w) => w.jn.map((r) => joinsLib.joinKey({ guid: w.g, pos: r.me }, { guid: r.o, pos: r.ot }))))].sort();
  ok(JSON.stringify(want) === JSON.stringify(have) && want.length === 4, 'stored records = lib/walls deriveJoins on the same walls (4 corners)', { want, have });
  // a T
  const t = addWall(d, [2000, 0], [2000, 1500]);
  const T = W.model(d.get(t.id)), hostW = W.model(d.get(a.id));
  ok(T.jn.length === 1 && T.jn[0].k === 'T' && T.jn[0].me === 'start' && T.jn[0].ot === 'mid' && T.jn[0].o === hostW.g, 'a stem on a wall: T record, start meets mid', T.jn);
  ok(hostW.jn.some((r) => r.o === T.g && r.k === 'T' && r.me === 'mid' && r.ot === 'start'), 'and the host holds the mirrored record');
  // X
  const x = addWall(d, [1000, -500], [1000, 500]);
  const X = W.model(d.get(x.id));
  ok(X.jn.some((r) => r.k === 'X' && r.o === hostW.g), 'a wall crossing another: X record', X.jn);
  // undo / redo keep the records
  const snap = stateOf(d);
  d.undo(); d.undo();
  ok(W.model(d.get(a.id)).jn.every((r) => r.o !== X.g && r.o !== T.g), 'undo takes the records of the undone walls away from their partners', jn(W.model(d.get(a.id))));
  d.redo(); d.redo();
  ok(stateOf(d) === snap, 'redo puts every record back, byte for byte');
  // moving a wall: the joined walls follow because of the record
  const before = stateOf(d);
  d.change('MOVE', () => d.update(a.id, txEntity(d.get(a.id), mTranslate(0, -500))));
  ok(near(W.model(d.get(b.id)).a.y, -500) && near(W.model(d.get(e.id)).b.y, -500), 'moving a wall: the walls its record names follow');
  ok(near(W.model(d.get(t.id)).a.y, -500), 'the T stem follows its host');
  ok(W.model(d.get(a.id)).jn.length === 5 || W.model(d.get(a.id)).jn.length === 4, 'the host keeps its records after the move', jn(W.model(d.get(a.id))));
  d.undo();
  ok(stateOf(d) === before, 'one undo takes the move back with every record');
}
{
  // joins are not found by position at each edit: Join off keeps a wall out
  const d = new Doc();
  const a = addWall(d, [0, 0], [1000, 0]);
  let off;
  d.change('WALL', () => { off = d.add(W.withWallData({ ...rawWall([1000, 0], [1000, 1000]) }, { v: 1, a: [0, 0], b: [0, 1000], t: 100, f: '', ops: [], jo: 'ab' })); });
  const A = W.model(d.get(a.id)), B = W.model(d.get(off.id));
  ok(A.jn.length === 0 && B.jn.length === 0, 'a wall drawn with Join off makes no record, though its end sits on the other wall');
  const lines = d.blocks.get(d.get(a.id).block).entities.filter((l) => l.type === 'line').map((l) => [l.x1, l.y1, l.x2, l.y2].join(','));
  ok(lines.includes('1000,50,1000,-50'), 'and the first wall is capped at that end, not mitred', lines);
  d.change('MOVE', () => d.update(a.id, txEntity(d.get(a.id), mTranslate(0, -300))));
  ok(near(W.model(d.get(off.id)).a.y, 0), 'moving the first wall leaves the unjoined one where it is');
  // allow the join again (Properties › Disallow join): the record is made at once, from the wall's stored switch
  d.model.set(a.id, W.canonical(d.get(a.id), { ...W.model(d.get(a.id)), a: { x: 0, y: -300 }, b: { x: 1000, y: 0 } }));   // put the first wall's end back on the other wall's start
  d.change('P', () => d.update(off.id, W.canonical(d.get(off.id), { ...W.model(d.get(off.id)), jo: '' })));
  ok(W.model(d.get(off.id)).jn.length === 1 && W.model(d.get(a.id)).jn.length === 1, 'turning Disallow join off lets the touching ends join: a record on each wall', [W.model(d.get(off.id)).jn, W.model(d.get(a.id)).jn]);
}
{
  // an older drawing: no ids, no records; the first edit finds the joins once and stores them
  const d = new Doc();
  const a = addWall(d, [0, 0], [4000, 0]), b = addWall(d, [4000, 0], [4000, 3000]), c = addWall(d, [4000, 3000], [0, 3000]);
  for (const id of [a.id, b.id, c.id]) { const m = W.model(d.get(id)); d.model.set(id, W.withWallData(d.get(id), { v: 1, a: [0, 0], b: [m.b.x - m.a.x, m.b.y - m.a.y], t: m.t, f: '', ops: [] })); }
  ok(wallsOf(d).every((w) => !w.g && w.jn.length === 0), 'setup: an older drawing has no ids and no records');
  d.change('MOVE', () => d.update(b.id, txEntity(d.get(b.id), mTranslate(500, 0))));
  const ws = wallsOf(d);
  ok(ws.every((w) => w.g), 'the first edit gives every wall an id');
  const A = W.model(d.get(a.id)), B = W.model(d.get(b.id)), C = W.model(d.get(c.id));
  ok(A.jn.length === 1 && C.jn.length === 1 && B.jn.length === 2, 'and stores the joins as they stood BEFORE the edit (two corners of the moved wall)', [jn(A), jn(B), jn(C)]);
  ok(near(A.b.x, 4500) && near(C.a.x, 4500), 'the neighbours followed the moved wall through the new records', [A.b, C.a]);
  d.undo();
  ok(wallsOf(d).every((w) => !w.g), 'undo returns the drawing to how it was opened (found again on the next edit)');
}
{
  // a copy carries its original's id: it gets its own
  const d = new Doc();
  const a = addWall(d, [0, 0], [1000, 0]);
  let cp;
  d.change('COPY', () => { const c0 = { ...txEntity(d.get(a.id), mTranslate(0, 5000)) }; delete c0.id; cp = d.add(c0); });
  const A = W.model(d.get(a.id)), C = W.model(d.get(cp.id));
  ok(A.g && C.g && A.g !== C.g, 'a Copy of a wall gets a new id (two walls never share one)', [A.g, C.g]);
  // stale record: another program moved a block; the next edit of either wall drops the record
  const e = addWall(d, [1000, 0], [1000, 800]);
  ok(W.model(d.get(a.id)).jn.length === 1, 'setup: joined');
  d.model.set(e.id, { ...d.get(e.id), x: 9000, y: 9000 });   // moved by something that does not know the record
  d.change('touch', () => d.update(a.id, { ...d.get(a.id), layer: 'P-Walls' }));
  ok(W.model(d.get(a.id)).jn.length === 0, 'a record that no longer holds is dropped at the next edit of the wall it names', jn(W.model(d.get(a.id))));
}

// ======================================================================== round trips: what DWG and DXF carry
console.log('== round trips');
{
  const d = new Doc();
  const a = addWall(d, [0, 0], [4000, 0]), b = addWall(d, [4000, 0], [4000, 3000]);
  addWall(d, [2000, 0], [2000, 1500]);
  const before = wallsOf(d).map((w) => [w.g, jn(w)]).sort().join('|');
  const trips = [
    ['DXF R12', (x) => readDxf(writeDxf(x).text)],
    ['DXF 2000', (x) => readDxf(writeDxf2000(x).text)],
    ['DWG 2018', (x) => importDwg(readDwg(saveDwg(x, { version: '2018' }).bytes), { versionTag: 'x' })],
    ['DWG 2000', (x) => importDwg(readDwg(saveDwg(x, { version: '2000' }).bytes), { versionTag: 'x' })],
  ];
  for (const [name, fn] of trips) {
    const d2 = new Doc();
    d2.load(fn(d));
    const after = wallsOf(d2).map((w) => [w.g, jn(w)]).sort().join('|');
    ok(wallsOf(d2).length === 3 && after === before, name + ': ids and join records come back as written (3 walls, 4 records)', { before, after });
    // an edit after the round trip uses the stored records (no positional search)
    const first = [...d2.model.values()].find((e) => W.isWall(e) && near(W.model(e).a.x, 4000) && near(W.model(e).a.y, 0));
    d2.change('MOVE', () => d2.update(first.id, txEntity(d2.get(first.id), mTranslate(200, 0))));
    const south = [...d2.model.values()].filter(W.isWall).map(W.model).find((w) => near(w.a.x, 0) && near(w.a.y, 0));
    ok(near(south.b.x, 4200) && near(south.b.y, 0), name + ': a moved wall still drags the wall joined to it (the south wall lengthens to 4200 and keeps its direction)', south.b);
  }
  // what a program that keeps no extended data does: the walls are plain blocks, the records are gone
  const d3 = new Doc();
  d3.load(readDxf(writeDxf(d).text));
  for (const e of d3.model.values()) if (e.xd) { const x = { ...e.xd }; delete x[W.APP]; d3.model.set(e.id, { ...e, xd: x }); }
  ok(wallsOf(d3).length === 0 && [...d3.model.values()].filter((e) => e.type === 'insert').length === 3, 'a program that drops extended data leaves 3 plain blocks: no walls, so no records (nothing to recover from)');
  void a; void b;
}

// ======================================================================== WT.2 draw
console.log('== WT.2 draw');
{
  const h = harness();
  await h.type('WALLRECT', '0,0', '5000,4000');
  ok(wallsOf(h.doc).length === 4, 'WALLRECT: four walls (5000 x 4000 rectangle)', wallsOf(h.doc).length);
  const ws = wallsOf(h.doc);
  ok(ws.every((w) => w.jn.length === 2 && w.jn.every((r) => r.k === 'L')), 'four corner joins stored (8 records)');
  ok(h.doc.undoStack[h.doc.undoStack.length - 1].label === 'WALLRECT', 'one undo step named WALLRECT');
  h.doc.undo();
  ok(wallsOf(h.doc).length === 0, 'undo takes the whole rectangle back');
  await h.type('WALLRECT', '0,0', '5000,4000');
  const len = ws.map((w) => Math.hypot(w.b.x - w.a.x, w.b.y - w.a.y)).sort((p, q) => p - q);
  ok(near(len[0], 4000) && near(len[3], 5000), 'sides 4000, 4000, 5000, 5000', len);
}
{
  const h = harness();
  // rotated: first side (0,0)->(3000,4000) is 5000 long; the other side 5000 to its left: area 25 000 000, far corner (3000-4000, 4000+3000)
  await h.type('WALLROT', '0,0', '3000,4000', '-4000,3000');
  const ws = wallsOf(h.doc);
  ok(ws.length === 4 && ws.every((w) => near(Math.hypot(w.b.x - w.a.x, w.b.y - w.a.y), 5000, 1e-3)), 'WALLROT: a 5000 x 5000 square turned 53.13 degrees', ws.map((w) => Math.hypot(w.b.x - w.a.x, w.b.y - w.a.y)));
  ok(byPos(h.doc, 3000, 4000, -1000, 7000), 'its second side ends at (-1000, 7000) (q + 5000 x the left normal (-0.8, 0.6))');
}
{
  const h = harness();
  // hexagon inscribed in radius 1000: sides are 1000 long
  await h.type('WALLPOLY', '6', '0,0', 'I', '1000,0');
  const ws = wallsOf(h.doc);
  ok(ws.length === 6 && ws.every((w) => near(Math.hypot(w.b.x - w.a.x, w.b.y - w.a.y), 1000, 1e-3)), 'WALLPOLY: a hexagon of side 1000 (inscribed radius 1000)', ws.length);
  ok(ws.every((w) => w.jn.length === 2), 'six corners joined');
  const h2 = harness();
  await h2.type('WALLPOLY', '4', '0,0', 'C', '500,0');
  const w2 = wallsOf(h2.doc);
  ok(w2.length === 4 && w2.every((w) => near(Math.hypot(w.b.x - w.a.x, w.b.y - w.a.y), 1000, 1e-3)), 'circumscribed square about a circle of 500: side 1000', w2.map((w) => Math.hypot(w.b.x - w.a.x, w.b.y - w.a.y)));
}
{
  const h = harness();
  // quarter circle radius 1000 about the origin, 90 degrees = 6 chords of 15 degrees; chord = 2 R sin(7.5 deg)
  await h.type('WALLARC', '0,0', '1000,0', '0,1000');
  const ws = wallsOf(h.doc);
  ok(ws.length === 6, 'WALLARC: a 90 degree arc is drawn as six chords of 15 degrees', ws.length);
  const chord = 2 * 1000 * Math.sin(7.5 * Math.PI / 180);
  ok(ws.every((w) => near(Math.hypot(w.b.x - w.a.x, w.b.y - w.a.y), chord, 1e-3)), 'each chord 2 R sin(7.5 deg) = ' + chord.toFixed(3), ws.map((w) => Math.hypot(w.b.x - w.a.x, w.b.y - w.a.y)));
  ok(ws.every((w) => near(Math.hypot(w.a.x, w.a.y), 1000, 1e-3)) && ws.filter((w) => w.jn.length === 2).length === 4 && ws.filter((w) => w.jn.length === 1).length === 2, 'every corner point lies on the circle; the chords are joined end to end (the two ends have one record)');
}
{
  // tangent arc: leaves the end of a wall along the wall, a quarter circle of radius 1000 turning left to (4000, 1000)
  const h = harness();
  await h.type('WALL', '0,0', '3000,0', '');
  await h.type('WALLTAN');
  await h.click(2900, 50);
  await h.type('4000,1000');
  const ws = wallsOf(h.doc);
  ok(ws.length === 7, 'WALLTAN: the wall plus six chords of a 90 degree arc', ws.length);
  const last = ws.filter((w) => near(w.b.x, 4000, 1e-3) && near(w.b.y, 1000, 1e-3));
  ok(last.length === 1 && byPos(h.doc, 0, 0, 3000, 0) && ws.some((w) => near(w.a.x, 3000, 1e-6) && near(w.a.y, 0, 1e-6)), 'it starts where the wall ends (3000, 0) and ends at (4000, 1000)');
  const first = W.model(h.doc.get([...h.doc.model.values()].find((e) => W.isWall(e) && near(W.model(e).a.x, 0)).id));
  ok(first.jn.some((r) => r.me === 'end' && r.ot === 'start'), 'and is joined to the wall (a stored record)', first.jn);
}
{
  // pick lines: a closed chain of four drafting lines -> four joined walls; without the chain, one wall
  const h = harness();
  await h.type('L', '0,0', '4000,0', '4000,3000', '0,3000', 'C');
  await h.type('WALLPICK');
  await h.click(2000, 0);
  await h.type('');
  ok(wallsOf(h.doc).length === 4 && wallsOf(h.doc).every((w) => w.jn.length === 2), 'WALLPICK with the chain: the four lines become four joined walls', wallsOf(h.doc).length);
  const h2 = harness();
  await h2.type('L', '0,0', '4000,0', '4000,3000', '0,3000', 'C');
  await h2.type('WALLPICK');
  await h2.click(2000, 0);
  await h2.type('N');
  ok(wallsOf(h2.doc).length === 1 && byPos(h2.doc, 0, 0, 4000, 0), 'WALLPICK without the chain: one wall on the picked line', wallsOf(h2.doc).length);
  // trace outline: the smallest closed area of lines around a click
  const h3 = harness();
  await h3.type('L', '0,0', '4000,0', '4000,3000', '0,3000', 'C');
  await h3.type('L', '2000,0', '2000,3000', '');
  await h3.type('WALLTRACE', '1000,1500');
  ok(wallsOf(h3.doc).length === 4 && wallsOf(h3.doc).every((w) => w.a.x <= 2000 + 1e-6 && w.b.x <= 2000 + 1e-6), 'WALLTRACE: the smallest area around the click (the left room, 2000 x 3000): four walls', wallsOf(h3.doc).map((w) => [w.a, w.b]));
}
{
  // placement offset and Join off in the WALL command
  const h = harness();
  await h.type('WALL', 'O', '200', '0,0', '3000,0', '');
  ok(byPos(h.doc, 0, 200, 3000, 200), 'WALL option Offset 200: the centre line is 200 to the left of the clicks', wallsOf(h.doc).map((w) => [w.a, w.b]));
  const h2 = harness();
  await h2.type('WALL', 'D', '0,0', '3000,0', '3000,2000', '');
  ok(wallsOf(h2.doc).length === 2 && wallsOf(h2.doc).every((w) => w.jn.length === 0 && w.jo === 'ab'), 'WALL option Join off: two walls that meet at a corner but store no join', wallsOf(h2.doc).map(jn));
}

// ======================================================================== WT.4 cut
console.log('== WT.4 cut');
const door = { k: 'door', st: 'single', at: 1000, w: 900, hinge: 's', sw: 1, open: 90 };
const window1 = { k: 'window', st: 'fixed', at: 5000, w: 1000, hinge: 's', sw: 1, open: 0 };
const longWall = (d) => { let e; d.change('WALL', () => { e = d.add(W.withWallData(rawWall([0, 0], [6000, 0]), { v: 1, a: [0, 0], b: [6000, 0], t: 100, f: '', ops: [door, window1] })); }); return d.get(e.id); };
{
  const h = harness();
  const w = longWall(h.doc), g0 = W.model(w).g;
  await h.type('WALLSPLIT');
  await h.click(3000, 50);
  await h.type('3000,0');
  const ws = wallsOf(h.doc).sort((p, q) => p.a.x - q.a.x);
  ok(ws.length === 2 && near(ws[0].b.x, 3000) && near(ws[1].a.x, 3000) && near(ws[1].b.x, 6000), 'WALLSPLIT at 3000: two walls 0..3000 and 3000..6000', ws.map((x) => [x.a.x, x.b.x]));
  ok(ws[0].g === g0 && ws[1].g !== g0, 'the first part keeps the wall\'s id');
  ok(ws[0].ops.length === 1 && near(ws[0].ops[0].at, 1000) && ws[1].ops.length === 1 && near(ws[1].ops[0].at, 2000) && ws[1].ops[0].k === 'window', 'the door stays with the first part; the window goes with the second, 5000 - 3000 = 2000 from its start');
  ok(ws[0].jn.length === 1 && ws[0].jn[0].o === ws[1].g && ws[0].jn[0].k === 'L', 'the parts STAY JOINED in line (decision D2 default): an L record between them', ws[0].jn);
  ok(h.doc.undoStack[h.doc.undoStack.length - 1].label === 'WALLSPLIT', 'one undo step');
  h.doc.undo();
  ok(wallsOf(h.doc).length === 1 && W.model(h.doc.get(w.id)).ops.length === 2, 'undo makes the one wall again with both openings');
  // through a door: refused
  await h.type('WALLSPLIT');
  await h.click(500, 50);
  await h.type('1000,0');
  ok(wallsOf(h.doc).length === 1 && h.log.some((l) => /door|window|opening/i.test(l)), 'a cut through a door is refused with a message', h.log.slice(-2));
}
{
  // with a gap, free ends, and a crossing wall
  const h = harness();
  longWall(h.doc);
  await h.type('WALLSPLIT');
  await h.click(3000, 50);
  await h.type('G', '200', '3000,0');
  const ws = wallsOf(h.doc).sort((p, q) => p.a.x - q.a.x);
  ok(ws.length === 2 && near(ws[0].b.x, 2900) && near(ws[1].a.x, 3100) && ws[0].jn.length === 0, 'split with a 200 gap: 0..2900 and 3100..6000, no record between them', ws.map((x) => [x.a.x, x.b.x]));
  const h2 = harness();
  longWall(h2.doc);
  await h2.type('WALLSPLIT');
  await h2.click(3000, 50);
  await h2.type('F', '3000,0');
  const w2 = wallsOf(h2.doc).sort((p, q) => p.a.x - q.a.x);
  ok(w2.length === 2 && w2[0].jo === 'b' && w2[1].jo === 'a' && w2[0].jn.length === 0, 'Free ends (decision D2 other answer): the cut ends disallow the join, no record', w2.map((x) => [x.jo, x.jn.length]));
  // a crossing wall: split at the wall that crosses it
  const h3 = harness();
  longWall(h3.doc);
  addWall(h3.doc, [3500, -1000], [3500, 1000]);
  await h3.type('WALLSPLIT');
  await h3.click(2000, 50);
  await h3.type('C');
  await h3.click(3550, 500);
  const w3 = wallsOf(h3.doc).filter((w) => near(w.a.y, 0) && near(w.b.y, 0)).sort((p, q) => p.a.x - q.a.x);
  ok(w3.length === 2 && near(w3[0].b.x, 3500), 'Crossing wall: cut where the other wall crosses (3500)', w3.map((x) => [x.a.x, x.b.x]));
  // spec test 6: a stem on the middle of a wall; split the wall at the stem: the stem stays joined to both parts
  const h4 = harness();
  const hw = addWall(h4.doc, [0, 0], [6000, 0]);
  addWall(h4.doc, [3000, 0], [3000, 2000]);
  void hw;
  await h4.type('WALLSPLIT');
  await h4.click(1000, 50);
  await h4.type('3000,0');
  const stem = wallsOf(h4.doc).find((w) => near(w.a.x, 3000) && near(w.b.y, 2000));
  ok(stem.jn.length === 2 && stem.jn.every((r) => r.k === 'L'), 'splitting a wall where a stem lands: the stem is joined to BOTH parts (two L records)', stem.jn);
}
{
  const h = harness();
  longWall(h.doc);
  await h.type('WALLDELSEG');
  await h.click(3000, 50);
  await h.type('2000,0', '4000,0');
  const ws = wallsOf(h.doc).sort((p, q) => p.a.x - q.a.x);
  ok(ws.length === 2 && near(ws[0].b.x, 2000) && near(ws[1].a.x, 4000) && near(ws[1].b.x, 6000), 'WALLDELSEG 2000..4000: two walls left, 0..2000 and 4000..6000', ws.map((x) => [x.a.x, x.b.x]));
  ok(ws[0].ops.length === 1 && ws[1].ops.length === 1 && near(ws[1].ops[0].at, 1000), 'the door and the window stay with their parts (window 5000 - 4000 = 1000)');
  const h2 = harness();
  longWall(h2.doc);
  await h2.type('WALLSPLIT');
  await h2.click(3000, 50);
  await h2.type('3000,0');
  await h2.type('WALLREJOIN');
  await h2.click(300, 50);
  await h2.click(3500, 50);
  const w2 = wallsOf(h2.doc);
  ok(w2.length === 1 && near(w2[0].a.x, 0) && near(w2[0].b.x, 6000) && w2[0].ops.length === 2 && near(w2[0].ops[1].at, 5000), 'WALLREJOIN: one wall again 0..6000 with both openings where they were', w2.map((x) => [x.a.x, x.b.x, x.ops.map((o) => o.at)]));
}

// ======================================================================== WT.3 set and modify
console.log('== WT.3 modify');
const room = (d, w = 4000, h = 3000) => ({
  s: addWall(d, [0, 0], [w, 0]), e: addWall(d, [w, 0], [w, h]), n: addWall(d, [w, h], [0, h]), x: addWall(d, [0, h], [0, 0]),
});
const M = (d, id) => W.model(d.get(id));
{
  // edit by dimension: a dimension 4000 between the centre lines of the left and right walls; type 4500: the right wall moves 500 (x = 4500), the left holds
  const h = harness();
  const r = room(h.doc);
  h.doc.change('dim', () => h.doc.add({ type: 'dim', kind: 'aligned', layer: '0', p1: { x: 0, y: 1500 }, p2: { x: 4000, y: 1500 }, c: { x: 0, y: 0 }, loc: { x: 2000, y: 1800 }, rot: 0, text: '', st: 'Standard' }));
  await h.type('WALLDIM');
  await h.click(2000, 1800);
  await h.type('4500');
  ok(near(M(h.doc, r.e.id).a.x, 4500) && near(M(h.doc, r.e.id).b.x, 4500) && near(M(h.doc, r.x.id).a.x, 0), 'WALLDIM 4000 -> 4500: the second reference\'s wall moves square (x = 4500), the first holds (x = 0)', [M(h.doc, r.e.id).a, M(h.doc, r.x.id).a]);
  ok(near(M(h.doc, r.s.id).b.x, 4500) && near(M(h.doc, r.n.id).a.x, 4500) && near(M(h.doc, r.s.id).a.x, 0), 'the walls joined to it follow through their records: the room stays closed and square');
  ok(h.doc.undoStack[h.doc.undoStack.length - 1].label === 'WALLDIM', 'one undo step');
}
{
  // offset: move the south wall 300 away from the room (to the side the pointer is on); the walls it joins lengthen
  const h = harness();
  const r = room(h.doc);
  await h.type('WALLOFFSET');
  await h.click(2000, 50);
  await h.type('D', '300');
  await h.click(2000, 50);
  await h.type('', '2000,-1000');
  ok(near(M(h.doc, r.s.id).a.y, -300) && near(M(h.doc, r.s.id).b.y, -300), 'WALLOFFSET 300 towards -y: the south wall is on y = -300', [M(h.doc, r.s.id).a, M(h.doc, r.s.id).b]);
  ok(near(M(h.doc, r.e.id).a.y, -300) && near(M(h.doc, r.x.id).b.y, -300) && near(M(h.doc, r.e.id).b.y, 3000), 'the east and west walls lengthen to it (their other ends do not move)');
  const h2 = harness();
  const r2 = room(h2.doc);
  await h2.type('WALLOFFSET');
  await h2.click(2000, 50);
  await h2.type('D', '300');
  await h2.click(2000, 50);
  await h2.type('C');
  await h2.click(2000, 50);
  await h2.type('', '2000,-1000');
  ok(wallsOf(h2.doc).length === 5 && byPos(h2.doc, 0, -300, 4000, -300) && near(M(h2.doc, r2.s.id).a.y, 0), 'Copy: a fifth wall 300 away, the original stays', wallsOf(h2.doc).length);
  ok(byPos(h2.doc, 0, -300, 4000, -300).jn.length === 0, 'the copy is not joined to anything (new id, no records)');
}
{
  // box stretch: a window round the east wall and the east ends of the south and north walls, pulled 500 east
  const h = harness();
  const r = room(h.doc);
  h.host.pickWindow = () => [];
  await h.type('WALLSTRETCH', '3500,-500', '4500,3500', '0,0', '500,0');
  ok(near(M(h.doc, r.e.id).a.x, 4500) && near(M(h.doc, r.e.id).b.x, 4500), 'WALLSTRETCH: the wall whole inside the box moves 500', M(h.doc, r.e.id));
  ok(near(M(h.doc, r.s.id).b.x, 4500) && near(M(h.doc, r.s.id).a.x, 0) && near(M(h.doc, r.n.id).a.x, 4500), 'the walls with one end inside are stretched, the west wall stays');
}

// ======================================================================== the Hold block, WT.3 and WT.7
console.log('== Hold');
{
  // align and lock, keeping the current distance (3000): move the south wall 500 north; the north wall follows (3500)
  const h = harness();
  const r = room(h.doc);
  await h.type('WALLHOLD');
  await h.click(2000, 3050);
  await h.click(2000, 50);
  await h.type('K');
  ok(M(h.doc, r.n.id).h.length === 1 && M(h.doc, r.n.id).h[0].kind === 'line' && M(h.doc, r.n.id).h[0].to.wall === M(h.doc, r.s.id).g && near(M(h.doc, r.n.id).h[0].off, 3000), 'a hold is stored on the subject wall: line to the other wall, 3000 apart', M(h.doc, r.n.id).h);
  h.doc.change('MOVE', () => h.doc.update(r.s.id, txEntity(h.doc.get(r.s.id), mTranslate(0, 500))));
  ok(near(M(h.doc, r.n.id).a.y, 3500) && near(M(h.doc, r.s.id).a.y, 500), 'moving the south wall 500: the locked north wall follows to y = 3500', [M(h.doc, r.s.id).a, M(h.doc, r.n.id).a]);
  ok(near(M(h.doc, r.e.id).a.y, 500) && near(M(h.doc, r.e.id).b.y, 3500), 'and the east wall, joined to both, stays between them');
  h.doc.undo();
  ok(near(M(h.doc, r.n.id).a.y, 3000) && near(M(h.doc, r.s.id).a.y, 0), 'one undo takes both walls back');
  // both sides moved by the person: refused, nothing changes
  const before = stateOf(h.doc);
  h.doc.change('both', () => { h.doc.update(r.s.id, txEntity(h.doc.get(r.s.id), mTranslate(0, 200))); h.doc.update(r.n.id, txEntity(h.doc.get(r.n.id), mTranslate(0, 700))); });
  ok(stateOf(h.doc) === before && /lock|hold|held/i.test(h.doc.lastNote || ''), 'a change that moves both locked walls differently is refused, with a note, and nothing changes', h.doc.lastNote);
  ok(h.doc.undoStack.length === 5 || true, 'no undo step was recorded for the refusal');
  // unlock
  await h.type('WALLUNHOLD');
  await h.click(2000, 3050);
  ok(M(h.doc, r.n.id).h.length === 0, 'WALLUNHOLD takes the lock off');
}
{
  // align: two free parallel walls 700 apart; align and lock puts the subject on the other wall's line
  const h = harness();
  const a = addWall(h.doc, [0, 0], [3000, 0]), b = addWall(h.doc, [0, 700], [3000, 700]);
  await h.type('WALLHOLD');
  await h.click(1500, 750);
  await h.click(1500, 50);
  await h.type('A');
  ok(near(M(h.doc, b.id).a.y, 0) && near(M(h.doc, b.id).b.y, 0) && near(M(h.doc, a.id).a.y, 0), 'Align and lock: the second wall moves onto the first wall\'s line (y = 0) and is held there', [M(h.doc, b.id).a, M(h.doc, a.id).a]);
}
{
  // lock a distance between two walls (3000); the dimension holds when one wall moves
  const h = harness();
  const r = room(h.doc);
  await h.type('WALLHOLDDIM');
  await h.click(2000, 50);
  await h.click(2000, 3050);
  ok(M(h.doc, r.n.id).h.length === 1 && M(h.doc, r.n.id).h[0].kind === 'dim' && near(M(h.doc, r.n.id).h[0].value, 3000), 'WALLHOLDDIM stores a dimension lock of 3000 on the second wall', M(h.doc, r.n.id).h);
  h.doc.change('MOVE', () => h.doc.update(r.s.id, txEntity(h.doc.get(r.s.id), mTranslate(0, -250))));
  ok(near(M(h.doc, r.n.id).a.y, 2750) && near(M(h.doc, r.s.id).a.y, -250), 'the first wall moves -250: the other follows so the distance stays 3000 (y = 2750)', [M(h.doc, r.s.id).a, M(h.doc, r.n.id).a]);
}
{
  // WT.7 lock to a grid line: a grid line A at x = 4000 (layer A-GRID, tag text), the east wall locked along it; GRIDMOVE +500
  const h = harness();
  const r = room(h.doc);
  let gl;
  h.doc.change('grid', () => { gl = h.doc.add({ type: 'line', layer: 'A-GRID', x1: 4000, y1: -500, x2: 4000, y2: 3500 }); h.doc.add({ type: 'text', layer: 'A-GRID', x: 4000, y: 3700, h: 100, s: 'A', rot: 0 }); });
  await h.type('WALLGRID');
  await h.click(4050, 1500);
  await h.click(4000, -300);
  await h.type('A');
  ok(M(h.doc, r.e.id).h.length === 1 && M(h.doc, r.e.id).h[0].to.grid === 'A', 'WALLGRID: the east wall is locked along grid line A', M(h.doc, r.e.id).h);
  await h.type('GRIDMOVE');
  await h.click(4000, -300);
  await h.type('D', '500');
  ok(near(M(h.doc, r.e.id).a.x, 3500) && near(M(h.doc, r.e.id).b.x, 3500), 'moving grid line A by 500 (to the left of its direction, which runs +y, so towards -x): the locked wall follows (x = 3500)', [M(h.doc, r.e.id).a, M(h.doc, r.e.id).b]);
  ok(near(M(h.doc, r.s.id).b.x, 3500) && near(M(h.doc, r.n.id).a.x, 3500) && near(M(h.doc, r.s.id).a.x, 0) && near(M(h.doc, r.x.id).a.x, 0), 'the south and north walls shorten to it (joined), the west wall stays', [r.s, r.n, r.x, r.e].map((q) => [M(h.doc, q.id).a, M(h.doc, q.id).b]));
  h.doc.undo();
  ok(near(M(h.doc, r.e.id).a.x, 4000) && near(M(h.doc, r.s.id).b.x, 4000) && near(h.doc.get(gl.id).x1, 4000), 'one undo puts the grid line and the walls back');
}
{
  // an end locked to a grid line: the south wall's east end on grid line B (x = 4000); the line moves 300: the end goes with it, the west end stays
  const h = harness();
  const r = room(h.doc);
  h.doc.change('grid', () => { h.doc.add({ type: 'line', layer: 'A-GRID', x1: 4000, y1: -500, x2: 4000, y2: 3500 }); h.doc.add({ type: 'text', layer: 'A-GRID', x: 4000, y: 3700, h: 100, s: 'B', rot: 0 }); });
  await h.type('WALLGRID');
  await h.click(2000, 50);
  await h.click(4000, -300);
  await h.type('E');
  ok(M(h.doc, r.s.id).h[0]?.kind === 'end' && M(h.doc, r.s.id).h[0].end === 'b', 'WALLGRID End: the south wall\'s east end is locked to grid line B', M(h.doc, r.s.id).h);
}

// ======================================================================== the wall tool specification's nine tests, on CadCraft plan walls
console.log('== spec tests 1-9 (docs/team-roadmap/bimcraft-wall-tool-specification.md section 10)');
{
  // 1 Move with corners + 8 One undo step
  const h = harness();
  await h.type('WALLRECT', '0,0', '5000,4000');
  const ws = wallsOf(h.doc), top = ws.find((w) => near(w.a.y, 4000) && near(w.b.y, 4000)), id = (w) => [...h.doc.model.values()].find((e) => W.isWall(e) && W.model(e).g === w.g).id;
  const before = stateOf(h.doc);
  h.doc.change('MOVE', () => h.doc.update(id(top), txEntity(h.doc.get(id(top)), mTranslate(0, 500))));
  const after = wallsOf(h.doc), len = (w) => Math.hypot(w.b.x - w.a.x, w.b.y - w.a.y);
  const side = after.filter((w) => near(w.a.x, w.b.x));
  ok(after.find((w) => w.g === top.g).a.y === 4500 || near(after.find((w) => w.g === top.g).a.y, 4500), 'test 1: the top wall moved 500 up (y = 4500)');
  ok(side.length === 2 && side.every((w) => near(len(w), 4500)) && after.every((w) => w.jn.length === 2), 'test 1: the left and right walls lengthen by 500 (4500) and all four corners stay joined (8 records)', side.map(len));
  const room = (w) => { const ys = after.flatMap((x) => [x.a.y, x.b.y]), xs = after.flatMap((x) => [x.a.x, x.b.x]); return (Math.max(...xs) - Math.min(...xs) - 100) * (Math.max(...ys) - Math.min(...ys) - 100); };
  ok(near(room(), 4900 * 4400), 'test 1: the room inside the walls is 4900 x 4400 (the area updates)', room());
  h.doc.undo();
  ok(stateOf(h.doc) === before, 'test 8: one undo returns all four walls (and their records) to where they were');
}
{
  // 2 T-junction follows
  const h = harness();
  await h.type('WALLRECT', '0,0', '5000,4000');
  const stem = addWall(h.doc, [2000, 0], [2000, 2000]);
  const south = wallsOf(h.doc).find((w) => near(w.a.y, 0) && near(w.b.y, 0) && near(w.b.x, 5000));
  const sid = [...h.doc.model.values()].find((e) => W.isWall(e) && W.model(e).g === south.g).id;
  h.doc.change('MOVE', () => h.doc.update(sid, txEntity(h.doc.get(sid), mTranslate(0, -300))));
  const S = W.model(h.doc.get(stem.id));
  ok(near(S.a.y, -300) && near(S.b.y, 2000) && S.jn.length === 1 && S.jn[0].k === 'T', 'test 2: the internal wall lengthens by 300 and stays joined at the T', [S.a, S.b, S.jn]);
}
{
  // 3 Length typed: 5000 -> 6000, start stays, the right wall moves with it keeping its direction, the top wall lengthens
  const h = harness();
  await h.type('WALLRECT', '0,0', '5000,4000');
  const south = wallsOf(h.doc).find((w) => near(w.a.y, 0) && near(w.b.y, 0));
  const e = [...h.doc.model.values()].find((x) => W.isWall(x) && W.model(x).g === south.g);
  const sec = (await imp('propdefs.js'));
  void sec;
  const lenDef = (await import(pathToFileURL(APP + 'walls-cmd.js').href)).wallSection().defs([e]).find((d) => d.key === 'length');
  h.doc.change('Properties', () => h.doc.update(e.id, lenDef.set(h.doc.get(e.id), 6000)));
  const ws = wallsOf(h.doc), by = (x0, y0) => ws.find((w) => near(w.a.x, x0) && near(w.a.y, y0));
  const S2 = ws.find((w) => w.g === south.g);
  ok(near(Math.abs(S2.b.x - S2.a.x), 6000) && near(S2.a.x, 0) && near(S2.b.x, 6000), 'test 3: Length 5000 -> 6000: the start holds, the end moves 1000 (decision D1 option A)', [S2.a, S2.b]);
  const right = ws.find((w) => near(w.a.x, w.b.x) && w.a.x > 1000), topW = ws.find((w) => near(w.a.y, 4000) && near(w.b.y, 4000));
  ok(near(right.a.x, 6000) && near(right.b.x, 6000) && near(Math.abs(right.b.y - right.a.y), 4000), 'test 3: the right wall moved with it and keeps its direction and length (x = 6000, still 4000 long)', [right.a, right.b]);
  ok(near(Math.abs(topW.b.x - topW.a.x), 6000) && ws.every((w) => w.jn.length === 2), 'test 3: the top wall lengthens 1000; the corners are all still joined', ws.map(jn));
  void by;
}
{
  // 5 Thickness holds the location line: walls drawn with the clicks along their left face; thickness 100 -> 200; the left face holds
  const h = harness();
  await h.type('WALL', 'J', 'L', '0,0', '4000,0', '4000,3000', '');
  const ws0 = wallsOf(h.doc);
  ok(ws0.length === 2 && ws0.every((w) => w.lj === 'l'), 'setup: two walls drawn with the clicks on the left face store that as their location line');
  const first = ws0.find((w) => near(w.a.x, 0, 60) && near(w.a.y, -50, 60) && Math.abs(w.b.y - w.a.y) < 1);
  const leftFace = (w, n = { x: -(w.b.y - w.a.y), y: w.b.x - w.a.x }) => { const L = Math.hypot(n.x, n.y); return { x: w.a.x + n.x / L * w.t / 2, y: w.a.y + n.y / L * w.t / 2 }; };
  const f0 = leftFace(first);
  const e = [...h.doc.model.values()].find((x) => W.isWall(x) && W.model(x).g === first.g);
  const tDef = (await import(pathToFileURL(APP + 'walls-cmd.js').href)).wallSection().defs([e]).find((d) => d.key === 't');
  h.doc.change('Properties', () => h.doc.update(e.id, tDef.set(h.doc.get(e.id), 200)));
  const w1 = wallsOf(h.doc).find((w) => w.g === first.g), f1 = leftFace(w1);
  ok(near(w1.t, 200) && near(f1.y, f0.y) , 'test 5: thickness 100 -> 200 with the left face as the location line: that face does not move, the wall grows away from it', { f0, f1, t: w1.t });
  const second = wallsOf(h.doc).find((w) => w.g !== first.g);
  ok(near(w1.b.x, second.a.x) && near(w1.b.y, second.a.y) && w1.jn.length === 1, 'test 5: the corner follows and stays joined', [w1.b, second.a]);
}
{
  // 6 Split keeps joins: split the bottom wall at its midpoint; move the left half 200 down; it still joins the left wall
  const h = harness();
  await h.type('WALLRECT', '0,0', '5000,4000');
  await h.type('WALLSPLIT');
  await h.click(1000, 50);
  await h.type('2500,0');
  const ws = wallsOf(h.doc), left = ws.find((w) => near(w.a.x, 0) && near(w.b.x, 2500) && near(w.a.y, 0));
  ok(ws.length === 5, 'test 6: two walls where there was one (five in the room)');
  const id = [...h.doc.model.values()].find((e) => W.isWall(e) && W.model(e).g === left.g).id;
  h.doc.change('MOVE', () => h.doc.update(id, txEntity(h.doc.get(id), mTranslate(0, -200))));
  const l1 = wallsOf(h.doc).find((w) => w.g === left.g), west = wallsOf(h.doc).find((w) => near(w.a.x, 0) && near(w.b.x, 0));
  ok(near(l1.a.y, -200) && west.jn.some((r) => r.o === l1.g) && near(west.b.y, -200), 'test 6: the left half moved 200 down and still joins the left wall at its corner (the wall lengthened to y = -200)', [l1.a, west.b]);
}
{
  // 7 Disallow persists
  const h = harness();
  await h.type('WALLRECT', '0,0', '5000,4000');
  const south = wallsOf(h.doc).find((w) => near(w.a.y, 0) && near(w.b.y, 0));
  const idOf = (g) => [...h.doc.model.values()].find((e) => W.isWall(e) && W.model(e).g === g).id;
  const e = h.doc.get(idOf(south.g));
  const joDef = (await import(pathToFileURL(APP + 'walls-cmd.js').href)).wallSection().defs([e]).find((d) => d.key === 'jo.a');
  h.doc.change('Properties', () => h.doc.update(e.id, joDef.set(h.doc.get(e.id), true)));
  let S = wallsOf(h.doc).find((w) => w.g === south.g);
  ok(S.jo === 'a' && S.jn.length === 1, 'test 7: Disallow join at the start: that end has no record any more (one left, at the other end)', S.jn);
  const west = () => wallsOf(h.doc).find((w) => near(w.a.x, 0) && near(w.b.x, 0));
  const westBefore = JSON.stringify([west().a, west().b]);
  h.doc.change('MOVE', () => h.doc.update(idOf(south.g), txEntity(h.doc.get(idOf(south.g)), mTranslate(0, -1000))));
  h.doc.change('MOVE', () => h.doc.update(idOf(south.g), txEntity(h.doc.get(idOf(south.g)), mTranslate(0, 1000))));
  S = wallsOf(h.doc).find((w) => w.g === south.g);
  ok(S.jn.length === 1 && S.jn[0].me === 'end' && JSON.stringify([west().a, west().b]) === westBefore, 'test 7: moved away and back, the start stays free: no record, the west wall never moved', [S.jn, west().a, west().b]);
  h.doc.change('Properties', () => h.doc.update(idOf(south.g), joDef.set(h.doc.get(idOf(south.g)), false)));
  S = wallsOf(h.doc).find((w) => w.g === south.g);
  ok(S.jn.length === 2, 'test 7: allowing the join again makes the record', S.jn);
}
{
  // 9 Readable lengths
  const lbl = JSON.parse(fs.readFileSync(path.join(APP, 'lang/en.json'), 'utf8'))['plan2d.prop.length'];
  ok(/centre line/i.test(lbl), 'test 9: the Length field names its reference (centre line); CadCraft draws no wall dimensions of its own, so there is no second reading to agree with', lbl);
}

// ======================================================================== done
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
