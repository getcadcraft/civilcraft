/* SPDX-License-Identifier: Apache-2.0 */
/**
 * model.js — acausal 1-D lumped models (0.8 XE.12; DOM-free, no imports). One element set for every physical domain, connected by nodes.
 *
 * Every domain has an across variable (potential, measured at a node against the domain's ground `gnd`) and a through variable (flow):
 *   electrical      V, A          thermal        K, W            hydraulic      Pa, m³/s
 *   translational   m/s, N        rotational     rad/s, N·m      (the force–current analogy: mass is a capacitor, spring an inductor, damper a resistor)
 * Elements (type → parameters; `a`, `b` are node names, `b` omitted = `gnd`; a number may be a function of time for sources):
 *   electrical      resistor{R} capacitor{C, ic?} inductor{L, ic?} vsource{V} isource{I} diode{Is, n, Vt}
 *   thermal         thermalResistance{R K/W} thermalCapacity{C J/K, ic?} temperatureSource{T} heatSource{Q}
 *   hydraulic       hydraulicResistance{R Pa·s/m³} orifice{K Pa·s²/m⁶: dp = K q|q|} tank{C m³/Pa, ic?} inertance{L Pa·s²/m³, ic?} pressureSource{p} flowSource{q}
 *   translational   mass{m kg, ic?} (a to ground) spring{k N/m} damper{c N·s/m} forceSource{F} velocitySource{v}
 *   rotational      inertia{J kg·m², ic?} (a to ground) torsionalSpring{k} rotationalDamper{c} torqueSource{tau} speedSource{w}
 *   generic         resistive{domain, f(v, t) → through} (any nonlinear law through = f(across))
 *   coupling        transformer{a, b, a2, b2, n, domain1, domain2}: across1 = n·across2, through2 = −n·through1 (a motor, a gear, a lever)
 *                   gyrator{…, r}: across1 = r·through2, across2 = −r·through1
 * Through variables run from `a` to `b` through the element. ic = initial across (capacitive) or through (inductive) value.
 * Sources of time: step(t0, v0, v1), ramp(t0, t1, v0, v1), sine(amp, hz, offset, phaseRad), pulse(v0, v1, delay, width, period).
 */

export const DOMAINS = {
  electrical: { across: 'V', through: 'A', acrossName: 'voltage', throughName: 'current' },
  thermal: { across: 'K', through: 'W', acrossName: 'temperature', throughName: 'heat flow' },
  hydraulic: { across: 'Pa', through: 'm3/s', acrossName: 'pressure', throughName: 'flow' },
  translational: { across: 'm/s', through: 'N', acrossName: 'velocity', throughName: 'force' },
  rotational: { across: 'rad/s', through: 'N*m', acrossName: 'speed', throughName: 'torque' },
};

export const step = (t0, v0, v1) => (t) => (t <= t0 ? v0 : v1);
export const ramp = (t0, t1, v0, v1) => (t) => (t <= t0 ? v0 : t >= t1 ? v1 : v0 + (v1 - v0) * (t - t0) / (t1 - t0));
export const sine = (amp, hz, offset = 0, phase = 0) => (t) => offset + amp * Math.sin(2 * Math.PI * hz * t + phase);
export const pulse = (v0, v1, delay, width, period = Infinity) => (t) => { if (t < delay) return v0; const u = (t - delay) % period; return u < width ? v1 : v0; };

// type → { dom, kind, param (the main value), role }.  kind: R resistive, C capacitive, L inductive, E across source, J through source
const TYPES = {
  resistor: { dom: 'electrical', kind: 'R', p: 'R' }, capacitor: { dom: 'electrical', kind: 'C', p: 'C' }, inductor: { dom: 'electrical', kind: 'L', p: 'L' }, vsource: { dom: 'electrical', kind: 'E', p: 'V' }, isource: { dom: 'electrical', kind: 'J', p: 'I' }, diode: { dom: 'electrical', kind: 'D' },
  thermalResistance: { dom: 'thermal', kind: 'R', p: 'R' }, thermalCapacity: { dom: 'thermal', kind: 'C', p: 'C', grounded: true }, temperatureSource: { dom: 'thermal', kind: 'E', p: 'T' }, heatSource: { dom: 'thermal', kind: 'J', p: 'Q' },
  hydraulicResistance: { dom: 'hydraulic', kind: 'R', p: 'R' }, orifice: { dom: 'hydraulic', kind: 'O', p: 'K' }, tank: { dom: 'hydraulic', kind: 'C', p: 'C' }, inertance: { dom: 'hydraulic', kind: 'L', p: 'L' }, pressureSource: { dom: 'hydraulic', kind: 'E', p: 'p' }, flowSource: { dom: 'hydraulic', kind: 'J', p: 'q' },
  mass: { dom: 'translational', kind: 'C', p: 'm', grounded: true }, spring: { dom: 'translational', kind: 'L', p: 'k', inverse: true }, damper: { dom: 'translational', kind: 'R', p: 'c', conductance: true }, forceSource: { dom: 'translational', kind: 'J', p: 'F' }, velocitySource: { dom: 'translational', kind: 'E', p: 'v' },
  inertia: { dom: 'rotational', kind: 'C', p: 'J', grounded: true }, torsionalSpring: { dom: 'rotational', kind: 'L', p: 'k', inverse: true }, rotationalDamper: { dom: 'rotational', kind: 'R', p: 'c', conductance: true }, torqueSource: { dom: 'rotational', kind: 'J', p: 'tau' }, speedSource: { dom: 'rotational', kind: 'E', p: 'w' },
  resistive: { dom: null, kind: 'N' }, transformer: { dom: null, kind: 'X' }, gyrator: { dom: null, kind: 'Y' },
};
export const ELEMENT_TYPES = Object.keys(TYPES);

