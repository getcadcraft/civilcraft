// SPDX-License-Identifier: Apache-2.0
/**
 * layout.js — a curtain system worked out from its outline and its grid (session bk-tools-b-10). Host-free, no DOM, no IFC:
 * canonical in lib/curtain, hosts carry byte-identical copies (tools/workplane/sync.mjs). One unit of length throughout (the apps:
 * millimetres), in the coordinates of the system's own plane: u along it, v up it.
 *
 * A system is { outline: [[u, v] …] (any simple polygon; a drawn curtain wall is the rectangle 0,0 → length,height),
 *               linesU: [{ at, m }] grid lines at u = at (they run up the system; "vertical"), m = carries a mullion,
 *               linesV: [{ at, m }] grid lines at v = at (they run along it; "horizontal"),
 *               border: mullions round the outline, mullion: { width (seen on the face), depth }, panel: { thickness } }.
 *
 *   layoutCurtain(sys) → {
 *     panels:   [{ i, j, cell: polygon (grid line to grid line, cut to the outline), glass: polygon (the pane that is made: the
 *                 cell less half a mullion on each side that has one, a whole mullion at the border), gross, net, perimeter }],
 *     mullions: [{ kind 'u' | 'v' | 'border', line (index, or the outline edge), a, b (its centre line), length }],
 *     totals:   { area (the outline), panels, gross, net, mullions, mullionLength, uMin, uMax, vMin, vMax } }
 *   Rules, so the numbers can be checked by hand:
 *     - a mullion on a u line runs through, from border mullion to border mullion (from outline edge to outline edge without a
 *       border); a mullion on a v line stops against every u-line mullion it meets and against the border (clear length)
 *     - border mullions lie INSIDE the outline (their outer face on it). Where two meet, the one that runs more nearly up the
 *       system (v) runs through to the corner and the other is cut back by one mullion width (square cut, no mitre)
 *     - the pane next to a grid mullion loses half its width, next to a border mullion its whole width; panes under 1 square
 *       unit are left out
 *   A concave outline: panes and grid mullions are cut to it; the border inset of the panes is exact only for a convex outline
 *   (on a concave one the panes run to the outline under the border mullions).
 *
 *   cleanLines(list, lo, hi, tol?) → the lines inside (lo, hi), sorted, none within tol of another or of an end
 *   linesAtSpacing(lo, hi, spacing, m?) → lines every `spacing` from lo (none at the ends)
 *   addLine / moveLine / removeLine / setMullions(lines, …) → a new list (never the one given)
 *   nearestLine(lines, at) → index | -1      linesText(lines) / parseLines(text): "1500:1;3000:0" (at:mullion)
 */
import { polyArea, clipConvex, clipSegment, insetConvex, isConvex } from '../workplane/plane.js';

const TOL = 1;   // two grid lines closer than this are one
export const cleanLines = (list, lo, hi, tol = TOL) => {
  const out = [];
  for (const l of [...(list || [])].filter((x) => x && Number.isFinite(+x.at)).map((x) => ({ at: +x.at, m: x.m !== false && x.m !== 0 })).sort((a, b) => a.at - b.at)) {
    if (l.at <= lo + tol || l.at >= hi - tol) continue;
    if (out.length && l.at - out[out.length - 1].at < tol) continue;
    out.push(l);
  }
  return out;
};
export function linesAtSpacing(lo, hi, spacing, m = true) {
  const out = [];
  if (!(spacing > TOL)) return out;
  for (let k = 1; k < 100000; k++) { const at = lo + k * spacing; if (at >= hi - TOL) break; out.push({ at, m: !!m }); }
  return out;
}
export const addLine = (lines, at, m = true) => [...lines.filter((l) => Math.abs(l.at - at) >= TOL), { at, m: !!m }].sort((a, b) => a.at - b.at);
export const removeLine = (lines, i) => lines.filter((_, k) => k !== i);
export const moveLine = (lines, i, at) => (lines[i] ? addLine(removeLine(lines, i), at, lines[i].m) : lines.slice());
export const setMullions = (lines, on, i = null) => lines.map((l, k) => (i === null || i === k ? { at: l.at, m: !!on } : { ...l }));
export function nearestLine(lines, at) { let best = -1, bd = Infinity; lines.forEach((l, i) => { const d = Math.abs(l.at - at); if (d < bd) { bd = d; best = i; } }); return best; }
const r3 = (v) => Math.round(v * 1000) / 1000;
export const linesText = (lines) => lines.map((l) => r3(l.at) + ':' + (l.m ? 1 : 0)).join(';');
export const parseLines = (text) => String(text || '').split(';').map((s) => s.trim()).filter(Boolean).map((s) => { const [a, m] = s.split(':'); return { at: Number(a), m: m === undefined ? true : m !== '0' }; }).filter((l) => Number.isFinite(l.at));

const perimeter = (p) => { let s = 0; for (let i = 0; i < p.length; i++) { const a = p[i], b = p[(i + 1) % p.length]; s += Math.hypot(b[0] - a[0], b[1] - a[1]); } return s; };

