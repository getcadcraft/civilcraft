/* SPDX-License-Identifier: Apache-2.0 */
/**
 * river-struct-ui.js — the parts of a river's Properties and Results that river-ui.js hands over (0.8 SU.957 rest, civil_PART_3):
 *   structuresBlock(ctx)  the Culverts and bridges list (Add culvert / Add bridge, every number editable, remove), one undo step each
 *   joinBlock(ctx)        the Junction part of a river's Properties: "Flows into" another river (0.8 SU.957, civil_PART_4)
 *   junctionTable(p, ctx) where rivers join: flows added, the water surface at the junction (equal-water-surface method)
 *   structuresTable(p, ctx)  the structures a solved profile passed (headwater, control, flows, flags) for the Results dialog
 *   openUnsteady(ctx)     the Unsteady flow… dialog: a flood hydrograph typed as hours and flows, the downstream slope, the length of
 *                         the run → the peak at every section, a plot of the flow at both ends, the volume check, a CSV
 * The numbers are river-structures.js and river-unsteady.js (bin/test-civilcraft-river3.mjs). Every result says it needs an
 * engineer's review. Units are the river's ('m' or 'ft'); time is typed in hours and run in seconds.
 *
 *   structuresBlock({ r, id, el, t, edit, numCell, row, units, ordered }) → [nodes]
 *   structuresTable(profile, { el, t, units }) → node | null
 *   openUnsteady({ el, root, t, say, model, download, stem }) → void
 */

import { STRUCT_DEFAULTS, networkOf, solveNetwork } from './river-structures.js';
import { unsteady } from './river-unsteady.js';

const fx = (v, d) => (Number.isFinite(v) ? v.toFixed(d) : '');
const MAX_STRUCTS = 50;

/** A gap between two sections free for a new structure: every stretch keeps at least two sections (the middle first, then outward). */
function freeGap(sections, structures) {
  const s = sections.slice().sort((x, y) => x.rs - y.rs), n = s.length;
  const used = structures.map((st) => { let g = -1; for (let i = 0; i + 1 < n; i++) if (s[i].rs < st.rs && st.rs < s[i + 1].rs) g = i; return g; });
  const mid = Math.floor((n - 1) / 2), order = [];
  for (let d = 0; d < n; d++) { order.push(mid + d); if (d) order.push(mid - d); }
  const i = order.find((k) => k >= 1 && k <= n - 3 && used.every((u) => u < 0 || Math.abs(k - u) >= 2));
  return i === undefined ? null : { lo: s[i], hi: s[i + 1] };
}
const bed = (sec) => Math.min(...sec.pts.map((p) => p.z));
const top = (sec) => Math.min(sec.pts[0].z, sec.pts[sec.pts.length - 1].z);

