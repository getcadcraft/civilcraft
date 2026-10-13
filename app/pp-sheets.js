/* SPDX-License-Identifier: Apache-2.0 */
/**
 * pp-sheets.js — plan and profile sheets along an alignment (0.4 V15). No DOM; the Node test drives it
 * (bin/test-civilcraft-sheets.mjs) and plot.js toPdfPages writes the pages.
 *
 * Each sheet shows one stretch of the alignment twice, one above the other at the same horizontal scale:
 *   plan     the plan scene turned so the stretch runs left to right (its chord horizontal), clipped to the plan window,
 *            with a match line square to the alignment at each end that continues on another sheet
 *   profile  existing ground and the design profile on a grid, stations under it, elevations both sides, grades and
 *            vertical curves labeled; vertically exaggerated (the same exaggeration on every sheet)
 * and a title strip: the title, the alignment, the station range, "Sheet n of N", both scales, a north arrow turned with
 * the plan.
 *
 *   sheetPlan(alignment, { paper, landscape, scale, from, to }) → { length (per sheet), stations: [[a, b]…], window }
 *       the stretch per sheet is the plan window's width at the scale, rounded down to a whole 50 ft (20 m) when it is
 *       over 500 ft (200 m), else to a whole 10 ft (5 m); [from, to] default to the whole alignment
 *   planProfileSheets(scene, { alignment, eg, profile, paper, landscape, scale, vex, units, title, name, from, to })
 *       → { sheets (plot.js sheets with views), vex (used), notes, plan }
 *       eg = [{ sta, z | null }] (project.egProfile), profile = profile.js Profile or null; vex = wanted exaggeration
 *       (10 by default): lowered to the largest of 10 5 4 2 1 at which every sheet's elevations fit (said)
 *   rotation(alignment, a, b) → θ (the plan turns by −θ)
 */

import { t } from './i18n.js';
import { MARGIN, TITLE_H, orient, paperBy, WIDTH, RGB } from './plot.js';
import { formatStation, fixed, pct } from './units.js';

/** The design profile across [a, b]: its own breakpoints (PVIs, vertical curves) inside, plus both ends. */
function designIn(profile, a, b) {
  if (!profile?.ok) return [];
  const st = new Set([a, b]);
  for (const q of profile.sample(Math.max((b - a) / 300, 0.05))) if (q.sta > a && q.sta < b) st.add(q.sta);
  return [...st].sort((m, n) => m - n).map((sta) => ({ sta, z: profile.elevationAt(sta) })).filter((q) => q.z !== null);
}
const INK = '#000000', EG = '#606060', FG = '#c00000', GRID = '#b8b8b8';
export const VEXES = [10, 5, 4, 2, 1];

function layout(paper, landscape) {
  const P = orient(paperBy(paper), landscape);
  const ix0 = MARGIN + 16, ix1 = P.w - MARGIN - 16;
  const top = P.h - MARGIN - 3, bottom = MARGIN + TITLE_H + 9;
  const span = top - bottom;
  const profile = { x0: ix0, x1: ix1, y0: bottom, y1: bottom + span * 0.4 };
  const plan = { x0: ix0, x1: ix1, y0: profile.y1 + 10, y1: top };
  return { P, plan, profile };
}

export function sheetPlan(al, { paper = 'tabloid', landscape = true, scale, from, to, units = 'ft' } = {}) {
  const L = layout(paper, landscape);
  const a0 = Math.max(al.start, Number.isFinite(from) ? from : al.start), a1 = Math.min(al.end, Number.isFinite(to) ? to : al.end);
  const fits = (L.plan.x1 - L.plan.x0) / scale.mmPerUnit;
  // whole 50 ft (20 m) on long stretches, whole 10 ft (5 m) on short ones, so little of the window is wasted
  const round = units === 'm' ? (fits > 200 ? 20 : fits > 25 ? 5 : 0) : (fits > 500 ? 50 : fits > 50 ? 10 : 0);
  const length = round ? Math.floor(fits / round) * round : fits;
  const stations = [];
  for (let a = a0; a < a1 - 1e-6 && stations.length < 500; a += length) stations.push([a, Math.min(a1, a + length)]);
  return { length, stations, window: L };
}

export function rotation(al, a, b) {
  const p = al.pointAt(a), q = al.pointAt(b);
  return Math.atan2(q.y - p.y, q.x - p.x);
}

