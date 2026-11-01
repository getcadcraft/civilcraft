/* SPDX-License-Identifier: Apache-2.0 */
/**
 * solar-ui.js — the Solar arrays window (0.8 EG.15, CivilCraft side; round 3 session civil_PART_3): lay ground-mounted PV tables on the terrain inside a
 * parcel or pad, row spacing worked out on the ground each row really stands on, steep and kept-out ground left empty, the horizon's shade taken off the year's
 * energy. The numbers are solar.js over BimCraft's PV engine (dev/pv/, byte-identical copy). DOM only; every word is a t() key (solar.*).
 * A calculation aid for early design, not a yield report: the sky is the clear-sky upper bound unless the person gives monthly clearness data.
 *
 *   createSolar(ctx) → { command(c) → handled, overlay(c2d, toScreen, C), problems() → [problem], arrays() → plans (for 3D and assistants) }
 *   ctx = { el, root, project, units, say, download(name, blob), fileStem(), redraw(), refresh() }
 */
import { t } from './i18n.js';
import { openWin, field, table, csv, saved, save } from './eg-win.js';
import { STARTER_MODULE } from './pv/pv.js';
import { DEFAULTS, cleanOptions, yieldGround, tableRows } from './solar.js';
import { cleanSolarArray } from './solar-state.js';
import { planArray, regionOf, crsSite, groundOf, summaryOf } from './solar-run.js';
import { METRES_PER, fixed } from './units.js';

export const SOLAR_COMMANDS = ['solar'];

