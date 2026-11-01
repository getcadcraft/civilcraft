/* SPDX-License-Identifier: Apache-2.0 */
/**
 * corner.js — corner cabinets that turn the corner (0.8 DC.117, session `cabinetcraft_addon` round 2). DOM-free, pure.
 *
 * A turn-corner cabinet stands in a room corner and has an arm along each of the two walls. Its own frame (the corner at the END of its run):
 * x along the run's wall from the cabinet's left (0…w), y out from that wall (0…w); the corner is at (w, 0), the next wall runs along x = w.
 * Both arms are `d` deep (the cabinet's depth), so the open leg of each front is a = w − d long.
 *
 *   l      L-shaped: an arm on each wall, one door per arm, an L-shaped bottom, top and shelves (each cut as two rectangles).
 *   diag   diagonal: the two arms and a diagonal front joining them, one door; bottom, top and shelves are a pentagon (two rectangles and a triangle blank).
 *   lazy   lazy susan: the diagonal cabinet with two round shelves on a pole (the shelf is cut from a square blank).
 *
 * A corner at the START of a run is the same cabinet mirrored (x → w − x). Sizes are common practice, not a maker's hardware.
 *
 *   TURNS ['l', 'diag', 'lazy'] · cornerBuild(cell, ctx) → { parts, fronts, solids, footprint, outline, hardware, doors, a, kick, boxH }
 *     ctx = { R, say }, cell = a layout cell with turn and corner ('end' | 'start')
 *   solids = [{ role, kind: 'box', x0, y0, z0, x1, y1, z1 } | { role, kind: 'prism', pts: [[x, y]…] (counter-clockwise), z0, z1 }] in the cell's frame
 *     (x along the run from the cell's start, y out from the wall, z up from the floor; the cabinet's `elev` is NOT added)
 *   footprint = [[ [x, y]… ] convex pieces] · outline = [[x, y]…] (for drawing)
 */
import { boxOf } from './model.js';
import { hingeCount } from './hardware.js';
import { r6 } from './core.js';
import { diagAt } from './angled.js';

export const TURNS = ['l', 'diag', 'lazy'];
const S2 = Math.SQRT2;

const slab = (role, p, q, from, to, z0, z1) => {
  // a board along p→q (the room is on the left), covering offsets from…to along the outward normal (positive = into the room)
  const dx = q[0] - p[0], dy = q[1] - p[1], L = Math.hypot(dx, dy), nx = -dy / L, ny = dx / L;
  const P = (pt, o) => [r6(pt[0] + nx * o), r6(pt[1] + ny * o)];
  return { role, kind: 'prism', pts: [P(p, from), P(q, from), P(q, to), P(p, to)], z0, z1 };
};
const circle = (cx, cy, r, z0, z1, role, n = 20) => ({ role, kind: 'prism', pts: Array.from({ length: n }, (_, i) => [r6(cx + r * Math.cos((2 * Math.PI * i) / n)), r6(cy + r * Math.sin((2 * Math.PI * i) / n))]), z0, z1 });

function geometry(cell, R) {
  const cab = cell.cab, w = cab.w, d = cab.d;
  const b = boxOf(cab, R);
  return { w, d, a: w - d, ...b, t: R.t, top: b.kick + b.boxH, rv: R.reveal };
}

