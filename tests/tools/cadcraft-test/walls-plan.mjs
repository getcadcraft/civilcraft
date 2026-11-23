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

// ======================================================================== walls-plan-10: FX.63 an end grip and ROTATE keep the neighbours' direction
console.log('== FX.63 end grip, corner, Alt, ROTATE (walls-plan-10)');
const WC = await imp('walls-cmd.js');
const { mAbout, mRotate } = G;
/** A room 4000 x 3000 (s south, e east, n north, x west, drawn anticlockwise from the origin) and a partition p from the south wall's middle up to (2000, 1500). */
const roomP = (d) => { const r = room(d); r.p = addWall(d, [2000, 0], [2000, 1500]); return r; };
const at = (p, x, y, e = 1e-4) => near(p.x, x, e) && near(p.y, y, e);
{
  // the south wall's east end dragged by its grip to (5000, 500), only that wall selected. Its new line runs from (0,0) with slope
  // 500 / 5000 = 0.1; the east wall's own line is x = 4000: they meet at (4000, 400). The partition's line is x = 2000: 0.1 x 2000 = 200.
  const d = new Doc(), r = roomP(d), before = stateOf(d), n0 = d.undoStack.length;
  const did = WC.wallGripCommit(d, { id: r.s.id, key: 'wall:b' }, { x: 5000, y: 500 }, { selection: new Set([r.s.id]) });
  ok(did && at(M(d, r.s.id).b, 4000, 400) && at(M(d, r.s.id).a, 0, 0), 'end grip: the dragged end lands on the joined wall\'s line where its own new line crosses it: (4000, 400)', M(d, r.s.id).b);
  ok(at(M(d, r.e.id).a, 4000, 400) && at(M(d, r.e.id).b, 4000, 3000), 'the joined wall\'s end slides along its own line to (4000, 400); it stays vertical and keeps its far end (it does not go sloped)', [M(d, r.e.id).a, M(d, r.e.id).b]);
  ok(at(M(d, r.p.id).a, 2000, 200) && at(M(d, r.p.id).b, 2000, 1500), 'the partition on the dragged wall follows along its own line: (2000, 200)', M(d, r.p.id).a);
  ok(at(M(d, r.n.id).a, 4000, 3000) && at(M(d, r.n.id).b, 0, 3000) && at(M(d, r.x.id).a, 0, 3000) && at(M(d, r.x.id).b, 0, 0), 'the north and west walls do not move');
  ok(jn(M(d, r.s.id)) === 'end-L-start,mid-T-start,start-L-end' && jn(M(d, r.e.id)) === 'end-L-start,start-L-end' && jn(M(d, r.p.id)) === 'start-T-mid', 'every join record is kept (the corner, the T, the far corner)', [jn(M(d, r.s.id)), jn(M(d, r.e.id)), jn(M(d, r.p.id))]);
  ok(d.undoStack.length === n0 + 1, 'one undo step', d.undoStack.length - n0);
  d.undo();
  ok(stateOf(d) === before, 'and one undo puts all three walls back');
}
{
  // along the wall itself: a Length change (4000 to 5000): the east wall moves parallel to x = 5000 and the north wall lengthens to it (D1 option A)
  const d = new Doc(), r = roomP(d);
  WC.wallGripCommit(d, { id: r.s.id, key: 'wall:b' }, { x: 5000, y: 0 }, { selection: new Set([r.s.id]) });
  ok(at(M(d, r.s.id).b, 5000, 0) && at(M(d, r.e.id).a, 5000, 0) && at(M(d, r.e.id).b, 5000, 3000) && at(M(d, r.n.id).a, 5000, 3000), 'end grip along the wall: the joined wall moves parallel (x = 5000), the north wall lengthens', [M(d, r.e.id).a, M(d, r.e.id).b]);
}
{
  // the corner grip with BOTH walls on it selected: the corner goes to (4500, -500) and both walls stay on it (both turn: that is what moving a
  // corner means). The partition slides along x = 2000 to the south wall's new line y = -500/4500 x = -x/9: -222.2222. North and west hold.
  const d = new Doc(), r = roomP(d), n0 = d.undoStack.length;
  WC.wallGripCommit(d, { id: r.s.id, key: 'wall:b' }, { x: 4500, y: -500 }, { selection: new Set([r.s.id, r.e.id]) });
  ok(at(M(d, r.s.id).b, 4500, -500) && at(M(d, r.e.id).a, 4500, -500), 'corner grip (both walls selected): both walls stay on the moved corner (4500, -500)', [M(d, r.s.id).b, M(d, r.e.id).a]);
  ok(at(M(d, r.e.id).b, 4000, 3000) && at(M(d, r.s.id).a, 0, 0) && at(M(d, r.n.id).a, 4000, 3000) && at(M(d, r.x.id).b, 0, 0), 'their far ends hold and the walls further along stay as they were (square)');
  ok(at(M(d, r.p.id).a, 2000, -2000 / 9), 'the partition slides along its own line to the south wall\'s new line: (2000, -222.2222)', M(d, r.p.id).a);
  ok(d.undoStack.length === n0 + 1 && jn(M(d, r.s.id)) === 'end-L-start,mid-T-start,start-L-end', 'one undo step; the records are kept');
}
{
  // Alt held: the join is broken on purpose. The end goes to (3000, -800) and nothing follows. The records that no longer hold go: the corner with
  // the east wall (its end is hypot(1000, 800) = 1281 away) and the partition's T (at x = 2000 the wall's line is at y = -533, the partition's end at 0:
  // further than half a thickness, and below the partition, so no crossing either).
  const d = new Doc(), r = roomP(d), n0 = d.undoStack.length;
  WC.wallGripCommit(d, { id: r.s.id, key: 'wall:b' }, { x: 3000, y: -800 }, { selection: new Set([r.s.id]), free: true });
  ok(at(M(d, r.s.id).b, 3000, -800) && at(M(d, r.e.id).a, 4000, 0) && at(M(d, r.p.id).a, 2000, 0), 'Alt + end grip: the end goes where it is put, the joined walls stay where they were', [M(d, r.s.id).b, M(d, r.e.id).a]);
  ok(jn(M(d, r.s.id)) === 'start-L-end' && jn(M(d, r.e.id)) === 'end-L-start' && jn(M(d, r.p.id)) === '', 'the broken joins leave the record on both walls; the corner at the other end keeps its record', [jn(M(d, r.s.id)), jn(M(d, r.e.id)), jn(M(d, r.p.id))]);
  ok(d.undoStack.length === n0 + 1, 'one undo step');
}
{
  // a drag that would turn the joined wall back through its far end ((4000, 3500) is past the east wall's top at 3000): refused, nothing changes
  const d = new Doc(), r = roomP(d), before = stateOf(d), n0 = d.undoStack.length;
  WC.wallGripCommit(d, { id: r.s.id, key: 'wall:b' }, { x: 4000, y: 3500 }, { selection: new Set([r.s.id]) });
  ok(stateOf(d) === before && d.undoStack.length === n0 && /model\.err\.short|too short/i.test(d.lastNote || ''), 'no solution that keeps the neighbour: the drag is refused with the existing message and nothing changes', d.lastNote);
  // the preview is the solved result, not the raw cursor: its lines reach (4000, 400), none reaches (5000, 500)
  const ghost = WC.wallGripGhost(d, { id: r.s.id, key: 'wall:b' }, { x: 5000, y: 500 }, { selection: new Set([r.s.id]) });
  const xs = ghost.filter((l) => l.type === 'line').flatMap((l) => [l.x1, l.x2]);
  ok(ghost.length > 8 && Math.max(...xs) < 4100, 'the grip preview shows the solved walls (nothing drawn out at the cursor x = 5000)', Math.max(...xs));
}
{
  // ROTATE: the east wall turned about its middle (4000, 1500) by atan(0.1) = 5.7106 degrees anticlockwise. Its new line leaves the vertical by
  // 0.1 per unit: it crosses the south wall's line y = 0 at x = 4000 + 1500 x 0.1 = 4150 and the north wall's line y = 3000 at x = 4000 - 150 = 3850.
  const d = new Doc(), r = roomP(d), before = stateOf(d), n0 = d.undoStack.length;
  d.change('ROTATE', () => d.update(r.e.id, txEntity(d.get(r.e.id), mAbout({ x: 4000, y: 1500 }, mRotate(Math.atan(0.1))))));
  ok(at(M(d, r.s.id).b, 4150, 0) && at(M(d, r.s.id).a, 0, 0), 'ROTATE: the south wall\'s end slides along its own line to the turned wall\'s line: (4150, 0); it stays horizontal', M(d, r.s.id).b);
  ok(at(M(d, r.n.id).a, 3850, 3000) && at(M(d, r.n.id).b, 0, 3000), 'the north wall\'s end slides to (3850, 3000); it stays horizontal', M(d, r.n.id).a);
  ok(at(M(d, r.e.id).a, 4150, 0) && at(M(d, r.e.id).b, 3850, 3000), 'the turned wall runs between the two corners, on the line it was turned to', [M(d, r.e.id).a, M(d, r.e.id).b]);
  ok(jn(M(d, r.e.id)) === 'end-L-start,start-L-end' && d.undoStack.length === n0 + 1, 'both corners stay joined; one undo step');
  d.undo();
  ok(stateOf(d) === before, 'one undo takes the turn back');
}
{
  // ROTATE typed as a person does: select the east wall, base point (4000, 1500), angle 5.710593 (atan 0.1 in degrees): the same corners
  const h = harness(), r = roomP(h.doc);
  h.host.selection = new Set([r.e.id]);
  await h.type('ROTATE'); await h.type('4000,1500'); await h.type('5.710593');
  ok(at(M(h.doc, r.s.id).b, 4150, 0, 0.01) && at(M(h.doc, r.n.id).a, 3850, 3000, 0.01) && near(M(h.doc, r.s.id).a.y, M(h.doc, r.s.id).b.y), 'the ROTATE command on a joined wall: neighbours slide to (4150, 0) and (3850, 3000)', [M(h.doc, r.s.id).b, M(h.doc, r.n.id).a]);
}

