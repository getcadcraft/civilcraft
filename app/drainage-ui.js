/* SPDX-License-Identifier: Apache-2.0 */
/**
 * drainage-ui.js — storm drainage on the pipe network (0.4 V19 + V20): catchments drawn on the plan, the rational method
 * summed downstream, pipe sizing by Manning, and the hydraulic and energy grade lines with surcharge and flooding flagged.
 * The numbers come from hydro.js (DOM-free, bin/test-civilcraft-hydro.mjs); this file is the Properties blocks, the
 * catchment tool's finish, picking and the plan overlay. Every change is one undo step (project.change on state.network).
 *
 *   createDrainage(ctx) → { block(), structureRows(x), pipeRows(p), props(c), finish(pts), pick(w), overlay(c2d, S, C, sel),
 *                           remove(id), results() }
 *   ctx = { el, project: () => Project, units: () => 'ft'|'m', numInput, row, say, select(sel), refresh(), tool(name) }
 */

import { t } from './i18n.js';
import { HYDRO_DEFAULTS, cleanHydro, catchmentArea, rationalFlows, sizePipes, hydraulicGrade } from './hydro.js';
import { DIA_UNIT } from './pipes.js';
import { fixed } from './units.js';

export function createDrainage(ctx) {
  const { el } = ctx;
  const P = () => ctx.project(), U = () => ctx.units(), N = () => P().state.network;
  const qU = () => (U() === 'm' ? 'm³/s' : 'cfs'), aU = () => (U() === 'm' ? 'ha' : 'ac'), iU = () => (U() === 'm' ? 'mm/h' : 'in/h'), lU = () => (U() === 'm' ? 'm' : 'ft');
  const diaName = () => DIA_UNIT[U() === 'm' ? 'm' : 'ft'].name;
  let memo = null;
  /** Flows and grade lines for the current network (cached on the project's undo depth + network object). */
  function results() {
    const n = N();
    if (!n || !n.pipes.length) return null;
    const key = P().version;   // edits change the state in place: the project's version says when to work it out again
    if (memo?.project === P() && memo.key === key && memo.units === U()) return memo.r;
    const flows = rationalFlows(n, U());
    const grade = hydraulicGrade(n, flows, U(), P().pipeSurface());
    const r = { flows, grade, problems: [...flows.problems, ...grade.problems] };
    memo = { project: P(), key, units: U(), r };
    return r;
  }
  const change = (label, fn) => P().change(label, (st) => { if (!st.network.hydro) st.network.hydro = cleanHydro(null, st.units); fn(st.network, st); });
  const hasCatch = () => (N()?.catchments || []).length > 0;

  function block() {
    const n = N(), out = [el('h3', { className: 'cv-h3', 'data-dr-head': '' }, t('dr.head'))];
    if (!n) return out;
    const h = cleanHydro(n.hydro, U());
    out.push(el('p', { className: 'cv-note' }, t('dr.idf.lead')));
    const num = (v, dec, set, opts) => ctx.numInput(fixed(v, dec).replace(/,/g, ''), (s) => { const x = Number(s); if (s === '' || !Number.isFinite(x)) return false; const ok = set(x); return ok === false ? false : true; }, opts);
    const idf = (k) => num(h.idf[k], k === 'c' ? 3 : 2, (x) => { if (!(x > 0) && !(k === 'b' && x === 0)) return false; change(t('dr.undo.idf'), (nw) => { nw.hydro.idf[k] = x; }); }, { id: 'cv-dr-idf-' + k, width: '5rem' });
    const nIn = num(h.n, 3, (x) => { if (!(x > 0 && x < 1)) return false; change(t('dr.undo.n'), (nw) => { nw.hydro.n = x; }); }, { id: 'cv-dr-n', width: '5rem' });
    const kj = num(h.kj, 2, (x) => { if (!(x >= 0 && x <= 10)) return false; change(t('dr.undo.kj'), (nw) => { nw.hydro.kj = x; }); }, { id: 'cv-dr-kj', width: '5rem' });
    const tcMin = num(h.minTc, 1, (x) => { if (!(x > 0)) return false; change(t('dr.undo.tc'), (nw) => { nw.hydro.minTc = x; }); }, { id: 'cv-dr-mintc', width: '5rem' });
    const tw = ctx.numInput(h.tailwater === null ? '' : fixed(h.tailwater, 2).replace(/,/g, ''), (s) => { const v = String(s).trim(); const x = v === '' ? null : Number(v); if (x !== null && !Number.isFinite(x)) return false; change(t('dr.undo.tw'), (nw) => { nw.hydro.tailwater = x; }); return true; }, { id: 'cv-dr-tw', text: true, width: '6rem' });
    tw.placeholder = t('dr.tw.none');
    out.push(el('div', { className: 'cv-props', 'data-dr-settings': '' },
      ...ctx.row(t('dr.idf.a'), idf('a'), 'cv-dr-idf-a'),
      ...ctx.row(t('dr.idf.b'), el('div', { className: 'cv-row' }, idf('b'), el('span', { className: 'cv-unit' }, 'min')), 'cv-dr-idf-b'),
      ...ctx.row(t('dr.idf.c'), idf('c'), 'cv-dr-idf-c'),
      ...ctx.row(t('dr.mintc'), el('div', { className: 'cv-row' }, tcMin, el('span', { className: 'cv-unit' }, 'min')), 'cv-dr-mintc'),
      ...ctx.row(t('dr.n'), nIn, 'cv-dr-n'),
      ...ctx.row(t('dr.kj'), kj, 'cv-dr-kj'),
      ...ctx.row(t('dr.tw'), el('div', { className: 'cv-row' }, tw, el('span', { className: 'cv-unit' }, lU())), 'cv-dr-tw')));
    out.push(el('p', { className: 'cv-note' }, t('dr.idf.formula')), el('p', { className: 'cv-note' }, t('dr.note', { i: iU(), q: qU(), a: aU() })));
    // catchments
    const cs = n.catchments || [];
    out.push(el('div', { className: 'cv-actions' }, el('button', { type: 'button', className: 'btn-line btn-sm-cc', 'data-dr-draw': '', onclick: () => ctx.tool('catchment') }, el('i', { className: 'bi bi-bounding-box-circles', 'aria-hidden': 'true' }), ' ', t('dr.draw'))));
    if (cs.length) {
      out.push(el('div', { className: 'cv-table-wrap' }, el('table', { className: 'cv-table', 'data-dr-catchments': '' },
        el('thead', {}, el('tr', {}, ...[t('dr.c.name'), t('dr.c.area', { u: aU() }), 'C', t('dr.c.tc'), t('dr.c.to')].map((x) => el('th', { scope: 'col' }, x)))),
        el('tbody', {}, ...cs.map((c) => el('tr', {},
          el('td', {}, el('button', { type: 'button', className: 'cv-linkbtn', onclick: () => ctx.select({ kind: 'catchment', id: c.id }) }, c.name)),
          el('td', { className: 'num' }, fixed(catchmentArea(c.pts, U()), 2)), el('td', { className: 'num' }, fixed(c.C, 2)), el('td', { className: 'num' }, fixed(c.tc, 1)),
          el('td', {}, n.structures.find((s) => s.id === c.to)?.name || '—')))))));
    } else out.push(el('p', { className: 'cv-note' }, t('dr.none')));
    // results
    const r = results();
    if (r && hasCatch()) {
      out.push(el('h3', { className: 'cv-h3' }, t('dr.results')));
      out.push(el('div', { className: 'cv-table-wrap' }, el('table', { className: 'cv-table', 'data-dr-results': '' },
        el('thead', {}, el('tr', {}, ...[t('dr.r.pipe'), t('dr.r.q', { u: qU() }), t('dr.r.cap', { u: qU() }), t('dr.r.v', { u: lU() }), t('dr.r.hgl'), t('dr.r.state')].map((x) => el('th', { scope: 'col' }, x)))),
        el('tbody', {}, ...n.pipes.map((p) => {
          const f = r.flows.pipes.get(p.id), g = r.grade.pipes.get(p.id);
          return el('tr', { className: g?.full ? 'is-warn' : '' },
            el('td', {}, el('button', { type: 'button', className: 'cv-linkbtn', onclick: () => ctx.select({ kind: 'pipe', id: p.id }) }, p.name)),
            el('td', { className: 'num' }, f ? fixed(f.Q, 2) : '—'), el('td', { className: 'num' }, f && g ? fixed(capOf(p, f), 2) : '—'),
            el('td', { className: 'num' }, g ? fixed(g.V, 2) : '—'), el('td', { className: 'num' }, g ? fixed(g.hglUp, 2) + ' – ' + fixed(g.hglDn, 2) : '—'),
            el('td', {}, !g ? '—' : g.full ? t('dr.r.full') : t('dr.r.part', { pct: fixed((g.yn / dia(p)) * 100, 0) })));
        })))));
      if (r.problems.length) out.push(el('div', { className: 'cv-report is-error', 'data-dr-problems': '' }, el('ul', {}, ...r.problems.slice(0, 40).map((q) => el('li', {}, q.id && q.kind !== 'network' ? el('button', { type: 'button', className: 'cv-linkbtn', onclick: () => ctx.select({ kind: q.kind, id: q.id }) }, q.msg) : q.msg)))));
      else out.push(el('p', { className: 'cv-note', 'data-dr-ok': '' }, t('dr.ok')));
      out.push(el('div', { className: 'cv-actions' }, el('button', { type: 'button', className: 'btn-line btn-sm-cc', 'data-dr-size': '', onclick: sizeAll }, t('dr.size'))));
      out.push(el('p', { className: 'cv-note' }, t('dr.size.note')));
    }
    return out;
  }
  const dia = (p) => (Number(p.dia) || 0) / DIA_UNIT[U() === 'm' ? 'm' : 'ft'].perUnit;
  function capOf(p, f) {
    const h = cleanHydro(N().hydro, U()), D = dia(p), A = (Math.PI * D * D) / 4;
    return f.S > 0 ? ((U() === 'm' ? 1 : 1.486) / h.n) * A * Math.pow(D / 4, 2 / 3) * Math.sqrt(f.S) : 0;
  }
  function sizeAll() {
    const r = results();
    if (!r) return;
    const sz = sizePipes(N(), r.flows, U());
    const changed = sz.filter((x) => x.dia !== N().pipes.find((p) => p.id === x.id).dia);
    if (!changed.length) { ctx.say(t('dr.size.same')); return; }
    P().change(t('dr.undo.size'), (st) => { for (const x of changed) st.network.pipes.find((p) => p.id === x.id).dia = x.dia; });
    const bad = sz.filter((x) => !x.ok);
    ctx.say(t('dr.size.done', { n: changed.length }) + (bad.length ? ' ' + t('dr.size.bad', { n: bad.length }) : ''));
    ctx.refresh();
  }

  function structureRows(x) {
    const r = results();
    if (!r || !hasCatch()) return [];
    const f = r.flows.structs.get(x.id), g = r.grade.structs.get(x.id);
    const rows = [];
    if (f) rows.push(...ctx.row(t('dr.s.ca'), fixed(f.CA, 3) + ' ' + aU()), ...ctx.row(t('dr.s.tc'), fixed(f.tc, 1) + ' min'));
    if (g) rows.push(...ctx.row(t('dr.s.hgl'), fixed(g.hgl, 2)), ...ctx.row(t('dr.s.egl'), fixed(g.egl, 2)), ...ctx.row(t('dr.s.free'), Number.isFinite(g.rim) ? fixed(g.rim - g.hgl, 2) + ' ' + lU() : '—'));
    return rows.length ? [el('h3', { className: 'cv-h3' }, t('dr.head')), el('div', { className: 'cv-props', 'data-dr-struct': '' }, ...rows)] : [];
  }
  function pipeRows(p) {
    const r = results();
    if (!r || !hasCatch()) return [];
    const f = r.flows.pipes.get(p.id), g = r.grade.pipes.get(p.id);
    if (!f) return [];
    const rows = [...ctx.row(t('dr.p.q'), fixed(f.Q, 3) + ' ' + qU() + ' (C·A ' + fixed(f.CA, 3) + ', i ' + fixed(f.i, 2) + ' ' + iU() + ', tc ' + fixed(f.tc, 1) + ' min)'),
      ...ctx.row(t('dr.p.cap'), fixed(capOf(p, f), 3) + ' ' + qU())];
    if (g) rows.push(...ctx.row(t('dr.p.depth'), g.full ? t('dr.r.full') : fixed(g.yn, 2) + ' ' + lU()), ...ctx.row(t('dr.p.v'), fixed(g.V, 2) + ' ' + lU() + '/s'),
      ...ctx.row(t('dr.p.hgl'), fixed(g.hglUp, 2) + ' – ' + fixed(g.hglDn, 2)), ...ctx.row(t('dr.p.egl'), fixed(g.eglUp, 2) + ' – ' + fixed(g.eglDn, 2)));
    const probs = r.problems.filter((q) => q.id === p.id);
    return [el('h3', { className: 'cv-h3' }, t('dr.head')), el('div', { className: 'cv-props', 'data-dr-pipe': '' }, ...rows),
      ...(probs.length ? [el('div', { className: 'cv-report is-error' }, el('ul', {}, ...probs.map((q) => el('li', {}, q.msg))))] : [])];
  }

  const findC = (id) => (N()?.catchments || []).find((c) => c.id === id);
  function props(c) {
    const n = N(), out = [];
    const nm = el('input', { type: 'text', className: 'cv-input', id: 'cv-dr-name', value: c.name, maxLength: 120 });
    nm.addEventListener('change', () => P().change(t('dr.undo.rename'), (st) => { st.network.catchments.find((x) => x.id === c.id).name = nm.value.trim().slice(0, 120) || t('dr.c.default'); }));
    const C = ctx.numInput(fixed(c.C, 2), (s) => { const x = Number(s); if (s === '' || !(x >= 0 && x <= 1)) return false; P().change(t('dr.undo.c'), (st) => { st.network.catchments.find((q) => q.id === c.id).C = x; }); return true; }, { id: 'cv-dr-c', width: '5rem' });
    const tc = ctx.numInput(fixed(c.tc, 1), (s) => { const x = Number(s); if (s === '' || !(x > 0 && x < 1000)) return false; P().change(t('dr.undo.ctc'), (st) => { st.network.catchments.find((q) => q.id === c.id).tc = x; }); return true; }, { id: 'cv-dr-tc', width: '5rem' });
    const to = el('select', { className: 'cv-select', id: 'cv-dr-to' }, el('option', { value: '' }, t('dr.c.to.none')), ...n.structures.map((s) => el('option', { value: s.id }, s.name)));
    to.value = c.to || '';
    to.addEventListener('change', () => P().change(t('dr.undo.to'), (st) => { st.network.catchments.find((q) => q.id === c.id).to = to.value || null; }));
    out.push(el('div', { className: 'cv-props', 'data-dr-catchment': '' },
      ...ctx.row(t('dr.c.name'), nm, 'cv-dr-name'),
      ...ctx.row(t('dr.c.coef'), C, 'cv-dr-c'),
      ...ctx.row(t('dr.c.tc'), el('div', { className: 'cv-row' }, tc, el('span', { className: 'cv-unit' }, 'min')), 'cv-dr-tc'),
      ...ctx.row(t('dr.c.to'), to, 'cv-dr-to'),
      ...ctx.row(t('dr.c.area', { u: aU() }), fixed(catchmentArea(c.pts, U()), 3)),
      ...ctx.row(t('dr.c.corners'), String(c.pts.length))));
    out.push(el('p', { className: 'cv-note' }, t('dr.c.note')));
    out.push(el('div', { className: 'cv-actions' }, el('button', { type: 'button', className: 'btn-line btn-sm-cc', 'data-dr-draw': '', onclick: () => ctx.tool('catchment') }, el('i', { className: 'bi bi-bounding-box-circles', 'aria-hidden': 'true' }), ' ', t('dr.draw.more'))));
    return out;
  }

  function finish(pts) {
    if (pts.length < 3) { ctx.say(t('dr.c.few')); return false; }
    const n = N();
    if (!n?.structures.length) { ctx.say(t('dr.c.nonet')); return true; }
    const cx = pts.reduce((m, p) => m + p.x, 0) / pts.length, cy = pts.reduce((m, p) => m + p.y, 0) / pts.length;
    // the outlet: a structure inside the outline (the lowest-numbered), else the nearest to its middle
    const inside = n.structures.filter((s) => inPoly(s.x, s.y, pts));
    const to = (inside[0] || n.structures.reduce((a, b) => (Math.hypot(b.x - cx, b.y - cy) < Math.hypot(a.x - cx, a.y - cy) ? b : a))).id;
    const id = P().nextId('k'), k = (n.catchments || []).length + 1;
    const name = t('dr.c.default') + ' ' + k;
    P().change(t('dr.undo.draw'), (st) => { if (!st.network.catchments) st.network.catchments = []; st.network.catchments.push({ id, name, pts: pts.map((p) => ({ x: p.x, y: p.y })), C: 0.5, tc: HYDRO_DEFAULTS(st.units).minTc, to }); });
    ctx.select({ kind: 'catchment', id });
    ctx.say(t('dr.c.drawn', { name, a: fixed(catchmentArea(pts, U()), 2) + ' ' + aU(), to: n.structures.find((s) => s.id === to).name }));
    return true;
  }
  function pick(w) {
    for (const c of (N()?.catchments || []).slice().reverse()) if (inPoly(w.x, w.y, c.pts)) return { kind: 'catchment', id: c.id };
    return null;
  }
  function remove(id) {
    const c = findC(id);
    if (!c) return false;
    P().change(t('dr.undo.delete'), (st) => { st.network.catchments = st.network.catchments.filter((x) => x.id !== id); });
    ctx.say(t('dr.c.deleted', { name: c.name }));
    return true;
  }
  /** Catchments (dashed outline, light fill, name and C), the selected one heavier; an arrow from each to its outlet;
   *  structures where the HGL is above the rim get a ring. */
  function overlay(c2d, S, C, sel) {
    const n = N();
    if (!n) return;
    c2d.save();
    c2d.font = '600 12px Helvetica, Arial, sans-serif'; c2d.textAlign = 'center'; c2d.textBaseline = 'middle';
    for (const c of n.catchments || []) {
      const on = sel?.kind === 'catchment' && sel.id === c.id;
      c2d.beginPath(); c.pts.forEach((p, i) => { const q = S(p.x, p.y); i ? c2d.lineTo(q.x, q.y) : c2d.moveTo(q.x, q.y); }); c2d.closePath();
      c2d.globalAlpha = on ? 0.16 : 0.08; c2d.fillStyle = C.cyan || C.blue; c2d.fill(); c2d.globalAlpha = 1;
      c2d.strokeStyle = on ? C.action : C.cyan || C.blue; c2d.lineWidth = on ? 2.5 : 1.5; c2d.setLineDash(on ? [] : [8, 5]); c2d.stroke(); c2d.setLineDash([]);
      const cx = c.pts.reduce((m, p) => m + p.x, 0) / c.pts.length, cy = c.pts.reduce((m, p) => m + p.y, 0) / c.pts.length, q = S(cx, cy);
      const top = c.pts.reduce((m, p) => Math.min(m, S(p.x, p.y).y), Infinity), lq = { x: q.x, y: Math.min(q.y, top + 14) };   // the name near the top, clear of the pipes
      const s = n.structures.find((x) => x.id === c.to);
      if (s) { const r = S(s.x, s.y); c2d.strokeStyle = C.cyan || C.blue; c2d.lineWidth = 1; c2d.setLineDash([3, 3]); c2d.beginPath(); c2d.moveTo(q.x, q.y); c2d.lineTo(r.x, r.y); c2d.stroke(); c2d.setLineDash([]); }
      c2d.fillStyle = C.ink; c2d.fillText(c.name + '  C ' + fixed(c.C, 2), lq.x, lq.y);
    }
    const r = hasCatch() ? results() : null;
    if (r) for (const [id, g] of r.grade.structs) {
      if (!(Number.isFinite(g.rim) && g.hgl > g.rim)) continue;
      const s = n.structures.find((x) => x.id === id), q = S(s.x, s.y);
      c2d.strokeStyle = C.red; c2d.lineWidth = 2.5; c2d.beginPath(); c2d.arc(q.x, q.y, 15, 0, Math.PI * 2); c2d.stroke();
    }
    c2d.restore();
  }
  return { block, structureRows, pipeRows, props, finish, pick, overlay, remove, results, find: findC };
}

function inPoly(x, y, pts) {
  let inside = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const a = pts[i], b = pts[j];
    if ((a.y > y) !== (b.y > y) && x < ((b.x - a.x) * (y - a.y)) / (b.y - a.y) + a.x) inside = !inside;
  }
  return inside;
}
