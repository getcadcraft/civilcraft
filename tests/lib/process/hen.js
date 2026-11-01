/* SPDX-License-Identifier: Apache-2.0 */
/**
 * hen.js — the heat-exchanger network grid (0.8 Track CH, CH.22, chem-draw_PART_4; DOM-free). From the stream data of the pinch calculator it works out a network by the
 * pinch design method (Linnhoff and Hindmarsh 1983; the CP rule at the pinch: above it a hot stream may only be matched to a cold one with CPhot <= CPcold, below it
 * CPhot >= CPcold) with the tick-off rule (each match takes the smaller remaining duty), puts utilities where the targets say, and draws the classic grid as plain entities
 * (lines, circles, text on layers HEN-*). It is a first design to start from, not an optimised one: the number of units is reported next to the minimum.
 *
 *   design(streams, dTmin)   streams [{ id?, Ts, Tt, CP }] (temperatures on one scale, CP in kW/K)
 *                            → { pinchHot, pinchCold, QHmin, QCmin, streams, matches [{ region, hot, cold, Q, hotT:[a,b], coldT:[a,b], ok, dT:[d1,d2] }], heaters, coolers, units, minUnits, problems, closed }
 *   gridEntities(d, { x0, y0, dx, dy, h })   the grid as entities in the drawing's units (default 1 unit = 1 mm of paper at the person's scale)
 */
import { problemTable, minUnits } from './pinch.js';

const EPS = 1e-9;
const prob = (code, severity, text) => ({ code, severity, text, source: { kind: 'engine', name: 'process' } });

