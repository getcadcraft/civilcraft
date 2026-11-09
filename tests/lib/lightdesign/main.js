/* SPDX-License-Identifier: Apache-2.0 */
/**
 * main.js — the Interior lighting design add-on (0.9 LD, session `lightdesign-09`): a room, luminaires from photometry files, and the illuminance, uniformity, glare and
 * power that come out, with the light that bounces off the surfaces. One add-on for every host: the engine is lib/ (DOM-free), the only things that touch an app are this
 * panel and the host adapter (host.js; hosts/cad.js for CadCraft, hosts/bim.js for BimCraft).
 *
 *   The host (detect(api, { t })) provides rooms() → [{ name, poly [[x, y]] mm, area (m²), height? mm }] (may be a Promise), draw({ luminaires, result, room }) → { n },
 *   erase() → n, count(), start(app). app (handed to host.start): run() → { ok, message, summary }, draw() → { n }, report(), csv().
 * Panel: Room → Luminaire → Layout (plan for a target | grid | rows) → Requirements → Calculate → result, map, checks → Draw / Report / CSV.
 */
import { genericPhoto, GENERIC_IDS, parsePhotometry, gridLayout, rowLayout, planLayout, runDesign, PRESETS, presetById, REQUIREMENTS_NOTE, DEFAULT_ROOM, polyArea, scaleColor, reportHtml, reportCsv, cleanRoom, runDaylight, runEmergency, pickEmergency, cleanObstacles, checkWindows, windowsFromOpenings, EMERGENCY_NOTE, EMERGENCY_DEFAULTS, DEFAULT_EEXT } from './lib/index.js';
import * as hostMod from './host.js';

const DEFAULTS = {
  outline: '0, 0\n6000, 0\n6000, 4000\n0, 4000', roomName: '', height: 2800, workplane: 800, margin: 500, rc: 0.7, rw: 0.5, rf: 0.2,
  lum: 'panel', fileName: '', fileText: '', mode: 'plan', targetLux: 500, planUo: 0.6, nx: 3, ny: 2, rows: 2, perRow: 4, along: 'x', suspension: 0, llf: 0.8,
  preset: 'office.writing', em: 500, uo: 0.6, ugr: 19, ra: 80, lpd: 0, spacing: 0, eyeHeight: 1200,
  windows: '', eext: DEFAULT_EEXT, dfTarget: 0, obstacles: '', emOn: false, emEvery: 2, emShare: 100, emRoute: '', emOpen: true, emRouteMin: EMERGENCY_DEFAULTS.route.min, emRatio: EMERGENCY_DEFAULTS.route.ratio, emOpenMin: EMERGENCY_DEFAULTS.open.min,
};

