/* SPDX-License-Identifier: Apache-2.0 */
/**
 * workspace-civilcraft.js — CivilCraft's adapter for the shell's workspace layout engine (assets/js/app-workspace.js; 0.7 WS.12,
 * session ws-civilcraft; map docs/apps/app-workspace.md, reference workspace-bimcraft.js). The engine builds the blocks a layout
 * file names; this file fills them with CivilCraft's own things. Every tool clicks the app's own button (registry commands through
 * window.ccInput, the Landscape and Power lines tools through their own [data-cmd] buttons), so nothing here does work of its own.
 *
 *   ribbon      the Civil ribbon menu style's tabs (input-civilcraft.js STYLES.ribbon) laid out large + small, a Workspace group on
 *               Home (Civil / Landscape / Power lines), and the Landscape or Power lines workspace as a context tab while it is on
 *               (built from that workspace's own toolbar group and menus, so tools added there appear here too)
 *   toolbox     the drawing tools: Surface, Design, View, then each workspace's groups (a tool from another workspace switches to it,
 *               as its toolbar button does)
 *   slots       level (the workspace), document (the surface shown), layout (3D, profile, sections), units, detail (contour interval),
 *               fit — copies of the app's own controls that set them (the originals stay in their panels)
 *   palettes    browser (the project browser: surfaces, alignments, sheets), panel (the left panel's own content). Properties stay in
 *               the right panel, where CivilCraft has them (no properties palette)
 *   views       Plan and 3D (the plan's profile and section panels stay under the plan)
 *
 *   mountCivilWorkspace({ root }) → the engine's api (window.civilcraftWorkspace for tests)
 */
import { mountWorkspaces } from 'cc-workspace';
import { inputReady } from '/assets/js/app-workspace-input.js';
import { COMMANDS, STYLES } from './input-civilcraft.js';
import { t } from './i18n.js';

const WS = { 'ws.civil': 'civil', 'ws.landscape': 'landscape', 'ws.powerlines': 'powerlines' };
const WS_ICON = { 'ws.civil': 'bi-signpost-split', 'ws.landscape': 'bi-tree', 'ws.powerlines': 'bi-lightning-charge' };
// the Civil ribbon's groups, large first then small stacks of up to three (RIBBON-COMPACT); ids are input-civilcraft.js commands
const LAYOUT = {
  ground: { large: ['file.open'], small: ['surface.cad-open', 'gis.import'] },
  create: { large: ['design.alignment'], small: ['design.pad', 'design.pipe', 'surface.feature', 'surface.mass'] },
  views: { large: ['design.profile'], small: ['surface.sections', 'design.pvi-add'] },
  clipboard: { large: ['edit.paste'], small: ['edit.cut', 'edit.copy', 'edit.paste-in-place', 'edit.duplicate', 'edit.delete'] },
  selection: { large: ['view.select'], small: ['edit.select-all', 'edit.select-none'] },
  export: { large: ['export.landxml'], small: ['export.dxf', 'export.dwg'] },
};
const SKIP = new Set(['surface.landscape', 'surface.powerlines']);   // the Workspace group switches workspaces on the ribbon
const TOOLBOX = [   // [label key, [ids]] — the drawing tools; workspaces follow
  ['input.grp.surface', ['surface.breakline', 'surface.boundary', 'surface.feature', 'surface.mass', 'surface.sections', 'surface.grades']],
  ['input.grp.design', ['design.alignment', 'design.pad', 'design.pipe', 'design.profile']],
  ['input.grp.view', ['view.select', 'view.fit', 'view.view3d']],
];
// menu items have no icon of their own: these, else their menu's icon (a "More" menu's dots say nothing, so a plain dot)
const ICON = { 'ls-schedule': 'bi-table', 'ls-freeform-open': 'bi-bezier', 'ls-sheets': 'bi-file-earmark-pdf', 'ls-ifc': 'bi-box-arrow-up', 'ls-size': 'bi-arrows-angle-expand',
  'ls-labels': 'bi-tag', 'pl-rules': 'bi-sliders', 'pl-stringing': 'bi-table', 'pl-quantities': 'bi-list-ol', 'pl-sheets': 'bi-file-earmark-pdf', 'pl-gis': 'bi-globe-americas',
  'pl-don-out': 'bi-box-arrow-up', 'pl-don-in': 'bi-box-arrow-in-down' };
const MORE_NAME = { Landscape: 'cv.ws.grp.lsmore', 'Power lines': 'cv.ws.grp.plmore' };   // i18n-ignore: the menus' keys (data-group-menu)

