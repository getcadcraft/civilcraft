#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * plan2d.mjs — 0.9 PLAN2D: walls, doors and windows; the hatch link; layer groups; stacked floors. Node, no page.
 *   node tools/cadcraft-test/plan2d.mjs
 */
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const APP = path.join(ROOT, 'public_html/assets/apps/cadcraft/dev/');
const imp = (f) => import(pathToFileURL(APP + f).href);
let pass = 0, fail = 0;
const ok = (c, m, x = '') => { if (c) { pass++; if (process.argv.includes('--verbose')) console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (x !== '' ? ' — ' + JSON.stringify(x) : '')); } };
const near = (a, b, e = 1e-6) => Math.abs(a - b) <= e;

const { Doc } = await imp('doc.js');
await imp('commands.js');
const { installClasses } = await imp('classes-cmd.js');
const W = await imp('plan2d/walls.js');
const { installWalls, wallHook } = await imp('walls-cmd.js');
const { installPlan } = await imp('plan2d-cmd.js');
const F = await imp('floors.js');
const H = await imp('hatch-assoc.js');
const G = await imp('layergroups.js');
const { readDxf, writeDxf } = await imp('dxf.js');
const { writeDxf2000 } = await imp('dxf2000.js');
const { saveDwg } = await imp('dwg-save.js');
const { importDwg } = await imp('dwg-import.js');
const { readDwg } = await imp('dwg/read.js');
const { txEntity, mTranslate, mRotate, mScale, mAbout, mMirror, gripMove, grips, prims, entityBounds } = await imp('geom.js');
const { walk } = await imp('walk.js');
installClasses(); installPlan(); installWalls();

const raw = (a, b, t = 100, ops = []) => W.withWallData({ type: 'insert', layer: 'P-Walls', color: null, block: '*WALLNEW', x: a[0], y: a[1], rot: 0, sx: 1, sy: 1 }, { v: 1, a: [0, 0], b: [b[0] - a[0], b[1] - a[1]], t, f: '', ops });
const addWall = (d, a, b, t, ops) => { let e; d.change('WALL', () => { e = d.add(raw(a, b, t, ops)); }); return d.get(e.id); };
const linesOf = (d, e) => d.blocks.get(d.get(e.id).block).entities.filter((x) => x.type === 'line').map((l) => [l.x1 + d.get(e.id).x, l.y1 + d.get(e.id).y, l.x2 + d.get(e.id).x, l.y2 + d.get(e.id).y].map((v) => +v.toFixed(3)).join(','));
const hasLine = (d, e, s) => linesOf(d, e).includes(s);

