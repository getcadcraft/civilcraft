/* SPDX-License-Identifier: Apache-2.0 */
/**
 * main.js — the Interior lighting design add-on (0.9 LD, session `lightdesign-09`): a room, luminaires from photometry files, and the illuminance, uniformity, glare and
 * power that come out, with the light that bounces off the surfaces. One add-on for every host: the engine is lib/ (DOM-free), the only things that touch an app are this
 * panel and the host adapter (host.js; hosts/cad.js for CadCraft, hosts/bim.js for BimCraft).
 *
 *   The host (detect(api, { t })) provides rooms() → [{ name, poly [[x, y]] mm, area (m²), height? mm }] (may be a Promise), draw({ luminaires, result, room }) → { n },
 *   erase() → n, count(), start(app). app (handed to host.start): run() → { ok, message, summary }, draw() → { n }, report(), csv().
 * Panel: Room → Luminaire → Layout (plan for a target | grid | rows) → Requirements → Calculate → result, map, checks → Draw / Report / CSV.
 * 0.11 SU.1816: optional host parts. A room may carry outdoor: true (it is a site area: Outdoors is ticked when it is chosen) and features: { trees, paths, spots } (mm):
 * then the Landscape layout puts an up-light at each tree, bollards along each path and a pole at each spot (lib/site.js landscapeLuminaires). host.modelItems({ room })
 * → { items, floor, ceiling } gives the night picture the model's own surfaces (BimCraft); a host without draw() (CivilCraft) offers no Draw or Erase.
 * 0.11 IL.7 (light-finish-11): the 3D lux surface (lib/surface3d.js, drawn on a plain canvas: drag to turn it) under the map, and catalogues the person builds from their own
 * .ldt / .ies files (lib/catalogue.js): stored as the files' text under storage keys 'catalogues' (the list) and 'cat:<id>', searched by name, maker, flux, power and beam.
 * 0.11 IL.10 (road-light-11): "Road lighting" swaps the room for a road cross-section, a luminaire arrangement and the road results (road-ui.js over lib/road.js);
 * a host may offer roads() (CivilCraft: its alignments' assemblies). Criteria not met go to the shell's Problems (source 'road') when the page has it.
 */
import { genericPhoto, GENERIC_IDS, parsePhotometry, gridLayout, rowLayout, planLayout, runDesign, PRESETS, presetById, REQUIREMENTS_NOTE, DEFAULT_ROOM, polyArea, scaleColor, reportHtml, reportCsv, cleanRoom, runDaylight, runEmergency, pickEmergency, cleanObstacles, checkWindows, windowsFromOpenings, EMERGENCY_NOTE, EMERGENCY_DEFAULTS, DEFAULT_EEXT, SITE_GENERIC_IDS, inside as insidePoly, runSite, siteLuxAt, workplane, renderLamps, nightPreset, nightScene, renderNight, falseColour, gridField, niceLevels, isolines, landscapeLuminaires, luxSurface, projectSurface, cleanCatalogue, addFiles, searchEntries, storedSize, STORE_MAX, MAX_FILES, SORTS as CAT_SORTS } from './lib/index.js';
import * as hostMod from './host.js';
import { makeRoad, ROAD_DEFAULTS } from './road-ui.js';

const DEFAULTS = {
  outline: '0, 0\n6000, 0\n6000, 4000\n0, 4000', roomName: '', height: 2800, workplane: 800, margin: 500, rc: 0.7, rw: 0.5, rf: 0.2,
  lum: 'panel', fileName: '', fileText: '', mode: 'plan', targetLux: 500, planUo: 0.6, nx: 3, ny: 2, rows: 2, perRow: 4, along: 'x', suspension: 0, llf: 0.8,
  preset: 'office.writing', em: 500, uo: 0.6, ugr: 19, ra: 80, lpd: 0, spacing: 0, eyeHeight: 1200,
  outdoor: false, cct: 3000, nightQ: 16, groundRho: 0.2,
  catId: '', catFile: '', catQ: '', catSort: 'name', catMinLm: 0, catMaxW: 0, view3d: true, yaw: 30, pitch: 35,
  windows: '', eext: DEFAULT_EEXT, dfTarget: 0, obstacles: '', emOn: false, emEvery: 2, emShare: 100, emRoute: '', emOpen: true, emRouteMin: EMERGENCY_DEFAULTS.route.min, emRatio: EMERGENCY_DEFAULTS.route.ratio, emOpenMin: EMERGENCY_DEFAULTS.open.min,
};

