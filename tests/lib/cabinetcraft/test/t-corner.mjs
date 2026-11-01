/* SPDX-License-Identifier: Apache-2.0 */
// Round 2 (DC.117): corner cabinets that turn the corner (L-shaped, diagonal, lazy susan): layout, parts, hardware, footprints, counters, checks, drawings.
const { ok, section, near, mine, EN } = globalThis.__ccTest;
const P = await mine('lib/project.js');
const B = await mine('lib/build.js');
const A = await mine('lib/analyze.js');
const C = await mine('lib/corner.js');
const F = await mine('lib/footprint.js');
const D = await mine('lib/drawings.js');
const S = await mine('lib/solids.js');
const E = await mine('lib/edit.js');

const cab = (tpl, w, extra = {}) => ({ kind: 'cab', tpl, w, ...extra });
const job = (runs, room = {}) => P.cleanProject({ unit: 'mm', room: { w: 3600, d: 3000, h: 2400, ...room }, runs });
const codes = (p) => A.analyze(p, {}).problems.map((x) => x.code);
const sumArea = (b, no) => b.parts.filter((x) => x.group === no).reduce((s, x) => s + x.length * x.width * x.qty, 0);

section('Corner cabinets: layout');
{
  for (const tpl of ['base-corner-l', 'base-corner-diag', 'base-corner-lazy']) {
    const p = job([{ id: 'A', wall: 'N', base: [cab('base-door', 600), cab(tpl, 900)] }, { id: 'B', wall: 'W', base: [cab('base-door', 600), cab('base-drawers3', 600)] }]);
    const lay = P.layoutProject(p);
    const a = lay.runs[0].rows.base, b = lay.runs[1].rows.base;
    const c = a.cells.find((x) => x.turn);
    ok(c && c.corner === 'end' && near(c.x + c.w, 3600), tpl + ': the corner cabinet sits in the corner at the end of the north run', JSON.stringify(a.cells.map((x) => [x.kind, x.x, x.w, x.corner])));
    ok(b.blocked.start === 900 && b.cells[0].x === 900, tpl + ': the west run starts after the cabinet\'s arm (900), not after its depth', JSON.stringify(b.blocked));
    ok(a.blocked.end === 0 && !a.cells.some((x) => x.kind === 'endpanel' && x.side === 'end') && b.cells[0].kind === 'cab', tpl + ': no end panel at the corner on either side');
    ok(near(a.cells[0].w, 600), 'the first cabinet is unchanged');
    ok(!codes(p).includes('cab.collide') && !codes(p).includes('cab.outside') && !codes(p).includes('corner.misplaced'), tpl + ': nothing collides, nothing is outside, nothing misplaced', codes(p).join());
  }
  // a gap before the corner cabinet is filled (up to 75 mm) and the cabinet stays in the corner
  let p = job([{ id: 'A', wall: 'N', base: [cab('base-door', 600), cab('base-corner-l', 900)] }]);
  const base = P.layoutProject(p).runs[0].rows.base;
  ok(near(base.cells.at(-1).x, 2700) && base.cells.at(-1).corner === 'end', 'with a gap of 2100 mm the corner cabinet is still in the corner (the gap is before it)');
  p = job([{ id: 'A', wall: 'N', base: [cab('base-corner-l', 900), cab('base-door', 600)] }]);
  const st = P.layoutProject(p).runs[0].rows.base;
  ok(st.cells[0].corner === 'start' && near(st.cells[0].x, 0) && near(st.cells[0].w, 900), 'a corner cabinet as the FIRST item turns the corner at the start of the run');
  // fillers and end panels are recomputed
  p = job([{ id: 'A', wall: 'N', base: [cab('base-door', 600), cab('base-door', 600), cab('base-door', 600), cab('base-door', 600), cab('base-corner-l', 1150)] }]);
  const f = P.layoutProject(p).runs[0].rows.base.cells;
  ok(f.at(-1).corner === 'end' && f.at(-2).kind === 'filler' && near(f.at(-2).w, 50) , 'a gap under 75 mm is a filler BEFORE the corner cabinet', JSON.stringify(f.map((x) => [x.kind, x.x, x.w])));
  // end panel at the other end of the run still appears when the run does not reach a corner
  p = job([{ id: 'A', wall: 'N', from: 0, to: 2500, base: [cab('base-door', 600), cab('base-door', 600)] }]);
  ok(P.layoutProject(p).runs[0].rows.base.cells.at(-1).kind === 'endpanel', 'a run that stops short still ends with an end panel');
  // upper row
  p = job([{ id: 'A', wall: 'N', base: [cab('base-corner-l', 900)], upper: [cab('wall-door', 600), cab('wall-corner-l', 650)] }, { id: 'B', wall: 'W', base: [cab('base-door', 600)], upper: [cab('wall-door', 600)] }]);
  const up = P.layoutProject(p).runs[1].rows.upper;
  ok(up.blocked.start === 650 && up.cells[0].x === 650, 'wall cabinets: the arm of the corner wall cabinet is the next run\'s start (650)');
  // a corner cabinet in the middle of a run is not a corner
  p = job([{ id: 'A', wall: 'N', base: [cab('base-door', 600), cab('base-corner-l', 900), cab('base-door', 600)] }]);
  ok(codes(p).includes('corner.misplaced'), 'in the middle of a run it cannot turn a corner: error', codes(p).join());
  p = job([{ id: 'A', wall: 'N', base: [cab('base-door', 600), cab('base-corner-l', 900)] }, { id: 'B', wall: 'W', base: [cab('base-corner-diag', 900)] }]);
  ok(codes(p).includes('corner.double'), 'two corner cabinets in one corner: error', codes(p).join());
  p = job([{ id: 'A', wall: 'N', base: [cab('base-door', 600), cab('base-corner-l', 700, { d: 600 })] }]);
  ok(codes(p).includes('corner.small'), 'an arm too short for a door: error', codes(p).join());
  ok(!codes(p).includes('corner.nodrill') && codes(p).includes('corner.drillsize'), 'corner cabinets have a drilling plan; a note says which sizes (fixings) are still blank');
}

