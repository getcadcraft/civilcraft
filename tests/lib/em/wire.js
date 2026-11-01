/* SPDX-License-Identifier: Apache-2.0 */
/**
 * cc-em wire-antenna method of moments (0.8 XE.10). The electric-field integral equation for thin wires (the equation NEC-2 solves, from the
 * published theory: Burke & Poggio, "Numerical Electromagnetics Code", 1981), solved here by Galerkin's method with rooftop (triangle) current
 * basis functions along wire segments, the reduced thin-wire kernel (current on the axis, field on the surface), Kirchhoff junctions, a delta-gap
 * source, lumped loads and a perfect ground by images. NEC-2 itself uses a sinusoidal-interpolation basis with point matching, so results agree
 * with it in the physics but are not number-for-number identical.
 */
import { solveComplex } from './linalg.js';
export const C0 = 299792458, MU0 = 4e-7 * Math.PI, EPS0 = 1 / (MU0 * C0 * C0), ETA0 = MU0 * C0;
const P = (id, message, extra = {}) => ({ id: 'em:wire.' + id, severity: extra.severity || 'error', message, source: { kind: 'engine', engine: 'em' }, ...extra });

// Gauss–Legendre nodes/weights on [0,1]
const GL = (n) => { const t = { 2: [[0.5 - 0.288675134594813, 0.5], [0.5 + 0.288675134594813, 0.5]], 3: [[0.5 - 0.387298334620742, 5 / 18], [0.5, 4 / 9], [0.5 + 0.387298334620742, 5 / 18]],
  4: [[0.0694318442029737, 0.173927422568727], [0.330009478207572, 0.326072577431273], [0.669990521792428, 0.326072577431273], [0.930568155797026, 0.173927422568727]] }; return t[n]; };
const Q3 = GL(3), Q4 = GL(4);

const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]], add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]], mul = (a, k) => [a[0] * k, a[1] * k, a[2] * k], dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const len = (a) => Math.hypot(a[0], a[1], a[2]);

/** Closest distance between segments p1p2 and q1q2 (3-D). */
function segDist(p1, p2, q1, q2) {
  const d1 = sub(p2, p1), d2 = sub(q2, q1), r = sub(p1, q1), a = dot(d1, d1), e = dot(d2, d2), f = dot(d2, r), cl = (x) => Math.min(1, Math.max(0, x));
  let sN, tN; const c = dot(d1, r), b = dot(d1, d2), den = a * e - b * b;
  sN = den > 1e-30 ? cl((b * f - c * e) / den) : 0; tN = (b * sN + f) / e;
  if (tN < 0) { tN = 0; sN = cl(-c / a); } else if (tN > 1) { tN = 1; sN = cl((b - c) / a); }
  return len(sub(add(p1, mul(d1, sN)), add(q1, mul(d2, tN))));
}

export class Antenna {
  /**
   * wires: [{pts: [[x,y,z], …] polyline in metres, radius (m), segments (per leg) | maxSeg (m)}]; freq Hz; ground 'none' | 'perfect' (plane z = 0, all z ≥ 0).
   * loads: [{at: [x,y,z], z: {re, im}}] series impedance at a node. Nodes are merged when closer than 1e-6 of the largest dimension.
   */
  constructor({ wires, freq, ground = 'none', loads = [] }) {
    this.freq = freq; this.lambda = C0 / freq; this.k = 2 * Math.PI / this.lambda; this.omega = 2 * Math.PI * freq; this.ground = ground; this.loads = loads;
    this.problems = []; this.nodes = []; this.segs = []; this._build(wires);
  }

  _node(p) {
    for (let i = 0; i < this.nodes.length; i++) if (len(sub(this.nodes[i], p)) < this.tol) return i;
    this.nodes.push(p.slice()); return this.nodes.length - 1;
  }

