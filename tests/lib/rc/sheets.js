/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file — layout only; every word comes through `w(key, vars)` from the app's language file (rc.sheet.*) */
/**
 * sheets.js — reinforcement shop drawings as display lists (cc-rc, 0.9 RC.1): for each element an elevation (or a plan for a
 * slab) with every bar, its mark, the stirrup / tie zones and the laps dimensioned, and a section; then bar-bending sheets over the
 * whole structure (mark, size, shape sketch with its dimensions, number, cut length, weight). Nothing is stored: the app makes them
 * again from the model on every change (the title block carries the model ref). No DOM.
 *
 *   elementSheet(item, o) → sheet         item = { el, res, marks: [{ group, mark }] } (elements.js + schedule.js)
 *   bendingSheets(rows, o) → [sheet]      rows = the schedule's rows (rebar.js footing rows and schedule.js rows alike)
 *   o = { paper: { w, h, key, k }, textWidth(s, h, bold), w(key, vars) → text, model, ref, date, label(row) → text, bar(name) → bar,
 *         barLabel(name) → text, shapeCode(shape) → text, scheduleDims(shape, dims) → { A, B, C }, codeName, codesName, first, total }
 *   sheet = { w, h, paper, items: [{ k: 'path', pts, w, dash, closed } | { k: 'text', s, x, y, h, align, rot, bold } | { k: 'circle', c, r, w }],
 *             title, kind: 'rc-element' | 'rc-bending', scale, labels: [mark…], dims: [{ value, label }] }
 * Same item vocabulary as drawings.js / shop.js, so pdf.js, dwgout.js and the preview canvas draw them.
 */
import { tessellate } from './bars.js';
import { beamFrame, columnFrame, panelFrame } from './elements.js';

const SCALES = [1, 2, 5, 10, 20, 25, 50, 75, 100, 125, 200, 250, 500];
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const fmt = (v) => String(Math.round(v));

function sheetKit(o) {
  const S = o.paper, items = [], dims = [];
  const P = (pts, st = {}) => items.push({ k: 'path', pts, w: st.w ?? 0.35, dash: st.dash || null, closed: !!st.closed, fill: !!st.fill });
  const T = (s, x, y, h = 2.5, st = {}) => items.push({ k: 'text', s: String(s), x, y, h, align: st.align || 'left', rot: st.rot || 0, bold: !!st.bold });
  const C = (c, r, st = {}) => items.push({ k: 'circle', c, r, w: st.w ?? 0.3, fill: !!st.fill });
  const thin = { w: 0.18 };
  const dimH = (x1, x2, y, from, value, label = fmt(value)) => {
    P([[x1, from], [x1, y - 1.5]], thin); P([[x2, from], [x2, y - 1.5]], thin); P([[x1, y], [x2, y]], thin);
    for (const x of [x1, x2]) P([[x - 0.9, y - 0.9], [x + 0.9, y + 0.9]], { w: 0.35 });
    const tw = o.textWidth(label, 2.2);
    T(label, (x1 + x2) / 2, y + (Math.abs(x2 - x1) >= tw + 1 ? 0.8 : -3.2), 2.2, { align: 'center' });
    dims.push({ dir: 'h', value: Math.round(value), label });
  };
  const dimV = (y1, y2, x, from, value, label = fmt(value)) => {
    P([[from, y1], [x + 1.5, y1]], thin); P([[from, y2], [x + 1.5, y2]], thin); P([[x, y1], [x, y2]], thin);
    for (const y of [y1, y2]) P([[x - 0.9, y - 0.9], [x + 0.9, y + 0.9]], { w: 0.35 });
    T(label, x - 0.8, (y1 + y2) / 2, 2.2, { align: 'center', rot: Math.PI / 2 });
    dims.push({ dir: 'v', value: Math.round(value), label });
  };
  const frameAndTitle = (title, sub2, n, total) => {
    P([[10, 10], [S.w - 10, 10], [S.w - 10, S.h - 10], [10, S.h - 10]], { w: 0.5, closed: true });
    const tb = [S.w - 190, 10, S.w - 10, 46];
    P([[tb[0], tb[1]], [tb[2], tb[1]], [tb[2], tb[3]], [tb[0], tb[3]]], { w: 0.5, closed: true });
    P([[tb[0], tb[1] + 18], [tb[2], tb[1] + 18]], thin); P([[tb[0] + 90, tb[1] + 6], [tb[0] + 90, tb[3]]], thin); P([[tb[0], tb[1] + 6], [tb[2], tb[1] + 6]], thin);
    T(o.w('rc.sheet.tb.drawing'), tb[0] + 2, tb[3] - 4, 1.9); T(title, tb[0] + 2, tb[3] - 9.5, 3, { bold: true });
    T(o.w('rc.sheet.tb.model'), tb[0] + 92, tb[3] - 4, 1.9); T(o.model || '', tb[0] + 92, tb[3] - 9.5, 2.6);
    T(o.w('rc.sheet.tb.ref'), tb[0] + 2, tb[1] + 14, 1.9); T(o.ref || '', tb[0] + 2, tb[1] + 9, 2.6);
    T(o.w('rc.sheet.tb.date'), tb[0] + 92, tb[1] + 14, 1.9); T((o.date || '') + '   ' + o.w('rc.sheet.tb.sheet', { n, total }), tb[0] + 92, tb[1] + 9, 2.6);
    T(o.w('rc.sheet.tb.check'), tb[0] + 2, tb[1] + 2, 1.9);
    T(S.key, tb[2] - 2, tb[1] + 2, 1.9, { align: 'right' });
    T(title, 30, S.h - 22, 5, { bold: true });
    if (sub2) T(sub2, 30, S.h - 29, 3);
  };
  return { S, items, dims, P, T, C, thin, dimH, dimV, frameAndTitle };
}