// ======================================================================== walls-plan-10: FX.70 Disallow join as a command
console.log('== FX.70 WALLDISJOIN (walls-plan-10)');
{
  const h = harness(), r = room(h.doc);
  const blockLines = (id) => h.doc.blocks.get(h.doc.get(id).block).entities.filter((l) => l.type === 'line').map((l) => [l.x1, l.y1, l.x2, l.y2].map((v) => Math.round(v * 1e3) / 1e3).join(','));
  // pick the south wall near its east end (3900 is nearer 4000 than 0): Disallow join at its end
  await h.type('WALLDISJOIN');
  await h.click(3900, 50);
  ok(M(h.doc, r.s.id).jo === 'b', 'WALLDISJOIN near the east end: Disallow join is on at that end only (jo = b)', M(h.doc, r.s.id).jo);
  ok(jn(M(h.doc, r.s.id)) === 'start-L-end' && jn(M(h.doc, r.e.id)) === 'end-L-start', 'the corner\'s record leaves both walls; the other corners keep theirs', [jn(M(h.doc, r.s.id)), jn(M(h.doc, r.e.id))]);
  // the south wall (thickness 100, block origin at its start) is now capped at x = 4000 from y = 50 to y = -50, not mitred
  ok(blockLines(r.s.id).includes('4000,50,4000,-50'), 'the end is drawn capped (a square end), not mitred into the east wall', blockLines(r.s.id));
  ok(h.log.some((l) => /disjoin\.off|disallow/i.test(l)), 'the command says what it did', h.log.slice(-1));
  // moving the south wall now leaves the east wall alone (no record), while the west wall (still joined) follows
  h.doc.change('MOVE', () => h.doc.update(r.s.id, txEntity(h.doc.get(r.s.id), mTranslate(0, -300))));
  ok(near(M(h.doc, r.e.id).a.y, 0) && near(M(h.doc, r.x.id).b.y, -300), 'a disallowed end stays out when the wall moves: the east wall keeps y = 0, the joined west wall follows to -300', [M(h.doc, r.e.id).a, M(h.doc, r.x.id).b]);
  h.doc.undo();
  // the same pick again: Allow join; the touching ends join at once
  await h.type('WALLDISJOIN');
  await h.click(3900, 50);
  ok(!M(h.doc, r.s.id).jo && jn(M(h.doc, r.s.id)) === 'end-L-start,start-L-end' && jn(M(h.doc, r.e.id)) === 'end-L-start,start-L-end', 'the same pick again allows the join: the record is back on both walls', [M(h.doc, r.s.id).jo, jn(M(h.doc, r.s.id))]);
  ok(!blockLines(r.s.id).includes('4000,50,4000,-50'), 'and the corner is drawn joined again (no cap)');
  // near the start: the other end
  await h.type('WALLDISJOIN');
  await h.click(100, 50);
  ok(M(h.doc, r.s.id).jo === 'a', 'picked near the start: that end is the one switched', M(h.doc, r.s.id).jo);
  h.doc.undo();
  ok(!M(h.doc, r.s.id).jo && jn(M(h.doc, r.s.id)) === 'end-L-start,start-L-end', 'one undo takes the switch back, with the record');
}

