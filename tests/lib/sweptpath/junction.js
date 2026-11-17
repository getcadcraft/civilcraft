/* SPDX-License-Identifier: Apache-2.0 */
/**
 * junction.js — roundabout and parking helpers (SW.6). They only draw geometry and make movement paths; the solver is run.js (one solver).
 * Units are the caller's (all lengths in the same unit); angles in degrees, 0 = east, counter-clockwise.
 *
 *   roundabout({ centre, radius (the inscribed circle), width (the circulating lane), apron (a truck apron outside the island, 0 for none),
 *                legs: [{ angle, width (the approach, both directions), fillet }] }) →
 *     { outer (the inscribed circle), island (circle), apron (circle or null), legs: [{ edges: [left, right] (polylines from the far end to the circle) }],
 *       movements: [{ from, to, path }] }       path = the swept path of a vehicle entering at `from` and leaving at `to`, driving on the right
 *   parking({ boundary, angle, bay: { width, length }, aisle, loaded }) → { bays: [polygon], count, rows, aisles: [polyline] } over a polygon `boundary`
 *   bayPath(bay, aisle line…) is not here: the adapter drives the worst bay with run(); `worstBay(parking)` names which one.
 */
import { arcPts, chaikin, inPoly, D2R, bbox, polyArea, fin } from './geom.js';

const dirOf = (deg) => ({ x: Math.cos(deg * D2R), y: Math.sin(deg * D2R) });

