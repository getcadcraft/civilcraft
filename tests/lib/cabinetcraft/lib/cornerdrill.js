/* SPDX-License-Identifier: Apache-2.0 */
/**
 * cornerdrill.js — the drilling plan of the corner cabinets (0.8.2 DC.117, session `cabinetcraft_addon` round 3). DOM-free, pure.
 *
 * It uses the SAME numbers as the straight cabinets' drilling (hardware.js, model.js RULES): the 32 mm system line (`sysLine`) from the front and back edges
 * of a side, the pitch (`pitch`), the first hole `sysStart` from the end, the hinge cup and plate sizes and positions. Nothing here is a maker's number:
 *   - positions come from those rules (and the hole nearest the system grid for a hinge plate, as hardware.js does),
 *   - sizes of holes the system does not define (dowel or cam fixings, the lazy susan's shaft and pivot) are TYPED by the person from the hardware they
 *     chose (project.hw) and are BLANK until typed: a blank size is written as an empty diameter/depth and listed in the hardware list as "size to enter".
 *
 * Frame of a part (same as hardware.js): x along its LENGTH from the end the cut list starts at, y across its WIDTH. Per form, from corner.js:
 *   side           x from the bottom of the box, y from the back edge, face 'inside'. Shelf pins at x = sysStart + k·pitch, y = sysLine and width − sysLine.
 *                  Hinge plates (two system holes per hinge, at the grid) on the side(s) that carry a hinge. Fixing holes where the bottom and top meet it
 *                  (x = t/2 and boxH − t/2, y = sysStart and width − sysStart).
 *   boards         the arm boards, the triangle: a hole in the EDGE ('edge' face, `edge` = which edge) at `sysStart` from each end of every joint line two
 *                  boards share; one hole at the middle when the joint is shorter than 2·sysStart + pitch. A board meeting a side gets two end-edge holes
 *                  at y = sysStart and width − sysStart.
 *   door           cups on the back, hingeSpots(doorH) along the height, `cupEdge + cupD/2` from the hinge edge; a pair (L-shaped) is one part of 2, mirrored.
 *   lazy susan     a pivot hole in the bottom board and a shaft hole in the top board at the centre of the shelves, and a centre hole in each round shelf.
 *
 *   hwOf(project.hw) → { fastenDia, fastenDepth, shaftDia, shaftDepth, pivotDia, pivotDepth } numbers or '' (blank)
 *   cornerBoards(cb) → [{ role: 'bottom'|'top', key ('a'|'b'|'tri'), poly, o, ux, uy, L, W }]
 *   sharedEdges(boards) → [{ a, b, p, q, len }]   joint lines two boards share
 *   cornerDrill(cb, R, hw) → [{ id, role, name, qty, face, holes: [{ x, y, d, depth, kind, side?, face?, edge? }], note }]
 */
import { hingeSpots } from './hardware.js';
import { r6 } from './core.js';

export function hwOf(raw) {
  const o = raw && typeof raw === 'object' ? raw : {};
  const v = (k) => { const n = Number(o[k]); return o[k] !== '' && o[k] !== null && o[k] !== undefined && Number.isFinite(n) && n > 0 && n < 1000 ? n : ''; };
  return { fastenDia: v('fastenDia'), fastenDepth: v('fastenDepth'), shaftDia: v('shaftDia'), shaftDepth: v('shaftDepth'), pivotDia: v('pivotDia'), pivotDepth: v('pivotDepth') };
}

const frameOf = (poly, o, ux, uy) => {
  const to = ([x, y]) => [r6((x - o[0]) * ux[0] + (y - o[1]) * ux[1]), r6((x - o[0]) * uy[0] + (y - o[1]) * uy[1])];
  const loc = poly.map(to);
  return { to, loc, L: r6(Math.max(...loc.map((p) => p[0]))), W: r6(Math.max(...loc.map((p) => p[1]))) };
};

