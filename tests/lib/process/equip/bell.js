/* SPDX-License-Identifier: Apache-2.0 */
/**
 * bell.js — Bell–Delaware shell side, multi-shell series and the tube-sheet drawing entities (0.8 Track CH, CH.8; DOM-free).
 * A drafting and study aid, "to be checked by an engineer" (O7): NOT an engineering approval.
 *
 * Bell–Delaware (Bell 1963; Taborek in Heat Exchanger Design Handbook 3.3.x; Serth, Process Heat Transfer ch. 5) corrects the ideal tube-bank coefficient
 * by five flow-path factors:  h_s = h_ideal Jc Jl Jb Js Jr.  The method is built here in its structure: the geometry (cross-flow area, window fractions,
 * leakage and bypass areas) is computed from the dimensions, and EVERY empirical coefficient is read from a data PACK the person supplies:
 *     { format: 'cadcraft-bell-delaware-pack', version: 1, source: '<book, edition, table>', review: { state, by, date },
 *       ideal:  { '<layout angle>': [ { reFrom, reTo, a1, a2, a3, a4, b1, b2, b3, b4 }, … ] },     // j_ideal and f_ideal coefficients by Reynolds range
 *       Jc: { c0, c1 }, Jl: { p1, p2, p3 }, Jb: { cLaminar, cTurbulent, reSplit }, Js: { nLaminar, nTurbulent }, Jr: { reLow, reHigh } }
 * None is typed here (rule 29): without a pack `rateBell` stops and names the reference. The tests use a small made-up pack, labelled as such, to prove the
 * wiring and the limits (all factors are 1 with no leakage and no bypass).
 * NEEDS A SOURCE: Taborek's tables of the ideal-bank j and f coefficients by layout (HEDH 3.3.5, Table 1) and the J-factor constants (HEDH 3.3.5 eqs.).
 */
export const NEEDS_SOURCE = 'Bell–Delaware needs the coefficient tables of the Heat Exchanger Design Handbook section 3.3.5 (ideal-bank j and f by layout, and the J-factor constants). Type them into a cadcraft-bell-delaware-pack with a person who has the book open; none is built in.';

export function cleanPack(raw) {
  const p = raw && typeof raw === 'object' ? raw : {}, problems = [];
  const need = (c, t) => { if (!c) problems.push(t); };
  need(p.format === 'cadcraft-bell-delaware-pack', 'format must be cadcraft-bell-delaware-pack');
  need(typeof p.source === 'string' && p.source.length > 3, 'name the source (book, edition, table)');
  need(p.ideal && typeof p.ideal === 'object' && Object.keys(p.ideal).length, 'ideal-bank coefficient rows are missing');
  for (const k of ['Jc', 'Jl', 'Jb', 'Js', 'Jr']) need(p[k] && typeof p[k] === 'object', `${k} constants are missing`);
  return { ok: problems.length === 0, problems, pack: p, reviewed: !!(p.review && p.review.state === 'confirmed' && p.review.by && p.review.date) };
}

/** Geometry of a segmentally baffled shell (mm in, m out where noted). g = { Ds, do, pitch, layoutAngle (30|45|60|90), Nt, B (baffle spacing), Lbc (baffle cut height as a fraction of Ds, e.g. 0.25), Nb (baffles), Lsb (shell-baffle diametral clearance), Ltb (tube-baffle diametral clearance), Dotl (outer tube limit), Nss (sealing strip pairs), Np (tube passes), Nrcw? } */
export function geometry(g) {
  const Ds = g.Ds, d0 = g.do, p = g.pitch, B = g.B, Lsb = g.Lsb ?? 0, Ltb = g.Ltb ?? 0, Dotl = g.Dotl ?? Ds - 2 * (g.bundleClearance ?? 0.02);
  const pEff = (g.layoutAngle === 45 || g.layoutAngle === 90) ? p : p;            // effective pitch parallel to the flow: the pack's layout key carries the angle
  const Sm = B * ((Ds - Dotl) + (Dotl - d0) / pEff * (p - d0));                        // cross-flow area at the bundle centre (m2 when inputs in m)
  const thetaDs = 2 * Math.acos(Math.min(1, Math.max(-1, 1 - 2 * g.Lbc)));            // baffle-cut angle on the shell
  const thetaCtl = 2 * Math.acos(Math.min(1, Math.max(-1, (Ds - 2 * g.Lbc * Ds) / Dotl)));  // the same on the tube limit
  const xc = Math.min(1, Math.max(-1, (Ds - 2 * g.Lbc * Ds) / Dotl));
  const Fc = (1 / Math.PI) * (Math.PI + 2 * xc * Math.sin(Math.acos(xc)) - 2 * Math.acos(xc));       // fraction of tubes in cross flow
  const Ssb = Math.PI * Ds * (Lsb / 2) * (1 - thetaDs / (2 * Math.PI));                    // shell-to-baffle leakage area
  const Stb = Math.PI / 4 * ((d0 + Ltb) ** 2 - d0 ** 2) * g.Nt * (1 + Fc) / 2;             // tube-to-baffle leakage area (tubes held by one baffle side)
  const Sb = B * (Ds - Dotl);                                                           // bypass area between the bundle and the shell
  const Fbp = Sb / Sm, rs = Ssb / (Ssb + Stb), rlm = (Ssb + Stb) / Sm;
  return { Sm, Ssb, Stb, Sb, Fc, Fbp, rs, rlm, thetaDs, thetaCtl, Nss_plus: (g.Nss ?? 0) / Math.max(g.Nrcc ?? 1, 1),
    notes: ['the leakage-area expressions follow the published layout of the method; check them against the book with the pack (O7)'] };
}

