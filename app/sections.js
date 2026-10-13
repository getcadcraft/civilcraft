/* SPDX-License-Identifier: Apache-2.0 */
/**
 * sections.js — sample lines and cross sections along an alignment (0.4 V13). No DOM; the Node test drives it
 * (bin/test-civilcraft-sections.mjs).
 *
 * A sample line is a straight line square to the alignment at a station, `left` to its left and `right` to its right
 * (offsets: right of the alignment = +, as alignment.stationOffset). A section is what the surfaces are along it.
 *
 *   SAMPLE_DEFAULTS(units) → { step, left, right }
 *   cleanSampling(obj, units) → { step, left, right, extra: [sta] } | null      (untrusted: the project file)
 *   sampleStations(alignment, { step, extra, from, to }) → [sta]   every whole multiple of step, the ends, the curve
 *       ends (PC/PT) and the extra stations, inside [from, to] (default the alignment)
 *   sampleLine(alignment, sta, left, right) → { sta, c, a (left end), b (right end), dir }
 *   surfaceSection(surface, a, b, offA, offB) → runs [[{ o, z }]]   the surface along a→b, EXACT: a vertex wherever the line
 *       crosses a triangle edge (the TIN is flat in between), split into runs where the line leaves the surface
 *   cutFill(ground, design) → { cut, fill, parts: [{ o0, o1, kind: 'cut'|'fill' }] }   areas between two sections (exact
 *       for straight pieces: each interval is split where the two lines cross); only where both are defined
 *   featureMarks(lines, line) → [{ code, o, z }]   where 3D feature lines (corridor CL, EOP, SH, DL) cross the sample line
 *   regionSpans(line, regions) → [[o0, o1]]   where the sample line is inside the graded regions (daylight outlines)
 *   clipRuns(runs, spans) → runs cut to those spans
 *   buildSections({ alignment, ground, design, regions, corridor, sampling, from, to }) → { sections: [{ sta, a, b, ground,
 *       design, cut, fill, parts, marks }], rows: [{ sta, cut, fill, cutVol, fillVol, cumCut, cumFill }], totals: { cut, fill } }
 *       The design counts only inside `regions` (as the grid method's volumes do): rebuilding the graded surface
 *       re-triangulates the ground near the grading, so outside it the two surfaces may differ by a hair — never cut or fill.
 *       volumes by the average end area method between neighbouring sections: V = (A1 + A2) / 2 × (sta2 − sta1)
 *   sectionsCsv(set, units) → CSV text (CRLF): station, cut area, fill area, cut volume, fill volume, cumulative
 */

import { t } from './i18n.js';

export const MAX_SECTIONS = 2000;

export function SAMPLE_DEFAULTS(units = 'ft') {
  return units === 'm' ? { step: 20, left: 30, right: 30 } : { step: 50, left: 100, right: 100 };
}

export function cleanSampling(o, units = 'ft') {
  if (!o || typeof o !== 'object') return null;
  const d = SAMPLE_DEFAULTS(units), pos = (v, k, max) => (Number.isFinite(v) && v > 0 && v <= max ? v : d[k]);
  const extra = Array.isArray(o.extra) ? o.extra.filter((v) => Number.isFinite(v) && Math.abs(v) < 1e8).slice(0, 500) : [];
  return { step: pos(o.step, 'step', 1e5), left: pos(o.left, 'left', 1e4), right: pos(o.right, 'right', 1e4), extra: [...new Set(extra)].sort((a, b) => a - b) };
}

export function sampleStations(al, { step, extra = [], from, to } = {}) {
  if (!al?.ok) return [];
  const lo = Math.max(al.start, Number.isFinite(from) ? from : al.start), hi = Math.min(al.end, Number.isFinite(to) ? to : al.end);
  if (!(hi >= lo)) return [];
  const st = new Set([lo, hi]);
  if (step > 0) for (let k = Math.ceil(lo / step - 1e-9); k * step < hi - 1e-9 && st.size < MAX_SECTIONS; k++) st.add(Number((k * step).toFixed(6)));
  for (const k of al.keyStations?.() || []) if (k.sta > lo && k.sta < hi) st.add(k.sta);
  for (const s of extra) if (s >= lo && s <= hi) st.add(s);
  const out = [...st].sort((a, b) => a - b).filter((s, i, a) => !i || s - a[i - 1] > 1e-6);
  return out.slice(0, MAX_SECTIONS);
}

