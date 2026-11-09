/* SPDX-License-Identifier: Apache-2.0 */
/**
 * envir-mount.js — the Environment section (0.9 SU.1119): a thin adapter between CivilCraft's masses and the shared cc-envir library
 * (lib/envir, copied into ./envir/ by tools/envir/sync.mjs). It reads the masses, the project's place and a weather file the person
 * picks, calls the library, and draws what comes back: a shade study (sun and shade hours map, a shaded-area table, an animation of the
 * day), solar yield on every roof and wall, outdoor comfort (UTCI) beside a mass, and a pedestrian-wind screening (lattice-Boltzmann LES in ./wind/, always labelled
 * with its validation state). No analysis lives here (rule 39).
 *
 *   createEnvir(ctx) → { block() }       ctx = { el, project, units, row, refresh, redraw, download, masses() → [{ mass, z0, zBottom }] }
 *   Mount (one line in massing-ui.js, next to the sun hours block):  out.push(...envirUi.block());
 *   with   const envirUi = createEnvir({ el, project: ctx.project, units: ctx.units, row: ctx.row, refresh: () => ctx.refresh(), redraw: () => ctx.redraw(), download: (n, b) => ctx.download(n, b), masses: <the same list sunUi gets> });
 *   and    import { createEnvir } from './envir-mount.js';
 * Nothing is saved in the project. The weather file stays in memory for the visit.
 */
import { t } from './i18n.js';
import { fixed } from './units.js';
import { parseEpw } from './envir/epw.js';
import { utcOffsetFor } from './envir/solar.js';
import { shadeStudy, renderHours, renderFrame, contactSheet, hoursCsv } from './envir/shade.js';
import { pvForMasses, comfortAtPoints } from './envir/site.js';
import { encodePng } from './envir/png.js';
import { say } from './envir/strings.js';
import { windStudy, VALIDATION as WIND_VALID } from './wind/study.js';
import { LAWSON } from './wind/comfort.js';
import { ROUGHNESS } from './wind/abl.js';
import { EN as WEN } from './wind/strings.js';

const addDays = (d, n) => { const x = new Date(d + 'T00:00:00Z'); x.setUTCDate(x.getUTCDate() + n); return x.toISOString().slice(0, 10); };
const tick = () => new Promise((r) => setTimeout(r, 0));

