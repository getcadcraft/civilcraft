/* SPDX-License-Identifier: Apache-2.0 */
/**
 * frame-panel.js — the frame analysis panel both apps show (0.6 LC.4; DetailCraft's Analysis tab, BimCraft's Analysis
 * panel): model assumptions, load cases and combinations, loads on the selected members, Run, results in a table and on
 * the model, the report (PDF, CSV) and the model as a CraftScript file for PartCraft's frame3d. An analysis aid, not a
 * code check — the panel says so first. Imports only the other lib/frame modules: the page's DOM helper, words and model
 * come from the app (`host`), so the copy in each app is byte-identical (tools/frame/sync.mjs).
 *
 *   framePanel(host) → { panel() → [nodes], run(), modelChanged(), clear(), result, setMode(mode), setSet(key) }
 *   defaultAnalysis(t) · cleanAnalysis(untrusted) → settings | null · partResults(parts, sol, key)
 *   host = {
 *     el(tag, props, …children), t(key, fills)                     the app's ui-util el() and i18n t()
 *     cls: { block, note, head, table, btn, primary, link, select, input, error }   the app's class names
 *     version() → number                                           changes whenever the model changes (results go stale)
 *     analysis() → settings                                        { bases, beamEnds, braces, cases, combos, supports, ends }
 *     setAnalysis(label, next)                                     one undo step (the app cleans `next`)
 *     analyse() → { frame, sol }                                   frame = { model, parts, nodes, skipped, notes, warnings }
 *     selection() → [id]                                           selected drawn members that can carry loads
 *     member(id) → { label, type: beam|column|brace, profile, start, end } | null
 *     select(id), print(text), download(name, data, type), fileName()
 *     show(frame, sol, key, { mode, scale }) → { max, scale }, hide()   results on the model
 *     settings: ['bases', 'beamEnds', 'braces']                    which assumption rules this app offers
 *   }
 * Words: keys frame.ui.*, frame.case.*, frame.note.*, frame.err.*, frame.warn.*, frame.dof.*, frame.kind.*, frame.rep.*
 * (tools/frame/lang.mjs is the one table; tools/frame/sync.mjs writes it into both apps' language files).
 */
import { CASE_KINDS, LOAD_DIRS } from './frame-model.js';
import { memberExtremes } from './frame-solve.js';
import { reportData, reportTables, reportCsv, KN, KNM } from './frame-report.js';
import { reportPdf } from './frame-pdf.js';
import { toCraftScript } from './frame-craft.js';

export const MODES = ['deflected', 'My', 'Mz', 'N', 'Vz', 'Vy', 'T', 'off'];
export const DIRS = ['down', 'X', 'Y', 'Z', 'x', 'y', 'z'];
const ACTIONS = ['N', 'Vy', 'Vz', 'T', 'My', 'Mz'];
/** Language key of a direction: down, global gx gy gz, the member's own lx ly lz (keys are lower case). */
const dirKey = (d) => (d === 'down' ? 'down' : (d === d.toUpperCase() ? 'g' : 'l') + d.toLowerCase());

/** A starting analysis: Dead (own weight), Live, Dead + Live; bases fixed, beam ends rigid, braces pinned. */
export function defaultAnalysis(t) {
  return {
    bases: 'fixed', beamEnds: 'rigid', braces: 'pinned',
    cases: [{ id: 'D', name: t('frame.case.dead'), kind: 'dead', selfWeight: 1, loads: [] }, { id: 'L', name: t('frame.case.live'), kind: 'live', selfWeight: 0, loads: [] }],
    combos: [{ id: 'C1', name: t('frame.case.dl'), factors: [{ case: 'D', f: 1 }, { case: 'L', f: 1 }] }],
    supports: [], ends: [],
  };
}

const txt = (s, max = 60) => String(s ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, max);
const fin = (v, lo = -1e12, hi = 1e12) => { const n = Number(v); return Number.isFinite(n) && n >= lo && n <= hi ? n : null; };
const vec3 = (a) => (Array.isArray(a) && a.length === 3 && a.every((x) => fin(x) !== null) ? a.map(Number) : null);
const six = (a) => (Array.isArray(a) && a.length === 6 ? a.map((x) => fin(x ?? 0) ?? 0) : null);
const flags = (a) => (Array.isArray(a) && a.length === 6 ? a.map((x) => x === true || x === 1) : null);

