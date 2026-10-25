/* SPDX-License-Identifier: Apache-2.0 */
/**
 * app-workspace.js — the workspace layout engine, one for every app (0.7 WS.6 + WS.17; plan docs/0.7-PART9.md, map
 * docs/apps/app-workspace.md, contributor guide getcadcraft/addons docs/LAYOUTS.md). Lifted from BimCraft's two layouts
 * (Doc's docked ribbon, drsurfbum/bimcraft-SDH F28, and the toolbox and info box) and made data-driven:
 *
 *   a LAYOUT  (`cadcraft-workspace` v1, app-workspace-format.js) says which building blocks go where — the built-ins
 *             (assets/workspaces/*.ccworkspace.json), a build's add-ons of kind `workspace`, and files a person imports all take
 *             the same path: text → importLayout (untrusted, bounded) → resolveLayout against this app → mount;
 *   an ADAPTER (the app's workspace-<slug>.js) fills the blocks with the app's own things: its ribbon, toolbox groups, slots
 *             (controls moved in and back), palettes, views, the state and how to run a tool. Nothing here knows an app.
 *
 * The app calls mountWorkspaces(adapter) once its UI exists. The choice is the shell's (Settings › Global › Layout, localStorage
 * cc-workspace: standard | <built-in id> | addon:<id> | file:<id>; ?workspace=<value> overrides it for one page). The pre-paint mark
 * html[data-cc-ws-boot] (app-shell.inc) is dropped here once the chosen layout is mounted (or classic is kept). At phone widths the
 * chosen layout waits and the phone layout runs (D3); a wider window brings it back. Controls are moved, never copied (comment
 * "homes" mark their places) and go back when classic is picked, so the panel manager, menu styles and add-ons keep working.
 *
 * Adapter (every member optional unless marked; ids are the adapter's own, `block` says which block asks):
 *   app*, root* (<main>), stage* (the drawing area), panels {left, right}, status (the status line, moved into the status bar),
 *   t(key, vars) app text · say(text, bad) · state() → {document, name, dirty, busy, selection[], tool, toolLabel, other}
 *   ribbon() → [{tab, label, context?, groups: [{id, label, large: [id], stacks: [[id]]}]}] · contextTab(state) → tab | null
 *   toolbox() → [{id, label, tools: [id]}] · tool(id, block) → {label, icon: Node | 'bi-…', built} · can(id, block, state) →
 *   {enabled, reason} · run(id, block, button) · pressed(id, block) → bool · actions: [well-known ids it runs]
 *   options(state) → {title, text, cls} · toolOptions(block) → the running tool's options row | null · showProperties()
 *   slots {name: {label, nodes() → [Node]}} · palettes {name: {label, title?: Node, actions?: [Node], body() → Node, foot?: Node, hint?}}
 *   views {list() → [{id, kind, name, icon}], current() → id | null, go(id, mode), token() → any, initial() → id | null}
 *   toolbar() → the app's toolbar element · hide [selectors shown only in classic] · fill / flow (selectors of the drawing's own
 *   parts, inset between the blocks) · escape(e, ctx) → true when it handled Esc · entered(ctx) · leaving(ctx) · left(ctx) · refresh(ctx)
 *   fields(state) → [{label, control}] the picked element's main fields for the info box (default: fieldsIn(the Properties palette))
 *   pet(state) → [registry command ids] for the pet palette (default: the registry's move / copy / rotate / … / delete it has)
 * My tools, the pet palette and the info box's fields live in app-workspace-extras.js (WS.20–WS.22).
 */
import * as F from './app-workspace-format.js';
import { popout, menuButton } from './app-workspace-popout.js';
import { myTools, petPalette, infoFields, fieldsIn, regTool } from './app-workspace-extras.js';
import { showSeq } from './app-input.js';
import { arrangeDialog } from './app-workspace-arrange.js';
import { t as i18nT, has as i18nHas } from './i18n.js';

export { F as format, fieldsIn };   // the pop-out helpers stay inside: a page uses them through api.tearable()
// the shell's words: app-shell.js defines window.ccShellT, which may run after the app mounts; i18n.js reads the same page catalog
const ST = (k, v) => (window.ccShellT ? window.ccShellT(k, v) : i18nT(k, v));
const HAS = (k) => (window.ccShellT?.has ? window.ccShellT.has(k) : i18nHas(k));
const FILES_KEY = 'cc-workspace-files';
const PHONE = '(max-width: 760px)';

export function el(tag, attrs = {}, ...kids) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === null || v === undefined || v === false) continue;
    if (k === 'className') e.className = v; else e.setAttribute(k, v === true ? '' : String(v));
  }
  for (const c of kids.flat(Infinity)) if (c !== null && c !== undefined && c !== false) e.append(c instanceof Node ? c : String(c));
  return e;
}
const btn = (text, attrs = {}) => el('button', { type: 'button', ...attrs }, text);
const isTyping = (t) => !!t?.closest?.('input, textarea, select, [contenteditable]:not([contenteditable="false"])');

/** The page's config (app-shell.inc #cc-workspace): {app, appName, layouts: [built-in ids], builtins: {id: text}, addons: [{id, name, text, …}]}. */
function config() { try { return JSON.parse(document.getElementById('cc-workspace')?.textContent || 'null') || {}; } catch (e) { return {}; } }

/** Files a person imported (Settings › Global › Layout › Import): localStorage cc-workspace-files = {id: text}, shared by every app. */
export function importedFiles() { try { const o = JSON.parse(localStorage.getItem(FILES_KEY) || '{}'); return o && typeof o === 'object' ? o : {}; } catch (e) { return {}; } }
function saveFiles(o) { try { localStorage.setItem(FILES_KEY, JSON.stringify(o)); return true; } catch (e) { return false; } }

/** Every layout this page can offer, each read through importLayout: [{key, source: builtin|addon|file, layout, dropped, error}]. */
export function availableLayouts(cfg = config()) {
  const out = [];
  for (const id of cfg.layouts || []) {
    const text = cfg.builtins?.[id];
    const r = typeof text === 'string' ? F.importLayout(text) : { ok: false, error: 'unknown', dropped: [] };
    out.push({ key: id, source: 'builtin', ...r });
  }
  for (const a of cfg.addons || []) { const r = F.importLayout(a.text); out.push({ key: 'addon:' + (r.layout?.id || a.id), source: 'addon', file: a.file, ...r }); }
  for (const [id, text] of Object.entries(importedFiles())) { const r = F.importLayout(text); out.push({ key: 'file:' + id, source: 'file', ...r }); }
  return out;
}
export const layoutName = (l) => (l.nameKey && HAS(l.nameKey) ? ST(l.nameKey) : l.name);

