/* SPDX-License-Identifier: Apache-2.0 */
/**
 * river-ui.js — rivers in CivilCraft (0.8 SU.957, lab): the River tool (draw the centreline in the direction of flow →
 * sections cut from the ground every `spacing`), the Add section tool (a cut line across the selected river), the Rivers
 * block in Properties, a river's Properties (sections, roughness, reach lengths, flow profiles, boundaries, regime), the
 * Results dialog (water surface profile plot, table per section, warnings, CSV / report / SVG) and the flood extent on the
 * plan. The numbers are river.js / river-solve.js / river-extent.js / river-report.js (bin/test-civilcraft-river.mjs).
 * Every change is one undo step. Every result says it needs an engineer's review.
 *
 *   createRivers(ctx) → { ownsTool(t), hints, command(c) → handled, finish(tool, pts) → done, block(), isMine(sel),
 *                         props(sel, box, head) → shown, remove(sel) → removed, pick(w, tol) → sel | null,
 *                         overlay(c2d, S, C, sel), list(), find(id), results(id) }
 *   ctx = { root, el, project: () => Project, units: () => 'ft'|'m'|…, numInput, row, say, select(sel), selection(),
 *           setTool(name), refresh(), redraw(), download(name, blob), fileStem(), surface() → the existing ground TIN | null }
 *
 * Saved in the project as state.rivers (cleanRiver on load). Results are not saved: they are computed again from the model.
 */

import { t } from './i18n.js';
import { cleanRiver, newRiver, sectionsAlong, sectionFromLine, setReachLengths, ordered, RIVER_DEFAULTS, BOUNDARY_TYPES } from './river.js';
import { solve } from './river-solve.js';
import { solveStructures } from './river-structures.js';   // 0.8 SU.957 rest: culverts and bridges
import { structuresBlock, structuresTable, openUnsteady, joinBlock, junctionTable, solveGroup } from './river-struct-ui.js';
import { floodExtent } from './river-extent.js';
import { reportText, tableCsv, tableRows, header, profileSvg } from './river-report.js';
import { lineLength, locateOn } from './terrain-section.js';
import { openSectionEditor } from './river-section-ui.js';   // 0.8 SU.957 step 2: banks, levees, ineffective areas on a plot
import { LAYERS } from './scene.js';

for (const [name, key, aci] of [['C-WATR-CNTR', 'sx.su957.layer.cntr', 5], ['C-WATR-SCTN', 'sx.su957.layer.sctn', 4], ['C-WATR-FLOD', 'sx.su957.layer.flod', 140]]) {
  if (!LAYERS.some((l) => l.name === name)) LAYERS.push({ name, token: 'blue', aci, get label() { return t(key); } });
}

const TOOLS = ['river', 'river-xs'];
const MAX_RIVERS = 50;

