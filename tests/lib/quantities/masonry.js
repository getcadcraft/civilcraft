// SPDX-License-Identifier: Apache-2.0
/**
 * masonry.js — bricks or blocks and mortar, counted from the unit size and joint a wall type carries (booklet row BK.42, session
 * bk-measure-10; the data is typedata.js, BK.40). Host-free: no imports, no DOM. Lengths in mm, areas in mm², volumes in mm³.
 * Canonical copy: lib/quantities/ (node tools/quantities/sync.mjs copies it to the apps).
 *
 * The formulas, exactly as computed (the apps' help states the same):
 *   units per area of one leaf   = 1 / ((unit length + joint) x (unit height + joint))          one unit thick, laid lengthways
 *   unit widths across a leaf    = (leaf thickness + joint) / (unit width + joint), rounded to a whole number, at least 1
 *                                  (a 102.5 mm leaf of 102.5 mm bricks = 1; a 215 mm wall of the same bricks = 2)
 *   units in a leaf              = units per area x unit widths across x net area of the wall face
 *   units to order               = units x (1 + waste % / 100), rounded UP to a whole unit
 *   mortar in a leaf             = net area x leaf thickness - units x (unit length x unit height x unit width), never below zero,
 *                                  then x (1 + extra % / 100)   [the person's own factor for frogs or perforations]
 *                                  then x (1 + allowance % / 100) [only if the measurement method states one]
 *   a wall type's count and mortar = the sum over its masonry leaves
 *
 * What is assumed: every masonry leaf of a type is built of the type's one unit and joint; a leaf thicker than one unit width is
 * taken as that many unit widths across, each counted like a leaf laid lengthways (so bond patterns that keep the same number of
 * units per face area, such as a one-unit-thick wall in any common bond, count the same; cut units, closers and special shapes are
 * not counted apart); the mortar is the leaf's volume less the units' volume, so the joint between two unit widths is in it.
 * Without a unit width the count assumes one unit width across and no mortar volume is given.
 *
 *   masonryLeaves(layers) → [{ index, t, mat }]   the layers flagged `masonry` (a material with a thickness); none flagged:
 *                                                   the core's material layers, with `assumed: true` on each
 *   unitsPerArea(unit, joint) → units per mm² of one leaf (0 without a length and a height)
 *   PER_M2, PER_FT2            mm² in a m² and in a ft² (x unitsPerArea = units per m² / per ft²)
 *   widthsAcross(leafT, unit, joint) → whole number ≥ 1
 *   masonryOf({ data, layers, netArea, waste, allowance }) → null (no unit size) or
 *     { perArea, perM2, perFt2, leaves: [{ index, t, across, units, mortar | null, assumed }], unitsNet, wastePct, units, unitsOrder,
 *       mortar | null (mm³), extraPct, allowancePct, assumedLeaves }
 *     data: the type's takeoff data; waste: { pct } the method's stated waste, used only when the type has none; allowance: the
 *     method's stated mortar allowance in percent (0 or missing = none)
 */

export const PER_M2 = 1e6;
export const PER_FT2 = 304.8 * 304.8;
const pos = (v) => (typeof v === 'number' && Number.isFinite(v) && v > 0 ? v : 0);

export function masonryLeaves(layers) {
  const list = Array.isArray(layers) ? layers : [];
  const real = (l) => l && l.kind !== 'cavity' && l.t > 0;
  const flagged = list.map((l, index) => (real(l) && l.masonry === true ? { index, t: l.t, mat: String(l.mat ?? '') } : null)).filter(Boolean);
  if (flagged.length) return flagged;
  return list.map((l, index) => (real(l) && l.core ? { index, t: l.t, mat: String(l.mat ?? ''), assumed: true } : null)).filter(Boolean);
}

export function unitsPerArea(unit, joint = 0) {
  const L = pos(unit?.length), H = pos(unit?.height), j = pos(joint);
  return L && H ? 1 / ((L + j) * (H + j)) : 0;
}

export function widthsAcross(leafT, unit, joint = 0) {
  const W = pos(unit?.width), j = pos(joint);
  if (!W) return 1;
  return Math.max(1, Math.round((pos(leafT) + j) / (W + j)));
}

export function masonryOf({ data, layers, netArea = 0, waste = null, allowance = 0 } = {}) {
  const unit = data?.unit, joint = pos(data?.mortar?.joint);
  const perArea = unitsPerArea(unit, joint);
  if (!perArea) return null;
  const A = pos(netArea), W = pos(unit.width);
  const own = typeof unit.waste === 'number' && Number.isFinite(unit.waste) && unit.waste >= 0;
  const wastePct = own ? unit.waste : pos(waste?.pct);
  const extraPct = pos(data?.mortar?.extra), allowancePct = pos(allowance);
  const unitVol = pos(unit.length) * pos(unit.height) * W;
  const leaves = masonryLeaves(layers).map((lf) => {
    const across = widthsAcross(lf.t, unit, joint);
    const units = perArea * across * A;
    const mortar = W ? Math.max(0, A * lf.t - units * unitVol) * (1 + extraPct / 100) * (1 + allowancePct / 100) : null;
    return { index: lf.index, t: lf.t, mat: lf.mat, across, units, mortar, ...(lf.assumed ? { assumed: true } : {}) };
  });
  const unitsNet = leaves.reduce((s, l) => s + l.units, 0);
  const units = unitsNet * (1 + wastePct / 100);
  return {
    perArea, perM2: perArea * PER_M2, perFt2: perArea * PER_FT2, leaves, unitsNet, wastePct, wasteFrom: own ? 'type' : (wastePct > 0 ? 'method' : 'none'),
    units, unitsOrder: Math.ceil(units - 1e-9),
    mortar: W && leaves.length ? leaves.reduce((s, l) => s + l.mortar, 0) : null, extraPct, allowancePct,
    assumedLeaves: leaves.some((l) => l.assumed),
  };
}
