/* SPDX-License-Identifier: Apache-2.0 */
/**
 * geometry.js — the centre-line frame of a timber roof truss from its type, span, pitch and overhang (DOM-free; pure).
 *   generate(spec) → { ok, type, span, pitch, overhang, nodes: [{ id, x, z }], members: [{ id, role, a, b, len, angle }],
 *                       supports: [nodeA, nodeB], notes: [..] } | { ok: false, error: key }
 * x runs along the span from the left bearing (0) to the right (span); z is up from the bearing joint, in mm. The chords meet at the bearing
 * joints (the heel joints) — the heel HEIGHT is a depth at the outer face, worked out beside the sizes by heelInfo(), and the raise it gives
 * is a lift of the whole frame, not a part of the statics.
 * Types: king, queen, howe, pratt, fink, scissor, mono, attic. Roles: top (chord), bottom (chord), web, post, tail (the overhang end of a top chord).
 */
const D2R = Math.PI / 180;
const TOL = 0.5;

class Frame {
  constructor() { this.nodes = []; this.members = []; }
  node(x, z) {
    const f = this.nodes.find((n) => Math.abs(n.x - x) < TOL && Math.abs(n.z - z) < TOL);
    if (f) return f.id;
    const id = this.nodes.length;
    this.nodes.push({ id, x, z });
    return id;
  }
  add(role, a, b) {
    if (a === b) return null;
    if (this.members.some((m) => (m.a === a && m.b === b) || (m.a === b && m.b === a))) return null;
    const A = this.nodes[a], B = this.nodes[b];
    const len = Math.hypot(B.x - A.x, B.z - A.z);
    if (len < 1) return null;
    this.members.push({ id: this.members.length, role, a, b, len, angle: Math.abs(Math.atan2(B.z - A.z, B.x - A.x)) / D2R });
    return this.members.length - 1;
  }
  chain(role, ids) { for (let i = 0; i + 1 < ids.length; i++) this.add(role, ids[i], ids[i + 1]); }
}

const err = (error) => ({ ok: false, error });

export function generate(spec = {}) {
  const type = String(spec.type || 'fink');
  const S = Number(spec.span), pitch = Number(spec.pitch), oh = Math.max(0, Number(spec.overhang) || 0);
  if (!(S >= 1500 && S <= 30000)) return err('span');
  if (!(pitch >= 5 && pitch <= 60)) return err('pitch');
  const tan = Math.tan(pitch * D2R), F = new Frame(), notes = [];
  const rise = (x) => Math.min(x, S - x) * tan;
  const bot = (x, z = 0) => F.node(x, z);
  let tail = true;
  const panelsOf = (dflt, even) => { let n = Math.round(Number(spec.panels) || dflt); n = Math.max(even ? 4 : 2, Math.min(12, n)); return even && n % 2 ? n + 1 : n; };

  if (type === 'king') {
    const B0 = bot(0), B1 = bot(S / 2), B2 = bot(S), P = F.node(S / 2, rise(S / 2));
    F.chain('bottom', [B0, B1, B2]); F.chain('top', [B0, P, B2]); F.add('post', B1, P);
  } else if (type === 'queen') {
    const x1 = S / 3, x2 = 2 * S / 3;
    const B = [bot(0), bot(x1), bot(x2), bot(S)], R1 = F.node(x1, rise(x1)), R2 = F.node(x2, rise(x2)), P = F.node(S / 2, rise(S / 2));
    F.chain('bottom', B); F.chain('top', [B[0], R1, P, R2, B[3]]);
    F.add('post', B[1], R1); F.add('post', B[2], R2); F.add('web', R1, R2); F.add('web', B[1], R2);
    notes.push('queen: a horizontal strut between the queen posts and one diagonal brace make the middle panel stiff');
  } else if (type === 'howe' || type === 'pratt') {
    const n = panelsOf(6, true), Bs = [], Ts = [];
    for (let i = 0; i <= n; i++) { const x = (S * i) / n; Bs.push(bot(x)); Ts.push(i === 0 || i === n ? Bs[i] : F.node(x, rise(x))); }
    F.chain('bottom', Bs); F.chain('top', Ts);
    for (let i = 1; i < n; i++) F.add('post', Bs[i], Ts[i]);
    for (let i = 1; i < n / 2; i++) {
      const j = n - i;
      if (type === 'pratt') { F.add('web', Ts[i], Bs[i + 1]); F.add('web', Ts[j], Bs[j - 1]); }
      else { F.add('web', Bs[i], Ts[i + 1]); F.add('web', Bs[j], Ts[j - 1]); }
    }
  } else if (type === 'fink') {
    const xs = [0, S / 3, 2 * S / 3, S], B = xs.map((x) => bot(x)), R1 = F.node(S / 4, rise(S / 4)), R2 = F.node(3 * S / 4, rise(3 * S / 4)), P = F.node(S / 2, rise(S / 2));
    F.chain('bottom', B); F.chain('top', [B[0], R1, P, R2, B[3]]);
    F.add('web', R1, B[1]); F.add('web', B[1], P); F.add('web', P, B[2]); F.add('web', B[2], R2);
  } else if (type === 'scissor') {
    let bp = Number(spec.bottomPitch);
    if (!(bp > 0)) bp = pitch / 2;
    if (bp >= pitch - 2) return err('scissor');
    const zb = (S / 2) * Math.tan(bp * D2R);
    const B0 = bot(0), Bm = bot(S / 2, zb), B2 = bot(S), P = F.node(S / 2, rise(S / 2));
    F.chain('bottom', [B0, Bm, B2]); F.chain('top', [B0, P, B2]); F.add('post', Bm, P);
    notes.push('scissor: the bottom chords rise at ' + Math.round(bp * 10) / 10 + ' degrees; the supports spread, so one bearing is drawn as a roller');
  } else if (type === 'mono') {
    const n = panelsOf(4, false), Bs = [], Ts = [];
    for (let i = 0; i <= n; i++) { const x = (S * i) / n; Bs.push(bot(x)); Ts.push(i === 0 ? Bs[0] : F.node(x, x * tan)); }
    F.chain('bottom', Bs); F.chain('top', Ts);
    for (let i = 1; i <= n; i++) F.add('post', Bs[i], Ts[i]);
    for (let i = 1; i < n; i++) F.add('web', Ts[i], Bs[i + 1]);
    tail = false;
  } else if (type === 'attic') {
    const W = Number(spec.atticWidth) || 3000, H = Number(spec.atticHeight) || 2400, xa = (S - W) / 2, xb = xa + W;
    if (!(W >= 1500 && W < S - 600)) return err('attic');
    if (!(H >= 1800 && H < rise(xa) - 150)) return err('atticHeight');
    const B = [bot(0), bot(xa), bot(xb), bot(S)], C1 = F.node(xa, H), C2 = F.node(xb, H), R1 = F.node(xa, rise(xa)), R2 = F.node(xb, rise(xb)), P = F.node(S / 2, rise(S / 2));
    F.chain('bottom', B); F.chain('top', [B[0], R1, P, R2, B[3]]);
    F.chain('post', [B[1], C1, R1]); F.chain('post', [B[2], C2, R2]); F.add('web', C1, C2); F.add('web', C1, P); F.add('web', C2, P);
    // the room box: floor, two knee walls and the ceiling tie. A pin-jointed box is a mechanism; it is held only if its corner joints resist bending.
    for (const [p, q] of [[B[1], B[2]], [B[1], C1], [B[2], C2], [C1, C2]]) { const mm = F.members.find((x) => (x.a === p && x.b === q) || (x.a === q && x.b === p)); if (mm) mm.room = true; }
    notes.push('attic: the room box (floor, knee walls, ceiling tie) is a rectangle; a pin-jointed frame cannot hold it, the joints must resist bending');
  } else return err('type');

  // the overhang: each top chord runs on past the bearing along its own line (a mono truss has it at the low end only)
  const n0 = 0, nLast = F.nodes.findIndex((n) => Math.abs(n.x - S) < TOL && Math.abs(n.z) < TOL);
  if (oh > 0) {
    F.add('tail', F.node(-oh, -oh * tan), n0);
    if (tail && nLast >= 0) F.add('tail', F.node(S + oh, -oh * tan), nLast);
  }
  return { ok: true, type, span: S, pitch, overhang: oh, nodes: F.nodes, members: F.members, supports: [n0, nLast], notes,
    rise: rise(S / 2) * (type === 'mono' ? 2 : 1) };
}