export function structuresBlock({ r, id, el, t, edit, numCell, row, units, ordered }) {
  const U = units === 'ft' ? 'ft' : 'm', d = STRUCT_DEFAULTS(U), list = r.structures || [];
  const out = [el('h3', { className: 'cv-h3', 'data-river-struct-head': '' }, t('river.st.head')), el('p', { className: 'cv-note' }, t('river.st.note'))];
  const set = (sid, fn) => edit(id, t('river.st.undo.set'), (q) => { const s = (q.structures || []).find((x) => x.id === sid); if (s) fn(s); });
  const field = (s, key, label, opts = {}) => row(label, numCell(Number.isFinite(s[key]) ? s[key] : null, (n) => {
    if (!(opts.min === undefined ? n > 0 : n >= opts.min)) return false;
    set(s.id, (x) => { x[key] = opts.int ? Math.round(n) : n; });
  }, label, `cv-rv-st-${key}-${s.id}`, '5.5rem'), `cv-rv-st-${key}-${s.id}`);   // i18n-ignore: element ids
  for (const s of list) {
    const lbl = (k, extra) => t('river.st.f.' + k.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase()), { u: U, ...extra });
    const common = [...field(s, 'rs', lbl('rs'), { min: -1e9 })];
    const nameIn = el('input', { type: 'text', className: 'cv-input', id: 'cv-rv-st-name-' + s.id, value: s.name || '', maxLength: 80, style: 'width:9rem' });   // i18n-ignore: element ids
    nameIn.addEventListener('change', () => set(s.id, (x) => { x.name = nameIn.value.slice(0, 80); }));
    let rows;
    if (s.kind === 'culvert') {
      const shape = el('select', { className: 'cv-select', id: 'cv-rv-st-shape-' + s.id }, el('option', { value: 'box' }, t('river.st.shape.box')), el('option', { value: 'circle' }, t('river.st.shape.circle')));   // i18n-ignore: element ids
      shape.value = s.shape;
      const roadOn = el('input', { type: 'checkbox', id: 'cv-rv-st-road-' + s.id, checked: Number.isFinite(s.roadCrest) });   // i18n-ignore: element ids
      roadOn.addEventListener('change', () => set(s.id, (x) => { x.roadCrest = roadOn.checked ? Number((x.invUp + x.rise + 0.3).toFixed(3)) : null; }));
      shape.addEventListener('change', () => set(s.id, (x) => { x.shape = shape.value; if (x.shape === 'circle') x.span = x.rise; }));
      rows = [...common, ...row(t('river.st.f.shape'), shape, shape.id), ...field(s, 'rise', lbl('rise')), ...(s.shape === 'box' ? field(s, 'span', lbl('span')) : []),
        ...field(s, 'barrels', lbl('barrels'), { int: true }), ...field(s, 'length', lbl('length')), ...field(s, 'invUp', lbl('invUp'), { min: -1e9 }), ...field(s, 'invDown', lbl('invDown'), { min: -1e9 }),
        ...field(s, 'n', lbl('n')), ...field(s, 'ke', lbl('ke'), { min: 0 }), ...row(t('river.st.f.road'), roadOn, roadOn.id), ...(Number.isFinite(s.roadCrest) ? [...field(s, 'roadCrest', lbl('roadCrest'), { min: -1e9 }), ...field(s, 'roadLength', lbl('roadLength'))] : [])];
    } else {
      const piers = el('input', { type: 'text', className: 'cv-input', id: 'cv-rv-st-piers-' + s.id, value: (s.piers || []).map((p) => `${fx(p.o, 2)}:${fx(p.w, 2)}`).join('; '), style: 'width:11rem', 'aria-describedby': 'cv-rv-st-piers-hint' });   // i18n-ignore: element ids
      piers.addEventListener('change', () => set(s.id, (x) => {
        x.piers = piers.value.split(/[;,]\s*/).map((v) => v.split(':').map(Number)).filter((v) => v.length === 2 && Number.isFinite(v[0]) && v[1] > 0).map(([o, w]) => ({ o, w })).slice(0, 30);
      }));
      rows = [...common, ...field(s, 'abutL', lbl('abutL'), { min: -1e9 }), ...field(s, 'abutR', lbl('abutR'), { min: -1e9 }), ...field(s, 'lowChord', lbl('lowChord'), { min: -1e9 }), ...field(s, 'deckTop', lbl('deckTop'), { min: -1e9 }),
        ...row(t('river.st.f.piers', { u: U }), piers, piers.id), ...field(s, 'cd', lbl('cd'))];
    }
    out.push(el('div', { className: 'cv-props', 'data-river-struct': s.id },
      el('h4', { className: 'cv-h4' }, t('river.st.kind.' + s.kind), ' ', fx(s.rs, 1)),
      ...row(t('river.st.f.name'), nameIn, nameIn.id),
      ...rows,
      el('div', { className: 'cv-actions' }, el('button', { type: 'button', className: 'cv-linkbtn', 'data-river-struct-del': s.id, 'aria-label': t('river.st.remove', { name: s.name || t('river.st.kind.' + s.kind) }),
        onclick: () => edit(id, t('river.st.undo.del'), (q) => { q.structures = (q.structures || []).filter((x) => x.id !== s.id); if (!q.structures.length) delete q.structures; }) }, el('i', { className: 'bi bi-x-lg', 'aria-hidden': 'true' }), ' ', t('river.st.remove.label')))));
  }
  if (list.some((s) => s.kind === 'bridge')) out.push(el('p', { className: 'cv-note', id: 'cv-rv-st-piers-hint' }, t('river.st.piers.hint', { u: U })));
  const add = (kind) => () => edit(id, t('river.st.undo.add'), (q) => {
    const pair = freeGap(q.sections, q.structures || []);
    if (!pair) return;
    const rs = (pair.lo.rs + pair.hi.rs) / 2, f = 0.5, zb = bed(pair.lo) + f * (bed(pair.hi) - bed(pair.lo));
    let k = 1;
    while ((q.structures || []).some((x) => x.id === 'st' + k)) k++;
    const base = { id: 'st' + k, rs, name: '' };
    if (kind === 'culvert') {
      const c = d.culvert;
      (q.structures ||= []).push({ ...base, kind: 'culvert', shape: c.shape, rise: c.rise, span: c.span, barrels: 1, length: c.length, invUp: Number((zb + 0.05).toFixed(3)), invDown: Number((zb - 0.05).toFixed(3)), n: c.n, ke: c.ke, cd: c.cd, cw: c.cw, roadCrest: Number((top(pair.lo) - 0.1).toFixed(3)), roadLength: c.roadLength, roadCw: c.roadCw });
    } else {
      const lo = pair.lo, b0 = lo.banks[0], b1 = lo.banks[1], tp = top(lo);
      (q.structures ||= []).push({ ...base, kind: 'bridge', abutL: Number(b0.toFixed(3)), abutR: Number(b1.toFixed(3)), lowChord: Number((tp - 0.2).toFixed(3)), deckTop: Number((tp + (U === 'ft' ? 3 : 1)).toFixed(3)), deckWidth: d.bridge.deckWidth, piers: [], cd: d.bridge.cd, cw: d.bridge.cw, cc: d.bridge.cc, ce: d.bridge.ce });
    }
  });
  if (list.length < MAX_STRUCTS && freeGap(r.sections, list)) {
    out.push(el('div', { className: 'cv-actions' },
      el('button', { type: 'button', className: 'btn-line btn-sm-cc', 'data-river-add-culvert': '', onclick: add('culvert') }, t('river.st.add.culvert')),
      el('button', { type: 'button', className: 'btn-line btn-sm-cc', 'data-river-add-bridge': '', onclick: add('bridge') }, t('river.st.add.bridge'))));
  }
  return out;
}

