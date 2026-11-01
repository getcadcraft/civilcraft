/* SPDX-License-Identifier: Apache-2.0 */
/**
 * rail-ui.js — the alignment's Railway block in Properties (0.7.1 71.26): railway on / off, the track (gauge, rail section, tracks and
 * their centres, the cant's pivot), the speeds, every curve's transition and applied cant with its equilibrium cant, deficiency,
 * excess and ramp gradient, the limits, sleepers, ballast and sub-ballast, the warnings, the cant diagram, "Build the track" (the
 * corridor) and the track's quantities. Every change is one undo step (project.change on alignment.rail or the PIs).
 *
 *   railProps(ctx, a, plan, item) → nodes   ctx = { el, project: () => Project, units: () => 'ft'|'m', numInput, row, say }
 *                                          plan = project.railPlan(a); item = the corridor's graded (or stand-in) item, or null
 *   drawCant(canvas, plan, { start, end, units, colors })   the cant diagram (exported for tests)
 */

import { STANDARDS } from './rail-standard.js';   // 0.8 CV.1
import { t } from './i18n.js';
import { GAUGES, RAIL_PROFILES, SLEEPERS, PIVOTS, MAX_TRACKS, railDefaults, cleanRail, baseOf, cantAt } from './rail.js';
import { TRANSITIONS } from './alignment.js';
import { defaultAssembly } from './corridor.js';
import { formatStation, fixed, volumeText } from './units.js';

