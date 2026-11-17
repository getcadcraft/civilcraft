/* SPDX-License-Identifier: Apache-2.0 */
/**
 * compare-ui.js — "Compare with model" and "Check scale and level" in the Point clouds add-on (0.10 SU.1809). Canonical in
 * lib/pointcloud-hosts/, copied byte for byte into the add-on folder of an app whose host can hand over its model (BimCraft) by
 * tools/pointcloud-adapters/sync.mjs. The engine does the work (lib/compare.js, lib/scan-check.js); this is the fold that asks for it.
 *
 *   mountCompare(ctx, host) → <details> fold     host (hosts/<app>.js) gives:
 *     model(ctx) → { elements: [{ key, name, guid, tris }] } | null       the model's elements as triangles in the cloud's Z-up scene frame, metres
 *     modelBounds(ctx) → { min, max } | null
 *     showSample(ctx, report, rgb) / clearSample(ctx)                     the compared points drawn in the 3D view, coloured by band
 *     select(keys)                                                        pick elements in the app
 *     verify(keys, { note }) → n | null                                   BK.49: mark elements field-verified (method scan); absent = no button
 */
import { el, field, numInput, download } from './ui.js';
import { fmtN } from './ctx.js';
import { compareWithModel, colorize, bandColor, fieldVerifiable, reportCsv } from './lib/compare.js';
import { checkScan } from './lib/scan-check.js';

const mm = (v) => (v * 1000).toFixed(v < 0.01 ? 1 : 0);

