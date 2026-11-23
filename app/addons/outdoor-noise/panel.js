/* SPDX-License-Identifier: Apache-2.0 */
/**
 * panel.js — the Outdoor noise tab (0.11 XE.3 S4): folds for Periods and ground, Roads and railways (the project's alignments), Point sources, Barriers
 * and buildings (the project's feature lines; closed ones may be buildings), Receivers (the project's survey points or typed ones), Limits, and Results. The settings are kept per project name in the
 * add-on's storage. Nothing in the project is changed; results go to this tab, a CSV and Problems.
 */
import { el, field, num, select, table, download } from './ui.js';
import { GROUND, TREF, OCTAVES, SOURCE } from './lib/cnossos.js';
import { CATEGORIES, F4 } from './lib/cnossos-road.js';

const fx = (v, d = 1) => (Number.isFinite(v) ? Number(v).toFixed(d) : '–');
const ROAD_CATS = ['1', '2', '3', '4a', '4b'];

export function mountPanel(ctx, root) {
  const { t, PERIODS } = ctx;
  const P = () => ctx.project();
  const key = () => 'settings:' + (P()?.state?.name || 'untitled');
  const status = el('p', { className: 'nz-note', role: 'status', 'data-nz-status': '' });
  const say = (m, bad = false) => { status.textContent = m || ''; status.classList.toggle('nz-warn', !!bad); };
  const fold = (title, attrs, ...kids) => el('details', attrs, el('summary', {}, title), ...kids);
  const blank = () => ({ ground: 'D', periods: Object.fromEntries(PERIODS.map((p) => [p, { p: 0.5, hours: TREF[p] }])), lines: {}, points: [], receivers: [], barriers: {}, buildings: {}, reflections: 1, limits: {} });
  let S;
  const load = () => { try { S = { ...blank(), ...(ctx.api.storage.get(key()) || {}) }; } catch { S = blank(); } };
  const keep = () => { try { ctx.api.storage.set(key(), S); } catch { /* storage full or private window */ } };
  const n = (v) => { const x = Number(String(v).replace(',', '.')); return Number.isFinite(x) ? x : null; };
  const bind = (input, get, set) => { input.addEventListener('change', () => { set(input.value); keep(); }); return input; };

  function render() {
    load();
    const proj = P();
    if (!proj) { root.replaceChildren(el('p', { className: 'nz-note' }, t('nz.noproject'))); return; }
    const st = proj.state, U = st.units === 'm' ? 'm' : 'ft';
    // ---- periods and ground
    const per = table([t('nz.period'), t('nz.p'), t('nz.hours')], PERIODS.map((p) => ({ attrs: { 'data-nz-period': p }, cells: [t('nz.period.' + p),
      bind(num(S.periods[p]?.p, { min: 0, max: 1, step: 0.01, 'aria-label': t('nz.p') + ' ' + t('nz.period.' + p), 'data-nz-p': p }), null, (v) => { S.periods[p] = { ...S.periods[p], p: n(v) }; }),
      bind(num(S.periods[p]?.hours, { min: 0, step: 0.5, 'aria-label': t('nz.hours') + ' ' + t('nz.period.' + p) }), null, (v) => { S.periods[p] = { ...S.periods[p], hours: n(v) }; })] })));
    const ground = bind(select(Object.entries(GROUND).map(([k, g]) => [k, k + ' · G ' + g.G + ' · ' + g.name]), S.ground, { 'data-nz-ground': '' }), null, (v) => { S.ground = v; });
    const refl = bind(select([[0, t('nz.refl.0')], [1, t('nz.refl.1')], [2, t('nz.refl.2')]], S.reflections ?? 1, { 'data-nz-reflections': '' }), null, (v) => { S.reflections = Number(v); });
    const designBox = el('input', { type: 'checkbox', 'data-nz-design': '' }); designBox.checked = S.design !== false;
    designBox.addEventListener('change', () => { S.design = designBox.checked; keep(); });
    const secPeriods = fold(t('nz.sec.periods'), { open: true }, el('p', { className: 'nz-note' }, t('nz.p.help')), per, field(t('nz.ground'), ground), el('p', { className: 'nz-note' }, t('nz.ground.help')),
      field(t('nz.design'), designBox), el('p', { className: 'nz-note' }, t('nz.design.help')),
      field(t('nz.refl'), refl), el('p', { className: 'nz-note' }, t('nz.refl.help')));
    // ---- roads and railways: the alignments
    const lineRows = (st.alignments || []).map((a) => {
      const set = S.lines[a.id] || { kind: 'off' };
      const kinds = [['off', t('nz.kind.off')], ['road', t('nz.kind.road')], ...(ctx.emission.rail ? [['rail', t('nz.kind.rail')]] : [])];
      const kindSel = select(kinds, set.kind, { 'data-nz-kind': a.id, 'aria-label': t('nz.kind') + ' ' + a.name });
      kindSel.addEventListener('change', () => { S.lines[a.id] = { ...set, kind: kindSel.value }; keep(); render(); });
      const body = [field(a.name, kindSel)];
      if (set.kind === 'road') {
        const surf = select(Object.entries(F4).map(([k, s]) => [k, s.name]), set.surface || 'reference', { 'data-nz-surface': a.id });
        surf.addEventListener('change', () => { set.surface = surf.value; S.lines[a.id] = set; keep(); });
        const grad = num(set.gradient ?? 0, { step: 0.5, 'data-nz-gradient': a.id, 'aria-label': t('nz.gradient') });
        grad.addEventListener('change', () => { set.gradient = n(grad.value) ?? 0; S.lines[a.id] = set; keep(); });
        const cell = (c, p) => { const i = num(set.traffic?.[c]?.[p] ?? '', { min: 0, step: 1, 'data-nz-q': a.id + ':' + c + ':' + p, 'aria-label': t('nz.q') + ' ' + c + ' ' + p }); i.addEventListener('change', () => { set.traffic = set.traffic || {}; set.traffic[c] = { ...(set.traffic[c] || {}), [p]: n(i.value) }; S.lines[a.id] = set; keep(); }); return i; };
        const speed = (c) => { const i = num(set.traffic?.[c]?.v ?? '', { min: 0, step: 1, 'data-nz-v': a.id + ':' + c, 'aria-label': t('nz.v') + ' ' + c }); i.addEventListener('change', () => { set.traffic = set.traffic || {}; set.traffic[c] = { ...(set.traffic[c] || {}), v: n(i.value) }; S.lines[a.id] = set; keep(); }); return i; };
        body.push(field(t('nz.surface'), surf), field(t('nz.gradient'), grad), el('p', { className: 'nz-note' }, t('nz.traffic.help')),
          table([t('nz.cat'), ...PERIODS.map((p) => t('nz.q.' + p)), t('nz.v')], ROAD_CATS.map((c) => ({ cells: [c + ' · ' + CATEGORIES[c].name, ...PERIODS.map((p) => cell(c, p)), speed(c)] }))));
      }
      if (set.kind === 'rail') {
        const ta = el('textarea', { rows: 6, spellcheck: 'false', 'data-nz-rail': a.id, 'aria-label': t('nz.rail.json') }, JSON.stringify(set.rail || ctx.railTemplate?.() || {}, null, 1));
        ta.addEventListener('change', () => { try { set.rail = JSON.parse(ta.value); S.lines[a.id] = set; keep(); say(''); } catch { say(t('nz.err.json'), true); } });
        const cref = select([[1, t('nz.cref.1')], [0, t('nz.cref.0')]], set.cref ?? 1, { 'data-nz-cref': a.id, 'aria-label': t('nz.cref') });
        cref.addEventListener('change', () => { set.cref = Number(cref.value); S.lines[a.id] = set; keep(); });
        body.push(el('p', { className: 'nz-note' }, t('nz.rail.help')), field(t('nz.rail.json'), ta), field(t('nz.cref'), cref));
      }
      return el('div', { 'data-nz-line': a.id }, ...body);
    });
    const secLines = fold(t('nz.sec.lines'), {}, ...(lineRows.length ? lineRows : [el('p', { className: 'nz-note' }, t('nz.lines.none'))]));
    // ---- point sources
    const ptRows = S.points.map((pt, i) => {
      const lw = el('input', { type: 'text', value: (pt.lw || []).join(' '), 'data-nz-lw': String(i), 'aria-label': t('nz.lw') });
      lw.addEventListener('change', () => { const v = lw.value.split(/[\s,;]+/).filter(Boolean).map(n); pt.lw = v.length === 8 && v.every((x) => x !== null) ? v : pt.lw; keep(); render(); });
      const f = (k, label) => { const x = num(pt[k], { 'aria-label': label }); x.addEventListener('change', () => { pt[k] = n(x.value); keep(); }); return x; };
      const hrs = (p) => { const x = num(pt.hours?.[p] ?? '', { min: 0, step: 0.5, 'aria-label': t('nz.hours') + ' ' + p }); x.addEventListener('change', () => { pt.hours = { ...(pt.hours || {}), [p]: n(x.value) }; keep(); }); return x; };
      const name = el('input', { type: 'text', value: pt.name || '', 'aria-label': t('nz.name.label') }); name.addEventListener('change', () => { pt.name = name.value.slice(0, 60); keep(); });
      return el('div', { className: 'nz-row', 'data-nz-point': String(i) }, name, f('x', 'x (' + U + ')'), f('y', 'y (' + U + ')'), f('h', t('nz.h')), lw, ...PERIODS.map(hrs),
        el('button', { type: 'button', className: 'btn-line', onclick: () => { S.points.splice(i, 1); keep(); render(); } }, t('nz.remove')));
    });
    const addPt = el('button', { type: 'button', className: 'btn-line', 'data-nz-add-point': '', onclick: () => { S.points.push({ id: 'p' + Date.now(), name: t('nz.point.default', { n: S.points.length + 1 }), x: 0, y: 0, h: 2, lw: [], hours: { day: TREF.day } }); keep(); render(); } }, t('nz.point.add'));
    const secPoints = fold(t('nz.sec.points'), {}, el('p', { className: 'nz-note' }, t('nz.points.help', { u: U })), ...ptRows, addPt);
    // ---- barriers: feature lines
    S.buildings = S.buildings || {};
    const fRows = (st.features || []).filter((f) => f.pts?.length >= 2).map((f) => {
      const isB = !!S.buildings[f.id], rec = isB ? S.buildings[f.id] : S.barriers[f.id];
      const kinds = [['none', t('nz.obj.none')], ['barrier', t('nz.obj.barrier')], ...(f.closed && f.pts.length >= 3 ? [['building', t('nz.obj.building')]] : [])];
      const kind = select(kinds, isB ? 'building' : S.barriers[f.id] ? 'barrier' : 'none', { 'data-nz-obj': f.id, 'aria-label': t('nz.obj') + ' ' + (f.name || f.id) });
      const h = num(rec?.height ?? '', { min: 0, step: 0.1, 'data-nz-barrier': f.id, 'aria-label': t('nz.barrier.h') + ' ' + f.name });
      const al = num(rec?.alpha ?? '', { min: 0, max: 0.99, step: 0.01, 'data-nz-alpha': f.id, 'aria-label': t('nz.alpha') + ' ' + f.name, placeholder: '0' });
      const save = () => {
        const v = n(h.value), a = n(al.value), k = kind.value;
        delete S.barriers[f.id]; delete S.buildings[f.id];
        if (k !== 'none' && v > 0) (k === 'building' ? S.buildings : S.barriers)[f.id] = { height: v, ...(a !== null && a >= 0 && a < 1 ? { alpha: a } : {}) };
        keep();
      };
      // a height typed with no kind chosen makes it a barrier (as before)
      h.addEventListener('change', () => { if (kind.value === 'none' && n(h.value) > 0) kind.value = 'barrier'; save(); });
      al.addEventListener('change', save); kind.addEventListener('change', save);
      return el('div', { className: 'nz-row', 'data-nz-feature': f.id }, el('span', {}, f.name || f.id), kind, field(t('nz.barrier.h'), h), field(t('nz.alpha'), al));
    });
    const secBarriers = fold(t('nz.sec.barriers'), {}, el('p', { className: 'nz-note' }, t('nz.barriers.help')), el('p', { className: 'nz-note' }, t('nz.alpha.help')), ...(fRows.length ? fRows : [el('p', { className: 'nz-note' }, t('nz.barriers.none'))]));
    // ---- receivers
    const rRows = S.receivers.map((r, i) => {
      const h = num(r.h ?? 4, { min: 0, step: 0.1, 'data-nz-rh': String(i), 'aria-label': t('nz.h') }); h.addEventListener('change', () => { r.h = n(h.value) ?? 4; keep(); });
      return { attrs: { 'data-nz-receiver': r.id }, cells: [r.name, fx(r.x, 2), fx(r.y, 2), h, el('button', { type: 'button', className: 'btn-line', onclick: () => { S.receivers.splice(i, 1); keep(); render(); } }, t('nz.remove'))] };
    });
    const fromPicked = el('button', { type: 'button', className: 'btn-line', 'data-nz-from-picked': '', onclick: () => {
      const nums = new Set((window.civilcraft?.picked || []).map(String)), pts = (proj.points || []).filter((p) => nums.has(String(p.n)));
      if (!pts.length) { say(t('nz.recv.nopick'), true); return; }
      for (const p of pts) if (!S.receivers.some((r) => r.id === 'pt:' + p.n)) S.receivers.push({ id: 'pt:' + p.n, name: (p.n + ' ' + (p.d || '')).trim(), x: p.x, y: p.y, h: 4 });
      keep(); say(t('nz.recv.added', { n: pts.length })); render();
    } }, t('nz.recv.picked'));
    const rx = num('', { 'aria-label': 'x', 'data-nz-rx': '' }), ry = num('', { 'aria-label': 'y', 'data-nz-ry': '' });
    const addTyped = el('button', { type: 'button', className: 'btn-line', 'data-nz-add-receiver': '', onclick: () => {
      const x = n(rx.value), y = n(ry.value); if (x === null || y === null) { say(t('nz.recv.xy'), true); return; }
      S.receivers.push({ id: 'r' + Date.now(), name: t('nz.recv.default', { n: S.receivers.length + 1 }), x, y, h: 4 }); keep(); render();
    } }, t('nz.recv.add'));
    const secRecv = fold(t('nz.sec.receivers'), { open: true }, el('p', { className: 'nz-note' }, t('nz.recv.help', { u: U })),
      S.receivers.length ? table([t('nz.recv.name'), 'x (' + U + ')', 'y (' + U + ')', t('nz.h'), ''], rRows, { 'data-nz-receivers': '' }) : el('p', { className: 'nz-note' }, t('nz.recv.none')),
      el('div', { className: 'nz-row' }, fromPicked), el('div', { className: 'nz-row' }, field('x', rx), field('y', ry), addTyped));
    // ---- limits
    const lim = (p) => bind(num(S.limits[p] ?? '', { min: 0, step: 1, 'data-nz-limit': p, 'aria-label': t('nz.limit') + ' ' + t('nz.period.' + p) }), null, (v) => { const x = n(v); if (x > 0) S.limits[p] = x; else delete S.limits[p]; });
    const secLimits = fold(t('nz.sec.limits'), {}, el('p', { className: 'nz-note' }, t('nz.limits.help')), ...PERIODS.map((p) => field(t('nz.period.' + p), lim(p))), field(t('nz.period.den'), lim('den')));
    // ---- run
    const out = el('div', { 'data-nz-results': '' });
    const run = el('button', { type: 'button', className: 'btn-plot', 'data-nz-run': '', onclick: () => {
      run.disabled = true; say(t('nz.busy'));
      setTimeout(() => {
        try { showResults(out, calc()); } catch (e) { say(String(e && e.message || e), true); }
        run.disabled = false;
      }, 20);
    } }, t('nz.run'));
    root.replaceChildren(el('p', { className: 'nz-note' }, t('nz.intro')), el('p', { className: 'nz-note' }, t('nz.promise')),
      secPeriods, secLines, secPoints, secBarriers, secRecv, secLimits, el('div', { className: 'nz-row' }, run), status, out,
      el('p', { className: 'nz-note' }, t('nz.source', { method: SOURCE.method })));
    if (ctx.last) showResults(out, ctx.last);
  }

  function calc() {
    const proj = P(), lines = {};
    for (const [id, set] of Object.entries(S.lines)) {
      if (set.kind === 'road') {
        const per = {};
        for (const p of PERIODS) {
          const traffic = {};
          for (const c of ROAD_CATS) { const q = set.traffic?.[c]?.[p], v = set.traffic?.[c]?.v; if (q > 0 && v > 0) traffic[c] = { Q: q, v }; }
          if (Object.keys(traffic).length) per[p] = { traffic, gradient: set.gradient || 0 };
        }
        lines[id] = { kind: 'road', surface: set.surface || 'reference', ...per };
      } else if (set.kind === 'rail' && set.rail) {
        const per = {};
        for (const p of PERIODS) if (set.rail[p]) per[p] = set.rail[p];
        lines[id] = { kind: 'rail', track: set.rail.track, cref: set.cref ?? 1, ...per };
      }
    }
    const settings = { ground: GROUND[S.ground]?.G ?? 1, periods: S.periods, lines, points: S.points.filter((p) => p.lw?.length === 8), receivers: S.receivers, barriers: S.barriers, buildings: S.buildings || {}, reflections: S.reflections ?? 1, design: S.design !== false, limits: S.limits };
    const t0 = Date.now(), res = ctx.computeNoise({ project: proj, settings, emission: ctx.emission, terrain: ctx.terrain });
    res.ms = Date.now() - t0;
    ctx.last = res;
    try {
      ctx.problemsSource.set(res.problems.map((pr) => { const r = res.receivers.find((x) => x.id === pr.receiver); const vars = { name: r?.name || pr.receiver, period: t('nz.period.' + pr.period), value: fx(pr.value), limit: fx(pr.limit, 0) };
        const key = pr.period === 'den' ? 'nz.issue.limit.den' : 'nz.issue.limit';
        return { code: pr.code, part: pr.receiver + ':' + pr.period, severity: 'warning', msg: { key, vars }, text: t(key, vars), about: [], where: pr.where }; }));
    } catch { /* the shell's Problems are not loaded */ }
    return res;
  }

  function showResults(box, res) {
    const rows = res.receivers.map((r) => ({ attrs: { 'data-nz-row': r.id }, cells: [r.name, ...PERIODS.map((p) => (r.periods[p] ? fx(r.periods[p].LAeq) : '–')), Number.isFinite(r.Lden) ? fx(r.Lden) : '–', Number.isFinite(r.Lnight) ? fx(r.Lnight) : '–', r.periods.day?.top?.[0]?.source || r.periods.night?.top?.[0]?.source || '–'] }));
    const lines = [];
    const seen = new Set();
    for (const nt of res.notes) { const k = nt.key + (nt.name || ''); if (seen.has(k)) continue; seen.add(k); lines.push(el('p', { className: 'nz-note', 'data-nz-note': nt.key }, t(nt.key, nt))); }
    box.replaceChildren(el('p', { 'data-nz-summary': '' }, t('nz.done', { n: res.receivers.length, s: res.sources.length, ms: res.ms ?? 0 })),
      el('p', { className: 'nz-note' }, t('nz.table.unit')),
      res.receivers.length ? table([t('nz.recv.name'), ...PERIODS.map((p) => t('nz.laeq.' + p)), t('nz.lden'), t('nz.lnight'), t('nz.loudest')], rows, { 'data-nz-table': '' }) : el('p', { className: 'nz-note' }, t('nz.recv.none')),
      el('div', { className: 'nz-row' }, el('button', { type: 'button', className: 'btn-line', 'data-nz-csv': '', onclick: () => download('outdoor-noise.csv', '﻿' + ctx.toCsv(res)) }, t('nz.csv'))),
      ...lines);
    say(res.problems.length ? t('nz.over', { n: res.problems.length }) : '');
  }

  render();
  ctx.refresh = render;
  return { render };
}
