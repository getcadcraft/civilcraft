/* SPDX-License-Identifier: Apache-2.0 */
/**
 * tools07.mjs — known answers for ModelCraft's 0.7 drawing tools (session `mesh`): MC-DIVIDE (an edge or curve into
 * equal parts) and MC-CALC (arithmetic in the value box), run by bin/test-modelcraft.mjs.
 *   run({ok, close, section, APP})
 * The kernel functions on hand-built geometry, then the tools driven by clicks and typing through a Camera, in both key
 * styles (the tool is the same; the keys reach it the same way).
 */
import path from 'node:path';

export async function run({ ok, close, section, APP }) {
  const M = await import(path.join(APP, 'model.js'));
  const V = await import(path.join(APP, 'vec.js'));
  const { Camera } = await import(path.join(APP, 'camera.js'));
  const { sceneOf } = await import(path.join(APP, 'infer.js'));
  const { Tools } = await import(path.join(APP, 'tools.js'));
  const lens = (d, ids) => ids.map((id) => { const e = d.edges.get(id); return V.dist(d.verts.get(e.a), d.verts.get(e.b)); });

  section('divide an edge or curve into equal parts (0.7 MC-DIVIDE)');
  {
    // a straight edge
    const m = new M.Model(), d = m.root;
    M.addEdge(d, [0, 0, 0], [10, 0, 0]);
    const r = M.divideEdges(d, { edge: [...d.edges.keys()][0] }, 4);
    ok(r.verts.length === 3 && r.edges.length === 4 && lens(d, r.edges).every((L) => close(L, 2.5, 1e-12)), 'a 10 m line into 4: three corners, four 2.5 m pieces in order');
    ok(V.dist(d.verts.get(r.verts[0]), [2.5, 0, 0]) < 1e-12 && V.dist(d.verts.get(r.verts[2]), [7.5, 0, 0]) < 1e-12, 'the corners at 2.5 m and 7.5 m');
    let msg = '';
    try { M.divideEdges(d, { edge: r.edges[0] }, 1); } catch (e) { msg = e.message; }
    ok(/from 2 to 1000/.test(msg), 'one part is refused: ' + msg);
    try { M.divideEdges(d, { edge: 999999 }, 3); msg = ''; } catch (e) { msg = e.message; }
    ok(/gone/.test(msg), 'an edge that is gone: ' + msg);
    // an edge of a face: the face keeps its area and gains the corners
    const m2 = new M.Model(), d2 = m2.root;
    M.addPolygon(d2, M.rectPts([0, 0, 0], [1, 0, 0], [0, 1, 0], 6, 4));
    const bottom = [...d2.edges].find(([, e]) => close(d2.verts.get(e.a)[1], 0) && close(d2.verts.get(e.b)[1], 0))[0];
    M.divideEdges(d2, { edge: bottom }, 3);
    const f = [...d2.faces.values()][0];
    ok(d2.faces.size === 1 && f.loops[0].length === 6 && close(M.faceArea(d2, f), 24, 1e-12), 'an edge of a 6 × 4 m face into 3: one face, 6 corners, still 24 m²');
    // a circle that bounds its face only: re-drawn with 8 segments on the true circle
    const m3 = new M.Model(), d3 = m3.root;
    const pts = M.ngonPts([1, 1, 0], [0, 0, 1], [1, 0, 0], 2, 24);
    M.addPolygon(d3, pts, [0, 0, 1]);
    const cid = M.tagCurve(d3, pts, 'circle', true);
    const r3 = M.divideEdges(d3, { curve: cid }, 8);
    const ci = M.curveInfo(d3, cid);
    ok(ci.segs === 8 && ci.round && close(ci.radius, 2, 1e-9) && r3.edges.length === 8, 'a 24-segment circle into 8: an 8-segment circle, radius 2 m, still one curve');
    ok(d3.faces.size === 1 && close(M.faceArea(d3, [...d3.faces.values()][0]), 8 * Math.SQRT2, 1e-9), 'its face is the octagon (11.31 m²)');
    ok(d3.verts.size === 8, 'the old corners are gone');
    // an arc: 12 → 3 segments, the ends stay put
    const m4 = new M.Model(), d4 = m4.root;
    const ap = M.arcPts([0, 0, 0], [0, 0, 1], [1, 0, 0], 5, Math.PI / 2, 12);
    for (let i = 0; i + 1 < ap.length; i++) M.addEdge(d4, ap[i], ap[i + 1]);
    const acid = M.tagCurve(d4, ap, 'arc');
    M.divideEdges(d4, { curve: acid }, 3);
    const ai = M.curveInfo(d4, acid);
    const ends = ai.verts.length ? [d4.verts.get(ai.verts[0]), d4.verts.get(ai.verts[ai.verts.length - 1])] : [];
    ok(ai.segs === 3 && close(ai.radius, 5, 1e-9) && close(ai.sweep, Math.PI / 2, 1e-9), 'a quarter arc into 3: three 30° segments, radius 5 m');
    ok(ends.some((p) => V.dist(p, [5, 0, 0]) < 1e-12) && ends.some((p) => V.dist(p, [0, 5, 0]) < 1e-9), 'its ends did not move');
    // a pulled cylinder: its rim meets the side faces (not flat in its faces' planes), so it is divided along its length
    const m5 = new M.Model(), d5 = m5.root;
    const cp = M.ngonPts([0, 0, 0], [0, 0, 1], [1, 0, 0], 1, 24);
    M.addPolygon(d5, cp, [0, 0, 1]);
    M.tagCurve(d5, cp, 'circle', true);
    M.pushPull(d5, [...d5.faces.keys()][0], 2);
    const v0 = M.solidInfo(d5).volume;
    const rim = [...d5.edges].find(([, e]) => e.curve);
    const before = d5.verts.size;
    const r5 = M.divideEdges(d5, { curve: rim[1].curve, edge: rim[0] }, 5);
    ok(M.solidInfo(d5).closed && close(M.solidInfo(d5).volume, v0, 1e-12) && d5.verts.size === before + r5.verts.length, 'a pulled cylinder\'s rim into 5: corners added on its segments, the solid unchanged');
    const total = lens(d5, r5.edges).reduce((a, b) => a + b, 0);
    let s = 0, at = [];
    for (const L of lens(d5, r5.edges)) { s += L; at.push(s); }
    ok(r5.verts.length === 4 && [1, 2, 3, 4].every((k) => at.some((x) => close(x, (k * total) / 5, 1e-9))), 'the new corners sit at fifths of the rim\'s length');
    ok(r5.edges.every((id) => d5.edges.get(id).curve === rim[1].curve) && lens(d5, r5.edges).length === 28, 'that rim is divided: 28 pieces, still one curve');
    // one undo step through the model
    const m6 = new M.Model();
    M.addEdge(m6.root, [0, 0, 0], [3, 0, 0]);
    const n0 = m6.root.edges.size;
    m6.change('divide', (mm) => M.divideEdges(mm.root, { edge: [...mm.root.edges.keys()][0] }, 3), ['root']);
    ok(m6.root.edges.size === 3, 'through change(): three pieces');
    m6.undo();
    ok(m6.root.edges.size === n0, 'one undo: one edge again');
  }

  section('the Divide tool, by clicks and typing (0.7 MC-DIVIDE)');
  for (const keys of ['sketchup', 'blender']) {
    const model = new M.Model();
    model.units = 'm';
    const cam = new Camera();
    cam.setSize(1000, 800);
    let cache = null, ov = null, vcb = '';
    const host = {
      model, cam, path: [], sel: [], units: 'm', msgs: [], keys,
      scene() { if (!cache || cache.version !== host.model.version) cache = sceneOf(host.model); return cache; },
      setSel(s) { host.sel = s; }, overlay(o) { ov = o; }, tip() {}, vcb(l, x) { vcb = x; }, print(m) { host.msgs.push(m); }, changed() {},
      openContext(p) { host.path = p; }, closeContext() { host.path = host.path.slice(0, -1); },
    };
    const T = new Tools(host);
    cam.eye = [5, -12, 10]; cam.target = [5, 0, 0]; cam.clip(30);
    const at = (p) => cam.project(p);
    let tt = 0;
    model.change('line', (mm) => M.addEdge(mm.root, [0, 0, 0], [10, 0, 0]), ['root']);
    T.set('divide');
    // the pointer in the middle: two parts; near an end: more
    let s = at([5, 0, 0]); T.move({ x: s[0], y: s[1] });
    ok(T.tool.n === 2 && ov?.points?.length === 1 && V.dist(ov.points[0], [5, 0, 0]) < 1e-9, keys + ': over the middle of the line: 2 parts, one mark at 5 m');
    s = at([0.6, 0, 0]); T.move({ x: s[0], y: s[1] });
    ok(T.tool.n > 6 && ov.points.length === T.tool.n - 1 && vcb === String(T.tool.n), keys + `: near its end: more parts (${T.tool.n}), marks and the value box agree`);
    // typing divides at once
    T.value('5');
    ok(model.root.edges.size === 5 && T.name === 'select' && host.sel.length === 5 && host.msgs.at(-1) === 'Divided into 5 parts.', keys + ': typing 5 divides into 5, back to Select with the pieces selected');
    model.undo();
    // a selected edge first, then the tool: /4 and 4s work too
    host.setSel([{ t: 'e', id: [...model.root.edges.keys()][0] }]);
    T.set('divide');
    T.value('/4');
    ok(model.root.edges.size === 4, keys + ': with the edge selected, "/4" divides it into 4');
    model.undo();
    host.setSel([]);
    T.set('divide');
    s = at([2.5, 0, 0]); T.move({ x: s[0], y: s[1] });
    const want = T.tool.n;
    T.click(s[0], s[1], { time: (tt += 1000) });
    ok(model.root.edges.size === want && want >= 2, keys + `: a click divides into the parts shown (${want})`);
    // nothing under the pointer: typing says to pick one
    model.undo();
    T.set('divide');
    T.move({ x: 990, y: 790 });
    T.value('3');
    ok(model.root.edges.size === 1 && /Pick an edge or curve first/.test(host.msgs.at(-1)), keys + ': nothing to divide: it says to pick an edge first');
    T.value('1');
    ok(/from 2 to/.test(host.msgs.at(-1)), keys + ': "1" is refused with the range');
  }

  section('/n with an edge or arc selected divides it (0.7 MC-DIVIDE, the roadmap\'s cases)');
  {
    const model = new M.Model();
    model.units = 'm';
    const host = { model, cam: new Camera(), path: [], sel: [], units: 'm', msgs: [], scene() { return sceneOf(model); }, setSel(x) { host.sel = x; }, overlay() {}, tip() {}, vcb() {}, print(x) { host.msgs.push(x); }, changed() {} };
    const T = new Tools(host);
    let d = model.root;
    // a line /3
    model.change('line', () => M.addEdge(d, [0, 0, 0], [9, 0, 0]), ['root']);
    host.setSel([{ t: 'e', id: [...d.edges.keys()][0] }]);
    T.value('/3');
    ok(d.edges.size === 3 && lens(d, [...d.edges.keys()]).every((L) => close(L, 3, 1e-12)) && host.sel.length === 3, 'a 9 m line selected, /3: three 3 m pieces, selected');
    model.undo();
    d = model.root;   // undo puts back new definition objects
    ok(d.edges.size === 1, 'undo: one line again (one step)');
    // an arc /4: equal angles on the true arc, not along its chords
    model.change('arc', () => { d = model.root; const ap = M.arcPts([20, 0, 0], [0, 0, 1], [1, 0, 0], 4, Math.PI, 7); for (let i = 0; i + 1 < ap.length; i++) M.addEdge(d, ap[i], ap[i + 1]); M.tagCurve(d, ap, 'arc'); }, ['root']);
    const arcE = [...d.edges].filter(([, e]) => e.curve?.startsWith('arc:')).map(([id]) => ({ t: 'e', id }));
    host.setSel(arcE);
    T.value('/4');
    d = model.root;
    const ai = M.curveInfo(d, d.edges.get(host.sel[0].id).curve);
    const angs = [];
    for (let i = 0; i + 1 < ai.verts.length; i++) { const a = d.verts.get(ai.verts[i]), b = d.verts.get(ai.verts[i + 1]); angs.push(Math.acos(V.dot(V.norm(V.sub(a, ai.center)), V.norm(V.sub(b, ai.center))))); }
    ok(ai.segs === 4 && angs.every((x) => close(x, Math.PI / 4, 1e-9)) && ai.verts.every((v) => close(V.dist(d.verts.get(v), [20, 0, 0]), 4, 1e-9)), 'a 7-segment half circle selected, /4: four 45° segments, every corner on the arc');
    // a 24-segment circle /6
    model.change('circle', () => { const cp = M.ngonPts([0, 20, 0], [0, 0, 1], [1, 0, 0], 3, 24); M.addPolygon(d, cp, [0, 0, 1]); M.tagCurve(d, cp, 'circle', true); }, ['root']);
    const circE = [...d.edges].filter(([, e]) => e.curve?.startsWith('circle:')).map(([id]) => ({ t: 'e', id }));
    host.setSel(circE);
    T.value('/6');
    d = model.root;
    const cc = M.curveInfo(d, d.edges.get(host.sel[0].id).curve);
    ok(cc.segs === 6 && cc.round && close(cc.radius, 3, 1e-9) && [...d.faces.values()].some((f) => close(M.faceArea(d, f), 1.5 * Math.sqrt(3) * 9, 1e-9)), 'a 24-segment circle selected, /6: a hexagon on the same circle, its face too');
    model.undo(); model.undo(); model.undo();
    d = model.root;
    ok(M.curveInfo(d, [...d.edges.values()].find((e) => e.curve?.startsWith('arc:')).curve).segs === 7 && ![...d.edges.values()].some((e) => e.curve?.startsWith('circle:')), 'undo three times (the hexagon, the circle, the /4): the arc has 7 segments again');
    // /3 straight after a copy (the copy still selected) still spreads copies
    const n0 = d.edges.size;
    host.setSel([{ t: 'e', id: [...d.edges.keys()][0] }]);
    T.lastCopy = { delta: [0, 1, 0], src: host.sel.slice(), sel: host.sel.map((x) => x.t + x.id).sort().join() };
    const spread = T.tool.value({ kind: 'divide', n: 3 });
    ok(d.edges.size !== n0 + 2 || spread !== undefined, '/3 right after a copy, with the copy selected, is the copy command (not a divide)');
    T.lastCopy = null;
  }

  section('arithmetic in the value box (0.7 MC-CALC)');
  {
    const U = await import(path.join(APP, 'units.js'));
    const pv = (s, u) => U.parseValue(s, u);
    ok(close(pv('2.5/3', 'm').v, 2.5 / 3, 1e-12), '2.5/3 in a meter model: 0.8333 m (tangentsoft\'s trisected line)');
    ok(close(pv('(2.5)/3', 'm').v, 2.5 / 3, 1e-12), '(2.5)/3: the same');
    ok(close(pv('2*450mm', 'm').v, 0.9, 1e-12), '2*450mm: 0.9 m');
    ok(close(pv('12\'6"+3/4"', 'ft-in').v, (150.75) * 0.0254, 1e-12), '12\'6"+3/4": 12\' 6 3/4"');
    ok(close(pv('(24\'-0")/3', 'ft-in').v, 8 * 0.3048, 1e-12), '(24\'-0")/3: 8\'');
    ok(close(pv('4+7/16', 'ft-in').v, 4.4375 * 0.0254, 1e-12), '4+7/16 in a feet-and-inches model: 4 7/16" (a bare number is inches)');
    ok(close(pv('100+50', 'mm').v, 0.15, 1e-12) && close(pv('3m-25cm', 'mm').v, 2.75, 1e-12), '100+50 in a millimeter model: 150 mm; 3m-25cm: 2.75 m');
    ok(pv('90/2', 'm').num === 45 && pv('30+15', 'm').num === 45 && pv('2*45', 'm').num === 90, 'for angles and factors the plain number: 90/2 = 45, 30+15 = 45, 2*45 = 90');
    ok(pv('/3', 'm').kind === 'divide' && pv('/3', 'm').n === 3 && pv('3x', 'm').kind === 'array' && pv('*3', 'm').kind === 'array' && pv('24s', 'm').kind === 'sides' && pv('24s', 'm').n === 24, '/3, 3x, *3 and 24s keep their meanings');
    ok(close(pv('4m,3m', 'm').vs[0], 4) && close(pv('4m/2,3m', 'm').vs[0], 2) && close(pv('<0,0,10\'/2>', 'ft-in').p[2], 5 * 0.3048, 1e-12), 'inside lists and offsets too: 4m/2,3m and <0,0,10\'/2>');
    const z = pv('2.5/0', 'm'), e = pv('2.5/', 'm'), p = pv('(2.5', 'm'), a = pv('2m*3m', 'm');
    ok(z.kind === 'error' && /Division by zero \(character 4\)/.test(z.message), '2.5/0 says: ' + z.message);
    ok(e.kind === 'error' && /ends too soon/.test(e.message) && p.kind === 'error' && /bracket is not closed/.test(p.message), 'a missing value and an open bracket each say where');
    ok(a.kind === 'error' && /area, not a length/.test(a.message), 'two lengths multiplied: ' + a.message);
    ok(close(pv('10\'6"', 'ft-in').v, 126 * 0.0254, 1e-12) && close(pv('-3m', 'm').v, -3) && close(pv('6-1/2"', 'ft-in').v, 6.5 * 0.0254, 1e-12), 'plain lengths read as before: 10\'6", -3m, 6-1/2"');
  }

  section('the tape measure, Move and Push/pull take a calculation (0.7 MC-CALC)');
  {
    const model = new M.Model();
    model.units = 'm';
    const cam = new Camera();
    cam.setSize(1000, 800);
    let cache = null;
    const host = {
      model, cam, path: [], sel: [], units: 'm', msgs: [],
      scene() { if (!cache || cache.version !== host.model.version) cache = sceneOf(host.model); return cache; },
      setSel(x) { host.sel = x; }, overlay() {}, tip() {}, vcb() {}, print(m) { host.msgs.push(m); }, changed() {},
      openContext(p) { host.path = p; }, closeContext() { host.path = host.path.slice(0, -1); },
    };
    const T = new Tools(host);
    cam.eye = [2, -12, 10]; cam.target = [2, 0, 0]; cam.clip(30);
    const at = (p) => cam.project(p);
    let tt = 0;
    const clickAt = (p) => { const s = at(p); T.click(s[0], s[1], { time: (tt += 1000) }); };
    const moveTo = (p) => { const s = at(p); T.move({ x: s[0], y: s[1] }); };
    // tangentsoft's case: a 2.5 m line; the tape from one end, typed 2.5/3 → a guide point a third of the way along
    model.change('line', (mm) => M.addEdge(mm.root, [0, 0, 0], [2.5, 0, 0]), ['root']);
    T.set('tape');
    clickAt([0, 0, 0]);
    moveTo([1.5, 0, 0]);
    T.value('2.5/3');
    const gp = [...model.guides.values()].find((g) => g.kind === 'point');
    ok(gp && V.dist(gp.p, [2.5 / 3, 0, 0]) < 1e-9, 'tape measure from an end, typed 2.5/3: a guide point at 0.833 m on the line');
    // a box pushed up by a calculation, then moved by one
    model.change('rect', (mm) => M.addPolygon(mm.root, M.rectPts([4, 0, 0], [1, 0, 0], [0, 1, 0], 2, 2)), ['root']);
    T.set('push');
    clickAt([5, 1, 0]);
    T.value('(3)/2');
    const s1 = M.solidInfo(model.root);
    ok(s1.closed && close(s1.volume, 6, 1e-9), `push/pull typed (3)/2: 1.5 m high, 6 m³ (${s1.volume})`);
    model.change('group', (mm) => mm.makeGroup(mm.root, [...mm.root.faces.keys()].map((id) => ({ t: 'f', id })), 'group'), ['root']);
    const iid = [...model.root.insts.keys()][0];
    host.setSel([{ t: 'i', id: iid }]);
    T.set('move');
    clickAt([4, 0, 0]);
    moveTo([4, 2, 0]);
    T.value('2*1.5');
    ok(close(model.root.insts.get(iid).m[13], 3, 1e-9), 'Move typed 2*1.5 toward green: 3 m (' + model.root.insts.get(iid).m[13] + ')');
    T.set('select');
    host.setSel([{ t: 'i', id: iid }]);
    T.set('move');
    clickAt([4, 3, 0]);
    moveTo([4, 4, 0]);
    T.value('2.5/0');
    const said = host.msgs.at(-1);
    T.escape();
    ok(close(model.root.insts.get(iid).m[13], 3, 1e-9) && /Division by zero/.test(said), 'a refused calculation says why, and Esc leaves the box where it was: ' + said);
  }
}

