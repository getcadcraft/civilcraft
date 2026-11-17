/* SPDX-License-Identifier: Apache-2.0 */
/**
 * parking-ui.js — the Parking lot window (0.10 SU.1815): a parking layout inside the selected outline (parcel, pad, closed feature line), graded with falls to drains
 * against the existing ground, paved and planted through the Landscape workspace. The numbers are parking.js's (bin/test-civilcraft-sitegen.mjs); what goes into the
 * project is parking-apply.js's, the same as the assistant tools. Every build, rebuild and removal is one undo step (state.parking + the Landscape objects it made).
 *
 *   createParking(ctx) → { command(c) → handled, sceneItems(mm), open(), refreshWindow() }
 *   ctx = { root, el, project, units, say, refocus, download(name, blob), fileStem(), selected() → { kind, id, name, pts } | null, groundAt(x, y), seed() → plant rows, refresh() }
 */
import { t } from './i18n.js';
import { LAYERS } from './scene.js';
import * as K from './parking.js';
import { buildLot, removeLot, computeLot } from './parking-apply.js';
import { fixed } from './units.js';
/** A field name (`stallW`) as the lower-case words of its language key (`stall-w`). */
const kb = (k) => k.replace(/[A-Z]/g, (c) => '-' + c.toLowerCase());

for (const [name, key, aci] of K.LAYER_DEFS) if (!LAYERS.some((l) => l.name === name)) LAYERS.push({ name, token: 'ink2', aci, get label() { return t(key); } });

