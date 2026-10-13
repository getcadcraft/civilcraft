/* SPDX-License-Identifier: Apache-2.0 */
/**
 * staking.js — staking reports (0.4 V23): stakes along an alignment at stations and offsets, or survey points measured
 * against it, each with its station, offset, northing, easting, design elevation, ground elevation and cut or fill; as CSV
 * and as PDF table pages. No DOM; the Node test drives it (bin/test-civilcraft-staking.mjs).
 *
 *   stakeStations(al, { from, to, step, keys }) → [sta]   every multiple of step from `from` to `to`, both ends, and (keys)
 *       the alignment's own key stations in between (PC, PT, …)
 *   stakeRows(al, { stations, offsets, design, ground, first = 1, prefix = '' }) → rows
 *   pointRows(al, points, { design, ground? }) → rows   survey points: their station and offset on the alignment, the
 *       design there, their own elevation as the ground (points off the alignment's ends are left out, said by `outside`)
 *     design(sta, off, x, y) → elevation | null and ground(x, y) → elevation | null are the caller's (the profile, the graded
 *     surface, the existing ground).
 *   row = { id, sta, off, x, y, design, ground, cf (ground − design: + = cut, − = fill) | null }
 *   parseOffsets(text) → [offset] (left −, right +) | { error: token }
 *   cutFillText(cf, units) → "C 1.23" | "F 0.45" | "0.00" | ""      offsetText(off) → "12.00 L" | "12.00 R" | "0.00"
 *   stakingCsv(rows, { units, title }) → CSV text (number cells plain; text that a spreadsheet would run as a formula gets ')
 *   stakingSheets(rows, { paper, landscape, units, title, name }) → { sheets, perPage }   PDF table pages for plot.js toPdfPages
 */

import { t } from './i18n.js';
import { MARGIN, TITLE_H, orient, paperBy } from './plot.js';
import { formatStation, fixed } from './units.js';

const EPS = 1e-9;
const fin = (v) => typeof v === 'number' && Number.isFinite(v);

export function stakeStations(al, { from = al.start, to = al.end, step = 50, keys = true } = {}) {
  const a = Math.max(al.start, Math.min(from, to)), b = Math.min(al.end, Math.max(from, to));
  const set = new Set([a, b]);
  if (step > 0) for (let k = Math.ceil((a - EPS) / step); k * step <= b + EPS; k++) set.add(Math.min(b, Math.max(a, k * step)));
  if (keys) for (const e of al.elements || []) for (const s of [e.sta, e.sta + e.len]) if (s > a + EPS && s < b - EPS) set.add(s);
  return [...set].sort((x, y) => x - y).filter((s, i, arr) => i === 0 || s - arr[i - 1] > 1e-6);
}

function place(al, sta, off) {
  const p = al.pointAt(sta);
  // right of the alignment = + : the right-hand normal of the forward direction
  return { x: p.x + off * Math.sin(p.dir), y: p.y - off * Math.cos(p.dir) };
}
export function stakeRows(al, { stations, offsets = [0], design = () => null, ground = () => null, first = 1, prefix = '' }) {
  const rows = [];
  let n = first;
  for (const sta of stations) for (const off of offsets) {
    const { x, y } = place(al, sta, off);
    const d = design(sta, off, x, y), g = ground(x, y);
    rows.push({ id: prefix + n++, sta, off, x, y, design: fin(d) ? d : null, ground: fin(g) ? g : null, cf: fin(d) && fin(g) ? g - d : null });
  }
  return rows;
}
export function pointRows(al, points, { design = () => null, ground = null } = {}) {
  const rows = [];
  let outside = 0;
  for (const p of points) {
    const so = al.stationOffset(p.x, p.y);
    if (!so || so.outside) { outside++; continue; }
    const d = design(so.sta, so.off, p.x, p.y), g = fin(p.z) ? p.z : ground ? ground(p.x, p.y) : null;
    rows.push({ id: p.n, sta: so.sta, off: so.off, x: p.x, y: p.y, design: fin(d) ? d : null, ground: fin(g) ? g : null, cf: fin(d) && fin(g) ? g - d : null });
  }
  rows.sort((a, b) => a.sta - b.sta || a.off - b.off);
  return { rows, outside };
}