  _build(wires) {
    let big = 0; for (const w of wires) for (const p of w.pts) big = Math.max(big, Math.abs(p[0]), Math.abs(p[1]), Math.abs(p[2])); this.tol = Math.max(big, this.lambda * 1e-3) * 1e-6;
    for (const w of wires) {
      const maxSeg = w.maxSeg || this.lambda / 20;
      if (!(w.radius > 0)) this.problems.push(P('bad-radius', 'A wire has no radius; the thin-wire kernel needs one.'));
      if (w.radius > this.lambda / 50) this.problems.push(P('thick-wire', 'A wire of radius ' + w.radius + ' m is thicker than λ/50; the thin-wire model is poor.', { severity: 'warning' }));
      for (let i = 0; i + 1 < w.pts.length; i++) {
        const a = w.pts[i], b = w.pts[i + 1], L = len(sub(b, a)); if (L === 0) { this.problems.push(P('zero-leg', 'A wire has a zero-length leg.')); continue; }
        const n = w.segments ? Math.max(1, Math.round(w.segments / Math.max(1, w.pts.length - 1))) : Math.max(1, Math.ceil(L / maxSeg)), ids = [this._node(a)];
        for (let s = 1; s < n; s++) ids.push(this._node(add(a, mul(sub(b, a), s / n))));
        ids.push(this._node(b));
        for (let s = 0; s < n; s++) { const pa = this.nodes[ids[s]], pb = this.nodes[ids[s + 1]], d = sub(pb, pa), l = len(d); this.segs.push({ a: ids[s], b: ids[s + 1], len: l, u: mul(d, 1 / l), radius: w.radius, mid: mul(add(pa, pb), 0.5) }); }
        if (w.radius > 0 && L / n < 2 * w.radius) this.problems.push(P('short-segment', 'Segments of ' + (L / n).toExponential(2) + ' m are shorter than twice the radius; the reduced kernel loses accuracy.', { severity: 'warning' }));
      }
    }
    if (this.ground === 'perfect') for (const p of this.nodes) if (p[2] < -this.tol) this.problems.push(P('below-ground', 'A wire point lies below the ground plane (z < 0).'));
    // wires passing through each other without a shared node: closest approach of two non-adjacent segments below the radii
    for (let i = 0; i < this.segs.length; i++) for (let j = i + 1; j < this.segs.length; j++) {
      const s = this.segs[i], t = this.segs[j]; if (s.a === t.a || s.a === t.b || s.b === t.a || s.b === t.b) continue;
      if (len(sub(s.mid, t.mid)) > s.len + t.len) continue;
      if (segDist(this.nodes[s.a], this.nodes[s.b], this.nodes[t.a], this.nodes[t.b]) < s.radius + t.radius) { this.problems.push(P('overlap', 'Wires cross or overlap without a shared junction point near ' + s.mid.map((v) => v.toFixed(4)).join(', ') + '.', { fix: 'Split the wires so they share a point where they should join.' })); break; }
    }
    let ext = 0; for (const p of this.nodes) for (const q of this.nodes) ext = Math.max(ext, len(sub(p, q)));
    if (ext > 0 && ext < this.lambda / 20) this.problems.push(P('electrically-small', 'The antenna is smaller than λ/20; its radiation resistance is a small remainder of large reactive terms and is only good to about ±25 % here.', { severity: 'warning' }));
    // basis functions
    const att = this.nodes.map(() => []);
    this.segs.forEach((s, i) => { att[s.a].push({ seg: i, end: 0 }); att[s.b].push({ seg: i, end: 1 }); });
    this.basis = [];
    att.forEach((list, node) => {
      const onGround = this.ground === 'perfect' && Math.abs(this.nodes[node][2]) <= this.tol;
      if (list.length === 1 && onGround) { this.basis.push({ node, parts: [{ ...list[0], sigma: list[0].end === 0 ? 1 : -1, out: true }] }); return; } // current rises out of the ground into the wire
      if (list.length < 2) return; // free end: zero current
      for (let k = 1; k < list.length; k++) this.basis.push({ node, parts: [{ ...list[0], in: true }, { ...list[k], out: true }] });
    });
    // orientation: current flows into the node on the 'in' segment and out on the 'out' segment
    for (const b of this.basis) for (const p of b.parts) { if (p.sigma !== undefined) continue; p.sigma = p.in ? (p.end === 1 ? 1 : -1) : (p.end === 0 ? 1 : -1); }
    if (!this.basis.length) this.problems.push(P('no-unknowns', 'No segment pair shares a node, so there is no current path to solve for.'));
  }

