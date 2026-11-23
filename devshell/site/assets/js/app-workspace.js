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
import { popout, menuButton, windows, openMenu } from './app-workspace-popout.js';
import { ccState } from './app-state.js';
import { KINDS as EXTRA_KINDS, blockHost, mountExtra, refreshExtras, destroyExtras, wantsTitlebarBlock, titlebarBlock } from './app-workspace-blocks.js';
import { foldBar } from './app-workspace-overflow.js';
import { shapeRibbon, shapeToolbox, stacksToPalettes, paletteStacks, movePalette, toolIds, withCommands, cannotOf } from './app-workspace-tools.js';
import { myTools, petPalette, infoFields, fieldsIn, regTool, iconFor } from './app-workspace-extras.js';
import { iconKey, iconNode, iconStyle, applyIcons, blockIcon } from './app-workspace-icons.js';
import { showSeq } from './app-input.js';
import { arrangeDialog } from './app-workspace-arrange.js';
import { layoutEditor } from './app-workspace-edit.js';
import { dockedCommandLine } from './app-cmdline.js';
import { menubar as vectorMenubar, toolpalette as vectorPalette } from './app-workspace-vector.js';
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

/** 0.10 UI.5 / UI.6 / UI.7 (rule 62: this file serves released builds too): the editing and switching parts are on in the lab build and off elsewhere, until the owner turns them on
 *  with html[data-cc-ws-edit="1"] (an .env switch printed by app-shell.inc, off); "0" forces them off even in the lab. Layout files of format v2 are read everywhere: they are opt-in files. */
const editOn = () => { try { const w = document.documentElement.getAttribute('data-cc-ws-edit'); return w === '0' ? false : w === '1' || !!document.body?.classList.contains('shell-lab'); } catch (e) { return false; } };
/** 0.10 UI.21 / UI.26 / UI.3 (session ui-dock2-10; owner 2026-11-15: the PRO layouts, Arrange mode and the block set do not change by default): the dock manager, the one head
 *  and the remembered windows are on only with html[data-cc-ws-edit="1"] itself, not in every lab page, so a lab page without the switch looks and behaves as before. */
const dockOn = () => { try { return document.documentElement.getAttribute('data-cc-ws-edit') === '1'; } catch (e) { return false; } };
/** 0.11 ui-finish-11 (UI.5, UI.6, UI.26): the switch AND a lab build (body.shell-lab). Since the 0.10 go-live APP_WS_EDIT=1 prints the switch on every build,
 *  so the parts added after it (true palette stacks, place window, Pin / Float / a group's close, palettes out of their stack, the form routed to Arrange)
 *  stay off on /use until they are released (rule 62). */
const labDock = () => { try { return dockOn() && !!document.body?.classList.contains('shell-lab'); } catch (e) { return false; } };

