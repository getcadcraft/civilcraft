/* SPDX-License-Identifier: Apache-2.0 */
/**
 * masshaul-ui.js — the Mass haul dialog (0.4 V24), opened from an alignment's Sample lines block (sections-ui.js): the
 * shrink or swell of the cut, the diagram (mass ordinate along the stations, balance points marked, stretches shaded),
 * the balanced stretches with the volume moved, its direction and the average haul, what is left over, and a CSV.
 * The numbers are masshaul.js's (bin/test-civilcraft-masshaul.mjs).
 *
 *   massHaulDialog(ctx, a, set)   ctx = { root, el, units: () => 'ft'|'m', download(bytes, name, type), fileStem(), say }
 *   drawMassHaul(canvas, res, { units, station })
 */

import { t } from './i18n.js';
import { massHaul, massHaulCsv } from './masshaul.js';
import { formatStation, fixed, unitOf } from './units.js';

const STORE = 'civilcraft.masshaul';
let uid = 0;

export function massHaulDialog(ctx, a, set) {
  const { el } = ctx, U = ctx.units(), uo = unitOf(U), id = 'cv-mh-' + (++uid);
  let pct = -10;
  try { const v = Number(localStorage.getItem(STORE)); if (localStorage.getItem(STORE) !== null && Number.isFinite(v) && v > -60 && v < 100) pct = v; } catch { /* defaults */ }
  const fac = el('input', { type: 'text', className: 'cv-input', id: id + '-f', inputMode: 'decimal', value: String(pct), style: 'width:6rem', 'data-mh-factor': '' });
  const cv = el('canvas', { className: 'cv-mh-diagram', 'data-mh-diagram': '', role: 'img', 'aria-label': t('mh.diagram.label') });
  const facts = el('div', { 'aria-live': 'polite', 'data-mh-facts': '' });
  const csv = el('button', { type: 'button', className: 'btn-line btn-sm-cc', 'data-mh-csv': '' }, el('i', { className: 'bi bi-download', 'aria-hidden': 'true' }), ' CSV');
  const close = el('button', { type: 'button', className: 'cv-x', 'aria-label': t('tv.close') }, el('i', { className: 'bi bi-x-lg', 'aria-hidden': 'true' }));
  const station = (s) => formatStation(s, U);
  const vol = (v) => fixed(v / uo.volPer, 1) + ' ' + uo.vol;
  let res = null;
  function update() {
    const p = Number(fac.value);
    if (!(p > -60 && p < 100) || fac.value.trim() === '') { fac.setAttribute('aria-invalid', 'true'); return; }
    fac.removeAttribute('aria-invalid');
    try { localStorage.setItem(STORE, String(p)); } catch { /* this visit only */ }
    res = massHaul(set.rows, { factor: 1 + p / 100 });
    drawMassHaul(cv, res, { units: U, station });
    const T = res.totals;
    facts.replaceChildren(
      el('p', { className: 'cv-note', 'data-mh-totals': '' }, t('mh.totals', { cut: vol(T.cut), adj: vol(T.cutAdj), fill: vol(T.fill) }) + ' ' + (T.kind === 'balanced' ? t('mh.balanced') : t(T.kind === 'waste' ? 'mh.waste' : 'mh.borrow', { v: vol(Math.abs(T.end)) }))),
      res.spans.length ? el('div', { className: 'cv-table-wrap' }, el('table', { className: 'cv-table', 'data-mh-spans': '' },
        el('thead', {}, el('tr', {}, ...[t('mh.c.from'), t('mh.c.to'), t('mh.c.vol', { u: uo.vol }), t('mh.c.dir'), t('mh.c.haul', { u: U === 'm' ? 'm' : 'ft' })].map((h) => el('th', { scope: 'col' }, h)))),
        el('tbody', {}, ...res.spans.map((s) => el('tr', {}, el('td', {}, station(s.from)), el('td', {}, station(s.to)), el('td', { className: 'num' }, fixed(s.volume / uo.volPer, 1)), el('td', {}, t('mh.dir.' + s.dir)), el('td', { className: 'num' }, fixed(s.haul, 0))))))) : el('p', { className: 'cv-note' }, t('mh.nospans')),
      el('p', { className: 'cv-note' }, res.balance.length ? t('mh.balance', { list: res.balance.map(station).join(', ') }) : t('mh.nobalance')));
  }
  fac.addEventListener('input', update);
  csv.onclick = () => { if (!res) return; ctx.download('﻿' + massHaulCsv(res, { units: U, station }), t('mh.file', { stem: ctx.fileStem(), name: a.name }), 'text/csv'); ctx.say(t('mh.saved')); };
  const dlg = el('dialog', { className: 'cv-dialog cv-pcdlg', 'aria-labelledby': id + '-h', 'data-mh-dialog': '' },
    el('div', { className: 'cv-dlg' },
      el('div', { className: 'cv-dlg-head' }, el('h2', { className: 'cv-h', id: id + '-h' }, t('mh.title', { name: a.name })), close),
      el('div', { className: 'cv-dlg-body' },
        el('div', { className: 'cv-row' }, el('label', { for: fac.id }, t('mh.factor')), fac, el('span', { className: 'cv-unit' }, '%')),
        el('p', { className: 'cv-note' }, t('mh.factor.note')),
        cv, facts),
      el('div', { className: 'cv-dlg-foot' }, el('button', { type: 'button', className: 'btn-line btn-sm-cc', onclick: () => dlg.close() }, t('pc.dlg.cancel')), csv)));
  close.onclick = () => dlg.close();
  dlg.addEventListener('close', () => dlg.remove());
  ctx.root.append(dlg);
  dlg.showModal();
  update();
  fac.focus();
}