export function activate(api) {
  const t = (k, v) => api.t(k, v);
  const host = typeof hostMod.detect === 'function' ? hostMod.detect(api, { t }) : null;
  const S = { ...DEFAULTS, ...(safe(() => api.storage.get('settings')) || {}) };
  const R = { rooms: null, roomPick: -1, photo: null, photoName: '', layout: null, result: null, error: '', message: '', busy: false };
  let pane = null, styleEl = null;
  function safe(fn) { try { return fn(); } catch { return null; } }
  const save = () => { safe(() => api.storage.set('settings', { ...S })); };
  const num = (v, d) => (Number.isFinite(Number(v)) ? Number(v) : d);
  const say = (m) => { try { api.print(m); } catch { /* no history */ } };

  // ------------------------------------------------------------------------------------------------ the work
  function outline() {
    return String(S.outline).split(/\n|;/).map((l) => l.trim().split(/[\s,]+/).map(Number)).filter((p) => p.length >= 2 && p.every(Number.isFinite)).map((p) => [p[0], p[1]]);
  }
  const roomOf = () => cleanRoom({ polygon: outline(), height: num(S.height, 2800), workplane: num(S.workplane, 800), margin: num(S.margin, 500), refl: { ceiling: num(S.rc, 0.7), walls: num(S.rw, 0.5), floor: num(S.rf, 0.2) } });
  function photoOf() {
    if (S.lum === 'file') {
      if (R.photo && R.photoName === S.fileName) return R.photo;
      if (!S.fileText) throw Object.assign(new Error('err.nofile'), { key: 'err.nofile' });
      const r = parsePhotometry(S.fileText, S.fileName);
      if (!r.ok) throw Object.assign(new Error(r.key), { key: 'photo.' + r.key, vars: r.vars });
      R.photo = r.photo; R.photoName = S.fileName;
      return R.photo;
    }
    return genericPhoto(GENERIC_IDS.includes(S.lum) ? S.lum : 'panel');
  }
  const reqOf = () => ({ em: num(S.em, 0), uo: num(S.uo, 0), ugr: num(S.ugr, 0), ra: num(S.ra, 0), lpd: num(S.lpd, 0) });
  const failure = (e) => (e && e.key ? t(e.key, e.vars || {}) : String((e && e.message) || e));

  function place() {
    const room = roomOf(), photo = photoOf(), z = room.height - Math.max(0, num(S.suspension, 0));
    if (S.mode === 'plan') {
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
      for (const L of R.layout.luminaires) L.photo = photo;
      const res = runDesign({ room, luminaires: R.layout.luminaires, llf: num(S.llf, 0.8), spacing: num(S.spacing, 0), requirements: reqOf(), eyeHeight: num(S.eyeHeight, 1200), obstacles: obstacles.length ? obstacles : null });
      res.luminaires = R.layout.luminaires; res.photo = photo;
      if (obstacles.length) res.notes.push('note.obstruct');
      res.daylight = null; res.daylightError = ''; res.emergency = null; res.emergencyError = '';
      if (windowsOf().length) {
        try { res.daylight = runDaylight({ room, windows: windowsOf(), eext: num(S.eext, DEFAULT_EEXT) || DEFAULT_EEXT, spacing: num(S.spacing, 0) }); } catch (e) { res.daylightError = failure(e); }
      }
      if (S.emOn) {
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
  const nameOf = () => (S.lum === 'file' ? (R.photo && R.photo.name) || S.fileName : t('lum.' + S.lum));
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
    draw: () => (host && R.result ? host.draw({ luminaires: R.result.luminaires, result: R.result, room: R.result.room }) : { n: 0 }),
    report: () => { if (R.result) download(reportDoc(), fileBase() + '-report.html', 'text/html'); },
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
  function useRoom(i) {
    const r = R.rooms && R.rooms[i];
    if (!r) return;
    R.roomPick = i;
    S.outline = r.poly.map((q) => Math.round(q[0]) + ', ' + Math.round(q[1])).join('\n');
    if (r.height > 0) S.height = Math.round(r.height);
    if (r.name) S.roomName = String(r.name).slice(0, 60);
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
    c.strokeStyle = '#111'; c.lineWidth = 2; c.beginPath(); P.forEach((p, i) => (i ? c.lineTo(X(p[0]), Y(p[1])) : c.moveTo(X(p[0]), Y(p[1])))); c.closePath(); c.stroke();
    c.fillStyle = '#fff'; c.lineWidth = 1.5;
    for (const L of res.luminaires) { c.beginPath(); c.arc(X(L.p[0]), Y(L.p[1]), 3.5, 0, 6.2832); c.fill(); c.stroke(); }
    return cv;
  }

  function render() {
    if (!pane) return;
    const kids = [];
    kids.push(h('p', { class: 'ld-note' }, t('intro')));
    // room
    kids.push(h('h4', {}, t('sec.room')));
    if (!host) kids.push(h('p', { class: 'ld-err' }, t('host.none')));
    else {
      const rooms = R.rooms || [];
      kids.push(h('div', { class: 'ld-row' }, rooms.length ? h('label', {}, t('room.pick'), h('select', { 'data-ld': 'roompick', onchange: (e) => { if (e.target.value !== '') useRoom(Number(e.target.value)); } }, h('option', { value: '' }, t('room.choose')), rooms.map((r, i) => h('option', { value: String(i), selected: R.roomPick === i }, (r.name || t('room.unnamed', { n: i + 1 })) + ' · ' + fmt(r.area, 1) + ' m²')))) : h('span', { class: 'ld-note', 'data-ld-rooms': '' }, R.rooms === null ? t('room.reading') : t('room.none')),
        h('button', { type: 'button', class: 'btn-line btn-sm-cc', 'data-ld': 'reread', onclick: () => readRooms() }, t('room.reread'))));
    }
    kids.push(h('label', { style: 'display:block' }, t('room.outline'), h('textarea', { 'data-ld': 'outline', onchange: (e) => { S.outline = e.target.value; R.layout = null; R.result = null; save(); } }, S.outline)));
    kids.push(h('div', { class: 'ld-row' }, field('height', t('f.height'), { unit: 'mm', min: 500 }), field('workplane', t('f.workplane'), { unit: 'mm', min: 0 }), field('margin', t('f.margin'), { unit: 'mm', min: 0 })));
    kids.push(h('div', { class: 'ld-row' }, t('f.refl'), field('rc', t('f.rc'), { step: 0.05, min: 0, max: 0.95 }), field('rw', t('f.rw'), { step: 0.05, min: 0, max: 0.95 }), field('rf', t('f.rf'), { step: 0.05, min: 0, max: 0.95 })));
    // luminaire
    kids.push(h('h4', {}, t('sec.lum')));
    kids.push(h('div', { class: 'ld-row' }, choice('lum', t('f.lum'), [...GENERIC_IDS.map((id) => [id, t('lum.' + id)]), ...(S.fileName ? [['file', S.fileName]] : [])], () => { R.layout = null; R.result = null; }),
      h('label', {}, t('lum.load'), h('input', { type: 'file', accept: '.ies,.ldt,text/plain', 'data-ld': 'file', onchange: (e) => loadFile(e.target.files && e.target.files[0]) }))));
    let ph = null; try { ph = photoOf(); } catch { ph = null; }
    kids.push(h('p', { class: 'ld-note', 'data-ld-photo': '' }, ph ? t('lum.facts', { lm: fmt(ph.lumens), w: fmt(ph.watts), name: ph.name || '' }) + (ph.generic ? ' ' + t('lum.generic') : '') : t('lum.nofile')));
    // layout
    kids.push(h('h4', {}, t('sec.layout')));
    kids.push(h('div', { class: 'ld-row ld-tabs' }, ['plan', 'grid', 'rows'].map((m) => h('button', { type: 'button', class: 'btn-line btn-sm-cc', 'aria-pressed': S.mode === m ? 'true' : 'false', 'data-ld-mode': m, onclick: () => { S.mode = m; R.layout = null; R.result = null; save(); render(); } }, t('mode.' + m)))));
    kids.push(h('p', { class: 'ld-note' }, t('mode.' + S.mode + '.note')));
    if (S.mode === 'plan') kids.push(h('div', { class: 'ld-row' }, field('targetLux', t('f.target'), { unit: 'lx', min: 1 }), field('planUo', t('f.planuo'), { step: 0.05, min: 0, max: 1 })));
    else if (S.mode === 'grid') kids.push(h('div', { class: 'ld-row' }, field('nx', t('f.nx'), { step: 1, min: 1 }), field('ny', t('f.ny'), { step: 1, min: 1 })));
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
    // actions
    kids.push(h('div', { class: 'ld-row', style: 'margin-top:.8rem' },
      h('button', { type: 'button', class: 'btn-plot btn-sm-cc', 'data-ld': 'calc', onclick: () => { run(); } }, t('act.calc')),
      h('button', { type: 'button', class: 'btn-line btn-sm-cc', 'data-ld': 'draw', disabled: !R.result || !host, onclick: async () => { try { const r = await app.draw(); R.message = r.lux !== undefined ? t('draw.done.bim', { n: r.n, lux: r.lux }) : t('draw.done', { n: r.n }); say(R.message); } catch (e) { R.error = failure(e); } render(); } }, t('act.draw')),
      h('button', { type: 'button', class: 'btn-line btn-sm-cc', 'data-ld': 'erase', disabled: !host || !host.count(), onclick: async () => { try { const n = await host.erase(); R.message = t('erase.done', { n }); } catch (e) { R.error = failure(e); } render(); } }, t('act.erase')),
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
      kids.push(h('p', { class: 'ld-note' }, t('map.note', { max: fmt(r.emax) })), mapCanvas(r));
      kids.push(h('ul', { class: 'ld-note' }, r.notes.map((k) => h('li', {}, t(k)))));
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
  window.ccLightDesign = { state: S, result: R, run, render, host, app, readRooms, useRoom, api };   // for the tests and the console
  api.log('Interior lighting design ready');   // i18n-ignore (developer log)
}
