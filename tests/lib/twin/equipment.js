/* SPDX-License-Identifier: Apache-2.0 */
/**
 * equipment.js — what the equipment of a flow layout looks like, as plain parts (0.9 TW.5). DOM-free. One description for three users: the live 3D view (view3d.js), real model bodies for the path
 * tracer (toBodies) and animated USD (usd.js).
 *
 *   equipmentParts(layout, built, { looks: {stationId: 'machine'|'robot'|'operator'|'palletizer'}, detail: 'full'|'light' }) → [part]
 *     part = { c: [x, y, z], s: [l, w, h], yaw (degrees), pitch (radians, + rises along the turned +X), col (name in COLORS), shape: 'box'|'cyl' (axis along local Y), item }
 *   floorPart(layout, built) → part | null · armParts(base, yawDeg, q [turn, shoulder, elbow]) → the robot's moving links
 *   meshOf(part) → { positions: [x…], indices: [i…], quads: [[a,b,c,d]…] } · toBodies(parts) → the api.model.addBodies list (millimetres)
 *   loadSize(L) → { l, w, h } · loadColor(type) · LOAD_COLORS, COLORS (hex strings)
 * Sizes are generic and invented for the picture. They are not a maker's product and not for fabrication.
 */
import { pieces } from './physics.js';

export const COLORS = {
  steel: '#a9b2ba', steelDark: '#6d7680', belt: '#3a3e43', roller: '#d3d8dd', leg: '#7f8992', guard: '#e3b505', machine: '#3c6e91', machineDark: '#2f5a78', panel: '#d6dade', screen: '#16324a',
  beacon: '#37b24d', robot: '#e8590c', robotDark: '#555b62', pallet: '#b08850', floor: '#c9cccd', tape: '#f2c200', vehicle: '#f0a020', vehicleDark: '#30343a', chute: '#8b95a0', eye: '#d6336c', rack: '#2f5d9b',
};
export const LOAD_COLORS = ['#c49a6c', '#b98b5e', '#d1ad80', '#a97f55', '#c8a06f', '#bd9263'];
export const loadColor = (type) => { let h = 0; for (const c of String(type)) h = (h * 31 + c.charCodeAt(0)) % LOAD_COLORS.length; return LOAD_COLORS[h]; };
export const loadSize = (L) => ({ l: L, w: Math.min(L, 0.45), h: Math.max(0.12, Math.min(0.32, L * 0.6)) });

const rad = (d) => (d * Math.PI) / 180;
const part = (c, s, yaw, col, item, extra = {}) => ({ c, s, yaw, pitch: 0, col, shape: 'box', item, ...extra });
/** A point given along, across and above an item's heading. */
const off = (x, y, z, h, a, b, u) => { const r = rad(h); return [x + a * Math.cos(r) - b * Math.sin(r), y + a * Math.sin(r) + b * Math.cos(r), z + u]; };