export function structuresTable(p, { el, t, units }) {
  const list = p?.structures || [];
  if (!list.length) return null;
  const U = units === 'ft' ? 'ft' : 'm';
  const head = [t('river.st.c.name'), t('river.st.c.rs'), t('river.st.c.q', { u: U === 'ft' ? 'ft³/s' : 'm³/s' }), t('river.st.c.tw', { u: U }), t('river.st.c.hw', { u: U }), t('river.st.c.control'), t('river.st.c.barrel'), t('river.st.c.over'), t('river.st.c.notes')];   // i18n-ignore: unit symbols
  return el('div', { className: 'cv-table-wrap' }, el('table', { className: 'cv-table', 'data-river-struct-table': '' },
    el('caption', {}, t('river.st.table')),
    el('thead', {}, el('tr', {}, ...head.map((h) => el('th', { scope: 'col' }, h)))),
    el('tbody', {}, ...list.map((s) => el('tr', { 'data-river-struct-row': s.id },
      el('th', { scope: 'row' }, s.id), el('td', { className: 'num' }, fx(s.rs, 1)), el('td', { className: 'num' }, fx(s.q, 2)), el('td', { className: 'num' }, fx(s.tw, 3)), el('td', { className: 'num' }, fx(s.hwWse, 3)),
      el('td', {}, t('river.st.control.' + s.control)), el('td', { className: 'num' }, fx(s.qCulvert, 2)), el('td', { className: 'num' }, fx(s.qRoad, 2)),
      el('td', {}, s.flags.map((f) => t('river.st.flag.' + f)).join(', ')))))));
}

// ---------------------------------------------------------------------------
// Unsteady flow

function parseHydrograph(text) {
  const out = [];
  for (const line of String(text).split(/\r?\n/)) {
    const m = line.trim().split(/[\s,;]+/).map(Number);
    if (m.length >= 2 && Number.isFinite(m[0]) && Number.isFinite(m[1]) && m[1] >= 0) out.push({ t: m[0] * 3600, q: m[1] });
  }
  return out.sort((a, b) => a.t - b.t);
}

