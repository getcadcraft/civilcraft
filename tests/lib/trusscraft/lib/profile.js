/* SPDX-License-Identifier: Apache-2.0 */
/**
 * profile.js — a truss from a roof profile (DOM-free; pure), and the profile of the roof along a line (DOM-free; takes BimCraft's roof plan).
 *   sectionProfile(plan, P0, P1) → [[x, z], ...]   the roof's underside along the plan line P0 → P1 (x = distance from P0, z above the wall plate)
 *   profileTruss({ span, profile, panels, extra, overhangL, overhangR, form }) → the same frame shape generate() gives, or { ok: false, error }
 *   classify(profile) → { peaks, flats, notches, symmetric, apex, ... }   what the profile is, in words the layout uses
 * Frame: the bottom chord is straight at z = 0 from x = 0 to x = span; the top chord follows the profile (its centre-line on the roof's underside);
 * a post stands at each station where the top chord is above the bottom chord; one diagonal in every panel except those that close at a heel
 * (where the top chord meets the bottom chord), falling toward the middle of the span. That is m + 3 = 2 n for any profile: a pin-jointed,
 * statically determinate frame, which analysis.solve() proves again (a singular matrix is reported, never ignored).
 */
const TOL = 0.5;
const D2R = Math.PI / 180;

function inPoly(x, y, p) {
  let inside = false;
  for (let i = 0, j = p.length - 1; i < p.length; j = i++) {
    const [xi, yi] = p[i], [xj, yj] = p[j];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

/** The height of a roof face's plane over p (the skeleton's own formula: start + (n·p − c) / speed). */
const faceZ = (f, p) => f.start + (f.n[0] * p[0] + f.n[1] * p[1] - f.c) / f.speed;

/** The roof's underside along P0 → P1 as a polyline [x, z] (x from P0). Exact: every face's polygon is cut by the line. */
export function sectionProfile(plan, P0, P1) {
  const dx = P1[0] - P0[0], dy = P1[1] - P0[1], L = Math.hypot(dx, dy);
  if (!(L > 1)) return [];
  const at = (t) => [P0[0] + dx * t, P0[1] + dy * t];
  const pieces = [];
  for (const f of plan.faces) {
    const poly = f.poly, ts = [0, 1];
    for (let i = 0; i < poly.length; i++) {
      const A = poly[i], B = poly[(i + 1) % poly.length], ex = B[0] - A[0], ey = B[1] - A[1], den = dx * ey - dy * ex;
      if (Math.abs(den) < 1e-12) continue;
      const t = ((A[0] - P0[0]) * ey - (A[1] - P0[1]) * ex) / den, s = ((A[0] - P0[0]) * dy - (A[1] - P0[1]) * dx) / den;
      if (t > 0 && t < 1 && s >= -1e-9 && s <= 1 + 1e-9) ts.push(t);
    }
    ts.sort((a, b) => a - b);
    for (let i = 0; i + 1 < ts.length; i++) {
      const t0 = ts[i], t1 = ts[i + 1];
      if (t1 - t0 < 1e-9) continue;
      const m = at((t0 + t1) / 2);
      if (inPoly(m[0], m[1], poly)) pieces.push({ t0, t1, z0: faceZ(f, at(t0)), z1: faceZ(f, at(t1)), f });
    }
  }
  if (!pieces.length) return [];
  const bk = [...new Set(pieces.flatMap((p) => [p.t0, p.t1]))].sort((a, b) => a - b);
  const pts = [];
  for (let i = 0; i + 1 < bk.length; i++) {
    const a = bk[i], b = bk[i + 1];
    if (b - a < 1e-9) continue;
    const mid = (a + b) / 2;
    let best = null;
    for (const p of pieces) if (p.t0 <= mid && p.t1 >= mid) { const z = p.z0 + ((p.z1 - p.z0) * (mid - p.t0)) / (p.t1 - p.t0); if (!best || z > best.z) best = { p, z }; }
    if (!best) continue;
    const z = (t) => best.p.z0 + ((best.p.z1 - best.p.z0) * (t - best.p.t0)) / (best.p.t1 - best.p.t0);
    if (!pts.length || Math.abs(pts[pts.length - 1][0] - a * L) > 1e-6 || Math.abs(pts[pts.length - 1][1] - z(a)) > 0.5) pts.push([a * L, z(a)]);
    pts.push([b * L, z(b)]);
  }
  return simplify(pts);
}

/** Drop the middle point of three that lie on one line (within 0.5 mm in z), and repeated points. */
export function simplify(pts) {
  const out = [];
  for (const p of pts) {
    if (out.length && Math.abs(out[out.length - 1][0] - p[0]) < 1e-6 && Math.abs(out[out.length - 1][1] - p[1]) < 0.5) continue;
    out.push([p[0], p[1]]);
    while (out.length >= 3) {
      const [a, b, c] = out.slice(-3);
      const zl = a[1] + ((c[1] - a[1]) * (b[0] - a[0])) / (c[0] - a[0] || 1);
      if (Math.abs(zl - b[1]) < 0.5) out.splice(out.length - 2, 1); else break;
    }
  }
  return out;
}

export const heightIn = (pts, x) => {
  if (x <= pts[0][0]) return pts[0][1];
  for (let i = 0; i + 1 < pts.length; i++) {
    const [x0, z0] = pts[i], [x1, z1] = pts[i + 1];
    if (x <= x1 + 1e-9) return x1 - x0 < 1e-9 ? z1 : z0 + ((z1 - z0) * (x - x0)) / (x1 - x0);
  }
  return pts[pts.length - 1][1];
};

/** What a profile is: how many peaks, whether it has a flat top, a notch (a valley across the line), whether it is the symmetric triangle. */
export function classify(pts) {
  const n = pts.length, S = pts[n - 1][0] - pts[0][0];
  const seg = pts.slice(1).map((p, i) => ({ x0: pts[i][0], x1: p[0], z0: pts[i][1], z1: p[1], dz: p[1] - pts[i][1], len: p[0] - pts[i][0] }));
  const flats = seg.filter((s) => Math.abs(s.dz) < 0.5 && s.len > 50);
  let notches = 0;
  for (let i = 1; i + 1 < n; i++) if (pts[i][1] < pts[i - 1][1] - 0.5 && pts[i][1] < pts[i + 1][1] - 0.5) notches++;
  // a "notch" also where the profile falls then rises again after a flat
  const dirs = seg.filter((s) => Math.abs(s.dz) >= 0.5).map((s) => Math.sign(s.dz));
  let changes = 0;
  for (let i = 1; i < dirs.length; i++) if (dirs[i] !== dirs[i - 1]) changes++;
  const apex = Math.max(...pts.map((p) => p[1])), apexAt = pts.filter((p) => p[1] >= apex - 0.5).map((p) => p[0]);
  const triangle = n === 3 && pts[0][1] < 0.5 && pts[2][1] < 0.5 && Math.abs(pts[1][0] - S / 2) < 2;
  return { n, span: S, apex, apexAt, flats, notches: changes > 2 ? Math.floor(changes / 2) : 0, vertexNotches: notches, triangle, endsLow: pts[0][1] < 0.5 && pts[n - 1][1] < 0.5, symmetric: isSymmetric(pts) };
}
function isSymmetric(pts) {
  const S = pts[pts.length - 1][0];
  return pts.every((p) => Math.abs(heightIn(pts, S - p[0]) - p[1]) < 1);
}

/** Frame from a profile. See the file header. spec: { span, profile: [[x, z]...] from x = 0 to span, panels (0 = about 1.2 m), extra: [x...] stations to force, overhangL, overhangR, form }. */
export function profileTruss(spec = {}) {
  const S = Number(spec.span), prof = (spec.profile || []).map((p) => [Number(p[0]), Number(p[1])]);
  if (!(S >= 600 && S <= 30000) || prof.length < 2 || prof.some((p) => !Number.isFinite(p[0]) || !Number.isFinite(p[1]) || p[1] < -TOL)) return { ok: false, error: 'profile' };
  if (Math.abs(prof[0][0]) > 1 || Math.abs(prof[prof.length - 1][0] - S) > 1) return { ok: false, error: 'profile' };
  prof[0][0] = 0; prof[prof.length - 1][0] = S;
  const apex = Math.max(...prof.map((p) => p[1]));
  if (apex < 120) return { ok: false, error: 'low' };
  const h = (x) => heightIn(prof, x);
  // stations: the profile's own vertices and the forced ones first, then an even spacing between
  const hard = [0, S, ...prof.map((p) => p[0]), ...(spec.extra || []).map(Number).filter((x) => x > 0 && x < S)].sort((a, b) => a - b);
  const keep = [];
  for (const x of hard) if (!keep.length || x - keep[keep.length - 1] > 60) keep.push(x);
  const N0 = spec.panels > 0 ? Math.round(spec.panels) : Math.round(S / 1200);
  const n0 = Math.max(2, Math.min(24, N0));
  const xs = [...keep];
  for (let i = 1; i < n0; i++) {
    const x = (S * i) / n0;
    if (xs.every((k) => Math.abs(k - x) > Math.max(150, S / (2 * n0)))) xs.push(x);
  }
  xs.sort((a, b) => a - b);
  const nodes = [], members = [];
  const node = (x, z) => { const f = nodes.find((n) => Math.abs(n.x - x) < TOL && Math.abs(n.z - z) < TOL); if (f) return f.id; nodes.push({ id: nodes.length, x, z }); return nodes.length - 1; };
  const add = (role, a, b) => {
    if (a === b) return;
    const A = nodes[a], B = nodes[b], len = Math.hypot(B.x - A.x, B.z - A.z);
    if (len < 1 || members.some((m) => (m.a === a && m.b === b) || (m.a === b && m.b === a))) return;
    members.push({ id: members.length, role, a, b, len, angle: (Math.abs(Math.atan2(B.z - A.z, B.x - A.x)) * 180) / Math.PI });
  };
  const Bn = xs.map((x) => node(x, 0)), Tn = xs.map((x, i) => (h(x) < 2 ? Bn[i] : node(x, h(x))));
  for (let i = 0; i + 1 < xs.length; i++) { add('bottom', Bn[i], Bn[i + 1]); add('top', Tn[i], Tn[i + 1]); }
  for (let i = 0; i < xs.length; i++) if (Tn[i] !== Bn[i]) add('post', Bn[i], Tn[i]);
  for (let i = 0; i + 1 < xs.length; i++) {
    if (Tn[i] === Bn[i] || Tn[i + 1] === Bn[i + 1]) continue;   // a panel that closes at a heel is already a triangle
    const mid = (xs[i] + xs[i + 1]) / 2;
    if (mid <= S / 2 + 1) add('web', Tn[i], Bn[i + 1]); else add('web', Tn[i + 1], Bn[i]);
  }
  const slopeAt = (i, j) => (h(xs[j]) - h(xs[i])) / (xs[j] - xs[i]);
  const shL = Tn[0] === Bn[0], shR = Tn[xs.length - 1] === Bn[xs.length - 1];
  const tanL = slopeAt(0, 1), tanR = -slopeAt(xs.length - 2, xs.length - 1);
  const ohL = Math.max(0, Number(spec.overhangL) || 0), ohR = Math.max(0, Number(spec.overhangR) || 0);
  if (ohL > 0 && shL && tanL > 0.02) add('tail', node(-ohL, -ohL * tanL), Bn[0]);
  if (ohR > 0 && shR && tanR > 0.02) add('tail', node(S + ohR, -ohR * tanR), Bn[xs.length - 1]);
  const maxSlope = Math.max(...prof.slice(1).map((p, i) => Math.abs(p[1] - prof[i][1]) / Math.max(1e-9, p[0] - prof[i][0])));
  const pitch = (Math.atan(shL ? tanL : maxSlope) / D2R);
  const notes = [];
  if (!shL || !shR) notes.push('an end stands on a post: the roof is above the bearing there');
  return { ok: true, type: spec.form || 'profile', form: spec.form || 'profile', span: S, pitch, pitchR: Math.atan(shR ? tanR : maxSlope) / D2R, overhang: ohL, nodes, members, supports: [Bn[0], Bn[xs.length - 1]], notes, rise: apex, profile: prof, stations: xs, flatTop: prof.some((p, i) => i > 0 && Math.abs(p[1] - prof[i - 1][1]) < 0.5 && p[0] - prof[i - 1][0] > 50) };
}
