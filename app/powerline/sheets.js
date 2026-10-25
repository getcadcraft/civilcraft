/* SPDX-License-Identifier: Apache-2.0 */
/**
 * powerline/sheets.js — the Power lines workspace's sheets (0.7 PL.7), drawn in plot.js's sheet shape so CivilCraft's own PDF
 * writer prints them (toPdfPages). No DOM.
 *
 *   profileSheet({ line, analysis, state, units, paper, title, groundAt, cases }) → sheet
 *       ground along the line, supports, the conductor's lowest phase at each case in `cases` (ids), the clearance line, obstacle
 *       marks, and a strip under it: per span the length, the sag at each case and the lowest clearance (failures marked)
 *   reportSheets({ state, analyses, lib, units, paper, title, issues, issueText, caseName }) → [sheet]
 *       the rule set (cases, limits, clearances, factors), then per line: sections (ruling span, governing case, tensions),
 *       the stringing table, the supports table; then every check; "a design aid" on every page
 * Text is plot.js's Helvetica (WinAnsi); lengths in the project's unit, forces in daN (metres) or lbf (feet).
 */

import { MARGIN, TITLE_H, orient, paperBy } from '../plot.js';
import { conductorCurve } from './checks.js';
import { unitM, toForce, forceUnit } from './units.js';
import { t } from '../i18n.js';

const INK = '#000000', GREY = '#808080', RED = '#c00000', BLUE = '#1e48c8', OCHRE = '#b09000';
const f = (v, d = 2) => (Number.isFinite(v) ? v.toFixed(d) : '');

function chrome(P, title, note) {
  const frame = { x0: MARGIN, y0: MARGIN + TITLE_H, x1: P.w - MARGIN, y1: P.h - MARGIN };
  return {
    frame,
    chrome: [{ color: INK, width: 0.5, pts: [{ x: frame.x0, y: MARGIN }, { x: frame.x1, y: MARGIN }, { x: frame.x1, y: frame.y1 }, { x: frame.x0, y: frame.y1 }], closed: true },
      { color: INK, width: 0.35, pts: [{ x: frame.x0, y: frame.y0 }, { x: frame.x1, y: frame.y0 }] }],
    chromeTexts: [{ color: INK, x: frame.x0 + 4, y: MARGIN + TITLE_H - 6, h: 4, rot: 0, text: title, align: 'left' },
      { color: INK, x: frame.x0 + 4, y: MARGIN + 3.5, h: 2.2, rot: 0, text: note, align: 'left' },
      { color: INK, x: frame.x1 - 4, y: MARGIN + 3.5, h: 2.2, rot: 0, text: t('plot.made', { date: new Date().toISOString().slice(0, 10) }), align: 'right' }],
  };
}