/** Stations across, the mass ordinate up (cu yd / cu m); above zero (cut moving up station) shaded orange, below green;
 *  balance points ticked on the zero line; station and volume labels. Colours from the page tokens. */
export function drawMassHaul(cv, res, { units = 'ft', station = String } = {}) {
  const dpr = globalThis.devicePixelRatio || 1, w = cv.clientWidth || 640, h = cv.clientHeight || 260;
  cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
  const c = cv.getContext('2d');
  c.setTransform(dpr, 0, 0, dpr, 0, 0);
  const cs = getComputedStyle(document.documentElement), tok = (n, d) => cs.getPropertyValue(n).trim() || d;
  const C = { bg: tok('--sheet-2', '#fff'), ink: tok('--ink', '#17202b'), grid: tok('--grid', '#d5dde5'), cut: tok('--layer-orange', '#a84a00'), fill: tok('--layer-green', '#17703a'), line: tok('--action', '#1e48c8') };
  c.fillStyle = C.bg; c.fillRect(0, 0, w, h);
  const P = res.points, uo = unitOf(units);
  if (P.length < 2) return;
  const s0 = P[0].sta, s1 = P.at(-1).sta;
  let lo = Math.min(0, ...P.map((p) => p.m)), hi = Math.max(0, ...P.map((p) => p.m));
  if (hi - lo < 1e-9) { hi += 1; lo -= 1; }
  const pad = { l: 64, r: 12, t: 12, b: 26 };
  const X = (s) => pad.l + ((s - s0) / Math.max(1e-9, s1 - s0)) * (w - pad.l - pad.r), Y = (m) => pad.t + ((hi - m) / (hi - lo)) * (h - pad.t - pad.b);
  c.font = '11px system-ui, sans-serif'; c.lineWidth = 1;
  // volume grid and labels
  const span = (hi - lo) / uo.volPer, raw = span / 4, mag = 10 ** Math.floor(Math.log10(raw)), step = [1, 2, 5, 10].map((k) => k * mag).find((v) => v >= raw) * uo.volPer;
  c.textAlign = 'right'; c.textBaseline = 'middle';
  for (let v = Math.ceil(lo / step) * step; v <= hi + 1e-9; v += step) {
    c.strokeStyle = Math.abs(v) < 1e-9 ? C.ink : C.grid; c.beginPath(); c.moveTo(pad.l, Y(v)); c.lineTo(w - pad.r, Y(v)); c.stroke();
    c.fillStyle = C.ink; c.fillText(fixed(v / uo.volPer, 0), pad.l - 4, Y(v));
  }
  // shaded areas, then the line
  for (let i = 1; i < P.length; i++) {
    const a = P[i - 1], b = P[i];
    const pieces = (a.m >= 0) === (b.m >= 0) ? [[a, b]] : (() => { const sx = a.sta + ((b.sta - a.sta) * a.m) / (a.m - b.m), z = { sta: sx, m: 0 }; return [[a, z], [z, b]]; })();
    for (const [p, q] of pieces) {
      c.fillStyle = (p.m + q.m) / 2 >= 0 ? C.cut : C.fill; c.globalAlpha = 0.22;
      c.beginPath(); c.moveTo(X(p.sta), Y(0)); c.lineTo(X(p.sta), Y(p.m)); c.lineTo(X(q.sta), Y(q.m)); c.lineTo(X(q.sta), Y(0)); c.closePath(); c.fill(); c.globalAlpha = 1;
    }
  }
  c.strokeStyle = C.line; c.lineWidth = 2; c.beginPath(); P.forEach((p, i) => (i ? c.lineTo(X(p.sta), Y(p.m)) : c.moveTo(X(p.sta), Y(p.m)))); c.stroke();
  // balance points
  c.strokeStyle = C.ink; c.lineWidth = 1.5;
  for (const s of res.balance) { c.beginPath(); c.moveTo(X(s), Y(0) - 6); c.lineTo(X(s), Y(0) + 6); c.stroke(); }
  c.fillStyle = C.ink; c.textBaseline = 'top';
  c.textAlign = 'left'; c.fillText(station(s0), pad.l, h - pad.b + 6);
  c.textAlign = 'right'; c.fillText(station(s1), w - pad.r, h - pad.b + 6);
  c.textAlign = 'center'; for (const s of res.balance) c.fillText(station(s), X(s), h - pad.b + 6);
}
