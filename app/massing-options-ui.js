/* SPDX-License-Identifier: Apache-2.0 */
/**
 * massing-options-ui.js — "Massing options from BimCraft" (0.8 EG.58, CivilCraft side; round 3 session civil_PART_3). Open the `*-massing-options.json` BimCraft's Room program to
 * massing saved, pick one of its alternatives and a parcel, and CivilCraft turns and slides the building until as much of it as possible stands inside the buildable envelope,
 * adds it as a mass (one undo step) and says what the zoning check makes of it. The other direction: the envelope of a parcel goes back to BimCraft as a file. The numbers are
 * massing-options.js (DOM-free, bin/test-civilcraft-massopt.mjs). DOM only; every word is a t() key (mo.*). Calculation aids: the limits are the ones the person typed.
 *
 *   createMassOptions(ctx) → { command(c) → handled }
 *   ctx = { el, root, project, units, say, download(name, blob), fileStem(), select(sel), refresh(), redraw() }
 */
import { t } from './i18n.js';
import { openWin, field, table } from './eg-win.js';
import { readOptions, fitOption, toMass, envelopeFile } from './massing-options.js';
import { cleanZone, envelope, checkMasses } from './zoning.js';
import { massArea, massGfa, MAX_MASSES } from './massing.js';
import { fixed, grouped, unitOf } from './units.js';

export const MASS_OPTION_COMMANDS = ['mass-options'];