export function profileSheet({ line, analysis, state, units, paper = 'tabloid', title = '', groundAt, cases = [] }) {
  const P = orient(paperBy(paper), true), um = unitM(units), U = units === 'm' ? 'm' : 'ft';
  const ch = analysis.ch || [];
  const { frame, chrome: ch0, chromeTexts } = chrome(P, title || t('pl.sh.profile.title', { name: line.name }), t('pl.sh.aid'));
  const strip = 14 + 5 * Math.max(1, cases.length);   // the table under the profile (mm)
  const box = { x0: frame.x0 + 16, x1: frame.x1 - 6, y0: frame.y0 + strip + 8, y1: frame.y1 - 8 };
  // ground samples
  const g = [];
  let c0 = 0;
  for (let i = 0; i < line.supports.length - 1; i++) {
    const a = line.supports[i], b = line.supports[i + 1], L = Math.hypot(b.x - a.x, b.y - a.y), n = Math.max(10, Math.ceil(L / (U === 'm' ? 2 : 6)));
    for (let j = i ? 1 : 0; j <= n; j++) { const tt = j / n; g.push({ ch: c0 + tt * L, z: groundAt(a.x + (b.x - a.x) * tt, a.y + (b.y - a.y) * tt) }); }
    c0 += L;
  }
  let z0 = Infinity, z1 = -Infinity;
  for (const p of g) if (p.z != null) { z0 = Math.min(z0, p.z); z1 = Math.max(z1, p.z); }
  for (const s of analysis.supports) if (s.groundZ != null && s.aboveGround_m != null) z1 = Math.max(z1, s.groundZ + s.aboveGround_m / um);
  if (!Number.isFinite(z0)) { z0 = 0; z1 = 10; }
  const zr = Math.max(1, z1 - z0);
  z0 -= zr * 0.05; z1 += zr * 0.08;
  const L = Math.max(1, c0);
  const X = (c) => box.x0 + (c / L) * (box.x1 - box.x0), Y = (z) => box.y0 + ((z - z0) / (z1 - z0)) * (box.y1 - box.y0);
  const strokes = [], texts = [];
  // grid and elevation labels
  const step = niceStep((z1 - z0) / 6);
  for (let z = Math.ceil(z0 / step) * step; z <= z1; z += step) { strokes.push({ color: '#d0d0d0', width: 0.1, pts: [{ x: box.x0, y: Y(z) }, { x: box.x1, y: Y(z) }] }); texts.push({ color: GREY, x: box.x0 - 2, y: Y(z) - 0.8, h: 1.8, rot: 0, text: f(z, step < 1 ? 1 : 0), align: 'right' }); }
  const cs = niceStep(L / 10);
  for (let c = 0; c <= L + 1e-9; c += cs) texts.push({ color: GREY, x: X(c), y: box.y0 - 4, h: 1.8, rot: 0, text: f(c, 0), align: 'center' });
  // ground and the clearance line
  const R = state.rules, need = (R.clearances.find((c) => c.id === (line.clearance || 'ground'))?.min_m ?? 0) / um;
  const run = (fn, color, width, dash) => { let pts = []; for (const p of g) { if (p.z == null) { if (pts.length > 1) strokes.push({ color, width, pts, dash }); pts = []; continue; } pts.push({ x: X(p.ch), y: Y(fn(p.z)) }); } if (pts.length > 1) strokes.push({ color, width, pts, dash }); };
  run((z) => z, INK, 0.35); run((z) => z + need, OCHRE, 0.18, [1.5, 1]);
  // conductors
  const colors = [BLUE, RED, '#008000', '#9a1f86', '#007a8a', '#c05000'];
  cases.forEach((cid, k) => {
    for (const sp of analysis.spans) { const pts = conductorCurve(analysis, sp.i, cid, units, 30); if (pts.length) strokes.push({ color: colors[k % colors.length], width: 0.3, pts: pts.map((p) => ({ x: X(p.ch), y: Y(p.z) })) }); }
  });
  // supports
  line.supports.forEach((p, i) => {
    const s = analysis.supports[i];
    if (!s || s.groundZ == null) return;
    const top = s.aboveGround_m != null ? s.groundZ + s.aboveGround_m / um : s.groundZ;
    const bad = (analysis.issues || []).some((x) => x.support === i && x.sev === 'error');
    strokes.push({ color: bad ? RED : INK, width: 0.6, pts: [{ x: X(ch[i]), y: Y(s.groundZ) }, { x: X(ch[i]), y: Y(top) }] });
    texts.push({ color: bad ? RED : INK, x: X(ch[i]), y: Y(top) + 1.5, h: 2, rot: 0, text: p.name || String(i + 1), align: 'center' });
  });
  // obstacles crossed
  for (const sp of analysis.spans) for (const o of sp.obstacles) {
    const c = ch[sp.i] + o.at_m / um, ob = state.obstacles.find((x) => x.id === o.id), gz = groundAtCh(g, c);
    if (gz == null || !ob) continue;
    strokes.push({ color: o.ok ? OCHRE : RED, width: 0.5, pts: [{ x: X(c), y: Y(gz) }, { x: X(c), y: Y(gz + (ob.h || 0)) }] });
    texts.push({ color: o.ok ? OCHRE : RED, x: X(c) + 1, y: Y(gz + (ob.h || 0)) + 1, h: 1.6, rot: 0, text: ob.name || '', align: 'left' });
  }
  // the strip: per span length, sag per case, lowest clearance
  const sy = frame.y0 + strip + 2;
  strokes.push({ color: INK, width: 0.25, pts: [{ x: frame.x0, y: sy }, { x: frame.x1, y: sy }] });
  const rowY = (k) => sy - 4 - k * 4.4;
  texts.push({ color: INK, x: frame.x0 + 2, y: rowY(0), h: 1.8, rot: 0, text: t('pl.sh.span.len', { u: U }), align: 'left' });
  cases.forEach((cid, k) => texts.push({ color: colors[k % colors.length], x: frame.x0 + 2, y: rowY(k + 1), h: 1.8, rot: 0, text: t('pl.sh.span.sag', { c: caseNameOf(state, cid), u: U }), align: 'left' }));
  texts.push({ color: INK, x: frame.x0 + 2, y: rowY(cases.length + 1), h: 1.8, rot: 0, text: t('pl.sh.span.clear', { u: U }), align: 'left' });
  for (const sp of analysis.spans) {
    const mx = X((ch[sp.i] + ch[sp.i + 1]) / 2);
    if (mx < frame.x0 + 40) continue;
    const sec = analysis.sections[sp.section], k0 = sec ? sec.spans.findIndex((x) => x.i === sp.i) : -1;
    texts.push({ color: INK, x: mx, y: rowY(0), h: 1.8, rot: 0, text: f(sp.L_m / um, 1), align: 'center' });
    cases.forEach((cid, k) => { const r = sec?.solve?.cases?.[cid]?.spans?.[k0]; texts.push({ color: colors[k % colors.length], x: mx, y: rowY(k + 1), h: 1.8, rot: 0, text: r ? f(r.sag / um, 2) : '', align: 'center' }); });
    const w = sp.worst;
    texts.push({ color: w && w.margin_m < 0 ? RED : INK, x: mx, y: rowY(cases.length + 1), h: 1.8, rot: 0, text: w ? f((w.margin_m + (sp.clear[w.caseId]?.need_m || 0)) / um, 2) : '', align: 'center' });
  }
  return { w: P.w, h: P.h, name: title, views: [{ clip: frame, strokes, texts, points: [] }], chrome: ch0, chromeTexts };
}