export function roundabout({ centre, radius, width, apron = 0, legs, far = null, drive = 'right' }) {
  const bad = (m) => ({ ok: false, error: m });
  if (!centre || !fin(radius) || radius <= 0 || !fin(width) || width <= 0 || width >= radius) return bad('The circulating lane must fit inside the inscribed circle.');
  if (!Array.isArray(legs) || legs.length < 3 || legs.length > 8) return bad('A roundabout needs three to eight legs.');
  const sorted = legs.map((l, i) => ({ ...l, i, angle: ((l.angle % 360) + 360) % 360 })).sort((a, b) => a.angle - b.angle);
  for (let i = 0; i < sorted.length; i++) { const d = (sorted[(i + 1) % sorted.length].angle - sorted[i].angle + 360) % 360; if (d < 20 && sorted.length > 1) return bad('Two legs are closer than 20 degrees.'); }
  const R = radius, C = centre, island = R - width - (apron || 0), D = far || R * 3;
  if (!(island > 0)) return bad('The island would have no size: reduce the lane or the apron.');
  const sgn = drive === 'left' ? -1 : 1;           // the circulating direction: right-hand traffic goes counter-clockwise
  const rc = R - width / 2;                         // the centre of the circulating lane
  const legsOut = sorted.map((l) => {
    const u = dirOf(l.angle), n = { x: -u.y, y: u.x }, h = (fin(l.width) && l.width > 0 ? l.width : width * 2) / 2;
    const edge = (side) => ({ a: { x: C.x + n.x * side * h + u.x * D, y: C.y + n.y * side * h + u.y * D }, b: { x: C.x + n.x * side * h + u.x * Math.sqrt(Math.max(0, R * R - h * h)), y: C.y + n.y * side * h + u.y * Math.sqrt(Math.max(0, R * R - h * h)) } });
    return { angle: l.angle, i: l.i, u, n, h, edges: [edge(1), edge(-1)].map((e) => [e.a, e.b]) };
  });
  // a movement: in on the right-hand lane of leg A, round the lane centre, out on the right-hand lane of leg B (mirrored for left-hand traffic)
  const movements = [];
  const lane = (l, inbound) => { const side = (inbound ? -1 : 1) * sgn; return { x: C.x + l.n.x * side * l.h / 2, y: C.y + l.n.y * side * l.h / 2 }; };
  for (const A of legsOut) for (const B of legsOut) {
    if (A === B) continue;
    const pa = lane(A, true), pb = lane(B, false);
    const a0 = Math.atan2(A.u.y, A.u.x), a1 = Math.atan2(B.u.y, B.u.x);
    // angle travelled round the island, in the circulating direction, from A's side to B's
    let swing = (((a1 - a0) * sgn) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
    if (swing < 1e-6) swing = 2 * Math.PI;
    const ring = arcPts(C.x, C.y, rc, a0 + sgn * 0.0, a0 + sgn * swing, Math.max(6, Math.ceil(swing / (4 * D2R))));
    const pathIn = [{ x: pa.x + A.u.x * D, y: pa.y + A.u.y * D }, { x: pa.x + A.u.x * (R * 1.4), y: pa.y + A.u.y * (R * 1.4) }];
    const pathOut = [{ x: pb.x + B.u.x * (R * 1.4), y: pb.y + B.u.y * (R * 1.4) }, { x: pb.x + B.u.x * D, y: pb.y + B.u.y * D }];
    const raw = [...pathIn, ...ring, ...pathOut];
    movements.push({ from: A.i, to: B.i, uturn: swing > 1.9 * Math.PI, path: chaikin(raw, 4) });
  }
  return { ok: true, outer: arcPts(C.x, C.y, R, 0, 2 * Math.PI, 120), island: arcPts(C.x, C.y, island, 0, 2 * Math.PI, 90),
    apron: apron > 0 ? arcPts(C.x, C.y, island + apron, 0, 2 * Math.PI, 90) : null, legs: legsOut.map((l) => ({ angle: l.angle, index: l.i, edges: l.edges })), movements, lane: { centreRadius: rc } };
}

export function parking({ boundary, angle = 0, bay, aisle, loaded = 2 }) {
  if (!Array.isArray(boundary) || boundary.length < 3) return { ok: false, error: 'The boundary needs three corners.' };
  if (!bay || !(bay.width > 0) || !(bay.length > 0) || !(aisle > 0)) return { ok: false, error: 'Bay width, bay length and aisle width must be positive.' };
  const th = angle * D2R, c = Math.cos(th), s = Math.sin(th);
  const to = (p) => ({ x: p.x * c + p.y * s, y: -p.x * s + p.y * c }), back = (p) => ({ x: p.x * c - p.y * s, y: p.x * s + p.y * c });
  const Q = boundary.map(to), bb = bbox(Q);
  const module = (loaded === 1 ? bay.length + aisle : 2 * bay.length + aisle);
  const bays = [], aisles = [];
  let rows = 0;
  for (let y = bb.minY; y + (loaded === 1 ? bay.length : 2 * bay.length) <= bb.maxY + 1e-9; y += module) {
    rows++;
    const lanes = loaded === 1 ? [[y, y + bay.length]] : [[y, y + bay.length], [y + bay.length + aisle, y + 2 * bay.length + aisle]];
    for (const [y0, y1] of lanes) for (let x = bb.minX; x + bay.width <= bb.maxX + 1e-9; x += bay.width) {
      const R = [{ x, y: y0 }, { x: x + bay.width, y: y0 }, { x: x + bay.width, y: y1 }, { x, y: y1 }];
      const e = 1e-7 * Math.max(bay.width, bay.length), mx = x + bay.width / 2, my = (y0 + y1) / 2;   // a bay whose edge lies ON the boundary is inside
      const inner = R.map((p) => ({ x: p.x + Math.sign(mx - p.x) * e, y: p.y + Math.sign(my - p.y) * e }));
      if (inner.every((p) => inPoly(p, Q))) bays.push({ poly: R.map(back), row: rows - 1, side: y0 === y ? 'near' : 'far', centre: back({ x: x + bay.width / 2, y: (y0 + y1) / 2 }), aisleY: y0 === y ? y1 : y0 });
    }
    const ay = loaded === 1 ? y + bay.length + aisle / 2 : y + bay.length + aisle / 2;
    aisles.push([back({ x: bb.minX, y: ay }), back({ x: bb.maxX, y: ay })]);
  }
  return { ok: true, bays, count: bays.length, rows, aisles, area: Math.abs(polyArea(boundary)), angle };
}
/** The bay that is hardest to pull into: the one furthest from the aisle's end where a vehicle comes in, or the end bay of the last row. */
export function worstBay(p) { if (!p?.ok || !p.bays.length) return null; return p.bays.reduce((w, b) => (b.row > w.row || (b.row === w.row && b.centre.x < w.centre.x) ? b : w), p.bays[0]); }
