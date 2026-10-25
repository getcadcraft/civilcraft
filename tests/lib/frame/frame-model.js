/* SPDX-License-Identifier: Apache-2.0 */
/**
 * frame-model.js — the analytical frame model (0.6 LC.4): what a linear 3D frame analysis needs, in one plain-data shape
 * every app writes and the solver (frame-solve.js), the report (frame-report.js) and the CraftScript twin (frame-craft.js →
 * craftlib/frame3d.craft) read. DOM-free, imports nothing. The one copy that is edited is lib/frame/; `node
 * tools/frame/sync.mjs` copies it byte for byte into detailcraft/dev/frame/ and bimcraft/dev/frame/ (`--check` fails on drift).
 *
 * An analysis aid, not a code check: nothing here knows a design code. Messages are codes ({ code, …params }); each app
 * words them through its own language file (keys frame.err.<code>, frame.warn.<code>).
 *
 * Units, everywhere: mm, N, MPa (= N/mm²), N·mm, kg/m³; global Z up, gravity along −Z (G_ACC m/s²).
 *
 *   model = { format: 'cadcraft-frame', version: 1, name,
 *     nodes:     [{ id, x, y, z }]
 *     materials: [{ id, name, E, G, rho }]                    E, G in MPa; rho in kg/m³ (self weight)
 *     sections:  [{ id, name, A, Iy, Iz, J }]                 mm², mm⁴ — Iy about the member's local y (its strong axis
 *                                                             when local z is the depth), Iz about local z, J torsion
 *     members:   [{ id, i, j, section, material, roll, rel: { i: [6], j: [6] }, from }]
 *                i, j node ids; roll (deg) turns the local axes about x; rel = released end actions, true = free, in the
 *                order [N, Vy, Vz, T, My, Mz]; from = { app, ref } (which drawn part it stands for; carried, never read)
 *     supports:  [{ node, fix: [6], k?: [6] }]                held global dofs [ux uy uz rx ry rz]; k = springs (N/mm,
 *                                                             N·mm/rad) on dofs that are not held
 *     cases:     [{ id, name, kind, selfWeight, loads: […] }] selfWeight = factor on ρ·g·A (0 = none, 1 = own weight)
 *                loads: { type: 'node', node, F: [Fx Fy Fz Mx My Mz] }
 *                       { type: 'udl', member, dir, w, w2?, a?, b? }   N/mm per length of member, from a to b (mm from the i
 *                                                                      end; default the whole member), w → w2 linearly
 *                       { type: 'point', member, dir, P, a }           N at a mm from the i end
 *                dir: 'X' 'Y' 'Z' global, 'x' 'y' 'z' the member's local axes
 *     combos:    [{ id, name, factors: [{ case, f }] }] }    results add up linearly (no second-order effects)
 *
 * Local axes (the same frame DetailCraft draws members in, geom.js frame()): x from i to j; for a member that is not
 * vertical, z = the part of global Z square to x ("up"), for a vertical member z = global +X; y = z × x; then y and z are
 * turned by `roll` about x. A section's Iy is ∫ z² dA (bending in the x–z plane), Iz = ∫ y² dA.
 *
 *   FORMAT, VERSION, G_ACC, DOF, RELEASES (presets), STEEL (E, G, rho)
 *   cleanFrame(obj) → { model, warnings }  (untrusted: every field checked, bad entries dropped with a warning code,
 *                                           ids made unique; throws { code } when it is not a frame model at all)
 *   memberAxes(model, member) → { L, ex, ey, ez } · nodeIndex(model) → Map id → index
 *   polySection(loops) → { A, cy, cz, Iyy, Izz, Iyz, I1, I2, angle } of polygons in (u, v) — first loop outer, the
 *                         rest holes; I1/I2 principal, angle (deg) from u to the axis of I1 (Green's theorem, exact)
 *   torsionJ(p) → J (mm⁴) of a catalogue-style section record (kind I C L RHS CHS PL; see the formulas below)
 *   sectionOf(p, name) → { name, A, Iy, Iz, J, roll } for a section drawn in (u, v) with v = depth (DetailCraft's
 *                         profiles): Iy about u, Iz about v; an angle uses its principal axes (roll = their turn)
 */