export function railProps(ctx, a, plan, item) {
  const { el } = ctx, P = ctx.project(), U = ctx.units(), us = U === 'm' ? 'm' : 'ft';
  const out = [el('h3', { className: 'cv-h3' }, t('rail.head'))];
  const find = (s) => s.alignments.find((x) => x.id === a.id);
  const set = (label, fn) => P.change(label, (s) => { const x = find(s); const r = cleanRail({ ...railDefaults(U), ...(x.rail || {}), on: true }, U); fn(r); x.rail = cleanRail(r, U); });
  const on = el('input', { type: 'checkbox', id: 'cv-rail-on', checked: !!a.rail?.on, 'data-rail-on': '' });
  on.addEventListener('change', () => P.change(t(on.checked ? 'rail.undo.on' : 'rail.undo.off'), (s) => { const x = find(s); x.rail = cleanRail({ ...railDefaults(U), ...(x.rail || {}), on: on.checked }, U); }));
  out.push(el('label', { className: 'cv-check', for: 'cv-rail-on' }, on, ' ', t('rail.on')));
  if (!a.rail?.on) { out.push(el('p', { className: 'cv-note' }, t('rail.off.note'))); return out; }
  const r = a.rail, num = (v, commit, o) => ctx.numInput(v, commit, { width: '5.5rem', ...o });
  const pos = (lo, hi) => (v) => { const x = Number(v); return v !== '' && Number.isFinite(x) && x >= lo && x <= hi ? x : null; };
  const field = (label, id, value, unit, check, apply, undo) => ctx.row(label, el('div', { className: 'cv-row' }, num(value, (v) => { const x = check(v); if (x === null) return false; set(undo, (rr) => apply(rr, x)); }, { id }), unit ? el('span', { className: 'cv-unit' }, unit) : null), id);
  const select = (id, opts, value, onPick, label) => {
    const s = el('select', { className: 'cv-select', id, 'aria-label': label }, ...opts.map(([v, txt]) => el('option', { value: v, selected: String(v) === String(value) }, txt)));
    s.addEventListener('change', () => onPick(s.value));
    return s;
  };
  out.push(el('p', { className: 'cv-note' }, t('rail.note')));

  // ---- the track
  const preset = GAUGES.find((g) => g.mm === r.gauge);
  const gSel = select('cv-rail-gauge', [...GAUGES.map((g) => [g.key, t('rail.gauge.' + g.key, { mm: g.mm })]), ['other', t('rail.gauge.other')]], preset ? preset.key : 'other',
    (v) => { const g = GAUGES.find((x) => x.key === v); if (g) set(t('rail.undo.gauge'), (rr) => { rr.gauge = g.mm; }); }, t('rail.gauge'));
  const gIn = num(String(r.gauge), (v) => { const x = pos(500, 2000)(v); if (x === null) return false; set(t('rail.undo.gauge'), (rr) => { rr.gauge = x; }); }, { id: 'cv-rail-gauge-mm', label: t('rail.gauge.mm') });
  const bIn = num(r.base === null ? '' : String(r.base), (v) => { const s = String(v).trim(); const x = s === '' ? null : pos(500, 2200)(s); if (s !== '' && x === null) return false; set(t('rail.undo.base'), (rr) => { rr.base = x; }); }, { id: 'cv-rail-base', text: true });
  bIn.placeholder = String(Math.round(baseOf({ ...r, base: null })));
  out.push(el('div', { className: 'cv-props', 'data-rail-track': '' },
    ...ctx.row(t('rail.gauge'), gSel, 'cv-rail-gauge'),
    ...ctx.row(t('rail.gauge.mm'), el('div', { className: 'cv-row' }, gIn, el('span', { className: 'cv-unit' }, 'mm')), 'cv-rail-gauge-mm'),
    ...ctx.row(t('rail.base'), el('div', { className: 'cv-row' }, bIn, el('span', { className: 'cv-unit' }, 'mm')), 'cv-rail-base'),
    ...ctx.row(t('rail.rail'), select('cv-rail-rail', Object.keys(RAIL_PROFILES).map((k) => [k, t('rail.rail.opt', { name: k, kg: fixed(RAIL_PROFILES[k].kg, 1) })]), r.rail, (v) => set(t('rail.undo.rail'), (rr) => { rr.rail = v; }), t('rail.rail')), 'cv-rail-rail'),
    ...field(t('rail.tracks'), 'cv-rail-tracks', String(r.tracks), '', (v) => { const x = Number(v); return Number.isInteger(x) && x >= 1 && x <= MAX_TRACKS ? x : null; }, (rr, x) => { rr.tracks = x; }, t('rail.undo.tracks')),
    ...(r.tracks > 1 ? field(t('rail.centres'), 'cv-rail-centres', fixed(r.centres, 2), us, pos(0.5, 70), (rr, x) => { rr.centres = x; }, t('rail.undo.track')) : []),
    ...ctx.row(t('rail.pivot'), select('cv-rail-pivot', PIVOTS.map((k) => [k, t('rail.pivot.' + k)]), r.pivot, (v) => set(t('rail.undo.pivot'), (rr) => { rr.pivot = v; }), t('rail.pivot')), 'cv-rail-pivot')));

  // ---- speeds: the alignment's design speed (Design speed above, 71.24) and the slowest trains
  const sp = a.design?.speed, unit = a.design?.unit || (U === 'm' ? 'km/h' : 'mph');
  const minIn = num(r.minSpeed === null ? '' : String(r.minSpeed), (v) => { const s = String(v).trim(); const x = s === '' ? null : pos(0.1, 999)(s); if (s !== '' && x === null) return false; set(t('rail.undo.speed'), (rr) => { rr.minSpeed = x; }); }, { id: 'cv-rail-minspeed', text: true });
  minIn.placeholder = t('rail.minspeed.none');
  out.push(el('div', { className: 'cv-props' },
    ...ctx.row(t('rail.speed'), sp ? t('rail.speed.is', { v: fixed(sp, 0), unit }) : t('rail.speed.none.short')),
    ...ctx.row(t('rail.minspeed'), el('div', { className: 'cv-row' }, minIn, el('span', { className: 'cv-unit' }, unit)), 'cv-rail-minspeed')));

  // ---- every curve: transition and cant
  const al = P.alignment(a), cvs = al.ok ? al.curves : [];
  if (cvs.length) {
    const setPi = (label, i, fn) => P.change(label, (s) => { const q = find(s).pis[i]; if (q) fn(q); });
    const allTr = select('cv-rail-tr-all', [['', t('rail.tr.all.pick')], ...TRANSITIONS.map((k) => [k, t('rail.tr.' + k)])], '', (v) => { if (!v) return; P.change(t('rail.undo.tr'), (s) => { for (const q of find(s).pis) if (q.r > 0) { if (v === 'clothoid') delete q.tr; else q.tr = v; } }); }, t('rail.tr.all'));
    out.push(el('div', { className: 'cv-props' }, ...ctx.row(t('rail.tr.all'), allTr, 'cv-rail-tr-all')));
    const byPi = new Map((plan?.curves || []).map((c) => [c.piIndex, c]));
    const tbody = el('tbody', { 'data-rail-curves': '' });
    cvs.forEach((c) => {
      const i = c.piIndex, q = a.pis[i] || {}, pc = byPi.get(i);
      const trSel = select('cv-rail-tr-' + (i + 1), TRANSITIONS.map((k) => [k, t('rail.tr.' + k)]), q.tr || 'clothoid', (v) => setPi(t('rail.undo.tr'), i, (p) => { if (v === 'clothoid') delete p.tr; else p.tr = v; }), t('rail.tr.of', { n: i + 1 }));
      const cIn = num(q.cant ? String(q.cant) : '0', (v) => { const x = pos(-300, 300)(v); if (x === null) return false; setPi(t('rail.undo.cant'), i, (p) => { if (x) p.cant = x; else delete p.cant; }); }, { id: 'cv-rail-cant-' + (i + 1), label: t('rail.cant.of', { n: i + 1 }), width: '4.5rem' });
      const mm = (v) => (v === null || v === undefined ? '—' : fixed(v, 0));
      const g = pc?.rampIn ? Math.max(pc.rampIn.gradient, pc.rampOut?.gradient || 0) : null;
      tbody.append(el('tr', {}, el('td', {}, String(i + 1)), el('td', { className: 'num' }, fixed(c.r, 0)), el('td', {}, c.ls1 > 0 || c.ls2 > 0 ? trSel : t('rail.tr.none')), el('td', {}, cIn),
        el('td', { className: 'num', 'data-rail-eq': i + 1 }, mm(pc?.eq)), el('td', { className: 'num', 'data-rail-def': i + 1 }, mm(pc?.deficiency)), el('td', { className: 'num' }, mm(pc?.excess)),
        el('td', { className: 'num' }, g === null || !Number.isFinite(g) ? '—' : fixed(g, 2))));
    });
    out.push(el('div', { className: 'cv-table-wrap' }, el('table', { className: 'cv-table' },
      el('thead', {}, el('tr', {}, ...['#', t('rail.c.r', { u: us }), t('rail.c.tr'), t('rail.c.cant'), t('rail.c.eq'), t('rail.c.def'), t('rail.c.exc'), t('rail.c.grad')].map((h) => el('th', { scope: 'col' }, h)))), tbody)));
    out.push(el('p', { className: 'cv-note' }, t('rail.curves.note', { base: Math.round(baseOf(r)) })));
  } else out.push(el('p', { className: 'cv-note' }, t('rail.nocurves')));

  // ---- limits (placeholders)
  const L = r.limits;
  out.push(el('h3', { className: 'cv-h3' }, t('rail.limits')), el('div', { className: 'cv-props', 'data-rail-limits': '' },
    ...field(t('rail.lim.cant'), 'cv-rail-lim-cant', String(L.cant), 'mm', pos(0, 300), (rr, x) => { rr.limits.cant = x; }, t('rail.undo.limit')),
    ...field(t('rail.lim.def'), 'cv-rail-lim-def', String(L.deficiency), 'mm', pos(0, 400), (rr, x) => { rr.limits.deficiency = x; }, t('rail.undo.limit')),
    ...field(t('rail.lim.exc'), 'cv-rail-lim-exc', String(L.excess), 'mm', pos(0, 400), (rr, x) => { rr.limits.excess = x; }, t('rail.undo.limit')),
    ...field(t('rail.lim.grad'), 'cv-rail-lim-grad', String(L.gradient), 'mm/m', pos(0.1, 20), (rr, x) => { rr.limits.gradient = x; }, t('rail.undo.limit')),
    ...field(t('rail.lim.rate'), 'cv-rail-lim-rate', String(L.rate), 'mm/s', pos(1, 500), (rr, x) => { rr.limits.rate = x; }, t('rail.undo.limit'))));
  out.push(el('p', { className: 'cv-note' }, t('rail.limits.note')));
  // 0.8 CV.1 (civil_PART_4): the standard these placeholders are for, and the clause the person enters beside each (nothing from a standard is built in)
  out.push(el('h3', { className: 'cv-h3' }, t('rail.std')), el('p', { className: 'cv-note' }, t('rail.std.note')),
    el('div', { className: 'cv-props', 'data-rail-std': '' }, ...ctx.row(t('rail.std.pick'), select('cv-rail-std', [['none', t('rail.std.none')], ['eu', t('rail.std.eu')]], r.std || 'none', (v) => set(t('rail.undo.std'), (rr) => { rr.std = v === 'eu' ? 'eu' : 'none'; })), 'cv-rail-std')));
  if (r.std === 'eu') {
    out.push(el('ul', { className: 'cv-plainlist', 'data-rail-std-docs': '' }, ...STANDARDS.eu.docs.map((d) => el('li', {}, el('strong', {}, d.ref), ' ' + d.title))));
    const cite = (key, label) => { const inp = el('input', { type: 'text', className: 'cv-input', id: 'cv-rail-cite-' + key, maxLength: 120, value: (r.cites || {})[key] || '', placeholder: t('rail.cite.empty'), 'aria-label': label });
      inp.addEventListener('change', () => set(t('rail.undo.std'), (rr) => { rr.cites ||= {}; if (inp.value.trim()) rr.cites[key] = inp.value.trim().slice(0, 120); else delete rr.cites[key]; })); return ctx.row(label, inp, 'cv-rail-cite-' + key); };
    out.push(el('div', { className: 'cv-props', 'data-rail-cites': '' }, ...cite('cant', t('rail.lim.cant')), ...cite('deficiency', t('rail.lim.def')), ...cite('excess', t('rail.lim.exc')), ...cite('gradient', t('rail.lim.grad')), ...cite('rate', t('rail.lim.rate')), ...cite('turnout', t('rail.cite.turnout')), ...cite('gauge', t('rail.cite.gauge'))));
    out.push(el('p', { className: 'cv-note', 'data-rail-placeholder': '' }, t('rail.std.placeholder')));
  }

  // ---- warnings
  const ws = plan?.warnings || [];
  if (ws.length) out.push(el('div', { className: 'cv-report' + (ws.some((w) => w.severity !== 'note') ? ' is-error' : ''), 'data-rail-warnings': '' }, el('ul', {}, ...ws.map((w) => el('li', { 'data-rail-warning': w.code }, w.text)))));

  // ---- the cant diagram
  if (plan?.curves?.some((c) => c.cant)) {
    const cv = el('canvas', { className: 'cv-se-diagram', 'data-rail-diagram': '', width: 600, height: 200, role: 'img', 'aria-label': t('rail.diagram.label') });
    out.push(el('h3', { className: 'cv-h3' }, t('rail.diagram')), cv);
    requestAnimationFrame(() => drawCant(cv, plan, { start: al.start, end: al.end, units: U }));
  }

  // ---- sleepers, ballast, sub-ballast
  const S = r.sleeper, B = r.ballast, SB = r.sub;
  out.push(el('h3', { className: 'cv-h3' }, t('rail.bed')), el('div', { className: 'cv-props', 'data-rail-bed': '' },
    ...ctx.row(t('rail.sl.material'), select('cv-rail-sl-mat', SLEEPERS.map((k) => [k, t('rail.sl.' + k)]), S.material, (v) => set(t('rail.undo.sleeper'), (rr) => { rr.sleeper.material = v; }), t('rail.sl.material')), 'cv-rail-sl-mat'),
    ...field(t('rail.sl.length'), 'cv-rail-sl-len', fixed(S.length, 3), us, pos(0.1, 20), (rr, x) => { rr.sleeper.length = x; }, t('rail.undo.sleeper')),
    ...field(t('rail.sl.width'), 'cv-rail-sl-w', fixed(S.width, 3), us, pos(0.01, 4), (rr, x) => { rr.sleeper.width = x; }, t('rail.undo.sleeper')),
    ...field(t('rail.sl.depth'), 'cv-rail-sl-d', fixed(S.depth, 3), us, pos(0.01, 4), (rr, x) => { rr.sleeper.depth = x; }, t('rail.undo.sleeper')),
    ...field(t('rail.sl.spacing'), 'cv-rail-sl-sp', fixed(S.spacing, 3), us, pos(0.05, 10), (rr, x) => { rr.sleeper.spacing = x; }, t('rail.undo.sleeper')),
    ...field(t('rail.bl.depth'), 'cv-rail-bl-d', fixed(B.depth, 3), us, pos(0, 7), (rr, x) => { rr.ballast.depth = x; }, t('rail.undo.ballast')),
    ...field(t('rail.bl.shoulder'), 'cv-rail-bl-sh', fixed(B.shoulder, 3), us, pos(0, 10), (rr, x) => { rr.ballast.shoulder = x; }, t('rail.undo.ballast')),
    ...field(t('rail.bl.slope'), 'cv-rail-bl-sl', fixed(B.slope, 2), ': 1', pos(0.5, 10), (rr, x) => { rr.ballast.slope = x; }, t('rail.undo.ballast')),
    ...field(t('rail.bl.crib'), 'cv-rail-bl-crib', fixed(B.crib, 3), us, pos(0, 0.7), (rr, x) => { rr.ballast.crib = x; }, t('rail.undo.ballast')),
    ...field(t('rail.sb.depth'), 'cv-rail-sb-d', fixed(SB.depth, 3), us, pos(0, 7), (rr, x) => { rr.sub.depth = x; }, t('rail.undo.sub')),
    ...field(t('rail.sb.cess'), 'cv-rail-sb-cess', fixed(SB.cess, 3), us, pos(0, 30), (rr, x) => { rr.sub.cess = x; }, t('rail.undo.sub')),
    ...field(t('rail.sb.fall'), 'cv-rail-sb-fall', fixed(SB.fall * 100, 2), '%', (v) => { const x = pos(0, 20)(v); return x === null ? null : x / 100; }, (rr, x) => { rr.sub.fall = x; }, t('rail.undo.sub'))));

  // ---- build the track (the corridor) and its quantities
  if (!a.corridor?.on) {
    out.push(el('div', { className: 'cv-actions' }, el('button', { type: 'button', className: 'btn-line btn-sm-cc', 'data-rail-build': '', onclick: () => {
      P.change(t('rail.undo.build'), (s) => { const x = find(s); x.corridor = { ...defaultAssembly(U), ...(x.corridor || {}), on: true }; });
      ctx.say(a.pvis?.length >= 2 ? t('rail.built') : t('rail.built.noprofile'));
    } }, el('i', { className: 'bi bi-train-front', 'aria-hidden': 'true' }), ' ', t('rail.build'))));
    out.push(el('p', { className: 'cv-note' }, t('rail.build.note')));
  } else {
    const q = item?.rail?.quantities;
    if (q && q.length > 0) {
      const V = (v) => volumeText(v, U);
      out.push(el('h3', { className: 'cv-h3' }, t('rail.qty')), el('dl', { className: 'cv-vol', 'data-rail-qty': '' },
        el('dt', {}, t('rail.qty.length')), el('dd', {}, fixed(q.length, 2) + ' ' + us),
        el('dt', {}, t('rail.qty.rail')), el('dd', { 'data-rail-qty-rail': '' }, fixed(q.railLength, 1) + ' ' + us),
        el('dt', {}, t('rail.qty.sleepers')), el('dd', { 'data-rail-qty-sleepers': '' }, String(q.sleepers)),
        el('dt', {}, t('rail.qty.ballast')), el('dd', { 'data-rail-qty-ballast': '' }, V(q.ballast)),
        el('dt', {}, t('rail.qty.gross')), el('dd', {}, V(q.ballastGross)),
        el('dt', {}, t('rail.qty.sub')), el('dd', {}, V(q.sub))));
      out.push(el('p', { className: 'cv-note' }, t('rail.qty.note')));
    } else out.push(el('p', { className: 'cv-note' }, t('rail.qty.none')));
  }
  return out;
}