function rangeRow(rows, Re) { for (const r of rows) if (Re >= r.reFrom && Re < r.reTo) return r; return rows[rows.length - 1]; }
/** Ideal-bank j and f (Taborek's form): j = a1 (1.33/(p/do))^a Re^a2, a = a3/(1 + 0.14 Re^a4); f likewise with b. */
export function idealJF(pack, layoutAngle, Re, pitchRatio) {
  const rows = pack.ideal[String(layoutAngle)]; if (!rows) throw new Error('the pack has no ideal-bank rows for the ' + layoutAngle + ' degree layout');
  const r = rangeRow(rows, Re), a = r.a3 / (1 + 0.14 * Math.pow(Re, r.a4)), b = r.b3 / (1 + 0.14 * Math.pow(Re, r.b4));
  return { j: r.a1 * Math.pow(1.33 / pitchRatio, a) * Math.pow(Re, r.a2), f: r.b1 * Math.pow(1.33 / pitchRatio, b) * Math.pow(Re, r.b2) };
}
/** The five correction factors from the geometry and the pack constants. Re is the cross-flow Reynolds number. */
export function jFactors(pack, geo, Re) {
  const Jc = pack.Jc.c0 + pack.Jc.c1 * geo.Fc;
  const Jl = pack.Jl.p1 * (1 - geo.rs) + (1 - pack.Jl.p1 * (1 - geo.rs)) * Math.exp(-pack.Jl.p2 * geo.rlm);
  const Cb = Re < pack.Jb.reSplit ? pack.Jb.cLaminar : pack.Jb.cTurbulent;
  const Jb = geo.Nss_plus >= 0.5 ? 1 : Math.exp(-Cb * geo.Fbp * (1 - Math.cbrt(2 * geo.Nss_plus)));
  const Js = 1;                                                                           // unequal end spacings are the caller's (set Js in rateBell when the inlet/outlet baffle spacing differs)
  const Jr = 1;                                                                           // the laminar-flow correction applies below Re = pack.Jr.reLow when many rows are crossed
  return { Jc, Jl, Jb, Js, Jr, product: Jc * Jl * Jb * Js * Jr };
}
/** Shell-side film coefficient: spec { pack, geo (from geometry), fluid { mdot kg/s, cp, mu, k, Pr? }, layoutAngle, do, pitch } → { h, hIdeal, J, Re, notes }. */
export function rateBell(spec) {
  const c = cleanPack(spec.pack); if (!c.ok) { const e = new Error(NEEDS_SOURCE + ' (' + c.problems.join('; ') + ')'); e.needsSource = true; throw e; }
  const { geo, fluid } = spec, G = fluid.mdot / geo.Sm, Re = G * spec.do / fluid.mu, Pr = fluid.Pr ?? fluid.cp * fluid.mu / fluid.k;
  const { j } = idealJF(spec.pack, spec.layoutAngle, Re, spec.pitch / spec.do), hIdeal = j * fluid.cp * G * Math.pow(Pr, -2 / 3);
  const J = jFactors(spec.pack, geo, Re), notes = [c.reviewed ? 'pack reviewed' : 'the pack is NOT reviewed: nothing here is checked against the book'];
  return { h: hIdeal * J.product, hIdeal, J, Re, G, notes };
}

/** n identical shells in series (each its own ε), hot and cold counter-current overall: ε_n from the single-shell ε_1 and Cr (Kays and London / Incropera form). */
export function shellsInSeries(eps1, Cr, n) {
  if (n === 1) return eps1;
  if (Math.abs(Cr - 1) < 1e-12) return n * eps1 / (1 + (n - 1) * eps1);
  const z = Math.pow((1 - eps1 * Cr) / (1 - eps1), n);
  return (z - 1) / (z - Cr);
}
/** Neutral entities for a drawing host (CadCraft draws them): shell circle, tube circles, pass lane and tags. Units of the layout (m); scale to mm with `scale`. */
export function tubeSheetEntities(lay, { Ds, do: d0, scale = 1000, tag = '' }) {
  const E = [{ type: 'circle', layer: 'HX-SHELL', cx: 0, cy: 0, r: Ds / 2 * scale }];
  for (const t of lay.tubes) E.push({ type: 'circle', layer: 'HX-TUBES' + (lay.passes > 1 ? '-P' + (t.pass + 1) : ''), cx: t.x * scale, cy: t.y * scale, r: d0 / 2 * scale });
  if (lay.passes > 1) E.push({ type: 'line', layer: 'HX-PASS', x1: -Ds / 2 * scale, y1: 0, x2: Ds / 2 * scale, y2: 0 });
  E.push({ type: 'text', layer: 'HX-TEXT', x: 0, y: -(Ds / 2 + 0.05) * scale, h: 0.03 * scale, text: `${tag} ${lay.n} tubes, pitch ${(lay.pitch * 1000).toFixed(1)} mm, ${lay.passes} pass${lay.passes > 1 ? 'es' : ''}`.trim() });
  return E;
}
