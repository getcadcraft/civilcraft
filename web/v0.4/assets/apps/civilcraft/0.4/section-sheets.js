/* SPDX-License-Identifier: Apache-2.0 */
/**
 * section-sheets.js — cross-section sheets: an alignment's sections (sections.js buildSections) in rows on PDF pages
 * (0.4 V17). No DOM; the Node test drives it (bin/test-civilcraft-sections.mjs § sheets) and plot.js toPdfPages writes it.
 *
 *   sectionSheets(set, { paper, landscape, scale, vex, units, title, name, from, to }) → { sheets, cell, perPage, vex, notes }
 *     Every section gets a cell of the same size: offsets across at the plan scale (left + right), elevations at scale ×
 *     vex, the cell tall enough for the biggest relief in the set; cells fill rows left to right, top to bottom, in station
 *     order, over as many pages as needed. A cell: grid (offsets every nice step, elevations every nice step, labeled),
 *     the existing ground dashed, the design solid, cut and fill filled light (orange / green), the corridor points, and
 *     under it "Sta 1+50.00   Cut 12.34 sq ft   Fill 5.67 sq ft". A title strip on every page names the alignment, the
 *     stations on it, the scales and "Sheet n of N".
 *     vex: wanted exaggeration (1 2 5 10); lowered to the largest that fits a cell on the page (said).
 */

import { t } from './i18n.js';
import { MARGIN, TITLE_H, orient, paperBy } from './plot.js';
import { formatStation, fixed, unitOf } from './units.js';
import { zAt } from './sections.js';

const INK = '#000000', EG = '#606060', FG = '#c00000', GRID = '#c4c4c4', CUT = '#f3c9a6', FILL = '#bfe3c4', MARK = '#8a6200';
export const SHEET_VEXES = [10, 5, 2, 1];

