/* SPDX-License-Identifier: Apache-2.0 */
/**
 * standards.js — task lighting requirements to check a design against (0.9 LD.5). The numbers are TYPICAL values for the kind of room in the style of EN 12464-1
 * (maintained mean illuminance Em lx, uniformity Uo = min / mean, UGR limit, colour rendering Ra), typed from memory of the standard, NOT checked against the edition
 * you work to. UNVERIFIED: the panel says so, the report says so, and every number can be typed over. Nothing here is a claim that a design complies.
 */
export const REQUIREMENTS_NOTE = 'Typical values in the style of EN 12464-1, not checked against the current edition. Confirm against the standard and the local rules you must meet, or type your own.';
// id, Em lx, Uo, UGRL, Ra
export const PRESETS = [
  ['office.writing', 500, 0.6, 19, 80], ['office.cad', 500, 0.6, 19, 80], ['office.conference', 500, 0.6, 19, 80], ['office.reception', 300, 0.6, 22, 80],
  ['office.filing', 300, 0.4, 25, 80], ['school.classroom', 300, 0.6, 19, 80], ['health.exam', 500, 0.6, 19, 90], ['retail.sales', 300, 0.4, 22, 80],
  ['kitchen.commercial', 500, 0.6, 22, 80], ['workshop.medium', 500, 0.6, 22, 80], ['workshop.fine', 750, 0.7, 19, 80], ['storage.general', 100, 0.4, 25, 60],
  ['circulation.corridor', 100, 0.4, 28, 40], ['circulation.stairs', 100, 0.4, 25, 40], ['toilets', 200, 0.4, 25, 80],
].map(([id, em, uo, ugr, ra]) => ({ id, em, uo, ugr, ra }));
export const presetById = (id) => PRESETS.find((p) => p.id === id) || null;

/** Checks of a result against requirements { em, uo, ugr, ra, lpd } (any may be 0/absent = not checked) → [{ key, op, req, found, ok }]. `ra` is the luminaires' lowest Ra, 0 = unknown. */
export function checkResult(res, req = {}, { ugr = null, ra = 0 } = {}) {
  const out = [], push = (key, op, r, found, ok) => out.push({ key, op, req: r, found, ok });
  if (req.em > 0) push('em', '>=', req.em, res.em, res.em >= req.em);
  if (req.uo > 0) push('uo', '>=', req.uo, res.uo, res.uo >= req.uo);
  if (req.ugr > 0 && ugr !== null) push('ugr', '<=', req.ugr, ugr, ugr <= req.ugr);
  if (req.ra > 0 && ra > 0) push('ra', '>=', req.ra, ra, ra >= req.ra);
  if (req.lpd > 0) push('lpd', '<=', req.lpd, res.lpd, res.lpd <= req.lpd);
  return out;
}
