/* SPDX-License-Identifier: Apache-2.0 */
/**
 * rail-line-ui.js — the Railway block's second half (CV.1, 2026-11-12), called by rail-ui.js: the track geometry limits and what
 * the checks found (grades, vertical curves, short arcs and straights), the turnouts and crossovers on this alignment (add, edit,
 * remove, make the diverging track an alignment of its own), and the clearance envelope (outline, vehicle, platform, what it
 * meets, a drawing of the section at its widest). Every change is one undo step.
 *
 *   railLineLimits(ctx, a, field) → nodes     the extra limit fields (field = rail-ui.js's own field builder)
 *   railLineProps(ctx, a) → nodes             ctx as rail-ui.js: { el, project, units, numInput, row, say }
 *   envelopeSvg(el, rows, { units }) → svg     the section: the outline on the straight and where it is widest (exported for tests)
 */

import { t } from './i18n.js';
import { formatStation, fixed } from './units.js';
import { cleanRail, railDefaults } from './rail.js';
import { OUTLINES, outlineOf, cleanClearance } from './rail-clearance.js';

const SVG = 'http://www.w3.org/2000/svg';

export function railLineLimits(ctx, a, field) {
  const L = a.rail.limits, us = ctx.units() === 'm' ? 'm' : 'ft', pos = (lo, hi) => (v) => { const x = Number(v); return v !== '' && Number.isFinite(x) && x >= lo && x <= hi ? x : null; };
  const u = t('rail.undo.limit');
  return [
    ...field(t('rail.lim.grade'), 'cv-rail-lim-grade', String(L.grade), 'mm/m', pos(0.1, 100), (rr, x) => { rr.limits.grade = x; }, u),
    ...field(t('rail.lim.vradius'), 'cv-rail-lim-vr', String(L.vRadius), '× V²', pos(0, 5), (rr, x) => { rr.limits.vRadius = x; }, u),
    ...field(t('rail.lim.vlength'), 'cv-rail-lim-vl', String(L.vLength), us, pos(0, 2000), (rr, x) => { rr.limits.vLength = x; }, u),
    ...field(t('rail.lim.radius'), 'cv-rail-lim-r', String(L.radius), us, pos(0, 100000), (rr, x) => { rr.limits.radius = x; }, u),
    ...field(t('rail.lim.element'), 'cv-rail-lim-el', String(L.elementTime), 's', pos(0, 30), (rr, x) => { rr.limits.elementTime = x; }, u),
    ...field(t('rail.lim.defrate'), 'cv-rail-lim-dr', String(L.defRate), 'mm/s', pos(1, 500), (rr, x) => { rr.limits.defRate = x; }, u),
  ];
}

