/* SPDX-License-Identifier: Apache-2.0 */
/**
 * templates-ui.js — corridor templates in CivilCraft (0.9 SU.1110 + WB.6, session `civil-templates-09`). The numbers are
 * templates.js and corridor.js (bin/test-civilcraft-templates.mjs); this file is the dialogs and the Properties blocks.
 *
 *   createTemplates(ctx) → { command(c), corridorBlock(a, c, key, item), moreCorridors(a), terrainBlock(), materialsBlock(),
 *                            sceneItems(), library, openManager(), openEditor(tpl) }
 *   ctx = { root, el, project: () => Project, units: () => 'ft'|'m', numInput, say, download(text, name, type), fileStem(),
 *           showProject() (select nothing, so Properties shows the project) }
 *
 * Where a person reaches it:
 *   Design › More › Corridor templates… (command `corridor-templates`): the template manager — the project's templates, My
 *     library (this browser, localStorage `civilcraft.templates`, reused in every project), the examples (marked for checking by
 *     an engineer), Import / Export a .cctemplates.json file; New, Edit, Copy → the template editor (the creation tool): params,
 *     points with their constraints (slope, offset and rise, vertical, daylight, to the ground, wall) and targets, components,
 *     a live drawing and the template's problems.
 *   An alignment's Properties › Corridor › "Build from templates by station": regions (a start station each), each side's
 *     pavement templates and its own end condition, each use's values and point targets; the corridor's From / To; "Corridors on
 *     this alignment" adds more corridors on other station ranges.
 *   Design › More › Terrain templates… (command `terrain-templates`) and the project's Properties: templates draped on a terrain
 *     inside a parcel, pad or closed feature line, with each layer's area and volume; the volumes go into Earthwork ›
 *     Materials and the quantities file for TakeoffCraft.
 * Every change to the project is one undo step (project.change).
 */

import { t, has } from './i18n.js';
import { fixed } from './units.js';
import { TPL_KINDS, POINT_KINDS, COMP_KINDS, PARAM_KINDS, MAX_POINTS, MAX_COMPS, MAX_PARAMS, MAX_REGIONS, MAX_USES, TPL_EXT,
  cleanTemplate, templateProblems, evalTemplate, exampleTemplates, templatesFile, readTemplatesFile, endKind, paramValue } from './templates.js';
import { targetSources } from './targets-ui.js';
import { CORRIDOR_LINES } from './corridor.js';
import { LAYERS } from './scene.js';

const STORE = 'civilcraft.templates';
if (!LAYERS.some((l) => l.name === 'C-TOPO-TMPL')) LAYERS.push({ name: 'C-TOPO-TMPL', token: 'green', aci: 3, get label() { return t('tpl.layer'); } });

/** A stored name: a text key (examples) shown in the reader's language, else the person's own words. */
export const label = (s) => (typeof s === 'string' && /^tpl\.[a-z0-9.]+$/.test(s) && has(s) ? t(s) : s || '');
/** A copy of a template with its key names turned into words (what goes into a project or the library). */
function worded(tpl) {
  const c = JSON.parse(JSON.stringify(tpl));
  c.name = label(c.name); c.note = label(c.note);
  for (const k of c.components || []) { k.name = label(k.name); k.material = label(k.material); }
  for (const p of c.points || []) { if (p.name) p.name = label(p.name); if (p.material) p.material = label(p.material); }
  return c;
}

