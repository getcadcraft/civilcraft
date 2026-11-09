/* SPDX-License-Identifier: Apache-2.0 */
/**
 * frame-chart.js — the small charts of the dynamic analysis blocks (0.9 SU.1056): one axis, thin 2 px lines, bars with a rounded data end anchored to the baseline,
 * recessive grid, text in the ink colours (never the series colour), the series colour from the panel's accent. The repo had no chart style; this follows the dataviz
 * rules (single series: no legend box, the title names it; a table view of the same numbers sits beside every chart in the block). DOM-free: returns an SVG string.
 *
 *   lineChart({ title, xLabel, yLabel, pts: [[x, y]], marks?: [[x, y, label]], w?, h? }) → string
 *   barChart({ title, xLabel, yLabel, bars: [{ label, value }], w?, h? })              horizontal bars, one per story
 * Colours come from CSS variables with fallbacks: --fa-chart-ink, --fa-chart-grid, --fa-chart-series (frame-panel.css defines them for both themes).
 */
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const nice = (lo, hi, n = 5) => {
  if (!(hi > lo)) { hi = lo + 1; }
  const raw = (hi - lo) / n, p = 10 ** Math.floor(Math.log10(raw)), f = raw / p, step = (f < 1.5 ? 1 : f < 3 ? 2 : f < 7 ? 5 : 10) * p;
  const a = Math.floor(lo / step) * step, b = Math.ceil(hi / step) * step, t = [];
  for (let v = a; v <= b + step * 1e-9; v += step) t.push(Math.abs(v) < step * 1e-9 ? 0 : v);
  return { lo: a, hi: b, ticks: t };
};
const fmt = (v) => (Math.abs(v) >= 1000 || (Math.abs(v) < 0.01 && v !== 0) ? v.toExponential(1) : String(Math.round(v * 1000) / 1000));

export function lineChart({ title, xLabel, yLabel, pts, marks = [], w = 560, h = 240 }) {
  const P = pts.filter((p) => Number.isFinite(p[0]) && Number.isFinite(p[1]));
  if (P.length < 2) return '';
  const m = { l: 56, r: 12, t: 22, b: 40 }, W = w - m.l - m.r, H = h - m.t - m.b;
  const xs = nice(Math.min(...P.map((p) => p[0])), Math.max(...P.map((p) => p[0]))), ys = nice(Math.min(0, ...P.map((p) => p[1])), Math.max(0, ...P.map((p) => p[1])));
  const X = (v) => m.l + (v - xs.lo) / (xs.hi - xs.lo) * W, Y = (v) => m.t + H - (v - ys.lo) / (ys.hi - ys.lo) * H;
  let s = '<svg class="fa-chart" role="img" viewBox="0 0 ' + w + ' ' + h + '" aria-label="' + esc(title) + '" xmlns="http://www.w3.org/2000/svg">';
  s += '<title>' + esc(title) + '</title>';
  for (const v of ys.ticks) s += '<line x1="' + m.l + '" x2="' + (w - m.r) + '" y1="' + Y(v).toFixed(1) + '" y2="' + Y(v).toFixed(1) + '" stroke="var(--fa-chart-grid,#8883)" stroke-width="1"/><text x="' + (m.l - 6) + '" y="' + (Y(v) + 4).toFixed(1) + '" text-anchor="end" font-size="11" fill="var(--fa-chart-ink,currentColor)">' + fmt(v) + '</text>';
  for (const v of xs.ticks) s += '<text x="' + X(v).toFixed(1) + '" y="' + (h - m.b + 16) + '" text-anchor="middle" font-size="11" fill="var(--fa-chart-ink,currentColor)">' + fmt(v) + '</text>';
  s += '<line x1="' + m.l + '" x2="' + (w - m.r) + '" y1="' + Y(0).toFixed(1) + '" y2="' + Y(0).toFixed(1) + '" stroke="var(--fa-chart-ink,currentColor)" stroke-opacity=".5" stroke-width="1"/>';
  s += '<polyline fill="none" stroke="var(--fa-chart-series,#2f6fed)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" points="' + P.map((p) => X(p[0]).toFixed(1) + ',' + Y(p[1]).toFixed(1)).join(' ') + '"/>';
  for (const [x, y, label] of marks) s += '<circle cx="' + X(x).toFixed(1) + '" cy="' + Y(y).toFixed(1) + '" r="4" fill="var(--fa-chart-series,#2f6fed)" stroke="var(--fa-chart-bg,#fff)" stroke-width="2"><title>' + esc(label || '') + '</title></circle>';
  s += '<text x="' + (m.l + W / 2) + '" y="' + (h - 4) + '" text-anchor="middle" font-size="11" fill="var(--fa-chart-ink,currentColor)">' + esc(xLabel) + '</text>';
  s += '<text x="12" y="' + (m.t + H / 2) + '" text-anchor="middle" font-size="11" fill="var(--fa-chart-ink,currentColor)" transform="rotate(-90 12 ' + (m.t + H / 2) + ')">' + esc(yLabel) + '</text>';
  return s + '</svg>';
}

