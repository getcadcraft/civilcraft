/* SPDX-License-Identifier: Apache-2.0 */
/**
 * panel.js — the Weather files panel (0.11 Track WX, WX.4), the same in every host. The only file of lib/weather that touches a page, and
 * only inside mountPanel(). Text is always set as text, never as HTML.
 *
 * mountPanel(root, host) → { state(), refresh(), pick(stationId), setPlace(lat, lon), unmount() }
 * host = { t(key, vars), storage: { get(k), set(k, v) }, download(name, text, type),
 *          site() → { lat, lon, elev? } | null (may be a Promise): where the open model says it is,
 *          config: { bases: [url…] (tried in order: the CDN, then the site's own copy), sets: [set id…] },
 *          actions: [{ id, label, needsYear?, run({ station, set, summary, year (text | null), own }) → text to show | Promise }],
 *          fetch?, gunzip?, sha256? (tests) }
 * What it shows: the stations nearest the place with their winter and summer design temperatures and degree-days (from the set's index, so
 * no year is fetched to read them), the source and licence of the set, and the host's actions. A person's own .epw file works the same way.
 * "Explore the year" (WX.9) opens viewer.js on the chosen station's hours; from there every station of the sets can be opened on a map.
 */
import { readEpw } from './epw.js';
import { summary as summarize } from './derive.js';
import { cleanIndex, nearest, loadYear } from './stations.js';
import { openViewer } from './viewer.js';
import { readShare } from './viewstate.js';

function el(tag, attrs = {}, ...kids) {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) { if (k === 'className') n.className = v; else if (k.startsWith('on')) n[k] = v; else if (v !== false && v !== null && v !== undefined) n.setAttribute(k, v === true ? '' : String(v)); }
  for (const c of kids.flat()) if (c !== null && c !== undefined && c !== false) n.append(c);
  return n;
}
const CSS = `
.wx-panel{padding:.5rem .7rem;display:grid;grid-template-columns:minmax(0,1fr);gap:.6rem;font-size:.9em;min-width:0;max-width:100%;overflow-wrap:anywhere}
.wx-panel p{white-space:normal;margin:.2rem 0}
.wx-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.35rem .6rem;margin:.4rem 0}
.wx-field{display:grid;gap:.1rem;min-width:0;align-content:start}
.wx-field span{font-size:.85em;opacity:.85}
.wx-field input{width:100%;box-sizing:border-box;background:#fff;color:#111;border:1px solid #9aa5b1;border-radius:3px;padding:.2rem .3rem}
.wx-note{margin:.2rem 0;font-size:.85em;opacity:.9}
.wx-warn{color:#b45309}
.wx-err{color:#b91c1c}
.wx-table{width:100%;border-collapse:collapse;font-size:.85em}
.wx-panel h4{margin:.5rem 0 .2rem;font-size:1.05em}
.wx-table td,.wx-table th{text-align:left;padding:.15rem .3rem;border-bottom:1px solid rgba(128,128,128,.25);vertical-align:top}
.wx-table tr[data-wx-station]{cursor:pointer}
.wx-table tr.is-on{background:rgba(47,143,216,.16)}
.wx-row{display:flex;flex-wrap:wrap;gap:.4rem;margin:.3rem 0}
.wx-facts{display:grid;grid-template-columns:minmax(0,1.2fr) minmax(0,1fr);gap:.1rem .6rem;font-size:.9em}
.wx-facts dt{opacity:.85}.wx-facts dd{margin:0;font-variant-numeric:tabular-nums}
`;
export const toF = (c) => c * 9 / 5 + 32;
/** "-1.4 °C (29.5 °F)" — both, so nobody converts in their head */
export const temp = (c) => (c === null || c === undefined || Number.isNaN(c) ? '—' : c.toFixed(1) + ' °C (' + toF(c).toFixed(1) + ' °F)');
const whole = (x) => Math.round(x).toLocaleString('en-US');