export function mountWorkspaces(A0) {
  // 0.10 UI.6: a layout may name `+cmd:<registry id>` tools; the adapter is taught to show, grey and run them through the input registry
  const A = withCommands(A0, {
    tool: (id) => regTool(id),
    can: (id) => { const w = window.ccInput?.why ? window.ccInput.why(id) : ''; return { enabled: !w, reason: w === 'no-registry' ? '' : w || '' }; },
    run: (id) => window.ccInput?.run?.(id),
  });
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
  let D = null;     // UI.21 / UI.26 (switch on only): the dock manager of the mounted layout (app-dock.js), else null
  let frame = 0, retry = 0, told = '', notice = '';   // notice: the last fallback message (Settings shows it too)
  let waiting = null;   // the layout asked for while the app is busy ('standard' = classic): it changes once the app is done
  const caps = () => ({
    ribbon: !!A.ribbon, toolbox: !!A.toolbox, views: !!A.views, viewports: !!A.viewports, view3d: !!A.viewports, toolbar: !!(A.toolbar && A.toolbar()),
    slots: Object.keys(A.slots || {}), palettes: Object.keys(A.palettes || {}), actions: A.actions || F.ACTIONS,
    tools: (() => { try { return toolIds(A.ribbon ? A.ribbon() : [], A.toolbox ? A.toolbox() : []); } catch (e) { return null; } })(), commands: (window.ccInput?.commands || []).map((c) => c.id),   // v2: tool and command ids a layout may name
  });
  const state = () => ({ document: null, name: '', dirty: false, busy: false, selection: [], tool: null, ...(A.state ? A.state() : {}) });
  const ctx = {
    get layout() { return cur ? cur.key : null; }, has: (b) => !!cur?.blocks.has(b), block: (b) => cur?.blocks.get(b) || null,
    state: ccState, select: (ids) => ccState.select(ids), view: () => openView(), open: (id) => goView(id), palette: (n) => showLower(n), refresh: soon, say, T, el, tool: (id, block, compact) => tool(id, block, compact),
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
  /** 0.11 FX.310 (rule 62: lab / data-cc-ws-edit only; the owner's rule: the styles are consistent, so people can pick their UI): the older built-in styles take the Pro skin the
   *  four PRO-cad styles already have (one icon ink, bar heights, hairline, spacing: the --pro-* tokens in app-workspace.css), so no style has a look patch of its own.
   *  A layout that names a skin keeps it; imported files and add-on layouts are never changed. */
  const OLD_STYLES = ['docked', 'toolbox', 'autorev', 'duncan', 'vector', 'sketch', 'rhino'];
  const proSkin = (found) => (found.source === 'builtin' && OLD_STYLES.includes(found.key) && !found.layout.look.skin && editOn() ? { ...found.layout, look: { ...found.layout.look, skin: 'pro' } } : found.layout);
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
    return use({ key: want, layout: proSkin(found), blocks: new Map(r.blocks.map((b) => [b.block, b])), list: r.blocks, notes: r.notes }, asked);
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
  /** A skinned layout hides the scroll bars of its bars (the ribbon, the tool rows, the tab strips): the wheel scrolls them sideways and an edge
   *  with more behind it is marked (data-ws-more = left | right | both) so the paint can fade it. Layouts without a skin are untouched. */
  const SCROLLERS = '.ws-ribbon, .ws-ribbon-tabs, .tr-row, .ws-drawing-tabs, .ws-view-controls, .tbx-quick, .ws-options, .tbx-info';
  function edges() {
    if (!cur?.layout.look.skin) return;
    for (const n of all(SCROLLERS)) {
      const l = n.scrollLeft > 1, r = n.scrollLeft + n.clientWidth < n.scrollWidth - 1, v = l && r ? 'both' : l ? 'left' : r ? 'right' : '';
      if ((n.dataset.wsMore || '') !== v) { if (v) n.dataset.wsMore = v; else delete n.dataset.wsMore; }
    }
  }
  document.addEventListener('wheel', (e) => {
    if (!cur?.layout.look.skin || e.ctrlKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
    const n = e.target.closest?.(SCROLLERS); if (!n || n.scrollWidth <= n.clientWidth + 1 || e.target.closest('select, input, textarea, .tr-more-list')) return;
    n.scrollLeft += e.deltaY; e.preventDefault(); edges();
  }, { passive: false });
  document.addEventListener('scroll', (e) => { if (cur?.layout.look.skin && e.target.matches?.(SCROLLERS)) edges(); }, true);
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
    const ic = blockIcon({ id, label: t.label, bi: typeof t.icon === 'string' ? t.icon : '', own: typeof t.icon === 'string' ? null : t.icon, block, cls: 'ws-icon-bi' });   // 0.10 UI.14: the set first in lab builds
    return el('button', { type: 'button', className: 'ws-tool' + (compact ? ' ws-compact' : ''), 'data-ws-command': id, 'data-ws-block': block, 'aria-label': t.label }, ic, el('span', {}, t.label));
  };
  /** The layout's declaration for a tool (UI.25): { enabled, visible } as booleans read against the one state, or null when it has none. */
  const declared = (id, block) => {
    const w = cur?.blocks.get(block === 'file' || block === 'titlebar' ? 'ribbon' : block)?.when?.[id]; if (!w) return null;
    return { enabled: ccState.test(w.enabled), visible: ccState.test(w.visible) };
  };
  const can = (id, block) => {
    const a = A.can ? A.can(id, block, state()) : { enabled: true, reason: '' }, d = declared(id, block);
    return d && !d.enabled && a.enabled ? { enabled: false, reason: T('shell.state.off') } : a;
  };
  const built = (id, block) => (A.tool ? A.tool(id, block).built !== false : true);
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
  const E = { A, seed: () => editOn(), declared: (id, block) => declared(id, block), toolboxData: (b) => toolboxData(b), app: A.app, T, el, btn, can, tool, runTool: (id, block, b) => runTool(id, block, b), explain, say, soon: () => soon(), state, stage,
    redraw: () => { if (P.toolbox) { P.toolbox.sig = null; renderToolbox(); refreshToolbox(state()); } } };
  const mine = myTools(E), pet = petPalette(E), fields = infoFields(E), vmenu = vectorMenubar(E), vpal = vectorPalette(E);

  // owner 2026-11-15: no layout picker in any layout's chrome (it was UI.7's switcher): the interface style is chosen in Settings › Global › Layout only.

  // ---- titlebar ----
  // the app's logo mark and name: EVERY layout shows them (owner rule 2026-11-05), so the title bar and the Vector menu bar both build them here
  // owner 2026-11-15: the "Starting up…" chip (app-boot.js, FX.86) sits in the classic app bar, which a layout with a title or menu bar hides. While such a layout
  // is up the same chip (one node, so app-boot.js keeps driving it) sits right after the layout's brand; leave() puts it back where it came from.
  let bootHome = null;
  const bootTo = (brand) => { if (!editOn()) return; const c = document.querySelector('[data-boot]'); if (!c || !brand) return;   // lab only until the owner's go (shared asset serves /use)
    if (!bootHome && c.closest('.app-bar')) bootHome = [c.parentNode, c.nextSibling]; brand.after(c); };
  const bootBack = () => { const c = document.querySelector('[data-boot]'); if (c && bootHome && c.parentNode !== bootHome[0]) bootHome[0].insertBefore(c, bootHome[1]?.parentNode === bootHome[0] ? bootHome[1] : null); };
  const brandEl = () => { const bar = document.querySelector('.app-bar'); return el('span', { className: 'ws-brand', 'data-ws-brand': '' }, bar?.querySelector('.app-bar-mark')?.cloneNode(true) || null, bar?.querySelector('.app-bar-name > .layer-swatch')?.cloneNode(true) || null, el('span', {}, appName)); };
  // 0.11 UI.8 / UI.24: a layout whose titlebar block asks for `menus`, `find` or `pins` gets the title bar BLOCK (app-block-titlebar.js) in place of this one; the menu bar then sits in its dock
  const placeMenubar = () => { const d = P.titlebar?.blk?.dock; if (d && P.menubar && P.menubar.el.parentNode !== d) { d.append(P.menubar.el); dropMenubarDuplicates(); } };
  function mountTitlebarBlock(o) {
    const h = titlebarBlock({ ...extraEnv(), addons: true }, o, region(o.place));
    P.titlebar = { el: h.el, title: document.createElement('span'), blk: h, off: () => { h.gone = true; try { h.part?.destroy(); } catch (e) { /* gone anyway */ } h.el.remove(); } };
    h.onReady = placeMenubar; dropMenubarDuplicates();
  }
  function mountTitlebar(o) {
    if (wantsTitlebarBlock(o)) return mountTitlebarBlock(o);
    const fsSrc = document.querySelector('[data-fs-cycle]');
    const shellBtn = (sel, cls, label) => el('button', { type: 'button', className: 'ws-shell-btn', 'data-ws-shell': sel, 'aria-label': label, title: label }, blockIcon({ bi: cls, block: 'titlebar' }));
    const fsBtn = el('button', { type: 'button', className: 'ws-shell-btn', 'data-ws-shell': '[data-fs-cycle]', hidden: !fsSrc }, blockIcon({ bi: 'bi-fullscreen', block: 'titlebar' }));
    const fsSync = () => { if (!fsSrc) return; fsBtn.hidden = fsSrc.hidden; fsBtn.title = fsSrc.title; fsBtn.setAttribute('aria-label', fsSrc.getAttribute('aria-label') || fsSrc.title); fsBtn.setAttribute('aria-pressed', fsSrc.getAttribute('aria-pressed') || 'false'); const i = fsSrc.querySelector('i.bi'); if (i) { const g = [...i.classList].find((c) => c.startsWith('bi-')); if (g && fsBtn.dataset.fsGlyph !== g) { fsBtn.dataset.fsGlyph = g; fsBtn.firstChild.replaceWith(blockIcon({ bi: g, block: 'titlebar' })); } } };
    let fsObs = null; if (fsSrc) { fsSync(); fsObs = new MutationObserver(fsSync); fsObs.observe(fsSrc, { attributes: true, subtree: true, childList: true }); }
    const brand = brandEl();
    const title = el('span', { className: 'ws-project' });
    const h = el('header', { className: 'ws-titlebar ws-block', 'data-ws-blk': 'titlebar' }, brand,
      quickIds(o).length ? el('div', { className: 'ws-quick', 'aria-label': T('shell.ws.quick') }, quickIds(o).map((id) => tool(id, 'titlebar', true))) : null, title,
      o.inventory ? btn(T('shell.ws.inventory'), { 'data-ws-inventory': '' }) : null,
      fsBtn, shellBtn('[data-help-open]', 'bi-question-circle', T('shell.ws.help')), shellBtn('[data-settings-open]', 'bi-gear', T('shell.ws.settings')));
    region(o.place).append(h); bootTo(brand);
    P.titlebar = { el: h, title, off: () => fsObs?.disconnect() };
    dropMenubarDuplicates();
  }

  // ---- ribbon ----
  let tab = null, collapsed = false, peeking = false, rmenu = null;
  const COLLAPSE_KEY = 'cc-ws-ribbon:' + A.app;
  function mountRibbon(o) {
    const tabsEl = el('nav', { className: 'ws-ribbon-tabs ws-block', 'data-ws-blk': 'ribbon', role: 'tablist', 'aria-label': T('shell.ws.ribbon') });
    const ribbon = el('div', { className: 'ws-ribbon ws-block', role: 'tabpanel', id: 'ws-ribbon-panel' });
    const r = region(o.place); r.append(tabsEl, ribbon);
    // the person's own choice (cc-ws-ribbon:<app> = collapsed | open) wins over the layout's start (o.collapsed)
    collapsed = !!o.collapse && (() => { try { const v = localStorage.getItem(COLLAPSE_KEY); return v ? v === 'collapsed' : !!o.collapsed; } catch (e) { return !!o.collapsed; } })();
    r.classList.toggle('ws-collapsed', collapsed);
    P.ribbon = { tabs: tabsEl, ribbon, region: r, o };
    renderRibbonTabs(); ribbonExtras(o); startChrome();
  }
  const ribbonRaw = () => (A.ribbon ? A.ribbon() : []);
  // UI.21 (switch on): a group docked as a palette (app-dock.js) is left out of its bar; with no dock manager these are the layout's own lists
  const ribbonAll = () => shapeRibbon(ribbonRaw(), cur?.blocks.get('ribbon')?.tools);
  const ribbonData = () => (D ? ribbonAll().map((t) => ({ ...t, groups: t.groups.filter((g) => !D.isDocked('ribbon:' + t.tab + ':' + g.id)) })) : ribbonAll());
  const toolboxAll = (block = 'toolbox') => shapeToolbox(A.toolbox ? A.toolbox() : [], cur?.blocks.get(block)?.tools, block);   // what the layout says the block holds (v2)
  const toolboxData = (block = 'toolbox') => (D ? toolboxAll(block).filter((g) => !D.isDocked(block + ':' + g.id)) : toolboxAll(block));
  function tabsShown() {
    const ctxTab = A.contextTab ? A.contextTab(state()) : null;
    return ribbonData().filter((t) => (t.context ? t.tab === ctxTab : true) && (!t.show || ccState.test(t.show)) && t.groups.some((g) => [...g.large, ...g.stacks.flat()].some((id) => id !== 'select' && built(id, 'ribbon'))));
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
        blockIcon({ bi: 'bi-three-dots', block: 'ribbon' })) : null].filter(Boolean));   // never a null to replaceChildren: it prints "null"
    R.sig = JSON.stringify([shown.map((t) => t.tab), tab]);
    D?.decorate('ribbon-tabs', R.tabs);   // UI.26: the one head takes the tear handle's place
    renderRibbon();
  }
  function renderRibbon() {
    const R = P.ribbon; if (!R) return;
    const t = ribbonData().find((x) => x.tab === tab);
    R.ribbon.setAttribute('aria-label', t?.label || ''); R.ribbon.dataset.wsTabId = t?.tab || '';
    R.ribbon.replaceChildren(...(t?.groups || []).map((g) => el('section', { className: 'ws-group', 'aria-label': g.label, 'data-ws-group': g.id },
      el('div', { className: 'ws-group-tools' }, g.large.map((id) => tool(id, 'ribbon')), g.stacks.map((ids) => el('div', { className: 'ws-stack' }, ids.map((id) => tool(id, 'ribbon')))),
        g.more?.length ? el('details', { className: 'tr-more ws-group-more' }, el('summary', { 'aria-label': T('shell.ws.toolrows.more', { group: g.label }), title: g.label }, '▾'),   // 0.11 UI.6: a group's `visible` (v2 files only)
          el('div', { className: 'tr-more-list' }, g.more.map((id) => tool(id, 'ribbon', true)))) : null),
      el('span', { className: 'ws-group-title' }, g.label))));
    D?.decorate('ribbon', R.ribbon);   // UI.21: a grip on each group
    refreshTools(); P.ribbon.x?.decorate?.();
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
    const row = (attrs, icon, label, keys, off, why, id = '') => {
      const ic = blockIcon({ id, label, bi: typeof icon === 'string' ? icon : '', own: typeof icon === 'string' ? null : icon, block: 'file', fallbackBi: 'bi-dot' });
      return el('button', { type: 'button', role: 'menuitem', tabindex: -1, className: 'ws-file-item', 'aria-disabled': off ? 'true' : 'false', title: off ? why : label, ...attrs },
        ic, el('span', { className: 'ws-file-label' }, label), keys ? el('kbd', {}, keys) : null);
    };
    const seen = new Set(), rows = [];
    for (const id of P.ribbon.o.file || []) {
      const t = A.tool ? A.tool(id, 'file') : { label: id }, a = can(id, 'file');
      seen.add(t.label.toLowerCase());
      rows.push(row({ 'data-ws-file-action': id }, t.icon, t.label, keyOf('file.' + id) || keyOf(id), !a.enabled, a.reason, id));
    }
    const more = (I?.commands || []).filter((c) => c.group === 'file').map((c) => [c.id, regTool(c.id)]).filter(([, t]) => t.built && !seen.has(t.label.toLowerCase()));
    if (more.length && rows.length) rows.push(el('div', { className: 'ws-file-sep', role: 'separator' }));
    for (const [id, t] of more) { const w = I.why ? I.why(id) : ''; rows.push(row({ 'data-ws-file-cmd': id }, t.icon, t.label, keyOf(id), !!w, w, id)); }
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
    const R = P.ribbon, d = b.ownerDocument, torn = rpop.isOpen();
    const items = torn ? [[T('shell.ws.tear.back'), 'bi-box-arrow-in-down-left', () => dockRibbon()]]
      : [R.o.tearOff ? [T('shell.ws.tear'), 'bi-window-plus', () => tearOff()] : null,
        R.o.collapse ? (collapsed ? [T('shell.ws.ribbon.pin'), 'bi-pin-angle', () => setCollapsed(false)] : [T('shell.ws.ribbon.collapse'), 'bi-arrows-collapse', () => setCollapsed(true)]) : null].filter(Boolean);
    const ul = d.createElement('ul'); ul.className = 'shell-panel-menu'; ul.setAttribute('role', 'menu'); ul.setAttribute('aria-label', T('shell.ws.ribbon.menu'));
    for (const [label, ic, run] of items) {
      const li = d.createElement('li'); li.setAttribute('role', 'none');
      const m = d.createElement('button'); m.type = 'button'; m.setAttribute('role', 'menuitem'); m.tabIndex = -1;
      m.append(blockIcon({ bi: ic, block: 'ribbonmenu' }), ' ' + label);
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
  /** The ribbon in its own window (UI.2: the same window service as every other unit, app-workspace-popout.js). The tab row and the
   *  ribbon move into it (their nodes, so handlers and state go along); stylesheets, theme and interface size are copied and kept in step;
   *  keys reach the app. */
  const ribbonNodes = [];
  let ribbonWin = null;   // made on first use: `listeners` is declared further down
  const rpop = { isOpen: () => !!ribbonWin?.isOpen(), back: () => ribbonWin?.back(), get box() { return ribbonWin?.box; } };
  const makeRibbonWin = () => popout({ name: 'ribbon-' + A.app, nodes: ribbonNodes, cls: 'ws-ribbon-window', boxCls: 'ws-ribbon-box', skipKeys: '.ws-ribbon-tabs [role="tab"]', listeners,
    title: () => T('shell.ws.tear.title', { app: appName }),
    size: () => ({ w: Math.min(screen.availWidth || 1400, 1400), h: Math.round(13.5 * parseFloat(getComputedStyle(document.documentElement).fontSize)) }),
    onChange: (open) => {
      const R = P.ribbon;
      closeRibbonMenu();
      if (open) { renderRibbonTabs(); resized(); say(T('shell.ws.tear.done')); return; }
      if (R) renderRibbonTabs();
      resized();
    } });
  function ribbonMake() { const R = P.ribbon; ribbonNodes.splice(0, ribbonNodes.length, R.tabs, R.ribbon); if (!ribbonWin) ribbonWin = makeRibbonWin(); return ribbonWin; }
  function tearOff() {
    closeRibbonMenu();
    if (!ribbonMake().open()) { say(T('shell.ws.tear.blocked'), true); return false; }
    return true;
  }
  function dockRibbon() { rpop.back(); }

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
    // Never the same tools twice (owner 2026-11-11, "smaller toolbars is better"): an app whose toolbox column carries every tool of its toolbar
    // says so (adapter.toolbarIn: ['toolbox']), and in a layout that has that block the toolbar steps aside as if the layout had left it out.
    // The mark on the toolbar (data-ws-in) lets the app's adapter list in that block the tools the toolbar kept under its More menus.
    const dup = o.place === 'none' ? null : (A.toolbarIn || []).find((b) => cur.blocks.has(b) && cur.blocks.get(b).place !== 'none') || null;
    if (o.place === 'none' || dup) { tb.classList.add('ws-hide'); if (dup) tb.dataset.wsIn = dup; P.toolbar = { el: tb, hidden: true }; return; }
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
    const props = A.showProperties ? el('button', { type: 'button', className: 'ws-props-btn', 'data-ws-props': '' }, blockIcon({ bi: 'bi-card-list', block: 'infobox' }), el('span', {}, T('shell.ws.props'))) : null;
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
  let tbPop = null, trPop = null, sbPop = null;
  function mountToolbox(o) {
    const list = el('div', { className: 'tbx-groups' });
    const head = el('div', { className: 'tbx-head' }, el('span', {}, T('shell.ws.tbx')));
    const box = el('nav', { className: 'tbx-toolbox ws-block', 'data-ws-blk': 'toolbox', 'aria-label': T('shell.ws.tbx') }, head, list);
    // the "…" menu always has Collapse all / Expand all (groups fold as <details>); Move to a window is there when the toolbox can leave
    const foldAll = (open) => { for (const d of list.querySelectorAll('details.tbx-group')) d.open = open; };
    const folds = o.collapse ? [[T('shell.ws.tbx.collapse'), 'bi-chevron-double-up', () => foldAll(false)], [T('shell.ws.tbx.expand'), 'bi-chevron-double-down', () => foldAll(true)]] : [];
    if (o.tearOff || folds.length) head.append(menuButton({ t: T, label: T('shell.ws.toolbox.menu'), backLabel: T('shell.ws.toolbox.back'), isOpen: () => !!tbPop?.isOpen(), extra: folds, noTear: !o.tearOff,
      open: () => { if (!tbOpen()) say(T('shell.ws.tear.blocked'), true); }, back: () => tbPop?.back() }));
    region(o.place).append(box);
    P.toolbox = { el: box, list, o };
    renderToolbox();
  }
  function tbMake() {
    const reg = regions.get(cur.blocks.get('toolbox').place);
    if (!tbPop) tbPop = popout({ name: 'toolbox-' + A.app, nodes: [P.toolbox.el], cls: 'tbx-popout', listeners,
      title: () => T('shell.ws.toolbox.window', { app: appName }), size: () => ({ w: 300, h: Math.min(screen.availHeight || 900, 900) }),
      onChange: (open) => { reg?.classList.toggle('ws-out', open); measure(); soon(); } });
    return tbPop;
  }
  function tbOpen() { return tbMake().open(); }
  // Auto-focus panel (Settings › Global): the groups close each other, and an app can link a group to a section of another panel (window.ccAutoFocus.get('tbx-<app>'))
  let tbxAfCtl = null;
  function tbxAf() {
    const X = P.toolbox;
    if (!tbxAfCtl && X && X.o.collapse && window.ccAutoFocus) tbxAfCtl = window.ccAutoFocus.register({ id: 'tbx-' + A.app, panel: X.list, mode: 'details', unit: 'details.tbx-group', idAttr: 'data-tbx-group' });
    return tbxAfCtl;
  }
  window.addEventListener('load', () => tbxAf()?.refresh());
  /** Drawn on mount and again whenever toolbox()'s groups, names or built tools change (an app whose groups follow its own workspace,
   *  a group an add-on adds), as the ribbon redraws on its tab signature; folded groups stay folded and the focused tool keeps the focus. */
  function renderToolbox() {
    const X = P.toolbox; if (!X) return;
    // a group may carry `more`: tools that sit behind a More button of the group, as a named list beside the column (an app whose toolbar
    // stepped aside for the toolbox lists its More menus' tools there, so every tool is still one click and a pick away: 0.10)
    const groups = toolboxData('toolbox').map((g) => { const t = g.tools.filter((id) => built(id, 'toolbox')), n = Number.isInteger(g.visible) ? g.visible : t.length;   // 0.11 UI.6: a group's visible count (v2 files only)
      return { ...g, tools: t.slice(0, n), more: [...t.slice(n), ...(g.more || []).filter((id) => built(id, 'toolbox'))] }; });
    const sig = JSON.stringify([groups.map((g) => [g.id, g.label, g.tools, g.more]), X.o.mine ? mine.sig() : null]);
    if (sig === X.sig) return;
    X.sig = sig;
    const shut = new Set([...X.list.querySelectorAll('details.tbx-group:not([open])')].map((d) => d.dataset.tbxGroup));
    const focused = X.list.contains(X.list.ownerDocument.activeElement) ? X.list.ownerDocument.activeElement.dataset?.tbxTool : null;
    X.list.replaceChildren(...groups.map((g) => {
      const mk = (id) => {
        const t = A.tool(id, 'toolbox');
        const ic = blockIcon({ id, label: t.label, bi: typeof t.icon === 'string' ? t.icon : '', own: typeof t.icon === 'string' ? null : t.icon, block: 'toolbox' });
        return el('button', { type: 'button', className: 'tbx-tool', 'data-tbx-tool': id, 'aria-pressed': 'false', title: t.label, draggable: X.o.mine ? 'true' : null }, ic, el('span', {}, t.label));
      };
      const tools = g.tools.map(mk);
      if (!tools.length && !g.more.length) return null;
      const moreTitle = T('shell.ws.tbx.more.title', { group: g.label });
      const more = g.more.length ? el('details', { className: 'tr-more tbx-more', 'data-tbx-more': g.id },
        el('summary', { className: 'tbx-tool', 'aria-label': moreTitle, title: moreTitle }, blockIcon({ bi: 'bi-three-dots', block: 'toolbox' }), el('span', {}, T('shell.ws.tbx.more'))),
        el('div', { className: 'tr-more-list', role: 'group', 'aria-label': moreTitle }, g.more.map(mk))) : null;
      const body = el('div', { className: 'tbx-tools' }, tools, more);
      return X.o.collapse ? el('details', { className: 'tbx-group', open: !shut.has(g.id), 'data-tbx-group': g.id }, el('summary', {}, g.label), body)
        : el('section', { className: 'tbx-group', 'data-tbx-group': g.id }, el('div', { className: 'tbx-group-title' }, g.label), body);
    }).filter(Boolean));
    if (X.o.mine) X.list.prepend(mine.group(X.o, shut));
    D?.decorate('toolbox-list', X.list);
    if (focused) X.list.querySelector('[data-tbx-tool="' + CSS.escape(focused) + '"]')?.focus();
    tbxAf()?.refresh();
  }
  function refreshToolbox(s) {
    const X = P.toolbox; if (!X) return;
    for (const b of all('[data-tbx-tool]')) {
      const id = b.dataset.tbxTool, a = can(id, 'toolbox');
      b.setAttribute('aria-pressed', A.pressed && A.pressed(id, 'toolbox') ? 'true' : 'false');
      b.setAttribute('aria-disabled', a.enabled ? 'false' : 'true');
      { const d = declared(id, 'toolbox'); b.hidden = !!d && !d.visible; }
      b.title = A.tool(id, 'toolbox').label + (a.enabled ? '' : ' — ' + a.reason);
    }
    if (X.o.mine) mine.refresh(X.list);
  }

  /** The title bar's quick buttons: the layout's list, with Home first for an app that has a home page of its own (it offers the `home` action: SuperCad Studio's welcome page), so the way back to it is always in the bar. */
  const quickIds = (o) => { const q = o.quick || []; return (A.actions || []).includes('home') && !q.includes('home') ? ['home', ...q] : q; };

  // ---- tool rows (Duncan, 0.9 DU.1): the toolbox's groups as two rows; each group shows its first tools, the rest sit under ▾ ----
  function mountToolrows(o) {
    const rows = el('div', { className: 'tr-rows' });
    const box = el('nav', { className: 'tr-toolrows ws-block', 'data-ws-blk': 'toolrows', 'aria-label': T('shell.ws.toolrows') }, rows);
    if (o.tearOff) box.append(menuButton({ t: T, label: T('shell.ws.toolrows.menu'), backLabel: T('shell.ws.toolrows.back'), isOpen: () => !!trPop?.isOpen(),
      open: () => { if (!trOpen()) say(T('shell.ws.tear.blocked'), true); }, back: () => trPop?.back() }));
    region(o.place).append(box);
    P.toolrows = { el: box, rows, o };
    renderToolrows();
  }
  function trMake() {
    if (!trPop) trPop = popout({ name: 'toolrows-' + A.app, nodes: [P.toolrows.el], cls: 'tr-popout', listeners,
      title: () => T('shell.ws.toolrows.window', { app: appName }), size: () => ({ w: Math.min(screen.availWidth || 1200, 1100), h: 190 }),
      onChange: () => { measure(); soon(); } });
    return trPop;
  }
  function trOpen() { return trMake().open(); }
  function renderToolrows() {
    const X = P.toolrows; if (!X) return;
    // BK.32 (additive): an adapter may say how many of a group's tools are in the row (`visible`, e.g. a person's own arrangement, app-toolrows-arrange.js)
    // and which row the group is in (`row` 1 | 2); a group without them is laid out as before (the layout's `visible` and `split`).
    const groups = toolboxData('toolrows').map((g) => ({ ...g, tools: g.tools.filter((id) => built(id, 'toolrows')),
      ...(Number.isInteger(g.visible) ? { visible: g.tools.slice(0, g.visible).filter((id) => built(id, 'toolrows')).length } : {}) })).filter((g) => g.tools.length);
    const sig = JSON.stringify(groups.map((g) => [g.id, g.label, g.tools, g.visible ?? null, g.row ?? null]));
    if (sig === X.sig) return;
    X.sig = sig;
    const split = X.o.split || Math.ceil(groups.length / 2), visible = X.o.visible || 7;
    // icons: "set" (Duncan) = the CadCraft icon set (app-workspace-icons.js: layered vectors, Full colour or Outline in the person's colour, Settings ›
    // Icons); a tool it has no drawing for gets Bootstrap Icons, then the app's own. Settings' "Each app's own drawings" keeps the app's for all.
    const mk = (id, compact) => {
      const b = tool(id, 'toolrows', compact);
      if (X.o.icons !== 'set' || iconStyle() === 'app' || !b.firstChild) return b;
      const label = A.tool(id, 'toolrows').label, key = iconKey(id, label), node = key ? iconNode(key) : null;
      if (node) b.firstChild.replaceWith(node);
      else { const c = iconFor(id, label); if (c) b.firstChild.replaceWith(el('i', { className: 'bi ' + c + ' ws-icon-bi ws-set', 'aria-hidden': 'true' })); }
      return b;
    };
    const grp = (g) => {
      const n = Number.isInteger(g.visible) ? g.visible : visible, shown = g.tools.slice(0, n), more = g.tools.slice(n);
      return el('div', { className: 'tr-group', role: 'group', 'data-tr-group': g.id, 'aria-label': g.label },
        shown.map((id) => mk(id)),
        more.length ? el('details', { className: 'tr-more' }, el('summary', { 'aria-label': T('shell.ws.toolrows.more', { group: g.label }), title: g.label }, '▾'), el('div', { className: 'tr-more-list' }, more.map((id) => mk(id, true)))) : null);
    };
    closeMore(null);
    const byRow = groups.some((g) => g.row === 1 || g.row === 2);
    X.rows.replaceChildren(el('div', { className: 'tr-row', 'data-tr-row': '1' }, (byRow ? groups.filter((g) => g.row !== 2) : groups.slice(0, split)).map(grp)),
      el('div', { className: 'tr-row', 'data-tr-row': '2' }, (byRow ? groups.filter((g) => g.row === 2) : groups.slice(split)).map(grp)));
    D?.decorate('toolrows-rows', X.rows);
  }

  // the ▾ menu floats over the drawing (position: fixed at the ▾): the rows scroll sideways, so an absolute menu would be clipped to a scroll bar
  const closeMore = (except) => { for (const d of document.querySelectorAll('details.tr-more[open]')) if (d !== except) d.removeAttribute('open'); for (const w of [trPop?.box?.ownerDocument]) if (w && w !== document) for (const d of w.querySelectorAll('details.tr-more[open]')) if (d !== except) d.removeAttribute('open'); };
  // Settings › Icons changed: the tool rows are drawn again in the new style
  window.addEventListener('cc-icons', () => { applyIcons(); if (cur && P.toolrows) { P.toolrows.sig = null; renderToolrows(); refreshTools(); } });
  function wireMore() { listen('toggle', (e) => {
    const d = e.target; if (!d.matches?.('details.tr-more') || !d.open) return;
    closeMore(d);
    const list = d.querySelector('.tr-more-list'), r = d.getBoundingClientRect(), win = d.ownerDocument.defaultView;
    if (d.classList.contains('tbx-more')) {   // a toolbox group's More list opens beside the column, as tall as the window allows
      list.style.maxHeight = Math.max(160, win.innerHeight - 16) + 'px';
      const c = (d.closest('.tbx-toolbox') || d).getBoundingClientRect();   // the whole column, its scroll bar included
      const h = Math.min(list.scrollHeight, win.innerHeight - 16), onRight = c.right + list.offsetWidth + 6 <= win.innerWidth;
      list.style.top = Math.round(Math.max(8, Math.min(r.top, win.innerHeight - h - 8))) + 'px';
      list.style.left = Math.round(onRight ? c.right + 2 : Math.max(4, c.left - list.offsetWidth - 2)) + 'px';
      return;
    }
    list.style.top = Math.round(r.bottom) + 'px';
    list.style.left = Math.round(Math.max(4, Math.min(r.left, win.innerWidth - list.offsetWidth - 4))) + 'px';
    list.style.maxHeight = Math.max(120, win.innerHeight - r.bottom - 8) + 'px';
  }, true); }
  document.addEventListener('pointerdown', (e) => { if (cur && !e.target.closest?.('details.tr-more')) closeMore(null); }, true);
  window.addEventListener('resize', () => closeMore(null));

  // ---- Vector (0.9 VEC.1): the menu bar and the left tool palettes (app-workspace-vector.js) ----
  // 0.10 UI.17: the app's mark and name show once in a layout's chrome (pattern 11). A layout with a title bar block carries both there;
  // the menu bar then leaves its own out, whichever of the two blocks is mounted first.
  const dropMenubarDuplicates = () => { P.menubar?.el.querySelectorAll(':scope > .ws-brand').forEach((n) => n.remove()); };
  function mountMenubar(o) {
    P.menubar = vmenu.mount(o, region(o.place));
    if (P.titlebar) { placeMenubar(); return; }
    const brand = brandEl(); P.menubar.el.prepend(brand); bootTo(brand);
  }
  function mountToolpalette(o) { P.toolpalette = vpal.mount(o, region(o.place)); }
  window.addEventListener('cc-vector-palette', (e) => { if (cur && P.palettes) { if (P.palettes.rail) showRail(e.detail); else showLower(e.detail); } });   // Window menu › a palette

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
    if (labDock() && !o.rail && Array.isArray(o.stacks) && o.stacks.length) { mountStacks(o, host, pal, label, dom); return; }   // 0.11 UI.6 (lab): two true stacks
    o = { ...o, ...stacksToPalettes(o) };   // v2: two stacks fill the panel's upper palette and its tabs
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
    // Duncan's icon rail: one palette at a time, chosen from a column of icons on the panel's left (the heading tabs and the split step aside)
    let rail = null;
    if (o.rail) {
      const names = [o.upper, ...lower].filter(Boolean), ICON = { properties: 'bi-sliders', browser: 'bi-list-nested', panel: 'bi-layers' };
      rail = el('div', { className: 'ws-rail', role: 'tablist', 'aria-orientation': 'vertical', 'aria-label': T('shell.ws.rail') },
        names.map((n, i) => el('button', { type: 'button', className: 'ws-rail-btn', role: 'tab', 'data-ws-rail': n, 'aria-selected': String(i === 0), title: label(n), 'aria-label': label(n) }, blockIcon({ bi: ICON[n] || 'bi-square', block: 'rail' }))));
      palettes.classList.add('ws-railed'); palettes.prepend(rail);
    }
    P.palettes = { el: palettes, host, slots, lower, tabs, hints, kids, upper, upperName: o.upper || null, rail, label, dom, name: [o.upper ? label(o.upper) : null, lower[0] ? label(lower[0]) : null].filter(Boolean).join(' · ') };
    showLower(lower[0]);
    if (rail) showRail(rail.querySelector('[data-ws-rail]').dataset.wsRail);
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
  /** 0.11 UI.6 (lab): palettes.stacks drawn as true stacks: each stack its own tabs, one over the other (a split between), or the second in the other panel
   *  (place2). Every palette is a tab of its stack (data-ws-lower), so the Window menu, the tab clicks and refreshPalettes work as before. */
  function mountStacks(o, host, pal, label, dom) {
    const other = o.place2 && o.stacks.length === 2 ? region(o.place2) : null;
    const awayOn = !!other && other !== host && !!other.getClientRects().length;
    const slots = {}, hints = {}, stackOf = {};
    const lower = o.stacks.flat();
    const secs = o.stacks.map((names, i) => {
      const tabs = el('div', { className: 'ws-lower-tabs', role: 'tablist', 'aria-label': T('shell.ws.lower') },
        names.map((n, j) => btn(label(n), { role: 'tab', 'data-ws-lower': dom(n), 'aria-selected': String(j === 0), tabindex: j === 0 ? 0 : -1 })));
      for (const [j, n] of names.entries()) {
        stackOf[n] = i;
        slots[n] = el('div', { className: 'ws-palette-scroll' + (n === 'panel' ? ' ws-model-slot' : ''), ['data-ws-' + dom(n) + '-scroll']: '', hidden: j > 0 });
        if (pal[n]?.hint) hints[n] = el('p', { className: 'ws-browser-hint', hidden: j > 0 }, pal[n].hint);
      }
      return el('section', { className: 'ws-browser ws-palette ws-stack', 'data-ws-stack': String(i), 'aria-label': names.map(label).join(', ') }, el('header', { className: 'ws-palette-heading' }, tabs),
        ...names.flatMap((n) => [hints[n] || null, slots[n]]));
    });
    const here = awayOn ? secs.slice(0, 1) : secs;
    const palettes = el('div', { className: 'ws-palettes ws-stacks' + (here.length === 2 ? '' : ' ws-one') }, here[0]);
    if (here[1]) stackSplit(palettes, here[1]);
    const away = awayOn ? el('div', { className: 'ws-palettes ws-one ws-stack-away', 'data-ws-stack-away': o.place2 }, secs[1]) : null;
    const kids = [...host.children].filter((k) => !k.classList.contains('shell-grip') && !k.classList.contains('shell-float-size'));
    if (slots.panel) for (const k of kids) move(k, slots.panel); else for (const k of kids) k.classList.add('ws-hide');
    host.append(palettes); host.classList.add('ws-panel-host');
    if (away) { const g = other.querySelector(':scope > .shell-grip'); if (g) g.after(away); else other.prepend(away); }
    P.palettes = { el: palettes, away, host, slots, lower, tabs: palettes, hints, kids, upper: null, upperName: null, rail: null, label, dom, stackOf, secs,
      name: o.stacks.map((s) => label(s[0])).join(' · ') };
    for (const s of o.stacks) showLower(s[0]);
    for (const n of [palettes, away].filter(Boolean)) for (const [type, fn, capture] of listeners) n.addEventListener(type, (e) => { if (n.ownerDocument !== document) fn(e); }, capture);
  }
  /** The second stack under the first, with the split between them (resizable by pointer and arrow keys). */
  function stackSplit(palettes, sec) {
    const split = el('div', { className: 'ws-hsplit', role: 'separator', tabindex: 0, 'aria-orientation': 'horizontal', 'aria-label': T('shell.ws.split.h'), 'aria-valuemin': 25, 'aria-valuemax': 75, 'aria-valuenow': 50 });
    palettes.classList.remove('ws-one'); palettes.append(split, sec);
    let height = 50;
    const resize = (v) => { height = Math.max(25, Math.min(75, v)); palettes.style.setProperty('--ws-props', height + '%'); split.setAttribute('aria-valuenow', Math.round(height)); };
    split.addEventListener('pointerdown', (e) => { if (e.button !== 0) return; e.preventDefault(); split.setPointerCapture(e.pointerId); split.dataset.dragging = 'true'; });
    split.addEventListener('pointermove', (e) => { if (split.hasPointerCapture(e.pointerId)) { const r = palettes.getBoundingClientRect(); resize((e.clientY - r.top) / r.height * 100); } });
    split.addEventListener('pointerup', (e) => { if (split.hasPointerCapture(e.pointerId)) split.releasePointerCapture(e.pointerId); delete split.dataset.dragging; });
    split.addEventListener('keydown', (e) => { if (['ArrowUp', 'ArrowDown'].includes(e.key)) { e.preventDefault(); resize(height + (e.key === 'ArrowDown' ? 5 : -5)); } });
  }
  /** After the layout's classes are on: a layout may hide the other panel (DetailCraft's right one), so its stack comes home under the first. */
  function stackHome() {
    const Q = P.palettes; if (!Q?.away || Q.away.getClientRects().length) return;
    const sec = Q.away.querySelector(':scope > .ws-stack'); Q.away.remove(); Q.away = null;
    if (sec) stackSplit(Q.el, sec);
  }
  function showLower(which) {
    const Q = P.palettes; if (!Q || !which) return;
    if (Q.stackOf) {   // true stacks: a tab picks within its own stack
      const n = Q.lower.find((x) => Q.dom(x) === which || x === which); if (!n) return;
      const i = Q.stackOf[n];
      for (const b of Q.secs[i].querySelectorAll('[data-ws-lower]')) { const on = b.dataset.wsLower === Q.dom(n); b.setAttribute('aria-selected', on ? 'true' : 'false'); b.tabIndex = on ? 0 : -1; }
      for (const x of Q.lower) if (Q.stackOf[x] === i) { Q.slots[x].hidden = x !== n; if (Q.hints[x]) Q.hints[x].hidden = x !== n; }
      Q.shown = n; return;
    }
    const n = Q.lower.find((x) => Q.dom(x) === which || x === which) || Q.lower[0];
    for (const b of Q.tabs.querySelectorAll('[data-ws-lower]')) { const on = b.dataset.wsLower === Q.dom(n); b.setAttribute('aria-selected', on ? 'true' : 'false'); b.tabIndex = on ? 0 : -1; }
    for (const x of Q.lower) { Q.slots[x].hidden = x !== n; if (Q.hints[x]) Q.hints[x].hidden = x !== n; }
    Q.shown = n;
  }
  /** The icon rail: only the chosen palette shows (the upper one, or one of the lower ones); the others and the split are hidden by CSS. */
  function showRail(name) {
    const Q = P.palettes; if (!Q?.rail) return;
    for (const b of Q.rail.querySelectorAll('[data-ws-rail]')) { const on = b.dataset.wsRail === name; b.setAttribute('aria-selected', on ? 'true' : 'false'); b.tabIndex = on ? 0 : -1; }
    const isUpper = name === Q.upperName;
    Q.el.dataset.wsRailShows = isUpper ? 'upper' : 'lower';
    if (!isUpper) showLower(name);
  }
  function refreshPalettes() {
    const Q = P.palettes; if (!Q) return;
    if (Q.away) stackHome();   // the other panel may be hidden after the layout mounted
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
          btn([blockIcon({ bi: v.icon || 'bi-square', key: !v.icon || v.icon === 'bi-square' ? 'viewport' : '', block: 'views' }), ' ' + v.name], { role: 'tab', 'data-ws-drawing': id, 'aria-selected': String(active === id) }),
          btn('×', { 'aria-label': T('shell.ws.close.view', { name: v.name }), 'data-ws-close': id })); }));   // i18n-ignore: a close glyph
      }
      stage.classList.toggle('ws-no-view', !!s.document && !active);
      V.empty.hidden = !s.document || !!active;
    } else {
      const now = A.views.current();
      const sig = JSON.stringify([list.map((v) => [v.id, v.name]), now]);
      if (sig !== V.sig) {
        V.sig = sig;
        V.el.replaceChildren(...list.map((v) => btn([blockIcon({ bi: v.icon || 'bi-square', key: !v.icon || v.icon === 'bi-square' ? 'viewport' : '', block: 'views' }), el('span', {}, v.name)],
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
    const cmd = o.command && !(editOn() && document.querySelector('[data-cmd-bar]')) ? dockedCommandLine({ t: T, app: A.app }) : null;   // UI.17 (lab only): an app with its own command bar (CadCraft) keeps that one, never two fields;   // 0.10 BK.34 (app-cmdline.js): the one docked command line: type anywhere, history on focus
    const bar = el('footer', { className: 'ws-statusbar ws-block', 'data-ws-blk': 'statusbar' }, cmd, el('span', { className: 'ws-layout-label' }, layoutName(cur.layout)), el('span', { 'data-ws-selection': '' }), slot);
    if (o.tearOff) bar.append(menuButton({ t: T, label: T('shell.ws.status.menu'), backLabel: T('shell.ws.status.back'), isOpen: () => !!sbPop?.isOpen(),
      open: () => { if (!sbOpen()) say(T('shell.ws.tear.blocked'), true); }, back: () => sbPop?.back() }));
    region(o.place).append(bar);
    if (A.status) move(A.status, slot);
    P.statusbar = { el: bar };
  }
  function sbMake() {
    if (!sbPop) sbPop = popout({ name: 'status-' + A.app, nodes: [P.statusbar.el], cls: 'sb-popout', listeners,
      title: () => T('shell.ws.status.window', { app: appName }), size: () => ({ w: 760, h: 120 }), onChange: () => { measure(); soon(); } });
    return sbPop;
  }
  function sbOpen() { return sbMake().open(); }

  // =========================================================== UI.21 / UI.26 / UI.3: the dock manager (switch on only) ===========================================================
  /** What app-dock.js needs from the engine: the blocks that may leave for a window, the groups that may dock, the zones, the one menu. */
  const blocked = () => say(T('shell.ws.tear.blocked'), true);
  function dockHost() {
    const b = (kind, label, tear, isOpen, open, back, extra = () => []) => (P[kind] && (kind !== 'ribbon' || P.ribbon.tabs) ? { label, tear: !!tear, isOpen, open: () => { const ok = open(); if (!ok) blocked(); return ok; }, back, extra } : null);
    const blocks = {
      ribbon: P.ribbon ? b('ribbon', T('shell.ws.ribbon'), P.ribbon.o.tearOff, () => rpop.isOpen(), () => ribbonMake().open(), () => dockRibbon(),
        () => (P.ribbon.o.collapse && !rpop.isOpen() ? [collapsed ? [T('shell.ws.ribbon.pin'), 'bi-pin-angle', () => setCollapsed(false)] : [T('shell.ws.ribbon.collapse'), 'bi-arrows-collapse', () => setCollapsed(true)]] : [])) : null,
      toolbox: P.toolbox ? b('toolbox', T('shell.ws.tbx'), P.toolbox.o.tearOff, () => !!tbPop?.isOpen(), () => tbOpen(), () => tbPop?.back(),
        () => (P.toolbox.o.collapse ? [[T('shell.ws.tbx.collapse'), 'bi-chevron-double-up', () => { for (const d of P.toolbox.list.querySelectorAll('details.tbx-group')) d.open = false; }], [T('shell.ws.tbx.expand'), 'bi-chevron-double-down', () => { for (const d of P.toolbox.list.querySelectorAll('details.tbx-group')) d.open = true; }]] : [])) : null,
      toolrows: P.toolrows ? b('toolrows', T('shell.ws.toolrows'), P.toolrows.o.tearOff, () => !!trPop?.isOpen(), () => trOpen(), () => trPop?.back()) : null,
      statusbar: P.statusbar ? b('statusbar', T('shell.dock.block.statusbar'), cur.blocks.get('statusbar')?.tearOff, () => !!sbPop?.isOpen(), () => sbOpen(), () => sbPop?.back()) : null,
    };
    for (const k of Object.keys(blocks)) if (!blocks[k]) delete blocks[k];
    if (blocks.ribbon) blocks.ribbon.unfold = () => { if (P.ribbon?.o.collapse && collapsed) setCollapsed(false); };   // 0.11 UI.26: a pinned ribbon stays open
    const groups = (kind) => (kind === 'ribbon' ? (P.ribbon ? ribbonAll().flatMap((t) => t.groups.map((g) => ({ key: 'ribbon:' + t.tab + ':' + g.id, id: g.id, tab: t.tab, label: g.label, tools: [...g.large, ...g.stacks.flat(), ...(g.more || [])] }))) : [])
      : P[kind] ? toolboxAll(kind).map((g) => ({ key: kind + ':' + g.id, id: g.id, label: g.label, tools: [...g.tools, ...(g.more || [])] })) : []);
    return { app: A.app, layout: () => cur?.key || null, T, el, say, stage, doc: document, blocks, groups,
      tool: (id, block) => tool(id, block), built: (id, block) => built(id, block), region: (p) => region(p), host: (p) => (p === 'left-panel' ? left : p === 'right-panel' ? right : null),
      menu: (btn, label, items) => openMenu(btn, label, items), hide: (kind) => editor.moveBlock(kind, 'none'),
      // 0.11 (lab): the layout's own block, an edit of it through the layout editor (undone in Arrange), the panel's palettes as drawn, Arrange
      lab: () => labDock(), block: (kind) => cur?.layout.blocks.find((x) => x.block === kind) || null, editBlock: (kind, fn) => editor.editBlock(kind, fn),
      movePal: (o, name, to) => movePalette(o, name, to), arrange: () => api.arrange(),
      ribbonTab: (t) => { if (P.ribbon && t && ribbonData().some((x) => x.tab === t)) { tab = t; renderRibbonTabs(); } },   // a group shown again: its tab comes to the front
      palettes: () => (P.palettes ? { el: P.palettes.el, away: P.palettes.away || null, host: P.palettes.host, label: P.palettes.label, dom: P.palettes.dom,
        stacks: paletteStacks(cur?.layout.blocks.find((x) => x.block === 'palettes') || {}) } : null),
      redraw: () => { if (P.ribbon) renderRibbonTabs(); if (P.toolbox) { P.toolbox.sig = null; renderToolbox(); } if (P.toolrows) { P.toolrows.sig = null; renderToolrows(); } refreshTools(); measure(); soon(); } };
  }
  /** On entering a layout with the switch on: load the dock manager, draw the heads, the palettes, and offer to restore the windows that were out (UI.3). */
  function startDock() {
    if (!dockOn() || guest || !cur) return;
    const at = cur.key;
    windows.remember(() => (cur && !guest ? 'cc-ws-windows:' + A.app + ':' + cur.key : null));
    if (!document.getElementById('cc-app-dock-css')) { const l = document.createElement('link'); l.id = 'cc-app-dock-css'; l.rel = 'stylesheet'; l.href = new URL('../css/app-dock.css', import.meta.url).href; document.head.append(l); }
    import('./app-dock.js').then((m) => {
      if (!cur || cur.key !== at || D) return;
      D = m.dockManager(dockHost());
      for (const k of ['toolbox', 'toolrows', 'statusbar']) if (P[k]?.el) D.decorate(k, P[k].el);
      if (P.palettes) D.decorate('palettes', P.palettes.el);   // 0.11 UI.5 (lab): a palette's tab drags it out of its stack
      if (P.ribbon) ribbonMake(); if (P.toolbox?.o.tearOff) tbMake(); if (P.toolrows?.o.tearOff) trMake(); if (cur.blocks.get('statusbar')?.tearOff && P.statusbar) sbMake();   // so a remembered window can be restored before its first use
      dockHost().redraw(); D.refresh(); winOffer();
    }).catch((e) => console.error('dock', e));
  }
  function stopDock() { if (!D) return; D.destroy(); D = null; winOffer(true); }
  /** UI.3: "Restore my windows" in one click (a browser opens windows only inside a click), where the panels window offers its own. */
  let offer = null, winSkip = null;
  // 0.11 UI.6 (lab): the blocks a layout puts in a window ("place": "window") wait at home for one click (a browser opens a window only inside one)
  const WIN_OPEN = { ribbon: () => rpop.isOpen(), toolbox: () => !!tbPop?.isOpen(), toolrows: () => !!trPop?.isOpen(), statusbar: () => !!sbPop?.isOpen() };
  const WIN_GO = { ribbon: () => ribbonMake().open(), toolbox: () => tbOpen(), toolrows: () => trOpen(), statusbar: () => sbOpen() };
  const wantWin = () => (labDock() && cur && winSkip !== cur.key ? cur.list.filter((b) => b.window && WIN_GO[b.block] && P[b.block] && !WIN_OPEN[b.block]()).map((b) => b.block) : []);
  function winOffer(hide = false) {
    const n = hide ? 0 : windows.pending().length + wantWin().length;
    if (!n) { offer?.remove(); offer = null; return; }
    if (!offer) {
      offer = el('div', { className: 'shell-pw-offer ws-win-offer', role: 'region', 'aria-label': T('shell.dock.restore.aria') },
        el('p', {}, el('span', { 'data-ws-win-text': '' })), btn(T('shell.dock.restore'), { className: 'btn-plot btn-sm-cc', 'data-ws-win-restore': '' }), btn(T('shell.panels.offer.keep'), { className: 'btn-line btn-sm-cc', 'data-ws-win-keep': '' }));
      offer.addEventListener('click', (e) => {
        const b = e.target.closest('button'); if (!b) return;
        if (b.hasAttribute('data-ws-win-restore')) {
          const r = windows.restore(); let blocked = r.blocked || 0;
          for (const k of wantWin()) if (!WIN_GO[k]()) blocked++;
          if (blocked) { say(T('shell.dock.restore.more', { n: blocked }), true); winOffer(); return; }
        } else { windows.forget(); if (cur) winSkip = cur.key; }
        winOffer(true);
      });
      document.body.append(offer);
    }
    const back = windows.pending().length > 0;
    offer.querySelector('[data-ws-win-text]').textContent = back ? T('shell.dock.restore.text', { n }) : T('shell.dock.windowed.text', { n });
    offer.querySelector('[data-ws-win-restore]').textContent = back ? T('shell.dock.restore') : T('shell.dock.windowed.open');
  }

  // =========================================================== enter / leave ===========================================================
  const MOUNT = { titlebar: mountTitlebar, ribbon: mountRibbon, options: mountOptions, toolbar: mountToolbar, infobox: mountInfobox, toolbox: mountToolbox, toolrows: mountToolrows,
    viewports: (o) => { P.viewports = { o }; A.viewports.set(o.layout || 'four'); },
    palettes: mountPalettes, menubar: mountMenubar, toolpalette: mountToolpalette, viewtabs: mountViewtabs, viewbar: (o) => { P.viewbar = mountSlotsBar(o, 'ws-view-controls', T('shell.ws.viewcontrols')); },
    quickbar: (o) => { P.quickbar = mountSlotsBar(o, 'tbx-quick', T('shell.ws.quickbar')); }, statusbar: mountStatusbar,
    petpalette: () => { pet.hide(); stage.append(pet.el); P.petpalette = { el: pet.el, float: true }; } };
  // the interface blocks of ui-blocks-10 (UI.9 to UI.11): mounted by app-workspace-blocks.js through the host the engine builds for them
  const extras = [];
  const extraEnv = () => ({ A, T, say, stage, appName, region, state, ribbon: () => ribbonData(), soon, layouts: () => api.layouts().filter((l) => l.ok).map((l) => ({ key: l.key, name: l.name })),
    layout: () => (cur ? cur.key : 'standard'), setLayout: (key) => { if (window.ccShellWorkspace) window.ccShellWorkspace.set(key); else { try { localStorage.setItem('cc-workspace', key); } catch (e) { /* this page only */ } decide(true); } } });
  for (const k of EXTRA_KINDS) MOUNT[k] = (o) => { extras.push(mountExtra(extraEnv(), k, o)); };
  /** UI.11: the ribbon's own extras (a group's ▾ more, slot controls moved into the groups, the contextual tab's label, Alt letters) from app-block-ribbonx.js, once the ribbon is built. */
  function ribbonExtras(o) {
    if (!(o.more || o.slots || o.contextual)) return;
    import('./app-block-ribbonx.js').then((m) => { const R = P.ribbon; if (!R || R.x || !cur) return; const ln = document.getElementById('cc-app-block-css') || (() => { const l = document.createElement('link'); l.id = 'cc-app-block-css'; l.rel = 'stylesheet'; l.href = new URL('../css/app-block.css', import.meta.url).href; document.head.append(l); return l; })();
      R.x = m.enhance(blockHost(extraEnv()), R.tabs, R.ribbon); R.x.decorate?.(); }).catch((e) => console.error('ribbonx', e));
  }
  /** UI.29 + BK.123 (lab only until the owner's switch): density steps, the presentation mode and labels under icons, started once. */
  let chrome = null;
  function startChrome() {
    if (chrome || !editOn() || guest) return;
    chrome = {};
    Promise.all([import('./app-block-density.js'), import('./app-block-labels.js')]).then(([d, l]) => { chrome.density = d.createDensity({ app: A.app }); chrome.labels = l.createLabels({ app: A.app, T }); }).catch((e) => console.error('chrome', e));
  }
  const bodyCls = () => ['ws-on', 'ws-layout-' + cur.layout.id, 'ws-look-' + cur.layout.look.outline, cur.layout.look.names === 'above' ? 'ws-names-above' : null, 'ws-tabs-' + cur.layout.look.tabs, cur.layout.look.density === 'compact' ? 'ws-dense' : null, cur.layout.look.skin ? 'ws-skin-' + cur.layout.look.skin : null,
    ...[...cur.blocks.keys()].map((b) => 'ws-b-' + b), cur.blocks.has('titlebar') || cur.blocks.has('menubar') ? 'has-live-workspace' : null, cur.blocks.has('toolbox') ? 'has-toolbox' : null,
    top || bottom ? 'ws-chrome-on' : null].filter(Boolean);
  // look (v2): names above / below, a zone's own choice, tone, and what a bar does when it is too narrow
  const folds = [];
  function applyLook() {
    const L = cur.layout.look, zones = L.zones || {};
    const host = { top, bottom, 'left-panel': left, 'right-panel': right, ...Object.fromEntries(regions) };
    for (const [place, z] of Object.entries(zones)) if (host[place]) host[place].dataset.wsNames = z.names;
    if (L.tone && L.tone !== 'theme') document.documentElement.dataset.wsTone = L.tone;
    if (L.overflow) document.body.dataset.wsOverflow = L.overflow;
    refold();
  }
  function clearLook() {
    for (const h of [top, bottom, left, right, ...regions.values()]) if (h) delete h.dataset.wsNames;
    delete document.documentElement.dataset.wsTone; delete document.body.dataset.wsOverflow;
    for (const f of folds.splice(0)) f.destroy();
  }
  /** (Re)attach the fold to the bars that exist now; run() on every call, so a resize or a redraw folds again. */
  function refold() {
    if (!cur) return;
    if (!editOn() && !cur.layout.look.overflow) return;   // a released build keeps its bars as they were; a layout that asks (look.overflow, v2) gets it everywhere
    const mode = cur.layout.look.overflow || 'more';
    const want = [];
    if (P.menubar) want.push([P.menubar.menus, () => [...P.menubar.menus.querySelectorAll(':scope > .vw-menu')]]);
    for (const r of P.toolrows?.rows?.querySelectorAll('.tr-row') || []) want.push([r, () => [...r.querySelectorAll(':scope > .tr-group')]]);
    for (const f of folds.splice(0)) f.destroy();
    for (const [bar, items] of want) { const f = foldBar(bar, { items, mode, label: T('shell.ws.more') }); folds.push(f); f.run(); }
  }
  window.addEventListener('resize', () => { if (cur) refold(); });
  function enter(next) {
    cur = next;
    for (const s of A.hide || []) for (const n of document.querySelectorAll(s)) n.classList.add('ws-hide');
    stage.classList.add('ws-stage'); root.classList.add('ws-host');
    for (const b of cur.list) if (b.place !== 'none' || b.block === 'toolbar' || b.block === 'viewports') MOUNT[b.block](b);
    // 0.10 UI.17: a version 2 layout lists what it shows, so a toolbar it does not name is left out (the app's own strip would otherwise sit under the ribbon). Version 1 files
    // (every released layout, and anyone's old file) behave as before.
    if (cur.layout?.version >= 2 && !cur.blocks.has('toolbar') && A.toolbar?.()) MOUNT.toolbar({ block: 'toolbar', place: 'none', order: 99 });
    // the order inside each region follows the layout (mounting goes block by block; re-append by order)
    for (const r of [top, bottom, ...regions.values()].filter(Boolean)) {
      const items = cur.list.filter((b) => b.place !== 'none').map((b) => ({ b, n: partEl(b.block) })).filter((x) => x.n && [].concat(x.n)[0].parentNode === r);
      items.sort((x, y) => x.b.order - y.b.order); for (const { n } of items) for (const m of [].concat(n)) r.append(m);
    }
    root.classList.add('ws-on'); root.dataset.wsLayout = cur.key;
    root.classList.toggle('ws-active', cur.blocks.has('titlebar') || cur.blocks.has('menubar')); root.classList.toggle('tbx-active', cur.blocks.has('toolbox'));
    cur.cls = bodyCls(); document.body.classList.add(...cur.cls); applyLook(); stackHome();
    stageObs.observe(stage, { childList: true }); markFill();
    A.entered?.(ctx);
    resized(); measure();
    startDock();   // UI.21 / UI.26 / UI.3: nothing unless html[data-cc-ws-edit="1"]
  }
  function partEl(block) {
    const p = P[block]; if (!p || p.float) return null;
    if (block === 'ribbon') return [p.tabs, p.ribbon];
    if (block === 'palettes') return null;
    return p.el || null;
  }
  function leave() {
    stopDock();
    clearLook(); destroyExtras(extras.splice(0)); if (P.ribbon?.x) { try { P.ribbon.x.destroy(); } catch (e) { /* gone */ } P.ribbon.x = null; }
    for (const n of stage.querySelectorAll(':scope > [data-corner]')) if (!n.children.length) n.remove();   // the corner stacks a block made and left empty
    A.leaving?.(ctx);
    if (P.viewports) A.viewports.set('single');   // the drawing area goes back to one view
    dockRibbon(); closeRibbonMenu(); closeFileMenu(); tbPop?.back(); tbPop = null; trPop?.back(); trPop = null; sbPop?.back(); sbPop = null; toolOptions(true);
    mine.closeMenu(); fields.clear(); pet.hide(); pet.el.remove();
    bootBack();
    if (P.titlebar) P.titlebar.off();
    if (P.menubar) vmenu.destroy(P.menubar);
    if (P.toolpalette) vpal.clear();
    if (P.toolbar?.el) { P.toolbar.el.classList.remove('ws-toolbar-strip', 'ws-hide'); delete P.toolbar.el.dataset.wsIn; }
    if (P.palettes) { for (const k of P.palettes.kids) k.classList.remove('ws-hide'); }
    restoreAll();
    if (P.palettes) {
      const g = P.palettes.host.querySelector('.shell-grip-name'); if (g?.dataset.wsName) { g.textContent = g.dataset.wsName; delete g.dataset.wsName; }
      P.palettes.el.remove(); P.palettes.away?.remove(); P.palettes.host.classList.remove('ws-panel-host');
    }
    P.viewtabs?.empty?.remove();
    for (const r of regions.values()) { ro.unobserve(r); r.remove(); } regions.clear();
    top?.remove(); bottom?.remove(); top = bottom = null;
    for (const n of document.querySelectorAll('.ws-hide')) n.classList.remove('ws-hide');
    for (const c of stage.children) c.classList.remove('ws-fill', 'ws-flow');
    stageObs.disconnect();
    for (const v of ['--ws-st', '--ws-sb', '--ws-vt', '--ws-vb', '--ws-sl', '--ws-sr']) stage.style.removeProperty(v);
    document.body.classList.remove(...(cur.cls || []));   // a mount that threw part way never set cur.cls
    root.classList.remove('ws-on', 'ws-active', 'tbx-active', 'ws-other', 'ws-host'); stage.classList.remove('ws-stage', 'ws-no-view'); delete root.dataset.wsLayout;
    for (const k of Object.keys(P)) delete P[k];
    const was = cur; cur = null; peeking = false;
    A.left?.({ ...ctx, was: was.key });
    resized();
  }
  function resized() { requestAnimationFrame(() => { A.resized?.(); measure(); edges(); }); }

  // =========================================================== refresh ===========================================================
  function soon() { if (!frame) frame = requestAnimationFrame(() => { frame = 0; refresh(); }); }
  /** The engine is the one writer of the shared state for what the adapter's state() says (selection, tool, dirty, document); an app that knows more
   *  (kinds, mode, view, layer, problems) publishes it itself through ccState.publish. */
  function publishState(s) {
    const ids = (s.selection || []).map((x) => (typeof x === 'object' && x ? String(x.id ?? x.key ?? '') : String(x)));
    ccState.publish({ selection: { ids, count: ids.length, ...(s.kinds ? { kinds: s.kinds, kind: s.kinds[0] || '' } : {}) }, tool: s.tool ? String(s.tool) : '', dirty: !!s.dirty, document: !!s.document }, 'workspace');
  }
  if (!guest) { ccState.subscribe(() => { if (cur) soon(); }); if (A0.select || A0.reveal) ccState.registerHost({ select: (ids) => A0.select?.(ids), reveal: (ids) => (A0.reveal || A0.select)?.(ids), highlight: (ids) => (A0.highlight || A0.select)?.(ids) }); }
  let foldSig = '';
  function refresh() {
    if (!cur) return;
    { const m = P.menubar?.menus, rows = P.toolrows?.rows, sig = [m?.querySelectorAll(':scope > .vw-menu').length, m?.clientWidth, rows?.querySelectorAll('.tr-group').length, rows?.clientWidth].join(); if (sig !== foldSig) { foldSig = sig; refold(); } }
    const s = state(); publishState(s); refreshExtras(extras, s); try { P.titlebar?.blk?.part?.refresh?.(s); } catch (e) { /* a block never throws into the engine */ }
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
    if (P.menubar) vmenu.refresh(P.menubar, s);
    if (P.toolpalette) vpal.render(P.toolpalette, s);
    refreshViewtabs(s);
    if (P.viewbar) P.viewbar.el.querySelector('.ws-drawing-title').textContent = openView()?.name || T('shell.ws.noview');
    refreshPalettes(); refreshInfobox(s); renderToolbox(); refreshToolbox(s); renderToolrows();
    if (P.petpalette) pet.refresh(s);
    A.refresh?.(ctx);
    refreshTools(); toolOptions(); markFill(); measure(); edges();
  }
  function refreshTools() {
    for (const b of all('[data-ws-command]')) {
      const id = b.dataset.wsCommand, block = b.dataset.wsBlock || 'ribbon', a = can(id, block), t = A.tool ? A.tool(id, block) : { label: id };
      b.setAttribute('aria-disabled', a.enabled ? 'false' : 'true');
      { const d = declared(id, block); b.hidden = !!d && !d.visible; }
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
  const scopes = () => [...new Set([top, bottom, root, P.palettes && P.palettes.el.ownerDocument !== document ? P.palettes.el : null, rpop.box, tbPop?.box, trPop?.box, sbPop?.box].filter(Boolean))];
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
    if (b.dataset.wsRail) { showRail(b.dataset.wsRail); return; }
    b.closest('details.tr-more')?.removeAttribute('open');
    if (b.hasAttribute('data-ws-dismiss')) { b.closest('dialog').close(); return; }
    if (b.hasAttribute('data-ws-inventory')) { inventory(); return; }
    if (b.hasAttribute('data-ws-props')) { A.showProperties?.(); return; }
    if (b.hasAttribute('data-ws-file')) { fileMenu(b); return; }
    if (b.dataset.wsTab) {
      const same = b.dataset.wsTab === tab; tab = b.dataset.wsTab;
      // the same tab buttons, re-marked (rebuilding them would split a double-click across two elements)
      for (const x of P.ribbon.tabs.querySelectorAll('[data-ws-tab]')) { const on = x.dataset.wsTab === tab; x.setAttribute('aria-selected', on ? 'true' : 'false'); x.tabIndex = on ? 0 : -1; }
      renderRibbon(); b.focus();
      if (collapsed && !rpop.isOpen()) peek(!(same && peeking));   // collapsed: a tab shows its tools over the drawing; again hides them
      return;
    }
    if (b.dataset.tbxTool) { runTool(b.dataset.tbxTool, 'toolbox', b); if (b.closest('.tbx-more')) closeMore(null); return; }   // a pick from a group's More list closes the list
    if (peeking && b.dataset.wsCommand && P.ribbon?.ribbon.contains(b)) setTimeout(() => peek(false), 0);   // a command picked from the peeked ribbon
    if (b.dataset.wsCommand) { runTool(b.dataset.wsCommand, b.dataset.wsBlock || 'ribbon', b); return; }
    if (b.dataset.wsDrawing) { goView(b.dataset.wsDrawing); return; }
    if (b.dataset.wsView) { goView(b.dataset.wsView); return; }
    if (b.dataset.wsClose) { closeView(b.dataset.wsClose); return; }
    if (b.dataset.wsReason && !b.dataset.wsCommand) explain(T('shell.ws.tool'), b.dataset.wsReason);
  });
  wireMore();
  // My tools: right-click a tool to add it, drag one onto a slot (the toolbox's own window too: these go through listen())
  for (const type of ['contextmenu', 'dragstart', 'dragover', 'drop']) listen(type, (e) => { if (type === 'contextmenu' && cur && !guest && editOn() && editor.contextmenu(e)) return; if (P.toolbox?.o.mine && P.toolbox.el.contains(e.target)) mine.on[type](e); });
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
  document.addEventListener('dblclick', (e) => { if (cur && P.ribbon && e.target.closest?.('[data-ws-tab]') && P.ribbon.o.collapse && !rpop.isOpen()) setCollapsed(!collapsed); });
  listen('keydown', (e) => {
    const b = e.target;
    if (b.dataset?.wsTab && ['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) {
      const items = [...P.ribbon.tabs.querySelectorAll('[role="tab"]')], i = items.indexOf(b);
      const next = e.key === 'Home' ? items[0] : e.key === 'End' ? items.at(-1) : items[(i + (e.key === 'ArrowRight' ? 1 : items.length - 1)) % items.length];
      e.preventDefault(); tab = next.dataset.wsTab; renderRibbonTabs(); P.ribbon.tabs.querySelector('[aria-selected="true"]').focus();
    }
    if (e.key === 'Enter' && !isTyping(b) && b.dataset?.wsReason && !b.matches('button')) { e.preventDefault(); explain(T('shell.ws.tool'), b.dataset.wsReason); }
  }, true);
  // Tooltips (and the reason a tool is unavailable, data-ws-reason) are drawn by app-tooltips.js, the one Bootstrap tooltip engine; this only restores focus work.
  document.addEventListener('focusout', () => { if (cur) soon(); });
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
      el('span', { className: 'shell-grip-handle' }, blockIcon({ bi: 'bi-grip-vertical', block: 'grip' }), nm));
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

  /** 0.11 UI.5 (lab): Arrange on the classic layout starts from the toolbox built-in (what the WS.25 form started from), then Arrange mode opens on it. */
  function arrangeFromBuiltin() {
    const all = availableLayouts(cfg), base = all.find((x) => x.key === 'toolbox' && x.ok) || all.find((x) => x.ok && x.source === 'builtin');
    if (!base) return false;
    document.querySelector('dialog[data-app-settings][open]')?.close();
    if (window.ccShellWorkspace) window.ccShellWorkspace.set(base.key); else { try { localStorage.setItem('cc-workspace', base.key); } catch (e) { /* this page only */ } decide(true); }
    let n = 0; const t = setInterval(() => { if (cur) { clearInterval(t); editor.arrange(true); } else if (++n > 60) clearInterval(t); }, 150);
    return true;
  }
  // Right-click a tool, and Arrange mode (UI.5, UI.6): both end in a layout of the person's own (app-workspace-edit.js)
  const editor = layoutEditor({ F, T, el, say, root, lab: () => labDock(),
    current: () => (cur ? { key: cur.key, layout: cur.layout } : null),
    builtin: (id) => availableLayouts(cfg).find((x) => x.key === id && x.ok && x.source === 'builtin') || null,
    importText: (text) => api.importText(text),
    use: (key) => { if (window.ccShellWorkspace) window.ccShellWorkspace.set(key); else { try { localStorage.setItem('cc-workspace', key); } catch (e) { /* this page only */ } decide(true); } },
    reload: () => { use(null, true); decide(true); },
    remove: (key) => api.remove(key),
    caps: () => caps(),
    dataFor: (kind) => (kind === 'ribbon' ? ribbonRaw().map((t) => ({ ...t, groups: t.groups.map((g) => ({ ...g, large: g.large.filter((id) => built(id, 'ribbon')), stacks: g.stacks.map((st) => st.filter((id) => built(id, 'ribbon'))).filter((st) => st.length) })) }))
      : (A.toolbox ? A.toolbox() : []).map((g) => ({ ...g, tools: g.tools.filter((id) => built(id, kind)) }))),
    label: (id, block) => (A.tool ? A.tool(id, block === 'toolbox' ? 'toolbox' : block).label : id),
    openMenu: (e, items) => mine.openMenu(e, items),
    commands: () => (window.ccInput?.commands || []).map((c) => ({ id: c.id, label: regTool(c.id).label, built: regTool(c.id).built })).filter((c) => c.built),
    extra: (b) => (b.dataset.tbxTool && P.toolbox?.o.mine ? [[T('shell.ws.mine.add'), () => mine.add('tbx:' + b.dataset.tbxTool)]] : []) });

  // =========================================================== the shell's Settings ===========================================================
  const api = {
    tearable,
    /** 0.10 UI.21 (switch on only; null otherwise): the dock manager of the mounted layout. units(kind) lists the groups that may dock ({ key, label, docked }),
     *  zones() the side zones this page has, dock(key, place) / undock(key) move one, state() what is remembered under cc-ws-dock:<app>:<layout>. */
    get dock() {
      if (!D) return null;
      const H = dockHost();
      return { zones: () => D.zones(), state: () => D.state(), dock: (k, p) => D.dock(k, p), undock: (k) => D.undock(k), collapse: (p, on) => D.collapse(p, on),
        units: (kind) => H.groups(kind).map((g) => ({ key: g.key, label: g.label, docked: D.isDocked(g.key) })), blocks: () => Object.keys(H.blocks),
        // 0.11 (lab; each returns false on /use): Pin, Float, a group's close and its way back, a palette out of its stack
        pin: (k, on = true) => D.pin(k, on), pinned: (k) => D.pinned(k), float: (k, x, y) => D.float(k, x, y), close: (k) => D.close(k), reopen: (k) => D.reopen(k),
        movePalette: (n, to) => D.movePalette(n, to), palMoves: (n) => D.palMoves(n).map((m) => m[2]) };
    },
    /** Settings › Global › Layout › Arrange your own layout… */
    arrange: () => { if (cur && !guest && editOn()) { document.querySelector('dialog[data-app-settings][open]')?.close(); editor.arrange(true); } else if (!guest && labDock() && arrangeFromBuiltin()) return; else arranger.open(); },
    /** The layout editor (UI.5 / UI.6): arrange mode, undo, reset, the edits the right-click menu makes. */
    editor,
    form: () => (!guest && labDock() ? api.arrange() : arranger.open()),   // 0.11 UI.5 (lab): the WS.25 form is retired into Arrange mode
    get layout() { return cur ? cur.key : null; }, has: (b) => !!cur?.blocks.has(b), refresh: soon, decide, view: openView,
    notes: () => (cur ? cur.notes.slice() : []),
    /** BK.126: every tool button the layout made (data-ws-command, data-tbx-tool) and whether the app has a typed command behind it
        (the adapter's tool(id, block).built; a click goes to the adapter's run(id, block), never to code of the layout's own). */
    /** 0.10 BK.33: the app's own control behind a layout's tool button (the adapter's source(id, block)), so its tooltip can say what the command's own button says. */
    sourceOf: (id, block) => (A.source ? A.source(id, block) : null) || null,
    buttons: () => all('[data-ws-command], [data-tbx-tool]').map((b) => { const id = b.dataset.wsCommand || b.dataset.tbxTool, block = b.dataset.tbxTool ? 'toolbox' : b.dataset.wsBlock || 'ribbon';
      return { id, block, built: !!(A.tool && A.tool(id, block).built !== false && typeof A.run === 'function'), label: b.getAttribute('aria-label') || b.textContent.trim() }; }),
    /** BK.35: the layout's ribbon, folded to its tab names or open ({on: a ribbon that can fold is mounted, collapsed}); setRibbon(true) folds it (app-fit.js room()). */
    ribbon: () => ({ on: !!(P.ribbon && P.ribbon.o.collapse), collapsed: !!(P.ribbon && collapsed) }),
    setRibbon: (on) => { if (P.ribbon && P.ribbon.o.collapse && !rpop.isOpen()) setCollapsed(!!on); },
    /** What this app can fill (resolveLayout's caps), read only: tools/workspace-check/harvest.mjs records it for the layout checker (2026-11-10). */
    caps: () => { const c = JSON.parse(JSON.stringify(caps())); delete c.tools; delete c.commands; return c; },   // the shape caps.json keeps: tool and command ids are asked for through toolIds()
    toolIds: () => ({ tools: caps().tools, commands: caps().commands }),
    /** Each region and the blocks in it, in DOM order (the conformance test checks the layout's order). */
    order: () => [top, bottom, ...regions.values()].filter(Boolean).map((r) => ({ region: r === top ? 'top' : r === bottom ? 'bottom' : r.dataset.wsRegion,
      blocks: [...r.children].map((n) => n.dataset.wsBlk || (n.classList.contains('ws-toolbar-strip') ? 'toolbar' : null)).filter(Boolean) })),
    inspect: () => ({ layout: cur?.key || null, blocks: cur ? [...cur.blocks.keys()] : [], notes: cur?.notes || [], phone: phone(), view: openView()?.id || null, notice,
      busy: !!state().busy, waiting,
      // the conformance test compares what the adapter says now with what is on screen: the toolbox's tools, the lit commands
      toolbox: P.toolbox ? { said: toolboxData('toolbox').flatMap((g) => [...g.tools, ...(g.more || [])].filter((id) => built(id, 'toolbox'))), shown: [...P.toolbox.list.querySelectorAll('[data-tbx-tool]')].map((b) => b.dataset.tbxTool) } : null,
      pressed: A.pressed ? [...new Set(all('[data-ws-command]').map((b) => b.dataset.wsCommand + ' ' + (b.dataset.wsBlock || 'ribbon')))].filter((k) => A.pressed(...k.split(' '))) : [] }),
    notice: () => notice,
    /** Every layout this page offers (Settings lists them): [{key, name, hint, source, ok, error, notes}] */
    layouts() {
      return availableLayouts(cfg).map((x) => ({ key: x.key, source: x.source, ok: x.ok, error: x.error || '', name: x.layout ? layoutName(x.layout) : x.key,
        hint: x.layout ? (x.layout.hintKey && HAS(x.layout.hintKey) ? ST(x.layout.hintKey) : x.layout.description || '') : '',
        notes: x.ok ? F.resolveLayout(x.layout, caps()).notes : [] }));
    },
    /** 0.11 FX.309 / FX.304: the interface styles Settings lists, each with what it leaves out in THIS app: [{ key, name, hint, source, ok, error, notes, cannot: [{key, vars?}], builtin }].
     *  `cannot` is cannotOf(notes) (language keys, said by Settings). `lab` is whether the lab-only styles (the ones that need the dock manager) may be offered: editOn(). */
    styles() { return api.layouts().map((l) => ({ ...l, builtin: l.source === 'builtin', cannot: cannotOf(l.notes) })); },
    lab: () => editOn(),
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
    if (window.cadcraftDesktop && window.cadcraftDesktop.popups && typeof window.cadcraftDesktop.popups.restore === 'function') import('./app-windows.js').catch(() => { /* no window service: nothing to restore */ });   // 0.11 UI.4: Studio's popups.restore (app-windows.js); a dynamic import, a static one is circular here; inert outside Studio
    window.ccShellWorkspace?.register?.(api);
  }
  window.addEventListener('cc-workspace', () => decide(true));   // a person's pick (Settings › Global › Layout)
  window.addEventListener('storage', (e) => { if (e.key === FILES_KEY) decide(); });
  if (window.matchMedia) matchMedia(PHONE).addEventListener?.('change', () => decide());
  decide();
  // UI.3 (studio-10): in Studio, each block that was out when this app window last closed goes back to its own window, on the screen the shell remembers (once each)
  if (!guest) setTimeout(async () => {
    try { const titles = await window.cadcraftDesktop?.popups?.restore?.(); if (Array.isArray(titles)) for (const t of titles) windows.openByTitle(String(t)); } catch (e) { /* not Studio, or nothing to restore */ }
  }, 1200);
  if (editOn() && !guest && new URLSearchParams(location.search).get('arrange') === '1') setTimeout(() => { if (cur) editor.arrange(true); }, 900);   // /developers/layouts › Design it in the app
  return api;
}
