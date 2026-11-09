/* SPDX-License-Identifier: Apache-2.0 */
/**
 * physics.js — rigid boxes riding moving surfaces (0.9 TW.3). Our own extended position-based dynamics (Müller, Macklin, Chentanez, Jeschke, Kim, "Detailed Rigid Body
 * Simulation with Extended Position Based Dynamics", SCA 2020), the method anim/physics.js uses, with what a conveyor needs and that one lacks: a static box may have a surface
 * velocity (a belt), and friction drives a load toward it. Boxes only. DOM-free, no imports, deterministic. Metres, seconds, Z up.
 *
 *   const w = new World({ h: 1 / 240 });
 *   w.addStatic({ id, c, half, yaw, pitch, surface: [vx, vy, vz] | (t) => [..], mu })     yaw about Z (degrees), then pitch about the turned Y (radians, + rises along +X)
 *   w.addBody({ id, x, half, mass, mu, yaw })
 *   w.step(); w.bodies[i].x / .q / .v / .w; upOf(body); footing(w, body) → the static under it | null
 */
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const scl = (a, k) => [a[0] * k, a[1] * k, a[2] * k];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const len = (a) => Math.hypot(a[0], a[1], a[2]);
const qmul = (a, b) => [
  a[3] * b[0] + a[0] * b[3] + a[1] * b[2] - a[2] * b[1], a[3] * b[1] - a[0] * b[2] + a[1] * b[3] + a[2] * b[0],
  a[3] * b[2] + a[0] * b[1] - a[1] * b[0] + a[2] * b[3], a[3] * b[3] - a[0] * b[0] - a[1] * b[1] - a[2] * b[2],
];
const qnorm = (q) => { const l = Math.hypot(q[0], q[1], q[2], q[3]) || 1; return [q[0] / l, q[1] / l, q[2] / l, q[3] / l]; };
const qconj = (q) => [-q[0], -q[1], -q[2], q[3]];
export function rot(q, v) { const u = [q[0], q[1], q[2]], c = add(cross(u, v), scl(v, q[3])); return add(v, scl(cross(u, c), 2)); }
const rotInv = (q, v) => rot(qconj(q), v);
const qAxis = (ax, a) => { const s = Math.sin(a / 2); return [ax[0] * s, ax[1] * s, ax[2] * s, Math.cos(a / 2)]; };
/** Yaw about Z in degrees, then pitch in radians (+ rises along the turned +X). */
export const yawPitch = (yawDeg = 0, pitch = 0) => qmul(qAxis([0, 0, 1], (yawDeg * Math.PI) / 180), qAxis([0, 1, 0], -pitch));
export const upOf = (b) => rot(b.q, [0, 0, 1]);

function invIw(B, v) { const l = rotInv(B.q, v); return rot(B.q, [l[0] * B.invI[0], l[1] * B.invI[1], l[2] * B.invI[2]]); }
function inBox(B, p, margin = 0) {
  const l = rotInv(B.q, sub(p, B.x)), h = B.half;
  const e0 = h[0] + margin - Math.abs(l[0]), e1 = h[1] + margin - Math.abs(l[1]), e2 = h[2] + margin - Math.abs(l[2]);
  if (e0 < 0 || e1 < 0 || e2 < 0) return null;
  // a belt's seam is bevelled in life: a point just under its top is on the top, not caught on the end face
  const a = B.topBias && l[2] > 0 && e2 - margin < B.topBias ? 2 : e0 < e1 ? (e0 < e2 ? 0 : 2) : e1 < e2 ? 1 : 2, nl = [0, 0, 0];
  nl[a] = l[a] >= 0 ? 1 : -1;
  return { d: (a === 0 ? e0 : a === 1 ? e1 : e2) - margin, n: rot(B.q, nl), a, up: a === 2 && nl[2] > 0 };
}

