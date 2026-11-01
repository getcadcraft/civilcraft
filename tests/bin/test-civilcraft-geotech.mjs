#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-civilcraft-geotech.mjs — CivilCraft 0.8 EG.9: geotechnical (geotech.js), DOM-free, in Node.
 * Known answers: Taylor's stability numbers for phi=0 toe circles (0.191 at 60°, 0.219 at 75°, 0.261 at 90°); a vertical cut with an exact circular
 * segment (hand centroid); the infinite slope FS = tan(phi)/tan(beta) for a shallow circle; Newmark/Fadum influence I(1,1)=0.1752; Terzaghi
 * Tv 0.197 at 50 % and 0.848 at 90 %; elastic flexible square 0.561 corner and 1.122 centre; NC consolidation by hand.
 *   node bin/test-civilcraft-geotech.mjs [--build dev|x.y]
 */
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const arg = (k) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null; };
const G = await import(pathToFileURL(path.join(REPO, 'public_html/assets/apps/civilcraft', arg('--build') || 'dev', 'geotech.js')).href);
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL', m); } };
const near = (a, b, tol, m) => ok(Math.abs(a - b) <= tol, `${m}: ${a} vs ${b} (±${tol})`);

// ---- influence and settlement
near(G.influenceCorner(1, 1, 1), 0.1752, 2e-4, 'Newmark I(m=1,n=1)');
near(G.influenceCorner(1e6, 1e6, 1), 0.25, 1e-4, 'I -> 0.25 for a huge area');
near(G.influenceCorner(0.5, 0.5, 1), 0.0840, 2e-4, 'I(0.5,0.5) Das table');
near(G.stressRect(100, 2, 2, 0.0001, 'centre'), 100, 0.5, 'centre stress at the base = q');
near(G.stress2to1(100, 2, 2, 2), 100 * 4 / 16, 1e-9, '2:1 spread');
near(G.elasticCorner(1, 1, 1, 1, 0), 0.5611, 2e-4, 'flexible square corner Iw = 0.561');
near(G.elasticCentre(1, 1, 1, 1, 0), 1.1222, 4e-4, 'flexible square centre Iw = 1.122');
near(G.degreeOfConsolidation(0.197), 0.5, 2e-3, 'Tv 0.197 -> 50 %'); near(G.degreeOfConsolidation(0.848), 0.9, 2e-3, 'Tv 0.848 -> 90 %');
near(G.timeFactor(0.5), 0.197, 1e-3, 'U 50 % -> Tv'); near(G.timeFor(0.9, 2, 1), 0.848 * 4, 5e-3, 'time for 90 %');
// NC clay by hand: 4 m, e0 1, Cc 0.3, sigma'0 100 kPa, d-sigma 50 -> 0.3*4/2*log10(1.5)=0.10566 m (stress forced: very wide load)
{
  const r = G.settlement({ layers: [{ top: 0, bottom: -4, gamma: 17, cc: 0.3, cs: 0.06, e0: 1 }], load: { q: 50, B: 1e6, L: 1e6, depth: 0, method: 'boussinesq' }, ground: 0, step: 4 });
  // sigma'0 at mid depth (2 m) = 34 kPa here, so recompute by hand from the same number
  const s0 = 17 * 2, hand = (0.3 * 4) / 2 * Math.log10((s0 + 50) / s0);
  near(r.consolidation, hand, hand * 0.01, 'NC consolidation settlement by hand');
}
{   // preconsolidated: stays under sigma_c -> uses Cs
  const r = G.settlement({ layers: [{ top: 0, bottom: -2, gamma: 18, cc: 0.4, cs: 0.05, e0: 0.8, sigmaC: 300 }], load: { q: 40, B: 1e6, L: 1e6, depth: 0, method: 'boussinesq' }, ground: 0, step: 2 });
  near(r.consolidation, (0.05 * 2) / 1.8 * Math.log10((18 + 40) / 18), 1e-4, 'OC clay below sigma_c uses Cs');
}
near(G.secondary(0.02, 3, 0.9, 10, 100), (0.02 * 3) / 1.9, 1e-9, 'secondary per log cycle');

// ---- SPT
{ const c = G.sptCorrect(20, { er: 72, sigma: 50 }); near(c.n60, 24, 1e-9, 'N60'); near(c.cn, Math.sqrt(101.325 / 50), 1e-9, 'CN'); }

// ---- boring clean-up and profile
{
  const b = G.cleanBoring({ x: 0, y: 0, z: 100, water: 3, layers: [{ from: 0, to: 2, soil: 'FILL' }, { from: 2.5, to: 6, soil: 'cl' }, { from: 5, to: 9, soil: 'SP' }, { from: 8, to: 7 }, { from: 0, to: 1, soil: 'zz' }] });
  ok(b.layers.length >= 3, 'layers kept'); ok(b.layers.every((l, i) => i === 0 || Math.abs(l.from - b.layers[i - 1].to) < 1e-9), 'layers end to end');
  ok(G.boringSvg(b).startsWith('<svg'), 'log svg');
  ok(G.cleanBoring({ x: 'a', y: 1 }) === null, 'bad boring refused');
}
{
  const mk = (x, z, layers) => G.cleanBoring({ id: 'b' + x, name: 'B' + x, x, y: 0, z, layers });
  const B = [mk(0, 100, [{ from: 0, to: 2, soil: 'FILL' }, { from: 2, to: 8, soil: 'CL', unit: 'clay' }, { from: 8, to: 12, soil: 'SP', unit: 'sand' }]),
    mk(20, 98, [{ from: 0, to: 4, soil: 'CL', unit: 'clay' }, { from: 4, to: 12, soil: 'SP', unit: 'sand' }])];
  const pr = G.sectionProfile(B, [{ x: -5, y: 0 }, { x: 30, y: 0 }]);
  near(pr.borings[0].sta, 5, 1e-9, 'station of B0'); near(pr.borings[1].sta, 25, 1e-9, 'station of B20');
  const st = G.stackAt(pr, 15); const clay = st.find((s) => s.unit === 'clay');
  near(clay.top, (98 + 98) / 2 + 0 * 1 + 0, 1.0, 'clay top is between the borings'); near(clay.top, ((100 - 2) + (98 - 0)) / 2, 1e-6, 'clay top interpolates (98 and 98)');
  near(clay.bottom, ((100 - 8) + (98 - 4)) / 2, 1e-6, 'clay bottom interpolates');
  const fill = G.stackAt(pr, 5).find((s) => s.unit === 'FILL'); ok(!!fill, 'fill at B0'); ok(!G.stackAt(pr, 25).find((s) => s.unit === 'FILL'), 'fill pinched out at B20');
  ok(G.profileSvg(pr).includes('<path'), 'profile svg');
}