/** Labels placed without overlapping each other: returns the y used. */
function placer() {
  const used = [];
  return (x, y, wdt, h = 3) => {
    let yy = y;
    for (let k = 0; k < 40; k++) {
      if (!used.some((u) => Math.abs(u.x - x) < (u.w + wdt) / 2 + 1 && Math.abs(u.y - yy) < h)) break;
      yy += h;
    }
    used.push({ x, y: yy, w: wdt });
    return yy;
  };
}

/** One element's shop drawing. */
export function elementSheet(item, o) {
  const K = sheetKit(o), { S, P, T, C, dimH, dimV } = K;
  const { el, res } = item, k = S.k || 1;
  const markOf = new Map((item.marks || []).map((m) => [m.group, m.mark]));
  const kindWord = o.w('rc.kind.' + el.kind);
  const title = (el.name || kindWord) + ' — ' + o.w('rc.sheet.title');
  // views: [projection axes, origin, size u × v]
  let A, Bx, O, U, V, secA, secB, secO, secU, secV, secAt, secN, secLabel;
  if (el.kind === 'beam') {
    const F = beamFrame(el);
    A = F.ex; Bx = F.ez; O = sub(el.a, [F.ez[0] * el.h, F.ez[1] * el.h, F.ez[2] * el.h]); U = F.L; V = el.h;
    secA = F.ey; secB = F.ez; secAt = F.L / 2; secN = F.ex; secU = el.w; secV = el.h;
    secO = [el.a[0] + F.ex[0] * secAt - F.ey[0] * el.w / 2 - F.ez[0] * el.h, el.a[1] + F.ex[1] * secAt - F.ey[1] * el.w / 2 - F.ez[1] * el.h, el.a[2] + F.ex[2] * secAt - F.ey[2] * el.w / 2 - F.ez[2] * el.h];
  } else if (el.kind === 'column') {
    const F = columnFrame(el);
    A = F.ex; Bx = F.ez; O = [F.o[0] - F.ex[0] * el.w / 2, F.o[1] - F.ex[1] * el.w / 2, F.o[2]]; U = el.w; V = F.H;
    secA = F.ex; secB = F.ey; secAt = F.H / 2; secN = F.ez; secU = el.w; secV = el.d;
    secO = [F.o[0] - F.ex[0] * el.w / 2 - F.ey[0] * el.d / 2, F.o[1] - F.ex[1] * el.w / 2 - F.ey[1] * el.d / 2, F.o[2] + secAt];
  } else {
    const F = panelFrame(el);
    A = F.eu; Bx = F.ev; O = F.O; U = F.U; V = F.V;
    secA = el.kind === 'slab' ? F.eu : F.en; secB = el.kind === 'slab' ? F.en : F.ev; secN = el.kind === 'slab' ? F.ev : F.eu;
    secAt = (el.kind === 'slab' ? F.V : F.U) / 2; secU = el.kind === 'slab' ? F.U : F.t; secV = el.kind === 'slab' ? F.t : F.V;
    secO = el.kind === 'slab' ? [F.O[0] + F.ev[0] * secAt, F.O[1] + F.ev[1] * secAt, F.O[2]] : [F.O[0] + F.eu[0] * secAt, F.O[1] + F.eu[1] * secAt, F.O[2]];
  }
  const long = el.kind === 'column' || el.kind === 'wall';   // tall views: the elevation is drawn upright
  // room: the elevation on the left two thirds, the section on the right
  const roomW = S.w - 60 - 110 * Math.max(k, 1), roomH = S.h - 110 * k;
  const scaleE = SCALES.find((n) => U / n <= roomW && V / n <= roomH) || SCALES[SCALES.length - 1];
  const sE = 1 / scaleE, X0 = 30, Y0 = 70 * k + (long ? 0 : Math.max(0, (roomH - V * sE) / 2));
  const ex = (p) => X0 + dot(sub(p, O), A) * sE, ey = (p) => Y0 + dot(sub(p, O), Bx) * sE;
  T(o.w(el.kind === 'slab' ? 'rc.sheet.view.plan' : 'rc.sheet.view.elevation', { scale: '1:' + scaleE }), X0, Y0 + V * sE + 8, 3, { bold: true });
  // outline (+ openings)
  P([[X0, Y0], [X0 + U * sE, Y0], [X0 + U * sE, Y0 + V * sE], [X0, Y0 + V * sE]], { w: 0.5, closed: true });
  if (res.body.openings) for (const [u0, v0, u1, v1] of res.body.openings) {
    P([[X0 + u0 * sE, Y0 + v0 * sE], [X0 + u1 * sE, Y0 + v0 * sE], [X0 + u1 * sE, Y0 + v1 * sE], [X0 + u0 * sE, Y0 + v1 * sE]], { w: 0.5, closed: true });
    P([[X0 + u0 * sE, Y0 + v0 * sE], [X0 + u1 * sE, Y0 + v1 * sE]], { w: 0.18 }); P([[X0 + u1 * sE, Y0 + v0 * sE], [X0 + u0 * sE, Y0 + v1 * sE]], { w: 0.18 });
  }
  // bars: every bar projected; a slab's top mat dashed in the plan
  const place = placer();
  const labels = [];
  for (const g of res.groups) {
    const dashed = el.kind === 'slab' && /^top-/.test(g.role);
    for (const pts of g.polys) P(tessellate(pts, g.rc, 3).map((p) => [ex(p), ey(p)]), { w: g.shape === 'T' ? 0.18 : 0.35, dash: dashed ? [2, 1] : null });
    const mark = markOf.get(g) || '';
    if (!mark) continue;
    const pts = g.polys[Math.floor(g.polys.length / 2)];
    const mid = [(pts[0][0] + pts[pts.length - 1][0]) / 2, (pts[0][1] + pts[pts.length - 1][1]) / 2, (pts[0][2] + pts[pts.length - 1][2]) / 2];
    const s = g.count + ' ' + o.barLabel(g.bar) + ' ' + mark;
    const x = Math.min(Math.max(ex(mid), X0 + 2), X0 + U * sE - 2), y0 = ey(mid);
    const y = place(x, y0 + 1.2, o.textWidth(s, 2.2));
    if (Math.abs(y - y0) > 2) P([[x, y0], [x, y - 0.6]], { w: 0.13 });
    T(s, x, y, 2.2, { align: 'center' });
    labels.push(mark);
  }
  // dimensions: overall, zones of stirrups / ties, laps
  if (el.kind !== 'column') dimH(X0, X0 + U * sE, Y0 - 16, Y0 - 1, U);
  if (long) dimV(Y0, Y0 + V * sE, X0 - 12, X0 - 1, V);
  if (el.kind === 'slab') dimV(Y0, Y0 + V * sE, X0 + U * sE + 10, X0 + U * sE + 1, V);
  const zl = el.kind === 'beam' ? el.stir : el.kind === 'column' ? el.ties : null;
  if (zl && res.info.stations?.length) {
    const st = res.info.stations, a = st[0], b = st[st.length - 1];
    const zoneEnd = Math.min(zl.ends.len, (b - a) / 2);
    const chain = [0, a, a + zoneEnd, b - zoneEnd, b, el.kind === 'beam' ? U : V].filter((v, i, arr) => i === 0 || v > arr[i - 1] + 0.5);
    for (let i = 1; i < chain.length; i++) {
      const v0 = chain[i - 1], v1 = chain[i];
      const isEnd = (v0 >= a - 0.5 && v1 <= a + zoneEnd + 0.5) || (v0 >= b - zoneEnd - 0.5 && v1 <= b + 0.5);
      const isMid = v0 >= a + zoneEnd - 0.5 && v1 <= b - zoneEnd + 0.5;
      const lab = isEnd ? o.w('rc.sheet.zone', { s: fmt(zl.ends.s), len: fmt(v1 - v0) }) : isMid ? o.w('rc.sheet.zone', { s: fmt(zl.s), len: fmt(v1 - v0) }) : fmt(v1 - v0);
      if (!long) dimH(X0 + v0 * sE, X0 + v1 * sE, Y0 - 8, Y0 - 1, v1 - v0, lab); else dimV(Y0 + v0 * sE, Y0 + v1 * sE, X0 - 5, X0 - 1, v1 - v0, lab);
    }
  }
  res.laps.forEach((l, i) => {
    const s = o.w('rc.sheet.lap', { len: fmt(l.provided), bar: o.barLabel(l.bar) });
    if (!long) T(s, X0 + l.at * sE, Y0 + V * sE + 2 + (i % 3) * 2.8, 2, { align: 'center' });
    else T(s, X0 + U * sE + 3, Y0 + Math.min(l.at, V) * sE + (i % 3) * 2.8, 2);
  });
  // section at the middle
  {
    const ns = SCALES.find((n) => secU / n <= 80 * k && secV / n <= 80 * k) || 500, ss = 1 / ns;
    const CX = S.w - 70 * Math.max(k, 1), CY = S.h / 2 + 10 * k;
    const sx = (p) => CX + (dot(sub(p, secO), secA) - secU / 2) * ss, sy = (p) => CY + (dot(sub(p, secO), secB) - secV / 2) * ss;
    T(o.w('rc.sheet.view.section', { scale: '1:' + ns }), CX, CY + secV * ss / 2 + 8, 3, { bold: true, align: 'center' });
    P([[CX - secU * ss / 2, CY - secV * ss / 2], [CX + secU * ss / 2, CY - secV * ss / 2], [CX + secU * ss / 2, CY + secV * ss / 2], [CX - secU * ss / 2, CY + secV * ss / 2]], { w: 0.5, closed: true });
    const cutAt = dot(secO, secN) + 0;   // the plane through secO, normal secN
    let nearTie = null, nearD = Infinity;
    for (const g of res.groups) {
      const b = o.bar(g.bar);
      for (const pts of g.polys) {
        if (g.shape === 'T') {   // the tie nearest the cut, drawn whole
          const d = Math.abs(dot(pts[1], secN) - cutAt);
          if (d < nearD) { nearD = d; nearTie = { pts, g }; }
          continue;
        }
        const tp = tessellate(pts, g.rc, 3);
        for (let i = 1; i < tp.length; i++) {
          const d0 = dot(tp[i - 1], secN) - cutAt, d1 = dot(tp[i], secN) - cutAt;
          if ((d0 < 0) === (d1 < 0) || Math.abs(d1 - d0) < 1e-9) continue;
          const f = d0 / (d0 - d1), q = [tp[i - 1][0] + (tp[i][0] - tp[i - 1][0]) * f, tp[i - 1][1] + (tp[i][1] - tp[i - 1][1]) * f, tp[i - 1][2] + (tp[i][2] - tp[i - 1][2]) * f];
          C([sx(q), sy(q)], Math.max(0.5, b.db / 2 * ss), { fill: true });
        }
      }
    }
    if (nearTie) P(tessellate(nearTie.pts, nearTie.g.rc, 4).map((p) => [sx(p), sy(p)]), { w: 0.3 });
    dimH(CX - secU * ss / 2, CX + secU * ss / 2, CY - secV * ss / 2 - 8, CY - secV * ss / 2 - 1, secU);
    dimV(CY - secV * ss / 2, CY + secV * ss / 2, CX - secU * ss / 2 - 6, CX - secU * ss / 2 - 1, secV);
  }
  // notes: cover, materials, the check list's state
  const notes = item.notes || [];
  notes.slice(0, 8).forEach((s, i) => T(s, 30, 58 * k - i * 3.6, 2.3));
  K.frameAndTitle(title, o.w('rc.sheet.sub', { kind: kindWord, code: o.codeName }), item.n || 1, item.total || 1);
  return { w: S.w, h: S.h, paper: S.key, items: K.items, dims: K.dims, title, kind: 'rc-element', scale: scaleE, labels };
}