export function planProfileSheets(scene, { alignment: al, eg = [], profile = null, paper = 'tabloid', landscape = true, scale, vex = 10, units = 'ft', title = '', name = '', from, to }) {
  const plan = sheetPlan(al, { paper, landscape, scale, from, to, units });
  const { P, plan: PW, profile: VW } = plan.window;
  const s = scale.mmPerUnit, notes = [];
  const N = plan.stations.length;
  // the exaggeration: the largest standard one ≤ the wanted one at which every sheet's elevations fit
  const hAvail = VW.y1 - VW.y0 - 8;
  const zRange = ([a, b]) => {
    let lo = Infinity, hi = -Infinity;
    for (const p of eg) if (p.z !== null && p.sta >= a - 1e-9 && p.sta <= b + 1e-9) { lo = Math.min(lo, p.z); hi = Math.max(hi, p.z); }
    for (const q of designIn(profile, a, b)) { lo = Math.min(lo, q.z); hi = Math.max(hi, q.z); }
    return Number.isFinite(lo) ? [lo, hi] : null;
  };
  const ranges = plan.stations.map(zRange);
  const need = Math.max(1e-9, ...ranges.filter(Boolean).map(([lo, hi]) => hi - lo));
  const want = VEXES.includes(vex) ? vex : 10;
  const used = VEXES.filter((v) => v <= want).find((v) => need * s * v <= hAvail) ?? 1;
  if (used !== want) notes.push(t('pp.vex.lowered', { want, used }));
  if (need * s * used > hAvail) notes.push(t('pp.vex.clipped'));
  const sv = s * used;
  const layerAci = new Map(scene.layers.map((l) => [l.name, l.aci]));

  const sheets = plan.stations.map(([a, b], k) => {
    const th = rotation(al, a, b), c = Math.cos(-th), sn = Math.sin(-th), pa = al.pointAt(a);
    const rot = (p) => ({ x: (p.x - pa.x) * c - (p.y - pa.y) * sn, y: (p.x - pa.x) * sn + (p.y - pa.y) * c });
    // centre the stretch vertically in the plan window
    let ylo = Infinity, yhi = -Infinity;
    for (let i = 0; i <= 40; i++) { const q = rot(al.pointAt(a + ((b - a) * i) / 40)); ylo = Math.min(ylo, q.y); yhi = Math.max(yhi, q.y); }
    const ymid = (ylo + yhi) / 2, cy = (PW.y0 + PW.y1) / 2;
    const tx = (p) => { const q = rot(p); return { x: PW.x0 + q.x * s, y: cy + (q.y - ymid) * s }; };
    // the window in world coordinates (to skip what cannot show)
    const inv = (X, Y) => { const qx = (X - PW.x0) / s, qy = (Y - cy) / s + ymid; return { x: pa.x + qx * Math.cos(th) - qy * Math.sin(th), y: pa.y + qx * Math.sin(th) + qy * Math.cos(th) }; };
    const corners = [inv(PW.x0, PW.y0), inv(PW.x1, PW.y0), inv(PW.x1, PW.y1), inv(PW.x0, PW.y1)];
    const wb = { minX: Math.min(...corners.map((q) => q.x)), maxX: Math.max(...corners.map((q) => q.x)), minY: Math.min(...corners.map((q) => q.y)), maxY: Math.max(...corners.map((q) => q.y)) };
    const hit = (pts) => { let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity; for (const p of pts) { x0 = Math.min(x0, p.x); x1 = Math.max(x1, p.x); y0 = Math.min(y0, p.y); y1 = Math.max(y1, p.y); } return !(x1 < wb.minX || x0 > wb.maxX || y1 < wb.minY || y0 > wb.maxY); };
    const strokes = [], texts = [], points = [];
    for (const it of scene.items) {
      const color = RGB[layerAci.get(it.layer)] || INK, width = WIDTH[it.layer] || 0.18;
      if (it.kind === 'poly') { if (it.pts.length && hit(it.pts)) strokes.push({ color, width, pts: it.pts.map(tx), closed: !!it.closed }); }
      else if (it.kind === 'arc') { if (hit([{ x: it.c.x - it.r, y: it.c.y - it.r }, { x: it.c.x + it.r, y: it.c.y + it.r }])) strokes.push({ color, width, arc: { ...tx(it.c), r: it.r * s, a0: it.a0 - th, a1: it.a1 - th } }); }
      else if (it.kind === 'point') { if (hit([it])) points.push({ color, ...tx(it) }); }
      else if (it.kind === 'text') { if (hit([it])) texts.push({ color, ...tx(it), h: it.mm, rot: (it.rot || 0) - th, text: it.text, align: it.align, middle: it.middle }); }
    }
    // match lines at the ends that continue on another sheet
    const half = (PW.y1 - PW.y0) / 2 / s;
    for (const [sta, other] of [[a, k], [b, k + 2]]) {
      if (other < 1 || other > N || (sta === a && k === 0) || (sta === b && k === N - 1)) continue;
      const p = al.pointAt(sta), nx = Math.sin(p.dir), ny = -Math.cos(p.dir);
      const e1 = tx({ x: p.x - nx * half, y: p.y - ny * half }), e2 = tx({ x: p.x + nx * half, y: p.y + ny * half });
      strokes.push({ color: INK, width: 0.7, dash: [6, 1.5, 1, 1.5], pts: [e1, e2] });
      const up = e1.y > e2.y ? e1 : e2, dn = up === e1 ? e2 : e1, ang = Math.atan2(up.y - dn.y, up.x - dn.x);
      const at = { x: dn.x + (up.x - dn.x) * 0.95, y: dn.y + (up.y - dn.y) * 0.95 };
      // along the line, just inside this sheet
      texts.push({ color: INK, x: at.x + (sta === a ? 2.2 : -2.2), y: at.y, h: 2.2, rot: ang, align: 'right', middle: true, text: t('pp.match', { sta: formatStation(sta, units), sheet: other }) });
    }
    // ---------------------------------------------------------------- the profile
    const pv = { strokes: [], texts: [], clip: { x0: VW.x0 - 15, y0: VW.y0 - 8, x1: VW.x1 + 15, y1: VW.y1 + 2 } };
    const r = ranges[k] || [0, 1];
    const zmid = (r[0] + r[1]) / 2, zSpan = (VW.y1 - VW.y0) / sv;
    const zStepRaw = 6 / sv, zStep = [0.1, 0.2, 0.5, 1, 2, 5, 10, 20, 50, 100].find((v) => v >= zStepRaw) || 100;
    const z0 = Math.floor((zmid - zSpan / 2) / zStep) * zStep;
    const X = (sta) => VW.x0 + (sta - a) * s, Y = (z) => VW.y0 + (z - z0) * sv;
    const xEnd = X(b);
    const sStepRaw = 12 / s, sStep = [5, 10, 20, 25, 50, 100, 200, 500, 1000].find((v) => v >= sStepRaw) || 1000;
    for (let st = Math.ceil(a / sStep - 1e-9) * sStep; st <= b + 1e-9; st += sStep) {
      pv.strokes.push({ color: GRID, width: 0.1, pts: [{ x: X(st), y: VW.y0 }, { x: X(st), y: VW.y1 }] });
      pv.texts.push({ color: INK, x: X(st), y: VW.y0 - 4, h: 1.8, rot: 0, align: 'center', text: formatStation(st, units, 0) });
    }
    for (let z = z0; z <= z0 + zSpan + 1e-9; z += zStep) {
      const y = Y(z);
      if (y > VW.y1 + 1e-6) break;
      pv.strokes.push({ color: GRID, width: 0.1, pts: [{ x: VW.x0, y }, { x: xEnd, y }] });
      const lbl = fixed(z, zStep < 1 ? 1 : 0).replace(/,/g, '');
      pv.texts.push({ color: INK, x: VW.x0 - 1.5, y, h: 1.8, rot: 0, align: 'right', middle: true, text: lbl }, { color: INK, x: xEnd + 1.5, y, h: 1.8, rot: 0, align: 'left', middle: true, text: lbl });
    }
    pv.strokes.push({ color: INK, width: 0.35, pts: [{ x: VW.x0, y: VW.y0 }, { x: xEnd, y: VW.y0 }, { x: xEnd, y: VW.y1 }, { x: VW.x0, y: VW.y1 }], closed: true });
    // existing ground (dashed, gaps where off the surface) and the design
    let run = [];
    const flush = () => { if (run.length >= 2) pv.strokes.push({ color: EG, width: 0.3, dash: [2, 1], pts: run }); run = []; };
    for (const p of eg) { if (p.sta < a - 1e-9 || p.sta > b + 1e-9) continue; if (p.z === null) { flush(); continue; } run.push({ x: X(p.sta), y: Y(p.z) }); }
    flush();
    if (profile?.ok) {
      const q = designIn(profile, a, b);
      if (q.length >= 2) pv.strokes.push({ color: FG, width: 0.6, pts: q.map((v) => ({ x: X(v.sta), y: Y(v.z) })) });
      for (const g of profile.grades) {
        const m = (Math.max(g.from, a) + Math.min(g.to, b)) / 2;
        if (Math.min(g.to, b) - Math.max(g.from, a) < 30 / s) continue;
        const zm = profile.elevationAt(m);
        if (zm === null) continue;
        pv.texts.push({ color: FG, x: X(m), y: Y(zm) + 2.5, h: 1.8, rot: Math.atan(g.g * used), align: 'center', text: pct(g.g) });
      }
      for (const cv of profile.curves) {
        if (cv.pvi < a || cv.pvi > b) continue;
        pv.texts.push({ color: INK, x: X(cv.pvi), y: Y(cv.zPvi) + (cv.kind === 'crest' ? 5 : -6), h: 1.8, rot: 0, align: 'center', text: t('pp.vc', { sta: formatStation(cv.pvi, units), z: fixed(cv.zPvi, 2), L: fixed(cv.L, 2), K: fixed(cv.K, 1) }) });
      }
    }
    // ---------------------------------------------------------------- frame and title strip
    const chrome = [], tt = [];
    chrome.push({ color: INK, width: 0.5, pts: [{ x: MARGIN, y: MARGIN }, { x: P.w - MARGIN, y: MARGIN }, { x: P.w - MARGIN, y: P.h - MARGIN }, { x: MARGIN, y: P.h - MARGIN }], closed: true });
    chrome.push({ color: INK, width: 0.35, pts: [{ x: MARGIN, y: MARGIN + TITLE_H }, { x: P.w - MARGIN, y: MARGIN + TITLE_H }] });
    chrome.push({ color: INK, width: 0.25, pts: [{ x: PW.x0, y: PW.y0 }, { x: PW.x1, y: PW.y0 }, { x: PW.x1, y: PW.y1 }, { x: PW.x0, y: PW.y1 }], closed: true });
    const hLabel = scale.label, vLabel = units === 'm' ? '1:' + Math.round(1000 / sv) : '1" = ' + String(+(25.4 / sv).toFixed(1)) + "'";
    tt.push({ color: INK, x: MARGIN + 4, y: MARGIN + TITLE_H - 6, h: 4, rot: 0, align: 'left', text: title || name });
    tt.push({ color: INK, x: MARGIN + 4, y: MARGIN + 3.5, h: 2.2, rot: 0, align: 'left', text: t('pp.strip', { name, a: formatStation(a, units), b: formatStation(b, units), h: hLabel, v: vLabel, vex: used }) });
    tt.push({ color: INK, x: P.w - MARGIN - 4, y: MARGIN + TITLE_H - 6, h: 4, rot: 0, align: 'right', text: t('pp.sheet', { n: k + 1, N }) });
    tt.push({ color: INK, x: P.w - MARGIN - 4, y: MARGIN + 3.5, h: 2.2, rot: 0, align: 'right', text: t('pp.made', { date: new Date().toISOString().slice(0, 10) }) });
    // north arrow, turned with the plan
    const na = { x: PW.x1 - 10, y: PW.y1 - 14 }, nd = { x: Math.sin(th), y: Math.cos(th) };   // world north (0, 1) after turning by −θ
    const nx = -nd.y, ny = nd.x;
    chrome.push({ color: INK, width: 0.35, pts: [{ x: na.x - nd.x * 6, y: na.y - nd.y * 6 }, { x: na.x + nd.x * 8, y: na.y + nd.y * 8 }] });
    chrome.push({ color: INK, width: 0.35, pts: [{ x: na.x + nd.x * 3 + nx * 3, y: na.y + nd.y * 3 + ny * 3 }, { x: na.x + nd.x * 8, y: na.y + nd.y * 8 }, { x: na.x + nd.x * 3 - nx * 3, y: na.y + nd.y * 3 - ny * 3 }] });
    tt.push({ color: INK, x: na.x + nd.x * 11, y: na.y + nd.y * 11, h: 3, rot: 0, align: 'center', middle: true, text: t('pp.north') });
    return {
      w: P.w, h: P.h, name: (title || name) + ' ' + (k + 1),
      views: [{ clip: PW, strokes, texts, points }, pv],
      chrome, chromeTexts: tt, stations: [a, b], theta: th,
    };
  });
  return { sheets, vex: used, notes, plan };
}
