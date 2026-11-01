/* SPDX-License-Identifier: Apache-2.0 */
/**
 * cutlist.js — member list, cut list and joint schedule of one truss design (DOM-free; pure).
 *   pieces(g, sizes) → [{ mark, role, size, members: [ids], a, b, len }]   chords in one piece where they run straight on, webs one by one
 *   cutList(g, sizes, opts) → [{ mark, role, size, qty, nodeLen, cutLen, cutA, cutB, splice, notes }]   lengths in mm, angles in degrees from square
 *   memberList(g, rows) → [{ mark, role, size, nodeLen, angle, force, kind, util }]
 *   jointSchedule(g, sizes, res) → [{ node, x, z, members: [{ mark, angle, force }], maxForce, plate, indicative: true }]
 *   birdsMouth({ pitch, depth, seat }) → { plumb, residual, ok } for a stick-framed rafter over a plate (the truss itself needs none)
 * Cut length is long point to long point measured along the centre-line, with webs shortened to the chord face; check it against the plate layout.
 */
import { sizeById, PLATES } from './tables.js';

const D2R = Math.PI / 180, RAD = 180 / Math.PI;
const vec = (g, m) => { const a = g.nodes[m.a], b = g.nodes[m.b], L = m.len; return [(b.x - a.x) / L, (b.z - a.z) / L]; };
const acute = (u, v) => Math.acos(Math.min(1, Math.abs(u[0] * v[0] + u[1] * v[1]))) * RAD;
const round1 = (x) => Math.round(x * 10) / 10;
const groupOf = (r) => (r === 'post' || r === 'stub' ? 'web' : r);

/** Chords that run straight on through a node (same line, same role family) are one piece of timber. */
export function pieces(g, sizes) {
  const out = [], used = new Set();
  const chordRole = (r) => (r === 'tail' ? 'top' : r);
  for (const role of ['top', 'bottom']) {
    const ms = g.members.filter((m) => chordRole(m.role) === role).sort((p, q) => Math.min(g.nodes[p.a].x, g.nodes[p.b].x) - Math.min(g.nodes[q.a].x, g.nodes[q.b].x));
    const chains = [];
    for (const m of ms) {
      const mine = vec(g, m), dir = mine[0] < 0 ? [-mine[0], -mine[1]] : mine;
      const ch = chains.find((c) => (c.ends.includes(m.a) || c.ends.includes(m.b)) && acute(c.dir, mine) < 0.5);
      if (ch) {
        const shared = ch.ends.includes(m.a) ? m.a : m.b, other = shared === m.a ? m.b : m.a;
        ch.members.push(m); ch.ends = ch.ends.filter((e) => e !== shared).concat([other]);
      } else chains.push({ role, members: [m], ends: [m.a, m.b], dir });
    }
    for (const c of chains) {
      const [a, b] = c.ends.sort((p, q) => g.nodes[p].x - g.nodes[q].x);
      out.push({ role, size: sizes[role], members: c.members.map((m) => m.id), a, b, len: Math.hypot(g.nodes[b].x - g.nodes[a].x, g.nodes[b].z - g.nodes[a].z), marks: c.members.map((m) => m.mark) });
      c.members.forEach((m) => used.add(m.id));
    }
  }
  for (const m of g.members) if (!used.has(m.id)) out.push({ role: m.role, size: sizes[groupOf(m.role)], members: [m.id], a: m.a, b: m.b, len: m.len, marks: [m.mark] });
  const n = {};
  const pre = { top: 'TC', bottom: 'BC', web: 'W', post: 'P', stub: 'ST' };
  return out.sort((p, q) => Math.min(g.nodes[p.a].x, g.nodes[p.b].x) - Math.min(g.nodes[q.a].x, g.nodes[q.b].x) || p.len - q.len)
    .map((p) => { n[p.role] = (n[p.role] || 0) + 1; return { ...p, mark: pre[p.role] + n[p.role] }; });
}