export const FORMAT = 'cadcraft-frame';
export const VERSION = 1;
export const G_ACC = 9.80665;                       // m/s², standard gravity
export const DOF = ['ux', 'uy', 'uz', 'rx', 'ry', 'rz'];
export const ACTIONS = ['N', 'Vy', 'Vz', 'T', 'My', 'Mz'];
/** Steel as most tables give it: E 200 GPa, G 77 GPa (AISC 360-22 §B4 / EN 1993-1-1 §3.2.6 round to these), 7850 kg/m³. */
export const STEEL = Object.freeze({ E: 200000, G: 77000, rho: 7850 });
/** End release presets: rigid (nothing freed), pinned (both bending moments freed: a shear connection; torsion kept, so a
 *  beam pinned at both ends to columns still cannot spin), truss (bending and torsion freed: one end of a member that is
 *  pinned at both ends, like a brace — freeing torsion at one end only, so the member cannot spin about its own axis;
 *  freeing it at both ends would be a mechanism, refused as `release-unstable`). */
export const RELEASES = Object.freeze({
  rigid: Object.freeze([false, false, false, false, false, false]),
  pinned: Object.freeze([false, false, false, false, true, true]),
  truss: Object.freeze([false, false, false, true, true, true]),
});
export const LOAD_DIRS = ['X', 'Y', 'Z', 'x', 'y', 'z'];
export const CASE_KINDS = ['dead', 'live', 'roof', 'wind', 'snow', 'seismic', 'other'];
export const LIMITS = Object.freeze({ nodes: 50000, members: 50000, cases: 100, combos: 200, loads: 100000, text: 80 });

const num = (v) => (typeof v === 'number' ? v : typeof v === 'string' && v.trim() !== '' ? Number(v) : NaN);
const fin = (v, lo = -1e12, hi = 1e12) => { const n = num(v); return Number.isFinite(n) && n >= lo && n <= hi ? n : null; };
const text = (s, max = LIMITS.text) => String(s ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, max);
const bools = (a) => (Array.isArray(a) && a.length === 6 ? a.map((x) => x === true || x === 1) : null);