export function design(streams, dTmin) {
  const problems = [], S = (streams || []).map((s, i) => ({ id: String(s.id || (Ts_hot(s) ? 'H' : 'C') + (i + 1)), Ts: +s.Ts, Tt: +s.Tt, CP: +s.CP, hot: s.Ts > s.Tt }));
  for (const s of S) if (!(s.CP > 0) || !Number.isFinite(s.Ts) || !Number.isFinite(s.Tt) || s.Ts === s.Tt) throw new Error(`Stream ${s.id}: give two different temperatures and a CP above zero.`);
  const pt = problemTable(S, dTmin), Th = pt.pinchHot, Tc = pt.pinchCold, matches = [], heaters = [], coolers = [];
  // region data: each stream's part in the region, with its pinch-side temperature and the far one
  const part = (s, above) => {
    if (above) {
      if (s.hot) { if (s.Ts <= Th + EPS) return null; const near = Math.max(s.Tt, Th); return { near, far: s.Ts, duty: s.CP * (s.Ts - near) }; }
      if (s.Tt <= Tc + EPS) return null; const near = Math.max(s.Ts, Tc); return { near, far: s.Tt, duty: s.CP * (s.Tt - near) };
    }
    if (s.hot) { if (s.Tt >= Th - EPS) return null; const near = Math.min(s.Ts, Th); return { near, far: s.Tt, duty: s.CP * (near - s.Tt) }; }
    if (s.Ts >= Tc - EPS) return null; const near = Math.min(s.Tt, Tc); return { near, far: s.Ts, duty: s.CP * (near - s.Ts) };
  };
  for (const above of [true, false]) {
    const region = above ? 'above' : 'below', hs = [], cs = [];
    for (const s of S) { const p = part(s, above); if (!p || p.duty < EPS) continue; (s.hot ? hs : cs).push({ s, ...p, rem: p.duty, T: p.near, atPinch: Math.abs(p.near - (s.hot ? Th : Tc)) < 1e-7 }); }
    const sign = above ? 1 : -1;                                       // temperature moves up (above) or down (below) as a stream's duty is used from the pinch outward
    for (let guard = 0; guard < 200; guard++) {
      let best = null;
      for (const h of hs) { if (h.rem < EPS) continue; for (const c of cs) {
        if (c.rem < EPS) continue;
        const cpOk = above ? h.s.CP <= c.s.CP + EPS : h.s.CP >= c.s.CP - EPS;
        if (h.atPinch && c.atPinch && !cpOk) continue;                      // the CP rule binds a match of two streams that both touch the pinch
        const q = Math.min(h.rem, c.rem), pinchTouch = (h.atPinch ? 1 : 0) + (c.atPinch ? 1 : 0);
        const score = (pinchTouch * 1e9) + q;
        if (!best || score > best.score) best = { h, c, q, score, cpOk };
      } }
      if (!best || best.q < EPS) break;
      const { h, c, q } = best, dh = q / h.s.CP, dc = q / c.s.CP;
      const hotT = [h.T, h.T + sign * dh], coldT = [c.T, c.T + sign * dc];
      // counter-current ends: the pinch-side end of the hot stream faces the pinch-side end of the cold one
      const d1 = Math.abs(hotT[0] - coldT[0]), d2 = Math.abs(hotT[1] - coldT[1]);
      const ok = Math.min(d1, d2) >= dTmin - 1e-6;
      if (!ok) problems.push(prob('hen.dtmin', 'warning', `Match ${h.s.id}/${c.s.id} (${region} the pinch) leaves ${Math.min(d1, d2).toFixed(2)} between the streams at one end, below the minimum ${dTmin}.`));
      matches.push({ region, hot: h.s.id, cold: c.s.id, Q: q, hotT, coldT, ok, dT: [d1, d2], cpRule: best.cpOk });
      h.rem -= q; c.rem -= q; h.T += sign * dh; c.T += sign * dc; h.atPinch = false; c.atPinch = false;
    }
    for (const c of cs) if (c.rem > 1e-6 && above) heaters.push({ stream: c.s.id, Q: c.rem, from: c.T, to: c.far });
    for (const h of hs) if (h.rem > 1e-6 && !above) coolers.push({ stream: h.s.id, Q: h.rem, from: h.T, to: h.far });
    // what no match and no allowed utility can take: a hot stream left above the pinch, a cold one left below (that would cross the pinch with a utility)
    for (const h of hs) if (h.rem > 1e-6 && above) { problems.push(prob('hen.hotleft', 'warning', `Stream ${h.s.id} has ${h.rem.toFixed(2)} kW left above the pinch that no allowed match took (a cooler there would cost energy); split the stream or accept the penalty.`)); coolers.push({ stream: h.s.id, Q: h.rem, from: h.T, to: h.far, crosses: true }); }
    for (const c of cs) if (c.rem > 1e-6 && !above) { problems.push(prob('hen.coldleft', 'warning', `Stream ${c.s.id} has ${c.rem.toFixed(2)} kW left below the pinch that no allowed match took (a heater there would cost energy); split the stream or accept the penalty.`)); heaters.push({ stream: c.s.id, Q: c.rem, from: c.T, to: c.far, crosses: true }); }
  }
  const sumQ = (l) => l.reduce((a, x) => a + x.Q, 0), QH = sumQ(heaters), QC = sumQ(coolers), mu = minUnits(S, dTmin).total, units = matches.length + heaters.length + coolers.length;
  if (QH > pt.QHmin + 1e-6 || QC > pt.QCmin + 1e-6) problems.push(prob('hen.target', 'warning', `The network uses ${QH.toFixed(2)} of heating and ${QC.toFixed(2)} of cooling; the targets are ${pt.QHmin.toFixed(2)} and ${pt.QCmin.toFixed(2)}.`));
  problems.push(prob('hen.note', 'info', `${units} units against a minimum of ${mu}; first design by the pinch method with tick-off matches, temperatures between matches are not optimised, no stream splits.`));
  return { pinchHot: Th, pinchCold: Tc, QHmin: pt.QHmin, QCmin: pt.QCmin, dTmin, streams: S, matches, heaters, coolers, units, minUnits: mu, problems, closed: QH <= pt.QHmin + 1e-6 && QC <= pt.QCmin + 1e-6 };
}
function Ts_hot(s) { return s.Ts > s.Tt; }