export function railLineProps(ctx, a) {
  const { el } = ctx, P = ctx.project(), U = ctx.units(), us = U === 'm' ? 'm' : 'ft', out = [];
  const find = (s) => s.alignments.find((x) => x.id === a.id);
  const num = (v, commit, o) => ctx.numInput(v, commit, { width: '5.5rem', ...o });
  const sta = (v) => formatStation(v, U, 0);
  const select = (id, opts, value, onPick, label) => { const s = el('select', { className: 'cv-select', id, 'aria-label': label }, ...opts.map(([v, txt]) => el('option', { value: v, selected: String(v) === String(value) }, txt))); s.addEventListener('change', () => onPick(s.value)); return s; };
  const al = P.alignment(a);

  // ---- track geometry: what the checks measured
  const chk = P.railChecks(a);
  if (chk && (chk.vertical.length || chk.grades.length)) {
    out.push(el('h3', { className: 'cv-h3' }, t('rail.geom')));
    const steep = chk.grades.reduce((m, g) => Math.max(m, Math.abs(g.g)), 0);
    out.push(el('dl', { className: 'cv-vol', 'data-rail-geom': '' }, el('dt', {}, t('rail.geom.steepest')), el('dd', { 'data-rail-steepest': '' }, fixed(steep, 2) + ' mm/m')));
    if (chk.vertical.length) {
      const tb = el('tbody', { 'data-rail-vcurves': '' });
      for (const v of chk.vertical) tb.append(el('tr', {}, el('td', {}, String(v.pvi)), el('td', { className: 'num' }, fixed(v.L, 1)), el('td', { className: 'num' }, fixed(v.radius, 0)), el('td', { className: 'num' }, v.need === null ? '—' : fixed(v.need, 0))));
      out.push(el('div', { className: 'cv-table-wrap' }, el('table', { className: 'cv-table' }, el('thead', {}, el('tr', {}, ...[t('rail.geom.pvi'), t('rail.geom.vlen', { u: us }), t('rail.geom.vrad', { u: us }), t('rail.geom.vneed', { u: us })].map((h) => el('th', { scope: 'col' }, h)))), tb)));
    }
  }

  // ---- turnouts and crossovers on this alignment
  out.push(el('h3', { className: 'cv-h3' }, t('rail.tu.head')));
  const placed = P.railTurnouts(a), list = (P.state.geo?.turnouts || []).filter((x) => x.alignment === a.id);
  const setTu = (label, id, fn) => P.change(label, (s) => { const x = (s.geo?.turnouts || []).find((q) => q.id === id); if (x) fn(x); });
  if (list.length) {
    const box = el('div', { 'data-rail-turnouts': '' });
    list.forEach((tu, i) => {
      const p = placed.find((q) => q.id === tu.id), nm = tu.name || t('rail.tu.default', { n: i + 1 });
      const stIn = num(fixed(tu.station, 2), (v) => { const x = Number(v); if (v === '' || !Number.isFinite(x)) return false; setTu(t('rail.undo.tu'), tu.id, (q) => { q.station = x; }); }, { id: 'cv-rail-tu-sta-' + (i + 1), label: t('rail.tu.sta.of', { name: nm }), width: '5.5rem', station: true });
      const nIn = num(String(tu.n), (v) => { const x = Number(v); if (!(x >= 3 && x <= 30)) return false; setTu(t('rail.undo.tu'), tu.id, (q) => { q.n = x; }); }, { id: 'cv-rail-tu-n-' + (i + 1), label: t('rail.tu.n.of', { name: nm }), width: '3.5rem' });
      const side = select('cv-rail-tu-side-' + (i + 1), [['L', t('rail.tu.left')], ['R', t('rail.tu.right')]], tu.side, (v) => setTu(t('rail.undo.tu'), tu.id, (q) => { q.side = v === 'R' ? 'R' : 'L'; }), t('rail.tu.side.of', { name: nm }));
      const spIn = num(tu.spacing ? fixed(tu.spacing, 2) : '0', (v) => { const x = Number(v); if (v === '' || !(x >= 0 && x <= 100)) return false; setTu(t('rail.undo.tu'), tu.id, (q) => { q.spacing = x; }); }, { id: 'cv-rail-tu-sp-' + (i + 1), label: t('rail.tu.sp.of', { name: nm }), width: '4rem' });
      // i18n-ignore: a CSS declaration (the x sits at the row's end)
      const rm = el('button', { type: 'button', className: 'cv-linkbtn', style: 'margin-inline-start: auto', 'data-rail-tu-remove': tu.id, 'aria-label': t('rail.tu.remove', { name: nm }), title: t('rail.tu.remove', { name: nm }), 'data-bs-toggle': 'tooltip', onclick: () => P.change(t('rail.undo.tu.remove'), (s) => { s.geo.turnouts = s.geo.turnouts.filter((q) => q.id !== tu.id); if (!s.geo.turnouts.length) delete s.geo.turnouts; if (!Object.keys(s.geo).length) delete s.geo; }) }, el('i', { className: 'bi bi-x', 'aria-hidden': 'true' }));
      const branch = el('button', { type: 'button', className: 'cv-linkbtn', 'data-rail-tu-branch': tu.id, disabled: !p?.ok, onclick: () => {
        P.change(t('rail.undo.tu.branch'), (s) => { const src = find(s); s.alignments.push({ id: P.nextId('a'), name: t('rail.tu.branch.name', { name: nm }).slice(0, 120), start: 0, pis: p.branch.pis.map((q) => ({ x: q.x, y: q.y, r: q.r || 0 })), pvis: [], sampling: null, ...(src.rail ? { rail: cleanRail({ ...src.rail, tracks: 1, clearance: src.rail.clearance }, U) } : {}), ...(src.design ? { design: { ...src.design, speed: Math.max(1, Math.floor(p.speed / (src.design.unit === 'mph' ? 1.609344 : 1))) } } : {}) }); });
        ctx.say(t('rail.tu.branch.done', { name: nm }));
      } }, t('rail.tu.branch'));
      // one block per turnout (a table of nine columns does not fit the panel): its name with the small x, the four values, what they give
      box.append(el('div', { className: 'cv-row', 'data-rail-tu': tu.id }, el('strong', {}, nm), rm),
        el('div', { className: 'cv-props' },
          ...ctx.row(t('rail.tu.c.sta'), stIn, 'cv-rail-tu-sta-' + (i + 1)),
          ...ctx.row(t('rail.tu.c.n'), el('div', { className: 'cv-row' }, el('span', { className: 'cv-unit' }, '1:'), nIn), 'cv-rail-tu-n-' + (i + 1)),
          ...ctx.row(t('rail.tu.c.side'), side, 'cv-rail-tu-side-' + (i + 1)),
          ...ctx.row(t('rail.tu.c.sp', { u: 'm' }), spIn, 'cv-rail-tu-sp-' + (i + 1))),
        p?.ok ? el('dl', { className: 'cv-vol' },
          el('dt', {}, t('rail.tu.c.lead', { u: us })), el('dd', { 'data-rail-tu-lead': '' }, fixed(p.lead, 2)),
          el('dt', {}, t('rail.tu.c.r', { u: us })), el('dd', {}, fixed(p.R, 0)),
          el('dt', {}, t('rail.tu.c.speed')), el('dd', { 'data-rail-tu-speed': '' }, fixed(p.speed, 0)),
          ...(p.crossover ? [el('dt', {}, t('rail.tu.c.xlen', { u: us })), el('dd', { 'data-rail-tu-xlen': '' }, fixed(p.crossover.length, 2))] : [])) : el('p', { className: 'cv-note' }, t('geo.turnout.fail')),
        el('div', { className: 'cv-actions' }, branch));
    });
    out.push(box);
  }
  out.push(el('div', { className: 'cv-actions' }, el('button', { type: 'button', className: 'btn-line btn-sm-cc', 'data-rail-tu-add': '', disabled: !al.ok, onclick: () => {
    // on the longest straight, a little in from its start; else the middle of the line
    const lines = al.elements.filter((e) => e.type === 'line').sort((p, q) => q.len - p.len), e = lines[0];
    const station = e ? e.sta + Math.min(e.len * 0.25, e.len / 2) : (al.start + al.end) / 2;
    P.change(t('rail.undo.tu.add'), (s) => { s.geo ||= {}; (s.geo.turnouts ||= []).push({ id: P.nextId('g'), name: t('rail.tu.default', { n: list.length + 1 }), n: 9, gauge: (a.rail?.gauge || 1435) / 1000, side: 'L', switchLength: 6.1, switchAngle: 0.0143, alignment: a.id, station: Math.round(station * 100) / 100, spacing: 0, show: 'yes' }); });
    ctx.say(t('rail.tu.added'));
  } }, el('i', { className: 'bi bi-plus-lg', 'aria-hidden': 'true' }), ' ', t('rail.tu.add'))));
  out.push(el('p', { className: 'cv-note', 'data-rail-tu-note': '' }, t('rail.tu.note')));

  // ---- the clearance envelope
  out.push(el('h3', { className: 'cv-h3' }, t('rail.cl.head')));
  const cl = a.rail.clearance || cleanClearance({});
  const setCl = (label, fn) => P.change(label, (s) => { const x = find(s), r = cleanRail({ ...railDefaults(U), ...(x.rail || {}), on: true }, U), c = cleanClearance(r.clearance || {}); fn(c); x.rail = cleanRail({ ...r, clearance: c }, U); });
  const on = el('input', { type: 'checkbox', id: 'cv-rail-cl-on', checked: !!cl.on, 'data-rail-cl-on': '' });
  on.addEventListener('change', () => setCl(t(on.checked ? 'rail.undo.cl.on' : 'rail.undo.cl.off'), (c) => { c.on = on.checked; }));
  out.push(el('label', { className: 'cv-check', for: 'cv-rail-cl-on' }, on, ' ', t('rail.cl.on')));
  if (!cl.on) { out.push(el('p', { className: 'cv-note' }, t('rail.cl.off.note'))); return out; }
  const fld = (label, id, value, unit, lo, hi, apply) => ctx.row(label, el('div', { className: 'cv-row' }, num(value, (v) => { const x = Number(v); if (v === '' || !Number.isFinite(x) || x < lo || x > hi) return false; setCl(t('rail.undo.cl'), (c) => apply(c, x)); }, { id }), el('span', { className: 'cv-unit' }, unit)), id);
  const props = el('div', { className: 'cv-props', 'data-rail-cl': '' },
    ...ctx.row(t('rail.cl.outline'), select('cv-rail-cl-outline', [...Object.keys(OUTLINES).map((k) => [k, t('rail.cl.outline.' + k)]), ['custom', t('rail.cl.outline.custom')]], cl.outline, (v) => setCl(t('rail.undo.cl'), (c) => { if (v === 'custom' && c.points.length < 3) c.points = outlineOf(c).map((p) => ({ ...p })); c.outline = v; }), t('rail.cl.outline')), 'cv-rail-cl-outline'),
    ...fld(t('rail.cl.length'), 'cv-rail-cl-len', fixed(cl.length, 2), 'm', 0, 60, (c, x) => { c.length = x; }),
    ...fld(t('rail.cl.bogie'), 'cv-rail-cl-bogie', fixed(cl.bogie, 2), 'm', 0, 50, (c, x) => { c.bogie = x; }),
    ...ctx.row(t('rail.cl.platform'), select('cv-rail-cl-pf', [['', t('rail.cl.platform.none')], ['L', t('rail.tu.left')], ['R', t('rail.tu.right')]], cl.platform.side, (v) => setCl(t('rail.undo.cl'), (c) => { c.platform.side = v; }), t('rail.cl.platform')), 'cv-rail-cl-pf'),
    ...(cl.platform.side ? [...fld(t('rail.cl.platform.offset'), 'cv-rail-cl-pf-off', fixed(cl.platform.offset, 3), 'm', 0.5, 6, (c, x) => { c.platform.offset = x; }), ...fld(t('rail.cl.platform.height'), 'cv-rail-cl-pf-h', fixed(cl.platform.height, 3), 'm', 0, 2, (c, x) => { c.platform.height = x; })] : []));
  out.push(props);
  if (cl.outline === 'custom') {
    const ta = el('textarea', { className: 'cv-input', id: 'cv-rail-cl-points', rows: 6, 'aria-label': t('rail.cl.points'), spellcheck: false }, cl.points.map((p) => p.o + ' ' + p.z).join('\n'));
    ta.addEventListener('change', () => {
      const pts = ta.value.split(/\n+/).map((ln) => ln.trim().split(/[\s,;]+/).map(Number)).filter((v) => v.length >= 2 && Number.isFinite(v[0]) && Number.isFinite(v[1])).map((v) => ({ o: v[0], z: v[1] }));
      if (pts.length < 3) { ctx.say(t('rail.cl.points.few')); return; }
      setCl(t('rail.undo.cl'), (c) => { c.points = pts; c.outline = 'custom'; });
    });
    out.push(el('label', { className: 'cv-note', for: 'cv-rail-cl-points' }, t('rail.cl.points')), ta);
  }
  out.push(el('p', { className: 'cv-note', 'data-rail-cl-placeholder': '' }, t('rail.cl.note')));
  const res = P.railClearance(a);
  if (res?.rows?.length) {
    const wide = res.rows.reduce((m, r) => (r.one.left + r.one.right > m.one.left + m.one.right ? r : m), res.rows[0]);
    out.push(envelopeSvg(el, res.rows, { units: U, label: t('rail.cl.svg') }));
    out.push(el('dl', { className: 'cv-vol', 'data-rail-cl-result': '' },
      el('dt', {}, t('rail.cl.r.wide')), el('dd', { 'data-rail-cl-wide': '' }, t('rail.cl.r.wide.v', { w: fixed(wide.one.left + wide.one.right, 3), u: us, sta: sta(wide.sta) })),
      el('dt', {}, t('rail.cl.r.top')), el('dd', {}, fixed(Math.max(...res.rows.map((r) => r.top)), 3) + ' ' + us),
      ...(res.spacing ? [el('dt', {}, t('rail.cl.r.spacing')), el('dd', { 'data-rail-cl-spacing': '' }, t('rail.cl.r.spacing.v', { need: fixed(res.spacing.need, 3), have: fixed(res.spacing.have, 3), u: us }))] : []),
      ...(res.platform ? [el('dt', {}, t('rail.cl.r.platform')), el('dd', { 'data-rail-cl-gap': '' }, t(res.platform.gap < 0 ? 'rail.cl.r.platform.hit' : 'rail.cl.r.platform.ok', { gap: fixed(Math.abs(res.platform.gap), 3), u: us, sta: sta(res.platform.sta) }))] : []),
      el('dt', {}, t('rail.cl.r.hits')), el('dd', { 'data-rail-cl-hits': '' }, res.hits.length ? String(res.hits.length) : t('rail.cl.r.hits.none'))));
    if (res.hits.length) out.push(el('ul', { className: 'cv-plainlist', 'data-rail-cl-hitlist': '' }, ...res.hits.map((h) => el('li', {}, t(h.plan ? 'rail.cl.hit.plan' : 'rail.cl.hit.full', { what: h.name || h.id, sta: sta(h.sta), off: fixed(Math.abs(h.off), 2), u: us })))));
    out.push(el('p', { className: 'cv-note' }, t('rail.cl.checks.note')));
  }
  return out;
}