export class World {
  constructor({ h = 1 / 240, gravity = [0, 0, -9.81] } = {}) { this.h = h; this.g = gravity; this.t = 0; this.statics = []; this.bodies = []; }
  addStatic({ id, c, half, yaw = 0, pitch = 0, surface = null, mu = 0.6 }) {
    const S = { id, x: c.slice(), half: half.slice(), q: yawPitch(yaw, pitch), surface, mu, dyn: false, invMass: 0, invI: [0, 0, 0], bound: len(half), topBias: surface ? 0.03 : 0 };
    this.statics.push(S); return S;
  }
  addBody({ id, x, half, mass = 10, mu = 0.5, yaw = 0, v = [0, 0, 0] }) {
    const [a, b, c] = half.map((v2) => 2 * v2);
    const B = { id, x: x.slice(), half: half.slice(), q: yawPitch(yaw, 0), v: v.slice(), w: [0, 0, 0], mass, mu, dyn: true, invMass: 1 / mass,
      invI: [12 / (mass * (b * b + c * c)), 12 / (mass * (a * a + c * c)), 12 / (mass * (a * a + b * b))], bound: len(half), pts: [], slipping: 0 };
    for (const i of [-1, 0, 1]) for (const j of [-1, 0, 1]) for (const k of [-1, 0, 1]) if (i || j || k) B.pts.push([i * half[0], j * half[1], k * half[2]]);
    this.bodies.push(B); return B;
  }
  surfaceVel(S, t) { if (!S || !S.surface) return [0, 0, 0]; return typeof S.surface === 'function' ? S.surface(t) : S.surface; }
  /** Positional correction along n at point p between dynamic A and B (null/static). → λ */
  positional(A, B, p, n, c) {
    const ra = sub(p, A.x), ca = cross(ra, n);
    let w = A.invMass + dot(ca, invIw(A, ca));
    let rb = null;
    if (B && B.dyn) { rb = sub(p, B.x); const cb = cross(rb, n); w += B.invMass + dot(cb, invIw(B, cb)); }
    if (w <= 0) return 0;
    const lam = c / w, P = scl(n, lam);
    A.x = add(A.x, scl(P, A.invMass));
    const da = invIw(A, cross(ra, P));
    A.q = qnorm(add4(A.q, scl4(qmul([da[0], da[1], da[2], 0], A.q), 0.5)));
    if (rb) {
      B.x = sub(B.x, scl(P, B.invMass));
      const db = invIw(B, cross(rb, scl(P, -1)));
      B.q = qnorm(add4(B.q, scl4(qmul([db[0], db[1], db[2], 0], B.q), 0.5)));
    }
    return lam;
  }
  step() {
    const h = this.h, t = this.t;
    for (const b of this.bodies) {
      b.px = b.x; b.pq = b.q;
      b.v = add(b.v, scl(this.g, h));
      b.x = add(b.x, scl(b.v, h));
      b.q = qnorm(add4(b.q, scl4(qmul([b.w[0], b.w[1], b.w[2], 0], b.q), 0.5 * h)));
    }
    const cs = [];
    for (let i = 0; i < this.bodies.length; i++) {
      const A = this.bodies[i];
      for (const S of this.statics) {
        if (len(sub(A.x, S.x)) > A.bound + S.bound + 0.02) continue;
        for (const pt of A.pts) if (inBox(S, add(A.x, rot(A.q, pt)), 1e-3)) cs.push({ a: A, o: S, pt, sv: this.surfaceVel(S, t), mu: Math.sqrt(A.mu * S.mu), s: 1 });
      }
      for (let j = 0; j < this.bodies.length; j++) {
        if (j === i) continue;
        const O = this.bodies[j];
        if (len(sub(A.x, O.x)) > A.bound + O.bound + 0.02) continue;
        for (const pt of A.pts) if (inBox(O, add(A.x, rot(A.q, pt)), 1e-3)) cs.push({ a: A, o: O, pt, sv: null, mu: Math.sqrt(A.mu * O.mu), s: 1 });
      }
    }
    // positions: push out, then static friction (the contact holds on to the surface while that takes no more than μ × the push)
    for (let sweep = 0; sweep < 2; sweep++) for (const c of cs) {
      const A = c.a, O = c.o, p = add(A.x, rot(A.q, c.pt)), g = inBox(O, p);
      if (!g || g.d <= 0) continue;
      const lam = this.positional(A, O.dyn ? O : null, p, g.n, g.d);
      c.lam = (c.lam || 0) + lam; c.n = g.n; c.up = g.up;
      const p1 = add(A.x, rot(A.q, c.pt));
      c.p = p1;
    }
    for (const c of cs) {
      if (!c.lam) continue;
      const A = c.a, O = c.o, p = c.p;
      const pPrev = add(A.px, rot(A.pq, c.pt));
      let slide = sub(p, pPrev);
      if (c.sv && c.up) slide = sub(slide, scl(c.sv, h));
      if (O.dyn) slide = sub(slide, scl(O.v, h));
      const st = sub(slide, scl(c.n, dot(slide, c.n))), stl = len(st);
      if (stl < 1e-12) continue;
      const dir = scl(st, -1 / stl), ra = sub(p, A.x), ca = cross(ra, dir);
      const w = A.invMass + dot(ca, invIw(A, ca)) + (O.dyn ? (() => { const rb = sub(p, O.x), cb = cross(rb, dir); return O.invMass + dot(cb, invIw(O, cb)); })() : 0);
      const need = stl / w, limit = c.mu * c.lam;
      this.positional(A, O.dyn ? O : null, p, dir, Math.min(need, limit) * w);
      c.slid = need > limit;
    }
    for (const b of this.bodies) {
      b.v = scl(sub(b.x, b.px), 1 / h);
      const dq = qmul(b.q, qconj(b.pq));
      b.w = scl([dq[0], dq[1], dq[2]], (2 / h) * (dq[3] >= 0 ? 1 : -1));
      const speed = len(b.v); if (speed > 50) b.v = scl(b.v, 50 / speed);
      b.slipping = 0;
    }
    for (const c of cs) if (c.slid) c.a.slipping++;
    this.t += h;
  }
}
const add4 = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2], a[3] + b[3]];
const scl4 = (a, k) => [a[0] * k, a[1] * k, a[2] * k, a[3] * k];

