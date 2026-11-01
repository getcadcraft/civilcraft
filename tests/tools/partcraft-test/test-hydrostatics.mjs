#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-hydrostatics.mjs — 0.8 EG.26: hydrostatics and righting arms (hydrostatics.js) against closed forms:
 *   - a box barge 10 × 4 × 3 m, draft 1 m: ∇ = 40 m³ (41 t at 1025), KB = T/2, BM_T = B²/(12 T), BM_L = L²/(12 T), waterplane L·B, LCF mid-length,
 *     wetted surface L·B + 2T(L + B), Cb = 1, Cw = 1, TPC = ρ·L·B·10⁻⁵ t/cm
 *   - a horizontal circular cylinder (r = 1 m, 8 m long, 128 facets) half submerged: ∇ = π r² L / 2, KB = r − 4r/(3π), BM_T = 4r/(3π)
 *   - a triangular prism (keel down): ∇ = ½ b h L at full depth, KB = h/3 from the keel
 *   - the drafts table rises and the volume is exactly linear in the draft for the barge
 *   - righting arms of the barge with KG = 1.2 m: GM = KB + BM − KG = 0.6333 m; GZ = sinθ (GM + ½ BM tan²θ) wall-sided at 10° and 20° (before the bilge
 *     comes out at 26.6°); GZ(0) = 0; the curve is odd; a stiffer boat (lower KG) has the larger GZ; vanishing angle where GZ crosses zero
 *   - the same barge with its axes given the other way round (up z, length y, across x) gives the same numbers
 *   node tools/partcraft-test/test-hydrostatics.mjs [--verbose]    (or runHydrostaticsTests() from bin/test-partcraft.mjs)
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '../..');
const DEV = path.join(REPO, 'public_html/assets/apps/partcraft/dev/');

/** A closed mesh from a convex-or-not polyhedron description: boxes by their corners (outward triangles). */
function box(x0, y0, z0, x1, y1, z1) {
  const v = [[x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0], [x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]];
  const f = [[0, 3, 2], [0, 2, 1], [4, 5, 6], [4, 6, 7], [0, 1, 5], [0, 5, 4], [3, 7, 6], [3, 6, 2], [0, 4, 7], [0, 7, 3], [1, 2, 6], [1, 6, 5]];
  return { pos: Float64Array.from(v.flat()), idx: Uint32Array.from(f.flat()) };
}
/** A cylinder along X: radius r, length L, n facets (an inscribed polygon). */
function cylinderX(r, L, n) {
  const pos = [], idx = [];
  for (let i = 0; i < n; i++) { const a = 2 * Math.PI * i / n; pos.push(0, r * Math.cos(a), r * Math.sin(a)); }
  for (let i = 0; i < n; i++) { const a = 2 * Math.PI * i / n; pos.push(L, r * Math.cos(a), r * Math.sin(a)); }
  const c0 = pos.length / 3; pos.push(0, 0, 0); const c1 = c0 + 1; pos.push(L, 0, 0);
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    idx.push(i, n + j, n + i, i, j, n + j);   // side, outward
    idx.push(c0, j, i);                        // end at x = 0 (normal −x)
    idx.push(c1, n + i, n + j);                // end at x = L (normal +x)
  }
  return { pos: Float64Array.from(pos), idx: Uint32Array.from(idx) };
}
/** A triangular prism along X: keel point down at (y = 0), top at y = h, half-beam b/2, length L. */
function prismX(b, h, L) {
  const v = [[0, 0, 0], [0, h, -b / 2], [0, h, b / 2], [L, 0, 0], [L, h, -b / 2], [L, h, b / 2]];
  const f = [[0, 2, 1], [3, 4, 5], [0, 1, 4], [0, 4, 3], [0, 3, 5], [0, 5, 2], [1, 2, 5], [1, 5, 4]];
  return { pos: Float64Array.from(v.flat()), idx: Uint32Array.from(f.flat()) };
}
/** Turn a mesh's triangles round when they point inward (the test shapes are written by hand). */
function outward(m) { if (signedVolume(m) < 0) for (let i = 0; i < m.idx.length; i += 3) { const t = m.idx[i + 1]; m.idx[i + 1] = m.idx[i + 2]; m.idx[i + 2] = t; } return m; }
function signedVolume(m) { let v = 0; const P = (i) => [m.pos[3 * i], m.pos[3 * i + 1], m.pos[3 * i + 2]]; for (let t = 0; t < m.idx.length; t += 3) { const a = P(m.idx[t]), b = P(m.idx[t + 1]), c = P(m.idx[t + 2]); v += (a[0] * (b[1] * c[2] - b[2] * c[1]) - a[1] * (b[0] * c[2] - b[2] * c[0]) + a[2] * (b[0] * c[1] - b[1] * c[0])) / 6; } return v; }