export function sampleLine(al, sta, left, right) {
  const p = al.pointAt(sta);
  const rx = Math.sin(p.dir), ry = -Math.cos(p.dir);   // right of the forward direction (y up)
  return { sta, c: { x: p.x, y: p.y }, a: { x: p.x - rx * left, y: p.y - ry * left }, b: { x: p.x + rx * right, y: p.y + ry * right }, dir: p.dir, left, right };
}

/** The surface along a→b, exact: params where the segment crosses triangle edges, z by the surface itself. */
export function surfaceSection(surface, a, b, offA, offB) {
  if (!surface) return [];
  const { X, Y, tris, ox, oy } = surface;
  const ax = a.x - ox, ay = a.y - oy, bx = b.x - ox, by = b.y - oy, dx = bx - ax, dy = by - ay;
  const L = Math.hypot(dx, dy);
  if (!(L > 0)) return [];
  const ts = [0, 1];
  const g = surface.grid();
  const clampI = (v, n) => Math.max(0, Math.min(n - 1, Math.floor(v)));
  const x0 = Math.min(ax, bx), x1 = Math.max(ax, bx), y0 = Math.min(ay, by), y1 = Math.max(ay, by);
  if (!(x1 < g.b.minX || x0 > g.b.maxX || y1 < g.b.minY || y0 > g.b.maxY)) {
    const i0 = clampI((x0 - g.b.minX) / g.cw, g.nx), i1 = clampI((x1 - g.b.minX) / g.cw, g.nx), j0 = clampI((y0 - g.b.minY) / g.ch, g.ny), j1 = clampI((y1 - g.b.minY) / g.ch, g.ny);
    const seen = new Set();
    // cells along the segment: walk the cell rows/columns the segment's box covers but test each cell against the line
    for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
      const cx0 = g.b.minX + i * g.cw, cy0 = g.b.minY + j * g.ch;
      if (!segHitsBox(ax, ay, bx, by, cx0, cy0, cx0 + g.cw, cy0 + g.ch)) continue;
      const k = j * g.nx + i;
      for (let s = g.start[k]; s < g.start[k + 1]; s++) {
        const tri = g.items[s];
        if (seen.has(tri)) continue;
        seen.add(tri);
        for (let e = 0; e < 3; e++) {
          const p = tris[3 * tri + e], q = tris[3 * tri + ((e + 1) % 3)];
          const tt = segCross(ax, ay, dx, dy, X[p], Y[p], X[q] - X[p], Y[q] - Y[p]);
          if (tt !== null) ts.push(tt);
        }
      }
    }
  }
  ts.sort((u, v) => u - v);
  const runs = [];
  let run = null, last = -1;
  for (const tt of ts) {
    if (tt - last < 1e-12) continue;
    last = tt;
    const z = surface.elevationAt(a.x + (b.x - a.x) * tt, a.y + (b.y - a.y) * tt, 1e-7);
    const o = offA + (offB - offA) * tt;
    if (z === null) { run = null; continue; }
    if (!run) runs.push((run = []));
    run.push({ o, z });
  }
  return runs.filter((r) => r.length >= 2);
}
function segCross(px, py, rx, ry, qx, qy, sx, sy) {   // segment p + t·r vs q + u·s → t in [0,1] or null
  const den = rx * sy - ry * sx;
  if (Math.abs(den) < 1e-15) return null;
  const t0 = ((qx - px) * sy - (qy - py) * sx) / den, u = ((qx - px) * ry - (qy - py) * rx) / den;
  return t0 >= -1e-12 && t0 <= 1 + 1e-12 && u >= -1e-12 && u <= 1 + 1e-12 ? Math.max(0, Math.min(1, t0)) : null;
}
function segHitsBox(ax, ay, bx, by, x0, y0, x1, y1) {   // Liang–Barsky
  let t0 = 0, t1 = 1;
  const dx = bx - ax, dy = by - ay;
  for (const [p, q] of [[-dx, ax - x0], [dx, x1 - ax], [-dy, ay - y0], [dy, y1 - ay]]) {
    if (p === 0) { if (q < 0) return false; continue; }
    const r = q / p;
    if (p < 0) { if (r > t1) return false; if (r > t0) t0 = r; } else { if (r < t0) return false; if (r < t1) t1 = r; }
  }
  return true;
}

