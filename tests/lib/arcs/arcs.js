/* SPDX-License-Identifier: Apache-2.0 */
/**
 * arcs.js — the eleven ways to draw an arc (cc-arcs, 0.9 FX.137). DOM-free, no host imports, 2D, plain {x, y} points.
 * One geometry for every drawing app: CadCraft drives it from its command line, the others from their own tool; a host only
 * asks the person for each input in `METHODS[id].steps` and calls `solve`, so no app keeps a second copy of the maths.
 *
 * Every arc runs COUNTER-CLOCKWISE from its start to its end (the drafting convention): { cx, cy, r, a0, a1 }, angles in radians
 * normalised to [0, 2π). A positive angle, length or radius is the short way round CCW; negative angle or chord length is the
 * clockwise arc (stored as the CCW arc between the same two ends), a negative radius is the major arc.
 *
 * Inputs by step kind: point {x,y}; angle = included angle in radians (signed); length = chord length (signed);
 * direction = tangent direction at the start, radians; radius = signed.
 */
const TAU = Math.PI * 2;
const EPS = 1e-9;
const norm = (a) => { a %= TAU; if (a < 0) a += TAU; return a > TAU - 1e-12 ? 0 : a; };   // a hair under 2π is 0
const ang = (a, b) => Math.atan2(b.y - a.y, b.x - a.x);
const dist = (a, b) => Math.hypot(b.x - a.x, b.y - a.y);

/** id → { steps: [kind…], order: indexes that give [start, centre|end …] }, English names (hosts translate through their own keys). */
export const METHODS = {
  '3P': { name: '3-Point', steps: ['point', 'point', 'point'] },
  SCE: { name: 'Start, Center, End', steps: ['point', 'point', 'point'] },
  SCA: { name: 'Start, Center, Angle', steps: ['point', 'point', 'angle'] },
  SCL: { name: 'Start, Center, Length', steps: ['point', 'point', 'length'] },
  SEA: { name: 'Start, End, Angle', steps: ['point', 'point', 'angle'] },
  SED: { name: 'Start, End, Direction', steps: ['point', 'point', 'direction'] },
  SER: { name: 'Start, End, Radius', steps: ['point', 'point', 'radius'] },
  CSE: { name: 'Center, Start, End', steps: ['point', 'point', 'point'] },
  CSA: { name: 'Center, Start, Angle', steps: ['point', 'point', 'angle'] },
  CSL: { name: 'Center, Start, Length', steps: ['point', 'point', 'length'] },
  CON: { name: 'Continue', steps: ['point'] },   // the start and direction come from the last line or arc: solve(.., { from })
};
export const METHOD_IDS = Object.keys(METHODS);
/** The prompt each step needs, by method and step index: 'start' | 'center' | 'second' | 'end' | 'angle' | 'length' | 'direction' | 'radius'. */
export const ROLES = {
  '3P': ['start', 'second', 'end'], SCE: ['start', 'center', 'end'], SCA: ['start', 'center', 'angle'], SCL: ['start', 'center', 'length'],
  SEA: ['start', 'end', 'angle'], SED: ['start', 'end', 'direction'], SER: ['start', 'end', 'radius'],
  CSE: ['center', 'start', 'end'], CSA: ['center', 'start', 'angle'], CSL: ['center', 'start', 'length'], CON: ['end'],
};

const make = (c, r, a0, a1) => ({ cx: c.x, cy: c.y, r, a0: norm(a0), a1: norm(a1) });

/** Centre and radius of the circle through three points, or null when they are in a line. */
export function circle3(a, b, c) {
  const d = 2 * (a.x * (b.y - c.y) + b.x * (c.y - a.y) + c.x * (a.y - b.y));
  if (Math.abs(d) < 1e-12) return null;
  const a2 = a.x * a.x + a.y * a.y, b2 = b.x * b.x + b.y * b.y, c2 = c.x * c.x + c.y * c.y;
  const cx = (a2 * (b.y - c.y) + b2 * (c.y - a.y) + c2 * (a.y - b.y)) / d;
  const cy = (a2 * (c.x - b.x) + b2 * (a.x - c.x) + c2 * (b.x - a.x)) / d;
  return { cx, cy, r: Math.hypot(a.x - cx, a.y - cy) };
}