// ---- walls
{
  const d = new Doc();
  const a = addWall(d, [0, 0], [1000, 0]);
  ok(d.get(a.id).block.startsWith('*U') && d.blocks.has(d.get(a.id).block), 'a wall gets its own anonymous block');
  ok(hasLine(d, a, '0,50,0,-50') && hasLine(d, a, '1000,50,1000,-50'), 'a lone wall is capped at both ends', linesOf(d, a));
  const b = addWall(d, [1000, 0], [1000, 1000]);
  ok(hasLine(d, a, '0,-50,1050,-50') && hasLine(d, a, '0,50,950,50'), 'an L corner mitres the first wall', linesOf(d, a));
  ok(hasLine(d, b, '1050,-50,1050,1000') && hasLine(d, b, '950,50,950,1000'), 'and the second', linesOf(d, b));
  ok(!hasLine(d, a, '1000,50,1000,-50'), 'no cap on the joined end');
  const c = addWall(d, [500, 20], [500, 800]);
  ok(W.model(d.get(c.id)).a.y === 0, 'an end drawn within the wall lands on its centre line', W.model(d.get(c.id)).a);
  ok(hasLine(d, c, '450,50,450,800'), 'a T stem stops at the near face', linesOf(d, c));
  ok(hasLine(d, a, '0,50,450,50') && hasLine(d, a, '550,50,950,50') && hasLine(d, a, '0,-50,1050,-50'), 'the host opens on that face only', linesOf(d, a));
  // move: joined walls follow; one undo takes it all back
  const before = JSON.stringify([...d.model.values()]);
  d.change('MOVE', () => d.update(a.id, txEntity(d.get(a.id), mTranslate(0, -500))));
  const mb = W.model(d.get(b.id)), mc = W.model(d.get(c.id));
  ok(near(mb.a.y, -500) && near(mb.a.x, 1000) && near(mb.b.y, 1000), 'moving a wall stretches the wall joined at its end', mb);
  ok(near(mc.a.y, -500) && near(mc.a.x, 500) && near(mc.b.y, 800), 'and the T stem follows its host', mc);
  ok(hasLine(d, a, '0,-550,1050,-550'), 'the moved wall is redrawn at its place');
  d.undo();
  ok(JSON.stringify([...d.model.values()]) === before, 'one undo takes the wall and its neighbours back');
  // crossing
  const d2 = new Doc();
  const x = addWall(d2, [0, 0], [1000, 0]), y = addWall(d2, [500, -500], [500, 500]);
  ok(hasLine(d2, x, '0,50,450,50') && hasLine(d2, x, '550,-50,1000,-50') && hasLine(d2, y, '450,-500,450,-50') && hasLine(d2, y, '450,50,450,500'), 'a crossing opens all four faces', linesOf(d2, y));
  // rotate, mirror, scale of a whole wall
  const d3 = new Doc();
  const op = { k: 'door', st: 'single', at: 500, w: 200, hinge: 's', sw: 1, open: 90 };
  const r = addWall(d3, [0, 0], [1000, 0], 100, [op]);
  d3.change('ROTATE', () => d3.update(r.id, txEntity(d3.get(r.id), mRotate(Math.PI / 2))));
  let m = W.model(d3.get(r.id));
  ok(near(m.b.x, 0, 1e-6) && near(m.b.y, 1000, 1e-6) && (d3.get(r.id).rot || 0) === 0, 'a turned wall ends up redrawn with no rotation', m);
  d3.change('MIRROR', () => d3.update(r.id, txEntity(d3.get(r.id), mMirror({ x: 0, y: 0 }, { x: 0, y: 1000 }))));
  ok(W.model(d3.get(r.id)).ops[0].sw === -1 && (d3.get(r.id).sx ?? 1) === 1, 'a mirror flips the door swing');
  d3.change('SCALE', () => d3.update(r.id, txEntity(d3.get(r.id), mScale(2))));
  m = W.model(d3.get(r.id));
  ok(near(m.t, 200) && near(m.ops[0].w, 400) && near(m.ops[0].at, 1000), 'a scale scales thickness and openings', m);
  // copy: its own block
  const d4 = new Doc();
  const s = addWall(d4, [0, 0], [1000, 0]);
  let copy;
  d4.change('COPY', () => { const c0 = { ...txEntity(d4.get(s.id), mTranslate(0, 5000)) }; delete c0.id; copy = d4.add(c0); });
  ok(d4.get(copy.id).block !== d4.get(s.id).block, 'a copy gets a block of its own');
  // erase a neighbour: the survivor is capped again
  const d5 = new Doc();
  const p = addWall(d5, [0, 0], [1000, 0]), q = addWall(d5, [1000, 0], [1000, 1000]);
  d5.change('ERASE', () => d5.remove(q.id));
  ok(hasLine(d5, p, '1000,50,1000,-50'), 'a wall whose neighbour is erased gets its cap back', linesOf(d5, p));
  d5.undo();
  ok(d5.get(q.id) && !hasLine(d5, p, '1000,50,1000,-50'), 'undo joins them again');
  // grips
  const d6 = new Doc();
  const g = addWall(d6, [0, 0], [1000, 0], 100, [{ ...op }]), g2 = addWall(d6, [1000, 0], [1000, 500]);
  const gr = grips(d6.get(g.id));
  ok(['wall:a', 'wall:b', 'wall:mid', 'wall:op:0', 'wall:swing:0', 'wall:hinge:0'].every((k) => gr.some((x) => x.key === k)), 'grips: ends, middle, opening, flips', gr.map((x) => x.key));
  d6.change('grip', () => d6.update(g.id, gripMove(d6.get(g.id), 'wall:b', { x: 1000, y: 200 })));
  ok(near(W.model(d6.get(g2.id)).a.y, 200), 'dragging an end takes the joined wall with it', W.model(d6.get(g2.id)));
  d6.change('grip', () => d6.update(g.id, gripMove(d6.get(g.id), 'wall:op:0', { x: 300, y: 500 })));
  const m6 = W.model(d6.get(g.id));
  ok(m6.ops[0].at > 200 && m6.ops[0].at < 400, 'a door slides along by its grip', m6.ops);
  const flipped = W.wallGripAct(d6.get(g.id), 'wall:swing:0');
  ok(W.model(flipped).ops[0].sw === -1, 'the swing arrow flips the door');
  // opening rules and symbols
  const w0 = { id: 1, a: { x: 0, y: 0 }, b: { x: 3000, y: 0 }, t: 100, f: '', ops: [{ ...op, at: 1000, w: 900 }] };
  ok(W.fits(w0, { at: 1200, w: 900 }) === 'overlap' && W.fits(w0, { at: 2200, w: 900 }) === true && W.fits(w0, { at: 100, w: 5000 }) === 'long', 'openings can\'t overlap or outrun the wall');
  const g1 = W.geometry(w0, []);
  ok(g1.arcs.length === 1 && near(g1.arcs[0].r, 900), 'a door has a swing arc');
  const closed = W.geometry({ ...w0, ops: [{ ...w0.ops[0], open: 0 }] }, []);
  ok(closed.arcs.length === 0, 'a closed door has none');
  ok(W.geometry({ ...w0, ops: [{ ...w0.ops[0], st: 'double' }] }, []).arcs.length === 2, 'a double door has two');
  ok(W.geometry({ ...w0, ops: [{ ...w0.ops[0], k: 'window', st: 'fixed' }] }, []).arcs.length === 0, 'a fixed window none');
  ok(W.geometry({ ...w0, f: 'solid' }, []).fills.length === 2, 'the fill stops at the opening');
  // left-of-travel clicks
  const off = W.offsetChain([{ x: 0, y: 0 }, { x: 1000, y: 0 }, { x: 1000, y: 1000 }], -50);
  ok(near(off[0].y, -50) && near(off[1].x, 1050) && near(off[1].y, -50) && near(off[2].x, 1050), 'clicks along a face give the centre line', off);
  // bad data
  ok(W.wallData({ type: 'insert', xd: { [W.APP]: [[1000, '{broken']] } }) === null && W.cleanWall({ a: [0, 'x'], b: [1, 1], t: 1 }) === null, 'a broken wall in a file is ignored');
}

