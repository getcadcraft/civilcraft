/* SPDX-License-Identifier: Apache-2.0 */
/**
 * geom.js — plane geometry and entity builders for the 2D MEP drafting engine (lib/mep2d). DOM-free.
 * Entities are CadCraft's plain shapes: line {x1,y1,x2,y2} · circle {cx,cy,r} · arc {cx,cy,r,a0,a1} (counter-clockwise from a0 to
 * a1, radians) · poly {pts:[{x,y,b}], closed} · hatch {loops:[[x,y,…]], solid} · text {x,y,h,rot,s,ha,va}.
 */

export const P = (x, y) => ({ x, y });
export const sub = (a, b) => ({ x: a.x - b.x, y: a.y - b.y });
export const add = (a, b) => ({ x: a.x + b.x, y: a.y + b.y });
export const mul = (a, k) => ({ x: a.x * k, y: a.y * k });
export const dot = (a, b) => a.x * b.x + a.y * b.y;
export const cross = (a, b) => a.x * b.y - a.y * b.x;
export const len = (a) => Math.hypot(a.x, a.y);
export const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
export const unit = (a) => { const l = len(a); return l > 0 ? { x: a.x / l, y: a.y / l } : { x: 1, y: 0 }; };
/** The left normal of a direction. */
export const left = (d) => ({ x: -d.y, y: d.x });
export const along = (a, d, s) => ({ x: a.x + d.x * s, y: a.y + d.y * s });

export const line = (a, b) => ({ type: 'line', x1: a.x, y1: a.y, x2: b.x, y2: b.y });
export const L = (x1, y1, x2, y2) => ({ type: 'line', x1, y1, x2, y2 });
export const poly = (pts, closed = false) => ({ type: 'poly', closed, pts: pts.map((p) => (Array.isArray(p) ? { x: p[0], y: p[1], b: p[2] || 0 } : { x: p.x, y: p.y, b: p.b || 0 })) });
export const circle = (cx, cy, r) => ({ type: 'circle', cx, cy, r });
export const arc = (cx, cy, r, a0, a1) => ({ type: 'arc', cx, cy, r, a0, a1 });
export const fill = (pts) => ({ type: 'hatch', solid: true, loops: [pts.flat()] });
export const disc = (cx, cy, r, n = 16) => fill(Array.from({ length: n }, (_, i) => [cx + r * Math.cos((2 * Math.PI * i) / n), cy + r * Math.sin((2 * Math.PI * i) / n)]));
export const text = (x, y, h, s, extra = {}) => ({ type: 'text', x, y, h, rot: 0, s: String(s), ha: 'center', va: 'middle', ...extra });
export const rect = (x0, y0, x1, y1) => poly([[x0, y0], [x1, y0], [x1, y1], [x0, y1]], true);

/** An angle text reads at: within (−90°, 90°], so text along a run is never upside down. */
export function readableAngle(a) {
  let r = Math.atan2(Math.sin(a), Math.cos(a));
  if (r > Math.PI / 2 + 1e-9) r -= Math.PI;
  else if (r <= -Math.PI / 2 + 1e-9) r += Math.PI;
  return r;
}

/** The signed turn from direction a to direction b (left = positive). */
export const turn = (a, b) => Math.atan2(cross(a, b), dot(a, b));

/** Entities scaled by s (uniform), turned by ang and moved to p. */
export function placeEnts(ents, p = { x: 0, y: 0 }, ang = 0, s = 1) {
  const cs = Math.cos(ang) * s, sn = Math.sin(ang) * s;
  const tx = (x, y) => [p.x + x * cs - y * sn, p.y + x * sn + y * cs];
  return ents.map((e) => {
    if (e.type === 'line') { const [x1, y1] = tx(e.x1, e.y1), [x2, y2] = tx(e.x2, e.y2); return { ...e, x1, y1, x2, y2 }; }
    if (e.type === 'circle') { const [cx, cy] = tx(e.cx, e.cy); return { ...e, cx, cy, r: e.r * s }; }
    if (e.type === 'arc') { const [cx, cy] = tx(e.cx, e.cy); return { ...e, cx, cy, r: e.r * s, a0: e.a0 + ang, a1: e.a1 + ang }; }
    if (e.type === 'poly') return { ...e, pts: e.pts.map((q) => { const [x, y] = tx(q.x, q.y); return { x, y, b: q.b || 0 }; }) };
    if (e.type === 'hatch') return { ...e, loops: e.loops.map((lp) => { const o = []; for (let i = 0; i + 1 < lp.length; i += 2) o.push(...tx(lp[i], lp[i + 1])); return o; }) };
    if (e.type === 'text') { const [x, y] = tx(e.x, e.y); return { ...e, x, y, h: e.h * s, rot: (e.rot || 0) + ang }; }
    return { ...e };
  });
}

/** A point through an insert's placement {x, y, rot, sx, sy}. */
export function throughInsert(ins, q) {
  const sx = ins.sx ?? 1, sy = ins.sy ?? sx, c = Math.cos(ins.rot || 0), s = Math.sin(ins.rot || 0);
  const x = q.x * sx, y = q.y * sy;
  return { x: (ins.x || 0) + x * c - y * s, y: (ins.y || 0) + x * s + y * c };
}

/** The straight pieces of a line or an open/closed polyline: [{ a, b, i }] (bulged polyline pieces are left out). */
export function straightSegs(e) {
  if (!e) return [];
  if (e.type === 'line') return [{ a: P(e.x1, e.y1), b: P(e.x2, e.y2), i: 0 }];
  if (e.type !== 'poly' || !Array.isArray(e.pts)) return [];
  const out = [], n = e.pts.length;
  for (let i = 0; i < (e.closed ? n : n - 1); i++) {
    const a = e.pts[i], b = e.pts[(i + 1) % n];
    if (a.b) continue;
    if (Math.hypot(b.x - a.x, b.y - a.y) < 1e-12) continue;
    out.push({ a: P(a.x, a.y), b: P(b.x, b.y), i });
  }
  return out;
}

/** p projected onto segment a–b: { t (0…1 inside), q (the nearest point on the segment), d (distance to it), off (distance to the endless line) }. */
export function project(a, b, p) {
  const ab = sub(b, a), l2 = dot(ab, ab);
  const t = l2 > 0 ? dot(sub(p, a), ab) / l2 : 0;
  const tc = Math.max(0, Math.min(1, t));
  const q = { x: a.x + ab.x * tc, y: a.y + ab.y * tc };
  const f = { x: a.x + ab.x * t, y: a.y + ab.y * t };
  return { t, q, d: dist(p, q), off: dist(p, f), foot: f };
}

/** The length of a line, arc or polyline (straight pieces and bulges). */
export function entityLength(e) {
  if (e.type === 'line') return Math.hypot(e.x2 - e.x1, e.y2 - e.y1);
  if (e.type === 'arc') { let d = e.a1 - e.a0; while (d < 0) d += 2 * Math.PI; return e.r * d; }
  if (e.type === 'poly') {
    let s = 0;
    const n = e.pts.length;
    for (let i = 0; i < (e.closed ? n : n - 1); i++) {
      const a = e.pts[i], b = e.pts[(i + 1) % n], c = Math.hypot(b.x - a.x, b.y - a.y);
      if (a.b) { const th = 4 * Math.atan(Math.abs(a.b)); s += th > 1e-12 ? (c / (2 * Math.sin(th / 2))) * th : c; } else s += c;
    }
    return s;
  }
  return 0;
}