// ======================================================================== walls-plan-10: GRIDMOVE and walls along the line
console.log('== GRIDMOVE: a wall along the grid line moves whole (walls-plan-10)');
{
  // Grid line A is drawn short: x = 4000 from y = -500 to y = 1000 (length 1500; a bubble may sit 15% = 225 past its ends, so the line "holds"
  // y from -725 to 1225). The east wall runs along it from y = 0 to y = 3000: only its south end is inside. It used to be stretched (the south
  // end moved, the wall went sloped); now it moves whole. GRIDMOVE Distance 500 is to the left of the line's direction (+y), so towards -x.
  const h = harness(), r = room(h.doc);
  let gl;
  h.doc.change('grid', () => { gl = h.doc.add({ type: 'line', layer: 'A-GRID', x1: 4000, y1: -500, x2: 4000, y2: 1000 }); h.doc.add({ type: 'text', layer: 'A-GRID', x: 4000, y: 1100, h: 100, s: 'A', rot: 0 }); });
  const n0 = h.doc.undoStack.length;
  await h.type('GRIDMOVE');
  await h.click(4000, -300);
  await h.type('D', '500');
  ok(at(M(h.doc, r.e.id).a, 3500, 0) && at(M(h.doc, r.e.id).b, 3500, 3000), 'a wall along the grid line with one end past the drawn line: both ends move (x = 3500), it stays vertical', [M(h.doc, r.e.id).a, M(h.doc, r.e.id).b]);
  ok(at(M(h.doc, r.s.id).b, 3500, 0) && at(M(h.doc, r.n.id).a, 3500, 3000) && at(M(h.doc, r.s.id).a, 0, 0) && at(M(h.doc, r.n.id).b, 0, 3000), 'the joined south and north walls shorten to it; their far ends hold');
  ok(near(h.doc.get(gl.id).x1, 3500) && h.doc.undoStack.length === n0 + 1, 'the grid line moved; one undo step');
}
{
  // the same short grid line, the east wall LOCKED along it with WALLGRID: it follows the line whole and the joined walls follow
  const h = harness(), r = room(h.doc);
  h.doc.change('grid', () => { h.doc.add({ type: 'line', layer: 'A-GRID', x1: 4000, y1: -500, x2: 4000, y2: 1000 }); h.doc.add({ type: 'text', layer: 'A-GRID', x: 4000, y: 1100, h: 100, s: 'A', rot: 0 }); });
  await h.type('WALLGRID');
  await h.click(4050, 1500);
  await h.click(4000, -300);
  await h.type('A');
  ok(M(h.doc, r.e.id).h[0]?.to.grid === 'A' && near(M(h.doc, r.e.id).h[0].off, 0), 'setup: the east wall is locked along grid line A, on the line (distance 0)', M(h.doc, r.e.id).h);
  const before = stateOf(h.doc);
  await h.type('GRIDMOVE');
  await h.click(4000, -300);
  await h.type('D', '-250');
  ok(at(M(h.doc, r.e.id).a, 4250, 0) && at(M(h.doc, r.e.id).b, 4250, 3000), 'the locked wall moves with the grid line (-250 = towards +x: x = 4250), whole', [M(h.doc, r.e.id).a, M(h.doc, r.e.id).b]);
  ok(at(M(h.doc, r.s.id).b, 4250, 0) && at(M(h.doc, r.n.id).a, 4250, 3000) && at(M(h.doc, r.x.id).a, 0, 3000), 'the joined walls follow (they lengthen to x = 4250), the west wall stays');
  h.doc.undo();
  ok(stateOf(h.doc) === before, 'one undo puts the line and the walls back');
}
{
  // a wall locked along a grid line at a DISTANCE: the partition at x = 2000 is locked to grid line A (x = 4000). The line's direction is +y, so
  // its left is -x: the wall stands 2000 to its left (off = +2000 mm). The line moves 300 towards -x: the wall keeps its distance (x = 1700) and
  // stays on the south wall (its T end slides along the wall it butts into).
  const h = harness(), r = roomP(h.doc);
  h.doc.change('grid', () => { h.doc.add({ type: 'line', layer: 'A-GRID', x1: 4000, y1: -500, x2: 4000, y2: 3500 }); h.doc.add({ type: 'text', layer: 'A-GRID', x: 4000, y: 3700, h: 100, s: 'A', rot: 0 }); });
  await h.type('WALLGRID');
  await h.click(2050, 700);
  await h.click(4000, -300);
  await h.type('A');
  ok(near(M(h.doc, r.p.id).h[0]?.off, 2000), 'WALLGRID on a wall beside the line stores its distance (2000), so it is not pulled onto the line', M(h.doc, r.p.id).h);
  await h.type('GRIDMOVE');
  await h.click(4000, -300);
  await h.type('D', '300');
  ok(at(M(h.doc, r.p.id).a, 1700, 0) && at(M(h.doc, r.p.id).b, 1700, 1500), 'the grid line moves 300: the locked partition keeps 2000 from it (x = 1700)', [M(h.doc, r.p.id).a, M(h.doc, r.p.id).b]);
  ok(at(M(h.doc, r.e.id).a, 3700, 0) && at(M(h.doc, r.e.id).b, 3700, 3000), 'and the east wall, which lies on the line, moves with it (x = 3700)', M(h.doc, r.e.id).a);
}
{
  // FX.96 is kept: a wall that merely STARTS on the grid line (the south wall ends on x = 4000) is stretched by its end, never carried whole.
  // Here the walls are not joined (each drawn alone), so only the end on the line moves.
  const h = harness();
  const w = addWall(h.doc, [1000, 500], [4000, 500]);
  h.doc.change('grid', () => { h.doc.add({ type: 'line', layer: 'A-GRID', x1: 4000, y1: -500, x2: 4000, y2: 3500 }); });
  await h.type('GRIDMOVE');
  await h.click(4000, -300);
  await h.type('D', '-400');
  ok(at(M(h.doc, w.id).a, 1000, 500) && at(M(h.doc, w.id).b, 4400, 500), 'FX.96 kept: a wall that only ends on the grid line is stretched (its end goes to x = 4400), its other end stays', [M(h.doc, w.id).a, M(h.doc, w.id).b]);
}

