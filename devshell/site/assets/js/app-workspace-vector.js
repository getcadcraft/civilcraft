/* SPDX-License-Identifier: Apache-2.0 */
/**
 * app-workspace-vector.js — the two blocks of the "Vector" layout (0.9 VEC.1, owner 2026-11-05: a layout, menus and icon placement that
 * people who work in the big drawing programs feel at home in). Shared engine parts, not per app (rule: build for Super):
 *
 *   menubar      the classic top menu bar: File Edit View Modify Model AEC Tools Text Window Cloud Help. Nothing is typed in per app:
 *                every command the app's input registry (window.ccInput) has is filed under ONE menu by its registry group
 *                (BY_GROUP below), so a menu an app has nothing for is left out and no command is lost or faked. Items are the
 *                engine's own `[data-ws-command]` buttons (enabled, pressed, explain, run as in the ribbon), with the person's keys.
 *   toolpalette  the left palettes: "Basic" = a fixed-order icon grid of the tools every drawing program puts first (BASIC), and
 *                "Tool Sets" = a row of set icons over the chosen set's tools as icon + name rows (the toolbox's groups, all of them).
 *
 * Icons are the CadCraft set (app-workspace-icons.js), drawn by us, never another program's artwork: the layout copies WHERE things
 * are, not how they are drawn. Map: docs/apps/app-workspace.md § Vector.
 */
import { showSeq } from './app-input.js';
import { iconKey, iconNode, iconStyle } from './app-workspace-icons.js';
import { iconFor, infoFields } from './app-workspace-extras.js';

export const MENU_ORDER = ['file', 'edit', 'view', 'modify', 'model', 'aec', 'tools', 'text', 'window', 'cloud', 'help'];

/** Registry group (or id prefix) → the menu it is filed under. Anything not listed goes to Tools, so a new group never disappears. */
export const BY_GROUP = {
  file: 'file', export: 'file', output: 'file', sheets: 'file', pages: 'file',
  edit: 'edit', clipboard: 'edit',
  view: 'view', camera: 'view', show: 'view', vis: 'view', layers: 'view', organize: 'view', aids: 'view', scale: 'view',
  modify: 'modify', blocks: 'modify', parametric: 'modify', align: 'modify', form: 'modify', revise: 'modify',
  '3d': 'model', model: 'model', features: 'model', feature: 'model', surface: 'model', assembly: 'model', assemble: 'model',
  build: 'aec', place: 'aec', connect: 'aec', design: 'aec', gis: 'aec', takeoff: 'aec', items: 'aec',
  panels: 'window', panel: 'window', workspace: 'window', ws: 'window',
  library: 'cloud',
};
/** Single commands that sit in another menu than their group's (the registry's own ids). */
export const BY_ID = { 'app.help': 'help', 'app.palette': 'help', 'app.settings': 'file' };
const TEXT_ID = /^(text|mtext|text3d|note|font|spell)/;

/**
 * The Sketch menu set (0.9 SK.1): File Edit View Camera Draw Tools Window Extensions Help, for people who know the 3D modelling
 * program whose menus run that way. Same rule as above: every command is filed under ONE menu by its registry group; text commands sit
 * under Tools, view and camera commands split between View and Camera, the add-on library is the Extensions menu.
 */
export const SKETCH_ORDER = ['file', 'edit', 'view', 'camera', 'draw', 'tools', 'window', 'extensions', 'help'];
export const SKETCH_BY_GROUP = {
  file: 'file', export: 'file', output: 'file', sheets: 'file', pages: 'file',
  edit: 'edit', clipboard: 'edit',
  view: 'view', show: 'view', vis: 'view', layers: 'view', organize: 'view', aids: 'view', scale: 'view',
  camera: 'camera',
  build: 'draw', place: 'draw', connect: 'draw', design: 'draw', gis: 'draw', takeoff: 'draw', items: 'draw', '3d': 'draw', model: 'draw', features: 'draw', feature: 'draw', surface: 'draw', assembly: 'draw', assemble: 'draw', form: 'draw',
  modify: 'tools', blocks: 'tools', parametric: 'tools', align: 'tools', revise: 'tools',
  panels: 'window', panel: 'window', workspace: 'window', ws: 'window',
  library: 'extensions',
};
export const SKETCH_BY_ID = { 'app.help': 'help', 'app.palette': 'help', 'app.settings': 'window' };
export const menuOrder = (set) => (set === 'sketch' ? SKETCH_ORDER : MENU_ORDER);