/** The cant diagram: station across, each rail's height over the profile up (left rail solid, right dashed), the applied cant
 *  thin, the ramp ends ticked. */
export function drawCant(cv, plan, { start, end, units = 'm', colors = null } = {}) {
  const dpr = globalThis.devicePixelRatio || 1, w = cv.clientWidth || 600, h = cv.clientHeight || 200;
  cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
  const ctx = cv.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const cs = globalThis.getComputedStyle ? getComputedStyle(document.documentElement) : null, tok = (n, d) => cs?.getPropertyValue(n).trim() || d;
  const C = colors || { bg: tok('--sheet-2', '#fff'), ink: tok('--ink', '#17202b'), grid: tok('--grid', '#d5dde5'), L: tok('--layer-red', '#b3122e'), R: tok('--layer-blue', '#1e48c8') };
  ctx.fillStyle = C.bg; ctx.fillRect(0, 0, w, h);
  const top = Math.max(10, ...plan.curves.map((c) => Math.abs(c.cant))) * 1.2, lo = Math.min(0, ...plan.curves.map((c) => -Math.abs(c.cant) * (plan.pivot === 'low' ? 0 : 1))) * 1.2;
  const pad = { l: 46, r: 8, t: 10, b: 22 };
  const X = (s) => pad.l + ((s - start) / Math.max(end - start, 1e-9)) * (w - pad.l - pad.r), Y = (v) => h - pad.b - ((v - lo) / Math.max(top - lo, 1e-9)) * (h - pad.t - pad.b);
  ctx.font = '11px system-ui, sans-serif'; ctx.fillStyle = C.ink; ctx.strokeStyle = C.grid; ctx.lineWidth = 1;
  const step = [10, 20, 25, 50, 100].find((v) => (top - lo) / v <= 6) || 100;
  for (let v = Math.ceil(lo / step) * step; v <= top; v += step) { ctx.beginPath(); ctx.moveTo(pad.l, Y(v)); ctx.lineTo(w - pad.r, Y(v)); ctx.stroke(); ctx.textAlign = 'right'; ctx.textBaseline = 'middle'; ctx.fillText(v + ' mm', pad.l - 4, Y(v)); }
  const n = 500, line = (k, dash, width) => { ctx.strokeStyle = k === 'E' ? C.ink : C[k]; ctx.lineWidth = width; ctx.setLineDash(dash); ctx.beginPath(); for (let i = 0; i <= n; i++) { const s = start + ((end - start) * i) / n, v = cantAt(plan, s)[k]; i ? ctx.lineTo(X(s), Y(v)) : ctx.moveTo(X(s), Y(v)); } ctx.stroke(); ctx.setLineDash([]); };
  line('E', [2, 3], 1); line('L', [], 2); line('R', [6, 4], 2);
  ctx.strokeStyle = C.ink; ctx.lineWidth = 1;
  for (const c of plan.curves) for (const r of [c.rampIn, c.rampOut]) if (r) for (const s of [r.from, r.to]) { const x = X(s); ctx.beginPath(); ctx.moveTo(x, h - pad.b); ctx.lineTo(x, h - pad.b + 4); ctx.stroke(); }
  ctx.fillStyle = C.ink; ctx.textBaseline = 'top';
  ctx.textAlign = 'left'; ctx.fillText(formatStation(start, units, 0), pad.l, h - pad.b + 6); ctx.textAlign = 'right'; ctx.fillText(formatStation(end, units, 0), w - pad.r, h - pad.b + 6);
}