function belt(it, g, detail, parts) {
  const w = it.params.width || 0.6, n = it.kind === 'curve' ? Math.max(4, Math.ceil(Math.abs(it.params.angle) / 8)) : it.kind === 'zone' ? Math.max(1, it.params.zones) : 1;
  const rollerEvery = detail === 'full' ? 0.25 : 0.75;
  let run = 0;
  for (const pc of pieces(g.path, n)) {
    const r = rad(pc.yaw), nx = -Math.sin(r), ny = Math.cos(r), ov = it.kind === 'curve' ? w * 0.12 : 0;
    const P = { yaw: pc.yaw, pitch: pc.pitch };
    parts.push({ c: [pc.c[0], pc.c[1], pc.c[2] - 0.015], s: [pc.length + ov, w, 0.03], ...P, col: 'belt', shape: 'box', item: it.id });
    for (const sd of [-1, 1]) {
      parts.push({ c: [pc.c[0] + nx * sd * (w / 2 + 0.025), pc.c[1] + ny * sd * (w / 2 + 0.025), pc.c[2] - 0.04], s: [pc.length + ov, 0.05, 0.13], ...P, col: 'steel', shape: 'box', item: it.id });
    }
    if (it.kind === 'zone' || it.kind === 'curve' || detail === 'full') {
      const count = Math.min(60, Math.floor(pc.length / rollerEvery));
      for (let i = 0; i < count; i++) {
        const k = (i + 0.5) / count, p = [pc.a[0] + (pc.b[0] - pc.a[0]) * k, pc.a[1] + (pc.b[1] - pc.a[1]) * k, pc.a[2] + (pc.b[2] - pc.a[2]) * k];
        parts.push({ c: [p[0], p[1], p[2] - 0.075], s: [0.05, w * 0.94, 0.05], ...P, col: 'roller', shape: 'cyl', item: it.id });
      }
    }
    // legs on the floor, about every 2 m, with a cross brace
    const legsHere = Math.max(1, Math.round(pc.length / 2));
    for (let i = 0; i < legsHere; i++) {
      const k = (i + 0.5) / legsHere, p = [pc.a[0] + (pc.b[0] - pc.a[0]) * k, pc.a[1] + (pc.b[1] - pc.a[1]) * k, pc.a[2] + (pc.b[2] - pc.a[2]) * k], top = p[2] - 0.08;
      if (top < 0.1) continue;
      for (const sd of [-1, 1]) parts.push(part([p[0] + nx * sd * (w / 2 + 0.02), p[1] + ny * sd * (w / 2 + 0.02), top / 2], [0.06, 0.06, top], pc.yaw, 'leg', it.id));
      parts.push(part([p[0], p[1], top * 0.45], [0.04, w + 0.05, 0.04], pc.yaw, 'leg', it.id));
    }
    run += pc.length;
  }
  void run;
  // the drive at the end of a straight belt
  if (it.kind !== 'curve') {
    const e = g.path.at(g.path.length), o = off(e.p[0], e.p[1], e.p[2], e.h, -0.12, (w / 2 + 0.12), -0.08);
    parts.push({ c: o, s: [0.14, 0.16, 0.14], yaw: e.h, pitch: 0, col: 'machineDark', shape: 'cyl', item: it.id });
  }
}

/** A robot's three moving links for joint angles q (radians), base at the pedestal's top. */
export function armParts(base, yawDeg, q = [0, 0.5, 0.8], item = '') {
  const y = yawDeg + (q[0] * 180) / Math.PI, r = rad(y), dir = [Math.cos(r), Math.sin(r)];
  const L1 = 0.75, L2 = 0.7, a = q[1], b = q[1] + q[2];
  const s = [base[0], base[1], base[2] + 0.18];
  const e = [s[0] + dir[0] * L1 * Math.sin(a), s[1] + dir[1] * L1 * Math.sin(a), s[2] + L1 * Math.cos(a)];
  const w = [e[0] + dir[0] * L2 * Math.sin(b), e[1] + dir[1] * L2 * Math.sin(b), e[2] + L2 * Math.cos(b)];
  const mid = (p, o) => [(p[0] + o[0]) / 2, (p[1] + o[1]) / 2, (p[2] + o[2]) / 2];
  return [
    { c: [base[0], base[1], base[2] + 0.09], s: [0.36, 0.36, 0.18], yaw: y, pitch: 0, col: 'robotDark', shape: 'box', item },
    { c: mid(s, e), s: [L1, 0.17, 0.17], yaw: y, pitch: Math.PI / 2 - a, col: 'robot', shape: 'box', item },
    { c: e, s: [0.2, 0.22, 0.2], yaw: y, pitch: 0, col: 'robotDark', shape: 'cyl', item },
    { c: mid(e, w), s: [L2, 0.12, 0.12], yaw: y, pitch: Math.PI / 2 - b, col: 'robot', shape: 'box', item },
    { c: [w[0], w[1], w[2] - 0.06], s: [0.26, 0.26, 0.05], yaw: y, pitch: 0, col: 'robotDark', shape: 'box', item },
  ];
}
export const robotBase = (g) => { const o = off(g.x, g.y, 0, g.rot, 0, 0.95, 0); return { base: [o[0], o[1], Math.max(0.55, g.z - 0.25)], yaw: g.rot - 90 }; };