export function createMassOptions(ctx) {
  const { el } = ctx;
  const P = () => ctx.project();
  const btn = (label, icon, fn, data) => el('button', { type: 'button', className: 'btn-line btn-sm-cc', [data || 'data-mo-btn']: '', onclick: fn }, el('i', { className: 'bi bi-' + icon, 'aria-hidden': 'true' }), ' ' + label);   // i18n-ignore: icon class
  const area = (v) => grouped(v, 0) + ' ' + unitOf(ctx.units()).area;
  const zoneOf = (id) => (P().state.zoning || []).find((z) => z.parcel === id) || cleanZone({ parcel: id }, P().state.units);

  function open() {
    const S = { opts: null, key: '', parcel: (P().state.parcels || [])[0]?.id || '', msg: '', fit: null, check: null, name: '' };
    openWin(ctx, 'cv-massopt', 'mo.title', (body, w) => {
      const parcels = P().state.parcels || [];
      const file = el('input', { type: 'file', accept: '.json,application/json', hidden: true, 'data-mo-file': '' });
      file.addEventListener('change', async () => {
        const f = file.files[0]; if (!f) return;
        const r = readOptions(f.size > 2e6 ? '' : await f.text());
        S.name = f.name; S.fit = null; S.check = null;
        if (!r.ok) { S.opts = null; S.msg = t(r.error); } else { S.opts = r; S.key = r.options[0].key; S.msg = ''; }
        w.redraw();
      });
      const parts = [el('div', { className: 'cv-row' }, btn(t('mo.open'), 'folder2-open', () => file.click(), 'data-mo-open'), file, el('span', { className: 'cv-muted' }, S.name))];
      if (S.msg) parts.push(el('p', { className: 'cv-note', 'data-mo-msg': '' }, S.msg));
      if (!parcels.length) parts.push(el('p', { className: 'cv-note', 'data-mo-noparcel': '' }, t('mo.noparcel')));
      if (S.opts) {
        const rows = S.opts.options.map((o) => {
          const rb = el('input', { type: 'radio', name: 'mo-opt', value: o.key, checked: o.key === S.key, 'data-mo-opt': o.key });
          rb.addEventListener('change', () => { S.key = o.key; S.fit = null; S.check = null; w.redraw(); });
          return [rb, o.name, String(o.floors), fixed(o.areaM2, 0) + ' m²', fixed(o.gfaM2, 0) + ' m²', o.use];
        });
        parts.push(table(ctx, ['', t('mo.c.name'), t('mo.c.floors'), t('mo.c.footprint'), t('mo.c.gfa'), t('mo.c.use')], rows, 'data-mo-table'));
        parts.push(...(S.opts.notes || []).map((n) => el('p', { className: 'cv-muted' }, t(n.key, n.vars))));
        if (S.opts.program.length) parts.push(el('p', { className: 'cv-muted' }, t('mo.program', { n: S.opts.program.length })));
      }
      if (parcels.length) {
        const holder = { parcel: S.parcel };
        parts.push(el('div', { className: 'cv-props' }, ...field(ctx, t('mo.parcel'), holder, 'parcel', { kind: 'select', options: parcels.map((p) => [p.id, p.name || p.id]), onChange: (v) => { S.parcel = v; S.fit = null; S.check = null; w.redraw(); } })));
      }
      const place = () => {
        const o = S.opts?.options.find((x) => x.key === S.key), par = parcels.find((p) => p.id === S.parcel);
        if (!o || !par) return;
        if ((P().state.masses || []).length >= MAX_MASSES) { S.msg = t('ms.toomany', { n: MAX_MASSES }); w.redraw(); return; }
        const zone = zoneOf(par.id), env = envelope(par, zone);
        if (!env.poly) { S.msg = t('mo.err.noenv'); w.redraw(); return; }
        const fit = fitOption(o, env.poly, P().state.units);
        if (!fit.ok) { S.msg = t(fit.error); w.redraw(); return; }
        const m = toMass(o, fit, { parcel: par.id, units: P().state.units });
        if (!m) { S.msg = t('mo.err.mass'); w.redraw(); return; }
        const id = P().nextId('m');
        P().change(t('mo.undo', { name: o.name }), (st) => { st.masses ||= []; st.masses.push({ ...m, id }); });
        S.fit = fit; S.msg = ''; S.check = checkMasses(par, zone, [P().state.masses.find((x) => x.id === id)]);
        ctx.select?.({ kind: 'mass', id }); ctx.refresh?.(); ctx.say(t('mo.placed', { name: o.name, pct: fixed(fit.inside * 100, 0) }));
        w.redraw();
      };
      const back = () => {
        const par = parcels.find((p) => p.id === S.parcel); if (!par) return;
        const r = envelopeFile(par, zoneOf(par.id), P().state.units);
        if (!r.ok) { S.msg = t('mo.err.noenv'); w.redraw(); return; }
        ctx.download((ctx.fileStem() || 'civilcraft') + '-' + (par.name || par.id).replace(/[^\w.-]+/g, '_') + '-massing-envelope.json', new Blob([JSON.stringify(r.file, null, 1)], { type: 'application/json' }));
        ctx.say(t('mo.saved'));
      };
      parts.push(el('div', { className: 'cv-row' }, ...(S.opts && parcels.length ? [btn(t('mo.place'), 'building-add', place, 'data-mo-place')] : []), ...(parcels.length ? [btn(t('mo.back'), 'box-arrow-up-right', back, 'data-mo-envelope')] : [])));
      if (S.fit) {
        const rows = [[t('mo.r.inside'), fixed(S.fit.inside * 100, 1) + ' %'], [t('mo.r.turn'), fixed(S.fit.rotation, 0) + '°']];
        if (S.fit.outside > 1e-9) rows.push([t('mo.r.outside'), area(S.fit.outside)]);
        parts.push(el('div', { className: 'cv-props', 'data-mo-result': '' }, ...rows.flatMap(([k, v]) => [el('span', { className: 'k' }, k), el('span', { className: 'v' }, v)])));
        const items = S.check?.items || [];
        parts.push(el('ul', { className: 'cv-plainlist', 'data-mo-check': '' }, ...items.map((i) => el('li', {}, t('mo.chk.' + i.key) + ': ' + t(i.ok ? 'mo.chk.ok' : 'mo.chk.no')))), ...(items.length ? [] : [el('p', { className: 'cv-muted' }, t('mo.chk.none'))]));
      }
      parts.push(el('p', { className: 'cv-note' }, el('strong', {}, t('eg.review'))));
      body.replaceChildren(...parts);
    });
  }
  return { command: (c) => (c === 'mass-options' ? (open(), true) : false) };
}