export function activate(api) {
  const t = (k, v) => api.t(k, v);
  const host = typeof hostMod.detect === 'function' ? hostMod.detect(api, { t }) : null;
  const S = { ...DEFAULTS, ...ROAD_DEFAULTS, ...(safe(() => api.storage.get('settings')) || {}) };
  const R = { rooms: null, roomPick: -1, photo: null, photoName: '', layout: null, result: null, error: '', message: '', busy: false };
  let pane = null, styleEl = null;
  function safe(fn) { try { return fn(); } catch { return null; } }
  const save = () => { safe(() => api.storage.set('settings', { ...S })); };
  const num = (v, d) => (Number.isFinite(Number(v)) ? Number(v) : d);
  const say = (m) => { try { api.print(m); } catch { /* no history */ } };

  // ------------------------------------------------------------------------------------------------ the person's catalogues (0.11 IL.7)
  // Kept as the files' own text, one storage key per catalogue; what does not fit in storage stays for this session only and the panel says so.
  const CAT = { list: [], msg: '', unsaved: new Set() };
  for (const c of safe(() => api.storage.get('catalogues')) || []) { const cat = cleanCatalogue({ ...(safe(() => api.storage.get('cat:' + (c && c.id))) || {}), id: c && c.id, name: c && c.name }); if (cat) CAT.list.push(cat); }
  const catOf = (id) => CAT.list.find((c) => c.id === id) || null;
  function saveCats() {
    let used = 0;
    for (const c of CAT.list) {
      used += storedSize(c);
      const ok = used <= STORE_MAX && api.storage.set('cat:' + c.id, { id: c.id, name: c.name, files: c.files }) !== false;
      if (ok) CAT.unsaved.delete(c.id); else { CAT.unsaved.add(c.id); used -= storedSize(c); safe(() => api.storage.remove('cat:' + c.id)); }
    }
    safe(() => api.storage.set('catalogues', CAT.list.filter((c) => !CAT.unsaved.has(c.id)).map((c) => ({ id: c.id, name: c.name }))));
  }
  function newCatalogue(name) {
    const base = String(name || '').trim().slice(0, 60) || t('cat.default');
    let id = base.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 30) || 'catalogue';
    while (catOf(id)) id = id.replace(/-\d+$/, '') + '-' + (CAT.list.length + 1);
    const cat = { id, name: base, files: [], entries: [] };
    CAT.list.push(cat); S.catId = id; save(); saveCats();
    return cat;
  }
  /** Add files ([File] from an input, a folder's files included) to the open catalogue (a new one when none is open). */
  async function addToCatalogue(fileList) {
    const files = [...(fileList || [])].filter((f) => /\.(ldt|ies)$/i.test(f.name || ''));
    const skipped = (fileList ? fileList.length : 0) - files.length;
    const cat = catOf(S.catId) || newCatalogue('');
    const read = await Promise.all(files.map((f) => (f.size > 400000 ? Promise.resolve({ name: f.name, text: '', tooBig: true }) : f.text().then((text) => ({ name: f.name, text }), () => ({ name: f.name, text: '' })))));
    const r = addFiles(cat, read);
    saveCats();
    CAT.msg = t('cat.added', { n: r.added, r: r.replaced, bad: r.refused.length + skipped, name: cat.name }) + (r.refused.length ? ' ' + r.refused.slice(0, 3).map((x) => x.file + ': ' + t(x.key)).join('; ') : '') + (CAT.unsaved.has(cat.id) ? ' ' + t('cat.unsaved') : '');
    render();
    return r;
  }
  function removeCatalogue(id) {
    CAT.list = CAT.list.filter((c) => c.id !== id); CAT.unsaved.delete(id); safe(() => api.storage.remove('cat:' + id));
    if (S.catId === id) S.catId = CAT.list.length ? CAT.list[0].id : '';
    if (S.lum === 'cat' && !catOf(S.catId)) S.lum = 'panel';
    saveCats(); save(); R.layout = null; R.result = null; render();
  }
  const pickedEntry = () => { const c = catOf(S.catId); return c ? c.entries.find((e) => e.file === S.catFile) || null : null; };
  function useEntry(file) { S.lum = 'cat'; S.catFile = file; R.layout = null; R.result = null; save(); render(); }

  // ------------------------------------------------------------------------------------------------ the work
  function outline() {
    return String(S.outline).split(/\n|;/).map((l) => l.trim().split(/[\s,]+/).map(Number)).filter((p) => p.length >= 2 && p.every(Number.isFinite)).map((p) => [p[0], p[1]]);
  }
  const roomOf = () => cleanRoom({ polygon: outline(), height: num(S.height, 2800), workplane: num(S.workplane, 800), margin: num(S.margin, 500), refl: { ceiling: num(S.rc, 0.7), walls: num(S.rw, 0.5), floor: num(S.rf, 0.2) } });
  function photoOf() {
    if (S.lum === 'cat') {
      const e = pickedEntry();
      if (!e) throw Object.assign(new Error('cat.none'), { key: 'cat.none' });
      return e.photo;
    }
    if (S.lum === 'file') {
      if (R.photo && R.photoName === S.fileName) return R.photo;
      if (!S.fileText) throw Object.assign(new Error('err.nofile'), { key: 'err.nofile' });
      const r = parsePhotometry(S.fileText, S.fileName);
      if (!r.ok) throw Object.assign(new Error(r.key), { key: 'photo.' + r.key, vars: r.vars });
      R.photo = r.photo; R.photoName = S.fileName;
      return R.photo;
    }
    const out = S.outdoor || S.roadOn, ids = out ? SITE_GENERIC_IDS : GENERIC_IDS;
    return genericPhoto(ids.includes(S.lum) ? S.lum : out ? 'pole' : 'panel');
  }
  const reqOf = () => ({ em: num(S.em, 0), uo: num(S.uo, 0), ugr: num(S.ugr, 0), ra: num(S.ra, 0), lpd: num(S.lpd, 0) });
  const failure = (e) => (e && e.key ? t(e.key, e.vars || {}) : String((e && e.message) || e));

  const featuresOf = () => { const r = R.rooms && R.rooms[R.roomPick]; return r && r.features ? r.features : null; };
  function place() {
    const room = roomOf(), photo = photoOf(), z = room.height - Math.max(0, num(S.suspension, 0));
    if (S.mode === 'landscape' && S.outdoor) {   // 0.11 SU.1816: the lights the landscape asks for, each with its own generic type (not the luminaire chosen above)
      const f = featuresOf(), inArea = (q) => insidePoly(room.polygon, q.p[0], q.p[1]);
      const L = f ? landscapeLuminaires(f).filter(inArea) : [];
      if (!L.length) throw Object.assign(new Error('err.nolandscape'), { key: 'err.nolandscape' });
      R.layout = { luminaires: L, nx: 0, ny: 0, own: true };
      return R.layout;
    }
    if (S.mode === 'plan' && !S.outdoor) {
      const p = planLayout({ room, photo, targetLux: num(S.targetLux, 0), llf: num(S.llf, 0.8), uo: num(S.planUo, 0), z });
      if (!p.ok) {
        if (p.best) { R.layout = { luminaires: p.best.luminaires, nx: p.best.nx, ny: p.best.ny, planned: false }; throw Object.assign(new Error('plan'), { key: p.key, vars: { n: p.best.count, em: Math.round(p.best.em) } }); }
        throw Object.assign(new Error('plan'), { key: p.key || 'err.plan', vars: {} });
      }
      R.layout = { luminaires: p.luminaires, nx: p.nx, ny: p.ny, planned: true };
    } else if (S.mode === 'grid') {
      const g = gridLayout(room, photo, num(S.nx, 3), num(S.ny, 2), { z });
      R.layout = { luminaires: g.luminaires, nx: g.nx, ny: g.ny };
    } else {
      const g = rowLayout(room, photo, num(S.rows, 2), num(S.perRow, 4), { z, along: S.along });
      R.layout = { luminaires: g.luminaires, nx: g.nx, ny: g.ny };
    }
    if (!R.layout.luminaires.length) throw Object.assign(new Error('err.empty'), { key: 'err.empty' });
    return R.layout;
  }
  /** Lines of numbers ("a, b, c" or "a b c"), at least `min` of them, as arrays; a line that is not numbers is skipped. */
  const rows = (text, min) => String(text || '').split(/\n|;/).map((l) => l.trim().split(/[\s,]+/).filter((x) => x !== '').map(Number)).filter((r) => r.length >= min && r.every(Number.isFinite));
  const windowsOf = () => rows(S.windows, 5).map((r) => ({ edge: r[0], from: r[1], width: r[2], sill: r[3], head: r[4], t: r.length > 5 ? r[5] : undefined }));
  const obstaclesOf = () => cleanObstacles(rows(S.obstacles, 6).map((r) => ({ x0: r[0], y0: r[1], x1: r[2], y1: r[3], z0: r[4], z1: r[5] })));
  const routeOf = () => rows(S.emRoute, 2).map((r) => [r[0], r[1]]);
  function run() {
    R.error = ''; R.message = ''; R.result = null;
    try {
      const room = roomOf(), photo = photoOf(), obstacles = obstaclesOf();
      place();
      if (!R.layout.own) for (const L of R.layout.luminaires) L.photo = photo;
      const res = S.outdoor ? runSite({ room, luminaires: R.layout.luminaires, llf: num(S.llf, 0.8), spacing: num(S.spacing, 0), requirements: reqOf(), obstacles: obstacles.length ? obstacles : null }) : runDesign({ room, luminaires: R.layout.luminaires, llf: num(S.llf, 0.8), spacing: num(S.spacing, 0), requirements: reqOf(), eyeHeight: num(S.eyeHeight, 1200), obstacles: obstacles.length ? obstacles : null });
      res.luminaires = R.layout.luminaires; res.photo = photo;
      if (obstacles.length && !res.notes.includes('note.obstruct')) res.notes.push('note.obstruct');
      R.night = null;
      res.daylight = null; res.daylightError = ''; res.emergency = null; res.emergencyError = '';
      if (windowsOf().length && !S.outdoor) {
        try { res.daylight = runDaylight({ room, windows: windowsOf(), eext: num(S.eext, DEFAULT_EEXT) || DEFAULT_EEXT, spacing: num(S.spacing, 0) }); } catch (e) { res.daylightError = failure(e); }
      }
      if (S.emOn && !S.outdoor) {
        try {
          const em = pickEmergency(R.layout.luminaires, { every: num(S.emEvery, 1) });
          res.emergency = runEmergency({ room, luminaires: em, share: num(S.emShare, 100) / 100, route: routeOf(), openArea: !!S.emOpen, obstacles: obstacles.length ? obstacles : null, spacing: num(S.spacing, 0),
            requirements: { routeMin: num(S.emRouteMin, 0), ratio: num(S.emRatio, 0), openMin: num(S.emOpenMin, 0) } });
          res.emergency.of = R.layout.luminaires.length;
        } catch (e) { res.emergencyError = failure(e); }
      }
      R.result = res;
    } catch (e) { R.error = failure(e); render(); return { ok: false, message: R.error }; }
    const r = R.result;
    render();
    return { ok: true, message: '', summary: { em: Math.round(r.em), uo: Math.round(r.uo * 100) / 100, ugr: r.ugr === null ? '-' : r.ugr.toFixed(1), n: r.count } };
  }
  const nameOf = () => (S.lum === 'cat' ? (pickedEntry() || {}).name || S.catFile : S.lum === 'file' ? (R.photo && R.photo.name) || S.fileName : t('lum.' + S.lum));
  const titleOf = () => (S.roomName || t('rep.title'));
  function reportDoc() { return R.result ? reportHtml(R.result, { t, title: titleOf(), project: nameOf() + ' × ' + R.result.count, requirementsNote: REQUIREMENTS_NOTE, luminaireNames: [nameOf() + (R.photo && S.lum === 'file' ? '' : '')] }) : ''; }
  function download(text, name, mime) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([text], { type: mime })); a.download = name; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  }
  const fileBase = () => String(S.roomName || 'lighting').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'lighting';
  const app = {
    run: () => run(),
    draw: () => (host && typeof host.draw === 'function' && R.result ? host.draw({ luminaires: R.result.luminaires, result: R.result, room: R.result.room, cct: num(S.cct, 3000) || 3000 }) : { n: 0 }),
    report: () => { if (R.result) download(reportDoc(), fileBase() + '-report.html', 'text/html'); },
    night: () => nightRun(),
    nightPackage: () => nightPackage(),
    csv: () => { if (R.result) download('﻿' + reportCsv(R.result, { t, title: titleOf() }), fileBase() + '-lux.csv', 'text/csv'); },
  };

  // ------------------------------------------------------------------------------------------------ the panel
  const CSS = `.ld { font-size: .85rem; padding: .25rem .1rem; } .ld h4 { font-size: .8rem; margin: .8rem 0 .3rem; font-weight: 600; text-transform: none; }
.ld .ld-row { display: flex; flex-wrap: wrap; gap: .4rem .8rem; align-items: center; margin: .25rem 0; } .ld label { display: inline-flex; flex-wrap: wrap; gap: .3rem; align-items: center; max-width: 100%; }
.ld input[type=number] { width: 5.2rem; } .ld select { max-width: 100%; min-width: 0; text-overflow: ellipsis; } .ld textarea { width: 100%; font-family: monospace; font-size: .75rem; min-height: 4rem; }
.ld .ld-tabs button[aria-pressed="true"] { background: var(--action, #2563eb); color: var(--sheet, #fff); } .ld .ld-note { opacity: .75; } .ld .ld-err { color: #b91c1c; font-weight: 600; }
.ld .ld-warn { color: #92400e; } .ld .ld-ok { color: #166534; } .ld canvas { width: 100%; max-width: 30rem; border: 1px solid var(--line, #888); background: #fff; } .ld table { border-collapse: collapse; } .ld td, .ld th { padding: 0 .8rem 0 0; text-align: left; font-weight: normal; }`;
  const h = (tag, attrs = {}, ...kids) => {
    const n = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (v === false || v === null || v === undefined) continue;
      if (k === 'class') n.className = v; else if (k.startsWith('on')) n.addEventListener(k.slice(2), v); else if (k === 'value') n.value = v; else if (k === 'checked' || k === 'selected' || k === 'disabled') n[k] = !!v; else n.setAttribute(k, v === true ? '' : String(v));
    }
    for (const c of kids.flat()) if (c !== null && c !== undefined && c !== false) n.append(c.nodeType ? c : document.createTextNode(String(c)));
    return n;
  };
  const field = (key, label, o = {}) => h('label', {}, label, h('input', { type: 'number', value: S[key], step: o.step ?? 'any', min: o.min, max: o.max, 'data-ld': key, onchange: (e) => { S[key] = Number(e.target.value); save(); if (o.redraw) render(); } }), o.unit ? h('span', { class: 'ld-note' }, o.unit) : null);
  const choice = (key, label, opts, after) => h('label', {}, label, h('select', { 'data-ld': key, onchange: (e) => { S[key] = e.target.value; save(); if (after) after(e.target.value); render(); } }, opts.map(([v, text]) => h('option', { value: v, selected: S[key] === v }, text))));
  const fmt = (x, d = 0) => (Number.isFinite(x) ? x.toFixed(d) : '-');

  async function readRooms() {
    R.rooms = null;
    try { const r = host ? await host.rooms() : []; R.rooms = Array.isArray(r) ? r : []; } catch (e) { R.rooms = []; }
    render();
  }
  function setOutdoor(on) {
    S.outdoor = !!on;
    if (S.outdoor) { if (S.mode === 'plan') S.mode = 'grid'; if (S.height === DEFAULTS.height) S.height = 6000; if (S.workplane === DEFAULTS.workplane) S.workplane = 0; if (S.margin === DEFAULTS.margin) S.margin = 0; if (!SITE_GENERIC_IDS.includes(S.lum) && S.lum !== 'file' && S.lum !== 'cat') S.lum = 'pole'; }
    else { if (S.mode === 'landscape') S.mode = 'grid'; if (S.height === 6000) S.height = DEFAULTS.height; if (S.workplane === 0) S.workplane = DEFAULTS.workplane; if (S.margin === 0) S.margin = DEFAULTS.margin; if (!GENERIC_IDS.includes(S.lum) && S.lum !== 'file' && S.lum !== 'cat') S.lum = 'panel'; }
    R.layout = null; R.result = null; R.night = null;
  }
  function useRoom(i) {
    const r = R.rooms && R.rooms[i];
    if (!r) return;
    R.roomPick = i;
    S.outline = r.poly.map((q) => Math.round(q[0]) + ', ' + Math.round(q[1])).join('\n');
    if (r.height > 0) S.height = Math.round(r.height);
    if (r.name) S.roomName = String(r.name).slice(0, 60);
    if (r.outdoor && !S.outdoor) setOutdoor(true);   // 0.11 SU.1816: a site area (CivilCraft) is outdoors
    if (r.outdoor && r.features && ((r.features.trees || []).length || (r.features.paths || []).length || (r.features.spots || []).length)) S.mode = 'landscape';
    else if (S.mode === 'landscape') S.mode = 'grid';
    if (Array.isArray(r.windows)) {   // the host knows where the windows are (BimCraft: the model's windows on this room's walls): the height is assumed
      const wins = windowsFromOpenings(r.poly, r.windows, { ceiling: num(S.height, 2800) });
      S.windows = wins.map((q) => [q.edge, q.from, q.width, q.sill, q.head, q.t].join(', ')).join('\n');
    }
    R.layout = null; R.result = null; save(); render();
  }
  function loadFile(file) {
    if (!file) return;
    file.text().then((text) => {
      const r = parsePhotometry(text.slice(0, 2e6), file.name);
      if (!r.ok) { R.error = t('photo.' + r.key, r.vars || {}); render(); return; }
      S.lum = 'file'; S.fileName = String(file.name || '').slice(0, 80); S.fileText = text.length < 400000 ? text : ''; R.photo = r.photo; R.photoName = S.fileName; R.error = ''; R.layout = null; R.result = null;
      save(); render();
    }).catch(() => { R.error = t('err.file'); render(); });
  }

  function mapCanvas(res) {
    const P = res.room.polygon, xs = P.map((p) => p[0]), ys = P.map((p) => p[1]), x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys), Wp = 420, k = (Wp - 16) / (x1 - x0), Hp = Math.round((y1 - y0) * k + 16);
    const cv = h('canvas', { width: Wp, height: Hp, 'data-ld-map': '', role: 'img', 'aria-label': t('map.alt') }), c = cv.getContext('2d');
    c.fillStyle = '#fff'; c.fillRect(0, 0, Wp, Hp);
    const X = (x) => 8 + (x - x0) * k, Y = (y) => 8 + (y1 - y) * k, sp = res.grid.spacing * k, max = Math.max(res.emax, 1e-9);
    res.grid.points.forEach((p, i) => { c.fillStyle = scaleColor(res.grid.values[i], max); c.fillRect(X(p[0]) - sp / 2, Y(p[1]) - sp / 2, sp + 0.6, sp + 0.6); });
    if (S.isolines !== false && res.grid.nx && res.grid.points.length > 8) {   // lines of equal lux (0.11 IL.7)
      c.strokeStyle = 'rgba(17,17,17,.6)'; c.lineWidth = 1; c.fillStyle = '#111'; c.font = '9px sans-serif'; c.beginPath();
      const lines = isolines(gridField(res), niceLevels(res.emin, res.emax, 6));
      for (const { segments } of lines) for (const g of segments) { c.moveTo(X(g[0][0]), Y(g[0][1])); c.lineTo(X(g[1][0]), Y(g[1][1])); }
      c.stroke();
      for (const { level, segments } of lines) if (segments.length) { const g0 = segments[Math.floor(segments.length / 2)][0]; c.fillText(String(Math.round(level * 10) / 10), X(g0[0]) + 2, Y(g0[1]) - 2); }
    }
    c.strokeStyle = '#111'; c.lineWidth = 2; c.beginPath(); P.forEach((p, i) => (i ? c.lineTo(X(p[0]), Y(p[1])) : c.moveTo(X(p[0]), Y(p[1])))); c.closePath(); c.stroke();
    c.fillStyle = '#fff'; c.lineWidth = 1.5;
    for (const L of res.luminaires) { c.beginPath(); c.arc(X(L.p[0]), Y(L.p[1]), 3.5, 0, 6.2832); c.fill(); c.stroke(); }
    return cv;
  }

  // ------------------------------------------------------------------------------------------------ the night view (0.10 SU.1816)
  // The luminaires of the result become lamps of the path tracer (its CPU reference, here on this page) with their webs and colour temperature; beside the picture, a
  // false-colour view of the workplane (or the ground) in lux from the same calculation as the table. The picture shows the room or the site the result is for, built
  // from the outline: not the model. Without the renderer (CadCraft has none) only the false colour and the lamp package are offered.
  const NW = 320, NH = 180;
  let kitP = null;
  const loadKit = () => (!(host && host.renderer) ? Promise.resolve(null) : kitP ||= Promise.all(['pt-pack.js', 'pt-ref.js', 'pt-sampler.js'].map((f) => import('../../render/' + f))).then(([PK, REF, SMP]) => ({ PK, REF, SMP })).catch(() => null));
  function nightData(r, model = null) {
    const outdoor = !!r.outdoor, axes = (host && host.axes) || 'z', llf = num(S.llf, 0.8), obs = obstaclesOf();
    const rl = renderLamps(r.luminaires, { axes, llf, maintained: true, cct: num(S.cct, 3000) || 3000 }), rho = num(S.groundRho, 0.2);
    // 0.11 SU.1816: with the model's own surfaces, the outline adds only the floor or ceiling the model has not got; the lamps sit 20 mm under the ceiling face
    const shell = model ? { floor: !model.floor, ceiling: !model.ceiling, walls: false } : true;
    if (model) {   // under the model's own ceiling (its face may be lower than the height typed for the calculation: the panel says so)
      const up = axes === 'y' ? 1 : 2, top = Number.isFinite(model.ceilingZ) ? model.ceilingZ / 1000 - 0.02 : Infinity;
      for (const L of rl.lamps) L.p = L.p.map((v, k) => (k === up ? Math.min(v - 0.02, top) : v));
    }
    const data = nightScene({ room: r.room, luminaires: r.luminaires, outdoor, obstacles: obs.length ? obs : null, axes, aspect: NW / NH, lamps: rl.lamps, ies: rl.ies, settings: { groundRho: rho }, modelItems: model ? model.items : null, shell });
    const settings = { ...data.settings, ...nightPreset({ lux: r.em, rho: outdoor ? rho : 0.3 }), mode: 'hq', ground: false, ies: rl.ies };
    return { data, rl, settings, axes, outdoor, obstacles: obs.length ? obs : null, llf, model: model ? { tris: model.tris || 0, floor: !!model.floor, ceiling: !!model.ceiling, ceilingZ: Number.isFinite(model.ceilingZ) ? model.ceilingZ : null, height: r.room.height } : null };
  }
  function luxAtFor(r, nd) {
    const wp = r.room.workplane;
    if (nd.outdoor) return (x, y) => siteLuxAt(r.luminaires, x, y, wp, { llf: nd.llf, obstacles: nd.obstacles });
    return (x, y) => workplane(r.prep, r.sol, r.luminaires, [[x, y, wp]], [0, 0, 1], nd.obstacles)[0] * nd.llf;
  }
  async function nightRun() {
    const r = R.result;
    if (!r) return { ok: false };
    const spp = Math.max(1, Math.min(96, num(S.nightQ, 16)));
    R.night = { busy: true, done: 0, of: spp }; render();
    try {
      const kit = await loadKit();
      let model = null;
      if (kit && !r.outdoor && host && typeof host.modelItems === 'function') { try { model = await host.modelItems({ room: r.room }); } catch { model = null; } }
      if (model && !(model.items && model.items.length)) model = null;
      const nd = nightData(r, model);
      let pic = null;
      if (kit) {
        const prog = (a) => { R.night.done = a; const el = pane && pane.querySelector('[data-ld-night-progress]'); if (el) el.textContent = t('night.busy', { a, b: spp }); };
        pic = (await renderNight({ kit, data: nd.data, settings: nd.settings, w: NW, h: NH, spp, onProgress: prog, tick: () => new Promise((ok) => setTimeout(ok, 0)) })).bytes;
      }
      const poly = r.room.polygon, fc = falseColour({ w: NW, h: NH, camera: nd.data.camera, axes: nd.axes, planeZ: r.room.workplane, inside: (x, y) => insidePoly(poly, x, y), luxAt: luxAtFor(r, nd), base: pic });
      R.night = { busy: false, w: NW, h: NH, pic, fc: fc.rgba, legend: fc.legend, range: fc.range, covered: fc.covered, kit: !!kit, exposure: nd.settings.exposure, lamps: nd.rl.lamps.length, webs: Object.keys(nd.rl.ies).length, notes: nd.rl.notes, model: nd.model };
    } catch (e) { R.night = { busy: false, error: failure(e) }; }
    render();
    return { ok: !R.night.error, night: R.night };
  }
  function nightPackage() {
    const r = R.result;
    if (!r) return '';
    const nd = nightData(r);
    return JSON.stringify({ format: 'cadcraft-night-lights', version: 1, units: 'metres', axes: nd.axes, lamps: nd.rl.lamps, ies: nd.rl.ies, settings: nightPreset({ lux: r.em }), camera: nd.data.camera }, null, 1);
  }
  function nightPanel(r) {
    const N = R.night, kids = [h('h4', {}, t('sec.night')), h('p', { class: 'ld-note' }, t(r.outdoor ? 'night.note.site' : host && typeof host.modelItems === 'function' && R.roomPick >= 0 ? 'night.note.model' : 'night.note.room'))];
    kids.push(h('div', { class: 'ld-row' }, ...(r.outdoor ? [field('groundRho', t('f.groundrho'), { step: 0.05, min: 0.02, max: 0.95 })] : []),
      choice('nightQ', t('night.quality'), [[8, t('night.q.draft')], [16, t('night.q.good')], [48, t('night.q.best')]]),
      h('button', { type: 'button', class: 'btn-plot btn-sm-cc', 'data-ld': 'night', disabled: !!(N && N.busy), onclick: () => { nightRun(); } }, t('night.go')),
      h('button', { type: 'button', class: 'btn-line btn-sm-cc', 'data-ld': 'nightpkg', onclick: () => download(nightPackage(), fileBase() + '-night.json', 'application/json') }, t('night.pkg'))));
    if (N && N.busy) kids.push(h('p', { class: 'ld-note', 'data-ld-night-progress': '' }, t('night.busy', { a: N.done, b: N.of })));
    if (N && N.error) kids.push(h('p', { class: 'ld-err', role: 'alert', 'data-ld-night-error': '' }, N.error));
    if (N && !N.busy && !N.error) {
      const cv = (name, bytes, label) => { const c = h('canvas', { width: N.w, height: N.h, 'data-ld-night-canvas': name, role: 'img', 'aria-label': label }); c.getContext('2d').putImageData(new ImageData(bytes, N.w, N.h), 0, 0); return h('figure', { style: 'margin:0' }, c, h('figcaption', { class: 'ld-note' }, label)); };
      kids.push(h('p', { class: 'ld-note', 'data-ld-night-facts': '' }, t('night.facts', { n: N.lamps, w: N.webs, e: fmt(N.exposure, 1) })));
      if (!N.kit) kids.push(h('p', { class: 'ld-warn', 'data-ld-night-nokit': '' }, t('night.nokit')));
      if (N.model) kids.push(h('p', { class: 'ld-note', 'data-ld-night-model': String(N.model.tris) }, t('night.model', { n: N.model.tris }) + (N.model.floor ? '' : ' ' + t('night.model.nofloor')) + (N.model.ceiling ? '' : ' ' + t('night.model.noceiling'))));
      if (N.model && N.model.ceilingZ !== null && Math.abs(N.model.ceilingZ - N.model.height) > 20) kids.push(h('p', { class: 'ld-warn', 'data-ld-night-ceiling': String(N.model.ceilingZ) }, t('night.model.height', { z: N.model.ceilingZ, h: Math.round(N.model.height) })));
      kids.push(h('div', { class: 'ld-row', style: 'align-items:flex-start' }, N.pic ? cv('picture', N.pic, t('night.picture')) : null, cv('false', N.fc, t('night.false'))));
      kids.push(h('div', { class: 'ld-row', 'data-ld-night-legend': '' }, N.legend.map((x) => h('span', { style: 'padding:.1rem .4rem;color:#fff;text-shadow:0 0 2px #000;background:rgb(' + x.rgb.join(',') + ')' }, fmt(x.lux, x.lux < 10 ? 1 : 0) + ' lx'))));
      kids.push(h('ul', { class: 'ld-note' }, N.notes.map((k) => h('li', {}, t(k)))));
    }
    return h('div', { 'data-ld-night': '' }, kids);
  }

  // ------------------------------------------------------------------------------------------------ the person's catalogues: the panel part (0.11 IL.7)
  function catPanel() {
    const cat = catOf(S.catId), kids = [h('h4', {}, t('sec.cat'))];
    kids.push(h('p', { class: 'ld-note', 'data-ld-cat-where': '' }, t('cat.where')));
    kids.push(h('div', { class: 'ld-row' },
      CAT.list.length ? h('label', {}, t('cat.pick'), h('select', { 'data-ld': 'catpick', onchange: (e) => { S.catId = e.target.value; save(); render(); } }, CAT.list.map((c) => h('option', { value: c.id, selected: c.id === S.catId }, c.name + ' (' + c.entries.length + ')')))) : h('span', { class: 'ld-note', 'data-ld-cat-none': '' }, t('cat.empty')),
      h('label', {}, t('cat.new'), h('input', { type: 'text', 'data-ld': 'catname', placeholder: t('cat.default'), maxlength: 60, onchange: (e) => { if (e.target.value.trim()) { newCatalogue(e.target.value); CAT.msg = ''; render(); } } }))));
    kids.push(h('div', { class: 'ld-row' },
      h('label', {}, t('cat.addfiles'), h('input', { type: 'file', multiple: true, accept: '.ies,.ldt', 'data-ld': 'catfiles', onchange: (e) => addToCatalogue(e.target.files) })),
      h('label', {}, t('cat.addfolder'), h('input', { type: 'file', multiple: true, webkitdirectory: true, 'data-ld': 'catfolder', onchange: (e) => addToCatalogue(e.target.files) })),
      cat && h('button', { type: 'button', class: 'btn-line btn-sm-cc', 'data-ld': 'catremove', onclick: () => removeCatalogue(cat.id) }, t('cat.remove'))));
    if (CAT.msg) kids.push(h('p', { class: 'ld-note', 'data-ld-cat-msg': '' }, CAT.msg));
    if (cat && CAT.unsaved.has(cat.id)) kids.push(h('p', { class: 'ld-warn', 'data-ld-cat-unsaved': '' }, t('cat.unsaved')));
    if (cat && cat.entries.length) {
      kids.push(h('div', { class: 'ld-row' },
        h('label', {}, t('cat.search'), h('input', { type: 'search', value: S.catQ, 'data-ld': 'catq', onchange: (e) => { S.catQ = e.target.value; save(); render(); } })),
        choice('catSort', t('cat.sort'), CAT_SORTS.map((k) => [k, t('cat.sort.' + k)])),
        field('catMinLm', t('cat.minlm'), { unit: 'lm', min: 0, redraw: true }), field('catMaxW', t('cat.maxw'), { unit: 'W', min: 0, redraw: true })));
      const found = searchEntries(cat.entries, { q: S.catQ, sort: S.catSort, minLm: num(S.catMinLm, 0), maxW: num(S.catMaxW, 0) }), shown = found.slice(0, 40);
      kids.push(h('p', { class: 'ld-note', 'data-ld-cat-count': String(found.length) }, t('cat.count', { n: found.length, of: cat.entries.length }) + (found.length > shown.length ? ' ' + t('cat.more', { n: shown.length }) : '')));
      // one row a luminaire: the name, then what the file says and the beam worked out here, then Use (two columns: the panel is narrow)
      const facts = (e) => [fmt(e.lumens) + ' lm', e.watts > 0 ? fmt(e.watts, 1) + ' W' : '', e.efficacy > 0 ? fmt(e.efficacy) + ' lm/W' : '', t('cat.c.beam') + ' ' + (e.beam === null ? t('cat.wide') : fmt(e.beam) + '°')].filter(Boolean).join(', ');
      kids.push(h('div', { style: 'max-height:18rem;overflow:auto' }, h('table', { 'data-ld-cat': '', style: 'width:100%' }, shown.map((e) => h('tr', { 'data-ld-cat-row': e.file, 'data-lm': String(Math.round(e.lumens)), 'data-w': String(e.watts), 'data-beam': e.beam === null ? '' : String(Math.round(e.beam)), 'data-eff': String(Math.round(e.efficacy)), class: S.lum === 'cat' && S.catFile === e.file ? 'ld-ok' : '' },
        h('td', { title: e.file, style: 'padding:.25rem .4rem .25rem 0;border-bottom:1px solid var(--line, #ddd)' }, h('strong', { 'data-ld-cat-name': '' }, e.name), h('br'), h('span', { class: 'ld-note', 'data-ld-cat-maker': '' }, (e.maker || t('cat.nomaker')) + ', ' + e.file), h('br'), h('span', { 'data-ld-cat-facts': '' }, facts(e))),
        h('td', { style: 'vertical-align:middle;border-bottom:1px solid var(--line, #ddd)' }, h('button', { type: 'button', class: 'btn-line btn-sm-cc', 'data-ld-cat-use': e.file, onclick: () => useEntry(e.file) }, S.lum === 'cat' && S.catFile === e.file ? t('cat.inuse') : t('cat.use'))))))));
      kids.push(h('p', { class: 'ld-note' }, t('cat.beamnote')));
    }
    return h('div', { 'data-ld-catalogue': '' }, kids);
  }

  // ------------------------------------------------------------------------------------------------ the 3D lux surface (0.11 IL.7): luxSurface drawn on a 2D canvas, drag to turn it
  function surfacePanel(r) {
    const kids = [h('h4', {}, t('sec.3d')), h('label', {}, h('input', { type: 'checkbox', 'data-ld': 'view3d', checked: S.view3d !== false, onchange: (e) => { S.view3d = e.target.checked; save(); render(); } }), t('v3d.show'))];
    if (S.view3d !== false && r.grid.nx && r.grid.points.length > 8) {
      const W = 420, H = 260, fld = gridField(r), surf = luxSurface(fld, { scale: 1 });
      const posts = [];   // the surface's four outermost points (the grid stops short of the walls), each with a line down to the floor
      for (const [ci, cj] of [[0, 0], [fld.nx - 1, 0], [fld.nx - 1, fld.ny - 1], [0, fld.ny - 1]]) {
        let best = -1, bd = Infinity;
        for (let k = 0; k < fld.v.length; k++) { if (Number.isNaN(fld.v[k])) continue; const d = (Math.floor(k / fld.ny) - ci) ** 2 + ((k % fld.ny) - cj) ** 2; if (d < bd) { bd = d; best = k; } }
        if (best >= 0) posts.push([fld.x0 + Math.floor(best / fld.ny) * fld.dx, fld.y0 + (best % fld.ny) * fld.dy, fld.v[best] * surf.heightPerLux]);
      }
      const cv = h('canvas', { width: W, height: H, 'data-ld-3d': String(surf.indices.length / 3), role: 'img', 'aria-label': t('v3d.alt', { min: fmt(r.emin), max: fmt(r.emax) }), style: 'cursor:grab;touch-action:none' });
      const paint = () => {
        const c = cv.getContext('2d'), pr = projectSurface(surf, { yaw: num(S.yaw, 30), pitch: num(S.pitch, 35), w: W, h: H, outline: r.room.polygon, marks: r.luminaires.map((L) => L.p), posts });
        c.fillStyle = '#fff'; c.fillRect(0, 0, W, H);
        c.strokeStyle = '#111'; c.lineWidth = 1.5; c.beginPath(); pr.outline.forEach((q, i) => (i ? c.lineTo(q[0], q[1]) : c.moveTo(q[0], q[1]))); c.closePath(); c.stroke();
        c.strokeStyle = '#888'; c.lineWidth = 1; c.setLineDash([3, 3]); c.beginPath(); for (const [a, b] of pr.posts) { c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); } c.stroke(); c.setLineDash([]);
        c.fillStyle = '#fff'; c.strokeStyle = '#111'; c.lineWidth = 1; for (const q of pr.marks) { c.beginPath(); c.arc(q[0], q[1], 2.5, 0, 6.2832); c.fill(); c.stroke(); }
        for (const tr of pr.tris) { const col = 'rgb(' + tr.rgb.join(',') + ')'; c.fillStyle = col; c.strokeStyle = col; c.lineWidth = 0.6; c.beginPath(); c.moveTo(tr.p[0][0], tr.p[0][1]); c.lineTo(tr.p[1][0], tr.p[1][1]); c.lineTo(tr.p[2][0], tr.p[2][1]); c.closePath(); c.fill(); c.stroke(); }
        cv.dataset.ldYaw = String(Math.round(num(S.yaw, 30))); cv.dataset.ldPitch = String(Math.round(num(S.pitch, 35)));
      };
      let drag = null;
      cv.addEventListener('pointerdown', (e) => { drag = { x: e.clientX, y: e.clientY, yaw: num(S.yaw, 30), pitch: num(S.pitch, 35) }; try { cv.setPointerCapture(e.pointerId); } catch { /* old browser */ } cv.style.cursor = 'grabbing'; });
      cv.addEventListener('pointermove', (e) => { if (!drag) return; S.yaw = ((drag.yaw + (e.clientX - drag.x) * 0.6) % 360 + 360) % 360; S.pitch = Math.max(5, Math.min(90, drag.pitch + (e.clientY - drag.y) * 0.4)); paint(); });
      const end = () => { if (drag) { drag = null; cv.style.cursor = 'grab'; save(); } };
      cv.addEventListener('pointerup', end); cv.addEventListener('pointercancel', end);
      paint();
      kids.push(h('div', {}, cv));
      kids.push(h('div', { class: 'ld-row' }, field('yaw', t('v3d.yaw'), { unit: '°', step: 5, redraw: true }), field('pitch', t('v3d.pitch'), { unit: '°', step: 5, min: 5, max: 90, redraw: true }),
        h('button', { type: 'button', class: 'btn-line btn-sm-cc', 'data-ld': 'v3dreset', onclick: () => { S.yaw = 30; S.pitch = 35; save(); render(); } }, t('v3d.reset'))));
      kids.push(h('p', { class: 'ld-note', 'data-ld-3d-note': '' }, t('v3d.note', { min: fmt(surf.range.min, surf.range.min < 10 ? 1 : 0), max: fmt(surf.range.max) })));
    }
    return h('div', { 'data-ld-surface': '' }, kids);
  }

  // ------------------------------------------------------------------------------------------------ road lighting (0.11 IL.10): road-ui.js
  let roadProblemsSrc = null;
  try { roadProblemsSrc = api.problems && typeof api.problems.source === 'function' ? api.problems.source({ id: 'road', kind: 'check', label: t('road.problems') }) : null; } catch { roadProblemsSrc = null; }
  const road = makeRoad({ S, save, render: () => render(), t, h, field: (...a) => field(...a), choice: (...a) => choice(...a), fmt: (...a) => fmt(...a), host, photoOf, failure, download: (...a) => download(...a), problems: roadProblemsSrc });
  app.road = road;
  function luminairePart(kids) {
    kids.push(h('h4', {}, t('sec.lum')));
    kids.push(h('div', { class: 'ld-row' }, choice('lum', t('f.lum'), [...(S.outdoor || S.roadOn ? SITE_GENERIC_IDS : GENERIC_IDS).map((id) => [id, t('lum.' + id)]), ...(S.fileName ? [['file', S.fileName]] : []), ...(pickedEntry() ? [['cat', t('cat.option', { name: pickedEntry().name })]] : [])], () => { R.layout = null; R.result = null; }),
      h('label', {}, t('lum.load'), h('input', { type: 'file', accept: '.ies,.ldt,text/plain', 'data-ld': 'file', onchange: (e) => loadFile(e.target.files && e.target.files[0]) }))));
    let ph = null; try { ph = photoOf(); } catch { ph = null; }
    kids.push(h('p', { class: 'ld-note', 'data-ld-photo': '' }, ph ? t('lum.facts', { lm: fmt(ph.lumens), w: fmt(ph.watts), name: ph.name || '' }) + (ph.generic ? ' ' + t('lum.generic') : '') : t('lum.nofile')));
    kids.push(catPanel());
  }

  let rendering = false;
  function render() {   // a field that loses focus while the panel is replaced fires its change handler inside replaceChildren: draw again after, never inside
    if (!pane) return;
    if (rendering) { setTimeout(render, 0); return; }
    rendering = true;
    try { renderNow(); } finally { rendering = false; }
  }
  function renderNow() {
    const kids = [];
    kids.push(h('p', { class: 'ld-note' }, t('intro')));
    kids.push(h('div', { class: 'ld-row' }, h('label', {}, h('input', { type: 'checkbox', 'data-ld': 'roadOn', checked: !!S.roadOn, onchange: (e) => { S.roadOn = e.target.checked; if (S.roadOn && !SITE_GENERIC_IDS.includes(S.lum) && S.lum !== 'file' && S.lum !== 'cat') S.lum = 'pole'; save(); render(); } }), t('road.on'))));
    if (S.roadOn) {   // 0.11 IL.10: the road instead of the room
      luminairePart(kids);
      kids.push(road.panel());
      pane.replaceChildren(h('div', { class: 'ld', 'data-ld-root': '' }, kids));
      return;
    }
    // room
    kids.push(h('h4', {}, t('sec.room')));
    if (!host) kids.push(h('p', { class: 'ld-err' }, t('host.none')));
    else {
      const rooms = R.rooms || [];
      kids.push(h('div', { class: 'ld-row' }, rooms.length ? h('label', {}, t('room.pick'), h('select', { 'data-ld': 'roompick', onchange: (e) => { if (e.target.value !== '') useRoom(Number(e.target.value)); } }, h('option', { value: '' }, t('room.choose')), rooms.map((r, i) => h('option', { value: String(i), selected: R.roomPick === i }, (r.name || t('room.unnamed', { n: i + 1 })) + ' · ' + fmt(r.area, 1) + ' m²')))) : h('span', { class: 'ld-note', 'data-ld-rooms': '' }, R.rooms === null ? t('room.reading') : t((host && host.noRoomsKey) || 'room.none')),
        h('button', { type: 'button', class: 'btn-line btn-sm-cc', 'data-ld': 'reread', onclick: () => readRooms() }, t('room.reread'))));
    }
    kids.push(h('div', { class: 'ld-row' }, h('label', {}, h('input', { type: 'checkbox', 'data-ld': 'outdoor', checked: !!S.outdoor, onchange: (e) => { setOutdoor(e.target.checked); save(); render(); } }), t('f.outdoor'))));
    kids.push(h('label', { style: 'display:block' }, t('room.outline'), h('textarea', { 'data-ld': 'outline', onchange: (e) => { S.outline = e.target.value; R.layout = null; R.result = null; save(); } }, S.outline)));
    kids.push(h('div', { class: 'ld-row' }, field('height', t('f.height'), { unit: 'mm', min: 500 }), field('workplane', t('f.workplane'), { unit: 'mm', min: 0 }), field('margin', t('f.margin'), { unit: 'mm', min: 0 })));
    kids.push(h('div', { class: 'ld-row' }, t('f.refl'), field('rc', t('f.rc'), { step: 0.05, min: 0, max: 0.95 }), field('rw', t('f.rw'), { step: 0.05, min: 0, max: 0.95 }), field('rf', t('f.rf'), { step: 0.05, min: 0, max: 0.95 })));
    // luminaire
    luminairePart(kids);
    kids.push(h('div', { class: 'ld-row' }, field('cct', t('f.cct'), { unit: 'K', min: 1700, max: 12000, step: 100 })));
    // layout
    kids.push(h('h4', {}, t('sec.layout')));
    kids.push(h('div', { class: 'ld-row ld-tabs' }, ['plan', 'grid', 'rows', 'landscape'].filter((m) => !(S.outdoor && m === 'plan') && (m !== 'landscape' || (S.outdoor && !!featuresOf()))).map((m) => h('button', { type: 'button', class: 'btn-line btn-sm-cc', 'aria-pressed': S.mode === m ? 'true' : 'false', 'data-ld-mode': m, onclick: () => { S.mode = m; R.layout = null; R.result = null; save(); render(); } }, t('mode.' + m)))));
    kids.push(h('p', { class: 'ld-note' }, t('mode.' + S.mode + '.note')));
    if (S.mode === 'plan') kids.push(h('div', { class: 'ld-row' }, field('targetLux', t('f.target'), { unit: 'lx', min: 1 }), field('planUo', t('f.planuo'), { step: 0.05, min: 0, max: 1 })));
    else if (S.mode === 'grid') kids.push(h('div', { class: 'ld-row' }, field('nx', t('f.nx'), { step: 1, min: 1 }), field('ny', t('f.ny'), { step: 1, min: 1 })));
    else if (S.mode === 'landscape') { const f = featuresOf() || {}; kids.push(h('p', { class: 'ld-note', 'data-ld-landscape': '' }, t('mode.landscape.facts', { trees: (f.trees || []).length, paths: (f.paths || []).length, spots: (f.spots || []).length }))); }
    else kids.push(h('div', { class: 'ld-row' }, field('rows', t('f.rows'), { step: 1, min: 1 }), field('perRow', t('f.perrow'), { step: 1, min: 1 }), choice('along', t('f.along'), [['x', t('along.x')], ['y', t('along.y')]])));
    kids.push(h('div', { class: 'ld-row' }, field('suspension', t('f.susp'), { unit: 'mm', min: 0 }), field('llf', t('f.llf'), { step: 0.01, min: 0.1, max: 1 })));
    // requirements
    kids.push(h('h4', {}, t('sec.req')));
    kids.push(h('div', { class: 'ld-row' }, choice('preset', t('f.preset'), [['', t('preset.custom')], ...PRESETS.map((p) => [p.id, t('preset.' + p.id)])], (v) => { const p = presetById(v); if (p) { S.em = p.em; S.uo = p.uo; S.ugr = p.ugr; S.ra = p.ra; S.targetLux = p.em; S.planUo = p.uo; } save(); })));
    kids.push(h('div', { class: 'ld-row' }, field('em', t('f.em'), { unit: 'lx', min: 0 }), field('uo', t('f.uo'), { step: 0.05, min: 0, max: 1 }), field('ugr', t('f.ugr'), { min: 0 }), field('ra', t('f.ra'), { min: 0 }), field('lpd', t('f.lpd'), { unit: 'W/m²', min: 0 })));
    kids.push(h('p', { class: 'ld-warn' }, REQUIREMENTS_NOTE));
    // windows and daylight (IL.7)
    kids.push(h('h4', {}, t('sec.day')));
    kids.push(h('p', { class: 'ld-note' }, t('day.note')));
    kids.push(h('label', { style: 'display:block' }, t('day.windows'), h('textarea', { 'data-ld': 'windows', onchange: (e) => { S.windows = e.target.value; R.result = null; save(); } }, S.windows)));
    kids.push(h('div', { class: 'ld-row' }, field('eext', t('day.eext'), { unit: 'lx', min: 1 }), field('dfTarget', t('day.target'), { unit: '%', min: 0, step: 0.1 })));
    // furniture and partitions
    kids.push(h('h4', {}, t('sec.obs')));
    kids.push(h('label', { style: 'display:block' }, t('obs.boxes'), h('textarea', { 'data-ld': 'obstacles', onchange: (e) => { S.obstacles = e.target.value; R.result = null; save(); } }, S.obstacles)));
    // emergency lighting (IL.7)
    kids.push(h('h4', {}, t('sec.em')));
    kids.push(h('div', { class: 'ld-row' }, h('label', {}, h('input', { type: 'checkbox', 'data-ld': 'emOn', checked: !!S.emOn, onchange: (e) => { S.emOn = e.target.checked; R.result = null; save(); render(); } }), t('em.on'))));
    if (S.emOn) {
      kids.push(h('div', { class: 'ld-row' }, field('emEvery', t('em.every'), { step: 1, min: 1 }), field('emShare', t('em.share'), { unit: '%', min: 0 }), h('label', {}, h('input', { type: 'checkbox', 'data-ld': 'emOpen', checked: !!S.emOpen, onchange: (e) => { S.emOpen = e.target.checked; save(); } }), t('em.open'))));
      kids.push(h('label', { style: 'display:block' }, t('em.route'), h('textarea', { 'data-ld': 'emRoute', onchange: (e) => { S.emRoute = e.target.value; R.result = null; save(); } }, S.emRoute)));
      kids.push(h('div', { class: 'ld-row' }, field('emRouteMin', t('em.routemin'), { unit: 'lx', min: 0 }), field('emRatio', t('em.ratio'), { min: 0 }), field('emOpenMin', t('em.openmin'), { unit: 'lx', min: 0 })));
      kids.push(h('p', { class: 'ld-warn', 'data-ld-em-note': '' }, EMERGENCY_NOTE));
    }
    // actions (a host without draw(), CivilCraft for now, offers no Draw or Erase)
    const canDraw = !!host && typeof host.draw === 'function';
    kids.push(h('div', { class: 'ld-row', style: 'margin-top:.8rem' },
      h('button', { type: 'button', class: 'btn-plot btn-sm-cc', 'data-ld': 'calc', onclick: () => { run(); } }, t('act.calc')),
      canDraw && h('button', { type: 'button', class: 'btn-line btn-sm-cc', 'data-ld': 'draw', disabled: !R.result || !host, onclick: async () => { try { const r = await app.draw(); R.message = r.surface !== undefined ? t('draw.done.model', { n: r.n, s: r.surface ? t('draw.surface') : '' }) : r.lux !== undefined ? t('draw.done.bim', { n: r.n, lux: r.lux }) : t('draw.done', { n: r.n }); say(R.message); } catch (e) { R.error = failure(e); } render(); } }, t('act.draw')),
      canDraw && h('button', { type: 'button', class: 'btn-line btn-sm-cc', 'data-ld': 'erase', disabled: !host || !host.count(), onclick: async () => { try { const n = await host.erase(); R.message = t('erase.done', { n }); } catch (e) { R.error = failure(e); } render(); } }, t('act.erase')),
      h('button', { type: 'button', class: 'btn-line btn-sm-cc', 'data-ld': 'report', disabled: !R.result, onclick: () => app.report() }, t('act.report')),
      h('button', { type: 'button', class: 'btn-line btn-sm-cc', 'data-ld': 'csv', disabled: !R.result, onclick: () => app.csv() }, t('act.csv'))));
    if (R.error) kids.push(h('p', { class: 'ld-err', role: 'alert', 'data-ld-error': '' }, R.error));
    if (R.message) kids.push(h('p', { 'data-ld-message': '' }, R.message));
    // result
    const r = R.result;
    if (r) {
      kids.push(h('h4', {}, t('sec.result')));
      const rows = [[t('rep.count'), r.count + (R.layout && R.layout.nx && S.mode !== 'rows' ? ' (' + R.layout.nx + ' × ' + R.layout.ny + ')' : '')], [t('rep.em'), fmt(r.em) + ' lx'], [t('rep.emin') + ' / ' + t('rep.emax'), fmt(r.emin) + ' / ' + fmt(r.emax) + ' lx'], [t('rep.uo'), fmt(r.uo, 2)],
        ['UGR', r.ugr === null ? '-' : fmt(r.ugr, 1)], [t('rep.walls') + ' / ' + t('rep.ceiling'), fmt(r.surfaces.walls) + ' / ' + fmt(r.surfaces.ceiling) + ' lx'], [t('rep.lpd'), fmt(r.lpd, 2) + ' W/m² (' + fmt(r.lpd100, 2) + ' per 100 lx)'], [t('rep.direct'), Math.round(r.directShare * 100) + ' %']];
      kids.push(h('table', { 'data-ld-result': '' }, rows.map(([a, b]) => h('tr', {}, h('th', { class: 'ld-note' }, a), h('td', {}, b)))));
      if (r.checks.length) kids.push(h('ul', { 'data-ld-checks': '' }, r.checks.map((c) => h('li', { class: c.ok ? 'ld-ok' : 'ld-warn', 'data-ld-check': c.key + (c.ok ? ':ok' : ':fail') }, (c.ok ? '✓ ' : '✗ ') + t('chk.' + c.key) + ' ' + (c.op === '>=' ? '≥' : '≤') + ' ' + fmt(c.req, c.key === 'uo' ? 2 : 0) + ' — ' + fmt(c.found, c.key === 'uo' ? 2 : c.key === 'ugr' ? 1 : 0)))));
      kids.push(h('p', { class: 'ld-note' }, t('map.note', { max: fmt(r.emax) })), h('label', {}, h('input', { type: 'checkbox', 'data-ld': 'isolines', checked: S.isolines !== false, onchange: (e) => { S.isolines = e.target.checked; save(); render(); } }), t('map.isolines')), mapCanvas(r));
      kids.push(surfacePanel(r));
      kids.push(h('ul', { class: 'ld-note' }, r.notes.map((k) => h('li', {}, t(k)))));
      kids.push(nightPanel(r));
      if (r.daylightError) kids.push(h('p', { class: 'ld-err', role: 'alert', 'data-ld-day-error': '' }, r.daylightError));
      if (r.daylight) {
        const d = r.daylight, tgt = num(S.dfTarget, 0);
        kids.push(h('h4', {}, t('sec.dayres')));
        kids.push(h('table', { 'data-ld-day': '' }, [[t('day.df'), fmt(d.dfAvg, 2) + ' %'], [t('day.dfminmax'), fmt(d.dfMin, 2) + ' / ' + fmt(d.dfMax, 2) + ' %'], [t('day.uo'), fmt(d.uo, 2)], [t('day.lux'), fmt(d.luxAvg) + ' lx (' + fmt(d.eext) + ' lx)'], [t('day.glazing'), fmt(d.windowArea, 2) + ' m² (' + fmt(d.glazingRatio * 100, 1) + ' %)']].map(([a, b]) => h('tr', {}, h('th', { class: 'ld-note' }, a), h('td', {}, b)))));
        if (tgt > 0) kids.push(h('p', { class: d.shareAbove(tgt) >= 0.5 ? 'ld-ok' : 'ld-warn', 'data-ld-day-share': '' }, t('day.share', { p: fmt(d.shareAbove(tgt) * 100), df: fmt(tgt, 1) })));
        if (d.dropped.length) kids.push(h('p', { class: 'ld-warn' }, t('day.dropped', { n: d.dropped.length })));
        kids.push(h('ul', { class: 'ld-note' }, d.notes.map((k) => h('li', {}, t(k)))));
      }
      if (r.emergencyError) kids.push(h('p', { class: 'ld-err', role: 'alert', 'data-ld-em-error': '' }, r.emergencyError));
      if (r.emergency) {
        const e = r.emergency;
        kids.push(h('h4', {}, t('sec.emres')));
        kids.push(h('p', { class: 'ld-note' }, t('em.facts', { n: e.count, of: e.of, share: fmt(e.share * 100) })));
        kids.push(h('table', { 'data-ld-emres': '' }, [[t('em.r.route'), e.route.min === null ? '-' : fmt(e.route.min, 2) + ' / ' + fmt(e.route.max, 2) + ' lx'], [t('em.r.open'), e.open.min === null ? '-' : fmt(e.open.min, 2) + ' / ' + fmt(e.open.max, 2) + ' lx']].map(([a, b]) => h('tr', {}, h('th', { class: 'ld-note' }, a), h('td', {}, b)))));
        if (e.checks.length) kids.push(h('ul', { 'data-ld-emchecks': '' }, e.checks.map((c) => h('li', { class: c.ok ? 'ld-ok' : 'ld-warn', 'data-ld-emcheck': c.key + (c.ok ? ':ok' : ':fail') }, (c.ok ? '✓ ' : '✗ ') + t('chk.' + c.key) + ' ' + (c.op === '>=' ? '≥' : '≤') + ' ' + fmt(c.req, 1) + ' (' + (Number.isFinite(c.found) ? fmt(c.found, 2) : '∞') + ')'))));
        kids.push(h('ul', { class: 'ld-note' }, e.notes.map((k) => h('li', {}, t(k)))));
      }
    }
    pane.replaceChildren(h('div', { class: 'ld', 'data-ld-root': '' }, kids));
  }

  // ------------------------------------------------------------------------------------------------ mounting
  styleEl = document.createElement('style'); styleEl.textContent = CSS; document.head.append(styleEl);
  api.ui.panelTab({ id: 'lightdesign', title: t('tab'), render: (el) => { pane = el; if (R.rooms === null && host) readRooms(); else render(); } });
  try {
    api.files.exporter({ id: 'lightdesign-report', label: t('export.report'), extension: 'html', mime: 'text/html', write: async () => { const r = run(); if (!r.ok) throw new Error(r.message); return reportDoc(); } });
    api.files.exporter({ id: 'lightdesign-csv', label: t('export.csv'), extension: 'csv', mime: 'text/csv', write: async () => { const r = run(); if (!r.ok) throw new Error(r.message); return '﻿' + reportCsv(R.result, { t, title: titleOf() }); } });
  } catch (e) { api.log('exporters not added', e); /* i18n-ignore */ }
  if (host && typeof host.start === 'function') { try { host.start(app); } catch (e) { api.log('host start failed', e); /* i18n-ignore */ } }
  api.onDeactivate(() => { pane = null; try { styleEl.remove(); } catch { /* no page */ } });
  window.ccLightDesign = { state: S, result: R, run, render, host, app, readRooms, useRoom, api, catalogues: CAT, addToCatalogue, useEntry, newCatalogue, removeCatalogue, road };   // for the tests and the console
  api.log('Interior lighting design ready');   // i18n-ignore (developer log)
}
