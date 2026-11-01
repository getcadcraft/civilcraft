/* SPDX-License-Identifier: Apache-2.0 */
/**
 * shortcircuit.js — fault currents by symmetrical components on the bus impedance matrices (0.8 XE.2; DOM-free; per unit).
 * Method: Zbus = inverse of the sequence admittance matrices (Stevenson / Grainger & Stevenson ch. 11–12); the Thevenin source is the
 * pre-fault voltage `c` (1 pu, or IEC 60909's voltage factor c); fault types by the usual sequence connections:
 *   3-phase   I1 = V/(Z1+Zf)
 *   L–G (a)   I1 = I2 = I0 = V/(Z1+Z2+Z0+3Zf)
 *   L–L (b,c) I1 = V/(Z1+Z2+Zf), I2 = −I1
 *   L–L–G     I1 = V/(Z1 + Z2·(Z0+3Zf)/(Z2+Z0+3Zf)), I2 and I0 share −I1 by current division
 * Peak current ip = κ √2 I"k with κ = 1.02 + 0.98 e^(−3R/X) (IEC 60909-0, eq. 55, for one fed-from-one-source network).
 * Like IEC 60909 this ignores load currents, line charging and tap positions; it is a screening of the maximum fault, not a transient study.
 *
 *   sys: { baseMVA, buses: [{ id, kV?, g0?: [r, x] }], branches: [{ id, from, to, z1: [r, x], z2?, z0? }],
 *          sources: [{ bus, z1: [r, x], z2?, z0?, rating? }] }          z2 defaults to z1; no z0 = no zero-sequence path through it
 *   g0 on a bus = an impedance to ground in the zero-sequence network (a grounded transformer winding).
 */
import { cadd, csub, cmul, cdiv, cabs, carg, cinvert, cscale, problem } from './numeric.js';

const A = [-0.5, Math.sqrt(3) / 2], A2 = [-0.5, -Math.sqrt(3) / 2], ONE = [1, 0], ZERO = [0, 0];
const inv = (z) => cdiv(ONE, z);

/** The three Zbus matrices. A zero-sequence matrix of a system with no ground path is flagged (`noGround0`). */
export function buildZbus(sys) {
  const n = sys.buses.length, idx = new Map(sys.buses.map((b, i) => [b.id, i]));
  const mk = () => Array.from({ length: n }, () => Array.from({ length: n }, () => [0, 0]));
  const Y = [mk(), mk(), mk()], hasGround = [false, false, false];
  const add = (s, i, j, y) => { Y[s][i][i] = cadd(Y[s][i][i], y); if (j != null) { Y[s][j][j] = cadd(Y[s][j][j], y); Y[s][i][j] = csub(Y[s][i][j], y); Y[s][j][i] = csub(Y[s][j][i], y); } };
  const get = (z, dflt) => (z ? z : dflt);
  for (const l of sys.branches) {
    const f = idx.get(l.from), t = idx.get(l.to); if (f == null || t == null) throw new Error(`branch ${l.id}: unknown bus`);
    add(0, f, t, inv(l.z1)); add(1, f, t, inv(get(l.z2, l.z1))); if (l.z0) add(2, f, t, inv(l.z0));
  }
  for (const s of sys.sources || []) {
    const i = idx.get(s.bus); if (i == null) throw new Error(`source: unknown bus ${s.bus}`);
    add(0, i, null, inv(s.z1)); add(1, i, null, inv(get(s.z2, s.z1))); hasGround[0] = hasGround[1] = true;
    if (s.z0) { add(2, i, null, inv(s.z0)); hasGround[2] = true; }
  }
  sys.buses.forEach((b, i) => { if (b.g0) { add(2, i, null, inv(b.g0)); hasGround[2] = true; } });
  const Z = Y.map((m, s) => (s === 2 && !hasGround[2] ? null : cinvert(m)));
  return { Z1: Z[0], Z2: Z[1], Z0: Z[2], noGround0: !hasGround[2], idx, n };
}

const toPhase = (i0, i1, i2) => [cadd(cadd(i0, i1), i2), cadd(cadd(i0, cmul(A2, i1)), cmul(A, i2)), cadd(cadd(i0, cmul(A, i1)), cmul(A2, i2))];

/**
 * One fault. type: '3ph' | 'lg' | 'll' | 'llg'; at: bus id; zf: [r, x] fault impedance (default 0); c: pre-fault voltage factor (default 1).
 * → { ok, I (A per phase [a,b,c] magnitudes) , pu: { Ia, Ib, Ic, I0, I1, I2 } complex, Ik (A, the largest phase), ip (A), MVA, xr, buses: { id: { Va, Vb, Vc (pu mags) } },
 *     branches: { id: { Ia, Ib, Ic (A mags) } }, problems }
 */