/** z of a piecewise-linear section (runs) at offset o, or null. */
export function zAt(runs, o) {
  for (const r of runs) {
    if (o < r[0].o - 1e-9 || o > r[r.length - 1].o + 1e-9) continue;
    for (let i = 1; i < r.length; i++) {
      if (o <= r[i].o + 1e-9) { const p = r[i - 1], q = r[i], d = q.o - p.o; return d > 0 ? p.z + ((q.z - p.z) * (o - p.o)) / d : q.z; }
    }
  }
  return null;
}

export function cutFill(ground, design) {
  const os = new Set();
  for (const r of [...ground, ...design]) for (const p of r) os.add(p.o);
  const xs = [...os].sort((a, b) => a - b);
  let cut = 0, fill = 0;
  const parts = [];
  const push = (o0, o1, kind, area) => {
    if (!(area > 0) || o1 - o0 <= 0) return;
    const l = parts[parts.length - 1];
    if (l && l.kind === kind && Math.abs(l.o1 - o0) < 1e-9) l.o1 = o1; else parts.push({ o0, o1, kind });
    if (kind === 'cut') cut += area; else fill += area;
  };
  for (let i = 1; i < xs.length; i++) {
    const o0 = xs[i - 1], o1 = xs[i], om = (o0 + o1) / 2;
    if (zAt(ground, om) === null || zAt(design, om) === null) continue;
    const g0 = zAt(ground, o0), g1 = zAt(ground, o1), d0 = zAt(design, o0), d1 = zAt(design, o1);
    if ([g0, g1, d0, d1].some((v) => v === null)) continue;
    const e0 = d0 - g0, e1 = d1 - g1, w = o1 - o0;
    if (e0 >= 0 && e1 >= 0) push(o0, o1, 'fill', ((e0 + e1) / 2) * w);
    else if (e0 <= 0 && e1 <= 0) push(o0, o1, 'cut', ((-e0 - e1) / 2) * w);
    else {   // the lines cross inside the interval
      const om2 = o0 + (w * e0) / (e0 - e1);
      const a0 = (Math.abs(e0) / 2) * (om2 - o0), a1 = (Math.abs(e1) / 2) * (o1 - om2);
      push(o0, om2, e0 > 0 ? 'fill' : 'cut', a0);
      push(om2, o1, e1 > 0 ? 'fill' : 'cut', a1);
    }
  }
  return { cut, fill, parts };
}

export function featureMarks(lines, line) {
  const out = [];
  const { a, b, left, right } = line;
  const dx = b.x - a.x, dy = b.y - a.y;
  for (const [code, pts] of Object.entries(lines || {})) {
    if (!Array.isArray(pts)) continue;
    for (let i = 1; i < pts.length; i++) {
      const p = pts[i - 1], q = pts[i];
      const tt = segCross(a.x, a.y, dx, dy, p.x, p.y, q.x - p.x, q.y - p.y);
      if (tt === null) continue;
      const u = segCross(p.x, p.y, q.x - p.x, q.y - p.y, a.x, a.y, dx, dy);
      const z = Number.isFinite(p.z) && Number.isFinite(q.z) && u !== null ? p.z + (q.z - p.z) * u : null;
      out.push({ code, o: -left + (left + right) * tt, z });
      break;
    }
  }
  return out.sort((m, n) => m.o - n.o);
}