export function mountCompare(ctx, host) {
  const t = ctx.t;
  let report = null, ac = null;
  const tol = numInput(20, { min: 1, max: 500, step: 1, 'data-pcx-tol': '' });
  const out = el('div', { className: 'pc-note', role: 'status', 'data-pcx-cmp-out': '' });
  const legend = el('ul', { className: 'pc-list', 'data-pcx-legend': '' });
  const table = el('div', { 'data-pcx-table': '' });
  const checkOut = el('div', { className: 'pc-note', role: 'status', 'data-pcx-check-out': '' });
  const run = el('button', { type: 'button', className: 'btn-plot', disabled: true, 'data-pcx-run': '', onclick: () => compare() }, t('pcx.cmp.run'));
  const cancel = el('button', { type: 'button', className: 'btn-line', hidden: true, onclick: () => ac && ac.abort() }, t('pc.cancel'));
  const check = el('button', { type: 'button', className: 'btn-line', disabled: true, 'data-pcx-check': '', onclick: () => checkNow() }, t('pcx.cmp.check'));
  const show = el('button', { type: 'button', className: 'btn-line', disabled: true, 'data-pcx-show': '', onclick: () => { if (report) host.showSample(ctx, report, colorize(report)); } }, t('pcx.cmp.show'));
  const hide = el('button', { type: 'button', className: 'btn-line', disabled: true, onclick: () => host.clearSample(ctx) }, t('pcx.cmp.hide'));
  const pickOut = el('button', { type: 'button', className: 'btn-line', disabled: true, 'data-pcx-pick': '', onclick: () => host.select(report.elements.filter((e) => e.state === 'outside').map((e) => e.key)) }, t('pcx.cmp.pick'));
  const verify = host.verify ? el('button', { type: 'button', className: 'btn-line', disabled: true, 'data-pcx-verify': '', onclick: () => doVerify() }, t('pcx.cmp.verify', { n: 0 })) : null;
  const csvBtn = el('button', { type: 'button', className: 'btn-line', disabled: true, 'data-pcx-csv': '', onclick: () => download('scan-vs-model.csv', '﻿' + reportCsv(report), 'text/csv') }, t('pcx.cmp.csv'));

  const sync = () => {
    const ok = !!ctx.cloud && !!host.model(ctx);
    run.disabled = !ok; check.disabled = !ctx.cloud;
    const has = !!report;
    for (const b of [show, hide, pickOut, csvBtn]) b.disabled = !has;
    if (verify) { const n = has ? fieldVerifiable(report).length : 0; verify.disabled = !n; verify.textContent = t('pcx.cmp.verify', { n }); }
  };
  ctx.on('cloud', () => { report = null; legend.replaceChildren(); table.replaceChildren(); out.textContent = ''; checkOut.textContent = ''; host.clearSample(ctx); sync(); });

  async function sampleOf(limit = 300000) {
    const nodes = ctx.cloud.nodesIn(null), pos = [];
    let n = 0;
    for (const i of nodes) {
      const r = await ctx.cloud.readNode(i, { attrs: [] });
      const T = ctx.placement().T;
      for (let k = 0; k < r.n; k++) pos.push(r.pos[3 * k] + T[0], r.pos[3 * k + 1] + T[1], r.pos[3 * k + 2] + T[2]);
      n += r.n; if (n >= limit) break;
    }
    return { pos: Float64Array.from(pos), n };
  }

  async function checkNow() {
    checkOut.textContent = t('pc.v.working');
    try {
      const s = await sampleOf();
      const unit = ctx.cloud.meta && ctx.cloud.meta.unit ? (ctx.cloud.meta.unit === 'm' ? 'm' : null) : null;
      const r = checkScan({ pos: s.pos, n: s.n, modelBounds: host.modelBounds ? host.modelBounds(ctx) : null, unit });
      const lines = [];
      for (const n of r.notes) {
        const d = n.data || {};
        if (n.code === 'unit_suggested') lines.push(t('pcx.cmp.n.unit', { unit: d.unit, pct: Math.round(100 * d.confidence), basis: t('pcx.cmp.basis.' + d.basis) }));
        else if (n.code === 'up_axis') lines.push(t('pcx.cmp.n.up', { axis: d.axis.toUpperCase() }));
        else if (n.code === 'tilted') lines.push(t('pcx.cmp.n.tilt', { deg: d.tiltDeg.toFixed(1) }));
        else if (n.code === 'no_floor') lines.push(t('pcx.cmp.n.nofloor'));
        else if (n.code === 'size_odd') lines.push(t('pcx.cmp.n.size', { m: Math.round(d.metres) }));
        else if (n.code === 'ok') lines.push(t('pcx.cmp.n.ok'));
      }
      if (r.level.height) lines.push(t('pcx.cmp.n.height', { m: r.level.height.toFixed(2) }));
      checkOut.replaceChildren(...lines.map((l) => el('div', {}, l)));
    } catch (e) { checkOut.textContent = ctx.err(e); }
  }

  async function compare() {
    const model = host.model(ctx);
    if (!model || !model.elements.length) { out.textContent = t('pcx.cmp.nomodel'); return; }
    ac = new AbortController(); run.disabled = true; cancel.hidden = false; out.textContent = t('pc.v.working');
    try {
      const T = ctx.placement().T, tolM = Math.max(0.001, Number(tol.value) / 1000);
      report = await compareWithModel({ cloud: ctx.cloud, offset: T, model, tol: tolM, signal: ac.signal, progress: (f) => { out.textContent = t('pcx.cmp.progress', { pct: Math.round(f * 100) }); } });
      if (!report.ok) { out.textContent = t('pcx.cmp.nomodel'); report = null; return; }
      render();
    } catch (e) { out.textContent = ctx.isAbort(e) ? t('pcx.cmp.cancelled') : ctx.err(e); report = null; }
    finally { cancel.hidden = true; ac = null; sync(); }
  }

  function render() {
    const r = report, tt = r.totals;
    out.textContent = t('pcx.cmp.summary', { tested: fmtN(r.points.tested), within: tt.within, outside: tt.outside, partial: tt.partial, unseen: tt.unseen, unmatched: fmtN(r.points.unmatched), tol: Math.round(r.tol * 1000) });
    const names = r.bands.map((b, i) => (i === 0 ? t('pcx.cmp.band.first', { mm: mm(b) }) : t('pcx.cmp.band.between', { a: mm(r.bands[i - 1]), b: mm(b) })));
    names.push(t('pcx.cmp.band.beyond', { mm: mm(r.bands[r.bands.length - 1]) }));
    legend.replaceChildren(...names.map((n, i) => { const c = bandColor(i, names.length); return el('li', {}, el('span', { style: `display:inline-block;width:.8em;height:.8em;margin-right:.4em;background:rgb(${c.join(',')})` }), n + ' · ' + Math.round(100 * r.bandShare[i]) + ' %'); }));
    const order = { outside: 0, partial: 1, within: 2, unseen: 3 };
    const rows = r.elements.slice().sort((a, b) => order[a.state] - order[b.state] || b.mean - a.mean).slice(0, 300);
    const th = (k) => el('th', {}, t('pcx.cmp.col.' + k));
    table.replaceChildren(el('table', { className: 'cc-table' }, el('thead', {}, el('tr', {}, th('name'), th('state'), th('mean'), th('max'), th('n'))),
      el('tbody', {}, ...rows.map((e) => el('tr', { 'data-pcx-row': e.key, onclick: () => host.select([e.key]) }, el('td', {}, e.name || '#' + e.key), el('td', {}, t('pcx.cmp.state.' + e.state)), el('td', {}, e.n ? mm(e.mean) : '–'), el('td', {}, e.n ? mm(e.max) : '–'), el('td', {}, fmtN(e.n)))))));
    if (r.elements.length > rows.length) table.append(el('p', { className: 'pc-note' }, t('pcx.cmp.more', { n: r.elements.length - rows.length })));
    host.showSample(ctx, r, colorize(r));
  }

  async function doVerify() {
    const keys = fieldVerifiable(report);
    const n = host.verify(keys, { note: t('pcx.cmp.vnote', { tol: Math.round(report.tol * 1000) }) });
    out.textContent = t('pcx.cmp.verified', { n: n == null ? keys.length : n });
  }

  sync();
  return el('details', { 'data-pc-sec': 'compare' }, el('summary', {}, t('pcx.cmp.title')), el('p', { className: 'pc-note' }, t('pcx.cmp.what')),
    field(t('pcx.cmp.tol'), tol), el('div', { className: 'pc-row' }, run, cancel, check), out, legend, el('div', { className: 'pc-row' }, show, hide, pickOut, verify, csvBtn), table, checkOut);
}