export function cutList(g, sizes, { stock = 6000 } = {}) {
  const rows = [];
  for (const p of pieces(g, sizes)) {
    const size = sizeById(p.size) || sizeById('2x4'), notes = [];
    const chord = p.role === 'top' || p.role === 'bottom';
    const ends = [p.a, p.b].map((nid) => {
      const mem = g.members.filter((m) => p.members.includes(m.id) && (m.a === nid || m.b === nid))[0];
      const mine = vec(g, mem);
      if (chord) {
        // plumb cut at the heel, tail and peak: the end face is vertical, so it is off square by the member's own slope
        const slope = Math.atan2(Math.abs(mine[1]), Math.abs(mine[0])) * RAD;
        return { cut: slope, set: 0 };
      }
      const others = g.members.filter((m) => m.id !== mem.id && (m.a === nid || m.b === nid) && m.role !== 'tail');
      const host = others.filter((m) => m.role === 'top' || m.role === 'bottom').sort((x, y) => y.len - x.len)[0] || others.sort((x, y) => y.len - x.len)[0];
      if (!host) return { cut: 0, set: 0 };
      const phi = acute(mine, vec(g, host));
      const hostSize = sizeById(sizes[groupOf(host.role)]) || size;
      return { cut: Math.abs(90 - phi), set: (hostSize.d / 2) / Math.max(0.2, Math.sin(phi * D2R)) };
    });
    const nodeLen = p.len;
    let cutLen = nodeLen - ends[0].set - ends[1].set + (size.d / 2) * (Math.tan(ends[0].cut * D2R) + Math.tan(ends[1].cut * D2R));
    const tailPart = chord && p.members.some((id) => g.members[id].role === 'tail');
    if (tailPart) notes.push('includes the overhang tail');
    const splice = chord && cutLen > stock;
    if (splice) notes.push('longer than the ' + stock + ' mm stock length: spliced or a longer board');
    rows.push({ mark: p.mark, role: p.role, size: p.size, qty: 1, nodeLen: round1(nodeLen), cutLen: round1(cutLen), cutA: round1(ends[0].cut), cutB: round1(ends[1].cut), splice, notes: notes.join('; '), members: p.members });
  }
  return rows;
}

export function memberList(g, rows) {
  const by = new Map(rows.map((r) => [r.id, r]));
  return g.members.filter((m) => m.role !== 'tail').map((m) => {
    const r = by.get(m.id) || {};
    return { mark: m.mark, role: m.role, size: r.size || '', nodeLen: round1(m.len), angle: round1(m.angle), force: Number.isFinite(r.force) ? round1(r.force * 10) / 10 : null, kind: r.kind || '', util: Number.isFinite(r.util) ? Math.round(r.util * 100) / 100 : null };
  });
}

/** plates: { list: [{ id, w, h, kN }], label, placeholder: bool }  (the person's own table, or the labelled placeholder series). */
export function jointSchedule(g, sizes, res, plates = null) {
  const plateList = plates && plates.list && plates.list.length ? plates.list : PLATES, placeholder = !plates || plates.placeholder !== false;
  const out = [];
  for (const n of g.nodes) {
    const ms = g.members.filter((m) => m.role !== 'tail' && (m.a === n.id || m.b === n.id));
    if (ms.length < 2) continue;
    const dirs = ms.map((m) => { const v = vec(g, m); return m.a === n.id ? v : [-v[0], -v[1]]; });
    const list = ms.map((m, i) => ({ mark: m.mark, angle: round1(Math.atan2(dirs[i][1], dirs[i][0]) * RAD), force: res && res.forces ? res.forces.get(m.id) ?? null : null }));
    const maxForce = Math.max(0, ...list.map((l) => Math.abs(l.force || 0)));
    const dMax = Math.max(...ms.map((m) => (sizeById(sizes[groupOf(m.role)]) || { d: 89 }).d));
    const plate = plateList.find((p) => p.kN >= maxForce && Math.min(p.w, p.h) >= Math.min(dMax + 25, 152)) || null;
    out.push({ node: n.id, x: n.x, z: n.z, members: list, maxForce: round1(maxForce), plate: plate ? plate.id : null, plateKN: plate ? plate.kN : null, beyond: !plate, indicative: true, source: placeholder ? 'placeholder' : 'yours', tableLabel: placeholder ? 'Placeholder, not a manufacturer value' : (plates.label || 'Your plate table') });
  }
  return out;
}

export function birdsMouth({ pitch, depth, seat = 89, maxFrac = 1 / 3 }) {
  const t = Math.tan(pitch * D2R), plumb = seat * t, residual = depth - plumb * Math.cos(pitch * D2R);
  return { seat, plumb: round1(plumb), residual: round1(residual), limit: round1(depth * (1 - maxFrac)), ok: residual >= depth * (1 - maxFrac) - 1e-9 };
}
