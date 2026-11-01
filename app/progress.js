/* SPDX-License-Identifier: Apache-2.0 */
/**
 * progress.js — progress from drone flights and scans (0.8 EG.39, the CivilCraft side): compare surveys of the site made on different dates with
 * the ground as it was and the design, and say how much of the earthwork is done, what is over-dug or over-filled, what stands where it should
 * not (stockpiles) and when the work finishes at the pace so far. No DOM, no strings (the UI words the codes), no imports. Tested by
 * bin/test-civilcraft-progress.mjs. The surveys are surfaces built the usual way (a drone cloud through "Find the ground myself", ground-classify.js,
 * or a scanned surface); anything with elevationAt(x, y) works.
 *
 * Words: per cell, E = existing ground, D = design, A = the as-built survey. Planned change p = D − E: a CUT cell has p < −tol, a FILL cell p > tol,
 * the rest are LEVEL. Cut done = clamp(E − A, 0, E − D) on a cut cell; fill done = clamp(A − E, 0, D − E) on a fill cell. Percent complete =
 * (cut done + fill done) / (planned cut + planned fill), by volume. Over-cut = A below D by more than tol on a cut cell; over-fill = A above D
 * by more than tol on a fill cell; on LEVEL cells any change beyond tol is a stockpile (above) or a dig (below).
 *
 *   progressGrid({ existing, design, surveys: [{ date, label, surface }], region, cell, tol, maxCells, schedule }) → result
 *     result = { cell, area, cells, planned { cut, fill, total }, series: [{ date, label, cutDone, fillDone, pct, remainingCut, remainingFill, overCut, overFill,
 *       stockpile, dig, within (share of cells within tol of design), covered (share of the region the survey reaches), ahead (pct − schedule pct, when given) }],
 *       map: { cells: [{ x, y, plan, now, dz }] } for the last survey (now = A − D), forecast }
 *   forecast(series, { last = 3 }) → { date, perDay, estimate: true } | null     straight line through the last points; null when it is not rising
 *   scheduleAt(schedule, date) → pct           [{ date, pct }] interpolated
 */

const DAY = 86400000;
const ms = (d) => (d instanceof Date ? d.getTime() : typeof d === 'number' ? d : Date.parse(d));

export function scheduleAt(schedule, date) {
  const s = (schedule || []).map((r) => ({ t: ms(r.date), pct: r.pct })).sort((a, b) => a.t - b.t), t = ms(date);
  if (!s.length) return null;
  if (t <= s[0].t) return s[0].pct; if (t >= s[s.length - 1].t) return s[s.length - 1].pct;
  for (let i = 1; i < s.length; i++) if (t <= s[i].t) return s[i - 1].pct + ((s[i].pct - s[i - 1].pct) * (t - s[i - 1].t)) / (s[i].t - s[i - 1].t);
  return null;
}

export function forecast(series, { last = 3 } = {}) {
  const pts = series.filter((s) => Number.isFinite(s.pct)).slice(-last).map((s) => ({ t: ms(s.date), p: s.pct }));
  if (pts.length < 2) return null;
  const n = pts.length, mt = pts.reduce((a, q) => a + q.t, 0) / n, mp = pts.reduce((a, q) => a + q.p, 0) / n;
  let num = 0, den = 0; for (const q of pts) { num += (q.t - mt) * (q.p - mp); den += (q.t - mt) ** 2; }
  if (!(den > 0)) return null;
  const slope = num / den;   // per ms
  if (!(slope > 0)) return null;
  const tEnd = pts[n - 1].t + ((100 - pts[n - 1].p) / slope);
  return { date: new Date(Math.max(tEnd, pts[n - 1].t)).toISOString().slice(0, 10), perDay: slope * DAY, estimate: true };
}

