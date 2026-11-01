/* SPDX-License-Identifier: Apache-2.0 */
/**
 * turnout.js — railway turnouts, crossovers and clearance envelopes (0.8 CV.1, on rail.js's cant and track shape). No DOM, no strings, no imports. Lengths in
 * the caller's unit except where a name says mm; speeds km/h. Tested by bin/test-civilcraft-turnout.mjs. Every limit is a PLACEHOLDER the user sets from their
 * railway's standard (docs/spikes/CV.1-rail.md): the geometry below is the plan of a turnout, not a manufacturer's drawing, and a built turnout follows that drawing.
 *
 * Published maths (nothing copied; Hay, Railroad Engineering, ch. 7; Profillidis, Railway Management and Engineering, ch. on turnouts):
 *  - Frog number N is half the cotangent of half the frog angle: N = ½·cot(θ/2), so θ = 2·atan(1/(2N)).
 *  - A straight switch of length s at the switch angle β, then a circular closure of radius R to the theoretical frog point, where the diverging track is the
 *    gauge g off the straight track and leaves at the frog angle θ:  g = s·sinβ + R·(cosβ − cosθ),  lead L = s·cosβ + R·(sinθ − sinβ). Here the diverging track
 *    is its centreline and the offset g is the centre-to-centre spacing at the frog point (gauge, as the rails meet there).
 *  - Crossover between parallel tracks c apart: two leads and a straight at θ between: c = 2g + t·sinθ.
 *  - Speed on the diverging route: the equilibrium speed on a curve of radius R with cant E (mm) and cant deficiency D (mm): V = √(R·(E + D) / (G/g_acc)) in the
 *    usual form V(km/h) = √(R(m)·(E + D)(mm) / 11.8) with the rail-centre distance 1500 mm.
 *  - Curve clearance (versine of a chord): a vehicle of overall length L on bogie centres b: the middle moves in b²/(8R), the ends out (L² − b²)/(8R).
 *
 *   frogAngle(n) / frogNumber(theta)
 *   turnout({ n, gauge, switchLength, switchAngle, side: 'L'|'R', step }) → { theta, R, lead, tfp: {x,y}, heel, centre: [{x,y}], length }     x along the main track from the switch toe, y toward `side`
 *   crossover({ n, gauge, switchLength, switchAngle, spacing }) → { turnout, straight, length, ok }
 *   divergingSpeed(R, { cant = 0, deficiency = 100, rail = 1500 }) → km/h
 *   curveAllowance({ radius, length, bogie }) → { inside, outside }
 *   envelopeAt({ outline: [{o,z}], radius, cant, base, length, bogie, curve: 'L'|'R' }) → polygon [{o,z}]
 *   clashes(polygon, obstacles[{pts|poly}]) → indexes;  minSpacing(polyA, polyB) → the least track-centre spacing at which two envelopes do not overlap
 */
export const frogAngle = (n) => 2 * Math.atan(1 / (2 * n));
export const frogNumber = (theta) => 0.5 / Math.tan(theta / 2);

export function turnout({ n, gauge = 1.435, switchLength = 6.1, switchAngle = null, side = 'L', step = 0.25, heelSpread = null }) {
  const theta = frogAngle(n);
  const beta = switchAngle !== null ? switchAngle : heelSpread !== null ? Math.asin(heelSpread / switchLength) : 0.0143;   // placeholder switch angle (≈ 0°49′)
  const denom = Math.cos(beta) - Math.cos(theta);
  if (!(gauge > switchLength * Math.sin(beta)) || !(denom > 0) || beta >= theta) return { ok: false, problems: [{ code: 'tur.geometry', theta, beta }] };
  const R = (gauge - switchLength * Math.sin(beta)) / denom, lead = switchLength * Math.cos(beta) + R * (Math.sin(theta) - Math.sin(beta));
  const sg = side === 'R' ? -1 : 1, pts = [{ x: 0, y: 0 }];
  const ns = Math.max(1, Math.ceil(switchLength / step));
  for (let i = 1; i <= ns; i++) { const s = (switchLength * i) / ns; pts.push({ x: s * Math.cos(beta), y: sg * s * Math.sin(beta) }); }
  const hx = switchLength * Math.cos(beta), hy = switchLength * Math.sin(beta), arc = R * (theta - beta), na = Math.max(2, Math.ceil(arc / step));
  for (let i = 1; i <= na; i++) { const a = beta + ((theta - beta) * i) / na; pts.push({ x: hx + R * (Math.sin(a) - Math.sin(beta)), y: sg * (hy + R * (Math.cos(beta) - Math.cos(a))) }); }
  const tfp = pts[pts.length - 1];
  return { ok: true, n, theta, beta, R, lead, tfp, heel: { x: hx, y: sg * hy }, centre: pts, length: switchLength + arc, side, gauge, problems: [] };
}