/** Untrusted analysis settings (from a model file, an IFC property, the clipboard) → clean, or null. Members are named
 *  by the app's own ids (DetailCraft member ids, IFC GlobalIds); loads naming no member are kept: the member may come
 *  back with an undo; the app's frame builder skips them. */
export function cleanAnalysis(a) {
  if (!a || typeof a !== 'object') return null;
  const out = { bases: a.bases === 'pinned' ? 'pinned' : 'fixed', beamEnds: a.beamEnds === 'pinned' ? 'pinned' : 'rigid', braces: a.braces === 'rigid' ? 'rigid' : 'pinned', cases: [], combos: [], supports: [], ends: [] };
  const ids = new Set();
  for (const c of (Array.isArray(a.cases) ? a.cases : []).slice(0, 50)) {
    const id = txt(c?.id, 20);
    if (!id || ids.has(id)) continue;
    ids.add(id);
    const loads = [];
    for (const l of (Array.isArray(c.loads) ? c.loads : []).slice(0, 20000)) { const L = cleanLoad(l); if (L) loads.push(L); }
    out.cases.push({ id, name: txt(c.name) || id, kind: CASE_KINDS.includes(c.kind) ? c.kind : 'other', selfWeight: fin(c.selfWeight ?? 0, -100, 100) ?? 0, loads });
  }
  const cids = new Set();
  for (const c of (Array.isArray(a.combos) ? a.combos : []).slice(0, 100)) {
    const id = txt(c?.id, 20);
    if (!id || cids.has(id)) continue;
    cids.add(id);
    const factors = (Array.isArray(c.factors) ? c.factors : []).slice(0, 50).map((f) => ({ case: txt(f?.case, 20), f: fin(f?.f, -1000, 1000) })).filter((f) => ids.has(f.case) && f.f !== null);
    out.combos.push({ id, name: txt(c.name) || id, factors });
  }
  for (const s of (Array.isArray(a.supports) ? a.supports : []).slice(0, 5000)) { const at = vec3(s?.at), fix = flags(s?.fix); if (at && fix) out.supports.push({ at, fix }); }
  for (const e of (Array.isArray(a.ends) ? a.ends : []).slice(0, 20000)) {
    const member = txt(e?.member, 40);
    if (member && (e.end === 'start' || e.end === 'end') && (e.kind === 'rigid' || e.kind === 'pinned')) out.ends.push({ member, end: e.end, kind: e.kind });
  }
  return out;
}

function cleanLoad(l) {
  if (!l || typeof l !== 'object') return null;
  if (l.type === 'node') { const at = vec3(l.at), F = six(l.F); return at && F ? { type: 'node', at, F } : null; }
  const member = txt(l.member, 40);
  if (!member || !LOAD_DIRS.includes(l.dir)) return null;
  if (l.type === 'udl') {
    const w = fin(l.w);
    if (w === null) return null;
    const o = { type: 'udl', member, dir: l.dir, w };
    const w2 = l.w2 === undefined || l.w2 === null ? null : fin(l.w2);
    if (w2 !== null && w2 !== w) o.w2 = w2;
    const a = l.a === undefined || l.a === null ? null : fin(l.a, 0), b = l.b === undefined || l.b === null ? null : fin(l.b, 0);
    if (a !== null) o.a = a;
    if (b !== null) o.b = b;
    if (a !== null && b !== null && b <= a) return null;
    return o;
  }
  if (l.type === 'point') { const P = fin(l.P), a = fin(l.a, 0); return P === null || a === null ? null : { type: 'point', member, dir: l.dir, P, a }; }
  return null;
}


