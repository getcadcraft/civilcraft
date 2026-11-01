/* SPDX-License-Identifier: Apache-2.0 */
/**
 * ground-ui.js — "Terrain from contour lines" (0.8 SU.911, lab) and the cloud-to-ground dialog (SU.935, added below it in
 * the same file). The numbers are ground-surface.js (bin/test-civilcraft-ground.mjs); this file is the dialog.
 *
 *   createGround(ctx) → { command(c) → handled }
 *   ctx = { root, el, project: () => Project, say(msg) }
 *
 * Contours come from the project's GIS line layers (a DXF/DWG, shapefile or GeoJSON opened as linework). Elevation: the lines'
 * own (z or a number field), or a start + interval in the order the lines are listed. "Check" lists what is wrong (no level,
 * duplicates, crossings, levels off the interval) before "Build". Build adds the lines as breaklines (one undo step) and, with
 * "fix flat triangles", sets the surface's flatFix interval. A layer can also be scaled and placed by two known points.
 */

import { t } from './i18n.js';
import { gisOf, featuresOf, layerOf } from './gis-layers.js';
import { levelOf, checkContours, groundFromContours, placeByTwoPoints } from './ground-surface.js';

const MAX_SHOWN = 12;

export function createGround(ctx) {
  const { el } = ctx;
  const P = () => ctx.project();
  const lineLayers = () => (gisOf(P()).layers || []).filter((l) => l.geom === 'ln' || l.geom === 'pg');

  /** The chosen layers' features as contour lines [{ name, pts, z, layer, feature }]. */
  function linesOf(ids, from, field, start, interval) {
    const out = [];
    for (const id of ids) {
      const l = layerOf(P(), id);
      if (!l) continue;
      featuresOf(P(), id).forEach((f, fi) => {
        if (!f.g || f.g.t === 'pt') return;
        for (const part of f.g.t === 'ln' ? f.g.c : f.g.c.flat()) {
          const pts = part.map((p) => ({ x: p[0], y: p[1], z: p.length > 2 ? p[2] : undefined }));
          const line = { name: (l.name + ' ' + (fi + 1)).slice(0, 120), pts, layer: id, feature: fi };
          if (from === 'field') { const v = f.p?.[field]; line.z = typeof v === 'number' && Number.isFinite(v) ? v : null; }
          else if (from === 'pick') line.z = start + out.length * interval;
          else line.z = levelOf({ pts });
          out.push(line);
        }
      });
    }
    return out;
  }

  const words = (i) => t('sx.su911.issue.' + i.code, { a: i.a + 1, b: (i.b ?? 0) + 1, x: Number.isFinite(i.x) ? i.x.toFixed(2) : '', y: Number.isFinite(i.y) ? i.y.toFixed(2) : '', z: i.z ?? '', zb: i.zb ?? '' });

  function dialog() {
    const layers = lineLayers();
    if (!layers.length) { ctx.say(t('sx.su911.nolayers')); return; }
    const did = 'cv-ground-h';
    const close = el('button', { type: 'button', className: 'cv-x', 'aria-label': t('sx.su957.close') }, el('i', { className: 'bi bi-x-lg', 'aria-hidden': 'true' }));
    const checks = layers.map((l) => el('label', { className: 'cv-check' }, el('input', { type: 'checkbox', value: l.id, checked: true, 'data-ground-layer': '' }), ' ', l.name));
    const fieldNames = [...new Set(layers.flatMap((l) => l.fields.filter((f) => f.type === 'number').map((f) => f.name)))];
    const from = el('select', { id: 'cv-ground-from', 'data-ground-from': '' },
      el('option', { value: 'z' }, t('sx.su911.from.z')),
      ...fieldNames.map((n) => el('option', { value: 'field:' + n }, t('sx.su911.from.field', { f: n }))),
      el('option', { value: 'pick' }, t('sx.su911.from.pick')));
    const num = (id, v, data) => el('input', { type: 'number', id, value: String(v), step: 'any', ['data-ground-' + data]: '' });
    const start = num('cv-ground-start', 0, 'start'), interval = num('cv-ground-interval', 1, 'interval'), simplify = num('cv-ground-simplify', 0, 'simplify');
    const fix = el('input', { type: 'checkbox', id: 'cv-ground-fix', checked: true, 'data-ground-fix': '' });
    const drop = el('input', { type: 'checkbox', id: 'cv-ground-drop', 'data-ground-drop': '' });
    const out = el('div', { className: 'cv-note', 'data-ground-out': '', role: 'status' });
    const params = () => {
      const v = from.value;
      return { ids: checks.map((c) => c.querySelector('input')).filter((i) => i.checked).map((i) => i.value), from: v.startsWith('field:') ? 'field' : v, field: v.startsWith('field:') ? v.slice(6) : null,
        start: Number(start.value) || 0, interval: Number(interval.value) || 0, simplify: Number(simplify.value) || 0, fix: fix.checked, drop: drop.checked };
    };
    const run = () => {
      const p = params(), lines = linesOf(p.ids, p.from, p.field, p.start, p.interval);
      return { p, lines, res: groundFromContours(lines, { interval: p.interval, simplify: p.simplify, dropCrossing: p.drop, fixFlat: p.fix && p.interval > 0 }) };
    };
    const show = (r) => {
      const n = r.res.issues.length;
      out.replaceChildren(el('p', {}, t('sx.su911.summary', { used: r.res.used.length, dropped: r.res.dropped.length, n })),
        ...(r.res.surface ? [el('p', {}, t('sx.su911.surface', { tri: r.res.surface.nT, flat: r.res.report.flatPoints || 0 }))] : [el('p', {}, r.res.report.errors[0] || t('sx.su911.nosurface'))]),
        el('ul', { className: 'cv-plainlist', 'data-ground-issues': '' }, ...r.res.issues.slice(0, MAX_SHOWN).map((i) => el('li', {}, words(i))), ...(n > MAX_SHOWN ? [el('li', {}, t('sx.su911.more', { n: n - MAX_SHOWN }))] : [])));
    };
    const btn = (label, fn, data) => el('button', { type: 'button', className: 'btn-line btn-sm-cc', [data]: '', onclick: fn }, label);
    const check = btn(t('sx.su911.check'), () => show(run()), 'data-ground-check');
    const build = btn(t('sx.su911.build'), () => {
      const r = run();
      if (!r.res.breaklines.length) { show(r); return; }
      P().change(t('sx.su911.undo'), (st) => {
        for (const b of r.res.breaklines) st.surface.breaklines.push({ name: b.name, pts: b.pts });
        st.surface.flatFix = r.p.fix && r.p.interval > 0 ? r.p.interval : 0;
      });
      show(r); ctx.say(t('sx.su911.built', { n: r.res.breaklines.length }));
    }, 'data-ground-build');
    // place a layer by two known points
    const pt = (id) => ({ x: num('cv-ground-' + id + 'x', 0, id + 'x'), y: num('cv-ground-' + id + 'y', 0, id + 'y') });
    const A = pt('a'), B = pt('b'), A2 = pt('a2'), B2 = pt('b2');
    const place = btn(t('sx.su911.place'), () => {
      const q = (p) => ({ x: Number(p.x.value), y: Number(p.y.value) });
      const tf = placeByTwoPoints(q(A), q(B), q(A2), q(B2));
      const ids = params().ids;
      if (!tf || !ids.length) { out.replaceChildren(el('p', {}, t('sx.su911.place.bad'))); return; }
      const at = (p) => { const r = tf.apply({ x: p[0], y: p[1] }); return p.length > 2 ? [r.x, r.y, p[2]] : [r.x, r.y]; };
      const move = (g) => (g.t === 'pt' ? { ...g, c: at(g.c) } : g.t === 'ln' ? { ...g, c: g.c.map((l) => l.map(at)) } : { ...g, c: g.c.map((poly) => poly.map((ring) => ring.map(at))) });
      P().editGis(t('sx.su911.place.undo'), (map) => { for (const id of ids) map.set(id, (map.get(id) || []).map((f) => ({ g: move(f.g), p: f.p }))); return map; });
      out.replaceChildren(el('p', {}, t('sx.su911.placed', { k: tf.k.toFixed(6), deg: (tf.rot * 180 / Math.PI).toFixed(3) })));
      ctx.say(t('sx.su911.placed', { k: tf.k.toFixed(6), deg: (tf.rot * 180 / Math.PI).toFixed(3) }));
    }, 'data-ground-place');
    const lab = (txt, input) => el('label', { className: 'cv-field', for: input.id }, txt, ' ', input);
    const dlg = el('dialog', { className: 'cv-dialog', id: did, 'aria-labelledby': did + '-t', 'data-ground-dialog': '' },
      el('div', { className: 'cv-dlg' },
        el('div', { className: 'cv-dlg-head' }, el('h2', { className: 'cv-h', id: did + '-t' }, t('sx.su911.title')), close),
        el('div', { className: 'cv-dlg-body' },
          el('p', { className: 'cv-note' }, t('sx.su911.lede')),
          el('fieldset', {}, el('legend', {}, t('sx.su911.layers')), ...checks),
          lab(t('sx.su911.from'), from), lab(t('sx.su911.start'), start), lab(t('sx.su911.interval'), interval), lab(t('sx.su911.simplify'), simplify),
          el('label', { className: 'cv-check' }, fix, ' ', t('sx.su911.fix')), el('label', { className: 'cv-check' }, drop, ' ', t('sx.su911.drop')),
          el('details', {}, el('summary', {}, t('sx.su911.place.head')), el('p', { className: 'cv-note' }, t('sx.su911.place.lede')),
            lab(t('sx.su911.pa'), A.x), A.y, lab(t('sx.su911.pb'), B.x), B.y, lab(t('sx.su911.pa2'), A2.x), A2.y, lab(t('sx.su911.pb2'), B2.x), B2.y, place),
          out),
        el('div', { className: 'cv-dlg-foot' }, check, build, btn(t('sx.su957.close'), () => dlg.close(), 'data-ground-close'))));
    close.onclick = () => dlg.close();
    dlg.addEventListener('close', () => dlg.remove());
    ctx.root.append(dlg);
    dlg.showModal();
  }

  function command(c) {
    if (c === 'ground-contours') { dialog(); return true; }
    return false;
  }
  return { command };
}
