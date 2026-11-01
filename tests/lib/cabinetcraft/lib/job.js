/* SPDX-License-Identifier: Apache-2.0 */
/**
 * job.js — from the cabinets in a drawing to what the shop needs (0.8 SU.1035, session `sx-cabinet`). DOM-free: the parts of
 * every cabinet, a nest per material and thickness (lib/nest, the add-on's synced copy), the cut order, the labels in that
 * order, one DXF with every sheet. Sizes in the cabinets' rule unit (mm or in).
 *
 *   jobParts(cabs, { word }) → lib/cutlist parts of [{ cab, R }]; word(key, vars) writes the part names and the default material
 *     and banding names (keys of model.js) in the person's language, vars { t (thickness), unit } — names a shop typed stay
 *   nestJob(parts, { sheet: {w, h, margin}, spacing, tries, timeLimit, seed, deductBand }) →
 *     { mats: [{ key, material, thickness, parts, result, sheetBase }], seq (lib/cutlist nestSequence over every material, sheet
 *       numbers running on), sheets (count), unplaced: [{ id, name, material, why }], efficiency (by material) }
 *   jobDxf(job, sheet, { units }) → DXF R12 text: every sheet of every material, one under the next, parts named by piece id
 *   jobLabels(parts, job | null, { fmt, words }) → label items (lib/cutlist labels.js) in nest order (job) or cut-list order
 */
import { cabinetParts, isWordKey } from './model.js';
import { cleanPart, expand, cutSize, toNestParts, byMaterial, nestSequence } from './cutlist/cutlist.js';
import { labelItem, WORDS } from './cutlist/labels.js';
import { nest, nestDxf } from './nest/nest.js';

export function jobParts(cabs, { word = (k) => k, fmt = (v) => String(v) } = {}) {
  const out = [];
  for (const { cab, R } of cabs) {
    const say = (s, th) => (isWordKey(s) ? word(s, { t: fmt(th), unit: R.unit }) : s);
    for (const p of cabinetParts(cab, R)) {
      const band = {};
      for (const [side, b] of Object.entries(p.band || {})) band[side] = b ? { ...b, code: say(b.code, b.thickness) } : b;
      out.push({ ...p, nameKey: p.name, name: say(p.name), material: say(p.material, p.thickness), band });
    }
  }
  return out;
}

export function nestJob(parts, { sheet = { w: 2440, h: 1220, margin: 10 }, spacing = 8, tries = 6, timeLimit = 20000, seed = 1, deductBand = true } = {}) {
  const groups = byMaterial(toNestParts(parts, { deductBand }));
  const mats = [], seq = [], unplaced = [];
  let base = 0;
  for (const g of groups) {
    const result = nest(g.parts, { w: sheet.w, h: sheet.h, margin: sheet.margin || 0 }, { spacing, tries, timeLimit, seed });
    mats.push({ ...g, result, sheetBase: base });
    seq.push(...nestSequence(result, g.parts, { sheetBase: base }));
    for (const u of result.unplaced) unplaced.push({ id: u.id, name: u.name, material: g.material, why: u.why });
    base += result.sheets.length;
  }
  return { mats, seq, sheets: base, unplaced, efficiency: mats.map((m) => ({ material: m.material, thickness: m.thickness, sheets: m.result.sheets.length, efficiency: m.result.efficiency })) };
}

export function jobDxf(job, sheet, { units = 'mm' } = {}) {
  const placed = [], sheets = [];
  const bySeq = new Map(job.seq.map((s) => [s.id + '#' + s.copy, s]));
  for (const m of job.mats) {
    for (const p of m.result.placed) {
      const s = bySeq.get(p.id + '#' + ((p.copy ?? 0) + 1));
      placed.push({ ...p, sheet: p.sheet + m.sheetBase, name: s ? s.pieceId + ' (' + s.n + ')' : p.id });
    }
    sheets.push(...m.result.sheets);
  }
  return nestDxf({ placed, sheets, unplaced: [] }, { w: sheet.w, h: sheet.h, margin: sheet.margin || 0 }, { units });
}

export function jobLabels(parts, job, { fmt = String, words = WORDS } = {}) {
  const pieces = expand(parts.map(cleanPart).filter(Boolean));
  const byId = new Map(pieces.map((p) => [p.pieceId, p]));
  const item = (p, nestAt) => labelItem(p, { fmt, words, nest: nestAt, cut: cutSize(p) });
  if (!job) return pieces.map((p) => item(p, null));
  const out = [];
  for (const s of job.seq) { const p = byId.get(s.pieceId); if (p) out.push(item(p, { sheet: s.sheet, n: s.n })); }
  // pieces that did not nest (too big for the sheet) still get a label, at the end
  const done = new Set(job.seq.map((s) => s.pieceId));
  for (const p of pieces) if (!done.has(p.pieceId)) out.push(item(p, null));
  return out;
}
