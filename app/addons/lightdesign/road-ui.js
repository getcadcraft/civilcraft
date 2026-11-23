/* SPDX-License-Identifier: Apache-2.0 */
/**
 * road-ui.js — the Road lighting part of the lighting design panel (0.11 IL.10, session `road-light-11`). The engine is lib/road.js (DOM-free); this file is the
 * inputs, the result and the plan picture. main.js shows it instead of the room when "Road lighting" is ticked.
 *
 *   makeRoad(ctx) → { panel(), run(), csv(), state }     ctx = { S, save, render, t, h, field, choice, fmt, host, photoOf, failure, problems (a Problems source or null) }
 * A host may offer roads() → [{ name, section: { strips }, note? }] (CivilCraft: its alignments' assemblies, hosts/civil.js); else the person types the section.
 */
import { runRoad, cleanSection, parseRTable, classValues, CLASS_SETS, RP8_00, PAVEMENTS, ARRANGEMENTS, STRIP_KINDS, ROAD_GRID, roadProblems, roadCsv } from './lib/index.js';

export const ROAD_DEFAULTS = {
  roadOn: false, rdSection: 'footway, 2\ncarriageway, 7, 2\nfootway, 2', rdType: 'single', rdSide: 'left', rdSpacing: 30, rdHeight: 8, rdOverhang: 1, rdTilt: 0, rdTurn: 0, rdCw: 1,
  rdAlong: ROAD_GRID.along, rdAcross: ROAD_GRID.across, rdRtable: '', rdAge: 0, rdSet: 'own', rdClass: '', rdPave: 'R3',
  rdL: 0, rdUo: 0, rdUl: 0, rdTi: 0, rdEir: 0, rdE: 0, rdUoE: 0, rdRatio: 0, rdVeil: 0, rdFE: 0, rdFEmin: 0, rdFEmax: 0,
};
const REQ = [['L', 'rdL', 'cd/m²'], ['uo', 'rdUo', ''], ['ul', 'rdUl', ''], ['ti', 'rdTi', '%'], ['eir', 'rdEir', ''], ['veil', 'rdVeil', ''], ['E', 'rdE', 'lx'], ['uoE', 'rdUoE', ''], ['ratio', 'rdRatio', ''], ['fE', 'rdFE', 'lx'], ['fEmin', 'rdFEmin', 'lx'], ['fEmax', 'rdFEmax', 'lx']];

/** "kind, width[, lanes[, oneway]]" a line (kind in English: carriageway, footway, cycleway, verge, median) → { strips }. */
export function sectionFromText(text) {
  const strips = [];
  for (const line of String(text || '').split(/\n|;/)) {
    const c = line.split(/[,\t]+/).map((x) => x.trim()).filter(Boolean);
    if (c.length < 2) continue;
    const kind = c[0].toLowerCase();
    if (!STRIP_KINDS.includes(kind)) continue;
    strips.push({ kind, width: Number(c[1]), lanes: c[2] !== undefined ? Number(c[2]) : undefined, oneWay: /^one/i.test(c[3] || '') });
  }
  return { strips };
}
export const sectionToText = (sec) => (sec.strips || []).map((s) => [s.kind, Math.round(s.width * 1000) / 1000, ...(s.kind === 'carriageway' ? [s.lanes || 1, ...(s.oneWay ? ['one-way'] : [])] : [])].join(', ')).join('\n');

