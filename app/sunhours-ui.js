/* SPDX-License-Identifier: Apache-2.0 */
/**
 * sunhours-ui.js — the Sun hours section (0.7 LC.1 M4): a date (or a season), the time zone the person picks, Run, the hours of
 * direct sun on every wall of every mass and on the ground round them (a raster drawn on the plan), the walls' table, CSV.
 * The numbers are sunhours.js's (bin/test-civilcraft-massing.mjs); the work runs in sunhours-worker.js.
 *
 * It refuses a project with no coordinate system (the sun's place comes from the site's latitude and longitude, and a typed pair
 * would be a guess), and says so in words. Nothing is saved in the project: the result is for looking at, and Run makes it again.
 *
 *   createSunHours(ctx) → { block(), overlay(c2d, S, C), result() }
 *   ctx = { el, project: () => Project, units, say, redraw(), masses() → [{ mass, z0, zBottom }], terrain(bounds, cell) → raster | null,
 *           download(name, blob), refresh() }
 */

import { t } from './i18n.js';
import { fixed } from './units.js';
import { utcOffsetFor, facadeSummary, facadeCsv, groundCsv } from './sunhours.js';
import { runSunHours } from './sunhours-run.js';

const STORE = 'civilcraft.sunhours';
const load = () => { try { const v = JSON.parse(localStorage.getItem(STORE) || 'null'); return v && typeof v === 'object' ? v : {}; } catch { return {}; } };
const keep = (v) => { try { localStorage.setItem(STORE, JSON.stringify(v)); } catch { /* storage blocked: this visit only */ } };

const addDays = (d, n) => { const x = new Date(d + 'T00:00:00Z'); x.setUTCDate(x.getUTCDate() + n); return x.toISOString().slice(0, 10); };