function flowSvg(res, { t, units }) {
  const W = 640, H = 260, L = 56, Rr = 12, T = 12, B = 40, f = res.frames;
  const T1 = f[f.length - 1].t || 1, ends = [0, res.nodes.length - 1];
  let qmax = 1e-9;
  for (const fr of f) for (const i of ends) qmax = Math.max(qmax, fr.q[i]);
  const X = (s) => L + ((W - L - Rr) * s) / T1, Y = (q) => T + (H - T - B) * (1 - q / qmax);
  const line = (i, cls) => `<polyline class="${cls}" fill="none" stroke-width="2" points="${f.map((fr) => `${X(fr.t).toFixed(1)},${Y(fr.q[i]).toFixed(1)}`).join(' ')}"/>`;
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const qU = units === 'ft' ? 'ft³/s' : 'm³/s';   // i18n-ignore: unit symbols
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(t('river.un.plot.aria'))}" width="100%">`
    + `<rect x="${L}" y="${T}" width="${W - L - Rr}" height="${H - T - B}" fill="none" stroke="currentColor" stroke-opacity=".4"/>`
    + `<g stroke="#2563eb" color="#2563eb">${line(0, 'up')}</g><g stroke="#dc2626" color="#dc2626">${line(ends[1], 'dn')}</g>`
    + `<text x="${L}" y="${H - 22}" font-size="11" fill="currentColor">0</text><text x="${W - Rr}" y="${H - 22}" font-size="11" text-anchor="end" fill="currentColor">${(T1 / 3600).toFixed(1)} ${esc(t('river.un.hours'))}</text>`
    + `<text x="${L - 4}" y="${T + 10}" font-size="11" text-anchor="end" fill="currentColor">${qmax.toFixed(1)}</text><text x="${L - 4}" y="${H - B}" font-size="11" text-anchor="end" fill="currentColor">0</text>`
    + `<text x="${L}" y="${H - 6}" font-size="11" fill="#2563eb">${esc(t('river.un.plot.up', { u: qU }))}</text><text x="${W - Rr}" y="${H - 6}" font-size="11" text-anchor="end" fill="#dc2626">${esc(t('river.un.plot.dn', { u: qU }))}</text></svg>`;
}