/** Solids in the 'end' orientation. */
function solidsEnd(turn, cab, R, g, shelves) {
  const { w, d, a, kick, top, t, rv } = g;
  const out = [];
  const box = (role, x0, y0, z0, x1, y1, z1) => { if (x1 > x0 + 1e-9 && y1 > y0 + 1e-9 && z1 > z0 + 1e-9) out.push({ role, kind: 'box', x0: r6(x0), y0: r6(y0), z0: r6(z0), x1: r6(x1), y1: r6(y1), z1: r6(z1) }); };
  const bs = R.backSetback, bt = R.backT, ft = R.frontT;
  const tri = (role, z0, z1, ox = 0) => out.push({ role, kind: 'prism', pts: [[t, d], [a, d], [a, w - t]], z0, z1 });
  box('side', 0, 0, kick, t, d, top);
  box('side', w - d, w - t, kick, w, w, top);
  box('bottom', t, 0, kick, w, d, kick + t);
  box('bottom', w - d, d, kick, w, w - t, kick + t);
  box('top', t, 0, top - t, w, d, top);
  box('top', w - d, d, top - t, w, w - t, top);
  if (turn !== 'l') { if (a - t > 1) { tri('bottom', kick, kick + t); tri('top', top - t, top); } }
  box('back', t, bs, kick + t, w, bs + bt, top - t);
  box('back', w - bs - bt, d, kick + t, w - bs, w - t, top - t);
  if (turn === 'lazy') {
    const dia = Math.max(1, w - 2 * (t + 70 * (R.unit === 'in' ? 1 / 25.4 : 1))), r = dia / 2, c = bs + bt + 12 * (R.unit === 'in' ? 1 / 25.4 : 1);
    const cx = w - r - c, cy = r + c;
    out.push({ role: 'plinth', kind: 'box', x0: r6(cx - 15), y0: r6(cy - 15), z0: r6(kick + t), x1: r6(cx + 15), y1: r6(cy + 15), z1: r6(top - t) });
    for (let i = 0; i < 2; i++) { const z = kick + t + ((top - t) - (kick + t)) * (i + 1) / 3 - t / 2; out.push(circle(cx, cy, r, r6(z), r6(z + t), 'shelf')); }
  } else {
    for (let i = 0; i < shelves; i++) {
      const z = kick + t + ((top - t) - (kick + t)) * (i + 1) / (shelves + 1) - t / 2;
      box('shelf', t + R.shelfClear, bs + bt, z, w - bs - bt, d - R.shelfFront, z + t);
      box('shelf', w - d + R.shelfFront, d, z, w - bs - bt, w - t - R.shelfClear, z + t);
      if (turn === 'diag' && a - t > 1) out.push({ role: 'shelf', kind: 'prism', pts: [[t, d], [a, d], [a, w - t]], z0: r6(z), z1: r6(z + t) });
    }
  }
  // fronts
  const dz0 = kick + rv / 2, dz1 = top - rv / 2;
  if (turn === 'l') {
    box('door', rv / 2, d, dz0, a - rv / 2, d + ft, dz1);
    box('door', a - ft, d + rv / 2, dz0, a, w - rv / 2, dz1);
  } else {
    const P = [0, d], Q = [a, w], L = Math.hypot(a, a), e = [(Q[0] - P[0]) / L, (Q[1] - P[1]) / L];
    out.push(slab('door', [P[0] + e[0] * rv / 2, P[1] + e[1] * rv / 2], [Q[0] - e[0] * rv / 2, Q[1] - e[1] * rv / 2], 0, ft, dz0, dz1));
  }
  if (kick > 0 && R.plinth) {
    const k = R.kickSetback;
    if (turn === 'l') { box('plinth', 0, d - k - t, 0, a, d - k, kick); box('plinth', a - k - t, d, 0, a - k, w, kick); }
    else out.push(slab('plinth', [0, d], [a, w], -(k + t), -k, 0, kick));
  }
  return out;
}

const mirror = (s, w) => (s.kind === 'box' ? { ...s, x0: r6(w - s.x1), x1: r6(w - s.x0) } : { ...s, pts: s.pts.map(([x, y]) => [r6(w - x), y]).reverse() });
const mirrorPts = (pts, w) => pts.map(([x, y]) => [r6(w - x), y]).reverse();