export function makeRoad(ctx) {
  const { S, save, t, h, field, choice, fmt } = ctx;
  const R = { roads: null, loading: false, result: null, error: '', rt: null, rtError: '' };
  const num = (v, d) => (Number.isFinite(Number(v)) ? Number(v) : d);
  const rerender = () => ctx.render();

  function rtable() {
    R.rtError = '';
    if (!String(S.rdRtable || '').trim()) return null;
    const r = parseRTable(S.rdRtable);
    if (!r.ok) { R.rtError = t('road.' + r.key, r.vars || {}); return null; }
    return r.table;
  }
  const reqOf = () => Object.fromEntries(REQ.map(([k, s]) => [k, num(S[s], 0)]));
  function applyClass() {
    const v = S.rdSet === 'own' ? null : classValues(S.rdSet, S.rdClass, { pavement: S.rdPave });
    if (!v) return;
    for (const [k, s] of REQ) S[s] = v[k] ?? 0;
  }
  const arrangement = () => ({ type: S.rdType, side: S.rdSide, spacing: num(S.rdSpacing, 30), height: num(S.rdHeight, 8), overhang: num(S.rdOverhang, 0), tilt: num(S.rdTilt, 0), turn: num(S.rdTurn, 0), cw: Math.max(0, num(S.rdCw, 1) - 1) });
  function run() {
    R.error = ''; R.result = null;
    try {
      const photo = ctx.photoOf(), rt = rtable();
      if (R.rtError) throw Object.assign(new Error('rt'), { key: 'road.err.rtable' });
      R.result = runRoad({ section: sectionFromText(S.rdSection), arrangement: arrangement(), photo, llf: num(S.llf, 0.8), grid: { along: num(S.rdAlong, 10), across: num(S.rdAcross, 3) }, rtable: rt, observer: { age: num(S.rdAge, 0) }, requirements: reqOf() });
      try { ctx.problems && ctx.problems.set(roadProblems(R.result, t, { label: S.rdSet === 'own' ? '' : S.rdClass })); } catch { /* no Problems panel */ }
    } catch (e) { R.error = ctx.failure(e); rerender(); return { ok: false, message: R.error }; }
    rerender();
    const c = R.result.carriageways[0];
    return { ok: true, summary: { e: Math.round(c.E.avg * 10) / 10, l: c.luminance ? Math.round(c.luminance.avg * 100) / 100 : null, ti: c.ti === null ? null : Math.round(c.ti * 10) / 10, n: R.result.count } };
  }
  async function readRoads() {
    if (R.loading) return;
    R.loading = true; R.roads = null; rerender();   // the panel shows "Reading…" and does not start a second read while this one runs
    try { const r = ctx.host && typeof ctx.host.roads === 'function' ? await ctx.host.roads() : []; R.roads = Array.isArray(r) ? r : []; } catch { R.roads = []; }
    R.loading = false; rerender();
  }
  function useRoad(i) {
    const r = R.roads && R.roads[i];
    if (!r) return;
    S.rdSection = sectionToText(r.section); S.rdRoadName = String(r.name || '').slice(0, 60);
    const cws = cleanSection(r.section).strips.filter((s) => s.kind === 'carriageway');
    if (S.rdCw > cws.length) S.rdCw = 1;
    R.result = null; save(); rerender();
  }

  // the plan of the field: strips, the grid in false colour (lux), the luminaires; x along the road (the field and half a spacing each side), y across
  function planCanvas(res) {
    const sec = res.section, sp = res.spacing, W = 420, x0 = -sp / 2, x1 = sp * 1.5, k = (W - 16) / (x1 - x0), Hc = Math.max(60, Math.round(sec.width * k + 16));
    const cv = h('canvas', { width: W, height: Hc, 'data-ld-road-plan': String(res.luminaires.length), role: 'img', 'aria-label': t('road.plan.alt') }), c = cv.getContext('2d');
    const X = (x) => 8 + (x - x0) * k, Y = (y) => 8 + (sec.width - y) * k;
    c.fillStyle = '#fff'; c.fillRect(0, 0, W, Hc);
    const tint = { carriageway: '#d9d9d9', footway: '#efe6d6', cycleway: '#e2eedd', verge: '#e6f0e0', median: '#e6f0e0' };
    for (const s of sec.strips) { c.fillStyle = tint[s.kind] || '#eee'; c.fillRect(X(x0), Y(s.y1), (x1 - x0) * k, s.width * k); }
    const all = [...res.carriageways.map((a) => ({ pts: a.points, vals: a.values })), ...res.footways.map((a) => ({ pts: a.points, vals: a.values }))];
    const max = Math.max(1e-9, ...all.flatMap((a) => a.vals)), D = res.grid.D;
    for (const a of all) a.pts.forEach((p, i) => { const f = Math.min(1, a.vals[i] / max); c.fillStyle = 'hsl(' + Math.round(240 * (1 - f)) + ' 75% 50%)'; c.fillRect(X(p[0]) - (D * k) / 2 + 0.5, Y(p[1]) - 3, D * k - 1, 6); });
    c.strokeStyle = '#111'; c.lineWidth = 1; c.setLineDash([4, 3]);
    for (const s of sec.strips) if (s.kind === 'carriageway') for (let j = 1; j < s.lanes; j++) { c.beginPath(); c.moveTo(X(x0), Y(s.y0 + j * s.laneWidth)); c.lineTo(X(x1), Y(s.y0 + j * s.laneWidth)); c.stroke(); }
    c.setLineDash([]); c.strokeStyle = '#2563eb'; c.lineWidth = 1.5; c.strokeRect(X(0), Y(sec.width), sp * k, sec.width * k);
    c.fillStyle = '#fff'; c.strokeStyle = '#111';
    for (const L of res.luminaires) { c.beginPath(); c.arc(X(L.p[0]), Y(L.p[1]), 4, 0, 6.2832); c.fill(); c.stroke(); }
    return cv;
  }

  function resultPanel(res) {
    const kids = [h('h4', {}, t('road.sec.result'))];
    kids.push(h('p', { class: 'ld-note', 'data-ld-road-facts': '' }, t('road.facts', { n: res.count, s: fmt(res.spacing, 1), along: res.grid.along, across: res.grid.across, d: fmt(res.grid.D, 2), llf: fmt(res.llf, 2) })));
    for (const c of res.carriageways) {
      const rows = [[t('road.r.e'), fmt(c.E.avg, 1) + ' / ' + fmt(c.E.min, 1) + ' / ' + fmt(c.E.max, 1) + ' lx'], [t('road.r.uoe'), fmt(c.E.uo, 2) + ' (' + t('road.r.ratio') + ' ' + (c.E.ratio === null ? '∞' : fmt(c.E.ratio, 2)) + ')']];
      if (c.luminance) {
        rows.push([t('road.r.l'), fmt(c.luminance.avg, 2) + ' cd/m²'], [t('road.r.uol'), fmt(c.luminance.uo, 2) + ' / ' + fmt(c.luminance.ul, 2)]);
        rows.push([t('road.r.ti'), fmt(c.ti, 1) + ' % (Lv ' + fmt(c.lv.max, 3) + ' cd/m², ' + t('road.r.lane', { n: c.lv.lane + 1 }) + ')'], [t('road.r.veil'), fmt(c.lvRatio, 2)]);
      } else rows.push([t('road.r.l'), t('road.r.nol')], [t('road.r.lv'), fmt(c.lv.max, 3) + ' cd/m² (' + t('road.r.lane', { n: c.lv.lane + 1 }) + ')']);
      rows.push([t('road.r.eir'), (c.eir.left === null ? '-' : fmt(c.eir.left, 2)) + ' / ' + (c.eir.right === null ? '-' : fmt(c.eir.right, 2))]);
      kids.push(h('p', { style: 'margin:.4rem 0 .1rem;font-weight:600' }, t('road.area.cw', { n: c.index + 1 }) + ' · ' + t('road.lanes', { n: c.lanes, w: fmt(c.laneWidth, 2) })));
      kids.push(h('table', { 'data-ld-road-cw': String(c.index) }, rows.map(([a, b]) => h('tr', {}, h('th', { class: 'ld-note' }, a), h('td', {}, b)))));
      if (c.luminance && c.luminance.observers.length > 1) kids.push(h('p', { class: 'ld-note', 'data-ld-road-obs': '' }, c.luminance.observers.map((o) => t('road.r.obs', { n: o.lane + 1, l: fmt(o.avg, 2), uo: fmt(o.uo, 2), ul: fmt(o.ul, 2) })).join(' · ')));
    }
    for (const f of res.footways) kids.push(h('p', { 'data-ld-road-fw': String(f.index) }, h('strong', {}, t('road.area.fw', { n: f.index + 1 }) + ' (' + t('road.kind.' + f.kind) + '): '), fmt(f.E.avg, 1) + ' / ' + fmt(f.E.min, 1) + ' / ' + fmt(f.E.max, 1) + ' lx, Uo ' + fmt(f.E.uo, 2)));
    if (res.checks.length) {
      kids.push(h('ul', { 'data-ld-road-checks': '' }, res.checks.map((c) => h('li', { class: c.ok === true ? 'ld-ok' : 'ld-warn', 'data-ld-road-check': c.area + '.' + c.key + ':' + (c.ok === true ? 'ok' : c.ok === false ? 'fail' : 'unknown') },
        (c.ok === true ? '✓ ' : c.ok === false ? '✗ ' : '? ') + t(c.area.startsWith('cw') ? 'road.area.cw' : 'road.area.fw', { n: Number(c.area.slice(2)) + 1 }) + ': ' + t('road.chk.' + c.key) + ' ' + (c.op === '>=' ? '≥' : '≤') + ' ' + fmt(c.req, c.req < 10 ? 2 : 1) + ' — ' + (c.found === null ? t('road.chk.needs') : c.found === Infinity ? '∞' : fmt(c.found, c.found < 10 ? 2 : 1))))));
      kids.push(h('p', { class: 'ld-warn' }, t('road.chk.claim')));
    }
    kids.push(h('p', { class: 'ld-note' }, t('road.plan.note')), planCanvas(res));
    kids.push(h('ul', { class: 'ld-note' }, res.notes.map((k) => h('li', {}, t(k)))));
    return h('div', { 'data-ld-road-result': '' }, kids);
  }

  function panel() {
    const kids = [h('h4', {}, t('road.sec.road'))];
    kids.push(h('p', { class: 'ld-note' }, t('road.intro')));
    if (ctx.host && typeof ctx.host.roads === 'function') {
      if (R.roads === null && !R.loading) setTimeout(readRoads, 0);   // after this render, never inside it
      const roads = R.roads || [];
      kids.push(h('div', { class: 'ld-row' }, roads.length ? h('label', {}, t('road.pick'), h('select', { 'data-ld': 'roadpick', onchange: (e) => { if (e.target.value !== '') useRoad(Number(e.target.value)); } }, h('option', { value: '' }, t('road.choose')), roads.map((r, i) => h('option', { value: String(i) }, r.name + (r.note ? ' · ' + r.note : ''))))) : h('span', { class: 'ld-note', 'data-ld-roads': '' }, R.roads === null ? t('room.reading') : t('road.none')),
        h('button', { type: 'button', class: 'btn-line btn-sm-cc', 'data-ld': 'roadreread', onclick: () => readRoads() }, t('room.reread'))));
    }
    kids.push(h('label', { style: 'display:block' }, t('road.section'), h('textarea', { 'data-ld': 'rdSection', onchange: (e) => { S.rdSection = e.target.value; R.result = null; save(); } }, S.rdSection)));
    kids.push(h('p', { class: 'ld-note' }, t('road.section.note')));
    kids.push(h('h4', {}, t('road.sec.arr')));
    kids.push(h('div', { class: 'ld-row' }, choice('rdType', t('road.arr'), ARRANGEMENTS.map((a) => [a, t('road.arr.' + a)])), S.rdType === 'single' ? choice('rdSide', t('road.side'), [['left', t('road.side.left')], ['right', t('road.side.right')]]) : null, field('rdCw', t('road.cw'), { step: 1, min: 1 })));
    kids.push(h('div', { class: 'ld-row' }, field('rdSpacing', t('road.spacing'), { unit: 'm', min: 3 }), field('rdHeight', t('road.height'), { unit: 'm', min: 2 }), field('rdOverhang', t('road.overhang'), { unit: 'm' }), field('rdTilt', t('road.tilt'), { unit: '°', min: -15, max: 45 }), field('rdTurn', t('road.turn'), { unit: '°', step: 90 })));
    kids.push(h('p', { class: 'ld-note' }, t('road.arr.note')));
    kids.push(h('div', { class: 'ld-row' }, field('rdAlong', t('road.along'), { step: 1, min: 2 }), field('rdAcross', t('road.across'), { step: 1, min: 1 }), field('llf', t('f.llf'), { step: 0.01, min: 0.1, max: 1 }), field('rdAge', t('road.age'), { unit: t('road.years'), min: 0 })));
    kids.push(h('p', { class: 'ld-note' }, t('road.grid.note')));
    kids.push(h('h4', {}, t('road.sec.surface')));
    kids.push(h('label', { style: 'display:block' }, t('road.rtable'), h('textarea', { 'data-ld': 'rdRtable', placeholder: t('road.rtable.ph'), onchange: (e) => { S.rdRtable = e.target.value; R.result = null; save(); rerender(); } }, S.rdRtable)));
    const rt = rtable();
    kids.push(h('p', { class: R.rtError ? 'ld-err' : 'ld-note', 'data-ld-rtable': rt ? rt.betas.length + 'x' + rt.tans.length : R.rtError ? 'error' : 'none' }, R.rtError || (rt ? t('road.rtable.ok', { b: rt.betas.length, n: rt.tans.length, max: fmt(rt.tans[rt.tans.length - 1], 2) }) : t('road.rtable.none'))));
    kids.push(h('h4', {}, t('road.sec.req')));
    const sets = [['own', t('road.set.own')], ['m', t('road.set.m')], ['c', t('road.set.c')], ['p', t('road.set.p')], ['rp8', t('road.set.rp8')]];
    const ids = S.rdSet === 'rp8' ? RP8_00.map((r) => [r.id, t('road.rp8.' + r.road) + ', ' + t('road.rp8.c.' + r.conflict)]) : S.rdSet !== 'own' ? Object.keys(CLASS_SETS[S.rdSet].rows).map((k) => [k, k]) : [];
    kids.push(h('div', { class: 'ld-row' }, choice('rdSet', t('road.set'), sets, () => { S.rdClass = ''; }),
      ids.length ? choice('rdClass', t('road.class'), [['', t('road.class.pick')], ...ids], () => { applyClass(); save(); }) : null,
      S.rdSet === 'rp8' ? choice('rdPave', t('road.pave'), PAVEMENTS.map((p) => [p, p]), () => { applyClass(); save(); }) : null));
    kids.push(h('p', { class: 'ld-warn', 'data-ld-road-source': S.rdSet }, t(S.rdSet === 'own' ? 'road.src.own' : S.rdSet === 'rp8' ? 'road.src.rp8' : CLASS_SETS[S.rdSet].source)));
    kids.push(h('div', { class: 'ld-row' }, REQ.slice(0, 6).map(([k, s, u]) => field(s, t('road.chk.' + k), { unit: u, min: 0, step: 'any' }))));
    kids.push(h('div', { class: 'ld-row' }, REQ.slice(6).map(([k, s, u]) => field(s, t('road.chk.' + k), { unit: u, min: 0, step: 'any' }))));
    kids.push(h('div', { class: 'ld-row', style: 'margin-top:.8rem' },
      h('button', { type: 'button', class: 'btn-plot btn-sm-cc', 'data-ld': 'roadcalc', onclick: () => { run(); } }, t('act.calc')),
      h('button', { type: 'button', class: 'btn-line btn-sm-cc', 'data-ld': 'roadcsv', disabled: !R.result, onclick: () => ctx.download('﻿' + roadCsv(R.result), 'road-lighting.csv', 'text/csv') }, t('act.csv'))));
    if (R.error) kids.push(h('p', { class: 'ld-err', role: 'alert', 'data-ld-road-error': '' }, R.error));
    if (R.result) kids.push(resultPanel(R.result));
    return h('div', { 'data-ld-road': '' }, kids);
  }
  return { panel, run, readRoads, useRoad, csv: () => (R.result ? roadCsv(R.result) : ''), state: R };
}
