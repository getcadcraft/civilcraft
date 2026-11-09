/* SPDX-License-Identifier: Apache-2.0 */
/**
 * frame-loads-panel.js — the "Wind loads", "Seismic site and system" and "ASCE 7 combinations" blocks of the frame analysis panel
 * (0.9 SU.1056b). Shown where the host says `concrete: true` (BimCraft, DetailCraft: they have the floors the loads act on).
 * Imports only lib/frame. An aid until an engineer has reviewed it: "Not a code check; your engineer reviews the results."
 * The numbers come from loads-sources.js (two public pages each; the standard is not held here); the blocks list those sources and
 * what was left out. Settings are kept in the analysis as `loads` (cleanLoads) and saved with the model.
 *
 *   cleanLoads(x) → clean | null          loadsPanel(ui) → { blocks() → [nodes], tables() → report tables, clear() }
 *   ui = the object frame-panel.js hands to concretePanel, plus `concrete` (that panel) — see frame-concrete-panel.js
 */
import { windStories, windCase, EXPOSURES, ENCLOSURES, EDITIONS as WIND_EDITIONS, ke } from './wind-asce7.js';
import { designValues, SITE_CLASSES, SYSTEMS, systemById, IE, usgsUrl, parseUsgs } from './seismic-asce7.js';
import { designSpectrum, spectrumPoints } from './spectrum-asce7.js';
import { asce7Combos } from './combos-asce7.js';
import { cleanConcrete, suggestFloors } from './frame-concrete.js';
import { SOURCES, UNCONFIRMED, DATE_READ } from './loads-sources.js';

const WGEN = 'wind';
const n = (v, d, lo, hi) => { const x = typeof v === 'string' && v.trim() !== '' ? Number(v) : v; return typeof x === 'number' && Number.isFinite(x) && x >= lo && x <= hi ? x : d; };
const f1 = (v, d = 1) => (Number.isFinite(v) ? (Math.round(v * 10 ** d) / 10 ** d).toFixed(d) : '');
export const SPEED_UNITS = Object.freeze({ ms: 1, mph: 0.44704, kmh: 1 / 3.6 });

export const DEFAULT_LOADS = Object.freeze({
  wind: { edition: '7-16', V: 0, vUnit: 'mph', exposure: 'C', Kzt: 1, Kd: 0.85, ze: 0, G: 0.85, enclosure: 'enclosed', h: null, cpLee: null, ecc: 0, dir: 'both' },
  site: { edition: '7-16', Ss: 0, S1: 0, SMS: 0, SM1: 0, siteClass: 'D', d1exception: false, TL: 8, risk: 'II', system: 'rc-smf', Ie: 1, rho: 1, lat: '', lon: '', mp: null },
  combos: { method: 'lrfd' },
});