export function fault(sys, zb, { type = '3ph', at, zf = [0, 0], c = 1 }) {
  const k = zb.idx.get(at), problems = [];
  if (k == null) return { ok: false, problems: [problem('fault.bus', 'error', `Fault bus ${at} is not in the system.`, [{ kind: 'bus', id: String(at) }])] };
  const Z1 = zb.Z1[k][k], Z2 = zb.Z2[k][k], Z0 = zb.Z0 ? zb.Z0[k][k] : null, V = [c, 0];
  if ((type === 'lg' || type === 'llg') && (!Z0 || cabs(Z0) > 1e6)) return { ok: false, problems: [problem('fault.noground', 'error', `Bus ${at} has no zero-sequence path to ground, so a fault to ground there has no current in this model.`, [{ kind: 'bus', id: String(at) }])] };
  const Zf3 = cscale(zf, 3);
  let i0 = ZERO, i1, i2 = ZERO;
  if (type === '3ph') i1 = cdiv(V, cadd(Z1, zf));
  else if (type === 'lg') { i1 = cdiv(V, cadd(cadd(cadd(Z1, Z2), Z0), Zf3)); i2 = i1; i0 = i1; }
  else if (type === 'll') { i1 = cdiv(V, cadd(cadd(Z1, Z2), zf)); i2 = cscale(i1, -1); }
  else if (type === 'llg') {
    const Z0e = cadd(Z0, Zf3), par = cdiv(cmul(Z2, Z0e), cadd(Z2, Z0e));
    i1 = cdiv(V, cadd(Z1, par)); i2 = cscale(cmul(i1, cdiv(Z0e, cadd(Z2, Z0e))), -1); i0 = cscale(cmul(i1, cdiv(Z2, cadd(Z2, Z0e))), -1);
  } else return { ok: false, problems: [problem('fault.type', 'error', `Unknown fault type ${type}.`, [])] };
  const [Ia, Ib, Ic] = toPhase(i0, i1, i2), Ibase = (sys.baseMVA * 1e6) / (Math.sqrt(3) * (sys.buses[k].kV ? sys.buses[k].kV * 1e3 : NaN));
  const mags = [cabs(Ia), cabs(Ib), cabs(Ic)], pu = Math.max(...mags);
  const r = Z1[0], x = Z1[1], xr = r > 1e-12 ? x / r : Infinity, kappa = Number.isFinite(xr) ? 1.02 + 0.98 * Math.exp(-3 / xr) : 1.02;
  const buses = {}, branches = {};
  sys.buses.forEach((b, j) => {
    const v1 = csub(V, cmul(zb.Z1[j][k], i1)), v2 = cscale(cmul(zb.Z2[j][k], i2), -1), v0 = zb.Z0 ? cscale(cmul(zb.Z0[j][k], i0), -1) : ZERO;
    const [va, vb, vc] = toPhase(v0, v1, v2); buses[b.id] = { Va: cabs(va), Vb: cabs(vb), Vc: cabs(vc), seq: [v0, v1, v2] };
  });
  const vs = (j) => buses[sys.buses[j].id].seq;
  for (const l of sys.branches) {
    const f = zb.idx.get(l.from), t = zb.idx.get(l.to), a = vs(f), b = vs(t);
    const s1 = cdiv(csub(a[1], b[1]), l.z1), s2 = cdiv(csub(a[2], b[2]), l.z2 || l.z1), s0 = l.z0 ? cdiv(csub(a[0], b[0]), l.z0) : ZERO;
    const [ia, ib, ic] = toPhase(s0, s1, s2), sc = Number.isFinite(Ibase) ? Ibase : 1;
    branches[l.id] = { Ia: cabs(ia) * sc, Ib: cabs(ib) * sc, Ic: cabs(ic) * sc };
  }
  const unit = Number.isFinite(Ibase) ? Ibase : null;
  const out = { ok: true, type, at, pu: { Ia, Ib, Ic, I0: i0, I1: i1, I2: i2 }, Ik_pu: pu, Ik: unit ? pu * unit : null, ip: unit ? kappa * Math.SQRT2 * pu * unit : null, kappa, xr, MVA: sys.buses[k].kV ? Math.sqrt(3) * sys.buses[k].kV * pu * unit / 1e6 : null, buses, branches, problems };
  out.angle = carg(Ia) * 180 / Math.PI;
  return out;
}

/** Every bus, every listed fault type, with the equipment-duty check: ratings = { busId: { kA (breaking), peakKA? } }. */
export function faultStudy(sys, { types = ['3ph', 'lg'], c = 1, ratings = {} } = {}) {
  const zb = buildZbus(sys), rows = [], problems = [];
  for (const b of sys.buses) for (const type of types) {
    const f = fault(sys, zb, { type, at: b.id, c });
    if (!f.ok) { if (type !== 'lg' || zb.Z0) problems.push(...f.problems); continue; }
    rows.push({ bus: b.id, type, Ik: f.Ik, ip: f.ip, pu: f.Ik_pu });
    const rt = ratings[b.id];
    if (rt && f.Ik != null && f.Ik / 1000 > rt.kA) problems.push(problem('duty.break', 'error', `Bus ${b.id}: ${f.Ik >= 1000 ? (f.Ik / 1000).toFixed(1) + ' kA' : f.Ik.toFixed(0) + ' A'} (${type}) is over the ${rt.kA} kA breaking rating.`, [{ kind: 'bus', id: b.id }], { req: { op: '<=', value: rt.kA * 1000, unit: 'A' }, found: { value: f.Ik, unit: 'A' } }));
    if (rt && rt.peakKA && f.ip != null && f.ip / 1000 > rt.peakKA) problems.push(problem('duty.peak', 'error', `Bus ${b.id}: peak ${(f.ip / 1000).toFixed(1)} kA is over the ${rt.peakKA} kA making rating.`, [{ kind: 'bus', id: b.id }]));
  }
  return { rows, problems, noGround0: zb.noGround0 };
}