/** The arm boards and the triangle of a corner cabinet (bottom and top are the same shape), in the cabinet's frame, each with the frame of its blank. */
export function cornerBoards(cb) {
  const { form, w, d, t } = cb;
  const out = [];
  const mk = (key, poly, o, ux, uy) => { const f = frameOf(poly, o, ux, uy); out.push({ key, poly, o, ux, uy, ...f }); };
  if (form === 'l') {
    mk('a', [[t, 0], [w, 0], [w, d], [t, d]], [t, 0], [1, 0], [0, 1]);
    mk('b', [[w - d, d], [w, d], [w, w - t], [w - d, w - t]], [w - d, d], [0, 1], [1, 0]);
  } else if (form === 'diag' || form === 'lazy') {
    const a = w - d;
    mk('a', [[t, 0], [w, 0], [w, d], [t, d]], [t, 0], [1, 0], [0, 1]);
    mk('b', [[w - d, d], [w, d], [w, w - t], [w - d, w - t]], [w - d, d], [0, 1], [1, 0]);
    if (a - t > 1) mk('tri', [[t, d], [a, d], [a, w - t]], [t, d], [1, 0], [0, 1]);
  } else if (form === 'adiag' && cb.boards) {
    const { A, B, T, triBox } = cb.boards;
    mk('a', A, [A[0][0], A[0][1]], [1, 0], [0, 1]);
    const ux = [(B[1][0] - B[0][0]) / Math.hypot(B[1][0] - B[0][0], B[1][1] - B[0][1]), (B[1][1] - B[0][1]) / Math.hypot(B[1][0] - B[0][0], B[1][1] - B[0][1])];
    mk('b', B, B[0], ux, [-ux[1], ux[0]]);
    mk('tri', T, triBox.o, [triBox.ux.x, triBox.ux.y], [triBox.uy.x, triBox.uy.y]);
  }
  return out;
}

const EPS = 1e-6;
/** Joint lines: where an edge of one board lies on an edge of another (collinear and overlapping). */
export function sharedEdges(boards) {
  const out = [];
  for (let i = 0; i < boards.length; i++) for (let j = i + 1; j < boards.length; j++) {
    const A = boards[i], B = boards[j];
    for (let ea = 0; ea < A.poly.length; ea++) for (let eb = 0; eb < B.poly.length; eb++) {
      const p0 = A.poly[ea], p1 = A.poly[(ea + 1) % A.poly.length], q0 = B.poly[eb], q1 = B.poly[(eb + 1) % B.poly.length];
      const dx = p1[0] - p0[0], dy = p1[1] - p0[1], L = Math.hypot(dx, dy);
      if (L < EPS) continue;
      const ux = dx / L, uy = dy / L;
      const off = (q) => (q[0] - p0[0]) * -uy + (q[1] - p0[1]) * ux;
      if (Math.abs(off(q0)) > 1e-4 || Math.abs(off(q1)) > 1e-4) continue;
      const s0 = (q0[0] - p0[0]) * ux + (q0[1] - p0[1]) * uy, s1 = (q1[0] - p0[0]) * ux + (q1[1] - p0[1]) * uy;
      const lo = Math.max(0, Math.min(s0, s1)), hi = Math.min(L, Math.max(s0, s1));
      if (hi - lo < 1) continue;
      out.push({ a: A.key, b: B.key, ea, eb, p: [r6(p0[0] + ux * lo), r6(p0[1] + uy * lo)], q: [r6(p0[0] + ux * hi), r6(p0[1] + uy * hi)], len: r6(hi - lo) });
    }
  }
  return out;
}

const gridX = (len, R) => { const out = []; for (let x = R.sysStart; x <= len - R.sysStart + 1e-9; x += R.pitch) out.push(r6(x)); return out; };
const snap = (v, grid) => (grid.length ? grid.reduce((b, g) => (Math.abs(g - v) < Math.abs(b - v) ? g : b), grid[0]) : v);