export function createSunHours(ctx) {
  const { el } = ctx;
  const P = () => ctx.project();
  const saved = load();
  const browserZone = (() => { try { return Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch { return ''; } })();
  const form = { date: '', zone: saved.zone || browserZone || '', season: !!saved.season, to: '', every: Number(saved.every) > 0 ? Number(saved.every) : 10, step: [5, 10, 15, 30].includes(saved.step) ? saved.step : 15, show: true };
  let last = null, running = null, status = '', cancel = null;

  /** Latitude and longitude of the masses from the project's coordinate system, or null when it has none. */
  async function siteLatLon(masses) {
    const crs = P().state.crs;
    if (!crs) return { problem: 'crs' };
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const m of masses) for (const p of m.mass.pts) { x0 = Math.min(x0, p.x); y0 = Math.min(y0, p.y); x1 = Math.max(x1, p.x); y1 = Math.max(y1, p.y); }
    try {
      const { transformer } = await import('./crs.js');
      const [lo, la] = transformer(crs, null)((x0 + x1) / 2, (y0 + y1) / 2);
      return Number.isFinite(la) && Number.isFinite(lo) && Math.abs(la) <= 90 && Math.abs(lo) <= 180 ? { lat: la, lon: lo, bounds: { x0, y0, x1, y1 } } : { problem: 'place' };
    } catch { return { problem: 'place' }; }
  }

  async function run() {
    if (running) return;
    const ms = ctx.masses();
    if (!ms.length) { status = t('sh.nomass'); ctx.refresh(); return; }
    const ll = await siteLatLon(ms);
    if (ll.problem === 'crs') { status = t('sh.need.crs'); ctx.refresh(); return; }
    if (ll.problem) { status = t('sh.need.place'); ctx.refresh(); return; }
    const first = form.date || defaultDate(ll.lat);
    const last_ = form.season ? (form.to || addDays(first, 90)) : first;
    if (!(first <= last_)) { status = t('sh.badrange'); ctx.refresh(); return; }
    const days = [];
    for (let d = first; d <= last_ && days.length < 400; d = addDays(d, form.season ? form.every : 1000)) {
      const off = utcOffsetFor(d, form.zone);
      if (off === null) { status = t('sh.badzone', { zone: form.zone || '—' }); ctx.refresh(); return; }
      days.push({ date: d, utcOffset: off });
    }
    keep({ zone: form.zone, season: form.season, every: form.every, step: form.step });
    const hmax = Math.max(...ms.map((m) => m.z0 + m.mass.floors * m.mass.floorHeight - m.zBottom));
    const margin = Math.max(hmax * 1.5, 10), reach = Math.min(hmax * 8, 600);
    const b = ll.bounds, cell = Math.max((b.x1 - b.x0 + b.y1 - b.y0 + 4 * margin) / 120, ctx.units() === 'm' ? 0.5 : 1);
    const terrain = ctx.terrain({ minX: b.x0 - margin - reach, minY: b.y0 - margin - reach, maxX: b.x1 + margin + reach, maxY: b.y1 + margin + reach }, Math.max(cell, reach / 120));
    const input = { masses: ms.map((m) => ({ id: m.mass.id, name: m.mass.name, pts: m.mass.pts, z0: m.z0, zBottom: m.zBottom, floors: m.mass.floors, floorHeight: m.mass.floorHeight })),
      terrain, lat: ll.lat, lon: ll.lon, days, stepMin: form.step, cell, margin };
    const ac = new AbortController();
    cancel = () => ac.abort();
    status = t('sh.running', { n: days.length });
    running = true; ctx.refresh();
    try {
      const result = await runSunHours(input, { signal: ac.signal, onProgress: (f) => { status = t('sh.progress', { pct: Math.round(f * 100) }); } });
      last = { result, days, lat: ll.lat, lon: ll.lon, zone: form.zone, first, to: last_, season: form.season, units: ctx.units() };
      status = t('sh.done', { n: days.length, h: fixed(result.daylight, 1) });
    } catch (err) {
      status = err?.code === 'cancelled' ? t('sh.cancelled') : t('sh.failed', { why: String(err?.message || err) });
    }
    running = false; cancel = null;
    ctx.refresh(); ctx.redraw();
  }
  const defaultDate = (lat) => { const y = new Date().getFullYear(); return lat < 0 ? y + '-06-21' : y + '-12-21'; };   // the day the sun is lowest

  function block() {
    const ms = ctx.masses();
    const out = [el('h3', { className: 'cv-h3', 'data-sh-head': '' }, t('sh.head')), el('p', { className: 'cv-note' }, t('sh.note'))];
    if (!ms.length) { out.push(el('p', { className: 'cv-note' }, t('sh.nomass'))); return out; }
    const date = el('input', { type: 'date', className: 'cv-input', id: 'cv-sh-date', 'data-sh-date': '', value: form.date || defaultDate(0), style: 'width:11rem' });
    date.addEventListener('change', () => { form.date = date.value; });
    const zone = el('input', { type: 'text', className: 'cv-input', id: 'cv-sh-zone', 'data-sh-zone': '', value: form.zone, maxLength: 60, placeholder: t('sh.zone.ph'), style: 'width:14rem' });
    zone.addEventListener('change', () => { form.zone = zone.value.trim(); ctx.refresh(); });
    const off = utcOffsetFor(form.date || defaultDate(0), form.zone);
    const season = el('input', { type: 'checkbox', id: 'cv-sh-season', 'data-sh-season': '', checked: form.season });
    season.addEventListener('change', () => { form.season = season.checked; ctx.refresh(); });
    const to = el('input', { type: 'date', className: 'cv-input', id: 'cv-sh-to', 'data-sh-to': '', value: form.to || addDays(form.date || defaultDate(0), 90), style: 'width:11rem' });
    to.addEventListener('change', () => { form.to = to.value; });
    const every = el('input', { type: 'text', className: 'cv-input', id: 'cv-sh-every', 'data-sh-every': '', value: String(form.every), inputMode: 'numeric', style: 'width:4rem' });
    every.addEventListener('change', () => { const n = Math.round(Number(every.value)); if (n >= 1 && n <= 90) form.every = n; every.value = String(form.every); });
    const step = el('select', { className: 'cv-select', id: 'cv-sh-step', 'data-sh-step': '' }, ...[5, 10, 15, 30].map((s) => el('option', { value: String(s) }, t('sh.step.opt', { n: s }))));
    step.value = String(form.step);
    step.addEventListener('change', () => { form.step = Number(step.value); });
    const go = el('button', { type: 'button', className: 'btn-plot btn-sm-cc', 'data-sh-run': '', onclick: () => run() }, el('i', { className: 'bi bi-sun', 'aria-hidden': 'true' }), ' ', t('sh.run'));
    if (running) go.disabled = true;
    const rows = [
      ...ctx.row(t('sh.date'), date, 'cv-sh-date'),
      ...ctx.row(t('sh.zone'), zone, 'cv-sh-zone'),
      ...ctx.row(t('sh.season'), season, 'cv-sh-season')];
    if (form.season) rows.push(...ctx.row(t('sh.to'), to, 'cv-sh-to'), ...ctx.row(t('sh.every'), every, 'cv-sh-every'));
    rows.push(...ctx.row(t('sh.step'), step, 'cv-sh-step'));
    out.push(el('div', { className: 'cv-props', 'data-sh-props': '' }, ...rows),
      el('p', { className: 'cv-note', 'data-sh-zone-note': '' }, off === null ? t('sh.zone.bad') : t('sh.zone.is', { off: (off >= 0 ? '+' : '−') + Math.abs(off) }) + ' ' + t('sh.dst')),
      el('div', { className: 'cv-actions' }, go, ...(running ? [el('button', { type: 'button', className: 'btn-line btn-sm-cc', onclick: () => cancel?.() }, t('sh.cancel'))] : [])));
    if (status) out.push(el('p', { className: 'cv-note', role: 'status', 'data-sh-status': '' }, status));
    if (last) out.push(...results());
    return out;
  }

  function results() {
    const r = last.result, out = [];
    const sums = facadeSummary(r);
    out.push(el('div', { className: 'cv-table-wrap' }, el('table', { className: 'cv-table', 'data-sh-table': '' },
      el('thead', {}, el('tr', {}, ...[t('sh.t.mass'), t('sh.t.worst'), t('sh.t.mean'), t('sh.t.best')].map((h) => el('th', { scope: 'col' }, h)))),
      el('tbody', {}, ...sums.map((s) => el('tr', { 'data-sh-mass': s.mass }, el('th', { scope: 'row' }, s.name), el('td', {}, fixed(s.min, 1)), el('td', {}, fixed(s.mean, 1)), el('td', {}, fixed(s.max, 1))))))));
    out.push(el('p', { className: 'cv-note' }, last.season ? t('sh.res.season', { a: last.first, b: last.to, n: last.days.length, h: fixed(r.daylight, 1) }) : t('sh.res.day', { date: last.first, h: fixed(r.daylight, 1) })));
    // each wall: which way it faces, and its hours floor by floor
    out.push(el('div', { className: 'cv-table-wrap' }, el('table', { className: 'cv-table', 'data-sh-walls': '' },
      el('thead', {}, el('tr', {}, ...[t('sh.t.wall'), t('sh.t.facing'), t('sh.t.floors')].map((h) => el('th', { scope: 'col' }, h)))),
      el('tbody', {}, ...r.facades.map((f) => el('tr', {}, el('th', { scope: 'row' }, f.name + ' ' + (f.edge + 1)), el('td', {}, compass(f.normal)), el('td', {}, f.floors.map((h) => fixed(h, 1)).join(' / '))))))));
    const show = el('input', { type: 'checkbox', id: 'cv-sh-show', 'data-sh-show': '', checked: form.show });
    show.addEventListener('change', () => { form.show = show.checked; ctx.redraw(); });
    out.push(el('div', { className: 'cv-row' }, el('label', { for: 'cv-sh-show' }, t('sh.show')), show));
    out.push(el('div', { className: 'cv-actions' },
      el('button', { type: 'button', className: 'btn-line btn-sm-cc', 'data-sh-csv-walls': '', onclick: () => ctx.download('sun-hours-walls.csv', new Blob([facadeCsv(r)], { type: 'text/csv' })) }, t('sh.csv.walls')),
      el('button', { type: 'button', className: 'btn-line btn-sm-cc', 'data-sh-csv-ground': '', onclick: () => ctx.download('sun-hours-ground.csv', new Blob([groundCsv(r)], { type: 'text/csv' })) }, t('sh.csv.ground'))));
    return out;
  }

  /** Compass word for a wall's outward direction (radians, 0 = east, counter-clockwise). */
  function compass(a) {
    const deg = (((90 - (a * 180) / Math.PI) % 360) + 360) % 360;
    return t('sh.dir.' + ['n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw'][Math.round(deg / 45) % 8]) + ' ' + Math.round(deg) + '°';
  }

  /** The ground raster on the plan, from dark (no sun) to yellow (the most any cell gets), with a key. */
  function overlay(c2d, S, C) {
    if (!last || !form.show || last.units !== ctx.units()) return;
    const g = last.result.ground, a = S(g.x0, g.y0), b = S(g.x0 + g.cell, g.y0 + g.cell);
    const w = Math.abs(b.x - a.x), h = Math.abs(b.y - a.y), max = Math.max(g.max, 0.01);
    c2d.save();
    c2d.globalAlpha = 0.6;
    for (let j = 0; j < g.ny; j++) for (let i = 0; i < g.nx; i++) {
      const v = g.hours[j * g.nx + i];
      if (v < 0) continue;
      const u = Math.min(1, v / max);
      c2d.fillStyle = 'hsl(' + Math.round(230 - 175 * u) + ',70%,' + Math.round(30 + 35 * u) + '%)';
      c2d.fillRect(a.x + i * (b.x - a.x), a.y + j * (b.y - a.y) - (b.y < a.y ? h : 0), w + 0.5, h + 0.5);
    }
    c2d.globalAlpha = 1;
    c2d.font = '12px sans-serif'; c2d.fillStyle = C.ink || '#000'; c2d.textBaseline = 'top';
    c2d.fillText(t('sh.key', { max: fixed(max, 1) }), 12, 12);
    c2d.restore();
  }

  return { block, overlay, result: () => last, run, form };
}