/** Untrusted model → a clean one. */
export function cleanFrame(obj) {
  let j = obj;
  if (typeof obj === 'string') { try { j = JSON.parse(obj); } catch { throw { code: 'not-json' }; } }
  if (!j || typeof j !== 'object' || j.format !== FORMAT) throw { code: 'not-frame' };
  if (!Number.isInteger(j.version) || j.version < 1) throw { code: 'no-version' };
  if (j.version > VERSION) throw { code: 'newer', version: j.version };
  const warnings = [];
  const warn = (code, extra = {}) => warnings.push({ code, ...extra });
  const uniq = (list, kind) => {
    const seen = new Set();
    return list.filter((x) => { if (seen.has(x.id)) { warn('duplicate', { kind, id: x.id }); return false; } seen.add(x.id); return true; });
  };
  const arr = (a, max) => (Array.isArray(a) ? a.slice(0, max) : []);
  const id = (v) => text(v, 40);

  const nodes = uniq(arr(j.nodes, LIMITS.nodes).map((n) => {
    const x = fin(n?.x), y = fin(n?.y), z = fin(n?.z);
    if (!id(n?.id) || x === null || y === null || z === null) { warn('bad-node'); return null; }
    return { id: id(n.id), x, y, z };
  }).filter(Boolean), 'node');
  const nodeIds = new Set(nodes.map((n) => n.id));

  const materials = uniq(arr(j.materials, 1000).map((m) => {
    const E = fin(m?.E, 1e-6), G = fin(m?.G, 1e-6), rho = fin(m?.rho ?? 0, 0);
    if (!id(m?.id) || E === null || G === null || rho === null) { warn('bad-material'); return null; }
    return { id: id(m.id), name: text(m.name) || id(m.id), E, G, rho };
  }).filter(Boolean), 'material');
  const matIds = new Set(materials.map((m) => m.id));

  const sections = uniq(arr(j.sections, 5000).map((s) => {
    const A = fin(s?.A, 1e-9), Iy = fin(s?.Iy, 1e-9), Iz = fin(s?.Iz, 1e-9), J = fin(s?.J, 1e-9);
    if (!id(s?.id) || [A, Iy, Iz, J].includes(null)) { warn('bad-section'); return null; }
    const out = { id: id(s.id), name: text(s.name) || id(s.id), A, Iy, Iz, J };
    const sh = cleanShape(s.shape);
    if (sh) out.shape = sh;
    return out;
  }).filter(Boolean), 'section');
  const secIds = new Set(sections.map((s) => s.id));

  const members = uniq(arr(j.members, LIMITS.members).map((m) => {
    const i = id(m?.i), jj = id(m?.j);
    if (!id(m?.id) || !nodeIds.has(i) || !nodeIds.has(jj) || i === jj || !secIds.has(id(m.section)) || !matIds.has(id(m.material))) { warn('bad-member', { id: id(m?.id) }); return null; }
    const roll = fin(m.roll ?? 0, -3600, 3600);
    const ri = bools(m.rel?.i) || [...RELEASES.rigid], rj = bools(m.rel?.j) || [...RELEASES.rigid];
    const out = { id: id(m.id), i, j: jj, section: id(m.section), material: id(m.material), roll: roll ?? 0, rel: { i: ri, j: rj } };
    if (m.from && typeof m.from === 'object') out.from = { app: text(m.from.app, 20), ref: text(m.from.ref, 60) };
    return out;
  }).filter(Boolean), 'member');
  const memIds = new Set(members.map((m) => m.id));
  // a zero-length member (both ends on one spot) cannot be analysed
  const at = new Map(nodes.map((n) => [n.id, n]));
  for (let k = members.length - 1; k >= 0; k--) {
    const a = at.get(members[k].i), b = at.get(members[k].j);
    if (Math.hypot(b.x - a.x, b.y - a.y, b.z - a.z) < 1e-6) { warn('zero-length', { id: members[k].id }); memIds.delete(members[k].id); members.splice(k, 1); }
  }

  const supports = [];
  const supNodes = new Set();
  for (const s of arr(j.supports, LIMITS.nodes)) {
    const node = id(s?.node), fix = bools(s?.fix);
    if (!nodeIds.has(node) || !fix || supNodes.has(node)) { warn('bad-support'); continue; }
    const out = { node, fix };
    if (Array.isArray(s.k) && s.k.length === 6) {
      const k = s.k.map((v) => fin(v ?? 0, 0) ?? 0);
      if (k.some((v) => v > 0)) out.k = k;
    }
    supNodes.add(node);
    supports.push(out);
  }

  const cases = uniq(arr(j.cases, LIMITS.cases).map((c) => {
    if (!id(c?.id)) { warn('bad-case'); return null; }
    const loads = [];
    for (const l of arr(c.loads, LIMITS.loads)) {
      const L = cleanLoad(l, nodeIds, memIds);
      if (L) loads.push(L); else warn('bad-load', { case: id(c.id) });
    }
    return { id: id(c.id), name: text(c.name) || id(c.id), kind: CASE_KINDS.includes(c.kind) ? c.kind : 'other', selfWeight: fin(c.selfWeight ?? 0, -100, 100) ?? 0, loads };
  }).filter(Boolean), 'case');
  const caseIds = new Set(cases.map((c) => c.id));

  const combos = uniq(arr(j.combos, LIMITS.combos).map((c) => {
    if (!id(c?.id)) { warn('bad-combo'); return null; }
    const factors = arr(c.factors, LIMITS.cases).map((x) => ({ case: id(x?.case), f: fin(x?.f, -1e3, 1e3) })).filter((x) => caseIds.has(x.case) && x.f !== null);
    const out = { id: id(c.id), name: text(c.name) || id(c.id), factors };
    if (c.limit === 'strength' || c.limit === 'service') { out.limit = c.limit; out.clause = text(c.clause, 120); }   // made by frame-combos.js
    return out;
  }).filter(Boolean), 'combo');

  return { model: { format: FORMAT, version: VERSION, name: text(j.name) || '', nodes, materials, sections, members, supports, cases, combos }, warnings };
}