/** "12 L, 0, 12 R", "-12, 0, 12", "L12 CL R12", "12L 12R" → [-12, 0, 12] (left = −), in order, without repeats; or { error }. */
export function parseOffsets(text) {
  const out = [];
  const src = String(text ?? '').toUpperCase().replace(/\bCL\b/g, '0').replace(/(^|[\s,;])([LR])\s+(\d)/g, '$1$2$3').replace(/(\d)\s+([LR])\b/g, '$1$2');
  for (const tok of src.split(/[\s,;]+/).filter(Boolean)) {
    const m = /^([LR])?(-?\d+(?:\.\d+)?)([LR])?$/.exec(tok);
    if (!m || (m[1] && m[3])) return { error: tok };
    let v = Number(m[2]);
    const side = m[1] || m[3];
    if (side) { if (v < 0) return { error: tok }; v = side === 'L' ? -v : v; }
    if (Math.abs(v) > 1e5) return { error: tok };
    if (!out.some((o) => Math.abs(o - v) < 1e-9)) out.push(v);
  }
  return out.length > 200 ? { error: '…' } : out;
}
export function cutFillText(cf) {
  if (!fin(cf)) return '';
  if (Math.abs(cf) < 0.005) return '0.00';
  return (cf > 0 ? 'C ' : 'F ') + fixed(Math.abs(cf), 2).replace(/,/g, '');
}
export function offsetText(off) {
  if (Math.abs(off) < 0.005) return '0.00';
  return fixed(Math.abs(off), 2).replace(/,/g, '') + (off < 0 ? ' L' : ' R');
}
const num = (v, d) => (fin(v) ? v.toFixed(d) : '');

