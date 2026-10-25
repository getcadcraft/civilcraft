/* SPDX-License-Identifier: Apache-2.0 */
/**
 * powerline/out-ui.js — the Power lines workspace's dialogs (0.7 PL.3, PL.7), loaded the first time one opens:
 * Load cases and limits (the rule set; opened and saved alone or as a pack with the library, 0.7 PL.14), Stringing tables, Quantities, Sheets and report (PDF), GIS export, and the study file
 * (`.DON`) out and in. Everything they show comes from the DOM-free modules (checks.js, outputs.js, sheets.js, don.js).
 *
 *   createOutUi(ctx, { P, edit, U, S, lib, compute, libUi, issueText, renderSection }) → { command(c, sel) → handled }
 *
 * The rule set is edited on a copy and applied in one undo step (cleaned by model.js cleanRules, so a typed value out of range
 * falls back). Wind is a pressure in Pa and ice a radial thickness in mm whatever the project's unit; clearances, cover and
 * heights are in the project's unit.
 */

import { cleanRules, exampleRules } from './model.js';
import { stringingRows, stringingCsv, supportTableCsv, quantities, quantitiesCsv, quantitiesXlsx, takeoffQuantities, geoFeatures, geoGroups } from './outputs.js';
import { profileSheet, reportSheets } from './sheets.js';
import { writeDon, donBytes, readDon, donToState } from './don.js';
import { writePack, readPack } from './pack.js';
import { unitM, toForce, fromForce, forceUnit } from './units.js';
import { PAPERS, paperBy, scalesFor, fitScale, planSheet, toPdfPages } from '../plot.js';
import { writeExport, srsFor } from '../gis-export.js';
import { frame, transformer, prjFor, METRES_PER as CRS_METRES } from '../crs.js';
import { t } from '../i18n.js';
import { fixed } from '../units.js';

const KINDS = ['everyday', 'cold', 'hot', 'wind', 'ice', 'asym', 'other'];