export function mountPanel(root, host) {
  const t = host.t, S = { place: null, typed: { lat: '', lon: '' }, sets: [], setErrors: [], loading: true, near: [], pick: null, own: null, said: '', bad: false, busy: false, years: new Map(), viewer: null };
  if (!document.getElementById('wx-panel-css')) document.head.append(el('style', { id: 'wx-panel-css' }, CSS));
  const wrap = el('div', { className: 'wx-panel' });
  root.append(wrap);
  const say = (text, bad = false) => { S.said = text; S.bad = bad; draw(); };
  const chosen = () => (S.own ? { station: S.own.station, set: null, summary: S.own.summary, own: true } : S.pick ? { station: S.pick.station, set: S.pick.set, summary: S.pick.station.summary, own: false } : null);

  async function loadSets() {
    S.loading = true; draw();
    const f = host.fetch || globalThis.fetch.bind(globalThis);
    S.sets = []; S.setErrors = [];
    // Several sets (WX.5: one per state): eight indexes at a time, kept in the order the config lists them
    const ids = host.config.sets, found = new Array(ids.length).fill(null);
    const one = async (id) => {
      for (const base of host.config.bases) {
        try {
          const r = await f(String(base).replace(/\/+$/, '') + '/' + id + '/index.json', { credentials: 'omit' });
          if (!r.ok) continue;
          const c = cleanIndex(await r.json());
          if (c.ok && c.index.id === id) return c.index;
        } catch { /* the next base */ }
      }
      return null;
    };
    let next = 0;
    await Promise.all(Array.from({ length: Math.min(8, ids.length) }, async () => { while (next < ids.length) { const i = next++; found[i] = await one(ids[i]); } }));
    ids.forEach((id, i) => { if (found[i]) S.sets.push(found[i]); else S.setErrors.push(id); });
    S.loading = false;
    again();
  }
  function again() {
    S.near = S.place ? nearest(S.sets, S.place.lat, S.place.lon, { n: 6, elev: S.place.elev ?? null }) : [];
    if (S.pick && !S.near.some((x) => x.station.id === S.pick.station.id && x.set.id === S.pick.set.id)) S.pick = null;
    if (!S.pick && !S.own && S.near.length) {
      const want = host.storage?.get?.('station');
      S.pick = S.near.find((x) => x.set.id + '/' + x.station.id === want) || S.near[0];
    }
    draw();
  }
  async function findPlace() {
    let site = null;
    try { site = await host.site?.(); } catch { site = null; }
    if (site && Number.isFinite(site.lat) && Number.isFinite(site.lon)) { S.place = { lat: site.lat, lon: site.lon, elev: Number.isFinite(site.elev) ? site.elev : null, from: 'model' }; }
    else {
      const k = host.storage?.get?.('place');
      if (k && Number.isFinite(k.lat) && Number.isFinite(k.lon)) { S.place = { lat: k.lat, lon: k.lon, elev: null, from: 'typed' }; S.typed = { lat: String(k.lat), lon: String(k.lon) }; }
    }
  }
  async function yearOf(c) {
    if (c.own) return S.own.text;
    const key = c.set.id + '/' + c.station.id;
    if (S.years.has(key)) return S.years.get(key);
    const y = await loadYear(c.set, c.station, { bases: host.config.bases, fetch: host.fetch, gunzip: host.gunzip, sha256: host.sha256 });
    const r = readEpw(y.text);
    if (!r.ok) throw Object.assign(new Error(r.errors[0].key), { key: r.errors[0].key });
    S.years.set(key, y.text);
    return y.text;
  }
  async function act(a) {
    const c = chosen();
    if (!c || S.busy) return;
    S.busy = true; say(a.needsYear ? t('wx.fetching') : '');
    try {
      const year = a.needsYear ? await yearOf(c) : null;
      const said = await a.run({ ...c, year });
      S.busy = false; say(said || '');
    } catch (e) { S.busy = false; say(e.key ? t(e.key) : String(e.message || e), true); }
  }
  const creditOf = (set) => (set ? t('wx.credit', { name: set.source.name, attribution: set.source.attribution }) : '');
  const nameOf = (c) => c.station.name + (c.set ? ' · ' + c.set.name : '');
  async function sourceOf(c) {
    const text = await yearOf(c), r = readEpw(text);
    if (!r.ok) throw Object.assign(new Error(r.errors[0].key), { key: r.errors[0].key });
    return { epw: r, text, id: c.set ? c.set.id + '/' + c.station.id : null, name: nameOf(c), credit: creditOf(c.set) };
  }
  async function explore() {
    const c = chosen();
    if (!c || S.busy) return;
    S.busy = true; say(c.own ? '' : t('wx.fetching'));
    try {
      const src = await sourceOf(c);
      S.busy = false; say('');
      show(src);
    } catch (e) { S.busy = false; say(e.key ? t(e.key) : String(e.message || e), true); }
  }
  const everyStation = () => S.sets.flatMap((set) => set.stations.map((station) => ({ set, station })));
  function show(src, settings = null) {
    if (S.viewer) S.viewer.close();
    S.viewer = openViewer({ t, storage: host.storage, download: host.download, onClose: () => { S.viewer = null; }, stations: everyStation,
      loadStation: (x) => sourceOf({ station: x.station, set: x.set, own: false }),
      link: (code) => location.origin + location.pathname + '?wx=' + code }, src, settings);
    return S.viewer;
  }
  /** A link somebody made in the viewer (WX.10): open that station with that view. The code is checked; an unknown station opens nothing. */
  async function openShared(code) {
    const sh = readShare(code);
    if (!sh) return null;
    await ready;
    const find = (id) => everyStation().find((x) => x.set.id + '/' + x.station.id === id);
    const x = find(sh.station);
    if (!x) { say(t('wx.share.unknown'), true); return null; }
    try {
      const v = show(await sourceOf({ station: x.station, set: x.set, own: false }), sh.settings);
      if (sh.compare && find(sh.compare)) await v.compare(sh.compare);
      return v;
    } catch (e) { say(e.key ? t(e.key) : String(e.message || e), true); return null; }
  }
  async function ownFile(file) {
    if (!file) return;
    try {
      if (file.size > 6e6) throw Object.assign(new Error('big'), { key: 'wx.err.big' });
      const text = new TextDecoder('latin1').decode(new Uint8Array(await file.arrayBuffer())), r = readEpw(text);
      if (!r.ok) throw Object.assign(new Error(r.errors[0].key), { key: r.errors[0].key });
      const L = r.location;
      S.own = { text, name: file.name, summary: summarize(r), station: { id: 'own', name: [L.city, L.region, L.country].filter(Boolean).join(', ') || file.name, lat: L.lat, lon: L.lon, elev: L.elev, wmo: L.wmo, file: file.name } };
      say(t('wx.own.read', { name: file.name }));
    } catch (e) { say(e.key ? t(e.key) : String(e.message || e), true); }
  }

  function placeBlock() {
    const p = S.place;
    const box = (k) => el('label', { className: 'wx-field' }, el('span', {}, t('wx.f.' + k)),
      el('input', { type: 'number', step: 'any', value: S.typed[k], 'data-wx-in': k, onchange: (ev) => {
        S.typed[k] = ev.target.value.trim();
        const lat = Number(S.typed.lat), lon = Number(S.typed.lon);
        if (S.typed.lat !== '' && S.typed.lon !== '' && Math.abs(lat) <= 90 && Math.abs(lon) <= 180) { S.place = { lat, lon, elev: null, from: 'typed' }; host.storage?.set?.('place', { lat, lon }); S.own = null; again(); }
      } }));
    return el('section', { 'data-wx-place': '' },
      el('h4', {}, t('wx.sec.place')),
      p && p.from === 'model' ? el('p', { className: 'wx-note' }, t('wx.place.model', { lat: p.lat.toFixed(4), lon: p.lon.toFixed(4) })) : el('p', { className: 'wx-note' }, t('wx.place.none')),
      p && p.from === 'model' ? null : el('div', { className: 'wx-grid' }, box('lat'), box('lon')));
  }
  function stationsBlock() {
    if (S.loading) return el('p', { className: 'wx-note' }, t('wx.loading'));
    const out = el('section', { 'data-wx-stations': '' }, el('h4', {}, t('wx.sec.stations')));
    if (S.setErrors.length) out.append(el('p', { className: 'wx-note wx-warn' }, t('wx.sets.failed', { sets: S.setErrors.join(', ') })));
    if (!S.place) return out;
    if (!S.near.length) { out.append(el('p', { className: 'wx-note wx-warn', 'data-wx-none': '' }, t('wx.none'))); return out; }
    out.append(el('table', { className: 'wx-table' },
      el('thead', {}, el('tr', {}, el('th', {}, t('wx.col.station')), el('th', {}, t('wx.col.km')), el('th', {}, t('wx.col.winter')), el('th', {}, t('wx.col.summer')), el('th', {}, t('wx.col.hdd')))),
      el('tbody', {}, ...S.near.map((x) => el('tr', { 'data-wx-station': x.station.id, tabindex: '0', className: !S.own && S.pick && S.pick.station.id === x.station.id && S.pick.set.id === x.set.id ? 'is-on' : '',
        onclick: () => { S.pick = x; S.own = null; host.storage?.set?.('station', x.set.id + '/' + x.station.id); S.said = ''; draw(); } },
        el('td', {}, x.station.name), el('td', {}, whole(x.km) + ' km' + (x.dElev !== null && Math.abs(x.dElev) >= 150 ? ' · ' + t('wx.delev', { m: (x.dElev > 0 ? '+' : '') + whole(x.dElev) }) : '')),
        el('td', {}, x.station.summary.heat.t996.toFixed(1) + ' °C'), el('td', {}, x.station.summary.cool.t004.toFixed(1) + ' °C'), el('td', {}, whole(x.station.summary.hdd)))))));
    const far = S.pick && S.pick.km > 60, high = S.pick && S.pick.dElev !== null && Math.abs(S.pick.dElev) >= 300;
    if (far) out.append(el('p', { className: 'wx-note wx-warn', 'data-wx-far': '' }, t('wx.far', { km: whole(S.pick.km) })));
    if (high) out.append(el('p', { className: 'wx-note wx-warn', 'data-wx-high': '' }, t('wx.high', { m: whole(Math.abs(S.pick.dElev)) })));
    return out;
  }
  function chosenBlock() {
    const c = chosen();
    if (!c) return null;
    const m = c.summary, row = (k, v) => [el('dt', {}, t('wx.fact.' + k)), el('dd', { 'data-wx-fact': k }, v)];
    const src = c.set ? c.set.source : null;
    return el('section', { 'data-wx-chosen': c.station.id },
      el('h4', {}, c.station.name),
      c.own ? el('p', { className: 'wx-note' }, t('wx.own.note', { name: S.own.name })) : null,
      el('dl', { className: 'wx-facts' },
        row('winter996', temp(m.heat.t996)), row('winter990', temp(m.heat.t990)), row('summer004', temp(m.cool.t004)), row('summer010', temp(m.cool.t010)),
        row('hdd', t('wx.dd', { c: whole(m.hdd), f: whole(m.hdd * 1.8), base: m.base.toFixed(1), basef: toF(m.base).toFixed(0) })),
        row('cdd', t('wx.dd', { c: whole(m.cdd), f: whole(m.cdd * 1.8), base: m.base.toFixed(1), basef: toF(m.base).toFixed(0) })),
        row('mean', temp(m.mean)), row('ground', temp(m.ground.t) + ' · ' + t('wx.ground.' + m.ground.source)),
        row('hottest', t('wx.month.' + m.cool.date.month) + ' ' + m.cool.date.day)),
      el('p', { className: 'wx-note', 'data-wx-source': m.heat.source }, t('wx.src.' + m.heat.source)),
      src ? el('p', { className: 'wx-note', 'data-wx-credit': '' }, t('wx.credit', { name: src.name, attribution: src.attribution }), ' ', el('a', { href: src.url, target: '_blank', rel: 'noopener' }, t('wx.credit.link'))) : null,
      src ? el('p', { className: 'wx-note' }, src.licence) : null,
      el('div', { className: 'wx-row' },
        el('button', { type: 'button', className: 'btn-line', 'data-wx-act': 'view', disabled: S.busy, onclick: explore }, t('wx.btn.view')),
        ...(host.actions || []).map((a) => el('button', { type: 'button', className: 'btn-line', 'data-wx-act': a.id, disabled: S.busy, onclick: () => act(a) }, a.label)),
        el('button', { type: 'button', className: 'btn-line', 'data-wx-act': 'save', disabled: S.busy, onclick: () => act({ needsYear: true, run: ({ station, year }) => { host.download(String(station.file).replace(/\.gz$/, ''), year, 'text/plain'); return t('wx.saved'); } }) }, t('wx.btn.save'))));
  }
  function draw() {
    const pick = el('input', { type: 'file', accept: '.epw', hidden: true, 'data-wx-own': '', onchange: (ev) => { const f = ev.target.files?.[0]; ev.target.value = ''; ownFile(f); } });
    wrap.replaceChildren(
      el('p', { className: 'wx-note', 'data-wx-notice': '' }, t('wx.notice')),
      placeBlock(), stationsBlock(), chosenBlock(),
      el('div', { className: 'wx-row' }, el('label', { className: 'btn-line' }, t('wx.btn.own'), pick)),
      S.said ? el('p', { className: 'wx-note' + (S.bad ? ' wx-err' : ''), 'data-wx-said': '', role: 'status' }, S.said) : null);
  }

  draw();
  const ready = findPlace().then(loadSets);
  return {
    ready, state: () => ({ ...S, chosen: chosen() }), refresh: () => findPlace().then(again),
    pick(id) { const x = S.near.find((n) => n.station.id === id); if (x) { S.pick = x; S.own = null; draw(); } return !!x; },
    setPlace(lat, lon) { S.place = { lat, lon, elev: null, from: 'typed' }; S.typed = { lat: String(lat), lon: String(lon) }; S.own = null; again(); },
    run: (id) => act((host.actions || []).find((a) => a.id === id)),
    explore, openShared, viewer: () => S.viewer,
    unmount() { if (S.viewer) S.viewer.close(); wrap.remove(); },
  };
}
