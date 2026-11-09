/* SPDX-License-Identifier: Apache-2.0 */
/**
 * frame-dynamics-panel.js — the Response spectrum, Time history and Pushover blocks of the Analysis tab (0.9 SU.1056), next to the Finite elements block. Imported by
 * frame-panel.js; the numerics are lib/fem (frame-dyn.js, frame-push.js) handed over by the app as host.fem.dyn. An analysis aid, not a code check; your engineer reviews the results.
 *
 *   dynamicsPanel(ui) → { blocks() → [nodes], tables() → report tables, clear(), modelChanged(), results }       ui = the helpers frame-panel.js passes (as concretePanel)
 *   cleanDyn(untrusted) → settings | null           saved as analysis.dyn with the model:
 *     { mass: [{ case, f }], nModes,
 *       rs:   { spectrum: { kind: 'table', unit: 'g'|'ms2', rows: [[T, Sa]] } | { kind: 'asce7', SDS, SD1, TL }, xi, method, directional, dirs: { X, Y, Z }, scale: { mode, factor, target: { X, Y }, upOnly } },
 *       th:   { motion: { kind: 'synthetic', type, amp, f, cycles, dur } | { kind: 'table', unit, dt, a?: [..], name, n }, dir, scale, method: 'modal'|'direct', damping: { kind, xi, modes }, h, tail },
 *       push: { dir, pattern, fy, r, target, steps, pdelta, gravity (combination id or '') } }
 * Needs host.fem.dyn (lib/fem/frame-dyn.js DYN); without it no block shows. A ground motion longer than 5,000 points is kept for the session only (the model file stays small).
 */
import { designSpectrum, spectrumPoints } from './spectrum-asce7.js';
import { cleanConcrete } from './frame-concrete.js';
import { gradeProps, cleanDesign } from './frame-design.js';
import { lineChart, barChart, thin } from './frame-chart.js';
import { KN, KNM } from './frame-report.js';

const num = (v, d, lo, hi) => { const x = Number(v); return Number.isFinite(x) && x >= lo && x <= hi ? x : d; };
const pick = (v, list, d) => (list.includes(v) ? v : d);
const SYN = ['sine', 'pulse-half-sine', 'pulse-rect'];
const MAX_SAVED = 5000;

export function cleanDyn(x) {
  if (!x || typeof x !== 'object') return null;
  const out = {};
  out.mass = (Array.isArray(x.mass) ? x.mass : []).slice(0, 50).map((q) => ({ case: String(q?.case ?? '').slice(0, 20), f: num(q?.f, 0, 0, 10) })).filter((q) => q.case);
  out.nModes = pick(Number(x.nModes), [6, 10, 12, 20, 30, 40], 12);
  const r = x.rs || {};
  const sp = r.spectrum || {};
  const rows = (Array.isArray(sp.rows) ? sp.rows : []).slice(0, 400).map((q) => [num(q?.[0], NaN, 0, 1000), num(q?.[1], NaN, 0, 100)]).filter((q) => Number.isFinite(q[0]) && Number.isFinite(q[1]));
  out.rs = {
    spectrum: sp.kind === 'table' ? { kind: 'table', unit: pick(sp.unit, ['g', 'ms2'], 'g'), rows } : { kind: 'asce7', SDS: num(sp.SDS, 1, 0, 5), SD1: num(sp.SD1, 0.6, 0, 3), TL: num(sp.TL, 8, 1, 30) },
    xi: num(r.xi, 0.05, 0.001, 0.5), method: pick(r.method, ['cqc', 'srss', 'tenpct', 'abs'], 'cqc'), directional: pick(r.directional, ['100-30', 'srss'], '100-30'),
    dirs: { X: num(r.dirs?.X, 1, 0, 10), Y: num(r.dirs?.Y, 1, 0, 10), Z: num(r.dirs?.Z, 0, 0, 10) },
    scale: { mode: pick(r.scale?.mode, ['none', 'factor', 'target'], 'none'), factor: num(r.scale?.factor, 1, 0.01, 100), target: { X: num(r.scale?.target?.X, 0, 0, 1e9), Y: num(r.scale?.target?.Y, 0, 0, 1e9) }, upOnly: r.scale?.upOnly !== false },
  };
  const t = x.th || {}, mo = t.motion || {};
  let motion;
  if (mo.kind === 'table') {
    const a = Array.isArray(mo.a) && mo.a.length <= MAX_SAVED ? mo.a.map(Number).filter(Number.isFinite) : null;
    motion = { kind: 'table', unit: pick(mo.unit, ['g', 'ms2'], 'g'), dt: num(mo.dt, 0.01, 1e-5, 10), name: String(mo.name ?? '').slice(0, 80), n: Math.floor(num(mo.n, a ? a.length : 0, 0, 1e7)), ...(a && a.length > 1 ? { a } : {}) };
  } else motion = { kind: 'synthetic', type: pick(mo.type, SYN, 'sine'), amp: num(mo.amp, 1, 0, 100), f: num(mo.f, 1, 0.01, 100), cycles: num(mo.cycles, 10, 1, 200), dur: num(mo.dur, 0.5, 0.01, 60) };
  out.th = { motion, dir: pick(t.dir, ['X', 'Y', 'Z'], 'X'), scale: num(t.scale, 1, 0, 100), method: pick(t.method, ['modal', 'direct'], 'modal'),
    damping: { kind: pick(t.damping?.kind, ['modal', 'rayleigh'], 'modal'), xi: num(t.damping?.xi, 0.05, 0.001, 0.5), modes: [Math.floor(num(t.damping?.modes?.[0], 1, 1, 60)), Math.floor(num(t.damping?.modes?.[1], 3, 1, 60))] },
    h: num(t.h, 0, 0, 1), tail: num(t.tail, 0, 0, 120) };
  const p = x.push || {};
  out.push = { dir: pick(p.dir, ['X', 'Y'], 'X'), pattern: pick(p.pattern, ['mode', 'uniform'], 'mode'), fy: num(p.fy, 355, 50, 2000), r: num(p.r, 0, 0, 0.3), target: num(p.target, 0, 0, 1e5), steps: Math.floor(num(p.steps, 60, 10, 300)), pdelta: p.pdelta === true, gravity: String(p.gravity ?? '').slice(0, 20) };
  return out;
}

