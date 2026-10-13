/* SPDX-License-Identifier: Apache-2.0 */
/**
 * parcels-ui.js — parcels in the app (0.4 V21): the Parcels block in Properties, the Parcel tool's finish, the deed calls
 * dialog (calls typed or pasted, read as you type: courses, misclosure, precision, area), a parcel's Properties (name, point
 * of beginning, courses with a radius to make any of them a curve, the legal description to copy or download), picking, the
 * selected outline, and the plan labels (scene items on V-PROP / V-PROP-TEXT, so the PDF plot and DWG/DXF get them).
 * The numbers are parcels.js's (bin/test-civilcraft-parcels.mjs). Every change is one undo step.
 *
 *   createParcels(ctx) → { block(), props(p), finish(pts), pick(w), overlay(c2d, S, C, sel), sceneItems(mm), remove(id), find(id), openCalls(),
 *                          addParcel(name, pts, pob) }
 *   ctx = { root, el, project: () => Project, units, numInput, row, say, select(sel), tool(name), refocus(), download(name, blob), fileStem() }
 */

import { t } from './i18n.js';
import { parseCalls, runCalls, courses, parcelArea, perimeter, legalDescription, parcelLabels, areaWords } from './parcels.js';
import { bearing, dms, fixed, grouped } from './units.js';

