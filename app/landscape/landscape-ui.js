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

import { readPlants, plantsFromCsv, plantsToCsv, search, displayName, sizeOf, TYPES, LIGHT, WATER, mergeLists, supplyLabel } from './plants.js';
import { loadPlants, loadDefaultCollection } from './plants-live.js';   // 0.8 LD.1
import { splitMenus } from '../split-menu.js';
import { createToolPanels } from './tool-panels.js';
import { emptyLandscape, speciesIndex, bedFill, hedgeFill, schedule, supplyWords, scheduleRows, scheduleCsv, scheduleQuantities, sceneItems as plantItems,
  pickPlanting, unitM, bedSpacingM, inside, useSpeciesIndex, spacingStale, listSpacingM, usedSpacingM, dropSpacing } from './planting.js';
import { writeLandscapeIfc, plantingElements } from './ifc-landscape.js';
import { createGradeUi } from './grade-ui.js';
import { createHardUi } from './hard-ui.js';
import { createIrrUi } from './irr-ui.js';
import { createFfUi } from './ff-ui.js';
import { createPlantTable } from './plant-table-ui.js';   // 0.8 LA.6
import { createAreaUi } from './area-ui.js';   // 0.8 LA.5
import { createStackUi } from './stack-ui.js';   // 0.8 LA.4
import { createLinkUi, LIST_OF } from './link-ui.js';   // 0.8 LA.2
import { cleanHardscape } from './hardscape.js';
import { cleanAreas } from './planted.js';
import { cleanGrading } from './grade.js';
import { createWsUi } from './ws-ui.js';   // 0.8 LA.8
import { createGraphicsUi } from './graphics-ui.js';   // 0.8 LA.7
import { createSectionUi } from './section-ui.js';   // 0.8 LA.9
import { wsRows } from './ws-sources.js';
import { cutFillBy } from './stack.js';
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
  const pa = createAreaUi(ctx, { edit: (label, fn) => edit(label, fn), LS: () => LS(), U: () => U(), index: () => index(), current: () => cur,   // 0.8 LA.5
    speciesSelect: (...x) => speciesSelect(...x), variantPick: (id, m, set) => { const sp = index().get(m.key); return pt.hasVariants(sp) ? [pt.variantSelect(id, sp, m.cv, m.sup, set, supLabel)] : []; } });
  const st = createStackUi(ctx, { edit: (label, fn) => edit(label, fn), LS: () => LS(), U: () => U() });   // 0.8 LA.4
  /** LA.2: make an object of `kind` on a line's points, linked to it (one undo step); returns the selection. */
  const makers = { make(kind, pts, link) {
    const id = P().nextId('l'), list = LIST_OF[kind];
    if (list === 'hardscape') {
      const n = (LS().hardscape || []).filter((h) => h.kind === kind).length + 1, name = t('ls.h.name.' + kind, { n });
      const rec = cleanHardscape([{ id, kind, name, pts: kind === 'steps' ? [pts[0], pts[pts.length - 1]] : pts, ...(kind === 'paving' ? { falls: { mode: 'none' } } : {}), link }], U())[0];
      if (!rec) return null;
      edit(t('ls.gr.undo.draw', { name }), (l) => { l.hardscape = [...(l.hardscape || []), rec]; });
      return { kind: 'ls-hard', id };
    }
    if (list === 'areas') {
      const k = kind.slice(3), n = (LS().areas || []).filter((a) => a.kind === k).length + 1, name = t('ls.a.name.' + k, { n });
      const rec = cleanAreas([{ id, kind: k, name, pts, mix: k !== 'lawn' && cur && index().has(cur) ? [{ key: cur, pct: 100 }] : [], seed: n, link }], U())[0];
      if (!rec) return null;
      edit(t('ls.gr.undo.draw', { name }), (l) => { l.areas = [...(l.areas || []), rec]; });
      return { kind: 'ls-pa', id };
    }
    if (list === 'grading') {
      const n = (LS().grading || []).filter((g) => g.kind === kind).length + 1, name = t('ls.gr.name.' + kind, { n });
      const rec = cleanGrading([{ id, kind, name, pts, link }], U())[0];
      if (!rec) return null;
      edit(t('ls.gr.undo.draw', { name }), (l) => { l.grading = [...(l.grading || []), rec]; });
      return { kind: 'ls-grade', id };
    }
    if (!cur || !index().has(cur)) { ctx.say(t('ls.need.species')); return null; }
    if (list === 'beds') { const n = LS().beds.length + 1; edit(t('ls.undo.bed'), (l) => l.beds.push({ id, name: t('ls.bed.name', { n }), pts, mix: [{ key: cur, pct: 100 }], spacing: null, pattern: 'triangular', angle: 0, seed: n, link })); return { kind: 'ls-bed', id }; }
    if (list === 'hedges') { const n = LS().hedges.length + 1; edit(t('ls.undo.hedge'), (l) => l.hedges.push({ id, name: t('ls.hedge.name', { n }), pts, key: cur, spacing: null, rows: 1, rowGap: 0.4, link })); return { kind: 'ls-hedge', id }; }
    return null;
  } };
  const lk = createLinkUi(ctx, { edit: (label, fn) => edit(label, fn), LS: () => LS(), U: () => U(), makers });   // 0.8 LA.2
  /** LA.4/LA.8: each modifier's cut and fill (the Ground modifiers dialog's numbers), for worksheets. */
  const modCut = () => { const m = st.modifiers().filter((x) => x.region); const cf = cutFillBy(ctx.existing?.() || null, P().graded().surface || null, m.map((x) => ({ id: String(x.id), pts: x.region }))); return m.map((x) => ({ name: x.name, kind: x.kind, cut: cf.by[String(x.id)]?.cut || 0, fill: cf.by[String(x.id)]?.fill || 0 })); };
  const ws = createWsUi(ctx, { edit: (label, fn) => edit(label, fn), LS: () => LS(), rows: (source) => wsRows(source, { ls: LS(), index: index(), units: U(), surface: ctx.surface(), lang: lang(),
    quantities: () => [...hd.quantities(), ...pa.quantities(), ...ir.quantities()], modifiers: modCut }) });   // 0.8 LA.8
  const gx = createGraphicsUi(ctx, { edit: (label, fn) => edit(label, fn), LS: () => LS(), index: () => index() });   // 0.8 LA.7
  let forcedLevel = null;   // LA.7: a sheet's own plant detail level while its scene is built
  const sec = createSectionUi(ctx, { edit: (label, fn) => edit(label, fn), LS: () => LS(), U: () => U(), index: () => index(), makeSheets: (...x) => makeSheets(...x) });   // 0.8 LA.9
  st.menu.querySelector('.cv-menu-list')?.append(el('button', { type: 'button', role: 'menuitemcheckbox', dataset: { cmd: 'ls-section' }, title: t('ls.sec.tool.title') }, t('ls.sec.tool')));
  const TOOLS = [...PLANT_TOOLS, ...gr.tools, ...hd.tools, ...ir.tools, ...ff.tools, ...pa.tools, ...st.tools, ...lk.tools, ...sec.tools];
  const parts = [gr, hd, ir, ff, pa, st, sec];
  const pt = createPlantTable(ctx, { edit: (label, fn) => edit(label, fn), LS: () => LS(), index: () => index(), lang: () => lang(), current: () => cur, importList: (f) => importList(f) });   // 0.8 LA.6
  const supLabel = (s) => supplyLabel(s, supplyWords());
  /** LA.6: the cultivar + supplied-size picker for a placement (shown only when the record has them). */
  const variantRow = (id, key, o, set) => { const sp = index().get(key); return pt.hasVariants(sp) ? [el('label', { for: id }, t('ls.v.label')), pt.variantSelect(id, sp, o.cv, o.sup, (cv, sup) => edit(t('ls.undo.variant'), () => set(cv, sup)), supLabel)] : []; };
  const setVar = (o, cv, sup) => { if (cv) o.cv = cv; else delete o.cv; if (sup) o.sup = sup; else delete o.sup; };

  // ---- the seed list (loaded once, beside this module) ----
  let from = { source: '', collection: null };
  const ready = (async () => {
    try {
      const r = await fetch(new URL('./plants-seed.json', import.meta.url));
      seed = readPlants(await r.json()).library.species;
    } catch (e) { seed = []; ctx.say(t('ls.seed.failed', { why: String(e.message || e) })); }
    idxCache.key = '';
    if (on) { renderPlants(); ctx.refresh(); }
    // 0.8 LD.1: then the Library's plants over the bundled list, live; the bundled list stands if the Library is empty or unreachable
    try {
      const live = await loadPlants({ seed, app: 'civilcraft' });
      if (live.source === 'library') { seed = live.species; idxCache.key = ''; }
      from = { source: live.source, collection: live.collection ? await loadDefaultCollection('civilcraft') : null };   // where the plants came from, said in the panel
      if (live.source === 'library' && on) { renderPlants(); ctx.refresh(); } else if (on) renderPlants();
    } catch (e) { /* the bundled list stands */ }
  })();
  useSpeciesIndex(() => (seed.length ? index() : null));   // 0.7.1: project.js toJSON keeps each bed's and hedge's spacing as filled
  /** 0.7.1: "Spacing from an older plant list" + Update (one undo step) for a bed or hedge filled from an older list. */
  function staleNote(kind, it, idx) {
    if (!spacingStale(it, idx)) return '';
    return el('div', { className: 'cv-report', 'data-ls-spacing-old': it.id }, el('p', {}, t('ls.b.spacing.old', { s: fixed(usedSpacingM(it, idx), 2), n: fixed(listSpacingM(it, idx), 2) })),
      el('button', { type: 'button', className: 'btn-line btn-sm-cc', 'data-ls-spacing-update': it.id, onclick: () => { edit(t('ls.undo.respace'), () => dropSpacing(find(kind, it.id))); ctx.refresh(); } }, t('ls.b.spacing.update')));
  }
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
      menuItem('ls-fromline', t('ls.tb.fromline'), t('ls.tb.fromline.title'), 'menuitemcheckbox'),   // 0.8 LA.2 (in More: the toolbar stays one row at 1440 px)
      menuItem('ls-schedule', t('ls.tb.schedule'), t('ls.tb.schedule.title')),
      menuItem('ls-plant-table', t('ls.tb.ptable'), t('ls.tb.ptable.title')),
      menuItem('ls-worksheets', t('ls.tb.ws'), t('ls.tb.ws.title')),
      menuItem('ls-graphics', t('ls.tb.gx'), t('ls.tb.gx.title')),
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
      pa.menu,
      st.menu,
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
  const tp = createToolPanels(ctx, { LS: () => LS() });   // Hardscape, Areas and Levels have a section of their own too
  if (left) left.prepend(plantsSec, ...tp.sections, gr.section, ir.section);
  plantsSec.dataset.afId = 'plants'; gr.section.dataset.afId = 'checks'; ir.section.dataset.afId = 'irr';
  // Auto-focus panel (Settings › Global): while Landscape is on, a command opens the section it works with and the others close
  // (the engine lives in the shell's app-settings.js, which can load after this module: asked for when first needed, and once the page has loaded)
  let afMade = null;
  left?.setAttribute('data-af-skip', '');   // this panel registers itself below (2026-11-09: always, not only with Landscape on)
  // the toolbox (the layouts' tool list) follows the section in focus, and the section follows the toolbox group: ids by workspace-civilcraft.js
  const TBX_OF = { plants: 'landscape-tools', hard: 'landscape-hardscape', areas: 'landscape-planted-areas', levels: 'landscape-levels', checks: 'landscape-grade', irr: 'landscape-irrigation' };
  const LEFT_OF = Object.fromEntries(Object.entries(TBX_OF).map(([k, v]) => [v, k]));
  let tbxLinked = false;
  const tbxLink = () => { const tb = window.ccAutoFocus?.get('tbx-civilcraft'); if (tb && !tbxLinked) { tbxLinked = true; tb.setOnOpen((g) => { if (on && LEFT_OF[g]) afMade?.reveal(LEFT_OF[g], true); }); } return tb; };
  const afGet = () => { tbxLink(); return afMade || (afMade = left && window.ccAutoFocus ? window.ccAutoFocus.register({ id: 'civil-left', panel: left, mode: 'sections', unit: 'section.cv-sec', heading: 'h2.cv-h', defaultId: 'plants', onOpen: (id) => { if (TBX_OF[id]) tbxLink()?.reveal(TBX_OF[id], true); } }) : null); };
  const af = { refresh: () => afGet()?.refresh(), reveal: (id) => afGet()?.reveal(id) };
  window.addEventListener('load', () => { af.refresh(); splitMenus(root); });
  splitMenus(root);   // the tiles that hold several tools: the icon runs the current one, the edge opens the menu
  window.addEventListener('cc-section-drawn', () => af?.refresh());   // Grading checks and Irrigation draw themselves again
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
        [t('ls.pl.f.density'), sp.density ? t('ls.pl.density', { d: sp.density }) : ''],   // LA.6
        [t('ls.pl.f.supplies'), (sp.supplies || []).map(supLabel).join('; ')],
        [t('ls.pl.f.cultivars'), (sp.cultivars || []).map((c) => c.name).join(', ')],
        [t('ls.pl.f.spec'), sp.spec || ''],
      ].filter(([, v]) => v);
      const own = (LS().palette || []).some((x) => x.key === sp.key);
      detail.replaceChildren(
        el('h3', { className: 'cv-h3' }, displayName(sp, lang()), ' ', el('em', {}, sp.botanical)),
        el('div', { className: 'cv-props' }, ...facts.flatMap(([k, v]) => [el('span', { className: 'k' }, k), el('span', { className: 'v' }, String(v))])),
        el('div', { className: 'cv-actions' },
          el('button', { type: 'button', className: 'btn-line btn-sm-cc', 'data-ls-use': 'plant', onclick: () => ctx.command('ls-plant') }, t('ls.pl.place')),
          ...gx.recordButtons(sp),   // 0.8 LA.7: the record's own symbol and 3D model
          own ? el('button', { type: 'button', className: 'btn-line btn-sm-cc', 'data-ls-unown': '', onclick: () => { edit(t('ls.undo.unown'), (l) => { l.palette = l.palette.filter((x) => x.key !== sp.key); }); renderPlants(); } }, t('ls.pl.unown'))
            : el('button', { type: 'button', className: 'btn-line btn-sm-cc', 'data-ls-own': '', onclick: () => { edit(t('ls.undo.own'), (l) => { l.palette = [...(l.palette || []), JSON.parse(JSON.stringify(sp))]; }); renderPlants(); } }, t('ls.pl.own'))));
    }
    const fileIn = el('input', { type: 'file', accept: '.csv,.txt,.json', className: 'visually-hidden', tabIndex: -1, 'aria-hidden': 'true', 'data-ls-csv-file': '' });
    fileIn.addEventListener('change', async () => { const f = fileIn.files?.[0]; fileIn.value = ''; if (f) await importList(f); });
    plantsSec.replaceChildren(
      el('h2', { className: 'cv-h', id: 'cv-ls-plants-h' }, t('ls.pl.head')),
      el('p', { className: 'cv-note' }, t('ls.pl.lede')),
      el('p', { className: 'cv-note', 'data-ls-from': '' }, fromText()),
      el('div', { className: 'cv-props' }, el('label', { for: 'cv-ls-q' }, t('ls.pl.search')), q,
        ...sel('cv-ls-type', t('ls.pl.f.type'), TYPES.map((x) => [x, t('ls.type.' + x)]), 'type'),
        ...sel('cv-ls-light', t('ls.pl.f.light'), LIGHT.map((x) => [x, t('ls.light.' + x)]), 'light'),
        ...sel('cv-ls-water', t('ls.pl.f.water'), WATER.map((x) => [x, t('ls.water.' + x)]), 'water'),
        ...sel('cv-ls-zone', t('ls.pl.f.zone'), Array.from({ length: 13 }, (_, i) => [String(i + 1), String(i + 1)]), 'zone')),
      count, list, detail,
      el('div', { className: 'cv-actions' },
        el('button', { type: 'button', className: 'btn-line btn-sm-cc', 'data-ls-import': '', onclick: () => fileIn.click() }, t('ls.pl.import')),
        el('button', { type: 'button', className: 'btn-line btn-sm-cc', 'data-ls-export': '', onclick: () => exportList() }, t('ls.pl.export')),
        el('button', { type: 'button', className: 'btn-line btn-sm-cc', 'data-ls-ptable': '', onclick: () => pt.open() }, t('ls.tb.ptable'))),
      el('p', { className: 'cv-note' }, t('ls.pl.own.note', { n: (LS().palette || []).length })), fileIn);
    renderList(); renderDetail();
    af?.refresh();
  }
  /** Where the list came from: the Library's default collection when it was reached, else the list that came with the app. */
  function fromText() {
    const c = from.collection;
    if (from.source === 'library') return c ? t('ls.pl.from.collection', { name: c.name, n: c.count || seed.length, rev: c.revision }) : t('ls.pl.from.library');
    return from.source ? t('ls.pl.from.bundled') : '';
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
    plantsSec.hidden = !on; gr.section.hidden = !on; ir.section.hidden = !on; for (const s of tp.sections) s.hidden = !on;
    if (on) { renderPlants(); gr.renderSection(); ir.renderSection(); tp.render(); }
    af?.refresh();   // the panel's sections fold or not, by the setting
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
    gr.updateTools(ctx.tool()); hd.updateTools(ctx.tool()); ir.updateTools(ctx.tool()); pa.updateTools(ctx.tool()); st.updateTools(ctx.tool());
    if (on) { gr.renderSection(); tp.render(); af.refresh(); }
  }
  const hasPlanting = () => { const l = LS(); return l.plants.length + l.beds.length + l.hedges.length + (l.hardscape || []).length + (l.irrigation?.heads.length || 0) + (l.freeform || []).length + (l.areas || []).length > 0; };

  // a command opens the panel section it works with (the others stay as the person left them)
  const REVEAL = { 'ls-plant': 'plants', 'ls-bed': 'plants', 'ls-hedge': 'plants', 'ls-plant-table': 'plants', 'ls-slope': 'checks', 'ls-flow': 'checks', 'ls-platform': 'checks', 'ls-berm': 'checks', 'ls-swale': 'checks', 'ls-area': 'checks', 'ls-spot': 'checks', 'ls-contour': 'checks',
    'ls-head': 'irr', 'ls-paving': 'hard', 'ls-path': 'hard', 'ls-wall': 'hard', 'ls-kerb': 'hard', 'ls-ramp': 'hard', 'ls-steps': 'hard', 'ls-drain': 'hard',
    'ls-pa-lawn': 'areas', 'ls-pa-bed': 'areas', 'ls-pa-meadow': 'areas', 'ls-pa-groundcover': 'areas', 'ls-spotlevel': 'levels', 'ls-gradearrow': 'levels', 'ls-stack': 'levels', 'ls-lateral': 'irr', 'ls-main': 'irr', 'ls-valve': 'irr', 'ls-drip': 'irr', 'ls-poc': 'irr', 'ls-coverage': 'irr', 'ls-check': 'irr' };
  function command(c) {
    if (REVEAL[c]) { if (!on) setActive(true); af?.reveal(REVEAL[c]); }
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
      case 'ls-plant-table': if (!on) setActive(true); pt.open(); return true;   // 0.8 LA.6
      case 'ls-worksheets': if (!on) setActive(true); ws.open(); return true;   // 0.8 LA.8
      case 'ls-graphics': gx.open(); return true;   // 0.8 LA.7
      case 'ls-platform': case 'ls-berm': case 'ls-swale': case 'ls-area': case 'ls-spot': case 'ls-contour': case 'ls-slope': case 'ls-flow':
        if (!on) setActive(true);
        gr.command(c); updateTools(); return true;
      case 'ls-paving': case 'ls-path': case 'ls-wall': case 'ls-kerb': case 'ls-ramp': case 'ls-steps': case 'ls-drain':
        if (!on) setActive(true);
        hd.command(c); updateTools(); return true;
      case 'ls-head': case 'ls-lateral': case 'ls-main': case 'ls-valve': case 'ls-drip': case 'ls-poc': case 'ls-coverage': case 'ls-check':
        if (!on) setActive(true);
        ir.command(c); updateTools(); return true;
      case 'ls-pa-lawn': case 'ls-pa-bed': case 'ls-pa-meadow': case 'ls-pa-groundcover':   // 0.8 LA.5
        if (!on) setActive(true);
        pa.command(c); updateTools(); return true;
      case 'ls-fromline': if (!on) setActive(true); lk.command(c); updateTools(); return true;   // 0.8 LA.2
      case 'ls-section': if (!on) setActive(true); sec.command(c); updateTools(); return true;   // 0.8 LA.9
      case 'ls-stack': case 'ls-spotlevel': case 'ls-gradearrow':   // 0.8 LA.4
        if (!on) setActive(true);
        st.command(c); updateTools(); return true;
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
    if (tool === 'ls-fromline') return lk.click(tool, w);   // 0.8 LA.2
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
    return h ? { kind: h.kind === 'area' ? 'ls-pa' : 'ls-' + h.kind, id: h.id } : st.pick(w, tol) || sec.pick(w, tol) || ir.pick(w, tol) || ff.pick(w, tol) || hd.pick(w, tol) || pa.pick(w, tol) || gr.pick(w, tol);
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
    const shown = propsOf(sel, box, head);
    const lb = shown && lk.linkBlock(sel);   // 0.8 LA.2: "Linked to …" + Break link on any linked object
    if (lb) box.append(lb);
    return shown;
  }
  function propsOf(sel, box, head) {
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
        el('label', { for: 'cv-ls-psp' }, t('ls.p.species')), speciesSelect('cv-ls-psp', it.key, (k) => edit(t('ls.undo.species'), () => { const p = find('plant', it.id); p.key = k; setVar(p, '', ''); })),
        ...variantRow('cv-ls-pvar', it.key, it, (cv, sup) => setVar(find('plant', it.id), cv, sup)),
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
        el('td', {}, speciesSelect('cv-ls-mix-' + i, m.key, (k) => edit(t('ls.undo.mix'), () => { const q = find('bed', it.id).mix[i]; q.key = k; setVar(q, '', ''); })),
          ...(pt.hasVariants(idx.get(m.key)) ? [pt.variantSelect('cv-ls-mixv-' + i, idx.get(m.key), m.cv, m.sup, (cv, sup) => edit(t('ls.undo.variant'), () => setVar(find('bed', it.id).mix[i], cv, sup)), supLabel)] : [])),
        el('td', {}, ctx.numInput(m.pct, (v) => { const n = Number(v); if (!(n > 0 && n <= 100)) return false; edit(t('ls.undo.mix'), () => { find('bed', it.id).mix[i].pct = n; }); return true; }, { label: t('ls.b.pct'), id: 'cv-ls-pct-' + i, width: '4.5rem', calc: false })),
        el('td', { className: 'num' }, String(f.mixCounts?.[i] ?? f.counts[m.key] ?? 0)),
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
      staleNote('bed', it, idx),
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
      el('label', { for: 'cv-ls-hsp' }, t('ls.p.species')), speciesSelect('cv-ls-hsp', it.key, (k) => edit(t('ls.undo.species'), () => { const h = find('hedge', it.id); h.key = k; setVar(h, '', ''); })),
      ...variantRow('cv-ls-hvar', it.key, it, (cv, sup) => setVar(find('hedge', it.id), cv, sup)),
      el('label', { for: 'cv-ls-hspc' }, t('ls.b.spacing')), ctx.numInput(it.spacing ?? '', (v) => { const n = v.trim() === '' ? null : Number(v); if (n !== null && !(n >= 0.05 && n <= 50)) return false; edit(t('ls.undo.spacing'), () => { find('hedge', it.id).spacing = n; }); return true; }, { label: t('ls.b.spacing'), id: 'cv-ls-hspc', calc: false }),
      el('label', { for: 'cv-ls-hrows' }, t('ls.h.rows')), rows,
      el('label', { for: 'cv-ls-hgap' }, t('ls.h.gap')), ctx.numInput(it.rowGap, (v) => { const n = Number(v); if (!(n > 0 && n <= 10)) return false; edit(t('ls.undo.rows'), () => { find('hedge', it.id).rowGap = n; }); return true; }, { label: t('ls.h.gap'), id: 'cv-ls-hgap', calc: false })),
    facts([[t('ls.h.length'), lenText(f.length * um())], [t('ls.b.count'), String(f.pts.length)], [t('ls.b.spacing.used'), lenText(f.spacing * um())]]),
    staleNote('hedge', it, idx),
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
    const detail = el('select', { className: 'cv-select', id: 'cv-ls-sh-detail', 'data-ls-sh-detail': '' }, el('option', { value: '' }, t('ls.gx.auto')), ...['simple', 'outline', 'detailed'].map((x) => el('option', { value: x }, t('ls.gx.l.' + x))));   // 0.8 LA.7
    const dlg = el('dialog', { className: 'cv-dialog', 'aria-labelledby': 'cv-ls-sh-h', 'data-ls-sheets': '' },
      el('div', { className: 'cv-dlg' },
        el('div', { className: 'cv-dlg-head' }, el('h2', { className: 'cv-h', id: 'cv-ls-sh-h' }, t('ls.sh.head'))),
        el('div', { className: 'cv-dlg-body' },
          el('div', { className: 'cv-checks' }, ...kinds.map((x) => x[2])),
          el('div', { className: 'cv-props' }, el('label', { for: paper.id }, t('ls.sh.paper')), paper, el('label', { for: scale.id }, t('ls.sh.scale')), scale, el('label', { for: ink.id }, t('ls.sh.ink')), ink, el('label', { for: detail.id }, t('ls.gx.level')), detail),
          el('p', { className: 'cv-note' }, t('ls.sh.note'))),
        el('div', { className: 'cv-dlg-foot' },
          el('button', { type: 'button', className: 'btn-line btn-sm-cc', onclick: () => dlg.close() }, t('ls.close')),
          el('button', { type: 'button', className: 'btn-line btn-sm-cc', 'data-ls-sh-publish': '', title: t('ls.pub.title'), onclick: async () => {   // 0.8 LA.9
            const sc = scalesFor(U()).find((x) => x.label === scale.value);
            const r = await sec.publish({ paper: paper.value, scale: sc, mono: ink.value === 'mono', level: detail.value || null, extents: ext });
            if (r) dlg.close();
          } }, t('ls.pub.go')),
          el('button', { type: 'button', className: 'btn-plot btn-sm-cc', 'data-ls-sh-go': '', onclick: async () => {
            const pick = kinds.filter((x) => x[1].checked).map((x) => x[0]);
            if (!pick.length) { ctx.say(t('ls.sh.pick')); return; }
            const sc = scalesFor(U()).find((x) => x.label === scale.value);
            const sheets = makeSheets(pick, { paper: paper.value, scale: sc, level: detail.value || null, extents: ext });
            const { bytes, report } = await toPdfPages(sheets, { mono: ink.value === 'mono', title: P().state.name });
            ctx.download(bytes, ctx.fileStem() + '-landscape-sheets.pdf', 'application/pdf');   // i18n-ignore: a file name ending
            ctx.say(t('ls.sh.done', { n: sheets.length, missing: report.missing }));
            dlg.close();
          } }, t('ls.sh.go')))));
    dlg.addEventListener('close', () => { dlg.remove(); ctx.refocus(); });
    root.append(dlg);
    dlg.showModal();
  }
  /** The sheets of `kinds` at one scale (the Sheets dialog and the publish set share it). `scene` = the plan built for that scale. */
  function makeSheets(kinds, { paper, scale: sc, level = null, extents, scene = null }) {
    forcedLevel = level;   // LA.7: this set's plant detail (automatic = by the sheet's scale)
    let scene0 = scene;
    try { scene0 = scene0 || ctx.buildScene(sc.mmPerUnit); } finally { forcedLevel = null; }
    return landscapeSheets(scene0, { kinds, extents, paper, landscape: true, scale: sc, units: U(), title: P().state.name || ctx.fileStem(), fmt: sheetFmt(),
      plants: { rows: schedule(LS(), index(), U(), lang()).rows, index: index() }, irrigation: ir.result(), worksheets: ws.results().filter((r) => r.ws.onSheet),
      sectionSheets: kinds.includes('sections') ? sec.sheets({ paper, scale: sc }) : [], details: {
        walls: (LS().hardscape || []).filter((h) => h.kind === 'wall').map((w) => ({ wall: w, layout: wallLayout(w, ctx.surface(), U()) })),
        pavings: (LS().hardscape || []).filter((h) => h.kind === 'paving' || h.kind === 'path'),
        steps: (LS().hardscape || []).filter((h) => h.kind === 'steps').map((s) => ({ steps: s, layout: stepsLayout(s, ctx.surface(), U()) })) } });
  }
  /** The plant counts plus the hardscape's areas, lengths and step counts, in one quantities file. */
  function withHard(q) { return { ...q, items: [...q.items, ...hd.quantities(), ...pa.quantities(), ...ir.quantities()].slice(0, 500) }; }
  function exportIfc() {
    const els = [...plantingElements(LS(), index(), U(), { zAt: ctx.groundAt, lang: lang() }), ...hd.elements(), ...pa.elements(), ...ff.elements()];
    if (!els.length) { ctx.say(t('ls.ifc.none')); return; }
    const out = writeLandscapeIfc({ name: P().state.name || ctx.fileStem(), units: U(), elements: els }, { seed: P().state.name || 'site' });
    ctx.download(new TextEncoder().encode(out.text), ctx.fileStem() + '-landscape.ifc', 'application/x-step');   // i18n-ignore: a file name ending
    ctx.say(t('ls.ifc.done', { n: out.counts.elements, k: out.counts.types }));
  }

  // ---- plan and overlay ----
  function sceneItems(unitPerMm) {
    lk.watch();   // 0.8 LA.2: follow linked lines on every change of the project in use
    const l = P().state.landscape;
    if (!l) return [];
    const plantsOut = !seed.length && !(l.palette || []).length ? [] : plantItems(l, index(), U(), { unitPerMm, lang: lang(), level: forcedLevel });
    return [...gr.sceneItems(unitPerMm), ...hd.sceneItems(unitPerMm), ...ff.sceneItems(unitPerMm), ...plantsOut, ...ir.sceneItems(unitPerMm), ...st.sceneItems(unitPerMm), ...sec.sceneItems(unitPerMm)];
  }
  function overlay(c2d, toScreen, C, sel) {
    const tool = ctx.tool(), cu = ctx.cursor?.();
    gr.overlay(c2d, toScreen, C, sel); hd.overlay(c2d, toScreen, C, sel); pa.overlay(c2d, toScreen, C, sel); st.overlay(c2d, toScreen, C, sel); sec.overlay(c2d, toScreen, C, sel); ir.overlay(c2d, toScreen, C, sel); ff.overlay(c2d, toScreen, C, sel);
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
    active: () => on, setActive, command, ownsTool: (tl) => TOOLS.includes(tl), click, finish, closedTool: (tl) => tl === 'ls-bed' || gr.closed.has(tl) || hd.closed.has(tl) || pa.closed.has(tl),
    hints: { 'ls-plant': 'ls.hint.plant', 'ls-bed': 'ls.hint.bed', 'ls-hedge': 'ls.hint.hedge', ...gr.hints, ...hd.hints, ...ir.hints, ...ff.hints, ...pa.hints, ...st.hints, ...lk.hints, ...sec.hints },
    isMine, props, remove, pick, grip, grade: gr, hard: hd, areas: pa, stack: st, plantTable: pt, worksheets: ws, sections: sec, linkNotes: () => lk.notes(), linkSource: (ref, pts) => lk.linkSource(ref, pts), fromSource: (ref, pts) => lk.fromSource(ref, pts), linkBlock: (sel) => lk.linkBlock(sel), links: () => lk.links(), syncLinks: () => lk.sync(), irrigation: ir, seedSpecies: () => seed, sceneItems, overlay, updateTools, ready, index,
    schedule: () => schedule(LS(), index(), U(), lang()), get current() { return cur; }, set current(k) { cur = k; if (on) renderPlants(); },
    inside,
  };
}