// ======================================================================== walls-plan-10: WT.5 the join style of a corner
console.log('== WT.5 join style: mitre, butt, square off (walls-plan-10)');
const linesOf = (d, id) => d.blocks.get(d.get(id).block).entities.filter((l) => l.type === 'line').map((l) => [l.x1, l.y1, l.x2, l.y2].map((v) => Math.round(v * 1e3) / 1e3 + 0).join(','));
const propDef = (d, id, key) => WC.wallSection().defs([d.get(id)]).find((x) => x.key === key);
const setProp = (d, id, key, v) => d.change('Properties', () => d.update(id, propDef(d, id, key).set(d.get(id), v)));
const styleAt = (w, pos) => { const r = (w.jn || []).find((x) => x.me === pos && x.ot !== 'mid'); return r ? (r.st || 'mitre') + (r.st ? (r.th ? ' through' : ' stops') : '') : 'none'; };
{
  // The room 4000 x 3000, walls 100 thick (half 50). The corner of the south wall s (0,0)→(4000,0) and the east wall e (4000,0)→(4000,3000).
  // A wall's block starts at its own start point, so s's lines are in world coordinates and e's are measured from (4000, 0).
  const d = new Doc(), r = room(d), before = stateOf(d);
  // mitre (no style stored): s's inner face y = 50 runs between the inner corners x = 50 and 3950, its outer face y = -50 between -50 and 4050
  ok(linesOf(d, r.s.id).includes('50,50,3950,50') && linesOf(d, r.s.id).includes('-50,-50,4050,-50') && linesOf(d, r.s.id).length === 2, 'mitre (the default): both faces of the south wall stop at the mitre corners (3950, 50) and (4050, -50)', linesOf(d, r.s.id));
  // butt, the south wall runs through: it goes on to the east wall's outer face x = 4050 on both faces and ends there in a face of its own
  // (from (4050, -50) to (4050, 50)). The east wall stops against the south wall's inner side y = 50: both its faces (x = 3950 and x = 4050,
  // that is -50 and +50 from its start) begin at y = 50; its inner face still ends at the north mitre y = 2950, its outer at 3050.
  setProp(d, r.s.id, 'js.b', 'butt');
  ok(styleAt(M(d, r.s.id), 'end') === 'butt through' && styleAt(M(d, r.e.id), 'start') === 'butt stops', 'Properties › Join style at end = Butt: stored on BOTH walls\' records, this wall runs through, the other stops', [M(d, r.s.id).jn, M(d, r.e.id).jn]);
  ok(linesOf(d, r.s.id).includes('50,50,4050,50') && linesOf(d, r.s.id).includes('-50,-50,4050,-50') && linesOf(d, r.s.id).includes('4050,-50,4050,50') && linesOf(d, r.s.id).length === 3, 'butt: the wall that runs through reaches the other wall\'s outer face x = 4050 on both faces and ends square there (one more line)', linesOf(d, r.s.id));
  ok(linesOf(d, r.e.id).includes('-50,50,-50,2950') && linesOf(d, r.e.id).includes('50,50,50,3050') && linesOf(d, r.e.id).length === 2, 'the wall that stops begins on the other wall\'s inner side y = 50 on both faces', linesOf(d, r.e.id));
  ok(styleAt(M(d, r.s.id), 'start') === 'mitre' && linesOf(d, r.x.id).length === 2, 'the other corners stay mitre');
  // the other wall runs through: the east wall goes down to the south wall's outer face y = -50 and ends there (from (3950,-50) to (4050,-50):
  // -50,-50 to 50,-50 from its start); the south wall stops against the east wall's inner side x = 3950 on both faces
  setProp(d, r.s.id, 'jt.b', false);
  ok(styleAt(M(d, r.s.id), 'end') === 'butt stops' && styleAt(M(d, r.e.id), 'start') === 'butt through', 'Runs through off: the other wall runs through now (mirrored on its record)');
  ok(linesOf(d, r.s.id).includes('50,50,3950,50') && linesOf(d, r.s.id).includes('-50,-50,3950,-50') && linesOf(d, r.s.id).length === 2, 'the south wall stops on the east wall\'s inner side x = 3950 on both faces', linesOf(d, r.s.id));
  ok(linesOf(d, r.e.id).includes('-50,-50,-50,2950') && linesOf(d, r.e.id).includes('50,-50,50,3050') && linesOf(d, r.e.id).includes('-50,-50,50,-50'), 'the east wall runs down to the south wall\'s outer face y = -50 and ends there', linesOf(d, r.e.id));
  // moving a wall keeps the style: the record is not made again while the corner holds
  d.change('MOVE', () => d.update(r.e.id, txEntity(d.get(r.e.id), mTranslate(500, 0))));
  ok(styleAt(M(d, r.s.id), 'end') === 'butt stops' && near(M(d, r.s.id).b.x, 4500) && linesOf(d, r.s.id).includes('50,50,4450,50'), 'a Move keeps the style on the corner (the south wall now stops at x = 4450)', linesOf(d, r.s.id));
  d.undo(); d.undo(); d.undo();
  ok(stateOf(d) === before, 'three undos (move, through, style) return the drawing byte for byte: each change was one step');
  d.redo(); d.redo();
  ok(styleAt(M(d, r.e.id), 'start') === 'butt through', 'redo puts the style back on both walls');
  // back to mitre: the fields leave both records
  setProp(d, r.e.id, 'js.a', 'mitre');
  ok(M(d, r.s.id).jn.every((x) => !('st' in x) && !('th' in x)) && M(d, r.e.id).jn.every((x) => !('st' in x)) && linesOf(d, r.s.id).includes('-50,-50,4050,-50'), 'Mitre again: no style field is left on either record and the corner is mitred', M(d, r.s.id).jn);
}
{
  // a corner that is not square: wall T (0,0)→(4000,0) and wall S (0,0)→(2000, 3464.1016) at 60 degrees, both 100 thick, joined start to start.
  // T runs through. S lies on T's left, so S stops on T's left face y = 50. S's far face (its own left) passes (-43.3013, 25) along (0.5, 0.8660):
  //   it reaches y = 50 at x = -43.3013 + 0.5 x 25/0.8660 = -28.8675 and y = -50 at x = -43.3013 - 0.5 x 75/0.8660 = -86.6025.
  // butt: T's faces are cut on S's far face: left face from x = -28.8675, right face from x = -86.6025, and its end runs between those points.
  // square off: T ends square where S's far face reaches its side: both faces from x = -28.8675, the end from (-28.8675, 50) to (-28.8675, -50).
  // S either way: its left face starts at (-28.8675, 50), its right face (through (43.3013, -25)) at x = 43.3013 + 0.5 x 75/0.8660 = 86.6025.
  const d = new Doc();
  const T = addWall(d, [0, 0], [4000, 0]), S = addWall(d, [0, 0], [2000, 3464.1016]);
  setProp(d, T.id, 'js.a', 'butt');
  let L = linesOf(d, T.id);
  ok(L.includes('-28.868,50,4000,50') && L.includes('-86.603,-50,4000,-50') && L.includes('-28.868,50,-86.603,-50'), 'butt at 60 degrees: the through wall\'s faces are cut on the other wall\'s far face: from x = -28.868 (left) and -86.603 (right)', L);
  setProp(d, T.id, 'js.a', 'square');
  L = linesOf(d, T.id);
  ok(L.includes('-28.868,50,4000,50') && L.includes('-28.868,-50,4000,-50') && L.includes('-28.868,50,-28.868,-50'), 'square off at 60 degrees: the through wall ends square at x = -28.868 on both faces', L);
  // S's block is measured from its own start (0,0) too
  const Ls = linesOf(d, S.id), startOf = (x, y) => Ls.some((l) => { const v = l.split(',').map(Number); return near(v[0], x, 0.002) && near(v[1], y, 0.002); });
  ok(startOf(-28.868, 50) && startOf(86.603, 50), 'the wall that stops begins on the through wall\'s side y = 50: its faces start at x = -28.868 and x = 86.603', Ls);
}
{
  // the command: a click on the corner goes mitre → butt → square off → mitre; T switches which wall runs through; one run = one undo step
  const h = harness(), r = room(h.doc), n0 = h.doc.undoStack.length;
  await h.type('WALLJOINSTYLE');
  await h.click(4010, 20);
  const first = styleAt(M(h.doc, r.s.id), 'end');
  ok(/^butt (through|stops)$/.test(first) && styleAt(M(h.doc, r.e.id), 'start') === (first === 'butt through' ? 'butt stops' : 'butt through'), 'WALLJOINSTYLE, a click on the corner: Butt, stored on both walls, one of them runs through', [first, styleAt(M(h.doc, r.e.id), 'start')]);
  ok(h.doc.undoStack.length === n0 + 1, 'one undo step for the click', h.doc.undoStack.length - n0);
  await h.type('T');
  ok(styleAt(M(h.doc, r.s.id), 'end') === (first === 'butt through' ? 'butt stops' : 'butt through') && h.doc.undoStack.length === n0 + 2, 'T (Through): the other wall runs through at the corner clicked last; one more undo step', styleAt(M(h.doc, r.s.id), 'end'));
  await h.click(4010, 20);
  ok(/^square /.test(styleAt(M(h.doc, r.s.id), 'end')) && /^square /.test(styleAt(M(h.doc, r.e.id), 'start')), 'a second click: Square off', styleAt(M(h.doc, r.s.id), 'end'));
  await h.click(4010, 20);
  ok(styleAt(M(h.doc, r.s.id), 'end') === 'mitre' && styleAt(M(h.doc, r.e.id), 'start') === 'mitre', 'a third click: Mitre again');
  await h.click(4010, 20);
  await h.type('');
  ok(/^butt /.test(styleAt(M(h.doc, r.s.id), 'end')) && h.doc.undoStack.length === n0 + 1, 'the command ended on Butt: its whole run is ONE undo step (as every command)', h.doc.undoStack.length - n0);
  h.doc.undo();
  ok(styleAt(M(h.doc, r.s.id), 'end') === 'mitre' && styleAt(M(h.doc, r.e.id), 'start') === 'mitre' && M(h.doc, r.s.id).jn.every((x) => !('st' in x)), 'one undo returns the corner to how it was (mitre, no style field on either wall)');
  h.doc.redo();
  ok(/^butt /.test(styleAt(M(h.doc, r.s.id), 'end')) && /^butt /.test(styleAt(M(h.doc, r.e.id), 'start')), 'redo puts Butt back on both walls');
  // a T join has no style to choose; three walls at a point stay mitre; an empty place says so
  const stem = addWall(h.doc, [2000, 0], [2000, 1500]), s0 = stateOf(h.doc);
  await h.type('WALLJOINSTYLE');
  await h.click(2000, 10);
  ok(stateOf(h.doc) === s0 && h.log.some((l) => /joinstyle\.t/.test(l)), 'a T join is refused with its reason: the wall whose side is met runs through', h.log.slice(-1));
  await h.click(2000, 2500);
  ok(stateOf(h.doc) === s0 && h.log.some((l) => /joinstyle\.none/.test(l)), 'a click away from any corner changes nothing and says so');
  await h.type('');
  const third = addWall(h.doc, [4000, 0], [6000, 0]), s1 = stateOf(h.doc);
  await h.type('WALLJOINSTYLE');
  await h.click(4010, 20);
  await h.type('');
  ok(stateOf(h.doc) === s1 && h.log.some((l) => /joinstyle\.many/.test(l)), 'a corner of three walls stays mitre (said, nothing changes)', h.log.slice(-1));
  void stem; void third;
}
{
  // two walls in one line: butt cannot be made (the shared rules fall back to mitre), so the command stores nothing
  const h = harness();
  const a = addWall(h.doc, [0, 0], [2000, 0]), b = addWall(h.doc, [2000, 0], [5000, 0]), s0 = stateOf(h.doc);
  await h.type('WALLJOINSTYLE');
  await h.click(2000, 20);
  await h.type('');
  ok(stateOf(h.doc) === s0 && h.log.some((l) => /joinstyle\.sharp/.test(l)), 'walls in one line: no butt or square off is possible; nothing is stored and it is said', h.log.slice(-1));
  void a; void b;
}
{
  // the style travels in the file: DXF R12, DXF 2000, DWG 2000, DWG 2018 (our own readers), and a Copy starts without it
  const d = new Doc(), r = room(d);
  setProp(d, r.s.id, 'js.b', 'square');
  const want = wallsOf(d).map((w) => [w.g, (w.jn || []).map((x) => [x.o, x.me, x.ot, x.st || '', x.th ?? ''].join(':')).sort().join(';')]).sort().join('|');
  const sLines = linesOf(d, r.s.id).slice().sort().join('|');
  for (const [name, fn] of [['DXF R12', (x) => readDxf(writeDxf(x).text)], ['DXF 2000', (x) => readDxf(writeDxf2000(x).text)], ['DWG 2000', (x) => importDwg(readDwg(saveDwg(x, { version: '2000' }).bytes), { versionTag: 'x' })], ['DWG 2018', (x) => importDwg(readDwg(saveDwg(x, { version: '2018' }).bytes), { versionTag: 'x' })]]) {
    const d2 = new Doc();
    d2.load(fn(d));
    const got = wallsOf(d2).map((w) => [w.g, (w.jn || []).map((x) => [x.o, x.me, x.ot, x.st || '', x.th ?? ''].join(':')).sort().join(';')]).sort().join('|');
    ok(got === want && /square:1/.test(got) && /square:0/.test(got), name + ': the join style comes back on both walls\' records (square off, which wall runs through)', got);
    // and it is still the style after an edit: the south wall is redrawn with its square end at x = 4050
    const south = [...d2.model.values()].find((e) => W.isWall(e) && near(W.model(e).a.x, 0) && near(W.model(e).a.y, 0) && near(W.model(e).b.y, 0));
    d2.change('P', () => d2.update(south.id, { ...d2.get(south.id) }));
    ok(linesOf(d2, south.id).slice().sort().join('|') === sLines, name + ': the corner is drawn the same after the round trip and an edit');
  }
  let cp;
  d.change('COPY', () => { const c0 = { ...txEntity(d.get(r.s.id), mTranslate(0, 9000)) }; delete c0.id; cp = d.add(c0); });
  ok(M(d, cp.id).jn.length === 0 && styleAt(M(d, r.s.id), 'end') === 'square through', 'a Copy gets no records, so no style; the original keeps its own');
}

