/* SPDX-License-Identifier: Apache-2.0 */
/**
 * cc-em circuit solver (0.8 XE.10): SPICE-class modified nodal analysis. Own code from the published method (Ho/Ruehli/Brennan 1975 MNA;
 * Newton–Raphson with junction-voltage limiting; trapezoidal / backward-Euler companion models). R C L V I E G D Q(NPN/PNP transport) M(level 1) S.
 * Analyses: op (direct, gmin stepping, source stepping), dc sweep, ac (small signal at the op point), tran. Failures are Problems-shape objects.
 */
import { solveReal, solveComplex } from './linalg.js';

const VT = 0.025852; // kT/q at 300.15 K
export const problem = (id, message, extra = {}) => ({ id: 'em:' + id, message, source: { kind: 'engine', engine: 'em' }, ...extra, severity: extra.severity || 'error' });
const isGnd = (n) => n === '0' || /^gnd$/i.test(n);

/** Engineering-suffix number: "4.7k", "100n", "1meg", "2u". Returns NaN when it is not a number. */
export function parseValue(s) {
  const m = /^\s*([+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?)\s*(t|g|meg|k|mil|m|u|µ|n|p|f)?[a-z]*\s*$/i.exec(String(s));
  if (!m) return NaN;
  const sc = { t: 1e12, g: 1e9, meg: 1e6, k: 1e3, mil: 25.4e-6, m: 1e-3, u: 1e-6, 'µ': 1e-6, n: 1e-9, p: 1e-12, f: 1e-15 };
  return parseFloat(m[1]) * (m[2] ? sc[m[2].toLowerCase()] : 1);
}

/** Value of a source's waveform at time t (t = null: the DC value used for the operating point). */
export function waveAt(w, t) {
  if (!w) return 0;
  if (t === null || t === undefined) return w.sin ? w.sin.off : w.pulse ? w.pulse.v1 : (w.dc || 0);
  if (w.sin) { const s = w.sin; if (t < (s.delay || 0)) return s.off; return s.off + s.amp * Math.exp(-(s.damp || 0) * (t - (s.delay || 0))) * Math.sin(2 * Math.PI * s.freq * (t - (s.delay || 0)) + (s.phase || 0) * Math.PI / 180); }
  if (w.pulse) {
    const p = w.pulse, td = p.td || 0; if (t < td) return p.v1;
    const per = p.per || Infinity, tt = (t - td) % per, tr = p.tr || 1e-12, tf = p.tf || 1e-12, pw = p.pw ?? per;
    if (tt < tr) return p.v1 + (p.v2 - p.v1) * tt / tr;
    if (tt < tr + pw) return p.v2;
    if (tt < tr + pw + tf) return p.v2 + (p.v1 - p.v2) * (tt - tr - pw) / tf;
    return p.v1;
  }
  return w.dc || 0;
}

const KINDS = { R: 2, C: 2, L: 2, V: 2, I: 2, E: 4, G: 4, D: 2, Q: 3, M: 3, S: 4 };

export class Circuit {
  constructor(title = '') { this.title = title; this.elements = []; this.models = {}; this.names = new Set(); this.opts = { gmin: 1e-12, reltol: 1e-3, vntol: 1e-6, abstol: 1e-12, maxIter: 100, temp: 300.15 }; }
  add(name, kind, nodes, p = {}) {
    if (!KINDS[kind]) throw new Error('unknown element kind ' + kind);
    if (this.names.has(name)) throw new Error('duplicate element name ' + name);
    if (nodes.length !== KINDS[kind]) throw new Error(name + ': ' + kind + ' needs ' + KINDS[kind] + ' nodes');
    this.names.add(name); this.elements.push({ name, kind, nodes: nodes.map(String), p }); return this;
  }
  R(n, a, b, v) { return this.add(n, 'R', [a, b], { value: v }); }
  C(n, a, b, v, ic) { return this.add(n, 'C', [a, b], { value: v, ic }); }
  L(n, a, b, v, ic) { return this.add(n, 'L', [a, b], { value: v, ic }); }
  V(n, a, b, w = {}) { return this.add(n, 'V', [a, b], { wave: typeof w === 'number' ? { dc: w } : w }); }
  I(n, a, b, w = {}) { return this.add(n, 'I', [a, b], { wave: typeof w === 'number' ? { dc: w } : w }); }
  E(n, a, b, cp, cn, gain) { return this.add(n, 'E', [a, b, cp, cn], { gain }); }
  G(n, a, b, cp, cn, gm) { return this.add(n, 'G', [a, b, cp, cn], { gm }); }
  D(n, a, k, model = {}) { return this.add(n, 'D', [a, k], { model }); }
  Q(n, c, b, e, model = {}) { return this.add(n, 'Q', [c, b, e], { model }); }
  M(n, d, g, s, model = {}) { return this.add(n, 'M', [d, g, s], { model }); }
  S(n, a, b, cp, cn, p = {}) { return this.add(n, 'S', [a, b, cp, cn], p); }

  /** Static checks: returns Problems for what would make the matrix singular or the answer meaningless. */
  check() {
    const out = [], nodes = new Set();
    for (const e of this.elements) for (const n of e.nodes) nodes.add(n);
    if (![...nodes].some(isGnd)) out.push(problem('circuit.no-ground', 'No node is ground ("0"); the circuit has no reference.', { fix: 'Name one node 0.' }));
    for (const e of this.elements) {
      if ((e.kind === 'R' || e.kind === 'C' || e.kind === 'L') && !(e.p.value > 0)) out.push(problem('circuit.bad-value', e.name + ' has value ' + e.p.value + '; it must be above zero.', { element: e.name }));
      if ((e.kind === 'V' || e.kind === 'E') && e.nodes[0] === e.nodes[1]) out.push(problem('circuit.shorted-source', e.name + ' has both ends on node ' + e.nodes[0] + '.', { element: e.name }));
    }
    // DC path to ground (capacitors and current sources are open at DC; controlled-source sense pins carry no current)
    const adj = new Map(), link = (a, b) => { if (!adj.has(a)) adj.set(a, []); if (!adj.has(b)) adj.set(b, []); adj.get(a).push(b); adj.get(b).push(a); };
    for (const n of nodes) adj.set(n, adj.get(n) || []);
    for (const e of this.elements) { if (e.kind === 'C' || e.kind === 'I' || e.kind === 'G' || e.kind === 'S') { if (e.kind === 'G' || e.kind === 'S') link(e.nodes[0], e.nodes[1]); continue; } if (e.kind === 'Q') { link(e.nodes[0], e.nodes[2]); link(e.nodes[1], e.nodes[2]); } else if (e.kind === 'M') link(e.nodes[0], e.nodes[2]); else link(e.nodes[0], e.nodes[1]); }
    const gnd = [...nodes].find(isGnd), seen = new Set(), stack = gnd ? [gnd] : [];
    // all ground aliases are one node
    for (const n of nodes) if (isGnd(n)) { seen.add(n); stack.push(n); }
    while (stack.length) { const n = stack.pop(); for (const m of adj.get(n) || []) if (!seen.has(m)) { seen.add(m); stack.push(m); } }
    for (const n of nodes) if (!seen.has(n)) out.push(problem('circuit.floating-node', 'Node ' + n + ' has no DC path to ground; its voltage is undefined.', { node: n, fix: 'Add a resistor to ground, or a bias path.' }));
    // loops of ideal voltage sources / inductors
    const par = new Map(), find = (x) => { while ((par.get(x) ?? x) !== x) x = par.get(x); return x; };
    for (const e of this.elements) if (e.kind === 'V' || e.kind === 'L' || e.kind === 'E') {
      const a = find(isGnd(e.nodes[0]) ? '0' : e.nodes[0]), b = find(isGnd(e.nodes[1]) ? '0' : e.nodes[1]);
      if (a === b) out.push(problem('circuit.source-loop', e.name + ' closes a loop of voltage sources and inductors; the currents in it are undefined.', { element: e.name, fix: 'Put a small resistor in the loop.' }));
      else par.set(a, b);
    }
    return out;
  }

  _index() {
    const map = new Map(); let n = 0;
    for (const e of this.elements) for (const nd of e.nodes) if (!isGnd(nd) && !map.has(nd)) map.set(nd, ++n);
    const nodeCount = n, br = new Map();
    for (const e of this.elements) if (e.kind === 'V' || e.kind === 'L' || e.kind === 'E') br.set(e.name, nodeCount + br.size);
    return { map, nodeCount, br, size: nodeCount + br.size };
  }
  _model(e) { const m = e.p.model; return typeof m === 'string' ? (this.models[m] || {}) : (m || {}); }

  /** Evaluate a nonlinear element at node voltages v (function node name → V). Returns {controls:[{p,m,v0}], rows:[{node,i0,d:[]}]} (p/m node names). */
  _nl(e, vf, st) {
    const md = this._model(e), t = e.nodes;
    if (e.kind === 'D') {
      const Is = md.Is ?? 1e-14, nn = md.n ?? 1, vt = nn * VT, vcrit = vt * Math.log(vt / (Math.SQRT2 * Is));
      const vraw = vf(t[0]) - vf(t[1]); let vd = vraw; if (st.vj !== undefined) vd = pnjlim(vraw, st.vj, vt, vcrit); st.vj = vd; st.lim = Math.abs(vd - vraw) > 1e-9;
      const ex = Math.exp(Math.min(vd / vt, 80)), id = Is * (ex - 1), gd = Is * ex / vt;
      return { controls: [{ p: t[0], m: t[1], v0: vd }], rows: [{ node: t[0], i0: id, d: [gd] }, { node: t[1], i0: -id, d: [-gd] }] };
    }
    if (e.kind === 'Q') {
      const s = md.type === 'pnp' ? -1 : 1, Is = md.Is ?? 1e-16, bf = md.bf ?? 100, br = md.br ?? 1, vt = VT, vcrit = vt * Math.log(vt / (Math.SQRT2 * Is));
      const [c, b, em] = t, be0 = s * (vf(b) - vf(em)), bc0 = s * (vf(b) - vf(c));
      let be = be0, bc = bc0; if (st.vbe !== undefined) { be = pnjlim(be0, st.vbe, vt, vcrit); bc = pnjlim(bc0, st.vbc, vt, vcrit); }
      st.vbe = be; st.vbc = bc; st.lim = Math.abs(be - be0) > 1e-9 || Math.abs(bc - bc0) > 1e-9;
      const ef = Math.exp(Math.min(be / vt, 80)), er = Math.exp(Math.min(bc / vt, 80)), If = Is * (ef - 1), Ir = Is * (er - 1), gf = Is * ef / vt, gr = Is * er / vt;
      const ic = If - Ir - Ir / br, ib = If / bf + Ir / br;
      const dic = [gf, -gr - gr / br], dib = [gf / bf, gr / br]; // wrt (vbe, vbc) in transformed sense
      // actual currents = s * transformed; actual controls v = s * transformed ⇒ derivative wrt actual (vb-ve),(vb-vc) is unchanged
      return { controls: [{ p: b, m: em, v0: s * be }, { p: b, m: c, v0: s * bc }], rows: [
        { node: c, i0: s * ic, d: dic }, { node: b, i0: s * ib, d: dib }, { node: em, i0: -s * (ic + ib), d: [-(dic[0] + dib[0]), -(dic[1] + dib[1])] }] };
    }
    if (e.kind === 'M') {
      const s = md.type === 'pmos' ? -1 : 1, kp = (md.kp ?? 2e-5) * ((md.w ?? 1) / (md.l ?? 1)), vto = md.vto ?? (s > 0 ? 1 : -1), lam = md.lambda ?? 0;
      let [d, g, sr] = t; const vds0 = s * (vf(d) - vf(sr)); if (vds0 < 0) [d, sr] = [sr, d];
      const vgs = s * (vf(g) - vf(sr)), vds = s * (vf(d) - vf(sr)), vov = vgs - s * vto;
      let id = 0, gm = 0, gds = 0;
      if (vov > 0) {
        if (vds < vov) { id = kp * (vov * vds - vds * vds / 2) * (1 + lam * vds); gm = kp * vds * (1 + lam * vds); gds = kp * (vov - vds) * (1 + lam * vds) + kp * (vov * vds - vds * vds / 2) * lam; }
        else { id = 0.5 * kp * vov * vov * (1 + lam * vds); gm = kp * vov * (1 + lam * vds); gds = 0.5 * kp * vov * vov * lam; }
      }
      return { controls: [{ p: g, m: sr, v0: s * vgs }, { p: d, m: sr, v0: s * vds }], rows: [{ node: d, i0: s * id, d: [gm, gds] }, { node: sr, i0: -s * id, d: [-gm, -gds] }] };
    }
    return null;
  }

  _swG(e, vf) { const vt = e.p.vt ?? 0.5, vh = e.p.vh ?? 0.05, ron = e.p.ron ?? 1, roff = e.p.roff ?? 1e9, v = vf(e.nodes[2]) - vf(e.nodes[3]); const a = 1 / (1 + Math.exp(-(v - vt) / Math.max(vh, 1e-6))); return Math.exp(Math.log(1 / roff) + a * (Math.log(1 / ron) - Math.log(1 / roff))); }

  /** Assemble A x = b for 'dc' | 'tran' (real) around the guess x. ctx: {t, h, trap, src (scale), gmin, state}. */
  _assemble(ix, x, ctx) {
    const n = ix.size, A = Array.from({ length: n }, () => new Float64Array(n)), b = new Float64Array(n), { map } = ix;
    const ni = (nd) => (isGnd(nd) ? -1 : map.get(nd) - 1);
    const vf = (nd) => { const i = ni(nd); return i < 0 ? 0 : x[i]; };
    const g2 = (a, c, g) => { if (a >= 0) A[a][a] += g; if (c >= 0) A[c][c] += g; if (a >= 0 && c >= 0) { A[a][c] -= g; A[c][a] -= g; } };
    const rhs = (a, v) => { if (a >= 0) b[a] += v; };
    for (let i = 0; i < ix.nodeCount; i++) A[i][i] += ctx.gmin;
    for (const e of this.elements) {
      const a = ni(e.nodes[0]), c = ni(e.nodes[1]), st = ctx.state.get(e.name);
      switch (e.kind) {
        case 'R': g2(a, c, 1 / e.p.value); break;
        case 'S': g2(a, c, this._swG(e, vf)); break;
        case 'C':
          if (ctx.h) { const geq = (ctx.trap ? 2 : 1) * e.p.value / ctx.h, ieq = geq * st.v + (ctx.trap ? st.i : 0); g2(a, c, geq); rhs(a, ieq); rhs(c, -ieq); }
          break;
        case 'V': case 'E': case 'L': {
          const k = ix.br.get(e.name); if (a >= 0) { A[a][k] += 1; A[k][a] += 1; } if (c >= 0) { A[c][k] -= 1; A[k][c] -= 1; }
          if (e.kind === 'V') b[k] += waveAt(e.p.wave, ctx.t) * ctx.src;
          else if (e.kind === 'E') { const cp = ni(e.nodes[2]), cn = ni(e.nodes[3]); if (cp >= 0) A[k][cp] -= e.p.gain; if (cn >= 0) A[k][cn] += e.p.gain; }
          else if (ctx.h) { const r = (ctx.trap ? 2 : 1) * e.p.value / ctx.h; A[k][k] -= r; b[k] -= r * st.i + (ctx.trap ? st.v : 0); }
          break;
        }
        case 'I': { const v = waveAt(e.p.wave, ctx.t) * ctx.src; rhs(a, -v); rhs(c, v); break; }
        case 'G': { const cp = ni(e.nodes[2]), cn = ni(e.nodes[3]), g = e.p.gm; for (const [r, sg] of [[a, 1], [c, -1]]) if (r >= 0) { if (cp >= 0) A[r][cp] += sg * g; if (cn >= 0) A[r][cn] -= sg * g; } break; }
        default: {
          const nl = this._nl(e, vf, st); if (!nl) break;
          for (const r of nl.rows) { const row = ni(r.node); if (row < 0) continue; let sum = 0;
            r.d.forEach((d, k) => { const p = ni(nl.controls[k].p), m = ni(nl.controls[k].m); if (p >= 0) A[row][p] += d; if (m >= 0) A[row][m] -= d; sum += d * nl.controls[k].v0; });
            b[row] -= r.i0 - sum; }
        }
      }
    }
    return { A, b };
  }

  _newton(ix, x0, ctx) {
    let x = Float64Array.from(x0); const o = this.opts;
    for (let it = 1; it <= o.maxIter; it++) {
      for (const st of ctx.state.values()) st.lim = false;
      const { A, b } = this._assemble(ix, x, ctx), xn = solveReal(A, b);
      if (!xn) return { ok: false, singular: true, x, iterations: it };
      let conv = true; for (let i = 0; i < xn.length; i++) { if (!Number.isFinite(xn[i])) return { ok: false, x, iterations: it, nan: true }; const tol = o.reltol * Math.max(Math.abs(xn[i]), Math.abs(x[i])) + (i < ix.nodeCount ? o.vntol : o.abstol); if (Math.abs(xn[i] - x[i]) > tol) { conv = false; break; } }
      const limited = [...ctx.state.values()].some((s) => s.lim);
      x = xn; if (conv && !limited && it > 1) return { ok: true, x, iterations: it };
    }
    return { ok: false, x, iterations: o.maxIter };
  }

  _freshState() { const s = new Map(); for (const e of this.elements) s.set(e.name, { v: 0, i: 0 }); return s; }

  _pack(ix, x) {
    const v = { 0: 0 }; for (const [n, i] of ix.map) v[n] = x[i - 1];
    const i = {}; for (const [n, k] of ix.br) i[n] = x[k];
    return { v, i };
  }

  /** DC operating point. Tries direct Newton, then gmin stepping, then source stepping. */
  op(opts = {}) {
    const pre = this.check().filter((p) => p.severity === 'error' && p.id !== 'em:circuit.floating-node');
    if (pre.length) return { ok: false, problems: pre };
    const ix = this._index(), state = this._freshState(), n = ix.size, o = this.opts;
    const base = { t: null, h: 0, trap: false, src: 1, gmin: o.gmin, state };
    let r = this._newton(ix, new Float64Array(n), base), how = 'direct';
    if (!r.ok) { // gmin stepping
      let x = new Float64Array(n), okAll = true; for (const g of [1e-2, 1e-4, 1e-6, 1e-8, 1e-10, o.gmin]) { const rr = this._newton(ix, x, { ...base, gmin: g, state: this._freshState() }); if (!rr.ok) { okAll = false; break; } x = rr.x; }
      if (okAll) { r = this._newton(ix, x, { ...base, state }); how = 'gmin stepping'; }
    }
    if (!r.ok) { // source stepping
      let x = new Float64Array(n), okAll = true; for (let k = 1; k <= 20; k++) { const rr = this._newton(ix, x, { ...base, src: k / 20, state: this._freshState() }); if (!rr.ok) { okAll = false; break; } x = rr.x; }
      if (okAll) { r = this._newton(ix, x, { ...base, state }); how = 'source stepping'; }
    }
    if (!r.ok) {
      const problems = this.check();
      problems.push(problem(r.singular ? 'circuit.singular' : 'circuit.no-convergence', r.singular ? 'The circuit equations are singular (a node or loop is not determined).' : 'The operating point did not converge after direct, gmin and source stepping.', { fix: r.singular ? 'See the floating-node and loop problems.' : 'Check diode and transistor polarity, add series resistance, or give a start state.' }));
      return { ok: false, problems };
    }
    this._x0 = r.x; this._ix = ix;
    return { ok: true, ...this._pack(ix, r.x), iterations: r.iterations, method: how, problems: this.check().filter((p) => p.severity !== 'error') };
  }

  /** DC sweep of a V or I source: values array. Returns {sweep, v: {node:[…]}, i:{name:[…]}}. Continuation from the previous point. */
  dc(srcName, values) {
    const e = this.elements.find((x) => x.name === srcName && (x.kind === 'V' || x.kind === 'I'));
    if (!e) return { ok: false, problems: [problem('circuit.no-source', 'No source named ' + srcName + '.')] };
    const keep = e.p.wave, ix = this._index(), state = this._freshState(), res = { ok: true, sweep: [...values], v: {}, i: {}, problems: [] };
    let x = new Float64Array(ix.size);
    for (const val of values) {
      e.p.wave = { dc: val }; let r = this._newton(ix, x, { t: null, h: 0, trap: false, src: 1, gmin: this.opts.gmin, state });
      if (!r.ok) r = this._newton(ix, new Float64Array(ix.size), { t: null, h: 0, trap: false, src: 1, gmin: 1e-9, state: this._freshState() });
      if (!r.ok) { res.ok = false; res.problems.push(problem('circuit.no-convergence', 'The sweep stopped at ' + srcName + ' = ' + val + ': no convergence.')); break; }
      x = r.x; const p = this._pack(ix, x); for (const k in p.v) (res.v[k] ||= []).push(p.v[k]); for (const k in p.i) (res.i[k] ||= []).push(p.i[k]);
    }
    e.p.wave = keep; return res;
  }

  /** AC small-signal at the operating point. freqs in Hz. Sources use wave.ac = {mag, phase°}. Returns {f, v: {node: {re, im}[]}, i}. */
  ac(freqs) {
    const o = this.op(); if (!o.ok) return o;
    const ix = this._index(), x = this._x0, n = ix.size, { map } = ix, state = this._freshState();
    const ni = (nd) => (isGnd(nd) ? -1 : map.get(nd) - 1), vf = (nd) => { const i = ni(nd); return i < 0 ? 0 : x[i]; };
    for (const e of this.elements) if ('DQM'.includes(e.kind)) { const s = state.get(e.name); this._nl(e, vf, s); } // sets limiting reference to the op point
    const res = { ok: true, f: [...freqs], v: {}, i: {}, problems: [] };
    for (const f of freqs) {
      const w = 2 * Math.PI * f, Ar = Array.from({ length: n }, () => new Float64Array(n)), Ai = Array.from({ length: n }, () => new Float64Array(n)), br = new Float64Array(n), bi = new Float64Array(n);
      const add = (M, r, c, v) => { if (r >= 0 && c >= 0) M[r][c] += v; };
      const g2 = (M, a, c, g) => { add(M, a, a, g); add(M, c, c, g); add(M, a, c, -g); add(M, c, a, -g); };
      for (let i = 0; i < ix.nodeCount; i++) Ar[i][i] += this.opts.gmin;
      for (const e of this.elements) {
        const a = ni(e.nodes[0]), c = ni(e.nodes[1]);
        switch (e.kind) {
          case 'R': g2(Ar, a, c, 1 / e.p.value); break;
          case 'S': g2(Ar, a, c, this._swG(e, vf)); break;
          case 'C': g2(Ai, a, c, w * e.p.value); break;
          case 'V': case 'E': case 'L': {
            const k = ix.br.get(e.name); add(Ar, a, k, 1); add(Ar, k, a, 1); add(Ar, c, k, -1); add(Ar, k, c, -1);
            if (e.kind === 'V') { const ac = e.p.wave?.ac; if (ac) { const ph = (ac.phase || 0) * Math.PI / 180; br[k] += ac.mag * Math.cos(ph); bi[k] += ac.mag * Math.sin(ph); } }
            else if (e.kind === 'E') { add(Ar, k, ni(e.nodes[2]), -e.p.gain); add(Ar, k, ni(e.nodes[3]), e.p.gain); }
            else Ai[k][k] -= w * e.p.value;
            break;
          }
          case 'I': { const ac = e.p.wave?.ac; if (ac) { const ph = (ac.phase || 0) * Math.PI / 180, vr = ac.mag * Math.cos(ph), vi = ac.mag * Math.sin(ph); if (a >= 0) { br[a] -= vr; bi[a] -= vi; } if (c >= 0) { br[c] += vr; bi[c] += vi; } } break; }
          case 'G': { const cp = ni(e.nodes[2]), cn = ni(e.nodes[3]), g = e.p.gm; for (const [r, sg] of [[a, 1], [c, -1]]) { add(Ar, r, cp, sg * g); add(Ar, r, cn, -sg * g); } break; }
          default: { const nl = this._nl(e, vf, state.get(e.name)); if (!nl) break; for (const r of nl.rows) { const row = ni(r.node); r.d.forEach((d, k) => { add(Ar, row, ni(nl.controls[k].p), d); add(Ar, row, ni(nl.controls[k].m), -d); }); } }
        }
      }
      const sol = solveComplex(Ar, Ai, br, bi);
      if (!sol) { res.ok = false; res.problems.push(problem('circuit.singular', 'The AC matrix is singular at ' + f + ' Hz.')); break; }
      for (const [nd, i] of map) (res.v[nd] ||= []).push({ re: sol.re[i - 1], im: sol.im[i - 1] });
      for (const [nm, k] of ix.br) (res.i[nm] ||= []).push({ re: sol.re[k], im: sol.im[k] });
    }
    return res;
  }

  /** Transient. {tstop, tstep, uic:false, method:'trap'|'be'}. Returns {t:[…], v:{node:[…]}, i:{…}}. */
  tran({ tstop, tstep, uic = false, method = 'trap' }) {
    const ix = this._index(), state = this._freshState(), n = ix.size, o = this.opts, res = { ok: true, t: [], v: {}, i: {}, problems: [] };
    let x = new Float64Array(n);
    if (!uic) { const r = this.op(); if (!r.ok) return r; x = Float64Array.from(this._x0); }
    const pull = () => { for (const e of this.elements) { const st = state.get(e.name), a = e.nodes[0], c = e.nodes[1], vf = (nd) => (isGnd(nd) ? 0 : x[ix.map.get(nd) - 1]);
      if (e.kind === 'C') { st.v = uic && e.p.ic !== undefined && res.t.length === 0 ? e.p.ic : vf(a) - vf(c); st.i = 0; }
      if (e.kind === 'L') { const k = ix.br.get(e.name); st.i = uic && e.p.ic !== undefined && res.t.length === 0 ? e.p.ic : x[k]; st.v = 0; } } };
    pull();
    const record = (t) => { res.t.push(t); const p = this._pack(ix, x); for (const k in p.v) (res.v[k] ||= []).push(p.v[k]); for (const k in p.i) (res.i[k] ||= []).push(p.i[k]); };
    record(0);
    // dynamic-element history: after a solved step, update v,i per the companion formulas
    const commit = (h, trap) => { for (const e of this.elements) { const st = state.get(e.name), vf = (nd) => (isGnd(nd) ? 0 : x[ix.map.get(nd) - 1]);
      if (e.kind === 'C') { const vn = vf(e.nodes[0]) - vf(e.nodes[1]); const geq = (trap ? 2 : 1) * e.p.value / h; st.i = geq * (vn - st.v) - (trap ? st.i : 0); st.v = vn; }
      if (e.kind === 'L') { const k = ix.br.get(e.name), vn = vf(e.nodes[0]) - vf(e.nodes[1]); st.v = vn; st.i = x[k]; } } };
    let t = 0, first = true, k = 0;
    while (k * tstep < tstop - tstep * 1e-9) {
      k++; const target = Math.min(k * tstep, tstop);
      let guard = 0;
      while (target - t > tstep * 1e-9) {
        let h = target - t, ok = false;
        for (let tries = 0; tries < 12 && !ok; tries++) {
          const trap = method === 'trap' && !first, snapshot = new Map([...state].map(([kk, v]) => [kk, { ...v }]));
          const r = this._newton(ix, x, { t: t + h, h, trap, src: 1, gmin: o.gmin, state });
          if (r.ok) { x = r.x; commit(h, trap); t += h; ok = true; first = false; }
          else { for (const [kk, v] of snapshot) state.set(kk, v); h /= 2; }
        }
        if (!ok || ++guard > 4096) { res.ok = false; res.problems.push(problem('circuit.no-convergence', 'The transient stopped at t = ' + t + ' s: no convergence even with the step cut a thousandfold.', { fix: 'Smaller step, or soften the fastest edge.' })); return res; }
      }
      t = target; record(t);
    }
    return res;
  }
}

function pnjlim(vnew, vold, vt, vcrit) {
  if (vnew > vcrit && Math.abs(vnew - vold) > 2 * vt) {
    if (vold > 0) { const arg = 1 + (vnew - vold) / vt; return arg > 0 ? vold + vt * Math.log(arg) : vcrit; }
    return vt * Math.log(vnew / vt);
  }
  return vnew;
}

// ---- text deck (SPICE-like cards; a file format) ------------------------------------------------------------------------
function waveFrom(tokens) {
  const w = {}; const s = tokens.join(' ');
  let m;
  if ((m = /\bdc\s+([^\s(]+)/i.exec(s))) w.dc = parseValue(m[1]); else if (/^[^a-z(]/i.test(tokens[0] || '') && !/\(/.test(tokens[0] || '')) w.dc = parseValue(tokens[0]);
  if ((m = /\bac\s+([^\s(]+)(?:\s+([^\s(]+))?/i.exec(s))) w.ac = { mag: parseValue(m[1]), phase: m[2] && !isNaN(parseValue(m[2])) ? parseValue(m[2]) : 0 };
  if ((m = /sin\s*\(([^)]*)\)/i.exec(s))) { const a = m[1].trim().split(/[\s,]+/).map(parseValue); w.sin = { off: a[0] || 0, amp: a[1] || 0, freq: a[2] || 0, delay: a[3] || 0, damp: a[4] || 0, phase: a[5] || 0 }; }
  if ((m = /pulse\s*\(([^)]*)\)/i.exec(s))) { const a = m[1].trim().split(/[\s,]+/).map(parseValue); w.pulse = { v1: a[0] || 0, v2: a[1] || 0, td: a[2] || 0, tr: a[3] || 0, tf: a[4] || 0, pw: a[5], per: a[6] }; }
  return w;
}

/** Parse a SPICE-style deck. Returns {circuit, analyses:[{type, …}], problems}. Unknown cards are named as problems, never guessed. */
export function parseDeck(text) {
  const problems = [], lines = []; const raw = String(text).split(/\r?\n/);
  const hasTitle = !!raw.length && raw[0].trim()[0] !== '.'; // SPICE convention: the first line is the title, never a card
  raw.forEach((l, i) => { if (i === 0 && hasTitle) return; const t = l.replace(/;.*$/, '').trim(); if (!t || t[0] === '*') return; if (t[0] === '+' && lines.length) lines[lines.length - 1].text += ' ' + t.slice(1); else lines.push({ text: t, line: i + 1 }); });
  const c = new Circuit(hasTitle ? raw[0].trim() : ''); const analyses = [];
  const bad = (ln, msg) => problems.push(problem('deck.' + 'card', 'Line ' + ln + ': ' + msg, { line: ln }));
  for (const { text: t, line } of lines) {
    const tk = t.replace(/\(/g, ' ( ').replace(/\)/g, ' ) ').trim().split(/\s+/), head = tk[0], K = head[0].toUpperCase();
    try {
      if (head[0] === '.') {
        const d = head.toLowerCase();
        if (d === '.end') break;
        else if (d === '.model') { const kind = (tk[2] || '').toLowerCase(), p = {}; const body = tk.slice(3).join(' ').replace(/[()]/g, ' ').trim().split(/\s+/); for (const kv of body) { const [k, v] = kv.split('='); if (v !== undefined) p[k.toLowerCase()] = parseValue(v); }
          const m = { type: /pnp/.test(kind) ? 'pnp' : /pmos/.test(kind) ? 'pmos' : /nmos/.test(kind) ? 'nmos' : 'npn' }; const map = { is: 'Is', n: 'n', bf: 'bf', br: 'br', kp: 'kp', vto: 'vto', lambda: 'lambda', w: 'w', l: 'l' }; for (const k in p) if (map[k]) m[map[k]] = p[k]; c.models[tk[1]] = m; }
        else if (d === '.op') analyses.push({ type: 'op' });
        else if (d === '.dc') { const a = { type: 'dc', source: tk[1], start: parseValue(tk[2]), stop: parseValue(tk[3]), step: parseValue(tk[4]) }; analyses.push(a); }
        else if (d === '.ac') analyses.push({ type: 'ac', mode: tk[1].toLowerCase(), points: parseValue(tk[2]), fstart: parseValue(tk[3]), fstop: parseValue(tk[4]) });
        else if (d === '.tran') analyses.push({ type: 'tran', tstep: parseValue(tk[1]), tstop: parseValue(tk[2]), uic: tk.slice(3).some((x) => /uic/i.test(x)) });
        else bad(line, 'the card ' + head + ' is not supported (named, not guessed)');
        continue;
      }
      const nodes = (k) => tk.slice(1, 1 + k), need = (k, extra = 0) => { if (tk.length < 1 + k + extra) throw new Error(head + ' needs ' + (k + extra) + ' fields'); };
      if (K === 'R' || K === 'C' || K === 'L') { need(3); const v = parseValue(tk[3]); if (isNaN(v)) throw new Error('bad value ' + tk[3]); c.add(head, K, nodes(2), { value: v, ic: (/ic=([^\s]+)/i.exec(t) || [])[1] ? parseValue(/ic=([^\s]+)/i.exec(t)[1]) : undefined }); }
      else if (K === 'V' || K === 'I') { need(2); c.add(head, K, nodes(2), { wave: waveFrom(tk.slice(3).filter((x) => x !== '(' && x !== ')').length && /sin|pulse/i.test(t) ? tk.slice(3).join(' ').replace(/\s*\(\s*/g, '(').replace(/\s*\)/g, ')').split(/\s+(?![^(]*\))/) : tk.slice(3)) }); }
      else if (K === 'E' || K === 'G') { need(5); c.add(head, K, nodes(4), K === 'E' ? { gain: parseValue(tk[5]) } : { gm: parseValue(tk[5]) }); }
      else if (K === 'D') { need(3); c.add(head, 'D', nodes(2), { model: tk[3] }); }
      else if (K === 'Q') { need(4); c.add(head, 'Q', nodes(3), { model: tk[4] }); }
      else if (K === 'M') { need(5); c.add(head, 'M', nodes(3), { model: tk[5] }); }
      else if (K === 'S') { need(5); const p = {}; for (const kv of tk.slice(5)) { const [k, v] = kv.split('='); if (v) p[k.toLowerCase()] = parseValue(v); } c.add(head, 'S', nodes(4), p); }
      else bad(line, 'the element ' + head + ' is not supported');
    } catch (err) { bad(line, err.message); }
  }
  return { circuit: c, analyses, problems };
}

/** Run a deck's analyses in order; returns [{type, result}]. */
export function runDeck(deck) {
  const out = [];
  for (const a of deck.analyses) {
    if (a.type === 'op') out.push({ type: 'op', result: deck.circuit.op() });
    else if (a.type === 'dc') { const v = []; const dir = a.step > 0 ? 1 : -1; for (let x = a.start; dir * (x - a.stop) <= Math.abs(a.step) * 1e-9; x += a.step) v.push(x); out.push({ type: 'dc', result: deck.circuit.dc(a.source, v) }); }
    else if (a.type === 'ac') { const f = []; if (a.mode === 'lin') for (let k = 0; k < a.points; k++) f.push(a.fstart + (a.fstop - a.fstart) * k / Math.max(a.points - 1, 1)); else { const per = a.mode === 'dec' ? Math.log10(a.fstop / a.fstart) : Math.log2(a.fstop / a.fstart), N = Math.max(1, Math.round(per * a.points)); for (let k = 0; k <= N; k++) f.push(a.fstart * Math.pow(a.fstop / a.fstart, k / N)); } out.push({ type: 'ac', result: deck.circuit.ac(f) }); }
    else if (a.type === 'tran') out.push({ type: 'tran', result: deck.circuit.tran({ tstop: a.tstop, tstep: a.tstep, uic: a.uic }) });
  }
  return out;
}

export const mag = (z) => Math.hypot(z.re, z.im);
export const phaseDeg = (z) => Math.atan2(z.im, z.re) * 180 / Math.PI;