/** The drawn shape a design check reads (0.7 SU.878): an I-shape's d, bf, tw, tf, r in mm, or null. */
function cleanShape(sh) {
  if (!sh || typeof sh !== 'object' || sh.kind !== 'I') return null;
  const v = (x, lo, hi) => (typeof x === 'number' && Number.isFinite(x) && x >= lo && x <= hi ? x : null);
  const d = v(sh.d, 1, 5000), bf = v(sh.bf, 1, 2000), tw = v(sh.tw, 0.1, 500), tf = v(sh.tf, 0.1, 500), r = v(sh.r ?? 0, 0, 200);
  if ([d, bf, tw, tf, r].includes(null) || 2 * tf + 1 >= d || tw >= bf) return null;
  const out = { kind: 'I', d, bf, tw, tf, r };
  if (sh.welded) out.welded = true;
  return out;
}

function cleanLoad(l, nodeIds, memIds) {
  if (!l || typeof l !== 'object') return null;
  if (l.type === 'node') {
    const node = text(l.node, 40);
    const F = Array.isArray(l.F) && l.F.length === 6 ? l.F.map((v) => fin(v ?? 0)) : null;
    if (!nodeIds.has(node) || !F || F.includes(null)) return null;
    return { type: 'node', node, F };
  }
  const member = text(l.member, 40);
  if (!memIds.has(member) || !LOAD_DIRS.includes(l.dir)) return null;
  if (l.type === 'udl') {
    const w = fin(l.w), w2 = l.w2 === undefined || l.w2 === null ? null : fin(l.w2);
    const a = l.a === undefined || l.a === null ? null : fin(l.a, 0), b = l.b === undefined || l.b === null ? null : fin(l.b, 0);
    if (w === null || (l.w2 !== undefined && l.w2 !== null && w2 === null)) return null;
    const out = { type: 'udl', member, dir: l.dir, w };
    if (w2 !== null && w2 !== w) out.w2 = w2;
    if (a !== null) out.a = a;
    if (b !== null) out.b = b;
    if (a !== null && b !== null && b <= a) return null;
    return out;
  }
  if (l.type === 'point') {
    const P = fin(l.P), a = fin(l.a, 0);
    if (P === null || a === null) return null;
    return { type: 'point', member, dir: l.dir, P, a };
  }
  return null;
}

export function nodeIndex(model) { return new Map(model.nodes.map((n, k) => [n.id, k])); }

const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const unit = (a) => { const l = Math.hypot(a[0], a[1], a[2]); return [a[0] / l, a[1] / l, a[2] / l]; };

/** Local axes of a member: ex along it, ez "up" (or +X for a vertical member), ey = ez × ex, then turned by roll. */
export function axesOf(pi, pj, rollDeg = 0) {
  const d = [pj[0] - pi[0], pj[1] - pi[1], pj[2] - pi[2]];
  const L = Math.hypot(d[0], d[1], d[2]);
  const ex = [d[0] / L, d[1] / L, d[2] / L];
  // "vertical" exactly as DetailCraft's geom.js frame() decides it (|x·Z| > 0.999999), so the analysis axes are the drawn ones
  let ez = Math.abs(ex[2]) > 0.999999 ? [1, 0, 0] : unit([-ex[2] * ex[0], -ex[2] * ex[1], 1 - ex[2] * ex[2]]);
  let ey = cross(ez, ex);
  if (rollDeg) {
    const r = rollDeg * Math.PI / 180, c = Math.cos(r), s = Math.sin(r);
    const y2 = [c * ey[0] + s * ez[0], c * ey[1] + s * ez[1], c * ey[2] + s * ez[2]];
    const z2 = [-s * ey[0] + c * ez[0], -s * ey[1] + c * ez[1], -s * ey[2] + c * ez[2]];
    ey = y2; ez = z2;
  }
  return { L, ex, ey, ez };
}