export function progressGrid({ existing, design, surveys = [], region = null, cell = null, tol = 0.05, maxCells = 4e6, schedule = null } = {}) {
  const bs = [existing.stats().bounds, design.stats().bounds];
  let b = { minX: Math.max(bs[0].minX, bs[1].minX), minY: Math.max(bs[0].minY, bs[1].minY), maxX: Math.min(bs[0].maxX, bs[1].maxX), maxY: Math.min(bs[0].maxY, bs[1].maxY) };
  const regions = region ? (Array.isArray(region[0]) ? region : [region]).filter(Boolean) : null;
  if (regions?.length) {
    const r = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };
    for (const poly of regions) for (const p of poly) { r.minX = Math.min(r.minX, p.x); r.minY = Math.min(r.minY, p.y); r.maxX = Math.max(r.maxX, p.x); r.maxY = Math.max(r.maxY, p.y); }
    b = { minX: Math.max(b.minX, r.minX), minY: Math.max(b.minY, r.minY), maxX: Math.min(b.maxX, r.maxX), maxY: Math.min(b.maxY, r.maxY) };
  }
  const W = b.maxX - b.minX, H = b.maxY - b.minY;
  const out = { cell: 0, area: 0, cells: 0, planned: { cut: 0, fill: 0, total: 0 }, series: [], map: { cells: [] }, forecast: null };
  if (!(W > 0 && H > 0)) return out;
  let c = cell > 0 ? cell : Math.sqrt((W * H) / 40000);
  while ((W / c) * (H / c) > maxCells) c *= 2;
  out.cell = c;
  const A = c * c, inPoly = (poly, x, y) => { let k = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const p = poly[i], q = poly[j]; if ((p.y > y) !== (q.y > y) && x < ((q.x - p.x) * (y - p.y)) / (q.y - p.y) + p.x) k = !k; } return k; };
  const nx = Math.max(1, Math.round(W / c)), ny = Math.max(1, Math.round(H / c)), cx = W / nx, cy = H / ny, Acell = cx * cy;
  const base = [];
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
    const x = b.minX + (i + 0.5) * cx, y = b.minY + (j + 0.5) * cy;
    if (regions && !regions.some((poly) => inPoly(poly, x, y))) continue;
    const e = existing.elevationAt(x, y), d = design.elevationAt(x, y);
    if (e === null || d === null || e === undefined || d === undefined) continue;
    base.push({ x, y, e, d });
  }
  out.cells = base.length; out.area = base.length * Acell;
  for (const q of base) { const p = q.d - q.e; if (p < -tol) out.planned.cut += -p * Acell; else if (p > tol) out.planned.fill += p * Acell; }
  out.planned.total = out.planned.cut + out.planned.fill;
  const sorted = [...surveys].sort((p, q) => ms(p.date) - ms(q.date));
  for (const sv of sorted) {
    const row = { date: typeof sv.date === 'string' ? sv.date : new Date(ms(sv.date)).toISOString().slice(0, 10), label: sv.label || '', cutDone: 0, fillDone: 0, overCut: 0, overFill: 0, stockpile: 0, dig: 0, within: 0, covered: 0, remainingCut: 0, remainingFill: 0, pct: 0 };
    let n = 0, within = 0;
    const cellsOut = [];
    for (const q of base) {
      const a = sv.surface.elevationAt(q.x, q.y);
      if (a === null || a === undefined || !Number.isFinite(a)) continue;
      n++;
      const p = q.d - q.e, now = a - q.d;
      if (Math.abs(now) <= tol) within++;
      if (p < -tol) {   // cut cell
        row.cutDone += Math.min(Math.max(q.e - a, 0), q.e - q.d) * Acell;
        if (a < q.d - tol) row.overCut += (q.d - a) * Acell;
      } else if (p > tol) {
        row.fillDone += Math.min(Math.max(a - q.e, 0), q.d - q.e) * Acell;
        if (a > q.d + tol) row.overFill += (a - q.d) * Acell;
      } else {
        if (a > q.e + tol) row.stockpile += (a - q.e) * Acell; else if (a < q.e - tol) row.dig += (q.e - a) * Acell;
      }
      cellsOut.push({ x: q.x, y: q.y, plan: p, now, dz: a - q.e });
    }
    row.covered = base.length ? n / base.length : 0; row.within = n ? within / n : 0;
    row.remainingCut = Math.max(0, out.planned.cut - row.cutDone); row.remainingFill = Math.max(0, out.planned.fill - row.fillDone);
    row.pct = out.planned.total > 0 ? (100 * (row.cutDone + row.fillDone)) / out.planned.total : 0;
    const sch = scheduleAt(schedule, row.date); if (sch !== null) { row.scheduled = sch; row.ahead = row.pct - sch; }
    out.series.push(row);
    out.map.cells = cellsOut;
  }
  out.forecast = forecast(out.series);
  return out;
}

/** The survey rows kept in the project file (state.progress): numbers only, cleaned on load. */
export function cleanProgress(list) {
  const fin = (v) => typeof v === 'number' && Number.isFinite(v);
  return (Array.isArray(list) ? list : []).slice(0, 400).map((r) => {
    if (!r || typeof r !== 'object' || !/^\d{4}-\d{2}-\d{2}$/.test(String(r.date))) return null;
    const n = (k, hi = 1e15) => (fin(r[k]) && r[k] >= 0 && r[k] < hi ? r[k] : 0);
    return { date: String(r.date), label: String(r.label ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, 80), pct: n('pct', 1000), cutDone: n('cutDone'), fillDone: n('fillDone'), remainingCut: n('remainingCut'), remainingFill: n('remainingFill'),
      overCut: n('overCut'), overFill: n('overFill'), stockpile: n('stockpile'), dig: n('dig'), within: n('within', 2), covered: n('covered', 2) };
  }).filter(Boolean).sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
}