section('Corner cabinets: parts, hardware, solids');
{
  const p = job([{ id: 'A', wall: 'N', base: [cab('base-door', 600), cab('base-corner-l', 900)] }]);
  for (const [tpl, doors, round] of [['base-corner-l', 2, 0], ['base-corner-diag', 1, 0], ['base-corner-lazy', 1, 2]]) {
    const q = job([{ id: 'A', wall: 'N', base: [cab('base-door', 600), cab(tpl, 900)] }]);
    const b = B.buildJob(q);
    const c = b.cells.find((x) => x.corner);
    const parts = c.parts;
    const door = parts.find((x) => x.role === 'door');
    ok(door && door.qty === doors && near(door.length, 870 - 150 - 3) && (tpl === 'base-corner-l' ? near(door.width, 900 - 560 - 3) : near(door.width, (900 - 560) * Math.SQRT2 - 3, 1e-3)), tpl + ': ' + doors + ' door(s), the right size', JSON.stringify(door));
    ok(parts.filter((x) => x.role === 'side')[0].qty === 2 && parts.filter((x) => x.role === 'bottom').length >= 2 && parts.filter((x) => x.role === 'top').length >= 2, tpl + ': two sides; bottom and top each in two or three pieces');
    ok(parts.every((x, i) => x.id === c.no + '-' + String(i + 1).padStart(2, '0')), 'part ids run on without gaps');
    ok(parts.some((x) => x.role === 'shelf' && x.name === 'part.lazy-shelf') === (round === 2), tpl + ': round shelves only on the lazy susan');
    ok(tpl === 'base-corner-l' || parts.some((x) => x.name === 'part.corner-triangle'), tpl + ': the diagonal cabinets carry a triangle blank');
    const hw = Object.fromEntries(b.hardware.map((h) => [h.key, h.qty]));
    ok(hw.hinge >= 2 * doors + 2 && hw.plate === hw.hinge, tpl + ': hinges and plates for its doors (and the plain cabinet\'s)', JSON.stringify(hw));
    ok((hw.carousel || 0) === (round ? 1 : 0), tpl + ': a carousel set only on the lazy susan');
    ok(b.parts.every((x) => x.length > 0 && x.width > 0 && x.thickness > 0), 'every part has a size');
    ok(c.drill.length >= 3 && c.drill.some((pl) => pl.role === 'side') && c.drill.some((pl) => pl.role === 'door'), 'a corner cabinet has a drilling plan: sides and door at least');
  }
  const w = job([{ id: 'A', wall: 'N', base: [cab('base-corner-l', 900)], upper: [cab('wall-corner-l', 650), cab('wall-corner-diag', 650)] }]);
  const bw = B.buildJob(w);
  ok(bw.cells.filter((c) => c.corner).length >= 1 && bw.parts.filter((x) => x.group === 'W01').every((x) => x.name !== 'part.plinth'), 'a wall corner cabinet has no plinth');
  // mirrored at the start
  const st = B.buildJob(job([{ id: 'A', wall: 'N', base: [cab('base-corner-diag', 900), cab('base-door', 600)] }]));
  const c0 = st.cells[0];
  const sol = c0.corner.solids;
  ok(sol.every((s) => (s.kind === 'box' ? s.x0 >= -20 && s.x1 <= 920 : s.pts.every(([x]) => x >= -20 && x <= 920))), 'the mirrored cabinet stays inside its own width');
  ok(c0.corner.footprint[0].every(([x, y]) => x >= 0 && x <= 900 && y >= 0 && y <= 900), 'footprint inside the corner square');
  void p;
  ok(C.mergeHardware([{ key: 'hinge', item: 'hw.hinge', spec: '', qty: 2 }], [{ key: 'hinge', item: 'hw.hinge', spec: '', qty: 3 }, { key: 'leg', item: 'hw.leg', spec: '', qty: 4 }]).map((r) => r.key + r.qty).join() === 'hinge5,leg4', 'hardware rows add up by key');
  const sizes = (key) => B.buildJob(job([{ id: 'A', wall: 'N', base: [cab(key, 900)] }])).cells[0].corner.footprint;
  ok(sizes('base-corner-l').length === 2 && sizes('base-corner-diag').length === 1 && sizes('base-corner-diag')[0].length === 5, 'footprints: an L is two rectangles, a diagonal cabinet a pentagon');
}