export function cornerBuild(cell, ctx) {
  if (cell.turn === 'diag' && cell.tau && Math.abs(cell.tau - 90) >= 0.01) return angledBuild(cell, ctx);
  const { R, say = (k) => k } = ctx;
  const cab = cell.cab, turn = cell.turn;
  const g = geometry(cell, R);
  const { w, d, a, kick, boxH, t, rv, top } = g;
  const hasKick = kick > 0 && R.plinth;
  const shelves = turn === 'lazy' ? 0 : Math.max(0, Math.round(cab.shelves ?? (cab.type === 'wall' ? 2 : 1)));
  const insideD = g.panelD - g.backDepth;
  const parts = [];
  const add = (role, name, length, width, thickness, material, extra = {}) => {
    if (!(length > 0 && width > 0)) return;
    parts.push({ role, name, group: cell.no, length: r6(length), width: r6(width), thickness, material, grain: 'length', qty: 1, band: {}, ...extra });
  };
  const L1 = (b) => ({ l1: b }), all = (b) => ({ l1: b, l2: b, w1: b, w2: b });
  add('side', 'part.side', boxH, g.panelD, t, R.carcass, { qty: 2, band: L1(R.bandCarcass) });
  for (const role of ['bottom', 'top']) {
    add(role, 'part.corner-' + role + '-a', w - t, g.panelD, t, R.carcass, { band: L1(R.bandCarcass) });
    add(role, 'part.corner-' + role + '-b', w - d - t, g.panelD, t, R.carcass, { band: L1(R.bandCarcass) });
    if (turn !== 'l' && a - t > 1) add(role, 'part.corner-triangle', a - t, a - t, t, R.carcass, { note: say('note.corner.triangle') });
  }
  const grooved = R.back === 'groove', between = R.back === 'between';
  const bh = grooved ? boxH - 2 * t + 2 * R.groove : between ? boxH - 2 * t : boxH;
  const bl = (len, dl) => (grooved ? len + R.groove : len) + dl;
  add('back', 'part.back', R.back === 'applied' ? w : bl(w - t, 0), bh, R.backT, R.backMat, { grain: 'none' });
  add('back', 'part.back', R.back === 'applied' ? a : bl(w - d - t, 0), bh, R.backT, R.backMat, { grain: 'none' });
  if (shelves) {
    add('shelf', 'part.corner-shelf-a', w - t - 2 * R.shelfClear, insideD - R.shelfFront, t, R.carcass, { qty: shelves, band: L1(R.bandCarcass) });
    add('shelf', 'part.corner-shelf-b', w - d - t - 2 * R.shelfClear, insideD - R.shelfFront, t, R.carcass, { qty: shelves, band: L1(R.bandCarcass) });
    if (turn === 'diag' && a - t > 1) add('shelf', 'part.corner-triangle', a - t, a - t, t, R.carcass, { qty: shelves, note: say('note.corner.triangle') });
  }
  if (turn === 'lazy') {
    const mm = R.unit === 'in' ? 1 / 25.4 : 1;
    const dia = Math.max(1, w - 2 * (t + 70 * mm));
    add('shelf', 'part.lazy-shelf', dia, dia, t, R.carcass, { qty: 2, grain: 'none', note: say('note.corner.round') });
  }
  const doorH = boxH - rv, doorW = turn === 'l' ? a - rv : a * S2 - rv, nd = turn === 'l' ? 2 : 1;
  add('door', 'part.corner-door', doorH, doorW, R.frontT, R.frontMat, { qty: nd, band: all(R.bandFront) });
  if (hasKick) add('plinth', 'part.plinth', turn === 'l' ? a : a * S2, kick, t, R.carcass, { qty: turn === 'l' ? 2 : 1 });
  const numbered = parts.map((p, i) => ({ ...p, id: cell.no + '-' + String(i + 1).padStart(2, '0'), group: cell.no }));
  // fronts in the run's elevation: the door on the arm along the run (the other arm's door is on the next wall)
  const fx = cell.corner === 'start' ? w - a + rv / 2 : rv / 2;
  const fronts = [{ kind: 'door', x: r6(fx), y: r6(kick + rv / 2), w: r6(a - rv), h: r6(doorH), hinge: cab.hinge === 'right' ? 'right' : 'left', corner: true }];
  // hardware rows
  const hw = [];
  const row = (key, qty, spec = '') => { if (qty > 0) hw.push({ key, item: 'hw.' + key, spec, qty }); };
  const hn = hingeCount(doorH, R);
  row('hinge', hn * nd); row('plate', hn * nd);
  row('shelf-pin', shelves * R.pinsPerShelf * (turn === 'diag' ? 3 : 2));
  if (turn === 'lazy') row('carousel', 1);
  if (cab.type !== 'wall' && R.kick === 'legs') row('leg', 6);
  if (cab.type === 'wall') row('bracket', 2);
  if (R.pulls) row('pull', nd);
  row('fastener', 16);
  let solids = solidsEnd(turn, cab, R, g, shelves);
  const pent = [[0, 0], [w, 0], [w, w], [a, w], [0, d]];
  const Lshape = [[0, 0], [w, 0], [w, w], [a, w], [a, d], [0, d]];
  let outline = turn === 'l' ? Lshape : pent;
  let footprint = turn === 'l' ? [[[0, 0], [w, 0], [w, d], [0, d]], [[a, d], [w, d], [w, w], [a, w]]] : [pent];
  if (cell.corner === 'start') { solids = solids.map((s) => mirror(s, w)); outline = mirrorPts(outline, w); footprint = footprint.map((f) => mirrorPts(f, w)); }
  let lazy = null;
  if (turn === 'lazy') { const mm = R.unit === 'in' ? 1 / 25.4 : 1, dia = Math.max(1, w - 2 * (t + 70 * mm)), r = dia / 2, c = R.backSetback + R.backT + 12 * mm; lazy = { cx: r6(w - r - c), cy: r6(r + c), r: r6(r) }; }
  return { parts: numbered, fronts, solids, footprint, outline, hardware: hw, doors: nd, a, kick, boxH, top, doorW, doorH, form: turn, shelves, panelD: g.panelD, w, d, t, tau: 90, lazy };
}

