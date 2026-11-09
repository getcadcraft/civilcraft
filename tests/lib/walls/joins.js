/* SPDX-License-Identifier: Apache-2.0 */
/**
 * lib/walls/joins.js — the join record (0.9 FX.60, wall tool spec section 5). No DOM, no model: walls in, records out.
 * Canonical here since walls-plan-09 (FX.59); the rules are BimCraft's wall-joins.js, byte for byte apart from this header (the
 * test lib/walls/test/test.mjs checks they still agree). CadCraft plan walls store the same record in the wall's own data
 * (plan2d/walls.js `jn`); BimCraft keeps it in the file as IfcRelConnectsPathElements.
 *
 * A join is a record in the model, made when a wall end lands on another wall: { key, a: { guid, pos }, b: { guid, pos }, kind }.
 * pos is where on that wall: 'start' | 'end' | 'mid'. kind is derived from the two positions: L (end + end), T (end + mid),
 * X (mid + mid). The pair is written in guid order, so one join has one key. model-walls.js keeps the records in the file as
 * IfcRelConnectsPathElements (readJoinRecords / syncJoins); here is only what decides which records there should be.
 *
 *   deriveJoins(walls, { tol })       the records the walls' geometry and their per-end switches ask for
 *   reconcile(derived, stored)        { add, remove } to turn what is stored into what should be
 *   joinsIndex(records)               Map guid → [{ other, pos, otherPos, kind, key }] (the wall's side first)
 *   joinKey(a, b) · kindOf(p, q) · posOf(end)
 *
 * Walls: [{ guid, a, b, t, bulge, joinOff: { a, b } }] (plan mm). joinOff: true = "Disallow join" at that end: the end makes no
 * join, and keeps none, until it is allowed again. A curved wall joins by its ends only; a T lands on a straight wall's side.
 */
export const JOIN_TOL = 1;
const dist = (p, q) => Math.hypot(p[0] - q[0], p[1] - q[1]);
const cross = (p, q) => p[0] * q[1] - p[1] * q[0];
const dot = (p, q) => p[0] * q[0] + p[1] * q[1];
export const posOf = (end) => (end === 'a' ? 'start' : 'end');
export const kindOf = (p, q) => (p === 'mid' && q === 'mid' ? 'X' : p === 'mid' || q === 'mid' ? 'T' : 'L');
export const joinKey = (a, b) => {
  const x = `${a.guid}:${a.pos}`, y = `${b.guid}:${b.pos}`;
  return x < y ? `${x}|${y}` : `${y}|${x}`;
};
const record = (A, B) => {
  const [a, b] = `${A.guid}:${A.pos}` <= `${B.guid}:${B.pos}` ? [A, B] : [B, A];
  return { key: joinKey(a, b), a, b, kind: kindOf(a.pos, b.pos) };
};
const off = (w, end) => !!(w.joinOff && w.joinOff[end]);

export function deriveJoins(walls, { tol = JOIN_TOL } = {}) {
  const out = [], seen = new Set();
  const add = (A, B) => { const r = record(A, B); if (!seen.has(r.key)) { seen.add(r.key); out.push(r); } };
  const straight = (w) => !w.bulge;
  for (let i = 0; i < walls.length; i++) {
    const w1 = walls[i];
    for (let j = i + 1; j < walls.length; j++) {
      const w2 = walls[j];
      // L: end + end
      for (const e1 of ['a', 'b']) for (const e2 of ['a', 'b']) {
        if (off(w1, e1) || off(w2, e2)) continue;
        if (dist(w1[e1], w2[e2]) <= tol) add({ guid: w1.guid, pos: posOf(e1) }, { guid: w2.guid, pos: posOf(e2) });
      }
      // T: an end on the side of a straight wall
      for (const [x, h] of [[w1, w2], [w2, w1]]) {
        if (!straight(h)) continue;
        const L = dist(h.a, h.b);
        if (!(L > 0)) continue;
        const u = [(h.b[0] - h.a[0]) / L, (h.b[1] - h.a[1]) / L];
        for (const e of ['a', 'b']) {
          if (off(x, e)) continue;
          const rel = [x[e][0] - h.a[0], x[e][1] - h.a[1]], s = dot(rel, u);
          if (s > tol && s < L - tol && Math.abs(cross(u, rel)) <= (h.t || 0) / 2 + tol) add({ guid: x.guid, pos: posOf(e) }, { guid: h.guid, pos: 'mid' });
        }
      }
      // X: two straight walls crossing, neither at the other's end
      if (straight(w1) && straight(w2)) {
        const L1 = dist(w1.a, w1.b), L2 = dist(w2.a, w2.b);
        if (!(L1 > 0 && L2 > 0)) continue;
        const u1 = [(w1.b[0] - w1.a[0]) / L1, (w1.b[1] - w1.a[1]) / L1], u2 = [(w2.b[0] - w2.a[0]) / L2, (w2.b[1] - w2.a[1]) / L2];
        const c = cross(u1, u2);
        if (Math.abs(c) < 1e-6) continue;
        const d = [w2.a[0] - w1.a[0], w2.a[1] - w1.a[1]], s = cross(d, u2) / c, t = cross(d, u1) / c;
        if (s > tol && s < L1 - tol && t > tol && t < L2 - tol) add({ guid: w1.guid, pos: 'mid' }, { guid: w2.guid, pos: 'mid' });
      }
    }
  }
  return out;
}

export function reconcile(derived, stored) {
  const want = new Map(derived.map((r) => [r.key, r])), have = new Map(stored.map((r) => [r.key, r]));
  return { add: derived.filter((r) => !have.has(r.key)), remove: stored.filter((r) => !want.has(r.key)) };
}

export function joinsIndex(records) {
  const idx = new Map();
  const put = (g, r) => { if (!idx.has(g)) idx.set(g, []); idx.get(g).push(r); };
  for (const r of records) {
    put(r.a.guid, { other: r.b.guid, pos: r.a.pos, otherPos: r.b.pos, kind: r.kind, key: r.key });
    put(r.b.guid, { other: r.a.guid, pos: r.b.pos, otherPos: r.a.pos, kind: r.kind, key: r.key });
  }
  return idx;
}