export function createParcels(ctx) {
  const { el } = ctx;
  const P = () => ctx.project(), U = () => ctx.units(), L = () => (U() === 'm' ? 'm' : 'ft');
  const list = () => P().state.parcels || [];
  const find = (id) => list().find((p) => p.id === id);
  const edit = (id, label, fn) => P().change(label, (st) => { const p = st.parcels.find((x) => x.id === id); if (p) fn(p, st); });

  function block() {
    const out = [el('h3', { className: 'cv-h3', 'data-pc-head': '' }, t('pc.head'))];
    const ps = list();
    if (ps.length) out.push(el('ul', { className: 'cv-plainlist', 'data-pc-list': '' }, ...ps.map((p) => el('li', {},
      el('button', { type: 'button', className: 'cv-linkbtn', onclick: () => ctx.select({ kind: 'parcel', id: p.id }) }, p.name), ' ', areaWords(parcelArea(p.pts), U())))));
    else out.push(el('p', { className: 'cv-note' }, t('pc.none')));
    out.push(el('div', { className: 'cv-actions' },
      el('button', { type: 'button', className: 'btn-line btn-sm-cc', 'data-pc-draw': '', onclick: () => ctx.tool('parcel') }, el('i', { className: 'bi bi-pentagon', 'aria-hidden': 'true' }), ' ', t('pc.draw')),
      el('button', { type: 'button', className: 'btn-line btn-sm-cc', 'data-pc-calls': '', onclick: () => openCalls() }, el('i', { className: 'bi bi-signpost-split', 'aria-hidden': 'true' }), ' ', t('pc.calls'))));
    return out;
  }

  function props(p) {
    const out = [];
    const nm = el('input', { type: 'text', className: 'cv-input', id: 'cv-pc-name', value: p.name, maxLength: 120 });
    nm.addEventListener('change', () => edit(p.id, t('pc.undo.rename'), (q) => { q.name = nm.value.trim().slice(0, 120) || t('pc.default'); }));
    const pob = el('input', { type: 'text', className: 'cv-input', id: 'cv-pc-pob', value: p.pob || '', maxLength: 200, placeholder: t('pc.pob.ph') });
    pob.addEventListener('change', () => edit(p.id, t('pc.undo.pob'), (q) => { const v = pob.value.replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, 200); if (v) q.pob = v; else delete q.pob; }));
    out.push(el('div', { className: 'cv-props', 'data-pc-props': '' },
      ...ctx.row(t('pc.name'), nm, 'cv-pc-name'),
      ...ctx.row(t('pc.area'), areaWords(parcelArea(p.pts), U())),
      ...ctx.row(t('pc.perimeter'), fixed(perimeter(p.pts), 2) + ' ' + L()),
      ...ctx.row(t('pc.pob'), pob, 'cv-pc-pob')));
    // courses: bearing and distance, or a curve; a radius makes any course a curve (empty = straight)
    const cs = courses(p.pts);
    out.push(el('div', { className: 'cv-table-wrap' }, el('table', { className: 'cv-table', 'data-pc-courses': '' },
      el('thead', {}, el('tr', {}, ...['#', t('pc.c.course'), t('pc.c.radius', { u: L() }), t('pc.c.turn')].map((h) => el('th', { scope: 'col' }, h)))),
      el('tbody', {}, ...cs.map((c, i) => {
        const chord = Math.hypot(c.to.x - c.from.x, c.to.y - c.from.y);
        const turn = el('select', { className: 'cv-select', style: 'width:auto;min-width:4.5rem', 'aria-label': t('pc.c.turn.of', { n: i + 1 }), 'data-pc-turn': i }, el('option', { value: '-1' }, t('pc.right')), el('option', { value: '1' }, t('pc.left')));
        turn.value = c.kind === 'curve' ? String(c.turn) : '-1';
        const setR = (R, dir) => edit(p.id, t('pc.undo.curve'), (q) => { if (R === null) delete q.pts[i].b; else q.pts[i].b = dir * Math.tan(Math.asin(chord / (2 * R)) / 2); });
        const rIn = ctx.numInput(c.kind === 'curve' ? fixed(c.R, 2).replace(/,/g, '') : '', (v) => {
          const s = String(v).trim();
          if (s === '') { setR(null); return true; }
          const R = Number(s);
          if (!(R >= chord / 2 - 1e-9)) return false;   // a radius shorter than half the chord cannot reach
          setR(Math.max(R, chord / 2), Number(turn.value)); return true;
        }, { label: t('pc.c.radius.of', { n: i + 1 }), text: true, width: '6rem' });
        turn.addEventListener('change', () => { if (c.kind === 'curve') setR(c.R, Number(turn.value)); });
        const txt = c.kind === 'line' ? bearing(c.dir) + ', ' + fixed(c.dist, 2) : 'L ' + fixed(c.L, 2) + ', Δ ' + dms((c.delta * 180) / Math.PI) + ', ' + t('pc.chord') + ' ' + bearing(c.chordDir) + ' ' + fixed(c.chord, 2);
        return el('tr', {}, el('td', {}, String(i + 1)), el('td', {}, txt), el('td', {}, rIn), el('td', {}, turn));
      })))));
    out.push(el('p', { className: 'cv-note' }, t('pc.c.note')));
    // the legal description
    const legal = legalDescription(p, { units: U(), pob: p.pob || null });
    const ta = el('textarea', { className: 'cv-input cv-legal', id: 'cv-pc-legal', readOnly: true, rows: 10, 'data-pc-legal': '' }, legal);
    const copy = el('button', { type: 'button', className: 'btn-line btn-sm-cc', 'data-pc-copy': '', onclick: async () => {
      try { await navigator.clipboard.writeText(legal); ctx.say(t('pc.copied')); } catch { ta.select(); ctx.say(t('pc.copy.select')); }
    } }, el('i', { className: 'bi bi-clipboard', 'aria-hidden': 'true' }), ' ', t('pc.copy'));
    const dl = el('button', { type: 'button', className: 'btn-line btn-sm-cc', 'data-pc-download': '', onclick: () => ctx.download(ctx.fileStem() + ' - ' + p.name.replace(/[\\/:*?"<>|]/g, '_') + '.txt', new Blob([legal.replace(/\n/g, '\r\n') + '\r\n'], { type: 'text/plain' })) },
      el('i', { className: 'bi bi-download', 'aria-hidden': 'true' }), ' ', t('pc.download'));
    out.push(el('h3', { className: 'cv-h3' }, el('label', { for: 'cv-pc-legal' }, t('pc.legal'))), ta, el('div', { className: 'cv-actions' }, copy, dl),
      el('p', { className: 'cv-note' }, t('pc.legal.note')));
    out.push(el('div', { className: 'cv-actions' },
      el('button', { type: 'button', className: 'btn-line btn-sm-cc', 'data-pc-draw': '', onclick: () => ctx.tool('parcel') }, el('i', { className: 'bi bi-pentagon', 'aria-hidden': 'true' }), ' ', t('pc.draw.more')),
      el('button', { type: 'button', className: 'btn-line btn-sm-cc', 'data-pc-calls': '', onclick: () => openCalls() }, t('pc.calls'))));
    return out;
  }

  function add(name, pts, label, pob = null) {
    const id = P().nextId('r');
    P().change(label, (st) => { if (!st.parcels) st.parcels = []; st.parcels.push({ id, name, pts: pts.map((q) => (q.b ? { x: q.x, y: q.y, b: q.b } : { x: q.x, y: q.y })), ...(pob ? { pob } : {}) }); });
    ctx.select({ kind: 'parcel', id });
    return id;
  }
  const nextName = () => t('pc.default') + ' ' + (list().length + 1);
  function finish(pts) {
    if (pts.length < 3) { ctx.say(t('pc.few')); return false; }
    const name = nextName();
    add(name, pts, t('pc.undo.draw'));
    ctx.say(t('pc.drawn', { name, area: areaWords(parcelArea(pts), U()) }));
    return true;
  }

  /** The deed calls dialog: start (a point number, or a northing and easting), the calls, read as you type. */
  function openCalls() {
    const id = 'cv-pc-dlg';
    const nm = el('input', { type: 'text', className: 'cv-input', id: id + '-name', value: nextName(), maxLength: 120 });
    const startPt = el('input', { type: 'text', className: 'cv-input', id: id + '-pt', maxLength: 40, placeholder: t('pc.dlg.pt.ph'), style: 'width:8rem' });
    const north = el('input', { type: 'text', className: 'cv-input', id: id + '-n', inputMode: 'decimal', style: 'width:9rem', 'aria-label': t('pc.dlg.n') });
    const east = el('input', { type: 'text', className: 'cv-input', id: id + '-e', inputMode: 'decimal', style: 'width:9rem', 'aria-label': t('pc.dlg.e') });
    const calls = el('textarea', { className: 'cv-input cv-calls', id: id + '-calls', rows: 10, spellcheck: false, placeholder: 'N 0°00\'00" E 200.00\nN 90°00\'00" E 100.00\nC R 50 L 78.54 right\nS 0°00\'00" W 150.00\n…', 'data-pc-calls-text': '' });
    const report = el('div', { 'aria-live': 'polite', 'data-pc-report': '' });
    const go = el('button', { type: 'button', className: 'btn-plot btn-sm-cc', 'data-pc-add': '', disabled: true }, t('pc.dlg.add'));
    const closeBtn = el('button', { type: 'button', className: 'cv-x', 'aria-label': t('pc.dlg.close') }, el('i', { className: 'bi bi-x-lg', 'aria-hidden': 'true' }));
    const row = (label, input) => [el('label', { for: input.id }, label), input];
    let state = null;
    const start = () => {
      const n = startPt.value.trim();
      if (n) { const q = P().points.find((x) => x.n === n); return q ? { x: q.x, y: q.y, from: t('pc.dlg.from.pt', { n }) } : { error: t('pc.dlg.nopt', { n }) }; }
      const y = Number(north.value), x = Number(east.value);
      if (north.value.trim() === '' && east.value.trim() === '') return { error: t('pc.dlg.nostart') };
      return Number.isFinite(x) && Number.isFinite(y) ? { x, y, from: null } : { error: t('pc.dlg.badne') };
    };
    function update() {
      const s = start(), r = parseCalls(calls.value);
      const lines = [];
      state = null;
      if (s.error) lines.push(el('li', {}, s.error));
      for (const e of r.errors.slice(0, 20)) lines.push(el('li', {}, t('pc.dlg.line', { n: e.line }) + ' ' + e.msg));
      if (!r.calls.length && !r.errors.length) { report.replaceChildren(el('p', { className: 'cv-note' }, t('pc.dlg.help'))); go.disabled = true; return; }
      if (lines.length) { report.replaceChildren(el('div', { className: 'cv-report is-error' }, el('ul', {}, ...lines))); go.disabled = true; return; }
      const run = runCalls(s, r.calls);
      const closes = run.misclosure.dist <= 0.0005 * Math.max(1, run.length / 1000);
      const pts = closes ? run.pts.slice(0, -1) : run.pts;
      if (pts.length < 3 && !pts.some((q) => q.b)) { report.replaceChildren(el('div', { className: 'cv-report is-error' }, el('ul', {}, el('li', {}, t('pc.few'))))); go.disabled = true; return; }
      state = { pts, closes, s };
      const facts = [
        ...row(t('pc.dlg.courses'), el('span', {}, String(r.calls.length))),
        ...row(t('pc.dlg.length'), el('span', {}, fixed(run.length, 2) + ' ' + L())),
        ...row(t('pc.dlg.mis'), el('span', { 'data-pc-mis': '' }, closes ? t('pc.dlg.closes') : fixed(run.misclosure.dist, 3) + ' ' + L() + ', ' + bearing(run.misclosure.dir))),
        ...row(t('pc.dlg.prec'), el('span', { 'data-pc-prec': '' }, closes ? '—' : '1 : ' + grouped(run.precision, 0))),
        ...row(t('pc.area'), el('span', {}, areaWords(parcelArea(pts), U())))];
      report.replaceChildren(el('div', { className: 'cv-props' }, ...facts), ...(closes ? [] : [el('p', { className: 'cv-note' }, t('pc.dlg.gap'))]));
      go.disabled = false;
    }
    for (const x of [startPt, north, east, calls]) x.addEventListener('input', update);
    const dlg = el('dialog', { className: 'cv-dialog cv-pcdlg', 'aria-labelledby': id + '-h', 'data-pc-dialog': '' },
      el('div', { className: 'cv-dlg' },
        el('div', { className: 'cv-dlg-head' }, el('h2', { className: 'cv-h', id: id + '-h' }, t('pc.dlg.title')), closeBtn),
        el('div', { className: 'cv-dlg-body' },
          el('div', { className: 'cv-props' }, ...row(t('pc.name'), nm), ...row(t('pc.dlg.pt'), startPt)),
          el('p', { className: 'cv-note' }, t('pc.dlg.or')),
          el('div', { className: 'cv-row' }, el('label', { for: north.id }, t('pc.dlg.n')), north, el('label', { for: east.id }, t('pc.dlg.e')), east),
          el('label', { for: calls.id, className: 'cv-block-label' }, t('pc.dlg.calls')), calls,
          report),
        el('div', { className: 'cv-dlg-foot' }, el('button', { type: 'button', className: 'btn-line btn-sm-cc', onclick: () => dlg.close() }, t('pc.dlg.cancel')), go)));
    closeBtn.onclick = () => dlg.close();
    go.onclick = () => {
      if (!state) return;
      const name = nm.value.trim().slice(0, 120) || nextName();
      add(name, state.pts, t('pc.undo.calls'), state.s.from);
      dlg.close();
      ctx.say(t(state.closes ? 'pc.dlg.done' : 'pc.dlg.done.gap', { name, area: areaWords(parcelArea(state.pts), U()) }));
    };
    dlg.addEventListener('close', () => { dlg.remove(); ctx.refocus(); });
    ctx.root.append(dlg);
    update();
    dlg.showModal();
    calls.focus();
  }

  function pick(w) {
    for (const p of list().slice().reverse()) if (inPoly(w.x, w.y, p.pts)) return { kind: 'parcel', id: p.id };
    return null;
  }
  function remove(id) {
    const p = find(id);
    if (!p) return false;
    P().change(t('pc.undo.delete'), (st) => { st.parcels = st.parcels.filter((x) => x.id !== id); });
    ctx.say(t('pc.deleted', { name: p.name }));
    return true;
  }
  function overlay(c2d, S, C, sel) {
    const p = sel?.kind === 'parcel' ? find(sel.id) : null;
    if (!p) return;
    c2d.save();
    c2d.strokeStyle = C.action; c2d.lineWidth = 3; c2d.globalAlpha = 0.5;
    for (const it of parcelLabels(p, { units: U(), unitPerMm: 1 })) {
      if (it.layer !== 'V-PROP') continue;
      c2d.beginPath();
      if (it.kind === 'poly') it.pts.forEach((q, i) => { const s = S(q.x, q.y); i ? c2d.lineTo(s.x, s.y) : c2d.moveTo(s.x, s.y); });
      else { const n = 48; for (let k = 0; k <= n; k++) { let a1 = it.a1; while (a1 < it.a0) a1 += Math.PI * 2; const a = it.a0 + ((a1 - it.a0) * k) / n, s = S(it.c.x + it.r * Math.cos(a), it.c.y + it.r * Math.sin(a)); k ? c2d.lineTo(s.x, s.y) : c2d.moveTo(s.x, s.y); } }
      c2d.stroke();
    }
    c2d.globalAlpha = 1;
    const s0 = S(p.pts[0].x, p.pts[0].y);
    c2d.fillStyle = C.action; c2d.beginPath(); c2d.arc(s0.x, s0.y, 5, 0, Math.PI * 2); c2d.fill();   // the point of beginning
    c2d.restore();
  }
  const sceneItems = (mm) => list().flatMap((p) => parcelLabels(p, { units: U(), unitPerMm: 1 / mm }));
  /** A parcel from elsewhere (the traverse dialog): one step, selected, said. */
  function addParcel(name, pts, pob = null) {
    const nm = name + ' ' + (list().length + 1);
    add(nm, pts, t('pc.undo.traverse'), pob);
    ctx.say(t('pc.drawn', { name: nm, area: areaWords(parcelArea(pts), U()) }));
  }
  return { block, props, finish, pick, overlay, sceneItems, remove, find, openCalls, addParcel };
}

function inPoly(x, y, pts) {
  let inside = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const a = pts[i], b = pts[j];
    if ((a.y > y) !== (b.y > y) && x < ((b.x - a.x) * (y - a.y)) / (b.y - a.y) + a.x) inside = !inside;
  }
  return inside;
}
