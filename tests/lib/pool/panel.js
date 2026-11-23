/* SPDX-License-Identifier: Apache-2.0 */
/**
 * panel.js — the pool generator's panel (0.11 POOL.1), the same in every host. The only file of lib/pool that touches a page, and only inside
 * mountPanel(). Text is always set as text, never as HTML.
 *
 * mountPanel(root, host) → { result() (the current design), refresh(), set(values) }.
 * host = { t(key, vars), storage: { get(k), set(k, v) }, download(name, text, type), problems?: { set(list) },
 *          actions: [{ id, label, run(result) → text to show | Promise }], notes?: [text] }
 * The spec packs on offer are whatever side add-ons registered (spec.js registerSpec; event 'cc-pool-specs').
 */
import { design } from './index.js';
import { GOVERNED, DEFAULTS, KINDS, SETTINGS, USES, OVERFLOWS, SIDES, UNIT_SYSTEMS } from './model.js';
import { registeredSpecs, citation } from './spec.js';
import { sheetEnts, extent } from './drawings.js';
import { reportCsv, reportMd, offerBinderPage } from './report.js';
import { FIELD_KIND, fieldUnit, showField, readField, formatFtIn, cornersToMm, cornersShown, benchesToMm, benchesShown, shown, imperial } from './units.js';
import { toIfc } from './ifcout.js';

const NS = 'http://www.w3.org/2000/svg';
function el(tag, attrs = {}, ...kids) {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) { if (k === 'className') n.className = v; else if (k.startsWith('on')) n[k] = v; else if (v !== false && v !== null && v !== undefined) n.setAttribute(k, v === true ? '' : String(v)); }
  for (const c of kids.flat()) if (c !== null && c !== undefined && c !== false) n.append(c);
  return n;
}
const sv = (name, attrs = {}) => { const n = document.createElementNS(NS, name); for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, String(v)); return n; };
const CSS = `
.pool-panel{display:grid;grid-template-columns:minmax(0,1fr);gap:.6rem;font-size:.9em;min-width:0;max-width:100%;overflow-wrap:anywhere}
.pool-panel p{white-space:normal;margin:.2rem 0}
.pool-panel details{border:1px solid var(--line,#7a8796);border-radius:4px;padding:.3rem .5rem}
.pool-panel summary{cursor:pointer;font-weight:600}
.pool-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.35rem .6rem;margin:.4rem 0}
.pool-field{display:grid;gap:.1rem;min-width:0;align-content:start}
.pool-field span{font-size:.85em;opacity:.85}
.pool-field input,.pool-field select{width:100%;box-sizing:border-box;background:#fff;color:#111;border:1px solid #9aa5b1;border-radius:3px;padding:.2rem .3rem}
.pool-field small{font-size:.75em;opacity:.8}
.pool-wide{grid-column:1/-1}
.pool-field textarea{width:100%;box-sizing:border-box;background:#fff;color:#111;border:1px solid #9aa5b1;border-radius:3px;padding:.2rem .3rem;font:inherit;resize:vertical}
.pool-note{margin:.2rem 0;font-size:.85em;opacity:.9}
.pool-warn{color:#b45309}
.pool-err{color:#b91c1c}
.pool-table{width:100%;border-collapse:collapse;font-size:.85em;table-layout:fixed}
.pool-table td,.pool-table th{text-align:left;padding:.12rem .3rem;border-bottom:1px solid rgba(128,128,128,.25);vertical-align:top}
.pool-pic{width:100%;height:auto;max-height:22rem;background:rgba(128,128,128,.08);border-radius:4px}
.pool-row{display:flex;flex-wrap:wrap;gap:.4rem;margin:.3rem 0}
.pool-tag{display:inline-block;border-radius:999px;padding:0 .4rem;font-size:.75em;border:1px solid currentColor}
`;
const LAYER_INK = { 'POOL-SHELL': 'currentColor', 'POOL-WATER': '#2f8fd8', 'POOL-FINISH': '#3aa7c9', 'POOL-SURROUND': '#9a8f7a', 'POOL-ROOM': '#888', 'POOL-EQUIP': '#b0489b', 'POOL-PIPE-SUCTION': '#2e7d32', 'POOL-PIPE-RETURN': '#1565c0', 'POOL-TEXT': 'currentColor', 'POOL-DIMS': '#c58a00' };

