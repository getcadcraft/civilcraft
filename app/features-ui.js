/* SPDX-License-Identifier: Apache-2.0 */
/**
 * features-ui.js — feature lines in the page (0.4 V14): drawing them, Properties, plan linework and the selection labels.
 * Everything it changes goes through featureline.js and project.change (one undo step each). civilcraft.js creates one:
 *
 *   createFeatures(ctx)   ctx = { el, project: () => Project, units: () => 'ft'|'m', say, numInput, row, select(sel),
 *                                 command(c), eg: () => surface | null }
 *   → { finish(draftPts, closed) (the Feature line tool ended: make it), props(f) → nodes, sceneItems() (layer
 *       C-GRAD-FEAT, z kept: 3D polylines in DXF/DWG), pick(w, tol) → { kind: 'feature', id } | null, find(id),
 *       grip(sel) → { list, label, get } for the selected line's vertices, overlay(ctx2d, toScreen, colors, sel)
 *       (elevations at the vertices, grades along the segments), remove(id),
 *       gradeLayer(ctx2d, toScreen, colors, sel, font) — 0.5 WL.21: every other line's grades (a downhill arrow under each)
 *       and elevations, on screen only (display.gradeOverlay) }
 *
 * Drawing: the Feature line tool (L, Surface › More) takes a click per vertex; a click on a survey point takes its
 * place and elevation, otherwise the elevation is the existing ground's there (else the previous vertex's, said);
 * clicking the first vertex again closes the line; Enter finishes.
 */

import { t } from './i18n.js';
import { FEATURE_DEFAULTS, USES, stations, segments, setElevation, setGrade, evenGrade, raise, fromSurface, offsetFeature, gradeLabel, gradeOverlay, flatten, setArc, arcText, parseArc, pointOnSeg, cadPolyline } from './featureline.js';
import { fixed, unitOf } from './units.js';

const okB = (b) => Number.isFinite(b) && b !== 0 && Math.abs(b) < 100;

