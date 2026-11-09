/* SPDX-License-Identifier: Apache-2.0 */
/**
 * panel.js — the shared "Climate future" block (0.9 EG.46): the scenario + year picker, and the flood, wildfire and heat parts, present beside
 * future. Builds its own DOM from `doc` (no app imports), so BimCraft and CivilCraft mount the same block with a few lines (rule 39).
 *
 *   createClimate({ doc, t, locale, key, show: ['flood','fire','heat'], cls, host, onChange }) → { el, render(), future() , state }
 *     key       localStorage key for this host's choices (try/catch; works without)
 *     show      which parts below the picker ([] = the picker only, for a host that runs its own check with future())
 *     cls       { input, select, btn, run, table, note, muted, h } class names of the host's look
 *     host      { latLon?() → { lat, lon } | null, flood?() → { level, depth, unit: 'm'|'ft', source } | null, download?(name, text),
 *                 useEpw?(text, name), epw?() → { text, name } | null }
 *     onChange  called when the scenario, year, place or pack changes
 *   future() → pack.futureAt(...) result, or null while "Present only" or with no pack
 */
import { readPack, futureAt, SCENARIOS, HORIZONS } from './pack.js';
import { packs, addPack, onPacks } from './registry.js';
import { raiseFlood } from './flood.js';
import { fireScreen, FUELS } from './fire.js';
import { morphEpw } from './morph.js';
import { heatSummary, compareHeat } from './heat.js';
import { say } from './strings.js';

const OWN = 'cc-climate:own';
const fmt = (v, d = 1) => (Number.isFinite(v) ? String(Math.round(v * 10 ** d) / 10 ** d) : '–');
const sgn = (v, d = 1) => (Number.isFinite(v) ? (v > 0 ? '+' : '') + fmt(v, d) : '–');
const numIn = (s) => { const n = Number(String(s ?? '').replace(',', '.')); return String(s ?? '').trim() === '' || !Number.isFinite(n) ? NaN : n; };