/** The plan and section as a picture (y up in the drawing, down on the screen). */
export function picture(ents) {
  const b = extent(ents), w = Math.max(1, b[2] - b[0]), h = Math.max(1, b[3] - b[1]), pad = Math.max(w, h) * 0.04, lw = Math.max(w, h) / 500;
  const svg = sv('svg', { viewBox: `${b[0] - pad} ${-(b[3] + pad)} ${w + 2 * pad} ${h + 2 * pad}`, class: 'pool-pic', role: 'img', preserveAspectRatio: 'xMidYMid meet' });
  for (const e of ents) {
    const ink = LAYER_INK[e.layer] || 'currentColor';
    if (e.type === 'poly') svg.append(sv(e.closed ? 'polygon' : 'polyline', { points: e.pts.map((p) => p[0].toFixed(1) + ',' + (-p[1]).toFixed(1)).join(' '), fill: 'none', stroke: ink, 'stroke-width': /PIPE/.test(e.layer) ? lw * 2.5 : lw }));
    else if (e.type === 'line') svg.append(sv('line', { x1: e.a[0], y1: -e.a[1], x2: e.b[0], y2: -e.b[1], stroke: ink, 'stroke-width': lw }));
    else if (e.type === 'text') { const tx = sv('text', { x: e.at[0], y: -e.at[1], 'font-size': e.h * 1.3, fill: ink, 'text-anchor': e.ha === 'left' ? 'start' : e.ha === 'right' ? 'end' : 'middle' }); tx.textContent = e.s; svg.append(tx); }
    else if (e.type === 'dim') {
      const len = e.rot === 90 ? Math.abs(e.p2[1] - e.p1[1]) : Math.abs(e.p2[0] - e.p1[0]);
      const a = e.rot === 90 ? [e.loc[0], e.p1[1]] : [e.p1[0], e.loc[1]], c = e.rot === 90 ? [e.loc[0], e.p2[1]] : [e.p2[0], e.loc[1]];
      svg.append(sv('line', { x1: a[0], y1: -a[1], x2: c[0], y2: -c[1], stroke: ink, 'stroke-width': lw }));
      const tx = sv('text', { x: e.loc[0] + (e.rot === 90 ? -lw * 30 : 0), y: -e.loc[1] - lw * 20, 'font-size': 150, fill: ink, 'text-anchor': 'middle' }); tx.textContent = String(Math.round(len)); svg.append(tx);
    }
  }
  return svg;
}

const SECTIONS = [
  ['shape', ['name', 'units', 'kind', 'setting', 'use', 'shape', 'length', 'width', 'notchL', 'notchW', 'corners', 'depthShallow', 'depthDeep', 'overflow', 'freeboard', 'steps', 'stepsEdge', 'stepsAt', 'stepWidth', 'riser', 'tread', 'benches', 'benchSeat', 'benchDepth']],
  ['shell', ['wall', 'floor', 'concreteMPa', 'coverWater', 'coverEarth', 'rebarRatio', 'rebarMode', 'barDia', 'barSpacing', 'lapDia']],
  ['finish', ['finish', 'tileL', 'tileW', 'joint', 'waste', 'copingWidth', 'copingThickness', 'pavingWidth', 'pavingThickness', 'paverL', 'paverW', 'barrierHeight', 'gateWidth', 'gateSide', 'gutterWidth', 'gutterDepth', 'gutterWall']],
  ['water', ['turnoverH', 'filterRate', 'vSuction', 'vReturn', 'skimmerArea', 'inletFlow', 'surfaceShare', 'pumpHeadMode', 'pumpHead', 'hwC', 'fittingK', 'equipLoss', 'pumpEff', 'balancePct', 'jets', 'jetFlow']],
  ['room', ['roomSide', 'roomGap', 'roomHeight', 'roomWall']],
];
const CHOICES = { pumpHeadMode: ['given', 'calculated'], kind: KINDS, setting: SETTINGS, use: USES, overflow: OVERFLOWS, roomSide: SIDES, steps: ['none', 'side', 'full'],
  shape: ['rect', 'L', 'round', 'free'], gateSide: SIDES, rebarMode: ['ratio', 'bars'], units: UNIT_SYSTEMS };