// ---- walls and floors through files
const roundTrips = [
  ['DXF R12', (d) => readDxf(writeDxf(d).text)],
  ['DXF 2000', (d) => readDxf(writeDxf2000(d).text)],
  ['DWG 2018', (d) => importDwg(readDwg(saveDwg(d, { version: '2018' }).bytes), { versionTag: 'x' })],
  ['DWG 2000', (d) => importDwg(readDwg(saveDwg(d, { version: '2000' }).bytes), { versionTag: 'x' })],
];
{
  const make = () => {
    const d = new Doc();
    F.enableFloors(d, ['Ground', 'Upper']);
    addWall(d, [0, 0], [3000, 0], 100, [{ k: 'door', st: 'single', at: 1000, w: 900, hinge: 'e', sw: -1, open: 90 }]);
    addWall(d, [3000, 0], [3000, 2000]);
    F.setActiveFloor(d, 'f2');
    addWall(d, [0, 0], [0, 2000]);
    G.addGroup(d, 'Proposed');
    G.setLayerGroup(d, 'P-Walls', 'Proposed');
    let box, hat;
    d.change('t', () => { box = d.add({ type: 'poly', layer: '0', closed: true, pts: [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 100, y: 100 }, { x: 0, y: 100 }] }); hat = d.add({ type: 'hatch', layer: '0', solid: false, pattern: 'ANSI31', pscale: 1, pangle: 0, loops: H.__ || [[0, 0, 100, 0, 100, 100, 0, 100]] }); H.linkHatch(d, hat, [{ ids: [box.id] }]); });
    return { d, box: box.id, hat: hat.id };
  };
  for (const [name, trip] of roundTrips) {
    const { d } = make();
    let back;
    try { back = await trip(d); } catch (err) { ok(false, name + ': round trip threw', String(err)); continue; }
    const o = new Doc();
    o.load(back);
    const walls = [...o.model.values()].filter(W.isWall);
    ok(walls.length === 3, name + ': three walls come back', walls.length);
    const dw = walls.find((e) => W.model(e)?.ops.length);
    ok(dw && W.model(dw).ops[0].hinge === 'e' && W.model(dw).ops[0].sw === -1 && near(W.model(dw).ops[0].w, 900), name + ': the door keeps its settings');
    ok(dw && o.blocks.get(dw.block)?.entities.some((x) => x.type === 'arc'), name + ': the block has the door swing');
    const FF = F.floorsOf(o);
    ok(FF?.list.length === 2 && FF.active === 'f2', name + ': floors come back', FF);
    ok(walls.filter((e) => F.floorOf(o, e) === 'f2').length === 1, name + ': each wall keeps its floor');
    ok(G.groupsOf(o)[0]?.name === 'Proposed' && G.groupsOf(o)[0].layers.includes('P-Walls'), name + ': layer groups come back');
    const hb = [...o.model.values()].find((e) => e.type === 'hatch');
    if (name !== 'DXF R12') ok(hb && H.isLinked(hb), name + ': the hatch keeps its link', hb && Object.keys(hb));   // R12 has no hatch object: it is written as lines
    if (hb && H.isLinked(hb)) {
      const src = [...o.model.values()].find((e) => e.type === 'poly');
      o.change('MOVE', () => o.update(src.id, txEntity(src, mTranslate(50, 0))));
      ok(near(o.get(hb.id).loops[0][0], 50), name + ': and still follows after opening');
    }
    // the wall still acts after opening
    if (dw) { const before = W.model(dw); o.change('t', () => o.update(dw.id, txEntity(o.get(dw.id), mTranslate(0, -100)))); ok(walls.some((e) => e.id !== dw.id && near(W.model(o.get(e.id)).a.y, -100)), name + ': a joined wall still follows after opening', before.a); }
  }
}