export function dynamicsPanel(ui) {
  const { el, t, C, host, sel, btn, head, field, note, table, td, current, change, rerender } = ui;
  const D = host.fem?.dyn;
  if (!D) return null;
  const L = host.len || null;
  const mmText = (v) => (L ? L.small(v) : (Math.abs(v) >= 100 ? v.toFixed(0) : v.toFixed(2)));
  const mark = L ? L.smallMark() : 'mm';
  const dyn = () => cleanDyn(current().dyn) || cleanDyn({});
  const edit = (label, fn) => change(label, (x) => { const d = cleanDyn(x.dyn) || cleanDyn({}); fn(d); x.dyn = cleanDyn(d); });
  const input = (value, onchange, attrs = {}) => el('input', { type: 'text', inputMode: 'decimal', className: C.input + ' fa-factor', value: String(value), onchange: (e) => { const v = Number(String(e.target.value).replace(',', '.')); if (Number.isFinite(v)) onchange(v); else rerender(); }, ...attrs });
  const check = (on, onchange, label, attrs = {}) => el('label', { className: 'fa-live' }, el('input', { type: 'checkbox', checked: !!on, onchange: (e) => onchange(e.target.checked), ...attrs }), ' ', label);
  const f1 = (v, n = 1) => (Number.isFinite(v) ? v.toFixed(n) : '–');
  const warnNotes = (list) => (list || []).map((w) => note(t('frame.dyn.warn.' + w.code, { n: w.n ?? '', dirs: w.dirs ?? '', pct: w.pct ?? '' }), { className: C.note + ' fa-warn' }));
  const errNote = (e, attr) => el('p', { className: C.error, role: 'alert', ...attr }, t('frame.dyn.err.' + (e?.code || 'internal'), { message: e?.message || '', n: e?.n ?? '', step: e?.step ?? '' }));

  let rs = null, th = null, ps = null, nlth = null, modalC = null, bigRecord = null;      // each { version, out } valid while the model is unchanged
  const cur = () => (ui.result() && !ui.result().error && !ui.stale() ? ui.result() : null);
  const fresh = () => { if (!cur()) ui.run(); return cur(); };
  const ids = (frame) => new Map(frame.nodes.map((n, k) => [n.id, k]));
  const massList = () => { const d = dyn(), a = current(); if (d.mass.length) return d.mass; return a.cases.filter((c) => c.kind === 'dead').map((c) => ({ case: c.id, f: 1 })); };
  function getModal(frame) {
    const d = dyn(), key = JSON.stringify([massList(), d.nModes, host.version()]);
    if (modalC && modalC.key === key) return modalC.out;
    const masses = D.massesFromCases(frame, ids(frame), massList());
    let out;
    try { out = D.modal(frame, { n: d.nModes, masses }); } catch (err) { out = { ok: false, error: { code: 'internal', message: err?.message || String(err) } }; }
    modalC = { key, out };
    return out;
  }
  const guard = (fn) => { try { return fn(); } catch (err) { return { ok: false, error: { code: 'internal', message: err?.message || String(err) }, warnings: [] }; } };
  const spectrumFn = (d) => {
    const s = d.rs.spectrum;
    if (s.kind === 'asce7') { const f = designSpectrum({ SDS: s.SDS, SD1: s.SD1, TL: s.TL }); return (T) => f(T) * 9806.65; }
    return D.spectrumFn({ rows: s.rows, unit: s.unit });
  };
  const spectrumPts = (d) => { const s = d.rs.spectrum; if (s.kind === 'asce7') { try { return spectrumPoints(designSpectrum({ SDS: s.SDS, SD1: s.SD1, TL: s.TL })).map((q) => [q[0], q[1]]); } catch (e) { return []; } } return s.rows; };

  // ---- the labels of analysed members ----
  const labels = () => { const r = cur(), map = new Map(); if (!r) return map; for (const [id, list] of r.frame.parts) for (const q of list) map.set(q.k, host.member(id)?.label || id); return map; };
  function endsRows(ends, signed) {                          // ends: Float64Array(12 n) magnitudes, or { max, min }
    const n = (signed ? ends.max.length : ends.length) / 12, lab = labels(), rows = [];
    const g = (k, i) => (signed ? Math.max(Math.abs(ends.max[12 * k + i]), Math.abs(ends.min[12 * k + i])) : Math.abs(ends[12 * k + i]));
    for (let k = 0; k < n; k++) { const v = [[0, 6], [1, 7], [2, 8], [3, 9], [4, 10], [5, 11]].map(([a, b]) => Math.max(g(k, a), g(k, b))); rows.push({ k, label: lab.get(k) || ('#' + (k + 1)), v }); }
    return rows.sort((a, b) => b.v[4] - a.v[4]).slice(0, 25);
  }
  const forceHeads = ['N (kN)', 'Vy (kN)', 'Vz (kN)', 'T (kN·m)', 'My (kN·m)', 'Mz (kN·m)'];
  const forceCells = (v) => v.map((x, i) => (i < 3 ? KN(x) : KNM(x)));
  const driftHeads = () => [t('frame.dyn.col-story'), 'z', 'h', 'X (' + mark + ')', 'Y (' + mark + ')', 'X (%)', 'Y (%)'];
  const driftCells = (d) => [d.name, mmText(d.z), mmText(d.h), mmText(d.dx), mmText(d.dy), d.ratioX == null ? '' : f1(d.ratioX * 100, 3), d.ratioY == null ? '' : f1(d.ratioY * 100, 3)];

  // ---- shared: mass ----
  function massBox() {
    const d = dyn(), list = massList(), a = current();
    const rows = a.cases.map((c) => {
      const row = list.find((q) => q.case === c.id);
      return el('label', { className: 'fa-field' }, el('span', {}, c.name || c.id), input(row ? row.f : 0, (v) => edit(t('frame.dyn.undo'), (x) => { const m = massList().filter((q) => q.case !== c.id && q.f > 0); if (v > 0) m.push({ case: c.id, f: v }); x.mass = m.length ? m : [{ case: '-', f: 0 }]; }), { 'data-fa-dyn-mass': c.id }));
    });
    return el('div', {}, el('h4', {}, t('frame.dyn.mass-h')), note(t('frame.dyn.mass-about')), el('div', { className: 'fa-row' }, ...rows, field(t('frame.dyn.f-modes'), sel(String(d.nModes), [6, 10, 12, 20, 30, 40].map((n) => [String(n), String(n)]), (v) => edit(t('frame.dyn.undo'), (x) => { x.nModes = Number(v); }), { 'data-fa-dyn-modes': '' }))));
  }
  const massLine = () => note(t('frame.dyn.mass-line', { list: massList().filter((q) => q.f > 0).map((q) => (current().cases.find((c) => c.id === q.case)?.name || q.case) + (q.f !== 1 ? ' × ' + q.f : '')).join(', ') || t('frame.dyn.mass-none') }));
  const modeTable = (rows, dirs) => table([t('frame.fem.col-mode'), 'f (Hz)', 'T (s)', 'Sa (g)', ...dirs.map((a) => a + ' (%)'), t('frame.dyn.col-cum')], [0, 1, 2, 3, 4, 5, 6, 7], rows.map((q) => el('tr', { 'data-fa-dyn-mode': q.n },
    td(String(q.n), 1), td(q.hz.toFixed(3), 1), td(q.period.toFixed(4), 1), td(f1(q.Sa / 9806.65, 3), 1), ...dirs.map((a) => td(f1(100 * q.share[['X', 'Y', 'Z'].indexOf(a)], 1), 1)), td(dirs.map((a) => a + ' ' + f1(100 * q.cum[['X', 'Y', 'Z'].indexOf(a)], 0)).join(' · '), 1))), { 'data-fa-rs-modes': '' });
  const svgBox = (svg, attr) => { const d = el('div', { className: 'fa-chartbox', ...attr }); d.innerHTML = svg; return d; };

  // ---- Response spectrum ----
  function runRS() {
    const r = fresh(); if (!r) return;
    const d = dyn(), m = getModal(r.frame.model);
    if (!m.ok) { rs = { version: host.version(), out: { ok: false, error: m.error, warnings: m.warnings || [] } }; rerender(); return; }
    let sa; try { sa = spectrumFn(d); } catch (e) { rs = { version: host.version(), out: { ok: false, error: { code: 'bad-spectrum', message: e.message }, warnings: [] } }; rerender(); return; }
    if (!sa) { rs = { version: host.version(), out: { ok: false, error: { code: 'no-spectrum' }, warnings: [] } }; rerender(); return; }
    const s = d.rs.scale;
    const out = guard(() => D.responseSpectrum(m, r.frame.model, { spectrum: sa, dirs: d.rs.dirs, xi: d.rs.xi, method: d.rs.method, directional: d.rs.directional, nModes: d.nModes,
      scale: { mode: s.mode, factor: s.factor, target: { X: s.target.X * 1000, Y: s.target.Y * 1000 }, upOnly: s.upOnly } }));
    rs = { version: host.version(), out };
    host.print(out.ok ? t('frame.dyn.rs.ran', { n: out.modes.length }) : t('frame.dyn.err.' + (out.error?.code || 'internal'), { message: out.error?.message || '' }));
    rerender();
  }
  function spectrumBox() {
    const d = dyn(), s = d.rs.spectrum, set = (fn) => edit(t('frame.dyn.undo'), (x) => fn(x.rs.spectrum, x.rs));
    const kind = sel(s.kind, [['asce7', t('frame.dyn.sp-asce7')], ['table', t('frame.dyn.sp-table')]], (v) => set((sp, r) => { r.spectrum = v === 'asce7' ? { kind: 'asce7', SDS: 1, SD1: 0.6, TL: 8 } : { kind: 'table', unit: 'g', rows: spectrumPts(d).length ? spectrumPts(d) : [[0, 0.4], [0.5, 1], [1, 0.6], [2, 0.3], [4, 0.15]] }; }), { 'data-fa-rs-kind': '' });
    const out = [field(t('frame.dyn.f-spectrum'), kind)];
    if (s.kind === 'asce7') {
      const seis = cleanConcrete(current().concrete)?.seismic;
      out.push(field('SDS (g)', input(s.SDS, (v) => set((sp) => { sp.SDS = v; }), { 'data-fa-rs-sds': '' })), field('SD1 (g)', input(s.SD1, (v) => set((sp) => { sp.SD1 = v; }), { 'data-fa-rs-sd1': '' })), field('TL (s)', input(s.TL, (v) => set((sp) => { sp.TL = v; }), { 'data-fa-rs-tl': '' })));
      if (seis && seis.SDS > 0) out.push(btn(t('frame.dyn.sp-use', { SDS: f1(seis.SDS, 3), SD1: f1(seis.SD1, 3) }), () => set((sp) => { sp.SDS = seis.SDS; sp.SD1 = seis.SD1; sp.TL = seis.TL; }), { 'data-fa-rs-use': '' }));
    } else {
      out.push(field(t('frame.dyn.sp-unit'), sel(s.unit, [['g', 'g'], ['ms2', 'm/s²']], (v) => set((sp) => { sp.unit = v; }), { 'data-fa-rs-unit': '' })));
      out.push(el('label', { className: 'fa-field fa-wide' }, el('span', {}, t('frame.dyn.sp-rows')), el('textarea', { rows: 6, className: C.input, 'data-fa-rs-rows': '', onchange: (e) => {
        const rows = e.target.value.split('\n').map((l) => l.trim().split(/[\s,;]+/).map(Number)).filter((q) => q.length >= 2 && q.every(Number.isFinite)).map((q) => [q[0], q[1]]);
        set((sp) => { sp.rows = rows; });
      } }, s.rows.map((q) => q.join(', ')).join('\n'))));
    }
    return out;
  }
  function rsBlock() {
    const d = dyn(), r = d.rs;
    const out = [head(t('frame.dyn.rs.h'), el('button', { type: 'button', className: C.primary, onclick: runRS, 'data-fa-rs-run': '' }, t('frame.dyn.rs.run')))];
    out.push(note(t('frame.dyn.rs.about')), massBox(), el('div', { className: 'fa-row' }, ...spectrumBox()));
    const pts = spectrumPts(d);
    if (pts.length > 1) out.push(svgBox(lineChart({ title: t('frame.dyn.sp-chart'), xLabel: 'T (s)', yLabel: 'Sa (g)', pts: pts.map((q) => [q[0], d.rs.spectrum.kind === 'table' && d.rs.spectrum.unit === 'ms2' ? q[1] / 9.80665 : q[1]]) }), { 'data-fa-rs-spectrum': '' }));
    out.push(el('div', { className: 'fa-row' },
      field(t('frame.dyn.f-xi'), input(r.xi * 100, (v) => edit(t('frame.dyn.undo'), (x) => { x.rs.xi = v / 100; }), { 'data-fa-rs-xi': '' })),
      field(t('frame.dyn.f-method'), sel(r.method, ['cqc', 'srss', 'tenpct', 'abs'].map((m) => [m, t('frame.dyn.m-' + m)]), (v) => edit(t('frame.dyn.undo'), (x) => { x.rs.method = v; }), { 'data-fa-rs-method': '' })),
      field(t('frame.dyn.f-directional'), sel(r.directional, [['100-30', t('frame.dyn.d-100')], ['srss', t('frame.dyn.d-srss')]], (v) => edit(t('frame.dyn.undo'), (x) => { x.rs.directional = v; }), { 'data-fa-rs-directional': '' }))));
    out.push(el('div', { className: 'fa-row' }, ...['X', 'Y', 'Z'].map((a) => field(t('frame.dyn.f-dir', { a }), input(r.dirs[a], (v) => edit(t('frame.dyn.undo'), (x) => { x.rs.dirs[a] = v; }), { 'data-fa-rs-dir': a })))));
    out.push(el('div', { className: 'fa-row' },
      field(t('frame.dyn.f-scale'), sel(r.scale.mode, [['none', t('frame.dyn.sc-none')], ['factor', t('frame.dyn.sc-factor')], ['target', t('frame.dyn.sc-target')]], (v) => edit(t('frame.dyn.undo'), (x) => { x.rs.scale.mode = v; }), { 'data-fa-rs-scale': '' })),
      r.scale.mode === 'factor' ? field(t('frame.dyn.sc-f'), input(r.scale.factor, (v) => edit(t('frame.dyn.undo'), (x) => { x.rs.scale.factor = v; }), { 'data-fa-rs-factor': '' })) : null,
      r.scale.mode === 'target' ? field(t('frame.dyn.sc-vx'), input(r.scale.target.X, (v) => edit(t('frame.dyn.undo'), (x) => { x.rs.scale.target.X = v; }), { 'data-fa-rs-vx': '' })) : null,
      r.scale.mode === 'target' ? field(t('frame.dyn.sc-vy'), input(r.scale.target.Y, (v) => edit(t('frame.dyn.undo'), (x) => { x.rs.scale.target.Y = v; }), { 'data-fa-rs-vy': '' })) : null,
      r.scale.mode === 'target' ? check(r.scale.upOnly, (on) => edit(t('frame.dyn.undo'), (x) => { x.rs.scale.upOnly = on; }), t('frame.dyn.sc-up'), { 'data-fa-rs-up': '' }) : null));
    if (!rs) return el('div', { className: C.block + ' fa-dyn fa-rs' }, ...out);
    if (rs.version !== host.version()) { out.push(note(t('frame.ui.results-stale'), { 'data-fa-rs-stale': '' })); return el('div', { className: C.block + ' fa-dyn fa-rs' }, ...out); }
    const o = rs.out;
    if (!o.ok) { out.push(errNote(o.error, { 'data-fa-rs-error': '' })); return el('div', { className: C.block + ' fa-dyn fa-rs' }, ...out); }
    out.push(...warnNotes(o.warnings));
    out.push(modeTable(o.modes, o.dirs));
    out.push(table([t('frame.dyn.col-axis'), t('frame.dyn.col-vb') + ' (kN)', ...o.dirs.map((a) => t('frame.dyn.col-from', { a }) + ' (kN)'), t('frame.dyn.col-factor')], [1, 2, 3, 4, 5],
      ['X', 'Y', 'Z'].map((ax, b) => el('tr', { 'data-fa-rs-vb': ax }, td(ax), td(KN(o.baseShear[b]), 1), ...o.dirs.map((a) => td(KN(o.perDir[a].baseShear[b]), 1)), td(o.dirs.map((a) => f1(o.perDir[a].factor, 3)).join(' · '), 1))), { 'data-fa-rs-base': '' }));
    if (o.drifts.length) {
      out.push(table(driftHeads(), [1, 2, 3, 4, 5, 6], o.drifts.map((d1) => el('tr', { 'data-fa-rs-drift': d1.name }, ...driftCells(d1).map((v, i) => td(v, i > 0)))), { 'data-fa-rs-drifts': '' }));
      out.push(svgBox(barChart({ title: t('frame.dyn.drift-chart'), xLabel: t('frame.dyn.drift-x'), bars: o.drifts.map((d1) => ({ label: d1.name, value: Math.max(d1.ratioX || 0, d1.ratioY || 0) * 100 })) }), { 'data-fa-rs-chart': '' }));
    }
    const er = endsRows(o.ends, false);
    out.push(table([t('frame.ui.col-member'), ...forceHeads], [1, 2, 3, 4, 5, 6], er.map((q) => el('tr', {}, td(q.label), ...forceCells(q.v).map((v) => td(v, 1)))), { 'data-fa-rs-forces': '' }));
    out.push(note(t('frame.dyn.rs.signs')), note(D.note));
    return el('div', { className: C.block + ' fa-dyn fa-rs' }, ...out);
  }

  // ---- ground motion + Time history ----
  const recordOf = (d) => {
    const mo = d.th.motion;
    if (mo.kind === 'synthetic') {
      const dt = mo.type === 'sine' ? Math.min(0.01, 1 / (mo.f * 40)) : Math.min(0.005, mo.dur / 100);
      const s = D.syntheticMotion(mo.type, { amp: mo.amp, f: mo.f, cycles: mo.cycles, dur: mo.dur, dt });
      return s ? { record: { dt: s.dt, a: s.a }, unit: 'ms2', label: t('frame.dyn.syn-label', { what: mo.type }) } : null;
    }
    if (mo.a) return { record: { dt: mo.dt, a: Float64Array.from(mo.a) }, unit: mo.unit, label: mo.name || t('frame.dyn.rec-table') };
    if (bigRecord && bigRecord.name === mo.name) return { record: bigRecord.rec, unit: mo.unit, label: mo.name };
    return null;
  };
  async function readFile(file) {
    const text = await file.text();
    return loadRecord(text, file.name);
  }
  function loadRecord(text, name) {
    const d = dyn(), p = D.parseGroundMotion(text, { dt: d.th.motion.kind === 'table' ? d.th.motion.dt : 0.01 });
    if (!p.ok) { host.print(t('frame.dyn.rec.err.' + p.error, { n: p.n ?? '' })); th = { version: host.version(), out: { ok: false, error: { code: 'rec-' + p.error, n: p.n }, warnings: [] } }; rerender(); return; }
    const a = Array.from(p.a), dt = p.dt;
    const rec = p.t && !p.uniform ? D.resample({ dt, a: p.a, t: p.t, n: p.n }, Math.max(1e-4, (p.t[p.t.length - 1] / (p.n - 1)))) : { dt, a: p.a };
    const keep = rec.a.length <= MAX_SAVED;
    if (!keep) bigRecord = { name, rec: { dt: rec.dt, a: Float64Array.from(rec.a) } };
    edit(t('frame.dyn.undo'), (x) => { x.th.motion = { kind: 'table', unit: x.th.motion.kind === 'table' ? x.th.motion.unit : 'g', dt: rec.dt, name, n: rec.a.length, ...(keep ? { a: Array.from(rec.a, (v) => Number(v.toPrecision(7))) } : {}) }; });
    host.print(t('frame.dyn.rec.loaded', { n: rec.a.length, dt: rec.dt, saved: keep ? t('frame.dyn.rec.saved') : t('frame.dyn.rec.session') }));
    void a;
  }
  function motionBox() {
    const d = dyn(), mo = d.th.motion, set = (fn) => edit(t('frame.dyn.undo'), (x) => fn(x.th.motion, x.th));
    const out = [field(t('frame.dyn.f-motion'), sel(mo.kind === 'table' ? 'table' : mo.type, [...SYN.map((s2) => [s2, t('frame.dyn.syn-' + s2)]), ['table', t('frame.dyn.mo-table')]], (v) => set((m, th2) => { th2.motion = v === 'table' ? { kind: 'table', unit: 'g', dt: 0.01, name: '', n: 0 } : { kind: 'synthetic', type: v, amp: m.amp ?? 1, f: m.f ?? 1, cycles: m.cycles ?? 10, dur: m.dur ?? 0.5 }; }), { 'data-fa-th-motion': '' }))];
    if (mo.kind === 'synthetic') {
      out.push(field(t('frame.dyn.syn-amp'), input(mo.amp, (v) => set((m) => { m.amp = v; }), { 'data-fa-th-amp': '' })));
      if (mo.type === 'sine') out.push(field(t('frame.dyn.syn-f'), input(mo.f, (v) => set((m) => { m.f = v; }), { 'data-fa-th-f': '' })), field(t('frame.dyn.syn-cycles'), input(mo.cycles, (v) => set((m) => { m.cycles = v; }), { 'data-fa-th-cycles': '' })));
      else out.push(field(t('frame.dyn.syn-dur'), input(mo.dur, (v) => set((m) => { m.dur = v; }), { 'data-fa-th-dur': '' })));
      out.push(note(t('frame.dyn.syn-note'), { className: C.note + ' fa-warn' }));
    } else {
      out.push(field(t('frame.dyn.sp-unit'), sel(mo.unit, [['g', 'g'], ['ms2', 'm/s²']], (v) => set((m) => { m.unit = v; }), { 'data-fa-th-unit': '' })),
        field(t('frame.dyn.rec-dt'), input(mo.dt, (v) => set((m) => { m.dt = v; }), { 'data-fa-th-dt': '' })),
        el('label', { className: 'fa-field' }, el('span', {}, t('frame.dyn.rec-file')), el('input', { type: 'file', accept: '.csv,.txt,.dat,.at2,.AT2', 'data-fa-th-file': '', onchange: (e) => { const f = e.target.files?.[0]; if (f) readFile(f); } })),
        el('label', { className: 'fa-field fa-wide' }, el('span', {}, t('frame.dyn.rec-paste')), el('textarea', { rows: 4, className: C.input, 'data-fa-th-paste': '', placeholder: 't, a', onchange: (e) => { if (e.target.value.trim()) loadRecord(e.target.value, t('frame.dyn.rec-pasted')); } })));
      out.push(note(mo.n ? t('frame.dyn.rec-have', { n: mo.n, dt: mo.dt, name: mo.name || '' }) + (mo.a || (bigRecord && bigRecord.name === mo.name) ? '' : ' ' + t('frame.dyn.rec-lost')) : t('frame.dyn.rec-none'), { 'data-fa-th-have': '' }));
    }
    return out;
  }
  function runTH() {
    const r = fresh(); if (!r) return;
    const d = dyn(), m = getModal(r.frame.model), rc = recordOf(d);
    if (!m.ok) { th = { version: host.version(), out: { ok: false, error: m.error, warnings: [] } }; rerender(); return; }
    if (!rc) { th = { version: host.version(), out: { ok: false, error: { code: 'no-record' }, warnings: [] } }; rerender(); return; }
    const out = guard(() => D.timeHistory(m, r.frame.model, { record: rc.record, unit: rc.unit, dir: d.th.dir, scale: d.th.scale, method: d.th.method, damping: d.th.damping, h: d.th.h || 0, tail: d.th.tail, nModes: d.nModes }));
    th = { version: host.version(), out, label: rc.label };
    host.print(out.ok ? t('frame.dyn.th.ran', { n: out.steps }) : t('frame.dyn.err.' + (out.error?.code || 'internal'), { message: out.error?.message || '', n: out.error?.n ?? '' }));
    rerender();
  }
  const seriesPts = (o, s) => thin(o.t, s.data, 900);
  function thBlock() {
    const d = dyn(), x = d.th;
    const out = [head(t('frame.dyn.th.h'), el('button', { type: 'button', className: C.primary, onclick: runTH, 'data-fa-th-run': '' }, t('frame.dyn.th.run')))];
    out.push(note(t('frame.dyn.th.about')), massLine(), el('div', { className: 'fa-row' }, ...motionBox()));
    out.push(el('div', { className: 'fa-row' },
      field(t('frame.dyn.f-tdir'), sel(x.dir, ['X', 'Y', 'Z'].map((a) => [a, a]), (v) => edit(t('frame.dyn.undo'), (y) => { y.th.dir = v; }), { 'data-fa-th-dir': '' })),
      field(t('frame.dyn.f-tscale'), input(x.scale, (v) => edit(t('frame.dyn.undo'), (y) => { y.th.scale = v; }), { 'data-fa-th-scale': '' })),
      field(t('frame.dyn.f-tmethod'), sel(x.method, [['modal', t('frame.dyn.tm-modal')], ['direct', t('frame.dyn.tm-direct')]], (v) => edit(t('frame.dyn.undo'), (y) => { y.th.method = v; }), { 'data-fa-th-method': '' })),
      field(t('frame.dyn.f-damp'), sel(x.damping.kind, [['modal', t('frame.dyn.dm-modal')], ['rayleigh', t('frame.dyn.dm-rayleigh')]], (v) => edit(t('frame.dyn.undo'), (y) => { y.th.damping.kind = v; }), { 'data-fa-th-damp': '' })),
      field(t('frame.dyn.f-xi'), input(x.damping.xi * 100, (v) => edit(t('frame.dyn.undo'), (y) => { y.th.damping.xi = v / 100; }), { 'data-fa-th-xi': '' })),
      x.damping.kind === 'rayleigh' ? field(t('frame.dyn.f-rmodes'), el('span', {}, input(x.damping.modes[0], (v) => edit(t('frame.dyn.undo'), (y) => { y.th.damping.modes[0] = v; }), { 'data-fa-th-r1': '' }), ' ', input(x.damping.modes[1], (v) => edit(t('frame.dyn.undo'), (y) => { y.th.damping.modes[1] = v; }), { 'data-fa-th-r2': '' }))) : null,
      field(t('frame.dyn.f-step'), input(x.h, (v) => edit(t('frame.dyn.undo'), (y) => { y.th.h = v; }), { 'data-fa-th-step': '' })),
      field(t('frame.dyn.f-tail'), input(x.tail, (v) => edit(t('frame.dyn.undo'), (y) => { y.th.tail = v; }), { 'data-fa-th-tail': '' }))));
    if (x.method === 'direct' && x.damping.kind === 'modal') out.push(note(t('frame.dyn.direct-note')));
    if (!th) return el('div', { className: C.block + ' fa-dyn fa-th' }, ...out);
    if (th.version !== host.version()) { out.push(note(t('frame.ui.results-stale'), { 'data-fa-th-stale': '' })); return el('div', { className: C.block + ' fa-dyn fa-th' }, ...out); }
    const o = th.out;
    if (!o.ok) { out.push(errNote(o.error, { 'data-fa-th-error': '' })); return el('div', { className: C.block + ' fa-dyn fa-th' }, ...out); }
    out.push(...warnNotes(o.warnings));
    if (th.label) out.push(note(t('frame.dyn.th.input', { what: th.label })));
    const S = o.series;
    out.push(table([t('frame.dyn.col-what'), t('frame.dyn.col-peak'), 't (s)'], [1, 2], [
      [t('frame.dyn.s-input'), f1(S.input.peak.value / 1000, 3) + ' m/s²', S.input.peak.t],
      [t('frame.dyn.s-roof', { u: mark }), mmText(S.roof.peak.value), S.roof.peak.t],
      [t('frame.dyn.s-base'), KN(S.base.peak.value) + ' kN', S.base.peak.t]].map((q) => el('tr', { 'data-fa-th-peak': q[0] }, td(q[0]), td(String(q[1]), 1), td(f1(q[2], 3), 1))), { 'data-fa-th-peaks': '' }));
    out.push(svgBox(lineChart({ title: t('frame.dyn.roof-chart', { u: mark }), xLabel: 't (s)', yLabel: t('frame.dyn.roof-y', { u: mark }), pts: seriesPts(o, S.roof), marks: [[S.roof.peak.t, S.roof.data[Math.round(S.roof.peak.t / o.h)], t('frame.dyn.col-peak')]] }), { 'data-fa-th-roof': '' }));
    out.push(svgBox(lineChart({ title: t('frame.dyn.base-chart'), xLabel: 't (s)', yLabel: 'V (kN)', pts: thin(o.t, Float64Array.from(S.base.data, (v) => v / 1000), 900) }), { 'data-fa-th-base': '' }));
    out.push(table(driftHeads(), [1, 2, 3, 4, 5, 6], o.drifts.map((d1) => el('tr', { 'data-fa-th-drift': d1.name }, ...driftCells(d1).map((v, i) => td(v, i > 0)))), { 'data-fa-th-drifts': '' }));
    if (o.drifts.length) out.push(svgBox(barChart({ title: t('frame.dyn.drift-chart'), xLabel: t('frame.dyn.drift-x'), bars: o.drifts.map((d1) => ({ label: d1.name, value: Math.max(d1.ratioX || 0, d1.ratioY || 0) * 100 })) }), { 'data-fa-th-chart': '' }));
    out.push(table([t('frame.ui.col-member'), ...forceHeads], [1, 2, 3, 4, 5, 6], endsRows(o.ends, true).map((q) => el('tr', {}, td(q.label), ...forceCells(q.v).map((v) => td(v, 1)))), { 'data-fa-th-forces': '' }));
    out.push(note(t('frame.dyn.th.signs')), note(D.note));
    return el('div', { className: C.block + ' fa-dyn fa-th' }, ...out);
  }

  // ---- Pushover ----
  const fyDefault = () => { try { const dd = cleanDesign(current().design); if (dd.code !== 'none') return gradeProps(dd.code, dd.grade, 20).fy; } catch (e) { /* none */ } return 355; };
  function runPush(nonlinearTH) {
    const r = fresh(); if (!r) return;
    const d = dyn(), p = d.push, frame = r.frame.model;
    const combo = frame.combos.find((c) => c.id === p.gravity);
    const gravity = combo ? combo.factors.map((q) => ({ case: q.case, f: q.f })) : null;
    const massListX = D.massesFromCases(frame, ids(frame), massList());
    const base = { fy: p.fy, r: p.r, pdelta: p.pdelta, gravity, prep: r.sol.prep, massList: massListX };
    if (nonlinearTH) {
      const rc = recordOf(d);
      if (!rc) { nlth = { version: host.version(), out: { ok: false, error: { code: 'no-record' }, warnings: [] } }; rerender(); return; }
      const out = guard(() => D.nlTimeHistory(frame, { ...base, record: rc.record, unit: rc.unit, dir: d.th.dir, scale: d.th.scale, damping: d.th.damping, h: d.th.h || 0, tail: d.th.tail }));
      nlth = { version: host.version(), out, label: rc.label };
    } else {
      const out = guard(() => D.pushover(frame, { ...base, dir: p.dir, pattern: p.pattern, target: p.target, steps: p.steps }));
      ps = { version: host.version(), out };
      host.print(out.ok ? t('frame.dyn.ps.ran', { n: out.steps }) : t('frame.dyn.err.' + (out.error?.code || 'internal'), { message: out.error?.message || '' }));
    }
    rerender();
  }
  const hingeRows = (o) => { const lab = labels(); return o.hinges.slice(0, 40).map((h) => [lab.get(h.index) || h.member, h.end === 'i' ? t('frame.dyn.end-i') : t('frame.dyn.end-j'), h.yielded ? t('frame.dyn.h-yielded') : t('frame.dyn.h-elastic'), (h.rotation * 1000).toFixed(2), h.mu == null ? '' : f1(h.mu, 2)]); };
  function pushBlock() {
    const d = dyn(), p = d.push, a = current();
    const out = [head(t('frame.dyn.ps.h'), el('button', { type: 'button', className: C.primary, onclick: () => runPush(false), 'data-fa-ps-run': '' }, t('frame.dyn.ps.run')))];
    out.push(note(t('frame.dyn.ps.about')), massLine());
    out.push(el('div', { className: 'fa-row' },
      field(t('frame.dyn.f-pdir'), sel(p.dir, [['X', 'X'], ['Y', 'Y']], (v) => edit(t('frame.dyn.undo'), (y) => { y.push.dir = v; }), { 'data-fa-ps-dir': '' })),
      field(t('frame.dyn.f-pattern'), sel(p.pattern, [['mode', t('frame.dyn.pt-mode')], ['uniform', t('frame.dyn.pt-uniform')]], (v) => edit(t('frame.dyn.undo'), (y) => { y.push.pattern = v; }), { 'data-fa-ps-pattern': '' })),
      field(t('frame.dyn.f-fy'), input(p.fy, (v) => edit(t('frame.dyn.undo'), (y) => { y.push.fy = v; }), { 'data-fa-ps-fy': '' })),
      field(t('frame.dyn.f-r'), input(p.r * 100, (v) => edit(t('frame.dyn.undo'), (y) => { y.push.r = v / 100; }), { 'data-fa-ps-r': '' })),
      field(t('frame.dyn.f-target', { u: mark }), input(p.target, (v) => edit(t('frame.dyn.undo'), (y) => { y.push.target = v; }), { 'data-fa-ps-target': '' })),
      field(t('frame.dyn.f-steps'), input(p.steps, (v) => edit(t('frame.dyn.undo'), (y) => { y.push.steps = v; }), { 'data-fa-ps-steps': '' })),
      field(t('frame.dyn.f-gravity'), sel(p.gravity, [['', t('frame.dyn.g-none')], ...a.combos.map((c) => [c.id, c.name])], (v) => edit(t('frame.dyn.undo'), (y) => { y.push.gravity = v; }), { 'data-fa-ps-gravity': '' })),
      check(p.pdelta, (on) => edit(t('frame.dyn.undo'), (y) => { y.push.pdelta = on; }), t('frame.dyn.f-pdelta'), { 'data-fa-ps-pdelta': '' })));
    if (fyDefault() !== 355) out.push(note(t('frame.dyn.fy-note', { fy: fyDefault() })));
    if (ps && ps.version === host.version()) {
      const o = ps.out;
      if (!o.ok) out.push(errNote(o.error, { 'data-fa-ps-error': '' }));
      else {
        out.push(...warnNotes(o.warnings));
        if (o.stopped) out.push(note(t('frame.dyn.ps.stopped.' + o.stopped), { className: C.note + ' fa-warn' }));
        out.push(table([t('frame.dyn.col-what'), t('frame.dyn.col-value')], [1], [
          [t('frame.dyn.ps.k0'), f1(o.k0 / 1000, 2) + ' kN/mm'], [t('frame.dyn.ps.peak'), KN(o.peak.V) + ' kN'], [t('frame.dyn.ps.at'), mmText(o.peak.delta) + ' ' + mark],
          [t('frame.dyn.ps.first'), o.events[0] ? KN(o.events[0].V) + ' kN, ' + mmText(o.events[0].delta) + ' ' + mark : '–'], [t('frame.dyn.ps.pattern'), t('frame.dyn.pt-' + o.pattern)], [t('frame.dyn.ps.nh'), String(o.events.length)]]
          .map((q) => el('tr', {}, td(q[0]), td(q[1], 1))), { 'data-fa-ps-summary': '' }));
        out.push(svgBox(lineChart({ title: t('frame.dyn.cap-chart'), xLabel: t('frame.dyn.cap-x', { u: mark }), yLabel: 'V (kN)', pts: o.curve.map((q) => [q.delta, q.V / 1000]), marks: o.events.slice(0, 12).map((e) => [e.delta, e.V / 1000, (host.member(e.member)?.label || e.member) + ' ' + e.end])  }), { 'data-fa-ps-curve': '' }));
        out.push(table([t('frame.ui.col-member'), t('frame.dyn.col-end'), t('frame.dyn.col-state'), t('frame.dyn.col-rot'), 'μ'], [3, 4], hingeRows(o).map((q) => el('tr', { 'data-fa-ps-hinge': '' }, td(q[0]), td(q[1]), td(q[2]), td(q[3], 1), td(q[4], 1))), { 'data-fa-ps-hinges': '' }));
        if (o.drifts?.length) out.push(table(driftHeads(), [1, 2, 3, 4, 5, 6], o.drifts.map((d1) => el('tr', {}, ...driftCells(d1).map((v, i) => td(v, i > 0)))), { 'data-fa-ps-drifts': '' }));
        out.push(note(t('frame.dyn.ps.limits')), note(D.pushNote));
      }
    } else if (ps) out.push(note(t('frame.ui.results-stale'), { 'data-fa-ps-stale': '' }));
    // nonlinear time history: the same hinges, the Time history block's ground motion
    out.push(el('div', { className: C.head }, el('h4', {}, t('frame.dyn.nl.h')), el('button', { type: 'button', className: C.btn, onclick: () => runPush(true), 'data-fa-nl-run': '' }, t('frame.dyn.nl.run'))));
    out.push(note(t('frame.dyn.nl.about')));
    if (nlth && nlth.version === host.version()) {
      const o = nlth.out;
      if (!o.ok) out.push(errNote(o.error, { 'data-fa-nl-error': '' }));
      else {
        out.push(...warnNotes(o.warnings));
        out.push(table([t('frame.dyn.col-what'), t('frame.dyn.col-peak'), 't (s)'], [1, 2], [[t('frame.dyn.s-roof', { u: mark }), mmText(o.series.roof.peak.value), o.series.roof.peak.t], [t('frame.dyn.s-base'), KN(o.series.base.peak.value) + ' kN', o.series.base.peak.t]]
          .map((q) => el('tr', {}, td(q[0]), td(String(q[1]), 1), td(f1(q[2], 3), 1))), { 'data-fa-nl-peaks': '' }));
        out.push(svgBox(lineChart({ title: t('frame.dyn.roof-chart', { u: mark }), xLabel: 't (s)', yLabel: t('frame.dyn.roof-y', { u: mark }), pts: thin(o.t, o.series.roof.data, 900) }), { 'data-fa-nl-roof': '' }));
        out.push(note(t('frame.dyn.nl.yielded', { n: o.hinges.length })));
        if (o.hinges.length) out.push(table([t('frame.ui.col-member'), t('frame.dyn.col-end'), t('frame.dyn.col-rot')], [2], o.hinges.slice(0, 30).map((h) => el('tr', {}, td(labels().get(h.index) || h.member), td(h.end === 'i' ? t('frame.dyn.end-i') : t('frame.dyn.end-j')), td((h.rotation * 1000).toFixed(2), 1))), { 'data-fa-nl-hinges': '' }));
      }
    }
    return el('div', { className: C.block + ' fa-dyn fa-ps' }, ...out);
  }

  // ---- report tables ----
  function tables() {
    const out = [];
    /* i18n-ignore-start: column heads that are symbols / units */
    if (rs && rs.version === host.version() && rs.out.ok) {
      const o = rs.out;
      out.push({ title: t('frame.dyn.rs.h'), head: [t('frame.fem.col-mode'), 'f (Hz)', 'T (s)', 'Sa (g)', 'X (%)', 'Y (%)', 'Z (%)'], numeric: [0, 1, 2, 3, 4, 5, 6], rows: o.modes.map((q) => [String(q.n), q.hz.toFixed(3), q.period.toFixed(4), f1(q.Sa / 9806.65, 3), ...q.share.map((v) => f1(v * 100, 1))]) });
      out.push({ title: t('frame.dyn.col-vb'), head: [t('frame.dyn.col-axis'), 'V (kN)'], numeric: [1], rows: ['X', 'Y', 'Z'].map((a, b) => [a, KN(o.baseShear[b])]) });
      if (o.drifts.length) out.push({ title: t('frame.dyn.drift-chart'), head: driftHeads(), numeric: [1, 2, 3, 4, 5, 6], rows: o.drifts.map(driftCells) });
      out.push({ title: t('frame.dyn.rs.h') + ' · ' + t('frame.ui.col-member'), head: [t('frame.ui.col-member'), ...forceHeads], numeric: [1, 2, 3, 4, 5, 6], rows: endsRows(o.ends, false).map((q) => [q.label, ...forceCells(q.v)]) });
      out.push({ title: t('frame.pl.about'), head: [t('frame.rep.item'), t('frame.rep.value')], numeric: [], rows: [[t('frame.pl.method'), t('frame.dyn.rs.method', { m: t('frame.dyn.m-' + o.method), rule: t('frame.dyn.d-' + (o.rule === 'srss' ? 'srss' : '100')), xi: f1(o.xi * 100, 1) })], [t('frame.pl.limits'), t('frame.dyn.rs.limits')]] });
    }
    if (th && th.version === host.version() && th.out.ok) {
      const o = th.out, S = o.series;
      out.push({ title: t('frame.dyn.th.h'), head: [t('frame.dyn.col-what'), t('frame.dyn.col-peak'), 't (s)'], numeric: [1, 2], rows: [[t('frame.dyn.s-input'), f1(S.input.peak.value / 1000, 3) + ' m/s²', f1(S.input.peak.t, 3)], [t('frame.dyn.s-roof', { u: mark }), mmText(S.roof.peak.value), f1(S.roof.peak.t, 3)], [t('frame.dyn.s-base'), KN(S.base.peak.value) + ' kN', f1(S.base.peak.t, 3)]] });
      if (o.drifts.length) out.push({ title: t('frame.dyn.drift-chart'), head: driftHeads(), numeric: [1, 2, 3, 4, 5, 6], rows: o.drifts.map(driftCells) });
      out.push({ title: t('frame.dyn.th.h') + ' · ' + t('frame.ui.col-member'), head: [t('frame.ui.col-member'), ...forceHeads], numeric: [1, 2, 3, 4, 5, 6], rows: endsRows(o.ends, true).map((q) => [q.label, ...forceCells(q.v)]) });
      out.push({ title: t('frame.pl.about'), head: [t('frame.rep.item'), t('frame.rep.value')], numeric: [], rows: [[t('frame.pl.method'), t('frame.dyn.th.method', { m: o.method === 'direct' ? t('frame.dyn.tm-direct') : t('frame.dyn.tm-modal'), n: o.steps, h: o.h })], [t('frame.pl.limits'), t('frame.dyn.th.limits')]] });
    }
    if (ps && ps.version === host.version() && ps.out.ok) {
      const o = ps.out;
      out.push({ title: t('frame.dyn.ps.h'), head: ['δ (' + mark + ')', 'V (kN)'], numeric: [0, 1], rows: o.curve.filter((_, i) => i % Math.max(1, Math.floor(o.curve.length / 40)) === 0 || i === o.curve.length - 1).map((q) => [mmText(q.delta), KN(q.V)]) });
      out.push({ title: t('frame.dyn.ps.h') + ' · ' + t('frame.dyn.col-state'), head: [t('frame.ui.col-member'), t('frame.dyn.col-end'), t('frame.dyn.col-state'), t('frame.dyn.col-rot'), 'μ'], numeric: [3, 4], rows: hingeRows(o) });
      out.push({ title: t('frame.pl.about'), head: [t('frame.rep.item'), t('frame.rep.value')], numeric: [], rows: [[t('frame.pl.method'), t('frame.dyn.ps.method', { fy: o.fy, r: f1(o.r * 100, 1), pd: o.pdelta ? t('frame.dyn.yes') : t('frame.dyn.no') })], [t('frame.pl.limits'), t('frame.dyn.ps.limits')]] });
    }
    /* i18n-ignore-end */
    return out;
  }

  return {
    blocks() { return [rsBlock(), thBlock(), pushBlock()]; },
    tables,
    clear() { rs = th = ps = nlth = modalC = null; },
    modelChanged() { modalC = null; },
    get results() { return { rs, th, ps, nlth }; },
  };
}