/** What the formulas say about a load on a belt, before any run: { slipIncline, tipIncline, slipCurve, tipStop … } limits and verdicts. */
export function screen({ l, w, h, mu }, { pitchDeg = 0, speed = 0, radius = 0, stopDecel = 0, dv = 0 }) {
  const g = 9.81, th = (Math.abs(pitchDeg) * Math.PI) / 180, tanT = Math.tan(th);
  const out = { pitchDeg, slipAtDeg: (Math.atan(mu) * 180) / Math.PI, tipAtDeg: (Math.atan(l / h) * 180) / Math.PI, issues: [] };
  if (tanT > mu) out.issues.push('slip-incline');
  if (tanT > l / h) out.issues.push('tip-incline');
  if (radius > 0 && speed > 0) {
    const lat = (speed * speed) / radius;
    out.lateral = lat;
    if (lat > mu * g) out.issues.push('slip-curve');
    if (lat > (g * w) / h) out.issues.push('tip-curve');
  }
  if (stopDecel > 0) { if (stopDecel > mu * g) out.issues.push('slip-stop'); if (stopDecel > (g * l) / h) out.issues.push('tip-stop'); }
  if (dv > 0) { out.settle = dv / (mu * g); const a = mu * g; if (a * h > g * l) out.issues.push('tip-transfer'); }
  return out;
}

/** The straight pieces a conveyor's path is made of, for the physics and the drawing: [{a, b, c, length, yaw, pitch}]. */
export function pieces(path, n) {
  const out = [];
  for (let i = 0; i < n; i++) {
    const a = path.at((path.length * i) / n).p, b = path.at((path.length * (i + 1)) / n).p;
    const d = sub(b, a), run = Math.hypot(d[0], d[1]);
    out.push({ a, b, c: scl(add(a, b), 0.5), length: len(d), yaw: (Math.atan2(d[1], d[0]) * 180) / Math.PI, pitch: Math.atan2(d[2], run) });
  }
  return out;
}