export function sectionSheets(set, { paper = 'tabloid', landscape = true, scale, vex = 5, units = 'ft', title = '', name = '', from = -Infinity, to = Infinity } = {}) {
  const secs = (set?.sections || []).filter((x) => x.sta >= from - 1e-9 && x.sta <= to + 1e-9);
  const notes = [];
  if (!secs.length) return { sheets: [], cell: null, perPage: 0, vex, notes: [t('xs.none')] };
  const P = orient(paperBy(paper), landscape);
  const area = { x0: MARGIN + 4, x1: P.w - MARGIN - 4, y0: MARGIN + TITLE_H + 4, y1: P.h - MARGIN - 4 };
  const s = scale.mmPerUnit;
  const left = secs[0].left, right = secs[0].right;
  const relief = (x) => { let lo = Infinity, hi = -Infinity; for (const r of [...x.ground, ...x.design]) for (const q of r) { lo = Math.min(lo, q.z); hi = Math.max(hi, q.z); } return Number.isFinite(lo) ? [lo, hi] : null; };
  const rel = secs.map(relief);
  const maxRel = Math.max(1, ...rel.filter(Boolean).map(([lo, hi]) => hi - lo));
  const padX = 14, padTop = 6, padBot = 13;   // mm: elevation labels at the left, the station line under the cell
  const cw = (left + right) * s + padX + 4;
  if (cw > area.x1 - area.x0) notes.push(t('xs.wide'));
  const fitV = (v) => maxRel * 1.2 * s * v + padTop + padBot <= area.y1 - area.y0;
  const want = SHEET_VEXES.includes(vex) ? vex : 5;
  const used = SHEET_VEXES.filter((v) => v <= want).find(fitV) ?? 1;
  if (used !== want) notes.push(t('xs.vex', { want, used }));
  const sv = s * used;
  const ch = maxRel * 1.2 * sv + padTop + padBot;
  const cols = Math.max(1, Math.floor((area.x1 - area.x0) / cw)), rows = Math.max(1, Math.floor((area.y1 - area.y0) / ch));
  const perPage = cols * rows;
  const pages = Math.ceil(secs.length / perPage);
  const oStepRaw = 10 / s, oStep = [1, 2, 5, 10, 20, 25, 50, 100, 200].find((v) => v >= oStepRaw) || 200;
  const zStepRaw = 5 / sv, zStep = [0.1, 0.2, 0.5, 1, 2, 5, 10, 20, 50].find((v) => v >= zStepRaw) || 50;
  const hLabel = scale.label, vLabel = units === 'm' ? '1:' + Math.round(1000 / sv) : '1" = ' + String(+(25.4 / sv).toFixed(1)) + "'";
  const areaU = unitOf(units).area;
  const sheets = [];
  for (let pg = 0; pg < pages; pg++) {
    const strokes = [], texts = [], fills = [];
    const here = secs.slice(pg * perPage, (pg + 1) * perPage);
    here.forEach((x, k) => {
      const col = k % cols, row = Math.floor(k / cols);
      const cx0 = area.x0 + col * cw + padX, cy1 = area.y1 - row * ch - padTop, cy0 = cy1 - (ch - padTop - padBot);
      const r = rel[pg * perPage + k] || [0, 1], zmid = (r[0] + r[1]) / 2, zSpan = (cy1 - cy0) / sv;
      const z0 = Math.floor((zmid - zSpan / 2) / zStep) * zStep;
      const X = (o) => cx0 + (o + left) * s, Y = (z) => cy0 + (z - z0) * sv;
      const xr = X(right);
      // grid
      for (let o = Math.ceil(-left / oStep) * oStep; o <= right + 1e-9; o += oStep) {
        strokes.push({ color: GRID, width: 0.08, pts: [{ x: X(o), y: cy0 }, { x: X(o), y: cy1 }] });
        texts.push({ color: INK, x: X(o), y: cy0 - 2.6, h: 1.3, rot: 0, align: 'center', text: (o > 0 ? '+' : '') + fixed(o, 0) });
      }
      for (let z = z0; z <= z0 + zSpan + 1e-9; z += zStep) {
        const y = Y(z);
        if (y > cy1 + 1e-6) break;
        strokes.push({ color: GRID, width: 0.08, pts: [{ x: cx0, y }, { x: xr, y }] });
        texts.push({ color: INK, x: cx0 - 1, y, h: 1.3, rot: 0, align: 'right', middle: true, text: fixed(z, zStep < 1 ? 1 : 0).replace(/,/g, '') });
      }
      strokes.push({ color: INK, width: 0.25, pts: [{ x: cx0, y: cy0 }, { x: xr, y: cy0 }, { x: xr, y: cy1 }, { x: cx0, y: cy1 }], closed: true });
      strokes.push({ color: FG, width: 0.15, dash: [3, 1, 0.5, 1], pts: [{ x: X(0), y: cy0 }, { x: X(0), y: cy1 }] });
      // cut and fill
      const os = [...new Set([...x.ground, ...x.design].flat().map((q) => q.o))].sort((a, b) => a - b);
      for (const part of x.parts) {
        const xs = [part.o0, ...os.filter((o) => o > part.o0 && o < part.o1), part.o1];
        const top = xs.map((o) => ({ x: X(o), y: Y(zAt(x.design, o)) })), bot = xs.slice().reverse().map((o) => ({ x: X(o), y: Y(zAt(x.ground, o)) }));
        if (top.concat(bot).every((q) => Number.isFinite(q.y))) fills.push({ color: part.kind === 'cut' ? CUT : FILL, pts: [...top, ...bot] });
      }
      for (const run of x.ground) strokes.push({ color: EG, width: 0.25, dash: [1.5, 0.8], pts: run.map((q) => ({ x: X(q.o), y: Y(q.z) })) });
      if (x.design !== x.ground) for (const run of x.design) strokes.push({ color: FG, width: 0.4, pts: run.map((q) => ({ x: X(q.o), y: Y(q.z) })) });
      for (const m of x.marks || []) if (Number.isFinite(m.z)) { const q = { x: X(m.o), y: Y(m.z) }; strokes.push({ color: MARK, width: 0.25, pts: [{ x: q.x - 0.6, y: q.y - 0.6 }, { x: q.x + 0.6, y: q.y + 0.6 }, { x: q.x - 0.6, y: q.y + 0.6 }, { x: q.x + 0.6, y: q.y - 0.6 }] }); }
      texts.push({ color: INK, x: (cx0 + xr) / 2, y: cy0 - 7.5, h: 1.8, rot: 0, align: 'center', text: t('xs.cell', { sta: formatStation(x.sta, units), cut: fixed(x.cut, 2), fill: fixed(x.fill, 2), u: areaU }) });
    });
    const chrome = [], tt = [];
    chrome.push({ color: INK, width: 0.5, pts: [{ x: MARGIN, y: MARGIN }, { x: P.w - MARGIN, y: MARGIN }, { x: P.w - MARGIN, y: P.h - MARGIN }, { x: MARGIN, y: P.h - MARGIN }], closed: true });
    chrome.push({ color: INK, width: 0.35, pts: [{ x: MARGIN, y: MARGIN + TITLE_H }, { x: P.w - MARGIN, y: MARGIN + TITLE_H }] });
    tt.push({ color: INK, x: MARGIN + 4, y: MARGIN + TITLE_H - 6, h: 4, rot: 0, align: 'left', text: title || name });
    tt.push({ color: INK, x: MARGIN + 4, y: MARGIN + 3.5, h: 2.2, rot: 0, align: 'left', text: t('xs.strip', { name, a: formatStation(here[0].sta, units), b: formatStation(here[here.length - 1].sta, units), h: hLabel, v: vLabel, vex: used }) });
    tt.push({ color: INK, x: P.w - MARGIN - 4, y: MARGIN + TITLE_H - 6, h: 4, rot: 0, align: 'right', text: t('pp.sheet', { n: pg + 1, N: pages }) });
    tt.push({ color: INK, x: P.w - MARGIN - 4, y: MARGIN + 3.5, h: 2.2, rot: 0, align: 'right', text: t('pp.made', { date: new Date().toISOString().slice(0, 10) }) });
    sheets.push({ w: P.w, h: P.h, name: (title || name) + ' ' + (pg + 1), views: [{ clip: { x0: MARGIN, y0: MARGIN + TITLE_H, x1: P.w - MARGIN, y1: P.h - MARGIN }, strokes, texts, fills }], chrome, chromeTexts: tt, stations: here.map((x) => x.sta) });
  }
  return { sheets, cell: { w: cw, h: ch, cols, rows }, perPage, vex: used, notes };
}
