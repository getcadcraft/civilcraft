/* SPDX-License-Identifier: Apache-2.0 */
/**
 * app-dock.js — the dock manager (0.10 UI.21, narrowed by the owner 2026-11-15) and the one head (UI.26, folded into UI.21). Pattern:
 * docs/INTERFACE-PATTERN.md § 3, 4, 5. Loaded by app-workspace.js only while html[data-cc-ws-edit="1"] (the owner's switch, off; rule 62): with the switch off
 * this file is never fetched and every layout looks and behaves as before.
 *
 *   a UNIT     one ribbon group, one tool-row group or one toolbox group. Its grip (far left of the group's name) drags it, or opens the dock menu.
 *   a ZONE     a side place: the left panel, the right panel, the drawing's left or right column. Dropped there, the unit becomes a palette: the zone decides
 *              the orientation (a column of tools), several units in one zone are tabs, the palette collapses to its head. "Put it back", the palette's
 *              close, or a drop on its home bar sends it home (a horizontal zone: the ribbon, the tool rows; the toolbox's column).
 *   the HEAD   one head for every block that leaves for a window and for every palette: grip far left (drag = move, click = the dock menu), the name or
 *              the tabs in the middle, collapse, close far right (at 40 % until hovered or focused). It replaces the ribbon's tear-off handle and the
 *              "…" buttons of the toolbox, the tool rows and the status bar; the menu is the one menu of the window service (app-windows.js `openMenu`).
 *
 * Remembered per app and layout under cc-ws-dock:<app>:<layout> = { zones: { <place>: { units: [key], act: key, collapsed } } }; a unit key is
 * `ribbon:<tab>:<group>`, `toolrows:<group>` or `toolbox:<group>`. Docking changes no layout file: the layout stays the built-in or the person's own.
 * The engine asks isDocked(key) when it draws its bars, so a docked group is drawn once, in its palette (the unit keeps its tools: the same buttons,
 * data-ws-command / data-ws-block, run and lit by the engine).
 *
 *   dockManager(H) → { isDocked(key), decorate(kind, el), refresh(), dock(key, place), undock(key), zones(), state(), head(o), destroy() }
 * H = { app, layout() → key, T, el, say, tool(id, block), built(id, block), region(place), host(place), groups(kind) → [{ key, id, label, tools }],
 *       redraw(), menu(btn, label, items) → { close }, blocks: { <kind>: { label, tear, isOpen(), open(), back(), extra() → items } }, hide(kind),
 *       stage, doc }
 */

const ZONES = ['left-panel', 'right-panel', 'stage-left', 'stage-right'];
const STORE = 'cc-ws-dock:';
const word = (T, k, fb, v) => { const s = T(k, v); if (s && s !== k) return s; return v ? fb.replace(/\{(\w+)\}/g, (m, n) => (n in v ? v[n] : m)) : fb; };