const ZERO_LEN = new Set(['merge', 'divert', 'gate']);
/**
 * The one line a load would ride from a source, followed through the first output of each divert: [{ id, kind, ... }]. It stops at a station, sink, AGV pickup or a gap.
 * layout = the flow layout, built = its buildGraph() result.
 */
export function lineFrom(layout, built, startId) {
  const byId = new Map(layout.items.map((i) => [i.id, i])), line = [], seen = new Set();
  let id = startId;
  while (id && !seen.has(id)) {
    seen.add(id);
    const it = byId.get(id); if (!it) break;
    line.push(it);
    if (it.kind !== 'source' && !ZERO_LEN.has(it.kind) && !built.geom[id].path) break;
    const out = built.graph.links.filter((l) => l.from === id).sort((a, b) => String(a.out).localeCompare(String(b.out)))[0];
    id = out ? out.to : null;
  }
  return line;
}

/**
 * Ride one load along a line. load = { l, w, h, mass, mu }, opts { guards, maxS, belts: { mu }, fps, count, spacingS } → { outcome: 'ok'|'tipped'|'fell'|'stuck'|'slid-back', at, t, frames, track }
 * frames: [{ t, bodies: [{ id, x, q }] }] at fps, for the 3D view. The first load decides the outcome; others only add contact between loads.
 */