function station(it, g, look, parts) {
  const { x, y, z, rot } = g, top = z;
  const ground = (l, w, h, col, a = 0, b = 0, bottom = 0) => { const o = off(x, y, 0, rot, a, b, 0); parts.push(part([o[0], o[1], bottom + h / 2], [l, w, h], rot, col, it.id)); };
  ground(1.2, 0.8, Math.max(0.1, top - 0.05), 'steel');
  { const o = off(x, y, top, rot, 0, 0, -0.02); parts.push(part(o, [1.2, 0.8, 0.04], rot, 'roller', it.id)); }
  if (look === 'robot' || look === 'palletizer') {
    const { base, yaw } = robotBase(g), o = [base[0], base[1]];
    parts.push(part([o[0], o[1], base[2] / 2], [0.5, 0.5, base[2]], yaw, 'steelDark', it.id));
    parts.push(...armParts(base, yaw, undefined, it.id));
    if (look === 'palletizer') {
      const p = off(x, y, 0, rot, 0, 1.9, 0);
      parts.push(part([p[0], p[1], 0.07], [1.2, 1.0, 0.14], rot, 'pallet', it.id));
    }
    // a fence on three sides: posts and rails, so the robot stays in sight in every renderer
    const post = (a, b) => { const f = off(x, y, 0, rot, a, b, 0); parts.push(part([f[0], f[1], 0.95], [0.06, 0.06, 1.9], rot, 'guard', it.id)); };
    const rail = (a, b, l, w, z2) => { const f = off(x, y, 0, rot, a, b, 0); parts.push(part([f[0], f[1], z2], [l, w, 0.04], rot, 'guard', it.id)); };
    for (const [a, b] of [[-1.3, 0.55], [-1.3, 1.75], [1.3, 1.75], [1.3, 0.55], [0, 1.75]]) post(a, b);
    for (const z2 of [0.5, 1.2, 1.88]) { rail(0, 1.75, 2.66, 0.04, z2); rail(-1.3, 1.15, 0.04, 1.26, z2); rail(1.3, 1.15, 0.04, 1.26, z2); }
    return;
  }
  if (look === 'operator') {
    const o = off(x, y, 0, rot, 0, -0.95, 0);
    parts.push(part([o[0], o[1], 0.5], [0.34, 0.26, 1.0], rot, 'machine', it.id), part([o[0], o[1], 1.2], [0.42, 0.26, 0.4], rot, 'machineDark', it.id), part([o[0], o[1], 1.56], [0.2, 0.2, 0.22], rot, 'panel', it.id));
    const b = off(x, y, top + 0.55, rot, 0, 0.42, 0);
    parts.push(part(b, [1.2, 0.04, 1.1], rot, 'panel', it.id));
    return;
  }
  // a machine: a hood over the belt line, a control box, a light
  for (const sd of [-1, 1]) { const o = off(x, y, 0, rot, 0, sd * 0.52, 0); parts.push(part([o[0], o[1], (top + 0.75) / 2], [1.25, 0.14, top + 0.75], rot, 'machine', it.id)); }
  { const o = off(x, y, top + 0.85, rot, 0, 0, 0); parts.push(part(o, [1.3, 1.2, 0.2], rot, 'machineDark', it.id)); }
  { const o = off(x, y, 0, rot, 0.15, 0.82, 0); parts.push(part([o[0], o[1], 1.15], [0.5, 0.2, 0.7], rot, 'panel', it.id), part([o[0], o[1] , 1.25], [0.34, 0.215, 0.3], rot, 'screen', it.id)); }
  { const o = off(x, y, top + 1.02, rot, -0.5, 0.45, 0); parts.push(part(o, [0.06, 0.06, 0.2], rot, 'beacon', it.id, { glow: true })); }
}