export function openUnsteady({ el, root, t, say, model, download, stem }) {
  const U = model.units === 'ft' ? 'ft' : 'm', qU = U === 'ft' ? 'ft³/s' : 'm³/s';   // i18n-ignore: unit symbols
  const pf = model.profiles[0];
  if (!pf) { say(t('river.un.need.profile')); return; }
  const did = 'cv-rv-un';
  document.getElementById(did)?.remove();
  const q = pf.q, base = Number((q * 0.25).toPrecision(3));
  const hy = el('textarea', { className: 'cv-input', id: did + '-hy', rows: 6, 'data-river-un-hydro': '', 'aria-describedby': did + '-hy-hint' }, `0, ${base}\n1, ${base}\n3, ${q}\n5, ${base}\n24, ${base}`);
  const slope = pf.down?.type === 'normal' ? pf.down.slope : 0.001;
  const sl = el('input', { type: 'text', className: 'cv-input', id: did + '-sl', inputMode: 'decimal', value: String(slope), style: 'width:6rem', 'data-river-un-slope': '' });
  const dur = el('input', { type: 'text', className: 'cv-input', id: did + '-dur', inputMode: 'decimal', value: '12', style: 'width:5rem', 'data-river-un-dur': '' });
  const dt = el('input', { type: 'text', className: 'cv-input', id: did + '-dt', inputMode: 'decimal', value: '60', style: 'width:5rem', 'data-river-un-dt': '' });
  const out = el('div', { 'data-river-un-out': '', 'aria-live': 'polite' });
  let last = null;
  const run = () => {
    const inflow = parseHydrograph(hy.value), s = Number(sl.value), D = Number(dur.value) * 3600, step = Number(dt.value);
    if (inflow.length < 2) { out.replaceChildren(el('p', { role: 'alert' }, t('river.un.issue.noinflow'))); return; }
    const res = unsteady(model, { inflow, down: { type: 'normal', slope: s }, duration: D, dt: step, every: Math.max(step, D / 120) });
    last = res;
    const bad = res.issues.filter((i) => i.code !== 'structures');
    const notes = [];
    for (const i of res.issues) notes.push(el('li', {}, t('river.un.issue.' + i.code)));
    for (const k of Object.keys(res.flags)) notes.push(el('li', {}, t('river.un.flag.' + k)));
    if (bad.length || !res.frames.length) { out.replaceChildren(el('ul', { className: 'cv-plainlist', role: 'alert' }, ...notes)); return; }
    const plot = el('div', { 'data-river-un-plot': '', style: 'overflow-x:auto;max-width:100%' });
    plot.innerHTML = flowSvg(res, { t, units: U });   // our own SVG: numbers and escaped words only
    const head = [t('river.un.c.rs'), t('river.un.c.wse', { u: U }), t('river.un.c.twse'), t('river.un.c.q', { u: qU }), t('river.un.c.tq')];
    out.replaceChildren(
      el('p', { className: 'cv-note', 'data-river-review': '' }, el('strong', {}, t('river.un.review'))),
      el('p', { 'data-river-un-mass': '' }, t('river.un.mass', { vin: fx(res.mass.inflow, 0), vout: fx(res.mass.outflow, 0), ds: fx(res.mass.storage1 - res.mass.storage0, 0), err: fx(Math.abs(res.mass.error) * 100, 3), steps: res.steps })),
      plot,
      notes.length ? el('ul', { className: 'cv-plainlist', 'data-river-un-flags': '' }, ...notes) : '',
      el('div', { className: 'cv-table-wrap' }, el('table', { className: 'cv-table', 'data-river-un-table': '' },
        el('thead', {}, el('tr', {}, ...head.map((h) => el('th', { scope: 'col' }, h)))),
        el('tbody', {}, ...res.peaks.map((p) => el('tr', {}, el('th', { scope: 'row', className: 'num' }, fx(p.rs, 1)), el('td', { className: 'num' }, fx(p.wse, 3)), el('td', { className: 'num' }, fx(p.tWse / 3600, 2)), el('td', { className: 'num' }, fx(p.q, 2)), el('td', { className: 'num' }, fx(p.tQ / 3600, 2))))))));
    say(t('river.un.done', { n: res.steps }));
  };
  const csv = () => {
    if (!last?.peaks?.length) { say(t('river.un.nothing')); return; }
    const rows = [[t('river.un.c.rs'), t('river.un.c.wse', { u: U }), t('river.un.c.twse'), t('river.un.c.q', { u: qU }), t('river.un.c.tq')], ...last.peaks.map((p) => [p.rs, p.wse, p.tWse / 3600, p.q, p.tQ / 3600])];
    download(stem() + '-unsteady.csv', new Blob(['﻿' + rows.map((r) => r.map((v) => (typeof v === 'number' ? String(Number(v.toFixed(4))) : `"${String(v).replace(/"/g, '""')}"`)).join(',')).join('\r\n')], { type: 'text/csv' }));
    say(t('river.un.saved'));
  };
  const close = el('button', { type: 'button', className: 'cv-x', 'aria-label': t('sx.su957.close') }, el('i', { className: 'bi bi-x-lg', 'aria-hidden': 'true' }));
  const dlg = el('dialog', { className: 'cv-dialog cv-pcdlg', id: did, 'aria-labelledby': did + '-h', 'data-river-un-dialog': '' },
    el('div', { className: 'cv-dlg' },
      el('div', { className: 'cv-dlg-head' }, el('h2', { className: 'cv-h', id: did + '-h' }, t('river.un.title', { name: model.name || model.id })), close),
      el('div', { className: 'cv-dlg-body' },
        el('p', { className: 'cv-note' }, t('river.un.intro')),
        el('label', { for: hy.id }, t('river.un.hydro', { u: qU })), hy, el('p', { className: 'cv-note', id: did + '-hy-hint' }, t('river.un.hydro.hint')),
        el('div', { className: 'cv-props' },
          el('label', { for: sl.id }, t('river.un.slope')), sl, el('label', { for: dur.id }, t('river.un.dur')), dur, el('label', { for: dt.id }, t('river.un.dt')), dt),
        el('div', { className: 'cv-actions' }, el('button', { type: 'button', className: 'btn-plot btn-sm-cc', 'data-river-un-run': '', onclick: run }, t('river.un.run'))),
        out),
      el('div', { className: 'cv-dlg-foot' },
        el('button', { type: 'button', className: 'btn-line btn-sm-cc', 'data-river-un-csv': '', onclick: csv }, t('river.un.csv')),
        el('button', { type: 'button', className: 'btn-line btn-sm-cc', onclick: () => dlg.close() }, t('sx.su957.close')))));
  close.onclick = () => dlg.close();
  dlg.addEventListener('close', () => dlg.remove());
  root.append(dlg);
  dlg.showModal();
}

