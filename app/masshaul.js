/* SPDX-License-Identifier: Apache-2.0 */
/**
 * masshaul.js — the mass-haul diagram (0.4 V24) from an alignment's cross sections (sections.js buildSections rows: the
 * cut and fill volume between each section and the one before, by average end areas). No DOM; the Node test drives it
 * (bin/test-civilcraft-masshaul.mjs).
 *
 *   massHaul(rows, { factor }) → { points: [{ sta, m }], balance: [sta], spans: [{ from, to, volume, dir: 'ahead'|'back',
 *       haul }], totals: { cut, cutAdj, fill, end, kind: 'waste'|'borrow'|'balanced' } }
 *     factor: what a unit of cut makes in the fill (shrink 10 % → 0.90, swell 5 % → 1.05). The mass ordinate at a section
 *     is Σ (cut × factor − fill) from the first one, in the project's cubic units. It is taken as straight between
 *     sections. Balance points are where it crosses zero. Between two neighbouring balance points (or an end) the earth
 *     balances: the volume moved is the largest |m| there, moved up station ('ahead') where m rises then falls, back where
 *     it falls then rises; the average haul is the area between the curve and zero over that volume (stations × volume ÷
 *     volume = a distance). At the far end what is left over is waste (m > 0) or borrow (m < 0): the last stretch's balance
 *     line is at the level it ends on, so only the earth beyond it counts as moved there (the classic balance line).
 *   massHaulCsv(result, { units, station }) → CSV (CRLF): station and mass ordinate in cu yd / cu m, then the spans
 */

import { t } from './i18n.js';
import { unitOf, fixed } from './units.js';

export function massHaul(rows, { factor = 1 } = {}) {
  const k = Number.isFinite(factor) && factor > 0 && factor < 5 ? factor : 1;
  const points = [];
  let m = 0, cut = 0, fill = 0;
  rows.forEach((r, i) => {
    if (i > 0) { m += (r.cutVol || 0) * k - (r.fillVol || 0); cut += r.cutVol || 0; fill += r.fillVol || 0; }
    points.push({ sta: r.sta, m });
  });
  // balance points: where the straight pieces cross zero (a piece lying on zero counts at its start)
  const balance = [];
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1], b = points[i];
    if ((a.m > 0 && b.m < 0) || (a.m < 0 && b.m > 0)) balance.push(a.sta + ((b.sta - a.sta) * a.m) / (a.m - b.m));
    else if (b.m === 0 && a.m !== 0 && i < points.length - 1) balance.push(b.sta);
  }
  // spans between the ends and the balance points
  const cuts = [points[0]?.sta, ...balance, points.at(-1)?.sta].filter((v) => v !== undefined);
  const at = (s) => { for (let i = 1; i < points.length; i++) if (s <= points[i].sta + 1e-9) { const a = points[i - 1], b = points[i], f = b.sta > a.sta ? (s - a.sta) / (b.sta - a.sta) : 0; return a.m + (b.m - a.m) * f; } return points.at(-1)?.m ?? 0; };
  const spans = [];
  for (let j = 1; j < cuts.length; j++) {
    const s0 = cuts[j - 1], s1 = cuts[j];
    if (!(s1 > s0)) continue;
    const pts = [{ sta: s0, m: at(s0) }, ...points.filter((p) => p.sta > s0 + 1e-9 && p.sta < s1 - 1e-9), { sta: s1, m: at(s1) }];
    // a stretch starts on zero (the first section or a balance point); the last one may end off zero (waste or borrow).
    // The balance line is at the level it ends on: only the earth beyond that line moves within the stretch.
    const e = pts.at(-1).m;
    let peak = 0;
    for (const q of pts) if (Math.abs(q.m) > Math.abs(peak)) peak = q.m;
    const volume = Math.abs(peak) - Math.abs(e);
    if (!(volume > 1e-9)) continue;
    const sg = Math.sign(peak), ex = (v) => Math.max(0, sg * v - Math.abs(e));   // how far past the balance line
    let area = 0;
    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1], b = pts[i], fa = ex(a.m), fb = ex(b.m), L = b.sta - a.sta;
      if (fa > 0 && fb > 0) area += ((fa + fb) / 2) * L;
      else if (fa > 0 || fb > 0) { const ga = sg * a.m - Math.abs(e), gb = sg * b.m - Math.abs(e), x = (ga / (ga - gb)) * L; area += fa > 0 ? (fa * x) / 2 : (fb * (L - x)) / 2; }   // crosses the line
    }
    spans.push({ from: s0, to: s1, volume, dir: peak > 0 ? 'ahead' : 'back', haul: area / volume });
  }
  const end = m;
  return { points, balance, spans, totals: { cut, cutAdj: cut * k, fill, end, kind: Math.abs(end) < 1e-6 * Math.max(1, cut + fill) ? 'balanced' : end > 0 ? 'waste' : 'borrow' }, factor: k };
}

export function massHaulCsv(res, { units = 'ft', station = (s) => String(s) } = {}) {
  const u = unitOf(units), v = (x) => fixed(x / u.volPer, 1).replace(/,/g, ''), d = (x) => fixed(x, 2).replace(/,/g, '');
  const rows = [[t('mh.c.sta'), t('mh.c.m', { u: u.vol })]];
  for (const p of res.points) rows.push([station(p.sta), v(p.m)]);
  rows.push([], [t('mh.c.from'), t('mh.c.to'), t('mh.c.vol', { u: u.vol }), t('mh.c.dir'), t('mh.c.haul', { u: units === 'm' ? 'm' : 'ft' })]);
  for (const s of res.spans) rows.push([station(s.from), station(s.to), v(s.volume), t('mh.dir.' + s.dir), d(s.haul)]);
  rows.push([], [t('mh.c.factor'), String(res.factor)], [t('mh.c.end', { u: u.vol }), v(res.totals.end)]);
  return rows.map((r) => r.map((x) => (/[",\r\n]/.test(x) ? '"' + x.replace(/"/g, '""') + '"' : x)).join(',')).join('\r\n') + '\r\n';
}