/** Start, a point on the arc, end. */
export function arcThrough(s, m, e) {
  const k = circle3(s, m, e);
  if (!k) return null;
  const c = { x: k.cx, y: k.cy };
  const ccw = (m.x - s.x) * (e.y - s.y) - (m.y - s.y) * (e.x - s.x) > 0;   // a left turn s→m→e goes CCW round the centre
  return ccw ? make(c, k.r, ang(c, s), ang(c, e)) : make(c, k.r, ang(c, e), ang(c, s));
}

/** The CCW arc from s to e with included angle theta in (0, 2π). */
function ccwArc(s, e, theta) {
  const d = dist(s, e);
  const r = d / (2 * Math.sin(theta / 2));
  const h = r * Math.cos(theta / 2);   // centre's signed distance from the chord's middle, along the chord's left normal
  const m = { x: (s.x + e.x) / 2, y: (s.y + e.y) / 2 };
  const c = { x: m.x - ((e.y - s.y) / d) * h, y: m.y + ((e.x - s.x) / d) * h };
  return make(c, Math.abs(r), ang(c, s), ang(c, e));
}

/** Start, end, signed included angle (positive CCW from start to end). */
function fromSEA(s, e, theta) {
  if (dist(s, e) < EPS) return { error: 'same' };
  const t = Math.abs(theta);
  if (t < EPS || t >= TAU - EPS) return { error: 'angle' };
  return { arc: theta > 0 ? ccwArc(s, e, t) : ccwArc(e, s, t) };
}

/** Start, centre, signed included angle. */
function fromSCA(s, c, theta) {
  const r = dist(c, s);
  if (r < EPS) return { error: 'same' };
  if (Math.abs(theta) < EPS) return { error: 'angle' };
  const a = ang(c, s), t = Math.max(-TAU, Math.min(TAU, theta));
  return { arc: theta > 0 ? make(c, r, a, a + t) : make(c, r, a + t, a) };
}

/**
 * Solve a method. `v` holds the inputs in the order of ROLES[id] (points as {x,y}); Continue also takes `opt.from` =
 * { x, y, dir } (the end and end-tangent of the last line or arc). → { arc } or { error: 'same' | 'line' | 'chord' | 'angle' | 'direction' | 'radius' }.
 */
export function solve(id, v, opt = {}) {
  switch (id) {
    case '3P': { const a = arcThrough(v[0], v[1], v[2]); return a ? { arc: a } : { error: 'line' }; }
    case 'SCE': case 'CSE': {
      const [s, c] = id === 'SCE' ? [v[0], v[1]] : [v[1], v[0]], e = v[2], r = dist(c, s);
      if (r < EPS || dist(c, e) < EPS) return { error: 'same' };
      return { arc: make(c, r, ang(c, s), ang(c, e)) };
    }
    case 'SCA': return fromSCA(v[0], v[1], v[2]);
    case 'CSA': return fromSCA(v[1], v[0], v[2]);
    case 'SCL': case 'CSL': {
      const [s, c] = id === 'SCL' ? [v[0], v[1]] : [v[1], v[0]], r = dist(c, s), len = v[2];
      if (r < EPS) return { error: 'same' };
      if (Math.abs(len) < EPS || Math.abs(len) > 2 * r + EPS) return { error: 'chord' };
      const t = 2 * Math.asin(Math.min(1, Math.abs(len) / (2 * r)));
      return fromSCA(s, c, len > 0 ? t : -t);   // a negative chord length takes the clockwise arc
    }
    case 'SEA': return fromSEA(v[0], v[1], v[2]);
    case 'SER': {
      const [s, e, rad] = v, d = dist(s, e);
      if (d < EPS) return { error: 'same' };
      if (Math.abs(rad) < EPS || d > 2 * Math.abs(rad) + EPS) return { error: 'radius' };
      const t = 2 * Math.asin(Math.min(1, d / (2 * Math.abs(rad))));
      return fromSEA(s, e, rad > 0 ? t : TAU - t);   // positive radius: the minor arc CCW; negative: the major one
    }
    case 'SED': case 'CON': {
      const s = id === 'CON' ? opt.from : v[0], e = id === 'CON' ? v[0] : v[1], dir = id === 'CON' ? opt.from?.dir : v[2];
      if (!s || dir === undefined || !Number.isFinite(dir)) return { error: 'direction' };
      if (dist(s, e) < EPS) return { error: 'same' };
      let b = ang(s, e) - dir;   // chord angle off the tangent: the included angle is twice it
      b = ((b + Math.PI) % TAU + TAU) % TAU - Math.PI;
      if (Math.abs(b) < EPS || Math.abs(Math.abs(b) - Math.PI) < EPS) return { error: 'direction' };   // the end lies on the tangent: a line
      return fromSEA(s, e, 2 * b);
    }
    default: return { error: 'method' };
  }
}

