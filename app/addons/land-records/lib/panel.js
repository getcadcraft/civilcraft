/* SPDX-License-Identifier: Apache-2.0 */
/**
 * panel.js — the Land records tab (0.11 LR.1-LR.6, LR.9, LR.11): Field walk, Records, Check, Buildings and quantities, Notes on the plan, Place rules,
 * Change parcels, Documents. A DOM file of the library (with
 * walkview.js); it knows no app: everything it reads and writes goes through `host` (the add-on's host.js). Words come through t('lr.…');
 * nothing from a file or a drawing is written as HTML.
 *
 *   mountPanel(root, { t, host, storage, download(name, text, type), packs: [template pack], rulePacks() → [clean rule pack], env }) → { refresh(), unmount(), … }
 *   What the tests and a lab pass drive is on the returned object: saveWalk(walk), walkToDrawing(id, { points, parcel }), openWalkView(),
 *   reconcile(), propose(spec), keep(), apply(), fillDocument(), site(), addNote({ title, text, parcel }), notesFromCheck(), setNote(id, status), notes(),
 *   readIfc(bytes, name, { shift, turn }), modelToMasses(id), markupSet() → { pdf, bcf, file }, readBack(bcf bytes), setPlace(id), placeCheck(),
 *   openRules(text), state().
 */
import { openWalk, WALK_CSS } from './walkview.js';
import { stats, cleanWalk, readGpx, walkFromGpx, writeGpx, walkCsv, walkGeoJSON, isCorner, csvRows } from './walk.js';
import { AREA_UNITS, STATUSES, TENURES, KINDS, recordOf, addRecord, setRecord, removeRecord, recordsCsv, parseRecordsCsv, recordsFromFeatures, landUse, fromM2, toM2 } from './book.js';
import { reconcile, checkLots, toProblems, reconcileCsv } from './reconcile.js';
import { subdivide, consolidate, moveBoundary, designate, schedule, onLine } from './proposal.js';
import { cleanPack, fill, toMarkdown, toHtml, dataFor, BUILT_IN, UNIT_WORDS } from './documents.js';
import { area as ringArea, centroid, pointInRing } from './geo.js';
import { buildingsByParcel, takeoff, quantitiesFile, takeoffCsv } from './site.js';
import { buildingsFromIfc } from './ifcfoot.js';
import { planSheet, toPaper, matchReturn, PT_M } from './plansheet.js';
import { cleanRulePack, resolvePlace, zonesOf, checkPlace, depthFrom, printed, citeOf, zoneKey } from './rules.js';

const NS = 'http://www.w3.org/2000/svg';
function el(tag, props = {}, ...kids) {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (v === undefined || v === null || v === false) continue;
    if (k === 'className') n.className = v; else if (k.startsWith('on') && typeof v === 'function') n.addEventListener(k.slice(2).toLowerCase(), v);
    else if (k === 'value') n.value = v; else n.setAttribute(k, v === true ? '' : String(v));
  }
  for (const c of kids.flat(Infinity)) if (c !== null && c !== undefined && c !== false) n.append(c);
  return n;
}
const CSS = `
.lr-panel{display:grid;grid-template-columns:minmax(0,1fr);gap:.6rem;font-size:.9em}
.lr-panel details{min-width:0}
.lr-panel .btn-line{font-size:.85rem;padding:.25rem .6rem;min-height:0}
.lr-tablebox{overflow-x:auto;max-width:100%}
.lr-panel details{border:1px solid var(--line,#7a8796);border-radius:4px;padding:.3rem .5rem}
.lr-panel summary{cursor:pointer;font-weight:600}
.lr-field{display:grid;gap:.15rem;margin:.3rem 0}
.lr-field input,.lr-field select,.lr-field textarea{width:100%;box-sizing:border-box;background:#fff;color:#111}
.lr-note{opacity:.85;font-size:.9em;margin:.25rem 0}
.lr-warn{color:var(--bad,#b3261e);font-weight:600}
.lr-ok{color:#1b7f3b;font-weight:600}
.lr-table{width:100%;border-collapse:collapse;font-size:.85em;margin:.4rem 0}
.lr-table th,.lr-table td{border-bottom:1px solid var(--line,#7a8796);padding:.15rem .3rem;text-align:left;vertical-align:top}
.lr-table tr.sel td{background:rgba(47,111,218,.15)}
.lr-table tr.bad td{color:var(--bad,#b3261e)}
.lr-table tbody tr[data-id]{cursor:pointer}
.lr-scroll{max-height:16rem;overflow:auto}
.lr-row{display:flex;gap:.4rem;flex-wrap:wrap;align-items:center;margin:.3rem 0}
.lr-two{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:0 .5rem}
.lr-pic{width:100%;height:12rem;border:1px solid var(--line,#7a8796);border-radius:4px;color:var(--ink,#222)}
.lr-pre{white-space:pre-wrap;max-height:18rem;overflow:auto;border:1px solid var(--line,#7a8796);border-radius:4px;padding:.4rem;font-size:.85em;background:#fff;color:#111}
.lr-x{border:0;background:none;color:inherit;cursor:pointer;font-size:1em;padding:0 .3rem;opacity:.7}
` + WALK_CSS;
function ensureStyle() { if (document.getElementById('lr-style')) return; const s = document.createElement('style'); s.id = 'lr-style'; s.textContent = CSS; document.head.append(s); }

const fx = (v, d = 1) => (Number.isFinite(v) ? Number(v).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: d }) : '–');
const HUES = ['#2f6fda', '#d9822b', '#1b7f3b', '#8e44ad', '#c0392b', '#0e8a8a', '#7a6a00', '#555'];