export function dockManager(H) {
  const { T, el } = H;
  const W = (k, fb, v) => word(T, k, fb, v);
  const ZONE_NAME = { 'left-panel': W('shell.dock.zone.left-panel', 'Left panel'), 'right-panel': W('shell.dock.zone.right-panel', 'Right panel'),
    'stage-left': W('shell.dock.zone.stage-left', 'Drawing, left column'), 'stage-right': W('shell.dock.zone.stage-right', 'Drawing, right column') };
  const HOME = { ribbon: W('shell.dock.home.ribbon', 'the ribbon'), toolrows: W('shell.dock.home.toolrows', 'the tool rows'), toolbox: W('shell.dock.home.toolbox', 'the toolbox') };
  const key = () => STORE + H.app + ':' + (H.layout() || 'standard');
  let S = read(), palettes = new Map(), overlay = null, drag = null, gone = false;

  // ------------------------------------------------------------------ state
  function read() { try { const o = JSON.parse(localStorage.getItem(key()) || 'null'); return clean(o); } catch (e) { return clean(null); } }
  function clean(o) {
    const z = {};
    for (const p of ZONES) { const q = o?.zones?.[p]; if (!q || !Array.isArray(q.units)) continue; const units = [...new Set(q.units.filter((k) => typeof k === 'string' && /^(ribbon|toolrows|toolbox):/.test(k)))].slice(0, 24); if (units.length) z[p] = { units, act: units.includes(q.act) ? q.act : units[0], collapsed: !!q.collapsed }; }
    return { zones: z };
  }
  function save() { try { if (Object.keys(S.zones).length) localStorage.setItem(key(), JSON.stringify(S)); else localStorage.removeItem(key()); } catch (e) { /* this page only */ } }
  const zoneOf = (k) => ZONES.find((p) => S.zones[p]?.units.includes(k)) || null;
  const isDocked = (k) => !!zoneOf(k);
  const kindOf = (k) => k.split(':')[0];
  const unit = (k) => H.groups(kindOf(k)).find((g) => g.key === k) || null;
  // a panel zone only while the panel shows (a layout may hide the app's own panel: DetailCraft's right one)
  const zonesHere = () => ZONES.filter((p) => (p.endsWith('-panel') ? !!H.host(p)?.getClientRects().length : true));

  function dock(k, place) {
    if (!ZONES.includes(place) || !zonesHere().includes(place) || !unit(k)) return false;
    const from = zoneOf(k);
    if (from) leaveZone(k, from);
    const z = S.zones[place] || (S.zones[place] = { units: [], act: k, collapsed: false });
    z.units.push(k); z.act = k; z.collapsed = false;
    save(); H.redraw(); refresh();
    H.say(W('shell.dock.docked', '{name} docked in {zone}.', { name: unit(k).label, zone: ZONE_NAME[place] }));
    return true;
  }
  function leaveZone(k, place) {
    const z = S.zones[place]; if (!z) return;
    z.units = z.units.filter((x) => x !== k);
    if (!z.units.length) delete S.zones[place]; else if (z.act === k) z.act = z.units[0];
  }
  function undock(k) {
    const from = zoneOf(k); if (!from) return false;
    const u = unit(k); leaveZone(k, from); save(); H.redraw(); refresh();
    H.say(W('shell.dock.back', '{name} is back in {home}.', { name: u?.label || k, home: HOME[kindOf(k)] }));
    return true;
  }

  // ------------------------------------------------------------------ the one head
  const icon = (bi) => (window.ccBlockIcon ? window.ccBlockIcon({ bi, block: 'dock' }) : el('i', { className: 'bi ' + bi, 'aria-hidden': 'true' }));
  /** One head: grip far left (click = menu, drag = move), name or tabs, collapse, close far right. o = { name, items() → [[text, bi, run]], close?: { label, run },
   *  collapse?: { on() → bool, set(on) }, tabs?: [{ key, label, on }], pick(key), drag?(e, grip) }. → the head element. */
  function head(o) {
    const grip = el('button', { type: 'button', className: 'ws-head-grip shell-grip-btn', 'aria-haspopup': 'menu', 'aria-expanded': 'false',
      'aria-label': W('shell.dock.grip', 'Move or dock {name}', { name: o.name }), title: W('shell.dock.grip', 'Move or dock {name}', { name: o.name }) }, icon('bi-grip-vertical'));
    const h = el('div', { className: 'ws-head', role: 'group', 'aria-label': o.name, 'data-ws-head': '' }, grip);
    if (o.tabs && o.tabs.length > 1) {
      const strip = el('div', { className: 'ws-head-tabs shell-grip-tabs', role: 'tablist', 'aria-label': o.name });
      for (const t of o.tabs) {
        const b = el('button', { type: 'button', className: 'shell-grip-tab', role: 'tab', 'aria-selected': t.on ? 'true' : 'false', tabindex: t.on ? 0 : -1, title: t.label, 'data-dock-tab': t.key }, t.label);
        b.addEventListener('click', (e) => { e.stopPropagation(); o.pick(t.key); });
        b.addEventListener('keydown', (e) => { if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return; e.preventDefault(); e.stopPropagation();
          const i = o.tabs.findIndex((x) => x.key === t.key), n = o.tabs.length, to = e.key === 'Home' ? 0 : e.key === 'End' ? n - 1 : (i + (e.key === 'ArrowRight' ? 1 : n - 1)) % n; o.pick(o.tabs[to].key, true); });
        strip.append(b);
      }
      h.append(strip);
    } else h.append(el('span', { className: 'ws-head-name' }, o.name));
    if (o.collapse) {
      const c = el('button', { type: 'button', className: 'ws-head-collapse shell-grip-btn', 'aria-expanded': o.collapse.on() ? 'false' : 'true',
        'aria-label': W('shell.dock.collapse', 'Collapse {name}', { name: o.name }), title: W('shell.dock.collapse', 'Collapse {name}', { name: o.name }) }, icon(o.collapse.on() ? 'bi-chevron-up' : 'bi-chevron-down'));
      c.addEventListener('click', (e) => { e.stopPropagation(); o.collapse.set(!o.collapse.on()); });
      h.append(c);
    }
    if (o.close) {
      const x = el('button', { type: 'button', className: 'ws-head-close shell-grip-btn', 'aria-label': o.close.label, title: o.close.label }, icon('bi-x-lg'));
      x.addEventListener('click', (e) => { e.stopPropagation(); o.close.run(); });
      h.append(x);
    }
    let m = null;
    const openIt = () => { if (m) { m.close(); m = null; return; } m = H.menu(grip, o.name, o.items()); if (m) m.onClose = () => { m = null; }; };
    grip.addEventListener('click', (e) => { e.stopPropagation(); if (grip.dataset.dragged) { delete grip.dataset.dragged; return; } openIt(); });
    grip.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') { e.preventDefault(); e.stopPropagation(); openIt(); } });
    h.addEventListener('contextmenu', (e) => { e.preventDefault(); e.stopPropagation(); openIt(); });
    if (o.drag) grip.addEventListener('pointerdown', (e) => o.drag(e, grip));
    return h;
  }

  // ------------------------------------------------------------------ a block's head (ribbon, toolbox, tool rows, status bar)
  function blockItems(kind) {
    const B = H.blocks[kind]; if (!B) return [];
    const out = B.isOpen() ? [[W('shell.dock.window.back', 'Put it back'), 'bi-box-arrow-in-down-left', () => B.back()]]
      : B.tear ? [[W('shell.dock.window', 'Open in a window'), 'bi-window-plus', () => B.open()]] : [];   // B.open says when the browser refused
    out.push(...B.extra());
    if (!B.isOpen()) out.push([W('shell.dock.hide', 'Hide'), 'bi-eye-slash', () => H.hide(kind)]);
    return out;
  }
  function blockHead(kind) {
    const B = H.blocks[kind];
    return head({ name: B.label, items: () => blockItems(kind),
      close: { label: W('shell.dock.close', 'Close {name}', { name: B.label }), run: () => (B.isOpen() ? B.back() : H.hide(kind)) } });
  }
  /** Called by the engine after it draws a block (or a group list): the block's old handle goes, the one head comes in; each group gets its grip. */
  function decorate(kind, node) {
    if (gone || !node) return;
    if (kind === 'ribbon-tabs') {   // the ribbon's tab strip: grip first, close last (it replaces the ⋯ tear handle)
      node.querySelector(':scope > .ws-tear')?.remove();
      if (!H.blocks.ribbon) return;
      const hd = blockHead('ribbon'); hd.classList.add('ws-head-inline');
      const [grip, ...rest] = hd.children; node.prepend(grip); const close = rest.at(-1); if (close?.classList.contains('ws-head-close')) node.append(close);
      return;
    }
    if (kind === 'toolbox' || kind === 'toolrows' || kind === 'statusbar') {
      node.querySelector(':scope .ws-popout-menu')?.remove();
      if (!H.blocks[kind]) return;
      const old = node.querySelector(':scope > .ws-head'); if (old) old.remove();
      const hd = blockHead(kind);
      if (kind === 'toolbox') { const th = node.querySelector(':scope > .tbx-head'); if (th) { th.hidden = true; th.after(hd); } else node.prepend(hd); }
      else { hd.classList.add('ws-head-inline'); node.prepend(hd.firstChild); const close = hd.querySelector('.ws-head-close'); if (close) node.append(close); }
      return;
    }
    if (kind === 'ribbon' || kind === 'toolrows-rows' || kind === 'toolbox-list') groupGrips(kind === 'ribbon' ? 'ribbon' : kind === 'toolrows-rows' ? 'toolrows' : 'toolbox', node);
  }
  function groupGrips(kind, node) {
    const sel = kind === 'ribbon' ? '.ws-group' : kind === 'toolrows' ? '.tr-group' : '.tbx-group';
    const list = H.groups(kind);
    for (const g of node.querySelectorAll(sel)) {
      if (g.querySelector(':scope [data-dock-grip]')) continue;
      const id = g.dataset.wsGroup || g.dataset.trGroup || g.dataset.tbxGroup;
      const u = list.find((x) => x.id === id && (kind !== 'ribbon' || x.tab === node.dataset.wsTabId)); if (!u) continue;
      const b = el('button', { type: 'button', className: 'ws-group-grip shell-grip-btn', 'data-dock-grip': u.key, 'aria-haspopup': 'menu', 'aria-expanded': 'false',
        'aria-label': W('shell.dock.grip', 'Move or dock {name}', { name: u.label }), title: W('shell.dock.grip', 'Move or dock {name}', { name: u.label }) }, icon('bi-grip-vertical'));
      let m = null;
      const openIt = () => { if (m) { m.close(); m = null; return; } m = H.menu(b, u.label, unitItems(u.key)); if (m) m.onClose = () => { m = null; }; };
      b.addEventListener('click', (e) => { e.stopPropagation(); if (b.dataset.dragged) { delete b.dataset.dragged; return; } openIt(); });
      b.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') { e.preventDefault(); e.stopPropagation(); openIt(); } });
      b.addEventListener('pointerdown', (e) => startDrag(e, b, u.key));
      const at = kind === 'ribbon' ? g.querySelector(':scope > .ws-group-title') : kind === 'toolbox' ? g.querySelector(':scope > summary, :scope > .tbx-group-title') : g;
      (at || g).prepend(b);
    }
  }
  /** The dock menu of a unit: the zones it may go to (the ones this page has), home, and the palette's own entries. */
  function unitItems(k) {
    const z = zoneOf(k), out = [];
    for (const p of zonesHere()) if (p !== z) out.push([W('shell.dock.to', 'Dock to {zone}', { zone: ZONE_NAME[p] }), p.startsWith('left') || p === 'stage-left' ? 'bi-layout-sidebar' : 'bi-layout-sidebar-reverse', () => dock(k, p)]);
    if (z) {
      const c = !!S.zones[z]?.collapsed;
      out.push([c ? W('shell.dock.open', 'Open') : W('shell.dock.collapse.short', 'Collapse'), c ? 'bi-chevron-down' : 'bi-chevron-up', () => collapse(z, !c)]);
      out.push([W('shell.dock.home', 'Put it back in {home}', { home: HOME[kindOf(k)] }), 'bi-box-arrow-in-up-left', () => undock(k)]);
    }
    return out;
  }
  function collapse(place, on) { const z = S.zones[place]; if (!z) return; z.collapsed = !!on; save(); refresh(); }

  // ------------------------------------------------------------------ palettes
  function refresh() {
    if (gone) return;
    for (const [p, n] of [...palettes]) if (!S.zones[p] || !n.isConnected) { n.remove(); palettes.delete(p); }
    for (const p of Object.keys(S.zones)) {
      const z = S.zones[p];
      z.units = z.units.filter((k) => unit(k)); if (!z.units.length) { delete S.zones[p]; continue; }
      if (!z.units.includes(z.act)) z.act = z.units[0];
      const u = unit(z.act), block = kindOf(z.act);
      const tools = u.tools.filter((id) => H.built(id, block)).map((id) => H.tool(id, block));
      const body = el('div', { className: 'ws-dock-body', role: 'toolbar', 'aria-orientation': 'vertical', 'aria-label': u.label, hidden: z.collapsed }, tools);
      const hd = head({ name: u.label, items: () => unitItems(z.act),
        tabs: z.units.map((k) => ({ key: k, label: unit(k).label, on: k === z.act })),
        pick: (k, focus) => { z.act = k; save(); refresh(); if (focus) palettes.get(p)?.querySelector('[aria-selected="true"]')?.focus(); },
        collapse: { on: () => !!z.collapsed, set: (on) => collapse(p, on) },
        close: { label: W('shell.dock.home', 'Put it back in {home}', { home: HOME[block] }), run: () => undock(z.act) },
        drag: (e, g) => startDrag(e, g, z.act) });
      const box = el('section', { className: 'ws-dock-palette' + (z.collapsed ? ' is-collapsed' : ''), 'data-dock-zone': p, 'data-dock-act': z.act, 'aria-label': u.label }, hd, body);
      const old = palettes.get(p);
      if (old) old.replaceWith(box);
      else { const host = H.region(p); if (!host) continue; const grip = host.querySelector(':scope > .shell-grip'); if (grip) grip.after(box); else host.prepend(box); }
      palettes.set(p, box);
    }
    save();
  }

  // ------------------------------------------------------------------ zones as drop targets (dragging a grip, and Arrange mode)
  function zoneRects() {
    const out = [];
    const sr = H.stage.getBoundingClientRect(), rem = parseFloat(getComputedStyle(H.doc.documentElement).fontSize) || 16;
    for (const p of zonesHere()) {
      let r = null;
      if (p.endsWith('-panel')) { const h = H.host(p); const b = h && h.getBoundingClientRect(); if (b && b.width > 4 && b.height > 4) r = b; }
      else { const reg = H.stage.querySelector(':scope > [data-ws-region="' + p + '"]'); const b = reg?.getBoundingClientRect(); const w = Math.max(b?.width || 0, 6 * rem);
        r = { left: p === 'stage-left' ? sr.left : sr.right - w, top: sr.top, width: w, height: sr.height }; }
      if (r) out.push({ place: p, r });
    }
    return out;
  }
  function homeRect(kind) {
    const n = kind === 'ribbon' ? H.doc.querySelector('.ws-ribbon') : kind === 'toolrows' ? H.doc.querySelector('.tr-toolrows') : H.doc.querySelector('.tbx-toolbox');
    const b = n?.getBoundingClientRect(); return b && b.width > 4 && b.height > 4 ? b : null;
  }
  function showZones(on, k = null) {
    if (!on) { overlay?.remove(); overlay = null; return; }
    if (!overlay) { overlay = el('div', { className: 'ws-dock-zones', 'aria-hidden': 'true' }); H.doc.body.append(overlay); }
    const cell = (place, r, label) => { const z = el('div', { className: 'shell-drop-zone ws-dock-zone', 'data-dock-target': place }, label); Object.assign(z.style, { left: r.left + 'px', top: r.top + 'px', width: r.width + 'px', height: r.height + 'px' }); return z; };
    const kids = zoneRects().map(({ place, r }) => cell(place, r, ZONE_NAME[place]));
    // a docked unit's home bar first: the first target under the pointer wins, and the toolbox's home column lies inside the drawing's left zone
    if (k && isDocked(k)) { const r = homeRect(kindOf(k)); if (r) kids.unshift(cell('home', r, W('shell.dock.home', 'Put it back in {home}', { home: HOME[kindOf(k)] }))); }
    overlay.replaceChildren(...kids);
    overlay.classList.toggle('is-passive', !k);
  }
  function startDrag(e, grip, k) {
    if (e.button !== 0) return;
    drag = { k, grip, x: e.clientX, y: e.clientY, on: false, over: null };
    try { grip.setPointerCapture(e.pointerId); } catch (err) { /* a synthetic pointer */ }
    const move = (ev) => {
      if (!drag) return;
      if (!drag.on) { if (Math.hypot(ev.clientX - drag.x, ev.clientY - drag.y) < 5) return; drag.on = true; showZones(true, k); H.doc.body.classList.add('ws-dock-dragging'); }
      let over = null;
      for (const z of overlay?.children || []) { const r = z.getBoundingClientRect(); const hit = ev.clientX >= r.left && ev.clientX <= r.right && ev.clientY >= r.top && ev.clientY <= r.bottom; z.classList.toggle('is-hot', hit && !over); if (hit && !over) over = z.dataset.dockTarget; }
      drag.over = over;
    };
    const up = () => {
      grip.removeEventListener('pointermove', move); grip.removeEventListener('pointerup', up); grip.removeEventListener('pointercancel', up);
      const d = drag; drag = null; H.doc.body.classList.remove('ws-dock-dragging');
      if (!d?.on) return;
      grip.dataset.dragged = '1'; setTimeout(() => { delete grip.dataset.dragged; }, 0);
      showZones(arranging(), null);
      if (d.over === 'home') undock(d.k); else if (d.over) dock(d.k, d.over);
    };
    grip.addEventListener('pointermove', move); grip.addEventListener('pointerup', up); grip.addEventListener('pointercancel', up);
  }
  // Arrange mode (app-workspace-edit.js) shows the zones as drop targets while it is on
  const arranging = () => H.doc.body.classList.contains('ws-arranging');
  const bodyObs = new MutationObserver(() => { if (!drag) showZones(arranging(), null); });
  bodyObs.observe(H.doc.body, { attributes: true, attributeFilter: ['class'] });
  const onResize = () => { if (overlay && !drag) showZones(arranging(), null); };
  H.doc.defaultView.addEventListener('resize', onResize);

  function destroy() {
    gone = true; bodyObs.disconnect(); H.doc.defaultView.removeEventListener('resize', onResize); showZones(false);
    for (const n of palettes.values()) n.remove(); palettes.clear();
  }
  return { isDocked, decorate, refresh, dock, undock, collapse, head, destroy, zones: zonesHere, state: () => JSON.parse(JSON.stringify(S)), reload: () => { S = read(); refresh(); } };
}