export function menuOf(cmd, set = 'vector') {
  const id = String(cmd.id || ''), prefix = id.split('.')[0], last = id.split('.').pop();
  if (set === 'sketch') return SKETCH_BY_ID[id] || SKETCH_BY_GROUP[cmd.group] || SKETCH_BY_GROUP[prefix] || 'tools';
  if (BY_ID[id]) return BY_ID[id];
  if (TEXT_ID.test(last)) return 'text';
  return BY_GROUP[cmd.group] || BY_GROUP[prefix] || 'tools';
}

/** The tools every drawing program puts first, in this order; each is the first tool of the app whose icon key matches (nothing it lacks is drawn). */
export const BASIC = ['select', 'pan', 'orbit', 'zoom', 'text', 'dim', 'leader', 'line', 'polyline', 'rect', 'circle', 'ellipse', 'polygon', 'arc', 'hatch',
  'move', 'copy', 'rotate', 'mirror', 'scale', 'offset', 'trim', 'extend', 'fillet', 'chamfer', 'align', 'array', 'stretch', 'erase', 'measure', 'area', 'section'];

/** Sketch's Basic strip: the tools its people reach first (select, eraser, paint, then draw, push/pull, move, measure, text, camera); icon keys, first match in the app wins. */
export const BASIC_SKETCH = ['select', 'erase', 'paint', 'line', 'polyline', 'rect', 'circle', 'polygon', 'arc', 'extrude', 'move', 'rotate', 'scale', 'offset', 'measure', 'dim', 'dimangular', 'text',
  'orbit', 'pan', 'zoom', 'extents', 'section', 'copy', 'mirror', 'trim', 'extend', 'fillet', 'chamfer', 'align', 'array', 'stretch', 'area', 'hatch', 'leader'];

const pretty = (s) => { const w = String(s || '').replace(/[-_]+/g, ' '); return w.charAt(0).toUpperCase() + w.slice(1); };

/** The icon of a tool button in `mode` 'set' (the CadCraft set, Bootstrap Icons for what it lacks) or the app's own drawing. */
export function setIcon(b, id, label, on = true) {
  if (!on || iconStyle() === 'app' || !b.firstChild) return b;
  const key = iconKey(id, label), node = key ? iconNode(key) : null;
  if (node) b.firstChild.replaceWith(node);
  else { const c = iconFor(id, label); if (c) { const i = document.createElement('i'); i.className = 'bi ' + c + ' ws-icon-bi ws-set'; i.setAttribute('aria-hidden', 'true'); b.firstChild.replaceWith(i); } }
  return b;
}

// ------------------------------------------------------------------ menu bar ------------------------------------------------------------------
/**
 * Menu items run through the app's input registry (window.ccInput: the same path as every menu style, key and the command finder), not
 * through an adapter: adapters name tools their own way per block, the registry is the one list every app has. An item is a command whose
 * button the app has (what fromInput calls "built"); greyed with the registry's own reason (ccInput.why).
 */