export class Model {
  constructor(name = 'model') { this.name = name; this.elements = []; this.errors = []; }
  /** Add an element: { id, type, a, b?, ...params }. Returns this (chainable). Errors are collected, not thrown, so a person's model reports them all. */
  add(e) {
    const T = TYPES[e.type];
    if (!e.id) e = { ...e, id: e.type + (this.elements.length + 1) };
    if (!T) { this.errors.push(`${e.id}: unknown element type ${e.type}`); return this; }
    if (this.elements.some((x) => x.id === e.id)) { this.errors.push(`${e.id}: id used twice`); return this; }
    this.elements.push({ ...e }); return this;
  }
  /** Compile: node tables, unknown numbering, residual functions. → { ok, errors, system } */
  compile() {
    const errors = [...this.errors], nodes = new Map(), nodeDom = [];
    const node = (name, dom, el) => {
      if (name == null || name === 'gnd' || name === 0 || name === '0') return -1;
      const key = String(name);
      if (!nodes.has(key)) { nodes.set(key, nodes.size); nodeDom.push(dom); }
      else if (nodeDom[nodes.get(key)] !== dom) errors.push(`${el.id}: node ${key} is ${nodeDom[nodes.get(key)]} but this element is ${dom}`);
      return nodes.get(key);
    };
    const parts = [];
    for (let e of this.elements) {
      const T = TYPES[e.type]; let dom = T.dom;
      if (T.kind === 'N') { dom = e.domain; if (!DOMAINS[dom]) { errors.push(`${e.id}: resistive needs a domain`); continue; } if (typeof e.f !== 'function') { errors.push(`${e.id}: resistive needs f(v, t)`); continue; } }
      if (T.kind === 'X' || T.kind === 'Y') {
        const d1 = e.domain1, d2 = e.domain2; if (!DOMAINS[d1] || !DOMAINS[d2]) { errors.push(`${e.id}: ${e.type} needs domain1 and domain2`); continue; }
        const k = T.kind === 'X' ? e.n : e.r; if (!Number.isFinite(k) || k === 0) { errors.push(`${e.id}: ${e.type} needs a non-zero ${T.kind === 'X' ? 'n' : 'r'}`); continue; }
        parts.push({ e, kind: T.kind, k, a: node(e.a, d1, e), b: node(e.b, d1, e), a2: node(e.a2, d2, e), b2: node(e.b2, d2, e), d1, d2 }); continue;
      }
      const need = (T.p && typeof e[T.p] !== 'function' && !(e[T.p] > 0 || T.kind === 'E' || T.kind === 'J')) ? e.id + ': ' + T.p + ' must be a positive number' : null;
      if (need) { errors.push(need); continue; }
      if (T.kind === 'D') e = { ...e, Is: e.Is ?? 1e-14, n: e.n ?? 1, Vt: e.Vt ?? 0.025852 };
      const a = node(e.a, dom, e), b = T.grounded ? -1 : node(e.b, dom, e);
      if (a < 0 && b < 0) { errors.push(`${e.id}: both ends are ground`); continue; }
      if (a === b) { errors.push(`${e.id}: both ends are the same node`); continue; }
      parts.push({ e, kind: T.kind, T, dom, a, b });
    }
    if (errors.length) return { ok: false, errors };
    const N = nodes.size; let nx = N; const branch = (p) => { p.br = nx++; };
    for (const p of parts) if (['C', 'L', 'E', 'X', 'Y'].includes(p.kind)) branch(p);
    for (const p of parts) if (p.kind === 'Y') p.br2 = nx++;
    const size = nx, dyn = new Array(size).fill(false), nodeNames = [...nodes.keys()];
    const val = (p, k, t) => { const v = p.e[k]; return typeof v === 'function' ? v(t) : v; };
    const V = (x, i) => (i < 0 ? 0 : x[i]);
    // residual contributions: g (static) and S (storage, the row is g + dS/dt); `mode` 'dc' | 'ic' | 'tran'
    const sys = {
      size, nodeNames, nodeDomain: nodeDom, parts, dyn, N,
      eval(x, t, mode, r, S) {
        for (const p of parts) {
          const { e } = p;
          switch (p.kind) {
            case 'R': case 'D': case 'N': case 'O': {
              const v = V(x, p.a) - V(x, p.b); let i;
              if (p.kind === 'R') { const par = val(p, p.T.p, t); i = p.T.conductance ? par * v : v / par; }
              else if (p.kind === 'O') { const K = val(p, 'K', t), eps = e.eps ?? 1e-3; i = v / Math.sqrt(K * Math.sqrt(v * v + eps * eps)); }
              else if (p.kind === 'D') { const nv = e.n * e.Vt, lim = 40 * nv; i = v > lim ? e.Is * (Math.exp(40) - 1) * (1 + (v - lim) / nv) : e.Is * (Math.exp(v / nv) - 1); }
              else i = e.f(v, t);
              if (p.a >= 0) r[p.a] += i; if (p.b >= 0) r[p.b] -= i; break;
            }
            case 'J': { const i = val(p, p.T.p, t); if (p.a >= 0) r[p.a] += i; if (p.b >= 0) r[p.b] -= i; break; }
            case 'E': { const i = x[p.br], v = V(x, p.a) - V(x, p.b); if (p.a >= 0) r[p.a] += i; if (p.b >= 0) r[p.b] -= i; r[p.br] += v - val(p, p.T.p, t); break; }
            case 'C': {
              const i = x[p.br], v = V(x, p.a) - V(x, p.b); if (p.a >= 0) r[p.a] += i; if (p.b >= 0) r[p.b] -= i;
              const Cv = typeof e.q === 'function' ? e.q(v) : val(p, p.T.p, t) * v;
              if (mode === 'ic' && e.ic != null) r[p.br] += v - e.ic;
              else if (mode !== 'tran') r[p.br] += i;
              else { r[p.br] += i; S[p.br] -= Cv; }
              break;
            }
            case 'L': {
              const i = x[p.br], v = V(x, p.a) - V(x, p.b), Lp = val(p, p.T.p, t), L = p.T.inverse ? 1 / Lp : Lp;
              if (p.a >= 0) r[p.a] += i; if (p.b >= 0) r[p.b] -= i;
              if (mode === 'ic' && e.ic != null) r[p.br] += i - e.ic;
              else if (mode !== 'tran') r[p.br] += v;
              else { r[p.br] += v; S[p.br] -= L * i; }
              break;
            }
            case 'X': {
              const i1 = x[p.br], v1 = V(x, p.a) - V(x, p.b), v2 = V(x, p.a2) - V(x, p.b2);
              if (p.a >= 0) r[p.a] += i1; if (p.b >= 0) r[p.b] -= i1; if (p.a2 >= 0) r[p.a2] -= p.k * i1; if (p.b2 >= 0) r[p.b2] += p.k * i1;
              r[p.br] += v1 - p.k * v2; break;
            }
            case 'Y': {
              const i1 = x[p.br], i2 = x[p.br2], v1 = V(x, p.a) - V(x, p.b), v2 = V(x, p.a2) - V(x, p.b2);
              if (p.a >= 0) r[p.a] += i1; if (p.b >= 0) r[p.b] -= i1; if (p.a2 >= 0) r[p.a2] += i2; if (p.b2 >= 0) r[p.b2] -= i2;
              r[p.br] += v1 - p.k * i2; r[p.br2] += v2 + p.k * i1; break;
            }
          }
        }
      },
      /** through value of element `id` (from a to b; for a transformer the current into port 1) at state x, time t */
      through(id, x, t) {
        const p = parts.find((q) => q.e.id === id); if (!p) return NaN; const { e } = p;
        const v = p.kind === 'X' || p.kind === 'Y' ? 0 : V(x, p.a) - V(x, p.b);
        switch (p.kind) {
          case 'R': { const par = val(p, p.T.p, t); return p.T.conductance ? par * v : v / par; }
          case 'O': { const K = val(p, 'K', t), eps = e.eps ?? 1e-3; return v / Math.sqrt(K * Math.sqrt(v * v + eps * eps)); }
          case 'D': { const nv = e.n * e.Vt; return e.Is * (Math.exp(Math.min(v, 40 * nv) / nv) - 1); }
          case 'N': return e.f(v, t);
          case 'J': return val(p, p.T.p, t);
          default: return x[p.br];
        }
      },
      across(name, x) { const i = nodes.get(String(name)); return name === 'gnd' ? 0 : i == null ? NaN : x[i]; },
    };
    // which rows carry storage: a probe evaluation marks them
    const probe = new Array(size).fill(0), s0 = new Array(size).fill(0), r0 = new Array(size).fill(0);
    sys.eval(new Array(size).fill(0.5), 0, 'tran', r0, s0);
    s0.forEach((v, i) => { if (v !== 0 || parts.some((p) => (p.kind === 'C' || p.kind === 'L') && p.br === i)) dyn[i] = true; });
    void probe;
    return { ok: true, errors: [], system: sys };
  }
}