export function createClimate({ doc = document, t, locale = 'en', key = 'cc-climate', show = ['flood', 'fire', 'heat'], cls = {}, host = {}, onChange } = {}) {
  const C = { input: 'form-control form-control-sm', select: 'form-select form-select-sm', btn: 'btn-line btn-sm-cc', run: 'btn-plot btn-sm-cc', table: '', note: '', muted: '', h: '', ...cls };
  const s = (k, v) => say(t, k, v, locale);
  const el = (tag, attrs = {}, ...kids) => {
    const n = doc.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (v === undefined || v === null || v === false) continue;
      if (k === 'className') n.className = v; else if (k === 'on') for (const [e, f] of Object.entries(v)) n.addEventListener(e, f); else n.setAttribute(k, v === true ? '' : String(v));
    }
    n.append(...kids.flat().filter((x) => x !== null && x !== undefined && x !== false));
    return n;
  };
  let saved = {};
  try { saved = JSON.parse(globalThis.localStorage?.getItem(key) || '{}') || {}; } catch (e) { saved = {}; }
  const S = { scenario: saved.scenario || '', horizon: Number(saved.horizon) || 2050, pack: saved.pack || '', loc: saved.loc || '', err: '',
    fl: { level: '', depth: '', kind: 'coastal', freeboard: '', ...(saved.fl || {}) }, fi: { fuel: 'grass', slope: '0', dist: '30', ...(saved.fi || {}) },
    flOut: null, fiOut: null, he: null, epw: null, heSaid: '' };
  const keep = () => { try { globalThis.localStorage?.setItem(key, JSON.stringify({ scenario: S.scenario, horizon: S.horizon, pack: S.pack, loc: S.loc, fl: S.fl, fi: S.fi })); } catch (e) { /* private window */ } };
  try { const own = globalThis.localStorage?.getItem(OWN); if (own && !packs().some((p) => p.origin === 'file')) { const r = readPack(own); if (r.ok) addPack(r.pack, { origin: 'file' }); } } catch (e) { /* storage blocked */ }

  const root = el('div', { 'data-clim': '' });
  const current = () => { const all = packs(); return all.find((p) => p.id === S.pack) || all[0] || null; };
  function future() {
    const p = current();
    if (!p || !S.scenario) return null;
    const ll = host.latLon?.() || null;
    return futureAt(p.pack, { locationId: S.loc || undefined, lat: ll?.lat, lon: ll?.lon, scenario: S.scenario, horizon: S.horizon });
  }
  const changed = () => { keep(); S.flOut = null; S.fiOut = null; S.he = null; render(); try { onChange?.(); } catch (e) { /* host */ } };
  const label = (text, ctl) => el('label', { style: 'display:grid;gap:0.1rem;margin:0.2rem 0' }, el('span', {}, text), ctl);
  const select = (attr, value, options, fn) => { const n = el('select', { className: C.select, [attr]: '' }, ...options.map(([v, l]) => el('option', { value: v }, l))); n.value = String(value); n.addEventListener('change', () => fn(n.value)); return n; };
  const input = (attr, value, fn) => { const n = el('input', { className: C.input, [attr]: '', value: value ?? '' }); n.addEventListener('input', () => fn(n.value)); return n; };
  const futHead = () => s('clim.col.future', { scenario: s('clim.sc.' + S.scenario).replace(/ \(.*\)$/, ''), year: S.horizon });
  const table = (attr, head, rows) => el('div', { style: 'overflow-x:auto' }, el('table', { className: C.table, [attr]: '' }, el('thead', {}, el('tr', {}, ...head.map((h) => el('th', {}, h)))), el('tbody', {}, ...rows.map((r) => el('tr', {}, ...r.map((c) => el('td', {}, c)))))));

  function picker() {
    const all = packs(), kids = [el('p', { className: C.h }, el('strong', {}, s('clim.head'))), el('p', { className: C.muted }, s('clim.intro'))];
    const file = el('input', { type: 'file', accept: '.json', 'data-clim-packfile': '', 'aria-label': s('clim.load') });
    file.addEventListener('change', async () => {
      const f = file.files?.[0];
      if (!f) return;
      const text = await f.text(), r = readPack(text);
      if (!r.ok) { S.err = r.errors.slice(0, 3).join('; '); render(); return; }
      S.err = ''; addPack(r.pack, { origin: 'file' }); S.pack = r.pack.id;
      try { if (text.length < 2e6) globalThis.localStorage?.setItem(OWN, text); } catch (e) { /* too big for this browser */ }
      changed();
    });
    if (!all.length) { kids.push(el('p', { className: C.note, 'data-clim-nopack': '' }, s('clim.nopack')), label(s('clim.load'), file)); if (S.err) kids.push(el('p', { className: C.note, 'data-clim-error': '' }, s('clim.bad', { why: S.err }))); return kids; }
    kids.push(label(s('clim.scenario'), select('data-clim-scenario', S.scenario, [['', s('clim.sc.none')], ...SCENARIOS.map((x) => [x, s('clim.sc.' + x)])], (v) => { S.scenario = v; changed(); })));
    if (S.scenario) kids.push(label(s('clim.year'), select('data-clim-year', S.horizon, HORIZONS.map((y) => [String(y), s('clim.yr.' + y)]), (v) => { S.horizon = Number(v); changed(); })));
    if (all.length > 1) kids.push(label(s('clim.pack'), select('data-clim-pack', current()?.id || '', all.map((p) => [p.id, p.pack.name || p.id]), (v) => { S.pack = v; S.loc = ''; changed(); })));
    const p = current();
    if (S.scenario && p) {
      kids.push(label(s('clim.loc'), select('data-clim-loc', S.loc, [['', s('clim.loc.auto')], ...p.pack.locations.map((l) => [l.id, l.name || l.id])], (v) => { S.loc = v; changed(); })));
      const f = future(), ll = host.latLon?.();
      if (!f || !f.ok) kids.push(el('p', { className: C.note, 'data-clim-nodata': '' }, s('clim.nodata')));
      else if (f.global) kids.push(el('p', { className: C.note, 'data-clim-where': 'global' }, s(!S.loc && !ll ? 'clim.loc.nosite' : 'clim.loc.global')));
      else kids.push(el('p', { 'data-clim-where': f.loc.id }, f.distanceKm !== null ? s('clim.loc.using', { name: f.loc.name, km: fmt(f.distanceKm, 0) }) : s('clim.loc.picked', { name: f.loc.name })));
      kids.push(el('p', { className: C.muted, 'data-clim-source': '' }, s('clim.source', { name: p.pack.source.name, license: p.pack.source.license, date: p.pack.source.retrieved || '?' })));
      if (p.pack.sample) kids.push(el('p', { className: C.note, 'data-clim-sample': '' }, el('strong', {}, s('clim.sample'))));
    }
    kids.push(el('details', {}, el('summary', {}, s('clim.load')), file));
    if (S.err) kids.push(el('p', { className: C.note, 'data-clim-error': '' }, s('clim.bad', { why: S.err })));
    return kids;
  }

  function floodPart(f) {
    const from = host.flood?.() || null, unit = from?.unit || 'm', perM = unit === 'ft' ? 3.28084 : 1;
    if (from && S.fl.level === '' && Number.isFinite(from.level)) S.fl.level = String(from.level);
    const kids = [el('p', { className: C.h }, el('strong', {}, s('clim.fl.head')))];
    kids.push(label(s('clim.fl.level', { unit }), input('data-clim-fl-level', S.fl.level, (v) => { S.fl.level = v; keep(); })));
    if (from?.source) kids.push(el('p', { className: C.muted }, s('clim.fl.level.from', { source: from.source })));
    kids.push(label(s('clim.fl.kind'), select('data-clim-fl-kind', S.fl.kind, ['coastal', 'river', 'both'].map((k) => [k, s('clim.fl.k.' + k)]), (v) => { S.fl.kind = v; keep(); render(); })));
    if (S.fl.kind !== 'coastal') kids.push(label(s('clim.fl.depth', { unit }), input('data-clim-fl-depth', S.fl.depth, (v) => { S.fl.depth = v; keep(); })));
    kids.push(label(s('clim.fl.freeboard', { unit }), input('data-clim-fl-freeboard', S.fl.freeboard, (v) => { S.fl.freeboard = v; keep(); })));
    kids.push(el('button', { type: 'button', className: C.run, 'data-clim-fl-run': '', on: { click: () => { S.flOut = f ? raiseFlood({ level: numIn(S.fl.level), depth: numIn(S.fl.depth), kind: S.fl.kind, d: f.d, unitPerM: perM, freeboard: numIn(S.fl.freeboard) }) : null; render(); } } }, s('clim.fl.run')));
    const r = S.flOut;
    if (r) {
      if (r.missing.length) kids.push(...r.missing.map((m) => el('p', { className: C.note, 'data-clim-fl-missing': m }, s('clim.fl.missing.' + m))));
      if (Number.isFinite(r.future)) {
        const rows = [[s('clim.fl.r.level'), fmt(r.present, 2) + ' ' + unit, fmt(r.future, 2) + ' ' + unit, sgn(r.future - r.present, 2) + ' ' + unit]];
        if (r.parts.slr) rows.push([s('clim.fl.r.slr'), '–', sgn(r.parts.slr, 2) + ' ' + unit, '']);
        if (r.parts.rain) rows.push([s('clim.fl.r.rain'), '–', sgn(r.parts.rain, 2) + ' ' + unit, '']);
        if (r.design !== r.future) rows.push([s('clim.fl.r.design'), fmt(r.present + (r.design - r.future), 2) + ' ' + unit, fmt(r.design, 2) + ' ' + unit, '']);
        kids.push(table('data-clim-fl-table', [s('clim.col.item'), s('clim.col.present'), futHead(), s('clim.col.change')], rows));
        kids.push(el('ul', { 'data-clim-fl-assume': '' }, ...r.assumptions.map((a) => el('li', {}, s('clim.fl.a.' + a, { slr: fmt(f.d.slrM, 2), pct: fmt(f.d.rx1dayPct, 0) })))));
      }
    }
    kids.push(el('p', { className: C.muted }, s('clim.fl.note')));
    return kids;
  }

  function firePart(f) {
    const kids = [el('p', { className: C.h }, el('strong', {}, s('clim.fi.head'))), el('p', { className: C.note, 'data-clim-fi-screening': '' }, s('clim.fi.note'))];
    kids.push(label(s('clim.fi.fuel'), select('data-clim-fi-fuel', S.fi.fuel, Object.keys(FUELS).map((k) => [k, s('clim.fi.f.' + k)]), (v) => { S.fi.fuel = v; keep(); })));
    kids.push(label(s('clim.fi.slope'), input('data-clim-fi-slope', S.fi.slope, (v) => { S.fi.slope = v; keep(); })), label(s('clim.fi.dist'), input('data-clim-fi-dist', S.fi.dist, (v) => { S.fi.dist = v; keep(); })));
    kids.push(el('button', { type: 'button', className: C.run, 'data-clim-fi-run': '', on: { click: () => { S.fiOut = fireScreen({ fuel: S.fi.fuel, slopeDeg: numIn(S.fi.slope) || 0, distanceM: numIn(S.fi.dist), fwiPct: f?.d?.fwiPct }); render(); } } }, s('clim.fi.run')));
    const r = S.fiOut;
    if (r?.ok) {
      const fut = r.future;
      kids.push(table('data-clim-fi-table', [s('clim.col.item'), s('clim.col.present'), futHead(), s('clim.col.change')], [
        [s('clim.fi.r.rating'), s('clim.fi.b.' + r.present.band), fut ? s('clim.fi.b.' + fut.band) : '–', ''],
        [s('clim.fi.r.index'), fmt(r.present.index, 1), fut ? fmt(fut.index, 1) : '–', fut ? sgn(fut.index - r.present.index, 1) : ''],
        [s('clim.fi.r.weather'), '1', fut ? fmt(r.factors.weather, 2) : '–', fut ? sgn((r.factors.weather - 1) * 100, 0) + ' %' : '']]));
      if (!fut) kids.push(el('p', { className: C.note }, s('clim.fi.nofwi')));
      if (r.factors.slopeCapped) kids.push(el('p', { className: C.muted }, s('clim.fi.capped')));
    }
    return kids;
  }

  const epwPlace = (text) => { const L = /^LOCATION,([^\n]*)/m.exec(text)?.[1]?.split(','); const lat = Number(L?.[5]), lon = Number(L?.[6]); return Number.isFinite(lat) && Number.isFinite(lon) ? { lat, lon } : null; };
  function heatPart(f0) {
    const kids = [el('p', { className: C.h }, el('strong', {}, s('clim.he.head'))), el('p', { className: C.muted }, s('clim.he.intro'))];
    const file = el('input', { type: 'file', accept: '.epw', 'data-clim-he-epw': '', 'aria-label': s('clim.he.pick') });
    file.addEventListener('change', async () => { const x = file.files?.[0]; if (!x) return; if (x.size > 6e6) { S.heSaid = s('clim.he.badepw', { why: 'size' }); render(); return; } S.epw = { text: await x.text(), name: x.name }; S.he = null; S.heSaid = ''; render(); });
    kids.push(label(s('clim.he.pick'), file));
    const epw = S.epw || host.epw?.() || null;
    if (epw) kids.push(el('p', { 'data-clim-he-name': '' }, epw.name));
    kids.push(el('button', { type: 'button', className: C.run, 'data-clim-he-run': '', on: { click: () => {
      S.heSaid = '';
      if (!f0) { S.heSaid = s('clim.needfuture'); render(); return; }
      if (!epw) { S.heSaid = s('clim.he.noepw'); render(); return; }
      // a place picked by hand wins; else the pack place nearest to the weather file's own location, then the site's
      const at = !S.loc && epwPlace(epw.text), p = current(), fe = at && p ? futureAt(p.pack, { lat: at.lat, lon: at.lon, scenario: S.scenario, horizon: S.horizon }) : null, f = fe?.ok ? fe : f0;
      try {
        const m = morphEpw(epw.text, f.d, { label: futHead() + (f.loc ? ', ' + f.loc.name : ', global') });
        S.he = { place: fe?.ok ? f.loc?.name || '' : '', rows: compareHeat(heatSummary(epw.text), heatSummary(m.text)), text: m.text, name: epw.name.replace(/\.epw$/i, '') + '-' + S.scenario + '-' + S.horizon + '.epw' };
      } catch (e) { S.he = null; S.heSaid = s('clim.he.badepw', { why: e.message }); }
      render();
    } } }, s('clim.he.run')));
    if (S.he) {
      const dec = { hot30: 0, hot35: 0, cdd18: 0, hdd18: 0 };
      if (S.he.place) kids.push(el('p', { 'data-clim-he-place': '' }, s('clim.he.place', { name: S.he.place })));
      kids.push(table('data-clim-he-table', [s('clim.col.item'), s('clim.col.present'), futHead(), s('clim.col.change')], S.he.rows.map((r) => [s('clim.he.r.' + r.key), fmt(r.present, dec[r.key] ?? 1), fmt(r.future, dec[r.key] ?? 1), sgn(r.change, dec[r.key] ?? 1)])));
      const acts = [el('button', { type: 'button', className: C.btn, 'data-clim-he-save': '', on: { click: () => host.download?.(S.he.name, S.he.text) } }, s('clim.he.save'))];
      if (host.useEpw) acts.push(el('button', { type: 'button', className: C.btn, 'data-clim-he-use': '', on: { click: () => { host.useEpw(S.he.text, S.he.name); S.heSaid = s('clim.he.used'); render(); } } }, s('clim.he.use')));
      kids.push(el('div', { style: 'display:flex;gap:0.25rem;flex-wrap:wrap;margin:0.3rem 0' }, ...acts), el('p', { className: C.muted }, s('clim.he.note')));
    }
    if (S.heSaid) kids.push(el('p', { className: C.note, 'data-clim-he-say': '' }, S.heSaid));
    return kids;
  }

  function render() {
    const kids = picker(), f = future();
    if (packs().length && S.scenario && f?.ok) {
      if (show.includes('flood')) kids.push(el('div', { 'data-clim-part': 'flood' }, ...floodPart(f)));
      if (show.includes('fire')) kids.push(el('div', { 'data-clim-part': 'fire' }, ...firePart(f)));
      if (show.includes('heat')) kids.push(el('div', { 'data-clim-part': 'heat' }, ...heatPart(f)));
    }
    root.replaceChildren(...kids);
    return root;
  }
  onPacks(() => { if (root.isConnected) render(); });
  render();
  return { el: root, render, future, state: S, say: s };
}