export function createRivers(ctx) {
  const { el } = ctx;
  const P = () => ctx.project();
  const RU = () => (ctx.units() === 'm' ? 'm' : 'ft');
  const list = () => P().state.rivers || [];
  const find = (id) => list().find((r) => r.id === id);
  const cache = new Map();   // id → { key, result, extent: Map(profile → extent) }
  const view = { extent: new Map(), profile: new Map() };   // per river: show the flood extent? which profile?
  const edit = (id, label, fn) => P().change(label, (st) => { const r = (st.rivers || []).find((x) => x.id === id); if (r) fn(r, st); });
  const lenU = () => (RU() === 'm' ? 'm' : 'ft');
  const qU = () => (RU() === 'm' ? 'm³/s' : 'ft³/s');   // i18n-ignore: unit symbols
  const fx = (v, d) => (Number.isFinite(v) ? v.toFixed(d) : '');

  function results(id) {
    const r = find(id);
    if (!r) return null;
    const key = JSON.stringify(r);
    let c = cache.get(id);
    const joined = !!r.joinsTo || list().some((x) => x.joinsTo === id), gkey = joined ? '|' + JSON.stringify(list().map((x) => [x.id, x.joinsTo, x.profiles, x.sections.length])) : '';
    if (!c || c.key !== key + gkey) {
      const m = cleanRiver(r); let result = m?.structures?.length ? solveStructures(m) : solve(m), group = null;
      if (joined) {   // 0.8 SU.957 (civil_PART_4): rivers that join are solved together, a tributary ends at the water surface of the river it joins
        group = solveGroup(list().map(cleanRiver).filter(Boolean), id);
        if (group?.net?.reaches[id]) result = { ...group.net.reaches[id], issues: [...(result.issues || []).filter((i) => i.code !== 'x'), ...(group.net.reaches[id].issues || [])] };
      }
      c = { key: key + gkey, result, group, extent: new Map() }; cache.set(id, c);
    }
    return c;
  }
  function extentOf(id, name) {
    const c = results(id), sf = ctx.surface();
    if (!c || !sf) return null;
    const p = c.result.profiles.find((x) => x.name === name) || c.result.profiles[0];
    if (!p) return null;
    if (!c.extent.has(p.name)) c.extent.set(p.name, floodExtent(sf, cleanRiver(find(id)), p.rows));
    return c.extent.get(p.name);
  }

  function nextId() {
    let n = 0;
    for (const r of list()) { const k = Number(String(r.id).replace(/^\D+/, '')); if (k > n) n = k; }
    return 'rv' + (n + 1);
  }

  function slopeGuess(model) {
    const s = ordered(model);
    if (s.length < 2) return 0.001;
    const z = (x) => Math.min(...x.pts.map((p) => p.z));
    const v = (z(s[s.length - 1]) - z(s[0])) / (s[s.length - 1].rs - s[0].rs);
    return v > 1e-5 ? Number(v.toPrecision(3)) : 0.001;
  }

  // ---- tools
  function finish(tool, pts) {
    const sf = ctx.surface();
    if (!sf) { ctx.say(t('sx.su957.need.surface')); return true; }
    if (tool === 'river') {
      if (pts.length < 2 || !(lineLength(pts) > 0)) { ctx.say(t('sx.su957.need.two')); return false; }
      if (list().length >= MAX_RIVERS) { ctx.say(t('sx.su957.max')); return true; }
      const units = RU(), d = RIVER_DEFAULTS(units), id = nextId();
      const cl = pts.map((p) => ({ x: p.x, y: p.y }));
      const model = newRiver({ id, name: t('sx.su957.name', { n: list().length + 1 }), units, centreline: cl });
      model.sections = sectionsAlong(sf, cl, { ...d, units });
      model.sections.forEach((s, i) => { s.id = 'xs' + (i + 1); });
      setReachLengths(model);
      model.profiles = [{ name: t('sx.su957.pf', { n: 1 }), q: units === 'm' ? 100 : 3000, changes: [], down: { type: 'normal', slope: slopeGuess(model) }, up: { type: 'critical' } }];
      model.settings = { spacing: d.spacing, left: d.left, right: d.right, bank: d.bank, n: d.n, nOver: d.nOver };
      P().change(t('sx.su957.undo.add'), (st) => { (st.rivers ||= []).push(model); });
      ctx.select({ kind: 'river', id });
      ctx.say(model.sections.length >= 2 ? t('sx.su957.added', { n: model.sections.length }) : t('sx.su957.added.few'));
      return true;
    }
    if (tool === 'river-xs') {
      const sel = ctx.selection(), r = sel?.kind === 'river' ? find(sel.id) : null;
      if (!r) { ctx.say(t('sx.su957.xs.need')); return true; }
      if (pts.length < 2) { ctx.say(t('sx.su957.need.two')); return false; }
      const m = cleanRiver(r), st = m.settings || r.settings || RIVER_DEFAULTS(m.units);
      const s = sectionFromLine(sf, m.centreline, pts.map((p) => ({ x: p.x, y: p.y })), { ...RIVER_DEFAULTS(m.units), ...st, units: m.units });
      if (!s) { ctx.say(t('sx.su957.xs.miss')); return false; }
      if (m.sections.some((x) => Math.abs(x.rs - s.rs) < 1e-6)) { ctx.say(t('sx.su957.xs.same')); return true; }
      edit(r.id, t('sx.su957.undo.xs'), (q) => {
        let k = 1;
        while (q.sections.some((x) => x.id === 'xs' + k)) k++;
        s.id = 'xs' + k;
        q.sections.push(s);
        q.sections.sort((a, b) => b.rs - a.rs);
        setReachLengths(q);
      });
      ctx.say(t('sx.su957.xs.added', { rs: fx(s.rs, 2) }));
      return true;
    }
    return false;
  }

  function command(c) {
    if (c === 'river' || c === 'river-xs') { ctx.setTool(c); return true; }
    if (c === 'river-results') { const s = ctx.selection(); if (s?.kind === 'river') resultsDialog(s.id); return true; }
    return false;
  }

  // ---- Properties
  function block() {
    const rs = list();
    if (!rs.length) return [];
    return [el('h3', { className: 'cv-h3', 'data-river-head': '' }, t('sx.su957.head')),
      el('ul', { className: 'cv-plainlist', 'data-river-list': '' }, ...rs.map((r) => el('li', {},
        el('button', { type: 'button', className: 'cv-linkbtn', onclick: () => ctx.select({ kind: 'river', id: r.id }) }, r.name || r.id), ' ', t('sx.su957.row', { n: r.sections.length, p: r.profiles.length }))))];
  }

  const isMine = (sel) => sel?.kind === 'river';

  function numCell(value, onCommit, label, id, width = '5rem') {
    return ctx.numInput(Number.isFinite(value) ? String(value) : '', (v) => {
      const s = String(v).trim(), n = Number(s);
      if (s === '' || !Number.isFinite(n)) return false;
      return onCommit(n) !== false;
    }, { label, id, width, calc: true });
  }

  function props(sel, box, head) {
    const r = find(sel.id);
    if (!r) return false;
    head.textContent = t('sx.su957.props.head');
    const id = r.id, U = lenU(), out = [];
    out.push(el('p', { className: 'cv-note', 'data-river-review': '' }, t('sx.su957.review')));
    const name = el('input', { type: 'text', className: 'cv-input', id: 'cv-rv-name', value: r.name || '', maxLength: 80 });
    name.addEventListener('change', () => edit(id, t('sx.su957.undo.name'), (q) => { q.name = name.value.slice(0, 80); }));
    const regime = el('select', { className: 'cv-select', id: 'cv-rv-regime', 'data-river-regime': '' }, ...['sub', 'super', 'mixed'].map((k) => el('option', { value: k }, t('sx.su957.regime.' + k))));
    regime.value = r.regime || 'sub';
    regime.addEventListener('change', () => edit(id, t('sx.su957.undo.set'), (q) => { q.regime = regime.value; }));
    out.push(el('div', { className: 'cv-props' },
      ...ctx.row(t('sx.su957.name.label'), name, 'cv-rv-name'),
      ...ctx.row(t('sx.su957.regime'), regime, 'cv-rv-regime'),
      ...ctx.row(t('sx.su957.length', { u: U }), fx(lineLength(r.centreline), 2)),
      ...ctx.row(t('sx.su957.sections'), String(r.sections.length))));

    // actions
    out.push(el('div', { className: 'cv-actions' },
      el('button', { type: 'button', className: 'btn-plot btn-sm-cc', 'data-river-run': '', onclick: () => resultsDialog(id) }, el('i', { className: 'bi bi-water', 'aria-hidden': 'true' }), ' ', t('sx.su957.run')),
      el('button', { type: 'button', className: 'btn-line btn-sm-cc', 'data-river-xs': '', onclick: () => ctx.setTool('river-xs') }, t('sx.su957.xs.tool'))));
    const show = el('input', { type: 'checkbox', id: 'cv-rv-extent', 'data-river-extent': '', checked: !!view.extent.get(id) });
    show.addEventListener('change', () => { view.extent.set(id, show.checked); ctx.scene?.(); ctx.redraw(); if (show.checked) { const e = extentOf(id, view.profile.get(id)); ctx.say(e ? t('sx.su957.extent.said', { a: fx(e.area, 0), u: U, d: fx(e.maxDepth, 2) }) : t('sx.su957.need.surface')); } });
    const pf = el('select', { className: 'cv-select', id: 'cv-rv-pf', 'aria-label': t('sx.su957.extent.profile') }, ...r.profiles.map((p) => el('option', { value: p.name }, p.name)));
    if (view.profile.get(id)) pf.value = view.profile.get(id);
    pf.addEventListener('change', () => { view.profile.set(id, pf.value); ctx.scene?.(); ctx.redraw(); });
    out.push(el('div', { className: 'cv-props' }, ...ctx.row(t('sx.su957.extent'), show, 'cv-rv-extent'), ...ctx.row(t('sx.su957.extent.profile'), pf, 'cv-rv-pf')));

    // flow profiles
    out.push(el('h3', { className: 'cv-h3' }, t('sx.su957.profiles')));
    r.profiles.forEach((p, i) => {
      const bcSel = (which) => {
        const b = p[which] || { type: 'none' };
        const s = el('select', { className: 'cv-select', id: `cv-rv-${which}-${i}`, 'data-river-bc': which }, el('option', { value: 'none' }, t('sx.su957.bc.none')), ...BOUNDARY_TYPES.map((k) => el('option', { value: k }, t('sx.su957.bc.' + k))));   // i18n-ignore: element ids
        s.value = b.type;
        const val = b.type === 'normal' ? b.slope : b.type === 'ws' ? b.wse : null;
        const input = b.type === 'normal' || b.type === 'ws' ? numCell(val, (n) => {
          if (b.type === 'normal' && !(n > 0 && n < 1)) return false;
          edit(id, t('sx.su957.undo.set'), (q) => { const x = q.profiles[i]; if (x) x[which] = b.type === 'normal' ? { type: 'normal', slope: n } : { type: 'ws', wse: n }; });
        }, t(b.type === 'normal' ? 'sx.su957.bc.slope' : 'sx.su957.bc.wse', { u: U }), `cv-rv-${which}v-${i}`, '6rem') : null;   // i18n-ignore: element ids
        s.addEventListener('change', () => edit(id, t('sx.su957.undo.set'), (q) => {
          const x = q.profiles[i];
          if (!x) return;
          const ref = ordered(cleanRiver(q))[which === 'down' ? 0 : q.sections.length - 1];
          const zMin = ref ? Math.min(...ref.pts.map((y) => y.z)) : 0;
          x[which] = s.value === 'none' ? null : s.value === 'normal' ? { type: 'normal', slope: slopeGuess(cleanRiver(q)) } : s.value === 'ws' ? { type: 'ws', wse: Number((zMin + 1).toFixed(3)) } : { type: 'critical' };
        }));
        return [...ctx.row(t(which === 'down' ? 'sx.su957.bc.down' : 'sx.su957.bc.up'), el('span', { className: 'cv-inline' }, s, input || ''), `cv-rv-${which}-${i}`)];   // i18n-ignore: element ids
      };
      const nm = el('input', { type: 'text', className: 'cv-input', id: `cv-rv-pfn-${i}`, value: p.name, maxLength: 40, style: 'width:7rem' });   // i18n-ignore: element ids
      nm.addEventListener('change', () => edit(id, t('sx.su957.undo.set'), (q) => { if (q.profiles[i] && nm.value.trim()) q.profiles[i].name = nm.value.trim().slice(0, 40); }));
      const del = el('button', { type: 'button', className: 'cv-linkbtn', 'aria-label': t('sx.su957.pf.remove', { name: p.name }), onclick: () => edit(id, t('sx.su957.undo.pf'), (q) => { q.profiles.splice(i, 1); }) }, el('i', { className: 'bi bi-x-lg', 'aria-hidden': 'true' }));
      out.push(el('div', { className: 'cv-props', 'data-river-profile': String(i) },
        ...ctx.row(t('sx.su957.pf.name'), el('span', { className: 'cv-inline' }, nm, r.profiles.length > 1 ? del : ''), `cv-rv-pfn-${i}`),   // i18n-ignore: element ids
        ...ctx.row(t('sx.su957.pf.q', { u: qU() }), numCell(p.q, (n) => { if (!(n > 0)) return false; edit(id, t('sx.su957.undo.set'), (q) => { if (q.profiles[i]) q.profiles[i].q = n; }); }, t('sx.su957.pf.q', { u: qU() }), `cv-rv-q-${i}`), `cv-rv-q-${i}`),   // i18n-ignore: element ids
        ...(r.regime !== 'super' ? bcSel('down') : []),
        ...(r.regime && r.regime !== 'sub' ? bcSel('up') : [])));
    });
    if (r.profiles.length < 20) out.push(el('div', { className: 'cv-actions' }, el('button', { type: 'button', className: 'btn-line btn-sm-cc', 'data-river-addpf': '', onclick: () => edit(id, t('sx.su957.undo.pf'), (q) => {
      const last = q.profiles[q.profiles.length - 1] || { q: 100, down: { type: 'normal', slope: 0.001 }, up: { type: 'critical' } };
      let k = q.profiles.length + 1;
      while (q.profiles.some((x) => x.name === t('sx.su957.pf', { n: k }))) k++;
      q.profiles.push({ name: t('sx.su957.pf', { n: k }), q: Number((last.q * 2).toPrecision(4)), changes: [], down: last.down, up: last.up });
    }) }, t('sx.su957.pf.add'))));

    // culverts and bridges (steady) and unsteady flow
    out.push(...structuresBlock({ r, id, el, t, edit, numCell, row: (...x) => ctx.row(...x), units: RU(), ordered }));
    out.push(...joinBlock({ r, id, others: list().filter((x) => x.id !== id), el, t, edit, row: (...x) => ctx.row(...x) }));   // 0.8 SU.957 (civil_PART_4)
    out.push(el('div', { className: 'cv-actions' }, el('button', { type: 'button', className: 'btn-line btn-sm-cc', 'data-river-unsteady': '', onclick: () => openUnsteady({ el, root: ctx.root, t, say: ctx.say, model: cleanRiver(find(id)), download: (n, b) => ctx.download(n, b), stem: () => (ctx.fileStem() || 'civilcraft') + '-' + (r.name || r.id).replace(/[^\w.-]+/g, '-') }) }, el('i', { className: 'bi bi-graph-up', 'aria-hidden': 'true' }), ' ', t('river.un.open'))));

    // sections: re-cut, then a table
    const st = { ...RIVER_DEFAULTS(r.units), ...(r.settings || {}) };
    out.push(el('h3', { className: 'cv-h3' }, t('sx.su957.cut')));
    const cutIn = {};
    const cutRow = (k, label) => { const inp = el('input', { type: 'text', className: 'cv-input', id: 'cv-rv-cut-' + k, inputMode: 'decimal', value: String(st[k]), style: 'width:5rem' }); cutIn[k] = inp; return ctx.row(label, inp, 'cv-rv-cut-' + k); };
    out.push(el('div', { className: 'cv-props', 'data-river-cut': '' },
      ...cutRow('spacing', t('sx.su957.cut.spacing', { u: U })),
      ...cutRow('left', t('sx.su957.cut.left', { u: U })),
      ...cutRow('right', t('sx.su957.cut.right', { u: U })),
      ...cutRow('bank', t('sx.su957.cut.bank', { u: U })),
      ...cutRow('n', t('sx.su957.cut.n')),
      ...cutRow('nOver', t('sx.su957.cut.nover'))));
    out.push(el('p', { className: 'cv-note' }, t('sx.su957.cut.note')));
    out.push(el('div', { className: 'cv-actions' }, el('button', { type: 'button', className: 'btn-line btn-sm-cc', 'data-river-recut': '', onclick: () => {
      const sf = ctx.surface();
      if (!sf) { ctx.say(t('sx.su957.need.surface')); return; }
      const v = {};
      for (const [k, inp] of Object.entries(cutIn)) {
        const n = Number(inp.value);
        const okv = k === 'n' || k === 'nOver' ? n > 0 && n < 1 : n > 0 && n < 1e5;
        if (!okv) { inp.setAttribute('aria-invalid', 'true'); inp.focus(); ctx.say(t('sx.su957.cut.bad')); return; }
        v[k] = n;
      }
      edit(id, t('sx.su957.undo.recut'), (q) => {
        q.settings = v;
        q.sections = sectionsAlong(sf, q.centreline, { ...v, units: q.units });
        q.sections.forEach((s, i) => { s.id = 'xs' + (i + 1); });
        setReachLengths(q);
      });
      ctx.say(t('sx.su957.recut.done', { n: find(id)?.sections.length || 0 }));
    } }, t('sx.su957.recut'))));

    // the sections table: banks, n, reach lengths, coefficients
    const cols = [t('sx.su957.c.rs'), t('sx.su957.x.bl'), t('sx.su957.x.br'), t('sx.su957.x.nch'), t('sx.su957.x.nob'), t('sx.su957.x.llob'), t('sx.su957.x.lch'), t('sx.su957.x.lrob'), t('sx.su957.x.cc'), t('sx.su957.x.ce'), t('sx.su957.x.edit'), ''];
    const secs = r.sections.slice().sort((a, b) => b.rs - a.rs);
    const setSec = (sid, fn) => edit(id, t('sx.su957.undo.xsedit'), (q) => { const s = q.sections.find((x) => x.id === sid); if (s) fn(s, q); });
    const editSection = (sid) => {
      const s = find(id)?.sections.find((x) => x.id === sid);
      if (!s) return;
      openSectionEditor({ el, root: ctx.root, t, section: s, units: RU(), say: ctx.say, onApply: (patch) => setSec(sid, (x) => { const ch = nOf(x, 'ch'), ob = nOf(x, 'ob'); x.banks = patch.banks; setN(x, ch, ob); x.levees = patch.levees; x.ineff = patch.ineff; }) });
    };
    const nOf = (s, where) => { const z = (s.n || []).slice().sort((a, b) => a.o - b.o); const mid = where === 'ch' ? (s.banks[0] + s.banks[1]) / 2 : s.pts[0].o; let n = z[0]?.n; for (const x of z) if (x.o <= mid + 1e-9) n = x.n; return n; };
    const setN = (s, ch, ob) => { const lo = s.pts[0].o; s.n = [{ o: lo, n: ob }, { o: s.banks[0], n: ch }, { o: s.banks[1], n: ob }]; };
    out.push(el('div', { className: 'cv-table-wrap' }, el('table', { className: 'cv-table', 'data-river-sections': '' },
      el('caption', {}, t('sx.su957.x.caption', { u: U })),
      el('thead', {}, el('tr', {}, ...cols.map((h) => el('th', { scope: 'col' }, h)))),
      el('tbody', {}, ...secs.map((s) => el('tr', { 'data-river-xs': s.id },
        el('th', { scope: 'row', className: 'num' }, fx(s.rs, 2)),
        el('td', {}, numCell(Number(s.banks[0].toFixed(3)), (n) => { if (!(n >= s.pts[0].o && n < s.banks[1])) return false; setSec(s.id, (x) => { const ch = nOf(x, 'ch'), ob = nOf(x, 'ob'); x.banks = [n, x.banks[1]]; setN(x, ch, ob); }); }, t('sx.su957.x.bl'), `cv-rv-bl-${s.id}`, '4.5rem')),   // i18n-ignore: element ids
        el('td', {}, numCell(Number(s.banks[1].toFixed(3)), (n) => { if (!(n <= s.pts[s.pts.length - 1].o && n > s.banks[0])) return false; setSec(s.id, (x) => { const ch = nOf(x, 'ch'), ob = nOf(x, 'ob'); x.banks = [x.banks[0], n]; setN(x, ch, ob); }); }, t('sx.su957.x.br'), `cv-rv-br-${s.id}`, '4.5rem')),   // i18n-ignore: element ids
        el('td', {}, numCell(nOf(s, 'ch'), (n) => { if (!(n > 0 && n < 1)) return false; setSec(s.id, (x) => setN(x, n, nOf(x, 'ob'))); }, t('sx.su957.x.nch'), `cv-rv-nch-${s.id}`, '4rem')),   // i18n-ignore: element ids
        el('td', {}, numCell(nOf(s, 'ob'), (n) => { if (!(n > 0 && n < 1)) return false; setSec(s.id, (x) => setN(x, nOf(x, 'ch'), n)); }, t('sx.su957.x.nob'), `cv-rv-nob-${s.id}`, '4rem')),   // i18n-ignore: element ids
        ...['lob', 'ch', 'rob'].map((k) => el('td', {}, numCell(s.reach?.[k] ?? null, (n) => { if (!(n >= 0)) return false; setSec(s.id, (x) => { x.reach = { ...x.reach, [k]: n }; }); }, t('sx.su957.x.l' + k), `cv-rv-l${k}-${s.id}`, '4.5rem'))),
        el('td', {}, numCell(s.cc, (n) => { if (!(n >= 0 && n <= 1)) return false; setSec(s.id, (x) => { x.cc = n; }); }, t('sx.su957.x.cc'), `cv-rv-cc-${s.id}`, '3.5rem')),   // i18n-ignore: element ids
        el('td', {}, numCell(s.ce, (n) => { if (!(n >= 0 && n <= 1)) return false; setSec(s.id, (x) => { x.ce = n; }); }, t('sx.su957.x.ce'), `cv-rv-ce-${s.id}`, '3.5rem')),   // i18n-ignore: element ids
        el('td', {}, el('button', { type: 'button', className: 'cv-linkbtn', 'data-river-xsedit': s.id, 'aria-label': t('sx.su957.x.edit.aria', { rs: fx(s.rs, 2) }), onclick: () => editSection(s.id) }, t('sx.su957.x.edit') + (s.levees || (s.ineff || []).length ? ' •' : ''))),
        el('td', {}, el('button', { type: 'button', className: 'cv-linkbtn', 'aria-label': t('sx.su957.x.remove', { rs: fx(s.rs, 2) }), onclick: () => edit(id, t('sx.su957.undo.xsdel'), (q) => { q.sections = q.sections.filter((x) => x.id !== s.id); setReachLengths(q); }) }, el('i', { className: 'bi bi-x-lg', 'aria-hidden': 'true' })))))))));
    out.push(el('p', { className: 'cv-note' }, t('sx.su957.x.note')));
    out.push(el('div', { className: 'cv-actions' }, el('button', { type: 'button', className: 'btn-line btn-sm-cc cv-danger', onclick: () => { if (remove({ kind: 'river', id })) { ctx.select(null); } } }, el('i', { className: 'bi bi-trash3', 'aria-hidden': 'true' }), ' ', t('sx.su957.delete'))));
    box.replaceChildren(...out);
    return true;
  }

  /** The plan's own layers for the drawing, the PDF and the DWG: centreline, cut lines with their stations, the flood extent shown. */
  function sceneItems() {
    const out = [];
    for (const r of list()) {
      if (r.centreline.length >= 2) out.push({ layer: 'C-WATR-CNTR', kind: 'poly', pts: r.centreline.map((p) => ({ x: p.x, y: p.y })), closed: false });
      for (const s of r.sections) {
        if (!(s.line?.length >= 2)) continue;
        out.push({ layer: 'C-WATR-SCTN', kind: 'poly', pts: s.line.map((p) => ({ x: p.x, y: p.y })), closed: false });
        out.push({ layer: 'C-WATR-SCTN', kind: 'text', x: s.line[0].x, y: s.line[0].y, mm: 1.8, rot: 0, align: 'center', middle: true, text: t('sx.su957.rs.label', { rs: fx(s.rs, 0) }) });
      }
      if (view.extent.get(r.id)) {
        const e = extentOf(r.id, view.profile.get(r.id));
        if (e) for (const line of e.outline) if (line.length >= 2) out.push({ layer: 'C-WATR-FLOD', kind: 'poly', pts: line.map((p) => ({ x: p.x, y: p.y })), closed: false });
      }
    }
    return out;
  }

  function remove(sel) {
    if (!isMine(sel) || !find(sel.id)) return false;
    P().change(t('sx.su957.undo.del'), (st) => { st.rivers = (st.rivers || []).filter((r) => r.id !== sel.id); });
    cache.delete(sel.id);
    return true;
  }

  // ---- results dialog
  function resultsDialog(id) {
    const r = find(id);
    if (!r) return;
    const c = results(id), res = c.result, U = r.units === 'ft' ? 'ft' : 'm';
    const did = 'cv-rv-res';
    document.getElementById(did)?.remove();
    const close = el('button', { type: 'button', className: 'cv-x', 'aria-label': t('sx.su957.close') }, el('i', { className: 'bi bi-x-lg', 'aria-hidden': 'true' }));
    const body = el('div', { className: 'cv-dlg-body' });
    const pick = el('select', { className: 'cv-select', id: did + '-pf', 'data-river-respf': '' }, ...res.profiles.map((p) => el('option', { value: p.name }, p.name)));
    if (view.profile.get(id)) pick.value = view.profile.get(id);
    const model = cleanRiver(r);
    const stem = () => (ctx.fileStem() || 'civilcraft') + '-' + (r.name || r.id).replace(/[^\w.-]+/g, '-');
    const issues = res.issues.length ? el('ul', { className: 'cv-plainlist', 'data-river-issues': '' }, ...res.issues.map((i) => el('li', {}, t('sx.su957.issue.' + i.code, { rs: fx(i.rs, 2), profile: i.profile || '' })))) : '';
    function draw() {
      const p = res.profiles.find((x) => x.name === pick.value) || res.profiles[0];
      if (!p) { body.replaceChildren(el('p', { className: 'cv-note', 'data-river-review': '' }, t('sx.su957.review')), el('p', {}, t('sx.su957.cannot')), issues); return; }
      view.profile.set(id, p.name);
      const plot = el('div', { className: 'cv-river-plot', 'data-river-plot': '', style: 'overflow-x:auto;max-width:100%' });
      plot.innerHTML = profileSvg(model, p, { t });   // our own SVG; every text in it is escaped by profileSvg
      const head = header(t, U), rows = tableRows(p, { t });
      const counts = Object.entries(p.flags);
      body.replaceChildren(
        el('p', { className: 'cv-note', 'data-river-review': '' }, el('strong', {}, t('sx.su957.review'))),
        el('p', { className: 'cv-note', 'data-river-defaults': '' }, t('sx.su957.defaults')),
        el('div', { className: 'cv-row' }, el('label', { for: pick.id }, t('sx.su957.extent.profile')), pick),
        plot,
        structuresTable(p, { el, t, units: r.units }) || '',
        junctionTable(Math.max(0, res.profiles.indexOf(p)), c.group, { el, t, units: r.units }) || '',
        issues,
        counts.length ? el('ul', { className: 'cv-plainlist', 'data-river-flags': '' }, ...counts.map(([k, n]) => el('li', {}, t('sx.su957.flag.' + k, { n })))) : el('p', { className: 'cv-note' }, t('sx.su957.noflags')),
        el('div', { className: 'cv-table-wrap' }, el('table', { className: 'cv-table', 'data-river-table': '' },
          el('thead', {}, el('tr', {}, ...head.map((h) => el('th', { scope: 'col' }, h)))),
          el('tbody', {}, ...rows.map((row) => el('tr', {}, ...row.map((v, i) => el(i === 0 ? 'th' : 'td', i === 0 ? { scope: 'row', className: 'num' } : { className: i < row.length - 1 ? 'num' : '' }, v))))))));
    }
    pick.addEventListener('change', () => { draw(); ctx.redraw(); });
    const btn = (label, icon, fn, data) => el('button', { type: 'button', className: 'btn-line btn-sm-cc', [data]: '', onclick: fn }, el('i', { className: 'bi bi-' + icon, 'aria-hidden': 'true' }), ' ', label);   // i18n-ignore: icon class
    const cur = () => res.profiles.find((x) => x.name === pick.value) || res.profiles[0];
    const dlg = el('dialog', { className: 'cv-dialog cv-pcdlg', id: did, 'aria-labelledby': did + '-h', 'data-river-dialog': '' },
      el('div', { className: 'cv-dlg' },
        el('div', { className: 'cv-dlg-head' }, el('h2', { className: 'cv-h', id: did + '-h' }, t('sx.su957.res.title', { name: r.name || r.id })), close),
        body,
        el('div', { className: 'cv-dlg-foot' },
          btn(t('sx.su957.res.csv'), 'download', () => { const p = cur(); if (p) { ctx.download(stem() + '-' + p.name.replace(/[^\w.-]+/g, '-') + '.csv', new Blob(['﻿' + tableCsv(p, { units: U, t })], { type: 'text/csv' })); ctx.say(t('sx.su957.saved')); } }, 'data-river-csv'),
          btn(t('sx.su957.res.report'), 'file-text', () => { ctx.download(stem() + '-report.txt', new Blob([reportText(model, res, { t, date: new Date().toISOString().slice(0, 10) })], { type: 'text/plain' })); ctx.say(t('sx.su957.saved')); }, 'data-river-report'),
          btn(t('sx.su957.res.svg'), 'graph-up', () => { const p = cur(); if (p) { ctx.download(stem() + '-profile.svg', new Blob([profileSvg(model, p, { t })], { type: 'image/svg+xml' })); ctx.say(t('sx.su957.saved')); } }, 'data-river-svg'),
          el('button', { type: 'button', className: 'btn-line btn-sm-cc', onclick: () => dlg.close() }, t('sx.su957.close')))));
    close.onclick = () => dlg.close();
    dlg.addEventListener('close', () => dlg.remove());
    ctx.root.append(dlg);
    draw();
    dlg.showModal();
    const nFlags = res.profiles.reduce((a, p) => a + Object.values(p.flags).reduce((x, y) => x + y, 0), 0);
    ctx.say(res.profiles.length ? t('sx.su957.ran', { p: res.profiles.length, flags: nFlags }) : t('sx.su957.cannot'));
  }

  // ---- plan
  function pick(w, tol) {
    let best = null, bd = tol;
    for (const r of list()) {
      const at = locateOn(r.centreline, w);
      if (at && Math.abs(at.off) < bd) { bd = Math.abs(at.off); best = { kind: 'river', id: r.id }; }
      for (const s of r.sections) {
        if (!s.line?.length) continue;
        const a = locateOn(s.line, w);
        if (a && Math.abs(a.off) < bd) { bd = Math.abs(a.off); best = { kind: 'river', id: r.id }; }
      }
    }
    return best;
  }

  function overlay(c2d, S, C, sel) {
    const rs = list();
    if (!rs.length) return;
    const blue = C.blue || C.action;
    c2d.save();
    for (const r of rs) {
      const on = sel?.kind === 'river' && sel.id === r.id;
      if (view.extent.get(r.id)) {
        const e = extentOf(r.id, view.profile.get(r.id));
        if (e) {
          c2d.fillStyle = blue; c2d.globalAlpha = 0.22;
          c2d.beginPath();
          for (const poly of e.wet) poly.forEach((p, i) => { const q = S(p.x, p.y); i ? c2d.lineTo(q.x, q.y) : c2d.moveTo(q.x, q.y); });
          c2d.fill();
          c2d.globalAlpha = 1; c2d.strokeStyle = blue; c2d.lineWidth = 1.5;
          for (const ln of e.outline) { c2d.beginPath(); ln.forEach((p, i) => { const q = S(p.x, p.y); i ? c2d.lineTo(q.x, q.y) : c2d.moveTo(q.x, q.y); }); c2d.stroke(); }
        }
      }
      c2d.strokeStyle = on ? C.action : blue; c2d.lineWidth = on ? 3 : 2; c2d.globalAlpha = 1;
      c2d.beginPath();
      r.centreline.forEach((p, i) => { const q = S(p.x, p.y); i ? c2d.lineTo(q.x, q.y) : c2d.moveTo(q.x, q.y); });
      c2d.stroke();
      // flow arrows every ~120 px
      const pts = r.centreline.map((p) => S(p.x, p.y));
      let acc = 0;
      for (let i = 1; i < pts.length; i++) {
        const a = pts[i - 1], b = pts[i], L = Math.hypot(b.x - a.x, b.y - a.y);
        for (let d = (120 - acc % 120) % 120; d < L; d += 120) {
          const u = d / L, x = a.x + (b.x - a.x) * u, y = a.y + (b.y - a.y) * u, ang = Math.atan2(b.y - a.y, b.x - a.x);
          c2d.beginPath(); c2d.moveTo(x + 7 * Math.cos(ang), y + 7 * Math.sin(ang));
          c2d.lineTo(x + 7 * Math.cos(ang + 2.5), y + 7 * Math.sin(ang + 2.5)); c2d.lineTo(x + 7 * Math.cos(ang - 2.5), y + 7 * Math.sin(ang - 2.5)); c2d.closePath();
          c2d.fillStyle = c2d.strokeStyle; c2d.fill();
        }
        acc += L;
      }
      c2d.lineWidth = on ? 1.25 : 0.75; c2d.globalAlpha = on ? 1 : 0.6;
      for (const s of r.sections) {
        if (!s.line?.length) continue;
        c2d.beginPath(); s.line.forEach((p, i) => { const q = S(p.x, p.y); i ? c2d.lineTo(q.x, q.y) : c2d.moveTo(q.x, q.y); }); c2d.stroke();
        if (on) { const q = S(s.line[0].x, s.line[0].y); c2d.fillStyle = C.ink2 || C.action; c2d.font = '11px sans-serif'; c2d.fillText(fx(s.rs, 0), q.x + 3, q.y - 3); }
      }
    }
    c2d.restore();
  }

  return {
    ownsTool: (tl) => TOOLS.includes(tl),
    hints: { river: 'sx.su957.hint.river', 'river-xs': 'sx.su957.hint.xs' },
    command, finish, block, isMine, props, remove, pick, overlay, sceneItems, list, find, results,
  };
}