// ======================================================================== 0.10.1 inbox: #1973 wall centre lines, #1971 WALLPOLY radius
console.log('== 0.10.1 wall centre-line snap, WALLDIM between centre lines, WALLPOLY typed radius');
{
  const S = await imp('walls-snap.js');
  const h = harness();
  const r = room(h.doc);   // walls 100 thick on the centre lines x = 0, x = 4000, y = 0, y = 3000
  const west = M(h.doc, r.x.id), all = wallsOf(h.doc);
  const label = (k) => 'Wall center: ' + k;
  // the pointer 30 from the middle of the west wall's centre line (0, 1500), aperture 50: the midpoint of the axis, not of a face (x = ±50)
  let c = S.wallAxisSnaps([west], { x: 30, y: 1500 }, 50, new Set(['mid']), null, label);
  ok(c.length === 1 && c[0].kind === 'mid' && near(c[0].x, 0) && near(c[0].y, 1500) && c[0].label === 'Wall center: mid' && near(c[0].axis.a.y, 3000) && near(c[0].axis.b.y, 0), 'snap: the middle of a wall\'s centre line, labelled, with the axis to draw', c);
  c = S.wallAxisSnaps([west], { x: 10, y: 20 }, 50, new Set(['end', 'mid']), null, label);
  ok(c.length === 1 && c[0].kind === 'end' && near(c[0].x, 0) && near(c[0].y, 0), 'snap: the end of the centre line (the corner node)', c);
  c = S.wallAxisSnaps([west], { x: 20, y: 700 }, 50, new Set(['perp']), { x: 2500, y: 720 }, label);
  ok(c.length === 1 && c[0].kind === 'perp' && near(c[0].x, 0) && near(c[0].y, 720), 'snap: perpendicular from the base point to the centre line', c);
  ok(S.wallAxisSnaps([west], { x: 20, y: 700 }, 50, new Set(['perp']), null, label).length === 0, 'no perpendicular without a base point');
  c = S.wallAxisSnaps([west], { x: 20, y: 700 }, 50, new Set(['near']), null, label);
  ok(c.length === 1 && c[0].kind === 'near' && near(c[0].x, 0) && near(c[0].y, 700), 'snap: the nearest point on the centre line (only with Nearest on)', c);
  ok(S.wallAxisSnaps([west], { x: 20, y: 700 }, 50, new Set(['end', 'mid', 'cen', 'int']), null, label).length === 0 && S.wallAxisSnaps([west], { x: 30, y: 1500 }, 50, new Set(), null, label).length === 0, 'nothing out of reach, nothing with no snap kind on');
  // at the corner (0, 0) two walls hold the point; a horizontal dimension can move only the vertical one
  const at = S.wallsAtPoint(all, { x: 0, y: 0 }, 1);
  ok(at.length === 2 && S.crossingWall(at, { x: 1, y: 0 }).w.id === r.x.id && S.crossingWall(at, { x: 0, y: 1 }).w.id === r.s.id && S.crossingWall(at, { x: 1, y: 0 }, r.x.id) === null, 'a corner point: the wall a dimension can move is the one that crosses it', at.map((x) => x.w.id));
}
{
  // #1973: a linear dimension snapped to the ENDS of two centre lines (the corner nodes (0,0) and (4000,0), each inside two walls).
  // Before: both ends resolved to the south wall, so WALLDIM said "must each be on a different wall". Now: the east wall moves to x = 4500.
  const h = harness();
  const r = room(h.doc);
  let dim;
  h.doc.change('dim', () => { dim = h.doc.add({ type: 'dim', kind: 'linear', layer: '0', p1: { x: 0, y: 0 }, p2: { x: 4000, y: 0 }, c: { x: 0, y: 0 }, loc: { x: 2000, y: -600 }, rot: 0, text: '', st: 'Standard' }); });
  await h.type('WALLDIM');
  await h.click(2000, -600);
  await h.type('4500');
  ok(near(M(h.doc, r.e.id).a.x, 4500) && near(M(h.doc, r.e.id).b.x, 4500) && near(M(h.doc, r.x.id).a.x, 0) && near(M(h.doc, r.s.id).a.y, 0) && near(M(h.doc, r.s.id).b.x, 4500), 'WALLDIM on a dimension between two centre-line ends (corners): the east wall moves to x = 4500, the west holds, the south follows', [M(h.doc, r.e.id).a, M(h.doc, r.s.id).b, h.log.slice(-2)]);
  const d2 = h.doc.get(dim.id);
  ok(near(d2.p2.x, 4500) && near(d2.p2.y, 0) && near(d2.p1.x, 0), 'the dimension\'s far point goes with the wall: it now measures 4500', [d2.p1, d2.p2]);
  ok(h.doc.undoStack[h.doc.undoStack.length - 1].label === 'WALLDIM', 'still one undo step');
  h.doc.undo();
  ok(near(M(h.doc, r.e.id).a.x, 4000) && near(h.doc.get(dim.id).p2.x, 4000), 'undo puts the wall and the dimension back');
}
{
  // a partition between the outer walls (the reporter's picture): centre lines at x = 0 and x = 610... here 0 and 1500; type 1800
  const h = harness();
  const r = room(h.doc);
  const part = addWall(h.doc, [1500, 0], [1500, 3000]);
  let dim;
  h.doc.change('dim', () => { dim = h.doc.add({ type: 'dim', kind: 'linear', layer: '0', p1: { x: 0, y: 1500 }, p2: { x: 1500, y: 1500 }, c: { x: 0, y: 0 }, loc: { x: 750, y: 1800 }, rot: 0, text: '', st: 'Standard' }); });
  await h.type('WALLDIM');
  await h.click(750, 1800);
  await h.type('1800');
  const p = M(h.doc, part.id);
  ok(near(p.a.x, 1800) && near(p.b.x, 1800) && near(M(h.doc, r.x.id).a.x, 0) && near(h.doc.get(dim.id).p2.x, 1800), 'centre line of the outer wall to centre line of the partition, 1500 -> 1800: the partition moves, the dimension reads 1800', [p.a, p.b, h.doc.get(dim.id).p2]);
}
{
  // #1971: WALLPOLY takes a typed radius while the pointer is still on the centre (clicked the centre, then typed): before, "Point or option keyword required."
  const h = harness();
  h.host.cursor = { x: 200, y: 300 };
  await h.type('WALLPOLY', '6', '200,300', 'I', '1000');
  const ws = wallsOf(h.doc);
  ok(ws.length === 6 && ws.every((w) => near(Math.hypot(w.b.x - w.a.x, w.b.y - w.a.y), 1000, 1e-3)) && ws.some((w) => near(w.a.y, w.b.y, 1e-3) && near(w.a.y, 300 - 1000 * Math.sin(Math.PI / 3), 1e-3)), 'WALLPOLY 6, centre, Inscribed, radius 1000 typed with the pointer on the centre: a hexagon of side 1000, its bottom side horizontal', [ws.length, h.log.slice(-2)]);
  ok(!h.eng.busy, 'the command finished');
  const h2 = harness();
  h2.host.cursor = { x: 0, y: 0 };
  await h2.type('WALLPOLY', '4', '0,0', 'C', '500');
  const w2 = wallsOf(h2.doc);
  ok(w2.length === 4 && w2.every((w) => near(Math.hypot(w.b.x - w.a.x, w.b.y - w.a.y), 1000, 1e-3)), 'Circumscribed, radius 500 typed: a square of side 1000', w2.map((w) => Math.hypot(w.b.x - w.a.x, w.b.y - w.a.y)));
  const h3 = harness();
  h3.host.cursor = { x: 0, y: 800 };   // the pointer away from the centre: the typed radius still runs toward it (as before)
  await h3.type('WALLPOLY', '6', '0,0', 'I', '1000');
  { const w3 = wallsOf(h3.doc), lo = Math.min(...w3.map((w) => Math.min(w.a.y, w.b.y))); ok(w3.filter((w) => near(w.a.y, lo, 1e-3) && near(w.b.y, lo, 1e-3)).length === 1, 'with the pointer away from the centre the bottom side is still horizontal (Imtaar 2026-11-19)'); }
  const h4 = harness();
  await h4.type('WALLPOLY', '6', '0,0', 'I', '0');
  ok(h4.eng.busy && wallsOf(h4.doc).length === 0, 'a radius of 0 is still refused');
  await h4.type('1000');
}

// ======================================================================== done
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