export function createEnvir(ctx) {
  const { el } = ctx;
  const s = (k, v) => say(t, k, v);
  const P = () => ctx.project();
  const form = { date: '', zone: (() => { try { return Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch { return ''; } })(), season: false, to: '', every: 10, step: 15, eff: 20, roof: 60, wall: 40, loss: 14 };
  let epw = null, epwName = '', status = {}, shade = null, pv = null, ux = null, timer = null, frameAt = 0, wind = null, windStop = false, windBusy = false;
  const toM = () => (ctx.units() === 'm' ? 1 : 1200 / 3937);   // plan units → metres (US survey foot for the ft projects)

  /** Masses as the library wants them, in metres. */
  function blockers() {
    const k = toM();
    return ctx.masses().map((m) => ({ id: m.mass.id, name: m.mass.name, pts: m.mass.pts.map((p) => ({ x: p.x * k, y: p.y * k })), z0: m.z0 * k, height: Math.max(0.1, (m.z0 + m.mass.floors * m.mass.floorHeight - m.zBottom) * k) }));
  }

  async function place(bl) {
    const crs = P().state.crs;
    if (crs) {
      try {
        let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
        for (const m of ctx.masses()) for (const p of m.mass.pts) { x0 = Math.min(x0, p.x); y0 = Math.min(y0, p.y); x1 = Math.max(x1, p.x); y1 = Math.max(y1, p.y); }
        const { transformer } = await import('./crs.js');
        const [lo, la] = transformer(crs, null)((x0 + x1) / 2, (y0 + y1) / 2);
        if (Number.isFinite(la) && Number.isFinite(lo) && Math.abs(la) <= 90 && Math.abs(lo) <= 180) return { lat: la, lon: lo };
      } catch { /* fall through to the weather file's place */ }
    }
    return epw ? { lat: epw.location.lat, lon: epw.location.lon } : null;
  }

  async function loadFile(file) {
    try {
      const text = await file.text();
      epw = parseEpw(text); epwName = file.name; status.epw = '';
      pv = null; ux = null;
    } catch (err) { epw = null; status.epw = s('env.epw.bad', { why: String(err?.message || err) }); }
    ctx.refresh();
  }

  async function runShade() {
    const bl = blockers();
    if (!bl.length) { status.shade = s('env.nomass'); return ctx.refresh(); }
    const pl = await place(bl);
    if (!pl) { status.shade = s('env.need.place'); return ctx.refresh(); }
    const first = form.date || (pl.lat < 0 ? new Date().getFullYear() + '-06-21' : new Date().getFullYear() + '-12-21'), last = form.season ? (form.to || addDays(first, 90)) : first;
    const days = [];
    for (let d = first; d <= last && days.length < 200; d = addDays(d, form.season ? Math.max(1, form.every) : 1000)) {
      const off = utcOffsetFor(d, form.zone || (epw ? epw.location.tz : 0));
      if (off === null) { status.shade = s('env.failed', { why: form.zone }); return ctx.refresh(); }
      days.push({ date: d, utcOffset: off });
    }
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity, hmax = 0;
    for (const b of bl) { hmax = Math.max(hmax, b.height); for (const p of b.pts) { x0 = Math.min(x0, p.x); y0 = Math.min(y0, p.y); x1 = Math.max(x1, p.x); y1 = Math.max(y1, p.y); } }
    const margin = Math.max(hmax * 2, 15), cell = Math.max((x1 - x0 + y1 - y0 + 4 * margin) / 120, 0.5);
    status.shade = s('env.running'); ctx.refresh(); await tick();
    try {
      const r = shadeStudy({ blockers: bl, area: { minX: x0 - margin, minY: y0 - margin, maxX: x1 + margin, maxY: y1 + margin, cell, z: Math.min(...bl.map((b) => b.z0)) }, lat: pl.lat, lon: pl.lon, days, stepMin: form.step, frames: { day: 0, every: Math.max(1, Math.round(60 / form.step)) } });
      shade = { r, first, last, days: days.length }; frameAt = 0;
      status.shade = s('env.shade.done', { n: days.length, h: fixed(r.daylight, 1) });
    } catch (err) { status.shade = s('env.failed', { why: String(err?.message || err) }); }
    ctx.refresh();
  }

  async function runPv() {
    if (!epw) { status.pv = s('env.pv.need'); return ctx.refresh(); }
    const bl = blockers();
    if (!bl.length) { status.pv = s('env.nomass'); return ctx.refresh(); }
    status.pv = s('env.running'); ctx.refresh(); await tick();
    try {
      pv = pvForMasses({ epw, masses: bl, efficiency: form.eff / 100, roofCoverage: form.roof / 100, wallCoverage: form.wall / 100, losses: form.loss / 100 });
      status.pv = s('env.pv.done', { n: pv.length });
    } catch (err) { status.pv = s('env.failed', { why: String(err?.message || err) }); }
    ctx.refresh();
  }

  async function runUx() {
    if (!epw) { status.ux = s('env.ux.need'); return ctx.refresh(); }
    const bl = blockers();
    if (!bl.length) { status.ux = s('env.nomass'); return ctx.refresh(); }
    status.ux = s('env.running'); ctx.refresh(); await tick();
    try {
      const m = bl[0], cx = m.pts.reduce((a, p) => a + p.x, 0) / m.pts.length, cy = m.pts.reduce((a, p) => a + p.y, 0) / m.pts.length;
      let rx = 0, ry = 0; for (const p of m.pts) { rx = Math.max(rx, Math.abs(p.x - cx)); ry = Math.max(ry, Math.abs(p.y - cy)); }
      const far = Math.max(rx, ry, 10) * 40, d = 3;   // 3 m off the wall's bounding box
      const pts = [{ key: 'open', x: cx + far, y: cy + far }, { key: 's', x: cx, y: cy - ry - d }, { key: 'n', x: cx, y: cy + ry + d }, { key: 'e', x: cx + rx + d, y: cy }, { key: 'w', x: cx - rx - d, y: cy }];
      const out = comfortAtPoints({ epw, masses: bl, points: pts, z: m.z0 });
      ux = { name: m.name, rows: out.map((o, i) => ({ key: pts[i].key, ...o })) };
      status.ux = s('env.ux.done', { name: m.name });
    } catch (err) { status.ux = s('env.failed', { why: String(err?.message || err) }); }
    ctx.refresh();
  }

  // ---- wind (lib/wind, lattice-Boltzmann LES): a screening reading, always labelled with its validation state
  const sw = (k, v = {}) => { let r = typeof t === 'function' ? t(k, v) : k; if (r === k || r == null) r = WEN[k] ?? s(k, v); return String(r).replace(/\{(\w+)\}/g, (_, n) => (v[n] === undefined ? '{' + n + '}' : String(v[n]))); };
  const engines = () => globalThis.ccEnvirWindEngines || {};   // add-ons register here (wind-openfoam); the Apache core never imports them
  const engineOf = () => (wf.engine !== 'builtin' ? engines()[wf.engine] : null);
  const activeValidation = () => engineOf()?.validation || WIND_VALID;
  const wf = { engine: 'builtin', experimental: false, sectors: 8, terrain: 'suburb', quality: 'screening', gust: 1.5 };
  const TERRAIN = { open: ROUGHNESS.open, suburb: ROUGHNESS.suburban, city: ROUGHNESS.urban };
  const COLORS = [[76, 175, 80], [139, 195, 74], [255, 235, 59], [255, 152, 0], [211, 47, 47]];   // sitting .. uncomfortable
  async function runWind() {
    if (windBusy) return;
    if (!epw) { status.wind = sw('env.wind.need'); return ctx.refresh(); }
    const bl = blockers();
    if (!bl.length) { status.wind = s('env.nomass'); return ctx.refresh(); }
    let lastPaint = 0; windBusy = true; windStop = false; status.wind = sw('env.wind.running', { k: 1, n: wf.sectors, pct: 0 }); ctx.refresh(); await tick();
    try {
      const eng = engineOf(), run = eng ? (a) => eng.run(a) : windStudy;
      const r = await run({ masses: bl, epw, sectors: wf.sectors, z0Site: TERRAIN[wf.terrain], quality: wf.quality, gust: wf.gust, ...(ctx.windTest || {}),
        shouldStop: () => windStop, onProgress: (p, k) => { status.wind = sw('env.wind.running', { k: k + 1, n: wf.sectors, pct: Math.round(p * 100) }); const now = Date.now(); if (now - lastPaint > 2000) { lastPaint = now; ctx.refresh(); } } });
      if (r.stopped) status.wind = sw('env.wind.stopped');
      else { wind = r; status.wind = sw('env.wind.done', { n: r.results.filter(Boolean).length, cph: fixed(r.plan.cellsPerHeight, 1), cells: r.plan.cells }); }
    } catch (err) { status.wind = s('env.failed', { why: String(err?.message || err) }); }
    windBusy = false; ctx.refresh();
  }
  function gustInput() {
    const i = el('input', { type: 'text', className: 'cv-input', id: 'cv-env-wind-gust', 'data-env-wind-gust': '', value: String(wf.gust), inputMode: 'decimal', style: 'width:5rem' });
    i.addEventListener('change', () => { const n = Number(i.value); if (Number.isFinite(n) && n >= 1 && n <= 3) wf.gust = n; i.value = String(wf.gust); });
    return i;
  }
  function windImage() {
    const m = wind.map, rgba = new Uint8ClampedArray(m.w * m.h * 4);
    for (let j = 0; j < m.h; j++) for (let i = 0; i < m.w; i++) {
      const c = m.lawson[i + m.w * (m.h - 1 - j)], o = 4 * (i + m.w * j), col = c >= 0 ? COLORS[c] : [150, 150, 150];
      rgba[o] = col[0]; rgba[o + 1] = col[1]; rgba[o + 2] = col[2]; rgba[o + 3] = c === -2 ? 60 : 255;
    }
    return { w: m.w, h: m.h, rgba };
  }
  function windBlock() {
    const sel = (key, opts, attr) => { const e = el('select', { className: 'cv-select', [attr]: '' }, ...opts.map(([v, l]) => el('option', { value: String(v) }, l))); e.value = String(wf[key]); e.addEventListener('change', () => { wf[key] = typeof wf[key] === 'number' ? Number(e.value) : e.value; }); return e; };
    const exp = el('input', { type: 'checkbox', id: 'cv-env-wind-exp', 'data-env-wind-exp': '', checked: wf.experimental });
    exp.addEventListener('change', () => { wf.experimental = exp.checked; ctx.refresh(); });
    if (wf.engine !== 'builtin' && !engines()[wf.engine]) wf.engine = 'builtin';
    const eng = engineOf(), ids = Object.keys(engines());
    const engSel = el('select', { className: 'cv-select', 'data-env-wind-engine': '' }, el('option', { value: 'builtin' }, sw('env.wind.engine.builtin')), ...ids.map((id) => el('option', { value: id }, engines()[id].label || id)));
    engSel.value = wf.engine; engSel.addEventListener('change', () => { wf.engine = engSel.value; ctx.refresh(); });
    const head = [el('h4', { className: 'cv-h3' }, sw('env.wind.head')), el('p', { className: 'cv-note', role: 'alert', 'data-env-wind': '' }, sw('env.wind.valid', { why: activeValidation().label }) + ' ' + (eng ? (eng.note || '') : sw('env.wind.note'))),
      ...ctx.row(sw('env.wind.engine'), engSel, 'cv-env-wind-engine'), ...(ids.length ? [] : [el('p', { className: 'cv-note', 'data-env-wind-noengine': '' }, sw('env.wind.engine.none'))])];
    if (eng) {
      for (const fld of eng.fields || []) { const i = el('input', { type: 'text', className: 'cv-input', 'data-env-wind-field': fld.key, value: eng.get(fld.key) || '', style: 'width:16rem', autocomplete: 'off' }); i.addEventListener('change', () => eng.set(fld.key, i.value.trim())); head.push(...ctx.row(fld.label, i, 'cv-env-wind-f-' + fld.key)); }
      if (eng.check) head.push(el('div', { className: 'cv-actions' }, btn(sw('env.wind.engine.check'), 'data-env-wind-check', async () => { status.windCheck = (await eng.check()).text; ctx.refresh(); })), ...(status.windCheck ? [el('p', { className: 'cv-note', role: 'status', 'data-env-wind-checked': '' }, status.windCheck)] : []));
    } else head.push(...ctx.row(sw('env.wind.exp'), exp, 'cv-env-wind-exp'));
    if (!eng && !wf.experimental) return head;
    const out = [...head,
      el('div', { className: 'cv-props' },
        ...ctx.row(sw('env.wind.sectors'), sel('sectors', [[4, '4'], [8, '8'], [12, '12'], [16, '16']], 'data-env-wind-sectors'), 'cv-env-wind-sectors'),
        ...ctx.row(sw('env.wind.terrain'), sel('terrain', [['open', sw('env.wind.open')], ['suburb', sw('env.wind.suburb')], ['city', sw('env.wind.city')]], 'data-env-wind-terrain'), 'cv-env-wind-terrain'),
        ...ctx.row(sw('env.wind.quality'), sel('quality', [['screening', sw('env.wind.q.screening')], ['standard', sw('env.wind.q.standard')]], 'data-env-wind-quality'), 'cv-env-wind-quality'),
        ...ctx.row(sw('env.wind.gust'), gustInput(), 'cv-env-wind-gust')),
      el('div', { className: 'cv-actions' }, btn(sw('env.wind.run'), 'data-env-wind-run', runWind, 'bi-wind'), ...(windBusy ? [btn(sw('env.wind.stop'), 'data-env-wind-stop', () => { windStop = true; })] : [])), ...say2('wind')];
    if (!wind) return out;
    const im = windImage(), cv = el('canvas', { 'data-env-wind-map': '', width: im.w, height: im.h, role: 'img', 'aria-label': sw('env.wind.t.class'), style: 'width:100%;max-width:26rem;image-rendering:pixelated;border:1px solid var(--cv-line,#999)' });
    const c2 = cv.getContext('2d'); if (c2) c2.putImageData(new ImageData(im.rgba, im.w, im.h), 0, 0);
    out.push(cv, el('p', { className: 'cv-note' }, sw('env.wind.legend')));
    if (wind.plan.cellsPerHeight < 10) out.push(el('p', { className: 'cv-note', role: 'alert', 'data-env-wind-coarse': '' }, sw('env.wind.coarse')));
    if (wind.drift > 0.05) out.push(el('p', { className: 'cv-note', role: 'alert' }, sw('env.wind.drift', { pct: fixed(wind.drift * 100, 0) })));
    const n = wind.counts.cells || 1, names = [...LAWSON.map((q) => q.id), 'uncomfortable'];
    out.push(table('data-env-wind-table', [sw('env.wind.t.class'), sw('env.wind.t.area')], names.map((id, i) => [sw('env.wind.' + id), fixed((100 * wind.counts.lawson[i]) / n, 0) + ' %'])));
    out.push(table('data-env-wind-nen', [sw('env.wind.t.nen'), sw('env.wind.t.area')], ['A', 'B', 'C', 'D', 'E'].map((g) => [g, fixed((100 * wind.counts.nen[g]) / n, 0) + ' %'])));
    out.push(el('p', { className: 'cv-note' }, sw('env.wind.lawson.note')), el('p', { className: 'cv-note' }, sw('env.wind.nen.note')), el('p', { className: 'cv-note' }, sw('env.wind.calm', { pct: fixed((100 * wind.rose.calm) / epw.hours.length, 1) })));
    const csv = () => { const m = wind.map, rows = ['x,y,lawson_class,nen_grade,speed_exceeded_5pct_mps,max_speed_ratio']; for (let j = 0; j < m.h; j++) for (let i = 0; i < m.w; i++) { const k = i + m.w * j, c = m.lawson[k]; if (c < 0) continue; rows.push([(m.gx0 + (i + 0.5) * m.cell).toFixed(2), (m.gy0 + (j + 0.5) * m.cell).toFixed(2), names[c], 'ABCDE'[m.nen[k]], m.q95[k].toFixed(2), m.ratioMax[k].toFixed(2)].join(',')); } rows.push('# ' + activeValidation().label); return rows.join('\n') + '\n'; };
    out.push(el('div', { className: 'cv-actions' }, btn(sw('env.wind.png'), 'data-env-wind-png', () => ctx.download('wind-comfort.png', new Blob([encodePng(im.w, im.h, im.rgba, 4)], { type: 'image/png' }))), btn(sw('env.wind.csv'), 'data-env-wind-csv', () => ctx.download('wind-comfort.csv', new Blob([csv()], { type: 'text/csv' })))));
    return out;
  }

  const num = (id, key, lo, hi, w = '5rem') => {
    const i = el('input', { type: 'text', className: 'cv-input', id, ['data-env-' + key]: '', value: String(form[key]), inputMode: 'decimal', style: 'width:' + w });
    i.addEventListener('change', () => { const n = Number(i.value); if (Number.isFinite(n) && n >= lo && n <= hi) form[key] = n; i.value = String(form[key]); });
    return i;
  };
  const btn = (label, attr, fn, icon) => el('button', { type: 'button', className: 'btn-line btn-sm-cc', [attr]: '', onclick: fn }, ...(icon ? [el('i', { className: 'bi ' + icon, 'aria-hidden': 'true' }), ' '] : []), label);
  const table = (attr, heads, rows) => el('div', { className: 'cv-table-wrap' }, el('table', { className: 'cv-table', [attr]: '' },
    el('thead', {}, el('tr', {}, ...heads.map((h) => el('th', { scope: 'col' }, h)))), el('tbody', {}, ...rows.map((r) => el('tr', {}, ...r.map((c, i) => el(i === 0 ? 'th' : 'td', i === 0 ? { scope: 'row' } : {}, c)))))));
  const say2 = (k) => (status[k] ? [el('p', { className: 'cv-note', role: 'status', 'data-env-status': k }, status[k])] : []);
  const compass = (az) => ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][Math.round(az / 45) % 8] + ' ' + Math.round(az) + '°';

  function epwBlock() {
    const file = el('input', { type: 'file', accept: '.epw,text/plain', id: 'cv-env-epw', 'data-env-epw': '', className: 'cv-input' });
    file.addEventListener('change', () => { if (file.files?.[0]) loadFile(file.files[0]); });
    return [...ctx.row(s('env.epw'), file, 'cv-env-epw'),
      el('p', { className: 'cv-note', 'data-env-epw-note': '' }, epw ? s('env.epw.loaded', { city: epw.location.city, country: epw.location.country, n: epw.n, lat: fixed(epw.location.lat, 2), lon: fixed(epw.location.lon, 2), tz: (epw.location.tz >= 0 ? '+' : '') + epw.location.tz }) : s('env.epw.none')),
      ...(status.epw ? [el('p', { className: 'cv-note', role: 'alert' }, status.epw)] : [])];
  }

  function shadeBlock() {
    const date = el('input', { type: 'date', className: 'cv-input', id: 'cv-env-date', 'data-env-date': '', value: form.date, style: 'width:11rem' });
    date.addEventListener('change', () => { form.date = date.value; });
    const zone = el('input', { type: 'text', className: 'cv-input', id: 'cv-env-zone', 'data-env-zone': '', value: form.zone, maxLength: 60, style: 'width:14rem' });
    zone.addEventListener('change', () => { form.zone = zone.value.trim(); });
    const season = el('input', { type: 'checkbox', id: 'cv-env-season', 'data-env-season': '', checked: form.season });
    season.addEventListener('change', () => { form.season = season.checked; ctx.refresh(); });
    const to = el('input', { type: 'date', className: 'cv-input', id: 'cv-env-to', value: form.to, style: 'width:11rem' });
    to.addEventListener('change', () => { form.to = to.value; });
    const step = el('select', { className: 'cv-select', id: 'cv-env-step', 'data-env-step': '' }, ...[5, 10, 15, 30, 60].map((n) => el('option', { value: String(n) }, String(n))));
    step.value = String(form.step); step.addEventListener('change', () => { form.step = Number(step.value); });
    const rows = [...ctx.row(s('env.date'), date, 'cv-env-date'), ...ctx.row(s('env.zone'), zone, 'cv-env-zone'), ...ctx.row(s('env.season'), season, 'cv-env-season')];
    if (form.season) rows.push(...ctx.row(s('env.to'), to, 'cv-env-to'), ...ctx.row(s('env.every'), num('cv-env-every', 'every', 1, 90, '4rem'), 'cv-env-every'));
    rows.push(...ctx.row(s('env.step'), step, 'cv-env-step'));
    const out = [el('h4', { className: 'cv-h3' }, s('env.shade.head')), el('div', { className: 'cv-props' }, ...rows), el('div', { className: 'cv-actions' }, btn(s('env.shade.run'), 'data-env-shade-run', runShade, 'bi-sun')), ...say2('shade')];
    if (shade) out.push(...shadeResults());
    return out;
  }

  function shadeResults() {
    const r = shade.r, out = [];
    const mapCanvas = el('canvas', { 'data-env-map': '', width: r.nx, height: r.ny, style: 'width:100%;max-width:26rem;image-rendering:pixelated;border:1px solid var(--cv-line,#999)', role: 'img', 'aria-label': s('env.shade.sun') });
    const draw = (im) => { const c = mapCanvas.getContext('2d'); if (c && im) c.putImageData(new ImageData(new Uint8ClampedArray(im.rgba), im.w, im.h), 0, 0); };
    const showHours = (kind) => draw(renderHours(r, { kind }));
    showHours('sun');
    const kind = el('select', { className: 'cv-select', 'data-env-kind': '' }, el('option', { value: 'sun' }, s('env.shade.sun')), el('option', { value: 'shade' }, s('env.shade.shade')));
    kind.addEventListener('change', () => { stop(); showHours(kind.value); });
    const label = el('span', { className: 'cv-note', 'data-env-frame-label': '' });
    const show = (k) => { frameAt = (k + r.frames.length) % r.frames.length; const f = r.frames[frameAt]; draw(renderFrame(r, f)); label.textContent = s('env.shade.frame') + ' ' + f.date + ' ' + String(Math.floor(f.min / 60)).padStart(2, '0') + ':' + String(Math.round(f.min % 60)).padStart(2, '0'); };
    const stop = () => { if (timer) { clearInterval(timer); timer = null; } play.textContent = s('env.shade.play'); };
    const play = btn(s('env.shade.play'), 'data-env-play', () => { if (timer) return stop(); play.textContent = s('env.shade.pause'); show(frameAt); timer = setInterval(() => show(frameAt + 1), 250); });
    const slider = el('input', { type: 'range', min: '0', max: String(Math.max(0, r.frames.length - 1)), value: '0', 'data-env-slider': '', 'aria-label': s('env.shade.frame') });
    slider.addEventListener('input', () => { stop(); show(Number(slider.value)); });
    out.push(el('div', {}, kind), mapCanvas);
    if (r.frames.length) out.push(el('div', { className: 'cv-actions' }, play, slider, label));
    const pick = r.series.filter((_, i) => i % Math.max(1, Math.round(r.series.length / 8)) === 0);
    out.push(el('p', { className: 'cv-note' }, s('env.shade.series')), table('data-env-series', [s('env.shade.time'), s('env.shade.pct'), s('env.shade.area') + ' (m²)'],
      pick.map((q) => [String(Math.floor(q.min / 60)).padStart(2, '0') + ':' + String(Math.round(q.min % 60)).padStart(2, '0'), fixed(q.shadedPct, 0) + ' %', fixed(q.shadedArea, 0)])));
    const png = (name, im, sc) => ctx.download(name, new Blob([encodePng(im.w, im.h, im.rgba, sc)], { type: 'image/png' }));
    out.push(el('div', { className: 'cv-actions' },
      btn(s('env.shade.png'), 'data-env-png', () => png('shade-hours.png', renderHours(r, { kind: kind.value }), 6)),
      btn(s('env.shade.frames'), 'data-env-frames', () => png('shade-frames.png', contactSheet(r, 4, 2), 3)),
      btn(s('env.shade.csv'), 'data-env-csv', () => ctx.download('shade-hours.csv', new Blob([hoursCsv(r)], { type: 'text/csv' })))));
    return out;
  }

  function pvBlock() {
    const out = [el('h4', { className: 'cv-h3' }, s('env.pv.head')), el('p', { className: 'cv-note' }, s('env.pv.model')),
      el('div', { className: 'cv-props' }, ...ctx.row(s('env.pv.eff'), num('cv-env-eff', 'eff', 5, 30), 'cv-env-eff'), ...ctx.row(s('env.pv.roof'), num('cv-env-roof', 'roof', 0, 100), 'cv-env-roof'), ...ctx.row(s('env.pv.wall'), num('cv-env-wall', 'wall', 0, 100), 'cv-env-wall'), ...ctx.row(s('env.pv.loss'), num('cv-env-loss', 'loss', 0, 60), 'cv-env-loss')),
      el('div', { className: 'cv-actions' }, btn(s('env.pv.run'), 'data-env-pv-run', runPv, 'bi-lightning-charge')), ...say2('pv')];
    if (!pv) return out;
    out.push(table('data-env-pv', [s('env.pv.t.mass'), s('env.pv.t.roof'), s('env.pv.t.walls'), s('env.pv.t.total')], pv.map((m) => [m.name, fixed(m.roofKWh, 0), fixed(m.wallKWh, 0), fixed(m.totalKWh, 0)])));
    const rows = [];
    for (const m of pv) for (const q of m.surfaces) rows.push([m.name + ' ' + (q.kind === 'roof' ? s('env.pv.surface.roof') : s('env.pv.surface.wall', { n: q.edge + 1 })), q.kind === 'roof' ? '—' : compass(q.azimuth), fixed(q.kWhPerM2, 0), fixed(q.shadeLossPct, 0) + ' %']);
    out.push(table('data-env-pv-surfaces', [s('env.pv.t.surface'), s('env.pv.t.facing'), s('env.pv.t.perm2'), s('env.pv.t.shade')], rows));
    const csv = ['mass,surface,facing_deg,area_m2,kwh_per_m2_panel,kwh_year_covered,shade_loss_pct'];
    for (const m of pv) for (const q of m.surfaces) csv.push([JSON.stringify(m.name), q.kind + (q.edge >= 0 ? ' ' + (q.edge + 1) : ''), q.kind === 'roof' ? '' : Math.round(q.azimuth), q.area.toFixed(1), q.kWhPerM2.toFixed(1), q.kWh.toFixed(0), q.shadeLossPct.toFixed(1)].join(','));
    out.push(el('div', { className: 'cv-actions' }, btn(s('env.pv.csv'), 'data-env-pv-csv', () => ctx.download('solar-yield.csv', new Blob([csv.join('\n') + '\n'], { type: 'text/csv' })))));
    return out;
  }

  function uxBlock() {
    const out = [el('h4', { className: 'cv-h3' }, s('env.ux.head')), el('p', { className: 'cv-note' }, s('env.ux.note')), el('div', { className: 'cv-actions' }, btn(s('env.ux.run'), 'data-env-ux-run', runUx, 'bi-thermometer-half')), ...say2('ux')];
    if (ux) out.push(table('data-env-ux', [s('env.ux.t.place'), s('env.ux.t.svf'), s('env.ux.t.mean'), s('env.ux.t.heat'), s('env.ux.t.cold')],
      ux.rows.map((r) => [s('env.ux.' + r.key), fixed(r.svf, 2), fixed(r.here.daytimeMean, 1), String(r.here.heatHours), String(r.here.coldHours)])));
    return out;
  }

  function block() {
    const head = [el('h3', { className: 'cv-h3', 'data-env-head': '' }, s('env.head')), el('p', { className: 'cv-note' }, s('env.note'))];
    if (!ctx.masses().length) return [...head, el('p', { className: 'cv-note' }, s('env.nomass'))];
    return [...head, ...epwBlock(), ...shadeBlock(), ...pvBlock(), ...uxBlock(), ...windBlock()];
  }
  return { block, form, state: () => ({ epw, shade, pv, ux, wind }), runShade, runPv, runUx, runWind, windForm: wf, windEngines: engines, loadFile };
}