export function mountPanel(root, ctx) {
  const { t, host } = ctx, env = ctx.env || globalThis;
  ensureStyle();
  const store = { get: (k, d) => { try { const v = ctx.storage.get(k); return v === undefined || v === null ? d : v; } catch { return d; } }, set: (k, v) => { try { ctx.storage.set(k, v); } catch { /* private window */ } } };
  let chosen = AREA_UNITS[store.get('unit')] ? store.get('unit') : null, unit = chosen || (host.units() === 'm' ? 'm2' : 'ft2');   // until the person chooses, areas follow the drawing's units
  let lastPlace = null, userRules = [];
  let checkSig = '', selWalk = null, selParcel = null, lastCheck = null, draft = null, selProposal = null, view = null, userPacks = [], filled = null;
  const status = el('p', { className: 'lr-note', role: 'status', 'data-lr-status': '' });
  const say = (m, bad = false) => { status.textContent = m || ''; status.className = 'lr-note' + (bad ? ' lr-warn' : ''); };
  const A = (m2) => fx(fromM2(m2, unit), unit === 'ha' || unit === 'ac' ? 4 : 1) + ' ' + UNIT_WORDS[unit];
  const fold = (id, title, ...kids) => el('details', { 'data-lr-fold': id }, el('summary', {}, title), ...kids);
  const field = (label, input) => el('label', { className: 'lr-field' }, el('span', {}, label), input);
  const btn = (label, fn, attrs = {}) => el('button', { type: 'button', className: 'btn-line', onclick: fn, ...attrs }, label);
  const sel = (options, value, attrs = {}) => { const s = el('select', attrs, ...options.map(([v, l]) => el('option', { value: String(v) }, l))); if (value !== undefined) s.value = String(value); return s; };
  const table = (head, rows, attrs = {}) => el('div', { className: 'lr-tablebox' }, el('table', { className: 'lr-table', ...attrs }, el('thead', {}, el('tr', {}, ...head.map((x) => el('th', {}, x)))),
    el('tbody', {}, ...rows.map((r) => el('tr', { className: r.cls || '', 'data-id': r.id, onclick: r.onclick }, ...r.cells.map((c) => el('td', {}, c === null || c === undefined ? '–' : c)))))));
  const book = () => host.book();
  const parcels = () => host.parcels();
  const k2 = () => host.unitM() ** 2;
  const pickFile = (accept, fn) => { const i = el('input', { type: 'file', accept }); i.onchange = async () => { const f = i.files[0]; if (f) fn(await f.text(), f.name); }; i.click(); };
  const lenFt = () => unit === 'ft2' || unit === 'ac';
  const Lg = (m) => (m === null || m === undefined ? '–' : fx(lenFt() ? m / 0.3048 : m, 2) + (lenFt() ? ' ft' : ' m'));
  /** The street line of a lot (when its zoning names one) and how much of the outline lies on it, in metres. */
  const frontOf = (id, ring) => { const f = host.frontLine(id); return f ? { m: onLine(ring, f[0], f[1], 1e-6) * host.unitM(), line: f } : null; };
  const pickBytes = (accept, fn) => { const i = el('input', { type: 'file', accept }); i.onchange = async () => { const f = i.files[0]; if (f) fn(new Uint8Array(await f.arrayBuffer()), f.name); }; i.click(); };
  const stem = () => (host.name() || 'land').replace(/[^\w .-]+/g, '_').slice(0, 60);

  // ================================================================ Field walk
  const walkBox = el('div'), walkPlace = el('p', { className: 'lr-note' }), trackTol = el('input', { type: 'number', min: '0.5', max: '50', step: '0.5', value: String(store.get('trackTol', 3)) });
  function saveWalk(walk) {
    if (!walk || !walk.points.length) return null;
    let id = null;
    const done = host.change(t('lr.undo.walk'), ({ book: b }) => {
      const i = walk.id ? b.walks.findIndex((x) => x.id === walk.id) : -1;
      if (i >= 0) b.walks[i] = walk; else { walk.id = 'lw' + b.seq++; b.walks.push(walk); }
      id = walk.id;
    });
    if (!done) { say(t('lr.err.change'), true); return null; }
    selWalk = id; const st = stats(walk);
    say(t('lr.walk.saved', { name: walk.name, n: walk.points.length }) + (st.corners >= 3 ? ' ' + t('lr.walk.area', { area: A(st.area), sigma: st.areaSigma === null ? t('lr.unknown') : A(st.areaSigma) }) : ''));
    return id;
  }
  function openWalkView(given = null) {
    if (view) return view;
    const b = book();
    view = openWalk(document.body, { t, env, settings: b.settings, name: t('lr.walk.default', { n: b.walks.length + 1 }), walk: given, onDone: (w) => { view = null; if (w) saveWalk(w); refresh(); } });
    return view;
  }
  function openWalkFile(text, name) {
    let walk = null;
    if (/^\s*</.test(text)) {
      const g = readGpx(text); if (!g.ok) return say(t('lr.err.gpx.' + g.why), true);
      walk = walkFromGpx(g, { name: name.replace(/\.[^.]+$/, ''), tol: Number(trackTol.value) || 3 });
      if (!walk.points.length) return say(t('lr.err.gpx.empty'), true);
    } else {
      let o; try { o = JSON.parse(text); } catch { return say(t('lr.err.walkfile'), true); }
      const c = cleanWalk(o); if (!c.ok) return say(t('lr.err.walk.' + c.why), true);
      walk = c.walk;
    }
    saveWalk(walk); refresh();
  }
  async function walkToDrawing(id, { points = true, parcel = true } = {}) {
    const w = book().walks.find((x) => x.id === id); if (!w) return false;
    const first = w.points.find(isCorner) || w.points[0];
    const pl = await host.placer(first, host.anchor());
    const corners = w.points.filter(isCorner), st = stats(w);
    const made = { points: 0, parcel: null };
    const ok = host.change(t('lr.undo.todrawing'), (tools) => {
      if (points) made.points = tools.addPoints(w.points.map((p) => ({ ...pl.toXY(p.lat, p.lon), z: pl.zOf(p.alt), d: 'WALK ' + p.code + (p.acc !== null ? ' +/-' + fx(p.acc, 1) + 'm' : '') }))).length;
      if (parcel && corners.length >= 3) {
        made.parcel = tools.addParcel(w.name, corners.map((p) => pl.toXY(p.lat, p.lon)));
        addRecord(tools.book, { parcel: made.parcel, status: 'walked', source: t('lr.walk.source', { date: w.started ? new Date(w.started).toISOString().slice(0, 10) : '', acc: st.worst === null ? t('lr.unknown') : fx(st.worst, 1) + ' m' }) });
      }
    }, { points });
    if (!ok) { say(t('lr.err.change'), true); return false; }
    say(t(pl.kind === 'crs' ? 'lr.walk.placed.crs' : 'lr.walk.placed.local', { n: made.points, crs: pl.name }) + (made.parcel ? ' ' + t('lr.walk.parcel', { name: w.name }) : ''));
    if (made.parcel) { selParcel = made.parcel; host.select(made.parcel); }
    return made;
  }
  const walkOf = () => book().walks.find((x) => x.id === selWalk) || null;
  const withWalk = (fn) => () => { const w = walkOf(); if (!w) return say(t('lr.walk.pick'), true); return fn(w); };
  function drawWalks() {
    const b = book();
    walkPlace.textContent = host.hasCrs() ? t('lr.place.crs', { crs: host.crsName() }) : t('lr.place.local');
    if (selWalk && !b.walks.some((w) => w.id === selWalk)) selWalk = null;
    walkBox.replaceChildren(b.walks.length ? table([t('lr.col.walk'), t('lr.col.points'), t('lr.col.area'), t('lr.col.worst')], b.walks.map((w) => {
      const st = stats(w);
      return { id: w.id, cls: w.id === selWalk ? 'sel' : '', onclick: () => { selWalk = w.id; drawWalks(); },
        cells: [w.name, st.points, st.corners >= 3 ? A(st.area) + (st.areaSigma === null ? '' : ' ± ' + A(st.areaSigma)) : '–', st.worst === null ? t('lr.unknown') : fx(st.worst, 1) + ' m'] };
    }), { 'data-lr-walks': '' }) : el('p', { className: 'lr-note' }, t('lr.walk.none')));
  }
  const walkFold = fold('walk', t('lr.sec.walk'),
    el('p', { className: 'lr-note' }, t('lr.walk.help')), walkPlace,
    el('div', { className: 'lr-row' }, btn(t('lr.walk.start'), () => openWalkView(), { 'data-lr-start': '' }), btn(t('lr.walk.open'), () => pickFile('.json,.gpx,.xml,application/json,application/gpx+xml', openWalkFile))),
    field(t('lr.walk.tol'), trackTol), walkBox,
    el('div', { className: 'lr-row' },
      btn(t('lr.walk.todrawing'), withWalk((w) => walkToDrawing(w.id, { points: true, parcel: true }).then(refresh))),
      btn(t('lr.walk.pointsonly'), withWalk((w) => walkToDrawing(w.id, { points: true, parcel: false }).then(refresh))),
      btn(t('lr.walk.continue'), withWalk((w) => openWalkView(w)))),
    el('div', { className: 'lr-row' },
      btn(t('lr.save.json'), withWalk((w) => ctx.download(w.name + '.fieldwalk.json', JSON.stringify(w, null, 1), 'application/json'))),
      btn(t('lr.save.gpx'), withWalk((w) => ctx.download(w.name + '.gpx', writeGpx(w), 'application/gpx+xml'))),
      btn(t('lr.save.csv'), withWalk((w) => ctx.download(w.name + '.csv', '﻿' + walkCsv(w), 'text/csv'))),
      btn(t('lr.save.geojson'), withWalk((w) => ctx.download(w.name + '.geojson', JSON.stringify(walkGeoJSON(w)), 'application/geo+json'))),
      btn(t('lr.remove'), withWalk((w) => { host.change(t('lr.undo.walk.remove'), ({ book: b }) => { b.walks = b.walks.filter((x) => x.id !== w.id); }); selWalk = null; refresh(); }))));
  trackTol.onchange = () => store.set('trackTol', Number(trackTol.value) || 3);

  // ================================================================ Records
  const recBox = el('div', { className: 'lr-scroll' }), recForm = el('div'), useBox = el('div'), gisBox = el('div');
  const unitSel = sel(Object.keys(AREA_UNITS).map((u) => [u, UNIT_WORDS[u]]), unit, { 'data-lr-unit': '' });
  unitSel.onchange = () => { chosen = unit = unitSel.value; store.set('unit', unit); refresh(); };
  const F = {};
  function recordForm() {
    const p = parcels().find((x) => x.id === selParcel), b = book(), r = p ? recordOf(b, p.id) : null;
    if (!p) { recForm.replaceChildren(el('p', { className: 'lr-note' }, t('lr.rec.pick'))); return; }
    const txt = (k, max) => (F[k] = el('input', { type: 'text', maxlength: String(max), value: r ? r[k] : '', 'data-lr-f': k }));
    F.recordArea = el('input', { type: 'number', min: '0', step: 'any', value: r && r.recordArea !== null ? String(r.recordArea) : '', 'data-lr-f': 'recordArea' });
    F.areaUnit = sel(Object.keys(AREA_UNITS).map((u) => [u, UNIT_WORDS[u]]), r ? r.areaUnit : unit);
    F.status = sel(STATUSES.map((s) => [s, t('lr.status.' + s)]), r ? r.status : 'draft');
    F.tenure = el('input', { type: 'text', maxlength: '40', value: r ? r.tenure : '', list: 'lr-tenures' });
    F.notes = el('textarea', { rows: '2', maxlength: '2000' }); F.notes.value = r ? r.notes : '';
    const save = () => {
      const fields = { parcel: p.id, ref: F.ref.value, holder: F.holder.value, tenure: F.tenure.value, use: F.use.value, zone: F.zone.value, recordArea: F.recordArea.value === '' ? null : Number(F.recordArea.value), areaUnit: F.areaUnit.value, source: F.source.value, status: F.status.value, notes: F.notes.value };
      host.change(t('lr.undo.record'), ({ book: bk }) => { const cur = recordOf(bk, p.id); if (cur) setRecord(bk, cur.id, fields); else addRecord(bk, fields); });
      say(t('lr.rec.saved', { name: p.name })); refresh();
    };
    recForm.replaceChildren(el('p', {}, el('strong', {}, p.name), ' ', A(p.area * k2()), p.curved ? ' ' + t('lr.rec.curved') : ''),
      el('div', { className: 'lr-two' }, field(t('lr.f.ref'), txt('ref', 80)), field(t('lr.f.holder'), txt('holder', 160)), field(t('lr.f.use'), txt('use', 80)), field(t('lr.f.zone'), txt('zone', 80)),
        field(t('lr.f.recordarea'), F.recordArea), field(t('lr.f.areaunit'), F.areaUnit), field(t('lr.f.tenure'), F.tenure), field(t('lr.f.status'), F.status)),
      el('datalist', { id: 'lr-tenures' }, ...TENURES.filter(Boolean).map((x) => el('option', { value: x }))),
      el('datalist', { id: 'lr-zones' }, ...(placeNow() ? zonesOf(placeNow()).map((z) => el('option', { value: z.zone }, z.zoneName)) : [])),
      field(t('lr.f.source'), txt('source', 200)), field(t('lr.f.notes'), F.notes),
      el('div', { className: 'lr-row' }, btn(r ? t('lr.rec.save') : t('lr.rec.add'), save, { 'data-lr-recsave': '' }),
        r && btn(t('lr.rec.remove'), () => { host.change(t('lr.undo.record.remove'), ({ book: bk }) => removeRecord(bk, r.id)); refresh(); })));
    F.zone.setAttribute('list', 'lr-zones');   // the zones of the place's rules, when a rule pack is chosen (free text stays allowed)
  }
  function drawRecords() {
    const b = book(), ps = parcels();
    if (selParcel && !ps.some((p) => p.id === selParcel)) selParcel = null;
    recBox.replaceChildren(ps.length ? table([t('lr.col.parcel'), t('lr.f.ref'), t('lr.f.holder'), t('lr.f.use'), t('lr.col.drawn'), t('lr.col.record'), t('lr.f.status')], ps.map((p) => {
      const r = recordOf(b, p.id);
      return { id: p.id, cls: p.id === selParcel ? 'sel' : '', onclick: () => { selParcel = p.id; host.select(p.id); drawRecords(); },
        cells: [p.name, r?.ref || '', r?.holder || '', [r?.use, r?.zone].filter(Boolean).join(' / '), A(p.area * k2()), r && r.recordArea !== null ? A(toM2(r.recordArea, r.areaUnit)) : '–', r ? t('lr.status.' + r.status) : t('lr.rec.norecord')] };
    }), { 'data-lr-records': '' }) : el('p', { className: 'lr-note' }, t('lr.rec.noparcels')));
    recordForm();
    const lu = landUse(b, ps.map((p) => ({ id: p.id, areaM2: p.area * k2() })));
    useBox.replaceChildren(lu.length ? table([t('lr.f.use'), t('lr.f.zone'), t('lr.col.lots'), t('lr.col.area'), t('lr.col.share')], lu.map((r) => ({ cells: [r.use || t('lr.none'), r.zone || t('lr.none'), r.lots, A(r.area), fx(r.share * 100, 1) + ' %'] })), { 'data-lr-landuse': '' }) : '');
    // records from a GIS polygon layer
    const layers = host.gisLayers();
    if (!layers.length) { gisBox.replaceChildren(el('p', { className: 'lr-note' }, t('lr.gis.none'))); return; }
    const lay = sel(layers.map((l) => [l.id, l.name + ' (' + l.count + ')']), layers[0].id);
    const maps = {}, mapRow = el('div', { className: 'lr-two' });
    const fillMaps = () => {
      const l = layers.find((x) => x.id === lay.value), opts = [['', t('lr.none')], ...l.fields.map((f) => [f, f])];
      const guess = (re) => l.fields.find((f) => re.test(f)) || '';
      mapRow.replaceChildren(...[['ref', /^(apn|pin|parcel|lot|ref|id)/i], ['holder', /^(owner|holder)/i], ['use', /^(land_?use|use)/i], ['zone', /^zon/i], ['area', /^(area|acre|shape_area)/i]].map(([k, re]) => field(t('lr.gis.' + k), (maps[k] = sel(opts, guess(re))))),
        field(t('lr.f.areaunit'), (maps.areaUnit = sel(Object.keys(AREA_UNITS).map((u) => [u, UNIT_WORDS[u]]), unit))));
    };
    lay.onchange = fillMaps; fillMaps();
    gisBox.replaceChildren(field(t('lr.gis.layer'), lay), mapRow, btn(t('lr.gis.make'), () => {
      const feats = recordsFromFeatures(host.gisPolygons(lay.value), Object.fromEntries(Object.entries(maps).map(([k, s]) => [k, s.value])));
      if (!feats.length) return say(t('lr.gis.empty'), true);
      host.change(t('lr.undo.gis'), (tools) => { feats.forEach((f, i) => { const id = tools.addParcel(f.fields.ref || t('lr.gis.lot', { n: i + 1 }), f.ring); addRecord(tools.book, { ...f.fields, parcel: id, status: 'draft', source: t('lr.gis.source', { layer: layers.find((x) => x.id === lay.value).name }) }); }); });
      say(t('lr.gis.made', { n: feats.length })); refresh();
    }));
  }
  function importCsv(text) {
    const r = parseRecordsCsv(text);
    if (!r.rows.length) return say(t('lr.csv.none', { n: r.errors.length }), true);
    const byName = new Map(parcels().map((p) => [p.name.toLowerCase(), p.id]));
    let attached = 0;
    host.change(t('lr.undo.csv'), ({ book: bk }) => {
      for (const row of r.rows) {
        const pid = byName.get(String(row.parcelName || row.ref).toLowerCase()) || null, cur = pid ? recordOf(bk, pid) : null;
        if (pid) attached++;
        if (cur) setRecord(bk, cur.id, { ...row, parcel: pid }); else addRecord(bk, { ...row, parcel: pid });
      }
    });
    say(t('lr.csv.done', { n: r.rows.length, attached, bad: r.errors.length })); refresh();
  }
  const recFold = fold('records', t('lr.sec.records'),
    el('p', { className: 'lr-note' }, t('lr.rec.help')), field(t('lr.f.showin'), unitSel), recBox, recForm,
    el('div', { className: 'lr-row' }, btn(t('lr.csv.open'), () => pickFile('.csv,.txt,text/csv', importCsv)),
      btn(t('lr.csv.save'), () => { const names = new Map(parcels().map((p) => [p.id, p.name])); ctx.download(stem() + ' - land records.csv', '﻿' + recordsCsv(book(), (id) => names.get(id) || ''), 'text/csv'); })),
    el('h4', {}, t('lr.use.title')), el('p', { className: 'lr-note' }, t('lr.use.help')), useBox,
    btn(t('lr.use.save'), () => { const lu = landUse(book(), parcels().map((p) => ({ id: p.id, areaM2: p.area * k2() }))); ctx.download(stem() + ' - land by designation.csv', '﻿' + csvRows([['use', 'zone', 'lots', 'area_m2', 'share_percent'], ...lu.map((r) => [r.use, r.zone, r.lots, Number(r.area.toFixed(2)), Number((r.share * 100).toFixed(2))])]), 'text/csv'); }),
    el('h4', {}, t('lr.gis.title')), gisBox);

  // ================================================================ Check
  const tolPct = el('input', { type: 'number', min: '0', max: '100', step: '0.1', 'data-lr-tolpct': '' }), tolGap = el('input', { type: 'number', min: '0', max: '1000', step: '0.01', 'data-lr-tolgap': '' }), checkBox = el('div');
  const nameOf = (id) => parcels().find((p) => p.id === id)?.name || id || '';
  const issueWords = (code, x) => t('lr.issue.' + code, { a: nameOf(x.parcel), b: nameOf(x.other), ref: x.ref || '', area: x.value !== undefined ? A(Math.abs(x.value)) : '', pct: x.pct !== undefined && x.pct !== null ? fx(Math.abs(x.pct) * 100, 2) : '', m: x.value !== undefined ? fx(x.value, 2) : '', n: x.count || '', more: x.value > 0 ? t('lr.more') : t('lr.less') });
  const sigNow = () => { const b = book(); return JSON.stringify([parcels().map((p) => [p.id, p.name, p.area, p.ring.length]), b.records, b.settings]); };
  function runCheck() {
    const b = book(), want = { areaTolPct: Number(tolPct.value), gapTol: Number(tolGap.value) };
    if (Number.isFinite(want.areaTolPct) && Number.isFinite(want.gapTol) && (want.areaTolPct !== b.settings.areaTolPct || want.gapTol !== b.settings.gapTol)) host.change(t('lr.undo.settings'), ({ book: bk }) => { Object.assign(bk.settings, want); });
    lastCheck = reconcile(book(), parcels(), { unitM: host.unitM() }); checkSig = sigNow();
    try { host.problems.set(toProblems(lastCheck.issues.filter((x) => x.severity === 'warning'), issueWords)); } catch { /* a build without Problems */ }
    drawCheck(); return lastCheck;
  }
  function drawCheck() {
    const b = book(); tolPct.value = String(b.settings.areaTolPct); tolGap.value = String(b.settings.gapTol);
    if (!lastCheck) { checkBox.replaceChildren(); return; }
    const r = lastCheck, tt = r.totals;
    checkBox.replaceChildren(
      sigNow() !== checkSig ? el('p', { className: 'lr-warn', 'data-lr-stale': '' }, t('lr.check.stale')) : '',
      el('p', { className: tt.outside || r.issues.some((x) => x.severity === 'warning') ? 'lr-warn' : 'lr-ok', 'data-lr-verdict': '' }, t('lr.check.summary', { n: tt.parcels, compared: tt.compared, outside: tt.outside, issues: r.issues.filter((x) => x.severity === 'warning').length })),
      table([t('lr.col.parcel'), t('lr.col.drawn'), t('lr.col.record'), t('lr.col.diff'), ''], r.rows.map((x) => ({ id: x.parcel, cls: x.ok === false ? 'bad' : '', onclick: () => host.select(x.parcel),
        cells: [x.name, A(x.drawnM2), x.recordM2 === null ? '–' : A(x.recordM2), x.diffM2 === null ? '–' : (x.diffM2 > 0 ? '+' : '') + A(x.diffM2) + ' (' + fx(x.pct * 100, 2) + ' %)', x.ok === null ? t('lr.check.notcompared') : x.ok ? t('lr.check.within') : t('lr.check.outside')] })), { 'data-lr-check': '' }),
      r.issues.length ? el('ul', { 'data-lr-issues': '' }, ...r.issues.map((x) => el('li', { className: x.severity === 'warning' ? 'lr-warn' : '' }, issueWords(x.code, x)))) : el('p', { className: 'lr-note' }, t('lr.check.noissues')),
      tt.capped ? el('p', { className: 'lr-warn' }, t('lr.check.capped')) : '',
      btn(t('lr.check.save'), () => ctx.download(stem() + ' - drawing against record.csv', '﻿' + reconcileCsv(lastCheck, unit), 'text/csv')));
  }
  const checkFold = fold('check', t('lr.sec.check'), el('p', { className: 'lr-note' }, t('lr.check.help')),
    el('div', { className: 'lr-two' }, field(t('lr.check.tolpct'), tolPct), field(t('lr.check.tolgap'), tolGap)), btn(t('lr.check.run'), () => runCheck(), { 'data-lr-run': '' }), checkBox);

  // ================================================================ Buildings and quantities (LR.11: the BIM link and the takeoff)
  const siteBox = el('div');
  function siteNow() {
    const ps = parcels(), um = host.unitM();
    const fromModels = (book().models || []).flatMap((m) => m.buildings.map((b, i) => ({ id: m.id + ':' + i, name: b.name, use: '', ring: b.pts, floors: b.floors, height: b.height, gfa: b.gfa })));
    const site = buildingsByParcel(ps, [...(host.buildings ? host.buildings() : []), ...fromModels], { unitM: um });
    const tk = takeoff(ps, book(), site, { unitM: um, frontage: (id) => { const p = ps.find((x) => x.id === id), f = p && frontOf(id, p.ring); return f ? f.m : null; } });
    return { site, tk };
  }
  // buildings straight from an IFC model (LR.16): read with the host's own IFC reader, kept as outlines with the drawing
  const I = { e: el('input', { type: 'number', step: 'any', value: '0', 'data-lr-ifc-e': '' }), n: el('input', { type: 'number', step: 'any', value: '0', 'data-lr-ifc-n': '' }), turn: el('input', { type: 'number', step: 'any', min: '-360', max: '360', value: '0' }) };
  const modelBox = el('div');
  async function readIfc(bytes, name, { shift = null, turn = null } = {}) {
    if (!host.ifcDeps) { say(t('lr.ifc.err.read'), true); return null; }
    say(t('lr.ifc.reading'));
    let r; try { r = buildingsFromIfc(bytes, await host.ifcDeps(), { unitM: host.unitM(), shift: shift || { x: Number(I.e.value) || 0, y: Number(I.n.value) || 0 }, turn: turn === null ? Number(I.turn.value) || 0 : turn }); } catch { r = { ok: false, why: 'read' }; }
    if (!r.ok) { say(t('lr.ifc.err.' + r.why), true); return null; }
    let id = null;
    const done = host.change(t('lr.undo.ifc'), ({ book: b }) => { id = 'lm' + b.seq++; b.models.push({ id, name: String(name || 'model.ifc').slice(0, 160), cell: r.cell * host.unitM(), georef: r.georef, added: Date.now(), buildings: r.buildings.map((x) => ({ name: x.name, pts: x.ring, floors: x.floors, height: x.height, gfa: x.gfa, gfaFrom: x.gfaFrom })) }); });
    if (!done) { say(t('lr.err.change'), true); return null; }
    say(t('lr.ifc.read', { n: r.buildings.length, name, cell: fx(r.cell * host.unitM() * 100, 0) }) + ' ' + r.notes.map((c) => t('lr.ifc.note.' + c)).join(' ')); refresh();
    return { id, ...r };
  }
  const removeModel = (id) => { host.change(t('lr.undo.ifc.remove'), ({ book: b }) => { b.models = b.models.filter((m) => m.id !== id); }); refresh(); };
  /** The model's buildings as the host's own building masses (they then show on the plan); the model's outlines go, so nothing is counted twice. */
  function modelToMasses(id) {
    const m = (book().models || []).find((x) => x.id === id); if (!m) return 0; let made = 0;
    host.change(t('lr.undo.ifc.masses'), (tools) => { for (const b of m.buildings) if (tools.addMass({ name: b.name, ring: b.pts, floors: b.floors, height: b.height })) made++; tools.book.models = tools.book.models.filter((x) => x.id !== id); });
    say(t('lr.ifc.masses', { n: made })); refresh(); return made;
  }
  function drawModels() {
    const ms = book().models || [];
    modelBox.replaceChildren(ms.length ? table([t('lr.ifc.model'), t('lr.site.buildings'), t('lr.ifc.floorfrom'), t('lr.ifc.cell'), '', ''], ms.map((m) => ({ cells: [m.name + (m.georef ? '' : ' ' + t('lr.ifc.local')), m.buildings.length, [...new Set(m.buildings.map((b) => t('lr.ifc.gfa.' + b.gfaFrom)))].join(', '), fx(m.cell * 100, 0) + ' cm',
      el('button', { type: 'button', className: 'btn-line', onclick: () => modelToMasses(m.id) }, t('lr.ifc.tomasses')), el('button', { type: 'button', className: 'lr-x', title: t('lr.remove'), 'aria-label': t('lr.remove'), onclick: () => removeModel(m.id) }, '×')] })), { 'data-lr-models': '' }) : '');
  }
  const pc = (v) => fx(v * 100, 1) + ' %';
  function drawSite() {
    const { site, tk } = siteNow(), tt = tk.totals;
    if (!tk.lots.length) { siteBox.replaceChildren(el('p', { className: 'lr-note' }, t('lr.rec.noparcels'))); return; }
    const by = new Map(site.rows.map((r) => [r.parcel, r]));
    siteBox.replaceChildren(
      table([t('lr.col.parcel'), t('lr.col.area'), t('lr.site.outline'), t('lr.site.frontage'), t('lr.site.buildings'), t('lr.site.footprint'), t('lr.site.gfa'), t('lr.site.coverage'), t('lr.site.far')], tk.lots.map((x) => { const r = by.get(x.parcel);
        return { id: x.parcel, onclick: () => host.select(x.parcel), cells: [x.name, A(x.areaM2), Lg(x.perimeterM), x.frontageM === null ? t('lr.site.nofront') : Lg(x.frontageM), x.buildings, x.buildings ? A(x.footprintM2) : '–', x.buildings ? A(x.gfaM2) : '–', x.buildings ? pc(r.coverage) : '–', x.buildings ? fx(r.far, 2) : '–'] }; }), { 'data-lr-takeoff': '' }),
      el('p', { 'data-lr-totals': '' }, t('lr.site.totals', { lots: tt.lots, area: A(tt.areaM2), boundary: Lg(tt.boundaryM), shared: Lg(tt.sharedM), corners: tt.corners })),
      tt.capped ? el('p', { className: 'lr-warn' }, t('lr.check.capped')) : '',
      site.list.length ? table([t('lr.site.building'), t('lr.col.parcel'), t('lr.site.footprint'), t('lr.site.floors'), t('lr.site.height'), t('lr.site.gfa'), ''], site.list.map((b) => ({ cls: b.state === 'inside' ? '' : 'bad',
        cells: [b.name || b.id, b.parcelName || '–', A(b.footprintM2), b.floors, b.heightM ? Lg(b.heightM) : '–', A(b.gfaM2), b.state === 'inside' ? '' : b.state === 'straddles' ? t('lr.site.straddles', { pct: fx(b.share * 100, 1) }) : t('lr.site.outside')] })), { 'data-lr-buildings': '' })
        : el('p', { className: 'lr-note', 'data-lr-nobuildings': '' }, t('lr.site.none')),
      el('div', { className: 'lr-row' },
        btn(t('lr.site.save.qty'), () => ctx.download(stem() + '.quantities.json', JSON.stringify(quantitiesFile(tk, { project: host.name(), made: new Date().toISOString().replace(/\.\d+Z$/, 'Z'), units: host.units(), words: (k, v) => t('lr.' + k, v) }), null, 1), 'application/json'), { 'data-lr-qty': '' }),
        btn(t('lr.site.save.csv'), () => ctx.download(stem() + ' - takeoff.csv', '﻿' + takeoffCsv(tk), 'text/csv'))));
  }
  const siteFold = fold('site', t('lr.sec.site'), el('p', { className: 'lr-note' }, t('lr.site.help')), siteBox,
    el('h4', {}, t('lr.ifc.title')), el('p', { className: 'lr-note' }, t('lr.ifc.help')), modelBox,
    el('div', { className: 'lr-two' }, field(t('lr.ifc.e'), I.e), field(t('lr.ifc.n'), I.n), field(t('lr.ifc.turn'), I.turn)),
    btn(t('lr.ifc.open'), () => pickBytes('.ifc,application/x-step', (bytes, name) => readIfc(bytes, name)), { 'data-lr-ifc': '' }));

  // ================================================================ Notes on the plan (LR.11: markup; a note is one of the host's own issues)
  const noteBox = el('div'), N = { title: el('input', { type: 'text', maxlength: '200', 'data-lr-notetitle': '' }), text: el('textarea', { rows: '2', maxlength: '4000' }) };
  const parcelAt = (x, y) => parcels().find((p) => pointInRing({ x, y }, p.ring))?.id || null;
  const notesNow = () => (host.notes ? host.notes() : []).map((n) => ({ ...n, parcel: n.parcel && parcels().some((p) => p.id === n.parcel) ? n.parcel : parcelAt(n.x, n.y) }));
  function addNote({ title, text = '', parcel }) {
    const p = parcels().find((x) => x.id === parcel);
    if (!p) { say(t('lr.note.pick'), true); return null; }
    if (!String(title || '').trim()) { say(t('lr.note.notitle'), true); return null; }
    const c = centroid(p.ring); let id = null;
    host.change(t('lr.undo.note'), (tools) => { id = tools.addNote({ title, text, x: c.x, y: c.y, parcel: p.id, parcelName: p.name }); });
    if (!id) { say(t('lr.err.change'), true); return null; }
    say(t('lr.note.added', { name: p.name })); return id;
  }
  /** One note for every warning of the last check that has none yet: the finding stays on the plan when the check is run again. */
  function notesFromCheck() {
    if (!lastCheck) { say(t('lr.note.nocheck'), true); return 0; }
    const have = new Set(notesNow().filter((n) => n.status !== 'closed').map((n) => n.title)), ps = parcels(); let made = 0;
    const todo = lastCheck.issues.filter((x) => x.severity === 'warning').map((x) => { const p = ps.find((q) => q.id === x.parcel), at = x.at || (p ? centroid(p.ring) : null); return at ? { title: issueWords(x.code, x).slice(0, 200), at, p } : null; }).filter((x) => x && !have.has(x.title));
    if (!todo.length) { say(t('lr.note.nonew')); return 0; }
    host.change(t('lr.undo.note'), (tools) => { for (const x of todo) if (tools.addNote({ title: x.title, text: t('lr.note.fromcheck'), x: x.at.x, y: x.at.y, parcel: x.p ? x.p.id : null, parcelName: x.p ? x.p.name : '' })) made++; });
    say(t('lr.note.made', { n: made })); return made;
  }
  /** The parcel plan as a PDF and the open notes as a BCF file placed on that sheet: what MarkupCraft opens (LR.16). */
  async function markupSet() {
    const ps = parcels(), list = notesNow().filter((n) => n.status !== 'closed'), { site } = siteNow();
    const file = stem() + ' - parcel plan.pdf';
    const all = [...(host.buildings ? host.buildings() : []), ...(book().models || []).flatMap((m) => m.buildings.map((b) => ({ ring: b.pts })))];
    const sheet = planSheet({ title: t('lr.mk.sheet', { name: host.name() || t('lr.mk.untitled') }), sub: t('lr.mk.sub', { date: new Date().toISOString().slice(0, 10), lots: ps.length, notes: list.length }), parcels: ps, buildings: all, notes: list.map((n, i) => ({ n: i + 1, x: n.x, y: n.y })), unitM: host.unitM() });
    void site;
    if (!sheet.ok) { say(t('lr.mk.empty'), true); return null; }
    host.change(t('lr.undo.sheet'), ({ book: b }) => { b.sheet = { file, ...sheet.map }; });
    let bcf = null;
    if (list.length && host.notesBcf) { try { bcf = await host.notesBcf(list.map((n) => n.id), { file, place: (x, y) => { const [u, v] = toPaper(sheet.map, x, y); return [u * PT_M, v * PT_M]; } }); } catch { bcf = null; } }
    return { file, pdf: sheet.bytes, bcf, bcfName: stem() + ' - notes.bcfzip', scale: sheet.scale, notes: list.length };
  }
  async function saveMarkupSet(open) {
    const m = await markupSet(); if (!m) return null;
    const url = open && host.appUrl ? host.appUrl('markupcraft') : '';
    let sent = false;
    if (url && host.send) { try { await host.send(url, new File([m.pdf], m.file, { type: 'application/pdf' })); sent = true; } catch { sent = false; } }
    if (!sent) ctx.download(m.file, m.pdf, 'application/pdf');
    if (m.bcf) ctx.download(m.bcfName, m.bcf, 'application/octet-stream');
    say(t(sent ? 'lr.mk.sent' : 'lr.mk.saved', { scale: m.scale.toLocaleString('en-US'), n: m.notes }) + (m.notes ? ' ' + t('lr.mk.thenbcf') : ''));
    return m;
  }
  /** A marked-up set read back: a note that is still where it was sent takes its new status and comments; a note added on the sheet becomes a note on the plan. */
  async function readBack(bytes) {
    const sheet = book().sheet;
    if (!sheet) { say(t('lr.mk.nosheet'), true); return null; }
    let topics; try { topics = await host.readBcf(bytes); } catch { say(t('lr.mk.err.bcf'), true); return null; }
    const r = matchReturn(topics, notesNow().map((n) => ({ id: n.id, title: n.title, status: n.status, x: n.x, y: n.y, comments: n.said || [] })), sheet);
    if (r.updates.length || r.adds.length) host.change(t('lr.undo.readback'), (tools) => {
      for (const u of r.updates) { if (u.status) tools.setNote(u.id, u.status); if (u.comments.length) tools.noteComments(u.id, u.comments); }
      for (const a of r.adds) { const pid = parcelAt(a.x, a.y); tools.addNote({ title: a.title, text: a.text, x: a.x, y: a.y, parcel: pid, parcelName: pid ? nameOf(pid) : '', status: a.status, comments: a.comments }); }
    });
    say(t('lr.mk.back', { updated: r.updates.length, added: r.adds.length, unplaced: r.unplaced })); refresh();
    return r;
  }
  const setNote = (id, status) => host.change(t('lr.undo.note.status'), (tools) => { tools.setNote(id, status); });
  function drawNotes() {
    const list = notesNow(), p = parcels().find((x) => x.id === selParcel), states = host.noteStates || ['open', 'closed'];
    noteBox.replaceChildren(
      list.length ? table([t('lr.col.parcel'), t('lr.note.col'), t('lr.f.status')], list.map((n) => { const s = sel(states.map((x) => [x, t('lr.nstatus.' + x)]), n.status, { 'aria-label': t('lr.f.status') }); s.onclick = (e) => e.stopPropagation(); s.onchange = () => { setNote(n.id, s.value); };
        return { id: n.id, onclick: () => { if (n.parcel) host.select(n.parcel); }, cells: [n.parcel ? nameOf(n.parcel) : t('lr.note.nolot'), el('span', {}, el('strong', {}, n.title), n.text ? ' — ' + n.text : ''), s] }; }), { 'data-lr-notes': '' }) : el('p', { className: 'lr-note' }, t('lr.note.none')),
      el('p', {}, p ? t('lr.note.on', { name: p.name }) : t('lr.note.pick')),
      field(t('lr.note.title'), N.title), field(t('lr.note.text'), N.text),
      el('div', { className: 'lr-row' }, btn(t('lr.note.add'), () => { if (addNote({ title: N.title.value, text: N.text.value, parcel: selParcel })) { N.title.value = ''; N.text.value = ''; } }, { 'data-lr-noteadd': '' }),
        btn(t('lr.note.check'), () => notesFromCheck())),
      el('h4', {}, t('lr.mk.title')), el('p', { className: 'lr-note' }, t('lr.mk.help')),
      el('div', { className: 'lr-row' }, btn(t('lr.mk.open'), () => saveMarkupSet(true), { 'data-lr-mkopen': '' }), btn(t('lr.mk.save'), () => saveMarkupSet(false), { 'data-lr-mksave': '' }),
        btn(t('lr.mk.read'), () => pickBytes('.bcf,.bcfzip,application/zip', (bytes) => readBack(bytes)))));
  }
  const noteFold = fold('notes', t('lr.sec.notes'), el('p', { className: 'lr-note' }, t('lr.note.help')), noteBox);

  // ================================================================ Place rules (LR.9: a place's lot minimums, figures and forms, as cited data)
  const placeBox = el('div'), placeSel = el('select', { 'data-lr-place': '' });
  const placePacks = () => { const seen = new Set(); return [...(ctx.rulePacks ? ctx.rulePacks() : []), ...userRules].filter((x) => x && !seen.has(x.id) && seen.add(x.id)); };
  const placeNow = () => { const id = book().place, all = placePacks(); return id ? resolvePlace(all.find((x) => x.id === id) || null, all) : null; };
  function setPlace(id) {
    if ((book().place || '') === (id || '')) return true;
    lastPlace = null;
    return host.change(t('lr.undo.place'), ({ book: b }) => { b.place = placePacks().some((x) => x.id === id) ? id : ''; });
  }
  function openRules(text) {
    let o; try { o = JSON.parse(text); } catch { say(t('lr.place.err.file'), true); return null; }
    const c = cleanRulePack(o); if (!c.ok) { say(t('lr.place.err.file'), true); return null; }
    userRules = userRules.filter((x) => x.id !== c.pack.id); userRules.push(c.pack); setPlace(c.pack.id); refresh();
    say(t('lr.place.opened', { name: c.pack.name, n: c.pack.rules.length })); return c.pack;
  }
  const placeLots = () => { const b = book(), um = host.unitM(), kk = k2(); return parcels().map((p) => { const r = recordOf(b, p.id), f = frontOf(p.id, p.ring); return { name: p.name, zone: r?.zone || '', areaM2: p.area * kk, widthM: f ? f.m : null, depthM: f ? depthFrom(p.ring, f.line[0], f.line[1]) * um : null }; }); };
  /** The lots a proposal would make, measured the same way: the street line is the parents' (a lot that has none of it has no width to compare). */
  const placeDraftLots = (p) => { const um = host.unitM(), kk = k2(), fronts = (p.parents || []).map((id) => host.frontLine(id)).filter(Boolean);
    return p.children.map((c) => ({ name: c.name, zone: c.zone, areaM2: ringArea(c.pts) * kk, widthM: fronts.length ? fronts.reduce((m, f) => m + onLine(c.pts, f[0], f[1], 1e-6), 0) * um : null, depthM: fronts.length === 1 ? depthFrom(c.pts, fronts[0][0], fronts[0][1]) * um : null })); };
  function placeCheck() {
    const pack = placeNow(); if (!pack) { say(t('lr.place.pick'), true); return null; }
    lastPlace = checkPlace(placeLots(), pack); drawPlace(); return lastPlace;
  }
  const asPrinted = (f) => fx(f.value / (f.rule.si / f.rule.value), 2) + ' ' + f.rule.unit;
  const placeLines = (r, pack) => [
    ...r.findings.map((f) => el('li', { className: 'lr-warn' }, t('lr.place.msg.' + f.code, { lot: f.lot, zone: f.zone, value: asPrinted(f), limit: f.printed, cite: citeOf(pack, f.rule) }))),
    ...r.unjudged.map((u) => el('li', {}, t('lr.place.un.' + u.why, { lot: u.lot, zone: u.zone || '', rule: u.rule ? t('lr.place.rule.' + u.rule) : '' })))];
  const readWord = (r) => t('lr.read.' + r);
  function drawPlace() {
    const packs = placePacks(), b = book(), pack = placeNow();
    placeSel.replaceChildren(el('option', { value: '' }, t('lr.place.nonechosen')), ...packs.map((x) => el('option', { value: x.id }, x.name)));
    placeSel.value = pack ? pack.id : '';
    const missing = b.place && !pack;
    const src = (key) => pack.sources.find((x) => x.key === key);
    placeBox.replaceChildren(
      missing ? el('p', { className: 'lr-warn', 'data-lr-placemissing': '' }, t('lr.place.missing', { id: b.place })) : '',
      !packs.length ? el('p', { className: 'lr-note' }, t('lr.place.nopacks')) : '',
      pack && pack.baseMissing ? el('p', { className: 'lr-warn', 'data-lr-basemissing': '' }, t('lr.place.basemissing', { id: pack.baseMissing })) : pack && pack.baseName ? el('p', { className: 'lr-note' }, t('lr.place.withbase', { name: pack.baseName })) : '',
      pack ? el('div', { 'data-lr-placeinfo': '' },
        el('p', { className: 'lr-note' }, pack.note), el('p', { className: 'lr-note' }, t('lr.place.researched', { date: pack.researched || t('lr.unknown') })),
        zonesOf(pack).length ? el('div', { className: 'lr-scroll' }, table([t('lr.f.zone'), t('lr.place.rule.minarea'), t('lr.place.rule.minwidth'), t('lr.place.rule.mindepth'), t('lr.place.source')], zonesOf(pack).map((z) => { const all = [...z.area, ...z.width, ...z.depth], show = (l) => (l.length ? l.map(printed).join(' / ') : '–');
          return { cells: [el('span', { title: z.zoneName }, z.zone), show(z.area), show(z.width), show(z.depth), el('span', { title: all.map((r) => r.quote).filter(Boolean).join(' | ') }, [...new Set(all.map((r) => r.clause + ' (' + readWord(r.read) + ')'))].join('; '))] }; }), { 'data-lr-zones': '' })) : '',
        pack.thresholds.length ? el('div', {}, el('h4', {}, t('lr.place.thresholds')), el('ul', { className: 'lr-scroll', 'data-lr-thresholds': '' }, ...pack.thresholds.map((x) => el('li', { title: x.quote }, x.what + ' ', el('em', {}, '[' + [src(x.source)?.title, x.clause, readWord(x.read)].filter(Boolean).join(', ') + ']'))))) : '',
        pack.forms.length ? el('div', {}, el('h4', {}, t('lr.place.forms')), el('ul', {}, ...pack.forms.map((f) => el('li', {}, [f.id, f.title, f.edition].filter(Boolean).join(', ') + ' ', el('em', {}, '[' + readWord(f.read) + ']'), f.note ? ' ' + f.note : '')))) : '',
        el('h4', {}, t('lr.place.sources')), el('ul', {}, ...pack.sources.map((x) => el('li', {}, x.title + (x.edition ? ' (' + x.edition + ')' : '') + (x.publisher ? ', ' + x.publisher : '') + ' ', x.url ? el('a', { href: x.url, target: '_blank', rel: 'noopener noreferrer' }, t('lr.place.link')) : ''))),
        btn(t('lr.place.check'), () => placeCheck(), { 'data-lr-placecheck': '' })) : '',
      pack && lastPlace ? el('div', { 'data-lr-placeout': '' }, el('p', { className: lastPlace.findings.length ? 'lr-warn' : 'lr-ok' }, t('lr.place.summary', { judged: lastPlace.judged, below: lastPlace.findings.length, un: lastPlace.unjudged.length })), el('ul', {}, ...placeLines(lastPlace, pack))) : '');
  }
  placeSel.onchange = () => { setPlace(placeSel.value); refresh(); };
  const placeFold = fold('place', t('lr.sec.place'), el('p', { className: 'lr-note' }, t('lr.place.help')), field(t('lr.place.choose'), placeSel),
    btn(t('lr.place.open'), () => pickFile('.json,application/json', (text) => openRules(text))), placeBox);

  // ================================================================ Change parcels
  const kindSel = sel([['equal', t('lr.ch.equal')], ['areas', t('lr.ch.areas')], ['line', t('lr.ch.line')], ['consolidate', t('lr.ch.consolidate')], ['boundary', t('lr.ch.boundary')], ['designate', t('lr.ch.designate')]], 'equal', { 'data-lr-kind': '' });
  const pickBox = el('div', { className: 'lr-scroll' }), paramBox = el('div'), outBox = el('div'), rulesBox = el('div'), propBox = el('div');
  const X = { n: el('input', { type: 'number', min: '2', max: '200', step: '1', value: '2' }), az: el('input', { type: 'number', min: '0', max: '360', step: 'any', value: '0' }), areas: el('input', { type: 'text', placeholder: '500, 700' }),
    x1: el('input', { type: 'number', step: 'any' }), y1: el('input', { type: 'number', step: 'any' }), x2: el('input', { type: 'number', step: 'any' }), y2: el('input', { type: 'number', step: 'any' }),
    use: el('input', { type: 'text', maxlength: '80' }), zone: el('input', { type: 'text', maxlength: '80' }), reason: el('textarea', { rows: '2', maxlength: '4000' }), title: el('input', { type: 'text', maxlength: '160' }) };
  const picked = new Set();
  const lotOf = (p, b) => { const r = recordOf(b, p.id); return { id: p.id, name: p.name, ring: p.ring, area: p.area, use: r?.use || '', zone: r?.zone || '', ref: r?.ref || '' }; };
  function drawParams() {
    const k = kindSel.value, line = el('div', { className: 'lr-two' }, field('X1 (E)', X.x1), field('Y1 (N)', X.y1), field('X2 (E)', X.x2), field('Y2 (N)', X.y2));
    paramBox.replaceChildren(
      k === 'equal' ? field(t('lr.ch.n'), X.n) : '', k === 'areas' ? field(t('lr.ch.areas.list', { unit: UNIT_WORDS[unit] }), X.areas) : '',
      k === 'equal' || k === 'areas' ? field(t('lr.ch.az'), X.az) : '', k === 'line' || k === 'boundary' ? el('div', {}, el('p', { className: 'lr-note' }, t('lr.ch.line.help')), line) : '',
      k === 'designate' ? el('div', { className: 'lr-two' }, field(t('lr.ch.touse'), X.use), field(t('lr.ch.tozone'), X.zone)) : '',
      field(t('lr.ch.title'), X.title), field(t('lr.ch.reason'), X.reason));
  }
  kindSel.onchange = drawParams;
  /** spec = { kind, parcels: [id], n, az (degrees from north, clockwise), areas: [m²], p, q, use, zone, title, reason } → the draft proposal, shown, not yet kept. */
  function propose(spec) {
    const b = book(), all = parcels(), lots = spec.parcels.map((id) => all.find((p) => p.id === id)).filter(Boolean).map((p) => lotOf(p, b));
    const need = spec.kind === 'consolidate' ? 2 : spec.kind === 'boundary' ? 2 : 1;
    if (lots.length < need || ((spec.kind === 'boundary') && lots.length !== 2) || (['equal', 'areas', 'line'].includes(spec.kind) && lots.length !== 1)) { say(t('lr.ch.err.pick.' + spec.kind), true); return null; }
    const dir = (90 - (Number(spec.az) || 0)) * Math.PI / 180, tol = Math.max(1e-6, b.settings.gapTol / host.unitM() / 100);
    let r;
    if (spec.kind === 'equal') r = subdivide(lots[0], { mode: 'equal', dir, n: spec.n });
    else if (spec.kind === 'areas') r = subdivide(lots[0], { mode: 'areas', dir, areas: (spec.areas || []).map((a) => a / k2()) });
    else if (spec.kind === 'line') r = subdivide(lots[0], { mode: 'line', p: spec.p, q: spec.q });
    else if (spec.kind === 'consolidate') r = consolidate(lots, tol);
    else if (spec.kind === 'boundary') r = moveBoundary(lots[0], lots[1], spec.p, spec.q, tol);
    else r = designate(lots, { use: spec.use, zone: spec.zone });
    if (!r.ok) { draft = null; say(t('lr.ch.err.' + r.why), true); drawDraft(); return null; }
    draft = r.proposal; draft.made = Date.now(); draft.reason = String(spec.reason || ''); if (spec.title) draft.title = String(spec.title).slice(0, 160);
    draft._lots = lots; say(t('lr.ch.worked', { n: draft.children.length })); drawDraft(); return draft;
  }
  const lotChecksOf = (p) => {
    const b = book(), fronts = (p.parents || []).map((id) => host.frontLine(id)).filter(Boolean);
    return checkLots(p.children.map((c) => ({ name: c.name, use: c.use, areaM2: ringArea(c.pts) * k2(), frontageM: fronts.length ? fronts.reduce((m, f) => m + onLine(c.pts, f[0], f[1], 1e-6), 0) * host.unitM() : null })), b.rules);
  };
  const schedOf = (p) => schedule(p, { unitM: host.unitM(), parents: p._lots || null });
  function picture(p) {
    const svg = document.createElementNS(NS, 'svg'); svg.setAttribute('class', 'lr-pic'); svg.setAttribute('role', 'img'); svg.setAttribute('data-lr-pic', '');
    const all = p.children.flatMap((c) => c.pts); if (!all.length) return svg;
    let a = Infinity, b = Infinity, c = -Infinity, d = -Infinity;
    for (const q of all) { a = Math.min(a, q.x); b = Math.min(b, q.y); c = Math.max(c, q.x); d = Math.max(d, q.y); }
    const span = Math.max(c - a, d - b, 1e-6), pad = span * 0.06;
    svg.setAttribute('viewBox', `${a - pad} ${-(d + pad)} ${c - a + 2 * pad} ${d - b + 2 * pad}`);
    p.children.forEach((ch, i) => {
      const g = document.createElementNS(NS, 'polygon'); g.setAttribute('points', ch.pts.map((q) => q.x.toFixed(3) + ',' + (-q.y).toFixed(3)).join(' '));
      g.setAttribute('fill', HUES[i % HUES.length]); g.setAttribute('fill-opacity', '0.25'); g.setAttribute('stroke', HUES[i % HUES.length]); g.setAttribute('stroke-width', String(span / 250)); svg.append(g);
      const cx = ch.pts.reduce((m, q) => m + q.x, 0) / ch.pts.length, cy = ch.pts.reduce((m, q) => m + q.y, 0) / ch.pts.length;
      const tx = document.createElementNS(NS, 'text'); tx.setAttribute('x', String(cx)); tx.setAttribute('y', String(-cy)); tx.setAttribute('font-size', String(span / 22)); tx.setAttribute('text-anchor', 'middle'); tx.setAttribute('fill', 'currentColor'); tx.textContent = ch.name; svg.append(tx);
    });
    return svg;
  }
  function drawDraft() {
    if (!draft) { outBox.replaceChildren(); return; }
    const s = schedOf(draft), ck = lotChecksOf(draft), bal = Math.abs(s.balanceM2) < 0.005;
    outBox.replaceChildren(picture(draft),
      table([t('lr.col.before'), t('lr.col.area'), t('lr.f.use'), t('lr.f.zone')], s.before.map((r) => ({ cells: [r.name, A(r.areaM2), r.use, r.zone] }))),
      table([t('lr.col.after'), t('lr.col.area'), t('lr.f.use'), t('lr.f.zone')], s.after.map((r) => ({ cells: [r.name, A(r.areaM2), r.use, r.zone] })), { 'data-lr-after': '' }),
      el('p', { className: bal ? 'lr-ok' : 'lr-warn', 'data-lr-balance': '' }, bal ? t('lr.ch.balanced', { area: A(s.afterM2) }) : t('lr.ch.unbalanced', { area: A(s.balanceM2) })),
      ck.length ? el('ul', { 'data-lr-lotchecks': '' }, ...ck.map((c) => el('li', { className: 'lr-warn' }, t('lr.rulemsg.' + c.code, { lot: c.lot, value: fx(c.value, 1), limit: fx(c.limit, 1) })))) : (book().rules.length ? el('p', { className: 'lr-ok' }, t('lr.rule.pass')) : ''),
      placeNow() ? (() => { const pk = placeNow(), r = checkPlace(placeDraftLots(draft), pk); return el('div', { 'data-lr-draftplace': '' }, el('p', { className: r.findings.length ? 'lr-warn' : 'lr-ok' }, t('lr.place.summary', { judged: r.judged, below: r.findings.length, un: r.unjudged.length }) + ' ' + pk.name), el('ul', {}, ...placeLines(r, pk))); })() : '',
      el('div', { className: 'lr-row' }, btn(t('lr.ch.keep'), () => keep(), { 'data-lr-keep': '' }), btn(t('lr.ch.apply'), () => apply(), { 'data-lr-apply': '' })));
  }
  function keep() {
    if (!draft) return null;
    const { _lots, ...p } = draft; let id = null;
    host.change(t('lr.undo.proposal'), ({ book: b }) => { p.id = 'lp' + b.seq++; id = p.id; b.proposals.push(p); });
    draft.id = id; selProposal = id; say(t('lr.ch.kept', { title: p.title })); drawProposals(); drawDocs(); return id;
  }
  /** The proposal put into the drawing: the old parcels and their records go, the new ones come with records that name what they were made from. */
  function apply() {
    if (!draft) return false;
    const { _lots, ...p } = draft;
    const ok = host.change(t('lr.undo.apply'), (tools) => {
      const b = tools.book, old = p.parents.map((id) => recordOf(b, id)).filter(Boolean);
      const same = (k) => (old.length && old.every((r) => r[k] === old[0][k]) ? old[0][k] : '');
      const parentRefs = p.parents.map((id, i) => recordOf(b, id)?.ref || (p.parentNames || [])[i] || id);
      if (p.kind === 'designation') {
        p.parents.forEach((id, i) => { const c = p.children[i], r = recordOf(b, id); if (r) setRecord(b, r.id, { use: c.use, zone: c.zone }); else addRecord(b, { parcel: id, use: c.use, zone: c.zone, source: t('lr.ch.source', { title: p.title }) }); });
      } else {
        for (const id of p.parents) { const r = recordOf(b, id); if (r) removeRecord(b, r.id); tools.removeParcel(id); }
        for (const c of p.children) { const id = tools.addParcel(c.name, c.pts); addRecord(b, { parcel: id, use: c.use, zone: c.zone, holder: same('holder'), tenure: same('tenure'), status: 'draft', parent: parentRefs, source: t('lr.ch.source', { title: p.title }) }); }
      }
      const kept = p.id ? b.proposals.find((x) => x.id === p.id) : null;
      if (kept) kept.status = 'applied'; else { p.id = 'lp' + b.seq++; p.status = 'applied'; b.proposals.push(p); }
      selProposal = p.id;
    });
    if (!ok) { say(t('lr.err.change'), true); return false; }
    say(t('lr.ch.applied', { title: p.title })); draft = null; picked.clear(); refresh(); return true;
  }
  function drawRules() {
    const b = book(), u = el('input', { type: 'text', maxlength: '80', placeholder: t('lr.rule.any') }), a = el('input', { type: 'number', min: '0', step: 'any', placeholder: 'm²' }), f = el('input', { type: 'number', min: '0', step: 'any', placeholder: 'm' });
    rulesBox.replaceChildren(el('p', { className: 'lr-note' }, t('lr.rule.help')),
      b.rules.length ? table([t('lr.f.use'), t('lr.rule.minarea'), t('lr.rule.minfront'), ''], b.rules.map((r) => ({ cells: [r.use || t('lr.rule.any'), r.minArea ? fx(r.minArea, 1) + ' m²' : '–', r.minFrontage ? fx(r.minFrontage, 2) + ' m' : '–',
        el('button', { type: 'button', className: 'lr-x', title: t('lr.remove'), 'aria-label': t('lr.remove'), onclick: () => { host.change(t('lr.undo.rule'), ({ book: bk }) => { bk.rules = bk.rules.filter((x) => x.id !== r.id); }); drawRules(); drawDraft(); } }, '×')] })), { 'data-lr-rules': '' }) : '',
      el('div', { className: 'lr-row' }, u, a, f, btn(t('lr.rule.add'), () => { const ma = Number(a.value) || 0, mf = Number(f.value) || 0; if (!(ma > 0) && !(mf > 0)) return say(t('lr.rule.err'), true); host.change(t('lr.undo.rule'), ({ book: bk }) => { bk.rules.push({ id: 'lu' + bk.seq++, use: u.value.trim().slice(0, 80), minArea: ma, minFrontage: mf }); }); drawRules(); drawDraft(); })));
  }
  function drawProposals() {
    const b = book();
    if (selProposal && !b.proposals.some((p) => p.id === selProposal)) selProposal = null;
    propBox.replaceChildren(b.proposals.length ? table([t('lr.col.proposal'), t('lr.col.kind'), t('lr.col.lots'), t('lr.f.status'), ''], b.proposals.map((p) => ({ id: p.id, cls: p.id === selProposal ? 'sel' : '', onclick: () => { selProposal = p.id; drawProposals(); drawDocs(); },
      cells: [p.title, t('lr.kind.' + p.kind), p.children.length, t('lr.pstatus.' + p.status), el('button', { type: 'button', className: 'lr-x', title: t('lr.remove'), 'aria-label': t('lr.remove'), onclick: (e) => { e.stopPropagation(); host.change(t('lr.undo.proposal.remove'), ({ book: bk }) => { bk.proposals = bk.proposals.filter((x) => x.id !== p.id); }); refresh(); } }, '×')] })), { 'data-lr-proposals': '' }) : el('p', { className: 'lr-note' }, t('lr.ch.none')));
  }
  function drawPick() {
    const ps = parcels(); for (const id of [...picked]) if (!ps.some((p) => p.id === id)) picked.delete(id);
    pickBox.replaceChildren(ps.length ? el('div', {}, ...ps.map((p) => { const c = el('input', { type: 'checkbox', 'data-lr-pick': p.id }); c.checked = picked.has(p.id); c.onchange = () => { if (c.checked) picked.add(p.id); else picked.delete(p.id); }; return el('label', { className: 'lr-row' }, c, el('span', {}, p.name + ' — ' + A(p.area * k2()))); })) : el('p', { className: 'lr-note' }, t('lr.rec.noparcels')));
  }
  const specFromForm = () => ({ kind: kindSel.value, parcels: [...picked], n: Number(X.n.value), az: Number(X.az.value), areas: X.areas.value.split(/[,;\s]+/).map(Number).filter((v) => v > 0).map((v) => toM2(v, unit)),
    p: { x: Number(X.x1.value), y: Number(X.y1.value) }, q: { x: Number(X.x2.value), y: Number(X.y2.value) }, use: X.use.value, zone: X.zone.value, title: X.title.value, reason: X.reason.value });
  const changeFold = fold('change', t('lr.sec.change'), el('p', { className: 'lr-note' }, t('lr.ch.help')), field(t('lr.ch.kind'), kindSel), pickBox, paramBox,
    btn(t('lr.ch.work'), () => propose(specFromForm()), { 'data-lr-work': '' }), outBox, el('h4', {}, t('lr.rule.title')), rulesBox, el('h4', {}, t('lr.ch.kepttitle')), propBox);

  // ================================================================ Documents
  const docSel = el('select', { 'data-lr-doc': '' }), packSel = el('select', { 'data-lr-pack': '' }), docForm = el('div'), docOut = el('div');
  const allPacks = () => [...(ctx.packs || []), ...(placeNow() && placeNow().templates ? [placeNow().templates] : []), ...userPacks];
  const D = {};
  const proposalOf = () => { const b = book(); return b.proposals.find((p) => p.id === selProposal) || null; };
  function drawDocs() {
    const p = proposalOf(), packs = allPacks();
    const keepPack = packSel.value, keepDoc = docSel.value;
    packSel.replaceChildren(...packs.map((x) => el('option', { value: x.id }, x.name))); if (packs.some((x) => x.id === keepPack)) packSel.value = keepPack;
    const pack = packs.find((x) => x.id === packSel.value) || packs[0];
    const docs = pack ? pack.documents.filter((d) => !d.for.length || (p && d.for.includes(p.kind))) : [];
    docSel.replaceChildren(...docs.map((d) => el('option', { value: d.id }, d.title.replace(/:?\s*\{[a-z_]+\}/g, '')))); if (docs.some((d) => d.id === keepDoc)) docSel.value = keepDoc;
    const doc = docs.find((d) => d.id === docSel.value), b = book();
    const APPL = { applicant: 'name', agent: 'agent', address: 'address', contact: 'contact', authority: 'authority', site: 'site' };
    for (const k of Object.keys(D)) delete D[k];
    const inputs = doc ? doc.fields.map((f) => { const cur = APPL[f.key] ? b.applicant[APPL[f.key]] : b.fields[f.key]; D[f.key] = el('input', { type: 'text', maxlength: '300', value: cur || '', 'data-lr-df': f.key }); return field(f.label + (f.required ? ' *' : ''), D[f.key]); }) : [];
    docForm.replaceChildren(pack ? el('p', { className: 'lr-note' }, pack.note) : '', !p ? el('p', { className: 'lr-warn' }, t('lr.doc.pick')) : el('p', {}, el('strong', {}, p.title), ' — ', t('lr.kind.' + p.kind)), ...inputs,
      inputs.length ? btn(t('lr.doc.savefields'), () => saveDocFields()) : '');
    filled = null; docOut.replaceChildren();
  }
  function saveDocFields() {
    const APPL = { applicant: 'name', agent: 'agent', address: 'address', contact: 'contact', authority: 'authority', site: 'site' };
    const cur = book(), changed = Object.entries(D).some(([k, i]) => (APPL[k] ? cur.applicant[APPL[k]] || '' : cur.fields[k] || '') !== i.value.trim());
    if (!changed) return false;
    host.change(t('lr.undo.fields'), ({ book: b }) => { for (const [k, i] of Object.entries(D)) { const v = i.value.trim().slice(0, 300); if (APPL[k]) { if (v) b.applicant[APPL[k]] = v; else delete b.applicant[APPL[k]]; } else if (!BUILT_IN.includes(k)) { if (v) b.fields[k] = v; else delete b.fields[k]; } } });
    return true;
  }
  /** The chosen document filled from the chosen proposal → { filled, markdown, html } | null. */
  function fillDocument() {
    saveDocFields();
    const p = proposalOf(), pack = allPacks().find((x) => x.id === packSel.value) || allPacks()[0], doc = pack?.documents.find((d) => d.id === docSel.value);
    if (!p || !doc) { say(t('lr.doc.pick'), true); return null; }
    const b = book(), ps = parcels(), kk = k2();
    // land by designation as it would be with the proposal applied
    const after = b.proposals.length && p.kind === 'designation' ? ps.map((x) => { const i = p.parents.indexOf(x.id); const r = recordOf(b, x.id); return { id: x.id, areaM2: x.area * kk, use: i >= 0 ? p.children[i].use : r?.use || '', zone: i >= 0 ? p.children[i].zone : r?.zone || '' }; }) : null;
    const lu = after ? (() => { const fake = { records: after.map((x) => ({ parcel: x.id, use: x.use, zone: x.zone })) }; return landUse(fake, after); })() : landUse(b, ps.map((x) => ({ id: x.id, areaM2: x.area * kk })));
    const parents = p.parents.map((id, i) => { const x = ps.find((q) => q.id === id), r = recordOf(b, id); return x ? { name: x.name, ref: r?.ref || '', area: x.area, use: r?.use || p.from.use, zone: r?.zone || p.from.zone } : { name: (p.parentNames || [])[i] || id, ref: '', area: (p.parentAreas || [])[i] || 0, use: p.from.use, zone: p.from.zone }; });
    const sched = schedule(p, { unitM: host.unitM(), parents });
    const words = (k, v) => t('lr.doc.' + k, v);
    // what stands on the land, what there is to measure, the notes on the plan and the place's rules for the zones this proposal touches
    const { site, tk } = siteNow(), place = placeNow(), extra = {};
    extra.takeoff = { head: [t('lr.col.parcel'), t('lr.col.area'), t('lr.site.outline'), t('lr.site.frontage'), t('lr.site.corners')], rows: [...tk.lots.map((x) => [x.name, A(x.areaM2), Lg(x.perimeterM), x.frontageM === null ? '' : Lg(x.frontageM), String(x.corners)]), [t('lr.doc.col.total'), A(tk.totals.areaM2), Lg(tk.totals.boundaryM) + ' ' + t('lr.site.onground'), '', String(tk.totals.corners)]] };
    extra.buildings = { head: [t('lr.col.parcel'), t('lr.site.buildings'), t('lr.site.footprint'), t('lr.site.gfa'), t('lr.site.coverage'), t('lr.site.far')], rows: site.rows.filter((r) => r.buildings).map((r) => [r.name, String(r.buildings), A(r.footprintM2), A(r.gfaM2), pc(r.coverage), fx(r.far, 2)]) };
    extra.notes = { head: [t('lr.col.parcel'), t('lr.note.col'), t('lr.f.status')], rows: notesNow().filter((n) => n.status !== 'closed').map((n) => [n.parcel ? nameOf(n.parcel) : '', n.title + (n.text ? ': ' + n.text : ''), t('lr.nstatus.' + n.status)]) };
    if (place) {
      const want = new Set([...p.children.map((c) => c.zone), p.from.zone, p.to.zone, ...parents.map((x) => x.zone)].map(zoneKey).filter(Boolean));
      extra.rules = { head: [t('lr.f.zone'), t('lr.place.rulecol'), t('lr.place.figure'), t('lr.place.source'), t('lr.place.read')], rows: place.rules.filter((r) => want.has(zoneKey(r.zone))).map((r) => [r.zone, t('lr.place.rule.' + { 'area.min': 'minarea', 'width.min': 'minwidth', 'depth.min': 'mindepth' }[r.rule]), printed(r), citeOf(place, r), readWord(r.read)]) };
      extra.thresholds = { head: [t('lr.place.figurecol'), t('lr.place.source'), t('lr.place.read')], rows: place.thresholds.map((x) => [x.what, citeOf(place, x), readWord(x.read)]) };
    }
    const data = dataFor(p, sched, { book: b, project: host.name(), date: new Date().toISOString().slice(0, 10), unit, lotChecks: lotChecksOf(p), landuse: lu, extra, words });
    filled = fill(doc, data);
    const md = toMarkdown(filled), html = toHtml(filled, { lang: document.documentElement.lang || 'en' });
    docOut.replaceChildren(
      filled.missing.length ? el('p', { className: 'lr-warn', 'data-lr-missing': '' }, t('lr.doc.missing', { list: filled.missing.join('; ') })) : el('p', { className: 'lr-ok', 'data-lr-missing': '' }, t('lr.doc.complete')),
      el('pre', { className: 'lr-pre', 'data-lr-preview': '' }, md),
      el('div', { className: 'lr-row' }, btn(t('lr.doc.html'), () => ctx.download(stem() + ' - ' + doc.id + '.html', html, 'text/html')), btn(t('lr.doc.md'), () => ctx.download(stem() + ' - ' + doc.id + '.md', md, 'text/markdown')),
        btn(t('lr.doc.csv'), () => ctx.download(stem() + ' - schedule.csv', '﻿' + csvRows([['when', 'lot', 'reference', 'area_m2', 'use', 'zone'], ...sched.before.map((r) => ['before', r.name, r.ref, Number(r.areaM2.toFixed(2)), r.use, r.zone]), ...sched.after.map((r) => ['after', r.name, '', Number(r.areaM2.toFixed(2)), r.use, r.zone])]), 'text/csv'))),
      el('p', { className: 'lr-note' }, t('lr.doc.print')));
    return { filled, markdown: md, html };
  }
  packSel.onchange = drawDocs; docSel.onchange = drawDocs;
  const docFold = fold('documents', t('lr.sec.documents'), el('p', { className: 'lr-note' }, t('lr.doc.help')),
    el('div', { className: 'lr-two' }, field(t('lr.doc.pack'), packSel), field(t('lr.doc.document'), docSel)),
    btn(t('lr.doc.openpack'), () => pickFile('.json,application/json', (text) => { let o; try { o = JSON.parse(text); } catch { return say(t('lr.doc.err.pack'), true); } const c = cleanPack(o); if (!c.ok) return say(t('lr.doc.err.pack'), true); userPacks = userPacks.filter((x) => x.id !== c.pack.id); userPacks.push(c.pack); drawDocs(); packSel.value = c.pack.id; drawDocs(); say(t('lr.doc.packopened', { name: c.pack.name, n: c.pack.documents.length })); })),
    docForm, btn(t('lr.doc.fill'), () => fillDocument(), { 'data-lr-fill': '' }), docOut);

  // ================================================================ the whole tab
  function refresh() {
    if (!host.ready()) return;
    if (!chosen) { unit = host.units() === 'm' ? 'm2' : 'ft2'; unitSel.value = unit; }
    drawWalks(); drawRecords(); drawCheck(); drawSite(); drawModels(); drawNotes(); drawPlace(); drawPick(); drawParams(); drawDraft(); drawRules(); drawProposals(); drawDocs();
  }
  root.replaceChildren(el('p', { className: 'lr-note', 'data-lr-notice': '' }, t('lr.notice')), status, walkFold, recFold, checkFold, siteFold, noteFold, placeFold, changeFold, docFold);
  walkFold.open = true;
  let busy = false;
  const stop = host.watch(() => { if (busy || !root.isConnected) return; busy = true; queueMicrotask(() => { busy = false; try { refresh(); } catch (err) { say(String(err && err.message || err), true); } }); });
  const onRules = () => { try { refresh(); } catch { /* the tab is closing */ } };
  if (env.addEventListener) env.addEventListener('cc-land-rules', onRules);
  refresh();
  return {
    refresh, unmount() { stop(); if (env.removeEventListener) env.removeEventListener('cc-land-rules', onRules); if (view) view.cancel(); root.replaceChildren(); },
    saveWalk, walkToDrawing, openWalkView, openWalkFile, importCsv, reconcile: runCheck, propose, keep, apply, fillDocument, site: siteNow, readIfc, modelToMasses, removeModel, markupSet, readBack, addNote, notesFromCheck, setNote, notes: notesNow, setPlace, placeCheck, openRules, place: placeNow,
    pick: (ids) => { picked.clear(); ids.forEach((i) => picked.add(i)); drawPick(); }, selectProposal: (id) => { selProposal = id; drawProposals(); drawDocs(); }, selectParcel: (id) => { selParcel = id; drawRecords(); },
    state: () => ({ unit, selWalk, selParcel, selProposal, draft, lastCheck, lastPlace, view, filled, status: status.textContent }),
  };
}