export function menubar(E) {
  const { A, T, el, explain, say } = E;
  const I = () => window.ccInput || null;
  const has = (k) => (window.ccShellT?.has ? window.ccShellT.has(k) : false);
  const word = (k, fallback) => (has(k) ? T(k) : fallback);
  const text = (k) => (has(k) ? window.ccShellT(k) : String(k || ''));
  const target = (c) => (c && c.sel ? E.A.root.querySelector(c.sel) || document.querySelector(c.sel) : null);
  let open = null;   // {btn, panel}

  function groups(set) {
    const c = I(); if (!c) return [];
    const ribbonLabel = new Map();   // the app's own (translated) name for a group, from its ribbon's panels
    try { for (const t of A.ribbon ? A.ribbon() : []) for (const g of t.groups) for (const id of [...g.large, ...g.stacks.flat()]) { const cmd = c.commands.find((x) => x.id === id); if (cmd && !ribbonLabel.has(cmd.group)) ribbonLabel.set(cmd.group, g.label); } } catch (e) { /* no ribbon: plain words */ }
    const menus = new Map(menuOrder(set).map((m) => [m, new Map()]));
    for (const cmd of c.commands) {
      if (!target(cmd)) continue;
      const m = menuOf(cmd, set), g = menus.get(m);
      if (!g.has(cmd.group)) g.set(cmd.group, { key: cmd.group, label: ribbonLabel.get(cmd.group) || pretty(cmd.group), ids: [] });
      g.get(cmd.group).ids.push(cmd);
    }
    return menuOrder(set).map((m) => ({ id: m, groups: [...menus.get(m).values()] }));
  }

  const item = (cmd) => {
    const label = text(cmd.label), ic = el('i', { className: 'bi ' + (cmd.icon || 'bi-dot') + ' ws-icon-bi', 'aria-hidden': 'true' });
    const b = el('button', { type: 'button', className: 'vw-item', role: 'menuitem', 'data-vw-cmd': cmd.id, 'aria-label': label }, ic, el('span', {}, label));
    setIcon(b, cmd.id, label, true);
    const k = I()?.keysOf?.(cmd.id)?.[0]; if (k) b.append(el('kbd', {}, showSeq(k)));
    return b;
  };
  const shellItem = (sel, label) => el('button', { type: 'button', className: 'vw-item', role: 'menuitem', 'data-ws-shell': sel }, el('span', {}, label));

  function menuPanel(m) {
    const panel = el('div', { className: 'vw-panel', role: 'menu', hidden: true, 'data-vw-panel': m.id });
    const total = m.groups.reduce((n, g) => n + g.ids.length, 0);
    const fold = m.groups.length > 1 && total > 14;   // a long menu: each group with more than one command is a submenu, as the big programs do
    m.groups.forEach((g, i) => {
      if (fold && g.ids.length > 1) {
        panel.append(el('div', { className: 'vw-sub' }, el('button', { type: 'button', className: 'vw-item vw-subhead', role: 'menuitem', 'aria-haspopup': 'true', 'aria-expanded': 'false', 'data-vw-sub': '' }, el('span', {}, g.label), el('i', { className: 'bi bi-chevron-right', 'aria-hidden': 'true' })),
          el('div', { className: 'vw-panel vw-flyout', role: 'menu', hidden: true }, g.ids.map(item))));
      } else {
        if (i && !fold) panel.append(el('hr', { role: 'separator' }));
        for (const cmd of g.ids) panel.append(item(cmd));
      }
    });
    // the shell's own Settings and Help stand in only where the app's registry has no such command
    const own = (id) => m.groups.some((g) => g.ids.some((c) => c.id === id));
    if (m.id === 'file' && !own('app.settings')) panel.append(el('hr', { role: 'separator' }), shellItem('[data-settings-open]', word('shell.ws.settings', 'Settings')));
    if (m.id === 'help' && !own('app.help')) panel.append(shellItem('[data-help-open]', word('shell.ws.help', 'Help')));
    if (m.id === 'help') panel.append(el('hr', { role: 'separator' }), document.querySelector('[data-newhere]') ? el('button', { type: 'button', className: 'vw-item', role: 'menuitem', 'data-newhere-open': '' }, el('span', {}, T('shell.newhere.title'))) : null, el('button', { type: 'button', className: 'vw-item', role: 'menuitem', 'data-about-open': '' }, el('span', {}, T('shell.about.title', { app: document.querySelector('[data-about]')?.dataset.name || '' }))));   // About <app>: every Help menu (owner 2026-11-05)
    if (m.id === 'window') for (const n of Object.keys(A.palettes || {})) if (n !== 'panel') panel.append(el('button', { type: 'button', className: 'vw-item', role: 'menuitem', 'data-vw-palette': n }, el('span', {}, typeof A.palettes[n].label === 'function' ? A.palettes[n].label('right-panel') : A.palettes[n].label || n)));
    return panel;
  }

  function build(part, force = false) {
    const now = Date.now();
    if (!force && part.sig && now - part.checked < 1500) return;
    part.checked = now;
    const list = groups(part.o.set).filter((m) => m.groups.length || m.id === 'help' || m.id === 'window');
    const sig = JSON.stringify(list.map((m) => [m.id, m.groups.map((g) => [g.key, g.label, g.ids.map((c) => c.id)])]));
    if (sig === part.lastSig && part.sig) return;
    part.sig = list.some((m) => m.groups.length) ? sig : null; part.lastSig = sig; close();
    part.menus.replaceChildren(...list.map((m) => el('div', { className: 'vw-menu', 'data-vw-menu': m.id },
      el('button', { type: 'button', className: 'vw-menu-btn', role: 'menuitem', 'aria-haspopup': 'true', 'aria-expanded': 'false', 'data-vw-open': m.id }, word('shell.ws.vector.menu.' + m.id, pretty(m.id))), menuPanel(m))));
  }
  /** Greyed or lit as the registry says: done when a menu opens (167 questions would be wasted on every frame). */
  function states(panel) {
    const c = I(); if (!c) return;
    for (const b of panel.querySelectorAll('[data-vw-cmd]')) {
      const id = b.dataset.vwCmd, why = c.why ? c.why(id) : '', cmd = c.commands.find((x) => x.id === id);
      b.setAttribute('aria-disabled', why ? 'true' : 'false'); b.dataset.vwWhy = why || ''; b.title = text(cmd?.label) + (why ? ': ' + why : '');
      const on = target(cmd)?.getAttribute('aria-pressed') === 'true'; b.setAttribute('aria-checked', on ? 'true' : 'false');
    }
  }

  function close() {
    if (!open) return;
    open.btn.setAttribute('aria-expanded', 'false'); open.panel.hidden = true;
    for (const f of open.panel.querySelectorAll('.vw-flyout')) f.hidden = true;
    open = null;
  }
  function show(btn) {
    const panel = btn.parentNode.querySelector('.vw-panel'); if (!panel) return;
    if (open && open.btn !== btn) close();
    states(panel);
    btn.setAttribute('aria-expanded', 'true'); panel.hidden = false; open = { btn, panel };
    panel.style.left = '0px'; const r = panel.getBoundingClientRect(), w = btn.ownerDocument.defaultView.innerWidth;
    if (r.right > w - 4) panel.style.left = Math.round(w - 4 - r.right) + 'px';
  }
  function run(b) {
    const id = b.dataset.vwCmd, c = I(); if (!c) return;
    if (b.getAttribute('aria-disabled') === 'true') { explain(b.getAttribute('aria-label') || id, b.dataset.vwWhy); return; }
    Promise.resolve(c.run(id)).then(() => E.soon()).catch((e) => say(String(e?.message || e), true));
  }

  function mount(o, host) {
    const menus = el('div', { className: 'vw-menus', role: 'menubar', 'aria-label': T('shell.ws.vector.menubar') });
    const title = el('span', { className: 'vw-title' });
    const sh = (sel, cls, label) => el('button', { type: 'button', className: 'ws-shell-btn', 'data-ws-shell': sel, 'aria-label': label, title: label }, el('i', { className: 'bi ' + cls, 'aria-hidden': 'true' }));
    const right = o.shell === false ? null : el('div', { className: 'vw-right' }, sh('[data-help-open]', 'bi-question-circle', word('shell.ws.help', 'Help')), sh('[data-settings-open]', 'bi-gear', word('shell.ws.settings', 'Settings')));
    const bar = el('nav', { className: 'vw-menubar ws-block', 'data-ws-blk': 'menubar', 'aria-label': T('shell.ws.vector.menubar') }, menus, title, right);
    host.append(bar);
    const part = { el: bar, menus, title, sig: null, checked: 0, o };
    // a click opens a menu; while one is open, moving onto the next title switches to it (as menu bars do); anything else closes
    bar.addEventListener('click', (e) => {
      const b = e.target.closest('button'); if (!b) return;
      if (b.dataset.vwOpen) { if (open?.btn === b) close(); else { build(part, true); show(menus.querySelector('[data-vw-open="' + b.dataset.vwOpen + '"]') || b); } return; }
      if (b.dataset.vwSub !== undefined) { const f = b.parentNode.querySelector('.vw-flyout'), on = f.hidden; for (const x of b.closest('.vw-panel').querySelectorAll('.vw-flyout')) x.hidden = true; f.hidden = !on; b.setAttribute('aria-expanded', String(on)); return; }
      if (b.dataset.vwPalette) { window.dispatchEvent(new CustomEvent('cc-vector-palette', { detail: b.dataset.vwPalette })); close(); return; }
      if (b.dataset.vwCmd) { close(); run(b); return; }
      close();   // the engine's own click handler opens the shell's dialogs ([data-ws-shell])
    });
    bar.addEventListener('pointerover', (e) => { const b = e.target.closest?.('[data-vw-open]'); if (b && open && open.btn !== b) show(b); });
    bar.addEventListener('keydown', (e) => {
      const btn = e.target.closest?.('[data-vw-open]'); if (!btn || !['ArrowLeft', 'ArrowRight', 'ArrowDown'].includes(e.key)) return;
      const all = [...bar.querySelectorAll('[data-vw-open]')], i = all.indexOf(btn);
      if (e.key === 'ArrowDown') { e.preventDefault(); show(btn); btn.parentNode.querySelector('.vw-panel .vw-item')?.focus(); return; }
      e.preventDefault(); const next = all[(i + (e.key === 'ArrowRight' ? 1 : all.length - 1)) % all.length]; next.focus(); if (open) show(next);
    });
    part.away = (e) => { if (open && !bar.contains(e.target)) close(); };
    document.addEventListener('pointerdown', part.away, true);
    // Esc closes an open menu before anything else hears it: the window sees it first (the engine and the apps listen at the document)
    part.esc = (e) => { if (e.key === 'Escape' && open) { const b = open.btn; close(); b.focus(); e.preventDefault(); e.stopImmediatePropagation(); } };
    window.addEventListener('keydown', part.esc, true);
    build(part, true);
    if (!I()) { part.ready = () => { if (part.el.isConnected) { build(part, true); E.soon(); } }; window.addEventListener('cc-input-ready', part.ready, { once: true }); }   // the registry boots after some layouts mount
    return part;
  }
  function refresh(part, s) { build(part); part.title.textContent = (s.name || '') + (s.dirty ? ' *' : ''); }
  function destroy(part) { close(); document.removeEventListener('pointerdown', part.away, true); if (part.ready) window.removeEventListener('cc-input-ready', part.ready); window.removeEventListener('keydown', part.esc, true); }
  return { mount, refresh, destroy, close };
}

