/* SPDX-License-Identifier: Apache-2.0 */
/**
 * vessel2.js — external pressure from the chart factors, stiffening rings, the head profile for a body, nozzle placement (0.8 Track CH, CH.9; DOM-free).
 * A drafting and study aid, "to be checked by an engineer" (O7): NOT an engineering approval, no U-stamp.
 *   externalPressure({ Do, t, A, curve })   the allowable external pressure of a cylinder from the geometry factor A (read from the chart by the caller) and the
 *       material chart curve (the caller's pairs [[A, B (MPa)], …] for the design temperature, from the book): Pa = 4B / (3 Do/t) (UG-28(c)); left of the curve
 *       Pa = 2 A E / (3 Do/t). The charts themselves are NOT built in (NEEDS A SOURCE: ASME II-D Subpart 3 charts).
 *   stiffeningRing({ Do, Ls, t, As, A })     the required moment of inertia of a ring, Is = Do² Ls (t + As/Ls) A / 14 (UG-29), and the available one for a given section.
 *   bodyProfile(spec)                        the revolved outline [r, z] (mm) of a vessel: shell and two heads; for a PartCraft body, a BimCraft equipment shape or a drawing.
 *   nozzleOnBody(body, nozzle)               where a nozzle sits (position, axis) on the shell or a head, for placement.
 */
export const NEEDS_SOURCE = 'ASME BPVC Section II Part D Subpart 3 (external-pressure charts, Figure G and the material charts) and UG-28 to UG-30; type the pairs [A, B] for the material and temperature yourself.';

export function externalPressure({ Do, t, A, curve = null, E = null }) {
  const ratio = Do / t, notes = [];
  if (!(Do > 0 && t > 0 && A > 0)) throw new Error('give Do, t and the chart factor A');
  if (!Array.isArray(curve) || curve.length < 2) {
    if (E) return { Pa: 2 * A * E / (3 * ratio), B: null, region: 'elastic', notes: ['elastic range assumed (left of the curve) with the given E; give the material chart curve for the real answer'], needsSource: NEEDS_SOURCE };
    return { Pa: null, B: null, notes: ['give the material chart curve [[A, B], …] for the design temperature (or E for the elastic line)'], needsSource: NEEDS_SOURCE };
  }
  const pts = curve.slice().sort((a, b) => a[0] - b[0]);
  if (A <= pts[0][0]) {
    if (!E) return { Pa: null, B: null, notes: ['A is left of the curve: give E (the modulus at the temperature) for Pa = 2AE/(3 Do/t)'], needsSource: NEEDS_SOURCE };
    return { Pa: 2 * A * E / (3 * ratio), B: null, region: 'elastic', notes, source: 'ASME VIII-1 UG-28(c)(2)' };
  }
  if (A >= pts[pts.length - 1][0]) { notes.push('A is beyond the last chart point: the last B is used (flat)'); return { Pa: 4 * pts[pts.length - 1][1] / (3 * ratio), B: pts[pts.length - 1][1], region: 'chart', notes, source: 'ASME VIII-1 UG-28(c)(1)' }; }
  for (let k = 0; k + 1 < pts.length; k++) if (A >= pts[k][0] && A <= pts[k + 1][0]) {
    const f = (Math.log(A) - Math.log(pts[k][0])) / (Math.log(pts[k + 1][0]) - Math.log(pts[k][0])), B = pts[k][1] + f * (pts[k + 1][1] - pts[k][1]);
    return { Pa: 4 * B / (3 * ratio), B, region: 'chart', notes, source: 'ASME VIII-1 UG-28(c)(1)' };
  }
  return { Pa: null, B: null, notes: ['chart not readable'], needsSource: NEEDS_SOURCE };
}
export function stiffeningRing({ Do, Ls, t, As, A, Is = null }) {
  const req = Do * Do * Ls * (t + As / Ls) * A / 14;
  return { Is_required: req, ok: Is == null ? null : Is >= req, source: 'ASME VIII-1 UG-29(a), Is = Do² Ls (t + As/Ls) A / 14', notes: Is == null ? ['give the ring section moment of inertia Is to check it'] : [] };
}