  // ∫∫ G over segment pair, with end-ramp weights: returns {g, r: [[r00, r01],[r10, r11]]} where r[e][f] = ∫∫ ramp_e(s) ramp_f(s') G
  _pair(i, j, image) {
    const s = this.segs[i], t = this.segs[j], close = len(sub(s.mid, t.mid)) < 2.5 * Math.max(s.len, t.len) && !image;
    const nsub = close ? (i === j ? 8 : 4) : 1, Q = close ? Q3 : Q4, a2 = t.radius * t.radius; let g = 0; const r = [[0, 0], [0, 0]];
    const pa = this.nodes[s.a], tb = this.nodes[t.a];
    for (let m = 0; m < nsub; m++) for (const [xs, ws] of Q) {
      const fs = (m + xs) / nsub, ps = add(pa, mul(s.u, fs * s.len)), wsm = ws * s.len / nsub;
      for (let n2 = 0; n2 < nsub; n2++) for (const [xt, wt] of Q) {
        const ft = (n2 + xt) / nsub; let pt = add(tb, mul(t.u, ft * t.len)); if (image) pt = [pt[0], pt[1], -pt[2]];
        const R = Math.sqrt(dot(sub(ps, pt), sub(ps, pt)) + a2), kr = this.k * R, w = wsm * wt * t.len / nsub, gr = Math.cos(kr) / (4 * Math.PI * R);
        g += w * gr; r[0][0] += w * gr * (1 - fs) * (1 - ft); r[0][1] += w * gr * (1 - fs) * ft; r[1][0] += w * gr * fs * (1 - ft); r[1][1] += w * gr * fs * ft;
      }
    }
    return { g, r, ...this._pairIm(i, j, image, nsub, Q) };
  }
  _pairIm(i, j, image, nsub, Q) { // imaginary parts of the same integrals
    const s = this.segs[i], t = this.segs[j], a2 = t.radius * t.radius; let g = 0; const r = [[0, 0], [0, 0]]; const pa = this.nodes[s.a], tb = this.nodes[t.a];
    for (let m = 0; m < nsub; m++) for (const [xs, ws] of Q) {
      const fs = (m + xs) / nsub, ps = add(pa, mul(s.u, fs * s.len)), wsm = ws * s.len / nsub;
      for (let n2 = 0; n2 < nsub; n2++) for (const [xt, wt] of Q) {
        const ft = (n2 + xt) / nsub; let pt = add(tb, mul(t.u, ft * t.len)); if (image) pt = [pt[0], pt[1], -pt[2]];
        const R = Math.sqrt(dot(sub(ps, pt), sub(ps, pt)) + a2), w = wsm * wt * t.len / nsub, gi = -Math.sin(this.k * R) / (4 * Math.PI * R);
        g += w * gi; r[0][0] += w * gi * (1 - fs) * (1 - ft); r[0][1] += w * gi * (1 - fs) * ft; r[1][0] += w * gi * fs * (1 - ft); r[1][1] += w * gi * fs * ft;
      }
    }
    return { gi: g, ri: r };
  }