export function layoutCurtain(sys) {
  let outline = (sys.outline || []).map((p) => [+p[0], +p[1]]);
  if (outline.length < 3 || Math.abs(polyArea(outline)) < 1e-6) return { panels: [], mullions: [], totals: { area: 0, panels: 0, gross: 0, net: 0, mullions: 0, mullionLength: 0 }, error: 'outline' };
  if (polyArea(outline) < 0) outline = outline.reverse();
  const us = outline.map((p) => p[0]), vs = outline.map((p) => p[1]);
  const uMin = Math.min(...us), uMax = Math.max(...us), vMin = Math.min(...vs), vMax = Math.max(...vs);
  const LU = cleanLines(sys.linesU, uMin, uMax), LV = cleanLines(sys.linesV, vMin, vMax);
  const mw = Math.max(0, +sys.mullion?.width || 0), border = !!sys.border && mw > 0;
  const convex = isConvex(outline);
  const inner = border ? (convex ? insetConvex(outline, mw) : outline) : outline;
  const U = [uMin, ...LU.map((l) => l.at), uMax], V = [vMin, ...LV.map((l) => l.at), vMax];
  const mU = [false, ...LU.map((l) => l.m && mw > 0), false], mV = [false, ...LV.map((l) => l.m && mw > 0), false];   // the ends are the border's
  const panels = [];
  for (let i = 0; i + 1 < U.length; i++) for (let j = 0; j + 1 < V.length; j++) {
    const rect = [[U[i], V[j]], [U[i + 1], V[j]], [U[i + 1], V[j + 1]], [U[i], V[j + 1]]];
    const cell = clipConvex(outline, rect);
    if (cell.length < 3) continue;
    const gross = Math.abs(polyArea(cell));
    if (gross < 1) continue;
    const g0 = U[i] + (mU[i] ? mw / 2 : 0), g1 = U[i + 1] - (mU[i + 1] ? mw / 2 : 0), h0 = V[j] + (mV[j] ? mw / 2 : 0), h1 = V[j + 1] - (mV[j + 1] ? mw / 2 : 0);
    let glass = [];
    if (g1 - g0 > 1e-6 && h1 - h0 > 1e-6 && inner) glass = clipConvex(inner, [[g0, h0], [g1, h0], [g1, h1], [g0, h1]]);
    const net = glass.length >= 3 ? Math.abs(polyArea(glass)) : 0;
    if (net < 1) continue;
    panels.push({ i, j, cell, glass, gross, net, perimeter: perimeter(glass) });
  }
  const mullions = [];
  if (mw > 0) {
    const bw = border ? mw : 0;
    LU.forEach((l, k) => {
      if (!l.m) return;
      for (const [a, b] of clipSegment(outline, [l.at, vMin - 1], [l.at, vMax + 1])) {
        const a2 = [a[0], a[1] + bw], b2 = [b[0], b[1] - bw];   // between the border mullions' inner faces
        if (b2[1] - a2[1] > 1e-6) mullions.push({ kind: 'u', line: k, a: a2, b: b2, length: b2[1] - a2[1] });
      }
    });
    LV.forEach((l, k) => {
      if (!l.m) return;
      for (const [a, b] of clipSegment(outline, [uMin - 1, l.at], [uMax + 1, l.at])) {
        // stops against every u-line mullion that crosses it and against the border
        const cuts = [a[0] + bw, ...LU.filter((q) => q.m && q.at > a[0] + 1e-6 && q.at < b[0] - 1e-6).flatMap((q) => [q.at - mw / 2, q.at + mw / 2]), b[0] - bw];
        for (let c = 0; c + 1 < cuts.length; c += 2) if (cuts[c + 1] - cuts[c] > 1e-6) mullions.push({ kind: 'v', line: k, a: [cuts[c], l.at], b: [cuts[c + 1], l.at], length: cuts[c + 1] - cuts[c] });
      }
    });
    if (border) {
      const n = outline.length, steep = (i) => { const a = outline[i], b = outline[(i + 1) % n]; return Math.abs(b[1] - a[1]) >= Math.abs(b[0] - a[0]); };
      for (let i = 0; i < n; i++) {
        const a = outline[i], b = outline[(i + 1) % n], L = Math.hypot(b[0] - a[0], b[1] - a[1]);
        if (L < 1e-6) continue;
        const d = [(b[0] - a[0]) / L, (b[1] - a[1]) / L], inw = [-d[1], d[0]];
        const prev = (i + n - 1) % n, next = (i + 1) % n;
        const cutA = steep(i) && !steep(prev) ? 0 : steep(i) === steep(prev) ? (i < prev ? 0 : mw) : mw;
        const cutB = steep(i) && !steep(next) ? 0 : steep(i) === steep(next) ? (i < next ? 0 : mw) : mw;
        const len = L - cutA - cutB;
        if (len <= 1e-6) continue;
        const p = [a[0] + d[0] * cutA + inw[0] * mw / 2, a[1] + d[1] * cutA + inw[1] * mw / 2], q = [b[0] - d[0] * cutB + inw[0] * mw / 2, b[1] - d[1] * cutB + inw[1] * mw / 2];
        mullions.push({ kind: 'border', line: i, a: p, b: q, length: len });
      }
    }
  }
  const sum = (list, f) => list.reduce((s, x) => s + f(x), 0);
  return {
    panels, mullions, outline, linesU: LU, linesV: LV,
    totals: { area: Math.abs(polyArea(outline)), panels: panels.length, gross: sum(panels, (p) => p.gross), net: sum(panels, (p) => p.net), mullions: mullions.length, mullionLength: sum(mullions, (m) => m.length), uMin, uMax, vMin, vMax },
  };
}