export function regionSpans(line, regions) {
  const { a, b, left, right } = line, dx = b.x - a.x, dy = b.y - a.y;
  const ts = new Set([0, 1]);
  for (const r of regions || []) for (let i = 0; i < r.length; i++) {
    const p = r[i], q = r[(i + 1) % r.length];
    const tt = segCross(a.x, a.y, dx, dy, p.x, p.y, q.x - p.x, q.y - p.y);
    if (tt !== null) ts.add(tt);
  }
  const xs = [...ts].sort((m, n) => m - n), out = [];
  // inside, or on the outline (a section along a corridor's end edge is the corridor's end section)
  const onEdge = (x, y, r) => r.some((p, i) => { const q = r[(i + 1) % r.length], ex = q.x - p.x, ey = q.y - p.y, L = ex * ex + ey * ey, u = L ? Math.max(0, Math.min(1, ((x - p.x) * ex + (y - p.y) * ey) / L)) : 0; return Math.hypot(x - p.x - u * ex, y - p.y - u * ey) <= 1e-6 * Math.max(1, Math.sqrt(L)); });
  const inside = (x, y) => (regions || []).some((r) => { let c = false; for (let i = 0, j = r.length - 1; i < r.length; j = i++) if ((r[i].y > y) !== (r[j].y > y) && x < ((r[j].x - r[i].x) * (y - r[i].y)) / (r[j].y - r[i].y) + r[i].x) c = !c; return c || onEdge(x, y, r); });
  for (let i = 1; i < xs.length; i++) {
    const tm = (xs[i - 1] + xs[i]) / 2;
    if (xs[i] - xs[i - 1] < 1e-12 || !inside(a.x + dx * tm, a.y + dy * tm)) continue;
    const o0 = -left + (left + right) * xs[i - 1], o1 = -left + (left + right) * xs[i];
    const l = out[out.length - 1];
    if (l && Math.abs(l[1] - o0) < 1e-9) l[1] = o1; else out.push([o0, o1]);
  }
  return out;
}
export function clipRuns(runs, spans) {
  const out = [];
  for (const [o0, o1] of spans) for (const r of runs) {
    if (r[r.length - 1].o <= o0 || r[0].o >= o1) continue;
    const pts = [];
    const z0 = zAt([r], Math.max(o0, r[0].o)), z1 = zAt([r], Math.min(o1, r[r.length - 1].o));
    pts.push({ o: Math.max(o0, r[0].o), z: z0 });
    for (const q of r) if (q.o > o0 + 1e-12 && q.o < o1 - 1e-12) pts.push(q);
    pts.push({ o: Math.min(o1, r[r.length - 1].o), z: z1 });
    if (pts.length >= 2 && pts[pts.length - 1].o - pts[0].o > 1e-12) out.push(pts);
  }
  return out;
}

export function buildSections({ alignment, ground, design, regions = null, corridor = null, sampling, from, to }) {
  const smp = sampling || SAMPLE_DEFAULTS();
  const stations = sampleStations(alignment, { step: smp.step, extra: smp.extra, from, to });
  const sections = stations.map((sta) => {
    const line = sampleLine(alignment, sta, smp.left, smp.right);
    const g = surfaceSection(ground, line.a, line.b, -smp.left, smp.right);
    let d = design && design !== ground ? surfaceSection(design, line.a, line.b, -smp.left, smp.right) : g;
    if (d !== g && regions) d = clipRuns(d, regionSpans(line, regions));
    const cf = cutFill(g, d);
    return { sta, a: line.a, b: line.b, c: line.c, left: smp.left, right: smp.right, ground: g, design: d, cut: cf.cut, fill: cf.fill, parts: cf.parts, marks: corridor ? featureMarks(corridor, line) : [] };
  });
  const rows = [];
  let cumCut = 0, cumFill = 0;
  sections.forEach((s, i) => {
    let cutVol = 0, fillVol = 0;
    if (i) { const p = sections[i - 1], L = s.sta - p.sta; cutVol = ((p.cut + s.cut) / 2) * L; fillVol = ((p.fill + s.fill) / 2) * L; }
    cumCut += cutVol; cumFill += fillVol;
    rows.push({ sta: s.sta, cut: s.cut, fill: s.fill, cutVol, fillVol, cumCut, cumFill });
  });
  return { sections, rows, totals: { cut: cumCut, fill: cumFill } };
}

const csvCell = (v) => { const s = String(v); return /[",\r\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
export function sectionsCsv(set, { units = 'ft', station = (s) => String(s) } = {}) {
  const ft = units !== 'm', volPer = ft ? 27 : 1;
  const head = ft
    ? [t('sec.csv.station'), t('sec.csv.cut.area.ft'), t('sec.csv.fill.area.ft'), t('sec.csv.cut.vol.ft'), t('sec.csv.fill.vol.ft'), t('sec.csv.cum.cut.ft'), t('sec.csv.cum.fill.ft')]
    : [t('sec.csv.station'), t('sec.csv.cut.area.m'), t('sec.csv.fill.area.m'), t('sec.csv.cut.vol.m'), t('sec.csv.fill.vol.m'), t('sec.csv.cum.cut.m'), t('sec.csv.cum.fill.m')];
  const f = (v, d) => v.toFixed(d);
  const lines = [head.map(csvCell).join(',')];
  for (const r of set.rows) lines.push([station(r.sta), f(r.cut, 2), f(r.fill, 2), f(r.cutVol / volPer, 1), f(r.fillVol / volPer, 1), f(r.cumCut / volPer, 1), f(r.cumFill / volPer, 1)].map(csvCell).join(','));
  return lines.join('\r\n') + '\r\n';
}