/** Merge hardware rows (same key and spec add up), in the shared list's order. */
export function mergeHardware(...lists) {
  const ORDER = ['hinge', 'plate', 'shelf-pin', 'carousel', 'slide', 'leg', 'bracket', 'pull', 'dowel', 'fastener'];
  const m = new Map();
  for (const l of lists) for (const r of l) { const k = r.key + '|' + r.spec; const e = m.get(k) || { ...r, qty: 0 }; e.qty += r.qty; m.set(k, e); }
  return [...m.values()].sort((x, y) => ORDER.indexOf(x.key) - ORDER.indexOf(y.key) || x.spec.localeCompare(y.spec, undefined, { numeric: true }));
}


/**
 * The diagonal-front corner cabinet at a corner that is not a right angle (turn τ, angled.js diagAt). Same panels as the right-angled diagonal, except the two arm
 * boards meet in a mitre, the back is two boards meeting at the true angle, and the front board is cut for the true front length. Cut-list sizes are the
 * smallest rectangle each board can be cut from, and the note says what to cut.
 */
function angledBuild(cell, ctx) {
  const { R, say = (k) => k } = ctx;
  const cab = cell.cab, tau = cell.tau;
  const g = geometry(cell, R);
  const { w, d, kick, boxH, t, rv, top } = g;
  const dg = diagAt(tau, w, d);
  const hasKick = kick > 0 && R.plinth;
  const shelves = Math.max(0, Math.round(cab.shelves ?? (cab.type === 'wall' ? 2 : 1)));
  const insideD = g.panelD - g.backDepth;
  const th = Math.tan((tau * Math.PI) / 360);
  const uB = dg.uB, nB = dg.nB;
  const toA = (s, y) => [r6(w + uB.x * s + nB.x * y), r6(uB.y * s + nB.y * y)];
  const Q = dg.Q;
  // the boards, in the cabinet's frame (x along the first wall, y out from it; the wall corner at (w, 0))
  const A = [[t, 0], [w, 0], Q, [t, d]];
  const B = [[w, 0], toA(w - t, 0), toA(w - t, d), Q];
  const FA2 = [t, d], FB2 = toA(w - t, d);
  const T = [FA2, Q, FB2];
  const ell = Math.hypot(Q[0] - FA2[0], Q[1] - FA2[1]);
  const ex = (FB2[0] - FA2[0]), ey = (FB2[1] - FA2[1]);
  const triBox = (() => {
    const ux = { x: (Q[0] - FA2[0]) / ell, y: (Q[1] - FA2[1]) / ell };
    const cr = ux.x * (FB2[1] - FA2[1]) - ux.y * (FB2[0] - FA2[0]);
    const uy = cr >= 0 ? { x: -ux.y, y: ux.x } : { x: ux.y, y: -ux.x };
    const xs = T.map((p) => (p[0] - FA2[0]) * ux.x + (p[1] - FA2[1]) * ux.y), ys = T.map((p) => (p[0] - FA2[0]) * uy.x + (p[1] - FA2[1]) * uy.y);
    return { o: FA2, ux, uy, L: Math.max(...xs), W: Math.max(...ys) };
  })();
  void ex; void ey;
  const frontLen = Math.hypot(FB2[0] - FA2[0], FB2[1] - FA2[1]);
  const parts = [];
  const add = (role, name, length, width, thickness, material, extra = {}) => {
    if (!(length > 0 && width > 0)) return;
    parts.push({ role, name, group: cell.no, length: r6(length), width: r6(width), thickness, material, grain: 'length', qty: 1, band: {}, ...extra });
  };
  const L1 = (b) => ({ l1: b }), all = (b) => ({ l1: b, l2: b, w1: b, w2: b });
  const mitreNote = say('note.corner.mitre', { angle: String(r6(dg.mitreAngle)), tau: String(r6(tau)) });
  add('side', 'part.side', boxH, g.panelD, t, R.carcass, { qty: 2, band: L1(R.bandCarcass) });
  for (const role of ['bottom', 'top']) {
    add(role, 'part.corner-' + role + '-a', w - t, g.panelD, t, R.carcass, { band: L1(R.bandCarcass), note: mitreNote });
    add(role, 'part.corner-' + role + '-b', w - t, g.panelD, t, R.carcass, { band: L1(R.bandCarcass), note: mitreNote });
    add(role, 'part.corner-triangle', triBox.L, triBox.W, t, R.carcass, { note: say('note.corner.triangle.angled', { apex: String(r6(180 - tau)) }) });
  }
  const grooved = R.back === 'groove', between = R.back === 'between';
  const bh = grooved ? boxH - 2 * t + 2 * R.groove : between ? boxH - 2 * t : boxH;
  const bl = (len) => (grooved ? len + R.groove : len);
  add('back', 'part.back', R.back === 'applied' ? w : bl(w - t), bh, R.backT, R.backMat, { grain: 'none', qty: 2, note: say('note.corner.back.angled', { angle: String(r6(180 - tau)) }) });
  if (shelves) {
    add('shelf', 'part.corner-shelf-a', w - t - 2 * R.shelfClear, insideD - R.shelfFront, t, R.carcass, { qty: shelves, band: L1(R.bandCarcass), note: mitreNote });
    add('shelf', 'part.corner-shelf-b', w - t - 2 * R.shelfClear, insideD - R.shelfFront, t, R.carcass, { qty: shelves, band: L1(R.bandCarcass), note: mitreNote });
    add('shelf', 'part.corner-triangle', triBox.L, triBox.W, t, R.carcass, { qty: shelves, note: say('note.corner.triangle.angled', { apex: String(r6(180 - tau)) }) });
  }
  const doorH = boxH - rv, doorW = frontLen - rv;
  add('door', 'part.corner-door', doorH, doorW, R.frontT, R.frontMat, { band: all(R.bandFront), note: say('note.corner.door.angled', { len: String(r6(frontLen)) }) });
  if (hasKick) add('plinth', 'part.plinth', frontLen, kick, t, R.carcass, { qty: 1 });
  const numbered = parts.map((p, i) => ({ ...p, id: cell.no + '-' + String(i + 1).padStart(2, '0'), group: cell.no }));
  const fx = cell.corner === 'start' ? w - dg.ell + rv / 2 : rv / 2;
  const fronts = [{ kind: 'door', x: r6(fx), y: r6(kick + rv / 2), w: r6(Math.max(1, dg.ell - rv)), h: r6(doorH), hinge: cab.hinge === 'right' ? 'right' : 'left', corner: true }];
  const hw = [];
  const row = (key, qty, spec = '') => { if (qty > 0) hw.push({ key, item: 'hw.' + key, spec, qty }); };
  const hn = hingeCount(doorH, R);
  row('hinge', hn); row('plate', hn);
  row('shelf-pin', shelves * R.pinsPerShelf * 3);
  if (cab.type !== 'wall' && R.kick === 'legs') row('leg', 6);
  if (cab.type === 'wall') row('bracket', 2);
  if (R.pulls) row('pull', 1);
  row('fastener', 16);
  // solids
  const bs = R.backSetback, bt = R.backT, ft = R.frontT;
  const out = [];
  const box = (role, x0, y0, z0, x1, y1, z1) => { if (x1 > x0 + 1e-9 && y1 > y0 + 1e-9 && z1 > z0 + 1e-9) out.push({ role, kind: 'box', x0: r6(x0), y0: r6(y0), z0: r6(z0), x1: r6(x1), y1: r6(y1), z1: r6(z1) }); };
  const prism = (role, pts, z0, z1) => out.push({ role, kind: 'prism', pts, z0: r6(z0), z1: r6(z1) });
  box('side', 0, 0, kick, t, d, top);
  prism('side', [toA(w - t, 0), toA(w, 0), toA(w, d), toA(w - t, d)], kick, top);
  prism('bottom', A, kick, kick + t); prism('bottom', B, kick, kick + t); prism('bottom', T, kick, kick + t);
  prism('top', A, top - t, top); prism('top', B, top - t, top); prism('top', T, top - t, top);
  box('back', t, bs, kick + t, w, bs + bt, top - t);
  prism('back', [toA(0, bs), toA(w - t, bs), toA(w - t, bs + bt), toA(0, bs + bt)], kick + t, top - t);
  for (let i = 0; i < shelves; i++) {
    const z = kick + t + ((top - t) - (kick + t)) * (i + 1) / (shelves + 1) - t / 2;
    prism('shelf', A, z, z + t); prism('shelf', B, z, z + t); prism('shelf', T, z, z + t);
  }
  const dz0 = kick + rv / 2, dz1 = top - rv / 2;
  out.push(slab('door', [FA2[0] + (FB2[0] - FA2[0]) / frontLen * rv / 2, FA2[1] + (FB2[1] - FA2[1]) / frontLen * rv / 2], [FB2[0] - (FB2[0] - FA2[0]) / frontLen * rv / 2, FB2[1] - (FB2[1] - FA2[1]) / frontLen * rv / 2], 0, ft, dz0, dz1));
  if (hasKick) out.push(slab('plinth', FA2, FB2, -(R.kickSetback + t), -R.kickSetback, 0, kick));
  let solids = out;
  const outline = [[0, 0], dg.P1, dg.P2, dg.FB, dg.FA];
  let footprint = [outline];
  let outl = outline;
  if (cell.corner === 'start') { solids = solids.map((s) => mirror(s, w)); outl = mirrorPts(outline, w); footprint = footprint.map((f) => mirrorPts(f, w)); }
  void th;
  return { parts: numbered, fronts, solids, footprint, outline: outl, hardware: hw, doors: 1, a: dg.ell, kick, boxH, top, doorW, doorH, form: 'adiag', shelves, panelD: g.panelD, w, d, t, tau, dg, boards: { A, B, T, triBox }, frontLen };
}