export function mountWorkspaces(A) {
  const cfg = config();
  // A guest: an app mounted inside another app's page (SuperCad Studio's panels) finds that page's #cc-workspace, made for the host app.
  // The host's engine lays out the page; a guest's engine always keeps its app classic and never registers with the page's Settings
  // (owner 2026-10-24: a second ribbon and title bar inside Super's Site design panel after a recovery re-checked the layout choice).
  const guest = !!(cfg.app && A.app && cfg.app !== A.app);
  const appName = cfg.appName || document.querySelector('[data-app-settings]')?.dataset.appName || A.app;
  // the shell's own keys from the shell's words, the rest from the app; a pattern, never the bare shell prefix as a quoted string:
  // tools/lang/server-keys.mjs reads that as "a script may ask for any shell key" and would flag every @server shell key
  const SHELL_KEY = /^shell\./;
  const T = (k, v) => (SHELL_KEY.test(k) ? ST(k, v) : A.t ? A.t(k, v) : k);
  const say = (text, bad) => (A.say ? A.say(text, bad) : window.ccShellScreen?.say?.(text));
  const root = A.root, stage = A.stage;
  const left = A.panels?.left || null, right = A.panels?.right || null;
  let cur = null;   // {key, layout, blocks: Map(block → opts), parts: {}}
  let frame = 0, retry = 0, told = '', notice = '';   // notice: the last fallback message (Settings shows it too)
  let waiting = null;   // the layout asked for while the app is busy ('standard' = classic): it changes once the app is done
  const caps = () => ({
    ribbon: !!A.ribbon, toolbox: !!A.toolbox, views: !!A.views, toolbar: !!(A.toolbar && A.toolbar()),
    slots: Object.keys(A.slots || {}), palettes: Object.keys(A.palettes || {}), actions: A.actions || F.ACTIONS,
  });
  const state = () => ({ document: null, name: '', dirty: false, busy: false, selection: [], tool: null, ...(A.state ? A.state() : {}) });
  const ctx = {
    get layout() { return cur ? cur.key : null; }, has: (b) => !!cur?.blocks.has(b), block: (b) => cur?.blocks.get(b) || null,
    view: () => openView(), open: (id) => goView(id), palette: (n) => showLower(n), refresh: soon, say, T, el, tool: (id, block, compact) => tool(id, block, compact),
  };

  // ---- moving the app's own nodes in and back: a stack of homes, restored in reverse ----
  const homes = [];
  function move(node, parent, before = null) {
    if (!node || node.parentNode === parent) return;
    if (node.parentNode) { const h = document.createComment('workspace: home'); node.before(h); homes.push([node, h]); }   // i18n-ignore: a comment node
    else homes.push([node, null]);
    if (before) parent.insertBefore(node, before); else parent.append(node);
  }
  function restoreAll() { while (homes.length) { const [n, h] = homes.pop(); if (h?.parentNode) { h.after(n); h.remove(); } else if (!h) n.remove(); } }

  // ---- the choice ----
  function wanted() {
    const q = new URLSearchParams(location.search).get('workspace');
    let v = q === 'live' ? 'docked' : q === 'established' ? 'standard' : q;
    if (!v) v = window.ccShellWorkspace ? window.ccShellWorkspace.get() : (() => { try { return localStorage.getItem('cc-workspace'); } catch (e) { return null; } })();
    return F.layoutRef(v).kind === 'standard' ? null : v;
  }
  const phone = () => !!window.matchMedia && matchMedia(PHONE).matches;
  /** asked = a person picked a layout just now (Settings, the cc-workspace event): only then is a busy app's refusal said */
  function decide(asked = false) {
    asked = asked === true;
    if (guest) return use(null, false);
    const want = wanted();
    if (!want || phone()) return use(null, asked);
    const found = availableLayouts(cfg).find((x) => x.key === want);
    if (!found) { if (F.layoutRef(want).kind === 'file' || F.layoutRef(want).kind === 'addon') tell(want, 'shell.ws.why.unknown'); return use(null, asked); }
    if (!found.ok) { tell(want, 'shell.ws.why.' + found.error); return use(null, asked); }
    const r = F.resolveLayout(found.layout, caps());
    if (!r.ok) { tell(layoutName(found.layout), 'shell.ws.why.nothing'); return use(null, asked); }
    return use({ key: want, layout: found.layout, blocks: new Map(r.blocks.map((b) => [b.block, b])), list: r.blocks, notes: r.notes }, asked);
  }
  function tell(name, why) {
    const s = T('shell.ws.fallback', { name, why: T(why), app: appName });
    if (s !== told) { told = s; say(s, true); }
    notice = s;
  }
  function use(next, asked = false) {
    if ((cur?.key || null) === (next?.key || null)) { waiting = null; clearTimeout(retry); done(); return; }
    // the busy guard: no layout change (in, out or between) while the app imports, saves or builds; it happens once the app is done,
    // and a person who asked for it is told so (shell.ws.busy). On the way in at startup the pre-paint mark stays until then.
    if (state().busy) {
      if (asked) say(T('shell.ws.busy'), true);
      waiting = next ? next.key : 'standard';
      clearTimeout(retry); retry = setTimeout(() => decide(), 400); return;
    }
    waiting = null;
    A.endTool?.();
    if (cur) leave();
    if (next) enter(next);
    done();
    soon();
  }
  function done() { if (!guest) document.documentElement.removeAttribute('data-cc-ws-boot'); }   // the page's mark is the host's to drop

  // ---- regions: around <main>, inside the drawing area ----
  let top = null, bottom = null;
  const regions = new Map();
  function region(place) {
    if (place === 'top') { if (!top) { top = el('div', { className: 'ws-top' }); root.before(top); } return top; }
    if (place === 'bottom') { if (!bottom) { bottom = el('div', { className: 'ws-bottom' }); root.after(bottom); } return bottom; }
    if (place === 'left-panel') return left; if (place === 'right-panel') return right;
    if (!regions.has(place)) { const r = el('div', { className: 'ws-region ws-' + place, 'data-ws-region': place }); stage.append(r); regions.set(place, r); ro.observe(r); }
    return regions.get(place);
  }
  const ro = new ResizeObserver(() => measure());
  function measure() {
    if (!cur) return;
    const h = (p) => { const r = regions.get(p); return r ? r.getBoundingClientRect().height : 0; };
    const w = (p) => { const r = regions.get(p); return r && !r.classList.contains('ws-out') ? r.getBoundingClientRect().width : 0; };
    for (const [v, n] of [['--ws-st', h('stage-top')], ['--ws-sb', h('stage-bottom')], ['--ws-vt', h('view-top')], ['--ws-vb', h('view-bottom')], ['--ws-sl', w('stage-left')], ['--ws-sr', w('stage-right')]]) stage.style.setProperty(v, n + 'px');
  }
  function markFill() {
    if (!cur) return;
    for (const c of stage.children) {
      c.classList.toggle('ws-fill', !!A.fill && c.matches(A.fill) || c.classList.contains('ws-empty-view'));
      c.classList.toggle('ws-flow', !!A.flow && c.matches(A.flow));
    }
  }
  const stageObs = new MutationObserver(() => markFill());

  // ---- shared parts: tool buttons, tooltip, explain dialog ----
  const tool = (id, block, compact = false) => {
    const t = A.tool ? A.tool(id, block) : { label: id };
    const ic = typeof t.icon === 'string' ? el('i', { className: 'bi ' + t.icon + ' ws-icon-bi', 'aria-hidden': 'true' }) : t.icon ? t.icon.cloneNode(true) : el('i', { className: 'bi bi-square ws-icon-bi', 'aria-hidden': 'true' });
    return el('button', { type: 'button', className: 'ws-tool' + (compact ? ' ws-compact' : ''), 'data-ws-command': id, 'data-ws-block': block, 'aria-label': t.label }, ic, el('span', {}, t.label));
  };
  const can = (id, block) => (A.can ? A.can(id, block, state()) : { enabled: true, reason: '' });
  const built = (id, block) => (A.tool ? A.tool(id, block).built !== false : true);
  const tooltip = el('div', { className: 'ws-tooltip', id: 'ws-tool-explanation', role: 'tooltip', hidden: true });
  function explain(label, reason) {
    const dlg = el('dialog', { className: 'ws-dialog ws-explain', 'aria-label': label }, el('h2', {}, label), el('p', {}, reason || T('shell.ws.ready')),
      el('div', { className: 'ws-dialog-actions' }, btn(T('shell.ws.close'), { 'data-ws-dismiss': '' })));
    document.body.append(dlg); dlg.addEventListener('close', () => dlg.remove()); dlg.showModal();
  }
  function runTool(id, block, b) {
    const a = can(id, block);
    if (!a.enabled) { explain(A.tool ? A.tool(id, block).label : id, a.reason); return; }
    b?.closest('dialog')?.close();
    Promise.resolve(A.run ? A.run(id, block, b) : null).then(() => { soon(); toolOptions(); });
  }

  // =========================================================== blocks ===========================================================
  const P = {};   // the mounted parts of the current layout
  // the parts in app-workspace-extras.js get the engine's helpers; made once, used by every layout that has them
  const E = { A, app: A.app, T, el, btn, can, tool, runTool: (id, block, b) => runTool(id, block, b), explain, say, soon: () => soon(), state, stage,
    redraw: () => { if (P.toolbox) { P.toolbox.sig = null; renderToolbox(); refreshToolbox(state()); } } };
  const mine = myTools(E), pet = petPalette(E), fields = infoFields(E);

  // ---- titlebar ----
  function mountTitlebar(o) {
    const fsSrc = document.querySelector('[data-fs-cycle]');
    const shellBtn = (sel, cls, label) => el('button', { type: 'button', className: 'ws-shell-btn', 'data-ws-shell': sel, 'aria-label': label, title: label }, el('i', { className: 'bi ' + cls, 'aria-hidden': 'true' }));
    const fsBtn = el('button', { type: 'button', className: 'ws-shell-btn', 'data-ws-shell': '[data-fs-cycle]', hidden: !fsSrc }, el('i', { className: 'bi bi-fullscreen', 'aria-hidden': 'true' }));
    const fsSync = () => { if (!fsSrc) return; fsBtn.hidden = fsSrc.hidden; fsBtn.title = fsSrc.title; fsBtn.setAttribute('aria-label', fsSrc.getAttribute('aria-label') || fsSrc.title); fsBtn.setAttribute('aria-pressed', fsSrc.getAttribute('aria-pressed') || 'false'); const i = fsSrc.querySelector('i.bi'); if (i) fsBtn.firstChild.className = i.className; };
    let fsObs = null; if (fsSrc) { fsSync(); fsObs = new MutationObserver(fsSync); fsObs.observe(fsSrc, { attributes: true, subtree: true, childList: true }); }
    const bar = document.querySelector('.app-bar');
    const brand = el('span', { className: 'ws-brand' }, bar?.querySelector('.app-bar-mark')?.cloneNode(true) || null, bar?.querySelector('.app-bar-name > .layer-swatch')?.cloneNode(true) || null, el('span', {}, appName));
    const title = el('span', { className: 'ws-project' });
    const h = el('header', { className: 'ws-titlebar ws-block', 'data-ws-blk': 'titlebar' }, brand,
      (o.quick || []).length ? el('div', { className: 'ws-quick', 'aria-label': T('shell.ws.quick') }, o.quick.map((id) => tool(id, 'titlebar', true))) : null, title,
      o.inventory ? btn(T('shell.ws.inventory'), { 'data-ws-inventory': '' }) : null,
      fsBtn, shellBtn('[data-help-open]', 'bi-question-circle', T('shell.ws.help')), shellBtn('[data-settings-open]', 'bi-gear', T('shell.ws.settings')));
    region(o.place).append(h);
    P.titlebar = { el: h, title, off: () => fsObs?.disconnect() };
  }

  // ---- ribbon ----
  let tab = null, collapsed = false, peeking = false, rwin = null, rbox = null, rsync = null, rmenu = null;
  const ribbonHome = document.createComment('workspace: ribbon home');   // i18n-ignore: a comment node
  const COLLAPSE_KEY = 'cc-ws-ribbon:' + A.app;
  function mountRibbon(o) {
    const tabsEl = el('nav', { className: 'ws-ribbon-tabs ws-block', 'data-ws-blk': 'ribbon', role: 'tablist', 'aria-label': T('shell.ws.ribbon') });
    const ribbon = el('div', { className: 'ws-ribbon ws-block', role: 'tabpanel', id: 'ws-ribbon-panel' });
    const r = region(o.place); r.append(tabsEl, ribbon);
    // the person's own choice (cc-ws-ribbon:<app> = collapsed | open) wins over the layout's start (o.collapsed)
    collapsed = !!o.collapse && (() => { try { const v = localStorage.getItem(COLLAPSE_KEY); return v ? v === 'collapsed' : !!o.collapsed; } catch (e) { return !!o.collapsed; } })();
    r.classList.toggle('ws-collapsed', collapsed);
    P.ribbon = { tabs: tabsEl, ribbon, region: r, o };
    renderRibbonTabs();
  }
  const ribbonData = () => (A.ribbon ? A.ribbon() : []);
  function tabsShown() {
    const ctxTab = A.contextTab ? A.contextTab(state()) : null;
    return ribbonData().filter((t) => (t.context ? t.tab === ctxTab : true) && t.groups.some((g) => [...g.large, ...g.stacks.flat()].some((id) => id !== 'select' && built(id, 'ribbon'))));
  }
  function renderRibbonTabs() {
    const R = P.ribbon; if (!R) return;
    const shown = tabsShown();
    const ctxTab = A.contextTab ? A.contextTab(state()) : null;
    if (ctxTab && shown.some((t) => t.tab === ctxTab) && R.ctxTab !== ctxTab) tab = ctxTab;
    if (!ctxTab && R.ctxTab && tab === R.ctxTab) tab = null;
    R.ctxTab = ctxTab;
    if (!shown.some((t) => t.tab === tab)) tab = shown[0]?.tab || null;
    R.tabs.replaceChildren(...[(R.o.file || []).length ? btn(T('shell.ws.file'), { className: 'ws-file-tab', 'data-ws-file': '' }) : null,
      ...shown.map((t) => btn(t.label, { role: 'tab', id: 'ws-tab-' + t.tab, 'aria-selected': String(t.tab === tab), 'aria-controls': 'ws-ribbon-panel',
        tabindex: t.tab === tab ? 0 : -1, 'data-ws-tab': t.tab, className: t.context ? 'ws-context-tab' : '' })),
      R.o.tearOff || R.o.collapse ? el('button', { type: 'button', className: 'ws-tear shell-grip-btn', 'data-ws-ribbon-menu': '', 'aria-haspopup': 'menu', 'aria-expanded': 'false', title: T('shell.ws.ribbon.menu'), 'aria-label': T('shell.ws.ribbon.menu') },
        el('i', { className: 'bi bi-three-dots', 'aria-hidden': 'true' })) : null].filter(Boolean));   // never a null to replaceChildren: it prints "null"
    R.sig = JSON.stringify([shown.map((t) => t.tab), tab]);
    renderRibbon();
  }
  function renderRibbon() {
    const R = P.ribbon; if (!R) return;
    const t = ribbonData().find((x) => x.tab === tab);
    R.ribbon.setAttribute('aria-label', t?.label || '');
    R.ribbon.replaceChildren(...(t?.groups || []).map((g) => el('section', { className: 'ws-group', 'aria-label': g.label },
      el('div', { className: 'ws-group-tools' }, g.large.map((id) => tool(id, 'ribbon')), g.stacks.map((ids) => el('div', { className: 'ws-stack' }, ids.map((id) => tool(id, 'ribbon'))))),
      el('span', { className: 'ws-group-title' }, g.label))));
    refreshTools();
  }
  function setCollapsed(on) {
    const R = P.ribbon; if (!R) return;
    collapsed = !!on; peek(false);
    try { localStorage.setItem(COLLAPSE_KEY, collapsed ? 'collapsed' : 'open'); } catch (e) { /* this page only */ }
    R.region.classList.toggle('ws-collapsed', collapsed);
    say(T(collapsed ? 'shell.ws.ribbon.collapsed' : 'shell.ws.ribbon.pinned'));
    resized();
  }
  function peek(on) {
    const R = P.ribbon; if (!R) return;
    peeking = !!on && collapsed;
    R.region.classList.toggle('ws-peek', peeking);
    if (peeking) R.region.style.setProperty('--ws-peek-top', (R.tabs.offsetTop + R.tabs.offsetHeight) + 'px');
  }
  /** The File tab's menu (owner 2026-10-24: the old File dialog was "too tiny for the function"): a drop-down under the tab, like the
   *  ribbon's own menus — the layout's file actions (o.file, run as every ribbon tool) and then every other File command of the app's
   *  registry (New, Save as, Print, Export…), each with its shortcut; arrows move, Esc or a click elsewhere closes it, a pick runs it. */
  let fmenu = null;
  function closeFileMenu() { if (!fmenu) return; fmenu.box.remove(); fmenu.btn.setAttribute('aria-expanded', 'false'); fmenu.d.removeEventListener('pointerdown', fmenu.away, true); fmenu = null; }
  function fileMenu(b) {
    const again = fmenu?.btn === b; closeFileMenu(); if (again) return;
    const d = b.ownerDocument, I = window.ccInput;
    const keyOf = (id) => { const k = I?.keysOf?.(id)?.[0]; return k ? showSeq(k) : ''; };
    const row = (attrs, icon, label, keys, off, why) => {
      const ic = typeof icon === 'string' ? el('i', { className: 'bi ' + icon, 'aria-hidden': 'true' }) : icon ? icon.cloneNode(true) : el('i', { className: 'bi bi-dot', 'aria-hidden': 'true' });
      return el('button', { type: 'button', role: 'menuitem', tabindex: -1, className: 'ws-file-item', 'aria-disabled': off ? 'true' : 'false', title: off ? why : label, ...attrs },
        ic, el('span', { className: 'ws-file-label' }, label), keys ? el('kbd', {}, keys) : null);
    };
    const seen = new Set(), rows = [];
    for (const id of P.ribbon.o.file || []) {
      const t = A.tool ? A.tool(id, 'file') : { label: id }, a = can(id, 'file');
      seen.add(t.label.toLowerCase());
      rows.push(row({ 'data-ws-file-action': id }, t.icon, t.label, keyOf('file.' + id) || keyOf(id), !a.enabled, a.reason));
    }
    const more = (I?.commands || []).filter((c) => c.group === 'file').map((c) => [c.id, regTool(c.id)]).filter(([, t]) => t.built && !seen.has(t.label.toLowerCase()));
    if (more.length && rows.length) rows.push(el('div', { className: 'ws-file-sep', role: 'separator' }));
    for (const [id, t] of more) { const w = I.why ? I.why(id) : ''; rows.push(row({ 'data-ws-file-cmd': id }, t.icon, t.label, keyOf(id), !!w, w)); }
    const box = el('div', { className: 'ws-file-menu', role: 'menu', 'aria-label': T('shell.ws.file') }, rows);
    d.body.append(box);
    const r = b.getBoundingClientRect(), vw = d.defaultView.innerWidth, vh = d.defaultView.innerHeight;
    box.style.left = Math.max(4, Math.min(r.left, vw - box.offsetWidth - 4)) + 'px'; box.style.top = (r.bottom + 2) + 'px';
    box.style.maxHeight = Math.max(160, vh - r.bottom - 12) + 'px';
    const list = [...box.querySelectorAll('[role="menuitem"]')];
    box.addEventListener('keydown', (e) => {
      const k = list.indexOf(d.activeElement);
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); list[(k + (e.key === 'ArrowDown' ? 1 : -1) + list.length) % list.length].focus(); }
      else if (e.key === 'Home' || e.key === 'End') { e.preventDefault(); list[e.key === 'Home' ? 0 : list.length - 1].focus(); }
      else if (e.key === 'Escape' || e.key === 'Tab') { e.preventDefault(); e.stopPropagation(); closeFileMenu(); b.focus(); }
    });
    box.addEventListener('click', (e) => {
      const m = e.target.closest('[role="menuitem"]'); if (!m) return;
      e.stopPropagation();
      const label = m.querySelector('.ws-file-label').textContent;
      if (m.getAttribute('aria-disabled') === 'true') { closeFileMenu(); explain(label, m.title); return; }
      closeFileMenu();
      if (m.dataset.wsFileAction) runTool(m.dataset.wsFileAction, 'file', b);
      else Promise.resolve(I?.run(m.dataset.wsFileCmd)).then(() => soon());   // inside the click: a save dialog or a new window may open
    });
    const away = (e) => { if (!box.contains(e.target) && !b.contains(e.target)) closeFileMenu(); };
    d.addEventListener('pointerdown', away, true);
    fmenu = { box, btn: b, d, away }; b.setAttribute('aria-haspopup', 'menu'); b.setAttribute('aria-expanded', 'true'); list[0]?.focus();
  }
  function closeRibbonMenu() { if (!rmenu) return; rmenu.ul.remove(); rmenu.btn.setAttribute('aria-expanded', 'false'); rmenu.d.removeEventListener('pointerdown', rmenu.away, true); rmenu = null; }
  function ribbonMenu(b) {
    const again = rmenu?.btn === b; closeRibbonMenu(); if (again) return;
    const R = P.ribbon, d = b.ownerDocument, torn = !!rwin && !rwin.closed;
    const items = torn ? [[T('shell.ws.tear.back'), 'bi-box-arrow-in-down-left', () => dockRibbon()]]
      : [R.o.tearOff ? [T('shell.ws.tear'), 'bi-window-plus', () => tearOff()] : null,
        R.o.collapse ? (collapsed ? [T('shell.ws.ribbon.pin'), 'bi-pin-angle', () => setCollapsed(false)] : [T('shell.ws.ribbon.collapse'), 'bi-arrows-collapse', () => setCollapsed(true)]) : null].filter(Boolean);
    const ul = d.createElement('ul'); ul.className = 'shell-panel-menu'; ul.setAttribute('role', 'menu'); ul.setAttribute('aria-label', T('shell.ws.ribbon.menu'));
    for (const [label, ic, run] of items) {
      const li = d.createElement('li'); li.setAttribute('role', 'none');
      const m = d.createElement('button'); m.type = 'button'; m.setAttribute('role', 'menuitem'); m.tabIndex = -1;
      const i = d.createElement('i'); i.className = 'bi ' + ic; i.setAttribute('aria-hidden', 'true'); m.append(i, ' ' + label);
      m.addEventListener('click', (e) => { e.stopPropagation(); closeRibbonMenu(); run(); });   // a click: the window may open (a pop-up needs one)
      li.append(m); ul.append(li);
    }
    d.body.append(ul);
    const rb = b.getBoundingClientRect(), mr = ul.getBoundingClientRect(), vw = d.defaultView.innerWidth;
    ul.style.left = Math.max(4, Math.min(rb.right - mr.width, vw - mr.width - 4)) + 'px'; ul.style.top = (rb.bottom + 2) + 'px';
    const list = [...ul.querySelectorAll('[role="menuitem"]')];
    ul.addEventListener('keydown', (e) => {
      const k = list.indexOf(d.activeElement);
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); list[(k + (e.key === 'ArrowDown' ? 1 : -1) + list.length) % list.length].focus(); }
      else if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); closeRibbonMenu(); b.focus(); }
    });
    const away = (e) => { if (!ul.contains(e.target) && !b.contains(e.target)) closeRibbonMenu(); };
    d.addEventListener('pointerdown', away, true);
    rmenu = { ul, btn: b, d, away }; b.setAttribute('aria-expanded', 'true'); list[0]?.focus();
  }
  /** The ribbon in its own window: one same-origin pop-up opened inside the click; the tab row and the ribbon move into it (their nodes,
   *  so handlers and state go along); stylesheets, theme, interface size and toolbar style copied and kept in step; keys reach the app. */
  function tearOff() {
    closeRibbonMenu();
    const R = P.ribbon;
    const w = window.open('', 'cc-ribbon-' + A.app, 'popup,width=' + Math.min(screen.availWidth || 1400, 1400) + ',height=' + Math.round(13.5 * parseFloat(getComputedStyle(document.documentElement).fontSize)));
    if (!w) { say(T('shell.ws.tear.blocked'), true); return; }
    rwin = w;
    const d = w.document;
    d.open(); d.write('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head><body></body></html>'); d.close();   // i18n-ignore: markup
    d.title = T('shell.ws.tear.title', { app: appName });
    for (const l of document.querySelectorAll('link[rel="stylesheet"], style')) { const c = d.importNode(l, true); if (l.href) c.href = l.href; d.head.append(c); }
    const sync = () => {
      for (const a of ['data-space', 'data-theme', 'style', 'lang', 'dir']) { const v = document.documentElement.getAttribute(a); if (v === null) d.documentElement.removeAttribute(a); else d.documentElement.setAttribute(a, v); }
      d.body.className = document.body.className + ' ws-ribbon-window';
      for (const a of ['data-shell-tb', 'data-shell-tb-touch']) { const v = document.body.getAttribute(a); if (v === null) d.body.removeAttribute(a); else d.body.setAttribute(a, v); }
    };
    sync(); rsync = new MutationObserver(sync); rsync.observe(document.body, { attributes: true }); rsync.observe(document.documentElement, { attributes: true });
    rbox = el('div', { className: 'ws-ribbon-box' });
    for (const [type, fn, capture] of listeners) rbox.addEventListener(type, fn, capture);
    R.tabs.before(ribbonHome);
    d.body.append(rbox); rbox.append(R.tabs, R.ribbon);
    d.addEventListener('keydown', (e) => {
      if (isTyping(e.target) || e.target.closest?.('.ws-ribbon-tabs [role="tab"]')) return;
      const ev = new KeyboardEvent('keydown', { key: e.key, code: e.code, ctrlKey: e.ctrlKey, shiftKey: e.shiftKey, altKey: e.altKey, metaKey: e.metaKey, bubbles: true, cancelable: true });
      document.body.dispatchEvent(ev); if (ev.defaultPrevented) e.preventDefault();
    });
    w.addEventListener('pagehide', () => dockRibbon(true));
    renderRibbonTabs(); resized();
    say(T('shell.ws.tear.done'));
  }
  function dockRibbon(closing = false) {
    if (!rbox) return;
    closeRibbonMenu(); rsync?.disconnect(); rsync = null;
    const R = P.ribbon;
    if (ribbonHome.parentNode && R) { ribbonHome.after(R.tabs, R.ribbon); ribbonHome.remove(); }
    const w = rwin; rwin = null; rbox = null;
    if (!closing && w && !w.closed) w.close();
    if (R) renderRibbonTabs();
    resized();
  }
  window.addEventListener('pagehide', () => { if (rwin && !rwin.closed) rwin.close(); });

  // ---- options bar ----
  function mountOptions(o) {
    const bar = el('div', { className: 'ws-options ws-block', 'data-ws-blk': 'options' }, el('strong', {}), el('span', { 'data-ws-options-text': '' }),
      el('div', { className: 'ws-tool-options', 'data-ws-tool-options': '' }), (o.commands || []).map((id) => tool(id, 'options', true)));
    if (A.optionsExtra) move(A.optionsExtra(ctx), bar);
    region(o.place).append(bar);
    P.options = { el: bar };
  }
  let optsRow = null, optsHome = null, optsBlock = null;
  /** The running tool's options row shows in the options bar or the info box's tool slot while the tool runs; it goes home after. */
  function toolOptions(back = false) {
    const block = P.options ? 'options' : P.infobox?.tool ? 'infobox' : null;
    const want = !back && cur && block && A.toolOptions ? A.toolOptions(block) : null;
    if (optsRow && (optsRow !== want || optsBlock !== block)) { optsHome.after(optsRow); optsHome.remove(); optsRow = null; optsHome = null; }
    if (want && !optsRow) {
      optsHome = document.createComment('workspace: tool options home'); want.before(optsHome);   // i18n-ignore: a comment node
      (block === 'options' ? P.options.el.querySelector('[data-ws-tool-options]') : P.infobox.tool.querySelector('.tbx-ig-body')).prepend(want);
      optsRow = want; optsBlock = block;
    }
    P.options?.el.classList.toggle('ws-has-tool-options', !!optsRow && block === 'options');
  }

  // ---- the app's own toolbar ----
  function mountToolbar(o) {
    const tb = A.toolbar(); if (!tb) return;
    if (o.place === 'none') { tb.classList.add('ws-hide'); P.toolbar = { el: tb, hidden: true }; return; }
    move(tb, region(o.place)); tb.classList.add('ws-toolbar-strip');
    P.toolbar = { el: tb };
  }

  // ---- info box ----
  function mountInfobox(o) {
    const box = el('div', { className: 'tbx-info ws-block', 'data-ws-blk': 'infobox', role: 'toolbar', 'aria-label': T('shell.ws.info') });
    const parts = {};
    for (const s of o.slots) {
      const sec = el('section', { className: 'tbx-ig' + (s === 'tool' ? ' tbx-ig-tool' : ''), 'data-tbx-ig': s },
        el('div', { className: 'tbx-ig-title' }, s === 'tool' ? '' : A.slots[s].label), el('div', { className: 'tbx-ig-body' }));
      box.append(sec); parts[s] = sec;
      if (s !== 'tool') for (const n of A.slots[s].nodes(ctx)) move(n, sec.querySelector('.tbx-ig-body'));
    }
    region(o.place).append(box);
    const selNote = el('span', { className: 'tbx-sel' });
    const props = A.showProperties ? el('button', { type: 'button', className: 'ws-props-btn', 'data-ws-props': '' }, el('i', { className: 'bi bi-card-list', 'aria-hidden': 'true' }), el('span', {}, T('shell.ws.props'))) : null;
    P.infobox = { el: box, tool: parts.tool || null, selNote, props };
  }
  function refreshInfobox(s) {
    const I = P.infobox; if (!I?.tool) return;
    const running = s.tool && s.tool !== 'select';
    I.tool.querySelector('.tbx-ig-title').textContent = running ? s.toolLabel || T('shell.ws.ig.tool') : T('shell.ws.ig.selection');
    const body = I.tool.querySelector('.tbx-ig-body');
    if (!running) {
      const n = s.selection?.length || 0;
      I.selNote.textContent = !s.document ? T('shell.ws.sel.nodoc') : n ? T('shell.ws.sel.n', { n }) : T('shell.ws.sel.none');
      if (I.selNote.parentNode !== body) body.append(I.selNote);
      if (I.props) { if (I.props.parentNode !== body) body.append(I.props); I.props.hidden = !n; }
      fields.render(body, s, I.selNote);   // the picked element's main fields, before the note (WS.20)
    } else { I.selNote.remove(); I.props?.remove(); fields.clear(); }
  }

  // ---- toolbox ----
  let tbPop = null;
  function mountToolbox(o) {
    const list = el('div', { className: 'tbx-groups' });
    const head = el('div', { className: 'tbx-head' }, el('span', {}, T('shell.ws.tbx')));
    const box = el('nav', { className: 'tbx-toolbox ws-block', 'data-ws-blk': 'toolbox', 'aria-label': T('shell.ws.tbx') }, head, list);
    if (o.tearOff) head.append(menuButton({ t: T, label: T('shell.ws.toolbox.menu'), backLabel: T('shell.ws.toolbox.back'), isOpen: () => !!tbPop?.isOpen(),
      open: () => { if (!tbOpen()) say(T('shell.ws.tear.blocked'), true); }, back: () => tbPop?.back() }));
    region(o.place).append(box);
    P.toolbox = { el: box, list, o };
    renderToolbox();
  }
  function tbOpen() {
    const reg = regions.get(cur.blocks.get('toolbox').place);
    if (!tbPop) tbPop = popout({ name: 'toolbox-' + A.app, nodes: [P.toolbox.el], cls: 'tbx-popout', listeners,
      title: () => T('shell.ws.toolbox.window', { app: appName }), size: () => ({ w: 300, h: Math.min(screen.availHeight || 900, 900) }),
      onChange: (open) => { reg?.classList.toggle('ws-out', open); measure(); soon(); } });
    return tbPop.open();
  }
  /** Drawn on mount and again whenever toolbox()'s groups, names or built tools change (an app whose groups follow its own workspace,
   *  a group an add-on adds), as the ribbon redraws on its tab signature; folded groups stay folded and the focused tool keeps the focus. */
  function renderToolbox() {
    const X = P.toolbox; if (!X) return;
    const groups = A.toolbox().map((g) => ({ ...g, tools: g.tools.filter((id) => built(id, 'toolbox')) }));
    const sig = JSON.stringify([groups.map((g) => [g.id, g.label, g.tools]), X.o.mine ? mine.sig() : null]);
    if (sig === X.sig) return;
    X.sig = sig;
    const shut = new Set([...X.list.querySelectorAll('details.tbx-group:not([open])')].map((d) => d.dataset.tbxGroup));
    const focused = X.list.contains(X.list.ownerDocument.activeElement) ? X.list.ownerDocument.activeElement.dataset?.tbxTool : null;
    X.list.replaceChildren(...groups.map((g) => {
      const tools = g.tools.map((id) => {
        const t = A.tool(id, 'toolbox');
        const ic = typeof t.icon === 'string' ? el('i', { className: 'bi ' + t.icon, 'aria-hidden': 'true' }) : t.icon ? t.icon.cloneNode(true) : el('i', { className: 'bi bi-square', 'aria-hidden': 'true' });
        return el('button', { type: 'button', className: 'tbx-tool', 'data-tbx-tool': id, 'aria-pressed': 'false', title: t.label, draggable: X.o.mine ? 'true' : null }, ic, el('span', {}, t.label));
      });
      if (!tools.length) return null;
      const body = el('div', { className: 'tbx-tools' }, tools);
      return X.o.collapse ? el('details', { className: 'tbx-group', open: !shut.has(g.id), 'data-tbx-group': g.id }, el('summary', {}, g.label), body)
        : el('section', { className: 'tbx-group', 'data-tbx-group': g.id }, el('div', { className: 'tbx-group-title' }, g.label), body);
    }).filter(Boolean));
    if (X.o.mine) X.list.prepend(mine.group(X.o, shut));
    if (focused) X.list.querySelector('[data-tbx-tool="' + CSS.escape(focused) + '"]')?.focus();
  }
  function refreshToolbox(s) {
    const X = P.toolbox; if (!X) return;
    for (const b of all('[data-tbx-tool]')) {
      const id = b.dataset.tbxTool, a = can(id, 'toolbox');
      b.setAttribute('aria-pressed', A.pressed && A.pressed(id, 'toolbox') ? 'true' : 'false');
      b.setAttribute('aria-disabled', a.enabled ? 'false' : 'true');
      b.title = A.tool(id, 'toolbox').label + (a.enabled ? '' : ' — ' + a.reason);
    }
    if (X.o.mine) mine.refresh(X.list);
  }

  // ---- palettes ----
  function mountPalettes(o) {
    const host = region(o.place);
    if (!host) return;
    const pal = A.palettes || {};
    // a palette's label may depend on the panel it is in (label(place)): the host panel's own content is "Model" on the left, the right panel's tabs elsewhere
    const named = (x) => (typeof x === 'function' ? x(o.place) : x);
    // an adapter's plain "panel" label names its LEFT panel's content (the ribbon layout's place); in the right panel it is "More panels"
    const panelLabel = () => (typeof pal.panel?.label === 'function' ? pal.panel.label(o.place) : o.place === 'right-panel' ? T('shell.ws.panel.right') : pal.panel?.label);
    const label = (n) => (n === 'panel' ? panelLabel() || T('shell.ws.panel') : named(pal[n]?.label) || n);
    const dom = (n) => (n === 'panel' ? 'model' : n);   // the host panel's own content keeps the DOM name it had in BimCraft (tests, styles)
    let upper = null;
    if (o.upper) {
      const p = pal[o.upper];
      upper = el('section', { className: 'ws-properties ws-palette', 'data-ws-palette': o.upper, 'aria-label': label(o.upper) },
        el('header', { className: 'ws-palette-heading' }, p.title || el('span', {}, label(o.upper)), ...(p.actions || [])),
        el('div', { className: 'ws-palette-scroll', ['data-ws-' + (o.upper === 'properties' ? 'properties' : dom(o.upper)) + '-scroll']: '' }), p.foot || null);
    }
    const lower = o.lower || [];
    const slots = {};
    const tabs = el('div', { className: 'ws-lower-tabs', role: 'tablist', 'aria-label': T('shell.ws.lower') },
      lower.map((n, i) => btn(label(n), { role: 'tab', 'data-ws-lower': dom(n), 'aria-selected': String(i === 0), tabindex: i === 0 ? 0 : -1 })));
    const hints = {};
    for (const [i, n] of lower.entries()) {
      slots[n] = el('div', { className: 'ws-palette-scroll' + (n === 'panel' ? ' ws-model-slot' : ''), ['data-ws-' + dom(n) + '-scroll']: '', hidden: i > 0 });
      if (pal[n]?.hint) hints[n] = el('p', { className: 'ws-browser-hint', hidden: i > 0 }, pal[n].hint);
    }
    const lowerEl = lower.length ? el('section', { className: 'ws-browser ws-palette', 'aria-label': T('shell.ws.lower') }, el('header', { className: 'ws-palette-heading' }, tabs),
      ...lower.flatMap((n) => [hints[n] || null, slots[n]])) : null;
    const split = upper && lowerEl ? el('div', { className: 'ws-hsplit', role: 'separator', tabindex: 0, 'aria-orientation': 'horizontal', 'aria-label': T('shell.ws.split.h'), 'aria-valuemin': 25, 'aria-valuemax': 75, 'aria-valuenow': 50 }) : null;
    const palettes = el('div', { className: 'ws-palettes' + (upper && lowerEl ? '' : ' ws-one') }, upper, split, lowerEl);
    // the panel's own content goes to its palette tab (or stays hidden until the layout ends)
    const kids = [...host.children].filter((k) => !k.classList.contains('shell-grip') && !k.classList.contains('shell-float-size'));
    if (slots.panel) for (const k of kids) move(k, slots.panel); else for (const k of kids) k.classList.add('ws-hide');
    host.append(palettes); host.classList.add('ws-panel-host');
    if (upper) move(pal[o.upper].body(), upper.querySelector('.ws-palette-scroll'));
    P.palettes = { el: palettes, host, slots, lower, tabs, hints, kids, upper, upperName: o.upper || null, label, dom, name: [o.upper ? label(o.upper) : null, lower[0] ? label(lower[0]) : null].filter(Boolean).join(' · ') };
    showLower(lower[0]);
    if (split) {
      let height = 50;
      const resize = (v) => { height = Math.max(25, Math.min(75, v)); palettes.style.setProperty('--ws-props', height + '%'); split.setAttribute('aria-valuenow', Math.round(height)); };
      split.addEventListener('pointerdown', (e) => { if (e.button !== 0) return; e.preventDefault(); split.setPointerCapture(e.pointerId); split.dataset.dragging = 'true'; });
      split.addEventListener('pointermove', (e) => { if (split.hasPointerCapture(e.pointerId)) { const r = palettes.getBoundingClientRect(); resize((e.clientY - r.top) / r.height * 100); } });
      split.addEventListener('pointerup', (e) => { if (split.hasPointerCapture(e.pointerId)) split.releasePointerCapture(e.pointerId); delete split.dataset.dragging; });
      split.addEventListener('keydown', (e) => { if (['ArrowUp', 'ArrowDown'].includes(e.key)) { e.preventDefault(); resize(height + (e.key === 'ArrowDown' ? 5 : -5)); } });
    }
    for (const [type, fn, capture] of listeners) palettes.addEventListener(type, (e) => { if (palettes.ownerDocument !== document) fn(e); }, capture);   // a panels window: events stay there
  }
  function showLower(which) {
    const Q = P.palettes; if (!Q || !which) return;
    const n = Q.lower.find((x) => Q.dom(x) === which || x === which) || Q.lower[0];
    for (const b of Q.tabs.querySelectorAll('[data-ws-lower]')) { const on = b.dataset.wsLower === Q.dom(n); b.setAttribute('aria-selected', on ? 'true' : 'false'); b.tabIndex = on ? 0 : -1; }
    for (const x of Q.lower) { Q.slots[x].hidden = x !== n; if (Q.hints[x]) Q.hints[x].hidden = x !== n; }
    Q.shown = n;
  }
  function refreshPalettes() {
    const Q = P.palettes; if (!Q) return;
    for (const n of Q.lower) if (n !== 'panel') { const b = A.palettes[n].body(); if (b && b.parentNode !== Q.slots[n]) move(b, Q.slots[n]); }
    if (Q.upperName && Q.upperName !== 'panel') { const b = A.palettes[Q.upperName].body(), into = Q.upper.querySelector('.ws-palette-scroll'); if (b && b.parentNode !== into) move(b, into); }   // a body that comes later (a browser filled once a file opens)
    // a section added to the host panel after the layout mounted (an add-on's panel, a tool's late section) joins the panel's own content
    for (const k of [...Q.host.children]) {
      // the shell's own handles stay (grip, float size, dock splits, resize separators); an add-on's section (.shell-addon-section) moves
      if (k === Q.el || Q.kids.includes(k) || /(^|\s)(shell-grip|shell-float-size|shell-dock-split|ws-)/.test(k.className) || k.getAttribute('role') === 'separator' || k.nodeName === 'TEMPLATE' || k.hasAttribute('data-ws-keep')) continue;   // data-ws-keep: the page's own marker in the panel (SuperCad Studio's "put the panels back" strip)
      Q.kids.push(k);
      if (Q.slots.panel) move(k, Q.slots.panel); else k.classList.add('ws-hide');
    }
    const g = Q.host.querySelector('.shell-grip-name');   // the shell adds the grip; it may come after the layout mounts
    if (g && Q.name) { if (!g.dataset.wsName) g.dataset.wsName = g.textContent; if (g.textContent !== Q.name) g.textContent = Q.name; }
  }

  // ---- view tabs ----
  let opened = [], active = null, token;
  function mountViewtabs(o) {
    const r = region(o.place);
    if (o.mode === 'all') { const t = el('div', { className: 'tbx-tabs ws-block', 'data-ws-blk': 'viewtabs', role: 'tablist', 'aria-label': T('shell.ws.views') }); r.append(t); P.viewtabs = { el: t, o }; }
    else {
      const t = el('div', { className: 'ws-drawing-tabs ws-block', 'data-ws-blk': 'viewtabs', role: 'tablist', 'aria-label': T('shell.ws.views') }); r.append(t);
      const empty = el('div', { className: 'ws-empty-view' }, el('p', {}, T('shell.ws.empty')), el('p', {}, T('shell.ws.empty.more')), A.views.empty ? A.views.empty(ctx) : null);
      stage.append(empty);
      P.viewtabs = { el: t, o, empty };
      opened = []; active = null; token = undefined;
    }
  }
  const views = () => (A.views ? A.views.list() : []);
  /** The view on screen: in 'open' mode the active tab (null = none open), in 'all' mode what the app says. */
  function openView() {
    if (!A.views) return null;
    const mode = cur?.blocks.get('viewtabs')?.mode;
    const id = mode === 'open' ? active : A.views.current();
    return views().find((v) => v.id === id) || null;
  }
  function goView(id) {
    const mode = cur?.blocks.get('viewtabs')?.mode || 'all';
    if (mode === 'open') { if (!opened.includes(id)) opened.push(id); active = id; }
    A.views.go(id, mode, ctx); soon();
  }
  function closeView(id) {
    const i = opened.indexOf(id); if (i < 0) return;
    opened.splice(i, 1);
    if (active === id) { active = opened[Math.min(i, opened.length - 1)] || null; if (active) A.views.go(active, 'open', ctx); }
    soon();
  }
  function refreshViewtabs(s) {
    const V = P.viewtabs; if (!V) return;
    const list = views();
    if (V.o.mode === 'open') {
      const tk = A.views.token ? A.views.token() : s.document;
      if (tk !== token) { token = tk; opened = []; active = null; const first = tk ? A.views.initial?.() : null; if (first) { opened = [first]; active = first; } }
      opened = opened.filter((id) => list.some((v) => v.id === id)); if (active && !opened.includes(active)) active = opened[0] || null;
      const sig = JSON.stringify([opened.map((id) => [id, list.find((v) => v.id === id)?.name]), active]);
      if (sig !== V.sig) {
        V.sig = sig;
        V.el.replaceChildren(...opened.map((id) => { const v = list.find((x) => x.id === id); return el('div', { className: 'ws-drawing-tab', role: 'presentation' },
          btn([el('i', { className: 'bi ' + (v.icon || 'bi-square'), 'aria-hidden': 'true' }), ' ' + v.name], { role: 'tab', 'data-ws-drawing': id, 'aria-selected': String(active === id) }),
          btn('×', { 'aria-label': T('shell.ws.close.view', { name: v.name }), 'data-ws-close': id })); }));   // i18n-ignore: a close glyph
      }
      stage.classList.toggle('ws-no-view', !!s.document && !active);
      V.empty.hidden = !s.document || !!active;
    } else {
      const now = A.views.current();
      const sig = JSON.stringify([list.map((v) => [v.id, v.name]), now]);
      if (sig !== V.sig) {
        V.sig = sig;
        V.el.replaceChildren(...list.map((v) => btn([el('i', { className: 'bi ' + (v.icon || 'bi-square'), 'aria-hidden': 'true' }), el('span', {}, v.name)],
          { role: 'tab', className: 'tbx-tab', 'data-ws-view': v.id, 'aria-selected': String(v.id === now), tabindex: v.id === now ? 0 : -1 })));
        V.el.hidden = !list.length;
      }
    }
  }

  // ---- view bar, quick bar (slots), status bar ----
  function mountSlotsBar(o, cls, label) {
    const bar = el('div', { className: cls + ' ws-block', 'data-ws-blk': cls === 'tbx-quick' ? 'quickbar' : 'viewbar', role: 'toolbar', 'aria-label': label });
    if (cls === 'ws-view-controls') bar.append(el('span', { className: 'ws-drawing-title' }));
    for (const s of o.slots || []) for (const n of A.slots[s].nodes(ctx)) move(n, bar);
    region(o.place).append(bar);
    return { el: bar };
  }
  function mountStatusbar(o) {
    const slot = el('span', { className: 'ws-status-slot' });
    const bar = el('footer', { className: 'ws-statusbar ws-block', 'data-ws-blk': 'statusbar' }, el('span', { className: 'ws-layout-label' }, layoutName(cur.layout)), el('span', { 'data-ws-selection': '' }), slot);
    region(o.place).append(bar);
    if (A.status) move(A.status, slot);
    P.statusbar = { el: bar };
  }

  // =========================================================== enter / leave ===========================================================
  const MOUNT = { titlebar: mountTitlebar, ribbon: mountRibbon, options: mountOptions, toolbar: mountToolbar, infobox: mountInfobox, toolbox: mountToolbox,
    palettes: mountPalettes, viewtabs: mountViewtabs, viewbar: (o) => { P.viewbar = mountSlotsBar(o, 'ws-view-controls', T('shell.ws.viewcontrols')); },
    quickbar: (o) => { P.quickbar = mountSlotsBar(o, 'tbx-quick', T('shell.ws.quickbar')); }, statusbar: mountStatusbar,
    petpalette: () => { pet.hide(); stage.append(pet.el); P.petpalette = { el: pet.el, float: true }; } };
  const bodyCls = () => ['ws-on', 'ws-look-' + cur.layout.look.outline, 'ws-tabs-' + cur.layout.look.tabs, cur.layout.look.density === 'compact' ? 'ws-dense' : null,
    ...[...cur.blocks.keys()].map((b) => 'ws-b-' + b), cur.blocks.has('titlebar') ? 'has-live-workspace' : null, cur.blocks.has('toolbox') ? 'has-toolbox' : null,
    top || bottom ? 'ws-chrome-on' : null].filter(Boolean);
  function enter(next) {
    cur = next;
    for (const s of A.hide || []) for (const n of document.querySelectorAll(s)) n.classList.add('ws-hide');
    stage.classList.add('ws-stage'); root.classList.add('ws-host');
    root.append(tooltip);
    for (const b of cur.list) if (b.place !== 'none' || b.block === 'toolbar') MOUNT[b.block](b);
    // the order inside each region follows the layout (mounting goes block by block; re-append by order)
    for (const r of [top, bottom, ...regions.values()].filter(Boolean)) {
      const items = cur.list.filter((b) => b.place !== 'none').map((b) => ({ b, n: partEl(b.block) })).filter((x) => x.n && [].concat(x.n)[0].parentNode === r);
      items.sort((x, y) => x.b.order - y.b.order); for (const { n } of items) for (const m of [].concat(n)) r.append(m);
    }
    root.classList.add('ws-on'); root.dataset.wsLayout = cur.key;
    root.classList.toggle('ws-active', cur.blocks.has('titlebar')); root.classList.toggle('tbx-active', cur.blocks.has('toolbox'));
    cur.cls = bodyCls(); document.body.classList.add(...cur.cls);
    stageObs.observe(stage, { childList: true }); markFill();
    A.entered?.(ctx);
    resized(); measure();
  }
  function partEl(block) {
    const p = P[block]; if (!p || p.float) return null;
    if (block === 'ribbon') return [p.tabs, p.ribbon];
    if (block === 'palettes') return null;
    return p.el || null;
  }
  function leave() {
    A.leaving?.(ctx);
    dockRibbon(); closeRibbonMenu(); closeFileMenu(); tbPop?.back(); tbPop = null; toolOptions(true);
    mine.closeMenu(); fields.clear(); pet.hide(); pet.el.remove();
    if (P.titlebar) P.titlebar.off();
    if (P.toolbar?.el) P.toolbar.el.classList.remove('ws-toolbar-strip', 'ws-hide');
    if (P.palettes) { for (const k of P.palettes.kids) k.classList.remove('ws-hide'); }
    restoreAll();
    if (P.palettes) {
      const g = P.palettes.host.querySelector('.shell-grip-name'); if (g?.dataset.wsName) { g.textContent = g.dataset.wsName; delete g.dataset.wsName; }
      P.palettes.el.remove(); P.palettes.host.classList.remove('ws-panel-host');
    }
    P.viewtabs?.empty?.remove();
    for (const r of regions.values()) { ro.unobserve(r); r.remove(); } regions.clear();
    top?.remove(); bottom?.remove(); top = bottom = null;
    for (const n of document.querySelectorAll('.ws-hide')) n.classList.remove('ws-hide');
    for (const c of stage.children) c.classList.remove('ws-fill', 'ws-flow');
    stageObs.disconnect(); tooltip.remove(); tooltip.hidden = true;
    for (const v of ['--ws-st', '--ws-sb', '--ws-vt', '--ws-vb', '--ws-sl', '--ws-sr']) stage.style.removeProperty(v);
    document.body.classList.remove(...cur.cls);
    root.classList.remove('ws-on', 'ws-active', 'tbx-active', 'ws-other', 'ws-host'); stage.classList.remove('ws-stage', 'ws-no-view'); delete root.dataset.wsLayout;
    for (const k of Object.keys(P)) delete P[k];
    const was = cur; cur = null; peeking = false;
    A.left?.({ ...ctx, was: was.key });
    resized();
  }
  function resized() { requestAnimationFrame(() => { A.resized?.(); measure(); }); }

  // =========================================================== refresh ===========================================================
  function soon() { if (!frame) frame = requestAnimationFrame(() => { frame = 0; refresh(); }); }
  function refresh() {
    if (!cur) return;
    const s = state();
    root.classList.toggle('ws-other', !!s.other);
    if (P.titlebar) { P.titlebar.title.textContent = (s.name || '') + (s.dirty ? ' *' : ''); P.titlebar.el.title = s.name || ''; }
    if (P.ribbon) { const sig = JSON.stringify([tabsShown().map((t) => t.tab), A.contextTab ? A.contextTab(s) : null]); if (sig !== P.ribbon.lastSig) { P.ribbon.lastSig = sig; renderRibbonTabs(); } }
    if (P.options) {
      const w = A.options ? A.options(s) : { title: '', text: '' };
      P.options.el.querySelector('strong').textContent = w.title || '';
      P.options.el.querySelector('[data-ws-options-text]').textContent = w.text || '';
      P.options.el.className = 'ws-options ws-block' + (w.cls ? ' ' + w.cls : '') + (optsRow && optsBlock === 'options' ? ' ws-has-tool-options' : '');
    }
    if (P.statusbar) P.statusbar.el.querySelector('[data-ws-selection]').textContent = s.selection.length ? T('shell.ws.selected', { n: s.selection.length }) : T('shell.ws.selected.none');
    refreshViewtabs(s);
    if (P.viewbar) P.viewbar.el.querySelector('.ws-drawing-title').textContent = openView()?.name || T('shell.ws.noview');
    refreshPalettes(); refreshInfobox(s); renderToolbox(); refreshToolbox(s);
    if (P.petpalette) pet.refresh(s);
    A.refresh?.(ctx);
    refreshTools(); toolOptions(); markFill(); measure();
  }
  function refreshTools() {
    for (const b of all('[data-ws-command]')) {
      const id = b.dataset.wsCommand, block = b.dataset.wsBlock || 'ribbon', a = can(id, block), t = A.tool ? A.tool(id, block) : { label: id };
      b.setAttribute('aria-disabled', a.enabled ? 'false' : 'true');
      b.title = t.label + (a.enabled ? '' : ': ' + a.reason);
      b.classList.toggle('ws-notbuilt', t.built === false);
      // the running tool or an on/off command is lit as in the toolbox (ribbon, quick bar, view bar, title bar, options bar); a button
      // becomes a toggle (aria-pressed) once it has been on, so the plain commands are not read out as "not pressed"
      const on = !!(A.pressed && A.pressed(id, block));
      if (on || b.hasAttribute('aria-pressed')) b.setAttribute('aria-pressed', on ? 'true' : 'false');
      b.dataset.wsReason = a.reason || '';
    }
  }

  // =========================================================== events ===========================================================
  const scopes = () => [...new Set([top, bottom, root, P.palettes && P.palettes.el.ownerDocument !== document ? P.palettes.el : null, rbox, tbPop?.box].filter(Boolean))];
  const all = (sel) => scopes().flatMap((n) => [...n.querySelectorAll(sel)]);
  const listeners = [];
  function listen(type, fn, capture = false) {
    listeners.push([type, fn, capture]);
    const wrap = (e) => { if (cur) fn(e); };
    root.addEventListener(type, wrap, capture);
    // top and bottom come and go: delegate from the document for them
    document.addEventListener(type, (e) => { if (cur && (top?.contains(e.target) || bottom?.contains(e.target) || e.target.closest?.('.ws-dialog'))) fn(e); }, capture);
  }
  listen('click', (e) => {
    const b = e.target.closest('button, [data-ws-reason]'); if (!b) return;
    if (P.toolbox?.o.mine && mine.on.click(b)) return;
    if (P.petpalette && pet.el.contains(b) && pet.on.click(b)) return;
    if (b.hasAttribute('data-ws-ribbon-menu')) { ribbonMenu(b); return; }
    if (b.dataset.wsShell) { document.querySelector(b.dataset.wsShell)?.click(); return; }
    if (b.dataset.wsLower) { showLower(b.dataset.wsLower); return; }
    if (b.hasAttribute('data-ws-dismiss')) { b.closest('dialog').close(); return; }
    if (b.hasAttribute('data-ws-inventory')) { inventory(); return; }
    if (b.hasAttribute('data-ws-props')) { A.showProperties?.(); return; }
    if (b.hasAttribute('data-ws-file')) { fileMenu(b); return; }
    if (b.dataset.wsTab) {
      const same = b.dataset.wsTab === tab; tab = b.dataset.wsTab;
      // the same tab buttons, re-marked (rebuilding them would split a double-click across two elements)
      for (const x of P.ribbon.tabs.querySelectorAll('[data-ws-tab]')) { const on = x.dataset.wsTab === tab; x.setAttribute('aria-selected', on ? 'true' : 'false'); x.tabIndex = on ? 0 : -1; }
      renderRibbon(); b.focus();
      if (collapsed && !(rwin && !rwin.closed)) peek(!(same && peeking));   // collapsed: a tab shows its tools over the drawing; again hides them
      return;
    }
    if (b.dataset.tbxTool) { runTool(b.dataset.tbxTool, 'toolbox', b); return; }
    if (peeking && b.dataset.wsCommand && P.ribbon?.ribbon.contains(b)) setTimeout(() => peek(false), 0);   // a command picked from the peeked ribbon
    if (b.dataset.wsCommand) { runTool(b.dataset.wsCommand, b.dataset.wsBlock || 'ribbon', b); return; }
    if (b.dataset.wsDrawing) { goView(b.dataset.wsDrawing); return; }
    if (b.dataset.wsView) { goView(b.dataset.wsView); return; }
    if (b.dataset.wsClose) { closeView(b.dataset.wsClose); return; }
    if (b.dataset.wsReason && !b.dataset.wsCommand) explain(T('shell.ws.tool'), b.dataset.wsReason);
  });
  // My tools: right-click a tool to add it, drag one onto a slot (the toolbox's own window too: these go through listen())
  for (const type of ['contextmenu', 'dragstart', 'dragover', 'drop']) listen(type, (e) => { if (P.toolbox?.o.mine && P.toolbox.el.contains(e.target)) mine.on[type](e); });
  // the pet palette: a click in the drawing (no drag) with something picked brings it by the pointer; the wheel or another click puts it away
  for (const type of ['pointerdown', 'pointerup']) stage.addEventListener(type, (e) => { if (cur && P.petpalette) pet.on[type](e); }, true);
  stage.addEventListener('wheel', () => { if (cur && P.petpalette) pet.on.wheel(); }, { capture: true, passive: true });
  // the toolbox in its own window: its clicks come through popout's listeners (above)
  document.addEventListener('pointerdown', (e) => { if (peeking && !P.ribbon?.ribbon.contains(e.target) && !P.ribbon?.tabs.contains(e.target)) peek(false); }, true);
  document.addEventListener('keydown', (e) => {
    if (!cur || e.key !== 'Escape' || e.defaultPrevented) return;
    if (P.petpalette) pet.on.keydown(e);   // Esc also puts the pet palette away; the app still hears it
    if (peeking) { e.preventDefault(); e.stopPropagation(); peek(false); return; }
    if (isTyping(e.target) || document.querySelector('dialog[open]')) return;
    if (A.escape && A.escape(e, ctx)) { e.preventDefault(); e.stopImmediatePropagation(); soon(); toolOptions(); }
  }, true);
  document.addEventListener('dblclick', (e) => { if (cur && P.ribbon && e.target.closest?.('[data-ws-tab]') && P.ribbon.o.collapse && !(rwin && !rwin.closed)) setCollapsed(!collapsed); });
  listen('keydown', (e) => {
    const b = e.target;
    if (b.dataset?.wsTab && ['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) {
      const items = [...P.ribbon.tabs.querySelectorAll('[role="tab"]')], i = items.indexOf(b);
      const next = e.key === 'Home' ? items[0] : e.key === 'End' ? items.at(-1) : items[(i + (e.key === 'ArrowRight' ? 1 : items.length - 1)) % items.length];
      e.preventDefault(); tab = next.dataset.wsTab; renderRibbonTabs(); P.ribbon.tabs.querySelector('[aria-selected="true"]').focus();
    }
    if (e.key === 'Enter' && !isTyping(b) && b.dataset?.wsReason && !b.matches('button')) { e.preventDefault(); explain(T('shell.ws.tool'), b.dataset.wsReason); }
  }, true);
  function showTooltip(e) {
    if (e.view && e.view !== window) return;   // another window shows the native tooltip
    const b = e.target.closest?.('[data-ws-command], [data-tbx-tool], [aria-disabled="true"], [data-ws-reason]'); if (!b || !(top?.contains(b) || bottom?.contains(b) || root.contains(b))) return;
    const why = b.dataset.wsReason || b.title; if (!why) return;
    tooltip.textContent = why; tooltip.hidden = false; b.setAttribute('aria-describedby', tooltip.id);
    const r = b.getBoundingClientRect(); tooltip.style.left = Math.max(8, Math.min(r.left, window.innerWidth - 350)) + 'px'; tooltip.style.top = Math.min(r.bottom + 5, window.innerHeight - 150) + 'px';
  }
  for (const t of ['pointerover', 'focusin']) document.addEventListener(t, (e) => { if (cur) showTooltip(e); });
  for (const t of ['pointerout', 'focusout']) document.addEventListener(t, () => { if (cur) { tooltip.hidden = true; if (t === 'focusout') soon(); } });
  // bars hidden: the top slides away with the app's bars; the shell's reveal brings it back while the pointer is on it
  document.addEventListener('pointermove', (e) => { if (cur && top?.contains(e.target) && document.body.classList.contains('shell-autohide')) window.ccShellScreen?.reveal(true); });

  function inventory() {
    const ids = [...new Set(ribbonData().flatMap((t) => t.groups.flatMap((g) => [...g.large, ...g.stacks.flat()])))];
    const query = el('input', { type: 'search', placeholder: T('shell.ws.inv.find'), 'aria-label': T('shell.ws.inv.find') });
    const list = el('div', { className: 'ws-inventory-list' });
    const render = () => {
      const q = query.value.toLowerCase();
      list.replaceChildren(...ids.map((id) => [id, A.tool(id, 'ribbon')]).filter(([, t]) => t.label.toLowerCase().includes(q)).map(([id, t]) => {
        const a = can(id, 'ribbon'), st = a.enabled ? T('shell.ws.inv.ready') : t.built !== false ? T('shell.ws.inv.later') : T('shell.ws.inv.notbuilt');
        return el('article', {}, el('strong', {}, t.label + ' · ' + st), el('p', {}, a.reason || T('shell.ws.ready')));
      }));
    };
    const dlg = el('dialog', { className: 'ws-dialog ws-inventory', 'aria-label': T('shell.ws.inventory') }, el('h2', {}, T('shell.ws.inventory')), query, list,
      el('div', { className: 'ws-dialog-actions' }, btn(T('shell.ws.close'), { 'data-ws-dismiss': '' })));
    query.addEventListener('input', render); document.body.append(dlg); render(); dlg.addEventListener('close', () => dlg.remove()); dlg.showModal();
  }

  // "Arrange your own layout…" (WS.25): the dialog offers only what this app's adapter can fill, and saves through importText
  const arranger = arrangeDialog({ F, T, el, btn, caps,
    current: () => cur?.layout || null,
    builtin: (id) => availableLayouts(cfg).find((x) => x.key === id && x.ok)?.layout || null,
    slotLabel: (n) => (n !== 'tool' && A.slots?.[n]?.label) || (HAS('shell.ws.slot.' + n) ? ST('shell.ws.slot.' + n) : n),   // the app's own name first
    paletteLabel: (n) => { const l = A.palettes?.[n]?.label; return (typeof l === 'function' ? l('left-panel') : l) || n; },
    importText: (text) => (window.ccShellWorkspace?.importText ? window.ccShellWorkspace.importText(text) : api.importText(text)),
    use: (key) => { if (window.ccShellWorkspace) window.ccShellWorkspace.set(key); else { try { localStorage.setItem('cc-workspace', key); } catch (e) { /* this page only */ } decide(true); } } });

  /** A panel a person can move into a window of their own, even onto another monitor (WS.26, owner 2026-10-24: "these panels (left and right)
   *  need the tear off menu … so they can go into another monitor"). For a page whose panels the shell's panel manager does not own (SuperCad
   *  Studio's left wall, a hosted app's side panel): puts the shell's grip (name + "…" menu: Move to a new window / Put the panel back) first
   *  inside `host` and moves, on request, `host`'s children (self: false) or `host` itself (self: true) into a pop-up window and home again.
   *  Closing that window brings it back. → { grip, pop, setName(text), destroy() } */
  function tearable({ key, host, name, self = false, onChange = () => {} }) {
    const nm = el('span', { className: 'shell-grip-name' }, name);
    const grip = el('div', { className: 'shell-grip ws-grip', 'data-ws-grip': key },
      el('span', { className: 'shell-grip-handle' }, el('i', { className: 'bi bi-grip-vertical', 'aria-hidden': 'true' }), nm));
    host.prepend(grip);
    const nodes = [];
    const pop = popout({ name: 'panel-' + A.app + '-' + key, nodes, cls: 'panel-popout',
      title: () => T('shell.ws.panel.window', { app: appName, name: nm.textContent }),
      size: () => ({ w: Math.min(520, screen.availWidth || 800), h: Math.min(screen.availHeight || 900, 900) }), onChange });
    grip.append(menuButton({ t: T, label: T('shell.ws.panel.menu'), backLabel: T('shell.ws.panel.back'), isOpen: () => pop.isOpen(),
      open: () => { nodes.splice(0, nodes.length, ...(self ? [host] : [...host.children])); if (!pop.open()) say(T('shell.ws.tear.blocked'), true); },
      back: () => pop.back() }));
    return { grip, pop, name: nm, setName: (text) => { if (nm.textContent !== text) nm.textContent = text; }, destroy() { pop.back(); grip.remove(); } };
  }

  // =========================================================== the shell's Settings ===========================================================
  const api = {
    tearable,
    /** Settings › Global › Layout › Arrange your own layout… */
    arrange: () => arranger.open(),
    get layout() { return cur ? cur.key : null; }, has: (b) => !!cur?.blocks.has(b), refresh: soon, decide, view: openView,
    notes: () => (cur ? cur.notes.slice() : []),
    /** Each region and the blocks in it, in DOM order (the conformance test checks the layout's order). */
    order: () => [top, bottom, ...regions.values()].filter(Boolean).map((r) => ({ region: r === top ? 'top' : r === bottom ? 'bottom' : r.dataset.wsRegion,
      blocks: [...r.children].map((n) => n.dataset.wsBlk || (n.classList.contains('ws-toolbar-strip') ? 'toolbar' : null)).filter(Boolean) })),
    inspect: () => ({ layout: cur?.key || null, blocks: cur ? [...cur.blocks.keys()] : [], notes: cur?.notes || [], phone: phone(), view: openView()?.id || null, notice,
      busy: !!state().busy, waiting,
      // the conformance test compares what the adapter says now with what is on screen: the toolbox's tools, the lit commands
      toolbox: P.toolbox ? { said: A.toolbox().flatMap((g) => g.tools.filter((id) => built(id, 'toolbox'))), shown: [...P.toolbox.list.querySelectorAll('[data-tbx-tool]')].map((b) => b.dataset.tbxTool) } : null,
      pressed: A.pressed ? [...new Set(all('[data-ws-command]').map((b) => b.dataset.wsCommand + ' ' + (b.dataset.wsBlock || 'ribbon')))].filter((k) => A.pressed(...k.split(' '))) : [] }),
    notice: () => notice,
    /** Every layout this page offers (Settings lists them): [{key, name, hint, source, ok, error, notes}] */
    layouts() {
      return availableLayouts(cfg).map((x) => ({ key: x.key, source: x.source, ok: x.ok, error: x.error || '', name: x.layout ? layoutName(x.layout) : x.key,
        hint: x.layout ? (x.layout.hintKey && HAS(x.layout.hintKey) ? ST(x.layout.hintKey) : x.layout.description || '') : '',
        notes: x.ok ? F.resolveLayout(x.layout, caps()).notes : [] }));
    },
    /** Settings › Global › Layout › Import: a file's text → stored as file:<id> (≤ LIMITS.files). {ok, key, name, notes, error} */
    importText(text) {
      const r = F.importLayout(text);
      if (!r.ok) return { ok: false, error: r.error, message: T('shell.ws.bad', { why: T('shell.ws.why.' + r.error) }) };
      const files = importedFiles();
      if (!(r.layout.id in files) && Object.keys(files).length >= F.LIMITS.files) return { ok: false, error: 'full', message: T('shell.ws.bad', { why: T('shell.ws.why.full') }) };
      files[r.layout.id] = F.exportLayout(r.layout);
      if (!saveFiles(files)) return { ok: false, error: 'full', message: T('shell.ws.bad', { why: T('shell.ws.why.full') }) };
      const notes = r.dropped.length + F.resolveLayout(r.layout, caps()).notes.length;
      return { ok: true, key: 'file:' + r.layout.id, name: r.layout.name, notes, message: notes ? T('shell.ws.imported.notes', { name: r.layout.name, n: notes }) : T('shell.ws.imported', { name: r.layout.name }) };
    },
    remove(key) { const ref = F.layoutRef(key); if (ref.kind !== 'file') return false; const f = importedFiles(); delete f[ref.id]; saveFiles(f); if (cur?.key === key) window.ccShellWorkspace?.set('standard'); return true; },
    /** The file of a layout (the one in use when key is left out), for Settings › Export. */
    exportText(key) { const k = key || cur?.key; const x = availableLayouts(cfg).find((l) => l.key === k); return x?.ok ? { name: x.layout.id + F.EXT, text: F.exportLayout(x.layout) } : null; },
  };
  if (!guest) {
    window.ccWorkspaceEngine = api;   // the shell's Settings (app-settings.js) may load after the app: it registers this itself then
    window.ccShellWorkspace?.register?.(api);
  }
  window.addEventListener('cc-workspace', () => decide(true));   // a person's pick (Settings › Global › Layout)
  window.addEventListener('storage', (e) => { if (e.key === FILES_KEY) decide(); });
  if (window.matchMedia) matchMedia(PHONE).addEventListener?.('change', () => decide());
  decide();
  return api;
}
