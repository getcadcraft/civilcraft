/* SPDX-License-Identifier: Apache-2.0 */
/**
 * rc-section.js — a rectangular reinforced concrete section by strain compatibility (0.8 SU.1056 step 3): code-neutral.
 * DOM-free, imports nothing. The code module (rc-aci318.js) supplies the stress-block numbers and the strength reduction.
 *
 * Assumptions (every one said in the report): plane sections stay plane; concrete takes no tension; an equivalent
 * rectangular stress block alpha1·f'c over a depth beta1·c from the compression face; ultimate concrete strain epsCu;
 * steel elastic–perfectly plastic (Es, ±fy); bars inside the stress block take the concrete they displace off (−alpha1·f'c);
 * bars as points (no bar diameter in the section's geometry other than through the positions given).
 *
 * Units mm, N, MPa, N·mm. The section's own axes: y across the width b, z along the depth h, origin at the centre — the same
 * as a frame member's local y, z (frame-model.js), so a member's My (bending about y, > 0 when the −z face is in tension)
 * compresses the +z face.
 *
 *   rectBars({ b, h, top: { n, A, cover }, bottom: { n, A, cover }, side?: { n, A, cover } }) → bars [{ y, z, A }]
 *       beam bars: n bars of area A each in a row at `cover` (to the bar centres) from the top / bottom face, spread between
 *       side covers equal to the row's cover; side bars: n per side face, spaced evenly between the rows
 *   perimeterBars({ b, h, cover, ny, nz, A }) → bars: a column cage, ny bars along each b face, nz along each h face
 *       (corners counted once), cover to the bar centres
 *   layersFor(sec, axis, sign) → { depth, width, layers: [{ d, As }] } for bending about 'y' or 'z' with the compression face
 *       on the + side (sign 1) or the − side (sign −1); d from the compression face, bars at one depth merged
 *   forcesAt(L, c, { fc, fy, Es, alpha1, beta1, epsCu }) → { P (compression +), M (about mid-depth, ≥ 0 compresses the
 *       compression face), a, Cc, steel: [{ d, As, eps, fs, F }], epsT (strain at the deepest layer, tension +), dt }
 *   neutralAxisForP(L, P, mat) → c where forcesAt(…).P = P (bisection; P between pure tension and the c → ∞ limit)
 */

export function rectBars({ b, h, top, bottom, side }) {
  const bars = [];
  const row = (r, z) => {
    if (!r || !(r.n >= 1) || !(r.A > 0)) return;
    const c = r.cover;
    for (let i = 0; i < r.n; i++) bars.push({ y: r.n === 1 ? 0 : -b / 2 + c + (b - 2 * c) * i / (r.n - 1), z, A: r.A });
  };
  if (top) row(top, h / 2 - top.cover);
  if (bottom) row(bottom, -h / 2 + bottom.cover);
  if (side && side.n >= 1 && side.A > 0) {
    const z0 = bottom ? -h / 2 + bottom.cover : -h / 2 + side.cover, z1 = top ? h / 2 - top.cover : h / 2 - side.cover;
    for (let i = 1; i <= side.n; i++) { const z = z0 + (z1 - z0) * i / (side.n + 1); bars.push({ y: -b / 2 + side.cover, z, A: side.A }, { y: b / 2 - side.cover, z, A: side.A }); }
  }
  return bars;
}

export function perimeterBars({ b, h, cover, ny, nz, A }) {
  const bars = [], seen = new Set();
  const put = (y, z) => { const k = Math.round(y * 1e6) + ',' + Math.round(z * 1e6); if (!seen.has(k)) { seen.add(k); bars.push({ y, z, A }); } };
  const yc = b / 2 - cover, zc = h / 2 - cover;
  for (let i = 0; i < ny; i++) { const y = ny === 1 ? 0 : -yc + 2 * yc * i / (ny - 1); put(y, zc); put(y, -zc); }
  for (let i = 0; i < nz; i++) { const z = nz === 1 ? 0 : -zc + 2 * zc * i / (nz - 1); put(yc, z); put(-yc, z); }
  return bars;
}

export function layersFor(sec, axis = 'y', sign = 1) {
  const depth = axis === 'y' ? sec.h : sec.b, width = axis === 'y' ? sec.b : sec.h;
  const map = new Map();
  for (const bar of sec.bars) {
    const s = axis === 'y' ? bar.z : bar.y;
    const d = Math.round((depth / 2 - sign * s) * 1e6) / 1e6;
    map.set(d, (map.get(d) || 0) + bar.A);
  }
  const layers = [...map].map(([d, As]) => ({ d, As })).sort((a, b) => a.d - b.d);
  return { depth, width, layers };
}

export function forcesAt(L, c, m) {
  const a = Math.min(m.beta1 * c, L.depth);
  const Cc = m.alpha1 * m.fc * L.width * a;
  let P = Cc, M = Cc * (L.depth / 2 - a / 2);
  const steel = [];
  let dt = 0, epsT = -Infinity;
  for (const { d, As } of L.layers) {
    const eps = m.epsCu * (c - d) / c;                               // compression +
    const fs = Math.max(-m.fy, Math.min(m.fy, m.Es * eps));
    const F = As * (fs - (d < a ? m.alpha1 * m.fc : 0));
    P += F; M += F * (L.depth / 2 - d);
    steel.push({ d, As, eps, fs, F });
    if (d >= dt) { dt = d; epsT = -eps; }
  }
  return { P, M, a, c, Cc, steel, epsT, dt };
}

export function neutralAxisForP(L, Ptarget, m) {
  // P(c) rises with c; bracket between a tiny c (all steel in tension) and a deep one
  let lo = 1e-6 * L.depth, hi = 1e3 * L.depth;
  if (forcesAt(L, hi, m).P < Ptarget || forcesAt(L, lo, m).P > Ptarget) return null;
  for (let k = 0; k < 200; k++) {
    const mid = Math.sqrt(lo * hi) > 0 && k < 60 ? Math.sqrt(lo * hi) : (lo + hi) / 2;
    if (forcesAt(L, mid, m).P > Ptarget) hi = mid; else lo = mid;
    if (hi - lo <= 1e-12 * hi) break;
  }
  return (lo + hi) / 2;
}