export function equipmentParts(layout, built, { looks = {}, detail = 'full' } = {}) {
  const parts = [];
  for (const it of layout.items) {
    const g = built.geom[it.id];
    if (!g) continue;
    const yaw = g.rot;
    switch (it.kind) {
      case 'conveyor': case 'curve': case 'incline': case 'zone': belt(it, g, detail, parts); break;
      case 'station': station(it, g, looks[it.id] || 'machine', parts); break;
      case 'transfer': case 'merge': case 'divert': {
        parts.push(part([g.x, g.y, g.z - 0.03], [0.64, 0.64, 0.06], yaw, 'roller', it.id), part([g.x, g.y, g.z - 0.1], [0.68, 0.68, 0.08], yaw, 'steel', it.id));
        if (g.z > 0.2) parts.push(part([g.x, g.y, (g.z - 0.14) / 2], [0.12, 0.12, g.z - 0.14], yaw, 'leg', it.id));
        break;
      }
      case 'gate': {
        for (const sd of [-1, 1]) { const o = off(g.x, g.y, 0, yaw, 0, sd * 0.36, 0); parts.push(part([o[0], o[1], (g.z + 0.3) / 2], [0.06, 0.06, g.z + 0.3], yaw, 'steelDark', it.id)); }
        parts.push(part([g.x, g.y, g.z + 0.29], [0.08, 0.74, 0.06], yaw, 'guard', it.id));
        break;
      }
      case 'buffer': {
        parts.push(part([g.x, g.y, Math.max(0.05, g.z) / 2], [1.0, 0.8, Math.max(0.1, g.z)], yaw, 'rack', it.id), part([g.x, g.y, g.z + 0.01], [1.05, 0.85, 0.03], yaw, 'roller', it.id));
        break;
      }
      case 'source': case 'sink': {
        parts.push(part([g.x, g.y, g.z / 2], [0.6, 0.8, Math.max(0.1, g.z)], yaw, 'chute', it.id));
        const o = off(g.x, g.y, 0, yaw, it.kind === 'source' ? -0.32 : 0.32, 0, 0);
        parts.push(part([o[0], o[1], g.z + 0.25], [0.05, 0.8, 0.5], yaw, 'steelDark', it.id));
        break;
      }
      case 'sensor': {
        const h = (it.params.at !== undefined && built.geom[it.params.on] && built.geom[it.params.on].path) ? built.geom[it.params.on].path.at(Math.min(it.params.at, built.geom[it.params.on].path.length)) : { p: [g.x, g.y, g.z], h: yaw };
        const width = (layout.items.find((i) => i.id === it.params.on) || { params: {} }).params.width || 0.6;
        const o = off(h.p[0], h.p[1], h.p[2], h.h, 0, width / 2 + 0.06, 0);
        parts.push(part([o[0], o[1], o[2] + 0.1], [0.03, 0.03, 0.26], h.h, 'steelDark', it.id), part([o[0], o[1], o[2] + 0.17], [0.05, 0.07, 0.05], h.h, 'eye', it.id));
        break;
      }
      case 'agv-path': {
        const n = Math.max(1, Math.ceil((g.path.length || 1) / 4));
        for (const pc of pieces(g.path, n)) parts.push({ c: [pc.c[0], pc.c[1], 0.004], s: [pc.length, 0.08, 0.008], yaw: pc.yaw, pitch: 0, col: 'tape', shape: 'box', item: it.id });
        break;
      }
      case 'agv-pick': case 'agv-drop':
        parts.push(part([g.x, g.y, g.z / 2], [0.6, 0.8, Math.max(0.1, g.z)], yaw, 'rack', it.id));
        break;
      default: break;
    }
  }
  return parts;
}

export function boundsOf(parts) {
  const mn = [Infinity, Infinity, Infinity], mx = [-Infinity, -Infinity, -Infinity];
  for (const p of parts) { const r = Math.hypot(p.s[0], p.s[1], p.s[2]) / 2; for (let i = 0; i < 3; i++) { mn[i] = Math.min(mn[i], p.c[i] - r); mx[i] = Math.max(mx[i], p.c[i] + r); } }
  return { min: mn, max: mx };
}
export function floorPart(parts) {
  if (!parts.length) return null;
  const b = boundsOf(parts), m = 2;
  return { c: [(b.min[0] + b.max[0]) / 2, (b.min[1] + b.max[1]) / 2, -0.02], s: [b.max[0] - b.min[0] + 2 * m, b.max[1] - b.min[1] + 2 * m, 0.04], yaw: 0, pitch: 0, col: 'floor', shape: 'box', item: 'floor' };
}