/** A shape's sketch in a box (x, y bottom-left, w × h). */
function sketch(K, shape, x, y, wdt, h) {
  const { P } = K, m = 1.2;
  const L = x + m, R = x + wdt - m, B = y + m, T2 = y + h - m;
  if (shape === 'S') P([[L, (B + T2) / 2], [R, (B + T2) / 2]], { w: 0.35 });
  else if (shape === 'L') P([[L, B], [R, B], [R, T2]], { w: 0.35 });
  else if (shape === 'U') P([[L, T2], [L, B], [R, B], [R, T2]], { w: 0.35 });
  else if (shape === 'T') { P([[L + 2, B], [R, B], [R, T2], [L, T2], [L, B + 1], [L + 2, B]], { w: 0.35 }); P([[L, T2], [L + 2.5, T2 - 2.5]], { w: 0.35 }); P([[L + 0.6, T2], [L + 3.1, T2 - 2.5]], { w: 0.35 }); }
  else P([[L, B], [(L + R) / 2, T2], [R, B]], { w: 0.35 });
}

/** Bar-bending sheets: as many as the rows need. */
export function bendingSheets(rows, o) {
  const k = o.paper.k || 1;
  const perPage = Math.max(8, Math.floor((o.paper.h - 110) / 9));
  const pages = [];
  for (let i = 0; i < Math.max(1, rows.length); i += perPage) pages.push(rows.slice(i, i + perPage));
  return pages.map((page, pi) => {
    const K = sheetKit(o), { S, P, T } = K;
    const cols = [['mark', 20], ['size', 16], ['shape', 30], ['code', 12], ['a', 18], ['b', 18], ['c', 18], ['count', 14], ['cut', 20], ['total', 22], ['kg', 20], ['used', 0]];
    const x0 = 20, yTop = S.h - 42;
    let x = x0;
    const xs = cols.map(([, wd]) => { const v = x; x += wd || 0; return v; });
    const xEnd = S.w - 20;
    T(o.w('rc.sheet.bbs.title'), x0, yTop + 6, 3.2, { bold: true });
    P([[x0, yTop], [xEnd, yTop]], { w: 0.35 });
    cols.forEach(([key], i) => T(o.w('rc.sheet.bbs.' + key), xs[i] + 1, yTop - 4.5, 2.1, { bold: true }));
    P([[x0, yTop - 6.5], [xEnd, yTop - 6.5]], { w: 0.25 });
    page.forEach((r, j) => {
      const y = yTop - 6.5 - (j + 1) * 9;
      const d = o.scheduleDims(r.shape, r.dims);
      const cells = [r.mark, o.barLabel(r.bar), '', o.shapeCode(r.shape), d.A === undefined ? '' : fmt(d.A), d.B === undefined ? '' : fmt(d.B), d.C === undefined ? '' : fmt(d.C), String(r.count), fmt(r.length), (r.totalLength / 1000).toFixed(2), r.totalWeight.toFixed(1), o.label ? o.label(r) : (r.roles || []).join('; ')];
      cells.forEach((c, i) => { if (i !== 2) T(c, xs[i] + 1, y + 3, 2.3, { bold: i === 0 }); });
      sketch(K, r.shape, xs[2] + 2, y + 0.8, 24, 7);
      P([[x0, y], [xEnd, y]], { w: 0.13 });
    });
    if (pi === pages.length - 1) {
      const y = yTop - 6.5 - (page.length + 1) * 9;
      const kg = rows.reduce((s, r) => s + r.totalWeight, 0), m = rows.reduce((s, r) => s + r.totalLength, 0) / 1000, n = rows.reduce((s, r) => s + r.count, 0);
      T(o.w('rc.sheet.bbs.totals', { n, m: m.toFixed(1), kg: kg.toFixed(1) }), x0 + 1, y + 3, 2.6, { bold: true });
      if (!rows.length) T(o.w('rc.sheet.bbs.none'), x0 + 1, y + 12, 2.6);
    }
    K.frameAndTitle(o.w('rc.sheet.bbs.title'), o.w('rc.sheet.bbs.sub', { codes: o.codesName || '' }), (o.first || 0) + pi + 1, o.total || pages.length);
    return { w: S.w, h: S.h, paper: S.key, items: K.items, dims: K.dims, title: o.w('rc.sheet.bbs.title'), kind: 'rc-bending', rows: page.map((r) => r.mark) };
  });
}
