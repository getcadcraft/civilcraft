/* SPDX-License-Identifier: Apache-2.0 */
/**
 * sheets.js — the per-job cut list and sheet optimisation, on the shared lib/cutlist and lib/nest (0.8 DC.117, session `cabinetcraft_addon`).
 * DOM-free. The CadCraft Cabinets add-on's job.js nests with one sheet size for the whole job; here every material has its own sheet
 * (a 2800 × 2070 back board beside 2440 × 1220 melamine), parts that are cut by length (the face frame's hardwood) are left out of
 * the sheets and listed as linear stock, and a nest that leaves parts unplaced says which and why.
 *
 *   sheetParts(parts) → { sheet: [parts nested on sheets], linear: [parts cut from boards by length] }
 *   cutListOf(parts, { sheet }) → lib/cutlist cutList (groups, banding, sheet estimate) over the sheet parts
 *   nestAll(parts, { sheetOf(material, thickness) → {w, h}, margin, spacing, tries, timeLimit, seed, deductBand }) →
 *     { mats: [{ key, material, thickness, sheet: {w, h}, parts, result, sheetBase }], seq, sheets (count), unplaced, efficiency }
 *   nestDxf(job, { units }) → DXF R12 of every sheet (layers SHEET / PARTS / LABELS) — what PartCraft's Manufacture › Nested sheets reads
 *   labelsOf(parts, job | null, { fmt, words }) → label items in nest order (lib/cutlist labels.js)
 *   linearList(linear, { unit }) → [{ material, thickness, width, pieces, length (total, rule units), rows }]   the hardwood to buy
 */
import { cleanPart, expand, cutSize, toNestParts, byMaterial, nestSequence, cutList } from './cutlist/cutlist.js';
import { labelItem, WORDS } from './cutlist/labels.js';
import { nest, nestDxf as nestDxfRaw } from './nest/nest.js';
import { r6 } from './core.js';

export function sheetParts(parts) {
  const sheet = [], linear = [];
  for (const p of parts) (p.meta && p.meta.linear ? linear : sheet).push(p);
  return { sheet, linear };
}

export function cutListOf(parts, { sheet = null, ...rest } = {}) {
  return cutList(sheetParts(parts).sheet, { sheet, ...rest });
}

/** The nest's groups: parts of one material and thickness. */
export function nestGroups(parts, { deductBand = true } = {}) { return byMaterial(toNestParts(sheetParts(parts).sheet, { deductBand })); }

/** One group nested. → { mat, seq, unplaced } ; base = the sheets the groups before it used. onProgress({ done, total }) after each try. */
export function nestOne(g, base, { sheetOf, margin = 10, spacing = 8, tries = 6, timeLimit = 20000, seed = 1, onProgress = null } = {}) {
  const sh = sheetOf(g.material, g.thickness);
  const result = nest(g.parts, { w: sh.w, h: sh.h, margin }, { spacing, tries, timeLimit, seed, ...(onProgress ? { onProgress: (done, total) => onProgress({ done, total }) } : {}) });
  return {
    mat: { ...g, sheet: sh, result, sheetBase: base },
    seq: nestSequence(result, g.parts, { sheetBase: base }),
    unplaced: result.unplaced.map((u) => ({ id: u.id, name: u.name, material: g.material, why: u.why })),
  };
}

/** The pieces of a nest put together (also what the worker's answer is joined into). */
export function nestJoin(done, margin) {
  const mats = done.map((d) => d.mat), seq = done.flatMap((d) => d.seq), unplaced = done.flatMap((d) => d.unplaced);
  const sheets = mats.reduce((n, m) => n + m.result.sheets.length, 0);
  return { mats, seq, sheets, unplaced, margin, efficiency: mats.map((m) => ({ material: m.material, thickness: m.thickness, sheets: m.result.sheets.length, efficiency: m.result.efficiency, sheet: m.sheet })) };
}

/** onProgress({ group, groups, material, done, total }) after each try of each material. */
export function nestAll(parts, { sheetOf, margin = 10, spacing = 8, tries = 6, timeLimit = 20000, seed = 1, deductBand = true, onProgress = null } = {}) {
  const groups = nestGroups(parts, { deductBand });
  const done = [];
  let base = 0;
  groups.forEach((g, gi) => {
    const r = nestOne(g, base, { sheetOf, margin, spacing, tries, timeLimit, seed, onProgress: onProgress ? (p) => onProgress({ group: gi + 1, groups: groups.length, material: g.material, thickness: g.thickness, ...p }) : null });
    done.push(r);
    base += r.mat.result.sheets.length;
  });
  return nestJoin(done, margin);
}

export function nestDxf(job, { units = 'mm' } = {}) {
  const placed = [], sheets = [], shapes = [];
  const bySeq = new Map(job.seq.map((s) => [s.id + '#' + s.copy, s]));
  for (const m of job.mats) {
    for (const p of m.result.placed) {
      const s = bySeq.get(p.id + '#' + ((p.copy ?? 0) + 1));
      placed.push({ ...p, sheet: p.sheet + m.sheetBase, name: s ? s.pieceId + ' (' + s.n + ')' : p.id });
    }
    for (const sh of m.result.sheets) { sheets.push(sh); shapes.push({ w: m.sheet.w, h: m.sheet.h }); }
  }
  const W = Math.max(0, ...shapes.map((s) => s.w)), H = Math.max(0, ...shapes.map((s) => s.h));
  return nestDxfRaw({ placed, sheets, unplaced: [], sheetShapes: shapes }, { w: W || 2440, h: H || 1220, margin: job.margin || 0 }, { units });
}

export function labelsOf(parts, job, { fmt = String, words = WORDS } = {}) {
  const pieces = expand(sheetParts(parts).sheet.concat(sheetParts(parts).linear).map(cleanPart).filter(Boolean));
  const byId = new Map(pieces.map((p) => [p.pieceId, p]));
  const item = (p, at) => labelItem(p, { fmt, words, nest: at, cut: cutSize(p) });
  if (!job) return pieces.map((p) => item(p, null));
  const out = [];
  for (const s of job.seq) { const p = byId.get(s.pieceId); if (p) out.push(item(p, { sheet: s.sheet, n: s.n })); }
  const done = new Set(job.seq.map((s) => s.pieceId));
  for (const p of pieces) if (!done.has(p.pieceId)) out.push(item(p, null));   // linear stock and anything that did not nest: at the end
  return out;
}

export function linearList(linear) {
  const g = new Map();
  for (const p of linear.map(cleanPart).filter(Boolean)) {
    const k = p.material + '|' + p.thickness + '|' + p.width;
    if (!g.has(k)) g.set(k, { material: p.material, thickness: p.thickness, width: p.width, pieces: 0, length: 0 });
    const e = g.get(k);
    e.pieces += p.qty; e.length += p.qty * p.length;
  }
  return [...g.values()].map((e) => ({ ...e, length: r6(e.length) })).sort((a, b) => a.material.localeCompare(b.material) || a.width - b.width);
}