// ---------------------------------------------------------------------------
// Junctions (0.8 SU.957, civil_PART_4): a river that flows into another

/** The Junction part of a river's Properties: which river this one flows into (none = it is, or ends at, an outlet). */
export function joinBlock({ r, id, others, el, t, edit, row }) {
  const sel = el('select', { className: 'cv-select', id: 'cv-rv-joins', 'data-river-joins': '' },
    el('option', { value: '' }, t('river.join.none')), ...others.map((o) => el('option', { value: o.id, selected: r.joinsTo === o.id }, o.name || o.id)));
  sel.addEventListener('change', () => edit(id, t('river.join.undo'), (q) => { if (sel.value) q.joinsTo = sel.value; else delete q.joinsTo; }));
  return [el('h3', { className: 'cv-h3', 'data-river-join-head': '' }, t('river.join.head')), el('p', { className: 'cv-note' }, t('river.join.note')), ...row(t('river.join.into'), sel, 'cv-rv-joins')];
}

/** The rivers of `id`'s junction group solved together (each profile number is one event): { net, ids, byId } or { issues } when they cannot be. */
export function solveGroup(models, id) {
  const g = networkOf(models, id); if (!g) return null;
  if (g.issues.length) return { issues: g.issues, ids: g.ids };
  const net = solveNetwork({ reaches: g.reaches });
  return net.issues.length ? { issues: net.issues, ids: g.ids } : { net, ids: g.ids, models: new Map(models.map((m) => [m.id, m])) };
}

/** The junctions of the group a solved profile belongs to, for the Results dialog: one row per junction, naming the rivers and adding their flows. */
export function junctionTable(profileIndex, group, { el, t, units }) {
  if (!group) return null;
  if (group.issues) return el('ul', { className: 'cv-plainlist', 'data-river-join-issues': '' }, ...group.issues.map((i) => el('li', {}, t('river.join.issue.' + i.code, { id: i.id || '' }))));
  const U = units === 'ft' ? 'ft' : 'm', name = (rid) => group.models.get(rid)?.name || rid;
  const rows = group.net.junctions.map((j) => { const p = j.profiles[profileIndex] || j.profiles[0];
    return el('tr', { 'data-river-join-row': j.into }, el('th', { scope: 'row' }, name(j.into)), el('td', {}, j.ups.map(name).join(', ')), el('td', { className: 'num' }, p.parts.map((q) => fx(q, 2)).join(' + ')), el('td', { className: 'num' }, fx(p.q, 2)), el('td', { className: 'num' }, fx(p.wse, 3))); });
  return el('div', { className: 'cv-table-wrap' }, el('table', { className: 'cv-table', 'data-river-join-table': '' }, el('caption', {}, t('river.join.table')),
    el('thead', {}, el('tr', {}, ...[t('river.join.c.into'), t('river.join.c.ups'), t('river.join.c.parts', { u: U === 'ft' ? 'ft³/s' : 'm³/s' }), t('river.join.c.q'), t('river.join.c.wse', { u: U })].map((h) => el('th', { scope: 'col' }, h)))), el('tbody', {}, ...rows)),
    el('p', { className: 'cv-note' }, t('river.join.method')));
}