  /** Fill the impedance matrix. Called by solve(). */
  _matrix() {
    const nb = this.basis.length, Zr = Array.from({ length: nb }, () => new Float64Array(nb)), Zi = Array.from({ length: nb }, () => new Float64Array(nb)), cache = new Map();
    const wm = this.omega * MU0, wi = 1 / (this.omega * EPS0); // jωμ ; 1/(jωε) = -j/(ωε)
    const get = (i, j, image) => { const key = (image ? 'i' : 'r') + i + ',' + j; let v = cache.get(key); if (!v) { v = this._pair(i, j, image); cache.set(key, v); } return v; };
    for (let m = 0; m < nb; m++) for (let n = 0; n < nb; n++) {
      let zr = 0, zi = 0;
      for (const pm of this.basis[m].parts) for (const pn of this.basis[n].parts) {
        const s = this.segs[pm.seg], t = this.segs[pn.seg], dm = pm.sigma * (pm.end === 1 ? 1 : -1) / s.len, dn = pn.sigma * (pn.end === 1 ? 1 : -1) / t.len;
        for (const image of this.ground === 'perfect' ? [false, true] : [false]) {
          const v = get(pm.seg, pn.seg, image), ud = image ? [-t.u[0], -t.u[1], t.u[2]] : t.u, cs = dot(s.u, ud), dsign = image ? -1 : 1;
          const rr = v.r[pm.end][pn.end], ri = v.ri[pm.end][pn.end];
          // jωμ σσ (u·u') ⟨r r G⟩  → imaginary·(rr + j ri) = −ωμ ri·… : j·(rr + j ri) = −ri + j rr
          zr += -wm * pm.sigma * pn.sigma * cs * ri; zi += wm * pm.sigma * pn.sigma * cs * rr;
          // (1/(jωε)) d d' ⟨G⟩ : −j/(ωε)·(g + j gi) = gi/(ωε)·… = (gi + (−j)(g)) → real = gi·wi, imag = −g·wi
          zr += wi * dm * dn * dsign * v.gi; zi += -wi * dm * dn * dsign * v.g;
        }
      }
      Zr[m][n] = zr; Zi[m][n] = zi;
    }
    for (const L of this.loads) { const nd = this.nodes.findIndex((p) => len(sub(p, L.at)) < this.tol * 10); const bi = this.basis.findIndex((b) => b.node === nd); if (bi >= 0) { Zr[bi][bi] += L.z.re; Zi[bi][bi] += L.z.im; } else this.problems.push(P('load-nowhere', 'A load is not at a junction or ground point of the wires.', { severity: 'warning' })); }
    return { Zr, Zi };
  }

  /** Solve with a 1 V delta-gap source at the node nearest `feed` (a point). Returns {Zin, I (per segment mid, complex), feedCurrent, problems}. */
  solve({ feed, voltage = { re: 1, im: 0 } }) {
    if (this.problems.some((p) => p.severity === 'error')) return { ok: false, problems: this.problems };
    const nd = this.nodes.reduce((best, p, i) => (len(sub(p, feed)) < len(sub(this.nodes[best], feed)) ? i : best), 0);
    const fb = this.basis.findIndex((b) => b.node === nd);
    if (fb < 0) return { ok: false, problems: [...this.problems, P('feed-nowhere', 'The feed point is not at a junction, a wire-to-wire joint or the ground; a delta gap needs a node with current.', { fix: 'Place the feed at an interior point of a wire.' })] };
    const { Zr, Zi } = this._matrix(), nb = this.basis.length, br = new Float64Array(nb), bi = new Float64Array(nb); br[fb] = voltage.re; bi[fb] = voltage.im;
    const sol = solveComplex(Zr, Zi, br, bi); if (!sol) return { ok: false, problems: [...this.problems, P('singular', 'The impedance matrix is singular.')] };
    this.I = { re: sol.re, im: sol.im }; this.feedBasis = fb;
    const d = sol.re[fb] ** 2 + sol.im[fb] ** 2, Zin = { re: (voltage.re * sol.re[fb] + voltage.im * sol.im[fb]) / d, im: (voltage.im * sol.re[fb] - voltage.re * sol.im[fb]) / d };
    this.V = voltage; this.Zin = Zin;
    return { ok: true, Zin, feedCurrent: { re: sol.re[fb], im: sol.im[fb] }, problems: this.problems, currents: this.segmentCurrents() };
  }

  /** Complex current at each segment's midpoint, along the segment's own direction. */
  segmentCurrents() {
    const out = this.segs.map((s) => ({ mid: s.mid, re: 0, im: 0 }));
    this.basis.forEach((b, m) => { for (const p of b.parts) { const o = out[p.seg]; o.re += 0.5 * p.sigma * this.I.re[m]; o.im += 0.5 * p.sigma * this.I.im[m]; } });
    return out;
  }

