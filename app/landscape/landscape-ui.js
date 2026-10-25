/* SPDX-License-Identifier: Apache-2.0 */
/**
 * landscape-ui.js — CivilCraft's Landscape workspace on the page (0.7 Track LD, session `landscape`). civilcraft.js calls
 * createLandscape(ctx) once and asks it at a few hooks (tool clicks, finishing a drawn line, picking, Properties, delete, the
 * plan scene, the overlay, commands); everything landscape lives here and in the DOM-free modules beside it.
 *
 *   ctx = { root, el, project(), units(), say(m), refocus(), select(sel), command(c), setTool(t), tool(), redraw(), refresh(),
 *           download(bytes, name, type), fileStem(), numInput(…), row(…), groundAt(x, y) → z | null, cursor() → {x, y} | null }
 *   → { active(), setActive(on), command(c) → handled, ownsTool(t), hints, click(tool, w, s) → handled, finish(tool, pts) → done,
 *       closedTool(t), isMine(sel), props(sel, box, head) → shown, remove(sel) → removed, pick(w, tol) → sel | null,
 *       sceneItems(unitPerMm), overlay(ctx2d, toScreen, colors, sel), updateTools(), ready (Promise: the seed list),
 *       index(), schedule() }
 *
 * The workspace: Surface › More › Landscape workspace (or the Workspace select it adds) hides the Surface, Design and GIS groups
 * and shows Workspace + Landscape, puts a Plants section at the top of the left panel, and remembers the choice in this
 * browser (localStorage civilcraft.workspace). Lowest tier (rule 19): plants are plan symbols only; the 3D view shows them as
 * simple round masses through the IFC/3D export, never a scatter.
 */

import { readPlants, plantsFromCsv, plantsToCsv, search, displayName, sizeOf, TYPES, LIGHT, WATER, mergeLists } from './plants.js';
import { emptyLandscape, speciesIndex, bedFill, hedgeFill, schedule, scheduleRows, scheduleCsv, scheduleQuantities, sceneItems as plantItems,
  pickPlanting, unitM, bedSpacingM, inside } from './planting.js';
import { writeLandscapeIfc, plantingElements } from './ifc-landscape.js';
import { createGradeUi } from './grade-ui.js';
import { createHardUi } from './hard-ui.js';
import { createIrrUi } from './irr-ui.js';
import { createFfUi } from './ff-ui.js';
import { landscapeSheets, SHEET_KINDS } from './sheets.js';
import { PAPERS, paperBy, scalesFor, fitScale, toPdfPages } from '../plot.js';
import { wallLayout, stepsLayout } from './hardscape.js';
import { KPA_PER_PSI, LMIN_PER_GPM } from './irrigation.js';
import { t, locale } from '../i18n.js';
import { fixed } from '../units.js';

const WS_KEY = 'civilcraft.workspace';
const PLANT_TOOLS = ['ls-plant', 'ls-bed', 'ls-hedge'];
const HIDE_IN_LS = ['Surface', 'Design', 'GIS'];   // i18n-ignore: group keys (their aria-labels)
const SHOW_MAX = 200;   // rows listed in the Plants section at a time