/** Per drawn member: the largest of each action over its analysed pieces (parts: Map(id → [{ k, s0, s1 }])). */
export function partResults(parts, sol, key) {
  const R = sol.results[key];
  const out = new Map();
  if (!R) return out;
  for (const [id, list] of parts) {
    let ext = null;
    for (const q of list) {
      const e = memberExtremes(sol.prep, R, q.k);
      if (!ext) { ext = {}; for (const a of ACTIONS) ext[a] = { ...e[a], xMax: e[a].xMax + q.s0, xMin: e[a].xMin + q.s0 }; ext.defl = { ...e.defl, x: e.defl.x + q.s0 }; continue; }
      for (const a of ACTIONS) {
        if (e[a].max > ext[a].max) { ext[a].max = e[a].max; ext[a].xMax = e[a].xMax + q.s0; }
        if (e[a].min < ext[a].min) { ext[a].min = e[a].min; ext[a].xMin = e[a].xMin + q.s0; }
        ext[a].abs = Math.max(Math.abs(ext[a].max), Math.abs(ext[a].min));
      }
      if (e.defl.value > ext.defl.value) ext.defl = { ...e.defl, x: e.defl.x + q.s0 };
    }
    if (ext) out.set(id, { ext, pieces: list.length });
  }
  return out;
}