export async function runHydrostaticsTests({ ok, section }) {
  const HS = await import(DEV + 'hydrostatics.js');
  const near = (a, b, rel = 1e-9) => Math.abs(a - b) <= rel * Math.max(1e-9, Math.abs(b));
  const code = (fn) => { try { fn(); return ''; } catch (e) { return e.code || 'plain'; } };
  const L = 10000, B = 4000, H = 3000, T = 1000;   // mm
  const barge = box(0, 0, -B / 2, L, H, B / 2);

  section('EG.26 hydrostatics: a box barge');
  {
    ok(near(signedVolume(barge), L * B * H, 1e-12), 'the test box is a closed outward mesh (signed volume = L·B·H)');
    const r = HS.hullAt(barge, T, { rho: 1025 });
    ok(near(r.volume, L * B * T) && near(r.displacement, 41000, 1e-9), `∇ = ${(r.volume / 1e9).toFixed(3)} m³, ${(r.displacement / 1000).toFixed(2)} t at 1025 kg/m³`);
    ok(near(r.kb, T / 2) && near(r.lcb, L / 2) && Math.abs(r.tcb) < 1e-6, `KB = T/2 = ${r.kb.toFixed(3)} mm, LCB mid-length ${r.lcb.toFixed(1)}, TCB on the centreline`);
    ok(near(r.bmT, B * B / (12 * T)) && near(r.bmL, L * L / (12 * T)), `BM_T = B²/12T = ${r.bmT.toFixed(2)} mm, BM_L = L²/12T = ${r.bmL.toFixed(1)} mm`);
    ok(near(r.kmT, T / 2 + B * B / (12 * T)) && near(r.waterplane.area, L * B) && near(r.waterplane.lcf, L / 2) && Math.abs(r.waterplane.tcf) < 1e-6, 'KM_T = KB + BM_T; the waterplane is L·B with its centre at mid-length');
    ok(near(r.wetted, L * B + 2 * T * (L + B)) && near(r.cb, 1) && near(r.cw, 1), `wetted surface ${(r.wetted / 1e6).toFixed(3)} m² = L·B + 2T(L + B); Cb = Cw = 1`);
    ok(near(r.tpc, 1025 * 1e-9 * L * B) && near(r.lwl, L) && near(r.bwl, B), 'tonnes per cm immersion = ρ·A_wp; the waterline is L long and B wide');
    const rows = HS.table(barge, [500, 1000, 1500, 2000, 2900], { rho: 1000 });
    ok(rows.length === 5 && rows.every((x, i) => near(x.volume, L * B * [500, 1000, 1500, 2000, 2900][i])) && near(rows[3].bmT, B * B / (12 * 2000)), 'a draft table: the volume is linear in the draft, BM falls as 1/T');
    ok(HS.hullAt(barge, 0) === null && HS.hullAt(barge, -5) === null, 'no draft, nothing submerged: null');
    const f = HS.hullAt(barge, H, { rho: 1000 });
    ok(near(f.volume, L * B * H), 'fully submerged to the deck line: the whole box');
  }

  section('EG.26 hydrostatics: other hulls');
  {
    const r = 1000, len = 8000, n = 128, cyl = outward(cylinderX(r, len, n));
    const kk = (n / 2) * Math.sin(2 * Math.PI / n) / Math.PI;   // the polygon's share of the circle
    ok(near(signedVolume(cyl), Math.PI * r * r * len * kk, 1e-9), 'the test cylinder is a closed outward mesh');
    const c = HS.hullAt(cyl, r, { rho: 1000 });
    ok(near(c.volume, Math.PI * r * r * len / 2 * kk, 2e-3), `half submerged: ∇ ${(c.volume / 1e9).toFixed(4)} m³ vs π r² L/2 = ${(Math.PI * r * r * len / 2 / 1e9).toFixed(4)} (facets: ${(100 * (c.volume / (Math.PI * r * r * len / 2) - 1)).toFixed(3)} %)`);
    ok(near(c.kb, r - 4 * r / (3 * Math.PI), 3e-3) && near(c.bmT, 4 * r / (3 * Math.PI), 4e-3), `KB = r − 4r/3π = ${c.kb.toFixed(1)} mm, BM_T = 4r/3π = ${c.bmT.toFixed(1)} mm`);
    ok(near(c.waterplane.area, 2 * r * len, 3e-3), 'waterplane 2 r L');
    const pr = outward(prismX(2000, 1500, 6000)), full = HS.hullAt(pr, 1499.999, { rho: 1000 });
    ok(near(full.volume, 0.5 * 2000 * 1500 * 6000, 1e-5) && near(full.kb, 2 * 1500 / 3, 1e-5), `a V hull filled to the top: ∇ = ½ b h L, KB = 2h/3 from the keel (the apex) = ${full.kb.toFixed(2)} mm`);
    const half = HS.hullAt(pr, 750, { rho: 1000 });
    ok(near(half.volume, 0.5 * 1000 * 750 * 6000, 1e-9) && near(half.kb, 2 * 750 / 3, 1e-9) && near(half.waterplane.area, 1000 * 6000, 1e-9), 'the same hull at half draft: ¼ the volume, KB = 2T/3, a waterplane of b/2 · L');
  }

  section('EG.26 hydrostatics: righting arms');
  {
    const KG = 1200, KB = T / 2, BM = B * B / (12 * T), GM = KB + BM - KG;
    const rr = HS.rightingArms(barge, { draft: T, kg: KG, angles: [0, 5, 10, 15, 20, 25], opts: { rho: 1025 } });
    ok(near(rr.gm, GM, 1e-9) && near(GM, 633.333, 1e-5), `GM = KB + BM − KG = ${rr.gm.toFixed(3)} mm`);
    const gz = (a) => rr.rows.find((x) => x.heel === a).gz;
    ok(Math.abs(gz(0)) < 1e-6, 'GZ at 0° is 0');
    for (const a of [5, 10, 15, 20]) {
      const t = Math.tan(a * Math.PI / 180), want = Math.sin(a * Math.PI / 180) * (GM + 0.5 * BM * t * t);
      ok(near(gz(a), want, 2e-3), `wall-sided at ${a}°: GZ = sinθ (GM + ½ BM tan²θ) = ${want.toFixed(2)} mm (read ${gz(a).toFixed(2)})`);
    }
    ok(rr.rows.every((x) => near(x.volume, L * B * T, 1e-3)), 'every heeled hull is lifted until it displaces the same 40 m³');
    const neg = HS.rightingArms(barge, { draft: T, kg: KG, angles: [-10, 10], opts: {} }).rows;
    ok(near(neg[0].gz, -neg[1].gz, 1e-6), 'the curve is odd: GZ(−10°) = −GZ(10°)');
    const stiff = HS.rightingArms(barge, { draft: T, kg: 800, angles: [10] }).rows[0].gz;
    ok(stiff > gz(10) && near(stiff - gz(10), 400 * Math.sin(10 * Math.PI / 180), 1e-3), 'lowering G by 400 mm adds 400·sinθ to GZ');
    const top = HS.rightingArms(barge, { draft: T, kg: 2800, angles: [0, 5, 10, 20, 30, 45] });
    ok(top.gm < 0 && top.rows.find((x) => x.heel === 5).gz < 0, `G above the metacentre (KG 2.8 m): GM ${top.gm.toFixed(1)} mm and GZ is negative at 5° — unstable upright`);
    // low freeboard: the deck edge goes under at 8.5° and the arm falls away; an independent 2-D oracle (polygon clipping, bisection) gives GZ at every angle
    const low = box(0, 0, -B / 2, L, 1300, B / 2);
    const lowArms = HS.rightingArms(low, { draft: T, kg: 800, angles: [0, 5, 10, 20, 30, 40, 50, 60, 70, 80, 89] });
    const section = (deg) => {   // the rectangle B × 1300 (z across, y up), keel at y = 0, turned by deg
      const c = Math.cos(deg * Math.PI / 180), s = Math.sin(deg * Math.PI / 180);
      const pts = [[-B / 2, 0], [B / 2, 0], [B / 2, 1300], [-B / 2, 1300]].map(([z, y]) => [y * s + z * c, y * c - z * s]);   // [z', y']
      const clip = (h) => { const out = []; for (let i = 0; i < 4; i++) { const p = pts[i], q = pts[(i + 1) % 4], pin = p[1] <= h, qin = q[1] <= h; if (pin) out.push(p); if (pin !== qin) { const t = (h - p[1]) / (q[1] - p[1]); out.push([p[0] + t * (q[0] - p[0]), h]); } } return out; };
      const area = (P) => { let a = 0; for (let i = 0; i < P.length; i++) { const p = P[i], q = P[(i + 1) % P.length]; a += p[0] * q[1] - q[0] * p[1]; } return a / 2; };
      const cz = (P) => { const A = area(P); let x = 0; for (let i = 0; i < P.length; i++) { const p = P[i], q = P[(i + 1) % P.length]; x += (p[0] + q[0]) * (p[0] * q[1] - q[0] * p[1]); } return x / (6 * A); };
      let lo = Math.min(...pts.map((p) => p[1])), hi = Math.max(...pts.map((p) => p[1]));
      for (let k = 0; k < 100; k++) { const mid = (lo + hi) / 2; const P = clip(mid); (P.length >= 3 && Math.abs(area(P)) >= B * T ? hi = mid : lo = mid); }
      const P = clip((lo + hi) / 2);
      return cz(P) - 800 * s;   // GZ = z(B) − z(G), G at height 800 on the centreline
    };
    const worst = Math.max(...lowArms.rows.filter((x) => x.gz !== null).map((x) => Math.abs(x.gz - section(x.heel))));
    ok(worst < 0.5, `a low-freeboard barge (H 1.3 m), KG 0.8 m: GZ at 0, 5, 10 … 89° agrees with the 2-D polygon oracle within ${worst.toFixed(4)} mm (deck edge under at 8.5°, bilge out at 26.6°)`);
    ok(lowArms.vanishing !== null && lowArms.vanishing > lowArms.at && lowArms.maxGz > 0, `largest GZ ${lowArms.maxGz.toFixed(1)} mm at ${lowArms.at}°; GZ vanishes near ${lowArms.vanishing && lowArms.vanishing.toFixed(1)}° (between samples, by interpolation)`);
    ok(code(() => HS.rightingArms(barge, { draft: T, angles: [0] })) === 'invalid_argument' && code(() => HS.rightingArms(barge, { draft: 0, kg: 1000 })) === 'invalid_argument', 'no KG, or a draft with nothing submerged: invalid_argument');
  }

  section('EG.26 hydrostatics: axes');
  {
    // the barge standing on its other axes: up z, length y, across x
    const m = box(-B / 2, 0, 0, B / 2, L, H);   // x across, y length, z up
    const a = HS.hullAt(m, T, { rho: 1025, axes: { up: 'z', length: 'y', across: 'x' } }), b = HS.hullAt(barge, T, { rho: 1025 });
    ok(near(a.volume, b.volume) && near(a.kb, b.kb) && near(a.bmT, b.bmT) && near(a.bmL, b.bmL), 'up z, length y, across x gives the same numbers');
    const m2 = box(0, -B / 2, 0, L, B / 2, H);   // x length, y across, z up
    const c = HS.hullAt(m2, T, { rho: 1025, axes: { up: 'z', length: 'x', across: 'y' } });
    ok(near(c.volume, b.volume) && near(c.bmT, b.bmT), 'up z, length x, across y too (an odd permutation: the triangles are turned back outward)');
    ok(code(() => HS.hullAt(barge, T, { axes: { up: 'y', length: 'y', across: 'z' } })) === 'invalid_argument', 'two axes the same: invalid_argument');
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const VERBOSE = process.argv.includes('--verbose');
  let pass = 0, fail = 0;
  const ok = (c, m) => { if (c) { pass++; if (VERBOSE) console.log('  ok  ' + m); } else { fail++; console.log('  FAIL ' + m); } };
  await runHydrostaticsTests({ ok, section: (m) => { if (VERBOSE) console.log(m); } });
  console.log(`hydrostatics: ${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}