export function memberAxes(model, m, at = null) {
  const idx = at || new Map(model.nodes.map((n) => [n.id, n]));
  const a = idx.get(m.i), b = idx.get(m.j);
  return axesOf([a.x, a.y, a.z], [b.x, b.y, b.z], m.roll || 0);
}

/**
 * Area and second moments of polygons (Green's theorem, exact for straight edges): loops in (u, v); the first is the
 * outline (any winding), the rest are holes (taken off whatever their winding). Iyy = ∫ (v − cv)² dA (about the u axis
 * through the centroid), Izz = ∫ (u − cu)² dA, Iyz = ∫ (u − cu)(v − cv) dA; I1 ≥ I2 principal, angle (deg) from +u to the
 * principal axis whose moment of inertia is I1 — i.e. the axis the section bends about most stiffly.
 */
export function polySection(loops) {
  let A = 0, Su = 0, Sv = 0, Iuu = 0, Ivv = 0, Iuv = 0;    // Iuu = ∫v², Ivv = ∫u², Iuv = ∫uv about the origin
  loops.forEach((loop, k) => {
    let a = 0, su = 0, sv = 0, iuu = 0, ivv = 0, iuv = 0;
    for (let i = 0, n = loop.length; i < n; i++) {
      const [u0, v0] = loop[i], [u1, v1] = loop[(i + 1) % n];
      const c = u0 * v1 - u1 * v0;
      a += c;
      su += (u0 + u1) * c; sv += (v0 + v1) * c;
      ivv += (u0 * u0 + u0 * u1 + u1 * u1) * c;
      iuu += (v0 * v0 + v0 * v1 + v1 * v1) * c;
      iuv += (u0 * v1 + 2 * u0 * v0 + 2 * u1 * v1 + u1 * v0) * c;
    }
    const sign = (k === 0 ? 1 : -1) * Math.sign(a || 1);
    A += sign * a / 2; Su += sign * su / 6; Sv += sign * sv / 6;
    Ivv += sign * ivv / 12; Iuu += sign * iuu / 12; Iuv += sign * iuv / 24;
  });
  const cu = Su / A, cv = Sv / A;
  const Iyy = Iuu - A * cv * cv, Izz = Ivv - A * cu * cu, Iyz = Iuv - A * cu * cv;
  const m = (Iyy + Izz) / 2, r = Math.hypot((Iyy - Izz) / 2, Iyz);
  // the axis about which I = I1: bending about an axis at angle φ from +u gives I(φ) = Iyy cos²φ + Izz sin²φ − 2 Iyz sinφ cosφ
  const angle = 0.5 * Math.atan2(-2 * Iyz, Iyy - Izz) * 180 / Math.PI;
  return { A, cu, cv, Iyy, Izz, Iyz, I1: m + r, I2: m - r, angle: Math.abs(Iyz) < 1e-9 * (Iyy + Izz) ? 0 : angle };
}

/**
 * Saint-Venant torsion constant J of a catalogue-style section (mm⁴):
 *   rolled I-shapes with root fillets: El Darwish & Johnston's formula (below), as steel tables give J (within about 1 %);
 *   other open sections (I without fillets, C, L): J = Σ b t³ / 3 over the plates, flanges b × tf, web (d − tf) × tw or
 *     legs (b − t/2) × t (S. P. Timoshenko & J. N. Goodier, Theory of Elasticity, 3rd ed., §109, thin-walled open sections)
 *   closed rectangular tube: J = 4 Am² t / p, Am and p of the wall's mid-line (Bredt; Timoshenko & Goodier §115)
 *   round tube: J = π (D⁴ − (D − 2t)⁴) / 32 (exact)
 *   flat bar / plate b × t (b ≥ t): J = b t³ [1/3 − 0.21 (t/b)(1 − t⁴ / (12 b⁴))] (Roark's Formulas for Stress and
 *     Strain, torsion of a solid rectangle, K = a b³ [16/3 − 3.36 (b/a)(1 − b⁴/12a⁴)] with sides 2a × 2b)
 */