export function mountCivilWorkspace({ root }) {
  const C = () => window.civilcraft;
  const stage = root.querySelector('.cv-stage');
  const left = root.querySelector('.cv-left'), right = root.querySelector('.cv-right');
  const statusEl = root.querySelector('.cv-status');
  const byId = new Map(COMMANDS.map((c) => [c.id, c]));
  const style = STYLES.ribbon;
  let engine = null, I = null, frame = 0;
  const soon = () => { if (!frame) frame = requestAnimationFrame(() => { frame = 0; engine?.refresh(); }); };
  const el = (tag, attrs = {}, ...kids) => {
    const e = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) { if (v === null || v === undefined || v === false) continue; if (k === 'className') e.className = v; else e.setAttribute(k, v === true ? '' : String(v)); }
    for (const c of kids.flat()) if (c !== null && c !== undefined && c !== false) e.append(c instanceof Node ? c : String(c));
    return e;
  };

  // ---- the app's own buttons ----
  const target = (id) => {
    const c = byId.get(id);
    if (c) return c.sel ? root.querySelector(c.sel) || document.querySelector(c.sel) : null;
    if (id.startsWith('cv:')) return root.querySelector('.cv-tools [data-cmd="' + id.slice(3) + '"]') || document.querySelector('.cv-tools [data-cmd="' + id.slice(3) + '"]');
    return null;
  };
  const textOf = (b) => { if (!b) return ''; const s = b.querySelector(':scope > span'); if (s) return s.textContent.trim(); const c = b.cloneNode(true); c.querySelector('kbd')?.remove(); return c.textContent.replace(/\s+/g, ' ').trim(); };
  const iconOf = (b) => (b?.querySelector('i.bi')?.className.match(/bi-[\w-]+/) || [null])[0] || ICON[b?.dataset.cmd]
    || [(b?.closest('details.cv-menu')?.querySelector(':scope > summary i.bi')?.className.match(/bi-[\w-]+/) || [null])[0]].find((x) => x && x !== 'bi-three-dots') || 'bi-dot';
  const wsNow = () => (root.hasAttribute('data-powerlines') ? 'powerlines' : root.hasAttribute('data-landscape') ? 'landscape' : 'civil');
  const wsName = (w) => t(w === 'powerlines' ? 'pl.ws.name' : w === 'landscape' ? 'ls.ws.landscape' : 'ls.ws.civil');
  const wsSelect = () => root.querySelector('[data-ls-workspace]');
  function setWorkspace(w) {
    const s = wsSelect(); if (!s || wsNow() === w) return;
    s.value = w; s.dispatchEvent(new Event('change', { bubbles: true }));
    C()?.say(w === 'civil' ? t('ls.ws.off') : t(w === 'landscape' ? 'ls.ws.on' : 'pl.ws.on'));
  }
  /** Why a button cannot run now ('' = it can). A button hidden only because another workspace hides its toolbar group still runs. */
  function why(b) {
    if (!b) return t('cv.ws.why.notbuilt');
    if (b.disabled || b.getAttribute('aria-disabled') === 'true') return b.getAttribute('title') || t('cv.ws.why.off');
    const h = b.closest('[hidden]');
    if (h && !b.closest('details') && !h.matches('.cv-tool-group')) return b.getAttribute('title') || t('cv.ws.why.off');
    return '';
  }
  const pressed = (b) => !!b && (b.getAttribute('aria-pressed') === 'true' || b.getAttribute('aria-checked') === 'true');

  // ---- the ribbon ----
  const stack = (ids) => { const out = []; for (let i = 0; i < ids.length; i += 3) out.push(ids.slice(i, i + 3)); return out; };
  function civilTabs() {
    return style.tabs.map((tab, ti) => {
      const groups = tab.panels.map((pn, pi) => {
        const key = pn.label.replace('input.m.', ''), ids = pn.items.filter((id) => byId.has(id) && !SKIP.has(id));
        const lay = LAYOUT[key] || { large: ids, small: [] };
        return { id: 'g' + ti + '-' + pi, label: t(pn.label), large: lay.large.filter((id) => ids.includes(id)), stacks: stack(lay.small.filter((id) => ids.includes(id))) };
      }).filter((g) => g.large.length || g.stacks.length);
      if (ti === 0) groups.unshift({ id: 'workspace', label: t('ls.ws.group'), large: [], stacks: [Object.keys(WS)] });
      return { tab: 't' + ti, label: t(tab.label), groups };
    });
  }
  /** A workspace's tab, from its own toolbar group: the row's buttons, then each menu as a group (its summary names it). */
  function workspaceTab(w) {
    const g = root.querySelector(w === 'landscape' ? '.cv-tools [data-ls-group]:not(.cv-ls-wsgroup)' : '.cv-tools [data-pl-group]');
    if (!g) return null;
    const row = g.querySelector('.cv-tool-row');
    const direct = [...(row?.children || [])].filter((n) => n.matches('button[data-cmd]')).map((b) => 'cv:' + b.dataset.cmd);
    const groups = direct.length ? [{ id: w + '-tools', label: textOf(g.querySelector('.cv-tool-label')) || wsName(w), large: direct.slice(0, 1), stacks: stack(direct.slice(1)) }] : [];
    for (const d of row?.querySelectorAll(':scope > details.cv-menu') || []) {
      const ids = [...d.querySelectorAll('.cv-menu-list > button[data-cmd]')].map((b) => 'cv:' + b.dataset.cmd);
      if (!ids.length) continue;
      const key = MORE_NAME[d.dataset.groupMenu];
      groups.push({ id: w + '-' + (d.dataset.groupMenu || groups.length).toString().toLowerCase().replace(/[^a-z0-9]+/g, '-'), label: key ? t(key) : textOf(d.querySelector(':scope > summary')), large: ids.slice(0, 1), stacks: stack(ids.slice(1)) });
    }
    return { tab: w, label: wsName(w), context: true, groups };
  }
  const ribbon = () => [...civilTabs(), workspaceTab('landscape'), workspaceTab('powerlines')].filter(Boolean);

  // ---- the toolbox ----
  function toolbox() {
    const out = TOOLBOX.map(([k, ids], i) => ({ id: 'tb' + i, label: t(k), tools: ids.filter((id) => byId.has(id)) }));
    for (const w of ['landscape', 'powerlines']) for (const g of workspaceTab(w)?.groups || []) out.push({ id: g.id, label: w === 'landscape' && g.id === 'landscape-tools' ? wsName(w) : g.label, tools: [...g.large, ...g.stacks.flat()] });
    return out.filter((g) => g.tools.length);
  }

  // ---- slots: copies of the app's own controls (the originals keep their place and their labels) ----
  function mirror(src, aria) {
    const s = el('select', { className: 'cv-select cv-ws-mirror', 'aria-label': aria });
    const sync = () => {
      const from = typeof src === 'function' ? src() : src; if (!from) return;
      const sig = [...from.options].map((o) => o.value + '\u0000' + o.textContent + (o.disabled ? '\u0001' : '')).join('|');
      if (s.dataset.sig !== sig) { s.dataset.sig = sig; s.replaceChildren(...[...from.options].map((o) => el('option', { value: o.value, disabled: o.disabled }, o.textContent))); }
      if (document.activeElement !== s) s.value = from.value;
      s.disabled = from.disabled;
    };
    s.addEventListener('change', () => { const from = typeof src === 'function' ? src() : src; if (!from) return; from.value = s.value; from.dispatchEvent(new Event('change', { bubbles: true })); soon(); });
    s.ccSync = sync;
    return s;
  }
  const mirrors = [];
  const labelled = (text, ctl) => { mirrors.push(ctl); return el('label', { className: 'cv-ws-slot' }, el('span', {}, text), ctl); };
  const wsMirror = mirror(wsSelect, t('ls.ws.group'));
  const surfMirror = mirror(root.querySelector('[data-show-surface]'), t('ui.surface'));
  const unitsMirror = mirror(root.querySelector('[data-units]'), t('ui.site.units'));
  const intervalMirror = mirror(root.querySelector('[data-interval]'), t('ui.display.interval'));
  mirrors.push(wsMirror, surfMirror);
  const slotNodes = {
    level: [wsMirror], document: [surfMirror], units: [labelled(t('ui.site.units'), unitsMirror)], detail: [labelled(t('ui.display.interval'), intervalMirror)],
  };

  // ---- the project browser ----
  const browser = el('div', { className: 'cv-ws-browser', 'data-cv-ws-browser': '' });
  let browserSig = '';
  function renderBrowser() {
    const c = C(); if (!c) return;
    const p = c.project, st = p.state, shown = root.querySelector('[data-show-surface]')?.value || 'eg';
    const hasEg = p.points.length >= 3 || !!st.surface?.tin, hasFg = (st.pads || []).length > 0;
    const als = (st.alignments || []).map((a) => [a.id, a.name]);
    const ls = root.querySelector('[data-cmd="ls-sheets"]'), pl = root.querySelector('[data-cmd="pl-sheets"]');
    const sig = JSON.stringify([shown, hasEg, hasFg, als, c.sel?.kind === 'alignment' ? c.sel.id : null, !!ls, why(pl)]);
    if (sig === browserSig || browser.contains(document.activeElement) && document.activeElement.matches('select, input')) return;
    browserSig = sig;
    const item = (text, attrs, onClick, current) => {
      const b = el('button', { type: 'button', className: 'cv-ws-pb-go', 'aria-current': current ? 'true' : null, ...attrs }, text);
      if (onClick) b.addEventListener('click', onClick);
      return el('li', {}, b);
    };
    const group = (title, items, none) => el('details', { className: 'cv-ws-pb-group', open: true }, el('summary', {}, title + ' (' + items.length + ')'),
      items.length ? el('ul', {}, items) : el('p', { className: 'cv-note' }, none));
    const setSurface = (v) => { const s = root.querySelector('[data-show-surface]'); if (!s) return; s.value = v; s.dispatchEvent(new Event('change', { bubbles: true })); browserSig = ''; soon(); };
    const surfaces = [hasEg ? item(t('surface.eg'), { 'data-cv-pb-surface': 'eg' }, () => setSurface('eg'), shown === 'eg') : null,
      hasFg ? item(t('ui.display.fg'), { 'data-cv-pb-surface': 'fg' }, () => setSurface('fg'), shown === 'fg') : null].filter(Boolean);
    const alignments = als.map(([id, name]) => item(name, { 'data-cv-pb-alignment': id }, () => c.select({ kind: 'alignment', id }), c.sel?.kind === 'alignment' && c.sel.id === id));
    const sheets = [...als.map(([id, name]) => item(t('cv.ws.pb.pp', { name }), { 'data-cv-pb-pp': id }, () => c.sheets.open(id))),
      ls ? item(textOf(ls), { 'data-cv-pb-sheets': 'ls-sheets' }, () => c.command('ls-sheets')) : null,
      pl ? item(textOf(pl), { 'data-cv-pb-sheets': 'pl-sheets', 'aria-disabled': why(pl) ? 'true' : null, title: why(pl) || null }, () => { const w = why(pl); if (w) c.say(w); else c.command('pl-sheets'); }) : null].filter(Boolean);
    browser.replaceChildren(group(t('cv.ws.pb.surfaces'), surfaces, t('cv.ws.pb.surfaces.none')), group(t('cv.ws.pb.alignments'), alignments, t('cv.ws.pb.alignments.none')),
      group(t('cv.ws.pb.sheets'), sheets, t('cv.ws.pb.sheets.none')));
  }

  // ---- views: the plan and the 3D site view ----
  const is3D = () => { const h = root.querySelector('[data-view3d]'); return !!h && !h.hidden; };
  const VIEWS = () => [{ id: 'plan', kind: 'plan', name: t('cv.ws.view.plan'), icon: 'bi-map' }, { id: '3d', kind: '3d', name: t('ui.view3d'), icon: 'bi-badge-3d' }];

  const adapter = {
    app: 'civilcraft', root, stage, panels: { left, right }, status: statusEl,
    t: (k, v) => t(k, v), say: (text) => C()?.say(text),
    actions: ['open', 'save', 'undo', 'redo', 'select', 'clear', 'fit'],
    state() {
      const c = C(); if (!c) return { document: null, name: '', selection: [] };
      const tool = c.tool || 'select', b = tool === 'select' ? null : root.querySelector('.cv-tools [data-cmd="' + tool + '"]');
      return { document: c.project, name: c.project.state.name || t('cv.ws.untitled'), dirty: !!c.project.dirty, busy: !(root.querySelector('[data-busy]')?.hidden ?? true),
        selection: c.sel ? [c.sel] : c.picked, tool, toolLabel: tool === 'select' ? '' : textOf(b), other: false };   // '' = the engine's own word for "the tool"
    },
    endTool() { if (C() && C().tool !== 'select') C().setTool('select'); },
    ribbon, contextTab: () => (wsNow() === 'civil' ? null : wsNow()), toolbox,
    tool(id) {
      const a = { open: 'file.open', save: 'file.save', undo: 'edit.undo', redo: 'edit.redo', select: 'view.select', clear: 'edit.select-none', fit: 'view.fit' }[id];
      if (a) id = a;
      if (WS[id]) return { label: wsName(WS[id]), icon: WS_ICON[id], built: !!wsSelect() };
      const c = byId.get(id);
      if (c) return { label: t((style.labels || {})[id] || c.label), icon: c.icon || 'bi-dot', built: !!target(id) };
      const b = target(id);
      return { label: textOf(b) || id, icon: iconOf(b), built: !!b };
    },
    can(id) {
      const a = { open: 'file.open', save: 'file.save', undo: 'edit.undo', redo: 'edit.redo', select: 'view.select', clear: 'edit.select-none', fit: 'view.fit' }[id];
      if (a) id = a;
      if (WS[id]) return wsSelect() ? { enabled: true, reason: '' } : { enabled: false, reason: t('cv.ws.why.notbuilt') };
      const w = why(target(id));
      return { enabled: !w, reason: w };
    },
    async run(id) {
      const a = { open: 'file.open', save: 'file.save', undo: 'edit.undo', redo: 'edit.redo', select: 'view.select', clear: 'edit.select-none', fit: 'view.fit' }[id];
      if (a) id = a;
      if (WS[id]) { setWorkspace(WS[id]); soon(); return; }
      const b = target(id); if (!b || why(b)) return;
      // the registry's way when it can (a button another workspace hides is clicked as its own toolbar would be)
      if (byId.has(id) && I && !b.closest('[hidden]')) await I.run(id); else b.click();
      soon();
    },
    pressed(id) {
      if (WS[id]) return wsNow() === WS[id];
      return pressed(target(id));
    },
    options(s) {
      const running = s.tool && s.tool !== 'select';
      return { title: running ? s.toolLabel : t('cv.ws.opt.select'), text: running ? root.querySelector('[data-toolhint]')?.textContent || '' : s.selection.length ? t('cv.ws.opt.picked') : t('cv.ws.opt.idle') };
    },
    toolOptions: () => null,
    showProperties() { right?.querySelector('[data-props-h]')?.scrollIntoView({ block: 'nearest' }); right?.querySelector('[data-props] :is(input, select, button)')?.focus(); },
    slots: {
      level: { label: t('ls.ws.group'), nodes: () => slotNodes.level },
      document: { label: t('ui.surface'), nodes: () => slotNodes.document },
      layout: { label: '', nodes: (c) => ['view.view3d', 'design.profile', 'surface.sections'].map((id) => c.tool(id, 'quickbar', true)) },
      units: { label: '', nodes: () => slotNodes.units },
      detail: { label: t('ui.display.interval'), nodes: () => slotNodes.detail },
      fit: { label: t('ui.tb.fit'), nodes: (c) => [c.tool('view.fit', 'viewbar', true)] },
    },
    palettes: {
      browser: { label: t('cv.ws.browser'), hint: t('cv.ws.browser.hint'), body: () => browser },
      panel: { label: t('cv.ws.panel') },
    },
    views: {
      list: VIEWS, token: () => C()?.project || null, initial: () => (is3D() ? '3d' : 'plan'),
      current: () => (is3D() ? '3d' : 'plan'),
      go: (id) => { const c = C(); if (!c) return; if ((id === '3d') !== is3D()) c.show3D(id === '3d'); soon(); },
    },
    toolbar: () => root.querySelector(':scope > .cv-tools'),
    hide: [],
    entered(ctx) { root.classList.toggle('cv-ws-palettes', ctx.has('palettes')); soon(); },
    left() { root.classList.remove('cv-ws-palettes'); },
    refresh() { for (const m of mirrors) m.ccSync?.(); renderBrowser(); },
    resized() { C()?.view?.resize?.(); C()?.view3d?.view?.resize?.(); },
  };

  // the app tells nobody when it changes: watch what its own refresh touches (tool buttons, Properties, the status line, panels)
  const watch = new MutationObserver(soon);
  const tools = root.querySelector('.cv-tools');
  if (tools) watch.observe(tools, { subtree: true, attributes: true, attributeFilter: ['aria-pressed', 'aria-checked', 'disabled', 'hidden', 'title'] });
  for (const n of [root.querySelector('[data-props]'), root.querySelector('[data-status]'), root.querySelector('[data-view3d]'), root.querySelector('[data-profile-panel]'), root.querySelector('[data-sections-panel]')]) if (n) watch.observe(n, { childList: true, attributes: true, attributeFilter: ['hidden'], characterData: true, subtree: n.matches('[data-status]') });
  watch.observe(root, { attributes: true, attributeFilter: ['data-landscape', 'data-powerlines'] });

  inputReady().then((x) => { I = x; soon(); });
  engine = mountWorkspaces(adapter);
  window.civilcraftWorkspace = { engine, adapter };
  return engine;
}