const AREAS = new Set(['corners', 'benches']);
const fx = (v, dp = 2) => (Number.isFinite(v) ? Number(v).toLocaleString('en-US', { maximumFractionDigits: dp }) : '–');

export function mountPanel(root, host) {
  const t = host.t;
  if (!document.getElementById('pool-panel-css')) document.head.append(el('style', { id: 'pool-panel-css' }, CSS));
  let raw = {}; try { raw = host.storage.get('pool') || {}; } catch { raw = {}; }
  let specId = ''; try { specId = host.storage.get('spec') || ''; } catch { specId = ''; }
  let current = null;
  const inputs = new Map(), hints = new Map(), bad = new Map();
  const status = el('p', { className: 'pool-note', role: 'status' });
  const spec = () => registeredSpecs().find((s) => s.id === specId) || null;
  const save = () => { try { host.storage.set('pool', raw); host.storage.set('spec', specId); } catch { /* storage is a convenience */ } };

  const sys = () => (raw.units === 'imperial' ? 'imperial' : 'metric');
  const field = (k) => {
    let input;
    const us = imperial(sys()) && FIELD_KIND[k];
    if (CHOICES[k]) input = el('select', { 'data-pool': k }, CHOICES[k].map((c) => el('option', { value: c }, t('pool.opt.' + k + '.' + c))));
    else if (AREAS.has(k)) input = el('textarea', { 'data-pool': k, rows: 3, maxlength: k === 'corners' ? 6000 : 2000, placeholder: t('pool.ph.' + k) });
    else if (k === 'name') input = el('input', { type: 'text', 'data-pool': k, maxlength: 80 });
    else if (us) input = el('input', { type: 'text', 'data-pool': k, inputmode: 'text', spellcheck: 'false' });
    else input = el('input', { type: 'number', step: 'any', 'data-pool': k });
    const v = raw[k] ?? (k in DEFAULTS ? DEFAULTS[k] : '');
    input.value = v === null || v === undefined ? '' : k === 'corners' ? cornersShown(v, sys()) : k === 'benches' ? benchesShown(v, sys()) : us ? showField(k, v, sys()) : String(v);
    const hint = el('small', {}); hints.set(k, hint);
    input.onchange = () => {
      const s = input.value.trim();
      bad.delete(k);
      if (s === '') delete raw[k];
      else if (k === 'corners' || k === 'benches') { const r = k === 'corners' ? cornersToMm(s, sys()) : benchesToMm(s, sys()); raw[k] = r.text; if (r.bad.length) bad.set(k, r.bad[0]); }
      else if (CHOICES[k] || k === 'name') raw[k] = s;
      else if (us) { const mm = readField(k, s, sys()); if (Number.isFinite(mm)) raw[k] = Math.round(mm * 1000) / 1000; else bad.set(k, s); }
      else raw[k] = Number(s);
      save();
      if (k === 'units') { draw(); return; }
      refresh();
    };
    inputs.set(k, input);
    const unit = CHOICES[k] || k === 'name' || AREAS.has(k) ? '' : FIELD_KIND[k] ? t('pool.u.' + fieldUnit(k, sys())) : t('pool.unit.' + k);
    return el('label', { className: 'pool-field' + (AREAS.has(k) ? ' pool-wide' : '') }, el('span', {}, t('pool.f.' + k) + (unit ? ' (' + unit + ')' : '')), input, hint);
  };
  const specSel = el('select', { 'data-pool': 'spec' });
  specSel.onchange = () => { specId = specSel.value; save(); refresh(); };
  const specNote = el('div'), specTable = el('div');
  const fillSpecs = () => {
    const list = registeredSpecs();
    specSel.replaceChildren(el('option', { value: '' }, t('pool.spec.none')), ...list.map((s) => el('option', { value: s.id }, s.name)));
    specSel.value = list.some((s) => s.id === specId) ? specId : '';
    specNote.replaceChildren(el('p', { className: 'pool-note' + (list.length ? '' : ' pool-warn') }, list.length ? t('pool.spec.pick') : t('pool.spec.add')));
  };
  const pic = el('div'), out = el('div'), actions = el('div', { className: 'pool-row' });
  const table = (rows) => el('table', { className: 'pool-table' }, el('tbody', {}, rows.map((r) => el('tr', { className: r.cls || '' }, r.cells.map((c) => el('td', {}, c ?? ''))))));
  const run = async (fn) => { try { const m = await fn(current); status.textContent = m || ''; status.className = 'pool-note'; } catch (err) { status.textContent = String((err && err.message) || err); status.className = 'pool-note pool-err'; } };
  const base = () => String(current.design.name || 'pool').replace(/[^\w.-]+/g, '-').slice(0, 60) || 'pool';
  const buttons = [
    ...(host.actions || []),
    { id: 'ifc', label: t('pool.act.ifc'), run: (r) => { host.download(base() + '.ifc', toIfc(r), 'application/x-step'); return t('pool.act.ifc.done'); } },
    { id: 'csv', label: t('pool.act.csv'), run: (r) => { host.download(base() + '-quantities.csv', reportCsv(r, t), 'text/csv'); return t('pool.act.csv.done'); } },
    { id: 'md', label: t('pool.act.md'), run: (r) => { host.download(base() + ' calculation.md', reportMd(r, t, fmt()), 'text/markdown'); return t('pool.act.md.done'); } },
  ];
  const fmt = () => (imperial(sys()) ? { len: (mm) => formatFtIn(mm) } : { len: (mm) => fx(mm, 0) + ' mm' });
  const showQ = (v, unit, dp = 2) => { const o = shown(v, unit, sys()); return fx(o.value, dp) + ' ' + o.unit; };
  actions.append(...buttons.map((b) => el('button', { type: 'button', className: 'btn-line', 'data-pool-act': b.id, onclick: () => run(b.run) }, b.label)));

  function refresh() {
    fillSpecs();
    current = design(raw, spec());
    current.at = [Number(raw.atX) || 0, Number(raw.atY) || 0];
    const r = current, d = r.design, c = r.circ;
    for (const [k, input] of inputs) {
      const hint = hints.get(k);
      if (k === 'atX' || k === 'atY') continue;
      if (k in GOVERNED) {
        const b = r.basis[k];
        input.placeholder = FIELD_KIND[k] && imperial(sys()) ? showField(k, b.value, sys()) : String(b.value);
        hint.textContent = t('pool.from.' + b.from) + (b.limit !== null ? ' · ' + t('pool.limit.' + GOVERNED[k].how, { v: fx(b.limit, 4) }) : '');
        hint.className = b.from === 'start' ? 'pool-warn' : '';
      } else if (bad.has(k)) { hint.textContent = t('pool.err.text', { text: bad.get(k) }); hint.className = 'pool-err'; }
      else { const no = r.inputProblems.find((p) => p.field === k); hint.textContent = no ? t('pool.err.' + no.why, no) : ''; hint.className = no ? 'pool-err' : ''; }
    }
    const fountain = d.kind === 'fountain';
    for (const [k, hide] of [['depthDeep', fountain], ['steps', fountain], ['overflow', fountain], ['jets', !fountain], ['jetFlow', !fountain], ['stepWidth', d.steps !== 'side'], ['riser', d.steps === 'none'], ['tread', d.steps === 'none'],
      ['gutterWidth', d.overflow !== 'gutter'], ['gutterDepth', d.overflow !== 'gutter'], ['gutterWall', d.overflow !== 'gutter'], ['balancePct', d.overflow !== 'gutter'], ['freeboard', d.overflow === 'gutter'], ['skimmerArea', d.overflow === 'gutter' || fountain], ['surfaceShare', d.overflow === 'gutter' || fountain],
      ['notchL', d.shape !== 'L'], ['notchW', d.shape !== 'L'], ['corners', d.shape !== 'free'], ['length', d.shape === 'free'], ['width', d.shape === 'free'],
      ['stepsEdge', d.steps === 'none' || fountain], ['stepsAt', d.steps === 'none' || fountain || !(d.stepsEdge > 0)], ['benches', fountain], ['benchSeat', fountain || !String(d.benches || '').trim()], ['benchDepth', fountain || !String(d.benches || '').trim()],
      ['gateWidth', !(d.barrierHeight > 0)], ['gateSide', !(d.barrierHeight > 0)], ['barDia', d.rebarMode !== 'bars'], ['lapDia', d.rebarMode !== 'bars']]) if (inputs.has(k)) inputs.get(k).closest('label').hidden = hide;
    const s = spec();
    specTable.replaceChildren(s ? el('div', {},
      el('p', { className: 'pool-note' }, t('pool.spec.counts', { primary: s.counts.primary, secondary: s.counts.secondary, none: s.counts.none })),
      table(Object.values(s.values).map((v) => ({ cls: v.read === 'none' ? 'pool-warn' : '', cells: [v.rule, v.read === 'none' ? t('pool.read.none') : v.label + (v.us ? ' (' + v.us.trim() + ')' : ''), v.read === 'none' ? '' : citation(s, v), v.read === 'none' ? '' : t('pool.read.' + v.read)] })))) : '');
    try { pic.replaceChildren(picture(sheetEnts(r, { depth: t('pool.w.depth'), room: t('pool.w.room'), filter: t('pool.w.filter'), pump: t('pool.w.pump'), tank: t('pool.w.tank'), panel: t('pool.w.panel'), section: t('pool.w.section'), water: t('pool.w.water'), gate: t('pool.w.gate') }, imperial(sys()) ? formatFtIn : null))); } catch { pic.replaceChildren(); }
    const issues = [
      ...r.checks.map((x) => ({ sev: x.severity, text: t(x.key, { ...x.vars, what: x.vars.what ? t('pool.f.' + x.vars.what) : '', value: fx(x.vars.value, 4), limit: fx(x.vars.limit, 4) }) + (x.cite ? ' — ' + x.cite + ' (' + t('pool.read.' + x.read) + ')' : ''), code: x.code })),
      ...r.problems.map((p) => ({ sev: 'warning', text: t('pool.problem.' + p.code, p.vars), code: 'pool.' + p.code })),
    ];
    out.replaceChildren(
      el('p', { className: 'pool-note' }, t('pool.shape.line', { area: showQ(r.shape.area, 'm2'), perimeter: showQ(r.shape.perimeter, 'm'), sides: r.shape.sides })),
      el('h4', {}, t('pool.report.circulation')),
      table([
        [t('pool.q.water'), showQ(c.volume, 'm3')], [t('pool.c.flow'), showQ(c.flow, 'm3/h')], [t('pool.c.turnover'), fx(c.turnoverH) + ' h'],
        [t('pool.c.filter'), c.filter.count + ' × ' + c.filter.diameter + ' mm · ' + fx(c.filter.rate) + ' m/h'],
        [t('pool.c.pump'), c.pump.count + ' × ' + fx(c.pump.flowEach) + ' m³/h · ' + fx(c.pump.head) + ' m · ' + c.pump.motorKw + ' kW'],
        [t('pool.c.loop'), fx(c.loop.total) + ' m · ' + fx(c.loop.suction) + ' + ' + fx(c.loop.ret) + ' + ' + fx(c.loop.equip)],
        ...Object.entries(c.lines).filter(([, l]) => l.flow > 0).map(([k, l]) => [t('pool.line.' + k), 'DN' + l.dn + ' · ' + fx(l.flow) + ' m³/h · ' + fx(l.velocity) + ' m/s']),
      ].map((cells) => ({ cells }))),
      el('p', { className: 'pool-note pool-warn' }, t('pool.series.note')),
      el('p', { className: 'pool-note pool-warn' }, t('pool.c.loopNote')),
      el('h4', {}, t('pool.report.quantities')),
      table([...r.quantities.rows.map((q) => ({ cells: [t('pool.q.' + q.id), (q.unit === 'n' ? fx(q.value, 0) : showQ(q.value, q.unit)) + (q.note ? ' · ' + t('pool.q.estimate') : '')] })),
        ...r.quantities.pipes.map((p) => ({ cells: [t('pool.line.' + p.system) + ' DN' + p.dn, showQ(p.length, 'm') + ' · ' + p.bends + ' ' + t('pool.q.bends') + (p.junctions ? ' · ' + p.junctions + ' ' + t('pool.q.junctions') : '')] }))]),
      el('p', { className: 'pool-note' }, t('pool.net.line', { segments: r.net.segments.length, fittings: r.net.fittings.length, links: r.net.links.length })),
      el('h4', {}, t('pool.report.bars')),
      r.rebar.marks.length ? table(r.rebar.marks.map((m) => ({ cells: [m.mark + ' · ' + t('pool.bar.w.' + m.where), (imperial(sys()) ? showField('barDia', m.dia, sys()) : m.dia + ' mm') + ' @ ' + (imperial(sys()) ? showField('barSpacing', m.spacing, sys()) : m.spacing + ' mm') + ' · ' + m.count + ' · ' + showQ(m.total, 'm') + ' · ' + showQ(m.mass, 'kg', 0)] }))) : '',
      el('p', { className: 'pool-note pool-warn' }, t('pool.bar.note')),
      el('h4', {}, t('pool.report.checks')),
      issues.length ? table(issues.map((i) => ({ cls: i.sev === 'error' ? 'pool-err' : i.sev === 'warning' ? 'pool-warn' : '', cells: [t('pool.sev.' + i.sev), i.text] }))) : el('p', { className: 'pool-note' }, s ? t('pool.check.none') : t('pool.spec.nonecheck')),
    );
    if (host.problems) { try { host.problems.set(issues.filter((i) => i.sev !== 'info').map((i) => ({ code: i.code, part: i.code, severity: i.sev === 'error' ? 'error' : 'warning', text: i.text, about: [] }))); } catch { /* a build without Problems */ } }
    return r;
  }

  const fold = (id, open, ...kids) => el('details', { open, 'data-pool-sec': id }, el('summary', {}, t('pool.sec.' + id)), ...kids);
  function draw() {
    inputs.clear(); hints.clear();
    const was = new Set([...root.querySelectorAll('details[open]')].map((x) => x.getAttribute('data-pool-sec')));
    const isOpen = (id, i) => (was.size ? was.has(id) : i === 0);
    root.replaceChildren(el('div', { className: 'pool-panel' },
      el('p', { className: 'pool-note pool-warn' }, t('pool.notice')),
      ...(host.notes || []).map((n) => el('p', { className: 'pool-note' }, n)),
      ...SECTIONS.map(([id, keys], i) => fold(id, isOpen(id, i), id === 'shell' || id === 'water' ? el('p', { className: 'pool-note' }, t('pool.governed.help')) : null, id === 'shape' ? el('p', { className: 'pool-note' }, t('pool.sides.help')) : null, el('div', { className: 'pool-grid' }, keys.map(field)))),
      host.position ? fold('place', was.has('place'), el('div', { className: 'pool-grid' }, ['atX', 'atY'].map(field))) : null,
      fold('spec', was.size ? was.has('spec') : true, el('label', { className: 'pool-field' }, el('span', {}, t('pool.spec.label')), specSel), specNote, specTable),
      fold('result', was.size ? was.has('result') : true, pic, out),
      actions, status));
    refresh();
  }
  const onSpecs = () => refresh();
  addEventListener('cc-pool-specs', onSpecs);
  draw();
  const unoffer = offerBinderPage({ id: 'pool', title: () => t('pool.report.title') + ': ' + (current ? current.design.name : ''), md: () => (current ? reportMd(current, t, fmt()) : '') });
  return {
    result: () => current, refresh,
    set(values) { raw = { ...raw, ...values }; save(); draw(); return current; },
    setSpec(id) { specId = id || ''; save(); return refresh(); },
    unmount() { removeEventListener('cc-pool-specs', onSpecs); unoffer(); document.getElementById('pool-panel-css')?.remove(); },
  };
}