export function createLandscape(ctx) {
  const { el, root } = ctx;
  const P = () => ctx.project();
  const U = () => (ctx.units() === 'm' ? 'm' : 'ft');
  const lang = () => { try { return locale() || 'en'; } catch { return 'en'; } };
  const LS = () => P().state.landscape || emptyLandscape();
  let on = false, seed = [], cur = null, query = '', filters = {};
  let idxCache = { key: '', idx: new Map() };
  const gr = createGradeUi(ctx, { edit: (label, fn) => edit(label, fn), LS: () => LS(), U: () => U() });   // LD.3
  const hd = createHardUi(ctx, { edit: (label, fn) => edit(label, fn), LS: () => LS(), U: () => U() });   // LD.4
  const ir = createIrrUi(ctx, { edit: (label, fn) => edit(label, fn), LS: () => LS(), U: () => U() });   // LD.5
  const ff = createFfUi(ctx, { edit: (label, fn) => edit(label, fn), LS: () => LS(), U: () => U() });   // LD.7
  const TOOLS = [...PLANT_TOOLS, ...gr.tools, ...hd.tools, ...ir.tools, ...ff.tools];
  const parts = [gr, hd, ir, ff];

  // ---- the seed list (loaded once, beside this module) ----
  const ready = (async () => {
    try {
      const r = await fetch(new URL('./plants-seed.json', import.meta.url));
      seed = readPlants(await r.json()).library.species;
    } catch (e) { seed = []; ctx.say(t('ls.seed.failed', { why: String(e.message || e) })); }
    idxCache.key = '';
    if (on) { renderPlants(); ctx.refresh(); }
  })();
  function index() {
    const pal = LS().palette || [];
    const key = seed.length + '|' + JSON.stringify(pal);
    if (idxCache.key !== key) idxCache = { key, idx: speciesIndex(seed, pal) };
    return idxCache.idx;
  }
  const edit = (label, fn) => P().change(label, (s) => { if (!s.landscape) s.landscape = emptyLandscape(); fn(s.landscape); });
  const find = (kind, id) => (LS()[kind === 'plant' ? 'plants' : kind === 'bed' ? 'beds' : 'hedges'] || []).find((x) => x.id === id) || null;
  const nameOf = (key) => { const sp = index().get(key); return sp ? `${displayName(sp, lang())} (${sp.botanical})` : key; };
  const um = () => unitM(U());
  const lenText = (m) => fixed(m / um(), 2) + ' ' + (U() === 'm' ? 'm' : 'ft');

  // ---- toolbar: the Workspace and Landscape groups (made here, like ModelCraft's workspaces) ----
  const toolbar = root.querySelector('.cv-tools');
  const btn = (cmd, icon, label, title) => {
    // i18n-ignore: an icon class name (the next line)
    const b = el('button', { type: 'button', className: 'cv-tool', dataset: { cmd }, title }, el('i', { className: 'bi bi-' + icon, 'aria-hidden': 'true' }), el('span', {}, label));
    return b;   // civilcraft.js wires every [data-cmd] in the page to command() once, after this module has added these
  };
  const menuItem = (cmd, label, title, role = 'menuitem') => {
    return el('button', { type: 'button', role, dataset: { cmd }, title }, label);
  };
  function closeMenus() { for (const d of root.querySelectorAll('details.cv-menu[open]')) d.open = false; }
  const wsSel = el('select', { className: 'cv-select cv-ls-ws', id: 'cv-workspace', 'data-ls-workspace': '', title: t('ls.ws.title') },
    el('option', { value: 'civil' }, t('ls.ws.civil')), el('option', { value: 'landscape' }, t('ls.ws.landscape')));
  wsSel.addEventListener('change', () => setActive(wsSel.value === 'landscape'));
  const wsGroup = el('div', { className: 'cv-tool-group cv-ls-wsgroup', role: 'group', 'aria-label': 'Workspace', dataset: { lsGroup: '' }, hidden: true },   // i18n-ignore: a group's aria-label is its key in Arrange the toolbar
    el('label', { className: 'cv-tool-label', for: 'cv-workspace' }, t('ls.ws.group')), el('div', { className: 'cv-tool-row' }, wsSel));
  const more = el('details', { className: 'cv-menu', dataset: { groupMenu: 'Landscape' } },   // i18n-ignore: the group's key
    el('summary', { className: 'cv-tool', title: t('ls.more.title') }, el('i', { className: 'bi bi-three-dots', 'aria-hidden': 'true' }), el('span', {}, t('toolbar.more'))),
    el('div', { className: 'cv-menu-list', role: 'menu' },
      menuItem('ls-schedule', t('ls.tb.schedule'), t('ls.tb.schedule.title')),
      menuItem('ls-freeform-open', t('ls.tb.freeform'), t('ls.tb.freeform.title')),
      menuItem('ls-sheets', t('ls.tb.sheets'), t('ls.tb.sheets.title')),
      menuItem('ls-ifc', t('ls.tb.ifc'), t('ls.tb.ifc.title')),
      menuItem('ls-size', t('ls.tb.size'), t('ls.tb.size.title'), 'menuitemcheckbox'),
      menuItem('ls-labels', t('ls.tb.labels'), t('ls.tb.labels.title'), 'menuitemcheckbox')));
  more.addEventListener('toggle', () => { if (more.open) updateTools(); });
  const lsGroup = el('div', { className: 'cv-tool-group', role: 'group', 'aria-label': 'Landscape', dataset: { lsGroup: '' }, hidden: true },   // i18n-ignore: the group's key
    el('span', { className: 'cv-tool-label', 'aria-hidden': 'true' }, t('ls.tb.group')),
    el('div', { className: 'cv-tool-row', dataset: { lsRow: '' } },
      btn('ls-plant', 'tree', t('ls.tb.plant'), t('ls.tb.plant.title')),
      btn('ls-bed', 'flower1', t('ls.tb.bed'), t('ls.tb.bed.title')),
      btn('ls-hedge', 'border-style', t('ls.tb.hedge'), t('ls.tb.hedge.title')),
      gr.menu,
      hd.menu,
      ir.menu,
      more));
  if (toolbar) {
    const exportGroup = [...toolbar.querySelectorAll('.cv-tool-group')].find((g) => g.getAttribute('aria-label') === 'Export');   // i18n-ignore: a group key
    const after = exportGroup || toolbar.firstElementChild;
    after.after(wsGroup, lsGroup);
  }

  // ---- the Plants section (left panel, top) ----
  const left = root.querySelector('.cv-left');
  const plantsSec = el('section', { className: 'cv-sec cv-ls-plants', dataset: { lsPlants: '' }, hidden: true, 'aria-labelledby': 'cv-ls-plants-h' });
  if (left) left.prepend(plantsSec, gr.section, ir.section);
  function renderPlants() {
    const idx = index();
    const all = [...idx.values()];
    const q = el('input', { type: 'search', className: 'cv-input', id: 'cv-ls-q', value: query, placeholder: t('ls.pl.search.ph'), 'data-ls-search': '', autocomplete: 'off' });
    q.addEventListener('input', () => { query = q.value; renderList(); });
    const sel = (id, label, opts, k) => {
      const s = el('select', { className: 'cv-select', id, 'data-ls-filter': k }, el('option', { value: '' }, t('ls.pl.any')), ...opts.map(([v, txt]) => el('option', { value: v }, txt)));
      s.value = filters[k] ?? '';
      s.addEventListener('change', () => { filters[k] = s.value === '' ? undefined : k === 'zone' ? Number(s.value) : s.value; renderList(); });
      return [el('label', { for: id }, label), s];
    };
    const list = el('ul', { className: 'cv-ls-list', role: 'listbox', 'aria-label': t('ls.pl.list'), 'data-ls-list': '' });
    const count = el('p', { className: 'cv-note', 'data-ls-count': '' });
    const detail = el('div', { className: 'cv-ls-detail', 'data-ls-detail': '' });
    function renderList() {
      const found = search(all, query, filters).sort((a, b) => displayName(a, lang()).localeCompare(displayName(b, lang())));
      count.textContent = t('ls.pl.count', { n: found.length, of: all.length });
      list.replaceChildren(...found.slice(0, SHOW_MAX).map((sp) => {
        const li = el('li', { role: 'option', 'aria-selected': String(sp.key === cur), dataset: { lsKey: sp.key }, tabIndex: 0, className: sp.key === cur ? 'is-cur' : '' },
          el('span', { className: 'cv-ls-name' }, displayName(sp, lang())), el('span', { className: 'cv-ls-bot' }, sp.botanical));
        const choose = () => { cur = sp.key; renderList(); renderDetail(); };
        li.addEventListener('click', choose);
        li.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); choose(); } });
        return li;
      }));
      if (found.length > SHOW_MAX) list.append(el('li', { className: 'cv-note' }, t('ls.pl.more', { n: found.length - SHOW_MAX })));
    }
    function renderDetail() {
      const sp = idx.get(cur);
      if (!sp) { detail.replaceChildren(el('p', { className: 'cv-note' }, t('ls.pl.pick'))); return; }
      const m = sp.size.mature, p = sizeOf(sp, 'plant');
      const facts = [
        [t('ls.pl.f.type'), t('ls.type.' + sp.type) + (sp.foliage ? ', ' + t('ls.fol.' + sp.foliage) : '')],
        [t('ls.pl.f.mature'), t('ls.pl.hs', { h: m.h, s: m.s })],
        [t('ls.pl.f.planting'), t('ls.pl.hs', { h: p.h, s: p.s }) + (sp.container ? ' · ' + sp.container : '')],   // i18n-ignore: a separator
        [t('ls.pl.f.spacing'), sp.spacing != null ? sp.spacing + ' m' : ''],
        [t('ls.pl.f.zone'), sp.zone ? `${sp.zone.min}–${sp.zone.max}` : ''],
        [t('ls.pl.f.light'), sp.light.map((x) => t('ls.light.' + x)).join(', ')],
        [t('ls.pl.f.water'), sp.water ? t('ls.water.' + sp.water) : ''],
        [t('ls.pl.f.notes'), sp.notes],
      ].filter(([, v]) => v);
      const own = (LS().palette || []).some((x) => x.key === sp.key);
      detail.replaceChildren(
        el('h3', { className: 'cv-h3' }, displayName(sp, lang()), ' ', el('em', {}, sp.botanical)),
        el('div', { className: 'cv-props' }, ...facts.flatMap(([k, v]) => [el('span', { className: 'k' }, k), el('span', { className: 'v' }, String(v))])),
        el('div', { className: 'cv-actions' },
          el('button', { type: 'button', className: 'btn-line btn-sm-cc', 'data-ls-use': 'plant', onclick: () => ctx.command('ls-plant') }, t('ls.pl.place')),
          own ? el('button', { type: 'button', className: 'btn-line btn-sm-cc', 'data-ls-unown': '', onclick: () => { edit(t('ls.undo.unown'), (l) => { l.palette = l.palette.filter((x) => x.key !== sp.key); }); renderPlants(); } }, t('ls.pl.unown'))
            : el('button', { type: 'button', className: 'btn-line btn-sm-cc', 'data-ls-own': '', onclick: () => { edit(t('ls.undo.own'), (l) => { l.palette = [...(l.palette || []), JSON.parse(JSON.stringify(sp))]; }); renderPlants(); } }, t('ls.pl.own'))));
    }
    const fileIn = el('input', { type: 'file', accept: '.csv,.txt,.json', className: 'visually-hidden', tabIndex: -1, 'aria-hidden': 'true', 'data-ls-csv-file': '' });
    fileIn.addEventListener('change', async () => { const f = fileIn.files?.[0]; fileIn.value = ''; if (f) await importList(f); });
    plantsSec.replaceChildren(
      el('h2', { className: 'cv-h', id: 'cv-ls-plants-h' }, t('ls.pl.head')),
      el('p', { className: 'cv-note' }, t('ls.pl.lede')),
      el('div', { className: 'cv-props' }, el('label', { for: 'cv-ls-q' }, t('ls.pl.search')), q,
        ...sel('cv-ls-type', t('ls.pl.f.type'), TYPES.map((x) => [x, t('ls.type.' + x)]), 'type'),
        ...sel('cv-ls-light', t('ls.pl.f.light'), LIGHT.map((x) => [x, t('ls.light.' + x)]), 'light'),
        ...sel('cv-ls-water', t('ls.pl.f.water'), WATER.map((x) => [x, t('ls.water.' + x)]), 'water'),
        ...sel('cv-ls-zone', t('ls.pl.f.zone'), Array.from({ length: 13 }, (_, i) => [String(i + 1), String(i + 1)]), 'zone')),
      count, list, detail,
      el('div', { className: 'cv-actions' },
        el('button', { type: 'button', className: 'btn-line btn-sm-cc', 'data-ls-import': '', onclick: () => fileIn.click() }, t('ls.pl.import')),
        el('button', { type: 'button', className: 'btn-line btn-sm-cc', 'data-ls-export': '', onclick: () => exportList() }, t('ls.pl.export'))),
      el('p', { className: 'cv-note' }, t('ls.pl.own.note', { n: (LS().palette || []).length })), fileIn);
    renderList(); renderDetail();
  }
  async function importList(file) {
    if (file.size > 16 * 1024 * 1024) { ctx.say(t('ls.pl.import.big')); return; }
    const text = await file.text();
    let rows = [], notes = [];
    try {
      if (/^\s*\{/.test(text)) { const r = readPlants(JSON.parse(text)); rows = r.library.species; notes = r.notes; }
      else { const r = plantsFromCsv(text); rows = r.species; notes = r.notes; }
    } catch (e) { ctx.say(t('ls.pl.import.bad', { why: e.message === 'not-plants' ? t('ls.pl.import.notplants') : String(e.message) })); return; }
    if (!rows.length) { ctx.say(t('ls.pl.import.none', { why: notes.map((n) => n.code).join(', ') })); return; }
    edit(t('ls.undo.import', { n: rows.length }), (l) => { l.palette = mergeLists(l.palette || [], rows); });
    ctx.say(t('ls.pl.import.done', { n: rows.length, notes: notes.length }));
    renderPlants();
  }
  function exportList() {
    const own = LS().palette || [];
    const rows = own.length ? own : search([...index().values()], query, filters);
    ctx.download(new TextEncoder().encode('﻿' + plantsToCsv(rows)), ctx.fileStem() + (own.length ? '-my-plants.csv' : '-plants.csv'), 'text/csv');   // i18n-ignore: file name endings
    ctx.say(t('ls.pl.export.done', { n: rows.length }));
  }

  // ---- the workspace ----
  function setActive(v) {
    on = !!v;
    // 0.7 PL: the select has a third choice (Power lines, powerline-ui.js): turning Landscape off leaves another workspace's choice alone
    try { if (on) localStorage.setItem(WS_KEY, 'landscape'); else if (localStorage.getItem(WS_KEY) === 'landscape' || !localStorage.getItem(WS_KEY)) localStorage.setItem(WS_KEY, 'civil'); } catch { /* private window */ }
    if (on) wsSel.value = 'landscape'; else if (wsSel.value === 'landscape') wsSel.value = 'civil';
    for (const g of toolbar?.querySelectorAll('.cv-tool-group') || []) {
      if (g.dataset.lsGroup !== undefined) g.hidden = !on && !(g.classList.contains('cv-ls-wsgroup') && root.hasAttribute('data-powerlines'));
      else if (HIDE_IN_LS.includes(g.getAttribute('aria-label'))) g.hidden = on;
    }
    plantsSec.hidden = !on; gr.section.hidden = !on; ir.section.hidden = !on;
    if (on) { renderPlants(); gr.renderSection(); ir.renderSection(); }
    if (!on && TOOLS.includes(ctx.tool())) ctx.setTool('select');
    root.toggleAttribute('data-landscape', on);
    updateTools();
    ctx.redraw();
  }
  try { if (localStorage.getItem(WS_KEY) === 'landscape') queueMicrotask(() => setActive(true)); } catch { /* private window */ }

  function updateTools() {
    for (const b of root.querySelectorAll('[data-cmd^="ls-"], [data-cmd="landscape"]')) {
      const c = b.dataset.cmd, mi = b.getAttribute('role') === 'menuitemcheckbox';
      if (TOOLS.includes(c)) b.setAttribute('aria-pressed', String(ctx.tool() === c));
      if (c === 'landscape') b.setAttribute(mi ? 'aria-checked' : 'aria-pressed', String(on));
      if (c === 'ls-size') b.setAttribute('aria-checked', String(LS().show === 'plant'));
      if (c === 'ls-labels') b.setAttribute('aria-checked', String(LS().labels !== false));
      if (c === 'ls-schedule' || c === 'ls-ifc' || c === 'ls-sheets') b.disabled = !hasPlanting();
    }
    gr.updateTools(ctx.tool()); hd.updateTools(ctx.tool()); ir.updateTools(ctx.tool());
    if (on) gr.renderSection();
  }
  const hasPlanting = () => { const l = LS(); return l.plants.length + l.beds.length + l.hedges.length + (l.hardscape || []).length + (l.irrigation?.heads.length || 0) + (l.freeform || []).length > 0; };

  function command(c) {
    switch (c) {
      case 'landscape': setActive(!on); ctx.say(t(on ? 'ls.ws.on' : 'ls.ws.off')); return true;
      case 'ls-plant': case 'ls-bed': case 'ls-hedge':
        if (!on) setActive(true);
        if (!cur || !index().has(cur)) { ctx.say(t('ls.need.species')); plantsSec.querySelector('[data-ls-search]')?.focus(); return true; }
        ctx.setTool(ctx.tool() === c ? 'select' : c);
        if (ctx.tool() === c) ctx.say(t('ls.tool.' + c.slice(3), { name: nameOf(cur) }));
        updateTools();
        return true;
      case 'ls-schedule': scheduleDialog(); return true;
      case 'ls-platform': case 'ls-berm': case 'ls-swale': case 'ls-area': case 'ls-spot': case 'ls-contour': case 'ls-slope': case 'ls-flow':
        if (!on) setActive(true);
        gr.command(c); updateTools(); return true;
      case 'ls-paving': case 'ls-path': case 'ls-wall': case 'ls-kerb': case 'ls-ramp': case 'ls-steps': case 'ls-drain':
        if (!on) setActive(true);
        hd.command(c); updateTools(); return true;
      case 'ls-head': case 'ls-lateral': case 'ls-main': case 'ls-valve': case 'ls-drip': case 'ls-poc': case 'ls-coverage': case 'ls-check':
        if (!on) setActive(true);
        ir.command(c); updateTools(); return true;
      case 'ls-ifc': exportIfc(); return true;
      case 'ls-sheets': sheetsDialog(); return true;
      case 'ls-freeform-open': if (!on) setActive(true); ff.command(c); return true;
      case 'ls-size': P().change(t('ls.undo.size'), (s) => { if (!s.landscape) s.landscape = emptyLandscape(); s.landscape.show = s.landscape.show === 'plant' ? 'mature' : 'plant'; }); ctx.say(t(LS().show === 'plant' ? 'ls.size.plant' : 'ls.size.mature')); ctx.refresh(); return true;
      case 'ls-labels': P().change(t('ls.undo.labels'), (s) => { if (!s.landscape) s.landscape = emptyLandscape(); s.landscape.labels = s.landscape.labels === false; }); ctx.refresh(); return true;
      default: return false;
    }
  }

  // ---- drawing ----
  function click(tool, w) {
    for (const x of parts) if (x.tools.includes(tool)) return x.click(tool, w);
    if (tool !== 'ls-plant') return false;   // beds and hedges collect corners like any drawn line (civilcraft.js)
    const id = P().nextId('l');
    edit(t('ls.undo.plant', { name: nameOf(cur) }), (l) => l.plants.push({ id, key: cur, x: w.x, y: w.y, z: null }));
    ctx.say(t('ls.plant.done', { name: nameOf(cur), n: LS().plants.length }));
    return true;
  }
  function finish(tool, pts) {
    for (const x of parts) if (x.tools.includes(tool)) return x.finish(tool, pts);
    const xy = pts.map((p) => ({ x: p.x, y: p.y }));
    if (tool === 'ls-bed') {
      if (xy.length < 3) { ctx.say(t('ls.bed.need3')); return false; }
      const id = P().nextId('l'), n = LS().beds.length + 1;
      edit(t('ls.undo.bed'), (l) => l.beds.push({ id, name: t('ls.bed.name', { n }), pts: xy, mix: [{ key: cur, pct: 100 }], spacing: null, pattern: 'triangular', angle: 0, seed: n }));
      const f = bedFill(find('bed', id), index(), U());
      ctx.select({ kind: 'ls-bed', id });
      ctx.say(t('ls.bed.done', { n: f.pts.length, name: nameOf(cur) }));
      return true;
    }
    if (tool === 'ls-hedge') {
      if (xy.length < 2) { ctx.say(t('ls.hedge.need2')); return false; }
      const id = P().nextId('l'), n = LS().hedges.length + 1;
      edit(t('ls.undo.hedge'), (l) => l.hedges.push({ id, name: t('ls.hedge.name', { n }), pts: xy, key: cur, spacing: null, rows: 1, rowGap: 0.4 }));
      const f = hedgeFill(find('hedge', id), index(), U());
      ctx.select({ kind: 'ls-hedge', id });
      ctx.say(t('ls.hedge.done', { n: f.pts.length, len: lenText(f.length * um()) }));
      return true;
    }
    return false;
  }

  // ---- selection ----
  const isPlanting = (sel) => !!sel && /^ls-(plant|bed|hedge)$/.test(sel.kind);
  const isMine = (sel) => isPlanting(sel) || parts.some((x) => x.isMine(sel));
  function pick(w, tol) {
    const h = pickPlanting(LS(), index(), U(), w.x, w.y, tol);
    return h ? { kind: 'ls-' + h.kind, id: h.id } : ir.pick(w, tol) || ff.pick(w, tol) || hd.pick(w, tol) || gr.pick(w, tol);
  }
  /** Grips (civilcraft.js gripAt): a plant moves whole; a bed's and a hedge's corners; the grading items' (grade-ui.js). */
  function grip(sel) {
    for (const x of parts) if (x.isMine(sel)) return x.grip(sel);
    if (!isPlanting(sel)) return null;
    const kind = sel.kind.slice(3), it = find(kind, sel.id);
    if (!it) return null;
    if (kind === 'plant') return { list: LS().plants, only: LS().plants.indexOf(it), label: t('ls.undo.move'), get: () => P().state.landscape?.plants };
    return { list: it.pts, label: t('ls.undo.corner'), get: () => find(kind, sel.id)?.pts };
  }
  function remove(sel) {
    for (const x of parts) if (x.isMine(sel)) return x.remove(sel);
    if (!isMine(sel)) return false;
    const kind = sel.kind.slice(3), item = find(kind, sel.id);
    if (!item) return false;
    const list = kind === 'plant' ? 'plants' : kind === 'bed' ? 'beds' : 'hedges';
    edit(t('ls.undo.delete'), (l) => { l[list] = l[list].filter((x) => x.id !== sel.id); });
    ctx.say(t('ls.deleted', { name: item.name || nameOf(item.key) }));
    return true;
  }
  const speciesSelect = (id, value, onPick) => {
    const all = [...index().values()].sort((a, b) => displayName(a, lang()).localeCompare(displayName(b, lang())));
    const s = el('select', { className: 'cv-select', id }, ...all.map((sp) => el('option', { value: sp.key }, `${displayName(sp, lang())} (${sp.botanical})`)));
    if (!index().has(value)) s.prepend(el('option', { value }, t('ls.missing', { key: value })));
    s.value = value;
    s.addEventListener('change', () => onPick(s.value));
    return s;
  };
  const delBtn = () => el('div', { className: 'cv-actions' }, el('button', { type: 'button', className: 'btn-line btn-sm-cc cv-danger', onclick: () => ctx.command('delete') }, el('i', { className: 'bi bi-trash3', 'aria-hidden': 'true' }), ' ', t('fl.props.delete')));
  const facts = (rows) => el('div', { className: 'cv-props', 'data-ls-facts': '' }, ...rows.flatMap(([k, v]) => [el('span', { className: 'k' }, k), el('span', { className: 'v' }, String(v))]));

  function props(sel, box, head) {
    for (const x of parts) if (x.isMine(sel)) return x.props(sel, box, head);
    if (!isMine(sel)) return false;
    const kind = sel.kind.slice(3), it = find(kind, sel.id);
    if (!it) return false;
    const idx = index();
    if (kind === 'plant') {
      const sp = idx.get(it.key), g = ctx.groundAt(it.x, it.y);
      head.textContent = t('ls.p.head');
      const z = ctx.numInput(it.z ?? '', (v) => { const n = v.trim() === '' ? null : Number(v); if (n !== null && !Number.isFinite(n)) return false; edit(t('ls.undo.z'), () => { find('plant', it.id).z = n; }); return true; }, { label: t('ls.p.z'), id: 'cv-ls-pz' });
      const lab = el('input', { type: 'text', className: 'cv-input', id: 'cv-ls-plabel', value: it.label || '', maxLength: 200, placeholder: t('ls.p.label.ph') });
      lab.addEventListener('change', () => edit(t('ls.undo.label'), () => { const p = find('plant', it.id); if (lab.value.trim()) p.label = lab.value.trim().slice(0, 200); else delete p.label; }));
      box.replaceChildren(el('div', { className: 'cv-props' },
        el('label', { for: 'cv-ls-psp' }, t('ls.p.species')), speciesSelect('cv-ls-psp', it.key, (k) => edit(t('ls.undo.species'), () => { find('plant', it.id).key = k; })),
        el('label', { for: 'cv-ls-px' }, t('ls.p.x')), ctx.numInput(fixed(it.x, 3), (v) => { const n = Number(v); if (!Number.isFinite(n)) return false; edit(t('ls.undo.move'), () => { find('plant', it.id).x = n; }); return true; }, { label: t('ls.p.x'), id: 'cv-ls-px' }),
        el('label', { for: 'cv-ls-py' }, t('ls.p.y')), ctx.numInput(fixed(it.y, 3), (v) => { const n = Number(v); if (!Number.isFinite(n)) return false; edit(t('ls.undo.move'), () => { find('plant', it.id).y = n; }); return true; }, { label: t('ls.p.y'), id: 'cv-ls-py' }),
        el('label', { for: 'cv-ls-pz' }, t('ls.p.z')), z,
        el('label', { for: 'cv-ls-plabel' }, t('ls.p.label')), lab),
      el('p', { className: 'cv-note' }, it.z == null ? (Number.isFinite(g) ? t('ls.p.ongrade', { z: fixed(g, 2) }) : t('ls.p.noground')) : t('ls.p.fixed')),
      sp ? facts([[t('ls.pl.f.mature'), t('ls.pl.hs', { h: sp.size.mature.h, s: sp.size.mature.s })], [t('ls.pl.f.planting'), t('ls.pl.hs', { h: sizeOf(sp, 'plant').h, s: sizeOf(sp, 'plant').s })]]) : el('p', { className: 'cv-report is-error' }, t('ls.missing', { key: it.key })),
      delBtn());
      return true;
    }
    if (kind === 'bed') {
      const f = bedFill(it, idx, U());
      head.textContent = t('ls.b.head');
      const nm = el('input', { type: 'text', className: 'cv-input', id: 'cv-ls-bname', value: it.name, maxLength: 120 });
      nm.addEventListener('change', () => edit(t('ls.undo.rename'), () => { find('bed', it.id).name = nm.value.trim().slice(0, 120) || it.name; }));
      const mixRows = it.mix.map((m, i) => el('tr', { dataset: { lsMix: String(i) } },
        el('td', {}, speciesSelect('cv-ls-mix-' + i, m.key, (k) => edit(t('ls.undo.mix'), () => { find('bed', it.id).mix[i].key = k; }))),
        el('td', {}, ctx.numInput(m.pct, (v) => { const n = Number(v); if (!(n > 0 && n <= 100)) return false; edit(t('ls.undo.mix'), () => { find('bed', it.id).mix[i].pct = n; }); return true; }, { label: t('ls.b.pct'), id: 'cv-ls-pct-' + i, width: '4.5rem', calc: false })),
        el('td', { className: 'num' }, String(f.counts[m.key] || 0)),
        el('td', {}, it.mix.length > 1 ? el('button', { type: 'button', className: 'cv-linkbtn', 'data-ls-mix-remove': String(i), 'aria-label': t('ls.b.remove'), onclick: () => edit(t('ls.undo.mix'), () => { find('bed', it.id).mix.splice(i, 1); }) }, el('i', { className: 'bi bi-x-lg', 'aria-hidden': 'true' })) : '')));
      const pat = el('select', { className: 'cv-select', id: 'cv-ls-bpat' }, el('option', { value: 'triangular' }, t('ls.b.tri')), el('option', { value: 'square' }, t('ls.b.square')));
      pat.value = it.pattern;
      pat.addEventListener('change', () => edit(t('ls.undo.pattern'), () => { find('bed', it.id).pattern = pat.value; }));
      box.replaceChildren(el('div', { className: 'cv-props' },
        el('label', { for: 'cv-ls-bname' }, t('ls.b.name')), nm,
        el('label', { for: 'cv-ls-bsp' }, t('ls.b.spacing')), ctx.numInput(it.spacing ?? '', (v) => { const n = v.trim() === '' ? null : Number(v); if (n !== null && !(n >= 0.05 && n <= 50)) return false; edit(t('ls.undo.spacing'), () => { find('bed', it.id).spacing = n; }); return true; }, { label: t('ls.b.spacing'), id: 'cv-ls-bsp', calc: false }),
        el('label', { for: 'cv-ls-bpat' }, t('ls.b.pattern')), pat,
        el('label', { for: 'cv-ls-bang' }, t('ls.b.angle')), ctx.numInput(it.angle, (v) => { const n = Number(v); if (!Number.isFinite(n)) return false; edit(t('ls.undo.angle'), () => { find('bed', it.id).angle = ((n % 360) + 360) % 360; }); return true; }, { label: t('ls.b.angle'), id: 'cv-ls-bang', calc: false })),
      el('p', { className: 'cv-note' }, it.spacing ? t('ls.b.spacing.own') : t('ls.b.spacing.from', { s: fixed(bedSpacingM(it, idx), 2) })),
      el('table', { className: 'cv-groups cv-ls-mix', 'data-ls-mix': '' }, el('caption', { className: 'cv-note' }, t('ls.b.mix')),
        el('thead', {}, el('tr', {}, el('th', { scope: 'col' }, t('ls.p.species')), el('th', { scope: 'col' }, t('ls.b.pct')), el('th', { scope: 'col', className: 'num' }, t('ls.b.qty')), el('th', {}))),
        el('tbody', {}, ...mixRows)),
      el('div', { className: 'cv-actions' },
        el('button', { type: 'button', className: 'btn-line btn-sm-cc', 'data-ls-mix-add': '', disabled: it.mix.length >= 20, onclick: () => edit(t('ls.undo.mix'), () => { const b = find('bed', it.id); b.mix.push({ key: cur && !b.mix.some((m) => m.key === cur) ? cur : b.mix[0].key, pct: 20 }); }) }, t('ls.b.add')),
        el('button', { type: 'button', className: 'btn-line btn-sm-cc', 'data-ls-reseed': '', onclick: () => edit(t('ls.undo.reseed'), () => { find('bed', it.id).seed = (it.seed + 1) >>> 0; }) }, t('ls.b.reseed'))),
      facts([[t('ls.b.area'), U() === 'm' ? t('ls.area.m', { a: fixed(f.area, 1) }) : t('ls.area.ft', { a: fixed(f.area, 0) })], [t('ls.b.count'), String(f.pts.length)], [t('ls.b.spacing.used'), lenText(f.spacing * um())]]),
      f.capped ? el('p', { className: 'cv-report is-error' }, t('ls.b.capped')) : '',
      delBtn());
      return true;
    }
    const f = hedgeFill(it, idx, U());
    head.textContent = t('ls.h.head');
    const nm = el('input', { type: 'text', className: 'cv-input', id: 'cv-ls-hname', value: it.name, maxLength: 120 });
    nm.addEventListener('change', () => edit(t('ls.undo.rename'), () => { find('hedge', it.id).name = nm.value.trim().slice(0, 120) || it.name; }));
    const rows = el('select', { className: 'cv-select', id: 'cv-ls-hrows' }, el('option', { value: '1' }, t('ls.h.rows1')), el('option', { value: '2' }, t('ls.h.rows2')));
    rows.value = String(it.rows);
    rows.addEventListener('change', () => edit(t('ls.undo.rows'), () => { find('hedge', it.id).rows = rows.value === '2' ? 2 : 1; }));
    box.replaceChildren(el('div', { className: 'cv-props' },
      el('label', { for: 'cv-ls-hname' }, t('ls.b.name')), nm,
      el('label', { for: 'cv-ls-hsp' }, t('ls.p.species')), speciesSelect('cv-ls-hsp', it.key, (k) => edit(t('ls.undo.species'), () => { find('hedge', it.id).key = k; })),
      el('label', { for: 'cv-ls-hspc' }, t('ls.b.spacing')), ctx.numInput(it.spacing ?? '', (v) => { const n = v.trim() === '' ? null : Number(v); if (n !== null && !(n >= 0.05 && n <= 50)) return false; edit(t('ls.undo.spacing'), () => { find('hedge', it.id).spacing = n; }); return true; }, { label: t('ls.b.spacing'), id: 'cv-ls-hspc', calc: false }),
      el('label', { for: 'cv-ls-hrows' }, t('ls.h.rows')), rows,
      el('label', { for: 'cv-ls-hgap' }, t('ls.h.gap')), ctx.numInput(it.rowGap, (v) => { const n = Number(v); if (!(n > 0 && n <= 10)) return false; edit(t('ls.undo.rows'), () => { find('hedge', it.id).rowGap = n; }); return true; }, { label: t('ls.h.gap'), id: 'cv-ls-hgap', calc: false })),
    facts([[t('ls.h.length'), lenText(f.length * um())], [t('ls.b.count'), String(f.pts.length)], [t('ls.b.spacing.used'), lenText(f.spacing * um())]]),
    delBtn());
    return true;
  }

  // ---- the schedule and the IFC ----
  function scheduleDialog() {
    const sch = schedule(LS(), index(), U(), lang());
    const rows = scheduleRows(sch);
    const id = 'cv-ls-sch';
    const dlg = el('dialog', { className: 'cv-dialog cv-ls-schdlg', 'aria-labelledby': id + '-h', 'data-ls-schedule': '' },
      el('div', { className: 'cv-dlg' },
      el('div', { className: 'cv-dlg-head' }, el('h2', { className: 'cv-h', id: id + '-h' }, t('ls.sch.head'))),
      el('div', { className: 'cv-dlg-body' },
      el('p', { className: 'cv-note' }, t('ls.sch.lede', { n: sch.total, k: sch.rows.length })),
      el('div', { className: 'cv-ls-schwrap' }, el('table', { className: 'cv-groups', 'data-ls-sch-table': '' },
        el('thead', {}, el('tr', {}, ...rows[0].map((h) => el('th', { scope: 'col' }, h)))),
        el('tbody', {}, ...rows.slice(1).map((r) => el('tr', {}, ...r.map((c, i) => el('td', { className: i >= 3 && i !== 5 ? 'num' : '' }, String(c)))))),
        el('tfoot', {}, el('tr', {}, el('th', { scope: 'row', colSpan: 6 }, t('ls.sch.total')), el('td', { className: 'num' }, String(sch.total)))))),
      sch.missing.length ? el('p', { className: 'cv-report is-error' }, t('ls.sch.missing', { keys: sch.missing.join(', ') })) : ''),
      el('div', { className: 'cv-dlg-foot' },
        el('button', { type: 'button', className: 'btn-line btn-sm-cc', 'data-ls-sch-csv': '', onclick: () => { ctx.download(new TextEncoder().encode('﻿' + scheduleCsv(sch)), ctx.fileStem() + '-plant-schedule.csv', 'text/csv'); ctx.say(t('ls.sch.saved')); } }, t('ls.sch.csv')),   // i18n-ignore: a file name ending
        el('button', { type: 'button', className: 'btn-line btn-sm-cc', 'data-ls-sch-xlsx': '', onclick: async () => { const { writeXlsx } = await import('./xlsx.js'); const bytes = await writeXlsx([{ name: t('ls.sch.sheet'), cols: [28, 24, 12, 12, 12, 14, 10], rows: rows.map((r, i) => (i ? r : r.map((h) => ({ v: h, s: 'head' })))), freeze: 1 }], { title: t('ls.sch.head') }); ctx.download(bytes, ctx.fileStem() + '-plant-schedule.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'); ctx.say(t('ls.sch.saved')); } }, t('ls.sch.xlsx')),   // i18n-ignore: a file name ending
        el('button', { type: 'button', className: 'btn-line btn-sm-cc', 'data-ls-sch-qty': '', onclick: () => { ctx.download(new TextEncoder().encode(JSON.stringify(withHard(scheduleQuantities(sch, { project: P().state.name })), null, 2)), ctx.fileStem() + '-plants.quantities.json', 'application/json'); ctx.say(t('ls.sch.qty.saved')); } }, t('ls.sch.qty')),   // i18n-ignore: a file name ending
        el('button', { type: 'button', className: 'btn-plot btn-sm-cc', 'data-ls-sch-close': '', onclick: () => dlg.close() }, t('ls.close')))));
    dlg.addEventListener('close', () => { dlg.remove(); ctx.refocus(); });
    root.append(dlg);
    dlg.showModal();
  }
  /** LD.6: planting / grading / irrigation plans and the details sheet, one PDF through CivilCraft's plot code. */
  function sheetFmt() {
    const ft = U() !== 'm';
    return { len: (m) => (ft ? fixed(m / 0.3048, 1) + ' ft' : fixed(m, 1) + ' m'), flow: (l) => (ft ? fixed(l / LMIN_PER_GPM, 1) + ' gpm' : fixed(l, 1) + ' L/min'),   // i18n-ignore: units
      press: (k) => (ft ? fixed(k / KPA_PER_PSI, 1) + ' psi' : fixed(k, 0) + ' kPa'), lvl: (v) => fixed(v, 2), thick: (v) => (ft ? fixed(v * 12, 1) + ' in' : fixed(v * 1000, 0) + ' mm') };   // i18n-ignore: units
  }
  function sheetsDialog() {
    const ext = ctx.extents();
    if (!ext) { ctx.say(t('cv.plot.none')); return; }
    const kinds = SHEET_KINDS.map((k) => { const c = el('input', { type: 'checkbox', id: 'cv-ls-sh-' + k, checked: true, dataset: { lsSheet: k } }); return [k, c, el('label', { for: c.id, className: 'cv-check' }, c, ' ', t('ls.sh.kind.' + k))]; });
    const paper = el('select', { className: 'cv-select', id: 'cv-ls-sh-paper', 'data-ls-sh-paper': '' }, ...PAPERS.map((p) => el('option', { value: p.key }, p.name)));
    paper.value = U() === 'm' ? 'a3' : 'tabloid';
    const scale = el('select', { className: 'cv-select', id: 'cv-ls-sh-scale', 'data-ls-sh-scale': '' });
    const fill = () => { const s = scalesFor(U()); const fit = fitScale(U(), { ...ext, maxX: ext.maxX + (ext.maxX - ext.minX) * 0.35 }, paperBy(paper.value)); scale.replaceChildren(...s.map((x) => el('option', { value: x.label }, x.label))); scale.value = fit.label; };
    paper.addEventListener('change', fill); fill();
    const ink = el('select', { className: 'cv-select', id: 'cv-ls-sh-ink' }, el('option', { value: 'color' }, t('ls.sh.color')), el('option', { value: 'mono' }, t('ls.sh.mono')));
    const dlg = el('dialog', { className: 'cv-dialog', 'aria-labelledby': 'cv-ls-sh-h', 'data-ls-sheets': '' },
      el('div', { className: 'cv-dlg' },
        el('div', { className: 'cv-dlg-head' }, el('h2', { className: 'cv-h', id: 'cv-ls-sh-h' }, t('ls.sh.head'))),
        el('div', { className: 'cv-dlg-body' },
          el('div', { className: 'cv-checks' }, ...kinds.map((x) => x[2])),
          el('div', { className: 'cv-props' }, el('label', { for: paper.id }, t('ls.sh.paper')), paper, el('label', { for: scale.id }, t('ls.sh.scale')), scale, el('label', { for: ink.id }, t('ls.sh.ink')), ink),
          el('p', { className: 'cv-note' }, t('ls.sh.note'))),
        el('div', { className: 'cv-dlg-foot' },
          el('button', { type: 'button', className: 'btn-line btn-sm-cc', onclick: () => dlg.close() }, t('ls.close')),
          el('button', { type: 'button', className: 'btn-plot btn-sm-cc', 'data-ls-sh-go': '', onclick: async () => {
            const pick = kinds.filter((x) => x[1].checked).map((x) => x[0]);
            if (!pick.length) { ctx.say(t('ls.sh.pick')); return; }
            const sc = scalesFor(U()).find((x) => x.label === scale.value);
            const sheets = landscapeSheets(ctx.buildScene(sc.mmPerUnit), { kinds: pick, extents: ext, paper: paper.value, landscape: true, scale: sc, units: U(), title: P().state.name || ctx.fileStem(), fmt: sheetFmt(),
              plants: { rows: schedule(LS(), index(), U(), lang()).rows, index: index() }, irrigation: ir.result(), details: {
                walls: (LS().hardscape || []).filter((h) => h.kind === 'wall').map((w) => ({ wall: w, layout: wallLayout(w, ctx.surface(), U()) })),
                pavings: (LS().hardscape || []).filter((h) => h.kind === 'paving' || h.kind === 'path'),
                steps: (LS().hardscape || []).filter((h) => h.kind === 'steps').map((s) => ({ steps: s, layout: stepsLayout(s, ctx.surface(), U()) })) } });
            const { bytes, report } = await toPdfPages(sheets, { mono: ink.value === 'mono', title: P().state.name });
            ctx.download(bytes, ctx.fileStem() + '-landscape-sheets.pdf', 'application/pdf');   // i18n-ignore: a file name ending
            ctx.say(t('ls.sh.done', { n: sheets.length, missing: report.missing }));
            dlg.close();
          } }, t('ls.sh.go')))));
    dlg.addEventListener('close', () => { dlg.remove(); ctx.refocus(); });
    root.append(dlg);
    dlg.showModal();
  }
  /** The plant counts plus the hardscape's areas, lengths and step counts, in one quantities file. */
  function withHard(q) { return { ...q, items: [...q.items, ...hd.quantities(), ...ir.quantities()].slice(0, 500) }; }
  function exportIfc() {
    const els = [...plantingElements(LS(), index(), U(), { zAt: ctx.groundAt, lang: lang() }), ...hd.elements(), ...ff.elements()];
    if (!els.length) { ctx.say(t('ls.ifc.none')); return; }
    const out = writeLandscapeIfc({ name: P().state.name || ctx.fileStem(), units: U(), elements: els }, { seed: P().state.name || 'site' });
    ctx.download(new TextEncoder().encode(out.text), ctx.fileStem() + '-landscape.ifc', 'application/x-step');   // i18n-ignore: a file name ending
    ctx.say(t('ls.ifc.done', { n: out.counts.elements, k: out.counts.types }));
  }

  // ---- plan and overlay ----
  function sceneItems(unitPerMm) {
    const l = P().state.landscape;
    if (!l) return [];
    const plantsOut = !seed.length && !(l.palette || []).length ? [] : plantItems(l, index(), U(), { unitPerMm, lang: lang() });
    return [...gr.sceneItems(unitPerMm), ...hd.sceneItems(unitPerMm), ...ff.sceneItems(unitPerMm), ...plantsOut, ...ir.sceneItems(unitPerMm)];
  }
  function overlay(c2d, toScreen, C, sel) {
    const tool = ctx.tool(), cu = ctx.cursor?.();
    gr.overlay(c2d, toScreen, C, sel); hd.overlay(c2d, toScreen, C, sel); ir.overlay(c2d, toScreen, C, sel); ff.overlay(c2d, toScreen, C, sel);
    const gp = ctx.tool() === 'select' ? grip(sel) : null;   // the grips civilcraft.js lets you drag
    if (gp) {
      c2d.save(); c2d.fillStyle = C.bg; c2d.strokeStyle = C.action; c2d.lineWidth = 1.5;
      for (const [i, p] of gp.list.entries()) { if (gp.only >= 0 && i !== gp.only) continue; const q = toScreen(p.x, p.y); c2d.fillRect(q.x - 4.5, q.y - 4.5, 9, 9); c2d.strokeRect(q.x - 4.5, q.y - 4.5, 9, 9); }
      c2d.restore();
    }
    c2d.save();
    if (tool === 'ls-plant' && cu && index().has(cur)) {   // the plant's spread under the pointer
      const sp = index().get(cur), r = sizeOf(sp, LS().show || 'mature').s / 2 / um();
      const a = toScreen(cu.x, cu.y), b = toScreen(cu.x + r, cu.y);
      c2d.strokeStyle = C.green || C.action; c2d.setLineDash([4, 3]); c2d.lineWidth = 1.5;
      c2d.beginPath(); c2d.arc(a.x, a.y, Math.max(2, Math.abs(b.x - a.x)), 0, 2 * Math.PI); c2d.stroke();
    }
    if (isMine(sel)) {
      const it = find(sel.kind.slice(3), sel.id);
      c2d.strokeStyle = C.action; c2d.lineWidth = 2.5; c2d.setLineDash([]);
      if (it && sel.kind === 'ls-plant') {
        const sp = index().get(it.key), r = sp ? sizeOf(sp, LS().show || 'mature').s / 2 / um() : 1;
        const a = toScreen(it.x, it.y), b = toScreen(it.x + r, it.y);
        c2d.beginPath(); c2d.arc(a.x, a.y, Math.max(4, Math.abs(b.x - a.x)), 0, 2 * Math.PI); c2d.stroke();
      } else if (it) {
        c2d.beginPath();
        it.pts.forEach((p, i) => { const q = toScreen(p.x, p.y); i ? c2d.lineTo(q.x, q.y) : c2d.moveTo(q.x, q.y); });
        if (sel.kind === 'ls-bed') { c2d.closePath(); c2d.globalAlpha = 0.12; c2d.fillStyle = C.action; c2d.fill(); c2d.globalAlpha = 1; }
        c2d.stroke();
      }
    }
    c2d.restore();
  }

  return {
    active: () => on, setActive, command, ownsTool: (tl) => TOOLS.includes(tl), click, finish, closedTool: (tl) => tl === 'ls-bed' || gr.closed.has(tl) || hd.closed.has(tl),
    hints: { 'ls-plant': 'ls.hint.plant', 'ls-bed': 'ls.hint.bed', 'ls-hedge': 'ls.hint.hedge', ...gr.hints, ...hd.hints, ...ir.hints, ...ff.hints },
    isMine, props, remove, pick, grip, grade: gr, hard: hd, irrigation: ir, seedSpecies: () => seed, sceneItems, overlay, updateTools, ready, index,
    schedule: () => schedule(LS(), index(), U(), lang()), get current() { return cur; }, set current(k) { cur = k; if (on) renderPlants(); },
    inside,
  };
}