export function createTemplates(ctx) {
  const { el } = ctx;
  const P = () => ctx.project();
  const U = () => ctx.units();
  const uShort = () => (U() === 'm' ? 'm' : 'ft');
  const area = () => (U() === 'm' ? 'sq m' : 'sq ft');   // i18n-ignore: unit abbreviations as the app writes them
  const vol = (v) => (U() === 'm' ? fixed(v, 1) + ' m³' : fixed(v / 27, 1) + ' CY');   // i18n-ignore: unit abbreviations
  const btn = (text, onclick, data = {}, extra = {}) => el('button', { type: 'button', className: 'btn-line btn-sm-cc', onclick, ...Object.fromEntries(Object.entries(data).map(([k, v]) => ['data-' + k, v])), ...extra }, text);
  const icon = (ic, title, onclick, data = {}, disabled = false) => el('button', { type: 'button', className: 'cv-x', 'aria-label': title, title, disabled, onclick, ...Object.fromEntries(Object.entries(data).map(([k, v]) => ['data-' + k, v])) }, el('i', { className: 'bi ' + ic, 'aria-hidden': 'true' }));

  // ------------------------------------------------------------------------------------------ the library (this browser)
  const library = {
    list() { try { const v = JSON.parse(localStorage.getItem(STORE) || 'null'); return readTemplatesFile(v, U()).templates.map((x) => ({ ...x, source: 'mine' })); } catch { return []; } },
    save(list) { try { localStorage.setItem(STORE, JSON.stringify(templatesFile(list.slice(0, 200)))); return true; } catch { ctx.say(t('tpl.lib.blocked')); return false; } },
    add(tpl) { const c = worded(tpl); const list = this.list(); c.id = 'my' + Date.now().toString(36) + list.length; delete c.check; list.push(c); return this.save(list) ? c : null; },
    remove(id) { this.save(this.list().filter((x) => x.id !== id)); },
  };
  /** Copy a template into a project state (inside a change); returns the new id. */
  function addToState(s, tpl) {
    const c = cleanTemplate(worded(tpl), s.units);
    if (!c) return null;
    const n = s.seq || 1; s.seq = n + 1;
    c.id = 'tp' + n; c.source = 'project';
    if (tpl.check) c.check = true;
    (s.templates ||= []).push(c);
    return c.id;
  }
  /** Copy a template into the project (one undo step); returns the new id. */
  function addToProject(tpl) {
    let id = null;
    P().change(t('tpl.undo.add'), (s) => { id = addToState(s, tpl); });
    return id;
  }
  /** An example in the project (inside a change): the copy already there, else a new copy. */
  function exampleIn(s, exId) {
    const ex = exampleTemplates(s.units).find((x) => x.id === 'ex-' + exId);
    const have = (s.templates || []).find((x) => x.name === label(ex.name) && x.check);
    return have ? have.id : addToState(s, ex);
  }
  const projectTpls = (kinds) => (P().state.templates || []).filter((x) => !kinds || kinds.includes(x.kind));

  // ------------------------------------------------------------------------------------------ the manager dialog
  function openManager() {
    const did = 'cv-tpl-mgr';
    root().querySelector('#' + did)?.remove();
    const body = el('div', { className: 'cv-dlg-body' });
    const dlg = el('dialog', { className: 'cv-dialog cv-tpl-dlg', id: did, 'aria-labelledby': did + '-t', 'data-tpl-manager': '' },
      el('div', { className: 'cv-dlg' },
        el('div', { className: 'cv-dlg-head' }, el('h2', { className: 'cv-h', id: did + '-t' }, t('tpl.mgr.title')), icon('bi-x-lg', t('tpl.close'), () => dlg.close())),
        body,
        el('div', { className: 'cv-dlg-foot' },
          btn(t('tpl.mgr.new'), () => openEditor(null), { 'tpl-new': '' }),
          btn(t('tpl.mgr.import'), () => file.click(), { 'tpl-import': '' }),
          btn(t('tpl.mgr.export'), exportFile, { 'tpl-export': '' }, { disabled: !projectTpls().length }),
          btn(t('tpl.close'), () => dlg.close(), { 'tpl-close': '' }))));
    const file = el('input', { type: 'file', accept: '.json,' + TPL_EXT, hidden: true, 'data-tpl-file': '' });
    file.addEventListener('change', async () => { const f = file.files?.[0]; if (f) importText(await f.text(), f.name); file.value = ''; draw(); });
    dlg.append(file);
    const row = (x, where) => {
      const kind = t('tpl.kind.' + x.kind) + (x.kind === 'end' && endKind(x) ? ' · ' + t('tpl.end.' + endKind(x)) : '');
      const acts = [];
      if (where === 'project') {
        acts.push(btn(t('tpl.mgr.edit'), () => openEditor(x), { 'tpl-edit': x.id }));
        acts.push(btn(t('tpl.mgr.tolib'), () => { if (library.add(x)) { ctx.say(t('tpl.lib.added', { name: label(x.name) })); draw(); } }, { 'tpl-tolib': x.id }));
        const used = usesOf(x.id);
        acts.push(icon('bi-trash3', used ? t('tpl.mgr.inuse', { name: label(x.name), n: used }) : t('tpl.mgr.remove', { name: label(x.name) }), () => { P().change(t('tpl.undo.remove'), (s) => { s.templates = s.templates.filter((y) => y.id !== x.id); if (!s.templates.length) delete s.templates; }); draw(); }, { 'tpl-remove': x.id }, used > 0));
      } else {
        acts.push(btn(t('tpl.mgr.use'), () => { const id = addToProject(x); ctx.say(t('tpl.added', { name: label(x.name) })); draw(); if (id) ctx.refresh?.(); }, { 'tpl-use': x.id }));
        if (where === 'mine') acts.push(icon('bi-trash3', t('tpl.mgr.remove', { name: label(x.name) }), () => { library.remove(x.id); draw(); }, { 'tpl-libremove': x.id }));
      }
      return el('tr', { 'data-tpl-row': x.id },
        el('td', { className: 'cv-tpl-thumb' }, preview(x, { w: 120, h: 48 })),
        el('td', {}, el('strong', {}, label(x.name)), x.check ? el('span', { className: 'cv-badge', 'data-tpl-check': '' }, ' ', t('tpl.check')) : '', el('div', { className: 'cv-note' }, kind)),
        el('td', { style: 'white-space:nowrap' }, ...acts));
    };
    const table = (list, where, empty) => (list.length ? el('div', { className: 'cv-table-wrap' }, el('table', { className: 'cv-table', ['data-tpl-list']: where }, el('tbody', {}, ...list.map((x) => row(x, where))))) : el('p', { className: 'cv-note', ['data-tpl-empty']: where }, empty));
    function draw() {
      body.replaceChildren(
        el('p', { className: 'cv-note' }, t('tpl.mgr.lede')),
        el('h3', { className: 'cv-h3' }, t('tpl.mgr.project')), table(projectTpls(), 'project', t('tpl.mgr.project.none')),
        el('h3', { className: 'cv-h3' }, t('tpl.mgr.mine')), el('p', { className: 'cv-note' }, t('tpl.mgr.mine.note')), table(library.list(), 'mine', t('tpl.mgr.mine.none')),
        el('h3', { className: 'cv-h3' }, t('tpl.mgr.examples')), el('div', { className: 'cv-report', 'data-tpl-examples-note': '' }, el('p', {}, t('tpl.mgr.examples.note'))), table(exampleTemplates(U()), 'examples', ''));
      dlg.querySelector('[data-tpl-export]')?.toggleAttribute('disabled', !projectTpls().length);
    }
    draw();
    dlg.addEventListener('close', () => dlg.remove());
    managerRedraw = draw;
    root().append(dlg);
    dlg.showModal();
  }
  let managerRedraw = null;
  const root = () => ctx.root;
  function usesOf(id) {
    let n = 0;
    for (const a of P().state.alignments) for (const c of [a.corridor, ...(a.corridors || [])]) for (const r of c?.regions || []) for (const sd of [r.L, r.R]) for (const u of [...sd.uses, sd.end]) if (u?.tpl === id) n++;
    for (const x of P().state.terrainTemplates || []) if (x.tpl === id) n++;
    return n;
  }
  function exportFile() {
    const list = projectTpls().map(worded);
    ctx.download(JSON.stringify(templatesFile(list), null, 1), ctx.fileStem() + TPL_EXT, 'application/json');
    ctx.say(t('tpl.exported', { n: list.length }));
  }
  /** Import a .cctemplates.json: every template into My library AND the project (one undo step). */
  function importText(text, name) {
    let obj = null;
    try { obj = JSON.parse(text); } catch { ctx.say(t('tpl.file.notjson', { name })); return 0; }
    const r = readTemplatesFile(obj, U());
    if (!r.templates.length) { ctx.say(r.notes[0] ? t('tpl.file.' + r.notes[0].code, r.notes[0].vars || {}) : t('tpl.file.none', { name })); return 0; }
    P().change(t('tpl.undo.import'), (s) => { for (const x of r.templates) addToState(s, x); });
    for (const x of r.templates) library.add(x);
    ctx.say(t('tpl.imported', { n: r.templates.length, name }) + (r.notes.length ? ' ' + t('tpl.file.' + r.notes[0].code, r.notes[0].vars || {}) : ''));
    return r.templates.length;
  }

  // ------------------------------------------------------------------------------------------ the drawing of a template
  function preview(tpl, { w = 360, h = 200, params = {}, labels = false } = {}) {
    const cv = el('canvas', { width: w * 2, height: h * 2, style: `width:${w}px;height:${h}px`, className: 'cv-tpl-canvas', role: 'img', 'aria-label': t('tpl.ed.drawing', { name: label(tpl?.name) }) });
    requestAnimationFrame(() => drawTemplate(cv, tpl, { params, labels }));
    return cv;
  }
  function drawTemplate(cv, tpl, { params = {}, labels = false } = {}) {
    const g = cv.getContext('2d');
    if (!g || !tpl) return;
    const cs = getComputedStyle(cv), ink = cs.getPropertyValue('--ink').trim() || '#222', line = cs.getPropertyValue('--line').trim() || '#999';
    const fills = ['--layer-ochre', '--layer-blue', '--layer-green', '--layer-magenta', '--layer-cyan', '--layer-orange'].map((k) => cs.getPropertyValue(k).trim() || '#c90');
    const r = evalTemplate(tpl, { params });
    const all = [...r.pts.values(), ...r.comps.flatMap((c) => c.poly)];
    let x0 = Math.min(...all.map((p) => p.o)), x1 = Math.max(...all.map((p) => p.o)), z0 = Math.min(...all.map((p) => p.z)), z1 = Math.max(...all.map((p) => p.z));
    if (!(x1 - x0 > 1e-9)) { x0 -= 1; x1 += 1; }
    if (!(z1 - z0 > 1e-9)) { z0 -= 0.5; z1 += 0.5; }
    const W = cv.width, H = cv.height, pad = 14 * (labels ? 2 : 1);
    const k = Math.min((W - 2 * pad) / (x1 - x0), (H - 2 * pad) / (z1 - z0));   // true shape (no exaggeration)
    const X = (o) => pad + (o - x0) * k + ((W - 2 * pad) - (x1 - x0) * k) / 2, Z = (z) => H - pad - (z - z0) * k - ((H - 2 * pad) - (z1 - z0) * k) / 2;
    g.clearRect(0, 0, W, H);
    r.comps.forEach((c, i) => {
      g.beginPath(); c.poly.forEach((p, j) => (j ? g.lineTo(X(p.o), Z(p.z)) : g.moveTo(X(p.o), Z(p.z)))); g.closePath();
      g.globalAlpha = 0.35; g.fillStyle = fills[i % fills.length]; g.fill(); g.globalAlpha = 1; g.strokeStyle = line; g.lineWidth = 1.5; g.stroke();
    });
    const o = r.pts.get('0');
    g.strokeStyle = ink; g.lineWidth = 2; g.beginPath(); g.moveTo(X(o.o) - 8, Z(o.z)); g.lineTo(X(o.o) + 8, Z(o.z)); g.moveTo(X(o.o), Z(o.z) - 8); g.lineTo(X(o.o), Z(o.z) + 8); g.stroke();
    let prev = o;
    for (const p of r.top) {
      g.setLineDash(p.kind === 'preview' ? [6, 4] : []);
      g.lineWidth = 3; g.strokeStyle = ink; g.beginPath(); g.moveTo(X(prev.o), Z(prev.z)); g.lineTo(X(p.o), Z(p.z)); g.stroke();
      prev = p;
    }
    g.setLineDash([]);
    if (labels) {
      g.fillStyle = ink; g.font = '20px system-ui, sans-serif';
      for (const p of r.pts.values()) { g.beginPath(); g.arc(X(p.o), Z(p.z), 4, 0, 2 * Math.PI); g.fill(); g.fillText(p.code, X(p.o) + 6, Z(p.z) - 6); }
    }
  }

  // ------------------------------------------------------------------------------------------ the creation tool (editor)
  function openEditor(src) {
    const did = 'cv-tpl-ed';
    root().querySelector('#' + did)?.remove();
    const base = src ? worded(src) : { name: t('tpl.ed.newname'), kind: 'pavement', note: '', params: [], points: [{ code: 'P1', from: '0', kind: 'slope', dx: U() === 'm' ? 3 : 10, slope: -0.02, top: true }], components: [] };
    const d = JSON.parse(JSON.stringify(base));   // the draft; nothing in the project changes until Save
    const editingId = src?.source === 'project' ? src.id : null;
    const body = el('div', { className: 'cv-dlg-body' }), probs = el('div', { 'data-tpl-problems': '', 'aria-live': 'polite' });
    const canvas = el('canvas', { width: 720, height: 400, style: 'width:360px;height:200px', className: 'cv-tpl-canvas', role: 'img', 'data-tpl-preview': '', 'aria-label': t('tpl.ed.drawing', { name: d.name }) });
    const redraw = () => { drawTemplate(canvas, cleanTemplate(d, U()) || d, { labels: true }); const c = cleanTemplate(d, U()); const ps = c ? templateProblems(c) : [{ code: 'empty' }]; probs.replaceChildren(...(ps.length ? [el('ul', { className: 'cv-report is-error' }, ...ps.map((p) => el('li', { 'data-tpl-problem': p.code }, t('tpl.prob.' + p.code, { at: p.at || '', ...(p.vars || {}) }))))] : [el('p', { className: 'cv-note', 'data-tpl-ok': '' }, t('tpl.ed.ok'))])); };
    const txt = (v, on, attrs = {}) => { const i = el('input', { type: 'text', className: 'cv-input', value: v ?? '', ...attrs }); i.addEventListener('change', () => { on(i.value); redraw(); }); return i; };
    // a number field: a number, or a param key (with a leading - for its negative)
    const numKey = (v, on, attrs) => txt(v === undefined ? '' : String(v), (s) => { const x = s.trim(); on(x === '' ? undefined : Number.isFinite(Number(x)) ? Number(x) : x); }, { style: 'width:4.6rem', ...attrs });
    const sel = (v, opts, on, attrs = {}) => { const s = el('select', { className: 'cv-select', ...attrs }, ...opts.map(([val, lab]) => el('option', { value: val, selected: val === v }, lab))); s.addEventListener('change', () => { on(s.value); draw(); }); return s; };
    function draw() {
      const codes = ['0', ...d.points.map((p) => p.code)];
      const head = el('div', { className: 'cv-props' },
        el('label', { for: 'cv-tpl-name' }, t('tpl.ed.name')), txt(d.name, (v) => { d.name = v; }, { id: 'cv-tpl-name', maxLength: 80, 'data-tpl-name': '' }),
        el('label', { for: 'cv-tpl-kind' }, t('tpl.ed.kind')), sel(d.kind, TPL_KINDS.map((k) => [k, t('tpl.kind.' + k)]), (v) => { d.kind = v; }, { id: 'cv-tpl-kind', 'data-tpl-kind': '' }),
        el('label', { for: 'cv-tpl-note' }, t('tpl.ed.note')), txt(d.note, (v) => { d.note = v; }, { id: 'cv-tpl-note', maxLength: 500 }));
      // params
      const prow = d.params.map((p, i) => el('tr', { 'data-tpl-param': i },
        el('td', {}, txt(p.key, (v) => { p.key = v.trim(); }, { 'aria-label': t('tpl.ed.p.key', { n: i + 1 }), style: 'width:6rem', 'data-tpl-pkey': i })),
        el('td', {}, numKey(p.value, (v) => { p.value = Number(v); }, { 'aria-label': t('tpl.ed.p.value', { n: i + 1 }), 'data-tpl-pvalue': i })),
        el('td', {}, sel(p.kind, PARAM_KINDS.map((k) => [k, t('tpl.pk.' + k)]), (v) => { p.kind = v; }, { 'aria-label': t('tpl.ed.p.kind', { n: i + 1 }) })),
        el('td', {}, icon('bi-x', t('tpl.ed.p.remove', { key: p.key }), () => { d.params.splice(i, 1); draw(); }))));
      // points
      const fields = { slope: ['dx', 'slope'], delta: ['dx', 'dz'], vertical: ['dz'], daylight: ['cut', 'fill'], ground: ['dx'], wall: ['dx'] };
      const ptrow = d.points.map((p, i) => {
        const fs = fields[p.kind] || [];
        const cells = ['dx', 'dz', 'slope', 'cut', 'fill'].map((f) => el('td', {}, fs.includes(f) ? numKey(p[f], (v) => { p[f] = v; }, { 'aria-label': t('tpl.ed.pt.field', { code: p.code, what: t('tpl.f.' + f) }), ['data-tpl-' + f]: i }) : ''));
        const canTarget = p.kind === 'slope' || p.kind === 'delta' || p.kind === 'vertical';
        return el('tr', { 'data-tpl-point': i },
          el('td', {}, txt(p.code, (v) => { const nv = v.trim().toUpperCase(); for (const q of d.points) if (q.from === p.code) q.from = nv; for (const c of d.components) c.pts = c.pts.map((x) => (x === p.code ? nv : x)); p.code = nv; draw(); }, { style: 'width:4.5rem', 'aria-label': t('tpl.ed.pt.code', { n: i + 1 }), 'data-tpl-code': i })),
          el('td', {}, sel(p.from, codes.slice(0, i + 1).map((c) => [c, c === '0' ? t('tpl.ed.origin') : c]), (v) => { p.from = v; }, { 'aria-label': t('tpl.ed.pt.from', { code: p.code }), 'data-tpl-from': i })),
          el('td', {}, sel(p.kind, POINT_KINDS.map((k) => [k, t('tpl.pt.' + k)]), (v) => { p.kind = v; }, { 'aria-label': t('tpl.ed.pt.kind', { code: p.code }), 'data-tpl-ptkind': i })),
          ...cells,
          el('td', {}, el('input', { type: 'checkbox', checked: p.top || p.kind === 'wall', disabled: p.kind === 'wall', 'aria-label': t('tpl.ed.pt.top', { code: p.code }), 'data-tpl-top': i, onchange: (e) => { p.top = e.target.checked; redraw(); } })),
          el('td', {}, canTarget ? sel(p.target || '', [['', t('tpl.tg.none')], ['width', t('tpl.tg.width')], ['elev', t('tpl.tg.elev')]].filter(([k]) => p.kind !== 'vertical' || k !== 'width'), (v) => { if (v) p.target = v; else delete p.target; }, { 'aria-label': t('tpl.ed.pt.target', { code: p.code }), 'data-tpl-target': i }) : ''),
          el('td', { style: 'white-space:nowrap' },
            icon('bi-arrow-up', t('tpl.ed.up', { code: p.code }), () => { [d.points[i - 1], d.points[i]] = [d.points[i], d.points[i - 1]]; draw(); }, {}, i === 0),
            icon('bi-x', t('tpl.ed.pt.remove', { code: p.code }), () => { d.points.splice(i, 1); draw(); }, { 'tpl-ptremove': i })));
      });
      // components
      const crow = d.components.map((c, i) => el('tr', { 'data-tpl-comp': i },
        el('td', {}, txt(c.name, (v) => { c.name = v; }, { 'aria-label': t('tpl.ed.c.name', { n: i + 1 }), style: 'width:7rem', 'data-tpl-cname': i })),
        el('td', {}, txt(c.material, (v) => { c.material = v; }, { 'aria-label': t('tpl.ed.c.material', { n: i + 1 }), style: 'width:7rem' })),
        el('td', {}, sel(c.kind, COMP_KINDS.map((k) => [k, t('tpl.ck.' + k)]), (v) => { c.kind = v; }, { 'aria-label': t('tpl.ed.c.kind', { n: i + 1 }) })),
        el('td', {}, txt(c.pts.join(' '), (v) => { c.pts = v.trim().toUpperCase().split(/[\s,]+/).filter(Boolean); }, { 'aria-label': t('tpl.ed.c.pts', { n: i + 1 }), style: 'width:11rem', 'data-tpl-cpts': i })),
        el('td', {}, icon('bi-x', t('tpl.ed.c.remove', { n: i + 1 }), () => { d.components.splice(i, 1); draw(); }))));
      const th = (keys) => el('thead', {}, el('tr', {}, ...keys.map((k) => el('th', { scope: 'col' }, k ? t(k) : ''))));
      body.replaceChildren(
        el('p', { className: 'cv-note' }, t('tpl.ed.lede')),
        head, el('div', { className: 'cv-tpl-draw' }, canvas, el('p', { className: 'cv-note' }, t('tpl.ed.drawnote'))), probs,
        el('h3', { className: 'cv-h3' }, t('tpl.ed.params')), el('p', { className: 'cv-note' }, t('tpl.ed.params.note')),
        el('div', { className: 'cv-table-wrap' }, el('table', { className: 'cv-table', 'data-tpl-params': '' }, th(['tpl.ed.p.k', 'tpl.ed.p.v', 'tpl.ed.p.kd', '']), el('tbody', {}, ...prow))),
        el('div', { className: 'cv-actions' }, btn(t('tpl.ed.p.add'), () => { let n = d.params.length + 1; while (d.params.some((p) => p.key === 'p' + n)) n++; d.params.push({ key: 'p' + n, value: 1, kind: 'len' }); draw(); }, { 'tpl-padd': '' }, { disabled: d.params.length >= MAX_PARAMS })),
        el('h3', { className: 'cv-h3' }, t('tpl.ed.points')), el('p', { className: 'cv-note' }, t('tpl.ed.points.note')),
        el('div', { className: 'cv-table-wrap' }, el('table', { className: 'cv-table', 'data-tpl-points': '' }, th(['tpl.ed.pt.c', 'tpl.ed.pt.f', 'tpl.ed.pt.k', 'tpl.f.dx', 'tpl.f.dz', 'tpl.f.slope', 'tpl.f.cut', 'tpl.f.fill', 'tpl.ed.pt.t', 'tpl.ed.pt.tg', '']), el('tbody', {}, ...ptrow))),
        el('div', { className: 'cv-actions' }, btn(t('tpl.ed.pt.add'), () => { let n = d.points.length + 1; while (d.points.some((p) => p.code === 'P' + n)) n++; const last = d.points[d.points.length - 1]; d.points.push({ code: 'P' + n, from: last ? last.code : '0', kind: 'slope', dx: U() === 'm' ? 1 : 3, slope: 0, top: true }); draw(); }, { 'tpl-ptadd': '' }, { disabled: d.points.length >= MAX_POINTS })),
        el('h3', { className: 'cv-h3' }, t('tpl.ed.comps')), el('p', { className: 'cv-note' }, t('tpl.ed.comps.note')),
        el('div', { className: 'cv-table-wrap' }, el('table', { className: 'cv-table', 'data-tpl-comps': '' }, th(['tpl.ed.c.n', 'tpl.ed.c.m', 'tpl.ed.c.k', 'tpl.ed.c.p', '']), el('tbody', {}, ...crow))),
        el('div', { className: 'cv-actions' }, btn(t('tpl.ed.c.add'), () => { d.components.push({ name: '', material: '', kind: 'other', pts: [] }); draw(); }, { 'tpl-cadd': '' }, { disabled: d.components.length >= MAX_COMPS })));
      redraw();
    }
    const save = () => {
      const c = cleanTemplate(d, U());
      if (!c) { ctx.say(t('tpl.prob.empty')); return; }
      if (editingId) P().change(t('tpl.undo.edit'), (s) => { const i = s.templates.findIndex((x) => x.id === editingId); if (i >= 0) s.templates[i] = { ...c, id: editingId, source: 'project', ...(src.check ? { check: true } : {}) }; });
      else addToProject(c);
      ctx.say(t('tpl.saved', { name: c.name }));
      dlg.close();
      managerRedraw?.();
      ctx.refresh?.();
    };
    const dlg = el('dialog', { className: 'cv-dialog cv-tpl-dlg cv-tpl-ed', id: did, 'aria-labelledby': did + '-t', 'data-tpl-editor': '' },
      el('div', { className: 'cv-dlg' },
        el('div', { className: 'cv-dlg-head' }, el('h2', { className: 'cv-h', id: did + '-t' }, t(editingId ? 'tpl.ed.title.edit' : 'tpl.ed.title.new')), icon('bi-x-lg', t('tpl.close'), () => dlg.close())),
        body,
        el('div', { className: 'cv-dlg-foot' },
          btn(t(editingId ? 'tpl.ed.save' : 'tpl.ed.saveproject'), save, { 'tpl-save': '' }),
          btn(t('tpl.ed.savelib'), () => { const c = cleanTemplate(d, U()); if (c && library.add(c)) ctx.say(t('tpl.lib.added', { name: c.name })); }, { 'tpl-savelib': '' }),
          btn(t('tpl.ed.cancel'), () => dlg.close(), { 'tpl-cancel': '' }))));
    draw();
    dlg.addEventListener('close', () => dlg.remove());
    root().append(dlg);
    dlg.showModal();
    return dlg;
  }

  // ------------------------------------------------------------------------------------------ a corridor's regions
  /** The corridor's "Build from templates by station" block. `key` = the alignment's id (its own corridor) or a cr<n> id. */
  function corridorBlock(a, c, key, item) {
    const out = [];
    const find = (s) => { const x = s.alignments.find((y) => y.id === a.id); return key === a.id ? x.corridor : (x.corridors || []).find((y) => y.id === key); };
    const edit = (label, fn) => P().change(label, (s) => { const cc = find(s); if (cc) fn(cc, s); });
    const al = P().alignment(a);
    const on = el('input', { type: 'checkbox', id: 'cv-tpl-on-' + key, checked: !!c.regions, 'data-tpl-on': key });
    on.addEventListener('change', () => {
      if (!on.checked) { edit(t('tpl.undo.off'), (cc) => { delete cc.regions; }); return; }
      // start from the examples: two lanes and a daylight on each side (copied into the project once; one undo step)
      edit(t('tpl.undo.on'), (cc, s) => { const lanes = exampleIn(s, 'lanes'), day = exampleIn(s, 'daylight'); cc.regions = [{ from: Number.isFinite(cc.from) ? cc.from : al.ok ? al.start : 0, L: { uses: [{ tpl: lanes }], end: { tpl: day } }, R: { uses: [{ tpl: lanes }], end: { tpl: day } } }]; });
    });
    out.push(el('h3', { className: 'cv-h3' }, t('tpl.co.head')), el('label', { className: 'cv-check', for: 'cv-tpl-on-' + key }, on, ' ', t('tpl.co.on')));
    // the corridor's own station range (several corridors on one alignment)
    const stIn = (v, k, id) => ctx.numInput(Number.isFinite(v) ? fixed(v, 2) : '', (s) => { const x = s.trim() === '' ? null : Number(s); if (x !== null && !Number.isFinite(x)) return false; edit(t('tpl.undo.range'), (cc) => { if (x === null) delete cc[k]; else cc[k] = x; }); }, { id, station: true });
    const fid = 'cv-tpl-from-' + key, tid = 'cv-tpl-to-' + key;
    out.push(el('div', { className: 'cv-props', 'data-tpl-range': key }, el('label', { for: fid }, t('tpl.co.from')), stIn(c.from, 'from', fid), el('label', { for: tid }, t('tpl.co.to')), stIn(c.to, 'to', tid)),
      el('p', { className: 'cv-note' }, t('tpl.co.range.note')));
    if (!c.regions) { out.push(el('p', { className: 'cv-note' }, t('tpl.co.off.note'))); return out; }
    const all = projectTpls(), byId = new Map(all.map((x) => [x.id, x]));
    const paves = all.filter((x) => x.kind !== 'terrain' && !endKind(x)), ends = all.filter((x) => endKind(x));
    const opt = (list, v, none) => [...(none ? [el('option', { value: '' }, none)] : []), ...list.map((x) => el('option', { value: x.id, selected: x.id === v }, label(x.name) + (x.check ? ' · ' + t('tpl.check.short') : '')))];
    const sources = targetSources(P(), a);
    c.regions.forEach((r, ri) => {
      const box = el('div', { className: 'cv-tpl-region', 'data-tpl-region': ri });
      const from = ctx.numInput(fixed(r.from, 2), (s) => { const x = Number(s); if (!Number.isFinite(x)) return false; edit(t('tpl.undo.region'), (cc) => { cc.regions[ri].from = x; cc.regions.sort((p, q) => p.from - q.from); }); }, { label: t('tpl.co.region.from', { n: ri + 1 }), width: '6rem', station: true });
      box.append(el('div', { className: 'cv-row' }, el('strong', {}, t('tpl.co.region', { n: ri + 1 })), ' ', el('span', { className: 'cv-unit' }, t('tpl.co.region.at')), from,
        icon('bi-x', t('tpl.co.region.remove', { n: ri + 1 }), () => edit(t('tpl.undo.region'), (cc) => { cc.regions.splice(ri, 1); if (!cc.regions.length) delete cc.regions; }), { 'tpl-region-remove': ri }, c.regions.length <= 1)));
      for (const side of ['L', 'R']) {
        const sd = r[side], sname = t(side === 'L' ? 'as.left' : 'as.right');
        const setSide = (label, fn) => edit(label, (cc) => fn(cc.regions[ri][side]));
        const useRow = (u, ui, isEnd) => {
          const tpl = byId.get(u.tpl);
          const pick = el('select', { className: 'cv-select', 'aria-label': t(isEnd ? 'tpl.co.end.of' : 'tpl.co.use.of', { side: sname, n: ui + 1, region: ri + 1 }), [isEnd ? 'data-tpl-end' : 'data-tpl-use']: side + ri + (isEnd ? '' : ':' + ui) }, ...opt(isEnd ? ends : paves, u.tpl, isEnd ? t('tpl.co.end.none') : null));
          pick.addEventListener('change', () => setSide(t('tpl.undo.use'), (S) => { if (isEnd) { if (pick.value) S.end = { tpl: pick.value }; else S.end = null; } else S.uses[ui] = { tpl: pick.value }; }));
          const cells = [pick];
          if (!isEnd) cells.push(icon('bi-x', t('tpl.co.use.remove', { side: sname, n: ui + 1 }), () => setSide(t('tpl.undo.use'), (S) => { S.uses.splice(ui, 1); }), { 'tpl-use-remove': side + ri + ':' + ui }));
          // this use's values (the template's params; a box left empty = the template's own value)
          for (const p of tpl?.params || []) {
            const cur = u.params?.[p.key];
            const inp = ctx.numInput(cur === undefined ? '' : String(p.kind === 'slope' ? cur * 100 : cur), (s) => {
              const x = s.trim() === '' ? null : Number(s); if (x !== null && !Number.isFinite(x)) return false;
              setSide(t('tpl.undo.param'), (S) => { const U2 = isEnd ? S.end : S.uses[ui]; if (!U2) return; U2.params ||= {}; if (x === null) delete U2.params[p.key]; else U2.params[p.key] = p.kind === 'slope' ? x / 100 : x; if (!Object.keys(U2.params).length) delete U2.params; });
            }, { label: t('tpl.co.param', { key: p.key, name: label(tpl.name), side: sname }), width: '3.6rem', calc: p.kind === 'len' });
            inp.placeholder = p.kind === 'slope' ? fixed(p.value * 100, 2) : fixed(p.value, 2);
            inp.dataset.tplParam = side + ri + ':' + (isEnd ? 'E' : ui) + ':' + p.key;
            cells.push(el('span', { className: 'cv-unit' }, p.key + (p.kind === 'slope' ? ' %' : p.kind === 'ratio' ? ' :1' : '')), inp);
          }
          // this use's targets: the template's points that may follow a line
          for (const q of (tpl?.points || []).filter((x) => x.target)) {
            const curT = u.targets?.[q.code];
            const keyOf = (f) => (f ? f.kind + ':' + f.id + (f.line ? ':' + f.line : '') : '');
            const s2 = el('select', { className: 'cv-select', 'aria-label': t('tpl.co.target', { code: q.code, what: t('tpl.tg.' + q.target), side: sname }), 'data-tpl-tg': side + ri + ':' + (isEnd ? 'E' : ui) + ':' + q.code },
              el('option', { value: '' }, t('tpl.co.target.none', { code: q.code, what: t('tpl.tg.' + q.target) })), ...sources.map((o) => el('option', { value: o.value, selected: o.value === keyOf(curT) }, o.label)));
            s2.addEventListener('change', () => setSide(t('tpl.undo.target'), (S) => { const U2 = isEnd ? S.end : S.uses[ui]; if (!U2) return; const src = sources.find((o) => o.value === s2.value); U2.targets ||= {}; if (src) U2.targets[q.code] = src.from; else delete U2.targets[q.code]; if (!Object.keys(U2.targets).length) delete U2.targets; }));
            cells.push(s2);
          }
          return el('div', { className: 'cv-row cv-tpl-use' }, ...cells);
        };
        const add = el('select', { className: 'cv-select', 'aria-label': t('tpl.co.add.of', { side: sname, region: ri + 1 }), 'data-tpl-add-pick': side + ri }, ...opt(paves, paves[0]?.id));
        box.append(el('div', { className: 'cv-tpl-side', 'data-tpl-side': side + ri },
          el('div', { className: 'cv-unit' }, t(side === 'L' ? 'tpl.co.left' : 'tpl.co.right')),
          el('div', { className: 'cv-note' }, t('tpl.co.pavement')),
          ...sd.uses.map((u, ui) => useRow(u, ui, false)),
          el('div', { className: 'cv-actions' }, add, btn(t('tpl.co.add'), () => { if (add.value) setSide(t('tpl.undo.use'), (S) => { S.uses.push({ tpl: add.value }); }); }, { 'tpl-add': side + ri }, { disabled: !paves.length || sd.uses.length >= MAX_USES })),
          el('div', { className: 'cv-note' }, t('tpl.co.end')),
          useRow(sd.end || { tpl: '' }, 0, true)));
      }
      box.append(el('div', { className: 'cv-actions' },
        btn(t('tpl.co.copy.lr'), () => edit(t('tpl.undo.copy'), (cc) => { cc.regions[ri].R = JSON.parse(JSON.stringify(cc.regions[ri].L)); }), { 'tpl-copy': 'lr' + ri }),
        btn(t('tpl.co.copy.rl'), () => edit(t('tpl.undo.copy'), (cc) => { cc.regions[ri].L = JSON.parse(JSON.stringify(cc.regions[ri].R)); }), { 'tpl-copy': 'rl' + ri })));
      out.push(box);
    });
    const last = c.regions[c.regions.length - 1], end = Number.isFinite(c.to) ? c.to : al.ok ? al.end : last.from + 100;
    out.push(el('div', { className: 'cv-actions' },
      btn(t('tpl.co.region.add'), () => edit(t('tpl.undo.region'), (cc) => { const L = cc.regions[cc.regions.length - 1]; const at = Math.round(((L.from + end) / 2) * 100) / 100; cc.regions.push({ from: at > L.from ? at : L.from + 1, L: JSON.parse(JSON.stringify(L.L)), R: JSON.parse(JSON.stringify(L.R)) }); }), { 'tpl-region-add': key }, { disabled: c.regions.length >= MAX_REGIONS }),
      btn(t('tpl.co.manage'), openManager, { 'tpl-manage': key })));
    out.push(el('p', { className: 'cv-note' }, t('tpl.co.note')));
    // what this corridor's components add up to
    const comps = item?.components || [];
    if (comps.length) {
      out.push(el('div', { className: 'cv-table-wrap' }, el('table', { className: 'cv-table', 'data-tpl-qty': key },
        el('thead', {}, el('tr', {}, ...['tpl.q.comp', 'tpl.q.where', 'tpl.q.length', 'tpl.q.volume'].map((k) => el('th', { scope: 'col' }, t(k, { u: uShort() }))))),
        el('tbody', {}, ...comps.map((q) => el('tr', {}, el('td', {}, (label(q.name) || t('tpl.ck.' + q.kind)) + (q.material ? ' (' + label(q.material) + ')' : '') + (q.wall ? ' · ' + t('tpl.q.wallh', { h: fixed(q.maxH, 2), u: uShort() }) : '')),
          el('td', {}, t('tpl.q.at', { side: t(q.side === 'L' ? 'as.left' : 'as.right'), n: q.region + 1 })), el('td', { className: 'num' }, fixed(q.length, 1)), el('td', { className: 'num', 'data-tpl-vol': '' }, vol(q.volume))))))),
      el('p', { className: 'cv-note' }, t('tpl.q.note')));
    }
    return out;
  }

  /** "Corridors on this alignment": more corridors on other station ranges (each with its own templates). */
  function moreCorridors(a, graded) {
    const out = [el('h3', { className: 'cv-h3' }, t('tpl.more.head'))];
    const more = a.corridors || [];
    const al = P().alignment(a);
    const edit = (label, fn) => P().change(label, (s) => { const x = s.alignments.find((y) => y.id === a.id); fn(x, s); });
    out.push(el('p', { className: 'cv-note' }, t(more.length ? 'tpl.more.note' : 'tpl.more.none')));
    more.forEach((c, i) => {
      const it = graded?.items?.find((x) => x.id === c.id);
      const on = el('input', { type: 'checkbox', id: 'cv-more-on-' + c.id, checked: !!c.on, 'data-more-on': c.id });
      on.addEventListener('change', () => edit(t('tpl.undo.more'), (x) => { x.corridors[i].on = on.checked; }));
      const nm = el('input', { type: 'text', className: 'cv-input', value: c.name, maxLength: 80, 'aria-label': t('tpl.more.name', { n: i + 2 }), 'data-more-name': c.id });
      nm.addEventListener('change', () => edit(t('tpl.undo.more'), (x) => { x.corridors[i].name = nm.value.trim().slice(0, 80) || t('tpl.corr.default'); }));
      const box = el('div', { className: 'cv-tpl-region', 'data-more': c.id },
        el('div', { className: 'cv-row' }, el('label', { className: 'cv-check', for: 'cv-more-on-' + c.id }, on, ' ', t('tpl.more.on')), nm,
          icon('bi-trash3', t('tpl.more.remove', { name: c.name }), () => edit(t('tpl.undo.more'), (x) => { x.corridors.splice(i, 1); if (!x.corridors.length) delete x.corridors; }), { 'more-remove': c.id })));
      if (it?.problems?.length) box.append(el('div', { className: 'cv-report is-error' }, el('ul', {}, ...it.problems.map((p) => el('li', {}, p)))));
      else if (it?.sections) box.append(el('p', { className: 'cv-note', 'data-more-facts': c.id }, t('tpl.more.facts', { n: it.sections.length, from: fixed(it.from, 2), to: fixed(it.to, 2) })));
      box.append(...corridorBlock(a, c, c.id, it));
      out.push(box);
    });
    out.push(el('div', { className: 'cv-actions' }, btn(t('tpl.more.add'), () => {
      edit(t('tpl.undo.more'), (x, s) => {
        const main = x.corridor || {};
        const L = al.ok ? al.length : 100, st = al.ok ? al.start : 0, end = al.ok ? al.end : st + L;
        const split = Number.isFinite(main.to) ? main.to : Math.round((st + L / 2) * 100) / 100;
        if (x.corridor && !Number.isFinite(main.to)) x.corridor.to = split;
        const last = (x.corridors || []).reduce((m, y) => Math.max(m, Number.isFinite(y.to) ? y.to : -Infinity), -Infinity);
        const from = Number.isFinite(last) && last < end ? last : split;
        const n = s.seq || 1; s.seq = n + 1;
        const regions = main.regions ? JSON.parse(JSON.stringify(main.regions.slice(-1))).map((r) => ({ ...r, from })) : undefined;
        (x.corridors ||= []).push({ id: 'cr' + n, name: t('tpl.more.default', { n: x.corridors.length + 2 }), on: true, lane: main.lane ?? 12, laneSlope: main.laneSlope ?? 0.02, shoulder: main.shoulder ?? 4, shoulderSlope: main.shoulderSlope ?? 0.04, cut: main.cut ?? 2, fill: main.fill ?? 3, step: main.step ?? 10, from, to: end, ...(regions ? { regions } : {}) });
      });
    }, { 'more-add': a.id }, { disabled: more.length >= 20 || !al.ok })));
    return out;
  }

  // ------------------------------------------------------------------------------------------ terrain templates
  function terrainBlock() {
    const s = P().state, list = s.terrainTemplates || [], res = P().terrainResults();
    const out = [el('h3', { className: 'cv-h3', id: 'cv-tt-head', tabIndex: -1, 'data-tt-block': '' }, t('tpl.tt.head'))];
    out.push(el('p', { className: 'cv-note' }, t('tpl.tt.lede')));
    const tpls = projectTpls();
    const shapes = [['', t('tpl.tt.whole')],
      ...(s.parcels || []).map((x) => ['parcel:' + x.id, t('tpl.tt.parcel', { name: x.name })]),
      ...s.pads.map((x) => ['pad:' + x.id, t('tpl.tt.pad', { name: x.name })]),
      ...(s.features || []).filter((f) => f.closed).map((x) => ['feature:' + x.id, t('tpl.tt.feature', { name: x.name })])];
    const edit = (label, i, fn) => P().change(label, (st) => { fn(st.terrainTemplates[i], st); });
    list.forEach((x, i) => {
      const r = res.find((y) => y.id === x.id), tpl = tpls.find((y) => y.id === x.tpl);
      const pick = el('select', { className: 'cv-select', 'aria-label': t('tpl.tt.tpl', { name: x.name }), 'data-tt-tpl': x.id }, ...tpls.map((y) => el('option', { value: y.id, selected: y.id === x.tpl }, label(y.name))));
      pick.addEventListener('change', () => edit(t('tpl.undo.tt'), i, (z) => { z.tpl = pick.value; delete z.params; }));
      const surf = el('select', { className: 'cv-select', 'aria-label': t('tpl.tt.surface', { name: x.name }), 'data-tt-surface': x.id }, el('option', { value: 'eg', selected: x.surface !== 'fg' }, t('tpl.tt.eg')), el('option', { value: 'fg', selected: x.surface === 'fg' }, t('tpl.tt.fg')));
      surf.addEventListener('change', () => edit(t('tpl.undo.tt'), i, (z) => { z.surface = surf.value; }));
      const cur = x.clip ? x.clip.kind + ':' + x.clip.id : '';
      const shape = el('select', { className: 'cv-select', 'aria-label': t('tpl.tt.shape', { name: x.name }), 'data-tt-shape': x.id }, ...shapes.map(([v, l]) => el('option', { value: v, selected: v === cur }, l)));
      shape.addEventListener('change', () => edit(t('tpl.undo.tt'), i, (z) => { const [k, id] = shape.value.split(':'); z.clip = k ? { kind: k, id } : null; }));
      const nm = el('input', { type: 'text', className: 'cv-input', value: x.name, maxLength: 80, 'aria-label': t('tpl.tt.name', { n: i + 1 }), 'data-tt-name': x.id });
      nm.addEventListener('change', () => edit(t('tpl.undo.tt'), i, (z) => { z.name = nm.value.trim().slice(0, 80) || t('tpl.tt.default', { n: i + 1 }); }));
      const box = el('div', { className: 'cv-tpl-region', 'data-tt': x.id },
        el('div', { className: 'cv-row' }, nm, icon('bi-trash3', t('tpl.tt.remove', { name: x.name }), () => P().change(t('tpl.undo.tt'), (st) => { st.terrainTemplates.splice(i, 1); if (!st.terrainTemplates.length) delete st.terrainTemplates; }), { 'tt-remove': x.id })),
        el('div', { className: 'cv-props' }, el('span', { className: 'k' }, t('tpl.tt.l.tpl')), pick, el('span', { className: 'k' }, t('tpl.tt.l.surface')), surf, el('span', { className: 'k' }, t('tpl.tt.l.shape')), shape));
      for (const p of tpl?.params || []) {
        const v = x.params?.[p.key];
        const inp = ctx.numInput(v === undefined ? '' : String(v), (sv) => { const n = sv.trim() === '' ? null : Number(sv); if (n !== null && !Number.isFinite(n)) return false; edit(t('tpl.undo.param'), i, (z) => { z.params ||= {}; if (n === null) delete z.params[p.key]; else z.params[p.key] = n; if (!Object.keys(z.params).length) delete z.params; }); }, { label: t('tpl.tt.param', { key: p.key, name: x.name }), width: '4rem' });
        inp.placeholder = fixed(paramValue(tpl, p.key), 3);
        inp.dataset.ttParam = x.id + ':' + p.key;
        box.append(el('div', { className: 'cv-row' }, el('span', { className: 'cv-unit' }, p.key), inp, el('span', { className: 'cv-unit' }, uShort())));
      }
      if (r?.problem) box.append(el('p', { className: 'cv-report is-error', 'data-tt-problem': r.problem }, t('tpl.tt.prob.' + r.problem)));
      else if (r?.q) {
        box.append(el('div', { className: 'cv-table-wrap' }, el('table', { className: 'cv-table', 'data-tt-qty': x.id },
          el('thead', {}, el('tr', {}, ...['tpl.tt.layer', 'tpl.tt.place', 'tpl.tt.t', 'tpl.tt.area', 'tpl.q.volume'].map((k) => el('th', { scope: 'col' }, t(k, { u: uShort(), a: area() }))))),
          el('tbody', {}, ...r.q.layers.map((L) => el('tr', {}, el('td', {}, (label(L.name) || t('tpl.ck.' + L.kind)) + (L.material ? ' (' + label(L.material) + ')' : '')), el('td', {}, t('tpl.tt.where.' + L.where)),
            el('td', { className: 'num' }, fixed(L.t, 3)), el('td', { className: 'num' }, fixed(L.planArea, 1)), el('td', { className: 'num', 'data-tt-vol': '' }, vol(L.volume))))))),
        el('p', { className: 'cv-note' }, t('tpl.tt.note', { n: r.q.cells, cell: fixed(r.q.cell, 3), u: uShort(), sloped: fixed(r.q.slopedArea, 1), a: area() })));
      }
      out.push(box);
    });
    out.push(el('div', { className: 'cv-actions' },
      btn(t('tpl.tt.add'), () => {
        P().change(t('tpl.undo.tt'), (st) => { const tid = (st.templates || []).find((y) => y.kind === 'terrain')?.id || exampleIn(st, 'topsoil'); const n = st.seq || 1; st.seq = n + 1; (st.terrainTemplates ||= []).push({ id: 'tt' + n, name: t('tpl.tt.default', { n: (st.terrainTemplates.length || 0) + 1 }), tpl: tid, surface: 'eg', clip: null }); });
      }, { 'tt-add': '' }),
      btn(t('tpl.co.manage'), openManager, { 'tt-manage': '' })));
    return out;
  }

  /** Earthwork › Materials: everything the templates place (corridor components and terrain layers). */
  function materialsBlock() {
    const rows = P().materials();
    if (!rows.length) return [];
    return [el('h3', { className: 'cv-h3' }, t('tpl.mat.head')), el('div', { className: 'cv-table-wrap' }, el('table', { className: 'cv-table', 'data-tpl-materials': '' },
      el('thead', {}, el('tr', {}, ...['tpl.mat.what', 'tpl.mat.from', 'tpl.q.volume'].map((k) => el('th', { scope: 'col' }, t(k))))),
      el('tbody', {}, ...rows.map((r) => el('tr', {}, el('td', {}, (label(r.name) || t('tpl.ck.' + r.kind)) + (r.material ? ' (' + label(r.material) + ')' : '')), el('td', {}, r.item + (r.side ? ' · ' + t(r.side === 'L' ? 'as.left' : 'as.right') : '')), el('td', { className: 'num' }, vol(r.volume))))))),
    el('p', { className: 'cv-note' }, t('tpl.mat.note'))];
  }

  /** Plan: each terrain template's shape (dashed) with its name, on C-TOPO-TMPL. */
  function sceneItems() {
    const out = [];
    for (const x of P().state.terrainTemplates || []) {
      const clip = P().clipShape(x.clip);
      if (!clip) continue;
      out.push({ layer: 'C-TOPO-TMPL', kind: 'poly', pts: [...clip, clip[0]], dashed: true });
      const cx = clip.reduce((v, q) => v + q.x, 0) / clip.length, cy = clip.reduce((v, q) => v + q.y, 0) / clip.length;
      out.push({ layer: 'C-TOPO-TMPL', kind: 'text', x: cx, y: cy, rot: 0, mm: 2.0, align: 'center', middle: true, text: x.name, mask: true });
    }
    return out;
  }

  function command(c) {
    if (c === 'corridor-templates') { openManager(); return true; }
    if (c === 'terrain-templates') { ctx.showProject(); requestAnimationFrame(() => root().querySelector('[data-tt-block]')?.focus()); return true; }
    return false;
  }
  return { command, corridorBlock, moreCorridors, terrainBlock, materialsBlock, sceneItems, library, openManager, openEditor, importText, label };
}

export { CORRIDOR_LINES };