// ------------------------------------------------------------------ attributes ------------------------------------------------------------------
/** Which controls of the selection's Properties are "attributes", and under which heading (by their words; first match wins). The apps keep their own controls: these are twins. */
export const ATTR_GROUPS = [   // pen words first: "line color" is a pen attribute; a plain width or thickness is a dimension, not an attribute
  ['pen', /line|pen\b|stroke|outline|border|dash|weight/i],
  ['fill', /fill|hatch|pattern|material|texture|finish|opacity|transparen|colou?r/i],
  ['other', /layer|class|level|story|lock|visib|shadow|phase/i],
];
export function attributePick(list, label) {
  const order = ['fill', 'pen', 'other'], out = [];
  for (const f of list) { const g = ATTR_GROUPS.find(([, re]) => re.test(f.label)); if (g) out.push({ ...f, group: g[0], groupLabel: label(g[0]) }); }
  return out.sort((a, b) => order.indexOf(a.group) - order.indexOf(b.group));
}

// ------------------------------------------------------------------ tool palettes ------------------------------------------------------------------
export function toolpalette(E) {
  const { A, T, el, tool, can } = E;
  const label = (id) => A.tool(id, 'toolbox').label;
  const built = (id) => A.tool(id, 'toolbox').built !== false;

  function layout(o = {}) {
    const sets = A.toolbox().map((g) => ({ ...g, tools: g.tools.filter(built) })).filter((g) => g.tools.length);
    const all = sets.flatMap((g) => g.tools), seen = new Set(), basic = [];
    for (const key of (o.basic === 'sketch' ? BASIC_SKETCH : BASIC)) { const id = all.find((t) => !seen.has(t) && iconKey(t, label(t)) === key); if (id) { seen.add(id); basic.push(id); } }
    // an app whose tools are not drawing primitives (steel connections, take-off) would leave Basic nearly empty: top it up from its own sets, in order
    for (const id of all) { if (basic.length >= 12) break; if (!seen.has(id)) { seen.add(id); basic.push(id); } }
    return { sets, basic };
  }

  function cell(id, on, listed) {
    const b = setIcon(tool(id, 'toolbox', !listed), id, label(id), on);
    b.classList.add(listed ? 'vw-row' : 'vw-cell');
    if (!listed) b.querySelector('span')?.classList.add('vw-sr');
    return b;
  }

  const attrs = infoFields(E, { scan: 60, pick: (l) => attributePick(l, (g) => word('shell.ws.vector.attr.' + g, pretty(g))) });
  function mount(o, host) {
    const grid = el('div', { className: 'vw-grid', role: 'group', 'aria-label': word('shell.ws.vector.basic', 'Basic') });
    const setRow = el('div', { className: 'vw-setrow', role: 'tablist', 'aria-label': word('shell.ws.vector.sets', 'Tool Sets') });
    const list = el('div', { className: 'vw-list', role: 'group' });
    const basicBox = el('section', { className: 'vw-pal vw-basic', 'data-vw-pal': 'basic' }, el('header', { className: 'vw-pal-head' }, word('shell.ws.vector.basic', 'Basic')), grid);
    const setsBox = el('section', { className: 'vw-pal vw-sets', 'data-vw-pal': 'sets' }, el('header', { className: 'vw-pal-head' }, word('shell.ws.vector.sets', 'Tool Sets')), list, setRow);
    const attrBody = el('div', { className: 'vw-attrs-body' });
    const attrBox = o.attributes ? el('section', { className: 'vw-pal vw-attrs', 'data-vw-pal': 'attributes' }, el('header', { className: 'vw-pal-head' }, word('shell.ws.vector.attrs', 'Attributes')), attrBody) : null;
    const box = el('nav', { className: 'vw-toolpalette ws-block' + (o.sets === false ? ' vw-strip' : ''), 'data-ws-blk': 'toolpalette', 'aria-label': T('shell.ws.tbx'), style: '--vw-cols:' + (o.columns || 4) }, basicBox, attrBox, setsBox);
    host.append(box);
    const part = { attrBody, el: box, grid, list, setRow, basicBox, setsBox, o, sel: null, sig: null };
    setRow.addEventListener('click', (e) => { const b = e.target.closest('[data-vw-set]'); if (!b) return; part.sel = b.dataset.vwSet; part.sig = null; render(part); E.soon(); });
    render(part);
    return part;
  }
  function render(part, s) {
    if (part.attrBody && s) {
      const n = attrs.render(part.attrBody, s, null);
      let note = part.attrBody.querySelector('.vw-attrs-note');
      if (n) note?.remove();
      else { if (!note) { note = el('p', { className: 'vw-attrs-note' }); part.attrBody.append(note); } note.textContent = s.selection?.length && s.document && !s.other ? word('shell.ws.vector.attr.none', 'No style attributes on this selection') : word('shell.ws.vector.attr.nosel', 'Nothing selected'); }
    }
    const { sets, basic } = layout(part.o);
    const on = part.o.icons === 'set';
    const sig = JSON.stringify([sets.map((g) => [g.id, g.label, g.tools]), basic, part.sel, on, iconStyle()]);
    if (sig === part.sig) return;
    part.sig = sig;
    if (!sets.some((g) => g.id === part.sel)) part.sel = sets[0]?.id || null;
    part.grid.replaceChildren(...basic.map((id) => cell(id, on, false)));
    part.basicBox.hidden = !basic.length;
    const cur = sets.find((g) => g.id === part.sel);
    part.list.replaceChildren(...(cur ? cur.tools.map((id) => cell(id, on, true)) : []));
    part.setRow.replaceChildren(...sets.map((g) => {
      const b = el('button', { type: 'button', className: 'vw-set', role: 'tab', 'data-vw-set': g.id, 'aria-selected': String(g.id === part.sel), title: g.label, 'aria-label': g.label }, el('i', { className: 'bi bi-square', 'aria-hidden': 'true' }));
      setIcon(b, g.tools[0], label(g.tools[0]), on);
      return b;
    }));
    part.setsBox.hidden = (sets.length < 2 && !sets.length) || part.o.sets === false;
    part.setsBox.querySelector('.vw-pal-head').textContent = (cur?.label ? word('shell.ws.vector.sets', 'Tool Sets') + ' · ' + cur.label : word('shell.ws.vector.sets', 'Tool Sets'));
  }
  const word = (k, f) => (window.ccShellT?.has?.(k) ? T(k) : f);
  return { mount, render, can, clear: () => attrs.clear() };
}