/**
 * What the pointer at `cur` means for the input still to be given (`v` holds the inputs so far): the point itself; the angle swept
 * from the start's ray round the centre (Start, Center, Angle) or the angle of the arc through start, pointer and end
 * (Start, End, Angle); the distance from the start for a length or a radius; the direction from the start for a direction.
 */
export function pointerValue(id, v, cur, opt = {}) {
  const roles = ROLES[id], role = roles[id === 'CON' ? 0 : v.length];
  const start = id === 'CON' ? opt.from : v[roles.indexOf('start')];
  const ctr = roles.includes('center') ? v[roles.indexOf('center')] : null;
  switch (role) {
    case 'angle': {
      if (ctr) {
        const ux = start.x - ctr.x, uy = start.y - ctr.y, wx = cur.x - ctr.x, wy = cur.y - ctr.y;
        return Math.atan2(ux * wy - uy * wx, ux * wx + uy * wy);
      }
      const a = arcThrough(start, cur, v[roles.indexOf('end')]);
      if (!a) return 0;
      const s0 = startPoint(a);
      return Math.hypot(s0.x - start.x, s0.y - start.y) < 1e-6 * (1 + a.r) ? sweep(a) : -sweep(a);
    }
    case 'length': case 'radius': return dist(start, cur);
    case 'direction': return ang(start, cur);
    default: return cur;
  }
}

/** The arc while the last input is still being chosen with the pointer at `cur`. → { arc } or null. */
export function drag(id, v, cur, opt = {}) {
  const roles = ROLES[id];
  if (id !== 'CON' && v.length !== roles.length - 1) return null;
  const r = solve(id, [...(id === 'CON' ? [] : v), pointerValue(id, v, cur, opt)], opt);
  return r.arc ? r : null;
}

/** Sweep of an arc, radians (0, 2π]. */
export const sweep = (a) => norm(a.a1 - a.a0) || TAU;
export const startPoint = (a) => ({ x: a.cx + Math.cos(a.a0) * a.r, y: a.cy + Math.sin(a.a0) * a.r });
export const endPoint = (a) => ({ x: a.cx + Math.cos(a.a1) * a.r, y: a.cy + Math.sin(a.a1) * a.r });
export const midPoint = (a) => { const t = a.a0 + sweep(a) / 2; return { x: a.cx + Math.cos(t) * a.r, y: a.cy + Math.sin(t) * a.r }; };
/** Start, middle and end: for a host that stores an arc as three points. */
export const threePoints = (a) => [startPoint(a), midPoint(a), endPoint(a)];
/** The end point and the direction of travel there, for Continue. */
export const endTangent = (a) => ({ ...endPoint(a), dir: a.a1 + Math.PI / 2 });