export function rideLine(layout, built, startId, load, { guards = false, maxS = 120, belts = {}, fps = 30, count = 1, spacingS = 3, h = 1 / 240 } = {}) {
  const line = lineFrom(layout, built, startId);
  const w = new World({ h }), reaches = [];
  // load.mu is the friction of this load on the belt: the pair's friction is √(a × b), so the belt says 1 and the load μ²
  const mu = 1, bodyMu = load.mu * load.mu; void belts;
  let lastSpeed = 0, firstSpeed = null;
  for (const it of line) {
    const g = built.geom[it.id];
    const width = it.params.width || 0.8;
    if (g.path) {
      const n = it.kind === 'curve' ? Math.max(4, Math.ceil(Math.abs(it.params.angle) / 6)) : 1;
      const speed = it.params.speed || 0.5;
      if (firstSpeed === null) firstSpeed = speed;
      lastSpeed = speed;
      for (const pc of pieces(g.path, n)) {
        const c = [pc.c[0], pc.c[1], pc.c[2] - 0.05 / Math.cos(pc.pitch)];
        const dir = [Math.cos((pc.yaw * Math.PI) / 180) * Math.cos(pc.pitch), Math.sin((pc.yaw * Math.PI) / 180) * Math.cos(pc.pitch), Math.sin(pc.pitch)];
        // a curve's pieces overlap on the outside so there is no notch for a corner to catch on
        w.addStatic({ id: it.id, c, half: [pc.length / 2 + (n > 1 ? width * 0.1 : 0.005), width / 2, 0.05], yaw: pc.yaw, pitch: pc.pitch, surface: scl(dir, speed), mu });
        if (guards) for (const sd of [-1, 1]) {
          const ox = -Math.sin((pc.yaw * Math.PI) / 180) * (width / 2 + 0.02) * sd, oy = Math.cos((pc.yaw * Math.PI) / 180) * (width / 2 + 0.02) * sd;
          w.addStatic({ id: it.id + ':guard', c: [pc.c[0] + ox, pc.c[1] + oy, pc.c[2] + 0.08], half: [pc.length / 2 + 0.02, 0.02, 0.1], yaw: pc.yaw, pitch: pc.pitch, mu: 0.3 });
        }
      }
      reaches.push({ id: it.id, end: g.path.at(g.path.length).p });
    } else if (ZERO_LEN.has(it.kind)) {
      const ports = Object.values(g.ports);
      const out = ports.find((p) => p.dir === 'out') || ports[0], inn = ports.find((p) => p.dir === 'in') || ports[0];
      const yaw = out.h, c = scl(add(inn.p, out.p), 0.5);
      const rd = (yaw * Math.PI) / 180;
      w.addStatic({ id: it.id, c: [c[0], c[1], c[2] - 0.05], half: [Math.max(0.1, len(sub(out.p, inn.p)) / 2 + 0.01), 0.4, 0.05], yaw, surface: [Math.cos(rd) * lastSpeed, Math.sin(rd) * lastSpeed, 0], mu });
    }
  }
  const first = line.find((i) => built.geom[i.id].path);
  if (!first) return { outcome: 'no-belt', at: null, t: 0, frames: [], line: line.map((i) => i.id) };
  const start = built.geom[first.id].path.at(Math.min(load.l / 2 + 0.03, built.geom[first.id].path.length / 2));
  const place = () => w.addBody({ id: 'load-' + w.bodies.length, x: [start.p[0], start.p[1], start.p[2] + load.h / 2 + 0.002], half: [load.l / 2, load.w / 2, load.h / 2], mass: load.mass || 10, mu: bodyMu, yaw: start.h, v: [Math.cos((start.h * Math.PI) / 180) * (firstSpeed || 0), Math.sin((start.h * Math.PI) / 180) * (firstSpeed || 0), 0] });
  const B = place();
  const lastEnd = reaches[reaches.length - 1].end;
  const frames = [], track = [];
  const lowest = Math.min(...w.statics.map((s) => s.x[2])) - 0.5;
  let placed = 1, nextFrame = 0, best = Infinity, bestAt = 0, slipSteps = 0, steps = 0, res = null;
  const near = () => { let at = first.id, bd = Infinity; for (const S of w.statics) { if (S.id.endsWith(':guard')) continue; const dl = len(sub(S.x, B.x)) - S.half[0]; if (dl < bd) { bd = dl; at = S.id; } } return at; };
  const end = () => { const d = len(sub(B.x, [lastEnd[0], lastEnd[1], lastEnd[2] + load.h / 2])); return d; };
  while (w.t < maxS && !res) {
    if (placed < count && w.t >= placed * spacingS) { place(); placed++; }
    w.step(); steps++;
    if (B.slipping) slipSteps++;
    const up = upOf(B);
    if (up[2] < Math.cos((50 * Math.PI) / 180)) res = { outcome: 'tipped', at: near() };
    else if (B.x[2] < lowest) res = { outcome: 'fell', at: near() };
    else {
      const d = end();
      if (d < best - 0.01) { best = d; bestAt = w.t; }
      if (d < Math.max(load.l / 2, 0.08) + 0.04) res = { outcome: 'ok', at: reaches[reaches.length - 1].id };
      else if (w.t - bestAt > 12) res = { outcome: slipSteps / steps > 0.3 ? 'slid-back' : 'stuck', at: near() };
    }
    if (w.t >= nextFrame) { frames.push({ t: w.t, bodies: w.bodies.map((b) => ({ id: b.id, x: b.x, q: b.q })) }); track.push({ t: w.t, x: B.x, up: up[2] }); nextFrame += 1 / fps; }
  }
  return { ...(res || { outcome: 'stuck', at: near() }), t: w.t, frames, track, slipShare: steps ? slipSteps / steps : 0, line: line.map((i) => i.id), half: [load.l / 2, load.w / 2, load.h / 2] };
}

/** The formula screen for every belt on a line: [{ id, kind, pitchDeg, issues, slipAtDeg, tipAtDeg }]. */
export function screenLine(layout, built, startId, load, { stopDecel = 0 } = {}) {
  const line = lineFrom(layout, built, startId), rows = [];
  let prev = null;
  for (const it of line) {
    if (!built.geom[it.id].path) continue;
    const pc = pieces(built.geom[it.id].path, 1)[0], speed = it.params.speed || 0;
    rows.push({ id: it.id, kind: it.kind, ...screen(load, { pitchDeg: it.kind === 'incline' ? (pc.pitch * 180) / Math.PI : 0, speed, radius: it.kind === 'curve' ? it.params.radius : 0, stopDecel, dv: prev === null ? 0 : Math.abs(speed - prev) }) });
    prev = speed;
  }
  return rows;
}