export function cornerDrill(cb, R, hwRaw = {}) {
  const hw = hwOf(hwRaw);
  const out = [];
  const find = (role, name) => cb.parts.find((p) => p.role === role && p.name === name);
  const form = cb.form;
  const { w, t } = cb;
  // ---- sides
  const side = cb.parts.find((p) => p.role === 'side');
  if (side) {
    const len = side.length, wid = side.width;
    const grid = gridX(len, R);
    const yF = r6(wid - R.sysLine), yB = r6(R.sysLine);
    const holes = [];
    if (cb.shelves > 0 && form !== 'lazy') for (const x of grid) for (const y of [yF, yB]) holes.push({ x, y, d: R.pinD, depth: R.pinDepth, kind: 'shelf-pin', side: 'both' });
    // hinge plates: the door's hinge edge meets an end side. L-shaped: one door on each arm, both hinge at the open ends (both sides). One diagonal door: the hinge side.
    const doorH = cb.doorH;
    const plateOn = form === 'l' ? ['both'] : [cb.fronts[0].hinge === 'right' ? 'right' : 'left'];
    for (const which of plateOn) {
      const list = [];
      for (const hx of hingeSpots(doorH, R)) {
        const centre = R.reveal / 2 + hx;
        const lo = snap(centre - R.pitch / 2, grid);
        for (const x of [lo, r6(lo + R.pitch)]) if (!list.some((q) => Math.abs(q.x - x) < EPS)) list.push({ x, y: yF, d: R.plateD, depth: R.plateDepth, kind: 'plate', side: which });
      }
      holes.push(...list);
    }
    // fixing holes where the bottom and top meet the side (size typed)
    for (const x of [r6(t / 2), r6(len - t / 2)]) for (const y of [r6(R.sysStart), r6(wid - R.sysStart)]) holes.push({ x, y, d: hw.fastenDia, depth: hw.fastenDepth, kind: 'fasten', side: 'both' });
    out.push({ id: side.id, role: 'side', name: side.name, qty: side.qty, face: 'inside', holes, note: 'corner' });
  }
  // ---- boards: edge holes at the joints and where an arm board meets a side
  const boards = cornerBoards(cb);
  const joints = sharedEdges(boards);
  for (const role of ['bottom', 'top']) {
    const partOf = (key) => cb.parts.find((p) => p.role === role && p.name === 'part.corner-' + (key === 'tri' ? 'triangle' : role + '-' + key));
    const holesOf = new Map(boards.map((b) => [b.key, []]));
    for (const j of joints) {
      const A = boards.find((b) => b.key === j.a), B = boards.find((b) => b.key === j.b);
      const n = j.len >= 2 * R.sysStart + R.pitch ? 2 : 1;
      const at = n === 2 ? [R.sysStart, j.len - R.sysStart] : [j.len / 2];
      const dx = (j.q[0] - j.p[0]) / j.len, dy = (j.q[1] - j.p[1]) / j.len;
      for (const u of at) {
        const P = [j.p[0] + dx * u, j.p[1] + dy * u];
        for (const bd of [A, B]) {
          const [x, y] = bd.to(P);
          const ed = bd === A ? j.ea : j.eb;
          holesOf.get(bd.key).push({ x: r6(x), y: r6(y), d: hw.fastenDia, depth: hw.fastenDepth, kind: 'dowel', face: 'edge', edge: String(ed + 1), joint: j.a + '-' + j.b });
        }
      }
    }
    // an arm board's end that meets a side: two holes in the end edge (x = 0 of the board for the arm start)
    for (const bd of boards) if (bd.key !== 'tri' || false) {
      if (bd.key === 'tri') continue;
      const wid = bd.W;
      for (const y of [r6(R.sysStart), r6(wid - R.sysStart)]) holesOf.get(bd.key).push({ x: bd.key === 'b' && form === 'adiag' ? r6(bd.L) : r6(bd.key === 'b' ? bd.L : 0), y, d: hw.fastenDia, depth: hw.fastenDepth, kind: 'dowel', face: 'edge', edge: 'side', joint: 'side' });
    }
    if (form === 'lazy' && cb.lazy) {
      const { cx, cy } = cb.lazy;
      const A = boards.find((b) => b.key === 'a');
      const [x, y] = A.to([cx, cy]);
      holesOf.get('a').push(role === 'bottom' ? { x: r6(x), y: r6(y), d: hw.pivotDia, depth: hw.pivotDepth, kind: 'pivot', face: 'top' } : { x: r6(x), y: r6(y), d: hw.shaftDia, depth: hw.shaftDepth, kind: 'shaft', face: 'bottom' });
    }
    for (const bd of boards) {
      const part = partOf(bd.key);
      // the blank can be a little narrower than the drawn board (an applied back): a hole on its edge stays on the blank
      const holes = holesOf.get(bd.key).map((h) => (part && h.face === 'edge' ? { ...h, x: r6(Math.min(Math.max(h.x, 0), part.length)), y: r6(Math.min(Math.max(h.y, 0), part.width)) } : h));
      if (part && holes.length) out.push({ id: part.id, role, name: part.name, qty: part.qty, face: 'inside', holes, note: 'corner' });
    }
  }
  // ---- door cups
  const door = cb.parts.find((p) => p.role === 'door');
  if (door) {
    const holes = hingeSpots(cb.doorH, R).map((x) => ({ x, y: r6(R.cupEdge + R.cupD / 2), d: R.cupD, depth: R.cupDepth, kind: 'cup' }));
    out.push({ id: door.id, role: 'door', name: door.name, qty: door.qty, face: 'back', holes, note: door.qty > 1 ? 'mirrored' : '' });
  }
  // ---- round shelves of a lazy susan: a centre hole each
  if (form === 'lazy') {
    const sh = cb.parts.find((p) => p.name === 'part.lazy-shelf');
    if (sh) out.push({ id: sh.id, role: 'shelf', name: sh.name, qty: sh.qty, face: 'top', holes: [{ x: r6(sh.length / 2), y: r6(sh.width / 2), d: hw.shaftDia, depth: hw.shaftDepth, kind: 'shaft' }], note: 'corner' });
  }
  return out;
}

/** The hole rows whose size is still to be entered (the person's hardware): [{ kind, n }]. */
export function blanksOf(plans) {
  const m = new Map();
  for (const pl of plans) for (const h of pl.holes) if (h.d === '' || h.depth === '') m.set(h.kind, (m.get(h.kind) || 0) + 1);
  return [...m].map(([kind, n]) => ({ kind, n }));
}