export function torsionJ(p) {
  switch (p.kind) {
    case 'I':
      // with root fillets: I. A. El Darwish and B. G. Johnston, "Torsion of structural shapes", Journal of the Structural
      // Division (ASCE) 91 (ST1), 1965 — the formula steel tables use: J = 2/3 B T³ + 1/3 (D − 2T) t³ + 2 α D₁⁴ − 0.420 T⁴,
      // α = −0.042 + 0.2204 t/T + 0.1355 r/T − 0.0865 r t/T² − 0.0725 t²/T², D₁ = ((T + r)² + (r + t/4) t) / (2r + T)
      if (p.r > 0) {
        const B = p.bf, T = p.tf, D = p.d, t = p.tw, r = p.r;
        const a = -0.042 + 0.2204 * t / T + 0.1355 * r / T - 0.0865 * r * t / (T * T) - 0.0725 * t * t / (T * T);
        const D1 = ((T + r) ** 2 + (r + t / 4) * t) / (2 * r + T);
        return 2 / 3 * B * T ** 3 + (D - 2 * T) * t ** 3 / 3 + 2 * a * D1 ** 4 - 0.420 * T ** 4;
      }
      return (2 * p.bf * p.tf ** 3 + (p.d - p.tf) * p.tw ** 3) / 3;
    case 'C': return (2 * p.bf * p.tf ** 3 + (p.d - p.tf) * p.tw ** 3) / 3;
    case 'L': { const h = p.h || p.b; return ((p.b - p.t / 2) + (h - p.t / 2)) * p.t ** 3 / 3; }
    case 'RHS': { const t = p.t, Am = (p.h - t) * (p.b - t), per = 2 * ((p.h - t) + (p.b - t)); return 4 * Am * Am * t / per; }
    case 'CHS': return Math.PI * (p.D ** 4 - (p.D - 2 * p.t) ** 4) / 32;
    case 'PL': { const b = Math.max(p.b, p.t), t = Math.min(p.b, p.t); return b * t ** 3 * (1 / 3 - 0.21 * (t / b) * (1 - t ** 4 / (12 * b ** 4))); }
    case 'T': return (p.bf * p.tf ** 3 + (p.d - p.tf / 2) * p.tw ** 3) / 3;
    case 'POLY': {
      // a section known only by its outline (an IFC arbitrary profile): an estimate, said in the report. Compact shapes:
      // J ≈ A⁴ / (40 Ip) (Saint-Venant's approximation for solid sections; a circle comes out 1.3 % low); thin-walled ones
      // (A / perimeter² under 0.02): J ≈ A t² / 3 with t = A / (perimeter / 2), the open-section formula on the mid-line
      const s = polySection(p.loops);
      const per = p.loops.reduce((sum, l) => sum + l.reduce((q, pt, i) => q + Math.hypot(l[(i + 1) % l.length][0] - pt[0], l[(i + 1) % l.length][1] - pt[1]), 0), 0);
      if (s.A / (per * per) < 0.02) { const t = s.A / (per / 2); return s.A * t * t / 3; }
      return s.A ** 4 / (40 * (s.Iyy + s.Izz));
    }
    default: return NaN;
  }
}

/**
 * Section properties for the analysis from a section drawn in (u, v) — v the depth (DetailCraft's profiles; a member's
 * local y = u, local z = v). Symmetric sections: Iy = ∫ v² dA (the strong axis of a beam), Iz = ∫ u² dA, roll 0. A section
 * whose u, v are not principal (an angle) is analysed on its principal axes: Iy = I1, Iz = I2 and roll = the turn of the
 * principal axes, so loads in local directions follow those axes (said in the report).
 */
export function sectionOf(p, name = p.name) {
  const s = polySection(p.loops);
  const J = torsionJ(p);
  const A = Number.isFinite(p.area) && p.area > 0 ? p.area : s.A;     // the exact area (arcs exact) where the profile has one
  if (!s.angle) return { name, A, Iy: s.Iyy, Iz: s.Izz, J, roll: 0 };
  // the I1 axis is at `angle` from +u; local y must lie along it so that Iy (bending about y) = I1
  return { name, A, Iy: s.I1, Iz: s.I2, J, roll: s.angle };
}