/**
 * Raised heel / bearing stub: a heel taller than the chords need stands on a vertical stub under each heel joint. The stub is a real member (role 'stub',
 * from the bearing up to the heel joint) with its own nodes; the supports of the pin-jointed analysis stay at the heel joints, and the stub carries the
 * vertical bearing reaction as a compression member (the horizontal reaction there is shear at the stub and its anchorage, said in Problems).
 * Frame z = 0 is the heel joint; the bearing is `raise` below it, and the whole frame is lifted by `raise` when it is drawn or placed (g.raise).
 */
export function addStubs(g, raise) {
  if (!(raise > 1) || g.members.some((m) => m.role === 'stub')) return g;
  g.bearings = [];
  for (const sup of g.supports) {
    if (sup < 0) continue;
    const n = g.nodes[sup], id = g.nodes.length;
    g.nodes.push({ id, x: n.x, z: n.z - raise });
    g.members.push({ id: g.members.length, role: 'stub', a: id, b: sup, len: raise, angle: 90 });
    g.bearings.push(id);
  }
  g.raise = raise;
  return g;
}

/** Name the members left to right: TC top chord pieces, BC bottom, W webs, P posts, ST stubs, TL tails. */
export function mark(g) {
  const pre = { top: 'TC', bottom: 'BC', web: 'W', post: 'P', tail: 'TL', stub: 'ST' }, c = {};
  const order = [...g.members].sort((m, n) => (g.nodes[m.a].x + g.nodes[m.b].x) - (g.nodes[n.a].x + g.nodes[n.b].x) || m.id - n.id);
  for (const m of order) { c[m.role] = (c[m.role] || 0) + 1; m.mark = pre[m.role] + c[m.role]; }
  return g;
}

/** The depth the chords need at the outer face (the top chord's plumb cut over half the bottom chord) and the raise a taller stated heel gives. */
export function heelInfo(g, { dTop, dBottom, heel }) {
  const cos = Math.cos(g.pitch * D2R), needed = dBottom / 2 + dTop / (2 * cos);
  const h = Number(heel) || 0;
  return { needed: Math.round(needed), stated: h, raise: Math.round(Math.max(0, h - needed)), short: h > 0 && h < needed - 0.5 };
}

export const joints = (g) => g.nodes.map((n) => ({ ...n, members: g.members.filter((m) => m.a === n.id || m.b === n.id).map((m) => m.id) }));
