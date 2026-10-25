/* SPDX-License-Identifier: Apache-2.0 */
/**
 * app-workspace-input.js — a workspace adapter built from what every app already has: its input registry (menus, keys and mouse,
 * Track IP; window.ccInput from app-input-ui.js) and its toolbar (0.7 WS.6; map docs/apps/app-workspace.md). The starting point of
 * every app's own adapter (workspace-<slug>.js, sessions ws-<app>): it fills the ribbon, the toolbox, the title bar's and File menu's
 * actions and the app's toolbar block; the app adds what only it knows (slots, palettes, views, its state) on top:
 *
 *   const base = await fromInput({ app, root, stage, panels, status });
 *   mountWorkspaces({ ...base, slots: {…}, palettes: {…}, views: {…}, state: () => ({ …base.state(), document: … }) });
 *
 *   ribbon   the first ribbon style in the registry (STYLES[STYLE_ORDER…] with layout 'ribbon'; RIBBON-COMPACT sizes: lg large,
 *            sm three to a stack; a split shows its first tool; an inline control is not drawn here)
 *   toolbox  the toolbar's own groups ([role=group], named by their visible name — a [class$="-tool-label"] inside the group, the
 *            words the toolbar shows — else by aria-label), each button matched to the command that clicks it
 *   tool     a command's label (the registry's text key, translated) and icon (a Bootstrap Icons class)
 *   can      the command's own button: missing = not built here; else the registry's own answer (window.ccInput.why(id): the app's
 *            hooks().why first, so a button the registry runs although it is hidden — [data-input-only], a closed tab's, another
 *            workspace's — is not greyed); without it, disabled, aria-disabled or hidden = greyed with its title
 *   run      window.ccInput.run(id): the same path as every menu style (the app's own button is clicked)
 *   actions  open / save / undo / redo / select / clear / fit when the registry has a command of that id, or the one `map` names
 *            (fromInput({ …, map: { open: 'file-open', fit: 'zoom-extents' } }))
 */
import { panelLayout } from './app-input.js';
import { ACTIONS } from './app-workspace-format.js';

const T = (k, v) => (window.ccShellT ? window.ccShellT(k, v) : k);
const tx = (k) => (k && window.ccShellT?.has?.(k) ? T(k) : String(k || ''));

/** Resolves once window.ccInput exists (app-input-ui.js boots asynchronously); null when the app has no registry (10 s). */
export function inputReady(ms = 10000) {
  if (window.ccInput) return Promise.resolve(window.ccInput);
  return new Promise((res) => {
    const done = () => { clearTimeout(t); window.removeEventListener('cc-input-ready', done); res(window.ccInput || null); };
    const t = setTimeout(done, ms);
    window.addEventListener('cc-input-ready', done);
  });
}

export async function fromInput({ app, root, stage, panels = {}, status = null, say = null, map = {} } = {}) {
  const I = await inputReady();
  if (!I) return null;
  const byId = new Map(I.commands.map((c) => [c.id, c]));
  const cid = (id) => (Object.prototype.hasOwnProperty.call(map, id) ? map[id] : id);   // a well-known action → this registry's command
  const target = (c) => (c && c.sel ? root.querySelector(c.sel) || document.querySelector(c.sel) : null);
  const style = Object.values(I.styles).find((p) => p && p.layout === 'ribbon') || null;
  const label = (id) => tx((style?.labels && style.labels[id]) || byId.get(id)?.label || id);
  const ribbon = () => (style?.tabs || []).map((tab, ti) => ({
    tab: 't' + ti, label: tx(tab.label),
    groups: (tab.panels || []).map((pn, pi) => {
      const large = [], stacks = []; let stack = null;
      for (const it of panelLayout(pn)) {
        const id = it.kind === 'cmd' ? it.id : it.kind === 'split' ? it.ids[0] : null;
        if (!id || !byId.has(id)) continue;
        if (it.size === 'sm') { if (!stack || stack.length === 3) { stack = []; stacks.push(stack); } stack.push(id); }
        else { large.push(id); stack = null; }
      }
      return { id: 'g' + ti + '-' + pi, label: tx(pn.label), large, stacks };
    }).filter((g) => g.large.length || g.stacks.length),
  })).filter((t) => t.groups.length);
  const toolbarEl = () => [...root.children].find((n) => n.getAttribute('role') === 'toolbar') || root.querySelector('[role="toolbar"]');
  const toolbox = () => {
    const tb = toolbarEl(); if (!tb) return [];
    const owner = new Map(); for (const c of I.commands) { const b = target(c); if (b && !owner.has(b)) owner.set(b, c.id); }
    // the group's visible name first: aria-label may be the arrangement key (Settings › Arrange the toolbar keys on it), not words
    const name = (g) => g.querySelector('[class$="-tool-label"]')?.textContent.trim() || g.getAttribute('aria-label') || '';
    return [...tb.querySelectorAll('[role="group"]')].map((g, i) => ({ id: 'tb' + i, label: name(g),
      tools: [...g.querySelectorAll('button')].map((b) => owner.get(b)).filter(Boolean) })).filter((g) => g.tools.length);
  };
  return {
    app, root, stage, panels, status, t: T, say: say || ((text, bad) => window.ccShellScreen?.say?.(text, bad)),
    actions: ACTIONS.filter((a) => byId.has(cid(a))),
    hide: [], toolbar: toolbarEl,
    ribbon: style ? ribbon : null, toolbox,
    tool(id) { const c = byId.get(cid(id)); return { label: label(cid(id)), icon: c?.icon || 'bi-dot', built: !!target(c) }; },
    can(id) {
      const c = byId.get(cid(id)), b = target(c);
      if (!b) return { enabled: false, reason: T('shell.ws.why.notbuilt', { app: document.querySelector('[data-app-settings]')?.dataset.appName || app }) };
      if (I.why) { const w = I.why(cid(id)); return { enabled: !w, reason: w }; }   // the same answer every menu style gets
      if (b.disabled || b.getAttribute('aria-disabled') === 'true' || (b.closest('[hidden]') && !b.closest('details'))) return { enabled: false, reason: b.getAttribute('title') || T('shell.input.why.off') };
      return { enabled: true, reason: '' };
    },
    run: (id) => I.run(cid(id)),
    pressed: (id) => target(byId.get(cid(id)))?.getAttribute('aria-pressed') === 'true',
    state: () => ({ document: true, name: document.title.split(' | ')[0], dirty: false, busy: false, selection: [], tool: 'select' }),
  };
}