// ---- slope stability: Taylor phi = 0
const slope = (beta, H = 10, cu = 50, gamma = 18) => {
  const run = H / Math.tan(beta * Math.PI / 180);
  return { ground: [{ x: -60, z: H }, { x: 0, z: H }, { x: run, z: 0 }, { x: run + 80, z: 0 }], layers: [{ top: H, gamma, cu, c: 0, phi: 0 }], water: null, floor: -3 * H };
};
for (const [beta, N] of [[60, 0.191], [75, 0.219], [90, 0.261]]) {
  const g = slope(beta), r = G.searchSlip(g, { nx: 16, nz: 12, nr: 16, slices: 50 });
  const fsTaylor = 50 / (18 * 10 * N);
  near(r.critical.fs / fsTaylor, 1, 0.015, `Taylor toe circle ${beta}°: FS ${r.critical.fs.toFixed(3)} vs ${fsTaylor.toFixed(3)}`);
}
// vertical cut, a quarter circle: centre (0, H), R = H, the mass is a quarter disc, centroid 4R/(3π) from the face -> FS = 3π·cu / (2·γ·R)
{
  const H = 10, gamma = 18, cu = 40, g = { ground: [{ x: -60, z: H }, { x: 0, z: H }, { x: 0, z: 0 }, { x: 60, z: 0 }], layers: [{ top: H, gamma, cu, c: 0, phi: 0 }], water: null, floor: -40 };
  const FS = (3 * Math.PI * cu) / (2 * gamma * H), r = G.bishop(g, { xc: 0, zc: H, R: H }, { slices: 400 });
  near(r.fs / FS, 1, 0.005, `vertical cut, quarter circle: ${r.fs.toFixed(4)} vs ${FS.toFixed(4)}`);
}
// infinite slope: dry sand, phi 30, slope 1:2 (26.57°) -> tan30/tan26.57 = 1.155; a shallow, long circle approaches it
{
  const g = { ground: [{ x: -3000, z: 1500 }, { x: 3000, z: -1500 }], layers: [{ top: 1500, gamma: 19, c: 0, phi: 30 }], water: null, floor: -3000 };
  const R = 20000, d = 2, nx = 0.5 / Math.hypot(1, 0.5), nz = 1 / Math.hypot(1, 0.5);   // unit normal of the ground, upward
  const xc = nx * (R - d) * 1, zc = nz * (R - d);   // the lowest point of the circle is d below the plane through the origin
  const r = G.bishop(g, { xc, zc, R }, { slices: 300 });
  near(r.fs, Math.tan(30 * Math.PI / 180) / 0.5, 0.06, 'shallow circle on a long slope approaches tanφ/tanβ');
  const o = G.bishop(g, { xc, zc, R }, { method: 'ordinary', slices: 300 }); ok(o.fs <= r.fs + 1e-6, 'ordinary <= Bishop');
}
// water lowers FS; surcharge lowers FS; mirrored slope gives the same answer
{
  const g = slope(30, 10, 0); g.layers = [{ top: 10, gamma: 19, c: 5, phi: 30 }];
  const c = { xc: 8, zc: 25, R: 26 }; const dry = G.bishop(g, c, { slices: 100 }).fs;
  const wet = G.bishop({ ...g, water: 4 }, c, { slices: 100 }).fs; ok(wet < dry, `water lowers FS ${wet} < ${dry}`);
  const sur = G.bishop({ ...g, surcharge: [{ x0: -30, x1: -1, q: 40 }] }, c, { slices: 100 }).fs; ok(sur < dry, 'surcharge lowers FS');
  const m = G.mirrorGeom(g); near(G.bishop(m, { xc: -8, zc: 25, R: 26 }, { slices: 100 }).fs, dry, 1e-9, 'mirror gives the same FS');
  const kh = G.bishop(g, c, { slices: 100, kh: 0.15 }).fs; ok(kh < dry, 'pseudo-static lowers FS');
}
// layered with a weak seam: the critical circle runs through it and FS drops
{
  const g = { ground: [{ x: -40, z: 10 }, { x: 0, z: 10 }, { x: 20, z: 0 }, { x: 80, z: 0 }], layers: [{ top: 10, gamma: 19, c: 10, phi: 30 }, { top: 0, gamma: 17, cu: 15, c: 0, phi: 0 }], water: null, floor: -20 };
  const strong = { ...g, layers: [{ top: 10, gamma: 19, c: 10, phi: 30 }] };
  ok(G.searchSlip(g, {}).critical.fs < G.searchSlip(strong, {}).critical.fs, 'a weak lower layer lowers the critical FS');
}
console.log(`geotech: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