/** Untrusted → clean, or null when the file has none (an older analysis stays as it is). */
export function cleanLoads(x) {
  if (!x || typeof x !== 'object') return null;
  const w = x.wind || {}, s = x.site || {}, c = x.combos || {}, D = DEFAULT_LOADS;
  const mp = s.mp && Array.isArray(s.mp.periods) && Array.isArray(s.mp.ordinates) && s.mp.periods.length === s.mp.ordinates.length && s.mp.periods.length >= 2 && s.mp.periods.length <= 60
    && s.mp.periods.every((v, k) => Number.isFinite(v) && v >= 0 && (k === 0 || v > s.mp.periods[k - 1])) && s.mp.ordinates.every((v) => Number.isFinite(v) && v >= 0)
    ? { periods: s.mp.periods.map(Number), ordinates: s.mp.ordinates.map(Number) } : null;
  return {
    wind: { edition: WIND_EDITIONS.includes(w.edition) ? w.edition : D.wind.edition, V: n(w.V, 0, 0, 120), vUnit: SPEED_UNITS[w.vUnit] ? w.vUnit : 'mph', exposure: EXPOSURES[w.exposure] ? w.exposure : 'C',
      Kzt: n(w.Kzt, 1, 0.5, 5), Kd: n(w.Kd, 0.85, 0.5, 1.2), ze: n(w.ze, 0, 0, 6000), G: n(w.G, 0.85, 0.5, 3), enclosure: ENCLOSURES[w.enclosure] !== undefined ? w.enclosure : 'enclosed',
      h: n(w.h, null, 1, 1e6), cpLee: n(w.cpLee, null, -2, 0), ecc: n(w.ecc, 0, 0, 0.5), dir: ['X', 'Y', 'both'].includes(w.dir) ? w.dir : 'both' },
    site: { edition: ['7-16', '7-22'].includes(s.edition) ? s.edition : '7-16', Ss: n(s.Ss, 0, 0, 5), S1: n(s.S1, 0, 0, 3), SMS: n(s.SMS, 0, 0, 6), SM1: n(s.SM1, 0, 0, 4),
      siteClass: SITE_CLASSES.includes(s.siteClass) ? s.siteClass : 'D', d1exception: s.d1exception === true, TL: n(s.TL, 8, 1, 30), risk: ['I', 'II', 'III', 'IV'].includes(s.risk) ? s.risk : 'II',
      system: systemById(s.system) ? s.system : 'rc-smf', Ie: n(s.Ie, 1, 1, 1.5), rho: n(s.rho, 1, 1, 1.5), lat: String(s.lat ?? '').slice(0, 12), lon: String(s.lon ?? '').slice(0, 12), mp },
    combos: { method: c.method === 'asd' ? 'asd' : 'lrfd' },
  };
}