export function framePanel(host) {
  const { el, t } = host;
  const C = host.cls;
  let result = null;       // { version, frame, sol, ms, error, shown }
  let setKey = '';
  let mode = 'deflected';
  let scale = 0;
  const form = { kind: 'udl', dir: 'down', value: '', a: '', b: '', case: '' };

  const current = () => host.analysis() || defaultAnalysis(t);
  function change(label, fn) { const next = JSON.parse(JSON.stringify(current())); fn(next); return host.setAnalysis(label, next); }
  const stale = () => !result || result.version !== host.version();
  const rerender = () => host.rerender?.();

  function run() {
    const t0 = Date.now();
    let out;
    try { out = host.analyse(); }
    catch (err) { result = { version: host.version(), error: { code: 'internal', message: err?.message || String(err) } }; host.hide(); host.print(errorText(result)); rerender(); return result; }
    result = { version: host.version(), frame: out.frame, sol: out.sol, ms: Date.now() - t0 };
    if (!out.sol.ok) { result.error = out.sol.error; host.hide(); host.print(errorText(result)); rerender(); return result; }
    const keys = Object.keys(out.sol.results);
    if (!keys.includes(setKey)) setKey = keys.find((k) => k.startsWith('combo:')) || keys[0] || '';
    draw();
    host.print(t('frame.ui.ran', { members: out.frame.model.members.length, dofs: out.sol.dofs, ms: result.ms }));
    rerender();
    return result;
  }
  function draw() {
    if (!result || result.error || stale()) { host.hide(); return; }
    result.shown = host.show(result.frame, result.sol, setKey, { mode, scale });
  }
  const pointOf = (nodeId) => { const n = result?.frame?.nodes?.find((x) => x.id === nodeId); return n ? '(' + n.p.map((v) => Math.round(v)).join(', ') + ')' : nodeId || ''; };
  function errorText(r) {
    const e = r.error;
    if (!e) return '';
    if (e.code === 'internal') return t('frame.err.internal', { message: e.message });
    return t('frame.err.' + e.code, { at: pointOf(e.node), dof: e.dof !== undefined ? t('frame.dof.' + e.dof) : '', member: e.member || '' });
  }

  // ---- downloads ----
  function tablesNow() {
    const data = reportData(result.frame.model, result.sol);
    const notes = result.frame.notes.map((x) => t(x.key, { n: x.n }));
    return reportTables(data, t, { notes, model: result.frame.model });
  }
  function exportPdf() {
    const today = new Date().toISOString().slice(0, 10);
    const { bytes, missing } = reportPdf(tablesNow(), { title: t('frame.ui.report-title'), sub: [result.frame.model.name, today].filter(Boolean).join('   '), page: (n, of) => t('frame.ui.page', { n, of }), continued: t('frame.ui.continued') });
    host.download(host.fileName() + '-analysis.pdf', bytes, 'application/pdf');
    host.print(missing ? t('frame.ui.pdf-missing', { n: missing }) : t('frame.ui.pdf-done'));
  }
  function exportCsv() {
    host.download(host.fileName() + '-analysis.csv', '﻿' + reportCsv(tablesNow()), 'text/csv');
    host.print(t('frame.ui.csv-done'));
  }
  function exportCraft() {
    const fm = result?.frame ? result.frame.model : host.analyse().frame.model;
    const text = toCraftScript(fm, { title: t('frame.ui.craft-title', { name: fm.name || '' }), note: t('frame.ui.craft-note') });
    host.download(host.fileName() + '-frame.craft', text, 'text/plain');
    host.print(t('frame.ui.craft-done'));
  }

  // ---- pieces of the panel ----
  const sel = (value, options, onchange, attrs = {}) => el('select', { className: C.select, onchange: (e) => onchange(e.target.value), ...attrs }, ...options.map(([v, label]) => el('option', { value: v, selected: v === value }, label)));
  const btn = (label, onclick, attrs = {}) => el('button', { type: 'button', className: C.btn, onclick, ...attrs }, label);
  const link = (label, onclick, attrs = {}) => el('button', { type: 'button', className: C.link, onclick, ...attrs }, label);
  const head = (text, ...extra) => el('div', { className: C.head }, el('h3', {}, text), ...extra);
  const field = (label, control) => el('label', { className: 'fa-field' }, el('span', {}, label), control);
  const note = (text, attrs = {}) => el('p', { className: C.note, ...attrs }, text);
  const table = (heads, numeric, rows, attrs = {}) => el('div', { className: 'fa-wrap' }, el('table', { className: C.table, ...attrs },
    el('thead', {}, el('tr', {}, ...heads.map((h, i) => el('th', { scope: 'col', className: numeric.includes(i) ? 'n' : '' }, h)))),
    el('tbody', {}, ...rows)));
  const td = (v, num) => el('td', { className: num ? 'n' : '' }, v);

  function settingsBlock() {
    const a = current();
    const rules = { bases: ['fixed', 'pinned'], beamEnds: ['rigid', 'pinned'], braces: ['pinned', 'rigid'] };
    return el('div', { className: C.block + ' fa-settings' },
      head(t('frame.ui.h-assume')),
      el('div', { className: 'fa-row' }, ...(host.settings || Object.keys(rules)).map((key) =>
        field(t('frame.ui.f-' + key.toLowerCase()), sel(a[key], rules[key].map((v) => [v, t('frame.ui.opt-' + v)]), (v) => change(t('frame.ui.undo-settings'), (x) => { x[key] = v; }), { 'data-fa-setting': key })))),
      note(t('frame.ui.assume-note')));
  }

  function casesBlock() {
    const a = current();
    const nextId = (list, p) => { let k = list.length + 1; while (list.some((x) => x.id === p + k)) k++; return p + k; };
    const caseRows = a.cases.map((c, i) => el('tr', {},
      el('td', {}, el('input', { type: 'text', className: C.input, value: c.name, 'aria-label': t('frame.ui.f-casename'), onchange: (e) => change(t('frame.ui.undo-case'), (x) => { x.cases[i].name = e.target.value; }) })),
      el('td', {}, sel(c.kind, CASE_KINDS.map((k) => [k, t('frame.kind.' + k)]), (v) => change(t('frame.ui.undo-case'), (x) => { x.cases[i].kind = v; }), { 'aria-label': t('frame.ui.col-kind') })),
      el('td', {}, el('input', { type: 'checkbox', checked: !!c.selfWeight, 'aria-label': t('frame.ui.col-self'), onchange: (e) => change(t('frame.ui.undo-case'), (x) => { x.cases[i].selfWeight = e.target.checked ? 1 : 0; }) })),
      td(String(c.loads.length), true),
      el('td', {}, a.cases.length > 1 ? link(t('frame.ui.remove'), () => change(t('frame.ui.undo-case-remove'), (x) => { const id = x.cases[i].id; x.cases.splice(i, 1); for (const cb of x.combos) cb.factors = cb.factors.filter((f) => f.case !== id); })) : null)));
    const comboRows = a.combos.map((cb, i) => el('tr', {},
      el('td', {}, el('input', { type: 'text', className: C.input, value: cb.name, 'aria-label': t('frame.ui.f-comboname'), onchange: (e) => change(t('frame.ui.undo-combo'), (x) => { x.combos[i].name = e.target.value; }) })),
      ...a.cases.map((c) => {
        const f = cb.factors.find((x) => x.case === c.id);
        return el('td', {}, el('input', { type: 'text', inputMode: 'decimal', className: C.input + ' fa-factor', value: f ? String(f.f) : '', 'aria-label': t('frame.ui.f-factor', { name: c.name }),
          onchange: (e) => change(t('frame.ui.undo-combo'), (x) => {
            const v = Number(String(e.target.value).replace(',', '.'));
            const fs = x.combos[i].factors.filter((q) => q.case !== c.id);
            if (e.target.value.trim() !== '' && Number.isFinite(v)) fs.push({ case: c.id, f: v });
            x.combos[i].factors = fs;
          }) }));
      }),
      el('td', {}, link(t('frame.ui.remove'), () => change(t('frame.ui.undo-combo-remove'), (x) => { x.combos.splice(i, 1); })))));
    return el('div', { className: C.block },
      head(t('frame.ui.h-cases'), btn(t('frame.ui.case-add'), () => change(t('frame.ui.undo-case-add'), (x) => { x.cases.push({ id: nextId(x.cases, 'C'), name: t('frame.case.new', { n: x.cases.length + 1 }), kind: 'other', selfWeight: 0, loads: [] }); }), { 'data-fa-case-add': '' })),
      table([t('frame.ui.col-case'), t('frame.ui.col-kind'), t('frame.ui.col-self'), t('frame.ui.col-loads'), ''], [3], caseRows, { 'data-fa-cases': '' }),
      head(t('frame.ui.h-combos'), btn(t('frame.ui.combo-add'), () => change(t('frame.ui.undo-combo-add'), (x) => { x.combos.push({ id: nextId(x.combos, 'K'), name: t('frame.case.combo-new', { n: x.combos.length + 1 }), factors: x.cases.map((c) => ({ case: c.id, f: 1 })) }); }), { 'data-fa-combo-add': '' })),
      a.combos.length ? table([t('frame.ui.col-combo'), ...a.cases.map((c) => c.name), ''], [], comboRows, { 'data-fa-combos': '' }) : note(t('frame.ui.combos-none')),
      note(t('frame.ui.combos-note')));
  }

  function loadText(l) {
    const v = l.type === 'udl' ? l.w : l.P / 1000;
    const down = l.dir === 'Z' && v < 0;
    const dir = down ? t('frame.ui.dir-down') : t('frame.ui.dir-' + dirKey(l.dir));
    const mag = Number((down ? -v : v).toFixed(3));
    if (l.type === 'udl') return t('frame.ui.load-udl', { w: mag, dir, range: l.a !== undefined || l.b !== undefined ? t('frame.ui.load-range', { a: Math.round(l.a ?? 0), b: l.b !== undefined ? Math.round(l.b) : t('frame.ui.load-end') }) : '' });
    return t('frame.ui.load-point', { p: mag, dir, a: Math.round(l.a) });
  }

  function loadsBlock() {
    const a = current();
    const ids = host.selection();
    if (!form.case || !a.cases.some((c) => c.id === form.case)) form.case = a.cases[0]?.id || '';
    const unit = form.kind === 'udl' ? t('frame.ui.unit-knm') : t('frame.ui.unit-kn');
    const input = (key, label) => field(label, el('input', { type: 'text', inputMode: 'decimal', className: C.input, value: form[key], oninput: (e) => { form[key] = e.target.value; }, 'data-fa-load': key }));
    function add() {
      const v = Number(String(form.value).replace(',', '.'));
      if (!ids.length) { host.print(t('frame.ui.load-none-selected')); return; }
      if (!Number.isFinite(v) || v === 0) { host.print(t('frame.ui.load-bad-value')); return; }
      const dir = form.dir === 'down' ? 'Z' : form.dir, sign = form.dir === 'down' ? -1 : 1;
      const num = (s) => (String(s).trim() === '' ? null : Number(String(s).replace(',', '.')));
      const aa = num(form.a), bb = num(form.b);
      if ((aa !== null && !(aa >= 0)) || (bb !== null && !(bb > (aa ?? 0)))) { host.print(t('frame.ui.load-bad-range')); return; }
      change(t('frame.ui.undo-load-add', { n: ids.length }), (x) => {
        const c = x.cases.find((q) => q.id === form.case);
        for (const id of ids) {
          if (form.kind === 'udl') c.loads.push({ type: 'udl', member: id, dir, w: sign * v, ...(aa !== null ? { a: aa } : {}), ...(bb !== null ? { b: bb } : {}) });
          else if (form.kind === 'point') c.loads.push({ type: 'point', member: id, dir, P: sign * v * 1000, a: aa ?? 0 });
          else {
            const m = host.member(id);
            const F = [0, 0, 0, 0, 0, 0];
            F[{ X: 0, Y: 1, Z: 2 }[dir] ?? 2] = sign * v * 1000;
            c.loads.push({ type: 'node', at: [...(form.kind === 'start' ? m.start : m.end)], F });
          }
        }
      });
      host.print(t('frame.ui.load-added', { n: ids.length }));
    }
    const kinds = ['udl', 'point', 'start', 'end'];
    const dirs = form.kind === 'start' || form.kind === 'end' ? ['down', 'X', 'Y', 'Z'] : DIRS;
    if (!dirs.includes(form.dir)) form.dir = 'down';
    const listed = [];
    for (const id of ids.slice(0, 20)) for (const c of a.cases) c.loads.forEach((l, i) => { if (l.member === id) listed.push({ c, l, i, id }); });
    return el('div', { className: C.block },
      head(t('frame.ui.h-loads')),
      note(ids.length ? t('frame.ui.load-sel', { n: ids.length }) : t('frame.ui.load-pick')),
      el('div', { className: 'fa-row' },
        field(t('frame.ui.f-case'), sel(form.case, a.cases.map((c) => [c.id, c.name]), (v) => { form.case = v; }, { 'data-fa-load': 'case' })),
        field(t('frame.ui.f-loadkind'), sel(form.kind, kinds.map((k) => [k, t('frame.ui.kind-' + k)]), (v) => { form.kind = v; rerender(); }, { 'data-fa-load': 'kind' })),
        field(t('frame.ui.f-dir'), sel(form.dir, dirs.map((d) => [d, t('frame.ui.dir-' + dirKey(d))]), (v) => { form.dir = v; }, { 'data-fa-load': 'dir' })),
        input('value', t('frame.ui.f-value', { unit })),
        form.kind === 'udl' || form.kind === 'point' ? input('a', form.kind === 'udl' ? t('frame.ui.f-from') : t('frame.ui.f-at')) : null,
        form.kind === 'udl' ? input('b', t('frame.ui.f-to')) : null,
        btn(t('frame.ui.load-add'), add, { 'data-fa-load-add': '', disabled: !ids.length })),
      listed.length ? table([t('frame.ui.col-case'), t('frame.ui.col-member'), t('frame.ui.col-load'), ''], [], listed.map(({ c, l, i, id }) => el('tr', {},
        td(c.name), td(host.member(id)?.label || id), td(loadText(l)),
        el('td', {}, link(t('frame.ui.remove'), () => change(t('frame.ui.undo-load-remove'), (x) => { x.cases.find((q) => q.id === c.id).loads.splice(i, 1); })))))) : null,
      nodeLoads(a),
      endsBlock(ids));
  }
  /** Loads at points (node loads), with a way to take them off. */
  function nodeLoads(a) {
    const rows = [];
    for (const c of a.cases) c.loads.forEach((l, i) => { if (l.type === 'node') rows.push({ c, l, i }); });
    if (!rows.length) return null;
    return table([t('frame.ui.col-case'), t('frame.ui.col-at'), t('frame.ui.col-load'), ''], [], rows.slice(0, 200).map(({ c, l, i }) => {
      const k = Math.max(0, l.F.findIndex((v) => v !== 0)), v = (l.F[k] || 0) / 1000;
      const down = k === 2 && v < 0;
      const dir = down ? t('frame.ui.dir-down') : t('frame.ui.dir-' + ['gx', 'gy', 'gz', 'gx', 'gy', 'gz'][k]);
      return el('tr', {}, td(c.name), td('(' + l.at.map((q) => Math.round(q)).join(', ') + ')'), td(t('frame.ui.load-node', { p: Number((down ? -v : v).toFixed(3)), dir })),
        el('td', {}, link(t('frame.ui.remove'), () => change(t('frame.ui.undo-load-remove'), (x) => { x.cases.find((q) => q.id === c.id).loads.splice(i, 1); }))));
    }), { 'data-fa-node-loads': '' });
  }
  /** One selected member's own end releases and, for a column, its own base. */
  function endsBlock(ids) {
    if (ids.length !== 1) return null;
    const a = current(), id = ids[0], m = host.member(id);
    if (!m) return null;
    const own = (end) => a.ends.find((e) => e.member === id && e.end === end)?.kind || 'rule';
    const setEnd = (end, v) => change(t('frame.ui.undo-ends'), (x) => { x.ends = x.ends.filter((e) => !(e.member === id && e.end === end)); if (v !== 'rule') x.ends.push({ member: id, end, kind: v }); });
    const out = ['start', 'end'].map((end) => field(t('frame.ui.f-' + end), sel(own(end), ['rule', 'rigid', 'pinned'].map((v) => [v, t('frame.ui.end-' + v)]), (v) => setEnd(end, v), { 'data-fa-end': end })));
    if (m.type === 'column') {
      const foot = m.start[2] <= m.end[2] ? m.start : m.end;
      const near = (p) => Math.hypot(p[0] - foot[0], p[1] - foot[1], p[2] - foot[2]) <= 1;
      const s = a.supports.find((x) => near(x.at));
      const cur = !s ? 'rule' : s.fix.every(Boolean) ? 'fixed' : !s.fix.some(Boolean) ? 'free' : 'pinned';
      out.push(field(t('frame.ui.f-base'), sel(cur, ['rule', 'fixed', 'pinned', 'free'].map((v) => [v, t('frame.ui.base-' + v)]), (v) => change(t('frame.ui.undo-base'), (x) => {
        x.supports = x.supports.filter((q) => !near(q.at));
        const fix = { fixed: [true, true, true, true, true, true], pinned: [true, true, true, false, false, true], free: [false, false, false, false, false, false] }[v];
        if (fix) x.supports.push({ at: [...foot], fix });
      }), { 'data-fa-base': '' })));
    }
    return el('div', { className: 'fa-row' }, el('span', { className: 'fa-lead' }, t('frame.ui.ends-of', { name: m.label })), ...out);
  }

  function resultsBlock() {
    const out = [];
    const ok = result && !result.error && !stale();
    out.push(el('div', { className: C.head }, el('h3', {}, t('frame.ui.h-results')),
      el('button', { type: 'button', className: C.primary, onclick: run, 'data-fa-run': '' }, t('frame.ui.run')),
      link(t('frame.ui.pdf'), exportPdf, { disabled: !ok, 'data-fa-pdf': '' }),
      link(t('frame.ui.csv'), exportCsv, { disabled: !ok, 'data-fa-csv': '' }),
      link(t('frame.ui.craft'), exportCraft, { 'data-fa-craft': '' })));
    if (!result) { out.push(note(t('frame.ui.results-none'))); return out; }
    if (stale()) { out.push(note(t('frame.ui.results-stale'), { 'data-fa-stale': '' })); return out; }
    if (result.error) { out.push(el('p', { className: C.error, role: 'alert', 'data-fa-error': '' }, errorText(result))); return out; }
    const sol = result.sol, keys = Object.keys(sol.results);
    out.push(el('div', { className: 'fa-row' },
      field(t('frame.ui.f-show'), sel(setKey, keys.map((k) => [k, (k.startsWith('combo:') ? t('frame.ui.combo-prefix') : '') + sol.results[k].name]), (v) => { setKey = v; draw(); rerender(); }, { 'data-fa-set': '' })),
      field(t('frame.ui.f-mode'), sel(mode, MODES.map((m) => [m, t('frame.ui.mode-' + m.toLowerCase())]), (v) => { mode = v; draw(); rerender(); }, { 'data-fa-mode': '' })),
      mode === 'deflected' ? field(t('frame.ui.f-scale'), sel(String(scale), [['0', t('frame.ui.scale-auto')], ...[1, 10, 50, 100, 500].map((s) => [String(s), t('frame.ui.scale-times', { s })])], (v) => { scale = Number(v); draw(); rerender(); }, { 'data-fa-scale': '' })) : null));
    const R = sol.results[setKey];
    const shown = result.shown;
    out.push(note(t('frame.ui.summary', { nodes: result.frame.model.nodes.length, members: result.frame.model.members.length, dofs: sol.dofs, ms: result.ms, fz: KN(-R.applied[2]), rz: KN(R.reacted[2]) })
      + (mode === 'deflected' && shown?.scale ? ' ' + t('frame.ui.scale-used', { s: shown.scale >= 10 ? Math.round(shown.scale) : Number(shown.scale.toPrecision(2)) }) : ''), { 'data-fa-summary': '' }));
    for (const w of [...sol.warnings.slice(0, 6), ...(result.frame.warnings || []).slice(0, 3)]) out.push(note(t('frame.warn.' + w.code, { node: pointOf(w.node), dof: w.dof !== undefined ? t('frame.dof.' + w.dof) : '', id: w.id ?? '' }), { className: C.note + ' fa-warn' }));
    if (result.frame.skipped.length) out.push(note(t('frame.ui.skipped', { n: result.frame.skipped.length, ids: result.frame.skipped.slice(0, 8).map((s) => host.member(s.id)?.label || s.id).join(', ') }), { className: C.note + ' fa-warn' }));
    const res = partResults(result.frame.parts, sol, setKey);
    const rows = [...res].sort((x, y) => y[1].ext.My.abs - x[1].ext.My.abs);
    const sm = (e) => (Math.abs(e.max) >= Math.abs(e.min) ? e.max : e.min);
    /* i18n-ignore-start: symbols and units */
    const forceHeads = ['N (kN)', 'Vz (kN)', 'Vy (kN)', 'My (kN·m)', 'Mz (kN·m)', 'T (kN·m)'];
    const reacHeads = ['Fx (kN)', 'Fy (kN)', 'Fz (kN)', 'Mx (kN·m)', 'My (kN·m)', 'Mz (kN·m)'];
    /* i18n-ignore-end */
    out.push(table([t('frame.ui.col-member'), t('frame.ui.col-type'), t('frame.ui.col-profile'), ...forceHeads, t('frame.ui.col-defl'), ''], [3, 4, 5, 6, 7, 8, 9], rows.map(([id, r]) => {
      const m = host.member(id);
      return el('tr', {},
        el('td', {}, el('button', { type: 'button', className: C.link, onclick: () => host.select(id) }, m?.label || id)),
        td(m ? t('frame.ui.type-' + m.type) : ''), td(m?.profile || ''),
        td(KN(sm(r.ext.N)), 1), td(KN(sm(r.ext.Vz)), 1), td(KN(sm(r.ext.Vy)), 1), td(KNM(sm(r.ext.My)), 1), td(KNM(sm(r.ext.Mz)), 1), td(KNM(sm(r.ext.T)), 1),
        td(r.ext.defl.value.toFixed(2), 1), td(Number.isFinite(r.ext.defl.ratio) && r.ext.defl.ratio < 1e7 ? 'L/' + Math.round(r.ext.defl.ratio) : ''));
    }), { 'data-fa-table': '' }));
    const fm = result.frame.model, idx = new Map(fm.nodes.map((n, k) => [n.id, k]));
    out.push(head(t('frame.ui.h-reactions')), table([t('frame.ui.col-at'), ...reacHeads], [1, 2, 3, 4, 5, 6], fm.supports.map((s) => {
      const k = idx.get(s.node), Rr = R.reactions.subarray(6 * k, 6 * k + 6);
      return el('tr', {}, td(pointOf(s.node)), ...[0, 1, 2].map((d) => td(KN(Rr[d]), 1)), ...[3, 4, 5].map((d) => td(KNM(Rr[d]), 1)));
    }), { 'data-fa-reactions': '' }));
    out.push(note(t('frame.ui.signs')));
    return out;
  }

  return {
    panel() { return [el('p', { className: 'fa-aid', 'data-fa-aid': '' }, t('frame.ui.aid')), ...resultsBlock(), loadsBlock(), casesBlock(), settingsBlock()]; },
    modelChanged() { if (result && stale()) host.hide(); },
    clear() { result = null; host.hide(); },
    get result() { return result; },
    get set() { return setKey; },
    run,
    setMode(m) { if (MODES.includes(m)) { mode = m; draw(); } },
    setSet(k) { setKey = k; draw(); },
  };
}