const arc = (cx, cz, r, a0, a1, n) => Array.from({ length: n + 1 }, (_, i) => { const a = a0 + (a1 - a0) * i / n; return [cx + r * Math.cos(a), cz + r * Math.sin(a)]; });
/** Head outline from the axis out to the tangent line, z measured from the tangent line outward (mm). type: 'hemispherical' | 'ellipsoidal' (ratio, default 2) | 'torispherical' (crownR, knuckleR). */
export function headOutline({ type = 'ellipsoidal', D, ratio = 2, crownR = null, knuckleR = null, n = 24 }) {
  const R = D / 2;
  if (type === 'hemispherical') return arc(0, 0, R, Math.PI / 2, 0, n);
  if (type === 'ellipsoidal') { const h = R / ratio; return Array.from({ length: n + 1 }, (_, i) => { const a = Math.PI / 2 * (1 - i / n); return [R * Math.cos(a), h * Math.sin(a)]; }); }
  if (type === 'torispherical') {
    if (!(crownR > 0 && knuckleR > 0)) throw new Error('a torispherical head needs the crown radius and the knuckle radius');
    return torisph(R, crownR, knuckleR, n);
  }
  throw new Error('unknown head type ' + type);
}
function torisph(R, Rc, rk, n) {                                   // z = 0 at the tangent line, the crown apex is the top
  const c = R - rk, zk = 0, dz = Math.sqrt(Math.max((Rc - rk) ** 2 - c * c, 0));
  if (!(Rc > rk && Rc >= R)) throw new Error('torispherical head: the crown radius must exceed the knuckle radius and the shell radius');
  const Cz = -dz;                                                    // crown centre; knuckle centre K = (c, 0)
  const ang = Math.atan2(dz, c);                                     // direction C -> K, also the junction angle at K
  const aj = Math.atan2(zk - Cz + rk * Math.sin(ang), c + rk * Math.cos(ang));
  const out = [];
  for (let i = 0; i <= n; i++) { const a = Math.PI / 2 - (Math.PI / 2 - aj) * (i / n); out.push([Rc * Math.cos(a), Cz + Rc * Math.sin(a)]); }
  for (let i = 1; i <= n; i++) { const a = ang - ang * (i / n); out.push([c + rk * Math.cos(a), rk * Math.sin(a)]); }
  return out;
}
/** Revolved outline: spec { D (inside, mm), t (shell thickness), Ltt (tangent-to-tangent), head: { type, ratio, crownR, knuckleR }, orientation } → { profile: [[r, z], …] (inside surface, z from the bottom head apex), tangents: [z1, z2], height, volume (m3, inside) }. */
export function bodyProfile(spec) {
  const { D, Ltt } = spec, hd = spec.head || { type: 'ellipsoidal' }, out = headOutline({ ...hd, D });
  const depth = Math.max(...out.map((p) => p[1])), z1 = depth, z2 = depth + Ltt, prof = [];
  for (const [r, z] of out) prof.push([r, z1 - z]);                                          // bottom head: apex at z = 0, tangent at z1
    for (const [r, z] of out.slice().reverse()) prof.push([r, z2 + z]);                       // top head: tangent to apex
  // volume of the revolved outline by the trapezoid rule on pi r² dz
  let V = 0; for (let i = 0; i + 1 < prof.length; i++) { const [r1, za] = prof[i], [r2, zb] = prof[i + 1]; V += Math.PI * (r1 * r1 + r1 * r2 + r2 * r2) / 3 * (zb - za); }
  return { profile: prof, tangents: [z1, z2], height: z2 + depth, headDepth: depth, volume: Math.abs(V) * 1e-9, notes: ['inside surface only; thickness is added by the host'] };
}
export function nozzleOnBody(body, { at, angle = 0, onHead = null, D }) {
  const R = Math.max(...body.profile.map((p) => p[0]));
  if (!onHead) { const z = body.tangents[0] + at; return { position: [R * Math.cos(angle * Math.PI / 180), R * Math.sin(angle * Math.PI / 180), z], axis: [Math.cos(angle * Math.PI / 180), Math.sin(angle * Math.PI / 180), 0], D }; }
  const z = onHead === 'top' ? body.height : 0; return { position: [0, 0, z], axis: [0, 0, onHead === 'top' ? 1 : -1], D };
}