export function stakingCsv(rows, { units = 'ft', title = '' } = {}) {
  const u = units === 'm' ? 'm' : 'ft';
  const q = (v) => { const s = String(v); return /^-?\d/.test(s) || s === '' ? s : /^[=+\-@\t\r]/.test(s) ? "'" + s : s; };
  const c = (v) => (/[",\r\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v);
  const out = [];
  if (title) out.push([title]);
  out.push([t('sk.c.point'), t('sk.c.sta'), t('sk.c.off', { u }), t('sk.c.n'), t('sk.c.e'), t('sk.c.design'), t('sk.c.ground'), t('sk.c.cf', { u }), t('sk.c.cfn')]);
  for (const r of rows) out.push([r.id, formatStation(r.sta, units), offsetText(r.off), num(r.y, 3), num(r.x, 3), num(r.design, 3), num(r.ground, 3), cutFillText(r.cf), num(r.cf, 3)]);
  return out.map((r) => r.map((v) => c(q(v))).join(',')).join('\r\n') + '\r\n';
}

const INK = '#000000', RULE = '#9a9a9a', CUT = '#a84a00', FILL = '#17703a';
/** Table pages: a header row, then a row per stake, ruled every five rows; cut in orange, fill in green; a title strip
 *  on every page as on the other sheets. */
export function stakingSheets(rows, { paper = 'letter', landscape = true, units = 'ft', title = '', name = '' } = {}) {
  const P = orient(paperBy(paper), landscape);
  const x0 = MARGIN + 4, x1 = P.w - MARGIN - 4, top = P.h - MARGIN - 6, bottom = MARGIN + TITLE_H + 4;
  const rowH = 5, perPage = Math.max(1, Math.floor((top - bottom - rowH * 1.6) / rowH));
  const u = units === 'm' ? 'm' : 'ft';
  const cols = [
    { k: 'id', w: 0.11, h: t('sk.c.point'), a: 'left' }, { k: 'sta', w: 0.12, h: t('sk.c.sta'), a: 'right' }, { k: 'off', w: 0.11, h: t('sk.c.off', { u }), a: 'right' },
    { k: 'n', w: 0.15, h: t('sk.c.n'), a: 'right' }, { k: 'e', w: 0.15, h: t('sk.c.e'), a: 'right' }, { k: 'design', w: 0.12, h: t('sk.c.design'), a: 'right' },
    { k: 'ground', w: 0.12, h: t('sk.c.ground'), a: 'right' }, { k: 'cf', w: 0.12, h: t('sk.c.cf', { u }), a: 'right' }];
  const W = x1 - x0;
  let cx = x0;
  for (const col of cols) { col.x0 = cx; cx += col.w * W; col.x1 = cx; }
  const cell = (r, k) => ({ id: String(r.id), sta: formatStation(r.sta, units), off: offsetText(r.off), n: num(r.y, 3), e: num(r.x, 3), design: num(r.design, 2), ground: num(r.ground, 2), cf: cutFillText(r.cf) }[k]);
  const pages = Math.max(1, Math.ceil(rows.length / perPage)), sheets = [];
  for (let pg = 0; pg < pages; pg++) {
    const here = rows.slice(pg * perPage, (pg + 1) * perPage), strokes = [], texts = [];
    let y = top;
    for (const col of cols) texts.push({ color: INK, x: col.a === 'left' ? col.x0 + 1 : col.x1 - 1, y: y - 3.4, h: 2.2, rot: 0, align: col.a, text: col.h });
    y -= rowH * 1.2;
    strokes.push({ color: INK, width: 0.35, pts: [{ x: x0, y }, { x: x1, y }] });
    here.forEach((r, i) => {
      const yb = y - rowH;
      for (const col of cols) {
        const s = cell(r, col.k);
        if (!s) continue;
        texts.push({ color: col.k === 'cf' && fin(r.cf) && Math.abs(r.cf) >= 0.005 ? (r.cf > 0 ? CUT : FILL) : INK, x: col.a === 'left' ? col.x0 + 1 : col.x1 - 1, y: yb + 1.5, h: 2.1, rot: 0, align: col.a, text: s });
      }
      if ((i + 1) % 5 === 0 && i < here.length - 1) strokes.push({ color: RULE, width: 0.1, pts: [{ x: x0, y: yb }, { x: x1, y: yb }] });
      y = yb;
    });
    const chrome = [], tt = [];
    chrome.push({ color: INK, width: 0.5, pts: [{ x: MARGIN, y: MARGIN }, { x: P.w - MARGIN, y: MARGIN }, { x: P.w - MARGIN, y: P.h - MARGIN }, { x: MARGIN, y: P.h - MARGIN }], closed: true });
    chrome.push({ color: INK, width: 0.35, pts: [{ x: MARGIN, y: MARGIN + TITLE_H }, { x: P.w - MARGIN, y: MARGIN + TITLE_H }] });
    tt.push({ color: INK, x: MARGIN + 4, y: MARGIN + TITLE_H - 6, h: 4, rot: 0, align: 'left', text: title || name });
    tt.push({ color: INK, x: MARGIN + 4, y: MARGIN + 3.5, h: 2.2, rot: 0, align: 'left', text: t('sk.strip', { name, n: rows.length, u }) });
    tt.push({ color: INK, x: P.w - MARGIN - 4, y: MARGIN + TITLE_H - 6, h: 4, rot: 0, align: 'right', text: t('pp.sheet', { n: pg + 1, N: pages }) });
    tt.push({ color: INK, x: P.w - MARGIN - 4, y: MARGIN + 3.5, h: 2.2, rot: 0, align: 'right', text: t('pp.made', { date: new Date().toISOString().slice(0, 10) }) });
    sheets.push({ w: P.w, h: P.h, name: (title || name) + ' ' + (pg + 1), views: [{ clip: { x0: MARGIN, y0: MARGIN + TITLE_H, x1: P.w - MARGIN, y1: P.h - MARGIN }, strokes, texts, fills: [] }], chrome, chromeTexts: tt });
  }
  return { sheets, perPage };
}