/** A player whose loads sit on a station's table: the flow playback holds a load in service 0.15 m above it, for its own marks. */
export function seated(player, built) {
  const tops = Object.values(built.geom).filter((g) => g.kind === 'station' || g.kind === 'transfer');
  return { ...player, frame(t) {
    const f = player.frame(t);
    return { ...f, loads: f.loads.map((l) => (tops.some((g) => Math.hypot(l.p[0] - g.x, l.p[1] - g.y) < 1e-6 && Math.abs(l.p[2] - g.z - 0.15) < 1e-6) ? { ...l, p: [l.p[0], l.p[1], l.p[2] - 0.15] } : l)) };
  } };
}

/** World position of a local point of a part. */
function place(p, a, b, c) {
  const cy = Math.cos(rad(p.yaw)), sy = Math.sin(rad(p.yaw)), cp = Math.cos(p.pitch || 0), sp = Math.sin(p.pitch || 0);
  const x1 = a * cp - c * sp, z1 = a * sp + c * cp;
  return [p.c[0] + x1 * cy - b * sy, p.c[1] + x1 * sy + b * cy, p.c[2] + z1];
}
export function meshOf(p) {
  const [l, w, h] = p.s, positions = [], quads = [];
  const push = (v) => { positions.push(v[0], v[1], v[2]); return positions.length / 3 - 1; };
  if (p.shape === 'cyl') {
    const n = 10, a = [], b = [];
    for (let i = 0; i < n; i++) { const t = (i / n) * Math.PI * 2, ca = Math.cos(t) * l / 2, cc = Math.sin(t) * h / 2; a.push(push(place(p, ca, -w / 2, cc))); b.push(push(place(p, ca, w / 2, cc))); }
    for (let i = 0; i < n; i++) { const j = (i + 1) % n; quads.push([a[i], a[j], b[j], b[i]]); }
    // the ends as fans of quads would be poor; triangles below
    const indices = quads.flatMap(([q0, q1, q2, q3]) => [q0, q1, q2, q0, q2, q3]);
    for (let i = 1; i < n - 1; i++) { indices.push(a[0], a[i + 1], a[i], b[0], b[i], b[i + 1]); }
    return { positions, indices, quads, caps: [a.slice().reverse(), b] };
  }
  const v = [];
  for (const [i, j, k] of [[-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1], [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]]) v.push(push(place(p, (i * l) / 2, (j * w) / 2, (k * h) / 2)));
  for (const f of [[0, 3, 2, 1], [4, 5, 6, 7], [0, 1, 5, 4], [1, 2, 6, 5], [2, 3, 7, 6], [3, 0, 4, 7]]) quads.push(f.map((i) => v[i]));
  return { positions, indices: quads.flatMap(([a, b, c, d]) => [a, b, c, a, c, d]), quads, caps: [] };
}

const MM = 1000;
export function toBodies(parts, { in: group = null, name = null } = {}) {
  return parts.map((p) => {
    const color = COLORS[p.col] || p.col;
    const base = { color, name: name || p.item || p.col, ...(group ? { in: group } : {}) };
    if (p.shape === 'box' && !p.pitch) {
      const corners = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([a, b]) => { const q = place(p, (a * p.s[0]) / 2, (b * p.s[1]) / 2, 0); return [q[0] * MM, q[1] * MM]; });
      return { ...base, prism: { pts: corners, z0: (p.c[2] - p.s[2] / 2) * MM, z1: (p.c[2] + p.s[2] / 2) * MM } };
    }
    const m = meshOf(p);
    return { ...base, mesh: { positions: m.positions.map((x) => x * MM), indices: m.indices } };
  });
}
