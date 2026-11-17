/* SPDX-License-Identifier: Apache-2.0 */
/**
 * pagesize.js: a PDF page's size in mm and inches, its nearest named paper size, and a set grouped by size (0.10 SU.1805). No DOM.
 * Canonical copy: lib/pagesize/. MarkupCraft and TakeoffCraft each carry a byte-identical copy in <app>/dev/pagesize.js
 * (`node tools/pagesize/sync.mjs [--check] markupcraft takeoffcraft`; nobody edits a copy).
 *
 *   pageSize({ width, height, userUnit }, { tolMm }) → { wMm, hMm, wIn, hIn, orient, name, series, deltaMm, near, custom }
 *       width/height: the page as shown (rotation applied), in PDF user units (1/72 in); userUnit scales them (PDF 1.6 /UserUnit).
 *       name: the named size within `tolMm` (default 2 mm on each side, either orientation) or null; custom = name === null;
 *       near: { name, deltaMm } nearest named size even when it is too far to be called by its name (null for a page of no size).
 *   sizeText(info) → "210 × 297 mm (8.27 × 11.69 in)"      numbers only, no words (the host adds the name and the translated "custom")
 *   groupBySize([{ key, info }]) → [{ id, name, wMm, hMm, keys, odd }]   biggest group first; every other group is "odd" when the set has more than one
 *
 * Sizes and where they come from. A page is compared as (short side, long side), so a landscape sheet matches its portrait size.
 *   ISO 216:2007 table 1 (A series) and table 2 (B series); ISO 269:1985 (C series, envelopes) - the sizes are millimetres as the standards print them.
 *   ANSI/ASME Y14.1-2020 (decimal inch sheets A to E: 8.5 x 11, 11 x 17, 17 x 22, 22 x 34, 34 x 44 in).
 *   Architectural series ARCH A to E (9 x 12, 12 x 18, 18 x 24, 24 x 36, 36 x 48 in), the sheet sizes of the US National CAD Standard / ASME Y14.1 architectural list.
 * test/pagesize.test.mjs checks the ISO tables against their own definitions (A0 = 1 m2 at 1:sqrt 2, B0 1000 mm wide, C0 the geometric mean of A0 and B0)
 * and that no two names are within the tolerance of each other. The ANSI and ARCH inch values were NOT compared with the printed standards (no copy was open when this was written).
 */

const IN = 25.4;
const iso = (series, source, rows) => rows.map(([n, w, h]) => ({ name: series + n, series: 'ISO ' + (series === 'C' ? '269' : '216') + ' ' + series, source, w, h }));
const inch = (series, rows, source) => rows.map(([n, w, h]) => ({ name: series + ' ' + n, series, source, w: +(w * IN).toFixed(1), h: +(h * IN).toFixed(1) }));

export const SOURCES = {
  A: 'ISO 216:2007, table 1', B: 'ISO 216:2007, table 2', C: 'ISO 269:1985',
  ANSI: 'ANSI/ASME Y14.1-2020 (decimal inch sheets)', ARCH: 'architectural sheet sizes (US National CAD Standard, ASME Y14.1 list)',
};

export const SIZES = [
  ...iso('A', SOURCES.A, [[0, 841, 1189], [1, 594, 841], [2, 420, 594], [3, 297, 420], [4, 210, 297], [5, 148, 210], [6, 105, 148], [7, 74, 105]]),
  ...iso('B', SOURCES.B, [[0, 1000, 1414], [1, 707, 1000], [2, 500, 707], [3, 353, 500], [4, 250, 353], [5, 176, 250], [6, 125, 176]]),
  ...iso('C', SOURCES.C, [[0, 917, 1297], [1, 648, 917], [2, 458, 648], [3, 324, 458], [4, 229, 324], [5, 162, 229], [6, 114, 162]]),
  ...inch('ANSI', [['A', 8.5, 11], ['B', 11, 17], ['C', 17, 22], ['D', 22, 34], ['E', 34, 44]], SOURCES.ANSI),
  ...inch('ARCH', [['A', 9, 12], ['B', 12, 18], ['C', 18, 24], ['D', 24, 36], ['E', 36, 48]], SOURCES.ARCH),
].map((s) => ({ ...s, w: Math.min(s.w, s.h), h: Math.max(s.w, s.h) }));

export const DEFAULT_TOL_MM = 2;
export const ptToMm = (pt, userUnit = 1) => (+pt || 0) * (+userUnit || 1) * IN / 72;

export function pageSize({ width, height, userUnit = 1 } = {}, { tolMm = DEFAULT_TOL_MM } = {}) {
  const wMm = ptToMm(width, userUnit), hMm = ptToMm(height, userUnit);
  if (!(wMm > 0) || !(hMm > 0)) return { wMm: 0, hMm: 0, wIn: 0, hIn: 0, orient: 'portrait', name: null, series: null, deltaMm: null, near: null, custom: true };
  const lo = Math.min(wMm, hMm), hi = Math.max(wMm, hMm);
  let best = null;
  for (const s of SIZES) {
    const d = Math.max(Math.abs(s.w - lo), Math.abs(s.h - hi));
    if (!best || d < best.d) best = { s, d };
  }
  const near = best ? { name: best.s.name, deltaMm: +best.d.toFixed(1) } : null;
  const hit = best && best.d <= tolMm ? best : null;
  return {
    wMm, hMm, wIn: wMm / IN, hIn: hMm / IN,
    orient: Math.abs(wMm - hMm) < 1 ? 'square' : wMm > hMm ? 'landscape' : 'portrait',
    name: hit ? hit.s.name : null, series: hit ? hit.s.series : null, deltaMm: hit ? +hit.d.toFixed(1) : null,
    near, custom: !hit,
  };
}

const trim = (n, d) => String(+n.toFixed(d));
export function sizeText(info) {
  if (!info || !(info.wMm > 0)) return '';
  return trim(info.wMm, info.wMm >= 100 ? 0 : 1) + ' × ' + trim(info.hMm, info.hMm >= 100 ? 0 : 1) + ' mm (' + info.wIn.toFixed(2) + ' × ' + info.hIn.toFixed(2) + ' in)';
}

/** The set's pages grouped by size, orientation ignored; the biggest group first (ties: the one met first). Every other group is "odd". */
export function groupBySize(items) {
  const groups = new Map();
  for (const { key, info } of items) {
    if (!info) continue;
    const lo = Math.min(info.wMm, info.hMm), hi = Math.max(info.wMm, info.hMm);
    const id = info.name || 'custom:' + Math.round(lo) + 'x' + Math.round(hi);
    let g = groups.get(id);
    if (!g) groups.set(id, g = { id, name: info.name, wMm: lo, hMm: hi, keys: [], odd: false });
    g.keys.push(key);
  }
  const out = [...groups.values()].sort((a, b) => b.keys.length - a.keys.length);   // Array sort is stable: ties keep first-met order
  out.forEach((g, i) => { g.odd = i > 0; });
  return out;
}
