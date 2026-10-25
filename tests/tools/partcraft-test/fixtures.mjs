/* SPDX-License-Identifier: Apache-2.0 */
/**
 * fixtures.mjs — parts built through PartCraft's own DOM-free API, for bin/test-partcraft.mjs and
 * the browser check. Every number is chosen so the volume can be worked out by hand.
 *
 * flange(): the Catalog's pipe flange (tools/sheet-gen/part.py "PartCraft 1"): a weld-neck flange,
 *   disc Ø200 × 30, hub tapering from Ø104 at the disc to Ø80 over 50, bore Ø68 through, and
 *   8 bolt holes Ø14 on a Ø150 bolt circle (hidden lines at r 68 and 82 in the sheet).
 *   Revolved profile (front plane, about a vertical centerline through the origin), one hole
 *   sketched on the disc's top face (a face reference that follows the revolve), then a
 *   circular pattern of 8 about the revolve's axis.
 *   Exact solid:  π[(100² − 34²)·30 + (50/3)(52² + 52·40 + 40²) − 34²·50] − 8·π·7²·30 = 302160 π mm³
 *   Faceted with n segments per turn every circle becomes an inscribed n-gon, so the built mesh is
 *   exactly k·302160 with k = (n/2)·sin(2π/n).
 */
const DEV = new URL('../../public_html/assets/apps/partcraft/dev/', import.meta.url).href;
// The English language file, loaded once before any test reads a message (0.4 G: PartCraft's text comes from lang/en.json;
// without a catalog t() returns bare keys). Every PartCraft test imports this module, so a test run alone gets it too.
{
  const I18N = await import(DEV + 'i18n.js');
  const { readFileSync } = await import('node:fs');
  I18N.init({ locale: 'en', strings: JSON.parse(readFileSync(new URL('lang/en.json', DEV), 'utf8')) });
}
const S = await import(DEV + 'sketch.js');
const P = await import(DEV + 'part.js');

export function flangeSketch() {
  const sk = S.newSketch();
  const ax = S.addLine(sk, [0, -10], [0, 100], { construction: true });
  S.addConstraint(sk, 'coincident', [ax.p1, 'O']);
  sk.entities.find((e) => e.id === ax.p1).y = 0;
  S.addConstraint(sk, 'vertical', [ax.id]);
  S.addConstraint(sk, 'distance', [ax.id], 100);
  // profile drawn slightly off so the solver has work to do
  const pts = [[35, 1], [99, -1], [101, 29], [53, 31], [41, 79], [33, 81]];
  const L = [];
  let prev = null, first = null;
  for (let i = 0; i < 6; i++) {
    const a = prev ? prev : pts[i];
    const l = S.addLine(sk, a, pts[(i + 1) % 6]);
    if (!first) first = l;
    L.push(l);
    prev = l.p2;
  }
  S.addConstraint(sk, 'coincident', [L[5].p2, L[0].p1]);
  S.addConstraint(sk, 'horizontal', [L[0].id]);
  S.addConstraint(sk, 'vertical', [L[1].id]);
  S.addConstraint(sk, 'horizontal', [L[2].id]);
  S.addConstraint(sk, 'horizontal', [L[4].id]);
  S.addConstraint(sk, 'vertical', [L[5].id]);
  S.addConstraint(sk, 'coincident', ['O', L[0].id]);
  const dims = {};
  dims.bore = S.addConstraint(sk, 'hdistance', ['O', L[0].p1], 34).id;
  dims.outer = S.addConstraint(sk, 'hdistance', ['O', L[0].p2], 100).id;
  dims.disc = S.addConstraint(sk, 'distance', [L[1].id], 30).id;
  dims.hubBase = S.addConstraint(sk, 'hdistance', ['O', L[2].p2], 52).id;
  dims.hubTop = S.addConstraint(sk, 'hdistance', ['O', L[4].p1], 40).id;
  dims.height = S.addConstraint(sk, 'vdistance', ['O', L[4].p1], 80).id;
  return { sk, axis: ax.id, lines: L.map((l) => l.id), dims };
}

/** → { part, ids: { profile, revolve, holeSketch, hole, pattern }, dims, lines } */
export function flange({ resolution = 64, holes = 8, holeD = 14, boltR = 75 } = {}) {
  const part = P.newPart('Flange');
  part.resolution = resolution;
  const fs = flangeSketch();
  const sk1 = P.addFeature(part, 'sketch', { plane: { kind: 'base', name: 'front' }, sketch: fs.sk });
  const rev = P.addFeature(part, 'revolve', { sketch: sk1.id, axis: fs.axis, op: 'add', angle: 360 });
  const hs = S.newSketch();
  const p = S.addPoint(hs, boltR + 2, 1);
  S.addConstraint(hs, 'hdistance', ['O', p], boltR);
  S.addConstraint(hs, 'vdistance', ['O', p], 0);
  // the disc's top face: the profile line from (100,30) to (52,30), square to the axis
  const sk2 = P.addFeature(part, 'sketch', { plane: { kind: 'face', feature: rev.id, face: 'side', entity: fs.lines[2] }, sketch: hs });
  const hole = P.addFeature(part, 'hole', { sketch: sk2.id, kind: 'simple', d: holeD, through: true });
  const pat = P.addFeature(part, 'cpattern', { seeds: [hole.id], axis: { kind: 'axis', feature: rev.id }, count: holes, angle: 360 });
  return { part, ids: { profile: sk1.id, revolve: rev.id, holeSketch: sk2.id, hole: hole.id, pattern: pat.id }, dims: fs.dims, lines: fs.lines };
}

export const flangeExact = () => Math.PI * 302160;
export const facetFactor = (n) => (n / 2) * Math.sin(2 * Math.PI / n);

/** A 100 × 50 × 20 block on the top plane with its corner at the origin (fully defined). */
export function blockSketch(w = 100, h = 50) {
  const sk = S.newSketch();
  const r = S.addRect(sk, [3, 4], [w - 5, h + 3]);
  const l0 = sk.entities.find((e) => e.id === r.lines[0]);
  S.addConstraint(sk, 'coincident', [l0.p1, 'O']);
  const dw = S.addConstraint(sk, 'distance', [r.lines[0]], w).id;
  const dh = S.addConstraint(sk, 'distance', [r.lines[1]], h).id;
  return { sk, lines: r.lines, dw, dh };
}