export function createOutUi(ctx, { P, edit, U, S, lib, compute, libUi, issueText, renderSection }) {
  const { el, root } = ctx;
  const um = () => unitM(U());
  const FU = () => forceUnit(U());

  function dialog(id, title, body, foot, { wide = false } = {}) {
    const dlg = el('dialog', { className: 'cv-dialog cv-pl-dlg' + (wide ? ' cv-pl-wide' : ''), 'aria-labelledby': id + '-h', dataset: { plDialog: id } },
      el('div', { className: 'cv-dlg' },
        el('div', { className: 'cv-dlg-head' }, el('h2', { className: 'cv-h', id: id + '-h' }, title)),
        el('div', { className: 'cv-dlg-body' }, ...body),
        el('div', { className: 'cv-dlg-foot' }, ...foot)));
    dlg.addEventListener('close', () => { dlg.remove(); ctx.refocus(); });
    root.append(dlg);
    dlg.showModal();
    return dlg;
  }
  const button = (label, onclick, { primary = false, data } = {}) => el('button', { type: 'button', className: (primary ? 'btn-plot' : 'btn-line') + ' btn-sm-cc', dataset: data, onclick }, label);
  const save = (bytes, ending, type) => ctx.download(bytes, ctx.fileStem() + ending, type);
  const lineSelect = (id, value) => {
    const s = el('select', { className: 'cv-select', id }, ...S().lines.map((l) => el('option', { value: l.id }, l.name)));
    if (value && S().lines.some((l) => l.id === value)) s.value = value;
    return s;
  };
  const lineOf = (sel) => (sel?.kind === 'pl-line' ? sel.id : sel?.kind === 'pl-support' ? sel.line : S().lines[0]?.id);

  // ---- Load cases and limits ----
  let packRegion = '';
  function rulesDialog({ focus = null } = {}) {
    let d = JSON.parse(JSON.stringify(S().rules));
    const body = el('div', { className: 'cv-pl-rules', 'data-pl-rules-body': '' });
    const num = (v, onSet, { id, label, w = '5rem' } = {}) => {
      const i = el('input', { type: 'text', className: 'cv-input', inputMode: 'decimal', value: v ?? '', id, 'aria-label': label, style: 'width:' + w });
      i.addEventListener('change', () => { const n = i.value.trim() === '' ? null : Number(i.value.replace(',', '.')); if (n !== null && !Number.isFinite(n)) { i.setAttribute('aria-invalid', 'true'); return; } i.removeAttribute('aria-invalid'); onSet(n); });
      return i;
    };
    const txt = (v, onSet, label) => { const i = el('input', { type: 'text', className: 'cv-input', value: v || '', maxLength: 60, 'aria-label': label }); i.addEventListener('change', () => onSet(i.value.trim())); return i; };
    function render() {
      const caseOpts = () => d.cases.map((c) => el('option', { value: c.id }, c.name));
      const cases = el('table', { className: 'cv-groups', 'data-pl-cases': '' },
        el('thead', {}, el('tr', {}, ...['pl.rules.c.name', 'pl.rules.c.kind', 'pl.rules.c.temp', 'pl.rules.c.wind', 'pl.rules.c.ice', 'pl.rules.c.dens', ''].map((k) => el('th', { scope: 'col' }, k ? t(k) : '')))),
        el('tbody', {}, ...d.cases.map((c, i) => {
          const kind = el('select', { className: 'cv-select', 'aria-label': t('pl.rules.c.kind') }, ...KINDS.map((k) => el('option', { value: k }, t('pl.case.' + k))));
          kind.value = c.kind;
          kind.addEventListener('change', () => { c.kind = kind.value; });
          return el('tr', { dataset: { plCase: c.id } },
            el('td', {}, txt(c.name, (v) => { c.name = v || c.name; }, t('pl.rules.c.name'))), el('td', {}, kind),
            el('td', {}, num(c.temp, (v) => { c.temp = v ?? 15; }, { label: t('pl.rules.c.temp'), w: '4rem' })),
            el('td', {}, num(c.wind_Pa, (v) => { c.wind_Pa = v ?? 0; }, { label: t('pl.rules.c.wind'), w: '4.5rem' })),
            el('td', {}, num(c.ice_mm, (v) => { c.ice_mm = v ?? 0; }, { label: t('pl.rules.c.ice'), w: '4rem' })),
            el('td', {}, num(c.iceDensity, (v) => { c.iceDensity = v ?? 900; }, { label: t('pl.rules.c.dens'), w: '4.5rem' })),
            el('td', {}, d.cases.length > 1 ? el('button', { type: 'button', className: 'cv-linkbtn', 'aria-label': t('pl.rules.c.remove'), onclick: () => { d.cases.splice(i, 1); d.limits = d.limits.filter((l) => d.cases.some((x) => x.id === l.caseId)); render(); } }, el('i', { className: 'bi bi-x-lg', 'aria-hidden': 'true' })) : ''));
        })));
      const limits = el('table', { className: 'cv-groups', 'data-pl-limits': '' },
        el('thead', {}, el('tr', {}, ...['pl.rules.l.case', 'pl.rules.l.kind', 'pl.rules.l.value', ''].map((k) => el('th', { scope: 'col' }, k ? t(k) : '')))),
        el('tbody', {}, ...d.limits.map((l, i) => {
          const cs = el('select', { className: 'cv-select', 'aria-label': t('pl.rules.l.case') }, ...caseOpts());
          cs.value = l.caseId;
          cs.addEventListener('change', () => { l.caseId = cs.value; });
          const kind = el('select', { className: 'cv-select', 'aria-label': t('pl.rules.l.kind') }, el('option', { value: 'H' }, t('pl.rules.l.h')), el('option', { value: 'T' }, t('pl.rules.l.t')), el('option', { value: 'fixed' }, t('pl.rules.l.fixed', { u: FU() })));
          kind.value = l.fixed ? 'fixed' : l.kind;
          kind.addEventListener('change', () => { if (kind.value === 'fixed') { l.kind = 'H'; l.fixed = l.fixed || 10000; delete l.pct; } else { l.kind = kind.value; delete l.fixed; l.pct = l.pct || 20; } render(); });
          const val = l.fixed ? num(fixed(toForce(l.fixed, U()), 0), (v) => { if (v > 0) l.fixed = fromForce(v, U()); }, { label: t('pl.rules.l.value') }) : num(l.pct, (v) => { if (v > 0) l.pct = v; }, { label: t('pl.rules.l.value') });
          return el('tr', {}, el('td', {}, cs), el('td', {}, kind), el('td', {}, val, ' ', l.fixed ? FU() : '%'),
            el('td', {}, el('button', { type: 'button', className: 'cv-linkbtn', 'aria-label': t('pl.rules.l.remove'), onclick: () => { d.limits.splice(i, 1); render(); } }, el('i', { className: 'bi bi-x-lg', 'aria-hidden': 'true' }))));
        })));
      const clears = el('table', { className: 'cv-groups', 'data-pl-clearances': '' },
        el('thead', {}, el('tr', {}, el('th', { scope: 'col' }, t('pl.rules.cl.name')), el('th', { scope: 'col' }, t('pl.rules.cl.min', { u: U() })), el('th', {}))),
        el('tbody', {}, ...d.clearances.map((c, i) => el('tr', {},
          el('td', {}, txt(c.name, (v) => { c.name = v || c.name; }, t('pl.rules.cl.name'))),
          el('td', {}, num(fixed(c.min_m / um(), 2), (v) => { if (v != null && v >= 0) c.min_m = v * um(); }, { label: t('pl.rules.cl.min', { u: U() }) })),
          el('td', {}, d.clearances.length > 1 ? el('button', { type: 'button', className: 'cv-linkbtn', 'aria-label': t('pl.rules.cl.remove'), onclick: () => { d.clearances.splice(i, 1); render(); } }, el('i', { className: 'bi bi-x-lg', 'aria-hidden': 'true' })) : '')))));
      const useRule = (key, label, none) => { const s2 = el('select', { className: 'cv-select', id: 'cv-pl-r-' + key }, el('option', { value: '' }, none), ...d.clearances.map((c) => el('option', { value: c.id }, c.name))); s2.value = d[key] && d.clearances.some((c) => c.id === d[key]) ? d[key] : ''; s2.addEventListener('change', () => { d[key] = s2.value || null; }); return [el('label', { for: s2.id }, label), s2]; };
      const pickCase = (key, label) => { const s = el('select', { className: 'cv-select', id: 'cv-pl-r-' + key }, el('option', { value: '' }, t('pl.rules.none')), ...caseOpts()); s.value = d[key] || ''; s.addEventListener('change', () => { d[key] = s.value || null; }); return [el('label', { for: s.id }, label), s]; };
      const field = (key, label, conv = 1) => { const i = num(d[key] == null ? '' : fixed(d[key] / conv, 3), (v) => { d[key] = v == null ? null : v * conv; }, { id: 'cv-pl-r-' + key, label }); return [el('label', { for: i.id }, label), i]; };
      body.replaceChildren(
        el('div', { className: 'cv-props' }, el('label', { for: 'cv-pl-r-name' }, t('pl.rules.name')), (() => { const i = txt(d.name, (v) => { d.name = v || d.name; d.example = false; }, t('pl.rules.name')); i.id = 'cv-pl-r-name'; return i; })()),
        d.example ? el('p', { className: 'cv-report', 'data-pl-rules-example': '' }, t('pl.rules.example')) : '',
        el('h3', { className: 'cv-h3' }, t('pl.rules.cases')), el('p', { className: 'cv-note' }, t('pl.rules.cases.note')), cases,
        el('div', { className: 'cv-actions' }, button(t('pl.rules.c.add'), () => { let n = d.cases.length + 1; while (d.cases.some((c) => c.id === 'c' + n)) n++; d.cases.push({ id: 'c' + n, name: t('pl.rules.c.newname', { n }), kind: 'other', temp: 15, wind_Pa: 0, ice_mm: 0, iceDensity: 900 }); render(); }, { data: { plCaseAdd: '' } })),
        el('h3', { className: 'cv-h3' }, t('pl.rules.limits')), el('p', { className: 'cv-note' }, t('pl.rules.limits.note')), limits,
        el('div', { className: 'cv-actions' }, button(t('pl.rules.l.add'), () => { d.limits.push({ caseId: d.cases[0].id, kind: 'H', pct: 18 }); render(); })),
        el('h3', { className: 'cv-h3' }, t('pl.rules.clear')), clears,
        el('div', { className: 'cv-actions' }, button(t('pl.rules.cl.add'), () => { let n = d.clearances.length + 1; while (d.clearances.some((c) => c.id === 'k' + n)) n++; d.clearances.push({ id: 'k' + n, name: t('pl.rules.cl.newname', { n }), min_m: 5 }); render(); })),
        // 0.7 PL.11 / PL.12: which rule the Landscape's plants and walls, and underground crossings, keep
        el('div', { className: 'cv-props', 'data-pl-rules-use': '' }, ...useRule('lsTrees', t('pl.rules.use.trees'), t('pl.rules.use.off')), ...useRule('lsWalls', t('pl.rules.use.walls'), t('pl.rules.use.off')),
          ...useRule('ugCross', t('pl.rules.use.ug'), t('pl.rules.use.trench'))),
        el('p', { className: 'cv-note' }, t('pl.rules.use.note')),
        el('h3', { className: 'cv-h3' }, t('pl.rules.other')),
        el('div', { className: 'cv-props' },
          ...pickCase('hotCase', t('pl.rules.hot')), ...pickCase('windCase', t('pl.rules.wind')), ...pickCase('iceCase', t('pl.rules.ice')), ...pickCase('asymCase', t('pl.rules.asym')),
          ...field('spacingK', t('pl.rules.k')), ...field('swingMax_deg', t('pl.rules.swing')), ...field('sizeFactor', t('pl.rules.factor')),
          ...field('angleSusp_deg', t('pl.rules.ang_s')), ...field('angleDeadEnd_deg', t('pl.rules.ang_d')),
          ...field('coverMin_m', t('pl.rules.cover', { u: U() }), 1 / um()), ...field('dropMax_pct', t('pl.rules.drop'))),
        el('div', { className: 'cv-props' },
          el('label', { for: 'cv-pl-r-tf' }, t('pl.rules.temps')), el('span', {}, num(d.temps.from, (v) => { d.temps.from = v ?? -5; }, { id: 'cv-pl-r-tf', label: t('pl.rules.temps.from'), w: '4rem' }), ' … ',
            num(d.temps.to, (v) => { d.temps.to = v ?? 40; }, { label: t('pl.rules.temps.to'), w: '4rem' }), ' ', t('pl.rules.temps.by'), ' ', num(d.temps.step, (v) => { d.temps.step = v ?? 5; }, { label: t('pl.rules.temps.step'), w: '3.5rem' }), ' °C')));   // i18n-ignore: a unit
    }
    render();
    const fileIn = el('input', { type: 'file', accept: '.json', className: 'visually-hidden', tabIndex: -1, 'aria-hidden': 'true' });
    fileIn.addEventListener('change', async () => {
      const f = fileIn.files?.[0]; fileIn.value = '';
      if (!f) return;
      if (f.size > 16 * 1024 * 1024) { ctx.say(t('pl.lib.import.big')); return; }
      // a rule set file, a library file or a pack (both): the rules wait for Apply, the library items go into my library now
      try {
        const r = readPack(JSON.parse(await f.text()));
        if (!r.ok) { ctx.say(t('pl.rules.badfile', { why: r.notes[0]?.why || '' })); return; }
        if (r.rules) { d = r.rules; render(); }
        if (r.region) { packRegion = r.region; region.value = r.region; }
        const n = r.items.length ? libUi.addItems(r.items) : null;
        ctx.say(r.rules && r.items.length ? t('pl.pack.opened', { name: r.name, added: n?.added ?? 0, replaced: n?.replaced ?? 0 }) : r.rules ? t('pl.rules.imported', { name: d.name }) : t('pl.lib.import.done', { added: n?.added ?? 0, replaced: n?.replaced ?? 0, notes: r.notes.length }));
      } catch (e) { ctx.say(t('pl.rules.badfile', { why: String(e.message || e) })); }
    });
    const region = el('input', { type: 'text', className: 'cv-input', id: 'cv-pl-r-region', maxLength: 80, value: packRegion, placeholder: t('pl.pack.region.ph') });
    region.addEventListener('change', () => { packRegion = region.value.trim(); });
    const packBox = el('div', { className: 'cv-props', 'data-pl-pack': '' }, el('label', { for: region.id }, t('pl.pack.region')), region);
    const dlg = dialog('cv-pl-rules', t('pl.rules.head'), [el('p', { className: 'cv-note' }, t('pl.rules.lede')), body,
      el('h3', { className: 'cv-h3' }, t('pl.pack.head')), el('p', { className: 'cv-note' }, t('pl.pack.lede')), packBox, fileIn], [
      button(t('pl.rules.ex.cold'), () => { d = exampleRules('cold'); render(); }, { data: { plRulesCold: '' } }),
      button(t('pl.rules.ex.mild'), () => { d = exampleRules('mild'); render(); }, { data: { plRulesMild: '' } }),
      button(t('pl.rules.open'), () => fileIn.click(), { data: { plRulesOpen: '' } }),
      button(t('pl.rules.export'), () => { save(new TextEncoder().encode(JSON.stringify({ format: 'cadcraft-line-rules', version: 1, rules: cleanRules(d) }, null, 1)), '-line-rules.json', 'application/json'); }),   // i18n-ignore: a file name ending
      button(t('pl.pack.save'), () => {
        const items = libUi.packItems(), pack = writePack({ name: d.name, region: packRegion, rules: d, items });
        save(new TextEncoder().encode(JSON.stringify(pack, null, 1)), '-' + safe(packRegion || d.name) + '.cclinepack.json', 'application/json');   // i18n-ignore: a file name ending
        ctx.say(t('pl.pack.saved', { n: items.length }));
      }, { data: { plPackSave: '' } }),
      button(t('pl.close'), () => dlg.close()),
      button(t('pl.rules.apply'), () => { const r = cleanRules(d); edit(t('pl.undo.rules'), (st) => { st.rules = r; }); ctx.say(t('pl.rules.applied', { name: r.name })); dlg.close(); ctx.refresh(); }, { primary: true, data: { plRulesApply: '' } }),
    ], { wide: true });
    if (focus === 'clearances') { const c = body.querySelector('[data-pl-clearances]'); c?.scrollIntoView({ block: 'start' }); c?.querySelector('input')?.focus(); }
  }

  // ---- Stringing tables ----
  function stringingDialog(sel) {
    if (!S().lines.length) { ctx.say(t('pl.need.line')); return; }
    const ls = lineSelect('cv-pl-str-line', lineOf(sel));
    const box = el('div', { className: 'cv-pl-tables', 'data-pl-stringing': '' });
    const render = () => {
      const l = S().lines.find((x) => x.id === ls.value), a = compute().analyses.get(l.id);
      const rows = a ? stringingRows(a, { units: U() }) : [];
      if (!rows.length) { box.replaceChildren(el('p', { className: 'cv-report is-error' }, t('pl.str.none'))); return; }
      const bySec = new Map();
      for (const r of rows) { if (!bySec.has(r.section)) bySec.set(r.section, []); bySec.get(r.section).push(r); }
      box.replaceChildren(...[...bySec.entries()].map(([sec, rs]) => el('table', { className: 'cv-groups' },
        el('caption', { className: 'cv-note' }, t('pl.str.caption', { n: sec, from: rs[0].from, to: rs[0].to, lr: fixed(rs[0].Lr, 1), u: U() })),
        el('thead', {}, el('tr', {}, el('th', { scope: 'col' }, '°C'), el('th', { scope: 'col', className: 'num' }, 'H (' + FU() + ')'), ...rs[0].spans.map((s) => el('th', { scope: 'col', className: 'num' }, t('pl.str.span', { n: s.span, l: fixed(s.L, 1) }))))),   // i18n-ignore: units
        el('tbody', {}, ...rs.map((r) => el('tr', {}, el('td', {}, fixed(r.temp, 0)), el('td', { className: 'num' }, fixed(r.H, 0)), ...r.spans.map((s) => el('td', { className: 'num' }, fixed(s.sag, 2)))))))));
    };
    ls.addEventListener('change', render);
    render();
    const dlg = dialog('cv-pl-str', t('pl.str.head'), [el('div', { className: 'cv-props' }, el('label', { for: ls.id }, t('pl.str.line')), ls), el('p', { className: 'cv-note' }, t('pl.str.lede', { u: U() })), box, el('p', { className: 'cv-note cv-pl-aid' }, t('pl.aid'))], [
      button(t('pl.str.csv'), () => { const l = S().lines.find((x) => x.id === ls.value), a = compute().analyses.get(l.id); save(new TextEncoder().encode('﻿' + stringingCsv(a, l, { units: U() })), '-' + safe(l.name) + '-stringing.csv', 'text/csv'); ctx.say(t('pl.saved')); }, { data: { plStrCsv: '' } }),   // i18n-ignore: a file name ending
      button(t('pl.str.supports'), () => { const l = S().lines.find((x) => x.id === ls.value), a = compute().analyses.get(l.id); save(new TextEncoder().encode('﻿' + supportTableCsv(a, l, lib(), { units: U(), cases: S().rules.cases })), '-' + safe(l.name) + '-supports.csv', 'text/csv'); ctx.say(t('pl.saved')); }, { data: { plSupCsv: '' } }),   // i18n-ignore: a file name ending
      button(t('pl.close'), () => dlg.close(), { primary: true }),
    ], { wide: true });
  }
  const safe = (s) => String(s || 'line').replace(/[^A-Za-z0-9_-]+/g, '-').slice(0, 40);

  // ---- Quantities ----
  function quantitiesDialog() {
    const rows = quantities(S(), compute().analyses, lib(), { units: U(), groundAt: ctx.groundAt });
    const table = el('table', { className: 'cv-groups', 'data-pl-qty': '' },
      el('thead', {}, el('tr', {}, ...['pl.out.q.item', 'pl.out.q.qty', 'pl.out.q.unit', 'pl.out.q.note'].map((k, i) => el('th', { scope: 'col', className: i === 1 ? 'num' : '' }, t(k))))),
      el('tbody', {}, ...rows.map((r) => el('tr', {}, el('td', {}, r.name), el('td', { className: 'num' }, fixed(r.qty, r.unit === 'EA' ? 0 : 1)), el('td', {}, r.unit), el('td', { className: 'cv-note' }, r.note || '')))));
    const dlg = dialog('cv-pl-qty', t('pl.qty.head'), [el('p', { className: 'cv-note' }, t('pl.qty.lede', { n: rows.length })), rows.length ? table : el('p', { className: 'cv-note' }, t('pl.qty.none'))], [
      button(t('pl.qty.csv'), () => { save(new TextEncoder().encode('﻿' + quantitiesCsv(rows)), '-power-quantities.csv', 'text/csv'); ctx.say(t('pl.saved')); }, { data: { plQtyCsv: '' } }),   // i18n-ignore: a file name ending
      button(t('pl.qty.xlsx'), async () => { save(await quantitiesXlsx(rows, { title: t('pl.out.q.title') }), '-power-quantities.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'); ctx.say(t('pl.saved')); }, { data: { plQtyXlsx: '' } }),   // i18n-ignore: a file name ending
      button(t('pl.qty.takeoff'), () => { save(new TextEncoder().encode(JSON.stringify(takeoffQuantities(rows, { project: P().state.name }), null, 2)), '-power.quantities.json', 'application/json'); ctx.say(t('pl.qty.takeoff.saved')); }, { data: { plQtyTo: '' } }),   // i18n-ignore: a file name ending
      button(t('pl.close'), () => dlg.close(), { primary: true }),
    ], { wide: true });
  }

  // ---- Sheets and report ----
  function extents() {
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    const add = (p) => { x0 = Math.min(x0, p.x); y0 = Math.min(y0, p.y); x1 = Math.max(x1, p.x); y1 = Math.max(y1, p.y); };
    const st = S();
    st.lines.forEach((l) => l.supports.forEach(add)); st.routes.forEach((r) => r.pts.forEach(add)); st.equipment.forEach(add); st.obstacles.forEach((o) => o.pts.forEach(add));
    if (!Number.isFinite(x0)) return null;
    const m = Math.max(10, (x1 - x0) * 0.08, (y1 - y0) * 0.08);
    return { minX: x0 - m, minY: y0 - m, maxX: x1 + m, maxY: y1 + m };
  }
  function sheetsDialog() {
    const ext = extents();
    if (!ext) { ctx.say(t('pl.need.something')); return; }
    const chk = (id, label, on = true) => { const c = el('input', { type: 'checkbox', id, checked: on }); return [c, el('label', { for: id, className: 'cv-check' }, c, ' ', label)]; };
    const [cPlan, lPlan] = chk('cv-pl-sh-plan', t('pl.sh.plan')), [cProf, lProf] = chk('cv-pl-sh-prof', t('pl.sh.profiles'), S().lines.length > 0), [cRep, lRep] = chk('cv-pl-sh-rep', t('pl.sh.report'));
    const R = S().rules;
    const caseChecks = R.cases.map((c) => { const [box, lab] = chk('cv-pl-sh-c-' + c.id, c.name, c.id === R.hotCase || c.id === R.cases[0].id || c.kind === 'cold'); box.dataset.case = c.id; return [box, lab]; });
    const paper = el('select', { className: 'cv-select', id: 'cv-pl-sh-paper', 'data-pl-sh-paper': '' }, ...PAPERS.map((p) => el('option', { value: p.key }, p.name)));
    paper.value = U() === 'm' ? 'a3' : 'tabloid';
    const scale = el('select', { className: 'cv-select', id: 'cv-pl-sh-scale' });
    const fill = () => { const s = scalesFor(U()), fit = fitScale(U(), ext, paperBy(paper.value)); scale.replaceChildren(...s.map((x) => el('option', { value: x.label }, x.label))); scale.value = fit.label; };
    paper.addEventListener('change', fill); fill();
    const ink = el('select', { className: 'cv-select', id: 'cv-pl-sh-ink' }, el('option', { value: 'color' }, t('pl.sh.color')), el('option', { value: 'mono' }, t('pl.sh.mono')));
    const dlg = dialog('cv-pl-sh', t('pl.sh.head'), [
      el('div', { className: 'cv-checks' }, lPlan, lProf, lRep),
      el('fieldset', { className: 'cv-checks' }, el('legend', {}, t('pl.sh.cases')), ...caseChecks.map((x) => x[1])),
      el('div', { className: 'cv-props' }, el('label', { for: paper.id }, t('pl.sh.paper')), paper, el('label', { for: scale.id }, t('pl.sh.scale')), scale, el('label', { for: ink.id }, t('pl.sh.ink')), ink),
      el('p', { className: 'cv-note' }, t('pl.sh.note'))], [
      button(t('pl.close'), () => dlg.close()),
      button(t('pl.sh.go'), async () => {
        const title = P().state.name || ctx.fileStem(), sheets = [], st = S(), m = compute();
        const cases = caseChecks.filter((x) => x[0].checked).map((x) => x[0].dataset.case);
        if (cPlan.checked) { const sc = scalesFor(U()).find((x) => x.label === scale.value); sheets.push(planSheet(ctx.buildScene(sc.mmPerUnit), { extents: ext, paper: paper.value, landscape: true, scale: sc, title: t('pl.sh.plan.title', { name: title }), units: U(), notes: [t('pl.sh.aid')] })); }
        if (cProf.checked) for (const l of st.lines) { const a = m.analyses.get(l.id); if (a && l.supports.length > 1) sheets.push(profileSheet({ line: l, analysis: a, state: st, units: U(), paper: paper.value, title: t('pl.sh.profile.title', { name: l.name }), groundAt: ctx.groundAt, cases })); }
        if (cRep.checked) sheets.push(...reportSheets({ state: st, analyses: m.analyses, lib: lib(), units: U(), paper: 'a4', title: t('pl.rep.title.p', { name: title }), issues: m.issues, issueText }));
        if (!sheets.length) { ctx.say(t('pl.sh.pick')); return; }
        const { bytes, report } = await toPdfPages(sheets, { mono: ink.value === 'mono', title });
        save(bytes, '-power-lines.pdf', 'application/pdf');   // i18n-ignore: a file name ending
        ctx.say(t('pl.sh.done', { n: sheets.length, missing: report.missing }));
        dlg.close();
      }, { primary: true, data: { plShGo: '' } }),
    ]);
  }

  // ---- GIS ----
  function gisDialog() {
    const fmt = el('select', { className: 'cv-select', id: 'cv-pl-gis-fmt', 'data-pl-gis-fmt': '' }, ...['gpkg', 'shp', 'geojson', 'kml', 'kmz'].map((f) => el('option', { value: f }, t('pl.gis.f.' + f))));
    const crs = P().state.crs;
    const dlg = dialog('cv-pl-gis', t('pl.gis.head'), [el('p', { className: 'cv-note' }, t('pl.gis.lede')), el('div', { className: 'cv-props' }, el('label', { for: fmt.id }, t('pl.gis.format')), fmt),
      el('p', { className: 'cv-note' }, crs ? t('pl.gis.crs', { name: crs.name }) : t('pl.gis.nocrs'))], [
      button(t('pl.close'), () => dlg.close()),
      button(t('pl.gis.go'), async () => {
        const f = fmt.value;
        if ((f === 'geojson' || f === 'kml' || f === 'kmz') && !crs) { ctx.say(t('pl.gis.needcrs')); return; }
        const fr = crs ? frame(crs) : null;
        const groups = geoGroups(geoFeatures(S(), compute().analyses, lib(), { units: U() }), fr ? { toGrid: fr.toGrid } : {});
        if (!groups.length) { ctx.say(t('pl.need.something')); return; }
        const prj = crs ? await prjFor(crs) : null, k = crs ? CRS_METRES[crs.unit] || 1 : 1;
        const r = await writeExport(groups, { format: f, prj, toLonLat: crs ? transformer(crs, null) : null, zToMetres: (z) => z * k, stem: ctx.fileStem() + '-power', srs: srsFor(crs, prj) });
        ctx.download(r.bytes, r.name, r.type);
        ctx.say(t('pl.gis.done', { n: groups.reduce((s, g) => s + g.features.length, 0), notes: (r.notes || []).join(' ') }));
        dlg.close();
      }, { primary: true, data: { plGisGo: '' } }),
    ]);
  }

  // ---- the study file (.DON) ----
  function donOutDialog(sel) {
    if (!S().lines.length) { ctx.say(t('pl.need.line')); return; }
    const ls = lineSelect('cv-pl-don-line', lineOf(sel));
    const desc = el('input', { type: 'text', className: 'cv-input', id: 'cv-pl-don-desc', maxLength: 120, value: P().state.name || '' });
    const job = el('input', { type: 'text', className: 'cv-input', id: 'cv-pl-don-job', maxLength: 40, value: '' });
    const dlg = dialog('cv-pl-don', t('pl.don.head'), [
      el('p', { className: 'cv-report', 'data-pl-don-untested': '' }, t('pl.don.untested')),
      el('div', { className: 'cv-props' }, el('label', { for: ls.id }, t('pl.str.line')), ls, el('label', { for: desc.id }, t('pl.don.desc')), desc, el('label', { for: job.id }, t('pl.don.job')), job),
      el('p', { className: 'cv-note' }, t('pl.don.note'))], [
      button(t('pl.close'), () => dlg.close()),
      button(t('pl.don.go'), () => {
        const l = S().lines.find((x) => x.id === ls.value), a = compute().analyses.get(l.id);
        if (!a?.ok) { ctx.say(t('pl.don.notsolved')); return; }
        const xml = writeDon({ state: S(), line: l, analysis: a, lib: lib(), units: U(), meta: { description: desc.value, project: job.value } });
        save(donBytes(xml), '-' + safe(l.name) + '.DON', 'application/xml');   // i18n-ignore: a file name ending
        ctx.say(t('pl.don.done', { name: l.name }));
        dlg.close();
      }, { primary: true, data: { plDonGo: '' } }),
    ]);
  }
  function donIn() {
    const fileIn = el('input', { type: 'file', accept: '.don,.DON,.xml', className: 'visually-hidden' });
    fileIn.addEventListener('change', async () => {
      const f = fileIn.files?.[0]; fileIn.remove();
      if (!f) return;
      if (f.size > 20 * 1024 * 1024) { ctx.say(t('pl.don.big')); return; }
      const buf = new Uint8Array(await f.arrayBuffer());
      const decl = new TextDecoder('latin1').decode(buf.slice(0, 200));
      const text = new TextDecoder(/encoding=["']utf-?8/i.test(decl) ? 'utf-8' : 'latin1').decode(buf);
      const r = readDon(text);
      if (!r.ok || !r.supports.length) { ctx.say(t('pl.don.bad', { why: (r.notes || []).map((n) => n.why).join(', ') })); return; }
      const st = donToState(r, U());
      const m = lib(), byName = (kind, name) => { if (!name) return null; const n = String(name).trim().toLowerCase(); for (const it of m.values()) if (it.kind === kind && it.name.toLowerCase() === n) return it.key; return null; };
      const conductor = byName('conductor', st.conductor);
      const id = P().nextId('e');
      const supports = st.line.supports.map((p, i) => {
        const h = st.hints?.[i] || {};
        const arm = byName('equipment', h.crossarm);
        return { ...p, id: P().nextId('e'), support: byName('support', h.chosen) || null, equip: arm ? [arm] : [] };
      });
      edit(t('pl.undo.donin'), (s) => {
        s.lines.push({ ...st.line, id, name: st.line.name || f.name.replace(/\.[^.]+$/, ''), conductor, supports, equip: st.line.equip || [], clearance: st.line.clearance || 'ground' });
        libUi.ensureInProject([conductor, ...supports.flatMap((p) => [p.support, ...p.equip])].filter(Boolean), s);
      });
      ctx.select({ kind: 'pl-line', id });
      ctx.say(t('pl.don.read', { n: supports.length, cond: st.conductor || '—', matched: conductor ? t('pl.don.matched') : t('pl.don.unmatched') }));
      renderSection();
    });
    root.append(fileIn);
    fileIn.click();
  }

  function command(c, sel) {
    switch (c) {
      case 'pl-rules': rulesDialog(); return true;
      case 'pl-rules-clear': rulesDialog({ focus: 'clearances' }); return true;   // 0.7 PL.13: the button beside a Clearance rule
      case 'pl-stringing': stringingDialog(sel); return true;
      case 'pl-quantities': quantitiesDialog(); return true;
      case 'pl-sheets': sheetsDialog(); return true;
      case 'pl-gis': gisDialog(); return true;
      case 'pl-don-out': donOutDialog(sel); return true;
      case 'pl-don-in': donIn(); return true;
      default: return false;
    }
  }
  return { command };
}