export function barChart({ title, xLabel, bars, w = 560, h = null }) {
  if (!bars.length) return '';
  const rowH = 26, m = { l: 92, r: 14, t: 10, b: 38 }, H = bars.length * rowH, hh = h || H + m.t + m.b, W = w - m.l - m.r;
  const xs = nice(0, Math.max(...bars.map((b) => b.value), 1e-12), 4), X = (v) => m.l + (v - xs.lo) / (xs.hi - xs.lo) * W;
  let s = '<svg class="fa-chart" role="img" viewBox="0 0 ' + w + ' ' + hh + '" aria-label="' + esc(title) + '" xmlns="http://www.w3.org/2000/svg"><title>' + esc(title) + '</title>';
  for (const v of xs.ticks) s += '<line x1="' + X(v).toFixed(1) + '" x2="' + X(v).toFixed(1) + '" y1="' + m.t + '" y2="' + (m.t + H) + '" stroke="var(--fa-chart-grid,#8883)" stroke-width="1"/><text x="' + X(v).toFixed(1) + '" y="' + (m.t + H + 15) + '" text-anchor="middle" font-size="11" fill="var(--fa-chart-ink,currentColor)">' + fmt(v) + '</text>';
  bars.forEach((b, i) => {
    const y = m.t + i * rowH + 4, wd = Math.max(1, X(b.value) - m.l);
    s += '<text x="' + (m.l - 6) + '" y="' + (y + 11) + '" text-anchor="end" font-size="11" fill="var(--fa-chart-ink,currentColor)">' + esc(b.label) + '</text>';
    s += '<path d="M' + m.l + ',' + y + 'h' + Math.max(0, wd - 4).toFixed(1) + 'a4,4 0 0 1 4,4v10a4,4 0 0 1 -4,4h-' + Math.max(0, wd - 4).toFixed(1) + 'z" fill="var(--fa-chart-series,#2f6fed)"><title>' + esc(b.label + ': ' + fmt(b.value)) + '</title></path>';
  });
  s += '<text x="' + (m.l + W / 2) + '" y="' + (hh - 4) + '" text-anchor="middle" font-size="11" fill="var(--fa-chart-ink,currentColor)">' + esc(xLabel) + '</text>';
  return s + '</svg>';
}
/** At most n points of a long series (min and max of each stretch are kept, so peaks survive). */
export function thin(xs, ys, n = 900) {
  const len = ys.length;
  if (len <= n) return Array.from(ys, (y, i) => [xs[i], y]);
  const out = [], step = len / (n / 2);
  for (let a = 0; a < len; a += step) {
    const lo = Math.floor(a), hi = Math.min(len, Math.floor(a + step));
    let imin = lo, imax = lo;
    for (let i = lo; i < hi; i++) { if (ys[i] < ys[imin]) imin = i; if (ys[i] > ys[imax]) imax = i; }
    const pair = imin < imax ? [imin, imax] : [imax, imin];
    for (const i of pair) out.push([xs[i], ys[i]]);
  }
  return out;
}