export function createParking(ctx) {
  const { el } = ctx;
  const P = () => ctx.project(), U = () => (ctx.units() === 'm' ? 'm' : 'ft');
  const zAt = (x, y) => { const z = ctx.groundAt(x, y); return Number.isFinite(z) ? z : null; };
  const cache = new Map();   // record json → computed lot (the layout is worked out again only when the record changes)
  const calc = (rec) => { const k = JSON.stringify([rec.boundary, rec.opts, U(), P().state.landscape?.grading?.length]); let c = cache.get(rec.id); if (!c || c.k !== k) { c = { k, v: computeLot(rec, { units: U(), zAt }) }; cache.set(rec.id, c); } return c.v; };
  let dlg = null, form = { angle: 90, region: 'us', traffic: '' };

  function readForm(box) {
    const o = { angle: Number(form.angle), region: form.region };
    if (form.traffic) o.traffic = form.traffic;
    for (const k of ['stallW', 'stallL', 'aisleW', 'islandW', 'fallPct', 'drainSpacing', 'setback']) { const n = Number(form[k]); if (form[k] !== undefined && form[k] !== '' && n > 0) o[k] = n; }
    if (form.maxRun !== undefined && form.maxRun !== '' && Number.isInteger(Number(form.maxRun))) o.maxRun = Number(form.maxRun);
    if (form.accessible !== undefined && form.accessible !== '' && Number.isInteger(Number(form.accessible))) o.accessible = Number(form.accessible);
    if (form.orientation !== undefined && form.orientation !== '' && Number.isFinite(Number(form.orientation))) o.orientation = Number(form.orientation);
    o.endIslands = form.endIslands !== false; o.grade = form.grade !== false; o.paving = form.paving !== false; o.planting = form.planting !== false;
    void box; return o;
  }
  function make(id) {
    const g = id ? null : ctx.selected();
    const old = id ? (P().state.parking || []).find((r) => r.id === id) : null;
    const boundary = old ? old.boundary : g?.pts;
    if (!boundary || boundary.length < 3) { ctx.say(t('pk.err.nosel')); return; }
    const r = buildLot(P(), { id: old?.id, name: g?.name, boundary, opts: readForm() }, { zAt, seed: ctx.seed() });
    if (!r.ok) { ctx.say(t('pk.err.' + (r.problems[0]?.code || 'nofit'))); return; }
    const c = r.layout.counts;
    ctx.say(t('pk.made', { n: c.total, acc: c.accessible })); render(); ctx.refresh();
  }
  function csv(rec) { const lay = calc(rec).layout; ctx.download(ctx.fileStem() + '-parking-' + rec.id + '.csv', new Blob(['﻿' + K.scheduleCsv(lay, U())], { type: 'text/csv' })); }
  const problemText = (p) => t('pk.p.' + p.code, { have: fixed(p.have ?? 0, 2), need: fixed(p.need ?? 0, 2), limit: fixed(p.limit ?? 0, 2), step: fixed(p.step ?? 0, 2), tol: fixed(p.tol ?? 0, 2), u: U() });

  function render() {
    if (!dlg) return;
    const body = dlg.querySelector('[data-pk-body]'), u = U(), sq = u === 'm' ? 'm²' : 'ft²';
    const rows = (P().state.parking || []).map((rec) => {
      const { layout: L, drains, grade } = calc(rec), c = L.counts, a = L.area;
      const vol = grade ? t('pk.vol', { cut: fixed(grade.cut, 0), fill: fixed(grade.fill, 0), vu: u === 'm' ? 'm³' : 'ft³', step: fixed(grade.edgeStep, 2), u }) : t('pk.nograde');
      const probs = [...L.problems, ...(grade?.problems || [])];
      return el('div', { className: 'cv-card', 'data-pk-row': rec.id },
        el('div', { className: 'cv-row' }, el('strong', {}, rec.name || rec.id),
          el('button', { type: 'button', className: 'cv-x', 'aria-label': t('pk.remove'), 'data-pk-remove': rec.id, onclick: () => { removeLot(P(), rec.id); cache.delete(rec.id); render(); ctx.refresh(); } }, el('i', { className: 'bi bi-x', 'aria-hidden': 'true' }))),
        el('p', { className: 'cv-note', 'data-pk-sum': '' }, t('pk.sum', { n: c.total, std: c.standard, acc: c.accessible, van: c.van, need: c.required, isl: c.islands, drains: drains.length, per: a.perStall ? fixed(a.perStall, 0) : '-', sq, ang: L.angle, ori: fixed(L.orientation ?? 0, 0) })),
        el('p', { className: 'cv-note', 'data-pk-vol': '' }, vol),
        probs.length ? el('ul', { className: 'cv-note', 'data-pk-problems': '' }, ...probs.map((p) => el('li', {}, problemText(p)))) : '',
        el('div', { className: 'cv-row' }, el('button', { type: 'button', className: 'btn-line btn-sm-cc', 'data-pk-rebuild': rec.id, onclick: () => make(rec.id) }, t('pk.rebuild')), el('button', { type: 'button', className: 'btn-line btn-sm-cc', 'data-pk-csv': rec.id, onclick: () => csv(rec) }, t('pk.csv'))));
    });
    body.replaceChildren(rows.length ? el('div', {}, ...rows) : el('p', { className: 'cv-note' }, t('pk.none')));
  }
  function open() {
    if (dlg) { dlg.remove(); dlg = null; }
    const id = 'cv-pk', D = K.defaults(U(), { region: form.region, angle: Number(form.angle) });
    const fld = (k, def, w = '4.5rem') => { const i = el('input', { type: 'text', className: 'cv-input', id: id + '-' + k, placeholder: String(def), style: 'width:' + w, value: form[k] === undefined ? '' : String(form[k]), onchange: () => { form[k] = i.value; } }); return el('label', { for: id + '-' + k }, t('pk.f.' + kb(k), { u: U() }), ' ', i); };
    const chk = (k, def) => { const i = el('input', { type: 'checkbox', checked: form[k] === undefined ? def : form[k] !== false, ['data-pk-' + k]: '', onchange: () => { form[k] = i.checked; } }); return el('label', {}, i, ' ', t('pk.f.' + kb(k))); };
    const angle = el('select', { className: 'cv-select', 'data-pk-angle': '', 'aria-label': t('pk.f.angle'), onchange: () => { form.angle = angle.value; open(); } }, ...K.ANGLES.map((a) => el('option', { value: a, selected: Number(form.angle) === a }, a === 0 ? t('pk.parallel') : a + '°')));
    const region = el('select', { className: 'cv-select', 'data-pk-region': '', 'aria-label': t('pk.f.region'), onchange: () => { form.region = region.value; open(); } }, ...['us', 'custom'].map((r) => el('option', { value: r, selected: form.region === r }, t('pk.r.' + r))));
    const traffic = el('select', { className: 'cv-select', 'aria-label': t('pk.f.traffic'), onchange: () => { form.traffic = traffic.value; } }, el('option', { value: '' }, t('pk.o.auto')), ...['one', 'two'].map((o) => el('option', { value: o, selected: form.traffic === o }, t('pk.o.' + o))));
    const close = el('button', { type: 'button', className: 'cv-x', 'aria-label': t('tv.close') }, el('i', { className: 'bi bi-x-lg', 'aria-hidden': 'true' }));
    dlg = el('dialog', { className: 'cv-dialog cv-pcdlg', 'aria-labelledby': id + '-h', 'data-pk-dialog': '' }, el('div', { className: 'cv-dlg' },
      el('div', { className: 'cv-dlg-head' }, el('h2', { className: 'cv-h', id: id + '-h' }, t('pk.title')), close),
      el('div', { className: 'cv-dlg-body' }, el('p', { className: 'cv-note' }, t('pk.lede')),
        el('div', { className: 'cv-row' }, region, angle, traffic),
        el('div', { className: 'cv-row' }, fld('stallW', D.stallW), fld('stallL', D.stallL), fld('aisleW', D.aisleW), fld('islandW', D.islandW), fld('maxRun', D.maxRun), fld('accessible', t('pk.o.auto')), fld('orientation', t('pk.o.auto'))),
        el('div', { className: 'cv-row' }, fld('fallPct', D.fallPct), fld('drainSpacing', D.drainSpacing), chk('endIslands', true), chk('grade', true), chk('paving', true), chk('planting', true)),
        el('p', { className: 'cv-note', 'data-pk-tables': '' }, t(form.region === 'custom' ? 'pk.tables.custom' : 'pk.tables.us')),
        el('div', { className: 'cv-row' }, el('button', { type: 'button', className: 'btn-plot btn-sm-cc', 'data-pk-build': '', onclick: () => make(null) }, t('pk.build'))),
        el('div', { 'data-pk-body': '' }))));
    close.onclick = () => dlg.close();
    dlg.addEventListener('close', () => { dlg.remove(); dlg = null; ctx.refocus(); });
    ctx.root.append(dlg); render(); dlg.showModal();
  }
  return {
    command(c) { if (c === 'parking') { open(); return true; } return false; },
    sceneItems: (mm) => (P().state.parking || []).flatMap((rec) => { const { layout, drains } = calc(rec); return K.sceneItems(layout, drains, { mmPerUnit: mm }); }),
    open, refreshWindow: () => render(),
  };
}