export function loadsPanel(ui) {
  const { el, t, C, host } = ui;
  const L = host.len || null;
  const cur = () => cleanLoads(ui.current().loads) || cleanLoads({});
  const edit = (label, fn) => ui.change(label, (x) => { const l = cleanLoads(x.loads) || cleanLoads({}); fn(l); x.loads = cleanLoads(l); });
  const num = (value, onchange, attrs = {}) => el('input', { type: 'text', inputMode: 'decimal', className: C.input + ' fa-factor', value: String(value), onchange: (e) => { const v = Number(String(e.target.value).replace(',', '.')); if (Number.isFinite(v)) onchange(v); else ui.rerender(); }, ...attrs });
  const conc = () => cleanConcrete(ui.current().concrete) || cleanConcrete({});
  const editConc = (label, fn) => ui.change(label, (x) => { const c = cleanConcrete(x.concrete) || cleanConcrete({}); fn(c); x.concrete = c; });
  const fresh = () => { const r = ui.result(); return r && !r.error && !ui.stale() ? r : null; };
  const needRun = () => { if (!ui.result() || ui.result().error || ui.stale()) ui.run(); const r = ui.result(); return r && !r.error ? r : null; };
  let usgsMsg = '', pending = false;

  // ---- wind ----
  /** Plan extents and base of the analysed frame, and the wind data for one direction. */
  function geometry(frame) {
    const m = frame.model, at = new Map(m.nodes.map((q) => [q.id, q]));
    const base = Math.min(...m.supports.map((s) => at.get(s.node)?.z ?? Infinity));
    const up = m.nodes.filter((q) => q.z > base + 1);
    if (!Number.isFinite(base) || !up.length) return null;
    const xs = up.map((q) => q.x), ys = up.map((q) => q.y);
    return { base, X: Math.max(...xs) - Math.min(...xs), Y: Math.max(...ys) - Math.min(...ys) };
  }
  function windFor(w, floors, geo, dir) {
    const across = dir === 'X' ? geo.Y : geo.X, along = dir === 'X' ? geo.X : geo.Y;
    const Ke = w.edition === '7-10' ? 1 : (w.ze > 0 ? ke(w.ze) : 1);
    return windStories({ V: w.V * SPEED_UNITS[w.vUnit], exposure: w.exposure, edition: w.edition, Kzt: w.Kzt, Kd: w.Kd, Ke, G: w.G, enclosure: w.enclosure, floors, base: geo.base, h: w.h ?? undefined, B: across, L: along, cpLee: w.cpLee });
  }
  function windNow() {
    const r = fresh(), w = cur().wind, c = conc();
    if (!r || !(w.V > 0) || !r.frame.model.diaphragms?.length) return null;
    const have = new Set(r.frame.model.diaphragms.map((d) => d.id));
    const floors = c.floors.filter((f) => have.has(f.id)).map((f) => ({ id: f.id, z: f.z }));
    const geo = geometry(r.frame);
    if (!floors.length || !geo) return null;
    const dirs = w.dir === 'both' ? ['X', 'Y'] : [w.dir];
    const by = {};
    for (const d of dirs) by[d] = windFor(w, floors, geo, d);
    return { by, dirs, geo, floors, w };
  }
  function makeWind() {
    const w = cur().wind;
    if (!(w.V > 0)) { host.print(t('frame.ld.err.no-speed')); return; }
    const r = needRun();
    if (!r) return;
    if (!r.frame.model.diaphragms?.length) { host.print(t('frame.ld.err.no-floors')); return; }
    const now = windNowOf(r);
    if (!now) { host.print(t('frame.ld.err.no-floors')); return; }
    const model = r.frame.model, at = new Map(model.nodes.map((q) => [q.id, q]));
    const cases = [];
    for (const dir of now.dirs) {
      const forces = Object.fromEntries(now.by[dir].rows.map((q) => [q.id, q.F]));
      for (const sign of [1, -1]) for (const tor of (w.ecc > 0 ? [1, -1] : [1])) {
        const id = 'W' + dir + (sign > 0 ? '1' : '2') + (w.ecc > 0 ? (tor > 0 ? 'p' : 'n') : '');
        const fc = windCase(model, { id, name: t('frame.ld.w.case', { dir, sign: sign > 0 ? '+' : '−' }) + (w.ecc > 0 ? (tor > 0 ? ' e+' : ' e−') : ''), dir, sign, forces, ecc: w.ecc, torsion: tor });
        cases.push({ id, name: fc.name, kind: 'wind', selfWeight: 0, gen: WGEN, loads: fc.loads.map((l) => { const q = at.get(l.node); return { type: 'node', at: [q.x, q.y, q.z], F: l.F }; }) });
      }
    }
    ui.change(t('frame.ld.w.undo-make'), (x) => {
      const gone = new Set(x.cases.filter((q) => q.gen === WGEN).map((q) => q.id));
      x.cases = [...x.cases.filter((q) => q.gen !== WGEN), ...cases];
      x.combos = x.combos.map((q) => ({ ...q, factors: q.factors.filter((f) => !gone.has(f.case)) })).filter((q) => q.limit || q.factors.length);
    });
    host.print(t('frame.ld.w.made', { n: cases.length, F: f1(Math.max(...now.dirs.map((d) => now.by[d].total)) / 1000, 1) }));
  }
  function windNowOf(r) {
    const w = cur().wind, c = conc();
    const have = new Set((r.frame.model.diaphragms || []).map((d) => d.id));
    const floors = c.floors.filter((f) => have.has(f.id)).map((f) => ({ id: f.id, z: f.z }));
    const geo = geometry(r.frame);
    if (!floors.length || !geo) return null;
    const dirs = w.dir === 'both' ? ['X', 'Y'] : [w.dir];
    return { by: Object.fromEntries(dirs.map((d) => [d, windFor(w, floors, geo, d)])), dirs, geo, floors, w };
  }
  function findFloors() {
    const r = needRun();
    if (!r) return;
    const found = suggestFloors(r.frame.model);
    if (!found.length) { host.print(t('frame.eq.none-found')); return; }
    editConc(t('frame.eq.undo-floors'), (q) => { q.floors = found.map((f) => ({ ...f, w: q.floors.find((o) => Math.abs(o.z - f.z) < 1)?.w || 0 })); });
  }
  const kPa = (pa) => f1(pa / 1000, 3);
  function windBlock() {
    const w = cur().wind, set = (key, v) => edit(t('frame.ld.undo'), (l) => { l.wind[key] = v; });
    const par = (key, label, extra = {}) => ui.field(label, num(w[key], (v) => set(key, v), { 'data-fa-wind': key, ...extra }));
    const out = [ui.head(t('frame.ld.w.h'), ui.btn(t('frame.eq.find'), findFloors, { 'data-fa-wind-find': '' }), ui.btn(t('frame.ld.w.make'), makeWind, { 'data-fa-wind-make': '' })),
      el('p', { className: 'fa-aid', 'data-fa-wind-aid': '' }, t('frame.ld.w.aid'))];
    out.push(el('div', { className: 'fa-row' },
      ui.field(t('frame.ld.edition'), ui.sel(w.edition, WIND_EDITIONS.map((v) => [v, 'ASCE 7-' + v.slice(2)]), (v) => set('edition', v), { 'data-fa-wind': 'edition' })),
      par('V', t('frame.ld.w.speed')),
      ui.field(t('frame.ld.w.speed-unit'), ui.sel(w.vUnit, [['mph', 'mph'], ['ms', 'm/s'], ['kmh', 'km/h']], (v) => set('vUnit', v), { 'data-fa-wind': 'vUnit' })),
      ui.field(t('frame.ld.w.exposure'), ui.sel(w.exposure, Object.keys(EXPOSURES).map((v) => [v, v]), (v) => set('exposure', v), { 'data-fa-wind': 'exposure' })),
      ui.field(t('frame.ld.w.enclosure'), ui.sel(w.enclosure, Object.keys(ENCLOSURES).map((v) => [v, t('frame.ld.w.enc-' + v)]), (v) => set('enclosure', v), { 'data-fa-wind': 'enclosure' }))));
    out.push(el('div', { className: 'fa-row' },
      par('Kzt', 'Kzt'), par('Kd', 'Kd'), par('G', 'G'), par('ze', t('frame.ld.w.ze')),
      ui.field(t('frame.ld.w.cplee'), num(w.cpLee ?? '', (v) => set('cpLee', v), { 'data-fa-wind': 'cpLee', placeholder: '−0.5' })),
      par('ecc', t('frame.ld.w.ecc')),
      ui.field(t('frame.eq.f-dir'), ui.sel(w.dir, [['both', t('frame.eq.dir-both')], ['X', 'X'], ['Y', 'Y']], (v) => set('dir', v), { 'data-fa-wind': 'dir' }))));
    const now = windNow();
    if (!(w.V > 0)) out.push(ui.note(t('frame.ld.w.need-speed')));
    else if (!now) out.push(ui.note(t(fresh() ? 'frame.ld.err.no-floors' : 'frame.ld.w.need-run'), { 'data-fa-wind-need': '' }));
    else {
      out.push(ui.note(t('frame.ld.w.geometry', { X: f1(now.geo.X / 1000, 2), Y: f1(now.geo.Y / 1000, 2), h: f1((now.by[now.dirs[0]].h - now.geo.base) / 1000, 2) }), { 'data-fa-wind-geo': '' }));
      for (const d of now.dirs) {
        const s = now.by[d];
        out.push(ui.note(t('frame.ld.w.summary', { dir: d, qh: kPa(s.qh), LB: f1(s.LB, 2), total: f1(s.total / 1000, 1) }), { 'data-fa-wind-summary': d }));
        for (const x of s.warnings) out.push(ui.note(t('frame.ld.w.warn-' + x.code, { LB: f1(x.LB, 2) }), { className: C.note + ' fa-warn' }));
        // i18n-ignore: symbols and units
        out.push(ui.table([t('frame.eq.floor'), 'z (' + (L ? L.mark() : 'mm') + ')', 'qz (kPa)', 'p windward (kPa)', 'p leeward (kPa)', 'p + GCpi (kPa)', 'p − GCpi (kPa)', 'F (kN)'], [1, 2, 3, 4, 5, 6, 7],
          s.rows.map((q) => el('tr', { 'data-fa-wind-row': d + ':' + q.id }, ui.td(q.id), ui.td(L ? L.num(q.z) : f1(q.z, 0), 1), ui.td(kPa(q.qz), 1), ui.td(kPa(q.pWind), 1), ui.td(kPa(q.pLee), 1), ui.td(kPa(q.pInPlus), 1), ui.td(kPa(q.pInMinus), 1), ui.td(f1(q.F / 1000, 2) + (q.minimum ? ' *' : ''), 1))),
          { 'data-fa-wind-forces': d }));
      }
    }
    out.push(ui.note(t('frame.ld.w.note')));
    out.push(ui.note(t('frame.ld.not-check'), { 'data-fa-ld-line': '' }));
    return el('div', { className: C.block + ' fa-wind', 'data-fa-wind-block': '' }, ...out);
  }

  // ---- seismic site and system ----
  const siteNow = () => {
    const s = cur().site;
    const v = designValues(s.edition === '7-22' ? { edition: '7-22', SMS: s.SMS, SM1: s.SM1 } : { edition: '7-16', Ss: s.Ss, S1: s.S1, siteClass: s.siteClass, d1exception: s.d1exception });
    return { s, v, sys: systemById(s.system) };
  };
  function spectrumOf(s, v) {
    if (!v || v.error || !(v.SDS > 0)) return null;
    return designSpectrum({ SDS: v.SDS, SD1: v.SD1, TL: s.TL, ...(s.mp || {}) });
  }
  function useSite() {
    const { s, v, sys } = siteNow();
    if (v.error || !sys) { host.print(t('frame.ld.s.err.' + (v.error || 'values'))); return; }
    const Ie = s.risk === 'II' ? IE.II : s.risk === 'IV' ? IE.IV : s.Ie;
    editConc(t('frame.ld.s.undo-use'), (q) => {
      Object.assign(q.seismic, { SDS: Math.round(v.SDS * 1e4) / 1e4, SD1: Math.round(v.SD1 * 1e4) / 1e4, S1: s.S1, R: sys.R, Cd: sys.Cd, Ie, TL: s.TL, system: sys.period });
      if (s.risk !== 'I') q.seismic.risk = s.risk;
    });
    host.print(t('frame.ld.s.used', { SDS: f1(v.SDS, 3), SD1: f1(v.SD1, 3), R: sys.R }));
  }
  async function lookup() {
    const s = cur().site, lat = Number(String(s.lat).replace(',', '.')), lon = Number(String(s.lon).replace(',', '.'));
    if (!(Math.abs(lat) <= 90) || !(Math.abs(lon) <= 180) || s.lat === '' || s.lon === '') { host.print(t('frame.ld.s.err.latlon')); return; }
    const f = host.fetch || globalThis.fetch;
    if (!f) { host.print(t('frame.ld.s.err.offline')); return; }
    pending = true; usgsMsg = t('frame.ld.s.asking'); ui.rerender();
    try {
      const res = await f(usgsUrl({ edition: s.edition, latitude: lat, longitude: lon, riskCategory: s.risk === 'I' ? 'I' : s.risk, siteClass: s.siteClass, title: 'CadCraft' }));
      const data = parseUsgs(await res.json());
      if (data.error) throw new Error(data.error);
      edit(t('frame.ld.s.undo-usgs'), (l) => {
        if (data.Ss !== null) l.site.Ss = data.Ss;
        if (data.S1 !== null) l.site.S1 = data.S1;
        if (data.SMS !== null) l.site.SMS = data.SMS;
        if (data.SM1 !== null) l.site.SM1 = data.SM1;
        if (data.TL !== null) l.site.TL = data.TL;
        l.site.mp = data.periods ? { periods: data.periods, ordinates: data.ordinates } : null;
      });
      usgsMsg = t('frame.ld.s.got', { ss: f1(data.Ss, 3), s1: f1(data.S1, 3) });
    } catch (e) { usgsMsg = t('frame.ld.s.err.usgs'); }
    pending = false; ui.rerender();
  }
  function siteBlock() {
    const { s, v, sys } = siteNow(), set = (key, val) => edit(t('frame.ld.undo'), (l) => { l.site[key] = val; });
    const par = (key, label, extra = {}) => ui.field(label, num(s[key], (x) => set(key, x), { 'data-fa-site': key, ...extra }));
    const out = [ui.head(t('frame.ld.s.h'), ui.btn(t('frame.ld.s.use'), useSite, { 'data-fa-site-use': '' })), el('p', { className: 'fa-aid', 'data-fa-site-aid': '' }, t('frame.ld.s.aid'))];
    const row1 = [ui.field(t('frame.ld.edition'), ui.sel(s.edition, [['7-16', 'ASCE 7-16'], ['7-22', 'ASCE 7-22']], (x) => set('edition', x), { 'data-fa-site': 'edition' }))];
    if (s.edition === '7-22') row1.push(par('SMS', 'SMS (g)'), par('SM1', 'SM1 (g)'), par('S1', 'S1 (g)'));
    else row1.push(par('Ss', 'Ss (g)'), par('S1', 'S1 (g)'), ui.field(t('frame.ld.s.class'), ui.sel(s.siteClass, SITE_CLASSES.map((c) => [c, c]), (x) => set('siteClass', x), { 'data-fa-site': 'siteClass' })));
    row1.push(par('TL', 'TL (s)'));
    out.push(el('div', { className: 'fa-row' }, ...row1));
    out.push(el('div', { className: 'fa-row' },
      ui.field(t('frame.eq.f-risk'), ui.sel(s.risk, ['I', 'II', 'III', 'IV'].map((x) => [x, x]), (x) => set('risk', x), { 'data-fa-site': 'risk' })),
      s.risk === 'II' || s.risk === 'IV' ? null : par('Ie', 'Ie'),
      ui.field(t('frame.ld.s.system'), ui.sel(s.system, SYSTEMS.map((x) => [x.id, x.label + ' (' + x.edition + ')']), (x) => set('system', x), { 'data-fa-site': 'system' })),
      par('rho', 'ρ')));
    if (s.edition !== '7-22' && s.siteClass === 'D' && s.S1 >= 0.2) out.push(el('label', { className: 'fa-live' }, el('input', { type: 'checkbox', checked: s.d1exception, 'data-fa-site': 'd1exception', onchange: (e) => set('d1exception', e.target.checked) }), ' ', t('frame.ld.s.d-exception')));
    out.push(el('div', { className: 'fa-row', 'data-fa-site-usgs': '' },
      ui.field(t('frame.ld.s.lat'), el('input', { type: 'text', className: C.input, value: s.lat, 'data-fa-site': 'lat', onchange: (e) => set('lat', e.target.value) })),
      ui.field(t('frame.ld.s.lon'), el('input', { type: 'text', className: C.input, value: s.lon, 'data-fa-site': 'lon', onchange: (e) => set('lon', e.target.value) })),
      ui.btn(t('frame.ld.s.lookup'), lookup, { 'data-fa-site-lookup': '', disabled: pending }),
      usgsMsg ? el('span', { className: 'fa-lead', 'data-fa-site-msg': '' }, usgsMsg) : null));
    out.push(ui.note(t('frame.ld.s.usgs-note')));
    if (v.error) out.push(ui.note(t('frame.ld.s.err.' + v.error), { className: C.note + ' fa-warn', 'data-fa-site-err': '' }));
    else {
      out.push(ui.note(t('frame.ld.s.result', { Fa: v.Fa ? f1(v.Fa, 3) : '–', Fv: v.Fv ? f1(v.Fv, 3) : '–', SMS: f1(v.SMS, 3), SM1: f1(v.SM1, 3), SDS: f1(v.SDS, 3), SD1: f1(v.SD1, 3) }), { 'data-fa-site-result': '' }));
      for (const x of v.warnings) out.push(ui.note(t('frame.ld.s.warn-' + x.code), { className: C.note + ' fa-warn' }));
      if (sys) out.push(ui.note(t('frame.ld.s.sys', { R: sys.R, O: sys.Omega0, Cd: sys.Cd }), { 'data-fa-site-sys': '' }));
      const sp = spectrumOf(s, v);
      if (sp) {
        out.push(ui.note(t('frame.ld.s.spectrum', { T0: f1(sp.T0, 3), Ts: f1(sp.Ts, 3), kind: t('frame.ld.s.kind-' + sp.kind) }), { 'data-fa-site-spectrum': '' }));
        const pts = sp.kind === 'multi-period' ? s.mp.periods.map((T) => [T, sp(T)]) : spectrumPoints(sp);
        out.push(ui.table(['T (s)', 'Sa (g)'], [0, 1], pts.slice(0, 40).map(([T, Sa]) => el('tr', {}, ui.td(f1(T, 3), 1), ui.td(f1(Sa, 4), 1))), { 'data-fa-site-spectrum-table': '' }));
      }
    }
    out.push(ui.note(t('frame.ld.not-check')));
    return el('div', { className: C.block + ' fa-site', 'data-fa-site-block': '' }, ...out);
  }

  // ---- combinations ----
  function makeCombos() {
    const a = ui.current(), c = cur(), { v, sys } = siteNow();
    const SDS = v && !v.error ? v.SDS : (conc().seismic.SDS || 0);
    const gen = asce7Combos(a.cases.map((q) => ({ id: q.id, name: q.name, kind: q.kind })), { method: c.combos.method, SDS, rho: c.site.rho, Omega0: sys ? sys.Omega0 : null });
    if (!gen.combos.length) { host.print(t('frame.des.err.no-made')); return; }
    ui.change(t('frame.ld.c.undo'), (x) => { x.combos = [...x.combos.filter((q) => !String(q.id).startsWith('A7-') && !(c.combos.method === 'lrfd' && q.limit)), ...gen.combos]; });
    host.print(t('frame.ld.c.made', { n: gen.combos.length, m: c.combos.method === 'asd' ? 'ASD' : 'LRFD' }) + (gen.warnings.some((q) => q.code === 'no-sds') ? ' ' + t('frame.ld.c.no-sds') : ''));
  }
  function combosBlock() {
    const c = cur();
    const out = [ui.head(t('frame.ld.c.h'), ui.btn(t('frame.ld.c.make'), makeCombos, { 'data-fa-ld-combos': '' }))];
    out.push(el('div', { className: 'fa-row' }, ui.field(t('frame.ld.c.method'), ui.sel(c.combos.method, [['lrfd', 'LRFD (ASCE 7 2.3)'], ['asd', 'ASD (ASCE 7 2.4)']], (x) => edit(t('frame.ld.undo'), (l) => { l.combos.method = x; }), { 'data-fa-ld-method': '' }))));
    out.push(ui.note(t('frame.ld.c.note')));
    out.push(ui.note(t('frame.ld.not-check')));
    return el('div', { className: C.block + ' fa-ldcombos', 'data-fa-ld-combos-block': '' }, ...out);
  }
  function sourcesBlock() {
    const items = Object.entries(SOURCES).map(([id, s]) => el('li', {}, el('strong', {}, s.what), ' (' + s.edition + ') ', ...s.urls.flatMap((u, k) => [k ? ', ' : '', el('a', { href: u, target: '_blank', rel: 'noopener noreferrer' }, new URL(u).hostname)])));
    return el('details', { className: C.block + ' fa-ld-sources', 'data-fa-ld-sources': '' }, el('summary', {}, t('frame.ld.src.h')),
      ui.note(t('frame.ld.src.about', { date: DATE_READ })), el('ul', {}, ...items),
      el('h4', {}, t('frame.ld.src.left-out')), el('ul', {}, ...UNCONFIRMED.map((u) => el('li', {}, u))));
  }

  // ---- report ----
  function tables() {
    const out = [], w = cur().wind, now = windNow();
    /* i18n-ignore-start: symbols and units */
    if (now) {
      out.push({ title: t('frame.ld.w.h'), head: [t('frame.rep.item'), t('frame.rep.value')], numeric: [], rows: [
        ['ASCE 7', 'ASCE 7-' + w.edition.slice(2) + ' · ' + t('frame.ld.w.exposure') + ' ' + w.exposure + ' · V ' + f1(w.V, 1) + ' ' + w.vUnit], ['Kzt · Kd · G', [w.Kzt, w.Kd, w.G].join(' · ')],
        [t('frame.ld.w.enclosure'), t('frame.ld.w.enc-' + w.enclosure)], [t('frame.ld.w.note-title'), t('frame.ld.w.note')], [t('frame.ld.src.h'), t('frame.ld.src.about', { date: DATE_READ })], ['', t('frame.ld.not-check')]] });
      for (const d of now.dirs) out.push({ title: t('frame.ld.w.h') + ' ' + d, head: [t('frame.eq.floor'), 'z (mm)', 'qz (kPa)', 'p windward (kPa)', 'p leeward (kPa)', 'F (kN)'], numeric: [1, 2, 3, 4, 5],
        rows: now.by[d].rows.map((q) => [q.id, f1(q.z, 0), kPa(q.qz), kPa(q.pWind), kPa(q.pLee), f1(q.F / 1000, 2) + (q.minimum ? ' *' : '')]) });
    }
    const { s, v, sys } = siteNow();
    if (v && !v.error && v.SDS > 0 && cur().site.Ss + cur().site.S1 + cur().site.SMS > 0) {
      const sp = spectrumOf(s, v);
      out.push({ title: t('frame.ld.s.h'), head: [t('frame.rep.item'), t('frame.rep.value')], numeric: [], rows: [
        ['ASCE 7', 'ASCE 7-' + s.edition.slice(2) + (s.edition === '7-16' ? ' · ' + t('frame.ld.s.class') + ' ' + s.siteClass : '')],
        ['SMS · SM1', f1(v.SMS, 3) + ' · ' + f1(v.SM1, 3)], ['SDS · SD1 · TL', f1(v.SDS, 3) + ' · ' + f1(v.SD1, 3) + ' · ' + s.TL],
        ...(sys ? [[t('frame.ld.s.system'), sys.label + ' · R ' + sys.R + ' · Ω0 ' + sys.Omega0 + ' · Cd ' + sys.Cd]] : []), ['', t('frame.ld.not-check')]] });
      if (sp) out.push({ title: t('frame.ld.s.h') + ' Sa(T)', head: ['T (s)', 'Sa (g)'], numeric: [0, 1], rows: (sp.kind === 'multi-period' ? s.mp.periods.map((T) => [T, sp(T)]) : spectrumPoints(sp)).map(([T, Sa]) => [f1(T, 3), f1(Sa, 4)]) });
    }
    /* i18n-ignore-end */
    return out;
  }

  return {
    blocks: () => [windBlock(), siteBlock(), combosBlock(), sourcesBlock()],
    tables,
    clear() { usgsMsg = ''; pending = false; },
    get windResult() { return windNow(); },
  };
}