// ---- the hatch link
{
  const rect = (x = 0, y = 0, w = 100, h = 100) => ({ type: 'poly', layer: '0', closed: true, pts: [{ x, y }, { x: x + w, y }, { x: x + w, y: y + h }, { x, y: y + h }] });
  const d = new Doc();
  let box, h;
  d.change('HATCH', () => { box = d.add(rect()); h = d.add({ type: 'hatch', layer: '0', solid: false, pattern: 'ANSI31', pscale: 1, pangle: 0, loops: [[0, 0, 100, 0, 100, 100, 0, 100]] }); H.linkHatch(d, h, [{ ids: [box.id] }]); });
  ok(H.isLinked(d.get(h.id)) && d.get(h.id).assoc === true, 'a new hatch is linked');
  const mv = (id, m) => d.change('T', () => d.update(id, txEntity(d.get(id), m)));
  mv(box.id, mTranslate(200, 30));
  ok(near(d.get(h.id).loops[0][0], 200) && near(d.get(h.id).loops[0][1], 30), 'moving the boundary moves the hatch', d.get(h.id).loops);
  ok(near(d.get(h.id).ox, 200) && near(d.get(h.id).oy, 30), 'and its pattern');
  d.undo();
  ok(near(d.get(h.id).loops[0][0], 0) && !d.get(h.id).ox, 'one undo takes both back');
  mv(box.id, mAbout({ x: 0, y: 0 }, mRotate(Math.PI / 2)));
  ok(near(d.get(h.id).loops[0][2], 0, 1e-6) && near(d.get(h.id).loops[0][3], 100, 1e-6) && near(d.get(h.id).pangle, Math.PI / 2), 'turning it turns the hatch and the pattern angle', d.get(h.id));
  d.undo();
  mv(box.id, mScale(2));
  ok(near(d.get(h.id).loops[0][2], 200) && near(d.get(h.id).pscale, 2), 'scaling it scales the hatch and the pattern', d.get(h.id).pscale);
  d.undo();
  mv(h.id, mTranslate(0, 500));
  ok(near(d.get(box.id).pts[0].y, 500), 'moving the hatch brings its boundary, like a filled shape');
  d.undo();
  d.change('G', () => d.update(box.id, gripMove(d.get(box.id), 'v2', { x: 300, y: 300 })));
  ok(d.get(h.id).loops[0].includes(300), 'reshaping the boundary reshapes the hatch', d.get(h.id).loops);
  ok(H.isLinked(d.get(h.id)), 'and it stays linked');
  d.undo();
  // moved together
  d.change('M', () => { d.update(box.id, txEntity(d.get(box.id), mTranslate(10, 0))); d.update(h.id, txEntity(d.get(h.id), mTranslate(10, 0))); });
  ok(near(d.get(h.id).loops[0][0], 10) && near(d.get(box.id).pts[0].x, 10), 'moved together: not moved twice', d.get(h.id).loops[0][0]);
  d.undo();
  // copies
  let cb, ch;
  d.change('COPY', () => { const a = { ...d.get(box.id) }; delete a.id; const b = { ...d.get(h.id) }; delete b.id; cb = d.add(a); ch = d.add(b); });
  ok(H.isLinked(d.get(ch.id)) && JSON.stringify(H.linkOf(d.get(ch.id)).o) !== JSON.stringify(H.linkOf(d.get(h.id)).o), 'a copy of both has its own link');
  mv(cb.id, mTranslate(0, 700));
  ok(near(d.get(ch.id).loops[0][1], 700) && near(d.get(h.id).loops[0][1], 0), 'moving the copy\'s boundary moves only the copy\'s hatch');
  let lone;
  d.change('COPY', () => { const b = { ...d.get(h.id) }; delete b.id; lone = d.add(b); });
  ok(!H.isLinked(d.get(lone.id)), 'a copy of the hatch alone has no link');
  // erased boundary
  d.change('E', () => d.remove(box.id));
  ok(d.get(h.id) && !H.isLinked(d.get(h.id)), 'erasing the boundary leaves the hatch, unlinked');
  d.undo();
  ok(H.isLinked(d.get(h.id)), 'undo links it again');
  // picked inside four lines
  const d2 = new Doc();
  const ids = [];
  d2.change('L', () => { for (const [a, b, c, e] of [[0, 0, 100, 0], [100, 0, 100, 100], [100, 100, 0, 100], [0, 100, 0, 0]]) ids.push(d2.add({ type: 'line', layer: '0', x1: a, y1: b, x2: c, y2: e }).id); });
  const loop = [0, 0, 100, 0, 100, 100, 0, 100];
  const srcs = H.sourcesOf(d2.all(), [loop]);
  ok(srcs.length === 4, 'a picked area finds its four lines', srcs);
  let h2;
  d2.change('HATCH', () => { h2 = d2.add({ type: 'hatch', layer: '0', solid: true, loops: [loop] }); H.linkHatch(d2, h2, [{ seed: { x: 50, y: 50 }, ids: srcs }]); });
  d2.change('M', () => { for (const id of ids) d2.update(id, txEntity(d2.get(id), mTranslate(1000, 0))); });
  ok(near(d2.get(h2.id).loops[0][0], 1000), 'all four moved: the hatch follows');
  d2.change('G', () => d2.update(ids[0], { ...d2.get(ids[0]), y1: -50, y2: -50 }));
  ok(!H.isLinked(d2.get(h2.id)), 'an edge moved so the shape no longer closes: the link ends, the hatch stays', d2.get(h2.id).loops);
  // pattern follows on a plain MOVE with no link
  const pm = txEntity({ type: 'hatch', layer: '0', solid: false, pattern: 'ANSI31', pscale: 1, loops: [[0, 0, 1, 0, 1, 1]] }, mTranslate(5, 6));
  ok(pm.ox === 5 && pm.oy === 6, 'MOVE on any hatch takes its pattern along');
}