const caseNameOf = (state, id) => state.rules.cases.find((c) => c.id === id)?.name || id;
const groundAtCh = (g, c) => { for (let i = 1; i < g.length; i++) if (g[i].ch >= c) { const a = g[i - 1], b = g[i]; if (a.z == null || b.z == null) return a.z ?? b.z; return a.z + (b.z - a.z) * ((c - a.ch) / Math.max(1e-9, b.ch - a.ch)); } return g[g.length - 1]?.z ?? null; };
function niceStep(r) { const p = 10 ** Math.floor(Math.log10(Math.max(1e-9, r))), m = r / p; return (m < 1.5 ? 1 : m < 3.5 ? 2 : m < 7.5 ? 5 : 10) * p; }

/** Text pages: one table after another, a new page when the page is full. */
export function reportSheets({ state, analyses, lib, units, paper = 'a4', title = '', issues = [], issueText = (x) => x.code }) {
  const P = orient(paperBy(paper), false), um = unitM(units), U = units === 'm' ? 'm' : 'ft', FU = forceUnit(units);
  const F = (N) => (Number.isFinite(N) ? toForce(N, units).toFixed(0) : '');
  const pages = [];
  let cur = null, y = 0;
  const H = 2.4, LH = 4.2;
  const newPage = () => {
    const c = chrome(P, title || t('pl.rep.title'), t('pl.sh.aid'));
    cur = { w: P.w, h: P.h, name: title, views: [{ clip: c.frame, strokes: [], texts: [], points: [] }], chrome: c.chrome, chromeTexts: c.chromeTexts, frame: c.frame };
    pages.push(cur);
    y = c.frame.y1 - 8;
  };
  const need = (h) => { if (!cur || y - h < cur.frame.y0 + 6) newPage(); };
  const text = (x, s, opts = {}) => cur.views[0].texts.push({ color: opts.color || INK, x, y, h: opts.h || H, rot: 0, text: String(s ?? ''), align: opts.align || 'left' });
  const heading = (s) => { need(LH * 3); y -= 2; text(cur.frame.x0 + 6, s, { h: 3.2 }); y -= LH * 1.4; };
  const para = (s) => { for (const line of wrap(String(s), 110)) { need(LH); text(cur.frame.x0 + 6, line); y -= LH; } };
  /** cols: [{ head, w (mm), align }]; rows: [[cell…]] (a cell { v, color } colours it) */
  const table = (cols, rows) => {
    const x0 = cur ? cur.frame.x0 + 6 : MARGIN + 6;
    const drawHead = () => { let x = x0; for (const c of cols) { text(c.align === 'right' ? x + c.w - 1 : x, c.head, { h: 2.1, align: c.align === 'right' ? 'right' : 'left', color: GREY }); x += c.w; } y -= LH; };
    need(LH * 2); drawHead();
    for (const r of rows) {
      if (y - LH < cur.frame.y0 + 6) { newPage(); drawHead(); }
      let x = x0;
      cols.forEach((c, i) => { const cell = r[i], v = cell && typeof cell === 'object' ? cell.v : cell; text(c.align === 'right' ? x + c.w - 1 : x, v, { align: c.align === 'right' ? 'right' : 'left', color: cell?.color }); x += c.w; });
      y -= LH;
    }
    y -= 2;
  };
  newPage();
  const R = state.rules;
  heading(t('pl.rep.rules', { name: R.name }));
  if (R.example) para(t('pl.rep.example'));
  table([{ head: t('pl.rep.c.case'), w: 50 }, { head: '°C', w: 18, align: 'right' }, { head: t('pl.rep.c.wind'), w: 28, align: 'right' }, { head: t('pl.rep.c.ice'), w: 26, align: 'right' }, { head: t('pl.rep.c.dens'), w: 30, align: 'right' }],   // i18n-ignore: a unit
    R.cases.map((c) => [c.name, f(c.temp, 0), f(c.wind_Pa, 0), f(c.ice_mm, 1), c.ice_mm ? f(c.iceDensity, 0) : '']));
  table([{ head: t('pl.rep.c.limit'), w: 90 }, { head: t('pl.rep.c.value'), w: 40, align: 'right' }],
    R.limits.map((l) => [t(l.kind === 'T' ? 'pl.rules.lim.t' : 'pl.rules.lim.h', { c: caseNameOf(state, l.caseId) }), l.fixed ? F(l.fixed) + ' ' + FU : f(l.pct, 1) + ' %']));
  table([{ head: t('pl.rep.c.clear'), w: 90 }, { head: U, w: 40, align: 'right' }], R.clearances.map((c) => [c.name, f(c.min_m / um, 2)]));
  para(t('pl.rep.factors', { k: f(R.spacingK, 2), sw: f(R.swingMax_deg, 0), sf: f(R.sizeFactor, 2) }));
  for (const line of state.lines) {
    const a = analyses.get(line.id);
    if (!a) continue;
    heading(t('pl.rep.line', { name: line.name, cond: lib.get(line.conductor)?.name || line.conductor || '—', n: line.supports.length }));
    // the reference case, the hot case and the governing one (A4 upright holds three tension columns)
    const shown = [...new Set([R.cases[0].id, R.hotCase, ...a.sections.map((s) => s.solve?.governing)].filter((id) => id && R.cases.some((c) => c.id === id)))].slice(0, 3);
    table([{ head: t('pl.p.sec.n'), w: 14 }, { head: t('pl.p.sec.supports'), w: 18 }, { head: t('pl.p.sec.lr') + ' (' + U + ')', w: 28, align: 'right' }, { head: t('pl.p.sec.gov'), w: 34 }, ...shown.map((id) => ({ head: 'H ' + caseNameOf(state, id) + ' (' + FU + ')', w: 26, align: 'right' }))],
      a.sections.map((s, i) => [String(i + 1), `${s.from + 1}–${s.to + 1}`, f((s.Lr || 0) / um, 1), s.solve?.ok ? caseNameOf(state, s.solve.governing) : t('pl.p.notsolved'), ...shown.map((id) => F(s.solve?.cases?.[id]?.H))]));
    for (const [si, s] of a.sections.entries()) {
      if (!s.stringing.length) continue;
      para(t('pl.rep.string', { n: si + 1 }));
      const spans = s.spans.slice(0, 8);
      table([{ head: '°C', w: 14, align: 'right' }, { head: 'H (' + FU + ')', w: 24, align: 'right' }, ...spans.map((sp) => ({ head: t('pl.rep.sag', { n: sp.i + 1, u: U }), w: 20, align: 'right' }))],   // i18n-ignore: a unit
        s.stringing.map((row) => [f(row.temp, 0), F(row.H), ...row.spans.slice(0, 8).map((x) => f(x.sag / um, 2))]));
    }
    table([{ head: t('pl.rep.s.name'), w: 18 }, { head: t('pl.rep.s.role'), w: 22 }, { head: t('pl.rep.s.item'), w: 52 }, { head: t('pl.rep.s.load', { u: FU }), w: 26, align: 'right' }, { head: t('pl.rep.s.nom', { u: FU }), w: 24, align: 'right' }, { head: t('pl.rep.s.ok'), w: 14 }],
      a.supports.map((s, i) => { const it = lib.get(line.supports[i].support); const ok = s.sizeOk; return [line.supports[i].name || String(i + 1), t('pl.role.' + s.role), it?.name || '—', F(s.worstFeq * (R.sizeFactor || 1)), it ? F(it.nominal_N) : '', { v: ok == null ? '' : ok ? t('pl.rep.yes') : t('pl.rep.no'), color: ok === false ? RED : INK }]; }));
  }
  heading(t('pl.rep.checks', { n: issues.length }));
  if (!issues.length) para(t('pl.sec.checks.none'));
  for (const x of issues) { need(LH); text(cur.frame.x0 + 6, (x.sev === 'error' ? '× ' : '! ') + issueText(x), { color: x.sev === 'error' ? RED : INK }); y -= LH; }
  for (const p of pages) delete p.frame;
  return pages;
}

function wrap(s, n) {
  const out = [];
  let line = '';
  for (const w of s.split(/\s+/)) { if ((line + ' ' + w).trim().length > n) { out.push(line.trim()); line = w; } else line += ' ' + w; }
  if (line.trim()) out.push(line.trim());
  return out;
}