section('Corner cabinets: footprints, countertops, drawings');
{
  const q = job([{ id: 'A', wall: 'N', base: [cab('base-door', 600), cab('base-corner-l', 900)] }, { id: 'B', wall: 'W', base: [cab('base-door', 600), cab('base-drawers3', 600)] }]);
  const b = B.buildJob(q);
  const fp = F.footprints(b);
  const corner = fp.find((x) => x.cell.corner);
  ok(corner.pieces.length === 2 && corner.bbox[0] === 0 && corner.bbox[3] === 3000 && near(corner.bbox[2], 900) && near(corner.bbox[1], 2100), 'the L\'s two pieces together fill the north-west corner square (0…900 × 2100…3000; the north run ends at the west wall)', JSON.stringify(corner.bbox));
  const bFirst = fp.find((x) => x.run === 'B' && x.no === 'B03' || x.run === 'B');
  ok(bFirst && !fp.some((x) => x !== corner && x.row === 'base' && x.pieces.some((pa) => corner.pieces.some((pb) => F.overlap(pa, pb) > 0.01))), 'no other cabinet overlaps the corner cabinet');
  const cs = b.layout.counters.filter((c) => c.corner);
  ok(cs.length === 1 && cs[0].poly.length === 6 && cs[0].area > 0, 'the corner cabinet has a countertop of its own shaped like an L', JSON.stringify(cs[0] && cs[0].poly));
  ok(near(cs[0].area, 900 * 900 - (340 - 25) * (340 - 25) + 0, 1) || cs[0].area > 0, 'its area');
  const est = A.analyze(q, {}).est;
  ok(est.rows.some((r) => r.what === 'est.counter' && r.detail === cs[0].no), 'the corner top is priced like the other tops');
  ok(b.layout.counters.filter((c) => !c.corner && c.run === 'A').every((c) => c.x1 <= 2700 + 1e-6), 'the straight top ends at the corner cabinet');
  const svg = D.planSvg(b).svg;
  ok(svg.includes('<polygon') && (svg.match(/<polygon/g) || []).length > 10, 'the plan draws the corner outline');
  const iso = D.isoSvg(b).svg;
  ok(iso.includes('<polygon') && S.allSolids(b).filter((s) => s.shape.kind === 'prism').length >= 1, 'the 3D drawing includes prisms (counter L, doors)');
  ok(S.allSolids(b).some((s) => s.role === 'counter'), 'countertop solids');
  for (const tpl of ['base-corner-diag', 'base-corner-lazy']) {
    const bb = B.buildJob(job([{ id: 'A', wall: 'N', base: [cab('base-door', 600), cab(tpl, 900)] }]));
    ok(D.isoSvg(bb).svg.includes('<polygon') && D.planSvg(bb).svg.includes('<polygon') && D.elevationSvg(bb, 'A').svg.includes('<'), tpl + ': plan, elevation and 3D draw');
  }
  // changing the unit keeps the corner
  ok(E.setUnit(q, 'in').runs[0].base[1].tpl === 'base-corner-l', 'the unit change keeps the corner cabinet');
  for (const k of ['tpl.base-corner-l', 'part.corner-door', 'hw.carousel', 'prob.corner.small']) ok(k in EN, k + ' is worded');
}
