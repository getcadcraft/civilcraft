/* SPDX-License-Identifier: Apache-2.0 */
/**
 * sewer-ui.js — sanitary design flows on a sanitary network (0.6 LC.16 step S1): the settings and results block in the
 * network's Properties, the people and area entering at a structure, a pipe's flows. Numbers from sewer.js (DOM-free,
 * bin/test-civilcraft-sewer.mjs). Every change is one undo step (project.change on state.network). Shown instead of the
 * storm drainage blocks while the network's type is Sanitary.
 *
 *   createSewer(ctx) → { block(), structureRows(x), pipeRows(p), results() }
 *   ctx = { el, project: () => Project, units: () => 'ft'|'m', numInput, row, say, select(sel), refresh() }
 */

import { t } from './i18n.js';
import { cleanSewer, cleanSewLoad, sewerFlows, sizeSewers, flowText } from './sewer.js';
import { fixed } from './units.js';

export function createSewer(ctx) {
  const { el } = ctx;
  const P = () => ctx.project(), U = () => ctx.units(), N = () => P().state.network, M = () => U() === 'm';
  const aU = () => (M() ? 'ha' : 'ac'), vU = () => (M() ? 'm/s' : 'ft/s');
  let memo = null;
  function results() {
    const n = N();
    if (!n || !n.pipes.length) return null;
    if (memo?.project === P() && memo.key === P().version && memo.units === U()) return memo.r;
    const r = sewerFlows(n, U());
    memo = { project: P(), key: P().version, units: U(), r };
    return r;
  }
  const hasLoads = () => (N()?.structures || []).some((s) => cleanSewLoad(s.sew));
  const change = (label, fn) => P().change(label, (st) => { st.network.sewer = cleanSewer(st.network.sewer, st.units); fn(st.network.sewer, st.network); });
  const num = (v, dec, ok, set, id) => ctx.numInput(fixed(v, dec).replace(/,/g, ''), (s) => { const x = Number(s); if (s === '' || !Number.isFinite(x) || !ok(x)) return false; set(x); return true; }, { id, width: '5rem' });
  const unitRow = (label, input, unit, id) => ctx.row(label, el('div', { className: 'cv-row' }, input, el('span', { className: 'cv-unit' }, unit)), id);

  function block() {
    const n = N(), out = [el('h3', { className: 'cv-h3', 'data-san-head': '' }, t('san.head'))];
    if (!n) return out;
    const s = cleanSewer(n.sewer, U());
    const set = (k, label) => (x) => change(label || t('san.undo.set'), (sw) => { sw[k] = x; });
    const peak = el('select', { className: 'cv-select', id: 'cv-san-peak' }, el('option', { value: 'harmon' }, t('san.peak.harmon')), el('option', { value: 'babbitt' }, t('san.peak.babbitt')));
    peak.value = s.peak;
    peak.addEventListener('change', () => change(t('san.undo.set'), (sw) => { sw.peak = peak.value; }));
    out.push(el('p', { className: 'cv-note' }, t('san.lead')));
    out.push(el('div', { className: 'cv-props', 'data-san-settings': '' },
      ...unitRow(t('san.percap'), num(s.perCap, 1, (x) => x >= 0, set('perCap'), 'cv-san-percap'), M() ? t('san.u.lcd') : t('san.u.gcd'), 'cv-san-percap'),
      ...unitRow(t('san.infil'), num(s.infil, M() ? 3 : 1, (x) => x >= 0, set('infil'), 'cv-san-infil'), M() ? t('san.u.lsha') : t('san.u.gpdac'), 'cv-san-infil'),
      ...ctx.row(t('san.peak'), peak, 'cv-san-peak'),
      ...ctx.row(t('san.pfmin'), num(s.pfMin, 2, (x) => x > 0 && x < 100, set('pfMin'), 'cv-san-pfmin'), 'cv-san-pfmin'),
      ...ctx.row(t('san.pfmax'), num(s.pfMax, 2, (x) => x > 0 && x < 100, set('pfMax'), 'cv-san-pfmax'), 'cv-san-pfmax'),
      ...ctx.row(t('dr.n'), num(s.n, 3, (x) => x > 0 && x < 1, set('n'), 'cv-san-n'), 'cv-san-n'),
      ...unitRow(t('san.vmin'), num(s.vMin, 2, (x) => x >= 0 && x < 100, set('vMin'), 'cv-san-vmin'), vU(), 'cv-san-vmin'),
      ...unitRow(t('san.vmax'), num(s.vMax, 2, (x) => x > 0 && x < 100, set('vMax'), 'cv-san-vmax'), vU(), 'cv-san-vmax'),
      ...unitRow(t('san.maxfull'), num(s.maxFull * 100, 0, (x) => x > 0 && x <= 100, (x) => change(t('san.undo.set'), (sw) => { sw.maxFull = x / 100; }), 'cv-san-maxfull'), '%', 'cv-san-maxfull')));
    out.push(el('p', { className: 'cv-note' }, t('san.note')));
    const r = results();
    if (!r || !hasLoads()) { out.push(el('p', { className: 'cv-note', 'data-san-none': '' }, t('san.none'))); return out; }
    out.push(el('h3', { className: 'cv-h3' }, t('san.results')));
    out.push(el('div', { className: 'cv-table-wrap' }, el('table', { className: 'cv-table', 'data-san-results': '' },
      el('thead', {}, el('tr', {}, ...[t('dr.r.pipe'), t('san.r.pop'), t('san.r.pf'), t('san.r.q'), t('san.r.full'), t('san.r.v', { u: vU() })].map((x) => el('th', { scope: 'col' }, x)))),
      el('tbody', {}, ...n.pipes.map((p) => {
        const f = r.pipes.get(p.id), bad = r.problems.some((q) => q.id === p.id);
        return el('tr', { className: bad ? 'is-warn' : '' },
          el('td', {}, el('button', { type: 'button', className: 'cv-linkbtn', onclick: () => ctx.select({ kind: 'pipe', id: p.id }) }, p.name)),
          el('td', { className: 'num' }, f ? Math.round(f.P).toLocaleString('en-US') : '—'), el('td', { className: 'num' }, f ? fixed(f.pf, 2) : '—'),
          el('td', { className: 'num' }, f ? flowText(f.Q, U()) : '—'), el('td', { className: 'num' }, f?.ratio !== null && f ? fixed(f.ratio * 100, 0) + '%' : '—'),
          el('td', { className: 'num' }, f?.V !== null && f ? fixed(f.V, 2) : '—'));
      })))));
    if (r.problems.length) out.push(el('div', { className: 'cv-report is-error', 'data-san-problems': '' }, el('ul', {}, ...r.problems.slice(0, 40).map((q) => el('li', {}, q.id ? el('button', { type: 'button', className: 'cv-linkbtn', onclick: () => ctx.select({ kind: 'pipe', id: q.id }) }, q.msg) : q.msg)))));
    else out.push(el('p', { className: 'cv-note', 'data-san-ok': '' }, t('san.ok')));
    out.push(el('div', { className: 'cv-actions' }, el('button', { type: 'button', className: 'btn-line btn-sm-cc', 'data-san-size': '', onclick: sizeAll }, t('dr.size'))));
    out.push(el('p', { className: 'cv-note' }, t('san.size.note')));
    return out;
  }
  function sizeAll() {
    const r = results();
    if (!r) return;
    const sz = sizeSewers(N(), r, U());
    const changed = sz.filter((x) => x.ok && x.dia !== N().pipes.find((p) => p.id === x.id).dia);
    const bad = sz.filter((x) => !x.ok).length;
    if (!changed.length) { ctx.say(t('dr.size.same') + (bad ? ' ' + t('dr.size.bad', { n: bad }) : '')); return; }
    P().change(t('dr.undo.size'), (st) => { for (const x of changed) st.network.pipes.find((p) => p.id === x.id).dia = x.dia; });
    ctx.say(t('dr.size.done', { n: changed.length }) + (bad ? ' ' + t('dr.size.bad', { n: bad }) : ''));
    ctx.refresh();
  }

  /** A structure: the people and area that enter there (each one undo step) and what passes through. */
  function structureRows(x) {
    const l = cleanSewLoad(x.sew) || { pop: 0, area: 0 };
    const setLoad = (k, label) => (v) => P().change(label, (st) => { const s = st.network.structures.find((q) => q.id === x.id); const nl = cleanSewLoad({ ...(s.sew || {}), [k]: v }); if (nl) s.sew = nl; else delete s.sew; });
    const pop = num(l.pop, 0, (v) => v >= 0 && v < 1e9, setLoad('pop', t('san.undo.pop')), 'cv-san-pop');
    const area = num(l.area, 2, (v) => v >= 0 && v < 1e9, setLoad('area', t('san.undo.area')), 'cv-san-area');
    const rows = [...ctx.row(t('san.s.pop'), pop, 'cv-san-pop'), ...unitRow(t('san.s.area'), area, aU(), 'cv-san-area')];
    const r = results(), f = r?.structs.get(x.id);
    if (f && hasLoads()) rows.push(...ctx.row(t('san.s.total'), t('san.s.total.v', { pop: Math.round(f.P).toLocaleString('en-US'), area: fixed(f.area, 2), u: aU() })));
    return [el('h3', { className: 'cv-h3' }, t('san.head')), el('div', { className: 'cv-props', 'data-san-struct': '' }, ...rows), el('p', { className: 'cv-note' }, t('san.s.note'))];
  }
  function pipeRows(p) {
    const r = results(), f = r?.pipes.get(p.id);
    if (!f || !hasLoads()) return [];
    const rows = [
      ...ctx.row(t('san.p.pop'), t('san.s.total.v', { pop: Math.round(f.P).toLocaleString('en-US'), area: fixed(f.area, 2), u: aU() })),
      ...ctx.row(t('san.r.pf'), fixed(f.pf, 2)),
      ...ctx.row(t('san.p.dom'), flowText(f.qDom, U())), ...ctx.row(t('san.p.inf'), flowText(f.qInf, U())), ...ctx.row(t('san.r.q'), flowText(f.Q, U())),
      ...ctx.row(t('dr.p.cap'), flowText(f.cap, U()) + (f.ratio !== null ? ' — ' + t('san.p.pct', { pct: fixed(f.ratio * 100, 0) }) : '')),
      ...ctx.row(t('san.p.vfull'), fixed(f.vFull, 2) + ' ' + vU()),
      ...ctx.row(t('dr.p.depth'), f.yn === null ? '—' : fixed(f.yn, 3) + ' ' + (M() ? 'm' : 'ft')), ...ctx.row(t('san.r.v', { u: vU() }), f.V === null ? '—' : fixed(f.V, 2)),
    ];
    const probs = r.problems.filter((q) => q.id === p.id);
    return [el('h3', { className: 'cv-h3' }, t('san.head')), el('div', { className: 'cv-props', 'data-san-pipe': '' }, ...rows),
      ...(probs.length ? [el('div', { className: 'cv-report is-error' }, el('ul', {}, ...probs.map((q) => el('li', {}, q.msg))))] : [])];
  }
  return { block, structureRows, pipeRows, results };
}