export function createSolar(ctx) {
  const { el } = ctx;
  const P = () => ctx.project();
  const Mu = () => METRES_PER[P().state.units] || 0.3048;   // metres per project unit
  const lenU = () => (ctx.units() === 'm' ? 'm' : 'ft');
  const L = (m) => fixed(m / Mu(), lenU() === 'm' ? 2 : 1) + ' ' + lenU();
  const btn = (label, icon, fn, data) => el('button', { type: 'button', className: 'btn-line btn-sm-cc', [data || 'data-solar-btn']: '', onclick: fn }, el('i', { className: 'bi bi-' + icon, 'aria-hidden': 'true' }), ' ' + label);   // i18n-ignore: icon class
  const kv = (rows) => el('div', { className: 'cv-props' }, ...rows.flatMap(([k, v]) => [el('span', { className: 'k' }, k), el('span', { className: 'v' }, v)]));
  const thousands = (n) => fixed(n, 0).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const probs = new Map();   // array id → [{ code, key, vars }]
  let drafts = null;   // the window's work in progress, drawn dashed on the plan

  const blank = () => {
    const s = P().state, region = s.parcels?.[0] ? { kind: 'parcel', ref: s.parcels[0].id } : s.pads?.[0] ? { kind: 'pad', ref: s.pads[0].id } : { kind: 'poly', pts: [] };
    return { id: null, name: t('solar.name.default'), region, keep: [], ground: 'auto', site: null, module: { ...STARTER_MODULE }, options: { ...DEFAULTS, ...saved('solar.opts', {}) } };
  };

  function fixPlan(a) {
    const plan = planArray(P(), a);
    return plan;
  }
  function notesOf(plan) {
    return (plan.notes || []).map((n) => el('li', {}, t(n.key, n.vars || {})));
  }

  function open() {
    const proj = P(), cur = proj.state.solar?.arrays || [];
    const S = { a: cur[0] ? JSON.parse(JSON.stringify(cur[0])) : blank(), plan: null, y: null, busy: false, text: '' };
    const win = openWin(ctx, 'cv-solar', 'solar.title', (body, w) => {
      const a = S.a, o = a.options;
      const regionChoices = [...(proj.state.parcels || []).map((p) => ['parcel:' + p.id, t('solar.region.parcel', { name: p.name || p.id })]), ...(proj.state.pads || []).map((p) => ['pad:' + p.id, t('solar.region.pad', { name: p.name || p.id })]), ['poly:', t('solar.region.poly')]];
      const regionKey = { v: a.region.kind === 'poly' ? 'poly:' : a.region.kind + ':' + a.region.ref };
      const keepable = [...(proj.state.pads || []), ...(proj.state.parcels || [])].filter((x) => x.id !== a.region.ref);
      const site = { lat: a.site?.lat ?? '', lon: a.site?.lon ?? '' };
      const setSite = () => { a.site = Number.isFinite(Number(site.lat)) && site.lat !== '' && Number.isFinite(Number(site.lon)) && site.lon !== '' ? { lat: Number(site.lat), lon: Number(site.lon) } : null; };
      const ptsText = { v: (a.region.pts || []).map((p) => p.x + ',' + p.y).join('\n') };
      const ta = el('textarea', { className: 'cv-input', rows: 3, 'data-solar-poly': '', placeholder: t('solar.poly.ph') }, ptsText.v);
      ta.addEventListener('change', () => { a.region = { kind: 'poly', pts: ta.value.split(/\n/).map((l) => l.trim().split(/[,\s;]+/).map(Number)).filter((r) => r.length >= 2 && r.every(Number.isFinite)).map((r) => ({ x: r[0], y: r[1] })) }; S.plan = null; });
      const list = proj.state.solar?.arrays || [];
      const sel = [];
      if (list.length) {
        const pick = el('select', { className: 'select-cc cv-input', 'data-solar-pick': '' }, ...list.map((x) => el('option', { value: x.id, selected: x.id === a.id }, x.name)), el('option', { value: '' , selected: !a.id}, t('solar.new')));
        pick.addEventListener('change', () => { S.a = pick.value ? JSON.parse(JSON.stringify(list.find((x) => x.id === pick.value))) : blank(); S.plan = null; S.y = null; S.text = ''; w.redraw(); });
        sel.push(el('div', { className: 'cv-row' }, pick));
      }
      const num = (label, obj, key, opt = {}) => field(ctx, label, obj, key, { ...opt, onChange: () => { S.plan = null; S.y = null; } });
      const mod = a.module;
      const form = el('div', { className: 'cv-props', 'data-solar-form': '' },
        ...field(ctx, t('solar.f.name'), a, 'name', { kind: 'text' }),
        ...field(ctx, t('solar.f.region'), regionKey, 'v', { kind: 'select', options: regionChoices, onChange: (v) => { const [k, ref] = v.split(':'); a.region = k === 'poly' ? { kind: 'poly', pts: a.region.pts || [] } : { kind: k, ref }; S.plan = null; w.redraw(); } }),
        ...(a.region.kind === 'poly' ? [el('label', { className: 'k' }, t('solar.f.poly')), ta] : []),
        ...field(ctx, t('solar.f.ground'), a, 'ground', { kind: 'select', options: [['auto', t('solar.ground.auto')], ['eg', t('solar.ground.eg')], ['fg', t('solar.ground.fg')]], onChange: () => { S.plan = null; } }),
        ...field(ctx, t('solar.f.lat'), site, 'lat', { min: -90, max: 90, onChange: () => { setSite(); S.plan = null; } }),
        ...field(ctx, t('solar.f.lon'), site, 'lon', { min: -180, max: 180, onChange: () => { setSite(); S.plan = null; } }),
        ...num(t('solar.f.tilt'), o, 'tilt', { unit: '°', min: 0, max: 60 }),
        ...num(t('solar.f.azimuth'), o, 'azimuth', { unit: '°', min: 0, max: 360 }),
        ...num(t('solar.f.perrow'), o, 'perRow', { min: 1, max: 60 }),
        ...num(t('solar.f.stack'), o, 'stack', { min: 1, max: 6 }),
        ...field(ctx, t('solar.f.orient'), o, 'orient', { kind: 'select', options: [['portrait', t('solar.orient.portrait')], ['landscape', t('solar.orient.landscape')]], onChange: () => { S.plan = null; } }),
        ...num(t('solar.f.colgap'), o, 'colGap', { unit: 'm', min: 0, max: 5 }),
        ...num(t('solar.f.clearance'), o, 'clearance', { unit: 'm', min: 0.1, max: 3 }),
        ...num(t('solar.f.setback'), o, 'setback', { unit: 'm', min: 0, max: 100 }),
        ...num(t('solar.f.maxslope'), o, 'maxSlope', { unit: '°', min: 1, max: 45 }),
        ...num(t('solar.f.maxpile'), o, 'maxPile', { unit: 'm', min: 0.3, max: 10 }),
        ...num(t('solar.f.wp'), mod, 'wp', { unit: 'W', min: 1, max: 1000 }),
        ...num(t('solar.f.length'), mod, 'lengthMm', { unit: 'mm', min: 300, max: 4000 }),
        ...num(t('solar.f.width'), mod, 'widthMm', { unit: 'mm', min: 300, max: 3000 }));
      const keepBox = keepable.length ? el('div', { className: 'cv-note', 'data-solar-keep': '' }, el('strong', {}, t('solar.f.keep')), ' ', ...keepable.flatMap((x) => {
        const cb = el('input', { type: 'checkbox', checked: a.keep.includes(x.id), 'data-solar-keep-id': x.id });
        cb.addEventListener('change', () => { a.keep = cb.checked ? [...new Set([...a.keep, x.id])] : a.keep.filter((k) => k !== x.id); S.plan = null; });
        return [el('label', { className: 'cv-check' }, cb, ' ' + (x.name || x.id)), ' '];
      })) : null;
      const crsBtn = P().state.crs ? btn(t('solar.crs'), 'geo-alt', async () => { const s = await crsSite(P(), regionOf(P(), a)); if (s) { a.site = s; S.plan = null; w.redraw(); } else ctx.say(t('solar.crs.none')); }, 'data-solar-crs') : null;
      const result = el('div', { 'data-solar-result': '', 'aria-live': 'polite' }, ...resultNodes());
      function resultNodes() {
        if (S.busy) return [el('p', { className: 'cv-note' }, t('solar.busy'))];
        if (S.text) return [el('p', { className: 'cv-note', 'data-solar-msg': '' }, S.text)];
        const pl = S.plan;
        if (!pl) return [el('p', { className: 'cv-muted' }, t('solar.hint'))];
        if (!pl.ok) return [el('p', { className: 'cv-note', 'data-solar-error': pl.error }, t(pl.error))];
        const m = pl.pitch, rows = [[t('solar.r.tables'), thousands(pl.count) + ' (' + t('solar.r.columns', { n: new Set(pl.tables.map((x) => x.col)).size }) + ')'], [t('solar.r.modules'), thousands(pl.modules)], [t('solar.r.kwp'), fixed(pl.kwp, 1) + ' kWp'],
          [t('solar.r.pitch'), L(m.min) + ' – ' + L(m.max) + ' (' + t('solar.r.mean', { v: L(m.mean) }) + ')'], [t('solar.r.flat'), L(pl.flatPitch)],
          [t('solar.r.pile'), pl.tables.length ? L(Math.max(...pl.tables.map((x) => x.pileMax * Mu()))) : '—'], [t('solar.r.slope'), pl.tables.length ? fixed(Math.max(...pl.tables.map((x) => x.slopeDeg)), 1) + '°' : '—'],
          [t('solar.r.sun'), t('solar.r.sun.v', { e: fixed(pl.sun.elevation, 1), a: fixed(pl.sun.azimuth, 0) })]];
        if (S.y?.ok) {
          const tt = S.y.res.total;
          rows.push([t('solar.r.kwh'), thousands(tt.acKwh) + ' kWh'], [t('solar.r.spec'), thousands(tt.specificKwhKwp) + ' kWh/kWp'], [t('solar.r.pr'), fixed(tt.pr * 100, 1) + ' %'], [t('solar.r.shade'), fixed(tt.shadeLossPct ?? 0, 1) + ' %']);
          const hz = S.y.shade.horizon; if (hz?.el?.length) rows.push([t('solar.r.horizon'), fixed(Math.max(...hz.el), 1) + '°']);
        }
        return [kv(rows), el('ul', { className: 'cv-plainlist' }, ...notesOf(pl), ...(S.y?.ok ? [el('li', {}, t('solar.note.sky'))] : [])), el('p', { className: 'cv-note' }, el('strong', {}, t('eg.review')))];
      }
      const run = () => { S.text = ''; S.plan = planArray(P(), cleanSolarArray({ ...a, id: a.id || 'sa0' }, (v, p) => p + '0')) || null; S.a.options = cleanOptions(a.options); drafts = S.plan?.ok ? [{ plan: S.plan }] : null; ctx.redraw?.(); w.redraw(); };
      const runYield = () => {
        if (!S.plan?.ok) { S.plan = planArray(P(), cleanSolarArray({ ...a, id: a.id || 'sa0' }, (v, p) => p + '0')); }
        if (!S.plan?.ok) { w.redraw(); return; }
        S.busy = true; w.redraw();
        setTimeout(() => { try { S.y = yieldGround(S.plan, { ground: groundOf(P(), a) }); } catch (e) { S.y = null; S.text = t('solar.err.yield', { why: e.message }); } S.busy = false; w.redraw(); }, 30);
      };
      const saveIt = () => {
        const c = cleanSolarArray(a, (v, p) => P().nextId(p));
        if (!c) { S.text = t('solar.err.region'); w.redraw(); return; }
        const plan = planArray(P(), c); c.summary = summaryOf(plan, S.y) || undefined;
        P().change(t(a.id ? 'solar.undo.update' : 'solar.undo.add', { name: c.name }), (st) => {
          st.solar ||= { arrays: [] };
          const i = st.solar.arrays.findIndex((x) => x.id === c.id);
          if (i >= 0) st.solar.arrays[i] = c; else st.solar.arrays.push(c);
        });
        save('solar.opts', { tilt: c.options.tilt, perRow: c.options.perRow, stack: c.options.stack });
        S.a = JSON.parse(JSON.stringify(P().state.solar.arrays.find((x) => x.id === c.id) || c)); drafts = null; refreshProblems(); ctx.refresh?.(); ctx.say(t('solar.saved', { name: c.name })); w.redraw();
      };
      const removeIt = () => {
        if (!a.id) return;
        P().change(t('solar.undo.del', { name: a.name }), (st) => { st.solar.arrays = st.solar.arrays.filter((x) => x.id !== a.id); if (!st.solar.arrays.length) delete st.solar; });
        probs.delete(a.id); S.a = blank(); S.plan = null; S.y = null; drafts = null; ctx.refresh?.(); w.redraw();
      };
      const dlCsv = () => {
        if (!S.plan?.ok) return;
        const head = [t('solar.csv.id'), t('solar.csv.col'), 'x', 'y', t('solar.csv.z0'), t('solar.csv.pile'), t('solar.csv.slope')];
        const rows = tableRows(S.plan).map((r) => [r[0], r[1], fixed(r[2], 3), fixed(r[3], 3), fixed(r[4], 3), fixed(r[5], 2), fixed(r[6], 1)]);
        ctx.download((ctx.fileStem() || 'civilcraft') + '-solar-' + (a.name || 'array').replace(/[^\w.-]+/g, '_') + '.csv', new Blob(['﻿' + csv(head, rows)], { type: 'text/csv' }));
        ctx.say(t('eg.saved'));
      };
      body.replaceChildren(...sel, form, ...(keepBox ? [keepBox] : []),
        el('div', { className: 'cv-row' }, ...(crsBtn ? [crsBtn] : []), btn(t('solar.plan'), 'grid-3x3-gap', run, 'data-solar-plan'), btn(t('solar.yield'), 'sun', runYield, 'data-solar-yield'),
          btn(t('solar.save'), 'check2', saveIt, 'data-solar-save'), ...(a.id ? [btn(t('solar.delete'), 'trash', removeIt, 'data-solar-delete')] : []), btn(t('solar.csv'), 'filetype-csv', dlCsv, 'data-solar-csv')),
        result);
      w.dlg.setAttribute('data-solar-open', '');
    });
    win.onClose = () => { drafts = null; ctx.redraw?.(); };
  }

  function refreshProblems() {
    probs.clear();
    for (const a of P().state.solar?.arrays || []) {
      const plan = planArray(P(), a), list = [];
      if (!plan.ok) list.push({ code: plan.error, key: 'solar.prob.err', vars: { item: a.name, why: t(plan.error) } });
      else {
        if (plan.skipped.steep) list.push({ code: 'solar.steep', key: 'solar.prob.steep', vars: { n: plan.skipped.steep, deg: plan.options.maxSlope, item: a.name } });
        if (plan.skipped.pile) list.push({ code: 'solar.pile', key: 'solar.prob.pile', vars: { n: plan.skipped.pile, h: plan.options.maxPile, item: a.name } });
        if (!plan.count) list.push({ code: 'solar.none', key: 'solar.prob.none', vars: { item: a.name } });
      }
      if (list.length) probs.set(a.id, list);
    }
  }
  function problems() {
    refreshProblems();
    const out = [];
    for (const [id, list] of probs) for (const p of list) out.push({ code: p.code, part: id + ':' + p.code, severity: 'warning', msg: { key: p.key, vars: p.vars }, text: t(p.key, p.vars), about: [{ kind: 'solar', id }] });
    return out;
  }

  function overlay(c2d, toScreen, C) {
    const lists = [];
    for (const a of P().state.solar?.arrays || []) { const pl = planArray(P(), a); if (pl.ok) lists.push([pl, false]); }
    for (const d of drafts || []) lists.push([d.plan, true]);
    if (!lists.length) return;
    c2d.save();
    for (const [pl, dashed] of lists) {
      const col = dashed ? C.action : C.pad || C.action;
      c2d.strokeStyle = col; c2d.fillStyle = col; c2d.lineWidth = 1;
      c2d.setLineDash(dashed ? [4, 3] : []);
      for (const tb of pl.tables) {
        c2d.beginPath();
        tb.corners.forEach((c, i) => { const q = toScreen(c[0], c[1]); i ? c2d.lineTo(q.x, q.y) : c2d.moveTo(q.x, q.y); });
        c2d.closePath(); c2d.globalAlpha = 0.2; c2d.fill(); c2d.globalAlpha = 1; c2d.stroke();
      }
    }
    c2d.restore();
  }

  /** The tables of every saved array for the 3D view: [{ id, name, tables: [corners] }]. */
  const arrays = () => (P().state.solar?.arrays || []).map((a) => ({ id: a.id, name: a.name, plan: planArray(P(), a) })).filter((x) => x.plan.ok);

  return { command: (c) => (c === 'solar' ? (open(), true) : false), overlay, problems, arrays };
}
