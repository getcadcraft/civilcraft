/* SPDX-License-Identifier: Apache-2.0 */
/**
 * layout.js — trusses along a roof (DOM-free; pure; plan mm).
 *   layoutTrusses(outline, { spacing, ridge: 'auto' | 'x' | 'y' | degrees, inset, gables, minSpan }) →
 *     { ok, ridgeDir: [ux, uy], spanDir: [vx, vy], trusses: [{ id, u, v0, v1, span, a: [x, y], b: [x, y], end }], spacing (actual), groups: [{ span, ids }],
 *       issues: [{ code, vars }] } | { ok: false, error }
 * outline: the building's outer faces (the roof's own plan outline, one polygon). The ridge runs along the longest side unless told; the trusses span
 * across it, one at each end and the rest at no more than `spacing`. For an outline that is not a rectangle each station is cut by the polygon and every
 * stretch inside gets its truss: valleys, hips and the girder / jack trusses they need are NOT made (an issue says so).
 */
const norm = (v) => { const l = Math.hypot(v[0], v[1]) || 1; return [v[0] / l, v[1] / l]; };

export function polyArea(p) { let s = 0; for (let i = 0; i < p.length; i++) { const a = p[i], b = p[(i + 1) % p.length]; s += a[0] * b[1] - a[1] * b[0]; } return s / 2; }

function longestEdge(poly) {
  let best = null;
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i], b = poly[(i + 1) % poly.length], l = Math.hypot(b[0] - a[0], b[1] - a[1]);
    if (!best || l > best.l) best = { l, i, d: norm([b[0] - a[0], b[1] - a[1]]) };
  }
  return best;
}

/** The v values where the line u = u0 crosses the polygon, sorted (u, v in the frame of ridge direction ru and span direction rv). */
function crossings(P, u0) {
  const xs = [];
  for (let i = 0; i < P.length; i++) {
    const a = P[i], b = P[(i + 1) % P.length];
    if ((a[0] <= u0 && b[0] > u0) || (b[0] <= u0 && a[0] > u0)) xs.push(a[1] + ((u0 - a[0]) / (b[0] - a[0])) * (b[1] - a[1]));
  }
  return xs.sort((p, q) => p - q);
}

export function layoutTrusses(outline, { spacing = 600, ridge = 'auto', inset = 19, gables = null, minSpan = 1500 } = {}) {
  if (!Array.isArray(outline) || outline.length < 3 || Math.abs(polyArea(outline)) < 1e6) return { ok: false, error: 'outline' };
  if (!(spacing >= 200 && spacing <= 3000)) return { ok: false, error: 'spacing' };
  const poly = polyArea(outline) < 0 ? [...outline].reverse() : outline.map((q) => [q[0], q[1]]);
  const le = longestEdge(poly);
  let ru;
  if (ridge === 'x') ru = [1, 0]; else if (ridge === 'y') ru = [0, 1];
  else if (Number.isFinite(Number(ridge)) && ridge !== 'auto' && ridge !== '') { const a = Number(ridge) * Math.PI / 180; ru = [Math.cos(a), Math.sin(a)]; } else ru = le.d;
  const rv = [-ru[1], ru[0]];
  const P = poly.map((q) => [q[0] * ru[0] + q[1] * ru[1], q[0] * rv[0] + q[1] * rv[1]]);
  const u0 = Math.min(...P.map((q) => q[0])), u1 = Math.max(...P.map((q) => q[0]));
  const L = u1 - u0 - 2 * inset;
  if (L <= 0) return { ok: false, error: 'outline' };
  const n = Math.max(1, Math.ceil(L / spacing)), step = L / n, issues = [];
  const trusses = [];
  let k = 0;
  for (let i = 0; i <= n; i++) {
    const u = u0 + inset + i * step, xs = crossings(P, u + (i === 0 ? 1e-3 : i === n ? -1e-3 : 0));
    for (let j = 0; j + 1 < xs.length; j += 2) {
      const v0 = xs[j], v1 = xs[j + 1], span = v1 - v0;
      if (span < minSpan) continue;
      k++;
      const w = (v) => [u * ru[0] + v * rv[0], u * ru[1] + v * rv[1]];
      trusses.push({ id: 'T' + k, u: Math.round(u * 10) / 10, v0, v1, span: Math.round(span), a: w(v0).map((x) => Math.round(x * 10) / 10), b: w(v1).map((x) => Math.round(x * 10) / 10), end: i === 0 || i === n });
    }
  }
  if (!trusses.length) return { ok: false, error: 'outline' };
  const groups = [];
  for (const t of trusses) { const g = groups.find((x) => Math.abs(x.span - t.span) <= 1); if (g) g.ids.push(t.id); else groups.push({ span: t.span, ids: [t.id] }); }
  // a rectangle gives one span (to a millimetre); anything else is flagged
  const rect = polyArea(poly) > 0 && Math.abs(Math.abs(polyArea(P)) - (u1 - u0) * (Math.max(...P.map((q) => q[1])) - Math.min(...P.map((q) => q[1])))) < 1e4;
  if (!rect) issues.push({ code: 'notrect', vars: { spans: groups.length } });
  else if (Array.isArray(gables)) {
    // the roof's gable edges are numbered by the outline's edges; the two ends across the ridge must both be gables for a pure gable roof
    const ends = poly.map((a, i) => { const b = poly[(i + 1) % poly.length]; return Math.abs((b[0] - a[0]) * ru[0] + (b[1] - a[1]) * ru[1]) < 1e-3 * Math.hypot(b[0] - a[0], b[1] - a[1]) ? i : -1; }).filter((i) => i >= 0);
    if (!ends.every((i) => gables.includes(i))) issues.push({ code: 'hip', vars: {} });
  }
  if (groups.some((g) => g.span > 12000)) issues.push({ code: 'longspan', vars: { span: Math.max(...groups.map((g) => g.span)) } });
  return { ok: true, ridgeDir: ru, spanDir: rv, trusses, spacing: Math.round(step * 10) / 10, groups, issues, count: trusses.length };
}