/** The grid as entities. Hot streams on top flowing left to right, cold streams below flowing right to left, the pinch as a dashed vertical line, matches as two circles joined by a line. */
export function gridEntities(d, { x0 = 0, y0 = 0, dx = 30, dy = 14, h = 2.5 } = {}) {
  const ents = [], hot = d.streams.filter((s) => s.hot), cold = d.streams.filter((s) => !s.hot), rows = [...hot, ...cold];
  const yOf = new Map(rows.map((s, i) => [s.id, y0 - i * dy])), aboveM = d.matches.filter((m) => m.region === 'above'), belowM = d.matches.filter((m) => m.region === 'below');
  const nL = aboveM.length + d.heaters.filter((x) => !x.crosses).length + 1, nR = belowM.length + d.coolers.filter((x) => !x.crosses).length + 1;
  const xP = x0 + (nL + 0.5) * dx, xEnd = xP + (nR + 0.5) * dx, line = (x1, y1, x2, y2, layer) => ents.push({ type: 'line', x1, y1, x2, y2, layer }), text = (x, y, s, layer = 'HEN-TEXT', ha = 'center') => ents.push({ type: 'text', x, y, h, rot: 0, s: String(s), ha, va: 'middle', layer });
  const f = (v) => +Number(v).toFixed(1);
  for (const s of rows) {
    const y = yOf.get(s.id); line(x0, y, xEnd, y, 'HEN-STREAM');
    const arrow = s.hot ? [xEnd, y, xEnd - h, y + h / 2, xEnd - h, y - h / 2] : [x0, y, x0 + h, y + h / 2, x0 + h, y - h / 2];
    line(arrow[0], y, arrow[2], arrow[3], 'HEN-STREAM'); line(arrow[0], y, arrow[4], arrow[5], 'HEN-STREAM');
    text(x0 - dx * 0.2, y + h * 1.2, s.id + '  CP ' + f(s.CP), 'HEN-TEXT', 'right');
    text(s.hot ? x0 + dx * 0.3 : xEnd - dx * 0.3, y + h * 1.2, f(s.Ts) + (s.hot ? '' : ''), 'HEN-TEXT'); text(s.hot ? xEnd - dx * 0.3 : x0 + dx * 0.3, y + h * 1.2, f(s.Tt), 'HEN-TEXT');
    if (!s.hot) { /* a cold stream is entered at the right */ }
  }
  line(xP, y0 + dy * 0.6, xP, y0 - rows.length * dy + dy * 0.4, 'HEN-PINCH'); text(xP, y0 + dy * 0.9, `pinch ${f(d.pinchHot)} / ${f(d.pinchCold)}`, 'HEN-PINCH');
  const unit = (x, ya, yb, label, layer) => {
    ents.push({ type: 'circle', cx: x, cy: ya, r: h * 0.6, layer }); if (yb !== null) { ents.push({ type: 'circle', cx: x, cy: yb, r: h * 0.6, layer }); line(x, ya, x, yb, layer); }
    text(x, (yb === null ? ya : (ya + yb) / 2) - (yb === null ? h * 1.6 : 0) + (yb === null ? 0 : 0), label, 'HEN-TEXT');
  };
  // matches nearest the pinch sit nearest the pinch line
  aboveM.forEach((m, i) => unit(xP - (i + 1) * dx, yOf.get(m.hot), yOf.get(m.cold), f(m.Q), 'HEN-MATCH'));
  belowM.forEach((m, i) => unit(xP + (i + 1) * dx, yOf.get(m.hot), yOf.get(m.cold), f(m.Q), 'HEN-MATCH'));
  let kl = aboveM.length, kr = belowM.length;
  for (const u of d.heaters) { const x = u.crosses ? xP + dx * 0.5 : xP - (++kl) * dx; unit(x, yOf.get(u.stream), null, 'H ' + f(u.Q), 'HEN-UTIL'); }
  for (const u of d.coolers) { const x = u.crosses ? xP - dx * 0.5 : xP + (++kr) * dx; unit(x, yOf.get(u.stream), null, 'C ' + f(u.Q), 'HEN-UTIL'); }
  return ents;
}
