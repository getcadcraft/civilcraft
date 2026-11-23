/* SPDX-License-Identifier: Apache-2.0 */
/**
 * panel.js — the dome generator's panel (0.11 DOME.1), the same in every host. The only file of lib/dome that touches a page, and only inside
 * mountPanel(). Text is always set as text, never as HTML.
 *
 * mountPanel(root, host) → { result() (the current design), refresh(), set(values: always in millimetres, MPa, kPa, whatever the units shown),
 *   setSpec(id), unmount() }. What a person types is in the units picked (units.js); what is stored and handed to the engine is always SI.
 * host = { t(key, vars), storage: { get(k), set(k, v) }, download(name, text, type), problems?: { set(list) },
 *          actions: [{ id, label, run(result) → text to show | Promise }], notes?: [text], position?: bool }
 * The spec packs on offer are whatever side add-ons registered (spec.js registerSpec; event 'cc-dome-specs').
 */
import { design } from './index.js';
import { GOVERNED, DEFAULTS, DEFAULT_OPENINGS, SHAPES, OPENING_KINDS, MAX_OPENINGS, BASES, UNITS, FACTORS } from './model.js';
import { fieldUnit, toShown, fromShown, shown, tidy } from './units.js';
import { registeredSpecs, citation, SPEC_EVENT } from './spec.js';
import { sheetEnts, extent } from './drawings.js';
import { reportCsv } from './report.js';
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
.dome-panel{display:grid;padding:0 .5rem;box-sizing:border-box;grid-template-columns:minmax(0,1fr);gap:.6rem;font-size:.9em;min-width:0;max-width:100%;overflow-wrap:anywhere}
.dome-panel p{white-space:normal;margin:.2rem 0}
.dome-panel details{border:1px solid var(--line,#7a8796);border-radius:4px;padding:.3rem .5rem}
.dome-panel summary{cursor:pointer;font-weight:600}
.dome-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.35rem .6rem;margin:.4rem 0}
.dome-field{display:grid;gap:.1rem;min-width:0;align-content:start}
.dome-field span{font-size:.85em;opacity:.85}
.dome-field input,.dome-field select,.dome-open input,.dome-open select{width:100%;box-sizing:border-box;background:#fff;color:#111;border:1px solid #9aa5b1;border-radius:3px;padding:.2rem .3rem}
.dome-field small{font-size:.75em;opacity:.8}
.dome-note{margin:.2rem 0;font-size:.85em;opacity:.9}
.dome-warn{color:#b45309}
.dome-err{color:#b91c1c}
.dome-table{width:100%;border-collapse:collapse;font-size:.85em;table-layout:fixed}
.dome-table td,.dome-table th{text-align:left;padding:.12rem .3rem;border-bottom:1px solid rgba(128,128,128,.25);vertical-align:top}
.dome-table.dome-num td,.dome-table.dome-num th{text-align:right;overflow-wrap:normal;word-break:normal;padding-left:.15rem;padding-right:.15rem}
.dome-table.dome-num th{font-size:.9em;font-weight:600}
.dome-pic{width:100%;height:auto;max-height:26rem;background:rgba(128,128,128,.08);border-radius:4px}
.dome-row{display:flex;flex-wrap:wrap;gap:.4rem;margin:.3rem 0}
.dome-open{display:grid;grid-template-columns:1.3fr 1fr 1fr 1fr 1fr auto;gap:.25rem;align-items:end;margin:.25rem 0}
.dome-open label{display:grid;gap:.1rem;min-width:0;font-size:.8em}
.dome-open button{border:0;background:none;color:inherit;font-size:1em;line-height:1;padding:.25rem .3rem;cursor:pointer;opacity:.7}
.dome-open button:hover{opacity:1}
`;
const LAYER_INK = { 'DOME-SHELL': 'currentColor', 'DOME-SKIN': '#c9a400', 'DOME-BASE': '#8a8f98', 'DOME-OPENING': '#d04a3a', 'DOME-CLEAR': '#2f8fd8', 'DOME-TEXT': 'currentColor', 'DOME-DIMS': '#2e7d32' };

/** The plan and section as a picture (y up in the drawing, down on the screen). */
export function picture(ents, system = 'metric') {
  const b = extent(ents), w = Math.max(1, b[2] - b[0]), h = Math.max(1, b[3] - b[1]), pad = Math.max(w, h) * 0.04, lw = Math.max(w, h) / 500;
  const svg = sv('svg', { viewBox: `${b[0] - pad} ${-(b[3] + pad)} ${w + 2 * pad} ${h + 2 * pad}`, class: 'dome-pic', role: 'img', preserveAspectRatio: 'xMidYMid meet' });
  for (const e of ents) {
    const ink = LAYER_INK[e.layer] || 'currentColor', pen = { fill: 'none', stroke: ink, 'stroke-width': lw };
    if (e.type === 'poly') svg.append(sv(e.closed ? 'polygon' : 'polyline', { points: e.pts.map((p) => p[0].toFixed(1) + ',' + (-p[1]).toFixed(1)).join(' '), ...pen }));
    else if (e.type === 'line') svg.append(sv('line', { x1: e.a[0], y1: -e.a[1], x2: e.b[0], y2: -e.b[1], stroke: ink, 'stroke-width': lw }));
    else if (e.type === 'circle') svg.append(sv('circle', { cx: e.c[0], cy: -e.c[1], r: e.r, ...pen, ...(e.layer === 'DOME-CLEAR' || e.layer === 'DOME-BASE' ? { 'stroke-dasharray': lw * 12 + ' ' + lw * 8 } : {}) }));
    else if (e.type === 'arc') {
      const p0 = [e.c[0] + e.r * Math.cos(e.a0), -(e.c[1] + e.r * Math.sin(e.a0))], p1 = [e.c[0] + e.r * Math.cos(e.a1), -(e.c[1] + e.r * Math.sin(e.a1))];
      svg.append(sv('path', { d: `M${p0[0].toFixed(1)} ${p0[1].toFixed(1)} A${e.r} ${e.r} 0 ${e.a1 - e.a0 > Math.PI ? 1 : 0} 0 ${p1[0].toFixed(1)} ${p1[1].toFixed(1)}`, ...pen }));
    } else if (e.type === 'text') { const tx = sv('text', { x: e.at[0], y: -e.at[1], 'font-size': e.h * 1.3, fill: ink, 'text-anchor': e.ha === 'left' ? 'start' : e.ha === 'right' ? 'end' : 'middle' }); tx.textContent = e.s; svg.append(tx); }
    else if (e.type === 'dim') {
      const len = e.rot === 90 ? Math.abs(e.p2[1] - e.p1[1]) : Math.abs(e.p2[0] - e.p1[0]);
      const a = e.rot === 90 ? [e.loc[0], e.p1[1]] : [e.p1[0], e.loc[1]], c = e.rot === 90 ? [e.loc[0], e.p2[1]] : [e.p2[0], e.loc[1]];
      svg.append(sv('line', { x1: a[0], y1: -a[1], x2: c[0], y2: -c[1], stroke: ink, 'stroke-width': lw }));
      const tx = sv('text', { x: e.loc[0] + (e.rot === 90 ? -lw * 30 : 0), y: -e.loc[1] - lw * 20, 'font-size': 170, fill: ink, 'text-anchor': 'middle' }); const dv = shown(len, 'mm', system); tx.textContent = system === 'imperial' ? (dv.value / 12).toFixed(2) + ' ft' : String(Math.round(len)); svg.append(tx);
    }
  }
  return svg;
}

const SECTIONS = [
  ['shape', ['name', 'units', 'shape', 'diameter', 'height', 'stem']],
  ['shell', ['shell', 'thicken', 'concreteMPa', 'cover', 'coverEarth', 'rebarRatio', 'barDia', 'barSpacing', 'waste']],
  ['skin', ['foam', 'membrane']],
  ['base', ['footingWidth', 'footingDepth', 'slab', 'baseFix']],
  ['loads', ['density', 'finishLoad', 'snow', 'wind', 'seismic', 'modulus', 'poisson', 'knockdown', 'steelStress', 'headroom']],
  ['factors', FACTORS],
];
const CHOICES = { shape: SHAPES, baseFix: BASES, units: UNITS };
const OPEN_FIELDS = ['az', 'width', 'height', 'sill'];
const fx = (v, dp = 2) => (Number.isFinite(v) ? Number(v).toLocaleString('en-US', { maximumFractionDigits: dp }) : '–');

export function mountPanel(root, host) {
  const t = host.t;
  if (!document.getElementById('dome-panel-css')) document.head.append(el('style', { id: 'dome-panel-css' }, CSS));
  let raw = {}; try { raw = host.storage.get('dome') || {}; } catch { raw = {}; }
  let specId = ''; try { specId = host.storage.get('spec') || ''; } catch { specId = ''; }
  let current = null;
  const inputs = new Map(), hints = new Map();
  const status = el('p', { className: 'dome-note', role: 'status' });
  const spec = () => registeredSpecs().find((s) => s.id === specId) || null;
  const sys = () => (raw.units === 'imperial' ? 'imperial' : 'metric');
  /** A result with its unit, in the system asked. */
  const U = (v, unit, dp = 2) => { const x = shown(v, unit, sys()); return fx(x.value, dp) + ' ' + x.unit; };
  const save = () => { try { host.storage.set('dome', raw); host.storage.set('spec', specId); } catch { /* storage is a convenience */ } };

  const field = (k) => {
    let input;
    if (CHOICES[k]) input = el('select', { 'data-dome': k }, CHOICES[k].map((c) => el('option', { value: c }, t('dome.opt.' + k + '.' + c))));
    else if (k === 'name') input = el('input', { type: 'text', 'data-dome': k, maxlength: 80 });
    else input = el('input', { type: 'number', step: 'any', 'data-dome': k });
    const text = CHOICES[k] || k === 'name';
    const v = raw[k] ?? (k in DEFAULTS ? DEFAULTS[k] : '');
    input.value = v === null || v === undefined ? '' : text ? String(v) : tidy(toShown(k, Number(v), sys()));
    input.onchange = () => {
      const s = input.value.trim();
      if (s === '') delete raw[k]; else raw[k] = text ? s : fromShown(k, Number(s), sys());
      save();
      if (k === 'units') { render(); return; }
      refresh();
    };
    inputs.set(k, input);
    const hint = el('small', {}); hints.set(k, hint);
    const unit = text ? '' : fieldUnit(k, sys(), t('dome.unit.' + k));
    return el('label', { className: 'dome-field' }, el('span', {}, t('dome.f.' + k) + (unit ? ' (' + unit + ')' : '')), input, hint);
  };

  // ---- the openings: a short list of rows
  const openBox = el('div', { 'data-dome-openings': '' }), openNote = el('div');
  const openings = () => (Array.isArray(raw.openings) ? raw.openings : DEFAULT_OPENINGS.map((o) => ({ ...o })));
  const setOpenings = (list) => { raw.openings = list; save(); drawOpenings(); refresh(); };
  function drawOpenings() {
    const list = openings();
    openBox.replaceChildren(...list.map((o, i) => {
      const kind = el('select', { 'data-dome-open': i + '.kind', 'aria-label': t('dome.o.kind') }, OPENING_KINDS.map((c) => el('option', { value: c }, t('dome.opt.kind.' + c))));
      kind.value = OPENING_KINDS.includes(o.kind) ? o.kind : 'door';
      kind.onchange = () => { const next = openings().map((x) => ({ ...x })); next[i].kind = kind.value; if (kind.value === 'door') next[i].sill = 0; else if (!(next[i].sill > 0)) next[i].sill = 900; setOpenings(next); };
      const num = (f) => {
        const input = el('input', { type: 'number', step: 'any', 'data-dome-open': i + '.' + f });
        input.value = o[f] === undefined || o[f] === null ? '' : f === 'az' ? String(o[f]) : tidy(toShown(f, Number(o[f]), sys()));
        input.disabled = f === 'sill' && kind.value === 'door';
        input.onchange = () => { const next = openings().map((x) => ({ ...x })); next[i][f] = input.value.trim() === '' ? 0 : f === 'az' ? Number(input.value) : fromShown(f, Number(input.value), sys()); setOpenings(next); };
        return el('label', {}, el('span', {}, t('dome.o.' + f) + ' (' + (f === 'az' ? '°' : fieldUnit(f, sys(), 'mm')) + ')'), input);
      };
      const drop = el('button', { type: 'button', 'data-dome-open': i + '.remove', title: t('dome.o.remove'), 'aria-label': t('dome.o.remove'), onclick: () => setOpenings(openings().filter((_, j) => j !== i)) }, '×');
      return el('div', { className: 'dome-open' }, el('label', {}, el('span', {}, t('dome.o.kind') + ' ' + (i + 1)), kind), ...OPEN_FIELDS.map(num), drop);
    }));
  }
  const addOpening = el('button', { type: 'button', className: 'btn-line', 'data-dome-act': 'add-opening', onclick: () => {
    const list = openings().map((x) => ({ ...x }));
    if (list.length >= MAX_OPENINGS) return;
    const az = list.length ? (Math.max(...list.map((o) => Number(o.az) || 0)) + 90) % 360 : 0;
    setOpenings([...list, { kind: 'window', az, width: 1200, height: 1200, sill: 900 }]);
  } }, t('dome.o.add'));

  const specSel = el('select', { 'data-dome': 'spec' });
  specSel.onchange = () => { specId = specSel.value; save(); refresh(); };
  const specNote = el('div'), specTable = el('div');
  const fillSpecs = () => {
    const list = registeredSpecs();
    specSel.replaceChildren(el('option', { value: '' }, t('dome.spec.none')), ...list.map((s) => el('option', { value: s.id }, s.name)));
    specSel.value = list.some((s) => s.id === specId) ? specId : '';
    specNote.replaceChildren(el('p', { className: 'dome-note' + (list.length ? '' : ' dome-warn') }, list.length ? t('dome.spec.pick') : t('dome.spec.add')));
  };
  const pic = el('div'), out = el('div'), actions = el('div', { className: 'dome-row' });
  const table = (rows, cls = '') => el('table', { className: 'dome-table' + (cls ? ' ' + cls : '') }, el('tbody', {}, rows.map((r) => el('tr', { className: r.cls || '' }, r.cells.map((c) => el(r.head ? 'th' : 'td', {}, c ?? ''))))));
  const run = async (fn) => { try { const m = await fn(current); status.textContent = m || ''; status.className = 'dome-note'; } catch (err) { status.textContent = String((err && err.message) || err); status.className = 'dome-note dome-err'; } };
  const base = () => String(current.design.name || 'dome').replace(/[^\w.-]+/g, '-').slice(0, 60) || 'dome';
  const words = () => ({ floor: t('dome.w.floor'), headroom: t('dome.w.headroom'), door: t('dome.opt.kind.door'), window: t('dome.opt.kind.window'), section: t('dome.w.section') });
  const buttons = [
    ...(host.actions || []),
    { id: 'ifc', label: t('dome.act.ifc'), run: (r) => { host.download(base() + '.ifc', toIfc(r), 'application/x-step'); return t('dome.act.ifc.done'); } },
    { id: 'csv', label: t('dome.act.csv'), run: (r) => { host.download(base() + '-report.csv', reportCsv(r, t, sys()), 'text/csv'); return t('dome.act.csv.done'); } },
  ];
  actions.append(...buttons.map((b) => el('button', { type: 'button', className: 'btn-line', 'data-dome-act': b.id, onclick: () => run(b.run) }, b.label)));

  function refresh() {
    fillSpecs();
    current = design(raw, spec());
    current.at = [Number(raw.atX) || 0, Number(raw.atY) || 0];
    current.words = words();
    const r = current, d = r.design, system = sys();
    for (const [k, input] of inputs) {
      const hint = hints.get(k);
      if (k === 'atX' || k === 'atY') continue;
      if (k in GOVERNED) {
        const b = r.basis[k], g = GOVERNED[k];
        input.placeholder = tidy(toShown(k, b.value, system));
        hint.textContent = t('dome.from.' + b.from) + (b.limit !== null ? ' · ' + t(g.how === 'value' ? 'dome.limit.value' : 'dome.limit.min', { v: fx(toShown(k, b.limit, system), 4) }) : '');
        hint.className = b.from === 'start' ? 'dome-warn' : '';
      } else { const bad = r.inputProblems.find((p) => p.field === k); hint.textContent = bad ? t('dome.err.' + bad.why, { lo: fx(toShown(k, bad.lo, system), 2), hi: fx(toShown(k, bad.hi, system), 2) }) : ''; hint.className = bad ? 'dome-err' : ''; }
    }
    const openBad = r.inputProblems.filter((p) => p.field === 'openings');
    openNote.replaceChildren(...openBad.map((p) => el('p', { className: 'dome-note dome-err' }, t('dome.err.' + p.why, { n: p.n, part: p.part ? t('dome.o.' + p.part) : '', lo: fx(p.part && p.part !== 'az' ? toShown(p.part, p.lo, system) : p.lo, 2), hi: fx(p.part && p.part !== 'az' ? toShown(p.part, p.hi, system) : p.hi, 2) }))));
    addOpening.disabled = openings().length >= MAX_OPENINGS;
    const s = spec();
    specTable.replaceChildren(s ? el('div', {},
      el('p', { className: 'dome-note' }, t('dome.spec.counts', { primary: s.counts.primary, secondary: s.counts.secondary, none: s.counts.none })),
      table(Object.values(s.values).map((v) => ({ cls: v.read === 'none' ? 'dome-warn' : '', cells: [t('dome.rule.' + v.rule), v.read === 'none' ? t('dome.read.none') : v.label + (v.us ? ' (' + v.us.trim() + ')' : ''), v.read === 'none' ? '' : citation(s, v), v.read === 'none' ? '' : t('dome.read.' + v.read)] }))),
      s.notes ? el('p', { className: 'dome-note' }, s.notes) : null) : '');
    try { pic.replaceChildren(picture(sheetEnts(r, words()), system)); } catch { pic.replaceChildren(); }
    const issues = [
      ...r.checks.map((x) => ({ sev: x.severity, text: (x.key === 'dome.issue.read' ? t('dome.rule.' + x.vars.rule) + ': ' + x.vars.text : t(x.key, { ...x.vars, what: x.vars.what ? t('dome.f.' + x.vars.what) : '', value: fx(x.vars.value, 4), limit: fx(x.vars.limit, 4) })) + (x.cite ? ' — ' + x.cite + ' (' + t('dome.read.' + x.read) + ')' : ''), code: x.code })),
      ...r.problems.map((p) => ({ sev: 'warning', text: t('dome.problem.' + p.code, p.vars), code: 'dome.' + p.code + (p.vars && p.vars.n && /^opening/.test(p.code) ? '.' + p.vars.n : '') })),
    ];
    const F = r.forces.factors;
    const facts = (c) => {
      const L = c.label, parts = [];
      if (L.dead !== undefined) parts.push(fx(L.dead) + (L.deadMin !== undefined && L.deadMin !== L.dead ? ' / ' + fx(L.deadMin) : '') + ' × ' + t('dome.w.dead'));
      if (L.snow) parts.push(fx(L.snow) + ' × ' + t('dome.w.snow'));
      if (L.wind) parts.push(fx(L.wind) + ' × ' + t('dome.w.wind'));
      if (L.seismic) parts.push(fx(L.seismic) + ' × ' + t('dome.w.seismic'));
      return parts.join(' + ');
    };
    const title = (id, c) => el('p', { className: 'dome-note' }, el('strong', {}, t('dome.case.' + id)), ' · ' + facts(c));
    const sign = (v, unit, dp = 2) => U(v, unit, dp);
    const symBlocks = ['dead', 'snow'].filter((id) => r.forces.cases[id]).map((id) => { const c = r.forces.cases[id]; return el('div', { 'data-dome-case': id },
      title(id, c),
      table([{ head: true, cells: [t('dome.fc.angle'), t('dome.fc.thickness', { u: shown(1, 'mm', system).unit }), t('dome.fc.nphi', { u: shown(1, 'kN/m', system).unit }), t('dome.fc.ntheta', { u: shown(1, 'kN/m', system).unit }), t('dome.fc.sphi', { u: shown(1, 'MPa', system).unit }), t('dome.fc.stheta', { u: shown(1, 'MPa', system).unit })] },
        ...c.stations.map((x) => ({ cells: [fx(x.phiDeg, 1) + '°', fx(shown(x.t, 'mm', system).value, system === 'imperial' ? 2 : 0), fx(shown(x.nPhi, 'kN/m', system).value), fx(shown(x.nTheta, 'kN/m', system).value), fx(shown(x.sPhi, 'MPa', system).value, system === 'imperial' ? 1 : 3), fx(shown(x.sTheta, 'MPa', system).value, system === 'imperial' ? 1 : 3)] }))], 'dome-num'),
      table([
        [t('dome.fc.load'), U(c.domeLoad, 'kN', 1)],
        [t('dome.fc.maxc'), U(c.maxCompression.stress, 'MPa', system === 'imperial' ? 0 : 3)],
        [t('dome.fc.hoop'), c.maxHoopTension ? U(c.maxHoopTension.n, 'kN/m') + (c.hoopZeroDeg !== null ? ' · ' + t('dome.fc.hoopfrom', { deg: fx(c.hoopZeroDeg, 1) }) : '') : t('dome.fc.nohoop')],
        [t('dome.fc.thrust'), U(c.base.thrust, 'kN/m')],
        [t('dome.fc.ring'), U(c.base.ringTension, 'kN', 1)],
        [t('dome.fc.vertical'), U(c.floor.vertical, 'kN/m')],
        [t('dome.fc.bearing'), U(c.bearing, 'kPa', system === 'imperial' ? 0 : 1)],
        ...(c.ringSteel !== null ? [[t('dome.fc.ringsteel'), U(c.ringSteel, 'mm2', system === 'imperial' ? 2 : 0) + ' · ' + t('dome.fc.atstress', { stress: U(d.steelStress, 'MPa', 0) })]] : []),
        ...(c.hoopSteel !== null ? [[t('dome.fc.hoopsteel'), U(c.hoopSteel, 'mm2/m', system === 'imperial' ? 3 : 0) + ' · ' + t('dome.fc.atstress', { stress: U(d.steelStress, 'MPa', 0) })]] : []),
      ].map((cells) => ({ cells })))); });
    const latBlocks = ['wind', 'seismic'].filter((id) => r.forces.cases[id]).map((id) => { const c = r.forces.cases[id]; return el('div', { 'data-dome-case': id },
      title(id, c),
      el('p', { className: 'dome-note' }, t('dome.lat.' + id)),
      table([{ head: true, cells: [t('dome.lat.z', { u: shown(1, 'm', system).unit }), t('dome.lat.n', { u: shown(1, 'kN/m', system).unit }), t('dome.lat.s', { u: shown(1, 'kN/m', system).unit }), t('dome.lat.nt', { u: shown(1, 'kN/m', system).unit })] },
        ...c.stations.map((x) => ({ cells: [fx(shown(x.z / 1000, 'm', system).value), fx(shown(x.n, 'kN/m', system).value, 3), fx(shown(x.s, 'kN/m', system).value, 3), fx(shown(x.nTheta, 'kN/m', system).value, 3)] }))], 'dome-num'),
      table([
        [t('dome.lat.shear'), U(c.baseShear, 'kN', 1)],
        [t('dome.lat.turn'), U(c.overturning, 'kN·m', 1)],
        [t('dome.lat.floor'), '± ' + U(c.floor.n, 'kN/m')],
        [t('dome.lat.floormax'), U(c.floor.withDead.max, 'kN/m') + ' · ' + t(c.floor.withDead.max > 0 ? 'dome.lat.uplift' : 'dome.lat.nouplift')],
        [t('dome.lat.floormin'), U(c.floor.withDead.min, 'kN/m')],
        [t('dome.lat.along'), U(c.maxAlong.tension, 'kN/m') + ' / ' + U(c.maxAlong.compression, 'kN/m')],
        [t('dome.lat.round'), U(c.maxRound.tension, 'kN/m') + ' / ' + U(c.maxRound.compression, 'kN/m')],
        [t('dome.lat.maxshear'), U(c.maxShear, 'kN/m')],
        ...(c.upliftSteel !== null ? [[t('dome.lat.upsteel'), U(c.upliftSteel, 'mm2/m', system === 'imperial' ? 3 : 0) + ' · ' + t('dome.fc.atstress', { stress: U(d.steelStress, 'MPa', 0) })]] : []),
      ].map((cells) => ({ cells })))); });
    const B = r.bending, where = (x) => t('dome.b.at', { z: U(x.z / 1000, 'm'), dir: t('dome.b.dir.' + x.dir), face: x.face ? t('dome.b.face.' + x.face) : '' });
    const bendBlocks = Object.entries(B.cases).map(([id, c]) => el('div', { 'data-dome-bend': id },
      title(id, r.forces.cases[id]),
      table([{ head: true, cells: [t('dome.lat.z', { u: shown(1, 'm', system).unit }), t('dome.fc.nphi', { u: shown(1, 'kN/m', system).unit }), t('dome.fc.ntheta', { u: shown(1, 'kN/m', system).unit }), t('dome.b.malong', { u: shown(1, 'kN·m/m', system).unit }), t('dome.b.mround', { u: shown(1, 'kN·m/m', system).unit })] },
        ...c.stations.map((x) => ({ cells: [fx(shown(x.z / 1000, 'm', system).value), fx(shown(x.nAlong, 'kN/m', system).value), fx(shown(x.nRound, 'kN/m', system).value), fx(shown(x.mAlong, 'kN·m/m', system).value, 3), fx(shown(x.mRound, 'kN·m/m', system).value, 3)] }))], 'dome-num'),
      table([
        [t('dome.b.basem'), U(c.baseMoment, 'kN·m/m', 3)],
        [t('dome.b.maxm'), U(c.maxMoment.m, 'kN·m/m', 3) + ' · ' + where(c.maxMoment)],
        [t('dome.b.push'), U(c.basePush, 'kN/m')],
        [t('dome.b.ring'), U(c.ringTension, 'kN', 1)],
        [t('dome.b.maxt'), c.maxTension ? U(c.maxTension.stress, 'MPa', system === 'imperial' ? 0 : 3) + ' · ' + where(c.maxTension) : t('dome.b.notension')],
        [t('dome.b.maxc'), U(c.maxCompression.stress, 'MPa', system === 'imperial' ? 0 : 3) + ' · ' + where(c.maxCompression)],
        [t('dome.b.crown'), U(c.crownDrop, 'mm', 3)],
        [t('dome.b.spread'), U(c.baseSpread, 'mm', 3)],
      ].map((cells) => ({ cells })))));
    const bk = r.forces.buckling;
    out.replaceChildren(
      el('h4', {}, t('dome.report.quantities')),
      table(r.quantities.rows.map((q) => ({ cells: [t('dome.q.' + q.id), U(q.value, q.unit) + (q.note ? ' · ' + t('dome.q.' + q.note) : '')] }))),
      r.quantities.bars ? el('p', { className: 'dome-note' }, t('dome.bars.ratio', { crown: fx(r.quantities.bars.ratioCrown, 5), base: fx(r.quantities.bars.ratioBase, 5), want: fx(d.rebarRatio, 5) })) : null,
      el('h4', {}, t('dome.report.forces')),
      el('p', { className: 'dome-note dome-warn' }, t('dome.forces.notice')),
      el('p', { className: 'dome-note' }, t('dome.forces.legend')),
      el('p', { className: 'dome-note' + (r.forces.unfactored ? ' dome-warn' : ''), 'data-dome-factored': r.forces.unfactored ? '0' : '1' }, t(r.forces.unfactored ? 'dome.forces.unfactored' : 'dome.forces.factored', { dead: fx(F.dead), alone: fx(F.deadAlone), min: fx(F.deadMin), snow: fx(F.snow), wind: fx(F.wind), seismic: fx(F.seismic) })),
      ...symBlocks, ...latBlocks,
      el('h4', {}, t('dome.report.bending')),
      el('p', { className: 'dome-note dome-warn' }, t('dome.b.notice', { base: t('dome.opt.baseFix.' + B.base) })),
      ...(B.failed ? [el('p', { className: 'dome-note dome-err' }, t('dome.problem.bending.failed'))] : bendBlocks),
      el('h4', {}, t('dome.report.buckling')),
      el('p', { className: 'dome-note dome-warn' }, t('dome.bk.notice')),
      bk ? table([
        [t('dome.bk.classical'), U(bk.classical, 'kPa', system === 'imperial' ? 0 : 1)],
        [t('dome.bk.pressure'), U(bk.pressure, 'kPa', system === 'imperial' ? 1 : 3) + ' · ' + t('dome.bk.where', { deg: fx(bk.phiDeg, 1) })],
        [t('dome.bk.ratio'), fx(bk.ratio, 1)],
        [t('dome.bk.reduced'), bk.reduced === null ? t('dome.bk.noreduce') : fx(bk.reduced, 2) + ' · ' + t('dome.bk.with', { k: fx(d.knockdown, 3) })],
      ].map((cells) => ({ cells }))) : null,
      r.forces.openings.length ? el('h4', {}, t('dome.report.openforces')) : null,
      r.forces.openings.length ? el('p', { className: 'dome-note dome-warn' }, t('dome.of.notice')) : null,
      r.forces.openings.length ? table([{ head: true, cells: [t('dome.o.kind'), t('dome.of.along', { u: shown(1, 'kN', system).unit }), t('dome.of.side', { u: shown(1, 'kN', system).unit }), t('dome.of.round', { u: shown(1, 'kN', system).unit })] },
        ...r.forces.openings.map((o) => ({ cells: [t('dome.opt.kind.' + o.kind) + ' ' + o.n, fx(shown(o.along, 'kN', system).value, 1), fx(shown(o.alongEachSide, 'kN', system).value, 1), fx(shown(o.round, 'kN', system).value, 1) + (o.roundSteel !== null ? ' · ' + U(o.roundSteel, 'mm2', system === 'imperial' ? 2 : 0) : '')] }))], 'dome-num') : null,
      el('h4', {}, t('dome.report.checks')),
      issues.length ? table(issues.map((i) => ({ cls: i.sev === 'error' ? 'dome-err' : i.sev === 'warning' ? 'dome-warn' : '', cells: [t('dome.sev.' + i.sev), i.text] }))) : el('p', { className: 'dome-note' }, s ? t('dome.check.none') : t('dome.spec.nonecheck')),
    );
    if (host.problems) { try { host.problems.set(issues.filter((i) => i.sev !== 'info').map((i) => ({ code: i.code, part: i.code, severity: i.sev === 'error' ? 'error' : 'warning', text: i.text, about: [] }))); } catch { /* a build without Problems */ } }
    return r;
  }

  const fold = (id, open, ...kids) => el('details', { open, 'data-dome-sec': id }, el('summary', {}, t('dome.sec.' + id)), ...kids);
  const HELP = { shape: 'dome.shape.help', shell: 'dome.governed.help', factors: 'dome.factors.help', loads: 'dome.loads.help' };
  const sec = ([id, keys], open) => fold(id, open, HELP[id] ? el('p', { className: 'dome-note' }, t(HELP[id])) : null, el('div', { className: 'dome-grid' }, keys.map(field)));
  /** Build the whole panel (again when the units change: every box is then shown in the other system). */
  function render() {
    const openNow = new Set([...root.querySelectorAll('details[open]')].map((n) => n.getAttribute('data-dome-sec')));
    const was = root.querySelector('details') !== null, isOpen = (id, first) => (was ? openNow.has(id) : first);
    inputs.clear(); hints.clear();
    drawOpenings();
    root.replaceChildren(el('div', { className: 'dome-panel' },
      el('p', { className: 'dome-note dome-warn' }, t('dome.notice')),
      ...(host.notes || []).map((n) => el('p', { className: 'dome-note' }, n)),
      ...SECTIONS.slice(0, 4).map((x, i) => sec(x, isOpen(x[0], i === 0))),
      fold('openings', isOpen('openings', false), el('p', { className: 'dome-note' }, t('dome.o.help')), openBox, openNote, el('div', { className: 'dome-row' }, addOpening),
        el('p', { className: 'dome-note' }, t('dome.frame.help')), el('div', { className: 'dome-grid' }, ['frameWidth', 'frameExtra'].map(field))),
      sec(SECTIONS[4], isOpen('loads', false)), sec(SECTIONS[5], isOpen('factors', false)),
      host.position ? fold('place', isOpen('place', false), el('div', { className: 'dome-grid' }, ['atX', 'atY'].map(field))) : null,
      fold('spec', isOpen('spec', true), el('label', { className: 'dome-field' }, el('span', {}, t('dome.spec.label')), specSel), specNote, specTable),
      fold('result', isOpen('result', true), pic, out),
      actions, status));
    return refresh();
  }
  const onSpecs = () => refresh();
  addEventListener(SPEC_EVENT, onSpecs);
  render();
  return {
    result: () => current, refresh,
    set(values) { raw = { ...raw, ...values }; save(); return render(); },
    setSpec(id) { specId = id || ''; save(); return refresh(); },
    unmount() { removeEventListener(SPEC_EVENT, onSpecs); document.getElementById('dome-panel-css')?.remove(); },
  };
}