// ---- layer groups
{
  const d = new Doc();
  const made = G.addStandardSet(d);
  ok(made > 10 && G.groupsOf(d).length === 5 && d.layers.has('P-Walls'), 'the ready-made set adds groups and layers', made);
  G.addStandardSet(d);
  ok(G.groupsOf(d).length === 5, 'adding it again changes nothing');
  ok(G.grouped(d, ['0', 'P-Walls', 'E-Walls'])[1].names.includes('P-Walls') && G.grouped(d, ['0', 'P-Walls']).at(-1).names.includes('0'), 'grouped: group order, ungrouped last');
  G.groupSwitch(d, 'Existing', 'on', false);
  ok(!d.layers.get('E-Walls').on && d.layers.get('P-Walls').on, 'a group switch turns only its layers off');
  d.undo();
  ok(d.layers.get('E-Walls').on, 'one undo');
  d.setLayer('E-Walls', {}, { current: true });
  G.groupSwitch(d, 'Existing', 'on', false);
  ok(d.layers.get('E-Walls').on && !d.layers.get('E-Doors').on, 'the current layer stays on');
  d.setLayer('P-Doors', { name: 'P-Openings' });
  ok(G.groupOfLayer(d, 'P-Openings')?.name === 'Proposed', 'a renamed layer stays in its group');
  d.undo();
  ok(G.groupOfLayer(d, 'P-Doors')?.name === 'Proposed', 'undo renames it back in the group');
  G.setLayerGroup(d, 'P-Walls', 'Services');
  ok(G.groupOfLayer(d, 'P-Walls').name === 'Services' && !G.groupsOf(d).find((g) => g.name === 'Proposed').layers.includes('P-Walls'), 'a layer is in one group at most');
  G.deleteGroup(d, 'Services');
  ok(d.layers.has('P-Walls') && !G.groupOfLayer(d, 'P-Walls'), 'deleting a group keeps its layers');
  const e = new Doc();
  for (const n of ['E-A', 'E-B', 'P-A', 'Lone']) e.change('l', () => { const s = e.layerState(); s.list.push({ name: n, color: 7, on: true, frozen: false, locked: false, plot: true }); e.setLayerState(s); });
  ok(G.groupByPrefix(e) === 1 && G.groupsOf(e)[0].name === 'E' && G.groupsOf(e)[0].layers.length === 2, 'by name: only prefixes two layers share');
  ok(new Doc().meta.layerGroups === undefined, 'a drawing without groups stays without');
}