/** The section: the outline on the straight (thin) and at the station where one track's envelope is widest (bold), the rails as ticks. */
export function envelopeSvg(el, rows, { units = 'm', label = '' } = {}) {
  const wide = rows.reduce((m, r) => (r.one.left + r.one.right > m.one.left + m.one.right ? r : m), rows[0]);
  const slim = rows.reduce((m, r) => (r.one.left + r.one.right < m.one.left + m.one.right ? r : m), rows[0]);
  const c0 = wide.centres?.[0] || 0, A = wide.polys[0].map((p) => ({ o: p.o - c0, z: p.z })), B = slim.polys[0].map((p) => ({ o: p.o - (slim.centres?.[0] || 0), z: p.z }));
  const all = [...A, ...B], x0 = Math.min(...all.map((p) => p.o)), x1 = Math.max(...all.map((p) => p.o)), z0 = Math.min(0, ...all.map((p) => p.z)), z1 = Math.max(...all.map((p) => p.z));
  const W = 260, H = 200, pad = 12, sc = Math.min((W - 2 * pad) / Math.max(x1 - x0, 1e-9), (H - 2 * pad) / Math.max(z1 - z0, 1e-9));
  const X = (o) => pad + (o - x0) * sc, Y = (z) => H - pad - (z - z0) * sc, path = (P) => P.map((p, i) => (i ? 'L' : 'M') + X(p.o).toFixed(1) + ' ' + Y(p.z).toFixed(1)).join(' ') + ' Z';
  const svg = document.createElementNS(SVG, 'svg');
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`); svg.setAttribute('class', 'cv-se-diagram'); svg.setAttribute('role', 'img'); svg.setAttribute('aria-label', label); svg.setAttribute('data-rail-cl-svg', ''); svg.style.maxWidth = W + 'px';
  const add = (tag, attrs) => { const n = document.createElementNS(SVG, tag); for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v); svg.append(n); return n; };
  add('line', { x1: X(x0), y1: Y(0), x2: X(x1), y2: Y(0), stroke: 'var(--grid, #d5dde5)', 'stroke-width': 1 });
  add('path', { d: path(B), fill: 'none', stroke: 'var(--ink-2, #5b6672)', 'stroke-width': 1, 'stroke-dasharray': '4 3' });
  add('path', { d: path(A), fill: 'none', stroke: 'var(--layer-orange, #c2570c)', 'stroke-width': 2 });
  void units; void el;
  return svg;
}