  /** Radiation vector N(θ,φ) (complex 3-vector, A·m). Includes the image currents for a perfect ground. */
  _N(th, ph) {
    const rh = [Math.sin(th) * Math.cos(ph), Math.sin(th) * Math.sin(ph), Math.cos(th)], Nr = [0, 0, 0], Ni = [0, 0, 0];
    this.basis.forEach((b, m) => { const cr = this.I.re[m], ci = this.I.im[m];
      for (const p of b.parts) { const s = this.segs[p.seg], pa = this.nodes[s.a];
        for (const image of this.ground === 'perfect' ? [false, true] : [false]) {
          const u = image ? [-s.u[0], -s.u[1], s.u[2]] : s.u, base = image ? [pa[0], pa[1], -pa[2]] : pa, dir = image ? [s.u[0], s.u[1], -s.u[2]] : s.u;
          for (const [x, w] of Q4) { const f = p.end === 1 ? x : 1 - x, pos = add(base, mul(dir, x * s.len)), ph_ = this.k * dot(rh, pos), cp = Math.cos(ph_), sp = Math.sin(ph_), amp = w * s.len * f * p.sigma;
            for (let q = 0; q < 3; q++) { const a = amp * u[q]; Nr[q] += a * (cr * cp - ci * sp); Ni[q] += a * (cr * sp + ci * cp); } }
        } } });
    return { Nr, Ni };
  }

  /** Radiation intensity U(θ,φ) in W/sr for the solved current (1 V source), plus the θ and φ components. */
  intensity(th, ph) {
    const { Nr, Ni } = this._N(th, ph), et = [Math.cos(th) * Math.cos(ph), Math.cos(th) * Math.sin(ph), -Math.sin(th)], ep = [-Math.sin(ph), Math.cos(ph), 0];
    const nt = { re: dot(Nr, et), im: dot(Ni, et) }, np = { re: dot(Nr, ep), im: dot(Ni, ep) }, c = ETA0 * this.k * this.k / (32 * Math.PI * Math.PI);
    return { U: c * (nt.re ** 2 + nt.im ** 2 + np.re ** 2 + np.im ** 2), Ut: c * (nt.re ** 2 + nt.im ** 2), Up: c * (np.re ** 2 + np.im ** 2) };
  }

  /** Total radiated power by quadrature on the sphere (upper hemisphere only with a ground). Returns {P, Umax, Dmax, dirMax, Pin, balance}. */
  pattern(nth = 90, nph = 72) {
    const th1 = this.ground === 'perfect' ? Math.PI / 2 : Math.PI, dth = th1 / nth, dph = 2 * Math.PI / nph; let Prad = 0, Umax = -1, dir = [0, 0];
    for (let i = 0; i < nth; i++) { const th = (i + 0.5) * dth; for (let j = 0; j < nph; j++) { const ph = (j + 0.5) * dph, u = this.intensity(th, ph).U; Prad += u * Math.sin(th) * dth * dph; if (u > Umax) { Umax = u; dir = [th, ph]; } } }
    const Pin = 0.5 * (this.V.re * this.I.re[this.feedBasis] + this.V.im * this.I.im[this.feedBasis]); // ½ Re(V I*)
    return { P: Prad, Umax, dirMax: dir, Dmax: 4 * Math.PI * Umax / Prad, Pin, balance: Prad / Pin };
  }
}

/** Convenience: centre-fed straight dipole along z. Returns an Antenna and the feed point. */
export function dipole({ length, radius, freq, segments = 41, ground = 'none' }) {
  const half = length / 2; return { feed: [0, 0, 0], ant: new Antenna({ wires: [{ pts: [[0, 0, -half], [0, 0, 0], [0, 0, half]], radius, segments }], freq, ground }) };
}
/** Convenience: vertical monopole of the given height over a perfect ground, fed at the base. */
export function monopole({ height, radius, freq, segments = 21 }) {
  return { feed: [0, 0, 0], ant: new Antenna({ wires: [{ pts: [[0, 0, 0], [0, 0, height]], radius, segments }], freq, ground: 'perfect' }) };
}