// ---- floors
{
  const d = new Doc();
  let a;
  d.change('L', () => { a = d.add({ type: 'line', layer: '0', x1: 0, y1: 0, x2: 10, y2: 0 }); });
  ok(F.floorView(d, null) === null && d.visible(d.get(a.id)) && d.editable(d.get(a.id)), 'no floors: nothing changes');
  F.enableFloors(d, ['Ground', 'First']);
  ok(F.floorOf(d, d.get(a.id)) === 'f1', 'what was drawn is on the first floor');
  F.setActiveFloor(d, 'f2');
  let b;
  d.change('L', () => { b = d.add({ type: 'line', layer: '0', x1: 0, y1: 5, x2: 10, y2: 5 }); });
  ok(F.floorIdOf(d.get(b.id)) === 'f2', 'new objects go on the active floor');
  ok(d.visible(d.get(a.id)) && !d.editable(d.get(a.id)) && d.editable(d.get(b.id)), 'another floor shows, can be snapped to, can\'t be changed');
  const fv = F.floorView(d, null);
  ok(fv(d.get(a.id)) === 1 && fv(d.get(b.id)) === 0, 'it draws faded');
  F.setFloorOn(d, 'f1', false);
  ok(!d.visible(d.get(a.id)) && F.floorView(d, null)(d.get(a.id)) === 2, 'turned off, it is gone');
  ok(d.visible(d.get(b.id)), 'the active floor stays');
  d.undo();
  ok(d.visible(d.get(a.id)), 'undo turns it back on');
  // draw count
  const seen = (D, frozen) => { const out = { strokes: 0, faded: 0 }; walk(D, D.model.values(), { stroke: (c, p, lw, o) => { out.strokes++; if (o?.alpha < 1) out.faded++; }, fill() {}, text() {} }, { frozen }); return out; };
  const v1 = seen(d, null);
  ok(v1.strokes === 2 && v1.faded === 1, 'walk: one plain, one faded', v1);
  // viewport
  const fz = new Set(); fz.flr = 'f1';
  const v2 = F.floorView(d, fz);
  ok(v2(d.get(a.id)) === 0 && v2(d.get(b.id)) === 2, 'a viewport can show one floor');
  const v3 = F.floorView(d, new Set());
  ok(v3(d.get(a.id)) === 0 && v3(d.get(b.id)) === 0, 'a viewport with no floor shows those on, unfaded');
  // copy up
  F.setActiveFloor(d, 'f1');
  const cp = F.copyToFloor(d, [a.id], 'f2');
  ok(cp.length === 1 && F.floorIdOf(d.get(cp[0])) === 'f2' && d.get(a.id), 'copy to a floor leaves the original');
  // walls join within a floor only
  const dw = new Doc();
  F.enableFloors(dw, ['G', '1']);
  const w1 = addWall(dw, [0, 0], [1000, 0]);
  F.setActiveFloor(dw, 'f2');
  const w2 = addWall(dw, [1000, 0], [1000, 1000]);
  ok(hasLine(dw, w1, '1000,50,1000,-50'), 'walls on different floors don\'t join');
  // delete + to layers
  const n = F.deleteFloor(d, 'f1');
  ok(n >= 1 && F.floorOf(d, d.get(a.id)) === 'f2' && d.visible(d.get(a.id)), 'deleting a floor keeps its objects', n);
  d.undo();
  const moved = F.floorsToLayers(d);
  ok(moved === 3 && d.layers.has('Ground-0') && d.get(a.id).layer === 'Ground-0' && d.get(b.id).layer === 'First-0' && !F.floorsOf(d), 'floors to layers', moved);
  d.undo();
  ok(F.floorsOf(d) && d.get(a.id).layer === '0', 'undo brings floors back');
  // order
  const dm = new Doc();
  F.enableFloors(dm, ['A', 'B']);
  let u; dm.change('l', () => { u = dm.add({ type: 'line', layer: '0', x1: 0, y1: 0, x2: 1, y2: 0 }); });
  F.moveFloor(dm, 'f1', 1);
  ok(F.floorOf(dm, dm.get(u.id)) === 'f1' && F.floorsOf(dm).list[0].id === 'f2', 'reordering keeps objects on their floor');
  ok(F.cleanFloors({ list: [{ id: 'bad id!', name: 'x' }, { id: 'f1', name: '' }] }) === null && F.cleanFloors('x') === null, 'a broken floor table in a file is ignored');
}

console.log(pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
