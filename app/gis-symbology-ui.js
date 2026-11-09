/* SPDX-License-Identifier: Apache-2.0 */
/**
 * gis-symbology-ui.js — symbology by attribute (0.9 SU.1080 round 2): the "Style by attribute" dialog of a GIS layer (layer menu), the
 * polygon fill under the plan's lines, and the legend drawn on the plan. gis-ui.js installs it: install(host). The classes come from
 * gis-symbology.js (a copy of lib/gis/), the scene from gis-layers.js (one scene layer per class, so PDF, DXF and DWG carry them).
 * Text only goes in through textContent. host.symbology = { open(layerId), apply(layerId, spec|null), legend(layerId) } for tests.
 */

import { gisOf, layerOf, featuresOf, setLayer, symbologyOf, boxesOf } from './gis-layers.js';
import { compile, cleanSymbology, defaults, RAMPS, RAMP_IDS, rampColors, METHODS, MAX_CLASSES } from './gis-symbology.js';
import { t } from './i18n.js';

const FONT = 'system-ui, sans-serif';   // i18n-ignore: CSS font
const KINDS = { pt: 'vec.kind.pt', ln: 'vec.kind.ln', pg: 'vec.kind.pg' };

export async function install(host) {
  const { reg, el } = host;
  const P = () => host.project;
  const api = { open: null, apply: null, legend: null };
  let uid = 0;

  // ------------------------------------------------------------------------------------------------ labels of the classes
  const classLabel = (c) => (c.kind === 'none' ? t('gis.sym.none') : c.kind === 'other' ? t('gis.sym.other', { n: c.n || 0 }) : c.label === '' ? t('gis.sym.blank') : c.label);
  api.legend = (id) => {
    const l = layerOf(P(), id); if (!l) return null;
    const s = symbologyOf(l, featuresOf(P(), id));
    return s ? { title: l.name, field: s.field, mode: s.mode, items: s.classes.map((c) => ({ label: classLabel(c), color: c.color, count: c.count })), size: s.sizeRange || null, note: s.note } : null;
  };

  // ------------------------------------------------------------------------------------------------ polygon fill, under the lines
  (reg.underlay ||= []).push((ctx, v) => {
    const vb = v.viewBounds();
    for (const l of gisOf(P()).layers) {
      if (!l.visible || l.geom !== 'pg' || !l.symbology?.fill) continue;
      const fs = featuresOf(P(), l.id), s = symbologyOf(l, fs);
      if (!s) continue;
      const box = boxesOf(fs), paths = new Map();
      const color = (j) => (s.classes.length ? s.classes[s.classOf[j]]?.color : null) || v.colorOf(l.color);
      for (let i = 0; i < fs.length; i++) {
        const g = fs[i].g;
        if (!g || g.t !== 'pg') continue;
        if (box[i * 4 + 2] < vb.minX || box[i * 4] > vb.maxX || box[i * 4 + 3] < vb.minY || box[i * 4 + 1] > vb.maxY) continue;
        const c = color(i);
        let p = paths.get(c); if (!p) paths.set(c, (p = new Path2D()));
        for (const poly of g.c) for (const r of poly) r.forEach((pt, k) => { const q = v.toScreen(pt[0], pt[1]); if (k) p.lineTo(q.x, q.y); else p.moveTo(q.x, q.y); });
      }
      ctx.save(); ctx.globalAlpha = v.dark ? 0.5 : 0.45;
      for (const [c, p] of paths) { ctx.fillStyle = c; ctx.fill(p, 'evenodd'); }
      ctx.restore();
    }
  });

  // ------------------------------------------------------------------------------------------------ legend on the plan (screen)
  (reg.overlay ||= []).push((ctx, v) => {
    const blocks = [];
    for (const l of gisOf(P()).layers) {
      if (!l.visible || !l.symbology || l.symbology.legend === false) continue;
      const g = api.legend(l.id);
      if (g && (g.items.length || g.size)) blocks.push(g);
    }
    if (!blocks.length) return;
    const C = v.colors, pad = 8, sw = 12, lh = 17, fs = 12;
    ctx.save();
    ctx.font = '600 ' + fs + 'px ' + FONT; ctx.textBaseline = 'middle';
    const rows = [];   // {text, color?, bold}
    for (const b of blocks) {
      rows.push({ text: b.field ? t('gis.sym.legend.head', { layer: b.title, field: b.field }) : b.title, bold: true });
      for (const it of b.items.slice(0, 14)) rows.push({ text: it.label + ' (' + it.count + ')', color: it.color });
      if (b.items.length > 14) rows.push({ text: t('gis.sym.legend.more', { n: b.items.length - 14 }) });
      if (b.size) rows.push({ text: t('gis.sym.legend.size', { field: b.size.field, min: +b.size.min.toPrecision(4), max: +b.size.max.toPrecision(4) }) });
    }
    ctx.font = '12px ' + FONT;
    const w = Math.min(320, Math.max(...rows.map((r) => ctx.measureText(r.text).width)) + sw + pad * 3), h = rows.length * lh + pad * 2;
    const x0 = 12, y0 = v.h - h - 12;
    ctx.globalAlpha = 0.92; ctx.fillStyle = C.bg; ctx.fillRect(x0, y0, w, h); ctx.globalAlpha = 1;
    ctx.strokeStyle = C.line; ctx.lineWidth = 1; ctx.strokeRect(x0 + 0.5, y0 + 0.5, w, h);
    rows.forEach((r, k) => {
      const y = y0 + pad + k * lh + lh / 2;
      ctx.font = (r.bold ? '600 ' : '') + fs + 'px ' + FONT; ctx.fillStyle = C.ink;
      if (r.color) { ctx.fillStyle = r.color; ctx.fillRect(x0 + pad, y - sw / 2 + 1, sw, sw - 2); ctx.strokeStyle = C.line; ctx.strokeRect(x0 + pad + 0.5, y - sw / 2 + 1.5, sw - 1, sw - 3); ctx.fillStyle = C.ink; }
      ctx.fillText(r.text, x0 + pad + (r.color ? sw + 6 : 0), y, w - pad * 2 - (r.color ? sw + 6 : 0));
    });
    ctx.restore();
  });

  // ------------------------------------------------------------------------------------------------ the dialog
  function open(layerId) {
    const layer = layerOf(P(), layerId);
    if (!layer) return null;
    const feats = featuresOf(P(), layerId);
    const id = 'cv-gsym-' + (++uid), cur = { ...defaults(), ...(layer.symbology || {}) };
    const row = (label, input, forId) => el('div', { className: 'cv-props' }, el('label', { for: forId }, label), input);
    const mode = el('select', { className: 'cv-select', id: id + 'm', 'data-gsym-mode': '' }, ...['single', 'categorized', 'graduated'].map((m) => el('option', { value: m }, t('gis.sym.mode.' + m))));
    const field = el('select', { className: 'cv-select', id: id + 'f', 'data-gsym-field': '' });
    const method = el('select', { className: 'cv-select', id: id + 'me', 'data-gsym-method': '' }, ...METHODS.map((m) => el('option', { value: m }, t('gis.sym.method.' + m))));
    const classes = el('input', { type: 'number', className: 'cv-input', id: id + 'c', min: 2, max: MAX_CLASSES, step: 1, 'data-gsym-classes': '' });
    const ramp = el('select', { className: 'cv-select', id: id + 'r', 'data-gsym-ramp': '' }, ...RAMP_IDS.map((r) => el('option', { value: r }, t('gis.sym.ramp.' + r))));
    const strip = el('div', { className: 'cv-gsym-strip', 'aria-hidden': 'true' });
    const rev = el('input', { type: 'checkbox', id: id + 'rv', 'data-gsym-reverse': '' });
    const sizeF = el('select', { className: 'cv-select', id: id + 's', 'data-gsym-size': '' });
    const sMin = el('input', { type: 'number', className: 'cv-input', id: id + 'smin', min: 0.2, max: 6, step: 0.1, 'data-gsym-smin': '' }), sMax = el('input', { type: 'number', className: 'cv-input', id: id + 'smax', min: 0.2, max: 10, step: 0.1, 'data-gsym-smax': '' });
    const fill = el('input', { type: 'checkbox', id: id + 'fl', 'data-gsym-fill': '' }), leg = el('input', { type: 'checkbox', id: id + 'lg', 'data-gsym-legend': '' });
    const preview = el('div', { className: 'cv-table-wrap', 'data-gsym-preview': '' }), note = el('p', { className: 'cv-note', role: 'status', 'data-gsym-note': '' });

    const rM = row(t('gis.sym.mode'), mode, id + 'm'), rF = row(t('gis.sym.field'), field, id + 'f'), rMe = row(t('gis.sym.method'), method, id + 'me'), rC = row(t('gis.sym.classes'), classes, id + 'c');
    const rR = row(t('gis.sym.ramp'), el('div', {}, ramp, strip), id + 'r'), rRv = el('label', { className: 'cv-check', for: id + 'rv' }, rev, ' ' + t('gis.sym.reverse'));
    const numFields = layer.fields.filter((f) => f.type === 'number');
    sizeF.append(el('option', { value: '' }, t('gis.sym.size.none')), ...numFields.map((f) => el('option', { value: f.name }, f.name)));
    const rS = row(t('gis.sym.size'), sizeF, id + 's'), rSm = el('div', { className: 'cv-props' }, el('label', { for: id + 'smin' }, t('gis.sym.size.range')), el('span', { className: 'cv-gsym-pair' }, sMin, sMax));
    const rFill = el('label', { className: 'cv-check', for: id + 'fl' }, fill, ' ' + t('gis.sym.fill')), rLeg = el('label', { className: 'cv-check', for: id + 'lg' }, leg, ' ' + t('gis.sym.legend'));

    function fillFields() {
      const keep = field.value;
      const list = mode.value === 'graduated' ? numFields : layer.fields;
      field.replaceChildren(...list.map((f) => el('option', { value: f.name }, f.name)));
      field.value = list.some((f) => f.name === keep) ? keep : (list.some((f) => f.name === cur.field) ? cur.field : list[0]?.name || '');
    }
    function read() {
      const raw = { mode: mode.value, field: field.value, ramp: ramp.value, method: method.value, classes: parseInt(classes.value, 10), reverse: rev.checked, sizeField: sizeF.value, sizeMin: parseFloat(sMin.value), sizeMax: parseFloat(sMax.value), fill: fill.checked, legend: leg.checked };
      return raw;
    }
    function refresh() {
      const m = mode.value;
      rF.hidden = m === 'single'; rMe.hidden = rC.hidden = m !== 'graduated'; rR.hidden = rRv.hidden = m === 'single';
      rS.hidden = rSm.hidden = layer.geom !== 'pt' || !numFields.length; rFill.hidden = layer.geom !== 'pg';
      const raw = read();
      strip.replaceChildren(...rampColors(raw.ramp, m === 'categorized' ? 8 : Math.max(2, raw.classes || 5), raw.reverse).map((c) => el('span', { style: 'background:' + c })));
      const clean = cleanSymbology(raw, layer.fields);
      preview.replaceChildren(); note.textContent = '';
      if (!clean) { note.textContent = m === 'single' ? t('gis.sym.single.note') : t('gis.sym.nofield'); return; }
      const c = compile({ ...layer, symbology: clean }, feats);
      if (c.mode === 'single' && !c.size) return;
      if (c.classes.length) preview.append(el('table', { className: 'cv-table' }, el('thead', {}, el('tr', {}, el('th', { scope: 'col' }, t('gis.sym.col.class')), el('th', { scope: 'col', className: 'num' }, t('gis.sym.col.count')))),
        el('tbody', {}, ...c.classes.map((k) => el('tr', {}, el('td', {}, el('span', { className: 'cv-swatch', style: 'background:' + k.color, 'aria-hidden': 'true' }), ' ' + classLabel(k)), el('td', { className: 'num' }, String(k.count)))))));
      note.textContent = (c.note === 'approx' ? t('gis.sym.approx') + ' ' : c.note === 'other' ? t('gis.sym.manyvalues') + ' ' : '') + (feats.length > 200000 ? t('gis.sym.toomany') : '');
    }
    mode.value = cur.mode; fillFields(); method.value = cur.method; classes.value = String(cur.classes); ramp.value = cur.mode === 'categorized' && !layer.symbology ? 'okabe' : cur.ramp; rev.checked = cur.reverse;
    sizeF.value = cur.sizeField; sMin.value = String(cur.sizeMin); sMax.value = String(cur.sizeMax); fill.checked = cur.fill; leg.checked = cur.legend !== false;
    mode.addEventListener('change', () => { fillFields(); if (mode.value === 'categorized' && !RAMPS[ramp.value]?.kind.startsWith('cat') && !layer.symbology) ramp.value = 'okabe'; if (mode.value === 'graduated' && ramp.value === 'okabe') ramp.value = 'viridis'; refresh(); });
    for (const x of [field, method, classes, ramp, rev, sizeF, sMin, sMax, fill, leg]) x.addEventListener('input', refresh);

    const close = el('button', { type: 'button', className: 'cv-x', 'aria-label': t('vec.close') }, el('i', { className: 'bi bi-x-lg', 'aria-hidden': 'true' }));
    const ok = el('button', { type: 'button', className: 'btn-plot btn-sm-cc', 'data-gsym-apply': '' }, t('gis.sym.apply'));
    const reset = el('button', { type: 'button', className: 'btn-line btn-sm-cc', 'data-gsym-reset': '' }, t('gis.sym.reset'));
    const cancel = el('button', { type: 'button', className: 'btn-line btn-sm-cc' }, t('vec.cancel'));
    const dlg = el('dialog', { className: 'cv-dialog cv-gisv cv-gsym', 'aria-labelledby': id, 'data-gsym': '' },
      el('div', { className: 'cv-dlg' }, el('div', { className: 'cv-dlg-head' }, el('h2', { className: 'cv-h', id }, t('gis.sym.title', { layer: layer.name })), close),
        el('div', { className: 'cv-dlg-body' }, el('p', { className: 'cv-note' }, t('gis.sym.lead', { kind: t(KINDS[layer.geom]) })), rM, rF, rMe, rC, rR, rRv, rS, rSm, rFill, rLeg, preview, note),
        el('div', { className: 'cv-dlg-foot' }, reset, cancel, ok)));
    const shut = () => dlg.close();
    close.onclick = cancel.onclick = shut;
    dlg.addEventListener('close', () => { dlg.remove(); host.refocus(); });
    ok.onclick = () => { const r = apply(layerId, read()); if (r) shut(); else note.textContent = t('gis.sym.nofield'); };
    reset.onclick = () => { apply(layerId, null); shut(); };
    host.root.append(dlg); refresh(); dlg.showModal(); mode.focus();
    return dlg;
  }
  /** spec (plain object) or null (back to the layer's colour): one undo step. Returns false when the spec says nothing usable. */
  function apply(layerId, spec) {
    const l = layerOf(P(), layerId);
    if (!l) return false;
    if (spec !== null && !cleanSymbology(spec, l.fields)) { if (spec.mode && spec.mode !== 'single') return false; return setLayer(P(), layerId, { symbology: null }); }
    const ok = setLayer(P(), layerId, { symbology: spec });
    if (ok) host.view?.invalidateScene?.();
    return ok;
  }
  api.open = open; api.apply = apply;
  host.symbology = api;
  void gisOf;
}
