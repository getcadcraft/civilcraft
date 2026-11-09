/* SPDX-License-Identifier: Apache-2.0 */
/**
 * design.js — one call from a project to a full result (0.9 LD.6): the room, the luminaires, the maintenance factor, the requirements.
 *   runDesign({ room, luminaires, llf, spacing, requirements, eyeHeight, ugr: true }) → result of runRoom + { ugr, observers, checks, notes: [key] }
 */
import { runRoom, polyArea } from './calc.js';
import { ugrRoom } from './ugr.js';
import { checkResult } from './standards.js';

/** Notes every result carries: what the numbers are and what they leave out. Keys of lang `note.*`. */
export const NOTES = ['note.model', 'note.llf', 'note.ugr'];
export function runDesign(p) {
  const res = runRoom(p);
  let u = null;
  if (p.ugr !== false) { try { u = ugrRoom(res.prep, res.sol, p.luminaires, { eyeHeight: p.eyeHeight || 1200 }); } catch { u = null; } }
  res.ugr = u ? u.ugr : null; res.observers = u ? u.observers : [];
  const ras = p.luminaires.map((l) => l.photo.ra).filter((x) => x > 0);
  res.ra = ras.length ? Math.min(...ras) : 0;
  res.checks = checkResult(res, p.requirements || {}, { ugr: res.ugr, ra: res.ra });
  res.notes = NOTES.slice();
  if (!p.luminaires.some((l) => l.photo.width > 0 && l.photo.length > 0)) res.notes.push('note.opening');
  if (res.areaM2 !== polyArea(res.room.polygon)) res.areaM2 = polyArea(res.room.polygon);
  return res;
}