export function createFeatures(ctx) {
  const { el } = ctx;
  const P = () => ctx.project();
  const find = (id) => (P().state.features || []).find((f) => f.id === id) || null;
  const U = () => ctx.units();

  /** Replace a feature line by fn(f) → f' as one undo step. */
  function edit(id, label, fn) {
    const f = find(id);
    if (!f) return false;
    const next = fn(f);
    if (!next || next === f) return false;
    return P().change(label, (s) => { const i = s.features.findIndex((x) => x.id === id); if (i >= 0) s.features[i] = { ...next, id }; });
  }

  function finish(pts, closed) {
    const min = closed ? 3 : 2;
    if (pts.length < min) { ctx.say(t(closed ? 'fl.need3' : 'fl.need2')); return null; }
    const sf = ctx.eg();
    let guessed = 0, prev = null;
    const out = pts.map((p) => {
      let z = Number.isFinite(p.z) ? p.z : sf?.elevationAt(p.x, p.y, 1e-6);
      if (z === null || z === undefined) { z = prev ?? 0; guessed++; }
      prev = z;
      return okB(p.b) ? { x: p.x, y: p.y, z, b: p.b } : { x: p.x, y: p.y, z };   // 0.6 WL.24: an arc drawn with C
    });
    out.forEach((q, i) => { if (q.b && !closed && i === out.length - 1) delete q.b; });
    const p = P(), id = p.nextId('f'), n = (p.state.features || []).length + 1, d = FEATURE_DEFAULTS(U());
    const name = t('fl.name', { n });
    p.change(t('fl.undo.draw'), (s) => { (s.features ||= []).push({ id, name, pts: out, closed: !!closed, use: d.use, daylight: false, cut: d.cut, fill: d.fill }); });
    ctx.select({ kind: 'feature', id });
    ctx.say(t('fl.drawn', { name, n: out.length }) + (guessed ? ' ' + t('fl.drawn.guessed', { n: guessed }) : ''));
    return id;
  }

  function props(f) {
    const out = [], u = unitOf(U()), id = f.id;
    const nm = el('input', { type: 'text', className: 'cv-input', id: 'cv-fl-name', value: f.name, maxLength: 120 });
    nm.addEventListener('change', () => edit(id, t('fl.undo.rename'), (x) => ({ ...x, name: nm.value.trim().slice(0, 120) || x.name })));
    const use = el('select', { className: 'cv-select', id: 'cv-fl-use', 'data-fl-use': '' }, ...USES.map((k) => el('option', { value: k }, t('fl.use.' + k))));
    use.value = f.use;
    use.addEventListener('change', () => edit(id, t('fl.undo.use'), (x) => ({ ...x, use: use.value })));
    const closed = el('input', { type: 'checkbox', id: 'cv-fl-closed', checked: f.closed, disabled: f.pts.length < 3 });
    closed.addEventListener('change', () => edit(id, t(closed.checked ? 'fl.undo.close' : 'fl.undo.open'), (x) => ({ ...x, closed: closed.checked })));
    const st = stations(f), sg = segments(f);
    out.push(el('div', { className: 'cv-props' }, ...ctx.row(t('fl.props.name'), nm, 'cv-fl-name'), ...ctx.row(t('fl.props.use'), use, 'cv-fl-use'),
      ...ctx.row(t('fl.props.length'), fixed(st[st.length - 1], 2) + ' ' + u.short),
      ...ctx.row(t('fl.props.length3d'), fixed(sg.reduce((a, s) => a + s.len3d, 0), 2) + ' ' + u.short)));
    out.push(el('label', { className: 'cv-check', for: 'cv-fl-closed' }, closed, ' ', t('fl.props.closed')));
    out.push(el('p', { className: 'cv-note', 'data-fl-use-note': '' }, t('fl.use.note.' + f.use + (f.use === 'design' && !f.closed ? '.open' : ''))));
    if (f.use === 'design' && f.closed) {
      const day = el('input', { type: 'checkbox', id: 'cv-fl-day', checked: f.daylight });
      day.addEventListener('change', () => edit(id, t('fl.undo.daylight'), (x) => ({ ...x, daylight: day.checked })));
      out.push(el('label', { className: 'cv-check', for: 'cv-fl-day' }, day, ' ', t('fl.props.daylight')));
      if (f.daylight) {
        const slope = (k) => ctx.numInput(fixed(f[k], 2), (v) => { const x = Number(v); if (!(x > 0) || v === '') return false; edit(id, t('fl.undo.' + k), (q) => ({ ...q, [k]: x })); return true; }, { id: 'cv-fl-' + k, min: 0 });
        out.push(el('div', { className: 'cv-props' }, ...ctx.row(t('fl.props.cut'), el('div', { className: 'cv-row' }, slope('cut'), el('span', { className: 'cv-unit' }, ': 1')), 'cv-fl-cut'),
          ...ctx.row(t('fl.props.fill'), el('div', { className: 'cv-row' }, slope('fill'), el('span', { className: 'cv-unit' }, ': 1')), 'cv-fl-fill')));
      }
    }
    // vertices: station, elevation (editable), grade to the next (editable)
    out.push(el('h3', { className: 'cv-h3' }, t('fl.props.vertices')));
    const tbody = el('tbody');
    f.pts.forEach((p, i) => {
      const s = sg[i];
      const zIn = ctx.numInput(fixed(p.z, 3).replace(/,/g, ''), (v) => { const z = Number(v); if (!Number.isFinite(z) || v === '') return false; edit(id, t('fl.undo.elev', { n: i + 1 }), (x) => setElevation(x, i, z)); return true; }, { label: t('fl.props.elev.of', { n: i + 1 }), width: '6.5rem' });
      const gIn = s ? ctx.numInput(s.grade === null ? '' : (s.grade * 100).toFixed(2), (v) => { const g = Number(String(v).replace('%', '')) / 100; if (!Number.isFinite(g) || v === '') return false; edit(id, t('fl.undo.grade', { n: i + 1 }), (x) => setGrade(x, i, g)); return true; }, { label: t('fl.props.grade.of', { n: i + 1 }), text: true, calc: false, width: '4.25rem' }) : '—';
      // 0.6 WL.24: the segment from this vertex as an arc — "50 L" / "50 R", empty = straight
      const rIn = s ? ctx.numInput(arcText(f, i), (v) => {
        const r = parseArc(v, !(s.arc && s.arc.sweep < 0));
        if (!r) return false;
        if (!r.r && !s.arc) return true;   // straight already
        const next = setArc(find(id), i, r.r, r.left);
        if (next === find(id)) { if (r.r) ctx.say(t('fl.arc.short', { n: i + 1, min: fixed(s.chord / 2, 2) })); return !r.r; }
        edit(id, t(r.r ? 'fl.undo.arc' : 'fl.undo.straight', { n: i + 1 }), () => next);
        return true;
      }, { label: t('fl.props.radius.of', { n: i + 1 }), text: true, calc: false, width: '4.75rem' }) : '—';
      tbody.append(el('tr', {}, el('td', {}, String(i + 1)), el('td', { className: 'num' }, fixed(st[i], 2)), el('td', {}, zIn), el('td', {}, gIn), el('td', { 'data-fl-arc': String(i) }, rIn)));
    });
    out.push(el('div', { className: 'cv-table-wrap' }, el('table', { className: 'cv-table', 'data-fl-table': '' },
      el('thead', {}, el('tr', {}, el('th', { scope: 'col' }, '#'), el('th', { scope: 'col', className: 'num' }, t('fl.props.station')), el('th', { scope: 'col' }, t('fl.props.elev')), el('th', { scope: 'col' }, t('fl.props.grade')), el('th', { scope: 'col' }, t('fl.props.radius')))), tbody)));
    out.push(el('p', { className: 'cv-note' }, t('fl.props.grade.note')));
    out.push(el('p', { className: 'cv-note' }, t('fl.props.radius.note')));
    // whole-line actions
    const dz = ctx.numInput('', (v) => { const x = Number(v); if (!Number.isFinite(x) || v === '' || x === 0) return false; edit(id, t('fl.undo.raise'), (q) => raise(q, x)); return true; }, { id: 'cv-fl-raise' });
    out.push(el('div', { className: 'cv-props' }, ...ctx.row(t('fl.props.raise'), el('div', { className: 'cv-row' }, dz, el('span', { className: 'cv-unit' }, u.short)), 'cv-fl-raise')));
    out.push(el('div', { className: 'cv-actions' },
      el('button', { type: 'button', className: 'btn-line btn-sm-cc', 'data-fl-surface': '', onclick: () => {
        const r = fromSurface(find(id), ctx.eg());
        if (r.missing.length === f.pts.length) { ctx.say(t('fl.surface.none')); return; }
        edit(id, t('fl.undo.surface'), () => r.f);
        ctx.say(t('fl.surface.done') + (r.missing.length ? ' ' + t('fl.surface.missing', { list: r.missing.map((k) => k + 1).join(', ') }) : ''));
      } }, t('fl.props.surface')),
      f.pts.length > 2 ? el('button', { type: 'button', className: 'btn-line btn-sm-cc', 'data-fl-even': '', onclick: () => { edit(id, t('fl.undo.even'), (x) => evenGrade(x, 0, x.pts.length - 1)); ctx.say(t('fl.even.done')); } }, t('fl.props.even')) : null));
    // stepped offset
    out.push(el('h3', { className: 'cv-h3' }, t('fl.props.offset')));
    const d0 = FEATURE_DEFAULTS(U());
    const dist = el('input', { type: 'text', className: 'cv-input', id: 'cv-fl-odist', value: String(d0.offset), inputMode: 'decimal' });
    const how = el('select', { className: 'cv-select', id: 'cv-fl-ohow' }, el('option', { value: 'dz' }, t('fl.offset.by.dz')), el('option', { value: 'slope' }, t('fl.offset.by.slope')));
    const amt = el('input', { type: 'text', className: 'cv-input', id: 'cv-fl-oamt', value: '0', inputMode: 'decimal' });
    out.push(el('div', { className: 'cv-props', 'data-fl-offset': '' }, ...ctx.row(t('fl.offset.dist'), el('div', { className: 'cv-row' }, dist, el('span', { className: 'cv-unit' }, u.short)), 'cv-fl-odist'),
      ...ctx.row(t('fl.offset.how'), how, 'cv-fl-ohow'), ...ctx.row(t('fl.offset.amount'), amt, 'cv-fl-oamt')));
    out.push(el('p', { className: 'cv-note' }, t('fl.offset.note')));
    out.push(el('button', { type: 'button', className: 'btn-line btn-sm-cc', 'data-fl-offset-go': '', onclick: () => {
      const D = Number(dist.value), A = Number(String(amt.value).replace('%', ''));
      if (!Number.isFinite(D) || !Number.isFinite(A)) { ctx.say(t('fl.offset.numbers')); return; }
      const r = offsetFeature(find(id), D, how.value === 'dz' ? { dz: A } : { slope: A / 100 });
      if (!r.f) { ctx.say(r.problem); return; }
      const p = P(), nid = p.nextId('f'), name = t('fl.offset.name', { name: f.name, d: (D > 0 ? '+' : '') + D });
      p.change(t('fl.undo.offset'), (s) => { s.features.push({ ...r.f, id: nid, name: name.slice(0, 120) }); });
      ctx.select({ kind: 'feature', id: nid });
      ctx.say(t('fl.offset.done', { name }));
    } }, t('fl.offset.go')));
    out.push(el('div', { className: 'cv-actions' }, el('button', { type: 'button', className: 'btn-line btn-sm-cc cv-danger', onclick: () => ctx.command('delete') }, el('i', { className: 'bi bi-trash3', 'aria-hidden': 'true' }), ' ', t('fl.props.delete'))));
    return out;
  }

  function sceneItems() {
    // 0.6 WL.24: arcs in pieces; the extended data lets CivilCraft read the arcs back from a DXF or DWG
    return (P().state.features || []).map((f) => { const c = cadPolyline(f); return { layer: 'C-GRAD-FEAT', kind: 'poly', pts: c.pts, closed: c.closed, z: true, xdata: c.xdata }; });
  }
  function pick(w, tol) {
    let best = null, bd = tol;
    for (const f of P().state.features || []) {
      const pts = flatten(f);   // 0.6 WL.24: arcs as pieces
      for (let i = 1; i < pts.length; i++) {
        const a = pts[i - 1], b = pts[i], dx = b.x - a.x, dy = b.y - a.y, L = dx * dx + dy * dy;
        const u = L ? Math.max(0, Math.min(1, ((w.x - a.x) * dx + (w.y - a.y) * dy) / L)) : 0;
        const d = Math.hypot(w.x - a.x - dx * u, w.y - a.y - dy * u);
        if (d < bd) { bd = d; best = { kind: 'feature', id: f.id }; }
      }
    }
    return best;
  }
  function grip(sel) {
    const f = sel?.kind === 'feature' ? find(sel.id) : null;
    return f ? { list: f.pts, label: t('fl.undo.move'), get: () => find(sel.id)?.pts } : null;
  }
  function overlay(c2d, toScreen, C, sel, font) {
    const f = sel?.kind === 'feature' ? find(sel.id) : null;
    if (!f) return;
    const pts = flatten(f);   // 0.6 WL.24: arcs as pieces
    c2d.strokeStyle = C.action; c2d.lineWidth = 3; c2d.setLineDash([]); c2d.beginPath();
    pts.forEach((p, i) => { const q = toScreen(p.x, p.y); i ? c2d.lineTo(q.x, q.y) : c2d.moveTo(q.x, q.y); });
    c2d.stroke();
    c2d.font = '600 11px ' + font; c2d.textBaseline = 'bottom';
    const sg = segments(f);
    for (const s of sg) {
      const A = f.pts[s.i], B = f.pts[s.j], a = toScreen(A.x, A.y), b = toScreen(B.x, B.y);
      // 0.6 WL.24: on an arc the label sits at its middle along its tangent, with its radius
      const mid = pointOnSeg(A, B, A.b, 0.5), m = toScreen(mid.x, mid.y), ah = toScreen(mid.x + Math.cos(mid.dir), mid.y + Math.sin(mid.dir));
      if (Math.max(Math.hypot(b.x - a.x, b.y - a.y), 2 * Math.hypot(m.x - a.x, m.y - a.y)) < 70) continue;
      let ang = Math.atan2(ah.y - m.y, ah.x - m.x);
      if (Math.abs(ang) > Math.PI / 2) ang += Math.PI;   // upright; the grade is always in the line's own direction
      c2d.save(); c2d.translate(m.x, m.y); c2d.rotate(ang);
      c2d.fillStyle = C.bg; const txt = gradeLabel(s.grade) + (s.arc ? '  R ' + fixed(s.arc.r, 2) : ''), w = c2d.measureText(txt).width;
      c2d.fillRect(-w / 2 - 2, -16, w + 4, 13); c2d.fillStyle = C.action; c2d.textAlign = 'center'; c2d.fillText(txt, 0, -4); c2d.restore();
    }
    c2d.textAlign = 'left';
    for (const p of f.pts) {
      const q = toScreen(p.x, p.y), txt = fixed(p.z, 2), w = c2d.measureText(txt).width;
      c2d.fillStyle = C.bg; c2d.fillRect(q.x + 6, q.y - 15, w + 4, 13); c2d.fillStyle = C.ink; c2d.fillText(txt, q.x + 8, q.y - 3);
    }
  }
  function remove(id) {
    const f = find(id);
    if (!f) return false;
    P().change(t('fl.undo.delete'), (s) => { s.features = s.features.filter((x) => x.id !== id); });
    ctx.say(t('fl.deleted', { name: f.name }));
    return true;
  }
  /** 0.5 WL.21: grades and elevations along every feature line, screen only (the selected line keeps its own labels). */
  function gradeLayer(c2d, toScreen, C, sel, font) {
    const items = gradeOverlay(P().state.features || [], toScreen, { skip: sel?.kind === 'feature' ? sel.id : null });
    if (!items.length) return 0;
    c2d.save();
    c2d.font = '600 10.5px ' + font;
    for (const it of items) {
      if (it.kind === 'grade') {
        c2d.save(); c2d.translate(it.x, it.y); c2d.rotate(it.ang);
        const w = c2d.measureText(it.text).width;
        c2d.fillStyle = C.bg; c2d.globalAlpha = 0.85; c2d.fillRect(-w / 2 - 2, -15, w + 4, 12); c2d.globalAlpha = 1;
        c2d.fillStyle = C.green || C.ink; c2d.textAlign = 'center'; c2d.textBaseline = 'bottom'; c2d.fillText(it.text, 0, -4);
        c2d.restore();
        if (it.down !== null) {   // a small arrow on the line, pointing downhill
          const L = 9, ux = Math.cos(it.down), uy = Math.sin(it.down), x = it.x + ux * 4, y = it.y + uy * 4;
          c2d.strokeStyle = C.green || C.ink; c2d.lineWidth = 1.4; c2d.beginPath();
          c2d.moveTo(x - ux * L, y - uy * L); c2d.lineTo(x, y);
          c2d.moveTo(x - ux * 4 - uy * 3, y - uy * 4 + ux * 3); c2d.lineTo(x, y); c2d.lineTo(x - ux * 4 + uy * 3, y - uy * 4 - ux * 3);
          c2d.stroke();
        }
      } else {
        const w = c2d.measureText(it.text).width;
        c2d.fillStyle = C.bg; c2d.globalAlpha = 0.85; c2d.fillRect(it.x + 5, it.y - 14, w + 4, 12); c2d.globalAlpha = 1;
        c2d.fillStyle = C.ink; c2d.textAlign = 'left'; c2d.textBaseline = 'bottom'; c2d.fillText(it.text, it.x + 7, it.y - 3);
      }
    }
    c2d.restore();
    return items.length;
  }
  return { finish, props, sceneItems, pick, grip, overlay, remove, find, gradeLayer };
}
