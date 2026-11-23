/* SPDX-License-Identifier: Apache-2.0 */
/**
 * ugr.js — the unified glare rating (0.9 LD.4). DOM-free.  UGR = 8 · log10( 0.25 / Lb · Σ L² ω / p² )  (CIE 117, the formula EN 12464-1 names),
 *   Lb  = background luminance = indirect illuminance at the eye / π      (from the inter-reflection solution)
 *   L   = luminance of a luminaire seen from the eye = I(γ, C) / projected luminous area      (a flat luminous face at the luminaire's opening; the area comes from the file)
 *   ω   = solid angle of the luminous area at the eye = projected area / r²
 *   p   = Guth position index, from Einhorn's closed formula in σ (angle between line of sight and the source) and τ (how far the source is out of the vertical plane through the line of sight).
 * An ESTIMATE: it uses the luminaire's real candela and opening, not the maker's own UGR table. Initial flux (the maintenance factor is not applied). Observers: eye height
 * 1.2 m (seated), at the middle of each side of the room's bounding box, 0.5 m in, looking along the room axes; the worst is the figure. Compare with the maker's table.
 */
import { candela, frame } from './photometry.js';
import { indirectAt, bbox } from './calc.js';

const deg = (r) => r * 180 / Math.PI;
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
/** Guth position index (Einhorn 1969): σ and τ in degrees. 1 on the line of sight; larger for a source higher in the field of view. */
export function positionIndex(sigma, tau) {
  const s = Math.min(sigma, 90);
  return Math.exp((35.2 - 0.31889 * tau - 1.22 * Math.exp(-2 * tau / 9)) * 1e-3 * s + (21 + 0.26667 * tau - 0.002963 * tau * tau) * 1e-5 * s * s);
}
/** UGR for one eye at [x, y, z] mm looking along the unit vector `dir` (horizontal). */
export function ugrFor(prep, sol, luminaires, eye, dir) {
  const Eind = Math.max(indirectAt(prep, sol, eye, dir), 1e-6), Lb = Eind / Math.PI;
  let sum = 0, used = 0;
  const up = [0, 0, 1], upPerp = [up[0] - dot(up, dir) * dir[0], up[1] - dot(up, dir) * dir[1], up[2] - dot(up, dir) * dir[2]], upLen = Math.hypot(...upPerp) || 1;
  for (const L of luminaires) {
    const v = [(L.p[0] - eye[0]) / 1000, (L.p[1] - eye[1]) / 1000, (L.p[2] - eye[2]) / 1000], r = Math.hypot(...v);
    if (r < 0.05) continue;
    const cs = dot(v, dir) / r;
    if (cs <= 0.0872) continue;                                   // more than 85° off the line of sight: outside the field of view
    const sigma = deg(Math.acos(Math.min(1, cs)));
    const f = L.f || (L.f = frame(L.aim, L.rot)), u = [-v[0] / r, -v[1] / r, -v[2] / r];   // from the luminaire to the eye
    const cg = Math.max(-1, Math.min(1, dot(u, f.n))), gamma = deg(Math.acos(cg));
    if (gamma >= 88) continue;
    const c = deg(Math.atan2(dot(u, f.s), dot(u, f.r)));
    const I = candela(L.photo, gamma, c) * (L.scale ?? 1);
    if (!(I > 0)) continue;
    const w = L.photo.width > 0 && L.photo.length > 0 ? (L.photo.width * L.photo.length) / 1e6 : 0.01;   // luminous opening m² (0.1 × 0.1 m when the file gives none)
    const Ap = w * Math.max(cg, 0.05), Lum = I / Ap, omega = Ap / (r * r);
    const wv = [v[0] - cs * r * dir[0], v[1] - cs * r * dir[1], v[2] - cs * r * dir[2]], wl = Math.hypot(...wv);
    const tau = wl < 1e-6 ? 0 : deg(Math.acos(Math.max(-1, Math.min(1, (dot(wv, upPerp) / upLen) / wl))));
    const p = positionIndex(sigma, tau);
    sum += Lum * Lum * omega / (p * p); used++;
  }
  if (!(sum > 0)) return { ugr: 0, used };
  return { ugr: Math.max(0, 8 * Math.log10(0.25 / Lb * sum)), used, Lb };
}
/** The worst UGR over the four standard observers (and each one's value). → { ugr (worst, 1 decimal), observers: [{ eye, dir, ugr }] } */
export function ugrRoom(prep, sol, luminaires, { eyeHeight = 1200 } = {}) {
  const bb = bbox(prep.room.polygon), W = bb.x1 - bb.x0, D = bb.y1 - bb.y0, ix = Math.min(500, W * 0.2), iy = Math.min(500, D * 0.2), mx = (bb.x0 + bb.x1) / 2, my = (bb.y0 + bb.y1) / 2;
  const obs = [[[bb.x0 + ix, my, eyeHeight], [1, 0, 0]], [[bb.x1 - ix, my, eyeHeight], [-1, 0, 0]], [[mx, bb.y0 + iy, eyeHeight], [0, 1, 0]], [[mx, bb.y1 - iy, eyeHeight], [0, -1, 0]]];
  const rows = obs.map(([eye, dir]) => ({ eye, dir, ugr: Math.round(ugrFor(prep, sol, luminaires, eye, dir).ugr * 10) / 10 }));
  return { ugr: Math.max(...rows.map((r) => r.ugr)), observers: rows };
}