export function crossover({ spacing, ...o }) {
  const t = turnout(o); if (!t.ok) return { ok: false, turnout: t, problems: t.problems };
  const straight = (spacing - 2 * t.gauge) / Math.sin(t.theta);
  return { ok: straight >= 0, turnout: t, straight, length: 2 * t.lead + straight * Math.cos(t.theta), spacing, problems: straight >= 0 ? [] : [{ code: 'tur.spacing', min: 2 * t.gauge }] };
}

export function divergingSpeed(R, { cant = 0, deficiency = 100, rail = 1500 } = {}) { return Math.sqrt((R * (cant + deficiency)) / (rail / 127.12)); }   // 1500 mm → 11.8

export function curveAllowance({ radius, length, bogie }) { return { inside: (bogie * bogie) / (8 * radius), outside: (length * length - bogie * bogie) / (8 * radius) }; }

/**
 * The structure gauge or vehicle outline at a station of a curve. `outline` is a polygon in the section: o to the right of the track centre, z above the top of rail.
 * The envelope is tilted about the lower rail by the cant (mm over `base` mm) and the points toward the inside of the curve are pushed in by the inside allowance, those toward the
 * outside pushed out by the outside allowance (the whole vehicle outline: both applied to the side they affect).
 */
export function envelopeAt({ outline, radius = Infinity, cant = 0, base = 1500, length = 0, bogie = 0, curve = 'R', lowRail = null }) {
  const tilt = Math.asin(Math.min(1, cant / base)), cos = Math.cos(tilt), sin = Math.sin(tilt);
  // curve to the right: the cant raises the left rail, so the section tilts to the right (clockwise); the inside of the curve is the right
  const sg = curve === 'R' ? 1 : -1, pivot = lowRail ?? (sg * base / 2);
  const al = Number.isFinite(radius) && length ? curveAllowance({ radius, length, bogie }) : { inside: 0, outside: 0 };
  return outline.map((p) => {
    const dx = p.o - pivot, ro = pivot + dx * cos + sg * p.z * sin, rz = p.z * cos - sg * dx * sin;
    // the allowance moves a point further from the track centre on its own side: toward the curve's centre by the middle's throw, away from it by the ends'
    const toInside = sg * p.o > 0, shift = p.o === 0 ? 0 : toInside ? sg * al.inside : -sg * al.outside;
    return { o: ro + shift, z: rz };
  });
}

const pip = (p, poly) => { let c = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) if ((poly[i].z > p.z) !== (poly[j].z > p.z) && p.o < ((poly[j].o - poly[i].o) * (p.z - poly[i].z)) / (poly[j].z - poly[i].z) + poly[i].o) c = !c; return c; };
const segX = (a, b, c, d) => { const rx = b.o - a.o, rz = b.z - a.z, sx = d.o - c.o, sz = d.z - c.z, den = rx * sz - rz * sx; if (Math.abs(den) < 1e-14) return false; const t = ((c.o - a.o) * sz - (c.z - a.z) * sx) / den, u = ((c.o - a.o) * rz - (c.z - a.z) * rx) / den; return t >= 0 && t <= 1 && u >= 0 && u <= 1; };
export function overlap(A, B) { if (A.some((p) => pip(p, B)) || B.some((p) => pip(p, A))) return true; for (let i = 0; i < A.length; i++) for (let j = 0; j < B.length; j++) if (segX(A[i], A[(i + 1) % A.length], B[j], B[(j + 1) % B.length])) return true; return false; }
export function clashes(poly, obstacles) { const hit = []; obstacles.forEach((o, k) => { if (overlap(poly, o.poly || o.pts || o)) hit.push(k); }); return hit; }
/** Least centre spacing for two envelopes (A to the left, B shifted right) that do not overlap, by bisection. */
export function minSpacing(A, B, hi = 20) {
  const shift = (P, d) => P.map((p) => ({ o: p.o + d, z: p.z }));
  if (overlap(A, shift(B, hi))) return Infinity;
  let lo = 0, up = hi; for (let i = 0; i < 60; i++) { const m = (lo + up) / 2; if (overlap(A, shift(B, m))) lo = m; else up = m; }
  return up;
}
